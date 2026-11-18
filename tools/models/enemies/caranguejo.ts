/**
 * CARANGUEJO-ALICATE — caranguejo-uçá laranja de carapaça manchada, olhos em pedúnculos e
 * UMA garra que é um alicate de eletricista gigante (cabo de borracha vermelha, mandíbulas
 * serrilhadas de aço). A outra garrinha é minúscula. Anda de lado e prende por um instante.
 * O corpo encara a câmera girado para +X (anda de lado ao longo do eixo X).
 */
import { Rig, blob, tube, slab, lathe, ring, spike, eye, mat, taper, pull, bulge, wobble, flattenBelow, D2R, type V3 } from '../../render/sculpt';
import { k, rz, rx, ry, ps, sc, anim, wave, waveAxis, bob } from '../../anims/enemies/common';
import type { AnimSet, Key } from '../../render/anim';
import type { ModelDef } from '../../render/types';

function build() {
  const r = new Rig('root');
  const shell = mat('shell', 0xe0662a, { repeat: 2, rough: 0.45 });
  const shellDark = mat('shell', 0xa8401a, { repeat: 2 });
  const under = mat('shell', 0xf2d2a0, { repeat: 2 });
  const leg = mat('shell', 0xd85a24, { repeat: 3 });
  const steel = mat('metal', 0xb8bec4, { metal: 0.5, rough: 0.3 });
  const steelDark = mat('metal', 0x6a7076, { metal: 0.5, rough: 0.4 });
  const grip = mat('rubber', 0xd42a22);

  r.bone('body', 'root', [0, 0.26, 0], [0, 28, 0]);
  r.bone('eyeR', 'body', [0.07, 0.1, 0.12], [0, 0, -10]);
  r.bone('eyeL', 'body', [-0.07, 0.1, 0.12], [0, 0, 10]);
  r.bone('mouth', 'body', [0, -0.02, 0.17]);
  // garra-alicate (lado +X) e garrinha (lado -X)
  r.bone('bigArm', 'body', [0.2, 0.0, 0.1], [0, -30, -20]);
  r.bone('bigFore', 'bigArm', [0.16, 0, 0], [0, -50, 30]);
  r.bone('jawTop', 'bigFore', [0.14, 0.0, 0]);
  r.bone('jawBot', 'bigFore', [0.14, 0.0, 0]);
  r.bone('smallArm', 'body', [-0.2, 0.0, 0.1], [0, 30, 20]);
  r.bone('smallClaw', 'smallArm', [-0.1, 0.02, 0.02], [0, 40, 0]);
  for (const s of ['R', 'L'] as const) {
    const xs = s === 'R' ? 1 : -1;
    for (let i = 0; i < 3; i++) {
      const z = 0.05 - i * 0.07;
      r.bone(`leg${s}${i}`, 'body', [0.17 * xs, -0.03, z], [0, xs * (i - 1) * 18, xs * -20]);
      r.bone(`leg${s}${i}lo`, `leg${s}${i}`, [0.14 * xs, 0, 0], [0, 0, xs * -55]);
    }
  }

  /* carapaça larga e achatada, com manchas e borda serrilhada */
  r.add('body',
    blob([0.24, 0.13, 0.19], shell, { deform: [flattenBelow(-0.05, 0.6), pull([0, 0.1, 0.1], 0.12, [0, 0.02, 0.02]), bulge([0.12, 0.06, 0], 0.1, 0.015), bulge([-0.12, 0.06, 0], 0.1, 0.015), wobble(0.003)] }),
    blob([0.22, 0.06, 0.17], under, { pos: [0, -0.06, 0] }),
    ...([[0.08, 0.1, 0.06], [-0.1, 0.1, 0.04], [0.0, 0.12, -0.05], [0.14, 0.07, -0.06], [-0.04, 0.11, 0.12]] as V3[]).map((p, i) => blob([0.03 - i * 0.003, 0.012, 0.026], shellDark, { pos: p, seg: 12 })),
    ...[-0.16, -0.08, 0.08, 0.16].map((x) => spike(0.035, 0.016, shellDark, { pos: [x, 0.03, 0.17], rot: [70, 0, 0] })),
  );
  // boca com bolhinhas de baba e "bigodinho"
  r.add('mouth',
    blob([0.06, 0.025, 0.02], mat('skin', 0x7a2a1a), {}),
    blob([0.02, 0.012, 0.01], mat('skin', 0xf6e6d0), { pos: [0.02, 0.02, 0.012] }),
    blob([0.02, 0.012, 0.01], mat('skin', 0xf6e6d0), { pos: [-0.02, 0.02, 0.012] }),
    blob([0.018, 0.018, 0.018], mat('glass', 0xdff4ff, { opacity: 0.6 }), { pos: [0.05, -0.02, 0.02] }),
  );
  /* olhos em pedúnculos */
  for (const s of ['R', 'L'] as const) {
    const xs = s === 'R' ? 1 : -1;
    const e = eye({ r: 0.05, iris: 0x2a2a2a, irisScale: 0.6, look: [xs * 0.3, -0.2], lid: 0.3, lidColor: 0xa8401a, angry: xs * 12 });
    e.position.set(0, 0.12, 0.01);
    e.rotation.y = xs * 0.2;
    r.add(`eye${s}`, tube([[0, 0, 0], [0, 0.06, 0], [0, 0.1, 0.0]], (t) => 0.022 - t * 0.006, leg, { seg: 8, radial: 8 }), e);
    r.bones[`lid${s}`] = e.getObjectByName('lid')!;
  }
  /* pernas finas articuladas com pontas escuras */
  for (const s of ['R', 'L'] as const) {
    const xs = s === 'R' ? 1 : -1;
    for (let i = 0; i < 3; i++) {
      r.add(`leg${s}${i}`, tube([[0, 0, 0], [0.07 * xs, 0.01, 0], [0.14 * xs, 0, 0]], (t) => 0.024 - t * 0.006, leg, { seg: 8, radial: 8 }));
      r.add(`leg${s}${i}lo`,
        tube([[0, 0, 0], [0.08 * xs, -0.005, 0], [0.15 * xs, 0, 0]], (t) => 0.018 - t * 0.012, leg, { seg: 8, radial: 8 }),
        spike(0.04, 0.008, shellDark, { pos: [0.15 * xs, 0, 0], rot: [0, 0, -90 * xs] }),
      );
    }
  }
  /* braço do alicate */
  r.add('bigArm', tube([[0, 0, 0], [0.08, 0.01, 0], [0.16, 0, 0]], (t) => 0.045 - t * 0.008, shell, { seg: 8, radial: 10 }));
  r.add('bigFore',
    // cabo do alicate em borracha vermelha (vira o "antebraço")
    tube([[0, 0.025, 0], [0.07, 0.03, 0], [0.13, 0.016, 0]], (t) => 0.035 - t * 0.012, grip, { seg: 10, radial: 10 }),
    tube([[0, -0.025, 0], [0.07, -0.03, 0], [0.13, -0.016, 0]], (t) => 0.035 - t * 0.012, grip, { seg: 10, radial: 10 }),
    ...[0.03, 0.06, 0.09].map((x) => ring(0.034, 0.006, mat('rubber', 0x9a1a14), { pos: [x, 0.027, 0], rot: [0, 90, 0] })),
    // eixo/rebite
    lathe([[0.001, -0.035], [0.032, -0.035], [0.034, 0.035], [0.001, 0.035]], steelDark, { pos: [0.14, 0, 0], rot: [90, 0, 0] }),
    blob([0.02, 0.02, 0.01], steel, { pos: [0.14, 0, 0.038] }),
  );
  const jaw = (up: number) => [
    slab([[0, 0], [0.1, up * 0.035], [0.2, up * 0.03], [0.24, up * 0.006], [0.2, -up * 0.004], [0.06, -up * 0.006]].map(([x, y]) => [x, y] as [number, number]), 0.04, steel, { smooth: false, bevel: 0.008 }),
    // serrilhado
    ...[0.08, 0.11, 0.14, 0.17].map((x) => spike(0.016, 0.008, steelDark, { pos: [x, -up * 0.004, 0], rot: [0, 0, up > 0 ? 180 : 0] })),
  ];
  r.add('jawTop', ...jaw(1));
  r.add('jawBot', ...jaw(-1));
  r.bones.jawTop.rotation.z = 12 * D2R;
  r.bones.jawBot.rotation.z = -12 * D2R;
  /* garrinha minúscula do outro lado (cômica) */
  r.add('smallArm', tube([[0, 0, 0], [-0.05, 0.01, 0], [-0.1, 0.02, 0]], 0.022, shell, { seg: 6, radial: 8 }));
  r.add('smallClaw',
    blob([0.035, 0.026, 0.022], shell, {}),
    spike(0.04, 0.012, shellDark, { pos: [-0.02, 0.01, 0], rot: [0, 0, 110], curve: 0.3 }),
    spike(0.035, 0.01, shellDark, { pos: [-0.02, -0.01, 0], rot: [0, 0, 80], curve: -0.3 }),
  );
  r.anchor('head', 'body', [0, 0.25, 0]);
  r.bones.bigArm.scale.setScalar(1.6);
  r.root.scale.setScalar(1.25);
  return r;
}

const legs = (amp: number, lift: number, ph = 0): Record<string, Key[]> => {
  const out: Record<string, Key[]> = {};
  for (const s of ['R', 'L'] as const) for (let i = 0; i < 3; i++) {
    const p = ph + (i % 2 ? 0.5 : 0) + (s === 'L' ? 0.5 : 0);
    out[`leg${s}${i}`] = Array.from({ length: 9 }, (_, j) => k(j / 8, [0, amp * Math.cos((j / 8 + p) * Math.PI * 2), (s === 'R' ? 1 : -1) * lift * Math.max(0, Math.sin((j / 8 + p) * Math.PI * 2))], undefined, 'linear'));
  }
  return out;
};
const clack = (t0: number): Record<string, Key[]> => ({
  jawTop: [rz(0, 0), rz(t0, 0), rz(t0 + 0.06, -12), rz(t0 + 0.12, 0), rz(t0 + 0.18, -12), rz(t0 + 0.24, 0), rz(1, 0)],
  jawBot: [rz(0, 0), rz(t0, 0), rz(t0 + 0.06, 12), rz(t0 + 0.12, 0), rz(t0 + 0.18, 12), rz(t0 + 0.24, 0), rz(1, 0)],
});

function anims(): AnimSet {
  const idle = anim(24, true, {
    ...clack(0.55),
    body: [ps(0, [0, 0, 0]), ps(0.5, [0, -0.01, 0]), ps(1, [0, 0, 0])],
    eyeR: wave(8, 0), eyeL: wave(8, 0.3),
    bigArm: wave(4, 0.1), smallArm: wave(10, 0.2), smallClaw: [rz(0, 0), rz(0.2, 30), rz(0.3, 0), rz(0.4, 30), rz(0.5, 0), rz(1, 0)],
    mouth: [sc(0, 1), sc(0.5, [1.1, 0.8, 1]), sc(1, 1)],
    lidR: [rx(0, 0), rx(0.8, 0), rx(0.84, 60), rx(0.9, 0), rx(1, 0)], lidL: [rx(0, 0), rx(0.8, 0), rx(0.84, 60), rx(0.9, 0), rx(1, 0)],
  });
  const andar = anim(12, true, {
    ...legs(18, 26),
    body: [k(0, [0, 0, -3], [0, 0, 0]), k(0.25, [0, 0, 0], [0, 0.02, 0]), k(0.5, [0, 0, 3], [0, 0, 0]), k(0.75, [0, 0, 0], [0, 0.02, 0]), k(1, [0, 0, -3], [0, 0, 0])],
    eyeR: wave(12, 0, 0, 8, 2), eyeL: wave(12, 0.2, 0, 8, 2),
    bigArm: wave(6, 0.2),
  });
  const ataque = anim(12, false, {
    body: [ps(0, [0, 0, 0]), ps(0.3, [-0.04, 0, 0]), ps(0.5, [0.1, 0, 0], 'in'), ps(1, [0, 0, 0])],
    bigArm: [k(0, [0, 0, 0]), k(0.3, [0, 20, 30]), k(0.5, [0, -10, -20], undefined, 'in'), k(1, [0, 0, 0])],
    bigFore: [k(0, [0, 0, 0]), k(0.3, [0, 20, 0]), k(0.5, [0, -30, -10], undefined, 'in'), k(1, [0, 0, 0])],
    jawTop: [rz(0, 0), rz(0.3, 22), rz(0.5, -12, 'in'), rz(0.8, -12), rz(1, 0)],
    jawBot: [rz(0, 0), rz(0.3, -22), rz(0.5, 12, 'in'), rz(0.8, 12), rz(1, 0)],
    lidR: [rx(0, 0), rx(0.3, 25), rx(0.8, 25), rx(1, 0)], lidL: [rx(0, 0), rx(0.3, 25), rx(0.8, 25), rx(1, 0)],
  });
  // prender: o alicate fecha e segura, tremendo de esforço
  const prender = anim(12, true, {
    bigArm: [k(0, [0, -10, -10]), k(1, [0, -10, -10])],
    bigFore: [k(0, [0, -30, -6]), k(0.25, [2, -32, -4]), k(0.5, [0, -30, -6]), k(0.75, [-2, -28, -8]), k(1, [0, -30, -6])],
    jawTop: [rz(0, -12), rz(1, -12)], jawBot: [rz(0, 12), rz(1, 12)],
    body: [ps(0, [0.02, 0, 0]), ps(0.25, [0.024, 0.004, 0]), ps(0.5, [0.02, 0, 0]), ps(0.75, [0.016, 0.004, 0]), ps(1, [0.02, 0, 0])],
    lidR: [rx(0, 40), rx(1, 40)], lidL: [rx(0, 40), rx(1, 40)],
    mouth: [sc(0, [1.3, 0.5, 1]), sc(1, [1.3, 0.5, 1])],
    eyeR: [rz(0, -10), rz(0.5, -14), rz(1, -10)], eyeL: [rz(0, 10), rz(0.5, 14), rz(1, 10)],
  });
  // conga: passinho de lado com as garras para o alto
  const conga = anim(16, true, {
    ...legs(14, 30, 0.25),
    body: [k(0, [0, 0, -8], [0, 0, 0], 'out'), k(0.25, [0, 0, 0], [0, 0.05, 0], 'in'), k(0.5, [0, 0, 8], [0, 0, 0], 'out'), k(0.75, [0, 0, 0], [0, 0.05, 0], 'in'), k(1, [0, 0, -8], [0, 0, 0])],
    bigArm: [k(0, [0, 0, 60]), k(0.5, [0, 0, 40]), k(1, [0, 0, 60])],
    smallArm: [k(0, [0, 0, -40]), k(0.5, [0, 0, -60]), k(1, [0, 0, -40])],
    ...clack(0.0), eyeR: wave(16, 0), eyeL: wave(16, 0.5),
    lidR: [rx(0, 30), rx(1, 30)], lidL: [rx(0, 30), rx(1, 30)],
  });
  const dano = anim(10, false, {
    body: [k(0, [0, 0, 0], [0, 0, 0]), k(0.2, [-20, 0, 20], [-0.1, 0.08, 0], 'out'), k(1, [0, 0, 6], [-0.12, 0, 0], 'bounce')],
    eyeR: [rz(0, 0), rz(0.2, 40), rz(1, 20)], eyeL: [rz(0, 0), rz(0.2, -40), rz(1, -20)],
    jawTop: [rz(0, 0), rz(0.2, 30), rz(1, 10)], jawBot: [rz(0, 0), rz(0.2, -30), rz(1, -10)],
    lidR: [rx(0, 0), rx(0.15, 70), rx(1, 45)], lidL: [rx(0, 0), rx(0.15, 70), rx(1, 45)],
  });
  const morte = anim(24, false, {
    body: [k(0, [0, 0, 0], [0, 0, 0]), k(0.3, [0, 0, 120], [0, 0.24, 0], 'out'), k(0.55, [0, 0, 180], [0, 0.02, 0], 'in'), k(0.65, [0, 0, 180], [0, 0.06, 0], 'out'), k(1, [0, 0, 180], [0, 0.02, 0], 'bounce')],
    ...legs(30, 30, 0),
    jawTop: [rz(0, 0), rz(0.55, 30), rz(1, 30)], jawBot: [rz(0, 0), rz(0.55, -30), rz(1, -30)],
    lidR: [rx(0, 0), rx(0.3, -30), rx(0.55, 80), rx(1, 80)], lidL: [rx(0, 0), rx(0.3, -30), rx(0.55, 80), rx(1, 80)],
  });
  const tonto = anim(16, true, {
    body: Array.from({ length: 9 }, (_, i) => k(i / 8, [8 * Math.sin((i / 8) * Math.PI * 2), 0, 8 * Math.cos((i / 8) * Math.PI * 2)], undefined, 'linear')),
    eyeR: Array.from({ length: 9 }, (_, i) => k(i / 8, [20 * Math.sin((i / 8) * Math.PI * 2), 0, 20 * Math.cos((i / 8) * Math.PI * 2)], undefined, 'linear')),
    eyeL: Array.from({ length: 9 }, (_, i) => k(i / 8, [20 * Math.cos((i / 8) * Math.PI * 2), 0, 20 * Math.sin((i / 8) * Math.PI * 2)], undefined, 'linear')),
    bigArm: [k(0, [0, 0, -30]), k(0.5, [0, 0, -36]), k(1, [0, 0, -30])],
    jawTop: [rz(0, 20), rz(1, 20)], jawBot: [rz(0, -20), rz(1, -20)],
    lidR: [rx(0, 45), rx(1, 45)], lidL: [rx(0, 15), rx(1, 15)],
  });
  return { idle, andar, ataque, dano, morte, tonto, conga, prender };
}

export const caranguejo: ModelDef = {
  id: 'caranguejo',
  kind: 'enemy',
  build,
  anims: anims(),
  cell: [288, 192],
  pivot: [128, 170],
  height: 192 / 104,
  presets: ['recife', 'neutro'],
};
