import React, { useState } from 'react';
import './CreateBusinessModal.css';

const fields = [
  { key: 'car_wash_name', label: 'Название автомойки' },
  { key: 'address', label: 'Адрес (физическое местоположение)' },
  { key: 'city_district', label: 'Город и район' },
  { key: 'registration_certificate', label: 'Свидетельство о регистрации ИП или юр. лица' },
  { key: 'ownership_proof', label: 'Подтверждение личности / прав владения' },
  { key: 'car_wash_logo', label: 'Фото автомойки, логотип' },
];

const ViewApplicationModal = ({ data = {}, onClose, onApprove, onReject }) => {
  const [checked, setChecked] = useState({});

  const handleToggle = (key) => {
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isAllChecked = fields.every((field) => checked[field.key]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Проверка заявки</h2>

        {fields.map((field) => (
          <div key={field.key} className="field-label checkbox-container">
            <div className="field-text">
              <span>{field.label}</span>
              {data[field.key] ? (
                field.key.includes('certificate') || field.key.includes('proof') || field.key.includes('logo') ? (
                  <a
                    href={`/${data[field.key]}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="view-file-link"
                  >
                    Смотреть файл
                  </a>
                ) : (
                  <div className="input-view">{data[field.key]}</div>
                )
              ) : (
                <div className="input-view">Данные отсутствуют</div>
              )}
            </div>
            <input
              type="checkbox"
              className="styled-checkbox"
              checked={!!checked[field.key]}
              onChange={() => handleToggle(field.key)}
            />
          </div>
        ))}

        <div className="modal-buttons">
          <button className="btnq decline" onClick={() => onReject(data.request_id)}>Отклонить</button>
          <button className="btnq approve" onClick={() => onApprove(data.request_id)} disabled={!isAllChecked}>Одобрить</button>
        </div>
      </div>
    </div>
  );
};

export default ViewApplicationModal;
