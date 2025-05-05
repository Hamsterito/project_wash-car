import React, { useState } from 'react';
import './CreateBusinessModal.css';

export default function CreateBusinessModal({ onClose }) {
  const [formData, setFormData] = useState({
    registrationCertificate: null,
    carWashName: "",
    address: "",
    cityDistrict: "",
    ownershipProof: null,
    logo: null,
  });

  const [message, setMessage] = useState("");

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
      formData.ownershipProof &&
      formData.logo
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) {
      setMessage("Пожалуйста, заполните все поля!");
      return;
    }

    const formDataToSend = new FormData();
    const clientId = localStorage.getItem("client_id");

    formDataToSend.append("client_id", clientId);
    formDataToSend.append("carWashName", formData.carWashName);
    formDataToSend.append("address", formData.address);
    formDataToSend.append("cityDistrict", formData.cityDistrict);
    formDataToSend.append("registrationCertificate", formData.registrationCertificate);
    formDataToSend.append("ownershipProof", formData.ownershipProof);
    formDataToSend.append("car_wash_logo", formData.logo);

    try {
      const response = await fetch("http://localhost:5000/api/create-business-account", {
        method: "POST",
        body: formDataToSend,
      });

      const data = await response.json();
      if (data.success) {
        setMessage("Бизнес-аккаунт успешно создан!");
        setTimeout(() => {
          onClose();
          window.location.reload();
        }, 10);
      } else {
        setMessage(`Ошибка: ${data.error}`);
      }
    } catch (error) {
      console.error("Ошибка при создании бизнес-аккаунта:", error);
      setMessage("Произошла ошибка при создании бизнес-аккаунта");
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-wrapper" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">
          <h2>Создать бизнес аккаунт</h2>
          {message && <p className="status-message">{message}</p>}
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

            <label className="file-upload">
              Свидетельство о регистрации ИП или юр. лица
              <div className="custom-file-input">
                <span>{formData.registrationCertificate?.name || "Выберите файл"}</span>
                <input type="file" name="registrationCertificate" onChange={handleChange} />
              </div>
            </label>

            <label className="file-upload">
              Подтверждение личности / прав владения
              <div className="custom-file-input">
                <span>{formData.ownershipProof?.name || "Выберите файл"}</span>
                <input type="file" name="ownershipProof" onChange={handleChange} />
              </div>
            </label>

            <label className="file-upload">
              Фото автомойки, обложка
              <div className="custom-file-input">
                <span>{formData.logo?.name || "Выберите файл"}</span>
                <input type="file" name="logo" onChange={handleChange} />
              </div>
            </label>

            <div className="modal-buttons">
              <button type="submit" className="btnq create" disabled={!isFormValid()}>
                Оставить заявку
              </button>
            </div>
          </form>
        </div>

        <div className="preview-card">
          <p className="preview-label">Пример:</p>
          <div className="carwash-card" id='carwash_example'>
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
