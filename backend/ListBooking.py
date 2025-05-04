from app import app 
from bd_car import conn, cursor
from flask import jsonify

@app.route("/api/bookings/box/<int:box_id>", methods=["GET"])
def get_bookings_by_box(box_id):
    try:
        cursor.execute("""
            SELECT b.id, b.a, b.end_time, b.status, c.name, b.type_car
            FROM bookings b
            LEFT JOIN clients c ON b.client_id = c.id
            WHERE b.box_id = %s
            ORDER BY b.start_time
        """, (box_id,))
        rows = cursor.fetchall()
        
        result = []
        for row in rows:
            result.append({
                "bookingId": row[0],
                "startTime": row[1].strftime("%Y-%m-%d %H:%M"),
                "endTime": row[2].strftime("%Y-%m-%d %H:%M"),
                "status": row[3],
                "clientName": row[4],
                "carType": row[5]
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
            SELECT b.id, b.start_time, b.end_time, b.status, b.box_id, b.type_car
            FROM bookings b
            WHERE b.client_id = %s
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
                "carType": row[5]
            })

        return jsonify(result), 200

    except Exception as e:
        print(f"Error getting client bookings: {str(e)}")
        return jsonify({"error": "Ошибка при получении истории клиента"}), 500

@app.route("/api/carwashes", methods=["GET"])
def get_carwashes():
    try:
        cursor.execute("SELECT id, name, address, image_url FROM carwashes ORDER BY id")
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

