/**
 * Parallax da MATA ALTA (dia ensolarado e fim de tarde): morros e cachoeiras ao fundo,
 * sumaúmas gigantes emergindo do dossel, mata média com palmeiras e feixes de luz, troncos
 * próximos com sapopemas e, na frente do jogador, silhuetas escuras de folhas e cipós.
 */
import * as THREE from 'three';
import type { SceneDef } from '../types';
import { hr, hash, mix, M, vmat, col, type V3 } from '../lib/core';
import { crown, kapok, tree, palm, fern, bush, heliconia, bigLeaf, mossRock, hangingVine, hill, waterfall, grassTuft, bromeliad, MAT } from '../lib/flora';
import { layerScene, groundStrip, per, beams, glow, motes, type LayerCtx } from './common';

export interface MataPal {
  fog: [number, number, number, number]; // névoa das camadas 1..4
  hill: [number, number, number];
  leafFar: [number, number, number];
  leaf: [number, number, number];
  leafNear: [number, number, number];
  bark: number;
  barkNear: number;
  ground: [number, number];
  beam: number;
  fg: number;
  tarde?: boolean;
}

export const PAL_DIA: MataPal = {
  fog: [0xb4dbe6, 0x9fcfc4, 0x7fb08a, 0x4f7a48],
  hill: [0x6f9e9a, 0x5d8f80, 0x4d7e66],
  leafFar: [0x3f7a54, 0x5f9e5a, 0x8cc070],
  leaf: [0x2c5e2a, 0x4a8a34, 0x86c050],
  leafNear: [0x1e4a1e, 0x3a7a2a, 0x74b444],
  bark: 0x9a8f80,
  barkNear: 0x6a5a48,
  ground: [0x4a6a2a, 0x5a4a2a],
  beam: 0xfff0b0,
  fg: 0x0f2412,
};

export const PAL_TARDE: MataPal = {
  fog: [0xf0a890, 0xd88a7a, 0xa86a6a, 0x5a3a4a],
  hill: [0xa8708a, 0x8a5a78, 0x6a4a66],
  leafFar: [0x5a4a5a, 0x7a5a5a, 0xc88a6a],
  leaf: [0x2a3a2a, 0x4a5a32, 0xc0904a],
  leafNear: [0x1a2a1e, 0x34482a, 0xa07a3a],
  bark: 0x8a6a6a,
  barkNear: 0x4a3a3a,
  ground: [0x3a3a24, 0x4a3024],
  beam: 0xffa060,
  fg: 0x140c12,
  tarde: true,
};

/** Camada 1: morros, cachoeiras, sumaúmas no horizonte, nuvens. */
export function mataFar(c: LayerCtx, P: MataPal, o: { waterfalls?: boolean; sun?: boolean; devastated?: boolean } = {}) {
  const { W } = c;
  // três cordilheiras em profundidades diferentes
  for (let row = 0; row < 3; row++) {
    const z = -40 + row * 12;
    const n = 7 + row * 2;
    for (let i = 0; i < n; i++) {
      const x = -W / 2 + (W * (i + hr(0, 0.6, i, row))) / n;
      const w = hr(7, 12, i, row + 3) * (1 - row * 0.15);
      const h = hr(4, 8, i, row + 5) * (1 - row * 0.22) + (row === 0 ? 3 : 0);
      c.wrap(x, w / 2, (xx) => hill(c.nb, M([xx, row * 0.4 - 2.5, z]), w, h + 1.5, P.hill[row], i * 7 + row * 31));
    }
  }
  groundStrip(c, -16, 0, () => -0.6, () => col(P.leafFar[0]), vmat('rubber', 0xffffff, { rough: 1, rim: 0 }), 8, 2);
  // dossel distante (faixa de copas) e sumaúmas emergentes
  for (let i = 0; i < 70; i++) {
    const x = -W / 2 + (W * i) / 70 + hr(-0.2, 0.2, i, 41);
    const z = hr(-14, -4, i, 42);
    c.wrap(x, 1.4, (xx) => crown(c.nb, M([xx, hr(0.2, 2.2, i, 43), z]), hr(0.8, 1.3, i, 44), o.devastated ? [0x5a5040, 0x7a6a50, 0x9a8a6a] : P.leafFar, i, { lobes: 4, detail: 1 }));
  }
  for (let i = 0; i < 4; i++) {
    const x = -W / 2 + W * (0.12 + 0.25 * i) + hr(-1, 1, i, 50);
    c.wrap(x, 3, (xx) => kapok(c.nb, M([xx, 0, -16 + i]), hr(9, 12, i, 51), { bark: P.bark, leaf: P.leafFar }, i * 5));
  }
  if (o.waterfalls !== false) {
    // penhascos com cachoeiras
    for (const [i, fx] of [[0, -0.28], [1, 0.31]] as [number, number][]) {
      const x = fx * W;
      c.wrap(x, 4, (xx) => {
        mossRock(c.nb, M([xx, 0, -30], [0, 0, 0], 1), [3.2, 7.5, 2], P.hill[1], P.leafFar[1], 60 + i, 3);
        waterfall(c.root, [xx + 0.3, 1.8, -27.5], 0.9 + i * 0.3, 5.6 - i, 0xf4fbff, 0.75);
      });
    }
  }
  if (o.sun) glow(c, [-W * 0.18, 9.5, -45], 4.5, 0xffd080, 0.9);
  // nuvens
  for (let i = 0; i < 7; i++) {
    const x = -W / 2 + (W * (i + 0.5)) / 7 + hr(-1, 1, i, 70);
    const y = hr(11, 15.5, i, 71);
    c.wrap(x, 3, (xx) => crown(c.nb, M([xx, y, -48], [0, 0, 0], [1.6, 0.55, 0.6]), hr(1.6, 2.4, i, 72), P.tarde ? [0xd08a8a, 0xf0b0a0, 0xffe0c0] : [0xd8e8f0, 0xf0f8ff, 0xffffff], 80 + i, { lobes: 6, detail: 1 }));
  }
}

/** Camada 2: dossel médio, sumaúmas gigantes (troncos visíveis), névoa. */
export function mataMid(c: LayerCtx, P: MataPal, o: { devastated?: boolean } = {}) {
  const { W } = c;
  groundStrip(c, -24, 0, (x, z) => 0.3 * per(x, W, 3, z * 0.2) - 0.4, (x, z) => mix(P.ground[0], P.ground[1], 0.5 + 0.5 * per(x, W, 5)), vmat('rubber', 0xffffff, { rough: 1, rim: 0 }));
  const leaf = o.devastated ? ([0x4a4a30, 0x6a6a40, 0x8a8a58] as [number, number, number]) : P.leaf;
  for (let i = 0; i < 3; i++) {
    const x = -W / 2 + W * (0.2 + 0.33 * i) + hr(-1.5, 1.5, i, 1);
    c.wrap(x, 5, (xx) => kapok(c.b, M([xx, -0.4, -10 - i * 3]), hr(14, 17, i, 2), { bark: P.bark, leaf }, 10 + i));
  }
  for (let i = 0; i < 26; i++) {
    if (o.devastated && i % 3 !== 0) continue;
    const x = -W / 2 + (W * i) / 26 + hr(-0.3, 0.3, i, 5);
    const z = hr(-20, -6, i, 6);
    c.wrap(x, 2.5, (xx) => tree(c.b, M([xx, -0.4, z]), hr(4.5, 7.5, i, 7), { bark: P.bark, leaf }, i + 20));
  }
  for (let i = 0; i < 40; i++) {
    if (o.devastated && i % 2) continue;
    const x = -W / 2 + (W * i) / 40;
    c.wrap(x, 1.6, (xx) => crown(c.b, M([xx, hr(0.4, 1.4, i, 8), hr(-8, -3, i, 9)]), hr(1, 1.6, i, 10), leaf, i + 90, { lobes: 5, detail: 1 }));
  }
}

/** Camada 3: mata — troncos, palmeiras, samambaias, cipós e feixes de luz. */
export function mataNear3(c: LayerCtx, P: MataPal, o: { devastated?: boolean } = {}) {
  const { W, H } = c;
  groundStrip(c, -10, 2, (x, z) => 0.25 * per(x, W, 4, 1) + 0.15 * per(x, W, 9, z) - 0.2, (x, z) => mix(P.ground[0], P.ground[1], 0.5 + 0.5 * per(x, W, 7)).multiplyScalar(0.8), vmat('rubber', 0xffffff, { rough: 1, rim: 0.1 }));
  const leaf = P.leaf;
  // troncos altos que saem pelo topo
  for (let i = 0; i < 5; i++) {
    const x = -W / 2 + (W * (i + 0.3)) / 5 + hr(-0.8, 0.8, i, 1);
    const z = hr(-7, -2, i, 2);
    c.wrap(x, 2, (xx) => {
      kapok(c.b, M([xx, -0.2, z]), H * 1.25, { bark: mix(P.bark, P.barkNear, 0.5).getHex(), leaf }, i + 30, { crown: false, r0: hr(0.45, 0.7, i, 11) });
      crown(c.b, M([xx + hr(-1, 1, i, 3), H - 1.2, z]), 2.6, leaf, i + 33);
    });
  }
  if (!o.devastated) {
    for (let i = 0; i < 4; i++) {
      const x = -W / 2 + (W * (i + 0.7)) / 4;
      c.wrap(x, 3, (xx) => palm(c.b, M([xx, -0.2, hr(-5, -1, i, 4)]), hr(6, 8, i, 5), { trunk: P.bark, leaf: leaf[1] }, i + 40));
    }
  }
  for (let i = 0; i < 18; i++) {
    const x = -W / 2 + (W * i) / 18 + hr(-0.4, 0.4, i, 6);
    c.wrap(x, 1.5, (xx) => {
      if (i % 3 === 0) bush(c.b, M([xx, -0.2, hr(-3, 0, i, 7)]), hr(0.9, 1.4, i, 8), leaf, i + 50);
      else fern(c.b, M([xx, -0.2, hr(-3, 0.5, i, 7)]), hr(1, 1.5, i, 8), leaf[1], i + 60, 8);
    });
  }
  // cipós pendurados do alto
  for (let i = 0; i < 9; i++) {
    const x = -W / 2 + (W * (i + 0.5)) / 9;
    c.wrap(x, 1, (xx) => hangingVine(c.b, M([xx, H + 0.5, hr(-4, -1, i, 9)]), hr(4, 9, i, 10), mix(P.barkNear, leaf[0], 0.4).getHex(), leaf[1], i, 0.06));
  }
  beams(c, [0, 1, 2, 3, 4].map((i) => ({ x: -W / 2 + (W * (i + 0.4)) / 5, y: H * 0.55, z: -1.5, w: 2.2 + (i % 2), h: H * 1.2, ang: -22, op: 0.22 })), P.beam);
  motes(c, 40, { y0: 1, y1: H * 0.8, z0: -3, z1: 0 }, P.beam, 0.07, 3, 0.5);
}

/** Camada 4: perto — troncos grossos com sapopemas, folhas grandes, helicônias, pedras. */
export function mataNear4(c: LayerCtx, P: MataPal, o: { devastated?: boolean } = {}) {
  const { W, H } = c;
  groundStrip(c, -5, 2, (x, z) => 0.35 * per(x, W, 3, 2) + 0.12 * per(x, W, 11, z) - 0.25, (x) => mix(P.ground[0], P.ground[1], 0.5 + 0.5 * per(x, W, 6)).multiplyScalar(0.7), vmat('rubber', 0xffffff, { rough: 1, rim: 0.15 }));
  for (let i = 0; i < 2; i++) {
    const x = -W / 2 + (W * (i + 0.15)) / 2 + hr(-1, 1, i, 1);
    c.wrap(x, 3, (xx) => kapok(c.b, M([xx, -0.3, hr(-3.5, -2.5, i, 2)], [0, i * 50, 0]), H * 1.5, { bark: P.barkNear, leaf: P.leafNear }, i + 70, { crown: false, r0: 0.8 + 0.2 * i }));
  }
  for (let i = 0; i < 4; i++) {
    const x = -W / 2 + (W * (i + 0.6)) / 4;
    c.wrap(x, 2, (xx) => bush(c.b, M([xx, -0.3, -2.8]), hr(1.4, 2, i, 12), P.leafNear, i + 300));
  }
  for (let i = 0; i < 16; i++) {
    const x = -W / 2 + (W * i) / 16 + hr(-0.5, 0.5, i, 3);
    const z = hr(-2, 0.5, i, 4);
    c.wrap(x, 1.8, (xx) => {
      const k = i % 4;
      if (k === 0) heliconia(c.b, M([xx, -0.2, z]), 2.2, P.leafNear[1], i);
      else if (k === 1) for (let j = 0; j < 4; j++) bigLeaf(c.b, M([xx, -0.2, z], [hr(-35, -10, i, j), j * 90 + i * 20, 0]), 1.6, 0.6, mix(P.leafNear[1], P.leafNear[2], j / 4).getHex(), i + j, { droop: 1.4 });
      else if (k === 2) mossRock(c.b, M([xx, -0.3, z]), [1, 0.7, 0.8], 0x7a7466, P.leafNear[1], i + 80);
      else { fern(c.b, M([xx, -0.2, z]), 1.6, P.leafNear[1], i + 90, 10); bromeliad(c.b, M([xx + 0.8, -0.1, z + 0.4]), 0.5, P.leafNear[2], 0xe83a50, i); }
    });
  }
  for (let i = 0; i < 16; i++) {
    const x = -W / 2 + (W * i) / 16;
    c.wrap(x, 0.6, (xx) => grassTuft(c.b, M([xx, -0.25, hr(-1, 1, i, 5)]), 0.7, [P.leafNear[1], P.leafNear[2], P.leafNear[0]], i + 100));
  }
  for (let i = 0; i < 5; i++) {
    const x = -W / 2 + (W * (i + 0.6)) / 5;
    c.wrap(x, 1, (xx) => hangingVine(c.b, M([xx, H + 1, hr(-2, 0, i, 6)]), hr(5, 10, i, 7), P.barkNear, P.leafNear[1], i + 7, 0.09));
  }
}

/** Camada 5 (frente do jogador): silhuetas escuras, majoritariamente transparente. */
export function mataFront(c: LayerCtx, P: MataPal) {
  const { W, H } = c;
  const fg = P.fg;
  const leaf = vmat('leaf', 0xffffff, { side: THREE.DoubleSide, rim: 0.6 });
  // moitas de folhas largas nas bases, espaçadas (deixam a ação visível)
  const spots: [number, number][] = [[-0.44, 1.3], [-0.12, 0.8], [0.18, 1.0], [0.4, 0.75]];
  spots.forEach(([fx, s], i) => {
    const x = fx * W;
    c.wrap(x, 3 * s, (xx) => {
      for (let j = 0; j < 7; j++) bigLeaf(c.b, M([xx + (j - 3) * 0.35 * s, -0.6, 1], [hr(-30, -5, i, j), (j - 3) * 25, (j - 3) * -9]), 2.4 * s, 0.9 * s, mix(fg, P.leafNear[0], 0.18 * (j % 3)).getHex(), i * 7 + j, { droop: 1.1, stem: 0.9 * s });
      fern(c.b, M([xx + 1.2 * s, -0.6, 1.5]), 2 * s, mix(fg, P.leafNear[0], 0.2).getHex(), i + 5, 9);
    });
  });
  // galho com folhas entrando pelo alto
  for (const fx of [-0.3, 0.27]) {
    c.wrap(fx * W, 4, (xx) => {
      for (let j = 0; j < 6; j++) bigLeaf(c.b, M([xx + (j - 2.5) * 0.5, H + 0.4, 1], [180 + hr(-30, 30, j, 21), j * 40, (j - 2.5) * 12]), 2.2, 0.8, mix(fg, P.leafNear[0], 0.15 * (j % 3)).getHex(), j + 31, { droop: 1.2, stem: 0.6 });
    });
  }
  // cipós pendurados e uma folha do alto
  for (let i = 0; i < 4; i++) {
    const x = -W / 2 + (W * (i + 0.2)) / 4 + hr(-0.6, 0.6, i, 3);
    c.wrap(x, 1, (xx) => hangingVine(c.b, M([xx, H + 1, 1]), hr(3, 6.5, i, 4), fg, mix(fg, P.leafNear[0], 0.25).getHex(), i + 3, 0.1));
  }
  void leaf;
}

export function mataSet(set: string, P: MataPal, preset: 'selva' | 'por-do-sol'): SceneDef[] {
  const sun = !!P.tarde;
  const L = P.tarde
    ? { hemi: { i: 0.7 }, key: { i: 2.4 }, rim: { i: 3.2 } }
    : { hemi: { i: 0.95 } };
  return [
    layerScene(set, 1, { preset, light: L, fog: { color: P.fog[0], near: 50, far: 120 }, pitch: -4, build: (c) => mataFar(c, P, { sun }) }),
    layerScene(set, 2, { preset, light: L, fog: { color: P.fog[1], near: 55, far: 95 }, build: (c) => mataMid(c, P) }),
    layerScene(set, 3, { preset, light: L, fog: { color: P.fog[2], near: 56, far: 90 }, build: (c) => mataNear3(c, P) }),
    layerScene(set, 4, { preset, light: L, fog: { color: P.fog[3], near: 58, far: 85 }, build: (c) => mataNear4(c, P) }),
    layerScene(set, 5, { preset, light: { ...L, hemi: { i: 0.35 }, key: { i: 0.6 } }, build: (c) => mataFront(c, P) }),
  ];
}

export const MATA_SCENES = [...mataSet('mata', PAL_DIA, 'selva'), ...mataSet('mata-tarde', PAL_TARDE, 'por-do-sol')];
void hash; void col;
export type { V3 };
