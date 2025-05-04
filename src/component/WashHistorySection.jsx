import React, { useState, useEffect } from "react";
import WashHistoryCard from "./WashHistoryCard";
import "./WashHistorySection.css";

export default function WashHistorySection() {
  const [washHistory, setWashHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const clientId = localStorage.getItem("client_id");
  const ITEMS_PREVIEW = 3;

  useEffect(() => {
    if (!clientId) {
      setWashHistory([]);
      setLoading(false);
      return;
    }

    const timeout = setTimeout(() => {
      fetchHistory();
    }, 200);

    return () => clearTimeout(timeout);
  }, [clientId]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(
        `http://localhost:5000/api/wash-history?client_id=${clientId}&limit=1000&offset=0`
      );

      if (!res.ok) {
        throw new Error(`Ошибка сервера: ${res.status}`);
      }

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || "Ошибка загрузки истории");
      }

      setWashHistory(data.history);
      setTotalItems(data.total);
    } catch (err) {
      setError(err.message || "Неизвестная ошибка");
      setWashHistory([]);
      setTotalItems(0);
      console.error("Ошибка:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = () => {
    setExpanded((prev) => !prev);
  };

  const visibleHistory = expanded
    ? washHistory
    : washHistory.slice(0, ITEMS_PREVIEW);

  if (!loading && washHistory.length === 0) {
    return (
      <div className="history-section">
        <h2 className="subtitle">История:</h2>
        {error && <div className="error-message">{error}</div>}
        <div className="empty-history">
          <p>У вас пока нет истории посещений автомоек</p>
          <p>После бронирования, ваши посещения будут отображаться здесь</p>
        </div>
      </div>
    );
  }

  return (
    <div className="history-section">
      <h2 className="subtitle">История:</h2>

      {error && <div className="error-message">{error}</div>}

      <div className={`history-cards animated ${expanded ? "show" : "hide"}`}>
        {visibleHistory.map((wash) => (
          <WashHistoryCard key={wash.id} wash={wash} />
        ))}
      </div>

      {loading && <div className="loading">Загрузка...</div>}

      {!loading && washHistory.length > ITEMS_PREVIEW && (
        <button className="btn_wash toggle-btn" onClick={toggleExpanded}>
          {expanded ? "Свернуть ↑" : "Развернуть всё ↓"}
        </button>
      )}
    </div>
  );
}
