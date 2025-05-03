import React, { useState } from 'react';
import './CreateBusinessModal.css';

function CarWashCard({ name, address, image }) {
  return (
    <div className="carwash-card">
      <img src={image} alt="Автомойка" className="carwash-image" />
      <div className="carwash-info">
        <h3>{name || 'Название автомойки'}</h3>
        <p>Адрес: {address || 'Адрес автомойки'}</p>
        <button className="carwash-button">Забронировать</button>
      </div>
    </div>
  );
}

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) {
      alert('Пожалуйста, заполните все поля!');
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("clientId", formData.clientId);
    formDataToSend.append("carWashName", formData.carWashName);
    formDataToSend.append("address", formData.address);
    formDataToSend.append("cityDistrict", formData.cityDistrict);
    formDataToSend.append("workingHours", formData.workingHours);
    formDataToSend.append("registrationCertificate", formData.registrationCertificate);
    formDataToSend.append("ownershipProof", formData.ownershipProof);
    formDataToSend.append("logo", formData.logo);

    try {
      const response = await fetch("http://localhost:5000/api/create-business-account", {
        method: "POST",
        body: formDataToSend,
      });

      const data = await response.json();
      if (data.success) {
        alert("Бизнес-аккаунт успешно создан!");
        onClose();
      } else {
        alert(`Ошибка: ${data.error}`);
      }
    } catch (error) {
      console.error("Ошибка при создании бизнес-аккаунта:", error);
      alert("Произошла ошибка при создании бизнес-аккаунта");
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-wrapper" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">
          <h2>Создать бизнес аккаунт</h2>
          <form onSubmit={handleSubmit}>

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
              Свидетельство о регистрации ИП или юр. лица
              <input type="file" name="registrationCertificate" onChange={handleChange} />
            </label>

            <label>
              Подтверждение личности / прав владения
              <input type="file" name="ownershipProof" onChange={handleChange} />
            </label>

            <label>
              Фото автомойки, обложка
              <input type="file" name="logo" onChange={handleChange} />
            </label>

            <div className="modal-buttons">
              <button type="submit" className="btnq create" disabled={!isFormValid()}>Оставить заявку</button>
            </div>
          </form>
        </div>

        <div className="preview-card">
          <p className="preview-label">Пример:</p>
          <div className="carwash-card">
            {formData.logo && (
              <img
                src={URL.createObjectURL(formData.logo)}
                alt="Обложка автомойки"
                className="background-image"
              />
            )}
            <div className="overlay" />
            <div className="carwash-content">
              <h3>{formData.carWashName || 'Название автомойки'}</h3>
              <p>{formData.address || 'Адрес будет здесь'}</p>
              <button className="carwash-button" disabled>Забронировать</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
