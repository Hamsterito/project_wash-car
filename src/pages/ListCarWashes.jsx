import React from "react";
import SpisokCarWashCard from "../component/SpisokCarWashCard.jsx";
import carwash from '../assets/carwash.png'

const ListCarWashes = () => {
  const carWashData = [
    {
      name: "Автомойка 1",
      address: "ул. Примерная, 1",
      image: carwash,
    },
    {
      name: "Автомойка 2",
      address: "ул. Моечная, 2",
      image: carwash,
    },
    {
      name: "Автомойка 3",
      address: "ул. Чистая, 3",
      image: carwash,
    },
  ];

  const handleClick = (name) => {
    alert(`Вы нажали на: ${name}`);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ fontSize: "32px", textAlign: "center", marginBottom: "24px" }}>
        Список автомоек
      </h1>
      {carWashData.map((wash, index) => (
        <SpisokCarWashCard
          key={index}
          name={wash.name}
          address={wash.address}
          imageUrl={wash.imageUrl}
          onClick={handleClick}
        />
      ))}
    </div>
  );
};

export default ListCarWashes;
