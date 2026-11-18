/**
 * TUCANO — tucano-toco tagarela que comenta tudo, dá desafios (19.5) e faz o Voo do Tucano no mapa.
 * Corpo preto, babador creme-amarelado, bicão laranja com ponta preta e friso vermelho,
 * pele laranja e anel azul em volta do olho, sobretudo vermelho e um lencinho de explorador.
 */
import { blob, tube, slab, mat, taper, pull, bulge, Rig, type V3 } from '../../render/sculpt';
import type { ModelDef } from '../../render/types';
import { buildBird, birdAnims } from './bird';

const S = 0.17;

function bill(r: Rig) {
  const orange = mat('plastic', 0xf2861e, { rough: 0.3 });
  const yellow = mat('plastic', 0xf6c22a, { rough: 0.3 });
  const black = mat('plastic', 0x141414, { rough: 0.3 });
  const red = mat('plastic', 0xd0281e, { rough: 0.3 });
  // bico superior: enorme, curvo, afinando até a ponta preta
  r.add('billU',
    blob([0.2, 0.075, 0.06], orange, { pos: [0.17, 0.0, 0], deform: [taper('x', -0.2, 0.2, 1.15, 0.35), pull([0.2, 0, 0], 0.12, [0.0, -0.05, 0]), bulge([0.0, 0.07, 0], 0.12, 0.012)] }),
    blob([0.1, 0.06, 0.055], yellow, { pos: [0.06, 0.012, 0], deform: [taper('x', -0.1, 0.1, 1, 0.8)] }),
    blob([0.045, 0.03, 0.022], black, { pos: [0.355, -0.035, 0], rot: [0, 0, -30] }),
    tube([[0.0, 0.075, 0], [0.15, 0.072, 0], [0.28, 0.035, 0], [0.35, -0.02, 0]], 0.008, red, { seg: 16, radial: 6 }),
    // narinas
    blob([0.008, 0.006, 0.006], black, { pos: [0.02, 0.06, 0.035] }),
  );
  r.add('billL',
    blob([0.17, 0.035, 0.05], orange, { pos: [0.15, 0.0, 0], deform: [taper('x', -0.17, 0.17, 1.1, 0.35), pull([0.17, 0, 0], 0.1, [0, 0.015, 0])] }),
    blob([0.03, 0.02, 0.02], black, { pos: [0.3, 0.012, 0] }),
    blob([0.08, 0.02, 0.04], mat('skin', 0xc84a5a, { rough: 0.4 }), { pos: [0.08, 0.025, 0] }),
  );
}

function extra(r: Rig) {
  const scarf = mat('cloth', 0x2e9a4a);
  const scarfDark = mat('cloth', 0xf2c230);
  r.add('neck',
    blob([0.085, 0.035, 0.085], scarf, { pos: [0, -0.02, 0], rot: [0, 0, 20] }),
    slab([[0, 0], [0.06, -0.02], [0.03, -0.08]], 0.012, scarfDark, { pos: [0.06, -0.04, 0.02], rot: [0, 30, -10] }),
    slab([[0, 0], [0.05, -0.03], [0.02, -0.08]], 0.012, scarf, { pos: [0.05, -0.05, -0.02], rot: [0, -30, 10] }),
  );
  // babador amarelado no alto do peito e penas vermelhas sob a cauda
  r.add('chest', blob([0.07, 0.06, 0.09], mat('shortFur', 0xf8e08a), { pos: [0.08, 0.1, 0] }));
  r.add('body', blob([0.06, 0.05, 0.07], mat('shortFur', 0xd02a2a), { pos: [-0.15, -0.06, 0] }));
  // babador branco grande (marca do tucano-toco)
  r.add('chest', blob([0.11, 0.12, 0.12], mat('shortFur', 0xf6f0dc, { repeat: 4 }), { pos: [0.08, 0.04, 0] }));
  for (const s of ['L', 'R']) r.bones[`wing${s}`].scale.setScalar(1.25);
  void tube; void pull; void ([] as V3[]);
}

export const tucano: ModelDef = {
  id: 'tucano',
  kind: 'npc',
  build: () => buildBird({
    size: S, leg: 0.17, body: 0x16161a, back: 0x1c1c22, belly: 0xf4ecd4, head: 0x18181c, wing: 0x1e1e24, wingTip: 0x101014, tail: 0x121216, leg_c: 0x5a7ab0,
    eyeR: 0.03, iris: 0x2a5aa8, eyeRing: 0xf28a1e, lean: 38, bill, extra,
  }),
  anims: birdAnims(S, { comentar: true, billOpen: 26 }),
  cell: [260, 240],
  pivot: [100, 210],
  height: 240 / 104,
  presets: ['selva', 'caverna', 'recife', 'fabrica', 'neutro'],
};
