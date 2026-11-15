"""Happy Ducklings — sound design.
Renders every sound effect and the three extra music loops from scratch (numpy),
so the board ships with original, royalty-free audio.
Usage: python3 synth.py <outdir_wav>
"""
import sys, os, numpy as np
from scipy import signal
from scipy.io import wavfile

SR = 44100
rng = np.random.default_rng(7)
NOTE = {n: i for i, n in enumerate(['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'])}


def hz(name):
    """'C5' -> frequency"""
    n, o = (name[:-1], int(name[-1]))
    return 440.0 * 2 ** ((NOTE[n] + (o + 1) * 12 - 69) / 12)


def t_(dur):
    return np.arange(int(dur * SR)) / SR


def fade(x, a=0.004, r=0.01):
    n = len(x); a = min(int(a * SR), n // 2); r = min(int(r * SR), n // 2)
    y = x.copy()
    if a: y[:a] *= np.linspace(0, 1, a)
    if r: y[-r:] *= np.linspace(1, 0, r)
    return y


# ---------- instruments (mono) ----------
def marimba(f, dur=0.7, bright=1.0):
    t = t_(dur)
    x = np.sin(2 * np.pi * f * t) * np.exp(-t / 0.20)
    x += 0.28 * bright * np.sin(2 * np.pi * 4 * f * t) * np.exp(-t / 0.045)
    x += 0.07 * bright * np.sin(2 * np.pi * 9.2 * f * t) * np.exp(-t / 0.015)
    return fade(x, 0.002, 0.03)


def musicbox(f, dur=2.2):
    t = t_(dur)
    x = np.sin(2 * np.pi * f * t) * np.exp(-t / 0.55)
    x += 0.32 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t / 0.30)
    x += 0.16 * np.sin(2 * np.pi * 5.4 * f * t) * np.exp(-t / 0.07)
    x += 0.05 * np.sin(2 * np.pi * 8.9 * f * t) * np.exp(-t / 0.03)
    return fade(x, 0.0015, 0.05)


def glock(f, dur=1.6):
    t = t_(dur)
    x = np.sin(2 * np.pi * f * t) * np.exp(-t / 0.42)
    x += 0.30 * np.sin(2 * np.pi * 2.76 * f * t) * np.exp(-t / 0.16)
    x += 0.10 * np.sin(2 * np.pi * 5.40 * f * t) * np.exp(-t / 0.06)
    return fade(x, 0.0015, 0.05)


def softpad(f, dur, att=0.6, rel=0.8):
    t = t_(dur)
    x = sum(np.sin(2 * np.pi * f * d * t + p) for d, p in ((1, 0), (1.004, 1.3), (0.997, 2.1)))
    x += 0.25 * np.sin(2 * np.pi * 2 * f * t)
    e = np.minimum(1, t / att) * np.minimum(1, (dur - t) / rel)
    return x * np.clip(e, 0, 1) / 3


def pizz(f, dur=0.5):
    """Karplus-Strong pluck, low-passed: warm bass"""
    n = int(dur * SR); p = int(SR / f)
    buf = rng.uniform(-1, 1, p); buf = signal.lfilter([0.5, 0.5], [1], buf)
    out = np.empty(n)
    for i in range(n):
        out[i] = buf[i % p]
        buf[i % p] = 0.496 * (buf[i % p] + buf[(i + 1) % p])
    b, a = signal.butter(2, min(0.45, 6 * f / (SR / 2)))
    out = signal.lfilter(b, a, out)
    return fade(out / (np.abs(out).max() + 1e-9), 0.002, 0.04)


def kick(dur=0.22):
    t = t_(dur); f = 45 + 85 * np.exp(-t / 0.03)
    return fade(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.09), 0.001, 0.02)


def noise_band(dur, lo, hi, tau):
    t = t_(dur); x = rng.standard_normal(len(t))
    b, a = signal.butter(2, [lo / (SR / 2), hi / (SR / 2)], 'band')
    return fade(signal.lfilter(b, a, x) * np.exp(-t / tau), 0.001, 0.01)


def shaker(dur=0.07): return noise_band(dur, 5000, 11000, 0.02) * 0.6
def clap():
    x = np.zeros(int(0.16 * SR))
    for d in (0, 0.011, 0.023):
        s = noise_band(0.12, 900, 2600, 0.03); i = int(d * SR); x[i:i + len(s)] += s[:len(x) - i]
    return x * 0.8
def woodblock(f=880):
    t = t_(0.09)
    return fade((np.sin(2 * np.pi * f * t) + 0.4 * np.sin(2 * np.pi * 2.4 * f * t)) * np.exp(-t / 0.018), 0.0008, 0.01)


def sweep(f0, f1, dur, tau=None, curve=1.0):
    t = t_(dur); k = (t / dur) ** curve; f = f0 + (f1 - f0) * k
    x = np.sin(2 * np.pi * np.cumsum(f) / SR)
    if tau: x = x * np.exp(-t / tau)
    return fade(x, 0.003, 0.012)


def bubble(f0=None):
    f0 = f0 or rng.uniform(420, 900)
    return sweep(f0, f0 * rng.uniform(1.7, 2.3), rng.uniform(0.045, 0.08), tau=0.05, curve=1.6)


def quack(f0=430, dur=0.17):
    t = t_(dur); f = f0 * (1.0 - 0.28 * (t / dur) ** 0.7) * (1 + 0.012 * np.sin(2 * np.pi * 31 * t))
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = sum(np.sin(k * ph) / k for k in range(1, 14))            # band-limited saw
    b, a = signal.butter(2, [900 / (SR / 2), 2600 / (SR / 2)], 'band')  # nasal formant
    y = 0.35 * x + 1.6 * signal.lfilter(b, a, x)
    e = np.minimum(1, t / 0.012) * np.exp(-((t / dur) ** 3) * 3.0)
    return fade(np.tanh(y * 0.9) * e, 0.003, 0.02)


def hum(f0=175, f1=140, dur=0.26):
    t = t_(dur); f = f0 + (f1 - f0) * (t / dur) + 3 * np.sin(2 * np.pi * 9 * t)
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sin(ph) + 0.35 * np.sin(2 * ph) + 0.18 * np.sin(3 * ph)
    e = np.minimum(1, t / 0.03) * np.minimum(1, (dur - t) / 0.08)
    return fade(np.tanh(x * 0.8) * e, 0.004, 0.02)


# ---------- mixing ----------
class Mix:
    def __init__(self, dur):
        self.b = np.zeros((int(dur * SR) + 1, 2))

    def add(self, x, t, g=1.0, pan=0.0):
        i = int(t * SR)
        if i >= len(self.b): return
        x = x[:len(self.b) - i]
        l = np.cos((pan + 1) * np.pi / 4); r = np.sin((pan + 1) * np.pi / 4)
        self.b[i:i + len(x), 0] += x * g * l * 1.414
        self.b[i:i + len(x), 1] += x * g * r * 1.414

    def reverb(self, tau=0.35, mix=0.18, length=1.4):
        t = t_(length)
        ir = rng.standard_normal((len(t), 2)) * np.exp(-t / tau)[:, None]
        b, a = signal.butter(2, 5200 / (SR / 2)); ir = signal.lfilter(b, a, ir, axis=0)
        ir[:int(0.012 * SR)] = 0                                   # pre-delay
        ir /= np.sqrt((ir ** 2).sum(0)).mean()
        wet = np.stack([signal.fftconvolve(self.b[:, c], ir[:, c])[:len(self.b)] for c in (0, 1)], 1)
        self.b = self.b + mix * wet
        return self

    def out(self, peak_db=-3.0, tail_fade=0.05, lp=None):
        x = self.b
        if lp:
            b, a = signal.butter(2, lp / (SR / 2)); x = signal.lfilter(b, a, x, axis=0)
        # trim trailing silence
        m = np.abs(x).max(1); nz = np.nonzero(m > 10 ** (-66 / 20) * (m.max() + 1e-12))[0]
        x = x[:min(len(x), nz[-1] + int(0.03 * SR))]
        n = int(tail_fade * SR); x[-n:] *= np.linspace(1, 0, n)[:, None]
        return x / (np.abs(x).max() + 1e-12) * 10 ** (peak_db / 20)


def save(path, x):
    wavfile.write(path, SR, (np.clip(x, -1, 1) * 32767).astype(np.int16))
    rms = 20 * np.log10(np.sqrt((x ** 2).mean()) + 1e-12)
    print(f'{os.path.basename(path):16s} {len(x) / SR:6.2f}s  peak {20 * np.log10(np.abs(x).max()):5.1f} dB  rms {rms:5.1f} dB')


# =====================================================================
# SOUND EFFECTS
# =====================================================================
def sfx(out):
    def one(name, dur, build, peak=-6.0, rev=(0.25, 0.14), lp=None):
        m = Mix(dur); build(m)
        if rev: m.reverb(rev[0], rev[1], 1.0)
        save(f'{out}/{name}.wav', m.out(peak, lp=lp))

    # --- interface ---
    one('nav', 0.12, lambda m: m.add(fade(np.sin(2 * np.pi * 1250 * t_(0.035)) * np.exp(-t_(0.035) / 0.008), 0.001, 0.005), 0), peak=-16, rev=None)
    one('ok', 0.3, lambda m: (m.add(sweep(520, 940, 0.075, tau=0.04), 0), m.add(marimba(hz('E6'), 0.25), 0.02, 0.35)), peak=-9, rev=(0.15, 0.08))
    one('back', 0.3, lambda m: m.add(sweep(760, 400, 0.09, tau=0.05), 0), peak=-11, rev=(0.15, 0.08))
    one('open', 0.9, lambda m: [m.add(marimba(hz(n), 0.5), i * 0.075, 0.9) for i, n in enumerate(('G5', 'C6', 'E6'))], peak=-8)
    one('close', 0.8, lambda m: [m.add(marimba(hz(n), 0.45), i * 0.075, 0.8) for i, n in enumerate(('E6', 'C6', 'G5'))], peak=-10)
    one('step', 0.9, lambda m: (m.add(glock(hz('E6'), 0.8), 0, 0.8), m.add(glock(hz('A6'), 0.8), 0.09, 0.7)), peak=-9)
    one('learn', 1.3, lambda m: (m.add(glock(hz('A5'), 1.1), 0, 0.9, -0.2), m.add(glock(hz('E6'), 1.0), 0.02, 0.35, 0.2)), peak=-9, rev=(0.4, 0.2))
    one('bump', 0.2, lambda m: m.add(sweep(170, 95, 0.09, tau=0.04), 0), peak=-12, rev=None)
    one('tick', 0.12, lambda m: m.add(woodblock(920), 0), peak=-9, rev=(0.1, 0.06))

    # --- moments ---
    def chime(m):
        for i, n in enumerate(('C5', 'E5', 'G5', 'C6')):
            m.add(marimba(hz(n), 0.8), i * 0.11, 0.9, -0.3 + 0.2 * i)
        for n, g in (('C6', 0.5), ('E6', 0.4), ('G6', 0.32)):
            m.add(glock(hz(n), 1.8), 0.46, g)
    one('chime', 2.6, chime, peak=-6, rev=(0.45, 0.22))

    def warn(m):
        m.add(glock(hz('A5'), 1.4), 0.0, 0.9); m.add(glock(hz('F5'), 1.6), 0.42, 0.9)
        m.add(softpad(hz('F4'), 1.6, 0.2, 0.9), 0.0, 0.25)
    one('warn', 2.4, warn, peak=-8, rev=(0.5, 0.25))

    def start(m):
        seq = [('C5', 0), ('E5', .12), ('G5', .24), ('C6', .36), ('E6', .48), ('G6', .62)]
        for n, t in seq: m.add(marimba(hz(n), 0.9), t, 0.9, rng.uniform(-.4, .4))
        for n in ('C5', 'G5', 'C6', 'E6'): m.add(glock(hz(n), 2.2), 0.80, 0.45, rng.uniform(-.5, .5))
        m.add(softpad(hz('C4'), 2.0, 0.15, 1.2), 0.8, 0.35); m.add(softpad(hz('G4'), 2.0, 0.15, 1.2), 0.8, 0.25)
        for k in range(9): m.add(glock(hz(rng.choice(['C7', 'E7', 'G7', 'D7', 'A6'])), 0.5), 0.95 + k * 0.085, 0.16, rng.uniform(-.8, .8))
    one('start', 3.6, start, peak=-5, rev=(0.5, 0.22))

    def done(m):
        for i, n in enumerate(('C5', 'E5', 'G5', 'C6', 'E6', 'G6', 'C7')):
            m.add(marimba(hz(n), 0.7), i * 0.07, 0.85, -0.5 + i * 0.16)
        for t0, ch in ((0.56, ('C5', 'E5', 'G5', 'C6')), (0.98, ('F5', 'A5', 'C6', 'F6')), (1.40, ('G5', 'B5', 'D6', 'G6')), (1.82, ('C5', 'G5', 'C6', 'E6', 'G6'))):
            for n in ch: m.add(glock(hz(n), 2.0 if t0 > 1.5 else 0.9), t0, 0.42, rng.uniform(-.5, .5))
            m.add(clap(), t0, 0.5); m.add(kick(), t0, 0.7)
        for k in range(14): m.add(glock(hz(rng.choice(['C7', 'E7', 'G7', 'D7', 'A6', 'C8'])), 0.45), 1.9 + k * 0.07, 0.14, rng.uniform(-.9, .9))
    one('done', 4.2, done, peak=-4, rev=(0.45, 0.2))

    def sparkle(m):
        for k in range(10): m.add(glock(hz(rng.choice(['C7', 'E7', 'G7', 'A6', 'D7', 'G6'])), 0.5), k * 0.06, 0.5 * (1 - k / 14), rng.uniform(-.8, .8))
    one('sparkle', 1.4, sparkle, peak=-11, rev=(0.4, 0.25))

    def nap(m):
        for i, n in enumerate(('E6', 'C6', 'A5', 'G5', 'E5', 'C5', 'A4', 'G4')):
            m.add(musicbox(hz(n), 1.6), i * 0.17, 0.8 - i * 0.05, 0.5 - i * 0.14)
        m.add(softpad(hz('C4'), 2.6, 0.8, 1.2), 0.9, 0.3)
    one('nap', 4.2, nap, peak=-10, rev=(0.7, 0.3))

    def wake(m):
        for i, n in enumerate(('G4', 'C5', 'E5', 'G5', 'C6', 'E6')):
            m.add(musicbox(hz(n), 1.3), i * 0.12, 0.6 + i * 0.05, -0.5 + i * 0.2)
    one('wake', 2.6, wake, peak=-9, rev=(0.5, 0.25))

    one('bubble', 0.7, lambda m: [m.add(bubble(f), t, g, p) for f, t, g, p in ((520, 0, .8, -.3), (760, .13, .7, .3), (980, .24, .9, 0))], peak=-10, rev=(0.2, 0.15))

    # --- characters ---
    one('quack', 0.6, lambda m: (m.add(quack(440), 0.0, 1.0), m.add(quack(405, 0.2), 0.21, 0.95)), peak=-7, rev=(0.12, 0.07), lp=7000)
    one('bear', 0.8, lambda m: (m.add(hum(185, 150), 0.0, 1.0), m.add(hum(215, 165, 0.32), 0.30, 1.0)), peak=-12, rev=(0.15, 0.08), lp=5000)

    # --- emotions ---
    def happy(m):
        for i, n in enumerate(('C5', 'E5', 'G5', 'E5', 'G5', 'C6')):
            m.add(marimba(hz(n), 0.5), i * 0.095, 0.9, -0.3 + 0.12 * i)
        m.add(glock(hz('E6'), 1.2), 0.60, 0.45); m.add(glock(hz('C6'), 1.2), 0.60, 0.45)
    one('happy', 2.0, happy, peak=-7)

    def sad(m):
        for n, t, d in (('A4', 0.0, 0.55), ('F4', 0.5, 0.6), ('D4', 1.05, 1.0)):
            tt = t_(d); f = hz(n) * (1 - 0.018 * (tt / d)) * (1 + 0.006 * np.sin(2 * np.pi * 5.2 * tt))
            ph = 2 * np.pi * np.cumsum(f) / SR
            x = (np.sin(ph) + 0.2 * np.sin(2 * ph)) * np.minimum(1, tt / 0.08) * np.minimum(1, (d - tt) / 0.25)
            m.add(fade(x), t, 0.8)
    one('sad', 2.6, sad, peak=-10, rev=(0.6, 0.3), lp=4000)

    def angry(m):
        for t, f in ((0.0, 98), (0.26, 98), (0.52, 87)):
            tt = t_(0.22 if t < .5 else 0.4); ph = 2 * np.pi * f * tt
            x = (np.sin(ph) + 0.5 * np.sin(2 * ph) + 0.33 * np.sin(3 * ph) + 0.2 * np.sin(4 * ph)) * (0.65 + 0.35 * np.sin(2 * np.pi * 27 * tt))
            m.add(fade(np.tanh(x) * np.exp(-tt / 0.25), 0.006, 0.05), t, 0.9)
            m.add(kick(), t, 0.5)
    one('angry', 1.4, angry, peak=-8, rev=(0.15, 0.08), lp=2600)

    def scared(m):
        tt = t_(1.0); f = 880 * (1 - 0.35 * tt) * (1 + 0.03 * np.sin(2 * np.pi * 13 * tt))
        x = np.sin(2 * np.pi * np.cumsum(f) / SR) * (0.55 + 0.45 * np.sin(2 * np.pi * 13 * tt)) * np.minimum(1, tt / 0.05) * np.minimum(1, (1.0 - tt) / 0.3)
        m.add(fade(x), 0, 0.7)
        for k in range(5): m.add(woodblock(1500 - k * 90), 0.05 + k * 0.11, 0.25)
    one('scared', 1.6, scared, peak=-11, rev=(0.4, 0.22), lp=5000)

    def calm(m):
        for n, t, p in (('G5', 0, -.5), ('C6', 0.5, .4), ('E6', 1.05, 0), ('G6', 1.6, .3)):
            m.add(glock(hz(n), 2.4), t, 0.55, p)
        m.add(softpad(hz('C4'), 3.2, 1.0, 1.4), 0.0, 0.3); m.add(softpad(hz('G4'), 3.2, 1.2, 1.4), 0.0, 0.2)
    one('calm', 4.4, calm, peak=-10, rev=(0.9, 0.35))

    def surprised(m):
        m.add(sweep(300, 1250, 0.24, curve=0.6), 0.0, 0.7)
        tt = t_(0.5); x = np.sin(2 * np.pi * 1250 * tt + 5 * np.sin(2 * np.pi * 11 * tt) * np.exp(-tt / 0.2)) * np.exp(-tt / 0.14)
        m.add(fade(x), 0.22, 0.6)
        for k in range(5): m.add(glock(hz(('E7', 'G7', 'C7', 'A6', 'E7')[k]), 0.4), 0.3 + k * 0.06, 0.2, rng.uniform(-.7, .7))
    one('surprised', 1.4, surprised, peak=-10, rev=(0.3, 0.2), lp=9000)


# =====================================================================
# MUSIC LOOPS  (original compositions)
# =====================================================================
def lullaby(out):
    beat = 0.80; bar = 3 * beat
    A = [[('E5', 2), ('G5', 1)], [('A5', 2), ('G5', 1)], [('F5', 1), ('E5', 1), ('D5', 1)], [('E5', 3)],
         [('E5', 2), ('G5', 1)], [('C6', 2), ('A5', 1)], [('G5', 1), ('F5', 1), ('D5', 1)], [('C5', 3)]]
    B = [[('D5', 2), ('F5', 1)], [('E5', 2), ('G5', 1)], [('A5', 1), ('G5', 1), ('F5', 1)], [('G5', 3)],
         [('C6', 2), ('A5', 1)], [('G5', 2), ('E5', 1)], [('F5', 1), ('D5', 1), ('B4', 1)], [('C5', 3)]]
    CA = ['C', 'F', 'G', 'C', 'C', 'F', 'G', 'C']; CB = ['G', 'C', 'F', 'G', 'Am', 'C', 'G', 'C']
    ARP = {'C': ('C4', 'G4', 'E4'), 'F': ('C4', 'A4', 'F4'), 'G': ('B3', 'G4', 'D4'), 'Am': ('C4', 'A4', 'E4')}
    PAD = {'C': ('C4', 'E4'), 'F': ('C4', 'F4'), 'G': ('B3', 'D4'), 'Am': ('C4', 'E4')}
    form = [(A, CA), (A, CA), (B, CB), (A, CA)]
    m = Mix(len(form) * 8 * bar + 5)
    t = 0.6
    for si, (mel, ch) in enumerate(form):
        for bi, (notes, c) in enumerate(zip(mel, ch)):
            tb = t;
            for n, d in notes:
                m.add(musicbox(hz(n), 2.4), tb + rng.uniform(-.006, .006), 0.62, 0.12)
                if si in (1, 3) and d >= 2:                       # echo an octave up on repeats
                    m.add(musicbox(hz(n) * 2, 1.6), tb + beat, 0.13, -0.35)
                tb += d * beat
            for k, n in enumerate(ARP[c]):
                m.add(musicbox(hz(n), 2.0), t + k * beat + 0.012, 0.22, -0.25)
            for n in PAD[c]:
                m.add(softpad(hz(n), bar + 0.5, 0.9, 1.0), t, 0.07)
            t += bar
    m.add(musicbox(hz('C6'), 3.0), t, 0.3, 0.2); m.add(musicbox(hz('G5'), 3.0), t + 0.05, 0.25, -0.2)
    m.reverb(0.8, 0.30, 2.2)
    x = m.out(-6.0, tail_fade=1.5, lp=9000)
    n = int(0.4 * SR); x[:n] *= np.linspace(0, 1, n)[:, None]
    save(f'{out}/lullaby.wav', x)


def cleanup(out):
    bpm = 126; q = 60 / bpm; e = q / 2; bar = 4 * q
    M1 = ['C5 E5 G5 E5 C5 E5 G5 -', 'A5 G5 E5 G5 C6 - G5 -', 'F5 A5 C6 A5 F5 A5 C6 -', 'B5 A5 G5 F5 D5 - G5 -',
          'C5 E5 G5 E5 C5 E5 G5 -', 'A5 C6 E6 C6 A5 - E5 -', 'F5 A5 C6 A5 G5 B5 D6 B5', 'C6 - G5 - C6 - - -']
    M2 = ['E5 G5 C6 G5 E5 G5 C6 -', 'C6 A5 G5 A5 E6 - C6 -', 'A5 C6 F6 C6 A5 C6 F6 -', 'D6 C6 B5 A5 G5 - B5 -',
          'E5 G5 C6 G5 E5 G5 C6 -', 'C6 E6 A6 E6 C6 - A5 -', 'A5 C6 F6 C6 B5 D6 G6 D6', 'C6 G5 E5 G5 C6 - - -']
    CH = ['C', 'C', 'F', 'G', 'C', 'Am', 'FG', 'C']
    BASS = {'C': ('C3', 'G3'), 'F': ('F2', 'C3'), 'G': ('G2', 'D3'), 'Am': ('A2', 'E3')}
    m = Mix(16 * bar + 1.2)
    for half, mel in enumerate((M1, M2)):
        for bi, (row, c) in enumerate(zip(mel, CH)):
            t0 = (half * 8 + bi) * bar
            for k, n in enumerate(row.split()):
                if n == '-': continue
                tt = t0 + k * e + (0.012 if k % 2 else 0)            # light swing
                m.add(marimba(hz(n), 0.5, 1.1), tt, 0.62, 0.15)
                if half == 1 and k % 2 == 0: m.add(glock(hz(n) * 2, 0.6), tt, 0.10, -0.4)
            chs = [c[0], c[1]] if c == 'FG' else [c, c]
            for h, cc in enumerate(chs):
                r, f5 = BASS[cc]
                m.add(pizz(hz(r), 0.45), t0 + h * 2 * q, 0.5, -0.1)
                m.add(pizz(hz(f5), 0.35), t0 + h * 2 * q + q, 0.38, -0.1)
            for b in range(4):
                tb = t0 + b * q
                if b in (0, 2): m.add(kick(), tb, 0.38)
                if b in (1, 3): m.add(clap(), tb, 0.30, 0.2)
                m.add(shaker(), tb, 0.16, 0.5); m.add(shaker(), tb + e, 0.24, 0.5)
            if bi == 7 and half == 1:
                for k in range(8): m.add(glock(hz(('C7', 'E7', 'G7', 'C7', 'A6', 'G7', 'E7', 'C7')[k]), 0.4), t0 + 2 * q + k * 0.06, 0.12, rng.uniform(-.8, .8))
    m.reverb(0.28, 0.13, 1.0)
    x = m.out(-5.0, tail_fade=0.3, lp=12000)
    save(f'{out}/cleanup.wav', x)


def wash(out):
    dq = 60 / 92; e = dq / 3; bar = 2 * dq
    M = ['G5 B5 D6 B5 G5 B5', 'D6 - B5 G5 - -', 'E5 G5 C6 G5 E5 G5', 'F#5 A5 D6 - A5 -',
         'G5 B5 D6 B5 G5 B5', 'E6 - B5 G5 - E5', 'E5 G5 C6 F#5 A5 D6', 'G5 - - D6 G6 -']
    CH = ['G', 'G', 'C', 'D', 'G', 'Em', 'CD', 'G']
    BASS = {'G': 'G3', 'C': 'C3', 'D': 'D3', 'Em': 'E3'}
    m = Mix(16 * bar + 1.5)
    for rep in range(2):
        for bi, (row, c) in enumerate(zip(M, CH)):
            t0 = (rep * 8 + bi) * bar
            for k, n in enumerate(row.split()):
                if n == '-': continue
                m.add(glock(hz(n), 0.9), t0 + k * e, 0.5, 0.2)
                if rep == 1: m.add(marimba(hz(n) / 2, 0.4), t0 + k * e, 0.22, -0.3)
            chs = [c[0], c[1]] if c == 'CD' else [c, c]
            for h, cc in enumerate(chs):
                m.add(pizz(hz(BASS[cc]), 0.5), t0 + h * dq, 0.42, -0.1)
                m.add(shaker(), t0 + h * dq + 2 * e, 0.18, 0.5)
            for _ in range(3):                                   # bubbles
                m.add(bubble(), t0 + rng.uniform(0, bar - 0.1), rng.uniform(0.10, 0.22), rng.uniform(-.9, .9))
    m.reverb(0.35, 0.18, 1.2)
    save(f'{out}/wash.wav', m.out(-6.0, tail_fade=0.4, lp=12000))


if __name__ == '__main__':
    out = sys.argv[1]; os.makedirs(out, exist_ok=True)
    sfx(out); lullaby(out); cleanup(out); wash(out)
