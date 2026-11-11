// Cast: camera-facing character cards drawn with the toon.js Pen, the pig, effect cards, contact blobs.
import * as THREE from 'three';
import { scene, camera, NOINK, curLight } from './engine.js';
import { Pen, bodyFront, bodySide, INK, mix, shade, fxPuff, fxBurst, fxStars, fxCloud } from './toon.js';
export { INK };

export const UNIT = 0.00225;           // m per design unit (600 x 1000 design canvas, card 1.35 x 2.25 m)
const RES = 2;                          // canvas px per design unit

// ---------------- outfits ----------------
export const FARMER = { jacket: '#c9573f', pants: '#3f63a8', boots: '#5a3b2a', hat: 'straw', skin: '#f5c9a0', beard: '#8a5a33', beardLen: 0.2, build: 'adult' };
export const REDCOAT = { jacket: '#c8302c', pants: '#2b2b3a', boots: INK, hat: 'shako_tall', belt: '#f1efe6', buttons: '#e8c45a', moustache: '#8a5a33', skin: '#ffe2c2', build: 'stout' };
export const BRSOLDIER = (v = 0) => ({ jacket: '#c8302c', pants: '#2b2b3a', boots: INK, hat: 'shako', belt: '#f1efe6', buttons: '#e8c45a', skin: ['#ffe2c2', '#f5c9a0', '#ecd0b6'][v % 3], moustache: v % 2 ? '#6a4026' : undefined });
export const BLUECOAT = (v = 0) => ({ jacket: '#2f4a7d', pants: '#7f9ccc', boots: INK, hat: 'kepi', buttons: '#e8c45a', skin: ['#f5c9a0', '#ffe2c2', '#c99067', '#ecd0b6'][v % 4], moustache: v % 3 === 1 ? '#4a3020' : undefined, belt: null });
export const ADMIRAL = { jacket: '#1f2c4f', pants: '#1f2c4f', boots: INK, hat: 'bicorne', buttons: '#e8c45a', sash: '#e8c45a', skin: '#ffe2c2', beard: '#f2f2f2', beardLen: 0.28, moustache: '#f2f2f2', build: 'stout' };
export const SAILOR = { jacket: '#eef0f4', pants: '#f1efe6', boots: INK, hat: 'sailor', skin: '#e3a982', buttons: '#24407a' };
export const EMPEROR = { jacket: '#283553', pants: '#283553', boots: INK, hat: 'pickel', buttons: '#e8c45a', sash: '#b8402e', skin: '#f3d3b8', moustache: '#f2f2f2', build: 'stout' };

// ---------------- arm poses: [L, R] each [elbowX, elbowY, handX, handY, front] in u from the shoulder (x outward) ----------------
export const ARMS = {
  point: [null, [26, 4, 62, -6, true]],
  pointHi: [null, [22, -10, 58, -32, true]],
  cross: [[12, 30, -22, 22, true], [12, 30, -22, 18, true]],
  hips: [[22, 26, 6, 52, false], [22, 26, 6, 52, false]],
  palm: [null, [30, -4, 44, -46, true]],
  scroll: [[14, 34, -8, 48, true], [14, 34, -8, 48, true]],
  aim: [[10, 30, -10, 30, true], [28, 18, 52, 6, true]],
  aimR: [[10, 34, 30, 22, true], [18, 30, 8, 22, true]],
  mugUp: [null, [26, -14, 18, -58, true]],
  mugToast: [null, [30, -6, 2, -50, true]],
  cheer: [[24, -18, 30, -58, true], [24, -18, 30, -58, true]],
  stampUp: [[14, 34, -8, 50, true], [34, -30, 46, -100, true]],
  stampDown: [[14, 34, -8, 50, true], [24, 22, 10, 56, true]],
  torch: [null, [26, 6, 34, -30, true]],
  torchDown: [null, [28, 26, 46, 52, true]],
  shrug: [[30, 16, 40, -10, false], [30, 16, 40, -10, false]],
  musketUp: [[10, 30, 12, 64, false], [8, 34, 10, 62, false]],
  yawn: [[26, -10, 12, -50, true], null],
};

// ---------------- card pool ----------------
const _geo = new THREE.PlaneGeometry(600 * UNIT, 1000 * UNIT).translate(0, (975 - 500) * UNIT, 0);
const _blobTex = (() => {
  const cv = document.createElement('canvas'); cv.width = cv.height = 128; const g = cv.getContext('2d');
  const gr = g.createRadialGradient(64, 64, 4, 64, 64, 62); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.55, 'rgba(255,255,255,0.75)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128); const t = new THREE.CanvasTexture(cv); return t;
})();
class Card {
  constructor() {
    this.cv = document.createElement('canvas'); this.cv.width = 600 * RES; this.cv.height = 1000 * RES;
    this.g = this.cv.getContext('2d');
    this.tex = new THREE.CanvasTexture(this.cv); this.tex.colorSpace = THREE.SRGBColorSpace; this.tex.anisotropy = 4;
    this.mat = new THREE.MeshBasicMaterial({ map: this.tex, alphaTest: 0.5, side: THREE.DoubleSide, fog: true });
    this.mesh = new THREE.Mesh(_geo, this.mat); this.mesh.layers.set(NOINK);
    this.blob = new THREE.Mesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0x1a1030, alphaMap: _blobTex, transparent: true, depthWrite: false, opacity: 0.45 }));
    this.blob.layers.set(NOINK); this.blob.renderOrder = 1;
    scene.add(this.mesh, this.blob); this.key = '';
  }
}
const pool = [];
let used = 0;
export function beginActors() { used = 0; }
export function endActors() { for (let i = used; i < pool.length; i++) { pool[i].mesh.visible = false; pool[i].blob.visible = false; } }
/** place one card: draw(p) paints in design units; o: {pos:[x,y,z], s=1, blob=0.5, yaw (null = face camera), tint, flip, key} */
export function actor(draw, o) {
  if (used >= pool.length) pool.push(new Card());
  const c = pool[used++];
  const g = c.g;
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, c.cv.width, c.cv.height);
  g.setTransform(RES * (o.flip ? -1 : 1), 0, 0, RES, o.flip ? c.cv.width : 0, 0);
  const p = new Pen(g); draw(p);
  c.tex.needsUpdate = true;
  const s = o.s ?? 1;
  c.mesh.visible = true; c.mesh.position.set(...o.pos); c.mesh.scale.set(s, s, s);
  const L = curLight(), t = o.tint || L.charTint; c.mat.color.setRGB(t[0], t[1], t[2], THREE.SRGBColorSpace);
  if (o.yaw != null) c.mesh.rotation.set(0, o.yaw, 0);
  else c.mesh.rotation.set(0, Math.atan2(camera.position.x - o.pos[0], camera.position.z - o.pos[2]), 0);
  if (o.roll) c.mesh.rotateZ(o.roll);
  const bl = o.blob ?? 0.5;
  c.blob.visible = bl > 0;
  if (bl > 0) { c.blob.position.set(o.pos[0], (o.ground ?? o.pos[1]) + 0.012, o.pos[2]); c.blob.scale.set(bl * s * 1.6, 1, bl * s * 0.9); c.blob.material.opacity = L.blob; }
  return c;
}

// ---------------- helpers ----------------
export const blinkAt = (f, seed) => { const per = 30 + Math.floor(((Math.sin(seed * 91.7) + 1) / 2) * 50); const ph = (f + Math.floor(seed * 37)) % per; return ph < 4 ? [0.5, 1, 1, 0.5][ph] : 0; };
export function person(o, opts) { return (p) => bodyFront(p, o, opts); }
export function personSide(o, opts) { return (p) => bodySide(p, o, opts); }

// musket held in both hands (aim), or upright
export const musketAim = (len = 120) => (p, hl, hr, u) => {
  const dx = hr[0] - hl[0], dy = hr[1] - hl[1], L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L;
  const a = [hl[0] - ux * 30 * u, hl[1] - uy * 30 * u + 4 * u], b = [hr[0] + ux * len * u * 0.55, hr[1] + uy * len * u * 0.55];
  p.band([a, [hr[0] + ux * 10 * u, hr[1] + uy * 10 * u]], '#7a4b2a', 6.5 * u, 1.6 * u, 'round');
  p.band([[hr[0] - ux * 6 * u, hr[1] - uy * 6 * u], b], '#5d636c', 3 * u, 1.3 * u, 'round');
  p.dot(hl[0], hl[1], 5.5 * u); p.dot(hr[0], hr[1], 5.5 * u);
};
export const musketUpright = (p, hl, hr, u, HH) => {
  const x = hr[0] + 2 * u, y0 = hr[1] + 0.5 * HH, y1 = hr[1] - 1.75 * HH;
  p.band([[x, y0], [x + 3 * u, y1 + 0.6 * HH]], '#7a4b2a', 5.5 * u, 1.5 * u, 'round');
  p.band([[x + 2 * u, y1 + 0.75 * HH], [x + 3.5 * u, y1]], '#8d949c', 2.6 * u, 1.2 * u, 'round');
};
export const scrollHold = (open = 1) => (p, hl, hr, u) => {
  const cx = (hl[0] + hr[0]) / 2, cy = (hl[1] + hr[1]) / 2 - 10 * u, w = 30 * u, h = (14 + 46 * open) * u;
  p.poly([[cx - w, cy - h], [cx + w, cy - h], [cx + w, cy + 6 * u], [cx - w, cy + 6 * u]], '#f3e6c4', 2.4 * u);
  for (let i = 0; i < 4 * open; i++) p.stroke([[cx - w * 0.7, cy - h + (12 + i * 11) * u], [cx + w * 0.6, cy - h + (12 + i * 11) * u]], 1.6 * u, '#8a7350');
  p.ell(cx, cy - h, w + 4 * u, 5 * u, '#e6d3a5', 2.2 * u); p.ell(cx, cy + 6 * u, w + 4 * u, 5 * u, '#e6d3a5', 2.2 * u);
  p.dot(hl[0], hl[1], 5.5 * u); p.dot(hr[0], hr[1], 5.5 * u);
};
export const mugHold = (which = 1) => (p, hl, hr, u) => {
  const [hx, hy] = which ? hr : hl;
  p.poly([[hx - 12 * u, hy - 26 * u], [hx + 12 * u, hy - 26 * u], [hx + 11 * u, hy + 4 * u], [hx - 11 * u, hy + 4 * u]], '#b07a42', 2.4 * u);
  p.ell(hx, hy - 27 * u, 14 * u, 6 * u, '#fbf4e2', 2.2 * u);
  p.dot(hx, hy, 5.5 * u);
};
export const torchHold = (f, lit = 1) => (p, hl, hr, u) => {
  const [hx, hy] = hr;
  p.band([[hx - 2 * u, hy + 20 * u], [hx + 4 * u, hy - 46 * u]], '#7a4b2a', 5 * u, 1.4 * u, 'round');
  if (lit > 0) {
    const k = lit, fl = Math.sin(f * 1.7) * 3 * u;
    p.poly([[hx - 12 * u * k, hy - 46 * u], [hx + fl, hy - (46 + 44 * k) * u], [hx + 14 * u * k, hy - 46 * u], [hx + 2 * u, hy - 38 * u]], '#f39a2b', 2.2 * u);
    p.poly([[hx - 5 * u * k, hy - 46 * u], [hx + fl * 0.5, hy - (46 + 24 * k) * u], [hx + 7 * u * k, hy - 46 * u]], '#ffe27a', 0);
  }
  p.dot(hx, hy, 5.5 * u);
};
export const stampHold = (p, hl, hr, u) => {
  const [hx, hy] = hr; u = u * 1.6;
  p.ell(hx, hy - 8 * u, 9 * u, 9 * u, '#6b3e22', 2.2 * u);
  p.band([[hx, hy - 2 * u], [hx, hy + 22 * u]], '#6b3e22', 6 * u, 1.4 * u);
  p.poly([[hx - 16 * u, hy + 22 * u], [hx + 16 * u, hy + 22 * u], [hx + 16 * u, hy + 32 * u], [hx - 16 * u, hy + 32 * u]], '#c0353a', 2.2 * u); u = u / 1.6;
  p.dot(hx, hy, 5.5 * u);
};

// ---------------- pig ----------------
const PINK = '#f4a3b5', PINK_SH = '#d9849a';
/** side-view pig facing screen-right, soles at 975. o: {chomp 0..1, look 'side'|'cam', blink, wink, potato, ghost, headUp, run} */
export function pig(o = {}) {
  return (p) => {
    const g = p.g, base = o.ghost ? '#fde3ec' : PINK, sh = o.ghost ? '#e6c3d6' : PINK_SH, ow = 9;
    const f = o.f || 0, hu = o.headUp || 0;
    const bx = 280, by = 845 - (o.hop || 0);
    // legs (far pair darker)
    const legs = [[bx - 105, 0.6, -1], [bx + 75, 0.6, -1], [bx - 75, 1, 1], [bx + 105, 1, 1]];
    for (const [lx, k, side] of legs) {
      const sw = o.run ? Math.sin(f * 0.9 + lx) * 14 : 0;
      p.poly([[lx - 17 + sw, by + 40], [lx + 17 + sw, by + 40], [lx + 15 + sw * 1.4, 965], [lx - 15 + sw * 1.4, 965]], k < 1 ? sh : base, ow);
      p.poly([[lx - 16 + sw * 1.4, 952], [lx + 16 + sw * 1.4, 952], [lx + 15 + sw * 1.4, 975], [lx - 15 + sw * 1.4, 975]], '#5a3b3a', 5);
    }
    if (o.ghost) { // little wings
      const fl = Math.sin(f * 0.6) * 12;
      for (const s of [0, 1]) p.poly([[bx - 30 + s * 40, by - 70], [bx - 120 + s * 30, by - 170 - fl], [bx - 160 + s * 40, by - 120 - fl], [bx - 110 + s * 40, by - 80]], '#ffffff', 7);
    }
    // tail curl
    const tl = []; for (let i = 0; i <= 20; i++) { const t = i / 20, a = t * Math.PI * 3.2; tl.push([bx - 190 - 26 * t - Math.cos(a) * 16 * t, by - 40 - Math.sin(a) * 18 * t - 20 * t]); }
    p.stroke(tl, 15, INK); p.stroke(tl, 8, base);
    // body
    const body = []; for (let i = 0; i < 64; i++) { const a = i / 64 * Math.PI * 2, c = Math.cos(a), s = Math.sin(a); body.push([bx + 200 * Math.sign(c) * Math.abs(c) ** 0.8, by + 118 * Math.sign(s) * Math.abs(s) ** 0.85]); }
    p.shadedFill(body, base, sh, -2.1, 200);
    p.inkRing(body, 10, 1.2);
    if (!o.ghost) { p.ell(bx - 60, by - 30, 30, 18, '#e9909f', 0); p.ell(bx + 30, by + 30, 22, 14, '#e9909f', 0); }
    if (o.bandana) { // little union-ish neckerchief
      p.poly([[bx + 135, by - 92], [bx + 175, by + 40], [bx + 120, by + 30]], '#c8302c', 5);
      p.poly([[bx + 150, by - 40], [bx + 166, by + 10], [bx + 140, by + 5]], '#1f3a8a', 3);
    }
    // head (tilts up with hu)
    const hx = bx + 190, hy = by - 40 - hu * 30;
    p.rot = [-hu * 0.35 + Math.sin(f * 0.8) * (o.chomp ? 0.04 : 0), hx - 40, hy + 40];
    p.poly([[hx - 30, hy - 70], [hx - 10, hy - 140], [hx + 30, hy - 72]], sh, 7);           // far ear
    const head = []; for (let i = 0; i < 48; i++) { const a = i / 48 * Math.PI * 2; head.push([hx + 88 * Math.cos(a), hy + 80 * Math.sin(a)]); }
    p.shadedFill(head, base, sh, -2.1, 88); p.inkRing(head, 9, 1.2);
    p.poly([[hx - 50, hy - 55], [hx - 40, hy - 140], [hx + 5, hy - 70]], base, 7);         // near ear
    // snout
    const chomp = o.chomp ? (0.5 + 0.5 * Math.sin(f * 1.6)) : 0;
    p.ell(hx + 92, hy + 10, 30, 36, '#f7b7c6', 7);
    p.ell(hx + 88, hy + 0, 5, 9, '#7a3a4a', 0); p.ell(hx + 102, hy + 18, 5, 9, '#7a3a4a', 0);
    // mouth
    p.stroke([[hx + 30, hy + 48 + chomp * 6], [hx + 68, hy + 44 + chomp * 10]], 6);
    if (o.potato) { const px = hx + 66, py = hy + 54 + chomp * 6; p.ell(px, py, 26, 20, '#b98a52', 6, 0, 360, 20); p.dot(px - 6, py - 4, 3, '#7a5530'); p.dot(px + 8, py + 4, 3, '#7a5530'); }
    // eye
    const ex = hx + 22, ey = hy - 22;
    if (o.wink || (o.blink && o.blink >= 1)) p.arc(ex, ey + 4, 12, 8, 200, 340, 6);
    else if (o.look === 'cam') { p.ell(ex - 6, ey, 18, 20, '#ffffff', 5); p.dot(ex - 10, ey + 2, 8); }
    else if (o.happy) p.arc(ex, ey + 6, 12, 9, 200, 340, 6);
    else p.ell(ex + 2, ey, 7, 10, INK, 0);
    p.rot = null;
    if (o.ghost) { // halo (gold ring)
      const hh = hy - 165 - Math.sin(f * 0.15) * 6; p.ell(hx - 10, hh, 82, 20, null, 18);
      const gg = p.g; gg.lineWidth = 9; gg.strokeStyle = '#ffd34d'; gg.beginPath(); gg.ellipse(hx - 10, hh, 82, 20, 0, 0, Math.PI * 2); gg.stroke();
    }
  };
}

// ---------------- effect cards ----------------
export const halo = (f) => (p) => {
  const g = p.g, y = 700 + Math.sin(f * 0.2) * 8;
  g.lineWidth = 26; g.strokeStyle = INK; g.beginPath(); g.ellipse(300, y, 110, 28, 0, 0, 7); g.stroke();
  g.lineWidth = 14; g.strokeStyle = '#ffd34d'; g.beginPath(); g.ellipse(300, y, 110, 28, 0, 0, 7); g.stroke();
};
export const smoke = (t, seed = 1, col = '#eceae6') => (p) => { // t 0..1 growth
  const n = 9; for (let i = 0; i < n; i++) {
    const a = i / n * Math.PI * 2 + seed, r = 70 + 150 * t, x = 300 + Math.cos(a) * r * 0.9, y = 600 + Math.sin(a) * r * 0.75 - t * 80;
    p.ell(x, y, (80 + 60 * Math.sin(i * 2.1 + seed)) * (0.5 + t), (70 + 50 * Math.cos(i * 1.7)) * (0.5 + t), col, 8);
  }
  p.ell(300, 600 - t * 80, 160 * (0.6 + t), 140 * (0.6 + t), col, 0);
};
export const burst = (t, col = '#fff3b0') => (p) => fxBurst(p, t, col, 12, 40, 260);
export const puff = (t) => (p) => fxPuff(p, t);
export const stars = (t) => (p) => fxStars(p, t);
export const potatoCard = (rot = 0, shine = 0) => (p) => {
  p.ell(300, 900, 70, 52, '#b98a52', 9, 0, 360, rot); p.dot(280, 885, 7, '#7a5530'); p.dot(320, 915, 6, '#7a5530'); p.dot(330, 880, 5, '#7a5530');
  if (shine > 0) { const g = p.g; g.save(); g.globalAlpha = shine; fxStars(p, 0.6); g.restore(); }
};
export const thought = (k, inner) => (p) => { // thought bubble with a small drawing inside
  const g = p.g; g.save(); g.translate(300, 520); g.scale(k, k); g.translate(-300, -520);
  const lob = [[300, 430, 190, 150], [170, 470, 100, 90], [430, 470, 100, 90], [230, 360, 110, 100], [370, 360, 110, 100]];
  for (const [x, y, rx, ry] of lob) p.ell(x, y, rx + 8, ry + 8, INK, 0);
  for (const [x, y, rx, ry] of lob) p.ell(x, y, rx, ry, '#ffffff', 0);
  p.ell(250, 650, 34, 28, '#ffffff', 8); p.ell(230, 730, 20, 16, '#ffffff', 7);
  g.save(); g.translate(300, 430); g.scale(0.5, 0.5); g.translate(-300, -820); inner(p); g.restore();
  g.restore();
};
export const zzz = (f) => (p) => { const g = p.g; g.font = 'bold 120px Georgia'; for (let i = 0; i < 3; i++) { const t = ((f / 24 + i / 3) % 1); g.globalAlpha = 1 - t; g.lineWidth = 10; g.strokeStyle = INK; g.fillStyle = '#ffffff'; const x = 260 + t * 120 + i * 10, y = 760 - t * 400; g.strokeText('Z', x, y); g.fillText('Z', x, y); } g.globalAlpha = 1; };
export const confetti = (f, seed = 1) => (p) => {
  const g = p.g; const cols = ['#e2453c', '#f4d24a', '#3f6fb5', '#5aa04a', '#f3a9bb', '#ffffff'];
  for (let i = 0; i < 46; i++) { const r = (k) => { const x = Math.sin((i + 1) * 12.9898 * k + seed * 78.233) * 43758.5453; return x - Math.floor(x); };
    const x = r(1) * 600, y = ((r(2) * 1000 + f * (6 + r(3) * 6)) % 1000), a = f * 0.2 * (r(4) - 0.5) * 3 + r(5) * 6;
    g.save(); g.translate(x, y); g.rotate(a); g.fillStyle = cols[i % cols.length]; g.fillRect(-9, -5, 18, 10); g.restore(); }
};
export const firework = (t, col = '#ffd34d') => (p) => {
  const g = p.g; if (t <= 0 || t >= 1) return; const n = 18, r = 60 + 220 * Math.sqrt(t);
  g.globalAlpha = 1 - t * t;
  for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; g.strokeStyle = col; g.lineWidth = 10 * (1 - t) + 3; g.lineCap = 'round';
    g.beginPath(); g.moveTo(300 + Math.cos(a) * r * 0.6, 500 + Math.sin(a) * r * 0.6); g.lineTo(300 + Math.cos(a) * r, 500 + Math.sin(a) * r); g.stroke(); }
  g.globalAlpha = 1;
};
export const muzzle = (t) => (p) => { // flash star
  const k = 1 - t; if (k <= 0) return; const pts = []; for (let i = 0; i < 20; i++) { const a = i / 20 * Math.PI * 2, r = (i % 2 ? 90 : 220) * (0.5 + k * 0.6); pts.push([300 + Math.cos(a) * r, 600 + Math.sin(a) * r * 0.8]); }
  p.poly(pts, '#ffd34d', 10); const pts2 = pts.map(([x, y]) => [300 + (x - 300) * 0.5, 600 + (y - 600) * 0.5]); p.poly(pts2, '#fff6cf', 0);
};

export const flame = (f) => (p) => { // bonfire flame card
  const w = (k, a) => Math.sin(f * a + k) ;
  const layer = (sc, col, ol) => { const pts = []; for (let i = 0; i <= 24; i++) { const t = i / 24, a = t * Math.PI; const r = Math.sin(a) ** 0.8 * 150 * sc;
      const tip = 1 - Math.abs(t - 0.5) * 2; pts.push([300 + Math.cos(a) * r * (1 + 0.08 * w(i, 0.9)), 960 - Math.sin(a) * r * 0.6 - tip ** 3 * 520 * sc * (1 + 0.15 * w(i * 2, 1.3))]); }
    pts.push([300 - 150 * sc, 960]); p.poly(pts, col, ol); };
  layer(1, '#f07a24', 9); layer(0.7, '#f6a63a', 0); layer(0.42, '#ffe27a', 0);
};
