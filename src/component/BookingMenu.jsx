import React, { useState, useEffect, useCallback } from "react";
import "./BookingMenu.css";

export default function BookingSystem({
  wash = {},
  onClose,
  services = [],
  clientId = null,
  boxId = null,
}) {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [carType, setCarType] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    comments: "",
  });
  const [selectedServices, setSelectedServices] = useState([]);

  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const [availableDates, setAvailableDates] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [currentBoxId, setCurrentBoxId] = useState(null);

  const selectedServiceObjects = services.filter((s) =>
    selectedServices.includes(s.name)
  );

  const totalPrice = selectedServiceObjects.reduce(
    (sum, s) => sum + s.price,
    0
  );

  const totalTime = selectedServiceObjects.reduce(
    (sum, s) => sum + s.duration_minutes,
    0
  );

  const maxViewMonth = 11;
  const maxViewYear = today.getFullYear() + 1;

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

  const daysOfWeek = [
    "Воскресенье",
    "Понедельник",
    "Вторник",
    "Среда",
    "Четверг",
    "Пятница",
    "Суббота",
  ];

  const resetBookingState = useCallback(() => {
    setSelectedDate(null);
    setSelectedTimeSlot(null);
    setSelectedServices([]);
    setStep(1);
    setCarType("");
  }, []);

  const fetchAvailableTimeSlots = useCallback(async (id) => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `http://localhost:5000/api/available-slots?box_id=${id}`
      );

      if (!response.ok) {
        throw new Error("Не удалось загрузить доступные временные слоты");
      }

      const data = await response.json();

      const formattedByDate = {};
      data.forEach((entry) => {
        formattedByDate[entry.date] = {
          boxId: id, 
          slots: entry.slots,
          slotInfo: entry.slotInfo || {},
        };
      });

      setAvailableDates(formattedByDate);
      setCurrentBoxId(id);

      if (Object.keys(formattedByDate).length === 0) {
        setError("Нет доступных временных слотов для выбранной автомойки.");
      }
    } catch (error) {
      console.error("Ошибка при загрузке слотов:", error);
      setError(
        "Не удалось загрузить доступные даты. Пожалуйста, попробуйте позже."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (boxId) {
      if (currentBoxId !== boxId) {
        fetchAvailableTimeSlots(boxId);
        
        setSelectedDate(null);
        setSelectedTimeSlot(null);
      }
    }
  }, [boxId, fetchAvailableTimeSlots, currentBoxId]);

  useEffect(() => {
    let timeoutId;
    if (error) {
      timeoutId = setTimeout(() => {
        setError(null);
      }, 5000);
    }
    return () => clearTimeout(timeoutId);
  }, [error]);

  const getDateString = (year, month, day) => {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-").map(Number);
    return `${String(day).padStart(2, "0")}.${String(month).padStart(
      2,
      "0"
    )}.${year}`;
  };

  const getFormattedSelectedDate = () => {
    if (!selectedDate) return "";

    const [year, month, day] = selectedDate.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    const dayOfWeek = daysOfWeek[date.getDay()];

    return `${dayOfWeek}, ${formatDate(selectedDate)}`;
  };

  const isDateAvailable = (dateStr) => {
    if (!dateStr) return false;

    const date = new Date(dateStr);
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    if (date < todayDate) return false;

    return (
      dateStr in availableDates && availableDates[dateStr]?.slots?.length > 0
    );
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleNext = () => {
    if (
      step === 2 &&
      selectedDate &&
      !availableDates[selectedDate]?.slots?.length
    ) {
      setError("Нет доступных временных слотов для выбранной даты.");
      return;
    }

    if (step === 2 && (!selectedDate || !selectedTimeSlot)) {
      setError("Пожалуйста, выберите дату и время.");
      return;
    }

    if (step === 3 && selectedServices.length === 0) {
      setError("Пожалуйста, выберите хотя бы одну услугу.");
      return;
    }

    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(Math.max(1, step - 1));
  };

  const selectDate = (dateStr) => {
    if (!isDateAvailable(dateStr)) return;

    setSelectedDate(dateStr);
    setSelectedTimeSlot(null);
  };

  const selectTimeSlot = (time) => {
    setSelectedTimeSlot(time);
  };

  const goToPrevMonth = () => {
    setCurrentMonth((prevMonth) => {
      if (prevMonth === 0) {
        setCurrentYear((prevYear) => prevYear - 1);
        return 11;
      }
      return prevMonth - 1;
    });
  };

  const goToNextMonth = () => {
    setCurrentMonth((prevMonth) => {
      if (prevMonth === 11) {
        if (currentYear < maxViewYear) {
          setCurrentYear((prevYear) => prevYear + 1);
          return 0;
        }
        return prevMonth;
      }
      return prevMonth + 1;
    });
  };

  const goToToday = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const day = today.getDate();

    const formattedDate = getDateString(year, month, day);

    setCurrentMonth(month);
    setCurrentYear(year);

    if (isDateAvailable(formattedDate)) {
      setSelectedDate(formattedDate);
      setSelectedTimeSlot(null);
    }
  };

  const toggleService = (serviceName) => {
    setSelectedServices((prev) =>
      prev.includes(serviceName)
        ? prev.filter((name) => name !== serviceName)
        : [...prev, serviceName]
    );
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
        boxId: boxId || wash.id,
        clientId,
        comments: formData.comments,
      };

      const response = await fetch("http://localhost:5000/api/book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Ошибка при создании бронирования");
      }

      setSuccessMessage(
        `Бронирование успешно создано! Номер брони: ${data.booking_id}`
      );
      setStep(5);
    } catch (error) {
      console.error("Error submitting booking:", error);
      setError(
        error.message ||
          "Произошла ошибка при бронировании. Пожалуйста, попробуйте снова."
      );
    } finally {
      setLoading(false);
    }
  };

  const isPrevMonthDisabled = () => {
    const today = new Date();
    return (
      currentYear < today.getFullYear() ||
      (currentYear === today.getFullYear() && currentMonth <= today.getMonth())
    );
  };

  const isNextMonthDisabled = () => {
    return (
      currentYear > maxViewYear ||
      (currentYear === maxViewYear && currentMonth >= maxViewMonth)
    );
  };

  const isTodayAvailable = () => {
    const today = new Date();
    const formattedDate = getDateString(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    return isDateAvailable(formattedDate);
  };

  const generateCalendar = () => {
    const calendarCells = [];
    const today = new Date();
    const todayStr = getDateString(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    const firstDay = new Date(currentYear, currentMonth, 1);
    let firstDayOfWeek = firstDay.getDay();
    firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    for (let i = 0; i < firstDayOfWeek; i++) {
      calendarCells.push(
        <div key={`empty-${i}`} className="day-button empty"></div>
      );
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = getDateString(currentYear, currentMonth, day);
      const currentDate = new Date(dateStr);
      const isToday = dateStr === todayStr;
      const isPast = currentDate < new Date(todayStr);
      const isAvailable = isDateAvailable(dateStr);

      calendarCells.push(
        <button
          key={`current-${day}`}
          className={`day-button ${isAvailable ? "available" : "unavailable"} ${
            isToday ? "today" : ""
          } ${selectedDate === dateStr ? "selected" : ""}`}
          onClick={isAvailable ? () => selectDate(dateStr) : undefined}
          disabled={!isAvailable || isPast}
        >
          {day}
          {isAvailable && renderSlotCount(dateStr)}
        </button>
      );
    }

    const totalCells = Math.ceil((firstDayOfWeek + daysInMonth) / 7) * 7;
    const emptyAfterCells = totalCells - (firstDayOfWeek + daysInMonth);

    for (let i = 0; i < emptyAfterCells; i++) {
      calendarCells.push(
        <div key={`empty-after-${i}`} className="day-button empty"></div>
      );
    }

    return calendarCells;
  };

  const renderSlotCount = (dateStr) => {
    if (!availableDates[dateStr]) return null;

    const dateData = availableDates[dateStr];
    let slotCount = 0;

    if (dateData.slotInfo && Object.keys(dateData.slotInfo).length > 0) {
      Object.values(dateData.slotInfo).forEach((info) => {
        const availableSlots = info.maxSlots - info.bookedSlots;
        slotCount += Math.max(0, availableSlots);
      });
    } else if (dateData.slots && dateData.slots.length > 0) {
      slotCount = dateData.slots.length;
    } else if (Array.isArray(dateData)) {
      slotCount = dateData.length;
    } else if (typeof dateData === "number") {
      slotCount = dateData;
    }

    return <span className="slot-count">{slotCount}</span>;
  };

  const renderTimeSlots = () => {
    if (!selectedDate) {
      return (
        <div className="no-slots-message">
          Сначала выберите дату в календаре
        </div>
      );
    }

    const dateData = availableDates[selectedDate];

    if (!dateData || !dateData.slots || dateData.slots.length === 0) {
      return (
        <div className="no-slots-message">
          Нет доступных слотов на выбранную дату
        </div>
      );
    }

    if (dateData.boxId && dateData.boxId !== boxId) {
      return (
        <div className="no-slots-message">
          Нет доступных слотов для этой автомойки
        </div>
      );
    }

    const sortedSlots = [...dateData.slots].sort((a, b) => {
      const [aHour, aMin] = a.split(":").map(Number);
      const [bHour, bMin] = b.split(":").map(Number);

      if (aHour !== bHour) return aHour - bHour;
      return aMin - bMin;
    });

    return sortedSlots.map((time, idx) => {
      const slotInfo = dateData.slotInfo?.[time];
      if (!slotInfo && dateData.slotInfo) return null;

      let maxSlots = 1;
      let bookedSlots = 0;
      let availableSlots = 1;

      if (slotInfo) {
        maxSlots = slotInfo.maxSlots || 1;
        bookedSlots = slotInfo.bookedSlots || 0;
        availableSlots = Math.max(0, maxSlots - bookedSlots);
      }

      const isDisabled = availableSlots <= 0;

      return (
        <div
          key={idx}
          className={`slot ${selectedTimeSlot === time ? "selected" : ""} ${
            isDisabled ? "disabled" : ""
          }`}
          onClick={!isDisabled ? () => selectTimeSlot(time) : undefined}
        >
          {time}
          {maxSlots > 1 && (
            <span className="slot-availability">
              {availableSlots}/{maxSlots}
            </span>
          )}
        </div>
      );
    });
  };

  if (loading && !Object.keys(availableDates).length) {
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
        <button className="close-btn" onClick={onClose} aria-label="Закрыть">
          ✕
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button
            className="error-close"
            onClick={() => setError(null)}
            aria-label="Закрыть"
          >
            ×
          </button>
        </div>
      )}

      {step === 1 && (
        <div className="group">
          <h3 className="section-title">Выбор типа автомобиля:</h3>
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
              className={`select-btn ${carType === type ? "selected" : ""}`}
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
          <h3 className="section-title">Выберите дату и время:</h3>

          <div className="calendar-container">
            <div className="calendar-header">
              <div className="month-nav">
                <button
                  className="nav-button"
                  onClick={goToPrevMonth}
                  disabled={isPrevMonthDisabled()}
                  aria-label="Предыдущий месяц"
                >
                  ←
                </button>
                <div className="month-name">{monthNames[currentMonth]}</div>
                <button
                  className="nav-button"
                  onClick={goToNextMonth}
                  disabled={isNextMonthDisabled()}
                  aria-label="Следующий месяц"
                >
                  →
                </button>
              </div>
              <button
                id="todayBtn"
                className="nav-button"
                onClick={goToToday}
                disabled={!isTodayAvailable()}
                aria-label="Сегодня"
              >
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

          <div className="navigation-buttons">
            <button
              className="next-btn"
              onClick={handleNext}
              disabled={!selectedDate || !selectedTimeSlot}
            >
              Далее
            </button>
            <button className="back-btn" onClick={handleBack}>
              Назад
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="group">
          <h3 className="section-title">Выберите услуги:</h3>
          <ul className="service-list">
            {services.length > 0 ? (
              services.map((service, i) => {
                const isSelected = selectedServices.includes(service.name);
                return (
                  <li
                    key={i}
                    className={`service-item ${isSelected ? "selected" : ""}`}
                    onClick={() => toggleService(service.name)}
                  >
                    <span className="checkbox">{isSelected ? "☑" : "☐"}</span>
                    <div className="service-details">
                      <span className="service-name">{service.name}</span>
                      <span className="service-price-time">
                        {service.price}₸ ({service.duration_minutes} мин.)
                      </span>
                    </div>
                  </li>
                );
              })
            ) : (
              <li className="no-services-message">
                Нет доступных услуг для выбора
              </li>
            )}
          </ul>

          {selectedServices.length > 0 && (
            <div className="summary">
              <p>
                <strong>Итог:</strong> {totalPrice}₸, {totalTime} мин.
              </p>
            </div>
          )}

          <div className="navigation-buttons">
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
              <span className="summary-label" id="label_services">
                Услуги:
              </span>
              <span>
                <ul className="services-list" id="list_services">
                  {selectedServices.map((service, index) => (
                    <li
                      key={`${service}-${index}`}
                      className="service-list-item"
                    >
                      {service}
                    </li>
                  ))}
                </ul>
              </span>
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
            <label htmlFor="comments">Комментарии (необязательно)</label>
            <textarea
              id="comments"
              rows="3"
              value={formData.comments}
              onChange={handleInputChange}
              placeholder="Дополнительная информация"
            ></textarea>
          </div>

          <div className="action-buttons">
            <button
              className="btn confirm"
              onClick={handleSubmit}
              disabled={loading}
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
          <button className="btn_close_book" onClick={onClose}>
            Закрыть
          </button>
        </div>
      )}
    </div>
  );
}