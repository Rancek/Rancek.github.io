"use strict";
document.documentElement.classList.add("js");
const toggle = document.querySelector(".menu-toggle");
const nav = document.querySelector("#navigation");
function closeMenu() { nav.classList.remove("open"); toggle.setAttribute("aria-expanded", "false"); }
toggle.addEventListener("click", () => {
  const open = toggle.getAttribute("aria-expanded") !== "true";
  toggle.setAttribute("aria-expanded", String(open));
  nav.classList.toggle("open", open);
});
nav.addEventListener("click", event => { if (event.target.closest("a")) closeMenu(); });
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && nav.classList.contains("open")) { closeMenu(); toggle.focus(); }
});
document.addEventListener("click", event => { if (!event.target.closest(".header")) closeMenu(); });
const mobile = matchMedia("(max-width: 900px)");
mobile.addEventListener("change", closeMenu);
document.querySelectorAll(".play").forEach(button => {
  const img = button.parentElement.querySelector("img");
  const poster = img.getAttribute("src");
  const title = button.getAttribute("aria-label").replace("Reproducir GIF: ", "");
  let playing = false;
  button.addEventListener("click", () => {
    playing = !playing;
    img.src = playing ? button.dataset.gif : poster;
    button.setAttribute("aria-pressed", String(playing));
    button.setAttribute("aria-label", `${playing ? "Detener" : "Reproducir"} GIF: ${title}`);
    button.textContent = playing ? "■ Detener animación" : "▶ Ver animación";
  });
  img.addEventListener("error", () => {
    if (playing) { playing = false; img.src = poster; button.setAttribute("aria-pressed", "false"); button.textContent = "↻ Reintentar animación"; }
  });
});
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        nav.querySelectorAll("a").forEach(link => {
          if (link.hash === `#${entry.target.id}`) link.setAttribute("aria-current", "location");
          else link.removeAttribute("aria-current");
        });
      }
    });
  }, { rootMargin: "-20% 0px -55% 0px", threshold: 0 });
  document.querySelectorAll("main section[id]").forEach(section => observer.observe(section));
}

// Direct section links bypass the welcome screen.
const welcome = document.querySelector('.welcome');
if (welcome && typeof welcome.showModal === 'function' && !location.hash) {
  const start = welcome.querySelector('.welcome-start');
  let entering = false, done = false, launchTimer, closeTimer;
  function finish() {
    if (done) return;
    done = true;
    clearTimeout(launchTimer); clearTimeout(closeTimer);
    welcome.close();
    const heading = document.querySelector('#inicio h1');
    heading.setAttribute('tabindex','-1');
    heading.focus({preventScroll:true});
    window.scrollTo({top:0,behavior:'instant'});
  }
  function enterPortfolio() {
    if (entering || matchMedia('(prefers-reduced-motion: reduce)').matches) { finish(); return; }
    entering = true;
    welcome.classList.add('launching');
    welcome.querySelector('.launch-status').textContent = 'Entrando al portafolio…';
    start.textContent = 'Entrar ahora';
    launchTimer = setTimeout(()=>{
      welcome.classList.add('leaving');
      closeTimer = setTimeout(finish,450);
    },3100);
  }
  start.addEventListener('click',enterPortfolio);
  welcome.addEventListener('cancel',event=>{event.preventDefault();finish();});
  welcome.showModal(); start.focus({preventScroll:true});
}
