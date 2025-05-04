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

    async function fetchUserInfo() {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:5000/api/user-info?client_id=${clientId}`);
        const data = await response.json();

        if (data.success) {
          console.log("Полученные данные пользователя:", data.user); // Лог для проверки
          setFormData({
            lastName: data.user.last_name,
            firstName: data.user.first_name,
            phone: data.user.phone,
            email: data.user.email,
          });
          setUserStatus(data.user.status);

          const photoPath = data.user.photo_url?.trim();
          setAvatar(photoPath ? photoPath : defaultAvatar);
        } else {
          console.error("Ошибка API:", data.error);
          alert("Ошибка: " + data.error); // Показываем сообщение об ошибке
        }
      } catch (error) {
        console.error("Ошибка при получении данных пользователя:", error);
      } finally {
        setLoading(false);
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