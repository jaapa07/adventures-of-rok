/**
 * Utilitários de keyframes para os inimigos (escritos à mão, sem aleatoriedade).
 */
import type { Key, Ease, Anim } from '../../render/anim';
import type { V3 } from '../../render/sculpt';

export const k = (t: number, r?: V3, p?: V3 | Ease, e?: Ease, s?: V3 | number): Key =>
  typeof p === 'string' ? { t, r, e: p, s } : { t, r, p, e, s };
export const rz = (t: number, z: number, e?: Ease): Key => ({ t, r: [0, 0, z], e });
export const rx = (t: number, x: number, e?: Ease): Key => ({ t, r: [x, 0, 0], e });
export const ry = (t: number, y: number, e?: Ease): Key => ({ t, r: [0, y, 0], e });
export const ps = (t: number, p: V3, e?: Ease): Key => ({ t, p, e });
export const sc = (t: number, s: V3 | number, e?: Ease): Key => ({ t, s, e });

/** Piscada (pálpebra gira em X para fechar). */
export const blink = (t0: number, close = 70): Key[] => [k(0, [0, 0, 0]), k(t0, [0, 0, 0]), k(t0 + 0.04, [close, 0, 0], undefined, 'linear'), k(t0 + 0.09, [0, 0, 0], undefined, 'linear'), k(1, [0, 0, 0])];
/** Pálpebra parada num valor (graus somados ao repouso). */
export const lidHold = (v: number): Key[] => [k(0, [v, 0, 0]), k(1, [v, 0, 0])];

/** Escala usada para "revelar" objetos de cena guardados com escala ~0 no repouso. */
export const SHOW = 1000;
export const shown = (): Key[] => [sc(0, SHOW), sc(1, SHOW)];

/** Laço senoidal: n chaves de rotação Z oscilando com amplitude a, fase ph (0..1) e deslocamento base. */
export function wave(a: number, ph = 0, base = 0, n = 8, cycles = 1): Key[] {
  const out: Key[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    out.push(rz(t, base + a * Math.sin((t * cycles + ph) * Math.PI * 2), 'linear'));
  }
  return out;
}
/** Igual a wave, mas num eixo qualquer (0=x,1=y,2=z). */
export function waveAxis(axis: 0 | 1 | 2, a: number, ph = 0, base = 0, n = 8, cycles = 1): Key[] {
  const out: Key[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const r: V3 = [0, 0, 0];
    r[axis] = base + a * Math.sin((t * cycles + ph) * Math.PI * 2);
    out.push(k(t, r, undefined, 'linear'));
  }
  return out;
}
/** Translação senoidal em Y (flutuar/respirar). */
export function bob(a: number, ph = 0, n = 8, cycles = 1, base: V3 = [0, 0, 0]): Key[] {
  const out: Key[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    out.push(ps(t, [base[0], base[1] + a * Math.sin((t * cycles + ph) * Math.PI * 2), base[2]], 'linear'));
  }
  return out;
}
/** Rotação contínua (giro) em torno de um eixo: voltas inteiras por ciclo. */
export function spin(axis: 0 | 1 | 2, turns: number): Key[] {
  const a: V3 = [0, 0, 0];
  const b: V3 = [0, 0, 0];
  b[axis] = 360 * turns;
  return [k(0, a, undefined, 'linear'), k(1, b, undefined, 'linear')];
}

/** Mescla conjuntos de chaves (o último vence). */
export function merge(...sets: Record<string, Key[]>[]): Record<string, Key[]> {
  return Object.assign({}, ...sets);
}
export const anim = (frames: number, loop: boolean, keys: Record<string, Key[]>, fps?: number): Anim => ({ frames, loop, keys, fps });
