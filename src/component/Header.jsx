import React, { useEffect, useState } from "react";
import "./Header.css";
import AuthModal from "./AuthModal";
import userIcon from "../assets/user-icon.png";
import logo from "../assets/logo.svg";
import { Link } from "react-router-dom";

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn");
    if (loggedIn === "true") {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    localStorage.setItem("isLoggedIn", "true");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("isLoggedIn");
    window.location.href = "/";
  };

  const handleProfileClick = () => {
    window.location.href = "/profile"; 
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
        <div className="auth-buttons">
          {isLoggedIn ? (
            <>
              <div className="user_name" onClick={handleProfileClick}>
                <img
                  src={userIcon}
                  alt="User Icon"
                  className="user-icon"
                />
                <p className="text_name">Профиль</p>
              </div>
              <button className="exit-button" onClick={handleLogout}>
                Выйти
              </button>
            </>
          ) : (
            <button className="auto-button" onClick={() => setShowAuth(true)}>
              Вход / Регистрация
            </button>
          )}
        </div>
      </header>

      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onSuccess={handleLoginSuccess}
        />
      )}
    </>
  );
};

export default Header;
