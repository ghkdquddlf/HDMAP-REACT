import React, { useEffect, useRef } from 'react';

function GoogleMap() {
  const mapRef = useRef(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`;
    script.async = true;
    script.onload = () => {
      if (window.google) {
        new window.google.maps.Map(mapRef.current, {
          center: { lat: 37.5665, lng: 126.9780 }, // 서울 중심
          zoom: 14,
        });
      }
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <div
      ref={mapRef}
      style={{ width: '100%', height: '92.8vh', borderRadius: '12px' }}
    />
  );
}

export default GoogleMap; 