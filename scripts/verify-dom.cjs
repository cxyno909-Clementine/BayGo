// Optional DOM integration check: install jsdom separately and start a static server.
const {JSDOM,VirtualConsole}=require('jsdom');
const assert=require('node:assert/strict');
const errors=[];const vc=new VirtualConsole();vc.on('jsdomError',e=>{if(e.type==='unhandled-exception')errors.push(e.message);});
(async()=>{
const dom=await JSDOM.fromURL(process.env.BAYGO_QA_URL || 'http://127.0.0.1:8767/',{resources:'usable',runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:vc,beforeParse(w){w.structuredClone=structuredClone;w.AbortController=AbortController;w.AbortSignal=AbortSignal;w.ResizeObserver=class{observe(){}disconnect(){}};w.scrollTo=()=>{};w.sessionStorage.setItem('baygo-splash','seen');}});
const w=dom.window;await new Promise(r=>w.addEventListener('load',r,{once:true}));
const sleep=()=>new Promise(r=>setTimeout(r,100));
w.eval("state.city='Zhuhai';state.customPlans={Zhuhai:['P-ZH-002','PL-ZH-002','PL-ZH-003']};routeTo('#P02')");await sleep();
assert.equal(w.document.querySelectorAll('.leg-estimate').length,4);
assert.ok(w.document.querySelectorAll('[data-route-mode]').length >= 3, 'Saved route options must actually render');
const ids=[...w.document.querySelectorAll('[id]')].map(n=>n.id);assert.equal(new Set(ids).size,ids.length,'No duplicate DOM IDs');
assert.ok(w.document.querySelector('#trip-budget-summary').textContent.includes('Whole')===false);
const form=w.document.querySelector('#trip-settings');form.querySelector('[name="trip-budget"]').value='250';form.querySelector('[name="trip-returnBy"]').value='';form.requestSubmit();await sleep();
assert.equal(w.eval("planningSettings().budget"),'250');assert.equal(w.eval('planningSettings().returnBy'),'');
const leg=w.document.querySelector('form[data-leg]');leg.querySelector('[name="fare"]').value='12';leg.querySelector('[name="minutes"]').value='25';leg.requestSubmit();await sleep();
assert.equal(w.eval("tripAccounting(selectedPlanIds(),state.city).details.find(i=>i.label==='BNBU → Bugu Cafe').min"),12);
const before=w.eval('selectedPlanIds().join(",")');
w.document.querySelector('[data-action="move-stop"]').click();await sleep();assert.notEqual(w.eval('selectedPlanIds().join(",")'),before);
const legs=w.eval('tripLegs(selectedPlanIds(),state.city)');
assert.equal(w.document.querySelector('.leg-estimate').dataset.to,legs[0].to);
const modes=w.document.querySelectorAll('[data-route-mode]');if(modes.length){modes[0].checked=true;modes[0].dispatchEvent(new w.Event('change',{bubbles:true}));await sleep();}
for(const city of ['Guangzhou','Shenzhen','Hong Kong','Macao']){w.eval(`state.city=${JSON.stringify(city)};curatedRoutes()`);await sleep();assert.ok(w.document.querySelector('#trip-settings'));}
assert.deepEqual(errors,[]);
console.log('PASS: actual HTML DOM initialization, four route stages, form submissions, custom fare/time, blank return, reordering, mode changes and all-city route cards. This verifies DOM behavior, not browser layout.');
w.close();
})().catch(e=>{console.error(e);process.exitCode=1;});
