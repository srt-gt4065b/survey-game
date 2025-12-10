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

export default function AdminPanel() {
  const [questions, setQuestions] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [inputPw, setInputPw] = useState("");
  const [error, setError] = useState("");

  // 📌 Firestore에서 질문 불러오기
  const loadQuestions = async () => {
    const snap = await getDocs(collection(db, "questions"));
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setQuestions(list);
  };

  useEffect(() => {
    if (authed) {
      loadQuestions();
    }
  }, [authed]);

  // 🔐 비밀번호 확인
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

          for (let r of rows) {
            const id = r.id?.trim() || crypto.randomUUID();
            const type = r.type || "likert";

            await setDoc(doc(db, "questions", id), {
              id,
              category: r.category || "",
              type,
              text: {
                en: r.en || "",
                ko: r.ko || "",
                zh: r.zh || "",
                kk: r.kk || "",
                bn: r.bn || "",
                uz: r.uz || "",
              },
              options:
                type === "likert"
                  ? [1, 2, 3, 4, 5]
                  : r.options
                  ? r.options.split("|")
                  : null,
            });
          }

          alert("📤 CSV 업로드 완료!");
          await loadQuestions();
        } catch (err) {
          console.error(err);
          alert("❌ CSV 업로드 중 오류가 발생했습니다.");
        } finally {
          e.target.value = "";
          setUploading(false);
        }
      },
      error: (err) => {
        console.error(err);
        alert("❌ CSV 파싱 실패");
        setUploading(false);
      },
    });
  };

  // 🗑 단일 문항 삭제
  const deleteOne = async (id) => {
    if (!window.confirm(`${id} 문항을 삭제할까요?`)) return;
    await deleteDoc(doc(db, "questions", id));
    loadQuestions();
  };

  // 🗑 전체 문항 삭제
  const deleteAll = async () => {
    if (!window.confirm("⚠ 전체 문항을 삭제할까요?")) return;

    const snap = await getDocs(collection(db, "questions"));
    for (let d of snap.docs) {
      await deleteDoc(doc(db, "questions", d.id));
    }
    loadQuestions();
  };

  // 🔐 아직 로그인 안 한 상태 → 비밀번호 입력 화면
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
          <p style={{ fontSize: 13, marginBottom: 20, color: "#9ca3af" }}>
            관리자 전용 페이지입니다. 비밀번호를 입력해주세요.
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

  // ✅ 로그인 성공 후 → 진짜 Admin 패널
  return (
    <div style={{ padding: 25, maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 10 }}>🛠 설문 관리자 패널</h1>
      <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 24 }}>
        CSV 업로드로 설문 문항을 일괄 관리할 수 있는 화면입니다.
      </p>

      {/* CSV 업로드 */}
      <section
        style={{
          marginBottom: 30,
          padding: 16,
          borderRadius: 12,
          border: "1px solid #e5e7eb",
          background: "#f9fafb",
        }}
      >
        <h2 style={{ marginBottom: 8 }}>📤 CSV 일괄 업로드</h2>
        <p style={{ fontSize: 13, marginBottom: 8 }}>
          <code>id, category, type, en, ko, zh, kk, bn, uz</code> 형식의 CSV
          파일을 업로드하세요.
        </p>
        <input
          type="file"
          accept=".csv"
          onChange={handleCSVUpload}
          disabled={uploading}
        />
        {uploading && (
          <p style={{ fontSize: 13, marginTop: 8 }}>⏳ 업로드 중입니다…</p>
        )}
      </section>

      {/* 전체 삭제 버튼 */}
      <button
        onClick={deleteAll}
        style={{
          background: "#ef4444",
          color: "white",
          padding: "8px 16px",
          borderRadius: 8,
          border: "none",
          cursor: "pointer",
          marginBottom: 16,
          fontSize: 13,
        }}
      >
        ⚠ 전체 문항 삭제
      </button>

      {/* 문항 리스트 */}
      <h2 style={{ marginBottom: 8 }}>
        📋 업로드된 문항 목록 ({questions.length}개)
      </h2>
      {questions.length === 0 && (
        <p style={{ fontSize: 13 }}>현재 저장된 문항이 없습니다.</p>
      )}

      <div style={{ marginTop: 10 }}>
        {questions.map((q) => (
          <div
            key={q.id}
            style={{
              padding: 10,
              borderRadius: 8,
              border: "1px solid #e5e7eb",
              marginBottom: 8,
              background: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8,
            }}
          >
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>
                {q.id}{" "}
                <span style={{ fontWeight: 400, color: "#6b7280" }}>
                  ({q.category})
                </span>
              </div>
              <div style={{ fontSize: 12, color: "#4b5563" }}>
                {q.text?.en?.slice(0, 80) || "(영문 문항 없음)"}…
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
                fontSize: 12,
                whiteSpace: "nowrap",
              }}
            >
              삭제
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
