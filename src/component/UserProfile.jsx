import React, { useState, useEffect } from 'react';
import defaultAvatar from "../assets/fotoprofila.jpg";

export default function UserProfile({
  isEditing,
  handleEdit,
  handleChange,
  handleImageChange,
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

  useEffect(() => {
    async function fetchUserInfo() {
      try {
        const response = await fetch('http://localhost:5000/api/user-info');
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
          setAvatar(photoPath ? photoPath : defaultAvatar); // Используем путь из данных или дефолтное изображение
        } else {
          console.error(data.error);
        }
      } catch (error) {
        console.error('Ошибка при получении данных пользователя:', error);
      }
    }

    fetchUserInfo();
  }, []);

  const handleSave = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/update-user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: 2,
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          email: formData.email,
        }),
      });

      const data = await response.json();

      if (data.success) {
        console.log('Информация обновлена:', data.message);
        setIsEditing(false);
      } else {
        console.error('Ошибка при обновлении:', data.error);
      }
    } catch (error) {
      console.error('Ошибка при сохранении данных:', error);
    }
  };

  const handleProfileImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("user_id", 2); // ID пользователя (замените на динамический, если нужно)

      try {
        const response = await fetch("http://localhost:5000/api/upload-photo", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();
        if (data.success) {
          setAvatar(`/${data.photo_url}`); // Обновляем аватар на клиенте
          console.log("Фото успешно обновлено");
        } else {
          console.error("Ошибка при обновлении фото:", data.error);
        }
      } catch (error) {
        console.error("Ошибка при загрузке фото:", error);
      }
    }
  };

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
          <input
            type="text"
            name="lastName"
            placeholder="Фамилия"
            value={formData.lastName}
            onChange={(e) =>
              setFormData({ ...formData, lastName: e.target.value })
            }
          />
          <input
            type="text"
            name="firstName"
            placeholder="Имя"
            value={formData.firstName}
            onChange={(e) =>
              setFormData({ ...formData, firstName: e.target.value })
            }
          />
          <input
            type="text"
            name="phone"
            placeholder="Номер телефона"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />

          {/* Кнопка для изменения фото профиля */}
          <div className="profile-image-upload">
            <label htmlFor="profileImage" className="btnq edit">
              Изменить фото профиля
            </label>
            <input
              type="file"
              id="profileImage"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleProfileImageChange}
            />
          </div>

          <button className="btnq save" onClick={handleSave}>
            Сохранить изменения
          </button>
          <button className="btnq cancel" onClick={() => setIsEditing(false)}>
            Отменить
          </button>
        </div>
      )}
    </div>
  );
}