/* Full itinerary costs and timing, shared by custom plans and curated routes. */
function planningSettings(city = state.city) {
  return { budget: '', mealCount: '2', mealAllowance: '45', drinkCount: '1', drinkAllowance: '20', stayMinutes: '60', bufferMinutes: '20', departure: '09:00', returnBy: '23:30', HKD: '', MOP: '', fxDate: '', fxSource: '', ...(state.tripSettings?.[city] || {}) };
}
function planPoint(id) {
  return id === campus ? { id: campus, name: 'BNBU', city: 'Zhuhai', amapPoint: { longitude: 113.520652, latitude: 22.347526 } } : directoryPlaces.find(p => p.id === id);
}
function tripLegs(ids, city) {
  const sequence = [campus, ...ids, campus];
  return sequence.slice(0, -1).map((from, i) => ({ from, to: sequence[i + 1], token: `${from}|${sequence[i + 1]}`, crossCity: city !== 'Zhuhai' && (from === campus || sequence[i + 1] === campus) }));
}
function settingsForm(city, id = 'trip-settings') {
  const s = planningSettings(city);
  return `<form id="${id}" data-city="${esc(city)}" class="card fields"><h3>Whole-trip budget · per person</h3><p class="meta">Includes outbound, every local leg, return, planned meals, drinks and admission. Shopping and optional activities are excluded. Allowances are editable planning assumptions, not quoted prices.</p>
  ${field('trip-budget','Total trip budget (CNY / person)',input('trip-budget','number',s.budget,'min="0" max="100000" step="0.01" placeholder="e.g. 250"'))}
  <div class="pair">${field('trip-mealCount','Number of meals',input('trip-mealCount','number',s.mealCount,'min="0" max="10" step="1"'))}${field('trip-mealAllowance','Allowance per meal (CNY)',input('trip-mealAllowance','number',s.mealAllowance,'min="0" max="10000" step="0.01"'))}</div>
  <div class="pair">${field('trip-drinkCount','Number of cafe / snack visits',input('trip-drinkCount','number',s.drinkCount,'min="0" max="10" step="1"'))}${field('trip-drinkAllowance','Allowance per cafe / snack visit (CNY)',input('trip-drinkAllowance','number',s.drinkAllowance,'min="0" max="10000" step="0.01"'))}</div>
  <div class="pair">${field('trip-stayMinutes','Minutes at each stop',input('trip-stayMinutes','number',s.stayMinutes,'min="0" max="720" step="1"'))}${field('trip-bufferMinutes','Extra journey buffer (minutes)',input('trip-bufferMinutes','number',s.bufferMinutes,'min="0" max="720" step="1"'),'Your allowance for waiting, transfers or border queues beyond returned estimates; actual queues can be longer.')}</div>
  <div class="pair">${field('trip-departure','Departure time',input('trip-departure','time',s.departure,'required'))}${field('trip-returnBy','Return by (optional)',input('trip-returnBy','time',s.returnBy),'Same-day plans only. Leave blank for a flexible return.')}</div>
  ${['Hong Kong','Macao'].includes(city) ? `<details><summary>Currency conversion · required for foreign-currency costs</summary>${field('trip-HKD','CNY for 1 HKD',input('trip-HKD','number',s.HKD,'min="0.0001" max="100" step="0.0001"'))}${field('trip-MOP','CNY for 1 MOP',input('trip-MOP','number',s.MOP,'min="0.0001" max="100" step="0.0001"'))}${field('trip-fxDate','Exchange-rate date',input('trip-fxDate','date',s.fxDate))}${field('trip-fxSource','Exchange-rate source / assumption',input('trip-fxSource','text',s.fxSource,'maxlength="160" placeholder="Source or personal planning assumption"'))}<p class="meta">No rate is prefilled. Original currencies are retained. Enter a dated source or explicitly identify your own assumption to compare with CNY.</p></details>` : ''}
  ${submit('Apply Budget & Time')}</form>`;
}
function tripAccounting(ids, city) {
  const settings = planningSettings(city), amount = window.BayGoBudget.amount, items = [], legs = tripLegs(ids, city);
  const fx = settings.fxDate && settings.fxSource.trim() ? { HKD: settings.HKD, MOP: settings.MOP } : {};
  let meals = 0, drinks = 0;
  const food = (item, type) => {
    const record = priceReferenceRecord(item);
    const reserve = amount(type === 'meal' ? settings.mealAllowance : settings.drinkAllowance);
    if (type === 'meal') meals++; else drinks++;
    if (record?.kind === 'average_spend') {
      const converted = window.BayGoBudget.range({ min: record.amount, currency: record.currency }, fx);
      items.push({ label: item.name + ' · ' + (type === 'meal' ? 'meal' : 'cafe / snack'), min: record.amount, max: record.amount, currency: record.currency, note: 'Historical average spend, not a fixed price; editable reserve adds headroom.', source: record.sourceUrl });
      if (reserve !== null && converted && reserve > converted.max) items.push({ label: item.name + ' · extra food reserve', min: 0, max: reserve - converted.max, currency: 'CNY', note: 'Personal allowance above the historical reference; not an additional meal.' });
    } else items.push({ label: item.name + ' · ' + (type === 'meal' ? 'meal allowance' : 'cafe / snack allowance'), min: reserve, max: reserve, currency: 'CNY', note: 'Personal spending allowance; actual menu prices are unconfirmed.' });
  };
  for (const id of ids) {
    const p = planPoint(id); if (!p) continue;
    if (p.category === 'Restaurants') { food(p, 'meal'); continue; }
    if (p.category === 'Cafes & Desserts') { food(p, 'drink'); continue; }
    const record = priceReferenceRecord(p), override = state.tripStopOverrides?.[city]?.[id];
    const visit = typeof override === 'string' ? override : override?.visit;
    const quoted = amount(override?.fare);
    if (record) items.push({ label: p.name + ' · standard admission', min: record.amount, max: record.amount, currency: record.currency, source: record.sourceUrl });
    else if (visit !== 'exterior' && quoted !== null) items.push({ label: p.name + ' · checked admission allowance', min: quoted, max: quoted, currency: 'CNY', note: 'User-entered per-person ticket estimate; verify the operator and date.' });
    else if (visit === 'exterior' || p.category === 'Shopping') items.push({ label: p.name + ' · exterior / public shopping area only', min: 0, max: 0, currency: 'CNY', note: 'No paid entry selected. Purchases, paid exhibitions and events excluded.' });
    else items.push({ label: p.name + ' · admission / activity', min: null, max: null, currency: p.currency || 'CNY', note: 'Not confirmed. Choose exterior-only if that is your plan, or confirm a ticket price.' });
  }
  for (const [label, count, allowance] of [['Additional planned meals',Math.max(0, Number(settings.mealCount)-meals),settings.mealAllowance],['Additional planned cafe / snack visits',Math.max(0, Number(settings.drinkCount)-drinks),settings.drinkAllowance]]) {
    if (count) items.push({ label: `${label} (${count})`, min: count * Number(allowance), max: count * Number(allowance), currency: 'CNY', note: 'Personal allowance; selected food stops already counted above.' });
  }
  let travelMinutes = 0, unknownTime = false;
  for (const leg of legs) {
    const override = state.tripLegOverrides?.[city]?.[leg.token];
    const result = leg.crossCity ? null : window.BayGoRoutes.peek(leg.from, leg.to);
    const chosen = result?.options.find(o => o.mode === (override?.mode || result.recommended));
    const manualFare = amount(override?.fare), manualMinutes = amount(override?.minutes);
    const fare = manualFare ?? chosen?.fare ?? null;
    const secs = manualMinutes === null ? chosen?.seconds : manualMinutes * 60;
    if (Number.isFinite(secs)) travelMinutes += secs/60; else unknownTime = true;
    items.push({ label: `${placeName(leg.from)} → ${placeName(leg.to)}${leg.crossCity ? ' · all cross-city stages' : ''}`, min: fare, max: fare, currency: manualFare !== null ? 'CNY' : chosen?.currency || 'CNY', note: manualFare !== null ? 'Personal fare estimate / quoted ticket, per person.' : chosen ? `${chosen.mode} · ${result.source === 'live' ? 'live response' : 'dated saved estimate'}. Taxi fare is not inferred from driving distance.` : 'Transport fare unconfirmed; all required stages must be included.' });
  }
  const summary = window.BayGoBudget.summarize(items, settings.budget, fx);
  const totalMinutes = Math.ceil(travelMinutes + ids.length * Number(settings.stayMinutes) + Number(settings.bufferMinutes));
  return { ...summary, settings, fx, legs, totalMinutes, unknownTime, meals, drinks };
}
function tripBudgetPanel(ids, city) {
  const total = tripAccounting(ids, city);
  const money = item => item.cny ? costRange(item.cny) : 'To confirm';
  const statuses = { within: 'Estimated full trip within budget', warning: 'May exceed your budget', outside: 'Estimated full trip over budget', incomplete: 'Incomplete estimate · costs still to confirm', 'no-budget': 'Enter a total trip budget to compare' };
  const incomplete = total.status === 'incomplete';
  const time = total.unknownTime ? `At least ${duration(total.totalMinutes)} accounted for; travel times are missing. Return time cannot be confirmed.` : `${duration(total.totalMinutes)} including travel, ${ids.length} stop allowances and your extra buffer.`;
  const finish = minutes(total.settings.departure) + total.totalMinutes;
  const timingStatus = total.unknownTime ? '' : finish >= 1440 ? ' This plan crosses midnight; same-day planning cannot confirm it.' : ` Estimated return ${clock(finish)}.${total.settings.returnBy && finish > minutes(total.settings.returnBy) ? ' This is after your return-by time.' : ''}`;
  return heading('Whole-trip budget & time', `<div id="trip-budget-summary" data-city="${esc(city)}" data-ids="${esc(ids.join(','))}" class="card stack"><h3>${esc(statuses[total.status])}</h3><p><strong>${incomplete ? 'Known subtotal only: ' : 'Estimated trip total: '}${costRange(total)}</strong></p>${total.remaining && !incomplete ? `<p>Budget balance: CNY ${total.remaining.min} to ${total.remaining.max} / person (negative means over budget).</p>` : ''}${total.missing.length ? `<p class="error">Missing costs or currency conversions: ${esc(total.missing.join('; '))}. These are not treated as free. Budget feasibility cannot be confirmed.</p>` : ''}${rows(total.details.map(i => [esc(i.label),money(i)+`<small class="meta">${i.currency !== 'CNY' && i.min !== null ? esc(`${i.currency} ${i.min}`) + ' · ' : ''}${esc(i.note || '')}${i.source ? ' '+external(i.source,'Source') : ''}</small>`]))}<p>${esc(time + timingStatus)}</p><p class="meta">Shopping, optional attractions, concerts and unselected extras excluded. Food allowances are not guaranteed prices. Selected restaurant visits: ${total.meals}; cafe / snack visits: ${total.drinks}. These are counted once even if below the requested meal count.</p>${Object.keys(total.fx).length ? `<p class="meta">Conversion assumption: 1 HKD = CNY ${esc(total.fx.HKD || 'not set')}; 1 MOP = CNY ${esc(total.fx.MOP || 'not set')}. ${esc(total.settings.fxDate)} · ${esc(total.settings.fxSource)}</p>` : ''}</div>`);
}
function completeJourney(ids, city) {
  return heading('Every journey stage · including return',tripLegs(ids,city).map(leg => {
    const a=planPoint(leg.from), b=planPoint(leg.to), saved=state.tripLegOverrides?.[city]?.[leg.token] || {};
    const guidance = city === 'Shenzhen' ? 'BNBU connection → ticketed AA Bus pickup → ticketed Shenzhen drop-off → destination. Return: book the reverse service and include the final campus connection.' : city === 'Guangzhou' ? 'BNBU → departure station / ticketed coach pickup → Guangzhou arrival → destination. Return: reverse these stages and include the campus connection.' : city === 'Hong Kong' ? 'BNBU → HZMB Zhuhai Port → departure checks → bridge shuttle → Hong Kong Port checks → local bus / MTR → destination. Return: include every stage in reverse; check last services.' : 'BNBU → Gongbei / Hengqin Port → border checks → Macao local bus / LRT / taxi → destination. Return: include the matching border and campus connection.';
    return `<article class="card stack"><h3>${esc(placeName(leg.from))} → ${esc(placeName(leg.to))}</h3>${leg.crossCity ? `<p>${esc(guidance)}</p>${link('L03','Booking and border connection guides')}<p class="meta">Actual sold stops, departures, border hours, fares and queues must be confirmed for your date. A local navigation estimate cannot represent the entire cross-city journey.</p>` : `<div class="leg-estimate" data-from="${esc(leg.from)}" data-to="${esc(leg.to)}" aria-live="polite">Checking transport options…</div>${a && b ? legLink(a,b) : ''}`}
    <form class="fields" data-leg="${esc(leg.token)}" data-city="${esc(city)}" id="leg-${esc(leg.token)}"><p class="meta">Optional: enter your own checked per-person fare and total travel time for this entire leg. Leave blank to use a returned estimate. Driving time does not include taxi waiting.</p><label>Fare (CNY / person)<input name="fare" type="number" min="0" max="100000" step="0.01" value="${esc(saved.fare ?? '')}"></label><label>Travel time (minutes)<input name="minutes" type="number" min="0" max="1440" step="1" value="${esc(saved.minutes ?? '')}"></label>${submit('Apply Leg Estimate')}</form></article>`;
  }).join(''));
}
function admissionControls(ids,city) {
  return ids.map(id => {
    const p=planPoint(id);if(!p||['Restaurants','Cafes & Desserts','Shopping'].includes(p.category)||priceReferenceRecord(p))return '';
    const saved=state.tripStopOverrides?.[city]?.[id],visit=typeof saved==='string'?saved:saved?.visit;
    return `<form id="entry-${esc(id)}" data-entry="${esc(id)}" data-city="${esc(city)}" class="card fields"><label>Visit at ${esc(p.name)}<select name="visit"><option value="paid">Paid entry / price to confirm</option><option value="exterior" ${visit==='exterior'?'selected':''}>Exterior / public area only · no paid entry</option></select></label><label>Checked ticket allowance (CNY / person)<input name="fare" type="number" min="0" max="100000" step="0.01" value="${esc(saved?.fare ?? '')}" placeholder="Leave blank if unknown"></label><p class="meta">Enter a verified per-person quote in CNY, or explicitly choose an exterior/public-area visit. Unknown admission is not free.</p>${submit('Apply Visit Type')}</form>`;
  }).join('');
}
function updateTripSummary() {
  const node=app.querySelector('#trip-budget-summary');
  if(node) { const holder=document.createElement('div'); holder.innerHTML=tripBudgetPanel(node.dataset.ids.split(','),node.dataset.city); node.replaceWith(holder.querySelector('#trip-budget-summary')); }
}
function planningSubmit(form, fields) {
  const city=form.dataset?.city;
  if(!cityNames.includes(city)) return false;
  if(form.id==='trip-settings') {
    const s=planningSettings(city);
    for(const name of Object.keys(s)) if(Object.hasOwn(fields,'trip-'+name))s[name]=fields['trip-'+name];
    const amount=window.BayGoBudget.amount;
    for(const field of ['mealCount','drinkCount','mealAllowance','drinkAllowance','stayMinutes','bufferMinutes']) {
      if(amount(s[field])===null || (['mealCount','drinkCount'].includes(field) && (!Number.isInteger(Number(s[field])) || Number(s[field])>10))) {announce('Enter non-negative allowances and whole meal / visit counts (up to 10).');return true;}
    }
    if(s.budget!=='' && amount(s.budget)===null){announce('Enter a valid non-negative total budget.');return true;}
    if(s.returnBy && s.returnBy<=s.departure){announce('Use a return time after departure, or leave it blank. Same-day plans only.');return true;}
    if(commit(()=>{state.tripSettings||={};state.tripSettings[city]=s;})) refresh();return true;
  }
  if(form.dataset.leg) {
    if(['fare','minutes'].some(name=>fields[name]!=='' && window.BayGoBudget.amount(fields[name])===null)){announce('Enter a non-negative fare and travel time, or leave them blank.');return true;}
    if(commit(()=>{state.tripLegOverrides||={};state.tripLegOverrides[city]||={};state.tripLegOverrides[city][form.dataset.leg]={...state.tripLegOverrides[city][form.dataset.leg],fare:fields.fare,minutes:fields.minutes};}))refresh();return true;
  }
  if(form.dataset.entry) {
    if(fields.fare!=='' && window.BayGoBudget.amount(fields.fare)===null){announce('Enter a non-negative admission quote or leave it blank.');return true;}
    if(commit(()=>{state.tripStopOverrides||={};state.tripStopOverrides[city]||={};state.tripStopOverrides[city][form.dataset.entry]={visit:fields.visit,fare:fields.fare};}))refresh();return true;
  }
  return false;
}
