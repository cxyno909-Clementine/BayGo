import assert from 'node:assert/strict';
import { harness } from './verify-phase1.mjs';

const h=harness(), run=h.run;
const json=expression=>JSON.parse(run(`JSON.stringify(${expression})`));
const form={id:'community-find',dataset:{mode:'find'},querySelectorAll:()=>[]};
run(`globalThis.testCriteria={city:'Zhuhai',category:'Dining',date:activitySchedule(getActivity('B-DEMO-DINING')).starts.slice(0,10),start:'17:00',end:'21:00',capacity:'4',existing:'1',gender:'Any',meeting:'Tangjia',details:'Have dinner together.'}`);
assert.deepEqual(json('communityValidation(testCriteria)'),{});
assert.deepEqual(json('matchActivities(testCriteria).map(a=>a.activity_id)'),['B-DEMO-DINING']);
for(const changes of [{city:'Shenzhen'},{category:'Sports'},{start:'21:00',end:'22:00'},{capacity:'5'},{existing:'3'},{gender:'Women only'},{meeting:'No such location'}]) {
  assert.equal(run(`matchActivities({...testCriteria,...${JSON.stringify(changes)}}).length`),0);
}
assert.ok(run("Object.keys(communityValidation({...testCriteria,date:'2026-02-31'})).includes('date')"));
assert.ok(run("Object.keys(communityValidation({...testCriteria,capacity:'2',existing:'2'})).includes('existing')"));
assert.ok(run("Object.keys(communityValidation({...testCriteria,category:'Carpool'})).includes('departure')"));
assert.ok(run("Object.keys(communityValidation({...testCriteria,category:'Carpool',capacity:'8'})).includes('capacity')"));
run("globalThis.carCriteria={...testCriteria,category:'Carpool',date:activitySchedule(getActivity('B-DEMO-CAR')).starts.slice(0,10),start:'09:00',end:'12:00',meeting:'BNBU',departure:'BNBU',destination:'Gongbei',transport:'Licensed taxi / ride-hailing',vehicle:'Not arranged'}");
assert.deepEqual(json('communityValidation(carCriteria)'),{});
assert.deepEqual(json('matchActivities(carCriteria).map(a=>a.activity_id)'),['B-DEMO-CAR']);
assert.equal(run("matchActivities({...carCriteria,destination:'Airport'}).length"),0);
run("globalThis.FormData=class {constructor(form){this.form=form;}[Symbol.iterator](){return Object.entries(this.form.fields||{})[Symbol.iterator]();}};");
const fields=json('testCriteria');
// Search retains all form inputs for the no-match/create step.
h.events.submit({preventDefault(){},target:{...form,fields}});
assert.equal(h.location.hash,'#Q06');
assert.equal(run('state.communityDraft.meeting'),'Tangjia');
assert.match(h.app.innerHTML,/Create Using These Details/);
run("routeTo('#Q05?mode=create')");
assert.match(h.app.innerHTML,/value="Tangjia"/);
// Publishing requires simulated verification; the auth path preserves the draft.
run("actions['community-verify']()");
assert.equal(h.location.hash,'#A01');
run("actions['complete-sign-in']()");
assert.equal(h.location.hash,'#A02');
run("actions['complete-verification']()");
assert.equal(h.location.hash,'#Q05?mode=create');
assert.equal(run('state.verified'),true);
const createForm={...form,dataset:{mode:'create'},fields:{...fields,title:'My <Dinner>',cost:'Pay own bill.',confirm:'on'}};
h.events.submit({preventDefault(){},target:createForm});
assert.equal(run('state.localActivities.length'),1);
assert.match(h.app.innerHTML,/My &lt;Dinner&gt;/);
const ownedId=run('state.localActivities[0].activity_id');
h.events.submit({preventDefault(){},target:createForm});
assert.equal(run('state.localActivities.length'),1);
run(`routeTo('#Q03?id=${ownedId}')`);
assert.match(h.app.innerHTML,/cannot apply to your own/);
const carForm={...form,dataset:{mode:'create'},fields:{...json('carCriteria'),title:'Shared taxi request',details:'Find fellow riders.',cost:'Split the actual fare.',confirm:'on'}};
h.events.submit({preventDefault(){},target:carForm});
assert.equal(run('state.localActivities.length'),2);
assert.equal(run('state.localActivities[1].destination'),'Gongbei');
assert.equal(run('state.localActivities[1].remaining'),3);
// Submit an application, preserving group size, then save a local message.
run("routeTo('#Q03?id=B-DEMO-DINING')");
const applicationForm={id:'application',fields:{partySize:'2',message:'Hello <host>',confirm:'on'}};
h.events.submit({preventDefault(){},target:applicationForm});
assert.equal(run("state.applications['B-DEMO-DINING'].status"),'Pending');
assert.equal(run("state.communityThreads['B-DEMO-DINING'].messages.length"),2);
assert.equal(run('threadUnread()'),1);
h.events.submit({preventDefault(){},target:applicationForm});
assert.equal(run("state.communityThreads['B-DEMO-DINING'].messages.length"),2);
run("routeTo('#M05?id=B-DEMO-DINING')");
assert.equal(run('threadUnread()'),0);
assert.match(h.app.innerHTML,/Hello &lt;host&gt;/);
h.events.submit({preventDefault(){},target:{id:'community-message',fields:{message:'Meet at BNBU?'}}});
assert.equal(run("state.communityThreads['B-DEMO-DINING'].messages.at(-1).role"),'you');
assert.match(h.app.innerHTML,/Meet at BNBU/);
run("actions['demo-decision']({dataset:{id:'B-DEMO-DINING',status:'Accepted'}})");
assert.equal(run("getActivity('B-DEMO-DINING').remaining"),0);
assert.equal(run("state.applications['B-DEMO-DINING'].status"),'Accepted');
assert.equal(run("conversationAllowed('B-DEMO-DINING')"),true);
run("actions.withdraw({dataset:{id:'B-DEMO-DINING'}})");
assert.equal(run("getActivity('B-DEMO-DINING').remaining"),2);
assert.equal(run("conversationAllowed('B-DEMO-DINING')"),false);
const before=run("state.communityThreads['B-DEMO-DINING'].messages.length");
h.events.submit({preventDefault(){},target:{id:'community-message',fields:{message:'Should not save'}}});
assert.equal(run("state.communityThreads['B-DEMO-DINING'].messages.length"),before);
assert.match(h.app.innerHTML,/Conversation is read-only/);
// Decline path, persisted reload and local cancellation.
run("routeTo('#Q03?id=B-DEMO-DINING')");
h.events.submit({preventDefault(){},target:applicationForm});
run("actions['demo-decision']({dataset:{id:'B-DEMO-DINING',status:'Declined'}})");
assert.equal(run("conversationAllowed('B-DEMO-DINING')"),false);
const reloaded=harness(h.storage);
assert.equal(reloaded.run("state.applications['B-DEMO-DINING'].status"),'Declined');
assert.equal(reloaded.run('state.localActivities.length'),2);
h.failWrites(true);
run(`actions['cancel-activity']({dataset:{id:${JSON.stringify(ownedId)}}})`);
assert.equal(run('state.localActivities[0].status'),'Open');
h.failWrites(false);
run(`actions['cancel-activity']({dataset:{id:${JSON.stringify(ownedId)}}})`);
assert.equal(run('state.localActivities[0].status'),'Cancelled');
// Every new screen renders; carpool and existing community navigation remain reachable.
for(const route of ['#Q01','#Q05','#Q05?mode=create','#Q06','#M04','#M06','#M05?id=B-DEMO-DINING','#M03','#Q02?id=B-DEMO-CAR']) {
  run(`routeTo(${JSON.stringify(route)})`);
  assert.ok(h.app.innerHTML.includes('<main'));
  if(route.includes('B-DEMO-CAR')) assert.match(h.app.innerHTML,/Gongbei Port/);
}
// Legacy applications receive an explicitly local thread rather than a fake reply.
run("delete state.communityThreads; routeTo('#M04')");
assert.match(h.app.innerHTML,/Existing local application restored/);
assert.equal(run("state.communityThreads['B-DEMO-DINING'].messages[0].role"),'system');
console.log('PASS: community strict matching, validation, retained draft, auth return, publishing, duplicate prevention, party-size application, local inbox/messages, unread updates, acceptance/decline/withdrawal, persistence, cancellation rollback, legacy migration and nine screen checks.');
