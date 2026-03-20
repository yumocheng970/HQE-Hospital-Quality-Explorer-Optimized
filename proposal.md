=# Project Proposal
==


## Team

All three members are beginners to full-stack web development. This is the first full-stack project for everyone.

---

## Project

A web app that consolidates CMS hospital quality data into a single searchable platform. Currently, analysts must download and cross-reference 10+ CSV files manually. Our app replaces that with a unified search, detail view, dashboard, and map.

---

## Technical Design

**Back end:** Python 3.12 + Flask. Chosen because it was covered in this course and all three members are more comfortable in Python than JavaScript.

**Front end:** React + Vite, Tailwind CSS. Tailwind chosen over CSS Modules for faster development and easier consistency across team members.

**Data:** 7 CMS CSV files downloaded by an ETL script, cleaned, and loaded into SQLite. Two databases: `hospital_quality.db` (ETL-generated, read-only) and `app.db` (users and sessions, read-write). All tables join on `facility_id`.

**Routes:**

| Route | Page |
|-------|------|
| `/` | Search |
| `/hospitals/:id` | Detail |
| `/dashboard` | Charts |
| `/map` | Map |
| `/login` | Auth |

---

## Scope

**v0.1 (Mar 27):** Search by state/name, hospital detail page, Flask API running, responsive layout, README, DECISIONS.md.

**v0.2 (Apr 3):** Dashboard with Observable Plot chart, detail page with measure data and national comparisons, loading/error/empty states.

**v0.3 (Apr 17):** Login with role-based access, CSV export, map view with Leaflet, AWS EC2 deployment.

**Stretch goals:** PDF scorecard, additional dashboard charts, pagination.

**What we expect to find hard:** ETL geocoding, Leaflet + React `useRef` integration, AWS deployment.

---

## Roles
*Roles are tentative and subject to change as we learn more about the codebase.*

| Area | Owner |
|------|-------|
| ETL + Flask API + auth | Yumo Cheng|
| Search page, detail page, dashboard | Dawei Feng |
| Map view, UI layout, Tailwind design | Ge Ge |
| AWS deployment, DECISIONS.md | All |

---

## Risks

- **ETL produces bad data** → run early, validate row counts, use mock data to unblock front end if needed.
- **Leaflet + React integration** → build proof-of-concept in isolation first; fall back to PDF scorecard if map fails.
- **AWS deployment** → start Week 11, deploy minimal version first; document as known limitation if Parameter Store fails.

---

## Wireframes

See `docs/` for hand-drawn sketches of Search, Detail, Dashboard, and Map pages.