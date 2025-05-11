import React from "react";
import defaultImage from "../assets/carwash.png";
import "./WashHistorySection.css";

export default function WashHistoryCard({ wash }) {
  const getStatusBadge = (status) => {
    // Status styles matching the card-header aesthetic
    const statusStyles = {
      забронировано: {
        gradientStart: "#ffd54f",
        gradientEnd: "#ffc107",
        text: "Забронировано",
        shadowColor: "rgba(255, 193, 7, 0.25)",
      },
      завершено: {
        gradientStart: "#4ade80",
        gradientEnd: "#22c55e",
        text: "Завершено",
        shadowColor: "rgba(34, 197, 94, 0.25)",
      },
      отменено: {
        gradientStart: "#f87171",
        gradientEnd: "#ef4444",
        text: "Отменено",
        shadowColor: "rgba(239, 68, 68, 0.25)",
      },
      свободно: {
        gradientStart: "#94a3b8",
        gradientEnd: "#64748b",
        text: "Свободно",
        shadowColor: "rgba(100, 116, 139, 0.25)",
      },
    };

    const style = statusStyles[status] || {
      gradientStart: "#94a3b8",
      gradientEnd: "#64748b",
      text: status,
      shadowColor: "rgba(100, 116, 139, 0.25)",
    };

    return (
      <span
        style={{
          background: `linear-gradient(145deg, ${style.gradientStart}, ${style.gradientEnd})`,
          color: "#333",
          padding: "8px 14px",
          borderRadius: "8px",
          fontSize: "13px",
          fontWeight: "600",
          letterSpacing: "0.3px",
          position: "absolute",
          top: "15px",
          right: "15px",
          boxShadow: `0 3px 8px ${style.shadowColor}, 0 1px 3px rgba(0, 0, 0, 0.1)`,
          textTransform: "uppercase",
          transition: "all 0.25s ease",
          borderBottom: "2px solid rgba(0, 0, 0, 0.05)",
          overflow: "hidden",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = `0 5px 12px ${style.shadowColor}, 0 3px 6px rgba(0, 0, 0, 0.12)`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = `0 3px 8px ${style.shadowColor}, 0 1px 3px rgba(0, 0, 0, 0.1)`;
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background:
              "linear-gradient(to right, transparent, rgba(255, 255, 255, 0.2), transparent)",
            transform: "translateX(-100%)",
            transition: "transform 0.6s ease",
            pointerEvents: "none",
          }}
          className="badge-shine"
        />

        {style.text}
      </span>
    );
  };
  return (
    <div
      className="history-card"
      style={{
        backgroundImage: `url(${wash.image || defaultImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        position: "relative",
      }}
    >
      {getStatusBadge(wash.status)}
      <div className="card-header">
        {wash.name}
        <br />
        {wash.street}
      </div>
      <div className="card-body">
        <p>Назначенное время: {wash.appointmentTime}</p>
        <p>Вид транспорта: {wash.vehicleType}</p>
        <p>Выбранные услуги: {wash.selectedServices.join(", ")}</p>
        <p>Цена: {wash.price}</p>
      </div>
    </div>
  );
}
