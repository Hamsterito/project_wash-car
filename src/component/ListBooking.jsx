import React, { useState } from 'react';
import './ListBooking.css';

const ListBooking = () => {
  const [selectedClient, setSelectedClient] = useState(null);

  const bookings = [
    { time: '10:00 - 11:00', clients: Array(5).fill({ name: 'Кабраков Мансур', phone: '+7(777)777 77 77', services: 'Мойка кузова' }) },
    { time: '11:00 - 12:00', clients: Array(5).fill({ name: 'Кабраков Мансур', phone: '+7(777)777 77 77', services: 'Химчистка салона' }) },
    { time: '12:00 - 13:00', clients: Array(5).fill({ name: 'Кабраков Мансур', phone: '+7(777)777 77 77', services: 'Полировка' }) },
  ];

  const handleClientClick = (client, time) => {
    setSelectedClient({ ...client, time });
  };

  const closeModal = () => {
    setSelectedClient(null);
  };

  return (
    <div className="list-booking">
      <h1 className="car-wash-name">Название автомойки</h1>
      {bookings.map((booking, index) => (
        <div key={index} className="booking-section">
          <h2 className="time-slot">{booking.time}</h2>
          {booking.clients.map((client, idx) => (
            <div
              key={idx}
              className="booking-card"
              onClick={() => handleClientClick(client, booking.time)}
            >
              <span className="client-name">{client.name}</span>
              <span className="client-phone">{client.phone}</span>
            </div>
          ))}
        </div>
      ))}

      {selectedClient && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Информация о клиенте</h2>
            <p><strong>ФИО:</strong> {selectedClient.name}</p>
            <p><strong>Номер:</strong> {selectedClient.phone}</p>
            <p><strong>Время:</strong> {selectedClient.time}</p>
            <p><strong>Услуги:</strong> {selectedClient.services}</p>
            <button className="close-modal" onClick={closeModal}>Закрыть</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListBooking;