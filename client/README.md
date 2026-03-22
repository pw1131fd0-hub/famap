# FamMap Frontend

A React + TypeScript + Vite application for discovering kid-friendly locations on an interactive map.

## Features

- Interactive map with OpenStreetMap tiles via Leaflet
- Location filtering by category (Parks, Restaurants, Nursing Rooms, Medical, Attractions)
- Stroller accessibility filter
- User reviews and ratings
- Favorites/saved places
- Location details with photos and facilities
- Multi-language support (Chinese/English)
- Responsive design for mobile, tablet, and desktop
- Progressive Web App (PWA) support

## Tech Stack

- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Map Library**: Leaflet with react-leaflet
- **UI Components**: Lucide React icons
- **HTTP Client**: Axios
- **Package Manager**: npm

## Development

### Prerequisites

- Node.js 16+
- npm

### Setup

```bash
npm install
npm run dev
```

The app will be available at `http://localhost:5173` (or the configured Vite port).

### Build

```bash
npm run build
npm run preview
```

### Testing

```bash
npm test
npm run test:coverage
```

### Linting

```bash
npm run lint
```

## Project Structure

```
src/
├── components/        # React components (LocationForm, ReviewForm, ReviewList)
├── services/         # API client (api.ts)
├── i18n/            # Internationalization
├── types/           # TypeScript type definitions
├── __tests__/       # Test files
├── App.tsx          # Main application component
├── index.css        # Global styles
└── main.tsx         # Entry point
```

## API Integration

The frontend communicates with two backend services:

- **Python Backend (FastAPI)** on port 3001: Primary backend for location data
- **Node.js Backend (Express)** on port 3002: Alternative backend with reviews and favorites

API Base URL is configurable via the `VITE_API_URL` environment variable (defaults to `/api`).

## Performance

- Build size: ~520KB (gzipped: ~135KB)
- All tests pass: 37 test files
- Zero npm vulnerabilities
- Marker clustering for smooth rendering of 500+ locations

## License

MIT
