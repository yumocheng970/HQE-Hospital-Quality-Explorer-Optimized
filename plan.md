
---

## Milestones

### v0.1 — March 27

| What | Who | Done? |
|------|-----|-------|
| ETL downloads 7 CMS CSVs, loads into `hospital_quality.db`, row counts verified | Yumo | Done |
| `lat`/`lon` geocoded via Census Bureau API for ≥90% of hospitals | Yumo | Done |
| `app.db` with `users` table; two hardcoded accounts (admin, user) with bcrypt passwords | Yumo | Done |
| `GET /api/hospitals` filters by `state` and `name`; returns `400` if no params | Yumo | Done |
| `GET /api/hospitals/:id` returns facility record; `404` for unknown ID | Yumo | Done |
| `GET /api/lookup/states` returns states with hospital counts | Yumo | Done |
| React + Vite scaffolded; Tailwind configured; `/api` proxied to `localhost:3001` | Dawei | Done |
| React Router with routes `/` and `/hospitals/:id` | Dawei | Done |
| `api/index.js` fetch wrapper with error handling | Dawei | Done |
| `SearchPage`: state dropdown, name input, results as `HospitalCard`; loading/error/empty states | Dawei | Done |
| `HospitalDetailPage`: name, address, type, ownership, rating; loading/error states | Dawei | Done |
| `Navbar` with links to Search, Dashboard (placeholder), Map (placeholder) | Ge Ge | Done |
| `HospitalCard` styled with Tailwind | Ge Ge | Done |
| Responsive layout verified at ≥1024px and ≥768px | Ge Ge | Done |
| README with setup instructions | All | Done |
| DECISIONS.md: 3 decisions + 1 debugging story | All ||

### v0.2 — April 3

| What | Who | Done? |
|------|-----|-------|
| `GET /api/stats/ratings-by-state` | Yumo | Done |
| `GET /api/stats/measures/:table` with `measure_id` and `group_by` params | Yumo | Done |
| `GET /api/lookup/measures/:table` | Yumo | Done |
| `DashboardPage` with state dropdown triggering fetch → Observable Plot bar chart re-render | Dawei | Done |
| `HospitalDetailPage` updated with measure data and `compared_to_national` values | Dawei | Done |
| `CompareBadge` component with color coding | Dawei | Done |
| Loading spinners, error messages, empty states throughout | Ge Ge | Done |
| Tailwind consistent across all new components | Ge Ge | Done |
| DECISIONS.md updated | All | |

### v0.3 — April 17

| What | Who | Done? |
|------|-----|-------|
| `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me` | Yumo | |
| `requireAuth` and `requireAdmin` middleware on protected routes | Yumo | |
| `GET /api/export/csv` returns filtered results as CSV download | Yumo | |
| Front end built and served as static files from Flask | Yumo | |
| `SESSION_SECRET` in AWS Parameter Store; loaded at startup | Yumo | |
| `LoginPage` with form, redirect on success, error on failure | Dawei | |
| `ProtectedRoute` redirecting unauthenticated users to `/login` | Dawei | |
| `useAuth` hook exposing current user, login, logout | Dawei | |
| CSV download button on `SearchPage` | Dawei | |
| `MapPage`: Leaflet map via `useRef` + `useEffect`, cleaned up on unmount | Ge Ge | |
| Markers clustered, color-coded by `overall_rating`, popup with name/rating/link | Ge Ge | |
| State dropdown filtering map markers | Ge Ge | |
| Deployed to AWS EC2 t3.micro, accessible at `http://<elastic-ip>:3001` | All | |
| Final README and DECISIONS.md | All | |

---

## Contingencies

| Risk | Contingency |
|------|-------------|
| ETL fails or bad data | Fix column mapping manually; skip geocoding if needed; use ~50 hardcoded hospitals to unblock front end |
| Leaflet + React issues | Build standalone proof-of-concept first; use `key` prop workaround; fall back to PDF scorecard if map fails |
| AWS deployment fails | Deploy minimal API-only version by Week 12; document as known limitation if Parameter Store fails |
| Scope creep | Stretch goals frozen until all v0.3 deliverables done; cut order: additional charts → PDF → map filter |
| Yumo blocked on ETL/API | Dawei and Ge Ge build against mock data, swap in real API calls later |
