import React from "react";
import "./Footer.css";

const Footer = () => {
  const handleNavClick = (section) => {
    if (section === null) {
      window.scrollTo(0, 0);
    } else {
      const element = document.getElementById(section);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3 className="footer-heading">Адрес:</h3>
          <address className="footer-address">
            Улица Хорошая, 42<br />
            Хороший район, г.Хороший<br />
            7 этаж, 49 кабинет
          </address>
        </div>
        
        <div className="footer-section">
          <h3 className="footer-heading">Время работы:</h3>
          <ul className="footer-hours">
            <li>Понедельник - Пятница: 8:00 - 20:00</li>
            <li>Суббота: 9:00 - 18:00</li>
            <li>Воскресенье: 10:00 - 16:00</li>
          </ul>
        </div>
        
        <nav className="footer-nav">
          <a onClick={() => handleNavClick(null)} className="footer-link">Главная</a>
          <a onClick={() => handleNavClick("about")} className="footer-link">О нас</a>
          <a onClick={() => handleNavClick("car-wash-grid")} className="footer-link">Бронь</a>
        </nav>
      </div>
      
      <div className="footer-bottom">
        <p className="footer-copyright">© 2025 | Онлайн-запись на автомойку — учебный проект</p>
        <p className="footer-university">Astana IT University, Колледж</p>
        <p className="footer-mentor">Руководитель практики: Арсен Тимурович</p>
      </div>
    </footer>
  );
};

export default Footer;