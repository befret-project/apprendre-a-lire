const {chromium,devices}=require('playwright');
async function run(label, ctxOpts, voices){
  const b=await chromium.launch();const ctx=await b.newContext(ctxOpts);const p=await ctx.newPage();
  const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.addInitScript((voices)=>{window.__log=[];
    HTMLMediaElement.prototype.play=function(){const k=Object.keys(window.SONS||{}).find(k=>window.SONS[k]===this.src);window.__log.push('REC:'+k);setTimeout(()=>this.onended&&this.onended(),30);return Promise.resolve();};
    HTMLMediaElement.prototype.pause=function(){};
    const s={speaking:false,pending:false,getVoices:()=>voices,addEventListener(){},speak(u){window.__log.push('TTS:'+u.text+(u.voice?' ['+u.voice.name+']':''));setTimeout(()=>u.onend&&u.onend(),30);},cancel(){},resume(){}};
    Object.defineProperty(window,'speechSynthesis',{value:s});window.SpeechSynthesisUtterance=function(t){this.text=t;};},voices);
  await p.goto((process.env.APP_URL||(process.env.APP_URL||'http://localhost:8766/index.html')));await p.waitForTimeout(200);if(await p.$eval('#who',e=>e.classList.contains('on'))){await p.click('#kids .kid >> nth=0');await p.waitForTimeout(300);}const W=ms=>p.waitForTimeout(ms);
  const info=await p.textContent('#modeInfo');
  await p.click('#testVoice');await W(600);
  await p.click('[data-go=peche]');await W(400);
  const t=await p.$eval('#pTarget',e=>e.textContent);
  await p.evaluate(t=>{const f=[...document.querySelectorAll('#pond .fish')].find(f=>f.dataset.l!==t);f&&f.click();},t);await W(500);
  console.log(`== ${label}: ${info}\n  `+(await p.evaluate(()=>window.__log)).join(' | ')+'\n  errors '+JSON.stringify(errs));
  await b.close();
}
(async()=>{
  const good=[{name:'Microsoft Denise Online (Natural) - French (France)',lang:'fr-FR'},{name:'Google US English',lang:'en-US'}];
  await run('PC', {viewport:{width:1200,height:800}}, good);
  await run('iPhone', {...devices['iPhone 13']}, [{name:'Thomas',lang:'fr-FR'}]);
  await run('PC sans voix FR', {viewport:{width:1200,height:800}}, [{name:'Google US English',lang:'en-US'}]);
})();
