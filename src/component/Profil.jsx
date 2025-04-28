import React, { useState, useEffect, useRef } from 'react';
import './Profil.css';
import { useNavigate } from 'react-router-dom';
import defaultImage from '../assets/carwash.png';
import CreateBusinessModal from './CreateBusinessModal';

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    lastName: '',
    firstName: '',
    phone: '',
    email: '',
  });
  const [avatar, setAvatar] = useState('https://via.placeholder.com/150');
  const [washHistory, setWashHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false); 

  const fileInputRef = useRef(null);
  const navigate = useNavigate();



  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/user');  
      const data = await response.json();
      setFormData({
        lastName: data.lastName,
        firstName: data.firstName,
        phone: data.phone,
        email: data.email,
      });
      setAvatar(data.avatar || 'https://via.placeholder.com/150');  
    } catch (error) {
      console.error('Ошибка при загрузке данных:', error);
    }
  };



  useEffect(() => {
    fetchUserData(); 
  }, []); 

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEdit = () => {
    setIsEditing(true);
  };
  

  const handleSave = () => {
    setIsEditing(false);
    console.log('Сохранено:', formData);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setAvatar(imageUrl);
    }
  };

  const handleLogout = () => {
    navigate('/');  // Перенаправляем на главную страницу
  };


  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('API_URL');
      const data = await response.json();
      setWashHistory(data);
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <p>Загрузка...</p>;
  }


  return (
    <div className="profile-page">
      <h1 className="titleq">Личный кабинет:</h1>

      <div className="main-section">        
        <div className="history-section">
          <h2 className="subtitle">История:</h2>
          <div className="history-cards">
            {washHistory.map((wash) => (
              <div
                key={wash.id}
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
            ))}
          </div>
          <button className="btnq more">Ещё ↓</button>
        </div>


        <div className="profile-section">
          <img
            src={avatar}  
            alt="Фото профиля"
            className="avatar"
          />
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
      </div>

      <div className="business-section">
        <div className="business-text">
          <p>Хочешь открыть свою автомойку?</p>
          <p>Создай <span className="green">бизнес аккаунт</span>!</p>
        </div>
        <button className="btnq create" onClick={() => setIsModalOpen(true)}>
          Создать!
        </button>

        {isModalOpen && <CreateBusinessModal onClose={() => setIsModalOpen(false)} />}
      </div>

    </div>
  );
}



