CREATE TABLE clients (
    id SERIAL PRIMARY KEY,
    first_name TEXT,
	last_name TEXT,
	password TEXT ,
    phone TEXT UNIQUE,
    email TEXT
);

CREATE TABLE verification_codes (
    id serial PRIMARY KEY,
    code text,
    client_id integer,
    created_at timestamp,
    expires_at timestamp 
);

truncate clients cascade
select * from services

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
    status TEXT CHECK (status IN ('забронировано', 'свободно'))
	DEFAULT 'свободно'
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

-- Вставляем бронирования
INSERT INTO bookings (box_id, start_time, end_time, status) VALUES
(1, '2024-03-20 10:00:00', '2024-03-20 11:30:00', 'забронировано'),
(2, '2024-03-21 14:00:00', '2024-03-21 14:45:00', 'свободно');

-- Связываем услуги с бронированиями
INSERT INTO booking_services (booking_id, service_id) VALUES
(7, 1),
(8, 2);

select * from booking_services

CREATE TABLE admins (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
	password TEXT NOT NULL,
    phone TEXT
);
