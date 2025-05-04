import React, { useState, useEffect } from 'react';
import './Profil.css';
import { useNavigate } from 'react-router-dom';
import WashHistorySection from '../component/WashHistorySection';
import UserProfile from '../component/UserProfile';
import CreateBusinessSection from '../component/CreateBusinessSection';
import RequestToBeConsidered from '../component/RequestToBeConsidered';
import EditBusinessSection from '../component/EditBusinessSection';
import ListSection from '../component/ListSection';
import ApplicationsSection from '../component/ApplicationsSection';
import { useAuth } from "../component/AuthContext";
import HistoryApplicationsSection from '../component/HistoryApplicationsSection';  

export default function ProfilePage() {
  const { isLoggedIn, setIsLoggedIn, clientId } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const {userRole, setUserRole} = useAuth('admin'); //'user', 'business', 'manager', 'admin'
  const [formData, setFormData] = useState({
    lastName: '',
    firstName: '',
    phone: '',
    email: '',
  });
  const [avatar, setAvatar] = useState('https://via.placeholder.com/150');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
  }, [clientId]);

  const fetchUserData = async () => {
    if (!clientId) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/user-info?client_id=${clientId}`);
      
      if (!response.ok) {
        throw new Error('Не удалось загрузить данные пользователя');
      }
      
      const data = await response.json();
  
      if (data.success && data.user) {
        setFormData({
          lastName: data.user.last_name || '',
          firstName: data.user.first_name || '',
          phone: data.user.phone || '',
          email: data.user.email || '',
        });
      
        setUserRole(data.user.status || 'user'); // передаём в глобальный контекст
        localStorage.setItem("role", data.user.status || 'user'); // опционально
      
        setAvatar(data.user.photo_url || 'https://via.placeholder.com/150');
      } else {
        throw new Error(data.error || 'Ошибка загрузки данных');
      }
    } catch (error) {
      console.error('Ошибка при загрузке данных пользователя:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEdit = () => setIsEditing(true);

  const handleSave = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/update-user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: clientId,
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          email: formData.email
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setIsEditing(false);
        console.log('Сохранено:', formData);
      } else {
        alert(data.error || 'Ошибка при сохранении данных');
      }
    } catch (error) {
      console.error('Ошибка при сохранении данных:', error);
      alert('Произошла ошибка при сохранении данных');
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('user_id', clientId);
      
      const response = await fetch('http://localhost:5000/api/upload-photo', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        setAvatar(data.photo_url);
      } else {
        alert(data.error || 'Ошибка при загрузке фото');
      }
    } catch (error) {
      console.error('Ошибка при загрузке фото:', error);
      alert('Произошла ошибка при загрузке фото');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("client_id");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("role");
    setIsLoggedIn(false);
    navigate("/");
  };

  if (loading) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Загрузка данных...</p>
    </div>
  );

  return (
    <div className="profile-page">
      <h1 className="titleq">Личный кабинет:</h1>
      <div className="main-section">
        <WashHistorySection />
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
          userRole={userRole}
        />
      </div>
      
      {userRole === 'user' && !isApproved && (
        <CreateBusinessSection
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          onApprove={() => setIsApproved(true)}
        />
      )}

      {userRole === 'user' && isApproved && (
        <RequestToBeConsidered />
      )}
      
      {userRole === 'admin' && <ApplicationsSection/>}
      {userRole === 'admin' && <HistoryApplicationsSection/>}
      {userRole === 'manager' && <ListSection/>}
      {userRole === 'business' && <ListSection/>}
    </div>
  );
}