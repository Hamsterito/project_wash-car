import React from 'react';
import WashHistoryCard from './WashHistoryCard';

export default function WashHistorySection({ washHistory }) {
  return (
    <div className="history-section">
      <h2 className="subtitle">История:</h2>
      <div className="history-cards">
        {washHistory.map((wash) => (
          <WashHistoryCard key={wash.id} wash={wash} />
        ))}
      </div>
      <button className="btnq more">Ещё ↓</button>
    </div>
  );
}
