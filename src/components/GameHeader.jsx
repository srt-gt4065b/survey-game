import React from "react";
import useGameStore from "../store/gameStore";
import "./GameHeader.css";

const GameHeader = () => {
  const { level, streak, coins } = useGameStore();

  return (
    <div className="game-header">
      
      <div className="stat-box">
        <div className="stat-icon">⭐</div>
        <div className="stat-value">{level}</div>
        <div className="stat-label">Level</div>
      </div>

      <div className="stat-box">
        <div className="stat-icon">🔥</div>
        <div className="stat-value">{streak}</div>
        <div className="stat-label">Streak</div>
      </div>

      <div className="stat-box">
        <div className="stat-icon">🪙</div>
        <div className="stat-value">{coins}</div>
        <div className="stat-label">Coins</div>
      </div>

    </div>
  );
};

export default GameHeader;
