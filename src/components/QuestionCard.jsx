import React, { useState } from "react";
import "./QuestionCard.css";

const QuestionCard = ({
  question,
  questionNumber,
  totalQuestions,
  chapterNumber,
  chapterName,
  onAnswer,
  onBack,
  onSkip,
  onJump,
}) => {
  const [selected, setSelected] = useState(null);
  const [textValue, setTextValue] = useState("");

  // 옵션 배열 안전 처리
  const getOptionList = () => {
    if (!question.options) return [];
    if (Array.isArray(question.options)) return question.options;
    if (typeof question.options === "string") {
      // 파이프(|) 또는 쉼표(,)로 분리
      return question.options
        .split(/[|,]/)
        .map((o) => o.trim())
        .filter(Boolean);
    }
    return [];
  };

  const optionList = getOptionList();

  // 옵션 선택 핸들러
  const handleOptionClick = (opt, idx) => {
    setSelected(idx);
  };

  // Next 버튼 클릭
  const handleNext = () => {
    if (question.type === "text") {
      if (textValue.trim()) {
        onAnswer(textValue);
        setTextValue("");
      }
    } else if (selected !== null) {
      onAnswer(optionList[selected]);
      setSelected(null);
    }
  };

  // Back 버튼
  const handleBack = () => {
    setSelected(null);
    setTextValue("");
    if (onBack) onBack();
  };

  // Skip 버튼
  const handleSkip = () => {
    setSelected(null);
    setTextValue("");
    if (onSkip) onSkip();
  };

  // Jump 버튼
  const handleJump = () => {
    setSelected(null);
    setTextValue("");
    if (onJump) onJump();
  };

  // Next 버튼 활성화 조건
  const isNextEnabled =
    question.type === "text" ? textValue.trim().length > 0 : selected !== null;

  return (
    <div className="question-card">
      {/* 🔹 Section Header */}
      <div className="qc-section-header">
        <div className="qc-section-left">
          <span className="qc-section-number">Section {chapterNumber}.</span>
          <span className="qc-section-name">{chapterName}</span>
        </div>
        <div className="qc-section-progress">
          {questionNumber} / {totalQuestions}
        </div>
      </div>

      {/* 🔹 Question Text */}
      <h2 className="qc-question-text">{question.text}</h2>

      {/* 🔹 TEXT TYPE */}
      {question.type === "text" && (
        <textarea
          className="qc-textarea"
          placeholder="Write your answer..."
          value={textValue}
          onChange={(e) => setTextValue(e.target.value)}
        />
      )}

      {/* 🔹 MULTI / LIKERT OPTIONS */}
      {(question.type === "multi" || question.type === "likert") &&
        optionList.length > 0 && (
          <div className="qc-options-wrapper">
            {optionList.map((opt, idx) => (
              <button
                key={idx}
                className={`qc-option-btn ${selected === idx ? "selected" : ""}`}
                onClick={() => handleOptionClick(opt, idx)}
              >
                {question.type === "multi" && (
                  <span className="qc-option-number">{idx + 1}</span>
                )}
                <span className="qc-option-text">{opt}</span>
              </button>
            ))}
          </div>
        )}

      {/* 🔹 Buttons Row */}
      <div className="qc-button-row">
        <button className="qc-btn back" onClick={handleBack}>
          <span className="btn-icon">←</span>
          <span className="btn-label">Back</span>
        </button>

        <button className="qc-btn skip" onClick={handleSkip}>
          <span className="btn-icon">⏭</span>
          <span className="btn-label">Skip</span>
        </button>

        <button className="qc-btn jump" onClick={handleJump}>
          <span className="btn-icon">→</span>
          <span className="btn-label">Jump</span>
        </button>

        <button
          className={`qc-btn next ${isNextEnabled ? "active" : ""}`}
          disabled={!isNextEnabled}
          onClick={handleNext}
        >
          <span className="btn-label">Next</span>
          <span className="btn-icon">→</span>
        </button>
      </div>
    </div>
  );
};

export default QuestionCard;
