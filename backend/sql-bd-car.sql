CREATE TABLE clients (
    id SERIAL PRIMARY KEY,
    first_name TEXT,
    last_name TEXT,
    password TEXT,
    phone TEXT UNIQUE,
    email TEXT,
    status TEXT DEFAULT 'user', -- 'user', 'business', 'manager', 'admin'
    photo_url TEXT,
    is_verified BOOLEAN DEFAULT FALSE
);

SELECT * FROM business_accounts

UPDATE clients
SET status = 'business'
WHERE id = 1;

UPDATE clients
SET status = 'user'
WHERE id = 1;

CREATE TABLE business_accounts (
    id SERIAL PRIMARY KEY, 
    client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE, 
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

SELECT * FROM business_accounts

CREATE TABLE verification_codes (
    id serial PRIMARY KEY,
    code text,
    client_id integer,
    created_at timestamp,
    expires_at timestamp 
);
SELECT * FROM verification_codes
CREATE TABLE services (
    id SERIAL PRIMARY KEY,
    wash_box_id INTEGER NOT NULL REFERENCES wash_boxes(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL,
    duration_minutes INTEGER NOT NULL
);

CREATE TABLE wash_boxes (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT,
	image_url TEXT
);

CREATE TABLE box_availability (
    id SERIAL PRIMARY KEY,
    wash_box_id INTEGER REFERENCES wash_boxes(id) ON DELETE CASCADE,
    weekday INTEGER CHECK (weekday BETWEEN 0 AND 6), -- 0 = Понедельник, 6 = Воскресенье
    work_start TIME NOT NULL,
    work_end TIME NOT NULL,
	max_slots INTEGER DEFAULT 1
);

-- Бокс 1: понедельник-пятница, 09:00–21:00
INSERT INTO box_availability (wash_box_id, weekday, work_start, work_end, max_slots)
VALUES 
(1, 0, '09:00', '21:00',2),  -- Понедельник
(1, 1, '09:00', '21:00',2),  -- Вторник
(1, 2, '09:00', '21:00',2),  -- Среда
(1, 3, '09:00', '21:00',2),  -- Четверг
(1, 4, '09:00', '21:00',2);  -- Пятница

-- Бокс 2: суббота-воскресенье, 10:00–18:00
INSERT INTO box_availability (wash_box_id, weekday, work_start, work_end,max_slots)
VALUES 
(2, 5, '10:00', '18:00',2),  -- Суббота
(2, 6, '10:00', '18:00',2);  -- Воскресенье

CREATE TABLE booking_services (
    booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    service_id INTEGER NOT NULL REFERENCES services(id),
    PRIMARY KEY (booking_id, service_id)
);

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

select * from wash_history_view
select * from clients

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
    string_agg(s.name, ', ') AS services,
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


-- Тест
-- Вставляем мойки
INSERT INTO wash_boxes (name, location, image_url) VALUES
('Премиум мойка', 'ул. Центральная, 1', 'img/images.jpeg'),
('Эконом мойка', 'ул. Полевая, 5', 'img/images.jpeg'),
('Новая мойка (без услуг)', 'пр. Тестовый, 10', NULL);

update wash_boxes set image_url = 'images/carwash.png'	where image_url = 'img/images.jpeg';

-- Вставляем услуги
INSERT INTO services (wash_box_id, name, description, price, duration_minutes) VALUES
(1, 'Полный комплекс', 'Мойка + химчистка', 2500.00, 90),
(1, 'Экспресс-мойка', 'Быстрая наружная мойка', 1000.00, 30),
(2, 'Стандартная мойка', 'Базовая очистка', 800.00, 45);

select * from services
delete from 

-- Вставляем бронирования
INSERT INTO bookings (box_id, start_time, end_time, status) VALUES
(1, '2024-03-20 10:00:00', '2024-03-20 11:30:00', 'забронировано'),
(2, '2024-03-21 14:00:00', '2024-03-21 14:45:00', 'свободно');

-- Связываем услуги с бронированиями
INSERT INTO booking_services (booking_id, service_id) VALUES
(7, 1),
(8, 2);

select * from booking_services

-- Услуги
INSERT INTO services (name, description, price, duration_minutes) VALUES
('Мойка кузова', 'Полная мойка внешней части автомобиля', 500.00, 20),
('Химчистка салона', 'Глубокая чистка сидений и обивки', 1500.00, 60),
('Полировка фар', 'Полировка передних фар', 800.00, 30),
('Комплексная мойка', 'Мойка кузова и салона', 2000.00, 90);

-- Мойки (боксы)
INSERT INTO wash_boxes (name, location, image_url) VALUES
('Бокс №1', 'Центральная мойка', '/images/carwash.png'),
('Бокс №2', 'Северная мойка', '/images/carwash.png'),
('Бокс №3', 'Южная мойка', '/images/carwash.png');

select * from wash_boxes


-- Бронирования 
INSERT INTO bookings (client_id, service_id, box_id, start_time, end_time, status) VALUES
(Null, 1, 1, '2025-04-15 10:00:00', '2025-04-15 10:20:00', 'свободно'),
(Null, 2, 2, '2025-04-15 11:00:00', '2025-04-15 12:00:00', 'свободно'),
(Null, 3, 3, '2025-04-15 12:30:00', '2025-04-15 13:00:00', 'свободно');

select * from bookings