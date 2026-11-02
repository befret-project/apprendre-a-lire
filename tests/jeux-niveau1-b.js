const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:800}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{window.__played=[];
  HTMLMediaElement.prototype.play=function(){const src=this.src;const k=Object.keys(window.SONS||{}).find(k=>window.SONS[k]===src)||('??'+src.slice(0,30));window.__played.push(k);setTimeout(()=>this.dispatchEvent(new Event('ended')),40);return Promise.resolve();};
  HTMLMediaElement.prototype.pause=function(){};});
await p.goto((process.env.APP_URL||(process.env.APP_URL||'http://localhost:8766/index.html')));await p.waitForTimeout(200);if(await p.$eval('#who',e=>e.classList.contains('on'))){await p.click('#kids .kid >> nth=0');await p.waitForTimeout(300);}const W=ms=>p.waitForTimeout(ms);
await p.screenshot({path:'/tmp/menu.png',fullPage:true});
// PECHE
await p.click('[data-go=peche]');await W(400);await p.screenshot({path:'/tmp/peche.png'});
for(let r=0;r<5;r++){
  const t=await p.$eval('#pTarget',e=>e.textContent);
  // one wrong tap
  await p.evaluate(t=>{const f=[...document.querySelectorAll('#pond .fish')].find(f=>f.dataset.l!==t);f&&f.click();},t);await W(300);
  for(let i=0;i<4;i++){await p.evaluate(t=>{const f=[...document.querySelectorAll('#pond .fish:not(.popped)')].find(f=>f.dataset.l===t);f&&f.click();},t);await W(260);}
  await W(1200);
}
console.log('peche end:',await p.$eval('#bravo',e=>e.className));
await p.click('#endHome');await W(300);
// ENTENDS
await p.click('[data-go=entends]');await W(400);await p.screenshot({path:'/tmp/entends.png'});
for(let r=0;r<5;r++){ await p.click('#nYes');await W(500); if(!(await p.$eval('#nYes',e=>e.className)).includes('good')){ await p.click('#nNo',{force:true});await W(300);} await W(900);}
console.log('entends end:',await p.$eval('#bravo',e=>e.className));
await p.click('#endAgain');await W(400);console.log('replay entends on:',await p.$eval('#entends',e=>e.className), 'dots:',await p.$$eval('#nDots .on',x=>x.length));
await p.click('#homeBtn');await W(300);
// TRAIN
await p.click('[data-go=train]');await W(400);
for(let r=0;r<5;r++){
  if(r===0){ await p.screenshot({path:'/tmp/train0.png'}); }
  // wrong taps first then correct via wagon count & hint
  for(let k=0;k<6;k++){
    const n=await p.$$eval('#tWagons .wagon',x=>x.length), full=await p.$$eval('#tWagons .wagon.full',x=>x.length);
    if(full===n) break;
    // try each unused card until a wagon fills
    const cards=await p.$$('#tChoices .choice:not(.used)');
    for(const c of cards){ await c.click({force:true});await W(380); const f2=await p.$$eval('#tWagons .wagon.full',x=>x.length); if(f2>full) break; }
  }
  if(r===0) await p.screenshot({path:'/tmp/train1.png'});
  await W(1500);
}
console.log('train end:',await p.$eval('#bravo',e=>e.className));
const pl=await p.evaluate(()=>window.__played);
console.log('unknown:',pl.filter(k=>k.startsWith('??')), 'total played',pl.length);
console.log('entends sample:',pl.filter(k=>k.startsWith('p_entends')).length,'questions; example',pl.slice(pl.indexOf('c_entends'),pl.indexOf('c_entends')+6).join(' '));
console.log('errors',errs);await b.close();})();
