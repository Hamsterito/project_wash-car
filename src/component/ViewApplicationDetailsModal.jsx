import React from 'react';
import './CreateBusinessModal.css';

const fields = [
  { key: 'registration', label: 'Свидетельство о регистрации ИП или юр. лица', fileUrl: '/docs/registration.pdf' },
  { key: 'name', label: 'Название автомойки' },
  { key: 'address', label: 'Адрес (физическое местоположение)' },
  { key: 'region', label: 'Город и район' },
  { key: 'schedule', label: 'График работы' },
  { key: 'identity', label: 'Подтверждение личности / прав владения', fileUrl: '/docs/identity.pdf' },
  { key: 'photo', label: 'Фото автомойки, логотип', fileUrl: '/docs/photo.jpg' },
];

const ViewApplicationDetailsModal = ({ data = {}, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Данные заявки</h2>

        {fields.map((field) => (
          <label key={field.key}>
            {field.label}
            {field.fileUrl ? (
              <a href={field.fileUrl} target="_blank" rel="noopener noreferrer">Открыть файл</a>
            ) : (
              <div className="input-view">{data[field.key] || 'Нет данных'}</div>
            )}
          </label>
        ))}

        <div className="modal-buttons">
          <button className="btnq" onClick={onClose}>Закрыть</button>
        </div>
      </div>
    </div>
  );
};

export default ViewApplicationDetailsModal;
