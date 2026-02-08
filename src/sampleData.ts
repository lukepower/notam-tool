// Sample NOTAM data for testing

import { NOTAM } from './types';

// Sample NOTAMs around common aviation locations
export const sampleNotams: NOTAM[] = [
  {
    id: 'NOTAM-001',
    title: 'KJFK Runway 4L/22R Closed',
    description: 'Runway 4L/22R closed for maintenance. Use alternate runways.',
    location: { latitude: 40.6413, longitude: -73.7781 }, // JFK Airport
    effectiveDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
    published: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    altitudeMin: 0,
    altitudeMax: 1000,
    radius: 2,
    severity: 'medium'
  },
  {
    id: 'NOTAM-002',
    title: 'KLAX Temporary Flight Restriction',
    description: 'TFR due to VIP movement. Avoid area between 1400-1600Z.',
    location: { latitude: 33.9416, longitude: -118.4085 }, // LAX Airport
    effectiveDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
    expiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    published: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(), // 12 days ago
    altitudeMin: 0,
    altitudeMax: 18000,
    radius: 10,
    severity: 'high'
  },
  {
    id: 'NOTAM-003',
    title: 'KORD Taxiway B Closed',
    description: 'Taxiway B closed due to construction. Use alternate taxiways.',
    location: { latitude: 41.9742, longitude: -87.9073 }, // ORD Airport
    effectiveDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    expiryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    published: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    altitudeMin: 0,
    altitudeMax: 500,
    radius: 1,
    severity: 'low'
  },
  {
    id: 'NOTAM-004',
    title: 'KDFW Approach Lighting System Out',
    description: 'Runway 18R approach lighting system out of service.',
    location: { latitude: 32.8998, longitude: -97.0403 }, // DFW Airport
    effectiveDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 days ago
    expiryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    published: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(), // 9 days ago
    altitudeMin: 0,
    altitudeMax: 2000,
    radius: 3,
    severity: 'medium'
  },
  {
    id: 'NOTAM-005',
    title: 'KATL Airspace Restriction',
    description: 'Special use airspace activated. Contact ATC before entry.',
    location: { latitude: 33.6407, longitude: -84.4277 }, // ATL Airport
    effectiveDate: new Date().toISOString(),
    expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    published: new Date().toISOString(), // Today
    altitudeMin: 5000,
    altitudeMax: 15000,
    radius: 20,
    severity: 'high'
  },
  {
    id: 'NOTAM-006',
    title: 'KSEA ILS Runway 16L Out',
    description: 'ILS for Runway 16L out of service. Visual approaches only.',
    location: { latitude: 47.4502, longitude: -122.3088 }, // SEA Airport
    effectiveDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    expiryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    published: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    altitudeMin: 0,
    altitudeMax: 3000,
    radius: 5,
    severity: 'medium'
  },
  {
    id: 'NOTAM-007',
    title: 'KMIA Bird Activity Warning',
    description: 'Increased bird activity reported in vicinity of airport.',
    location: { latitude: 25.7959, longitude: -80.2870 }, // MIA Airport
    effectiveDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
    expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    published: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString(), // 16 days ago
    altitudeMin: 0,
    altitudeMax: 5000,
    radius: 8,
    severity: 'low'
  },
  {
    id: 'NOTAM-008',
    title: 'KBOS Construction Crane',
    description: 'Construction crane 1200ft AGL at coordinates. Lit.',
    location: { latitude: 42.3656, longitude: -71.0096 }, // BOS Airport
    effectiveDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 days ago
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    published: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(), // 21 days ago
    altitudeMin: 0,
    altitudeMax: 1500,
    radius: 2,
    severity: 'critical'
  }
];

// Sample flight routes
export const sampleFlights = [
  {
    id: 'flight-1',
    name: 'JFK to LAX',
    route: [
      { latitude: 40.6413, longitude: -73.7781 }, // JFK
      { latitude: 39.8561, longitude: -104.6737 }, // DEN (waypoint)
      { latitude: 33.9416, longitude: -118.4085 }  // LAX
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: 'flight-2',
    name: 'ORD to MIA',
    route: [
      { latitude: 41.9742, longitude: -87.9073 }, // ORD
      { latitude: 33.6407, longitude: -84.4277 }, // ATL (waypoint)
      { latitude: 25.7959, longitude: -80.2870 }  // MIA
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: 'flight-3',
    name: 'SEA to BOS',
    route: [
      { latitude: 47.4502, longitude: -122.3088 }, // SEA
      { latitude: 41.9742, longitude: -87.9073 },  // ORD (waypoint)
      { latitude: 42.3656, longitude: -71.0096 }   // BOS
    ],
    createdAt: new Date().toISOString()
  }
];
