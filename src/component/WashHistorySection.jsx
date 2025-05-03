import React, { useState, useEffect } from "react";
import WashHistoryCard from "./WashHistoryCard";
import { useAuth } from "./AuthContext";
import "./WashHistorySection.css";

export default function WashHistorySection() {
  const [washHistory, setWashHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const clientId = localStorage.getItem("client_id");
  const ITEMS_PER_PAGE = 3;
  const [expanded, setExpanded] = useState(true);

  const toggleExpanded = () => {
    setExpanded((prev) => !prev);
  };

  useEffect(() => {
    fetchWashHistory();
  }, [clientId, page]);

  const fetchWashHistory = async () => {
    if (!clientId) {
      setWashHistory([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:5000/api/wash-history?client_id=${clientId}&limit=${ITEMS_PER_PAGE}&offset=${
          page * ITEMS_PER_PAGE
        }`
      );

      if (!response.ok) {
        throw new Error("Не удалось загрузить историю");
      }

      const data = await response.json();

      if (data.success) {
        if (page === 0) {
          setWashHistory(data.history);
        } else {
          setWashHistory((prev) => [...prev, ...data.history]);
        }

        setHasMore(
          data.history.length === ITEMS_PER_PAGE &&
            (page + 1) * ITEMS_PER_PAGE < data.total
        );
      } else {
        throw new Error(data.error || "Ошибка загрузки данных");
      }
    } catch (err) {
      setError(err.message);
      console.error("Ошибка загрузки истории:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  if (!loading && washHistory.length === 0) {
    return (
      <div className="history-section">
        <h2 className="subtitle">История:</h2>
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

      <div className="history-cards">
        {washHistory.map((wash) => (
          <WashHistoryCard key={wash.id} wash={wash} />
        ))}
      </div>

      {loading && <div className="loading">Загрузка...</div>}

      {hasMore && (
        <button className="btnq more" onClick={loadMore} disabled={loading}>
          {loading ? "Загрузка..." : "Ещё ↓"}
        </button>
      )}
    </div>
  );
}
