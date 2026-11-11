// World sets: FARM (patch, cabin, road, hills), ISLAND (strait, camps, ships), PALACE (study). Painted textures.
import * as THREE from 'three';
import { scene, lam, unlit, NOINK } from './engine.js';
import { ctex, rng, rep, grassHD, planksHD, roofHD, stoneHD, cloudHD } from './paint.js';

const TAU = Math.PI * 2;
const U = (r, a, b) => a + (b - a) * r();
export const ISL = new THREE.Vector3(3000, 0, 0);
export const PAL = new THREE.Vector3(-3000, 0, 0);

// ---------------- painted textures ----------------
const blot = (g, x, y, rad, col, a) => { const gr = g.createRadialGradient(x, y, 0, x, y, rad); gr.addColorStop(0, `rgba(${col},${a})`); gr.addColorStop(1, `rgba(${col},0)`); g.fillStyle = gr; g.fillRect(x - rad, y - rad, rad * 2, rad * 2); };
export const dirtTex = () => ctex('dirt', 512, 512, (g, r) => {
  g.fillStyle = '#8a5a36'; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 30; i++) blot(g, U(r, 0, 512), U(r, 0, 512), U(r, 40, 120), r() > 0.5 ? '160,110,70' : '110,70,40', 0.35);
  for (let i = 0; i < 500; i++) { g.fillStyle = r() > 0.5 ? 'rgba(70,40,20,0.45)' : 'rgba(190,140,90,0.35)'; g.beginPath(); g.arc(U(r, 0, 512), U(r, 0, 512), U(r, 1, 4), 0, TAU); g.fill(); }
});
export const sandTex = () => ctex('sand', 512, 512, (g, r) => {
  g.fillStyle = '#e6cf98'; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 24; i++) blot(g, U(r, 0, 512), U(r, 0, 512), U(r, 50, 140), r() > 0.5 ? '246,226,176' : '206,178,120', 0.4);
  for (let i = 0; i < 400; i++) { g.fillStyle = 'rgba(150,120,80,0.35)'; g.fillRect(U(r, 0, 512), U(r, 0, 512), 2, 2); }
});
export const logTex = () => ctex('logs', 512, 512, (g, r) => {
  const n = 8, h = 512 / n;
  for (let i = 0; i < n; i++) {
    const y = i * h, base = ['#9a6a40', '#8e5f38', '#a5754a'][i % 3];
    const gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, '#5a3820'); gr.addColorStop(0.15, base); gr.addColorStop(0.6, base); gr.addColorStop(1, '#4a2c18');
    g.fillStyle = gr; g.fillRect(0, y, 512, h);
    for (let k = 0; k < 6; k++) { g.strokeStyle = 'rgba(60,35,18,0.35)'; g.lineWidth = 2; g.beginPath(); const yy = y + U(r, 0.25, 0.75) * h; g.moveTo(U(r, 0, 300), yy); g.lineTo(U(r, 200, 512), yy + U(r, -3, 3)); g.stroke(); }
    g.fillStyle = 'rgba(25,15,10,0.9)'; g.fillRect(0, y + h - 4, 512, 4);
  }
});
export const barkTex = () => ctex('bark', 256, 256, (g, r) => {
  g.fillStyle = '#6b4428'; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 40; i++) { g.strokeStyle = r() > 0.5 ? 'rgba(40,24,12,0.6)' : 'rgba(140,100,60,0.4)'; g.lineWidth = U(r, 2, 6); const x = U(r, 0, 256); g.beginPath(); g.moveTo(x, 0); g.lineTo(x + U(r, -10, 10), 256); g.stroke(); }
});
export const canvasTex = (key = 'tent', col = '#efe4c8') => ctex('canvas' + key, 512, 512, (g, r) => {
  g.fillStyle = col; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 16; i++) blot(g, U(r, 0, 512), U(r, 0, 512), U(r, 60, 160), '200,185,150', 0.3);
  for (let x = 0; x < 512; x += 64) { g.fillStyle = 'rgba(120,100,70,0.35)'; g.fillRect(x, 0, 3, 512); }
});
export const hullTex = () => ctex('hull', 1024, 512, (g, r) => {
  const n = 12, h = 512 / n;
  for (let i = 0; i < n; i++) {
    for (let x = 0; x < 1024;) { const w = U(r, 160, 340), c = ['#5b3620', '#64402a', '#52301c'][Math.floor(r() * 3)]; g.fillStyle = c; g.fillRect(x, i * h, w, h); g.fillStyle = 'rgba(20,10,5,0.8)'; g.fillRect(x + w - 3, i * h, 3, h); x += w; }
    g.fillStyle = 'rgba(15,8,4,0.95)'; g.fillRect(0, i * h + h - 3, 1024, 3);
  }
});
export const sailTex = () => ctex('sail', 512, 512, (g, r) => {
  g.fillStyle = '#f3ecd8'; g.fillRect(0, 0, 512, 512);
  for (let x = 0; x < 512; x += 64) { g.fillStyle = 'rgba(150,130,100,0.45)'; g.fillRect(x, 0, 3, 512); }
  for (let i = 0; i < 10; i++) blot(g, U(r, 0, 512), U(r, 0, 512), U(r, 60, 160), '210,195,165', 0.35);
  g.strokeStyle = 'rgba(90,70,50,0.8)'; g.lineWidth = 8; g.strokeRect(4, 4, 504, 504);
});
export const wallTex = () => ctex('wallpaper', 512, 512, (g, r) => {
  g.fillStyle = '#5d7f6a'; g.fillRect(0, 0, 512, 512);
  for (let x = 0; x < 512; x += 64) { g.fillStyle = '#6b8f77'; g.fillRect(x, 0, 30, 512); }
  for (let y = 32; y < 512; y += 96) for (let x = 47; x < 512; x += 64) { g.fillStyle = '#e8c45a'; g.beginPath(); g.moveTo(x, y - 10); g.lineTo(x + 7, y); g.lineTo(x, y + 10); g.lineTo(x - 7, y); g.fill(); }
});
const flagCanvas = (kind) => ctex('flag_' + kind, 512, 320, (g) => {
  const Wf = 512, Hf = 320;
  const uj = (x0, y0, w, h) => {
    g.save(); g.beginPath(); g.rect(x0, y0, w, h); g.clip();
    g.fillStyle = '#1f3a8a'; g.fillRect(x0, y0, w, h);
    const d = (lw, col) => { g.strokeStyle = col; g.lineWidth = lw; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x0 + w, y0 + h); g.moveTo(x0 + w, y0); g.lineTo(x0, y0 + h); g.stroke(); };
    d(h * 0.2, '#ffffff'); d(h * 0.07, '#c8302c');
    g.fillStyle = '#ffffff'; g.fillRect(x0 + w / 2 - h * 0.17, y0, h * 0.34, h); g.fillRect(x0, y0 + h / 2 - h * 0.17, w, h * 0.34);
    g.fillStyle = '#c8302c'; g.fillRect(x0 + w / 2 - h * 0.1, y0, h * 0.2, h); g.fillRect(x0, y0 + h / 2 - h * 0.1, w, h * 0.2);
    g.restore();
  };
  if (kind === 'uk') uj(0, 0, Wf, Hf);
  else if (kind === 'ensign') { g.fillStyle = '#c8302c'; g.fillRect(0, 0, Wf, Hf); uj(0, 0, Wf / 2, Hf / 2); }
  else if (kind === 'us') {
    for (let i = 0; i < 13; i++) { g.fillStyle = i % 2 ? '#f4f1e8' : '#c8302c'; g.fillRect(0, i * Hf / 13, Wf, Hf / 13 + 1); }
    g.fillStyle = '#1f3a8a'; g.fillRect(0, 0, Wf * 0.42, Hf * 7 / 13);
    g.fillStyle = '#f4f1e8'; for (let r = 0; r < 5; r++) for (let c = 0; c < 7; c++) { const x = 20 + c * 28 + (r % 2) * 10, y = 18 + r * 32; g.beginPath(); for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? 4 : 9; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.fill(); }
  }
  g.strokeStyle = 'rgba(20,10,10,0.9)'; g.lineWidth = 6; g.strokeRect(3, 3, Wf - 6, Hf - 6);
});
/** painted sign / label texture with text lines (unlit, readable) */
export const textTex = (key, w, h, bg, lines, o = {}) => ctex('txt_' + key, w, h, (g, r) => {
  g.fillStyle = bg; g.fillRect(0, 0, w, h);
  if (o.wood) { for (let y = 0; y < h; y += h / 4) { g.fillStyle = 'rgba(60,35,18,0.5)'; g.fillRect(0, y, w, 3); } for (let i = 0; i < 20; i++) { g.strokeStyle = 'rgba(90,55,30,0.35)'; g.lineWidth = 2; const y = U(r, 0, h); g.beginPath(); g.moveTo(U(r, 0, w / 2), y); g.lineTo(U(r, w / 2, w), y + U(r, -4, 4)); g.stroke(); } }
  if (o.paper) { for (let i = 0; i < 12; i++) blot(g, U(r, 0, w), U(r, 0, h), U(r, 40, 120), '200,170,120', 0.25); }
  g.textAlign = 'center'; g.textBaseline = 'middle';
  for (const L of lines) { g.font = L.font; if (L.stroke) { g.lineWidth = L.stroke; g.strokeStyle = L.sc || '#2a1a10'; g.strokeText(L.t, L.x ?? w / 2, L.y); } g.fillStyle = L.col || '#2a1a10'; g.fillText(L.t, L.x ?? w / 2, L.y); }
  if (o.border) { g.strokeStyle = o.border; g.lineWidth = 10; g.strokeRect(5, 5, w - 10, h - 10); }
});

// ---------------- builders ----------------
const box = (w, h, d, mat, x = 0, y = 0, z = 0, parent = scene) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; parent.add(m); return m; };
const cyl = (rt, rb, h, mat, seg = 16, parent = scene) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat); m.castShadow = m.receiveShadow = true; parent.add(m); return m; };
function pine(parent, x, y, z, h, seed = 1) {
  const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g);
  const tr = cyl(0.12 * h / 6, 0.18 * h / 6, h * 0.3, lam('#7a4b2a', barkTex()), 8, g); tr.position.y = h * 0.15;
  const greens = ['#2f7a4a', '#3a8a52', '#2a6a44'];
  for (let i = 0; i < 3; i++) { const c = new THREE.Mesh(new THREE.ConeGeometry(h * (0.3 - i * 0.07), h * 0.42, 9), lam(greens[(i + seed) % 3])); c.position.y = h * (0.32 + i * 0.2); c.rotation.y = seed + i; c.castShadow = c.receiveShadow = true; g.add(c); }
  return g;
}
function bush(parent, x, y, z, s, col = '#4f9a48') { const m = new THREE.Mesh(new THREE.IcosahedronGeometry(s, 1), lam(col)); m.position.set(x, y + s * 0.5, z); m.scale.y = 0.75; m.castShadow = m.receiveShadow = true; parent.add(m); return m; }
function patch(parent, cx, cy, cz, rows = 5, len = 5.5, seed = 3) {
  const r = rng(seed), g = new THREE.Group(); g.position.set(cx, cy, cz); parent.add(g); const leaves = [];
  const dmat = lam('#9a6a44', rep(dirtTex(), 2, 1));
  for (let i = 0; i < rows; i++) {
    const z = -i * 0.75 + (rows - 1) * 0.375;
    const m = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 10), dmat); m.scale.set(len / 2, 0.24, 0.3); m.position.set(0, 0, z); m.receiveShadow = m.castShadow = true; g.add(m);
    for (let k = 0; k < Math.round(len / 0.55); k++) {
      const x = -len / 2 + 0.35 + k * 0.55 + U(r, -0.08, 0.08);
      const l = new THREE.Mesh(new THREE.IcosahedronGeometry(U(r, 0.15, 0.2), 2), lam(r() > 0.5 ? '#5aa04a' : '#4a8f3e'));
      l.position.set(x, 0.26, z + U(r, -0.06, 0.06)); l.scale.y = 0.8; l.rotation.set(r(), r() * 6, r()); l.castShadow = true; g.add(l); leaves.push(l);
    }
  }
  return { g, leaves };
}
export function flagPole(parent, x, y, z, kind, h = 4.5, fw = 1.7, fh = 1.05) {
  const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g);
  const pole = cyl(0.045, 0.06, h, lam('#d8d2c2'), 8, g); pole.position.y = h / 2;
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), lam('#e8c45a')); knob.position.y = h + 0.05; g.add(knob);
  const geo = new THREE.PlaneGeometry(fw, fh, 16, 4); geo.translate(fw / 2, 0, 0);
  const cloth = new THREE.Mesh(geo, lam('#ffffff', flagCanvas(kind), { side: THREE.DoubleSide })); cloth.position.set(0.05, h - fh / 2 - 0.08, 0); cloth.castShadow = true; g.add(cloth);
  const base = geo.attributes.position.array.slice();
  return { g, cloth, wave(f, amp = 1, dir = 1) {
    const a = geo.attributes.position; for (let i = 0; i < a.count; i++) { const x0 = base[i * 3], y0 = base[i * 3 + 1]; const k = x0 / fw;
      a.setZ(i, Math.sin(x0 * 3.2 - f * 0.28 * dir + y0 * 0.6) * 0.16 * k * amp); a.setY(i, y0 - k * k * 0.12 * (1.2 - amp)); }
    a.needsUpdate = true; geo.computeVertexNormals(); } };
}
function cannon(parent, x, y, z, yaw) {
  const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = yaw; parent.add(g);
  const wood = lam('#7a4b2a', planksHD()), iron = lam('#3a3c44');
  for (const s of [-1, 1]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.12, 20), wood); w.rotation.x = Math.PI / 2; w.position.set(0, 0.55, s * 0.42); w.castShadow = true; g.add(w);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.18, 10), iron); hub.rotation.x = Math.PI / 2; hub.position.set(0, 0.55, s * 0.42); g.add(hub); }
  const trail = box(1.6, 0.18, 0.3, wood, -0.8, 0.35, 0, g); trail.rotation.z = -0.28;
  const barrelG = new THREE.Group(); barrelG.position.set(0, 0.78, 0); g.add(barrelG);
  const b = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.2, 1.9, 18), iron); b.rotation.z = -Math.PI / 2; b.position.x = 0.5; b.castShadow = true; barrelG.add(b);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.035, 8, 18), iron); ring.rotation.y = Math.PI / 2; ring.position.x = 1.42; barrelG.add(ring);
  const back = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 8), iron); back.position.x = -0.45; barrelG.add(back);
  barrelG.rotation.z = 0.08;
  return { g, barrelG };
}

// ---------------- FARM ----------------
export const FARM = { root: new THREE.Group() };
function buildFarm() {
  const R = FARM.root; scene.add(R); const r = rng(11);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(900, 900).rotateX(-Math.PI / 2), lam('#a9b98f', rep(grassHD(), 220, 220))); ground.receiveShadow = true; R.add(ground);
  // road for the marching shot
  const road = new THREE.Mesh(new THREE.PlaneGeometry(260, 3.2).rotateX(-Math.PI / 2), lam('#c9a77a', rep(dirtTex(), 80, 1))); road.position.set(0, 0.02, 9); road.receiveShadow = true; R.add(road);
  FARM.patch = patch(R, 0, 0, -1.8, 5, 6.0, 5);
  // cabin
  const cab = new THREE.Group(); cab.position.set(-6.2, 0, -7.5); R.add(cab); FARM.cabin = cab;
  const logs = lam('#ffffff', rep(logTex(), 2, 1.2));
  box(5.2, 3.0, 4.4, logs, 0, 1.5, 0, cab);
  const roofM = lam('#ffffff', rep(roofHD('#6b4a3a'), 2, 1));
  for (const s of [-1, 1]) { const rf = box(5.8, 0.18, 2.75, roofM, 0, 3.75, s * 1.15, cab); rf.rotation.x = s * 0.62; }
  const gable = new THREE.Shape(); gable.moveTo(-2.2, 0); gable.lineTo(2.2, 0); gable.lineTo(0, 1.45); gable.closePath();
  for (const s of [-1, 1]) { const gm = new THREE.Mesh(new THREE.ExtrudeGeometry(gable, { depth: 0.1, bevelEnabled: false }), logs); gm.rotation.y = Math.PI / 2; gm.position.set(s * 2.55, 3.0, 0); gm.castShadow = true; cab.add(gm); }
  const chim = box(0.7, 2.6, 0.7, lam('#ffffff', rep(stoneHD(), 0.5, 1)), 1.6, 3.8, -0.6, cab);
  box(1.2, 2.15, 0.08, lam('#2a1a14'), 0.9, 1.08, 2.21, cab); // doorway (dark)
  const doorG = new THREE.Group(); doorG.position.set(0.3, 0, 2.27); cab.add(doorG); FARM.door = doorG;
  box(1.15, 2.1, 0.08, lam('#7a5232', planksHD()), 0.58, 1.06, 0, doorG);
  box(1.0, 0.8, 0.06, lam('#f2d488'), -1.3, 1.7, 2.22, cab); box(1.1, 0.1, 0.12, lam('#5a3820'), -1.3, 1.25, 2.25, cab);
  box(0.08, 0.9, 0.1, lam('#5a3820'), -1.3, 1.7, 2.26, cab);
  // fence
  const fw = lam('#8a6040', planksHD());
  for (let i = 0; i < 9; i++) box(0.14, 1.1, 0.14, fw, -1 + i * 1.7, 0.55, -5.0, R);
  for (const y of [0.45, 0.85]) box(13.8, 0.09, 0.07, fw, 5.8, y, -4.95, R);
  // trees & bushes
  for (let i = 0; i < 70; i++) { const a = U(r, -1.25, 1.25) + Math.PI, d = U(r, 16, 75); const x = Math.sin(a) * d * 1.3, z = Math.cos(a) * d - 6; if (z > -10) continue; pine(R, x, 0, z, U(r, 5, 11), i); }

  for (let i = 0; i < 14; i++) bush(R, U(r, -14, 14), 0, U(r, -14, -8), U(r, 0.4, 0.9));
  // hills and mountains
  for (let i = 0; i < 9; i++) { const h = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 12), lam(i % 2 ? '#6aa84f' : '#5c9a48', rep(grassHD(), 12, 12))); h.scale.set(U(r, 40, 80), U(r, 14, 26), U(r, 30, 50)); h.position.set(-200 + i * 50 + U(r, -10, 10), -2, U(r, -150, -110)); h.receiveShadow = true; R.add(h); }
  for (let i = 0; i < 9; i++) { const x = -520 + i * 130 + U(r, -20, 20), z = U(r, -560, -500), rad = U(r, 80, 120), hh = U(r, 90, 140);
    const m = new THREE.Mesh(new THREE.ConeGeometry(rad, hh, 7), lam('#6f86b8')); m.position.set(x, hh / 2 - 5, z); m.rotation.y = r(); R.add(m);
    const s = new THREE.Mesh(new THREE.ConeGeometry(rad * 0.36, hh * 0.36, 7), lam('#f4f6fb')); s.position.set(x, hh - 5 - hh * 0.18 + 0.5, z); s.rotation.y = m.rotation.y; R.add(s); }
  // standoff props (shot 1)
  FARM.cannonL = cannon(R, -3.3, 0, -0.1, 0); FARM.cannonR = cannon(R, 3.3, 0, -0.1, Math.PI);
  FARM.flagUK = flagPole(R, -4.0, 0, -1.6, 'uk'); FARM.flagUS = flagPole(R, 4.0, 0, -1.6, 'us');
  // grave marker (shot 15)
  const gv = new THREE.Group(); gv.position.set(0.4, 0, -0.9); R.add(gv); FARM.grave = gv;
  box(0.1, 1.0, 0.08, lam('#7a5232', planksHD()), 0, 0.5, 0, gv);
  const board = box(0.95, 0.42, 0.06, lam('#9a7048', planksHD()), 0, 0.82, 0.05, gv);
  const face = new THREE.Mesh(new THREE.PlaneGeometry(0.88, 0.36), unlit('#ffffff', textTex('pig', 512, 210, '#a87b52', [{ t: 'PIG', y: 112, font: 'bold 150px Georgia', col: '#3a2412' }], { wood: true })));
  face.position.set(0, 0.82, 0.084); gv.add(face);
  const mound = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 8), lam('#7a5232', rep(dirtTex(), 1, 1))); mound.scale.set(0.8, 0.14, 0.45); mound.position.set(0, 0, 0.5); gv.add(mound);
  for (let i = 0; i < 5; i++) { const fl = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), lam(['#f3a9bb', '#f4d24a', '#ffffff'][i % 3])); fl.position.set(-0.45 + i * 0.22, 0.12, 0.75 + (i % 2) * 0.1); gv.add(fl);
    const st = cyl(0.01, 0.01, 0.12, lam('#3a7a3a'), 4, gv); st.position.set(-0.45 + i * 0.22, 0.06, 0.75 + (i % 2) * 0.1); }
}

// ---------------- ISLAND ----------------
export const ISLAND = { root: new THREE.Group() };
export const SHIPS = [];
function ship(parent, x, z, yaw, s = 1) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = yaw; g.scale.setScalar(s); parent.add(g);
  const sh = new THREE.Shape(); // side profile, bow at +x
  sh.moveTo(-17, 7.6); sh.lineTo(15, 7.0); sh.quadraticCurveTo(19, 6.5, 18.5, 2.5); sh.quadraticCurveTo(17, -1.5, 12, -2.2); sh.lineTo(-14, -2.2); sh.quadraticCurveTo(-17.5, -1.5, -17.5, 2); sh.closePath();
  const hullGeo = new THREE.ExtrudeGeometry(sh, { depth: 9, bevelEnabled: true, bevelThickness: 0.6, bevelSize: 0.5, bevelSegments: 2, steps: 1 }); hullGeo.translate(0, 0, -4.5);
  // planar UVs on the sides
  const p = hullGeo.attributes.position, uv = hullGeo.attributes.uv; for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) + 18) / 12, (p.getY(i) + 3) / 10);
  const hull = new THREE.Mesh(hullGeo, lam('#ffffff', hullTex())); hull.castShadow = hull.receiveShadow = true; g.add(hull);
  const deck = new THREE.Mesh(new THREE.PlaneGeometry(33, 8.6).rotateX(-Math.PI / 2), lam('#c79a62', rep(planksHD(), 6, 1.5))); deck.position.set(-0.5, 8.02, 0); deck.receiveShadow = true; g.add(deck);
  const stripe = lam('#e2b04a');
  const ports = [];
  for (const side of [-1, 1]) {
    for (const [yy, n] of [[2.6, 12], [5.0, 12]]) {
      const st = box(32, 0.35, 0.12, stripe, -0.5, yy + 0.85, side * 5.12, g); st.castShadow = false;
      for (let i = 0; i < n; i++) {
        const px = -14 + i * 2.45; if (px > 15) continue;
        const hole = box(0.85, 0.8, 0.1, lam('#1a1210'), px, yy, side * 5.1, g); hole.castShadow = false;
        const lidG = new THREE.Group(); lidG.position.set(px, yy + 0.42, side * 5.18); g.add(lidG);
        const lid = box(0.92, 0.84, 0.08, lam('#a02a22'), 0, -0.42, 0, lidG);
        const can = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.22, 1.6, 12), lam('#2e3038')); can.rotation.x = Math.PI / 2; can.position.set(px, yy - 0.05, side * 4.6); g.add(can);
        ports.push({ lidG, can, side, i, row: yy });
      }
    }
  }
  // bulwark rail
  const railM = lam('#6b4428', planksHD());
  for (const side of [-1, 1]) box(31, 1.0, 0.25, railM, -0.5, 8.5, side * 4.35, g);
  box(0.25, 1.0, 8.6, railM, -16.5, 8.5, 0, g);
  // masts, yards, sails
  const mastM = lam('#7a4b2a', barkTex()), sailM = lam('#ffffff', sailTex(), { side: THREE.DoubleSide });
  const sails = [];
  for (const [mx, mh] of [[-10, 26], [0.5, 30], [10.5, 24]]) {
    const m = cyl(0.32, 0.42, mh, mastM, 10, g); m.position.set(mx, 7 + mh / 2, 0);
    for (let k = 0; k < 3; k++) {
      const y = 7 + mh * (0.32 + k * 0.24), w = 13 - k * 3.2, h = mh * 0.2;
      const yd = cyl(0.15, 0.15, w + 1, mastM, 6, g); yd.rotation.z = Math.PI / 2; yd.rotation.y = Math.PI / 2; yd.position.set(mx, y + h / 2, 0);
      const geo = new THREE.PlaneGeometry(w, h, 8, 6); const pa = geo.attributes.position;
      for (let i = 0; i < pa.count; i++) { const xx = pa.getX(i) / (w / 2), yy = pa.getY(i) / (h / 2); pa.setZ(i, (1 - xx * xx) * (0.6 + 0.4 * (1 - yy)) * 1.1); }
      geo.computeVertexNormals();
      const sl = new THREE.Mesh(geo, sailM); sl.rotation.y = Math.PI / 2; sl.position.set(mx + 0.5, y, 0); sl.castShadow = true; g.add(sl); sails.push(sl);
    }
  }
  const bsp = cyl(0.2, 0.3, 12, mastM, 8, g); bsp.rotation.z = -1.15; bsp.position.set(22, 9.5, 0);
  const ens = flagPole(g, -17.2, 7.4, 0, 'ensign', 4.2, 2.6, 1.6);
  const obj = { g, ports, sails, ens, x, z, yaw };
  SHIPS.push(obj); return obj;
}
function tent(parent, x, y, z, yaw, col = '#efe4c8') {
  const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = yaw; parent.add(g);
  const sh = new THREE.Shape(); sh.moveTo(-1.4, 0); sh.lineTo(1.4, 0); sh.lineTo(0, 2.1); sh.closePath();
  const geo = new THREE.ExtrudeGeometry(sh, { depth: 3.2, bevelEnabled: false }); geo.translate(0, 0, -1.6);
  const pa = geo.attributes.position, uv = geo.attributes.uv; for (let i = 0; i < pa.count; i++) uv.setXY(i, pa.getZ(i) / 2, pa.getY(i) / 2);
  const m = new THREE.Mesh(geo, lam('#ffffff', canvasTex(col, col))); m.castShadow = m.receiveShadow = true; g.add(m);
  const door = new THREE.Mesh(new THREE.ShapeGeometry((() => { const s = new THREE.Shape(); s.moveTo(-0.5, 0); s.lineTo(0.5, 0); s.lineTo(0, 1.4); s.closePath(); return s; })()), lam('#3a2a1e'));
  door.position.set(0, 0.01, 1.62); g.add(door);
  return g;
}
function buildIsland() {
  const R = ISLAND.root; R.position.copy(ISL); scene.add(R); const r = rng(23);
  // sea
  const water = ctex('seaTex', 1024, 1024, (g, rr) => {
    g.fillStyle = '#ffffff'; g.fillRect(0, 0, 1024, 1024);
    for (let i = 0; i < 26; i++) blot(g, U(rr, 0, 1024), U(rr, 0, 1024), U(rr, 80, 220), '205,225,240', 0.4);
    g.lineCap = 'round';
    for (let i = 0; i < 110; i++) { const x = U(rr, 0, 1024), y = U(rr, 0, 1024), l = U(rr, 20, 60); g.strokeStyle = 'rgba(255,255,255,0.95)'; g.lineWidth = U(rr, 3, 6); g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + l / 2, y - 6, x + l, y); g.stroke(); }
  });
  ISLAND.waterTex = rep(water, 160, 160);
  ISLAND.waterMat = new THREE.MeshLambertMaterial({ color: new THREE.Color('#1e7fb0'), map: ISLAND.waterTex });
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(3000, 3000).rotateX(-Math.PI / 2), unlit('#1e7fb0', ISLAND.waterTex)); sea.position.y = 0; R.add(sea); ISLAND.sea = sea; sea.layers.set(NOINK);
  // island
  const isl = new THREE.Group(); R.add(isl); ISLAND.isl = isl;
  const sand = new THREE.Mesh(new THREE.CylinderGeometry(50, 54, 1.6, 48), lam('#ffffff', rep(sandTex(), 14, 14))); sand.scale.z = 0.72; sand.position.y = 0.2; sand.receiveShadow = true; isl.add(sand);
  const top = new THREE.Mesh(new THREE.CylinderGeometry(43, 47, 1.6, 48), lam('#a9b98f', rep(grassHD(), 14, 14))); top.scale.z = 0.72; top.position.y = 0.8; top.receiveShadow = true; isl.add(top);
  ISLAND.Y = 1.6;
  ISLAND.patch = patch(R, 0, 1.6, 0, 4, 4.6, 9);
  for (let i = 0; i < 46; i++) { const a = r() * TAU, d = U(r, 14, 40); const x = Math.cos(a) * d, z = Math.sin(a) * d * 0.68; if (Math.abs(x) < 30 && z > 4 && z < 26) continue; pine(R, x, 1.6, z, U(r, 5, 10), i); }
  for (let i = 0; i < 10; i++) bush(R, U(r, -30, 30), 1.6, U(r, -20, -6), U(r, 0.5, 1.0));
  // sign
  const sg = new THREE.Group(); sg.position.set(-3.5, 1.6, 9); R.add(sg); ISLAND.sign = sg;
  box(0.16, 2.2, 0.16, lam('#7a5232', planksHD()), 0, 1.1, 0, sg);
  box(2.3, 1.15, 0.12, lam('#8a6040', planksHD()), 0, 1.75, 0.08, sg);
  const sface = new THREE.Mesh(new THREE.PlaneGeometry(2.16, 1.02), unlit('#ffffff', textTex('sign', 1024, 484, '#b88a5a', [
    { t: 'SAN JUAN ISLAND', y: 150, font: 'bold 104px Georgia', col: '#2e1c0e' }, { t: '1859', y: 330, font: 'bold 170px Georgia', col: '#8a1f1a' }], { wood: true, border: '#4a2c16' })));
  sface.position.set(0, 1.75, 0.145); sg.add(sface);
  // camps (shots 11-13)
  const camps = new THREE.Group(); R.add(camps); ISLAND.camps = camps;
  for (let i = 0; i < 3; i++) tent(camps, -11 - i * 3.6, 1.6, -3.5 - (i % 2) * 2.5, 0.4, '#efe4c8');
  for (let i = 0; i < 3; i++) tent(camps, 11 + i * 3.6, 1.6, -3.5 - (i % 2) * 2.5, -0.4, '#e4e0d2');
  ISLAND.flagUK = flagPole(camps, -7.5, 1.6, -5.5, 'uk', 5.5); ISLAND.flagUS = flagPole(camps, 7.5, 1.6, -5.5, 'us', 5.5);
  ISLAND.crates = [box(0.8, 0.55, 0.6, lam('#a87b52', planksHD()), -0.95, 1.6 + 0.275, 3.6, camps), box(0.8, 0.55, 0.6, lam('#a87b52', planksHD()), 0.95, 1.6 + 0.275, 3.6, camps)];
  // calendar post
  const cal = new THREE.Group(); cal.position.set(0, 1.6, 2.6); camps.add(cal); ISLAND.cal = cal;
  box(0.12, 2.1, 0.12, lam('#7a5232', planksHD()), 0, 1.05, 0, cal);
  box(0.95, 0.75, 0.06, lam('#8a6040', planksHD()), 0, 1.75, 0.07, cal);
  ISLAND.calCanvas = document.createElement('canvas'); ISLAND.calCanvas.width = 512; ISLAND.calCanvas.height = 400;
  ISLAND.calTex = new THREE.CanvasTexture(ISLAND.calCanvas); ISLAND.calTex.colorSpace = THREE.SRGBColorSpace;
  const cface = new THREE.Mesh(new THREE.PlaneGeometry(0.86, 0.67), unlit('#ffffff', ISLAND.calTex)); cface.position.set(0, 1.75, 0.105); cal.add(cface);
  // party bits (shot 13)
  const party = new THREE.Group(); R.add(party); ISLAND.party = party;
  for (let i = 0; i < 6; i++) { const l = cyl(0.11, 0.11, 1.3, lam('#6b4428', barkTex()), 8, party); l.rotation.z = Math.PI / 2; l.rotation.y = i * Math.PI / 3; l.position.set(0, 1.75, 5.5); }
  ISLAND.flames = [];
  for (let i = 0; i < 3; i++) { const fl = new THREE.Mesh(new THREE.ConeGeometry(0.5 - i * 0.13, 1.4 - i * 0.3, 8), unlit(['#f07a24', '#f6a63a', '#ffe27a'][i])); fl.position.set(0, 2.3 + i * 0.05, 5.5); fl.layers.set(NOINK); fl.visible = false; party.add(fl); ISLAND.flames.push(fl); }
  const lampM = unlit('#ffd77a');
  ISLAND.lamps = [];
  for (let k = 0; k < 2; k++) { const z0 = k ? 1.5 : 8.5;
    for (const s of [-1, 1]) { const p = cyl(0.06, 0.06, 4, lam('#6b4428'), 6, party); p.position.set(s * 6, 3.6, z0); }
    for (let i = 0; i <= 12; i++) { const t = i / 12, x = -6 + 12 * t, y = 5.4 - Math.sin(t * Math.PI) * 0.9;
      const b = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), lampM); b.position.set(x, y, z0); b.layers.set(NOINK); party.add(b); ISLAND.lamps.push(b);
      if (i < 12) { const tri = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.4, 3), lam(['#c8302c', '#f4f1e8', '#1f3a8a'][i % 3])); tri.rotation.x = Math.PI; tri.position.set(x + 0.5, y - 0.22 - Math.sin(t * Math.PI) * 0.05, z0); party.add(tri); } } }
  // shores across the strait
  for (const s of [-1, 1]) for (let i = 0; i < 6; i++) {
    const h = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 10), lam(i % 2 ? '#4f8a46' : '#5d9a50')); h.scale.set(U(r, 60, 110), U(r, 18, 40), U(r, 50, 80)); h.position.set(s * U(r, 330, 420), -4, -400 + i * 140); R.add(h);
    for (let k = 0; k < 6; k++) pine(R, h.position.x + U(r, -50, 50) - s * 40, 0, h.position.z + U(r, -40, 40), U(r, 14, 22), k);
  }
  for (let i = 0; i < 8; i++) { const x = -500 + i * 140, z = U(r, -720, -650), rad = U(r, 80, 130), hh = U(r, 150, 230);
    const m = new THREE.Mesh(new THREE.ConeGeometry(rad, hh, 7), lam('#7d8fb0')); m.position.set(x, hh / 2 - 5, z); R.add(m);
    const sc = new THREE.Mesh(new THREE.ConeGeometry(rad * 0.36, hh * 0.36, 7), lam('#f4f6fb')); sc.position.set(x, hh - 5 - hh * 0.18 + 0.5, z); R.add(sc); }
  // ships (south of the island)
  ISLAND.ships = [ship(R, 20, 150, 0), ship(R, -45, 185, 0.1, 0.95), ship(R, 75, 200, -0.08, 0.95)];
}

// ---------------- PALACE (study) ----------------
export const PALACE = { root: new THREE.Group() };
function buildPalace() {
  const R = PALACE.root; R.position.copy(PAL); scene.add(R);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(14, 12).rotateX(-Math.PI / 2), lam('#b07a48', rep(planksHD(), 4, 3))); floor.receiveShadow = true; R.add(floor);
  const wm = lam('#ffffff', rep(wallTex(), 5, 1.6)), wains = lam('#6b4428', planksHD()), trim = lam('#e8d9b0');
  // back wall with a window hole (x 1.2..3.6, y 1.2..3.8) at z = -4
  const WZ = -4;
  box(8.2, 5.6, 0.3, wm, -2.9, 2.8, WZ, R); box(3.0, 5.6, 0.3, wm, 5.1, 2.8, WZ, R);
  box(2.4, 1.2, 0.3, wm, 2.4, 0.6, WZ, R); box(2.4, 1.8, 0.3, wm, 2.4, 4.7, WZ, R);
  for (const s of [-1, 1]) box(10, 5.6, 0.3, wm, s * 6.6, 2.8, 1, R).rotation.y = Math.PI / 2;
  box(13.2, 1.0, 0.1, wains, 0, 0.5, WZ + 0.2, R);
  box(13.2, 0.12, 0.16, trim, 0, 1.05, WZ + 0.22, R);
  // window frame + panes
  for (const [w, h, x, y] of [[2.6, 0.16, 2.4, 1.2], [2.6, 0.16, 2.4, 3.8], [0.16, 2.7, 1.15, 2.5], [0.16, 2.7, 3.65, 2.5], [0.08, 2.6, 2.4, 2.5], [2.5, 0.08, 2.4, 2.5]]) box(w, h, 0.2, trim, x, y, WZ + 0.05, R);
  // view outside: painted backdrop (sea + sky) and small ships
  const view = ctex('view', 1024, 1024, (g) => {
    const gr = g.createLinearGradient(0, 0, 0, 600); gr.addColorStop(0, '#5a92d8'); gr.addColorStop(1, '#bcd6f0'); g.fillStyle = gr; g.fillRect(0, 0, 1024, 600);
    g.fillStyle = '#7d8fb0'; g.beginPath(); g.moveTo(0, 600); for (let x = 0; x <= 1024; x += 64) g.lineTo(x, 560 - Math.abs(Math.sin(x * 0.01)) * 60); g.lineTo(1024, 600); g.fill();
    const s = g.createLinearGradient(0, 600, 0, 1024); s.addColorStop(0, '#5aa9c9'); s.addColorStop(1, '#1e6aa3'); g.fillStyle = s; g.fillRect(0, 600, 1024, 424);
    g.fillStyle = 'rgba(255,255,255,0.8)'; for (let i = 0; i < 40; i++) g.fillRect((i * 97) % 1024, 640 + (i * 53) % 360, 26, 3);
    g.fillStyle = 'rgba(255,255,255,0.95)'; for (const [x, y] of [[200, 200], [700, 140]]) { g.beginPath(); g.ellipse(x, y, 110, 34, 0, 0, TAU); g.ellipse(x + 50, y - 20, 70, 36, 0, 0, TAU); g.fill(); }
  });
  const bd = new THREE.Mesh(new THREE.PlaneGeometry(9, 9), unlit('#ffffff', view, { fog: false })); bd.position.set(2.4, 2.6, WZ - 3); bd.layers.set(NOINK); R.add(bd);
  PALACE.shipTex = ctex('tinyship', 512, 512, (g) => {
    g.fillStyle = '#5b3620'; g.beginPath(); g.moveTo(40, 330); g.lineTo(470, 330); g.lineTo(420, 410); g.lineTo(80, 410); g.closePath(); g.fill(); g.lineWidth = 10; g.strokeStyle = '#1a1010'; g.stroke();
    g.fillStyle = '#e2b04a'; g.fillRect(70, 350, 380, 12);
    for (const [x, h] of [[150, 240], [260, 280], [370, 220]]) { g.fillStyle = '#5a3a22'; g.fillRect(x - 5, 330 - h, 10, h); g.fillStyle = '#f3ecd8'; for (let k = 0; k < 3; k++) { const y = 330 - h + 20 + k * h * 0.3, w = 90 - k * 20; g.fillRect(x - w / 2, y, w, h * 0.24); g.strokeStyle = '#3a2a1a'; g.lineWidth = 5; g.strokeRect(x - w / 2, y, w, h * 0.24); } }
    g.fillStyle = '#c8302c'; g.fillRect(30, 230, 40, 26);
  });
  PALACE.ships = [];
  for (let i = 0; i < 2; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.2), unlit('#ffffff', PALACE.shipTex, { alphaTest: 0.5, fog: false })); m.layers.set(NOINK); R.add(m); PALACE.ships.push(m); }
  // curtains
  const curt = ctex('curtain', 256, 512, (g) => { for (let x = 0; x < 256; x += 32) { const gr = g.createLinearGradient(x, 0, x + 32, 0); gr.addColorStop(0, '#7a1c22'); gr.addColorStop(0.5, '#b8303a'); gr.addColorStop(1, '#6a161c'); g.fillStyle = gr; g.fillRect(x, 0, 32, 512); } });
  for (const x of [0.6, 4.2]) { const c = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 3.9), lam('#ffffff', curt, { side: THREE.DoubleSide })); c.position.set(x, 2.55, WZ + 0.25); c.castShadow = true; R.add(c); }
  box(4.4, 0.14, 0.14, lam('#e8c45a'), 2.4, 4.55, WZ + 0.3, R);
  // portrait frame (abstract landscape)
  const art = ctex('art', 512, 400, (g) => { g.fillStyle = '#9cc2e6'; g.fillRect(0, 0, 512, 400); g.fillStyle = '#6aa84f'; g.beginPath(); g.ellipse(256, 420, 360, 170, 0, 0, TAU); g.fill(); g.fillStyle = '#2f7a4a'; for (const x of [120, 380]) { g.beginPath(); g.moveTo(x, 120); g.lineTo(x - 50, 280); g.lineTo(x + 50, 280); g.fill(); } g.lineWidth = 34; g.strokeStyle = '#c9a23a'; g.strokeRect(0, 0, 512, 400); g.lineWidth = 6; g.strokeStyle = '#2a1a10'; g.strokeRect(3, 3, 506, 394); });
  const pf = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 1.33), unlit('#ffffff', art)); pf.position.set(-2.6, 2.9, WZ + 0.17); R.add(pf);
  // desk
  const dw = lam('#6b3e22', planksHD());
  box(2.8, 0.12, 1.15, dw, 0, 0.96, -1.6, R); box(2.7, 0.85, 0.08, dw, 0, 0.47, -1.06, R);
  for (const s of [-1, 1]) box(0.12, 0.9, 1.0, dw, s * 1.3, 0.45, -1.6, R);
  box(0.7, 0.08, 0.05, lam('#e8c45a'), 0, 0.6, -1.0, R);
  PALACE.docCanvas = document.createElement('canvas'); PALACE.docCanvas.width = 512; PALACE.docCanvas.height = 680;
  PALACE.docTex = new THREE.CanvasTexture(PALACE.docCanvas); PALACE.docTex.colorSpace = THREE.SRGBColorSpace;
  const doc = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.82).rotateX(-Math.PI / 2), unlit('#ffffff', PALACE.docTex)); doc.position.set(0.25, 1.025, -1.45); doc.rotation.y = 0.12; R.add(doc);
  const ink = cyl(0.07, 0.08, 0.12, lam('#24304a'), 10, R); ink.position.set(-0.85, 1.08, -1.7);
  const quill = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.6, 6), lam('#f4f1e8')); quill.position.set(-0.8, 1.35, -1.7); quill.rotation.z = 0.35; R.add(quill);
  PALACE.drawDoc(0);
}
PALACE.drawDoc = (seal) => {
  const g = PALACE.docCanvas.getContext('2d'), w = 512, h = 680;
  g.fillStyle = '#f3e6c4'; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#8a7350'; g.lineWidth = 6; g.strokeRect(12, 12, w - 24, h - 24);
  g.fillStyle = '#5a4630'; for (let i = 0; i < 13; i++) { const y = 90 + i * 34, ww = i === 0 ? 260 : 300 + ((i * 37) % 90); g.fillRect((w - ww) / 2, y, ww, i === 0 ? 14 : 7); }
  if (seal > 0) { const k = Math.min(1, seal); g.save(); g.translate(330, 560); g.scale(k, k); g.fillStyle = '#b8202a'; g.beginPath(); for (let i = 0; i < 24; i++) { const a = i / 24 * TAU, r = i % 2 ? 66 : 76; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.fill(); g.strokeStyle = '#7a1018'; g.lineWidth = 6; g.beginPath(); g.arc(0, 0, 48, 0, TAU); g.stroke(); g.fillStyle = '#e8c45a'; g.beginPath(); g.arc(0, 0, 16, 0, TAU); g.fill(); g.restore(); }
  PALACE.docTex.needsUpdate = true;
};

// ---------------- clouds (billboards, NOINK) ----------------
export const CLOUDS = [];
export function setClouds(center, L, n = 8, seed = 1, dist = [220, 380], hgt = [60, 140], spread = 1.0, fwd = null) {
  const r = rng(seed);
  while (CLOUDS.length < 12) { const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.5), new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, fog: false })); m.layers.set(NOINK); m.renderOrder = -5; scene.add(m); CLOUDS.push(m); }
  CLOUDS.forEach((m, i) => {
    if (i >= n) { m.visible = false; return; }
    m.visible = true; m.material.map = cloudHD(seed * 10 + i, L.cloud); m.material.needsUpdate = true;
    const a = (r() - 0.5) * 1.6 * spread + (fwd ?? Math.PI), d = U(r, dist[0], dist[1]);
    m.position.set(center.x + Math.sin(a) * d, U(r, hgt[0], hgt[1]), center.z + Math.cos(a) * d);
    const s = U(r, 70, 130); m.scale.set(s, s, 1); m.userData.base = m.position.clone();
  });
}

export function buildAll() { buildFarm(); buildIsland(); buildPalace(); }
export const SETS = { farm: FARM.root, island: ISLAND.root, palace: PALACE.root };
export function showSet(name) { for (const k in SETS) SETS[k].visible = k === name; }
