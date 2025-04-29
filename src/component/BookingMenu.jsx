import React, { useEffect, useState } from "react";
import "./BookingMenu.css";

export default function BookingMenu({ wash, onClose, services }) {
  const [step, setStep] = useState(1);
  const [carType, setCarType] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [service, setService] = useState("");
  const clientId = localStorage.getItem("client_id");
  const [selectedServices, setSelectedServices] = useState([]);
  const totalPrice = (services || [])
    .filter((s) => selectedServices.includes(s.name))
    .reduce((sum, s) => sum + s.price, 0);

  const totalTime = (services || [])
    .filter((s) => selectedServices.includes(s.name))
    .reduce((sum, s) => sum + s.duration_minutes, 0);

  const handleNext = () => {
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };
  
  const handleSubmit = async () => {
    const bookingData = {
      clientId: clientId,
      boxId: wash.id,
      carType: carType,
      date: date,
      time: time,
      selectedServices: selectedServices,
    };
    try {
      const res = await fetch("http://localhost:5000/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      });
  
      if (res.ok) {
        onClose()
      } else {
        const errorData = await res.json();
        alert("Ошибка при бронировании: " + errorData.message);
      }
    } catch (err) {
      alert("Сервер недоступен. Попробуйте позже.");
    }
  };
  

  return (
    <div className="booking-menu">
      <div className="headermenu">
        <div>
          <h1 className="name_book">{wash.name}</h1>
          <p>{wash.address}</p>
        </div>
        <button className="close-btn" onClick={onClose}>
          ✕
        </button>
      </div>

      {step === 1 && (
        <div className="group">
          <h3 className="section-title">Выбор машины:</h3>
          {[
            "Представительский класс",
            "Легковой автомобиль",
            "Малые внедорожники",
            "Полноразмерные внедорожники",
            "Сверхбольшие внедорожники и микроавтобусы",
            "Грузовые",
          ].map((type, i) => (
            <button
              key={i}
              className="select-btn"
              onClick={() => {
                setCarType(type);
                handleNext();
              }}
            >
              {type}
            </button>
          ))}
        </div>
      )}

      {/* Выбор времени */}
      {step === 2 && (
        <div className="group">
          <h3 className="section-title">Выберите дату и время:</h3>
          <input
            id="book_input"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <input
            id="book_input"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
          <button
            className="next-btn"
            onClick={handleNext}
            disabled={!date || !time}
          >
            Далее
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="group">
          <h3 className="section-title">Выберите услуги:</h3>
          <ul className="service-list">
            {(services || []).map((s, i) => {
              const isSelected = selectedServices.includes(s.name);
              return (
                <li
                  key={i}
                  className="service-item"
                  onClick={() => {
                    if (isSelected) {
                      setSelectedServices(
                        selectedServices.filter((name) => name !== s.name)
                      );
                    } else {
                      setSelectedServices([...selectedServices, s.name]);
                    }
                  }}
                >
                  <span className="checkbox">{isSelected ? "☑" : "☐"}</span>
                  {s.name} — {s.price}₸ ({s.duration_minutes} мин.)
                </li>
              );
            })}
          </ul>
          <div className="summary">
            <p>
              <strong>Итог:</strong> {totalPrice}₸, {totalTime} мин.
            </p>
            <button
              className="next-btn"
              onClick={handleNext}
              disabled={selectedServices.length === 0}
            >
              Далее
            </button>
          </div>
        </div>
      )}

      {/* Чек */}
      {step === 4 && (
        <div className="group">
          <h3 className="section-title">Чек</h3>
          <div className="text_section">
            <p>
              <strong>Автомойка:</strong> {wash.name}
            </p>
            <p>
              <strong>Машина:</strong> {carType}
            </p>
            <p>
              <strong>Дата:</strong> {date}
            </p>
            <p>
              <strong>Время:</strong> {time}
            </p>
            <p>
              <strong>Услуги:</strong>
            </p>
            <ul>
              {selectedServices.map((service, i) => (
                <li key={i}>{service}</li>
              ))}
            </ul>
          </div>
          <button className="btn confirm" onClick={handleSubmit}>
            Подтвердить
          </button>
          <button className="back-btn" onClick={handleBack}>
            Назад
          </button>
        </div>
      )}

      {step > 1 && step < 4 && (
        <div className="group">
          <button className="back-btn" onClick={handleBack}>
            Назад
          </button>
        </div>
      )}
    </div>
  );
}
