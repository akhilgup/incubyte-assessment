# Architecture & Design Decisions

## Overview

This is a Rails 8 monolith with an embedded React frontend. Rails serves JSON APIs and a single HTML shell page. React handles all client-side routing and rendering via Material UI.

```
Browser  -->  Rails Router
                |
                |--> /api/v1/*  -->  JSON API Controllers  -->  SQLite
                |
                |--> /*  -->  PagesController#index  -->  React SPA
```

## Key Decisions

### 1. Monolith over Separate Frontend/Backend

**Choice:** Single Rails project with React bundled via jsbundling-rails (esbuild).

**Reasoning:** For a tool of this scope, a monolith avoids the overhead of managing two deployment targets, CORS configuration, and separate build pipelines. esbuild compiles the entire React app in under 3 seconds.

**Trade-off:** Tighter coupling between frontend and backend deploys. Acceptable at this scale.

### 2. SQLite over PostgreSQL

**Choice:** SQLite as the database.

**Reasoning:** Zero configuration, no external service to manage, sufficient for 10,000 rows. All aggregation queries (GROUP BY, MIN, MAX, AVG) work identically in SQLite.

**Trade-off:** No concurrent write support. For a single-user HR tool, this is not a concern. Migration to PostgreSQL would require only changing `config/database.yml` — no query changes needed.

### 3. insert_all for Seeding Performance

**Choice:** `Employee.insert_all(records)` instead of individual `Employee.create` calls.

**Reasoning:** `insert_all` generates a single SQL INSERT statement for all 10,000 rows, skipping ActiveRecord validations and callbacks. This completes in ~1 second versus ~30+ seconds with individual creates.

**Trade-off:** Validations are bypassed during seeding. Since seed data is generated programmatically with known-good values, this is acceptable. Timestamps must be set manually.

### 4. SQL-Level Aggregations for Insights

**Choice:** All salary statistics (min, max, avg, count, median) are computed in SQL via GROUP BY, not in Ruby.

**Reasoning:** The database engine is optimized for aggregation queries. With proper indexes on `country`, `job_title`, and their composite, these queries execute in single-digit milliseconds even on 10,000 rows.

**Trade-off:** Median requires a slightly more complex query (ORDER + OFFSET + LIMIT) since SQLite lacks a native MEDIAN function.

### 5. Manual Pagination over Gems

**Choice:** Offset/limit pagination implemented directly in the controller.

**Reasoning:** Simple, no gem dependency, and sufficient for the expected dataset size. The implementation is 3 lines of code.

**Trade-off:** Offset-based pagination degrades on very large datasets (100k+ rows). Cursor-based pagination would be needed at that scale.

### 6. Minitest over RSpec

**Choice:** Rails default Minitest for testing.

**Reasoning:** Ships with Rails, zero extra configuration, fast test execution. The test suite (41 tests) runs in under 1 second.

### 7. API Namespace Versioning

**Choice:** All API endpoints under `/api/v1/`.

**Reasoning:** Standard practice that allows future API versions without breaking existing clients. Even for an internal tool, this is good hygiene.

## Database Schema

The `employees` table has indexes on:
- `email` (unique) — fast lookup, enforces uniqueness at DB level
- `country` — filters and GROUP BY in insights
- `job_title` — filters and GROUP BY in insights
- `department` — filters
- `(country, job_title)` — composite index for the country + title drill-down query

## Performance Considerations

- **Seed script:** Uses bulk insert (~1s for 10k rows)
- **API queries:** All filtered/sorted queries hit indexed columns
- **Aggregation queries:** GROUP BY on indexed columns, computed in SQL
- **Frontend bundle:** ~2.1MB unminified (React + MUI). In production, esbuild minification and gzip would reduce this significantly
- **Pagination:** Default 25 rows per page, max 100, preventing large payloads

## What I Would Add With More Time

- **Authentication:** Devise or a simple session-based auth for the HR Manager
- **Export:** CSV/Excel export of employee data and salary reports
- **Charts:** Recharts or Chart.js visualizations on the insights dashboard
- **Audit log:** Track who changed what employee record and when
- **Production config:** Minified builds, CDN for assets, PostgreSQL for concurrent access
