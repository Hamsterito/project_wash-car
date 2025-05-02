import React, { useState, useEffect } from 'react';
import './Profil.css';
import { useNavigate } from 'react-router-dom';
import WashHistorySection from '../component/WashHistorySection';
import UserProfile from '../component/UserProfile';
import CreateBusinessSection from '../component/CreateBusinessSection';
import RequestToBeConsidered from '../component/RequestToBeConsidered';


export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
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

  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
    fetchWashHistory();
  }, []);

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
      console.error('Ошибка при загрузке данных пользователя:', error);
    }
  };

  const fetchWashHistory = async () => {
    try {
      const response = await fetch('API_URL');
      const data = await response.json();
      setWashHistory(data);
    } catch (error) {
      console.error('Ошибка загрузки истории:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEdit = () => setIsEditing(true);

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

  const handleLogout = () => navigate('/');

  if (loading) return <p>Загрузка...</p>;

  return (
    <div className="profile-page">
      <h1 className="titleq">Личный кабинет:</h1>
      <div className="main-section">
        <WashHistorySection washHistory={washHistory} />
        <UserProfile
          avatar={avatar}
          formData={formData}
          isEditing={isEditing}
          handleEdit={handleEdit}
          handleSave={handleSave}
          handleChange={handleChange}
          handleImageChange={handleImageChange}
          handleLogout={handleLogout}
          setIsEditing={setIsEditing}
        />
      </div>
      {!isApproved ? (
        <CreateBusinessSection
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          onApprove={() => setIsApproved(true)}
        />
      ) : (
        <RequestToBeConsidered />
      )}
    </div>
  );
}
