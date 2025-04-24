import './Profil.css';
import React from 'react';

const Profil = () => {
  return (
    <div>
      <div>
        <h2>Личный кабинет</h2>
        <p><strong>Имя:</strong> Иван</p>
        <p><strong>Фамилия:</strong> Иванов</p>
        <p><strong>Номер:</strong> +7 (123) 456-78-90</p>
        <p><strong>Email:</strong> ivanov@example.com</p>
      </div>
      <div>
        <img 
          src="src\assets\Rectangle163.jpg"
          alt="Фото профиля" 
        />
      </div>
      <div>
        <button>Изменить фото</button>
          <button className='buttonLogOut'>Log Out</button>
      </div>
    </div>
  );
};

export default Profil;
