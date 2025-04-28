import React, { useState, useEffect } from "react";
import "./CarWashGrid.css";
import BookingMenu from "./BookingMenu";
import defaultImage from "../assets/carwash.png";
import left from "../assets/left.svg";
import right from "../assets/right.svg";

export default function CarWashGrid() {
  const [carWashes, setCarWashes] = useState([]);
  const [selectedWash, setSelectedWash] = useState(null);

  useEffect(() => {
    const fetchData = () => {
      fetch("http://localhost:5000/api/wash_boxes")
        .then((res) => res.json())
        .then((data) => setCarWashes(data));
    };
    
    fetchData();
    
    const intervalId = setInterval(fetchData, 5000);
    
    return () => clearInterval(intervalId);
  }, []);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentWashes = carWashes.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(carWashes.length / itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 850, behavior: "smooth" });
  };
  const pageButtons = [];
  for (let i = 1; i <= totalPages; i++) {
    pageButtons.push(i);
  }

  return (
    <div className="container" id="car-wash-grid">
      <h1 className="title">Выберите ближайшую автомойку для вас!</h1>
      <div className="grid">
        {currentWashes.map((wash) => (
          <div
            key={wash.id}
            className="card"
            style={{
              backgroundImage: `url(${wash.image || defaultImage})`,
            }}
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

      <div className="pagination">
        {currentPage > 1 && (
          <button
            className="page-nav prev"
            onClick={() => handlePageChange(currentPage - 1)}
          >
            <img src={left} alt="Вперёд" />
          </button>
        )}
        {pageButtons.map((page) => (
          <button
            key={page}
            className={`page-number ${currentPage === page ? "active" : ""}`}
            onClick={() => handlePageChange(page)}
          >
            {page}
          </button>
        ))}
        {currentPage < totalPages && (
          <button
            className="page-nav next"
            onClick={() => handlePageChange(currentPage + 1)}
          >
            <img src={right} alt="Вперёд" />
          </button>
        )}
      </div>

      {selectedWash && (
        <BookingMenu
          wash={selectedWash}
          services={[]}
          onClose={() => setSelectedWash(null)}
        />
      )}
    </div>
  );
}
