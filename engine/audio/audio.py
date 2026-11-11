# Stems for "The War Over One Pig": original march score + synthesized SFX (numpy/scipy, instruments from the
# cartoon-3d-short audio kit). Writes music.wav and sfx.wav (48 kHz mono float), exact video length.
import sys, numpy as np
from dsp import SR, TAU, ns, tt, rng, lp, hp, bp, fades, dbg, write_wav
from instruments import m2f, brass, glock, pluck, snare, pad, timpani, fife, triangle, cymbal, musicbox, brush
from sfx_gen import whoosh, hammer_hit, wood_crack, boot, clink, bubbles, water_bed, crickets, bird_chirps, breeze, rattle, push_thump, creak

DUR = 1347 / 30.0
N = ns(DUR)
R = rng(7)
F = lambda fr: fr / 30.0


def mono(x):
    x = np.asarray(x, float)
    return x.mean(axis=1) if x.ndim == 2 else x


def put(buf, x, t, g=1.0):
    x = mono(x); i = ns(t)
    if i >= len(buf): return
    j = min(len(buf), i + len(x)); buf[i:j] += g * x[: j - i]


# ================================================================ music
mus = np.zeros(N)
BPM = 116; B = 60 / BPM
# F major march. bass roots per bar (oom-pah), fife tune 2 bars repeating
F3, C3, Bb2, G3 = 53, 48, 46, 55
BARS = [F3, C3, F3, C3, Bb2, F3, C3, F3]
TUNE = [(72, 1), (72, .5), (74, .5), (76, 1), (72, 1), (77, 1), (76, .5), (74, .5), (72, 2),
        (74, 1), (74, .5), (76, .5), (77, 1), (74, 1), (79, 1), (77, .5), (76, .5), (77, 2)]
STOP = F(1255)          # "The only casualty?" -> music stops


def march(t0, t1, fifeOn=True, drums=True, level=1.0, tuba=True):
    bar = 0; t = t0
    while t < t1 - 0.05:
        root = BARS[bar % len(BARS)]
        for beat in range(4):
            tb = t + beat * B
            if tb >= t1: break
            if tuba:
                if beat % 2 == 0: put(mus, brass(m2f(root - 12), B * 0.8, 0.75, R, 'tuba'), tb, 0.55 * level)
                else: put(mus, brass(m2f(root + 4 if root != Bb2 else root + 4), B * 0.45, 0.5, R, 'horn'), tb, 0.22 * level)
            if drums:
                put(mus, snare(0.45 + (0.25 if beat in (1, 3) else 0), R, 0.3), tb, 0.35 * level)
                if beat in (1, 3): put(mus, snare(0.3, R, 0.2), tb + B / 2, 0.2 * level)
        bar += 1; t += 4 * B
    if fifeOn:
        t = t0; i = 0
        while t < t1 - 0.1:
            m, d = TUNE[i % len(TUNE)]
            put(mus, fife(m2f(m), d * B * 0.9, 0.6, R), t, 0.32 * level)
            t += d * B; i += 1


# hook + setting + escalation (0 - 25 s): march, a bit lighter at the start
march(0.0, F(273), fifeOn=True, drums=True, level=0.8)
march(F(273), F(751), fifeOn=True, drums=True, level=1.0)
# snare roll building into the cannons (f600 - f650)
for k in range(int((F(650) - F(600)) * 24)):
    tb = F(600) + k / 24; put(mus, snare(0.25 + 0.5 * k / ((F(650) - F(600)) * 24), R, 0.12, buzz=True), tb, 0.25)
put(mus, cymbal(0.6, R, 1.8), F(622), 0.35)
# the admiral refuses (25 - 30 s): band drops out, soft pad + pizzicato
put(mus, pad([m2f(53), m2f(57), m2f(60)], F(906) - F(751), 0.45, R, att=0.3, rel=0.6), F(751), 0.5)
for k, m in enumerate([60, 57, 53, 57, 60, 62, 60, 57, 55, 57, 60, 65, 64, 62, 60, 57]):
    put(mus, pluck(m2f(m), 0.6, R, 0.6), F(751) + k * B * 0.68, 0.45)
# boredom + time-lapse (30 - 34 s): slow tuba, ticking
for k in range(int((F(1031) - F(907)) / (B * 2))):
    tb = F(907) + k * B * 2; put(mus, brass(m2f([41, 36][k % 2]), B * 1.6, 0.5, R, 'soft'), tb, 0.5)
for k in range(13): put(mus, brush(0.6, R, 0.2), F(977) + k * (F(1027) - F(977)) / 13, 0.4)
# party (34.4 - 37 s): festive march with glock
march(F(1031), F(1111), fifeOn=True, drums=True, level=0.95)
for k in range(int((F(1111) - F(1031)) / B)): put(mus, glock(m2f([84, 81, 77, 81][k % 4]), 0.5, R, 0.6), F(1031) + k * B, 0.18)
# emperor (37 - 41.8 s): grand brass chords, timpani on the stamp
for k, ch in enumerate([[53, 57, 60], [55, 58, 62], [57, 60, 64]]):
    for m in ch: put(mus, brass(m2f(m), B * 1.8, 0.65, R, 'horn'), F(1111) + k * B * 2, 0.22)
put(mus, timpani(m2f(41), 0.6, R), F(1150), 0.4)
put(mus, timpani(m2f(41), 1.0, R), F(1173), 0.8)
for m in [53, 57, 60, 65]: put(mus, brass(m2f(m), B * 3, 0.85, R, 'stab'), F(1173), 0.25)
march(F(1200), STOP, fifeOn=True, drums=False, level=0.8)
# hard stop at the twist + sting + drone
mus[ns(STOP):] = 0
put(mus, brass(m2f(29), 1.6, 0.9, R, 'tuba'), STOP, 0.8)
put(mus, timpani(m2f(29), 0.9, R, 2.4), STOP, 0.7)
put(mus, pad([m2f(41), m2f(48)], DUR - STOP - 0.3, 0.35, R, att=0.4, rel=0.3, warm=500), STOP + 0.1, 0.45)
# payoff on "The pig.": a heavenly music-box chime
for k, m in enumerate([84, 88, 91, 96]): put(mus, musicbox(m2f(m), 0.6, R, 1.2), F(1322) + k * 0.06, 0.35)
mus = fades(mus, 0.01, 0.4)

# ================================================================ sfx
sfx = np.zeros(N)
def ting(t, f=2093, g=0.6): put(sfx, glock(f, 0.8, R, 1.2), t, g)
def thunk(t, big=1.0, g=1.0): put(sfx, hammer_hit(R, big), t, g)
def gunshot(t):
    n = ns(1.4); x = np.arange(n) / SR
    crack = hp(R.standard_normal(n), 900) * np.exp(-x / 0.025)
    boom = lp(R.standard_normal(n), 220) * np.exp(-x / 0.25) * 3.0
    tail = bp(R.standard_normal(n), 300, 2500) * np.exp(-x / 0.45) * 0.25
    put(sfx, fades(crack + boom + tail, 0.0005, 0.2), t, 1.2)
def hiss(t, dur=0.9, g=0.6):
    n = ns(dur); x = np.arange(n) / SR
    put(sfx, fades(hp(R.standard_normal(n), 2500) * np.exp(-x / (dur * 0.4)) * (1 - np.exp(-x / 0.01)), 0.002, 0.1), t, g)
def oink(t, g=0.7):
    n = ns(0.32); x = np.arange(n) / SR
    f0 = 230 * (1 + 0.25 * np.exp(-x / 0.05)) - 60 * x
    ph = np.cumsum(TAU * f0 / SR); saw = 2 * ((ph / TAU) % 1) - 1
    v = bp(saw + 0.3 * R.standard_normal(n), 500, 1800) * np.sin(np.pi * x / 0.32) ** 0.6
    put(sfx, fades(v, 0.005, 0.05), t, g)
def pop(t, g=0.35):
    n = ns(0.5); x = np.arange(n) / SR
    put(sfx, fades(bp(R.standard_normal(n), 400, 4000) * np.exp(-x / 0.06) + lp(R.standard_normal(n), 150) * np.exp(-x / 0.12), 0.001, 0.1), t, g)

# farm ambience: birds + breeze
for a, b in [(0, F(132)), (F(273), F(499))]:
    put(sfx, bird_chirps(b - a, R, 0.6), a, 0.25); put(sfx, breeze(b - a, R, 0.5), a, 0.25)
hiss(F(55), 0.65, 0.35)                                  # fuses fizz on "war"
ting(F(88), 2349, 0.55)                                 # pig looks up
put(sfx, whoosh(1.6, R, 0.4), F(176), 0.8)              # crane up and back
thunk(F(226), 1.3, 0.35); thunk(F(241), 1.3, 0.35)                  # flags slam
put(sfx, wood_crack(R), F(296), 0.35)                    # door bursts open
put(sfx, boot(R, 1.2), F(352), 0.8)                     # farmer stomps
gunshot(F(396))                                         # "So he shoots it."
put(sfx, triangle(0.6, R, 1.4), F(412), 0.5)            # halo
put(sfx, whoosh(0.4, R, 0.3, 600, 3000), F(452), 0.45)  # finger jab
for k in range(int((F(570) - F(499)) / 0.5)): put(sfx, boot(R, 0.9), F(499) + 0.12 + k * 0.5, 0.55)   # marching boots
put(sfx, water_bed(F(906) - F(570), R, 0.6), F(570), 0.35)  # sea under the ship shots
put(sfx, creak(1.6, R), F(590), 0.4)
for k in range(30): put(sfx, push_thump(R), F(620) + k * 0.06 + R.uniform(0, 0.02), 0.25)  # gunports clack open
put(sfx, whoosh(1.0, R, 0.35), F(690), 0.7)             # glide off the ships
ting(F(708), 2637, 0.5)                                 # the lonely potato
put(sfx, whoosh(0.3, R, 0.3, 500, 2500), F(769), 0.4)   # STOP palm
hiss(F(802), 1.0, 0.55); put(sfx, bubbles(0.6, R, 30), F(802), 0.35)   # torch dunked
put(sfx, pluck(m2f(84), 0.7, R, 0.4), F(865), 0.5)      # thought bubble pops
put(sfx, whoosh(1.2, R, 0.3, 300, 2500), F(975), 0.8)   # time-lapse
put(sfx, crickets(F(1111) - F(1031), R), F(1031), 0.3)
put(sfx, rattle(F(1111) - F(1031), R, 18), F(1031), 0.15)  # fire crackle
put(sfx, clink(R, 1800, 0.2), F(1055), 0.9); put(sfx, clink(R, 2400, 0.15), F(1056), 0.6)
for k in range(4):
    for rep in range(3): pop(F(1031 + k * 17 + rep * 28) + 0.05, 0.3)
put(sfx, whoosh(0.35, R, 0.3, 500, 2500), F(1112), 0.5)  # stamp raised
thunk(F(1173), 1.5, 0.4)                                 # SLAM
put(sfx, breeze(F(1255) - F(1200), R, 0.6), F(1200), 0.25)
put(sfx, crickets(DUR - F(1255), R), F(1255), 0.25)
oink(F(1340) + 0.0, 0.6)                                 # ghost pig, after the last word
sfx = fades(sfx, 0.005, 0.2)

from scipy.io import wavfile
wavfile.write('music.wav', SR, (mus / np.abs(mus).max() * 0.9).astype(np.float32))
wavfile.write('sfx.wav', SR, (sfx / np.abs(sfx).max() * 0.9).astype(np.float32))
print('music peak %.2f  sfx peak %.2f  len %.3f s' % (np.abs(mus).max(), np.abs(sfx).max(), N / SR))
