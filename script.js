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

// Original synthesized sci-fi effects; audio starts only after user activation.
const audioFX = (() => {
  let ctx, master, enabled = false, lastHover = 0;
  const controls = [...document.querySelectorAll('.sound-toggle')];
  function update() {
    controls.forEach(b=>{b.textContent=enabled?'Sonido: activado':'Activar sonido';b.setAttribute('aria-pressed',String(enabled));});
  }
  function tone(type,delay=0) {
    if (!enabled || !ctx || ctx.state!=='running' || document.hidden) return;
    const t=ctx.currentTime+delay, length=type==='saber'?.48:.22;
    const oscillator=ctx.createOscillator(), gain=ctx.createGain(), filter=ctx.createBiquadFilter();
    oscillator.type=type==='saber'?'sawtooth':'square';
    oscillator.frequency.setValueAtTime(type==='saber'?75:1500+Math.random()*700,t);
    if(type==='saber') {oscillator.frequency.exponentialRampToValueAtTime(230,t+.15);oscillator.frequency.exponentialRampToValueAtTime(65,t+length);}
    else oscillator.frequency.exponentialRampToValueAtTime(65,t+length);
    filter.type='lowpass';filter.frequency.setValueAtTime(type==='saber'?650:2600,t);
    filter.frequency.exponentialRampToValueAtTime(140,t+length);
    gain.gain.setValueAtTime(.001,t);gain.gain.exponentialRampToValueAtTime(type==='saber'?.11:.075,t+.012);gain.gain.exponentialRampToValueAtTime(.001,t+length);
    oscillator.connect(filter);filter.connect(gain);gain.connect(master);
    oscillator.start(t);oscillator.stop(t+length+.02);
    oscillator.onended=()=>{oscillator.disconnect();filter.disconnect();gain.disconnect();};
  }
  controls.forEach(b=>b.addEventListener('click',async()=>{
    try {
      if(!ctx) {const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio) throw Error();ctx=new Audio();master=ctx.createGain();master.connect(ctx.destination);}
      if(ctx.state==='suspended') await ctx.resume();
      enabled=!enabled;master.gain.setValueAtTime(enabled?.65:0,ctx.currentTime);update();
      if(enabled)tone('saber');
    } catch {controls.forEach(c=>{c.textContent='Audio indisponible';c.disabled=true;});}
  }));
  function hover(type) {const now=performance.now();if(now-lastHover<420)return;lastHover=now;tone(type);}
  document.addEventListener('visibilitychange',()=>{if(ctx&&master)master.gain.setValueAtTime(enabled&&!document.hidden?.65:0,ctx.currentTime);});
  return {tone,hover};
})();
document.querySelector('.welcome-start')?.addEventListener('pointerenter',()=>audioFX.hover('saber'));
document.querySelector('.welcome-start')?.addEventListener('focus',()=>audioFX.hover('saber'));
document.querySelectorAll('.project-media').forEach(frame=>{
  frame.addEventListener('pointerenter',()=>audioFX.hover(Math.random()<.5?'saber':'blaster'));
  frame.addEventListener('focusin',()=>audioFX.hover(Math.random()<.5?'saber':'blaster'));
});
// Each shot is synchronized with a logo's departure, not its initial appearance.
document.querySelector('.welcome')?.addEventListener('animationstart',event=>{
  if(event.animationName!=='logo-burst')return;
  const timer=setTimeout(()=>{if(welcome.open&&welcome.classList.contains('launching'))audioFX.tone('blaster');},1460);
  welcome.addEventListener('close',()=>clearTimeout(timer),{once:true});
});
