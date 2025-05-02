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
  const [bookingKey, setBookingKey] = useState(0);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [clientId, setClientId] = useState(localStorage.getItem("client_id"));
  const itemsPerPage = 9;
  
  useEffect(() => {
    const checkAuth = () => {
      const currentClientId = localStorage.getItem("client_id");
      setClientId(currentClientId);
    };
    
    checkAuth();
    
    window.addEventListener('click', checkAuth);
    
    return () => {
      window.removeEventListener('click', checkAuth);
    };
  }, []);

  useEffect(() => {
    fetch("http://localhost:5000/api/wash_boxes")
      .then((res) => {
        if (!res.ok) throw new Error("Ошибка загрузки данных");
        return res.json();
      })
      .then((data) => {
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
  }, []);

  const safeCarWashes = Array.isArray(carWashes) ? carWashes : [];
  const totalPages = Math.ceil(safeCarWashes.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentWashes = safeCarWashes.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    window.scrollTo(0, 900);
  }, [currentPage]);

  const handleOpenBooking = (wash) => {
    const currentClientId = localStorage.getItem("client_id");
    
    if (!currentClientId) {
      setShowLoginPrompt(true);
      return;
    }
    
    setSelectedWash(wash);
    setBookingKey(prevKey => prevKey + 1); 
  };

  const handleCloseBooking = () => {
    setSelectedWash(null);
  };

  const handleCloseLoginPrompt = () => {
    setShowLoginPrompt(false);
  };

  if (isLoading) return <div className="loading">Загрузка...</div>;
  if (error)
    return (
      <div className="error" id="error_carwash">
        Ошибка: {error}
      </div>
    );

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
                onClick={() => handleOpenBooking(wash)}
              >
                Забронировать
              </button>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          {currentPage > 1 && (
            <button
              className="page-nav prev"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
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
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              <img src={right} alt="Вперёд" />
            </button>
          )}
        </div>
      )}

      {selectedWash && (
        <BookingMenu
          key={bookingKey} 
          wash={selectedWash}
          services={selectedWash?.services || []}
          onClose={handleCloseBooking}
          clientId={clientId}
          boxId={selectedWash.id}
        />
      )}

      {showLoginPrompt && (
        <div className="login-prompt-overlay">
          <div className="login-prompt">
            <h2>Требуется авторизация</h2>
            <p>Для бронирования автомойки необходимо авторизоваться. Пожалуйста, войдите в свой аккаунт или зарегистрируйтесь.</p>
            <button className="close-button" onClick={handleCloseLoginPrompt}>Закрыть</button>
          </div>
        </div>
      )}
    </div>
  );
}