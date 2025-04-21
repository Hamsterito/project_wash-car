from flask import Flask, request, render_template, redirect, url_for, session, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from bd_car import conn, cursor
from apscheduler.schedulers.background import BackgroundScheduler
from mailjet_rest import Client as MailjetClient
from twilio.rest import Client as TwilioClient
import uuid
import os
from datetime import datetime, timedelta
from flask_cors import CORS
import random
import string

app = Flask(__name__)
CORS(app)
app.secret_key = '12345'

app.config['UPLOAD_FOLDER'] = 'static/img'
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg', 'gif'}

MAILJET_API_KEY = 'e3795767bd8df869a57aaea2c4556b5a'
MAILJET_API_SECRET = '68bd297d7841a93c2b3ce9aa0275abb2'
FROM_EMAIL = 'Kabdrashev111@gmail.com'

TWILIO_ACCOUNT_SID = 'ACed6d1607e45a69d350acf5be934500c9'
TWILIO_AUTH_TOKEN = 'c8a4f20273cbfa93416eae272c51220d'
TWILIO_PHONE_NUMBER = '+17078656357'

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
            "INSERT INTO clients (phone, email) VALUES (%s, %s) RETURNING id",
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
    except Exception as e:
        print(f"Ошибка при регистраций: {e}")

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
        session['client_id'] = result[0]
        return jsonify({'success': True})
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

        if result:
            client_id, expires_at = result
            if expires_at < datetime.now():
                cursor.execute("DELETE FROM verification_codes WHERE client_id = %s", (client_id,))
                cursor.execute("DELETE FROM clients WHERE id = %s", (client_id,))
                conn.commit()
                return jsonify({"success": False, "error": "Код истёк"}), 400
            return jsonify({"success": True})
        else:
            return jsonify({"success": False, "error": "Код или контакт неверны"}), 400
    except Exception as e:
        print(f"Ошибка верификаций {e}")

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
        cursor.execute(
            "DELETE FROM clients WHERE %s OR %s)",
            ("", phone, email)
        )
        conn.commit()
        cursor.execute(
            "INSERT INTO clients (name, phone, password, email) VALUES (%s, %s, %s, %s)",
            ("", phone, password_hash, email)
        )
        conn.commit()
        return jsonify({"success": True})
    except Exception as e:
        conn.rollback()
        return jsonify({"success": False, "error": "Ошибка при сохранении"}), 500

# Код не с фронтом
@app.route("/book", methods=["GET", "POST"])
def book():
    if request.method == "POST":
        action = request.form.get('book_btn')
        service_id = request.form.get('service')

        client_id = session.get('client_id') 
        if not client_id:
            return "Клиент не авторизован"

        cursor.execute("SELECT status FROM bookings WHERE client_id = %s", (client_id,))
        current_status = cursor.fetchone()

        if action == "book":
            if current_status and current_status[0] == "забронировано":
                return "Вы уже забронировали место"

            cursor.execute('''
                SELECT id FROM bookings 
                WHERE service_id = %s AND status = 'свободно'
                LIMIT 1
            ''', (service_id,))
            free_booking = cursor.fetchone()

            if not free_booking:
                return "Нет доступных слотов для выбранной услуги"

            booking_id = free_booking[0]

            cursor.execute('''
                UPDATE bookings SET client_id = %s, status = 'забронировано'
                WHERE id = %s
            ''', (client_id, booking_id))
            conn.commit()
            return "Бронирование успешно!"
        elif action == "cancel_book":
            if not current_status or current_status[0] != "забронировано":
                return "Нет активного бронирования для отмены"
            
            cursor.execute('''
             UPDATE bookings SET client_id = NULL, status = 'свободно'
            WHERE client_id = %s AND status = 'забронировано'
            ''', (client_id,))
            conn.commit() 

            return "Бронирование отменено!"
    
    cursor.execute("SELECT id, name FROM services")
    services = cursor.fetchall()

    return render_template("book.html", services=services)

@app.route("/add_card", methods=["GET", "POST"])
def add_cart():
    if request.method == "POST":
        name = request.form.get('name')
        location = request.form.get('location')
        image_file = request.files.get('image_file')
        
        if image_file and image_file.filename != "":
            original_filename = secure_filename(image_file.filename)
            ext = os.path.splitext(original_filename)[1]
            unique_filename = f"{uuid.uuid4().hex}{ext}"
            image_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
            image_file.save(image_path)
            image_url = f"img/{unique_filename}"

            cursor.execute("INSERT INTO wash_boxes (name, location, image_url) VALUES (%s, %s, %s)", 
                        (name, location, image_url))
            conn.commit()
        else:
            return "Файл не был загружен"

    cursor.execute("SELECT * FROM wash_boxes")
    wash_boxes = cursor.fetchall()
    return render_template("add_cart.html", wash_boxes=wash_boxes)

@app.route("/delete_box", methods=["POST"])
def delete_box():
    box_id = request.form.get("box_id")
    
    if box_id:
        cursor.execute("SELECT image_url FROM wash_boxes WHERE id = %s", (box_id,))
        result = cursor.fetchone()
        if result and result[0]:
            image_path = os.path.join(app.config['UPLOAD_FOLDER'], os.path.basename(result[0]))
            if os.path.exists(image_path):
                os.remove(image_path)
        
        cursor.execute("DELETE FROM bookings WHERE box_id = %s", (box_id,))
        cursor.execute("DELETE FROM wash_boxes WHERE id = %s", (box_id,))
        conn.commit()
    
    return redirect(url_for("add_cart"))


@app.route("/change_box", methods=["GET", "POST"])
def change_box():
    if request.method == "POST":
        name = request.form.get('name')
        location = request.form.get('location')
        image_file = request.files.get('image_file')
        box_id = request.form.get("box_id")

        if image_file and image_file.filename != "":
            original_filename = secure_filename(image_file.filename)
            ext = os.path.splitext(original_filename)[1]
            unique_filename = f"{uuid.uuid4().hex}{ext}"
            image_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
            image_file.save(image_path)
            image_url = f"img/{unique_filename}"

            cursor.execute("UPDATE wash_boxes SET name = %s, location = %s, image_url = %s WHERE id = %s",
                           (name, location, image_url, box_id))
        else:
            cursor.execute("UPDATE wash_boxes SET name = %s, location = %s WHERE id = %s",
                           (name, location, box_id))

        conn.commit()
    return redirect(url_for("add_cart"))

        
if __name__ == "__main__":
    app.run(debug=True)
