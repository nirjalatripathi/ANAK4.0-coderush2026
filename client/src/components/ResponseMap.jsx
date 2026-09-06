import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

function colorForZone(zone) {
  const percent = zone.capacity ? (zone.currentOccupancy / zone.capacity) * 100 : 0;
  if (percent >= 100 || zone.status === 'Full') return '#b91c1c';
  if (percent >= 80) return '#d97706';
  return '#059669';
}

export default function ResponseMap({ disasters = [], safeZones = [], camps = [], height = 440 }) {
  const ref = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);

  useEffect(() => {
    if (!ref.current || mapRef.current) return undefined;
    const map = L.map(ref.current, { scrollWheelZoom: false }).setView([27.668, 85.428], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);
    mapRef.current = map;
    layerRef.current = L.layerGroup().addTo(map);
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const group = layerRef.current;
    if (!map || !group) return;
    group.clearLayers();
    const points = [];

    disasters.forEach((disaster) => {
      if (disaster.latitude == null || disaster.longitude == null) return;
      const marker = L.circleMarker([disaster.latitude, disaster.longitude], {
        radius: 12, color: '#7f1d1d', fillColor: '#dc2626', fillOpacity: 0.85, weight: 2,
      }).bindPopup(`<strong>Disaster area</strong><br/>${disaster.name}<br/>${disaster.type}`);
      marker.addTo(group);
      points.push([disaster.latitude, disaster.longitude]);
    });

    safeZones.forEach((zone) => {
      if (zone.latitude == null || zone.longitude == null) return;
      const color = colorForZone(zone);
      const available = Math.max(0, (zone.capacity || 0) - (zone.currentOccupancy || 0));
      const marker = L.circleMarker([zone.latitude, zone.longitude], {
        radius: 10, color, fillColor: color, fillOpacity: 0.85, weight: 2,
      }).bindPopup(
        `<strong>${zone.name}</strong><br/>Ward ${zone.ward || '—'}<br/>Capacity ${zone.capacity || 0} · Current ${zone.currentOccupancy || 0} · Available ${available}<br/>Status: ${zone.status}`
      );
      marker.addTo(group);
      points.push([zone.latitude, zone.longitude]);
    });

    camps.forEach((camp) => {
      if (camp.latitude == null || camp.longitude == null) return;
      const marker = L.circleMarker([camp.latitude, camp.longitude], {
        radius: 10, color: '#1d4ed8', fillColor: '#2563eb', fillOpacity: 0.85, weight: 2,
      }).bindPopup(`<strong>${camp.name}</strong><br/>${camp.currentPopulation || 0} / ${camp.capacity || 0}`);
      marker.addTo(group);
      points.push([camp.latitude, camp.longitude]);
    });

    if (points.length) {
      map.fitBounds(points, { padding: [28, 28], maxZoom: 14 });
    }
  }, [disasters, safeZones, camps]);

  return <div ref={ref} className="response-map" style={{ height }} />;
}
