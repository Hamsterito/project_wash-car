import React, { useState } from 'react';
import './Header.css';
import AuthModal from './AuthModal';
import userIcon from '../assets/user-icon.png';
import logo from '../assets/logo.svg';
import { Link } from 'react-router-dom';

//dima
const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [showAuth, setShowAuth] = useState(false);

  const handleProfileClick = () => {
    window.location.href = "/account";
  };

  return (
    <>
      <header className="header">
        <div className="logo">
          <img src={logo} alt="Логотип" /> 
        </div>

        <nav className="nav">
        <Link to="/">Главная</Link>
        <a href="#about">О нас</a>
          <a href="#car-wash-grid">Бронь</a>
        </nav>
        <div className="auth-buttons">
          {isLoggedIn ? (
              <Link to="/profile">
                <img
                  src={userIcon}
                  alt="User Icon"
                  className="user-icon"
                />
              </Link>
          ) : (
            <button
              className="booking-button"
              onClick={() => setShowAuth(true)}
            >
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