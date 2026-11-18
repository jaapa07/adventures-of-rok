/**
 * Animações das montarias (keyframes escritos à mão).
 * Todas: idle, andar, ataque, pulo, dano, desmontar.
 *  - pirarucu: + nadar, investida
 *  - ema: + correr, chute
 *  - tatu: + rolar, cavar
 * A âncora `sela` fica no osso do corpo de cada montaria, então acompanha cada quadro.
 * Convenção: olhando para +X; rotação +Z levanta a parte da frente (nariz para cima).
 */
import type { Anim, AnimSet, Key, Ease } from '../render/anim';
import type { V3 } from '../render/sculpt';

const k = (t: number, r?: V3, p?: V3, e?: Ease, s?: V3 | number): Key => ({ t, r, p, e, s });
const rz = (t: number, z: number, e?: Ease): Key => ({ t, r: [0, 0, z], e });
const ry = (t: number, y: number, e?: Ease): Key => ({ t, r: [0, y, 0], e });
const rx = (t: number, x: number, e?: Ease): Key => ({ t, r: [x, 0, 0], e });
const blink = (t0: number, close = 64): Key[] => [k(0, [0, 0, 0]), k(t0, [0, 0, 0]), k(t0 + 0.04, [close, 0, 0], undefined, 'linear'), k(t0 + 0.09, [0, 0, 0], undefined, 'linear'), k(1, [0, 0, 0])];
const shut = (a: number, b: number, close = 60): Key[] => [k(0, [0, 0, 0]), k(a, [close, 0, 0], undefined, 'out'), k(b, [close, 0, 0]), k(1, [0, 0, 0])];

/* ================================================================== */
/* PIRARUCU: body, head, jaw, tail1, tail2, tailFin, pecR, pecL,       */
/*           dorsal, anal, lidR, lidL                                  */
/* ================================================================== */
export function pirarucuAnims(): AnimSet {
  /** onda de nado: cauda varre de lado (Y) com leve ondulação vertical (Z) */
  const swim = (frames: number, amp: number, bob: number): Anim => ({
    frames, loop: true,
    keys: {
      body: [k(0, [0, amp * 0.12, 1], [0, 0, 0]), k(0.25, [0, 0, -1], [0, bob, 0]), k(0.5, [0, -amp * 0.12, 1], [0, 0, 0]), k(0.75, [0, 0, -1], [0, bob, 0]), k(1, [0, amp * 0.12, 1], [0, 0, 0])],
      head: [k(0, [0, -amp * 0.15, 0]), k(0.5, [0, amp * 0.15, 0]), k(1, [0, -amp * 0.15, 0])],
      tail1: [k(0, [0, -amp * 0.5, 2]), k(0.25, [0, 0, -2]), k(0.5, [0, amp * 0.5, 2]), k(0.75, [0, 0, -2]), k(1, [0, -amp * 0.5, 2])],
      tail2: [k(0, [0, -amp * 0.4, 3]), k(0.3, [0, amp * 0.2, -3]), k(0.55, [0, amp * 0.4, 3]), k(0.8, [0, -amp * 0.2, -3]), k(1, [0, -amp * 0.4, 3])],
      tailFin: [k(0, [0, -amp * 0.6, 4]), k(0.35, [0, amp * 0.5, -4]), k(0.6, [0, amp * 0.6, 4]), k(0.85, [0, -amp * 0.5, -4]), k(1, [0, -amp * 0.6, 4])],
      pecR: [rx(0, 0), rx(0.25, 30), rx(0.5, 0), rx(0.75, 30), rx(1, 0)],
      pecL: [rx(0, 0), rx(0.25, -30), rx(0.5, 0), rx(0.75, -30), rx(1, 0)],
      dorsal: [ry(0, amp * 0.2), ry(0.5, -amp * 0.2), ry(1, amp * 0.2)],
      anal: [ry(0, amp * 0.2), ry(0.5, -amp * 0.2), ry(1, amp * 0.2)],
    },
  });
  const idle = swim(24, 22, 0.03);
  idle.keys.jaw = [rz(0, 0), rz(0.55, 0), rz(0.65, -12), rz(0.8, -2), rz(1, 0)];
  idle.keys.lidR = blink(0.4);
  idle.keys.lidL = blink(0.4);
  const nadar = swim(16, 44, 0.05);
  nadar.keys.jaw = [rz(0, 0), rz(0.5, -5), rz(1, 0)];

  return {
    idle,
    nadar,
    // fora d'água: avança em pulinhos de barriga, batendo a cauda no chão
    andar: {
      frames: 16, loop: true,
      keys: {
        body: [k(0, [0, 0, 0], [0, 0, 0]), k(0.2, [0, 0, -6], [0, 0, 0], 'in'), k(0.45, [0, 0, 8], [0, 0.16, 0], 'out'), k(0.75, [0, 0, -4], [0, 0.02, 0], 'in'), k(0.85, [0, 0, 1], [0, 0, 0]), k(1, [0, 0, 0], [0, 0, 0])],
        head: [rz(0, 0), rz(0.45, 6), rz(0.8, -6), rz(1, 0)],
        jaw: [rz(0, 0), rz(0.45, -18), rz(0.8, 0), rz(1, 0)],
        tail1: [rz(0, 0), rz(0.2, 16), rz(0.45, -16), rz(0.75, 12), rz(1, 0)],
        tail2: [rz(0, 0), rz(0.25, 18), rz(0.5, -18), rz(0.8, 10), rz(1, 0)],
        tailFin: [rz(0, 0), rz(0.3, 22), rz(0.55, -24), rz(0.85, 10), rz(1, 0)],
        pecR: [rx(0, 0), rx(0.45, 40), rx(1, 0)], pecL: [rx(0, 0), rx(0.45, -40), rx(1, 0)],
      },
    },
    // mordida: avança e abre a boca enorme
    ataque: {
      frames: 10, loop: false,
      keys: {
        body: [k(0, [0, 0, 0], [0, 0, 0]), k(0.25, [0, 0, 6], [-0.08, 0, 0], 'out'), k(0.5, [0, 0, -4], [0.22, 0, 0], 'out'), k(0.7, [0, 0, -2], [0.2, 0, 0]), k(1, [0, 0, 0], [0, 0, 0])],
        head: [rz(0, 0), rz(0.25, 10), rz(0.5, -6), rz(1, 0)],
        jaw: [rz(0, 0), rz(0.25, -38, 'out'), rz(0.45, -40), rz(0.55, 0, 'in'), rz(1, 0)],
        tail1: [rz(0, 0), ry(0.25, 30), ry(0.5, -20), rz(1, 0)],
        tailFin: [rz(0, 0), ry(0.3, 40), ry(0.55, -30), rz(1, 0)],
        pecR: [rx(0, 0), rx(0.3, 50), rx(1, 0)], pecL: [rx(0, 0), rx(0.3, -50), rx(1, 0)],
      },
    },
    // investida: recua enrolando a cauda e dispara como um torpedo
    investida: {
      frames: 14, loop: false,
      keys: {
        body: [k(0, [0, 0, 0], [0, 0, 0], undefined, 1), k(0.25, [0, 0, 4], [-0.18, 0, 0], 'out', [0.94, 1.05, 1.05]), k(0.45, [0, 0, -2], [0.4, 0, 0], 'out', [1.12, 0.92, 0.92]), k(0.75, [0, 0, 0], [0.3, 0, 0], undefined, [1.04, 0.98, 0.98]), k(1, [0, 0, 0], [0, 0, 0], undefined, 1)],
        head: [rz(0, 0), rz(0.25, 8), rz(0.45, -4), rz(1, 0)],
        jaw: [rz(0, 0), rz(0.25, 0), rz(0.4, -14), rz(0.75, -10), rz(1, 0)],
        tail1: [k(0, [0, 0, 0]), k(0.25, [0, 50, 0]), k(0.45, [0, -20, 0], undefined, 'out'), k(0.6, [0, 10, 0]), k(1, [0, 0, 0])],
        tail2: [k(0, [0, 0, 0]), k(0.25, [0, 40, 0]), k(0.45, [0, -30, 0], undefined, 'out'), k(0.65, [0, 10, 0]), k(1, [0, 0, 0])],
        tailFin: [k(0, [0, 0, 0]), k(0.25, [0, 40, 0]), k(0.45, [0, -40, 0], undefined, 'out'), k(0.7, [0, 10, 0]), k(1, [0, 0, 0])],
        pecR: [rx(0, 0), rx(0.25, 30), rx(0.45, -60), rx(0.8, -50), rx(1, 0)],
        pecL: [rx(0, 0), rx(0.25, -30), rx(0.45, 60), rx(0.8, 50), rx(1, 0)],
        dorsal: [rz(0, 0), rz(0.45, -15), rz(1, 0)], anal: [rz(0, 0), rz(0.45, 15), rz(1, 0)],
        lidR: shut(0.4, 0.7, 35), lidL: shut(0.4, 0.7, 35),
      },
    },
    // salto para fora d'água: nariz para cima, arco e mergulho de nariz para baixo
    pulo: {
      frames: 10, loop: false,
      keys: {
        body: [k(0, [0, 0, 0], [0, 0, 0]), k(0.2, [0, 0, -8], [0, -0.06, 0]), k(0.5, [0, 0, 26], [0, 0.4, 0], 'out'), k(0.8, [0, 0, -10], [0, 0.46, 0]), k(1, [0, 0, -24], [0, 0.36, 0], 'in')],
        tail1: [rz(0, 0), rz(0.2, 18), rz(0.5, -26), rz(0.8, -6), rz(1, 14)],
        tail2: [rz(0, 0), rz(0.2, 20), rz(0.5, -22), rz(0.8, 6), rz(1, 18)],
        tailFin: [rz(0, 0), rz(0.25, 24), rz(0.5, -30), rz(0.8, 10), rz(1, 22)],
        jaw: [rz(0, 0), rz(0.5, -10), rz(1, -4)],
        pecR: [rx(0, 0), rx(0.5, -70), rx(1, -50)], pecL: [rx(0, 0), rx(0.5, 70), rx(1, 50)],
      },
    },
    dano: {
      frames: 10, loop: false,
      keys: {
        body: [k(0, [0, 0, 0], [0, 0, 0]), k(0.15, [0, 0, 12], [-0.14, 0.04, 0], 'out'), k(0.3, [0, 0, -6], [-0.1, 0, 0]), k(0.45, [0, 0, 5], [-0.08, 0, 0]), k(0.6, [0, 0, -3], [-0.05, 0, 0]), k(1, [0, 0, 0], [0, 0, 0])],
        head: [rz(0, 0), rz(0.15, 10), rz(0.3, -6), rz(1, 0)],
        jaw: [rz(0, 0), rz(0.15, -30, 'out'), rz(0.6, -20), rz(1, 0)],
        tail1: [rz(0, 0), rz(0.15, -20), rz(0.3, 14), rz(0.45, -8), rz(1, 0)],
        tailFin: [rz(0, 0), rz(0.2, -30), rz(0.35, 20), rz(0.5, -10), rz(1, 0)],
        pecR: [rx(0, 0), rx(0.15, 70), rx(1, 0)], pecL: [rx(0, 0), rx(0.15, -70), rx(1, 0)],
        lidR: shut(0.12, 0.6), lidL: shut(0.12, 0.6),
      },
    },
    // desmontar: chicoteia a cauda e dá um "coice" de barriga, arremessando a herói
    desmontar: {
      frames: 14, loop: false,
      keys: {
        body: [k(0, [0, 0, 0], [0, 0, 0]), k(0.2, [0, 0, -14], [0, -0.04, 0], 'in'), k(0.4, [0, 0, 30], [0, 0.22, 0], 'out'), k(0.6, [0, 0, -12], [0, 0.05, 0]), k(0.75, [0, 0, 6], [0, 0, 0]), k(1, [0, 0, 0], [0, 0, 0])],
        head: [rz(0, 0), rz(0.4, 12), rz(0.6, -8), rz(1, 0)],
        jaw: [rz(0, 0), rz(0.4, -24), rz(0.65, 0), rz(1, 0)],
        tail1: [rz(0, 0), rz(0.2, 30), rz(0.4, -36, 'out'), rz(0.6, 14), rz(1, 0)],
        tail2: [rz(0, 0), rz(0.2, 26), rz(0.4, -30, 'out'), rz(0.6, 12), rz(1, 0)],
        tailFin: [rz(0, 0), rz(0.2, 30), rz(0.45, -36, 'out'), rz(0.65, 14), rz(1, 0)],
        pecR: [rx(0, 0), rx(0.4, 60), rx(1, 0)], pecL: [rx(0, 0), rx(0.4, -60), rx(1, 0)],
        lidR: shut(0.35, 0.55, 40), lidL: shut(0.35, 0.55, 40),
      },
    },
  };
}

/* ================================================================== */
/* EMA: hips, neck1, neck1b, neck1c, neck2, neck2b, neck2c, head, jaw,  */
/*      wingR, wingL, plume,                                           */
/*      legR_up, legR_lo, footR, legL_up, legL_lo, footL, lidR, lidL   */
/* ================================================================== */
/** Reparte a rotação escrita para um osso por uma cadeia de vértebras (a dobra vira curva, não cotovelo). */
function spreadChain(set: AnimSet, src: string, chain: [string, number][]): AnimSet {
  for (const a of Object.values(set)) {
    const keys = a.keys[src];
    if (!keys) continue;
    for (const [bone, w] of chain) a.keys[bone] = keys.map((q) => ({ ...q, r: q.r ? [q.r[0] * w, q.r[1] * w, q.r[2] * w] as V3 : undefined }));
  }
  return set;
}

export function emaAnims(): AnimSet {
  const stride = (frames: number, amp: number, knee: number, bob: number, lean: number, neckF: number, wing: number): Anim => ({
    frames, loop: true,
    keys: {
      hips: [k(0, [0, 0, lean], [0, 0, 0]), k(0.25, [0, 0, lean + 2], [0, bob, 0], 'out'), k(0.5, [0, 0, lean], [0, 0, 0], 'in'), k(0.75, [0, 0, lean + 2], [0, bob, 0], 'out'), k(1, [0, 0, lean], [0, 0, 0], 'in')],
      // pescoço "pombo": avança e recua a cada passo (o humor da ema)
      neck1: [rz(0, -neckF), rz(0.25, -neckF - 10), rz(0.5, -neckF), rz(0.75, -neckF - 10), rz(1, -neckF)],
      neck2: [rz(0, 0), rz(0.25, 12), rz(0.5, 0), rz(0.75, 12), rz(1, 0)],
      head: [k(0, [0, 0, neckF * 0.8], [0.04, 0, 0]), k(0.25, [0, 0, neckF * 0.8 - 4], [-0.04, 0, 0]), k(0.5, [0, 0, neckF * 0.8], [0.04, 0, 0]), k(0.75, [0, 0, neckF * 0.8 - 4], [-0.04, 0, 0]), k(1, [0, 0, neckF * 0.8], [0.04, 0, 0])],
      legR_up: [rz(0, amp), rz(0.5, -amp), rz(1, amp)],
      legL_up: [rz(0, -amp), rz(0.5, amp), rz(1, -amp)],
      legR_lo: [rz(0, -4), rz(0.5, 0), rz(0.7, -knee), rz(1, -4)],
      legL_lo: [rz(0, 0), rz(0.2, -knee), rz(0.5, -4), rz(1, 0)],
      footR: [rz(0, -10), rz(0.5, 20), rz(0.75, 40), rz(1, -10)],
      footL: [rz(0, 20), rz(0.25, 40), rz(0.5, -10), rz(1, 20)],
      wingR: [rx(0, wing), rx(0.5, wing * 0.4), rx(1, wing)],
      wingL: [rx(0, -wing), rx(0.5, -wing * 0.4), rx(1, -wing)],
      plume: [rz(0, 4), rz(0.25, -6), rz(0.5, 4), rz(0.75, -6), rz(1, 4)],
    },
  });
  const andar = stride(16, 24, 50, 0.04, 0, 6, 6);
  const correr = stride(10, 42, 80, 0.09, -12, 36, 40);
  const set: AnimSet = {
    idle: {
      frames: 24, loop: true,
      keys: {
        hips: [k(0, [0, 0, 0], [0, 0, 0], undefined, 1), k(0.5, [0, 0, 1], [0, -0.012, 0], undefined, [1.02, 1.03, 1.02]), k(1, [0, 0, 0], [0, 0, 0], undefined, 1)],
        neck1: [rz(0, 0), rz(0.3, 4), rz(0.6, -3), rz(1, 0)],
        neck2: [rz(0, 0), rz(0.3, -6), rz(0.6, 5), rz(1, 0)],
        // olha para os lados de um jeito abobalhado (giro rápido de cabeça)
        head: [k(0, [0, 0, 0]), k(0.35, [0, 0, 0]), k(0.4, [0, 0, 18], undefined, 'out'), k(0.6, [0, 0, 18]), k(0.65, [0, 0, -6], undefined, 'out'), k(0.9, [0, 0, -6]), k(1, [0, 0, 0])],
        jaw: [rz(0, 0), rz(0.7, 0), rz(0.75, -10), rz(0.8, 0), rz(1, 0)],
        plume: [rz(0, 0), rz(0.5, 5), rz(1, 0)],
        wingR: [rx(0, 0), rx(0.5, 5), rx(1, 0)], wingL: [rx(0, 0), rx(0.5, -5), rx(1, 0)],
        lidR: blink(0.2), lidL: blink(0.22),
      },
    },
    andar,
    correr,
    // bicada: o pescoço desce como um martelo
    ataque: {
      frames: 10, loop: false,
      keys: {
        hips: [rz(0, 0), rz(0.3, 6), rz(0.5, -10), rz(1, 0)],
        neck1: [rz(0, 0), rz(0.3, 18, 'out'), rz(0.5, -60, 'in'), rz(0.7, -55), rz(1, 0)],
        neck2: [rz(0, 0), rz(0.3, 10), rz(0.5, -20), rz(0.7, -18), rz(1, 0)],
        head: [rz(0, 0), rz(0.3, 10), rz(0.5, 10), rz(1, 0)],
        jaw: [rz(0, 0), rz(0.3, -26), rz(0.5, 0, 'in'), rz(1, 0)],
        wingR: [rx(0, 0), rx(0.5, 30), rx(1, 0)], wingL: [rx(0, 0), rx(0.5, -30), rx(1, 0)],
      },
    },
    // chute para trás: inclina o corpo para a frente e estica uma perna como mola
    chute: {
      frames: 12, loop: false,
      keys: {
        hips: [k(0, [0, 0, 0], [0, 0, 0]), k(0.3, [0, 0, -16], [0.04, -0.04, 0]), k(0.5, [0, 0, -24], [0.08, 0, 0], 'out'), k(0.75, [0, 0, -20], [0.06, 0, 0]), k(1, [0, 0, 0], [0, 0, 0])],
        neck1: [rz(0, 0), rz(0.3, -14), rz(0.5, -20), rz(1, 0)],
        head: [rz(0, 0), rz(0.3, 18), rz(0.5, 24), rz(1, 0)],
        legR_up: [rz(0, 0), rz(0.3, 30), rz(0.5, -86, 'out'), rz(0.75, -80), rz(1, 0)],
        legR_lo: [rz(0, 0), rz(0.3, -90), rz(0.5, 34, 'out'), rz(0.75, 30), rz(1, 0)],
        footR: [rz(0, 0), rz(0.3, 30), rz(0.5, -40), rz(1, 0)],
        legL_up: [rz(0, 0), rz(0.5, 18), rz(1, 0)],
        legL_lo: [rz(0, 0), rz(0.5, -6), rz(1, 0)],
        wingR: [rx(0, 0), rx(0.5, 50), rx(1, 0)], wingL: [rx(0, 0), rx(0.5, -50), rx(1, 0)],
        plume: [rz(0, 0), rz(0.5, 20), rz(0.7, -10), rz(1, 0)],
        lidR: shut(0.4, 0.7, 40), lidL: shut(0.4, 0.7, 40),
      },
    },
    pulo: {
      frames: 10, loop: false,
      keys: {
        hips: [k(0, [0, 0, 0], [0, 0, 0]), k(0.2, [0, 0, -8], [0, -0.16, 0], 'out'), k(0.5, [0, 0, 6], [0, 0.4, 0], 'out'), k(0.8, [0, 0, 2], [0, 0.46, 0]), k(1, [0, 0, -4], [0, 0.38, 0], 'in')],
        neck1: [rz(0, 0), rz(0.2, -20), rz(0.5, 10), rz(1, 0)],
        head: [rz(0, 0), rz(0.2, 16), rz(0.5, -8), rz(1, 0)],
        jaw: [rz(0, 0), rz(0.5, -20), rz(1, -10)],
        legR_up: [rz(0, 0), rz(0.2, 40), rz(0.5, 60), rz(1, 30)], legL_up: [rz(0, 0), rz(0.2, 36), rz(0.5, 50), rz(1, 24)],
        legR_lo: [rz(0, 0), rz(0.2, -70), rz(0.5, -110), rz(1, -60)], legL_lo: [rz(0, 0), rz(0.2, -66), rz(0.5, -100), rz(1, -50)],
        footR: [rz(0, 0), rz(0.5, 50), rz(1, 20)], footL: [rz(0, 0), rz(0.5, 50), rz(1, 20)],
        wingR: [rx(0, 0), rx(0.3, 60), rx(0.5, 10), rx(0.7, 60), rx(1, 30)], wingL: [rx(0, 0), rx(0.3, -60), rx(0.5, -10), rx(0.7, -60), rx(1, -30)],
        plume: [rz(0, 0), rz(0.5, -20), rz(1, 10)],
      },
    },
    dano: {
      frames: 10, loop: false,
      keys: {
        hips: [k(0, [0, 0, 0], [0, 0, 0], undefined, 1), k(0.15, [0, 0, 12], [-0.1, 0.05, 0], 'out', [1.08, 1.1, 1.08]), k(0.35, [0, 0, -6], [-0.06, 0, 0], undefined, [0.97, 0.96, 0.97]), k(0.6, [0, 0, 3], [-0.03, 0, 0], undefined, 1), k(1, [0, 0, 0], [0, 0, 0], undefined, 1)],
        neck1: [rz(0, 0), rz(0.15, 30, 'out'), rz(0.35, -20), rz(0.6, 8), rz(1, 0)],
        neck2: [rz(0, 0), rz(0.15, -30), rz(0.35, 20), rz(1, 0)],
        head: [rz(0, 0), rz(0.15, 30), rz(0.35, -14), rz(1, 0)],
        jaw: [rz(0, 0), rz(0.15, -30), rz(0.7, -10), rz(1, 0)],
        wingR: [rx(0, 0), rx(0.15, 70), rx(0.4, 20), rx(1, 0)], wingL: [rx(0, 0), rx(0.15, -70), rx(0.4, -20), rx(1, 0)],
        plume: [rz(0, 0), rz(0.15, 30), rz(0.35, -14), rz(1, 0)],
        lidR: shut(0.1, 0.6), lidL: shut(0.1, 0.6),
      },
    },
    // desmontar: empina, chacoalha as penas e derruba a herói para trás
    desmontar: {
      frames: 14, loop: false,
      keys: {
        hips: [k(0, [0, 0, 0], [0, 0, 0]), k(0.25, [0, 0, 30], [0, 0.08, 0], 'out'), k(0.4, [0, 0, 26], [0, 0.08, 0]), k(0.55, [0, 0, -16], [0, -0.04, 0], 'in'), k(0.7, [0, 0, 6], [0, 0, 0]), k(1, [0, 0, 0], [0, 0, 0])],
        neck1: [rz(0, 0), rz(0.25, -30), rz(0.55, 24), rz(0.7, -8), rz(1, 0)],
        head: [rz(0, 0), rz(0.25, 20), rz(0.55, -20), rz(1, 0)],
        jaw: [rz(0, 0), rz(0.25, -28), rz(0.55, -28), rz(0.7, 0), rz(1, 0)],
        legR_up: [rz(0, 0), rz(0.25, -26), rz(0.55, 10), rz(1, 0)], legL_up: [rz(0, 0), rz(0.25, -22), rz(0.55, 8), rz(1, 0)],
        legR_lo: [rz(0, 0), rz(0.25, -10), rz(0.55, -20), rz(1, 0)], legL_lo: [rz(0, 0), rz(0.25, -8), rz(0.55, -16), rz(1, 0)],
        wingR: [rx(0, 0), rx(0.3, 70), rx(0.4, 30), rx(0.5, 70), rx(0.6, 30), rx(1, 0)], wingL: [rx(0, 0), rx(0.3, -70), rx(0.4, -30), rx(0.5, -70), rx(0.6, -30), rx(1, 0)],
        plume: [rz(0, 0), rz(0.3, 30), rz(0.4, -20), rz(0.5, 30), rz(0.6, -20), rz(1, 0)],
      },
    },
  };
  spreadChain(set, 'neck1', [['neck1', 0.4], ['neck1b', 0.32], ['neck1c', 0.28]]);
  spreadChain(set, 'neck2', [['neck2', 0.36], ['neck2b', 0.34], ['neck2c', 0.3]]);
  return set;
}

/* ================================================================== */
/* TATU: roll, body, casco, ball, shellF, shellR, head, snout, earR, earL,                */
/*       legFR_up, legFR_lo, legFL_up, legFL_lo, legBR_up, legBR_lo,   */
/*       legBL_up, legBL_lo, tail1, tail2, lidR, lidL                  */
/* ================================================================== */
export function tatuAnims(): AnimSet {
  const walkLegs = (amp: number, lift: number): Record<string, Key[]> => ({
    legFR_up: [rz(0, amp), rz(0.5, -amp), rz(1, amp)],
    legBL_up: [rz(0, amp), rz(0.5, -amp), rz(1, amp)],
    legFL_up: [rz(0, -amp), rz(0.5, amp), rz(1, -amp)],
    legBR_up: [rz(0, -amp), rz(0.5, amp), rz(1, -amp)],
    legFR_lo: [rz(0, 0), rz(0.7, lift), rz(1, 0)],
    legBL_lo: [rz(0, 0), rz(0.7, -lift), rz(1, 0)],
    legFL_lo: [rz(0, lift), rz(0.2, lift), rz(0.5, 0), rz(1, lift)],
    legBR_lo: [rz(0, -lift), rz(0.2, -lift), rz(0.5, 0), rz(1, -lift)],
  });
  return {
    idle: {
      frames: 24, loop: true,
      keys: {
        body: [k(0, [0, 0, 0], [0, 0, 0], undefined, 1), k(0.5, [0, 0, 0], [0, 0.008, 0], undefined, [1.0, 1.025, 1.02]), k(1, [0, 0, 0], [0, 0, 0], undefined, 1)],
        // fareja o ar: focinho sobe e treme
        head: [rz(0, 0), rz(0.3, 6), rz(0.6, 2), rz(1, 0)],
        snout: [rz(0, 0), rz(0.3, 6), rz(0.35, 2), rz(0.4, 7), rz(0.45, 2), rz(0.5, 6), rz(0.7, 0), rz(1, 0)],
        earR: [rz(0, 0), rz(0.6, -10), rz(1, 0)], earL: [rz(0, 0), rz(0.6, -10), rz(1, 0)],
        tail1: [rz(0, 0), rz(0.5, 4), rz(1, 0)], tail2: [rz(0, 0), rz(0.5, 6), rz(1, 0)],
        lidR: blink(0.8), lidL: blink(0.8),
      },
    },
    andar: {
      frames: 16, loop: true,
      keys: {
        body: [k(0, [0, 0, 0], [0, 0, 0]), k(0.25, [2, 0, 0], [0, 0.025, 0]), k(0.5, [0, 0, 0], [0, 0, 0]), k(0.75, [-2, 0, 0], [0, 0.025, 0]), k(1, [0, 0, 0], [0, 0, 0])],
        head: [rz(0, -4), rz(0.25, 0), rz(0.5, -4), rz(0.75, 0), rz(1, -4)],
        snout: [rz(0, 0), rz(0.5, 4), rz(1, 0)],
        tail1: [ry(0, 8), ry(0.5, -8), ry(1, 8)], tail2: [ry(0, 10), ry(0.5, -10), ry(1, 10)],
        ...walkLegs(26, 30),
      },
    },
    // patada: ergue a frente e golpeia com as garras gigantes
    ataque: {
      frames: 10, loop: false,
      keys: {
        shellF: [rz(0, 0), rz(0.3, 18, 'out'), rz(0.55, -10, 'in'), rz(1, 0)],
        body: [k(0, [0, 0, 0], [0, 0, 0]), k(0.3, [0, 0, 6], [-0.04, 0.04, 0]), k(0.55, [0, 0, -4], [0.1, 0, 0]), k(1, [0, 0, 0], [0, 0, 0])],
        head: [rz(0, 0), rz(0.3, 14), rz(0.55, -10), rz(1, 0)],
        legFR_up: [rz(0, 0), rz(0.3, 80, 'out'), rz(0.55, -30, 'in'), rz(1, 0)],
        legFR_lo: [rz(0, 0), rz(0.3, 50), rz(0.55, -10), rz(1, 0)],
        legFL_up: [rz(0, 0), rz(0.35, 70, 'out'), rz(0.6, -20, 'in'), rz(1, 0)],
        legFL_lo: [rz(0, 0), rz(0.35, 40), rz(0.6, -10), rz(1, 0)],
        lidR: shut(0.45, 0.6, 30), lidL: shut(0.45, 0.6, 30),
      },
    },
    pulo: {
      frames: 10, loop: false,
      keys: {
        body: [k(0, [0, 0, 0], [0, 0, 0], undefined, 1), k(0.2, [0, 0, -6], [0, -0.06, 0], undefined, [1.04, 0.92, 1.04]), k(0.5, [0, 0, 12], [0, 0.36, 0], 'out', [0.97, 1.05, 0.97]), k(0.8, [0, 0, 0], [0, 0.42, 0], undefined, 1), k(1, [0, 0, -10], [0, 0.34, 0], 'in', 1)],
        head: [rz(0, 0), rz(0.5, 14), rz(1, -6)],
        legFR_up: [rz(0, 0), rz(0.2, -20), rz(0.5, 50), rz(1, 30)], legFL_up: [rz(0, 0), rz(0.2, -20), rz(0.5, 46), rz(1, 26)],
        legBR_up: [rz(0, 0), rz(0.2, 20), rz(0.5, -50), rz(1, -20)], legBL_up: [rz(0, 0), rz(0.2, 20), rz(0.5, -46), rz(1, -16)],
        legFR_lo: [rz(0, 0), rz(0.5, 40), rz(1, 20)], legFL_lo: [rz(0, 0), rz(0.5, 40), rz(1, 20)],
        legBR_lo: [rz(0, 0), rz(0.5, -40), rz(1, -20)], legBL_lo: [rz(0, 0), rz(0.5, -40), rz(1, -20)],
        tail1: [rz(0, 0), rz(0.5, -20), rz(1, 10)], tail2: [rz(0, 0), rz(0.5, -16), rz(1, 10)],
        earR: [rz(0, 0), rz(0.5, -30), rz(1, 10)], earL: [rz(0, 0), rz(0.5, -30), rz(1, 10)],
      },
    },
    dano: {
      frames: 10, loop: false,
      keys: {
        body: [k(0, [0, 0, 0], [0, 0, 0]), k(0.15, [0, 0, 10], [-0.12, 0.05, 0], 'out'), k(0.35, [0, 0, -5], [-0.08, 0, 0]), k(0.55, [0, 0, 3], [-0.04, 0, 0]), k(1, [0, 0, 0], [0, 0, 0])],
        head: [rz(0, 0), rz(0.15, 20), rz(0.35, -10), rz(1, 0)],
        snout: [rz(0, 0), rz(0.15, 14), rz(0.35, -8), rz(1, 0)],
        earR: [rz(0, 0), rz(0.15, -40), rz(1, 0)], earL: [rz(0, 0), rz(0.15, -40), rz(1, 0)],
        tail1: [rz(0, 0), rz(0.15, -20), rz(0.35, 10), rz(1, 0)],
        lidR: shut(0.1, 0.6), lidL: shut(0.1, 0.6),
      },
    },
    // desmontar: empina a traseira como um coice e sacode o casco
    desmontar: {
      frames: 14, loop: false,
      keys: {
        body: [k(0, [0, 0, 0], [0, 0, 0]), k(0.2, [0, 0, 8], [0, -0.02, 0]), k(0.4, [0, 0, -24], [0, 0.12, 0], 'out'), k(0.55, [6, 0, -8], [0, 0.04, 0]), k(0.65, [-6, 0, 2], [0, 0, 0]), k(0.75, [4, 0, 0], [0, 0, 0]), k(1, [0, 0, 0], [0, 0, 0])],
        shellR: [rz(0, 0), rz(0.4, -14), rz(0.6, 4), rz(1, 0)],
        head: [rz(0, 0), rz(0.4, 20), rz(0.65, -6), rz(1, 0)],
        legBR_up: [rz(0, 0), rz(0.4, -50), rz(0.6, 0), rz(1, 0)], legBL_up: [rz(0, 0), rz(0.42, -46), rz(0.62, 0), rz(1, 0)],
        legFR_up: [rz(0, 0), rz(0.4, 20), rz(1, 0)], legFL_up: [rz(0, 0), rz(0.4, 18), rz(1, 0)],
        tail1: [rz(0, 0), rz(0.4, -40), rz(0.6, 10), rz(1, 0)], tail2: [rz(0, 0), rz(0.4, -30), rz(0.6, 10), rz(1, 0)],
        lidR: shut(0.35, 0.6, 40), lidL: shut(0.35, 0.6, 40),
      },
    },
    // rolar: vira bola fechada — o casco aberto (com cabeça, patas e cauda) some e o casco em bola aparece, girando para a frente
    rolar: {
      frames: 12, loop: true,
      keys: {
        roll: [k(0, [0, 0, 0], [0, 0.025, 0], 'linear'), k(0.25, [0, 0, -90], [0, 0.04, 0], 'linear'), k(0.5, [0, 0, -180], [0, 0.025, 0], 'linear'), k(0.75, [0, 0, -270], [0, 0.04, 0], 'linear'), k(1, [0, 0, -360], [0, 0.025, 0], 'linear')],
        casco: [k(0, undefined, undefined, undefined, 0.001), k(1, undefined, undefined, undefined, 0.001)],
        shellF: [k(0, undefined, undefined, undefined, 0.001), k(1, undefined, undefined, undefined, 0.001)],
        shellR: [k(0, undefined, undefined, undefined, 0.001), k(1, undefined, undefined, undefined, 0.001)],
        ball: [k(0, undefined, undefined, undefined, 1000), k(1, undefined, undefined, undefined, 1000)],
      },
    },
    // cavar: nariz para baixo, garras dianteiras alternando como pás
    cavar: {
      frames: 12, loop: true,
      keys: {
        body: [k(0, [0, 0, -14], [0.04, -0.05, 0]), k(0.25, [2, 0, -16], [0.04, -0.06, 0]), k(0.5, [0, 0, -14], [0.04, -0.05, 0]), k(0.75, [-2, 0, -16], [0.04, -0.06, 0]), k(1, [0, 0, -14], [0.04, -0.05, 0])],
        shellF: [rz(0, -8), rz(1, -8)],
        head: [rz(0, -16), rz(0.25, -22), rz(0.5, -16), rz(0.75, -22), rz(1, -16)],
        snout: [rz(0, -10), rz(0.5, -4), rz(1, -10)],
        legFR_up: [rz(0, 50), rz(0.25, -40, 'in'), rz(0.5, -10), rz(0.75, 40), rz(1, 50)],
        legFR_lo: [rz(0, 30), rz(0.25, -20), rz(0.5, 10), rz(1, 30)],
        legFL_up: [rz(0, -10), rz(0.25, 40), rz(0.5, 50), rz(0.75, -40, 'in'), rz(1, -10)],
        legFL_lo: [rz(0, 10), rz(0.5, 30), rz(0.75, -20), rz(1, 10)],
        legBR_up: [rz(0, 14), rz(1, 14)], legBL_up: [rz(0, 10), rz(1, 10)],
        tail1: [rz(0, -10), rz(0.5, -16), rz(1, -10)],
        earR: [rz(0, -20), rz(1, -20)], earL: [rz(0, -20), rz(1, -20)],
        lidR: [k(0, [40, 0, 0]), k(1, [40, 0, 0])], lidL: [k(0, [40, 0, 0]), k(1, [40, 0, 0])],
      },
    },
  };
}
