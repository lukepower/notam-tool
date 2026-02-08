import React from 'react';
import { Flight } from '../types';
import './FlightSelector.css';

interface FlightSelectorProps {
  flights: Flight[];
  currentFlightId: string | null;
  onSelectFlight: (flightId: string) => void;
  onNewFlight: () => void;
}

const FlightSelector: React.FC<FlightSelectorProps> = ({
  flights,
  currentFlightId,
  onSelectFlight,
  onNewFlight
}) => {
  return (
    <div className="flight-selector">
      <label className="flight-label">Current Flight:</label>
      <div className="flight-controls">
        <select 
          className="flight-select"
          value={currentFlightId || ''}
          onChange={(e) => onSelectFlight(e.target.value)}
        >
          <option value="">Select a flight...</option>
          {flights.map(flight => (
            <option key={flight.id} value={flight.id}>
              {flight.name} ({flight.route.length} waypoints)
            </option>
          ))}
        </select>
        <button className="new-flight-btn" onClick={onNewFlight}>
          + New Flight
        </button>
      </div>
    </div>
  );
};

export default FlightSelector;
