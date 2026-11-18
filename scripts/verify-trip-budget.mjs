import assert from 'node:assert/strict';
import { harness } from './verify-phase1.mjs';
const h=harness(), run=h.run, read=x=>JSON.parse(run(`JSON.stringify(${x})`));
const items=[{label:'Outbound',min:3,max:3},{label:'Local',min:2,max:4},{label:'Meals',min:40,max:60},{label:'Admission',min:10,max:10},{label:'Return',min:3,max:3}];
for(const [budget,status] of [[57,'outside'],[58,'warning'],[70,'warning'],[80,'within'],[81,'within']]){
 const result=read(`BayGoBudget.summarize(${JSON.stringify(items)},${budget})`);
 assert.equal(result.min,58);assert.equal(result.max,80);assert.equal(result.status,status);
}
assert.equal(read("BayGoBudget.summarize([{label:'Missing',min:null,max:null}],100)").status,'incomplete');
assert.equal(read("BayGoBudget.summarize([{label:'Free park',min:0,max:0}],0)").status,'within');
assert.equal(read("BayGoBudget.summarize([{label:'Invalid',min:10,max:5}],100)").status,'incomplete');
assert.equal(read("BayGoBudget.summarize([{label:'HK',min:100,currency:'HKD'},{label:'MO',min:100,currency:'MOP'}],190,{HKD:0.92,MOP:0.89})").max,181);
assert.equal(read("BayGoBudget.summarize([{label:'HK',min:100,currency:'HKD'}],500)").status,'incomplete');
// Empty return preference must survive loading saved browser state.
const storage=new Map([['baygo-demo-v1',JSON.stringify({filters:{returnBy:''}})]]);
assert.equal(harness(storage).run('state.filters.returnBy'),'');
assert.equal(harness().run('state.filters.returnBy'),'23:30');
run("state.city='Zhuhai';state.customPlans={Zhuhai:['PL-ZH-002','P-ZH-002','PL-ZH-017']};state.tripSettings={Zhuhai:{mealCount:'2',drinkCount:'1',mealAllowance:'45',drinkAllowance:'20',budget:'200'}}");
let t=read("tripAccounting(selectedPlanIds(),'Zhuhai')");
assert.equal(t.legs.length,4);assert.equal(t.legs[0].from,'P-ZH-001');assert.equal(t.legs.at(-1).to,'P-ZH-001');
assert.equal(t.meals,1);assert.equal(t.drinks,1);
assert.equal(t.details.filter(i=>i.label.startsWith('Additional planned meals')).length,1);
assert.equal(t.details.find(i=>i.label.startsWith('Additional planned meals')).min,45);
assert.equal(t.details.filter(i=>i.label.startsWith('Additional planned cafe')).length,0);
assert.equal(t.details.find(i=>i.label==='Zhuhai Museum · standard admission').min,0);
run("state.customPlans.Zhuhai=['P-ZH-002','PL-ZH-002','PL-ZH-017']");
assert.equal(read("tripLegs(selectedPlanIds(),'Zhuhai')")[0].to,'P-ZH-002');
// Manual per-person fares/time override the selected provider option and are counted once.
run("state.tripLegOverrides={Zhuhai:{'P-ZH-001|P-ZH-002':{fare:'8',minutes:'15'}}}");
t=read("tripAccounting(selectedPlanIds(),'Zhuhai')");
assert.equal(t.details.find(i=>i.label==='BNBU → Bugu Cafe').min,8);
for(const city of ['Guangzhou','Shenzhen','Hong Kong','Macao']) {
 run(`state.city=${JSON.stringify(city)}`);
 const ids=read(`(BAYGO_CURATED.find(r=>r.city===state.city)).stops`);
 const legs=read(`tripLegs(${JSON.stringify(ids)},state.city)`);
 assert.equal(legs.length,ids.length+1);assert.equal(legs[0].from,'P-ZH-001');assert.equal(legs.at(-1).to,'P-ZH-001');assert.equal(legs.filter(l=>l.crossCity).length,2);
 const accounting=read(`tripAccounting(${JSON.stringify(ids)},state.city)`);
 assert.equal(accounting.status,'incomplete'); // No unverified coach/border fares marked as feasible.
 run(`params=new URLSearchParams({id:BAYGO_CURATED.find(r=>r.city===state.city).id});curatedDetails()`);
 assert.match(h.app.innerHTML,/Whole-trip budget/);assert.match(h.app.innerHTML,/Every journey stage/);
}
assert.equal(read("BayGoRoutes.normalize({options:[{mode:'Walking',meters:100,seconds:60,fare:0},{mode:'Public transport',meters:'bad',seconds:5}]})").options.length,1);
assert.equal(read("BayGoRoutes.normalize({options:[],errors:null})").errors.length,0);
console.log('PASS: full-trip accounting, boundary budgets, unknown/free distinction, FX, food deduplication, outward/return legs, reordering, return preference and all five cities.');
// All-city discovery uses the same budget classification and does not hide missing costs as free.
run("state.city='Hong Kong';state.tripSettings={...state.tripSettings,'Hong Kong':{budget:'100000'}};state.routeDiscovery={'Hong Kong':{category:'',budgetStatus:'within'}};curatedRoutes()");
assert.match(h.app.innerHTML,/No route matches these filters/);
run("state.routeDiscovery['Hong Kong']={category:'',budgetStatus:'incomplete'};curatedRoutes()");
assert.match(h.app.innerHTML,/Missing costs/);
assert.equal(read("BayGoBudget.summarize([{label:'Free HK public area',min:0,max:0,currency:'HKD'}],0)").status,'within');
assert.equal(read('BayGoBudget.summarize([],100)').status,'incomplete');
run("state.city='Zhuhai';state.tripLegOverrides={Zhuhai:{'P-ZH-002|PL-ZH-002':{fare:'19',minutes:'20'}}}");
h.events.change({target:{dataset:{routeMode:'P-ZH-002|PL-ZH-002',city:'Zhuhai'},value:'Walking'}});
assert.equal(run("state.tripLegOverrides.Zhuhai['P-ZH-002|PL-ZH-002'].fare"),'');
console.log('PASS: all-city category/budget discovery, empty cost lists, free foreign-currency entries and clearing stale manual quotes on mode change.');
