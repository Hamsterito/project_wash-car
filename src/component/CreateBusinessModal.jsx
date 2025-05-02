import React, { useState } from 'react';
import './CreateBusinessModal.css';

export default function CreateBusinessModal({ onClose, onApprove }) {
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
    if (files && files.length > 0) {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const isFormValid = () => {
    return (
      formData.registrationCertificate &&
      formData.carWashName.trim() &&
      formData.address.trim() &&
      formData.cityDistrict.trim() &&
      formData.workingHours.trim() &&
      formData.ownershipProof &&
      formData.logo
    );
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isFormValid()) {
      alert('Пожалуйста, заполните все поля!');
      return;
    }
  
    console.log('Отправка данных:', formData);
    onClose();
    onApprove();
  };
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Создать бизнес аккаунт</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Свидетельство о регистрации ИП или юр. лица
            <input type="file" name="registrationCertificate" onChange={handleChange} />
          </label>

          <label>
            Название автомойки
            <input type="text" name="carWashName" value={formData.carWashName} onChange={handleChange} />
          </label>

          <label>
            Адрес (физическое местоположение)
            <input type="text" name="address" value={formData.address} onChange={handleChange} />
          </label>

          <label>
            Город и район
            <input type="text" name="cityDistrict" value={formData.cityDistrict} onChange={handleChange} />
          </label>

          <label>
            График работы
            <input type="text" name="workingHours" value={formData.workingHours} onChange={handleChange} />
          </label>

          <label>
            Подтверждение личности / прав владения
            <input type="file" name="ownershipProof" onChange={handleChange} />
          </label>

          <label>
            Фото автомойки, логотип
            <input type="file" name="logo" onChange={handleChange} />
          </label>

          <div className="modal-buttons">
            <button type="button" className="btnq decline" onClick={onClose}>Отклонить</button>
            <button type="submit" className="btnq approve" disabled={!isFormValid()}>Одобрить</button>
          </div>
        </form>
      </div>
    </div>
  );
}
