/**
 * Animações da tropa de javalis (Javalim, Escudeiro, Javalão). Keyframes escritos à mão.
 * Convenções iguais às dos heróis: braço/perna +Z = frente; canela -Z dobra o joelho;
 * coluna -Z inclina para a frente; quadril +Z tomba para trás.
 */
import type { Anim, AnimSet, Key } from '../../render/anim';
import { k, rz, rx, ry, ps, sc, blink, lidHold, SHOW, shown, anim } from './common';

/** heavy = 1 (javalim) .. 1.6 (javalão): deixa tudo mais lento e pesado. */
export function boarAnims(heavy = 1): AnimSet {
  const H = heavy;
  const slow = (n: number) => Math.round(n * (0.75 + H * 0.25));

  /* ---------------- base ---------------- */
  const idle = anim(slow(24), true, {
    hips: [ps(0, [0, 0, 0]), ps(0.5, [0, -0.012, 0]), ps(1, [0, 0, 0])],
    spine: [k(0, [0, 0, 0], undefined, undefined, 1), k(0.5, [0, 0, 1], undefined, undefined, [1.03, 1.02, 1.03]), k(1, [0, 0, 0], undefined, undefined, 1)],
    chest: [rz(0, 0), rz(0.5, 2), rz(1, 0)],
    head: [rz(0, 0), rz(0.25, 4), rz(0.35, 2), rz(0.45, 5), rz(0.6, 0), rz(1, 0)],
    snout: [rz(0, 0), rz(0.25, 6), rz(0.3, 2), rz(0.35, 7), rz(0.4, 2), rz(0.45, 6), rz(0.55, 0), rz(1, 0)],
    armR_up: [rz(0, 0), rz(0.5, 3), rz(1, 0)], armL_up: [rz(0, 0), rz(0.5, -3), rz(1, 0)],
    armR_lo: [rz(0, 0), rz(0.5, 4), rz(1, 0)], armL_lo: [rz(0, 0), rz(0.5, 4), rz(1, 0)],
    earR: [rx(0, 0), rx(0.7, 0), rx(0.75, 20), rx(0.82, 0), rx(1, 0)], earL: [rz(0, 0), rz(0.5, 5), rz(1, 0)],
    tail1: [ry(0, -20), ry(0.5, 20), ry(1, -20)],
    lidR: blink(0.8), lidL: blink(0.8),
  });

  const walk = (frames: number, amp: number, bob: number, lean: number, armAmp: number): Anim => anim(frames, true, {
    hips: [k(0, [0, 0, 0], [0, 0, 0], 'linear'), k(0.25, [6, 0, 0], [0, bob, 0], 'out'), k(0.5, [0, 0, 0], [0, 0, 0], 'in'), k(0.75, [-6, 0, 0], [0, bob, 0], 'out'), k(1, [0, 0, 0], [0, 0, 0], 'in')],
    spine: [k(0, [0, 0, lean]), k(0.25, [-4, 0, lean - 2]), k(0.5, [0, 0, lean]), k(0.75, [4, 0, lean - 2]), k(1, [0, 0, lean])],
    chest: [k(0, [0, 8, 0]), k(0.5, [0, -8, 0]), k(1, [0, 8, 0])],
    head: [rz(0, -lean * 0.6), rz(0.25, -lean * 0.6 + 4), rz(0.5, -lean * 0.6), rz(0.75, -lean * 0.6 + 4), rz(1, -lean * 0.6)],
    helmet: [rz(0, 0), rz(0.3, -3), rz(0.5, 0), rz(0.8, -3), rz(1, 0)],
    legR_up: [rz(0, amp), rz(0.5, -amp), rz(1, amp)],
    legL_up: [rz(0, -amp), rz(0.5, amp), rz(1, -amp)],
    legR_lo: [rz(0, -6), rz(0.25, -10), rz(0.5, -16), rz(0.75, -amp * 2), rz(1, -6)],
    legL_lo: [rz(0, -16), rz(0.25, -amp * 2), rz(0.5, -6), rz(0.75, -10), rz(1, -16)],
    footR: [rz(0, 10), rz(0.5, -12), rz(0.75, 6), rz(1, 10)],
    footL: [rz(0, -12), rz(0.25, 6), rz(0.5, 10), rz(1, -12)],
    armR_up: [rz(0, -armAmp), rz(0.5, armAmp), rz(1, -armAmp)],
    armL_up: [rz(0, armAmp), rz(0.5, -armAmp), rz(1, armAmp)],
    armR_lo: [rz(0, 10), rz(0.5, 40), rz(1, 10)],
    armL_lo: [rz(0, 40), rz(0.5, 10), rz(1, 40)],
    earR: [rz(0, 6), rz(0.5, -6), rz(1, 6)], earL: [rz(0, 6), rz(0.5, -6), rz(1, 6)],
    tail1: [ry(0, -30), ry(0.5, 30), ry(1, -30)],
    lidR: blink(0.55), lidL: blink(0.55),
  });
  const andar = walk(16, 28 / Math.sqrt(H), 0.03, -4, 30 / Math.sqrt(H));

  // ataque: recua, raspa o pé e dá uma investida de presas
  const ataque = anim(slow(14), false, {
    hips: [k(0, [0, 0, 0], [0, 0, 0]), k(0.3, [0, 0, 8], [-0.08, -0.04, 0]), k(0.55, [0, 0, -16], [0.22, 0.02, 0], 'in'), k(0.7, [0, 0, -18], [0.26, 0, 0], 'out'), k(1, [0, 0, 0], [0, 0, 0])],
    spine: [rz(0, 0), rz(0.3, 12), rz(0.55, -26, 'in'), rz(1, 0)],
    chest: [rz(0, 0), rz(0.3, 6), rz(0.55, -10), rz(1, 0)],
    head: [rz(0, 0), rz(0.3, 18), rz(0.55, -26, 'in'), rz(0.7, -30), rz(1, 0)],
    jaw: [rz(0, 0), rz(0.3, -14), rz(0.55, -22), rz(0.75, -8), rz(1, 0)],
    snout: [rz(0, 0), rz(0.3, 10), rz(0.55, -6), rz(1, 0)],
    armR_up: [rz(0, 0), rz(0.3, 40), rz(0.55, -50, 'in'), rz(1, 0)], armL_up: [rz(0, 0), rz(0.3, 30), rz(0.55, -40, 'in'), rz(1, 0)],
    armR_lo: [rz(0, 0), rz(0.3, 60), rz(0.55, 20), rz(1, 0)], armL_lo: [rz(0, 0), rz(0.3, 60), rz(0.55, 20), rz(1, 0)],
    legR_up: [rz(0, 0), rz(0.15, 20), rz(0.22, 6), rz(0.3, 22), rz(0.55, -20), rz(1, 0)], legL_up: [rz(0, 0), rz(0.3, -10), rz(0.55, 40), rz(1, 0)],
    legR_lo: [rz(0, 0), rz(0.15, -30), rz(0.22, -10), rz(0.3, -30), rz(0.55, -10), rz(1, 0)], legL_lo: [rz(0, 0), rz(0.3, -10), rz(0.55, -40), rz(1, 0)],
    browR: [ps(0, [0, 0, 0]), ps(0.3, [0, -0.02, 0]), ps(1, [0, 0, 0])], browL: [ps(0, [0, 0, 0]), ps(0.3, [0, -0.02, 0]), ps(1, [0, 0, 0])],
    lidR: [rx(0, 0), rx(0.3, 18), rx(0.7, 18), rx(1, 0)], lidL: [rx(0, 0), rx(0.3, 18), rx(0.7, 18), rx(1, 0)],
    tail1: [ry(0, 0), ry(0.3, 50), ry(0.55, -50), ry(1, 0)],
    earR: [rz(0, 0), rz(0.55, -40), rz(1, 0)], earL: [rz(0, 0), rz(0.55, -40), rz(1, 0)],
  });

  const dano = anim(10, false, {
    hips: [k(0, [0, 0, 0], [0, 0, 0]), k(0.2, [0, 0, 16], [-0.12, 0.06, 0], 'out'), k(1, [0, 0, 6], [-0.16, 0, 0])],
    spine: [rz(0, 0), rz(0.2, 18), rz(1, 8)],
    head: [rz(0, 0), rz(0.2, 26), rz(0.6, 14), rz(1, 18)],
    helmet: [k(0, [0, 0, 0], [0, 0, 0]), k(0.2, [0, 0, 24], [-0.02, 0.1, 0], 'out'), k(0.5, [0, 0, -8], [0, 0.02, 0], 'in'), k(0.7, [0, 0, 6], [0, 0.03, 0]), k(1, [0, 0, -12], [0, 0, 0], 'bounce')],
    jaw: [rz(0, 0), rz(0.2, -24), rz(1, -14)],
    armR_up: [rz(0, 0), rz(0.2, 110), rz(1, 80)], armL_up: [rz(0, 0), rz(0.2, 130), rz(1, 100)],
    armR_lo: [rz(0, 0), rz(0.2, 50), rz(1, 30)], armL_lo: [rz(0, 0), rz(0.2, 30), rz(1, 40)],
    legR_up: [rz(0, 0), rz(0.2, 34), rz(1, 20)], legL_up: [rz(0, 0), rz(0.2, -16), rz(1, -6)],
    legR_lo: [rz(0, 0), rz(0.2, -30), rz(1, -20)],
    lidR: [rx(0, 0), rx(0.15, 60), rx(1, 50)], lidL: [rx(0, 0), rx(0.15, 60), rx(1, 50)],
    earR: [rz(0, 0), rz(0.2, 50), rz(1, 30)], earL: [rz(0, 0), rz(0.2, 50), rz(1, 30)],
    tail1: [ry(0, 0), ry(0.2, 80), ry(1, 40)],
  });

  // morte: pula de susto, gira, cai de costas; o capacete quica e tampa a cara
  const morte = anim(24, false, {
    hips: [k(0, [0, 0, 0], [0, 0, 0]), k(0.22, [0, 0, 30], [-0.05, 0.42, 0], 'out'), k(0.5, [0, 0, 80], [-0.15, 0.1, 0], 'in'), k(0.62, [0, 0, 92], [-0.24, -0.16, 0], 'in'), k(0.72, [0, 0, 86], [-0.26, -0.1, 0], 'out'), k(0.82, [0, 0, 92], [-0.28, -0.16, 0], 'in'), k(1, [0, 0, 92], [-0.28, -0.16, 0])],
    spine: [rz(0, 0), rz(0.22, 16), rz(1, 4)],
    head: [rz(0, 0), rz(0.22, 30), rz(0.62, 10), rz(0.72, 24), rz(1, 14)],
    helmet: [k(0, [0, 0, 0], [0, 0, 0]), k(0.22, [0, 0, 40], [-0.02, 0.24, 0], 'out'), k(0.62, [0, 0, -60], [0.05, 0.1, 0], 'in'), k(0.75, [0, 0, -84], [0.12, 0.0, 0], 'out'), k(1, [0, 0, -96], [0.16, -0.04, 0], 'bounce')],
    jaw: [rz(0, 0), rz(0.22, -30), rz(0.62, -10), rz(1, -20)],
    armR_up: [rz(0, 0), rz(0.22, 160), rz(0.62, 120), rz(1, 100)], armL_up: [rz(0, 0), rz(0.22, 150), rz(0.62, 140), rz(1, 110)],
    armR_lo: [rz(0, 0), rz(0.22, 30), rz(1, 10)], armL_lo: [rz(0, 0), rz(0.22, 20), rz(1, 10)],
    legR_up: [rz(0, 0), rz(0.22, 40), rz(0.62, 60), rz(0.72, 80), rz(1, 70)], legL_up: [rz(0, 0), rz(0.22, -20), rz(0.62, 50), rz(0.72, 70), rz(1, 60)],
    legR_lo: [rz(0, 0), rz(0.22, -40), rz(1, -20)], legL_lo: [rz(0, 0), rz(0.22, -10), rz(1, -30)],
    footR: [rz(0, 0), rz(0.8, 0), rz(0.85, 20), rz(0.9, -10), rz(1, 10)],
    lidR: [rx(0, 0), rx(0.1, -30), rx(0.5, -30), rx(0.62, 75), rx(1, 75)], lidL: [rx(0, 0), rx(0.1, -30), rx(0.5, -30), rx(0.62, 75), rx(1, 75)],
    tail1: [ry(0, 0), ry(0.22, 90), ry(1, 0)],
    '?tongue': [sc(0, 1), sc(0.62, 1), sc(0.8, [1.6, 1, 1]), sc(1, [1.6, 1, 1])],
  });

  // tonto: cabeça girando em círculos, corpo cambaleando, língua de fora
  const tontoN = 16;
  const tontoKeys = (amp: number, ph: number, n = 8): Key[] => Array.from({ length: n + 1 }, (_, i) => rz(i / n, amp * Math.sin((i / n + ph) * Math.PI * 2), 'linear'));
  const tontoX = (amp: number, ph: number, n = 8): Key[] => Array.from({ length: n + 1 }, (_, i) => rx(i / n, amp * Math.sin((i / n + ph) * Math.PI * 2), 'linear'));
  const tonto = anim(tontoN, true, {
    hips: Array.from({ length: 9 }, (_, i) => k(i / 8, [6 * Math.sin((i / 8) * Math.PI * 2), 0, 4 * Math.cos((i / 8) * Math.PI * 2)], [0, -0.03, 0], 'linear')),
    spine: tontoKeys(6, 0.25),
    head: Array.from({ length: 9 }, (_, i) => k(i / 8, [14 * Math.sin((i / 8) * Math.PI * 2), 0, 10 + 12 * Math.cos((i / 8) * Math.PI * 2)], undefined, 'linear')),
    helmet: tontoX(10, 0.4),
    jaw: [rz(0, -16), rz(1, -16)],
    '?tongue': [sc(0, [1.8, 1, 1]), sc(1, [1.8, 1, 1])],
    armR_up: tontoKeys(12, 0.1, 8).map((x) => ({ ...x, r: [0, 0, (x.r?.[2] ?? 0) + 14] as [number, number, number] })),
    armL_up: tontoKeys(12, 0.6, 8).map((x) => ({ ...x, r: [0, 0, (x.r?.[2] ?? 0) + 8] as [number, number, number] })),
    armR_lo: [rz(0, -10), rz(1, -10)], armL_lo: [rz(0, -10), rz(1, -10)],
    legR_up: [rz(0, 6), rz(0.5, -4), rz(1, 6)], legL_up: [rz(0, -4), rz(0.5, 6), rz(1, -4)],
    legR_lo: [rz(0, -10), rz(1, -10)], legL_lo: [rz(0, -10), rz(1, -10)],
    lidR: lidHold(40), lidL: lidHold(20),
    earR: tontoKeys(20, 0), earL: tontoKeys(20, 0.5),
    tail1: [ry(0, 0), ry(0.5, 60), ry(1, 0)],
  });

  /* ---------------- gags (Javalim) ---------------- */
  // susto: pula de susto (pés no ar, braços pra cima) e cai sentado
  const susto = anim(18, false, {
    hips: [k(0, [0, 0, 0], [0, 0, 0]), k(0.1, [0, 0, 0], [0, -0.05, 0]), k(0.32, [0, 0, 10], [-0.04, 0.42, 0], 'out'), k(0.55, [0, 0, 18], [-0.08, 0.06, 0], 'in'), k(0.62, [0, 0, 22], [-0.08, -0.26, 0], 'in', [1.08, 0.92, 1.08]), k(0.72, [0, 0, 18], [-0.08, -0.2, 0], 'out', 1), k(0.82, [0, 0, 20], [-0.08, -0.26, 0], 'in'), k(1, [0, 0, 18], [-0.08, -0.25, 0])],
    spine: [rz(0, 0), rz(0.32, 12), rz(0.62, -6), rz(1, 0)],
    head: [rz(0, 0), rz(0.1, -6), rz(0.32, 20), rz(0.62, -10), rz(0.75, 6), rz(1, 0)],
    helmet: [k(0, [0, 0, 0], [0, 0, 0]), k(0.32, [0, 0, 30], [0, 0.22, 0], 'out'), k(0.62, [0, 0, -10], [0, 0.04, 0], 'in'), k(0.72, [0, 0, 10], [0, 0.01, 0]), k(1, [0, 0, -22], [0.01, -0.01, 0], 'bounce')],
    jaw: [rz(0, 0), rz(0.15, -34), rz(0.6, -30), rz(0.75, -10), rz(1, -12)],
    armR_up: [rz(0, 0), rz(0.32, 170), rz(0.62, 60), rz(0.8, 30), rz(1, -30)], armL_up: [rz(0, 0), rz(0.32, 160), rz(0.62, 60), rz(1, -30)],
    armR_lo: [rz(0, 0), rz(0.32, 10), rz(0.62, 40), rz(1, 10)], armL_lo: [rz(0, 0), rz(0.32, 10), rz(1, 10)],
    legR_up: [rz(0, 0), rz(0.32, 30), rz(0.62, 86), rz(1, 80)], legL_up: [rz(0, 0), rz(0.32, -10), rz(0.62, 80), rz(1, 74)],
    legR_lo: [rz(0, 0), rz(0.32, -60), rz(0.62, -14), rz(1, -20)], legL_lo: [rz(0, 0), rz(0.32, -20), rz(0.62, -10), rz(1, -24)],
    footR: [rz(0, 0), rz(0.62, 20), rz(1, 10)], footL: [rz(0, 0), rz(0.62, 20), rz(1, 10)],
    lidR: [rx(0, 0), rx(0.1, -40), rx(0.6, -40), rx(0.65, 60), rx(0.75, 0), rx(1, 10)], lidL: [rx(0, 0), rx(0.1, -40), rx(0.6, -40), rx(0.65, 60), rx(0.75, 0), rx(1, 10)],
    browR: [ps(0, [0, 0, 0]), ps(0.1, [0, 0.04, 0]), ps(0.6, [0, 0.04, 0]), ps(1, [0, 0.01, 0])], browL: [ps(0, [0, 0, 0]), ps(0.1, [0, 0.04, 0]), ps(0.6, [0, 0.04, 0]), ps(1, [0, 0.01, 0])],
    earR: [rz(0, 0), rz(0.32, -50), rz(0.62, 40), rz(1, 10)], earL: [rz(0, 0), rz(0.32, -50), rz(0.62, 40), rz(1, 10)],
    tail1: [ry(0, 0), ry(0.32, 90), ry(1, 0)],
  });

  // selfie: de costas para o herói, celular erguido, fazendo caras
  const selfie = anim(32, true, {
    root: [ry(0, 34), ry(1, 34)],
    hips: [k(0, [0, 0, 0], [0, 0, 0]), k(0.25, [0, 0, 0], [0, -0.012, 0]), k(0.5, [0, 0, 0], [0, 0, 0]), k(0.75, [0, 0, 0], [0, -0.012, 0]), k(1, [0, 0, 0], [0, 0, 0])],
    spine: [k(0, [0, 0, 6]), k(0.45, [8, 0, 8]), k(0.55, [-6, 0, 6]), k(1, [0, 0, 6])],
    head: [k(0, [12, 0, 14]), k(0.45, [16, 0, 18]), k(0.5, [-12, 0, 10], undefined, 'step'), k(0.95, [-14, 0, 12]), k(1, [12, 0, 14], undefined, 'step')],
    snout: [rz(0, 14), rz(0.5, 14), rz(0.52, 22), rz(0.95, 22), rz(1, 14)],
    jaw: [rz(0, 0), rz(0.5, 0), rz(0.52, -16), rz(0.95, -16), rz(1, 0)],
    armR_up: [k(0, [0, 0, 128]), k(0.5, [0, 0, 132]), k(0.55, [0, 0, 136]), k(1, [0, 0, 128])],
    armR_lo: [rz(0, 14), rz(0.5, 16), rz(1, 14)],
    phone: [sc(0, SHOW), sc(1, SHOW)],
    // braço de longe fazendo "V" / joinha
    armL_up: [rz(0, 120), rz(0.45, 124), rz(0.5, 40), rz(0.95, 44), rz(1, 120)],
    armL_lo: [rz(0, 70), rz(0.45, 74), rz(0.5, 90), rz(0.95, 90), rz(1, 70)],
    legR_up: [rz(0, 0), rz(0.5, 0), rz(0.55, 10), rz(1, 0)], legR_lo: [rz(0, 0), rz(0.5, 0), rz(0.55, -20), rz(1, 0)],
    lidR: [rx(0, 0), rx(0.5, 0), rx(0.52, 70), rx(0.95, 70), rx(1, 0)], lidL: [rx(0, 0), rx(0.5, 0), rx(0.52, -10), rx(0.95, -10), rx(1, 0)],
    tail1: [ry(0, -30), ry(0.5, 30), ry(1, -30)],
  });

  // cair: despencando do penhasco, debatendo braços e pernas e gritando
  const cair = anim(8, true, {
    hips: [k(0, [0, 0, 20], [0, 0.1, 0]), k(0.5, [0, 0, 26], [0, 0.12, 0]), k(1, [0, 0, 20], [0, 0.1, 0])],
    spine: [rz(0, 10), rz(1, 10)],
    head: [rz(0, 30), rz(0.5, 22), rz(1, 30)],
    helmet: [k(0, [0, 0, 20], [0, 0.12, 0]), k(0.5, [0, 0, 32], [0, 0.16, 0]), k(1, [0, 0, 20], [0, 0.12, 0])],
    jaw: [rz(0, -36), rz(0.5, -28), rz(1, -36)],
    '?tongue': [sc(0, [1.4, 1, 1]), sc(0.5, [1, 1, 1]), sc(1, [1.4, 1, 1])],
    armR_up: [rz(0, 170), rz(0.5, 120), rz(1, 170)], armL_up: [rz(0, 120), rz(0.5, 170), rz(1, 120)],
    armR_lo: [rz(0, 20), rz(0.5, 60), rz(1, 20)], armL_lo: [rz(0, 60), rz(0.5, 20), rz(1, 60)],
    legR_up: [rz(0, 40), rz(0.5, -10), rz(1, 40)], legL_up: [rz(0, -10), rz(0.5, 40), rz(1, -10)],
    legR_lo: [rz(0, -60), rz(0.5, -10), rz(1, -60)], legL_lo: [rz(0, -10), rz(0.5, -60), rz(1, -10)],
    lidR: lidHold(-40), lidL: lidHold(-40),
    browR: [ps(0, [0, 0.045, 0]), ps(1, [0, 0.045, 0])], browL: [ps(0, [0, 0.045, 0]), ps(1, [0, 0.045, 0])],
    earR: [rz(0, -60), rz(0.5, -40), rz(1, -60)], earL: [rz(0, -40), rz(0.5, -60), rz(1, -40)],
    tail1: [ry(0, 0), ry(0.5, 180), ry(1, 360)],
  });

  // sentado (dominó / remar): quadril baixo, pernas para a frente
  const seated = (): Record<string, Key[]> => ({
    hips: [ps(0, [0, -0.2, 0]), ps(1, [0, -0.2, 0])],
    legR_up: [rz(0, 84), rz(1, 84)], legL_up: [rz(0, 80), rz(1, 80)],
    legR_lo: [rz(0, -80), rz(1, -80)], legL_lo: [rz(0, -76), rz(1, -76)],
    footR: [rz(0, 0), rz(1, 0)], footL: [rz(0, 0), rz(1, 0)],
  });
  // dominó: sentado, peça na mão, bate na mesa com força ("lá e lô!")
  const domino = anim(32, true, {
    ...seated(),
    spine: [rz(0, -10), rz(0.5, -10), rz(0.6, -22, 'in'), rz(0.75, -12), rz(1, -10)],
    head: [rz(0, 10), rz(0.3, 16), rz(0.45, 10), rz(0.6, -6), rz(0.8, 6), rz(1, 10)],
    domino: shown(),
    armR_up: [k(0, [0, 0, 40]), k(0.45, [0, 0, 70]), k(0.52, [0, 0, 110], undefined, 'out'), k(0.6, [0, 0, 40], undefined, 'in'), k(0.8, [0, 0, 40]), k(1, [0, 0, 40])],
    armR_lo: [rz(0, 70), rz(0.45, 80), rz(0.52, 90), rz(0.6, 20, 'in'), rz(0.8, 50), rz(1, 70)],
    armL_up: [rz(0, 50), rz(1, 50)], armL_lo: [rz(0, 70), rz(0.3, 76), rz(0.6, 70), rz(1, 70)],
    browR: [ps(0, [0, -0.015, 0]), ps(1, [0, -0.015, 0])], browL: [ps(0, [0, -0.015, 0]), ps(1, [0, -0.015, 0])],
    lidR: [rx(0, 25), rx(0.5, 25), rx(0.55, -20), rx(0.8, -20), rx(0.9, 25), rx(1, 25)], lidL: [rx(0, 25), rx(0.5, 25), rx(0.55, -20), rx(0.8, -20), rx(0.9, 25), rx(1, 25)],
    jaw: [rz(0, 0), rz(0.55, 0), rz(0.6, -20), rz(0.8, -10), rz(1, 0)],
    tail1: [ry(0, 0), ry(0.6, 0), ry(0.7, 60), ry(1, 0)],
  });

  // dançar: rebolado com braços alternados no ar (no compasso do Morcego DJ)
  const dancar = anim(16, true, {
    hips: [k(0, [0, 0, 0], [0, 0, 0], 'out'), k(0.25, [14, 0, 0], [0, -0.05, 0.03], 'in'), k(0.5, [0, 0, 0], [0, 0, 0], 'out'), k(0.75, [-14, 0, 0], [0, -0.05, -0.03], 'in'), k(1, [0, 0, 0], [0, 0, 0], 'out')],
    spine: [k(0, [0, 0, 0]), k(0.25, [-18, 0, 0]), k(0.5, [0, 0, 0]), k(0.75, [18, 0, 0]), k(1, [0, 0, 0])],
    head: [k(0, [0, 0, -6]), k(0.25, [10, 0, 6]), k(0.5, [0, 0, -6]), k(0.75, [-10, 0, 6]), k(1, [0, 0, -6])],
    armR_up: [rz(0, 170), rz(0.25, 150), rz(0.5, 30), rz(0.75, 40), rz(1, 170)], armL_up: [rz(0, 30), rz(0.25, 40), rz(0.5, 170), rz(0.75, 150), rz(1, 30)],
    armR_lo: [rz(0, 20), rz(0.5, 90), rz(1, 20)], armL_lo: [rz(0, 90), rz(0.5, 20), rz(1, 90)],
    legR_up: [rz(0, 0), rz(0.25, 24), rz(0.5, 0), rz(1, 0)], legL_up: [rz(0, 0), rz(0.5, 0), rz(0.75, 24), rz(1, 0)],
    legR_lo: [rz(0, 0), rz(0.25, -40), rz(0.5, 0), rz(1, 0)], legL_lo: [rz(0, 0), rz(0.5, 0), rz(0.75, -40), rz(1, 0)],
    lidR: lidHold(40), lidL: lidHold(40),
    jaw: [rz(0, -6), rz(1, -6)],
    tail1: [ry(0, -60), ry(0.5, 60), ry(1, -60)],
    earR: [rz(0, 10), rz(0.5, -10), rz(1, 10)], earL: [rz(0, -10), rz(0.5, 10), rz(1, -10)],
  });

  // correr-banheiro: passinhos rápidos de joelhos juntos, segurando a barriga, suando
  const banheiro = walk(10, 20, 0.04, -14, 0);
  Object.assign(banheiro.keys, {
    armR_up: [rz(0, 30), rz(0.5, 34), rz(1, 30)], armL_up: [rz(0, 34), rz(0.5, 30), rz(1, 34)],
    armR_lo: [rz(0, 90), rz(1, 90)], armL_lo: [rz(0, 90), rz(1, 90)],
    legR_up: [k(0, [12, 0, 20]), k(0.5, [12, 0, -14]), k(1, [12, 0, 20])], legL_up: [k(0, [-12, 0, -14]), k(0.5, [-12, 0, 20]), k(1, [-12, 0, -14])],
    lidR: lidHold(55), lidL: lidHold(55),
    browR: [ps(0, [0, 0.03, 0]), ps(1, [0, 0.03, 0])], browL: [ps(0, [0, 0.03, 0]), ps(1, [0, 0.03, 0])],
    jaw: [rz(0, -8), rz(0.5, -14), rz(1, -8)],
    sweat: [k(0, [0, 0, 0], [0, 0, 0], 'linear', SHOW), k(1, [0, 0, 0], [0.02, -0.06, 0], 'linear', SHOW)],
    spine: [k(0, [0, 0, -14], undefined, undefined, [1, 1, 1]), k(0.5, [0, 0, -16], undefined, undefined, [1.04, 0.98, 1.04]), k(1, [0, 0, -14], undefined, undefined, [1, 1, 1])],
  });

  // ir-embora: fim de expediente, anda de costas para a câmera balançando a marmita
  const embora = walk(16, 22, 0.025, 2, 18);
  Object.assign(embora.keys, {
    root: [ry(0, 62), ry(1, 62)],
    lunch: shown(),
    armR_up: [rz(0, 20), rz(0.5, -14), rz(1, 20)], armR_lo: [rz(0, 6), rz(1, 6)],
    armL_up: [k(0, [30, 0, 160]), k(0.25, [30, 0, 150]), k(0.5, [30, 0, 160]), k(0.75, [30, 0, 150]), k(1, [30, 0, 160])],
    armL_lo: [k(0, [0, 0, 20]), k(0.25, [0, 0, 50]), k(0.5, [0, 0, 20]), k(0.75, [0, 0, 50]), k(1, [0, 0, 20])],
    head: [rz(0, 8), rz(0.5, 4), rz(1, 8)],
    lidR: lidHold(40), lidL: lidHold(40),
  });

  // pegar-arma: abaixa, agarra e levanta empunhando
  const pegarArma = anim(10, false, {
    hips: [ps(0, [0, 0, 0]), ps(0.4, [0, -0.1, 0]), ps(1, [0, 0, 0])],
    spine: [rz(0, 0), rz(0.4, -34), rz(1, -2)],
    head: [rz(0, 0), rz(0.4, 18), rz(1, -6)],
    legR_up: [rz(0, 0), rz(0.4, 34), rz(1, 0)], legL_up: [rz(0, 0), rz(0.4, 28), rz(1, 0)],
    legR_lo: [rz(0, 0), rz(0.4, -56), rz(1, 0)], legL_lo: [rz(0, 0), rz(0.4, -50), rz(1, 0)],
    armR_up: [rz(0, 0), rz(0.4, 56), rz(0.7, 70), rz(1, 50)], armR_lo: [rz(0, 0), rz(0.4, 10), rz(1, 60)],
    armL_up: [rz(0, 0), rz(0.4, 40), rz(1, 10)], armL_lo: [rz(0, 0), rz(0.4, 10), rz(1, 20)],
    browR: [ps(0, [0, 0, 0]), ps(1, [0, -0.02, 0])], browL: [ps(0, [0, 0, 0]), ps(1, [0, -0.02, 0])],
    jaw: [rz(0, 0), rz(0.7, 0), rz(1, -10)],
  });
  // ataque-arma: ergue a arma acima da cabeça e desce com tudo
  const ataqueArma = anim(12, false, {
    hips: [k(0, [0, 0, 0], [0, 0, 0]), k(0.35, [0, 0, 4], [-0.03, 0.02, 0]), k(0.55, [0, 0, -6], [0.08, -0.04, 0], 'in'), k(1, [0, 0, 0], [0, 0, 0])],
    spine: [rz(0, 0), rz(0.35, 14), rz(0.55, -30, 'in'), rz(0.7, -32), rz(1, 0)],
    chest: [k(0, [0, 0, 0]), k(0.35, [0, -20, 0]), k(0.55, [0, 16, 0], undefined, 'in'), k(1, [0, 0, 0])],
    head: [rz(0, 0), rz(0.35, 10), rz(0.55, -10), rz(1, 0)],
    jaw: [rz(0, 0), rz(0.35, -20), rz(0.55, -26), rz(1, 0)],
    armR_up: [rz(0, 40), rz(0.35, 190), rz(0.55, 30, 'in'), rz(0.7, 20), rz(1, 40)],
    armR_lo: [rz(0, 50), rz(0.35, 40), rz(0.55, 0), rz(1, 50)],
    armL_up: [rz(0, 0), rz(0.35, -20), rz(0.55, 30), rz(1, 0)],
    legR_up: [rz(0, 0), rz(0.55, 30), rz(1, 0)], legR_lo: [rz(0, 0), rz(0.55, -26), rz(1, 0)],
    legL_up: [rz(0, 0), rz(0.55, -16), rz(1, 0)],
    lidR: [rx(0, 0), rx(0.5, 30), rx(0.7, 30), rx(1, 0)], lidL: [rx(0, 0), rx(0.5, 30), rx(0.7, 30), rx(1, 0)],
    tail1: [ry(0, 0), ry(0.55, 60), ry(1, 0)],
  });
  // remar: sentado na canoa, remadas largas alternando lados
  const remar = anim(16, true, {
    ...seated(),
    hips: [ps(0, [0, -0.24, 0]), ps(1, [0, -0.24, 0])],
    paddle: shown(),
    spine: [k(0, [0, 20, -16]), k(0.4, [0, -10, 4], undefined, 'inOut'), k(0.6, [0, -14, 6]), k(1, [0, 20, -16], undefined, 'inOut')],
    chest: [k(0, [0, 14, 0]), k(0.4, [0, -14, 0]), k(1, [0, 14, 0])],
    head: [rz(0, 4), rz(0.4, -4), rz(1, 4)],
    armR_up: [k(0, [0, 0, 70]), k(0.4, [0, 0, 10]), k(0.6, [0, 0, 0]), k(1, [0, 0, 70])],
    armR_lo: [rz(0, 30), rz(0.4, 50), rz(1, 30)],
    armL_up: [k(0, [0, 0, 100]), k(0.4, [0, 0, 60]), k(1, [0, 0, 100])],
    armL_lo: [rz(0, 60), rz(0.4, 70), rz(1, 60)],
    jaw: [rz(0, 0), rz(0.35, -10), rz(0.5, -14), rz(0.7, 0), rz(1, 0)],
    lidR: lidHold(14), lidL: lidHold(14),
    browR: [ps(0, [0, -0.015, 0]), ps(1, [0, -0.015, 0])], browL: [ps(0, [0, -0.015, 0]), ps(1, [0, -0.015, 0])],
  });
  // desarmado: a arma voa da mão; ele olha a mão vazia, depois coça a cabeça
  const desarmado = anim(20, false, {
    hips: [k(0, [0, 0, 0], [0, 0, 0]), k(0.12, [0, 0, 10], [-0.06, 0.03, 0], 'out'), k(0.4, [0, 0, 0], [0, 0, 0]), k(1, [0, 0, 0], [0, 0, 0])],
    spine: [rz(0, 0), rz(0.12, 12), rz(0.4, -4), rz(1, 0)],
    armR_up: [rz(0, 40), rz(0.12, 150, 'out'), rz(0.4, 60), rz(0.7, 150), rz(0.8, 160), rz(0.9, 150), rz(1, 160)],
    armR_lo: [rz(0, 50), rz(0.12, 10), rz(0.4, 90), rz(0.7, 120), rz(0.8, 130), rz(0.9, 120), rz(1, 130)],
    head: [rz(0, 0), rz(0.12, 20), rz(0.4, -24), rz(0.65, -24), rz(0.75, 6), rz(1, 6)],
    jaw: [rz(0, 0), rz(0.12, -26), rz(0.65, -26), rz(0.75, -4), rz(1, -4)],
    lidR: [rx(0, 0), rx(0.12, -40), rx(0.65, -40), rx(0.75, 30), rx(1, 30)], lidL: [rx(0, 0), rx(0.12, -40), rx(0.65, -40), rx(0.75, 30), rx(1, 30)],
    browR: [ps(0, [0, 0, 0]), ps(0.12, [0, 0.045, 0]), ps(0.65, [0, 0.045, 0]), ps(0.75, [0, 0, 0]), ps(1, [0, 0, 0])], browL: [ps(0, [0, 0, 0]), ps(0.12, [0, 0.045, 0]), ps(0.65, [0, 0.045, 0]), ps(0.75, [0, 0.02, 0]), ps(1, [0, 0.02, 0])],
    earR: [rz(0, 0), rz(0.12, -40), rz(0.4, 30), rz(1, 30)],
    tail1: [ry(0, 0), ry(0.12, 90), ry(0.5, -60), ry(1, -60)],
  });

  // pisão (Javalão): ergue a perna e bate no chão fazendo tremer
  const pisao = anim(slow(16), false, {
    hips: [k(0, [0, 0, 0], [0, 0, 0]), k(0.4, [0, 0, 8], [-0.04, 0.06, 0], 'out'), k(0.55, [0, 0, -4], [0.02, -0.06, 0], 'in', [1.04, 0.95, 1.04]), k(0.7, [0, 0, 0], [0, -0.02, 0], 'out', 1), k(1, [0, 0, 0], [0, 0, 0])],
    spine: [rz(0, 0), rz(0.4, 10), rz(0.55, -16, 'in'), rz(1, 0)],
    head: [rz(0, 0), rz(0.4, 14), rz(0.55, -14), rz(0.65, 4), rz(1, 0)],
    jaw: [rz(0, 0), rz(0.4, -24), rz(0.6, -30), rz(1, 0)],
    helmet: [k(0, [0, 0, 0], [0, 0, 0]), k(0.55, [0, 0, 0], [0, 0, 0]), k(0.62, [0, 0, -6], [0, 0.05, 0]), k(0.8, [0, 0, 0], [0, 0, 0], 'bounce')],
    legR_up: [rz(0, 0), rz(0.4, 80), rz(0.55, 4, 'in'), rz(1, 0)], legR_lo: [rz(0, 0), rz(0.4, -90), rz(0.55, -6, 'in'), rz(1, 0)],
    footR: [rz(0, 0), rz(0.4, -10), rz(0.55, 0), rz(1, 0)],
    legL_lo: [rz(0, 0), rz(0.55, -20), rz(1, 0)], legL_up: [rz(0, 0), rz(0.55, 14), rz(1, 0)],
    armR_up: [rz(0, 0), rz(0.4, 100), rz(0.55, -30, 'in'), rz(1, 0)], armL_up: [rz(0, 0), rz(0.4, 90), rz(0.55, -30, 'in'), rz(1, 0)],
    armR_lo: [rz(0, 0), rz(0.4, 60), rz(0.55, 30), rz(1, 0)], armL_lo: [rz(0, 0), rz(0.4, 60), rz(0.55, 30), rz(1, 0)],
    lidR: [rx(0, 0), rx(0.4, 30), rx(0.6, 30), rx(1, 0)], lidL: [rx(0, 0), rx(0.4, 30), rx(0.6, 30), rx(1, 0)],
    browR: [ps(0, [0, 0, 0]), ps(0.4, [0, -0.02, 0]), ps(1, [0, 0, 0])], browL: [ps(0, [0, 0, 0]), ps(0.4, [0, -0.02, 0]), ps(1, [0, 0, 0])],
  });

  return {
    idle, andar, ataque, dano, morte, tonto,
    susto, selfie, cair, domino, dancar, 'correr-banheiro': banheiro, 'ir-embora': embora,
    'pegar-arma': pegarArma, 'ataque-arma': ataqueArma, remar, desarmado, pisao,
  };
}

/** Escolhe um subconjunto de animações pelo nome. */
export function pick(set: AnimSet, names: string[]): AnimSet {
  const out: AnimSet = {};
  for (const n of names) out[n] = set[n];
  return out;
}
