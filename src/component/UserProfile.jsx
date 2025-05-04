import React, { useState, useEffect } from 'react';
import defaultAvatar from "../assets/fotoprofila.jpg";

export default function UserProfile({
  isEditing,
  handleEdit,
  handleLogout,
  setIsEditing,
}) {
  const [avatar, setAvatar] = useState(defaultAvatar);
  const [formData, setFormData] = useState({
    lastName: '',
    firstName: '',
    phone: '',
    email: '',
  });
  const [userStatus, setUserStatus] = useState('');
  const [clientId, setClientId] = useState(null);
  const [loading, setLoading] = useState(true); // Состояние загрузки

  useEffect(() => {
    const storedClientId = localStorage.getItem("client_id");
    if (storedClientId) {
      if (storedClientId.trim() !== '') {
        setClientId(storedClientId);
      } else {
        console.error("Ошибка: client_id пустой");
        handleLogout();
      }
    } else {
      console.error("Ошибка: client_id не найден в localStorage");
      handleLogout();
    }
  }, [handleLogout]);

  useEffect(() => {
    if (!clientId) return;
    
    async function fetchUserInfo(retries = 3, delay = 1000) {
      let attempt = 0;
      
      while (attempt < retries) {
        try {
          const response = await fetch(`http://localhost:5000/api/user-info?client_id=${clientId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
          }
          
          const data = await response.json();
    
          if (data.success) {
            setFormData({
              lastName: data.user.last_name,
              firstName: data.user.first_name,
              phone: data.user.phone,
              email: data.user.email,
            });
            setUserStatus(data.user.status);
    
            const photoPath = data.user.photo_url?.trim();
            setAvatar(photoPath ? photoPath : defaultAvatar);
            return;
          } else {
            console.error(data.error);
            throw new Error(data.error || 'Неизвестная ошибка');
          }
        } catch (error) {
          console.error(`Попытка ${attempt + 1} не удалась: ${error.message}`);
          
          if (error.message.includes('401') || error.message.includes('403')) {
            handleLogout();
            return;
          }
          
          if (attempt === retries - 1) {
            console.error('Ошибка при получении данных пользователя:', error);
            return;
          }
          
          await new Promise(resolve => setTimeout(resolve, delay));
          attempt++;
        }
      }
    }

    fetchUserInfo();
  }, [clientId]);

  if (loading) {
    return <div className="loading">Загрузка данных пользователя...</div>;
  }

  return (
    <div className="profile-section">
      {avatar && (
        <img
          src={avatar}
          alt="Фото профиля"
          className="avatar"
        />
      )}

      {!isEditing ? (
        <>
          <div className="user-info">
            <p className="user-status">
              Статус пользователя:<br />
              <span>{userStatus}</span>
            </p>
            <p>Фамилия: {formData.lastName}</p>
            <p>Имя: {formData.firstName}</p>
            <p>Номер: {formData.phone}</p>
            <p>Email: {formData.email}</p>
          </div>

          <button className="btnq edit" onClick={handleEdit}>
            Изменить
          </button>
          <button className="btnq logout" onClick={handleLogout}>
            Выйти
          </button>
        </>
      ) : (
        <div className="edit-form">
          {/* Форма редактирования */}
        </div>
      )}
    </div>
  );
}