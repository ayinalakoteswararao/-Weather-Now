// Using Open-Meteo (no API key required)
const statusEl = document.getElementById("status");
const locNameEl = document.getElementById("loc-name");
const nowTimeEl = document.getElementById("now-time");
const nowPrecipEl = document.getElementById("now-precip");
const nowPopEl = document.getElementById("now-pop");
const nowTempEl = document.getElementById("now-temp");
const unitsSelect = document.getElementById("units");
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const useLocationBtn = document.getElementById("use-location");
const suggestionsEl = document.getElementById("suggestions");
const heroTempEl = document.getElementById("hero-temp");
const heroIconEl = document.getElementById("hero-icon");
const heroCondEl = document.getElementById("hero-cond");
const heroRangeEl = document.getElementById("hero-range");
const sunriseEl = document.getElementById("sunrise");
const sunsetEl = document.getElementById("sunset");
const heroCtaEl = document.getElementById("hero-cta");
const currentHeadingEl = document.getElementById("current-heading");
const taglineEl = document.getElementById("tagline");
const forecastCardsEl = document.getElementById("forecast-cards");
const modeToggleEl = document.getElementById("mode-toggle");

let hourlyChart;
let dailyChart;
let lastCoords = null;
let lastWx = null;

function refreshIcons() {
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}

function updateUnitsTheme() {
  if (!unitsSelect) return;
  const v = unitsSelect.value === 'imperial' ? 'units-imperial' : 'units-metric';
  unitsSelect.classList.remove('units-metric', 'units-imperial');
  unitsSelect.classList.add(v);
}

function setStatus(msg) {
  statusEl.textContent = msg || "";
}

function formatTime(ts, tzOffsetSec) {
  const d = new Date((ts + tzOffsetSec) * 1000);
  return d.toUTCString().slice(0, 22);
}

function debounce(fn, delay = 300) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
}

function setLoading(loading) {
  document.body.classList.toggle('is-loading', !!loading);
  searchInput.disabled = !!loading;
  useLocationBtn.disabled = !!loading;
  unitsSelect.disabled = !!loading;
}

function pickAutoTheme(wx) {
  const code = wx?.current?.weathercode;
  const isDay = wx?.current?.is_day;
  const pop = Math.max(
    0,
    Number(wx?.current?.precipitation_probability ?? (Array.isArray(wx?.hourly?.precipitation_probability) ? wx.hourly.precipitation_probability[0] : 0))
  );
  let theme = 'bg-clear';
  if (typeof code === 'number') {
    if (code === 45 || code === 48) theme = 'bg-fog';
    else if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) theme = 'bg-rain';
    else if (code === 95 || code === 96 || code === 99) theme = 'bg-storm';
    else if (code === 0 || code === 1) theme = 'bg-clear';
    else theme = 'bg-cloudy';
  } else if (pop >= 50) {
    theme = 'bg-rain';
  }
  if (isDay === 0 && (theme === 'bg-clear' || theme === 'bg-cloudy' || theme === 'bg-fog')) theme = 'bg-night';
  return theme;
}

function applyBackground(theme, wx) {
  const classes = ['bg-sky', 'bg-lavender', 'bg-mint', 'bg-peach', 'bg-clear', 'bg-cloudy', 'bg-rain', 'bg-storm', 'bg-fog', 'bg-night'];
  classes.forEach(c => document.body.classList.remove(c));
  if (theme === 'auto') {
    const chosen = pickAutoTheme(wx || lastWx);
    if (chosen) document.body.classList.add(chosen);
  } else if (theme === 'sky') document.body.classList.add('bg-sky');
  else if (theme === 'lavender') document.body.classList.add('bg-lavender');
  else if (theme === 'mint') document.body.classList.add('bg-mint');
  else if (theme === 'peach') document.body.classList.add('bg-peach');
  // 'default' or unknown -> leave base background
}

function conditionNameFromCode(code) {
  if (code === 0) return 'Clear';
  if (code === 1) return 'Mainly clear';
  if (code === 2) return 'Partly cloudy';
  if (code === 3) return 'Overcast';
  if (code === 45 || code === 48) return 'Fog';
  if (code >= 51 && code <= 67) return 'Drizzle/Rain';
  if (code >= 71 && code <= 77) return 'Snow';
  if (code >= 80 && code <= 82) return 'Rain showers';
  if (code >= 85 && code <= 86) return 'Snow showers';
  if (code === 95) return 'Thunderstorm';
  if (code === 96 || code === 99) return 'Thunderstorm w/ hail';
  return 'Cloudy';
}

function renderHero(wx, units) {
  if (!heroTempEl || !heroCondEl || !heroRangeEl) return;
  const temp = Math.round(wx.current?.temperature_2m ?? 0);
  const code = wx.current?.weathercode;
  const cond = conditionNameFromCode(typeof code === 'number' ? code : -1);
  const max = Math.round(Array.isArray(wx.daily?.temperature_2m_max) ? wx.daily.temperature_2m_max[0] ?? temp : temp);
  const min = Math.round(Array.isArray(wx.daily?.temperature_2m_min) ? wx.daily.temperature_2m_min[0] ?? temp : temp);
  const unit = units === 'imperial' ? '°F' : '°C';
  heroTempEl.textContent = `${temp}${unit}`;
  heroCondEl.textContent = cond;
  heroRangeEl.textContent = `${min}${unit} ~ ${max}${unit}`;

  // Set hero icon based on weather code
  if (heroIconEl) {
    const isDay = wx?.current?.is_day === 1;
    let icon = 'cloud';
    if (typeof code === 'number') {
      if (code === 0) icon = isDay ? 'sun' : 'moon';
      else if (code === 1) icon = isDay ? 'sun' : 'moon';
      else if (code === 2) icon = isDay ? 'cloud-sun' : 'cloud-moon';
      else if (code === 3) icon = 'cloud';
      else if (code === 45 || code === 48) icon = 'fog';
      else if ((code >= 51 && code <= 57)) icon = 'cloud-drizzle';
      else if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) icon = 'cloud-rain';
      else if (code >= 71 && code <= 77) icon = 'cloud-snow';
      else if (code === 95 || code === 96 || code === 99) icon = 'cloud-lightning';
    }
    heroIconEl.innerHTML = `<i data-lucide="${icon}"></i>`;
  }
  refreshIcons();
}

function renderForecastCards(wx, units) {
  if (!forecastCardsEl) return;
  const days = 5;
  const times = (wx.daily?.time || []).slice(0, days);
  const tmax = (wx.daily?.temperature_2m_max || []).slice(0, days);
  const tmin = (wx.daily?.temperature_2m_min || []).slice(0, days);
  const pops = (wx.daily?.precipitation_probability_max || []).slice(0, days);
  const wxcodes = (wx.daily?.weathercode || []).slice(0, days);
  const unit = units === 'imperial' ? '°F' : '°C';
  forecastCardsEl.innerHTML = '';
  times.forEach((dateStr, i) => {
    const dt = new Date(dateStr + 'T00:00:00');
    const label = dt.toLocaleDateString(undefined, { weekday: 'short' });
    const code = Number(wxcodes[i]);
    let icon = 'cloud';
    if (!Number.isNaN(code)) {
      if (code === 0) icon = 'sun';
      else if (code === 1) icon = 'sun';
      else if (code === 2) icon = 'cloud-sun';
      else if (code === 3) icon = 'cloud';
      else if (code === 45 || code === 48) icon = 'fog';
      else if (code >= 51 && code <= 57) icon = 'cloud-drizzle';
      else if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) icon = 'cloud-rain';
      else if (code >= 71 && code <= 77) icon = 'cloud-snow';
      else if (code === 95 || code === 96 || code === 99) icon = 'cloud-lightning';
    }
    const card = document.createElement('div');
    card.className = 'forecast-card';
    card.innerHTML = `
      <div class="fc-top">
        <div class="fc-day">${label}</div>
        <div class="fc-icon"><i data-lucide="${icon}"></i></div>
      </div>
      <div class="fc-temps">
        <span class="fc-max">${Math.round(tmax[i] ?? 0)}${unit}</span>
        <span class="fc-min">${Math.round(tmin[i] ?? 0)}${unit}</span>
      </div>
      <div class="fc-pop"><i data-lucide="umbrella"></i> ${Math.round(pops[i] ?? 0)}%</div>`;
    forecastCardsEl.appendChild(card);
  });
  refreshIcons();
}

function renderAstro(wx) {
  if (!sunriseEl || !sunsetEl) return;
  const sr = Array.isArray(wx.daily?.sunrise) ? wx.daily.sunrise[0] : null;
  const ss = Array.isArray(wx.daily?.sunset) ? wx.daily.sunset[0] : null;
  sunriseEl.textContent = sr ? sr.slice(11,16) : '—';
  sunsetEl.textContent = ss ? ss.slice(11,16) : '—';
  refreshIcons();
}

async function geocodeCity(q) {
  const url = new URL("/api/geocode", window.location.origin);
  url.searchParams.set("name", q);
  let res;
  try {
    res = await fetch(url);
  } catch (e) {
    console.error("Geocode fetch failed:", url.toString(), e);
    throw new Error("Geocoding network error");
  }
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("Geocode non-OK:", res.status, res.statusText, text);
    throw new Error(`Geocoding failed (${res.status})`);
  }
  const data = await res.json();
  if (!data || !data.results || data.results.length === 0) throw new Error("City not found");
  const r = data.results[0];
  const parts = [r.name, r.admin1, r.country].filter(Boolean);
  return { lat: r.latitude, lon: r.longitude, name: parts.join(", ") };
}

async function geocodeSuggest(q, count = 5) {
  const url = new URL("/api/geocode", window.location.origin);
  url.searchParams.set("name", q);
  url.searchParams.set("count", String(count));
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    if (!data || !data.results) return [];
    return data.results.map(r => ({
      name: [r.name, r.admin1, r.country].filter(Boolean).join(', '),
      lat: r.latitude, lon: r.longitude
    }));
  } catch {
    return [];
  }
}

async function reverseGeocode(lat, lon) {
  const url = new URL("/api/reverse", window.location.origin);
  url.searchParams.set("lat", lat);
  url.searchParams.set("lon", lon);
  let res;
  try {
    res = await fetch(url);
  } catch (e) {
    console.error("Reverse geocode fetch failed:", url.toString(), e);
    throw new Error("Reverse geocoding network error");
  }
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("Reverse geocode non-OK:", res.status, res.statusText, text);
    throw new Error(`Reverse geocoding failed (${res.status})`);
  }
  const data = await res.json();
  if (!data || !data.results || data.results.length === 0) return { name: `${lat.toFixed(3)}, ${lon.toFixed(3)}` };
  const r = data.results[0];
  const parts = [r.name, r.admin1, r.country].filter(Boolean);
  return { name: parts.join(", ") };
}

async function fetchForecast(lat, lon, units) {
  const url = new URL("/api/forecast", window.location.origin);
  url.searchParams.set("lat", lat);
  url.searchParams.set("lon", lon);
  url.searchParams.set("units", units);
  if (units === "imperial") {
    url.searchParams.set("temperature_unit", "fahrenheit");
    url.searchParams.set("precipitation_unit", "inch");
  } else {
    url.searchParams.set("temperature_unit", "celsius");
    url.searchParams.set("precipitation_unit", "mm");
  }
  let res;
  try {
    res = await fetch(url);
  } catch (e) {
    console.error("Forecast fetch failed:", url.toString(), e);
    throw new Error("Forecast network error");
  }
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("Forecast non-OK:", res.status, res.statusText, text);
    throw new Error(`Weather fetch failed (${res.status})`);
  }
  return res.json();
}

function renderCurrent(data, units, locName) {
  const precip = data.current?.precipitation ?? 0;
  const popCurrent = data.current?.precipitation_probability;
  const popHourly0 = Array.isArray(data.hourly?.precipitation_probability) ? data.hourly.precipitation_probability[0] : undefined;
  const pop = Math.round((popCurrent ?? popHourly0 ?? 0));
  const temp = Math.round(data.current?.temperature_2m ?? 0);
  const precipUnit = units === "imperial" ? "in" : "mm";
  locNameEl.textContent = locName;
  if (currentHeadingEl) currentHeadingEl.textContent = `Current Weather in ${locName}`;
  // data.current.time is ISO string already in local timezone when timezone=auto
  nowTimeEl.textContent = data.current?.time ?? "—";
  nowPrecipEl.textContent = `${precip} ${precipUnit}`;
  nowPopEl.textContent = `${pop}%`;
  nowTempEl.textContent = `${temp}°`;
  refreshIcons();
}

function makeLineConfig(labels, datasets) {
  return {
    type: "line",
    data: { labels, datasets },
    options: {
      responsive: true,
      interaction: { mode: "index", intersect: false },
      stacked: false,
      plugins: {
        legend: {
          display: true,
          labels: { color: "#e2e8f0" }
        }
      },
      scales: {
        x: {
          ticks: { color: "#e2e8f0" },
          grid: { color: "rgba(226,232,240,0.15)", borderColor: "rgba(226,232,240,0.25)" }
        },
        y: {
          beginAtZero: true,
          ticks: { color: "#e2e8f0" },
          grid: { color: "rgba(226,232,240,0.15)", borderColor: "rgba(226,232,240,0.25)" }
        }
      }
    }
  };
}

function renderHourly(data, units) {
  const hours = 24;
  const el = document.getElementById("hourlyChart");
  if (!el || typeof el.getContext !== 'function' || !window.Chart) return;
  let labels = (data.hourly?.time || []).slice(0, hours).map(t => t.slice(11,16));
  let precip = (data.hourly?.precipitation || []).slice(0, hours);
  let pop = (data.hourly?.precipitation_probability || []).slice(0, hours);
  if (!labels.length) {
    labels = Array.from({ length: hours }, (_, i) => String(i).padStart(2, '0') + ":00");
    precip = new Array(hours).fill(0);
    pop = new Array(hours).fill(0);
  }
  const ctx = el.getContext("2d");
  if (!ctx) return;
  try {
    if (hourlyChart) hourlyChart.destroy();
    hourlyChart = new Chart(ctx, makeLineConfig(labels, [
      { label: units === "imperial" ? "Precipitation (in)" : "Precipitation (mm)", data: precip, borderColor: "#3b82f6", backgroundColor: "#3b82f680" },
      { label: "Chance of rain (%)", data: pop, borderColor: "#10b981", backgroundColor: "#10b98180", yAxisID: "y" }
    ]));
  } catch (e) {
    console.error("Hourly chart render failed", e);
  }
}

function renderDaily(data, units) {
  const days = 7;
  const el = document.getElementById("dailyChart");
  if (!el || typeof el.getContext !== 'function' || !window.Chart) return;
  let labels = (data.daily?.time || []).slice(0, days).map(t => t);
  let precip = (data.daily?.precipitation_sum || []).slice(0, days);
  let pop = (data.daily?.precipitation_probability_max || []).slice(0, days);
  if (!labels.length) {
    labels = Array.from({ length: days }, (_, i) => `D${i+1}`);
    precip = new Array(days).fill(0);
    pop = new Array(days).fill(0);
  }
  const ctx = el.getContext("2d");
  if (!ctx) return;
  try {
    if (dailyChart) dailyChart.destroy();
    dailyChart = new Chart(ctx, makeLineConfig(labels, [
      { label: units === "imperial" ? "Precipitation (in)" : "Precipitation (mm)", data: precip, borderColor: "#6366f1", backgroundColor: "#6366f180" },
      { label: "Chance of rain (%)", data: pop, borderColor: "#f59e0b", backgroundColor: "#f59e0b80" }
    ]));
  } catch (e) {
    console.error("Daily chart render failed", e);
  }
}

async function runForCoords(lat, lon, units) {
  setStatus("Loading weather…");
  setLoading(true);
  try {
    lastCoords = { lat, lon };
    const [wx, place] = await Promise.all([
      fetchForecast(lat, lon, units),
      reverseGeocode(lat, lon)
    ]);
    lastWx = wx;
    renderCurrent(wx, units, place.name);
    renderHero(wx, units);
    renderAstro(wx);
    renderHourly(wx, units);
    renderDaily(wx, units);
    renderForecastCards(wx, units);
    setStatus("");
  } catch (e) {
    console.error("runForCoords error:", e);
    setStatus((navigator.onLine ? "Error: " : "Offline: ") + (e?.message || "Unknown error"));
  } finally {
    setLoading(false);
  }
}

async function handleSearch(e) {
  e.preventDefault();
  const q = searchInput.value.trim();
  if (!q) return;
  try {
    setStatus("Searching…");
    const { lat, lon, name } = await geocodeCity(q);
    await runForCoords(lat, lon, unitsSelect.value);
    locNameEl.textContent = name;
    hideSuggestions();
  } catch (e) {
    setStatus("Error: " + e.message);
  }
}

function useMyLocation() {
  if (!navigator.geolocation) { setStatus("Geolocation unavailable"); return; }
  setStatus("Getting location…");
  navigator.geolocation.getCurrentPosition(async pos => {
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;
    await runForCoords(lat, lon, unitsSelect.value);
  }, err => {
    setStatus("Location error");
  });
}

searchForm.addEventListener("submit", handleSearch);
useLocationBtn.addEventListener("click", useMyLocation);
unitsSelect.addEventListener("change", () => {
  if (!lastCoords) return;
  setStatus("Updating…");
  updateUnitsTheme();
  runForCoords(lastCoords.lat, lastCoords.lon, unitsSelect.value);
});

// Manual Dark/Light mode; no auto background changes
function applyMode(mode) {
  document.body.classList.remove('mode-dark', 'mode-light');
  if (mode === 'light') document.body.classList.add('mode-light');
  else document.body.classList.add('mode-dark');
}

function setModeButton(mode) {
  if (!modeToggleEl) return;
  const isDark = mode !== 'light';
  const label = isDark ? 'Dark Mode' : 'Light Mode';
  const icon = isDark ? 'moon-star' : 'sun';
  modeToggleEl.setAttribute('aria-pressed', String(isDark));
  modeToggleEl.innerHTML = `<i data-lucide="${icon}"></i> ${label}`;
  refreshIcons();
}

function hideSuggestions() {
  if (suggestionsEl) {
    suggestionsEl.innerHTML = '';
    suggestionsEl.hidden = true;
  }
}

function showSuggestions(items) {
  if (!suggestionsEl) return;
  if (!items.length) { hideSuggestions(); return; }
  suggestionsEl.innerHTML = '';
  items.forEach(it => {
    const div = document.createElement('div');
    div.className = 'item';
    div.textContent = it.name;
    div.addEventListener('click', async () => {
      searchInput.value = it.name;
      hideSuggestions();
      await runForCoords(it.lat, it.lon, unitsSelect.value);
      locNameEl.textContent = it.name;
    });
    suggestionsEl.appendChild(div);
  });
  suggestionsEl.hidden = false;
}

const debouncedSuggest = debounce(async (q) => {
  if (!q || q.length < 2) { hideSuggestions(); return; }
  const list = await geocodeSuggest(q, 5);
  showSuggestions(list);
}, 300);

searchInput.addEventListener('input', (e) => {
  debouncedSuggest(e.target.value.trim());
});

searchInput.addEventListener('blur', () => setTimeout(hideSuggestions, 150));

document.addEventListener('DOMContentLoaded', () => {
  refreshIcons();
  // default to dark mode
  applyMode('dark');
  setModeButton('dark');
  updateUnitsTheme();
  if (modeToggleEl) {
    modeToggleEl.addEventListener('click', () => {
      const isPressed = modeToggleEl.getAttribute('aria-pressed') === 'true';
      const next = isPressed ? 'light' : 'dark';
      applyMode(next);
      setModeButton(next);
    });
  }
  if (heroCtaEl) {
    heroCtaEl.addEventListener('click', () => {
      if (searchInput) {
        searchInput.focus();
        try { searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch {}
      }
    });
  }
  // Rotating taglines
  if (taglineEl) {
    const lines = [
      "Bringing tomorrow’s weather, today.",
      "Because every plan starts with the forecast.",
      "Know the sky before you step outside.",
      "Your pocket weather station.",
      "Weather Now — simple, smart, and stunning."
    ];
    let idx = 0;
    setInterval(() => {
      idx = (idx + 1) % lines.length;
      taglineEl.textContent = lines[idx];
    }, 6000);
  }
});

