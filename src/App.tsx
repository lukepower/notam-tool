import React, { useState, useEffect, useMemo } from 'react';
import './App.css';
import NotamCard from './components/NotamCard';
import FlightSelector from './components/FlightSelector';
import NotamFilters from './components/NotamFilters';
import NotamMap from './components/NotamMap';
import { Flight, NotamWithStatus } from './types';
import { NotamStorage } from './storage';
import { sampleNotams, sampleFlights } from './sampleData';
import { processNotamsWithStatus, markNotamAsRead } from './utils';

type ViewMode = 'split' | 'list' | 'map';

function App() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [currentFlightId, setCurrentFlightId] = useState<string | null>(null);
  const [processedNotams, setProcessedNotams] = useState<NotamWithStatus[]>([]);
  const [showRead, setShowRead] = useState(true);
  const [showUnread, setShowUnread] = useState(true);
  const [showHighlightedOnly, setShowHighlightedOnly] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [selectedNotamId, setSelectedNotamId] = useState<string | null>(null);

  // Initialize flights from storage or sample data
  useEffect(() => {
    const storedFlights = NotamStorage.getAllFlights();
    if (storedFlights.length === 0) {
      sampleFlights.forEach(flight => NotamStorage.saveFlight(flight));
      setFlights(sampleFlights);
    } else {
      setFlights(storedFlights);
    }

    const currentId = NotamStorage.getCurrentFlight();
    if (currentId) {
      setCurrentFlightId(currentId);
    }
  }, []);

  // Process NOTAMs whenever flight changes
  useEffect(() => {
    const currentFlight = currentFlightId
      ? flights.find(f => f.id === currentFlightId) || null
      : null;

    const processed = processNotamsWithStatus(sampleNotams, currentFlight);
    setProcessedNotams(processed);
  }, [currentFlightId, flights]);

  const handleSelectFlight = (flightId: string) => {
    setCurrentFlightId(flightId);
    NotamStorage.setCurrentFlight(flightId);
  };

  const handleNewFlight = () => {
    const flightNumber = flights.length + 1;
    const newFlight: Flight = {
      id: `flight-${Date.now()}`,
      name: `Flight ${flightNumber}`,
      route: [],
      createdAt: new Date().toISOString()
    };
    NotamStorage.saveFlight(newFlight);
    setFlights([...flights, newFlight]);
    handleSelectFlight(newFlight.id);
    alert('New flight created! In a production app, you would add waypoints here.');
  };

  const handleMarkAsRead = (notamId: string) => {
    if (!currentFlightId) {
      alert('Please select a flight first');
      return;
    }

    const notam = processedNotams.find(n => n.id === notamId);
    if (!notam) return;

    const distance = notam.currentDistance || 999;
    markNotamAsRead(notamId, currentFlightId, distance);

    // Refresh processed NOTAMs
    const currentFlight = flights.find(f => f.id === currentFlightId) || null;
    const processed = processNotamsWithStatus(sampleNotams, currentFlight);
    setProcessedNotams(processed);
  };

  const handleSelectNotam = (notamId: string | null) => {
    setSelectedNotamId(notamId);
  };

  const currentFlight = useMemo(() => {
    return currentFlightId ? flights.find(f => f.id === currentFlightId) || null : null;
  }, [currentFlightId, flights]);

  // Filter NOTAMs
  const filteredNotams = useMemo(() => {
    let filtered = processedNotams;

    if (showHighlightedOnly) {
      filtered = filtered.filter(n => n.shouldHighlight);
    } else {
      filtered = filtered.filter(n => {
        if (!showRead && n.isRead) return false;
        if (!showUnread && !n.isRead) return false;
        return true;
      });
    }

    // Sort: highlighted first, then by distance
    filtered.sort((a, b) => {
      if (a.shouldHighlight && !b.shouldHighlight) return -1;
      if (!a.shouldHighlight && b.shouldHighlight) return 1;

      const distA = a.currentDistance ?? Infinity;
      const distB = b.currentDistance ?? Infinity;
      return distA - distB;
    });

    return filtered;
  }, [processedNotams, showRead, showUnread, showHighlightedOnly]);

  const highlightedCount = processedNotams.filter(n => n.shouldHighlight).length;
  const unreadCount = processedNotams.filter(n => !n.isRead).length;
  const nowCloseCount = processedNotams.filter(n => n.wasReadWhenFar).length;
  const resurfacedCount = processedNotams.filter(n => n.resurfaced).length;

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <div className="header-left">
            <h1>NOTAM Tool</h1>
            <p className="subtitle">Smart Read Status Tracking</p>
          </div>
          <div className="view-toggle">
            <button
              className={`view-btn ${viewMode === 'split' ? 'active' : ''}`}
              onClick={() => setViewMode('split')}
              title="Split view"
            >
              Split
            </button>
            <button
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List view"
            >
              List
            </button>
            <button
              className={`view-btn ${viewMode === 'map' ? 'active' : ''}`}
              onClick={() => setViewMode('map')}
              title="Map view"
            >
              Map
            </button>
          </div>
        </div>
      </header>

      <div className="app-body">
        <div className="controls-bar">
          <FlightSelector
            flights={flights}
            currentFlightId={currentFlightId}
            onSelectFlight={handleSelectFlight}
            onNewFlight={handleNewFlight}
          />

          <div className="stats-bar">
            <div className="stat">
              <span className="stat-value highlight-value">{highlightedCount}</span>
              <span className="stat-label">Highlighted</span>
            </div>
            <div className="stat">
              <span className="stat-value">{unreadCount}</span>
              <span className="stat-label">Unread</span>
            </div>
            {nowCloseCount > 0 && (
              <div className="stat stat-warning">
                <span className="stat-value">{nowCloseCount}</span>
                <span className="stat-label">Now Close</span>
              </div>
            )}
            {resurfacedCount > 0 && (
              <div className="stat stat-info">
                <span className="stat-value">{resurfacedCount}</span>
                <span className="stat-label">Resurfaced</span>
              </div>
            )}
            <div className="stat">
              <span className="stat-value">{processedNotams.length}</span>
              <span className="stat-label">Total</span>
            </div>
          </div>

          <NotamFilters
            showRead={showRead}
            showUnread={showUnread}
            showHighlighted={showHighlightedOnly}
            onToggleRead={() => setShowRead(!showRead)}
            onToggleUnread={() => setShowUnread(!showUnread)}
            onToggleHighlighted={() => setShowHighlightedOnly(!showHighlightedOnly)}
          />
        </div>

        <div className={`main-content view-${viewMode}`}>
          {/* NOTAM List Panel */}
          {(viewMode === 'split' || viewMode === 'list') && (
            <div className="list-panel">
              {filteredNotams.length === 0 ? (
                <div className="empty-state">
                  <p>No NOTAMs match the current filters.</p>
                  {!currentFlightId && (
                    <p className="hint">Select a flight to see NOTAMs relevant to your route.</p>
                  )}
                </div>
              ) : (
                filteredNotams.map(notam => (
                  <NotamCard
                    key={notam.id}
                    notam={notam}
                    onMarkAsRead={handleMarkAsRead}
                    isSelected={notam.id === selectedNotamId}
                    onSelect={handleSelectNotam}
                  />
                ))
              )}
            </div>
          )}

          {/* Map Panel */}
          {(viewMode === 'split' || viewMode === 'map') && (
            <div className="map-panel">
              <NotamMap
                notams={filteredNotams}
                currentFlight={currentFlight}
                onMarkAsRead={handleMarkAsRead}
                selectedNotamId={selectedNotamId}
                onSelectNotam={handleSelectNotam}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
