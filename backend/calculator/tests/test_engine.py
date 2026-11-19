import math
from datetime import date
from django.test import TestCase
from calculator.engine import (
    day_of_year,
    extraterrestrial_radiation,
    hargreaves_et0,
    kc_for_day,
    kc_curve,
    calculate,
)
from calculator.models import Crop, IrrigationMethod


class MockCrop:
    """Lightweight stand-in for the ORM Crop object."""
    def __init__(self, kc_ini, kc_mid, kc_end, days_initial, days_dev, days_mid, days_late):
        self.kc_ini = kc_ini
        self.kc_mid = kc_mid
        self.kc_end = kc_end
        self.days_initial = days_initial
        self.days_dev = days_dev
        self.days_mid = days_mid
        self.days_late = days_late
        self.total_days = days_initial + days_dev + days_mid + days_late


MAIZE = MockCrop(0.30, 1.20, 0.60, 20, 35, 40, 30)


class TestDayOfYear(TestCase):
    def test_nov_19(self):
        self.assertEqual(day_of_year(date(2026, 11, 19)), 323)

    def test_jan_1(self):
        self.assertEqual(day_of_year(date(2026, 1, 1)), 1)


class TestExtraterrestrialRadiation(TestCase):
    def test_reference_case(self):
        ra_mj, ra_mm = extraterrestrial_radiation(323, 11.0)
        self.assertAlmostEqual(ra_mj, 31.64, delta=0.01)
        self.assertAlmostEqual(ra_mm, 12.91, delta=0.01)

    def test_equator(self):
        # Day 1 (perihelion) at equator gives maximum Ra > 35 MJ
        ra_mj_jan, _ = extraterrestrial_radiation(1, 0.0)
        self.assertGreater(ra_mj_jan, 35.0)
        # Day 172 (summer solstice) at equator ~33 MJ — sun is 23° off-zenith
        ra_mj_172, _ = extraterrestrial_radiation(172, 0.0)
        self.assertGreater(ra_mj_172, 25.0)
        self.assertLess(ra_mj_172, 40.0)

    def test_lat_13(self):
        ra_mj_11, _ = extraterrestrial_radiation(323, 11.0)
        ra_mj_13, _ = extraterrestrial_radiation(323, 13.0)
        # Both should be in a reasonable range
        self.assertGreater(ra_mj_11, 20.0)
        self.assertGreater(ra_mj_13, 20.0)


class TestET0(TestCase):
    def test_reference_case(self):
        et0 = hargreaves_et0(12.91, 34.0, 22.0)
        self.assertAlmostEqual(et0, 4.71, delta=0.01)

    def test_increases_with_temperature(self):
        et0_hot = hargreaves_et0(12.91, 40.0, 25.0)
        et0_cool = hargreaves_et0(12.91, 30.0, 18.0)
        self.assertGreater(et0_hot, et0_cool)


class TestKcForDay(TestCase):
    def test_initial_stage(self):
        kc, stage = kc_for_day(0, MAIZE)
        self.assertEqual(stage, "initial")
        self.assertAlmostEqual(kc, 0.30, places=2)

    def test_initial_end(self):
        kc, stage = kc_for_day(20, MAIZE)
        self.assertEqual(stage, "initial")

    def test_development_stage(self):
        kc, stage = kc_for_day(21, MAIZE)
        self.assertEqual(stage, "development")

    def test_development_end(self):
        kc, stage = kc_for_day(55, MAIZE)
        self.assertEqual(stage, "development")

    def test_mid_stage(self):
        kc, stage = kc_for_day(56, MAIZE)
        self.assertEqual(stage, "mid")
        self.assertAlmostEqual(kc, 1.20, places=2)

    def test_mid_end(self):
        kc, stage = kc_for_day(95, MAIZE)
        self.assertEqual(stage, "mid")

    def test_late_stage(self):
        kc, stage = kc_for_day(96, MAIZE)
        self.assertEqual(stage, "late")

    def test_reference_case_day_40(self):
        kc, stage = kc_for_day(40, MAIZE)
        self.assertEqual(stage, "development")
        self.assertAlmostEqual(kc, 0.81, delta=0.01)

    def test_net_never_negative(self):
        # With large rainfall, net should be 0 not negative
        from calculator.engine import calculate as calc_fn
        # Mock method
        class M:
            efficiency = 0.9
        # We'd need a real Crop with ORM - test with mock
        result = calculate(MAIZE, 40, 34, 22, 100.0, 11.0, date(2026, 11, 19), 1, "acre", 0.9)
        self.assertGreaterEqual(result["net_mm"], 0.0)


class TestCalculate(TestCase):
    def test_reference_case(self):
        result = calculate(
            crop=MAIZE,
            days_after_sowing=40,
            tmax=34.0,
            tmin=22.0,
            rain_mm=1.0,
            latitude=11.0,
            calc_date=date(2026, 11, 19),
            area=1.0,
            area_unit="acre",
            efficiency=0.9,
            pump_lph=5000.0,
        )
        self.assertEqual(result["day_of_year"], 323)
        self.assertAlmostEqual(result["ra_mj"], 31.64, delta=0.01)
        self.assertAlmostEqual(result["ra_mm"], 12.91, delta=0.01)
        self.assertAlmostEqual(result["et0"], 4.71, delta=0.01)
        self.assertEqual(result["stage"], "development")
        self.assertAlmostEqual(result["kc"], 0.81, delta=0.01)
        self.assertAlmostEqual(result["etc"], 3.84, delta=0.01)
        self.assertAlmostEqual(result["net_mm"], 3.04, delta=0.01)
        self.assertAlmostEqual(result["gross_mm"], 3.37, delta=0.01)
        self.assertAlmostEqual(result["litres"], 13650, delta=50)
        self.assertAlmostEqual(result["pump_hours"], 2.73, delta=0.01)

    def test_unit_conversions(self):
        result_acre = calculate(MAIZE, 40, 34, 22, 1, 11.0, date(2026, 11, 19), 1, "acre", 0.9)
        result_ha = calculate(MAIZE, 40, 34, 22, 1, 11.0, date(2026, 11, 19), 1, "hectare", 0.9)
        result_m2 = calculate(MAIZE, 40, 34, 22, 1, 11.0, date(2026, 11, 19), 4046.86, "m2", 0.9)
        # 1 acre ≈ 4046.86 m², so litres should be similar to m2 result
        self.assertAlmostEqual(result_acre["litres"], result_m2["litres"], delta=10)
        # Hectare is bigger, so more litres
        self.assertGreater(result_ha["litres"], result_acre["litres"])

    def test_no_pump_lph(self):
        result = calculate(MAIZE, 40, 34, 22, 1, 11.0, date(2026, 11, 19), 1, "acre", 0.9, pump_lph=None)
        self.assertIsNone(result["pump_hours"])

    def test_weekly_litres(self):
        result = calculate(MAIZE, 40, 34, 22, 1, 11.0, date(2026, 11, 19), 1, "acre", 0.9)
        self.assertEqual(result["weekly_litres"], result["litres"] * 7)
