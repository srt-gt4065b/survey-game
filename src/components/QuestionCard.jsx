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

  /** -------------------------------
   * Likert Scale 옵션 (Emoji 포함)
   --------------------------------*/
  const likertScale = [
    "😍 Strongly Agree",
    "🙂 Agree",
    "😐 Neutral",
    "😕 Disagree",
    "😡 Strongly Disagree",
  ];

  /** -------------------------------
   * 옵션 결정 (likert / 일반 객관식)
   --------------------------------*/
  const finalOptions = type === "likert" ? likertScale : normalizeOptions(options);

  return (
    <div className="question-card fade-in">
      
      {/* ---------- 상단 정보 ---------- */}
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

      {/* ---------- 질문 텍스트 ---------- */}
      <h2 className="q-text">{text}</h2>

      {/* ---------- 객관식 옵션 ---------- */}
      {type !== "text" && (
        <div className="q-options">
          {finalOptions.map((opt, idx) => (
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

      {/* ---------- 주관식 입력 ---------- */}
      {type === "text" && (
        <textarea
          className="q-textarea"
          placeholder="Write your answer..."
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        />
      )}

      {/* ---------- Next 버튼 ---------- */}
      <div className="q-footer">
        <button
          className={`next-btn ${selected ? "active" : ""}`}
          disabled={!selected}
          onClick={() => {
            if (!selected) return;
            const answer = selected;
            setSelected(""); // 먼저 초기화
            onAnswer(answer); // 부모에 전달
          }}
        >
          Next →
        </button>
      </div>
    </div>
  );
};

/** ------------------------------------------
 * 옵션 정규화 함수: SurveyGame에서 받은 값이
 * 배열이든 문자열이든 항상 배열로 변환
 -------------------------------------------*/
const normalizeOptions = (options) => {
  if (!options) return [];
  if (Array.isArray(options)) return options;

  if (typeof options === "string") {
    return options
      .split(/[\|,]/)
      .map((o) => o.trim())
      .filter((o) => o.length > 0);
  }
  return [];
};

export default QuestionCard;
