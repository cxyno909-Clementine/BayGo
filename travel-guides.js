'use strict';

// Editorial guides, not a live timetable, price feed or booking engine.
const travelSources = {
  aa:{name:'AA Bus / Yuejiao Technology · official platform',url:'https://www.baidubaoche.com/'},
  dudu:{name:'Dudu Intercity Bus · routes and booking channel',url:'https://citybus.dudubashi.com/'},
  duduzg:{name:'Dudu · Zhuhai to Guangzhou route',url:'https://citybus.dudubashi.com/routes/zhuhai-to-guangzhou'},
  dudugs:{name:'Dudu · Guangzhou to Shenzhen route',url:'https://citybus.dudubashi.com/routes/guangzhou-to-shenzhen'},
  rail:{name:'China Railway 12306 · official ticket booking',url:'https://www.12306.cn/en/index.html'},
  shekou:{name:'China Merchants Shekou Cruise Homeport · official booking',url:'https://www.cmskchp.com/transport'},
  student:{name:'Shekou Cruise Homeport · ticket and luggage conditions',url:'https://www.cmskchp.com/common?code=CCXZ&firstCode=JCXXZ&secondCode=XLZG'},
  shekouhk:{name:'Shekou Cruise Homeport · Hong Kong city ferry notice',url:'https://h5.cmskchp.com/weixin/pager/5680?isappinstalled=0'},
  hzmb:{name:'HZMB shuttle operator · fares and service',url:'https://www.hzmbus.com/hk/message.html'},
  hzmbbook:{name:'HZMB shuttle operator · official booking entrance',url:'https://www.hzmbus.com/'},
  hkbridge:{name:'Hong Kong Government · bridge crossings and ticketing',url:'https://www.hzmb.gov.hk/sc/cross-boundary.html'},
  hkconnect:{name:'Hong Kong Government · local bridge-port connections',url:'https://www.hzmb.gov.hk/sc/local-public.html'},
  mtr:{name:'MTR · Lo Wu and Lok Ma Chau cross-boundary journeys',url:'https://www.mtr.com.hk/ch/customer/services/to_from_lw_lmc_tourist.html'},
  mtrtime:{name:'MTR · boundary-station opening times',url:'https://www.mtr.com.hk/ch/customer/services/to_from_lw_lmc.html'},
  macaoports:{name:'Macao Government Tourism Office · entry ports',url:'https://www.macaotourism.gov.mo/zh-hans/travelessential/before-you-travel/ports-of-entry'},
  qingmao:{name:'Macao Public Security Police · Qingmao eligibility',url:'https://www.fsm.gov.mo/psp/cht/psp_top7_sm_12_7.html'},
  macaobus:{name:'Macao Transport Bureau · fares and payment discounts',url:'https://www.dsat.gov.mo/DSAT/subpage.aspx?a_id=1612338099'},
  galaxy:{name:'Galaxy Macau · complimentary shuttle routes',url:'https://www.galaxymacau.com/zh-hant/shuttle-bus/'},
  venetian:{name:'The Venetian Macao · complimentary shuttle information',url:'https://hk.venetianmacao.com/hotel/transportation.html'},
  nansha:{name:'Nansha Passenger Port · city ferry fares and timetable',url:'https://www.nskyg.com/'},
  cks:{name:'Chu Kong Passenger Transport · official ticket portal',url:'https://www.cksp.com.hk/'},
  turbo:{name:'TurboJET · city ferry routes, fares and schedules',url:'https://www2.turbojet.com.hk/zh-cn/%E6%B5%B7-%E8%88%B9-cn/'},
  turbobook:{name:'TurboJET · booking methods and collection',url:'https://www2.turbojet.com.hk/zh-cn/%E8%B4%AD%E7%A5%A8/'},
  hka:{name:'Hong Kong International Airport · airside ferry transfer requirements',url:'https://www.hongkongairport.com/sc/transport/mainland-connection/ferry-transfer.page'},
};

const intercityGuides = [
  {
    code:'COACH',cities:['Zhuhai','Guangzhou','Shenzhen'],
    title:'Mainland Intercity Coaches: AA Bus & Dudu',
    summary:'Compare app-only coach pickups with rail for Zhuhai, Guangzhou and Shenzhen.',
    keywords:'AA巴士 嘟嘟城际巴士 购票 大巴 城际 广州 深圳 珠海 微信 小程序',
    fit:'Worth comparing when a coach pickup and drop-off are close to your actual start and destination. The coach may save station transfers, but traffic can make the journey slower.',
    options:[['AA Bus','In WeChat, search the exact mini-program name AA巴士. The operator confirms booking through this channel. Search your city pair and date; route availability and stops must be checked in the app.'],['Dudu Intercity Bus','In WeChat, search 嘟嘟城际巴士, or use the 嘟嘟巴士 app. Its official site lists Zhuhai–Guangzhou and Guangzhou–Shenzhen routes; compare the exact departure and return.'],['Rail comparison','Use Railway 12306 for the same date. Compare the actual stations and local connections, not just the train fare. A train may be the more practical choice when punctuality matters.']],
    steps:['Search the outward and return city pairs and travel date in the mini-program.','Open the stop details or map pin. Check the roadside direction, pickup instructions, drop-off and last departure. Names containing 北师大 or 北理工 do not prove a BNBU campus pickup.','Compare the payable fare, any coupon conditions, luggage rules and refund/change deadline. Enter passenger details as required, then pay in the official booking flow.','Keep the booking confirmation and use its pickup instructions. Check service changes before leaving and use Amap only for the connection to/from that stop.'],
    prices:[['Coach fares','Live quote required','No guaranteed student rate or fixed lowest fare is recorded. New-user or limited-period promotions may have conditions.']],
    pitfalls:['A route advertised on a website is not proof of a bookable departure on your date.','Compare both local access legs and the return journey; a distant low-fare drop-off can cost more overall.'],
    prepare:['Check the dated ticket and exact pickup/drop-off.','Carry the passenger document required by the booking.','Save the return departure and refund/change terms.'],
    sources:['aa','dudu','duduzg','dudugs','rail'],
  },
  {
    code:'ZH-SZ-FERRY',cities:['Zhuhai','Shenzhen'],
    title:'Zhuhai–Shenzhen: Compare the Jiuzhou–Shekou Ferry',
    summary:'An alternative to a long road journey, especially for a destination around Nanshan or Shekou.',
    keywords:'九洲港 蛇口 邮轮母港 轮渡 船票 学生票 深圳 珠海',
    fit:'Compare a ferry when the terminals suit your trip. Any time saved on the water must be weighed against travel from BNBU to Jiuzhou Port and the Shenzhen final leg. It is not automatically cheaper than a coach.',
    options:[['Route','Zhuhai Jiuzhou Port (九洲港) ↔ Shenzhen Shekou Cruise Homeport (蛇口邮轮母港). Use the exact terminals, not a generic city name.'],['Student fare enquiry','The Shekou operator says domestic student tickets are not sold online and directs passengers to its second-floor ticket centre. Confirm eligibility, current fare, stock and proof before relying on a discount; this does not establish the Jiuzhou-side sales rule.']],
    steps:['Open the official Shekou booking portal, or its linked WeChat channel, and search Jiuzhou–Shekou for your date.','Choose direction, sailing and cabin. Compare the final quote against a coach for the same journey.','Enter passenger details matching the accepted identity document. Read the collection/check-in instructions and refund terms before paying.','For a student ticket from Shekou, ask the operator about counter purchase and bring the required original student proof. Do not assume an online adult ticket can be refunded into a student ticket.','Recheck weather notices and the last return sailing. Allow separate travel and check-in time at each terminal.'],
    prices:[['Ordinary / student cabin','Live quote required','No unverified fixed student price is displayed. A concession may require a counter visit and specific proof.']],
    pitfalls:['Ferries can be affected by weather or service changes.','Buying one direction does not reserve the return sailing.'],
    prepare:['Original accepted passenger ID.','Required student proof if claiming a concession.','Outward and return sailing confirmations and terminal access plan.'],
    sources:['shekou','student'],
  },
  {
    code:'ZH-HK',cities:['Zhuhai','Hong Kong'],
    title:'Zhuhai–Hong Kong: Bridge Shuttle or City Ferry?',
    summary:'Compare a lower-fare bridge crossing with a ferry that may save city transfers.',
    keywords:'香港 金巴 港珠澳大桥 港珠线 九洲港 上环 中港城 B5 B6 购票',
    fit:'The bridge shuttle is a useful budget baseline. A Jiuzhou–Hong Kong city ferry may suit a waterfront destination better, but needs a separate quote and sailing check. Compare the full trip in both directions.',
    options:[['Bridge shuttle','BNBU → HZMB Zhuhai Port → Hong Kong-bound shuttle → Hong Kong Port → local connection. The shuttle ends at the port, not Central or Tsim Sha Tsui.'],['Hong Kong final leg','Official connections include B6 towards Tung Chung and B5 towards Sunny Bay; check their current stops and then use the MTR journey planner. These tickets are additional.'],['City ferry','Compare Jiuzhou Port with the Hong Kong terminal shown in TurboJET’s current schedule. Some Kowloon sailings route via Sheung Wan; check the actual itinerary. Do not select an airport ferry for a city visit.']],
    steps:['For the bridge, enter the operator’s official website/linked booking channel, select Zhuhai → Hong Kong and the required ticket. Port counters and machines are another official option.','Follow port signage for document checks and shuttle boarding. Keep the ticket and accepted original travel documents available.','At Hong Kong Port, choose a current local bus/MTR connection for the destination. Budget the port-to-city leg separately.','Book or check the return in the reverse direction; note that the Hong Kong-origin fare is quoted in HKD.','For the city-ferry alternative, open TurboJET’s official booking entrance and select the exact origin, arrival terminal, date and sailing before comparing totals.'],
    prices:[['Zhuhai → Hong Kong shuttle, adult','CNY 58 day / CNY 63 night','Day 06:00–23:59; night 00:00–05:59. Port access and Hong Kong local travel excluded.'],['Hong Kong → Zhuhai shuttle, adult','HKD 65 day / HKD 70 night','Do not add CNY and HKD as if they were the same currency.'],['Jiuzhou–Hong Kong city ferry','Live quote required','Compare ticket, access and final connection; no lowest-price promise.']],
    pitfalls:['Standard university student status is not listed as a bridge-shuttle concession category.','A 24-hour shuttle does not make every local connecting bus, train or campus connection run all night.'],
    prepare:['Valid documents and the endorsement required for your own trip.','Shuttle/ferry ticket and exact terminal.','Hong Kong local payment method and a complete return plan.'],
    sources:['hzmb','hkbridge','hkconnect','hzmbbook','turbo','turbobook'],airportWarning:true,
  },
  {
    code:'SZ-HK',cities:['Shenzhen','Hong Kong'],
    title:'Shenzhen–Hong Kong: Border Rail, City Ferry & Last Connections',
    summary:'Choose the crossing for your destination instead of automatically taking a taxi or high-speed train.',
    keywords:'深圳 香港 罗湖 福田 落马洲 东铁 上环 蛇口 过境',
    fit:'Compare the Shenzhen metro + boundary crossing + MTR with high-speed rail or an available city-ferry sailing. The better value depends on your starting point, destination and date.',
    options:[['Lo Wu / Luohu','Luohu Port connects with MTR Lo Wu after immigration.'],['Lok Ma Chau / Futian','Futian Port connects with MTR Lok Ma Chau after immigration. This is not the same crossing as the Huanggang / Lok Ma Chau road crossing.'],['Shekou–Hong Kong city ferry','The operator’s published notice lists weekend service and weekday suspension. Check the dated booking system before choosing this option; it is not a confirmed daily fallback.']],
    steps:['Check the exact Shenzhen port and the Hong Kong MTR destination. Use the official MTR cross-boundary planner and compare the fare with your other options.','Purchase a suitable MTR single-journey ticket, use accepted Octopus payment, or compare an official visitor ticket and its exclusions. Do not assume a general day pass covers boundary travel.','If taking a ferry, use the Shekou official booking portal and select a Hong Kong city terminal, not the airport transfer terminal.','Before paying, check operating hours, your last usable Hong Kong train/bus to the boundary, and the onward Shenzhen connection.'],
    prices:[['MTR cross-boundary fare','Check the official journey planner','Station pair, ticket product and payment method matter.'],['Shekou–Hong Kong ferry','Live quote and operating day required','The published route notice is limited to weekends; dated availability governs.']],
    pitfalls:['Reaching a port before it closes is not enough if its last connecting train has already departed.','A student card does not automatically establish eligibility for a local concession product.'],
    prepare:['Valid travel documents for your own crossing.','Exact border/terminal name and onward station.','Return connection checked before departure.'],
    sources:['mtr','mtrtime','rail','shekou','shekouhk'],airportWarning:true,
  },
  {
    code:'MACAO-LAND',cities:['Zhuhai','Guangzhou','Macao'],
    title:'Macao on a Budget: Walk Across, Then Bus or Free Shuttle',
    summary:'Use a suitable Zhuhai crossing, local buses and published hotel shuttles instead of defaulting to taxis.',
    keywords:'澳门 拱北 关闸 横琴 青茂 免费 穿梭巴士 发财车 澳门通 搭车码 广州 珠海',
    fit:'For a trip via Zhuhai, compare a pedestrian land crossing and the final bus with a ferry or taxi. From Guangzhou, first compare rail/coach to the relevant Zhuhai stop; reaching Zhuhai is a separate paid leg.',
    options:[['Choose the crossing','Compare Gongbei / Border Gate for the peninsula and Hengqin for the Cotai side, then check the final destination. Qingmao has document and traveller-eligibility restrictions: it is not a universal alternative.'],['Public buses','Cash/normal fare is MOP 6. An eligible Macau Pass stored-value card normally offers MOP 3 on ordinary routes, MOP 4 on express routes, and qualifying transfer benefits. Card acquisition cost matters for a short visit.'],['Mainland mobile payment','The Transport Bureau says mainland WeChat/Alipay bus codes charge MOP 6 per ride without the stored-value or transfer discounts. In WeChat, the published mini-program search name is 搭車碼.'],['Complimentary hotel shuttles','Galaxy and Venetian publish free shuttle services from selected ports/terminals. Choose one only if its destination suits your trip; confirm boarding location, hours and conditions. These are limited routes, not an all-city free bus network.']],
    steps:['Choose a port using the official port list, confirm your document eligibility and opening hours, then plan the Zhuhai access leg.','Complete border formalities on foot through the appropriate passenger route. Crossing on foot avoids buying a separate cross-border boat or coach ticket; onward transport still costs money.','For public buses, follow port signage and check the route towards your destination. Decide between cash, a supported card or the official mobile bus-code flow.','For a free hotel shuttle, open the hotel’s official transport page and find the exact port pickup and destination. Queue at the signed stop; do not pay a third party to join a published free service.','Check the return shuttle/public bus and port hours. Keep a paid public-transport alternative in case the shuttle stops early or the queue is long.'],
    prices:[['Public bus, normal/cash or mainland mobile code','MOP 6 / ride','Mainland mobile codes do not inherit Macau Pass stored-value discounts.'],['Eligible stored-value Macau Pass','MOP 3 ordinary / MOP 4 express','Card purchase/deposit and applicable terms are separate. Do not assume a mainland university card is a local student bus card.'],['Published complimentary hotel shuttle','Free on listed routes','Confirm service availability, access and boarding conditions directly with the operator.']],
    pitfalls:['Do not select Qingmao solely for a shorter queue: verify whether your documents are accepted.','A free shuttle that goes to the wrong district can add walking and another paid bus.'],
    prepare:['Documents valid for entry and your chosen port.','Bus payment method or sufficient cash.','Official shuttle page and a return transport backup.'],
    sources:['macaoports','qingmao','macaobus','galaxy','venetian','rail'],
  },
  {
    code:'GZ-HK-FERRY',cities:['Guangzhou','Hong Kong'],
    title:'Guangzhou–Hong Kong: Nansha City Ferry & Return Bundle',
    summary:'A ferry into Tsim Sha Tsui can reduce city transfers; check whether reaching Nansha makes it worthwhile.',
    keywords:'广州 南沙 客运港 香港 中港城 船票 来回 套票 珠江客运',
    fit:'Worth comparing for a traveller near Nansha or a destination around Hong Kong’s China Ferry Terminal. Travel from central Guangzhou to Nansha may offset the convenience or fare saving.',
    options:[['City route','Nansha Passenger Port (南沙客运港) ↔ Hong Kong China Ferry Terminal (中港城 / Tsim Sha Tsui). This is separate from Nansha’s Hong Kong airport route.'],['Round-trip comparison','The port currently publishes a CNY 320 ordinary-seat return bundle versus CNY 200 for a single journey. The published bundle is less than two CNY 200 singles, but confirm that your return date/sailing qualifies.']],
    steps:['Open Nansha Passenger Port’s official site, choose the Hong Kong city route and follow its Online Ticketing link to Chu Kong Passenger Transport.','Search the date and exact terminal pair. Compare ordinary single tickets with the return bundle and check return validity, change/refund and unused-return conditions.','Enter passenger details matching the accepted travel document. Pay through the official booking flow and retain the collection/check-in instructions.','For the Nansha city route, the port asks passengers to arrive at least 40 minutes before sailing; the published gate closes 15 minutes before departure. Allow additional access and border time.','Check the current return sailing before fixing your sightseeing plan. Do not reuse airport-line procedures or fares for the city route.'],
    prices:[['Ordinary single, Nansha → Hong Kong city','CNY 200','Published from 2026-04-01; check your booking.'],['Ordinary return bundle','CNY 320 / HKD 370 as published','Prices are currency-specific offers, not an exchange-rate conversion. Confirm eligible sailings and conditions.']],
    pitfalls:['A return bundle is useful only if both directions fit your trip.','Do not include Nansha local access, Hong Kong local buses/MTR or optional charges in the quoted ferry fare.'],
    prepare:['Accepted travel documents and endorsements.','Both bundle directions/conditions or separate tickets.','Nansha access plan and terminal check-in deadline.'],
    sources:['nansha','cks','rail'],airportWarning:true,
  },
  {
    code:'HK-MO',cities:['Hong Kong','Macao'],
    title:'Hong Kong–Macao: Bridge Shuttle vs City Ferry',
    summary:'Compare a low bridge ticket price with the ferry’s city-terminal convenience.',
    keywords:'香港 澳门 港澳线 金巴 喷射飞航 上环 外港 氹仔 船票',
    fit:'The shuttle can reduce the crossing ticket cost, while a ferry may reduce port-access transfers. Compare your actual Hong Kong and Macao endpoints, the date and the return journey.',
    options:[['Bridge route','Travel to HZMB Hong Kong Port, take the Macao-bound shuttle and make a separate local connection from HZMB Macao Port. It does not go straight to a central hotel.'],['City ferry','Compare TurboJET’s Sheung Wan → Macao Outer Harbour or Taipa service, selecting the terminal nearest your destination. A ticket to Outer Harbour is not a ticket to Taipa.']],
    steps:['For the shuttle, use the official HZMB booking entrance or the port counter/machine and select the Hong Kong–Macao line in the correct direction.','For the ferry, use the official TurboJET booking entrance, select city terminals, date, sailing and cabin, and inspect the final payable total.','Check any online booking/collection fee, change/refund conditions and boarding deadline. Use the ticket’s collection method; a confirmation email alone is not assumed to be a boarding pass.','At Macao, compare a public bus or a published complimentary hotel shuttle for the final leg. Check the last return and the local connection to its departure terminal.'],
    prices:[['Bridge shuttle from Hong Kong, adult','HKD 65 day / HKD 70 night','Day 06:00–23:59; night 00:00–05:59. Port-access trips extra.'],['TurboJET standard city ferry, adult','HKD 194 weekday day / HKD 212 weekend or holiday day / HKD 242 night','Published effective 2026-04-25; night sailing from 18:30 under the operator notice. Verify your quote and any booking fee.']],
    pitfalls:['The lower crossing fare does not prove the lowest door-to-door cost.','For a Hong Kong–Macao–mainland itinerary, check every entry/re-entry requirement for your own documents.'],
    prepare:['Documents valid for every part of the itinerary.','Exact departure and arrival port plus return ticket.','Local access and baggage/check-in conditions.'],
    sources:['hkbridge','hzmbbook','turbo','turbobook','macaobus','venetian'],airportWarning:true,
  },
  {
    code:'SZ-MO',cities:['Shenzhen','Macao'],
    title:'Shenzhen–Macao: Compare the Shekou–Outer Harbour Ferry',
    summary:'A direct sea crossing may avoid a long detour; compare the ticket against the full land alternative.',
    keywords:'深圳 澳门 蛇口 外港 轮渡 船票 购票',
    fit:'A direct ferry can suit travellers starting near Shekou. It is a convenience option to price-check, rather than a guaranteed budget winner.',
    options:[['Published city route','TurboJET currently lists Shekou ↔ Macao Outer Harbour. Check the sailing date and exact terminal; do not silently substitute a Taipa or airport route.'],['Land alternative','Price-check a coach to Zhuhai followed by a suitable Macao land crossing. Add both the Zhuhai port access and Macao final leg, as well as road and border time.']],
    steps:['Use the Shekou official booking portal or the TurboJET official booking entrance to search the dated Shekou–Macao Outer Harbour journey.','Read the currency and final quote, cabin, refund/change terms, check-in deadline and passenger-document requirements. Check both directions before paying.','Follow the ticket’s collection and terminal instructions and carry the original accepted travel documents.','On arrival, check the Macao official bus information or a published hotel shuttle for the final connection. Reconfirm the return sailing and weather notices.'],
    prices:[['Shekou–Macao ferry','Live quote required','Counter currency and online quote currency can differ; check what is actually charged. No invented fixed student fare.']],
    pitfalls:['A ferry ticket does not replace border-entry permission.','Limited sailings and weather disruption can change the best choice.'],
    prepare:['Accepted original travel documents and any required endorsements.','Exact city terminal pair and both journey dates.','Local connection and service-cancellation backup.'],
    sources:['shekou','turbo','turbobook','macaobus'],airportWarning:true,
  },
].map(guide=>({...guide,guide_id:'G-TR-'+guide.code,city:'Greater Bay Area',category:'Intercity Travel',title_en:guide.title,audience_en:guide.summary,last_checked:'2026-11-15',search_terms:guide.keywords,bring_items_en:guide.prepare,status:'Official channel information checked; dated fares, seats and timetables must be reconfirmed.'}));

window.BAYGO_CONTENT.guides.push(...intercityGuides);

function guidesForCity(city) {
  return data.guides.filter(guide=>(guide.cities || [guide.city]).includes(city));
}
function intercityHub() {
  const guides=intercityGuides.filter(guide=>guide.cities.includes(state.city));
  show(`<section class="stack">${cityButton()}<h2>Intercity Travel & Tickets</h2><p>Coach mini-programs, ferries, bridge shuttles and practical last-mile options for ${esc(state.city)} trips.</p>
    <p class="meta">Compare total cost: access to the departure point + the main ticket + arrival transport + return journey. Different currencies are not interchangeable. References checked 2026-11-15; tickets are purchased from the operator.</p>
    <div class="card-list">${guides.map(guideCard).join('') || '<p>No guide is available for this city yet.</p>'}</div>${link('L01','All Life Guides')}</section>`);
}
function intercityGuideDetails(guide) {
  const sources=[...new Set([...guide.sources,...(guide.airportWarning ? ['hka'] : [])])];
  show(`<section class="stack"><p class="eyebrow">Intercity Travel · ${esc(guide.cities.join(' / '))}</p><h2 class="title">${esc(guide.title)}</h2>${para(guide.summary)}
    ${heading('When to Compare This Option',para(guide.fit))}
    ${heading('Routes and Channels',guide.options.map(([name,text])=>`<article class="card"><h3>${esc(name)}</h3>${para(text)}</article>`).join(''))}
    ${heading('How to Buy and Board',`<ol>${guide.steps.map(step=>`<li>${esc(step)}</li>`).join('')}</ol>`)}
    ${heading('Fare References and What Is Extra',`<div class="card-list">${guide.prices.map(([name,amount,terms])=>`<article class="card"><h3>${esc(name)}</h3><p><strong>${esc(amount)}</strong></p><p class="meta">${esc(terms)}</p></article>`).join('')}</div><p class="meta">Unless explicitly included, local access, final transport, luggage charges and booking fees are extra. Promotions and student discounts require their own eligibility checks; no live seat or fare availability is provided.</p>`)}
    ${heading('What to Prepare',preparationChecklist(guide,state.checklist[guide.guide_id] || {}))}
    ${heading('Before You Pay',`<ul>${guide.pitfalls.map(text=>`<li>${esc(text)}</li>`).join('')}</ul>`)}
    ${guide.airportWarning ? notice('City ferry ≠ airport transfer ferry','Hong Kong Airport SkyPier transfer services are for eligible connecting air passengers and have flight, baggage and transfer restrictions. Do not choose an airport sailing for an ordinary Hong Kong city visit. Check airport/operator notices for suspensions.') : ''}
    ${guide.cities.some(city=>['Hong Kong','Macao'].includes(city)) ? link('L02','Travel Permit & Endorsement Guide',{id:'G-ZH-002'},'outline') : ''}
    ${heading('Official Sources and Booking Entrances',`<p class="meta">Checked ${esc(guide.last_checked)}. Official pages and mini-programs may be in Chinese; a regular browser may not open a WeChat mini-program directly.</p><ul>${sources.map(id=>`<li>${external(travelSources[id].url,travelSources[id].name)}</li>`).join('')}</ul>`)}
    ${link('L03','More Intercity Guides',{},'outline')}${link('F01','Flag Outdated Information',{kind:'guide',id:guide.guide_id})}
    <p class="meta">BayGo is not the ticket seller. Feedback is saved on this device only. Content-maintenance role: BayGo content editor; the team must assign a named owner.</p></section>`,toolbar(saveButton('guide',guide.guide_id)));
}
