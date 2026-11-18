/**
 * Núcleo do cenário pré-renderizado: hash determinístico, ruído periódico, câmeras,
 * lote de geometrias (mescla por material) e materiais com cor por vértice.
 * Roda apenas no Chromium headless do build (tools/).
 */
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { mat, setRim, type MatKind, type MatOpts } from '../../render/materials';

export { THREE };
export const TAU = Math.PI * 2;
export type V3 = [number, number, number];

/* ---------------- números determinísticos (nada de aleatoriedade) ---------------- */

/** Hash determinístico em [0,1) a partir de inteiros/reais (seno com constantes fixas). */
export function hash(a: number, b = 0, c = 0) {
  const s = Math.sin(a * 127.1 + b * 311.7 + c * 74.7) * 43758.5453123;
  return s - Math.floor(s);
}
/** Hash em [lo,hi). */
export function hr(lo: number, hi: number, a: number, b = 0, c = 0) {
  return lo + (hi - lo) * hash(a, b, c);
}
export const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export function smooth(e0: number, e1: number, x: number) {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
}

/**
 * Ruído periódico (período 1 em x e y) por soma de senos com frequências inteiras.
 * Garante que a borda direita de um tile encaixa na esquerda de qualquer outro.
 */
const PN_TERMS: [number, number, number, number, number][] = [
  // fx, fy, fz, peso, fase
  [1, 1, 0.7, 0.34, 0.3],
  [2, -1, 1.3, 0.26, 1.7],
  [1, 3, 2.1, 0.2, 4.1],
  [3, 2, 1.7, 0.16, 2.5],
  [4, -3, 2.9, 0.11, 5.3],
  [5, 4, 3.3, 0.08, 0.9],
  [7, -5, 4.1, 0.06, 3.7],
  [6, 7, 5.3, 0.045, 1.1],
  [9, -8, 6.1, 0.035, 2.2],
];
export function pnoise(x: number, y: number, z = 0, seed = 0, octMin = 0, octMax = PN_TERMS.length) {
  let s = 0;
  for (let i = octMin; i < octMax; i++) {
    const [fx, fy, fz, w, ph] = PN_TERMS[i];
    s += w * Math.sin(TAU * (fx * x + fy * y) + fz * z * TAU * 0.5 + ph + seed * (1.3 + i * 0.7));
  }
  return s;
}
/** Ruído 1D periódico (período 1). */
export function pnoise1(x: number, seed = 0) {
  return 0.5 * Math.sin(TAU * x + seed) + 0.3 * Math.sin(TAU * 2 * x + seed * 1.7 + 1.1) + 0.2 * Math.sin(TAU * 5 * x + seed * 2.3 + 2.7);
}
/** Ruído suave não periódico (cenários grandes), soma de senos. */
export function vnoise(x: number, y: number, seed = 0) {
  return (
    0.5 * Math.sin(x * 1.13 + seed * 1.7 + Math.sin(y * 0.71 + seed)) +
    0.3 * Math.sin(y * 1.37 - x * 0.53 + seed * 2.3) +
    0.2 * Math.sin(x * 2.71 + y * 2.13 + seed * 0.7) +
    0.12 * Math.sin(x * 5.3 - y * 4.1 + seed * 3.1)
  );
}

/* ---------------- cores ---------------- */
export const col = (hex: number) => new THREE.Color(hex);
export function mix(a: number, b: number, t: number) {
  return new THREE.Color(a).lerp(new THREE.Color(b), clamp(t, 0, 1));
}

/* ---------------- materiais ---------------- */

/** Material do pipeline (rim fresnel) com cor por vértice. Instância própria (chave distinta no cache). */
export function vmat(kind: MatKind, color = 0xffffff, o: MatOpts & { side?: THREE.Side; tag?: string } = {}) {
  const { side, ...rest } = o;
  const opts = { ...rest, vc: 'v' + (side ?? 0) } as MatOpts;
  const m = mat(kind, color, opts);
  if (!m.vertexColors) {
    m.vertexColors = true;
    if (side !== undefined) m.side = side;
    m.needsUpdate = true;
  }
  return m;
}
/** Material simples sem iluminação (céu, raios de luz, brilhos). */
export function basic(color: number, o: { opacity?: number; additive?: boolean; map?: THREE.Texture | null; vc?: boolean; fog?: boolean; side?: THREE.Side } = {}) {
  return new THREE.MeshBasicMaterial({
    color,
    transparent: o.opacity !== undefined || !!o.additive || !!o.map,
    opacity: o.opacity ?? 1,
    blending: o.additive ? THREE.AdditiveBlending : THREE.NormalBlending,
    depthWrite: !(o.additive || (o.opacity !== undefined && o.opacity < 1)),
    map: o.map ?? null,
    vertexColors: !!o.vc,
    fog: o.fog ?? true,
    side: o.side ?? THREE.FrontSide,
  });
}

/* ---------------- texturas de gradiente (desenhadas em canvas) ---------------- */
const gradCache = new Map<string, THREE.Texture>();
/** Textura radial suave (brilhos, halos). */
export function radialTex(inner = 'rgba(255,255,255,1)', outer = 'rgba(255,255,255,0)') {
  const k = 'r' + inner + outer;
  const hit = gradCache.get(k);
  if (hit) return hit;
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const x = c.getContext('2d')!;
  const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, inner);
  g.addColorStop(1, outer);
  x.fillStyle = g;
  x.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  gradCache.set(k, t);
  return t;
}
/** Textura de feixe de luz (vertical, some nas pontas e nas laterais). */
export function beamTex() {
  const k = 'beam';
  const hit = gradCache.get(k);
  if (hit) return hit;
  const c = document.createElement('canvas');
  c.width = 64; c.height = 256;
  const x = c.getContext('2d')!;
  const img = x.createImageData(64, 256);
  for (let j = 0; j < 256; j++) for (let i = 0; i < 64; i++) {
    const u = (i / 63) * 2 - 1, v = j / 255;
    const a = (1 - u * u) ** 2 * Math.sin(Math.PI * Math.min(1, v * 1.1)) ** 0.8 * (1 - v * 0.6);
    const o = (j * 64 + i) * 4;
    img.data[o] = img.data[o + 1] = img.data[o + 2] = 255;
    img.data[o + 3] = Math.round(clamp(a, 0, 1) * 255);
  }
  x.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  gradCache.set(k, t);
  return t;
}

/* ---------------- lote: mescla geometrias por material ---------------- */

/** Garante atributos position/normal/uv/color para mesclar. */
export function prep(g: THREE.BufferGeometry, tint?: THREE.Color | number) {
  let geo = g.index ? g.toNonIndexed() : g;
  if (!geo.getAttribute('normal')) geo.computeVertexNormals();
  const n = geo.getAttribute('position').count;
  if (!geo.getAttribute('uv')) geo.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(n * 2), 2));
  for (const k of Object.keys(geo.attributes)) if (!['position', 'normal', 'uv', 'color'].includes(k)) geo.deleteAttribute(k);
  if (!geo.getAttribute('color') || tint !== undefined) {
    const c = new THREE.Color(tint ?? 0xffffff);
    const arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { arr[i * 3] = c.r; arr[i * 3 + 1] = c.g; arr[i * 3 + 2] = c.b; }
    geo.setAttribute('color', new THREE.BufferAttribute(arr, 3));
  }
  geo.morphAttributes = {};
  geo.clearGroups();
  return geo;
}

export class Batch {
  private parts = new Map<THREE.Material, THREE.BufferGeometry[]>();
  /** Adiciona geometria já posicionada (aplica a matriz se fornecida). */
  add(g: THREE.BufferGeometry, m: THREE.Material, mtx?: THREE.Matrix4, tint?: THREE.Color | number) {
    const geo = prep(g.clone(), tint);
    if (mtx) geo.applyMatrix4(mtx);
    let arr = this.parts.get(m);
    if (!arr) this.parts.set(m, (arr = []));
    arr.push(geo);
    return this;
  }
  /** Adiciona uma malha (com a matriz do mundo relativa ao pai já atualizada). */
  addMesh(o: THREE.Object3D, tint?: THREE.Color | number) {
    o.updateMatrixWorld(true);
    o.traverse((c) => {
      const me = c as THREE.Mesh;
      if (me.isMesh) this.add(me.geometry, me.material as THREE.Material, me.matrixWorld, tint);
    });
    return this;
  }
  build(o: { cast?: boolean; receive?: boolean } = {}) {
    const g = new THREE.Group();
    for (const [m, arr] of this.parts) {
      if (!arr.length) continue;
      const merged = mergeGeometries(arr, false);
      if (!merged) continue;
      const mesh = new THREE.Mesh(merged, m);
      mesh.castShadow = o.cast ?? true;
      mesh.receiveShadow = o.receive ?? true;
      g.add(mesh);
    }
    return g;
  }
}

/** Matriz de posição/rotação(graus)/escala. */
export function M(pos: V3 = [0, 0, 0], rot: V3 = [0, 0, 0], s: V3 | number = 1) {
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(rot[0] * Math.PI / 180, rot[1] * Math.PI / 180, rot[2] * Math.PI / 180));
  const sc = typeof s === 'number' ? new THREE.Vector3(s, s, s) : new THREE.Vector3(...s);
  return new THREE.Matrix4().compose(new THREE.Vector3(...pos), q, sc);
}

/* ---------------- câmeras ---------------- */

/**
 * Câmera ortográfica oblíqua dos tiles: a face frontal (plano z) cai exatamente na grade
 * (1 unidade = 64 px) e o que está atrás (z negativo) sobe na tela `k` por unidade — mostra
 * a face superior sem distorcer a largura nem a altura do tile.
 */
export function obliqueCamera(halfW: number, halfH: number, k: number, cx = 0, cy = 0) {
  const D = 30;
  const cam = new THREE.OrthographicCamera(cx - halfW, cx + halfW, cy + halfH, cy - halfH, 0.1, 80);
  cam.position.set(0, 0, D);
  cam.lookAt(0, 0, 0);
  cam.updateMatrixWorld();
  // y_tela = y - k·z_mundo = y_v - k·(z_v + D)
  const shear = new THREE.Matrix4().set(1, 0, 0, 0, 0, 1, -k, -k * D, 0, 0, 1, 0, 0, 0, 0, 1);
  cam.projectionMatrix.multiply(shear);
  cam.projectionMatrixInverse.copy(cam.projectionMatrix).invert();
  return cam;
}

/** Câmera ortográfica com inclinação (graus, negativo = olhando para baixo) centrada em `target`. */
export function orthoCamera(w: number, h: number, target: V3, pitchDeg = -6, yawDeg = 0, dist = 60) {
  const cam = new THREE.OrthographicCamera(-w / 2, w / 2, h / 2, -h / 2, 0.1, dist * 2.5);
  const p = pitchDeg * Math.PI / 180, y = yawDeg * Math.PI / 180;
  cam.position.set(target[0] + Math.sin(y) * Math.cos(p) * dist, target[1] - Math.sin(p) * dist, target[2] + Math.cos(y) * Math.cos(p) * dist);
  cam.lookAt(...target);
  cam.updateMatrixWorld();
  cam.updateProjectionMatrix();
  return cam;
}

/* ---------------- luzes ---------------- */
export interface LightTune {
  key?: { pos?: V3; color?: number; i?: number; shadow?: number; size?: number; radius?: number; target?: V3 };
  fill?: { pos?: V3; color?: number; i?: number };
  rim?: { pos?: V3; color?: number; i?: number };
  hemi?: { sky?: number; ground?: number; i?: number };
  /** contorno fresnel global (cor e força) */
  fres?: { color: number; strength: number };
  extra?: THREE.Light[];
}
/** Ajusta o rig de luz do preset (aplicado antes do build) para a cena. */
export function tuneLights(scene: THREE.Scene, t: LightTune) {
  const dirs = scene.children.filter((o) => (o as THREE.DirectionalLight).isDirectionalLight) as THREE.DirectionalLight[];
  const hemi = scene.children.find((o) => (o as THREE.HemisphereLight).isHemisphereLight) as THREE.HemisphereLight | undefined;
  const [key, fill, rim] = dirs;
  const target = t.key?.target ?? [0, 0, 0];
  if (key && t.key) {
    if (t.key.pos) key.position.set(t.key.pos[0] + target[0], t.key.pos[1] + target[1], t.key.pos[2] + target[2]);
    if (t.key.color !== undefined) key.color.set(t.key.color);
    if (t.key.i !== undefined) key.intensity = t.key.i;
    key.target.position.set(...target);
    scene.add(key.target);
    if (t.key.size) {
      const sc = key.shadow.camera as THREE.OrthographicCamera;
      sc.left = -t.key.size; sc.right = t.key.size; sc.top = t.key.size; sc.bottom = -t.key.size;
      sc.far = t.key.size * 6 + 40;
      sc.updateProjectionMatrix();
    }
    if (t.key.shadow) key.shadow.mapSize.set(t.key.shadow, t.key.shadow);
    if (t.key.radius !== undefined) key.shadow.radius = t.key.radius;
  }
  if (fill && t.fill) {
    if (t.fill.pos) fill.position.set(...t.fill.pos);
    if (t.fill.color !== undefined) fill.color.set(t.fill.color);
    if (t.fill.i !== undefined) fill.intensity = t.fill.i;
  }
  if (rim && t.rim) {
    if (t.rim.pos) rim.position.set(...t.rim.pos);
    if (t.rim.color !== undefined) rim.color.set(t.rim.color);
    if (t.rim.i !== undefined) rim.intensity = t.rim.i;
  }
  if (hemi && t.hemi) {
    if (t.hemi.sky !== undefined) hemi.color.set(t.hemi.sky);
    if (t.hemi.ground !== undefined) hemi.groundColor.set(t.hemi.ground);
    if (t.hemi.i !== undefined) hemi.intensity = t.hemi.i;
  }
  if (t.fres) setRim(t.fres.color, t.fres.strength);
  for (const l of t.extra ?? []) { l.userData.lightRig = true; scene.add(l); }
}

/* ---------------- ruído de gradiente periódico (Perlin com período inteiro em x,y) ---------------- */
function gradDot(ix: number, iy: number, iz: number, P: number, seed: number, dx: number, dy: number, dz: number) {
  const wx = ((ix % P) + P) % P, wy = ((iy % P) + P) % P;
  const a = hash(wx + seed * 13.1, wy - seed * 7.3, iz + seed) * TAU;
  const b = hash(wy + 3.7, wx + seed * 1.9, iz * 1.3 + 11) * 2 - 1;
  const s = Math.sqrt(1 - b * b);
  return Math.cos(a) * s * dx + Math.sin(a) * s * dy + b * dz;
}
const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
/** Perlin 3D com período P (células por unidade) em x e y: periódico com período 1. */
export function pperlin(x: number, y: number, z: number, P: number, seed = 0) {
  const X = x * P, Y = y * P, Z = z * P;
  const ix = Math.floor(X), iy = Math.floor(Y), iz = Math.floor(Z);
  const fx = X - ix, fy = Y - iy, fz = Z - iz;
  const u = fade(fx), v = fade(fy), w = fade(fz);
  const n = (i: number, j: number, k: number) => gradDot(ix + i, iy + j, iz + k, P, seed, fx - i, fy - j, fz - k);
  const x00 = lerp(n(0, 0, 0), n(1, 0, 0), u), x10 = lerp(n(0, 1, 0), n(1, 1, 0), u);
  const x01 = lerp(n(0, 0, 1), n(1, 0, 1), u), x11 = lerp(n(0, 1, 1), n(1, 1, 1), u);
  return lerp(lerp(x00, x10, v), lerp(x01, x11, v), w);
}
/** fBm periódico (período 1 em x,y). base = células na 1ª oitava. Saída aprox. [-1,1]. */
export function pfbm(x: number, y: number, z: number, seed = 0, base = 3, oct = 4, gain = 0.5) {
  let s = 0, a = 1, norm = 0, P = base;
  for (let o = 0; o < oct; o++) {
    s += a * pperlin(x, y, z, P, seed + o * 17);
    norm += a; a *= gain; P *= 2;
  }
  return (s / norm) * 1.6;
}
