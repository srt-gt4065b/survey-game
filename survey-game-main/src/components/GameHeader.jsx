import React from "react";
import useGameStore from "../store/gameStore";
import "./GameHeader.css";

const GameHeader = ({ overallProgress }) => {
  const { user, gameStats } = useGameStore();

  return (
    <div className="game-header">
      {/* 사용자 정보 섹션 */}
      <div className="user-info-section">
        <div className="user-avatar">{user?.avatar || "🎓"}</div>
        <div className="user-details">
          <div className="user-name">{user?.name || "Student"}</div>
          <div className="user-meta">
            {user?.studentId && <span>ID: {user.studentId}</span>}
            {user?.department && <span className="user-dept">{user.department}</span>}
          </div>
        </div>
      </div>

      {/* 전체 진행률 */}
      {overallProgress && (
        <div className="overall-progress-section">
          <div className="progress-text">
            Overall Progress: {overallProgress.current} / {overallProgress.total}
          </div>
          <div className="progress-bar-container">
            <div 
              className="progress-bar-fill" 
              style={{ width: `${(overallProgress.current / overallProgress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* 게임 스탯 */}
      <div className="stats-row">
        <div className="stat-box">
          <div className="stat-icon">⭐</div>
          <div className="stat-value">{gameStats?.level || 1}</div>
          <div className="stat-label">Level</div>
        </div>

        <div className="stat-box">
          <div className="stat-icon">💯</div>
          <div className="stat-value">{gameStats?.experience || 0}</div>
          <div className="stat-label">EXP</div>
        </div>

        <div className="stat-box">
          <div className="stat-icon">🔥</div>
          <div className="stat-value">{gameStats?.streak || 0}</div>
          <div className="stat-label">Streak</div>
        </div>

        <div className="stat-box">
          <div className="stat-icon">🪙</div>
          <div className="stat-value">{gameStats?.coins || 0}</div>
          <div className="stat-label">Coins</div>
        </div>
      </div>
    </div>
  );
};

export default GameHeader;
