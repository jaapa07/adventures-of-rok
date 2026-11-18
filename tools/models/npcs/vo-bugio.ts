/**
 * VÔ BUGIO — bugio idoso, ferreiro e inventor da Oficina (seção 19.1).
 * Corcunda, pelo escuro grisalho, barbona ruiva fofa (marca dos bugios), óculos redondos de lente grossa
 * que aumentam os olhos, avental de couro com bolso de ferramentas, lápis atrás da orelha,
 * martelo na mão e cauda preênsil enrolada. Bigorna aparece na animação de martelar.
 */
import { Rig, blob, limb, tube, slab, lathe, spike, ring, roundBox, eye, mat, taper, pull, bulge, wobble, flattenBelow, type V3 } from '../../render/sculpt';
import type { ModelDef } from '../../render/types';
import type { Anim } from '../../render/anim';
import { k, rz, rx, pk, sk, blink, wave, waveP, show, HIDDEN } from '../../anims/bosses/kit';

const C = { fur: 0x3e2c24, furGray: 0x8a8278, face: 0x2a1e1a, beard: 0xc8521e, beardLight: 0xe07a30, apron: 0x8a5a32, apronDark: 0x5e3a1e };

function build() {
  const r = new Rig('root');
  const fur = mat('fur', C.fur, { repeat: 3 });
  const gray = mat('fur', C.furGray, { repeat: 3 });
  const face = mat('skin', C.face, { rough: 0.55 });
  const beard = mat('fur', C.beard, { repeat: 2 });
  const beardL = mat('fur', C.beardLight, { repeat: 2 });
  const apron = mat('leather', C.apron);
  const apronDark = mat('leather', C.apronDark);
  const metal = mat('metal', 0x9aa0a6, { metal: 0.5, rough: 0.35 });
  const wood = mat('wood', 0x8a5a30);
  const brass = mat('metal', 0xc89a3a, { metal: 0.5, rough: 0.3 });
  const lens = mat('glass', 0xeaf6ff, { opacity: 0.3 });

  /* ---------- esqueleto (corcunda) ---------- */
  r.bone('hips', 'root', [0, 0.5, 0]);
  r.bone('spine', 'hips', [0, 0.14, 0], [0, 0, -14]);
  r.bone('chest', 'spine', [0.02, 0.22, 0], [0, 0, -12]);
  r.bone('neck', 'chest', [0.12, 0.18, 0], [0, 0, 22]);
  r.bone('head', 'neck', [0.06, 0.1, 0]);
  r.bones.head.scale.setScalar(1.25);
  r.bone('jaw', 'head', [0.1, -0.1, 0]);
  r.bone('glasses', 'head', [0.19, 0.05, 0]);
  for (const s of ['L', 'R'] as const) {
    const z = s === 'R' ? 1 : -1;
    r.bone(`arm${s}_up`, 'chest', [0.02, 0.12, 0.2 * z], [z * 6, 0, 8]);
    r.bone(`arm${s}_lo`, `arm${s}_up`, [0, -0.3, 0], [0, 0, 30]);
    r.bone(`hand${s}`, `arm${s}_lo`, [0, -0.28, 0]);
    r.bone(`leg${s}_up`, 'hips', [0.02, -0.04, 0.12 * z], [0, 0, 14]);
    r.bone(`leg${s}_lo`, `leg${s}_up`, [0, -0.24, 0], [0, 0, -26]);
    r.bone(`foot${s}`, `leg${s}_lo`, [0, -0.22, 0], [0, 0, 12]);
  }
  r.bone('hammer', 'handR', [0.03, -0.06, 0.02], [0, 0, -80]);
  r.bones.hammer.scale.setScalar(1.5);
  r.bone('tail1', 'hips', [-0.18, 0.02, 0], [0, 0, 40]);
  r.bone('tail2', 'tail1', [-0.22, 0, 0], [0, 0, 30]);
  r.bone('tail3', 'tail2', [-0.2, 0, 0], [0, 0, 40]);
  r.bone('anvil', 'root', [0.55, 0, 0.05]);
  r.anchor('hand', 'handR', [0.03, -0.06, 0.02]);
  r.anchor('handL', 'handL', [0.03, -0.06, -0.02]);
  r.anchor('head', 'head', [0, 0.2, 0]);
  r.bones.anvil.scale.setScalar(HIDDEN);

  /* ---------- tronco e avental ---------- */
  r.add('hips', blob([0.2, 0.17, 0.19], fur, { pos: [-0.02, 0.04, 0], deform: [wobble(0.006)] }));
  r.add('spine',
    blob([0.22, 0.2, 0.2], fur, { pos: [0, 0.08, 0], deform: [bulge([0.15, 0, 0], 0.18, 0.04)] }),
    // avental: peitilho e saia de couro
    blob([0.25, 0.32, 0.235], apron, { pos: [0.07, -0.02, 0], deform: [flattenBelow(-0.3, 0.6), pull([0.2, -0.25, 0], 0.25, [0.04, -0.1, 0]), (p) => { if (p.x < -0.02) p.x = -0.02 + (p.x + 0.02) * 0.15; }] }),
    roundBox([0.03, 0.12, 0.2], 0.015, apronDark, { pos: [0.24, -0.02, 0], rot: [0, 0, 12] }),
    // ferramentas no bolso
    tube([[0.24, 0.02, 0.05], [0.25, 0.12, 0.06]], 0.012, mat('plastic', 0xd02a2a), { seg: 4, radial: 6 }),
    tube([[0.24, 0.02, -0.04], [0.23, 0.13, -0.05]], 0.008, metal, { seg: 4, radial: 6 }),
    // cinto com fivela
    lathe([[0.2, -0.03], [0.21, 0], [0.2, 0.03]], apronDark, { pos: [0, -0.05, 0], scale: [1.05, 1, 1.05] }),
    roundBox([0.02, 0.06, 0.07], 0.01, brass, { pos: [0.23, -0.05, 0] }),
  );
  r.add('chest',
    blob([0.22, 0.18, 0.22], fur, { pos: [0, 0.06, 0], deform: [pull([-0.15, 0.1, 0], 0.18, [-0.04, 0.05, 0]), wobble(0.008)] }),
    // pelo grisalho nas costas (velhice)
    blob([0.16, 0.12, 0.17], gray, { pos: [-0.1, 0.12, 0], deform: [wobble(0.012, 8)] }),
    // alças do avental
    tube([[0.18, 0.05, 0.14], [0.1, 0.18, 0.17], [-0.05, 0.2, 0.15]], 0.016, apronDark, { seg: 10, radial: 6 }),
    tube([[0.18, 0.05, -0.14], [0.1, 0.18, -0.17], [-0.05, 0.2, -0.15]], 0.016, apronDark, { seg: 10, radial: 6 }),
  );
  /* ---------- cabeça ---------- */
  r.add('neck', blob([0.1, 0.1, 0.1], fur, {}));
  r.add('head',
    blob([0.16, 0.15, 0.16], fur, { pos: [0, 0.02, 0], deform: [pull([-0.1, 0.12, 0], 0.12, [-0.02, 0.03, 0])] }),
    // cabelo grisalho espetado
    ...[0, 1, 2].map((i) => spike(0.08, 0.035, gray, { pos: [-0.02 - i * 0.05, 0.15 - i * 0.01, (i - 1) * 0.05], rot: [(i - 1) * 25, 0, 30 + i * 15], curve: -0.5 })),
    // rosto escuro e focinho
    blob([0.1, 0.11, 0.12], face, { pos: [0.1, -0.01, 0], deform: [pull([0.08, -0.06, 0], 0.08, [0.03, -0.02, 0])] }),
    blob([0.02, 0.014, 0.014], mat('skin', 0x0a0606), { pos: [0.2, -0.03, 0.025] }),
    blob([0.02, 0.014, 0.014], mat('skin', 0x0a0606), { pos: [0.2, -0.03, -0.025] }),
    // sobrancelhas brancas e fartas
    slab([[-0.04, 0], [0.04, 0.01], [0.05, 0.03], [-0.03, 0.025]], 0.02, mat('fur', 0xe8e4dc), { pos: [0.16, 0.08, 0.06], rot: [0, 30, 10] }),
    slab([[-0.04, 0], [0.04, 0.01], [0.05, 0.03], [-0.03, 0.025]], 0.02, mat('fur', 0xe8e4dc), { pos: [0.16, 0.08, -0.06], rot: [0, -30, 10] }),
    // orelhas
    blob([0.035, 0.045, 0.02], face, { pos: [-0.02, 0.0, 0.15] }),
    blob([0.035, 0.045, 0.02], face, { pos: [-0.02, 0.0, -0.15] }),
    // lápis atrás da orelha
    tube([[-0.06, 0.06, 0.16], [0.06, 0.03, 0.18]], 0.01, mat('paint', 0xf0c020), { seg: 4, radial: 6 }),
    // barbona ruiva fofa (papada de bugio)
    blob([0.12, 0.1, 0.14], beard, { pos: [0.08, -0.12, 0], deform: [pull([0.05, -0.1, 0], 0.13, [0.02, -0.07, 0]), wobble(0.014, 9)] }),
    ...[-0.09, -0.045, 0, 0.045, 0.09].map((z, i) => spike(0.13 + (i % 2) * 0.05, 0.045, i % 2 ? beardL : beard, { pos: [0.1, -0.17, z], rot: [z * 180, 0, 172 - i * 3], curve: 0.35 })),
    blob([0.08, 0.05, 0.13], beardL, { pos: [0.12, -0.06, 0], deform: [wobble(0.01, 10)] }),
  );
  for (const s of ['L', 'R'] as const) {
    const z = s === 'R' ? 1 : -1;
    // olhos aumentados pela lente
    const e = eye({ r: 0.04, iris: 0x6a4a1a, irisScale: 0.6, look: [0.4, 0.1], lid: 0.3, lidColor: C.face });
    e.position.set(0.17, 0.04, 0.05 * z); e.rotation.y = z > 0 ? 0.35 : -0.1;
    r.add('head', e);
    r.bones[`lid${s}`] = e.getObjectByName('lid')!;
  }
  r.add('jaw', blob([0.05, 0.025, 0.06], face, { pos: [0.06, 0, 0] }), blob([0.035, 0.012, 0.045], mat('skin', 0x7a2a2a), { pos: [0.07, 0.015, 0] }));
  // óculos redondos de arame com lentes grossas
  r.add('glasses',
    ring(0.05, 0.007, brass, { pos: [0.0, 0, 0.055], rot: [0, 75, 0] }),
    ring(0.05, 0.007, brass, { pos: [0.0, 0, -0.055], rot: [0, 75, 0] }),
    blob([0.048, 0.048, 0.012], lens, { pos: [0.0, 0, 0.055], rot: [0, 75, 0], castShadow: false }),
    blob([0.048, 0.048, 0.012], lens, { pos: [0.0, 0, -0.055], rot: [0, 75, 0], castShadow: false }),
    tube([[0.01, 0.0, 0.01], [0.015, 0.012, 0], [0.01, 0.0, -0.01]], 0.005, brass, { seg: 6, radial: 4 }),
    tube([[-0.01, 0.0, 0.1], [-0.12, 0.02, 0.15], [-0.2, -0.01, 0.15]], 0.005, brass, { seg: 8, radial: 4 }),
  );
  /* ---------- braços longos de macaco, pernas curtas ---------- */
  for (const s of ['L', 'R'] as const) {
    const zs = s === 'R' ? 1 : -1;
    r.add(`arm${s}_up`, limb(0.3, 0.07, 0.06, fur));
    r.add(`arm${s}_lo`, limb(0.28, 0.06, 0.05, fur), ring(0.06, 0.02, apronDark, { pos: [0, -0.2, 0], rot: [90, 0, 0] }));
    r.add(`hand${s}`,
      blob([0.06, 0.05, 0.05], face, { pos: [0.02, -0.04, 0] }),
      ...[-0.025, 0, 0.025].map((z) => tube([[0.04, -0.04, z], [0.08, -0.08, z], [0.06, -0.12, z]], 0.014, face, { seg: 6, radial: 6 })),
      tube([[0.0, -0.03, 0.04 * zs], [0.04, -0.06, 0.06 * zs]], 0.014, face, { seg: 4, radial: 6 }),
    );
    r.add(`leg${s}_up`, limb(0.24, 0.08, 0.06, fur));
    r.add(`leg${s}_lo`, limb(0.22, 0.06, 0.05, fur));
    r.add(`foot${s}`,
      blob([0.09, 0.035, 0.05], face, { pos: [0.05, -0.02, 0], deform: [flattenBelow(-0.02, 0.8)] }),
      tube([[0.0, -0.02, 0.05 * zs], [0.04, -0.03, 0.07 * zs]], 0.014, face, { seg: 4, radial: 6 }),
    );
  }
  r.add('hammer',
    tube([[0, -0.06, 0], [0, 0.26, 0]], 0.016, wood, { seg: 4, radial: 8 }),
    roundBox([0.07, 0.07, 0.15], 0.015, metal, { pos: [0, 0.27, 0], rot: [0, 0, 0] }),
    lathe([[0.034, 0], [0.04, 0.01], [0.04, 0.02], [0.001, 0.02]], metal, { pos: [0, 0.27, 0.075], rot: [90, 0, 0] }),
  );
  /* ---------- cauda preênsil ---------- */
  r.add('tail1', tube([[0, 0, 0], [-0.11, 0.01, 0], [-0.22, 0, 0]], 0.04, fur, { seg: 8 }));
  r.add('tail2', tube([[0, 0, 0], [-0.1, 0.01, 0], [-0.2, 0, 0]], 0.034, fur, { seg: 8 }));
  r.add('tail3', tube([[0, 0, 0], [-0.08, 0.02, 0], [-0.12, 0.08, 0], [-0.08, 0.13, 0], [-0.03, 0.1, 0]], (t) => 0.03 * (1 - t * 0.6), fur, { seg: 16 }));
  /* ---------- bigorna (martelar) ---------- */
  r.add('anvil',
    lathe([[0.001, 0], [0.18, 0], [0.16, 0.05], [0.08, 0.1], [0.07, 0.22], [0.001, 0.22]], mat('wood', 0x6a4424), { scale: [1, 1, 0.9] }),
    slab([[-0.2, 0], [0.12, 0], [0.28, 0.04], [0.12, 0.08], [-0.2, 0.08], [-0.22, 0.04]], 0.12, mat('metal', 0x50565c, { metal: 0.5, rough: 0.4 }), { pos: [0, 0.22, 0], smooth: false, bevel: 0.015 }),
    roundBox([0.12, 0.03, 0.06], 0.01, mat('glow', 0xff7020, { emissive: 0xff4a10, emissiveIntensity: 1.2 }), { pos: [0.0, 0.32, 0.0] }),
  );
  void taper; void k;
  return r;
}

/* ---------------- animações ---------------- */
const idle: Anim = {
  frames: 32, loop: true,
  keys: {
    hips: waveP([0, -0.008, 0], 1, 0.25),
    chest: [sk(0, 1), sk(0.5, [1.02, 1.03, 1.02]), sk(1, 1)],
    head: [rz(0, 0), rz(0.3, -4), rz(0.5, 6), rz(0.7, 4), rz(1, 0)],
    armR_up: wave([0, 0, 3], 1, 0.3),
    tail1: wave([0, 0, 6], 1), tail2: wave([0, 0, 8], 1, 0.1), tail3: wave([0, 0, 12], 1, 0.2),
    // ajeita os óculos com a mão esquerda
    armL_lo: [rz(0, 0), rz(0.45, 0), rz(0.55, 120), rz(0.68, 120), rz(0.78, 0), rz(1, 0)],
    armL_up: [rz(0, 0), rz(0.45, 0), rz(0.55, 50), rz(0.68, 50), rz(0.78, 0), rz(1, 0)],
    glasses: [pk(0, [0, 0, 0]), pk(0.55, [0, -0.012, 0]), pk(0.62, [0, 0.006, 0]), pk(0.7, [0, 0, 0])],
    lidR: blink(0.2, 60), lidL: blink(0.2, 60),
  },
};

const falar: Anim = {
  // fala gesticulando, com o vozeirão de bugio (boca bem aberta)
  frames: 24, loop: true,
  keys: {
    jaw: [rz(0, 0), rz(0.12, -22), rz(0.25, -6), rz(0.4, -26), rz(0.55, -4), rz(0.7, -20), rz(0.85, -8), rz(1, 0)],
    head: wave([0, 0, 5], 2, 0, [0, 0, 6]),
    chest: wave([0, 0, 3], 2, 0.2),
    armL_up: wave([0, 0, 18], 1, 0, [0, 0, 40]), armL_lo: wave([0, 0, 20], 1, 0.2, [0, 0, 50]),
    handL: wave([0, 0, 20], 2, 0.3),
    armR_up: wave([0, 0, 4], 1, 0.5),
    tail3: wave([0, 0, 14], 2),
    lidR: blink(0.6, 60), lidL: blink(0.6, 60),
  },
};

const martelar: Anim = {
  // martela a peça na bigorna: ergue, bate, quica
  frames: 16, loop: true,
  keys: {
    anvil: [sk(0, 1000), sk(1, 1000)],
    armR_up: [rz(0, 40), rz(0.35, 150, 'out'), rz(0.55, 40, 'in'), rz(0.65, 46), rz(1, 40)],
    armR_lo: [rz(0, 20), rz(0.35, 60), rz(0.55, 10, 'in'), rz(1, 20)],
    hammer: [rz(0, 70), rz(0.35, 40), rz(0.55, 80, 'in'), rz(1, 70)],
    armL_up: [rz(0, 40), rz(1, 40)], armL_lo: [rz(0, 40), rz(1, 40)],
    spine: [rz(0, -4), rz(0.35, 6), rz(0.55, -10, 'in'), rz(1, -4)],
    head: [rz(0, -10), rz(0.35, -6), rz(0.55, -14), rz(0.6, -10), rz(1, -10)],
    glasses: [pk(0, [0, 0, 0]), pk(0.55, [0, 0, 0]), pk(0.6, [0, -0.012, 0]), pk(0.8, [0, 0, 0])],
    jaw: [rz(0, 0), rz(0.5, 0), rz(0.58, -10), rz(0.8, 0), rz(1, 0)],
    lidR: [rx(0, 0), rx(0.53, 0), rx(0.58, 50), rx(0.68, 0), rx(1, 0)], lidL: [rx(0, 0), rx(0.53, 0), rx(0.58, 50), rx(0.68, 0), rx(1, 0)],
    tail3: wave([0, 0, 14], 1),
  },
};

const apontar: Anim = {
  // "Olha lá!" — aponta para a frente e para cima com a mão esquerda, cauda em gancho
  frames: 20, loop: false,
  keys: {
    armL_up: [rz(0, 0), rz(0.3, 125, 'back'), rz(1, 120)],
    armL_lo: [rz(0, 0), rz(0.3, -10), rz(1, -6)],
    handL: [rz(0, 0), rz(0.3, -20), rz(1, -20)],
    chest: [rz(0, 0), rz(0.3, 10), rz(1, 8)],
    head: [rz(0, 0), rz(0.3, 18), rz(1, 14)],
    jaw: [rz(0, 0), rz(0.3, -18), rz(0.6, -10), rz(1, -14)],
    armR_up: [rz(0, 0), rz(0.3, -20), rz(1, -16)],
    lidR: [rx(0, 0), rx(0.3, -15), rx(1, -15)], lidL: [rx(0, 0), rx(0.3, -15), rx(1, -15)],
    tail3: [rz(0, 0), rz(0.4, 40), rz(1, 30)],
  },
};

export const voBugio: ModelDef = {
  id: 'vo-bugio',
  kind: 'npc',
  build,
  anims: { idle, falar, martelar, apontar },
  cell: [300, 220],
  pivot: [130, 205],
  height: 220 / 104,
  presets: ['selva', 'neutro'],
};
void show;
