import React from "react";
import "./EndScene.css";

export default function EndScene({ onComplete }) {
  const handleLeaderboard = () => {
    if (onComplete) {
      onComplete();
    }
  };

  const handleRestart = () => {
    window.location.reload();
  };

  return (
    <div className="end-scene">
      <div className="end-scene-card">
        <div className="end-icon">🎉</div>
        <h1 className="end-title">Great Job!</h1>
        <p className="end-message">
          Your survey game mission has been successfully completed!
        </p>

        <div className="end-stats">
          <div className="stat-item">
            <span className="stat-emoji">🏆</span>
            <span className="stat-text">Survey Complete</span>
          </div>
          <div className="stat-item">
            <span className="stat-emoji">⭐</span>
            <span className="stat-text">Points Earned</span>
          </div>
          <div className="stat-item">
            <span className="stat-emoji">🔥</span>
            <span className="stat-text">Great Effort!</span>
          </div>
        </div>

        <div className="end-buttons">
          <button className="end-btn primary" onClick={handleLeaderboard}>
            🏆 View Leaderboard
          </button>

          <button className="end-btn secondary" onClick={handleRestart}>
            🏠 Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
