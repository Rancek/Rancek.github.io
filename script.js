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

// User-supplied MP3 effects; no synthesized replacement sounds.
const audioFX = (() => {
  let ctx, master, enabled=false, loading=false, buffers, lastHover=0;
  const voices=new Set(), controls=[...document.querySelectorAll('.sound-toggle')];
  function update() {controls.forEach(b=>{b.textContent=loading?'Cargando audio…':enabled?'Sonido: activado':'Activar sonido';b.disabled=loading;b.setAttribute('aria-pressed',String(enabled));});}
  function stop() {for(const voice of voices){try{voice.stop();}catch{}}voices.clear();}
  function tone(type) {
    if(!enabled||!buffers||ctx.state!=='running'||document.hidden)return;
    // Bound simultaneous playback so rapid hover and the burst remain comfortable.
    if(voices.size>=3){const oldest=voices.values().next().value;oldest.stop();voices.delete(oldest);}
    const source=ctx.createBufferSource();source.buffer=buffers[type];source.connect(master);
    voices.add(source);source.onended=()=>{voices.delete(source);source.disconnect();};source.start();
  }
  controls.forEach(button=>button.addEventListener('click',async()=>{
    if(loading)return;
    if(enabled){enabled=false;stop();update();return;}
    try {
      const Audio=window.AudioContext||window.webkitAudioContext;
      if(!ctx){ctx=new Audio();master=ctx.createGain();master.gain.value=.3;master.connect(ctx.destination);}
      loading=true;update();await ctx.resume();
      if(!buffers){
        const pairs=await Promise.all([['saber','assets/audio/sable-de-luz.mp3'],['blaster','assets/audio/blaster.mp3']].map(async([key,url])=>{
          const response=await fetch(url);if(!response.ok)throw Error('audio unavailable');
          return [key,await ctx.decodeAudioData(await response.arrayBuffer())];
        }));buffers=Object.fromEntries(pairs);
      }
      enabled=true;loading=false;update();
    }catch{loading=false;enabled=false;update();controls.forEach(b=>b.textContent='Reintentar audio');}
  }));
  function hover(type){const now=performance.now();if(now-lastHover<500)return;lastHover=now;tone(type);}
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
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
