import React from "react";
import "./EndScene.css";

export default function EndScene({ onComplete }) {
  return (
    <div className="end-scene">
      <div className="end-scene-card">
        <div className="celebration-emoji">🎉</div>
        <h1>Great Job!</h1>
        <p>Your survey game mission has been successfully completed!</p>
        <p className="thank-you">Thank you for your valuable feedback.</p>

        <div className="end-buttons">
          {onComplete && (
            <button className="end-btn primary" onClick={onComplete}>
              🏆 View Leaderboard
            </button>
          )}

          <button
            className="end-btn secondary"
            onClick={() => window.location.reload()}
          >
            🏠 Return to Home
          </button>
        </div>
      </div>
    </div>
  );
}
