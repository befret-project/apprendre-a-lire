const {chromium}=require('playwright');
const SIZES={tel_petit:[360,640],iphone:[390,844],tablette_portrait:[768,1024],tablette_paysage:[1024,768],pc:[1440,900]};
const SCREENS=['who','home','lettres','peche','entends','syllabes','ecoute','train','mots','fin'];
(async()=>{const b=await chromium.launch();const out=process.argv[2]||'/tmp/audit';require('fs').mkdirSync(out,{recursive:true});
const report=[];
for(const [sz,[w,h]] of Object.entries(SIZES)){
 const ctx=await b.newContext({viewport:{width:w,height:h},hasTouch:w<1000,isMobile:w<1000,deviceScaleFactor:1});const p=await ctx.newPage();
 await p.addInitScript(()=>{localStorage.setItem('lire_profils',JSON.stringify([{id:'a',name:'Léa',avatar:'🐰',stars:12,level:2},{id:'b',name:'Noah',avatar:'🐼',stars:3,level:1}]));localStorage.setItem('lire_actif','a');
   HTMLMediaElement.prototype.play=function(){return Promise.resolve();};});
 await p.goto(process.env.APP_URL||'http://localhost:8766/index.html');await p.waitForTimeout(300);
 for(const s of SCREENS){
  await p.evaluate(()=>{document.getElementById('bravo').classList.remove('on','end');});
  if(s==='who'){await p.evaluate(()=>document.getElementById('stars').click());}
  else if(s==='home'){await p.evaluate(()=>document.getElementById('homeBtn').click());}
  else if(s==='fin'){await p.evaluate(()=>{document.getElementById('homeBtn').click();});await p.waitForTimeout(600);await p.evaluate(()=>{document.querySelector('[data-go=mots]').click();});await p.waitForTimeout(600);await p.evaluate(()=>{const b=document.getElementById('bravo');document.getElementById('bravoT').textContent='Bravo ! ⭐ 12';b.classList.add('on','end');});}
  else {await p.evaluate(()=>document.getElementById('homeBtn').click());await p.waitForTimeout(550);await p.evaluate(s=>document.querySelector(`[data-go=${s}]`).click(),s);}
  await p.waitForTimeout(700);
  if(s==='lettres'){await p.evaluate(()=>document.querySelectorAll('#letterGrid .letter')[6].click());await p.waitForTimeout(200);}
  const m=await p.evaluate(()=>{
    const r={};const de=document.documentElement;r.hOverflow=de.scrollWidth>de.clientWidth+1;r.pageH=de.scrollHeight;
    const scr=document.querySelector('.screen.on');const vis=[...(scr?scr.querySelectorAll('button'):[]),...document.querySelectorAll('.bravo.on button, .bar button')].filter(e=>e.offsetParent!==null);
    r.small=vis.filter(e=>{const b=e.getBoundingClientRect();return b.width<44||b.height<44;}).map(e=>e.textContent.trim().slice(0,12)+'('+Math.round(e.getBoundingClientRect().width)+'x'+Math.round(e.getBoundingClientRect().height)+')').slice(0,6);
    r.clipped=[...(scr?scr.querySelectorAll('button,.word,.big,h1,h2'):[])].filter(e=>e.offsetParent!==null&&(e.scrollWidth>e.clientWidth+2)).map(e=>e.textContent.trim().slice(0,14)).slice(0,6);
    const bar=document.querySelector('.bar').getBoundingClientRect();
    // éléments interactifs cachés sous la barre du bas sans pouvoir défiler jusqu'à eux
    r.below=de.scrollHeight<=innerHeight ? vis.filter(e=>e.getBoundingClientRect().bottom>bar.top+2 && !e.closest('.bar')).length : 0;
    const main=document.querySelector('main').getBoundingClientRect();r.mainW=Math.round(main.width);
    return r;});
  report.push(`${sz.padEnd(18)} ${s.padEnd(9)} débordH=${m.hOverflow?'OUI':'non'} hauteurPage=${m.pageH} largeurContenu=${m.mainW} petitsBoutons=${JSON.stringify(m.small)} texteCoupé=${JSON.stringify(m.clipped)}`);
  await p.screenshot({path:`${out}/${sz}_${s}.png`});
 }
 await ctx.close();
}
console.log(report.join('\n'));await b.close();})();
