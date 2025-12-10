import React, { useState } from "react";
import "./QuestionCard.css";

const QuestionCard = ({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
}) => {
  const [selected, setSelected] = useState("");

  const { text, type, options, section } = question;

  // -------------------------------
  // Likert 5점 척도 자동 적용
  // -------------------------------
  const likert = [
    "😍 Strongly Agree",
    "🙂 Agree",
    "😐 Neutral",
    "😕 Disagree",
    "😡 Strongly Disagree",
  ];

  const answerOptions = type === "likert" ? likert : options || [];

  return (
    <div className="question-card fade-in">
      {/* 상단 정보 */}
      <div className="q-header">
        <div className="q-section">{section}</div>
        <div className="q-progress">
          {questionNumber} / {totalQuestions}
        </div>
      </div>

      {/* 질문 내용 */}
      <h2 className="q-text">{text}</h2>

      {/* 객관식 옵션들 */}
      {type !== "text" && (
        <div className="q-options">
          {answerOptions.map((opt, idx) => (
            <button
              key={idx}
              className={`q-option ${selected === opt ? "selected" : ""}`}
              onClick={() => setSelected(opt)}
            >
              {opt}
            </button>
          ))}
        </div>
      )}

      {/* 주관식(텍스트) 질문 */}
      {type === "text" && (
        <textarea
          className="q-textarea"
          placeholder="Write your answer..."
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        />
      )}

      {/* Next 버튼 */}
      <div className="q-footer">
        <button
          className={`next-btn ${selected ? "active" : ""}`}
          disabled={!selected}
          onClick={() => {
            if (!selected) return;
            onAnswer(selected);
            setSelected("");
          }}
        >
          Next →
        </button>
      </div>
    </div>
  );
};

export default QuestionCard;
