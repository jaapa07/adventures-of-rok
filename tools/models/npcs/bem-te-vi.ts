/**
 * BEM-TE-VI — passarinho carteiro: traz o brinde diário (19.6) e cuida do save no mapa.
 * Barriga amarelo-sol, garganta branca, cabeça preta com a faixa branca de "sobrancelha",
 * costas pardas, quepe azul de carteiro com distintivo, bolsinha de couro a tiracolo com cartas.
 */
import { blob, tube, slab, spike, roundBox, lathe, mat, Rig, type V3 } from '../../render/sculpt';
import type { ModelDef } from '../../render/types';
import { buildBird, birdAnims } from './bird';
import { HIDDEN } from '../../anims/bosses/kit';

const S = 0.14;

function bill(r: Rig) {
  const black = mat('plastic', 0x1a1614, { rough: 0.35 });
  r.add('billU', spike(0.09, 0.022, black, { pos: [-0.01, 0.0, 0], rot: [0, 0, -90], curve: 0.15 }));
  r.add('billL', spike(0.075, 0.016, black, { pos: [-0.01, 0.0, 0], rot: [0, 0, -92] }));
}

function extra(r: Rig) {
  const white = mat('shortFur', 0xf8f6f0, { repeat: 4 });
  const black = mat('shortFur', 0x18161a, { repeat: 4 });
  // faixa branca da sobrancelha que dá a volta na nuca + garganta branca
  r.add('head',
    tube([[0.06, 0.04, 0.07], [0.0, 0.055, 0.075], [-0.06, 0.04, 0.06], [-0.075, 0.02, 0.0], [-0.06, 0.04, -0.06], [0.0, 0.055, -0.075], [0.06, 0.04, -0.07]], 0.014, white, { seg: 30, radial: 8 }),
    blob([0.045, 0.03, 0.05], white, { pos: [0.04, -0.05, 0] }),
    // topete amarelo escondido (aparece um pouquinho)
    slab([[0, 0], [0.03, 0.01], [0.0, 0.025]], 0.01, mat('shortFur', 0xf6c21a), { pos: [0.0, 0.07, 0], rot: [0, 90, 0] }),
  );
  r.add('neck', blob([0.05, 0.04, 0.05], white, { pos: [0.02, 0.0, 0] }));
  void black;
  // quepe de carteiro
  r.bone('cap', 'head', [-0.005, 0.05, 0], [0, 0, 8]);
  const blue = mat('cloth', 0x2a4a9a, { repeat: 3 });
  r.add('cap',
    lathe([[0.001, 0.045], [0.05, 0.045], [0.06, 0.03], [0.05, 0.0], [0.001, 0.0]], blue, {}),
    slab([[0, -0.035], [0.04, -0.03], [0.05, 0], [0.04, 0.03], [0, 0.035]], 0.006, mat('plastic', 0x101018), { pos: [0.04, 0.004, 0], rot: [90, 0, -10] }),
    blob([0.012, 0.012, 0.005], mat('metal', 0xe8c040, { metal: 0.5, rough: 0.3 }), { pos: [0.058, 0.028, 0], rot: [0, 90, 0] }),
  );
  // bolsinha a tiracolo
  r.bone('bag', 'body', [0.02, -0.03, 0.1]);
  const leather = mat('leather', 0x8a4e24);
  r.add('chest', tube([[0.05, 0.08, -0.07], [0.08, 0.02, 0.0], [0.04, -0.06, 0.08]], 0.007, mat('leather', 0x5a3014), { seg: 12, radial: 5 }));
  r.add('bag',
    roundBox([0.08, 0.06, 0.03], 0.012, leather, {}),
    roundBox([0.08, 0.035, 0.008], 0.006, mat('leather', 0x6a3a18), { pos: [0, 0.015, 0.016] }),
    blob([0.008, 0.008, 0.004], mat('metal', 0xe8c040, { metal: 0.5 }), { pos: [0, 0.0, 0.02] }),
    slab([[-0.03, 0], [0.03, 0], [0.03, 0.03], [-0.03, 0.03]], 0.004, mat('paint', 0xf6f2e8), { pos: [-0.01, 0.03, 0], rot: [0, 0, 10], smooth: false, bevel: 0.002 }),
  );
  // carta no bico (só na animação entregar)
  r.bone('letter', 'billL', [0.05, 0.0, 0]);
  r.bones.letter.scale.setScalar(HIDDEN * 1.5);
  r.add('letter',
    slab([[-0.045, -0.03], [0.045, -0.03], [0.045, 0.03], [-0.045, 0.03]], 0.004, mat('paint', 0xf6f2e8), { rot: [0, 0, -10], smooth: false, bevel: 0.002 }),
    slab([[-0.045, 0.03], [0.045, 0.03], [0, 0.0]], 0.002, mat('paint', 0xe0d8c4), { pos: [0, 0, 0.004], rot: [0, 0, -10], smooth: false, bevel: 0.001 }),
    blob([0.01, 0.01, 0.003], mat('paint', 0xc0202a), { pos: [0.0, 0.0, 0.007] }),
  );
  void ([] as V3[]);
}

export const bemTeVi: ModelDef = {
  id: 'bem-te-vi',
  kind: 'npc',
  build: () => buildBird({
    size: S, leg: 0.1, body: 0xf6cc22, back: 0x7a5e3e, belly: 0xf8d22a, head: 0x1a181c, wing: 0x7a5a3a, wingTip: 0xa8683a, tail: 0x6a4e32, leg_c: 0x2a2626,
    eyeR: 0.024, iris: 0x2a1a10, lean: 30, bill, extra,
  }),
  anims: birdAnims(S, { entregar: true, billOpen: 30 }),
  cell: [200, 180],
  pivot: [86, 160],
  height: 180 / 104,
  presets: ['selva', 'neutro'],
};
