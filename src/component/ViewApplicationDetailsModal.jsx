import React from 'react';
import './CreateBusinessModal.css';

const fields = [
  { key: 'registration_certificate', label: 'Свидетельство о регистрации ИП или юр. лица' },
  { key: 'car_wash_name', label: 'Название автомойки' },
  { key: 'address', label: 'Адрес (физическое местоположение)' },
  { key: 'city_district', label: 'Город и район' },
  { key: 'working_hours', label: 'График работы' },
  { key: 'ownership_proof', label: 'Подтверждение личности / прав владения' },
  { key: 'car_wash_logo', label: 'Фото автомойки, логотип' },
];

const ViewApplicationDetailsModal = ({ data = {}, onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Данные заявки</h2>

        {fields.map((field) => (
          <label key={field.key} className="field-label">
            {field.label}
            {data[field.key] ? (
              field.key.includes('certificate') || field.key.includes('proof') || field.key.includes('logo') ? (
                <a href={`/${data[field.key]}`} target="_blank" rel="noopener noreferrer">Открыть файл</a>
              ) : (
                <div className="input-view">{data[field.key]}</div>
              )
            ) : (
              <div className="input-view">Данные отсутствуют</div>
            )}
          </label>
        ))}

        <div className="modal-buttons">
          <button className="btnq close" onClick={onClose}>Закрыть</button>
        </div>
      </div>
    </div>
  );
};

export default ViewApplicationDetailsModal;
