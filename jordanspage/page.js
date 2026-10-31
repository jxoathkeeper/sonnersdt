// quit looking.
(() => {
'use strict';
const $=id=>document.getElementById(id);
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const once=(target,evt)=>new Promise(r=>target.addEventListener(evt,r,{once:true}));
const open=$('opening'),archive=$('archive'),depths=$('depths'),output=$('opening-text'),choice=$('choice'),soul=$('soul'),hint=$('hint');
const audio={
  drone:new Audio('../assets/fornic/music/drone.mp3'),
  appearance:new Audio('../assets/fornic/sounds/AUDIO_APPEARANCE.wav'),
  piano:new Audio('../assets/fornic/music/piano.mp3'),
  him:new Audio('../assets/fornic/music/him.ogg')
};
['drone','piano','him'].forEach(k=>{audio[k].loop=true;audio[k].preload='auto';});
audio.appearance.preload='auto';
let phase='ready',selected=null,fast=false,typing=false,skip=false,action=null,autopilot=false;
function play(k){const a=audio[k];try{a.currentTime=0;a.play().catch(()=>{});}catch(_){}}
async function fadeAudio(k,ms=1100){const a=audio[k];if(!a) return;const v=a.volume||1,n=28;for(let i=1;i<=n;i++){a.volume=v*(1-i/n);await wait(ms/n)}a.pause();a.currentTime=0;a.volume=v}
function swap(scene){[open,archive,depths].forEach(s=>s.classList.remove('active'));scene.classList.add('active')}
async function typeInto(el,text,speed=42,append=false){if(!append)el.textContent='';typing=true;skip=false;for(let i=0;i<text.length;i++){el.textContent+=text[i];if(phase==='archive' && i%8===0 && el.parentElement?.id==='archive-lines'){el.scrollIntoView({block:'nearest',behavior:'auto'});}if(skip) continue;await wait(fast?7:speed);}typing=false;skip=false;}
function proceed(){if(typing){skip=true;return}if(action){const a=action;action=null;a()}}
function advance(){return new Promise(resolve=>{action=resolve;hint.classList.add('visible')})}
async function say(el,text,pace=45){await typeInto(el,text,pace);await advance()}
function moveChoice(direction){if(phase!=='choice')return;selected=direction==='left'?'YES':'NO';const target=document.querySelector(`[data-choice="${selected}"]`),r=target.getBoundingClientRect(),parent=choice.getBoundingClientRect();soul.style.left=(r.left-parent.left-26)+'px';}
async function fadeInSoulToAudio(){
  soul.style.opacity='0';
  soul.style.left='50%';
  const a=audio.appearance;
  let duration=1200;
  if(Number.isFinite(a.duration) && a.duration>0) duration=a.duration*1000;
  else {
    try {
      await Promise.race([once(a,'loadedmetadata'),wait(500)]);
      if(Number.isFinite(a.duration) && a.duration>0) duration=a.duration*1000;
    } catch(_) {}
  }
  soul.style.transition=`opacity ${duration}ms linear`;
  play('appearance');
  requestAnimationFrame(()=>{ soul.style.opacity='1'; });
  await wait(duration);
}
async function typeChoiceLabels(){
  const yes=choice.querySelector('[data-choice="YES"]');
  const no=choice.querySelector('[data-choice="NO"]');
  yes.textContent='';
  no.textContent='';
  choice.classList.add('visible');
  const steps=[['Y','N'],['YE','NO'],['YES','NO']];
  typing=true;skip=false;
  for(const [y,n] of steps){
    yes.textContent=y; no.textContent=n;
    if(skip) continue;
    await wait(fast?40:110);
  }
  typing=false;skip=false;
}
function begin(){if(phase!=='ready')return;phase='intro';play('drone');hint.classList.add('visible');intro()}
function enterFullscreen(){if(!document.fullscreenElement && document.documentElement.requestFullscreen){document.documentElement.requestFullscreen().catch(()=>{});}}
async function crossfadeToArchive(){
  phase='archive-transition';
  archive.classList.add('active','crossfade-enter');
  open.classList.add('crossfade-exit');
  void archive.offsetWidth;
  requestAnimationFrame(()=>{
    archive.classList.add('crossfade-on');
    open.classList.add('crossfade-off');
  });
  await wait(1550);
  open.classList.remove('active','crossfade-exit','crossfade-off');
  archive.classList.remove('crossfade-enter','crossfade-on');
}
async function intro(){
  output.textContent='';
  await say(output,'READY?');
  phase='reveal';
  choice.querySelector('[data-choice="YES"]').textContent='';
  choice.querySelector('[data-choice="NO"]').textContent='';
  choice.hidden=false;
  choice.classList.add('visible');
  await fadeInSoulToAudio();
  phase='choice';
  await typeChoiceLabels();
  selected=null;
  soul.style.left='50%';
  action=()=>resolveChoice();
}
async function resolveChoice(){
  if(!selected){action=()=>resolveChoice();return}
  phase='after-choice';
  choice.classList.remove('visible');
  if(selected==='NO'){
    output.textContent='';
    await typeInto(output,'THEN LEAVE.',44);
    await wait(900);
    window.close();
    try{window.location.replace('about:blank')}catch(_){document.body.innerHTML=''}
    return;
  }
  output.textContent='';
  await say(output,'EXCELLENT.');
  await say(output,'ALLOW ME TO SHOW YOU\nTHE PIECES BENEATH.');
  audio.drone.pause();
  await wait(550);
  await crossfadeToArchive();
  runArchive();
}
const chapters=[
 {heading:'AT THE BEGINNING',icon:'thebeginningicon.png',lines:['Where...','Where am I?','Hello...? Anyone...?','Is... is anyone out there...?','Someone!? Anyone!? Can anyone hear me!?','...','It’s dark.','It’s so dark here.','Someone, anyone, if you can hear me...','Say something... please...']},
 {heading:'A CYBER’S WORLD',icon:'acybersworldicon.png',lines:['No one can hear me, can they...?','...','I guess not.',"To be honest, I'm not even sure if I can hear myself.","It’s so quiet here...",'... and yet, sometimes,','I swear I hear something...','Something like... scratching?']}
];
async function typeChapter(chapter){
  const head=$('archive-heading'),lines=$('archive-lines');
  head.textContent=chapter.heading;
  const icon=document.createElement('img');
  icon.src='../assets/jordanspage/'+chapter.icon;
  icon.alt='';
  head.append(icon);
  lines.innerHTML='';
  archive.scrollTop=0;
  for(const line of chapter.lines){
    const p=document.createElement('p');
    lines.appendChild(p);
    await say(p,line,34);
    // Keep the currently typed line visible on compact Safari viewports.
    p.scrollIntoView({block:'nearest',behavior:'auto'});
  }
}
async function runArchive(){
  phase='archive';
  autopilot=false;
  hint.classList.add('visible');
  play('piano');
  await wait(120);
  for(const chapter of chapters){
    await typeChapter(chapter);
  }
  phase='transition';
  $('archive-heading').classList.add('fade');
  $('archive-lines').classList.add('fade');
  await fadeAudio('piano',1600);
  await wait(500);
  runDepths();
}
const ending=['…','I AM\nSURPRISED\nBY YOU.','NIC.','SPIRITUALLY,\nIN MANY WAYS,\nI CAN SENSE IT.','AMONG ALL THE DRIVEL…\nAND POINTLESS NOISE THAT DROWNS OUT THE MAGNETIC CONNECTION BETWEEN\nUS','I SENSE YOUR CURIOSITY.','…','AS I SAID, ONCE BEFORE,\nWE ARE NOT YET SUPPOSED TO MEET.','I SUGGEST\nYOU SEARCH EVERYWHERE\nIN OUR SHARED FIELDS\nFOR CRUMBS.','LIKE THE BILLION STARS THAT LIGHT THE UPPER VOIDS,\nA BILLION CRUMBS WILL CREATE A SUBSTANCE.','EXPLORE THESE SUBSTANCES,','AND I WILL MEET YOU','AT THE END.','I WILL MEET YOU','BENEATH THE ANGEL’S HEAVEN.'];
async function runDepths(){
  phase='depths';
  autopilot=false;
  swap(depths);
  play('him');
  await wait(100);
  $('depths-image').classList.add('visible');
  await wait(1800);
  const el=$('depths-dialogue');
  hint.classList.add('visible');
  for(const line of ending) await say(el,line,62);
  phase='ending';
  hint.classList.remove('visible');
  [open,archive,depths].forEach(scene=>scene.classList.remove('active'));
  depths.style.display='none';
  audio.him.pause();
  await wait(180);
  $('secret-ending').classList.add('visible');
  await wait(6000);
  phase='finished';
  window.close();
  try { window.location.replace('about:blank'); } catch (_) { document.body.innerHTML=''; }
}
document.addEventListener('keydown',e=>{
  const k=e.key.toLowerCase();
  if(['arrowleft','arrowright','arrowup','arrowdown','z','enter','x',' '].includes(k)) e.preventDefault();
  if(phase==='ready'){if(k==='z'||k==='enter'){enterFullscreen();}begin();return}
  if(k==='x'){fast=true;return}
  if(phase==='choice'&&(k==='arrowleft'||k==='arrowup')){moveChoice('left');return}
  if(phase==='choice'&&(k==='arrowright'||k==='arrowdown')){moveChoice('right');return}
  if(k==='z'||k==='enter'||k===' '){
    if(typing){skip=true;return}
    proceed();
  }
});
document.addEventListener('keyup',e=>{if(e.key.toLowerCase()==='x')fast=false});
document.addEventListener('pointerdown',e=>{if(e.target.closest('#mobile-controls, [data-choice]'))return;if(phase==='ready')begin();else proceed()});
document.addEventListener('pointermove',e=>{if(e.pointerType==='touch'||phase!=='choice')return;const t=e.target.closest('[data-choice]');if(t)moveChoice(t.dataset.choice==='YES'?'left':'right')});
document.querySelectorAll('[data-choice]').forEach(el=>el.addEventListener('pointerdown',e=>{e.stopPropagation();if(phase==='choice'){moveChoice(el.dataset.choice==='YES'?'left':'right');proceed()}}));
// On iOS touch is the primary input; the first interaction unlocks WebAudio/HTML audio.
const tap=id=>$(id);
tap('touch-left').addEventListener('click',e=>{e.stopPropagation();moveChoice('left')});
tap('touch-right').addEventListener('click',e=>{e.stopPropagation();moveChoice('right')});
tap('touch-confirm').addEventListener('click',e=>{e.stopPropagation();if(phase==='ready'){enterFullscreen();begin()}else proceed()});
const speedBtn=tap('touch-fast');
for(const event of ['pointerdown','touchstart'])speedBtn.addEventListener(event,e=>{e.stopPropagation();fast=true},{passive:true});
for(const event of ['pointerup','pointercancel','touchend','touchcancel'])speedBtn.addEventListener(event,()=>{fast=false},{passive:true});
speedBtn.addEventListener('click',e=>{e.stopPropagation();if(typing)skip=true});
output.textContent='PRESS Z TO BEGIN';
})();