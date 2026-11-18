/** Tileset MATA: terra vermelha-escura com estratos, pedras embutidas, grama farta no topo. */
import * as THREE from 'three';
import { hash, hr, mix, smooth, vmat, pfbm, pnoise1, type V3 } from '../lib/core';
import { tubeGeo, rockGeo, placeM, leafGeo, bladeGeo } from '../lib/kit';
import { WATER_COLOR } from '../data';
import type { TileTheme, TileCtx } from './common';
import { belt } from './fabrica';
import { grassTop, sprouts, hangingRoots, embeddedStones, faceRoot, sideTufts, vineCol, ropeRow, logPlatform, waterFrame } from './deco';

const SOIL_A = 0x7a4a2a, SOIL_B = 0x5a3420, SOIL_C = 0x94603a, TURF_A = 0x4f8f2a, TURF_B = 0x2f6a1e;
const GRASS = [0x5aa02e, 0x78b83a, 0x3f8a26, 0x8cc84a, 0x2f7020];

export const mataTheme: TileTheme = {
  id: 'mata',
  preset: 'selva',
  light: { hemi: { i: 1.0 } },
  body: {
    zf: 0.14, zb: -0.26, R: 0.12, amp: 0.05, seed: 0, hard: 0.35, uv: 2,
    extra: (p) => -0.035 * (1 - smooth(0, 0.2, Math.abs(pfbm(p.x, p.y, p.z, 7, 2, 3)))),
    turf: { depth: 0.13, vary: 0.05, thick: 0.03, seed: 1 },
    color: (p, n, nz, tf, depth) => {
      // estratos ondulados (período 1 em y), cavidades mais escuras
      const strata = 0.5 + 0.5 * Math.sin((p.y * 3 + 0.15 * pnoise1(p.x, 2)) * Math.PI * 2);
      const soil = mix(SOIL_B, SOIL_A, strata).lerp(new THREE.Color(SOIL_C), smooth(0.1, 0.35, nz) * 0.5);
      soil.multiplyScalar(0.72 + 0.5 * smooth(-0.4, 0.4, nz));
      // terra mais escura logo abaixo da grama (sombra da turfa)
      if (depth < 0.4) soil.multiplyScalar(0.7 + 0.3 * smooth(0.12, 0.35, depth));
      const turf = mix(TURF_B, TURF_A, 0.5 + 0.5 * nz + 0.3 * n.y);
      return soil.lerp(turf, tf);
    },
  },
  bodyMat: () => vmat('rubber', 0xffffff, { rough: 0.92, rim: 0.12 }),
  top(c) {
    grassTop(c, { n: 70, len: [0.07, 0.17], w: 0.03, colors: GRASS, seed: 1 + c.mask, droop: 0.55 });
    sprouts(c, 2, 0x3f8a2a, c.mask % 3 === 0 ? [0xfff4d0] : [0xffc83a, 0xe0508a], 3 + c.mask);
    // pedrinha ocasional no topo
    if (hash(c.mask, 9) > 0.5) {
      const u = 0.2 + 0.6 * hash(c.mask, 10);
      const m = vmat('rock', 0xffffff);
      const g = rockGeo([0.05, 0.035, 0.05], c.mask, 1, { flat: 0.4 });
      const tp = { x: -0.5 + u };
      c.b.add(g, m, placeM([tp.x, c.sh.kind === 'box' ? 0.52 : c.sh.kind === 'slope-r' ? tp.x + 0.02 : -tp.x + 0.02, -0.1], [0, 1, 0], 40), 0x8a8274);
    }
  },
  bottom(c) {
    hangingRoots(c, 3, 0x5a3a22, [0.08, 0.2], 0.02, 5 + c.mask);
    // tufos de musgo pendurados
    const lm = vmat('leaf', 0xffffff, { side: THREE.DoubleSide });
    for (let i = 0; i < 5; i++) {
      const x = -0.42 + 0.84 * ((i + hash(i, c.mask)) / 5);
      for (let k = 0; k < 3; k++) {
        c.b.add(leafGeo(hr(0.06, 0.11, i, k + c.mask), 0.05, { curl: -0.4, fold: 0.3, nu: 4, nv: 2 }), lm,
          placeM([x + 0.02 * k, -0.5, 0.06 + 0.03 * k], [0.3 * (k - 1), -1, 0.35], 0), mix(TURF_B, 0x2a5a1a, k / 3));
      }
    }
  },
  side(c, s) { sideTufts(c, s, [TURF_A, TURF_B, 0x6a9a3a], 20 + c.mask + (s > 0 ? 3 : 0), 3); },
  interior(c) {
    if (c.variant === 'a') {
      embeddedStones(c, 2, 0x9a8a78, [0.05, 0.09], 30 + c.mask * 3);
    } else if (c.variant === 'b') {
      embeddedStones(c, 2, 0xa09080, [0.07, 0.1], 71);
      faceRoot(c, 0x4a2e1a, -0.12, 2, 0.032);
    } else {
      embeddedStones(c, 1, 0x8a8070, [0.13, 0.15], 113);
      embeddedStones(c, 3, 0xb0a08a, [0.025, 0.04], 117);
    }
  },
  platform(c, part) {
    logPlatform(c, part, { r: 0.17, color: 0x6a4a30, moss: 0x5a8a2a, seed: 4 });
    // folhas e brotos sobre o galho
    const lm = vmat('leaf', 0xffffff, { side: THREE.DoubleSide });
    const n = part === 's' ? 2 : 1;
    for (let i = 0; i < n; i++) {
      const x = part === 'l' ? -0.32 : part === 'r' ? 0.3 : part === 's' ? -0.25 + 0.5 * i : 0.18;
      for (let k = 0; k < 4; k++) {
        const g = leafGeo(0.2, 0.09, { curl: 0.8, fold: 0.4, nu: 7, nv: 2 });
        c.b.add(g, lm, placeM([x, 0.47, 0.0], new THREE.Vector3(Math.cos(k * 1.7 + x * 9), 0.7, Math.sin(k * 1.7 + x * 9) * 0.6 + 0.3), 0), mix(0x4a8a2a, 0x8ac04a, k / 4));
      }
    }
    if (part === 'm') grassStrip(c, 0.5);
    if (part === 's') {
      // galhinho quebrado
      c.b.add(tubeGeo([[0.1, 0.42, 0.08], [0.18, 0.52, 0.12], [0.24, 0.58, 0.12]], (t) => 0.02 * (1 - t * 0.7), 10, 5), vmat('bark', 0xffffff), undefined, 0x5a3a24);
    }
  },
  spike(c) { bramble(c, 0x4a2430, 0xd84a3a, 0x2f5a20); },
  vine(c, part) { vineCol(c, part, { color: 0x5a7a2a, leaf: 0x4a9a2e, leaves: 4, r: 0.048 }); },
  rope(c) { ropeRow(c, 0.3, { color: 0x6a8a32, leaf: 0x4a9a2e, leaves: 2, r: 0.042 }); },
  // esteira da serraria clandestina (1-3): a mesma máquina dos Javardos, instalada na mata
  extra: { belt: (c) => belt(c) },
  water: { color: WATER_COLOR.mata, build: (root, t, W) => waterFrame(root, t, W, { body: 0x4a8a6a, foam: 0xe8f4d8, deep: 0x23463a }) },
};

/** Musgo/capim fino na linha do topo de uma plataforma de galho. */
function grassStrip(c: TileCtx, y: number) {
  const lm = vmat('leaf', 0xffffff, { side: THREE.DoubleSide });
  for (let i = 0; i < 18; i++) {
    const x = -0.5 + (i + hash(i, 2)) / 18;
    c.b.add(bladeGeo(hr(0.04, 0.08, i, 3), 0.02, 0.5, 0.3, 3), lm, placeM([x, y - 0.015, -0.06 + 0.12 * hash(i, 4)], [hr(-0.3, 0.3, i, 5), 1, 0.2], hr(0, 360, i, 6)), GRASS[i % GRASS.length]);
  }
}

/** Espinheiro: moita de ramos retorcidos com espinhos. */
export function bramble(c: TileCtx, stem: number, tip: number, leaf: number) {
  const sm = vmat('bark', 0xffffff, { repeat: 1 });
  const tm = vmat('shell', 0xffffff, { rough: 0.4 });
  const lm = vmat('leaf', 0xffffff, { side: THREE.DoubleSide });
  const N = 9;
  for (let i = 0; i < N; i++) {
    const x0 = -0.42 + 0.84 * (i / (N - 1));
    const h = hr(0.35, 0.62, i, 1);
    const lean = hr(-0.25, 0.25, i, 2);
    const pts: V3[] = [];
    for (let k = 0; k <= 5; k++) {
      const t = k / 5;
      pts.push([x0 + lean * t + 0.05 * Math.sin(t * 7 + i), -0.5 + h * Math.sin(t * Math.PI * 0.5), -0.1 + 0.2 * hash(i, 3) + 0.05 * Math.sin(t * 5 + i)]);
    }
    c.b.add(tubeGeo(pts, (t) => 0.036 * (1 - t * 0.6), 20, 7), sm, undefined, mix(stem, 0x000000, 0.2 * hash(i, 4)));
    // espinhos ao longo do ramo
    const curve = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)));
    for (let k = 1; k < 7; k++) {
      const t = k / 7;
      const p = curve.getPointAt(t);
      const tan = curve.getTangentAt(t);
      const side = new THREE.Vector3(k % 2 ? 1 : -1, 0.4, (k % 3) - 1).cross(tan).normalize().add(tan.clone().multiplyScalar(0.4));
      const L = 0.085 * (1 - t * 0.3);
      const g = tubeGeo([[0, 0, 0], [0, L * 0.6, 0], [0, L, 0]], (u) => 0.018 * (1 - u) + 0.001, 4, 6);
      c.b.add(g, tm, placeM(p, side, 0), mix(stem, tip, 0.4 + 0.6 * t));
    }
    // folhinhas
    {
      const p = curve.getPointAt(0.4 + 0.3 * hash(i, 9));
      c.b.add(leafGeo(0.13, 0.07, { curl: 0.5, fold: 0.3, nu: 5, nv: 2 }), lm, placeM(p, [hr(-1, 1, i, 7), 0.6, 0.5], 0), leaf);
    }
  }
  // frutinhas vermelhas
  for (let i = 0; i < 5; i++) {
    c.b.add(new THREE.SphereGeometry(0.022, 10, 8), vmat('plastic', 0xffffff, { rough: 0.3 }), placeM([-0.35 + 0.17 * i, -0.18 + 0.12 * hash(i, 8), 0.1], [0, 1, 0]), 0x8a1a3a);
  }
  // base de terra
  const base = rockGeo([0.5, 0.08, 0.2], 3, 2, { rough: 0.1, flat: 0.1 });
  c.b.add(base, vmat('earth', 0xffffff), placeM([0, -0.5, 0], [0, 1, 0]), 0x5a3a22);
}
