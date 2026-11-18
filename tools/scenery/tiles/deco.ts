/**
 * Enfeites reutilizáveis dos tiles (grama, franja, raízes pendentes, pedras embutidas, cipós,
 * cordas, troncos-plataforma, água), sempre periódicos em x quando o tile se repete.
 */
import * as THREE from 'three';
import { hash, hr, mix, pnoise, pnoise1, TAU, vmat, M, type V3 } from '../lib/core';
import { bladeGeo, leafGeo, tubeGeo, rockGeo, placeM, scatter, latheGeo } from '../lib/kit';
import { topPoint, frontPoint, bottomPoint, sidePoint } from '../lib/terrain';
import type { TileCtx } from './common';

const DS = THREE.DoubleSide;

export interface GrassOpts {
  n: number;
  len: [number, number];
  w: number;
  colors: number[];
  lip?: number;
  seed?: number;
  bend?: number;
  /** fração dos fios na beira da frente que tombam por cima da borda */
  droop?: number;
  mat?: THREE.Material;
}

/** Tufos de grama no topo exposto (e na beira, tombando por cima da borda). */
export function grassTop(c: TileCtx, o: GrassOpts) {
  const m = o.mat ?? vmat('leaf', 0xffffff, { side: DS, rim: 0.35 });
  const seed = o.seed ?? 1;
  const pts = scatter(o.n, seed);
  pts.forEach(([u, w, r], i) => {
    const tp = topPoint(c.sh, c.st, u, 0.08 + w * 0.86);
    const len = o.len[0] + (o.len[1] - o.len[0]) * r;
    const g = bladeGeo(len, o.w * (0.7 + 0.6 * hash(i, seed + 4)), (o.bend ?? 0.35) * (0.5 + hash(i, seed + 2)), 0.6, 4);
    const up = tp.n.clone().multiplyScalar(0.55).add(new THREE.Vector3(0, 0.6, 0.1));
    const col = mix(o.colors[i % o.colors.length], o.colors[(i * 7 + 3) % o.colors.length], hash(i, seed + 5));
    col.multiplyScalar(0.75 + 0.45 * w);
    c.b.add(g, m, placeM(tp.pos.clone().addScaledVector(tp.n, -0.01), up, hr(0, 360, i, seed + 3)), col);
  });
  // beira frontal: fios mais compridos tombando para a frente
  const lip = o.lip ?? Math.round(o.n * 0.35);
  for (let i = 0; i < lip; i++) {
    const u = (i + hash(i, seed + 11) * 0.8) / lip;
    const tp = topPoint(c.sh, c.st, u, 0.02 + hash(i, seed + 12) * 0.08);
    const len = o.len[1] * (0.8 + 0.5 * hash(i, seed + 13));
    const dro = hash(i, seed + 14) < (o.droop ?? 0.5);
    const g = bladeGeo(len, o.w * 1.1, dro ? 0.9 : 0.4, 0.4, 5);
    const up = dro ? new THREE.Vector3(hr(-0.3, 0.3, i, seed + 15), 0.35, 1) : new THREE.Vector3(hr(-0.4, 0.4, i, seed + 15), 1, 0.45);
    const spin = dro ? -90 + hr(-25, 25, i, seed + 16) : hr(0, 360, i, seed + 16);
    const col = mix(o.colors[(i + 1) % o.colors.length], o.colors[(i * 3) % o.colors.length], 0.5);
    c.b.add(g, m, placeM(tp.pos, up, spin), col);
  }
}

/** Pequenas folhas/trevos e flores sobre o topo. */
export function sprouts(c: TileCtx, n: number, leafCol: number, flowerCols: number[], seed = 3) {
  const lm = vmat('leaf', 0xffffff, { side: DS });
  const fm = vmat('plastic', 0xffffff, { rough: 0.6 });
  for (let i = 0; i < n; i++) {
    const u = (hash(i, seed) + i / n) % 1;
    const tp = topPoint(c.sh, c.st, u, 0.25 + 0.6 * hash(i, seed + 1));
    for (let k = 0; k < 3; k++) {
      const g = leafGeo(0.06, 0.05, { curl: 0.6, fold: 0.4, nu: 4, nv: 2, shape: (t) => Math.sin(Math.PI * t) ** 0.6 });
      c.b.add(g, lm, placeM(tp.pos, new THREE.Vector3(Math.cos(k * 2.1 + i), 0.9, Math.sin(k * 2.1 + i)), 0), mix(leafCol, 0xffffff, 0.1 * k));
    }
    if (flowerCols.length && hash(i, seed + 7) > 0.35) {
      const fc = flowerCols[i % flowerCols.length];
      const stem = tubeGeo([[0, 0, 0], [0.005, 0.05, 0], [0.01, 0.09, 0.005]], 0.004, 6, 4);
      c.b.add(stem, lm, placeM(tp.pos, [0, 1, 0]), mix(leafCol, 0x000000, 0.2));
      for (let p = 0; p < 5; p++) {
        const a = (p / 5) * 360;
        const pg = leafGeo(0.03, 0.022, { curl: -0.5, nu: 3, nv: 1 });
        c.b.add(pg, fm, placeM(tp.pos.clone().add(new THREE.Vector3(0.01, 0.09, 0.005)), new THREE.Vector3(Math.cos(a * Math.PI / 180), 0.5, Math.sin(a * Math.PI / 180)), 0), fc);
      }
      c.b.add(new THREE.SphereGeometry(0.008, 6, 4), fm, placeM(tp.pos.clone().add(new THREE.Vector3(0.01, 0.095, 0.006)), [0, 1, 0]), 0xffd040);
    }
  }
}

/** Raízes/fios pendurados no teto exposto. */
export function hangingRoots(c: TileCtx, n: number, color: number, len: [number, number], r = 0.012, seed = 5) {
  const m = vmat('bark', 0xffffff, { repeat: 1 });
  for (let i = 0; i < n; i++) {
    const u = (i + 0.2 + hash(i, seed) * 0.6) / n;
    const bp = bottomPoint(c.sh, c.st, u, 0.1 + 0.3 * hash(i, seed + 1));
    const L = hr(len[0], len[1], i, seed + 2);
    const sw = hr(-0.05, 0.05, i, seed + 3);
    const pts: V3[] = [[0, 0.02, 0], [sw * 0.3, -L * 0.35, 0.01], [sw, -L * 0.7, 0.015], [sw * 1.4 + 0.01, -L, 0.03]];
    const g = tubeGeo(pts, (t) => r * (1 - t * 0.85), 10, 5);
    c.b.add(g, m, placeM(bp.pos, [0, 1, 0]), mix(color, 0x000000, 0.25 * hash(i, seed + 4)));
  }
}

/** Pedras embutidas na face frontal (longe das bordas para não quebrar o encaixe). */
export function embeddedStones(c: TileCtx, n: number, color: number, size: [number, number], seed: number, yMax = 0.32, mt?: THREE.Material) {
  const m = mt ?? vmat('rock', 0xffffff, { repeat: 1 });
  for (let i = 0; i < n; i++) {
    const x = hr(-0.3, 0.3, i, seed);
    const y = hr(-0.32, yMax, i, seed + 1);
    const fp = frontPoint(c.sh, c.st, x, y);
    if (fp.tf > 0.1) continue;
    const r = hr(size[0], size[1], i, seed + 2);
    const g = rockGeo([r, r * hr(0.6, 0.9, i, seed + 3), r * 0.55], seed + i * 3, 2, { rough: 0.22 });
    c.b.add(g, m, placeM(fp.pos.clone().addScaledVector(fp.n, -r * 0.18), [hr(-0.3, 0.3, i, seed + 4), 1, 0], hr(0, 360, i, seed + 5)), mix(color, 0xffffff, 0.15 * hash(i, seed + 6)));
  }
}

/** Raiz serpenteando sobre a face frontal. */
export function faceRoot(c: TileCtx, color: number, y: number, seed: number, r = 0.022) {
  const m = vmat('bark', 0xffffff, { repeat: 1 });
  const pts: V3[] = [];
  for (let i = 0; i <= 6; i++) {
    const x = -0.3 + 0.6 * (i / 6);
    const yy = y + 0.07 * Math.sin(i * 1.3 + seed);
    const fp = frontPoint(c.sh, c.st, x, yy);
    pts.push([fp.pos.x, fp.pos.y, fp.pos.z + r * 0.4]);
  }
  c.b.add(tubeGeo(pts, (t) => r * (0.6 + 0.4 * Math.sin(Math.PI * t)), 24, 6), m, undefined, color);
}

/** Pedrinhas/folhas soltas numa lateral exposta. */
export function sideTufts(c: TileCtx, side: 1 | -1, colors: number[], seed: number, n = 6) {
  const m = vmat('leaf', 0xffffff, { side: DS });
  for (let i = 0; i < n; i++) {
    const sp = sidePoint(c.sh, c.st, side, 0.15 + 0.6 * hash(i, seed), 0.1 + 0.2 * hash(i, seed + 1));
    const g = bladeGeo(hr(0.06, 0.12, i, seed + 2), 0.018, 0.6, 0.3, 4);
    c.b.add(g, m, placeM(sp.pos, new THREE.Vector3(side * 0.8, 0.6, 0.3), side > 0 ? 0 : 180), colors[i % colors.length]);
  }
}

/* ---------------- cipó vertical / corda horizontal ---------------- */

export interface VineOpts {
  color: number;
  leaf?: number;
  r?: number;
  leaves?: number;
  matKind?: 'bark' | 'cloth' | 'metal' | 'rust' | 'leaf' | 'glow' | 'crystal';
  emissive?: number;
  twist?: boolean;
  leafShape?: (t: number) => number;
}

/** Cipó vertical (período 1 em y): dois fios trançados com folhas em coração. */
export function vineCol(c: TileCtx, part: 'top' | 'mid' | 'bottom', o: VineOpts) {
  const m = vmat(o.matKind ?? 'bark', 0xffffff, o.emissive ? { emissive: o.emissive, emissiveIntensity: 0.5 } : { repeat: 1 });
  const lm = vmat('leaf', 0xffffff, { side: DS });
  const r = o.r ?? 0.035;
  const y0 = part === 'bottom' ? -0.25 : -0.62;
  const y1 = part === 'top' ? 0.4 : 0.62;
  for (const k of o.twist === false ? [0] : [0, 1]) {
    const pts: V3[] = [];
    for (let i = 0; i <= 16; i++) {
      const y = y0 + (y1 - y0) * (i / 16);
      const a = TAU * y + k * Math.PI;
      pts.push([0.035 * Math.sin(a) + 0.01 * Math.sin(TAU * 2 * y), y, 0.035 * Math.cos(a)]);
    }
    if (part === 'bottom') {
      // ponta enrolada em gavinha
      pts.unshift([0.03 * (k ? -1 : 1), -0.3, 0.02], [0.07 * (k ? -1 : 1), -0.36, 0.03]);
      const sg = k ? -1 : 1;
      const spiral: V3[] = [];
      for (let i = 0; i <= 18; i++) {
        const t = i / 18, a = t * TAU * 1.6, rr = 0.06 * (1 - t * 0.75);
        spiral.push([sg * (0.07 + rr * Math.cos(a)), -0.36 - 0.05 * t - rr * Math.sin(a), 0.03 + 0.01 * t]);
      }
      c.b.add(tubeGeo(spiral, (t) => r * 0.35 * (1 - t * 0.7), 36, 5), m, undefined, mix(o.color, 0xffffff, 0.1));
    }
    const rf = (t: number) => r * (k ? 0.75 : 1) * (part === 'bottom' ? Math.min(1, 0.25 + t * 2) : 1);
    c.b.add(tubeGeo(pts, rf, 40, 7), m, undefined, mix(o.color, 0x000000, k * 0.15));
  }
  // nós/amarras ao longo do cipó (período 1 em y)
  for (const yk of [-0.25, 0.25]) if (yk > y0 + 0.05 && yk < y1 - 0.05) c.b.add(latheGeo([[0.001, -r * 1.3], [r * 1.5, -r * 0.8], [r * 1.7, 0], [r * 1.5, r * 0.8], [0.001, r * 1.3]], 10), m, M([0, yk, 0]), mix(o.color, 0x000000, 0.12));
  const nl = (o.leaves ?? 4) + (part === 'bottom' ? 2 : 0);
  if (o.leaf !== undefined) {
    for (let i = 0; i < nl; i++) {
      const y = y0 + 0.08 + ((y1 - y0 - 0.12) * (i + 0.5)) / nl;
      const side = i % 2 ? 1 : -1;
      const g = leafGeo(0.22, 0.15, { curl: 0.5, fold: 0.35, nu: 7, nv: 2, shape: o.leafShape ?? ((t) => Math.sin(Math.PI * Math.min(1, t * 1.1)) ** 0.5 * (1 - t * 0.3)) });
      c.b.add(g, lm, placeM([side * 0.03, y, 0.03], new THREE.Vector3(side, 0.25, 0.35), 0), mix(o.leaf, 0xffffff, 0.08 * (i % 3)));
    }
  }
  if (part === 'top' && o.leaf !== undefined) {
    // touceira de folhas no ponto onde o cipó se prende
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * TAU;
      const g = leafGeo(0.24, 0.13, { curl: 0.9, fold: 0.4, nu: 8, nv: 2 });
      c.b.add(g, lm, placeM([0, 0.42, 0], new THREE.Vector3(Math.cos(a), -0.15 + 0.3 * (i % 2), Math.sin(a) * 0.8 + 0.2), 0), mix(o.leaf, 0x000000, 0.12 * (i % 3)));
    }
    c.b.add(new THREE.SphereGeometry(0.07, 12, 8), m, placeM([0, 0.42, 0], [0, 1, 0], 0, [1.2, 0.8, 1]), o.color);
  }
}

/** Corda/cipó horizontal (período 1 em x), altura y. */
export function ropeRow(c: TileCtx, y: number, o: VineOpts) {
  const m = vmat(o.matKind ?? 'bark', 0xffffff, o.emissive ? { emissive: o.emissive, emissiveIntensity: 0.5 } : { repeat: 1 });
  const lm = vmat('leaf', 0xffffff, { side: DS });
  const r = o.r ?? 0.03;
  const strands = o.twist === false ? [0] : [0, 1, 2];
  for (const k of strands) {
    const pts: V3[] = [];
    for (let i = 0; i <= 24; i++) {
      const x = -0.62 + 1.24 * (i / 24);
      const a = TAU * 3 * x + (k * TAU) / 3;
      pts.push([x, y + r * 0.6 * Math.sin(a), r * 0.6 * Math.cos(a)]);
    }
    c.b.add(tubeGeo(pts, r * (0.75 - k * 0.05), 64, 7), m, undefined, mix(o.color, 0x000000, k * 0.12));
    // fibras soltas enroladas por cima de cada perna
    for (const f of [0, 1]) {
      const fib: V3[] = pts.map(([x, yy, z], i) => [x, yy + r * 0.45 * Math.sin(i * (2.1 + f) + k + f * 2), z + r * 0.45 * Math.cos(i * (2.1 + f) + k + f * 2)] as V3);
      c.b.add(tubeGeo(fib, r * 0.1, 64, 4), m, undefined, mix(o.color, f ? 0x000000 : 0xffffff, 0.2));
    }
  }
  // nó no meio do tile, com ponta de fibra ou gavinha pendente
  const knot = latheGeo([[0.001, -r * 1.6], [r * 1.25, -r * 1.1], [r * 1.55, 0], [r * 1.25, r * 1.1], [0.001, r * 1.6]], 12, (p) => { p.x *= 1 + 0.12 * Math.sin(p.y * 90); });
  c.b.add(knot, m, placeM([0.08, y, 0], [1, 0, 0], 0), mix(o.color, 0x000000, 0.1));
  c.b.add(tubeGeo([[0.09, y - r, 0.01], [0.1, y - r * 3, 0.03], [0.07, y - r * 5, 0.04], [0.085, y - r * 6.5, 0.05]], (t) => r * 0.35 * (1 - t * 0.6), 16, 5), m, undefined, mix(o.color, 0xffffff, 0.08));
  if (o.leaf !== undefined) {
    for (let i = 0; i < (o.leaves ?? 3) + 1; i++) {
      const x = -0.4 + (0.8 * (i + 0.5)) / ((o.leaves ?? 3) + 1);
      const g = leafGeo(0.2, 0.15, { curl: 0.35, fold: 0.25, nu: 7, nv: 3, shape: (t) => Math.sin(Math.PI * Math.min(1, t * 1.1)) ** 0.5 * (1 - t * 0.3) });
      c.b.add(g, lm, placeM([x, y - 0.02, 0.05], new THREE.Vector3(0.5 * (i % 2 ? 1 : -1), -1, 0.9), 0), mix(o.leaf, 0xffffff, 0.08 * i));
      // gavinha enrolada
      const tw: V3[] = [];
      for (let k = 0; k <= 10; k++) { const a = k * 0.9; tw.push([x + 0.1 + 0.03 * Math.cos(a), y - 0.02 - k * 0.012, 0.03 + 0.03 * Math.sin(a)]); }
      c.b.add(tubeGeo(tw, 0.005, 24, 4), lm, undefined, mix(o.leaf, 0x000000, 0.2));
    }
  }
}

/* ---------------- tronco/galho como plataforma ---------------- */

export interface LogOpts { r: number; color: number; moss?: number; cut?: number; seed?: number; kind?: 'bark' | 'wood' }

/** Tronco horizontal com o topo no alto do tile; período 1 em x no meio, pontas cortadas em l/r/s. */
export function logPlatform(c: TileCtx, part: 's' | 'l' | 'm' | 'r', o: LogOpts) {
  const R = o.r, yc = 0.5 - R * 0.92, zc = -0.03;
  const x0 = part === 'l' || part === 's' ? -0.42 : -0.5;
  const x1 = part === 'r' || part === 's' ? 0.42 : 0.5;
  const nx = 40, na = 28;
  const pos: number[] = [], uv: number[] = [], colr: number[] = [], idx: number[] = [];
  const cBark = new THREE.Color(o.color), cMoss = new THREE.Color(o.moss ?? o.color);
  const capT = 0.08; // arredonda a ponta
  for (let i = 0; i <= nx; i++) {
    const x = x0 + (x1 - x0) * (i / nx);
    let endK = 1;
    if (x - x0 < capT && x0 > -0.5) endK = Math.sqrt(Math.max(0, 1 - ((capT - (x - x0)) / capT) ** 2)) * 0.25 + 0.75;
    if (x1 - x < capT && x1 < 0.5) endK = Math.sqrt(Math.max(0, 1 - ((capT - (x1 - x)) / capT) ** 2)) * 0.25 + 0.75;
    for (let j = 0; j <= na; j++) {
      const a = (j / na) * TAU;
      const rr = R * endK * (1 + 0.07 * pnoise(x, j / na, 0, o.seed ?? 0, 2, 7));
      const yy = yc + Math.sin(a) * rr, zz = zc + Math.cos(a) * rr;
      pos.push(x, yy, zz);
      uv.push((x + 0.5) * 2, j / na * 2);
      const top = Math.max(0, Math.sin(a));
      const mossF = o.moss !== undefined ? THREE.MathUtils.smoothstep(top + 0.25 * pnoise1(x * 2, 3), 0.55, 0.8) : 0;
      const cc = cBark.clone().lerp(cMoss, mossF).multiplyScalar(0.75 + 0.35 * (0.5 + 0.5 * Math.cos(a - 1.2)));
      colr.push(cc.r, cc.g, cc.b);
    }
  }
  for (let i = 0; i < nx; i++) for (let j = 0; j < na; j++) {
    const a = i * (na + 1) + j, b = a + 1, cc = a + na + 1, d = cc + 1;
    idx.push(a, cc, d, a, d, b);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setAttribute('color', new THREE.Float32BufferAttribute(colr, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  c.b.add(g, vmat(o.kind ?? 'bark', 0xffffff, { repeat: 1 }));
  // nós da casca, cipó enrolado e musgo pendurado por baixo
  const bm = vmat(o.kind ?? 'bark', 0xffffff, { repeat: 1 });
  const lm = vmat('leaf', 0xffffff, { side: DS });
  const sd = o.seed ?? 0;
  for (let i = 0; i < 3; i++) {
    const x = x0 + 0.12 + (x1 - x0 - 0.24) * ((i + 0.5) / 3) + hr(-0.04, 0.04, i, sd + 31);
    const a = hr(0.2, 1.2, i, sd + 32);
    const kn = latheGeo([[R * 0.22, 0], [R * 0.2, R * 0.08], [R * 0.12, R * 0.13], [0.001, R * 0.1]], 10);
    c.b.add(kn, bm, placeM([x, yc + Math.sin(a) * R * 0.95, zc + Math.cos(a) * R * 0.95], [0, Math.sin(a), Math.cos(a)], 0), mix(o.color, 0x000000, 0.25));
  }
  if (o.moss !== undefined) {
    const vp: V3[] = [];
    for (let i = 0; i <= 40; i++) {
      const x = x0 + 0.04 + (x1 - x0 - 0.08) * (i / 40);
      const a = TAU * 2 * ((x + 0.5) % 1) + 0.6;
      vp.push([x, yc + Math.sin(a) * R * 1.06, zc + Math.cos(a) * R * 1.06]);
    }
    c.b.add(tubeGeo(vp, R * 0.09, 120, 5), bm, undefined, mix(o.moss, 0x000000, 0.3));
    for (let i = 0; i < 7; i++) {
      const x = x0 + 0.06 + (x1 - x0 - 0.12) * ((i + hash(i, sd + 40)) / 7);
      const L = hr(0.08, 0.2, i, sd + 41);
      c.b.add(bladeGeo(L, 0.05, 0.15, 0.4, 4), lm, placeM([x, yc - R * 0.85, zc + R * 0.45], [hr(-0.2, 0.2, i, sd + 42), -1, 0.25], 0), mix(o.moss, 0x1a3010, 0.25 + 0.3 * hash(i, sd + 43)));
      if (i % 2 === 0) c.b.add(leafGeo(0.07, 0.05, { curl: 0.5, fold: 0.3, nu: 4, nv: 2 }), lm, placeM([x + 0.03, yc + R * 0.9, zc + R * 0.4], [hr(-0.6, 0.6, i, sd + 44), 0.8, 0.5], 0), mix(o.moss, 0xffffff, 0.15));
    }
  }
  // pontas: disco com anéis de crescimento
  const ends: number[] = [];
  if (x0 > -0.5) ends.push(-1);
  if (x1 < 0.5) ends.push(1);
  for (const s of ends) {
    const xr = s < 0 ? x0 : x1;
    const ring = latheGeo([[0.001, 0], [R * 0.74, 0.0], [R * 0.75, -0.004]], 24);
    c.b.add(ring, vmat('wood', 0xffffff), placeM([xr, yc, zc], [s, 0, 0], 0), o.cut ?? 0xc89a62);
    for (let k = 1; k < 4; k++) {
      const rg = new THREE.TorusGeometry(R * 0.18 * k, 0.003, 4, 24);
      c.b.add(rg, vmat('wood', 0xffffff), placeM([xr + s * 0.002, yc, zc], [0, 0, 1], 0).multiply(new THREE.Matrix4().makeRotationY(Math.PI / 2)), mix(o.cut ?? 0xc89a62, 0x000000, 0.35));
    }
  }
}

/* ---------------- água ---------------- */

export interface WaterOpts { body: number; foam: number; deep: number; opacity?: number; crest?: number }

/** Quadro da faixa de ondas: superfície ondulada vista de cima + frente translúcida. */
export function waterFrame(root: THREE.Group, t: number, W: number, o: WaterOpts) {
  const nx = 48, nz = 10;
  const h = (x: number, z: number) => {
    const p = (x / W) * TAU; // período = largura do quadro
    return 0.035 * Math.sin(p * 2 - t * TAU) + 0.02 * Math.sin(p * 3 + z * 4 + t * TAU * 2 + 1) + 0.012 * Math.sin(p * 7 - t * TAU * 3 + z * 9);
  };
  const pos: number[] = [], colr: number[] = [], idx: number[] = [];
  const cB = new THREE.Color(o.body), cF = new THREE.Color(o.foam), cD = new THREE.Color(o.deep);
  // superfície (de z=0.25 na frente a z=-0.6 no fundo)
  for (let j = 0; j <= nz; j++) for (let i = 0; i <= nx; i++) {
    const x = (i / nx) * W, z = 0.25 - 0.85 * (j / nz);
    const y = h(x, z);
    pos.push(x, y, z);
    const foam = THREE.MathUtils.smoothstep(y, 0.03, 0.06) * 0.8;
    const cc = cB.clone().lerp(cF, foam).lerp(cD, (j / nz) * 0.3);
    colr.push(cc.r, cc.g, cc.b);
  }
  const W1 = nx + 1;
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
    const a = j * W1 + i, b = a + 1, c = a + W1, d = c + 1;
    idx.push(a, b, d, a, d, c);
  }
  // face frontal: desce da linha d'água até o fim do quadro, escurecendo para a cor do fundo
  const base = pos.length / 3;
  for (let j = 0; j <= 6; j++) for (let i = 0; i <= nx; i++) {
    const x = (i / nx) * W, z = 0.25;
    const y = j === 0 ? h(x, z) : -0.7 * (j / 6);
    pos.push(x, y, z);
    const cc = cB.clone().lerp(cD, j / 6);
    colr.push(cc.r, cc.g, cc.b);
  }
  for (let j = 0; j < 6; j++) for (let i = 0; i < nx; i++) {
    const a = base + j * W1 + i, b = a + 1, c = a + W1, d = c + 1;
    idx.push(a, d, b, a, c, d);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(colr, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  const m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.15, metalness: 0.1, transparent: true, opacity: o.opacity ?? 0.85, side: THREE.DoubleSide });
  root.add(new THREE.Mesh(g, m));
  // linha de espuma/brilho na crista frontal
  const pts: V3[] = [];
  for (let i = 0; i <= 32; i++) { const x = (i / 32) * W; pts.push([x, h(x, 0.25) + 0.008, 0.26]); }
  const foam = tubeGeo(pts, 0.012, 64, 4);
  root.add(new THREE.Mesh(foam, new THREE.MeshBasicMaterial({ color: o.crest ?? 0xffffff, transparent: true, opacity: 0.75 })));
  // reflexos de luz (traços claros na superfície, deslocados com o tempo)
  for (let k = 0; k < 5; k++) {
    const x = 0.1 + ((k * 0.37 + t * (k % 2 ? 1 : 2)) % 1) * (W - 0.3);
    const z = -0.1 - 0.08 * k;
    const sg = new THREE.PlaneGeometry(0.18 - 0.02 * k, 0.012);
    sg.rotateX(-Math.PI / 2);
    const mm = new THREE.Mesh(sg, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55 }));
    mm.position.set(x, h(x, z) + 0.01, z);
    root.add(mm);
  }
}
