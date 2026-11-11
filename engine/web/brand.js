// Channel art for "Absurdly True": banner 2560x1440 and profile 800x800, drawn with the same Pen cast.
import { Pen, bodyFront, INK } from './toon.js';
import { pig, FARMER, REDCOAT, BLUECOAT, ADMIRAL, EMPEROR, SAILOR, ARMS, musketAim } from './cast.js';
export const RICH = { jacket: '#3b2f5a', pants: '#2a2533', boots: INK, hat: 'tophat', buttons: '#e8c45a', moustache: '#6a4026', skin: '#ffe2c2', build: 'stout', belt: null };
const monocle = (p, o) => { const u = o.W / 100, x = o.cx + 13 * u + 7 * u * (o.facing || 0), y = o.hc; p.rot = o.rot;
  p.ell(x, y, 12.5 * u, 12.5 * u, null, 3.2 * u); const g = p.g; p.ell(x, y, 10.5 * u, 10.5 * u, 'rgba(210,235,255,0.35)', 0);
  p.ell(x, y, 12.5 * u, 12.5 * u, null, 1.6 * u); g.save(); p.stroke([[x + 10 * u, y + 7 * u], [x + 16 * u, y + 30 * u], [x + 8 * u, y + 52 * u], [x + 2 * u, y + 64 * u]], 1.4 * u, '#c9a23a'); g.restore();
  const gg = p.g; p.rot = null; };
export function richMan(p, opts) { const out = {}; bodyFront(p, RICH, Object.assign({ out }, opts)); out.facing = opts.facing || 0; monocle(p, out); }
const bubble = (g, x, y, r, t) => { g.save(); g.fillStyle = '#ffffff'; g.lineWidth = 10; g.strokeStyle = INK; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); g.stroke();
  g.beginPath(); g.moveTo(x - r * 0.3, y + r * 0.85); g.lineTo(x - r * 0.6, y + r * 1.4); g.lineTo(x + r * 0.1, y + r * 0.95); g.fill(); g.font = `900 ${r * 1.3}px Georgia`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#e2453c'; g.fillText(t, x, y + r * 0.06); g.restore(); };

const TAU = Math.PI * 2;
function sky(g, w, h, top = '#3e7fd2', hor = '#bfe0f4') { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, top); gr.addColorStop(1, hor); g.fillStyle = gr; g.fillRect(0, 0, w, h); }
function cloud(g, x, y, s) {
  const lob = [[0, 0, 60], [55, -25, 70], [120, 0, 58], [60, 15, 60], [-45, 12, 42], [165, 15, 40]];
  g.save(); g.translate(x, y); g.scale(s, s);
  g.fillStyle = '#c9d3ee'; g.beginPath(); for (const [a, b, r] of lob) { g.moveTo(a + r, b + 8); g.arc(a, b + 8, r, 0, TAU); } g.fill();
  g.fillStyle = '#fbf8f1'; g.beginPath(); for (const [a, b, r] of lob) { g.moveTo(a + r * 0.9 - 6, b - 4); g.arc(a - 6, b - 4, r * 0.9, 0, TAU); } g.fill();
  g.restore();
}
function hill(g, x, y, rx, ry, col) { g.fillStyle = col; g.beginPath(); g.ellipse(x, y, rx, ry, 0, Math.PI, TAU); g.fill(); g.lineWidth = 6; g.strokeStyle = INK; g.stroke(); }
function pine(g, x, y, h) {
  g.fillStyle = '#6b4428'; g.fillRect(x - h * 0.04, y - h * 0.25, h * 0.08, h * 0.25);
  for (let i = 0; i < 3; i++) { const w = h * (0.32 - i * 0.07), yy = y - h * (0.18 + i * 0.22); g.beginPath(); g.moveTo(x - w, yy); g.lineTo(x, yy - h * 0.42); g.lineTo(x + w, yy); g.closePath(); g.fillStyle = ['#2f7a4a', '#3a8a52', '#2a6a44'][i]; g.fill(); g.lineWidth = 5; g.strokeStyle = INK; g.stroke(); }
}
function card(g, draw, x, y, s) { g.save(); g.translate(x - 300 * s, y - 975 * s); g.scale(s, s); draw(new Pen(g)); g.restore(); }
function title(g, x, y, size, txt, fill = '#ffd34d') {
  g.save(); g.font = `900 ${size}px Georgia, serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.lineJoin = 'round'; g.lineWidth = size * 0.2; g.strokeStyle = INK; g.strokeText(txt, x, y + size * 0.06);
  g.lineWidth = size * 0.16; g.strokeText(txt, x, y); g.fillStyle = fill; g.fillText(txt, x, y);
  g.restore();
}

export function banner() {
  const cv = document.createElement('canvas'); cv.width = 2560; cv.height = 1440; const g = cv.getContext('2d');
  sky(g, 2560, 1440);
  for (const [x, y, s] of [[200, 260, 1.4], [700, 180, 1.0], [1900, 230, 1.5], [2350, 360, 1.0], [1350, 120, 0.9]]) cloud(g, x, y, s);
  // sea strip, hills, pines
  g.fillStyle = '#1e7fb0'; g.fillRect(0, 820, 2560, 60);
  hill(g, 400, 920, 700, 150, '#5c9a48'); hill(g, 2200, 920, 800, 160, '#6aa84f'); hill(g, 1300, 950, 900, 110, '#74b257');
  for (const [x, h] of [[60, 200], [470, 170], [2090, 180], [2520, 200]]) pine(g, x, 905, h);
  g.fillStyle = '#7fbf5e'; g.fillRect(0, 900, 2560, 540);
  let rs = 5; const rr = () => { rs = (rs * 16807) % 2147483647; return rs / 2147483647; };
  for (let i = 0; i < 260; i++) { const x = rr() * 2560, y = 960 + rr() * 470; g.strokeStyle = 'rgba(70,130,50,0.6)'; g.lineWidth = 4; g.beginPath(); g.moveTo(x - 6, y - 16); g.lineTo(x, y); g.lineTo(x + 6, y - 14); g.stroke(); }
  for (let i = 0; i < 70; i++) { const x = rr() * 2560, y = 980 + rr() * 440; g.fillStyle = ['#f7f3e8', '#f4d24a', '#f3a9bb'][i % 3]; g.beginPath(); g.arc(x, y, 7, 0, TAU); g.fill(); } 
  // cast line-up (safe area: x 507..2053, y 508..932)
  const s = 0.44, base = 918;
  card(g, (p) => bodyFront(p, EMPEROR, { mode: 'stand', expr: 'smile', facing: 1, seed: 60, arms: ARMS.hips }), 110, base, s);
  card(g, (p) => bodyFront(p, REDCOAT, { mode: 'stand', expr: 'stern', facing: 1, seed: 7, arms: ARMS.hips }), 255, base, s);
  card(g, (p) => bodyFront(p, SAILOR, { mode: 'stand', expr: 'shock', facing: 1, seed: 12, arms: ARMS.cheer }), 395, base, s * 0.95);
  card(g, (p) => richMan(p, { mode: 'stand', expr: 'smile', facing: -1, seed: 70, arms: ARMS.hips }), 2170, base, s * 0.97);
  card(g, (p) => bodyFront(p, FARMER, { mode: 'stand', expr: 'grin', facing: -1, seed: 3, arms: ARMS.cross }), 2310, base, s);
  card(g, (p) => bodyFront(p, BLUECOAT(0), { mode: 'stand', expr: 'neutral', facing: -1, seed: 41, arms: ARMS.musketUp }), 2450, base, s);
  title(g, 1280, 655, 168, 'ABSURDLY TRUE');
  g.save(); g.font = '700 62px Georgia, serif'; g.textAlign = 'center'; g.fillStyle = '#ffffff'; g.lineWidth = 14; g.strokeStyle = INK; g.lineJoin = 'round';
  g.strokeText('True stories. Weird facts. Real history.', 1280, 815); g.fillText('True stories. Weird facts. Real history.', 1280, 815); g.restore();
  return cv.toDataURL('image/png');
}

export function profile() {
  const cv = document.createElement('canvas'); cv.width = 800; cv.height = 800; const g = cv.getContext('2d');
  const gr = g.createRadialGradient(400, 330, 60, 400, 400, 560); gr.addColorStop(0, '#ffe08a'); gr.addColorStop(1, '#f09a3a'); g.fillStyle = gr; g.fillRect(0, 0, 800, 800);
  g.save(); g.globalAlpha = 0.18; g.fillStyle = '#ffffff'; for (let i = 0; i < 16; i++) { g.beginPath(); g.moveTo(400, 400); g.arc(400, 400, 700, i / 16 * TAU, (i + 0.5) / 16 * TAU); g.fill(); } g.restore();
  // pig head close-up: draw the full pig large and crop to its head
  card(g, (p) => richMan(p, { mode: 'stand', expr: 'smile', facing: 0, seed: 70, arms: ARMS.hips }), 400, 1520, 1.45);
  return cv.toDataURL('image/png');
}
