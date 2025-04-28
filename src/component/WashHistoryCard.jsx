import React from 'react';
import defaultImage from '../assets/carwash.png';

export default function WashHistoryCard({ wash }) {
  return (
    <div
      className="history-card"
      style={{
        backgroundImage: `url(${wash.image || defaultImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="card-header">
        {wash.name}<br />{wash.street}
      </div>
      <div className="card-body">
        <p>Назначенное время: {wash.appointmentTime}</p>
        <p>Вид транспорта: {wash.vehicleType}</p>
        <p>Выбранные услуги: {wash.selectedServices.join(', ')}</p>
        <p>Цена: {wash.price}</p>
      </div>
    </div>
  );
}
