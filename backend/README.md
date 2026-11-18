# Optional permanent route service

The GitHub Pages frontend cannot execute a server or hide an API credential. It works with this release's saved route estimates; live updates for arbitrary supported pairs require a separately hosted backend.

## Files

- `worker.mjs`: independently deployable Cloudflare Worker ES module.
- `points.json`: coordinate allowlist generated from this release's directory, including BNBU.
- `wrangler.toml`: service name and compatibility configuration. No secrets.

## Deployment when the team has a hosting account

1. Create/sign in to a Cloudflare account and install the provider's Wrangler CLI, or use its supported source deployment workflow.
2. Deploy this backend directory as the `baygo-route-service` Worker.
3. Add `AMAP_API_KEY` through the provider's **secret store**. Do not put its value in any source file, `wrangler.toml`, browser script, GitHub commit or command argument. The key supplied for the current one-session query has **not** been configured for ongoing hosting.
4. Note the returned permanent HTTPS Worker address. Confirm `/health` reports `configured` without disclosing the credential.
5. Set only the public HTTPS address in frontend `config.js`, for example `routeApiBase: 'https://YOUR-WORKER-HOST/'`. Never put the key there.
6. From the actual GitHub Pages origin, request `/api/leg?from=P-ZH-001&to=PL-ZH-012`. Verify CORS, three-mode options, timestamp and fare handling. Repeat in reverse, then add/reorder three stops. Exercise error and retry states.
7. Deploy the updated frontend to the existing GitHub repository root. Test on the presentation network with VPN off. Saved results remain available if the backend is unavailable.

Allowed browser origin: `https://cxyno909-clementine.github.io`. Change this allowlist if the website domain changes. CORS is browser access control, not authentication. The Worker also validates IDs and limits requests per isolate; provider-level limits/shared state are advisable before public production use.

The route API accepts only allowlisted same-city pairs. Cross-city and cross-border plans require operator ticketing/border connections and must not be passed off as ordinary city navigation. The frontend preserves these as explicit stages with unknown prices/times until confirmed.

## Contract

`GET /api/leg?from=PLACE_ID&to=PLACE_ID`

Response: `from`, `to`, `options[]` (`mode`, `meters`, `seconds`, nullable `fare`, `currency`, `lines`), `recommended`, `reason`, `timestamp`, `reference`, `errors[]` (`path`, `code`). The backend never returns provider request URLs or secrets. Cached results last at most 15 minutes; the browser displays live-service responses distinctly from bundled dated snapshots.

Do not rely on a teammate's computer running a local server for the public website. Backend deployment and public CORS verification are still pending; no public deployment was performed by this release.
