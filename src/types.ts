// NOTAM (Notice to Air Missions) data types

export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface NOTAM {
  id: string;
  title: string;
  description: string;
  location: Coordinate;
  effectiveDate: string; // ISO date string
  expiryDate: string; // ISO date string
  published: string; // ISO date string
  altitudeMin?: number; // in feet
  altitudeMax?: number; // in feet
  radius?: number; // in nautical miles
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface ReadStatus {
  notamId: string;
  readAt: string; // ISO date string
  flightId: string;
  distanceFromRoute: number; // in nautical miles when read
}

export interface Flight {
  id: string;
  name: string;
  route: Coordinate[]; // waypoints
  createdAt: string; // ISO date string
}

export interface NotamWithStatus extends NOTAM {
  isRead: boolean;
  readAt?: string;
  wasReadWhenFar?: boolean; // true if it was read when far from route
  shouldHighlight: boolean; // true if needs attention
  currentDistance?: number; // current distance from route
  daysSincePublished: number;
}
