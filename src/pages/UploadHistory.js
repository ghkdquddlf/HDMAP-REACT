import React, { useState } from 'react';
import Footer from '../components/Footer';
import PageContainer from '../components/PageContainer';
import { useNavigate } from 'react-router-dom';

function UploadHistory() {
  const [selectedItems, setSelectedItems] = useState({});
  const navigate = useNavigate();
  
  // 모달 상태 관리
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [editDescription, setEditDescription] = useState('');
  const [editAuth, setEditAuth] = useState('');
  
  // 권한 옵션 목록
  const authOptions = [
    '전체 공개',
    '조직원만',
    '나만 보기',
    '관리자만',
    '사용자 지정',
  ];

  // 체크박스 상태 관리 함수
  const handleCheckboxChange = (id) => {
    if (selectedItems[id]) {
      setSelectedItems({}); // 이미 선택된 경우 해제
    } else {
      setSelectedItems({ [id]: true }); // 새로 선택
    }
  };

  // 실제 데이터는 나중에 백엔드에서 받아올 예정
  const mockData = [
    {
      id: 1,
      projectName: '데모 프로젝트',
      description: '데모용 전광판 hdmap 작업',
      date: '2025/03/21',
      fileName: '32645787_20250321.pcd',
      auth: '전체 공개'
    },
    {
      id: 2,
      projectName: '데모 프로젝트',
      description: '데모용 전광판 hdmap 작업',
      date: '2025/03/21',
      fileName: '32645787_20250321.pcd',
      auth: '조직원만'
    },
    {
      id: 3,
      projectName: '데모 프로젝트',
      description: '데모용 전광판 hdmap 작업',
      date: '2025/03/21',
      fileName: '32645787_20250321.pcd',
      auth: '나만 보기'
    }
  ];

  // 선택된 프로젝트 id 추출
  const selectedId = Object.keys(selectedItems).find(id => selectedItems[id]);
  const selectedProject = mockData.find(item => String(item.id) === selectedId);

  // 액션 핸들러
  const handleViewMap = () => {
    if (selectedProject) {
      // 예시: 구글 지도 페이지로 이동 (id 전달)
      navigate(`/google-map?id=${selectedProject.id}`);
    }
  };
  const handleAdd = () => {
    navigate('/upload');
  };
  const handleEdit = () => {
    if (selectedProject) {
      setEditingProject(selectedProject);
      setEditDescription(selectedProject.description);
      setEditAuth(selectedProject.auth);
      setIsModalOpen(true);
    }
  };
  const handleDelete = () => {
    if (selectedProject) {
      // 실제 삭제 로직은 백엔드 연동 필요
      alert(`프로젝트(id: ${selectedProject.id})를 삭제합니다.`);
    }
  };
  
  // 모달 닫기
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProject(null);
  };
  
  // 수정 저장
  const handleSaveEdit = () => {
    // 실제 서비스에서는 API 호출로 저장
    // 이 예시에서는 로컬 데이터만 업데이트
    
    // 실제 구현 시 여기서 API 호출
    
    alert('수정이 저장되었습니다.');
    handleCloseModal();
  };

  return (
    <>
      <PageContainer 
        title="내역 대시보드"
        tooltipContent="올려서 작업 내역의 지도를 확인할 수 있습니다."
      >
        <div style={styles.uploadHistorySection}>
          {/* <div style={styles.header}>
            <h2 style={styles.title}>
              업로드 내역
            </h2>
            <span style={styles.description}>클릭시 해당 내역의 지도를 확인할 수 있습니다.</span>
          </div> */}
          <div style={styles.tableHeader}>
            <h3 style={styles.tableTitle}>업로드 내역</h3>
            <div style={styles.actionButtonsContainer}>
              <button
                style={styles.actionButton}
                onClick={handleAdd}
              >
                추가
              </button>
              <button
                style={styles.actionButton}
                onClick={handleViewMap}
                disabled={!selectedProject}
              >
                지도보기
              </button>
              <button
                style={styles.actionButton}
                onClick={handleEdit}
                disabled={!selectedProject}
              >
                수정
              </button>
              <button
                style={styles.actionButton}
                onClick={handleDelete}
                disabled={!selectedProject}
              >
                삭제
              </button>
            </div>
          </div>
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={{...styles.th, ...styles.thFirst}}></th>
                  <th style={styles.th}>프로젝트명</th>
                  <th style={styles.th}>프로젝트 설명</th>
                  <th style={styles.th}>날짜</th>
                  <th style={styles.th}>권한</th>
                  <th style={{...styles.th, ...styles.thLast}}>파일명</th>
                </tr>
              </thead>
              <tbody>
                {mockData.map((item) => (
                  <tr 
                    key={item.id} 
                    style={styles.tr}
                  >
                    <td style={styles.checkboxCell}>
                      <input
                        type="checkbox"
                        checked={selectedItems[item.id] || false}
                        onChange={() => handleCheckboxChange(item.id)}
                        style={styles.checkbox}
                      />
                    </td>
                    <td style={styles.td}>{item.projectName}</td>
                    <td style={styles.td}>{item.description}</td>
                    <td style={styles.td}>{item.date}</td>
                    <td style={styles.td}>{item.auth}</td>
                    <td style={styles.td}>{item.fileName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* 수정 모달 */}
          {isModalOpen && editingProject && (
            <div style={styles.modalOverlay}>
              <div style={styles.modalContainer}>
                <div style={styles.modalHeader}>
                  <h3 style={styles.modalTitle}>프로젝트 정보 수정</h3>
                  <button style={styles.closeButton} onClick={handleCloseModal}>×</button>
                </div>
                <div style={styles.modalBody}>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>프로젝트명</label>
                    <input
                      type="text"
                      value={editingProject.projectName}
                      readOnly
                      style={{...styles.formControl, backgroundColor: '#f1f5f9'}}
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>프로젝트 설명</label>
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      style={{...styles.formControl, minHeight: '80px'}}
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>파일명</label>
                    <input
                      type="text"
                      value={editingProject.fileName}
                      readOnly
                      style={{...styles.formControl, backgroundColor: '#f1f5f9'}}
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>권한 설정</label>
                    <select
                      value={editAuth}
                      onChange={(e) => setEditAuth(e.target.value)}
                      style={styles.formControl}
                    >
                      {authOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div style={styles.modalFooter}>
                  <button style={styles.cancelButton} onClick={handleCloseModal}>취소</button>
                  <button style={styles.saveButton} onClick={handleSaveEdit}>저장</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </PageContainer>
      <Footer />
    </>
  );
}

const styles = {
  uploadHistorySection: {
    padding: '1rem',
  },
  tableHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.5rem 2rem',
    marginBottom: '1rem',
  },
  tableTitle: {
    margin: 0,
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#1E293B',
  },
  actionButtonsContainer: {
    display: 'flex',
    gap: '0.5rem',
  },
  tableContainer: {
    overflowY: 'auto',
    maxHeight: 'calc(65vh - 160px)', // header(60px) + footer(60px) + 여유(40px)
    minHeight: 'calc(65vh - 160px)',
    WebkitOverflowScrolling: 'touch',
    padding: '1rem 0',
  },
  table: {
    width: '100%',
    minWidth: '800px',
    borderCollapse: 'separate',
    borderSpacing: '0',
    padding: '0 2rem',
  },
  th: {
    padding: '0.75rem 1rem',
    textAlign: 'center',
    fontSize: '0.875rem',
    color: '#64748B',
    backgroundColor: '#FFFFFF',
    whiteSpace: 'nowrap',
    borderBottom: '1px solid #E2E8F0',
    position: 'sticky',
    top: 0,
    zIndex: 2,
  },
  thFirst: {
    borderTopLeftRadius: '20px',
    borderBottomLeftRadius: '20px',
  },
  thLast: {
    borderTopRightRadius: '20px',
    borderBottomRightRadius: '20px',
  },
  tr: {
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    textAlign: 'center',
  },
  td: {
    padding: '0.75rem 1rem',
    fontSize: '0.875rem',
    color: '#334155',
    whiteSpace: 'nowrap',
    borderBottom: '1px solid #E2E8F0',
  },
  checkboxCell: {
    padding: '0.75rem 1rem',
    width: '40px',
    textAlign: 'center',
    borderBottom: '1px solid #E2E8F0'
  },
  checkbox: {
    cursor: 'pointer',
    width: '16px',
    height: '16px'
  },
  tooltip: {
    backgroundColor: '#333',
    color: '#fff',
    borderRadius: '4px',
    padding: '8px 12px',
    fontSize: '0.875rem',
    zIndex: 1000,
  },
  actionButton: {
    padding: '0.5rem 1rem',
    border: '1px solid #E2E8F0',
    borderRadius: '4px',
    backgroundColor: '#FFFFFF',
    color: '#334155',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
    opacity: 1,
    outline: 'none',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    ':hover': {
      backgroundColor: '#F8FAFC',
    },
    ':disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
    }
  },
  // 모달 스타일
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    width: '500px',
    maxWidth: '90%',
    maxHeight: '90%',
    display: 'flex',
    flexDirection: 'column',
  },
  modalHeader: {
    padding: '1rem',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    margin: 0,
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#1E293B',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    color: '#64748b',
  },
  modalBody: {
    padding: '1rem',
    overflowY: 'auto',
  },
  modalFooter: {
    padding: '1rem',
    borderTop: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.5rem',
  },
  formGroup: {
    marginBottom: '1rem',
  },
  formLabel: {
    display: 'block',
    marginBottom: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#334155',
  },
  formControl: {
    display: 'block',
    width: '100%',
    padding: '0.5rem',
    fontSize: '0.875rem',
    border: '1px solid #e2e8f0',
    borderRadius: '4px',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  cancelButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#e2e8f0',
    color: '#334155',
    border: 'none',
    borderRadius: '4px',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
  },
  saveButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#0B1C40',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
  },
};

export default UploadHistory; 