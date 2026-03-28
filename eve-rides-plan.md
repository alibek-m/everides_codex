# Eve Rides — Technical Build Plan

## Overview

Eve Rides is a peer-to-peer electric micromobility rental marketplace (e-scooters, e-bikes, mopeds) for Miami. The app connects vehicle owners ("Hosts") with renters ("Riders"). Modeled after Turo's UX patterns but adapted for micromobility vehicles.

The app includes mandatory GPS tracking of the renter's phone during active rentals, a remote kill switch integration for listed vehicles, and GPS tracker hardware on each vehicle.

---

## 1. Architecture

### Tech Stack
- **Frontend (Mobile):** React Native (Expo) — iOS + Android from a single codebase
- **Backend:** Node.js with Express or Fastify
- **Database:** PostgreSQL (primary) + Redis (caching, sessions, real-time)
- **Real-time:** Socket.io or WebSockets for live location streaming and notifications
- **Auth:** Firebase Auth or Auth0 (social login + email/phone)
- **Storage:** AWS S3 or Cloudflare R2 (vehicle photos, profile images, documents)
- **Maps:** Google Maps SDK (React Native Maps) or Mapbox
- **Payments:** Stripe Connect (split payments between platform and hosts)
- **Push Notifications:** Firebase Cloud Messaging (FCM) + APNs
- **Location Services:** React Native Background Geolocation library

### Project Structure
```
eve-rides/
├── mobile/                    # React Native (Expo) app
│   ├── src/
│   │   ├── screens/
│   │   │   ├── auth/          # Login, Signup, Onboarding
│   │   │   ├── search/        # Home/Search, Filters, Results
│   │   │   ├── vehicle/       # Vehicle Detail, Booking Flow
│   │   │   ├── trips/         # Active Trips, Trip History
│   │   │   ├── inbox/         # Messages, Notifications
│   │   │   ├── favorites/     # Saved Vehicles
│   │   │   ├── host/          # Host Dashboard, List Vehicle, Earnings
│   │   │   └── profile/       # Account, Settings, Legal
│   │   ├── components/        # Shared UI components
│   │   ├── navigation/        # Tab + Stack navigators
│   │   ├── services/          # API client, location, notifications
│   │   ├── hooks/             # Custom hooks
│   │   ├── store/             # State management (Zustand or Redux)
│   │   ├── utils/             # Helpers, formatters, validators
│   │   └── theme/             # Colors, typography, spacing tokens
│   └── app.json
├── server/                    # Backend API
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── middleware/
│   │   ├── services/
│   │   │   ├── location/      # Location tracking logic
│   │   │   ├── killswitch/    # Kill switch integration
│   │   │   ├── payments/      # Stripe Connect
│   │   │   ├── notifications/ # Push + in-app
│   │   │   └── insurance/     # Per-ride insurance API
│   │   └── utils/
│   └── prisma/                # Prisma ORM schema + migrations
└── shared/                    # Shared types, constants, validation schemas
```

---

## 2. Database Schema (Core Models)

```prisma
model User {
  id                String      @id @default(uuid())
  email             String      @unique
  phone             String?     @unique
  passwordHash      String?
  firstName         String
  lastName          String
  avatarUrl         String?
  dateOfBirth       DateTime?
  driversLicenseUrl String?
  driversLicenseVerified Boolean @default(false)
  idVerified        Boolean     @default(false)
  stripeCustomerId  String?
  stripeConnectId   String?     // For hosts receiving payouts
  role              UserRole    @default(RIDER)
  rating            Float?
  totalTrips        Int         @default(0)
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt

  vehicles          Vehicle[]
  bookingsAsRider   Booking[]   @relation("RiderBookings")
  reviewsGiven      Review[]    @relation("ReviewsGiven")
  reviewsReceived   Review[]    @relation("ReviewsReceived")
  messages          Message[]
  favorites         Favorite[]
  locationLogs      LocationLog[]
}

enum UserRole {
  RIDER
  HOST
  BOTH
}

model Vehicle {
  id                String        @id @default(uuid())
  hostId            String
  host              User          @relation(fields: [hostId], references: [id])
  type              VehicleType
  make              String        // e.g., "Segway", "Rad Power", "Vespa"
  model             String        // e.g., "Ninebot Max", "RadRunner"
  year              Int
  description       String
  photos            String[]      // Array of S3 URLs
  pricePerHour      Float
  pricePerDay       Float
  pricePerWeek      Float?
  location          Json          // { lat, lng, address, city, zip }
  availableFrom     DateTime?
  availableTo       DateTime?
  isAvailable       Boolean       @default(true)
  maxRange          Int?          // Range in miles on full charge
  topSpeed          Int?          // mph
  requiresLicense   Boolean       @default(false) // Mopeds may require license
  helmetsIncluded   Int           @default(0)
  rating            Float?
  totalTrips        Int           @default(0)

  // Hardware
  killSwitchId      String?       @unique  // ID of installed kill switch device
  gpsTrackerId      String?       @unique  // ID of installed GPS tracker
  hardwareVerified  Boolean       @default(false) // Hardware installed & tested

  // Status
  status            VehicleStatus @default(PENDING_HARDWARE)

  bookings          Booking[]
  reviews           Review[]
  favorites         Favorite[]
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt
}

enum VehicleType {
  ELECTRIC_SCOOTER
  ELECTRIC_BIKE
  ELECTRIC_MOPED
}

enum VehicleStatus {
  PENDING_HARDWARE    // Awaiting kill switch + GPS installation
  PENDING_REVIEW      // Hardware installed, awaiting admin approval
  ACTIVE              // Listed and available
  SUSPENDED           // Temporarily suspended
  DELISTED            // Removed from platform
}

model Booking {
  id                String        @id @default(uuid())
  riderId           String
  rider             User          @relation("RiderBookings", fields: [riderId], references: [id])
  vehicleId         String
  vehicle           Vehicle       @relation(fields: [vehicleId], references: [id])
  status            BookingStatus @default(PENDING)
  startTime         DateTime
  endTime           DateTime
  actualStartTime   DateTime?
  actualEndTime     DateTime?
  totalPrice        Float
  serviceFee        Float         // Platform cut
  hostPayout        Float         // Host receives this
  insuranceFee      Float?
  stripePaymentId   String?
  cancellationReason String?

  // Location tracking consent
  locationConsentGranted Boolean  @default(false)

  locationLogs      LocationLog[]
  review            Review?
  messages          Message[]
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt
}

enum BookingStatus {
  PENDING           // Awaiting host approval
  APPROVED          // Host approved, awaiting start
  ACTIVE            // Rental in progress
  COMPLETED         // Rental finished
  CANCELLED         // Cancelled by either party
  DISPUTED          // Under dispute
}

model LocationLog {
  id          String   @id @default(uuid())
  bookingId   String
  booking     Booking  @relation(fields: [bookingId], references: [id])
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  latitude    Float
  longitude   Float
  accuracy    Float?   // GPS accuracy in meters
  speed       Float?   // Current speed
  heading     Float?   // Direction of travel
  battery     Float?   // Phone battery level
  source      LocationSource
  timestamp   DateTime @default(now())
}

enum LocationSource {
  RIDER_PHONE
  VEHICLE_GPS
}

model Review {
  id          String   @id @default(uuid())
  bookingId   String   @unique
  booking     Booking  @relation(fields: [bookingId], references: [id])
  reviewerId  String
  reviewer    User     @relation("ReviewsGiven", fields: [reviewerId], references: [id])
  revieweeId  String
  reviewee    User     @relation("ReviewsReceived", fields: [revieweeId], references: [id])
  vehicleId   String?
  vehicle     Vehicle? @relation(fields: [vehicleId], references: [id])
  rating      Int      // 1-5
  comment     String?
  createdAt   DateTime @default(now())
}

model Message {
  id          String   @id @default(uuid())
  bookingId   String?
  booking     Booking? @relation(fields: [bookingId], references: [id])
  senderId    String
  sender      User     @relation(fields: [senderId], references: [id])
  receiverId  String
  content     String
  isRead      Boolean  @default(false)
  createdAt   DateTime @default(now())
}

model Favorite {
  id          String   @id @default(uuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  vehicleId   String
  vehicle     Vehicle  @relation(fields: [vehicleId], references: [id])
  createdAt   DateTime @default(now())

  @@unique([userId, vehicleId])
}
```

---

## 3. Core Features — Screen by Screen

### 3.1 Bottom Tab Navigation (5 tabs, mirrors Turo)
1. **Search** (home icon) — Default landing tab
2. **Favorites** (heart icon)
3. **Trips** (road/path icon)
4. **Inbox** (chat bubble icon)
5. **More** (three dots / hamburger)

---

### 3.2 Search / Home Screen
- **Search bar** at top: "Search Miami" with location + date pickers
- **Filter chips** below search: "All", "E-Scooters", "E-Bikes", "Mopeds", "Nearby"
- **Sections:**
  - "Continue searching" card (if prior search exists) — shows location + dates
  - "Inspired by your recent searches" — horizontal scroll of vehicle cards
  - "Popular near you" — grid/list of top-rated vehicles nearby
  - "Affordable daily rentals" — budget-friendly options
- **Vehicle card** shows: photo, vehicle name (make + model + year), star rating, trip count, price/hour or price/day, distance from user
- Tapping a card opens Vehicle Detail screen

### 3.3 Search Results Screen
- Top bar: location, dates, filter count
- **Filter bar:** Price, Vehicle Type, Make & Model (horizontal scroll)
- **Sort options:** Relevance, Price (low-high), Distance, Rating
- Result count: "X vehicles available"
- Scrollable list of vehicle cards (larger format than home)
- **Map toggle button** at bottom — switches to map view with pins for each vehicle
- Map view: clustered pins, tapping a pin shows mini vehicle card overlay

### 3.4 Vehicle Detail Screen
- **Photo carousel** (full-width, swipeable, dots indicator)
- **Vehicle title:** Make + Model + Year
- **Rating + trip count** + Host badge (e.g., "All-Star Host")
- **Location** (neighborhood-level, not exact address until booked)
- **Pricing section:** per hour / per day / per week rates, "Save $X/day on weekly" callout
- **Description** (expandable)
- **Specs section:** range, top speed, weight, helmets included, license required badge
- **Host card:** avatar, name, rating, response rate, member since
- **Reviews section:** overall rating, recent reviews with pagination
- **"Book this ride"** CTA button (sticky at bottom)
- **Heart icon** in top-right for favorites

### 3.5 Booking Flow
1. **Select dates/times:** Calendar picker for start + end
2. **Price breakdown:** base price, service fee, insurance fee (if applicable), total
3. **Location consent screen (MANDATORY):**
   - Clear explanation: "Eve Rides tracks your location during active rentals for safety and vehicle security"
   - "Allow location access" — must grant "Always" permission
   - Cannot proceed without consent
   - Link to privacy policy explaining data usage
4. **Payment:** saved card or add new (Stripe)
5. **Confirm booking** — sends request to host
6. **Confirmation screen:** booking details, host contact info, pickup instructions

### 3.6 Favorites Screen
- Empty state: "Get started with favorites" + heart icon + "Tap the heart icon to save your favorite vehicles" + "Find new favorites" CTA button
- Populated state: list/grid of favorited vehicle cards
- Swipe to remove or tap heart to unfavorite

### 3.7 Trips Screen
- **Empty state:** illustration + "No upcoming trips yet" + "Explore the thousands of available vehicles on Eve Rides and book your next ride" + "Start searching" CTA
- **Tabs:** Upcoming / Active / Past
- **Upcoming:** confirmed bookings with countdown, host contact, pickup details
- **Active trip card (critical screen):**
  - Live map showing rider's location + vehicle's GPS location
  - Trip timer (elapsed time)
  - Vehicle details
  - "End trip" button
  - Emergency contact / report issue
  - Kill switch trigger (for host/admin only)
- **Past:** completed trips, option to leave review, rebook

### 3.8 Inbox Screen
- **Tabs:** Messages / Notifications
- **Messages:** conversation threads grouped by booking, sorted by recency
  - Each thread shows: other user's avatar, name, last message preview, timestamp, unread indicator
  - Tapping opens full chat (real-time messaging via WebSockets)
- **Notifications:** booking confirmations, trip reminders, location alerts, payment receipts, review requests
- **Empty state:** illustration + "No messages yet"

### 3.9 More / Profile Screen
- **Profile card:** avatar, name, "View and edit profile" link
- **"Become a host" banner** (if not hosting yet) — CTA to list a vehicle
- **Menu items:**
  - Account (edit profile, phone, email, password)
  - My Vehicles (host dashboard — if host)
  - Earnings (host payouts — if host)
  - Payment Methods
  - Gift Cards / Promo Codes
  - Why choose Eve Rides
  - Get Help / Support
  - Legal (Terms, Privacy Policy)
  - Log Out

---

## 4. Host Flow

### 4.1 List a Vehicle
1. **Vehicle type selector:** E-Scooter / E-Bike / Moped
2. **Vehicle details form:** make, model, year, description
3. **Photo upload:** minimum 3 photos, guidance on angles (front, side, dashboard/display)
4. **Specs form:** range, top speed, helmets included, license required
5. **Pricing form:** set per-hour, per-day, optional per-week rates
6. **Location:** set pickup location (address or pin on map)
7. **Availability:** calendar-based availability (block specific dates)
8. **Hardware installation scheduling:**
   - Inform host: "Before your vehicle goes live, we'll install a GPS tracker and safety switch"
   - Schedule an appointment or provide instructions for self-install
   - Status tracker: Pending → Scheduled → Installed → Verified → Live
9. **Submit for review**

### 4.2 Host Dashboard
- **Vehicle cards** with status (Active, Pending, Booked)
- **Booking requests:** approve/deny incoming booking requests
- **Earnings overview:** this week, this month, total, pending payout
- **Calendar view:** see all bookings across vehicles
- **Live tracking:** during active rentals, host can see rider's location on a map
- **Kill switch controls:** emergency disable button (requires confirmation + reason)

---

## 5. Location Tracking System (Critical Feature)

### 5.1 How It Works
- **When:** Location tracking activates ONLY during an active rental (from trip start to trip end)
- **Permissions required:** "Always" location access on iOS/Android
- **Tracking interval:** every 15-30 seconds during active ride
- **Data sent to server:** lat, lng, accuracy, speed, heading, phone battery, timestamp

### 5.2 Implementation — React Native Background Geolocation
```
Library: react-native-background-geolocation (by Transistor Software)
```

This is the gold-standard library for persistent background location tracking on both platforms.

**Key configuration:**
- `desiredAccuracy: HIGH`
- `distanceFilter: 10` (meters — log a point every 10m of movement)
- `stopOnTerminate: false` (keep tracking if app is killed)
- `startOnBoot: true` (resume tracking after phone restart)
- `enableHeadless: true` (Android — run without UI)
- `preventSuspend: true` (iOS — prevent iOS from suspending the app)
- `heartbeatInterval: 60` (send heartbeat every 60s even if stationary)

### 5.3 Location-Off Detection & Notification
- The background geolocation library fires events when location services are disabled
- **On `providerchange` event (location turned off):**
  1. Immediately fire a local notification: "Your location is required during your Eve Rides rental. Please re-enable location services to continue your trip."
  2. Send a server-side alert — server notes location gap
  3. If location remains off for >5 minutes: send push notification via FCM
  4. If location remains off for >15 minutes: alert host + admin, consider triggering kill switch warning
  5. If location remains off for >30 minutes: option to remotely disable vehicle via kill switch

### 5.4 Location Consent Flow
- Before ANY booking can start, rider must:
  1. Agree to location tracking terms (in-app consent screen with clear language)
  2. Grant OS-level "Always" location permission
  3. If "While Using App" is selected, prompt to upgrade to "Always" with explanation
  4. If denied entirely, booking cannot proceed
- Store consent record in database (timestamp, IP, consent version)

### 5.5 Privacy & Compliance
- Location data is ONLY collected during active rentals
- Data retention policy: keep location logs for 30 days after trip ends, then anonymize/delete
- Privacy policy must clearly disclose: what is tracked, when, why, how long it's stored, who can see it
- Comply with Florida data privacy laws and any applicable federal regulations (no comprehensive federal privacy law yet, but monitor for changes)
- Riders can request their location data (data portability)

---

## 6. Kill Switch Integration

### 6.1 Architecture
- Each listed vehicle has a kill switch device (hardware) with a unique device ID
- Device communicates via cellular (LTE/4G IoT SIM) or Bluetooth relay through rider's phone
- **Server → Kill Switch API → Device:** send enable/disable command
- **Device → Server:** heartbeat, status (armed/disarmed), tamper alert

### 6.2 Kill Switch Service (Backend)
```
POST /api/killswitch/:vehicleId/disable   — Disable vehicle (requires auth: host or admin)
POST /api/killswitch/:vehicleId/enable    — Re-enable vehicle
GET  /api/killswitch/:vehicleId/status    — Check device status
POST /api/killswitch/:vehicleId/alert     — Tamper alert webhook from device
```

### 6.3 Trigger Conditions
- **Manual:** Host or admin triggers via dashboard (requires confirmation modal + reason)
- **Automatic (configurable):**
  - Vehicle leaves geofence (defined radius from pickup location)
  - Rider's location off for extended period
  - Booking time exceeded by >2 hours with no extension
  - Tamper detected on device
- Every trigger is logged with timestamp, reason, who triggered it

---

## 7. API Endpoints (Core)

### Auth
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh-token
POST   /api/auth/forgot-password
POST   /api/auth/verify-phone (SMS OTP)
POST   /api/auth/verify-email
```

### Users
```
GET    /api/users/me
PATCH  /api/users/me
POST   /api/users/me/avatar
POST   /api/users/me/verify-identity (upload ID/license)
GET    /api/users/:id/public-profile
```

### Vehicles
```
GET    /api/vehicles                    — Search/list (with filters, geo-query)
GET    /api/vehicles/:id
POST   /api/vehicles                    — Create listing (host)
PATCH  /api/vehicles/:id               — Update listing
DELETE /api/vehicles/:id               — Delist
GET    /api/vehicles/:id/availability  — Get available dates
PATCH  /api/vehicles/:id/availability  — Update availability
GET    /api/vehicles/nearby?lat=&lng=&radius=  — Geo search
```

### Bookings
```
POST   /api/bookings                    — Create booking request
GET    /api/bookings                    — List my bookings (rider or host)
GET    /api/bookings/:id
PATCH  /api/bookings/:id/approve        — Host approves
PATCH  /api/bookings/:id/deny           — Host denies
PATCH  /api/bookings/:id/start          — Start trip
PATCH  /api/bookings/:id/end            — End trip
PATCH  /api/bookings/:id/cancel
POST   /api/bookings/:id/extend         — Extend rental
```

### Location
```
POST   /api/location/log                — Batch submit location points
GET    /api/location/booking/:bookingId — Get location trail for a booking (host/admin)
GET    /api/location/live/:bookingId    — WebSocket endpoint for live tracking
POST   /api/location/alert              — Location-off alert
```

### Messages
```
GET    /api/messages/threads            — List conversation threads
GET    /api/messages/thread/:bookingId  — Get messages for a booking
POST   /api/messages                    — Send message
PATCH  /api/messages/:id/read           — Mark as read
```

### Reviews
```
POST   /api/reviews                     — Submit review
GET    /api/reviews/vehicle/:vehicleId  — Get vehicle reviews
GET    /api/reviews/user/:userId        — Get user reviews
```

### Favorites
```
GET    /api/favorites
POST   /api/favorites/:vehicleId
DELETE /api/favorites/:vehicleId
```

### Payments
```
POST   /api/payments/setup-intent       — Set up payment method
GET    /api/payments/methods            — List saved payment methods
DELETE /api/payments/methods/:id
GET    /api/payments/earnings           — Host earnings
POST   /api/payments/payout             — Request payout
```

### Admin
```
GET    /api/admin/vehicles/pending      — Vehicles awaiting hardware verification
PATCH  /api/admin/vehicles/:id/verify   — Approve vehicle after hardware install
GET    /api/admin/bookings/active       — All active rentals with live tracking
POST   /api/admin/killswitch/:vehicleId — Admin kill switch control
GET    /api/admin/alerts                — Location alerts, disputes, etc.
```

---

## 8. Third-Party Services

| Service | Purpose |
|---------|---------|
| **Stripe Connect** | Payments, split payouts to hosts, refunds |
| **Firebase Auth** | Authentication (email, phone, social) |
| **Firebase Cloud Messaging** | Push notifications (iOS + Android) |
| **Google Maps Platform** | Maps SDK, Geocoding, Directions API |
| **AWS S3 / Cloudflare R2** | Image storage (vehicle photos, IDs) |
| **Twilio** | SMS verification, alerts |
| **SendGrid** | Transactional emails (booking confirmations, receipts) |
| **Transistor Software** | Background Geolocation SDK license |
| **Kill Switch Hardware API** | TBD — depends on hardware partner (e.g., custom IoT, or partner like Invoxia, Sherlock) |
| **Persona or Veriff** | Identity verification (ID + selfie check) |

---

## 9. Design System / Theme

### Brand
- **App name:** Eve Rides
- **Primary color:** Deep purple/violet (similar to Turo's brand purple — #5850EC or similar)
- **Accent color:** Electric green or teal (micromobility energy vibe)
- **Neutral palette:** White backgrounds, soft grays, dark text
- **Typography:** Modern geometric sans-serif (e.g., Plus Jakarta Sans, General Sans, Satoshi)
- **Iconography:** Outlined style, consistent stroke width, custom vehicle type icons
- **Illustrations:** Fun, hand-drawn style for empty states (like Turo's car illustrations) — but with scooters/bikes
- **Corner radius:** Rounded cards (12-16px), pill buttons, soft UI

### Key UI Patterns (from Turo screenshots)
- Full-width photo cards with overlaid heart/favorite icon
- Star ratings with trip count in parentheses
- Price displayed prominently with strikethrough for discounts
- "All-Star Host" style badges
- Purple CTA buttons
- Tab bar with 5 icons + labels at bottom
- Horizontal scrolling carousels for vehicle categories
- Empty state illustrations with clear CTA

---

## 10. Build Order (Suggested Phases)

### Phase 1: Foundation
- Project setup (Expo + Node.js)
- Database schema + Prisma migrations
- Auth system (register, login, phone verify)
- Basic navigation shell (5 tabs)
- User profile CRUD

### Phase 2: Core Marketplace
- Vehicle listing flow (host side)
- Vehicle search + filters + geo-query
- Vehicle detail screen
- Favorites system
- Search results with map view

### Phase 3: Booking & Payments
- Booking request flow
- Stripe Connect integration
- Host approval/deny
- Price calculation engine
- Booking management (upcoming, active, past)

### Phase 4: Location Tracking
- Background geolocation setup
- Location consent flow
- Location-off detection + notifications
- Live tracking map (rider view + host view)
- Location data API + storage

### Phase 5: Communication
- Real-time messaging (WebSocket)
- Push notifications
- Inbox screen (messages + notifications)
- Booking status notifications

### Phase 6: Kill Switch & Hardware
- Kill switch API integration
- Admin verification flow for hardware
- Geofence setup per vehicle
- Automated trigger rules
- Host dashboard kill switch controls

### Phase 7: Reviews, Polish & Launch
- Review system
- Earnings dashboard for hosts
- Identity verification integration
- App Store / Play Store submission
- Admin panel (web-based) for operations

---

## 11. Important Notes

- **Location tracking privacy:** This is the most legally sensitive feature. Consult a Florida attorney before launch. Have a clear, plain-language privacy policy. Never track outside of active rentals.
- **Insurance:** Research per-ride insurance providers (e.g., Turo uses Liberty Mutual; look for micromobility-specific insurers like Markel or LIME's approach). This cannot be an afterthought.
- **Miami-Dade regulations:** Check municipal code for e-scooter/moped rental business licensing, speed limits by vehicle class, helmet requirements, age restrictions, and where vehicles can operate.
- **Kill switch safety:** Never disable a vehicle while it's moving at high speed. The kill switch should reduce power gradually, not instant-off, to prevent accidents. This is a critical safety design decision.
- **Battery level consideration:** Both the vehicle battery and the rider's phone battery matter. If phone battery is dying, location tracking may fail — consider warning the rider and tracking via the vehicle's GPS tracker as backup.
