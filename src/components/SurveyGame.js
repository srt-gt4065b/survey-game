// src/components/SurveyGame.js
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useGameStore from "../store/gameStore";
import { db } from "../firebase/config";
import {
  collection,
  addDoc,
  getDocs,
  query,
  serverTimestamp,
} from "firebase/firestore";
import toast from "react-hot-toast";
import QuestionCard from "./QuestionCard";
import ChapterComplete from "./ChapterComplete";
import "./SurveyGame.css";

const SurveyGame = ({ onComplete }) => {
  const {
    user,
    gameStats,
    answerQuestion,
    updateStreak,
    completeChapter,
    unlockAchievement,
    showAnswerFeedback,
  } = useGameStore();

  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [currentQ, setCurrentQ] = useState(null);
  const [responses, setResponses] = useState({});
  const [startTime, setStartTime] = useState(Date.now());
  const [loading, setLoading] = useState(true);
  const [showChapter, setShowChapter] = useState(false);

  // 기본 옵션
  const defaultOptions = (type) => {
    switch (type) {
      case "likert":
        return ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"];
      case "frequency":
        return ["Never", "Rarely", "Sometimes", "Often", "Very Often"];
      default:
        return [];
    }
  };

  // 숫자 기준 정렬
  const orderFromId = (id) => {
    const m = String(id).match(/\d+/);
    return m ? parseInt(m[0], 10) : 9999;
  };

  // ===========================
  // Firestore에서 문항 읽기
  // ===========================
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setLoading(true);

        const q = query(collection(db, "questions"));
        const snap = await getDocs(q);

        if (snap.empty) {
          toast.error("❌ Firestore에 설문 문항이 없습니다.");
          setLoading(false);
          return;
        }

        const lang = user.language || "en";

        const data = snap.docs
          .map((d) => {
            const row = d.data();
            const pack = row.text || {};

            const text =
              pack[lang] ||
              pack["en"] ||
              "(No text for selected language)";

            return {
              id: row.id || d.id,
              section: row.category || "Survey",
              text,
              type: row.type || "likert",
              required: true,
              options:
                Array.isArray(row.options) && row.options.length > 0
                  ? row.options
                  : defaultOptions(row.type),
            };
          })
          .sort((a, b) => orderFromId(a.id) - orderFromId(b.id));

        setQuestions(data);
        setCurrentIdx(0);
        setCurrentQ(data[0]);
        setStartTime(Date.now());

        toast.success(`📥 ${data.length}개 설문 문항 불러왔습니다.`);
      } catch (err) {
        console.error(err);
        toast.error("문항을 불러오는 중 오류 발생");
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [user.language]);

  // ===========================
  // 응답 Firebase 저장
  // ===========================
  const saveResponse = async (qid, answer, spent) => {
    try {
      await addDoc(collection(db, "responses"), {
        userId: user.id,
        userName: user.name,
        department: user.department,
        surveyId: "satisfaction_2025",
        questionId: qid,
        answer,
        timeSpent: spent,
        timestamp: serverTimestamp(),
      });
    } catch (e) {
      console.error("응답 저장 실패:", e);
    }
  };

  // ===========================
  // 설문 완료 저장
  // ===========================
  const finishSurvey = async () => {
    unlockAchievement("COMPLETIONIST");

    const total = questions.length;
    const totalTime = Object.values(responses).reduce(
      (s, r) => s + r.timeSpent,
      0
    );

    if (user.id) {
      await addDoc(collection(db, "completions"), {
        userId: user.id,
        userName: user.name,
        department: user.department,
        surveyId: "satisfaction_2025",
        totalQuestions: total,
        totalTime,
        avgTime: total ? totalTime / total : 0,
        completedAt: serverTimestamp(),
      });
    }

    toast.success("🎉 모든 설문을 완료했습니다!");
    onComplete();
  };

  // ===========================
  // 다음 문항 이동
  // ===========================
  const goNext = () => {
    const nextIndex = currentIdx + 1;

    // 15문항마다 챕터 완료 연출
    if (nextIndex % 15 === 0 && nextIndex < questions.length) {
      completeChapter(Math.floor(nextIndex / 15));
      setShowChapter(true);

      setTimeout(() => {
        setShowChapter(false);
        move(nextIndex);
      }, 2600);
      return;
    }

    if (nextIndex >= questions.length) {
      finishSurvey();
      return;
    }

    move(nextIndex);
  };

  // 문항 셋팅
  const move = (i) => {
    setCurrentIdx(i);
    setCurrentQ(questions[i]);
    setStartTime(Date.now());
  };

  // ===========================
  // 답변 처리
  // ===========================
  const handleAnswer = async (answer) => {
    if (!currentQ) return;

    const spent = Math.floor((Date.now() - startTime) / 1000);

    // response 기록
    const newResp = {
      ...responses,
      [currentQ.id]: {
        answer,
        timeSpent: spent,
        timestamp: Date.now(),
      },
    };
    setResponses(newResp);

    // 게임 포인트 반영
    const quality = answer ? "good" : "bad";
    const res = answerQuestion(spent, quality);

    updateStreak(true);
    showAnswerFeedback(res.points, res.leveledUp);

    // DB 기록
    if (user.id) {
      await saveResponse(currentQ.id, answer, spent);
    }

    goNext();
  };

  // ===========================
  // UI
  // ===========================
  if (loading) return <div className="survey-game">문항 불러오는 중…</div>;
  if (!currentQ)
    return <div className="survey-game">표시할 문항이 없습니다.</div>;

  return (
    <div className="survey-game">
      {/* 진행바 */}
      <div className="survey-progress">
        <div className="progress-bar">
          <motion.div
            className="progress-bar-fill"
            initial={{ width: 0 }}
            animate={{
              width: `${((currentIdx + 1) / questions.length) * 100}%`,
            }}
            transition={{ duration: 0.4 }}
          />
        </div>
        <div className="progress-text">
          {currentIdx + 1} / {questions.length} 문항
        </div>
      </div>

      {/* 문항 표시 */}
      <div className="survey-content">
        <AnimatePresence mode="wait">
          <QuestionCard
            key={currentQ.id}
            question={currentQ}
            questionNumber={currentIdx + 1}
            totalQuestions={questions.length}
            onAnswer={handleAnswer}
          />
        </AnimatePresence>
      </div>

      {showChapter && (
        <ChapterComplete chapterNumber={Math.floor(currentIdx / 15)} />
      )}
    </div>
  );
};

export default SurveyGame;
