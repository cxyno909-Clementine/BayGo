"""One-session Amap refresh. Credential is read at a hidden prompt, never saved/logged."""
import concurrent.futures, datetime, getpass, json, pathlib, time, urllib.parse, urllib.request
ROOT = pathlib.Path(__file__).resolve().parents[1]
def js_array(name):
    s=(ROOT/name).read_text(); return json.JSONDecoder().raw_decode(s[s.index('['):])[0]
def query(key, path, params):
    params={**params,'key':key}
    try:
        with urllib.request.urlopen('https://restapi.amap.com'+path+'?'+urllib.parse.urlencode(params), timeout=12) as r: d=json.load(r)
        return d
    except Exception: return {'infocode':'NETWORK_ERROR'}
def main():
    key=getpass.getpass('Amap credential (hidden): ')
    test=query(key,'/v5/place/text',{'keywords':'珠海华发商都','region':'珠海','city_limit':'true','show_fields':'photos','page_size':5})
    print(json.dumps({'path':'/v5/place/text','code':test.get('infocode') }),flush=True)
    if test.get('infocode')!='10000':return
    places=js_array('places.js'); by={p['id']:p for p in places}
    campus={'id':'P-ZH-001','name':'BNBU','city':'Zhuhai','amapPoint':{'longitude':113.520652,'latitude':22.347526,'reference':False}}
    by[campus['id']]=campus
    audit=[]
    for ident,keyword in [('PL-ZH-012','珠海华发商都'),('PL-ZH-003','展记猪脚姜'),('PL-ZH-004','卷屋寿司'),('PL-ZH-013','珠海大剧院')]:
        d=query(key,'/v5/place/text',{'keywords':keyword,'region':'珠海','city_limit':'true','show_fields':'photos','page_size':5})
        audit.append({'placeId':ident,'path':'/v5/place/text','code':d.get('infocode'),'candidates':d.get('pois',[])})
        time.sleep(.3)
    (ROOT/'data/amap-poi-review-2026-11-18.json').write_text(json.dumps(audit,ensure_ascii=False,indent=2))
    pairs=set()
    zh=[p['id'] for p in places if p['city']=='Zhuhai']
    for ident in zh: pairs.update([(campus['id'],ident),(ident,campus['id'])])
    for a,b in zip(zh,zh[1:]):pairs.update([(a,b),(b,a)])
    for r in js_array('curated.js'):
        for a,b in zip(r['stops'],r['stops'][1:]):pairs.update([(a,b),(b,a)])
    cities={'Zhuhai':'440400','Guangzhou':'440100','Shenzhen':'440300','Hong Kong':'810000','Macao':'820000'}
    def point(p):
        q=p['amapPoint'];return f"{q.get('entranceLongitude') or q['longitude']},{q.get('entranceLatitude') or q['latitude']}"
    old_path=ROOT/'routing-snapshot.js'
    old_text=old_path.read_text() if old_path.exists() else ''
    old=json.loads(old_text[old_text.index('{'):].rstrip(';\n')) if old_text else {}
    def leg(pair):
        a,b=(by[i] for i in pair); previous=old.get('|'.join(pair),{})
        options=[o for o in previous.get('options',[]) if o['mode']!='Public transport' or previous.get('fareFieldVerified')]
        errors=[]
        for mode,suffix in [('Walking','walking'),('Public transport','transit/integrated'),('Driving / taxi','driving')]:
            if any(o['mode']==mode for o in options):continue
            path='/v5/direction/'+suffix;args={'origin':point(a),'destination':point(b),'show_fields':'cost'}
            if mode=='Public transport':args.update(city1=cities[a['city']],city2=cities[b['city']])
            d=query(key,path,args)
            if d.get('infocode')!='10000':errors.append({'path':path,'code':d.get('infocode','UNKNOWN')})
            else:
                for v in d.get('route',{}).get('transits' if mode=='Public transport' else 'paths',[]):
                    try:
                        seconds=float(v.get('cost',{}).get('duration',v.get('duration',0)));meters=float(v.get('distance',0))
                        if seconds<=0 or meters<0:continue
                        raw=v.get('cost',{}).get('transit_fee',v.get('cost',{}).get('transitfee',v.get('cost',{}).get('busprice',v.get('cost',{}).get('cost',v.get('cost') if not isinstance(v.get('cost'),dict) else None))))
                        fare=0 if mode=='Walking' else float(raw) if mode=='Public transport' and raw not in (None,'',[]) else None
                        lines=[line.get('name','') for s in v.get('segments',[]) for line in s.get('bus',{}).get('buslines',[])]
                        options.append({'mode':mode,'meters':meters,'seconds':seconds,'fare':fare,'currency':'CNY' if a['city'] in ('Zhuhai','Shenzhen','Guangzhou') else 'HKD' if a['city']=='Hong Kong' else 'MOP','lines':lines})
                        break
                    except (TypeError,ValueError):continue
            time.sleep(.4)
        chosen=next((o for o in options if o['mode']=='Walking' and o['seconds']<=1200),None) or next((o for o in options if o['mode']=='Public transport'),None) or (min(options,key=lambda o:o['seconds']) if options else None)
        return '|'.join(pair),{'from':a['id'],'to':b['id'],'options':options,'recommended':chosen['mode'] if chosen else None,'reason':'A walk of up to 20 minutes is preferred; otherwise public transport, then an available alternative. Not a cheapest or fastest guarantee.','errors':errors,'timestamp':time.time(),'source':'saved','fareFieldVerified':True,'reference':bool(a['amapPoint'].get('reference') or b['amapPoint'].get('reference'))}
    results=dict(old);valid=[p for p in sorted(pairs) if all(by[i].get('amapPoint') for i in p)]
    print(f'Querying {len(valid)} directed legs; credential stays in process memory.',flush=True)
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
        for number,(token,value) in enumerate(pool.map(leg,valid),1):
            results[token]=value
            if number%10==0:print(f'Completed {number}/{len(valid)} legs',flush=True)
            temporary=ROOT/'routing-snapshot.js.tmp'
            temporary.write_text('window.BAYGO_ROUTING_SNAPSHOT = '+json.dumps(results,ensure_ascii=False)+';\n')
            temporary.replace(ROOT/'routing-snapshot.js')
    print(json.dumps({'legs':len(results),'withOptions':sum(bool(v['options']) for v in results.values()),'errors':[{'path':e['path'],'code':e['code']} for v in results.values() for e in v['errors']][:20]}),flush=True)
if __name__=='__main__': main()
