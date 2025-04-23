import React, { useState } from 'react';
import './Header.css';
import AuthModal from './AuthModal';
import userIcon from '../assets/user-icon.png';
import logo from '../assets/logo.png';


const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [showAuth, setShowAuth] = useState(false);

  const handleProfileClick = () => {
    window.location.href = '/account'; 
  };

  return (
    <>
      <header className="header">
        <div className="logo">
          <img src={logo} alt="Логотип" />
        </div>


        <nav className="nav">
          <a href="#home">Главная</a>
          <a href="#about">О нас</a>
          <a href="#booking">Бронь</a>
        </nav>
        <div className="auth-buttons">
          {isLoggedIn ? (
            <img
              src={userIcon}
              alt="User Icon"
              className="user-icon"
              onClick={handleProfileClick}
            />
          ) : (
            <button className="booking-button" onClick={() => setShowAuth(true)}>
              Вход / Регистрация
            </button>
          )}
        </div>
      </header>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );
};

export default Header;
