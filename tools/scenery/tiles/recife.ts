/** Tileset RECIFE: calcário claro poroso, topo com corais, anêmonas e capim-marinho; prateleiras de coral; ouriços. */
import * as THREE from 'three';
import { hash, hr, mix, smooth, vmat, pfbm, M } from '../lib/core';
import { tubeGeo, rockGeo, placeM, leafGeo, bladeGeo, latheGeo, urchinParts } from '../lib/kit';
import { WATER_COLOR } from '../data';
import type { TileTheme, TileCtx } from './common';
import { grassTop, embeddedStones, sideTufts, vineCol, ropeRow, waterFrame } from './deco';
import { topPoint, bottomPoint } from '../lib/terrain';

const STONE_A = 0xe8b890, STONE_B = 0x8a5a4a, CORAL = [0xff7a5a, 0xf2a03a, 0xe0507a, 0xb070d0, 0xffd060];

/** Coral ramificado (galhos tubulares). */
export function branchCoral(c: TileCtx | { b: TileCtx['b'] }, T: THREE.Matrix4, s: number, col: number, seed = 0) {
  const m = vmat('coral', 0xffffff, { repeat: 3 });
  const rec = (p: THREE.Vector3, dir: THREE.Vector3, len: number, r: number, depth: number, k: number) => {
    const end = p.clone().addScaledVector(dir, len);
    const mid = p.clone().lerp(end, 0.5).add(new THREE.Vector3(0.1 * len * Math.sin(k + seed), 0, 0.1 * len * Math.cos(k)));
    c.b.add(tubeGeo([[p.x, p.y, p.z], [mid.x, mid.y, mid.z], [end.x, end.y, end.z]], (t) => r * (1 - t * 0.35), 8, 6), m, T, mix(col, 0xffffff, depth * 0.1));
    if (depth >= 2) { c.b.add(new THREE.SphereGeometry(r * 0.75, 8, 6), m, T.clone().multiply(M([end.x, end.y, end.z])), mix(col, 0xffffff, 0.35)); return; }
    for (const sgn of [-1, 1]) {
      const nd = dir.clone().applyAxisAngle(new THREE.Vector3(0.3 * sgn, 0, 1).normalize(), sgn * hr(0.35, 0.6, k, seed)).normalize();
      rec(end, nd, len * 0.72, r * 0.72, depth + 1, k * 2 + (sgn > 0 ? 1 : 0));
    }
  };
  rec(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, 0), s * 0.4, s * 0.07, 0, 1);
}

export const recifeTheme: TileTheme = {
  id: 'recife',
  preset: 'recife',
  light: { hemi: { i: 0.75 }, key: { color: 0xfff0dc, i: 2.3 }, fres: { color: 0x80e0ff, strength: 0.8 } },
  body: {
    zf: 0.14, zb: -0.26, R: 0.13, amp: 0.045, seed: 21, base: 3, oct: 4, uv: 2,
    // poros arredondados (cavidades)
    extra: (p) => -0.035 * smooth(0.35, 0.75, pfbm(p.x, p.y, p.z, 31, 5, 2)),
    turf: { depth: 0.1, vary: 0.04, thick: 0.025, seed: 9 },
    color: (p, n, nz, tf, depth) => {
      const st = mix(STONE_B, STONE_A, smooth(-0.5, 0.6, nz)).lerp(new THREE.Color(0xc06a6a), smooth(0.2, 0.8, pfbm(p.x, p.y, 0, 5, 2, 2)) * 0.35);
      st.multiplyScalar(0.7 + 0.4 * smooth(-0.6, 0.4, nz));
      if (depth < 0.35) st.multiplyScalar(0.8 + 0.2 * smooth(0.08, 0.35, depth));
      const turf = mix(0x3a8a4a, 0xe0603a, 0.5 + 0.5 * pfbm(p.x, p.y, p.z, 9, 3, 2));
      return st.lerp(turf, tf);
    },
  },
  bodyMat: () => vmat('rubber', 0xffffff, { rough: 0.85, rim: 0.2 }),
  top(c) {
    grassTop(c, { n: 26, len: [0.08, 0.2], w: 0.03, colors: [0x4a9a6a, 0x6aba7a, 0x3a7a5a], seed: 60 + c.mask, droop: 0.2, lip: 6 });
    // corais variados sobre o topo
    for (let i = 0; i < 4; i++) {
      const tp = topPoint(c.sh, c.st, (i + 0.15 + 0.6 * hash(i, c.mask + 1)) / 4, 0.2 + 0.6 * hash(i, c.mask + 2));
      const colr = CORAL[(i + c.mask) % CORAL.length];
      const k = (i + c.mask) % 3;
      if (k === 0) branchCoral(c, placeM(tp.pos, [0, 1, 0], i * 50), hr(0.3, 0.42, i, c.mask), colr, i + c.mask);
      else if (k === 1) {
        // coral-cérebro (domo com sulcos)
        const g = latheGeo([[0.001, 0.09], [0.07, 0.08], [0.105, 0.045], [0.11, 0]], 18, (p) => { p.y += 0.006 * Math.sin(Math.atan2(p.z, p.x) * 9 + p.y * 60); });
        c.b.add(g, vmat('coral', 0xffffff, { repeat: 4 }), placeM(tp.pos, [0, 1, 0], i * 30), colr);
      } else {
        // anêmona: base e tentáculos
        const am = vmat('plastic', 0xffffff, { rough: 0.4 });
        c.b.add(latheGeo([[0.04, 0], [0.035, 0.04], [0.045, 0.05]], 12), am, placeM(tp.pos, [0, 1, 0]), mix(colr, 0x000000, 0.2));
        for (let k2 = 0; k2 < 12; k2++) {
          const a = (k2 / 12) * Math.PI * 2;
          c.b.add(tubeGeo([[0, 0, 0], [0.02, 0.04, 0], [0.035, 0.07, 0.01]], (t) => 0.008 * (1 - t * 0.6), 6, 4), am, placeM(tp.pos.clone().add(new THREE.Vector3(Math.cos(a) * 0.03, 0.045, Math.sin(a) * 0.03)), [Math.cos(a), 1.2, Math.sin(a)], -(a * 180) / Math.PI), mix(colr, 0xffffff, 0.3));
        }
      }
    }
    if (hash(c.mask, 31) > 0.5) {
      const tp = topPoint(c.sh, c.st, 0.5 + 0.3 * hash(c.mask, 32), 0.5);
      // estrela-do-mar
      const s = new THREE.Shape();
      for (let k = 0; k <= 10; k++) { const a = (k / 10) * Math.PI * 2 + Math.PI / 2; const r = k % 2 ? 0.022 : 0.06; if (k === 0) s.moveTo(Math.cos(a) * r, Math.sin(a) * r); else s.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
      const g = new THREE.ExtrudeGeometry(s, { depth: 0.01, bevelEnabled: true, bevelSize: 0.006, bevelThickness: 0.008, bevelSegments: 2 });
      c.b.add(g, vmat('coral', 0xffffff, { repeat: 6 }), placeM(tp.pos.clone().add(new THREE.Vector3(0, 0.01, 0)), [0, 0, 1], 0).multiply(M([0, 0, 0], [-90, 0, 0])), 0xff8a3a);
    }
  },
  bottom(c) {
    const lm = vmat('leaf', 0xffffff, { side: THREE.DoubleSide });
    for (let i = 0; i < 6; i++) {
      const bp = bottomPoint(c.sh, c.st, (i + 0.3 + 0.4 * hash(i, c.mask)) / 6, 0.2);
      c.b.add(leafGeo(hr(0.08, 0.18, i, c.mask + 2), 0.04, { curl: -0.6, nu: 6, nv: 1, notch: 0.3 }), lm, placeM(bp.pos, [hr(-0.3, 0.3, i, 3), -1, 0.2], 0), mix(0x3a7a4a, 0x6a8a3a, hash(i, 4)));
    }
  },
  side(c, s) { sideTufts(c, s, [0x4a9a6a, 0x6aba7a], 50 + c.mask, 3); },
  interior(c) {
    if (c.variant === 'a') embeddedStones(c, 1, 0xf0e0c8, [0.05, 0.07], 140 + c.mask);
    else if (c.variant === 'b') {
      // conchas fósseis embutidas
      for (let i = 0; i < 2; i++) {
        const g = latheGeo([[0.001, 0], [0.05, 0.005], [0.03, 0.03], [0.001, 0.035]], 14, (p) => { p.y += 0.004 * Math.sin(Math.atan2(p.z, p.x) * 12); });
        c.b.add(g, vmat('shell', 0xffffff), placeM([-0.15 + i * 0.3, -0.1 + i * 0.15, 0.16], [0, 0.3, 1], 20 * i), 0xf4e4d0);
      }
    } else embeddedStones(c, 3, 0xb8a888, [0.03, 0.05], 170);
  },
  platform(c, part) { coralShelf(c, part); },
  spike(c) {
    const um = vmat('plastic', 0xffffff, { rough: 0.35 });
    [[-0.3, 0.16], [0.02, 0.2], [0.3, 0.14]].forEach(([x, r], i) => {
      for (const p of urchinParts(r, 46)) c.b.add(p.g, um, M([x, -0.5 + r * 0.6, hr(-0.05, 0.05, i, 3)]).multiply(p.m), i % 2 ? 0x3a1a4a : 0x2a1a3a);
    });
    c.b.add(rockGeo([0.52, 0.08, 0.22], 3, 2, { flat: 0.1 }), vmat('sand', 0xffffff), M([0, -0.5, 0]), 0xd8c8a0);
  },
  vine(c, part) {
    vineCol(c, part, { color: 0x5a6a2a, leaf: 0x4a8a3a, leaves: 5, r: 0.04, leafShape: (t) => Math.sin(Math.PI * t) ** 0.4 * 0.6 });
    // vesículas de flutuação da alga
    for (let i = 0; i < 3; i++) c.b.add(new THREE.SphereGeometry(0.03, 10, 8), vmat('plastic', 0xffffff, { rough: 0.3 }), M([i % 2 ? 0.07 : -0.07, -0.3 + i * 0.3, 0.04]), 0x9aa040);
  },
  rope(c) { ropeRow(c, 0.3, { color: 0xc0a070, leaf: 0x3a8a5a, matKind: 'cloth', r: 0.04, leaves: 2 }); },
  water: { color: WATER_COLOR.recife, build: (root, t, W) => waterFrame(root, t, W, { body: 0x3aa8c8, foam: 0xf0ffff, deep: 0x1a5a8a }) },
};

/** Prateleira de coral-mesa: placa ondulada com borda clara, apoiada num pedúnculo. */
function coralShelf(c: TileCtx, part: 's' | 'l' | 'm' | 'r') {
  const m = vmat('coral', 0xffffff, { repeat: 3 });
  const x0 = part === 'l' || part === 's' ? -0.45 : -0.5, x1 = part === 'r' || part === 's' ? 0.45 : 0.5;
  const nx = 30, nz = 8;
  const pos: number[] = [], col: number[] = [], idx: number[] = [];
  const top = (x: number, z: number) => 0.5 - 0.01 + 0.012 * Math.sin((x + 0.5) * Math.PI * 4 + z * 8);
  const edgeK = (x: number) => Math.min(1, (x - x0) / 0.12, (x1 - x) / 0.12);
  for (const side of [1, -1]) {
    const base = pos.length / 3;
    for (let j = 0; j <= nz; j++) for (let i = 0; i <= nx; i++) {
      const x = x0 + (x1 - x0) * (i / nx);
      const ek = x0 > -0.5 || x1 < 0.5 ? Math.max(0, edgeK(x)) : 1;
      const z = 0.14 - 0.4 * (j / nz);
      const y = top(x, z) - (side < 0 ? 0.06 + 0.03 * Math.sin(x * 9) : 0) - (1 - Math.sqrt(Math.max(0, ek))) * 0.05;
      pos.push(x, y, z);
      const cc = mix(0x7a1e2a, 0xc04a3a, (side > 0 ? 0.7 : 0.1) + 0.2 * Math.sin(x * 20 + z * 10));
      col.push(cc.r, cc.g, cc.b);
    }
    for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
      const a = base + j * (nx + 1) + i, b = a + 1, cc = a + nx + 1, d = cc + 1;
      if (side > 0) idx.push(a, b, d, a, d, cc); else idx.push(a, d, b, a, cc, d);
    }
  }
  // borda frontal
  const base = pos.length / 3;
  for (let i = 0; i <= nx; i++) {
    const x = x0 + (x1 - x0) * (i / nx);
    pos.push(x, top(x, 0.14), 0.14, x, top(x, 0.14) - 0.06 - 0.03 * Math.sin(x * 9), 0.14);
    const cc = mix(0xffa070, 0xa03a3a, 0.4);
    col.push(cc.r, cc.g, cc.b, cc.r * 0.7, cc.g * 0.7, cc.b * 0.7);
  }
  for (let i = 0; i < nx; i++) { const a = base + i * 2; idx.push(a, a + 1, a + 3, a, a + 3, a + 2); }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  c.b.add(g, m);
  // pólipos na superfície
  for (let i = 0; i < 10; i++) {
    const x = x0 + 0.05 + (x1 - x0 - 0.1) * ((i + hash(i, 4)) / 10);
    c.b.add(new THREE.SphereGeometry(0.014, 6, 4), m, M([x, top(x, 0) + 0.004, hr(-0.2, 0.1, i, 5)]), 0xffe060);
  }
  // cracas e caramujos na borda
  for (let i = 0; i < 8; i++) {
    const x = x0 + 0.06 + (x1 - x0 - 0.12) * ((i + hash(i, 15)) / 8);
    c.b.add(latheGeo([[0.02, 0], [0.016, 0.018], [0.006, 0.022]], 7), vmat('shell', 0xffffff), M([x, top(x, 0.14) - 0.03 - 0.02 * hash(i, 16), 0.15], [90, 0, 0]), mix(0xe8e0d0, 0x9a8a7a, hash(i, 17)));
  }
  // pedúnculo e algas
  const xs = part === 'm' ? [0.1] : part === 's' ? [0] : part === 'l' ? [0.2] : [-0.2];
  for (const x of xs) c.b.add(latheGeo([[0.05, -0.1], [0.04, 0.2], [0.07, 0.42]], 10), m, M([x, 0, -0.08]), 0x8a3a3a);
  const lm = vmat('leaf', 0xffffff, { side: THREE.DoubleSide });
  for (let i = 0; i < 7; i++) c.b.add(bladeGeo(hr(0.1, 0.24, i, 7), 0.03, -0.3, 0.3, 4), lm, placeM([x0 + 0.08 + i * (x1 - x0 - 0.16) / 6, 0.44, 0.12], [0, -1, 0.1], i * 70), mix(0x4a8a4a, 0x8a9a3a, hash(i, 8)));
}
