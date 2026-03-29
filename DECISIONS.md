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

## v0.2

### Decision 1: Handle each measure table separately (Accepted)

**Date:** 2026-03-26
**Decision:** Write separate query logic for each measure table instead of one shared query.
**Reasoning:** I checked the schemas and found the tables are quite different. `patient_experience` uses `hcahps_measure_id` instead of `measure_id`. `readmissions` does not have `score` or `compared_to_national` at all. It was easier to just handle each table on its own.

---

### Decision 2: Only show CompareBadge when data has `compared_to_national` (Accepted)

**Date:** 2026-03-27
**Decision:** The frontend checks if `compared_to_national` exists in the response before rendering CompareBadge, instead of hardcoding a list of tables.
**Reasoning:** Only `complications` and `infections` have this field. If we hardcode the table names on the frontend, we have to update it every time we add a table. Checking the data directly is simpler.

---

### Decision 3: Add `facility_id` param to stats endpoint instead of making a new one (Accepted)

**Date:** 2026-03-27
**Decision:** Added `facility_id` as an optional query parameter to `/api/stats/measures/<table>` so the detail page can use it too.
**Reasoning:** The detail page needs measure data for one specific hospital. We thought about making a new endpoint like `/api/hospitals/<id>/measures/<table>` but it would do the same thing. Not worth the extra work right now.
