/* Shared per-person trip accounting. Missing values remain missing, never zero. */
(function(root) {
  'use strict';
  const amount = value => value !== '' && value !== null && value !== undefined && Number.isFinite(Number(value)) && Number(value) >= 0 ? Number(value) : null;
  const round = n => Math.round((n + Number.EPSILON) * 100) / 100;
  function range(item, fx = {}) {
    const min = amount(item.min), max = amount(item.max ?? item.min);
    const rate = item.currency === 'CNY' || !item.currency ? 1 : amount(fx[item.currency]);
    if (min === null || max === null || max < min) return null;
    if (min === 0 && max === 0) return { min: 0, max: 0 };
    if (rate === null || rate <= 0) return null;
    return { min: round(min * rate), max: round(max * rate) };
  }
  function summarize(items, budget, fx = {}) {
    let min = 0, max = 0;
    const missing = items.length ? [] : ['No cost items available'];
    const details = items.map(item => {
      const cny = range(item, fx);
      if (!cny) missing.push(item.label);
      else { min += cny.min; max += cny.max; }
      return { ...item, cny };
    });
    min = round(min); max = round(max);
    const limit = amount(budget);
    const status = missing.length ? 'incomplete' : limit === null ? 'no-budget' : limit < min ? 'outside' : limit < max ? 'warning' : 'within';
    return { min, max, details, missing, status, budget: limit, remaining: limit === null ? null : { min: round(limit - max), max: round(limit - min) } };
  }
  root.BayGoBudget = Object.freeze({ amount, range, summarize });
})(typeof window === 'undefined' ? globalThis : window);
