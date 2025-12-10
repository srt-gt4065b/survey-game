// src/components/GameHeader.jsx
import React from "react";
import useGameStore from "../store/gameStore";
import "./GameHeader.css";

const GameHeader = () => {
  // 🟢 Zustand store에서 최신 게임 스탯 구독
  const { level, coins, streak, experience, totalQuestions, questionsAnswered } =
    useGameStore((state) => state.gameStats);

  return (
    <div className="game-header-container fade-in">
      {/* 레벨 */}
      <div className="stat-box">
        <span className="icon">⭐</span>
        <div className="value">{level}</div>
        <div className="label">Level</div>
      </div>

      {/* 스트릭 */}
      <div className="stat-box">
        <span className="icon">🔥</span>
        <div className="value">{streak}</div>
        <div className="label">Streak</div>
      </div>

      {/* 코인 */}
      <div className="stat-box">
        <span className="icon">🪙</span>
        <div className="value">{coins}</div>
        <div className="label">Coins</div>
      </div>
    </div>
  );
};

export default GameHeader;
