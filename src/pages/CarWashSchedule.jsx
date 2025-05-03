import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./CarWashSchedule.css";

const CarWashSchedule = () => {
  const { id } = useParams();
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [tomorrowSchedule, setTomorrowSchedule] = useState([]);

  useEffect(() => {
    const fakeToday = [
      {
        name: "Кабраков Мансур",
        carType: "Грузовые",
        time: "11:00",
        services: ["Экспресс мойка", "Химчистка"],
        totalPrice: 9999,
        duration: 99,
      },
    ];

    const fakeTomorrow = [
      {
        name: "Какойто чел",
        carType: "Легковые",
        time: "09:30",
        services: ["Мойка кузова"],
        totalPrice: 9009,
        duration: 999,
      },
    ];

    setTodaySchedule(fakeToday);
    setTomorrowSchedule(fakeTomorrow);
  }, [id]);

  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const formatDate = (date) =>
    date.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      weekday: "long",
    });

  return (
    <div className="schedule-container">
      <h1 className="schedule-title">Расписание автомойки #{id}</h1>

      {/* Сегодня */}
      <div className="schedule-section">
        <p className="schedule-date">{formatDate(today)}</p>
        <table className="schedule-table">
          <thead>
            <tr>
              <th>ФИО</th>
              <th>Машина</th>
              <th>Время</th>
              <th>Услуги</th>
              <th>Сумма</th>
              <th>Длительность</th>
            </tr>
          </thead>
          <tbody>
            {todaySchedule.map((entry, index) => (
              <tr key={index}>
                <td>{entry.name}</td>
                <td>{entry.carType}</td>
                <td>{entry.time}</td>
                <td>{entry.services.join(", ")}</td>
                <td>{entry.totalPrice} ₸</td>
                <td>{entry.duration} мин</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Завтра */}
      <div className="schedule-section" style={{ marginTop: "50px" }}>
        <p className="schedule-date">{formatDate(tomorrow)}</p>
        <table className="schedule-table">
          <thead>
            <tr>
              <th>ФИО</th>
              <th>Машина</th>
              <th>Время</th>
              <th>Услуги</th>
              <th>Сумма</th>
              <th>Длительность</th>
            </tr>
          </thead>
          <tbody>
            {tomorrowSchedule.map((entry, index) => (
              <tr key={index}>
                <td>{entry.name}</td>
                <td>{entry.carType}</td>
                <td>{entry.time}</td>
                <td>{entry.services.join(", ")}</td>
                <td>{entry.totalPrice} ₸</td>
                <td>{entry.duration} мин</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CarWashSchedule;
