from bd_car import conn, cursor
from app import app
from apscheduler.schedulers.background import BackgroundScheduler
from mailjet_rest import Client
from twilio.rest import Client
import random
import string
from datetime import datetime

MAILJET_API_KEY = 'e3795767bd8df869a57aaea2c4556b5a'
MAILJET_API_SECRET = '21066bcc2548ee6db5d583ff8355d39c'
FROM_EMAIL = 'kabdrashev111@gmail.com'

TWILIO_ACCOUNT_SID = 'ACed6d1607e45a69d350acf5be934500c9'
TWILIO_AUTH_TOKEN = 'c8a4f20273cbfa93416eae272c51220d'
TWILIO_PHONE_NUMBER = '+17078656357'

def send_verification_email(to_email, code):
    mailjet = Client(auth=(MAILJET_API_KEY, MAILJET_API_SECRET), version='v3.1')
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
    client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
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

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

def delete_expired_codes():
    cursor.execute("""
        DELETE FROM verification_codes 
        WHERE expires_at < %s
    """, (datetime.now(),))
    conn.commit()

scheduler = BackgroundScheduler()
scheduler.add_job(delete_expired_codes, 'interval', minutes=1)
scheduler.start()
