import React, { useState } from 'react';
import './CarWashEditModal.css';

const CarWashEditModal = ({ data, onClose, onSave, isCreating = false }) => {
  const [form, setForm] = useState({ ...data });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const updateManager = (index, field, value) => {
    const updated = [...form.managers];
    updated[index][field] = value;
    setForm({ ...form, managers: updated });
  };

  const updateService = (index, field, value) => {
    const updated = [...form.services];
    updated[index][field] = value;
    setForm({ ...form, services: updated });
  };

  return (
    <>
      <div className="modal-backdrop" onClick={onClose}></div>
      <div className="carwash-edit-modal">
        <div className="photo-section">
          <img src={form.image} alt="Фото автомойки" />
          <button className="upload-button">Загрузить фото</button>
        </div>

        <label>Название автомойки</label>
        <input name="name" value={form.name} onChange={handleChange} />

        <label>График работы</label>
        <input name="schedule" value={form.schedule} onChange={handleChange} />

        <label>Адрес</label>
        <input name="address" value={form.address} onChange={handleChange} />

        <label>Мест на автомойке</label>
        <input type="number" name="slots" value={form.slots} onChange={handleChange} />

        <label>Менеджеры</label>
        <div className="manager-list">
          {form.managers.map((m, i) => (
            <div key={i}>
              <input
                placeholder="Имя"
                value={m.name}
                onChange={e => updateManager(i, 'name', e.target.value)}
                readOnly={m.locked}
              />
              <input
                placeholder="Контакт"
                value={m.contact}
                onChange={e => updateManager(i, 'contact', e.target.value)}
                readOnly={m.locked}
              />
              <button onClick={() => {
                const updated = [...form.managers];
                updated.splice(i, 1);
                setForm({ ...form, managers: updated });
              }}>–</button>
              {!m.locked && (
                <button onClick={() => {
                  const updated = [...form.managers];
                  updated[i].locked = true;
                  setForm({ ...form, managers: updated });
                }}>✓</button>
              )}
            </div>
          ))}
          <button onClick={() => setForm({
            ...form,
            managers: [...form.managers, { name: '', contact: '', locked: false }]
          })}>
            Добавить менеджера
          </button>
        </div>

        <label>Услуги</label>
        <div className="services-list">
          {form.services.map((s, i) => (
            <div key={i}>
              <input
                placeholder="Название услуги"
                value={s.name}
                onChange={e => updateService(i, 'name', e.target.value)}
                readOnly={s.locked}
              />
              <input
                type="number"
                placeholder="Цена"
                value={s.price}
                onChange={e => updateService(i, 'price', e.target.value)}
                readOnly={s.locked}
              />
              <input
                type="number"
                placeholder="Время (мин)"
                value={s.duration}
                onChange={e => updateService(i, 'duration', e.target.value)}
                readOnly={s.locked}
              />
              <button onClick={() => {
                const updated = [...form.services];
                updated.splice(i, 1);
                setForm({ ...form, services: updated });
              }}>–</button>
              {!s.locked && (
                <button onClick={() => {
                  const updated = [...form.services];
                  updated[i].locked = true;
                  setForm({ ...form, services: updated });
                }}>✓</button>
              )}
            </div>
          ))}
          <button onClick={() => setForm({
            ...form,
            services: [...form.services, { name: '', price: '', duration: '', locked: false }]
          })}>
            Добавить услугу
          </button>
        </div>

        <button className="save-button" onClick={() => onSave(form)}>
          {isCreating ? "Создать" : "Изменить"}
        </button>
      </div>
    </>
  );
};

export default CarWashEditModal;