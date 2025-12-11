import React, { useState } from "react";
import "./QuestionCard.css";

const QuestionCard = ({
  question,
  questionNumber,
  totalQuestions,
  overallNumber,
  overallTotal,
  onAnswer,
}) => {
  const [selected, setSelected] = useState("");

  const { text, type, options, section } = question;

  // Likert 5점 척도
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
        <div className="q-progress-group">
          <div className="q-progress-chapter">
            Chapter: {questionNumber} / {totalQuestions}
          </div>
          <div className="q-progress-overall">
            Overall: {overallNumber} / {overallTotal}
          </div>
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

// Options 배열로 변환 (문자열인 경우 처리)
const getOptionsArray = (options) => {
  if (!options) return [];
  if (Array.isArray(options)) return options;  // 이미 배열이면 그대로
  
  if (typeof options === 'string') {
    // 쉼표로 구분: "Regular,Transfer,Exchange"
    if (options.includes(',')) {
      return options.split(',').map(o => o.trim()).filter(Boolean);
    }
    // 파이프로 구분: "Regular|Transfer|Exchange"
    if (options.includes('|')) {
      return options.split('|').map(o => o.trim()).filter(Boolean);
    }
    // 단일 값
    return [options.trim()];
  }
  
  return [];
};

export default QuestionCard;
