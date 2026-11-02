import subprocess, json
POOL = {'chat':'🐱','lune':'🌙','loup':'🐺','vélo':'🚲','moto':'🏍️','lit':'🛏️','poule':'🐔','souris':'🐭','pomme':'🍎',
 'roue':'🛞','sac':'🎒','pizza':'🍕','kiwi':'🥝','tortue':'🐢','banane':'🍌','robot':'🤖','fusée':'🚀','cadeau':'🎁',
 'bébé':'👶','café':'☕','nez':'👃','pied':'🦶','dé':'🎲','rat':'🐀','jus':'🧃','hibou':'🦉','bouche':'👄','tomate':'🍅',
 'salade':'🥗','ananas':'🍍','livre':'📖','bus':'🚌','tulipe':'🌷','lama':'🦙','koala':'🐨','soupe':'🍲','glace':'🍦',
 'cochon':'🐷','lapin':'🐰','avion':'✈️','vache':'🐄','chameau':'🐫','escargot':'🐌','mouton':'🐑','zèbre':'🦓','école':'🏫',
 'orange':'🍊','usine':'🏭','soleil':'☀️','nuage':'☁️','gâteau':'🎂','canard':'🦆','sapin':'🎄','clé':'🔑','tasse':'🍵','sucette':'🍭',
 'ballon':'🎈','poisson':'🐟','chaussure':'👟','cerise':'🍒','citron':'🍋','fourmi':'🐜','papillon':'🦋','tortue':'🐢','dodo':'😴',
 'pingouin':'🐧','dauphin':'🐬','raisin':'🍇','requin':'🦈','train':'🚆','main':'✋','oiseau':'🐦','voiture':'🚗','chapeau':'👒','chocolat':'🍫','cheval':'🐴','éléphant':'🐘','dent':'🦷','gant':'🧤','dragon':'🐉','panda':'🐼','maman':'👩','bonbon':'🍬','ruban':'🎀','étoile':'⭐','poire':'🍐','camion':'🚚','lion':'🦁','chien':'🐶','roi':'🤴',}
ipa = {}
for w in POOL:
    r = subprocess.run(['./piper/espeak-ng','--path=piper','-q','--ipa','-v','fr',w],capture_output=True,text=True,env={'LD_LIBRARY_PATH':'piper'})
    ipa[w] = r.stdout.strip().replace('ˈ','').replace('ˌ','').replace('-','')
json.dump({'pool':POOL,'ipa':ipa}, open('pool.json','w'), ensure_ascii=False)
