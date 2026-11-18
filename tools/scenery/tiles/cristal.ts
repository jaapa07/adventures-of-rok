/** Tileset CRISTAL (câmara bônus): rocha violeta escura com veios, drusas de cristal no topo e cristais pendentes. */
import * as THREE from 'three';
import { hash, hr, mix, smooth, vmat, pfbm, M } from '../lib/core';
import { placeM, crystalGeo, rockGeo, leafGeo } from '../lib/kit';
import { WATER_COLOR } from '../data';
import type { TileTheme, TileCtx } from './common';
import { grassTop, vineCol, ropeRow, waterFrame } from './deco';
import { topPoint, bottomPoint, frontPoint } from '../lib/terrain';

const ROCK_A = 0x4a2a6a, ROCK_B = 0x2a1640, VEIN = 0xc070ff;
const CRYS = [0xb050ff, 0x7a30e0, 0xe050c0, 0x5080ff];

export function crystalMat(col = 0xd890ff, intensity = 0.3) {
  return vmat('crystal', 0xffffff, { emissive: col, emissiveIntensity: intensity, opacity: 0.92, flat: true });
}

/** Drusa: cacho de cristais inclinados saindo de um ponto. */
export function druse(c: { b: TileCtx['b'] }, T: THREE.Matrix4, s: number, seed: number, cols = CRYS) {
  const n = 5;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * 360 + seed * 40;
    const tilt = i === 0 ? 0 : hr(18, 40, i, seed);
    const h = s * (i === 0 ? 1 : hr(0.45, 0.8, i, seed + 1));
    const col = cols[(i + seed) % cols.length];
    c.b.add(crystalGeo(h * 0.2, h), crystalMat(col), T.clone().multiply(M([0, 0, 0], [0, a, tilt])), mix(col, 0xffffff, 0.15));
  }
}

export const cristalTheme: TileTheme = {
  id: 'cristal',
  preset: 'bonus',
  light: { hemi: { i: 0.9 } },
  body: {
    zf: 0.14, zb: -0.26, R: 0.09, amp: 0.05, seed: 51, hard: 0.7, base: 2, oct: 4, uv: 2,
    extra: (p) => -0.03 * (1 - smooth(0, 0.12, Math.abs(pfbm(p.x, p.y, p.z, 57, 2, 2)))),
    turf: { depth: 0.07, vary: 0.03, thick: 0.018, seed: 2 },
    color: (p, n, nz, tf, depth) => {
      const vein = 1 - smooth(0, 0.06, Math.abs(pfbm(p.x, p.y, 0, 59, 3, 2)));
      const c = mix(ROCK_B, ROCK_A, smooth(-0.6, 0.6, nz)).lerp(new THREE.Color(VEIN), vein * 0.45);
      if (depth < 0.3) c.multiplyScalar(0.8 + 0.2 * smooth(0.05, 0.3, depth));
      return c.lerp(mix(0x7a50b0, 0xb890e0, 0.5 + 0.5 * nz), tf);
    },
  },
  bodyMat: () => vmat('rubber', 0xffffff, { rough: 0.55, rim: 0.4 }),
  top(c) {
    for (let i = 0; i < 3; i++) {
      const tp = topPoint(c.sh, c.st, (i + 0.15 + 0.7 * hash(i, c.mask + 2)) / 3, 0.25 + 0.5 * hash(i, c.mask + 3));
      druse(c, placeM(tp.pos.clone().addScaledVector(tp.n, -0.01), tp.n, i * 33, 1), hr(0.16, 0.3, i, c.mask), i + c.mask);
    }
    grassTop(c, { n: 12, len: [0.03, 0.06], w: 0.02, colors: [0xe0c0ff, 0xb090e0], seed: 100 + c.mask, lip: 4, droop: 0.2, mat: crystalMat(0xc090ff, 0.4) });
  },
  bottom(c) {
    for (let i = 0; i < 3; i++) {
      const bp = bottomPoint(c.sh, c.st, (i + 0.25 + 0.5 * hash(i, c.mask + 4)) / 3, 0.2);
      const h = hr(0.08, 0.18, i, c.mask + 5);
      c.b.add(crystalGeo(h * 0.22, h * 1.5), crystalMat(CRYS[i % 4]), placeM(bp.pos.clone().add(new THREE.Vector3(0, 0.02, 0)), [hr(-0.3, 0.3, i, 6), -1, 0], 0), CRYS[i % 4]);
    }
  },
  interior(c) {
    const n = c.variant === 'a' ? 1 : c.variant === 'b' ? 2 : 3;
    for (let i = 0; i < n; i++) {
      const x = hr(-0.25, 0.25, i, 70 + c.mask + n), y = hr(-0.3, 0.2, i, 71 + c.mask + n);
      const fp = frontPoint(c.sh, c.st, x, y);
      if (fp.tf > 0.1) continue;
      c.b.add(crystalGeo(0.04, 0.12), crystalMat(CRYS[(i + n) % 4], 0.6), placeM(fp.pos.clone().addScaledVector(fp.n, -0.03), fp.n.clone().add(new THREE.Vector3(hr(-0.5, 0.5, i, 3), 0.3, 0)), 0), CRYS[(i + n) % 4]);
    }
  },
  platform(c, part) {
    const m = crystalMat(0x7030c0, 0.3);
    const x0 = part === 'l' || part === 's' ? -0.44 : -0.5, x1 = part === 'r' || part === 's' ? 0.44 : 0.5;
    // laje facetada (prisma) com ponta de cristal por baixo
    const s = new THREE.Shape();
    s.moveTo(x0, 0.5); s.lineTo(x1, 0.5); s.lineTo(x1 - (part === 'r' || part === 's' ? 0.08 : 0), 0.4); s.lineTo(x0 + (part === 'l' || part === 's' ? 0.08 : 0), 0.4); s.lineTo(x0, 0.5);
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.36, bevelEnabled: true, bevelSize: 0.012, bevelThickness: 0.02, bevelSegments: 1 });
    g.translate(0, -0.012, -0.22);
    c.b.add(g.toNonIndexed(), m, undefined, 0x8a50d0);
    const xs = part === 'm' ? [-0.25, 0.25] : part === 's' ? [0] : part === 'l' ? [0] : [0];
    xs.forEach((x, i) => c.b.add(crystalGeo(0.07, 0.3), m, placeM([x, 0.42, -0.04], [0, -1, 0], i * 30), 0xc8a0ff));
    // drusinhas sobre a laje (sem atrapalhar a pisada: baixas e no fundo)
    for (let i = 0; i < 5; i++) {
      const x = -0.5 + (i + 0.5) / 5;
      if (x < x0 + 0.05 || x > x1 - 0.05) continue;
      druse(c, placeM([x, 0.49, -0.2], [0, 1, -0.3], i * 30), 0.1, i + 3);
    }
    // estalactites de cristal sob a laje e facetas claras na borda
    for (let i = 0; i < 7; i++) {
      const x = -0.5 + (i + 0.5) / 7;
      if (x < x0 + 0.06 || x > x1 - 0.06) continue;
      c.b.add(crystalGeo(0.025, hr(0.08, 0.18, i, 12)), crystalMat(CRYS[i % 4], 0.5), placeM([x, 0.4, 0.05 - 0.15 * hash(i, 13)], [hr(-0.3, 0.3, i, 14), -1, 0], 0), CRYS[i % 4]);
      c.b.add(new THREE.BoxGeometry(0.05, 0.012, 0.03), crystalMat(0xffd0ff, 0.9), M([x + 0.04, 0.47, 0.15], [0, 0, 20 * (i % 3 - 1)]), 0xffffff);
    }
    // brilho de veio na face
    for (let i = 0; i < 6; i++) {
      const x = -0.5 + (i + 0.5) / 6;
      if (x < x0 || x > x1) continue;
      c.b.add(crystalGeo(0.02, 0.07), crystalMat(0xff90e0, 0.9), placeM([x, 0.5, 0.0], [hr(-0.4, 0.4, i, 9), 1, 0], 0), 0xffffff);
    }
  },
  spike(c) {
    const xs = [-0.34, -0.17, 0, 0.17, 0.34];
    xs.forEach((x, i) => c.b.add(crystalGeo(0.07, [0.4, 0.6, 0.72, 0.55, 0.42][i]), crystalMat(i % 2 ? 0xff70c0 : 0xd070ff, 0.7), M([x, -0.5, 0], [0, i * 25, hr(-12, 12, i, 3)]), i % 2 ? 0xe060c0 : 0xa050f0));
    c.b.add(rockGeo([0.5, 0.08, 0.2], 6, 2, { flat: 0.1 }), vmat('rock', 0xffffff), M([0, -0.5, 0]), ROCK_B);
  },
  vine(c, part) { vineCol(c, part, { color: 0x9a60e0, leaf: 0xd0a0ff, matKind: 'glow', emissive: 0x7030c0, r: 0.04 }); },
  rope(c) {
    ropeRow(c, 0.3, { color: 0x9a60e0, leaf: 0xd0a0ff, matKind: 'glow', emissive: 0x7030c0, r: 0.038, leaves: 3 });
    for (let i = 0; i < 4; i++) c.b.add(crystalGeo(0.02, 0.07), crystalMat(CRYS[i], 0.8), placeM([-0.375 + i * 0.25, 0.27, 0.03], [0, -1, 0.3], i * 40), CRYS[i]);
  },
  water: { color: WATER_COLOR.cristal, build: (root, t, W) => waterFrame(root, t, W, { body: 0x8a5ad0, foam: 0xf8e0ff, deep: 0x3a1a6a }) },
};
void leafGeo;
