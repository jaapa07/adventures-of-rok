/**
 * TEIÚ ATROPELADOR — lagarto teiú preto com faixas de pintinhas claras, focinho comprido,
 * papada branca, língua bifurcada e um sorriso de quem vai passar por cima. Corre de quatro
 * patas acelerando na direção do herói.
 */
import { Rig, blob, tube, slab, spike, eye, mat, taper, pull, bulge, wobble, type V3 } from '../../render/sculpt';
import { k, rz, rx, ry, ps, sc, anim, wave, waveAxis } from '../../anims/enemies/common';
import type { AnimSet, Key } from '../../render/anim';
import type { ModelDef } from '../../render/types';

const LEGS = [
  ['FR', 0.26, 0.09], ['FL', 0.26, -0.09], ['BR', -0.2, 0.1], ['BL', -0.2, -0.1],
] as const;

function build() {
  const r = new Rig('root');
  const black = mat('scale', 0x3a3a42, { repeat: 3, rim: 0.8 });
  const dots = mat('paint', 0xf0ead2);
  const yellow = mat('scale', 0xe8d27a, { repeat: 3 });
  const belly = mat('scale', 0xe8e2c8, { repeat: 4 });
  const claw = mat('shell', 0x2a2420);

  r.bone('hips', 'root', [-0.12, 0.2, 0]);
  r.bone('chest', 'hips', [0.34, 0.02, 0]);
  r.bone('neck', 'chest', [0.14, 0.03, 0], [0, 0, 8]);
  r.bone('head', 'neck', [0.12, 0.0, 0], [0, 0, -10]);
  r.bone('jaw', 'head', [0.02, -0.03, 0]);
  r.bone('tongue', 'jaw', [0.22, 0.01, 0]);
  r.bone('tail1', 'hips', [-0.16, 0, 0], [0, 0, -6]);
  r.bone('tail2', 'tail1', [-0.22, 0, 0], [0, 0, -4]);
  r.bone('tail3', 'tail2', [-0.22, 0, 0], [0, 0, 4]);
  r.bone('tail4', 'tail3', [-0.2, 0, 0], [0, 0, 6]);
  for (const [n, x, z] of LEGS) {
    const par = n[0] === 'F' ? 'chest' : 'hips';
    r.bone(`leg${n}_up`, par, [n[0] === 'F' ? -0.04 : 0.02 + x * 0, -0.04, z], [z > 0 ? 40 : -40, 0, 0]);
    r.bone(`leg${n}_lo`, `leg${n}_up`, [0, -0.1, 0], [z > 0 ? -40 : 40, 0, 0]);
    r.bone(`foot${n}`, `leg${n}_lo`, [0, -0.08, 0]);
  }

  /* corpo comprido com faixas */
  r.add('hips',
    blob([0.22, 0.1, 0.12], black, { pos: [0.02, 0, 0], deform: [wobble(0.003)] }),
    blob([0.2, 0.06, 0.1], belly, { pos: [0.02, -0.05, 0] }),
  );
  r.add('chest',
    blob([0.24, 0.11, 0.13], black, { pos: [-0.08, 0, 0], deform: [taper('x', -0.24, 0.24, 0.95, 0.85), wobble(0.003)] }),
    blob([0.2, 0.06, 0.11], belly, { pos: [-0.06, -0.06, 0] }),
  );
  // faixas transversais de pintinhas claras (padrão do teiú)
  const band = (bone: string, x: number, rr: number) => {
    for (const [i, a] of [-60, -30, 0, 30, 60, 90].entries()) {
      const ca = Math.cos((a * Math.PI) / 180), sa = Math.sin((a * Math.PI) / 180);
      r.add(bone, blob([0.026, 0.02, 0.022], i % 2 ? dots : yellow, { pos: [x + (i % 2) * 0.012, sa * rr * 0.92 + 0.0, ca * rr * 1.0], seg: 8 }));
      r.add(bone, blob([0.026, 0.02, 0.022], i % 2 ? yellow : dots, { pos: [x + (i % 2) * 0.012, sa * rr * 0.92, -ca * rr * 1.0], seg: 8 }));
    }
  };
  band('hips', -0.12, 0.105); band('hips', 0.06, 0.11); band('chest', -0.2, 0.115); band('chest', -0.02, 0.115);
  /* pescoço e cabeça de focinho comprido */
  r.add('neck', blob([0.1, 0.075, 0.085], black, { pos: [0.03, 0, 0] }), blob([0.09, 0.05, 0.075], belly, { pos: [0.03, -0.035, 0] }));
  r.add('head',
    blob([0.15, 0.065, 0.075], black, { pos: [0.1, 0.01, 0], deform: [taper('x', -0.15, 0.15, 1.1, 0.55), pull([0.0, 0.05, 0], 0.08, [0, 0.015, 0]), bulge([-0.03, -0.04, 0.06], 0.05, 0.015)] }),
    // listra amarela na lateral da cabeça
    tube([[0.2, -0.01, 0.035], [0.1, -0.02, 0.068], [-0.03, -0.03, 0.06]], 0.008, yellow, { seg: 10, radial: 5 }),
    blob([0.006, 0.005, 0.005], mat('skin', 0x0a0a0a), { pos: [0.245, 0.02, 0.02] }),
    // crista de escamas sobre os olhos
    slab([[-0.03, 0], [0.04, 0.008], [0.04, 0.02], [-0.03, 0.015]], 0.012, black, { pos: [0.08, 0.06, 0.04], rot: [0, 20, -12] }),
  );
  const eR = eye({ r: 0.05, iris: 0xd87a18, irisScale: 0.6, look: [0.9, 0], lid: 0.3, lidColor: 0x26262a, angry: 12 });
  eR.position.set(0.07, 0.035, 0.052); eR.rotation.y = 0.6;
  const eL = eye({ r: 0.046, iris: 0xd87a18, irisScale: 0.6, look: [0.9, 0], lid: 0.3, lidColor: 0x26262a, angry: -12 });
  eL.position.set(0.07, 0.035, -0.052); eL.rotation.y = -0.1;
  r.add('head', eR, eL);
  r.bones.lidR = eR.getObjectByName('lid')!;
  r.bones.lidL = eL.getObjectByName('lid')!;
  r.add('jaw',
    blob([0.13, 0.03, 0.06], belly, { pos: [0.1, -0.012, 0], deform: [taper('x', -0.13, 0.13, 1.1, 0.5)] }),
    blob([0.1, 0.012, 0.045], mat('skin', 0xd06070), { pos: [0.1, 0.012, 0] }),
    // dentinhos do sorriso
    ...[0.06, 0.1, 0.14, 0.18].map((x) => spike(0.016, 0.006, mat('shell', 0xf6f0e0), { pos: [x, 0.015, 0.035 - x * 0.08] })),
    // papada branca
    blob([0.06, 0.035, 0.05], belly, { pos: [-0.01, -0.03, 0] }),
  );
  r.add('tongue',
    tube([[0, 0, 0], [0.06, 0, 0], [0.1, 0.008, 0.018]], 0.007, mat('skin', 0x5a5aa8), { seg: 8, radial: 5 }),
    tube([[0.06, 0, 0], [0.1, -0.006, -0.018]], 0.007, mat('skin', 0x5a5aa8), { seg: 6, radial: 5 }),
  );
  r.bones.tongue.scale.setScalar(0.001);
  /* cauda comprida anelada */
  const tr = [0.085, 0.06, 0.042, 0.026];
  for (let i = 0; i < 4; i++) {
    const r0 = tr[i], r1 = i < 3 ? tr[i + 1] : 0.006;
    r.add(`tail${i + 1}`, tube([[0, 0, 0], [-0.11, 0, 0], [-0.23, 0, 0]], (t) => r0 + (r1 - r0) * t, black, { seg: 12, radial: 12 }));
    for (const x of [-0.06, -0.15]) r.add(`tail${i + 1}`, tube([[x, 0, 0], [x - 0.02, 0, 0]], r0 * 0.96 + (r1 - r0) * (-x / 0.23) + 0.003, i % 2 ? yellow : dots, { seg: 2, radial: 12 }));
  }
  /* pernas abertas com dedos compridos */
  for (const [n, , z] of LEGS) {
    const zs = z > 0 ? 1 : -1;
    r.add(`leg${n}_up`, tube([[0, 0, 0], [0, -0.1, 0]], (t) => 0.045 - t * 0.01, black, { seg: 6, radial: 10 }));
    r.add(`leg${n}_lo`, tube([[0, 0, 0], [0, -0.08, 0]], (t) => 0.034 - t * 0.008, black, { seg: 6, radial: 10 }));
    r.add(`foot${n}`,
      blob([0.04, 0.018, 0.035], black, { pos: [0.02, -0.01, 0] }),
      ...[-30, -10, 10, 30].map((a, i) => {
        const ca = Math.cos((a * Math.PI) / 180), sa = Math.sin((a * Math.PI) / 180);
        const L = 0.06 + (i === 2 ? 0.02 : 0);
        return tube([[0.03, -0.015, 0], [0.03 + ca * L * 0.6, -0.022, sa * L * 0.6 * zs], [0.03 + ca * L, -0.026, sa * L * zs]], 0.007, claw, { seg: 6, radial: 5 });
      }),
    );
  }
  r.anchor('head', 'head', [0.05, 0.1, 0]);
  r.bones.head.scale.setScalar(1.3);
  r.root.scale.setScalar(1.5);
  return r;
}

function legCycle(n: number, amp: number, lift: number): Record<string, Key[]> {
  // diagonal: FR+BL juntos, FL+BR juntos
  const ph: Record<string, number> = { FR: 0, BL: 0, FL: 0.5, BR: 0.5 };
  const out: Record<string, Key[]> = {};
  for (const leg of ['FR', 'FL', 'BR', 'BL']) {
    const p = ph[leg];
    out[`leg${leg}_up`] = Array.from({ length: 9 }, (_, i) => rz(i / 8, amp * Math.cos(((i / 8) + p) * Math.PI * 2), 'linear'));
    out[`leg${leg}_lo`] = Array.from({ length: 9 }, (_, i) => rz(i / 8, -lift * Math.max(0, Math.sin(((i / 8) + p) * Math.PI * 2)), 'linear'));
    out[`foot${leg}`] = Array.from({ length: 9 }, (_, i) => rz(i / 8, -amp * 0.6 * Math.cos(((i / 8) + p) * Math.PI * 2), 'linear'));
  }
  return out;
}
const tailWave = (a: number, ph = 0): Record<string, Key[]> => ({ tail1: waveAxis(1, a, ph), tail2: waveAxis(1, a * 1.3, ph - 0.12), tail3: waveAxis(1, a * 1.6, ph - 0.24), tail4: waveAxis(1, a * 2, ph - 0.36) });
const flick = (t0: number): Key[] => [sc(0, 1), sc(t0, 1), sc(t0 + 0.05, 1000), sc(t0 + 0.1, 500), sc(t0 + 0.15, 1000), sc(t0 + 0.2, 1), sc(1, 1)];

function anims(): AnimSet {
  const idle = anim(24, true, {
    hips: [ps(0, [0, 0, 0]), ps(0.5, [0, -0.008, 0]), ps(1, [0, 0, 0])],
    chest: [k(0, [0, 0, 0], undefined, undefined, 1), k(0.5, [0, 0, 1], undefined, undefined, [1, 1.05, 1.04]), k(1, [0, 0, 0], undefined, undefined, 1)],
    neck: [rz(0, 0), rz(0.3, 6), rz(0.5, 6), rz(0.6, -2), rz(1, 0)],
    head: [k(0, [0, 0, 0]), k(0.3, [0, 14, 4]), k(0.55, [0, 14, 4]), k(0.65, [0, 0, 0]), k(1, [0, 0, 0])],
    tongue: flick(0.7),
    ...tailWave(6),
    lidR: [rx(0, 0), rx(0.85, 0), rx(0.88, 60), rx(0.93, 0), rx(1, 0)], lidL: [rx(0, 0), rx(0.85, 0), rx(0.88, 60), rx(0.93, 0), rx(1, 0)],
  });
  const andar = anim(16, true, {
    ...legCycle(16, 34, 40), ...tailWave(14),
    hips: waveAxis(1, 8, 0), chest: waveAxis(1, -12, 0),
    head: waveAxis(1, 8, 0.1),
    tongue: flick(0.4),
  });
  const correr = anim(10, true, {
    ...legCycle(10, 52, 60), ...tailWave(20),
    root: [k(0, [0, 0, 0], [0, 0.0, 0], 'out'), k(0.25, [0, 0, 0], [0, 0.04, 0], 'in'), k(0.5, [0, 0, 0], [0, 0, 0], 'out'), k(0.75, [0, 0, 0], [0, 0.04, 0], 'in'), k(1, [0, 0, 0], [0, 0, 0])],
    hips: waveAxis(1, 14, 0).map((x) => ({ ...x, r: [0, x.r![1], 6] as V3 })), chest: waveAxis(1, -18, 0).map((x) => ({ ...x, r: [0, x.r![1], 4] as V3 })),
    neck: [rz(0, -10), rz(1, -10)],
    jaw: [rz(0, -16), rz(1, -16)],
    tongue: [sc(0, 1000), sc(1, 1000)],
    lidR: [rx(0, 20), rx(1, 20)], lidL: [rx(0, 20), rx(1, 20)],
  });
  const ataque = anim(12, false, {
    hips: [ps(0, [0, 0, 0]), ps(0.3, [-0.06, 0, 0]), ps(0.5, [0.14, 0, 0], 'in'), ps(1, [0, 0, 0])],
    chest: [rz(0, 0), rz(0.3, 10), rz(0.5, -6), rz(1, 0)],
    neck: [rz(0, 0), rz(0.3, 14), rz(0.5, -10), rz(1, 0)],
    head: [rz(0, 0), rz(0.3, 10), rz(0.5, -6), rz(1, 0)],
    jaw: [rz(0, 0), rz(0.3, -40), rz(0.5, -50), rz(0.62, 0, 'in'), rz(1, 0)],
    ...tailWave(10),
    lidR: [rx(0, 0), rx(0.3, 25), rx(0.8, 25), rx(1, 0)], lidL: [rx(0, 0), rx(0.3, 25), rx(0.8, 25), rx(1, 0)],
  });
  const dano = anim(10, false, {
    hips: [k(0, [0, 0, 0], [0, 0, 0]), k(0.2, [0, 0, 14], [-0.12, 0.08, 0], 'out'), k(1, [0, 0, 0], [-0.14, 0, 0], 'bounce')],
    neck: [rz(0, 0), rz(0.2, 30), rz(1, 14)], jaw: [rz(0, 0), rz(0.2, -30), rz(1, -14)],
    tail1: [rz(0, 0), rz(0.2, 30), rz(1, 10)], tail2: [rz(0, 0), rz(0.2, 20), rz(1, 6)],
    lidR: [rx(0, 0), rx(0.15, 70), rx(1, 45)], lidL: [rx(0, 0), rx(0.15, 70), rx(1, 45)],
  });
  // morte: capota e fica de barriga para cima com as patas tremendo
  const morte = anim(24, false, {
    hips: [k(0, [0, 0, 0], [0, 0, 0]), k(0.25, [90, 0, 0], [0, 0.2, 0], 'out'), k(0.55, [180, 0, 0], [0, 0.02, 0], 'in'), k(0.65, [180, 0, 0], [0, 0.06, 0], 'out'), k(1, [180, 0, 0], [0, 0.02, 0], 'bounce')],
    ...Object.fromEntries(['FR', 'FL', 'BR', 'BL'].map((l, i) => [`leg${l}_up`, [rz(0, 0), rz(0.55, 0), rz(0.7, 20 - i * 8), rz(0.8, -10), rz(0.9, 14), rz(1, 6)]])),
    jaw: [rz(0, 0), rz(0.55, -30), rz(1, -26)], tongue: [sc(0, 1), sc(0.6, 1), sc(0.65, 1000), sc(1, 1000)],
    lidR: [rx(0, 0), rx(0.25, -30), rx(0.55, 80), rx(1, 80)], lidL: [rx(0, 0), rx(0.25, -30), rx(0.55, 80), rx(1, 80)],
    tail4: [rz(0, 0), rz(0.6, 0), rz(0.75, 40), rz(0.9, -20), rz(1, 0)],
  });
  const tonto = anim(16, true, {
    neck: Array.from({ length: 9 }, (_, i) => k(i / 8, [16 * Math.sin((i / 8) * Math.PI * 2), 0, 10 * Math.cos((i / 8) * Math.PI * 2)], undefined, 'linear')),
    hips: waveAxis(0, 6, 0.3),
    jaw: [rz(0, -20), rz(1, -20)], tongue: [sc(0, 1000), sc(1, 1000)],
    ...tailWave(10, 0.4),
    lidR: [rx(0, 45), rx(1, 45)], lidL: [rx(0, 15), rx(1, 15)],
  });
  return { idle, andar, correr, ataque, dano, morte, tonto };
}

export const lagarto: ModelDef = {
  id: 'lagarto',
  kind: 'enemy',
  build,
  anims: anims(),
  cell: [384, 192],
  pivot: [216, 170],
  height: 192 / 104,
  presets: ['caverna', 'neutro'],
};
