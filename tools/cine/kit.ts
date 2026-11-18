/**
 * Kit das cinemáticas e imagens de tela (pipeline offline): céu, chão, mata, personagens posados
 * por código a partir dos modelos autorais, brilhos, chuva, fumaça e câmera de cinema.
 */
import * as THREE from 'three';
import { Batch, M, basic, radialTex, beamTex, tuneLights, vmat, hr, mix, type V3, type LightTune } from '../scenery/lib/core';
import { kapok, tree, palm, fern, bush, grassTuft, mossRock, log, stump, bigLeaf, heliconia, bromeliad, hangingVine, crown } from '../scenery/lib/flora';
import { patchGeo } from '../scenery/lib/kit';
import { storeRest, applyAnim, frameT } from '../render/anim';
import { MODELS } from '../models/index';
import { mat } from '../render/materials';
import type { SceneDef } from '../scenery/types';
import type { PresetId } from '../render/presets';

export { THREE, Batch, M, basic, radialTex, beamTex, tuneLights, vmat, hr, mix, kapok, tree, palm, fern, bush, grassTuft, mossRock, log, stump, bigLeaf, heliconia, bromeliad, hangingVine, crown };
export type { V3, SceneDef, LightTune };

export const W = 1280, H = 720;

/** Céu em domo com degradê vertical (cores de baixo para cima). */
export function sky(root: THREE.Object3D, stops: [number, number][], r = 400) {
  const g = new THREE.SphereGeometry(r, 48, 32);
  const pos = g.getAttribute('position') as THREE.BufferAttribute;
  const col = new Float32Array(pos.count * 3);
  const c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const t = Math.max(0, Math.min(1, (pos.getY(i) / r + 0.15) / 1.0));
    let k = 0;
    while (k < stops.length - 2 && t > stops[k + 1][0]) k++;
    const [t0, c0] = stops[k], [t1, c1] = stops[k + 1];
    c.set(c0).lerp(new THREE.Color(c1), Math.max(0, Math.min(1, (t - t0) / Math.max(1e-4, t1 - t0))));
    col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false }));
  m.renderOrder = -10;
  root.add(m);
  return m;
}

/** Chão em disco com cor por vértice (mais escuro nas bordas). */
export function ground(b: Batch, r: number, inner: number, outer: number, y = 0) {
  const g = patchGeo(r, r, 3, 40);
  const pos = g.getAttribute('position') as THREE.BufferAttribute;
  const col = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) {
    const d = Math.hypot(pos.getX(i), pos.getZ(i)) / r;
    const c = mix(inner, outer, Math.min(1, d * 1.2));
    col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  b.add(g, vmat('earth', 0xffffff), M([0, y, 0]));
}

/** Plano de chão simples, grande, para receber sombra. */
export function floor(root: THREE.Object3D, size: number, color: number, y = 0, kind: Parameters<typeof mat>[0] = 'earth') {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size, 1, 1), mat(kind, color, { repeat: size / 4 }));
  m.rotation.x = -Math.PI / 2; m.position.y = y; m.receiveShadow = true;
  root.add(m);
  return m;
}

/** Anel de mata ao fundo: árvores e moitas espalhadas de forma fixa. */
export function forest(b: Batch, o: { n: number; r0: number; r1: number; a0?: number; a1?: number; h?: [number, number]; leaf?: [number, number, number]; bark?: number; seed?: number; under?: boolean }) {
  const leaf = o.leaf ?? [0x1e4a22, 0x2e7a32, 0x6ab048];
  const bark = o.bark ?? 0x6a5040;
  const a0 = o.a0 ?? Math.PI * 1.05, a1 = o.a1 ?? Math.PI * 1.95;
  const seed = o.seed ?? 1;
  for (let i = 0; i < o.n; i++) {
    const a = a0 + (a1 - a0) * (i + hr(0, 0.8, i, seed)) / o.n;
    const r = hr(o.r0, o.r1, i, seed + 3);
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    const h = hr(o.h?.[0] ?? 6, o.h?.[1] ?? 11, i, seed + 5);
    if (i % 5 === 2) palm(b, M([x, 0, z]), h * 0.8, { trunk: 0x8a7050, leaf: leaf[1] }, i + seed, { lean: hr(-0.15, 0.15, i, seed) });
    else tree(b, M([x, 0, z]), h, { bark, leaf }, i + seed);
    if (o.under !== false) bush(b, M([x + 1.2, 0, z + 0.8]), hr(0.8, 1.6, i, seed + 9), leaf, i + seed);
  }
}

/** Vegetação baixa em volta de um ponto (samambaias, helicônias, bromélias, tufos). */
export function undergrowth(b: Batch, cx: number, cz: number, r: number, n: number, seed = 1, leaf = 0x3a8a3a) {
  for (let i = 0; i < n; i++) {
    const a = hr(0, Math.PI * 2, i, seed), d = hr(r * 0.3, r, i, seed + 1);
    const x = cx + Math.cos(a) * d, z = cz + Math.sin(a) * d;
    const k = i % 4;
    if (k === 0) fern(b, M([x, 0, z], [0, a * 57, 0]), hr(0.6, 1.1, i, seed), leaf, i);
    else if (k === 1) heliconia(b, M([x, 0, z], [0, a * 57, 0]), hr(0.9, 1.5, i, seed), leaf, i);
    else if (k === 2) bromeliad(b, M([x, 0, z]), hr(0.3, 0.5, i, seed), mix(leaf, 0x8a3a5a, 0.3).getHex(), 0xe03a4a, i);
    else grassTuft(b, M([x, 0, z]), hr(0.3, 0.6, i, seed), [leaf, 0x6ab048], i);
  }
}

/** Personagem autoral posado: modelo + animação + tempo normalizado + ajustes por osso (graus). */
export function pose(id: string, o: { anim?: string; t?: number; variant?: string; pos?: V3; rot?: V3; scale?: number; tweak?: Record<string, V3>; move?: Record<string, V3> } = {}) {
  const def = MODELS.find((m) => m.id === id);
  if (!def) throw new Error('modelo inexistente na cinemática: ' + id);
  const rig = def.build(o.variant ?? 'base');
  storeRest(rig.bones);
  const a = def.anims[o.anim ?? 'idle'] ?? def.anims.idle ?? Object.values(def.anims)[0];
  if (a) applyAnim(rig.bones, a, o.t !== undefined ? o.t : frameT(a, 0));
  for (const [bone, r] of Object.entries(o.tweak ?? {})) {
    const bn = rig.bones[bone]; if (!bn) continue;
    bn.rotation.x += r[0] * Math.PI / 180; bn.rotation.y += r[1] * Math.PI / 180; bn.rotation.z += r[2] * Math.PI / 180;
  }
  for (const [bone, p] of Object.entries(o.move ?? {})) { const bn = rig.bones[bone]; if (bn) bn.position.add(new THREE.Vector3(...p)); }
  const g = new THREE.Group();
  g.add(rig.root);
  if (o.pos) g.position.set(...o.pos);
  if (o.rot) g.rotation.set(o.rot[0] * Math.PI / 180, o.rot[1] * Math.PI / 180, o.rot[2] * Math.PI / 180);
  if (o.scale) g.scale.setScalar(o.scale);
  g.traverse((c) => { const m = c as THREE.Mesh; if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
  return g;
}

/** Halo luminoso (billboard aditivo voltado para a câmera). */
export function glow(root: THREE.Object3D, pos: V3, r: number, color: number, op = 0.8, cam?: THREE.Camera) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(r * 2, r * 2), basic(color, { additive: true, map: radialTex(), opacity: op, fog: false }));
  m.position.set(...pos);
  if (cam) m.quaternion.copy(cam.quaternion);
  m.renderOrder = 5;
  root.add(m);
  return m;
}

/** A Semente-Mãe: semente dourada com brilho e luz pontual. */
export function semente(root: THREE.Object3D, pos: V3, s = 1, cam?: THREE.Camera, luz = 6) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.22, 32, 24), mat('glow', 0xffd060, { emissive: 0xffc040, emissiveIntensity: 2.2 }));
  body.scale.set(1, 1.25, 1);
  g.add(body);
  g.position.set(...pos);
  g.scale.setScalar(s);
  root.add(g);
  glow(root, pos, 1.3 * s, 0xffd060, 0.9, cam);
  glow(root, pos, 3.2 * s, 0xffb030, 0.35, cam);
  if (luz > 0) { const l = new THREE.PointLight(0xffc060, luz, 9 * s, 1.6); l.position.set(pos[0], pos[1] + 0.2, pos[2] + 0.3); root.add(l); }
  return g;
}

/** Feixes de luz cruzando a cena. */
export function beams(root: THREE.Object3D, list: { pos: V3; w: number; h: number; rot?: number; op?: number; color?: number }[]) {
  for (const L of list) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(L.w, L.h), basic(L.color ?? 0xfff0c0, { additive: true, map: beamTex(), opacity: L.op ?? 0.25, fog: false }));
    m.position.set(...L.pos);
    m.rotation.z = (L.rot ?? -18) * Math.PI / 180;
    m.renderOrder = 4;
    root.add(m);
  }
}

/** Chuva: riscos finos inclinados distribuídos de forma fixa num volume. */
export function rain(root: THREE.Object3D, n: number, box: { x: [number, number]; y: [number, number]; z: [number, number] }, color = 0xc8dcff, op = 0.45) {
  const pos: number[] = [];
  for (let i = 0; i < n; i++) {
    const x = hr(box.x[0], box.x[1], i, 11), y = hr(box.y[0], box.y[1], i, 12), z = hr(box.z[0], box.z[1], i, 13);
    const L = hr(0.35, 0.7, i, 14);
    pos.push(x, y, z, x - L * 0.18, y - L, z);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  const m = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color, transparent: true, opacity: op, fog: false }));
  root.add(m);
}

/** Fumaça/névoa: bolhas escuras translúcidas. */
export function smoke(b: Batch, pos: V3, n: number, r: number, color = 0x3a3436, seed = 1, rise = 3) {
  const m = vmat('rubber', 0xffffff, { rough: 1, rim: 0.15, opacity: 0.75 });
  for (let i = 0; i < n; i++) {
    const k = i / n;
    const s = r * (0.6 + k * 1.4) * hr(0.8, 1.2, i, seed);
    b.add(new THREE.IcosahedronGeometry(1, 2), m, M([pos[0] + hr(-r, r, i, seed + 1) * (1 + k * 2), pos[1] + k * rise, pos[2] + hr(-r, r, i, seed + 2) * 0.5], [0, 0, 0], [s, s * 0.8, s]), mix(color, 0x8a8890, k * 0.6).getHex());
  }
}

/** Câmera de cinema (perspectiva 16:9). */
export function cinecam(pos: V3, target: V3, fov = 40) {
  const c = new THREE.PerspectiveCamera(fov, W / H, 0.1, 900);
  c.position.set(...pos);
  c.lookAt(...target);
  c.updateMatrixWorld();
  c.updateProjectionMatrix();
  return c;
}

/** Atalho para declarar uma cena de cinemática 1280×720. */
export function cine(id: string, preset: PresetId, build: SceneDef['build'], ss = 1.25): SceneDef {
  return { id, out: `cine/${id}.webp`, size: [W, H], preset, ss, build };
}

/** Galho grosso horizontal (cama da dupla na sumaúma). */
export function branch(b: Batch, from: V3, to: V3, r0: number, r1: number, bark = 0x9a8a70) {
  const a = new THREE.Vector3(...from), c = new THREE.Vector3(...to);
  const len = a.distanceTo(c);
  const g = new THREE.CylinderGeometry(r1, r0, len, 18, 6);
  g.translate(0, len / 2, 0);
  const dir = c.clone().sub(a).normalize();
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
  const mtx = new THREE.Matrix4().compose(a, q, new THREE.Vector3(1, 1, 1));
  b.add(g, vmat('bark', 0xffffff, { repeat: 1 }), mtx, bark);
}

export function lights(scene: THREE.Scene, t: LightTune) { tuneLights(scene, t); }
