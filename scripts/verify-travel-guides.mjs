import assert from 'node:assert/strict';
import { harness } from './verify-phase1.mjs';

const h=harness(), run=h.run;
assert.equal(run('intercityGuides.length'),8);
assert.equal(run("new Set(data.guides.map(g=>g.guide_id)).size"),run('data.guides.length'));
assert.ok(run("intercityGuides.every(g=>g.prepare.length && g.steps.length && g.prices.length && g.sources.every(id=>travelSources[id]?.url.startsWith('https://')))"));
for(const city of ['Zhuhai','Guangzhou','Shenzhen','Hong Kong','Macao']) {
  run(`state.city=${JSON.stringify(city)};routeTo('#L01')`);
  assert.match(h.app.innerHTML,/Intercity Travel &amp; Tickets|Intercity Travel & Tickets/);
  assert.ok(run('guidesForCity(state.city).some(g=>g.category===\'Intercity Travel\')'));
  run("routeTo('#L03')");
  assert.ok(run('intercityGuides.filter(g=>g.cities.includes(state.city)).length')>0);
  assert.ok(h.app.innerHTML.includes('View Guide'));
}
run("state.city='Guangzhou';state.lists.life={category:'Intercity Travel',search:'AA巴士'};routeTo('#L01')");
assert.match(h.app.innerHTML,/Mainland Intercity Coaches/);
assert.doesNotMatch(h.app.innerHTML,/Nansha City Ferry/);
const guideIds=JSON.parse(run('JSON.stringify(intercityGuides.map(g=>g.guide_id))'));
for(const id of guideIds) {
  run(`routeTo('#L02?id=${id}')`);
  assert.match(h.app.innerHTML,/How to Buy and Board/);
  assert.match(h.app.innerHTML,/Official Sources and Booking Entrances/);
  assert.match(h.app.innerHTML,/Checked 2026-11-15/);
  assert.match(h.app.innerHTML,/data-checklist-item=/);
  assert.match(h.app.innerHTML,/BayGo is not the ticket seller/);
}
run("routeTo('#L02?id=G-TR-ZH-SZ-FERRY')");
assert.match(h.app.innerHTML,/not sold online/);
assert.doesNotMatch(h.app.innerHTML,/CNY 70/);
run("routeTo('#L02?id=G-TR-MACAO-LAND')");
assert.match(h.app.innerHTML,/MOP 6/);
assert.match(h.app.innerHTML,/MOP 3 ordinary \/ MOP 4 express/);
assert.match(h.app.innerHTML,/Qingmao/);
assert.match(h.app.innerHTML,/stored-value or transfer discounts/);
run("routeTo('#L02?id=G-TR-ZH-HK')");
assert.match(h.app.innerHTML,/CNY 58/);
assert.match(h.app.innerHTML,/HKD 65/);
assert.match(h.app.innerHTML,/B6/);
assert.match(h.app.innerHTML,/SkyPier/);
run("routeTo('#L02?id=G-TR-GZ-HK-FERRY')");
assert.match(h.app.innerHTML,/CNY 320/);
assert.match(h.app.innerHTML,/CNY 200/);
assert.match(h.app.innerHTML,/40 minutes/);
const text=run("intercityGuides.find(g=>g.guide_id==='G-TR-GZ-HK-FERRY').prepare[0]");
h.events.change({target:{checked:true,dataset:{checklist:'G-TR-GZ-HK-FERRY',checklistItem:text}}});
const restored=harness(h.storage);
assert.equal(restored.run(`state.checklist['G-TR-GZ-HK-FERRY'].items[${JSON.stringify(text)}]`),true);
run("state.profile=true;toggleSaved('guide','G-TR-GZ-HK-FERRY');routeTo('#M02?kind=guide')");
assert.match(h.app.innerHTML,/Nansha City Ferry/);
run("routeTo('#F01?kind=guide&id=G-TR-GZ-HK-FERRY')");
assert.match(h.app.innerHTML,/Save Report on This Device/);
assert.equal(run("data.previews.find(p=>p.preview_id==='CP-HK-001').outbound_en.includes('B6')"),true);
assert.equal(run("JSON.stringify(data.previews.find(p=>p.preview_id==='CP-HK-001')).includes('A21')"),false);
console.log('PASS: eight intercity guides, all five city entrances, category/Chinese search, checklist restore, saved/report flows, operator sources, fare currencies, concession/payment caveats, airport distinction and updated Hong Kong preview.');
