import * as T from './assets/vendor/three.module.js';

// An independent opening film. The portal remains a separate, unchanged scene.
const dialog=document.querySelector('.welcome'), host=document.querySelector('.brand-cinematic');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let renderer,raf,ended=false,cleanup=()=>{},fallback;
function finish(){
  if(ended)return;ended=true;cancelAnimationFrame(raf);clearTimeout(fallback);cleanup();
  dialog.classList.remove('is-loading');
  dialog.dispatchEvent(new Event('cinematic-end'));
  if(dialog.open)dialog.querySelector('.welcome-start').focus({preventScroll:true});
}
dialog.addEventListener('cinematic-end',finish,{once:true});
dialog.addEventListener('close',finish,{once:true});
if(dialog.open){host.dataset.started='true';fallback=setTimeout(finish,22000);start().catch(e=>{console.warn('Presentación no disponible',e);finish();});}
else finish();

async function start(){
  if(reduced.matches){host.classList.add('show-brand');setTimeout(finish,1800);return;}
  renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.outputColorSpace=T.SRGBColorSpace;
  renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.35;
  host.querySelector('.cinematic-stage').append(renderer.domElement);
  cleanup=()=>{renderer.dispose();renderer.domElement.remove();};
  const scene=new T.Scene(),camera=new T.PerspectiveCamera(40,1,.1,100);camera.position.z=21;
  scene.add(new T.HemisphereLight(0xc3ecff,0x08203e,2.5));
  const key=new T.DirectionalLight(0xe0faff,4);key.position.set(-4,5,8);scene.add(key);
  const rim=new T.PointLight(0x008cff,100,35);rim.position.set(5,2,3);scene.add(rim);
  const impactLight=new T.PointLight(0x80efff,0,30);impactLight.position.set(0,0,5);scene.add(impactLight);
  const metal=(color,roughness=.3,metalness=.65)=>new T.MeshStandardMaterial({color,roughness,metalness});
  const gold=metal(0xe5b65d),blue=metal(0x147dcc),navy=metal(0x072a50),ivory=metal(0xa5eaff,.3,.4);
  const glow=new T.MeshBasicMaterial({color:0x80efff});
  const add=(g,geo,mat,pos=[0,0,0],scale=[1,1,1])=>{const m=new T.Mesh(geo,mat);m.position.set(...pos);m.scale.set(...scale);g.add(m);return m;};
  const orb=(g,pos,r,mat=blue,scale=[1,1,1])=>add(g,new T.SphereGeometry(r,24,16),mat,pos,scale);
  const box=(g,pos,size,mat=blue)=>add(g,new T.BoxGeometry(...size),mat,pos);
  function rod(g,a,b,r=.035,mat=gold){const av=new T.Vector3(...a),bv=new T.Vector3(...b),d=bv.clone().sub(av);const m=add(g,new T.CylinderGeometry(r,r,d.length(),8),mat,av.add(bv).multiplyScalar(.5).toArray());m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());return m;}
  function tube(g,points,r=.035,mat=gold){return add(g,new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),48,r,8,false),mat);}
  function ring(g,r,mat=gold,z=0){return add(g,new T.TorusGeometry(r,.026,8,72),mat,[0,0,z]);}
  function spike(g,a,b,r=.12,mat=gold){const av=new T.Vector3(...a),bv=new T.Vector3(...b),d=bv.clone().sub(av);const m=add(g,new T.ConeGeometry(r,d.length(),10),mat,av.add(bv).multiplyScalar(.5).toArray());m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());}
  function relief(g,pts,depth,mat){const s=new T.Shape();pts.forEach((p,i)=>i?s.lineTo(...p):s.moveTo(...p));s.closePath();return add(g,new T.ExtrudeGeometry(s,{depth,steps:1,bevelEnabled:true,bevelThickness:.018,bevelSize:.018,bevelSegments:2}),mat);}

  function compass(){const g=new T.Group();ring(g,.55);ring(g,.68);orb(g,[0,0,.08],.17,blue);for(let i=0;i<8;i++){let a=i*Math.PI/4;spike(g,[Math.cos(a)*.13,Math.sin(a)*.13,.05],[Math.cos(a)*.86,Math.sin(a)*.86,.05],i%2?.065:.1);}return g;}
  function castle(){const g=new T.Group();box(g,[0,-.25,0],[1.25,.75,.35],navy);[-.55,0,.55].forEach((x,i)=>{const h=i===1?1.05:.7;box(g,[x,h/2-.25,0],[.3,h,.38],blue);add(g,new T.ConeGeometry(.27,.42,4),gold,[x,h-.05,0]).rotation.y=Math.PI/4;box(g,[x,h/2-.1,.205],[.07,.2,.015],glow);});box(g,[0,-.43,.22],[.22,.38,.04],gold);return g;}
  function glass(){const g=compass();g.scale.setScalar(.8);rod(g,[.4,-.4,0],[1,-1,0],.09,navy);rod(g,[.52,-.52,.03],[.92,-.92,.03],.035,gold);return g;}
  function tree(){const g=new T.Group();tube(g,[[0,-.75,0],[-.05,-.3,0],[.04,.15,0],[0,.8,0]],.065,gold);for(let i=0;i<10;i++){const y=-.2+(i%5)*.18,sgn=i<5?-1:1;const x=sgn*(.6-(i%5)*.075);tube(g,[[0,y,0],[x*.4,y+.08,.02],[x,y+.32,.01]],.02,gold);orb(g,[x,y+.36,.04],.12,blue,[.7,1.3,.5]);}for(let i=0;i<5;i++)tube(g,[[0,-.55,0],[(i-2)*.13,-.75,0],[(i-2)*.24,-.92,.04]],.022);return g;}
  function book(){const g=new T.Group();for(const side of [-1,1]){const half=new T.Group();g.add(half);half.rotation.y=side*.22;box(half,[side*.4,0,0],[.78,.9,.13],ivory);box(half,[side*.4,0,-.1],[.86,.99,.06],navy);for(let j=0;j<5;j++)rod(half,[side*.12,.3-j*.14,.08],[side*.66,.3-j*.14,.08],.01,gold);}rod(g,[0,-.52,0],[0,.52,0],.06,gold);return g;}
  function sky(){const g=new T.Group();orb(g,[-.35,0,0],.3,gold);for(let i=0;i<12;i++){let a=i*Math.PI/6;spike(g,[-.35+Math.cos(a)*.36,Math.sin(a)*.36,0],[-.35+Math.cos(a)*.55,Math.sin(a)*.55,0],.045);}tube(g,[[.72,.48,0],[.28,.45,0],[.12,0,0],[.28,-.45,0],[.72,-.48,0],[.46,-.19,0],[.46,.19,0],[.72,.48,0]],.065,ivory);return g;}
  function nodes(){const g=new T.Group(),pts=[[-.6,.35,0],[0,.75,0],[.5,.1,0],[-.1,-.6,0]];pts.forEach((p,i)=>{orb(g,p,.095,ivory);rod(g,p,pts[(i+1)%4],.027);});for(let i=0;i<3;i++){const r=ring(g,.35,blue);r.scale.y=.35;r.position.set(.45,-.45-i*.15,.05);}return g;}

  // Sculptural dragon: curved neck and tail, plated belly, talons and articulated wings.
  function dragon(){const g=new T.Group();
    orb(g,[0,-.15,0],.58,blue,[.82,1.35,.72]);orb(g,[.08,-.18,.31],.46,ivory,[.7,1.4,.5]);
    for(let i=0;i<7;i++)tube(g,[[-.25,.35-i*.16,.48],[0,.4-i*.16,.57],[.28,.35-i*.16,.47]],.025,gold);
    tube(g,[[0,.35,0],[-.25,.78,0],[-.42,1.12,.04],[-.18,1.5,.06]],.24,blue);
    const head=new T.Group();head.position.set(-.2,1.42,.03);g.add(head);
    orb(head,[0,.05,0],.37,blue,[1.05,.85,.82]);orb(head,[-.31,-.03,.12],.27,blue,[1.25,.58,.92]);
    orb(head,[-.31,-.18,.1],.23,navy,[1.1,.35,.8]);
    for(const z of [-.22,.26]){orb(head,[-.08,.12,z],.087,gold,[1,.7,.4]);orb(head,[-.1,.12,z+.025],.035,glow);spike(head,[.13,.25,z],[.35,.8,z-.08],.12,ivory);spike(head,[.25,.05,z],[.65,.34,z],.12,blue);}
    for(let i=0;i<4;i++)spike(head,[-.5+i*.13,-.08,.28],[-.5+i*.13,-.21,.28],.028,ivory);
    tube(g,[[.03,-.7,0],[.5,-1.25,-.05],[1.35,-1.23,-.05],[1.7,-.7,0],[1.4,-.36,.05]],.12,blue);
    spike(g,[1.5,-.5,0],[1.36,-.23,0],.15,gold);
    for(let i=0;i<9;i++){const y=-.55+i*.19;spike(g,[.15,y,-.26],[.35,y+.08,-.53],.09,gold);}
    for(const side of [-1,1]){
      tube(g,[[side*.34,-.42,0],[side*.56,-.73,.07],[side*.5,-1.04,.3]],.14,blue);
      orb(g,[side*.5,-1.05,.32],.18,blue,[1.2,.5,1.2]);
      for(let j=0;j<3;j++)spike(g,[side*.5+(j-1)*.095,-1.07,.4],[side*.5+(j-1)*.1,-1.12,.65],.042,ivory);
      tube(g,[[side*.3,.3,.02],[side*.65,.13,.15],[side*.66,-.12,.32]],.09,blue);
      for(let j=0;j<3;j++)spike(g,[side*.64+(j-1)*.06,-.1,.3],[side*.66+(j-1)*.08,-.3,.4],.027,gold);
      for(let row=0;row<8;row++)for(let col=0;col<4;col++)orb(g,[side*(.3+col*.05),.45-row*.14,.28-col*.08],.035,blue,[1,1.3,.4]);
    }
    const wings=[];
    for(const side of [-1,1]){const w=new T.Group();w.position.set(side*.28,.38,-.12);g.add(w);w.scale.x=side;
      relief(w,[[0,0],[.72,1.38],[2.12,1.03],[1.72,.7],[1.48,.08],[1.13,.3],[.8,-.34],[.4,-.12]],.035,navy);
      [[.72,1.38],[2.12,1.03],[1.48,.08],[.8,-.34]].forEach(p=>rod(w,[0,0,.06],[...p,.06],.035,blue));
      tube(w,[[0,0,.06],[.72,1.38,.06],[2.12,1.03,.06]],.055,gold);
      for(let j=0;j<6;j++)tube(w,[[.25+j*.12,.35+j*.15,.055],[.7+j*.12,.2+j*.09,.055],[.85+j*.13,.02+j*.12,.055]],.009,blue);
      wings.push(w);
    }
    g.userData.wings=wings;return g;
  }
  const hero=dragon(),heroRoot=new T.Group();heroRoot.add(hero);scene.add(heroRoot);heroRoot.position.y=.25;heroRoot.visible=false;
  const sketch=new T.Group();hero.updateMatrixWorld(true);
  // Authored contour drawing, rather than displaying the model's polygon wireframe.
  const contours=[
    [[-.2,1.76],[-.43,1.67],[-.52,1.51],[-.76,1.46],[-.79,1.32],[-.54,1.25],[-.39,1.3],[-.31,1.05],[-.16,.7],[-.28,.46],[-.45,.1],[-.42,-.42],[-.23,-.76],[.15,-.83],[.43,-.52],[.48,-.07],[.29,.47],[.03,.73],[-.13,1.03],[.12,1.23],[.26,1.52],[.14,1.73]],
    [[-.12,1.71],[-.03,2.19],[.16,1.73]],[[.09,1.67],[.39,2.13],[.29,1.58]],
    [[.23,1.58],[.56,1.82],[.36,1.41]],[[.29,1.4],[.59,1.52],[.34,1.28]],
    [[-.46,1.56],[-.28,1.6],[-.19,1.5],[-.34,1.47],[-.46,1.56]],
    [[-.68,1.34],[-.48,1.29],[-.3,1.33]],
    [[-.53,1.32],[-.5,1.23],[-.46,1.31]],
    [[.12,-.79],[.55,-1.24],[1.29,-1.28],[1.66,-.94],[1.7,-.64],[1.46,-.35]],
    [[.26,-.65],[.65,-1.04],[1.22,-1.08],[1.48,-.86],[1.51,-.65],[1.4,-.42]],
    [[1.41,-.48],[1.33,-.22],[1.59,-.43]],
    [[-.32,-.38],[-.58,-.65],[-.67,-.96],[-.47,-1.12],[-.28,-1.07],[-.28,-.92]],
    [[.33,-.42],[.59,-.68],[.67,-.98],[.48,-1.13],[.28,-1.06],[.28,-.91]],
    [[-.31,.32],[-.67,.16],[-.7,-.15],[-.58,-.23],[-.49,.07]],
    [[.31,.32],[.67,.16],[.7,-.15],[.58,-.23],[.49,.07]]
  ];
  for(const side of [-1,1]){
    contours.push([[side*.3,.4],[side*.98,1.75],[side*2.4,1.41],[side*1.98,1.03],[side*1.77,.48],[side*1.4,.66],[side*1.1,.03],[side*.65,.23],[side*.3,.4]]);
    [[.98,1.75],[2.4,1.41],[1.77,.48],[1.1,.03]].forEach(p=>contours.push([[side*.3,.4],[side*p[0],p[1]]]));
  }
  for(let i=0;i<7;i++)contours.push([[-.24,.35-i*.16],[.02,.39-i*.16],[.27,.35-i*.16]]);
  contours.forEach(points=>{const curve=new T.CatmullRomCurve3(points.map(([x,y])=>new T.Vector3(x,y,0)),false,'centripetal',.15);sketch.add(new T.Line(new T.BufferGeometry().setFromPoints(curve.getPoints(points.length*7)),new T.LineBasicMaterial({color:0x65d8ff,transparent:true,opacity:.8})));});
  sketch.scale.z=.01;sketch.position.y=.25;scene.add(sketch);
  const symbols=[compass(),castle(),glass(),dragon(),tree(),book(),sky(),nodes()];
  const frames=new T.Group();scene.add(frames);symbols.forEach((g,i)=>{if(i===3)g.scale.setScalar(.35);const pivot=new T.Group();pivot.add(g);pivot.userData.base=i===3?.7:1;frames.add(pivot);});
  const lines=new T.LineLoop(new T.BufferGeometry(),new T.LineBasicMaterial({color:0x399dc1,transparent:true,opacity:.25}));scene.add(lines);
  let width,height,rx,ry;
  function resize(){width=host.clientWidth;height=host.clientHeight;renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();const half=21*Math.tan(T.MathUtils.degToRad(20));rx=Math.min(9,half*camera.aspect*.8);ry=half*.61;const small=width<650;heroRoot.scale.setScalar(small?.61:1.15);sketch.scale.set(small?.61:1.15,small?.61:1.15,.01);const pts=[];frames.children.forEach((g,i)=>{let a=Math.PI/2-i*Math.PI/4;g.position.set(Math.cos(a)*rx,Math.sin(a)*ry,0);g.userData.size=small?.55:.85;pts.push(g.position.clone());});lines.geometry.dispose();lines.geometry=new T.BufferGeometry().setFromPoints(pts);}
  const staff=new T.Group();scene.add(staff);staff.visible=false;
  const texture=await new T.TextureLoader().loadAsync('./assets/rancek-staff-3d.png').catch(()=>null);
  if(ended){texture?.dispose();renderer.dispose();return;}
  if(texture){texture.colorSpace=T.SRGBColorSpace;const ratio=texture.image.width/texture.image.height;
    // A faithfully rendered image relief; discrete depth layers retain the reference lettering.
    for(let i=4;i>=0;i--){const mat=new T.MeshStandardMaterial({map:texture,transparent:true,alphaTest:.15,metalness:.25,roughness:.32,color:i?0x796126:0xffffff,side:T.DoubleSide});const m=add(staff,new T.PlaneGeometry(7.8*ratio,7.8),mat,[i*.009,0,-i*.035]);m.renderOrder=5-i;}
  }else{rod(staff,[0,-3.7,0],[0,2.5,0],.08,navy);const crown=compass();crown.position.y=2.7;staff.add(crown);spike(staff,[0,-3.6,0],[0,-4,0],.16);}
  const stars=new T.BufferGeometry(),starPos=[];for(let i=0;i<380;i++)starPos.push((Math.random()-.5)*45,(Math.random()-.5)*26,-5-Math.random()*12);stars.setAttribute('position',new T.Float32BufferAttribute(starPos,3));const dust=new T.Points(stars,new T.PointsMaterial({color:0x69caff,size:.04,transparent:true,opacity:.7}));scene.add(dust);
  const burst=new T.Group();scene.add(burst);const directions=[];for(let i=0;i<100;i++){orb(burst,[0,0,0],.02,i%3?glow:gold);const a=Math.random()*Math.PI*2;directions.push(new T.Vector3(Math.cos(a),Math.sin(a),(Math.random()-.5)*.6).multiplyScalar(3+Math.random()*7));}burst.visible=false;
  const wave=add(scene,new T.TorusGeometry(.7,.006,6,96),new T.MeshBasicMaterial({color:0x80efff,transparent:true,opacity:1}),[0,0,1]);wave.visible=false;
  const trailGeo=new T.BufferGeometry(),trailMat=new T.LineBasicMaterial({color:0x67e5ff,transparent:true,opacity:.7}),trail=new T.Line(trailGeo,trailMat);scene.add(trail);const trailPoints=[];
  const mark=compass();mark.position.set(0,2.35,0);mark.scale.setScalar(.8);mark.visible=false;scene.add(mark);
  const status=host.querySelector('.cinematic-status'),progress=host.querySelector('.cinematic-progress i');
  const previewValue=new URLSearchParams(location.search).get('cinematic-frame');
  const preview=previewValue!==null?Math.max(0,Math.min(15,Number(previewValue)||0)):null;
  if(preview!==null)clearTimeout(fallback);
  let previous=performance.now(),elapsed=0,phase=-1;
  function draw(now){if(ended)return;const dt=Math.min((now-previous)/1000,.08);previous=now;if(!document.hidden)elapsed+=dt;const t=preview??elapsed;
    const labels=['Cada universo comienza con una idea.','El arte despierta.','De la imaginación a una nueva dimensión.','Studios Conari'];
    const next=t<5.5?0:t<7.5?1:t<11?2:3;if(next!==phase){phase=next;status.textContent=labels[phase];host.dataset.phase=String(phase);}
    progress.style.transform=`scaleX(${Math.min(1,t/16)})`;
    frames.children.forEach((g,i)=>{const p=T.MathUtils.clamp((t-i*.5)/.7,0,1),out=1-T.MathUtils.smoothstep(t,10,12);g.visible=p>0&&out>0;g.scale.setScalar(g.userData.size*(1-Math.pow(1-p,3))*Math.max(.001,out));g.rotation.y=(1-p)*1.2+Math.sin(t*.6+i)*.14;g.position.z=(1-p)*-7;});
    lines.material.opacity=Math.min(.3,t*.05)*(1-T.MathUtils.smoothstep(t,10,12));
    sketch.visible=t<7.6;sketch.children.forEach(e=>{e.material.opacity=T.MathUtils.smoothstep(t,1.6,3.7)*.75*(1-T.MathUtils.smoothstep(t,7,7.6));e.geometry.setDrawRange(0,Math.floor(T.MathUtils.smoothstep(t,1.2,4)*e.geometry.attributes.position.count/2)*2);});
    staff.visible=t>=5&&t<8.1;const enter=T.MathUtils.smoothstep(t,5,6.2),strike=T.MathUtils.smoothstep(t,6.35,7);
    // Tip converges on the center at impact; the crown stays fully visible during the approach.
    staff.position.set((1-enter)*7+(1-strike)*2, (1-enter)*5+3.2-strike*.1,2);
    staff.rotation.z=-.6*(1-strike);staff.rotation.y=Math.sin(t)*.07;staff.scale.setScalar(width<650?.63:.84);
    if(width<650)staff.position.y*=.7;
    if(t>7)staff.position.x+=(t-7)*3;
    const impact=t-7;burst.visible=impact>=0&&impact<1.6;wave.visible=burst.visible;impactLight.intensity=impact>=0?Math.max(0,1-impact/1.1)*180:0;
    if(burst.visible){burst.children.forEach((p,i)=>{p.position.copy(directions[i]).multiplyScalar(impact);p.scale.setScalar(Math.max(.01,1-impact/1.6));});wave.scale.setScalar(1+impact*9);wave.material.opacity=Math.max(0,1-impact/1.6);}
    heroRoot.visible=t>=7.05&&t<12.7;const reveal=T.MathUtils.smoothstep(t,7.05,8.1);hero.scale.setScalar(Math.max(.001,reveal));hero.rotation.y=-.3+Math.sin(t*.8)*.18;
    hero.userData.wings.forEach((w,i)=>{w.rotation.y=(i?1:-1)*Math.sin(t*5)*.48;});
    if(t>=8.7){const u=(t-8.7)/3.7,a=u*Math.PI*1.5;heroRoot.position.set(Math.sin(a)*rx*.53,.25+Math.sin(u*Math.PI)*2.1,Math.sin(u*Math.PI)*2);heroRoot.rotation.z=-Math.cos(a)*.18;hero.rotation.y=-.3+Math.sin(a)*.6;if(u>.7){heroRoot.position.x+=(u-.7)*rx*5;heroRoot.position.y+=(u-.7)*8;}trailPoints.push(heroRoot.position.clone());if(trailPoints.length>70)trailPoints.shift();trailGeo.setFromPoints(trailPoints);}
    trail.visible=t>8.7&&t<13;trailMat.opacity=Math.max(0,.65-(t-11)*.3);
    if(t>=11){host.classList.add('show-brand');mark.visible=true;mark.rotation.y=Math.sin(t*.7)*.1;mark.scale.setScalar(T.MathUtils.smoothstep(t,11,12)*.8);}
    host.style.setProperty('--film-fade',String(1-T.MathUtils.smoothstep(t,15,16)));dust.rotation.z=t*.008;
    renderer.render(scene,camera);if(t>=16){finish();return;}raf=requestAnimationFrame(draw);
  }
  cleanup=()=>{window.removeEventListener('resize',resize);const geometries=new Set(),materials=new Set();scene.traverse(m=>{if(m.geometry)geometries.add(m.geometry);if(m.material)(Array.isArray(m.material)?m.material:[m.material]).forEach(x=>materials.add(x));});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());texture?.dispose();renderer.dispose();renderer.domElement.remove();};
  resize();window.addEventListener('resize',resize);raf=requestAnimationFrame(draw);
}
