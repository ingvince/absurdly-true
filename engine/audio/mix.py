# Level lock: music at 50 % of the voice (gated RMS, -6.0 dB), SFX at 50 % or less with peaks <= 0.7 x voice peak.
# Voice untouched. One linear gain per stem, no ducking, no compression. Writes mix.wav (48 kHz stereo).
import subprocess, numpy as np
from dsp import SR, read_wav, write_wav

def load_voice(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).astype(float)

def gated_rms(x, win=0.4, rel_db=-30.0):
    n = int(win * SR); k = len(x) // n
    r = np.sqrt(np.mean(x[: k * n].reshape(k, n) ** 2, axis=1) + 1e-20)
    act = r > r.max() * 10 ** (rel_db / 20)
    return np.sqrt(np.mean(r[act] ** 2)), act.mean()

def mono(x): return x.mean(axis=1) if x.ndim == 2 else x

N = round(1347 / 30 * SR)
v = load_voice('../voice.mp3'); v = np.pad(v, (0, max(0, N - len(v))))[:N]
from scipy.io import wavfile
m = wavfile.read('music.wav')[1].astype(float)[:N]
s = wavfile.read('sfx.wav')[1].astype(float)[:N]
m = np.pad(m, (0, N - len(m))); s = np.pad(s, (0, N - len(s)))
vr, va = gated_rms(v); mr, ma = gated_rms(m); sr_, sa = gated_rms(s)
gm = 0.5 * vr / mr
gs = min(0.5 * vr / sr_, 0.7 * np.abs(v).max() / np.abs(s).max())
m2, s2 = m * gm, s * gs
db = lambda a, b: 20 * np.log10(a / b)
print(f'voice gated RMS {20*np.log10(vr):.1f} dBFS (active {va*100:.0f} %), peak {20*np.log10(np.abs(v).max()):.1f} dBFS')
print(f'music: gain {20*np.log10(gm):+.1f} dB -> {db(gated_rms(m2)[0], vr):+.1f} dB vs voice')
print(f'sfx:   gain {20*np.log10(gs):+.1f} dB -> {db(gated_rms(s2)[0], vr):+.1f} dB vs voice, peak {np.abs(s2).max()/np.abs(v).max():.2f} x voice peak')
mix = v + m2 + s2
wavfile.write('mix.wav', SR, np.stack([mix, mix], 1).astype(np.float32))
wavfile.write('music_g.wav', SR, m2.astype(np.float32)); wavfile.write('sfx_g.wav', SR, s2.astype(np.float32))
print('mix peak', round(float(np.abs(mix).max()), 3), 'len', len(mix) / SR)
