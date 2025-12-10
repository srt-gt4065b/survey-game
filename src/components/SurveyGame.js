import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Papa from 'papaparse';
import useGameStore from '../store/gameStore';
import { db } from '../firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';
import QuestionCard from './QuestionCard';
import ChapterComplete from './ChapterComplete';
import './SurveyGame.css';

const SurveyGame = ({ onComplete }) => {
  const { 
    user, 
    gameStats, 
    answerQuestion, 
    updateStreak,
    completeChapter,
    unlockAchievement 
  } = useGameStore();
  
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [responses, setResponses] = useState({});
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [showChapterComplete, setShowChapterComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // CSV 파일 업로드 처리
  const handleCSVUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      complete: (results) => {
        const parsedQuestions = results.data.map((row, index) => ({
          id: `q${index + 1}`,
          section: row.section || `챕터 ${Math.floor(index / 15) + 1}`,
          text: row.question_text || row.question,
          type: row.type || 'likert',
          required: row.required === 'yes' || row.required === 'true',
          options: row.options ? row.options.split('|') : getDefaultOptions(row.type),
        }));
        
        setQuestions(parsedQuestions);
        toast.success(`${parsedQuestions.length}개 질문 로드 완료!`);
        
        // 첫 질문 설정
        if (parsedQuestions.length > 0) {
          setCurrentQuestion(parsedQuestions[0]);
          setQuestionStartTime(Date.now());
        }
      },
      error: (error) => {
        toast.error('CSV 파일 로드 실패: ' + error.message);
      }
    });
  };

  // 기본 옵션 반환
  const getDefaultOptions = (type) => {
    switch (type) {
      case 'likert':
        return ['매우 불만족', '불만족', '보통', '만족', '매우 만족'];
      case 'yesno':
        return ['예', '아니오'];
      case 'frequency':
        return ['전혀 안함', '가끔', '보통', '자주', '매우 자주'];
      default:
        return [];
    }
  };

  // 샘플 질문 로드 (CSV 없을 때)
  useEffect(() => {
    if (questions.length === 0) {
      loadSampleQuestions();
    }
  }, []);

  const loadSampleQuestions = () => {
    const sampleQuestions = [
      {
        id: 'sample1',
        section: '학업 만족도',
        text: '수업 내용의 질에 대해 어떻게 평가하십니까?',
        type: 'likert',
        required: true,
        options: ['매우 불만족', '불만족', '보통', '만족', '매우 만족'],
      },
      {
        id: 'sample2',
        section: '학업 만족도',
        text: '교수진의 강의 방식에 만족하십니까?',
        type: 'likert',
        required: true,
        options: ['매우 불만족', '불만족', '보통', '만족', '매우 만족'],
      },
      {
        id: 'sample3',
        section: '학업 만족도',
        text: '과제량은 적절하다고 생각하십니까?',
        type: 'likert',
        required: true,
        options: ['너무 적음', '적음', '적절', '많음', '너무 많음'],
      },
      // ... 더 많은 샘플 질문 추가 가능
    ];
    
    setQuestions(sampleQuestions);
    setCurrentQuestion(sampleQuestions[0]);
  };

  // 답변 처리
  const handleAnswer = async (answer) => {
    if (!currentQuestion) return;
    
    // 시간 계산
    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
    
    // 응답 저장
    const newResponses = {
      ...responses,
      [currentQuestion.id]: {
        answer,
        timeSpent,
        timestamp: Date.now(),
      }
    };
    setResponses(newResponses);
    
    // 게임 포인트 계산
    const quality = answer ? 'good' : 'poor';
    const result = answerQuestion(timeSpent, quality);
    
    // 연속 답변 업데이트
    updateStreak(true);
    
    // 첫 답변 업적
    if (gameStats.questionsAnswered === 0) {
      unlockAchievement('FIRST_ANSWER');
    }
    
    // 피드백 표시
    showAnswerFeedback(result.points, result.leveledUp);
    
    // Firebase에 응답 저장
    if (user.id) {
      saveResponseToFirebase(currentQuestion.id, answer, timeSpent);
    }
    
    // 다음 질문으로
    moveToNextQuestion();
  };

  // 답변 피드백 애니메이션
  const showAnswerFeedback = (points, leveledUp) => {
    toast.success(
      <div className="answer-feedback">
        <span className="points-gained">+{points} XP</span>
        {gameStats.streak > 1 && (
          <span className="streak-bonus">🔥 연속 {gameStats.streak}개!</span>
        )}
      </div>,
      {
        duration: 2000,
        position: 'bottom-center',
        style: {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
        },
      }
    );
  };

  // Firebase에 응답 저장
  const saveResponseToFirebase = async (questionId, answer, timeSpent) => {
    try {
      await addDoc(collection(db, 'responses'), {
        userId: user.id,
        surveyId: 'satisfaction_2024',
        questionId,
        answer,
        timeSpent,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error('응답 저장 실패:', error);
    }
  };

  // 다음 질문으로 이동
  const moveToNextQuestion = () => {
    const nextIndex = currentQuestionIndex + 1;
    
    // 챕터 완료 체크 (15문제마다)
    if (nextIndex % 15 === 0 && nextIndex !== 0) {
      const chapterNumber = Math.floor(nextIndex / 15);
      completeChapter(chapterNumber);
      setShowChapterComplete(true);
      
      setTimeout(() => {
        setShowChapterComplete(false);
        proceedToNextQuestion(nextIndex);
      }, 3000);
    } else if (nextIndex < questions.length) {
      proceedToNextQuestion(nextIndex);
    } else {
      // 설문 완료
      handleSurveyComplete();
    }
  };

  const proceedToNextQuestion = (nextIndex) => {
    setCurrentQuestionIndex(nextIndex);
    setCurrentQuestion(questions[nextIndex]);
    setQuestionStartTime(Date.now());
  };

  // 설문 완료 처리
  const handleSurveyComplete = async () => {
    toast.success('🎉 모든 설문을 완료했습니다!', {
      duration: 5000,
      position: 'top-center',
    });
    
    unlockAchievement('COMPLETIONIST');
    
    // 완료 데이터 Firebase 저장
    if (user.id) {
      await addDoc(collection(db, 'completions'), {
        userId: user.id,
        surveyId: 'satisfaction_2024',
        totalPoints: gameStats.totalPoints,
        level: gameStats.level,
        completedAt: serverTimestamp(),
        responses,
      });
    }
    
    onComplete();
  };

  return (
    <div className="survey-game-container">
      {/* CSV 업로드 섹션 */}
      {questions.length === 0 && (
        <motion.div 
          className="csv-upload-section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h2>📁 질문 파일 업로드</h2>
          <p>CSV 또는 JSON 파일로 질문을 일괄 업로드하세요</p>
          <input
            type="file"
            accept=".csv,.json"
            onChange={handleCSVUpload}
            className="file-input"
            id="csv-upload"
          />
          <label htmlFor="csv-upload" className="file-label">
            파일 선택
          </label>
          <div className="sample-format">
            <h4>CSV 형식 예시:</h4>
            <code>
              section,question_text,type,required,options<br/>
              학업,수업 만족도,likert,yes,매우불만족|불만족|보통|만족|매우만족
            </code>
          </div>
        </motion.div>
      )}

      {/* 질문 카드 */}
      {currentQuestion && !showChapterComplete && (
        <AnimatePresence mode="wait">
          <QuestionCard
            key={currentQuestion.id}
            question={currentQuestion}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={questions.length}
            onAnswer={handleAnswer}
          />
        </AnimatePresence>
      )}

      {/* 챕터 완료 화면 */}
      {showChapterComplete && (
        <ChapterComplete 
          chapterNumber={Math.floor(currentQuestionIndex / 15)}
          points={gameStats.totalPoints}
        />
      )}

      {/* 진행 상태 바 (하단) */}
      <div className="progress-footer">
        <div className="progress-bar-container">
          <motion.div 
            className="progress-bar-fill"
            initial={{ width: 0 }}
            animate={{ 
              width: `${(currentQuestionIndex / questions.length) * 100}%` 
            }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <div className="progress-text">
          {currentQuestionIndex + 1} / {questions.length} 문항
        </div>
      </div>
    </div>
  );
};

export default SurveyGame;
