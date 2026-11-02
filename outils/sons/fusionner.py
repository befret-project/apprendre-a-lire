"""Remplace dans ../../sons.js les sons produits par gen2.py (fichier sons2.json)."""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); P = os.path.join(HERE, '..', '..', 'sons.js')
js = open(P, encoding='utf-8').read(); sons = json.loads(js[len('window.SONS='):-1])
new = json.load(open(os.path.join(HERE, 'sons2.json')))
for k in sys.argv[1:]: new.pop(k, None)   # clés à ne pas remplacer
sons.update(new)
open(P, 'w', encoding='utf-8').write('window.SONS=' + json.dumps(sons, ensure_ascii=False) + ';')
print(len(new), 'sons remplacés,', len(sons), 'au total')
