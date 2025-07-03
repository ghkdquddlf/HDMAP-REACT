import React, { useEffect, useRef, useState } from 'react';
import MapTopNav from '../components/MapTopNav';
import MiniMap from "../components/MiniMap";

const PotreeViewer = () => {
  const viewerRef = useRef(null);
  // 커스텀 폴리곤 상태
  const [isCustomPolygonMode, setIsCustomPolygonMode] = useState(false);
  const [customPolygonPoints, setCustomPolygonPoints] = useState([]); // 현재 작업 중인 폴리곤 포인트
  const [customPolygons, setCustomPolygons] = useState([]); // 완료된 폴리곤 배열
  const customPolygonLineRef = useRef(null);
  const customPolygonMeshRefs = useRef([]); // 여러 폴리곤의 mesh 참조
  const customPolygonPointSpheresRef = useRef([]); // 현재 작업 중인 포인트 구 mesh들
  // 폴리곤(닫힌 선) 그리기 기능
  // 삭제: const [lastPolygonMeasurement, setLastPolygonMeasurement] = useState(null);
  // 폴리곤 시각화 z 오프셋
  const POLYGON_Z_OFFSET = 0.2;
  const [backgroundType, setBackgroundType] = useState('gradient');
  const customPolygonLineRefs = useRef([]); // 완료된 폴리곤의 외곽선 라인 참조
  // 시작/도착 포인트 참조 저장
  const startPointRef = useRef(null);
  const endPointRef = useRef(null);
  // 시작/도착 포인트 좌표 상태
  const [startPoint, setStartPoint] = useState(null); // {x, y, z}
  const [endPoint, setEndPoint] = useState(null); // {x, y, z}
  // 장애물 선택 상태
  const [selectedObstacleIdx, setSelectedObstacleIdx] = useState(null); // null: 전체 숨김, 0~N: 해당 장애물
  // 선택된 포인트 상태
  const [selectedPoint, setSelectedPoint] = useState({ polygonIdx: null, pointIdx: null });
  // 최적 경로 생성 완료 상태
  const [routeReady, setRouteReady] = useState(false);
  // 삭제: const [cameraMode, setCameraMode] = useState('perspective');
  const [cameraState, setCameraState] = useState(null);
  const [selectedMachine, setSelectedMachine] = useState("");

  useEffect(() => {
    if (window.Potree) {
      const viewer = new window.Potree.Viewer(document.getElementById("potree_container"));
      window.viewer = viewer; // 외부 접근용
      viewerRef.current = viewer;
      viewer.setEDLEnabled(true);
      viewer.setFOV(60);
      viewer.setPointBudget(2000000);
      viewer.setBackground("gradient");
      viewer.loadSettingsFromURL && viewer.loadSettingsFromURL();
      viewer.loadGUI(() => {
        viewer.setLanguage("en");
        if (window.$) {
          window.$(".potree_menu_toggle").show();
          window.$("#sidebar_root").show();
        }
        if (viewer.toggleSidebar) {
          viewer.toggleSidebar(true);
        }
      });
      // 방향 위젯(네비게이션 큐브) 활성화
      if (viewer.setNavigationCube) {
        viewer.setNavigationCube(true);
      }
      // === 미니맵(Overview Map) 활성화 ===
      if (viewer.setOverviewMap) {
        viewer.setOverviewMap(true);
      } else if (viewer.toggleOverviewMap) {
        viewer.toggleOverviewMap(true);
      }
      window.Potree.loadPointCloud("/potree/pointclouds/example/cloud.js", "example", e => {
        let pointcloud = e.pointcloud;
        let material = pointcloud.material;
        viewer.scene.addPointCloud(pointcloud);
        material.size = 1;
        material.pointSizeType = window.Potree.PointSizeType.ADAPTIVE;
        material.shape = window.Potree.PointShape.SQUARE;
        viewer.fitToScreen();
      });
      // 초기 카메라 모드 동기화
      // 삭제: setCameraMode(viewer.scene.cameraMode === window.Potree.CameraMode.ORTHOGRAPHIC ? 'orthographic' : 'perspective');
    } else {
      console.warn("Potree 라이브러리가 window에 없습니다. public/index.html의 스크립트 로딩 순서를 확인하세요.");
    }
  }, []);

  useEffect(() => {
    if (!viewerRef.current) return;
    const viewer = viewerRef.current;
    const handleUpdate = () => {
      const cam = viewer.scene.getActiveCamera();
      const pos = cam.position;
      const dir = cam.getWorldDirection(new window.THREE.Vector3());
      setCameraState({
        x: pos.x, y: pos.y, z: pos.z,
        dx: dir.x, dy: dir.y, dz: dir.z
      });
    };
    viewer.addEventListener('update', handleUpdate);
    return () => viewer.removeEventListener('update', handleUpdate);
  }, []);

  // 커스텀 폴리곤 모드에서 Potree 클릭 시 포인트 추가
  useEffect(() => {
    if (!isCustomPolygonMode) return;
    const handleClick = (event) => {
      const container = document.getElementById('potree_container');
      if (!container.contains(event.target)) return;
      const pt = getClickedPointOnPotree(event);
      if (pt) {
        setCustomPolygonPoints(prev => [...prev, { x: pt.x, y: pt.y, z: pt.z }]);
      }
    };
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [isCustomPolygonMode]);

  // 커스텀 폴리곤 3D 시각화 (현재 작업 중인 것 + 완료된 것 모두)
  useEffect(() => {
    if (!viewerRef.current) return;
    const viewer = viewerRef.current;
    // 현재 작업 중인 폴리곤 라인 제거
    if (customPolygonLineRef.current) {
      viewer.scene.scene.remove(customPolygonLineRef.current);
      customPolygonLineRef.current = null;
    }
    // 기존 포인트 구 제거
    if (customPolygonPointSpheresRef.current.length > 0) {
      customPolygonPointSpheresRef.current.forEach(sphere => viewer.scene.scene.remove(sphere));
      customPolygonPointSpheresRef.current = [];
    }
    // 현재 작업 중인 폴리곤 라인 추가
    if (customPolygonPoints.length >= 2) {
      const points = customPolygonPoints.map(p => new window.THREE.Vector3(p.x, p.y, p.z + POLYGON_Z_OFFSET));
      const geometry = new window.THREE.BufferGeometry().setFromPoints([...points, points[0]]);
      const material = new window.THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 30 });
      const line = new window.THREE.Line(geometry, material);
      viewer.scene.scene.add(line);
      customPolygonLineRef.current = line;
    }
    // 현재 작업 중인 포인트 구 추가
    if (customPolygonPoints.length > 0) {
      const sphereGeometry = new window.THREE.SphereGeometry(0.3, 16, 16);
      const sphereMaterial = new window.THREE.MeshBasicMaterial({ color: 0xff0000 });
      customPolygonPoints.forEach((p, idx) => {
        const sphere = new window.THREE.Mesh(sphereGeometry, sphereMaterial);
        sphere.position.set(p.x, p.y, p.z + POLYGON_Z_OFFSET);
        viewer.scene.scene.add(sphere);
        customPolygonPointSpheresRef.current.push(sphere);
        // 우클릭(컨텍스트 메뉴)로 포인트 삭제
        sphere.userData = { idx };
        sphere.cursor = 'pointer';
      });
      // 3D 구체 우클릭(컨텍스트 메뉴) 감지 (Raycaster)
      const handlePointerDown = (event) => {
        if (!isCustomPolygonMode) return;
        if (event.button !== 2) return; // 오른쪽 클릭만
        const container = document.getElementById('potree_container');
        if (!container.contains(event.target)) return;
        // Raycaster로 구체 클릭 감지
        const rect = container.getBoundingClientRect();
        const mouse = {
          x: ((event.clientX - rect.left) / rect.width) * 2 - 1,
          y: -((event.clientY - rect.top) / rect.height) * 2 + 1
        };
        const camera = viewer.scene.getActiveCamera();
        const raycaster = new window.THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(customPolygonPointSpheresRef.current);
        if (intersects.length > 0) {
          const sphere = intersects[0].object;
          if (sphere.userData && typeof sphere.userData.idx === 'number') {
            if (window.confirm('이 포인트를 삭제하시겠습니까?')) {
              setCustomPolygonPoints(prev => prev.filter((_, i) => i !== sphere.userData.idx));
            }
          }
        }
      };
      window.addEventListener('pointerdown', handlePointerDown);
      return () => {
        window.removeEventListener('pointerdown', handlePointerDown);
      };
    }
  }, [customPolygonPoints, isCustomPolygonMode]);

  // 완료된 폴리곤 3D 시각화 (Mesh → Line) + 포인트 클릭-이동 기능 + 선택된 장애물 포인트만 표시
  useEffect(() => {
    if (!viewerRef.current) return;
    const viewer = viewerRef.current;
    // 기존 mesh 모두 제거
    if (customPolygonMeshRefs.current.length > 0) {
      customPolygonMeshRefs.current.forEach(mesh => viewer.scene.scene.remove(mesh));
      customPolygonMeshRefs.current = [];
    }
    // 기존 라인 모두 제거
    if (customPolygonLineRefs.current.length > 0) {
      customPolygonLineRefs.current.forEach(line => viewer.scene.scene.remove(line));
      customPolygonLineRefs.current = [];
    }
    // 기존 포인트 구 제거
    if (customPolygonPointSpheresRef.current.length > 0) {
      customPolygonPointSpheresRef.current.forEach(sphere => viewer.scene.scene.remove(sphere));
      customPolygonPointSpheresRef.current = [];
    }
    // 새 라인/면 추가 (포인트 구체는 선택된 장애물만 추가)
    customPolygons.forEach((polygon, polyIdx) => {
      if (polygon.points.length >= 3) {
        const points = polygon.points.map(p => new window.THREE.Vector3(p.x, p.y, p.z + POLYGON_Z_OFFSET));
        // 외곽선 라인 추가
        const geometry = new window.THREE.BufferGeometry().setFromPoints([...points, points[0]]);
        const material = new window.THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 5 });
        const line = new window.THREE.Line(geometry, material);
        viewer.scene.scene.add(line);
        customPolygonLineRefs.current.push(line);
        // 주황색 반투명 면(mesh) 추가
        const shape = new window.THREE.Shape(points.map(p => new window.THREE.Vector2(p.x, p.y)));
        const meshGeometry = new window.THREE.ShapeGeometry(shape);
        meshGeometry.translate(0, 0, points[0].z); // z축 위치 맞추기
        meshGeometry.translate(0, 0, POLYGON_Z_OFFSET); // 오프셋 적용
        const meshMaterial = new window.THREE.MeshBasicMaterial({ color: 0xff0000, opacity: 0.18, transparent: true, side: window.THREE.DoubleSide, depthWrite: false });
        const mesh = new window.THREE.Mesh(meshGeometry, meshMaterial);
        viewer.scene.scene.add(mesh);
        customPolygonMeshRefs.current.push(mesh);
        // 선택된 장애물만 포인트 구체 추가
        if (selectedObstacleIdx === polyIdx) {
          const sphereGeometry = new window.THREE.SphereGeometry(0.3, 16, 16);
          polygon.points.forEach((pt, ptIdx) => {
            // 선택된 포인트는 노란색, 나머지는 빨간색
            const isSelected = selectedPoint.polygonIdx === polyIdx && selectedPoint.pointIdx === ptIdx;
            const sphereMaterial = new window.THREE.MeshBasicMaterial({ color: isSelected ? 0xffeb3b : 0xff0000 });
            const sphere = new window.THREE.Mesh(sphereGeometry, sphereMaterial);
            sphere.position.set(pt.x, pt.y, pt.z + POLYGON_Z_OFFSET);
            viewer.scene.scene.add(sphere);
            customPolygonPointSpheresRef.current.push(sphere);
            // userData에 polyIdx, ptIdx 저장
            sphere.userData = { polyIdx, ptIdx };
            sphere.cursor = 'pointer';
          });
        }
      }
    });
    // === 좌클릭: 포인트 선택(노란색 표시) ===
    const handlePointerDown = (event) => {
      if (selectedObstacleIdx === null) return;
      if (event.button !== 0) return; // 좌클릭만
      const container = document.getElementById('potree_container');
      if (!container.contains(event.target)) return;
      const rect = container.getBoundingClientRect();
      const mouse = {
        x: ((event.clientX - rect.left) / rect.width) * 2 - 1,
        y: -((event.clientY - rect.top) / rect.height) * 2 + 1
      };
      const camera = viewer.scene.getActiveCamera();
      const raycaster = new window.THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(customPolygonPointSpheresRef.current);
      if (intersects.length > 0) {
        const sphere = intersects[0].object;
        if (sphere.userData && typeof sphere.userData.polyIdx === 'number' && typeof sphere.userData.ptIdx === 'number') {
          setSelectedPoint({ polygonIdx: sphere.userData.polyIdx, pointIdx: sphere.userData.ptIdx });
        }
      }
    };
    window.addEventListener('pointerdown', handlePointerDown);
    // === 지도 내 클릭: 선택된 포인트 이동 ===
    const handleMapClick = (event) => {
      if (selectedPoint.polygonIdx === null || selectedPoint.pointIdx === null) return;
      if (event.button !== 0) return; // 좌클릭만
      const container = document.getElementById('potree_container');
      if (!container.contains(event.target)) return;
      // 포인트 구체 클릭은 무시(선택만 하고 이동 X)
      const rect = container.getBoundingClientRect();
      const mouse = {
        x: ((event.clientX - rect.left) / rect.width) * 2 - 1,
        y: -((event.clientY - rect.top) / rect.height) * 2 + 1
      };
      const camera = viewer.scene.getActiveCamera();
      const raycaster = new window.THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(customPolygonPointSpheresRef.current);
      if (intersects.length > 0) {
        // 포인트 구체 클릭이면 이동 X
        return;
      }
      // 지도 내 빈 공간 클릭 시 이동
      const pt = getClickedPointOnPotree(event);
      if (pt) {
        setCustomPolygons(prev => prev.map((poly, pIdx) => {
          if (pIdx !== selectedPoint.polygonIdx) return poly;
          return {
            ...poly,
            points: poly.points.map((point, idx) =>
              idx === selectedPoint.pointIdx ? { x: pt.x, y: pt.y, z: pt.z } : point
            )
          };
        }));
        setSelectedPoint({ polygonIdx: null, pointIdx: null });
      }
    };
    window.addEventListener('click', handleMapClick);
    // === 우클릭: 포인트 삭제 ===
    const handleContextMenu = (event) => {
      if (selectedObstacleIdx === null) return;
      const container = document.getElementById('potree_container');
      if (!container.contains(event.target)) return;
      event.preventDefault();
      const rect = container.getBoundingClientRect();
      const mouse = {
        x: ((event.clientX - rect.left) / rect.width) * 2 - 1,
        y: -((event.clientY - rect.top) / rect.height) * 2 + 1
      };
      const camera = viewer.scene.getActiveCamera();
      const raycaster = new window.THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(customPolygonPointSpheresRef.current);
      if (intersects.length > 0) {
        const sphere = intersects[0].object;
        if (sphere.userData && typeof sphere.userData.polyIdx === 'number' && typeof sphere.userData.ptIdx === 'number') {
          if (window.confirm('이 포인트를 삭제하시겠습니까?')) {
            setCustomPolygons(prev => prev.map((poly, pIdx) => {
              if (pIdx !== sphere.userData.polyIdx) return poly;
              return {
                ...poly,
                points: poly.points.filter((_, idx) => idx !== sphere.userData.ptIdx)
              };
            }));
            setSelectedPoint({ polygonIdx: null, pointIdx: null });
          }
        }
      }
    };
    window.addEventListener('contextmenu', handleContextMenu);
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('click', handleMapClick);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [customPolygons, selectedObstacleIdx, selectedPoint]);

  // 폴리곤 완료 핸들러
  const handleFinishCustomPolygon = () => {
    if (customPolygonPoints.length >= 3) {
      setCustomPolygons(prev => [...prev, { points: customPolygonPoints }]);
    }
    setCustomPolygonPoints([]);
    setIsCustomPolygonMode(false);
    // 포인트 구 제거 (완료된 폴리곤은 구체가 보이지 않도록)
    if (viewerRef.current && customPolygonPointSpheresRef.current.length > 0) {
      customPolygonPointSpheresRef.current.forEach(sphere => viewerRef.current.scene.scene.remove(sphere));
      customPolygonPointSpheresRef.current = [];
    }
  };

  // 커스텀 폴리곤 모드 진입
  const handleStartCustomPolygon = () => {
    setIsCustomPolygonMode(true);
    setCustomPolygonPoints([]);
  };

  // === proj4 EPSG:5186 정의 등록 (최초 1회만) ===
  useEffect(() => {
    if (window.proj4 && !window.proj4.defs["EPSG:5186"]) {
      window.proj4.defs(
        "EPSG:5186",
        "+proj=tmerc +lat_0=38 +lon_0=127.5 +k=1 +x_0=200000 +y_0=500000 +ellps=GRS80 +units=m +no_defs"
      );
    }
  }, []);

  // EPSG:5186 → EPSG:4326 변환 함수 (proj4 공식 EPSG 코드 사용)
  const convertTo4326 = (x, y) => {
    if (!window.proj4) return { lon: x, lat: y };
    try {
      const [lon, lat] = window.proj4("EPSG:5186", "EPSG:4326", [x, y]);
      return { lat, lon };
    } catch (e) {
      return { lon: x, lat: y };
    }
  };

  // 배경 변경 핸들러
  const handleBackgroundChange = (e) => {
    const type = e.target.value;
    setBackgroundType(type);
    if (viewerRef.current) {
      if (type === 'skybox') {
        viewerRef.current.setBackground('skybox', 'skyboxsun25degtest');
      } else {
        viewerRef.current.setBackground(type);
      }
    }
  };

  // Potree에서 3D 좌표 얻기
  const getClickedPointOnPotree = (event) => {
    if (!viewerRef.current) return null;
    const viewer = viewerRef.current;
    const rect = viewer.renderArea.getBoundingClientRect();
    const mouse = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
    // Potree의 픽킹 함수 사용
    const camera = viewer.scene.getActiveCamera();
    const pointclouds = viewer.scene.pointclouds;
    // Potree의 유틸리티 함수로 픽킹
    const intersection = window.Potree.Utils.getMousePointCloudIntersection(
      mouse, camera, viewer, pointclouds, {}
    );
    if (intersection) {
      return intersection.location;
    }
    return null;
  };

  // 시작 포인트 직접 생성 (파란색)
  const handleStartPointMeasurement = () => {
    if (!viewerRef.current) return;
    const viewer = viewerRef.current;
    // 클릭 이벤트 핸들러
    const handleClick = (event) => {
      const container = document.getElementById('potree_container');
      if (!container.contains(event.target)) return;
      const pt = getClickedPointOnPotree(event);
      if (pt) {
        // 기존 시작 포인트 제거
        if (startPointRef.current) {
          viewer.scene.scene.remove(startPointRef.current);
          startPointRef.current = null;
        }
        // 새 시작 포인트 생성 (파란색)
        const sphereGeometry = new window.THREE.SphereGeometry(0.5, 32, 32);
        const sphereMaterial = new window.THREE.MeshBasicMaterial({ color: 0x2196f3 }); // 파란색
        const sphere = new window.THREE.Mesh(sphereGeometry, sphereMaterial);
        sphere.position.set(pt.x, pt.y, pt.z);
        viewer.scene.scene.add(sphere);
        startPointRef.current = sphere;
        // 좌표 상태 저장
        setStartPoint({ x: pt.x, y: pt.y, z: pt.z });
        // 좌표 알림
        alert(`시작 포인트 좌표: x=${pt.x.toFixed(3)}, y=${pt.y.toFixed(3)}, z=${pt.z.toFixed(3)}`);
        // 이벤트 리스너 제거
        window.removeEventListener('click', handleClick);
      }
    };
    // 클릭 이벤트 리스너 등록
    window.addEventListener('click', handleClick);
  };

  // 도착 포인트 직접 생성 (초록색)
  const handleEndPointMeasurement = () => {
    if (!viewerRef.current) return;
    const viewer = viewerRef.current;
    // 클릭 이벤트 핸들러
    const handleClick = (event) => {
      const container = document.getElementById('potree_container');
      if (!container.contains(event.target)) return;
      const pt = getClickedPointOnPotree(event);
      if (pt) {
        // 기존 도착 포인트 제거
        if (endPointRef.current) {
          viewer.scene.scene.remove(endPointRef.current);
          endPointRef.current = null;
        }
        // 새 도착 포인트 생성 (초록색)
        const sphereGeometry = new window.THREE.SphereGeometry(0.5, 32, 32);
        const sphereMaterial = new window.THREE.MeshBasicMaterial({ color: 0x4caf50 }); // 초록색
        const sphere = new window.THREE.Mesh(sphereGeometry, sphereMaterial);
        sphere.position.set(pt.x, pt.y, pt.z);
        viewer.scene.scene.add(sphere);
        endPointRef.current = sphere;
        // 좌표 상태 저장
        setEndPoint({ x: pt.x, y: pt.y, z: pt.z });
        // 좌표 알림
        alert(`도착 포인트 좌표: x=${pt.x.toFixed(3)}, y=${pt.y.toFixed(3)}, z=${pt.z.toFixed(3)}`);
        // 이벤트 리스너 제거
        window.removeEventListener('click', handleClick);
      }
    };
    // 클릭 이벤트 리스너 등록
    window.addEventListener('click', handleClick);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* 헤더(고정) 삭제 */}
      {/* <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 3000 }}>
        <MapTopNav />
      </div> */}
      {/* 바디: 헤더 아래에서 시작 */}
      <div style={{ position: 'relative', width: '100%', height: 'calc(100vh - 64px)', marginTop: '0', display: 'flex' }}>
        {/* MapTopNav를 바디 안에 넣기 */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', background: '#fff', borderBottom: '1px solid #eee', zIndex: 3000 }}>
          <MapTopNav />
        </div>
        {/* 기존 컨텐츠 전체를 바디 안에 넣음 */}
        <>
          {/* 왼쪽 사이드바: 폴리곤 좌표 정보 */}
          <div
            style={{
              width: 340,
              height: '100%',
              background: '#fff',
              borderRight: '1px solid #e0e0e0',
              zIndex: 2100,
              padding: '28px 18px 18px 18px',
              boxSizing: 'border-box',
              boxShadow: '2px 0 8px rgba(0,0,0,0.04)',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative', // 하단 버튼 고정용
            }}
          >
            {/* 정보 영역: 스크롤 */}
            <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 18, color: '#222', marginBottom: 18 }}>(프로젝트명)</div>
              {/* 출발점 카드 */}
              <div style={{
                background: '#f9f9f9',
                border: '1.5px solid #b3e5fc',
                borderRadius: 10,
                padding: 14,
                marginBottom: 12
              }}>
                <div style={{ fontWeight: 700, color: '#1976d2', fontSize: 16, marginBottom: 4 }}>출발점 (파란색)</div>
                {startPoint ? (
                  <div style={{ fontSize: 14, color: '#222' }}>
                    X: {startPoint.x.toFixed(3)}<br/>
                    Y: {startPoint.y.toFixed(3)}<br/>
                    Z: {startPoint.z.toFixed(3)}<br/>
                    {(() => { const wgs = convertTo4326(startPoint.x, startPoint.y); return (
                      <span style={{ fontSize: 13, color: '#1976d2' }}>
                        (위도: {wgs.lat.toFixed(6)}, 경도: {wgs.lon.toFixed(6)})
                      </span>
                    ); })()}
                  </div>
                ) : (
                  <div style={{ fontSize: 14, color: '#aaa' }}>-</div>
                )}
              </div>
              {/* 도착점 카드 */}
              <div style={{
                background: '#f9f9f9',
                border: '1.5px solid #b2dfdb',
                borderRadius: 10,
                padding: 14,
                marginBottom: 18
              }}>
                <div style={{ fontWeight: 700, color: '#388e3c', fontSize: 16, marginBottom: 4 }}>도착점 (초록색)</div>
                {endPoint ? (
                  <div style={{ fontSize: 14, color: '#222' }}>
                    X: {endPoint.x.toFixed(3)}<br/>
                    Y: {endPoint.y.toFixed(3)}<br/>
                    Z: {endPoint.z.toFixed(3)}<br/>
                    {(() => { const wgs = convertTo4326(endPoint.x, endPoint.y); return (
                      <span style={{ fontSize: 13, color: '#388e3c' }}>
                        (위도: {wgs.lat.toFixed(6)}, 경도: {wgs.lon.toFixed(6)})
                      </span>
                    ); })()}
                  </div>
                ) : (
                  <div style={{ fontSize: 14, color: '#aaa' }}>-</div>
                )}
              </div>
              {/* 농기계 선택 드롭다운  */}
              <div>
                <select
                  value={selectedMachine}
                  onChange={e => setSelectedMachine(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1.5px solid #388e3c',
                    fontSize: 16,
                    fontWeight: 500,
                    color: '#388e3c',
                    background: '#fff',
                    cursor: 'pointer',
                    outline: 'none',
                    minWidth: 148,
                    width: '100%'
                  }}
                >
                  <option value="">농기계 선택</option>
                  <option value="경운기 A">경운기 A</option>
                  <option value="경운기 B">경운기 B</option>
                  <option value="트랙터 A">트랙터 A</option>
                  <option value="트랙터 B">트랙터 B</option>
                  <option value="콤바인 A">콤바인 A</option>
                  <option value="콤바인 B">콤바인 B</option>
                </select>
              </div>
            {customPolygons.length === 0 ? (
                <div style={{ color: '#aaa', fontSize: 15, marginBottom: 24 }}>장애물이 없습니다.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {customPolygons.map((poly, idx) => (
                  <div key={idx} style={{ background: '#f9f9f9', border: '1.5px solid #ffb6c1', borderRadius: 10, padding: 14, marginBottom: 4 }}>
                    <div style={{ fontWeight: 700, color: '#333', fontSize: 16, marginBottom: 4 }}>{idx + 1}번 장애물</div>
                    <div style={{ fontSize: 14, color: '#333', marginBottom: 6, fontWeight: 500 }}>좌표:</div>
                    <div style={{ fontSize: 14, color: '#333', display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {poly.points.map((pt, i) => {
                        const wgs = convertTo4326(pt.x, pt.y);
                        return (
                          <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', flexDirection: 'column', marginBottom: 4 }}>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                              <span style={{ color: '#1976d2', fontWeight: 500 }}>#{i + 1}</span>
                              <span>원본 X: {pt.x.toFixed(3)}</span>
                              <span>원본 Y: {pt.y.toFixed(3)}</span>
                              <span>고도: {pt.z.toFixed(3)}</span>
                            </div>
                            <div style={{ fontSize: 13, color: '#388e3c', marginLeft: 24 }}>
                              (위도: {wgs.lat.toFixed(6)}, 경도: {wgs.lon.toFixed(6)})
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
            </div>
            {/* 하단 고정 버튼 영역 */}
            <div style={{ position: 'absolute', left: 18, right: 18, bottom: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {routeReady && (
              <button
                onClick={() => {
                    const obstacles = customPolygons.map((poly, idx) => ({
                      name: `obstacles ${idx + 1}`,
                      points: poly.points
                    }));
                    const data = {
                      startPoint: startPoint ? { ...startPoint } : null,
                      endPoint: endPoint ? { ...endPoint } : null,
                      obstacles: obstacles
                    };
                    const json = JSON.stringify(data, null, 2);
                  const blob = new window.Blob([json], { type: 'application/json' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                    a.download = 'map-info.json';
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  window.URL.revokeObjectURL(url);
                }}
                style={{
                  background: '#fff',
                  border: '2px solid #1976d2',
                  borderRadius: 8,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  padding: '10px 0',
                  cursor: 'pointer',
                  fontWeight: 600,
                  color: '#1976d2',
                  fontSize: 16,
                    width: '100%'
                  }}
                >
                 최적 경로 다운로드
                </button>
              )}
              <button
                onClick={() => {
                  if (!(startPoint && endPoint)) {
                    alert('시작점과 도착점을 모두 지정해야 합니다.');
                    return;
                  }
                  // TODO: 최적 경로 생성 기능 구현 예정
                  setRouteReady(true);
                  alert('최적 경로 생성 기능은 추후 구현됩니다.');
                }}
                style={{
                  background: '#fff',
                  border: '2px solid #ff9800',
                  borderRadius: 8,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  padding: '10px 0',
                  cursor: 'pointer',
                  fontWeight: 600,
                  color: '#ff9800',
                  fontSize: 16,
                  width: '100%'
                }}
              >
                최적 경로 생성
              </button>
            </div>
          </div>
          {/* Potree 컨테이너: 사이드바에 가리지 않도록 flex로 배치 */}
          <div
            id="potree_container"
            style={{
              flex: 1,
              height: '100%',
              position: 'relative',
              left: 0,
              top: 0,
              paddingBottom: '48px' // 오른쪽 하단 버튼/미니맵 영역 확보
            }}
          />
          {/* 오른쪽 상단: 드롭다운 2개만 */}
          <div style={{ position: "absolute", top: 76, right: 20, zIndex: 2000, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {/* 배경 변경 드롭다운 */}
            <select
              value={backgroundType}
              onChange={handleBackgroundChange}
              style={{
                marginTop: 0,
                padding: '8px 12px',
                borderRadius: 8,
                border: '1.5px solid #1976d2',
                fontSize: 16,
                fontWeight: 500,
                color: '#1976d2',
                background: '#fff',
                cursor: 'pointer',
                outline: 'none',
                minWidth: 148
              }}
            >
              <option value="gradient">그라데이션</option>
              <option value="skybox">스카이박스</option>
              <option value="white">흰색</option>
              <option value="black">검정색</option>
            </select>
            {/* 장애물 선택 드롭다운 */}
            <select
              value={selectedObstacleIdx === null ? '' : selectedObstacleIdx}
              onChange={e => {
                const v = e.target.value;
                setSelectedObstacleIdx(v === '' ? null : Number(v));
              }}
              style={{
                marginBottom: 0,
                padding: '8px 12px',
                borderRadius: 8,
                border: '1.5px solid #ff9800',
                fontSize: 16,
                fontWeight: 500,
                color: '#ff9800',
                background: '#fff',
                cursor: 'pointer',
                outline: 'none',
                minWidth: 148
              }}
            >
              <option value="">장애물 포인트 표시 안함</option>
              {customPolygons.map((poly, idx) => (
                <option key={idx} value={idx}>{`장애물 ${idx + 1} 포인트 표시`}</option>
              ))}
            </select>
          </div>
          {/* 오른쪽 하단: 버튼 3개+미니맵 */}
          <div style={{ position: "absolute", bottom: 32, right: 20, zIndex: 2000, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
            {/* 미니맵에 marginBottom 추가 */}
            <div style={{ marginBottom: 24 }}>
              <MiniMap
                startPoint={startPoint}
                endPoint={endPoint}
                polygons={customPolygons}
                cameraState={cameraState}
              />
            </div>
            
            <button
              onClick={handleStartPointMeasurement}
              style={{
                background: "#fff",
                border: "2px solid #2196f3",
                borderRadius: 8,
                boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                padding: "8px 16px",
                cursor: "pointer",
                fontWeight: 600,
                color: "#2196f3",
                fontSize: 16,
                minWidth: 148
              }}
            >
              시작 포인트 찍기
            </button>
            <button
              onClick={handleEndPointMeasurement}
              style={{
                background: "#fff",
                border: "2px solid #4caf50",
                borderRadius: 8,
                boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                padding: "8px 16px",
                cursor: "pointer",
                fontWeight: 600,
                color: "#4caf50",
                fontSize: 16,
                minWidth: 148
              }}
            >
              도착 포인트 찍기
            </button>
            {/* 장애물 영역 설정/지정 완료 토글 버튼 */}
            <button
              onClick={isCustomPolygonMode ? handleFinishCustomPolygon : handleStartCustomPolygon}
              style={{
                background: isCustomPolygonMode ? '#ff9800' : '#fff',
                border: '2px solid #ff9800',
                borderRadius: 8,
                boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                padding: '8px 16px',
                cursor: 'pointer',
                fontWeight: 600,
                color: isCustomPolygonMode ? '#fff' : '#ff9800',
                fontSize: 16,
                minWidth: 148
              }}
            >
              {isCustomPolygonMode ? '영역 지정 완료' : '장애물 영역 생성'}
            </button>
          </div>
        </>
      </div>
    </div>
  );
};

export default PotreeViewer; 