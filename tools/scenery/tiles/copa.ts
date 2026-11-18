/** Tileset COPA: casca da sumaúma gigante (sulcos verticais), musgo e epífitas no topo, galhos-plataforma. */
import * as THREE from 'three';
import { hash, hr, mix, smooth, vmat, pfbm, M } from '../lib/core';
import { placeM, leafGeo, tubeGeo, latheGeo } from '../lib/kit';
import { WATER_COLOR } from '../data';
import type { TileTheme, TileCtx } from './common';
import { grassTop, sprouts, hangingRoots, sideTufts, vineCol, ropeRow, logPlatform, waterFrame } from './deco';
import { bottomPoint, topPoint } from '../lib/terrain';
import { bromeliad } from '../lib/flora';

const BARK_A = 0xa89880, BARK_B = 0x6a5a48, MOSS_A = 0x6aa040, MOSS_B = 0x3a7028;

export const copaTheme: TileTheme = {
  id: 'copa',
  preset: 'selva',
  light: { hemi: { i: 1.05 } },
  body: {
    zf: 0.14, zb: -0.26, R: 0.13, amp: 0.02, seed: 61, base: 3, oct: 3, uv: 2,
    // sulcos verticais da casca (período 1 em x: 5 sulcos por tile) com leve sinuosidade periódica em y
    extra: (p) => {
      const u = p.x * 4 + 0.18 * Math.sin(p.y * Math.PI * 2 + p.x * Math.PI * 2) + 0.1 * pfbm(p.x, p.y, 0, 64, 2, 2);
      return -0.03 * (1 - smooth(0.05, 0.45, Math.abs(Math.sin(u * Math.PI)))) + 0.015 * pfbm(p.x, p.y, p.z, 66, 3, 2);
    },
    turf: { depth: 0.14, vary: 0.05, thick: 0.03, seed: 3 },
    color: (p, n, nz, tf, depth) => {
      const c = mix(BARK_B, BARK_A, smooth(-1, 0.8, nz)).lerp(new THREE.Color(0x8aa070), smooth(0.3, 0.9, pfbm(p.x, p.y, 0, 68, 2, 2)) * 0.35);
      if (depth < 0.4) c.multiplyScalar(0.75 + 0.25 * smooth(0.12, 0.4, depth));
      return c.lerp(mix(MOSS_B, MOSS_A, 0.5 + 0.5 * nz), tf);
    },
  },
  bodyMat: () => vmat('rubber', 0xffffff, { rough: 0.95, rim: 0.08 }),
  top(c) {
    grassTop(c, { n: 40, len: [0.04, 0.1], w: 0.04, colors: [MOSS_A, MOSS_B, 0x8ab84a], seed: 120 + c.mask, droop: 0.7 });
    sprouts(c, 2, 0x4a8a2a, [0xf0f0ff, 0xff90b0], 7 + c.mask);
    if (hash(c.mask, 90) > 0.6) {
      const tp = topPoint(c.sh, c.st, 0.3 + 0.4 * hash(c.mask, 91), 0.55);
      bromeliad(c.b, placeM(tp.pos, [0, 1, 0], 0, 1), 0.16, 0x5a9a3a, 0xe04a6a, c.mask);
    }
  },
  bottom(c) {
    hangingRoots(c, 3, 0x6a7a3a, [0.12, 0.3], 0.008, 9 + c.mask);
    const lm = vmat('leaf', 0xffffff, { side: THREE.DoubleSide });
    for (let i = 0; i < 4; i++) {
      const bp = bottomPoint(c.sh, c.st, (i + 0.4) / 4, 0.15);
      c.b.add(leafGeo(0.1, 0.05, { curl: -0.5, nu: 5, nv: 1 }), lm, placeM(bp.pos, [0.2 * (i - 1.5), -1, 0.3], 0), mix(MOSS_B, 0x2a4a1a, 0.4));
    }
  },
  side(c, s) { sideTufts(c, s, [MOSS_A, MOSS_B], 70 + c.mask, 3); },
  interior(c) {
    const m = vmat('bark', 0xffffff);
    if (c.variant === 'b') {
      // nó da casca (cicatriz de galho)
      c.b.add(latheGeo([[0.1, 0], [0.09, 0.03], [0.05, 0.05], [0.001, 0.04]], 16), m, placeM([0.05, -0.05, 0.16], [0, 0, 1], 0), mix(BARK_B, 0x000000, 0.2));
    } else if (c.variant === 'c') {
      // líquen e cogumelo-orelha
      for (let i = 0; i < 3; i++) c.b.add(latheGeo([[0.001, 0], [0.05 - i * 0.01, 0.005], [0.06 - i * 0.012, 0.012]], 12), vmat('plastic', 0xffffff, { rough: 0.7 }), placeM([-0.1 + i * 0.07, -0.15 + i * 0.05, 0.16], [0, 0.3, 1], 0).multiply(M([0, 0, 0], [0, 0, 0], [1, 1, 0.5])), 0xe8c88a);
    }
  },
  platform(c, part) {
    logPlatform(c, part, { r: 0.18, color: 0x8a7a64, moss: 0x5a9a34, seed: 8, cut: 0xd8b888 });
    const lm = vmat('leaf', 0xffffff, { side: THREE.DoubleSide });
    // folhagem saindo do galho
    const xs = part === 'm' ? [0.25] : part === 's' ? [-0.2, 0.25] : part === 'l' ? [-0.25] : [0.25];
    xs.forEach((x, j) => {
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2 + j;
        c.b.add(leafGeo(0.22, 0.1, { curl: 0.9, fold: 0.35, nu: 7, nv: 2 }), lm, placeM([x, 0.46, -0.05], new THREE.Vector3(Math.cos(a), 0.5, Math.sin(a) * 0.6 + 0.2), 0), mix(0x3a7a2a, 0x8ac050, k / 6));
      }
    });
  },
  spike(c) {
    // galho com espinhos lenhosos grandes (paineira tem casca espinhenta)
    const bm = vmat('bark', 0xffffff);
    c.b.add(tubeGeo([[-0.55, -0.4, 0], [0, -0.38, 0.02], [0.55, -0.4, 0]], 0.1, 20, 10), bm, undefined, BARK_A);
    for (let i = 0; i < 7; i++) {
      const x = -0.42 + i * 0.14;
      c.b.add(latheGeo([[0.05, 0], [0.03, 0.12], [0.001, 0.32]], 8), bm, placeM([x, -0.32, hr(-0.05, 0.05, i, 3)], [hr(-0.2, 0.2, i, 4), 1, 0.15], 0), mix(0x5a4a3a, 0xc8b088, 0.4));
    }
  },
  vine(c, part) { vineCol(c, part, { color: 0x6a8a3a, leaf: 0x5aa03a, leaves: 4, r: 0.045 }); },
  rope(c) { ropeRow(c, 0.3, { color: 0x6a8a3a, leaf: 0x5aa03a, leaves: 3, r: 0.042 }); },
  water: { color: WATER_COLOR.copa, build: (root, t, W) => waterFrame(root, t, W, { body: 0x6ab0a0, foam: 0xffffff, deep: 0x2a5a50 }) },
};
void hr; void ({} as TileCtx);
