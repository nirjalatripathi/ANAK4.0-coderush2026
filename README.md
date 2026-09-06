# RAHAT

**Local Disaster Response & Smart Relief Coordination**

> Know the disaster. Know the people. Know the need. Move the right resources. Verify the delivery.

RAHAT is a **local-level disaster response and relief coordination platform**. It connects local authorities, citizens, safe zones, relief camps, camp officials, donors and relief resources through one operational workflow.

It is not a generic disaster-information website, social platform, family-reunification system, alert engine or donation website.

---

## Problem statement

After a local disaster, authorities need to move people to declared safe places, open relief camps, know what is actually short, match donations to those shortages, verify delivery and keep inventory honest. Generic donation pages and static dashboards do not do this.

## Solution

RAHAT makes MongoDB the source of truth for disasters, people counts, inventory, needs, donations, deliveries and transfers. Shortage and priority are calculated in backend services. Frontend pages consume those values.

---

## Core RAHAT workflow

```text
LOCAL DISASTER
        ↓
DISASTER ASSESSMENT / LEVEL
        ↓
AFFECTED AREA
        ↓
SAFE ZONE DECLARATION
        ↓
CITIZEN EVACUATION / CHECK-IN
        ↓
RELIEF CAMP
        ↓
POPULATION + INVENTORY
        ↓
NEEDS CALCULATION
        ↓
SHORTAGE DETECTION
        ↓
RELIEF PRIORITIZATION
        ↓
DONATION / RESOURCE MATCHING
        ↓
DELIVERY TRACKING
        ↓
VERIFIED RECEIPT
        ↓
INVENTORY UPDATE
        ↓
SHORTAGE REDUCTION
```

---

## Key features

- Disaster declaration with level, type, wards and affected areas
- Safe-zone declaration, occupancy and capacity-deficit display
- Official-led citizen check-in (no phone or account required)
- Relief-camp population and inventory
- Rules-based needs engine (not AI)
- Donate-to-verified-need, not generic camp fundraising
- Delivery verification with discrepancy records
- Surplus-to-shortage resource transfer recommendations
- Public transparency with aggregated, privacy-safe totals
- Role-based workspaces and admin audit logs

## Unique features

- **Need → Resource → Delivery → Verification** is the product centre
- Incoming stock is included in shortage: `projected available = current + incoming`
- Inventory rises by the **received** quantity, not the pledged quantity
- Transfer recommendations are generated from surplus vs shortage
- Unaccounted population means “location not recorded”, not “missing”

Family reunification and disaster alert broadcasts are **out of scope**. Another team owns alerts. RAHAT may display current disaster status from the database.

---

## User roles

Roles are assigned **only on the server**. The frontend cannot create or change a role.

| Role | Workspace | What they do |
| --- | --- | --- |
| Citizen | `/citizen` | Profile, disaster status, safe zones, camp status |
| Local authority | `/authority` | Declare disasters, safe zones and camps in their municipality |
| Camp official | `/camp` | Check-in, inventory, delivery verification, transfers for assigned camp |
| Donor | `/donor` | View verified needs, pledge, track impact |
| Admin | `/admin` | Full operations, reports, settings, audit logs |

Public registration always creates a **citizen**. Donor registration (`/api/auth/register-donor`) always creates a **donor**. Admin accounts come from `ADMIN_EMAIL` / `ADMIN_PASSWORD` via the seeder.

Admin sign-in is only at **`/admin/login`**. It is not in the public navbar.

---

## Technology stack

| Layer | Stack |
| --- | --- |
| Frontend | React, Vite, React Router, Tailwind CSS, Axios, Context API, Leaflet / OSM |
| Backend | Node.js, Express, MongoDB, Mongoose |
| Auth | JWT, bcryptjs, role and jurisdiction middleware |
| Architecture | Routes → middleware → controllers → services → models |

---

## Architecture

```text
Request
  → Authentication
  → Identify user and role
  → Check jurisdiction / assigned camp
  → Controller (HTTP)
  → Service (calculations and workflows)
  → MongoDB
```

Business logic does not live in `index.js`. Shortage, priority, donation receipt and transfers are service operations.

---

## Folder structure

```text
ANAK4.0-coderush2026/
├── client/                 React portal
│   ├── src/components/     Shared UI
│   ├── src/pages/          public, auth, citizen, authority, camp, donor, admin
│   ├── src/services/       API modules
│   └── src/layouts/        Public + role shells
└── server/
    ├── config/             Database and environment
    ├── controllers/        Request / response
    ├── middleware/         Auth, roles, uploads, errors
    ├── models/             Mongoose schemas
    ├── routes/             REST mounts
    ├── services/           Business rules
    ├── seed/               Admin + demo data
    └── utils/              IDs, tokens, constants
```

This structure is locked. New work belongs inside these modules.

---

## Database models

User, Citizen, LocalAuthority, Disaster, AffectedArea, SafeZone, ReliefCamp, CampOfficial, CampPopulation, CampInventory, InventoryTransaction, ReliefNeed, Donation, DonationDelivery, ResourceTransfer, AuditLog.

Additional supporting models exist for settings, contact messages and compatibility with earlier operational records. Public pages never expose private identity fields.

---

## API overview

| Area | Base path | Auth |
| --- | --- | --- |
| Auth / register / login | `/api/auth` | Public register + login |
| Admin login | `/api/auth/admin/login` | Admin credentials |
| Current user | `/api/auth/me` | JWT |
| Citizens | `/api/citizens` | Citizen / admin |
| Disasters | `/api/disasters` | Public read; authority/admin write |
| Safe zones / check-in | `/api/safe-zones` | Public read; official write |
| Camps | `/api/camps` | Public read; scoped write |
| Inventory | `/api/inventory` | Official / admin |
| Relief needs | `/api/relief/needs` | Public read |
| Donations | `/api/donations` | Public list (sanitised); donor pledge |
| Donation receipt | `/api/donations/:id/receive` | Camp official / admin |
| Resource transfers | `/api/resource-transfers` | Official / authority / admin |
| Admin | `/api/admin` | Admin only |
| Public stats / contact | `/api/public` | Public |

Consistent response shape:

```json
{ "success": true, "…": "…" }
```

```json
{ "success": false, "message": "Camp not found" }
```

Typical errors: 400, 401, 403, 404, 409, 422, 500.

Citizen tokens calling admin APIs receive **403** with `Access Denied — Administrator privileges required.`

---

## Environment variables

`server/.env.example`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/rahat
JWT_SECRET=change_this_to_a_long_random_secret
JWT_EXPIRES_IN=8h
CLIENT_URL=http://localhost:5173
ADMIN_EMAIL=admin@rahat.gov.np
ADMIN_PASSWORD=
ADMIN_NAME=RAHAT System Administrator
DEMO_OFFICIAL_PASSWORD=CampOfficial@2026
DEMO_CITIZEN_PASSWORD=CitizenDemo@2026
```

Never commit a real production password. `client/.env` uses `VITE_API_URL=/api`. Vite proxies `/api` and `/uploads` to port 5000.

---

## MongoDB setup

Start MongoDB locally (`mongod`) or set a MongoDB Atlas URI. The default local database is `rahat`.

Standalone MongoDB does not run multi-document replica-set sessions. Related writes (receipt → inventory → need → audit) run as ordered service steps with validation so a failed step does not silently invent stock.

---

## Installation

### Prerequisites

- Node.js 20+
- MongoDB 6+

### Backend

```bash
cd server
copy .env.example .env
npm install
```

### Frontend

```bash
cd client
copy .env.example .env
npm install
```

---

## Running backend

```bash
cd server
npm run dev
```

Health: [http://localhost:5000/api/health](http://localhost:5000/api/health)

## Running frontend

```bash
cd client
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) (or the next free Vite port).

---

## Seed commands

```bash
cd server
npm run seed:admin
npm run seed:demo
```

`seed:demo` also ensures the administrator exists. All seeded records are **DEMO DATA**.

---

## Demo accounts

| Role | Email | Password |
| --- | --- | --- |
| Administrator | `admin@rahat.gov.np` | `RahatAdmin@2026` |
| Local authority | `authority.suryabinayak@rahat.gov.np` | `Authority@2026` |
| Donor | `donor.demo@rahat.test` | `DonorDemo@2026` |
| Camp A official | `official.a@rahat.gov.np` | `CampOfficial@2026` |
| Citizen | `citizen.demo@rahat.test` | `CitizenDemo@2026` |

These credentials are for the fictional demonstration only.

---

## Demo scenario

**Municipality:** Suryabinayak (DEMO)  
**Wards:** 5, 6, 7  
**Disaster:** Flood · **Level:** 3

Safe zones A / B / C have declared capacity. Relief Camp A holds the water need used in the pitch:

| Item | Required | Current | Incoming | Shortage | Priority |
| --- | --- | --- | --- | --- | --- |
| Drinking Water | 10,000 L | 3,000 L | 500 L | 6,500 L | CRITICAL |

Camp A blankets are short; Camp B has a blanket surplus. RAHAT recommends a 300-blanket transfer B → A.

A donor can pledge 5,000 L water. After the camp official verifies receipt, inventory and the need recalculate (example: shortage 6,500 → 1,500, about 76.9% reduction). A second donation of 500 blankets received as 480 creates a discrepancy of 20.

---

## Security architecture

1. Passwords hashed with bcryptjs.
2. JWT is issued after the role is read from MongoDB.
3. Registration never accepts a client-supplied role.
4. `protect` loads the user; `authorize` checks the role.
5. Local authorities are limited to their municipality.
6. Camp officials are limited to their assigned camp.
7. Public donation lists hide donor email and phone.
8. Sensitive writes create an `AuditLog` (admin only).

Frontend route guards are UX only. Backend authorization is mandatory.

---

## Donation lifecycle

```text
Pledged → Confirmed → In Transit → Arrived → Received → In Inventory → Distributed
```

Arbitrary jumps (for example Pledged → Distributed) are rejected unless an administrator overrides.

---

## Needs calculation

Implemented in `server/services/reliefEngine.js`.

```text
Projected available = current quantity + incoming quantity
Shortage            = max(required − projected available, 0)
Days of supply      = current / daily consumption   (when consumption is set)
```

Priority is rules-based. Severe disaster level, low days of supply, high population and large shortage raise priority toward CRITICAL. The API returns the reason string. This is not machine learning.

---

## Resource transfer

```text
Proposed → Approved → In Transit → Received
```

On receive: source inventory decreases, destination inventory increases, needs recalculate, audit is written.

---

## Delivery verification

Camp officials enter the quantity that actually arrived.

```text
Discrepancy = expected − received
```

Inventory is updated by **received**, not expected. Discrepancies are stored on `DonationDelivery` and visible to administrators.

---

## Privacy

Public pages show aggregated operations only. They do not publish:

- national ID / citizenship number
- identity documents
- private phone or email
- sensitive addresses
- individual vulnerability categories

---

## Future integration with the alert system

RAHAT **does not** send SMS, push or mass broadcasts. It reads disaster status from the database and can display:

```text
ACTIVE DISASTER
Flood — Level 3
Ward 6
```

A later alert service can write disaster status into the same Disaster record (or call a dedicated ingest endpoint). RAHAT will continue to display that status without becoming the alert engine.

---

## Scripts

| Where | Command | Purpose |
| --- | --- | --- |
| server | `npm install` | Install API dependencies |
| server | `npm run dev` | Nodemon API |
| server | `npm start` | Production API |
| server | `npm run seed:admin` | Seed administrator |
| server | `npm run seed:demo` | Seed demonstration world |
| client | `npm install` | Install portal dependencies |
| client | `npm run dev` | Vite portal |
| client | `npm run build` | Production build |

---

## Licence / note

Hackathon / demonstration system. Seeded records are fictional and labelled **DEMO DATA**. Do not treat this instance as a live government registry.
