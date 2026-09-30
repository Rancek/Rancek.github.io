import {createDragonAssembly} from './dragon-assembly.js?v=32';
// Original Studios Conari artwork, presented in the portfolio's blue palette.
const dialog=document.querySelector('.welcome'),host=document.querySelector('.brand-cinematic');
const stage=host.querySelector('.cinematic-stage'),base='./assets/opening-2d/';
let ended=false,raf=0,timeout,assembly,resize=()=>{};
function finish(){if(ended)return;ended=true;cancelAnimationFrame(raf);clearTimeout(timeout);window.removeEventListener('resize',resize);dialog.classList.remove('is-loading');dialog.dispatchEvent(new Event('cinematic-end'));assembly?.dispose();stage.replaceChildren();if(dialog.open)dialog.querySelector('.welcome-start').focus({preventScroll:true});}
dialog.addEventListener('close',finish,{once:true});dialog.addEventListener('cinematic-end',finish,{once:true});
if(dialog.open){host.dataset.started='true';timeout=setTimeout(finish,25000);start().catch(e=>{console.warn('Presentación 2D no disponible',e);finish();});}else finish();
async function start(){
 const names=['estrella','castillo-montana-bosque','investigacion','dragon','arbol','libro','sol-luna','proyeccion'];
 const [traces]=await Promise.all([fetch(base+'contours.json').then(r=>{if(!r.ok)throw Error('Contornos no disponibles');return r.json();}),...['dragon-rosa.webp',...['luna','lineas','studios','conari','base'].map(n=>'w-'+n+'.png')].map(n=>new Promise((resolve,reject)=>{const img=new Image();img.onload=resolve;img.onerror=reject;img.src=base+n;}))]);
 if(ended)return;
 host.classList.add('opening-flat');
 const make=(tag,cls,parent=stage)=>{const el=document.createElement(tag);el.className=cls;parent.append(el);return el;};
 const canvas=make('canvas','flat-stars'),ctx=canvas.getContext('2d'),world=make('div','flat-world');
 const NS='http://www.w3.org/2000/svg';
 function drawing(key,view,parent){const svg=document.createElementNS(NS,'svg');svg.setAttribute('viewBox',view);parent.append(svg);return traces[key].map(d=>{const path=document.createElementNS(NS,'path');path.setAttribute('d',d);svg.append(path);const length=path.getTotalLength();path.style.strokeDasharray=length;path.style.strokeDashoffset=length;return {path,length};});}
 function draw(lines,p){let amount=lines.reduce((n,l)=>n+l.length,0)*clamp(p);for(const l of lines){l.path.style.strokeDashoffset=String(l.length-Math.min(l.length,Math.max(0,amount)));amount-=l.length;}}
 const constellation=document.createElementNS(NS,'svg');constellation.setAttribute('viewBox','0 0 1000 650');constellation.classList.add('flat-constellation');world.append(constellation);
 const icons=names.map(n=>{const el=make('div','flat-symbol',world);const art=make('div','flat-symbol-color',el);art.style.maskImage=art.style.webkitMaskImage=`url('${base}logo-${n}.png')`;return {el,art,lines:drawing('ic-'+n,'0 0 256 256',el)};});
 try{assembly=createDragonAssembly(world);}catch(e){console.warn('Ensamblaje no disponible',e);}
 const dragon=make('div','flat-dragon',world),relief=make('div','dragon-relief',dragon);
 const depths=Array.from({length:6},(_,i)=>{const el=make('div','flat-dragon-sprite dragon-depth',relief);el.style.transform=`translate3d(${(6-i)*.7}px,${(6-i)*.65}px,${i}px)`;return el;});
 const sprite=make('div','flat-dragon-sprite dragon-front',relief);
 const logo=make('div','flat-official-logo',world),parts={};
 for(const name of ['luna','lineas','studios','conari','base']){const el=make('div','flat-logo-piece flat-logo-'+name,logo);el.style.maskImage=el.style.webkitMaskImage=`url('${base}w-${name}.png')`;parts[name]=el;}
 const wave=make('div','flat-magic-wave',world);
 const stars=Array.from({length:100},()=>({x:Math.random(),y:Math.random(),r:.4+Math.random()*1.2,p:Math.random()*6}));
 let w,h,scale,rx,ry;resize=()=>{w=host.clientWidth;h=host.clientHeight;const portrait=w<h;scale=Math.min(w/(portrait?650:1060),(h-130)/700);world.style.transform=`translate(-50%,-50%) scale(${scale})`;rx=portrait?245:410;ry=portrait?255:220;const points=icons.map((o,i)=>{const a=-Math.PI/2+i*Math.PI/4;return [500+Math.cos(a)*rx,325+Math.sin(a)*ry];});constellation.replaceChildren();points.forEach((p,i)=>{icons[i].x=p[0];icons[i].y=p[1];const line=document.createElementNS(NS,'line');const q=points[(i+1)%8];for(const [k,v] of Object.entries({x1:p[0],y1:p[1],x2:q[0],y2:q[1],pathLength:1}))line.setAttribute(k,v);constellation.append(line);});const dpr=Math.min(devicePixelRatio,1.5);canvas.width=w*dpr;canvas.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);};resize();window.addEventListener('resize',resize);
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const query=new URLSearchParams(location.search).get('cinematic-frame'),preview=query===null?null:Math.max(0,Math.min(15,Number(query)||0));if(preview!==null)clearTimeout(timeout);
 const status=host.querySelector('.cinematic-status'),progress=host.querySelector('.cinematic-progress i');let elapsed=0,previous=performance.now(),phase=-1;
 function clamp(n){return Math.max(0,Math.min(1,n));}function smooth(n){n=clamp(n);return n*n*(3-2*n);}
 function frame(now){if(ended)return;const dt=Math.min((now-previous)/1000,.1);previous=now;if(!document.hidden)elapsed+=dt;const t=reduced?14:preview??elapsed;
  const next=t<6?0:t<8.5?1:t<12?2:3;if(next!==phase){phase=next;status.textContent=['Cada universo comienza con una idea.','Construyendo una nueva dimensión.','La imaginación cobra vida.','Studios Conari'][phase];host.dataset.phase=String(phase);}
  ctx.clearRect(0,0,w,h);for(const s of stars){ctx.fillStyle=`rgba(129,214,255,${.25+.45*Math.abs(Math.sin(t*.4+s.p))})`;ctx.beginPath();ctx.arc(s.x*w,s.y*h,s.r,0,Math.PI*2);ctx.fill();}
  icons.forEach((o,i)=>{const appear=clamp((t-.3-i*.65)/.65),gather=smooth((t-10.25-i*.07)/.8);o.el.style.opacity=appear*(1-gather);o.el.style.transform=`translate(${o.x+(500-o.x)*gather}px,${o.y+(220-o.y)*gather}px) translate(-50%,-50%) scale(${1-gather*.8})`;draw(o.lines,appear);o.art.style.opacity=smooth((t-8.3)/.5);});
  Array.from(constellation.children).forEach((l,i)=>{l.style.strokeDashoffset=1-clamp((t-.8-i*.65)/.5);});constellation.style.opacity=1-smooth((t-10.2)/1);
  assembly?.update(t);
  const impact=t-8.1;wave.style.opacity=impact>0&&impact<1.2?1-impact/1.2:0;wave.style.transform=`translate(-50%,-50%) scale(${Math.max(.01,impact*5)})`;
  let x=500,y=325,size=1,flip=1;
  if(t>=9&&t<11.6){const a=(t-9)/2.6*Math.PI*2;x=500+Math.sin(a)*rx;y=325-Math.sin(a/2)*ry;size=.75;flip=Math.cos(a)>0?-1:1;}
  if(t>=11.6){const p=clamp((t-11.6)/1.65);x=1020-p*1250;y=370-p*30;size=.75;flip=1;}
  dragon.style.opacity=t>=8.05&&t<13.3?smooth((t-8.05)/.6):0;dragon.style.transform=`translate(${x}px,${y}px) translate(-50%,-50%) scale(${size})`;relief.style.transform=`scaleX(${flip})`;const spriteFrame=t<8.7?0:Math.floor(t*14)%9;[sprite,...depths].forEach(el=>el.style.backgroundPosition=`${spriteFrame/8*100}% 0`);
  // Use the original layered wordmark: its shapes and proportions are never redrawn.
  logo.style.opacity=smooth((t-10.6)/.6);parts.luna.style.opacity=smooth((t-10.6)/.7);parts.base.style.opacity=smooth((t-12.7)/.5);
  const reveal=100*(1-clamp((t-11.6)/1.65));['lineas','studios','conari'].forEach(n=>parts[n].style.clipPath=`inset(0 0 0 ${reveal}%)`);
  host.style.setProperty('--film-fade',1-smooth((t-15)/.8));progress.style.transform=`scaleX(${clamp(t/15.8)})`;
  if((reduced&&elapsed>1.6)||(!reduced&&preview===null&&t>=15.8)){finish();return;}raf=requestAnimationFrame(frame);
 }raf=requestAnimationFrame(frame);
}
