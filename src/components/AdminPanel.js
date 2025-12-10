// src/components/AdminPanel.js
import React, { useState } from "react";
import Papa from "papaparse";
import { db } from "../firebase/config";
import {
  collection,
  doc,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";
import toast from "react-hot-toast";
import "./AdminPanel.css";

const ADMIN_PASSWORD = "6645";

const AdminPanel = ({ onBack }) => {
  const [isAuthed, setIsAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthed(true);
      toast.success("관리자 모드에 로그인되었습니다.");
    } else {
      toast.error("비밀번호가 올바르지 않습니다.");
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const rows = results.data;
          if (!rows || rows.length === 0) {
            toast.error("CSV에 데이터가 없습니다.");
            return;
          }

          setUploading(true);

          // 👉 Firestore questions 컬렉션에 저장
          const questionsRef = collection(db, "questions");
          const batch = writeBatch(db);

          let count = 0;

          rows.forEach((row, idx) => {
            const id = (row.id || "").toString().trim();
            const category = (row.category || "").toString().trim();
            const type = (row.type || "").toString().trim();
            const en = (row.en || "").toString().trim();
            const ko = (row.ko || "").toString().trim();
            const zh = (row.zh || "").toString().trim();
            const kk = (row.kk || "").toString().trim();
            const bn = (row.bn || "").toString().trim();
            const uz = (row.uz || "").toString().trim();
            const optionsRaw = (row.options || "").toString().trim();

            // 필수값 없으면 스킵
            if (!id || !category || !type || !en) {
              console.warn("스킵된 행:", idx + 1, row);
              return;
            }

            // options 처리: "A|B|C" 형태면 배열로 변환
            let options = [];
            if (optionsRaw.length > 0) {
              options = optionsRaw.split("|").map((o) => o.trim());
            }

            const docRef = doc(questionsRef, id);
            batch.set(docRef, {
              id,
              category,
              type,
              text: {
                en,
                ko,
                zh,
                kk,
                bn,
                uz,
              },
              options,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });

            count += 1;
          });

          if (count === 0) {
            toast.error("유효한 문항이 없습니다. CSV 내용을 확인해주세요.");
            setUploading(false);
            return;
          }

          await batch.commit();

          toast.success(`총 ${count}개의 문항이 업로드되었습니다.`, {
            duration: 5000,
          });
        } catch (err) {
          console.error(err);
          toast.error("업로드 중 오류가 발생했습니다. 콘솔을 확인해주세요.");
        } finally {
          setUploading(false);
        }
      },
      error: (err) => {
        console.error(err);
        toast.error("CSV 파싱 중 오류가 발생했습니다.");
      },
    });
  };

  if (!isAuthed) {
    return (
      <div className="admin-panel">
        <h2>⚙️ 관리자 로그인</h2>
        <input
          type="password"
          placeholder="관리자 비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleLogin}>로그인</button>
        <button onClick={onBack} style={{ marginLeft: "8px" }}>
          ← 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <h2>⚙️ 설문 문항 일괄 업로드</h2>
      <p>UTF-8 CSV 파일을 선택하면 questions 컬렉션에 업로드됩니다.</p>

      <input
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        disabled={uploading}
      />

      {uploading && <p>업로드 중입니다… 잠시만 기다려주세요.</p>}

      <button onClick={onBack} style={{ marginTop: "16px" }}>
        ← 게임 화면으로 돌아가기
      </button>
    </div>
  );
};

export default AdminPanel;
