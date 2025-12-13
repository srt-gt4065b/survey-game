import React from "react";
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
  /** 옵션 배열 안전 처리 */
  const optionList = Array.isArray(question.options)
    ? question.options
    : typeof question.options === "string"
    ? question.options.split("|").map((o) => o.trim())
    : [];

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
          onChange={(e) => (question.temp = e.target.value)}
        />
      )}

      {/* 🔹 MULTI / LIKERT OPTIONS */}
      {(question.type === "multi" || question.type === "likert") && (
        <div className="qc-options-wrapper">
          {optionList.map((opt, idx) => (
            <button
              key={idx}
              className="qc-option-btn"
              onClick={() => onAnswer(opt)}
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
          ➟ Jump
        </button>

        <button
          className="qc-btn next"
          disabled={question.type !== "text"}
          onClick={() => onAnswer(question.temp || "")}
        >
          Next →
        </button>

      </div>
    </div>
  );
};

export default QuestionCard;
