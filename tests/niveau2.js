const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:800}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{window.__played=[];
  localStorage.setItem('lire_profils',JSON.stringify([{id:'a',name:'Léa',avatar:'🐰',stars:0,level:2},{id:'b',name:'Noah',avatar:'🐼',stars:0,level:1}]));localStorage.setItem('lire_actif','a');
  HTMLMediaElement.prototype.play=function(){const k=Object.keys(window.SONS||{}).find(k=>window.SONS[k]===this.src);window.__played.push(k||'??');setTimeout(()=>this.onended&&this.onended(),25);return Promise.resolve();};HTMLMediaElement.prototype.pause=function(){};});
await p.goto((process.env.APP_URL||(process.env.APP_URL||'http://localhost:8766/index.html')));const W=ms=>p.waitForTimeout(ms);
// vérif statique des clés possibles au niveau 2
const miss=await p.evaluate(()=>{const S=window.SONS,need=new Set();
  const C=['m','p','l','r','s','t','v','f','n','d','b','ch'],V=['a','e','i','o','u','é','ou','on','an','in','oi'];C.forEach(c=>V.forEach(v=>need.add('s_'+c+v)));
  ['on','an','in','oi','ou'].forEach(v=>need.add('s_'+v));
  return [...need].filter(k=>!S[k]);});
console.log('syllabes manquantes:',miss);
await p.click('#kids .kid >> nth=0');await W(400);
console.log('home niveau:',await p.textContent('#nivInfo'));
async function round(sel,n=5,wait=1300){for(let i=0;i<n;i++){for(const c of await p.$$(sel)){const cl=await c.getAttribute('class');if(cl.includes('gone')||cl.includes('used'))continue;await c.click({force:true});await W(300);if((await c.getAttribute('class')).includes('good'))break;}await W(wait);}}
// lettres
await p.click('[data-go=lettres]');await W(300);
const tiles=await p.$$eval('#letterGrid .letter',x=>x.map(e=>e.textContent));console.log('lettres N2:',tiles.slice(-6).join(' '));
for(let i=0;i<tiles.length;i++){await p.evaluate(i=>document.querySelectorAll('#letterGrid .letter')[i].click(),i);await W(150);}
await p.click('#homeBtn');await W(300);
// je colle
await p.click('[data-go=syllabes]');await W(300);
console.log('colle N2 voyelles:',(await p.$$eval('#rowV .letter',x=>x.map(e=>e.textContent))).join(' '),'| cons:',(await p.$$eval('#rowC .letter',x=>x.map(e=>e.textContent))).join(' '));
for(let c=0;c<12;c+=3){await p.evaluate(c=>document.querySelectorAll('#rowC .letter')[c].click(),c);await W(150);for(let v=0;v<11;v++){await p.evaluate(v=>document.querySelectorAll('#rowV .letter')[v].click(),v);await W(120);}}
await p.screenshot({path:'/tmp/n2colle.png'});
await p.click('#homeBtn');await W(300);
// écoute, mots, train
await p.click('[data-go=ecoute]');await W(300);await round('#eChoices .choice');console.log('ecoute end:',await p.$eval('#bravo',e=>e.className));await p.click('#endHome');await W(300);
await p.click('[data-go=mots]');await W(300);await round('#mChoices .choice',5,2000);console.log('mots end:',await p.$eval('#bravo',e=>e.className));await p.click('#endHome');await W(300);
await p.click('[data-go=train]');await W(300);
for(let r=0;r<5;r++){for(let k=0;k<6;k++){const n=await p.$$eval('#tWagons .wagon',x=>x.length),f=await p.$$eval('#tWagons .wagon.full',x=>x.length);if(f===n)break;for(const c of await p.$$('#tChoices .choice:not(.used)')){await c.click({force:true});await W(300);if(await p.$$eval('#tWagons .wagon.full',x=>x.length)>f)break;}}if(r===0)await p.screenshot({path:'/tmp/n2train.png'});await W(2200);}
console.log('train end:',await p.$eval('#bravo',e=>e.className));await p.click('#endHome');await W(300);
// pêche
await p.click('[data-go=peche]');await W(300);
const targets=[];for(let r=0;r<5;r++){const t=await p.$eval('#pTarget',e=>e.textContent);targets.push(t);for(let i=0;i<4;i++){await p.evaluate(t=>{const f=[...document.querySelectorAll('#pond .fish:not(.popped)')].find(f=>f.dataset.l===t);f&&f.click();},t);await W(230);}await W(1200);}
console.log('peche cibles N2:',targets.join(' '),'| end:',await p.$eval('#bravo',e=>e.className));await p.screenshot({path:'/tmp/n2peche.png'});await p.click('#endHome');await W(300);
// entends
await p.click('[data-go=entends]');await W(300);const sons=[];
for(let r=0;r<5;r++){sons.push(await p.textContent('#nSon'));await p.click('#nYes');await W(400);if(!(await p.$eval('#nYes',e=>e.className)).includes('good')){await p.click('#nNo',{force:true});await W(300);}await W(1500);}
console.log('entends sons N2:',sons.join(' '),'| end:',await p.$eval('#bravo',e=>e.className));
const pl=await p.evaluate(()=>window.__played);console.log('sons inconnus joués:',pl.filter(k=>k==='??').length,'/',pl.length);
// niveau 1 inchangé pour Noah
await p.click('#endHome');await W(300);await p.click('#stars');await W(300);await p.click('#kids .kid >> nth=1');await W(300);
console.log('Noah:',await p.textContent('#nivInfo'));await p.click('[data-go=syllabes]');await W(300);console.log('Noah voyelles:',(await p.$$eval('#rowV .letter',x=>x.map(e=>e.textContent))).join(' '));
console.log('errors',errs);await b.close();})();
