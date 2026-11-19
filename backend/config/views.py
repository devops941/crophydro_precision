from django.http import HttpResponse, JsonResponse
from django.views.decorators.http import require_GET


@require_GET
def root_view(request):
    """
    Intelligent root view for http://127.0.0.1:8000/
    - If JSON requested: returns API metadata.
    - If HTML requested by browser: provides a stylish Glassmorphic gateway
      with direct link to frontend on port 5500, admin panel, and API endpoints.
    """
    accept = request.headers.get("Accept", "")
    if "application/json" in accept and "text/html" not in accept:
        return JsonResponse({
            "project": "Crop Hydro-Precision API",
            "status": "online",
            "version": "1.0.0",
            "standard": "FAO-56 Irrigation & Drainage Paper",
            "frontend_url": "http://127.0.0.1:5500/",
            "admin_url": "/admin/",
            "endpoints": {
                "auth": {
                    "register": "/api/auth/register/",
                    "login": "/api/auth/login/",
                    "refresh": "/api/auth/refresh/",
                    "logout": "/api/auth/logout/",
                    "me": "/api/auth/me/",
                    "change_password": "/api/auth/change-password/",
                },
                "calculator": {
                    "crops": "/api/crops/",
                    "methods": "/api/methods/",
                    "calculate": "/api/calculate/",
                    "history": "/api/history/",
                    "summary": "/api/history/summary/",
                },
            },
        })

    html_content = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Crop Hydro-Precision — Backend API Gateway</title>
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2316a34a'%3E%3Cpath d='M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z'/%3E%3C/svg%3E">
  <style>
    :root {
      --bg-page: #0b1118;
      --card-bg: rgba(19, 28, 38, 0.75);
      --card-border: rgba(255, 255, 255, 0.12);
      --primary: #16a34a;
      --water: #0284c7;
      --text: #f8fafc;
      --muted: #94a3b8;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: var(--bg-page);
      background-image: 
        radial-gradient(at 15% 15%, rgba(22, 163, 74, 0.18) 0px, transparent 55%),
        radial-gradient(at 85% 10%, rgba(2, 132, 199, 0.22) 0px, transparent 50%),
        radial-gradient(at 50% 85%, rgba(22, 163, 74, 0.15) 0px, transparent 55%);
      color: var(--text);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }
    .gateway-card {
      max-width: 680px;
      width: 100%;
      background: var(--card-bg);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid var(--card-border);
      border-radius: 24px;
      padding: 2.5rem;
      box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.6);
      text-align: center;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      background: rgba(34, 197, 94, 0.15);
      border: 1px solid rgba(34, 197, 94, 0.3);
      border-radius: 9999px;
      color: #86efac;
      font-size: 0.8rem;
      font-weight: 600;
      margin-bottom: 1.25rem;
    }
    .pulse-dot {
      width: 8px; height: 8px; border-radius: 50%; background: #22c55e;
      box-shadow: 0 0 8px #22c55e;
    }
    h1 {
      font-size: 1.85rem;
      font-weight: 800;
      margin-bottom: 0.75rem;
      color: #ffffff;
    }
    p {
      color: var(--muted);
      font-size: 0.95rem;
      line-height: 1.6;
      margin-bottom: 2rem;
    }
    .btn-group {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
      margin-bottom: 2rem;
    }
    @media (min-width: 520px) {
      .btn-group {
        flex-direction: row;
        justify-content: center;
      }
    }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 0.85rem 1.5rem;
      border-radius: 12px;
      font-size: 0.95rem;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.2s ease;
      cursor: pointer;
    }
    .btn-primary {
      background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
      color: #ffffff;
      box-shadow: 0 4px 15px rgba(22, 163, 74, 0.35);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    .btn-primary:hover {
      background: linear-gradient(135deg, #15803d 0%, #166534 100%);
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(22, 163, 74, 0.45);
    }
    .btn-secondary {
      background: rgba(255, 255, 255, 0.08);
      color: #ffffff;
      border: 1px solid rgba(255, 255, 255, 0.15);
    }
    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.14);
      transform: translateY(-2px);
    }
    .endpoints-box {
      text-align: left;
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      padding: 1.25rem;
      font-size: 0.85rem;
    }
    .endpoints-title {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--muted);
      margin-bottom: 0.75rem;
      font-weight: 700;
    }
    .endpoint-item {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }
    .endpoint-item:last-child { border-bottom: none; }
    .endpoint-item a { color: #38bdf8; text-decoration: none; font-family: monospace; }
    .endpoint-item a:hover { text-decoration: underline; }
    .endpoint-method { color: #86efac; font-weight: 700; font-family: monospace; }
  </style>
</head>
<body>
  <div class="gateway-card">
    <div class="badge">
      <span class="pulse-dot"></span>
      Django REST API Backend • Port 8000 Online
    </div>

    <h1>Crop Hydro-Precision</h1>
    <p>
      You have opened the <strong>Django REST API Backend</strong> server (Port 8000).<br>
      The frontend user interface runs on <strong>Port 5500</strong>.
    </p>

    <div class="btn-group">
      <a href="http://127.0.0.1:5500/" class="btn btn-primary">
        <span>🚀 Launch Frontend App (Port 5500)</span>
      </a>
      <a href="/admin/" class="btn btn-secondary">
        <span>⚙️ Django Admin Panel</span>
      </a>
    </div>

    <div class="endpoints-box">
      <div class="endpoints-title">Active REST API Endpoints (JSON)</div>
      <div class="endpoint-item">
        <span>Crops Catalog</span>
        <span><span class="endpoint-method">GET</span> <a href="/api/crops/">/api/crops/</a></span>
      </div>
      <div class="endpoint-item">
        <span>Irrigation Methods</span>
        <span><span class="endpoint-method">GET</span> <a href="/api/methods/">/api/methods/</a></span>
      </div>
      <div class="endpoint-item">
        <span>FAO-56 Calculator Engine</span>
        <span><span class="endpoint-method">POST</span> <a href="/api/calculate/">/api/calculate/</a></span>
      </div>
      <div class="endpoint-item">
        <span>Farmer History & Summary</span>
        <span><span class="endpoint-method">GET</span> <a href="/api/history/summary/">/api/history/summary/</a></span>
      </div>
      <div class="endpoint-item">
        <span>Authentication</span>
        <span><span class="endpoint-method">POST</span> <a href="/api/auth/login/">/api/auth/login/</a></span>
      </div>
    </div>
  </div>
</body>
</html>"""
    return HttpResponse(html_content, content_type="text/html")


def favicon_view(request):
    """Cleanly handles /favicon.ico without logging a 404."""
    svg_icon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#16a34a"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>'
    return HttpResponse(svg_icon, content_type="image/svg+xml")
