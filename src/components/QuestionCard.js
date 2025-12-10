import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './QuestionCard.css';

const QuestionCard = ({ question, questionNumber, totalQuestions, onAnswer }) => {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [timeLeft, setTimeLeft] = useState(30); // 30초 제한
  const [isAnswering, setIsAnswering] = useState(false);

  // 타이머
  useEffect(() => {
    if (timeLeft > 0 && !isAnswering) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, isAnswering]);

  // 타이머 색상 계산
  const getTimerColor = () => {
    if (timeLeft > 20) return '#4ade80'; // 초록
    if (timeLeft > 10) return '#fbbf24'; // 노랑
    return '#ef4444'; // 빨강
  };

  // 답변 선택
  const handleSelect = (answer) => {
    if (isAnswering) return;
    
    setSelectedAnswer(answer);
    setIsAnswering(true);
    
    // 애니메이션 후 다음 질문으로
    setTimeout(() => {
      onAnswer(answer);
      setSelectedAnswer(null);
      setIsAnswering(false);
      setTimeLeft(30);
    }, 500);
  };

  // 질문 타입별 렌더링
  const renderQuestionContent = () => {
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
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <span className="option-emoji">
                  {getLikertEmoji(index, question.options.length)}
                </span>
                <span className="option-text">{option}</span>
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
                <span className="yesno-emoji">
                  {option === '예' ? '✅' : '❌'}
                </span>
                <span className="yesno-text">{option}</span>
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
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <span className="option-checkbox">
                  {selectedAnswer === option ? '☑️' : '⬜'}
                </span>
                <span className="option-text">{option}</span>
              </motion.button>
            ))}
          </div>
        );
        
      case 'text':
        return (
          <div className="text-input-container">
            <textarea
              className="text-input"
              placeholder="여기에 답변을 입력하세요..."
              rows={4}
              onChange={(e) => setSelectedAnswer(e.target.value)}
            />
            <motion.button
              className="submit-button"
              onClick={() => handleSelect(selectedAnswer)}
              disabled={!selectedAnswer}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              제출하기
            </motion.button>
          </div>
        );
        
      default:
        return null;
    }
  };

  // 리커트 척도 이모지
  const getLikertEmoji = (index, total) => {
    const emojis5 = ['😢', '😕', '😐', '🙂', '😄'];
    const emojis3 = ['👎', '🤷', '👍'];
    
    if (total === 5) return emojis5[index];
    if (total === 3) return emojis3[index];
    return '📊';
  };

  return (
    <motion.div 
      className="question-card"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.3 }}
    >
      {/* 헤더 */}
      <div className="question-header">
        <div className="question-number">
          질문 {questionNumber} / {totalQuestions}
        </div>
        <div className="question-section">
          {question.section}
        </div>
        <div className="timer" style={{ color: getTimerColor() }}>
          ⏱️ {timeLeft}초
        </div>
      </div>

      {/* 질문 텍스트 */}
      <div className="question-text">
        <h2>{question.text}</h2>
        {question.required && <span className="required-badge">필수</span>}
      </div>

      {/* 답변 옵션 */}
      <div className="question-options">
        {renderQuestionContent()}
      </div>

      {/* 힌트 또는 팁 */}
      <div className="question-hint">
        💡 빠르고 정확한 답변으로 보너스 포인트를 획득하세요!
      </div>
    </motion.div>
  );
};

export default QuestionCard;
