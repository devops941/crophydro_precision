# Crop Hydro-Precision — API Contract

## Overview
- Backend: `http://127.0.0.1:8000`, API base: `http://127.0.0.1:8000/api`
- Frontend: `http://127.0.0.1:5500`
- All bodies: JSON (`Content-Type: application/json`)
- All URLs end with `/`
- **Auth**: JWT (djangorestframework-simplejwt). Protected endpoints need `Authorization: Bearer <access>`
- Access token: 30 min | Refresh token: 7 days | Rotation + blacklist enabled

## Error Format
```json
{"error": "Human readable message", "details": {"field": ["msg"]}}
```
Status codes: 400 validation, 401 unauthenticated, 403 forbidden, 404 not found, 409 email exists

## Auth Endpoints

| Method | Path | Auth | Body | Success |
|--------|------|------|------|---------|
| POST | /api/auth/register/ | no | `{full_name, email, password, password2}` | 201 `{user, access, refresh}` |
| POST | /api/auth/login/ | no | `{email, password}` | 200 `{user, access, refresh}` |
| POST | /api/auth/refresh/ | no | `{refresh}` | 200 `{access, refresh}` |
| POST | /api/auth/logout/ | yes | `{refresh}` | 200 `{ok: true}` |
| GET | /api/auth/me/ | yes | — | 200 `{user}` |
| PATCH | /api/auth/me/ | yes | `{full_name}` | 200 `{user}` |
| POST | /api/auth/change-password/ | yes | `{old_password, new_password}` | 200 `{ok: true}` |

User object: `{"id": 1, "full_name": "Arun Kumar", "email": "arun@example.com", "date_joined": "2026-11-19T10:00:00Z"}`

## Reference Data (Public)

`GET /api/crops/` returns active crops with Kc values and stage days.
`GET /api/methods/` returns active irrigation methods with efficiency values.

## Calculate (Auth Required)

`POST /api/calculate/`

Request:
```json
{"crop": "maize", "days_after_sowing": 40, "tmax": 34, "tmin": 22, "rain_mm": 1,
 "latitude": 11.0, "date": "2026-11-19", "area": 1, "area_unit": "acre",
 "method": "drip", "pump_lph": 5000}
```

Response 201 includes input echo, crop/method details, results, Kc curve, and stage boundaries.

### Validation Rules (→ 400)
- Unknown crop or method code
- tmax ≤ tmin
- Temperatures outside −10…55 °C
- rain_mm < 0
- Latitude outside −66…66°
- area ≤ 0
- days_after_sowing < 0 or > crop total_days
- Invalid date format

## History (Auth Required)

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/history/?page=1 | Paginated list (10/page, newest first) |
| GET | /api/history/<id>/ | Full calculation detail |
| DELETE | /api/history/<id>/ | Delete (404 if not owned) |
| GET | /api/history/summary/ | Totals + last 30 days chart data |

## Reference Test Case

maize, day 40, Tmax 34°C, Tmin 22°C, rain 1mm, lat 11.0°, 2026-11-19, 1 acre, drip, pump 5000 L/h
→ J=323, Ra=31.64 MJ, Ra_mm=12.91, ET₀=4.71, stage=development, Kc=0.81, ETc=3.84, net=3.04, gross=3.37, ≈13650 L, pump=2.73 h
