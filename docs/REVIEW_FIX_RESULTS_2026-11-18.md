# BayGo review-fix verification — 18 November 2026

## What is complete locally

- Shared per-person full-trip cost accounting, editable budget and food/drink allowances, explicit unknown/free distinction, currency-conversion assumptions, budget balances and range classification.
- Every selected plan has outbound, all local legs and final campus-return accounting. Cross-city stages are explicitly represented instead of ordinary local-navigation claims.
- Five-city ready-made route discovery by place category and whole-trip budget status. The original Zhuhai reference packages retain their fixed inclusions, and custom/curated routes use editable assumptions.
- Stop reordering, transport-mode selection and manual fare/time edits refresh the cost/time summary; changing transport mode clears the old manual quote to prevent stale fare/time reuse.
- Departure/return, planned stops and additional buffer are included in the time estimate. Missing travel times prevent an estimated return from being confirmed. Overnight plans are not supported.
- Empty Return By persists. Directed cache, three-request concurrency, cancellation, optional-field validation and individual refresh are implemented.
- Shared Student Stories route snapshots now retain the captured trip total/completeness as well as existing per-stop references. Old published snapshots remain readable; copying stops into a new planner recalculates instead of importing stale costs.
- Optional backend is prepared with ID allowlist, CORS, runtime-secret isolation, cache, coalescing, timeouts and per-isolate rate limit. It has not been deployed.

## Amap queries actually performed

- `/v5/place/text`, keyword Zhuhai Huafa Mall: **10000 / OK**.
- Exact Huafa Mall POI: `B0FFFFZ2VB`; address Zhuhai Avenue 8; GCJ-02 `113.510858,22.224557`. Existing directory point matched this response.
- Restaurant/venue candidate searches also returned 10000. Two Tangjia restaurant branch identities and the Opera House search match were not sufficiently established for automatic replacement. Similar-name listings elsewhere were not substituted. Existing reference labels remain.
- No credential is included in the project, report or archive.

- Saved **136 directed legs**, all with at least one returned navigation option; **356 transport options** overall.
- Walking: 133 returned options.
- Public transport: 105 returned options.
- Driving / taxi: 118 returned options.
- Public-transport options with a returned fare: 105.
- These are query-time snapshots, not current/future-date live navigation. Arbitrary new pairs may not be covered. Return legs were queried separately; reverse results are not invented.

### Query failures

Some individual mode requests timed out. These are local network failures, **not Amap error codes**, and do not establish an invalid credential. Their sanitized records are:

| Endpoint | Recorded status | Count |
| --- | --- | ---: |
| `/v5/direction/driving` | `NETWORK_ERROR` (no Amap response received) | 18 |
| `/v5/direction/transit/integrated` | `NETWORK_ERROR` (no Amap response received) | 6 |
| `/v5/direction/walking` | `NETWORK_ERROR` (no Amap response received) | 3 |

Returned successful options are retained even if another mode fails. A successful response without a route is displayed as unavailable, not as zero distance/time. No straight-line distance is used as a navigation estimate.

## Tests actually run

Passed:

- `scripts/verify-phase1.mjs`: existing navigation, place selection, duplicates, city isolation, checklists, reset and save-failure behavior.
- `scripts/verify-prices.mjs`: branch/source validation, historical dates, admission and unknown/free distinction; compatibility of legacy per-stop references.
- `scripts/verify-trip-budget.mjs`: hand-checked CNY 58–80 sample; budgets 57, 58, 70, 80, 81; missing/reversed/empty ranges; HKD/MOP conversions; free foreign-currency entries; meal deduplication; all-city forward/return stages; preserved empty Return By; incomplete routes excluded from within-budget matching; stale manual quote clearing.
- `scripts/verify-routing.mjs`: maximum three concurrent tasks, directed cache reuse, explicit refresh, abort, saved fallback and unknown pair handling.
- `scripts/verify-backend.mjs`: controlled provider responses for ID whitelist, CORS, cross-city rejection, missing secret, transit_fee parser, unknown taxi fares, caching and per-isolate limit. This is a local backend logic test, not a deployed service test.
- `scripts/verify-community.mjs`, `verify-permits.mjs`, `verify-travel-guides.mjs`, `verify-stories.mjs`: retained feature regressions including publication, applications, guide checklists and route sharing.
- `scripts/verify-dom.cjs` with jsdom and a local HTTP server: real HTML DOM initialization; four route cards including departure/return; saved options actually rendered; no duplicate IDs; settings/fare/time form submission; reordering; mode changes; all-city route pages. This is DOM integration testing, not rendered-browser layout testing.

## Verification not completed

- Chrome headless could not launch in this environment. Mobile/desktop rendered layout, visual screenshots and complete photo loading remain to be checked in a real browser.
- No frontend files have been uploaded to GitHub by this task. The existing public website remains unchanged until the team uploads this release.
- No backend account or deployment secret was supplied/installed. Public backend availability and GitHub Pages-to-backend CORS have not been verified.
- Coach availability, every cross-border connection, exact border queues, last services, full five-city sample ticket costs and all 85 place images have not been validated. These are remaining verification tasks, not confirmed defects or completed checks.

## Changed/added runtime files

`app.js`, `index.html`, `styles.css`, `stories.js`; new `budget.js`, `trip-planning.js`, `route-client.js`, `routing-snapshot.js`. Existing content, photo assets and other features are retained. `backend/` is a separate optional deployment, not executed by GitHub Pages. Query scripts, tests, credential-free POI candidates and handoff documents are included for maintainers.

## Updating

Follow `START_HERE_UPDATE.md` in the archive. Upload the archive contents into the existing repository root; do not upload the ZIP itself or add a parent folder. Same-path files replace old versions. The public frontend contains no provider credential. For live routing follow `backend/README.md` only after the team authorises a permanent server-side secret.
