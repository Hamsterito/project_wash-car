import React, { useState } from 'react';
import './Header.css';
import AuthModal from './AuthModal';
import userIcon from '../assets/user-icon.png';
import logo from '../assets/logo.svg';


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
          <a href="#home">Главная</a>
          <a href="#about">О нас</a>
          <a href="#car-wash-grid">Бронь</a>
        </nav>

      </header>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );
};

export default Header;
