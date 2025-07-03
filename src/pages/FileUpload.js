import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import PageContainer from '../components/PageContainer';

function FileUpload() {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploadComplete, setIsUploadComplete] = useState(false);

  // 입력값 상태 추가
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [projectAuth, setProjectAuth] = useState('');
  const projectAuthOptions = [
    '전체 공개',
    '조직원만',
    '나만 보기',
    '관리자만',
    '사용자 지정',
  ];

  // 일괄적용 상태
  const [isApplied, setIsApplied] = useState(false);

  // 더미 데이터: 이상치 리스트 (보정전)
  const initialOutlierListBefore = [
    { no: 1, x: '127.000123', y: '999.999999', method: '직접 입력' },
    { no: 2, x: '888.888888', y: '37.123456', method: '직접 입력' },
    { no: 3, x: '127.484189', y: '37.456789', method: '평균값 보간' },
  ];
  // 더미 데이터: 결측치 리스트 (보정전)
  const initialMissingListBefore = [
    { no: 4, x: '127.000123', y: 'Null', method: '직접 입력' },
    { no: 5, x: 'Null', y: '37.123457', method: '직접 입력' },
    { no: 6, x: '127.000125', y: 'Null', method: '평균값 보간' },
  ];

  // 상태로 관리
  const [outlierListBefore, setOutlierListBefore] = useState(initialOutlierListBefore);
  const [missingListBefore, setMissingListBefore] = useState(initialMissingListBefore);

  // 보정후 데이터: isApplied에 따라 값이 채워짐
  const outlierListAfter = outlierListBefore.map(row => ({
    no: row.no,
    x: isApplied ? row.x : '',
    y: isApplied ? row.y : '',
  }));
  const missingListAfter = missingListBefore.map(row => ({
    no: row.no,
    x: isApplied ? row.x : '',
    y: isApplied ? row.y : '',
  }));

  // 보정방식 옵션
  const methodOptions = ['직접 입력', '평균값 보간', '최빈값 보간', '선형 보간'];

  const navigate = useNavigate();

  // 파일 업로드 처리 함수
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    setSelectedFile(file);
    setIsUploading(true);
    setIsUploadComplete(false);
    setUploadStatus('파일 업로드 중...');

    // FormData 객체 생성
    const formData = new FormData();
    formData.append('file', file);

    // XMLHttpRequest를 사용한 업로드
    const xhr = new XMLHttpRequest();
    
    // 업로드 진행률 추적
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const progress = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(progress);
        
        // 예상 남은 시간 계산 (선택적)
        const uploadSpeed = event.loaded / (Date.now() - startTime); // bytes per ms
        const remainingBytes = event.total - event.loaded;
        const remainingTime = remainingBytes / uploadSpeed / 1000; // seconds
        
        setUploadStatus(`파일 업로드 중... 약 ${Math.round(remainingTime)}초 남음`);
      }
    };

    // 업로드 완료 처리
    xhr.onload = () => {
      if (xhr.status === 200) {
        setIsUploading(false);
        setIsUploadComplete(true);
        setUploadStatus('파일 업로드가 완료되었습니다.');
      } else {
        setIsUploading(false);
        setUploadStatus('업로드 중 오류가 발생했습니다.');
      }
    };

    // 업로드 에러 처리
    xhr.onerror = () => {
      setIsUploading(false);
      setUploadStatus('업로드 중 오류가 발생했습니다.');
    };

    // 시작 시간 기록
    const startTime = Date.now();

    // 테스트를 위한 가상 업로드 (실제 구현 시 제거)
    simulateSlowUpload(file.size);
  };

  // 파일 크기에 따른 가상 업로드 시뮬레이션 (테스트용)
  const simulateSlowUpload = (fileSize) => {
    const totalChunks = 100;
    const chunkSize = fileSize / totalChunks;
    let uploadedSize = 0;
    const startTime = Date.now();

    const interval = setInterval(() => {
      uploadedSize += chunkSize;
      const progress = Math.min(Math.round((uploadedSize / fileSize) * 100), 100);
      setUploadProgress(progress);

      // 예상 남은 시간 계산
      const elapsedTime = Date.now() - startTime;
      const uploadSpeed = uploadedSize / elapsedTime; // bytes per ms
      const remainingBytes = fileSize - uploadedSize;
      const remainingTime = remainingBytes / uploadSpeed / 1000; // seconds

      if (progress < 100) {
        setUploadStatus(`파일 업로드 중... 약 ${Math.round(remainingTime)}초 남음`);
      }

      if (progress >= 100) {
        clearInterval(interval);
        setIsUploading(false);
        setIsUploadComplete(true);
        setUploadStatus('파일 업로드가 완료되었습니다.');
      }
    }, Math.max(50, Math.min(fileSize / 1000000, 200)));
  };

  const handleViewMap = () => {
    navigate('/map');
  };

  const handleApplyAll = () => {
    // 일괄 적용 기능 구현
    setIsApplied(true);
    console.log('일괄 적용하기 클릭');
  };

  // 표 렌더링 함수 (컬럼 동적)
  const renderTable = (title, data, columns = ['no', 'x', 'y', 'method']) => (
    <div style={{ flex: 1, margin: '0 1rem' }}>
      <div style={{
        background: '#F1F5F9',
        padding: '0.5rem 1rem',
        fontWeight: 'bold',
        borderRadius: '6px 6px 0 0',
        border: '1px solid #E2E8F0',
        borderBottom: 'none',
        textAlign: 'center',
      }}>{title}</div>
      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #E2E8F0', background: '#fff' }}>
        <thead>
          <tr style={{ background: '#F8FAFC' }}>
            <th style={tableStyles.th}>번호</th>
            <th style={tableStyles.th}>X좌표</th>
            <th style={tableStyles.th}>Y좌표</th>
            {columns.includes('method') && <th style={tableStyles.th}>보정 방식</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.no}>
              <td style={tableStyles.td}>{row.no}</td>
              <td style={tableStyles.td}>{row.x}</td>
              <td style={tableStyles.td}>{row.y}</td>
              {columns.includes('method') && <td style={tableStyles.td}>{row.method}</td>}
            </tr>
          ))}
          {/* 데이터가 3개 미만인 경우 빈 행 추가하여 높이 유지 */}
          {data.length < 3 && Array(3 - data.length).fill().map((_, i) => (
            <tr key={`empty-${i}`}>
              <td style={tableStyles.emptyTd}>&nbsp;</td>
              <td style={tableStyles.emptyTd}>&nbsp;</td>
              <td style={tableStyles.emptyTd}>&nbsp;</td>
              {columns.includes('method') && <td style={tableStyles.emptyTd}>&nbsp;</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // 보정 전 테이블에서 드롭다운/인풋박스 렌더링
  const renderEditableTable = (title, data, setData, columns = ['no', 'x', 'y', 'method']) => (
    <div style={{ flex: 1, margin: '0 1rem' }}>
      <div style={{
        background: '#F1F5F9',
        padding: '0.5rem 1rem',
        fontWeight: 'bold',
        borderRadius: '6px 6px 0 0',
        border: '1px solid #E2E8F0',
        borderBottom: 'none',
        textAlign: 'center',
      }}>{title}</div>
      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #E2E8F0', background: '#fff' }}>
        <thead>
          <tr style={{ background: '#F8FAFC' }}>
            <th style={tableStyles.th}>번호</th>
            <th style={tableStyles.th}>X좌표</th>
            <th style={tableStyles.th}>Y좌표</th>
            {columns.includes('method') && <th style={tableStyles.th}>보정 방식</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={row.no}>
              <td style={tableStyles.td}>{row.no}</td>
              <td style={tableStyles.td}>
                {row.method === '직접 입력' ? (
                  <input
                    type="text"
                    value={row.x === 'Null' ? '' : row.x}
                    onChange={e => {
                      const newData = [...data];
                      newData[idx].x = e.target.value;
                      setData(newData);
                    }}
                    style={tableStyles.input}
                    placeholder="X좌표 입력"
                  />
                ) : (
                  row.x
                )}
              </td>
              <td style={tableStyles.td}>
                {row.method === '직접 입력' ? (
                  <input
                    type="text"
                    value={row.y === 'Null' ? '' : row.y}
                    onChange={e => {
                      const newData = [...data];
                      newData[idx].y = e.target.value;
                      setData(newData);
                    }}
                    style={tableStyles.input}
                    placeholder="Y좌표 입력"
                  />
                ) : (
                  row.y
                )}
              </td>
              {columns.includes('method') && (
                <td style={tableStyles.td}>
                  <select
                    value={row.method}
                    onChange={e => {
                      const newData = [...data];
                      newData[idx].method = e.target.value;
                      setData(newData);
                    }}
                    style={tableStyles.select}
                  >
                    {methodOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </td>
              )}
            </tr>
          ))}
          {/* 데이터가 3개 미만인 경우 빈 행 추가하여 높이 유지 */}
          {data.length < 3 && Array(3 - data.length).fill().map((_, i) => (
            <tr key={`empty-${i}`}>
              <td style={tableStyles.emptyTd}>&nbsp;</td>
              <td style={tableStyles.emptyTd}>&nbsp;</td>
              <td style={tableStyles.emptyTd}>&nbsp;</td>
              {columns.includes('method') && <td style={tableStyles.emptyTd}>&nbsp;</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // 두 표를 가로로 나란히 보여주는 함수 (보정후는 보정방식 컬럼 제외)
  const renderBeforeAfterTables = (beforeTitle, afterTitle, beforeData, afterData, setBeforeData) => (
    <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
      <div style={{ flex: 1 }}>{renderEditableTable(beforeTitle, beforeData, setBeforeData, ['no', 'x', 'y', 'method'])}</div>
      <div style={{ flex: 1 }}>{renderTable(afterTitle, afterData, ['no', 'x', 'y'])}</div>
    </div>
  );

  return (
    <>
      <PageContainer
        title="HD MAP 파일 업로드"
        tooltipContent="HD맵 생성을 위한 파일을 업로드할 수 있습니다."
      >
        <div style={styles.uploadSection}>
          <div style={styles.uploadArea}>
            {/* 업로드 완료 전: 입력 폼 및 업로드 UI */}
            {!isUploadComplete && (
              <>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>*프로젝트명</label>
                  <input 
                    type="text" 
                    placeholder="프로젝트 명을 입력해주세요."
                    style={styles.input}
                    value={projectName}
                    onChange={e => setProjectName(e.target.value)}
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>*프로젝트 설명</label>
                  <input 
                    type="text" 
                    placeholder="프로젝트에 대한 설명을 입력해주세요."
                    style={styles.input}
                    value={projectDesc}
                    onChange={e => setProjectDesc(e.target.value)}
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>*열람 권한 설정</label>
                  <select
                    style={{ ...styles.input, cursor: 'pointer', minWidth: '180px' }}
                    value={projectAuth}
                    onChange={e => setProjectAuth(e.target.value)}
                  >
                    <option value="" disabled>권한을 선택해주세요</option>
                    {projectAuthOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div style={styles.fileInfoSection}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>업로드 파일</label>
                    <div style={styles.fileInfo}>
                      {selectedFile ? (
                        <span style={styles.fileName}>{selectedFile.name}</span>
                      ) : (
                        <span style={styles.noFile}>선택된 파일이 없습니다.</span>
                      )}
                    </div>
                  </div>
                </div>
                {!isUploading && (
                  <div style={styles.dropZone}>
                    <p style={styles.dropZoneText}>파일을 드래그하여 업로드하거나</p>
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      style={styles.fileInput}
                      accept=".pcd"
                      id="fileInput"
                    />
                    <button 
                      style={styles.uploadButton}
                      onClick={() => document.getElementById('fileInput').click()}
                    >
                      파일 선택하기
                    </button>
                    <p style={styles.fileTypeText}>.pcd 파일만 업로드 가능합니다.</p>
                  </div>
                )}
                {isUploading && (
                  <div style={styles.progressContainer}>
                    <div style={styles.progressBar}>
                      <div 
                        style={{
                          ...styles.progressFill,
                          width: `${uploadProgress}%`
                        }}
                      />
                    </div>
                    <div style={styles.progressText}>
                      <span>{uploadProgress}%</span>
                      <span>{uploadStatus}</span>
                    </div>
                  </div>
                )}
              </>
            )}
            {/* 업로드 완료 후: 리스트 뷰만 표시 */}
            {isUploadComplete && (
              <div style={{ marginTop: '2.5rem', background: '#F8FAFC', borderRadius: '12px', padding: '2rem' }}>
                {/* 이상치 리스트: 보정전/보정후 */}
                <div style={{ marginBottom: '2.5rem' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '1rem', textAlign: 'center' }}>
                    정밀 주행 환경정보 파일 업로드 이상치 리스트 뷰
                  </div>
                  {renderBeforeAfterTables('보정전', '보정후', outlierListBefore, outlierListAfter, setOutlierListBefore)}
                </div>
                {/* 결측치 리스트: 보정전/보정후 */}
                <div style={{ marginBottom: '2.5rem' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '1rem', textAlign: 'center' }}>
                    정밀 주행 환경정보 파일 업로드 결측치 리스트 뷰
                  </div>
                  {renderBeforeAfterTables('보정전', '보정후', missingListBefore, missingListAfter, setMissingListBefore)}
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                  <button
                    style={{ ...styles.uploadButton, width: '220px', fontSize: '1.1rem' }}
                    onClick={handleApplyAll}
                    disabled={isApplied}
                  >
                    일괄적용하기
                  </button>
                  {isApplied && (
                    <button
                      style={{ ...styles.uploadButton, width: '220px', fontSize: '1.1rem', backgroundColor: '#2563EB' }}
                      onClick={handleViewMap}
                    >
                      지도보기
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </PageContainer>
      <Footer />
    </>
  );
}

const styles = {
  uploadSection: {
    padding: '2rem 4rem',
  },
  uploadArea: {
    borderRadius: '12px',
    padding: '2rem',
  },
  inputGroup: {
    marginBottom: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '2rem',
  },
  label: {
    display: 'block',
    fontSize: '1rem',
    fontWeight: '700',
    color: '#000000',
    width: '120px',
    flexShrink: 0,
  },
  input: {
    flex: 1,
    padding: '0.75rem 1rem',
    fontSize: '0.9rem',
    border: '1px solid #E2E8F0',
    borderRadius: '6px',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    boxSizing: 'border-box',
    maxWidth: '400px',
  },
  dropZone: {
    border: '2px dashed #E2E8F0',
    borderRadius: '12px',
    padding: '2rem',
    textAlign: 'center',
    backgroundColor: '#F8FAFC',
    marginTop: '2rem',
    cursor: 'pointer',
    transition: 'border-color 0.2s ease',
  },
  dropZoneText: {
    margin: '0 0 1rem 0',
    color: '#64748B',
    fontSize: '0.9rem',
  },
  uploadButton: {
    backgroundColor: '#0B1C40',
    color: '#FFFFFF',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '6px',
    fontSize: '0.9rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  fileTypeText: {
    margin: '1rem 0 0 0',
    color: '#94A3B8',
    fontSize: '0.8rem',
  },
  fileInput: {
    display: 'none',
  },
  progressContainer: {
    marginTop: '2rem',
    width: '100%',
  },
  progressBar: {
    width: '100%',
    height: '8px',
    backgroundColor: '#E2E8F0',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#60A5FA',
    borderRadius: '4px',
    transition: 'width 0.3s ease',
  },
  progressText: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '0.5rem',
    color: '#64748B',
    fontSize: '0.9rem',
  },
  fileInfoSection: {
    marginBottom: '1.5rem',
    borderBottom: '1px solid #E2E8F0',
    paddingBottom: '1.5rem',
  },
  fileInfo: {
    flex: 1,
    padding: '0.75rem 1rem',
    backgroundColor: '#F8FAFC',
    borderRadius: '6px',
    fontSize: '0.9rem',
    maxWidth: '400px',
  },
  fileName: {
    color: '#1E293B',
  },
  noFile: {
    color: '#94A3B8',
  },
  viewMapContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '1rem',
  },
};

const tableStyles = {
  th: {
    border: '1px solid #E2E8F0',
    padding: '0.75rem',
    background: '#F8FAFC',
    fontWeight: '600',
    fontSize: '0.95rem',
    minWidth: '100px',
  },
  td: {
    border: '1px solid #E2E8F0',
    padding: '0.75rem',
    textAlign: 'center',
    fontSize: '0.95rem',
    height: '63px',
    minWidth: '100px',
  },
  emptyTd: {
    border: '1px solid #E2E8F0',
    padding: '0.75rem',
    textAlign: 'center',
    fontSize: '0.95rem',
    height: '58px',
    color: 'transparent',
    minWidth: '100px',
  },
  input: {
    width: '100%',
    padding: '0.5rem 0.75rem',
    fontSize: '0.9rem',
    border: '1px solid #E2E8F0',
    borderRadius: '4px',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    backgroundColor: '#F8FAFC',
    color: '#1E293B',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    textAlign: 'center',
    height: '36px',
    minWidth: '80px',
  },
  select: {
    width: '100%',
    padding: '0.5rem 0.75rem',
    fontSize: '0.9rem',
    border: '1px solid #E2E8F0',
    borderRadius: '4px',
    outline: 'none',
    backgroundColor: '#F8FAFC',
    color: '#1E293B',
    fontFamily: 'inherit',
    cursor: 'pointer',
    appearance: 'none',
    backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 0.5rem center',
    backgroundSize: '1rem',
    paddingRight: '2rem',
    textAlign: 'center',
    height: '36px',
    minWidth: '120px',
  }
};

export default FileUpload; 