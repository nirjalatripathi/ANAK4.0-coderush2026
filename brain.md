# RAHAT — brain.md

This file is the working memory of the system: why it exists, how the pieces fit, how security is enforced, and how to demonstrate it without breaking character.

---

## 1. Mission

**Know the disaster. Declare safety. Move people to safety. Coordinate the right relief where it is needed most.**

RAHAT is not a news site and not a social network. It is a government-style coordination desk with three hard problems:

1. **Family separation** — victims often have no phone, SIM, internet, password or documents. They must still be findable.
2. **Unregistered people** — tourists, migrants and people who never enrolled are not “missing from the database”; they enter a dedicated UNREG workflow.
3. **Poor relief coordination** — donations follow calculated shortages (required − current), not the most visible camp.

---

## 2. Non-negotiable product rules

- A citizen does **not** need to log in to be found or checked into a camp.
- Citizens never access the Admin panel or Admin APIs.
- Camp officials never receive unrestricted admin power.
- Admin access is a real seeded account + JWT + server-side `role === admin`.
- There is no skip-login, hidden password, or `?role=admin` bypass.
- The frontend never assigns a role. Registration always creates `citizen`.
- Identity documents are never public.
- Dashboard numbers come from MongoDB. Empty data shows `0`.
- Shortage is calculated, never typed in as a vanity statistic.
- When a donation is **Received**, inventory `current` increases and shortage is recalculated.

---

## 3. Architecture

```text
React pages
  → Axios services (token from localStorage)
    → Express routes
      → auth / role / upload middleware
        → controllers (HTTP)
          → services (rules)
            → Mongoose models
              → MongoDB
```

`server/index.js` only boots Express, CORS, JSON, static profile uploads, route mounts and error handlers. It does not contain business logic.

### Why services exist

Controllers must stay thin. Status changes, verification decisions, disaster activation, inventory shortage math and audit writes are reused by seeders, camp officials and admins. Those live in `server/services/`.

---

## 4. Data model (conceptual)

```text
User ── role: citizen | camp_official | local_admin | admin
  ├─ Citizen ── Household ── members[] + relationships
  │    ├─ IdentityDocument (private)
  │    └─ PersonStatusHistory
  └─ CampOfficial ── ReliefCamp
                         ├─ CampInventory ── ReliefNeed (derived)
                         ├─ Donation
                         └─ UnregisteredPerson ── possible Citizen / Household

Disaster ── activeCamps[]
EmergencyReport ── citizen | official | third party
Notification
AuditLog
```

IDs are sequential per year:

| Entity | Pattern |
| --- | --- |
| Citizen | `CIT-YYYY-NNNNNN` |
| Household | `HH-YYYY-NNNNNN` |
| Unregistered | `UNREG-YYYY-NNNNNN` |
| Camp | `CAMP-YYYY-NNNN` |
| Disaster | `DIS-YYYY-NNNN` |
| Official | `OFF-YYYY-NNNN` |
| Donation | `DON-YYYY-NNNNNN` |
| Emergency | `SOS-YYYY-NNNNNN` |

Counters live in the `Counter` collection so seeders and live creates do not collide.

---

## 5. Authentication and roles

### Login paths

| Who | UI | API |
| --- | --- | --- |
| Citizen / official | `/login` | `POST /api/auth/login` |
| Administrator | `/admin/login` only | `POST /api/auth/admin/login` |

Admin login additionally requires `user.role === admin`. A citizen password on that form receives **Access Denied — Administrator privileges required.**

### Token

JWT payload: `{ id, role }` copied from the database at login time. Changing `localStorage` cannot mint an admin role because the next API call verifies the signature and the user row.

### Frontend lock

- Public navbar has no Admin or Camp Official links.
- `/admin/*` (except `/admin/login`) uses `RoleRoute` with `adminLock`.
- Unauthenticated or non-admin visitors see **Access Denied — Administrator privileges required.**
- Backend repeats the same check on every `/api/admin/*` route.

### Camp official scope

Officials may search the registry (that is the product: find people who cannot log in) and manage **their assigned camp** inventory. They cannot open audit logs, system settings, or create disasters.

### Deceased status

Only `admin` may record `Deceased`.

---

## 6. Age-based verification

`dateOfBirth` decides required documents:

| Age | Required |
| --- | --- |
| Under 16 | Birth Certificate + Recent Photograph |
| 16+ | Citizenship Certificate **or** National ID + Recent Photograph |

Statuses: `Pending Verification` → `Verified` | `Rejected` | `Requires Resubmission`.

Only an administrator changes verification status. That write updates documents, creates an audit log, and notifies the citizen.

Documents are stored under `server/uploads/identity-documents/` and are **not** mounted as public static files. They stream through `GET /api/admin/documents/:docId` after admin JWT verification.

Profile photographs and unregistered photographs are less sensitive and are served from `/uploads/profile-images` and `/uploads/unregistered`.

---

## 7. Finding a person (core loop)

1. Family is already in the registry (seeded household `HH-2026-000001`).
2. Disaster mode is active, so the public banner appears.
3. A camp official opens **Search citizen** and queries name, registration ID, household ID, national ID, DOB or phone.
4. Official sets status (`Found`, `In Relief Camp`, `Hospitalized`, `Transferred`, `Missing`) and location / camp.
5. Service layer:
   - updates `Citizen.disasterStatus`, `currentCamp`, `lastKnownLocation`
   - writes `PersonStatusHistory`
   - writes `AuditLog`
   - recounts camp population
   - notifies other household members when possible
6. Public Missing & Found shows only approved fields.
7. The household page (citizen login, if anyone still has access) shows the new statuses.

No member of the separated family needs to authenticate for this to work.

---

## 8. Unregistered people

Camp official creates a record. Server issues `UNREG-YYYY-NNNNNN` and status `Unverified`.

Administrator may later:

- match to an existing citizen
- match to a household
- verify the UNREG record
- convert into a new citizen (and optionally attach to a household)

This is a different object from `Citizen` on purpose. Do not collapse it into “missing”.

Seeded demonstration record: **`UNREG-2026-000245`** — Daniel Foster, visitor at Camp B.

---

## 9. Inventory → shortage → donation

```text
CampInventory.current
CampInventory.required
shortage = max(0, required - current)
priority = ratio of shortage / required
  ≥ 0.7 or current 0 → CRITICAL
  ≥ 0.4 → HIGH
  > 0 → MEDIUM
  else LOW
```

`ReliefNeed` rows are rebuilt whenever inventory changes. The public Donations table reads those published needs.

Donation lifecycle:

1. **Pledged** — `incoming += quantity`
2. **In Transit** — no stock change
3. **Received** — `current += quantity`, `incoming -= quantity`, `inventoryUpdated = true`, audit + notification
4. **Distributed** — `distributed += quantity`

Demo starting point for Camp A blankets: current **100**, required **500**, shortage **400**. A pledge of **200** then Received yields current **300**, shortage **200**.

---

## 10. Disaster mode

If any public disaster has `status: Active`, the API reports `disasterMode: true`. The public navbar banner shows **DISASTER ACTIVE** and the disaster name. The homepage statistics still come from live counts.

Seeded disaster: **Kathmandu Valley Coordination Exercise** (`DIS-2026-0001`). It is labelled as a demonstration record, not a live government declaration.

---

## 11. Seeded demonstration world

After `npm run seed:demo` in `server/`:

### Household HH-2026-000001 — Shrestha family

| Person | ID | Intended demo update |
| --- | --- | --- |
| Ram Bahadur Shrestha (Father, head) | CIT-2026-000001 | Found → Camp A |
| Sita Devi Shrestha (Mother) | CIT-2026-000002 | Found → Camp B |
| Anisha Shrestha (Daughter, child) | CIT-2026-000003 | Found → Camp C |
| Hari Bahadur Shrestha (Grandparent, elderly) | CIT-2026-000004 | Hospitalized |

All four start as **Missing** so the live update is visible.

### Camps

| ID | Name | Official |
| --- | --- | --- |
| CAMP-2026-0001 | Camp A — Bhaktapur Emergency Shelter | official.a@rahat.gov.np |
| CAMP-2026-0002 | Camp B — Kathmandu Central Relief Camp | official.b@rahat.gov.np |
| CAMP-2026-0003 | Camp C — Lalitpur Community Shelter | official.c@rahat.gov.np |

### Extra citizen

`citizen.demo@rahat.test` / `CIT-2026-000010` — Nisha Karki, pending verification, used to show a normal citizen desk with **no** admin controls.

---

## 12. Hackathon script (10 minutes)

1. Open `/` — hero, mission, live stats.
2. Open Missing & Found — Shrestha family appear as Missing (privacy-safe).
3. Open Donations — Camp A blankets 100 / 500 / 400 HIGH.
4. Sign in `/admin/login` as `admin@rahat.gov.np`. Show dashboard numbers, verification queue, audit log, disasters.
5. Sign out. Sign in as `official.a@rahat.gov.np`. Search `HH-2026-000001` or `Ram Bahadur`. Mark Found, Camp A.
6. Repeat conceptually for Camp B / C / hospital (or do two live and narrate the rest).
7. Return to Missing & Found — statuses changed.
8. As a public donor, pledge 200 blankets to Camp A.
9. As admin, move that donation Pledged → In Transit → Received. Show inventory 300 / 500 / 200.
10. Open Unregistered at Camp B: `UNREG-2026-000245`. Admin verifies / matches.
11. Sign in as `citizen.demo@rahat.test` and visit `/admin/dashboard` — Access Denied.

---

## 13. UI principles

The portal is meant to feel like a calm official desk:

- Navy, white, gray, gold for authority
- Controlled red for SOS / disaster / missing
- Green for found / verified
- Amber for pending
- Source Serif 4 for titles, IBM Plex Sans for body, IBM Plex Mono for IDs
- Large hit targets, plain language, no glassmorphism, no startup gradients
- No graphic injury imagery

Public pages use `PublicLayout` (navbar + footer). Role desks use `AppShell` + sidebar. Admin and camp links are absent from the public navbar.

---

## 14. Environment and secrets

Never commit real production secrets. `server/.env` is local-only. Frontend has **no** admin password. Demo passwords exist only in server environment variables and this documentation for judges.

If you deploy, rotate:

- `JWT_SECRET`
- `ADMIN_PASSWORD`
- official / citizen demo passwords
- `MONGO_URI`

---

## 15. What not to “simplify” later

- Do not store role in a public form field.
- Do not serve `/uploads/identity-documents` statically.
- Do not let camp officials write `Deceased`.
- Do not show phone / national ID on Missing & Found.
- Do not hardcode dashboard statistics in React.
- Do not merge UnregisteredPerson into Citizen just to save a collection.
- Do not put Admin in the public navbar to “make the demo easier”. Use `/admin/login`.

---

## 16. Local runbook

```bash
# MongoDB must be running
cd server
npm install
npm run seed:demo
npm run dev

# new terminal
cd client
npm install
npm run dev
```

Portal: http://localhost:5173  
API: http://localhost:5000/api/health
