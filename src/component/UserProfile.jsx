import React, { useState, useEffect } from "react";
import defaultAvatar from "../assets/fotoprofila.jpg";

export default function UserProfile({
  isEditing,
  handleEdit,
  handleLogout,
  setIsEditing,
}) {
  const [avatar, setAvatar] = useState(defaultAvatar);
  const [formData, setFormData] = useState({
    lastName: "",
    firstName: "",
    phone: "",
    email: "",
  });
  const [userStatus, setUserStatus] = useState("");
  const [clientId, setClientId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedClientId = localStorage.getItem("client_id");
    if (storedClientId?.trim()) {
      setClientId(storedClientId);
    } else {
      console.error("Ошибка: client_id не найден или пустой");
      handleLogout();
    }
  }, [handleLogout]);

  useEffect(() => {
    if (!clientId) return;

    const fetchUserInfo = async (retries = 3, delay = 1000) => {
      setLoading(true);
      let attempt = 0;

      while (attempt < retries) {
        try {
          const response = await fetch(
            `http://localhost:5000/api/user-info?client_id=${clientId}`
          );
          if (!response.ok) throw new Error(`Ошибка HTTP: ${response.status}`);
          const data = await response.json();

          if (data.success) {
            setFormData({
              lastName: data.user.last_name || "",
              firstName: data.user.first_name || "",
              phone: data.user.phone || "",
              email: data.user.email || "",
            });
            setUserStatus(data.user.status || "пользователь");
            setAvatar(data.user.photo_url?.trim() || defaultAvatar);
            setLoading(false);
            return;
          }
          throw new Error(data.error || "Неизвестная ошибка");
        } catch (error) {
          console.error(`Попытка ${attempt + 1} не удалась:`, error);
          if (attempt === retries - 1) {
            setLoading(false);
            if (
              error.message.includes("401") ||
              error.message.includes("403")
            ) {
              handleLogout();
            }
            return;
          }
          await new Promise((resolve) => setTimeout(resolve, delay));
          attempt++;
        }
      }
    };

    fetchUserInfo();
  }, [clientId, handleLogout]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/update-user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: clientId,
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          email: formData.email,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Ошибка обновления");
      console.log("Профиль обновлен:", data.message);
      setIsEditing(false);
    } catch (error) {
      console.error("Ошибка обновления:", error);
    }
  };

  const handleProfileImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const imageData = new FormData();
    imageData.append("file", file);
    imageData.append("user_id", clientId);
    console.log(clientId)

    try {
      const response = await fetch("http://localhost:5000/api/upload-photo", {
        method: "POST",
        body: imageData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Ошибка загрузки");
      setAvatar(data.photo_url);
      console.log("Фото успешно обновлено");
    } catch (error) {
      console.error("Ошибка загрузки:", error);
    }
  };

  if (loading) {
    return <div className="loading">Загрузка данных...</div>;
  }

  return (
    <div className="profile-section">
      <div className="avatar-section">
        <img src={avatar} alt="Аватар" className="avatar" />
        {isEditing && (
          <label className="avatar-upload-label">
            <input
              type="file"
              accept="image/*"
              onChange={handleProfileImageChange}
              className="hidden-file-input"
            />
            Изменить фото
          </label>
        )}
      </div>

      {!isEditing ? (
        <>
          <div className="user-info">
            <p className="user-status">Статус: {userStatus}</p>
            <p>Фамилия: {formData.lastName}</p>
            <p>Имя: {formData.firstName}</p>
            <p>Телефон: {formData.phone}</p>
            <p>Email: {formData.email}</p>
          </div>
          <div className="button-group">
            <button className="btnq edit" onClick={handleEdit}>
              Редактировать
            </button>
            <button className="btnq logout" onClick={handleLogout}>
              Выйти
            </button>
          </div>
        </>
      ) : (
        <div className="edit-form">
          <input
            name="lastName"
            value={formData.lastName}
            onChange={handleFormChange}
            placeholder="Фамилия"
          />
          <input
            name="firstName"
            value={formData.firstName}
            onChange={handleFormChange}
            placeholder="Имя"
          />
          <input
            name="phone"
            value={formData.phone}
            onChange={handleFormChange}
            placeholder="Телефон"
          />
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleFormChange}
            placeholder="Email"
          />
          <div className="form-actions">
            <button className="btnq save" onClick={handleSave}>
              Сохранить
            </button>
            <button className="btnq cancel" onClick={() => setIsEditing(false)}>
              Отмена
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
