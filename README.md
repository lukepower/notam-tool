# NOTAM Tool - Smart Read Status Tracking

A React-based NOTAM (Notice to Air Missions) management tool with intelligent read status tracking across flights, displayed on an interactive map.

## Features

### Smart Read Status Tracking
- **Persistent read status** across flights stored in localStorage
- **Distance-aware tracking**: records how far from the route a NOTAM was when marked as read
- **Proximity re-alerting**: NOTAMs marked as read when >100 NM from route are highlighted when they come within 30 NM ("NOW CLOSE" badge)
- **7-day resurfacing**: any NOTAM read more than 7 days ago automatically resurfaces for re-review ("RESURFACED" badge)

### Interactive Map View
- Flight route displayed as a dashed polyline with departure/arrival/waypoint labels
- 30 NM corridor buffer visualized along the route
- Color-coded NOTAM markers by severity and read status
- Click markers to see details and mark as read
- Pulsing animation on highlighted NOTAMs
- NOTAM radius circles where applicable
- Map legend explaining all visual indicators

### Three View Modes
- **Split**: List panel + Map side by side (default)
- **List**: Traditional card-based list view
- **Map**: Full-screen map with popups

### Filtering & Stats
- Filter by read/unread/highlighted
- Stats bar showing highlighted, unread, now-close, resurfaced, and total counts
- NOTAMs sorted by highlight status then distance from route

## Tech Stack

- React 18 + TypeScript
- Leaflet + react-leaflet (map)
- localStorage for persistence
- Create React App

## Getting Started

```bash
npm install
npm start
```

## Sample Data

Includes 8 sample NOTAMs at major US airports (JFK, LAX, ORD, DFW, ATL, SEA, MIA, BOS) and 3 sample flight routes for testing.
