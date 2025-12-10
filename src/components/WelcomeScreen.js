import React, { useState } from 'react';
import { motion } from 'framer-motion';
import useGameStore from '../store/gameStore';
import toast from 'react-hot-toast';
import './WelcomeScreen.css';

const WelcomeScreen = ({ onStart }) => {
  const { setUser, resetGame } = useGameStore();
  const [formData, setFormData] = useState({
    name: '',
    studentId: '',
    department: '',
    avatar: '🎓',
  });
  const [selectedAvatar, setSelectedAvatar] = useState('🎓');

  const avatars = ['🎓', '👨‍🎓', '👩‍🎓', '🧑‍🎓', '🦸', '🦹', '🧙', '🧝', '🎯', '🎮', '🎨', '🎭'];
  
  const departments = [
    '경영학과',
    '글로벌융합비즈니스학과',
    'AI빅데이터학과',
    '글로벌호스피텔리티학과',
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAvatarSelect = (avatar) => {
    setSelectedAvatar(avatar);
    setFormData(prev => ({
      ...prev,
      avatar,
    }));
  };

  const handleStart = () => {
  const { name, studentId, department } = formData;

  // 🔐 1) 관리자(admin) 예외 처리 — 학과 없이 로그인 허용
  if (name === "admin" && studentId === "admin") {
    setUser({
      id: "admin",
      name: "관리자",
      studentId: "admin",
      department: "admin",
      avatar: formData.avatar,
    });

    resetGame();
    toast.success("관리자 로그인 완료!", {
      position: "top-center",
      duration: 1500,
    });

    onStart();
    return;
  }

  // 🔎 2) 일반 사용자 검증
  if (!name || !studentId || !department) {
    toast.error("모든 필드를 입력해주세요!");
    return;
  }

  // 3) 정상 학생 로그인 처리
  setUser({
    id: studentId,
    name,
    studentId,
    department,
    avatar: formData.avatar,
  });

  resetGame();

  toast.success(`환영합니다, ${name}님! 🎮`, {
    duration: 3000,
    position: "top-center",
    style: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
    },
  });

  onStart();
};



  return (
    <div className="welcome-screen">
      <motion.div 
        className="welcome-container"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* 타이틀 */}
        <div className="welcome-header">
          <motion.h1 
            className="welcome-title"
            initial={{ y: -50 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 100 }}
          >
            🎮 설문 퀘스트 🎮
          </motion.h1>
          <motion.p 
            className="welcome-subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            대학생 만족도 조사를 게임처럼 즐겨보세요!
          </motion.p>
        </div>

        {/* 게임 특징 */}
        <motion.div 
          className="features-grid"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="feature-card">
            <span className="feature-icon">🏆</span>
            <span className="feature-text">실시간 순위</span>
          </div>
          <div className="feature-card">
            <span className="feature-icon">💎</span>
            <span className="feature-text">보상 획득</span>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🎯</span>
            <span className="feature-text">업적 달성</span>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🔥</span>
            <span className="feature-text">연속 보너스</span>
          </div>
        </motion.div>

        {/* 캐릭터 선택 */}
        <motion.div 
          className="avatar-section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <h3>캐릭터 선택</h3>
          <div className="avatar-grid">
            {avatars.map((avatar, index) => (
              <motion.button
                key={index}
                className={`avatar-option ${selectedAvatar === avatar ? 'selected' : ''}`}
                onClick={() => handleAvatarSelect(avatar)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 + index * 0.05 }}
              >
                {avatar}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* 정보 입력 */}
        <motion.div 
          className="form-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <input
            type="text"
            name="name"
            placeholder="이름"
            value={formData.name}
            onChange={handleInputChange}
            className="form-input"
            maxLength={20}
          />
          
          <input
            type="text"
            name="studentId"
            placeholder="학번"
            value={formData.studentId}
            onChange={handleInputChange}
            className="form-input"
            maxLength={20}
          />
          
          <select
            name="department"
            value={formData.department}
            onChange={handleInputChange}
            className="form-select"
          >
            <option value="">학과 선택</option>
            {departments.map((dept, index) => (
              <option key={index} value={dept}>{dept}</option>
            ))}
          </select>
        </motion.div>

        {/* 시작 버튼 */}
        <motion.button
          className="start-button"
          onClick={handleStart}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          🚀 게임 시작하기
        </motion.button>

        {/* 설명 */}
        <motion.div 
          className="instructions"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
        >
          <h4>📋 게임 방법</h4>
          <ul>
            <li>💡 빠른 답변으로 보너스 포인트를 획득하세요</li>
            <li>🔥 연속 답변으로 콤보 보너스를 받으세요</li>
            <li>🏆 친구들과 순위를 경쟁하세요</li>
            <li>💎 업적을 달성하고 보상을 받으세요</li>
          </ul>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default WelcomeScreen;
