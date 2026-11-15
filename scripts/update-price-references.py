"""Import matched historical food prices, or refresh them using an explicit API key.

The public output contains no API keys, raw requests, phone numbers or full POI responses.
Run without --live to use the project's supplied snapshots. API credentials are only
read when --live is explicitly requested and are never written to the website.
"""
import argparse
import datetime as dt
import getpass
import hashlib
import json
import math
import os
from pathlib import Path
import time
import urllib.parse
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
FOOD = {'Restaurants', 'Cafes & Desserts'}
DOCUMENTATION = 'https://lbs.amap.com/api/webservice/guide/api-advanced/newpoisearch'


def nested_pois(value):
    if isinstance(value, dict):
        if isinstance(value.get('id'), str) and isinstance(value.get('business'), dict):
            yield value
        for child in value.values():
            yield from nested_pois(child)
    elif isinstance(value, list):
        for child in value:
            yield from nested_pois(child)


def price_record(place, matches, reviewed_on, captured_on=None):
    point = place.get('amapPoint') or {}
    if place.get('category') not in FOOD or place.get('currency') != 'CNY':
        return None, 'not a mainland food-spend reference'
    if not point.get('id') or point.get('reference') is not False:
        return None, 'exact verified POI required'
    values = []
    for source, poi in matches:
        if poi.get('id') != point['id']:
            continue
        # A mainland price cannot be inferred from a Hong Kong or Macao POI.
        if not str(poi.get('adcode', '')).startswith('44'):
            continue
        try:
            amount = float(poi.get('business', {}).get('cost'))
        except (ValueError, TypeError):
            continue
        if math.isfinite(amount) and amount > 0:
            values.append((round(amount, 2), source, poi))
    if not values:
        return None, 'no positive average-spend value for the exact POI'
    if len({value[0] for value in values}) != 1:
        return None, 'conflicting values require manual review'
    amount, source, poi = values[0]
    return {
        'placeId': place['id'], 'kind': 'average_spend', 'amount': amount,
        'currency': 'CNY', 'unit': 'person', 'scope': 'Food and drink average spend',
        'conditions': 'Average spend is a planning reference, not a menu price, fixed package or minimum charge. Your order may cost more or less. Transport and shopping are excluded.',
        'sourceName': 'Amap place data' if captured_on else 'Amap supplied historical snapshot',
        'sourceUrl': place.get('mapUrl') or '', 'sourcePoiId': point['id'],
        'sourcePoiName': poi.get('name', ''), 'sourceCheckedOn': captured_on,
        'evidenceReviewedOn': reviewed_on,
        'sourceSnapshotFiles': sorted({value[1] for value in values}),
        'placeRecordCheckedOn': place.get('checked'),
        'status': 'queried_reference' if captured_on else 'historical_reference',
        'documentationUrl': DOCUMENTATION,
    }, None


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--snapshot-root', type=Path, default=ROOT.parent / 'BayGo 3' / 'prototype')
    parser.add_argument('--live', action='store_true', help='Query mainland food POIs with your own authorised Amap key.')
    args = parser.parse_args()
    today = dt.datetime.now(dt.timezone(dt.timedelta(hours=8))).date().isoformat()
    text = (ROOT / 'places.js').read_text()
    places = json.JSONDecoder().raw_decode(text[text.index('['):])[0]
    evidence = []
    hashes = {}
    if args.live:
        key = os.environ.get('AMAP_API_KEY') or getpass.getpass('Amap Web Service key (not saved): ')
        if not key.strip():
            raise SystemExit('No key supplied; no output changed.')
        eligible = [place for place in places if place.get('category') in FOOD and place.get('currency') == 'CNY' and place.get('amapPoint', {}).get('id') and place.get('amapPoint', {}).get('reference') is False]
        for place in eligible:
            query = urllib.parse.urlencode({'key': key.strip(), 'id': place['amapPoint']['id'], 'show_fields': 'business'})
            try:
                with urllib.request.urlopen('https://restapi.amap.com/v5/place/detail?' + query, timeout=15) as response:
                    payload = json.load(response)
            except Exception:
                raise SystemExit('Amap request failed. No output changed; credentials and request URL have not been logged.')
            if payload.get('infocode') != '10000':
                raise SystemExit('Amap did not authorise or complete the query. No output changed. Check account permissions and quota.')
            evidence.extend(('live-poi-query', poi) for poi in nested_pois(payload))
            time.sleep(0.4)
        if not evidence:
            raise SystemExit('No POI results returned; no output changed.')
    else:
        for name in ['amap-verified-results.json', 'amap-review-results.json']:
            file = args.snapshot_root / name
            if not file.is_file():
                raise SystemExit('Required snapshot missing: ' + name + '. No output changed.')
            raw = file.read_bytes()
            hashes[name] = hashlib.sha256(raw).hexdigest()
            evidence.extend((name, poi) for poi in nested_pois(json.loads(raw)))
    records = {}
    audit = []
    for place in places:
        record, reason = price_record(place, evidence, today, today if args.live else None)
        if record:
            records[place['id']] = record
        audit.append({'placeId': place['id'], 'name': place['name'], 'foodPriceImported': bool(record), 'reason': reason})
    official = json.loads((ROOT / 'data' / 'official-price-references.json').read_text())
    for record in official:
        if not any(place['id'] == record['placeId'] for place in places):
            raise SystemExit('Official reference has no matching place; no output changed.')
        records[record['placeId']] = record
    payload = {'generatedOn': today, 'records': records}
    (ROOT / 'prices.js').write_text('window.BAYGO_PRICE_REFERENCES = ' + json.dumps(payload, ensure_ascii=False, indent=2) + ';\n')
    report = {'reviewedOn': today, 'mode': 'live' if args.live else 'supplied_snapshots', 'placeCount': len(places), 'foodReferenceCount': len(records) - len(official), 'officialReferenceCount': len(official), 'sourceSha256': hashes, 'places': audit}
    (ROOT / 'docs' / 'PRICE_IMPORT_AUDIT.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    print('Price references generated:', len(records), 'of', len(places), 'places. Unknown prices remain unknown.')
    print('No credentials or raw contact details exported. Historical query dates are left unknown.')


if __name__ == '__main__':
    main()
