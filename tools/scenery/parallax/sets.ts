/**
 * Demais conjuntos de parallax: serraria, rio, gruta, mina, praia, recife, naufrágio, fábrica,
 * cristal e copa. Cada um com 5 camadas autorais (1 = fundo … 5 = silhuetas na frente do jogador).
 */
import * as THREE from 'three';
import type { SceneDef } from '../types';
import { hr, hash, mix, M, vmat, col, type V3, type Batch } from '../lib/core';
import { rockGeo, latheGeo, tubeGeo, crystalGeo, coneGeo, leafGeo, placeM } from '../lib/kit';
import { crown, kapok, tree, palm, bush, bigLeaf, mossRock, hangingVine, hill, grassTuft, log, stump, MAT } from '../lib/flora';
import { layerScene, groundStrip, per, beams, glow, motes, type LayerCtx } from './common';
import { mataFar, mataMid, mataFront, PAL_DIA, type MataPal } from './mata';
import { stalagmite } from '../decor/gruta';
import { gear } from '../decor/fabrica';
import { branchCoral } from '../tiles/recife';
import { crystalMat } from '../tiles/cristal';

const soft = () => vmat('rubber', 0xffffff, { rough: 1, rim: 0.12 });
const rockM = () => vmat('rock', 0xffffff, { rough: 0.8 });

/* ================= utilidades ================= */

/** Parede de rocha (fundo de caverna) cobrindo a camada inteira, com relevo. */
function caveWall(c: LayerCtx, z: number, cols: [number, number, number], seed: number, amp = 1.2) {
  const { W, H } = c;
  const nx = 140, ny = 70;
  const pos: number[] = [], cl: number[] = [], idx: number[] = [];
  for (let j = 0; j <= ny; j++) for (let i = 0; i <= nx; i++) {
    const x = -W / 2 - 1 + (W + 2) * (i / nx), y = -2 + (H + 4) * (j / ny);
    const n = 0.5 * per(x, W, 3, y * 0.5 + seed) + 0.3 * per(x, W, 7, y * 0.9 + seed * 2) + 0.2 * Math.sin(y * 1.7 + per(x, W, 5) * 2);
    const zz = z + amp * n;
    pos.push(x, y, zz);
    const cc = n < 0 ? mix(cols[0], cols[1], n + 1) : mix(cols[1], cols[2], n);
    cl.push(cc.r, cc.g, cc.b);
  }
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) { const a = j * (nx + 1) + i; idx.push(a, a + 1, a + nx + 2, a, a + nx + 2, a + nx + 1); }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(cl, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  const m = new THREE.Mesh(g, vmat('rock', 0xffffff, { repeat: 6, rim: 0.2 }));
  m.receiveShadow = true;
  c.root.add(m);
}

/** Coluna de caverna (chão ao teto). */
function column(b: Batch, x: number, z: number, H: number, r: number, cols: [number, number], seed: number) {
  const g = latheGeo(Array.from({ length: 21 }, (_, i) => { const t = i / 20; return [r * (0.32 + 1.0 * (Math.abs(t - 0.5) * 2) ** 2.6 + 0.07 * Math.sin(t * 30 + seed)), t * H] as [number, number]; }), 14, (p) => { const a = Math.atan2(p.z, p.x); const k = 1 + 0.1 * Math.sin(a * 5 + p.y + seed); p.x *= k; p.z *= k; });
  const pos = g.getAttribute('position') as THREE.BufferAttribute;
  const cc = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) { const t = pos.getY(i) / H; const q = mix(cols[0], cols[1], 0.3 + 0.6 * Math.sin(t * Math.PI) ** 2); cc.set([q.r, q.g, q.b], i * 3); }
  g.setAttribute('color', new THREE.BufferAttribute(cc, 3));
  b.add(g, rockM(), M([x, -1, z]));
}

/** Estalactites penduradas do teto (y = topo). */
function stalactites(c: LayerCtx, b: Batch, n: number, y: number, z0: number, z1: number, cols: [number, number], scale: number, seed: number) {
  for (let i = 0; i < n; i++) {
    const x = -c.W / 2 + (c.W * (i + hash(i, seed))) / n;
    const h = scale * hr(0.8, 2.6, i, seed + 1), r = h * hr(0.16, 0.24, i, seed + 2);
    c.wrap(x, r * 1.5, (xx) => b.add(coneGeo(r, h, i + seed), rockM(), M([xx, y + 0.3, hr(z0, z1, i, seed + 3)], [180, i * 30, 0]), mix(cols[0], cols[1], hash(i, seed + 4))));
  }
}

/** Peixinhos em cardume. */
function fishSchool(c: LayerCtx, cx: number, cy: number, z: number, n: number, colr: number, s: number, seed: number) {
  const m = vmat('scale', 0xffffff, { rim: 0.6 });
  for (let i = 0; i < n; i++) {
    const x = cx + hr(-1.6, 1.6, i, seed) * s * 3, y = cy + hr(-0.8, 0.8, i, seed + 1) * s * 3, zz = z + hr(-0.5, 0.5, i, seed + 2);
    c.wrap(x, s, (xx) => {
      const T = M([xx, y, zz], [0, 0, hr(-10, 10, i, seed + 3)], s);
      c.b.add(new THREE.SphereGeometry(0.5, 12, 8), m, T.clone().multiply(M([0, 0, 0], [0, 0, 0], [1, 0.45, 0.25])), colr);
      const tail = new THREE.ConeGeometry(0.25, 0.4, 4);
      c.b.add(tail, m, T.clone().multiply(M([-0.55, 0, 0], [0, 0, 90], [1, 1, 0.3])), mix(colr, 0x000000, 0.2));
    });
  }
}

/* ================= SERRARIA (mata devastada) ================= */
const PAL_SERRA: MataPal = { ...PAL_DIA, fog: [0xc8c0a8, 0xb0a88c, 0x8a8068, 0x5a5040], hill: [0x9a9a88, 0x8a8a74, 0x7a7a60], leafFar: [0x5a6a40, 0x7a8a50, 0xa0a870], leaf: [0x3a5228, 0x5a7a34, 0x9aa858], bark: 0x8a7a68, barkNear: 0x5a4a3a, ground: [0x7a6a48, 0x6a5038], beam: 0xffe8b0, fg: 0x1a140e };

function smoke(c: LayerCtx, x: number, y0: number, z: number, h: number, colr: number, seed: number) {
  const m = vmat('rubber', 0xffffff, { rough: 1, rim: 0.3, opacity: 0.8 });
  for (let i = 0; i < 7; i++) {
    const t = i / 6;
    c.wrap(x, 3, (xx) => c.nb.add(rockGeo([0.6 + t * 1.6, 0.5 + t * 1.1, 0.6], seed + i, 2, { rough: 0.3 }), m, M([xx + t * t * 3, y0 + t * h, z]), mix(colr, 0xd8d0c8, t * 0.6)));
  }
}

function bulldozer(b: Batch, T: THREE.Matrix4) {
  const paint = vmat('paint', 0xffffff), mm = vmat('metal', 0xffffff, { rough: 0.5 });
  b.add(new THREE.BoxGeometry(3, 1.2, 1.8), paint, T.clone().multiply(M([0, 1.3, 0])), 0xd8a020);
  b.add(new THREE.BoxGeometry(1.4, 1.2, 1.6), vmat('glass', 0xffffff), T.clone().multiply(M([-0.5, 2.5, 0])), 0x3a4a50);
  b.add(new THREE.BoxGeometry(1.6, 0.15, 1.8), paint, T.clone().multiply(M([-0.5, 3.15, 0])), 0xd8a020);
  for (const z of [-0.9, 0.9]) b.add(new THREE.BoxGeometry(3.6, 0.8, 0.5), vmat('rubber', 0xffffff), T.clone().multiply(M([0, 0.4, z])), 0x2a2a2a);
  b.add(new THREE.BoxGeometry(0.3, 1.6, 2.6), mm, T.clone().multiply(M([2.3, 0.8, 0], [0, 0, -12])), 0x8a8a7a);
  b.add(latheGeo([[0.12, 0], [0.12, 1.2]], 8), mm, T.clone().multiply(M([0.8, 1.9, 0.5])), 0x2a2a2a);
}

function serraria(): SceneDef[] {
  const P = PAL_SERRA, pre = 'selva' as const;
  const L = { hemi: { i: 0.95 } };
  return [
    layerScene('serraria', 1, { preset: pre, light: L, fog: { color: P.fog[0], near: 50, far: 120 }, pitch: -4, build: (c) => {
      mataFar(c, P, { waterfalls: false, devastated: true });
      smoke(c, -6, 2, -20, 9, 0x6a6058, 1);
      smoke(c, 9, 1.5, -22, 7, 0x7a7068, 2);
    } }),
    layerScene('serraria', 2, { preset: pre, light: L, fog: { color: P.fog[1], near: 55, far: 95 }, build: (c) => {
      mataMid(c, P, { devastated: true });
      // galpão da serraria ao fundo
      c.wrap(4, 4, (x) => {
        c.b.add(new THREE.BoxGeometry(6, 3, 3), vmat('wood', 0xffffff), M([x, 1.2, -14]), 0x7a5a40);
        c.b.add(new THREE.CylinderGeometry(2.2, 2.2, 6.4, 3, 1), vmat('rust', 0xffffff), M([x, 3.2, -14], [0, 0, 90], [1, 0.5, 1]), 0x8a3a2a);
        c.b.add(latheGeo([[0.3, 0], [0.3, 4]], 10), vmat('rust', 0xffffff), M([x + 2, 2, -14.5]), 0x5a4a44);
      });
      smoke(c, 6, 6, -14.5, 6, 0x5a5048, 3);
    } }),
    layerScene('serraria', 3, { preset: pre, light: L, fog: { color: P.fog[2], near: 56, far: 90 }, build: (c) => {
      const { W } = c;
      groundStrip(c, -10, 2, (x, z) => 0.2 * per(x, W, 4, 1) - 0.2, (x) => mix(P.ground[0], P.ground[1], 0.5 + 0.5 * per(x, W, 7)), soft());
      for (let i = 0; i < 14; i++) { const x = -W / 2 + (W * (i + 0.3)) / 14; c.wrap(x, 1, (xx) => stump(c.b, M([xx, -0.2, hr(-8, -1, i, 2)]), hr(0.4, 0.9, i, 3), hr(0.35, 0.6, i, 4), P.bark, i)); }
      for (let i = 0; i < 3; i++) { const x = -W / 2 + W * (0.15 + 0.33 * i); c.wrap(x, 4, (xx) => tree(c.b, M([xx, -0.2, -7]), 8, { bark: P.bark, leaf: P.leaf }, i)); }
      c.wrap(-3, 4, (x) => bulldozer(c.b, M([x, -0.2, -5], [0, 25, 0])));
      for (let i = 0; i < 3; i++) { const x = W * (0.1 + 0.3 * i); c.wrap(x, 3, (xx) => { for (let k = 0; k < 3; k++) log(c.b, M([xx, k * 0.75 - 0.2, -3 + k * 0.1], [0, 5, 0]), 4, 0.4, 0x6a4a30, 0x6a5a3a, i * 3 + k); }); }
    } }),
    layerScene('serraria', 4, { preset: pre, light: L, fog: { color: P.fog[3], near: 58, far: 85 }, build: (c) => {
      const { W } = c;
      groundStrip(c, -5, 2, (x) => 0.25 * per(x, W, 3, 2) - 0.25, (x) => mix(P.ground[0], P.ground[1], 0.5 + 0.5 * per(x, W, 6)).multiplyScalar(0.75), soft());
      for (let i = 0; i < 6; i++) { const x = -W / 2 + (W * (i + 0.5)) / 6; c.wrap(x, 1.5, (xx) => stump(c.b, M([xx, -0.25, hr(-3, -1, i, 2)]), hr(0.8, 1.3, i, 3), hr(0.7, 1.0, i, 4), P.barkNear, i + 10)); }
      for (let i = 0; i < 10; i++) { const x = -W / 2 + (W * i) / 10; c.wrap(x, 1, (xx) => grassTuft(c.b, M([xx, -0.25, hr(-1, 1, i, 5)]), 0.6, [0x6a7a3a, 0x8a8a4a], i)); }
      // cerca de arame do Barão
      for (let i = 0; i < 16; i++) { const x = -W / 2 + (W * i) / 16; c.wrap(x, 0.2, (xx) => c.b.add(new THREE.CylinderGeometry(0.06, 0.07, 2.2, 8), vmat('wood', 0xffffff), M([xx, 0.9, -1.8], [0, 0, hr(-6, 6, i, 7)]), 0x5a4a3a)); }
      for (const y of [0.6, 1.2, 1.8]) c.b.add(new THREE.BoxGeometry(W + 2, 0.02, 0.02), vmat('metal', 0xffffff), M([0, y, -1.75]), 0x5a5a5a);
    } }),
    layerScene('serraria', 5, { preset: pre, light: { hemi: { i: 0.35 }, key: { i: 0.6 } }, build: (c) => {
      mataFront(c, { ...P, leafNear: [0x2a2418, 0x3a3020, 0x4a4028] });
      c.wrap(c.W * 0.05, 1.5, (x) => stump(c.b, M([x, -0.8, 1.2]), 1.2, 0.9, P.fg, 3));
    } }),
  ];
}

/* ================= RIO ================= */
function waterSurface(c: LayerCtx, z0: number, z1: number, y: number, deep: number, light: number) {
  const m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.12, metalness: 0.2, transparent: true, opacity: 0.92 });
  groundStrip(c, z0, z1, (x, z) => y + 0.04 * per(x, c.W, 23, z * 3), (x, z) => mix(deep, light, ((z - z0) / (z1 - z0)) * 0.6 + 0.2 * per(x, c.W, 17, z)), m, 200, 30);
}

function rio(): SceneDef[] {
  const P = PAL_DIA, pre = 'selva' as const, L = { hemi: { i: 0.95 } };
  return [
    layerScene('rio', 1, { preset: pre, light: L, fog: { color: P.fog[0], near: 50, far: 120 }, pitch: -4, build: (c) => mataFar(c, P, { waterfalls: true }) }),
    layerScene('rio', 2, { preset: pre, light: L, fog: { color: P.fog[1], near: 55, far: 100 }, pitch: -7, build: (c) => {
      const { W } = c;
      // margem distante com mata e o rio largo na frente
      groundStrip(c, -26, -18, () => 0.3, () => col(0x4a6a2a), soft(), 40, 3);
      for (let i = 0; i < 44; i++) { const x = -W / 2 + (W * i) / 44; c.wrap(x, 1.6, (xx) => crown(c.b, M([xx, hr(0.8, 2.2, i, 1), hr(-26, -20, i, 2)]), hr(1, 1.6, i, 3), P.leaf, i, { lobes: 5, detail: 1 })); }
      for (let i = 0; i < 2; i++) c.wrap(-W * 0.3 + i * W * 0.55, 5, (xx) => kapok(c.b, M([xx, 0.3, -24]), 13, { bark: P.bark, leaf: P.leaf }, i + 3));
      waterSurface(c, -20, 2, -0.05, 0x3a6a5a, 0x7ab0a0);
      // reflexos e toras boiando
      for (let i = 0; i < 5; i++) { const x = -W / 2 + (W * (i + 0.5)) / 5; c.wrap(x, 2, (xx) => log(c.b, M([xx, -0.35, hr(-15, -4, i, 7)], [0, hr(-30, 30, i, 8), 0]), hr(2, 3.2, i, 9), 0.3, 0x5a4030, 0x4a6a2a, i)); }
    } }),
    layerScene('rio', 3, { preset: pre, light: L, fog: { color: P.fog[2], near: 56, far: 90 }, build: (c) => {
      const { W, H } = c;
      waterSurface(c, -10, 2, -0.1, 0x3a6a5a, 0x6aa090);
      // ilhotas com palmeiras e árvores debruçadas
      for (let i = 0; i < 4; i++) {
        const x = -W / 2 + (W * (i + 0.4)) / 4;
        c.wrap(x, 4, (xx) => {
          mossRock(c.b, M([xx, -0.4, -6]), [2.4, 0.8, 1.4], 0x6a5a48, 0x4a8a2a, i);
          palm(c.b, M([xx - 0.8, 0, -6]), hr(5, 7, i, 2), { trunk: P.bark, leaf: P.leaf[1] }, i + 9, { lean: -0.3 });
          tree(c.b, M([xx + 1, 0, -6.5]), 6, { bark: P.bark, leaf: P.leaf }, i + 20);
          bush(c.b, M([xx + 0.3, 0, -5.4]), 0.9, P.leaf, i + 30);
        });
      }
      for (let i = 0; i < 6; i++) { const x = -W / 2 + (W * (i + 0.5)) / 6; c.wrap(x, 1, (xx) => hangingVine(c.b, M([xx, H + 0.5, -4]), hr(3, 6, i, 1), 0x4a5a2a, P.leaf[1], i, 0.05)); }
      beams(c, [0, 1, 2].map((i) => ({ x: -W / 2 + (W * (i + 0.5)) / 3, y: H * 0.5, z: -2, w: 2.6, h: H * 1.2, ang: -20, op: 0.18 })), P.beam);
    } }),
    layerScene('rio', 4, { preset: pre, light: L, fog: { color: P.fog[3], near: 58, far: 85 }, build: (c) => {
      const { W } = c;
      waterSurface(c, -4, 2, -0.15, 0x2a5a4a, 0x5a9080);
      // raízes de mangue, juncos e vitórias-régias
      for (let i = 0; i < 8; i++) {
        const x = -W / 2 + (W * (i + 0.3)) / 8;
        c.wrap(x, 2, (xx) => {
          for (let k = 0; k < 5; k++) c.b.add(tubeGeo([[xx + (k - 2) * 0.3, -0.3, -2], [xx + (k - 2) * 0.2, 0.8, -2.1], [xx, 1.6, -2.2]], 0.07, 12, 6), MAT.bark(), undefined, 0x4a3a2a);
          grassTuft(c.b, M([xx + 1.2, -0.2, -1]), 1.4, [0x5a8a2a, 0x7aa83a, 0x4a7a20], i + 40, 18);
        });
      }
      for (let i = 0; i < 12; i++) { const x = -W / 2 + (W * i) / 12; c.wrap(x, 0.6, (xx) => c.b.add(new THREE.CircleGeometry(0.55, 20, 0.3, Math.PI * 1.85), MAT.leaf(), M([xx, -0.1, hr(-3, 0, i, 2)], [-90, 0, i * 40]), 0x3a7a2a)); }
    } }),
    layerScene('rio', 5, { preset: pre, light: { hemi: { i: 0.35 }, key: { i: 0.6 } }, build: (c) => {
      mataFront(c, P);
      for (let i = 0; i < 6; i++) c.wrap(-c.W / 2 + (c.W * (i + 0.5)) / 6, 1, (x) => grassTuft(c.b, M([x, -0.8, 1.4]), 2.4, [P.fg, 0x1a2a14], i + 50, 20));
    } }),
  ];
}

/* ================= GRUTA e MINA ================= */
const CAVE = { wall: [0x1a120a, 0x3a2614, 0x6a4a24] as [number, number, number], rock: [0x4a3420, 0xc8902e] as [number, number], fog: [0x1a1008, 0x24160a, 0x2e1c0c, 0x20140a] };

function caveLayers(set: 'gruta' | 'mina'): SceneDef[] {
  const pre = 'caverna' as const;
  const L = { hemi: { i: 0.55 }, key: { i: 2.0 } };
  const mina = set === 'mina';
  const beam = (b: Batch, x: number, z: number, h: number, w: number) => {
    const wd = vmat('wood', 0xffffff);
    for (const s of [-1, 1]) b.add(new THREE.BoxGeometry(0.35, h, 0.35), wd, M([x + s * w / 2, h / 2 - 0.5, z], [0, 0, s * 2]), 0x5a3e24);
    b.add(new THREE.BoxGeometry(w + 0.8, 0.4, 0.4), wd, M([x, h - 0.5, z]), 0x4a3220);
    for (const s of [-1, 1]) b.add(new THREE.BoxGeometry(0.2, 1.3, 0.2), wd, M([x + s * (w / 2 - 0.5), h - 1.0, z], [0, 0, s * 45]), 0x6a4a2c);
  };
  const lamp = (c: LayerCtx, x: number, y: number, z: number, r: number) => {
    c.b.add(latheGeo([[0.12, 0], [0.15, 0.2], [0.15, 0.4], [0.1, 0.48]], 10), vmat('glass', 0xffffff, { emissive: 0xffb040, emissiveIntensity: 1.4, opacity: 0.8 }), M([x, y, z]), 0xffd080);
    glow(c, [x, y + 0.25, z + 0.5], r, 0xffa040, 0.6);
  };
  return [
    layerScene(set, 1, { preset: pre, light: L, fog: { color: CAVE.fog[0], near: 50, far: 110 }, build: (c) => {
      caveWall(c, -40, CAVE.wall, 1, 2.5);
      const { W, H } = c;
      for (let i = 0; i < 5; i++) { const x = -W / 2 + (W * (i + 0.5)) / 5; c.wrap(x, 1.5, (xx) => column(c.nb, xx, -30 + hr(-3, 3, i, 2), H + 2, hr(0.8, 1.4, i, 3), [0x3a2814, 0x8a6020], i)); }
      // brilhos âmbar distantes (veios e frestas)
      for (let i = 0; i < 10; i++) { const x = -W / 2 + W * hash(i, 4); c.wrap(x, 2, (xx) => glow(c, [xx, hr(1, H - 2, i, 5), -25], hr(1, 2.4, i, 6), 0xd08020, 0.25)); }
    } }),
    layerScene(set, 2, { preset: pre, light: L, fog: { color: CAVE.fog[1], near: 55, far: 92 }, build: (c) => {
      const { W, H } = c;
      groundStrip(c, -26, 0, (x, z) => 0.3 * per(x, W, 5, z * 0.3) - 0.5, () => col(0x3a2814), soft(), 120, 10);
      for (let i = 0; i < 3; i++) { const x = -W / 2 + (W * (i + 0.2)) / 3; c.wrap(x, 2, (xx) => column(c.b, xx, -16 + hr(-4, 4, i, 2), H + 2, hr(1.1, 1.5, i, 3), [0x4a3018, 0xb88028], i + 10)); }
      for (let i = 0; i < 12; i++) { const x = -W / 2 + (W * i) / 12; c.wrap(x, 1, (xx) => stalagmite(c.b, M([xx, -0.5, hr(-18, -8, i, 4)]), hr(2, 4.5, i, 5), hr(0.5, 0.9, i, 6), i, [0x4a3420, 0xc8902e])); }
      stalactites(c, c.b, 16, H, -18, -8, CAVE.rock, 1.6, 7);
      if (mina) for (let i = 0; i < 4; i++) c.wrap(-W / 2 + (W * (i + 0.5)) / 4, 4, (xx) => beam(c.b, xx, -12, 6, 4));
    } }),
    layerScene(set, 3, { preset: pre, light: L, fog: { color: CAVE.fog[2], near: 56, far: 84 }, build: (c) => {
      const { W, H } = c;
      groundStrip(c, -10, 1, (x, z) => 0.25 * per(x, W, 6, z) - 0.4, (x) => mix(0x3a2814, 0x5a4020, 0.5 + 0.5 * per(x, W, 9)), soft());
      for (let i = 0; i < 2; i++) { const x = -W / 2 + (W * (i + 0.6)) / 2; c.wrap(x, 2.4, (xx) => column(c.b, xx, -6 + hr(-1, 1, i, 2), H + 2, hr(1.3, 1.7, i, 3), [0x4a3018, 0xd09a30], i + 20)); }
      for (let i = 0; i < 10; i++) { const x = -W / 2 + (W * (i + 0.25)) / 10; c.wrap(x, 1, (xx) => stalagmite(c.b, M([xx, -0.4, hr(-7, -2, i, 4)]), hr(1.2, 3, i, 5), hr(0.35, 0.6, i, 6), i + 30, [0x4a3420, 0xd8a038])); }
      stalactites(c, c.b, 14, H, -7, -2, [0x5a4020, 0xe0a840], 1.4, 17);
      // cristais âmbar com brilho
      for (let i = 0; i < 5; i++) { const x = -W / 2 + (W * (i + 0.1)) / 5; c.wrap(x, 1.2, (xx) => { for (let k = 0; k < 4; k++) c.b.add(crystalGeo(0.15, hr(0.6, 1.2, k, i)), vmat('crystal', 0xffffff, { emissive: 0xff9a20, emissiveIntensity: 0.6, flat: true }), M([xx + k * 0.2, -0.3, -3], [0, k * 40, (k - 1.5) * 18]), 0xffc060); glow(c, [xx + 0.3, 0.6, -2], 1.6, 0xffa030, 0.35); }); }
      if (mina) {
        for (let i = 0; i < 3; i++) c.wrap(-W / 2 + (W * (i + 0.3)) / 3, 3, (xx) => { beam(c.b, xx, -4, 5.5, 3.6); lamp(c, xx + 0.6, 3.4, -3.6, 1.6); });
        // trilhos ao fundo
        for (const z of [-5, -5.8]) c.b.add(new THREE.BoxGeometry(W + 2, 0.08, 0.08), vmat('metal', 0xffffff), M([0, -0.25, z]), 0x6a6a70);
        for (let i = 0; i < 40; i++) c.b.add(new THREE.BoxGeometry(0.2, 0.08, 1.2), vmat('wood', 0xffffff), M([-W / 2 + (W * i) / 40, -0.32, -5.4]), 0x4a3420);
      } else for (let i = 0; i < 4; i++) c.wrap(-W / 2 + (W * (i + 0.5)) / 4, 1, (xx) => lamp(c, xx, hr(1, 3, i, 9), -2.5, 1.8));
      motes(c, 50, { y0: 0, y1: H * 0.8, z0: -4, z1: -1 }, 0xffc060, 0.05, 4, 0.6);
    } }),
    layerScene(set, 4, { preset: pre, light: L, fog: { color: CAVE.fog[3], near: 58, far: 80 }, build: (c) => {
      const { W, H } = c;
      groundStrip(c, -4, 2, (x) => 0.3 * per(x, W, 4, 1) - 0.4, (x) => mix(0x2a1c10, 0x4a3018, 0.5 + 0.5 * per(x, W, 7)), soft());
      for (let i = 0; i < 6; i++) { const x = -W / 2 + (W * (i + 0.5)) / 6; c.wrap(x, 2, (xx) => { mossRock(c.b, M([xx, -0.4, -2]), [hr(1, 1.8, i, 1), hr(0.6, 1.2, i, 2), 1], 0x5a4028, null, i + 40); stalagmite(c.b, M([xx + 1.2, -0.4, -1.5]), hr(1.5, 2.6, i, 3), 0.45, i + 50, [0x3a2814, 0xb8802a]); }); }
      stalactites(c, c.b, 10, H, -2.5, -1, [0x3a2814, 0xb8802a], 1.8, 27);
      if (mina) {
        for (let i = 0; i < 2; i++) c.wrap(-W / 2 + (W * (i + 0.5)) / 2, 4, (xx) => {
          // carrinho tombado e pilha de minério
          c.b.add(new THREE.BoxGeometry(1.8, 0.9, 1.0), vmat('rust', 0xffffff), M([xx, 0.2, -1.4], [0, 20, 28]), 0x6a3a22);
          for (let k = 0; k < 6; k++) c.b.add(rockGeo([0.3, 0.2, 0.3], k, 1, { facet: true }), rockM(), M([xx + 1.2 + k * 0.25, -0.3 + (k % 2) * 0.15, -1.2]), k % 2 ? 0xd8a040 : 0x6a5038);
        });
      }
    } }),
    layerScene(set, 5, { preset: pre, light: { hemi: { i: 0.25 }, key: { i: 0.5 } }, build: (c) => {
      const { W, H } = c;
      const dark = 0x0a0604;
      for (let i = 0; i < 3; i++) {
        const x = -W / 2 + W * (0.1 + 0.36 * i);
        c.wrap(x, 3, (xx) => {
          c.b.add(coneGeo(1.2, hr(4, 6, i, 1), i), rockM(), M([xx, H + 0.6, 1], [180, 0, 0]), dark);
          c.b.add(coneGeo(0.6, 3, i + 3), rockM(), M([xx + 1.4, H + 0.6, 1.2], [180, 0, 0]), dark);
        });
      }
      for (let i = 0; i < 3; i++) c.wrap(-W / 2 + W * (0.28 + 0.33 * i), 3, (xx) => { mossRock(c.b, M([xx, -1.4, 1]), [2.2, 1.6, 1], dark, null, i + 60); stalagmite(c.b, M([xx + 1.3, -0.9, 1.2]), 2.6, 0.5, i, [dark, 0x1a1008]); });
    } }),
  ];
}

/* ================= PRAIA ================= */
function praia(): SceneDef[] {
  const pre = 'neutro' as const, L = { hemi: { i: 1.0 }, key: { color: 0xfff0d8, i: 2.5 } };
  const sea = (c: LayerCtx, z0: number, z1: number, y: number) => waterSurface(c, z0, z1, y, 0x1a6aa8, 0x5ac8d8);
  return [
    layerScene('praia', 1, { preset: pre, light: L, fog: { color: 0xc8e8f4, near: 60, far: 160 }, pitch: -3, build: (c) => {
      const { W } = c;
      sea(c, -60, 0, -0.5);
      // ilhas distantes e veleiro
      for (let i = 0; i < 3; i++) c.wrap(-W / 2 + W * (0.2 + 0.33 * i), 5, (xx) => { hill(c.nb, M([xx, -0.8, -50]), hr(6, 10, i, 1), hr(2, 3.5, i, 2), 0x6aa0a0, i); for (let k = 0; k < 3; k++) palm(c.nb, M([xx - 1 + k, 1.2, -48]), 2.4, { trunk: 0x6a8a8a, leaf: 0x5a9a8a }, k + i * 3); });
      c.wrap(4, 1.5, (xx) => {
        c.nb.add(new THREE.BoxGeometry(2, 0.4, 0.6), vmat('wood', 0xffffff), M([xx, -0.2, -30]), 0xf0f0f0);
        const sail = new THREE.Shape(); sail.moveTo(0, 0); sail.lineTo(1.4, 0); sail.lineTo(0, 2.6); sail.lineTo(0, 0);
        c.nb.add(new THREE.ShapeGeometry(sail), vmat('cloth', 0xffffff, { side: THREE.DoubleSide }), M([xx - 0.3, 0.1, -30]), 0xfff8f0);
      });
      for (let i = 0; i < 8; i++) { const x = -W / 2 + (W * (i + 0.5)) / 8; c.wrap(x, 3, (xx) => crown(c.nb, M([xx, hr(9, 14, i, 71), -58], [0, 0, 0], [1.8, 0.5, 0.6]), hr(1.6, 2.6, i, 72), [0xd8e8f0, 0xf0f8ff, 0xffffff], 80 + i, { lobes: 6, detail: 1 })); }
      glow(c, [-W * 0.25, 13, -60], 3.5, 0xfff4c0, 0.8);
    } }),
    layerScene('praia', 2, { preset: pre, light: L, fog: { color: 0xbce0ec, near: 62, far: 130 }, pitch: -6, build: (c) => {
      const { W } = c;
      sea(c, -30, -6, -0.4);
      // espuma das ondas quebrando e arrecifes
      for (let i = 0; i < 18; i++) { const x = -W / 2 + (W * i) / 18; c.wrap(x, 1.5, (xx) => c.nb.add(rockGeo([1.2, 0.12, 0.3], i, 1), vmat('rubber', 0xffffff, { rough: 1, rim: 0.5 }), M([xx, -0.3, hr(-14, -8, i, 2)]), 0xf8ffff)); }
      for (let i = 0; i < 4; i++) c.wrap(-W / 2 + (W * (i + 0.3)) / 4, 2, (xx) => mossRock(c.b, M([xx, -0.6, -12]), [1.6, 1, 1], 0x6a6a6a, 0x4a7a5a, i));
      groundStrip(c, -6, 1, (x, z) => -0.4 + 0.08 * (z + 6) + 0.1 * per(x, W, 3), (x, z) => mix(0xd8c49a, 0xf0e0b8, (z + 6) / 7), vmat('sand', 0xffffff, { rim: 0.1 }), 120, 10);
    } }),
    layerScene('praia', 3, { preset: pre, light: L, fog: { color: 0xb0d8e0, near: 56, far: 90 }, build: (c) => {
      const { W } = c;
      groundStrip(c, -9, 1, (x, z) => -0.2 + 0.25 * per(x, W, 2, 1) + 0.05 * z, () => col(0xe8d4a8), vmat('sand', 0xffffff, { rim: 0.1 }), 120, 10);
      for (let i = 0; i < 7; i++) { const x = -W / 2 + (W * (i + 0.4)) / 7; c.wrap(x, 4, (xx) => palm(c.b, M([xx, -0.1, hr(-7, -3, i, 2)]), hr(6, 9, i, 3), { trunk: 0x9a8460, leaf: 0x3a8a2a }, i + 60, { coconuts: true, lean: hr(-0.4, 0.4, i, 4) })); }
      for (let i = 0; i < 9; i++) { const x = -W / 2 + (W * i) / 9; c.wrap(x, 1.2, (xx) => bush(c.b, M([xx, -0.1, -2]), hr(0.6, 1, i, 5), [0x2a6a2a, 0x4a9a3a, 0x8ac050], i + 70)); }
    } }),
    layerScene('praia', 4, { preset: pre, light: L, fog: { color: 0x98c8d0, near: 58, far: 85 }, build: (c) => {
      const { W } = c;
      groundStrip(c, -4, 2, (x) => -0.25 + 0.2 * per(x, W, 3, 2), (x) => mix(0xe0c898, 0xf0dcb0, 0.5 + 0.5 * per(x, W, 5)), vmat('sand', 0xffffff, { rim: 0.1 }));
      for (let i = 0; i < 5; i++) { const x = -W / 2 + (W * (i + 0.5)) / 5; c.wrap(x, 2, (xx) => { mossRock(c.b, M([xx, -0.4, -2]), [1.3, 0.8, 0.9], 0x7a7068, 0x5a8a4a, i + 80); grassTuft(c.b, M([xx + 1.2, -0.25, -1.4]), 0.9, [0x7a9a3a, 0x9ab04a], i, 16); }); }
      for (let i = 0; i < 10; i++) c.wrap(-W / 2 + W * hash(i, 9), 0.3, (xx) => c.b.add(latheGeo([[0.001, 0], [0.18, 0.02], [0.2, 0.06], [0.12, 0.14], [0.001, 0.16]], 12), vmat('shell', 0xffffff), M([xx, -0.25, hr(-1.5, 1, i, 3)], [-20, i * 40, 0]), i % 2 ? 0xf8d8c0 : 0xf0b0a0));
    } }),
    layerScene('praia', 5, { preset: pre, light: { hemi: { i: 0.35 }, key: { i: 0.6 } }, build: (c) => {
      const { W, H } = c;
      const fg = 0x0e1a14;
      // coqueiro inclinado em silhueta entrando pela lateral e moitas de praia
      c.wrap(-0.42 * W, 6, (x) => palm(c.b, M([x, -1, 1.5]), 10, { trunk: fg, leaf: fg }, 3, { lean: 0.6, fronds: 10 }));
      for (let i = 0; i < 3; i++) c.wrap(-W / 2 + W * (0.3 + 0.28 * i), 2, (x) => { for (let k = 0; k < 6; k++) bigLeaf(c.b, M([x + (k - 2.5) * 0.3, -0.8, 1.2], [-20, (k - 2.5) * 30, (k - 2.5) * -10]), 1.8, 0.6, fg, i * 6 + k, { droop: 1, stem: 0.6 }); });
      void H;
      for (let i = 0; i < 4; i++) c.wrap(-W / 2 + W * (0.2 + 0.25 * i), 1.5, (x) => grassTuft(c.b, M([x, -0.8, 1.4]), 2, [fg, 0x16241a], i + 90, 18));
    } }),
  ];
}

/* ================= RECIFE e NAUFRÁGIO (subaquáticos) ================= */
function seaFloor(c: LayerCtx, z0: number, z1: number, colr: [number, number]) {
  groundStrip(c, z0, z1, (x, z) => 0.4 * per(x, c.W, 3, z * 0.4) + 0.15 * per(x, c.W, 8, z) - 0.4, (x, z) => mix(colr[0], colr[1], 0.5 + 0.5 * per(x, c.W, 5, z * 0.2)), vmat('sand', 0xffffff, { rim: 0.2 }));
}
function coralCluster(c: LayerCtx, x: number, z: number, s: number, seed: number, cols: number[]) {
  c.wrap(x, 2 * s, (xx) => {
    mossRock(c.b, M([xx, -0.4, z]), [1.2 * s, 0.7 * s, 0.9 * s], 0x8a6a6a, cols[0], seed);
    for (let k = 0; k < 4; k++) branchCoral({ b: c.b }, M([xx + (k - 1.5) * 0.6 * s, 0.1 * s, z + hr(-0.4, 0.4, k, seed)], [0, k * 50, 0], s * 2.4), 1, cols[(k + seed) % cols.length], seed + k);
    c.b.add(latheGeo([[0.6, 0], [0.62, 0.15], [0.45, 0.4], [0.001, 0.48]], 20, (p) => { p.y *= 1 + 0.05 * Math.sin(Math.atan2(p.z, p.x) * 11); }), vmat('coral', 0xffffff, { repeat: 4 }), M([xx + 0.9 * s, 0, z + 0.4], [0, 0, 0], s), cols[(seed + 2) % cols.length]);
    for (let k = 0; k < 3; k++) c.b.add(leafGeo(1.4 * s, 0.25 * s, { curl: 0.4, nu: 8, nv: 1, notch: 0.4 }), MAT.leaf(), M([xx - 1.0 * s + k * 0.15, 0, z + 0.2], [0, k * 60, (k - 1) * 12]), 0x4a8a5a);
  });
}

function underwater(set: 'recife' | 'naufragio'): SceneDef[] {
  const pre = 'recife' as const;
  const dark = set === 'naufragio';
  const fog = dark ? [0x06182a, 0x0a2236, 0x0c2a40, 0x0a2034] : [0x1a6a9a, 0x1e78a8, 0x2a88b4, 0x1a6a90];
  const L = dark ? { hemi: { i: 0.5 }, key: { i: 1.4, color: 0x9ad8ff } } : { hemi: { i: 0.8 }, key: { i: 2.2, color: 0xd8f4ff } };
  const cols = dark ? [0x5a4a6a, 0x6a5a5a, 0x4a6a6a, 0x7a5a4a] : [0xff7a5a, 0xf2a03a, 0xe0507a, 0xb070d0, 0xffd060];
  const sand: [number, number] = dark ? [0x2a3a40, 0x3a4a48] : [0xc8b890, 0xe0d0a8];
  const ship = (b: Batch, x: number, z: number, s: number, tilt: number, colr: number) => {
    const wd = vmat('wood', 0xffffff);
    const hull = latheGeo([[0.001, -1.2], [0.8, -0.9], [1.1, 0], [1.15, 0.8], [0.9, 1.1]], 14);
    b.add(hull, wd, M([x, 0.4 * s, z], [0, 0, 90 + tilt], [s, s * 3.4, s * 0.9]), colr);
    for (let k = 0; k < 7; k++) b.add(new THREE.BoxGeometry(0.15 * s, 1.4 * s, 0.05), wd, M([x - 3 * s + k * s, 1.0 * s, z + 1.02 * s], [0, 0, tilt + (k % 3) * 4]), mix(colr, 0x000000, 0.3));
    b.add(new THREE.CylinderGeometry(0.14 * s, 0.17 * s, 5 * s, 10), wd, M([x + 0.4 * s, 3.4 * s, z], [0, 0, tilt - 25]), colr);
    b.add(new THREE.CylinderGeometry(0.1 * s, 0.1 * s, 2.6 * s, 8), wd, M([x - 0.3 * s, 4.6 * s, z], [0, 0, tilt + 55]), colr);
    const sail = new THREE.PlaneGeometry(1.6 * s, 2 * s, 6, 6);
    const p = sail.getAttribute('position') as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) p.setZ(i, 0.2 * s * Math.sin(p.getX(i) * 2 + p.getY(i)));
    b.add(sail, vmat('cloth', 0xffffff, { side: THREE.DoubleSide, opacity: 0.85 }), M([x + 1.2 * s, 3.4 * s, z + 0.1], [0, 0, tilt - 20]), dark ? 0x6a6a5a : 0xb8b0a0);
  };
  return [
    layerScene(set, 1, { preset: pre, light: L, fog: { color: fog[0], near: 50, far: 110 }, build: (c) => {
      const { W, H } = c;
      seaFloor(c, -50, -10, sand);
      for (let i = 0; i < 8; i++) c.wrap(-W / 2 + (W * (i + 0.5)) / 8, 4, (xx) => hill(c.nb, M([xx, -1, -35 + hr(-6, 6, i, 1)]), hr(5, 9, i, 2), hr(2.5, 6, i, 3), dark ? 0x1a3040 : 0x3a6a7a, i));
      if (dark) c.wrap(-4, 8, (x) => ship(c.nb, x, -30, 1.6, 18, 0x2a3a40));
      beams(c, [0, 1, 2, 3, 4, 5].map((i) => ({ x: -W / 2 + (W * (i + 0.3)) / 6, y: H * 0.65, z: -20, w: 2.2 + (i % 3), h: H * 1.4, ang: -12 + (i % 2) * 6, op: dark ? 0.1 : 0.2 })), dark ? 0x5aa8d0 : 0xc8f4ff);
    } }),
    layerScene(set, 2, { preset: pre, light: L, fog: { color: fog[1], near: 55, far: 92 }, build: (c) => {
      const { W } = c;
      seaFloor(c, -24, 0, sand);
      for (let i = 0; i < 8; i++) coralCluster(c, -W / 2 + (W * (i + 0.5)) / 8, hr(-16, -8, i, 1), hr(0.9, 1.4, i, 2), i, cols);
      if (dark) c.wrap(3, 7, (x) => ship(c.b, x, -12, 1.4, -10, 0x3a3428));
      else for (let i = 0; i < 3; i++) fishSchool(c, -W / 2 + W * (0.2 + 0.3 * i), hr(4, 9, i, 3), -10, 12, [0xffd040, 0x40a0ff, 0xff7040][i], 0.25, i);
    } }),
    layerScene(set, 3, { preset: pre, light: L, fog: { color: fog[2], near: 56, far: 86 }, build: (c) => {
      const { W, H } = c;
      seaFloor(c, -10, 1, sand);
      for (let i = 0; i < 6; i++) coralCluster(c, -W / 2 + (W * (i + 0.2)) / 6, hr(-6, -3, i, 3), hr(1.2, 1.8, i, 4), i + 10, cols);
      // kelp alto
      for (let i = 0; i < 9; i++) {
        const x = -W / 2 + (W * (i + 0.7)) / 9;
        c.wrap(x, 1, (xx) => {
          const h = hr(6, H * 0.85, i, 5);
          const pts: V3[] = [];
          for (let k = 0; k <= 8; k++) { const t = k / 8; pts.push([xx + 0.6 * Math.sin(t * 4 + i), -0.4 + t * h, -4 + 0.3 * Math.sin(t * 3)]); }
          c.b.add(tubeGeo(pts, 0.06, 24, 5), MAT.leaf(), undefined, dark ? 0x2a4a3a : 0x5a7a2a);
          const cv = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)));
          for (let k = 1; k < 14; k++) { const p = cv.getPointAt(k / 14); c.b.add(leafGeo(1.0, 0.3, { curl: 0.6, nu: 6, nv: 1, notch: 0.3, seed: k }), MAT.leaf(), placeM(p, new THREE.Vector3(k % 2 ? 1 : -1, 1, 0.3), 0), dark ? 0x2a5040 : mix(0x4a8a3a, 0x9a9a3a, hash(k, i)).getHex()); }
        });
      }
      if (dark) {
        for (let i = 0; i < 4; i++) c.wrap(-W / 2 + W * (0.1 + 0.25 * i), 1.5, (xx) => { c.b.add(latheGeo([[0.42, 0], [0.5, 0.35], [0.52, 0.55], [0.5, 0.75], [0.42, 1.1]], 16), vmat('wood', 0xffffff), M([xx, 0.1, -3], [0, 0, 80]), 0x4a3a2a); });
        for (let i = 0; i < 5; i++) c.wrap(-W / 2 + W * hash(i, 8), 1, (xx) => glow(c, [xx, hr(2, H - 3, i, 9), -2], 0.5, 0x60ffd0, 0.6));
      } else fishSchool(c, 0, 6, -3, 18, 0xffa030, 0.35, 7);
      motes(c, 70, { y0: 0, y1: H, z0: -5, z1: -1 }, dark ? 0x80d0ff : 0xe0ffff, 0.06, 2, 0.5);
    } }),
    layerScene(set, 4, { preset: pre, light: L, fog: { color: fog[3], near: 58, far: 82 }, build: (c) => {
      const { W } = c;
      seaFloor(c, -4, 2, [mix(sand[0], 0x000000, 0.2).getHex(), sand[1]]);
      for (let i = 0; i < 4; i++) coralCluster(c, -W / 2 + (W * (i + 0.5)) / 4, -1.8, hr(1.6, 2.2, i, 6), i + 20, cols);
      for (let i = 0; i < 6; i++) c.wrap(-W / 2 + W * (0.08 + i / 6), 1, (xx) => mossRock(c.b, M([xx, -0.4, -1]), [0.8, 0.5, 0.6], dark ? 0x3a3a3a : 0x8a7a6a, dark ? 0x2a4a3a : 0x6a9a5a, i + 30));
      if (dark) c.wrap(W * 0.25, 3, (xx) => {
        // âncora gigante e corrente
        c.b.add(new THREE.BoxGeometry(0.3, 4, 0.2), vmat('rust', 0xffffff), M([xx, 1.8, -1.5], [0, 0, 14]), 0x3a2a24);
        c.b.add(tubeGeo([[xx - 1.6, 0.8, -1.5], [xx - 1, 0, -1.5], [xx + 1, 0, -1.5], [xx + 1.6, 0.8, -1.5]], 0.15, 20, 8), vmat('rust', 0xffffff), undefined, 0x3a2a24);
      });
    } }),
    layerScene(set, 5, { preset: pre, light: { hemi: { i: 0.3 }, key: { i: 0.6 } }, build: (c) => {
      const { W, H } = c;
      const fg = dark ? 0x020a12 : 0x06202e;
      for (let i = 0; i < 4; i++) {
        const x = -W / 2 + W * (0.12 + 0.25 * i);
        c.wrap(x, 2, (xx) => {
          for (let k = 0; k < 3; k++) {
            const pts: V3[] = [];
            const h = hr(4, 8, i * 3 + k, 1);
            for (let j = 0; j <= 6; j++) { const t = j / 6; pts.push([xx + k * 0.4 + 0.5 * Math.sin(t * 3 + k), -0.8 + t * h, 1.2]); }
            c.b.add(tubeGeo(pts, 0.08, 16, 5), MAT.leaf(), undefined, fg);
            const cv = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)));
            for (let j = 1; j < 9; j++) c.b.add(leafGeo(1.2, 0.35, { curl: 0.5, nu: 5, nv: 1 }), MAT.leaf(), placeM(cv.getPointAt(j / 9), new THREE.Vector3(j % 2 ? 1 : -1, 1, 0.2), 0), fg);
          }
        });
      }
      for (let i = 0; i < 2; i++) c.wrap(-W / 2 + W * (0.35 + 0.5 * i), 3, (xx) => mossRock(c.b, M([xx, -1.4, 1]), [2.2, 1.4, 1], fg, null, i + 40));
      void H;
    } }),
  ];
}

/* ================= FÁBRICA ================= */
function building(b: Batch, root: THREE.Object3D | null, x: number, z: number, w: number, h: number, colr: number, seed: number, lit = true) {
  b.add(new THREE.BoxGeometry(w, h, w * 0.6), vmat('rust', 0xffffff), M([x, h / 2 - 0.5, z]), colr);
  // telhado em serra
  for (let k = 0; k < Math.round(w / 1.2); k++) b.add(new THREE.CylinderGeometry(0.62, 0.62, w * 0.6, 3, 1), vmat('rust', 0xffffff), M([x - w / 2 + 0.6 + k * 1.2, h - 0.3, z], [90, 0, 0], [1, 1, 0.6]), mix(colr, 0x000000, 0.2));
  // janelas acesas
  const wm = vmat('glow', 0xffffff, { emissive: 0xffa040, emissiveIntensity: lit ? 0.9 : 0.1 });
  for (let r = 0; r < Math.floor(h / 1.4); r++) for (let k = 0; k < Math.floor(w / 0.9); k++) {
    if (hash(r * 7 + k, seed) < 0.35) continue;
    b.add(new THREE.PlaneGeometry(0.4, 0.55), wm, M([x - w / 2 + 0.5 + k * 0.9, 0.4 + r * 1.4, z + w * 0.3 + 0.01]), hash(r + k, seed + 1) < 0.5 ? 0xffd080 : 0xff8040);
  }
  void root;
}
function chimney(c: LayerCtx, b: Batch, x: number, z: number, h: number, r: number, colr: number, seed: number, smokeCol: number) {
  c.wrap(x, r * 2, (xx) => {
    b.add(latheGeo([[r * 1.2, 0], [r, 0.3], [r * 0.8, h], [r * 0.95, h + 0.1], [r * 0.95, h + 0.4], [r * 0.7, h + 0.4]], 14), vmat('stone', 0xffffff, { repeat: 3 }), M([xx, -0.5, z]), colr);
    for (let k = 0; k < 3; k++) b.add(new THREE.TorusGeometry(r * 0.85, 0.06, 6, 20), vmat('paint', 0xffffff), M([xx, h * (0.65 + k * 0.1), z], [90, 0, 0]), k % 2 ? 0xe0e0e0 : 0xc02a1a);
    const m = vmat('rubber', 0xffffff, { rough: 1, rim: 0.3, opacity: 0.85 });
    for (let i = 0; i < 6; i++) { const t = i / 5; c.nb.add(rockGeo([r * (1.2 + t * 2.5), r * (1 + t * 1.8), r * 1.2], seed + i, 2, { rough: 0.3 }), m, M([xx + t * t * 4, h + r * 2 + t * 5, z]), mix(smokeCol, 0x8a7a70, t * 0.5)); }
  });
}
function fabrica(): SceneDef[] {
  const pre = 'fabrica' as const, L = { hemi: { i: 0.7, sky: 0x9a7060 }, key: { i: 2.0, color: 0xffc8a0 }, fres: { color: 0xff8a50, strength: 0.7 } };
  return [
    layerScene('fabrica', 1, { preset: pre, light: L, fog: { color: 0x9a4a2a, near: 50, far: 120 }, pitch: -3, build: (c) => {
      const { W } = c;
      groundStrip(c, -50, 0, () => -0.4, () => col(0x3a2018), soft(), 20, 3);
      for (let i = 0; i < 10; i++) c.wrap(-W / 2 + (W * (i + 0.5)) / 10, 3, (xx) => building(c.nb, null, xx, -40 + hr(-4, 4, i, 1), hr(3, 5, i, 2), hr(3, 7, i, 3), 0x4a2a24, i));
      for (let i = 0; i < 6; i++) chimney(c, c.nb, -W / 2 + (W * (i + 0.3)) / 6, -36, hr(8, 12, i, 4), 0.5, 0x5a3028, i * 7, 0x3a2a28);
      glow(c, [W * 0.2, 9, -55], 5, 0xff7a30, 0.5);
    } }),
    layerScene('fabrica', 2, { preset: pre, light: L, fog: { color: 0x7a3a24, near: 55, far: 95 }, build: (c) => {
      const { W } = c;
      groundStrip(c, -24, 0, () => -0.5, () => col(0x2a1a14), soft(), 20, 3);
      for (let i = 0; i < 6; i++) c.wrap(-W / 2 + (W * (i + 0.5)) / 6, 4, (xx) => building(c.b, null, xx, -16 + hr(-3, 3, i, 1), hr(4, 6, i, 2), hr(5, 9, i, 3), 0x6a3a2a, i + 20));
      for (let i = 0; i < 4; i++) chimney(c, c.b, -W / 2 + (W * (i + 0.8)) / 4, -14, hr(10, 14, i, 4), 0.7, 0x7a3a2a, i * 5 + 40, 0x2a2020);
      // tanques esféricos
      for (let i = 0; i < 3; i++) c.wrap(-W / 2 + W * (0.2 + 0.33 * i), 2, (xx) => { c.b.add(new THREE.SphereGeometry(1.6, 20, 14), vmat('metal', 0xffffff, { rough: 0.4 }), M([xx, 2.2, -10]), 0x8a8a90); for (const s of [-1, 1]) c.b.add(new THREE.CylinderGeometry(0.12, 0.12, 2.2, 6), vmat('metal', 0xffffff), M([xx + s, 0.5, -10]), 0x4a4a4a); });
    } }),
    layerScene('fabrica', 3, { preset: pre, light: L, fog: { color: 0x5a2a1c, near: 56, far: 88 }, build: (c) => {
      const { W, H } = c;
      groundStrip(c, -10, 1, (x) => -0.4 + 0.1 * per(x, W, 6), () => col(0x3a2a24), vmat('rust', 0xffffff), 60, 6);
      // emaranhado de canos e passarelas
      for (let i = 0; i < 4; i++) { const y = 2 + i * 2.2; const z = -6 + (i % 2); c.b.add(tubeGeo([[-W / 2 - 1, y, z], [W / 2 + 1, y, z]], 0.25 + 0.08 * (i % 2), 4, 14), vmat('rust', 0xffffff), undefined, [0x7a4228, 0x5a6068, 0x8a3a24, 0x6a6a5a][i]); }
      for (let i = 0; i < 6; i++) c.wrap(-W / 2 + (W * (i + 0.5)) / 6, 0.5, (xx) => c.b.add(new THREE.BoxGeometry(0.3, H + 2, 0.3), vmat('metal', 0xffffff), M([xx, H / 2, -6.5]), 0x3a3a40));
      for (let i = 0; i < 4; i++) c.wrap(-W / 2 + (W * (i + 0.2)) / 4, 2.5, (xx) => gear(c.b, M([xx, hr(3, 8, i, 2), -5], [0, 10, i * 12]), hr(1.2, 2, i, 3), 12 + i * 2, 0x6a4030));
      c.b.add(new THREE.BoxGeometry(W + 2, 0.15, 1.5), vmat('metal', 0xffffff), M([0, 5.2, -4]), 0x4a4a50);
      for (let i = 0; i < 60; i++) c.b.add(new THREE.BoxGeometry(0.04, 0.9, 0.04), vmat('metal', 0xffffff), M([-W / 2 + (W * i) / 60, 5.7, -3.3]), 0x5a5a60);
      c.b.add(new THREE.BoxGeometry(W + 2, 0.06, 0.06), vmat('paint', 0xffffff), M([0, 6.15, -3.3]), 0xe0a820);
      for (let i = 0; i < 6; i++) c.wrap(-W / 2 + W * hash(i, 5), 1, (xx) => glow(c, [xx, hr(1, H - 2, i, 6), -3], 1.2, 0xff6020, 0.3));
      motes(c, 40, { y0: 0, y1: H, z0: -4, z1: -1 }, 0xff8a40, 0.05, 5, 0.6);
    } }),
    layerScene('fabrica', 4, { preset: pre, light: L, fog: { color: 0x3a1a12, near: 58, far: 84 }, build: (c) => {
      const { W } = c;
      groundStrip(c, -4, 2, (x) => -0.35 + 0.05 * per(x, W, 9), () => col(0x2a1e1a), vmat('rust', 0xffffff), 60, 6);
      for (let i = 0; i < 5; i++) c.wrap(-W / 2 + (W * (i + 0.5)) / 5, 2, (xx) => {
        c.b.add(latheGeo([[0.6, 0], [0.6, 1.8], [0.55, 1.85], [0.001, 1.85]], 18), vmat('rust', 0xffffff), M([xx, -0.4, -2]), [0x2a4a7a, 0x8a2a1e, 0x4a4a40][i % 3]);
        c.b.add(new THREE.BoxGeometry(1.6, 1.2, 1.2), vmat('rust', 0xffffff), M([xx + 1.6, 0.2, -2.2], [0, 15, 0]), 0x5a6068);
        stump(c.b, M([xx - 1.6, -0.35, -1.6]), 0.5, 0.45, 0x4a3a2a, i);
      });
    } }),
    layerScene('fabrica', 5, { preset: pre, light: { hemi: { i: 0.25 }, key: { i: 0.5 } }, build: (c) => {
      const { W, H } = c;
      const fg = 0x0e0806;
      c.b.add(tubeGeo([[-W / 2 - 1, H - 0.6, 1.5], [W / 2 + 1, H - 0.6, 1.5]], 0.5, 4, 16), vmat('rust', 0xffffff), undefined, fg);
      for (let i = 0; i < 3; i++) c.wrap(-W / 2 + W * (0.15 + 0.33 * i), 1, (xx) => { for (let k = 0; k < 12; k++) { const g = new THREE.TorusGeometry(0.16, 0.05, 6, 12); g.scale(1, 1.5, 1); c.b.add(g, vmat('metal', 0xffffff), M([xx, H - 1 - k * 0.42, 1.4], [0, k % 2 ? 90 : 0, 0]), fg); } });
      for (let i = 0; i < 2; i++) c.wrap(-W / 2 + W * (0.32 + 0.5 * i), 3, (xx) => { c.b.add(new THREE.BoxGeometry(2.4, 1.6, 1), vmat('rust', 0xffffff), M([xx, -0.4, 1.3], [0, 0, 6]), fg); gear(c.b, M([xx + 1.6, 0.2, 1.4]), 1.2, 12, fg); });
    } }),
  ];
}

/* ================= CRISTAL ================= */
function crystalCluster(b: Batch, x: number, y: number, z: number, s: number, seed: number, cols: number[], down = false) {
  for (let k = 0; k < 6; k++) {
    const h = s * hr(0.5, 1.4, k, seed), r = h * 0.18;
    b.add(crystalGeo(r, h), crystalMat(cols[(k + seed) % cols.length], 0.35), M([x + hr(-0.5, 0.5, k, seed + 1) * s, y, z + hr(-0.3, 0.3, k, seed + 2) * s], [down ? 180 : 0, k * 47, hr(-30, 30, k, seed + 3)]), cols[(k + seed) % cols.length]);
  }
}
function cristal(): SceneDef[] {
  const pre = 'bonus' as const, L = { hemi: { i: 0.7 } };
  const cols = [0xb050ff, 0x7a30e0, 0xe050c0, 0x5080ff, 0xd090ff];
  return [
    layerScene('cristal', 1, { preset: pre, light: L, fog: { color: 0x2a0e4a, near: 50, far: 110 }, build: (c) => {
      caveWall(c, -40, [0x12061e, 0x2a1240, 0x4a2a70], 3, 2.5);
      for (let i = 0; i < 12; i++) c.wrap(-c.W / 2 + c.W * hash(i, 2), 2, (xx) => { const y = hr(1, c.H - 1, i, 3); crystalCluster(c.nb, xx, y, -34, hr(1.5, 3, i, 4), i, cols, y > c.H / 2); glow(c, [xx, y + 1, -30], hr(2, 3.5, i, 5), cols[i % 5], 0.3); });
    } }),
    layerScene('cristal', 2, { preset: pre, light: L, fog: { color: 0x3a145e, near: 55, far: 92 }, build: (c) => {
      const { W, H } = c;
      groundStrip(c, -24, 0, (x, z) => 0.3 * per(x, W, 5, z * 0.3) - 0.5, () => col(0x2a1440), soft(), 100, 8);
      for (let i = 0; i < 8; i++) c.wrap(-W / 2 + (W * (i + 0.5)) / 8, 2, (xx) => crystalCluster(c.b, xx, -0.5, -14 + hr(-4, 4, i, 1), hr(2.5, 4.5, i, 2), i + 10, cols));
      for (let i = 0; i < 8; i++) c.wrap(-W / 2 + (W * (i + 0.1)) / 8, 2, (xx) => crystalCluster(c.b, xx, H + 0.4, -14 + hr(-4, 4, i, 3), hr(2, 3.5, i, 4), i + 20, cols, true));
    } }),
    layerScene('cristal', 3, { preset: pre, light: L, fog: { color: 0x4a1a70, near: 56, far: 86 }, build: (c) => {
      const { W, H } = c;
      groundStrip(c, -10, 1, (x) => 0.2 * per(x, W, 6) - 0.4, (x) => mix(0x2a1440, 0x4a2a6a, 0.5 + 0.5 * per(x, W, 9)), soft());
      for (let i = 0; i < 5; i++) c.wrap(-W / 2 + (W * (i + 0.4)) / 5, 1.6, (xx) => { column(c.b, xx, -6, H + 2, 1.2, [0x2a1240, 0x6a3aa0], i); crystalCluster(c.b, xx + 1, -0.4, -5, 2, i + 30, cols); glow(c, [xx + 1, 1.4, -3], 2, 0xc070ff, 0.35); });
      for (let i = 0; i < 12; i++) c.wrap(-W / 2 + W * hash(i, 7), 0.6, (xx) => { const y = hr(2, H - 2, i, 8); c.b.add(crystalGeo(0.2, 0.7), crystalMat(cols[i % 5], 0.6), M([xx, y, -3], [i * 30, i * 40, i * 50]), cols[i % 5]); glow(c, [xx, y + 0.3, -2.5], 0.6, cols[i % 5], 0.5); });
      motes(c, 60, { y0: 0, y1: H, z0: -4, z1: -1 }, 0xf0c0ff, 0.05, 6, 0.7);
    } }),
    layerScene('cristal', 4, { preset: pre, light: L, fog: { color: 0x2a0e44, near: 58, far: 82 }, build: (c) => {
      const { W } = c;
      groundStrip(c, -4, 2, (x) => 0.25 * per(x, W, 4) - 0.4, () => col(0x1e0c30), soft());
      for (let i = 0; i < 5; i++) c.wrap(-W / 2 + (W * (i + 0.5)) / 5, 2, (xx) => { mossRock(c.b, M([xx, -0.4, -2]), [1.4, 0.8, 1], 0x3a1a5a, null, i); crystalCluster(c.b, xx + 0.5, 0, -1.8, 1.8, i + 40, cols); });
    } }),
    layerScene('cristal', 5, { preset: pre, light: { hemi: { i: 0.3 }, key: { i: 0.5 } }, build: (c) => {
      const { W, H } = c;
      const fg = [0x12061e, 0x1e0a30];
      for (let i = 0; i < 3; i++) c.wrap(-W / 2 + W * (0.1 + 0.35 * i), 2, (xx) => crystalCluster(c.b, xx, H + 0.6, 1, 4, i + 50, fg, true));
      for (let i = 0; i < 3; i++) c.wrap(-W / 2 + W * (0.28 + 0.33 * i), 2, (xx) => { mossRock(c.b, M([xx, -1.3, 1]), [2, 1.3, 1], fg[0], null, i + 60); crystalCluster(c.b, xx + 1, -0.6, 1.2, 2.6, i + 70, fg); });
    } }),
  ];
}

/* ================= COPA (acima das nuvens) ================= */
function cloudSea(c: LayerCtx, b: Batch, z0: number, z1: number, y: number, n: number, cols: [number, number, number], seed: number, s = 1) {
  for (let i = 0; i < n; i++) {
    const x = -c.W / 2 + (c.W * (i + hash(i, seed) * 0.5)) / n;
    c.wrap(x, 3 * s, (xx) => crown(b, M([xx, y + hr(-0.6, 0.6, i, seed + 1), hr(z0, z1, i, seed + 2)], [0, 0, 0], [1.6, 0.6, 1]), hr(1.6, 2.6, i, seed + 3) * s, cols, seed + i, { lobes: 6, detail: 2 }));
  }
}
function copa(): SceneDef[] {
  const pre = 'selva' as const, L = { hemi: { i: 1.0 } };
  const cloud: [number, number, number] = [0xc8d8e8, 0xeef6ff, 0xffffff];
  const leaf: [number, number, number] = [0x2c5e2a, 0x4a8a34, 0x86c050];
  const branch = (b: Batch, pts: V3[], r: number, colr: number) => b.add(tubeGeo(pts, (t) => r * (1 - t * 0.6), 30, 12), MAT.bark(), undefined, colr);
  return [
    layerScene('copa', 1, { preset: pre, light: L, fog: { color: 0xc8e4f8, near: 50, far: 130 }, pitch: -6, build: (c) => {
      cloudSea(c, c.nb, -60, -30, 0, 22, cloud, 1, 1.4);
      // copas de outras sumaúmas furando as nuvens
      for (let i = 0; i < 4; i++) c.wrap(-c.W / 2 + c.W * (0.15 + 0.27 * i), 4, (xx) => crown(c.nb, M([xx, 2.2, -45], [0, 0, 0], [1.8, 0.5, 1]), 2.2, [0x5a8a7a, 0x7aa890, 0xa8d0b0], i + 5));
      glow(c, [-c.W * 0.2, 13, -60], 3.5, 0xfff8d8, 0.8);
      for (let i = 0; i < 5; i++) c.wrap(-c.W / 2 + (c.W * (i + 0.5)) / 5, 3, (xx) => crown(c.nb, M([xx, hr(10, 15, i, 9), -65], [0, 0, 0], [2, 0.4, 0.6]), 2, cloud, i + 40, { lobes: 6, detail: 1 }));
    } }),
    layerScene('copa', 2, { preset: pre, light: L, fog: { color: 0xd8ecf8, near: 55, far: 100 }, build: (c) => {
      cloudSea(c, c.b, -26, -12, 0.4, 16, cloud, 3, 1.2);
      for (let i = 0; i < 3; i++) c.wrap(-c.W / 2 + c.W * (0.2 + 0.33 * i), 6, (xx) => {
        branch(c.b, [[xx - 5, 2, -18], [xx - 2, 3.4, -18], [xx + 1, 4.2, -18.5], [xx + 4, 4.8, -19]], 0.6, 0x9a8a72);
        for (let k = 0; k < 4; k++) crown(c.b, M([xx - 2 + k * 2, 5 + hr(-0.5, 0.8, k, i), -18.5]), hr(1.2, 1.8, k, i + 3), leaf, k + i * 4);
      });
    } }),
    layerScene('copa', 3, { preset: pre, light: L, fog: { color: 0xc8e4f0, near: 56, far: 90 }, build: (c) => {
      const { W, H } = c;
      cloudSea(c, c.b, -9, -5, -0.6, 10, cloud, 5, 1);
      for (let i = 0; i < 2; i++) c.wrap(-W / 2 + W * (0.25 + 0.5 * i), 9, (xx) => {
        branch(c.b, [[xx - 8, 1, -6], [xx - 4, 2.6, -6], [xx, 3.6, -6.4], [xx + 4, 5.2, -6.6], [xx + 7, 7.4, -7]], 0.9, 0xa89880);
        branch(c.b, [[xx - 1, 3.4, -6.3], [xx + 0.5, 6, -6.5], [xx + 2, 8.5, -6.6]], 0.4, 0xa89880);
        for (let k = 0; k < 5; k++) crown(c.b, M([xx - 5 + k * 3, hr(3, 8, k, i), -6.6]), hr(1.4, 2.2, k, i + 5), leaf, k + 20 + i * 5);
        for (let k = 0; k < 6; k++) c.b.add(latheGeo([[0.001, 0], [0.12, 0.05], [0.16, 0.25], [0.1, 0.3]], 10), MAT.plastic(), M([xx - 4 + k * 1.5, 3 + k * 0.6, -5.8]), 0xf0d8e0);
      });
      for (let i = 0; i < 6; i++) c.wrap(-W / 2 + (W * (i + 0.5)) / 6, 1, (xx) => hangingVine(c.b, M([xx, H + 0.5, -5]), hr(3, 6, i, 3), 0x6a8a3a, leaf[1], i, 0.05));
      motes(c, 40, { y0: 0, y1: H, z0: -5, z1: -1 }, 0xfff8e0, 0.08, 7, 0.6);
    } }),
    layerScene('copa', 4, { preset: pre, light: L, fog: { color: 0xa8d0c8, near: 58, far: 86 }, build: (c) => {
      const { W } = c;
      cloudSea(c, c.b, -3, -1.5, -1.2, 8, cloud, 9, 0.8);
      for (let i = 0; i < 4; i++) c.wrap(-W / 2 + (W * (i + 0.5)) / 4, 3, (xx) => {
        for (let k = 0; k < 5; k++) bigLeaf(c.b, M([xx + (k - 2) * 0.4, 0, -1.6], [-hr(15, 40, k, i), (k - 2) * 30, 0]), 2.2, 0.9, mix(leaf[1], leaf[2], k / 5).getHex(), k + i, { droop: 1.2, stem: 0.6 });
        c.b.add(latheGeo([[0.001, 0.4], [0.5, 0.42], [0.55, 0.6], [0.45, 0.62]], 16), MAT.bark(), M([xx + 1.6, 0, -1.4]), 0x8a6a40);
      });
    } }),
    layerScene('copa', 5, { preset: pre, light: { hemi: { i: 0.35 }, key: { i: 0.6 } }, build: (c) => {
      mataFront(c, { ...PAL_DIA, fg: 0x0c2010 });
    } }),
  ];
}

export const OTHER_PARALLAX: SceneDef[] = [
  ...serraria(), ...rio(), ...caveLayers('gruta'), ...caveLayers('mina'), ...praia(),
  ...underwater('recife'), ...underwater('naufragio'), ...fabrica(), ...cristal(), ...copa(),
];
