/**
 * Animação por keyframes escritos à mão.
 * Cada osso recebe deslocamentos SOBRE a pose de repouso: r = rotação extra (graus), p = translação extra, s = escala.
 * t vai de 0 a 1 ao longo da animação. Em loops, a chave t=1 deve repetir t=0.
 */
import * as THREE from 'three';
import type { V3 } from './sculpt';

export type Ease = 'linear' | 'in' | 'out' | 'inOut' | 'step' | 'back' | 'bounce';
export interface Key { t: number; r?: V3; p?: V3; s?: V3 | number; e?: Ease }
export interface Anim {
  frames: number;
  fps?: number; // padrão 24
  loop?: boolean; // padrão true para idle/andar/correr
  keys: Record<string, Key[]>;
}
export type AnimSet = Record<string, Anim>;

const D2R = Math.PI / 180;

function ease(e: Ease | undefined, x: number) {
  switch (e ?? 'inOut') {
    case 'linear': return x;
    case 'in': return x * x;
    case 'out': return 1 - (1 - x) * (1 - x);
    case 'step': return x < 1 ? 0 : 1;
    case 'back': { const c = 1.70158; return 1 + (c + 1) * (x - 1) ** 3 + c * (x - 1) ** 2; }
    case 'bounce': { const n = 7.5625, d = 2.75; let v = x; if (v < 1 / d) return n * v * v; if (v < 2 / d) return n * (v -= 1.5 / d) * v + 0.75; if (v < 2.5 / d) return n * (v -= 2.25 / d) * v + 0.9375; return n * (v -= 2.625 / d) * v + 0.984375; }
    default: return x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2;
  }
}

function sample(keys: Key[], t: number, field: 'r' | 'p' | 's'): V3 | null {
  const ks = keys.filter((k) => k[field] !== undefined).sort((a, b) => a.t - b.t);
  if (!ks.length) return null;
  const val = (k: Key): V3 => { const v = k[field]!; return typeof v === 'number' ? [v, v, v] : (v as V3); };
  if (t <= ks[0].t) return val(ks[0]);
  if (t >= ks[ks.length - 1].t) return val(ks[ks.length - 1]);
  for (let i = 0; i < ks.length - 1; i++) {
    const a = ks[i], b = ks[i + 1];
    if (t >= a.t && t <= b.t) {
      const x = ease(b.e, (t - a.t) / Math.max(b.t - a.t, 1e-6));
      const va = val(a), vb = val(b);
      return [va[0] + (vb[0] - va[0]) * x, va[1] + (vb[1] - va[1]) * x, va[2] + (vb[2] - va[2]) * x];
    }
  }
  return val(ks[ks.length - 1]);
}

/** Guarda a pose de repouso de todos os ossos (chamar logo após construir o rig). */
export function storeRest(bones: Record<string, THREE.Object3D>) {
  for (const b of Object.values(bones)) {
    b.userData.rest = { p: b.position.clone(), r: b.rotation.clone(), s: b.scale.clone() };
  }
}

export function resetPose(bones: Record<string, THREE.Object3D>) {
  for (const b of Object.values(bones)) {
    const r = b.userData.rest;
    if (!r) continue;
    b.position.copy(r.p); b.rotation.copy(r.r); b.scale.copy(r.s);
  }
}

/** Aplica a animação no tempo normalizado t (0..1). */
export function applyAnim(bones: Record<string, THREE.Object3D>, anim: Anim, t: number) {
  resetPose(bones);
  for (const [name, keys] of Object.entries(anim.keys)) {
    const optional = name.startsWith('?');
    const b = bones[optional ? name.slice(1) : name];
    if (!b) { if (optional) continue; throw new Error(`animação referencia osso inexistente: ${name}`); }
    const rest = b.userData.rest;
    const r = sample(keys, t, 'r');
    if (r) b.rotation.set(rest.r.x + r[0] * D2R, rest.r.y + r[1] * D2R, rest.r.z + r[2] * D2R);
    const p = sample(keys, t, 'p');
    if (p) b.position.set(rest.p.x + p[0], rest.p.y + p[1], rest.p.z + p[2]);
    const s = sample(keys, t, 's');
    if (s) b.scale.set(rest.s.x * s[0], rest.s.y * s[1], rest.s.z * s[2]);
  }
}

/** t normalizado do frame i (loops não repetem o último frame). */
export function frameT(anim: Anim, i: number) {
  const loop = anim.loop ?? true;
  return loop ? i / anim.frames : anim.frames <= 1 ? 0 : i / (anim.frames - 1);
}
