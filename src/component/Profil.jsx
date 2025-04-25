import React, { useState } from 'react';
import './Profil.css';

export default function ProfilePage() {
  const [avatar, setAvatar] = useState('https://via.placeholder.com/150');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setAvatar(imageUrl);
    }
  };

  return (
    <div className="profile-container">
      <h1 className="profile-title">Личный кабинет</h1>

      <div className="profile-content">
        <div className="profile-info">
          <div className="form-group">
            <input type="text" placeholder="Имя" className="input" />
            <input type="text" placeholder="Фамилия" className="input" />
            <input type="text" placeholder="Номер" className="input" />
            <input type="email" placeholder="Email" className="input" />
          </div>
        </div>

        <div className="profile-card">
          <p className="status">Статус: <span>пользователь</span></p>
          <img
            src={avatar}
            alt="Фото профиля"
            className="avatar"
          />

          <div className="upload-button-wrapper">
            <input
              type="file"
              accept="image/*"
              id="upload-avatar"
              style={{ display: 'none' }}
              onChange={handleImageChange}
            />
            <label htmlFor="upload-avatar" className="btn yellow upload-btn">
              Сменить фото
            </label>
          </div>
          
          <button className="btn red">Выйти</button>
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">История</h2>
        <div className="history-list">
          {[1, 2, 3].map((item) => (
            <div key={item} className="history-card">
              <div className="history-card-top" />
              <div className="history-card-body" />
            </div>
          ))}
        </div>
      </div>

      <div className="business-call">
        <div className="text">
          <p>Хочешь открыть свою автомойку?</p>
          <p>Создай <span className="green">бизнес аккаунт</span>!</p>
        </div>
        <button className="btn yellow large">Создать</button>
      </div>
    </div>
  );
}
