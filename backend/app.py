from flask import Flask, request, render_template, redirect, url_for, session, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from psycopg2 import errors
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

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), 'app.env'))

app = Flask(__name__)
CORS(app)
app.secret_key = '12345'

app.config['UPLOAD_FOLDER'] = 'static/img'
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg', 'gif'}

MAILJET_API_KEY = os.getenv('MAILJET_API_KEY')
MAILJET_API_SECRET = os.getenv('MAILJET_API_SECRET')
FROM_EMAIL = os.getenv('FROM_EMAIL')

TWILIO_ACCOUNT_SID = os.getenv('TWILIO_ACCOUNT_SID')
TWILIO_AUTH_TOKEN = os.getenv('TWILIO_AUTH_TOKEN')
TWILIO_PHONE_NUMBER = os.getenv('TWILIO_PHONE_NUMBER')

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
    
def generate_code(length=6):
    return ''.join(random.choices(string.digits, k=length))


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

# авторизоваться
@app.route("/api/login", methods=["POST"])
def api_login():
    data = request.get_json()
    contact = data.get('contact')
    password = data.get('password')

    if '@' in contact:
        cursor.execute("SELECT id, password FROM clients WHERE email = %s", (contact,))
    else:
        cursor.execute("SELECT id, password FROM clients WHERE phone = %s", (contact,))
    
    result = cursor.fetchone()

    if result and check_password_hash(result[1], password):
        client_id = result[0]
        session['client_id'] = client_id
        return jsonify({'success': True, 'client_id': client_id}) 
    else:
        return jsonify({'success': False, 'message': 'Неверные данные'}), 401

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
            return jsonify({"success": False, "error": "Код или контакт неверны"}), 400

        client_id, expires_at = result

        if expires_at < datetime.now():
            cursor.execute("DELETE FROM verification_codes WHERE client_id = %s", (client_id,))
            cursor.execute("DELETE FROM clients WHERE id = %s", (client_id,))
            conn.commit()
            return jsonify({"success": False, "error": "Код истёк"}), 400

        cursor.execute("UPDATE clients SET is_verified = TRUE WHERE id = %s", (client_id,))
        print(client_id)
        conn.commit()
        cursor.execute("DELETE FROM verification_codes WHERE client_id = %s", (client_id,))
        conn.commit()

        return jsonify({"success": True})

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
    password = data.get("password")
    contact_type = data.get("type")

    if not contact or not password or not contact_type:
        return jsonify({"success": False, "error": "Недостаточно данных"}), 400

    phone = contact if contact_type == "phone" else None
    email = contact if contact_type == "email" else None

    password_hash = generate_password_hash(password)

    try:
        cursor.execute("UPDATE clients SET password = %s WHERE phone = %s or email = %s" , (password_hash, phone, email))
        conn.commit()   
        return jsonify({"success": True})
    except Exception as e:
        conn.rollback()
        return jsonify({"success": False, "error": "Ошибка при сохранении"}), 500
    
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
    service_names = data.get("selectedServices")
    box_id = data.get("boxId")
    client_id = data.get("clientId")

    if not all([car_type, date, time, service_names, box_id]):
        return jsonify({"error": "Недостаточно данных"}), 400

    try:
        placeholders = ','.join(['%s'] * len(service_names))
        cursor.execute(
            f"SELECT id, duration_minutes FROM services WHERE name IN ({placeholders})",
            service_names
        )
        service_rows = cursor.fetchall()

        if not service_rows:
            return jsonify({"error": "Услуги не найдены"}), 400

        total_minutes = sum(row[1] for row in service_rows)
        start_time = datetime.strptime(f"{date} {time}", "%Y-%m-%d %H:%M")
        end_time = start_time + timedelta(minutes=total_minutes)

        cursor.execute(
            """
            INSERT INTO bookings (client_id, box_id, start_time, end_time, status, type_car)
            VALUES (%s, %s, %s, %s, 'забронировано',%s) RETURNING id
            """,
            (client_id, box_id, start_time, end_time, car_type)
        )
        booking_id = cursor.fetchone()[0]

        for service_id, _ in service_rows:
            cursor.execute(
                "INSERT INTO booking_services (booking_id, service_id) VALUES (%s, %s)",
                (booking_id, service_id)
            )

        conn.commit()

        return jsonify({"message": "Бронирование успешно", "booking_id": booking_id}), 201

    except Exception as e:
        conn.rollback()
        print(e)
        return jsonify({"error": str(e)}), 500

              
if __name__ == "__main__":
    app.run(debug=True)