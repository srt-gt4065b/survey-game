// src/screens/SurveyGame.jsx

import React, { useEffect, useMemo, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import useGameStore from "../store/gameStore";
import QuestionCard from "../components/QuestionCard";
import GameHeader from "../components/GameHeader";
import EndScene from "../components/EndScene";
import toast from "react-hot-toast";
import "./SurveyGame.css";

/**
 * ✅ 설문 섹션 진행 순서
 */
const SECTION_ORDER = [
  "Personal Background",
  "Orientation Week Team Building",
  "Admissions",
  "Faculty",
  "Education and Curriculum",
  "Academic Advisor",
  "Academic Affairs",
  "Study Abroad",
  "Student Services",
  "Residence",
  "Facilities",
  "IT Resources: SAIS, SMART, E-Mail & Attendance App",
  "Library",
  "Meals",
  "Counseling Services",
  "Student Belongingness",
  "Extra-curricular Activities",
  "Employment in Korea",
  "Frequency Mode",
  "At a Glance",
];

/**
 * id: "Q171" 처럼 문자열일 때 숫자 부분만 꺼내서 정렬에 사용
 */
const getNumericId = (id) => {
  if (!id) return Number.MAX_SAFE_INTEGER;
  const match = String(id).match(/\d+/);
  return match ? Number(match[0]) : Number.MAX_SAFE_INTEGER;
};

/**
 * 옵션 문자열 → 배열 변환
 *  - "A|B|C" 또는 "A,B,C" 모두 대응
 */
const getOptionsArray = (options) => {
  if (!options) return [];
  if (Array.isArray(options)) return options;

  return String(options)
    .split(/[\|,]/g)
    .map((o) => o.trim())
    .filter((o) => o.length > 0);
};

const SurveyGame = ({ onComplete }) => {
  const { user, answerQuestion } = useGameStore();

  const [sections, setSections] = useState([]); // [{ name, questions: [...] }]
  const [loading, setLoading] = useState(true);

  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const [answers, setAnswers] = useState({}); // { docId: { value, skipped, timeSpent } }
  const [startTime, setStartTime] = useState(Date.now());
  const [finished, setFinished] = useState(false);

  const lang = user?.language || "en";

  // --------------------------------
  // 🔄 Firestore에서 질문 로딩
  // --------------------------------
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setLoading(true);

        const snap = await getDocs(collection(db, "questions"));
        let list = snap.docs.map((doc) => ({
          docId: doc.id,
          ...doc.data(),
        }));

        // 1) Q번호 기준 정렬 (Q1 < Q2 < Q10 < Q100 ...)
        list.sort((a, b) => getNumericId(a.id) - getNumericId(b.id));

        // 2) 카테고리별 그룹핑
        const grouped = {};
        for (const q of list) {
          const cat = q.category || "Others";
          if (!grouped[cat]) grouped[cat] = [];
          grouped[cat].push(q);
        }

        // 3) 교수님이 주신 섹션 순서대로 정렬된 섹션 배열 만들기
        const orderedSections = SECTION_ORDER.reduce((acc, name) => {
          const qs = grouped[name];
          if (qs && qs.length > 0) {
            acc.push({
              name,
              questions: qs,
            });
          }
          return acc;
        }, []);

        if (orderedSections.length === 0) {
          toast.error("No questions found in Firestore");
        }

        setSections(orderedSections);
        setCurrentSectionIndex(0);
        setCurrentQuestionIndex(0);
        setAnswers({});
        setFinished(false);
        setStartTime(Date.now());
      } catch (err) {
        console.error("❌ Failed to load questions:", err);
        toast.error("Failed to load questions");
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, []);

  // --------------------------------
  // ℹ️ 현재 섹션 / 문항 계산
  // --------------------------------
  const currentSection = sections[currentSectionIndex] || null;
  const sectionQuestions = currentSection ? currentSection.questions : [];
  const currentQuestion =
    sectionQuestions.length > 0 ? sectionQuestions[currentQuestionIndex] : null;

  // 전체 문항 수
  const overallTotal = useMemo(
    () => sections.reduce((sum, s) => sum + s.questions.length, 0),
    [sections]
  );

  // 지금까지 응답(혹은 스킵)한 문항 수 → 전체 진행률
  const answeredCount = useMemo(
    () => Object.keys(answers).length,
    [answers]
  );

  const overallProgress = {
    current: answeredCount,
    total: overallTotal,
  };

  // 현재 섹션 내에서의 번호 (1-based)
  const sectionIndex = currentQuestionIndex + 1;
  const sectionTotal = sectionQuestions.length;

  // --------------------------------
  // ⏮ 이전 문항으로 이동
  // --------------------------------
  const handleBack = () => {
    if (!sections.length) return;

    // 첫 섹션의 첫 문항이면 더 이상 뒤로 갈 수 없음
    if (currentSectionIndex === 0 && currentQuestionIndex === 0) return;

    // 같은 섹션 내에서 이전 문항
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      setStartTime(Date.now());
      return;
    }

    // 이전 섹션의 마지막 문항으로 이동
    const prevSectionIndex = currentSectionIndex - 1;
    const prevSection = sections[prevSectionIndex];
    const lastIndexInPrevSection = prevSection.questions.length - 1;

    setCurrentSectionIndex(prevSectionIndex);
    setCurrentQuestionIndex(lastIndexInPrevSection);
    setStartTime(Date.now());
  };

  // --------------------------------
  // ▶ 공통: 응답 기록 (실제 답변, 스킵 둘 다)
  // --------------------------------
  const recordAnswer = (q, value, skipped = false) => {
    const now = Date.now();
    const timeSpent = (now - startTime) / 1000;

    setAnswers((prev) => ({
      ...prev,
      [q.docId]: { value, skipped, timeSpent },
    }));

    // 점수/경험치 반영 (스킵도 일단 동일하게 처리)
    answerQuestion(timeSpent, "good");
    setStartTime(Date.now());
  };

  // --------------------------------
  // ⏭ 다음 문항 또는 다음 섹션/종료로 이동
  // --------------------------------
  const goNext = () => {
    if (!sections.length || !currentSection) return;

    const isLastQuestionInSection =
      currentQuestionIndex >= sectionQuestions.length - 1;
    const isLastSection =
      currentSectionIndex >= sections.length - 1;

    // 섹션 내에서 다음 문항
    if (!isLastQuestionInSection) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setStartTime(Date.now());
      return;
    }

    // 마지막 섹션의 마지막 문항 → 설문 종료
    if (isLastSection) {
      toast.success("🎉 All survey completed!");
      setFinished(true);
      if (onComplete) onComplete();
      return;
    }

    // 다음 섹션의 첫 문항으로 이동
    setCurrentSectionIndex((prev) => prev + 1);
    setCurrentQuestionIndex(0);
    setStartTime(Date.now());
  };

  // --------------------------------
  // ✅ 실제 답변(Next)
  // --------------------------------
  const handleAnswer = (value) => {
    if (!currentQuestion) return;
    recordAnswer(currentQuestion, value, false);
    goNext();
  };

  // --------------------------------
  // ⏭ Skip (답변 없이 다음 문항)
  // --------------------------------
  const handleSkip = () => {
    if (!currentQuestion) return;
    recordAnswer(currentQuestion, null, true);
    goNext();
  };

  // --------------------------------
  // ⏩ Jump (현재 포함 ~ 섹션 마지막 전까지 스킵 후 마지막 문항으로 점프)
  // --------------------------------
  const handleJump = () => {
    if (!currentSection || !currentQuestion) return;

    const lastIndex = sectionQuestions.length - 1;
    if (currentQuestionIndex >= lastIndex) {
      // 이미 마지막 문항이면 그냥 유지
      return;
    }

    const now = Date.now();
    const baseTimeSpent = (now - startTime) / 1000;

    setAnswers((prev) => {
      const updated = { ...prev };

      // 현재 ~ 마지막-1 문항까지 모두 스킵 처리
      for (let i = currentQuestionIndex; i < lastIndex; i += 1) {
        const q = sectionQuestions[i];
        if (!updated[q.docId]) {
          updated[q.docId] = {
            value: null,
            skipped: true,
            timeSpent: i === currentQuestionIndex ? baseTimeSpent : 0,
          };
        }
      }

      return updated;
    });

    // 경험치 하나만 반영 (과하다 싶으면 제거 가능)
    answerQuestion(baseTimeSpent, "good");

    // 섹션 마지막 문항으로 이동
    setCurrentQuestionIndex(lastIndex);
    setStartTime(Date.now());
  };

  // --------------------------------
  // 🔚 전체 설문 완료 시 EndScene 표시
  // --------------------------------
  if (finished) {
    return <EndScene onComplete={onComplete} />;
  }

  // --------------------------------
  // ⏳ 로딩 / 예외 처리 화면
  // --------------------------------
  if (loading) {
    return (
      <div className="survey-container">
        <div className="loading-screen">Loading questions...</div>
      </div>
    );
  }

  if (!currentSection || !currentQuestion) {
    return (
      <div className="survey-container">
        <div className="loading-screen">No questions available</div>
      </div>
    );
  }

  // --------------------------------
  // 🔧 QuestionCard에 넘길 데이터 정리
  // --------------------------------
  const formatted = {
    text:
      currentQuestion.text?.[lang] ||
      currentQuestion.text?.en ||
      currentQuestion.text ||
      "",
    section: currentSection.name,
    type: currentQuestion.type || "likert",
    options: getOptionsArray(currentQuestion.options),
    required: true,
  };

  return (
    <div className="survey-container">
      {/* 상단 게임 헤더 (전체 진행률 표시) */}
      <GameHeader overallProgress={overallProgress} />

      {/* 실제 질문 카드 */}
      <QuestionCard
        key={currentQuestion.docId}
        question={formatted}
        // 섹션 내 번호 / 전체 문항 수
        questionNumber={sectionIndex}
        totalQuestions={sectionTotal}
        // 전체 진행 (필요 없으면 QuestionCard 내부에서 무시)
        overallNumber={answeredCount + 1}
        overallTotal={overallTotal}
        // 섹션 정보
        chapterNumber={currentSectionIndex + 1}
        chapterName={currentSection.name}
        sectionIndex={sectionIndex}
        sectionTotal={sectionTotal}
        // 버튼 액션
        onAnswer={handleAnswer}
        onBack={handleBack}
        onSkip={handleSkip}
        onJump={handleJump}
      />
    </div>
  );
};

export default SurveyGame;
