import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { db } from '../firebase/config';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import useGameStore from '../store/gameStore';
import './Leaderboard.css';

const Leaderboard = ({ onBack }) => {
  const { user, gameStats } = useGameStore();
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [activeTab, setActiveTab] = useState('overall'); // overall, department, weekly
  const [isLoading, setIsLoading] = useState(true);

  // 실시간 리더보드 데이터 구독
  useEffect(() => {
    const loadLeaderboard = () => {
      setIsLoading(true);
      
      const q = query(
        collection(db, 'leaderboard'),
        orderBy('totalPoints', 'desc'),
        limit(100)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map((doc, index) => ({
          id: doc.id,
          rank: index + 1,
          ...doc.data(),
        }));
        
        setLeaderboardData(data);
        setIsLoading(false);
      });

      return unsubscribe;
    };

    const unsubscribe = loadLeaderboard();
    return () => unsubscribe();
  }, []);

  // 현재 사용자의 순위 찾기
  const getUserRank = () => {
    const userIndex = leaderboardData.findIndex(item => item.id === user.id);
    return userIndex !== -1 ? userIndex + 1 : '-';
  };

  // 모의 데이터 (Firebase 연결 전 테스트용)
  const mockData = [
    { id: '1', rank: 1, name: '김철수', department: 'AI경영학과', level: 15, totalPoints: 1520, avatar: '🎓' },
    { id: '2', rank: 2, name: '이영희', department: '컴퓨터공학과', level: 14, totalPoints: 1450, avatar: '👩‍🎓' },
    { id: '3', rank: 3, name: '박민수', department: 'AI경영학과', level: 13, totalPoints: 1380, avatar: '🧑‍🎓' },
    { id: '4', rank: 4, name: '정소연', department: '경영학과', level: 12, totalPoints: 1250, avatar: '👨‍🎓' },
    { id: '5', rank: 5, name: '최준호', department: '소프트웨어학과', level: 11, totalPoints: 1180, avatar: '🎯' },
    { id: 'user', rank: getUserRank(), name: user.name, department: user.department, level: gameStats.level, totalPoints: gameStats.totalPoints, avatar: user.avatar },
  ];

  const displayData = leaderboardData.length > 0 ? leaderboardData : mockData;

  // 순위에 따른 메달 이모지
  const getRankEmoji = (rank) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  // 순위 색상
  const getRankColor = (rank) => {
    switch (rank) {
      case 1: return '#FFD700';
      case 2: return '#C0C0C0';
      case 3: return '#CD7F32';
      default: return '#667eea';
    }
  };

  // 탭 필터링
  const getFilteredData = () => {
    switch (activeTab) {
      case 'department':
        return displayData.filter(item => item.department === user.department);
      case 'weekly':
        // 주간 데이터는 별도 처리 필요
        return displayData.slice(0, 10);
      default:
        return displayData;
    }
  };

  return (
    <div className="leaderboard-container">
      {/* 헤더 */}
      <div className="leaderboard-header">
        <button className="back-button" onClick={onBack}>
          ← 돌아가기
        </button>
        <h1>🏆 리더보드</h1>
      </div>

      {/* 탭 메뉴 */}
      <div className="tab-menu">
        <button 
          className={`tab-button ${activeTab === 'overall' ? 'active' : ''}`}
          onClick={() => setActiveTab('overall')}
        >
          전체
        </button>
        <button 
          className={`tab-button ${activeTab === 'department' ? 'active' : ''}`}
          onClick={() => setActiveTab('department')}
        >
          학과
        </button>
        <button 
          className={`tab-button ${activeTab === 'weekly' ? 'active' : ''}`}
          onClick={() => setActiveTab('weekly')}
        >
          주간
        </button>
      </div>

      {/* 내 순위 카드 */}
      <motion.div 
        className="my-rank-card"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="my-rank-info">
          <span className="my-rank-label">내 순위</span>
          <span className="my-rank-number" style={{ color: getRankColor(getUserRank()) }}>
            {getRankEmoji(getUserRank())}
          </span>
        </div>
        <div className="my-stats">
          <div className="stat-item">
            <span className="stat-label">레벨</span>
            <span className="stat-value">{gameStats.level}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">포인트</span>
            <span className="stat-value">{gameStats.totalPoints}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">답변</span>
            <span className="stat-value">{gameStats.questionsAnswered}</span>
          </div>
        </div>
      </motion.div>

      {/* 리더보드 목록 */}
      <div className="leaderboard-list">
        {isLoading ? (
          <div className="loading">로딩 중...</div>
        ) : (
          getFilteredData().map((item, index) => (
            <motion.div
              key={item.id}
              className={`leaderboard-item ${item.id === user.id ? 'current-user' : ''}`}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="rank-section">
                <span className="rank" style={{ color: getRankColor(item.rank) }}>
                  {getRankEmoji(item.rank)}
                </span>
              </div>
              
              <div className="player-info">
                <div className="player-avatar">{item.avatar}</div>
                <div className="player-details">
                  <div className="player-name">{item.name}</div>
                  <div className="player-department">{item.department}</div>
                </div>
              </div>
              
              <div className="player-stats">
                <div className="level-badge">Lv.{item.level}</div>
                <div className="points">{item.totalPoints} pts</div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* 하단 통계 */}
      <div className="leaderboard-footer">
        <div className="stat-card">
          <span className="stat-icon">👥</span>
          <span className="stat-text">총 {displayData.length}명 참여</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon">📊</span>
          <span className="stat-text">평균 {Math.round(displayData.reduce((acc, cur) => acc + cur.totalPoints, 0) / displayData.length)} pts</span>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
