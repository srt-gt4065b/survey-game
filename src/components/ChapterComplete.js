import React from 'react';
import { motion } from 'framer-motion';
import './ChapterComplete.css';

const ChapterComplete = ({ chapterNumber, points }) => {
  return (
    <motion.div 
      className="chapter-complete"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="trophy-icon"
        animate={{ 
          rotate: [0, -10, 10, -10, 0],
          scale: [1, 1.2, 1.2, 1.2, 1]
        }}
        transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
      >
        🏆
      </motion.div>
      
      <motion.h1 
        className="complete-title"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        챕터 {chapterNumber} 완료!
      </motion.h1>
      
      <motion.div 
        className="rewards-section"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: "spring" }}
      >
        <div className="reward-item">
          <span className="reward-icon">💰</span>
          <span className="reward-text">+100 코인</span>
        </div>
        <div className="reward-item">
          <span className="reward-icon">💎</span>
          <span className="reward-text">+10 젬</span>
        </div>
        <div className="reward-item">
          <span className="reward-icon">⭐</span>
          <span className="reward-text">총 {points} 포인트</span>
        </div>
      </motion.div>
      
      <motion.p 
        className="continue-text"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        잠시 후 다음 챕터로 이동합니다...
      </motion.p>
    </motion.div>
  );
};

export default ChapterComplete;
