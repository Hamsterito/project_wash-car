import React from 'react';
import './CreateBusinessModal.css';

const fields = [
  { key: 'car_wash_name', label: 'Название автомойки' },
  { key: 'address', label: 'Адрес (физическое местоположение)' },
  { key: 'city_district', label: 'Город и район' },
  { key: 'ownership_proof', label: 'Подтверждение личности / прав владения' },
  { key: 'registration_certificate', label: 'Свидетельство о регистрации ИП или юр. лица' },
  { key: 'car_wash_logo', label: 'Фото автомойки, логотип' },
];

const ViewApplicationDetailsModal = ({ data = {}, onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Данные заявки</h2>

        {fields.map((field) => (
          <div key={field.key} className="field-block">
            <div className="field-label-inline">
              <strong>{field.label}</strong>
            </div>

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
        ))}

        <div className="modal-buttons">
          <button className="btnq close" onClick={onClose}>Закрыть</button>
        </div>
      </div>
    </div>
  );
};

export default ViewApplicationDetailsModal;
