# Crop Hydro-Precision
## Crop Water Demand & Irrigation Requirement Calculator

A professional, production-quality web application designed for farmers and students in Tamil Nadu, India, to calculate daily crop water demand ($ET_c$) and net/gross irrigation requirements in millimeters, litres, cubic meters, and pump operating hours using FAO-56 scientific methodologies.

---

## Architecture Diagram

```
crop-hydro-precision/
├── backend/                       # Django REST API (port 8000)
│   ├── manage.py
│   ├── requirements.txt
│   ├── .env.example
│   ├── config/                    # settings.py, urls.py, wsgi.py, exception_handler.py
│   ├── accounts/                  # Custom User (email login), JWT auth, profile
│   ├── calculator/                # Crop, IrrigationMethod, Calculation models, pure FAO-56 engine
│   └── data/                      # crop_kc.csv, irrigation_methods.csv
│
└── frontend/                      # Static Web Client (port 5500)
    ├── index.html                 # Public landing page with live crops strip
    ├── login.html                 # User authentication
    ├── register.html              # Account registration
    ├── dashboard.html             # Protected calculator & visualizations
    ├── history.html               # Protected calculation history & 30-day trend
    ├── profile.html               # Protected user profile & password management
    ├── about.html                 # Scientific methodology & FAO-56 citations
    ├── 404.html                   # Custom error page
    ├── assets/                    # Inline SVG brand logos & graphics
    ├── css/                       # Design tokens, base reset, components, page layouts
    └── js/                        # config.js, api.js, auth.js, i18n.js, ui.js, controllers
```

The backend and frontend communicate **exclusively** via the JSON REST API defined in [`docs/API_CONTRACT.md`](docs/API_CONTRACT.md). The backend never renders user-facing HTML (only Django Admin), and the frontend never touches the database directly.

---

## Core Features

- **FAO-56 Scientific Engine**: Pure mathematical functions computing extraterrestrial solar radiation ($R_a$, Eq. 21) and Hargreaves-Samani reference evapotranspiration ($ET_0$).
- **Dynamic Crop Coefficient ($K_c$) Curves**: Continuous 4-stage piecewise growth interpolation (Initial, Development, Mid-Season, Late Season).
- **Water Balance & Volume Conversion**: Computes net depth, gross irrigation depth, total daily litres, cubic meters ($m^3$), weekly litres, and pump operating hours.
- **Interactive Visualizations**:
  - Animated SVG water tank filling in proportion to daily water volume.
  - Collapsible step-by-step mathematical proof substituting user numbers into formulas.
  - Chart.js seasonal $K_c$ curve highlighting the current day after sowing.
  - Chart.js water conservation comparison (Drip vs. Sprinkler vs. Surface Flood).
- **History & Analytics**: Paginated history table, 30-day water consumption trend chart, detailed calculation view modals, and deletion with confirmation.
- **Bilingual Interface**: Seamless switching between English and Tamil (தமிழ்) with persistent state and Indian numbering format (`en-IN`).
- **Dark & Light Mode**: Accessible theme switcher with automatic system preference detection.

---

## Setup & Running Locally

### 1. Backend Setup (Port 8000)

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install pinned dependencies
pip install -r requirements.txt

# Configure environment
copy .env.example .env     # Windows
# cp .env.example .env     # Mac/Linux

# Apply migrations & seed initial crops and methods
python manage.py migrate
python manage.py import_crops
python manage.py create_demo_farmer

# Default Demo Farmer Account:
# Email:    arun@example.com
# Password: Farmer@2026

# Create an administrator account (optional, for /admin access)
python manage.py createsuperuser

# Start the Django development server
python manage.py runserver 8000
```
Backend API will be active at: `http://127.0.0.1:8000/`  
Django Admin available at: `http://127.0.0.1:8000/admin/`

### 2. Frontend Setup (Port 5500)

In a separate terminal window:
```bash
cd frontend

# Start lightweight static server
python -m http.server 5500
```
Open your browser to: **`http://127.0.0.1:5500/`**

---

## Running the Automated Test Suite

Run all 109 automated unit and API integration tests:

```bash
cd backend
python manage.py test accounts calculator.tests
```

### Reference Benchmark Test Case (Maize)
The backend engine and frontend calculator match the FAO-56 benchmark verification case:
- **Inputs**: Maize, Day 40, $T_{max} = 34^\circ\text{C}$, $T_{min} = 22^\circ\text{C}$, $\text{Rain} = 1\text{ mm}$, $\text{Latitude} = 11.0^\circ\text{N}$, $\text{Date} = 2026-11-19$, Area = 1 acre, Method = Drip (90%), Pump = 5,000 L/h.
- **Expected Outputs**:
  - $J = 323$
  - $R_a = 31.64\text{ MJ/m}^2/\text{day}$, $R_a(\text{mm}) = 12.91\text{ mm/day}$
  - $ET_0 = 4.71\text{ mm/day}$
  - Growth Stage = `development`, $K_c = 0.81$
  - $ET_c = 3.84\text{ mm/day}$
  - $\text{Effective Rain} = 0.80\text{ mm}$
  - $\text{Net Irrigation} = 3.04\text{ mm}$
  - $\text{Gross Irrigation} = 3.37\text{ mm}$
  - $\text{Daily Volume} \approx 13,650\text{ Litres}$ ($13.65\text{ m}^3$)
  - $\text{Weekly Volume} \approx 95,550\text{ Litres}$
  - $\text{Pump Operating Time} \approx 2.73\text{ hours}$

---

## Adding a New Crop via Admin

No code changes are required to add new crops:
1. Log in to `http://127.0.0.1:8000/admin/` using your superuser credentials.
2. Under **Calculator**, select **Crops** and click **Add Crop**.
3. Enter the English Name, Tamil Name, slug Code, stage $K_c$ values ($K_{c,\text{ini}}$, $K_{c,\text{mid}}$, $K_{c,\text{end}}$), and stage day durations.
4. Ensure the stage days sum equals `total_days` and set `Is Active` to `True`.
5. The frontend calculator and landing page will immediately load and support the new crop automatically via `GET /api/crops/`.

---

## Common Troubleshooting & Solutions

- **CORS Error in Browser Console**: Ensure the backend is actively running at `http://127.0.0.1:8000/`. Verify that `CORS_ALLOWED_ORIGINS` in `backend/.env` includes `http://127.0.0.1:5500`.
- **401 Unauthorized / Token Expiry**: The frontend automatically calls `POST /api/auth/refresh/` once upon receiving a 401 and transparently retries. If the refresh token has expired (after 7 days), it will cleanly redirect to `login.html?next=...`.
- **Backend Not Reachable**: If `http.server` is active but the backend isn't, the app displays a friendly error banner: *"Server not reachable — is the backend running?"*.

---

## Production Deployment Guide

### Backend (Render / PythonAnywhere / AWS)
1. Set `DEBUG=False` in `.env`.
2. Generate a secure production `SECRET_KEY`.
3. Set `ALLOWED_HOSTS` to your production backend domain.
4. Set `CORS_ALLOWED_ORIGINS` to your production frontend URL (e.g. `https://your-app.netlify.app`).
5. Connect PostgreSQL by configuring `DATABASE_URL=postgres://user:password@host:5432/dbname`. The backend automatically detects the PostgreSQL URL and switches database engines.
6. Run `python manage.py collectstatic`.

### Frontend (Netlify / GitHub Pages / Cloudflare Pages)
1. Deploy the `frontend/` folder as a static site.
2. In `frontend/js/config.js`, update `API_BASE_URL` to your production backend domain (e.g. `https://api.yourdomain.com/api`).
3. No build steps (npm, webpack) are required.

---

## Scientific Formulations (FAO-56)

1. **Extraterrestrial Radiation ($R_a$)**:
   $$\delta = 0.409 \sin\left(\frac{2\pi J}{365} - 1.39\right), \quad \omega_s = \arccos(-\tan\phi \tan\delta)$$
   $$R_a = \frac{24 \times 60}{\pi} G_{sc} d_r [\omega_s \sin\phi \sin\delta + \cos\phi \cos\delta \sin\omega_s]$$
2. **Hargreaves-Samani Reference Evapotranspiration ($ET_0$)**:
   $$ET_0 = 0.0023 \times R_{a,\text{mm}} \times (T_{\text{mean}} + 17.8) \times \sqrt{T_{\text{max}} - T_{\text{min}}}$$
3. **Crop Water Demand ($ET_c$)**:
   $$ET_c = K_c \times ET_0$$
4. **Water Balance**:
   $$\text{Net} = \max(ET_c - 0.8 \times \text{Rain}, 0), \quad \text{Gross} = \frac{\text{Net}}{\text{Efficiency}}$$
5. **Volumetric Requirements**:
   $$\text{Litres} = \text{Gross (mm)} \times \text{Area } (m^2), \quad \text{Pump Hours} = \frac{\text{Litres}}{\text{Pump L/h}}$$

*Reference: Allen, R. G., Pereira, L. S., Raes, D., & Smith, M. (1998). Crop evapotranspiration: Guidelines for computing crop water requirements. FAO Irrigation and Drainage Paper No. 56, Rome, Italy.*
