# FamMap (親子地圖) - Product Requirement Document (PRD)

## 1. Product Vision & Core Pain Points
**Vision:** FamMap aims to be the most reliable companion for parents to discover, share, and navigate kid-friendly locations. It's a map-based platform that simplifies the process of finding nursing rooms, playgrounds, family restaurants, and medical facilities, ensuring a stress-free outing for families.

**Core Pain Points:**
- **Information Scarcity:** It's often hard to find reliable information about specific facilities like nursing rooms or stroller accessibility.
- **Fragmented Data:** Parents have to switch between multiple apps (Google Maps, blogs, social media) to find a good spot.
- **Uncertainty:** Real-time status (crowdedness, cleanliness) is rarely available.
- **Language Barrier:** Local information is often only in one language, making it difficult for expatriate or tourist families.

## 2. Target Users & User Stories
- **The Local Explorer (Mom/Dad):** Needs to find nearby playgrounds or restaurants with high chairs quickly.
  - *Story:* "As a local parent, I want to find a nearby park with a sandbox so my child can play safely while I rest."
- **The Traveling Family:** Needs to navigate a new city with a stroller.
  - *Story:* "As a tourist parent, I want to filter locations by stroller accessibility so I don't get stuck at stairs."
- **The "Emergency" Seeker:** Needs a nursing room or pharmacy immediately.
  - *Story:* "As a nursing mother, I need to find the nearest clean nursing room with a changing table right now."

## 3. Functional Requirements

### P0 (Critical - MVP)
- **Map View:** Interactive map showing kid-friendly locations.
- **Location Details:** Name, category, address, photos, and basic facilities (e.g., changing table, high chair).
- **Search & Filter:** Search by name or category (Parks, Restaurants, Nursing Rooms).
- **User Location:** "Find me" button to center map on current location.
- **Bilingual Support:** Full UI and content support for Traditional Chinese and English.

### P1 (Important)
- **User Reviews & Ratings:** Parents can rate and leave comments on locations.
- **Add/Edit Locations:** Crowdsourced data entry for new facilities.
- **Stroller Accessibility Filter:** Toggle to show only accessible routes/locations.
- **Favorites/Saved Places:** Save locations for future reference.

### P2 (Nice to have)
- **Real-time Crowdedness:** User-reported status on how busy a place is.
- **Offline Maps:** Downloadable map data for areas with poor connectivity.
- **Events Integration:** Show family-oriented events happening at locations.

## 4. Non-Functional Requirements
- **Performance:** Initial map load < 2 seconds. Search results returned in < 500ms.
- **Security:** User data (if any) must be encrypted. SSL/TLS for all communications.
- **Availability:** 99.9% uptime.
- **Scalability:** Support up to 10,000 concurrent users.
- **Responsiveness:** Fully functional on Mobile, Tablet, and Desktop.

## 5. Technical Stack & Deployment
- **Frontend:** React (TypeScript) with Vite.
- **Styling:** Vanilla CSS (as per Gemini CLI preference).
- **Map Engine:** Leaflet (OpenStreetMap).
- **Backend:** FastAPI (Python).
- **Database:** PostgreSQL (PostGIS for spatial queries).
- **Deployment:** PWA (Mobile First), Vercel (Frontend), Railway/Render (Backend).

## 6. Competitive Analysis
- **Google Maps:** Great for general locations, but lacks specialized "parent-child" filters and verified facility details.
- **Social Media/Blogs:** Good for inspiration, but poor for real-time navigation and structured data.
- **Specialized Apps:** Usually region-locked or have poor UX/UI. FamMap wins on bilingualism and focused facility data.

## 7. MVP Scope & Roadmap
- **Phase 1 (MVP):** Map view, basic search, nursing room/park database, bilingual UI.
- **Phase 2:** User reviews, crowdsourced data, saved places.
- **Phase 3:** Stroller navigation, real-time updates.

## 8. UI/UX Design Specification
- **Color Palette:**
  - Primary (Soft Blue): `#A7C7E7`
  - Secondary (Warm Yellow): `#FDFD96`
  - Background (Cream/White): `#FFFDD0` / `#FFFFFF`
  - Text (Dark Gray): `#333333`
  - Accent (Coral): `#FF6F61`
- **Typography:** 'Noto Sans TC' (Google Fonts) for a clear and friendly feel.
- **Component Style:** Large touch targets, rounded corners (8px+), subtle shadows.
- **RWD Breakpoints:** 600px (Mobile), 1024px (Tablet), 1440px (Desktop).
- **Modes:** Support for Light Mode (default) and Dark Mode (softer grays/blues).

## 9. Key Performance Indicators (KPIs)
- **User Retention:** % of users returning within 7 days.
- **Data Growth:** Number of new locations added by users per month.
- **Search Success Rate:** % of searches that result in a location click.
