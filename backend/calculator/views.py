from datetime import timedelta
from django.db.models import Count, Sum
from django.db.models.functions import TruncDate
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .engine import calculate, kc_curve
from .models import Calculation, Crop, IrrigationMethod
from .serializers import (
    CalculationInputSerializer,
    CropSerializer,
    HistoryListSerializer,
    MethodSerializer,
)


@api_view(["GET"])
@permission_classes([AllowAny])
def crops_list(request):
    crops = Crop.objects.filter(is_active=True)
    return Response({"crops": CropSerializer(crops, many=True).data})


@api_view(["GET"])
@permission_classes([AllowAny])
def methods_list(request):
    methods = IrrigationMethod.objects.filter(is_active=True)
    return Response({"methods": MethodSerializer(methods, many=True).data})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def calculate_view(request):
    serializer = CalculationInputSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(
            {"error": "Validation failed.", "details": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST,
        )

    data = serializer.validated_data
    crop_obj = data["crop_obj"]
    method_obj = data["method_obj"]

    result = calculate(
        crop=crop_obj,
        days_after_sowing=data["days_after_sowing"],
        tmax=data["tmax"],
        tmin=data["tmin"],
        rain_mm=data["rain_mm"],
        latitude=data["latitude"],
        calc_date=data["date"],
        area=data["area"],
        area_unit=data["area_unit"],
        efficiency=method_obj.efficiency,
        pump_lph=data.get("pump_lph"),
    )

    calc = Calculation.objects.create(
        user=request.user,
        crop=crop_obj,
        days_after_sowing=data["days_after_sowing"],
        tmax=data["tmax"],
        tmin=data["tmin"],
        rain_mm=data["rain_mm"],
        latitude=data["latitude"],
        date=data["date"],
        area=data["area"],
        area_unit=data["area_unit"],
        method=method_obj,
        pump_lph=data.get("pump_lph"),
        **result,
    )

    curve, boundaries = kc_curve(crop_obj)

    input_echo = {
        "crop": data["crop"],
        "days_after_sowing": data["days_after_sowing"],
        "tmax": data["tmax"],
        "tmin": data["tmin"],
        "rain_mm": data["rain_mm"],
        "latitude": data["latitude"],
        "date": str(data["date"]),
        "area": data["area"],
        "area_unit": data["area_unit"],
        "method": data["method"],
        "pump_lph": data.get("pump_lph"),
    }

    return Response(
        {
            "id": calc.id,
            "created_at": calc.created_at.isoformat(),
            "input": input_echo,
            "crop": CropSerializer(crop_obj).data,
            "method": MethodSerializer(method_obj).data,
            "result": result,
            "kc_curve": curve,
            "stage_boundaries": boundaries,
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def history_list(request):
    page = int(request.query_params.get("page", 1))
    page_size = 10
    qs = Calculation.objects.filter(user=request.user).select_related("crop", "method")
    total = qs.count()
    pages = max(1, (total + page_size - 1) // page_size)
    start = (page - 1) * page_size
    end = start + page_size
    results = HistoryListSerializer(qs[start:end], many=True).data
    return Response({"count": total, "page": page, "pages": pages, "results": results})


@api_view(["GET", "DELETE"])
@permission_classes([IsAuthenticated])
def history_detail(request, pk):
    try:
        calc = Calculation.objects.select_related("crop", "method").get(pk=pk, user=request.user)
    except Calculation.DoesNotExist:
        return Response({"error": "Not found."}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "DELETE":
        calc.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    curve, boundaries = kc_curve(calc.crop)
    result = {
        "day_of_year": calc.day_of_year,
        "ra_mj": calc.ra_mj,
        "ra_mm": calc.ra_mm,
        "et0": calc.et0,
        "stage": calc.stage,
        "kc": calc.kc,
        "etc": calc.etc,
        "effective_rain": calc.effective_rain,
        "net_mm": calc.net_mm,
        "gross_mm": calc.gross_mm,
        "area_m2": calc.area_m2,
        "litres": calc.litres,
        "m3": calc.m3,
        "weekly_litres": calc.weekly_litres,
        "pump_hours": calc.pump_hours,
    }
    input_echo = {
        "crop": calc.crop.code,
        "days_after_sowing": calc.days_after_sowing,
        "tmax": calc.tmax,
        "tmin": calc.tmin,
        "rain_mm": calc.rain_mm,
        "latitude": calc.latitude,
        "date": str(calc.date),
        "area": calc.area,
        "area_unit": calc.area_unit,
        "method": calc.method.code,
        "pump_lph": calc.pump_lph,
    }

    return Response({
        "id": calc.id,
        "created_at": calc.created_at.isoformat(),
        "input": input_echo,
        "crop": CropSerializer(calc.crop).data,
        "method": MethodSerializer(calc.method).data,
        "result": result,
        "kc_curve": curve,
        "stage_boundaries": boundaries,
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def history_summary(request):
    user = request.user
    qs = Calculation.objects.filter(user=user)
    total_calculations = qs.count()
    total_litres = qs.aggregate(total=Sum("litres"))["total"] or 0

    most_used_crop = None
    if total_calculations > 0:
        top = (
            qs.values("crop__code", "crop__name_en", "crop__name_ta")
            .annotate(cnt=Count("id"))
            .order_by("-cnt")
            .first()
        )
        if top:
            most_used_crop = {
                "code": top["crop__code"],
                "name_en": top["crop__name_en"],
                "name_ta": top["crop__name_ta"],
            }

    thirty_days_ago = timezone.now().date() - timedelta(days=30)
    last_30 = (
        qs.filter(date__gte=thirty_days_ago)
        .annotate(day=TruncDate("created_at"))
        .values("day")
        .annotate(litres_sum=Sum("litres"))
        .order_by("day")
    )
    last_30_days = [{"date": str(row["day"]), "litres": row["litres_sum"]} for row in last_30]

    return Response({
        "total_calculations": total_calculations,
        "total_litres": total_litres,
        "most_used_crop": most_used_crop,
        "last_30_days": last_30_days,
    })
