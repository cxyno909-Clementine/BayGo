'use strict';

// Community data stays on this device. No messages are delivered to another user.
const activityCategories = ['Dining', 'Hiking & Walks', 'Events', 'Sports', 'Sightseeing', 'Carpool'];
const communityDay = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
const communityNow = () => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Shanghai', dateStyle: 'short', timeStyle: 'short' }).format(new Date());
const activityCategory = item => item.category || (item.type === 'Carpool' ? 'Carpool' : 'Sightseeing');
function extraSampleActivities() {
  return [
    ['DINING', 'Dining', 'Tangjia Dinner Buddies', 'Tangjia Old Town', '18:00', '20:00', 4, 2, 'Everyone pays for their own order. Confirm the menu together.'],
    ['HIKE', 'Hiking & Walks', 'Easy Campus-area Walk', 'BNBU', '09:00', '11:00', 4, 1, 'No organised transport or equipment is included. Confirm the route and weather.'],
    ['EVENT', 'Events', 'Plan a Movie Afternoon', 'Tangjia', '14:00', '17:00', 4, 2, 'Film, cinema, showtime and ticket price must be agreed before booking.'],
    ['SPORT', 'Sports', 'Casual Badminton Buddies', 'BNBU', '15:00', '17:00', 4, 2, 'Court availability and any booking fee must be confirmed. Bring your own equipment.'],
    ['CAR', 'Carpool', 'Find a Shared Taxi to Gongbei', 'BNBU', '10:00', '11:30', 4, 1, 'Split the final licensed taxi fare equally among confirmed riders. No fixed fare or vehicle is booked.'],
  ].map(([code, category, title, meeting, start, end, capacity, accepted, cost]) => ({
    activity_id: 'B-DEMO-' + code, city: 'Zhuhai', type: category === 'Carpool' ? 'Carpool' : 'Outing', category,
    title_en: title, starts_local: '2026-11-21 ' + start, ends_local: '2026-11-21 ' + end,
    meeting_detail_en: meeting, capacity, accepted, remaining: capacity - accepted, gender: 'Any',
    cost_split_en: cost, organizer: 'BayGo Demo Host', status: 'Open', authenticity: 'SIMULATED',
    description_en: 'Fictional activity for trying the find, apply and message flow. Confirm all practical arrangements before any real outing.',
    ...(category === 'Carpool' ? { departure: 'BNBU', destination: 'Gongbei Port', transport: 'Licensed taxi / ride-hailing', vehicle: 'Not arranged' } : {}),
  }));
}
function allActivities() {
  return [...data.activities, ...extraSampleActivities(), ...(state.localActivities || [])].map(item => {
    const reserved = state.applications[item.activity_id]?.status === 'Accepted' ? (Number(state.applications[item.activity_id].partySize) || 1) : 0;
    return { ...item, category: activityCategory(item), gender: item.gender || 'Any',
      remaining: Math.max(0, item.remaining - reserved) };
  });
}
const getActivity = id => allActivities().find(item => item.activity_id === id);
const localActivity = item => item?.authenticity === 'LOCAL';
const communityDemoNote = () => notice('Community demo · this device only', 'Activities you publish, applications and messages are saved in this browser. No other student receives them. Campus verification is simulated.');
const threadUnread = () => Object.values(state.communityThreads || {}).reduce((sum, thread) => sum + (thread.unread || 0), 0);
function addCommunityEvent(id, text) {
  state.communityThreads ||= {};
  const thread = state.communityThreads[id] ||= { messages: [], unread: 0 };
  thread.messages.push({ role: 'system', text, at: new Date().toISOString() });
  thread.unread += 1;
}
function activitySearchText(item) {
  return [item.title_en, item.meeting_detail_en, placeName(item.meeting_place_id), item.departure, item.destination].join(' ').toLowerCase();
}
function matchActivities(criteria) {
  const contains = (value, term) => !term || String(value || '').toLowerCase().includes(term.trim().toLowerCase());
  return allActivities().filter(item => {
    const schedule = activitySchedule(item);
    return !localActivity(item) && item.city === criteria.city && activityCategory(item) === criteria.category
      && activityStatus(item) === 'Open for applications' && schedule.starts.slice(0, 10) === criteria.date
      && schedule.starts.slice(11) < criteria.end && schedule.ends.slice(11) > criteria.start
      && item.capacity === Number(criteria.capacity) && item.remaining >= Number(criteria.existing)
      && item.gender === criteria.gender && contains(activitySearchText(item), criteria.meeting)
      && (criteria.category !== 'Carpool' || (contains(item.departure, criteria.departure) && contains(item.destination, criteria.destination)));
  });
}
function communityValidation(fields, publishing = false) {
  const errors = {};
  if (!cityNames.includes(fields.city)) errors.city = 'Choose a supported city.';
  if (!activityCategories.includes(fields.category)) errors.category = 'Choose an activity category.';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fields.date || '') || !Number.isFinite(Date.parse(fields.date + 'T00:00:00Z')) || new Date(fields.date + 'T00:00:00Z').toISOString().slice(0,10) !== fields.date || fields.date < communityDay()) errors.date = 'Choose today or a later valid date.';
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(fields.start || '')) errors.start = 'Choose a start time.';
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(fields.end || '') || fields.end <= fields.start) errors.end = 'Choose a later end time on the same day.';
  if (!errors.date && !errors.start && fields.date + ' ' + fields.start <= communityNow()) errors.start = 'The start time must be in the future (China Standard Time).';
  const capacity = Number(fields.capacity), existing = Number(fields.existing);
  if (!Number.isInteger(capacity) || capacity < 2 || capacity > 20) errors.capacity = 'Total group size must be 2–20, including you.';
  if (!Number.isInteger(existing) || existing < 1 || existing >= capacity) errors.existing = 'Include yourself; leave at least one open place.';
  if (!['Any', 'Women only', 'Men only'].includes(fields.gender)) errors.gender = 'Choose a preference.';
  if (!(fields.meeting || '').trim() || fields.meeting.length > 120) errors.meeting = 'Enter a meeting area (up to 120 characters).';
  if ((fields.details || '').length > 1000) errors.details = 'Use at most 1,000 characters.';
  if (fields.category === 'Carpool') {
    for (const name of ['departure', 'destination']) if (!(fields[name] || '').trim() || fields[name].length > 120) errors[name] = 'Enter a location (up to 120 characters).';
    if (!['Licensed taxi / ride-hailing', 'Public transport together', 'Private vehicle'].includes(fields.transport)) errors.transport = 'Choose a travel arrangement.';
    if (!['Not arranged', 'Already arranged'].includes(fields.vehicle)) errors.vehicle = 'Choose an arrangement status.';
    if (capacity > 7) errors.capacity = 'For this carpool demo, choose 2–7 people and confirm the vehicle capacity separately.';
  }
  if (publishing) {
    if (!(fields.title || '').trim() || fields.title.length > 80) errors.title = 'Add an activity title (up to 80 characters).';
    if (!(fields.details || '').trim()) errors.details = 'Describe what the group will do.';
    if (!(fields.cost || '').trim() || fields.cost.length > 300) errors.cost = 'Explain costs and how they are split (up to 300 characters).';
    if (!fields.confirm) errors.confirm = 'Confirm that this is a local demo.';
  }
  return errors;
}
function communityFind() {
  const creating = params.get('mode') === 'create';
  const f = { city: state.city, date: '', start: '10:00', end: '18:00', category: 'Dining', capacity: '4', existing: '1', gender: 'Any', ...state.communityDraft };
  show(`<section class="stack">${communityDemoNote()}<h2>${creating ? 'Create an Activity' : 'Find or Create an Activity'}</h2>
    <p class="meta">Search by category, date, overlapping time window, meeting area, target group size and preference. All times use China Standard Time. An application can include the people already with you; the host must confirm all places together.</p>
    ${!state.profile || !state.verified ? action('community-verify', 'Try Simulated Campus Verification', 'outline') : badge('Campus verification simulated')}
    <form id="community-find" data-mode="${creating ? 'create' : 'find'}" class="fields">
    ${field('city','City',select('city',cityNames.map(v=>[v,v]),f.city))}
    ${field('category','Activity category',select('category',activityCategories.map(v=>[v,v]),f.category))}
    ${field('date','Date',input('date','date',f.date,`required min="${communityDay()}"`))}
    <div class="pair">${field('start','Earliest start',input('start','time',f.start,'required'))}${field('end','Latest end',input('end','time',f.end,'required'))}</div>
    <div class="pair">${field('capacity','Target total group size',input('capacity','number',f.capacity,'required min="2" max="20"'))}${field('existing','People already with you',input('existing','number',f.existing,'required min="1" max="19"'),'Include yourself. Available places must fit this group.')}</div>
    ${field('gender','Group preference',select('gender',['Any','Women only','Men only'].map(v=>[v,v]),f.gender),'Any is the default. This matches the advertised preference; no gender identity is verified.')}
    ${field('meeting','Meeting area',input('meeting','text',f.meeting,'required maxlength="120" placeholder="e.g. BNBU or Tangjia"'))}
    <fieldset id="carpool-fields" ${f.category === 'Carpool' ? '' : 'hidden'}><legend>Carpool arrangements</legend>
    ${field('departure','Departure',input('departure','text',f.departure,'maxlength="120"'))}${field('destination','Destination',input('destination','text',f.destination,'maxlength="120"'))}
    ${field('transport','Travel arrangement',select('transport',['Licensed taxi / ride-hailing','Public transport together','Private vehicle'].map(v=>[v,v]),f.transport || 'Licensed taxi / ride-hailing'))}
    ${field('vehicle','Vehicle / booking status',select('vehicle',['Not arranged','Already arranged'].map(v=>[v,v]),f.vehicle || 'Not arranged'))}
    <p class="meta">Open places are total group size minus people already joining. This is a request for companions, not a vehicle booking, driver verification or payment service.</p></fieldset>
    ${creating ? field('title','Activity title',input('title','text',f.title,'required maxlength="80"')) : ''}
    ${field('details',creating ? 'Activity details' : 'Additional details (kept for publishing)',`<textarea name="details" id="details" maxlength="1000" ${creating ? 'required' : ''}>${esc(f.details)}</textarea>`)}
    ${creating ? field('cost','Costs and cost sharing',`<textarea name="cost" id="cost" required maxlength="300">${esc(f.cost)}</textarea>`)+field('confirm','Demo acknowledgement','<label class="check"><input type="checkbox" name="confirm" id="confirm" required>I understand this is published on this device only.</label>') : ''}
    ${submit(creating ? 'Publish on This Device' : 'Find Matching Activities')}</form>
    ${creating ? link('Q05','Back to Search') : link('Q05','Create Instead',{mode:'create'},'outline')}</section>`);
}
function communityMatches() {
  const f = state.communityDraft;
  if (!f || Object.keys(communityValidation(f)).length) return show(notice('Set your search conditions', 'Choose a future date and your activity preferences first.',link('Q05','Find an Activity',{},'primary')));
  const matches = matchActivities(f);
  show(`<section class="stack">${communityDemoNote()}<h2>${matches.length ? matches.length + ' matching activities' : 'No matching activities'}</h2>
    <p>${esc(f.city)} · ${esc(f.category)} · ${esc(f.date)} · ${esc(f.start)}–${esc(f.end)}</p>
    <p class="meta">Matches keep your city, category, date, overlapping time, meeting keyword, target total size and group preference. Carpool also matches departure and destination. Descriptive notes do not change these filters.</p>
    ${link('Q05','Edit Search',{},'outline')}${link('Q05','Create Using These Details',{mode:'create'},'primary')}
    ${matches.map(item=>activityCard(item)).join('')}</section>`);
}
function myActivities() {
  const mine = allActivities().filter(localActivity);
  show(`<section class="stack">${communityDemoNote()}${link('Q05','Create an Activity',{mode:'create'},'primary')}
    ${mine.map(item=>`<section class="stack">${activityCard(item)}${badge(activityStatus(item))}${item.status !== 'Cancelled' ? action('cancel-activity','Cancel This Activity','outline',`data-id="${esc(item.activity_id)}"`) : ''}</section>`).join('') || '<p>No activities published on this device yet.</p>'}</section>`);
}
function communityInbox() {
  restoreCommunityThreads();
  show(`<section class="stack">${communityDemoNote()}<p class="meta">System updates and your local message drafts appear here. No simulated host replies are generated.</p>
    ${Object.entries(state.communityThreads || {}).map(([id,thread])=>{const item=getActivity(id);return item ? `<article class="card"><h2>${esc(item.title_en)}</h2>${thread.unread ? badge(thread.unread+' unread local updates') : ''}${para(thread.messages.at(-1)?.text)}${link('M05','Open Conversation',{id},'outline')}</article>` : '';}).join('') || notice('No conversations yet','Apply to an activity to start a local demo conversation.',link('Q01','Find Buddies'))}</section>`);
}
function conversationAllowed(id) {
  const item = getActivity(id), record = state.applications[id];
  return !!(state.profile && state.verified && item && ['Pending','Accepted'].includes(record?.status) && !['Cancelled','Ended'].includes(activityStatus(item)));
}
function communityConversation() {
  restoreCommunityThreads();
  const id = params.get('id'), item=getActivity(id), record=state.applications[id], thread=state.communityThreads?.[id];
  if (!item || !record || !thread || !state.profile) return unavailable();
  if (thread.unread) commit(()=>{state.communityThreads[id].unread=0;});
  const allowed=conversationAllowed(id);
  show(`<section class="stack">${communityDemoNote()}<h2>${esc(item.title_en)}</h2>${badge(esc(record.status))}
    ${link('Q02','View Activity',{id})}${link('M03','View Application',{id})}
    <ol class="message-list">${thread.messages.map(message=>`<li class="card"><strong>${message.role==='system'?'Local system update':'You · local only'}</strong>${para(message.text)}<p class="meta">${esc(message.at)}</p></li>`).join('')}</ol>
    ${allowed ? `<form id="community-message" class="fields">${field('message','Message draft', '<textarea id="message" name="message" required maxlength="1000" placeholder="Ask about the meeting point or cost sharing."></textarea>','Stored locally. This is not sent to the host.')}${submit('Save Message Locally')}</form>` : notice('Conversation is read-only','The application was withdrawn or declined, or the activity is cancelled or ended. Previous messages remain visible.')}</section>`);
}
const communityActions = {
  'community-verify': () => startAuth({type:'community'},true),
  'cancel-activity': button => {
    const item=state.localActivities?.find(a=>a.activity_id===button.dataset.id);
    if (!item || item.status==='Cancelled') return;
    if (commit(()=>{item.status='Cancelled';if(state.communityThreads?.[item.activity_id]) addCommunityEvent(item.activity_id,'Activity cancelled locally. No external notification was sent.');})) {refresh();announce('Local activity cancelled.');}
  },
  'demo-decision': button => {
    const {id,status}=button.dataset, item=getActivity(id), record=state.applications[id];
    if (!state.verified || !item || localActivity(item) || !record || record.status!=='Pending' || !['Accepted','Declined'].includes(status) || activityStatus(item)!=='Open for applications' || (status==='Accepted' && item.remaining < (Number(record.partySize)||1))) return;
    if (commit(()=>{record.status=status;addCommunityEvent(id,`Demo control: application marked ${status.toLowerCase()} on this device. No real host made this decision.`);})) refresh();
  },
};
function communitySubmit(form,fields) {
  if (form.id === 'community-find') {
    if (form.dataset.saved) return true;
    const publishing=form.dataset.mode==='create';
    const errors=communityValidation(fields,publishing);
    renderErrors(form,errors);
    if(Object.keys(errors).length) return true;
    if(!publishing) {
      if(commit(()=>{state.communityDraft={...fields};})) routeTo('#Q06');
      return true;
    }
    if(!state.profile || !state.verified) {announce('Complete simulated campus verification before publishing.');return true;}
    const id='B-LOCAL-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8);
    const capacity=Number(fields.capacity),accepted=Number(fields.existing);
    if(commit(()=>{
      state.communityDraft={...fields};
      state.localActivities ||= [];
      state.localActivities.push({activity_id:id,city:fields.city,category:fields.category,type:fields.category==='Carpool'?'Carpool':'Outing',title_en:fields.title.trim(),starts_local:fields.date+' '+fields.start,ends_local:fields.date+' '+fields.end,capacity,accepted,remaining:capacity-accepted,gender:fields.gender,meeting_detail_en:fields.meeting.trim(),description_en:fields.details.trim(),cost_split_en:fields.cost.trim(),organizer:'You · local demo',status:'Open',authenticity:'LOCAL',...(fields.category==='Carpool'?{departure:fields.departure.trim(),destination:fields.destination.trim(),transport:fields.transport,vehicle:fields.vehicle}:{})});
    })) { form.dataset.saved='1'; routeTo(url('Q02',{id})); }
    return true;
  }
  if(form.id==='community-message') {
    const id=params.get('id'), text=(fields.message||'').trim();
    if(!conversationAllowed(id) || !text || text.length>1000 || !state.communityThreads?.[id]) {announce('This message cannot be saved. Check its length and application status.');return true;}
    if(commit(()=>{state.communityThreads[id].messages.push({role:'you',text,at:new Date().toISOString()});})) {refresh();announce('Message saved locally; not sent to another person.');}
    return true;
  }
  return false;
}

function restoreCommunityThreads() {
  const missing=Object.keys(state.applications).filter(id=>getActivity(id) && !state.communityThreads?.[id]);
  if(missing.length) commit(()=>{for(const id of missing) addCommunityEvent(id,'Existing local application restored. No host was contacted.');});
}
