// src/components/AdminPanel.jsx

import { useState, useEffect } from "react";
import Papa from "papaparse";
import { db } from "../firebase/firebaseConfig";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";

const ADMIN_PASSWORD = "6645"; // 🔐 어드민 비밀번호

// 🔤 업로드 시 다국어 필드 기본 구조 생성
function buildMultilingualText(row) {
  const base = (row.en || "").trim();

  // 앞으로 AI 번역 API를 붙일 자리는 여기입니다.
  // 지금은 CSV에 ko/zh/kk/bn/uz가 비어 있으면
  // 일단 영어 문장을 그대로 복사해 둡니다.
  return {
    en: base,
    ko: (row.ko || base).trim(),
    zh: (row.zh || base).trim(),
    kk: (row.kk || base).trim(),
    bn: (row.bn || base).trim(),
    uz: (row.uz || base).trim(),
  };
}

export default function AdminPanel() {
  const [authed, setAuthed] = useState(false);
  const [inputPw, setInputPw] = useState("");
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard, upload, questions, responses, leaderboard, settings

  const [uploading, setUploading] = useState(false);
  const [questions, setQuestions] = useState([]);

  // 🔄 질문 로딩
  const loadQuestions = async () => {
    const snap = await getDocs(collection(db, "questions"));
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    // id 기준 정렬
    list.sort((a, b) => (a.id || "").localeCompare(b.id || ""));
    setQuestions(list);
  };

  useEffect(() => {
    if (authed) {
      loadQuestions();
    }
  }, [authed]);

  // 🔐 비밀번호 로그인
  const handleLogin = (e) => {
    e.preventDefault();
    if (inputPw === ADMIN_PASSWORD) {
      setAuthed(true);
      setError("");
    } else {
      setError("비밀번호가 올바르지 않습니다.");
    }
  };

  // 📤 CSV 업로드
  const handleCSVUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (result) => {
        try {
          const rows = result.data;

          // rows: [{id, category, type, en, ko, zh, kk, bn, uz, options}, ...]
          for (let index = 0; index < rows.length; index++) {
            const r = rows[index];
            const id =
              (r.id && r.id.trim()) ||
              `Q${index + 1}`; // id 없으면 Q1, Q2, ...

            const type = (r.type || "likert").trim();

            const text = buildMultilingualText(r);

            let options = null;
            if (type === "likert") {
              options = [1, 2, 3, 4, 5];
            } else if (r.options) {
              // options 컬럼에 "Yes|No|Maybe" 형태로 들어올 수 있음
              options = r.options.split("|").map((opt) => opt.trim());
            }

            await setDoc(doc(db, "questions", id), {
              id,
              category: r.category || "",
              type,
              text,
              options,
            });
          }

          alert("✅ CSV 업로드가 완료되었습니다.");
          await loadQuestions();
        } catch (err) {
          console.error(err);
          alert("❌ CSV 업로드 중 오류가 발생했습니다. (콘솔 로그 확인)");
        } finally {
          setUploading(false);
          e.target.value = "";
        }
      },
      error: (err) => {
        console.error(err);
        alert("❌ CSV 파싱에 실패했습니다.");
        setUploading(false);
      },
    });
  };

  // 🗑 단일 문항 삭제
  const deleteOne = async (id) => {
    if (!window.confirm(`${id} 문항을 삭제할까요?`)) return;
    await deleteDoc(doc(db, "questions", id));
    await loadQuestions();
  };

  // 🗑 전체 문항 삭제
  const deleteAll = async () => {
    if (!window.confirm("⚠ 정말로 전체 문항을 삭제할까요?")) return;
    const snap = await getDocs(collection(db, "questions"));
    for (let d of snap.docs) {
      await deleteDoc(doc(db, "questions", d.id));
    }
    await loadQuestions();
  };

  // ==========================
  // 🔐 로그인 화면
  // ==========================
  if (!authed) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f172a",
          color: "#e5e7eb",
          padding: 20,
        }}
      >
        <div
          style={{
            background: "#020617",
            padding: "32px 28px",
            borderRadius: 16,
            maxWidth: 360,
            width: "100%",
            boxShadow: "0 18px 45px rgba(0,0,0,0.6)",
            border: "1px solid #1e293b",
          }}
        >
          <h1 style={{ fontSize: 22, marginBottom: 8 }}>🛡 Admin Login</h1>
          <p
            style={{
              fontSize: 13,
              marginBottom: 20,
              color: "#9ca3af",
              lineHeight: 1.4,
            }}
          >
            설문 관리 전용 화면입니다.
            <br />
            관리자 비밀번호를 입력해주세요.
          </p>

          <form onSubmit={handleLogin}>
            <label
              style={{
                display: "block",
                fontSize: 13,
                marginBottom: 6,
                color: "#cbd5f5",
              }}
            >
              비밀번호 (Password)
            </label>
            <input
              type="password"
              value={inputPw}
              onChange={(e) => setInputPw(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid #334155",
                marginBottom: 10,
                background: "#020617",
                color: "#e5e7eb",
                outline: "none",
              }}
            />
            {error && (
              <p style={{ color: "#f97373", fontSize: 12, marginBottom: 8 }}>
                {error}
              </p>
            )}
            <button
              type="submit"
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: "none",
                background:
                  "linear-gradient(135deg, #4f46e5 0%, #0ea5e9 100%)",
                color: "white",
                fontWeight: 600,
                cursor: "pointer",
                marginTop: 4,
              }}
            >
              로그인
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ==========================
  // ✅ 관리자 대시보드 화면
  // ==========================
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f3f4f6",
        padding: "24px 16px 40px",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* 상단 헤더 */}
        <header
          style={{
            marginBottom: 24,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div>
            <h1 style={{ fontSize: 24, marginBottom: 4 }}>
              🛠 설문 관리자 대시보드
            </h1>
            <p style={{ fontSize: 13, color: "#6b7280" }}>
              CSV 업로드, 문항 관리, 응답/순위를 한 화면에서 관리합니다.
            </p>
          </div>
          <div style={{ textAlign: "right", fontSize: 12, color: "#9ca3af" }}>
            <div>Logged in as: <strong>Admin</strong></div>
            <button
              onClick={() => setAuthed(false)}
              style={{
                marginTop: 6,
                padding: "4px 10px",
                borderRadius: 999,
                border: "1px solid #d1d5db",
                background: "white",
                cursor: "pointer",
                fontSize: 12,
              }}
            >
              로그아웃
            </button>
          </div>
        </header>

        {/* 카드형 메뉴 */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
            marginBottom: 24,
          }}
        >
          <AdminCard
            title="📥 설문 업로드"
            description="CSV 파일로 설문 문항을 일괄 등록합니다."
            active={activeTab === "upload"}
            onClick={() => setActiveTab("upload")}
          />
          <AdminCard
            title="📝 설문 관리"
            description="등록된 문항을 확인하고 관리합니다."
            active={activeTab === "questions"}
            onClick={() => setActiveTab("questions")}
          />
          <AdminCard
            title="👥 응답 현황"
            description="향후: 학생 응답 데이터 요약 / 다운로드"
            active={activeTab === "responses"}
            onClick={() => setActiveTab("responses")}
          />
          <AdminCard
            title="🏆 순위 / 점수"
            description="향후: 게임 점수 및 순위 관리"
            active={activeTab === "leaderboard"}
            onClick={() => setActiveTab("leaderboard")}
          />
          <AdminCard
            title="⚙ 시스템 설정"
            description="향후: 언어, 비밀번호, 백업 설정"
            active={activeTab === "settings"}
            onClick={() => setActiveTab("settings")}
          />
        </section>

        {/* 우측/하단 상세 영역 */}
        <section
          style={{
            borderRadius: 16,
            background: "white",
            padding: 20,
            boxShadow: "0 10px 25px rgba(15,23,42,0.06)",
          }}
        >
          {activeTab === "dashboard" && (
            <p>왼쪽 카드에서 기능을 선택해주세요.</p>
          )}

          {activeTab === "upload" && (
            <div>
              <h2 style={{ fontSize: 18, marginBottom: 8 }}>📥 CSV 업로드</h2>
              <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 12 }}>
                <code>id, category, type, en, ko, zh, kk, bn, uz, options</code>{" "}
                헤더를 가진 CSV 파일을 업로드하면, Firestore의{" "}
                <code>questions</code> 컬렉션에 문항이 저장됩니다.
                <br />
                (ko/zh/kk/bn/uz가 비어 있으면 우선 영어(en)를 복사해 넣어둡니다.)
              </p>
              <input
                type="file"
                accept=".csv"
                onChange={handleCSVUpload}
                disabled={uploading}
              />
              {uploading && (
                <p style={{ fontSize: 13, marginTop: 8 }}>
                  ⏳ 업로드 중입니다…
                </p>
              )}
            </div>
          )}

          {activeTab === "questions" && (
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 10,
                  gap: 8,
                }}
              >
                <h2 style={{ fontSize: 18 }}>
                  📝 등록된 설문 문항 ({questions.length}개)
                </h2>
                <button
                  onClick={deleteAll}
                  style={{
                    background: "#ef4444",
                    color: "white",
                    border: "none",
                    padding: "6px 12px",
                    borderRadius: 999,
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  ⚠ 전체 문항 삭제
                </button>
              </div>

              {questions.length === 0 && (
                <p style={{ fontSize: 13, color: "#6b7280" }}>
                  아직 등록된 문항이 없습니다. 상단의{" "}
                  <strong>📥 설문 업로드</strong>에서 CSV를 업로드해주세요.
                </p>
              )}

              <div style={{ marginTop: 10, maxHeight: "60vh", overflow: "auto" }}>
                {questions.map((q) => (
                  <div
                    key={q.id}
                    style={{
                      padding: 10,
                      borderRadius: 10,
                      border: "1px solid #e5e7eb",
                      marginBottom: 8,
                      background: "#f9fafb",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          marginBottom: 2,
                        }}
                      >
                        {q.id}{" "}
                        <span
                          style={{
                            fontWeight: 400,
                            color: "#6b7280",
                            marginLeft: 4,
                          }}
                        >
                          [{q.type}] {q.category}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "#4b5563",
                          lineHeight: 1.4,
                        }}
                      >
                        {q.text?.en || "(영문 문항 없음)"}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteOne(q.id)}
                      style={{
                        padding: "4px 10px",
                        background: "#dc2626",
                        color: "#fff",
                        borderRadius: 6,
                        border: "none",
                        cursor: "pointer",
                        fontSize: 11,
                        whiteSpace: "nowrap",
                      }}
                    >
                      삭제
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "responses" && (
            <div>
              <h2 style={{ fontSize: 18, marginBottom: 8 }}>👥 응답 현황</h2>
              <p style={{ fontSize: 13, color: "#6b7280" }}>
                이 영역에서는 추후 Firebase에 저장된 학생 응답 데이터를 불러와
                <br />
                요약 통계, CSV 다운로드, 필터링 기능 등을 제공할 수 있습니다.
              </p>
            </div>
          )}

          {activeTab === "leaderboard" && (
            <div>
              <h2 style={{ fontSize: 18, marginBottom: 8 }}>🏆 순위 / 점수</h2>
              <p style={{ fontSize: 13, color: "#6b7280" }}>
                현재는 게임 쪽 리더보드에서 점수와 순위를 관리하고 있습니다.
                <br />
                이 영역에서는 추후 설문 완료 여부와 게임 점수 연동, 보상 관리 등을
                추가할 수 있습니다.
              </p>
            </div>
          )}

          {activeTab === "settings" && (
            <div>
              <h2 style={{ fontSize: 18, marginBottom: 8 }}>⚙ 시스템 설정</h2>
              <p style={{ fontSize: 13, color: "#6b7280" }}>
                향후 이 영역에서:
              </p>
              <ul style={{ fontSize: 13, color: "#4b5563", paddingLeft: 18 }}>
                <li>기본 언어 설정 (예: 영어 / 한국어)</li>
                <li>관리자 비밀번호 변경</li>
                <li>데이터 백업/복원 스크립트 연동</li>
                <li>Firebase 프로젝트 전환 등</li>
              </ul>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

// 📦 카드 컴포넌트
function AdminCard({ title, description, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        textAlign: "left",
        borderRadius: 16,
        border: active ? "2px solid #4f46e5" : "1px solid #e5e7eb",
        padding: "14px 14px 16px",
        background: active ? "#eef2ff" : "#ffffff",
        cursor: "pointer",
        boxShadow: active
          ? "0 10px 25px rgba(79,70,229,0.25)"
          : "0 4px 10px rgba(15,23,42,0.08)",
        transition: "all 0.15s ease",
      }}
    >
      <div style={{ fontSize: 16, marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 13, color: "#6b7280" }}>{description}</div>
    </button>
  );
}
