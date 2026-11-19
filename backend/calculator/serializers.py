from datetime import date as date_type
from rest_framework import serializers
from .models import Crop, IrrigationMethod, Calculation


class CropSerializer(serializers.ModelSerializer):
    class Meta:
        model = Crop
        fields = ("code", "name_en", "name_ta", "kc_ini", "kc_mid", "kc_end",
                  "days_initial", "days_dev", "days_mid", "days_late", "total_days")


class MethodSerializer(serializers.ModelSerializer):
    class Meta:
        model = IrrigationMethod
        fields = ("code", "name_en", "name_ta", "efficiency")


class CalculationInputSerializer(serializers.Serializer):
    crop = serializers.CharField()
    days_after_sowing = serializers.IntegerField(min_value=0)
    tmax = serializers.FloatField()
    tmin = serializers.FloatField()
    rain_mm = serializers.FloatField(min_value=0)
    latitude = serializers.FloatField()
    date = serializers.DateField()
    area = serializers.FloatField()
    area_unit = serializers.ChoiceField(choices=["acre", "hectare", "m2"])
    method = serializers.CharField()
    pump_lph = serializers.FloatField(required=False, allow_null=True, min_value=0.1)

    def validate_tmax(self, value):
        if not (-10 <= value <= 55):
            raise serializers.ValidationError("Temperature must be between -10 and 55 °C.")
        return value

    def validate_tmin(self, value):
        if not (-10 <= value <= 55):
            raise serializers.ValidationError("Temperature must be between -10 and 55 °C.")
        return value

    def validate_latitude(self, value):
        if not (-66 <= value <= 66):
            raise serializers.ValidationError("Latitude must be between -66 and 66 degrees.")
        return value

    def validate_area(self, value):
        if value <= 0:
            raise serializers.ValidationError("Area must be greater than 0.")
        return value

    def validate(self, data):
        tmax = data.get("tmax")
        tmin = data.get("tmin")
        if tmax is not None and tmin is not None and tmax <= tmin:
            raise serializers.ValidationError({"tmax": ["Tmax must be greater than Tmin."]})

        crop_code = data.get("crop")
        try:
            crop_obj = Crop.objects.get(code=crop_code, is_active=True)
            data["crop_obj"] = crop_obj
        except Crop.DoesNotExist:
            raise serializers.ValidationError({"crop": [f"Unknown or inactive crop: '{crop_code}'."]})

        days = data.get("days_after_sowing", 0)
        if "crop_obj" in data and days > data["crop_obj"].total_days:
            raise serializers.ValidationError({
                "days_after_sowing": [
                    f"Must be between 0 and {data['crop_obj'].total_days} for this crop."
                ]
            })

        method_code = data.get("method")
        try:
            method_obj = IrrigationMethod.objects.get(code=method_code, is_active=True)
            data["method_obj"] = method_obj
        except IrrigationMethod.DoesNotExist:
            raise serializers.ValidationError({"method": [f"Unknown or inactive method: '{method_code}'."]})

        return data


class CalculationResultSerializer(serializers.ModelSerializer):
    crop = CropSerializer(read_only=True)
    method = MethodSerializer(read_only=True)

    class Meta:
        model = Calculation
        fields = "__all__"


class HistoryListSerializer(serializers.ModelSerializer):
    crop = CropSerializer(read_only=True)
    method = MethodSerializer(read_only=True)

    class Meta:
        model = Calculation
        fields = ("id", "created_at", "crop", "method", "days_after_sowing", "stage",
                  "area", "area_unit", "et0", "etc", "gross_mm", "litres")
