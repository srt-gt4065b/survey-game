// src/components/WelcomeScreen.js
import React, { useState } from "react";
import { motion } from "framer-motion";
import useGameStore from "../store/gameStore";
import toast from "react-hot-toast";
import "./WelcomeScreen.css";

const avatars = ["🎓", "👨‍🎓", "👩‍🎓", "🧑‍🎓", "🦸", "🦹", "🧙", "🧝", "🎯", "🎮", "🎨", "🎭"];

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
    avatar: "🎓",
    language: "en",
  });

  const [selectedAvatar, setSelectedAvatar] = useState("🎓");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAvatarSelect = (avatar) => {
    setSelectedAvatar(avatar);
    setFormData((prev) => ({
      ...prev,
      avatar,
    }));
  };

  const handleStart = () => {
    const { name, studentId, department, avatar, language } = formData;

    // 🔐 관리자 로그인 (admin / admin)
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

    // 일반 학생: 필수값 체크
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
      style: {
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
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
            🎮 Survey Quest 🎮
          </motion.h1>
          <motion.p
            className="welcome-subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Enjoy the student satisfaction survey like a game!
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
            <span className="feature-text">Real-time Ranking</span>
          </div>
          <div className="feature-card">
            <span className="feature-icon">💎</span>
            <span className="feature-text">Earn Rewards</span>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🎯</span>
            <span className="feature-text">Achievements</span>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🔥</span>
            <span className="feature-text">Streak Bonus</span>
          </div>
        </motion.div>

        {/* 캐릭터 선택 */}
        <motion.div
          className="avatar-section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <h3>Choose Your Character</h3>
          <div className="avatar-grid">
            {avatars.map((avatar, index) => (
              <motion.button
                key={index}
                className={`avatar-option ${
                  selectedAvatar === avatar ? "selected" : ""
                }`}
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
            placeholder="Name"
            value={formData.name}
            onChange={handleInputChange}
            className="form-input"
            maxLength={20}
          />

          <input
            type="text"
            name="studentId"
            placeholder="Student ID"
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
            <option value="">Select Department</option>
            {departments.map((dept, index) => (
              <option key={index} value={dept}>
                {dept}
              </option>
            ))}
          </select>

          {/* 언어 선택 */}
          <select
            name="language"
            value={formData.language}
            onChange={handleInputChange}
            className="form-select"
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.label}
              </option>
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
          🚀 Start Game
        </motion.button>

        {/* 설명 */}
        <motion.div
          className="instructions"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
        >
          <h4>📋 How to Play</h4>
          <ul>
            <li>💡 Earn bonus points for quick answers</li>
            <li>🔥 Get combo bonuses for consecutive answers</li>
            <li>🏆 Compete with friends on the leaderboard</li>
            <li>💎 Complete achievements and receive rewards</li>
          </ul
