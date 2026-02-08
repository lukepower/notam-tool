import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Polyline, CircleMarker, Popup, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { NotamWithStatus, Flight, Coordinate } from '../types';
import { CLOSE_THRESHOLD_NM, FAR_THRESHOLD_NM } from '../utils';
import './NotamMap.css';

// Fix default marker icon issue with webpack/react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface NotamMapProps {
  notams: NotamWithStatus[];
  currentFlight: Flight | null;
  onMarkAsRead: (notamId: string) => void;
  selectedNotamId: string | null;
  onSelectNotam: (notamId: string | null) => void;
}

// Severity colors
function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'critical': return '#d32f2f';
    case 'high': return '#f57c00';
    case 'medium': return '#fbc02d';
    case 'low': return '#388e3c';
    default: return '#757575';
  }
}

// Determine marker color based on status
function getMarkerStyle(notam: NotamWithStatus): { color: string; fillColor: string; weight: number; radius: number; dashArray?: string } {
  const base = {
    weight: 3,
    radius: 10,
    dashArray: undefined as string | undefined,
  };

  if (notam.shouldHighlight && notam.wasReadWhenFar) {
    // Was far, now close - pulsing orange ring with severity fill
    return { ...base, color: '#ff5722', fillColor: getSeverityColor(notam.severity), weight: 4, radius: 14 };
  }

  if (notam.shouldHighlight && notam.resurfaced) {
    // Resurfaced after 7 days - blue ring
    return { ...base, color: '#2196f3', fillColor: getSeverityColor(notam.severity), weight: 4, radius: 13, dashArray: '6 3' };
  }

  if (notam.shouldHighlight && !notam.isRead) {
    // Unread + close to route - highlighted
    return { ...base, color: '#ff9800', fillColor: getSeverityColor(notam.severity), weight: 3, radius: 12 };
  }

  if (notam.isRead && !notam.shouldHighlight) {
    // Read and no issues - dimmed
    return { ...base, color: '#9e9e9e', fillColor: '#bdbdbd', weight: 2, radius: 8 };
  }

  // Default: unread, not near route
  return { ...base, color: getSeverityColor(notam.severity), fillColor: getSeverityColor(notam.severity), radius: 10 };
}

function getStatusLabel(notam: NotamWithStatus): string {
  if (notam.wasReadWhenFar) return 'NOW CLOSE';
  if (notam.resurfaced) return 'RESURFACED';
  if (notam.shouldHighlight && !notam.isRead) return 'ATTENTION';
  if (notam.isRead) return 'Read';
  return 'Unread';
}

function getStatusClass(notam: NotamWithStatus): string {
  if (notam.wasReadWhenFar) return 'status-now-close';
  if (notam.resurfaced) return 'status-resurfaced';
  if (notam.shouldHighlight && !notam.isRead) return 'status-attention';
  if (notam.isRead) return 'status-read';
  return 'status-unread';
}

// Component to fit map bounds to route + NOTAMs
function FitBounds({ flight, notams }: { flight: Flight | null; notams: NotamWithStatus[] }) {
  const map = useMap();

  useEffect(() => {
    const points: [number, number][] = [];

    if (flight) {
      flight.route.forEach(wp => points.push([wp.latitude, wp.longitude]));
    }

    notams.forEach(n => points.push([n.location.latitude, n.location.longitude]));

    if (points.length > 0) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [map, flight, notams]);

  return null;
}

// Waypoint label marker
function WaypointMarker({ coord, index, total }: { coord: Coordinate; index: number; total: number }) {
  const label = index === 0 ? 'DEP' : index === total - 1 ? 'ARR' : `WP${index}`;

  const icon = L.divIcon({
    className: 'waypoint-icon',
    html: `<div class="waypoint-label ${index === 0 ? 'dep' : index === total - 1 ? 'arr' : 'wp'}">${label}</div>`,
    iconSize: [40, 20],
    iconAnchor: [20, 10],
  });

  return <Marker position={[coord.latitude, coord.longitude]} icon={icon} />;
}

const NotamMap: React.FC<NotamMapProps> = ({
  notams,
  currentFlight,
  onMarkAsRead,
  selectedNotamId,
  onSelectNotam
}) => {
  // Route as lat/lng array for polyline
  const routePositions: [number, number][] = useMemo(() => {
    if (!currentFlight) return [];
    return currentFlight.route.map(wp => [wp.latitude, wp.longitude]);
  }, [currentFlight]);

  // Center of US as default
  const defaultCenter: [number, number] = [39.0, -98.0];
  const defaultZoom = 4;

  // Close threshold circle positions (30 NM buffer along route)
  // We show a dashed corridor around the route

  return (
    <div className="notam-map-container">
      <div className="map-legend">
        <div className="legend-title">Map Legend</div>
        <div className="legend-items">
          <div className="legend-item">
            <span className="legend-dot now-close-dot"></span>
            <span>Now Close (was far)</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot resurfaced-dot"></span>
            <span>Resurfaced (7d+)</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot attention-dot"></span>
            <span>Unread Near Route</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot read-dot"></span>
            <span>Read</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot unread-dot"></span>
            <span>Unread</span>
          </div>
          <div className="legend-item">
            <span className="legend-line route-line"></span>
            <span>Flight Route</span>
          </div>
          <div className="legend-item">
            <span className="legend-line corridor-line"></span>
            <span>{CLOSE_THRESHOLD_NM} NM Corridor</span>
          </div>
        </div>
      </div>

      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        className="notam-map"
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | &copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        <FitBounds flight={currentFlight} notams={notams} />

        {/* Route corridor (30 NM buffer) */}
        {routePositions.length >= 2 && (
          <Polyline
            positions={routePositions}
            pathOptions={{
              color: '#90caf9',
              weight: 40,
              opacity: 0.2,
              lineCap: 'round',
              lineJoin: 'round',
            }}
          />
        )}

        {/* Flight route line */}
        {routePositions.length >= 2 && (
          <Polyline
            positions={routePositions}
            pathOptions={{
              color: '#1565c0',
              weight: 3,
              opacity: 0.8,
              dashArray: '10 6',
            }}
          />
        )}

        {/* Waypoint markers */}
        {currentFlight && currentFlight.route.map((wp, i) => (
          <WaypointMarker
            key={`wp-${i}`}
            coord={wp}
            index={i}
            total={currentFlight.route.length}
          />
        ))}

        {/* NOTAM markers */}
        {notams.map(notam => {
          const style = getMarkerStyle(notam);
          const isSelected = notam.id === selectedNotamId;

          return (
            <React.Fragment key={notam.id}>
              {/* NOTAM radius circle (if defined) */}
              {notam.radius && notam.radius > 0 && (
                <CircleMarker
                  center={[notam.location.latitude, notam.location.longitude]}
                  radius={Math.max(style.radius + 8, notam.radius * 2)}
                  pathOptions={{
                    color: style.color,
                    fillColor: style.fillColor,
                    fillOpacity: 0.08,
                    weight: 1,
                    opacity: 0.3,
                  }}
                />
              )}

              {/* Pulsing highlight ring for highlighted NOTAMs */}
              {notam.shouldHighlight && (
                <CircleMarker
                  center={[notam.location.latitude, notam.location.longitude]}
                  radius={style.radius + 6}
                  pathOptions={{
                    color: style.color,
                    fillColor: 'transparent',
                    fillOpacity: 0,
                    weight: 2,
                    opacity: 0.5,
                    dashArray: notam.resurfaced ? '4 4' : undefined,
                  }}
                  className="pulse-ring"
                />
              )}

              {/* Main NOTAM marker */}
              <CircleMarker
                center={[notam.location.latitude, notam.location.longitude]}
                radius={isSelected ? style.radius + 3 : style.radius}
                pathOptions={{
                  color: isSelected ? '#000' : style.color,
                  fillColor: style.fillColor,
                  fillOpacity: notam.isRead && !notam.shouldHighlight ? 0.4 : 0.8,
                  weight: isSelected ? 4 : style.weight,
                  dashArray: style.dashArray,
                }}
                eventHandlers={{
                  click: () => onSelectNotam(notam.id === selectedNotamId ? null : notam.id),
                }}
              >
                <Popup maxWidth={320} className="notam-popup">
                  <div className="popup-content">
                    <div className="popup-header">
                      <span
                        className="popup-severity"
                        style={{ backgroundColor: getSeverityColor(notam.severity) }}
                      >
                        {notam.severity.toUpperCase()}
                      </span>
                      <span className={`popup-status ${getStatusClass(notam)}`}>
                        {getStatusLabel(notam)}
                      </span>
                    </div>
                    <h3 className="popup-title">{notam.title}</h3>
                    <p className="popup-desc">{notam.description}</p>
                    <div className="popup-details">
                      {notam.currentDistance !== undefined && (
                        <div className="popup-detail">
                          <strong>Distance:</strong> {notam.currentDistance.toFixed(1)} NM
                        </div>
                      )}
                      {notam.altitudeMin !== undefined && notam.altitudeMax !== undefined && (
                        <div className="popup-detail">
                          <strong>Altitude:</strong> {notam.altitudeMin}' - {notam.altitudeMax}'
                        </div>
                      )}
                      <div className="popup-detail">
                        <strong>Published:</strong> {notam.daysSincePublished}d ago
                      </div>
                      {notam.isRead && notam.daysSinceRead !== undefined && (
                        <div className="popup-detail">
                          <strong>Read:</strong> {notam.daysSinceRead}d ago
                        </div>
                      )}
                      {notam.wasReadWhenFar && (
                        <div className="popup-warning">
                          Was read when &gt;{FAR_THRESHOLD_NM} NM away, now within {CLOSE_THRESHOLD_NM} NM of route
                        </div>
                      )}
                      {notam.resurfaced && (
                        <div className="popup-info">
                          Read more than 7 days ago - review again
                        </div>
                      )}
                    </div>
                    {!notam.isRead && (
                      <button
                        className="popup-read-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          onMarkAsRead(notam.id);
                        }}
                      >
                        Mark as Read
                      </button>
                    )}
                  </div>
                </Popup>
              </CircleMarker>
            </React.Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default NotamMap;
