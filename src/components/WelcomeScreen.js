// src/components/WelcomeScreen.js
import React, { useState } from "react";
import { motion } from "framer-motion";
import useGameStore from "../store/gameStore";
import toast from "react-hot-toast";
import "./WelcomeScreen.css";

const avatars = [
  { emoji: "👨‍💼", color: "#FF6B9D" },
  { emoji: "👨‍🎓", color: "#C084FC" },
  { emoji: "🧑‍💻", color: "#60D5E8" },
  { emoji: "👩‍🎓", color: "#FFA07A" },
  { emoji: "🧑‍🔬", color: "#98D8C8" },
  { emoji: "👨‍🏫", color: "#FFB347" },
];

const departments = [
  "경영학과 (Management)",
  "글로벌융합비즈니스학과 (Global Convergence Mgmt.)",
  "AI빅데이터학과 (AI BigData)",
  "글로벌호스피탤리티학과 (Global Hotel Mgmt.)",
  "JCFS (Jungwoo Kim College of Future Studies)",
  "Others"
];

const languages = [
  { code: "en", label: "English (default)" },
  { code: "ko", label: "한국어" },
  { code: "zh", label: "中文" },
  { code: "kk", label: "Қазақша" },
  { code: "uz", label: "Oʻzbekcha" },
  { code: "bn", label: "বাংলা (beta)" },
];

const WelcomeScreen = ({ onStart }) => {
  const { setUser, resetGame, setLanguage } = useGameStore();

  const [formData, setFormData] = useState({
    name: "",
    studentId: "",
    department: "",
    avatar: "👨‍💼",
    language: "en",
  });

  const [selectedAvatar, setSelectedAvatar] = useState(0);
  const [showInstructions, setShowInstructions] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAvatarSelect = (index) => {
    setSelectedAvatar(index);
    setFormData((prev) => ({
      ...prev,
      avatar: avatars[index].emoji,
    }));
  };

  const handleStart = () => {
    const { name, studentId, department, avatar, language } = formData;

    // 관리자 로그인
    if (name === "admin" && studentId === "admin") {
      setUser({
        id: "admin",
        name: "Administrator",
        studentId: "admin",
        department: "admin",
        avatar: "🛠️",
        language,
        isAdmin: true,
      });
      setLanguage(language);
      resetGame();
      toast.success("Logged in as Administrator.");
      onStart();
      return;
    }

    // 필수값 체크
    if (!name || !studentId || !department) {
      toast.error("Please fill in all fields!");
      return;
    }

    setUser({
      id: studentId,
      name,
      studentId,
      department,
      avatar,
      language,
      isAdmin: false,
    });
    setLanguage(language);
    resetGame();

    toast.success(`Welcome, ${name}! 🎮`, {
      duration: 3000,
      position: "top-center",
    });

    onStart();
  };

  return (
    <div className="game-welcome-screen">
      {/* 게임 컨트롤러 장식 */}
      <div className="game-controller left-controller">🎮</div>
      <div className="game-controller right-controller">🎮</div>

      <motion.div
        className="game-welcome-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* 타이틀 */}
        <motion.div
          className="game-title-section"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="game-title">Endicott Survey Game</h1>
        </motion.div>

        {/* 게임 특징 */}
        <div className="game-features">
          <div className="game-feature-item">
            <span className="game-feature-icon">🏆</span>
            <span className="game-feature-text">Real-time Ranking</span>
          </div>
          <div className="game-feature-item">
            <span className="game-feature-icon">💎</span>
            <span className="game-feature-text">Earn Rewards</span>
          </div>
          <div className="game-feature-item">
            <span className="game-feature-icon">🎯</span>
            <span className="game-feature-text">Achievements</span>
          </div>
          <div className="game-feature-item">
            <span className="game-feature-icon">🔥</span>
            <span className="game-feature-text">Streak Bonus</span>
          </div>
        </div>

        {/* 캐릭터 선택 */}
        <div className="game-avatar-section">
          <div className="game-avatar-grid">
            {avatars.map((avatar, index) => (
              <motion.button
                key={index}
                className={`game-avatar-card ${
                  selectedAvatar === index ? "selected" : ""
                }`}
                style={{
                  background: selectedAvatar === index 
                    ? `linear-gradient(135deg, ${avatar.color} 0%, ${avatar.color}dd 100%)`
                    : avatar.color
                }}
                onClick={() => handleAvatarSelect(index)}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="game-avatar-emoji">{avatar.emoji}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* 입력 폼 */}
        <div className="game-form-section">
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleInputChange}
            className="game-input"
            maxLength={20}
          />

          <input
            type="text"
            name="studentId"
            placeholder="Student ID"
            value={formData.studentId}
            onChange={handleInputChange}
            className="game-input"
            maxLength={20}
          />

          <select
            name="department"
            value={formData.department}
            onChange={handleInputChange}
            className="game-select"
          >
            <option value="">Select Department</option>
            {departments.map((dept, index) => (
              <option key={index} value={dept}>
                {dept}
              </option>
            ))}
          </select>

          <select
            name="language"
            value={formData.language}
            onChange={handleInputChange}
            className="game-select"
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        {/* 시작 버튼 */}
        <motion.button
          className="game-start-button"
          onClick={handleStart}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Start Game
        </motion.button>

        {/* How to Play 버튼 */}
        <motion.button
          className="game-instructions-button"
          onClick={() => setShowInstructions(!showInstructions)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="info-icon">ⓘ</span> How to Play
        </motion.button>

        {/* 설명 팝업 */}
        {showInstructions && (
          <motion.div
            className="game-instructions-popup"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <div className="popup-content">
              <h3>📋 How to Play</h3>
              <ul>
                <li>🎯 Earn bonus points for quick answers</li>
                <li>🔥 Get combo bonuses for consecutive answers</li>
                <li>🏆 Compete with friends on the leaderboard</li>
                <li>💎 Complete achievements and receive rewards</li>
              </ul>
              <button 
                className="popup-close-btn"
                onClick={() => setShowInstructions(false)}
              >
                Got it!
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default WelcomeScreen;
