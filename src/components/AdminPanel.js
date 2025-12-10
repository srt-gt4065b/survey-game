import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Papa from 'papaparse';
import { db } from '../firebase/config';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import toast from 'react-hot-toast';
import './AdminPanel.css';

const AdminPanel = ({ onBack }) => {
  const [stats, setStats] = useState({
    totalResponses: 0,
    averagePoints: 0,
    completionRate: 0,
    activeUsers: 0,
  });
  const [responses, setResponses] = useState([]);
  const [activeTab, setActiveTab] = useState('upload'); // upload, stats, responses

  // 통계 로드
  useEffect(() => {
    loadStatistics();
    loadResponses();
  }, []);

  const loadStatistics = async () => {
    try {
      const responsesSnapshot = await getDocs(collection(db, 'responses'));
      const usersSnapshot = await getDocs(collection(db, 'users'));
      
      setStats({
        totalResponses: responsesSnapshot.size,
        activeUsers: usersSnapshot.size,
        averagePoints: 850, // 계산 로직 추가 필요
        completionRate: 68, // 계산 로직 추가 필요
      });
    } catch (error) {
      console.error('통계 로드 실패:', error);
    }
  };

  const loadResponses = async () => {
    try {
      const q = query(
        collection(db, 'responses'),
        orderBy('timestamp', 'desc'),
        limit(50)
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setResponses(data);
    } catch (error) {
      console.error('응답 로드 실패:', error);
    }
  };

  // CSV 업로드
  const handleCSVUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      complete: (results) => {
        console.log('Parsed questions:', results.data);
        toast.success(`${results.data.length}개 질문 업로드 완료!`);
        // Firebase에 저장 로직 추가
      },
      error: (error) => {
        toast.error('CSV 업로드 실패: ' + error.message);
      }
    });
  };

  // 데이터 내보내기
  const exportData = () => {
    const csv = Papa.unparse(responses);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `survey_responses_${new Date().toISOString()}.csv`;
    a.click();
    toast.success('데이터 내보내기 완료!');
  };

  return (
    <div className="admin-panel">
      {/* 헤더 */}
      <div className="admin-header">
        <button className="back-button" onClick={onBack}>
          ← 돌아가기
        </button>
        <h1>⚙️ 관리자 패널</h1>
      </div>

      {/* 탭 메뉴 */}
      <div className="admin-tabs">
        <button 
          className={activeTab === 'upload' ? 'active' : ''}
          onClick={() => setActiveTab('upload')}
        >
          📤 질문 업로드
        </button>
        <button 
          className={activeTab === 'stats' ? 'active' : ''}
          onClick={() => setActiveTab('stats')}
        >
          📊 통계
        </button>
        <button 
          className={activeTab === 'responses' ? 'active' : ''}
          onClick={() => setActiveTab('responses')}
        >
          📝 응답 관리
        </button>
      </div>

      {/* 탭 콘텐츠 */}
      <div className="admin-content">
        {/* 질문 업로드 탭 */}
        {activeTab === 'upload' && (
          <motion.div 
            className="upload-section"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h2>질문 일괄 업로드</h2>
            <div className="upload-box">
              <input
                type="file"
                accept=".csv,.json"
                onChange={handleCSVUpload}
                id="admin-csv-upload"
              />
              <label htmlFor="admin-csv-upload" className="upload-label">
                📁 CSV/JSON 파일 선택
              </label>
            </div>
            
            <div className="format-example">
              <h3>CSV 형식 예시</h3>
              <pre>
{`section,question_text,type,required,options
학업,수업 만족도,likert,yes,매우불만족|불만족|보통|만족|매우만족
시설,도서관 만족도,likert,yes,매우불만족|불만족|보통|만족|매우만족`}
              </pre>
            </div>

            <div className="upload-tips">
              <h3>💡 업로드 팁</h3>
              <ul>
                <li>UTF-8 인코딩 사용</li>
                <li>최대 500개 질문 권장</li>
                <li>옵션은 파이프(|)로 구분</li>
                <li>섹션별로 그룹화 권장</li>
              </ul>
            </div>
          </motion.div>
        )}

        {/* 통계 탭 */}
        {activeTab === 'stats' && (
          <motion.div 
            className="stats-section"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">📊</div>
                <div className="stat-value">{stats.totalResponses}</div>
                <div className="stat-label">총 응답 수</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-value">{stats.activeUsers}</div>
                <div className="stat-label">참여 학생</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">⭐</div>
                <div className="stat-value">{stats.averagePoints}</div>
                <div className="stat-label">평균 포인트</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">✅</div>
                <div className="stat-value">{stats.completionRate}%</div>
                <div className="stat-label">완료율</div>
              </div>
            </div>

            <div className="chart-section">
              <h3>📈 일별 참여 현황</h3>
              <div className="chart-placeholder">
                {/* 차트 라이브러리 연동 필요 */}
                <p>차트 영역 (Chart.js 연동 예정)</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* 응답 관리 탭 */}
        {activeTab === 'responses' && (
          <motion.div 
            className="responses-section"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="responses-header">
              <h2>최근 응답</h2>
              <button className="export-button" onClick={exportData}>
                📥 데이터 내보내기
              </button>
            </div>

            <div className="responses-table">
              <table>
                <thead>
                  <tr>
                    <th>시간</th>
                    <th>학번</th>
                    <th>질문 ID</th>
                    <th>답변</th>
                    <th>소요 시간</th>
                  </tr>
                </thead>
                <tbody>
                  {responses.slice(0, 10).map((response) => (
                    <tr key={response.id}>
                      <td>{new Date(response.timestamp?.seconds * 1000).toLocaleString()}</td>
                      <td>{response.userId}</td>
                      <td>{response.questionId}</td>
                      <td>{response.answer}</td>
                      <td>{response.timeSpent}초</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
