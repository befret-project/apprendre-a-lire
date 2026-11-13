const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();
for(const level of [1,2]){
const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript((level)=>{window.__played=[];window.__music=0;
  localStorage.setItem('lire_profils',JSON.stringify([{id:'a',name:'Léa',avatar:'🐰',stars:0,level}]));localStorage.setItem('lire_actif','a');
  HTMLMediaElement.prototype.play=function(){const k=Object.keys(window.SONS||{}).find(k=>window.SONS[k]===this.src);window.__played.push(k||'??');setTimeout(()=>this.onended&&this.onended(),20);return Promise.resolve();};HTMLMediaElement.prototype.pause=function(){};
  const O=window.AudioContext;window.AudioContext=function(){const c=new O();const co=c.createOscillator.bind(c);c.createOscillator=function(){window.__music++;return co();};return c;};},level);
await p.goto(process.env.APP_URL||'http://localhost:8766/index.html');const W=ms=>p.waitForTimeout(ms);
const on=()=>p.evaluate(()=>document.querySelector('.screen.on').id);
await p.click('[data-go=lire]');await W(300);const mLire=await p.evaluate(()=>window.__music);
await p.click('#homeBtn');await W(300);await p.click('[data-go=logique]');await W(900);
const mLog=await p.evaluate(()=>window.__music);
console.log(`--- niveau ${level} | musique dans Lire: ${mLire} notes, dans Logique: ${mLog>0?'oui':'NON'} | bouton 🎵 visible: ${await p.$eval('#musBtn',e=>getComputedStyle(e).visibility)}`);
async function brute(sel,goodCheck,rounds,wait=1400){for(let r=0;r<rounds;r++){for(const c of await p.$$(sel)){const cl=await c.getAttribute('class');if(/gone|used/.test(cl))continue;await c.click({force:true});await W(260);if(await goodCheck(c))break;}await W(wait);}}
const isGood=async c=>(await c.getAttribute('class')).includes('good');
// suite
await p.click('[data-go=suite]');await W(300);const seq=await p.textContent('#qSeq');await brute('#qChoices .choice',isGood,5);
console.log('suite  ex.',seq,'| fin:',await p.$eval('#bravo',e=>e.className.includes('end')));
await p.click('#endHome');await W(300);console.log('  🏠 fin ->',await on());
// intrus
await p.click('[data-go=intrus]');await W(300);console.log('intrus ex.',await p.$$eval('#iChoices .choice',x=>x.map(e=>e.textContent).join('')));await brute('#iChoices .choice',isGood,5);
console.log('intrus fin:',await p.$eval('#bravo',e=>e.className.includes('end')));await p.click('#endHome');await W(300);
// memory : on joue en connaissant les cartes
await p.click('[data-go=memory]');await W(300);
for(let r=0;r<3;r++){const n=await p.$$eval('#yBoard .card',x=>x.length);
  const vals=await p.$$eval('#yBoard .card',x=>x.map(e=>e.dataset.e));
  // une erreur volontaire d'abord
  const j=vals.findIndex(v=>v!==vals[0]);await p.click('#yBoard .card >> nth=0',{force:true});await W(200);await p.click(`#yBoard .card >> nth=${j}`,{force:true});await W(1150);
  const done=new Set();for(let i=0;i<n;i++){if(done.has(i))continue;const k=vals.findIndex((v,x)=>x!==i&&v===vals[i]);done.add(i);done.add(k);
    await p.click(`#yBoard .card >> nth=${i}`,{force:true});await W(180);await p.click(`#yBoard .card >> nth=${k}`,{force:true});await W(450);}
  if(r===0) console.log('memory cartes:',n);await W(1500);}
console.log('memory fin:',await p.$eval('#bravo',e=>e.className.includes('end')));await p.click('#endHome');await W(300);
// sudoku : on essaie les images jusqu'à la bonne, et on vérifie la grille finale
await p.click('[data-go=sudoku]');await W(300);
for(let r=0;r<3;r++){let guard=0;
  while(guard++<40){const empty=await p.$$eval('#kGrid .cell',x=>x.filter(e=>!e.textContent).length);if(!empty)break;
    for(let v=0;v<4;v++){const before=await p.$$eval('#kGrid .cell',x=>x.filter(e=>!e.textContent).length);await p.click(`#kPal .choice >> nth=${v}`,{force:true});await W(300);
      const after=await p.$$eval('#kGrid .cell',x=>x.filter(e=>!e.textContent).length);if(after<before)break;}}
  const g=await p.$$eval('#kGrid .cell',x=>x.map(e=>e.textContent));
  const ok=[0,1,2,3].every(i=>new Set(g.slice(i*4,i*4+4)).size===4&&new Set([g[i],g[i+4],g[i+8],g[i+12]]).size===4);
  if(r===0){console.log('sudoku grille complète valide:',ok);await p.screenshot({path:'/tmp/sudoku.png'});}
  await W(1600);}
console.log('sudoku fin:',await p.$eval('#bravo',e=>e.className.includes('end')));
await p.click('#endHome');await W(300);console.log('  🏠 ->',await on());await p.click('#homeBtn');await W(300);console.log('  🏠 ->',await on());
const pl=await p.evaluate(()=>window.__played);console.log('sons inconnus:',pl.filter(k=>k==='??').length,'/',pl.length,'| consignes:',[...new Set(pl.filter(k=>k&&k.startsWith('c_')))].join(' '));
console.log('errors',JSON.stringify(errs));await p.close();}
await b.close();})();
