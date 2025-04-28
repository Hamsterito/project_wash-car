import React, { useState } from 'react';
import './CreateBusinessModal.css'; // сделаем стили отдельным файлом

export default function CreateBusinessModal({ onClose }) {
  const [formData, setFormData] = useState({
    registrationCertificate: null,
    carWashName: '',
    address: '',
    cityDistrict: '',
    workingHours: '',
    ownershipProof: null,
    logo: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Отправка данных:', formData);
    //надо подсоеденить к серверу, но мне лень
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Создать бизнес аккаунт</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Свидетельство о регистрации ИП/Юр.лица:
            <input type="file" name="registrationCertificate" onChange={handleChange} />
          </label>

          <label>
            Название автомойки:
            <input type="text" name="carWashName" value={formData.carWashName} onChange={handleChange} />
          </label>

          <label>
            Адрес (физическое местоположение):
            <input type="text" name="address" value={formData.address} onChange={handleChange} />
          </label>

          <label>
            Город и район:
            <input type="text" name="cityDistrict" value={formData.cityDistrict} onChange={handleChange} />
          </label>

          <label>
            График работы:
            <input type="text" name="workingHours" value={formData.workingHours} onChange={handleChange} />
          </label>

          <label>
            Подтверждение личности/прав владения:
            <input type="file" name="ownershipProof" onChange={handleChange} />
          </label>

          <label>
            Фото автомойки/логотип:
            <input type="file" name="logo" onChange={handleChange} />
          </label>

          <div className="modal-buttons">
            <button type="submit" className="btnq save">Создать</button>
            <button type="button" className="btnq cancel" onClick={onClose}>Отмена</button>
          </div>
        </form>
      </div>
    </div>
  );
}
