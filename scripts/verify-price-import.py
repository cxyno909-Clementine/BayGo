"""Verify price evidence selection without any network requests or API credentials."""
import importlib.util
from pathlib import Path
import unittest

spec = importlib.util.spec_from_file_location('price_import', Path(__file__).with_name('update-price-references.py'))
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class PriceImportTests(unittest.TestCase):
    def setUp(self):
        self.place = {'id': 'TEST', 'category': 'Restaurants', 'currency': 'CNY',
                      'amapPoint': {'id': 'EXACT', 'reference': False}}

    def record(self, costs=('33',), poi_id='EXACT'):
        evidence = [('snapshot.json', {'id': poi_id, 'adcode': '440402',
                    'business': {'cost': cost}}) for cost in costs]
        return module.price_record(self.place, evidence, '2026-11-15')[0]

    def test_historical_date_is_unknown(self):
        record = self.record()
        self.assertEqual(record['amount'], 33)
        self.assertIsNone(record['sourceCheckedOn'])
        self.assertEqual(record['status'], 'historical_reference')

    def test_other_branch_is_rejected(self):
        self.assertIsNone(self.record(poi_id='OTHER'))

    def test_area_reference_is_rejected(self):
        self.place['amapPoint']['reference'] = True
        self.assertIsNone(self.record())

    def test_invalid_conflicting_or_missing_costs(self):
        for costs in [('0',), ('NaN',), ('Infinity',), ('-1',), ('',), ('33', '45')]:
            with self.subTest(costs=costs):
                self.assertIsNone(self.record(costs))

    def test_venue_average_is_not_admission(self):
        self.place['category'] = 'Music & Shows'
        self.assertIsNone(self.record())

    def test_currency_is_not_silently_converted(self):
        self.place['currency'] = 'HKD'
        self.assertIsNone(self.record())


if __name__ == '__main__':
    unittest.main()
