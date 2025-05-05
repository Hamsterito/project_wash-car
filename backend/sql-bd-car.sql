CREATE TABLE clients (
	    id SERIAL PRIMARY KEY,
	    first_name TEXT,
	    last_name TEXT,
	    password TEXT,
	    phone TEXT UNIQUE,
	    email TEXT,
	    status TEXT DEFAULT 'user',
	    photo_url TEXT,
		is_verified BOOLEAN
);
drop table clients cascade 
select * from clients
select * from verification_codes

CREATE TABLE verification_codes (
    id serial PRIMARY KEY,
    code text,
    client_id integer,
    created_at timestamp,
    expires_at timestamp 
);

CREATE TABLE services (
    id SERIAL PRIMARY KEY,
    wash_box_id INTEGER NOT NULL REFERENCES wash_boxes(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL,
    duration_minutes INTEGER NOT NULL
);
select * from box_availability


CREATE TABLE wash_boxes (
    id SERIAL PRIMARY KEY,
	client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE DEFAULT NULL,
    name TEXT NOT NULL,
    location TEXT,
	image_url TEXT
);


CREATE TABLE managers (
  id SERIAL PRIMARY KEY,
  client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE DEFAULT NULL,
  wash_box_id INTEGER REFERENCES wash_boxes(id) ON DELETE SET NULL
);

CREATE TABLE box_availability (
    id SERIAL PRIMARY KEY,
    wash_box_id INTEGER REFERENCES wash_boxes(id) ON DELETE CASCADE,
    weekday INTEGER CHECK (weekday BETWEEN 0 AND 6), -- 0 = Понедельник, 6 = Воскресенье
    work_start TIME NOT NULL,
    work_end TIME NOT NULL,
	max_slots INTEGER DEFAULT 1
);

CREATE TABLE booking_services (
    booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    service_id INTEGER NOT NULL REFERENCES services(id),
    PRIMARY KEY (booking_id, service_id)
);

select * from booking_services

CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE DEFAULT NULL,
    box_id INTEGER REFERENCES wash_boxes(id),
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
	total_minutes INTEGER,
	status TEXT CHECK (status IN (
	'забронировано', 'свободно', 'завершено', 'отменено')) DEFAULT 'свободно',
	type_car TEXT CHECK (type_car  IN ('Представительский класс'
	,'Легковой автомобиль','Малые внедорожники','Полноразмерные внедорожники',
	'Сверхбольшие внедорожники и микроавтобусы','Грузовые')),
	comments_client TEXT
);


 CREATE TABLE business_accounts (
     id SERIAL PRIMARY KEY, 
     client_id INTEGER UNIQUE REFERENCES clients(id) ON DELETE CASCADE, 
     registration_certificate TEXT NOT NULL, 
     car_wash_name TEXT NOT NULL,
     address TEXT NOT NULL,
     city_district TEXT NOT NULL,
     working_hours TEXT NOT NULL,
     ownership_proof TEXT NOT NULL, 
     car_wash_logo TEXT,
     verified BOOLEAN DEFAULT FALSE,
     status TEXT DEFAULT 'На рассмотрении' CHECK (status IN ('На рассмотрении', 'Принят', 'Отклонен')),
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 );
 
 TRUNCATE TABLE business_accounts RESTART IDENTITY CASCADE;
 
delete from bookings
 
 -- Тригер на смена статуса при принятие бизнес аккаунта
 CREATE OR REPLACE FUNCTION set_client_status_to_business()
 RETURNS TRIGGER AS $$
 BEGIN
   IF OLD.status = 'На рассмотрении' AND NEW.status = 'Принят' THEN
     UPDATE clients
     SET status = 'business'
     WHERE id = NEW.client_id;
   END IF;
   RETURN NEW;
 END;
 $$ LANGUAGE plpgsql;
 
 CREATE TRIGGER trigger_update_client_status
 AFTER UPDATE ON business_accounts
 FOR EACH ROW
 WHEN (OLD.status IS DISTINCT FROM NEW.status)
 EXECUTE FUNCTION set_client_status_to_business();


select * from wash_history_view
CREATE OR REPLACE VIEW wash_history_view AS
SELECT 
    b.id,
    b.client_id,
    b.box_id,
    b.start_time,
    b.end_time,
    b.total_minutes,
    b.status,
    b.type_car AS vehicle_type,
    b.comments_client,
    wb.name AS wash_name,
    wb.location AS wash_location,
    wb.image_url AS wash_image,
    string_agg(DISTINCT s.name, ', ') AS services,
    sum(s.price) AS total_price
FROM 
    bookings b
JOIN 
    wash_boxes wb ON b.box_id = wb.id
LEFT JOIN 
    booking_services bs ON b.id = bs.booking_id
LEFT JOIN 
    services s ON bs.service_id = s.id
WHERE 
    b.client_id IS NOT NULL
GROUP BY
    b.id, b.client_id, b.box_id, b.start_time, b.end_time, 
    b.total_minutes, b.status, b.type_car, b.comments_client,
    wb.name, wb.location, wb.image_url
ORDER BY 
    b.start_time DESC;


CREATE TABLE admins (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
	password TEXT NOT NULL,
    phone TEXT
);


