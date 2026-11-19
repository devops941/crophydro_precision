import math
from datetime import date as date_type

import numpy as np


def day_of_year(d: date_type) -> int:
    return d.timetuple().tm_yday


def _ra_raw(J: int, phi: float) -> tuple[float, float]:
    """Internal: unrounded Ra in MJ/m²/day and mm/day. phi in radians."""
    dr = 1 + 0.033 * math.cos(2 * math.pi * J / 365)
    delta = 0.409 * math.sin(2 * math.pi * J / 365 - 1.39)
    omega_s = math.acos(-math.tan(phi) * math.tan(delta))
    ra_mj = (
        (24 * 60 / math.pi)
        * 0.0820
        * dr
        * (
            omega_s * math.sin(phi) * math.sin(delta)
            + math.cos(phi) * math.cos(delta) * math.sin(omega_s)
        )
    )
    return ra_mj, 0.408 * ra_mj


def extraterrestrial_radiation(J: int, latitude_deg: float) -> tuple[float, float]:
    """Returns (Ra_mj, Ra_mm) using FAO-56 Eq. 21, rounded to 2 dp."""
    ra_mj, ra_mm = _ra_raw(J, math.radians(latitude_deg))
    return round(ra_mj, 2), round(ra_mm, 2)


def hargreaves_et0(ra_mm: float, tmax: float, tmin: float) -> float:
    """ET0 using Hargreaves-Samani equation."""
    tmean = (tmax + tmin) / 2
    et0 = 0.0023 * ra_mm * (tmean + 17.8) * math.sqrt(tmax - tmin)
    return round(et0, 2)


def kc_for_day(day: int, crop) -> tuple[float, str]:
    """
    Returns (Kc, stage_name) for a given day after sowing.
    crop: object with kc_ini, kc_mid, kc_end, days_initial, days_dev, days_mid, days_late.
    day: 0-based days after sowing.
    """
    d_ini = crop.days_initial
    d_dev = crop.days_dev
    d_mid = crop.days_mid

    end_ini = d_ini
    end_dev = d_ini + d_dev
    end_mid = d_ini + d_dev + d_mid

    if day <= end_ini:
        return round(crop.kc_ini, 4), "initial"
    elif day <= end_dev:
        t = (day - end_ini) / d_dev
        kc = crop.kc_ini + t * (crop.kc_mid - crop.kc_ini)
        return round(kc, 4), "development"
    elif day <= end_mid:
        return round(crop.kc_mid, 4), "mid"
    else:
        d_late = crop.days_late
        t = (day - end_mid) / d_late
        kc = crop.kc_mid + t * (crop.kc_end - crop.kc_mid)
        return round(kc, 4), "late"


def kc_curve(crop) -> tuple[list[dict], dict]:
    """
    Returns (curve, stage_boundaries) for the whole season.
    curve: list of {"day": int, "kc": float}
    stage_boundaries: {"initial_end": int, "dev_end": int, "mid_end": int, "late_end": int}
    """
    total = crop.total_days
    days = np.arange(0, total + 1)
    curve = []
    for d in days:
        kc, _ = kc_for_day(int(d), crop)
        curve.append({"day": int(d), "kc": round(float(kc), 4)})

    boundaries = {
        "initial_end": crop.days_initial,
        "dev_end": crop.days_initial + crop.days_dev,
        "mid_end": crop.days_initial + crop.days_dev + crop.days_mid,
        "late_end": crop.total_days,
    }
    return curve, boundaries


def calculate(
    crop,
    days_after_sowing: int,
    tmax: float,
    tmin: float,
    rain_mm: float,
    latitude: float,
    calc_date: date_type,
    area: float,
    area_unit: str,
    efficiency: float,
    pump_lph: float | None = None,
) -> dict:
    """
    Full FAO-56 calculation. Returns a dict of all result fields.
    """
    AREA_M2 = {"acre": 4046.86, "hectare": 10000.0, "m2": 1.0}
    area_m2 = area * AREA_M2[area_unit]

    J = day_of_year(calc_date)
    phi = math.radians(latitude)

    # Use unrounded intermediates throughout the cascade; round only in the output dict.
    ra_mj_raw, ra_mm_raw = _ra_raw(J, phi)
    tmean = (tmax + tmin) / 2
    et0_raw = 0.0023 * ra_mm_raw * (tmean + 17.8) * math.sqrt(tmax - tmin)

    kc_raw, stage = kc_for_day(days_after_sowing, crop)
    etc_raw = kc_raw * et0_raw
    eff_rain_raw = 0.8 * rain_mm
    net_raw = max(etc_raw - eff_rain_raw, 0)
    gross_raw = net_raw / efficiency if efficiency > 0 else 0.0
    litres_raw = gross_raw * area_m2
    pump_hours_raw = litres_raw / pump_lph if pump_lph else None

    litres = int(round(litres_raw))

    return {
        "day_of_year": J,
        "ra_mj": round(ra_mj_raw, 2),
        "ra_mm": round(ra_mm_raw, 2),
        "et0": round(et0_raw, 2),
        "stage": stage,
        "kc": round(kc_raw, 2),
        "etc": round(etc_raw, 2),
        "effective_rain": round(eff_rain_raw, 2),
        "net_mm": round(net_raw, 2),
        "gross_mm": round(gross_raw, 2),
        "area_m2": round(area_m2, 2),
        "litres": litres,
        "m3": round(litres_raw / 1000, 2),
        "weekly_litres": litres * 7,
        "pump_hours": round(pump_hours_raw, 2) if pump_hours_raw is not None else None,
    }
