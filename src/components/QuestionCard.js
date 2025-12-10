import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './QuestionCard.css';

const getPlaceholderForQuestion = (questionText) => {
  const t = questionText.toLowerCase();
  if (t.includes('name') || t.includes('이름')) return 'John Doe';
  if (t.includes('email') || t.includes('이메일')) return 'john@example.com';
  if (t.includes('phone') || t.includes('전화')) return '010-1234-5678';
  if (t.includes('age') || t.includes('나이')) return '25';
  if (t.includes('address') || t.includes('주소')) return '123 Main Street, Seoul';
  if (t.includes('comment') || t.includes('의견')) return 'Please write your thoughts here...';
  return 'Type your answer here...';
};

const QuestionCard = ({ question, questionNumber, totalQuestions, onAnswer }) => {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isAnswering, setIsAnswering] = useState(false);

  useEffect(() => {
    if (timeLeft > 0 && !isAnswering) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, isAnswering]);

  const getTimerColor = () => {
    if (timeLeft > 20) return '#4ade80';
    if (timeLeft > 10) return '#fbbf24';
    return '#ef4444';
  };

  const handleSelect = (answer) => {
    if (isAnswering) return;
    setSelectedAnswer(answer);
    setIsAnswering(true);

    setTimeout(() => {
      onAnswer(answer);
      setSelectedAnswer(null);
      setIsAnswering(false);
      setTimeLeft(30);
    }, 500);
  };

  const getLikertEmoji = (index, total) => {
    const emojis5 = ['😢', '😕', '😐', '🙂', '😄'];
    const emojis3 = ['👎', '🤷', '👍'];
    if (total === 5) return emojis5[index];
    if (total === 3) return emojis3[index];
    return '📊';
  };

  const renderOptions = () => {
    switch (question.type) {
      case 'likert':
      case 'frequency':
        return (
          <div className="likert-options">
            {question.options.map((option, index) => (
              <motion.button
                key={index}
                className={`option-button ${selectedAnswer === option ? 'selected' : ''}`}
                onClick={() => handleSelect(option)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="option-emoji">{getLikertEmoji(index, question.options.length)}</span>
                <span>{option}</span>
              </motion.button>
            ))}
          </div>
        );

      case 'yesno':
        return (
          <div className="yesno-options">
            {question.options.map((option, index) => (
              <motion.button
                key={index}
                className={`yesno-button ${selectedAnswer === option ? 'selected' : ''}`}
                onClick={() => handleSelect(option)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <span>{option === '예' ? '✅' : '❌'}</span>
                <span>{option}</span>
              </motion.button>
            ))}
          </div>
        );

      case 'multiple':
        return (
          <div className="multiple-options">
            {question.options.map((option, index) => (
              <motion.button
                key={index}
                className={`multiple-option ${selectedAnswer === option ? 'selected' : ''}`}
                onClick={() => handleSelect(option)}
              >
                <span>{selectedAnswer === option ? '☑️' : '⬜'}</span>
                <span>{option}</span>
              </motion.button>
            ))}
          </div>
        );

      case 'text':
        return (
          <div className="text-input-container">
            <textarea
              className="text-input"
              rows={4}
              placeholder={`Example: ${getPlaceholderForQuestion(question.text)}`}
              onChange={(e) => setSelectedAnswer(e.target.value)}
              value={selectedAnswer || ''}
            />
            <motion.button
              className="submit-button"
              disabled={!selectedAnswer}
              onClick={() => handleSelect(selectedAnswer)}
            >
              Submit
            </motion.button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div className="question-card" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}>
      {/* 헤더 */}
      <div className="question-header">
        <div className="question-number">Q{questionNumber}/{totalQuestions}</div>

        {/* 현재 섹션 — 우측 정렬 */}
        <div className="question-section">{question.section}</div>

        <div className="timer" style={{ color: getTimerColor() }}>
          ⏱ {timeLeft}s
        </div>
      </div>

      {/* 질문 */}
      <div className="question-text">
        <h2>{question.text}</h2>
        {question.required && <span className="required-badge">Required</span>}
      </div>

      {/* 옵션 */}
      <div className="question-options">{renderOptions()}</div>

      <div className="question-hint">💡 Answer quickly to earn bonus points!</div>
    </motion.div>
  );
};

export default QuestionCard;
