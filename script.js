// Click the grey box on the home page to lift the hot air balloon.
// About a second after the lift finishes, the page glides down to Selected Projects.
const LIFT_MS = 1400;   // matches the balloon transition in style.css
const PAUSE_MS = 1000;  // wait after the lift before scrolling

const toggle = document.getElementById("lift-toggle");
const night = document.getElementById("night");
const projects = document.getElementById("projects");
let scrollTimer;

if (toggle && night) {
  toggle.addEventListener("click", () => {
    clearTimeout(scrollTimer);
    const lifted = night.classList.toggle("lifted");
    toggle.setAttribute("aria-pressed", String(lifted));

    if (lifted && projects) {
      scrollTimer = setTimeout(() => {
        const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        projects.scrollIntoView({ behavior: calm ? "auto" : "smooth", block: "start" });
      }, LIFT_MS + PAUSE_MS);
    }
  });
}
