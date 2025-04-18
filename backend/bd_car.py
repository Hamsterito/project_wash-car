import psycopg2

conn = psycopg2.connect(
    dbname="db_car",
    user="postgres",
    password="123",
    host="localhost",
    port="5432"
)
cursor = conn.cursor()

