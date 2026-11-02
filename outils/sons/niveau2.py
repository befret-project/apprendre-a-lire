"""Prépare les sons du niveau 2 et vérifie que la voix lit chaque syllabe avec la prononciation attendue."""
import json, re, subprocess, os
HERE = os.path.dirname(os.path.abspath(__file__))
def ipa(t):
    r = subprocess.run([f'{HERE}/piper/espeak-ng', f'--path={HERE}/piper', '-q', '--ipa', '-v', 'fr', t],
                       capture_output=True, text=True, env={'LD_LIBRARY_PATH': f'{HERE}/piper'})
    return re.sub(r'[ˈˌ\-\sː]', '', r.stdout)
C = {'m':'m','p':'p','l':'l','r':'ʁ','s':'s','t':'t','v':'v','f':'f','n':'n','d':'d','b':'b','ch':'ʃ'}
V1 = {'a':'a','e':'ə','i':'i','o':'o','u':'y','é':'e'}
V2 = {'ou':'u','on':'ɔ̃','an':'ɑ̃','in':'ɛ̃','oi':'wa'}
# écritures de secours (même son) si l'écriture normale est mal lue
ALT = {'on':['ont'], 'an':['anc','ant','ent'], 'in':['ain','ein','inh'], 'oi':['oie','ois','oit'], 'ou':['oue','oux','oût'], 'o':['ô','au','eau'], 'e':['eu'], 'u':['ue','us']}
def check(c, v):
    want = C[c] + {**V1, **V2}[v]
    base = c + v
    tries = [base] + [c + a for a in ALT.get(v, [])]
    if c == 'ch' and v == 'e': tries = ['che', 'cheu']
    for t in tries:
        if ipa(t) == want: return t, want
    return None, want
jobs, bad = [], []
syls = [(c, v) for c in C for v in V2] + [('ch', v) for v in V1]
for c, v in syls:
    t, want = check(c, v)
    if t: jobs.append(['s_' + c + v, t, 1.35])
    else: bad.append((c + v, want, ipa(c + v)))
# sons seuls + débuts de mots du jeu des lettres
for k, t, want in [('on','on','ɔ̃'), ('an','an','ɑ̃'), ('in','in','ɛ̃'), ('oi','oi','wa')]:
    got = ipa(t)
    if got != want:
        for a in ALT.get(k, []):
            if ipa(a) == want: t = a; got = want; break
    (jobs.append(['s_' + k, t, 1.35]) if got == want else bad.append((k, want, got)))
print('à générer :', len(jobs)); print('non résolus :', bad)
json.dump(jobs, open(f'{HERE}/jobs_n2_syl.json', 'w'), ensure_ascii=False)
for j in jobs:
    if j[1] != j[0][2:]: print('  écriture de secours :', j[0], '->', j[1])
