'use strict';

const permitSources = [
  {name:'Zhuhai Public Security Bureau · local requirements',url:'https://crj.ga.zhuhai.gov.cn/Wsyy/aspx/ReadContent.aspx?id=ZN0001',published:'2026-10-08'},
  {name:'National Immigration Administration · application guide',url:'https://www.nia.gov.cn/n741440/n741587/n1316094/n1355872/c1559612/content.html',published:'2023-02-09'},
  {name:'National Immigration Administration · nationwide applications FAQ',url:'https://www.nia.gov.cn/n741440/n741577/c1579923/content.html',published:'2023-05-11'},
  {name:'National Immigration Administration · official fees',url:'https://www.nia.gov.cn/n741445/n741624/index.html',published:null},
  {name:'Zhuhai Public Security Bureau · application offices',url:'https://crj.ga.zhuhai.gov.cn/Wsyy/aspx/ReadContent.aspx?id=ZN0059',published:'2026-09-10'},
  {name:'Zhuhai Public Security Bureau · appointment information',url:'https://crj.ga.zhuhai.gov.cn/Wsyy/zgyy/Step1.aspx',published:null},
];
const permitGuide = {
  guide_id:'G-ZH-002',city:'Zhuhai',category:'Documents & Public Services',
  title_en:'Hong Kong & Macao Travel Permit and Tourist Endorsements',
  audience_en:'Mainland Chinese BNBU students aged 16 or above applying in Zhuhai for tourist travel.',
  last_checked:'2026-11-15',
  search_terms:'港澳通行证 签注 首次办理 非广东户籍 在学证明 Hong Kong Macao permit endorsement travel documents',
  status:'Official sources checked; confirm your own eligibility and appointment requirements with the issuing authority.',
};
window.BAYGO_CONTENT.guides.push(permitGuide);

function permitChoices() {
  return {service:'first',residence:'unknown',...(state.guideChoices?.[permitGuide.guide_id] || {})};
}
function permitPreparation(choices=permitChoices()) {
  const first=choices.service==='first';
  return [
    'Your original valid mainland Resident Identity Card.',
    ...(first ? ['Complete the Chinese Citizen Entry/Exit Document Application Form using the official channel.','Prepare a compliant recent application photo and Guangdong photo receipt. Attend in person for fingerprint collection.']
      : ['Bring your valid Exit-Entry Permit for Travelling to and from Hong Kong and Macao. Check its expiry and existing endorsements.','A photo and Guangdong photo receipt are also required when a permit issued outside Guangdong is used for a first endorsement application in Zhuhai.']),
    ...(choices.residence==='other' ? ['For an individual tourist endorsement as a student from outside Guangdong: obtain proof of current enrolment from your Zhuhai university. Check any home-registration requirements with the authority.']
      : choices.residence==='unknown' ? ['Confirm whether your household registration is in Guangdong; ask the authority which additional eligibility evidence applies.'] : []),
    'Check the selected office, appointment details and the complete official material list before attending.',
  ];
}
function permitGuideDetails() {
  const choices=permitChoices();
  const first=choices.service==='first';
  const checklistItem={...permitGuide,bring_items_en:permitPreparation(choices)};
  const office='Gaoxin Government Service Centre, Public Security Hall, 1/F, Building 1, Dazhou Science and Technology Park, 1 Gangle Road, Tangjiawan, Zhuhai';
  show(`<section class="stack"><p class="eyebrow">Zhuhai · Documents & Public Services</p><h2 class="title">${esc(permitGuide.title_en)}</h2>
    ${para(permitGuide.audience_en)}<p class="meta">Other nationalities, Hong Kong/Macao residents, under-16s and special employment categories need their own official guidance.</p></section>
    ${heading('Choose Your Situation',`<div class="fields">
    ${field('permit-service','What do you need?',`<select id="permit-service" data-permit-choice="service">${option('first','First permit (and tourist endorsement if needed)',choices.service)}${option('endorsement','Already have a valid permit: apply for an endorsement',choices.service)}</select>`)}
    ${field('permit-residence','Household registration (hukou)',`<select id="permit-residence" data-permit-choice="residence">${option('unknown','Not sure yet',choices.residence)}${option('guangdong','Guangdong',choices.residence)}${option('other','Outside Guangdong',choices.residence)}</select>`)}</div>`)}
    ${heading('What You Can Do','<p>Prepare for '+(first?'a first permit application':'a tourist endorsement application')+'. A permit and an endorsement are different documents/permissions. A valid permit alone is insufficient for a tourist visit; check the endorsement for each destination.</p>')}
    ${heading('Eligibility and Your Student Status',`<p>Check whether individual tourism or group tourism applies. Nationwide group-tourist endorsement applications do not mean every applicant automatically qualifies for an individual-tourist endorsement.</p>
    ${choices.residence==='other' ? '<p>Zhuhai’s local guide lists proof of enrolment from a Zhuhai university for non-Guangdong students applying for individual tourist endorsements. A campus email check in BayGo is not this official proof.</p>' : '<p>Confirm the appropriate tourist endorsement with the issuing authority. Studying in Zhuhai does not by itself establish Zhuhai household registration.</p>'}`)}
    ${heading('What to Prepare',preparationChecklist(checklistItem,state.checklist[permitGuide.guide_id] || {}))}
    ${heading('Steps',`<ol><li>Choose the permit service and tourist endorsement for Hong Kong and/or Macao; confirm eligibility.</li><li>Check the official appointment channel and select an office and time.</li><li>Attend with the required materials; complete identity checks, fingerprints where required, and payment.</li><li>Collect the document or use the delivery option offered by the authority. Check all document details and endorsements before booking travel.</li></ol>
    <p class="meta">For endorsement-only applications, an eligible smart-device application may be approved immediately; a failed device application must go to a staffed counter. This is not guaranteed same-day processing.</p>`)}
    ${heading('Time and Cost',`${rows([['New permit','CNY 60 per permit'],['Single-entry endorsement','CNY 15 per endorsement'],['Double-entry endorsement','CNY 30 per endorsement']])}
    <p>Photo, delivery and transport charges are extra. Fees depend on the services selected.</p><p>Zhuhai’s published processing periods: Guangdong household registration — 7 working days; outside Guangdong — 20 days. Confirm the applicable period and collection date when accepted.</p>`)}
    ${heading('Where to Go',`${para(office)}<p class="meta">One option in the official office list; choose the office shown on your appointment. Check its current service hours and available services.</p>
    <p>${external(permitSources[4].url,'Official office list')}</p><p>${external('https://uri.amap.com/search?keyword='+encodeURIComponent('珠海 高新政务服务中心 港乐路1号')+'&city='+encodeURIComponent('珠海')+'&view=map','Search for this office in Amap')}</p>`)}
    ${heading('Official Channels',`<p>${external(permitSources[5].url,'Zhuhai appointment information and booking')}</p><p>${external('https://s.nia.gov.cn/','National Immigration Administration services')}</p><p>For individual eligibility and material questions, consult the issuing authority or the official 12367 immigration service.</p>`)}
    ${heading('Sources and Updates',`<p class="meta">Checked 2026-11-15. Official source pages are in Chinese.</p><ul>${permitSources.map(source=>`<li>${external(source.url,source.name)}${source.published ? ' · published '+esc(source.published) : ''}</li>`).join('')}</ul>
    <p class="meta">Maintenance role: BayGo content editor; the team still needs to assign a named owner. Reports below are saved on this device and have not been sent to the team.</p>${link('F01','Flag Outdated Information',{kind:'guide',id:permitGuide.guide_id})}`)}`,
    toolbar(saveButton('guide',permitGuide.guide_id)));
}
