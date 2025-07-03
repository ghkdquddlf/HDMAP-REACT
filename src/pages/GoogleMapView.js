import React, { useEffect, useState } from 'react';
import { GoogleMap, GroundOverlay } from '@react-google-maps/api';
import MapTopNav from '../components/MapTopNav';

const containerStyle = {
  width: '100vw',
  height: '100vh'
};

const center = {
  lat: 37.559318448396276, // 서울역
  lng: 126.99443441216611 // 서울역
};

function GoogleMapView() {
  const [overlayBounds, setOverlayBounds] = useState(null);

  useEffect(() => {
    fetch('/overlay_bounds.json')
      .then(res => res.json())
      .then(data => {
        setOverlayBounds({
          north: data.bounds.north,
          south: data.bounds.south,
          east: data.bounds.east,
          west: data.bounds.west
        });
      });
  }, []);

  const overlayImage = '/output4.png';

  return (
    <div className="App">
      <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={18}
        >
          {overlayBounds && (
            <GroundOverlay
              url={overlayImage}
              bounds={overlayBounds}
              opacity={0.7}
            />
          )}
        </GoogleMap>
        <MapTopNav />
      </div>
    </div>
  );
}

export default GoogleMapView; 