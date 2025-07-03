import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function MapTopNav() {
  const location = useLocation();
  return (
    <nav style={{ position: 'absolute', zIndex: 20, right: 20, top: 20, background: 'white', padding: 4, borderRadius: 4, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
      <Link
        to="/google-map"
        style={{
          padding: '4px 10px',
          borderRadius: 4,
          border: '1px solid #ccc',
          background: location.pathname === '/google-map' ? '#eee' : '#fff',
          color: '#333',
          textDecoration: 'none',
          fontWeight: 500
        }}
      >
        구글 지도
      </Link>
      <span>|</span>
      <Link
        to="/potree-viewer"
        style={{
          padding: '4px 10px',
          borderRadius: 4,
          border: '1px solid #ccc',
          background: location.pathname === '/potree-viewer' ? '#eee' : '#fff',
          color: '#333',
          textDecoration: 'none',
          fontWeight: 500
        }}
      >
        Potree viewer
      </Link>
    </nav>
  );
}

export default MapTopNav; 