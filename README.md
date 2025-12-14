<h1 align="center">🌦️ Weather Now</h1>

<p align="center">
  Beautiful, real‑time weather web app with dark/light themes, animated icons, multi‑color forecast cards, and a polished modern UI.
</p>

<p align="center">
  <img alt="Flask" src="https://img.shields.io/badge/Flask-000?logo=flask&logoColor=white">
  <img alt="JavaScript" src="https://img.shields.io/badge/JavaScript-FFD43B?logo=javascript&logoColor=222">
  <img alt="Chart.js" src="https://img.shields.io/badge/Chart.js-FF6384?logo=chartdotjs&logoColor=fff">
  <img alt="Lucide Icons" src="https://img.shields.io/badge/Icons-LUCIDE-0EA5E9">
</p>

<p align="center">
  <img alt="Weather Now preview" src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1280&auto=format&fit=crop" width="720">
</p>

---

## ✨ Features
- **Dark/Light mode** with animated weather accents and glassmorphism UI
- **Smart backgrounds** and multi‑color forecast cards
- **Location search** with suggestions + use my location (geolocation)
- **Current weather, sunrise/sunset, 24h & 7d charts** (Chart.js)
- **Unit toggle** Metric/Imperial with themed dropdown
- **Clean API proxy** to Open‑Meteo (no API key required)

## 📦 Tech Stack
- **Backend:** Flask (Python) for static serving + lightweight API routes
- **Frontend:** Vanilla JavaScript, Chart.js, Lucide icons
- **Styling:** Modern CSS with gradients, blur, and accessibility‑minded contrast

## 🚀 Getting Started

1. **Install Python 3.9+ and pip.**

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the app**
   ```bash
   python app.py
   ```

4. **Open in your browser**
   ```text
   http://127.0.0.1:5000
   ```

## 🗺️ Project Structure

```text
Weather Now/
├─ app.py          # Flask server + API proxy to Open‑Meteo
├─ index.html      # App markup
├─ style.css       # Styles (themes, layout, effects)
├─ app.js          # Logic, charts, geocode/forecast calls
├─ requirements.txt
└─ README.md
```

## 🔌 API Routes (Flask)

- `GET /api/geocode?name=Hyderabad&count=5`
- `GET /api/reverse?lat=..&lon=..`
- `GET /api/forecast?lat=..&lon=..&units=metric|imperial`

All routes proxy to Open‑Meteo services and return JSON.

## 🧭 UI Guide

- **Search bar:** type city to get suggestions
- **Buttons:**
  - Search (magnifier)
  - Use my location (map‑pin)
  - Dark/Light toggle (moon/sun)
- **Units:** Metric/Imperial dropdown with color themes
- **Cards:** Current weather, Sunrise/Sunset, Forecast (5 days)
- **Charts:** Hourly (24h) and Daily (7d)

## 🖌️ Theming

- Toggle mode with the Dark/Light button
- Background themes adapt to conditions; forecast cards cycle through vibrant gradients
- High‑contrast dark glass containers for readability in both modes

## 🧪 Troubleshooting

- If charts don’t render immediately, the app retries with safe fallbacks; refresh once if you changed network/device time.
- Geolocation denied? Use the search box instead.
- Mixed content/HTTPS: run locally on HTTP; the Open‑Meteo API supports HTTPS.

## 🔒 Privacy

No user accounts or persistent storage. Location is only used client‑side to fetch weather data for the current session.


📞 Support
For support, email ayinalakoteswararao@gmail.com or open an issue in the GitHub repository.

Made with ❤️ by Ayinala-KoteswaraRao

