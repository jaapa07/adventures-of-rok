/**
 * Utilitários de keyframes compartilhados por chefes e NPCs.
 * Tudo determinístico (senos com fases fixas), sem aleatoriedade.
 */
import type { Key, Ease } from '../../render/anim';
import type { V3 } from '../../render/sculpt';

export const k = (t: number, r?: V3, p?: V3, e?: Ease, s?: V3 | number): Key => ({ t, r, p, e, s });
export const rz = (t: number, z: number, e?: Ease): Key => ({ t, r: [0, 0, z], e });
export const rx = (t: number, x: number, e?: Ease): Key => ({ t, r: [x, 0, 0], e });
export const ry = (t: number, y: number, e?: Ease): Key => ({ t, r: [0, y, 0], e });
export const pk = (t: number, p: V3, e?: Ease): Key => ({ t, p, e });
export const sk = (t: number, s: V3 | number, e?: Ease): Key => ({ t, s, e });

/** Escala de repouso de peças escondidas (só aparecem quando a animação aplica SHOW). */
export const HIDDEN = 0.001;
export const SHOW = 1 / HIDDEN;
export const show = (ranges: [number, number][], fade = 0.02): Key[] => {
  const ks: Key[] = [sk(0, 1, 'step')];
  for (const [a, b] of ranges) {
    ks.push(sk(Math.max(a - fade, 0.0001), 1, 'step'), sk(a, SHOW, 'step'), sk(b, SHOW, 'step'), sk(Math.min(b + fade, 1), 1, 'step'));
  }
  return ks.sort((x, y) => x.t - y.t);
};
export const showAll = (): Key[] => [sk(0, SHOW, 'step'), sk(1, SHOW, 'step')];

/** Piscada da pálpebra (eye() → osso 'lid'); `close` em graus somados à pose. */
export const blink = (t0: number, close = 64): Key[] => [rx(0, 0), rx(t0, 0), rx(t0 + 0.03, close, 'linear'), rx(t0 + 0.07, 0, 'linear'), rx(1, 0)];
export const hold = (r: V3): Key[] => [k(0, r), k(1, r)];
export const holdP = (p: V3): Key[] => [pk(0, p), pk(1, p)];

/** Oscilação senoidal em loop perfeito: rotação = base + amp·sen(2π(ciclos·t + fase)). */
export function wave(amp: V3, cycles = 1, phase = 0, base: V3 = [0, 0, 0], steps = 8): Key[] {
  const n = Math.max(steps, Math.round(steps * cycles));
  return Array.from({ length: n + 1 }, (_, i) => {
    const t = i / n;
    const s = Math.sin((cycles * t + phase) * Math.PI * 2);
    return k(t, [base[0] + amp[0] * s, base[1] + amp[1] * s, base[2] + amp[2] * s], undefined, 'linear');
  });
}
export function waveP(amp: V3, cycles = 1, phase = 0, base: V3 = [0, 0, 0], steps = 8): Key[] {
  const n = Math.max(steps, Math.round(steps * cycles));
  return Array.from({ length: n + 1 }, (_, i) => {
    const t = i / n;
    const s = Math.sin((cycles * t + phase) * Math.PI * 2);
    return pk(t, [base[0] + amp[0] * s, base[1] + amp[1] * s, base[2] + amp[2] * s], 'linear');
  });
}
export function waveS(amp: V3, cycles = 1, phase = 0, steps = 8): Key[] {
  const n = Math.max(steps, Math.round(steps * cycles));
  return Array.from({ length: n + 1 }, (_, i) => {
    const t = i / n;
    const s = Math.sin((cycles * t + phase) * Math.PI * 2);
    return sk(t, [1 + amp[0] * s, 1 + amp[1] * s, 1 + amp[2] * s], 'linear');
  });
}
/** Tremor rápido (vibração de motor, raiva) num intervalo [a,b]; fora dele fica parado. */
export function jitter(amp: V3, a: number, b: number, n = 10): Key[] {
  const ks: Key[] = [pk(0, [0, 0, 0]), pk(a, [0, 0, 0])];
  const pat = [1, -0.7, 0.5, -1, 0.8, -0.4, 0.9, -0.8, 0.3, -0.6];
  for (let i = 1; i < n; i++) {
    const t = a + ((b - a) * i) / n;
    const v = pat[i % pat.length];
    ks.push(pk(t, [amp[0] * v, amp[1] * pat[(i + 3) % pat.length], amp[2] * v], 'linear'));
  }
  ks.push(pk(b, [0, 0, 0], 'linear'), pk(1, [0, 0, 0]));
  return ks;
}
/** Junta trechos de rotação em Z: lista de [t, graus]. */
export const zs = (...pairs: [number, number, Ease?][]): Key[] => pairs.map(([t, z, e]) => rz(t, z, e));
