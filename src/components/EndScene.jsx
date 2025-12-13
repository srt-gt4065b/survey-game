import React from "react";
import "./EndScene.css";

export default function EndScene({ onComplete }) {
  return (
    <div className="end-scene">
      <h1>🎉 Great Job!</h1>
      <p>Your survey game mission has been successfully completed!!.</p>

      <button
        className="end-btn"
        onClick={onComplete}
      >
        리더보드 보기 →
      </button>

      <button
        className="home-btn"
        onClick={() => window.location.reload()}
      >
        처음으로 돌아가기
      </button>
    </div>
  );
}
