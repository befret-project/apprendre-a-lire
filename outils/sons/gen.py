"""Génère tous les sons du jeu avec la voix Piper fr-siwis-medium, encodés en MP3 puis en base64 dans sons.js."""
import subprocess, os, base64, json, sys

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'out'); os.makedirs(OUT, exist_ok=True)

# Écritures données à la voix quand l'écriture normale est mal lue (vérifié en phonétique)
FIX = {'to': 'tô', 'do': 'dô', 'be': 'beu', 'é': 'et'}

PHRASES = {
  'p_test': "Bonjour ! On va apprendre à lire ensemble.",
  'c_lettres': "Touche une lettre, et écoute !",
  'c_syllabes': "Touche une lettre bleue, puis une lettre rouge !",
  'c_mots': "Regarde l'image. Quel mot va avec ?",
  'p_ecoute': "Écoute bien.",
  'p_bravo': "Bravo !",
  'p_presque': "Presque ! Écoute encore.",
  'p_regarde': "Regarde, c'est celui-là !",
  'p_cacest': "Ça, c'est",
  'p_essaie': "Essaie encore !",
  'p_clignote': "Regarde, c'est celui qui clignote !",
  'p_trophee': "Bravo ! Tu as gagné plein d'étoiles !",
  'p_fin': "Bravo ! Tu as fini ! On rejoue, ou on rentre à la maison ?",
  'c_train': "Construis le mot ! Touche les syllabes dans le bon ordre.",
  'c_entends': "Écoute bien, et réponds avec ton pouce !",
  'p_entends': "Est-ce que tu entends",
  'p_dans': "dans",
  'p_oui': "Oui ! On l'entend !",
  'p_non': "Bravo ! On ne l'entend pas.",
  'c_peche': "Attrape toutes les lettres comme celle-ci !",
}
CONS = list('mplrstvfndb'); VOYS = ['a', 'e', 'i', 'o', 'u', 'é']
SYL = {c + v for c in CONS for v in VOYS}
MOTS = ['mo·to','vé·lo','lu·ne','lit','rat','to·ma·te','ki·wi','dé','ba·na·ne','ro·be','pi·le','ca·fé',
        'so·fa','pa·pa','ma·mi','li·vre','sa·la·de','tor·tue']
for m in MOTS:
    SYL.update(m.split('·'))
# débuts de mots du jeu des lettres
SYL.update(['a','e','i','o','u','é','mou','po','lu','ro','so','to','va','fu','nu','ba','ca','ga','ki','zè','ou'])
WORDS = {m.replace('·', '') for m in MOTS}
WORDS.update(['avion','cheval','île','orange','usine','école','mouton','pomme','lune','robot','soleil','tomate',
              'vache','fusée','nuage','dé','banane','canard','gâteau','jus','kiwi','zèbre','chat','hibou'])

WORDS.update(json.load(open(os.path.join(HERE,'entends.json')))['emoji'].keys())
jobs = [(k, t, 1.1) for k, t in PHRASES.items()]
jobs += [('s_' + s, FIX.get(s, s), 1.35) for s in sorted(SYL)]
jobs += [('w_' + w, w, 1.25) for w in sorted(WORDS)]

piper = os.path.join(HERE, 'piper', 'piper'); model = os.path.join(HERE, 'fr-siwis-medium.onnx')
sons = {}
for key, text, ls in jobs:
    fn = key.encode('utf-8').hex()
    wav = os.path.join(OUT, fn + '.wav'); mp3 = os.path.join(OUT, fn + '.mp3')
    r = subprocess.run([piper, '--model', model, '--length_scale', str(ls), '--sentence_silence', '0.1',
                        '--output_file', wav], input=text.encode('utf-8'), capture_output=True)
    if r.returncode or not os.path.exists(wav):
        print('ECHEC', key, r.stderr[-300:]); sys.exit(1)
    # coupe le silence de début/fin, normalise le volume, mono 22 kHz MP3
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', wav, '-af',
                    'silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse,apad=pad_dur=0.08,loudnorm=I=-16:TP=-1.5',
                    '-ac', '1', '-ar', '22050', '-b:a', '48k', mp3], check=True)
    sons[key] = 'data:audio/mpeg;base64,' + base64.b64encode(open(mp3, 'rb').read()).decode()

# bruitages synthétiques
for key, expr, dur in [('x_pop', "0.5*sin(2*PI*(500+2500*t)*t)*exp(-12*t)", 0.18),
                       ('x_boing', "0.5*sin(2*PI*(180+40*sin(2*PI*14*t))*t)*exp(-5*t)", 0.45)]:
    mp3 = os.path.join(OUT, key + '.mp3')
    subprocess.run(['ffmpeg','-y','-loglevel','error','-f','lavfi','-i',f'aevalsrc={expr}:s=22050:d={dur}',
                    '-ac','1','-b:a','48k',mp3], check=True)
    sons[key] = 'data:audio/mpeg;base64,' + base64.b64encode(open(mp3,'rb').read()).decode()

js = 'window.SONS=' + json.dumps(sons, ensure_ascii=False) + ';'
open(os.path.join(HERE, '..', '..', 'sons.js'), 'w', encoding='utf-8').write(js)
print(len(sons), 'sons,', round(len(js) / 1024), 'Ko')
