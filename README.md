# Crop Hydro-Precision
## Crop Water Demand & Irrigation Requirement Calculator

A professional web application for farmers and students in Tamil Nadu, India to calculate crop water demand (ETc) and irrigation requirements using FAO-56 methods.

## Architecture

```
crop-hydro-precision/
├── backend/    → Django REST API  (port 8000)
└── frontend/   → Static HTML/CSS/JS site (port 5500)
```

They communicate only through the JSON API defined in `docs/API_CONTRACT.md`.

## Features
- FAO-56 Hargreaves ET₀ calculation
- Crop-coefficient (Kc) curve across growth stages
- Net & gross irrigation in mm, litres, m³, and pump hours
- Full calculation history with charts
- English / தமிழ் bilingual interface
- Dark mode

## Setup

### Backend
```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
copy .env.example .env     # Windows
cp .env.example .env       # Mac/Linux

python manage.py migrate
python manage.py import_crops
python manage.py createsuperuser
python manage.py runserver   # → http://127.0.0.1:8000
# Admin panel: http://127.0.0.1:8000/admin
```

### Frontend (new terminal)
```bash
cd frontend
python -m http.server 5500   # → http://127.0.0.1:5500
```

## Running Tests
```bash
cd backend
python manage.py test calculator.tests
```

## Adding a New Crop
1. Go to `http://127.0.0.1:8000/admin`
2. Navigate to **Crops** and click **Add Crop**
3. Fill in the Kc values and growth stage days
4. Set **Is Active** to true

## Common Errors
- **CORS error**: Make sure the backend is running on port 8000
- **401 Unauthorized**: Your access token expired — the frontend auto-refreshes, but check `API_BASE_URL` in `frontend/js/config.js`
- **Backend not running**: Start `python manage.py runserver` in the `backend/` folder

## Deployment
- **Backend**: Deploy to Render or PythonAnywhere; set `DEBUG=False`, update `ALLOWED_HOSTS` and `CORS_ALLOWED_ORIGINS` in `.env`, switch `DATABASE_URL` to PostgreSQL
- **Frontend**: Deploy to Netlify or GitHub Pages; update `API_BASE_URL` in `frontend/js/config.js`

## Formulas (FAO-56)
- **ET₀ (Hargreaves)**: `ET₀ = 0.0023 × Ra_mm × (Tmean + 17.8) × √(Tmax − Tmin)`
- **ETc**: `ETc = Kc × ET₀`
- **Net irrigation**: `Net = max(ETc − 0.8×Rain, 0)`
- **Gross irrigation**: `Gross = Net / Efficiency`
- **Volume**: `Litres = Gross_mm × Area_m²`

Reference: FAO Irrigation and Drainage Paper 56 (Allen et al., 1998)
