import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./CarWashSchedule.css";
import axios from "axios";

const CarWashSchedule = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [tomorrowSchedule, setTomorrowSchedule] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setLoading(true);

        const response = await axios.get(`http://localhost:5000/api/bookings/box/${id}`);
        console.log("Данные полученные от API:", response.data);

        const bookings = Array.isArray(response?.data) ? response.data : [];
        setAllBookings(bookings);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dayAfterTomorrow = new Date(tomorrow);
        dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

        const todayBookings = bookings.filter((booking) => {
          if (!booking.startTime) return false;
          const bookingDate = new Date(booking.startTime);
          return bookingDate >= today && bookingDate < tomorrow;
        });

        const tomorrowBookings = bookings.filter((booking) => {
          if (!booking.startTime) return false;
          const bookingDate = new Date(booking.startTime);
          return bookingDate >= tomorrow && bookingDate < dayAfterTomorrow;
        });

        const formatBookings = (bookings) => {
          return bookings.map((booking) => ({
            id: booking.bookingId || booking.id || "",
            name: booking.clientName || "Гость",
            carType: booking.type_car || booking.carType || "Не указан",
            time: booking.startTime
              ? new Date(booking.startTime).toLocaleTimeString("ru-RU", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "--:--",
            date: booking.startTime
              ? new Date(booking.startTime).toLocaleDateString("ru-RU")
              : "",
            fullDateTime: booking.startTime || "",
            services: booking.services
              ? typeof booking.services === "string"
                ? booking.services.split(", ")
                : booking.services
              : ["Не указаны"],
            totalPrice: booking.total_price || booking.totalPrice || 0,
            duration: booking.total_minutes || booking.totalMinutes || 0,
            status: booking.status || "неизвестно",
          }));
        };

        setTodaySchedule(formatBookings(todayBookings));
        setTomorrowSchedule(formatBookings(tomorrowBookings));
      } catch (err) {
        console.error("Ошибка при загрузке расписания:", err);
        setError("Не удалось загрузить расписание");
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [id]);

  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const formatDate = (date) => {
    const formattedDate = date.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      weekday: "long",
    });

    const [dayOfWeek, ...rest] = formattedDate.split(" ");
    const capitalizedDayOfWeek =
      dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1);

    return [capitalizedDayOfWeek, ...rest].join(" ");
  };

  const toggleView = () => {
    setShowAll(!showAll);
  };

  const handleBack = () => {
    navigate("/list-car-washes");
  };

  if (loading) return <div className="schedule-container" id="load_schedule">Загрузка...</div>;
  if (error) return <div className="schedule-container error">{error}</div>;

  return (
    <div className="schedule-container">
      <h1 className="schedule-title">Расписание автомойки #{id}</h1>

      <div className="button-container">
        <button onClick={handleBack} className="back-button">
          Назад
        </button> 

        <button onClick={toggleView} className="view-toggle-button">
          {showAll
            ? "Показать только сегодня/завтра"
            : "Показать все бронирования"}
        </button>
      </div>

      {showAll ? (
        <div className="schedule-section">
          <h2 className="all_book_text">Все бронирования</h2>
          {allBookings.length > 0 ? (
            <table className="schedule-table">
              <thead>
                <tr>
                  <th>Дата</th>
                  <th>Время</th>
                  <th>ФИО</th>
                  <th>Машина</th>
                  <th>Услуги</th>
                  <th>Сумма</th>
                  <th>Длительность</th>
                  <th>Статус</th>
                </tr>
              </thead>
              <tbody>
                {allBookings
                  .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
                  .map((booking, index) => {
                    const formattedBooking = {
                      id: booking.bookingId || booking.id || "",
                      name: booking.clientName || "Гость",
                      carType:
                        booking.type_car || booking.carType || "Не указан",
                      time: booking.startTime
                        ? new Date(booking.startTime).toLocaleTimeString(
                            "ru-RU",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )
                        : "--:--",
                      date: booking.startTime
                        ? new Date(booking.startTime).toLocaleDateString(
                            "ru-RU"
                          )
                        : "",
                      services: booking.services
                        ? typeof booking.services === "string"
                          ? booking.services.split(", ")
                          : booking.services
                        : ["Не указаны"],
                      totalPrice:
                        booking.total_price || booking.totalPrice || 0,
                      duration:
                        booking.total_minutes || booking.totalMinutes || 0,
                      status: booking.status || "неизвестно",
                    };

                    return (
                      <tr key={index}>
                        <td>{formattedBooking.date}</td>
                        <td>{formattedBooking.time}</td>
                        <td>{formattedBooking.name}</td>
                        <td>{formattedBooking.carType}</td>
                        <td>{formattedBooking.services.join(", ")}</td>
                        <td>{formattedBooking.totalPrice} Тг</td>
                        <td>{formattedBooking.duration} мин</td>
                        <td className={`status ${formattedBooking.status}`}>
                          {formattedBooking.status}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          ) : (
            <p>Нет бронирований</p>
          )}
        </div>
      ) : (
        <>
          <div className="schedule-section">
            <p className="schedule-date">{formatDate(today)}</p>
            {todaySchedule.length > 0 ? (
              <table className="schedule-table">
                <thead>
                  <tr>
                    <th>ФИО</th>
                    <th>Машина</th>
                    <th>Время</th>
                    <th>Услуги</th>
                    <th>Сумма</th>
                    <th>Длительность</th>
                    <th>Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {todaySchedule.map((entry, index) => (
                    <tr key={index}>
                      <td>{entry.name}</td>
                      <td>{entry.carType}</td>
                      <td>{entry.time}</td>
                      <td>{entry.services.join(", ")}</td>
                      <td id="totalPrice">{entry.totalPrice} ₸</td>
                      <td>{entry.duration} мин</td>
                      <td className={`status ${entry.status}`}>
                        {entry.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="no_book_text">На сегодня бронирований нет</p>
            )}
          </div>

          <div className="schedule-section" style={{ marginTop: "50px" }}>
            <p className="schedule-date">{formatDate(tomorrow)}</p>
            {tomorrowSchedule.length > 0 ? (
              <table className="schedule-table">
                <thead>
                  <tr>
                    <th>ФИО</th>
                    <th>Машина</th>
                    <th>Время</th>
                    <th>Услуги</th>
                    <th>Сумма</th>
                    <th>Длительность</th>
                    <th>Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {tomorrowSchedule.map((entry, index) => (
                    <tr key={index}>
                      <td>{entry.name}</td>
                      <td>{entry.carType}</td>
                      <td>{entry.time}</td>
                      <td>{entry.services.join(", ")}</td>
                      <td id="totalPrice">{entry.totalPrice} Тг</td>
                      <td>{entry.duration} мин</td>
                      <td className={`status ${entry.status}`}>
                        {entry.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="no_book_text">На завтра бронирований нет</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CarWashSchedule;
