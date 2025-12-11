import React, { useEffect, useMemo, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../firebase/config";
import useGameStore from "../store/gameStore";
import QuestionCard from "./QuestionCard";
import GameHeader from "./GameHeader";
import toast from "react-hot-toast";
import "./SurveyGame.css";


const SurveyGame = ({ onComplete }) => {
  const { user, answerQuestion } = useGameStore();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentCategory, setCurrentCategory] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [startTime, setStartTime] = useState(Date.now());

  // Firestore에서 질문 로딩
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setLoading(true);
        const q = query(collection(db, "questions"), orderBy("id"));
        const snap = await getDocs(q);
        const list = snap.docs.map((doc) => ({
          docId: doc.id,
          ...doc.data(),
        }));
        setQuestions(list);

        if (list.length > 0) {
          setCurrentCategory(list[0].category);
        }
      } catch (err) {
        console.error("❌ 설문 로딩 실패:", err);
        toast.error("Failed to load questions");
      } finally {
        setLoading(false);
        setStartTime(Date.now());
      }
    };

    loadQuestions();
  }, []);

  // 카테고리 그룹핑
  const categories = useMemo(
    () => [...new Set(questions.map((q) => q.category))],
    [questions]
  );

  const filteredQuestions = useMemo(
    () => questions.filter((q) => q.category === currentCategory),
    [questions, currentCategory]
  );

  const currentQuestion =
    filteredQuestions.length > 0 ? filteredQuestions[currentIndex] : null;

  // 전체 진행률 계산
  const overallProgress = useMemo(() => {
    const answeredCount = Object.keys(answers).length;
    return {
      current: answeredCount,
      total: questions.length,
    };
  }, [answers, questions.length]);

  // 현재 문항의 전체 순번 계산
  const getCurrentOverallNumber = () => {
    if (!currentQuestion) return 0;
    return questions.findIndex(q => q.docId === currentQuestion.docId) + 1;
  };

  // 답변 처리
  const handleAnswer = (value) => {
    if (!currentQuestion) return;

    const now = Date.now();
    const timeSpent = (now - startTime) / 1000;
    const qId = currentQuestion.docId;

    setAnswers((prev) => ({
      ...prev,
      [qId]: { value, timeSpent },
    }));

    answerQuestion(timeSpent, "good");

    const next = currentIndex + 1;

    if (next < filteredQuestions.length) {
      setCurrentIndex(next);
      setStartTime(Date.now());
      return;
    }

    // 챕터 완료
    toast.success(`✅ ${currentCategory} Completed!`);

    const answeredIds = new Set(Object.keys({ ...answers, [qId]: true }));
    const remainingCats = categories.filter((cat) =>
      questions.some((q) => q.category === cat && !answeredIds.has(q.docId))
    );

    if (remainingCats.length > 0) {
      setCurrentCategory(remainingCats[0]);
      setCurrentIndex(0);
      setStartTime(Date.now());
      return;
    }

    // 전체 설문 완료
    toast.success("🎉 All survey completed!");
    if (onComplete) onComplete();
  };

  const lang = user?.language || "en";

  if (loading) {
    return (
      <div className="survey-container">
        <div className="loading-screen">Loading questions...</div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="survey-container">
        <div className="loading-screen">No questions available</div>
      </div>
    );
  }

  const formatted = {
    text: currentQuestion.text?.[lang] || currentQuestion.text?.en,
    section: currentQuestion.category,
    type: currentQuestion.type,
    options: getOptionsArray(currentQuestion.options),
    required: true,
  };

  return (
    <div className="survey-container">
      <GameHeader overallProgress={overallProgress} />

      <QuestionCard
        key={currentQuestion.docId}
        question={formatted}
        questionNumber={currentIndex + 1}
        totalQuestions={filteredQuestions.length}
        overallNumber={getCurrentOverallNumber()}
        overallTotal={questions.length}
        onAnswer={handleAnswer}
      />
    </div>
  );
};

export default SurveyGame;
