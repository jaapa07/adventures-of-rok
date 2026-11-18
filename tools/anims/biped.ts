/**
 * Biblioteca de animações bípedes dos heróis (keyframes escritos à mão).
 * Ossos padrão: root, hips, spine, chest, neck, head, earL/R, lidL/R,
 * armL_up/armL_lo/handL, armR_up/armR_lo/handR, legL_up/legL_lo/footL, legR_up/legR_lo/footR, tail1..3.
 * Ossos opcionais (prefixo '?'): snout, snoutTip (Tamá), tailTip (Lili), mane (Lili).
 *
 * Convenção de rotação (graus, eixo Z = no plano da tela, personagem olhando para +X):
 *   braço/perna  +Z → balança para FRENTE     antebraço +Z → dobra o cotovelo para frente
 *   canela       -Z → dobra o joelho para trás  coluna  -Z → inclina para FRENTE
 */
import type { Anim, AnimSet, Key, Ease } from '../render/anim';
import type { V3 } from '../render/sculpt';

export type Style = 'heavy' | 'light';

const k = (t: number, r?: V3, p?: V3 | Ease, e?: Ease, s?: V3 | number): Key =>
  typeof p === 'string' ? { t, r, e: p, s } : { t, r, p, e, s };
const rz = (t: number, z: number, e?: Ease): Key => ({ t, r: [0, 0, z], e });
const blink = (t0: number, close = 64): Key[] => [k(0, [0, 0, 0]), k(t0, [0, 0, 0]), k(t0 + 0.03, [close, 0, 0], 'linear'), k(t0 + 0.07, [0, 0, 0], 'linear'), k(1, [0, 0, 0])];

export function bipedAnims(style: Style): AnimSet {
  const H = style === 'heavy';
  const A = H ? 1 : 1.2; // amplitude
  const lean = H ? -6 : -10;
  const tail = H ? 1 : 1.6;

  const idle: Anim = {
    frames: 24, loop: true,
    keys: {
      hips: [k(0, [0, 0, 0], [0, 0, 0]), k(0.5, [0, 0, 0], [0, -0.012, 0]), k(1, [0, 0, 0], [0, 0, 0])],
      chest: [k(0, [0, 0, 0], undefined, undefined, [1, 1, 1]), k(0.5, [0, 0, -2], undefined, undefined, [1.02, 1.035, 1.02]), k(1, [0, 0, 0], undefined, undefined, [1, 1, 1])],
      head: [rz(0, 0), rz(0.5, -3), rz(1, 0)],
      armR_up: [rz(0, 0), rz(0.5, 3), rz(1, 0)],
      armL_up: [rz(0, 0), rz(0.5, -3), rz(1, 0)],
      armR_lo: [rz(0, 0), rz(0.5, 4), rz(1, 0)],
      armL_lo: [rz(0, 0), rz(0.5, 4), rz(1, 0)],
      tail1: [rz(0, 0), rz(0.5, 5 * tail), rz(1, 0)],
      tail2: [rz(0, 0), rz(0.5, 7 * tail), rz(1, 0)],
      tail3: [rz(0, 0), rz(0.6, 10 * tail), rz(1, 0)],
      earR: [rz(0, 0), rz(0.7, 6), rz(1, 0)],
      earL: [rz(0, 0), rz(0.7, 6), rz(1, 0)],
      lidR: blink(0.78), lidL: blink(0.78),
    },
  };

  const walkCycle = (frames: number, amp: number, bob: number, sp: number, armAmp: number): Anim => ({
    frames, loop: true,
    keys: {
      hips: [k(0, [0, 0, 0], [0, 0, 0], 'linear'), k(0.25, [0, 0, 0], [0, bob, 0], 'out'), k(0.5, [0, 0, 0], [0, 0, 0], 'in'), k(0.75, [0, 0, 0], [0, bob, 0], 'out'), k(1, [0, 0, 0], [0, 0, 0], 'in')],
      spine: [rz(0, sp), rz(0.25, sp - 2), rz(0.5, sp), rz(0.75, sp - 2), rz(1, sp)],
      chest: [k(0, [0, 6, 0]), k(0.5, [0, -6, 0]), k(1, [0, 6, 0])],
      head: [rz(0, -sp * 0.6), rz(0.25, -sp * 0.6 + 3), rz(0.5, -sp * 0.6), rz(0.75, -sp * 0.6 + 3), rz(1, -sp * 0.6)],
      legR_up: [rz(0, amp, 'inOut'), rz(0.5, -amp, 'inOut'), rz(1, amp, 'inOut')],
      legL_up: [rz(0, -amp, 'inOut'), rz(0.5, amp, 'inOut'), rz(1, -amp, 'inOut')],
      legR_lo: [rz(0, -6), rz(0.25, -10), rz(0.5, -18), rz(0.75, -amp * 2.2), rz(1, -6)],
      legL_lo: [rz(0, -18), rz(0.25, -amp * 2.2), rz(0.5, -6), rz(0.75, -10), rz(1, -18)],
      footR: [rz(0, 10), rz(0.5, -14), rz(0.75, 6), rz(1, 10)],
      footL: [rz(0, -14), rz(0.25, 6), rz(0.5, 10), rz(1, -14)],
      armR_up: [rz(0, -armAmp), rz(0.5, armAmp), rz(1, -armAmp)],
      armL_up: [rz(0, armAmp), rz(0.5, -armAmp), rz(1, armAmp)],
      armR_lo: [rz(0, 10), rz(0.5, 30 * A), rz(1, 10)],
      armL_lo: [rz(0, 30 * A), rz(0.5, 10), rz(1, 30 * A)],
      tail1: [rz(0, -4 * tail), rz(0.25, 4 * tail), rz(0.5, -4 * tail), rz(0.75, 4 * tail), rz(1, -4 * tail)],
      tail2: [rz(0, 6 * tail), rz(0.25, -6 * tail), rz(0.5, 6 * tail), rz(0.75, -6 * tail), rz(1, 6 * tail)],
      tail3: [rz(0, -8 * tail), rz(0.3, 10 * tail), rz(0.55, -8 * tail), rz(0.8, 10 * tail), rz(1, -8 * tail)],
      earR: [rz(0, 4), rz(0.5, -4), rz(1, 4)], earL: [rz(0, 4), rz(0.5, -4), rz(1, 4)],
    },
  });

  const andar = walkCycle(16, 26 * A, 0.03, lean, 22 * A);
  const correr = walkCycle(12, 44 * A, 0.06, lean - 12, 46 * A);
  // corrida: braços dobrados bombeando
  correr.keys.armR_lo = [rz(0, 70), rz(0.5, 95), rz(1, 70)];
  correr.keys.armL_lo = [rz(0, 95), rz(0.5, 70), rz(1, 95)];
  correr.keys.earR = [rz(0, -20), rz(0.5, -26), rz(1, -20)];
  correr.keys.earL = [rz(0, -20), rz(0.5, -26), rz(1, -20)];

  const pulo: Anim = {
    frames: 6, loop: false,
    keys: {
      hips: [k(0, [0, 0, 0], [0, -0.08, 0]), k(0.35, [0, 0, 0], [0, 0.04, 0], 'out'), k(1, [0, 0, 0], [0, 0.06, 0])],
      spine: [rz(0, -14), rz(0.4, 6), rz(1, 4)],
      head: [rz(0, 10), rz(1, 8)],
      legR_up: [rz(0, 30), rz(0.4, -6), rz(1, 10)], legL_up: [rz(0, 26), rz(0.4, -18), rz(1, -24)],
      legR_lo: [rz(0, -60), rz(0.4, -4), rz(1, -20)], legL_lo: [rz(0, -56), rz(0.4, -6), rz(1, -40)],
      footR: [rz(0, 20), rz(1, -30)], footL: [rz(0, 20), rz(1, -30)],
      armR_up: [rz(0, -30), rz(0.4, 140 * A), rz(1, 150 * A)], armL_up: [rz(0, -26), rz(0.4, 120 * A), rz(1, 130 * A)],
      armR_lo: [rz(0, 20), rz(1, 20)], armL_lo: [rz(0, 20), rz(1, 30)],
      tail1: [rz(0, -20), rz(1, -30 * tail)], tail2: [rz(0, -10), rz(1, -20 * tail)], tail3: [rz(0, 0), rz(1, -20 * tail)],
      earR: [rz(0, 10), rz(1, -30)], earL: [rz(0, 10), rz(1, -30)],
    },
  };
  const apice: Anim = {
    frames: 4, loop: true,
    keys: {
      hips: [k(0, [0, 0, 0], [0, 0.06, 0]), k(0.5, [0, 0, 0], [0, 0.07, 0]), k(1, [0, 0, 0], [0, 0.06, 0])],
      spine: [rz(0, 2), rz(1, 2)],
      legR_up: [rz(0, 44), rz(0.5, 48), rz(1, 44)], legL_up: [rz(0, 20), rz(0.5, 24), rz(1, 20)],
      legR_lo: [rz(0, -70), rz(1, -70)], legL_lo: [rz(0, -60), rz(1, -60)],
      armR_up: [rz(0, 100 * A), rz(0.5, 108 * A), rz(1, 100 * A)], armL_up: [rz(0, 70 * A), rz(0.5, 78 * A), rz(1, 70 * A)],
      armR_lo: [rz(0, 30), rz(1, 30)], armL_lo: [rz(0, 40), rz(1, 40)],
      tail1: [rz(0, -10), rz(0.5, -16), rz(1, -10)], tail3: [rz(0, 10 * tail), rz(0.5, -10 * tail), rz(1, 10 * tail)],
      earR: [rz(0, -14), rz(1, -14)], earL: [rz(0, -14), rz(1, -14)],
    },
  };
  const queda: Anim = {
    frames: 6, loop: true,
    keys: {
      hips: [k(0, [0, 0, 0], [0, 0.04, 0]), k(1, [0, 0, 0], [0, 0.04, 0])],
      spine: [rz(0, 4), rz(0.5, 8), rz(1, 4)],
      head: [rz(0, 10), rz(0.5, 6), rz(1, 10)],
      legR_up: [rz(0, 18), rz(0.5, 6), rz(1, 18)], legL_up: [rz(0, -8), rz(0.5, 4), rz(1, -8)],
      legR_lo: [rz(0, -26), rz(1, -26)], legL_lo: [rz(0, -14), rz(1, -14)],
      armR_up: [rz(0, 150 * A), rz(0.5, 130 * A), rz(1, 150 * A)], armL_up: [rz(0, 120 * A), rz(0.5, 145 * A), rz(1, 120 * A)],
      armR_lo: [rz(0, 10), rz(0.5, 30), rz(1, 10)], armL_lo: [rz(0, 30), rz(0.5, 10), rz(1, 30)],
      tail1: [rz(0, 30), rz(0.5, 36), rz(1, 30)], tail2: [rz(0, 20 * tail), rz(0.5, 26 * tail), rz(1, 20 * tail)], tail3: [rz(0, 10), rz(0.5, 20), rz(1, 10)],
      earR: [rz(0, 40), rz(0.5, 50), rz(1, 40)], earL: [rz(0, 40), rz(0.5, 50), rz(1, 40)],
    },
  };
  const aterrissar: Anim = {
    frames: 5, loop: false,
    keys: {
      hips: [k(0, [0, 0, 0], [0, -0.02, 0]), k(0.3, [0, 0, 0], [0, -0.14 * A, 0], 'out', [1.06, 0.92, 1.06]), k(1, [0, 0, 0], [0, 0, 0], 'out', 1)],
      spine: [rz(0, -4), rz(0.3, -22), rz(1, 0)],
      head: [rz(0, 0), rz(0.3, 14), rz(1, 0)],
      legR_up: [rz(0, 20), rz(0.3, 50), rz(1, 0)], legL_up: [rz(0, 10), rz(0.3, 44), rz(1, 0)],
      legR_lo: [rz(0, -30), rz(0.3, -90), rz(1, 0)], legL_lo: [rz(0, -20), rz(0.3, -84), rz(1, 0)],
      footR: [rz(0, -10), rz(0.3, 40), rz(1, 0)], footL: [rz(0, -10), rz(0.3, 38), rz(1, 0)],
      armR_up: [rz(0, 60), rz(0.3, -20), rz(1, 0)], armL_up: [rz(0, 50), rz(0.3, -30), rz(1, 0)],
      armR_lo: [rz(0, 20), rz(0.3, 40), rz(1, 0)], armL_lo: [rz(0, 20), rz(0.3, 40), rz(1, 0)],
      tail1: [rz(0, 10), rz(0.3, -20), rz(1, 0)], tail3: [rz(0, 0), rz(0.4, 20), rz(1, 0)],
    },
  };

  // bola rolando: corpo enrolado girando em torno do quadril abaixado
  const curl = (): Record<string, Key[]> => ({
    spine: [rz(0, -48), rz(1, -48)], chest: [rz(0, -30), rz(1, -30)], neck: [rz(0, -20), rz(1, -20)], head: [rz(0, -30), rz(1, -30)],
    legR_up: [rz(0, 110), rz(1, 110)], legL_up: [rz(0, 104), rz(1, 104)],
    legR_lo: [rz(0, -130), rz(1, -130)], legL_lo: [rz(0, -126), rz(1, -126)],
    armR_up: [rz(0, 60), rz(1, 60)], armL_up: [rz(0, 66), rz(1, 66)],
    armR_lo: [rz(0, 110), rz(1, 110)], armL_lo: [rz(0, 110), rz(1, 110)],
    tail1: [rz(0, -60), rz(1, -60)], tail2: [rz(0, -40), rz(1, -40)], tail3: [rz(0, -30), rz(1, -30)],
    '?snout': [rz(0, -30), rz(1, -30)],
    earR: [rz(0, -40), rz(1, -40)], earL: [rz(0, -40), rz(1, -40)],
    lidR: [k(0, [50, 0, 0]), k(1, [50, 0, 0])], lidL: [k(0, [50, 0, 0]), k(1, [50, 0, 0])],
  });
  const rolar: Anim = {
    frames: 12, loop: true,
    keys: { ...curl(), hips: [k(0, [0, 0, 0], [0, -0.26, 0], 'linear'), k(0.5, [0, 0, -180], [0, -0.26, 0], 'linear'), k(1, [0, 0, -360], [0, -0.26, 0], 'linear')] },
  };

  // especial: Tamá = Tromba-giro (2 voltas rápidas com entrada e saída); Lili = Cambalhota com cauda aberta
  const especial: Anim = H
    ? {
        frames: 16, loop: false,
        keys: {
          ...curl(),
          spine: [rz(0, -10), rz(0.15, -48), rz(0.85, -48), rz(1, -6)],
          legR_up: [rz(0, 20), rz(0.15, 110), rz(0.85, 110), rz(1, 10)], legL_up: [rz(0, 10), rz(0.15, 104), rz(0.85, 104), rz(1, -10)],
          legR_lo: [rz(0, -40), rz(0.15, -130), rz(0.85, -130), rz(1, -20)], legL_lo: [rz(0, -30), rz(0.15, -126), rz(0.85, -126), rz(1, -20)],
          hips: [k(0, [0, 0, 0], [0, -0.06, 0]), k(0.15, [0, 0, -40], [0, -0.26, 0], 'in'), k(0.5, [0, 0, -400], [0, -0.26, 0], 'linear'), k(0.85, [0, 0, -720], [0, -0.26, 0], 'linear'), k(1, [0, 0, -720], [0, 0, 0], 'out')],
        },
      }
    : {
        frames: 16, loop: false,
        keys: {
          ...curl(),
          hips: [k(0, [0, 0, 0], [0, 0, 0]), k(0.2, [0, 0, -60], [0, 0.1, 0], 'in'), k(0.8, [0, 0, -360], [0, 0.12, 0], 'linear'), k(1, [0, 0, -360], [0, 0, 0], 'out')],
          tail1: [rz(0, 0), rz(0.3, 40), rz(0.8, 40), rz(1, 0)], tail2: [rz(0, 0), rz(0.3, 30), rz(1, 0)], tail3: [rz(0, 0), rz(0.3, 40), rz(1, 0)],
          armR_up: [rz(0, 0), rz(0.2, 160), rz(0.8, 160), rz(1, 20)], armL_up: [rz(0, 0), rz(0.2, 150), rz(0.8, 150), rz(1, 10)],
        },
      };

  const pegar: Anim = {
    frames: 6, loop: false,
    keys: {
      hips: [k(0, [0, 0, 0], [0, 0, 0]), k(0.4, [0, 0, 0], [0, -0.1, 0]), k(1, [0, 0, 0], [0, 0, 0])],
      spine: [rz(0, 0), rz(0.4, -36), rz(1, -4)],
      head: [rz(0, 0), rz(0.4, 16), rz(1, 0)],
      legR_up: [rz(0, 0), rz(0.4, 30), rz(1, 0)], legL_up: [rz(0, 0), rz(0.4, 26), rz(1, 0)],
      legR_lo: [rz(0, 0), rz(0.4, -50), rz(1, 0)], legL_lo: [rz(0, 0), rz(0.4, -46), rz(1, 0)],
      armR_up: [rz(0, 0), rz(0.4, 50), rz(1, 40)], armL_up: [rz(0, 0), rz(0.4, 46), rz(1, 30)],
      armR_lo: [rz(0, 0), rz(0.4, 10), rz(1, 60)], armL_lo: [rz(0, 0), rz(0.4, 10), rz(1, 50)],
    },
  };
  const pegarPesado: Anim = {
    frames: 6, loop: false,
    keys: {
      ...pegar.keys,
      armR_up: [rz(0, 0), rz(0.4, 60), rz(1, 168)], armL_up: [rz(0, 0), rz(0.4, 56), rz(1, 164)],
      armR_lo: [rz(0, 0), rz(0.4, 10), rz(1, 30)], armL_lo: [rz(0, 0), rz(0.4, 10), rz(1, 30)],
      spine: [rz(0, 0), rz(0.4, -36), rz(1, 4)],
    },
  };
  const carregar: Anim = walkCycle(16, 22 * A, 0.025, 2, 0);
  carregar.keys.armR_up = [rz(0, 168), rz(0.5, 164), rz(1, 168)];
  carregar.keys.armL_up = [rz(0, 162), rz(0.5, 166), rz(1, 162)];
  carregar.keys.armR_lo = [rz(0, 30), rz(1, 30)];
  carregar.keys.armL_lo = [rz(0, 30), rz(1, 30)];
  carregar.keys.head = [rz(0, 10), rz(0.5, 6), rz(1, 10)];
  const carregarParado: Anim = { frames: 12, loop: true, keys: { ...idle.keys, armR_up: [rz(0, 168), rz(0.5, 165), rz(1, 168)], armL_up: [rz(0, 162), rz(0.5, 164), rz(1, 162)], armR_lo: [rz(0, 30), rz(1, 30)], armL_lo: [rz(0, 30), rz(1, 30)] } };

  const arremessar: Anim = {
    frames: 8, loop: false,
    keys: {
      spine: [rz(0, 14), rz(0.35, 18), rz(0.6, -26, 'in'), rz(1, -6)],
      chest: [k(0, [0, -20, 0]), k(0.35, [0, -26, 0]), k(0.6, [0, 20, 0], 'in'), k(1, [0, 0, 0])],
      armR_up: [rz(0, 168), rz(0.35, 190), rz(0.6, 60, 'in'), rz(1, 10)],
      armL_up: [rz(0, 162), rz(0.35, 180), rz(0.6, 40, 'in'), rz(1, -10)],
      armR_lo: [rz(0, 30), rz(0.35, 70), rz(0.6, 0), rz(1, 10)], armL_lo: [rz(0, 30), rz(0.35, 60), rz(0.6, 0), rz(1, 10)],
      legR_up: [rz(0, -10), rz(0.6, 30), rz(1, 6)], legL_up: [rz(0, 10), rz(0.6, -20), rz(1, -4)],
      legR_lo: [rz(0, -10), rz(0.6, -20), rz(1, 0)],
      tail1: [rz(0, 10), rz(0.6, -20), rz(1, 0)],
    },
  };
  const arremessarCima: Anim = {
    frames: 8, loop: false,
    keys: {
      hips: [k(0, [0, 0, 0], [0, -0.06, 0]), k(0.5, [0, 0, 0], [0, 0.03, 0], 'out'), k(1, [0, 0, 0], [0, 0, 0])],
      spine: [rz(0, -14), rz(0.5, 10), rz(1, 0)],
      head: [rz(0, 0), rz(0.5, 30), rz(1, 10)],
      armR_up: [rz(0, 120), rz(0.5, 185, 'out'), rz(1, 170)], armL_up: [rz(0, 116), rz(0.5, 180, 'out'), rz(1, 166)],
      armR_lo: [rz(0, 60), rz(0.5, 0), rz(1, 10)], armL_lo: [rz(0, 60), rz(0.5, 0), rz(1, 10)],
      legR_lo: [rz(0, -40), rz(0.5, 0), rz(1, 0)], legL_lo: [rz(0, -36), rz(0.5, 0), rz(1, 0)],
      legR_up: [rz(0, 20), rz(0.5, 0), rz(1, 0)], legL_up: [rz(0, 18), rz(0.5, 0), rz(1, 0)],
    },
  };

  // combo com arma na mão direita (ancora 'hand')
  const golpe1: Anim = {
    frames: 8, loop: false,
    keys: {
      spine: [rz(0, 8), rz(0.3, 14), rz(0.55, -24, 'in'), rz(1, -8)],
      chest: [k(0, [0, -16, 0]), k(0.3, [0, -24, 0]), k(0.55, [0, 18, 0], 'in'), k(1, [0, 4, 0])],
      armR_up: [rz(0, 40), rz(0.3, 170), rz(0.55, 10, 'in'), rz(1, 30)],
      armR_lo: [rz(0, 40), rz(0.3, 60), rz(0.55, 0), rz(1, 30)],
      armL_up: [rz(0, -20), rz(0.55, 40), rz(1, 0)],
      legR_up: [rz(0, 0), rz(0.55, 34), rz(1, 10)], legL_up: [rz(0, 0), rz(0.55, -24), rz(1, -6)],
      legR_lo: [rz(0, 0), rz(0.55, -26), rz(1, -6)],
      head: [rz(0, 0), rz(0.55, -8), rz(1, 0)],
      tail1: [rz(0, 0), rz(0.55, 20), rz(1, 0)],
    },
  };
  const golpe2: Anim = {
    frames: 8, loop: false,
    keys: {
      spine: [rz(0, -8), rz(0.3, -20), rz(0.6, 10, 'in'), rz(1, 0)],
      chest: [k(0, [0, 10, 0]), k(0.3, [0, 20, 0]), k(0.6, [0, -24, 0], 'in'), k(1, [0, 0, 0])],
      armR_up: [rz(0, 20), rz(0.3, -40), rz(0.6, 150, 'in'), rz(1, 50)],
      armR_lo: [rz(0, 30), rz(0.3, 80), rz(0.6, 10), rz(1, 30)],
      armL_up: [rz(0, 10), rz(0.6, -30), rz(1, 0)],
      hips: [k(0, [0, 0, 0], [0, 0, 0]), k(0.3, [0, 0, 0], [0, -0.06, 0]), k(0.6, [0, 0, 0], [0, 0.04, 0]), k(1, [0, 0, 0], [0, 0, 0])],
      legR_up: [rz(0, 10), rz(0.3, 30), rz(0.6, 0), rz(1, 0)], legR_lo: [rz(0, 0), rz(0.3, -50), rz(0.6, 0), rz(1, 0)],
    },
  };
  const golpe3: Anim = {
    frames: 10, loop: false,
    keys: {
      hips: [k(0, [0, 0, 0], [0, -0.06, 0]), k(0.3, [0, 0, 0], [0, 0.22 * A, 0], 'out'), k(0.6, [0, 0, 0], [0, -0.1, 0], 'in', [1.08, 0.9, 1.08]), k(1, [0, 0, 0], [0, 0, 0], 'out', 1)],
      spine: [rz(0, -6), rz(0.3, 16), rz(0.6, -40, 'in'), rz(1, -6)],
      armR_up: [rz(0, 60), rz(0.3, 190), rz(0.6, -10, 'in'), rz(1, 20)], armL_up: [rz(0, 50), rz(0.3, 184), rz(0.6, -16, 'in'), rz(1, 10)],
      armR_lo: [rz(0, 40), rz(0.3, 50), rz(0.6, 0), rz(1, 20)], armL_lo: [rz(0, 40), rz(0.3, 50), rz(0.6, 0), rz(1, 20)],
      legR_up: [rz(0, 20), rz(0.3, 40), rz(0.6, 60), rz(1, 0)], legL_up: [rz(0, 10), rz(0.3, 20), rz(0.6, 50), rz(1, 0)],
      legR_lo: [rz(0, -40), rz(0.3, -80), rz(0.6, -100), rz(1, 0)], legL_lo: [rz(0, -30), rz(0.3, -70), rz(0.6, -96), rz(1, 0)],
      head: [rz(0, 0), rz(0.3, 14), rz(0.6, -10), rz(1, 0)],
      tail1: [rz(0, 0), rz(0.3, -30), rz(0.6, 30), rz(1, 0)],
      earR: [rz(0, 0), rz(0.6, 40), rz(1, 0)], earL: [rz(0, 0), rz(0.6, 40), rz(1, 0)],
    },
  };

  const escalar: Anim = {
    frames: 12, loop: true,
    keys: {
      hips: [k(0, [0, 0, 0], [0.08, 0, 0]), k(0.5, [0, 0, 0], [0.08, 0.05, 0]), k(1, [0, 0, 0], [0.08, 0, 0])],
      spine: [rz(0, 6), rz(1, 6)],
      head: [rz(0, 14), rz(0.5, 10), rz(1, 14)],
      armR_up: [rz(0, 175), rz(0.5, 120), rz(1, 175)], armL_up: [rz(0, 120), rz(0.5, 175), rz(1, 120)],
      armR_lo: [rz(0, 10), rz(0.5, 70), rz(1, 10)], armL_lo: [rz(0, 70), rz(0.5, 10), rz(1, 70)],
      legR_up: [rz(0, 20), rz(0.5, 60), rz(1, 20)], legL_up: [rz(0, 60), rz(0.5, 20), rz(1, 60)],
      legR_lo: [rz(0, -30), rz(0.5, -90), rz(1, -30)], legL_lo: [rz(0, -90), rz(0.5, -30), rz(1, -90)],
      tail1: [rz(0, -40), rz(0.5, -34), rz(1, -40)], tail3: [rz(0, 10), rz(0.5, -10), rz(1, 10)],
    },
  };
  const pendurar: Anim = {
    frames: 12, loop: true,
    keys: {
      hips: [k(0, [0, 0, -4], [0, -0.1, 0]), k(0.5, [0, 0, 4], [0, -0.1, 0]), k(1, [0, 0, -4], [0, -0.1, 0])],
      armR_up: [rz(0, 178), rz(1, 178)], armL_up: [rz(0, 172), rz(1, 172)],
      armR_lo: [rz(0, 0), rz(1, 0)], armL_lo: [rz(0, 4), rz(1, 4)],
      head: [rz(0, 8), rz(0.5, 4), rz(1, 8)],
      legR_up: [rz(0, 10), rz(0.5, -6), rz(1, 10)], legL_up: [rz(0, -6), rz(0.5, 10), rz(1, -6)],
      legR_lo: [rz(0, -14), rz(0.5, -6), rz(1, -14)], legL_lo: [rz(0, -6), rz(0.5, -14), rz(1, -6)],
      tail1: [rz(0, -20), rz(0.5, -14), rz(1, -20)], tail2: [rz(0, -10), rz(0.5, 0), rz(1, -10)], tail3: [rz(0, 10), rz(0.5, -10), rz(1, 10)],
      lidR: blink(0.6), lidL: blink(0.6),
    },
  };
  const nadar: Anim = {
    frames: 16, loop: true,
    keys: {
      hips: [k(0, [0, 0, -70], [0.1, 0.1, 0]), k(0.5, [0, 0, -74], [0.1, 0.13, 0]), k(1, [0, 0, -70], [0.1, 0.1, 0])],
      head: [rz(0, 50), rz(0.5, 44), rz(1, 50)], neck: [rz(0, 20), rz(1, 20)],
      armR_up: [rz(0, 170), rz(0.35, 80), rz(0.6, 20), rz(1, 170)], armL_up: [rz(0, 160), rz(0.4, 70), rz(0.65, 26), rz(1, 160)],
      armR_lo: [rz(0, 10), rz(0.35, 30), rz(0.6, 90), rz(1, 10)], armL_lo: [rz(0, 10), rz(0.4, 30), rz(0.65, 90), rz(1, 10)],
      legR_up: [rz(0, -10), rz(0.25, 30), rz(0.5, -10), rz(0.75, 30), rz(1, -10)], legL_up: [rz(0, 30), rz(0.25, -10), rz(0.5, 30), rz(0.75, -10), rz(1, 30)],
      legR_lo: [rz(0, -20), rz(0.25, -50), rz(0.5, -20), rz(0.75, -50), rz(1, -20)], legL_lo: [rz(0, -50), rz(0.25, -20), rz(0.5, -50), rz(0.75, -20), rz(1, -50)],
      tail1: [rz(0, 30), rz(0.5, 40), rz(1, 30)], tail2: [rz(0, -10), rz(0.5, 10), rz(1, -10)], tail3: [rz(0, -20), rz(0.5, 20), rz(1, -20)],
      earR: [rz(0, -40), rz(1, -40)], earL: [rz(0, -40), rz(1, -40)],
    },
  };
  const dano: Anim = {
    frames: 10, loop: false,
    keys: {
      hips: [k(0, [0, 0, 0], [0, 0, 0]), k(0.2, [0, 0, 14], [-0.12, 0.08, 0], 'out'), k(1, [0, 0, 6], [-0.18, 0.02, 0])],
      spine: [rz(0, 0), rz(0.2, 26), rz(1, 14)],
      head: [rz(0, 0), rz(0.2, 30), rz(0.6, 20), rz(1, 26)],
      armR_up: [rz(0, 0), rz(0.2, 130), rz(0.6, 100), rz(1, 120)], armL_up: [rz(0, 0), rz(0.2, 150), rz(0.6, 170), rz(1, 140)],
      armR_lo: [rz(0, 0), rz(0.2, 60), rz(1, 40)], armL_lo: [rz(0, 0), rz(0.2, 20), rz(1, 50)],
      legR_up: [rz(0, 0), rz(0.2, 40), rz(1, 30)], legL_up: [rz(0, 0), rz(0.2, -20), rz(1, -10)],
      legR_lo: [rz(0, 0), rz(0.2, -40), rz(1, -30)],
      lidR: [k(0, [0, 0, 0]), k(0.2, [-20, 0, 0]), k(1, [-20, 0, 0])], lidL: [k(0, [0, 0, 0]), k(0.2, [-20, 0, 0]), k(1, [-20, 0, 0])],
      earR: [rz(0, 0), rz(0.2, 50), rz(1, 30)], earL: [rz(0, 0), rz(0.2, 50), rz(1, 30)],
      tail1: [rz(0, 0), rz(0.2, 40), rz(1, 20)],
    },
  };
  const morte: Anim = {
    frames: 24, loop: false,
    keys: {
      hips: [k(0, [0, 0, 0], [0, 0, 0]), k(0.25, [0, 0, 30], [0, 0.4, 0], 'out'), k(0.55, [0, 0, 80], [-0.1, 0.1, 0], 'in'), k(0.7, [0, 0, 90], [-0.2, -0.38, 0], 'in'), k(0.8, [0, 0, 88], [-0.22, -0.32, 0], 'out'), k(1, [0, 0, 90], [-0.24, -0.4, 0], 'in')],
      spine: [rz(0, 0), rz(0.25, 20), rz(1, 6)],
      head: [rz(0, 0), rz(0.25, 30), rz(0.8, 10), rz(1, 20)],
      armR_up: [rz(0, 0), rz(0.25, 160), rz(0.7, 120), rz(1, 100)], armL_up: [rz(0, 0), rz(0.25, 150), rz(0.7, 140), rz(1, 120)],
      armR_lo: [rz(0, 0), rz(0.25, 30), rz(1, 10)], armL_lo: [rz(0, 0), rz(0.25, 20), rz(1, 10)],
      legR_up: [rz(0, 0), rz(0.25, 40), rz(1, 10)], legL_up: [rz(0, 0), rz(0.25, 20), rz(1, -6)],
      legR_lo: [rz(0, 0), rz(0.25, -50), rz(1, -10)], legL_lo: [rz(0, 0), rz(0.25, -40), rz(1, -4)],
      lidR: [k(0, [0, 0, 0]), k(0.25, [-20, 0, 0]), k(0.7, [64, 0, 0]), k(1, [64, 0, 0])], lidL: [k(0, [0, 0, 0]), k(0.25, [-20, 0, 0]), k(0.7, [64, 0, 0]), k(1, [64, 0, 0])],
      tail1: [rz(0, 0), rz(0.25, 40), rz(1, 0)],
      '?snout': [rz(0, 0), rz(0.3, 20), rz(1, -10)],
    },
  };
  // mortes cômicas (gag_morte_comica): o jogo aplica filtro escuro no queimado e bolhas S.O.S. no afogado
  const morteQueimado: Anim = {
    frames: 16, loop: false,
    keys: {
      hips: [k(0, [0, 0, 0], [0, 0, 0]), k(0.1, [0, 0, 0], [0, 0.04, 0]), k(0.2, [0, 0, 0], [0, 0, 0]), k(1, [0, 0, 0], [0, 0, 0])],
      spine: [rz(0, 0), rz(0.2, 6), rz(1, 6)],
      armR_up: [rz(0, 0), rz(0.15, 30), rz(1, 30)], armL_up: [rz(0, 0), rz(0.15, -30), rz(1, -30)],
      earR: [rz(0, 0), rz(0.15, 60), rz(1, 60)], earL: [rz(0, 0), rz(0.15, 60), rz(1, 60)],
      lidR: [k(0, [0, 0, 0]), k(0.4, [-30, 0, 0]), k(0.55, [64, 0, 0], 'linear'), k(0.62, [-30, 0, 0], 'linear'), k(0.85, [-30, 0, 0]), k(0.9, [64, 0, 0], 'linear'), k(1, [-30, 0, 0], 'linear')],
      lidL: [k(0, [0, 0, 0]), k(0.4, [-30, 0, 0]), k(0.55, [64, 0, 0], 'linear'), k(0.62, [-30, 0, 0], 'linear'), k(0.85, [-30, 0, 0]), k(0.9, [64, 0, 0], 'linear'), k(1, [-30, 0, 0], 'linear')],
      tail1: [rz(0, 0), rz(0.15, 60), rz(1, 60)], tail2: [rz(0, 0), rz(0.15, 30), rz(1, 30)],
    },
  };
  const morteEsmagado: Anim = {
    frames: 20, loop: false,
    keys: {
      hips: [k(0, [0, 0, 0], [0, 0, 0], undefined, 1), k(0.1, [0, 0, 0], [0, -0.55, 0], 'in', [1.6, 0.12, 1.6]), k(0.6, [0, 0, 0], [0, -0.55, 0], undefined, [1.6, 0.12, 1.6]), k(0.75, [0, 0, 0], [0, -0.3, 0], 'out', [1.2, 0.5, 1.2]), k(0.85, [0, 0, 0], [0, -0.1, 0], 'out', [0.9, 1.15, 0.9]), k(1, [0, 0, 0], [0, 0, 0], 'out', [1, 1, 1])],
      armR_up: [rz(0, 0), rz(0.1, 80), rz(0.75, 80), rz(1, 0)], armL_up: [rz(0, 0), rz(0.1, -80), rz(0.75, -80), rz(1, 0)],
      lidR: [k(0, [0, 0, 0]), k(0.1, [64, 0, 0]), k(0.8, [64, 0, 0]), k(1, [0, 0, 0])], lidL: [k(0, [0, 0, 0]), k(0.1, [64, 0, 0]), k(0.8, [64, 0, 0]), k(1, [0, 0, 0])],
    },
  };
  const morteAfogado: Anim = {
    frames: 24, loop: false,
    keys: {
      hips: [k(0, [0, 0, -70], [0.1, 0.1, 0]), k(0.4, [0, 0, -20], [0, 0.2, 0]), k(1, [0, 0, 10], [0, 0.6, 0], 'out')],
      head: [rz(0, 40), rz(0.4, 20), rz(1, 30)],
      armR_up: [rz(0, 120), rz(0.3, 170), rz(0.6, 140), rz(1, 120)], armL_up: [rz(0, 100), rz(0.3, 150), rz(0.6, 170), rz(1, 130)],
      armR_lo: [rz(0, 20), rz(1, 10)], armL_lo: [rz(0, 20), rz(1, 10)],
      legR_up: [rz(0, 10), rz(0.5, 30), rz(1, 20)], legL_up: [rz(0, -10), rz(0.5, 10), rz(1, 0)],
      lidR: [k(0, [0, 0, 0]), k(0.6, [0, 0, 0]), k(1, [64, 0, 0])], lidL: [k(0, [0, 0, 0]), k(0.6, [0, 0, 0]), k(1, [64, 0, 0])],
    },
  };

  // vitória: Tamá faz pose de fisiculturista e pulinho; Lili gira e bate palmas
  const vitoria: Anim = H
    ? {
        frames: 36, loop: true,
        keys: {
          hips: [k(0, [0, 0, 0], [0, 0, 0]), k(0.2, [0, 0, 0], [0, -0.06, 0]), k(0.3, [0, 0, 0], [0, 0.18, 0], 'out'), k(0.4, [0, 0, 0], [0, 0, 0], 'in'), k(0.7, [0, 0, 0], [0, -0.02, 0]), k(1, [0, 0, 0], [0, 0, 0])],
          spine: [rz(0, 0), rz(0.3, 8), rz(0.45, -4), rz(0.75, -4), rz(1, 0)],
          chest: [k(0, [0, 0, 0], undefined, undefined, 1), k(0.5, [0, 30, 0], undefined, undefined, [1.08, 1.08, 1.08]), k(0.85, [0, 30, 0], undefined, undefined, [1.08, 1.08, 1.08]), k(1, [0, 0, 0], undefined, undefined, 1)],
          armR_up: [rz(0, 0), rz(0.3, 170), rz(0.45, 90), rz(0.85, 90), rz(1, 0)], armL_up: [rz(0, 0), rz(0.3, 160), rz(0.45, 90), rz(0.85, 90), rz(1, 0)],
          armR_lo: [rz(0, 0), rz(0.3, 20), rz(0.45, 120), rz(0.85, 120), rz(1, 0)], armL_lo: [rz(0, 0), rz(0.3, 20), rz(0.45, 120), rz(0.85, 120), rz(1, 0)],
          legR_up: [rz(0, 0), rz(0.2, 20), rz(0.3, -10), rz(0.45, 0), rz(1, 0)], legL_up: [rz(0, 0), rz(0.2, 18), rz(0.3, -6), rz(0.45, 0), rz(1, 0)],
          legR_lo: [rz(0, 0), rz(0.2, -40), rz(0.3, -10), rz(0.45, 0), rz(1, 0)], legL_lo: [rz(0, 0), rz(0.2, -36), rz(0.3, -10), rz(0.45, 0), rz(1, 0)],
          head: [rz(0, 0), rz(0.3, 20), rz(0.5, 10), rz(0.85, 10), rz(1, 0)],
          tail1: [rz(0, 0), rz(0.3, 30), rz(0.5, 10), rz(0.6, 20), rz(0.7, 10), rz(1, 0)],
          tail3: [rz(0, 0), rz(0.5, 20), rz(0.6, -20), rz(0.7, 20), rz(0.8, -20), rz(1, 0)],
          '?snoutTip': [rz(0, 0), rz(0.5, 0), rz(0.6, -20), rz(0.75, -20), rz(0.85, 0), rz(1, 0)],
          lidR: blink(0.9), lidL: blink(0.9),
        },
      }
    : {
        frames: 36, loop: true,
        keys: {
          hips: [k(0, [0, 0, 0], [0, 0, 0]), k(0.15, [0, 0, 0], [0, -0.06, 0]), k(0.3, [0, 0, -180], [0, 0.4, 0], 'out'), k(0.45, [0, 0, -360], [0, 0, 0], 'in'), k(1, [0, 0, -360], [0, 0, 0])],
          armR_up: [rz(0, 0), rz(0.15, -20), rz(0.3, 170), rz(0.5, 80), rz(0.6, 100), rz(0.7, 80), rz(0.8, 100), rz(0.9, 80), rz(1, 0)],
          armL_up: [rz(0, 0), rz(0.15, -20), rz(0.3, 160), rz(0.5, 80), rz(0.6, 100), rz(0.7, 80), rz(0.8, 100), rz(0.9, 80), rz(1, 0)],
          armR_lo: [rz(0, 0), rz(0.5, 60), rz(0.6, 30), rz(0.7, 60), rz(0.8, 30), rz(0.9, 60), rz(1, 0)],
          armL_lo: [rz(0, 0), rz(0.5, 60), rz(0.6, 30), rz(0.7, 60), rz(0.8, 30), rz(0.9, 60), rz(1, 0)],
          legR_up: [rz(0, 0), rz(0.3, 100), rz(0.45, 0), rz(1, 0)], legL_up: [rz(0, 0), rz(0.3, 96), rz(0.45, 0), rz(1, 0)],
          legR_lo: [rz(0, 0), rz(0.3, -120), rz(0.45, 0), rz(1, 0)], legL_lo: [rz(0, 0), rz(0.3, -116), rz(0.45, 0), rz(1, 0)],
          head: [rz(0, 0), rz(0.5, 16), rz(0.9, 16), rz(1, 0)],
          tail1: [rz(0, 0), rz(0.5, 20), rz(0.6, 40), rz(0.7, 20), rz(0.8, 40), rz(1, 0)],
          lidR: blink(0.92), lidL: blink(0.92),
        },
      };

  const troca: Anim = {
    frames: 12, loop: false,
    keys: {
      hips: [k(0, [0, 0, 0], [0, 0, 0]), k(0.3, [0, 0, 0], [0, 0.12, 0], 'out'), k(0.6, [0, 0, 0], [0, 0, 0], 'in'), k(1, [0, 0, 0], [0, 0, 0])],
      armR_up: [rz(0, 0), rz(0.3, 160), rz(0.5, 150), rz(1, 0)], armR_lo: [rz(0, 0), rz(0.3, 10), rz(1, 0)],
      armL_up: [rz(0, 0), rz(0.3, -30), rz(1, 0)],
      head: [rz(0, 0), rz(0.3, 20), rz(1, 0)],
      legR_up: [rz(0, 0), rz(0.3, 20), rz(0.6, 0)], legR_lo: [rz(0, 0), rz(0.3, -40), rz(0.6, 0)],
      tail1: [rz(0, 0), rz(0.3, 30), rz(1, 0)],
      lidR: [k(0, [0, 0, 0]), k(0.3, [30, 0, 0]), k(0.6, [30, 0, 0]), k(1, [0, 0, 0])], lidL: [k(0, [0, 0, 0]), k(0.3, [30, 0, 0]), k(0.6, [30, 0, 0]), k(1, [0, 0, 0])],
    },
  };
  const montar: Anim = {
    frames: 8, loop: false,
    keys: {
      hips: [k(0, [0, 0, 0], [0, 0, 0]), k(0.4, [0, 0, 0], [0, 0.3, 0], 'out'), k(1, [0, 0, 0], [0, -0.12, 0], 'in')],
      legR_up: [rz(0, 0), rz(0.4, 60), rz(1, 70)], legL_up: [rz(0, 0), rz(0.4, 50), rz(1, 64)],
      legR_lo: [rz(0, 0), rz(0.4, -60), rz(1, -90)], legL_lo: [rz(0, 0), rz(0.4, -50), rz(1, -86)],
      armR_up: [rz(0, 0), rz(0.4, 120), rz(1, 40)], armL_up: [rz(0, 0), rz(0.4, 110), rz(1, 36)],
      armR_lo: [rz(0, 0), rz(1, 60)], armL_lo: [rz(0, 0), rz(1, 60)],
      spine: [rz(0, 0), rz(1, -10)],
    },
  };
  const montado: Anim = {
    frames: 8, loop: true,
    keys: {
      hips: [k(0, [0, 0, 0], [0, -0.12, 0]), k(0.5, [0, 0, 0], [0, -0.1, 0]), k(1, [0, 0, 0], [0, -0.12, 0])],
      spine: [rz(0, -14), rz(0.5, -10), rz(1, -14)],
      legR_up: [rz(0, 70), rz(1, 70)], legL_up: [rz(0, 64), rz(1, 64)], legR_lo: [rz(0, -90), rz(1, -90)], legL_lo: [rz(0, -86), rz(1, -86)],
      armR_up: [rz(0, 40), rz(0.5, 46), rz(1, 40)], armL_up: [rz(0, 36), rz(0.5, 42), rz(1, 36)],
      armR_lo: [rz(0, 60), rz(1, 60)], armL_lo: [rz(0, 60), rz(1, 60)],
      tail1: [rz(0, -10), rz(0.5, 0), rz(1, -10)], tail3: [rz(0, 10), rz(0.5, -10), rz(1, 10)],
      earR: [rz(0, -20), rz(1, -20)], earL: [rz(0, -20), rz(1, -20)],
    },
  };
  const agachar: Anim = {
    frames: 4, loop: false,
    keys: {
      hips: [k(0, [0, 0, 0], [0, 0, 0]), k(1, [0, 0, 0], [0, -0.2, 0])],
      spine: [rz(0, 0), rz(1, -28)], head: [rz(0, 0), rz(1, 22)],
      legR_up: [rz(0, 0), rz(1, 60)], legL_up: [rz(0, 0), rz(1, 54)],
      legR_lo: [rz(0, 0), rz(1, -100)], legL_lo: [rz(0, 0), rz(1, -96)],
      footR: [rz(0, 0), rz(1, 40)], footL: [rz(0, 0), rz(1, 40)],
      armR_up: [rz(0, 0), rz(1, 30)], armL_up: [rz(0, 0), rz(1, 26)],
      armR_lo: [rz(0, 0), rz(1, 40)], armL_lo: [rz(0, 0), rz(1, 40)],
      tail1: [rz(0, 0), rz(1, -20)],
    },
  };
  const olharCima: Anim = {
    frames: 4, loop: false,
    keys: { head: [rz(0, 0), rz(1, 30)], neck: [rz(0, 0), rz(1, 14)], spine: [rz(0, 0), rz(1, 8)], '?snout': [rz(0, 0), rz(1, 20)] },
  };
  const batida: Anim = {
    frames: 10, loop: false,
    keys: {
      hips: [k(0, [0, 0, 0], [0, 0, 0]), k(0.3, [0, 0, 0], [0, 0.18, 0], 'out'), k(0.55, [0, 0, 0], [0, -0.16, 0], 'in', [1.1, 0.88, 1.1]), k(1, [0, 0, 0], [0, 0, 0], 'out', 1)],
      spine: [rz(0, 0), rz(0.3, 10), rz(0.55, -50, 'in'), rz(1, 0)],
      armR_up: [rz(0, 0), rz(0.3, 180), rz(0.55, 60, 'in'), rz(1, 0)], armL_up: [rz(0, 0), rz(0.3, 176), rz(0.55, 56, 'in'), rz(1, 0)],
      armR_lo: [rz(0, 0), rz(0.3, 30), rz(0.55, 0), rz(1, 0)], armL_lo: [rz(0, 0), rz(0.3, 30), rz(0.55, 0), rz(1, 0)],
      legR_up: [rz(0, 0), rz(0.55, 50), rz(1, 0)], legL_up: [rz(0, 0), rz(0.55, 44), rz(1, 0)],
      legR_lo: [rz(0, 0), rz(0.55, -90), rz(1, 0)], legL_lo: [rz(0, 0), rz(0.55, -86), rz(1, 0)],
      head: [rz(0, 0), rz(0.3, 20), rz(0.55, -10), rz(1, 0)],
    },
  };
  const planar: Anim = {
    frames: 8, loop: true,
    keys: {
      hips: [k(0, [0, 0, 0], [0, 0.04, 0]), k(0.5, [0, 0, 0], [0, 0.06, 0]), k(1, [0, 0, 0], [0, 0.04, 0])],
      armR_up: [rz(0, 100), rz(0.5, 110), rz(1, 100)], armL_up: [rz(0, 80), rz(0.5, 90), rz(1, 80)],
      legR_up: [rz(0, 20), rz(1, 20)], legL_up: [rz(0, -10), rz(1, -10)], legR_lo: [rz(0, -30), rz(1, -30)],
      tail1: [k(0, [0, 0, 70]), k(1, [0, 0, 70])],
      tail2: [k(0, [0, 0, 0], undefined, 'linear'), k(0.5, [0, 180, 0], undefined, 'linear'), k(1, [0, 360, 0], undefined, 'linear')],
      tail3: [rz(0, 30), rz(1, 30)],
      head: [rz(0, 10), rz(1, 10)],
    },
  };
  const surfar: Anim = {
    frames: 8, loop: true,
    keys: {
      hips: [k(0, [0, 0, 0], [0, -0.12, 0]), k(0.5, [0, 0, 4], [0, -0.1, 0]), k(1, [0, 0, 0], [0, -0.12, 0])],
      spine: [rz(0, -16), rz(0.5, -10), rz(1, -16)],
      legR_up: [rz(0, 50), rz(1, 50)], legL_up: [rz(0, -10), rz(1, -10)], legR_lo: [rz(0, -80), rz(1, -80)], legL_lo: [rz(0, -40), rz(1, -40)],
      armR_up: [rz(0, 80), rz(0.5, 90), rz(1, 80)], armL_up: [rz(0, -60), rz(0.5, -70), rz(1, -60)],
      tail1: [rz(0, 10), rz(0.5, 20), rz(1, 10)],
    },
  };
  const preso: Anim = {
    frames: 8, loop: true,
    keys: {
      armR_up: [rz(0, 6), rz(1, 6)], armL_up: [rz(0, -6), rz(1, -6)], armR_lo: [rz(0, -10), rz(1, -10)], armL_lo: [rz(0, -10), rz(1, -10)],
      legR_up: [rz(0, 20), rz(0.25, -10), rz(0.5, 20), rz(0.75, -10), rz(1, 20)], legL_up: [rz(0, -10), rz(0.25, 20), rz(0.5, -10), rz(0.75, 20), rz(1, -10)],
      legR_lo: [rz(0, -30), rz(0.5, -10), rz(1, -30)], legL_lo: [rz(0, -10), rz(0.5, -30), rz(1, -10)],
      head: [rz(0, -6), rz(0.25, 8), rz(0.5, -6), rz(0.75, 8), rz(1, -6)],
      tail3: [rz(0, -20), rz(0.5, 20), rz(1, -20)],
      lidR: [k(0, [-10, 0, 0]), k(1, [-10, 0, 0])], lidL: [k(0, [-10, 0, 0]), k(1, [-10, 0, 0])],
    },
  };

  // tédio solo + tédios em dupla (gag_tedio)
  const tedio: Anim = {
    frames: 36, loop: false,
    keys: {
      head: [rz(0, 0), rz(0.15, 6), k(0.25, [0, 30, 0]), k(0.4, [0, -30, 0]), k(0.5, [0, 0, 0]), rz(0.65, 36), rz(0.8, 36), rz(1, 0)],
      '?snout': [rz(0, 0), rz(0.6, 0), rz(0.7, 30), rz(0.8, 30), rz(1, 0)],
      armR_up: [rz(0, 0), rz(0.6, 0), rz(0.68, 160), rz(0.85, 160), rz(1, 0)],
      armR_lo: [rz(0, 0), rz(0.6, 0), rz(0.68, 100), rz(0.72, 120), rz(0.76, 100), rz(0.8, 120), rz(0.85, 100), rz(1, 0)],
      footR: [rz(0, 0), rz(0.1, 20), rz(0.15, 0), rz(0.2, 20), rz(0.25, 0), rz(0.3, 20), rz(0.35, 0), rz(1, 0)],
      chest: [k(0, [0, 0, 0], undefined, undefined, 1), k(0.65, [0, 0, 0], undefined, undefined, [1.04, 1.06, 1.04]), k(0.8, [0, 0, 0], undefined, undefined, [1.04, 1.06, 1.04]), k(1, [0, 0, 0], undefined, undefined, 1)],
      lidR: [k(0, [0, 0, 0]), k(0.65, [0, 0, 0]), k(0.7, [50, 0, 0]), k(0.82, [50, 0, 0]), k(0.9, [0, 0, 0]), k(1, [0, 0, 0])],
      lidL: [k(0, [0, 0, 0]), k(0.65, [0, 0, 0]), k(0.7, [50, 0, 0]), k(0.82, [50, 0, 0]), k(0.9, [0, 0, 0]), k(1, [0, 0, 0])],
      tail3: [rz(0, 0), rz(0.3, 20), rz(0.5, -10), rz(1, 0)],
    },
  };
  // pedra-papel-tesoura: 3 balanços do punho e revelação
  const tedioJokenpo: Anim = {
    frames: 24, loop: false,
    keys: {
      armR_up: [rz(0, 0), rz(0.1, 70), rz(0.2, 40), rz(0.3, 70), rz(0.4, 40), rz(0.5, 70), rz(0.6, 50), rz(1, 50)],
      armR_lo: [rz(0, 0), rz(0.1, 60), rz(0.2, 30), rz(0.3, 60), rz(0.4, 30), rz(0.5, 60), rz(0.6, 30), rz(1, 30)],
      handR: [k(0, [0, 0, 0], undefined, undefined, 1), k(0.6, [0, 0, 0], undefined, undefined, 1), k(0.65, [0, 0, 0], undefined, undefined, [1.25, 1.25, 1.25]), k(1, [0, 0, 0], undefined, undefined, [1.25, 1.25, 1.25])],
      head: [rz(0, 0), rz(0.6, -8), rz(0.7, 6), rz(1, 6)],
      chest: [k(0, [0, 0, 0]), k(0.6, [0, 14, 0]), k(1, [0, 14, 0])],
    },
  };
  // Lili coloca folha no focinho / Tamá espirra
  const tedioFolha: Anim = H
    ? {
        frames: 24, loop: false,
        keys: {
          head: [rz(0, 0), rz(0.4, 0), rz(0.6, 34, 'in'), rz(0.7, -30, 'in'), rz(0.85, -10), rz(1, 0)],
          '?snout': [rz(0, 0), rz(0.6, 20), rz(0.7, -30, 'in'), rz(1, 0)],
          spine: [rz(0, 0), rz(0.6, 14), rz(0.7, -24, 'in'), rz(1, 0)],
          chest: [k(0, [0, 0, 0], undefined, undefined, 1), k(0.6, [0, 0, 0], undefined, undefined, [1.08, 1.1, 1.08]), k(0.7, [0, 0, 0], undefined, undefined, [0.94, 0.94, 0.94]), k(1, [0, 0, 0], undefined, undefined, 1)],
          lidR: [k(0, [0, 0, 0]), k(0.55, [40, 0, 0]), k(0.7, [64, 0, 0]), k(0.9, [0, 0, 0])], lidL: [k(0, [0, 0, 0]), k(0.55, [40, 0, 0]), k(0.7, [64, 0, 0]), k(0.9, [0, 0, 0])],
          earR: [rz(0, 0), rz(0.7, 50), rz(1, 0)], earL: [rz(0, 0), rz(0.7, 50), rz(1, 0)],
        },
      }
    : {
        frames: 24, loop: false,
        keys: {
          hips: [k(0, [0, 0, 0], [0, 0, 0]), k(0.2, [0, 0, 0], [0, 0.04, 0]), k(0.5, [0, 0, 0], [0, 0.04, 0]), k(0.6, [0, 0, 0], [0, 0, 0])],
          armR_up: [rz(0, 0), rz(0.2, 100), rz(0.5, 100), rz(0.6, 20), rz(1, 0)],
          armR_lo: [rz(0, 0), rz(0.2, 10), rz(0.5, 10), rz(1, 0)],
          head: [rz(0, 0), rz(0.2, 10), rz(0.7, 10), rz(0.8, -10), rz(1, 0)],
          tail1: [rz(0, 0), rz(0.7, 30), rz(0.8, 10), rz(0.9, 30), rz(1, 0)],
          chest: [k(0, [0, 0, 0]), k(0.7, [0, 0, 0]), k(0.75, [0, 0, -4]), k(0.8, [0, 0, 4]), k(0.85, [0, 0, -4]), k(0.9, [0, 0, 4]), k(1, [0, 0, 0])],
        },
      };
  // Tamá come formigas e arrota / Lili tampa o nariz
  const tedioArroto: Anim = H
    ? {
        frames: 30, loop: false,
        keys: {
          spine: [rz(0, 0), rz(0.2, -40), rz(0.5, -40), rz(0.65, 6), rz(0.8, 10), rz(1, 0)],
          head: [rz(0, 0), rz(0.2, -20), rz(0.5, -20), rz(0.65, 20), rz(0.8, 30), rz(1, 0)],
          '?snoutTip': [rz(0, 0), rz(0.25, -10), rz(0.3, 10), rz(0.35, -10), rz(0.4, 10), rz(0.45, -10), rz(0.5, 0), rz(1, 0)],
          hips: [k(0, [0, 0, 0], [0, 0, 0]), k(0.2, [0, 0, 0], [0, -0.08, 0]), k(0.5, [0, 0, 0], [0, -0.08, 0]), k(0.65, [0, 0, 0], [0, 0, 0])],
          legR_up: [rz(0, 0), rz(0.2, 30), rz(0.5, 30), rz(0.65, 0)], legL_up: [rz(0, 0), rz(0.2, 26), rz(0.5, 26), rz(0.65, 0)],
          legR_lo: [rz(0, 0), rz(0.2, -50), rz(0.5, -50), rz(0.65, 0)], legL_lo: [rz(0, 0), rz(0.2, -46), rz(0.5, -46), rz(0.65, 0)],
          chest: [k(0, [0, 0, 0], undefined, undefined, 1), k(0.65, [0, 0, 0], undefined, undefined, [1, 1, 1]), k(0.72, [0, 0, 0], undefined, undefined, [1.12, 1.12, 1.12]), k(0.8, [0, 0, 0], undefined, undefined, [0.96, 0.96, 0.96]), k(1, [0, 0, 0], undefined, undefined, 1)],
          armR_up: [rz(0, 0), rz(0.65, 0), rz(0.75, 30), rz(1, 0)], armR_lo: [rz(0, 0), rz(0.65, 0), rz(0.75, 120), rz(1, 0)],
          lidR: [k(0, [0, 0, 0]), k(0.7, [0, 0, 0]), k(0.75, [50, 0, 0]), k(0.9, [50, 0, 0]), k(1, [0, 0, 0])], lidL: [k(0, [0, 0, 0]), k(0.7, [0, 0, 0]), k(0.75, [50, 0, 0]), k(0.9, [50, 0, 0]), k(1, [0, 0, 0])],
        },
      }
    : {
        frames: 30, loop: false,
        keys: {
          armR_up: [rz(0, 0), rz(0.65, 0), rz(0.75, 120), rz(0.95, 120), rz(1, 0)], armR_lo: [rz(0, 0), rz(0.65, 0), rz(0.75, 110), rz(0.95, 110), rz(1, 0)],
          armL_up: [rz(0, 0), rz(0.7, 0), rz(0.75, 40), rz(0.8, 50), rz(0.85, 40), rz(0.9, 50), rz(1, 0)],
          head: [rz(0, 0), rz(0.65, 0), rz(0.72, -14), rz(0.95, -14), rz(1, 0)],
          spine: [rz(0, 0), rz(0.65, 0), rz(0.72, 12), rz(0.95, 12), rz(1, 0)],
          tail1: [rz(0, 0), rz(0.65, 0), rz(0.72, 50), rz(0.95, 50), rz(1, 0)],
          lidR: [k(0, [0, 0, 0]), k(0.7, [0, 0, 0]), k(0.75, [55, 0, 0]), k(0.95, [55, 0, 0]), k(1, [0, 0, 0])], lidL: [k(0, [0, 0, 0]), k(0.7, [0, 0, 0]), k(0.75, [55, 0, 0]), k(0.95, [55, 0, 0]), k(1, [0, 0, 0])],
        },
      };

  return {
    idle, tedio, 'tedio-jokenpo': tedioJokenpo, 'tedio-folha': tedioFolha, 'tedio-arroto': tedioArroto,
    andar, correr, pulo, apice, queda, aterrissar, rolar, especial,
    pegar, 'pegar-pesado': pegarPesado, carregar, 'carregar-parado': carregarParado, arremessar, 'arremessar-cima': arremessarCima,
    golpe1, golpe2, golpe3, escalar, pendurar, nadar, dano, morte,
    'morte-queimado': morteQueimado, 'morte-esmagado': morteEsmagado, 'morte-afogado': morteAfogado,
    vitoria, troca, montar, montado, agachar, 'olhar-cima': olharCima, batida, planar, surfar, preso,
  };
}

/** Lista das animações obrigatórias de herói (verify). */
export const HERO_ANIMS = Object.keys(bipedAnims('heavy'));
