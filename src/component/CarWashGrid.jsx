import React, { useState, useEffect } from "react";
import "./CarWashGrid.css";
import BookingMenu from "./BookingMenu";
import defaultImage from "../assets/carwash.png";
import left from "../assets/left.svg";
import right from "../assets/right.svg";

export default function CarWashGrid() {
  const [carWashes, setCarWashes] = useState([]);
  const [selectedWash, setSelectedWash] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const itemsPerPage = 9;

  useEffect(() => {
    const fetchData = () => {
      fetch("http://localhost:5000/api/wash_boxes")
        .then((res) => {
          if (!res.ok) throw new Error("Ошибка загрузки данных");
          return res.json();
        })
        .then((data) => {
          // Гарантируем, что данные - массив
          if (Array.isArray(data)) {
            setCarWashes(data);
          } else {
            throw new Error("Некорректный формат данных");
          }
        })
        .catch((err) => {
          setError(err.message);
          setCarWashes([]);
        })
        .finally(() => setIsLoading(false));
    };

    fetchData();
    const intervalId = setInterval(fetchData, 5000);
    return () => clearInterval(intervalId);
  }, []);

  // Безопасные вычисления для пагинации
  const safeCarWashes = Array.isArray(carWashes) ? carWashes : [];
  const totalPages = Math.ceil(safeCarWashes.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentWashes = safeCarWashes.slice(indexOfFirstItem, indexOfLastItem);

  if (isLoading) return <div className="loading">Загрузка...</div>;
  if (error) return <div className="error" id="error_carwash">Ошибка: {error}</div>;

  return (
    <div className="container" id="car-wash-grid">
      <h1 className="title">Выберите ближайшую автомойку для вас!</h1>
      
      <div className="grid">
        {currentWashes.map((wash) => (
          <div
            key={wash.id}
            className="card"
            style={{ backgroundImage: `url(${wash.image || defaultImage})` }}
          >
            <div className="overlay">
              <div className="text_carwash">
                <h2 className="name">{wash.name}</h2>
                <p className="address">Адрес: {wash.address}</p>
              </div>
              <button
                className="btn_book_carwash"
                onClick={() => setSelectedWash(wash)}
              >
                Забронировать
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Пагинация */}
      {totalPages > 1 && (
        <div className="pagination">
          {currentPage > 1 && (
            <button
              className="page-nav prev"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            >
              <img src={left} alt="Назад" />
            </button>
          )}
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              className={`page-number ${currentPage === page ? "active" : ""}`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}
          
          {currentPage < totalPages && (
            <button
              className="page-nav next"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            >
              <img src={right} alt="Вперёд" />
            </button>
          )}
        </div>
      )}

      {selectedWash && (
        <BookingMenu
          wash={selectedWash}
          services={selectedWash?.services || []}
          onClose={() => setSelectedWash(null)}
        />
      )}
    </div>
  );
}