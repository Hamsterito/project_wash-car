import React, { useState } from 'react';
import './CarWashesList.css';
import { useNavigate } from 'react-router-dom';

const CarWashesList = () => {
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const carWashes = [
    { name: 'Название автомойки 1', address: 'Адрес автомойки 1', image: 'src/assets/carwash.png' },
    { name: 'Название автомойки 2', address: 'Адрес автомойки 2', image: 'src/assets/carwash.png' },
    { name: 'Название автомойки 3', address: 'Адрес автомойки 3', image: 'src/assets/carwash.png' },
  ];

  const handleCreateCarWash = () => {
    setShowCreateModal(true);
  };

  const closeModal = () => {
    setShowCreateModal(false);
  };

  return (
    <div className="car-wash-list">
      <h1 className="car-wash-list-title">Список автомоек</h1>
      <div className="car-wash-list-washes">
        {carWashes.map((carWash, index) => (
          <button
            key={index}
            className="car-wash-list-card"
            onClick={() => navigate('/list-booking', { state: { carWashName: carWash.name } })}
          >
            <div className="car-wash-list-info">
              <h2 className="car-wash-list-name">{carWash.name}</h2>
              <p className="car-wash-list-address">{carWash.address}</p>
            </div>
            <div className="car-wash-list-image">
              <img src={carWash.image} alt={carWash.name} />
            </div>
          </button>
        ))}
      </div>
      <button className="car-wash-list-create-button" onClick={handleCreateCarWash}>
        Создать!
      </button>

      {showCreateModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <button className="back-button" onClick={closeModal}>
                ←
              </button>
            </div>
            <div className="modal-image">
              <img src="src/assets/carwash.png" alt="Автомойка" />
              <button className="upload-photo-button">Загрузить фото</button>
            </div>
            <form>
              <label>
                Название автомойки:
                <input type="text" name="name" />
              </label>
              <label>
                График работы:
                <input type="text" name="schedule" />
              </label>
              <label>
                Адрес:
                <input type="text" name="address" />
              </label>
              <label>
                Мест на автомойке:
                <input type="number" name="slots" min="1" />
              </label>
              <label>
                Менеджеры:
                <select name="managers">
                  <option>ФИО</option>
                </select>
                <button type="button" className="add-button">+</button>
              </label>
              <label>
                Выберите услуги:
                <select name="services">
                  <option>Добавить услугу</option>
                </select>
                <button type="button" className="add-button">+</button>
              </label>
              <button type="submit" className="submit-button">Отправить запрос</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarWashesList;