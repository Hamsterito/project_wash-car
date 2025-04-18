import React, { useState } from 'react';
import './Header.css';
import AuthModal from './AuthModal';

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false); //true-если зашел в учетную запись, то выбераешь город(потому что так красивее, а не под банером). false-естественно, вход/регестрация
  const [selectedCity, setSelectedCity] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  

  const cities = ['Астана', 'Алматы', 'Экибастуз', 'Варшава'];

  const toggleDropdown = () => setShowDropdown(!showDropdown);

  const handleCitySelect = (city) => {
    setSelectedCity(city);
    setShowDropdown(false);
  };

  return (
    <>
      <header className="header">
        <div className="logo">LOGO</div>
        <nav className="nav">
          <a href="#home">Главная</a>
          <a href="#about">О нас</a>
          <a href="#booking">Бронь</a>
        </nav>
        <div className="auth-buttons">
          {isLoggedIn ? (
            <div className="city-selector">
              <button className="auth-btn" onClick={toggleDropdown}>
                {selectedCity || 'Выберите город'}
              </button>
              {showDropdown && (
                <ul className="dropdown">
                  {cities.map((city) => (
                    <li key={city} onClick={() => handleCitySelect(city)}>
                      {city}
                    </li>
                  ))}
                </ul>
              )}
            </div>
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