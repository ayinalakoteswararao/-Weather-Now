from flask import Flask, request, jsonify, send_from_directory
import requests
import os

app = Flask(__name__, static_folder='.', static_url_path='')

OPEN_METEO_GEOCODE = "https://geocoding-api.open-meteo.com/v1"
OPEN_METEO_FORECAST = "https://api.open-meteo.com/v1/forecast"


@app.route('/')
def root():
    return send_from_directory('.', 'index.html')


@app.route('/api/geocode')
def api_geocode():
    name = request.args.get('name', '')
    count = request.args.get('count', '1')
    if not name:
        return jsonify({"error": "missing name"}), 400
    try:
        n = max(1, min(int(count), 10))
    except Exception:
        n = 1
    params = {
        "name": name,
        "count": n,
        "language": "en",
    }
    try:
        r = requests.get(f"{OPEN_METEO_GEOCODE}/search", params=params, timeout=15)
        ct = {'Content-Type': 'application/json'}
        if r.status_code != 200:
            return (r.text, 502, ct)
        return (r.text, 200, ct)
    except Exception as e:
        return jsonify({"error": "geocoding_failed", "detail": str(e)}), 502


@app.route('/api/reverse')
def api_reverse():
    lat = request.args.get('lat') or request.args.get('latitude')
    lon = request.args.get('lon') or request.args.get('longitude')
    if not lat or not lon:
        return jsonify({"error": "missing lat/lon"}), 400
    params = {
        "latitude": lat,
        "longitude": lon,
        "count": 1,
        "language": "en",
    }
    try:
        r = requests.get(f"{OPEN_METEO_GEOCODE}/reverse", params=params, timeout=15)
        if r.status_code == 200:
            return (r.text, 200, {'Content-Type': 'application/json'})
    except Exception:
        pass
    # Fallback: return coordinates as name to avoid breaking UI
    name = f"{float(lat):.3f}, {float(lon):.3f}"
    return jsonify({"results": [{"name": name}]}), 200


@app.route('/api/forecast')
def api_forecast():
    lat = request.args.get('lat') or request.args.get('latitude')
    lon = request.args.get('lon') or request.args.get('longitude')
    units = request.args.get('units', 'metric')
    if not lat or not lon:
        return jsonify({"error": "missing lat/lon"}), 400

    params = {
        "latitude": lat,
        "longitude": lon,
        "hourly": "precipitation,precipitation_probability,weathercode",
        "daily": "temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,sunrise,sunset,weathercode",
        "current": "precipitation,precipitation_probability,temperature_2m,weathercode,is_day",
        "timezone": "auto",
        "forecast_days": 7,
    }
    if units == 'imperial':
        params["temperature_unit"] = "fahrenheit"
        params["precipitation_unit"] = "inch"
    else:
        params["temperature_unit"] = "celsius"
        params["precipitation_unit"] = "mm"

    try:
        r = requests.get(OPEN_METEO_FORECAST, params=params, timeout=20)
        ct = {'Content-Type': 'application/json'}
        if r.status_code != 200:
            return (r.text, 502, ct)
        return (r.text, 200, ct)
    except Exception as e:
        return jsonify({"error": "forecast_failed", "detail": str(e)}), 502


if __name__ == '__main__':
    port = int(os.environ.get('PORT', '5000'))
    app.run(host='0.0.0.0', port=port, debug=True)
