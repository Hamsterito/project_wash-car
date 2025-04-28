import React from 'react';
import CreateBusinessModal from './CreateBusinessModal';

export default function CreateBusinessSection({ isModalOpen, setIsModalOpen }) {
  return (
    <div className="business-section">
      <div className="business-text">
        <p>Хочешь открыть свою автомойку?</p>
        <p>Создай <span className="green">бизнес аккаунт</span>!</p>
      </div>
      <button className="btnq create" onClick={() => setIsModalOpen(true)}>
        Создать!
      </button>

      {isModalOpen && <CreateBusinessModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
}
