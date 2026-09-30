// Click the grey box on the home page to lift the hot air balloon.
const toggle = document.getElementById("lift-toggle");
const night = document.getElementById("night");

if (toggle && night) {
  toggle.addEventListener("click", () => {
    const lifted = night.classList.toggle("lifted");
    toggle.setAttribute("aria-pressed", String(lifted));
  });
}
