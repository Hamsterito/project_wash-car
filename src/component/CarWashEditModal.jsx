import React, { useState, useRef } from "react";
import {
  MapPin,
  Users,
  Trash2,
  Plus,
  ChevronDown,
  Camera,
  Clock,
  CheckSquare,
  Square,
} from "lucide-react";
import "./CarWashEditModal.css";

const CarWashEditModal = ({ data, onClose, onSave, isCreating = false }) => {
  const [form, setForm] = useState({
    ...data,
    services: data.services || [],
    managers: data.managers || [],
    schedule: data.schedule || {},
    workDays: data.workDays || [],
    image: data.image || null,
  });
  const [expandedDay, setExpandedDay] = useState(null);
  const [previewImage, setPreviewImage] = useState(data.image || null);
  const fileInputRef = useRef(null);

  const daysOfWeek = [
    { id: 0, name: "Понедельник" },
    { id: 1, name: "Вторник" },
    { id: 2, name: "Среда" },
    { id: 3, name: "Четверг" },
    { id: 4, name: "Пятница" },
    { id: 5, name: "Суббота" },
    { id: 6, name: "Воскресенье" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleTimeChange = (day, field, value) => {
    setForm((prev) => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [day]: {
          ...prev.schedule[day],
          [field]: value,
        },
      },
    }));
  };

  const toggleWorkDay = (dayId) => {
    setForm((prev) => {
      const workDays = [...(prev.workDays || [])];

      if (workDays.includes(dayId)) {
        return {
          ...prev,
          workDays: workDays.filter((id) => id !== dayId),
          schedule: Object.fromEntries(
            Object.entries(prev.schedule).filter(
              ([key]) => Number(key) !== dayId
            )
          ),
        };
      } else {
        return {
          ...prev,
          workDays: [...workDays, dayId].sort(),
        };
      }
    });
  };

  const addManager = () => {
    setForm((prev) => ({
      ...prev,
      managers: [...prev.managers, { contact: "" }],
    }));
  };

  const removeManager = (index) => {
    setForm((prev) => ({
      ...prev,
      managers: prev.managers.filter((_, i) => i !== index),
    }));
  };

  const addService = () => {
    setForm((prev) => ({
      ...prev,
      services: [...prev.services, { name: "", price: "", duration: 30 }],
    }));
  };

  const removeService = (index) => {
    setForm((prev) => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index),
    }));
  };

  const toggleDay = (dayId) => {
    setExpandedDay(expandedDay === dayId ? null : dayId);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImage(reader.result);
        setForm((prev) => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  // Улучшенный компонент TimePicker
  const ModernTimePicker = ({ value, onChange, placeholder }) => {
    // Предопределенные временные интервалы с шагом 30 минут
    const timeOptions = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let min = 0; min < 60; min += 30) {
        const formattedHour = hour.toString().padStart(2, "0");
        const formattedMin = min.toString().padStart(2, "0");
        timeOptions.push(`${formattedHour}:${formattedMin}`);
      }
    }

    const [isOpen, setIsOpen] = useState(false);

    return (
      <div className="modern-time-picker">
        <div className="time-display" onClick={() => setIsOpen(!isOpen)}>
          {value || placeholder}
          <Clock size={16} className="time-icon" />
        </div>

        {isOpen && (
          <div className="time-dropdown">
            {timeOptions.map((time) => (
              <div
                key={time}
                className={`time-option ${value === time ? "selected" : ""}`}
                onClick={() => {
                  onChange(time);
                  setIsOpen(false);
                }}
              >
                {time}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const DurationInput = ({ value, onChange }) => {
    const handleDurationChange = (e) => {
      const inputValue = e.target.value;

      if (inputValue === "" || /^\d+$/.test(inputValue)) {
        onChange(inputValue === "" ? "" : parseInt(inputValue, 10));
      }
    };

    return (
      <div className="duration-container">
        <input
          type="text"
          value={value || ""}
          onChange={handleDurationChange}
          className="duration-input"
          min="15"
          step="15"
        />
        <span className="input-suffix">мин</span>
      </div>
    );
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-header">
          {isCreating ? "Создание автомойки" : "Редактирование автомойки"}
        </h2>

        <div className="form-section">
          <div className="image-upload-container">
            <div className="image-upload-area" onClick={triggerFileInput}>
              {previewImage && (
                <img
                  src={previewImage}
                  alt="Preview"
                  className="preview-image"
                />
              )}
              <div className="upload-placeholder always-visible">
                <Camera size={36} />
                <span className="upload-text">Загрузка фотографии</span>
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              className="file-input"
              accept="image/*"
            />
          </div>

          <label className="section-title-edit">Название автомойки</label>
          <input
            name="name"
            value={form.name || ""}
            onChange={handleChange}
            className="input-field"
            placeholder="Введите название"
          />
        </div>

        <div className="form-section">
          <label className="section-title-edit">
            <Clock size={18} className="icon" />
            Рабочие дни
          </label>
          <div className="work-days-grid">
            {daysOfWeek.map((day) => (
              <div key={`work-day-${day.id}`} className="work-day-item">
                <button
                  type="button"
                  onClick={() => toggleWorkDay(day.id)}
                  className={`day-toggle-button ${
                    form.workDays?.includes(day.id) ? "active" : ""
                  }`}
                >
                  {form.workDays?.includes(day.id) ? (
                    <CheckSquare size={18} className="checkbox-icon checked" />
                  ) : (
                    <Square size={18} className="checkbox-icon" />
                  )}
                  <span>{day.name}</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="form-section">
          <label className="section-title-edit">
            <Clock size={18} className="icon" />
            График работы
          </label>
          <div className="schedule-container">
            {daysOfWeek
              .filter((day) => form.workDays?.includes(day.id))
              .map((day) => (
                <div key={day.id} className="schedule-day">
                  <div className="day-header" onClick={() => toggleDay(day.id)}>
                    <span>{day.name}</span>
                    <ChevronDown
                      size={18}
                      className={`chevron ${
                        expandedDay === day.id ? "chevron-rotated" : ""
                      }`}
                    />
                  </div>

                  {expandedDay === day.id && (
                    <div className="day-content">
                      <div className="time-range-container">
                        <div className="time-field-container">
                          <label className="time-label">C</label>
                          <ModernTimePicker
                            value={form.schedule[day.id]?.from || ""}
                            onChange={(value) =>
                              handleTimeChange(day.id, "from", value)
                            }
                            placeholder="Начало"
                          />
                        </div>
                        <div className="time-field-container">
                          <label className="time-label">До</label>
                          <ModernTimePicker
                            value={form.schedule[day.id]?.to || ""}
                            onChange={(value) =>
                              handleTimeChange(day.id, "to", value)
                            }
                            placeholder="Окончание"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
          </div>
          {!form.workDays?.length && (
            <div className="no-workdays-message">
              Выберите рабочие дни выше для настройки графика работы
            </div>
          )}
        </div>

        <div className="form-section">
          <label className="section-title-edit">
            <MapPin size={18} className="icon" />
            Адрес
          </label>
          <input
            name="address"
            value={form.address || ""}
            onChange={handleChange}
            className="input-field"
            placeholder="Введите адрес"
          />
        </div>

        <div className="form-section">
          <label className="section-title-edit">
            <Users size={18} className="icon" />
            Мест на автомойке
          </label>
          <div className="number-input-container">
            <input
              type="number"
              name="slots"
              min="1"
              value={form.slots || "1"}
              onChange={handleChange}
              className="input-field"
            />
          </div>
        </div>

        <div className="form-section">
          <label className="section-title-edit">Контакты менеджеров</label>
          <div className="managers-list">
            {form.managers.map((manager, index) => (
              <div key={index} className="manager-item">
                <input
                  value={manager.contact}
                  onChange={(e) => {
                    const updated = [...form.managers];
                    updated[index].contact = e.target.value;
                    setForm((prev) => ({ ...prev, managers: updated }));
                  }}
                  className="input-field"
                  placeholder="Email или телефон"
                />
                <button
                  className="delete-button"
                  onClick={() => removeManager(index)}
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
          <button className="add-button" onClick={addManager}>
            <Plus size={18} className="icon" />
            Добавить контакт
          </button>
        </div>

        <div className="form-section">
          <label className="section-title-edit">Услуги</label>
          <div className="services-list">
            {form.services.map((service, index) => (
              <div key={index} className="service-item-simple">
                <input
                  value={service.name}
                  onChange={(e) => {
                    const updated = [...form.services];
                    updated[index].name = e.target.value;
                    setForm((prev) => ({ ...prev, services: updated }));
                  }}
                  className="input-field"
                  placeholder="Название услуги"
                />
                <input
                  value={service.price}
                  onChange={(e) => {
                    const updated = [...form.services];
                    updated[index].price = e.target.value;
                    setForm((prev) => ({ ...prev, services: updated }));
                  }}
                  className="input-field"
                  placeholder="Цена (тг)"
                />
                <input
                  value={service.duration}
                  onChange={(e) => {
                    const updated = [...form.services];
                    updated[index].duration = e.target.value;
                    setForm((prev) => ({ ...prev, services: updated }));
                  }}
                  className="input-field"
                  placeholder="Длительность (мин)"
                />
              </div>
            ))}
          </div>
          <button className="add-button" onClick={addService}>
            <Plus size={18} className="icon" />
            Добавить услугу
          </button>
        </div>

        <div className="button-group">
          <button className="cancel-button" onClick={onClose}>
            Отмена
          </button>
          <button className="submit-button" onClick={() => onSave(form)}>
            {isCreating ? "Создать" : "Сохранить"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CarWashEditModal;
