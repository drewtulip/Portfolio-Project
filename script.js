// Click the envelope: it opens, then the hot air balloon lifts, and about a
// second later the page glides down to Selected Projects. Click again to reset.
const LIFT_MS = 1400;   // matches the balloon transition in style.css
const PAUSE_MS = 1000;  // wait after the lift before scrolling
const LIFT_AT = 1.8;    // seconds into the video when the letter is in place; balloon starts here

const toggle = document.getElementById("lift-toggle");
const video = document.getElementById("envelope");
const night = document.getElementById("night");
const projects = document.getElementById("projects");
let scrollTimer;
let playing = false;

function liftBalloon() {
  if (night.classList.contains("lifted")) return;
  night.classList.add("lifted");
  toggle.setAttribute("aria-pressed", "true");
  if (!projects) return;
  scrollTimer = setTimeout(() => {
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    projects.scrollIntoView({ behavior: calm ? "auto" : "smooth", block: "start" });
  }, LIFT_MS + PAUSE_MS);
}

function reset() {
  toggle.classList.remove("played");
  clearTimeout(scrollTimer);
  night.classList.remove("lifted");
  toggle.setAttribute("aria-pressed", "false");
  video.pause();
  video.currentTime = 0;
  playing = false;
}

if (toggle && video && night) {
  video.addEventListener("timeupdate", () => {
    if (playing && video.currentTime >= LIFT_AT) liftBalloon();
  });
  video.addEventListener("ended", () => {
    playing = false;
    liftBalloon();
  });

  toggle.addEventListener("click", () => {
    if (playing) return;                       // ignore clicks mid-animation
    if (night.classList.contains("lifted")) { reset(); return; }
    playing = true;
    toggle.classList.add("played");
    video.currentTime = 0;
    video.play().catch(() => { playing = false; liftBalloon(); });
  });
}

// ---------- Live time + weather in the sidebar (the visitor's own) ----------
// Time uses the visitor's device clock. Weather uses their approximate location,
// looked up from their IP address (no permission pop-up), then Open-Meteo (free, no key).
// If the lookup fails it falls back to FALLBACK below.
const FALLBACK = { name: "Tyler, TX", lat: 32.3513, lon: -95.3011 };

const timeEl = document.querySelector("[data-time]");
const weatherEl = document.querySelector("[data-weather]");
const placeEl = document.querySelector("[data-place]");

function tickClock() {
  if (!timeEl) return;
  timeEl.textContent = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

const WEATHER_TEXT = {
  0: "Clear", 1: "Mostly clear", 2: "Partly cloudy", 3: "Overcast",
  45: "Foggy", 48: "Foggy",
  51: "Light drizzle", 53: "Drizzle", 55: "Heavy drizzle",
  56: "Freezing drizzle", 57: "Freezing drizzle",
  61: "Light rain", 63: "Rain", 65: "Heavy rain",
  66: "Freezing rain", 67: "Freezing rain",
  71: "Light snow", 73: "Snow", 75: "Heavy snow", 77: "Snow grains",
  80: "Rain showers", 81: "Rain showers", 82: "Heavy showers",
  85: "Snow showers", 86: "Snow showers",
  95: "Thunderstorm", 96: "Thunderstorm", 99: "Thunderstorm",
};

async function findVisitor() {
  try {
    const res = await fetch("https://ipwho.is/?fields=success,city,region_code,latitude,longitude");
    const d = await res.json();
    if (!d.success) throw new Error("lookup failed");
    const name = [d.city, d.region_code].filter(Boolean).join(", ");
    return { name, lat: d.latitude, lon: d.longitude };
  } catch {
    return FALLBACK;
  }
}

async function loadWeather(place) {
  if (!weatherEl) return;
  const url = "https://api.open-meteo.com/v1/forecast" +
    `?latitude=${place.lat}&longitude=${place.lon}` +
    "&current=temperature_2m,weather_code&temperature_unit=fahrenheit&timezone=auto";
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(res.status);
    const { current } = await res.json();
    const text = WEATHER_TEXT[current.weather_code] || "";
    weatherEl.textContent = `${Math.round(current.temperature_2m)}°F${text ? " · " + text : ""}`;
  } catch {
    weatherEl.textContent = "";   // quietly hide if offline
  }
}

async function startLocal() {
  tickClock();
  setInterval(tickClock, 1000);
  const place = await findVisitor();
  if (placeEl) placeEl.textContent = place.name;
  loadWeather(place);
  setInterval(() => loadWeather(place), 10 * 60 * 1000);
}

startLocal();
