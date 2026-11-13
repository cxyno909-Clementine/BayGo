# BayGo

Student lifestyle and travel prototype for BNBU students. This is the independent static frontend prepared from BayGo 3. The original project remains unchanged outside this directory.

## Publish on GitHub Pages

1. Sign in as `cxyno909-Clementine` and create a public repository named `baygo` without initial files. The free public-repository route makes the uploaded source publicly visible.
2. Upload the **contents** of this folder to the repository root: index.html, config.js, app.js, styles.css, content.js, places.js, transit.js, curated.js and the complete assets folder. README.md and .nojekyll can also be uploaded. Do not upload the enclosing folder or the ZIP itself as the website.
3. Commit the files to `main`.
4. Open Settings → Pages. Choose Deploy from a branch, then main and /(root), and Save.
5. Wait for GitHub's deployment to succeed. The expected address is `https://cxyno909-Clementine.github.io/baygo/`. This address is not live merely because it is written here; verify the actual URL reported by GitHub.
6. Verify in an incognito browser without signing into GitHub or ChatGPT. Test campus Wi-Fi and mobile data with VPN disabled before relying on it for a presentation.

All internal page navigation uses URL hashes, and all local assets use relative paths, so the /baygo/ project path needs no rewrite server.

## What works without the original host

The HTML, styles, scripts, logo and bundled photos are served together. Browsing places, curated routes, guides, sample community content, filters and browser-local actions do not require the original ChatGPT-hosted service.

## Live routes and internet dependencies

GitHub Pages cannot run the original Worker or Python server. By default, this static edition explicitly says live segment estimates are disconnected and offers the existing Amap navigation links. Existing saved transport reference data is preserved and must not be presented as live. No values are fabricated as a substitute.

To restore live calculations later, deploy the retained backend separately, keep its AMAP_API_KEY in server-side secrets, enable CORS for this Pages origin, and set config.js routeApiBase to the backend HTTPS base URL. Never embed API credentials in this public repository. The original backend is retained in the separate BayGo 3 folder and is not uploaded here.

External Amap embeds, navigation and some remotely hosted place photos need internet and may fail on a particular network. This edition is not a fully offline application and does not guarantee mainland network availability.

## Scope of this migration

Preserves the current five-city content, existing visual design and default Return By of 23:30. Only hosting configuration and route-service fallback messages are changed. No new claims are made about source accuracy, photo availability, testing results, identity checks or real community operations.
