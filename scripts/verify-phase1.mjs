import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const sources = [];
for (const name of ['config.js', 'content.js', 'places.js', 'prices.js', 'transit.js', 'curated.js', 'community.js', 'permits.js', 'travel-guides.js', 'stories.js', 'app.js']) {
  const text = await readFile(new URL(name, root), 'utf8');
  new vm.Script(text, { filename: name });
  sources.push([name, text]);
}

export function harness(storage = new Map()) {
  const events = {};
  const search = { value: '', focus() {} };
  const nodes = {
    '#plan-place-search': search,
    '#plan-selected': { innerHTML: '' },
    '#plan-search-results': { innerHTML: '' },
    '#plan-search-count': { textContent: '' },
  };
  const app = {
    dataset: {}, innerHTML: '',
    addEventListener(type, handler) { events[type] = handler; },
    querySelector(selector) { return selector === 'main' ? { focus() {} } : nodes[selector] || null; },
    querySelectorAll() { return []; },
  };
  const location = { hash: '#H01', href: 'https://example.test/BayGo/#H01', protocol: 'https:' };
  let failWrites = false;
  const history = {
    state: { id: 'smoke' },
    replaceState(state, _, target) { this.state = state; if (target) location.hash = new URL(target, location.href).hash; },
    pushState(state, _, target) { this.replaceState(state, _, target); },
    back() {},
  };
  const sandbox = {
    document: {
      querySelector(selector) { return selector === '#app' ? app : selector === '#announcement' ? { textContent: '' } : null; },
      getElementById() { return null; },
      addEventListener() {}, documentElement: { style: { setProperty() {} } },
      body: { classList: { toggle() {} } },
    },
    location, history,
    localStorage: { getItem: key => storage.get(key) || null, setItem(key, value) { if (failWrites) throw Error('storage full'); storage.set(key, value); } },
    sessionStorage: { getItem: () => 'seen', setItem() {} },
    URL, URLSearchParams, Intl, Date, AbortSignal, structuredClone,
    crypto: { randomUUID: () => 'smoke' },
    setTimeout() {}, clearTimeout() {}, queueMicrotask() {},
    addEventListener() {}, scrollTo() {}, scrollY: 0,
    ResizeObserver: class { observe() {} disconnect() {} },
    HTMLImageElement: class {},
  };
  sandbox.window = sandbox;
  const context = vm.createContext(sandbox);
  for (const [name, text] of sources) vm.runInContext(text, context, { filename: name });
  const run = text => vm.runInContext(text, context);
  return { run, events, app, search, nodes, location, storage, failWrites: value => { failWrites = value; } };
}

const h = harness();
const run = h.run;
const places = JSON.parse(run('JSON.stringify(directoryPlaces.filter(p => p.city === "Zhuhai").slice(0, 2))'));
const [a, b] = places;
const j = JSON.stringify;
const selected = () => JSON.parse(run('JSON.stringify(selectedPlanIds())'));
run(`state.city='Zhuhai';state.customPlans={Zhuhai:[${j(a.id)},${j(a.id)},${j(b.id)},'INVALID']}`);
assert.deepEqual(selected(), [a.id, b.id]);
run(`actions['add-plan-stop']({dataset:{id:${j(a.id)}}})`);
assert.deepEqual(selected(), [a.id, b.id]);
assert.match(run(`planControls(directoryPlaces.find(p=>p.id===${j(a.id)}))`), /disabled>Added to My Plan/);
assert.match(run(`planControls(directoryPlaces.find(p=>p.id===${j(a.id)}))`), /href="#P02"/);

run('state.customPlans.Zhuhai=[]');
run(`actions['add-plan-stop']({dataset:{id:${j(a.id)}}})`);
assert.deepEqual(selected(), [a.id]);
assert.match(run(`planControls(directoryPlaces.find(p=>p.id===${j(a.id)}))`), /Continue Choosing Places/);
run(`actions['add-plan-stop']({dataset:{id:${j(b.id)}}})`);
assert.deepEqual(selected(), [a.id, b.id]);

assert.ok(run(`matchingPlanPlaces(${j(a.name)}).some(p=>p.id===${j(a.id)})`));
if (a.localName) assert.ok(run(`matchingPlanPlaces(${j(a.localName)}).some(p=>p.id===${j(a.id)})`));
assert.equal(run('matchingPlanPlaces("NO-SUCH-PLACE-XYZ").length'), 0);
assert.ok(run('matchingPlanPlaces("").every(p=>p.city===state.city)'));
h.search.value = 'NO-SUCH-PLACE-XYZ';
h.events.input({ target: { id: 'plan-place-search', value: h.search.value } });
assert.match(h.nodes['#plan-search-results'].innerHTML, /Your selected places are kept/);
assert.deepEqual(selected(), [a.id, b.id]);
run(`actions['remove-plan-stop']({dataset:{id:${j(a.id)}}})`);
assert.deepEqual(selected(), [b.id]);
assert.match(h.nodes['#plan-selected'].innerHTML, /1 place selected/);
run("actions['clear-plan-search']()");
assert.equal(h.search.value, '');
assert.deepEqual(selected(), [b.id]);

run("state.city='Guangzhou'");
assert.deepEqual(selected(), []);
run("state.city='Zhuhai'");
assert.deepEqual(selected(), [b.id]);

const guide = JSON.parse(run('JSON.stringify(data.guides[0])'));
const items = JSON.parse(run('JSON.stringify(preparationItems(data.guides[0]))'));
assert.equal(items.length, 4);
assert.equal(items[0], 'Bring your ID.');
assert.ok(items.some(text => /If you plan to use medical insurance/.test(text)));
for (const text of items.slice(0, 2)) h.events.change({ target: { dataset: { checklist: guide.guide_id, checklistItem: text }, checked: true } });
h.events.change({ target: { dataset: { checklist: guide.guide_id, checklistItem: items[0] }, checked: false } });
const restored = harness(h.storage);
assert.equal(restored.run(`!!state.checklist[${j(guide.guide_id)}].items[${j(items[0])}]`), false);
assert.equal(restored.run(`!!state.checklist[${j(guide.guide_id)}].items[${j(items[1])}]`), true);
assert.match(restored.run(`preparationChecklist(data.guides[0],state.checklist[${j(guide.guide_id)}])`), /<ul class="preparation-list">/);

h.location.hash = '#Q01?tab=buddies&date=2026-11-21';
run("state.lists.buddies={type:'Carpool',date:'2026-11-21'};render({focus:false})");
assert.match(h.app.innerHTML, /class="filter-reset"/);
run("actions['clear-community']()");
assert.equal(h.location.hash, '#Q01?tab=buddies');
assert.equal(run('Object.keys(state.lists.buddies).length'), 0);
assert.deepEqual(selected(), [b.id]);

h.failWrites(true);
run(`actions['add-plan-stop']({dataset:{id:${j(a.id)}}})`);
assert.deepEqual(selected(), [b.id]);
h.failWrites(false);

for (const route of ['#H01','#P01','#R01','#D01','#E04?id='+a.id,'#L01','#L02?id='+guide.guide_id,'#Q01','#M01']) {
  h.location.hash = route;
  run('render({focus:false})');
  assert.match(h.app.innerHTML, /<main/);
}
console.log('PASS: syntax, duplicate prevention, route entry, bilingual search, selection persistence, removal, city isolation, checklist restore, filter reset, storage failure and nine page render smoke checks.');
console.log('This is a logic/HTML smoke test with DOM stubs, not a browser layout or live-site test.');
