import React, { useEffect, useRef } from "react";

const MiniMap = ({ startPoint, endPoint, polygons, cameraState }) => {
  const mapRef = useRef(null);
  const leafletRef = useRef(null);

  // === proj4 EPSG:5186 정의 등록 (최초 1회만) ===
  if (window.proj4 && !window.proj4.defs["EPSG:5186"]) {
    window.proj4.defs(
      "EPSG:5186",
      "+proj=tmerc +lat_0=38 +lon_0=127.5 +k=1 +x_0=200000 +y_0=500000 +ellps=GRS80 +units=m +no_defs"
    );
  }

  // EPSG:5186 → EPSG:4326 변환 (leaflet 규칙: [lat, lon] 반환)
  const toLatLng = (x, y) => {
    if (!window.proj4) return [x, y];
    try {
      const [lon, lat] = window.proj4("EPSG:5186", "EPSG:4326", [x, y]);
      return [lat, lon];
    } catch (e) {
      return [x, y];
    }
  };

  useEffect(() => {
    if (!window.L) return;
    if (!mapRef.current) return;

    // 최초 1회만 leaflet map 생성
    if (!leafletRef.current) {
      leafletRef.current = window.L.map(mapRef.current, {
        zoom: 16,
        zoomControl: true,
        attributionControl: false,
        dragging: true,
        scrollWheelZoom: true,
        doubleClickZoom: false,
        boxZoom: false,
        keyboard: false,
      });
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        minZoom: 5,
        maxZoom: 19,
      }).addTo(leafletRef.current);
    }
    const map = leafletRef.current;

    // 기존 마커/폴리곤/카메라 레이어 제거
    map.eachLayer(layer => {
      if (
        layer instanceof window.L.Marker ||
        layer instanceof window.L.Polygon ||
        layer instanceof window.L.Polyline
      ) {
        map.removeLayer(layer);
      }
    });

    // 카메라 위치/방향 표시 및 미니맵 중심 이동
    if (cameraState) {
      const [lat, lon] = toLatLng(cameraState.x, cameraState.y);
      map.setView([lat, lon]);
      // 방향선: 카메라 위치에서 방향벡터로 30만큼 이동한 점까지
      const [lat2, lon2] = toLatLng(
        cameraState.x + cameraState.dx * 30,
        cameraState.y + cameraState.dy * 30
      );
      window.L.polyline([[lat, lon], [lat2, lon2]], { color: "#2196f3", weight: 3 }).addTo(map);
      // 삼각형 마커(방향 회전)
      const angle = Math.atan2(cameraState.dx, cameraState.dy) * 180 / Math.PI;
      window.L.marker([lat, lon], {
        icon: window.L.divIcon({
          className: 'minimap-camera',
          html: `<svg width="22" height="22" style="transform: rotate(${angle}deg);"><polygon points="11,3 19,19 3,19" fill="#2196f3" stroke="#1976d2" stroke-width="2"/></svg>`
        }),
        interactive: false
      }).addTo(map);
    }

    // 시작점 마커
    if (startPoint) {
      const [lat, lon] = toLatLng(startPoint.x, startPoint.y);
      window.L.marker([lat, lon], { icon: window.L.divIcon({ className: 'minimap-start', html: 'S', iconSize: [18, 18] }) }).addTo(map);
    }
    // 도착점 마커
    if (endPoint) {
      const [lat, lon] = toLatLng(endPoint.x, endPoint.y);
      window.L.marker([lat, lon], { icon: window.L.divIcon({ className: 'minimap-end', html: 'E', iconSize: [18, 18] }) }).addTo(map);
    }
    // 장애물 폴리곤
    if (polygons && polygons.length > 0) {
      polygons.forEach(poly => {
        const latlngs = poly.points.map(pt => toLatLng(pt.x, pt.y));
        window.L.polygon(latlngs, { color: "#ff0000", weight: 2, fillOpacity: 0.2 }).addTo(map);
      });
    }
  }, [startPoint, endPoint, polygons, cameraState]);

  return (
    <div
      id="potree-minimap"
      ref={mapRef}
      style={{
        width: 220,
        height: 180,
        zIndex: 2100,
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
        background: "#fff"
      }}
    />
  );
};

export default MiniMap; 