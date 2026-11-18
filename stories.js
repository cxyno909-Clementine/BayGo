'use strict';

const storyCategories=['Places','Food & Services','Travel Tips','Daily Life'];
const allStories=()=>[...(state.localStories || []).filter(story=>story.published!==false).slice().reverse(),...data.stories];
const getStory=id=>(state.localStories || []).find(story=>story.story_id===id) || data.stories.find(story=>story.story_id===id);
const ownStory=story=>story?.authenticity==='LOCAL';
const emptyStoryDraft=()=>({city:state.city,title:'',body:'',category:'Places',topics:'',placeIds:[],dishes:{},disclosure:'',route:null});
function storyErrors(draft) {
  const errors={};
  if(!cityNames.includes(draft.city)) errors['story-city']='Choose a supported city.';
  if(!storyCategories.includes(draft.category)) errors.category='Choose a category.';
  if(!draft.title?.trim() || draft.title.length>100) errors.title='Add a title, up to 100 characters.';
  if(!draft.body?.trim() || draft.body.length>5000) errors.body='Write your post, up to 5,000 characters.';
  if((draft.topics || '').length>200) errors.topics='Use up to 200 characters for topic tags.';
  if(!draft.disclosure?.trim() || draft.disclosure.length>300) errors.disclosure='State any payment, gift or other connection, up to 300 characters.';
  if((draft.placeIds || []).some(id=>!directoryPlaces.some(place=>place.id===id && place.city===draft.city))) errors['place-search']='Tagged places must belong to this city and exist in the directory.';
  for(const [id,text] of Object.entries(draft.dishes || {})) if((draft.placeIds || []).includes(id) && text.length>300) errors['dish-'+id]='Use at most 300 characters.';
  return errors;
}
function collectStoryDraft(fields) {
  const draft=structuredClone(state.storyDraft || emptyStoryDraft());
  for(const key of ['title','body','category','topics','disclosure']) if(Object.hasOwn(fields,key)) draft[key]=fields[key];
  for(const id of draft.placeIds) if(Object.hasOwn(fields,'dish-'+id)) draft.dishes[id]=fields['dish-'+id];
  return draft;
}
function stageStoryDraft(draft) {
  const previous=state.storyDraft;
  if(previous && (previous.title?.trim() || previous.body?.trim() || previous.placeIds?.length)) {
    if(commit(()=>{state.pendingStoryDraft=draft;})) routeTo('#Q09');
  } else if(commit(()=>{state.storyDraft=draft;})) routeTo('#Q07');
}
function routeStoryDraft(kind,id) {
  let city,title,ids;
  if(kind==='custom') {city=state.city;title=`My ${city} itinerary`;ids=selectedPlanIds();}
  else if(kind==='curated') {const route=(window.BAYGO_CURATED || []).find(r=>r.id===id);if(!route)return null;({city,title}=route);ids=route.stops;}
  else {const route=data.routes.find(r=>r.route_id===id);if(!route)return null;city=route.city;title=route.title_en;ids=stopsFor(id).map(stop=>stop.place_id).filter(stop=>stop!==campus);}
  ids=[...new Set(ids || [])].filter(stop=>directoryPlaces.some(place=>place.id===stop && place.city===city));
  if(ids.length<2)return null;
  const stops=ids.map(stop=>{const item=directoryPlaces.find(place=>place.id===stop);return {id:stop,name:item.name,category:item.category,price:placePriceText(item)};});
  const accounting=kind==='recommended'?window.BayGoBudget.summarize(data.routes.find(r=>r.route_id===id)?.budget_items || [],planningSettings(city).budget):tripAccounting(ids,city);
  const tripBudget={min:accounting.min,max:accounting.max,status:accounting.status,missing:[...accounting.missing],currency:'CNY'};
  return {...emptyStoryDraft(),city,title,category:'Travel Tips',body:'Suggested itinerary (not a trip review): '+stops.map(stop=>stop.name).join(' → ')+'.',placeIds:ids,dishes:{},route:{city,title,stops,start:kind==='recommended' && entry?.filters?.start?placeName(entry.filters.start):'BNBU',end:kind==='recommended' && entry?.filters?.end?placeName(entry.filters.end):'BNBU',capturedOn:new Date().toISOString(),tripBudget,cost:stopCostReferences(ids),note:'Suggested stop order. Transport times and a complete trip budget are not verified. The saved cost breakdown and personal allowances are not live quotes.'}};
}
function storyTagsMarkup(story) {
  return (story.placeIds || []).map(id=>link('E04',esc(placeName(id)),{id},'outline')).join('');
}
function storyRouteMarkup(route,allowCopy=false) {
  if(!route)return '';
  return heading('Shared Route Snapshot',`<article class="card stack"><h3>${esc(route.title)}</h3><p>${esc(route.start)} → ${route.stops.map(stop=>esc(stop.name)).join(' → ')} → ${esc(route.end)}</p>
    <ol>${route.stops.map(stop=>`<li>${esc(stop.name)}<p class="meta">${esc(stop.price)}</p>${link('E04','Place Details',{id:stop.id})}</li>`).join('')}</ol>
    <p class="meta">${esc(route.note)} Snapshot saved ${esc(route.capturedOn)}.</p>
    ${route.tripBudget ? `<p><strong>${route.tripBudget.missing?.length?'Known trip subtotal':'Estimated trip total'}: ${costRange(route.tripBudget)}</strong></p>${route.tripBudget.missing?.length?`<p class="meta">Costs still to confirm: ${esc(route.tripBudget.missing.join('; '))}. This snapshot does not confirm budget feasibility.</p>`:''}<p class="meta">Includes the captured plan’s transport, meals and admission assumptions; personal allowances and prices can change. Open a new plan to recalculate.</p>` : ''}
    ${Object.entries(route.cost?.groups || {}).map(([currency,amount])=>`<p>${esc(priceMoney(amount,currency))} · known stop-cost subtotal</p>`).join('')}
    <p class="meta">${route.cost?.known || 0} of ${route.stops.length} stops have a reference. Transport, unpriced stops and extras are excluded; currencies are separate.</p>
    ${allowCopy ? action('copy-story-route','Use These Stops in My Planner','outline',`data-id="${esc(params.get('id'))}"`)+'<p class="meta">Copies stop order into the planner, whose start/return is BNBU. Replaces this city’s selection; the previous selection is kept for undo. Snapshot costs, timings or other endpoints are not imported.</p>' : ''}</article>`);
}
function storyEditor() {
  const draft=state.storyDraft || emptyStoryDraft();
  if(!state.storyDraft && !commit(()=>{state.storyDraft=draft;})) return show(notice('Cannot save a draft','Free some browser storage and try again.'));
  const search=state.storyPlaceSearch || '';
  const matches=directoryPlaces.filter(place=>place.city===draft.city && [place.name,place.localName,place.category,place.district].join(' ').toLowerCase().includes(search.toLowerCase().trim()));
  show(`<section class="stack"><h2>${draft.editingId ? 'Edit Your Post' : 'Write a Student Story'}</h2><p class="meta">Draft saved on this device. Published posts stay in this browser; other students do not receive them in this prototype.</p>
    ${!state.profile || !state.verified ? action('story-verify','Try Simulated Campus Verification','outline') : badge('Campus verification simulated')}
    <form id="story-editor" class="fields">
    ${field('story-city','City',`<select id="story-city" data-story-city>${cityNames.map(city=>option(city,city,draft.city)).join('')}</select>`,'To change a route’s city or clear existing place tags, start a separate post.')}
    ${field('category','Category',select('category',storyCategories.map(v=>[v,v]),draft.category))}
    ${field('title','Post title',input('title','text',draft.title,'required maxlength="100"'))}
    ${field('body','Your story',`<textarea id="body" name="body" required maxlength="5000" rows="8">${esc(draft.body)}</textarea>`,'Share your experience or label an untried suggestion clearly. Keep claims factual and disclose commercial connections.')}
    ${field('topics','Topic tags',input('topics','text',draft.topics,'maxlength="200" placeholder="e.g. budget, coffee, avoid-the-crowds"'))}
    ${field('disclosure','Connection / sponsorship disclosure',`<textarea id="disclosure" name="disclosure" required maxlength="300">${esc(draft.disclosure)}</textarea>`)}
    ${field('place-search','Find a place to tag',input('place-search','search',search,'placeholder="English / Chinese place name"'))}
    <div id="story-place-results">${storyPlaceChoices(matches,draft)}</div>
    <section id="story-tagged-places">${storyTaggedPlaces(draft)}</section>
    ${storyRouteMarkup(draft.route)}${submit('Preview Post')}</form>
    ${action('new-story','Start a Separate Post','outline')}${state.previousStoryDraft?action('restore-story-draft','Restore Previous Draft','outline'):''}${link('Q01','Student Stories',{tab:'stories'},'outline')}${link('M07','My Posts',{},'outline')}</section>`);
}
function storyPlaceChoices(matches,draft) {
  return `<p class="meta">${matches.length} places in this city. Tags and the shared route are separate. Adding or removing tags does not change the route snapshot.</p>`+matches.map(place=>`<label class="check"><input type="checkbox" data-story-place="${esc(place.id)}" ${draft.placeIds.includes(place.id)?'checked':''}><span>${esc(place.name)}${place.localName ? ` · <span lang="zh">${esc(place.localName)}</span>` : ''}</span></label>`).join('');
}
function storyTaggedPlaces(draft) {
  return `<h3>Tagged Places & Recommendations</h3>${draft.placeIds.map(id=>{const place=directoryPlaces.find(p=>p.id===id);return `<article class="card"><h4>${esc(place?.name || id)}</h4>${field('dish-'+id,['Restaurants','Cafes & Desserts'].includes(place?.category)?'Recommended dishes / drinks (optional)':'Tips for this place (optional)',`<textarea id="dish-${esc(id)}" name="dish-${esc(id)}" data-story-dish="${esc(id)}" maxlength="300">${esc(draft.dishes[id])}</textarea>`)}${action('remove-story-place','Remove Tag','text',`data-id="${esc(id)}"`)}</article>`;}).join('') || '<p class="meta">No places tagged. You can still write a general story; places outside our directory can be described in your text.</p>'}`;
}
function storyPreview() {
  const draft=state.storyDraft;
  if(!draft || Object.keys(storyErrors(draft)).length) return show(notice('Finish your draft first','Add a title, story and disclosure.',link('Q07','Edit Draft',{},'primary')));
  show(`<section class="stack">${badge('Preview · not published')}<h2>${esc(draft.title)}</h2><p>${esc(draft.city+' · '+draft.category)}</p><div class="story-body">${para(draft.body)}</div>
    ${storyTagsMarkup(draft)}${storyRecommendations(draft)}${storyRouteMarkup(draft.route)}${heading('Disclosure',para(draft.disclosure))}
    <p class="meta">Publishing saves this post on this device only. Simulated campus verification is required. Do not publish paid advertisements or disguised commercial promotion.</p>
    <form id="story-publish" class="fields"><label class="check"><input name="confirm" type="checkbox" required>I confirm this is a local demo post and have disclosed relevant connections.</label>${submit(draft.editingId ? 'Update Post on This Device' : 'Publish on This Device')}</form>
    ${link('Q07','Edit Draft',{},'outline')}${!state.profile || !state.verified?action('story-verify','Try Simulated Campus Verification','outline'):''}</section>`);
}
function storyRecommendations(story) {
  const entries=(story.placeIds || []).filter(id=>story.dishes?.[id]?.trim());
  return entries.length ? heading('Place Tips & Food Recommendations',entries.map(id=>`<article class="card"><h3>${esc(placeName(id))}</h3>${para(story.dishes[id])}</article>`).join('')) : '';
}
function userStoryDetails(story) {
  show(`<section class="stack">${badge(story.published===false?'Your unpublished post':'Your local demo post')}<h2>${esc(story.title_en)}</h2><p class="meta">${esc(story.city+' · '+story.category)} · ${esc(story.updatedOn)}</p>
    <div class="story-body">${para(story.body_en)}</div>${story.tags_en?para('#'+story.tags_en.split(',').map(t=>t.trim()).filter(Boolean).join(' #')):''}
    ${storyTagsMarkup(story)}${storyRecommendations(story)}${storyRouteMarkup(story.route,true)}${heading('Disclosure',para(story.disclosure_en))}
    <p class="meta">Only visible in this browser. No real campus account was verified; no commercial-content moderation is connected.</p>
    ${action('edit-story','Edit My Post','outline',`data-id="${esc(story.story_id)}"`)}${link('M07','My Posts',{},'outline')}${link('Q01','Back to Student Stories',{tab:'stories'},'primary')}
    ${link('F01','Report',{kind:'story',id:story.story_id})}</section>`,toolbar(saveButton('story',story.story_id)));
}
function myPosts() {
  show(`<section class="stack"><h2>My Posts</h2><p class="meta">Saved in this browser. Unpublishing keeps the post for editing.</p>${action('write-story',state.storyDraft?'Continue Draft':'Write a Post','primary')}
    ${(state.localStories || []).slice().reverse().map(story=>`<article class="card"><h3>${esc(story.title_en)}</h3>${badge(story.published===false?'Unpublished':'Published locally')}${link('Q04','View Post',{id:story.story_id})}${action('edit-story','Edit','outline',`data-id="${esc(story.story_id)}"`)}${story.published!==false?action('unpublish-story','Unpublish','outline',`data-id="${esc(story.story_id)}"`):''}</article>`).join('') || '<p>No posts yet.</p>'}</section>`);
}
function storyDraftConflict() {
  if(!state.pendingStoryDraft)return storyEditor();
  show(notice('You already have a draft','Keep editing it, or replace it with the new route/post. The previous draft is kept for undo.',`<div class="cluster">${action('use-pending-story','Use New Draft','primary')}${action('keep-story-draft','Keep Current Draft','outline')}</div>`));
}
const storyActions={
  'write-story':()=>routeTo('#Q07'),
  'new-story':()=>stageStoryDraft(emptyStoryDraft()),
  'story-verify':()=>startAuth({type:'story'},true),
  'share-route':button=>{const draft=routeStoryDraft(button.dataset.kind,button.dataset.id);if(!draft)return announce('Choose at least two supported places to share.');stageStoryDraft(draft);},
  'use-pending-story':()=>{if(state.pendingStoryDraft && commit(()=>{state.previousStoryDraft=state.storyDraft;state.storyDraft=state.pendingStoryDraft;delete state.pendingStoryDraft;}))routeTo('#Q07');},
  'keep-story-draft':()=>{if(commit(()=>{delete state.pendingStoryDraft;}))routeTo('#Q07');},
  'restore-story-draft':()=>{if(state.previousStoryDraft && commit(()=>{const current=state.storyDraft;state.storyDraft=state.previousStoryDraft;state.previousStoryDraft=current;}))routeTo('#Q07');},
  'remove-story-place':button=>{if(commit(()=>{state.storyDraft.placeIds=state.storyDraft.placeIds.filter(id=>id!==button.dataset.id);delete state.storyDraft.dishes[button.dataset.id];}))refresh();},
  'edit-story':button=>{const story=getStory(button.dataset.id);if(!ownStory(story))return;stageStoryDraft({city:story.city,title:story.title_en,body:story.body_en,category:story.category,topics:story.tags_en,disclosure:story.disclosure_en,placeIds:[...story.placeIds],dishes:structuredClone(story.dishes),route:structuredClone(story.route),editingId:story.story_id});},
  'unpublish-story':button=>{const story=state.localStories?.find(p=>p.story_id===button.dataset.id);if(story && commit(()=>{story.published=false;}))refresh();},
  'copy-story-route':button=>{const route=getStory(button.dataset.id)?.route;if(!route)return;const ids=route.stops.map(s=>s.id).filter(id=>directoryPlaces.some(p=>p.id===id && p.city===route.city));if(ids.length<2)return; if(commit(()=>{state.previousStoryPlan={city:route.city,ids:selectedPlanIds(route.city)};state.customPlans ||= {};state.customPlans[route.city]=ids;state.city=route.city;}))routeTo('#P02');},
  'undo-story-plan':()=>{const previous=state.previousStoryPlan;if(previous && commit(()=>{state.customPlans[previous.city]=previous.ids;state.city=previous.city;delete state.previousStoryPlan;}))routeTo('#P01');},
};
function storySubmit(form,fields) {
  if(form.id==='story-editor') {
    const draft=collectStoryDraft(fields),errors=storyErrors(draft);
    renderErrors(form,errors);if(Object.keys(errors).length)return true;
    if(commit(()=>{state.storyDraft=draft;}))routeTo('#Q08');return true;
  }
  if(form.id==='story-publish') {
    const draft=state.storyDraft;
    if(form.dataset.saved || !draft || Object.keys(storyErrors(draft)).length || !fields.confirm)return true;
    if(!state.profile || !state.verified){announce('Complete simulated campus verification before publishing.');return true;}
    const id=draft.editingId || 'S-LOCAL-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8);
    const previous=draft.editingId ? state.localStories?.find(story=>story.story_id===id) : null;
    if(draft.editingId && !previous)return true;
    const record={story_id:id,city:draft.city,category:draft.category,title_en:draft.title.trim(),body_en:draft.body.trim(),tags_en:draft.topics,disclosure_en:draft.disclosure.trim(),placeIds:[...new Set(draft.placeIds)],dishes:structuredClone(draft.dishes),route:structuredClone(draft.route),author:'You',authenticity:'LOCAL',published:true,createdOn:previous?.createdOn || new Date().toISOString(),updatedOn:new Date().toISOString()};
    if(commit(()=>{state.localStories ||= [];if(previous)state.localStories[state.localStories.findIndex(story=>story.story_id===id)]=record;else state.localStories.push(record);state.city=draft.city;state.lists.stories={};delete state.storyDraft;})){form.dataset.saved='1';routeTo(url('Q04',{id}));}return true;
  }
  return false;
}
