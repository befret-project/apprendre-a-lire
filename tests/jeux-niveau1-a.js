const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:800}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{window.__played=[];
  HTMLMediaElement.prototype.play=function(){const src=this.src;const k=Object.keys(window.SONS||{}).find(k=>window.SONS[k]===src)||('??'+src.slice(0,30));window.__played.push(k);setTimeout(()=>this.dispatchEvent(new Event('ended')),60);return Promise.resolve();};
  HTMLMediaElement.prototype.pause=function(){};});
await p.goto((process.env.APP_URL||(process.env.APP_URL||'http://localhost:8766/index.html')));await p.waitForTimeout(200);if(await p.$eval('#who',e=>e.classList.contains('on'))){await p.click('#kids .kid >> nth=0');await p.waitForTimeout(300);}const W=ms=>p.waitForTimeout(ms);
// toutes les clés possibles existent ?
const missing=await p.evaluate(()=>{const need=[];const C='mplrstvfndb'.split(''),V=['a','e','i','o','u','é'];C.forEach(c=>V.forEach(v=>need.push('s_'+c+v)));
 ['c_lettres','c_syllabes','c_mots','p_test','p_ecoute','p_bravo','p_presque','p_regarde','p_cacest','p_essaie','p_clignote','p_trophee','p_fin'].forEach(k=>need.push(k));return need.filter(k=>!window.SONS[k]);});
console.log('missing base keys:',missing);
await p.click('#testVoice');await W(200);
await p.click('[data-go=lettres]');await W(300);
for(let i=0;i<24;i++){await p.evaluate(i=>document.querySelectorAll("#letterGrid .letter")[i].click(),i);await W(380);}
await p.click('#homeBtn');await W(300);
await p.click('[data-go=mots]');await W(300);
async function playRound(sel){ for(let i=0;i<5;i++){ for(const c of await p.$$(sel)){ const cls=await c.getAttribute('class'); if(cls.includes('gone'))continue; await c.click({force:true});await W(400); if((await c.getAttribute('class')).includes('good'))break;} await W(1500);} }
await playRound('#mChoices .choice');
console.log('mots end:',await p.$eval('#bravo',e=>e.className));
await p.click('#endHome');await W(300);await p.click('[data-go=ecoute]');await W(300);
await playRound('#eChoices .choice');
console.log('ecoute end:',await p.$eval('#bravo',e=>e.className));
const pl=await p.evaluate(()=>window.__played);
console.log('unknown played:',pl.filter(k=>k.startsWith('??')));
console.log('sample:',pl.slice(0,8).join(' | '),' ... ',pl.slice(-6).join(' | '));
// all words syllables & letter keys
const miss2=await p.evaluate(()=>{const ks=[];return ks;});
console.log('errors',errs);await b.close();})();
