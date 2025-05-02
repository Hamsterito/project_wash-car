import React, { useState } from 'react';
import './CreateBusinessModal.css'

const fields = [
  { key: 'registration', label: 'Свидетельство о регистрации ИП или юр. лица', fileUrl: '/docs/registration.pdf' },
  { key: 'name', label: 'Название автомойки' },
  { key: 'address', label: 'Адрес (физическое местоположение)' },
  { key: 'region', label: 'Город и район' },
  { key: 'schedule', label: 'График работы' },
  { key: 'identity', label: 'Подтверждение личности / прав владения', fileUrl: '/docs/identity.pdf' },
  { key: 'photo', label: 'Фото автомойки, логотип', fileUrl: '/docs/photo.jpg' },
];

const ViewApplicationModal = ({ data = {}, onClose, onReject, onApprove }) => {
  const [checked, setChecked] = useState({});

  const handleToggle = (key) => {
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isAllChecked = fields.every((field) => checked[field.key]);

  const handleReject = () => {
    const unverified = fields
      .filter((field) => !checked[field.key])
      .map((field) => field.label);
    onReject(unverified);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Проверка заявки</h2>

        {fields.map((field) => (
          <label key={field.key}>
            {field.label}
            {field.fileUrl ? (
              <a href={field.fileUrl} target="_blank" rel="noopener noreferrer">Открыть файл</a>
            ) : (
              <div className="input-view">{data[field.key] || 'Инфа'}</div>
            )}
            <input
              type="checkbox"
              checked={!!checked[field.key]}
              onChange={() => handleToggle(field.key)}
            />
          </label>
        ))}

        <div className="modal-buttons">
          <button className="btnq decline" onClick={handleReject}>Отклонить</button>
          <button className="btnq approve" onClick={onApprove} disabled={!isAllChecked}>Одобрить</button>
        </div>
      </div>
    </div>
  );
};

export default ViewApplicationModal;
