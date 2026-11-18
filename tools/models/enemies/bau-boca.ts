/**
 * BAÚ-BOCA — baú de naufrágio vivo: madeira encharcada com cintas de ferro enferrujado,
 * cracas e algas, tampa que é uma bocarra com dentes de tábua, língua enorme, moedas de
 * ouro lá dentro e olhos esbugalhados na tampa. Anda aos pulinhos sobre pés de garra.
 * Dá para enganá-lo jogando o Peixe Seco (ele para para comer).
 */
import { Rig, blob, tube, slab, lathe, ring, roundBox, spike, eye, mat, taper, pull, bulge, wobble, D2R, type V3 } from '../../render/sculpt';
import { k, rz, rx, ry, ps, sc, anim, wave, SHOW } from '../../anims/enemies/common';
import type { AnimSet, Key } from '../../render/anim';
import type { ModelDef } from '../../render/types';

const W = 0.9, D = 0.56, HB = 0.36, HL = 0.2;

function build() {
  const r = new Rig('root');
  const wood = mat('wood', 0x8a5a32, { repeat: 1.5 });
  const woodDark = mat('wood', 0x5a3a20, { repeat: 1.5 });
  const iron = mat('rust', 0x6a4a3a, { metal: 0.35 });
  const gold = mat('metal', 0xe8b83a, { metal: 0.55, rough: 0.28 });
  const tooth = mat('wood', 0xe8dcc0, { repeat: 0.5 });
  const mouthM = mat('skin', 0x4a0e18, { rough: 0.6 });
  const tongueM = mat('skin', 0xd85a72, { rough: 0.35 });
  const barnacle = mat('shell', 0xd8d0c0, { repeat: 4 });
  const weed = mat('leaf', 0x3a7a3a);

  r.bone('base', 'root', [0, 0.12, 0]);
  r.bone('lid', 'base', [-W / 2 + 0.02, HB, 0]);
  r.bone('tongue', 'base', [-0.1, HB - 0.06, 0]);
  r.bone('fish', 'lid', [W - 0.02, -0.04, 0]);
  for (const [n, x, z] of [['FR', 0.34, 0.2], ['FL', 0.34, -0.2], ['BR', -0.34, 0.2], ['BL', -0.34, -0.2]] as const) {
    r.bone(`foot${n}`, 'base', [x, 0.0, z]);
  }

  /* corpo do baú (aberto em cima) */
  const t = 0.05;
  r.add('base',
    roundBox([W, HB, t], 0.02, wood, { pos: [0, HB / 2, D / 2 - t / 2], deform: [wobble(0.004, 5)] }),
    roundBox([W, HB, t], 0.02, wood, { pos: [0, HB / 2, -D / 2 + t / 2] }),
    roundBox([t, HB, D], 0.02, wood, { pos: [W / 2 - t / 2, HB / 2, 0] }),
    roundBox([t, HB, D], 0.02, wood, { pos: [-W / 2 + t / 2, HB / 2, 0] }),
    roundBox([W, t, D], 0.02, woodDark, { pos: [0, t / 2, 0] }),
    // interior escuro da boca e montinho de moedas
    roundBox([W - 2 * t, 0.02, D - 2 * t], 0.01, mouthM, { pos: [0, HB - 0.12, 0] }),
    ...([[0.12, 0.05], [0.2, -0.1], [0.28, 0.08], [0.05, -0.08], [-0.05, 0.1], [0.32, -0.04]] as [number, number][]).map(([x, z], i) => lathe([[0.001, -0.006], [0.04, -0.006], [0.04, 0.006], [0.001, 0.006]], gold, { pos: [x, HB - 0.1 + (i % 3) * 0.012, z], rot: [10 * (i - 2), 0, 14 * (i % 2 ? 1 : -1)] })),
    // tábuas (frisos) da frente
    ...[0.09, 0.18, 0.27].map((y) => roundBox([W - 0.02, 0.012, 0.012], 0.005, woodDark, { pos: [0, y, D / 2 + 0.002] })),
    // cintas de ferro com rebites
    ...[-0.28, 0.28].map((x) => roundBox([0.07, HB + 0.02, D + 0.03], 0.02, iron, { pos: [x, HB / 2, 0] })),
    ...[-0.28, 0.28].flatMap((x) => [0.06, 0.18, 0.3].map((y) => blob([0.014, 0.014, 0.01], gold, { pos: [x, y, D / 2 + 0.018], seg: 8 }))),
    // dentes de baixo (tábuas lascadas)
    ...[-0.3, -0.15, 0, 0.15, 0.3].map((x, i) => slab([[-0.04, 0], [0.04, 0], [0.01, 0.1 + (i % 2) * 0.03], [-0.01, 0.09]], 0.03, tooth, { pos: [x, HB - 0.01, D / 2 - 0.03], smooth: false, bevel: 0.008 })),
    slab([[-0.04, 0], [0.04, 0], [0.0, 0.11]], 0.03, tooth, { pos: [W / 2 - 0.04, HB - 0.01, 0.1], rot: [0, 90, 0], smooth: false, bevel: 0.008 }),
    slab([[-0.04, 0], [0.04, 0], [0.0, 0.09]], 0.03, tooth, { pos: [W / 2 - 0.04, HB - 0.01, -0.1], rot: [0, 90, 0], smooth: false, bevel: 0.008 }),
    // cracas e algas
    ...([[-0.38, 0.06, 0.29], [-0.32, 0.1, 0.3], [0.4, 0.04, 0.29], [-0.44, 0.2, 0.15]] as V3[]).map((p, i) => lathe([[0.03 - i * 0.003, 0], [0.026, 0.02], [0.012, 0.035], [0.008, 0.03]], barnacle, { pos: p, rot: [i === 3 ? 0 : 90, 0, i === 3 ? 90 : 0] })),
    tube([[-0.42, 0.02, 0.29], [-0.46, -0.04, 0.3], [-0.44, -0.1, 0.32], [-0.48, -0.16, 0.3]], (u) => 0.018 * (1 - u * 0.6), weed, { seg: 12, radial: 5 }),
    tube([[0.2, 0.02, 0.3], [0.24, -0.04, 0.32], [0.2, -0.1, 0.31]], (u) => 0.014 * (1 - u * 0.6), weed, { seg: 10, radial: 5 }),
    // fechadura que vira "nariz"
    roundBox([0.1, 0.12, 0.03], 0.02, gold, { pos: [0.0, HB - 0.08, D / 2 + 0.02] }),
    blob([0.016, 0.026, 0.01], mat('metal', 0x1a1a1a), { pos: [0, HB - 0.09, D / 2 + 0.036] }),
  );
  /* tampa curva (meio-cilindro) com dentes de cima e olhos */
  r.add('lid',
    lathe([[0.001, 0], [D / 2, 0], [D / 2, 0.02], [D / 2 * 0.95, 0.08], [D / 2 * 0.8, 0.15], [D / 2 * 0.5, HL], [0.001, HL + 0.01]], wood, { pos: [W / 2 - 0.02, 0, 0], rot: [0, 0, 0], scale: [W / D, 1, 1], deform: [] }),
    // cintas da tampa
    ...[-0.28, 0.28].map((x) => ring(D / 2 + 0.005, 0.03, iron, { pos: [W / 2 - 0.02 + x, 0.0, 0], rot: [0, 90, 0], arc: 180, scale: [0.82, 0.62, 1] })),
    // forro vermelho da boca por dentro
    blob([W / 2 - 0.04, 0.02, D / 2 - 0.04], mouthM, { pos: [W / 2 - 0.02, -0.005, 0] }),
    ...[-0.3, -0.15, 0, 0.15, 0.3].map((x, i) => slab([[-0.04, 0], [0.04, 0], [0.01, -0.09 - ((i + 1) % 2) * 0.03], [-0.01, -0.08]], 0.03, tooth, { pos: [W / 2 - 0.02 + x, 0.0, D / 2 - 0.03], smooth: false, bevel: 0.008 })),
    // craca no topo
    lathe([[0.04, 0], [0.034, 0.025], [0.016, 0.045], [0.01, 0.04]], barnacle, { pos: [W / 2 - 0.25, HL - 0.01, 0.08] }),
  );
  r.bones.lid.children[0].scale.set(W / D, 1, 1);
  // olhos esbugalhados no alto da tampa
  const eR = eye({ r: 0.085, iris: 0x2aa0a0, irisScale: 0.5, look: [0.7, -0.2], lid: 0.3, lidColor: 0x5a3a20, angry: 18 });
  eR.position.set(W / 2 + 0.12, 0.17, 0.13); eR.rotation.y = 0.6;
  const eL = eye({ r: 0.08, iris: 0x2aa0a0, irisScale: 0.5, look: [0.7, -0.2], lid: 0.3, lidColor: 0x5a3a20, angry: -18 });
  eL.position.set(W / 2 + 0.14, 0.17, -0.1); eL.rotation.y = 0.2;
  r.add('lid', eR, eL,
    slab([[-0.07, 0], [0.06, 0.02], [0.07, 0.045], [-0.06, 0.035]], 0.025, woodDark, { pos: [W / 2 + 0.14, 0.27, 0.14], rot: [0, 35, -16] }),
  );
  r.bones.lidR = eR.getObjectByName('lid')!;
  r.bones.lidL = eL.getObjectByName('lid')!;
  /* língua comprida */
  r.add('tongue',
    tube([[0, 0, 0], [0.15, 0.02, 0], [0.3, 0.0, 0], [0.42, -0.04, 0]], (u) => 0.07 * (1 - u * 0.35), tongueM, { seg: 16, radial: 12, scale: [1, 0.5, 1.6] }),
    tube([[0.12, 0.03, 0], [0.38, -0.01, 0]], 0.006, mat('skin', 0xa83a52), { seg: 6, radial: 4, pos: [0, 0.008, 0] }),
  );
  /* pés de garra (estilo baú antigo) */
  for (const n of ['FR', 'FL', 'BR', 'BL']) {
    r.add(`foot${n}`,
      blob([0.06, 0.06, 0.06], woodDark, { pos: [0, -0.04, 0] }),
      ...[-30, 0, 30].map((a) => spike(0.07, 0.022, gold, { pos: [0.02, -0.09, 0], rot: [a, 0, -100], curve: 0.4 })),
    );
  }
  /* peixe seco (aparece em comer-peixe) */
  r.add('fish',
    blob([0.12, 0.045, 0.025], mat('skin', 0xb08a50, { rough: 0.7 }), { pos: [0.06, 0, 0], deform: [taper('x', -0.12, 0.12, 0.6, 1)] }),
    slab([[0, 0], [-0.07, 0.05], [-0.06, 0], [-0.07, -0.05]], 0.01, mat('skin', 0x9a7440), { pos: [-0.05, 0, 0] }),
    blob([0.012, 0.012, 0.01], mat('pupil', 0x101010), { pos: [0.15, 0.01, 0.02] }),
  );
  r.bones.fish.scale.setScalar(0.001);
  r.anchor('head', 'lid', [W / 2, 0.3, 0]);
  return r;
}

const feet = (lift: number): Record<string, Key[]> => ({
  footFR: [rz(0, 0), rz(0.3, -lift), rz(0.6, lift * 0.5), rz(1, 0)], footFL: [rz(0, 0), rz(0.3, -lift), rz(0.6, lift * 0.5), rz(1, 0)],
  footBR: [rz(0, 0), rz(0.3, lift), rz(0.6, -lift * 0.5), rz(1, 0)], footBL: [rz(0, 0), rz(0.3, lift), rz(0.6, -lift * 0.5), rz(1, 0)],
});

function anims(): AnimSet {
  const idle = anim(24, true, {
    lid: [rz(0, 0), rz(0.4, 8), rz(0.5, 6), rz(0.6, 9), rz(0.8, 0), rz(1, 0)],
    base: [k(0, [0, 0, 0], undefined, undefined, 1), k(0.5, [0, 0, 0], undefined, undefined, [1.02, 0.98, 1.02]), k(1, [0, 0, 0], undefined, undefined, 1)],
    tongue: [rz(0, 0), rz(0.45, 0), rz(0.55, 8), rz(0.7, 0), rz(1, 0)],
    lidR: [rx(0, 0), rx(0.8, 0), rx(0.84, 60), rx(0.9, 0), rx(1, 0)], lidL: [rx(0, 0), rx(0.8, 0), rx(0.84, 60), rx(0.9, 0), rx(1, 0)],
  });
  const hop = (frames: number, height: number, open: number, tongue: boolean) => anim(frames, true, {
    base: [k(0, [0, 0, 0], [0, 0, 0], undefined, [1.08, 0.9, 1.04]), k(0.15, [0, 0, -6], [0, 0.04, 0], 'out', 1), k(0.45, [0, 0, 4], [0, height, 0], 'out', [0.95, 1.06, 0.97]), k(0.85, [0, 0, 0], [0, 0.02, 0], 'in', 1), k(1, [0, 0, 0], [0, 0, 0], 'in', [1.08, 0.9, 1.04])],
    lid: [rz(0, open * 0.3), rz(0.45, open), rz(0.85, open * 0.2, 'in'), rz(1, open * 0.3)],
    ...feet(30),
    tongue: tongue ? [k(0, [0, 0, 0], undefined, undefined, SHOW / SHOW), k(0.45, [0, 0, -14], [0.06, 0, 0]), k(1, [0, 0, 0])] : [rz(0, 0), rz(1, 0)],
    lidR: [rx(0, 0), rx(0.4, -20), rx(0.9, 0), rx(1, 0)], lidL: [rx(0, 0), rx(0.4, -20), rx(0.9, 0), rx(1, 0)],
  });
  const andar = hop(16, 0.14, 10, false);
  const perseguir = hop(10, 0.2, 34, true);
  const morder = anim(10, false, {
    base: [k(0, [0, 0, 0], [0, 0, 0]), k(0.3, [0, 0, 8], [-0.04, 0, 0]), k(0.5, [0, 0, -10], [0.14, 0.04, 0], 'in'), k(1, [0, 0, 0], [0, 0, 0])],
    lid: [rz(0, 0), rz(0.3, 60, 'out'), rz(0.5, -2, 'in'), rz(0.6, 4), rz(1, 0)],
    tongue: [rz(0, 0), rz(0.3, 10), rz(0.5, 0), rz(1, 0)],
    lidR: [rx(0, 0), rx(0.3, 30), rx(0.7, 30), rx(1, 0)], lidL: [rx(0, 0), rx(0.3, 30), rx(0.7, 30), rx(1, 0)],
  });
  const ataque = anim(14, false, { ...morder.keys, base: [k(0, [0, 0, 0], [0, 0, 0]), k(0.3, [0, 0, 10], [-0.06, 0.02, 0]), k(0.5, [0, 0, -14], [0.24, 0.12, 0], 'in'), k(0.7, [0, 0, 0], [0.24, 0, 0], 'in'), k(1, [0, 0, 0], [0, 0, 0])] });
  // comer-peixe: mastiga feliz, de olhos fechados, com o rabo do peixe aparecendo
  const comer = anim(16, true, {
    fish: [k(0, [0, 0, -20], [0, 0, 0], undefined, SHOW), k(0.5, [0, 0, -14], [-0.01, -0.01, 0], undefined, SHOW), k(1, [0, 0, -20], [0, 0, 0], undefined, SHOW)],
    lid: [rz(0, 14), rz(0.25, 2), rz(0.5, 14), rz(0.75, 2), rz(1, 14)],
    base: [k(0, [0, 0, 0], [0, 0, 0], undefined, 1), k(0.25, [0, 0, 0], [0, -0.01, 0], undefined, [1.04, 0.96, 1.04]), k(0.5, [0, 0, 0], [0, 0, 0], undefined, 1), k(0.75, [0, 0, 0], [0, -0.01, 0], undefined, [1.04, 0.96, 1.04]), k(1, [0, 0, 0], [0, 0, 0], undefined, 1)],
    lidR: [rx(0, 65), rx(1, 65)], lidL: [rx(0, 65), rx(1, 65)],
    tongue: wave(6, 0, 0, 8, 2),
  });
  const dano = anim(10, false, {
    base: [k(0, [0, 0, 0], [0, 0, 0]), k(0.2, [0, 0, 18], [-0.12, 0.1, 0], 'out'), k(1, [0, 0, 0], [-0.14, 0, 0], 'bounce')],
    lid: [rz(0, 0), rz(0.2, 50), rz(0.6, 20), rz(1, 6)],
    tongue: [rz(0, 0), rz(0.2, 30), rz(1, 10)],
    lidR: [rx(0, 0), rx(0.15, 70), rx(1, 45)], lidL: [rx(0, 0), rx(0.15, 70), rx(1, 45)],
  });
  // morte: a tampa escancara, a língua cai para fora e ele tomba de lado
  const morte = anim(24, false, {
    base: [k(0, [0, 0, 0], [0, 0, 0]), k(0.25, [0, 0, 10], [0, 0.2, 0], 'out'), k(0.55, [0, 0, 80], [0.1, 0.1, 0], 'in'), k(0.65, [0, 0, 90], [0.12, 0.24, 0], 'in'), k(0.8, [0, 0, 86], [0.12, 0.28, 0], 'out'), k(1, [0, 0, 90], [0.12, 0.24, 0], 'bounce')],
    lid: [rz(0, 0), rz(0.25, 40), rz(0.6, 100), rz(1, 95, 'bounce')],
    tongue: [rz(0, 0), rz(0.6, -20), rz(1, -40)],
    lidR: [rx(0, 0), rx(0.25, -30), rx(0.6, 80), rx(1, 80)], lidL: [rx(0, 0), rx(0.25, -30), rx(0.6, 80), rx(1, 80)],
  });
  const tonto = anim(16, true, {
    base: Array.from({ length: 9 }, (_, i) => k(i / 8, [8 * Math.sin((i / 8) * Math.PI * 2), 0, 6 * Math.cos((i / 8) * Math.PI * 2)], undefined, 'linear')),
    lid: [rz(0, 20), rz(0.5, 26), rz(1, 20)],
    tongue: wave(14, 0, -10),
    lidR: [rx(0, 45), rx(1, 45)], lidL: [rx(0, 15), rx(1, 15)],
  });
  return { idle, andar, ataque, dano, morte, tonto, perseguir, morder, 'comer-peixe': comer };
}

export const bauBoca: ModelDef = {
  id: 'bau-boca',
  kind: 'enemy',
  build,
  anims: anims(),
  cell: [256, 224],
  pivot: [124, 200],
  height: 224 / 104,
  presets: ['recife', 'neutro'],
};
