'use strict';

const data = window.BAYGO_CONTENT;
const directoryPlaces = window.BAYGO_PLACES || [];
const directoryCities = ['Zhuhai', 'Guangzhou', 'Shenzhen', 'Hong Kong', 'Macao'];
const transportRows = window.BAYGO_TRANSPORT || [];
const directoryCategories = ['Restaurants', 'Cafes & Desserts', 'Parks & Sights', 'Historic Districts', 'Museums', 'Shopping', 'Music & Shows', 'Sports'];
const app = document.querySelector('#app');
const key = 'baygo-demo-v1';
const campus = 'P-ZH-001';
const cityNames = directoryCities;
const interests = [...new Set(data.routes.flatMap(route => route.interest_tags.split(/;\s*/)))];
const fresh = () => ({ city: 'Zhuhai', filters: { mode: 'destination', returnBy: '23:30', start: campus, end: campus, interests: [] }, profile: false, verified: false, saved: {}, applications: {}, reports: [], checklist: {}, lists: {} });
let state = fresh();
try { state = { ...state, ...JSON.parse(localStorage.getItem(key)) }; } catch {}
state.filters = { ...fresh().filters, ...(state.filters || {}) };
if (!Object.hasOwn(state.filters, 'returnBy')) state.filters.returnBy = '23:30';
let page, params, entry, resizeObserver, toastTimer, legRequestController;
const scrollPositions = new Map();
const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
const lookup = (list, id, value) => list.find(row => row[id] === value);
const place = id => lookup(data.places, 'place_id', id);
const placeName = id => id === campus ? 'BNBU' : place(id)?.name_en ?? directoryPlaces.find(p => p.id === id)?.name ?? 'Not confirmed';
const stopsFor = id => data.stops.filter(stop => stop.route_id === id);
const duration = min => `${Math.floor(min / 60) ? Math.floor(min / 60) + ' hr ' : ''}${min % 60 ? min % 60 + ' min' : ''}`.trim() || '0 min';
const today = () => new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
const minutes = time => { const [hour, minute] = time.split(':').map(Number); return hour * 60 + minute; };
const clock = min => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;
const titles = { R01:'Recommended Routes', R02:'Route Details', P01:'Start Planning', P02:'Your Multi-stop Plan', H01: 'Home', C01: 'Choose a City', C02: 'Home', E01: 'Plan My Trip', E02: 'Suggested Trips', E03: 'Trip Details', E04: 'Place Details', D01: 'Explore Places', L01: 'Life Guides', L03: 'Intercity Travel & Tickets', L02: 'Guide Details', Q01: 'Community', Q02: 'Buddy Activity', Q03: 'Apply to Join', Q04: 'Student Story', Q05: 'Find or Create', Q06: 'Matching Activities', Q07: 'Write a Post', Q08: 'Preview Post', Q09: 'Choose a Draft', M07: 'My Posts', M04: 'Inbox', M05: 'Conversation', M06: 'My Activities', M01: 'Me', M02: 'Saved Items', M03: 'My Applications', A01: 'Sample Sign-in', A02: 'Simulated Campus Verification', F01: 'Report an Issue', I01: 'About BayGo' };
const tabs = [['H01','Home','home'],['E01','Explore','compass'],['L01','Life','book'],['Q01','Community','people'],['M01','Me','person']];
const icons = {
  home: 'M3 10 12 3l9 7v10H3z M9 20v-6h6v6', compass: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M16 8l-2 6-6 2 2-6z',
  book: 'M3 4h6l3 2 3-2h6v15h-6l-3 2-3-2H3z M12 6v15', people: 'M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M2 20v-2a6 6 0 0 1 12 0v2z M16 5a3 3 0 0 1 0 6 M17 14a5 5 0 0 1 5 5v1',
  person: 'M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M4 21v-2a8 8 0 0 1 16 0v2z', back: 'M15 5l-7 7 7 7',
  info: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 11v6 M12 7v1', check: 'M4 12l5 5L20 6',
  warn: 'M12 3 2 21h20z M12 9v5 M12 17v1'
};
const icon = name => `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${icons[name]}"/></svg>`;
const url = (id, query = {}) => '#' + id + (Object.keys(query).length ? '?' + new URLSearchParams(query) : '');
const link = (id, text, query = {}, style = 'text') => `<a class="btn ${style}" href="${esc(url(id, query))}">${text}</a>`;
const action = (name, text, style = 'text', attrs = '') => `<button type="button" class="btn ${style}" data-action="${name}" ${attrs}>${text}</button>`;
const heading = (title, content) => `<section><h2 class="heading-row">${title}</h2>${content}</section>`;
const notice = (title, message, extra = '') => `<div class="notice"><h2>${title}</h2><p class="meta">${message}</p>${extra}</div>`;
const badge = (text, type = '') => `<span class="badge ${type}">${icon(({ good: 'check', warn: 'warn' })[type] || 'info')}${text}</span>`;
const rows = entries => `<dl class="rows">${entries.map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`).join('')}</dl>`;
const para = value => `<p>${esc(value || 'Not confirmed')}</p>`;
const external = (target, label) => /^https?:\/\//i.test(target || '') ? `<a href="${esc(target)}" target="_blank" rel="noopener noreferrer">${esc(label)}</a>` : esc(label);
const option = (value, text, selected) => `<option value="${esc(value)}" ${value === selected ? 'selected' : ''}>${esc(text)}</option>`;
const select = (name, options, value) => `<select name="${name}" id="${name}">${options.map(([id, title]) => option(id, title, value)).join('')}</select>`;
const input = (name, type, value, extra = '') => `<input id="${name}" name="${name}" type="${type}" value="${esc(value)}" ${extra}>`;
const field = (name, label, control, help = '') => `<div class="field"><label for="${name}">${label}</label>${control}${help ? `<p id="${name}-help" class="help">${help}</p>` : ''}<p id="${name}-error" class="error" hidden></p></div>`;
const submit = (label, form = '') => `<button type="submit" class="btn primary" ${form ? `form="${form}"` : ''}>${label}</button>`;
const toolbar = (...items) => `<div class="footer actions">${items.join('')}</div>`;

function announce(text) {
  clearTimeout(toastTimer);
  document.querySelector('#announcement').textContent = text;
  toastTimer = setTimeout(() => { document.querySelector('#announcement').textContent = ''; }, 4400);
}

function persist() {
  try { localStorage.setItem(key, JSON.stringify(state)); return true; }
  catch { announce('This device could not save the change.'); return false; }
}

function commit(update) {
  const previous = structuredClone(state);
  update();
  if (persist()) return true;
  state = previous;
  return false;
}

function routeTo(target, options = {}) {
  scrollPositions.set(entry?.id, window.scrollY);
  const next = { id: crypto.randomUUID?.() || String(Date.now() + Math.random()), back: true, ...options };
  history.pushState(next, '', target);
  render();
}

function back() {
  if (entry?.back) history.back();
  else {
    history.replaceState({ id: 'home' }, '', '#H01');
    render();
  }
}

const photos = {
  xianglu: { alt: 'Panoramic view across Xianglu Bay, Zhuhai', author: 'Shasha Zhuhai', file: 'Xianglu Bay in Zhuhai.jpg' },
  fisher: { alt: 'Zhuhai Fisher Girl statue on the waterfront at dusk', author: 'Dllu', file: 'Zhuhai Fisher Girl statue dllu.jpg', work: 'Fisher Girl by Pan He' },
  tangjia: { alt: 'Shanfang Road in Tangjiawan, Zhuhai', author: '瑞丽江的河水', file: '唐家湾镇 - 山房路 - 2026-05-10.jpg' },
  shenzhen: { alt: 'Shenzhen skyline from Lianhuashan Park', author: 'Shihu7', file: 'Shenzhen Lianhuashan Park 2019.jpg' },
  macao: { alt: 'Senado Square in Macao', author: 'Georgio', file: 'Senado Square Macao.jpg', license: '3.0' },
  hongkong: { alt: 'Victoria Harbour seen from Tsim Sha Tsui', author: 'Donatingpictures', file: 'Hong Kong Victoria Harbour - Hong Kong.jpg' }
};
const routePhotos = { 'R-ZH-001': 'tangjia', 'R-ZH-002': 'fisher' };
// Presentation copy for the supplied fictional records. Source IDs and workbook text stay intact.
const sampleCopy = text => String(text ?? '')
  .replaceAll('BayGo Demo Host', 'BayGo Sample Host')
  .replaceAll('Demo Student A', 'Sample Student A')
  .replaceAll('Demo schedule in China Standard Time.', 'Sample schedule in China Standard Time.')
  .replaceAll('The demo group', 'The sample group')
  .replaceAll('the BayGo prototype', 'BayGo');
const photoLabels = {
  tangjia: 'Shanfang Road · Tangjiawan', fisher: 'Fisher Girl · Xianglu Bay',
  shenzhen: 'Lianhua Hill Park · Shenzhen', macao: 'Senado Square · Macao', hongkong: 'Victoria Harbour · Hong Kong'
};
const placePhotos = { 'P-ZH-002': 'tangjia', 'P-ZH-005': 'fisher' };

function photoImage(id, eager = false, decorative = false) {
  const photo = photos[id];
  if (!photo) return '';
  return `<img class="travel-photo photo-${id}" src="assets/photos/${id}.webp" alt="${decorative ? '' : esc(photo.alt)}" width="1200" height="675" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;
}

function photoCredits() {
  return `<ul class="photo-credits">${Object.values(photos).map(photo => {
    const original = 'https://commons.wikimedia.org/wiki/File:' + encodeURIComponent(photo.file.replaceAll(' ', '_'));
    const license = photo.license || '4.0';
    return `<li>${external(original, photo.alt)} · ${esc(/[\u3400-\u9fff]/.test(photo.author || '') ? 'Wikimedia Commons contributor' : photo.author)}${photo.work ? ' · ' + esc(photo.work) : ''}
    · ${external('https://creativecommons.org/licenses/by-sa/' + license + '/', 'CC BY-SA ' + license)}. Resized and cropped for display.</li>`;
  }).join('')}</ul>`;
}

function detailPhoto(id) {
  if (!photos[id]) return '';
  return `<figure class="detail-photo">${photoImage(id, true)}<figcaption>${esc(photoLabels[id])}</figcaption></figure>`;
}

function show(body, footer = '', isRoot = false) {
  const logo = '<img src="assets/baygo-logo.png" width="44" height="44" alt="BayGo">';
  app.dataset.screen = page;
  app.innerHTML = `<header class="topbar">${isRoot ? '<span></span>' : action('back', icon('back') + 'Back', 'back text')}
    <h1>${titles[page] || 'BayGo'}</h1>${logo}</header>
    <main tabindex="-1" ${footer ? 'class="has-footer"' : ''}>${body}</main>${footer}`;
  cancelLegRequests();
  queueMicrotask(loadLegEstimates);
  document.title = (titles[page] || 'BayGo') + ' · BayGo';
  resizeObserver?.disconnect();
  const bar = app.querySelector('.footer');
  const measure = () => document.documentElement.style.setProperty('--bar-height', `${bar?.offsetHeight || 0}px`);
  measure();
  if (bar) { resizeObserver = new ResizeObserver(measure); resizeObserver.observe(bar); }
}

function tabbar() {
  return `<nav class="footer tabs" aria-label="Main navigation">${tabs.map(([id, label, glyph]) => `<a class="tab" href="#${id}" ${(page === id || (page === 'C02' && id === 'H01')) ? 'aria-current="page"' : ''}>${icon(glyph)}${label}</a>`).join('')}</nav>`;
}

function cityButton(city = state.city) {
  return ['H01','C02'].includes(page) ? `<div class="city-control"><span class="city-control-label" id="city-control-label">Change city</span>${action('city', esc(city) + '<span aria-hidden="true">⌄</span>', 'outline city-control-button', 'aria-describedby="city-control-label" aria-haspopup="dialog"')}</div>` : `<p class="meta">${esc(city)} · ${link('H01','Change city on Home')}</p>`;
}

function routeCard(route, match) {
  const photoId = routePhotos[route.route_id];
  if (!match && photoId) {
    return `<article class="destination-card">
      <div class="destination-image">${photoImage(photoId, false, true)}
        <span class="photo-chip">${duration(route.duration_min)}</span></div>
      <div class="destination-copy"><h3>${esc(route.title_en)}</h3>
        <p class="meta">Starts at ${esc(placeName(route.departure_id))}</p>
        <p class="meta">Estimated full-trip budget</p>
        <a class="card-cta" href="${esc(url('E03', { id: route.route_id }))}" aria-label="View Trip: ${esc(route.title_en)}">View Trip</a></div>
    </article>`;
  }
  const stops = stopsFor(route.route_id);
  return `<article class="card">
    ${match ? matchBadge(match.status) : badge('Estimated full-trip budget')}
    <h3>${esc(route.title_en)}</h3>
    ${match ? `<p>${stops.map(stop => esc(placeName(stop.place_id))).join(' → ')}</p>
    ${rows([['Start / end', esc(placeName(route.departure_id) + ' / ' + placeName(route.return_id))], ['Estimated total time', duration(route.duration_min)], ['Estimated trip total per person', costRange(match.total)], ['Transport', esc(route.transport_modes)]])}
    <p class="meta">${esc(match.reason)}</p>` : `<p class="meta">${duration(route.duration_min)} · Starts at ${esc(placeName(route.departure_id))}</p>`}
    ${link('E03', 'View Trip', { id: route.route_id }, 'primary')}
  </article>`;
}

const cityHighlights = {
  Guangzhou: ['PL-GZ-014','PL-GZ-002','PL-GZ-011','PL-GZ-012','PL-GZ-013'],
  Shenzhen: ['PL-SZ-009','PL-SZ-002','PL-SZ-003','PL-SZ-006'],
  'Hong Kong': ['PL-HK-010','PL-HK-001','PL-HK-004','PL-HK-008'],
  Macao: ['PL-MO-008','PL-MO-001','PL-MO-004','PL-MO-010']
};

function home(city = state.city) {
  const zhuhai = city === 'Zhuhai';
  const picks = (cityHighlights[city] || []).map(id => directoryPlaces.find(item => item.id === id)).filter(Boolean);
  const hero = picks.find(item => item.photo);
  const cityGuide = data.previews.find(item => item.city === city);
  const primary = link('R01', 'Recommended Routes', {}, 'primary');
  show(`<section class="home-intro">
    <div class="home-context">${cityButton(city)}${link('I01', 'About BayGo', {}, 'about-link')}</div>
    <div class="home-hero">
      ${zhuhai ? photoImage('xianglu', true, true) : hero ? directoryPhoto(hero) : ''}
      <span class="hero-location">${zhuhai ? 'Xianglu Bay · Zhuhai' : esc(hero?.name || city)}</span>
      <div class="home-hero-content">
        <p class="eyebrow">BayGo · Student travel</p>
        <h2 class="title">${zhuhai ? 'Where would you like to go?' : 'Explore ' + esc(city)}</h2>
        <p>${zhuhai ? 'Plan a day out from BNBU.' : 'Discover places and check travel from BNBU.'}</p>
        <div class="cluster">${primary}${link('P01', 'Start Planning', {}, 'outline')}</div>
      </div>
    </div></section>
    <p class="meta">Choose your city above. Browse ready-made routes or build your own multi-stop itinerary.</p><section class="directory-entry">
      <div><h2>Explore Places</h2><p class="meta">Food, shopping, shows and sights in ${esc(city)}.</p></div>
      ${link('D01', 'Browse Places', { city }, 'outline')}
    </section>
    ${heading('Quick tasks', `<div class="quick">${link('L01', icon('book') + 'Life Guides', {}, 'outline')}${link('Q01', icon('people') + 'Find Buddies', { tab: 'buddies' }, 'outline')}${link('Q01', icon('person') + 'Student Stories', { tab: 'stories' }, 'outline')}</div>`)}
    ${zhuhai ? heading('Featured trips', `<div class="destination-grid">${data.routes.map(route => routeCard(route)).join('')}</div>`)
    + heading('Life guides', data.guides.map(guideCard).join(''))
    + heading('Student stories', data.stories.filter(item => item.city === city).map(storyCard).join(''))
    : heading('Featured places', `<div class="card-list">${picks.map(directoryCard).join('')}</div>`)
      + (cityGuide ? cityTravelGuide(cityGuide) : '') + heading('Student stories', data.stories.filter(item => item.city === city).map(storyCard).join(''))}`, tabbar(), true);
}

function cities() {
  const cityParams = params;
  const [origin, query] = (entry.cityOrigin || '#H01').slice(1).split('?');
  const backgrounds = { H01: home, C02: cityHome, E01: multiPlanner, L01: life, Q01: community };
  page = Object.hasOwn(backgrounds, origin) ? origin : 'H01';
  params = new URLSearchParams(query);
  backgrounds[page]();
  page = 'C01';
  params = cityParams;
  document.title = 'Choose a City · BayGo';
  app.insertAdjacentHTML('beforeend', `<dialog class="city-sheet" aria-labelledby="city-title"><div class="stack">
    <h2 id="city-title">Choose a City</h2>
    ${cityNames.map(name => action('choose-city', esc(name) + (name === state.city ? ' · Selected' : ''), 'outline full', `data-city="${name}"`)).join('')}
    ${action('back', 'Back')}
    </div></dialog><dialog id="city-confirm" aria-labelledby="switch-title"><div class="stack">
    <h2 id="switch-title">Switch city and discard your changes?</h2><div class="cluster">
    ${action('back', 'Keep Editing', 'outline')}${action('confirm-city', 'Switch City', 'primary')}
    </div></div></dialog>`);
  const sheet = app.querySelector('.city-sheet');
  sheet.addEventListener('cancel', event => { event.preventDefault(); back(); });
  const confirmation = app.querySelector('#city-confirm');
  confirmation.addEventListener('cancel', event => { event.preventDefault(); back(); });
  sheet.showModal();
}

function cityHome() {
  const city = params.get('city') || state.city;
  if (!cityNames.includes(city)) return unavailable();
  return home(city);
}

function cityTravelGuide(guide) {
  const copy = text => para(String(text || '').replace(/\bpreview\b/gi, 'guide'));
  return heading('Getting there from BNBU', `<details class="card"><summary>${esc(guide.title_en)}</summary>
    <div class="stack"><h3>Outbound</h3>${copy(guide.outbound_en)}
    <h3>Return</h3>${copy(guide.return_en)}
    <h3>Fares and timing</h3>${copy(guide.fare_note_en)}${copy(guide.time_note_en)}${copy(guide.verification_note_en)}
    ${visitorActions(guide.preview_id)}</div></details>`);
}

function planner() {
  if (params.get('mode') === 'destination' || (params.get('mode') !== 'interests' && state.filters.mode !== 'interests')) return multiPlanner();
  state.filters.mode = 'interests';
  const f = state.filters;
  const root = !params.has('mode') && !params.has('edit') && !params.has('destination');
  if (state.city !== 'Zhuhai') {
    return show(notice('Explore ' + esc(state.city), 'Open a place to see available routes, journey times and transport fares from BNBU.',
      link('D01', 'Browse Places', { city: state.city }, 'primary') + link('H01', 'Change city on Home')), root ? tabbar() : '', root);
  }
  const destinations = [...new Set(data.routes.flatMap(route => stopsFor(route.route_id).slice(1, -1).map(stop => stop.place_id)))];
  const endpoints = [...new Set(data.routes.flatMap(route => [route.departure_id, route.return_id]))];
  const modes = [['destination', 'I have a destination'], ['interests', 'Help me choose']];
  const modePicker = `<div class="segmented" role="group" aria-label="Planning mode">${modes.map(([mode, label]) => action('mode', label, '', `data-mode="${mode}" aria-pressed="${mode === f.mode}"`)).join('')}</div>`;
  const routeFields = `<p>City: Zhuhai · ${link('H01','Change city on Home')}</p>`
    + `<p class="meta">Start and return: BNBU</p><input type="hidden" name="start" value="${campus}"><input type="hidden" name="end" value="${campus}">`
    + (f.mode === 'destination'
      ? field('destination', 'Destination', select('destination', [['', 'Select a destination'], ...destinations.map(id => [id, placeName(id)])], f.destination || ''))
      : `<fieldset id="interests" tabindex="-1"><legend>Interests</legend><div class="cluster">${interests.map(tag => `<label class="check"><input type="checkbox" name="interests" value="${esc(tag)}" ${f.interests.includes(tag) ? 'checked' : ''}>${esc(tag)}</label>`).join('')}</div><p class="error" id="interests-error" hidden></p></fieldset>`);
  show(`<form id="planner" novalidate>
    ${modePicker}
    <section class="stack"><h2>Route</h2><div class="fields">${routeFields}</div></section>
    ${heading('Schedule', `<div class="fields">${field('date', 'Departure Date', input('date', 'date', f.date, `min="${today()}"`))}
    <div class="pair">${field('departure', 'Departure Time', input('departure', 'time', f.departure))}${field('returnBy', 'Return By (optional)', input('returnBy', 'time', f.returnBy), 'Leave blank if flexible. Check return buses and border hours before travelling.')}</div></div>`)}
    ${heading('Budget', field('budget', 'Total Trip Budget per Person (RMB)', input('budget', 'number', f.budget, 'min="0" step="any" inputmode="decimal" aria-describedby="budget-help" placeholder="Enter amount"'), 'Includes round-trip transport, listed meals, snacks, drinks and standard admission. Personal shopping and optional paid activities are excluded. A range overlapping your budget is shown with an overspend warning.'))}
    <section class="fields">
    ${root ? submit('Find Trips') : ''}${action('reset-filters', 'Reset Filters')}</section></form>`, root ? tabbar() : toolbar(submit('Find Trips', 'planner')), root);
}

function collectFilters(form) {
  const fields = new FormData(form);
  const next = { ...state.filters, ...Object.fromEntries(fields), start: campus, end: campus };
  next.interests = state.filters.mode === 'interests' ? fields.getAll('interests') : state.filters.interests;
  return next;
}

function validateFilters(f) {
  const errors = {};
  if (f.mode === 'destination' && !f.destination) errors.destination = 'Choose a destination.';
  if (f.mode === 'interests' && !f.interests.length) errors.interests = 'Select at least one interest.';
  if (!f.date || f.date < today()) errors.date = 'Choose today or a future date.';
  if (!f.departure) errors.departure = 'Choose a departure time.';
  if (f.returnBy && f.returnBy <= f.departure) errors.returnBy = 'Choose a return time after departure.';
  if (!Number.isFinite(Number(f.budget)) || Number(f.budget) <= 0) errors.budget = 'Enter a budget above 0.';
  return errors;
}

function renderErrors(form, errors, focusFirst = true) {
  for (const message of form.querySelectorAll('.error')) { message.hidden = true; message.textContent = ''; }
  for (const control of form.querySelectorAll('[aria-invalid]')) {
    control.removeAttribute('aria-invalid');
    control.removeAttribute('aria-describedby');
    if (control.id === 'budget') control.setAttribute('aria-describedby', 'budget-help');
  }
  for (const [id, text] of Object.entries(errors)) {
    const element = document.getElementById(id);
    const message = document.getElementById(id + '-error');
    message.textContent = text;
    message.hidden = false;
    element.setAttribute('aria-invalid', 'true');
    element.setAttribute('aria-describedby', (id === 'budget' ? 'budget-help ' : '') + message.id);
  }
  const first = document.getElementById(Object.keys(errors)[0]);
  if (first && focusFirst) { first.focus({ preventScroll: true }); first.scrollIntoView({ block: 'center' }); }
}

function eligibleTrips(f) {
  const matches = [];
  const outside = [];
  const related = [];
  const missing = { coverage: false, interest: false, time: false, cost: false, availability: false };
  for (const route of data.routes) {
    if (route.city !== state.city || route.departure_id !== f.start || route.return_id !== f.end) continue;
    missing.coverage = true;
    const matchedTags = route.interest_tags.split(/;\s*/).filter(tag => f.interests.includes(tag));
    if (f.mode === 'destination' ? !stopsFor(route.route_id).slice(1, -1).some(stop => stop.place_id === f.destination) : !matchedTags.length) continue;
    missing.interest = true;
    related.push(route);
    if (f.returnBy && route.duration_min > minutes(f.returnBy) - minutes(f.departure)) continue;
    missing.time = true;
    // Match the full listed itinerary estimate, including transport, food and admission.
    const summary = window.BayGoBudget.summarize(route.budget_items || [], f.budget);
    const total = summary.missing.length ? null : {min:summary.min,max:summary.max};
    if (!total || !Number.isFinite(total.min) || !Number.isFinite(total.max) || total.min < 0 || total.max < total.min) {
      missing.cost = true;
      continue;
    }
    const availability = route.verified_availability;
    if (availability && (!availability.dates?.includes(f.date) || f.departure < availability.earliest_departure || f.departure > availability.latest_departure)) {
      missing.availability = true;
      continue;
    }
    const budget = Number(f.budget);
    const status = total.min > budget ? 'outside' : total.max > budget ? 'warning' : 'within';
    const reason = f.mode === 'destination' ? `Includes your destination: ${placeName(f.destination)}.` : `Matches your interests: ${matchedTags.join(', ')}.`;
    const match = { route, total, status, reason, score: matchedTags.length };
    (status === 'outside' ? outside : matches).push(match);
  }
  const sort = (a, b) => (a.status === 'warning') - (b.status === 'warning') || b.score - a.score || a.route.duration_min - b.route.duration_min || a.route.route_id.localeCompare(b.route.route_id);
  return { matches: matches.sort(sort).slice(0, 3), outside: outside.sort(sort), related, missing };
}

const costRange = total => `CNY ${total.min}${total.max === total.min ? '' : '–' + total.max} / person`;
function matchBadge(status) {
  if (status === 'within') return badge('Estimated total within budget', 'good');
  if (status === 'warning') return badge('May exceed your budget', 'warn');
  return badge('Estimated total over budget', 'warn');
}

function results() {
  const f = entry.filters || state.filters;
  const edit = link('E01', 'Edit Filters', { edit: '1' }, 'outline');
  if (Object.keys(validateFilters(f)).length) return show(notice('No trips match all your filters.', 'Complete your trip filters to see suggestions.', edit));
  const { matches, outside, related, missing } = eligibleTrips(f);
  const shortest = related.length ? Math.min(...related.map(route => route.duration_min)) : 0;
  const reason = !missing.coverage ? 'No curated routes support this starting point and end point.'
    : !missing.interest ? 'No curated routes cover the selected destination or interests.'
    : !missing.time ? 'The shortest related round trip takes about ' + duration(shortest) + '. Try an earlier departure or a longer travel window.'
    : missing.cost ? 'Full-trip costs have not been estimated for the available routes.'
    : missing.availability ? 'Route availability has not been confirmed for your selected date and time.'
    : 'Try a higher budget.';
  const exploreFood = f.mode === 'interests' && f.interests.includes('Food & Drinks');
  const food = exploreFood ? directoryPlaces.filter(item => item.city === 'Zhuhai' && ['Restaurants','Cafes & Desserts'].includes(item.category)) : [];
  const ideas = !matches.length && f.mode === 'interests'
    ? [...new Map(related.filter(route => !food.some(item => item.id === route.destination_id)).map(route => [route.destination_id, route])).values()].slice(0, 3)
    : [];
  show(`<section class="card"><h2>Your filters</h2><p>${esc(f.mode === 'destination' ? placeName(f.destination) : f.interests.join(', '))} · ${esc(f.date)}</p>
    <p class="meta">${esc(f.departure + (f.returnBy ? '–' + f.returnBy : ' · Flexible return'))} · CNY ${esc(f.budget)} / person · ${esc(placeName(f.start) + ' → ' + placeName(f.end))}</p>${edit}</section>
    <section class="stack"><p class="meta">Suggestions are matched from our curated routes. Travel times and full-trip costs are estimates, not live updates. Budgets include the listed transport, meals, drinks and admission. Check the breakdown for reference prices and planning allowances.</p>
    ${matches.length ? matches.map(match => routeCard(match.route, match)).join('') : notice('No trips match all your filters.', reason,
    `<div class="cluster">${link('E01', 'Edit Filters', { edit: '1' }, 'primary')}${action('reset-from-results', 'Reset Filters')}</div>`)}</section>
    ${food.length ? heading('Food & Drinks in Zhuhai', `<div class="stack"><p class="meta">Browse cafés and restaurants. Check opening hours before travelling.</p>
    <div class="card-list">${food.slice(0, 3).map(directoryCard).join('')}</div>
    ${link('D01', 'See all ' + food.length + ' food places', { city: 'Zhuhai', category: 'All' }, 'outline')}</div>`) : ''}
    ${ideas.length ? heading('Places to explore', `<div class="stack"><p class="meta">These places match your interests. Check hours and prices before making plans.</p>
    ${ideas.map(route => `<article class="card"><h3>${esc(placeName(route.destination_id))}</h3>
    <p class="meta">${duration(route.duration_min)} estimated round trip from ${esc(placeName(route.departure_id))}</p>
    ${link('E04', 'View Place', { id: route.destination_id }, 'outline')}</article>`).join('')}</div>`) : ''}
    ${outside.length ? `<section><details><summary>Options outside your budget</summary>${outside.slice(0, 3).map(match => `<p>Estimated amount above your budget · CNY ${match.total.min - Number(f.budget)}${match.total.max !== match.total.min ? '–' + (match.total.max - Number(f.budget)) : ''} / person</p>${routeCard(match.route, match)}`).join('')}</details></section>` : ''}`);
}

function tripDetails() {
  const route = lookup(data.routes, 'route_id', params.get('id'));
  if (!route) return unavailable();
  const f = entry.filters;
  const match = f && Object.keys(validateFilters(f)).length === 0 ? [...eligibleTrips(f).matches, ...eligibleTrips(f).outside].find(item => item.route === route) : null;
  const stops = stopsFor(route.route_id);
  const at = offset => match ? clock(minutes(f.departure) + offset) : offset === 0 ? 'Start' : '+' + duration(offset);
  const fare = costRange(route.transport_estimate_cny || {min:route.cost_min_cny,max:route.cost_max_cny});
  show(`<section class="stack trip-intro">
    ${detailPhoto(routePhotos[route.route_id])}
    <div class="cluster trip-tags">${badge(esc(route.city) + ' · Curated route')}${badge(duration(route.duration_min) + ' round trip')}${badge(esc(route.transport_modes))}</div>
    <h2 class="title">${esc(route.title_en)}</h2><p>${esc(route.summary_en)}</p>${action('share-route','Share Route to Student Stories','primary',`data-kind="recommended" data-id="${esc(route.route_id)}"`)}</section>
    <section>${match ? notice('Match details', esc(match.reason), matchBadge(match.status)) : notice('Estimated full-trip budget', 'Recommendations compare the full listed trip estimate with your budget. Check the itemised assumptions below; prices and opening hours can change.')}</section>
    ${heading('Itinerary · suggested timings', `<p class="meta">Follow the stops in order. Open each place for its map and directions; actual travel times depend on traffic and service schedules.</p><ol class="timeline">${stops.map((stop, index) => {
      const isEnd = index === stops.length - 1;
      const title = isEnd ? 'Return to ' + placeName(stop.place_id) : placeName(stop.place_id);
      return `<li><strong><a href="${url('E04', { id: stop.place_id })}">${esc(title)}</a></strong>
      <p class="meta">${index === 0 ? 'Departure' : 'Arrival'} · ${at(index === 0 ? stop.departure_offset_min : stop.arrival_offset_min)}
      ${stop.stay_min ? ` · Stay ${duration(stop.stay_min)} · Depart ${at(stop.departure_offset_min)}` : ''}</p>
      ${stop.stay_min ? `<p class="meta">${esc(place(stop.place_id)?.hours_or_booking)}</p>` : ''}
      ${!isEnd && directoryPlaces.find(p => p.id === stop.place_id) ? `<p>${link('E04', 'View this stop & directions', {id: stop.place_id})}</p>` : ''}
      ${isEnd ? '' : `<div class="leg"><strong>${esc(stop.next_transport)} · ${duration(stop.move_min)} · ${stop.leg_cost_cny == null ? 'Not confirmed' : 'CNY ' + stop.leg_cost_cny}</strong><p class="meta">${esc(stop.next_leg_en)}</p></div>`}</li>`;
    }).join('')}</ol>`)}
    ${heading('Estimated cost per person', rows((route.budget_items || []).map(item => [item.label, costRange(item)]).concat([['Estimated trip total', (route.budget_items || []).length ? costRange(window.BayGoBudget.summarize(route.budget_items)) : 'Not confirmed']])) + `<p class="meta">${esc(route.cost_note_en)}</p><details><summary>Price sources and assumptions</summary>${(route.budget_items || []).map(item => `<p><strong>${esc(item.label)}</strong>: ${esc(item.note)} ${item.source ? external(item.source,'Source') : ''}</p>`).join('')}</details>`)}
    ${heading('Before you go', para(route.conditions) + visitorActions(route.route_id))}
    ${travelFromBNBU(route.destination_id, route.city)}
    <section class="cluster">${link('F01', 'Report an Issue', { kind: 'trip', id: route.route_id })}
      ${match && data.activities.some(item => item.city === route.city && activitySchedule(item).starts.startsWith(f.date)) ? link('Q01', 'Find Related Buddies', { tab: 'buddies', city: route.city, date: f.date }) : ''}</section>`,
    toolbar(saveButton('trip', route.route_id), link('E01', 'Edit Filters', { edit: '1' }, 'outline')));
}

function directoryPhoto(item, detail = false) {
  const photo = item.photo;
  if (!photo) return '';
  const img = `<img class="travel-photo" loading="lazy" decoding="async" src="${esc(photo.src)}" alt="${detail ? esc(photo.title) : ''}">`;
  return detail ? `<figure class="detail-photo directory-photo">${img}<figcaption>${esc(photo.label)}</figcaption></figure>` : img;
}

function visitorActions(id) {
  const items = (data.visitorActions || []).filter(item => item.content_id === id && item.action_type !== 'copy_text');
  return items.length ? `<ul class="visitor-actions">${items.map(item => `<li>
    ${item.action_type === 'copy_text' ? action('copy-text', esc(item.action_label_en), 'outline', `data-copy="${esc(item.value)}"`)
      + `<p class="meta copy-value" lang="zh">${esc(item.value)}</p>`
      : external(item.value, item.action_label_en)}
    <p class="meta">${esc(item.purpose_en)}</p></li>`).join('')}</ul>` : '';
}

function travelFromBNBU(id, city) {
  const crossCity = crossCityJourney(id, city);
  if (crossCity) return crossCity;
  const live = window.BAYGO_TRANSIT_SNAPSHOT?.[id];
  if (live) return heading('Transit from BNBU', `<div class="card stack"><p><strong>About ${duration(live.minutes)}</strong> · ${esc((Number(live.distance)/1000).toFixed(1))} km</p><p>${live.lines.map(n => 'Bus ' + esc(n)).join(' → ')}</p><p>${live.fare ? 'Estimated transit fare: CNY ' + esc(live.fare) : 'Fare not confirmed'}</p><p class="meta">Queried ${esc(live.checked)} from the BNBU main-campus entrance. This is a saved estimate, not live navigation from your location. Check Amap before departure.</p></div>`);

  const estimates = transportRows.filter(row => row.id === id && Number.isFinite(row.minutes));
  const crossBorder = city === 'Hong Kong' || city === 'Macao';
  const directions = { '去程': 'Outbound', '返程': 'Return', '晚间返程': 'Evening return' };
  const segment = row => `<article class="card">
    <h3>${directions[row.direction]}</h3>
    <p><strong>About ${duration(Math.round(row.minutes))}</strong> · ${Number.isFinite(row.fare) ? esc(row.currency) + ' ' + esc(row.fare) + ' estimated transport' : 'Fare not confirmed'}</p>
    <p class="meta">Sample departure ${esc(row.date)} · ${esc(row.time)} local time</p>
    <p class="meta">Open the journey in Amap for current stops and transfers.</p>
    ${row.link ? `<p>${external(row.link, 'Check this journey in Amap')}</p>` : ''}
  </article>`;
  if (estimates.length) {
    return heading('Getting there from BNBU', `<div class="stack">
    <p class="meta">Amap estimates use the BNBU main-campus entrance. Check departures, last services and any rail ticket before travelling.</p>
    ${estimates.map(segment).join('')}</div>`);
  }
  if (crossBorder) {
    const gateway = city === 'Macao' ? 'PORT-ZH-HQ' : 'PORT-ZH-HZMB';
    const port = transportRows.filter(row => row.id === gateway && Number.isFinite(row.minutes));
    const bridge = city === 'Hong Kong' ? transportRows.filter(row => row.id === gateway && row.status === '运营方日间票价') : [];
    return heading('Getting there from BNBU', `<div class="stack">
      <p class="meta">Campus to ${city === 'Macao' ? 'Hengqin Port' : 'HZMB Zhuhai Port'} estimates. Allow time for border checks and local connections.</p>
      ${port.map(segment).join('')}
      ${bridge.length ? `<div class="card"><h3>Daytime bridge shuttle fares</h3>
      ${bridge.map(row => `<p>${row.direction === '跨境去程' ? 'Zhuhai → Hong Kong' : 'Hong Kong → Zhuhai'} · ${esc(row.currency)} ${esc(row.fare)}</p>`).join('')}
      ${external(bridge[0].source, 'Check shuttle fares and service')}</div>` : ''}
      <p class="meta">Total time and fare to this place are not confirmed.</p></div>`);
  }
  return heading('Getting there from BNBU', '<p class="meta">Travel time and fare are not confirmed for this place.</p>');
}

function directoryCard(item) {
  return `<article class="card directory-card">
    ${directoryPhoto(item)}
    <div class="directory-card-body"><p class="eyebrow">${esc(item.category)} · ${esc(item.city)}</p>
    <h3>${esc(item.name)}</h3><p class="meta">${esc(item.city)}</p>${item.photo?.referenceNote ? `<p class="meta">${esc(item.photo.referenceNote)}</p>` : ''}${placePriceBrief(item)}
    ${link('E04', 'View Place', { id: item.id }, 'text')}</div>
  </article>`;
}

function priceReferenceRecord(item) {
  if (!item) return null;
  const record = window.BAYGO_PRICE_REFERENCES?.records?.[item.id];
  if (!record || !['average_spend', 'admission'].includes(record.kind)
    || !Number.isFinite(record.amount) || record.amount < 0 || record.currency !== item.currency) return null;
  if (record.kind === 'average_spend' && (record.amount === 0 || item.amapPoint?.id !== record.sourcePoiId || item.amapPoint?.reference !== false)) return null;
  return record;
}

const priceMoney = (amount, currency) => `${currency} ${new Intl.NumberFormat('en-GB', { maximumFractionDigits: 2 }).format(amount)}`;

function placePriceText(item) {
  const record = priceReferenceRecord(item);
  if (!record) return ['Music & Shows', 'Sports'].includes(item?.category) ? 'Price depends on the event or booking' : 'Price not confirmed';
  if (record.kind === 'average_spend') return `Average spend: ~${priceMoney(record.amount, record.currency)} / person${record.status === 'historical_reference' ? ' · historical' : ''}`;
  return record.amount === 0 ? 'Free general admission' : `Standard admission: ${priceMoney(record.amount, record.currency)} / person`;
}

function placePriceBrief(item) {
  return `<p class="meta price-brief">${esc(placePriceText(item))}</p>`;
}

function placePriceDetails(item) {
  const record = priceReferenceRecord(item);
  if (!record) {
    const type = item?.category;
    const explanation = ['Music & Shows', 'Sports'].includes(type)
      ? 'Tickets or bookings depend on the event, seat and date. A venue-wide average is not a ticket price.'
      : ['Restaurants', 'Cafes & Desserts'].includes(type)
        ? 'A reliable average spend for this exact branch has not been confirmed. Check the current menu before deciding your budget.'
        : 'No verified admission or spending amount has been recorded. Missing information does not mean free entry.';
    return `<div class="price-reference"><p><strong>${esc(placePriceText(item))}</strong></p><p class="meta">${esc(explanation)}</p>${item?.mapUrl ? `<p>${external(item.mapUrl, 'Check this place in Amap')}</p>` : ''}</div>`;
  }
  const historical = record.status === 'historical_reference';
  const dates = historical
    ? `Historical reference; original price lookup date was not recorded. Evidence reviewed ${record.evidenceReviewedOn || 'date not recorded'}.`
    : `Source checked ${record.sourceCheckedOn || 'date not recorded'}${record.sourcePublishedOn ? '; published ' + record.sourcePublishedOn : ''}.`;
  const concessions = (record.concessions || []).filter(rate => Number.isFinite(rate.amount) && rate.amount >= 0).map(rate =>
    `<p><strong>${esc(rate.label)}: ${esc(priceMoney(rate.amount, record.currency))}</strong></p><p class="meta">${esc(rate.conditions)}</p>`).join('');
  return `<div class="price-reference stack"><p><strong>${esc(placePriceText(item))}</strong></p>
    <p class="meta">${esc(record.scope)}</p>${concessions}<p class="meta">${esc(record.conditions)}</p>
    <p class="meta">${esc(dates)}</p><p class="meta">Source: ${external(record.sourceUrl, record.sourceName)}</p>
    ${record.sourcePoiName ? `<p class="meta">Matched branch: ${esc(item.name)}</p>` : ''}</div>`;
}

function stopCostReferences(ids) {
  const groups = {};
  const missing = [];
  let known = 0;
  for (const id of [...new Set(ids)]) {
    const item = directoryPlaces.find(place => place.id === id);
    const record = priceReferenceRecord(item);
    if (!record) { missing.push(id); continue; }
    known += 1;
    groups[record.currency] = Math.round(((groups[record.currency] || 0) + record.amount) * 100) / 100;
  }
  return { groups, missing, known, total: new Set(ids).size };
}

function stopCostPanel(ids) {
  const result = stopCostReferences(ids);
  return heading('Known stop-cost references', `<div class="card stack">
    ${Object.entries(result.groups).map(([currency, amount]) => `<p><strong>${esc(priceMoney(amount, currency))}</strong> · subtotal of recorded food averages and standard admission</p>`).join('') || '<p>No reliable stop-cost amounts are available for this selection yet.</p>'}
    <p class="meta">${result.known} of ${result.total} selected stops have a price reference.${result.missing.length ? ` Costs at ${result.missing.length} ${result.missing.length === 1 ? 'stop are' : 'stops are'} still unconfirmed.` : ''}</p>
    <p class="meta">This is not a complete trip budget. Transport, unpriced stops, shopping and extras are excluded. Food averages can vary; standard tickets are used without applying concessions. Different currencies are listed separately and are not converted.</p></div>`);
}

function selectedPlanIds(city = state.city) {
  return [...new Set(state.customPlans?.[city] || [])].filter(id =>
    directoryPlaces.some(item => item.id === id && item.city === city));
}

function planControls(item) {
  if (!item || item.city !== state.city) return '';
  const ids = selectedPlanIds();
  const added = ids.includes(item.id);
  return `<section class="stack plan-place-actions">
    ${added ? '<button type="button" class="btn outline" disabled>Added to My Plan</button>'
      : action('add-plan-stop', 'Add to My Plan', 'primary', `data-id="${esc(item.id)}"`)}
    ${link(ids.length >= 2 ? 'P02' : 'P01', ids.length >= 2 ? `View My Route (${ids.length} stops)` : 'Continue Choosing Places', {}, 'outline')}
    <p class="meta">${added ? 'This place is already in your selection. Edit the selected places to change your route.' : 'Add this place once, then choose another stop to build your route.'}</p>
  </section>`;
}

const mapPoint = item => {
  const point = item?.amapPoint;
  if (point && Number.isFinite(point.longitude) && Number.isFinite(point.latitude)) return [point.entranceLongitude || point.longitude, point.entranceLatitude || point.latitude];
  return null;
};
const hasMapPin = item => !!mapPoint(item);
function placeMap(item) {
  const point = mapPoint(item);
  if (!point) return '';
  const query = new URLSearchParams({lng: point[0], lat: point[1], name: item.name, zoom:16, platform:'pc', src:'BayGo'});
  return `<div class="place-map"><iframe src="https://www.amap.com/ssr/embed/place?${esc(query.toString())}" title="Map of ${esc(item.name)}" loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe><p class="meta">${item.amapPoint.reference ? (item.pinNote || 'Area reference pin. Confirm the exact entrance in Amap.') : 'Amap destination pin. Check the entrance before travelling.'} ${external(item.mapUrl, 'Open full map')}</p></div>`;
}

function directory() {
  const requestedCity = state.city;
  const city = directoryCities.includes(requestedCity) ? requestedCity : 'All';
  const category = params.get('category') || 'All';
  const search = params.get('search') || '';
  const view = params.get('view') === 'map' ? 'map' : 'list';
  const filters = { city, category, search };
  const matches = directoryPlaces.filter(item =>
    (city === 'All' || item.city === city) &&
    (category === 'All' || item.category === category) &&
    [item.name, item.localName, item.district, item.address, item.notes].join(' ').toLowerCase().includes(search.trim().toLowerCase()));
  const mapped = matches.filter(hasMapPin);
  const pin = mapped.find(item => item.id === params.get('pin')) || mapped[0];
  show(`<section class="card">
    <form id="directory-filter" data-view="${view}" class="fields">
      ${field('search', 'Search places', input('search', 'search', search, 'placeholder="Name, area or address" maxlength="100"'))}
      <div class="pair"><input type="hidden" name="city" value="${esc(city)}"><p>${esc(city)} · ${link('H01','Change city on Home')}</p>
      ${field('category', 'Category', select('category', ['All', ...directoryCategories].map(name => [name, name]), category))}</div>
      ${submit('Search')}
    </form></section>
    <section class="stack">
      <div class="segmented" aria-label="Place views">${link('D01', 'List', { ...filters, view: 'list' }, view === 'list' ? 'outline selected' : 'outline')}
      ${link('D01', 'Map', { ...filters, view: 'map' }, view === 'map' ? 'outline selected' : 'outline')}</div>
      ${view === 'map' ? `<p class="meta">${mapped.length} of ${matches.length} places have a map pin.</p>
        ${pin ? `<form id="directory-pin" class="card fields">
        ${field('pin', 'Choose a place', select('pin', mapped.map(item => [item.id, item.name]), pin.id))}
        ${submit('Show on Map')}</form>${placeMap(pin)}${directoryCard(pin)}`
        : notice('No map pins for these filters', 'Switch to List to view available addresses and map search links.', link('D01', 'View List', { ...filters, view: 'list' }, 'outline'))}`
      : `<p class="meta">${matches.length} ${matches.length === 1 ? 'place' : 'places'}</p>
        <div class="card-list">${matches.map(directoryCard).join('') || notice('No places found', 'Try a different name, city or category.')}</div>`}
    </section>`);
}

function placeDetails() {
  const id = params.get('id');
  const local = place(id);
  const item = directoryPlaces.find(record => record.id === id);
  if (!local && !item) return unavailable();
  const name = item?.name || local.name_en;
  const address = (item?.address !== 'Not confirmed' ? item?.address : null) || local?.address || 'Not confirmed';
  const mapUrl = item?.mapUrl || (local?.map_search_text ? 'https://uri.amap.com/search?' + new URLSearchParams({ keyword: local.map_search_text, city: '珠海', src: 'BayGo' }) : 'https://uri.amap.com/search?' + new URLSearchParams({keyword: name, city: item?.cityLocal || '珠海', src: 'BayGo'}));
  const related = data.routes.filter(route => stopsFor(route.route_id).some(stop => stop.place_id === id));
  const canPlan = related.some(route => stopsFor(route.route_id).slice(1, -1).some(stop => stop.place_id === id));
  const photo = item?.photo;
  const hours = item?.hours === '按节目和票面查询' ? 'Check the event listing and ticket' : item?.hours;
  show(`<section class="stack">
    ${photo ? directoryPhoto(item, true) : detailPhoto(placePhotos[id])}
    <p class="eyebrow">${esc(item?.city || 'Zhuhai')} · ${esc(item?.category || 'Place')}</p>
    <h2 class="title">${esc(name)}</h2>
    ${para(item?.descriptionEn || local?.description_en)}</section>
    ${heading('Location', `<div class="card stack">
      <p>${esc(item ? item.name + ', ' + item.city : 'BNBU main campus, Zhuhai')}</p>
      ${item && hasMapPin(item) ? placeMap(item) : '<p class="meta">Map pin not confirmed.</p>'}
      ${mapUrl ? `<p>${external(mapUrl, item?.amapPoint ? 'Open location in Amap' : 'Search in Amap')}</p>` : ''}
      ${amapDirections(item, mapUrl)}
    </div>`)}
    ${heading('Cost and access', rows([['Hours or sessions', esc(hours && !/[\u3400-\u9fff]/.test(hours) && hours !== 'Not confirmed' ? hours : 'Check current opening hours before visiting')]])
      + placePriceDetails(item) + '<p class="meta">Confirm current hours, prices and entry rules before travelling.</p>')}
    ${travelFromBNBU(id, item?.city || 'Zhuhai')}
    ${visitorActions(id)}
    ${photo ? `<p class="meta">Photo by ${esc(/[\u3400-\u9fff]/.test(photo.author || '') ? 'Wikimedia Commons contributor' : photo.author)} · ${external(photo.page, 'Original photo')} · ${external(photo.licenseUrl, photo.license)}</p>` : ''}
    ${related.length ? heading('Related trips', `<div class="card-list">${related.map(route => routeCard(route)).join('')}</div>`) : ''}
    ${planControls(item)}`);
}

const guideCategory = item => item.category === 'Health' ? 'Healthcare' : item.category;
function guideCard(item) {
  return `<article class="card"><p class="eyebrow">${esc(guideCategory(item))}</p><h3>${esc(item.title_en)}</h3><p>${esc(item.audience_en)}</p>
    <p class="meta">Last checked · ${esc(item.last_checked || 'Not confirmed')}</p>${link('L02', 'View Guide', { id: item.guide_id }, 'outline')}</article>`;
}

function life() {
  const filters = state.lists.life || {};
  const categories = ['All', 'Healthcare', 'Documents & Public Services', 'Daily Essentials', 'Intercity Travel'];
  const results = guidesForCity(state.city).filter(item => (!filters.category || filters.category === 'All' || guideCategory(item) === filters.category)
    && Object.values(item).some(value => String(value).toLowerCase().includes((filters.search || '').trim().toLowerCase())));
  show(`<section class="stack">${cityButton()}${link('L03','Intercity Travel & Tickets',{},'primary')}
    <form id="life-filter" class="fields">${field('search', 'Search guides', input('search', 'search', filters.search, 'placeholder="Search guides"'))}
    ${field('category', 'Category', select('category', categories.map(value => [value, value]), filters.category || 'All'))}
    <div>${submit('Search')}</div><div class="filter-reset">${action('clear-life', 'Clear Filters', 'reset-link')}<p class="meta">Only resets the search and category.</p></div></form></section>
    <section class="card-list">${results.map(guideCard).join('') || notice('No guides found.', 'Try another keyword or category. Local public-service guides currently focus on Zhuhai.',link('L03','Browse Intercity Travel',{},'outline'))}</section>`, tabbar(), true);
}

function guideDetails() {
  const item = lookup(data.guides, 'guide_id', params.get('id'));
  if (!item) return unavailable();
  if(item.guide_id===permitGuide.guide_id) return permitGuideDetails();
  const intercity=intercityGuides.find(guide=>guide.guide_id===item.guide_id);
  if(intercity) return intercityGuideDetails(intercity);
  const location = place(item.location_id);
  const checklist = state.checklist[item.guide_id] || {};
  const steps = item.steps_en.split('\n').map(line => line.replace(/^\d+\.\s*/, ''));
  show(`<section class="stack"><p class="eyebrow">${esc(item.city + ' · ' + guideCategory(item))}</p><h2 class="title">${esc(item.title_en)}</h2></section>
    ${heading('Who This Guide Is For', para(item.audience_en))}
    ${heading('What You Can Do', '<p>Find the booking channel and prepare for a routine outpatient visit.</p>')}
    ${heading('What to Prepare', preparationChecklist(item, checklist))}
    ${heading('Steps', `<ol>${steps.map(step => `<li>${esc(step)}</li>`).join('')}</ol>`)}
    ${heading('Time and Cost', para(item.hours_and_fees_en))}
    ${heading('Where to Go', para(location?.name_en) + para(location?.address) + para(item.transport_en) + link('E04', 'View Place', { id: item.location_id }))}
    ${heading('Before You Go', para(item.status))}
    ${heading('Booking and transport', visitorActions(item.guide_id) + `<p class="meta">Last checked ${esc(item.last_checked)}</p>`)}
    <section>${link('F01', 'Report Outdated Information', { kind: 'guide', id: item.guide_id })}</section>`, toolbar(saveButton('guide', item.guide_id)));
}

function preparationItems(item) {
  if(item.guide_id===permitGuide.guide_id) return permitPreparation();
  if (Array.isArray(item.bring_items_en)) return item.bring_items_en.filter(Boolean);
  return String(item.bring_en || '').split(/\n+|;\s*|(?<=[.!?])\s+(?=[A-Z])/).map(text => text.trim()).filter(Boolean);
}

function preparationChecklist(item, checklist) {
  const items = preparationItems(item);
  if (!items.length) return '<p class="meta">Preparation requirements are not confirmed. Check the official source.</p>';
  return `<ul class="preparation-list">${items.map((text, index) => `<li><label class="check">
    <input type="checkbox" data-checklist="${esc(item.guide_id)}" data-checklist-item="${esc(text)}" ${checklist.items?.[text] ? 'checked' : ''}>
    <span>${esc(text)}</span></label></li>`).join('')}</ul>
    <p class="meta">Tick each item as you prepare. Progress is stored on this device only and does not confirm eligibility or completion of the service.</p>`;
}

function activitySchedule(item) {
  const now = new Date();
  const nowLocal = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Shanghai', dateStyle: 'short', timeStyle: 'short' }).format(now);
  const application=state.applications[item.activity_id];
  if(item.authenticity==='SIMULATED' && application?.scheduledStart && application?.scheduledEnd && application.status!=='Withdrawn') {
    return {starts:application.scheduledStart,ends:application.scheduledEnd,ended:application.scheduledEnd<nowLocal};
  }
  if (item.authenticity !== 'SIMULATED' || item.ends_local >= nowLocal) return { starts: item.starts_local, ends: item.ends_local, ended: item.ends_local < nowLocal };
  const daysToSaturday = ((6 - new Date(nowLocal.slice(0, 10) + 'T00:00:00Z').getUTCDay() + 6) % 7) + 1;
  const demoDate = new Date(Date.parse(nowLocal.slice(0, 10) + 'T00:00:00Z') + daysToSaturday * 86400000).toISOString().slice(0, 10);
  return { starts: demoDate + item.starts_local.slice(10), ends: demoDate + item.ends_local.slice(10), ended: false };
}

function activityStatus(item) {
  if (item.status === 'Cancelled') return 'Cancelled';
  if (activitySchedule(item).ended || item.status === 'Ended') return 'Ended';
  if (item.remaining <= 0 || item.status === 'Full') return 'Full';
  return 'Open for applications';
}

function activityCard(item) {
  const schedule = activitySchedule(item);
  return `<article class="card">${badge(localActivity(item) ? 'Your local demo activity' : 'Sample content')}${badge(esc(activityCategory(item)))}<h3>${esc(item.title_en)}</h3>
    <p class="meta">${localActivity(item) ? 'Local schedule' : 'Sample schedule'} · ${esc(schedule.starts)} · China Standard Time</p>
    <p>${esc(item.meeting_detail_en || placeName(item.meeting_place_id))} · ${item.remaining} places left · ${esc(item.gender || 'Any')}</p><p class="meta">${esc(item.cost_split_en)}</p>
    <p class="meta">${esc(sampleCopy(item.organizer))} · Campus verification simulated</p>
    ${link('Q02', 'View Activity', { id: item.activity_id }, 'outline')}</article>`;
}

function storyCard(item) {
  const cover = directoryPlaces.find(p => p.id === (item.photo_place_ids?.[0] || item.placeIds?.[0]));
  return `<article class="card">${cover ? directoryPhoto(cover) : ''}${badge(ownStory(item)?'Your local post':'Sample content')}<h3>${esc(item.title_en)}</h3>
    ${ownStory(item)?storyTagsMarkup(item):''}<p class="meta">${esc(item.city + ' · ' + item.category)}</p>${link('Q04', 'Read Story', { id: item.story_id }, 'outline')}</article>`;
}

function community() {
  const tab = params.get('tab') === 'stories' ? 'stories' : 'buddies';
  const stories = tab === 'stories';
  const f = { ...(state.lists[tab] || {}) };
  if (params.has('date')) f.date = params.get('date');
  if (params.has('city')) f.city = params.get('city');
  const filterCity = state.city;
  const filters = stories
    ? field('category', 'Category', select('category', ['All', 'Places', 'Food & Services', 'Travel Tips', 'Daily Life'].map(name => [name, name]), f.category || 'All'))
      + field('search', 'Keyword', input('search', 'search', f.search, 'placeholder="Search stories"'))
    : field('date', 'Date', input('date', 'date', f.date))
      + field('type', 'Type', select('type', [['All', 'All'], ['Outing', 'All outings'], ...activityCategories.map(name => [name, name])], f.type || 'All'));
  const collection = stories
    ? allStories().filter(item => item.city === filterCity && (!f.category || f.category === 'All' || item.category === f.category)
      && [item.title_en, item.body_en, item.tags_en, ...(item.placeIds || []).map(placeName), ...Object.values(item.dishes || {})].join(' ').toLowerCase().includes((f.search || '').trim().toLowerCase()))
    : allActivities().filter(item => item.city === filterCity && (!f.type || f.type === 'All' || (f.type === 'Outing' ? item.type === 'Outing' : activityCategory(item) === f.type))
      && (!f.date || activitySchedule(item).starts.startsWith(f.date)));
  show(`<section class="stack">${cityButton()}<div class="segmented" aria-label="Community sections">
    ${link('Q01', 'Find Buddies', { tab: 'buddies' }, 'outline' + (stories ? '' : ' selected'))}${link('Q01', 'Student Stories', { tab: 'stories' }, 'outline' + (stories ? ' selected' : ''))}</div>
    ${stories ? `<div class="cluster">${action('write-story',state.storyDraft?'Continue Draft':'Write a Post','primary')}${link('M07','My Posts',{},'outline')}</div>` : `<div class="cluster">${link('Q05','Find or Create',{},'primary')}${link('M06','My Activities',{},'outline')}${link('M04',`Inbox (${threadUnread()})`,{},'outline')}</div>`}
    <form id="community-filter" class="fields" data-tab="${tab}"><input type="hidden" name="city" value="${esc(state.city)}"><p>Change city on Home.</p>
    <div class="pair">${filters}</div><div>${submit('Apply Filters')}</div>
    <div class="filter-reset">${action('clear-community', 'Clear Filters', 'reset-link')}<p class="meta">Only resets the filters in this section.</p></div></form>
    ${params.has('date') ? badge('Date filter · ' + esc(f.date)) : ''}</section>
    <section class="card-list">${filterCity !== 'Zhuhai' && !collection.length && !stories ? notice('Local coverage', 'Community content is currently available for Zhuhai only.', action('zhuhai', 'Explore Zhuhai', 'primary'))
    : collection.map(stories ? storyCard : activityCard).join('') || notice(stories ? 'No stories found.' : 'No activities found.', 'Try changing your filters.', stories ? action('write-story','Write a Post','primary') : link('Q05','Find or Create',{},'primary'))}</section>`, tabbar(), true);
}

function activityDetails() {
  const item = getActivity(params.get('id'));
  if (!item) return unavailable();
  const schedule = activitySchedule(item);
  const application = state.applications[item.activity_id];
  const status = activityStatus(item);
  const button = localActivity(item) ? link('M06','Manage My Activity',{},'primary') : application && application.status !== 'Withdrawn'
    ? link('M03', 'View Application', { id: item.activity_id }, 'primary')
    : status === 'Open for applications' ? action('apply', 'Apply to Join', 'primary') : status === 'Full' ? '<button class="btn primary" disabled>Full</button>' : '';
  show(`<section class="stack">${badge(localActivity(item) ? 'Your local demo activity' : 'Sample content')}${badge(esc(activityCategory(item)))}<h2 class="title">${esc(item.title_en)}</h2>${badge(status)}
    <p>${esc(sampleCopy(item.organizer))} · Campus verification simulated</p><p class="meta">${localActivity(item) ? 'Local schedule' : 'Sample schedule'} · ${esc(schedule.starts)} to ${esc(schedule.ends)} · China Standard Time</p>
    ${para(sampleCopy(item.meeting_detail_en))}${para(sampleCopy(item.description_en))}</section>
    ${heading('Places and cost', rows([['Capacity', item.capacity], ['Places remaining', item.remaining], ['Group preference', esc(item.gender || 'Any')]]) + para(item.cost_split_en))}
    ${item.type === 'Carpool' ? heading('Carpool arrangements',rows([['From',esc(item.departure)],['To',esc(item.destination)],['Travel',esc(item.transport)],['Vehicle / booking',esc(item.vehicle)]])+ '<p class="meta">Companion request only. No vehicle booking, payment or driver verification is provided.</p>') : ''}
    ${application && state.communityThreads?.[item.activity_id] ? link('M05','Open Conversation',{id:item.activity_id},'outline') : ''}
    ${heading('Before you apply', '<p>This is a simulated activity. Campus verification is simulated and does not imply endorsement.</p>')}
    <section>${link('F01', 'Report', { kind: 'activity', id: item.activity_id })}</section>`, button ? toolbar(button) : '');
}

function applicationForm() {
  const item = getActivity(params.get('id'));
  if (!item) return unavailable();
  if (!state.profile || !state.verified) return show(notice('Simulated verification required', 'Start the application from the activity page.', link('Q02', 'Back to Activity', { id: item.activity_id }, 'primary')));
  const previous = state.applications[item.activity_id];
  if (previous && previous.status !== 'Withdrawn') return show(notice('Application already saved', 'Your existing application is available in My Applications.', link('M03', 'View My Application', { id: item.activity_id }, 'primary')));
  if (localActivity(item)) return show(notice('Your activity','You cannot apply to your own activity.',link('M06','Manage My Activity')));
  if (activityStatus(item) !== 'Open for applications') return show(notice('Applications are closed', 'You can still view the original activity.', link('Q02', 'Back to Activity', { id: item.activity_id })));
  show(`<section class="stack">${notice('Simulated application', 'No real host will be contacted.')}
    <h2>${esc(item.title_en)}</h2><p class="meta">Sample schedule · ${esc(activitySchedule(item).starts)}</p>
    <form id="application" class="fields">${field('partySize','People in this application',input('partySize','number',Math.min(Number(state.communityDraft?.existing)||1,item.remaining),`required min="1" max="${item.remaining}"`),'Include yourself. Acceptance reserves this number of demo places.')} ${field('message', 'Your Message', `<textarea id="message" name="message" maxlength="200" placeholder="Share why you would like to join.">${esc(state.drafts?.[item.activity_id])}</textarea>`, 'Optional · Up to 200 characters. Please leave out contact details.')}
    <label class="check"><input type="checkbox" name="confirm" required>I understand that this is a simulated application.</label></form></section>`,
    toolbar(submit('Submit Simulated Application', 'application')));
}

function storyDetails() {
  const item = getStory(params.get('id'));
  if (!item) return unavailable();
  if(ownStory(item))return userStoryDetails(item);
  show(`<section class="stack">${badge('Sample content')}<p class="eyebrow">${esc(item.city + ' · ' + item.category)}</p><h2 class="title">${esc(item.title_en)}</h2>
    <p class="meta">${esc(sampleCopy(item.author))} · Fictional student voice</p>${(item.paragraphs || [item.body_en]).map((text, index) => { const stop = directoryPlaces.find(p => p.id === item.photo_place_ids?.[index]); return `<section class="stack">${stop?.photo ? directoryPhoto(stop, true) : ''}${para(text)}${stop ? link('E04', 'Explore ' + esc(stop.name), {id:stop.id}) : ''}${stop?.photo ? `<p class="meta">${external(stop.photo.page, 'Photo source')} · ${external(stop.photo.licenseUrl, stop.photo.license)}</p>` : ''}</section>`; }).join('')}${item.route_id ? link('E03', 'Follow this itinerary', {id:item.route_id}, 'primary') : ''}</section>
    ${heading('Cost and place', para(item.cost_note_en) + (item.place_id ? link('E04', 'View Place', { id: item.place_id }) : ''))}
    ${heading('Disclosure', para(sampleCopy(item.disclosure_en || 'Not stated')))}
    <section>${link('F01', 'Report', { kind: 'story', id: item.story_id })}</section>`, toolbar(saveButton('story', item.story_id)));
}

const saveTypes = { trip: ['routes', 'route_id', 'E03', 'My Trips'], guide: ['guides', 'guide_id', 'L02', 'Saved Guides'], story: ['stories', 'story_id', 'Q04', 'Saved Stories'], activity: ['activities', 'activity_id', 'Q02', 'Activities'] };
const itemFor = (kind, id) => {
  const type = Object.hasOwn(saveTypes, kind) ? saveTypes[kind] : null;
  return kind === 'story' ? getStory(id) : kind === 'activity' ? getActivity(id) : type ? lookup(data[type[0]], type[1], id) : undefined;
};

function saveButton(kind, id) {
  const noun = kind[0].toUpperCase() + kind.slice(1);
  return action('save', state.saved[id] ? 'Remove Saved ' + noun : 'Save ' + noun, 'primary', `data-kind="${kind}" data-id="${esc(id)}"`);
}

function me() {
  show(`<section class="hero"><p class="eyebrow">Sample profile</p><h2 class="title">${state.profile ? 'BayGo Student' : 'Guest'}</h2>
    <p class="meta">${state.verified ? 'Campus verification simulated' : 'Campus verification not completed'}</p>
    ${!state.profile ? action('sign-in', 'Sign In with a Sample Profile', 'primary') : ''}</section>
    <section class="stack">${['trip', 'guide', 'story'].map(kind => link('M02', saveTypes[kind][3], { kind }, 'outline full')).join('')}
    ${link('M07','My Posts',{},'outline full')}${link('M04',`Inbox (${threadUnread()})`,{},'outline full')}${link('M06','My Activities',{},'outline full')}${link('M03', 'My Applications', {}, 'outline full')}${link('I01', 'About BayGo', {}, 'outline full')}</section>${localDataSettings()}`, tabbar(), true);
}

function savedItems() {
  const kind = params.get('kind') || 'trip';
  if (!['trip', 'guide', 'story'].includes(kind)) return unavailable();
  const type = saveTypes[kind];
  const items = (kind==='story'?allStories():data[type[0]]).filter(item => state.saved[item[type[1]]] === kind);
  const browse = { trip: 'E01', guide: 'L01', story: 'Q01' }[kind];
  show(`<section class="stack"><h2 class="title">${type[3]}</h2>${state.profile
    ? items.map(item => `<article class="card"><p class="eyebrow">${esc(item.city)}</p><h3>${esc(item.title_en)}</h3>${link(type[2], 'View Details', { id: item[type[1]] }, 'outline')}</article>`).join('')
      || notice('No saved items yet', 'Saved items will appear on this device.', link(browse, 'Browse', kind === 'story' ? { tab: 'stories' } : {}, 'primary'))
    : notice('Try a sample profile', 'Sign in to view items saved on this device.', action('sign-in', 'Sample Sign-in', 'primary'))}</section>`);
}

function applications() {
  const id = params.get('id');
  const sample = params.get('sample') === '1';
  const success = params.get('saved') === '1';
  if (id && !itemFor('activity', id)) return unavailable();
  const applications = Object.entries(state.applications).filter(([activityId]) => !id || activityId === id);
  show(`<section class="stack">
    ${success && id && state.applications[id] ? notice('Simulated application saved on this device.', 'No real host was contacted.', `<div class="cluster">${link('M03', 'View My Application', { id }, 'primary')}${link('Q02', 'Back to Activity', { id })}</div>`) : ''}
    <p class="meta">Applications and verification are simulated and stay on this device.</p>
    ${sample ? `<article class="card">${badge('Sample application')}<h2>Accepted</h2><p>${esc(data.activities[0]?.title_en || 'Sample activity')}</p><p class="meta">This read-only example is separate from your applications.</p></article>` : link('M03', 'Try an Accepted Example', { sample: '1' }, 'outline')}
    ${state.profile ? applications.map(([activityId, record]) => {
      const item = itemFor('activity', activityId);
      if (!item) return '';
      return `<article class="card">${badge(esc(record.status), record.status === 'Accepted' ? 'good' : '')}<h3>${esc(item.title_en)}</h3>
      <p class="meta">${Number(record.partySize)||1} person(s) in this application.</p>${record.message ? para(record.message) : ''}${link('M05','Open Conversation',{id:activityId},'outline')}${link('Q02', 'Back to Activity', { id: activityId })}
      ${['Pending','Accepted'].includes(record.status) ? action('withdraw', 'Withdraw Application', 'outline', `data-id="${esc(activityId)}"`) : ''}
      ${record.status === 'Pending' && !localActivity(item) ? `<details class="demo-controls"><summary>Demo controls: simulate a host decision</summary><p class="meta">You are changing this local example yourself. No real host has responded.</p>${action('demo-decision','Simulate Accept','outline',`data-id="${esc(activityId)}" data-status="Accepted"`)}${action('demo-decision','Simulate Decline','outline',`data-id="${esc(activityId)}" data-status="Declined"`)}</details>` : ''}</article>`;
    }).join('') || '<p>No simulated applications yet.</p>' : action('sign-in', 'Sample Sign-in', 'primary')}</section>`);
}

function auth() {
  const signIn = page === 'A01';
  show(notice(titles[page], signIn ? 'Use a sample profile to try saving and applying. No real account is created.' : 'This simulates a campus email check. No email will be sent.',
    `<div class="cluster">${action(signIn ? 'complete-sign-in' : 'complete-verification', signIn ? 'Continue with Sample Profile' : 'Simulate Verification', 'primary')}${action('back', signIn ? 'Not Now' : 'Cancel')}</div>`));
}

function report() {
  const kind = params.get('kind');
  const item = itemFor(kind, params.get('id'));
  if (!item) return unavailable();
  const options = ['Outdated information', 'Incorrect cost or route', 'Suspected advertising', 'Harassment or inappropriate content', 'Other'];
  const reasons = kind === 'trip' ? [options[0], options[1], options[4]] : kind === 'guide' ? [options[0], options[4]] : options;
  show(`<section class="stack"><h2>${esc(item.title_en)}</h2><p class="meta">This report is saved locally. Please leave out contact details.</p>
    <form id="report" class="fields">${field('reason', 'Reason', select('reason', reasons.map(text => [text, text]), reasons[0]))}
    ${field('details', 'Details', '<textarea id="details" name="details" maxlength="500"></textarea>')}</form></section>`, toolbar(submit('Save Report on This Device', 'report')));
}

function about() {
  show(`<section class="stack"><p class="eyebrow">BayGo · Student travel</p><h2 class="title">Explore the Greater Bay Area</h2>
    <p>BayGo helps BNBU students explore the Greater Bay Area through ready-made routes and personal multi-stop plans. Currently covering Zhuhai, Guangzhou, Shenzhen, Hong Kong and Macao.</p>
    <p>Choose Recommended Routes for a curated itinerary, or Start Planning to select your own stops. Where available, budgets include transport, food and standard admission. Unverified costs and timings are labelled; Amap provides individual navigation legs.</p>
    <p>This independently hosted static edition does not require ChatGPT. Live segment calculations need a separate route service; when not connected, use the labelled Amap links. External maps and photo sources still require internet access.</p>
    <p>Sample content, sign-in, campus verification and applications are simulated. Saved items and reports stay on this device.</p>
    <details class="photo-disclosure"><summary>Photo sources and licences</summary><p class="meta">Place-specific credits appear on each place and story page. The credits below cover the shared site imagery.</p>${photoCredits()}</details>
</section>`);
}

function unavailable() {
  show(notice('This item is unavailable', 'It may have moved or is currently unavailable.', `<div class="cluster">${action('back', 'Back', 'outline')}${link('H01', 'Home', {}, 'primary')}</div>`));
}

const screens = { H01: home, C01: cities, C02: cityHome, R01: curatedRoutes, R02: curatedDetails, P01: multiPlanner, P02: multiResult, E01: multiPlanner, E02: results, E03: tripDetails, E04: placeDetails, D01: directory, L01: life, L02: guideDetails, L03: intercityHub, Q01: community, Q02: activityDetails, Q03: applicationForm, Q04: storyDetails, Q05: communityFind, Q06: communityMatches, Q07: storyEditor, Q08: storyPreview, Q09: storyDraftConflict, M07: myPosts, M04: communityInbox, M05: communityConversation, M06: myActivities, M01: me, M02: savedItems, M03: applications, A01: auth, A02: auth, F01: report, I01: about };

function render({ restore = false, focus = true } = {}) {
  const [target, query] = location.hash.slice(1).split('?');
  page = target || 'H01';
  params = new URLSearchParams(query);
  entry = history.state;
  if (!entry?.id) {
    entry = { id: crypto.randomUUID?.() || String(Date.now()) };
    history.replaceState(entry, '', location.href);
    if (page === 'E01') {
      if (params.has('mode')) state.filters.mode = params.get('mode') === 'interests' ? 'interests' : 'destination';
      if (params.has('destination')) state.filters.destination = params.get('destination');
    }
  }
  if (Object.hasOwn(screens, page)) screens[page]();
  else unavailable();
  if (focus) app.querySelector('main')?.focus({ preventScroll: true });
  window.scrollTo(0, restore ? scrollPositions.get(entry.id) || 0 : 0);
}

function refresh() {
  scrollPositions.set(entry.id, window.scrollY);
  render({ restore: true });
}

function startAuth(task, requiresVerification = false) {
  const options = { task };
  if (!state.profile) routeTo(url('A01'), options);
  else if (requiresVerification && !state.verified) routeTo(url('A02'), options);
  else finishTask(task);
}

function finishTask(task) {
  if (task?.type === 'story') {
    routeTo('#Q07');
  } else if (task?.type === 'community') {
    routeTo('#Q05?mode=create');
  } else if (task?.type === 'apply') {
    routeTo(url('Q03', { id: task.id }));
  } else {
    back();
    if (task?.type === 'save') toggleSaved(task.kind, task.id, false);
  }
}

function toggleSaved(kind, id, redraw = true) {
  if (!itemFor(kind, id)) return;
  const wasSaved = !!state.saved[id];
  const success = commit(() => {
    if (wasSaved) delete state.saved[id];
    else state.saved[id] = kind;
  });
  if (!success) return;
  const list = saveTypes[kind][3];
  announce(wasSaved ? 'Removed from ' + list : 'Saved to ' + list);
  if (redraw) refresh();
}

function selectCity(city, discard = false) {
  if (!cityNames.includes(city)) return;
  state.city = city;
  if (discard) state.filters = fresh().filters;
  state.lists.buddies = {};
  state.lists.stories = {};
  persist();
  history.replaceState({ ...entry, cityOrigin: undefined }, '', city === 'Zhuhai' ? '#H01' : url('C02', { city }));
  render();
}

const actions = {
  ...communityActions,
  ...storyActions,
  'add-plan-stop': button => {
    const item=directoryPlaces.find(p=>p.id===button.dataset.id && p.city===state.city);
    if(!item)return;
    if (selectedPlanIds().includes(item.id)) return announce('This place is already in your plan.');
    if (commit(() => { state.customPlans ||= {}; state.customPlans[state.city] = [...selectedPlanIds(), item.id]; })) {
      refresh();
      announce('Added to your plan. Continue choosing places or view your route.');
    }
  },
  'remove-plan-stop': button => {
    if (commit(() => { state.customPlans ||= {}; state.customPlans[state.city] = selectedPlanIds().filter(id => id !== button.dataset.id); })) {
      updatePlanSelection();
      updatePlanSearchResults();
      announce('Removed from this city’s plan.');
    }
  },
  'clear-plan-search': () => {
    const search = app.querySelector('#plan-place-search');
    if (!search) return;
    search.value = '';
    state.planSearch ||= {};
    state.planSearch[state.city] = '';
    persist();
    updatePlanSearchResults();
    search.focus();
  },
  'move-stop': button => {
    const ids = state.customPlans?.[state.city] || [];
    const i = ids.indexOf(button.dataset.id), next = i + Number(button.dataset.direction);
    if (i >= 0 && next >= 0 && next < ids.length) { [ids[i], ids[next]] = [ids[next], ids[i]]; persist(); refresh(); }
  },
  'use-curated': button => {
    const route = (window.BAYGO_CURATED || []).find(r => r.id === button.dataset.id);
    if (route) { state.customPlans ||= {}; state.customPlans[state.city] = [...route.stops]; persist(); routeTo('#P02'); }
  },
  back,
  'copy-text': async button => {
    try {
      await navigator.clipboard.writeText(button.dataset.copy);
      announce('Copied.');
    } catch {
      const value = button.parentElement.querySelector('.copy-value');
      const range = document.createRange();
      range.selectNodeContents(value);
      window.getSelection()?.removeAllRanges();
      window.getSelection()?.addRange(range);
      announce('Text selected. Use Copy on your device.');
    }
  },
  city: () => routeTo(url('C01'), { cityOrigin: location.hash || '#H01', fromPlanner: page === 'E01' }),
  'choose-city': button => {
    const next = button.dataset.city;
    const f = state.filters;
    const dirty = !!(f.destination || f.date || f.departure || f.returnBy || f.budget || f.interests.length);
    if (entry.fromPlanner && next !== state.city && dirty) {
      const dialog = app.querySelector('#city-confirm');
      dialog.dataset.city = next;
      dialog.showModal();
    } else selectCity(next);
  },
  'confirm-city': () => selectCity(app.querySelector('#city-confirm').dataset.city, true),
  zhuhai: () => {
    state.city = 'Zhuhai';
    state.lists.buddies = {};
    state.lists.stories = {};
    persist();
    routeTo('#H01');
  },
  mode: button => {
    state.filters = collectFilters(app.querySelector('#planner'));
    state.filters.mode = button.dataset.mode;
    persist();
    refresh();
    app.querySelector('[data-mode="' + state.filters.mode + '"]').focus();
  },
  'reset-filters': () => {
    state.filters = fresh().filters;
    persist();
    refresh();
  },
  'reset-from-results': () => {
    state.filters = fresh().filters;
    persist();
    routeTo(url('E01', { edit: '1' }));
  },
  'clear-life': () => {
    state.lists.life = {};
    persist();
    refresh();
  },
  'clear-community': () => {
    const tab = params.get('tab') === 'stories' ? 'stories' : 'buddies';
    state.lists[tab] = {};
    persist();
    history.replaceState(entry, '', url('Q01', { tab }));
    refresh();
  },
  apply: () => {
    const id = params.get('id');
    const item = itemFor('activity', id);
    if (!item || localActivity(item) || activityStatus(item) !== 'Open for applications') return;
    const existing = state.applications[id];
    if (existing && existing.status !== 'Withdrawn') return routeTo(url('M03', { id }));
    startAuth({ type: 'apply', id }, true);
  },
  withdraw: button => {
    const id = button.dataset.id;
    if (!['Pending','Accepted'].includes(state.applications[id]?.status)) return;
    if (commit(() => { state.applications[id].status = 'Withdrawn'; addCommunityEvent(id,'Application withdrawn locally. No host was notified.'); })) {
      refresh();
      announce('Simulated application withdrawn.');
    }
  },
  save: button => {
    const { kind, id } = button.dataset;
    if (state.profile) toggleSaved(kind, id);
    else startAuth({ type: 'save', kind, id });
  },
  'sign-in': () => startAuth({ type: 'return' }),
  'complete-sign-in': () => {
    if (!commit(() => { state.profile = true; })) return;
    if (['apply','community','story'].includes(entry.task?.type) && !state.verified) {
      history.replaceState(entry, '', '#A02');
      render();
    } else finishTask(entry.task);
  },
  'complete-verification': () => {
    if (!state.profile || !['apply','community','story'].includes(entry.task?.type)) return back();
    if (!commit(() => { state.verified = true; })) return;
    const task = entry.task;
    history.replaceState(entry, '', task.type==='story' ? '#Q07' : task.type === 'community' ? '#Q05?mode=create' : url('Q03', { id: task.id }));
    render();
    announce('Campus verification simulated');
  },
  'open-reset': () => app.querySelector('#clear-local-dialog').showModal(),
  'reset-demo': () => {
    if (!commit(() => { state = fresh(); })) return;
    scrollPositions.clear();
    history.replaceState({ id: 'reset-home' }, '', '#H01');
    render();
    announce('Local data reset on this device.');
  }
};

app.addEventListener('click', event => {
  const button = event.target.closest('button[data-action]');
  if (button) {
    actions[button.dataset.action]?.(button);
    return;
  }
  const anchor = event.target.closest('a[href^="#"]');
  if (!anchor || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  const target = anchor.getAttribute('href');
  if (target === location.hash) return;
  const [nextPage, query] = target.slice(1).split('?');
  const nextParams = new URLSearchParams(query);
  const options = {};
  if (nextPage === 'E01') {
    if (nextParams.has('edit') && entry.filters) state.filters = structuredClone(entry.filters);
    if (nextParams.has('mode')) state.filters.mode = nextParams.get('mode') === 'interests' ? 'interests' : 'destination';
    if (nextParams.has('destination')) state.filters.destination = nextParams.get('destination');
    persist();
  }
  if (nextPage === 'E03' && page === 'E02') options.filters = structuredClone(entry.filters || state.filters);
  routeTo(target, options);
});

app.addEventListener('input', event => {
  if (event.target.id === 'plan-place-search') {
    state.planSearch ||= {};
    state.planSearch[state.city] = event.target.value;
    persist();
    updatePlanSearchResults();
    return;
  }
  const form = event.target.form;
  if(form?.id==='story-editor') {
    if(event.target.id==='place-search') {state.storyPlaceSearch=event.target.value;persist();const draft=state.storyDraft;const matches=directoryPlaces.filter(p=>p.city===draft.city && [p.name,p.localName,p.category,p.district].join(' ').toLowerCase().includes(event.target.value.toLowerCase().trim()));const results=app.querySelector('#story-place-results');if(results)results.innerHTML=storyPlaceChoices(matches,draft);}
    else {const fields=Object.fromEntries(new FormData(form));commit(()=>{state.storyDraft=collectStoryDraft(fields);});}
  } else if (form?.id === 'community-find') {
    const fields=Object.fromEntries(new FormData(form));
    commit(()=>{state.communityDraft={...state.communityDraft,...fields};});
    const carpool=form.querySelector('#carpool-fields');
    if(carpool) carpool.hidden=fields.category!=='Carpool';
  } else if (form?.id === 'planner') {
    state.filters = collectFilters(form);
    const visibleErrors = new Set([...form.querySelectorAll('[aria-invalid="true"]')].map(control => control.id));
    if (visibleErrors.size) {
      const remaining = Object.entries(validateFilters(state.filters)).filter(([id]) => visibleErrors.has(id));
      renderErrors(form, Object.fromEntries(remaining), false);
    }
    persist();
  } else if (form?.id === 'application' && event.target.name === 'message') {
    state.drafts ||= {};
    state.drafts[params.get('id')] = event.target.value;
    persist();
  }
});

app.addEventListener('change', event => {
  if(event.target.dataset.routeMode) {
    const node=event.target,city=node.dataset.city,token=node.dataset.routeMode;
    if(commit(()=>{state.tripLegOverrides||={};state.tripLegOverrides[city]||={};state.tripLegOverrides[city][token]={mode:node.value,fare:'',minutes:''};}))updateTripSummary();
    return;
  }
  if(event.target.dataset.storyPlace) {const id=event.target.dataset.storyPlace,draft=state.storyDraft;if(!draft || !directoryPlaces.some(p=>p.id===id && p.city===draft.city))return;const ok=commit(()=>{draft.placeIds=event.target.checked?[...new Set([...draft.placeIds,id])]:draft.placeIds.filter(p=>p!==id);});if(!ok)event.target.checked=state.storyDraft.placeIds.includes(id);const tray=app.querySelector('#story-tagged-places');if(tray)tray.innerHTML=storyTaggedPlaces(state.storyDraft);return;}
  if(event.target.hasAttribute?.('data-story-city')) {const draft=state.storyDraft;if(!draft)return;if(draft.placeIds.length || draft.route){event.target.value=draft.city;announce('Start a separate post to change city while keeping this draft.');return;}if(cityNames.includes(event.target.value) && commit(()=>{draft.city=event.target.value;}))refresh();return;}
  if (event.target.dataset.permitChoice) {
    const choice=event.target.dataset.permitChoice;
    const allowed={service:['first','endorsement'],residence:['unknown','guangdong','other']};
    if(!allowed[choice]?.includes(event.target.value)) return;
    const focusedId=event.target.id;
    if(commit(()=>{state.guideChoices ||= {};state.guideChoices[permitGuide.guide_id]={...permitChoices(),[choice]:event.target.value};})) {
      refresh();
      document.getElementById(focusedId)?.focus();
    }
    return;
  }
  if (event.target.dataset.planStop) {
    const id = event.target.dataset.planStop;
    const item = directoryPlaces.find(place => place.id === id && place.city === state.city);
    if (!item) return;
    const ok = commit(() => {
      state.customPlans ||= {};
      const ids = selectedPlanIds();
      state.customPlans[state.city] = event.target.checked ? [...new Set([...ids, id])] : ids.filter(value => value !== id);
    });
    if (!ok) event.target.checked = selectedPlanIds().includes(id);
    updatePlanSelection();
  }
  const id = event.target.dataset.checklist;
  if (id) {
    const text = event.target.dataset.checklistItem;
    const guide = lookup(data.guides, 'guide_id', id);
    if (!guide || !preparationItems(guide).includes(text)) return;
    const ok = commit(() => {
      const previous = state.checklist[id] || {};
      state.checklist[id] = { ...previous, items: { ...(previous.items || {}), [text]: event.target.checked } };
    });
    if (!ok) event.target.checked = !!state.checklist[id]?.items?.[text];
  }
});

app.addEventListener('submit', event => {
  const form = event.target;
  if (form.method === 'dialog') return;
  event.preventDefault();
  const fields = Object.fromEntries(new FormData(form));
  if (planningSubmit(form,fields) || storySubmit(form,fields) || communitySubmit(form,fields)) return;
  if (form.id === 'multi-plan') {
    if ((state.customPlans?.[state.city] || []).length < 2) { announce('Choose at least two places.'); return; }
    routeTo('#P02');
  } else if (form.id === 'curated-filter') {
    if(commit(()=>{state.routeDiscovery||={};state.routeDiscovery[state.city]={category:fields['route-category'],budgetStatus:fields['route-budget-status']};}))refresh();
  } else if (form.id === 'planner') {
    state.filters = collectFilters(form);
    persist();
    const errors = validateFilters(state.filters);
    renderErrors(form, errors);
    if (!Object.keys(errors).length) routeTo('#E02', { filters: structuredClone(state.filters) });
  } else if (form.id === 'directory-filter') {
    routeTo(url('D01', { city: fields.city, category: fields.category, search: fields.search.trim(), view: form.dataset.view }));
  } else if (form.id === 'directory-pin') {
    const query = new URLSearchParams(params);
    query.set('pin', fields.pin);
    routeTo('#D01?' + query.toString());
  } else if (form.id === 'life-filter') {
    state.lists.life = fields;
    persist();
    refresh();
  } else if (form.id === 'community-filter') {
    const tab = form.dataset.tab;
    state.lists[tab] = fields;
    persist();
    history.replaceState(entry, '', url('Q01', { tab }));
    refresh();
  } else if (form.id === 'application') {
    const id = params.get('id');
    const item = itemFor('activity', id);
    if (!item || localActivity(item) || !state.profile || !state.verified || !fields.confirm || activityStatus(item) !== 'Open for applications') return;
    if (state.applications[id] && state.applications[id].status !== 'Withdrawn') return;
    const partySize=Number(fields.partySize || 1);
    if(!Number.isInteger(partySize) || partySize<1 || partySize>item.remaining) {announce('Choose a group size within the remaining places.');return;}
    if (commit(() => {
      const schedule=activitySchedule(item);
      state.applications[id] = { status: 'Pending', partySize, scheduledStart:schedule.starts, scheduledEnd:schedule.ends, message: (fields.message || '').slice(0, 200) };
      addCommunityEvent(id,'Application saved as pending on this device. No host was contacted.');
      if(fields.message?.trim()) state.communityThreads[id].messages.push({role:'you',text:fields.message.trim().slice(0,200),at:new Date().toISOString()});
      if (state.drafts) delete state.drafts[id];
    })) routeTo(url('M03', { id, saved: '1' }));
  } else if (form.id === 'report') {
    const kind = params.get('kind');
    const id = params.get('id');
    if (!itemFor(kind, id) || form.dataset.saved) return;
    if (!commit(() => { state.reports.push({ kind, id, reason: fields.reason, details: fields.details, date: new Date().toISOString() }); })) return;
    form.dataset.saved = '1';
    show(notice('Report saved on this device.', 'It has not been sent to the team.', action('back', 'Back', 'primary')));
    app.querySelector('main').focus();
  }
});

if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.addEventListener('popstate', () => {
  scrollPositions.set(entry?.id, window.scrollY);
  render({ restore: true });
});
document.addEventListener('focusin', event => {
  if (!event.target.closest('main')) return;
  const footer = app.querySelector('.footer');
  if (footer && event.target.getBoundingClientRect().bottom > footer.getBoundingClientRect().top) {
    event.target.scrollIntoView({ block: 'center' });
  }
});

const viewport = window.visualViewport;
viewport?.addEventListener('resize', () => {
  document.body.classList.toggle('keyboard-open', window.innerHeight - viewport.height > 140);
});

render({ focus: false });
if (!location.hash || location.hash === '#H01') {
  let showSplash = true;
  try {
    showSplash = !sessionStorage.getItem('baygo-splash');
    sessionStorage.setItem('baygo-splash', 'seen');
  } catch {}
  if (showSplash) {
    const splash = document.querySelector('#splash');
    splash.hidden = false;
    app.inert = true;
    setTimeout(() => { splash.hidden = true; app.inert = false; }, 1150);
  }
}

function amapDirections(item, mapUrl) {
  if (['Shenzhen','Hong Kong','Macao'].includes(item?.city)) return '<p class="meta">Follow the cross-city journey below, then use the local map for the final leg.</p>';
  let coordinates;
  try { coordinates = new URL(mapUrl).searchParams.get('position'); } catch (_) {}
  const point = item?.amapPoint;
  if (!coordinates && point && !point.reference) coordinates = `${point.entranceLongitude || point.longitude},${point.entranceLatitude || point.latitude}`;
  if (!coordinates || point?.reference) return `<p class="meta">Exact destination not confirmed. Search in Amap, select the correct place, then tap Directions to see routes and travel time.</p>`;
  const values = coordinates.split(',').map(Number);
  if (values.length !== 2 || !values.every(Number.isFinite) || Math.abs(values[0]) > 180 || Math.abs(values[1]) > 90) return '';
  return `<h3>Directions from BNBU</h3><div class="actions">${[['walk','Walk'],['bus','Transit'],['car','Drive'],['ride','Cycle']].map(([mode,label]) => external('https://uri.amap.com/navigation?' + new URLSearchParams({from:'113.520652,22.347526,BNBU main-campus entrance',to: coordinates + ',' + (item?.localName || item?.name || 'Destination'), mode, src:'BayGo', callnative:'0'}), label)).join(' · ')}</div><p class="meta">Routes and estimated travel time open in Amap. The starting point is BNBU main-campus entrance. You can change it in Amap. Availability depends on region and transport mode.</p>`;
}

function crossCityJourney(id, city) {
  const item = directoryPlaces.find(p => p.id === id);
  if (!item || !['Shenzhen','Hong Kong','Macao'].includes(city)) return '';
  const ordered = steps => `<ol class="timeline">${steps.map(step => `<li><p>${esc(step)}</p></li>`).join('')}</ol>`;
  const source = (url, label) => `<p class="meta">${external(url,label)}</p>`;
  const search = (keyword, region, label) => external('https://uri.amap.com/search?' + new URLSearchParams({keyword,city:region,src:'BayGo'}),label);
  const portLink = portId => {
    const row = transportRows.find(r => r.id === portId && r.direction === '去程' && r.link);
    return row ? `<p>${external(row.link,'BNBU → departure port in Amap')}</p>` : '';
  };
  if (city === 'Shenzhen') {
    const stops = [["Xili · Jiuxiangling bus stop ②", "西丽地铁站（九祥岭②公交站）"], ["Hourui", "后瑞地铁站"], ["Dafen", "大芬地铁站"], ["Qianhaiwan", "前海湾地铁站"], ["Fanshen · Exit C bus stop", "翻身地铁站C出口公交站站点"], ["Longsheng", "龙胜地铁站"], ["Shenzhen University", "深大地铁站"], ["Fuyong", "福永地铁站"], ["Yantian Road · bus stop", "盐田路地铁站公交站"], ["Bantian", "坂田地铁站"], ["Shajing", "沙井地铁站"], ["Fumin Gong’an Community · Futian Port area", "福民公安小区公交车站（福田口岸）"], ["Pingshanwei", "坪山围地铁站"], ["Xiasha · Futian", "下沙地铁站（福田区）"], ["Dayun", "大运地铁站"], ["Songgang", "松岗地铁站"], ["Hongling · Luohu", "红岭地铁站（罗湖区）"], ["Chang’an Vanke Plaza", "长安万科广场"], ["Gongming Square", "公明广场地铁站"]];
    const plans = {"PL-SZ-001": [11, "Walk to Futian Checkpoint metro station using the station map. Take Line 4 towards Niuhu to Convention & Exhibition Center, transfer to Line 1 towards Airport East and get off at Shopping Park. Follow the signs to Futian COCO Park."], "PL-SZ-002": [6, "From the ticketed Shenzhen University drop-off, take a local taxi to Coastal City on Wenxin 5th Road. Check the exact drop-off and the destination entrance in Amap before booking the local ride."], "PL-SZ-003": [6, "From the ticketed Shenzhen University drop-off, take a local taxi to Shenzhen Bay MixC at 2888 Keyuan South Road. Follow the shopping-centre entrance signs."], "PL-SZ-004": [4, "Walk from the coach stop to Fanshen metro station. Take Line 5 towards Chiwan to Bao’an Center, then follow signs and the street map to Uniwalk."], "PL-SZ-005": [6, "Take a local taxi from the Shenzhen University drop-off to Shenzhen Bay Sports Center. Select the stadium or arena entrance shown on your event ticket."], "PL-SZ-006": [14, "Take a local taxi from the Dayun drop-off to Shenzhen Universiade Sports Centre. Dayun metro station and the sports centre are different places; use the event ticket to choose the correct stadium or arena entrance."], "PL-SZ-007": [16, "Take a local taxi from the Hongling drop-off to Shenzhen Sports Center on Sungang West Road. Check the specific venue and event entrance on your ticket."], "PL-SZ-008": [11, "Walk to Futian Checkpoint metro station. Take Line 4 towards Niuhu to Children’s Palace (Shaoniangong), then use the station street map to walk to Shenzhen Concert Hall on Fuzhong 1st Road."], "PL-SZ-009": [11, "Walk to Futian Checkpoint metro station. Take Line 4 towards Niuhu to Children’s Palace (Shaoniangong), then follow the street map to the park’s southeast side. Confirm your chosen park entrance."], "PL-SZ-010": [13, "Walk to Xiasha metro station. Take Line 9 towards Qianwan to Shenzhen Bay Park, then follow the station signs to the waterfront park entrance."]};
    const plan = plans[id];
    if (!plan) return heading('BNBU → Shenzhen by AA Bus', '<p>Choose the AA Bus departure and drop-off on your ticket, then plan the local connection to this destination in Amap. The best drop-off for this newly added place is not yet verified.</p>');
    const stop = stops[plan[0]];
    return heading('BNBU → Shenzhen by AA Bus', `<div class="card stack"><p class="eyebrow">Suggested AA Bus drop-off</p><h3>${esc(stop[0])}</h3><p class="meta">Suggested for a practical onward connection; not a measured nearest or fastest stop.</p></div>` + ordered([
      'In the AA Bus WeChat mini program, search Zhuhai → Shenzhen for your date and select ' + stop[0] + ' as the drop-off. Confirm that your chosen departure serves it.',
      'Travel from BNBU to the exact Zhuhai pickup on your ticket. Campus pickup is not confirmed. Arrive at least 10 minutes early, as indicated in the supplied booking screenshot.',
      'Take AA Bus to ' + stop[0] + '. Check the ticket for the precise roadside stop; a metro station name does not identify a specific coach bay.',
      plan[1]
    ]) + `<p>${search(stop[1],'深圳','Find the suggested drop-off in Amap')} · ${external(item.mapUrl,'Open the destination map')}</p><p class="meta">For the final leg, set the Amap starting point to your actual AA Bus drop-off, not BNBU. Local travel time and fare must be checked for departure time.</p><details><summary>All 19 supplied drop-off options</summary><ul>${stops.map((s,i)=>`<li>${esc(s[0])}${i===17 ? ' · Dongguan, not Shenzhen' : ''}</li>`).join('')}</ul></details>` + source('https://www.sz.gov.cn/xxgk/sydwxxgk/jt/dt/ywxx/dtxlxx/content/mpost_11086804.html','Shenzhen metro route information'));
  }
  if (city === 'Macao') {
    const peninsula = ['PL-MO-007','PL-MO-008','PL-MO-009','PL-MO-NEW-007'].includes(id);
    const steps = peninsula ? [
      'Travel from BNBU to Gongbei Port in Zhuhai.',
      'Complete the pedestrian border crossing at Gongbei / Portas do Cerco (Border Gate).',
      'After entering Macao, follow signs to the ground-floor taxi rank at Border Gate.',
      'Take a licensed taxi to ' + item.name + '. For Senado Square or the Ruins of St. Paul’s, use a legal nearby drop-off and walk the final pedestrian streets.'
    ] : [
      'Travel from BNBU to Hengqin Port.',
      'Complete border checks and enter the Macao side of Hengqin Port.',
      'For a direct connection, follow the taxi signs and take a licensed taxi to ' + item.name + '.',
      'Public-transport alternative: follow signs to Hengqin LRT station, ride to Lotus and transfer to the Taipa Line. Use the operator’s station map to choose the final station and walking route for your venue.'
    ];
    return heading('BNBU → Macao · border and local connection',ordered(steps) + (peninsula ? `<p>${search('拱北口岸','珠海','Find Gongbei Port')}</p>` : portLink('PORT-ZH-HQ')) + `<p>${external(item.mapUrl,'Destination map for the final leg')}</p>` + source(peninsula ? 'https://www.macaotourism.gov.mo/en/sightseeing/other-attractions/border-gate-portas-do-cerco' : 'https://www.mlm.com.mo/en/route.html',peninsula ? 'Official Border Gate transport information' : 'Official Macao LRT route map') + '<p class="meta">Taxi fare and total journey time depend on queues and traffic. Check border and return transport operating hours before departure.</p>');
  }
  const finalLeg = {
    'PL-HK-001':'At Nam Cheong, transfer to the Tuen Ma Line towards Wu Kai Sha. Get off at Kai Tak and follow signs to Kai Tak Sports Park and the mall.',
    'PL-HK-004':'At Nam Cheong, transfer to the Tuen Ma Line towards Wu Kai Sha. Get off at Sung Wong Toi and follow event signs to Kai Tak Stadium.',
    'PL-HK-002':'At Nam Cheong, transfer to the Tuen Ma Line towards Wu Kai Sha. Get off at Austin, then use the street map to walk to Harbour City on Canton Road.',
    'PL-HK-003':'At Nam Cheong, transfer to the Tuen Ma Line towards Wu Kai Sha. Get off at East Tsim Sha Tsui and follow signs towards K11 MUSEA on Salisbury Road.',
    'PL-HK-005':'At Nam Cheong, transfer to the Tuen Ma Line towards Wu Kai Sha. Get off at Hung Hom and follow signs to Hong Kong Coliseum.',
    'PL-HK-007':'At Nam Cheong, transfer to the Tuen Ma Line towards Wu Kai Sha. Get off at East Tsim Sha Tsui and walk towards Hong Kong Cultural Centre on Salisbury Road.',
    'PL-HK-008':'Stay on the Tung Chung Line to Kowloon. Follow the station and West Kowloon Cultural District walking signs to M+.',
    'PL-HK-009':'Stay on the Tung Chung Line to Hong Kong. Use the linked Central station exits, then follow the street map to PMQ at 35 Aberdeen Street; allow for uphill walking.',
    'PL-HK-010':'At Nam Cheong, transfer to the Tuen Ma Line towards Wu Kai Sha. Get off at East Tsim Sha Tsui and follow the signs towards the waterfront promenade.'
  };
  const steps = ['Travel from BNBU to the HZMB Zhuhai Port.','Complete mainland departure checks, board the Hong Kong-bound HZMB shuttle bus, then complete Hong Kong arrival checks at Hong Kong Port.'];
  if (id === 'PL-HK-006') steps.push('From Hong Kong Port, take a licensed taxi directly to AsiaWorld-Expo and follow the entrance shown on your event ticket.');
  else steps.push('Take bus B6 from Hong Kong Port to Tung Chung town centre / MTR station.','Board the Tung Chung Line towards Hong Kong.',finalLeg[id] || 'Use the MTR journey planner or a licensed taxi for the final connection to ' + item.name + '.');
  return heading('BNBU → Hong Kong · HZMB crossing',ordered(steps) + portLink('PORT-ZH-HZMB') + `<p>${external(item.mapUrl,'Destination map for the final walk')}</p>` + source('https://www.hzmbus.com/hk/port.html?tab=2','Official HZMB port connections') + source('https://www.mtr.com.hk/en/customer/services/system_map.html','MTR network and station maps') + '<p class="meta">Border queues, shuttle waiting and local connections are separate journey stages. Check the return shuttle and last local services before setting off.</p>');
}

function curatedRoutes() {
  const s=planningSettings(), filter=state.routeDiscovery?.[state.city] || {category:'',budgetStatus:''};
  const originals=data.routes.filter(r=>r.city===state.city).map(r=>({id:r.route_id,city:r.city,title:r.title_en,summary:r.summary_en,stops:stopsFor(r.route_id).map(s=>s.place_id).filter(id=>id!==campus),original:r}));
  const candidates=[...originals,...(window.BAYGO_CURATED || []).filter(r=>r.city===state.city)];
  const entries=candidates.map(r=>({route:r,total:r.original?window.BayGoBudget.summarize(r.original.budget_items || [],s.budget):tripAccounting(r.stops,r.city)})).filter(({route:r,total})=>(!filter.category || r.stops.some(id=>directoryPlaces.find(p=>p.id===id)?.category===filter.category)) && (!filter.budgetStatus || total.status===filter.budgetStatus));
  const statuses={within:'Estimated full trip within budget',warning:'May exceed your budget',outside:'Estimated full trip over budget',incomplete:'Missing costs · budget cannot be confirmed','no-budget':'Enter a total trip budget to compare'};
  show(`<section class="stack"><p class="eyebrow">${esc(state.city)} · Ready-made routes</p><p>Compare whole-trip estimates and find a route containing your preferred type of place. Missing transport or entry prices are never treated as free.</p>${link('H01','Home / Change city')}${link('P01','Start Planning',{},'primary')}</section>${settingsForm(state.city)}<form id="curated-filter" data-city="${esc(state.city)}" class="card fields">${field('route-category','Find routes including',select('route-category',[['','Any type of place'],...directoryCategories.map(c=>[c,c])],filter.category))}${field('route-budget-status','Budget comparison',select('route-budget-status',[['','Show all, including incomplete'],['within','Estimated within budget'],['warning','May exceed budget'],['outside','Over budget'],['incomplete','Costs still to confirm']],filter.budgetStatus))}${submit('Find Matching Routes')}</form>${entries.length ? entries.map(({route:r,total})=>{const cover=directoryPlaces.find(p=>p.id===r.stops[0]);return `<article class="card stack">${cover?directoryPhoto(cover):''}<h3>${esc(r.title)}</h3><p>${esc(r.summary)}</p><p><strong>${esc(statuses[total.status])}</strong></p><p>${total.missing.length?'Known subtotal: ':'Estimated trip total: '}${costRange(total)}</p><p class="meta">${r.stops.length} stops · ${r.original?'Fixed inclusions in this reference itinerary; open details for its itemised assumptions.':total.unknownTime?'Journey time incomplete':duration(total.totalMinutes)+' including stays and buffer'}${total.missing.length?' · '+total.missing.length+' costs / conversions to confirm':''}</p>${link(r.original?'E03':'R02','View Route',{id:r.id},'outline')}</article>`}).join(''):'<p>No route matches these filters. Try showing all budget states or another place category; unconfirmed trips are never labelled within budget.</p>'}`,tabbar(),true);
}
function legLink(from, to) {
  const a=mapPoint(from), b=mapPoint(to);
  if (!a || !b) return external(to.mapUrl,'Find the next stop in Amap');
  return external('https://uri.amap.com/navigation?'+new URLSearchParams({from:a.join(',')+','+from.name,to:b.join(',')+','+to.name,mode:'bus',src:'BayGo'}),'Check this leg in Amap');
}
function stopSequence(ids, includeLegs = true) {
  const stops=ids.map(id=>directoryPlaces.find(p=>p.id===id)).filter(Boolean);
  return `<ol class="timeline">${stops.map((p,i)=>`<li><h3>${i+1}. ${esc(p.name)}</h3>${directoryPhoto(p)}<p>${esc(p.descriptionEn)}</p>${placePriceBrief(p)}${link('E04','Place details',{id:p.id})}${includeLegs && i<stops.length-1?`<section class="card leg-estimate" data-from="${p.id}" data-to="${stops[i+1].id}" aria-live="polite"><p>Checking route distance and transport options…</p></section><p>${legLink(p,stops[i+1])}</p>`:''}</li>`).join('')}</ol>`;
}
function curatedDetails() {
  const r=(window.BAYGO_CURATED||[]).find(r=>r.id===params.get('id'));
  if(!r)return unavailable();
  show(`<section><p class="eyebrow">${esc(r.city)} · Curated route</p><h2>${esc(r.title)}</h2>${action('share-route','Share Route to Student Stories','primary',`data-kind="curated" data-id="${esc(r.id)}"`)}<p>${esc(r.summary)}</p><p class="meta">A suggested sequence, not a verified fastest route. Check opening hours, tickets, each transport leg and the return journey. Review the full budget and every journey stage below; missing estimates are marked to confirm.</p></section>${settingsForm(r.city)}${tripBudgetPanel(r.stops,r.city)}${admissionControls(r.stops,r.city)}${completeJourney(r.stops,r.city)}${stopSequence(r.stops,false)}${r.city===state.city?action('use-curated','Customise these stops','primary',`data-id="${r.id}"`):''}`);
}
function matchingPlanPlaces(query) {
  const words = String(query || '').normalize('NFKC').trim().toLowerCase().split(/\s+/).filter(Boolean);
  return directoryPlaces.filter(item => item.city === state.city && words.every(word =>
    [item.name, item.localName, item.district, item.address, item.category, item.descriptionEn].join(' ').normalize('NFKC').toLowerCase().includes(word)));
}

function planPlaceOptions(matches, selected) {
  return directoryCategories.map(category => {
    const list = matches.filter(item => item.category === category);
    return list.length ? `<details open><summary>${esc(category)} · ${list.length}</summary>${list.map(item => `<label class="check"><input type="checkbox" data-plan-stop="${esc(item.id)}" ${selected.includes(item.id) ? 'checked' : ''}><span>${esc(item.name + (item.localName ? ' (' + item.localName + ')' : ''))}<small class="plan-local-name">${esc(placePriceText(item))}</small></span></label>`).join('')}</details>` : '';
  }).join('') || '<p class="meta">No places in the current directory match your search. Try another name or clear the search. Your selected places are kept.</p>';
}

function planSelectionSummary() {
  const ids = selectedPlanIds();
  return `<p><strong>${ids.length} ${ids.length === 1 ? 'place' : 'places'} selected</strong> · at least 2 to build a route</p>
    ${ids.length ? `<ol class="plan-selected-list">${ids.map(id => `<li><span>${esc(placeName(id))}</span>${action('remove-plan-stop', 'Remove', 'text', `data-id="${esc(id)}" aria-label="${esc('Remove ' + placeName(id))}"`)}</li>`).join('')}</ol>` : '<p class="meta">Choose places below. Search does not clear your selections.</p>'}`;
}

function updatePlanSelection() {
  const summary = app.querySelector('#plan-selected');
  if (summary) summary.innerHTML = planSelectionSummary();
}

function updatePlanSearchResults() {
  const input = app.querySelector('#plan-place-search');
  const results = app.querySelector('#plan-search-results');
  const status = app.querySelector('#plan-search-count');
  if (!input || !results || !status) return;
  const matches = matchingPlanPlaces(input.value);
  results.innerHTML = planPlaceOptions(matches, selectedPlanIds());
  status.textContent = `${matches.length} ${matches.length === 1 ? 'place' : 'places'} found in ${state.city}`;
}

function multiPlanner() {
  const query = state.planSearch?.[state.city] || '';
  const matches = matchingPlanPlaces(query);
  show(`<section class="stack"><h2>Build a day in ${esc(state.city)}</h2><p>Select at least two places. Your selection order becomes the route order; you can reorder stops in the next step.</p><p>Start and return: BNBU. ${link('H01','Change city on Home')}</p>${link('R01','Prefer a ready-made route?',{},'outline')}</section>
    <section class="card fields">${field('plan-place-search', 'Find a place to add', input('plan-place-search', 'search', query, 'maxlength="100" placeholder="English or Chinese name, area or category" aria-controls="plan-search-results"'))}
    <p class="meta">Search places already in our directory. New places need verification before they can be added.</p>
    <div>${action('clear-plan-search', 'Clear Search', 'reset-link')}</div></section>
    <section class="card stack" id="plan-selected">${planSelectionSummary()}</section>
    
    <form id="multi-plan"><p class="meta" id="plan-search-count" role="status" aria-live="polite">${matches.length} ${matches.length === 1 ? 'place' : 'places'} found in ${esc(state.city)}</p>
    <div class="stack" id="plan-search-results">${planPlaceOptions(matches, selectedPlanIds())}</div>
    <div class="planner-submit">${submit('Build My Route')}</div></form>`,tabbar(),true);
}
function multiResult() {
  const ids=(state.customPlans?.[state.city]||[]).filter(id=>directoryPlaces.some(p=>p.id===id&&p.city===state.city));
  if(ids.length<2)return multiPlanner();
  show(`<section><h2>Your ${esc(state.city)} itinerary</h2><p>BNBU → ${ids.map(placeName).map(esc).join(' → ')} → BNBU</p><p class="meta">Draft in your chosen order. No claim of fastest travel or budget feasibility. Each leg opens with the correct two stops; check the full cost and return service before departure.</p>${link('P01','Edit selected places')}</section><section class="card">${ids.map((id,i)=>`<p>${i+1}. ${esc(placeName(id))} ${i?action('move-stop','Move up','text',`data-id="${id}" data-direction="-1"`):''} ${i<ids.length-1?action('move-stop','Move down','text',`data-id="${id}" data-direction="1"`):''}</p>`).join('')}</section>${simpleTripSummary(ids,state.city)}${state.city==='Zhuhai'?tripLegs(ids,state.city).filter(l=>l.from===campus||l.to===campus).map(l=>`<div hidden class="leg-estimate" data-from="${esc(l.from)}" data-to="${esc(l.to)}"></div>`).join(''):''}${travelFromBNBU(ids[0],state.city)}${stopSequence(ids)}<section class="card"><h3>Return to BNBU</h3><p>Plan the return from the final stop. For cross-city travel, confirm the return coach or border connection separately.</p>${state.city==='Zhuhai' ? legLink(directoryPlaces.find(p=>p.id===ids.at(-1)),{name:'BNBU',amapPoint:{longitude:113.520652,latitude:22.347526}}):''}</section>`);
}

// Keep unavailable third-party images from leaving a broken-image box.
app.addEventListener('error', event => {
  const img = event.target;
  if (!(img instanceof HTMLImageElement) || !img.classList.contains('travel-photo')) return;
  img.hidden = true;
  if (img.nextElementSibling?.classList.contains('photo-unavailable')) return;
  const note = document.createElement('p');
  note.className = 'meta photo-unavailable';
  note.textContent = 'Photo source is currently unavailable. Open the place details for the original source.';
  img.insertAdjacentElement('afterend', note);
}, true);

function localDataSettings() {
  return `<section class="card"><h3>Settings</h3><p class="meta">Saved items and plans are stored in this browser on this device.</p>${action('open-reset','Clear saved data on this device','outline')}<dialog id="clear-local-dialog" aria-labelledby="clear-local-title"><div class="stack"><h2 id="clear-local-title">Clear this device’s saved data?</h2><p>This removes saved places and trips, custom plans, applications, reports, drafts, filters, locally published activities, posts, post drafts, conversations and the sample profile. This cannot be undone. No data on other devices is affected.</p><div class="cluster"><form method="dialog"><button class="btn outline">Keep my data</button></form>${action('reset-demo','Clear this device’s data','primary')}</div></div></dialog></section>`;
}

function cancelLegRequests() { legRequestController?.abort(); }
function readableTransitLine(name) {
  const original=String(name || '').trim();
  const base=original.split(/[（(]/)[0].trim();
  const metro=/(?:地铁|地鐵|metro|subway)/i.test(base);
  const code=base.match(/[A-Za-z]*\d+[A-Za-z]*/)?.[0];
  if(code) return metro ? `Metro Line ${code}` : `Bus ${code}`;
  // Preserve a named service rather than stripping it into unreadable fragments.
  return base ? base + ' (see Amap)' : '';
}
function legEstimateHTML(result, from, to) {
  const retry=action('retry-leg','Retry / refresh this leg','text',`data-from="${esc(from)}" data-to="${esc(to)}"`);
  if(!result?.options?.length) return `<p>Route information could not be loaded. Retry this leg or open Amap for directions.</p>${retry}`;
  const city=planPoint(from)?.city || state.city;
  const choice=state.tripLegOverrides?.[city]?.[`${from}|${to}`]?.mode || result.recommended;
  return `<h4>Recommended: ${esc(result.recommended)}</h4><p class="meta">${esc(result.reason || 'A short walk is preferred; otherwise public transport when available. This is not a cheapest or fastest guarantee.')}</p>${result.options.map(o=>`<p><strong>${esc(o.mode)}</strong> · ${(o.meters/1000).toFixed(2)} km · about ${Math.ceil(o.seconds/60)} min · ${o.fare===null?'fare to confirm':esc(priceMoney(o.fare,o.currency || 'CNY'))}${o.lines.length?`<small>Take: ${esc(o.lines.map(readableTransitLine).filter(Boolean).join(' → ') || 'See Amap for service details')}</small>`:''}</p>`).join('')}${result.errors.length?`<details><summary>Unavailable options</summary>${result.errors.map(e=>`<p>${esc(e.path)} · ${esc(e.code)}</p>`).join('')}</details>`:''}${retry}`;
}
async function loadLegEstimates() {
  legRequestController?.abort();
  const controller=new AbortController(); legRequestController=controller;
  const cards=[...app.querySelectorAll('.leg-estimate')];
  await window.BayGoRoutes.queue(cards,async card=>{
    if(!card.isConnected || controller.signal.aborted)return;
    try {
      const result=await window.BayGoRoutes.get(card.dataset.from,card.dataset.to,controller.signal);
      if(!card.isConnected || controller.signal.aborted)return;
      card.innerHTML=legEstimateHTML(result,card.dataset.from,card.dataset.to);
      updateTripSummary();
    } catch(e) { if(!controller.signal.aborted && card.isConnected)card.innerHTML=legEstimateHTML(null,card.dataset.from,card.dataset.to); }
  },controller.signal,3);
}
actions['retry-leg']=async button=>{
  const controller=legRequestController || new AbortController(), card=button.closest('.leg-estimate');
  if(!card)return;
  card.innerHTML='<p>Checking route…</p>';
  try {const value=await window.BayGoRoutes.get(button.dataset.from,button.dataset.to,controller.signal,true);if(card.isConnected&&!controller.signal.aborted){card.innerHTML=legEstimateHTML(value,button.dataset.from,button.dataset.to);updateTripSummary();}}catch(e){if(card.isConnected&&!controller.signal.aborted)card.innerHTML=legEstimateHTML(null,button.dataset.from,button.dataset.to);}
};
