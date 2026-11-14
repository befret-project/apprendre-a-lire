// Nouveaux jeux (Complète, Compter, Ombres, Labyrinthe) + album d'autocollants, aux deux niveaux
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();
for(const level of [1,2]){
const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript((level)=>{window.__played=[];
  localStorage.setItem('lire_profils',JSON.stringify([{id:'a',name:'Léa',avatar:'🐰',stars:3,level}]));localStorage.setItem('lire_actif','a');
  HTMLMediaElement.prototype.play=function(){const k=Object.keys(window.SONS||{}).find(k=>window.SONS[k]===this.src);window.__played.push(k||'??');setTimeout(()=>this.onended&&this.onended(),20);return Promise.resolve();};HTMLMediaElement.prototype.pause=function(){};},level);
await p.goto(process.env.APP_URL||'http://localhost:8766/index.html');const W=ms=>p.waitForTimeout(ms);
const enter=async(sec,g)=>{await p.evaluate(()=>{document.getElementById('homeBtn').click();});await W(550);await p.evaluate(()=>{document.getElementById('homeBtn').click();});await W(550);await p.evaluate(()=>{document.getElementById('sticker').classList.remove('on');});await p.click('[data-go='+sec+']');await W(550);await p.click('[data-go='+g+']');await W(400);};
const closeSticker=()=>p.evaluate(()=>document.getElementById('sticker').classList.remove('on'));
async function brute(sel,rounds,wait=1500){for(let r=0;r<rounds;r++){await closeSticker();for(const c of await p.$$(sel)){const cl=await c.getAttribute('class');if(/gone|used/.test(cl))continue;await closeSticker();await c.click({force:true});await W(260);if((await c.getAttribute('class')).includes('good'))break;}await W(wait);}}
console.log('--- niveau',level);
await enter('lire','complete');const ex=await p.textContent('#cWord');await brute('#cChoices .choice',5,2200);console.log('complète ex.',ex,'| fin:',await p.$eval('#bravo',e=>e.className.includes('end')));
await enter('logique','compter');const heap=await p.$$eval('#hHeap span',x=>x.length);const nums=await p.$$eval('#hChoices .choice',x=>x.map(e=>e.textContent).join(','));
await brute('#hChoices .choice',5);console.log('compter ex.',heap,'objets, choix',nums,'| fin:',await p.$eval('#bravo',e=>e.className.includes('end')));
await enter('logique','ombres');const sh=await p.$eval('#oShadow',e=>getComputedStyle(e).filter);await brute('#oChoices .choice',5);console.log('ombres filtre:',sh,'| fin:',await p.$eval('#bravo',e=>e.className.includes('end')));
// labyrinthe : on calcule le chemin (BFS) puis on touche les cases une par une ; un essai interdit d'abord
await enter('logique','laby');
for(let r=0;r<3;r++){await closeSticker();
  const info=await p.evaluate(()=>{const cells=[...document.querySelectorAll('#lMaze .mz')];const n=Math.round(Math.sqrt(cells.length));return {n,o:cells.map(c=>c.dataset.o),pos:cells.findIndex(c=>c.textContent==='🐰'),goal:cells.findIndex(c=>c.textContent==='⭐')};});
  const D={N:-info.n,S:info.n,E:1,O:-1};const prev=new Array(info.n*info.n).fill(-1),q=[info.pos];prev[info.pos]=info.pos;
  while(q.length){const c=q.shift();for(const k of info.o[c]){const nx=c+D[k];if(prev[nx]<0){prev[nx]=c;q.push(nx);}}}
  const path=[];for(let c=info.goal;c!==info.pos;c=prev[c])path.unshift(c);
  // contrôle : toutes les salles sont reliées (labyrinthe parfait) et les murs sont symétriques
  const all=prev.every(v=>v>=0);const sym=info.o.every((o,c)=>[...o].every(k=>{const opp={N:'S',S:'N',E:'O',O:'E'}[k];return info.o[c+D[k]].includes(opp);}));
  if(!all||!sym) errs.push('labyrinthe incohérent');
  if(r===0){const wallDir=['S','E'].find(k=>!info.o[info.pos].includes(k));if(wallDir){await p.click(`#lMaze .mz >> nth=${info.pos+D[wallDir]}`,{force:true});await W(200);}}
  for(const c of path){await closeSticker();await p.click(`#lMaze .mz >> nth=${c}`,{force:true});await W(90);}
  if(r===0){console.log('labyrinthe',info.n+'x'+info.n,'chemin de',path.length,'cases | toutes salles reliées:',all,'| murs cohérents:',sym);await p.screenshot({path:'/tmp/laby.png'});}
  await W(1600);}
console.log('labyrinthe fin:',await p.$eval('#bravo',e=>e.className.includes('end')));
const st=await p.evaluate(()=>document.getElementById('stars').textContent);
await p.evaluate(()=>{document.getElementById('bravo').classList.remove('on','end');document.getElementById('sticker').classList.remove('on');document.getElementById('homeBtn').click();});await W(500);
await p.evaluate(()=>{document.getElementById('homeBtn').click();});await W(500);
console.log('étoiles',st,'| accueil:',await p.textContent('#albumInfo'));
await p.click('[data-go=album]');await W(400);
console.log('album:',await p.textContent('#albumSub'),'| débloqués:',await p.$$eval('#albumGrid .stk:not(.locked)',x=>x.map(e=>e.textContent).join('')));
const pl=await p.evaluate(()=>window.__played);console.log('autocollants annoncés:',pl.filter(k=>k==='p_autocollant').length,'| sons inconnus:',pl.filter(k=>k==='??').length,'/',pl.length);
console.log('errors',JSON.stringify(errs));await p.close();}
await b.close();})();
