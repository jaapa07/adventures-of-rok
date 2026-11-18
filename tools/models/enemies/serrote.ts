/**
 * SERROTE — drone-motosserra do Barão. Carcaça laranja de motor de motosserra, hélice no
 * mastro, serra circular dentada girando na frente, cano de escape fumegando e um par de
 * olhos raivosos atrás de um visor rachado. Voa em senoide; não pode ser pisado.
 */
import { Rig, blob, tube, slab, lathe, ring, roundBox, spike, eye, mat, taper, bulge, pull, wobble, D2R, type V3 } from '../../render/sculpt';
import { k, rz, rx, ry, ps, sc, bob, spin, anim, wave } from '../../anims/enemies/common';
import type { AnimSet } from '../../render/anim';
import type { ModelDef } from '../../render/types';

function build() {
  const r = new Rig('root');
  const orange = mat('plastic', 0xe8742a, { rough: 0.4 });
  const orangeDark = mat('plastic', 0xb04e18, { rough: 0.45 });
  const black = mat('rubber', 0x26221f);
  const steel = mat('metal', 0xc2c6c8, { metal: 0.55, rough: 0.3 });
  const steelDark = mat('metal', 0x6c7072, { metal: 0.5, rough: 0.4 });
  const rustM = mat('rust', 0x8a5a3a, { metal: 0.3 });
  const hazard = mat('paint', 0xf2c230);

  r.bone('body', 'root', [0, 0.5, 0]);
  r.bone('prop', 'body', [-0.04, 0.32, 0]);
  r.bone('blade', 'body', [0.36, -0.06, 0.02]);
  r.bone('arm', 'body', [0.16, -0.05, 0]);
  r.bone('exhaust', 'body', [-0.28, 0.02, 0]);
  r.bone('skidF', 'body', [0.1, -0.2, 0]);
  r.bone('skidB', 'body', [-0.14, -0.2, 0]);

  /* carcaça do motor */
  r.add('body',
    blob([0.3, 0.2, 0.2], orange, { deform: [pull([0.25, 0.05, 0], 0.2, [0.04, 0.02, 0]), taper('x', -0.3, 0.3, 1.08, 0.82), bulge([0, 0.18, 0], 0.15, 0.03), wobble(0.003)] }),
    // tampa preta do cilindro com aletas de refrigeração
    roundBox([0.22, 0.12, 0.3], 0.04, black, { pos: [-0.06, 0.1, 0] }),
    ...[-0.14, -0.1, -0.06, -0.02, 0.02].map((x) => roundBox([0.018, 0.06, 0.32], 0.008, steelDark, { pos: [x, 0.17, 0] })),
    // faixa de perigo
    ...[-0.2, -0.12, -0.04].map((x, i) => slab([[-0.03, -0.04], [0.03, -0.04], [0.03, 0.04], [-0.03, 0.04]], 0.006, i % 2 ? black : hazard, { pos: [x, -0.06, 0.19], rot: [0, 0, 30], smooth: false, bevel: 0.002 })),
    // cordinha de partida com puxador
    tube([[-0.24, 0.0, 0.18], [-0.3, -0.06, 0.22], [-0.34, -0.12, 0.2]], 0.008, mat('cloth', 0xe8e0d0), { seg: 10, radial: 6 }),
    blob([0.04, 0.018, 0.018], black, { pos: [-0.35, -0.13, 0.2], rot: [0, 0, 60] }),
    // parafusos
    ...([[0.1, 0.1, 0.17], [-0.2, 0.08, 0.16], [0.18, -0.08, 0.15]] as V3[]).map((p) => blob([0.016, 0.016, 0.01], steel, { pos: p, rot: [0, 20, 0], seg: 10 })),
    // amassado de batida
    blob([0.06, 0.04, 0.02], orangeDark, { pos: [0.02, -0.1, 0.17], rot: [10, 10, 0] }),
  );
  // visor e olhos raivosos
  r.add('body',
    // óculos de proteção (aros pretos com vidro rachado)
    ring(0.075, 0.016, black, { pos: [0.27, 0.09, 0.11], rot: [0, 52, 0] }),
    ring(0.068, 0.016, black, { pos: [0.29, 0.09, -0.02], rot: [0, 75, 0] }),
    tube([[0.22, 0.12, 0.17], [0.0, 0.16, 0.2], [-0.2, 0.12, 0.2]], 0.012, black, { seg: 10, radial: 6 }),
    // rachadura no vidro
    tube([[0.3, 0.13, 0.13], [0.31, 0.1, 0.15], [0.32, 0.08, 0.14], [0.32, 0.05, 0.16]], 0.003, mat('glass', 0xffffff, { opacity: 0.8 }), { seg: 8, radial: 4 }),
  );
  const eR = eye({ r: 0.07, iris: 0xd23a1a, irisScale: 0.5, look: [0.8, -0.1], lid: 0.38, lidColor: 0x26221f, angry: 22 });
  eR.position.set(0.25, 0.09, 0.095); eR.rotation.y = 0.9;
  const eL = eye({ r: 0.062, iris: 0xd23a1a, irisScale: 0.5, look: [0.8, -0.1], lid: 0.38, lidColor: 0x26221f, angry: -22 });
  eL.position.set(0.27, 0.09, -0.03); eL.rotation.y = 0.5;
  r.add('body', eR, eL);
  r.bones.lidR = eR.getObjectByName('lid')!;
  r.bones.lidL = eL.getObjectByName('lid')!;

  /* mastro e hélice de duas pás */
  r.add('body',
    lathe([[0.04, 0.12], [0.035, 0.2], [0.025, 0.3], [0.03, 0.32]], steelDark, { pos: [-0.04, 0, 0] }),
  );
  r.add('prop',
    lathe([[0.001, -0.02], [0.05, -0.02], [0.05, 0.02], [0.03, 0.04], [0.001, 0.045]], orangeDark),
    slab([[0, -0.03], [0.32, -0.045], [0.36, 0], [0.3, 0.035], [0, 0.03]], 0.012, steel, { rot: [90, 0, 0], deform: [] }),
    slab([[0, -0.03], [-0.32, -0.045], [-0.36, 0], [-0.3, 0.035], [0, 0.03]], 0.012, steel, { rot: [90, 0, 0] }),
    blob([0.03, 0.01, 0.03], hazard, { pos: [0.33, 0.008, 0] }),
    blob([0.03, 0.01, 0.03], hazard, { pos: [-0.33, 0.008, 0] }),
  );
  // pás inclinadas: gira cada pá em torno de seu eixo
  r.bones.prop.children[1].rotation.set(90 * D2R, 14 * D2R, 0);
  r.bones.prop.children[2].rotation.set(90 * D2R, -14 * D2R, 0);

  /* braço da serra e serra circular */
  r.add('arm',
    roundBox([0.22, 0.06, 0.06], 0.025, steelDark, { pos: [0.1, -0.01, 0.02] }),
    blob([0.05, 0.05, 0.05], black, { pos: [0.0, 0, 0.02] }),
  );
  const teeth = Array.from({ length: 16 }, (_, i) => {
    const a = (i / 16) * 360;
    const ca = Math.cos(a * D2R), sa = Math.sin(a * D2R);
    return spike(0.05, 0.022, steel, { pos: [ca * 0.15, sa * 0.15, 0], rot: [0, 0, a - 90 - 30], curve: 0.25 });
  });
  r.add('blade',
    lathe([[0.001, -0.006], [0.155, -0.006], [0.16, 0], [0.155, 0.006], [0.001, 0.006]], steel, { rot: [90, 0, 0], seg: 40 }),
    ring(0.11, 0.006, steelDark, { rot: [0, 0, 0] }),
    lathe([[0.001, -0.02], [0.04, -0.02], [0.04, 0.02], [0.001, 0.025]], orangeDark, { rot: [90, 0, 0] }),
    // furos de alívio da serra
    ...[0, 120, 240].map((a) => blob([0.022, 0.022, 0.008], black, { pos: [Math.cos(a * D2R) * 0.08, Math.sin(a * D2R) * 0.08, 0.004], seg: 12 })),
    ...teeth,
  );
  // capa protetora em cima da serra
  r.add('arm', lathe([[0.17, -0.03], [0.175, 0], [0.17, 0.03]], orangeDark, { pos: [0.2, -0.01, 0.02], rot: [90, 0, 0], deform: [], seg: 24 }));
  r.bones.arm.children[2].scale.set(1, 1, 1);
  (r.bones.arm.children[2] as any).geometry?.computeBoundingBox?.();

  /* escapamento e skis */
  r.add('exhaust',
    tube([[0, 0, 0], [-0.08, 0.02, 0.06], [-0.14, 0.08, 0.08]], 0.03, rustM, { seg: 12, radial: 10 }),
    lathe([[0.034, 0], [0.04, 0.03], [0.036, 0.05], [0.028, 0.05]], steelDark, { pos: [-0.14, 0.08, 0.08], rot: [0, 0, 50] }),
    blob([0.05, 0.045, 0.05], mat('cloth', 0x6a6a70, { opacity: 0.75 }), { pos: [-0.2, 0.16, 0.08], name: 'puff1' }),
    blob([0.035, 0.032, 0.035], mat('cloth', 0x8a8a90, { opacity: 0.6 }), { pos: [-0.26, 0.24, 0.08], name: 'puff2' }),
  );
  r.bones.puff1 = r.bones.exhaust.getObjectByName('puff1')!;
  r.bones.puff2 = r.bones.exhaust.getObjectByName('puff2')!;
  for (const s of ['skidF', 'skidB']) {
    r.add(s,
      tube([[0, 0.04, 0.1], [0, -0.06, 0.12], [0, -0.08, 0.14]], 0.012, steelDark, { seg: 8, radial: 6 }),
      tube([[0, 0.04, -0.1], [0, -0.06, -0.12], [0, -0.08, -0.14]], 0.012, steelDark, { seg: 8, radial: 6 }),
    );
  }
  r.add('body', tube([[-0.24, -0.29, 0.14], [0.16, -0.29, 0.14], [0.24, -0.25, 0.14]], 0.014, black, { seg: 12, radial: 6 }));
  r.add('body', tube([[-0.24, -0.29, -0.14], [0.16, -0.29, -0.14], [0.24, -0.25, -0.14]], 0.014, black, { seg: 12, radial: 6 }));
  // antena com luz vermelha
  r.add('body', tube([[-0.22, 0.14, -0.08], [-0.26, 0.26, -0.1], [-0.3, 0.34, -0.1]], 0.006, steelDark, { seg: 8, radial: 5 }), blob([0.022, 0.022, 0.022], mat('glow', 0xff3a2a), { pos: [-0.3, 0.35, -0.1] }));
  r.anchor('head', 'body', [0, 0.4, 0]);
  return r;
}

function anims(): AnimSet {
  const motor = { prop: spin(1, 3), blade: spin(2, -2), puff1: [k(0, undefined, [0, 0, 0], 'linear', 0.6), k(1, undefined, [-0.06, 0.1, 0], 'linear', 1.4)], puff2: [k(0, undefined, [0, 0, 0], 'linear', 1), k(1, undefined, [-0.05, 0.12, 0], 'linear', 0.3)] };
  const voar = anim(16, true, {
    ...motor,
    body: [...bob(0.04, 0, 8).map((x, i) => ({ ...x, r: [4 * Math.sin((i / 8) * Math.PI * 2), 0, -6 + 3 * Math.cos((i / 8) * Math.PI * 2)] as V3 }))],
    arm: wave(4, 0.2),
    exhaust: wave(5, 0.5),
    lidR: [rx(0, 0), rx(0.6, 0), rx(0.64, 60), rx(0.7, 0), rx(1, 0)], lidL: [rx(0, 0), rx(0.6, 0), rx(0.64, 60), rx(0.7, 0), rx(1, 0)],
  });
  const andar = anim(16, true, {
    ...motor,
    body: bob(0.03, 0, 8).map((x) => ({ ...x, r: [0, 0, -16] as V3 })),
    arm: wave(6, 0.2, 6),
    exhaust: wave(8, 0.5),
  });
  const ataque = anim(14, false, {
    ...motor, blade: spin(2, -4),
    body: [k(0, [0, 0, -6], [0, 0, 0]), k(0.3, [0, 0, 18], [-0.12, 0.08, 0], 'out'), k(0.55, [0, 0, -40], [0.3, -0.12, 0], 'in'), k(0.7, [0, 0, -36], [0.34, -0.12, 0]), k(1, [0, 0, -6], [0, 0, 0])],
    arm: [rz(0, 0), rz(0.3, 20), rz(0.55, -20), rz(1, 0)],
    lidR: [rx(0, 0), rx(0.3, 25), rx(0.8, 25), rx(1, 0)], lidL: [rx(0, 0), rx(0.3, 25), rx(0.8, 25), rx(1, 0)],
  });
  const dano = anim(10, false, {
    ...motor,
    body: [k(0, [0, 0, 0], [0, 0, 0]), k(0.2, [20, 0, 40], [-0.16, 0.1, 0], 'out'), k(0.6, [-10, 0, 10], [-0.1, 0.02, 0]), k(1, [0, 0, -6], [-0.08, 0, 0])],
    lidR: [rx(0, 0), rx(0.15, 70), rx(1, 40)], lidL: [rx(0, 0), rx(0.15, 70), rx(1, 40)],
    arm: [rz(0, 0), rz(0.2, -30), rz(1, -10)],
  });
  const morte = anim(24, false, {
    prop: [ry(0, 0, 'linear'), ry(0.5, 600, 'out'), ry(1, 700, 'out')],
    blade: [rz(0, 0, 'linear'), rz(0.6, -500, 'out'), rz(1, -540)],
    body: [k(0, [0, 0, 0], [0, 0, 0]), k(0.2, [0, 0, 30], [0, 0.1, 0], 'out'), k(0.45, [30, 0, -20], [0.04, 0.02, 0]), k(0.7, [0, 0, -120], [0.1, -0.4, 0], 'in'), k(0.8, [0, 0, -150], [0.12, -0.34, 0], 'out'), k(1, [0, 0, -170], [0.14, -0.38, 0], 'bounce')],
    arm: [rz(0, 0), rz(0.7, 0), rz(0.8, -40), rz(1, -30)],
    exhaust: [rz(0, 0), rz(0.45, 30), rz(1, 40)],
    puff1: [sc(0, 1), sc(0.3, 2.4), sc(1, 2.6)], puff2: [sc(0, 1), sc(0.3, 2.4), sc(1, 3)],
    lidR: [rx(0, 0), rx(0.2, -30), rx(0.7, 80), rx(1, 80)], lidL: [rx(0, 0), rx(0.2, -30), rx(0.7, 80), rx(1, 80)],
  });
  const tonto = anim(16, true, {
    prop: spin(1, 1), blade: spin(2, -1),
    body: Array.from({ length: 9 }, (_, i) => k(i / 8, [14 * Math.sin((i / 8) * Math.PI * 2), 0, 10 * Math.cos((i / 8) * Math.PI * 2)], [0.03 * Math.cos((i / 8) * Math.PI * 2), -0.05 + 0.02 * Math.sin((i / 8) * Math.PI * 4), 0], 'linear')),
    arm: wave(14, 0, -10),
    lidR: [rx(0, 50), rx(1, 50)], lidL: [rx(0, 20), rx(1, 20)],
    puff1: [sc(0, 1.6), sc(0.5, 2), sc(1, 1.6)],
  });
  return { idle: voar, voar, andar, ataque, dano, morte, tonto };
}

export const serrote: ModelDef = {
  id: 'serrote',
  kind: 'enemy',
  build,
  anims: anims(),
  cell: [240, 200],
  pivot: [116, 176],
  height: 200 / 104,
  presets: ['selva', 'neutro'],
};
