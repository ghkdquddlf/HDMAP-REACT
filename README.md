# Map-Test

이 프로젝트는 React 기반의 지도 서비스, 파일 업로드, 3D 뷰어 등 다양한 기능을 제공하는 웹 애플리케이션입니다. 지도 위에 데이터를 시각화하고, 파일을 업로드하며, 3D 모델을 확인할 수 있습니다.

## 프로젝트 목적

- 지도 기반 데이터 시각화 및 관리
- 파일 업로드 및 업로드 이력 관리
- 3D 모델 뷰어 제공
- 사용자 인증(회원가입/로그인)

## 주요 기능

- **회원가입/로그인**: 사용자 인증 및 권한 관리
- **지도(Google Map) 뷰**: 지도 표시, 오버레이, 커스텀 마커 등
- **파일 업로드**: 이미지, 데이터 파일 업로드 및 업로드 이력 확인
- **3D 뷰어**: 업로드된 3D 모델(예: glTF, obj 등) 확인
- **반응형 UI**: 다양한 기기에서 사용 가능

## 폴더 구조

```
map-test/
  ├── public/                # 정적 파일 및 이미지, favicon, manifest 등
  ├── src/
  │   ├── components/        # 공통 컴포넌트(헤더, 푸터, 모달 등)
  │   │   ├── ConfirmModal.js
  │   │   ├── Footer.js
  │   │   ├── GoogleMap.js
  │   │   ├── Header.js
  │   │   ├── InputModal.js
  │   │   ├── Map.js
  │   │   └── PageContainer.js
  │   ├── context/           # 전역 상태 관리(Context API)
  │   │   └── AuthContext.js
  │   ├── pages/             # 주요 페이지(라우트 단위)
  │   │   ├── FileUpload.js
  │   │   ├── GoogleMapView.js
  │   │   ├── Login.js
  │   │   ├── MapView.js
  │   │   ├── Signup.js
  │   │   ├── ThreeDViewer.js
  │   │   └── UploadHistory.js
  │   ├── utils/             # 유틸리티 함수
  │   ├── App.js             # 라우팅 및 앱 진입점
  │   ├── index.js           # React DOM 렌더링
  │   └── index.css          # 전체 스타일
  ├── package.json
  └── README.md
```

## 주요 페이지 및 컴포넌트 설명

- **App.js**: 전체 라우팅 및 인증 상태 관리
- **components/Header.js, Footer.js**: 상단/하단 공통 UI
- **components/GoogleMap.js, Map.js**: 지도 및 오버레이, 마커 등 지도 관련 기능
- **components/ConfirmModal.js, InputModal.js**: 사용자 입력 및 확인 모달
- **pages/Login.js, Signup.js**: 사용자 인증(로그인/회원가입)
- **pages/MapView.js, GoogleMapView.js**: 지도 메인 페이지 및 상세 지도 뷰
- **pages/FileUpload.js**: 파일 업로드 기능
- **pages/UploadHistory.js**: 업로드 이력 확인
- **pages/ThreeDViewer.js**: 3D 모델 뷰어
- **context/AuthContext.js**: 인증 상태 전역 관리

## 설치 및 실행 방법

1. 의존성 설치

```bash
npm install
```

2. 개발 서버 실행

```bash
npm start
```

3. 브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

## 사용 기술

- **React**: UI 라이브러리
- **React Router**: SPA 라우팅
- **Context API**: 전역 상태 관리
- **Google Maps API**: 지도 서비스
- **Three.js**: 3D 모델 렌더링
- **HTML/CSS**: 스타일링

## 스크립트

- `npm start` : 개발 서버 실행
- `npm run build` : 프로덕션 빌드
- `npm test` : 테스트 실행

## 참고 자료

- [Create React App 공식 문서](https://facebook.github.io/create-react-app/docs/getting-started)
- [React 공식 문서](https://reactjs.org/)
- [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript/overview)
- [Three.js 공식 문서](https://threejs.org/docs/)

---

문의사항이나 버그 제보는 이슈로 등록해 주세요.
