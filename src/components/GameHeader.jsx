import React from "react";
import "./GameHeader.css";
import useGameStore from "../store/gameStore";

const GameHeader = () => {
  const { gameStats } = useGameStore();

  return (
    <div className="game-header">
      {/* Level */}
      <div className="stat">
        <div className="stat-icon">⭐</div>
        <div className="stat-value">{gameStats.level}</div>
        <div className="stat-label">Level</div>
      </div>

      {/* Streak */}
      <div className="stat">
        <div className="stat-icon">🔥</div>
        <div className="stat-value">{gameStats.streak}</div>
        <div className="stat-label">Streak</div>
      </div>

      {/* Coins */}
      <div className="stat">
        <div className="stat-icon">💰</div>
        <div className="stat-value">{gameStats.points}</div>
        <div className="stat-label">Coins</div>
      </div>
    </div>
  );
};

export default GameHeader;
