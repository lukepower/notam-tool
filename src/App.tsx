import React, { useState, useEffect, useMemo } from 'react';
import './App.css';
import NotamCard from './components/NotamCard';
import FlightSelector from './components/FlightSelector';
import NotamFilters from './components/NotamFilters';
import { Flight, NotamWithStatus } from './types';
import { NotamStorage } from './storage';
import { sampleNotams, sampleFlights } from './sampleData';
import { processNotamsWithStatus, markNotamAsRead } from './utils';

function App() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [currentFlightId, setCurrentFlightId] = useState<string | null>(null);
  const [processedNotams, setProcessedNotams] = useState<NotamWithStatus[]>([]);
  const [showRead, setShowRead] = useState(true);
  const [showUnread, setShowUnread] = useState(true);
  const [showHighlightedOnly, setShowHighlightedOnly] = useState(false);

  // Initialize flights from storage or sample data
  useEffect(() => {
    const storedFlights = NotamStorage.getAllFlights();
    if (storedFlights.length === 0) {
      // Initialize with sample flights
      sampleFlights.forEach(flight => NotamStorage.saveFlight(flight));
      setFlights(sampleFlights);
    } else {
      setFlights(storedFlights);
    }

    // Restore current flight selection
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

  // Handle flight selection
  const handleSelectFlight = (flightId: string) => {
    setCurrentFlightId(flightId);
    NotamStorage.setCurrentFlight(flightId);
  };

  // Handle new flight creation (simplified for demo)
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

  // Handle marking NOTAM as read
  const handleMarkAsRead = (notamId: string) => {
    if (!currentFlightId) {
      alert('Please select a flight first');
      return;
    }

    const notam = processedNotams.find(n => n.id === notamId);
    if (!notam) return;

    const distance = notam.currentDistance || 999;
    markNotamAsRead(notamId, currentFlightId, distance);

    // Refresh the processed NOTAMs
    const currentFlight = flights.find(f => f.id === currentFlightId) || null;
    const processed = processNotamsWithStatus(sampleNotams, currentFlight);
    setProcessedNotams(processed);
  };

  // Filter NOTAMs based on current filter settings
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

  return (
    <div className="App">
      <header className="app-header">
        <h1>✈️ NOTAM Tool</h1>
        <p className="subtitle">Smart Read Status Management</p>
      </header>

      <div className="app-container">
        <FlightSelector
          flights={flights}
          currentFlightId={currentFlightId}
          onSelectFlight={handleSelectFlight}
          onNewFlight={handleNewFlight}
        />

        <div className="stats-bar">
          <div className="stat">
            <span className="stat-value">{highlightedCount}</span>
            <span className="stat-label">Highlighted</span>
          </div>
          <div className="stat">
            <span className="stat-value">{unreadCount}</span>
            <span className="stat-label">Unread</span>
          </div>
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

        <div className="notam-list">
          {filteredNotams.length === 0 ? (
            <div className="empty-state">
              <p>No NOTAMs match the current filters.</p>
              {!currentFlightId && (
                <p className="hint">💡 Select a flight to see NOTAMs relevant to your route.</p>
              )}
            </div>
          ) : (
            filteredNotams.map(notam => (
              <NotamCard
                key={notam.id}
                notam={notam}
                onMarkAsRead={handleMarkAsRead}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
