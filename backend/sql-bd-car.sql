CREATE TABLE clients (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
	password TEXT NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    email TEXT NOT NULL
);

CREATE TABLE book(
    id SERIAL PRIMARY KEY,
	client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
	status TEXT CHECK (status IN ('забронировано', 'свободно'))
	DEFAULT 'свободно'
);

DROP TABLE clients

INSERT INTO clients (name,password,phone,email)
VALUES('dima',123,'12345678','email')

SELECT * FROM book

TRUNCATE clients CASCADE

CREATE TABLE services (
    id SERIAL PRIMARY KEY,
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

CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE DEFAULT NULL,
    service_id INTEGER REFERENCES services(id),
    box_id INTEGER REFERENCES wash_boxes(id),
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    status TEXT CHECK (status IN ('забронировано', 'свободно'))
	DEFAULT 'свободно'
);


CREATE TABLE admins (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
	password TEXT NOT NULL,
    phone TEXT
);

-- Услуги
INSERT INTO services (name, description, price, duration_minutes) VALUES
('Мойка кузова', 'Полная мойка внешней части автомобиля', 500.00, 20),
('Химчистка салона', 'Глубокая чистка сидений и обивки', 1500.00, 60),
('Полировка фар', 'Полировка передних фар', 800.00, 30),
('Комплексная мойка', 'Мойка кузова и салона', 2000.00, 90);

-- Мойки (боксы)
INSERT INTO wash_boxes (name, location, image_url) VALUES
('Бокс №1', 'Центральная мойка', 'img/images.jpeg'),
('Бокс №2', 'Северная мойка', 'img/images.jpeg'),
('Бокс №3', 'Южная мойка', 'img/images.jpeg');

select * from wash_boxes

-- Бронирования
INSERT INTO bookings (client_id, service_id, box_id, start_time, end_time, status) VALUES
(Null, 1, 1, '2025-04-15 10:00:00', '2025-04-15 10:20:00', 'свободно'),
(Null, 2, 2, '2025-04-15 11:00:00', '2025-04-15 12:00:00', 'свободно'),
(Null, 3, 3, '2025-04-15 12:30:00', '2025-04-15 13:00:00', 'свободно');
