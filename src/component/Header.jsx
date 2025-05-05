import React, { useEffect, useState } from "react";
import "./Header.css";
import AuthModal from "./AuthModal";
import userIcon from "../assets/user-icon.png";
import logo from "../assets/logo.svg";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const Header = () => {
  const { isLoggedIn, setIsLoggedIn } = useAuth(false);
  const [showAuth, setShowAuth] = useState(false);
  const navigate = useNavigate();

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
    localStorage.removeItem("client_id");
    localStorage.removeItem("isLoggedIn");
    setIsLoggedIn(false);
    navigate("/");
  };

  const handleProfileClick = () => {
    window.location.href = "/profile";
  };

  const handleNavClick = (anchor) => {
    navigate("/", { state: { scrollTo: anchor } });
  };

  return (
    <>
      <header className="header">
        <div className="logo">
          <img src={logo} alt="Логотип" />
        </div>

        <nav className="nav">
          <a onClick={() => handleNavClick(null)} style={{ cursor: "pointer" }}>
            Главная
          </a>
          <a
            onClick={() => handleNavClick("about")}
            style={{ cursor: "pointer" }}
          >
            О нас
          </a>
          <a
            onClick={() => handleNavClick("car-wash-grid")}
            style={{ cursor: "pointer" }}
          >
            Бронь
          </a>
        </nav>
        <div className="auth-buttons">
          {isLoggedIn ? (
            <>
              <div className="user_name" onClick={handleProfileClick}>
                <img src={userIcon} alt="User Icon" className="user-icon" />
                <p className="text_name">Профиль</p>
              </div>
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
