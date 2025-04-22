import React from "react";
import "./CarWashGrid.css";

const carWashes = Array(9).fill({
  name: "Название автомойки",
  address: "Улица Пушкина"
});

export default function CarWashGrid() {
  return (
    <div className="container">
      <h1 className="title">Выберите ближайшую автомойку для вас!</h1>
      <div className="grid">
        {carWashes.map((wash, index) => (
          <div key={index} className="card">
            <div className="overlay">
              <div>
                <h2 className="name">{wash.name}</h2>
                <p className="address">Адрес: {wash.address}</p>
              </div>
              <button className="btn">Забронировать</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
