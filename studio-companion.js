const studioTabs=[...document.querySelectorAll('.studio-tablist [role="tab"]')];
function selectStudioTab(index){studioTabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1;document.getElementById(tab.getAttribute('aria-controls')).hidden=i!==index;});}
studioTabs.forEach((tab,i)=>{tab.addEventListener('click',()=>selectStudioTab(i));tab.addEventListener('keydown',e=>{let next;if(e.key==='ArrowRight')next=(i+1)%studioTabs.length;if(e.key==='ArrowLeft')next=(i+studioTabs.length-1)%studioTabs.length;if(e.key==='Home')next=0;if(e.key==='End')next=studioTabs.length-1;if(next!==undefined){e.preventDefault();selectStudioTab(next);studioTabs[next].focus();}});});
const companion=document.querySelector('.scroll-companion'),welcomeDialog=document.querySelector('.welcome');
const motion=matchMedia('(prefers-reduced-motion: reduce)');let previousScroll=scrollY,stopTimer,scrollFrame;
function refreshCompanion(){scrollFrame=0;const delta=scrollY-previousScroll;previousScroll=scrollY;companion.classList.toggle('visible',!welcomeDialog.open);if(motion.matches)return;if(Math.abs(delta)>1){companion.dataset.direction=delta>0?'down':'up';companion.style.setProperty('--travel',delta>0?'26px':'-26px');clearTimeout(stopTimer);stopTimer=setTimeout(()=>{companion.dataset.direction='idle';companion.style.setProperty('--travel','0px');},180);}}
addEventListener('scroll',()=>{if(!scrollFrame)scrollFrame=requestAnimationFrame(refreshCompanion);},{passive:true});welcomeDialog.addEventListener('close',refreshCompanion);refreshCompanion();

