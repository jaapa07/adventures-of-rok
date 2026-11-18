/**
 * Biblioteca de partículas esculpidas para os efeitos (fx-*). Sem aleatoriedade: tudo vem de tabelas fixas.
 * Cada partícula é um osso; as chaves controlam nascimento (escala 0 → pico), trajetória e sumiço (escala → 0),
 * já que a opacidade dos materiais é fixa no pipeline: "desaparecer" = encolher.
 */
import { Rig, blob, tube, slab, lathe, mat, wobble, type V3, THREE } from '../../render/sculpt';
import type { Key, Anim } from '../../render/anim';
import type { ModelDef } from '../../render/types';
import { star, sparkle, additive } from '../props/kit';

export const FX_PRESETS: ModelDef['presets'] = ['neutro', 'caverna', 'recife'];
export const Z = 0.001;

/**
 * Trilha amostrada de uma partícula entre t0 e t1 (0..1 da animação).
 * pos(u), sc(u) e rot(u) recebem u = 0..1 dentro da vida da partícula. Fora da vida, escala ~0.
 */
export function track(t0: number, t1: number, pos: (u: number) => V3, sc: (u: number) => number | V3, rot?: (u: number) => V3, n = 10): Key[] {
  const keys: Key[] = [];
  const S = (v: number | V3) => (typeof v === 'number' ? Math.max(Z, v) : (v.map((x) => Math.max(Z, x)) as V3));
  if (t0 > 0) keys.push({ t: 0, s: Z, p: pos(0), r: rot?.(0) ?? [0, 0, 0] });
  if (t0 > 0.0001) keys.push({ t: Math.max(0, t0 - 0.0001), s: Z, p: pos(0), r: rot?.(0) ?? [0, 0, 0], e: 'step' });
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    keys.push({ t: t0 + (t1 - t0) * u, e: 'linear', p: pos(u), s: S(sc(u)), r: rot?.(u) ?? [0, 0, 0] });
  }
  if (t1 < 1) keys.push({ t: Math.min(1, t1 + 0.0001), s: Z, p: pos(1), r: rot?.(1) ?? [0, 0, 0], e: 'step' });
  return keys;
}

/** Curva de vida padrão: nasce rápido, segura, some no fim. */
export const life = (peak = 1, inAt = 0.25, outAt = 0.6) => (u: number) => (u < inAt ? peak * (1 - (1 - u / inAt) ** 2) : u < outAt ? peak : peak * (1 - (u - outAt) / (1 - outAt)) ** 1.2);
/** Ease-out para trajetórias. */
export const eo = (u: number) => 1 - (1 - u) ** 2;
export const lerp3 = (a: V3, b: V3, u: number): V3 => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u];
/** Arco balístico: de a até b, subindo `h` no meio. */
export const arc3 = (a: V3, b: V3, h: number) => (u: number): V3 => { const p = lerp3(a, b, u); p[1] += h * 4 * u * (1 - u); return p; };

/** Esconde ossos (conjuntos de partículas de outras animações). */
export function hide(bones: string[]): Record<string, Key[]> {
  return Object.fromEntries(bones.map((b) => [b, [{ t: 0, s: Z }]]));
}

/** Nuvem "couve-flor": 4 bolhas fundidas. */
export function puff(r: number, m: THREE.Material, seed = 0) {
  const g = new THREE.Group();
  const offs: [number, number, number, number][] = [[0, 0, 0, 1], [0.55, -0.15, 0.1, 0.72], [-0.5, -0.2, 0.05, 0.78], [0.1, 0.45, -0.05, 0.7], [-0.25, 0.3, 0.2, 0.6]];
  offs.forEach(([x, y, z, k], i) => {
    const rot = (i * 37 + seed * 53) % 360;
    g.add(blob([r * k, r * k * 0.92, r * k], m, { pos: [x * r, y * r, z * r], rot: [0, rot, 0], deform: [wobble(r * 0.06, 6 / r)], seg: 18, castShadow: false }));
  });
  return g;
}

/** Monta um ModelDef de efeito. */
export function fxDef(id: string, build: (v: string) => Rig, anims: Record<string, Anim>, cell: [number, number], pivot: [number, number], o: Partial<ModelDef> = {}): ModelDef {
  return { id, kind: 'fx', build, anims, cell, pivot, height: cell[1] / 104, presets: FX_PRESETS, shadow: false, ...o };
}

export { Rig, blob, tube, slab, lathe, mat, wobble, star, sparkle, additive, THREE };
export type { V3, Key, Anim };
