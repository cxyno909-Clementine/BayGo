/* Cancellable, directed-pair route cache; no provider credential is accepted here. */
(function(root) {
  'use strict';
  const cache = new Map();
  function normalize(value) {
    if (!value || typeof value !== 'object') return null;
    const options = (Array.isArray(value.options) ? value.options : []).filter(o =>
      ['Walking', 'Public transport', 'Driving / taxi'].includes(o?.mode) &&
      Number.isFinite(o.meters) && o.meters >= 0 && Number.isFinite(o.seconds) && o.seconds > 0
    ).map(o => ({ ...o, fare: Number.isFinite(o.fare) && o.fare >= 0 ? o.fare : null, lines: Array.isArray(o.lines) ? o.lines.filter(s => typeof s === 'string') : [] }));
    const chosen = options.find(o => o.mode === 'Walking' && o.seconds <= 1200) || options.find(o => o.mode === 'Public transport') || options.reduce((a,b)=>!a || b.seconds<a.seconds?b:a,null);
    return { ...value, options, recommended: chosen?.mode || null, errors: (Array.isArray(value.errors) ? value.errors : []).filter(e => typeof e?.path === 'string' && typeof e?.code === 'string'), timestamp: Number.isFinite(value.timestamp) ? value.timestamp : null };
  }
  function saved(from, to) { return normalize(root.BAYGO_ROUTING_SNAPSHOT?.[`${from}|${to}`]); }
  function peek(from, to) { return cache.get(`${from}|${to}`)?.value || saved(from, to); }
  async function get(from, to, signal, retry = false) {
    const token = `${from}|${to}`, cached = cache.get(token);
    if (!retry && cached && Date.now() - cached.at < 900000) return cached.value;
    const base = root.BAYGO_CONFIG?.routeApiBase;
    if (base) {
      try {
        const url = new URL('api/leg', base.endsWith('/') ? base : base + '/');
        url.search = new URLSearchParams({ from, to });
        const response = await fetch(url, { signal: AbortSignal.any([signal, AbortSignal.timeout(18000)]) });
        if (!response.ok) throw Error('Unavailable');
        const value = normalize(await response.json());
        if (!value || !value.options.length) throw Error('No supported routes');
        value.source = 'live'; cache.set(token, { value, at: Date.now() }); return value;
      } catch (e) { if (signal.aborted) throw e; }
    }
    if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
    return saved(from, to);
  }
  async function queue(items, work, signal, concurrency = 3) {
    let index = 0;
    await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, async () => {
      while (!signal.aborted && index < items.length) { const item = items[index++]; await work(item); }
    }));
  }
  root.BayGoRoutes = Object.freeze({ normalize, peek, get, queue });
})(typeof window === 'undefined' ? globalThis : window);
