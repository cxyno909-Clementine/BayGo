# BayGo

English travel and lifestyle prototype for BNBU students, hosted on GitHub Pages. Preserves existing five-city content. The original BayGo 3 project is retained separately.

## Update the existing website

Repository: https://github.com/cxyno909-Clementine/BayGo
Site: https://cxyno909-clementine.github.io/BayGo/
The November 18 review fixes in this local release have not yet been uploaded. Follow START_HERE_UPDATE.md. Upload the extracted files into the existing repository root. Do not upload the ZIP itself, create a second repository or add an enclosing directory. Keep Pages on main and /(root).

Runtime files: index.html, styles.css, config.js, budget.js, route-client.js, trip-planning.js, routing-snapshot.js, content.js, places.js, prices.js, transit.js, curated.js, community.js, permits.js, travel-guides.js, stories.js, app.js and the complete assets folder. Navigation uses hashes and relative asset paths.

## November 15 improvements (retained)

- Planning: duplicate prevention, selected-state buttons, direct route entry and bilingual place search preserving selection.
- Life: individual preparation checkboxes and official-source Hong Kong/Macao permit guide with service and household-registration branches.
- Intercity travel: eight English guides covering AA/Dudu coaches, domestic/cross-boundary ferries, bridge shuttles, boundary rail and Macao local transport; booking instructions, conditional concessions and source links. Available from Life in all five cities.
- Prices: 7 matched historical food-spend references and 4 official admission references; unknown prices remain unknown, currencies separate and trip subtotals explicitly partial.
- Community: categories, strict find/create matching, retained drafts, local publication/cancellation, carpool details, group applications, local inbox/messages and explicit simulated host-decision controls.
- Student Stories: write/preview/publish local posts, tag directory places, add per-place dishes/tips, edit/unpublish and share a saved route snapshot from all route-detail screens. Draft conflicts preserve the previous draft; route imports have undo.
- Filter reset is separated from the apply action.

## Prototype limitations

Sign-in and campus verification are simulated. Published activities, applications, messages, reports, checklists, saved items and plans stay in this browser. No other student receives them. Accept/decline controls are local demonstrations, not host replies. Real identity checks, concurrent seat management, cross-user messaging and moderation require a backend.

GitHub Pages cannot run the retained Worker/Python backend. Dated saved segment estimates are included for queried pairs. Live segment estimates require a separately deployed backend configured in config.js. Reference routes and prices are not live quotes. Amap embeds/links and remotely hosted photos require internet; mainland access must be checked on the presentation network.

Never put API credentials in this public repository. The optional price-refresh script reads an authorised Amap key locally only when --live is explicitly selected; that live path was not exercised for this release.

## Checks

Passed logic/HTML checks with DOM substitutes: scripts/verify-phase1.mjs, verify-prices.mjs, verify-community.mjs, verify-permits.mjs and verify-travel-guides.mjs. Price evidence-selection tests passed in scripts/verify-price-import.py. Real-browser layout, actual network access and post-upload live-site verification remain outstanding.

See docs/IMPLEMENTATION_PLAN_2026-11-15.md and phase results for implementation scope, sources and remaining checks. Use START_HERE_UPDATE.md for publishing and presentation verification.

## November 18 review fixes

Whole-trip accounting and editable allowances now include every outbound/local/return leg. Missing fares and FX rates stay incomplete. Curated routes in all five cities use the same accounting module. Directed Amap snapshots display their query date; arbitrary pairs require the optional backend. See docs/REVIEW_FIX_PLAN_2026-11-18.md and backend/README.md for implemented scope and remaining live-deployment work.
