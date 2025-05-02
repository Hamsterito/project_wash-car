import React from 'react';
import CreateBusinessModal from './CreateBusinessModal';

export default function EditBusinessSection({ isModalOpen, setIsModalOpen, onApprove }) {
  return (
    <div className="business-section">
      <div className="business-text">
        <p>Ваш запрос был отклонен!</p>
        <p>Отредактируйте его!</p>
      </div>
      <button className="btnq create" onClick={() => setIsModalOpen(true)}>
        Редактировать
      </button>

      {isModalOpen && (
        <CreateBusinessModal 
          onClose={() => setIsModalOpen(false)} 
          onApprove={onApprove}
        />
      )}
    </div>
  );
}