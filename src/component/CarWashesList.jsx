import React from 'react';
import './CarWashesList.css';
import { useNavigate } from 'react-router-dom';

const CarWashesList = () => {
  const navigate = useNavigate();

  const carWashes = [
    { name: 'Название автомойки 1', address: 'Адрес автомойки 1', image: 'src/assets/carwash.png' },
    { name: 'Название автомойки 2', address: 'Адрес автомойки 2', image: 'src/assets/carwash.png' },
    { name: 'Название автомойки 3', address: 'Адрес автомойки 3', image: 'src/assets/carwash.png' },
  ];

  const handleNavigate = (carWashName) => {
    navigate('/list-booking', { state: { carWashName } });
  };

  return (
    <div className="car-wash-list">
      <h1 className="car-wash-list-title">Список автомоек</h1>
      <div className="car-wash-list-washes">
        {carWashes.map((carWash, index) => (
          <button
            key={index}
            className="car-wash-list-card"
            onClick={() => handleNavigate(carWash.name)}
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
      <button className="car-wash-list-create-button">Создать!</button>
    </div>
  );
};

export default CarWashesList;