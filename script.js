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

// ---------- Live time in the sidebar (the visitor's own clock) ----------
const timeEl = document.querySelector("[data-time]");

function tickClock() {
  if (!timeEl) return;
  timeEl.textContent = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

tickClock();
setInterval(tickClock, 1000);

// Looping videos (like the bird tile) stay still for visitors who prefer reduced motion.
if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  document.querySelectorAll("video.loop-video").forEach((v) => { v.removeAttribute("autoplay"); v.pause(); });
}
