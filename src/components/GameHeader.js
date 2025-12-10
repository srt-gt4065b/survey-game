// src/components/GameHeader.js
import React from "react";
import { motion } from "framer-motion";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import useGameStore from "../store/gameStore";
import "./GameHeader.css";

const GameHeader = () => {
  const { user, gameStats } = useGameStore();

  // 안전한 기본값
  const level = gameStats?.level ?? 1;
  const exp = gameStats?.experience ?? 0;
  const coins = gameStats?.coins ?? 0;
  const streak = gameStats?.streak ?? 0;

  const totalQuestions = gameStats?.totalQuestions ?? 1;
  const answered = gameStats?.questionsAnswered ?? 0;

  const chapter = gameStats?.currentChapter ?? 1;

  // 계산
  const expPercent = Math.min((exp / 100) * 100, 100);
  const progressPercent = Math.min((answered / totalQuestions) * 100, 100);

  return (
    <motion.header
      className="game-header"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 120 }}
    >
      {/* 사용자 정보 */}
      <div className="user-section">
        <div className="avatar">
          <span className="avatar-emoji">{user?.avatar || "🎓"}</span>
          <div className="level-badge">Lv.{level}</div>
        </div>

        <div className="user-info">
          <div className="user-name">{user?.name || "Player"}</div>
          <div className="user-department">
            {user?.department || "Department"}
          </div>
        </div>

        {/* 코인 */}
        <div className="coins-box">
          <span className="coins-icon">💰</span>
          <span className="coins-value">{coins}</span>
        </div>
      </div>

      {/* 경험치 + 스트릭 */}
      <div className="stats-section">
        {/* EXP */}
        <div className="exp-container">
          <div className="exp-label">
            <span>EXP</span>
            <span>{exp}/100</span>
          </div>

          <div className="exp-bar">
            <motion.div
              className="exp-fill"
              animate={{ width: `${expPercent}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>

        {/* Streak */}
        {streak > 0 && (
          <div className="streak-container">
            <span className="streak-fire">🔥</span>
            <span className="streak-value">{streak}</span>
          </div>
        )}
      </div>

      {/* 전체 진행률 */}
      <div className="progress-section">
        <div className="progress-circle">
          <CircularProgressbar
            value={progressPercent}
            text={`${Math.round(progressPercent)}%`}
            styles={buildStyles({
              textSize: "28px",
              pathTransitionDuration: 0.5,
              pathColor: "#667eea",
              textColor: "#667eea",
              trailColor: "#d6d6d6",
            })}
          />
        </div>

        <div className="progress-info">
          <div className="progress-label">Progress</div>
          <div className="progress-text">
            {answered} / {totalQuestions}
          </div>
          <div className="chapter-info">Chapter {chapter}</div>
        </div>
      </div>
    </motion.header>
  );
};

export default GameHeader;
