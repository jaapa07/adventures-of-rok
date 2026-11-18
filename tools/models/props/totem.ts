/**
 * TOTEM DE CIPÓ (checkpoint) e TOTEM DE SAÍDA (fim de fase).
 * Cipó: poste de madeira entalhado com rosto de coruja, cipó enrolado em espiral com folhas e um botão de flor
 * no topo que desabrocha e acende (miolo luminoso + halo). Olhos entalhados acendem junto.
 * Saída: poste mais alto com tambor de 4 faces entalhadas (castanha, folha, pena, sol) que gira, coroa de penas,
 * fitas coloridas e base de pedra.
 */
import { Rig, blob, tube, slab, lathe, ring, spike, mat, wobble, taper, type V3 } from '../../render/sculpt';
import type { ModelDef } from '../../render/types';
import { grp, leaf, still, wave, nail, additive } from './kit';

/* ------------------------------ TOTEM DE CIPÓ ------------------------------ */
function buildCipo() {
  const r = new Rig('root');
  const wood = mat('wood', 0x8a5a32, { repeat: 1.5 });
  const woodDark = mat('wood', 0x5a3618);
  const carve = mat('wood', 0x3a220e);
  const vine = mat('bark', 0x4a6a24, { repeat: 3 });
  const leafM = mat('leaf', 0x4a9a30);
  const leafM2 = mat('leaf', 0x6ab03a);
  const petal = mat('leaf', 0xe86a9a, { rough: 0.45 });
  const petalIn = mat('leaf', 0xffc0d8, { rough: 0.45 });
  const sepal = mat('leaf', 0x3a7a2a);
  const glow = mat('glow', 0xfff2a0, { emissiveIntensity: 1.6 });
  const halo = additive(mat('glow', 0xffc040, { emissiveIntensity: 0.5, opacity: 0.35 }));
  const eyeGlow = mat('glow', 0x9affb0, { emissiveIntensity: 1.4 });
  const stone = mat('stone', 0x7a756c);
  const moss = mat('grass', 0x4e7a2a, { repeat: 3 });

  r.bone('post', 'root');
  r.bone('bud', 'post', [0, 1.36, 0]);
  r.bone('light', 'bud', [0, 0.06, 0]);
  r.bones.bud.scale.setScalar(1.35);
  r.bone('eyes', 'post', [0.03, 1.0, 0.13], [0, 15, 0]);

  // base de pedras com musgo
  r.add('root',
    blob([0.28, 0.09, 0.24], stone, { pos: [0, 0.03, 0], deform: [wobble(0.02)] }),
    blob([0.12, 0.07, 0.1], stone, { pos: [0.24, 0.03, 0.08], deform: [wobble(0.02)] }),
    blob([0.1, 0.06, 0.09], stone, { pos: [-0.24, 0.03, 0.06], deform: [wobble(0.02)] }),
    blob([0.16, 0.04, 0.12], moss, { pos: [-0.05, 0.1, 0.08] }),
  );
  // poste entalhado
  r.add('post',
    lathe([[0.17, 0.05], [0.16, 0.2], [0.14, 0.5], [0.15, 0.75], [0.14, 1.1], [0.15, 1.24], [0.12, 1.32], [0.001, 1.34]], wood, { deform: [wobble(0.008)], seg: 28 }),
    lathe([[0.155, 0], [0.162, 0.02], [0.155, 0.04]], woodDark, { pos: [0, 0.6, 0], seg: 28 }),
    lathe([[0.155, 0], [0.162, 0.02], [0.155, 0.04]], woodDark, { pos: [0, 0.66, 0], seg: 28 }),
  );
  // rosto de coruja entalhado (frente +Z, levemente para +X)
  const face = grp([
    // disco facial em relevo
    blob([0.12, 0.13, 0.04], woodDark, { pos: [-0.06, 0, 0] }),
    blob([0.12, 0.13, 0.04], woodDark, { pos: [0.06, 0, 0] }),
    ring(0.05, 0.012, carve, { pos: [-0.06, 0.02, 0.035] }),
    ring(0.05, 0.012, carve, { pos: [0.06, 0.02, 0.035] }),
    // bico
    slab([[-0.03, 0.02], [0.03, 0.02], [0, -0.07]], 0.03, wood, { pos: [0, -0.02, 0.045], smooth: false }),
    // sobrancelhas em V
    slab([[-0.11, 0.1], [-0.01, 0.06], [-0.01, 0.08], [-0.1, 0.13]], 0.02, carve, { pos: [0, 0, 0.03], smooth: false }),
    slab([[0.11, 0.1], [0.01, 0.06], [0.01, 0.08], [0.1, 0.13]], 0.02, carve, { pos: [0, 0, 0.03], smooth: false }),
    // asas entalhadas
    slab([[0, 0], [0.04, -0.1], [0.02, -0.24], [-0.02, -0.16]], 0.02, woodDark, { pos: [-0.13, -0.08, -0.02], rot: [0, -30, 0] }),
    slab([[0, 0], [-0.04, -0.1], [-0.02, -0.24], [0.02, -0.16]], 0.02, woodDark, { pos: [0.13, -0.08, -0.02], rot: [0, 30, 0] }),
  ], [0.03, 1.0, 0.13], [0, 15, 0]);
  r.add('post', face);
  // olhos (escuros quando apagado: o osso 'eyes' escala o brilho)
  const eyeDark = grp([blob([0.032, 0.032, 0.015], carve, { pos: [-0.06, 0.02, 0.04] }), blob([0.032, 0.032, 0.015], carve, { pos: [0.06, 0.02, 0.04] })], [0.03, 1.0, 0.13], [0, 15, 0]);
  r.add('post', eyeDark);
  r.add('eyes', blob([0.03, 0.03, 0.018], eyeGlow, { pos: [-0.06, 0.02, 0.045], castShadow: false }), blob([0.03, 0.03, 0.018], eyeGlow, { pos: [0.06, 0.02, 0.045], castShadow: false }));
  // entalhes de zigue-zague no corpo
  for (let i = 0; i < 6; i++) {
    const y = 0.28 + (i % 2) * 0.05;
    const x = -0.12 + i * 0.05;
    r.add('post', slab([[-0.025, 0], [0, 0.04], [0.025, 0]], 0.012, carve, { pos: [x, y + 0.08, Math.sqrt(Math.max(0.0001, 0.148 ** 2 - x * x))], rot: [0, Math.asin(x / 0.148) * 57.3, i % 2 ? 180 : 0], smooth: false }));
  }
  // cipó em espiral com folhas
  const spiral: V3[] = [];
  for (let k = 0; k <= 30; k++) {
    const a = k * 0.42 + 0.6, y = 0.12 + k * 0.04;
    const rr = 0.165 + Math.sin(k * 0.9) * 0.008;
    spiral.push([Math.sin(a) * rr, y, Math.cos(a) * rr]);
  }
  r.add('post', tube(spiral, (t) => 0.028 - t * 0.01, vine, { seg: 120, radial: 8 }));
  for (let k = 3; k < 30; k += 4) {
    const [x, y, z] = spiral[k];
    const a = (k * 0.42 + 0.6) * 57.3;
    r.add('post', leaf(0.13, 0.07, k % 8 === 3 ? leafM : leafM2, { pos: [x * 1.05, y, z * 1.05], rot: [0, a, -50 + (k % 3) * 30] }));
  }
  // cipó que sobe até o botão
  r.add('post', tube([spiral[30], [0.05, 1.32, 0.1], [0.0, 1.38, 0.02]], 0.016, vine, { seg: 16, radial: 8 }));
  // botão de flor: sépalas fixas + 5 pétalas articuladas
  r.add('bud', lathe([[0.001, -0.04], [0.05, -0.03], [0.06, 0.0], [0.04, 0.03]], sepal));
  for (let i = 0; i < 5; i++) {
    const b = `p${i}`;
    r.bone(b, 'bud', [0, 0.0, 0], [0, i * 72, 0]);
    r.bone(`${b}t`, b, [0, 0.0, 0.045], [-12, 0, 0]);
    r.add(`${b}t`,
      slab([[0, 0], [0.05, 0.05], [0.055, 0.14], [0, 0.19], [-0.055, 0.14], [-0.05, 0.05]], 0.014, petal, { rot: [0, 0, 0] }),
      slab([[0, 0.02], [0.035, 0.05], [0.035, 0.12], [0, 0.15], [-0.035, 0.12], [-0.035, 0.05]], 0.006, petalIn, { pos: [0, 0, -0.01] }),
    );
    r.add('bud', spike(0.08, 0.02, sepal, { pos: [Math.sin((i * 72 + 36) * Math.PI / 180) * 0.05, -0.02, Math.cos((i * 72 + 36) * Math.PI / 180) * 0.05], rot: [Math.cos((i * 72 + 36) * Math.PI / 180) * 50, 0, -Math.sin((i * 72 + 36) * Math.PI / 180) * 50] }));
  }
  // miolo de luz + halo + estames
  r.add('light',
    blob([0.06, 0.06, 0.06], glow, { castShadow: false }),
    blob([0.17, 0.17, 0.17], halo, { castShadow: false }),
  );
  for (let i = 0; i < 6; i++) {
    const a = (i * 60 * Math.PI) / 180;
    r.add('light', tube([[0, 0, 0], [Math.sin(a) * 0.03, 0.07, Math.cos(a) * 0.03], [Math.sin(a) * 0.05, 0.11, Math.cos(a) * 0.05]], 0.005, mat('skin', 0xfff0a0)), blob([0.012, 0.012, 0.012], glow, { pos: [Math.sin(a) * 0.05, 0.11, Math.cos(a) * 0.05], castShadow: false }));
  }
  return r;
}

const PET = ['p0t', 'p1t', 'p2t', 'p3t', 'p4t'];
// pétalas fechadas (repouso = levemente fechadas -12°, apagado = -30° = bem fechado)
const closed = Object.fromEntries(PET.map((p) => [p, [{ t: 0, r: [-24, 0, 0] as V3 }]]));
export const totemCipo: ModelDef = {
  id: 'totem-cipo',
  kind: 'prop',
  build: buildCipo,
  anims: {
    apagado: still({ ...closed, light: [{ t: 0, s: 0.01 }], eyes: [{ t: 0, s: 0.01 }] }),
    acender: {
      frames: 14, loop: false, keys: {
        ...Object.fromEntries(PET.map((p, i) => [p, [{ t: 0, r: [-24, 0, 0] as V3 }, { t: 0.2 + i * 0.03, r: [-30, 0, 0] as V3 }, { t: 0.65, r: [80, 0, 0] as V3, e: 'back' as const }, { t: 1, r: [62, 0, 0] as V3 }]])),
        light: [{ t: 0, s: 0.01 }, { t: 0.3, s: 0.01 }, { t: 0.6, s: 1.5, e: 'out' }, { t: 1, s: 1 }],
        eyes: [{ t: 0, s: 0.01 }, { t: 0.45, s: 0.01 }, { t: 0.7, s: 1.3, e: 'out' }, { t: 1, s: 1 }],
        post: [{ t: 0, s: 1 }, { t: 0.2, s: [1.04, 0.96, 1.04] }, { t: 0.5, s: [0.97, 1.04, 0.97] }, { t: 0.8, s: 1 }],
        bud: [{ t: 0, r: [0, 0, 0] }, { t: 0.5, r: [0, 120, 0] }, { t: 1, r: [0, 180, 0] }],
      },
    },
    aceso: {
      frames: 16, loop: true, keys: {
        ...Object.fromEntries(PET.map((p, i) => [p, wave(8, (t) => ({ r: [62 + Math.sin(t * Math.PI * 2 + i) * 6, 0, 0] }))])),
        light: wave(8, (t) => ({ s: 1 + Math.sin(t * Math.PI * 2) * 0.12 })),
        bud: wave(8, (t) => ({ r: [0, 180 + t * 72, 0] })),
      },
    },
  },
  cell: [128, 192],
  pivot: [64, 178],
  height: 192 / 104,
  presets: ['selva', 'caverna', 'recife', 'fabrica', 'bonus', 'neutro'],
};

/* ------------------------------ TOTEM DE SAÍDA ------------------------------ */
function emblem(i: number) {
  const gold = mat('paint', 0xf4c040, { rough: 0.4, emissive: 0xc07000, emissiveIntensity: 0.15 });
  const red = mat('paint', 0xd8402a, { rough: 0.5 });
  const green = mat('paint', 0x3aa04a, { rough: 0.5 });
  const blue = mat('paint', 0x2a7ad8, { rough: 0.5 });
  if (i === 0) // castanha
    return [blob([0.08, 0.1, 0.03], gold, { deform: [taper('y', -0.1, 0.1, 1.1, 0.6)] }), slab([[-0.04, 0.08], [0.04, 0.08], [0.02, 0.12], [-0.02, 0.12]], 0.02, mat('paint', 0x8a5a20), { pos: [0, 0.02, 0] })];
  if (i === 1) // folha
    return [leaf(0.24, 0.13, green, { pos: [0, -0.12, 0.01], rot: [0, 0, 20], curl: 0 }), tube([[0.04, -0.12, 0.03], [0.0, 0.0, 0.035], [-0.04, 0.1, 0.03]], 0.006, gold)];
  if (i === 2) // pena
    return [slab([[0, -0.12], [0.05, -0.04], [0.06, 0.06], [0.02, 0.13], [-0.03, 0.06], [-0.04, -0.04]], 0.02, red, { rot: [0, 0, -18] }), tube([[0.03, -0.14, 0.02], [0, 0, 0.025], [-0.02, 0.12, 0.02]], 0.007, gold)];
  // sol
  const parts = [blob([0.06, 0.06, 0.025], gold)];
  for (let k = 0; k < 8; k++) parts.push(spike(0.05, 0.018, blue, { pos: [Math.cos(k * 0.785) * 0.07, Math.sin(k * 0.785) * 0.07, 0], rot: [0, 0, k * 45 - 90] }));
  return parts;
}

function buildSaida() {
  const r = new Rig('root');
  const wood = mat('wood', 0x9a6a3a, { repeat: 1.5 });
  const woodDark = mat('wood', 0x5a3618);
  const panel = mat('wood', 0xc89a5a);
  const stone = mat('stone', 0x8a857a);
  const moss = mat('grass', 0x4e7a2a, { repeat: 3 });
  const ribbons = [mat('cloth', 0xe83a3a), mat('cloth', 0xffc030), mat('cloth', 0x3a9a4a), mat('cloth', 0x3a7ae0)];
  const feathers = [mat('skin', 0xe0302a, { rough: 0.5 }), mat('skin', 0xffb020, { rough: 0.5 }), mat('skin', 0x2a6ad0, { rough: 0.5 }), mat('skin', 0x38a848, { rough: 0.5 })];
  const metal = mat('metal', 0xd8b050, { metal: 0.55, rough: 0.3 });

  r.bone('pole', 'root');
  r.bone('drum', 'pole', [0, 1.3, 0]);
  r.bone('crest', 'drum', [0, 0.36, 0]);

  r.add('root',
    lathe([[0.36, 0], [0.37, 0.06], [0.32, 0.14], [0.24, 0.18], [0.001, 0.18]], stone, { deform: [wobble(0.02)], seg: 10 }),
    blob([0.2, 0.05, 0.12], moss, { pos: [-0.1, 0.14, 0.12] }),
  );
  r.add('pole',
    lathe([[0.11, 0.15], [0.1, 0.6], [0.095, 1.1], [0.1, 1.32]], wood, { deform: [wobble(0.006)] }),
    ...[0.4, 0.75, 1.1].map((y) => lathe([[0.112, -0.02], [0.12, 0], [0.112, 0.02]], woodDark, { pos: [0, y, 0] })),
    ...[0.4, 0.75, 1.1].flatMap((y, i) => [0, 90, 180, 270].map((a) => nail(0.016, metal, { pos: [Math.sin((a + i * 45) * Math.PI / 180) * 0.116, y, Math.cos((a + i * 45) * Math.PI / 180) * 0.116], rot: [0, a + i * 45, 0] }))),
  );
  // fitas amarradas no poste
  for (let i = 0; i < 4; i++) {
    const a = (i * 90 + 20) * Math.PI / 180;
    r.add('pole', tube([[Math.sin(a) * 0.1, 1.2, Math.cos(a) * 0.1], [Math.sin(a) * 0.2, 1.0, Math.cos(a) * 0.2 + 0.02], [Math.sin(a) * 0.22 + 0.04, 0.8, Math.cos(a) * 0.22]], 0.012, ribbons[i], { scale: [1, 1, 1] }));
  }
  // tambor de 4 faces
  r.add('drum',
    lathe([[0.2, 0.0], [0.24, 0.02], [0.24, 0.04], [0.001, 0.04]], woodDark, { seg: 4, rot: [0, 45, 0] }),
    lathe([[0.001, 0.32], [0.24, 0.32], [0.24, 0.34], [0.2, 0.36]], woodDark, { seg: 4, rot: [0, 45, 0] }),
  );
  for (let i = 0; i < 4; i++) {
    const g = grp([
      slab([[-0.15, -0.14], [0.15, -0.14], [0.15, 0.14], [-0.15, 0.14]], 0.04, panel, { smooth: false, bevel: 0.015 }),
      slab([[-0.12, -0.11], [0.12, -0.11], [0.12, 0.11], [-0.12, 0.11]], 0.01, woodDark, { pos: [0, 0, 0.03], smooth: false, bevel: 0.005 }),
      grp(emblem(i), [0, 0, 0.05]),
      ...[[-0.13, -0.12], [0.13, -0.12], [-0.13, 0.12], [0.13, 0.12]].map(([x, y]) => nail(0.012, metal, { pos: [x, y, 0.035] })),
    ], [Math.sin(i * Math.PI / 2) * 0.155, 0.18, Math.cos(i * Math.PI / 2) * 0.155], [0, i * 90, 0]);
    r.add('drum', g);
  }
  // coroa de penas + seta de madeira
  r.add('crest', blob([0.09, 0.06, 0.09], wood, { seg: 18 }));
  for (let i = 0; i < 7; i++) {
    const a = -60 + i * 20;
    r.add('crest', grp([slab([[0, 0], [0.045, 0.08], [0.05, 0.22], [0, 0.3], [-0.05, 0.22], [-0.045, 0.08]], 0.016, feathers[i % 4]), tube([[0, 0, 0.01], [0, 0.28, 0.012]], 0.005, mat('shell', 0xf4e8d0))], [0, 0.02, 0], [0, 0, a]));
  }
  return r;
}

export const totemSaida: ModelDef = {
  id: 'totem-saida',
  kind: 'prop',
  build: buildSaida,
  anims: {
    idle: {
      frames: 24, loop: true, keys: { crest: wave(12, (t) => ({ r: [0, 0, Math.sin(t * Math.PI * 2) * 3] })) },
    },
    girar: {
      frames: 32, loop: false, keys: {
        drum: [{ t: 0, r: [0, 0, 0], p: [0, 0, 0] }, { t: 0.1, r: [0, -20, 0], p: [0, 0.04, 0] }, { t: 0.85, r: [0, 1080, 0], e: 'out' }, { t: 0.92, r: [0, 1074, 0], p: [0, 0, 0] }, { t: 1, r: [0, 1080, 0] }],
        crest: [{ t: 0, r: [0, 0, 0] }, { t: 0.3, r: [0, 0, -14] }, { t: 0.85, r: [0, 0, 8] }, { t: 1, r: [0, 0, 0] }],
        pole: [{ t: 0, s: 1 }, { t: 0.1, s: [1.03, 0.97, 1.03] }, { t: 0.2, s: 1 }, { t: 0.9, s: [1.03, 0.98, 1.03] }, { t: 1, s: 1 }],
      },
    },
  },
  cell: [160, 224],
  pivot: [80, 210],
  height: 224 / 104,
  presets: ['selva', 'caverna', 'recife', 'fabrica', 'bonus', 'neutro'],
};
