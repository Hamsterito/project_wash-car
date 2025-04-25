import './Profil.css';
import React from 'react';
import { useNavigate } from 'react-router-dom';

const ProfileDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="dashboard">
      <h1 className="title-profile">Личный кабинет</h1>
      <div className="status-photo-section">
        <div className="form-section">
          <input type="text" placeholder="Имя" />
          <input type="text" placeholder="Фамилия" />
          <input type="text" placeholder="Номер" />
          <input type="email" placeholder="email" />
        </div>
        <div className="profile-photo">
          <p className="status">Статус: пользователь</p>
          <img src="src\assets\fotoprofile.png" alt="Профиль" />
          <button className="change-photo">Сменить фото профиля</button>
          <button className="logout">log out</button>
        </div>
      </div>
      <div className="history">
        <p className="history-title">История:</p>
        <div className="history-cards">
          <div className="card-history"></div>
          <div className="card-history"></div>
          <div className="card-history"></div>
        </div>
      </div>
      <div className="business-offer">
        <p>Хочешь открыть свою автомойку?<br/>Создай <span className="highlight">бизнес аккаунт!</span></p>
        <button className="create-btn" onClick={() => navigate('/list-booking')}>Создать!</button>
      </div>
    </div>
  );
};

export default ProfileDashboard;