/**
 * CASCAVEL MOLA — cobra de losangos com chocalho estalando, que se enrola feito mola
 * e salta em arco. Corpo em 10 segmentos articulados, cabeça triangular com olhar
 * debochado, presas e língua bifurcada.
 */
import { Rig, blob, tube, slab, lathe, spike, eye, mat, pull, taper, bulge } from '../../render/sculpt';
import { k, rz, rx, ry, ps, sc, anim, wave, waveAxis } from '../../anims/enemies/common';
import type { AnimSet, Key } from '../../render/anim';
import type { ModelDef } from '../../render/types';

const N = 10;
const SEG = 0.1;
// pose de repouso (Z) dos segmentos: cauda no chão, frente erguida em "S"
const REST = [0, 0, 0, 0, 0, 0, 34, 30, -26, -34];
const radius = (i: number) => 0.045 + Math.sin(((i + 1) / (N + 1)) * Math.PI) * 0.035;

function build() {
  const r = new Rig('root');
  const scaleM = mat('scale', 0xb8945a, { repeat: 2 });
  const belly = mat('shortFur', 0xe6d6a8, { repeat: 2 });
  const diamond = mat('scale', 0x3a2414, { repeat: 3 });
  const diamondEdge = mat('paint', 0xfff0c0);
  const rattleM = mat('shell', 0xd8c49a, { repeat: 2 });

  r.bone('base', 'root', [-0.45, 0.05, 0]);
  let parent = 'base';
  for (let i = 0; i < N; i++) {
    r.bone(`s${i}`, parent, i === 0 ? [0, 0, 0] : [SEG, 0, 0], [0, 0, REST[i]]);
    parent = `s${i}`;
    const rr = radius(i);
    r.add(`s${i}`,
      tube([[0, 0, 0], [SEG * 0.5, 0, 0], [SEG, 0, 0]], (t) => rr + (radius(i + 1) - rr) * t, scaleM, { seg: 8, radial: 16, scale: [1, 1, 1.08] }),
      tube([[0, -rr * 0.42, 0], [SEG, -radius(i + 1) * 0.42, 0]], (t) => (rr + (radius(i + 1) - rr) * t) * 0.62, belly, { seg: 4, radial: 12, scale: [1, 1, 1.35] }),
    );
    if (i > 0 && i < N) {
      // losango escuro com borda clara no dorso
      r.add(`s${i}`,
        slab([[0, -0.04], [0.045, 0], [0, 0.04], [-0.045, 0]], 0.01, diamondEdge, { pos: [SEG * 0.5, rr * 0.92, 0], rot: [90, 0, 0], scale: [rr * 22, rr * 22, 1], smooth: false, bevel: 0.003 }),
        slab([[0, -0.03], [0.034, 0], [0, 0.03], [-0.034, 0]], 0.01, diamond, { pos: [SEG * 0.5, rr * 0.99, 0], rot: [90, 0, 0], scale: [rr * 20, rr * 20, 1], smooth: false, bevel: 0.003 }),
      );
    }
  }
  /* chocalho: anéis empilhados na ponta da cauda, erguido */
  r.bone('rattle', 'base', [0, 0.01, 0], [0, 0, 130]);
  r.add('rattle',
    ...[0, 1, 2, 3, 4].map((i) => lathe([[0.001, -0.022], [0.03 - i * 0.003, -0.018], [0.036 - i * 0.004, 0], [0.03 - i * 0.003, 0.018], [0.001, 0.022]], rattleM, { pos: [0.035 * i + 0.03, 0, 0], rot: [0, 0, -90], scale: [1, 1, 0.8] })),
    tube([[-0.02, 0, 0], [0.03, 0, 0]], 0.03, scaleM, { seg: 4, radial: 10 }),
  );
  /* cabeça triangular */
  r.bone('head', `s${N - 1}`, [SEG, 0, 0], [0, 0, 10]);
  r.bone('jaw', 'head', [0.0, -0.025, 0]);
  r.bone('tongue', 'jaw', [0.14, 0.01, 0]);
  r.add('head',
    blob([0.12, 0.06, 0.085], scaleM, { pos: [0.07, 0.01, 0], deform: [pull([-0.06, 0, 0.08], 0.06, [0, 0, 0.02]), pull([-0.06, 0, -0.08], 0.06, [0, 0, -0.02]), taper('x', -0.12, 0.12, 1.15, 0.7), bulge([0.04, 0.05, 0], 0.06, 0.01)] }),
    // placa escura no topo da cabeça e "máscara" atrás dos olhos
    blob([0.08, 0.02, 0.06], diamond, { pos: [0.06, 0.06, 0] }),
    tube([[0.13, 0.03, 0.06], [0.06, 0.0, 0.085], [-0.02, -0.02, 0.08]], 0.012, diamond, { seg: 10, radial: 6 }),
    // narinas
    blob([0.008, 0.006, 0.006], mat('skin', 0x1a1210), { pos: [0.17, 0.03, 0.025] }),
    // sobrancelha escamosa debochada
    slab([[-0.035, 0], [0.035, 0.012], [0.04, 0.024], [-0.03, 0.018]], 0.014, diamond, { pos: [0.1, 0.07, 0.05], rot: [0, 30, -20] }),
  );
  const eR = eye({ r: 0.035, iris: 0xe8c020, irisScale: 0.7, look: [0.8, 0], lid: 0.42, lidColor: 0x8a6a40, angry: 16 });
  eR.position.set(0.1, 0.04, 0.055); eR.rotation.y = 0.6;
  const eL = eye({ r: 0.033, iris: 0xe8c020, irisScale: 0.7, look: [0.8, 0], lid: 0.42, lidColor: 0x8a6a40, angry: -16 });
  eL.position.set(0.1, 0.04, -0.055); eL.rotation.y = -0.1;
  r.add('head', eR, eL);
  r.bones.lidR = eR.getObjectByName('lid')!;
  r.bones.lidL = eL.getObjectByName('lid')!;
  r.add('jaw',
    blob([0.1, 0.022, 0.065], belly, { pos: [0.08, -0.012, 0], deform: [taper('x', -0.1, 0.1, 1.1, 0.6)] }),
    blob([0.08, 0.012, 0.05], mat('skin', 0xc84a5a), { pos: [0.08, 0.005, 0] }),
  );
  // presas (penduradas na cabeça)
  r.add('head',
    spike(0.045, 0.01, mat('shell', 0xf6f0e0), { pos: [0.15, -0.02, 0.025], rot: [0, 0, 180], curve: 0.3 }),
    spike(0.045, 0.01, mat('shell', 0xf6f0e0), { pos: [0.15, -0.02, -0.025], rot: [0, 0, 180], curve: 0.3 }),
  );
  r.add('tongue',
    tube([[0, 0, 0], [0.04, 0, 0], [0.07, 0.006, 0.014]], 0.006, mat('skin', 0xd8304a), { seg: 8, radial: 5 }),
    tube([[0.04, 0, 0], [0.07, -0.004, -0.014]], 0.006, mat('skin', 0xd8304a), { seg: 6, radial: 5 }),
  );
  r.bones.tongue.scale.setScalar(0.001);
  r.anchor('head', 'head', [0.05, 0.08, 0]);
  r.bones.head.scale.setScalar(1.35);
  r.root.scale.setScalar(1.5);
  return r;
}

function segs(fn: (i: number) => Key[]): Record<string, Key[]> {
  return Object.fromEntries(Array.from({ length: N }, (_, i) => [`s${i}`, fn(i)]));
}
const flick = (t0: number): Key[] => [sc(0, 1), sc(t0, 1), sc(t0 + 0.05, 1000), sc(t0 + 0.1, 600), sc(t0 + 0.15, 1000), sc(t0 + 0.2, 1), sc(1, 1)];
const rattleShake = (n: number): Key[] => Array.from({ length: n + 1 }, (_, i) => k(i / n, [i % 2 ? 22 : -22, 0, 0], undefined, 'linear'));

function anims(): AnimSet {
  const idle = anim(24, true, {
    ...segs((i) => (i >= 5 ? wave(4 + (i - 5) * 1.5, 0.15 * i) : [rz(0, 0), rz(1, 0)])),
    head: wave(5, 0.9),
    rattle: rattleShake(24),
    tongue: flick(0.4),
    lidR: [rx(0, 0), rx(0.8, 0), rx(0.84, 60), rx(0.9, 0), rx(1, 0)], lidL: [rx(0, 0), rx(0.8, 0), rx(0.84, 60), rx(0.9, 0), rx(1, 0)],
  });
  // rastejar: onda lateral (Y) correndo da cabeça para a cauda
  const andar = anim(16, true, {
    ...segs((i) => waveAxis(1, i < 6 ? 26 : 14, -i * 0.12, 0, 8)),
    head: waveAxis(1, -14, 0.1),
    rattle: rattleShake(16),
    tongue: flick(0.6),
  });
  const ataque = anim(12, false, {
    base: [ps(0, [0, 0, 0]), ps(0.3, [-0.06, 0, 0]), ps(0.5, [0.18, 0, 0], 'in'), ps(0.7, [0.18, 0, 0]), ps(1, [0, 0, 0])],
    ...segs((i) => (i >= 6 ? [rz(0, 0), rz(0.3, REST[i] * 0.5), rz(0.5, -REST[i] * 0.95, 'in'), rz(0.7, -REST[i] * 0.9), rz(1, 0)] : [rz(0, 0), rz(1, 0)])),
    head: [rz(0, 0), rz(0.3, 10), rz(0.5, -6), rz(1, 0)],
    jaw: [rz(0, 0), rz(0.3, -20), rz(0.5, -50), rz(0.7, -40), rz(1, 0)],
    rattle: rattleShake(12),
    lidR: [rx(0, 0), rx(0.3, 25), rx(0.8, 25), rx(1, 0)], lidL: [rx(0, 0), rx(0.3, 25), rx(0.8, 25), rx(1, 0)],
  });
  // enrolar: vira uma mola de 1,5 volta com a cabeça no topo
  const coilY = 52, coilZ = 9;
  const coilPose = (i: number): [number, number, number] => [0, i === 0 ? 0 : coilY, (i === 0 ? 0 : coilZ) - REST[i]];
  const enrolar = anim(14, false, {
    base: [ps(0, [0, 0, 0]), ps(1, [0.18, 0, 0])],
    ...segs((i) => [k(0, [0, 0, 0]), k(0.5, [0, coilY * 0.5, coilZ * 0.5 - REST[i] * 0.6]), k(1, coilPose(i), undefined, 'out')]),
    head: [k(0, [0, 0, 0]), k(1, [0, -108, 20])],
    rattle: rattleShake(14),
    lidR: [rx(0, 0), rx(1, 25)], lidL: [rx(0, 0), rx(1, 25)],
  });
  // saltar: a mola solta e a cobra voa esticada como flecha
  const saltar = anim(12, false, {
    base: [k(0, [0, 0, 0], [0.18, 0, 0]), k(0.25, [0, 0, 20], [0.1, 0.25, 0], 'out'), k(0.6, [0, 0, 8], [0.0, 0.38, 0]), k(1, [0, 0, -12], [-0.05, 0.3, 0])],
    ...segs((i) => [k(0, coilPose(i)), k(0.3, [0, 0, -REST[i] + (i < 5 ? 4 : -3)], undefined, 'out'), k(0.6, [0, 4, -REST[i] + (i < 5 ? 3 : -2)]), k(1, [0, -4, -REST[i] + (i < 5 ? 2 : -4)])]),
    head: [k(0, [0, -108, 20]), k(0.3, [0, 0, -10]), k(1, [0, 0, -16])],
    jaw: [rz(0, 0), rz(0.3, -40), rz(1, -30)],
    rattle: [rz(0, 0), rz(0.3, -100), rz(1, -110)],
    lidR: [rx(0, 25), rx(0.3, -20), rx(1, -20)], lidL: [rx(0, 25), rx(0.3, -20), rx(1, -20)],
  });
  const dano = anim(10, false, {
    ...segs((i) => (i >= 6 ? [rz(0, 0), rz(0.2, -REST[i] * 0.8 + 20), rz(1, -REST[i] * 0.3 + 6)] : [rz(0, 0), rz(0.2, i * 2), rz(1, i)])),
    head: [rz(0, 0), rz(0.2, 40), rz(1, 20)],
    jaw: [rz(0, 0), rz(0.2, -30), rz(1, -16)],
    rattle: [rz(0, 0), rz(0.2, 30), rz(1, 10)],
    lidR: [rx(0, 0), rx(0.15, 70), rx(1, 45)], lidL: [rx(0, 0), rx(0.15, 70), rx(1, 45)],
  });
  const morte = anim(24, false, {
    base: [k(0, [0, 0, 0], [0, 0, 0]), k(0.3, [90, 0, 0], [0, 0.12, 0], 'out'), k(0.6, [180, 0, 0], [0, 0.06, 0], 'in'), k(1, [180, 0, 0], [0, 0.06, 0])],
    ...segs((i) => [rz(0, 0), rz(0.6, i >= 6 ? -REST[i] : 0), rz(0.8, i >= 6 ? -REST[i] + 8 : 2), rz(1, i >= 6 ? -REST[i] : 0)]),
    head: [rz(0, 0), rz(0.6, -10), rz(1, -20)],
    jaw: [rz(0, 0), rz(0.6, -30), rz(1, -24)],
    tongue: [sc(0, 1), sc(0.6, 1), sc(0.7, 1000), sc(1, 1000)],
    rattle: [rz(0, 0), rz(0.6, -60), rz(0.8, -40), rz(1, -70)],
    lidR: [rx(0, 0), rx(0.3, -30), rx(0.6, 80), rx(1, 80)], lidL: [rx(0, 0), rx(0.3, -30), rx(0.6, 80), rx(1, 80)],
  });
  const tonto = anim(16, true, {
    ...segs((i) => (i >= 5 ? waveAxis(1, 6 + (i - 5) * 4, -i * 0.1) : [rz(0, 0), rz(1, 0)])),
    head: Array.from({ length: 9 }, (_, i) => k(i / 8, [20 * Math.sin((i / 8) * Math.PI * 2), 0, 14 * Math.cos((i / 8) * Math.PI * 2)], undefined, 'linear')),
    jaw: [rz(0, -18), rz(1, -18)],
    tongue: [sc(0, 1000), sc(1, 1000)],
    rattle: wave(20, 0, -30),
    lidR: [rx(0, 45), rx(1, 45)], lidL: [rx(0, 15), rx(1, 15)],
  });
  return { idle, andar, ataque, dano, morte, tonto, enrolar, saltar };
}

export const cascavel: ModelDef = {
  id: 'cascavel',
  kind: 'enemy',
  build,
  anims: anims(),
  cell: [320, 224],
  pivot: [168, 200],
  height: 224 / 104,
  presets: ['selva', 'caverna', 'neutro'],
};
