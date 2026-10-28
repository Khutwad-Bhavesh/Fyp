# Shuchithwam: Smart OWC Operations Monitoring & Management System

> **Client / Industry Partner:** Rajeshree Enviro Solutions  
> **Institution:** Department of Computer Engineering, Vidyalankar Polytechnic  
> **Academic Project Affiliation:** Maharashtra State Board of Technical Education (MSBTE)  
> **Project Team:** Bhavesh Vinayak Khutwad, Vaibhav Anil Badade, Shreyash Digambar Redkar, Pranav Prasad Mehadale  

---

## 1. Executive Summary

Organic Waste Converter (OWC) operational sites managed by **Rajeshree Enviro Solutions** have historically depended on manual handwritten registers to track worker attendance, daily waste batch feeding, and machinery operation. This physical record-keeping made centralized verification, multi-site operational tracking, and timely reporting difficult.

**Shuchithwam** is a digital operations monitoring and management platform that centralizes these workflows into a web and mobile-first system. It introduces **digital biometric-style attendance with GPS geofencing and selfie camera verification**, **daily waste-processing reporting with speech-to-text voice input**, **scheduled monthly supervisor site visit tracking**, and an **IoT machine runtime verification engine** that flags throughput discrepancies automatically.

---

## 2. Key Architecture & Clean Folder Structure

The repository separates business logic from presentation UI components, centralizes configuration, establishes global state management, and delivers a scalable REST API architecture:

```
c:\Users\VB\Shuchithwam/
├── app/                                 # Next.js 15 App Router (Presentation & API Gateway)
│   ├── (auth)/login/                    # Role-based login and session authentication
│   ├── worker/                          # Mobile-first Worker Interface
│   │   └── page.tsx                     # Attendance check-in/out, GPS, Camera, Voice reporting
│   ├── supervisor/                      # Supervisor Dashboard & Audit Console
│   │   └── page.tsx                     # Monthly visit reminders, report audit, IoT discrepancy flags
│   ├── admin/                           # Administrator System Governance Hub
│   │   └── page.tsx                     # Site CRUD, machine registry, user management, telemetry
│   ├── api/                             # Scalable REST API Structure
│   │   ├── auth/route.ts                # User sessions & role verification
│   │   ├── sites/route.ts               # OWC Sites management
│   │   ├── machines/route.ts            # Machine registry & rated capacities (kg/hr)
│   │   ├── attendance/route.ts          # Digital check-in with GPS & selfie capture
│   │   ├── work-reports/route.ts        # Daily reports & automatic IoT verification
│   │   ├── visits/route.ts              # Monthly supervisor visit scheduling & checklists
│   │   ├── iot/route.ts                 # ESP32 machine telemetry ingestion
│   │   ├── analytics/route.ts           # System-wide metrics & discrepancy counts
│   │   └── export/route.ts              # CSV & printable HTML/PDF report generator
│   ├── layout.tsx                       # Global app shell with context providers & nav
│   ├── page.tsx                         # Interactive landing page with 1-click role switcher
│   └── globals.css                      # Tailwind v4 eco-emerald styling theme
│
├── components/                          # Modular Reusable UI Components
│   ├── ui/                              # Radix UI + Tailwind design primitives
│   ├── common/                          # Global Header, Navigation, Export Modal
│   ├── attendance/                      # CameraCaptureModal, GpsBadge, AttendanceTable
│   ├── reporting/                       # VoiceRecorder (Speech-to-text), DiscrepancyBadge
│   └── iot/                             # IoTTelemetryViewer, RuntimeCards, SensorLog
│
├── src/
│   ├── config/                          # Isolated Environment & Domain Configuration
│   │   ├── env.ts                       # Validated environment configurations
│   │   └── constants.ts                 # Machine models, roles, operational activities
│   ├── context/                         # Reactive State Management
│   │   ├── AuthContext.tsx              # Active user, role permissions, switcher
│   │   ├── SiteContext.tsx              # Active site selection & machines
│   │   ├── AttendanceContext.tsx        # Shift status, check-in data, geofencing
│   │   └── NotificationContext.tsx      # Monthly visit reminders & discrepancy alerts
│   ├── hooks/                           # Custom Business Logic Hooks
│   │   ├── useGeolocation.ts            # Real-time GPS location with accuracy check
│   │   └── useSpeechToText.ts           # Web Speech API speech recognition hook
│   ├── lib/                             # Core Business Logic & Infrastructure
│   │   ├── db/                          # Database Repository Layer
│   │   │   ├── schema.sql               # PostgreSQL / Relational DDL matching ER diagram
│   │   │   ├── seedData.ts              # Seed data for Rajeshree Enviro sites & machines
│   │   │   └── store.ts                 # Resilient repository store
│   │   ├── iot/                         # IoT Verification Engine
│   │   │   └── verification.ts          # Discrepancy calculation & tolerance logic
│   │   ├── export/                      # Operational report formatters (CSV / PDF)
│   │   └── errors/                      # Standardized AppError & error middleware
│   └── types/                           # Unified TypeScript Interfaces
│       └── index.ts                     # User, Site, Machine, Attendance, WorkReport, Visit, Telemetry
│
├── scripts/
│   ├── test-iot-verification.js         # Automated unit tests for IoT verification formula
│   └── iot-telemetry-simulator.js       # ESP32 microcontroller mock telemetry generator
│
├── .env.example                         # Environment variable definitions template
├── .env.local                           # Local development runtime configuration
├── package.json                         # Dependencies & project scripts
├── tsconfig.json                        # Strict TypeScript configuration
└── next.config.ts                       # Next.js build configuration
```

---

## 3. Synopsis Modules & Role-Based Access Control (RBAC)

| User Role | Primary Interface | Core Responsibilities & Permissions |
| :--- | :--- | :--- |
| **Worker** | Mobile-First Web App (`/worker`) | - Select assigned OWC site<br>- Digital Check-In / Check-Out with live **Camera Selfie** & **GPS Geofence**<br>- Submit daily work report with **Waste Processed (kg)** & **Machine Runtime (hrs)**<br>- **Voice-Based Input**: Dictate notes via Web Speech API (English, Hindi, Marathi) |
| **Supervisor** | Audit Dashboard (`/supervisor`) | - Site-wise review of worker attendance, GPS coordinates, and selfie evidence<br>- **Monthly Site Visit Reminders**: System tracks 1 visit/month requirement per assigned site with Overdue / Scheduled alerts<br>- Conduct inspections with structured checklists (machine wear, curing bay, hygiene)<br>- **IoT Discrepancy Review**: Flag anomalous claims where reported kg exceeds machine runtime<br>- Export site reports to CSV & PDF |
| **Administrator** | Central Console (`/admin`) | - Manage OWC operational sites (Add/Edit locations, GPS coordinates, supervisor assignment)<br>- Manage OWC machinery inventory (Models: OWC-30 to OWC-500, rated capacities in kg/hr)<br>- Manage user accounts and role assignments<br>- Monitor cross-site live ESP32 telemetry & performance analytics<br>- System-wide operational audit & data export |

---

## 4. Mathematical IoT Verification Logic

From the Synopsis (Section 3.9 & 8):

$$\text{Expected Output Quantity (kg)} = \text{Rated Processing Capacity (kg/hr)} \times \text{Machine Operating Time (hours)}$$

### Real-World Example
- **Machine:** OWC-60 (Rated Capacity: $25\text{ kg/hr}$)
- **Recorded Operating Time:** $0.5\text{ hours}$ (30 minutes)
- **Theoretical Expected Output:**
  $$\text{Expected} = 25 \times 0.5 = 12.5\text{ kg}$$
- **Reported Waste Batch:** If a worker enters $100\text{ kg}$, the difference is $+700\%$, exceeding the allowable $25\%$ tolerance margin.
- **Outcome:** The system automatically flags `discrepancyFlag: true` with a detailed warning for supervisor physical audit.

Run the test suite to verify the logic:
```bash
node scripts/test-iot-verification.js
```

---

## 5. Scalable REST API Specification

All endpoints return standardized JSON structures: `{ success: true, data: ... }` with proper HTTP status codes.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/auth` | Retrieve available users or active session |
| `POST` | `/api/auth` | Authenticate by role or email |
| `GET` | `/api/sites` | List all operational OWC sites |
| `POST` | `/api/sites` | Register a new OWC operational site with GPS coordinates |
| `PUT` | `/api/sites` | Update site parameters or supervisor assignment |
| `GET` | `/api/machines` | List OWC machines and rated capacities (filterable by site) |
| `POST` | `/api/machines` | Register a new OWC machine asset |
| `GET` | `/api/attendance` | Retrieve attendance history (filter by site, worker, date) |
| `POST` | `/api/attendance` | Record digital check-in with GPS coordinates, geofence, and photo |
| `PUT` | `/api/attendance` | Record check-out timestamp |
| `GET` | `/api/work-reports` | List daily work reports (filter by site, discrepancies) |
| `POST` | `/api/work-reports` | Submit daily work report; auto-triggers IoT discrepancy engine |
| `PATCH` | `/api/work-reports` | Supervisor audit sign-off (verify or flag with notes) |
| `GET` | `/api/visits` | Get scheduled monthly supervisor site inspections |
| `POST` | `/api/visits` | Schedule upcoming monthly site visit |
| `PATCH` | `/api/visits` | Mark visit completed with machine & curing bay checklist |
| `GET` | `/api/iot` | Query machine telemetry stream & sensor data |
| `POST` | `/api/iot` | Ingest ESP32 microcontroller runtime & electrical telemetry |
| `GET` | `/api/analytics` | System-wide statistics, total kg processed, and discrepancy count |
| `GET` | `/api/export` | Download operational records in CSV or formatted printable HTML/PDF |

---

## 6. Environment Configuration

Environment parameters are isolated in `.env.example` and validated via `src/config/env.ts`:

```env
# Application
NODE_ENV=development
PORT=3000
NEXT_PUBLIC_APP_NAME="Shuchithwam Smart OWC"
NEXT_PUBLIC_COMPANY_NAME="Rajeshree Enviro Solutions"
NEXT_PUBLIC_API_BASE_URL="http://localhost:3000/api"

# IoT Controller Telemetry
IOT_GATEWAY_API_KEY=shuchithwam_iot_secure_token_2026
DISCREPANCY_TOLERANCE_PERCENTAGE=25

# Geolocation Perimeter
MAX_ALLOWED_CHECKIN_DISTANCE_METERS=500
REQUIRE_GPS_ACCURACY_METERS=100
```

---

## 7. Running the Project

### Option A: Quick Instant Run (Zero Setup Required)
You can launch the complete system immediately without installing any external packages:

**Method 1: 1-Click Batch Runner**
- Double-click [`run.bat`](file:///C:/Users/VB/Shuchithwam/run.bat) in the project root.

**Method 2: Command Line**
```powershell
agy-node server.js
```
Open your browser at **`http://localhost:3000`** to access the system:
- **Field Worker Portal**: Camera selfie check-in, GPS geofence tracking, voice-to-text reporting.
- **Supervisor Dashboard**: Monthly visit tracking & reminders, report review, IoT capacity audits.
- **Administrator Console**: Sites CRUD, machine asset inventory, user management, and exports.

---

### Option B: Run Automated Unit Tests & IoT Simulator
- **Run IoT Verification Formula Test Suite:**
  ```powershell
  agy-node scripts/test-iot-verification.js
  # or double-click test.bat
  ```
- **Simulate ESP32 Microcontroller Telemetry Stream:**
  ```powershell
  agy-node scripts/iot-telemetry-simulator.js
  # or double-click simulate-iot.bat
  ```

---

### Option C: Standard Next.js Development Server
If you prefer running via standard `npm`:
1. Install Node.js LTS (if not already installed):
   ```powershell
   winget install OpenJS.NodeJS.LTS
   ```
2. Install dependencies & start:
   ```powershell
   npm install
   npm run dev
   ```
   Open `http://localhost:3000`.
