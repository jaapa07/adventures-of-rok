/**
 * Mapa da Ilha Sumaúma em perspectiva aérea (2560×1440): versão devastada, versão renascida e
 * quatro sobreposições "região renascida" (fundo transparente) para a transição incremental.
 */
import * as THREE from 'three';
import type { SceneDef } from '../types';
import { Batch, hash, hr, mix, M, vmat, tuneLights } from '../lib/core';
import { latheGeo, rockGeo, tubeGeo, trunkGeo } from '../lib/kit';
import { crown, palm, stump, kapok, MAT } from '../lib/flora';
import { MAP_SIZE, TREE_POS, TREE_H, height, shore, regionWeight, mapCamera } from './layout';
import { glow } from '../parallax/common';

type State = 'devastada' | 'renascida';
type Reg = 0 | 1 | 2 | 3 | 4;

function regionOf(x: number, z: number): Reg {
  let best: Reg = 0, bw = 0.35;
  for (const r of [1, 2, 3, 4] as const) { const w = regionWeight(r, x, z); if (w > bw) { bw = w; best = r; } }
  return best;
}

/** Cor do terreno por estado e região (com altitude e litoral). */
function groundColor(x: number, z: number, y: number, st: State) {
  const s = shore(x, z);
  const sand = new THREE.Color(0xe8d4a0);
  const greens = { lush: new THREE.Color(0x3f8a2e), dry: new THREE.Color(0x8a7a4a) };
  const w = [0, 1, 2, 3, 4].map((r) => (r === 0 ? 0 : regionWeight(r as 1 | 2 | 3 | 4, x, z)));
  const reb = st === 'renascida';
  const c1 = reb ? mix(0x2e7a26, 0x5aa83a, 0.5 + 0.5 * Math.sin(x * 2 + z)) : mix(0x7a5a3a, 0x9a7a52, 0.5 + 0.5 * Math.sin(x * 3 + z * 2));
  const c2 = reb ? mix(0x6a7a4a, 0x9a8a5a, Math.min(1, y / 2.6)).lerp(new THREE.Color(0x4a8a3a), Math.max(0, 1 - y / 1.4) * 0.6) : mix(0x5a5048, 0x8a8478, Math.min(1, y / 2.6));
  const c3 = reb ? mix(0x5aa040, 0xe8d4a0, Math.max(0, 1 - s * 6)) : mix(0x8a8a70, 0xb8b090, Math.max(0, 1 - s * 6));
  const c4 = reb ? mix(0x4a8a34, 0x6a9a3a, 0.5 + 0.5 * Math.sin(x * 4)) : mix(0x4a3a30, 0x6a4a34, 0.5 + 0.5 * Math.sin(x * 5 + z * 3));
  let c = greens.lush.clone().multiplyScalar(reb ? 1 : 0.9);
  if (!reb) c = mix(0x5a7a34, 0x6a8a3a, 0.5);
  const tot = w[1] + w[2] + w[3] + w[4];
  if (tot > 0.001) {
    const mixC = new THREE.Color(0, 0, 0).add(c1.clone().multiplyScalar(w[1])).add(c2.clone().multiplyScalar(w[2])).add(c3.clone().multiplyScalar(w[3])).add(c4.clone().multiplyScalar(w[4])).multiplyScalar(1 / tot);
    c.lerp(mixC, Math.min(1, tot));
  }
  // praia em volta
  if (s < 0.06) c.lerp(sand, 1 - s / 0.06);
  if (s < 0) c.copy(new THREE.Color(0xc8b080));
  void greens;
  return c;
}

/** Terreno com cor por vértice; `alphaRegion` gera alfa pelo peso da região (sobreposição). */
function terrain(st: State, alphaRegion?: 1 | 2 | 3 | 4) {
  const nx = 320, nz = 230, X = 13, Z = 9;
  const pos: number[] = [], cl: number[] = [], idx: number[] = [];
  for (let j = 0; j <= nz; j++) for (let i = 0; i <= nx; i++) {
    const x = -X + 2 * X * (i / nx), z = -Z + 2 * Z * (j / nz);
    const y = height(x, z);
    pos.push(x, y, z);
    const c = groundColor(x, z, y, st);
    if (alphaRegion) cl.push(c.r, c.g, c.b, shore(x, z) > -0.01 ? regionWeight(alphaRegion, x, z) : 0);
    else cl.push(c.r, c.g, c.b);
  }
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) { const a = j * (nx + 1) + i; idx.push(a, a + nx + 1, a + nx + 2, a, a + nx + 2, a + 1); }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(cl, alphaRegion ? 4 : 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  const m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, transparent: !!alphaRegion });
  const mesh = new THREE.Mesh(g, m);
  mesh.receiveShadow = true;
  mesh.castShadow = true;
  return mesh;
}

function sea() {
  const g = new THREE.PlaneGeometry(120, 80, 240, 160);
  g.rotateX(-Math.PI / 2);
  const p = g.getAttribute('position') as THREE.BufferAttribute;
  const c = new Float32Array(p.count * 3);
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), z = p.getZ(i);
    const s = shore(x, z);
    const t = Math.max(0, Math.min(1, (s + 0.5) / 0.5));
    const cc = mix(0x0e4a8a, 0x2ab8c8, t * t).lerp(new THREE.Color(0xe8fff8), Math.max(0, 1 - Math.abs(s + 0.02) / 0.02) * 0.6);
    c.set([cc.r, cc.g, cc.b], i * 3);
    p.setY(i, -0.12);
  }
  g.setAttribute('color', new THREE.BufferAttribute(c, 3));
  g.computeVertexNormals();
  const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85, metalness: 0 }));
  m.receiveShadow = false;
  return m;
}

/** Objetos (árvores, rochas, fábrica…) de uma região num estado. */
function props(b: Batch, root: THREE.Group, st: State, only?: Reg) {
  const reb = st === 'renascida';
  const step = 0.3;
  for (let gx = -12; gx <= 12; gx += step) for (let gz = -8.5; gz <= 8.5; gz += step) {
    const k = Math.round(gx * 100 + gz * 7);
    const x = gx + hr(-0.12, 0.12, k, 1), z = gz + hr(-0.12, 0.12, k, 2);
    const s = shore(x, z);
    if (s < 0.06) continue;
    const r = regionOf(x, z);
    if (only !== undefined && r !== only) continue;
    if (Math.hypot(x - TREE_POS[0], z - TREE_POS[1]) < 1.5) continue;
    const y = height(x, z);
    const h = hash(k, 3);
    if (r === 1 || (r === 0 && only === undefined)) {
      if (reb || r === 0) { if (h < 0.75) crown(b, M([x, y + 0.15, z]), hr(0.16, 0.24, k, 4), [0x1e5a1e, 0x3a8a2a, 0x7ac04a], k, { lobes: 3, detail: 1 }); }
      else if (h < 0.22) stump(b, M([x, y, z], [0, 0, 0], 0.18), 0.4, 0.3, 0x5a4030, k);
      else if (h < 0.3) b.add(trunkGeo(0.5, 0.03, 0.02, k), MAT.bark(), M([x, y, z]), 0x4a3a2a);
    } else if (r === 2) {
      if (y > 1.8) continue;
      if (h < (reb ? 0.45 : 0.08)) crown(b, M([x, y + 0.1, z]), hr(0.12, 0.2, k, 4), reb ? [0x2a5a2a, 0x4a8a3a, 0x8ab84a] : [0x4a4a3a, 0x6a6a4a, 0x8a8a60], k, { lobes: 3, detail: 1 });
      else if (h > 0.9) b.add(rockGeo([0.12, 0.1, 0.12], k, 1), MAT.rock(), M([x, y, z]), 0x8a7a68);
    } else if (r === 3) {
      if (s < 0.12) { if (h < (reb ? 0.3 : 0.12)) palm(b, M([x, y, z], [0, 0, 0], 0.11), 4, { trunk: 0x9a8460, leaf: reb ? 0x3a8a2a : 0x6a6a3a }, k, { fronds: 6 }); }
      else if (h < (reb ? 0.6 : 0.1)) crown(b, M([x, y + 0.1, z]), hr(0.14, 0.22, k, 4), reb ? [0x2a6a2a, 0x4a9a3a, 0x9ac850] : [0x5a5a40, 0x7a7a50, 0x9a9a6a], k, { lobes: 3, detail: 1 });
    } else if (r === 4) {
      if (reb) { if (h < 0.55) crown(b, M([x, y + 0.12, z]), hr(0.14, 0.22, k, 4), [0x2a5a20, 0x4a8a30, 0x8ac050], k, { lobes: 3, detail: 1 }); }
      else if (h < 0.15) stump(b, M([x, y, z], [0, 0, 0], 0.16), 0.4, 0.3, 0x4a3a2a, k);
    }
  }
  // marcos autorais de cada região
  const inR = (r: Reg) => only === undefined || only === r;
  if (inR(1)) {
    // rio da mata com cachoeira descendo da serra
    const river: [number, number][] = [[-4.6, -1.8], [-5.0, -0.6], [-5.8, 0.6], [-6.6, 1.8], [-7.3, 2.9], [-7.9, 3.9]];
    const cv = new THREE.CatmullRomCurve3(river.map(([x, z]) => new THREE.Vector3(x, 0, z)));
    const rp: number[] = [], ri: number[] = [];
    const N = 80;
    for (let i = 0; i <= N; i++) {
      const p = cv.getPointAt(i / N), t = cv.getTangentAt(i / N);
      const nx = -t.z, nz = t.x, w = 0.08 + 0.1 * (i / N);
      for (const sg of [-1, 1]) { const x = p.x + nx * w * sg, z = p.z + nz * w * sg; rp.push(x, Math.max(-0.1, height(x, z)) + 0.035, z); }
      if (i < N) { const a = i * 2; ri.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
    }
    const rg = new THREE.BufferGeometry();
    rg.setAttribute('position', new THREE.Float32BufferAttribute(rp, 3));
    rg.setIndex(ri);
    rg.computeVertexNormals();
    b.add(rg, vmat('plastic', 0xffffff, { rough: 0.15, side: THREE.DoubleSide }), undefined, reb ? 0x3aa0d0 : 0x6a7a6a);
    if (!reb) for (let i = 0; i < 4; i++) b.add(new THREE.BoxGeometry(0.5, 0.2, 0.3), vmat('wood', 0xffffff), M([-7.2 + i * 0.4, height(-7.2 + i * 0.4, 0.4) + 0.1, 0.4]), 0x7a5a3a);
    // serraria (devastada) / clareira com vila dos bichos (renascida)
    const sx = -7.4, sz = 1.0, sy = height(sx, sz);
    if (!reb) {
      b.add(new THREE.BoxGeometry(0.9, 0.4, 0.6), vmat('wood', 0xffffff), M([sx, sy + 0.2, sz]), 0x6a4a30);
      b.add(new THREE.BoxGeometry(1.0, 0.06, 0.7), vmat('rust', 0xffffff), M([sx, sy + 0.45, sz], [0, 0, 8]), 0x8a3a2a);
      for (let i = 0; i < 3; i++) b.add(trunkGeo(0.8, 0.05, 0.05, i), MAT.bark(), M([sx + 0.7, sy + 0.05 + i * 0.1, sz + 0.2], [0, 0, 90]), 0x6a4a30);
    } else for (let i = 0; i < 3; i++) b.add(latheGeo([[0.18, 0], [0.18, 0.15], [0.22, 0.15], [0.001, 0.4]], 10), MAT.wood(), M([sx + i * 0.35, sy, sz + (i % 2) * 0.25]), 0xb08a5a);
  }
  if (inR(2)) {
    // bocas de gruta com brilho âmbar
    for (const [x, z] of [[-6.2, -1.9], [-4.6, -3.1], [-2.7, -3.9], [-1.0, -4.7]]) {
      const y = height(x, z);
      b.add(new THREE.SphereGeometry(0.22, 12, 8, 0, Math.PI), vmat('rubber', 0xffffff, { rough: 1, rim: 0 }), M([x, y + 0.05, z + 0.12], [0, 0, 0], [1, 1.2, 0.5]), 0x140a04);
      glow(root, [x, y + 0.2, z + 0.3], reb ? 0.35 : 0.25, 0xffa030, 0.6);
    }
    if (!reb) for (let i = 0; i < 3; i++) b.add(new THREE.BoxGeometry(0.3, 0.3, 0.3), vmat('rust', 0xffffff), M([-3.6 + i * 0.5, height(-3.6 + i * 0.5, -2.2) + 0.15, -2.2]), 0x7a6a40);
  }
  if (inR(3)) {
    // navio naufragado na enseada e barco de pesca
    const hull = latheGeo([[0.001, -0.6], [0.4, -0.45], [0.55, 0], [0.55, 0.4], [0.45, 0.55]], 10);
    b.add(hull, MAT.wood(), M([5.4, -0.15, -6.0], [0, 20, 80], [0.5, 1.2, 0.4]), 0x4a3424);
    b.add(new THREE.CylinderGeometry(0.03, 0.03, 1.2, 6), MAT.wood(), M([5.4, 0.3, -6.0], [0, 0, 25]), 0x4a3424);
    if (!reb) for (let i = 0; i < 5; i++) b.add(new THREE.CircleGeometry(0.4, 16), vmat('plastic', 0xffffff, { rough: 0.2 }), M([4.4 + i * 0.5, -0.08, -5.4 - (i % 2) * 0.4], [-90, 0, 0], [1, 0.6, 1]), 0x1a1612);
    else for (let i = 0; i < 9; i++) b.add(new THREE.SphereGeometry(0.12, 8, 6), MAT.plastic(), M([4.0 + i * 0.35, -0.12, -5.8 + Math.sin(i) * 0.4], [0, 0, 0], [1, 0.4, 1]), [0xff7a5a, 0xf2a03a, 0xe0507a, 0xb070d0][i % 4]);
  }
  if (inR(4)) {
    // complexo da Fábrica Javarda (renascida: tomada por cipós e sem fumaça)
    const fx = 5.4, fz = 1.6, fy = height(fx, fz);
    const wall = reb ? 0x6a6a5a : 0x5a3a2e;
    for (const [dx, dz, w, h] of [[0, 0, 1.6, 0.8], [1.2, 0.8, 1.0, 0.6], [-1.0, 0.9, 0.8, 0.5]] as [number, number, number, number][]) {
      b.add(new THREE.BoxGeometry(w, h, w * 0.7), vmat('rust', 0xffffff), M([fx + dx, fy + h / 2, fz + dz]), wall);
      if (reb) crown(b, M([fx + dx, fy + h + 0.05, fz + dz], [0, 0, 0], [1.2, 0.4, 1]), w * 0.4, [0x2a5a20, 0x4a8a30, 0x8ac050], Math.round(dx * 10 + 50));
    }
    for (let i = 0; i < 3; i++) {
      const cx = fx - 0.5 + i * 0.6, cz = fz - 0.3;
      b.add(latheGeo([[0.12, 0], [0.09, 1.6], [0.11, 1.65], [0.11, 1.75]], 10), vmat('stone', 0xffffff), M([cx, fy, cz]), reb ? 0x8a7a6a : 0x7a3a2a);
      if (!reb) for (let k = 0; k < 4; k++) b.add(rockGeo([0.14 + k * 0.08, 0.1 + k * 0.05, 0.14], k + i, 1), vmat('rubber', 0xffffff, { rough: 1, rim: 0.2, opacity: 0.85 }), M([cx + k * k * 0.08, fy + 1.9 + k * 0.25, cz]), mix(0x3a3030, 0x8a8078, k / 4).getHex());
      else crown(b, M([cx, fy + 1.0, cz]), 0.14, [0x2a6a20, 0x4a9a30, 0x9ad050], i + 70);
    }
  }
}

/** Sumaúma gigante central (desfolhada na versão devastada). */
function giantTree(b: Batch, st: State) {
  const [x, z] = TREE_POS;
  const y = height(x, z) - 0.1;
  const reb = st === 'renascida';
  kapok(b, M([x, y, z]), TREE_H, { bark: 0xb8a890, leaf: reb ? [0x2a6a2a, 0x4a9a3a, 0x9ad060] : [0x6a5a3a, 0x8a7a4a, 0xa89a6a] }, 3, { branches: 7, crown: true });
  if (reb) for (let i = 0; i < 10; i++) { const a = i * 0.63; b.add(new THREE.SphereGeometry(0.06, 8, 6), vmat('plastic', 0xffffff), M([x + Math.cos(a) * 1.3, y + TREE_H * 1.12, z + Math.sin(a) * 0.9]), 0xf0c8d8); }
}

function mapScene(id: string, out: string, st: State, overlay?: 1 | 2 | 3 | 4): SceneDef {
  return {
    id, out, size: MAP_SIZE, preset: 'neutro', ss: 1.25,
    meta: { kind: 'map' },
    build(scene) {
      tuneLights(scene, { key: { pos: [-30, 45, 25], size: 16, shadow: 4096, radius: 2 }, hemi: { i: 1.0 } });
      const root = new THREE.Group();
      const b = new Batch();
      if (!overlay) {
        root.add(sea());
        root.add(terrain(st));
        props(b, root, st);
        giantTree(b, st);
        root.add(b.build());
        const cam = mapCamera();
        return { root, camera: cam, background: 0x0e4a8a, fog: new THREE.Fog(0x7ab8d8, 30, 60) };
      }
      // sobreposição: só a região renascida; o resto escreve apenas profundidade (oclusão correta)
      root.add(terrain('renascida', overlay));
      props(b, root, 'renascida', overlay);
      root.add(b.build());
      const occ = new Batch();
      giantTree(occ, 'renascida');
      for (const r of [1, 2, 3, 4] as const) if (r !== overlay) props(occ, new THREE.Group(), 'devastada', r);
      const occG = occ.build({ cast: false, receive: false });
      const depthOnly = new THREE.MeshBasicMaterial({ colorWrite: false });
      occG.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh) { m.material = depthOnly; m.renderOrder = -1; } });
      root.add(occG);
      return { root, camera: mapCamera(), fog: new THREE.Fog(0x7ab8d8, 30, 60) };
    },
  };
}

export const MAP_SCENES: SceneDef[] = [
  mapScene('map-ilha-devastada', 'map/ilha-devastada.webp', 'devastada'),
  mapScene('map-ilha-renascida', 'map/ilha-renascida.webp', 'renascida'),
  ...([1, 2, 3, 4] as const).map((r) => mapScene(`map-regiao-${r}`, `map/regiao-${r}-verde.webp`, 'renascida', r)),
];
