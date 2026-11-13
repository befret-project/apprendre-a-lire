// Vérifie le générateur de mini-sudoku tel qu'il est écrit dans index.html :
// solution valide, nombre de cases vides attendu, et UNE SEULE solution possible.
const fs=require('fs');const src=fs.readFileSync(__dirname+'/../index.html','utf8');
const grab=(name)=>{const i=src.indexOf('function '+name+'(');let d=0,j=src.indexOf('{',i);for(let k=j;k<src.length;k++){if(src[k]==='{')d++;else if(src[k]==='}'){d--;if(d===0)return src.slice(i,k+1);}}};
const code=[grab('shuffle'),grab('sudoSolutions'),grab('makeSudoku')].join('\n');
const {makeSudoku,sudoSolutions}=new Function(code+';return {makeSudoku,sudoSolutions};')();
function valide(s){for(let r=0;r<4;r++){const row=new Set(),col=new Set();for(let c=0;c<4;c++){row.add(s[r*4+c]);col.add(s[c*4+r]);}if(row.size!==4||col.size!==4)return false;}
 for(const [br,bc] of [[0,0],[0,2],[2,0],[2,2]]){const b=new Set();for(let y=br;y<br+2;y++)for(let x=bc;x<bc+2;x++)b.add(s[y*4+x]);if(b.size!==4)return false;}return true;}
let pb=0;const stats={};
for(const blanks of [4,8]){const seen={};for(let n=0;n<2000;n++){const z=makeSudoku(blanks);
  const vides=z.grid.filter(v=>v<0).length;seen[vides]=(seen[vides]||0)+1;
  if(!valide(z.sol)){pb++;console.log('solution invalide',z.sol);}
  if(z.grid.some((v,i)=>v>=0&&v!==z.sol[i])){pb++;console.log('case fixe fausse');}
  if(sudoSolutions(z.grid.slice(),3)!==1){pb++;console.log('pas unique',z.grid);}}
 stats[blanks]=seen;}
console.log('cases vides obtenues (demandé 4 / 8):',JSON.stringify(stats));console.log(pb?'ÉCHEC '+pb:'OK : 4000 grilles, toutes valides et à solution unique');
