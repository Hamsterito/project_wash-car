import React from 'react';
import defaultImage from '../assets/carwash.png';

export default function WashHistoryCard({ wash }) {
  const getStatusBadge = (status) => {
    const statusStyles = {
      'забронировано': { bg: '#ffc107', text: 'Забронировано' },
      'завершено': { bg: '#28a745', text: 'Завершено' },
      'отменено': { bg: '#dc3545', text: 'Отменено' },
      'свободно': { bg: '#6c757d', text: 'Свободно' }
    };
    
    const style = statusStyles[status] || { bg: '#6c757d', text: status };
    
    return (
      <span style={{ 
        backgroundColor: style.bg, 
        color: 'black', 
        padding: '7px 10px', 
        borderRadius: '12px', 
        fontSize: '14px',
        position: 'absolute',
        top: '10px',
        right: '10px'
      }}>
        {style.text}
      </span>
    );
  };

  return (
    <div
      className="history-card"
      style={{
        backgroundImage: `url(${wash.image || defaultImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative'
      }}
    >
      {getStatusBadge(wash.status)}
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