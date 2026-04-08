import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Circle, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const RiskMap = ({ userLat, userLng }) => {
  const [zones, setZones] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch risk zones
    fetch(`http://localhost:8000/map/risk-zones?lat=${userLat}&lng=${userLng}&radius_km=10`)
      .then(res => res.json())
      .then(data => {
        setZones(data.features || []);
        setLoading(false);
      });

    // Fetch nearby farmers
    fetch(`http://localhost:8000/map/nearby-farmers?lat=${userLat}&lng=${userLng}&radius_km=5`)
      .then(res => res.json())
      .then(data => {
        setFarmers(data.farmers || []);
      });
  }, [userLat, userLng]);

  if (loading) return <div>Loading map...</div>;

  return (
    <div style={{ height: '400px', width: '100%' }}>
      <MapContainer 
        center={[userLat, userLng]} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap'
        />
        
        {/* User location */}
        <Marker position={[userLat, userLng]}>
          <Popup>You are here</Popup>
        </Marker>

        {/* Risk zones */}
        {zones.map((zone, idx) => (
          <Circle
            key={idx}
            center={[
              zone.geometry.coordinates[1], 
              zone.geometry.coordinates[0]
            ]}
            radius={zone.properties.radius_km * 1000} // Convert to meters
            pathOptions={{
              color: zone.properties.color,
              fillColor: zone.properties.fillColor,
              fillOpacity: zone.properties.fillOpacity || 0.3
            }}
          >
            <Popup>{zone.properties.message}</Popup>
          </Circle>
        ))}

        {/* Farmers */}
        {farmers.map((farmer, idx) => (
          <Circle
            key={`farmer-${idx}`}
            center={[farmer.lat, farmer.lng]}
            radius={100}
            pathOptions={{
              color: '#22c55e',
              fillColor: '#22c55e'
            }}
          >
            <Popup>Farmer #{farmer.user_id}</Popup>
          </Circle>
        ))}
      </MapContainer>
      
      <div style={{ marginTop: '10px', fontSize: '12px' }}>
        <span style={{ color: '#ef4444' }}>● RED = Danger</span> | 
        <span style={{ color: '#eab308' }}>● YELLOW = Caution</span> | 
        <span style={{ color: '#22c55e' }}>● GREEN = Safe/Farmers</span>
      </div>
    </div>
  );
};

export default RiskMap;