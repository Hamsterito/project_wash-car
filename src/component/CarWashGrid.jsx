import React, { useState } from "react";
import "./CarWashGrid.css";
import BookingMenu from "./BookingMenu";

const carWashes = Array(9).fill({
  name: "Название автомойки",
  address: "Улица Пушкина",
});

const services = [
  {
    name: "Мойка кузова",
    description: "Полная мойка внешней части автомобиля",
    price: 500,
    duration_minutes: 20,
  },
  {
    name: "Химчистка салона",
    description: "Глубокая чистка сидений и обивки",
    price: 1500,
    duration_minutes: 60,
  },
  {
    name: "Полировка фар",
    description: "Полировка передних фар",
    price: 800,
    duration_minutes: 30,
  },
  {
    name: "Комплексная мойка",
    description: "Мойка кузова и салона",
    price: 2000,
    duration_minutes: 90,
  },
];

export default function CarWashGrid() {
  const [selectedWash, setSelectedWash] = useState(null);

  return (
    <div className="container" id="car-wash-grid">
      <h1 className="title">Выберите ближайшую автомойку для вас!</h1>
      <div className="grid">
        {carWashes.map((wash, index) => (
          <div key={index} className="card">
            <div className="overlay">
              <div>
                <h2 className="name">{wash.name}</h2>
                <p className="address">Адрес: {wash.address}</p>
              </div>
              <button
                className="btn"
                onClick={() => setSelectedWash({ ...wash, id: index })}
              >
                Забронировать
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedWash && (
        <BookingMenu
          wash={selectedWash}
          services={services}
          onClose={() => setSelectedWash(null)}
        />
      )}
    </div>
  );
}
