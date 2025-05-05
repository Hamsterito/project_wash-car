import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-[#2c2c2c] text-white py-10 px-6 mt-16 text-sm">
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-4 gap-6 mb-6">
        <div
        className="footer-grid"
        style={{
          maxWidth: "1800px",
          gap: "1px",
        }}
      >
          <h4 className="font-bold mb-1">Адрес:</h4>
          <p>
            Улица Хорошая, 42<br />
            Хороший район, г.Хороший<br />
            7 этаж, 49 кабинет
          </p>
        </div>

        <div>
          <h4 className="font-bold mb-1">Контакты:</h4>
          <p>
            +7(707) 111 11 11<br />
            +7(700) 111 11 11
          </p>
        </div>


        <div className="text-right space-y-1">
          <Link to="/" state={{ scrollTo: "banner" }} style={{ color: '#FFB200' }}>Главная</Link><br />
          <Link to="/" state={{ scrollTo: "about" }} style={{ color: '#FFB200' }}>О нас</Link><br />
          <Link to="/" state={{ scrollTo: "booking" }} style={{ color: '#FFB200' }}>Бронь</Link>
        </div>

      </div>

      <div style={{ borderTop: '1px solid white', width: '75%', margin: '0 auto', paddingTop: '16px', textAlign: 'center', marginTop: '10px' }}>
        <p>
          © 2025 | Онлайн-запись на автомойку — учебный проект
          <br />
          Astana IT University, Колледж
          <br />
          Руководитель практики: Имя Преподавателя
        </p>
      </div>

    </footer>
  );
};

export default Footer;
