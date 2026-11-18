import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';
const source=await readFile(new URL('../route-client.js',import.meta.url),'utf8');
const sample={options:[{mode:'Walking',meters:550,seconds:450,fare:0,currency:'CNY'},{mode:'Public transport',meters:800,seconds:600,fare:2,currency:'CNY'}],recommended:'Walking',timestamp:100};
let active=0,maxActive=0,calls=0;
const sandbox={URL,URLSearchParams,AbortSignal,AbortController,DOMException,Date,Map,Promise,
 BAYGO_CONFIG:{routeApiBase:'https://route.example.test/'},
 BAYGO_ROUTING_SNAPSHOT:{'a|b':sample},
 fetch:async(url,{signal})=>{
   calls++;active++;maxActive=Math.max(active,maxActive);
   try{await new Promise((resolve,reject)=>{const t=setTimeout(resolve,10);signal.addEventListener('abort',()=>{clearTimeout(t);reject(new DOMException('Aborted','AbortError'));},{once:true});});return {ok:true,json:async()=>sample};}finally{active--;}
 }};sandbox.window=sandbox;
vm.runInNewContext(source,sandbox);const routes=sandbox.BayGoRoutes;
const controller=new AbortController();
await routes.queue(Array.from({length:8},(_,i)=>i),i=>routes.get('a',String(i),controller.signal),controller.signal,3);
assert.equal(maxActive,3);assert.equal(calls,8);
await routes.get('a','0',controller.signal);assert.equal(calls,8);
await routes.get('0','a',controller.signal);assert.equal(calls,9);
await routes.get('a','0',controller.signal,true);assert.equal(calls,10);
const aborted=new AbortController();const task=routes.get('x','y',aborted.signal);aborted.abort();await assert.rejects(task,{name:'AbortError'});
sandbox.BAYGO_CONFIG.routeApiBase='';assert.equal((await routes.get('a','b',controller.signal)).recommended,'Walking');
assert.equal(await routes.get('a','unqueried',controller.signal),null);
assert.equal(routes.normalize({options:[],errors:null}).errors.length,0);
console.log('PASS: concurrency limit, directed cache reuse, refresh, cancellation, saved fallback and missing routes.');
