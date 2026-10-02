// Click the envelope: it opens, then the hot air balloon lifts. Click again to reset.
const LIFT_AT = 1.8;    // seconds into the video when the letter is in place; balloon starts here

const toggle = document.getElementById("lift-toggle");
const video = document.getElementById("envelope");
const night = document.getElementById("night");
let playing = false;

function liftBalloon() {
  if (night.classList.contains("lifted")) return;
  night.classList.add("lifted");
  toggle.setAttribute("aria-pressed", "true");
}

function reset() {
  toggle.classList.remove("played");
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
