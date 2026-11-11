// Engine: renderer, two-tone world shading, light presets, ink pass, lens blur, grade.
// Ported from the cartoon-3d-short bridge templates (lights.ts, shade.ts, ink.ts, lensblur.ts) to plain three.js r160.
import * as THREE from 'three';
export { THREE };
export const W = 1080, H = 1920, NOINK = 3;

export const canvas = document.getElementById('c');
export const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.shadowMap.autoUpdate = false;
renderer.outputColorSpace = THREE.LinearSRGBColorSpace; renderer.toneMapping = THREE.NoToneMapping;
renderer.autoClear = true;

export const scene = new THREE.Scene();
export const camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 2000);

// ---------------- light presets (lights.ts + extra night / twilight / interior) ----------------
export const LIGHTS = {
  day: { az: 75, el: 48, lit: [1.58, 1.5, 1.33], shade: [0.3, 0.29, 0.36], lift: [0.05, 0.06, 0.11], lambert: 0.35, sideK: 0.84, term: 0.2,
    charTint: [1.0, 0.95, 0.93], blob: 0.42, fog: '#b8d0ec', fogNear: 30, fogFar: 700, sunDisc: null,
    sky: { c: ['#b8d0ec', '#9cbfea', '#6a9fe0', '#4f8cdb', '#3373cc'], e: [0, 3, 8, 16, 40] }, sat: 1.08, cloud: { lit: '#fbf8f1', mid: '#e1e5f3', shade: '#c3cbe9' },
    water: { a: '#22a7b6', b: '#167fb2', c: '#1a5596' } },
  golden: { az: 6, el: 9, lit: [1.5, 0.78, 0.36], shade: [0.17, 0.17, 0.32], lift: [0.04, 0.06, 0.17], lambert: 0.35, sideK: 0.82, term: 0.07,
    charTint: [1.0, 0.8, 0.6], blob: 0.5, fog: '#efb489', fogNear: 50, fogFar: 420, sunDisc: '#ffcf9e',
    sky: { c: ['#ffc47c', '#f7ae78', '#e8967c', '#c4848e', '#8a6f8a'], e: [0, 4, 10, 20, 40] }, sat: 1.1, cloud: { lit: '#ffd2a8', mid: '#f2a08f', shade: '#a98fc4' },
    water: { a: '#3a5f96', b: '#2a4a80', c: '#d4a48e' } },
  night: { az: 150, el: 40, lit: [0.5, 0.58, 0.95], shade: [0.1, 0.11, 0.24], lift: [0.03, 0.04, 0.1], lambert: 0.35, sideK: 0.84, term: 0.2,
    charTint: [0.62, 0.68, 0.95], blob: 0.55, fog: '#2a3a6a', fogNear: 30, fogFar: 380, sunDisc: null, moon: true,
    sky: { c: ['#3a4d82', '#2c3d72', '#1c2a5a', '#121d45', '#0a1232'], e: [0, 4, 10, 20, 40] }, sat: 1.0, cloud: { lit: '#8a95c4', mid: '#6a75a8', shade: '#4a5288' },
    water: { a: '#1d3364', b: '#142650', c: '#2c3f70' }, stars: 1 },
  twilight: { az: 20, el: 4, lit: [1.0, 0.72, 0.85], shade: [0.16, 0.15, 0.32], lift: [0.04, 0.05, 0.14], lambert: 0.35, sideK: 0.84, term: 0.1,
    charTint: [0.88, 0.78, 0.92], blob: 0.5, fog: '#c48a9e', fogNear: 40, fogFar: 400, sunDisc: null, moon: true,
    sky: { c: ['#e6a39c', '#c98aa0', '#8a74a6', '#4a4a8a', '#232a62'], e: [0, 4, 10, 20, 40] }, sat: 1.05, cloud: { lit: '#f2b8b0', mid: '#b48aac', shade: '#6a5f96' },
    water: { a: '#4a4a86', b: '#33356e', c: '#c48a9e' }, stars: 0.5 },
  interior: { az: 60, el: 35, lit: [1.45, 1.22, 0.95], shade: [0.34, 0.28, 0.4], lift: [0.06, 0.05, 0.08], lambert: 0.4, sideK: 0.9, term: 0.25,
    charTint: [1.0, 0.92, 0.84], blob: 0.45, fog: '#c9a07a', fogNear: 60, fogFar: 600, sunDisc: null,
    sky: { c: ['#b8d0ec', '#9cbfea', '#6a9fe0', '#4f8cdb', '#3373cc'], e: [0, 3, 8, 16, 40] }, sat: 1.05, cloud: { lit: '#fbf8f1', mid: '#e1e5f3', shade: '#c3cbe9' },
    water: { a: '#22a7b6', b: '#167fb2', c: '#1a5596' } },
};
const lerpA = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
const lerpHex = (a, b, t) => '#' + new THREE.Color(a).lerp(new THREE.Color(b), t).getHexString();
export function mixLight(a, b, t) {
  const r = {};
  for (const k in a) {
    const va = a[k], vb = b[k];
    if (Array.isArray(va)) r[k] = lerpA(va, vb, t);
    else if (typeof va === 'number') r[k] = va + ((vb ?? va) - va) * t;
    else if (typeof va === 'string' && vb && va[0] === '#') r[k] = lerpHex(va, vb, t);
    else if (va && typeof va === 'object' && Array.isArray(va.c)) r[k] = { c: va.c.map((c, i) => lerpHex(c, vb.c[i], t)), e: va.e };
    else if (va && typeof va === 'object') { r[k] = {}; for (const q in va) r[k][q] = lerpHex(va[q], vb[q], t); }
    else r[k] = t < 0.5 ? va : vb;
  }
  for (const k in b) if (!(k in r)) r[k] = t < 0.5 ? undefined : b[k];
  return r;
}

// ---------------- two-tone world shading (shade.ts) ----------------
export const TONE = {
  uLitCol: { value: new THREE.Vector3(1.5, 1.44, 1.32) }, uShadeCol: { value: new THREE.Vector3(0.6, 0.58, 0.86) },
  uShadeLift: { value: new THREE.Vector3() }, uLambert: { value: 0.35 }, uSideK: { value: 0.84 }, uTerm: { value: 0.2 },
  uBounce: { value: new THREE.Vector3() }, uSat: { value: 1 },
};
const LFB = THREE.ShaderChunk.lights_fragment_begin
  .replace('directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ]',
    'sunVis = ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ]')
  .replace('vDirectionalShadowCoord[ i ] ) : 1.0;', 'vDirectionalShadowCoord[ i ] ) : 1.0;\n\t\tdirectLight.color *= sunVis;');
if (!LFB.includes('directLight.color *= sunVis')) throw new Error('lights_fragment_begin changed');
const TWO_TONE = `
#if NUM_DIR_LIGHTS > 0
{
  vec3 sunV = directionalLights[ 0 ].direction;
  vec3 upV = normalize( ( viewMatrix * vec4( 0.0, 1.0, 0.0, 0.0 ) ).xyz );
  float ndl = max( dot( geometryNormal, sunV ), 0.0 );
  float sunTerm = sunVis * smoothstep( 0.0, uTerm, ndl );
  float skyK = mix( uSideK, 1.0, 0.5 + 0.5 * dot( geometryNormal, upV ) );
  vec3 lit = uLitCol * mix( 1.0, ndl, uLambert );
  float facing = max( dot( geometryNormal, geometryViewDir ), 0.0 );
  vec3 alb = max( mix( vec3( dot( diffuseColor.rgb, vec3( 0.2126, 0.7152, 0.0722 ) ) ), diffuseColor.rgb, uSat ), 0.0 );
  reflectedLight.directDiffuse = alb * ( mix( uShadeCol, lit, sunTerm ) * skyK + uBounce * facing * clamp( 1.0 - dot( geometryNormal, upV ), 0.0, 1.0 ) * ( 1.0 - sunTerm ) )
    + uShadeLift * ( 1.0 - sunTerm );
  reflectedLight.indirectDiffuse = vec3( 0.0 );
}
#endif
`;
const DECL = '#include <common>\nuniform vec3 uLitCol; uniform vec3 uShadeCol; uniform vec3 uShadeLift; uniform float uLambert; uniform float uSideK; uniform float uTerm; uniform vec3 uBounce; uniform float uSat;';
export function twoTone(m) {
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, TONE);
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', DECL)
      .replace('#include <lights_fragment_begin>', 'float sunVis = 1.0;\n' + LFB)
      .replace('#include <lights_fragment_end>', '#include <lights_fragment_end>\n' + TWO_TONE);
  };
  m.customProgramCacheKey = () => 'twoTone6';
  return m;
}
const _mats = new Map();
/** world material: two-tone lambert, colour (sRGB hex) and optional painted map */
export function lam(col = '#ffffff', map = null, o = {}) {
  const key = col + (map ? map.uuid : '') + JSON.stringify(o);
  if (_mats.has(key)) return _mats.get(key);
  const m = twoTone(new THREE.MeshLambertMaterial({ color: new THREE.Color(col), map, side: o.side ?? THREE.FrontSide, ...(o.extra || {}) }));
  _mats.set(key, m); return m;
}
/** unlit (signs, painted text, emissive) */
export function unlit(col = '#ffffff', map = null, o = {}) {
  return new THREE.MeshBasicMaterial({ color: new THREE.Color(col), map, side: o.side ?? THREE.FrontSide, fog: o.fog ?? true, transparent: !!o.transparent, alphaTest: o.alphaTest ?? 0, depthWrite: o.depthWrite ?? true, opacity: o.opacity ?? 1 });
}

// ---------------- sun, fog, sky ----------------
export const sun = new THREE.DirectionalLight(0xffffff, 1);
sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
const sc = sun.shadow.camera; sc.left = -22; sc.right = 22; sc.top = 22; sc.bottom = -22; sc.near = 1; sc.far = 300;
sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02;
scene.add(sun, sun.target);
scene.fog = new THREE.Fog(0xb8d0ec, 30, 420);

const skyMat = new THREE.ShaderMaterial({
  uniforms: { c0: { value: new THREE.Color() }, c1: { value: new THREE.Color() }, c2: { value: new THREE.Color() }, c3: { value: new THREE.Color() }, c4: { value: new THREE.Color() },
    e: { value: new THREE.Vector4(3, 8, 16, 40) }, sunDir: { value: new THREE.Vector3(0, 0.1, -1) }, sunCol: { value: new THREE.Color() }, sunOn: { value: 0 },
    moonDir: { value: new THREE.Vector3(0, 0.4, -1) }, moonOn: { value: 0 }, stars: { value: 0 } },
  vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position); vec4 p = modelViewMatrix*vec4(position,1.0); gl_Position = projectionMatrix*p; gl_Position.z = gl_Position.w*0.99999; }`,
  fragmentShader: `uniform vec3 c0,c1,c2,c3,c4; uniform vec4 e; uniform vec3 sunDir, sunCol, moonDir; uniform float sunOn, moonOn, stars; varying vec3 vDir;
  float h(vec3 p){ return fract(sin(dot(p, vec3(12.9898,78.233,45.164)))*43758.5453); }
  void main(){ vec3 d = normalize(vDir); float el = degrees(asin(clamp(d.y,-1.0,1.0)));
    vec3 c = c0;
    c = mix(c, c1, smoothstep(0.0, e.x, el)); c = mix(c, c2, smoothstep(e.x, e.y, el)); c = mix(c, c3, smoothstep(e.y, e.z, el)); c = mix(c, c4, smoothstep(e.z, e.w, el));
    if (el < 0.0) c = c0;
    if (sunOn > 0.5) { float a = dot(d, normalize(sunDir)); c = mix(c, sunCol, smoothstep(0.9993, 0.9996, a)); c += sunCol * 0.35 * pow(max(a,0.0), 60.0); }
    if (moonOn > 0.5) { float a = dot(d, normalize(moonDir)); c = mix(c, vec3(0.98,0.95,0.84), smoothstep(0.99955, 0.9998, a)); c += vec3(0.25,0.25,0.3)*pow(max(a,0.0), 400.0); }
    if (stars > 0.0 && el > 5.0) { vec3 q = floor(d*420.0); float s = step(0.9965, h(q)); c += vec3(1.0,0.97,0.9) * s * stars * 0.8; }
    gl_FragColor = vec4(c, 1.0); }`,
  side: THREE.BackSide, depthWrite: false, fog: false,
});
export const sky = new THREE.Mesh(new THREE.SphereGeometry(1500, 48, 24), skyMat);
sky.layers.set(NOINK); sky.renderOrder = -10; sky.frustumCulled = false; scene.add(sky);

let CUR = LIGHTS.day;
export const curLight = () => CUR;
/** apply a light preset; sun is camera-relative (az from the camera forward axis), focus = shadow centre */
export function applyLight(L, focus, fwd, opts = {}) {
  CUR = L;
  TONE.uLitCol.value.set(...L.lit); TONE.uShadeCol.value.set(...L.shade); TONE.uShadeLift.value.set(...L.lift);
  TONE.uLambert.value = L.lambert; TONE.uSideK.value = L.sideK; TONE.uTerm.value = L.term; TONE.uSat.value = L.sat;
  scene.fog.color.set(L.fog); scene.fog.near = opts.fogNear ?? L.fogNear; scene.fog.far = opts.fogFar ?? L.fogFar;
  const u = skyMat.uniforms; L.sky.c.forEach((c, i) => u['c' + i].value.set(c)); u.e.value.set(...L.sky.e.slice(1));
  // sun direction: rotate the camera forward (flattened) by az, raise by el
  const f = new THREE.Vector3(fwd.x, 0, fwd.z).normalize();
  const az = THREE.MathUtils.degToRad(L.az + (opts.azAdd || 0)), el = THREE.MathUtils.degToRad(L.el);
  const right = new THREE.Vector3(-f.z, 0, f.x);
  const d = f.clone().multiplyScalar(Math.cos(az)).add(right.multiplyScalar(Math.sin(az))).multiplyScalar(Math.cos(el)).setY(Math.sin(el)).normalize();
  sun.position.copy(focus).addScaledVector(d, 120); sun.target.position.copy(focus);
  const ss = opts.shadowSize ?? 22; sc.left = -ss; sc.right = ss; sc.top = ss; sc.bottom = -ss; sc.updateProjectionMatrix();
  u.sunDir.value.copy(d); u.sunOn.value = L.sunDisc ? 1 : 0; if (L.sunDisc) u.sunCol.value.set(L.sunDisc);
  u.moonOn.value = L.moon ? 1 : 0; u.stars.value = L.stars || 0;
  const md = f.clone().multiplyScalar(0.9).add(new THREE.Vector3(-f.z, 0, f.x).multiplyScalar(-0.35)).setY(0.42).normalize(); u.moonDir.value.copy(md);
}

// ---------------- render targets & post ----------------
function rt(o = {}) {
  const t = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, samples: o.samples || 0, ...(o.extra || {}) });
  if (o.depth) { t.depthTexture = new THREE.DepthTexture(W, H); t.depthTexture.type = THREE.FloatType; }
  return t;
}
const rtMain = rt({ depth: true, samples: 4 });
const rtN = rt({ depth: true, extra: { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter } });
const rtMask = rt();
const rtA = rt(), rtB = rt();

const FS_VERT = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }';
const quadScene = new THREE.Scene(), quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), null); quad.frustumCulled = false; quadScene.add(quad);
function pass(mat, target) { quad.material = mat; renderer.setRenderTarget(target); renderer.render(quadScene, quadCam); }

const normalMat = new THREE.ShaderMaterial({
  vertexShader: `#include <common>
  varying vec3 vN; varying vec3 vV;
  void main(){
    #include <beginnormal_vertex>
    #include <defaultnormal_vertex>
    vN = transformedNormal;
    #include <begin_vertex>
    #include <project_vertex>
    vV = mvPosition.xyz; }`,
  fragmentShader: `varying vec3 vN; varying vec3 vV;
  void main(){ vec3 n; if (dot(vN,vN) < 1e-8) n = normalize(cross(dFdx(vV), dFdy(vV))); else n = normalize(vN) * (gl_FrontFacing ? 1.0 : -1.0);
    gl_FragColor = vec4(n, 1.0); }`,
  side: THREE.DoubleSide,
});

const maskMat = new THREE.ShaderMaterial({
  uniforms: { tNormal: { value: rtN.texture }, tDepth: { value: rtN.depthTexture }, tMainDepth: { value: rtMain.depthTexture },
    texel: { value: new THREE.Vector2(1 / W, 1 / H) }, cNear: { value: 0.1 }, cFar: { value: 2000 }, p00: { value: 1 }, p11: { value: 1 },
    wNear: { value: 5.1 }, wFar: { value: 3.3 }, dNear: { value: 6 }, dFar: { value: 90 }, creaseScale: { value: 0.8 },
    depthLo: { value: 0.01 }, depthHi: { value: 0.03 }, cosLo: { value: Math.cos(35 * Math.PI / 180) }, cosHi: { value: Math.cos(50 * Math.PI / 180) },
    concaveGain: { value: 0.7 }, farOpacity: { value: 0.95 }, fadeNear: { value: 150 }, fadeFar: { value: 450 }, strength: { value: 1 },
    fogRange: { value: new THREE.Vector2(30, 420) }, fogStart: { value: 40 } },
  vertexShader: FS_VERT,
  fragmentShader: `#include <packing>
uniform sampler2D tNormal; uniform sampler2D tDepth; uniform sampler2D tMainDepth; uniform vec2 texel;
uniform float cNear, cFar, p00, p11, wNear, wFar, dNear, dFar, creaseScale, depthLo, depthHi, cosLo, cosHi, concaveGain, farOpacity, fadeNear, fadeFar, strength;
uniform vec2 fogRange; uniform float fogStart; varying vec2 vUv;
const vec2 STEP[4] = vec2[4](vec2(1.0, 0.0), vec2(0.0, 1.0), vec2(1.0, 1.0), vec2(1.0, -1.0));
const float SLEN[4] = float[4](1.0, 1.0, 1.41421, 1.41421);
#define RMAX 6
float dist(sampler2D t, vec2 uv) { return -perspectiveDepthToViewZ(textureLod(t, uv, 0.0).x, cNear, cFar); }
vec3 viewPos(vec2 uv, float d) { vec2 n = uv * 2.0 - 1.0; return vec3(n.x * d / p00, n.y * d / p11, -d); }
float crease(vec3 n0, vec3 P0, float zc, vec2 uq, float zq) {
  vec4 nq = textureLod(tNormal, uq, 0.0);
  if (nq.a < 0.5 || abs(zq - zc) > zc * depthLo) return 0.0;
  float k = 1.0 - smoothstep(cosHi, cosLo, dot(n0, nq.xyz));
  if (dot(viewPos(uq, zq) - P0, n0) > 0.0) k *= concaveGain;
  return k; }
void main() {
  vec4 nc = textureLod(tNormal, vUv, 0.0);
  if (nc.a < 0.5) { gl_FragColor = vec4(0.0); return; }
  float zc = dist(tDepth, vUv);
  float zm = dist(tMainDepth, vUv);
  zm = min(zm, dist(tMainDepth, vUv + vec2(texel.x, 0.0))); zm = min(zm, dist(tMainDepth, vUv - vec2(texel.x, 0.0)));
  zm = min(zm, dist(tMainDepth, vUv + vec2(0.0, texel.y))); zm = min(zm, dist(tMainDepth, vUv - vec2(0.0, texel.y)));
  if (zm < zc * 0.985 - 0.03) { gl_FragColor = vec4(0.0); return; }
  float t = clamp(log(zc / dNear) / log(dFar / dNear), 0.0, 1.0);
  float w = mix(wNear, wFar, t);
  float hc = 0.5 * w * creaseScale;
  float Wc = 1.0 / zc; vec3 n0 = nc.xyz; vec3 P0 = viewPos(vUv, zc);
  float eD = 0.0, eN = 0.0;
  for (int a = 0; a < 4; a++) {
    for (int r = 1; r <= RMAX; r++) {
      vec2 o = STEP[a] * texel * float(r);
      float d = (float(r) - 0.5) * SLEN[a];
      float cw = clamp(w + 0.5 - d, 0.0, 1.0); float ch = clamp(hc + 0.5 - d, 0.0, 1.0);
      if (cw <= 0.0 && ch <= 0.0) break;
      float z1 = dist(tDepth, vUv - o), z2 = dist(tDepth, vUv + o);
      float s = (1.0 / z1 + 1.0 / z2 - 2.0 * Wc) / Wc;
      eD = max(eD, smoothstep(depthLo, depthHi, -s) * cw);
      if (ch > 0.0) eN = max(eN, max(crease(n0, P0, zc, vUv - o, z1), crease(n0, P0, zc, vUv + o, z2)) * ch);
    } }
  float ink = max(eD, eN) * strength * mix(1.0, farOpacity, t) * (1.0 - smoothstep(fadeNear, fadeFar, zc));
  float f0 = max(fogRange.x, fogStart);
  float fogK = fogRange.y > f0 ? clamp((zc - f0) / (fogRange.y - f0), 0.0, 1.0) : 0.0;
  gl_FragColor = vec4(ink, fogK, 0.0, 1.0); }`,
});

const compMat = new THREE.ShaderMaterial({
  uniforms: { inputBuffer: { value: rtMain.texture }, tMask: { value: rtMask.texture }, texel: { value: new THREE.Vector2(1 / W, 1 / H) },
    inkColor: { value: new THREE.Color('#030303') }, fogColor: { value: new THREE.Color() }, fogInk: { value: 0.3 } },
  vertexShader: FS_VERT,
  fragmentShader: `uniform sampler2D inputBuffer; uniform sampler2D tMask; uniform vec2 texel; uniform vec3 inkColor; uniform vec3 fogColor; uniform float fogInk; varying vec2 vUv;
  float m(float x, float y) { return texture2D(tMask, vUv + vec2(x, y) * texel).r; }
  void main(){
    float a = (4.0 * m(0.0, 0.0) + 2.0 * (m(1.0, 0.0) + m(-1.0, 0.0) + m(0.0, 1.0) + m(0.0, -1.0)) + m(1.0, 1.0) + m(-1.0, 1.0) + m(1.0, -1.0) + m(-1.0, -1.0)) / 16.0;
    vec4 c = texture2D(inputBuffer, vUv);
    float fk = texture2D(tMask, vUv).g;
    vec3 inkC = mix(inkColor, fogColor, fk * fogInk);
    vec3 g = pow(max(c.rgb, 0.0), vec3(1.0 / 2.2));
    gl_FragColor = vec4(pow(mix(g, pow(inkC, vec3(1.0 / 2.2)), a), vec3(2.2)), 1.0); }`,
});

const dofMat = new THREE.ShaderMaterial({
  uniforms: { inputBuffer: { value: null }, tDepth: { value: rtMain.depthTexture }, texelSize: { value: new THREE.Vector2(1 / W, 1 / H) },
    cNear: { value: 0.1 }, cFar: { value: 2000 }, focus: { value: 5 }, cInf: { value: 0 }, nearScale: { value: 1.2 }, maxCoC: { value: 22 }, spread: { value: 0.958 }, rot: { value: 0 } },
  defines: { TAPS: 40 },
  vertexShader: FS_VERT,
  fragmentShader: `#include <packing>
uniform sampler2D inputBuffer; uniform sampler2D tDepth; uniform vec2 texelSize; uniform float cNear, cFar, focus, cInf, nearScale, maxCoC, spread, rot; varying vec2 vUv;
#define GOLDEN 2.39996323
float distAt(vec2 uv) { return -perspectiveDepthToViewZ(textureLod(tDepth, uv, 0.0).x, cNear, cFar); }
float cocAt(float d) { float c = cInf * (1.0 - focus / max(d, 1e-3)); if (c < 0.0) c *= nearScale; return clamp(c, -maxCoC, maxCoC); }
void main(){
  vec4 inC = texture2D(inputBuffer, vUv);
  if (cInf < 0.25) { gl_FragColor = inC; return; }
  float d0 = distAt(vUv); float r0 = abs(cocAt(d0)); float R = r0 * spread;
  vec3 acc = inC.rgb; float wsum = 1.0;
  if (R > 0.5) {
    for (int i = 0; i < TAPS; i++) {
      float rr = sqrt((float(i) + 0.5) / float(TAPS)) * R; float a = float(i) * GOLDEN + rot;
      vec2 suv = vUv + vec2(cos(a), sin(a)) * rr * texelSize;
      float ds = distAt(suv); float rs = abs(cocAt(ds)) * spread;
      if (ds > d0) rs = min(rs, R);
      float w = clamp(rs - rr + 0.5, 0.0, 1.0);
      acc += textureLod(inputBuffer, suv, 0.0).rgb * w; wsum += w; } }
  gl_FragColor = vec4(acc / wsum, 1.0); }`,
});

const gradeMat = new THREE.ShaderMaterial({
  uniforms: { inputBuffer: { value: null }, flash: { value: 0 }, sat: { value: 1.06 }, vig: { value: 0.22 }, lift: { value: new THREE.Vector3(0, 0, 0) }, gain: { value: new THREE.Vector3(1, 1, 1) }, fade: { value: 0 } },
  vertexShader: FS_VERT,
  fragmentShader: `uniform sampler2D inputBuffer; uniform float flash, sat, vig, fade; uniform vec3 lift, gain; varying vec2 vUv;
  vec3 neutral(vec3 color) { const float startCompression = 0.8 - 0.04; const float desaturation = 0.15;
    float x = min(color.r, min(color.g, color.b)); float offset = x < 0.08 ? x - 6.25 * x * x : 0.04; color -= offset;
    float peak = max(color.r, max(color.g, color.b)); if (peak < startCompression) return color;
    float d = 1.0 - startCompression; float newPeak = 1.0 - d * d / (peak + d - startCompression); color *= newPeak / peak;
    float g = 1.0 - 1.0 / (desaturation * (peak - newPeak) + 1.0); return mix(color, vec3(newPeak), g); }
  vec3 toSRGB(vec3 c){ c = clamp(c, 0.0, 1.0); return mix(c * 12.92, 1.055 * pow(c, vec3(1.0/2.4)) - 0.055, step(0.0031308, c)); }
  void main(){ vec3 c = texture2D(inputBuffer, vUv).rgb;
    c = neutral(c);
    float l = dot(c, vec3(0.2126, 0.7152, 0.0722)); c = max(mix(vec3(l), c, sat), 0.0);
    c = c * gain + lift * (1.0 - c);
    vec3 s = toSRGB(c);
    vec2 q = vUv - 0.5; q.x *= 0.5625; float v = smoothstep(0.75, 0.25, length(q) * 1.25); s *= mix(1.0 - vig, 1.0, v);
    s = mix(s, vec3(1.0), clamp(flash, 0.0, 1.0)); s = mix(s, vec3(0.0), clamp(fade, 0.0, 1.0));
    gl_FragColor = vec4(s, 1.0); }`,
});

export const POST = { cInf: 0, focus: 5, flash: 0, sat: 1.06, vig: 0.22, fade: 0, ink: 1, gain: [1, 1, 1], lift: [0, 0, 0] };

/** full frame: main colour, world normals, ink mask, ink composite, lens blur, grade -> canvas */
export function renderFrame() {
  camera.updateMatrixWorld(); camera.updateProjectionMatrix(); sky.position.copy(camera.position); sky.updateMatrixWorld();
  // 1. main colour (world + cards)
  renderer.shadowMap.needsUpdate = true;
  camera.layers.set(0); camera.layers.enable(NOINK);
  renderer.setRenderTarget(rtMain); renderer.setClearColor(0x000000, 1); renderer.clear(); renderer.render(scene, camera);
  // 2. world normals (layer 0 only)
  camera.layers.set(0);
  const fog = scene.fog; scene.fog = null; scene.overrideMaterial = normalMat;
  renderer.setRenderTarget(rtN); renderer.setClearColor(0x000000, 0); renderer.clear(); renderer.render(scene, camera);
  scene.overrideMaterial = null; scene.fog = fog; camera.layers.enable(NOINK);
  // 3. ink mask
  const u = maskMat.uniforms; u.cNear.value = camera.near; u.cFar.value = camera.far;
  u.p00.value = camera.projectionMatrix.elements[0]; u.p11.value = camera.projectionMatrix.elements[5];
  u.fogRange.value.set(fog.near, fog.far); u.strength.value = POST.ink;
  pass(maskMat, rtMask);
  // 4. ink composite
  compMat.uniforms.fogColor.value.copy(fog.color);
  pass(compMat, rtA);
  // 5. lens blur
  let src = rtA;
  if (POST.cInf > 0.25) {
    const d = dofMat.uniforms; d.cNear.value = camera.near; d.cFar.value = camera.far; d.focus.value = POST.focus;
    // pre-pass (small spread) then main pass: smooth disc
    d.inputBuffer.value = rtA.texture; d.cInf.value = POST.cInf; d.spread.value = 0.29; d.rot.value = 0.61; pass(dofMat, rtB);
    d.inputBuffer.value = rtB.texture; d.spread.value = 0.958; d.rot.value = 0.0; pass(dofMat, rtA);
    src = rtA;
  }
  // 6. grade to screen
  const g = gradeMat.uniforms; g.inputBuffer.value = src.texture; g.flash.value = POST.flash; g.sat.value = POST.sat; g.vig.value = POST.vig; g.fade.value = POST.fade;
  g.gain.value.set(...POST.gain); g.lift.value.set(...POST.lift);
  pass(gradeMat, null);
}
