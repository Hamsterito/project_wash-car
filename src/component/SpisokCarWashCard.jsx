import React from "react";
import './SpisokCarWashCard.css'; 

const SpisokCarWashCard = ({ name, address, imageUrl, onClick }) => {
  return (
    <button className="carwash-card" onClick={() => onClick(name)}>
      <div className="carwash-info">
        <h3 className="carwash-name">{name}</h3>
        <p className="carwash-address">{address}</p>
      </div>
      <img className="carwash-image" src={imageUrl} alt="Автомойка" />
    </button>
  );
};

export default SpisokCarWashCard;
