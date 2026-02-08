// Persistent storage using localStorage for read status and flights

import { ReadStatus, Flight } from './types';

const READ_STATUS_KEY = 'notam_read_status';
const FLIGHTS_KEY = 'notam_flights';
const CURRENT_FLIGHT_KEY = 'notam_current_flight';

export class NotamStorage {
  // Read Status Management
  static saveReadStatus(status: ReadStatus): void {
    const statuses = this.getAllReadStatuses();
    const existingIndex = statuses.findIndex(
      s => s.notamId === status.notamId && s.flightId === status.flightId
    );

    if (existingIndex >= 0) {
      statuses[existingIndex] = status;
    } else {
      statuses.push(status);
    }

    localStorage.setItem(READ_STATUS_KEY, JSON.stringify(statuses));
  }

  static getAllReadStatuses(): ReadStatus[] {
    const data = localStorage.getItem(READ_STATUS_KEY);
    return data ? JSON.parse(data) : [];
  }

  static getReadStatusForNotam(notamId: string, flightId: string): ReadStatus | null {
    const statuses = this.getAllReadStatuses();
    return statuses.find(s => s.notamId === notamId && s.flightId === flightId) || null;
  }

  static clearOldReadStatuses(daysToKeep: number = 30): void {
    const statuses = this.getAllReadStatuses();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const filtered = statuses.filter(s => new Date(s.readAt) >= cutoffDate);
    localStorage.setItem(READ_STATUS_KEY, JSON.stringify(filtered));
  }

  // Flight Management
  static saveFlight(flight: Flight): void {
    const flights = this.getAllFlights();
    const existingIndex = flights.findIndex(f => f.id === flight.id);

    if (existingIndex >= 0) {
      flights[existingIndex] = flight;
    } else {
      flights.push(flight);
    }

    localStorage.setItem(FLIGHTS_KEY, JSON.stringify(flights));
  }

  static getAllFlights(): Flight[] {
    const data = localStorage.getItem(FLIGHTS_KEY);
    return data ? JSON.parse(data) : [];
  }

  static getFlight(id: string): Flight | null {
    const flights = this.getAllFlights();
    return flights.find(f => f.id === id) || null;
  }

  static deleteFlight(id: string): void {
    const flights = this.getAllFlights();
    const filtered = flights.filter(f => f.id !== id);
    localStorage.setItem(FLIGHTS_KEY, JSON.stringify(filtered));
  }

  static setCurrentFlight(flightId: string): void {
    localStorage.setItem(CURRENT_FLIGHT_KEY, flightId);
  }

  static getCurrentFlight(): string | null {
    return localStorage.getItem(CURRENT_FLIGHT_KEY);
  }

  static clearCurrentFlight(): void {
    localStorage.removeItem(CURRENT_FLIGHT_KEY);
  }

  static clearAll(): void {
    localStorage.removeItem(READ_STATUS_KEY);
    localStorage.removeItem(FLIGHTS_KEY);
    localStorage.removeItem(CURRENT_FLIGHT_KEY);
  }
}
