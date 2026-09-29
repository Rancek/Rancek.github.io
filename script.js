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

// The home link also opens the welcome screen.
const welcome = document.querySelector('.welcome');
if (welcome && typeof welcome.showModal === 'function' && (!location.hash || location.hash === '#inicio')) {
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
    // Random outward trajectories retain a clear area around the avatar.
    welcome.querySelectorAll('.launch-app').forEach(logo=>{
      const style=getComputedStyle(logo);
      const x=parseFloat(style.getPropertyValue('--near-x'));
      const y=parseFloat(style.getPropertyValue('--near-y'));
      const angle=Math.atan2(y,x)+(Math.random()-.5)*.35;
      const distance=Math.hypot(innerWidth,innerHeight)*(1.1+Math.random()*.5);
      logo.style.setProperty('--far-x',`${Math.cos(angle)*distance}px`);
      logo.style.setProperty('--far-y',`${Math.sin(angle)*distance}px`);
      logo.style.setProperty('--spin',`${(Math.random()-.5)*720}deg`);
    });
    welcome.classList.add('launching');
    welcome.dispatchEvent(new Event('tunnel-launch'));
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
  let ctx, master, enabled=true, loading=false, buffers;
  const voices=new Set(), controls=[...document.querySelectorAll('.sound-toggle')];
  function update() {controls.forEach(b=>{b.textContent=loading?'Cargando audio…':enabled?'Desactivar sonido':'Activar sonido';b.disabled=loading;b.setAttribute('aria-pressed',String(enabled));});}
  function stop() {for(const voice of voices){try{voice.stop();}catch{}}voices.clear();}
  function tone(type) {
    if(!enabled||!buffers||ctx.state!=='running'||document.hidden)return;
    // Bound simultaneous playback so rapid hover and the burst remain comfortable.
    if(voices.size>=3){const oldest=voices.values().next().value;oldest.stop();voices.delete(oldest);}
    const source=ctx.createBufferSource();source.buffer=buffers[type];source.connect(master);
    voices.add(source);source.onended=()=>{voices.delete(source);source.disconnect();};source.start();return source;
  }
  async function prepare(){
    if(loading)return;loading=true;
    try{
      const Audio=window.AudioContext||window.webkitAudioContext;
      if(!ctx){ctx=new Audio();master=ctx.createGain();master.gain.value=.3;master.connect(ctx.destination);}
      if(ctx.state!=='running')await ctx.resume();
      if(!buffers){const pairs=await Promise.all([['saber','assets/audio/sable-de-luz.mp3?v=final10'],['blaster','assets/audio/blaster.mp3?v=final10']].map(async([key,url])=>{const response=await fetch(url);if(!response.ok)throw Error('audio unavailable');return [key,await ctx.decodeAudioData(await response.arrayBuffer())];}));buffers=Object.fromEntries(pairs);}
    }catch{enabled=false;}finally{loading=false;update();}
  }
  controls.forEach(button=>button.addEventListener('click',()=>{enabled=!enabled;if(!enabled)stop();else void prepare();update();}));
  const unlock=event=>{if(enabled&&!event.target.closest('.sound-toggle'))void prepare();};
  document.addEventListener('pointerdown',unlock);document.addEventListener('keydown',unlock);update();
  function stopVoice(source){if(!source)return;try{source.stop();}catch{}voices.delete(source);}
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
  return {tone,stopVoice,stop};
})();
// Hover audio belongs to its element and stops immediately on pointer exit.
function attachHoverSound(element,chooseSound) {
  let voice;
  const end=()=>{audioFX.stopVoice(voice);voice=undefined;};
  element.addEventListener('pointerenter',event=>{
    if(event.pointerType==='touch')return;
    end();voice=audioFX.tone(chooseSound());
  });
  element.addEventListener('pointerleave',end);
  element.addEventListener('pointercancel',end);
  window.addEventListener('blur',end);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)end();});
  return end;
}
const startSoundButton=document.querySelector('.welcome-start');
if(startSoundButton){
  const end=attachHoverSound(startSoundButton,()=> 'saber');
  startSoundButton.addEventListener('click',end);
  document.querySelector('.welcome')?.addEventListener('close',end);
}
document.querySelectorAll('.project-media').forEach(frame=>{
  attachHoverSound(frame,()=>Math.random()<.5?'saber':'blaster');
});
welcome?.addEventListener('close',()=>audioFX.stop());
window.addEventListener('blur',()=>audioFX.stop());
// Each shot is synchronized with a logo's departure, not its initial appearance.
document.querySelector('.welcome')?.addEventListener('animationstart',event=>{
  if(event.animationName!=='logo-burst')return;
  const timer=setTimeout(()=>{if(welcome.open&&welcome.classList.contains('launching'))audioFX.tone('blaster');},1460);
  welcome.addEventListener('close',()=>clearTimeout(timer),{once:true});
});

// Perspective tunnel and one finite energy burst, paused outside the intro.
(() => {
  if(!welcome)return;
  const canvas=document.createElement('canvas');
  canvas.className='intro-tunnel';canvas.setAttribute('aria-hidden','true');
  welcome.prepend(canvas);
  const ctx=canvas.getContext('2d');if(!ctx)return;
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  let width=0,height=0,raf=0,launch=0,previous=0,travel=0;
  const particles=Array.from({length:64},(_,i)=>({angle:i/64*Math.PI*2+(Math.random()-.5)*.12,speed:.45+Math.random()*.75,size:1+Math.random()*2}));
  // Small wireframe meshes travel at the same depth speed as the tunnel ribs.
  const meshes=[];
  const cube=[[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]];
  meshes.push({vertices:cube,edges:[[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]]});
  meshes.push({vertices:[[-1,1,-1],[1,1,-1],[1,1,1],[-1,1,1],[0,-1.4,0]],edges:[[0,1],[1,2],[2,3],[3,0],[0,4],[1,4],[2,4],[3,4]]});
  function curvedMesh(sphere){
    const vertices=[],edges=[],segments=16,rows=sphere?7:2;
    for(let j=0;j<rows;j++){
      const latitude=-Math.PI/2+(j+1)*Math.PI/(rows+1);
      const radius=sphere?Math.cos(latitude):.85,y=sphere?Math.sin(latitude):(j?1:-1);
      for(let k=0;k<segments;k++){
        const a=k/segments*Math.PI*2,index=vertices.length;
        vertices.push([radius*Math.cos(a),y,radius*Math.sin(a)]);
        edges.push([index,j*segments+(k+1)%segments]);
        if(j&&(sphere?k%4===0:k%4===0))edges.push([index,index-segments]);
      }
    }
    return {vertices,edges};
  }
  meshes.push(curvedMesh(true),curvedMesh(false));
  const objects=Array.from({length:24},(_,i)=>({mesh:meshes[i%4],depth:i/24,angle:i*2.39996,size:.55+(i*7%11)/10,spin:i*.71}));
  function drawObjects(cx,cy,base){
    objects.map(o=>({...o,z:(o.depth+travel)%1})).sort((a,b)=>a.z-b.z).forEach(o=>{
      const perspective=1/(1-o.z+.08),radius=base*.105*perspective;
      const x=cx+Math.cos(o.angle)*radius,y=cy+Math.sin(o.angle)*radius;
      const size=Math.min(width,height)*.011*o.size*perspective;
      if(x+size<0||x-size>width||y+size<0||y-size>height)return;
      const angle=o.spin+travel*.7,cos=Math.cos(angle),sin=Math.sin(angle);
      const points=o.mesh.vertices.map(([vx,vy,vz])=>{
        const rx=vx*cos+vz*sin,rz=-vx*sin+vz*cos;
        const ry=vy*.92-rz*.39;
        return [x+rx*size,y+ry*size];
      });
      ctx.save();ctx.strokeStyle=o.mesh===meshes[1]?'#519fff':'#67e3ff';
      ctx.globalAlpha=Math.min(.65,o.z*.8+.1);ctx.lineWidth=.7+o.z*.8;
      ctx.shadowColor='#119cff';ctx.shadowBlur=o.z> .55?7:0;
      ctx.beginPath();o.mesh.edges.forEach(([a,b])=>{ctx.moveTo(...points[a]);ctx.lineTo(...points[b]);});ctx.stroke();ctx.restore();
    });
  }
  function resize(){width=innerWidth;height=innerHeight;const dpr=Math.min(devicePixelRatio||1,2);canvas.width=width*dpr;canvas.height=height*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);}
  function draw(now){
    raf=0;if(!welcome.open||document.hidden||welcome.classList.contains('models-ready'))return;
    const dt=Math.min((now-(previous||now))/1000,.05);previous=now;
    const elapsed=launch?(now-launch)/1000:0;
    const rush=Math.max(0,elapsed-1.46);
    travel+=dt*(launch?(.13+rush*2.5):.09);
    ctx.clearRect(0,0,width,height);
    const cx=width*.5,cy=height*.45,base=Math.max(width,height)*.82;
    const glow=ctx.createRadialGradient(cx,cy,0,cx,cy,base*.7);
    glow.addColorStop(0,'#117cbc44');glow.addColorStop(.4,'#07508022');glow.addColorStop(1,'#02071100');
    ctx.fillStyle=glow;ctx.fillRect(0,0,width,height);
    // Octagonal ribs and longitudinal rails share a single vanishing point.
    const ring=(radius)=>Array.from({length:8},(_,i)=>{const a=i*Math.PI/4+Math.PI/8;return [cx+Math.cos(a)*radius,cy+Math.sin(a)*radius];});
    ctx.lineWidth=1;ctx.strokeStyle='#258bcc24';
    ring(base*1.8).forEach(([x,y])=>{ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(x,y);ctx.stroke();});
    for(let i=0;i<16;i++){
      const depth=((i/16+travel)%1);
      const radius=base*.045/(1-depth+.025);
      const points=ring(radius);
      ctx.strokeStyle=`rgba(56,185,255,${.07+depth*.3})`;ctx.lineWidth=1+depth*1.4;
      ctx.beginPath();points.forEach(([x,y],j)=>j?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.stroke();
    }
    drawObjects(cx,cy,base);
    if(rush>0&&rush<1.6){
      const fade=Math.max(0,1-rush/1.6),distance=Math.hypot(width,height)*rush;
      ctx.save();ctx.globalCompositeOperation='lighter';
      ctx.strokeStyle=`rgba(117,232,255,${fade*.7})`;ctx.lineWidth=2+fade*4;
      ctx.beginPath();ctx.arc(cx,cy,50+distance*.7,0,Math.PI*2);ctx.stroke();
      particles.forEach(p=>{
        const r=70+distance*p.speed,tail=Math.max(60,r-30-rush*70);
        ctx.strokeStyle=`rgba(94,213,255,${fade})`;ctx.lineWidth=p.size;
        ctx.beginPath();ctx.moveTo(cx+Math.cos(p.angle)*tail,cy+Math.sin(p.angle)*tail);ctx.lineTo(cx+Math.cos(p.angle)*r,cy+Math.sin(p.angle)*r);ctx.stroke();
      });ctx.restore();
    }
    if(!reduce.matches)raf=requestAnimationFrame(draw);
  }
  function start(){cancelAnimationFrame(raf);previous=0;if(welcome.open&&!document.hidden)raf=requestAnimationFrame(draw);}
  welcome.addEventListener('tunnel-launch',()=>{launch=performance.now();start();});
  welcome.addEventListener('close',()=>{cancelAnimationFrame(raf);raf=0;});
  document.addEventListener('visibilitychange',start);
  window.addEventListener('resize',()=>{resize();if(!raf)start();});
  reduce.addEventListener('change',start);
  resize();start();
})();

const animatedBanner=document.querySelector('.banner-stage');
if(animatedBanner){const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)&&!document.querySelector('.welcome[open]')){animatedBanner.classList.add('is-revealed');observer.disconnect();}},{threshold:.25});observer.observe(animatedBanner);welcome?.addEventListener('close',()=>{observer.unobserve(animatedBanner);observer.observe(animatedBanner);});}
