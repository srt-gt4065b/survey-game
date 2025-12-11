# 📊 Survey Admin Panel - CSV 업로드 가이드

## 🎯 현재 DB 구조

```
questions/
  ├─ Q100/           ← 문서 ID (Q + 숫자)
  │   ├─ id: "Q100"
  │   ├─ category: "Facilities"
  │   ├─ type: "likert" 또는 "text" 또는 "multi"
  │   ├─ text:
  │   │   ├─ en: "영어 질문"
  │   │   ├─ ko: "한국어 질문"
  │   │   ├─ zh: "中文问题"
  │   │   ├─ kk: "Қазақша сұрақ"
  │   │   ├─ uz: "O'zbekcha savol"
  │   │   └─ bn: "বাংলা প্রশ্ন"
  │   ├─ options: ["선택지1", "선택지2", ...]
  │   ├─ createdAt: 타임스탬프
  │   └─ updatedAt: 타임스탬프
```

---

## 📥 CSV 파일 형식

### 필수 컬럼:

| 컬럼 | 설명 | 예시 |
|------|------|------|
| **id** | 질문 ID (Q + 숫자) | Q100, Q101, Q102 |
| **category** | 카테고리명 | Facilities, Teaching, Technology |
| **type** | 질문 유형 | likert, text, multi |
| **en** | 영어 질문 | "The building is safe..." |
| **ko** | 한국어 질문 | "건물은 안전하며..." |
| **zh** | 중국어 질문 | "该建筑安全且..." |
| **kk** | 카자흐어 질문 | "Ғимарат қауіпсіз..." |
| **uz** | 우즈베크어 질문 | "Bino xavfsiz..." |
| **bn** | 벵골어 질문 | "ভবনটি নিরাপদ..." |
| **options** | 선택지 (큰따옴표로 감싸기) | "Option 1,Option 2,Option 3" |

---

## ✅ CSV 작성 예시

```csv
id,category,type,en,ko,zh,kk,uz,bn,options
Q200,Technology,likert,I am satisfied with the technology,나는 기술에 만족한다,我对技术感到满意,Мен технологияға қанағаттанамын,Men texnologiyadan mamnunman,আমি প্রযুক্তিতে সন্তুষ্ট,"Strongly Agree,Agree,Neutral,Disagree,Strongly Disagree"
Q201,Teaching,text,What improvements would you suggest?,어떤 개선을 제안하시나요?,您有什么改进建议?,Қандай жақсартулар ұсынар едіңіз?,Qanday yaxshilashlarni taklif qilasiz?,আপনি কী উন্নতি প্রস্তাব করবেন?,
Q202,Facilities,multi,Which facilities do you use?,어떤 시설을 이용하시나요?,您使用哪些设施?,Қандай мекемелерді пайдаланасыз?,Qaysi ob'ektlardan foydalanasiz?,আপনি কোন সুবিধা ব্যবহার করেন?,"Library,Lab,Sports Center"
```

---

## 🔧 주요 기능

### 1️⃣ CSV 템플릿 다운로드
- **버튼:** 📥 Template
- **파일:** `survey_template.csv`
- **내용:** 6개 샘플 질문 포함

### 2️⃣ CSV 업로드
- **버튼:** 📤 Upload CSV
- **지원 형식:** .csv (UTF-8 인코딩)
- **처리:** 자동으로 Firebase에 저장

### 3️⃣ 전체 내보내기
- **버튼:** 💾 Export All
- **파일:** `questions_export_YYYY-MM-DD.csv`
- **내용:** 현재 DB의 모든 질문

### 4️⃣ 개별 편집/삭제
- **편집:** ✏️ 버튼 → 모달에서 수정 → 💾 Save
- **삭제:** ❌ 버튼 → 확인 → 삭제

---

## 📋 사용 순서

### Step 1: 템플릿 다운로드
```
1. Admin Panel 접속 (admin / admin)
2. "📥 Template" 버튼 클릭
3. survey_template.csv 다운로드
```

### Step 2: CSV 파일 편집

**엑셀에서:**
```
1. 엑셀 열기
2. 데이터 → 텍스트/CSV 가져오기
3. UTF-8 인코딩 선택
4. 구분 기호: 쉼표
5. 데이터 입력
6. 다른 이름으로 저장 → CSV UTF-8
```

**또는 Google Sheets에서:**
```
1. Google Sheets에서 열기
2. 데이터 입력
3. 파일 → 다운로드 → CSV
```

### Step 3: ID 규칙 확인

**✅ 올바른 ID:**
```
Q100, Q101, Q102, Q200, Q1000
```

**❌ 잘못된 ID:**
```
100, q100, 1, abc
→ 반드시 "Q" + 숫자 형식!
```

### Step 4: Options 작성

**Likert (5점 척도):**
```csv
"Strongly Agree,Agree,Neutral,Disagree,Strongly Disagree"
```

**Multi (객관식):**
```csv
"Library,Computer Lab,Sports Center,Cafeteria"
```

**Text (주관식):**
```csv
(비워두기)
```

### Step 5: 업로드

```
1. "📤 Upload CSV" 버튼 클릭
2. 편집한 CSV 파일 선택
3. 업로드 진행 (⏳ Uploading...)
4. 완료 메시지: "✅ N개 업로드 완료!"
5. 자동으로 테이블 새로고침
```

---

## ⚠️ 주의사항

### 1. UTF-8 인코딩 필수
```
❌ ANSI로 저장 → 한글 깨짐
✅ UTF-8로 저장 → 정상
```

**확인 방법:**
```
메모장에서 열기 → 다른 이름으로 저장
→ 인코딩: UTF-8 선택
```

### 2. Options에 쉼표 포함 시
```
❌ Option 1,Option 2,Option 3
✅ "Option 1,Option 2,Option 3"
→ 큰따옴표로 감싸기!
```

### 3. 빈 셀 처리
```
text 타입의 options → 비워두기 OK
언어별 질문 → 하나 이상 필수
```

### 4. ID 중복
```
같은 ID로 업로드 → 기존 데이터 덮어씌워짐
새 질문 추가 시 → 기존에 없는 ID 사용
```

---

## 🔍 문제 해결

### ❌ "필수 필드 누락" 오류
```
→ id, category, type 확인
→ 빈 행 삭제
→ 엑셀에서 숨겨진 행 확인
```

### ❌ 한글/중국어 깨짐
```
→ CSV를 UTF-8로 다시 저장
→ 메모장 → 다른 이름으로 저장 → UTF-8
```

### ❌ Options가 배열로 안 들어감
```
→ 큰따옴표로 감쌌는지 확인
→ "Option A,Option B,Option C"
```

### ❌ 업로드 후 안 보임
```
→ F5 (새로고침)
→ 🔄 Reload 버튼 클릭
→ F12 콘솔 확인
```

---

## 💡 팁

### 1. 대량 업로드
```
한 번에 최대 500개 업로드 가능
500개 이상 → 파일 나눠서 업로드
```

### 2. 기존 데이터 백업
```
업로드 전 → "💾 Export All" 클릭
→ 백업 CSV 다운로드
→ 문제 발생 시 복구 가능
```

### 3. 테스트 업로드
```
처음엔 1~2개만 업로드해서 테스트
정상 확인 후 → 전체 업로드
```

### 4. 순차적 ID 관리
```
기존: Q1 ~ Q168
새 질문: Q200부터 시작 (충돌 방지)
```

---

## 📊 통계 확인

Admin Panel 상단에 표시:
```
Total: 168  |  Filtered: 45
```

- **Total:** 전체 질문 수
- **Filtered:** 현재 필터링된 질문 수

---

## 🎯 체크리스트

업로드 전:
- [ ] ID가 "Q + 숫자" 형식인가?
- [ ] UTF-8 인코딩으로 저장했는가?
- [ ] options는 큰따옴표로 감쌌는가?
- [ ] 빈 행이 없는가?
- [ ] 필수 컬럼(id, category, type)이 모두 있는가?

업로드 후:
- [ ] 성공 메시지 확인
- [ ] 테이블에서 데이터 확인
- [ ] F12 콘솔에서 오류 확인
- [ ] 각 언어로 질문 확인

---

## 📞 문제 발생 시

1. F12 → Console 탭 확인
2. 빨간 오류 메시지 캡처
3. CSV 파일 첫 5줄 확인
4. 교수님께 알려주기

---

**행운을 빕니다! 🎉**
