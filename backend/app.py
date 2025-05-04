from flask import Flask, request, render_template, redirect, url_for, session, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from psycopg2 import errors
import psycopg2.extras
from bd_car import conn, cursor
from apscheduler.schedulers.background import BackgroundScheduler
from mailjet_rest import Client as MailjetClient
from twilio.rest import Client as TwilioClient
from dotenv import load_dotenv
import os
from datetime import datetime, timedelta
from flask_cors import CORS
import random
import string
from werkzeug.utils import secure_filename


load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), 'app.env'))

app = Flask(__name__)
CORS(app)
app.secret_key = '12345'

app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg', 'gif'}
cursor = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)

MAILJET_API_KEY = os.getenv('MAILJET_API_KEY')
MAILJET_API_SECRET = os.getenv('MAILJET_API_SECRET')
FROM_EMAIL = os.getenv('FROM_EMAIL')

TWILIO_ACCOUNT_SID = os.getenv('TWILIO_ACCOUNT_SID')
TWILIO_AUTH_TOKEN = os.getenv('TWILIO_AUTH_TOKEN')
TWILIO_PHONE_NUMBER = os.getenv('TWILIO_PHONE_NUMBER')


# отправка кода по емайлу
def send_verification_email(to_email, code):
    mailjet = MailjetClient(auth=(MAILJET_API_KEY, MAILJET_API_SECRET), version='v3.1')
    data = {
        'Messages': [
            {
                "From": {
                    "Email": FROM_EMAIL,
                    "Name": "Поддержка"
                },
                "To": [
                    {
                        "Email": to_email,
                        "Name": "Пользователь"
                    }
                ],
                "Subject": "Код подтверждения",
                "TextPart": f"Ваш код подтверждения: {code}",
            }
        ]
    }
    result = mailjet.send.create(data=data)
    return result.status_code in [200, 201]

# отправка кода по смс
def send_verification_sms(to_phone, code):
    client = TwilioClient(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
    try:
        message = client.messages.create(
            body=f"Ваш код подтверждения: {code}",
            from_=TWILIO_PHONE_NUMBER,
            to=to_phone  
        )
        return message.status == 'queued' or message.status == 'sent'
    except Exception as e:
        print(f"Ошибка при отправке SMS: {e}")
        return False

# генерация кода для потверждение
def generate_code(length=6):
    return ''.join(random.choices(string.digits, k=length))

# удаление старых кодов
def delete_expired_codes():
    cursor.execute("""
        DELETE FROM verification_codes 
        WHERE expires_at < %s
    """, (datetime.now(),))
    conn.commit()

scheduler = BackgroundScheduler()
scheduler.add_job(delete_expired_codes, 'interval', minutes=1)
scheduler.start()


# регистрация
@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json()
    contact = data.get("contact")
    password = data.get("password")

    if not contact or not password:
        return jsonify({"success": False, "message": "Нет данных"}), 400

    is_email = "@" in contact
    email = contact if is_email else None
    phone = contact if not is_email else None

    verification_code = ''.join(random.choices(string.digits, k=6))
    expires_at = datetime.now() + timedelta(minutes=5)

    try:
        cursor.execute(
            "SELECT id, is_verified FROM clients WHERE phone = %s OR email = %s",
            (phone, email)
        )
        existing = cursor.fetchone()

        if existing:
            client_id, is_verified = existing
            if is_verified:
                return jsonify({"success": False, "message": "Пользователь уже существует"}), 409
            else:
                cursor.execute("DELETE FROM verification_codes WHERE client_id = %s", (client_id,))
                cursor.execute("DELETE FROM clients WHERE id = %s", (client_id,))
                conn.commit()

        cursor.execute(
            "INSERT INTO clients (phone, email, is_verified) VALUES (%s, %s, FALSE) RETURNING id",
            (phone, email)
        )
        client_id = cursor.fetchone()[0]

        cursor.execute(
            "INSERT INTO verification_codes (client_id, code, expires_at) VALUES (%s, %s, %s)",
            (client_id, verification_code, expires_at)
        )
        conn.commit()

        if is_email:
            send_verification_email(email, verification_code)
        elif phone:
            send_verification_sms(phone, verification_code)

        return jsonify({"success": True})
    except errors.UniqueViolation:
        conn.rollback()
        return jsonify({"success": False, "message": "Пользователь уже существует"}), 409
    except Exception as e:
        conn.rollback()
        print(f"[register] Ошибка: {e}")
        return jsonify({"success": False, "message": "Ошибка при регистрации"}), 500

# авторизация
@app.route("/api/login", methods=["POST"])
def api_login():
    try:
        data = request.get_json()
        contact = data.get('contact')
        password = data.get('password')

        if not contact or not password:
            return jsonify({'success': False, 'message': 'Неверные данные'}), 400

        with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
            cursor.execute("""
                SELECT id, password, is_verified 
                FROM clients 
                WHERE email = %s OR phone = %s
                LIMIT 1
            """, (contact, contact))
            
            result = cursor.fetchone()

            if not result:
                return jsonify({'success': False, 'message': 'Пользователь не найден'}), 404

            if not result['is_verified']:
                return jsonify({'success': False, 'message': 'Аккаунт не верифицирован'}), 403

            if check_password_hash(result['password'], password):
                session['client_id'] = result['id']
                return jsonify({'success': True, 'client_id': result['id']})
            
            return jsonify({'success': False, 'message': 'Неверный пароль'}), 401

    except Exception as e:
        return jsonify({'success': False, 'message': 'Ошибка сервера'}), 500

# верификация
@app.route("/api/verify-code", methods=["POST"])
def verify_code():
    data = request.get_json()
    code = data.get("code")
    phone = data.get("phone")
    email = data.get("email")
    
    if not code or not (phone or email):
        return jsonify({"success": False, "error": "Не хватает данных"}), 400
    
    try:
        query = """
            SELECT c.id, v.expires_at FROM clients c
            JOIN verification_codes v ON c.id = v.client_id
            WHERE v.code = %s AND (%s IS NULL OR c.phone = %s) AND (%s IS NULL OR c.email = %s)
        """
        cursor.execute(query, (code, phone, phone, email, email))
        result = cursor.fetchone()
        
        if not result:
            return jsonify({"success": False, "error": "Код неверен"}), 400
        
        client_id, expires_at = result
        
        if expires_at < datetime.now():
            cursor.execute("DELETE FROM verification_codes WHERE client_id = %s", (client_id,))
            cursor.execute("DELETE FROM clients WHERE id = %s", (client_id,))
            conn.commit()
            return jsonify({"success": False, "error": "Код истёк"}), 400
        
        cursor.execute("UPDATE clients SET is_verified = TRUE WHERE id = %s", (client_id,))
        conn.commit()
        cursor.execute("DELETE FROM verification_codes WHERE client_id = %s", (client_id,))
        conn.commit()
        
        return jsonify({"success": True, "client_id": client_id})
    
    except Exception as e:
        print(f"[verify_code] Ошибка: {e}")
        conn.rollback()
        return jsonify({"success": False, "error": "Ошибка на сервере"}), 500

# отправка кода
@app.route("/api/send-code", methods=["POST"])
def send_code():
    data = request.get_json()
    email = data.get("email")
    phone = data.get("phone")

    cursor.execute("SELECT id FROM clients WHERE email = %s", (email,))
    client = cursor.fetchone()
    
    cursor.execute("SELECT id FROM clients WHERE phone = %s", (phone,))
    phone_client = cursor.fetchone()
    
    if not phone_client :
        return jsonify({"success": False, "error": "Клиент не найден"}), 404

    if not client :
        return jsonify({"success": False, "error": "Клиент не найден"}), 404

    client_id = client[0]
    code = generate_code()
    expires_at = datetime.now() + timedelta(minutes=10)
    
    cursor.execute(
        "INSERT INTO verification_codes (code, client_id, expires_at) VALUES (%s, %s, %s)",
        (code, client_id, expires_at)
    )
    conn.commit()


    if send_verification_email(email, code):
        return jsonify({"success": True, "message": "Код отправлен только на почту"})
    elif send_verification_sms(phone, code):
        return jsonify({"success": True, "message": "Код отправлен только по SMS"})
    else:
        return jsonify({"success": False, "error": "Не удалось отправить код"}), 500
    
# сохранение юзера
@app.route("/api/save-user", methods=["POST"])
def save_user():
    data = request.get_json()
    contact = data.get("contact")
    firstName = data.get("firstName")
    lastName = data.get("lastName")
    password = data.get("password")
    contact_type = data.get("type")

    if not contact or not password or not contact_type:
        return jsonify({"success": False, "error": "Недостаточно данных"}), 400

    phone = contact if contact_type == "phone" else None
    email = contact if contact_type == "email" else None

    password_hash = generate_password_hash(password)

    try:
        cursor.execute('''UPDATE clients SET first_name = %s, last_name = %s, password = %s 
                       WHERE phone = %s or email = %s''' , (firstName, lastName, password_hash, phone, email))
        conn.commit()   
        return jsonify({"success": True})
    except Exception as e:
        conn.rollback()
        return jsonify({"success": False, "error": "Ошибка при сохранении"}), 500

# вывод автомоек
@app.route('/api/wash_boxes', methods=['GET'])
def get_wash_boxes():
    try:
        cursor.execute('''
            SELECT 
                wb.id,
                wb.name,
                wb.location AS address,
                wb.image_url AS image,
                COALESCE(
                    jsonb_agg(
                        jsonb_build_object(
                            'id', s.id,
                            'name', s.name,
                            'description', s.description,
                            'price', s.price,
                            'duration_minutes', s.duration_minutes
                        ) 
                        ORDER BY s.price
                    ) FILTER (WHERE s.id IS NOT NULL),
                    '[]'::jsonb
                ) AS services
            FROM wash_boxes wb
            LEFT JOIN services s ON wb.id = s.wash_box_id
            GROUP BY wb.id
            ORDER BY wb.name;
        ''')
        
        result = cursor.fetchall()
        boxes = []
        
        for row in result:
            box = {
                'id': row[0],
                'name': row[1],
                'address': row[2],
                'image': row[3],
                'services': []
            }
            
            if row[4]:
                for service in row[4]:
                    service['price'] = float(service['price'])
                    service['duration_minutes'] = int(service['duration_minutes'])
                    box['services'].append(service)
            
            boxes.append(box)
        
        return jsonify(boxes)
            
    except Exception as e:
        return jsonify({"error": "Ошибка сервера"}), 500
        
    finally:
        if 'conn' in locals():
            conn.close()

@app.route("/api/book", methods=["POST"])
def create_booking():
    data = request.get_json()
    
    car_type = data.get("carType")
    date = data.get("date")
    time = data.get("time")
    selected_services = data.get("selectedServices", [])
    box_id = data.get("boxId")
    client_id = data.get("clientId")
    
    name = data.get("name")
    phone = data.get("phone")
    email = data.get("email")
    comments = data.get("comments", "")
    
    if not all([car_type, date, time, box_id]):
        return jsonify({"error": "Недостаточно данных для бронирования"}), 400
    
    if len(selected_services) == 0:
        return jsonify({"error": "Выберите хотя бы одну услугу"}), 400
    
    try:
        if not client_id:
            cursor.execute(
                """
                INSERT INTO clients (name, phone, email)
                VALUES (%s, %s, %s) RETURNING id
                """,
                (name, phone, email)
            )
            client_id = cursor.fetchone()[0]
        
        if selected_services:
            placeholders = ','.join(['%s'] * len(selected_services))
            cursor.execute(
                f"SELECT id, name, duration_minutes FROM services WHERE name IN ({placeholders})",
                selected_services
            )
            service_rows = cursor.fetchall()
            
            total_minutes = sum(row[2] for row in service_rows)
        else:
            return jsonify({"error": "Выберите хотя бы одну услугу"}), 400
        
        try:
            start_time = datetime.strptime(f"{date} {time}", "%Y-%m-%d %H:%M")
        except ValueError:
            return jsonify({"error": "Неверный формат даты или времени"}), 400
            
        end_time = start_time + timedelta(minutes=total_minutes)
        
        weekday = start_time.weekday()
        print(box_id, weekday, start_time.time(), end_time.time())
        
        cursor.execute(""" 
            SELECT max_slots FROM box_availability 
            WHERE wash_box_id = %s AND weekday = %s 
            AND work_start <= %s AND work_end >= %s
        """, (box_id, weekday, start_time.time(), end_time.time()))

        row = cursor.fetchone()

        if not row:
            return jsonify({"error": "В это время автомойка не работает"}), 400

        max_slots = row[0]

        cursor.execute("""
            SELECT COUNT(*) FROM bookings
            WHERE box_id = %s AND status != 'отменено'
            AND start_time < %s AND end_time > %s
        """, (box_id, end_time, start_time))
        
        current_bookings = cursor.fetchone()[0]

        if current_bookings >= max_slots:
            return jsonify({"error": "На это время нет доступных слотов. Выберите другое время."}), 409
        
        cursor.execute(
            """
            INSERT INTO bookings (client_id, box_id, start_time, end_time, total_minutes, status, type_car, comments_client)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s) RETURNING id
            """,
            (client_id, box_id, start_time, end_time, total_minutes, 'забронировано', car_type, comments)
        )
        booking_id = cursor.fetchone()[0]
        
        for service_id, _, _ in service_rows:
            cursor.execute(
                "INSERT INTO booking_services (booking_id, service_id) VALUES (%s, %s)",
                (booking_id, service_id)
            )
        
        conn.commit()
        
        return jsonify({
            "message": "Бронирование успешно создано",
            "booking_id": booking_id,
            "start_time": start_time.strftime("%Y-%m-%d %H:%M"),
            "end_time": end_time.strftime("%Y-%m-%d %H:%M"),
            "total_duration": total_minutes
        }), 201
        
    except Exception as e:
        conn.rollback()
        print(f"Error creating booking: {str(e)}")
        return jsonify({"error": "Произошла ошибка при создании бронирования. Пожалуйста, попробуйте снова."}), 500

@app.route("/api/available-slots", methods=["GET"])
def get_available_slots():
    try:
        box_id = request.args.get('box_id', type=int)

        if not box_id:
            return jsonify({"error": "box_id обязателен"}), 400
        
        start_date = datetime.now().date()
        end_date = start_date + timedelta(days=30)

        cursor.execute("""
            SELECT wash_box_id, weekday, work_start, work_end, max_slots 
            FROM box_availability 
            WHERE wash_box_id = %s
        """, (box_id,))
        availability_data = cursor.fetchall()

        if not availability_data:
            return jsonify({"error": f"Нет данных для автомойки с ID {box_id}"}), 404

        schedule = {
            (row[0], row[1]): {
                'work_start': row[2],
                'work_end': row[3],
                'max_slots': row[4]
            } for row in availability_data
        }

        slot_duration = 30
        available_slots = []

        current_date = start_date
        while current_date <= end_date:
            weekday = current_date.weekday()
            date_str = current_date.strftime("%Y-%m-%d")
            
            slots_for_date = {}
            date_has_slots = False

            for (wash_box_id, wd), data in schedule.items():
                if wash_box_id != box_id or wd != weekday:
                    continue

                current_datetime = datetime.combine(current_date, data['work_start'])
                end_datetime = datetime.combine(current_date, data['work_end'])

                now = datetime.now()

                while current_datetime + timedelta(minutes=slot_duration) <= end_datetime:
                    slot_end = current_datetime + timedelta(minutes=slot_duration)
                    
                    if current_date == now.date() and current_datetime < now:
                        current_datetime += timedelta(minutes=slot_duration)
                        continue

                    cursor.execute("""
                        SELECT COUNT(*) 
                        FROM bookings
                        WHERE box_id = %s 
                        AND status != 'отменено'
                        AND start_time < %s AND end_time > %s
                    """, (wash_box_id, slot_end, current_datetime))
                    booked_slots = cursor.fetchone()[0]
                    max_slots = data['max_slots']

                    time_str = current_datetime.strftime("%H:%M")
                    if booked_slots < max_slots:
                        slots_for_date[time_str] = {
                            "bookedSlots": booked_slots,
                            "maxSlots": max_slots
                        }
                        date_has_slots = True

                    current_datetime += timedelta(minutes=slot_duration)
            
            if date_has_slots:
                sorted_slots = sorted(slots_for_date.keys(), 
                                     key=lambda x: tuple(map(int, x.split(':'))))
                                     
                available_slots.append({
                    "boxId": box_id,
                    "date": date_str,
                    "slots": sorted_slots,
                    "slotInfo": slots_for_date
                })

            current_date += timedelta(days=1)

        return jsonify(available_slots), 200

    except Exception as e:
        print(f"Error getting available slots: {str(e)}")
        return jsonify({"error": "Не удалось получить доступные слоты"}), 500
    

@app.route("/api/services", methods=["GET"])
def get_services():
    try:
        cursor.execute("SELECT id, name, price, duration_minutes FROM services")
        services = cursor.fetchall()
        
        result = []
        for service in services:
            result.append({
                "id": service[0],
                "name": service[1],
                "price": service[2],
                "duration_minutes": service[3]
            })
        
        return jsonify({"services": result}), 200
        
    except Exception as e:
        print(f"Error fetching services: {str(e)}")
        return jsonify({"error": "Не удалось получить список услуг"}), 500
    
@app.route("/api/user-info", methods=["GET"])
def get_user_info():
    client_id = request.args.get("client_id")
    if not client_id:
        return jsonify({"success": False, "error": "client_id не указан"}), 400

    try:
        with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
            cursor.execute(
                """
                SELECT 
                    id, 
                    first_name, 
                    last_name, 
                    phone, 
                    email, 
                    status,
                    COALESCE(photo_url, 'src/assets/fotoprofila.jpg') AS photo_url
                FROM clients
                WHERE id = %s
                """,
                (client_id,)
            )
            
            user = cursor.fetchone()
            
            if not user:
                return jsonify({"success": False, "error": "Пользователь не найден"}), 404

            photo_url = f"/{user['photo_url'].lstrip('/')}" if user['photo_url'] else "/src/assets/fotoprofila.jpg"
            
            user_data = {
                "id": user['id'],
                "first_name": user['first_name'],
                "last_name": user['last_name'],
                "phone": user['phone'],
                "email": user['email'],
                "status": user['status'],
                "photo_url": photo_url
            }
            
            return jsonify({"success": True, "user": user_data})
            
    except Exception as e:
        print(f"Ошибка при получении данных пользователя: {e}")
        return jsonify({"success": False, "error": "Ошибка сервера"}), 500

#  обновление информации о пользователе
@app.route("/api/update-user", methods=["PUT"])
def update_user_info():
    try:
        data = request.get_json()
        user_id = data.get("client_id")
        first_name = data.get("first_name")
        last_name = data.get("last_name")
        phone = data.get("phone")
        email = data.get("email")
        print(data)

        cursor.execute(
            """
            UPDATE clients
            SET first_name = %s, last_name = %s, phone = %s, email = %s
            WHERE id = %s
            """,
            (first_name, last_name, phone, email, user_id)
        )
        conn.commit()

        return jsonify({"success": True, "message": "Информация обновлена"})
    except Exception as e:
        conn.rollback()
        print(f"Ошибка при обновлении информации о пользователе: {e}")
        return jsonify({"success": False, "error": "Ошибка сервера"}), 500

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

# загрузка аватара
@app.route("/api/upload-photo", methods=["POST"])
def upload_photo():
    if 'file' not in request.files:
        return jsonify({"success": False, "error": "Файл не найден"}), 400

    file = request.files['file']
    print(f"Файл получен: {file}")
    print(f"Тип файла: {file.content_type}")
    
    user_id = request.form.get("user_id")
    print(f"user_id: {user_id}")
    if not user_id:
        return jsonify({"success": False, "error": "ID пользователя не указан"}), 400

    if file.filename == '':
        return jsonify({"success": False, "error": "Файл не выбран"}), 400

    if file and allowed_file(file.filename):
        try:
            filename = secure_filename(file.filename)
            upload_folder = r'public\images'
            os.makedirs(upload_folder, exist_ok=True)
            file_path = os.path.join(upload_folder, filename)
            print(f"Сохраняем файл в: {file_path}")
            file.save(file_path)
            print("Файл успешно сохранён")

            relative_path = f"images/{filename}"
            print(f"Обновляем путь в базе данных: {relative_path} для пользователя с ID {user_id}")
            cursor.execute(
                "UPDATE clients SET photo_url = %s WHERE id = %s",
                (relative_path, user_id)
            )
            conn.commit()
            print("Путь к фото успешно обновлён в базе данных")
            return jsonify({"success": True, "message": "Фото обновлено", "photo_url": relative_path})
        except Exception as e:
            conn.rollback()
            print(f"Ошибка при сохранении файла или обновлении базы данных: {e}")
            return jsonify({"success": False, "error": "Ошибка при сохранении файла"}), 500
    else:
        print(f"Недопустимый формат файла: {file.filename}")
        return jsonify({"success": False, "error": "Недопустимый формат файла"}), 400

@app.route("/api/create-business-account", methods=["POST"])
def create_business_account():
    try:
        # Получение данных из запроса
        client_id = request.form.get("client_id")
        if not client_id or not client_id.isdigit():
            return jsonify({"success": False, "error": "Неверный client_id"}), 400
        client_id = int(client_id)

        # Проверка наличия файлов
        if 'registrationCertificate' not in request.files or \
           'ownershipProof' not in request.files or \
           'car_wash_logo' not in request.files:
            return jsonify({"success": False, "error": "Не все файлы загружены"}), 400

        # Получение остальных данных
        car_wash_name = request.form.get("carWashName")
        address = request.form.get("address")
        city_district = request.form.get("cityDistrict")
        working_hours = request.form.get("workingHours")

        if not all([car_wash_name, address, city_district, working_hours]):
            return jsonify({"success": False, "error": "Не все поля заполнены"}), 400

        # Папка для загрузки файлов
        upload_folder = r'public\business account information'
        os.makedirs(upload_folder, exist_ok=True)

        # Сохранение файлов
        registration_certificate_file = request.files['registrationCertificate']
        registration_certificate_path = os.path.join(upload_folder, secure_filename(registration_certificate_file.filename))
        registration_certificate_file.save(registration_certificate_path)

        ownership_proof_file = request.files['ownershipProof']
        ownership_proof_path = os.path.join(upload_folder, secure_filename(ownership_proof_file.filename))
        ownership_proof_file.save(ownership_proof_path)

        car_wash_logo_file = request.files['car_wash_logo']
        car_wash_logo_path = os.path.join(upload_folder, secure_filename(car_wash_logo_file.filename))
        car_wash_logo_file.save(car_wash_logo_path)

        print(f"Файлы успешно сохранены: {registration_certificate_path}, {ownership_proof_path}, {car_wash_logo_path}")

        # Вставка данных в базу
        # Проверка, есть ли отклонённая заявка у клиента
        cursor.execute(
            "SELECT id FROM business_accounts WHERE client_id = %s AND status = 'Отклонен'",
            (client_id,)
        )
        existing_account = cursor.fetchone()

        if existing_account:
            # Обновление существующей отклонённой заявки
            cursor.execute(
                """
                UPDATE business_accounts
                SET
                    registration_certificate = %s,
                    car_wash_name = %s,
                    address = %s,
                    city_district = %s,
                    working_hours = %s,
                    ownership_proof = %s,
                    car_wash_logo = %s,
                    status = 'На рассмотрении',
                    verified = FALSE,
                    created_at = CURRENT_TIMESTAMP
                WHERE id = %s
                """,
                (
                    f"business account information/{secure_filename(registration_certificate_file.filename)}",
                    car_wash_name,
                    address,
                    city_district,
                    working_hours,
                    f"business account information/{secure_filename(ownership_proof_file.filename)}",
                    f"business account information/{secure_filename(car_wash_logo_file.filename)}",
                    existing_account[0]
                )
            )
            conn.commit()
            return jsonify({"success": True, "message": "Заявка обновлена после отклонения"})

        else:
            # Вставка новой заявки
            cursor.execute(
                """
                INSERT INTO business_accounts (
                    client_id,
                    registration_certificate,
                    car_wash_name,
                    address,
                    city_district,
                    working_hours,
                    ownership_proof,
                    car_wash_logo
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """,
                (
                    client_id,
                    f"business account information/{secure_filename(registration_certificate_file.filename)}",
                    car_wash_name,
                    address,
                    city_district,
                    working_hours,
                    f"business account information/{secure_filename(ownership_proof_file.filename)}",
                    f"business account information/{secure_filename(car_wash_logo_file.filename)}"
                )
            )
            conn.commit()
            return jsonify({"success": True, "message": "Бизнес-аккаунт успешно создан"})

    except Exception as e:
        # Обработка ошибок
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/business-requests", methods=["GET"])
def get_business_requests():
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
            cursor.execute("""
                SELECT 
                    ba.id AS request_id,
                    c.first_name || ' ' || c.last_name AS client_name,
                    COALESCE(c.phone, c.email) AS contact_info,
                    ba.car_wash_name,
                    ba.address,
                    ba.city_district,
                    ba.working_hours,
                    ba.registration_certificate,
                    ba.ownership_proof,
                    ba.car_wash_logo,
                    ba.created_at,
                    ba.verified,
                    ba.status
                FROM business_accounts ba
                LEFT JOIN clients c ON ba.client_id = c.id
                WHERE ba.verified = FALSE
                ORDER BY ba.created_at DESC
            """)
            requests = cursor.fetchall()

            result = [
                {
                    "request_id": row[0],
                    "client_name": row[1],
                    "contact_info": row[2],
                    "car_wash_name": row[3],
                    "address": row[4],
                    "city_district": row[5],
                    "working_hours": row[6],
                    "registration_certificate": row[7],
                    "ownership_proof": row[8],
                    "car_wash_logo": row[9],
                    "created_at": row[10],
                    "verified": row[11],
                    "status": row[12]
                }
                for row in requests
            ]

            return jsonify({"success": True, "data": result}), 200
    except Exception as e:
        print(f"Ошибка при получении заявок на бизнес-аккаунты: {e}")
        return jsonify({"success": False, "error": "Ошибка сервера"}), 500

@app.route("/api/update-request-status/<int:request_id>", methods=["POST"])
def update_request_status(request_id):
    data = request.get_json()
    status = data.get("status")

    if status not in ["Принят", "Отклонен"]:
        return jsonify({"success": False, "error": "Неверный статус"}), 400

    try:
        cursor.execute("""
            UPDATE business_accounts 
            SET verified = TRUE, status = %s 
            WHERE id = %s
        """, (status, request_id))
        conn.commit()
        return jsonify({"success": True, "message": f"Заявка {status.lower()}"}), 200
    except Exception as e:
        conn.rollback()
        print(f"Ошибка при обновлении статуса заявки: {e}")
        return jsonify({"success": False, "error": "Ошибка сервера"}), 500
    
@app.route("/api/verified-business-accounts", methods=["GET"])
def get_verified_business_accounts():
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
            cursor.execute("""
                SELECT 
                    ba.id AS request_id,
                    c.first_name || ' ' || c.last_name AS client_name,
                    COALESCE(c.phone, c.email) AS contact_info,
                    ba.car_wash_name,
                    ba.address,
                    ba.city_district,
                    ba.working_hours,
                    ba.registration_certificate,
                    ba.ownership_proof,
                    ba.car_wash_logo,
                    ba.created_at,
                    ba.status
                FROM business_accounts ba
                LEFT JOIN clients c ON ba.client_id = c.id
                WHERE ba.verified = TRUE
                ORDER BY ba.created_at DESC
            """)
            requests = cursor.fetchall()

            result = [
                {
                    "request_id": row[0],
                    "client_name": row[1],
                    "contact_info": row[2],
                    "car_wash_name": row[3],
                    "address": row[4],
                    "city_district": row[5],
                    "working_hours": row[6],
                    "registration_certificate": row[7],
                    "ownership_proof": row[8],
                    "car_wash_logo": row[9],
                    "created_at": row[10],
                    "status": row[11]
                }
                for row in requests
            ]

            return jsonify({"success": True, "data": result}), 200
    except Exception as e:
        print(f"Ошибка при получении проверенных заявок: {e}")
        return jsonify({"success": False, "error": "Ошибка сервера"}), 500
    

@app.route("/api/wash-history", methods=["GET"])
def get_wash_history():
    try:
        client_id = request.args.get("client_id")
        
        if not client_id or not client_id.isdigit():
            return jsonify({"success": False, "error": "Неверный client_id"}), 400
        
        client_id = int(client_id)
        limit = int(request.args.get("limit", 10))
        offset = int(request.args.get("offset", 0))

        with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
            cursor.execute(
                """
                SELECT 
                    id,
                    box_id,
                    to_char(start_time, 'YYYY-MM-DD HH24:MI') as appointment_time,
                    vehicle_type,
                    services,
                    total_price::float,
                    wash_name,
                    wash_location,
                    wash_image,
                    status
                FROM wash_history_view
                WHERE client_id = %s
                ORDER BY start_time DESC
                LIMIT %s OFFSET %s
                """,
                (client_id, limit, offset)
            )
            
            history_rows = cursor.fetchall()
            
            wash_history = []
            for row in history_rows:
                try:
                    price = float(row['total_price']) if row['total_price'] is not None else 0.0
                except (TypeError, ValueError) as e:
                    price = 0.0
                
                wash_item = {
                    "id": row['id'],
                    "boxId": row['box_id'],
                    "appointmentTime": row['appointment_time'],
                    "vehicleType": row['vehicle_type'],
                    "selectedServices": row['services'].split(', ') if row['services'] else [],
                    "price": f"{price:.0f} тг",
                    "name": row['wash_name'],
                    "street": row['wash_location'],
                    "image": row['wash_image'],
                    "status": row['status']
                }
                wash_history.append(wash_item)

            cursor.execute(
                "SELECT COUNT(*) FROM wash_history_view WHERE client_id = %s",
                (client_id,)
            )
            total_count = cursor.fetchone()['count']

        return jsonify({
            "success": True, 
            "history": wash_history,
            "total": total_count
        })
        
    except Exception as e:
        return jsonify({"success": False, "error": "Ошибка сервера"}), 500

@app.route("/api/wash-history/<int:history_id>", methods=["GET"])
def get_wash_history_detail(history_id):
    try:
        client_id = request.args.get("client_id")
        
        if not client_id or not client_id.isdigit():
            return jsonify({"success": False, "error": "Неверный client_id"}), 400
        
        client_id = int(client_id)
        
        cursor.execute(
            """
            SELECT 
                id,
                box_id,
                to_char(start_time, 'YYYY-MM-DD HH24:MI') as appointment_time,
                to_char(end_time, 'YYYY-MM-DD HH24:MI') as end_time,
                vehicle_type,
                services,
                total_price,
                wash_name,
                wash_location,
                wash_image,
                status,
                comments_client
            FROM 
                wash_history_view
            WHERE 
                id = %s AND client_id = %s
            """,
            (history_id, client_id)
        )
        
        row = cursor.fetchone()
        
        if not row:
            return jsonify({"success": False, "error": "Запись не найдена"}), 404
        
        history_detail = {
            "id": row[0],
            "boxId": row[1],
            "appointmentTime": row[2],
            "endTime": row[3],
            "vehicleType": row[4],
            "selectedServices": row[5].split(', ') if row[5] else [],
            "price": f"{float(row[6]):.0f} тг" if row[6] else "0 тг", 
            "name": row[7],
            "street": row[8],
            "image": row[9],
            "status": row[10],
            "comments": row[11] or ""
        }
        
        return jsonify({"success": True, "detail": history_detail})
        
    except Exception as e:
        print(f"Ошибка при получении детальной информации о мойке: {e}")
        return jsonify({"success": False, "error": "Ошибка сервера"}), 500
    
@app.route("/api/get-role", methods=["POST"])
def get_role():
    data = request.get_json()
    client_id = data.get("clientId")
    
    if not client_id:
        return jsonify({"success": False, "error": "Не указан clientId"}), 400
    
    try:
        cursor.execute("SELECT status FROM clients WHERE id = %s", (client_id,))
        row = cursor.fetchone()
        if not row:
            return jsonify({"success": False, "error": "Клиент не найден"}), 404
        
        return jsonify({"success": True, "role": row[0]})
    except Exception as e:
        print(f"[get_role] Ошибка: {e}")
        return jsonify({"success": False, "error": "Ошибка сервера"}), 500
    
@app.route("/api/check-business-status", methods=["GET"])
def check_business_status():
    client_id = request.args.get("client_id")
    if not client_id or not client_id.isdigit():
        return jsonify({"success": False, "error": "Неверный client_id"}), 400

    try:
        cursor.execute("""
            SELECT status FROM business_accounts WHERE client_id = %s
        """, (client_id,))
        row = cursor.fetchone()

        if row:
            return jsonify({"success": True, "status": row[0]}), 200
        else:
            return jsonify({"success": True, "status": None}), 200
    except Exception as e:
        print(f"Ошибка при проверке статуса бизнес-аккаунта: {e}")
        return jsonify({"success": False, "error": "Ошибка сервера"}), 500
@app.route("/api/bookings/box/<int:box_id>", methods=["GET"])
def get_bookings_by_box(box_id):
    try:
        cursor.execute("""
            SELECT 
                b.id,
                b.start_time,
                b.end_time,
                b.status,
                COALESCE(CONCAT(c.first_name, ' ', c.last_name), 'Гость') as client_name,
                b.type_car,
                b.comments_client,
                b.total_minutes,
                COALESCE(SUM(s.price), 0) as total_price,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'id', s.id,
                            'name', s.name,
                            'price', s.price,
                            'duration', s.duration_minutes
                        ) 
                        ORDER BY s.name
                    ) FILTER (WHERE s.id IS NOT NULL),
                    '[]'::json
                ) as services,
                COALESCE(
                    string_agg(s.name, ', ' ORDER BY s.name),
                    ''
                ) as service_names
            FROM bookings b
            LEFT JOIN clients c ON b.client_id = c.id
            LEFT JOIN booking_services bs ON b.id = bs.booking_id
            LEFT JOIN services s ON bs.service_id = s.id
            WHERE b.box_id = %s
            GROUP BY b.id, c.first_name, c.last_name
            ORDER BY b.start_time
        """, (box_id,))
        
        bookings = cursor.fetchall()
        
        result = []
        for booking in bookings:
            result.append({
                "bookingId": booking[0],
                "startTime": booking[1].strftime("%Y-%m-%d %H:%M"),
                "endTime": booking[2].strftime("%Y-%m-%d %H:%M"),
                "status": booking[3],
                "clientName": booking[4],
                "carType": booking[5],
                "comments": booking[6],
                "totalMinutes": booking[7],
                "totalPrice": float(booking[8]),
                "services": booking[10].split(', ') if booking[10] else [],
                "servicesDetails": booking[9]
            })
        
        return jsonify(result), 200
        
    except Exception as e:
        print(f"Error getting bookings by box: {str(e)}")
        return jsonify({"error": "Ошибка при получении броней по боксу"}), 500
    
@app.route("/api/bookings/<int:booking_id>/cancel", methods=["PUT"])
def cancel_booking(booking_id):
    try:
        cursor.execute("SELECT status FROM bookings WHERE id = %s", (booking_id,))
        row = cursor.fetchone()
        
        if not row:
            return jsonify({"error": "Бронирование не найдено"}), 404
        if row[0] == 'отменено':
            return jsonify({"message": "Бронирование уже отменено"}), 200

        cursor.execute("UPDATE bookings SET status = 'отменено' WHERE id = %s", (booking_id,))
        conn.commit()
        
        return jsonify({"message": "Бронирование успешно отменено"}), 200
        
    except Exception as e:
        conn.rollback()
        print(f"Error cancelling booking: {str(e)}")
        return jsonify({"error": "Ошибка при отмене бронирования"}), 500

@app.route("/api/bookings/client/<int:client_id>", methods=["GET"])
def get_bookings_by_client(client_id):
    try:
        cursor.execute("""
            SELECT b.id, b.start_time, b.end_time, b.status, 
                   b.box_id, b.type_car, wb.name as wash_name,
                   string_agg(s.name, ', ') as services
            FROM bookings b
            JOIN wash_boxes wb ON b.box_id = wb.id
            LEFT JOIN booking_services bs ON b.id = bs.booking_id
            LEFT JOIN services s ON bs.service_id = s.id
            WHERE b.client_id = %s
            GROUP BY b.id, b.start_time, b.end_time, b.status, 
                     b.box_id, b.type_car, wb.name
            ORDER BY b.start_time DESC
        """, (client_id,))
        rows = cursor.fetchall()
        
        result = []
        for row in rows:
            result.append({
                "bookingId": row[0],
                "startTime": row[1].strftime("%Y-%m-%d %H:%M"),
                "endTime": row[2].strftime("%Y-%m-%d %H:%M"),
                "status": row[3],
                "boxId": row[4],
                "carType": row[5],
                "washName": row[6],
                "services": row[7] if row[7] else "Не указаны"
            })

        return jsonify(result), 200

    except Exception as e:
        print(f"Error getting client bookings: {str(e)}")
        return jsonify({"error": "Ошибка при получении истории клиента"}), 500

@app.route("/api/carwashes", methods=["GET"])
def get_carwashes():
    try:
        cursor.execute("SELECT id, name, location, image_url FROM wash_boxes ORDER BY id")
        rows = cursor.fetchall()

        carwashes = []
        for row in rows:
            carwashes.append({
                "id": row[0],
                "name": row[1],
                "address": row[2], 
                "image": row[3] 
            })
        return jsonify(carwashes), 200
    except Exception as e:
        print(f"Error fetching carwashes: {str(e)}")
        return jsonify({"error": "Ошибка при получении списка автомоек"}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)