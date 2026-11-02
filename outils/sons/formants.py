import numpy as np, subprocess, sys, wave, io
from scipy.signal import lfilter
from scipy.linalg import solve_toeplitz
def load(path):
    raw = subprocess.run(['ffmpeg','-loglevel','error','-i',path,'-ac','1','-ar','16000','-f','s16le','-'],capture_output=True).stdout
    return np.frombuffer(raw, np.int16).astype(float)/32768, 16000
def formants(x, fs, order=14):
    x = lfilter([1,-0.63],1,x)*np.hamming(len(x))
    r = np.correlate(x,x,'full')[len(x)-1:len(x)+order]
    if r[0] <= 0: return None
    a = solve_toeplitz(r[:order], -r[1:order+1]); A = np.concatenate([[1],a])
    rts = [z for z in np.roots(A) if np.imag(z) >= 0.01]
    fr = sorted((np.arctan2(np.imag(z),np.real(z))*fs/(2*np.pi), -fs/np.pi*np.log(abs(z))) for z in rts)
    fr = [f for f,bw in fr if f > 200 and bw < 400]
    return fr[:2] if len(fr) >= 2 else None
def track(path, step=0.03, win=0.03):
    x, fs = load(path); n=int(win*fs); out=[]
    energy = [np.sqrt(np.mean(x[i:i+n]**2)) for i in range(0,len(x)-n,int(step*fs))]
    thr = max(energy)*0.25
    for k,i in enumerate(range(0,len(x)-n,int(step*fs))):
        if energy[k] < thr: continue
        f = formants(x[i:i+n], fs)
        if f: out.append((round(i/fs,2), int(f[0]), int(f[1])))
    return out
if __name__ == '__main__':
    for p in sys.argv[1:]:
        t = track(p); print(p.split('/')[-1], ' '.join(f'{f1}/{f2}' for _,f1,f2 in t))
