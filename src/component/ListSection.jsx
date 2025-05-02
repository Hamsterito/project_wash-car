import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function EditBusinessSection() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/list-car-washes'); 
  };

  return (
    <div className="business-section">
      <div className="business-text">
        <p>Спасибо что используете наш сайт!</p>
        <p>Управляйте своими мойками.</p>
      </div>
      <button className="btnq create" onClick={handleClick}>
        Список автомоек
      </button>
    </div>
  );
}
