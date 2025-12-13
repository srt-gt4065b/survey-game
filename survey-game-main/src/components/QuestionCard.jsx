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

  // question이 없으면 로딩 표시
  if (!question) {
    return <div className="question-card loading">Loading...</div>;
  }

  // 기본 Likert 5점 척도
  const defaultLikertOptions = [
    "Strongly Agree",
    "Agree",
    "Neutral",
    "Disagree",
    "Strongly Disagree",
  ];

  // 옵션 배열 처리
  const getOptionList = () => {
    const opts = question.options;

    // 이미 배열인 경우
    if (Array.isArray(opts) && opts.length > 0) {
      return opts;
    }

    // 문자열인 경우 분리
    if (typeof opts === "string" && opts.trim()) {
      if (opts.includes("|")) {
        return opts.split("|").map((o) => o.trim()).filter(Boolean);
      }
      if (opts.includes(",")) {
        return opts.split(",").map((o) => o.trim()).filter(Boolean);
      }
      return [opts.trim()];
    }

    // likert 타입인데 options가 없으면 기본 Likert 사용
    if (question.type === "likert") {
      return defaultLikertOptions;
    }

    return [];
  };

  const optionList = getOptionList();

  // 옵션 선택 핸들러
  const handleOptionClick = (opt) => {
    setSelected(opt);
  };

  // Next 버튼 클릭
  const handleNext = () => {
    if (question.type === "text") {
      if (textValue.trim()) {
        onAnswer(textValue.trim());
        setTextValue("");
      }
    } else if (selected) {
      onAnswer(selected);
      setSelected(null);
    }
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
                className={`qc-option-btn ${selected === opt ? "selected" : ""}`}
                onClick={() => handleOptionClick(opt)}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

      {/* 🔹 Buttons Row */}
      <div className="qc-button-row">
        <button className="qc-btn back" onClick={onBack}>
          ← Back
        </button>

        <button className="qc-btn skip" onClick={onSkip}>
          ⏩ Skip
        </button>

        <button className="qc-btn jump" onClick={onJump}>
          → Jump
        </button>

        <button
          className={`qc-btn next ${isNextEnabled ? "enabled" : ""}`}
          disabled={!isNextEnabled}
          onClick={handleNext}
        >
          Next →
        </button>
      </div>
    </div>
  );
};

export default QuestionCard;
