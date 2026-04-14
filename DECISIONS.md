# Decision Records

## v0.1

### Decision 1: Backend Framework — Flask (Accepted)

**Date:** 2026-03-19
**Decision:** Use Flask as the backend framework.
**Reasoning:** ETL is already in Python, so it made sense to keep the backend in the same language and the same conda environment (`hqe`). We only needed 3 endpoints for v0.1, so a heavier framework like FastAPI or Django was not worth it.

**Trade-offs**

- No built-in request validation, so we have to check inputs manually.

---

### Decision 2: Centralized db.py with row_factory (Accepted)

**Date:** 2026-03-20
**Decision:** Put all database connection code in `server/db.py` and use `sqlite3.row_factory = sqlite3.Row`.
**Reasoning:** `sqlite3.Row` lets us call `dict(row)` on query results, which makes it easy to return JSON. Putting the connection in one file means we do not have to repeat the path and settings in every route file.

**Trade-offs**

- No connection pooling, but this is fine for SQLite.

---

### Decision 3: Column Name Assumptions — Dead End (Resolved)

**Date:** 2026-03-20
**What happened:** I wrote the first queries using column names like `hospital_name`, `city`, and `provider_id` because I thought that was how CMS named them. The first curl request failed with:

```
sqlite3.OperationalError: no such column: hospital_name
```

**Resolution:** Ran `.schema hospitals` in sqlite3 and checked the real column names. They are `facility_name`, `city_town`, and `facility_id`. Fixed all queries.

**Lesson:** Check the actual schema before writing queries.

---

### Decision 4: facility_id Type Mismatch — Dead End (Resolved)

**Date:** 2026-03-20
**What happened:** After fixing the column names, queries on `readmissions` and `payment` returned empty arrays even for hospitals that had data. I checked the schema again and found that these two tables store `facility_id` as INTEGER, while all other tables store it as TEXT. So the equality check was not matching anything.

**Resolution:** Changed `_fetch()` to use `CAST(facility_id AS TEXT) = CAST(? AS TEXT)` on both sides.

---

---

v0.1 — Dawei Feng

### Decision 5: URL-Driven Search with useSearchParams (Accepted)

**Date:** 2026-03-22
**Decision:** Use React Router's useSearchParams to store search state in the URL instead of component state alone.
**Reasoning:** If search state only lives in useState, navigating to a hospital detail page and pressing Back loses the search results — the component remounts with empty state. Putting the parameters in the URL (?name=General&state=CA) means the useEffect can re-fetch on mount using whatever is in the URL. It also means users can share or bookmark a search.

**Trade-offs**

- Every Back navigation re-fetches from the server. Could add client-side caching later but not worth the complexity for v0.1.

---

### Decision 6: Two-Step Search — Local State Then URL Update (Accepted)

**Date:** 2026-03-22
**Decision:** Typing in the search box updates local useState only. The actual search is triggered by updating the URL via setSearchParams when the user clicks Search or presses Enter.
**Reasoning:** If every keystroke triggered a fetch, we would spam the API on every character typed. Separating input state from search state means the user can type freely and only commit when ready. The useEffect watching searchParams handles the rest.

---

### Decision 7: Sync Local State from URL in useEffect (Accepted)

**Date:** 2026-03-22
**Decision:** Inside the useEffect that watches searchParams, manually call setSearchName and setSelectedState to sync the input fields with the URL.
**Reasoning:** useState initial values only apply on first mount. If the user navigates back, the component remounts with the correct URL but useState does not re-read the initial value in all cases. Explicitly syncing inside the effect guarantees the input box and dropdown always match the URL, regardless of how the user arrived at the page.

---

## v0.2

### Decision 1: Handle Each Measure Table Separately (Accepted)

**Date:** 2026-03-26
**Decision:** Write separate query logic for each measure table instead of one shared query.
**Reasoning:** I checked the schemas and found the tables are quite different. `patient_experience` uses `hcahps_measure_id` instead of `measure_id`. `readmissions` does not have `score` or `compared_to_national` at all. It was easier to just handle each table on its own.

---

### Decision 2: Only Show CompareBadge When Data Has `compared_to_national` (Accepted)

**Date:** 2026-03-27
**Decision:** The frontend checks if `compared_to_national` exists in the response before rendering CompareBadge, instead of hardcoding a list of tables.
**Reasoning:** Only `complications` and `infections` have this field. If we hardcode the table names on the frontend, we have to update it every time we add a table. Checking the data directly is simpler.

---

### Decision 3: Add `facility_id` Param to Stats Endpoint Instead of Making a New One (Accepted)

**Date:** 2026-03-27
**Decision:** Added `facility_id` as an optional query parameter to `/api/stats/measures/<table>` so the detail page can use it too.
**Reasoning:** The detail page needs measure data for one specific hospital. We thought about making a new endpoint like `/api/hospitals/<id>/measures/<table>` but it would do the same thing. Not worth the extra work right now.

---

---

v0.2 — Dawei Feng

### Decision 4: Extract Shared Components Before Building New Pages (Accepted)

**Date:** 2026-04-01
**Decision:** Extract Spinner, ErrorMessage, and EmptyState into components/common/ and write a shared useFetch hook in hooks/ before starting Dashboard or QueryPage.
**Reasoning:** Both my pages (Dashboard, QueryPage) and my teammate's Detail page upgrade need loading, error, and empty states. Building these first avoids duplication and gives us a consistent look across the app. My teammate can import them directly into HospitalDetailPage.

---

### Decision 5: Observable Plot with useRef + useEffect (Accepted)

**Date:** 2026-04-01
**Decision:** Render Observable Plot charts by targeting a useRef container inside a useEffect, rather than trying to use Plot as a React component.
**Reasoning:** Observable Plot is not a React library — it returns a DOM node. The recommended pattern from the technical spec is to use useRef to get a container div, then call Plot.plot() inside useEffect and append the result. Tried to find a React wrapper but none were well-maintained. This approach is explicit and easy to explain in the walkthrough.

**Trade-offs**

- Have to manually clean up the previous chart on re-render (remove the old child node before appending the new one).

---

### Decision 6: Template Matching with Regex in parseQuery.js (Accepted)

**Date:** 2026-04-01
**Decision:** Parse user queries using regular expressions in a standalone utils/parseQuery.js file, mapping matched patterns to API parameters.
**Reasoning:** The spec requires Level 2 template matching before any LLM integration. Regex handles patterns like "hospitals in [state] with [rating] stars" well enough. Keeping the parsing logic in a utility file separates it from the UI component (QueryBar.jsx) and makes it testable on its own.

**Trade-offs**

- Limited to patterns we explicitly define. Anything outside our templates returns a "not understood" message. This is expected at Level 2.

---

### Decision 7: Chat-Style UI for Query Interface (Accepted)

**Date:** 2026-04-01
**Decision:** Display query results in a chat-style conversation layout instead of replacing the results inline.
**Reasoning:** The spec says "chat-style input." Showing the user's question and the system's response as a conversation thread makes it clear what was asked and what was returned, especially when the user asks multiple questions in a row.

---

v0.2 - Iris Ge

### Decision 8: Centralized Loading / Error / Empty State Handling with Shared Hook (Accepted)

**Date:** 2026-04-02
**Decision:** Extract loading, error, and empty states into shared components (Spinner, ErrorMessage, EmptyState) and create a reusable useFetch hook for all API calls.
**Reasoning:** Multiple pages (Search, Dashboard, Detail) need to handle the same async states. Without abstraction, each page would repeat useState + useEffect logic and UI patterns. By centralizing both data fetching (useFetch) and UI states (common components), we ensure consistent behavior and appearance across the app. It also reduces boilerplate and makes it easier for teammates to integrate without rewriting fetch logic.

**Trade-offs**

- Less flexibility for highly customized fetch behavior (e.g., manual retries or special caching strategies).
- useFetch abstracts away details, which can make debugging slightly harder if something goes wrong.

## v0.3

### Decision 1: Zipcode-Based Geocoding Instead of Census API (Accepted)

**Date:** 2026-04-08

**Decision:** Add lat/lon to the hospitals table by joining against a free zipcode-to-coordinates CSV instead of calling the Census Bureau Geocoding API.

**Reasoning:** The original plan used the Census API, but it requires one HTTP request per hospital (5,400+ hospitals), which would take a long time and could hit rate limits. The zipcode CSV approach is a single download and a pandas merge — it ran in seconds. Most data of all hospitals are matched, which is good enough for a map view.

**Trade-offs:** Zipcode centroids are less accurate than street-level geocoding. For a map showing hospital distribution this is fine, but it would not work for precise routing or proximity search.

---

### Dead End 2: CSV Endpoint Returning HTML Instead of CSV (Resolved)

**Date:** 2026-04-08

**What happened:** After implementing /api/export/csv, the endpoint was returning an HTML page instead of a CSV file. I assumed the issue was with the cookie path — the cookies.txt file was in the wrong directory, so the session was not being sent and require_auth was redirecting to an error page.

**Resolution:** Checked the server logs and found a 500 error, not a 401. The real problem was a typo in export.py: writer.writerows([dict(row) for r in rows]) — the variable inside the list comprehension was row but the loop variable was r. Flask was returning its default error page because the endpoint was crashing before it could return anything. Fixed the typo and the CSV downloaded correctly.
**Lesson:** Check the server logs before assuming the problem is in the request. The HTTP status code tells whether it is an auth issue (401) or a server crash (500).

## v0.3 — Dawei Feng

### Decision 3: AuthContext Instead of a Plain Hook (Accepted)

**Date:** 2026-04-11
**Decision:** Implement authentication state using React Context (`AuthProvider` + `useAuth`) rather than a standalone hook that each component calls independently.
**Reasoning:** Multiple parts of the app need the current user: the SearchPage header (show username / sign-in link), the CSV export button (only visible when logged in), and potentially ProtectedRoute. If each component called `/api/auth/me` on its own, we would have duplicate requests and inconsistent state — one component could think the user is logged in while another hasn't finished checking yet. Context gives every component the same `user` object from a single source of truth.

**Trade-offs**

- Any state change in AuthContext re-renders all consumers. For a simple `user` object that rarely changes, this is not a problem.

---

### Decision 4: credentials: 'include' on All Fetch Calls (Accepted)

**Date:** 2026-04-11
**Decision:** Add `credentials: 'include'` to every `fetch` call — both in the shared `useFetch` hook and in the standalone CSV download function.
**Reasoning:** The Vite dev server runs on `localhost:5173` and the Flask backend on `localhost:3001`. This is a cross-origin setup, and browsers do not send cookies cross-origin by default. Without `credentials: 'include'`, the session cookie from login never reaches the backend, so every authenticated request would return 401. Discovered this during initial testing when login succeeded but `/api/auth/me` immediately returned "Not logged in."

---

### Decision 5: CSV Export Uses Raw fetch Instead of useFetch (Accepted)

**Date:** 2026-04-11
**Decision:** The CSV download button calls `fetch` directly in an event handler instead of using the shared `useFetch` hook.
**Reasoning:** `useFetch` is designed for JSON data that gets stored in state and rendered on the page — it calls `res.json()` automatically and re-fetches when its dependency changes. CSV export is different: it returns a binary blob, it only fires once when the user clicks, and the response triggers a browser download instead of a state update. Forcing this through `useFetch` would mean adding blob support, manual trigger mode, and download logic to a hook that is currently simple and single-purpose. A standalone `fetch` in the click handler is clearer and keeps `useFetch` focused.

---

### Decision 6: ProtectedRoute Built but Not Yet Wired (Accepted)

**Date:** 2026-04-11
**Decision:** Create a `ProtectedRoute` component that checks login status and optionally checks role, but do not wrap any current routes with it.
**Reasoning:** The v0.3 requirement is role-based access, not page-level restriction. All pages (search, detail, dashboard, map) are publicly viewable — the only feature gated behind login is CSV export, which is controlled at the button level (hidden when `user` is null). ProtectedRoute is ready if we later add an admin-only page, but adding it now to routes that don't need it would break the app for unauthenticated users who should still be able to browse.

---

### Decision 7: Hospital Type Chart — Frontend-First with Agreed API Contract (Accepted)

**Date:** 2026-04-12
**Decision:** Build the hospital type distribution chart on the dashboard before the backend endpoint exists, using `useFetch` pointed at the agreed-upon path `/api/stats/types-by-state`.
**Reasoning:** The backend teammate had not finished the endpoint yet, but we agreed on the contract: `GET /api/stats/types-by-state` returns `[{ state, hospital_type, count }]`. Since `useFetch` returns `null` when a request fails, and the `useEffect` that renders the chart has a guard (`if (!filteredTypes) return`), the page does not crash — the second chart simply does not appear until the endpoint is live. This let me develop and test the chart layout, the aggregation logic, and the shared state dropdown without waiting on the backend.

**Trade-offs**

- If the backend returns a different shape than agreed, the chart will silently show nothing. Need to verify once the endpoint is deployed.
