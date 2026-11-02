const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:800}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{window.__log=[];HTMLMediaElement.prototype.play=function(){const k=Object.keys(window.SONS||{}).find(k=>window.SONS[k]===this.src);window.__log.push(k);setTimeout(()=>this.onended&&this.onended(),30);return Promise.resolve();};HTMLMediaElement.prototype.pause=function(){};});
await p.goto((process.env.APP_URL||'http://localhost:8766/index.html'));const W=ms=>p.waitForTimeout(ms);
console.log('start screen who on:',await p.$eval('#who',e=>e.className),'| noKid hidden:',await p.$eval('#noKid',e=>e.hidden));
await p.screenshot({path:'/tmp/who0.png'});
// ajouter 2 enfants
for(const [n,av] of [['Léa',3],['Noah',1]]){ await p.click('#kids .kid.add');await W(300);await p.fill('#kidName',n);await p.click(`#avPick .avp >> nth=${av}`);await W(250);await p.click('#kidSave');await W(450);}
// doublon + vide
await p.click('#kids .kid.add');await W(300);await p.click('#kidSave');await W(450);console.log('vide ->',await p.textContent('#kidErr'));
await p.fill('#kidName','léa');await W(100);await p.click('#kidSave');await W(450);console.log('doublon ->',await p.textContent('#kidErr'));
await p.click('#kidCancel');await W(300);
await p.screenshot({path:'/tmp/who1.png'});
await p.click('#kids .kid >> nth=0');await W(500);
console.log('after choose: home on:',await p.$eval('#home',e=>e.className),'chip:',await p.textContent('#stars'),'| sounds:',(await p.evaluate(()=>window.__log)).slice(-2));
// gagner une étoile dans J'entends
await p.click('[data-go=entends]');await W(400);await p.click('#nYes');await W(500);if(!(await p.$eval('#nYes',e=>e.className)).includes('good')){await p.click('#nNo',{force:true});await W(300);}
await W(800);console.log('chip after star:',await p.textContent('#stars'));
// changer de joueur
await p.click('#stars');await W(500);console.log('who on:',await p.$eval('#who',e=>e.className),'| cards:',await p.$$eval('#kids .kid',x=>x.map(e=>e.textContent.replace(/\s+/g,' ').trim())));
await p.click('#kids .kid >> nth=1');await W(500);console.log('chip Noah:',await p.textContent('#stars'));
// recharger : 2 profils -> écran qui joue
await p.reload();await W(500);console.log('after reload who on:',await p.$eval('#who',e=>e.className));
await p.click('#kids .kid >> nth=0');await W(400);
// suppression via parents
await p.evaluate(()=>scrollTo(0,9999));await W(200);
console.log('admin:',await p.$$eval('#kidAdmin .kadm',x=>x.map(e=>e.textContent)));
await p.click('#kidAdmin .kadm >> nth=1 >> button');await W(200);await p.click('#kidAdmin .kadm >> nth=1 >> button');await W(300);
console.log('admin after delete:',await p.$$eval('#kidAdmin .kadm',x=>x.map(e=>e.textContent)));
await p.reload();await W(500);console.log('1 profil -> home direct:',await p.$eval('#home',e=>e.className),await p.textContent('#stars'));
console.log('errors',errs);await b.close();})();
