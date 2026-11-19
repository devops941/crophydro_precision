from django.test import TestCase, override_settings
from django.core.cache import cache
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

from accounts.models import User

# Disable throttling in all tests
NO_THROTTLE = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
    "DEFAULT_RENDERER_CLASSES": [
        "rest_framework.renderers.JSONRenderer",
    ],
    "EXCEPTION_HANDLER": "config.exception_handler.custom_exception_handler",
    "DEFAULT_THROTTLE_CLASSES": [],
    "DEFAULT_THROTTLE_RATES": {},
}


def make_user(email="test@example.com", full_name="Test User", password="TestPass123!"):
    return User.objects.create_user(email=email, full_name=full_name, password=password)


def get_tokens(user):
    refresh = RefreshToken.for_user(user)
    return str(refresh.access_token), str(refresh)


@override_settings(REST_FRAMEWORK=NO_THROTTLE)
class RegisterTests(TestCase):
    def setUp(self):
        cache.clear()
        self.client = APIClient()
        self.url = "/api/auth/register/"
        self.valid_data = {
            "full_name": "Arun Kumar",
            "email": "arun@example.com",
            "password": "SecurePass123!",
            "password2": "SecurePass123!",
        }

    def test_register_success(self):
        r = self.client.post(self.url, self.valid_data, format="json")
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)
        self.assertIn("user", r.data)
        self.assertIn("access", r.data)
        self.assertIn("refresh", r.data)
        self.assertEqual(r.data["user"]["email"], "arun@example.com")
        self.assertEqual(r.data["user"]["full_name"], "Arun Kumar")

    def test_email_stored_lowercase(self):
        data = {**self.valid_data, "email": "ARUN@EXAMPLE.COM"}
        r = self.client.post(self.url, data, format="json")
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)
        self.assertEqual(r.data["user"]["email"], "arun@example.com")
        self.assertTrue(User.objects.filter(email="arun@example.com").exists())

    def test_duplicate_email_409(self):
        self.client.post(self.url, self.valid_data, format="json")
        r = self.client.post(self.url, self.valid_data, format="json")
        self.assertEqual(r.status_code, status.HTTP_409_CONFLICT)
        self.assertIn("error", r.data)

    def test_duplicate_email_case_insensitive_409(self):
        self.client.post(self.url, self.valid_data, format="json")
        data = {**self.valid_data, "email": "ARUN@EXAMPLE.COM"}
        r = self.client.post(self.url, data, format="json")
        self.assertEqual(r.status_code, status.HTTP_409_CONFLICT)

    def test_passwords_mismatch_400(self):
        data = {**self.valid_data, "password2": "DifferentPass123!"}
        r = self.client.post(self.url, data, format="json")
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", r.data)

    def test_missing_full_name_400(self):
        data = {**self.valid_data}
        del data["full_name"]
        r = self.client.post(self.url, data, format="json")
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_invalid_email_400(self):
        data = {**self.valid_data, "email": "not-an-email"}
        r = self.client.post(self.url, data, format="json")
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_weak_password_400(self):
        data = {**self.valid_data, "password": "123", "password2": "123"}
        r = self.client.post(self.url, data, format="json")
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_response_has_user_fields(self):
        r = self.client.post(self.url, self.valid_data, format="json")
        user_data = r.data["user"]
        for field in ("id", "full_name", "email", "date_joined"):
            self.assertIn(field, user_data)


@override_settings(REST_FRAMEWORK=NO_THROTTLE)
class LoginTests(TestCase):
    def setUp(self):
        cache.clear()
        self.client = APIClient()
        self.url = "/api/auth/login/"
        self.user = make_user()

    def test_login_success(self):
        r = self.client.post(self.url, {"email": "test@example.com", "password": "TestPass123!"}, format="json")
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertIn("access", r.data)
        self.assertIn("refresh", r.data)
        self.assertIn("user", r.data)

    def test_login_case_insensitive_email(self):
        r = self.client.post(self.url, {"email": "TEST@EXAMPLE.COM", "password": "TestPass123!"}, format="json")
        self.assertEqual(r.status_code, status.HTTP_200_OK)

    def test_wrong_password_400(self):
        r = self.client.post(self.url, {"email": "test@example.com", "password": "WrongPass!"}, format="json")
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", r.data)

    def test_nonexistent_email_400(self):
        r = self.client.post(self.url, {"email": "nobody@example.com", "password": "TestPass123!"}, format="json")
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_missing_fields_400(self):
        r = self.client.post(self.url, {"email": "test@example.com"}, format="json")
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)


@override_settings(REST_FRAMEWORK=NO_THROTTLE)
class RefreshTests(TestCase):
    def setUp(self):
        cache.clear()
        self.client = APIClient()
        self.url = "/api/auth/refresh/"
        self.user = make_user()
        _, self.refresh_token = get_tokens(self.user)

    def test_refresh_success(self):
        r = self.client.post(self.url, {"refresh": self.refresh_token}, format="json")
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertIn("access", r.data)
        self.assertIn("refresh", r.data)

    def test_refresh_invalid_token_401(self):
        r = self.client.post(self.url, {"refresh": "invalid.token.here"}, format="json")
        self.assertEqual(r.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn("error", r.data)

    def test_refresh_missing_token_400(self):
        r = self.client.post(self.url, {}, format="json")
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_rotated_token_works(self):
        r1 = self.client.post(self.url, {"refresh": self.refresh_token}, format="json")
        self.assertEqual(r1.status_code, status.HTTP_200_OK)
        new_refresh = r1.data["refresh"]
        # New refresh token should work
        r2 = self.client.post(self.url, {"refresh": new_refresh}, format="json")
        self.assertEqual(r2.status_code, status.HTTP_200_OK)


@override_settings(REST_FRAMEWORK=NO_THROTTLE)
class LogoutTests(TestCase):
    def setUp(self):
        cache.clear()
        self.client = APIClient()
        self.url = "/api/auth/logout/"
        self.user = make_user()
        self.access, self.refresh = get_tokens(self.user)

    def test_logout_success(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.access}")
        r = self.client.post(self.url, {"refresh": self.refresh}, format="json")
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertEqual(r.data, {"ok": True})

    def test_logout_blacklists_token(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.access}")
        self.client.post(self.url, {"refresh": self.refresh}, format="json")
        # Using the blacklisted refresh token again should fail
        r = self.client.post("/api/auth/refresh/", {"refresh": self.refresh}, format="json")
        self.assertNotEqual(r.status_code, status.HTTP_200_OK)

    def test_logout_requires_auth_401(self):
        r = self.client.post(self.url, {"refresh": self.refresh}, format="json")
        self.assertEqual(r.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_logout_missing_refresh_400(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.access}")
        r = self.client.post(self.url, {}, format="json")
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)


@override_settings(REST_FRAMEWORK=NO_THROTTLE)
class MeTests(TestCase):
    def setUp(self):
        cache.clear()
        self.client = APIClient()
        self.url = "/api/auth/me/"
        self.user = make_user()
        self.access, _ = get_tokens(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.access}")

    def test_get_me_success(self):
        r = self.client.get(self.url)
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertIn("user", r.data)
        self.assertEqual(r.data["user"]["email"], "test@example.com")
        self.assertEqual(r.data["user"]["full_name"], "Test User")

    def test_get_me_requires_auth_401(self):
        self.client.credentials()
        r = self.client.get(self.url)
        self.assertEqual(r.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_patch_me_updates_name(self):
        r = self.client.patch(self.url, {"full_name": "Updated Name"}, format="json")
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertEqual(r.data["user"]["full_name"], "Updated Name")
        self.user.refresh_from_db()
        self.assertEqual(self.user.full_name, "Updated Name")

    def test_patch_me_requires_auth_401(self):
        self.client.credentials()
        r = self.client.patch(self.url, {"full_name": "X"}, format="json")
        self.assertEqual(r.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_me_response_has_all_fields(self):
        r = self.client.get(self.url)
        for field in ("id", "full_name", "email", "date_joined"):
            self.assertIn(field, r.data["user"])


@override_settings(REST_FRAMEWORK=NO_THROTTLE)
class ChangePasswordTests(TestCase):
    def setUp(self):
        cache.clear()
        self.client = APIClient()
        self.url = "/api/auth/change-password/"
        self.user = make_user()
        self.access, _ = get_tokens(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.access}")

    def test_change_password_success(self):
        r = self.client.post(
            self.url,
            {"old_password": "TestPass123!", "new_password": "NewSecurePass456!"},
            format="json",
        )
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertEqual(r.data, {"ok": True})
        # Verify new password works
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("NewSecurePass456!"))

    def test_wrong_old_password_400(self):
        r = self.client.post(
            self.url,
            {"old_password": "WrongOld!", "new_password": "NewSecurePass456!"},
            format="json",
        )
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", r.data)

    def test_weak_new_password_400(self):
        r = self.client.post(
            self.url,
            {"old_password": "TestPass123!", "new_password": "123"},
            format="json",
        )
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_requires_auth_401(self):
        self.client.credentials()
        r = self.client.post(
            self.url,
            {"old_password": "TestPass123!", "new_password": "NewPass456!"},
            format="json",
        )
        self.assertEqual(r.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_missing_fields_400(self):
        r = self.client.post(self.url, {"old_password": "TestPass123!"}, format="json")
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)


@override_settings(REST_FRAMEWORK=NO_THROTTLE)
class ProtectedEndpointTests(TestCase):
    """Verify that all protected endpoints reject unauthenticated requests."""

    def setUp(self):
        cache.clear()
        self.client = APIClient()

    def test_me_get_401(self):
        r = self.client.get("/api/auth/me/")
        self.assertEqual(r.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_me_patch_401(self):
        r = self.client.patch("/api/auth/me/", {"full_name": "X"}, format="json")
        self.assertEqual(r.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_logout_401(self):
        r = self.client.post("/api/auth/logout/", {"refresh": "token"}, format="json")
        self.assertEqual(r.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_change_password_401(self):
        r = self.client.post(
            "/api/auth/change-password/",
            {"old_password": "x", "new_password": "y"},
            format="json",
        )
        self.assertEqual(r.status_code, status.HTTP_401_UNAUTHORIZED)
