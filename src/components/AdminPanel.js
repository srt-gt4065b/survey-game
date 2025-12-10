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

// 🔥 Unicode 정규화 함수 (Bangla 포함 모든 언어 안전)
const normalizeText = (txt) =>
  txt ? txt.toString().trim().normalize("NFC") : "";

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
      encoding: "UTF-8",   // ← 🔥 매우 중요
      complete: async (results) => {
        try {
          const rows = results.data;

          if (!rows || rows.length === 0) {
            toast.error("CSV에 데이터가 없습니다.");
            return;
          }

          setUploading(true);

          const questionsRef = collection(db, "questions");
          const batch = writeBatch(db);
          let count = 0;

          rows.forEach((row, idx) => {
            const id = normalizeText(row.id);
            const category = normalizeText(row.category);
            const type = normalizeText(row.type);

            const en = normalizeText(row.en);
            const ko = normalizeText(row.ko);
            const zh = normalizeText(row.zh);
            const kk = normalizeText(row.kk);
            const bn = normalizeText(row.bn);   // ← 🔥 Bangla fix
            const uz = normalizeText(row.uz);

            const optionsRaw = normalizeText(row.options);

            if (!id || !category || !type || !en) {
              console.warn("스킵된 행:", idx + 1, row);
              return;
            }

            const options =
              optionsRaw.length > 0
                ? optionsRaw.split("|").map((o) => normalizeText(o))
                : [];

            const docRef = doc(questionsRef, id);

            batch.set(docRef, {
              id,
              category,
              type,
              text: { en, ko, zh, kk, bn, uz },
              options,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });

            count++;
          });

          await batch.commit();

          toast.success(`총 ${count}개의 문항이 업로드되었습니다.`);
        } catch (err) {
          console.error(err);
          toast.error("업로드 중 오류 발생. 콘솔 확인.");
        } finally {
          setUploading(false);
        }
      },
    });
  };

  return !isAuthed ? (
    <div className="admin-panel">
      <h2>⚙️ 관리자 로그인</h2>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="관리자 비밀번호"
      />
      <button onClick={handleLogin}>로그인</button>
      <button onClick={onBack}>← 돌아가기</button>
    </div>
  ) : (
    <div className="admin-panel">
      <h2>⚙️ 설문 문항 일괄 업로드</h2>
      <input type="file" accept=".csv" onChange={handleFileUpload} disabled={uploading}/>
      {uploading && <p>업로드 중입니다...</p>}
      <button onClick={onBack}>← 게임 화면으로 돌아가기</button>
    </div>
  );
};

export default AdminPanel;
