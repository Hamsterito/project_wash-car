import React, { useRef } from 'react';

export default function UserProfile({
  avatar,
  formData,
  isEditing,
  handleEdit,
  handleSave,
  handleChange,
  handleImageChange,
  handleLogout,
  setIsEditing
}) {
  const fileInputRef = useRef(null);

  return (
    <div className="profile-section">
      <img src={avatar} alt="Фото профиля" className="avatar" />
      {!isEditing ? (
        <>
          <div className="user-info">
            <p className="user-status">Статус пользователя:<br /><span>Пользователь</span></p>
            <p>Фамилия: {formData.lastName}</p>
            <p>Имя: {formData.firstName}</p>
            <p>Номер: {formData.phone}</p>
            <p>Email: {formData.email}</p>
          </div>

          <button className="btnq edit" onClick={handleEdit}>Изменить</button>
          <button className="btnq logout" onClick={handleLogout}>Выйти</button>
        </>
      ) : (
        <>
          <div className="edit-form">
            <input
              type="text"
              name="lastName"
              placeholder="Фамилия"
              value={formData.lastName}
              onChange={handleChange}
            />
            <input
              type="text"
              name="firstName"
              placeholder="Имя"
              value={formData.firstName}
              onChange={handleChange}
            />
            <input
              type="text"
              name="phone"
              placeholder="Номер телефона"
              value={formData.phone}
              onChange={handleChange}
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
            />

            <button className="btnq phot" onClick={() => fileInputRef.current.click()}>
              Изменить фото профиля
            </button>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleImageChange}
            />
            <button className="btnq save" onClick={handleSave}>Сохранить изменения</button>
            <button className="btnq cancel" onClick={() => setIsEditing(false)}>Отменить</button>
          </div>
        </>
      )}
    </div>
  );
}
