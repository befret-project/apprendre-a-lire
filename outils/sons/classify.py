import json, re
d = json.load(open('pool.json')); pool = d['pool']; ipa = d['ipa']
for w in ['dodo','tasse']: pool.pop(w, None); ipa.pop(w, None)
N = '̃'  # tilde des voyelles nasales
def has(i, ph): return re.search(re.escape(ph) + '(?!' + N + ')', i) is not None
def nasal(i): return N in i
RULES = {
 # son : (présent ?, ambigu ?)
 'a':  (lambda i: has(i,'a') and 'wa' not in i,  lambda i: 'wa' in i or 'ɑ' in i),
 'i':  (lambda i: has(i,'i'),                    lambda i: 'j' in i or 'ɛ'+N in i),
 'o':  (lambda i: has(i,'o') or has(i,'ɔ'),      lambda i: 'ɔ'+N in i or has(i,'u') or 'w' in i),
 'u':  (lambda i: has(i,'y'),                    lambda i: has(i,'u') or 'w' in i),
 'ou': (lambda i: has(i,'u'),                    lambda i: 'w' in i or has(i,'y')),
 'é':  (lambda i: has(i,'e'),                    lambda i: 'ɛ' in i or 'ə' in i or 'j' in i),
}
out = {}
for s,(yes,amb) in RULES.items():
    Y=[w for w in pool if yes(ipa[w])]
    Nn=[w for w in pool if not yes(ipa[w]) and not amb(ipa[w])]
    out[s]={'oui':Y,'non':Nn}
    print(f"{s:3} OUI({len(Y)}): {' '.join(Y)}\n    NON({len(Nn)}): {' '.join(Nn)}\n    écartés: {' '.join(w for w in pool if w not in Y and w not in Nn)}")
json.dump({'emoji':pool,'sons':out}, open('entends.json','w'), ensure_ascii=False)
