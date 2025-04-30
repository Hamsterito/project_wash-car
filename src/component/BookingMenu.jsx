import React, { useState, useEffect } from "react";
import "./BookingMenu.css";

export default function BookingSystem({ wash = {}, onClose, services = [], clientId = null }) {
  const [step, setStep] = useState(1);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);
  const currentSystemYear = new Date().getFullYear();
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [carType, setCarType] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    comments: "",
  });
  const [selectedServices, setSelectedServices] = useState([]);
  const [availableDates, setAvailableDates] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const totalPrice = services
    .filter((s) => selectedServices.includes(s.name))
    .reduce((sum, s) => sum + s.price, 0);

  const totalTime = services
    .filter((s) => selectedServices.includes(s.name))
    .reduce((sum, s) => sum + s.duration_minutes, 0);

  useEffect(() => {
    fetchAvailableTimeSlots();
  }, []);

  const fetchAvailableTimeSlots = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/available-slots');
      if (!response.ok) {
        throw new Error('Failed to fetch available time slots');
      }
      
      const data = await response.json();
      setAvailableDates(data.availableSlots);
    } catch (error) {
      console.error("Error fetching available slots:", error);
      setError("Не удалось загрузить доступные даты. Пожалуйста, попробуйте позже.");
    } finally {
      setLoading(false);
    }
  };

  const monthNames = [
    "Январь",
    "Февраль",
    "Март",
    "Апрель",
    "Май",
    "Июнь",
    "Июль",
    "Август",
    "Сентябрь",
    "Октябрь",
    "Ноябрь",
    "Декабрь",
  ];

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleNext = () => {
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const getDateString = (year, month, day) => {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;
  };

  const formatDate = (year, month, day) => {
    return `${String(day).padStart(2, "0")}.${String(month + 1).padStart(
      2,
      "0"
    )}.${year}`;
  };

  const getDayOfWeekName = (dayIndex) => {
    const days = [
      "Воскресенье",
      "Понедельник",
      "Вторник",
      "Среда",
      "Четверг",
      "Пятница",
      "Суббота",
    ];
    return days[dayIndex];
  };

  const selectDate = (dateStr) => {
    setSelectedDate(dateStr);
    setSelectedTimeSlot(null);
  };

  const selectTimeSlot = (time) => {
    setSelectedTimeSlot(time);
  };

  const goToPrevMonth = () => {
    setCurrentMonth((prev) => {
      if (prev === 0) {
        if (currentYear > currentSystemYear) {
          setCurrentYear((y) => y - 1);
          return 11;
        }
        return 0;
      }
      return prev - 1;
    });
  };

  const goToNextMonth = () => {
    setCurrentMonth((prev) => {
      if (prev === 11) {
        if (currentYear < currentSystemYear) {
          setCurrentYear((y) => y + 1);
          return 0;
        }
        return 11;
      }
      return prev + 1;
    });
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
  };

  const toggleService = (serviceName) => {
    if (selectedServices.includes(serviceName)) {
      setSelectedServices((prev) =>
        prev.filter((name) => name !== serviceName)
      );
    } else {
      setSelectedServices((prev) => [...prev, serviceName]);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      const bookingData = {
        carType,
        date: selectedDate,
        time: selectedTimeSlot,
        selectedServices,
        boxId: wash.id || 1,
        clientId: clientId, 
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        comments: formData.comments,
      };

      const response = await fetch('http://localhost:5000/api/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при создании бронирования');
      }

      setSuccessMessage(`Бронирование успешно создано! Номер брони: ${data.booking_id}`);
      setStep(5);

    } catch (error) {
      console.error("Error submitting booking:", error);
      setError(error.message || 'Произошла ошибка при бронировании. Пожалуйста, попробуйте снова.');
    } finally {
      setLoading(false);
    }
  };

  const resetBooking = () => {
    setStep(1);
    setSelectedDate(null);
    setSelectedTimeSlot(null);
    setCarType("");
    setFormData({
      name: "",
      phone: "",
      email: "",
      comments: "",
    });
    setSelectedServices([]);
    setError(null);
    setSuccessMessage("");
  };

  const generateCalendar = () => {
    const calendarCells = [];
    const today = new Date();

    const firstDay = new Date(currentYear, currentMonth, 1);
    let firstDayOfWeek = firstDay.getDay();

    firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      calendarCells.push(
        <button key={`prev-${day}`} className="day-button unavailable">
          {day}
        </button>
      );
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = getDateString(currentYear, currentMonth, day);
      const isAvailable = dateStr in availableDates;
      const isToday =
        today.getDate() === day &&
        today.getMonth() === currentMonth &&
        today.getFullYear() === currentYear;
      const isSelected = selectedDate === dateStr;

      calendarCells.push(
        <button
          key={`current-${day}`}
          className={`day-button ${isAvailable ? "available" : "unavailable"} ${
            isToday ? "today" : ""
          } ${isSelected ? "selected" : ""}`}
          onClick={isAvailable ? () => selectDate(dateStr) : undefined}
        >
          {day}
          {isAvailable && (
            <span className="slot-count">{availableDates[dateStr].length}</span>
          )}
        </button>
      );
    }

    // Fill remaining cells with days from next month
    const totalCells = Math.ceil((firstDayOfWeek + daysInMonth) / 7) * 7;
    const nextMonthDays = totalCells - (firstDayOfWeek + daysInMonth);

    for (let day = 1; day <= nextMonthDays; day++) {
      calendarCells.push(
        <button key={`next-${day}`} className="day-button unavailable">
          {day}
        </button>
      );
    }

    return calendarCells;
  };

  const isPrevMonthDisabled = () => {
    return (
      currentYear === currentSystemYear &&
      currentMonth === new Date().getMonth()
    );
  };

  const renderTimeSlots = () => {
    if (!selectedDate) {
      return (
        <div className="no-slots-message">
          Сначала выберите дату в календаре
        </div>
      );
    }

    const times = availableDates[selectedDate] || [];

    if (times.length === 0) {
      return (
        <div className="no-slots-message">
          Нет доступных слотов на выбранную дату
        </div>
      );
    }

    return times.map((time, index) => (
      <div
        key={index}
        className={`slot ${selectedTimeSlot === time ? "selected" : ""}`}
        onClick={() => selectTimeSlot(time)}
      >
        {time}
      </div>
    ));
  };

  const getFormattedSelectedDate = () => {
    if (!selectedDate) return "";

    const [year, month, day] = selectedDate.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    const dayOfWeek = getDayOfWeekName(date.getDay());
    return `${dayOfWeek}, ${day}.${month}.${year}`;
  };

  if (loading) {
    return (
      <div className="booking-menu">
        <div className="loading-indicator">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="booking-menu">
      <div className="headermenu">
        <div>
          <h1 className="name_book">{wash.name || "Система бронирования"}</h1>
          <p>
            {wash.address || "Выберите удобную дату и время для вашей встречи"}
          </p>
        </div>
        <button className="close-btn" onClick={onClose}>
          ✕
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

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

      {step === 2 && (
        <div className="group">
          <h3 className="section-title">Выберите дату:</h3>

          <div className="calendar-container">
            <div className="calendar-header">
              <div className="month-nav">
                <button
                  className="nav-button"
                  onClick={goToPrevMonth}
                  disabled={isPrevMonthDisabled()}
                >
                  ←
                </button>
                <div className="month-name">{monthNames[currentMonth]}</div>
                <button className="nav-button" onClick={goToNextMonth}>
                  →
                </button>
              </div>
              <button id="todayBtn" className="nav-button" onClick={goToToday}>
                Сегодня
              </button>
            </div>

            <div className="weekdays">
              <div>Пн</div>
              <div>Вт</div>
              <div>Ср</div>
              <div>Чт</div>
              <div>Пт</div>
              <div>Сб</div>
              <div>Вс</div>
            </div>

            <div className="calendar-grid">{generateCalendar()}</div>
          </div>

          <div className="slots-section">
            <div className="slots-header">
              {selectedDate
                ? `Доступное время на ${getFormattedSelectedDate()}`
                : "Выберите дату для просмотра доступного времени"}
            </div>
            <div className="slots-container">{renderTimeSlots()}</div>
          </div>

          {selectedDate && selectedTimeSlot && (
            <button className="next-btn" onClick={handleNext}>
              Далее
            </button>
          )}
          <button className="back-btn" onClick={handleBack}>
            Назад
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="group">
          <h3 className="section-title">Выберите услуги:</h3>
          <ul className="service-list">
            {services.length > 0
              ? services.map((service, i) => {
                  const isSelected = selectedServices.includes(service.name);
                  return (
                    <li
                      key={i}
                      className="service-item"
                      onClick={() => toggleService(service.name)}
                    >
                      <span className="checkbox">{isSelected ? "☑" : "☐"}</span>
                      {service.name} — {service.price}₸ (
                      {service.duration_minutes} мин.)
                    </li>
                  );
                })
              : [
                  { name: "Базовая мойка", price: 3000, duration_minutes: 30 },
                  { name: "Премиум мойка", price: 5000, duration_minutes: 45 },
                  { name: "Полировка", price: 8000, duration_minutes: 90 },
                  {
                    name: "Химчистка салона",
                    price: 12000,
                    duration_minutes: 120,
                  },
                ].map((service, i) => {
                  const isSelected = selectedServices.includes(service.name);
                  return (
                    <li
                      key={i}
                      className="service-item"
                      onClick={() => toggleService(service.name)}
                    >
                      <span className="checkbox">{isSelected ? "☑" : "☐"}</span>
                      {service.name} — {service.price}₸ (
                      {service.duration_minutes} мин.)
                    </li>
                  );
                })}
          </ul>
          <div className="summary">
            <p>
              <strong>Итог:</strong> {totalPrice}₸, {totalTime} мин.
            </p>
          </div>
          <button
            className="next-btn"
            onClick={handleNext}
            disabled={selectedServices.length === 0}
          >
            Далее
          </button>
          <button className="back-btn" onClick={handleBack}>
            Назад
          </button>
        </div>
      )}

      {step === 4 && (
        <div className="group">
          <h3 className="section-title">
            Заполните информацию для бронирования
          </h3>

          <div className="booking-summary">
            <div className="summary-row">
              <span className="summary-label">Машина:</span>
              <span>{carType}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Дата:</span>
              <span>{getFormattedSelectedDate()}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Время:</span>
              <span>{selectedTimeSlot}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Услуги:</span>
              <span>{selectedServices.join(", ")}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Итоговая цена:</span>
              <span>{totalPrice}₸</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Примерное время:</span>
              <span>{totalTime} мин.</span>
            </div>
          </div>

          <div className="form-row">
            <label htmlFor="name">Ваше имя</label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-row">
            <label htmlFor="phone">Телефон</label>
            <input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-row">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-row">
            <label htmlFor="comments">Комментарии (необязательно)</label>
            <textarea
              id="comments"
              rows="3"
              value={formData.comments}
              onChange={handleInputChange}
            ></textarea>
          </div>

          <div className="action-buttons">
            <button
              className="btn confirm"
              onClick={handleSubmit}
              disabled={!formData.name || !formData.phone || !formData.email || loading}
            >
              {loading ? "Отправка..." : "Подтвердить бронирование"}
            </button>
            <button className="back-btn" onClick={handleBack}>
              Назад
            </button>
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="group success-message">
          <h2>Бронирование успешно!</h2>
          <p>{successMessage}</p>
          <button className="btn btn-primary" onClick={resetBooking}>
            Создать новое бронирование
          </button>
          <button className="btn" onClick={onClose}>
            Закрыть
          </button>
        </div>
      )}
    </div>
  );
}