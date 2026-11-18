/**
 * Biblioteca de escultura autoral para os modelos 3D pré-renderizados.
 * Roda APENAS no Chromium headless do pipeline de build (tools/), nunca no jogo.
 *
 * Convenções:
 *  - 1 unidade ≈ 1 metro. Herói adulto ≈ 1.6 de altura.
 *  - O modelo olha para +X (direita). +Y é para cima. +Z aponta para a câmera.
 *  - A origem (0,0,0) é o ponto entre os pés (pivot do sprite).
 *  - Ângulos de pose/keyframe em GRAUS.
 */
import * as THREE from 'three';
import { mat, type MatOpts } from './materials';

export type V3 = [number, number, number];
export type V2 = [number, number];
export const D2R = Math.PI / 180;

/* ------------------------------------------------------------------ */
/* Deformadores (esculpem vértices de qualquer geometria)              */
/* ------------------------------------------------------------------ */

export type Deformer = (p: THREE.Vector3) => void;

/** Afina ao longo de um eixo: escala os outros 2 eixos de s0 (em min) até s1 (em max). */
export function taper(axis: 'x' | 'y' | 'z', min: number, max: number, s0: number, s1: number): Deformer {
  return (p) => {
    const t = THREE.MathUtils.clamp((p[axis] - min) / (max - min), 0, 1);
    const s = s0 + (s1 - s0) * t;
    if (axis !== 'x') p.x *= s;
    if (axis !== 'y') p.y *= s;
    if (axis !== 'z') p.z *= s;
  };
}

/** Infla (amount>0) ou afunda (amount<0) a região perto de `center`, com queda suave em `radius`. */
export function bulge(center: V3, radius: number, amount: number): Deformer {
  const c = new THREE.Vector3(...center);
  return (p) => {
    const d = p.distanceTo(c);
    if (d >= radius) return;
    const f = Math.cos((d / radius) * Math.PI * 0.5) ** 2 * amount;
    const dir = p.clone().sub(c);
    if (dir.lengthSq() < 1e-9) return;
    // empurra para fora do centro do objeto (origem local)
    const n = p.clone().normalize();
    p.addScaledVector(n, f);
  };
}

/** Desloca vértices numa direção, ponderado por proximidade de `center` (puxar focinho, queixo...). */
export function pull(center: V3, radius: number, offset: V3): Deformer {
  const c = new THREE.Vector3(...center);
  const o = new THREE.Vector3(...offset);
  return (p) => {
    const d = p.distanceTo(c);
    if (d >= radius) return;
    const f = Math.cos((d / radius) * Math.PI * 0.5) ** 2;
    p.addScaledVector(o, f);
  };
}

/** Curva o objeto ao longo de Y em torno do eixo Z (dobra banana/cauda). angle em graus para a altura `len`. */
export function bend(angleDeg: number, len: number): Deformer {
  const k = (angleDeg * D2R) / len;
  return (p) => {
    if (Math.abs(k) < 1e-6) return;
    const th = p.y * k;
    const r = 1 / k;
    const x = p.x;
    p.x = r - (r - x) * Math.cos(th);
    p.y = (r - x) * Math.sin(th);
  };
}

/** Achata a parte de baixo (sola, base) abaixo de y0. */
export function flattenBelow(y0: number, strength = 1): Deformer {
  return (p) => {
    if (p.y < y0) p.y = y0 + (p.y - y0) * (1 - strength);
  };
}

/** Ruído orgânico determinístico (sem aleatoriedade: soma de senos com frequências fixas). */
export function wobble(amount: number, freq = 7): Deformer {
  return (p) => {
    const n =
      Math.sin(p.x * freq + p.y * 1.7) * 0.5 +
      Math.sin(p.y * freq * 1.3 + p.z * 2.1) * 0.3 +
      Math.sin(p.z * freq * 0.7 + p.x * 3.1) * 0.2;
    const len = p.length();
    if (len > 1e-6) p.multiplyScalar(1 + (n * amount) / len);
  };
}

export function applyDeform(geo: THREE.BufferGeometry, ds: Deformer[]) {
  if (!ds.length) return geo;
  const pos = geo.getAttribute('position') as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    for (const d of ds) d(v);
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

/* ------------------------------------------------------------------ */
/* Primitivas orgânicas                                                */
/* ------------------------------------------------------------------ */

export interface PartOpts {
  pos?: V3;
  rot?: V3; // graus
  scale?: V3 | number;
  deform?: Deformer[];
  name?: string;
  castShadow?: boolean;
}

function finish(mesh: THREE.Mesh, o: PartOpts = {}) {
  if (o.pos) mesh.position.set(...o.pos);
  if (o.rot) mesh.rotation.set(o.rot[0] * D2R, o.rot[1] * D2R, o.rot[2] * D2R);
  if (o.scale !== undefined) {
    if (typeof o.scale === 'number') mesh.scale.setScalar(o.scale);
    else mesh.scale.set(...o.scale);
  }
  if (o.name) mesh.name = o.name;
  mesh.castShadow = o.castShadow ?? true;
  mesh.receiveShadow = true;
  return mesh;
}

/** Elipsoide esculpível (base de cabeças, corpos, músculos). */
export function blob(r: V3, material: THREE.Material, o: PartOpts & { seg?: number } = {}) {
  const seg = o.seg ?? 36;
  const g = new THREE.SphereGeometry(1, seg, Math.round(seg * 0.75));
  g.scale(r[0], r[1], r[2]);
  applyDeform(g, o.deform ?? []);
  return finish(new THREE.Mesh(g, material), o);
}

/** Cápsula orientada em Y (membros). r0 no topo, r1 na base para afinar. */
export function limb(len: number, r0: number, r1: number, material: THREE.Material, o: PartOpts = {}) {
  // perfil de torno: semiesfera em cima, cone suave, semiesfera embaixo. Origem no TOPO (articulação).
  const pts: THREE.Vector2[] = [];
  const n = 8;
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 0.5;
    pts.push(new THREE.Vector2(Math.sin(a) * r1, -len + -Math.cos(a) * r1));
  }
  for (let i = 1; i <= 6; i++) {
    const t = i / 6;
    const r = r1 + (r0 - r1) * t;
    pts.push(new THREE.Vector2(r * (1 + Math.sin(t * Math.PI) * 0.06), -len + len * t));
  }
  for (let i = 1; i <= n; i++) {
    const a = (i / n) * Math.PI * 0.5;
    pts.push(new THREE.Vector2(Math.cos(a) * r0, Math.sin(a) * r0));
  }
  pts.sort((a, b) => a.y - b.y);
  const g = new THREE.LatheGeometry(pts, 24);
  applyDeform(g, o.deform ?? []);
  return finish(new THREE.Mesh(g, material), o);
}

/** Torno a partir de perfil [raio, altura] (cabaças, troncos, potes, focinhos). */
export function lathe(profile: V2[], material: THREE.Material, o: PartOpts & { seg?: number } = {}) {
  const g = new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(Math.max(r, 0.0001), y)), o.seg ?? 32);
  applyDeform(g, o.deform ?? []);
  return finish(new THREE.Mesh(g, material), o);
}

/** Tubo por spline com raio variável (caudas, cipós, dedos, chifres). */
export function tube(points: V3[], radius: number | ((t: number) => number), material: THREE.Material, o: PartOpts & { seg?: number; radial?: number; closed?: boolean } = {}) {
  const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)));
  const tubSeg = o.seg ?? 48;
  const radial = o.radial ?? 14;
  const g = new THREE.TubeGeometry(curve, tubSeg, 1, radial, o.closed ?? false);
  // raio variável: reescala cada anel
  const pos = g.getAttribute('position') as THREE.BufferAttribute;
  const rf = typeof radius === 'number' ? () => radius : radius;
  const v = new THREE.Vector3();
  for (let i = 0; i <= tubSeg; i++) {
    const t = i / tubSeg;
    const c = curve.getPointAt(t);
    const r = rf(t);
    for (let j = 0; j <= radial; j++) {
      const idx = i * (radial + 1) + j;
      v.fromBufferAttribute(pos, idx).sub(c).multiplyScalar(r).add(c);
      pos.setXYZ(idx, v.x, v.y, v.z);
    }
  }
  // tampas arredondadas simples
  applyDeform(g, o.deform ?? []);
  g.computeVertexNormals();
  const mesh = finish(new THREE.Mesh(g, material), o);
  const r0 = rf(0), r1 = rf(1);
  if (r0 > 0.002) mesh.add(finish(new THREE.Mesh(new THREE.SphereGeometry(r0, 14, 10), material), { pos: points[0] }));
  if (r1 > 0.002) mesh.add(finish(new THREE.Mesh(new THREE.SphereGeometry(r1, 14, 10), material), { pos: points[points.length - 1] }));
  return mesh;
}

/** Extrusão com bisel a partir de contorno 2D (orelhas, folhas, nadadeiras, placas, lâminas). */
export function slab(outline: V2[], depth: number, material: THREE.Material, o: PartOpts & { bevel?: number; smooth?: boolean } = {}) {
  const shape = new THREE.Shape();
  const pts = outline.map(([x, y]) => new THREE.Vector2(x, y));
  if (o.smooth !== false && pts.length > 3) {
    const curve = new THREE.SplineCurve([...pts, pts[0]]);
    shape.setFromPoints(curve.getPoints(pts.length * 8));
  } else shape.setFromPoints(pts);
  const bevel = o.bevel ?? depth * 0.45;
  const g = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 4,
    curveSegments: 24,
  });
  g.translate(0, 0, -depth / 2);
  applyDeform(g, o.deform ?? []);
  return finish(new THREE.Mesh(g, material), o);
}

/** Caixa arredondada (madeira, metal, tijolos de cenário). */
export function roundBox(size: V3, radius: number, material: THREE.Material, o: PartOpts = {}) {
  const [w, h, d] = size;
  const r = Math.min(radius, w / 2, h / 2, d / 2);
  const shape = new THREE.Shape();
  const x = -w / 2 + r, y = -h / 2 + r, W = w - 2 * r, H = h - 2 * r;
  shape.moveTo(x, y - r);
  shape.lineTo(x + W, y - r);
  shape.quadraticCurveTo(x + W + r, y - r, x + W + r, y);
  shape.lineTo(x + W + r, y + H);
  shape.quadraticCurveTo(x + W + r, y + H + r, x + W, y + H + r);
  shape.lineTo(x, y + H + r);
  shape.quadraticCurveTo(x - r, y + H + r, x - r, y + H);
  shape.lineTo(x - r, y);
  shape.quadraticCurveTo(x - r, y - r, x, y - r);
  const g = new THREE.ExtrudeGeometry(shape, { depth: Math.max(d - 2 * r, 0.001), bevelEnabled: true, bevelThickness: r, bevelSize: 0, bevelSegments: 5, curveSegments: 6 });
  g.translate(0, 0, -(d - 2 * r) / 2);
  applyDeform(g, o.deform ?? []);
  return finish(new THREE.Mesh(g, material), o);
}

/** Toro (anéis, bocas, aros, rodas). */
export function ring(radius: number, thick: number, material: THREE.Material, o: PartOpts & { arc?: number } = {}) {
  const g = new THREE.TorusGeometry(radius, thick, 14, 40, (o.arc ?? 360) * D2R);
  applyDeform(g, o.deform ?? []);
  return finish(new THREE.Mesh(g, material), o);
}

/** Cone/espinho orgânico. */
export function spike(len: number, r: number, material: THREE.Material, o: PartOpts & { curve?: number } = {}) {
  const pts: V3[] = [];
  for (let i = 0; i <= 6; i++) {
    const t = i / 6;
    pts.push([Math.sin(t * Math.PI * 0.5) * (o.curve ?? 0) * len, t * len, 0]);
  }
  return tube(pts, (t) => r * (1 - t) ** 1.3 + 0.002, material, o);
}

/* ------------------------------------------------------------------ */
/* Olhos (reutilizável por todos os personagens)                      */
/* ------------------------------------------------------------------ */

export interface EyeOpts {
  r: number;
  iris: number; // cor
  irisScale?: number; // 0..1 do tamanho do olho
  look?: V2; // direção do olhar (x,y) -1..1
  lid?: number; // 0 aberto .. 1 fechado (pálpebra superior)
  lidColor?: number;
  angry?: number; // inclinação da pálpebra em graus
}

/** Olho completo: globo, íris, pupila, brilho especular e pálpebra. Retorna grupo com bones 'lid'. */
export function eye(o: EyeOpts) {
  const g = new THREE.Group();
  const white = blob([o.r, o.r, o.r * 0.8], mat('eyeWhite', 0xfdfbf4), { seg: 24 });
  g.add(white);
  const ir = o.r * (o.irisScale ?? 0.62);
  const lx = (o.look?.[0] ?? 0.35) * o.r * 0.35;
  const ly = (o.look?.[1] ?? 0) * o.r * 0.35;
  const iris = blob([ir, ir, ir * 0.35], mat('iris', o.iris), { pos: [lx, ly, o.r * 0.68], seg: 20 });
  g.add(iris);
  g.add(blob([ir * 0.55, ir * 0.55, ir * 0.25], mat('pupil', 0x0d0a12), { pos: [lx, ly, o.r * 0.8], seg: 16 }));
  g.add(blob([ir * 0.28, ir * 0.28, ir * 0.12], mat('glint', 0xffffff), { pos: [lx - ir * 0.35, ly + ir * 0.4, o.r * 0.9], seg: 12, castShadow: false }));
  // pálpebra (meia esfera que gira para fechar)
  const lidPivot = new THREE.Group();
  lidPivot.name = 'lid';
  const lidGeo = new THREE.SphereGeometry(o.r * 1.06, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.5);
  const lid = new THREE.Mesh(lidGeo, mat('skin', o.lidColor ?? 0x6b4a33));
  lid.castShadow = false;
  lidPivot.add(lid);
  lidPivot.rotation.x = (-90 + (o.lid ?? 0.15) * 90) * D2R;
  lidPivot.rotation.z = (o.angry ?? 0) * D2R;
  g.add(lidPivot);
  return g;
}

/* ------------------------------------------------------------------ */
/* Ossos / hierarquia                                                  */
/* ------------------------------------------------------------------ */

export class Rig {
  root = new THREE.Group();
  bones: Record<string, THREE.Object3D> = {};
  anchors: Record<string, THREE.Object3D> = {};
  constructor(name = 'root') {
    this.root.name = name;
    this.bones[name] = this.root;
  }
  /** Cria um osso (pivot) filho de `parent`, na posição local `pos`. */
  bone(name: string, parent: string, pos: V3 = [0, 0, 0], rot: V3 = [0, 0, 0]) {
    const b = new THREE.Group();
    b.name = name;
    b.position.set(...pos);
    b.rotation.set(rot[0] * D2R, rot[1] * D2R, rot[2] * D2R);
    const p = this.bones[parent];
    if (!p) throw new Error(`osso pai inexistente: ${parent}`);
    p.add(b);
    this.bones[name] = b;
    return b;
  }
  /** Anexa malha(s) a um osso. */
  add(boneName: string, ...objs: THREE.Object3D[]) {
    const b = this.bones[boneName];
    if (!b) throw new Error(`osso inexistente: ${boneName}`);
    for (const o of objs) b.add(o);
    return this;
  }
  /** Ponto de ancoragem (ex.: 'hand' para armas na mão). */
  anchor(name: string, parent: string, pos: V3 = [0, 0, 0]) {
    const a = new THREE.Object3D();
    a.name = 'anchor:' + name;
    a.position.set(...pos);
    this.bones[parent].add(a);
    this.anchors[name] = a;
    return a;
  }
  /** Quantidade de malhas (o verify exige >= 30 para heróis). */
  meshCount() {
    let n = 0;
    this.root.traverse((o) => { if ((o as THREE.Mesh).isMesh) n++; });
    return n;
  }
}

export { mat };
export type { MatOpts };
export { THREE };
