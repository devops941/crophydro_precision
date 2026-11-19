from django.core.exceptions import ValidationError
from django.db import models
from django.conf import settings


class Crop(models.Model):
    code = models.SlugField(unique=True)
    name_en = models.CharField(max_length=100)
    name_ta = models.CharField(max_length=100)
    kc_ini = models.FloatField()
    kc_mid = models.FloatField()
    kc_end = models.FloatField()
    days_initial = models.PositiveIntegerField()
    days_dev = models.PositiveIntegerField()
    days_mid = models.PositiveIntegerField()
    days_late = models.PositiveIntegerField()
    total_days = models.PositiveIntegerField()
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["name_en"]

    def clean(self):
        stage_sum = self.days_initial + self.days_dev + self.days_mid + self.days_late
        if stage_sum != self.total_days:
            raise ValidationError(
                f"Stage days sum ({stage_sum}) must equal total_days ({self.total_days})."
            )
        for name, kc in [("kc_ini", self.kc_ini), ("kc_mid", self.kc_mid), ("kc_end", self.kc_end)]:
            if not (0.1 <= kc <= 1.5):
                raise ValidationError(f"{name} must be between 0.1 and 1.5, got {kc}.")
        for name, days in [
            ("days_initial", self.days_initial),
            ("days_dev", self.days_dev),
            ("days_mid", self.days_mid),
            ("days_late", self.days_late),
        ]:
            if days <= 0:
                raise ValidationError(f"{name} must be greater than 0.")

    def __str__(self):
        return f"{self.name_en} ({self.code})"


class IrrigationMethod(models.Model):
    code = models.SlugField(unique=True)
    name_en = models.CharField(max_length=100)
    name_ta = models.CharField(max_length=100)
    efficiency = models.FloatField()
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["name_en"]

    def clean(self):
        if not (0 < self.efficiency <= 1):
            raise ValidationError("Efficiency must be between 0 (exclusive) and 1 (inclusive).")

    def __str__(self):
        return f"{self.name_en} ({self.code})"


class Calculation(models.Model):
    AREA_UNITS = [("acre", "Acre"), ("hectare", "Hectare"), ("m2", "Square Metre")]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="calculations")
    created_at = models.DateTimeField(auto_now_add=True)

    # Inputs
    crop = models.ForeignKey(Crop, on_delete=models.PROTECT)
    days_after_sowing = models.PositiveIntegerField()
    tmax = models.FloatField()
    tmin = models.FloatField()
    rain_mm = models.FloatField()
    latitude = models.FloatField()
    date = models.DateField()
    area = models.FloatField()
    area_unit = models.CharField(max_length=10, choices=AREA_UNITS)
    method = models.ForeignKey(IrrigationMethod, on_delete=models.PROTECT)
    pump_lph = models.FloatField(null=True, blank=True)

    # Results
    day_of_year = models.IntegerField()
    ra_mj = models.FloatField()
    ra_mm = models.FloatField()
    et0 = models.FloatField()
    stage = models.CharField(max_length=20)
    kc = models.FloatField()
    etc = models.FloatField()
    effective_rain = models.FloatField()
    net_mm = models.FloatField()
    gross_mm = models.FloatField()
    area_m2 = models.FloatField()
    litres = models.BigIntegerField()
    m3 = models.FloatField()
    weekly_litres = models.BigIntegerField()
    pump_hours = models.FloatField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["user", "-created_at"])]

    def __str__(self):
        return f"{self.user} - {self.crop} - {self.created_at.date()}"
