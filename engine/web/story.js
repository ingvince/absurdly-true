// Story: 15 shots timed to the voice (work/phrases.json). Everything is a pure function of the frame.
import * as THREE from 'three';
import { scene, camera, LIGHTS, mixLight, applyLight, POST, curLight } from './engine.js';
import { FARM, ISLAND, PALACE, ISL, PAL, SHIPS, showSet, setClouds, CLOUDS, flagPole } from './world.js';
import { actor, beginActors, endActors, blinkAt, ARMS, FARMER, REDCOAT, BRSOLDIER, BLUECOAT, ADMIRAL, SAILOR, EMPEROR,
  musketAim, musketUpright, scrollHold, mugHold, torchHold, stampHold, pig, halo, smoke, burst, puff, stars, potatoCard, thought, zzz, confetti, firework, muzzle, flame } from './cast.js';
import { bodyFront, bodySide } from './toon.js';

export const TOTAL = 1347;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const glide = (u) => { const x = clamp(u); return x * x * x * (x * (6 * x - 15) + 10); };
const eOut = (u) => 1 - (1 - clamp(u)) ** 3;
const eIn = (u) => clamp(u) ** 2;
const back = (u) => { const t = clamp(u), c = 1.9; return 1 + (c + 1) * (t - 1) ** 3 + c * (t - 1) ** 2; };
const prog = (f, a, b) => clamp((f - a) / (b - a));
const V = (x, y, z, o = null) => o ? [x + o.x, y + o.y, z + o.z] : [x, y, z];
const lerp3 = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
const spring = (f, f0) => { const t = Math.max(0, f - f0); return 1 - Math.exp(-0.32 * t) * Math.cos(0.55 * t); };

/** camera keys: [{f, pos, look, fov, roll, e}] -> smootherstep (or e) between keys, plus a creeping push on holds */
function keys(K, f, creep = 0.0025) {
  let a = K[0], b = K[0];
  for (let i = 0; i < K.length; i++) { if (K[i].f <= f) { a = K[i]; b = K[Math.min(i + 1, K.length - 1)]; } }
  const t = b.f > a.f ? (b.e || glide)((f - a.f) / (b.f - a.f)) : 0;
  const pos = lerp3(a.pos, b.pos, t), look = lerp3(a.look, b.look, t);
  // creep toward the look point when moving slowly
  const d = [look[0] - pos[0], look[1] - pos[1], look[2] - pos[2]], k = creep * (f - K[0].f) * 0.25;
  return { pos: [pos[0] + d[0] * k, pos[1] + d[1] * k, pos[2] + d[2] * k], look, fov: lerp(a.fov, b.fov, t), roll: lerp(a.roll || 0, b.roll || 0, t) };
}
// impact kicks: flip-shake decaying over 7 frames
const KICKS = [[226, 1.0], [241, 1.0], [298, 0.6], [396, 1.6], [457, 0.5], [773, 0.5], [1173, 1.4], [1325, 0.5]];
function kickAt(f) { let x = 0, y = 0; for (const [k, a] of KICKS) { const t = f - k; if (t >= 0 && t < 7) { const s = (t % 2 ? -1 : 1) * a * (1 - t / 7); x += s * 0.012; y += s * 0.018; } } return [x, y]; }

const face = (c) => c; // readability
const P = (o, opts) => (p) => bodyFront(p, o, opts);
const PS = (o, opts) => (p) => bodySide(p, o, opts);
const blob = 0.5;

// ---------------- extra props created on first use ----------------
let claim = null;
function claimFlags() {
  if (claim) return claim;
  claim = { uk: flagPole(ISLAND.root, -12, 1.6, 4, 'uk', 15, 6.4, 4.0), us: flagPole(ISLAND.root, 12, 1.6, 4, 'us', 15, 6.4, 4.0) };
  return claim;
}
let deckCannon = null, bucket = null;
function deckProps() {
  if (deckCannon) return;
  const s0 = ISLAND.ships[0].g;
  const g = new THREE.Group(); s0.add(g); g.position.set(-2.4, 8.0, -3.1);
  const iron = new THREE.MeshLambertMaterial({ color: 0x3a3c44 });
  deckCannon = g;
  bucket = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.22, 0.45, 14), new THREE.MeshLambertMaterial({ color: 0x8a6040 }));
  bucket.position.set(-2.95, 8.22, -1.9); bucket.castShadow = true; s0.add(bucket);
  const water = new THREE.Mesh(new THREE.CircleGeometry(0.25, 14).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0x4aa3d0 })); water.position.set(-2.95, 8.43, -1.9); s0.add(water);
}

// ---------------- shots ----------------
const F0 = FARM, I0 = ISL;
export const SHOTS = [
  { id: 1, a: 0, b: 132, set: 'farm', light: 'day', clouds: [5, 1],
    cam: (f) => keys([{ f: 0, pos: [0, 2.9, 14.2], look: [0, 1.1, -1.0], fov: 50 }, { f: 48, pos: [0, 2.7, 12.8], look: [0, 1.1, -1.0], fov: 50 },
      { f: 82, pos: [0.85, 1.0, 2.2], look: [0.85, 0.55, -0.7], fov: 42 }, { f: 131, pos: [0.88, 0.92, 1.8], look: [0.88, 0.58, -0.7], fov: 41 }], f),
    dof: (f) => f < 80 ? { cInf: 0, focus: 10 } : { cInf: 12 * prog(f, 80, 92), focus: 2.9 },
    update(f) {
      FARM.cannonL.g.visible = FARM.cannonR.g.visible = FARM.flagUK.g.visible = FARM.flagUS.g.visible = true;
      FARM.flagUK.wave(f, 1, 1); FARM.flagUS.wave(f + 9, 1, -1);
      const sh = f >= 55 && f < 75 ? Math.sin(f * 2.3) * 0.02 : 0; FARM.cannonL.barrelG.rotation.z = 0.08 + sh; FARM.cannonR.barrelG.rotation.z = 0.08 - sh;
      const up = back(prog(f, 84, 94));
      actor(pig({ f, chomp: f < 84 || f > 104, potato: true, headUp: up * 0.6, look: f >= 88 ? 'cam' : 'side', bandana: true, blink: f > 100 && f < 103 ? 1 : 0 }), { pos: [0.55, 0, -0.68], s: 1.35, blob: 0.75 });
      if (f >= 55 && f < 76) for (const x of [-4.25, 4.25]) actor(stars(((f - 55) % 7) / 7), { pos: [x, 0.75, -0.2], s: 0.45, blob: 0 });
    } },
  { id: 2, a: 132, b: 273, set: 'island', light: 'day', clouds: [8, 2], fog: [80, 900],
    cam: (f) => keys([{ f: 132, pos: V(-3.35, 3.35, 15.2, I0), look: V(-3.5, 3.3, 9.1, I0), fov: 38 }, { f: 172, pos: V(-3.35, 3.4, 14.4, I0), look: V(-3.5, 3.3, 9.1, I0), fov: 38 },
      { f: 236, pos: V(14, 105, 225, I0), look: V(0, 0, 0, I0), fov: 40 }, { f: 272, pos: V(14, 96, 205, I0), look: V(0, 1, 0, I0), fov: 40 }], f),
    dof: (f) => f < 172 ? { cInf: 10, focus: 6 } : { cInf: 10 * (1 - prog(f, 172, 196)), focus: 6 },
    update(f) {
      const c = claimFlags(); c.uk.g.visible = c.us.g.visible = true; ISLAND.sign.visible = true;
      const dropUK = 1 - eIn(prog(f, 214, 226)), dropUS = 1 - eIn(prog(f, 229, 241));
      c.uk.g.position.y = 1.6 + dropUK * 80; c.us.g.position.y = 1.6 + dropUS * 80;
      c.uk.wave(f, 1, 1); c.us.wave(f + 7, 1, -1);
      if (f >= 226 && f < 250) actor(puff(prog(f, 226, 250)), { pos: V(-12, 1.6, 6, I0), s: 6, blob: 0 });
      if (f >= 241 && f < 265) actor(puff(prog(f, 241, 265)), { pos: V(12, 1.6, 6, I0), s: 6, blob: 0 });
    } },
  { id: 3, a: 273, b: 385, set: 'farm', light: 'day', clouds: [5, 3],
    cam: (f) => keys([{ f: 273, pos: [0.9, 1.55, 3.6], look: [-3.0, 0.85, -3.8], fov: 46 }, { f: 384, pos: [0.4, 1.5, 2.4], look: [-3.2, 0.9, -3.9], fov: 45 }], f),
    dof: (f) => ({ cInf: 5, focus: 6.5 }),
    update(f) {
      const open = eOut(prog(f, 293, 299)); FARM.door.rotation.y = -1.9 * open;
      const out = back(prog(f, 296, 306));
      const fz = lerp(-5.75, -4.5, out), fx = lerp(-5.35, -4.6, out);
      const expr = f < 300 ? 'neutral' : f < 322 ? 'shock' : f < 345 ? 'angry' : 'yell';
      const arms = f >= 326 ? ARMS.point : null;
      const hop = f >= 350 && f < 362 ? Math.sin(prog(f, 350, 362) * Math.PI) * 0.18 : 0;
      if (f >= 294) actor(P(FARMER, { mode: 'stand', expr, facing: 1, seed: 3, blink: blinkAt(f, 3), arms, tilt: f >= 326 ? 4 : 0, headTilt: f >= 345 ? Math.sin(f * 0.9) * 3 : 0 }), { pos: [fx, hop, fz], s: 1, blob, ground: 0 });
      const look = f >= 352;
      actor(pig({ f, chomp: !look, potato: true, bandana: true, headUp: look ? 0.4 : 0, look: look ? 'cam' : 'side' }), { pos: [-1.9, 0, -2.6], s: 1.35, blob: 0.75, flip: true });
    } },
  { id: 4, a: 385, b: 429, set: 'farm', light: 'day', clouds: [5, 3],
    cam: (f) => keys([{ f: 385, pos: [-1.45, 1.55, 0.1], look: [-1.55, 1.38, -3.0], fov: 44 }, { f: 428, pos: [-1.48, 1.52, -0.4], look: [-1.55, 1.38, -3.0], fov: 43 }], f),
    dof: () => ({ cInf: 11, focus: 3.0 }),
    update(f) {
      const aimK = eOut(prog(f, 385, 392));
      const arms = aimK < 1 ? [[10, 34, 4, 50, true], [16, 30, 20 + 30 * aimK, 30 - 22 * aimK, true]] : ARMS.aim;
      const recoil = f >= 396 && f < 402 ? (1 - prog(f, 396, 402)) * 0.06 : 0;
      actor(P(FARMER, { mode: 'stand', expr: f < 396 ? 'stern' : f < 404 ? 'shock' : 'neutral', facing: 1, seed: 3, blink: f < 396 ? 0.5 : blinkAt(f, 3), arms, hold: musketAim(130), tilt: -recoil * 60 }), { pos: [-2.0 - recoil, 0, -3.0], s: 1, blob, ground: 0 });
      if (f >= 396 && f < 401) actor(muzzle(prog(f, 396, 401)), { pos: [-1.05, 0.78, -2.95], s: 0.55, blob: 0 });
      if (f >= 397) { const t = prog(f, 397, 428); actor(smoke(eOut(t), 1), { pos: [-0.75 + t * 0.3, 0.15 + t * 0.15, -3.1], s: 1.0 + t * 0.8, blob: 0 }); }
      for (let i = 0; i < 4; i++) { const t0 = 400 + i * 3; if (f >= t0) { const t = (f - t0) / 30; actor(potatoCard(f * 0.3 + i, 0), { pos: [-1.25 + i * 0.15 + t * (0.3 + i * 0.1), -0.6 + t * 3.0 - t * t * 2.4, -3.3], s: 0.45, blob: 0 }); } }
      if (f >= 411) actor(halo(f), { pos: [-1.15, lerp(-0.6, 0.55, eOut(prog(f, 411, 428))), -3.3], s: 0.45, blob: 0 });
    } },
  { id: 5, a: 429, b: 499, set: 'farm', light: 'day', clouds: [5, 4],
    cam: (f) => keys([{ f: 429, pos: [-2.55, 1.5, 2.0], look: [-2.6, 1.15, -3.1], fov: 44 }, { f: 455, pos: [-2.55, 1.48, 1.6], look: [-2.6, 1.15, -3.1], fov: 44 },
      { f: 466, pos: [-2.5, 1.45, 1.15], look: [-2.6, 1.18, -3.1], fov: 43, roll: -0.07 }, { f: 498, pos: [-2.48, 1.45, 0.95], look: [-2.6, 1.18, -3.1], fov: 43, roll: -0.075 }], f),
    dof: () => ({ cInf: 10, focus: 4.4 }),
    update(f) {
      const pt = f >= 452; const k = back(prog(f, 452, 458));
      const arms = pt ? [[14, 34, -8, 48, true], [lerp(14, 26, k), lerp(34, 4, k), lerp(-8, 62, k), lerp(48, -6, k), true]] : ARMS.scroll;
      actor(P(REDCOAT, { mode: 'stand', expr: pt ? 'angry' : 'stern', facing: 1, seed: 7, blink: blinkAt(f, 7), arms, hold: pt ? null : scrollHold(eOut(prog(f, 429, 440))), tilt: pt ? 3 * k : 0 }), { pos: [-3.2, 0, -2.75], s: 1.03, blob, ground: 0 });
      actor(P(FARMER, { mode: 'stand', expr: f > 458 ? 'bored' : 'stern', facing: -1, seed: 3, blink: blinkAt(f, 3), arms: ARMS.cross, headTilt: f > 462 ? -4 : 0 }), { pos: [-1.95, 0, -3.6], s: 1, blob, ground: 0 });
    } },
  { id: 6, a: 499, b: 570, set: 'farm', light: 'day', clouds: [5, 5],
    cam: (f) => { const x = -8 + 1.6 * (f - 499) / 30; return keys([{ f: 499, pos: [x - 1.6, 1.25, 16.8], look: [x - 0.2, 1.0, 9], fov: 52 }, { f: 569, pos: [x - 1.2, 1.25, 16.2], look: [x - 0.2, 1.0, 9], fov: 52 }], f); },
    dof: () => ({ cInf: 6, focus: 7.6 }),
    update(f) {
      const t = (f - 499) / 30;
      for (let i = 0; i < 5; i++) { const x = -8 + 1.6 * t - i * 1.25 + 2.2, ph = ((t + i * 0.0) % 1 + 1) % 1;
        actor(PS(Object.assign({}, BLUECOAT(i), { rifle: true }), { phase: ph, mode: 'march', expr: i === 0 ? 'stern' : 'neutral', seed: 20 + i, blink: blinkAt(f, 20 + i), stride: 1 }), { pos: [x, 0, 9 + (i % 2) * 0.35], s: 1, blob, yaw: 0, ground: 0 }); }
    } },
  { id: 7, a: 570, b: 679, set: 'island', light: 'day', clouds: [8, 6], fog: [60, 700],
    cam: (f) => keys([{ f: 570, pos: V(8, 6, 245, I0), look: V(20, 7, 160, I0), fov: 50 }, { f: 592, pos: V(9, 6, 238, I0), look: V(22, 7, 160, I0), fov: 50 },
      { f: 640, pos: V(24, 6.0, 177, I0), look: V(25, 4.2, 150, I0), fov: 46 }, { f: 678, pos: V(25, 5.9, 174, I0), look: V(25.5, 4.0, 150, I0), fov: 45 }], f),
    dof: () => ({ cInf: 0, focus: 30 }),
    update(f) { const t = prog(f, 570, 610);
      for (let i = 0; i < 6; i++) { const fx = -30 + i * 14, fz = 170 + (i % 3) * 14; actor(smoke(0.9, i, '#f2f4f8'), { pos: V(fx * 1.4 + t * 30 * (i % 2 ? 1 : -1), -6, fz, I0), s: 34 * (1 - t * 0.9), blob: 0, tint: [1, 1, 1] }); }
    } },
  { id: 8, a: 679, b: 751, set: 'island', light: 'day', clouds: [8, 7], fog: [60, 700],
    cam: (f) => keys([{ f: 679, pos: V(-1, 3.4, -7, I0), look: V(24, 4.5, 150, I0), fov: 8 }, { f: 688, pos: V(-1, 3.4, -7, I0), look: V(24, 4.5, 150, I0), fov: 8 },
      { f: 716, pos: V(-2.6, 3.4, -6.6, I0), look: V(0, 1.8, 0.2, I0), fov: 42 }, { f: 750, pos: V(-0.55, 2.75, -3.1, I0), look: V(-0.02, 1.95, -0.36, I0), fov: 40 }], f),
    dof: (f) => f < 712 ? { cInf: 0, focus: 50 } : { cInf: 9 * prog(f, 712, 722), focus: 3.3 },
    update(f) {
      for (const [x, z, s] of [[-6.4, 0.9, 1], [-6.0, 2.3, 2], [-7.0, -0.6, 3]]) actor(P(BLUECOAT(s), { mode: 'stand', expr: 'stern', facing: 1, seed: 30 + s, blink: 0.5, arms: ARMS.aim, hold: musketAim(130) }), { pos: V(x, 1.6, z, I0), s: 1, blob, ground: 1.6 + I0.y });
      actor(potatoCard(10, 0), { pos: V(-0.02, 1.82, -0.36, I0), s: 0.7, blob: 0 });
      if (f >= 708 && f < 730) actor(stars(prog(f, 708, 730)), { pos: V(-0.02, 1.4, -0.3, I0), s: 0.4, blob: 0, tint: [1, 1, 1] });
    } },
  { id: 9, a: 751, b: 836, set: 'island', light: 'golden', clouds: [8, 8], fog: [60, 600], ship: true, azAdd: 75,
    cam: (f) => { const s = SHIPS[0].g; const W = (x, y, z) => { const v = new THREE.Vector3(x, y, z); s.localToWorld(v); return [v.x, v.y, v.z]; };
      return keys([{ f: 751, pos: W(-4.75, 9.55, 3.95), look: W(-4.75, 9.15, -2.0), fov: 52 }, { f: 835, pos: W(-4.75, 9.5, 3.45), look: W(-4.75, 9.15, -2.0), fov: 51 }], f); },
    dof: () => ({ cInf: 8, focus: 6.2 }),
    update(f) { deckProps(); const s = SHIPS[0].g; const W = (x, y, z) => { const v = new THREE.Vector3(x, y, z); s.localToWorld(v); return [v.x, v.y, v.z]; };
      const stop = back(prog(f, 769, 775));
      const arms = f >= 769 ? [null, [lerp(22, 30, stop), lerp(26, -4, stop), lerp(6, 44, stop), lerp(52, -46, stop), true]] : ARMS.hips;
      actor(P(ADMIRAL, { mode: 'stand', expr: f >= 769 ? 'stern' : 'neutral', facing: 1, seed: 11, blink: blinkAt(f, 11), arms }), { pos: W(-5.35, 8.0, -0.8), s: 1.04, blob, ground: W(0, 8.0, 0)[1] });
      const dunk = eOut(prog(f, 796, 803));
      const sArms = f < 796 ? ARMS.torch : [null, [lerp(26, 28, dunk), lerp(6, 26, dunk), lerp(34, 46, dunk), lerp(-30, 52, dunk), true]];
      actor(P(SAILOR, { mode: 'stand', expr: f < 772 ? 'grin' : f < 800 ? 'shock' : 'nervous', facing: -1, seed: 12, blink: blinkAt(f, 12), arms: sArms, hold: torchHold(f, f < 803 ? 1 : 0) }), { pos: W(-4.05, 8.0, -1.2), s: 0.98, blob, ground: W(0, 8.0, 0)[1], flip: true });
      if (f >= 802) actor(puff(prog(f, 802, 830)), { pos: W(-2.95, 8.0, -1.9), s: 0.9, blob: 0, tint: [1, 1, 1] });
    } },
  { id: 10, a: 836, b: 907, set: 'island', light: 'golden', clouds: [8, 8], fog: [60, 600], ship: true, azAdd: 75,
    cam: (f) => { const s = SHIPS[0].g; const W = (x, y, z) => { const v = new THREE.Vector3(x, y, z); s.localToWorld(v); return [v.x, v.y, v.z]; };
      return keys([{ f: 836, pos: W(-5.55, 9.75, 2.4), look: W(-5.75, 9.6, -0.6), fov: 40 }, { f: 906, pos: W(-5.57, 9.72, 1.95), look: W(-5.75, 9.62, -0.6), fov: 39, roll: 0.03 }], f); },
    dof: () => ({ cInf: 13, focus: 3.0 }),
    update(f) { deckProps(); const s = SHIPS[0].g; const W = (x, y, z) => { const v = new THREE.Vector3(x, y, z); s.localToWorld(v); return [v.x, v.y, v.z]; };
      const shake = f < 866 ? Math.sin((f - 836) * 0.55) * 7 * (1 - prog(f, 856, 866)) : 0;
      actor(P(ADMIRAL, { mode: 'stand', expr: f < 876 ? 'stern' : 'smile_closed', facing: 0, seed: 11, blink: f < 866 ? 1 : blinkAt(f, 11), arms: ARMS.cross, headTilt: shake }), { pos: W(-5.9, 8.0, -0.6), s: 1.04, blob, ground: W(0, 8.0, 0)[1] });
      if (f >= 864) actor(thought(back(prog(f, 864, 872)) * 0.9, pig({ f, chomp: true, potato: true, bandana: true })), { pos: W(-5.4, 9.05, -0.7), s: 0.45, blob: 0, tint: [1, 1, 1] });
    } },
  { id: 11, a: 907, b: 977, set: 'island', light: 'golden', clouds: [8, 9], fog: [60, 600], camps: true,
    cam: (f) => keys([{ f: 907, pos: V(0, 6.5, 17, I0), look: V(0, 2.3, -1, I0), fov: 50 }, { f: 960, pos: V(0, 3.6, 11.2, I0), look: V(0, 2.5, 1, I0), fov: 48 }, { f: 976, pos: V(0, 3.5, 10.8, I0), look: V(0, 2.5, 1, I0), fov: 48 }], f),
    dof: () => ({ cInf: 0, focus: 9 }),
    update(f) { campSitters(f, 0, f >= 938 && f < 960 ? 1 : 0); } },
  { id: 12, a: 977, b: 1031, set: 'island', light: 'cycle', clouds: [8, 9], fog: [60, 600], camps: true,
    cam: (f) => keys([{ f: 977, pos: V(0, 2.95, 8.6, I0), look: V(0, 2.45, 2.8, I0), fov: 50 }, { f: 1030, pos: V(0, 2.9, 7.8, I0), look: V(0, 2.45, 2.8, I0), fov: 49 }], f),
    dof: () => ({ cInf: 6, focus: 4.4 }),
    update(f) { const t = prog(f, 977, 1027); campSitters(f, t, 0, true);
      drawCalendar(1860 + Math.min(12, Math.floor(t * 13)));
      for (const m of CLOUDS) if (m.visible && m.userData.base) m.position.x = m.userData.base.x + (f - 977) * 9; } },
  { id: 13, a: 1031, b: 1111, set: 'island', light: 'night', clouds: [6, 10], fog: [40, 500], camps: true, party: true,
    cam: (f) => keys([{ f: 1031, pos: V(-2.0, 2.85, 12.2, I0), look: V(0, 2.55, 5.6, I0), fov: 46, roll: 0.03 }, { f: 1110, pos: V(2.0, 2.85, 11.6, I0), look: V(0, 2.55, 5.6, I0), fov: 45, roll: -0.04 }], f),
    dof: () => ({ cInf: 9, focus: 5.6 }),
    update(f) {
      const warm = [1.0, 0.82, 0.66];
      const clink = f >= 1050 && f < 1062 ? Math.sin(prog(f, 1050, 1062) * Math.PI) : 0;
      const toast = f >= 1048;
      const armsR = [null, [26, -14, lerp(30, 20, clink), lerp(-56, -50, clink), true]];
      const expr = f < 1056 ? 'grin' : 'laugh';
      const bob = (s) => Math.abs(Math.sin(f * 0.25 + s)) * 0.05;
      actor(P(Object.assign({}, BRSOLDIER(0), { beard: '#c08a4a' }), { mode: 'stand', expr, facing: 1, seed: 40, blink: blinkAt(f, 40), arms: armsR, hold: mugHold(1), beardLen: 0.85, headTilt: f > 1060 ? Math.sin(f * 0.5) * 4 : 0 }), { pos: V(-0.7, 1.6 + bob(0), 7.2, I0), s: 1, blob, ground: 1.6, tint: warm });
      actor(P(Object.assign({}, BLUECOAT(0), { beard: '#6a4026' }), { mode: 'stand', expr, facing: -1, seed: 41, blink: blinkAt(f, 41), arms: armsR, hold: mugHold(1), beardLen: 0.85, headTilt: f > 1060 ? Math.sin(f * 0.5 + 1) * 4 : 0 }), { pos: V(0.7, 1.6 + bob(1), 7.2, I0), s: 1, blob, ground: 1.6, tint: warm, flip: true });
      for (const [x, s, o] of [[-2.6, 2, BRSOLDIER(1)], [2.6, 3, BLUECOAT(2)]]) actor(P(o, { mode: 'stand', expr: 'laugh', facing: 0, seed: 50 + s, arms: ARMS.cheer, tilt: Math.sin(f * 0.3 + s) * 6 }), { pos: V(x, 1.6 + Math.abs(Math.sin(f * 0.3 + s)) * 0.25, 3.6, I0), s: 1, blob, ground: 1.6, tint: warm });
      if (f >= 1053 && f < 1066) actor(stars(prog(f, 1053, 1066)), { pos: V(0, 2.75, 7.4, I0), s: 0.5, blob: 0, tint: [1, 1, 1] });
      for (let k = 0; k < 4; k++) { const per = 28, t0 = 1031 + k * 17; const t = ((f - t0) % per + per) % per / per; actor(firework(t, ['#ffd34d', '#f3a9bb', '#9fd4ff', '#ffffff'][k]), { pos: V(-14 + k * 9, 13 + (k % 2) * 4, -18, I0), s: 6, blob: 0, tint: [1, 1, 1] }); }
      actor(flame(f), { pos: V(0, 1.62, 5.5, I0), s: 0.75, blob: 0, tint: [1.3, 1.2, 1.1] });
    } },
  { id: 14, a: 1111, b: 1255, set: 'palace', light: 'interior',
    cam: (f) => keys([{ f: 1111, pos: V(0.15, 1.55, 1.7, PAL), look: V(0, 1.42, -2.2, PAL), fov: 36 }, { f: 1196, pos: V(0.1, 1.52, 1.25, PAL), look: V(0, 1.42, -2.2, PAL), fov: 36 },
      { f: 1230, pos: V(1.5, 2.25, 0.9, PAL), look: V(2.4, 2.45, -4.0, PAL), fov: 40 }, { f: 1254, pos: V(1.6, 2.28, 0.6, PAL), look: V(2.4, 2.45, -4.0, PAL), fov: 40 }], f),
    dof: (f) => f < 1205 ? { cInf: 9, focus: 3.7 } : { cInf: 6, focus: 5.0 },
    update(f) {
      const up = eOut(prog(f, 1113, 1124)), down = f >= 1170 ? eIn(prog(f, 1170, 1173)) : 0;
      let arms = ARMS.hips;
      if (f >= 1113) { const a = ARMS.stampUp[1], b = ARMS.stampDown[1]; const k = down; arms = [ARMS.stampUp[0], [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k), lerp(a[3], b[3], k), true]];
        if (up < 1) arms = [ARMS.stampUp[0], [lerp(22, a[0], up), lerp(26, a[1], up), lerp(6, a[2], up), lerp(52, a[3], up), true]]; }
      const expr = f < 1141 ? 'smile' : f < 1173 ? 'stern' : f < 1200 ? 'grin' : 'smile_closed';
      actor(P(EMPEROR, { mode: 'stand', expr, facing: 0, seed: 60, blink: blinkAt(f, 60), arms, hold: f >= 1113 ? stampHold : null, tilt: f >= 1170 && f < 1180 ? 3 : 0 }), { pos: V(0.05, f >= 1173 && f < 1176 ? -0.03 : 0, -2.25, PAL), s: 1.0, blob: 0.4, ground: 0 });
      PALACE.drawDoc(f >= 1173 ? back(prog(f, 1173, 1181)) : 0);
      PALACE.ships.forEach((m, i) => { const t = prog(f, 1198 + i * 8, 1250); m.position.set(1.7 + i * 1.0 + t * 1.5, 1.95 - i * 0.12, -6.9 + i * 0.1); m.scale.setScalar(1 - t * 0.45); m.visible = true; });
    } },
  { id: 15, a: 1255, b: 1347, set: 'farm', light: 'twilight', clouds: [5, 11],
    cam: (f) => keys([{ f: 1255, pos: [0.45, 1.45, 5.6], look: [0.42, 1.05, 0.4], fov: 40 }, { f: 1320, pos: [0.43, 1.32, 4.3], look: [0.42, 1.12, 0.4], fov: 39, roll: 0.06 }, { f: 1346, pos: [0.43, 1.3, 4.05], look: [0.42, 1.15, 0.4], fov: 39, roll: 0.07 }], f),
    dof: () => ({ cInf: 11, focus: 3.7 }),
    update(f) { FARM.grave.visible = true; FARM.grave.position.set(0.4, 0, 0.75);
      if (f >= 1320) { const k = back(prog(f, 1320, 1329)); actor(pig({ f, ghost: true, chomp: f > 1330, potato: true, wink: f >= 1336, look: f < 1336 ? 'cam' : 'side' }), { pos: [0.3, lerp(-0.7, 0.95, k) + Math.sin(f * 0.15) * 0.03, 0.35], s: 0.9, blob: 0, tint: [1, 0.98, 1] }); }
    } },
];

// two bored soldiers on crates + their camp (shots 11-12); t = time-lapse 0..1
function campSitters(f, t, yawn, lapse = false) {
  const bl = lapse ? 0.15 + 0.85 * t : 0;
  const zz = lapse && t > 0.5;
  actor(P(Object.assign({}, BRSOLDIER(0), { beard: '#c08a4a' }), { mode: 'sit', expr: yawn ? 'yawn' : zz ? 'bored' : 'bored', facing: 1, seed: 40, blink: zz ? 1 : blinkAt(f, 40), beardLen: bl, arms: yawn ? ARMS.yawn : null }), { pos: V(-0.95, 2.13, 3.95, I0), s: 1, blob: 0.4, ground: 1.6 });
  actor(P(Object.assign({}, BLUECOAT(0), { beard: '#6a4026' }), { mode: 'sit', expr: 'bored', facing: -1, seed: 41, blink: zz ? 1 : blinkAt(f, 41), beardLen: bl }), { pos: V(0.95, 2.13, 3.95, I0), s: 1, blob: 0.4, ground: 1.6, flip: true });
  if (zz) actor(zzz(f), { pos: V(-0.6, 3.2, 4.0, I0), s: 0.5, blob: 0, tint: [1, 1, 1] });
  ISLAND.flagUK.wave(f, 1, 1); ISLAND.flagUS.wave(f + 5, 1, -1);
}
let calYear = 0;
function drawCalendar(y) {
  if (y === calYear) return; calYear = y;
  const g = ISLAND.calCanvas.getContext('2d'); g.fillStyle = '#f6efde'; g.fillRect(0, 0, 512, 400);
  g.fillStyle = '#c8302c'; g.fillRect(0, 0, 512, 90); g.fillStyle = '#ffffff'; g.font = 'bold 60px Georgia'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('YEAR', 256, 48);
  g.fillStyle = '#2a1a10'; g.font = 'bold 190px Georgia'; g.fillText(String(y), 256, 255);
  g.strokeStyle = '#2a1a10'; g.lineWidth = 10; g.strokeRect(5, 5, 502, 390);
  ISLAND.calTex.needsUpdate = true;
}

export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f < s.b) || SHOTS[SHOTS.length - 1];
let lastShot = null;

/** set the whole world for frame f */
export function setFrame(f) {
  const S = shotAt(f);
  showSet(S.set);
  // per-shot visibility
  FARM.cannonL.g.visible = FARM.cannonR.g.visible = FARM.flagUK.g.visible = FARM.flagUS.g.visible = false;
  FARM.grave.visible = false; FARM.door.rotation.y = 0;
  ISLAND.sign.visible = S.id === 2; if (claim) claim.uk.g.visible = claim.us.g.visible = false;
  ISLAND.camps.visible = !!S.camps; ISLAND.party.visible = !!S.party;
  ISLAND.patch.g.visible = true;
  if (S.camps && S.id !== 12) drawCalendar(S.id === 13 ? 1872 : 1860);
  // ships: sail in during shot 7; gunports open on "seventy cannons"
  const sail = prog(f, 570, 679) * 13;
  ISLAND.ships.forEach((sh, k) => {
    sh.g.position.x = sh.x + sail - 13; sh.g.position.y = Math.sin(f * 0.05 + k) * 0.12; sh.g.rotation.z = Math.sin(f * 0.04 + k * 2) * 0.012;
    sh.ens.wave(f + k * 5, 1, 1);
    for (const p of sh.ports) {
      const t0 = 620 + p.i * 2 + (p.row > 4 ? 1 : 0) + k * 3, open = f < 570 ? 0 : back(prog(f, t0, t0 + 6)), out = eOut(prog(f, t0 + 3, t0 + 9));
      p.lidG.rotation.x = -p.side * 1.7 * open; p.can.position.z = p.side * (4.6 + 1.0 * out);
    }
  });
  ISLAND.root.updateMatrixWorld(true);
  // camera
  const c = S.cam(f); const [kx, ky] = kickAt(f);
  camera.position.set(...c.pos); camera.fov = c.fov; camera.up.set(0, 1, 0); camera.lookAt(new THREE.Vector3(...c.look));
  camera.rotateZ((c.roll || 0) + kx * 0.6); camera.position.y += ky * 0.4;
  camera.updateMatrixWorld();
  // light: sun frozen per shot from the shot's first camera
  let L = LIGHTS[S.light];
  if (S.light === 'cycle') { const t = prog(f, 977, 1027), k = 0.5 - 0.5 * Math.cos(t * Math.PI * 2 * 3); L = mixLight(LIGHTS.golden, LIGHTS.night, k); }
  const c0 = S.cam(S.a), fwd = new THREE.Vector3(c0.look[0] - c0.pos[0], 0, c0.look[2] - c0.pos[2]).normalize();
  const focus = new THREE.Vector3(...c.look);
  applyLight(L, focus, fwd, { azAdd: S.azAdd || 0, fogNear: S.fog?.[0], fogFar: S.fog?.[1], shadowSize: S.id === 2 || S.id === 7 ? 60 : 16 });
  ISLAND.sea.material.color.set(L.water.b);
  if (lastShot !== S.id) { lastShot = S.id; if (S.clouds) { const ctr = new THREE.Vector3(...c0.pos); setClouds(ctr, L, S.clouds[0], S.clouds[1], [260, 420], [70, 150], 1.0, Math.atan2(fwd.x, fwd.z)); } else setClouds(new THREE.Vector3(), L, 0); }
  if (S.light === 'cycle' || S.light === 'night' || S.light === 'golden' || S.light === 'twilight') for (const m of CLOUDS) if (m.visible) m.material.color.set(S.light === 'cycle' ? '#ffffff' : '#ffffff');
  for (const m of CLOUDS) if (m.visible) m.lookAt(camera.position);
  ISLAND.waterTex.offset.set(f * 0.0006, f * 0.0003);
  // farm patch leaves sway
  FARM.patch.leaves.forEach((l, i) => { l.rotation.z = Math.sin(f * 0.08 + i) * 0.12; });
  // lens
  const d = S.dof(f); POST.cInf = d.cInf; POST.focus = d.focus;
  POST.flash = Math.max(f >= 396 && f < 400 ? 0.75 * (1 - (f - 396) / 4) : 0, f >= 977 && f < 983 ? 1 - (f - 977) / 6 : 0);
  POST.fade = f >= 1342 ? 0 : 0;
  // actors
  beginActors(); S.update(f); endActors();
  return S;
}
