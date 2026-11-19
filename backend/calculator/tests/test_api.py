from datetime import date, timedelta
from django.test import TestCase, override_settings
from django.core.cache import cache
from rest_framework.test import APIClient
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

from accounts.models import User
from calculator.models import Crop, IrrigationMethod, Calculation

NO_THROTTLE = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
    "DEFAULT_RENDERER_CLASSES": ["rest_framework.renderers.JSONRenderer"],
    "EXCEPTION_HANDLER": "config.exception_handler.custom_exception_handler",
    "DEFAULT_THROTTLE_CLASSES": [],
    "DEFAULT_THROTTLE_RATES": {},
}

MAIZE = dict(
    code="maize", name_en="Maize", name_ta="மக்காச்சோளம்",
    kc_ini=0.30, kc_mid=1.20, kc_end=0.60,
    days_initial=20, days_dev=35, days_mid=40, days_late=30, total_days=125,
)
DRIP = dict(code="drip", name_en="Drip", name_ta="சொட்டு நீர்", efficiency=0.90)
RICE = dict(
    code="rice", name_en="Rice", name_ta="நெல்",
    kc_ini=1.05, kc_mid=1.20, kc_end=0.90,
    days_initial=30, days_dev=30, days_mid=60, days_late=30, total_days=150,
)
SPRINKLER = dict(code="sprinkler", name_en="Sprinkler", name_ta="தெளிப்பு", efficiency=0.75)

VALID_PAYLOAD = {
    "crop": "maize",
    "days_after_sowing": 40,
    "tmax": 34,
    "tmin": 22,
    "rain_mm": 1,
    "latitude": 11.0,
    "date": "2026-11-19",
    "area": 1,
    "area_unit": "acre",
    "method": "drip",
    "pump_lph": 5000,
}


def make_user(email="farmer@example.com", password="FarmPass123!"):
    return User.objects.create_user(email=email, full_name="Test Farmer", password=password)


def auth_client(user):
    client = APIClient()
    refresh = RefreshToken.for_user(user)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {str(refresh.access_token)}")
    return client


@override_settings(REST_FRAMEWORK=NO_THROTTLE)
class CropsListTests(TestCase):
    def setUp(self):
        cache.clear()
        Crop.objects.create(**MAIZE)
        Crop.objects.create(**RICE)
        self.client = APIClient()

    def test_returns_active_crops(self):
        r = self.client.get("/api/crops/")
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertIn("crops", r.data)
        codes = [c["code"] for c in r.data["crops"]]
        self.assertIn("maize", codes)
        self.assertIn("rice", codes)

    def test_inactive_crop_excluded(self):
        Crop.objects.filter(code="rice").update(is_active=False)
        r = self.client.get("/api/crops/")
        codes = [c["code"] for c in r.data["crops"]]
        self.assertNotIn("rice", codes)
        self.assertIn("maize", codes)

    def test_no_auth_required(self):
        r = self.client.get("/api/crops/")
        self.assertEqual(r.status_code, status.HTTP_200_OK)

    def test_response_has_kc_fields(self):
        r = self.client.get("/api/crops/")
        crop = next(c for c in r.data["crops"] if c["code"] == "maize")
        for field in ("kc_ini", "kc_mid", "kc_end", "days_initial", "days_dev",
                      "days_mid", "days_late", "total_days", "name_ta"):
            self.assertIn(field, crop)


@override_settings(REST_FRAMEWORK=NO_THROTTLE)
class MethodsListTests(TestCase):
    def setUp(self):
        cache.clear()
        IrrigationMethod.objects.create(**DRIP)
        IrrigationMethod.objects.create(**SPRINKLER)
        self.client = APIClient()

    def test_returns_active_methods(self):
        r = self.client.get("/api/methods/")
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        codes = [m["code"] for m in r.data["methods"]]
        self.assertIn("drip", codes)
        self.assertIn("sprinkler", codes)

    def test_inactive_method_excluded(self):
        IrrigationMethod.objects.filter(code="sprinkler").update(is_active=False)
        r = self.client.get("/api/methods/")
        codes = [m["code"] for m in r.data["methods"]]
        self.assertNotIn("sprinkler", codes)

    def test_no_auth_required(self):
        r = self.client.get("/api/methods/")
        self.assertEqual(r.status_code, status.HTTP_200_OK)

    def test_response_has_efficiency(self):
        r = self.client.get("/api/methods/")
        method = next(m for m in r.data["methods"] if m["code"] == "drip")
        self.assertIn("efficiency", method)
        self.assertAlmostEqual(float(method["efficiency"]), 0.90)


@override_settings(REST_FRAMEWORK=NO_THROTTLE)
class CalculateTests(TestCase):
    def setUp(self):
        cache.clear()
        self.crop = Crop.objects.create(**MAIZE)
        self.method = IrrigationMethod.objects.create(**DRIP)
        self.user = make_user()
        self.client = auth_client(self.user)

    def test_reference_case(self):
        r = self.client.post("/api/calculate/", VALID_PAYLOAD, format="json")
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)
        res = r.data["result"]
        self.assertEqual(res["day_of_year"], 323)
        self.assertAlmostEqual(res["ra_mj"], 31.64, delta=0.05)
        self.assertAlmostEqual(res["ra_mm"], 12.91, delta=0.05)
        self.assertAlmostEqual(res["et0"], 4.71, delta=0.01)
        self.assertEqual(res["stage"], "development")
        self.assertAlmostEqual(res["kc"], 0.81, delta=0.01)
        self.assertAlmostEqual(res["etc"], 3.84, delta=0.01)
        self.assertAlmostEqual(res["net_mm"], 3.04, delta=0.01)
        self.assertAlmostEqual(res["gross_mm"], 3.37, delta=0.01)
        self.assertAlmostEqual(res["litres"], 13650, delta=50)
        self.assertAlmostEqual(res["pump_hours"], 2.73, delta=0.02)

    def test_response_structure(self):
        r = self.client.post("/api/calculate/", VALID_PAYLOAD, format="json")
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)
        for key in ("id", "created_at", "input", "crop", "method", "result",
                    "kc_curve", "stage_boundaries"):
            self.assertIn(key, r.data)

    def test_kc_curve_present(self):
        r = self.client.post("/api/calculate/", VALID_PAYLOAD, format="json")
        curve = r.data["kc_curve"]
        self.assertEqual(len(curve), self.crop.total_days + 1)
        self.assertEqual(curve[0]["day"], 0)
        self.assertEqual(curve[-1]["day"], self.crop.total_days)

    def test_stage_boundaries_present(self):
        r = self.client.post("/api/calculate/", VALID_PAYLOAD, format="json")
        b = r.data["stage_boundaries"]
        self.assertEqual(b["initial_end"], 20)
        self.assertEqual(b["dev_end"], 55)
        self.assertEqual(b["mid_end"], 95)
        self.assertEqual(b["late_end"], 125)

    def test_no_pump_lph(self):
        payload = {**VALID_PAYLOAD, "pump_lph": None}
        r = self.client.post("/api/calculate/", payload, format="json")
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)
        self.assertIsNone(r.data["result"]["pump_hours"])

    def test_saves_to_history(self):
        self.client.post("/api/calculate/", VALID_PAYLOAD, format="json")
        self.assertEqual(Calculation.objects.filter(user=self.user).count(), 1)

    def test_requires_auth_401(self):
        r = APIClient().post("/api/calculate/", VALID_PAYLOAD, format="json")
        self.assertEqual(r.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_input_echoed_in_response(self):
        r = self.client.post("/api/calculate/", VALID_PAYLOAD, format="json")
        inp = r.data["input"]
        self.assertEqual(inp["crop"], "maize")
        self.assertEqual(inp["days_after_sowing"], 40)
        self.assertEqual(inp["area_unit"], "acre")

    # --- Validation errors ---

    def test_unknown_crop_400(self):
        payload = {**VALID_PAYLOAD, "crop": "unknown_crop"}
        r = self.client.post("/api/calculate/", payload, format="json")
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("crop", r.data.get("details", {}))

    def test_unknown_method_400(self):
        payload = {**VALID_PAYLOAD, "method": "unknown_method"}
        r = self.client.post("/api/calculate/", payload, format="json")
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("method", r.data.get("details", {}))

    def test_tmax_lte_tmin_400(self):
        payload = {**VALID_PAYLOAD, "tmax": 22, "tmin": 22}
        r = self.client.post("/api/calculate/", payload, format="json")
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_tmax_lt_tmin_400(self):
        payload = {**VALID_PAYLOAD, "tmax": 20, "tmin": 25}
        r = self.client.post("/api/calculate/", payload, format="json")
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_temperature_out_of_range_400(self):
        payload = {**VALID_PAYLOAD, "tmax": 60}
        r = self.client.post("/api/calculate/", payload, format="json")
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("tmax", r.data.get("details", {}))

    def test_negative_rain_400(self):
        payload = {**VALID_PAYLOAD, "rain_mm": -1}
        r = self.client.post("/api/calculate/", payload, format="json")
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_latitude_out_of_range_400(self):
        payload = {**VALID_PAYLOAD, "latitude": 70}
        r = self.client.post("/api/calculate/", payload, format="json")
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("latitude", r.data.get("details", {}))

    def test_zero_area_400(self):
        payload = {**VALID_PAYLOAD, "area": 0}
        r = self.client.post("/api/calculate/", payload, format="json")
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("area", r.data.get("details", {}))

    def test_negative_area_400(self):
        payload = {**VALID_PAYLOAD, "area": -1}
        r = self.client.post("/api/calculate/", payload, format="json")
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_days_exceeds_total_400(self):
        payload = {**VALID_PAYLOAD, "days_after_sowing": 200}
        r = self.client.post("/api/calculate/", payload, format="json")
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("days_after_sowing", r.data.get("details", {}))

    def test_invalid_date_400(self):
        payload = {**VALID_PAYLOAD, "date": "not-a-date"}
        r = self.client.post("/api/calculate/", payload, format="json")
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_invalid_area_unit_400(self):
        payload = {**VALID_PAYLOAD, "area_unit": "bigha"}
        r = self.client.post("/api/calculate/", payload, format="json")
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_hectare_unit(self):
        payload = {**VALID_PAYLOAD, "area_unit": "hectare"}
        r = self.client.post("/api/calculate/", payload, format="json")
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)
        self.assertAlmostEqual(r.data["result"]["area_m2"], 10000.0, delta=1)

    def test_m2_unit(self):
        # 4046.86 m² == 1 acre, so litres should match the 1-acre reference case
        payload = {**VALID_PAYLOAD, "area": 4046.86, "area_unit": "m2"}
        r = self.client.post("/api/calculate/", payload, format="json")
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)
        self.assertAlmostEqual(r.data["result"]["litres"], 13650, delta=200)


@override_settings(REST_FRAMEWORK=NO_THROTTLE)
class HistoryListTests(TestCase):
    def setUp(self):
        cache.clear()
        self.crop = Crop.objects.create(**MAIZE)
        self.method = IrrigationMethod.objects.create(**DRIP)
        self.user = make_user()
        self.other_user = make_user("other@example.com")
        self.client = auth_client(self.user)

    def _post_calc(self, client=None):
        c = client or self.client
        return c.post("/api/calculate/", VALID_PAYLOAD, format="json")

    def test_empty_history(self):
        r = self.client.get("/api/history/")
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertEqual(r.data["count"], 0)
        self.assertEqual(r.data["results"], [])

    def test_own_calculations_returned(self):
        self._post_calc()
        self._post_calc()
        r = self.client.get("/api/history/")
        self.assertEqual(r.data["count"], 2)

    def test_other_user_calculations_not_returned(self):
        other_client = auth_client(self.other_user)
        self._post_calc(other_client)
        r = self.client.get("/api/history/")
        self.assertEqual(r.data["count"], 0)

    def test_pagination_pages(self):
        for _ in range(12):
            self._post_calc()
        r = self.client.get("/api/history/?page=1")
        self.assertEqual(r.data["count"], 12)
        self.assertEqual(r.data["pages"], 2)
        self.assertEqual(len(r.data["results"]), 10)

    def test_second_page(self):
        for _ in range(12):
            self._post_calc()
        r = self.client.get("/api/history/?page=2")
        self.assertEqual(len(r.data["results"]), 2)

    def test_requires_auth_401(self):
        r = APIClient().get("/api/history/")
        self.assertEqual(r.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_result_has_expected_fields(self):
        self._post_calc()
        r = self.client.get("/api/history/")
        row = r.data["results"][0]
        for field in ("id", "created_at", "crop", "method", "days_after_sowing",
                      "stage", "area", "area_unit", "et0", "etc", "gross_mm", "litres"):
            self.assertIn(field, row)


@override_settings(REST_FRAMEWORK=NO_THROTTLE)
class HistoryDetailTests(TestCase):
    def setUp(self):
        cache.clear()
        self.crop = Crop.objects.create(**MAIZE)
        self.method = IrrigationMethod.objects.create(**DRIP)
        self.user = make_user()
        self.other_user = make_user("other@example.com")
        self.client = auth_client(self.user)
        r = self.client.post("/api/calculate/", VALID_PAYLOAD, format="json")
        self.calc_id = r.data["id"]

    def test_get_own_calculation(self):
        r = self.client.get(f"/api/history/{self.calc_id}/")
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        for key in ("id", "created_at", "input", "crop", "method", "result",
                    "kc_curve", "stage_boundaries"):
            self.assertIn(key, r.data)

    def test_get_other_user_calculation_404(self):
        other_client = auth_client(self.other_user)
        r = other_client.get(f"/api/history/{self.calc_id}/")
        self.assertEqual(r.status_code, status.HTTP_404_NOT_FOUND)

    def test_delete_own_calculation(self):
        r = self.client.delete(f"/api/history/{self.calc_id}/")
        self.assertEqual(r.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Calculation.objects.filter(pk=self.calc_id).exists())

    def test_delete_other_user_calculation_404(self):
        other_client = auth_client(self.other_user)
        r = other_client.delete(f"/api/history/{self.calc_id}/")
        self.assertEqual(r.status_code, status.HTTP_404_NOT_FOUND)
        self.assertTrue(Calculation.objects.filter(pk=self.calc_id).exists())

    def test_delete_nonexistent_404(self):
        r = self.client.delete("/api/history/99999/")
        self.assertEqual(r.status_code, status.HTTP_404_NOT_FOUND)

    def test_requires_auth_401(self):
        r = APIClient().get(f"/api/history/{self.calc_id}/")
        self.assertEqual(r.status_code, status.HTTP_401_UNAUTHORIZED)


@override_settings(REST_FRAMEWORK=NO_THROTTLE)
class HistorySummaryTests(TestCase):
    def setUp(self):
        cache.clear()
        self.crop = Crop.objects.create(**MAIZE)
        Crop.objects.create(**RICE)
        self.method = IrrigationMethod.objects.create(**DRIP)
        self.user = make_user()
        self.client = auth_client(self.user)

    def test_empty_summary(self):
        r = self.client.get("/api/history/summary/")
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertEqual(r.data["total_calculations"], 0)
        self.assertEqual(r.data["total_litres"], 0)
        self.assertIsNone(r.data["most_used_crop"])
        self.assertEqual(r.data["last_30_days"], [])

    def test_total_calculations(self):
        for _ in range(3):
            self.client.post("/api/calculate/", VALID_PAYLOAD, format="json")
        r = self.client.get("/api/history/summary/")
        self.assertEqual(r.data["total_calculations"], 3)

    def test_total_litres_sum(self):
        self.client.post("/api/calculate/", VALID_PAYLOAD, format="json")
        self.client.post("/api/calculate/", VALID_PAYLOAD, format="json")
        r = self.client.get("/api/history/summary/")
        expected = Calculation.objects.filter(user=self.user).values_list("litres", flat=True)
        self.assertEqual(r.data["total_litres"], sum(expected))

    def test_most_used_crop(self):
        self.client.post("/api/calculate/", VALID_PAYLOAD, format="json")
        self.client.post("/api/calculate/", VALID_PAYLOAD, format="json")
        rice_payload = {**VALID_PAYLOAD, "crop": "rice", "days_after_sowing": 30}
        self.client.post("/api/calculate/", rice_payload, format="json")
        r = self.client.get("/api/history/summary/")
        self.assertIsNotNone(r.data["most_used_crop"])
        self.assertEqual(r.data["most_used_crop"]["code"], "maize")

    def test_summary_only_own_data(self):
        other_user = make_user("other@example.com")
        other_client = auth_client(other_user)
        for _ in range(5):
            other_client.post("/api/calculate/", VALID_PAYLOAD, format="json")
        r = self.client.get("/api/history/summary/")
        self.assertEqual(r.data["total_calculations"], 0)

    def test_requires_auth_401(self):
        r = APIClient().get("/api/history/summary/")
        self.assertEqual(r.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_most_used_crop_has_fields(self):
        self.client.post("/api/calculate/", VALID_PAYLOAD, format="json")
        r = self.client.get("/api/history/summary/")
        crop = r.data["most_used_crop"]
        for field in ("code", "name_en", "name_ta"):
            self.assertIn(field, crop)


@override_settings(REST_FRAMEWORK=NO_THROTTLE)
class CORSTests(TestCase):
    def setUp(self):
        cache.clear()
        self.client = APIClient()

    def test_cors_header_on_crops(self):
        r = self.client.get(
            "/api/crops/",
            HTTP_ORIGIN="http://127.0.0.1:5500",
        )
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertIn("Access-Control-Allow-Origin", r)

    def test_preflight_on_calculate(self):
        r = self.client.options(
            "/api/calculate/",
            HTTP_ORIGIN="http://127.0.0.1:5500",
            HTTP_ACCESS_CONTROL_REQUEST_METHOD="POST",
            HTTP_ACCESS_CONTROL_REQUEST_HEADERS="Authorization,Content-Type",
        )
        self.assertIn(r.status_code, [200, 204])
        self.assertIn("Access-Control-Allow-Origin", r)
