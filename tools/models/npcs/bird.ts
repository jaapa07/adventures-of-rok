/**
 * Esqueleto e animações de ave compartilhados pelos NPCs Tucano e Bem-te-vi.
 * Ossos: body, chest, neck, head, billU, billL (bico abre), wingR/L + wingR/L_tip, tail, legR/L, footR/L, lidR/L.
 * Asas dobradas ao lado do corpo; rx negativo (R) / positivo (L) abre a asa para fora e para cima.
 */
import { Rig, blob, limb, tube, slab, spike, eye, mat, taper, pull, wobble, type V3, type V2 } from '../../render/sculpt';
import type { Anim, AnimSet, Key } from '../../render/anim';
import { k, rz, rx, pk, sk, blink, wave, waveP, show } from '../../anims/bosses/kit';

export interface BirdOpts {
  size: number; // raio do corpo
  leg: number; // altura do quadril
  body: number; back: number; belly: number; head: number; wing: number; wingTip: number; tail: number; leg_c: number;
  eyeR: number; iris: number; eyeRing?: number;
  lean: number; // inclinação do corpo (graus; positivo = mais em pé)
  bill: (r: Rig) => void;
  extra?: (r: Rig) => void;
  bodyStretch?: number;
}

export function buildBird(o: BirdOpts) {
  const r = new Rig('root');
  const S = o.size;
  const body = mat('shortFur', o.body, { repeat: 4 });
  const back = mat('shortFur', o.back, { repeat: 4 });
  const belly = mat('shortFur', o.belly, { repeat: 4 });
  const headM = mat('shortFur', o.head, { repeat: 4 });
  const wingM = mat('shortFur', o.wing, { repeat: 3 });
  const tipM = mat('shortFur', o.wingTip, { repeat: 3 });
  const tailM = mat('shortFur', o.tail, { repeat: 3 });
  const legM = mat('skin', o.leg_c, { rough: 0.5 });

  r.bone('body', 'root', [0, o.leg + S * 0.55, 0], [0, 0, o.lean]);
  r.bone('chest', 'body', [S * 0.3, S * 0.2, 0]);
  r.bone('neck', 'chest', [S * 0.35, S * 0.45, 0], [0, 0, -o.lean * 0.8]);
  r.bone('head', 'neck', [S * 0.1, S * 0.35, 0]);
  r.bone('billU', 'head', [S * 0.52, -S * 0.05, 0]);
  r.bone('billL', 'head', [S * 0.48, -S * 0.15, 0]);
  for (const s of ['L', 'R'] as const) {
    const z = s === 'R' ? 1 : -1;
    r.bone(`wing${s}`, 'chest', [0, S * 0.25, S * 0.72 * z], [0, z * -8, 0]);
    r.bone(`wing${s}_tip`, `wing${s}`, [-S * 0.95, -S * 0.25, 0]);
    r.bone(`leg${s}`, 'root', [0, o.leg, S * 0.3 * z]);
    r.bone(`foot${s}`, `leg${s}`, [0, -o.leg, 0]);
  }
  r.bone('tail', 'body', [-S * 0.85, -S * 0.2, 0], [0, 0, 20]);
  r.anchor('head', 'head', [0, S * 0.75, 0]);

  const stretch = o.bodyStretch ?? 1;
  r.add('body',
    blob([S * 1.0 * stretch, S * 0.82, S * 0.78], body, { deform: [pull([-S * 0.8, -S * 0.1, 0], S * 0.6, [-S * 0.15, -S * 0.05, 0]), wobble(S * 0.01)] }),
    blob([S * 0.8 * stretch, S * 0.5, S * 0.7], back, { pos: [-S * 0.1, S * 0.3, 0], deform: [wobble(S * 0.01)] }),
  );
  r.add('chest',
    blob([S * 0.62, S * 0.7, S * 0.66], belly, { pos: [S * 0.05, S * 0.05, 0], deform: [pull([S * 0.4, -S * 0.2, 0], S * 0.5, [S * 0.06, -S * 0.04, 0])] }),
  );
  r.add('neck', blob([S * 0.42, S * 0.42, S * 0.42], belly, { pos: [0, 0, 0] }));
  r.add('head',
    blob([S * 0.58, S * 0.55, S * 0.52], headM, { deform: [pull([S * 0.4, -S * 0.05, 0], S * 0.35, [S * 0.06, 0, 0]), pull([-S * 0.3, S * 0.35, 0], S * 0.3, [-S * 0.04, S * 0.06, 0])] }),
  );
  for (const s of ['L', 'R'] as const) {
    const z = s === 'R' ? 1 : -1;
    if (o.eyeRing !== undefined) r.add('head', blob([o.eyeR * 1.55, o.eyeR * 1.55, o.eyeR * 0.5], mat('skin', o.eyeRing, { rough: 0.4 }), { pos: [S * 0.24, S * 0.12, S * 0.4 * z], rot: [0, z * 40, 0] }));
    const e = eye({ r: o.eyeR, iris: o.iris, irisScale: 0.72, look: [0.4, 0.05], lid: 0.12, lidColor: o.head });
    e.position.set(S * 0.27, S * 0.12, S * 0.42 * z);
    e.rotation.y = z > 0 ? 0.75 : -0.4;
    r.add('head', e);
    r.bones[`lid${s}`] = e.getObjectByName('lid')!;
  }
  o.bill(r);
  // asas dobradas (penas em leque)
  const wingOut: V2[] = [[S * 0.15, S * 0.12], [-S * 0.5, S * 0.12], [-S * 1.0, -S * 0.15], [-S * 0.9, -S * 0.4], [-S * 0.3, -S * 0.45], [S * 0.15, -S * 0.15]];
  const tipOut: V2[] = [[S * 0.1, S * 0.1], [-S * 0.5, S * 0.02], [-S * 0.85, -S * 0.12], [-S * 0.55, -S * 0.22], [S * 0.05, -S * 0.15]];
  for (const s of ['L', 'R'] as const) {
    const z = s === 'R' ? 1 : -1;
    r.add(`wing${s}`, slab(wingOut, S * 0.1, wingM, { pos: [0, 0, z * S * 0.04], deform: [wobble(S * 0.01)] }));
    r.add(`wing${s}_tip`,
      slab(tipOut, S * 0.07, tipM, { pos: [S * 0.1, 0, z * S * 0.05] }),
      ...[0, 1, 2].map((i) => slab([[0, 0], [-S * 0.42, S * 0.04], [-S * 0.5, 0], [-S * 0.4, -S * 0.06]], S * 0.04, i % 2 ? wingM : tipM, { pos: [-S * 0.35, -S * 0.08 - i * S * 0.07, z * S * (0.07 + i * 0.01)], rot: [0, 0, -6 - i * 8] })),
    );
    r.add(`leg${s}`,
      blob([S * 0.2, S * 0.25, S * 0.2], body, { pos: [0, S * 0.12, 0] }),
      limb(o.leg * 0.95, S * 0.07, S * 0.055, legM, { pos: [0, 0, 0] }),
    );
    r.add(`foot${s}`,
      ...[-30, 0, 30].map((a) => tube([[0, 0, 0], [S * 0.18, -S * 0.02, 0], [S * 0.3, -S * 0.04, 0]].map(([x, y]) => [x * Math.cos(a * Math.PI / 180), y, -x * Math.sin(a * Math.PI / 180)] as V3), S * 0.045, legM, { seg: 6, radial: 6 })),
      tube([[0, 0, 0], [-S * 0.18, -S * 0.04, 0]], S * 0.04, legM, { seg: 4, radial: 6 }),
    );
  }
  r.add('tail',
    ...[-1, 0, 1].map((i) => slab([[0, -S * 0.12], [-S * 0.9, -S * 0.16], [-S * 1.0, 0], [-S * 0.9, S * 0.16], [0, S * 0.12]], S * 0.05, i === 0 ? tailM : body, { pos: [0, i * S * 0.03, i * S * 0.06], rot: [i * 14, 0, i * 6] })),
  );
  o.extra?.(r);
  void taper; void spike;
  return r;
}

/* ---------------- animações de ave ---------------- */
type KeyMap = Record<string, Key[]>;
const peck = (t0: number, amp: number): Key[] => [rz(0, 0), rz(t0, 0), rz(t0 + 0.06, amp, 'out'), rz(t0 + 0.12, 0), rz(1, 0)];
const blinks = (t: number): KeyMap => ({ lidR: blink(t, 70), lidL: blink(t, 70) });
const flap = (cycles: number, amp = 1): KeyMap => ({
  wingR: wave([-70 * amp, 0, 0], cycles, 0, [-80, 0, 0]),
  wingL: wave([70 * amp, 0, 0], cycles, 0, [80, 0, 0]),
  wingR_tip: wave([-30 * amp, 0, 0], cycles, -0.1),
  wingL_tip: wave([30 * amp, 0, 0], cycles, -0.1),
});

export function birdAnims(S: number, extras: { comentar?: boolean; entregar?: boolean; billOpen?: number }): AnimSet {
  const open = extras.billOpen ?? 30;
  const idle: Anim = {
    frames: 24, loop: true,
    keys: {
      body: waveP([0, -S * 0.03, 0], 1, 0.25),
      chest: [sk(0, 1), sk(0.5, [1.03, 1.04, 1.03]), sk(1, 1)],
      head: [k(0, [0, 0, 0]), k(0.25, [12, 0, -4]), k(0.45, [12, 0, -4]), k(0.55, [-6, 0, 6]), k(0.8, [-6, 0, 6]), k(1, [0, 0, 0])],
      billL: peck(0.62, -open * 0.4),
      tail: wave([0, 0, 6], 2),
      wingR: wave([-3, 0, 0], 1), wingL: wave([3, 0, 0], 1),
      ...blinks(0.35),
    },
  };
  const falar: Anim = {
    // tagarela: bico abrindo e fechando rápido, cabeça balançando, asa gesticulando
    frames: 16, loop: true,
    keys: {
      billL: [rz(0, 0), rz(0.12, -open), rz(0.25, -5), rz(0.37, -open * 0.8), rz(0.5, 0), rz(0.62, -open), rz(0.75, -8), rz(0.87, -open * 0.7), rz(1, 0)],
      billU: [rz(0, 0), rz(0.12, 6), rz(0.25, 0), rz(0.37, 5), rz(0.5, 0), rz(0.62, 6), rz(0.75, 0), rz(0.87, 4), rz(1, 0)],
      head: wave([8, 0, 6], 2, 0),
      neck: wave([0, 0, 4], 1, 0.25),
      body: waveP([0, S * 0.02, 0], 2),
      wingR: wave([-25, 0, 10], 1, 0, [-35, 0, 0]),
      wingR_tip: wave([-20, 0, 0], 2, 0.2),
      tail: wave([0, 0, 10], 2, 0.3),
      ...blinks(0.55),
    },
  };
  const voar: Anim = {
    frames: 12, loop: true,
    keys: {
      root: waveP([0, S * 0.15, 0], 1, 0.25, [0, S * 1.6, 0]),
      body: [rz(0, -20), rz(1, -20)],
      neck: [rz(0, 14), rz(1, 14)],
      ...flap(1),
      legR: [rz(0, -70), rz(1, -70)], legL: [rz(0, -70), rz(1, -70)],
      footR: [rz(0, -40), rz(1, -40)], footL: [rz(0, -40), rz(1, -40)],
      tail: wave([0, 0, 8], 1, 0.3, [0, 0, -10]),
    },
  };
  const set: AnimSet = { idle, falar, voar };
  if (extras.comentar) {
    set.comentar = {
      // "Hmmm..." — inclina a cabeça, ergue a asa como quem levanta o dedo e solta uma risadinha
      frames: 24, loop: false,
      keys: {
        head: [k(0, [0, 0, 0]), k(0.25, [22, 0, 10], undefined, 'back'), k(0.6, [22, 0, 10]), k(0.7, [0, 0, -6]), k(0.8, [0, 0, 4]), k(0.9, [0, 0, -6]), k(1, [0, 0, 0])],
        wingR: [rx(0, 0), rx(0.25, -70, 'back'), rx(0.6, -70), rx(1, 0)],
        wingR_tip: [rx(0, 0), rx(0.25, -40), rx(0.6, -40), rx(1, 0)],
        billL: [rz(0, 0), rz(0.65, 0), rz(0.7, -open), rz(0.76, -4), rz(0.82, -open), rz(0.88, -4), rz(0.94, -open * 0.8), rz(1, 0)],
        lidR: [rx(0, 0), rx(0.25, 40), rx(0.6, 40), rx(0.7, 60), rx(0.95, 60), rx(1, 0)],
        lidL: [rx(0, 0), rx(0.25, 40), rx(0.6, 40), rx(0.7, 60), rx(0.95, 60), rx(1, 0)],
        body: [pk(0, [0, 0, 0]), pk(0.7, [0, 0, 0]), pk(0.76, [0, S * 0.06, 0]), pk(0.82, [0, 0, 0]), pk(0.88, [0, S * 0.06, 0]), pk(0.94, [0, 0, 0])],
        tail: [rz(0, 0), rz(0.7, 20), rz(1, 0)],
      },
    };
  }
  if (extras.entregar) {
    set.entregar = {
      // tira a carta da bolsinha com o bico e estende para o herói, cheio de orgulho
      frames: 24, loop: false,
      keys: {
        neck: [rz(0, 0), rz(0.25, -70, 'inOut'), rz(0.4, -70), rz(0.6, 10, 'out'), rz(1, 10)],
        head: [rz(0, 0), rz(0.25, -40), rz(0.4, -40), rz(0.6, 0), rz(1, 0)],
        billL: [rz(0, 0), rz(0.2, -open), rz(0.35, -5), rz(1, -5)],
        letter: [...show([[0.35, 1]], 0.01)],
        chest: [k(0, [0, 0, 0], undefined, undefined, 1), k(0.6, [0, 0, 0], undefined, undefined, 1), k(0.75, [0, 0, 0], undefined, undefined, [1.12, 1.12, 1.12]), k(1, [0, 0, 0], undefined, undefined, [1.1, 1.1, 1.1])],
        lidR: [rx(0, 0), rx(0.6, 0), rx(0.7, 55), rx(1, 55)], lidL: [rx(0, 0), rx(0.6, 0), rx(0.7, 55), rx(1, 55)],
        tail: [rz(0, 0), rz(0.7, 25), rz(0.8, 5), rz(0.9, 25), rz(1, 15)],
      },
    };
  }
  return set;
}
