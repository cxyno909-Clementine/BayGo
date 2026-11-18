# BayGo review fixes — 18 November 2026

## Scope and baseline

The two supplied review/handoff documents contain the same feedback. The local app.js, places.js and config.js matched the public GitHub Pages versions before editing. This release edits the existing five-city prototype and preserves Community, Student Stories, Life and existing assets. The original BayGo 3 folder is unchanged.

## Execution plan and implemented design

1. Validate Amap POI search 2.0 with Zhuhai Huafa Mall. Continue only after `10000 / OK`. Keep the credential in query-process memory. Persist only credential-free POI and directed-route results.
2. Share per-person cost accounting between custom itineraries, curated routes and the original Zhuhai recommendation matcher. Include campus departure, local legs, campus return, planned meals, cafe/snack visits and standard admission. Unknown amounts do not become zero. Keep shopping and optional activities outside the selected plan.
3. Add editable total budget, meal/drink counts and allowances, stop-duration assumptions, additional travel buffer, departure and optional return time. A historical food spend is counted once; extra allowance is headroom, not an additional meal. Additional meals cover only the count not already represented by selected restaurants; cafes are counted separately.
4. List original foreign-currency amounts. Require a positive exchange rate plus a dated source or explicit personal assumption before comparing nonzero HKD/MOP costs with CNY. A free item remains free without an exchange rate. Display original amount and conversion assumption.
5. Represent every directed journey stage, including the final return. Display saved Amap estimates with dates; let users select transport options and enter checked per-person fares/times. Recalculate when order, mode or assumptions change. Missing times prevent confirmation of a return time. Personal buffers are not validated border-queue predictions.
6. Bound route concurrency to three requests, cache live responses by directed pair, cancel on screen changes, validate response fields, and provide per-leg refresh and fallback links. A driving distance is never turned into a taxi fare or a public-transport duration.
7. Prepare an independently hosted HTTPS route backend with a directory-ID allowlist, same-city restriction, CORS, request coalescing, a 15-minute edge cache, timeouts, and a per-isolate rate limit. The secret is supplied separately at deployment; the user's one-session key is not installed. GitHub Pages remains the frontend.
8. Preserve an explicitly empty return-by preference. Display the English branch name in the UI. Keep Chinese names internally for search/source matching.
9. Run accounting, routing, backend and existing feature regression checks. Report local checks separately from public deployment and browser layout checks. Package the complete frontend plus separately deployable backend and instructions.

## Deliberate remaining gaps

- Live website routing is not enabled without a separately deployed HTTPS backend and an authorised runtime secret. This release includes dated saved results for queried pairs, not every possible combination of 85 places.
- The one-session key is used only for the current authorised queries. It is absent from source, configuration, logs, this document and the release archive.
- Coach tickets, border queues, last services, cross-city transfer fares and unverified admission are not fabricated. Outbound and return cross-city stages are explicitly listed; their unknown prices/times require actual ticket/operator confirmation or user estimates.
- Other-city ready-made routes use the same full-trip accounting, but several contain missing prices/times. These remain incomplete; category/budget matching is available in all five cities, while end-to-end verified five-city travel products are not claimed as complete.
- Backend rate limits are per isolate; sustained production abuse protection would require provider-level rate limiting or shared state. No production-scale guarantee is claimed.
- The two uncertain Tangjia restaurant branches were not replaced by similarly named POIs in other districts. Existing reference images/coordinates remain labelled as references. POI candidates are retained for review.

## Official implementation reference

Amap route planning 2.0: https://lbs.amap.com/api/webservice/guide/api/newroute
Endpoints: `/v5/place/text`, `/v5/direction/walking`, `/v5/direction/transit/integrated`, `/v5/direction/driving`.
Observed public-transport fare field in the successful response: `route.transits[].cost.transit_fee`. The parser retains missing fares as unknown and never infers a taxi fare from driving data.
