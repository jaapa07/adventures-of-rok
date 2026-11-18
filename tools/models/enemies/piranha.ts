/**
 * PIRANHA-BOIA — piranha-vermelha de queixo enorme e dentes triangulares, presa a uma boia
 * salva-vidas listrada (que ela não consegue tirar). Nada em padrão autoral e persegue de perto.
 */
import { Rig, blob, tube, slab, lathe, ring, spike, eye, mat, taper, pull, bulge, wobble, D2R, type V3 } from '../../render/sculpt';
import { k, rz, rx, ry, ps, anim, wave, waveAxis, bob } from '../../anims/enemies/common';
import type { AnimSet } from '../../render/anim';
import type { ModelDef } from '../../render/types';

function build() {
  const r = new Rig('root');
  const back = mat('scale', 0x7a8a96, { repeat: 3, metal: 0.25, rough: 0.35 });
  const belly = mat('scale', 0xe0482a, { repeat: 3 });
  const fin = mat('skin', 0x5a6a78, { rough: 0.4, opacity: 0.92 });
  const finRed = mat('skin', 0xc83a22, { rough: 0.4 });
  const tooth = mat('shell', 0xfbf6e6, { rough: 0.25 });
  const red = mat('plastic', 0xe23028, { rough: 0.45 });
  const white = mat('plastic', 0xf6f2ea, { rough: 0.45 });
  const rope = mat('cloth', 0xd8c088, { repeat: 6 });

  r.bone('body', 'root', [0, 0.46, 0]);
  r.bone('tail', 'body', [-0.24, 0.0, 0]);
  r.bone('tailFin', 'tail', [-0.12, 0, 0]);
  r.bone('jaw', 'body', [0.16, -0.05, 0], [0, 0, 6]);
  r.bone('finR', 'body', [0.08, -0.06, 0.11], [30, 0, -20]);
  r.bone('finL', 'body', [0.08, -0.06, -0.11], [-30, 0, -20]);
  r.bone('ring', 'body', [-0.02, 0, 0]);

  /* corpo alto e achatado: dorso prateado, barriga vermelha */
  r.add('body',
    blob([0.27, 0.22, 0.11], back, { deform: [pull([0.24, 0.05, 0], 0.15, [0.03, 0.03, 0]), pull([-0.24, 0, 0], 0.14, [-0.04, 0, 0]), taper('x', -0.27, 0.27, 0.55, 1.0), wobble(0.003)] }),
    blob([0.22, 0.13, 0.105], belly, { pos: [0.02, -0.09, 0], deform: [taper('x', -0.22, 0.22, 0.6, 1.0)] }),
    // pintinhas prateadas
    ...([[0.0, 0.1, 0.095], [-0.08, 0.06, 0.09], [0.08, 0.12, 0.085], [-0.14, 0.1, 0.07], [0.04, 0.03, 0.105]] as V3[]).map((p) => blob([0.012, 0.012, 0.006], mat('metal', 0x2a343c, { metal: 0.4 }), { pos: p, seg: 8 })),
    // opérculo (guelra)
    tube([[0.08, 0.1, 0.09], [0.04, 0.0, 0.105], [0.07, -0.1, 0.09]], 0.008, mat('scale', 0x5a6a78), { seg: 10, radial: 6 }),
    // testa franzida
    slab([[-0.05, 0], [0.05, 0.015], [0.06, 0.03], [-0.04, 0.02]], 0.016, mat('scale', 0x4a5864), { pos: [0.17, 0.09, 0.07], rot: [0, 30, -24] }),
  );
  const eR = eye({ r: 0.055, iris: 0xe83020, irisScale: 0.55, look: [0.9, 0], lid: 0.38, lidColor: 0x5a6a78, angry: 22 });
  eR.position.set(0.17, 0.05, 0.07); eR.rotation.y = 0.55;
  const eL = eye({ r: 0.05, iris: 0xe83020, irisScale: 0.55, look: [0.9, 0], lid: 0.38, lidColor: 0x5a6a78, angry: -22 });
  eL.position.set(0.17, 0.05, -0.07); eL.rotation.y = -0.2;
  r.add('body', eR, eL);
  r.bones.lidR = eR.getObjectByName('lid')!;
  r.bones.lidL = eL.getObjectByName('lid')!;
  // dentes de cima
  r.add('body', ...[0.0, 0.035, 0.07].flatMap((x) => [-1, 1].map((zs) => spike(0.04, 0.016, tooth, { pos: [0.2 + x * 0.5, -0.04, zs * (0.045 - x * 0.2)], rot: [0, 0, 180] }))));
  /* queixão com dentes triangulares para cima */
  r.add('jaw',
    blob([0.13, 0.06, 0.08], belly, { pos: [0.04, -0.02, 0], deform: [pull([0.12, 0, 0], 0.08, [0.03, 0.02, 0]), taper('x', -0.13, 0.13, 1, 0.75)] }),
    blob([0.1, 0.02, 0.06], mat('skin', 0x6a1a1a), { pos: [0.05, 0.03, 0] }),
    ...[0.0, 0.04, 0.08, 0.115].flatMap((x, i) => [-1, 1].map((zs) => spike(0.05 - i * 0.004, 0.018, tooth, { pos: [0.02 + x, 0.03, zs * (0.055 - x * 0.25)], rot: [0, 0, -4] }))),
  );
  /* nadadeiras */
  r.add('body',
    slab([[0, 0], [0.12, 0.02], [0.06, 0.12], [-0.04, 0.1]], 0.012, fin, { pos: [-0.06, 0.18, 0], rot: [0, 0, -10] }),
    slab([[0, 0], [0.08, 0], [0.02, -0.1], [-0.06, -0.06]], 0.01, finRed, { pos: [-0.14, -0.1, 0] }),
    slab([[0, 0], [0.06, 0], [0.02, -0.07], [-0.03, -0.05]], 0.01, finRed, { pos: [0.02, -0.18, 0.04], rot: [10, 0, 0] }),
  );
  for (const s of ['R', 'L'] as const) r.add(`fin${s}`, slab([[0, 0], [-0.1, 0.04], [-0.12, -0.02], [-0.04, -0.04]], 0.008, finRed));
  r.add('tail', blob([0.1, 0.07, 0.05], back, { pos: [-0.04, 0, 0], deform: [taper('x', -0.1, 0.1, 0.6, 1)] }));
  r.add('tailFin',
    slab([[0.02, 0], [-0.14, 0.16], [-0.1, 0.02], [-0.12, -0.02], [-0.14, -0.15]], 0.014, fin, { deform: [bulge([-0.12, 0, 0], 0.05, -0.01)] }),
    slab([[0.0, 0.0], [-0.06, 0.08], [-0.05, -0.07]], 0.016, mat('scale', 0x2a343c), { pos: [-0.01, 0, 0] }),
  );
  /* boia salva-vidas presa na cintura (listras vermelho/branco) */
  for (let i = 0; i < 8; i++) {
    r.add('ring', ring(0.235, 0.052, i % 2 ? white : red, { rot: [0, 90, i * 45], arc: 45, deform: [] }));
  }
  r.bones.ring.scale.set(1, 1.06, 0.9);
  r.add('ring',
    // cordinha em volta da boia com nós
    ...[0, 90, 180, 270].map((a) => ring(0.05, 0.008, rope, { pos: [0, Math.sin(a * D2R) * 0.235, Math.cos(a * D2R) * 0.235], rot: [a, 0, 0] })),
    tube([[0, 0.25, 0.05], [0.06, 0.32, 0.08], [0.0, 0.36, 0.04]], 0.007, rope, { seg: 10, radial: 5 }),
  );
  r.anchor('head', 'body', [0, 0.3, 0]);
  return r;
}

function anims(): AnimSet {
  const swim = (n: number, a: number) => ({
    body: bob(0.03, 0, 8).map((x, i) => ({ ...x, r: [0, 6 * Math.sin((i / 8) * Math.PI * 2), 3 * Math.cos((i / 8) * Math.PI * 2)] as V3 })),
    tail: waveAxis(1, a, 0.25), tailFin: waveAxis(1, a * 1.2, 0.1),
    finR: wave(18, 0), finL: wave(18, 0.5),
    ring: waveAxis(0, 6, 0.5),
    jaw: [rz(0, 0), rz(0.5, -6), rz(1, 0)],
    ...(n ? {} : {}),
  });
  const nadar = anim(16, true, { ...swim(16, 26), lidR: [rx(0, 0), rx(0.7, 0), rx(0.74, 60), rx(0.8, 0), rx(1, 0)], lidL: [rx(0, 0), rx(0.7, 0), rx(0.74, 60), rx(0.8, 0), rx(1, 0)] });
  const andar = anim(12, true, { ...swim(12, 36), root: [rz(0, -6), rz(1, -6)] });
  // ataque: abocanhada tripla "nhac-nhac-nhac"
  const ataque = anim(14, false, {
    ...swim(14, 30),
    root: [ps(0, [0, 0, 0]), ps(0.2, [-0.05, 0, 0]), ps(0.4, [0.16, 0, 0], 'in'), ps(0.8, [0.16, 0, 0]), ps(1, [0, 0, 0])],
    jaw: [rz(0, 0), rz(0.2, -40), rz(0.35, 0), rz(0.45, -36), rz(0.55, 0), rz(0.65, -36), rz(0.75, 0), rz(1, 0)],
    lidR: [rx(0, 0), rx(0.2, 25), rx(0.8, 25), rx(1, 0)], lidL: [rx(0, 0), rx(0.2, 25), rx(0.8, 25), rx(1, 0)],
  });
  const dano = anim(10, false, {
    root: [k(0, [0, 0, 0], [0, 0, 0]), k(0.2, [30, 0, 30], [-0.14, 0.06, 0], 'out'), k(1, [0, 0, 8], [-0.12, 0, 0])],
    tail: [ry(0, 0), ry(0.2, 40), ry(1, 10)],
    jaw: [rz(0, 0), rz(0.2, -40), rz(1, -20)],
    ring: [rx(0, 0), rx(0.2, 30), rx(0.5, -14), rx(1, 0)],
    lidR: [rx(0, 0), rx(0.15, 70), rx(1, 45)], lidL: [rx(0, 0), rx(0.15, 70), rx(1, 45)],
  });
  // morte: vira de barriga para cima e a boia a leva flutuando
  const morte = anim(24, false, {
    root: [k(0, [0, 0, 0], [0, 0, 0]), k(0.3, [100, 0, 0], [0, 0.05, 0], 'out'), k(0.5, [180, 0, 0], [0, 0.1, 0]), k(1, [180, 0, 0], [0, 0.4, 0], 'inOut')],
    tail: [ry(0, 0), ry(0.3, 30), ry(0.5, -10), ry(1, 0)],
    jaw: [rz(0, 0), rz(0.3, -40), rz(1, -30)],
    lidR: [rx(0, 0), rx(0.3, 80), rx(1, 80)], lidL: [rx(0, 0), rx(0.3, 80), rx(1, 80)],
  });
  const tonto = anim(16, true, {
    root: Array.from({ length: 9 }, (_, i) => k(i / 8, [20 * Math.sin((i / 8) * Math.PI * 2), 0, 14 * Math.cos((i / 8) * Math.PI * 2)], [0.03 * Math.cos((i / 8) * Math.PI * 2), 0.02 * Math.sin((i / 8) * Math.PI * 2), 0], 'linear')),
    tail: waveAxis(1, 10, 0), ring: waveAxis(0, 12, 0.25),
    jaw: [rz(0, -24), rz(1, -24)],
    lidR: [rx(0, 45), rx(1, 45)], lidL: [rx(0, 15), rx(1, 15)],
  });
  return { idle: nadar, nadar, andar, ataque, dano, morte, tonto };
}

export const piranha: ModelDef = {
  id: 'piranha',
  kind: 'enemy',
  build,
  anims: anims(),
  cell: [224, 176],
  pivot: [112, 150],
  height: 176 / 104,
  presets: ['recife', 'neutro'],
};
