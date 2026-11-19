from django.contrib import admin
from .models import Crop, IrrigationMethod, Calculation


@admin.register(Crop)
class CropAdmin(admin.ModelAdmin):
    list_display = ("code", "name_en", "name_ta", "kc_ini", "kc_mid", "kc_end", "total_days", "is_active")
    list_filter = ("is_active",)
    search_fields = ("code", "name_en", "name_ta")
    list_editable = ("is_active",)


@admin.register(IrrigationMethod)
class IrrigationMethodAdmin(admin.ModelAdmin):
    list_display = ("code", "name_en", "name_ta", "efficiency", "is_active")
    list_filter = ("is_active",)
    search_fields = ("code", "name_en", "name_ta")
    list_editable = ("is_active",)


@admin.register(Calculation)
class CalculationAdmin(admin.ModelAdmin):
    list_display = ("user", "crop", "days_after_sowing", "stage", "etc", "litres", "created_at")
    list_filter = ("stage", "crop", "method")
    search_fields = ("user__email", "crop__name_en")
    readonly_fields = (
        "user", "crop", "method", "days_after_sowing", "tmax", "tmin", "rain_mm",
        "latitude", "date", "area", "area_unit", "pump_lph",
        "day_of_year", "ra_mj", "ra_mm", "et0", "stage", "kc", "etc",
        "effective_rain", "net_mm", "gross_mm", "area_m2", "litres", "m3",
        "weekly_litres", "pump_hours", "created_at",
    )

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False
