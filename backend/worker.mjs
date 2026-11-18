import points from './points.json' with { type: 'json' };
const allowedOrigins = new Set(['https://cxyno909-clementine.github.io','https://baygo-student-travel.annualacorn5.chatgpt.site','http://127.0.0.1:8765','http://localhost:8765']);
const cities = { Zhuhai:'440400', Guangzhou:'440100', Shenzhen:'440300', 'Hong Kong':'810000', Macao:'820000' };
const pending = new Map(), limits = new Map(), routeCache = new Map();
function number(v) { return v !== '' && v !== null && v !== undefined && Number.isFinite(Number(v)) ? Number(v) : null; }
function coord(p) { const q=p.amapPoint; return `${q.entranceLongitude || q.longitude},${q.entranceLatitude || q.latitude}`; }
function headers(origin) { return { 'Content-Type':'application/json; charset=utf-8', ...(allowedOrigins.has(origin)?{'Access-Control-Allow-Origin':origin,'Vary':'Origin'}:{}), 'Cache-Control':'no-store', 'X-Content-Type-Options':'nosniff' }; }
async function route(a,b,env) {
  const errors=[], options=[];
  for(const [mode,suffix] of [['Walking','walking'],['Public transport','transit/integrated'],['Driving / taxi','driving']]) {
    const path='/v5/direction/'+suffix;
    const params = new URLSearchParams({ key:env.AMAP_API_KEY, origin:coord(a), destination:coord(b), show_fields:'cost' });
    if(mode==='Public transport'){params.set('city1',cities[a.city]);params.set('city2',cities[b.city]);}
    try {
      const response=await fetch('https://restapi.amap.com'+path+'?'+params,{signal:AbortSignal.timeout(4500)});
      if(!response.ok){errors.push({path,code:'UPSTREAM_HTTP_ERROR'});continue;}
      const data=await response.json();
      if(data.infocode!=='10000'){errors.push({path,code:String(data.infocode || 'UNKNOWN')});continue;}
      const variants=data.route?.[mode==='Public transport'?'transits':'paths'] || [];
      for(const v of variants){
        const meters=number(v.distance), seconds=number(v.cost?.duration ?? v.duration);
        if(meters===null || meters<0 || seconds===null || seconds<=0)continue;
        const fare=mode==='Walking'?0:mode==='Public transport'?number(v.cost?.transit_fee ?? v.cost?.transitfee ?? v.cost?.busprice ?? v.cost?.cost):null;
        const lines=(v.segments || []).flatMap(s=>(s.bus?.buslines || []).map(l=>l.name).filter(Boolean));
        options.push({mode,meters,seconds,fare,currency:a.city==='Hong Kong'?'HKD':a.city==='Macao'?'MOP':'CNY',lines});break;
      }
    } catch {errors.push({path,code:'UPSTREAM_UNAVAILABLE'});}
  }
  const chosen=options.find(o=>o.mode==='Walking'&&o.seconds<=1200)||options.find(o=>o.mode==='Public transport')||options.reduce((a,b)=>!a || b.seconds<a.seconds?b:a,null);
  return { from:a.id,to:b.id,options,recommended:chosen?.mode || null,errors,timestamp:Date.now()/1000,reference:!!(a.amapPoint.reference||b.amapPoint.reference),reason:'Prefer walking up to 20 minutes; otherwise public transport when returned. Not a cheapest or fastest guarantee.' };
}
export default {
  async fetch(request,env,ctx) {
    const origin=request.headers.get('Origin'), h=headers(origin), reply=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:h});
    if(origin && !allowedOrigins.has(origin))return reply({error:'ORIGIN_NOT_ALLOWED'},403);
    if(request.method==='OPTIONS')return new Response(null,{status:204,headers:{...h,'Access-Control-Allow-Methods':'GET, OPTIONS'}});
    if(request.method!=='GET')return reply({error:'METHOD_NOT_ALLOWED'},405);
    const url=new URL(request.url);
    if(url.pathname==='/health')return reply({status:env.AMAP_API_KEY?'configured':'missing-secret'});
    if(url.pathname!=='/api/leg')return reply({error:'NOT_FOUND'},404);
    const a=points[url.searchParams.get('from')],b=points[url.searchParams.get('to')];
    if(!a||!b||a.city!==b.city||!a.amapPoint||!b.amapPoint)return reply({error:'INVALID_OR_CROSS_CITY_PAIR'},400);
    const ip=request.headers.get('CF-Connecting-IP') || 'unknown', bucket=Math.floor(Date.now()/60000), token=ip+':'+bucket;
    limits.set(token,(limits.get(token)||0)+1);
    for(const k of limits.keys())if(!k.endsWith(':'+bucket))limits.delete(k);
    if(limits.get(token)>30)return reply({error:'RATE_LIMIT'},429);
    if(!env.AMAP_API_KEY)return reply({error:'MISSING_SERVER_SECRET'},503);
    const cacheKey=new Request(new URL(`/cached/${a.id}/${b.id}`,url.origin));
    const hit=routeCache.get(cacheKey.url);if(hit && Date.now()-hit.at<900000)return reply(hit.value);
    const pair=a.id+'|'+b.id;
    if(!pending.has(pair))pending.set(pair,route(a,b,env).finally(()=>pending.delete(pair)));
    const result=await pending.get(pair);
    if(result.options.length){if(routeCache.size>500)routeCache.clear();routeCache.set(cacheKey.url,{at:Date.now(),value:result});}
    return reply(result);
  }
};
