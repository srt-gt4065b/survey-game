import React from 'react';
import { motion } from 'framer-motion';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import useGameStore from '../store/gameStore';
import './GameHeader.css';

const GameHeader = ({ onViewChange, currentView }) => {
  const { user, gameStats, rewards } = useGameStore();
  
  // 경험치 퍼센트 계산
  const expPercentage = (gameStats.experience / 100) * 100;
  
  // 전체 진행률 계산
  const overallProgress = (gameStats.questionsAnswered / gameStats.totalQuestions) * 100;

  return (
    <motion.header 
      className="game-header"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 120 }}
    >
      {/* 사용자 정보 섹션 */}
      <div className="user-section">
        <div className="avatar">
          <span className="avatar-emoji">{user.avatar}</span>
          <div className="level-badge">Lv.{gameStats.level}</div>
        </div>
        <div className="user-info">
          <div className="user-name">{user.name || '플레이어'}</div>
          <div className="user-department">{user.department || '학과'}</div>
        </div>
      </div>

      {/* 게임 상태 섹션 */}
      <div className="stats-section">
        {/* 경험치 바 */}
        <div className="exp-container">
          <div className="exp-label">
            <span>EXP</span>
            <span className="exp-value">{gameStats.experience}/100</span>
          </div>
          <div className="exp-bar">
            <motion.div 
              className="exp-fill"
              initial={{ width: 0 }}
              animate={{ width: `${expPercentage}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* 포인트 & 코인 */}
        <div className="currency-container">
          <div className="currency-item">
            <span className="currency-icon">⭐</span>
            <span className="currency-value">{gameStats.totalPoints}</span>
          </div>
          <div className="currency-item">
            <span className="currency-icon">🪙</span>
            <span className="currency-value">{rewards.coins}</span>
          </div>
          <div className="currency-item">
            <span className="currency-icon">💎</span>
            <span className="currency-value">{rewards.gems}</span>
          </div>
        </div>

        {/* 연속 답변 (Streak) */}
        {gameStats.streak > 0 && (
          <motion.div 
            className="streak-container"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring" }}
          >
            <span className="streak-fire">🔥</span>
            <span className="streak-value">{gameStats.streak}</span>
          </motion.div>
        )}
      </div>

      {/* 진행률 섹션 */}
      <div className="progress-section">
        <div className="progress-circle">
          <CircularProgressbar
            value={overallProgress}
            text={`${Math.round(overallProgress)}%`}
            styles={buildStyles({
              textSize: '28px',
              pathTransitionDuration: 0.5,
              pathColor: `rgba(102, 126, 234, ${overallProgress / 100})`,
              textColor: '#667eea',
              trailColor: '#d6d6d6',
            })}
          />
        </div>
        <div className="progress-info">
          <div className="progress-label">진행도</div>
          <div className="progress-text">
            {gameStats.questionsAnswered} / {gameStats.totalQuestions}
          </div>
          <div className="chapter-info">
            챕터 {gameStats.currentChapter}
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default GameHeader;
