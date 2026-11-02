"""Régénère les syllabes / voyelles / mots finissant par une voyelle avec un « porteur » (ex. « mo » -> « mo ta »),
puis coupe juste avant le « t » final. Cette voix déforme les voyelles prononcées en dernier ;
suivies d'un « ta », elles restent pures. Chaque son retenu passe 2 contrôles :
  1) phonétique : la transcription du porteur commence exactement par celle attendue
  2) acoustique : le 1er formant (ouverture de la voyelle) est dans la plage du français
"""
import subprocess, os, json, base64, re, sys
import numpy as np
import formants as F

HERE = os.path.dirname(os.path.abspath(__file__))
TMP = os.path.join(HERE, 'c2'); os.makedirs(TMP, exist_ok=True)
PIPER = os.path.join(HERE, 'piper', 'piper'); MODEL = os.path.join(HERE, 'fr-siwis-medium.onnx')
FIX = {'to': 'tô', 'do': 'dô', 'be': 'beu', 'é': 'é'}

def ipa(t):
    r = subprocess.run([os.path.join(HERE,'piper','espeak-ng'), '--path='+os.path.join(HERE,'piper'), '-q', '--ipa', '-v', 'fr', t],
                       capture_output=True, text=True, env={'LD_LIBRARY_PATH': os.path.join(HERE,'piper')})
    return re.sub(r'[ˈˌ\-\s]', '', r.stdout)

# plage du 1er formant (Hz) pour la voix utilisée, d'après les mesures de calibrage
F1 = {'a': (650, 1100), 'i': (200, 340), 'y': (200, 340), 'u': (200, 340), 'o': (280, 450), 'e': (280, 450), 'ø': (350, 560), 'ə': (350, 560)}
def final_vowel(ph):
    ph = ph.replace('ː', '')   # « tô » -> /toː/ : voyelle longue, même timbre
    m = re.search(r'([aiyuoeøə])̃?$', ph)
    if not m or ph.endswith('̃'): return None
    return m.group(1)

def synth(text, ls, path):
    subprocess.run([PIPER, '--model', MODEL, '--length_scale', str(ls), '--sentence_silence', '0', '--output_file', path],
                   input=text.encode(), capture_output=True, check=True)

def load(path):
    raw = subprocess.run(['ffmpeg','-loglevel','error','-i',path,'-ac','1','-ar','22050','-f','s16le','-'],capture_output=True).stdout
    return np.frombuffer(raw, np.int16).astype(float)

def cut_before_last_gap(x, sr=22050):
    """Coupe au début du dernier silence (fermeture du « t » de « ta »)."""
    hop = int(0.005*sr); n = len(x)//hop
    e = np.array([np.sqrt(np.mean(x[i*hop:(i+1)*hop]**2)) for i in range(n)])
    thr = e.max()*0.04
    voiced = np.where(e > thr)[0]
    if len(voiced) == 0: return None
    first = voiced[0]
    gaps = []; i = first
    while i < n:
        if e[i] <= thr:
            j = i
            while j < n and e[j] <= thr: j += 1
            if j - i >= 4 and j < n: gaps.append(i)   # >= 20 ms suivi de son
            i = j
        else: i += 1
    if not gaps: return None
    start = max(0, first*hop - int(0.01*sr)); end = gaps[-1]*hop + int(0.008*sr)
    y = x[start:end].copy()
    if len(y) < int(0.08*sr): return None
    fi, fo = int(0.005*sr), int(0.035*sr)
    y[:fi] *= np.linspace(0,1,fi); y[-fo:] *= np.linspace(1,0,fo)
    return y

def save_wav(y, path, sr=22050):
    y = np.clip(y, -32767, 32767).astype(np.int16).tobytes()
    subprocess.run(['ffmpeg','-y','-loglevel','error','-f','s16le','-ar',str(sr),'-ac','1','-i','-',path], input=y, check=True)

def f1_end(path):
    tr = F.track(path, step=0.015, win=0.025)
    if not tr: return None
    tail = [a for _,a,_ in tr[len(tr)//2:]]
    return int(np.median(tail))

def candidates(spoken):
    c = [spoken + ' ta', spoken + 'ta']
    if spoken[-1] in 'oô':
        b = spoken[:-1]
        c += [b+'au ta', b+'auta', b+'ô ta', b+'eau ta', b+'o ta', b+'aut ta', b+'ot ta', b+'au to']
    return c

def make(key, spoken, ls):
    target = ipa(spoken); v = final_vowel(target)
    best = None
    for i, cand in enumerate(candidates(spoken)):
        ph = ipa(cand)
        if not ph.replace('ː','').startswith(target.replace('ː','')): continue               # contrôle phonétique
        raw = os.path.join(TMP, f'{key.encode().hex()}_{i}.wav'); synth(cand, ls, raw)
        y = cut_before_last_gap(load(raw))
        if y is None: continue
        out = os.path.join(TMP, f'{key.encode().hex()}_{i}_cut.wav'); save_wav(y, out)
        f1 = f1_end(out)
        if v and f1:
            lo, hi = F1[v]; mid = (lo+hi)/2
            score = 0 if lo <= f1 <= hi else min(abs(f1-lo), abs(f1-hi))
        else: score = 0
        if best is None or score < best[0]: best = (score, out, cand, f1)
        if score == 0: break
    return target, v, best

if __name__ == '__main__':
    jobs = json.load(open(os.path.join(HERE, 'jobs2.json')))
    report = []; result = {}
    for key, spoken, ls in jobs:
        target, v, best = make(key, spoken, ls)
        if not best: report.append((key, spoken, target, v, None, None, 'AUCUN')); continue
        score, path, cand, f1 = best
        mp3 = path.replace('.wav', '.mp3')
        subprocess.run(['ffmpeg','-y','-loglevel','error','-i',path,'-af','apad=pad_dur=0.06,loudnorm=I=-16:TP=-1.5',
                        '-ac','1','-ar','22050','-b:a','48k',mp3], check=True)
        result[key] = 'data:audio/mpeg;base64,' + base64.b64encode(open(mp3,'rb').read()).decode()
        report.append((key, spoken, target, v, cand, f1, 'OK' if score == 0 else f'HORS PLAGE ({score:.0f} Hz)'))
    json.dump(result, open(os.path.join(HERE, 'sons2.json'), 'w'))
    for r in report: print('{:10} {:8} /{}/ v={} porteur="{}" F1={} {}'.format(*[str(x) for x in r]))
