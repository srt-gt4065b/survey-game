// src/components/WelcomeScreen.js
import React, { useState } from "react";
import { motion } from "framer-motion";
import useGameStore from "../store/gameStore";
import toast from "react-hot-toast";
import "./WelcomeScreen.css";

const WelcomeScreen = ({ onStart }) => {
  const { setUser, resetGame, setLanguage } = useGameStore();

  const [formData, setFormData] = useState({
    name: "",
    studentId: "",
    department: "",
    avatar: "🎓",
    language: "en", // 기본값
  });

  const [selectedAvatar, setSelectedAvatar] = useState("🎓");

  // 아바타
  const avatars = [
    "🎓",
    "👨‍🎓",
    "👩‍🎓",
    "🧑‍🎓",
    "🦸",
    "🦹",
    "🧙",
    "🧝",
    "🎯",
    "🎮",
    "🎨",
    "🎭",
  ];

  // 교수님이 정리한 3개 학과
  const departments = [
    "경영학과",
    "글로벌융합비즈니스학과",
    "AI빅데이터학과",
  ];

  // 지원 언어 목록
  const languages = [
    { code: "en", label: "English" },
    { code: "ko", label: "한국어" },
    { code: "zh", label: "中文" },
    { code: "kk", label: "Қазақша" },
    { code: "bn", label: "বাংলা" },
    { code: "uz", label: "Oʻzbekcha" },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAvatarSelect = (avatar) => {
    setSelectedAvatar(avatar);
    setFormData((prev) => ({ ...prev, avatar }));
  };

  const handleStart = () => {
    const { name, studentId, department, avatar, language } = formData;

    // ===========================
    // 🔐 관리자 로그인
    // ===========================
    if (name === "admin" && studentId === "admin") {
      setUser({
        id: "admin",
        name: "관리자",
        studentId: "admin",
        department: "admin",
        avatar: "🛠",
        language: language || "en",
        isAdmin: true,
      });

      setLanguage(language || "en");
      resetGame();
      toast.success("관리자 모드로 로그인되었습니다.");
      onStart();
      return;
    }

    // ===========================
    // 학생 로그인 유효성 검사
    // ===========================
    if (!name || !studentId || !department || !language) {
      toast.error("이름, 학번, 학과, 언어를 모두 입력하세요!");
      return;
    }

    // ===========================
    // 유저 정보 저장
    // ===========================
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

    toast.success(`환영합니다, ${name}님! 🎮`, {
      duration: 2200,
      position: "top-center",
      style: {
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
      },
    });

    // 설문 시작
    onStart();
  };

  return (
    <div className="welcome-screen">
      <motion.div
        className="welcome-container"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45 }}
      >
        {/* 타이틀 */}
        <div className="welcome-header">
          <motion.h1
            className="welcome-title"
            initial={{ y: -40 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 100 }}
          >
            🎮 설문 퀘스트 🎮
          </motion.h1>
          <motion.p
            className="welcome-subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
          >
            대학생 만족도 조사를 게임처럼 즐겨보세요!
          </motion.p>
        </div>

        {/* 아바타 선택 */}
        <motion.div
          className="avatar-section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
        >
          <h3>캐릭터 선택</h3>
          <div className="avatar-grid">
            {avatars.map((avatar, index) => (
              <motion.button
                key={index}
                className={`avatar-option ${
                  selectedAvatar === avatar ? "selected" : ""
                }`}
                onClick={() => handleAvatarSelect(avatar)}
                whileHover={{ scale: 1.12 }}
                whileTap={{ scale: 0.9 }}
              >
                {avatar}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* 입력 폼 */}
        <motion.div
          className="form-section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <input
            type="text"
            name="name"
            placeholder="이름"
            value={formData.name}
            onChange={handleInputChange}
            className="form-input"
          />

          <input
            type="text"
            name="studentId"
            placeholder="학번"
            value={formData.studentId}
            onChange={handleInputChange}
            className="form-input"
          />

          <select
            name="department"
            value={formData.department}
            onChange={handleInputChange}
            className="form-select"
          >
            <option value="">학과 선택</option>
            {departments.map((d, idx) => (
              <option key={idx} value={d}>
                {d}
              </option>
            ))}
          </select>

          {/* 🌍 언어 선택 */}
          <select
            name="language"
            value={formData.language}
            onChange={handleInputChange}
            className="form-select"
          >
            <option value="">설문 언어 선택</option>
            {languages.map((lng) => (
              <option key={lng.code} value={lng.code}>
                {lng.label}
              </option>
            ))}
          </select>
        </motion.div>

        <motion.button
          className="start-button"
          onClick={handleStart}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.92 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          🚀 설문 시작하기
        </motion.button>
      </motion.div>
    </div>
  );
};

export default WelcomeScreen;
