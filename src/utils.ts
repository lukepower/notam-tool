// Utilities for NOTAM processing, distance calculations, and smart highlighting

import { Coordinate, NOTAM, NotamWithStatus, Flight, ReadStatus } from './types';
import { NotamStorage } from './storage';

// Distance calculation using Haversine formula
// Returns distance in nautical miles
export function calculateDistance(coord1: Coordinate, coord2: Coordinate): number {
  const R = 3440.065; // Earth radius in nautical miles
  const lat1 = toRadians(coord1.latitude);
  const lat2 = toRadians(coord2.latitude);
  const deltaLat = toRadians(coord2.latitude - coord1.latitude);
  const deltaLon = toRadians(coord2.longitude - coord1.longitude);

  const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// Calculate minimum distance from a NOTAM to a route
export function calculateMinDistanceToRoute(
  notamLocation: Coordinate,
  route: Coordinate[]
): number {
  if (route.length === 0) {
    return Infinity;
  }

  if (route.length === 1) {
    return calculateDistance(notamLocation, route[0]);
  }

  let minDistance = Infinity;

  // Check distance to each waypoint
  for (const waypoint of route) {
    const distance = calculateDistance(notamLocation, waypoint);
    minDistance = Math.min(minDistance, distance);
  }

  // Check distance to each route segment
  for (let i = 0; i < route.length - 1; i++) {
    const segmentDistance = distanceToLineSegment(
      notamLocation,
      route[i],
      route[i + 1]
    );
    minDistance = Math.min(minDistance, segmentDistance);
  }

  return minDistance;
}

// Calculate distance from a point to a line segment
function distanceToLineSegment(
  point: Coordinate,
  lineStart: Coordinate,
  lineEnd: Coordinate
): number {
  const distanceToStart = calculateDistance(point, lineStart);
  const lineLength = calculateDistance(lineStart, lineEnd);

  if (lineLength === 0) {
    return distanceToStart;
  }

  // Project point onto line segment using dot product
  const t = Math.max(0, Math.min(1,
    ((point.latitude - lineStart.latitude) * (lineEnd.latitude - lineStart.latitude) +
     (point.longitude - lineStart.longitude) * (lineEnd.longitude - lineStart.longitude)) /
    (lineLength * lineLength)
  ));

  const projectedPoint = {
    latitude: lineStart.latitude + t * (lineEnd.latitude - lineStart.latitude),
    longitude: lineStart.longitude + t * (lineEnd.longitude - lineStart.longitude)
  };

  return calculateDistance(point, projectedPoint);
}

// Calculate days since a date
export function daysSince(dateString: string): number {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

// Define what "close" and "far" mean for the route
const CLOSE_THRESHOLD_NM = 30; // within 30 nautical miles is "close"
const FAR_THRESHOLD_NM = 100; // beyond 100 nautical miles is "far"
const RESURFACE_DAYS = 7; // resurface NOTAMs after 7 days

// Process NOTAMs with smart highlighting logic
export function processNotamsWithStatus(
  notams: NOTAM[],
  currentFlight: Flight | null
): NotamWithStatus[] {
  const flightId = currentFlight?.id || 'default';
  
  return notams.map(notam => {
    const readStatus = NotamStorage.getReadStatusForNotam(notam.id, flightId);
    const isRead = readStatus !== null;
    const daysSincePublished = daysSince(notam.published);
    
    let currentDistance = Infinity;
    if (currentFlight && currentFlight.route.length > 0) {
      currentDistance = calculateMinDistanceToRoute(notam.location, currentFlight.route);
    }

    // Determine if this NOTAM should be highlighted
    let shouldHighlight = false;
    let wasReadWhenFar = false;

    if (isRead && readStatus) {
      const distanceWhenRead = readStatus.distanceFromRoute;
      const daysSinceRead = daysSince(readStatus.readAt);
      
      // Check if it was read when far but is now close
      if (distanceWhenRead > FAR_THRESHOLD_NM && currentDistance < CLOSE_THRESHOLD_NM) {
        shouldHighlight = true;
        wasReadWhenFar = true;
      }
      
      // Resurface if older than 7 days
      if (daysSincePublished >= RESURFACE_DAYS && daysSinceRead >= RESURFACE_DAYS) {
        shouldHighlight = true;
      }
    } else {
      // Unread NOTAMs close to route should be highlighted
      if (currentDistance < CLOSE_THRESHOLD_NM) {
        shouldHighlight = true;
      }
    }

    return {
      ...notam,
      isRead,
      readAt: readStatus?.readAt,
      wasReadWhenFar,
      shouldHighlight,
      currentDistance: currentDistance === Infinity ? undefined : currentDistance,
      daysSincePublished
    };
  });
}

// Mark a NOTAM as read
export function markNotamAsRead(
  notamId: string,
  flightId: string,
  distanceFromRoute: number
): void {
  const readStatus: ReadStatus = {
    notamId,
    readAt: new Date().toISOString(),
    flightId,
    distanceFromRoute
  };
  NotamStorage.saveReadStatus(readStatus);
}
