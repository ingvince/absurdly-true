# Dynamic TikTok-style captions (ASS): 2-3 words per chunk, active word yellow + bigger, pop-in, keywords larger.
import json, re
P = json.load(open('work/phrases.json'))['phrases']
# display tokens per phrase: (shown text, spoken text for syllable weight)
DISPLAY = {2: [("IT'S", "its"), ("1859,", "eighteen fifty nine")], 8: None}
KEY = {'WAR', 'PIG', 'PIG.', 'PIG?', 'SHOOTS', 'SEVENTY', 'CANNONS.', 'TWELVE', 'YEARS.', 'POTATO', 'PATCH.', 'REFUSED', 'HOLIDAYS', 'EMPEROR', 'CASUALTY?', 'ISLAND', 'WAR.', 'FIRE.'}
def syl(w):
    w = re.sub(r'[^a-z]', '', w.lower()) or 'a'
    n = len(re.findall(r'[aeiouy]+', w)); n -= 1 if w.endswith('e') and n > 1 else 0
    return max(1, n)
words = []
for ph in P:
    toks = DISPLAY.get(ph['i']) or [(w.upper(), w) for w in ph['text'].split()]
    wts = [sum(syl(x) for x in sp.split()) + 0.35 for _, sp in toks]
    tot = sum(wts); t = ph['t0']; dur = ph['t1'] - ph['t0']
    for (shown, _), w in zip(toks, wts):
        d = dur * w / tot; words.append(dict(t0=t, t1=t + d, w=shown, ph=ph['i'])); t += d
# chunks: max 3 words, break at phrase end or when a word ends with punctuation and chunk has >= 2 words
chunks, cur = [], []
for i, w in enumerate(words):
    cur.append(w)
    nxt = words[i + 1] if i + 1 < len(words) else None
    endp = nxt is None or nxt['ph'] != w['ph']
    small = w['w'].strip(',.?') in {'TO', 'A', 'THE', 'AND', 'OF', 'ON', 'AT', 'OVER', 'AN', 'HIS', 'ONE', 'WENT', 'SO', 'BUT', 'HE', 'WITH', 'NOT', 'JUST', 'THEY', 'EVEN', 'ALL', 'ONLY', 'WOULD'}
    if endp or ((len(cur) >= 3 or (len(cur) >= 2 and w['w'][-1] in ',.?') or len(''.join(x['w'] for x in cur)) > 16) and not (small and len(cur) < 4)):
        chunks.append(cur); cur = []
merged = []
for ch in chunks:
    if merged and len(ch) == 1 and ch[0]['ph'] == merged[-1][-1]['ph'] and len(' '.join(x['w'] for x in merged[-1] + ch)) <= 18: merged[-1] = merged[-1] + ch
    else: merged.append(ch)
chunks = merged
def ts(t): h = int(t // 3600); m = int(t % 3600 // 60); s = t % 60; return f"{h}:{m:02d}:{s:05.2f}"
YEL, WHT = '&H0034D3FF&', '&H00FFFFFF&'
out = ["[Script Info]", "ScriptType: v4.00+", "PlayResX: 1080", "PlayResY: 1920", "WrapStyle: 0", "",
       "[V4+ Styles]", "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding",
       "Style: Cap,Poppins,100,&H00FFFFFF,&H00FFFFFF,&H00261624,&H96000000,-1,0,0,0,100,100,1,0,1,10,5,2,80,80,520,1", "",
       "[Events]", "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text"]
for ci, ch in enumerate(chunks):
    start = ch[0]['t0']; end = ch[-1]['t1']
    nxt = chunks[ci + 1][0]['t0'] if ci + 1 < len(chunks) else end + 0.3
    end = nxt if nxt - end < 0.35 else end + 0.2
    for k, w in enumerate(ch):
        a = w['t0'] if k else start
        b = ch[k + 1]['t0'] if k + 1 < len(ch) else end
        parts = []
        for j, x in enumerate(ch):
            big = x['w'] in KEY
            size = 124 if big else 100
            if j == k: parts.append(r"{\c" + YEL + r"\fs" + str(int(size * 1.12)) + "}" + x['w'])
            else: parts.append(r"{\c" + WHT + r"\fs" + str(size) + "}" + x['w'])
        pop = r"{\fscx78\fscy78\t(0,90,\fscx106\fscy106)\t(90,160,\fscx100\fscy100)}" if k == 0 else ""
        out.append(f"Dialogue: 0,{ts(a)},{ts(b)},Cap,,0,0,0,,{pop}" + " ".join(parts))
open('out/captions.ass', 'w').write("\n".join(out) + "\n")
print(len(chunks), 'chunks,', len(words), 'words')
for ch in chunks[:8]: print(round(ch[0]['t0'], 2), ' '.join(x['w'] for x in ch))
