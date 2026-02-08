# NOTAM Tool - Smart Read Status Management

A Progressive Web App (PWA) for managing NOTAM (Notice to Air Missions) read status across flights with intelligent highlighting.

## Features

### ✈️ Flight Management
- Create and manage multiple flights with waypoint routes
- Switch between flights to see relevant NOTAMs
- Read status tracked independently per flight

### 📋 Smart NOTAM Highlighting
The system intelligently highlights NOTAMs that need attention:

1. **Proximity-Based Highlighting**: Unread NOTAMs within 30 NM of your route are highlighted
2. **Distance Change Detection**: NOTAMs marked as read when far (>100 NM) from a previous route that are now close (<30 NM) to current route show "⚠️ NOW CLOSE" badge
3. **Time-Based Resurfacing**: NOTAMs older than 7 days are resurfaced with "🔄 RESURFACED" badge even if previously read

### 🎯 Key Capabilities
- **Persistent Storage**: Read status saved in browser localStorage
- **Distance Calculation**: Accurate Haversine formula for calculating distances in nautical miles
- **Route Awareness**: Calculates minimum distance from NOTAMs to flight routes including waypoints
- **Visual Indicators**: Color-coded severity levels (Critical, High, Medium, Low)
- **iPad Optimized**: Touch-friendly UI designed for iPad with responsive layout

### 🔍 Filter Options
- View unread NOTAMs
- View read NOTAMs
- Show only highlighted NOTAMs requiring attention
- Real-time statistics (highlighted count, unread count, total count)

## Technology Stack

- **React 18** with TypeScript
- **Progressive Web App** (PWA) for offline capability
- **localStorage** for persistent data storage
- **CSS3** with animations for visual feedback
- **Responsive Design** optimized for iPad (1024x768)

## Installation & Usage

### Development
```bash
npm install
npm start
```

The app will open at `http://localhost:3000`

### Production Build
```bash
npm run build
```

### Testing
```bash
npm test
```

## Project Structure

```
src/
├── components/          # React components
│   ├── NotamCard.tsx   # Individual NOTAM display
│   ├── FlightSelector.tsx  # Flight selection UI
│   └── NotamFilters.tsx    # Filter controls
├── types.ts            # TypeScript type definitions
├── storage.ts          # localStorage management
├── utils.ts            # Distance calculations & highlighting logic
├── sampleData.ts       # Sample NOTAMs and flights
└── App.tsx            # Main application component
```

## Smart Highlighting Logic

The system uses three thresholds:
- **CLOSE_THRESHOLD**: 30 NM (NOTAMs within this distance are considered "close")
- **FAR_THRESHOLD**: 100 NM (NOTAMs beyond this distance are considered "far")
- **RESURFACE_DAYS**: 7 days (NOTAMs older than this are resurfaced)

### Highlighting Rules:
1. A NOTAM is highlighted if:
   - It's unread AND within 30 NM of the current route
   - It was read when >100 NM away but is now <30 NM from route
   - It's been published for 7+ days AND last read 7+ days ago

## iPad Installation

1. Open the app in Safari on iPad
2. Tap the Share button
3. Select "Add to Home Screen"
4. The app will run in fullscreen mode like a native app

## Screenshots

### Initial View
![NOTAM Tool Initial View](https://github.com/user-attachments/assets/63eff192-607c-470a-80e8-33932e0c984e)

### With Flight Selected
![NOTAM Tool with Flight](https://github.com/user-attachments/assets/7ea4eb29-246b-4c58-aad3-0a8534f15e05)

### Highlighted NOTAMs Only
![Highlighted NOTAMs](https://github.com/user-attachments/assets/9ce1fc9a-8523-4548-b958-50a952b2254f)

## Future Enhancements

- Integration with real NOTAM APIs
- Offline map display of NOTAM locations
- Push notifications for new NOTAMs on active routes
- Export flight plans and NOTAM summaries
- Multi-user support with cloud sync
- Advanced filtering by altitude, severity, and type

## License

MIT
