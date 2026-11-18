/**
 * MORCEGO-LANTERNA — morcego orelhudo de pelagem roxo-acinzentada, com uma lanterna de
 * mineiro amarrada no peito (o facho ilumina o chão), focinho de porquinho, presinhas e
 * asas de membrana com dedos. Mergulha quando o herói passa embaixo e apaga as luzes.
 */
import { Rig, blob, tube, slab, lathe, ring, spike, eye, mat, taper, pull, bulge, wobble, D2R, type V3 } from '../../render/sculpt';
import { k, rz, rx, ry, ps, sc, bob, anim, wave, waveAxis } from '../../anims/enemies/common';
import type { AnimSet, Key } from '../../render/anim';
import type { ModelDef } from '../../render/types';
import { dbl } from '../props/kit';

type P2 = [number, number];
const flipY = (o: P2[]): P2[] => o.map(([x, y]) => [x, -y]);
/** Arco côncavo (Bézier quadrática) de `a` até `b` puxado por `c`; devolve os pontos depois de `a`, incluindo `b`. */
function arc(a: P2, c: P2, b: P2, n = 7): P2[] {
  return Array.from({ length: n }, (_, i) => {
    const t = (i + 1) / n, u = 1 - t;
    return [u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]] as P2;
  });
}

function build() {
  const r = new Rig('root');
  // pelagem mais clara, com luz própria suave e rim reforçado: na gruta o corpo não pode virar silhueta
  const fur = mat('fur', 0x9484ac, { repeat: 4, rim: 1.25, emissive: 0x6a5a88, emissiveIntensity: 0.22 });
  const furDark = mat('fur', 0x6c5c88, { repeat: 4, rim: 1.25, emissive: 0x4a3e66, emissiveIntensity: 0.2 });
  const belly = mat('fur', 0xbcaed0, { repeat: 4, rim: 1.1, emissive: 0x7a6c90, emissiveIntensity: 0.2 });
  // membrana translúcida (deixa passar a luz e o fundo), dedos escuros e veias claras por cima
  const membrane = dbl(mat('skin', 0xb47aa6, { rough: 0.45, rim: 1.4, opacity: 0.6, emissive: 0x7a3466, emissiveIntensity: 0.4 }));
  const bone = mat('skin', 0x4a3252, { rough: 0.45, rim: 1.2 });
  const vein = mat('skin', 0xf0b8d0, { rough: 0.5, rim: 0.6, emissive: 0xc0608a, emissiveIntensity: 0.35 });
  const pink = mat('skin', 0xd890a0, { rough: 0.4 });
  const lampBody = mat('plastic', 0xe8c030, { rough: 0.35 });
  const strap = mat('leather', 0x3a2618);

  r.bone('body', 'root', [0, 0.62, 0]);
  r.bone('head', 'body', [0.06, 0.16, 0]);
  r.bone('earR', 'head', [-0.02, 0.1, 0.07], [20, 0, -8]);
  r.bone('earL', 'head', [-0.02, 0.1, -0.07], [-20, 0, -8]);
  r.bone('jaw', 'head', [0.08, -0.05, 0]);
  r.bone('lamp', 'body', [0.15, -0.0, 0], [0, 0, -30]);
  for (const s of ['R', 'L'] as const) {
    const zs = s === 'R' ? 1 : -1;
    r.bone(`wing${s}`, 'body', [0.02, 0.08, 0.1 * zs], [90 * zs * 0 + 0, 0, 0]);
    r.bone(`wing${s}2`, `wing${s}`, [0, 0, 0.26 * zs]);
    r.bone(`foot${s}`, 'body', [-0.06, -0.14, 0.05 * zs]);
  }

  /* corpo peludo e barriguinha */
  r.add('body',
    blob([0.15, 0.17, 0.14], fur, { deform: [taper('y', -0.17, 0.17, 0.85, 1.05), wobble(0.004)] }),
    blob([0.1, 0.12, 0.1], belly, { pos: [0.06, -0.02, 0], scale: [0.9, 1, 1] }),
    // tufo de pelo no peito
    ...[-0.03, 0, 0.03].map((z, i) => spike(0.05, 0.02, furDark, { pos: [0.08, 0.1, z], rot: [z * 400, 0, -40 - i * 4], curve: 0.3 })),
    // alça da lanterna atravessando o corpo
    ring(0.155, 0.014, strap, { pos: [0.0, 0.02, 0], rot: [90, 0, -30], scale: [1, 1.05, 1] }),
  );
  /* cabeça redonda, focinho de porquinho, presinhas */
  r.add('head',
    blob([0.12, 0.11, 0.12], fur, { deform: [pull([0.1, -0.03, 0], 0.08, [0.03, -0.01, 0]), wobble(0.003)] }),
    blob([0.045, 0.035, 0.05], pink, { pos: [0.12, -0.02, 0], deform: [taper('x', -0.04, 0.04, 1.0, 0.8)] }),
    blob([0.008, 0.012, 0.008], mat('skin', 0x3a1a20), { pos: [0.16, -0.015, 0.016] }),
    blob([0.008, 0.012, 0.008], mat('skin', 0x3a1a20), { pos: [0.16, -0.015, -0.016] }),
    // topete
    ...[[-0.02, 0.11, 0], [0.02, 0.11, 0.02], [0.0, 0.115, -0.02]].map((p, i) => spike(0.06, 0.022, furDark, { pos: p as V3, rot: [0, 0, 20 - i * 25], curve: -0.4 })),
  );
  const eR = eye({ r: 0.05, iris: 0xf2c020, irisScale: 0.62, look: [0.6, -0.4], lid: 0.25, lidColor: 0x6c5c88, angry: 8 });
  eR.position.set(0.08, 0.03, 0.065); eR.rotation.y = 0.7;
  const eL = eye({ r: 0.048, iris: 0xf2c020, irisScale: 0.62, look: [0.6, -0.4], lid: 0.25, lidColor: 0x6c5c88, angry: -8 });
  eL.position.set(0.08, 0.03, -0.065); eL.rotation.y = 0.0;
  r.add('head', eR, eL);
  r.bones.lidR = eR.getObjectByName('lid')!;
  r.bones.lidL = eL.getObjectByName('lid')!;
  r.add('jaw',
    blob([0.06, 0.02, 0.06], fur, { pos: [0.02, -0.01, 0] }),
    blob([0.04, 0.01, 0.04], mat('skin', 0x8a2a3a), { pos: [0.03, 0.006, 0] }),
    spike(0.03, 0.009, mat('shell', 0xfaf6ea), { pos: [0.065, 0.01, 0.02], rot: [0, 0, 0] }),
    spike(0.03, 0.009, mat('shell', 0xfaf6ea), { pos: [0.065, 0.01, -0.02], rot: [0, 0, 0] }),
  );
  /* orelhonas */
  const earShape: [number, number][] = [[-0.04, 0], [0.04, 0], [0.06, 0.1], [0.03, 0.2], [-0.02, 0.12]];
  for (const s of ['R', 'L'] as const) {
    const zs = s === 'R' ? 1 : -1;
    r.add(`ear${s}`,
      slab(earShape, 0.02, furDark, { deform: [bulge([0.01, 0.1, 0], 0.08, 0.01)] }),
      slab([[-0.025, 0.02], [0.025, 0.02], [0.04, 0.1], [0.025, 0.16], [-0.01, 0.1]], 0.008, pink, { pos: [0.005, 0, 0.014 * zs] }),
    );
  }
  /* lanterna de mineiro no peito com facho de luz */
  r.add('lamp',
    lathe([[0.04, -0.04], [0.045, 0.0], [0.06, 0.04], [0.065, 0.06], [0.058, 0.065], [0.04, 0.065]], lampBody, { rot: [0, 0, -90] }),
    lathe([[0.001, 0.058], [0.055, 0.058], [0.055, 0.062], [0.001, 0.066]], mat('glow', 0xfff4b0, { emissiveIntensity: 1.6 }), { rot: [0, 0, -90] }),
    ring(0.062, 0.008, mat('metal', 0xc8c8c8, { metal: 0.5, rough: 0.3 }), { pos: [0.062, 0, 0], rot: [0, 90, 0] }),
    tube([[-0.04, 0.04, 0], [-0.02, 0.06, 0], [0.02, 0.06, 0]], 0.008, mat('metal', 0x8a8a8a, { metal: 0.5 }), { seg: 6, radial: 5 }),
    // facho de luz (cone translúcido)
    lathe([[0.06, 0.07], [0.15, 0.36], [0.001, 0.37]], mat('glow', 0xfff2a0, { opacity: 0.2, emissiveIntensity: 0.9 }), { rot: [0, 0, -90], name: 'beam', castShadow: false }),
  );
  r.bones.beam = r.bones.lamp.getObjectByName('beam')!;
  /* asas: braço + quatro dedos, membrana translúcida de borda recortada em arcos e veias */
  // contornos em (envergadura, corda): corda negativa = para trás. O punho fica em envergadura 0.26.
  const inner: P2[] = [[0, 0.04], [0.13, 0.065], [0.26, 0.035], [0.3, -0.1], [0.29, -0.23], ...arc([0.29, -0.23], [0.14, -0.1], [0, -0.2]), [-0.02, -0.08]];
  const TIPS: P2[] = [[0.2, 0.12], [0.27, -0.02], [0.19, -0.17], [0.03, -0.25]];
  const outer: P2[] = [[-0.01, 0.03], TIPS[0], ...arc(TIPS[0], [0.19, 0.04], TIPS[1]), ...arc(TIPS[1], [0.18, -0.07], TIPS[2]), ...arc(TIPS[2], [0.1, -0.14], TIPS[3]), [-0.01, -0.2]];
  for (const s of ['R', 'L'] as const) {
    const zs = s === 'R' ? 1 : -1;
    /** ponto (envergadura, corda) → espaço do osso da asa (a membrana fica no plano XZ) */
    const at = (p: P2, y = 0): V3 => [p[1], y, p[0] * zs];
    const veinTube = (pts: P2[]) => tube(pts.map((p) => at(p, 0.001)), (t) => 0.0055 * (1 - t * 0.6), vein, { seg: 10, radial: 5, castShadow: false });
    // braço interno (do ombro ao punho) e membrana interna, presa ao flanco
    r.add(`wing${s}`,
      tube([[0, 0, 0], [0.05, 0.03, 0.13 * zs], [0.01, 0.015, 0.26 * zs]], (t) => 0.02 - t * 0.005, bone, { seg: 10, radial: 8 }),
      blob([0.024, 0.022, 0.024], bone, { pos: [0.05, 0.03, 0.13 * zs] }),
      slab(flipY(inner), 0.006, membrane, { rot: [90 * zs, 0, 90], smooth: false, bevel: 0.002, castShadow: false }),
      veinTube([[0.05, 0.04], [0.07, -0.05], [0.06, -0.15]]),
      veinTube([[0.14, 0.05], [0.17, -0.04], [0.2, -0.14]]),
      veinTube([[0.17, -0.04], [0.12, -0.09]]),
      veinTube([[0.23, 0.03], [0.26, -0.08], [0.27, -0.18]]),
    );
    // mão: quatro dedos longos abertos em leque; a membrana estica entre as pontas
    r.add(`wing${s}2`,
      ...TIPS.map((p, i) => tube([[0, 0.004, 0], at([p[0] * 0.5, p[1] * 0.5 + (i === 0 ? 0.015 : 0)], 0.012), at(p, 0.004)], (t) => 0.014 * (1 - t * 0.62), bone, { seg: 12, radial: 6 })),
      slab(flipY(outer), 0.006, membrane, { rot: [90 * zs, 0, 90], smooth: false, bevel: 0.002, castShadow: false }),
      veinTube([[0.03, 0.02], [0.12, 0.045], [0.2, 0.05]]),
      veinTube([[0.04, -0.01], [0.13, -0.05], [0.2, -0.08]]),
      veinTube([[0.03, -0.05], [0.08, -0.13], [0.11, -0.17]]),
      // polegar em garra no punho
      spike(0.045, 0.012, bone, { pos: [0.01, 0.01, 0], rot: [0, 0, -50], curve: 0.5 }),
      blob([0.02, 0.018, 0.02], bone, { pos: [0, 0.004, 0] }),
    );
    r.add(`foot${s}`,
      tube([[0, 0, 0], [-0.01, -0.05, 0]], 0.014, bone, { seg: 4, radial: 6 }),
      ...[-1, 0, 1].map((d) => spike(0.04, 0.008, bone, { pos: [-0.01, -0.05, d * 0.012], rot: [0, 0, 160], curve: 0.6 })),
    );
  }
  r.anchor('head', 'head', [0, 0.25, 0]);
  for (const w of ['wingR', 'wingL']) r.bones[w].scale.setScalar(1.45);
  return r;
}

function anims(): AnimSet {
  const flap = (n: number, amp = 1, ph = 0): Record<string, Key[]> => ({
    wingR: waveAxis(0, 55 * amp, ph, 8).map((x) => ({ ...x, r: [x.r![0] - 10, 0, 0] as V3 })),
    wingL: waveAxis(0, -55 * amp, ph, 8).map((x) => ({ ...x, r: [x.r![0] + 10, 0, 0] as V3 })),
    wingR2: waveAxis(0, 35 * amp, ph - 0.12, 8),
    wingL2: waveAxis(0, -35 * amp, ph - 0.12, 8),
    body: bob(0.05 + n * 0, ph + 0.25, 8),
  });
  const voar = anim(12, true, {
    ...flap(12),
    head: wave(4, 0.3), earR: wave(6, 0.1), earL: wave(6, 0.35),
    footR: wave(10, 0.2), footL: wave(10, 0.4),
    beam: [sc(0, 1), sc(0.5, [1, 1.05, 1.05]), sc(1, 1)],
    lidR: [rx(0, 0), rx(0.6, 0), rx(0.65, 60), rx(0.72, 0), rx(1, 0)], lidL: [rx(0, 0), rx(0.6, 0), rx(0.65, 60), rx(0.72, 0), rx(1, 0)],
  });
  const andar = anim(12, true, { ...voar.keys, root: [rz(0, -12), rz(1, -12)] });
  const ataque = anim(12, false, {
    ...flap(12, 1.3),
    root: [k(0, [0, 0, 0], [0, 0, 0]), k(0.3, [0, 0, 20], [-0.08, 0.08, 0], 'out'), k(0.55, [0, 0, -30], [0.2, -0.1, 0], 'in'), k(1, [0, 0, 0], [0, 0, 0])],
    jaw: [rz(0, 0), rz(0.3, -40), rz(0.6, -50), rz(0.7, 0), rz(1, 0)],
    head: [rz(0, 0), rz(0.3, 14), rz(0.55, -10), rz(1, 0)],
    lidR: [rx(0, 0), rx(0.3, 25), rx(0.8, 25), rx(1, 0)], lidL: [rx(0, 0), rx(0.3, 25), rx(0.8, 25), rx(1, 0)],
  });
  // mergulho: asas fechadas, de cabeça, com a lanterna apontando para baixo
  const mergulho = anim(10, true, {
    root: [k(0, [0, 0, -70], [0, 0.1, 0]), k(1, [0, 0, -70], [0, 0.1, 0])],
    wingR: [rx(0, -70), rx(0.5, -62), rx(1, -70)], wingL: [rx(0, 70), rx(0.5, 62), rx(1, 70)],
    wingR2: [rx(0, -80), rx(1, -80)], wingL2: [rx(0, 80), rx(1, 80)],
    earR: [rz(0, -50), rz(0.5, -40), rz(1, -50)], earL: [rz(0, -50), rz(0.5, -60), rz(1, -50)],
    jaw: [rz(0, -30), rz(1, -30)],
    footR: [rz(0, 60), rz(1, 60)], footL: [rz(0, 60), rz(1, 60)],
    lidR: [rx(0, -20), rx(1, -20)], lidL: [rx(0, -20), rx(1, -20)],
  });
  // pendurado: de ponta-cabeça no teto, enrolado nas asas, balançando e roncando
  const pendurado = anim(24, true, {
    root: [k(0, [0, 0, 180], [0, 1.12, 0]), k(0.5, [0, 0, 186], [0, 1.12, 0]), k(1, [0, 0, 180], [0, 1.12, 0])],
    body: [ps(0, [0, -0.62 + 0.62, 0]), ps(1, [0, 0, 0])],
    wingR: [rx(0, -80), rx(1, -80)], wingL: [rx(0, 80), rx(1, 80)],
    wingR2: [rx(0, -100), rx(1, -100)], wingL2: [rx(0, 100), rx(1, 100)],
    footR: [rz(0, 180), rz(1, 180)], footL: [rz(0, 180), rz(1, 180)],
    head: [rz(0, 10), rz(0.5, 4), rz(1, 10)],
    lidR: [rx(0, 75), rx(1, 75)], lidL: [rx(0, 75), rx(1, 75)],
    beam: [sc(0, 0.001), sc(1, 0.001)],
    jaw: [rz(0, 0), rz(0.5, -10), rz(1, 0)],
  });
  const dano = anim(10, false, {
    ...flap(10, 1.4),
    root: [k(0, [0, 0, 0], [0, 0, 0]), k(0.2, [20, 0, 40], [-0.14, 0.06, 0], 'out'), k(1, [0, 0, 10], [-0.1, 0, 0])],
    jaw: [rz(0, 0), rz(0.2, -40), rz(1, -20)],
    beam: [sc(0, 1), sc(0.1, 0.001), sc(0.3, 1), sc(0.4, 0.001), sc(0.6, 1)],
    lidR: [rx(0, 0), rx(0.15, 70), rx(1, 45)], lidL: [rx(0, 0), rx(0.15, 70), rx(1, 45)],
  });
  const morte = anim(24, false, {
    root: [k(0, [0, 0, 0], [0, 0, 0]), k(0.25, [0, 0, 30], [0, 0.1, 0], 'out'), k(0.7, [0, 0, 160], [0, -0.5, 0], 'in'), k(0.8, [0, 0, 170], [0, -0.44, 0], 'out'), k(1, [0, 0, 180], [0, -0.5, 0], 'in')],
    wingR: [rx(0, 0), rx(0.25, 40), rx(0.7, 30), rx(1, 50)], wingL: [rx(0, 0), rx(0.25, -40), rx(0.7, -30), rx(1, -50)],
    beam: [sc(0, 1), sc(0.3, 1), sc(0.35, 0.001), sc(0.45, 1), sc(0.5, 0.001), sc(1, 0.001)],
    jaw: [rz(0, 0), rz(0.25, -40), rz(1, -30)],
    lidR: [rx(0, 0), rx(0.25, -30), rx(0.7, 80), rx(1, 80)], lidL: [rx(0, 0), rx(0.25, -30), rx(0.7, 80), rx(1, 80)],
  });
  const tonto = anim(16, true, {
    ...flap(16, 0.7),
    root: Array.from({ length: 9 }, (_, i) => k(i / 8, [14 * Math.sin((i / 8) * Math.PI * 2), 0, 10 * Math.cos((i / 8) * Math.PI * 2)], [0.04 * Math.cos((i / 8) * Math.PI * 2), -0.06, 0], 'linear')),
    lamp: wave(20, 0, 0),
    earR: wave(20, 0), earL: wave(20, 0.5),
    jaw: [rz(0, -20), rz(1, -20)],
    lidR: [rx(0, 45), rx(1, 45)], lidL: [rx(0, 15), rx(1, 15)],
  });
  return { idle: voar, voar, andar, ataque, dano, morte, tonto, mergulho, pendurado };
}

export const morcego: ModelDef = {
  id: 'morcego',
  kind: 'enemy',
  build,
  anims: anims(),
  cell: [256, 224],
  pivot: [120, 200],
  height: 224 / 104,
  presets: ['caverna', 'neutro'],
};
