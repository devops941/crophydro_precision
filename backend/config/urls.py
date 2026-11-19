from django.contrib import admin
from django.urls import path, include
from config.views import root_view, favicon_view

urlpatterns = [
    path("", root_view, name="root"),
    path("favicon.ico", favicon_view, name="favicon"),
    path("admin/", admin.site.urls),
    path("api/auth/", include("accounts.urls")),
    path("api/", include("calculator.urls")),
]
