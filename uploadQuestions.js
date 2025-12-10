/**
 * Firestore Questions Bulk Upload Script (No Encoding Issues)
 * UTF-8 multilingual safe
 *
 * Run with:
 *   node uploadQuestions.js
 */

import fs from "fs";
import Papa from "papaparse";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, serverTimestamp } from "firebase/firestore";

// -------------------------
// 1. Firebase 설정
// -------------------------
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// -------------------------
// 2. CSV 파일 읽기
// -------------------------

const csvFile = "./survey_upload_ready_utf8.csv"; // 파일명 수정 가능

const fileContent = fs.readFileSync(csvFile, "utf8");

Papa.parse(fileContent, {
  header: true,
  skipEmptyLines: true,

  complete: async (results) => {
    console.log("CSV loaded:", results.data.length, "rows");

    for (const row of results.data) {
      const id = row.id?.trim();
      if (!id) continue;

      const docRef = doc(collection(db, "questions"), id);

      await setDoc(docRef, {
        id,
        category: row.category,
        type: row.type,
        text: {
          en: row.en,
          ko: row.ko,
          zh: row.zh,
          kk: row.kk,
          bn: row.bn, // Bangla 문제 없음
          uz: row.uz,
        },
        options: row.options ? row.options.split("|") : [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      console.log(`Uploaded: ${id}`);
    }

    console.log("🔥 DONE! All questions uploaded without encoding issues.");
  },
});
