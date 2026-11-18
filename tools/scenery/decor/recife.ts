/** Decor do RECIFE BROMÉLIA (praia, recife e naufrágio). */
import * as THREE from 'three';
import { M, mix, hr, hash, vmat, type Batch } from '../lib/core';
import { tubeGeo, rockGeo, leafGeo, latheGeo, bladeGeo, placeM } from '../lib/kit';
import { palm, MAT } from '../lib/flora';
import { decorScenes, type DecorDef } from './common';
import { branchCoral } from '../tiles/recife';

const SAND = 0xe8d0a0;

function sandBase(b: Batch, r: number, h = 0.12, seed = 1) {
  b.add(rockGeo([r, h, r * 0.6], seed, 2, { flat: 0, rough: 0.1 }), vmat('sand', 0xffffff), M([0, -h * 0.4, 0]), SAND);
}

function fanCoral(b: Batch, s: number, col: number) {
  // leque: rede de ramos num plano, com bordas onduladas
  const m = vmat('coral', 0xffffff, { repeat: 4, side: THREE.DoubleSide });
  const sh = new THREE.Shape();
  sh.moveTo(0, 0);
  for (let i = 0; i <= 16; i++) { const a = Math.PI * (0.12 + 0.76 * (i / 16)); const r = s * (0.92 + 0.08 * Math.sin(i * 2.7)); sh.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
  sh.lineTo(0, 0);
  for (let k = 0; k < 14; k++) {
    const hole = new THREE.Path();
    const a = Math.PI * (0.22 + 0.56 * hash(k, 3)), rr = s * (0.25 + 0.6 * hash(k, 4)), hr2 = s * 0.035;
    hole.absarc(Math.cos(a) * rr, Math.sin(a) * rr, hr2, 0, Math.PI * 2, true);
    sh.holes.push(hole);
  }
  const g = new THREE.ExtrudeGeometry(sh, { depth: 0.02, bevelEnabled: true, bevelSize: 0.01, bevelThickness: 0.01, bevelSegments: 1, curveSegments: 6 });
  const p = g.getAttribute('position') as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) p.setZ(i, p.getZ(i) + 0.12 * Math.sin(p.getX(i) * 3) * (p.getY(i) / s));
  g.computeVertexNormals();
  b.add(g, m, M([0, 0, 0], [0, 15, 0]), col);
  for (let k = 0; k < 7; k++) {
    const a = Math.PI * (0.15 + 0.7 * (k / 6));
    b.add(tubeGeo([[0, 0, 0.02], [Math.cos(a) * s * 0.5, Math.sin(a) * s * 0.5, 0.05], [Math.cos(a) * s * 0.9, Math.sin(a) * s * 0.9, 0.04]], s * 0.015, 10, 4), m, M([0, 0, 0], [0, 15, 0]), mix(col, 0x000000, 0.25));
  }
}

function anchor(b: Batch) {
  const mm = vmat('rust', 0xffffff, { metal: 0.5 });
  b.add(new THREE.BoxGeometry(0.16, 2.2, 0.12), mm, M([0, 1.25, 0], [0, 0, 8]), 0x4a3a34);
  b.add(new THREE.TorusGeometry(0.22, 0.05, 8, 20), mm, M([-0.18, 2.5, 0], [0, 0, 8]), 0x4a3a34);
  b.add(new THREE.BoxGeometry(1.0, 0.1, 0.1), mm, M([-0.1, 2.05, 0], [0, 0, 8]), 0x3a2e2a);
  b.add(tubeGeo([[-0.95, 0.75, 0], [-0.75, 0.3, 0], [-0.2, 0.08, 0], [0.4, 0.2, 0], [0.9, 0.55, 0]], 0.08, 24, 8), mm, undefined, 0x4a3a34);
  for (const s of [-1, 1]) b.add(latheGeo([[0.12, 0], [0.001, 0.32]], 4), mm, M([s * 0.95, s > 0 ? 0.6 : 0.8, 0], [0, 0, s * -30]), 0x3a2e2a);
  // algas e cracas
  for (let i = 0; i < 5; i++) b.add(bladeGeo(hr(0.3, 0.6, i, 2), 0.08, 0.4, 0.5, 4), MAT.leaf(), placeM([hr(-0.6, 0.6, i, 3), 0.1, 0.1], [hr(-0.3, 0.3, i, 4), 1, 0.2], i * 60), 0x4a7a3a);
  for (let i = 0; i < 6; i++) b.add(latheGeo([[0.04, 0], [0.03, 0.03], [0.012, 0.035]], 6), vmat('shell', 0xffffff), M([0.05, 0.6 + i * 0.22, 0.07], [90, 0, 0]), 0xd8d0c0);
}

function barrel(b: Batch, sunk: boolean) {
  const wood = MAT.wood(), mm = vmat('rust', 0xffffff);
  const g = latheGeo([[0.42, 0], [0.5, 0.35], [0.52, 0.55], [0.5, 0.75], [0.42, 1.1]], 20, (p) => { const a = Math.atan2(p.z, p.x); const k = 1 + 0.015 * Math.sign(Math.sin(a * 14)); p.x *= k; p.z *= k; });
  const T = sunk ? M([0, 0.35, 0], [0, 0, 78]).multiply(M([0, -0.55, 0])) : M();
  b.add(g, wood, T, 0x7a5434);
  for (const y of [0.15, 0.4, 0.7, 0.95]) b.add(new THREE.TorusGeometry(y === 0.4 || y === 0.7 ? 0.51 : 0.46, 0.022, 6, 32), mm, T.clone().multiply(M([0, y, 0], [90, 0, 0])), 0x5a3a2a);
  if (sunk) {
    sandBase(b, 0.9, 0.15, 3);
    for (let i = 0; i < 4; i++) b.add(bladeGeo(hr(0.25, 0.5, i, 4), 0.06, 0.4, 0.4, 4), MAT.leaf(), placeM([hr(-0.6, 0.6, i, 5), 0.4 + 0.1 * i, 0.3], [0, 1, 0.2], i * 80), 0x3a7a4a);
  }
}

function chest(b: Batch) {
  const wood = MAT.wood(), mm = vmat('metal', 0xffffff, { rough: 0.35 });
  b.add(new THREE.BoxGeometry(1.4, 0.7, 0.85, 4, 2, 2), wood, M([0, 0.35, 0]), 0x6a4024);
  const lid = new THREE.CylinderGeometry(0.43, 0.43, 1.4, 20);
  b.add(lid, wood, M([0, 0.7, 0], [0, 0, 90], [1, 1, 0.98]), 0x7a4a2a);
  for (const x of [-0.5, 0.5]) {
    b.add(new THREE.BoxGeometry(0.1, 0.72, 0.87), mm, M([x, 0.35, 0]), 0xb08a30);
    b.add(new THREE.TorusGeometry(0.43, 0.05, 6, 16, Math.PI), mm, M([x, 0.7, 0], [0, 90, 0]), 0xb08a30);
  }
  b.add(new THREE.BoxGeometry(0.2, 0.24, 0.06), mm, M([0, 0.62, 0.45]), 0xd8b040);
  // moedas escapando
  for (let i = 0; i < 5; i++) b.add(new THREE.CylinderGeometry(0.07, 0.07, 0.015, 12), mm, M([0.75 + i * 0.1, 0.01 + i * 0.002, 0.2 + hr(-0.2, 0.2, i, 1)], [hr(-20, 20, i, 2), 0, 0]), 0xf0c040);
  sandBase(b, 1.1, 0.1, 6);
}

export const RECIFE_DECOR: DecorDef[] = [
  { name: 'coral-leque', size: [192, 208], build: (b) => { fanCoral(b, 1.4, 0xb04ad0); sandBase(b, 0.4); } },
  { name: 'coral-cerebro', size: [144, 112], build: (b) => {
    const g = latheGeo([[0.7, 0], [0.74, 0.1], [0.68, 0.42], [0.45, 0.68], [0.001, 0.75]], 40, (p) => { const a = Math.atan2(p.z, p.x); const r = Math.hypot(p.x, p.z); const k = 1 + 0.035 * Math.sin(a * 11 + r * 18 + Math.sin(a * 3) * 2); p.x *= k; p.z *= k; p.y *= 1 + 0.04 * Math.sin(a * 13 + r * 25); });
    b.add(g, vmat('coral', 0xffffff, { repeat: 5 }), M(), 0xe0a050);
    sandBase(b, 0.8, 0.08, 2);
  } },
  { name: 'anemona', size: [112, 112], build: (b) => {
    const m = vmat('plastic', 0xffffff, { rough: 0.35 });
    b.add(latheGeo([[0.3, 0], [0.24, 0.25], [0.32, 0.36], [0.001, 0.32]], 18), m, M(), 0xc03a5a);
    for (let i = 0; i < 34; i++) {
      const a = i * 2.39996, rr = 0.06 + 0.22 * Math.sqrt(i / 34);
      b.add(tubeGeo([[0, 0, 0], [0.04, 0.2, 0], [0.12, 0.34, 0.03], [0.2, 0.38, 0.05]], (t) => 0.03 * (1 - t * 0.6), 10, 5), m, placeM([Math.cos(a) * rr, 0.34, Math.sin(a) * rr], [Math.cos(a) * 0.5, 1, Math.sin(a) * 0.5], -(a * 180) / Math.PI + 90), mix(0xff6a8a, 0xffd0e0, hash(i, 2)));
    }
  } },
  { name: 'alga-alta', size: [128, 384], build: (b) => {
    for (let k = 0; k < 3; k++) {
      const H = [5.4, 4.2, 3.4][k], x0 = [-0.1, 0.25, -0.35][k];
      const pts: [number, number, number][] = [];
      for (let i = 0; i <= 10; i++) { const t = i / 10; pts.push([x0 + 0.25 * Math.sin(t * 5 + k), t * H, 0.1 * Math.sin(t * 7 + k)]); }
      b.add(tubeGeo(pts, 0.03, 30, 5), MAT.leaf(), undefined, 0x5a6a2a);
      const cv = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)));
      for (let i = 1; i < 12; i++) {
        const p = cv.getPointAt(i / 12);
        b.add(leafGeo(0.55, 0.16, { curl: 0.6, nu: 8, nv: 2, notch: 0.3, seed: i }), MAT.leaf(), placeM(p, new THREE.Vector3(i % 2 ? 1 : -1, 0.9, 0.3), 0), mix(0x4a7a2a, 0x8a9a3a, hash(i, k)));
        if (i % 3 === 0) b.add(new THREE.SphereGeometry(0.05, 8, 6), MAT.plastic(), M([p.x, p.y, p.z + 0.05]), 0xa0a040);
      }
    }
    sandBase(b, 0.5, 0.1, 9);
  } },
  { name: 'concha', size: [80, 64], build: (b) => {
    const g = latheGeo([[0.001, 0], [0.3, 0.02], [0.32, 0.08], [0.2, 0.2], [0.001, 0.24]], 18, (p) => { const a = Math.atan2(p.z, p.x); p.y *= 1 + 0.15 * Math.abs(Math.sin(a * 6)); p.z *= 0.8; });
    b.add(g, vmat('shell', 0xffffff), M([0, 0, 0], [-15, 0, 0], 1.6), 0xf8d8c0);
    b.add(latheGeo([[0.001, 0], [0.12, 0.02], [0.1, 0.12], [0.04, 0.3], [0.001, 0.36]], 14, (p) => { p.x += 0.03 * Math.sin(p.y * 30); }), vmat('shell', 0xffffff), M([0.5, 0, 0.1], [0, 0, -70]), 0xe8b090);
    sandBase(b, 0.7, 0.06, 11);
  } },
  { name: 'estrela-mar', size: [80, 64], build: (b) => {
    const s = new THREE.Shape();
    for (let k = 0; k <= 10; k++) { const a = (k / 10) * Math.PI * 2 + Math.PI / 2; const r = k % 2 ? 0.14 : 0.38; if (k === 0) s.moveTo(Math.cos(a) * r, Math.sin(a) * r); else s.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.04, bevelEnabled: true, bevelSize: 0.04, bevelThickness: 0.05, bevelSegments: 3 });
    b.add(g, vmat('coral', 0xffffff, { repeat: 8 }), M([0, 0.06, 0], [-80, 0, 10], 2.2), 0xff7a2a);
    for (let k = 0; k < 30; k++) { const a = (k / 30) * Math.PI * 2 * 5, rr = 0.06 + 0.5 * ((k % 6) / 6); b.add(new THREE.SphereGeometry(0.03, 6, 4), MAT.plastic(), M([Math.cos(a) * rr, 0.2, Math.sin(a) * rr * 0.4]), k % 2 ? 0xffd080 : 0xd84a1a); }
    sandBase(b, 0.7, 0.06, 12);
  } },
  { name: 'ancora', size: [176, 208], build: (b) => { anchor(b); sandBase(b, 0.9, 0.1, 4); } },
  { name: 'barril-naufrago', size: [160, 128], build: (b) => barrel(b, true) },
  { name: 'coqueiro', size: [384, 480], build: (b) => { palm(b, M(), 6.4, { trunk: 0x9a8460, leaf: 0x3a8a2a }, 8, { lean: 0.28, fronds: 11, coconuts: true }); sandBase(b, 0.6, 0.1, 5); } },
  { name: 'guarda-sol', size: [224, 256], build: (b) => {
    const cm = vmat('cloth', 0xffffff, { side: THREE.DoubleSide });
    b.add(new THREE.CylinderGeometry(0.035, 0.035, 3.1, 8), vmat('wood', 0xffffff), M([0, 1.5, 0], [0, 0, 6]), 0xe0d0b0);
    for (let i = 0; i < 8; i++) {
      const g = new THREE.ConeGeometry(1.5, 0.55, 2, 1, true, (i / 8) * Math.PI * 2, Math.PI / 4);
      b.add(g, cm, M([0.16, 3.0, 0], [0, 0, 6]), i % 2 ? 0xf8f0e0 : 0x2a8ad0);
    }
    b.add(new THREE.SphereGeometry(0.06, 8, 6), MAT.plastic(), M([0.18, 3.3, 0]), 0xd02a2a);
    // toalha e balde
    b.add(new THREE.BoxGeometry(1.2, 0.02, 0.6), cm, M([0.6, 0.01, 0.4], [0, -15, 0]), 0xf2c02a);
    b.add(latheGeo([[0.12, 0], [0.16, 0.25], [0.15, 0.26]], 14), MAT.plastic(), M([-0.7, 0, 0.4]), 0xe04a3a);
  } },
  { name: 'castelo-areia', size: [176, 144], build: (b) => {
    const sm = vmat('sand', 0xffffff);
    b.add(new THREE.BoxGeometry(1.4, 0.45, 0.8), sm, M([0, 0.22, 0]), SAND);
    for (const [x, h] of [[-0.55, 0.9], [0.55, 0.9], [0, 1.2]] as [number, number][]) {
      b.add(latheGeo([[0.22, 0], [0.2, h], [0.25, h], [0.25, h + 0.1], [0.001, h + 0.1]], 12), sm, M([x, 0.2, 0]), mix(SAND, 0xffffff, 0.1));
      for (let k = 0; k < 4; k++) b.add(new THREE.BoxGeometry(0.06, 0.08, 0.06), sm, M([x + Math.cos(k * 1.57) * 0.2, 0.2 + h + 0.13, Math.sin(k * 1.57) * 0.2]), SAND);
    }
    b.add(new THREE.BoxGeometry(0.22, 0.3, 0.05), vmat('paint', 0xffffff), M([0, 0.2, 0.41]), 0x7a5a3a);
    b.add(new THREE.ConeGeometry(0.008, 0.01, 3), sm, M());
    b.add(tubeGeo([[0, 1.5, 0], [0, 1.8, 0]], 0.01, 2, 4), MAT.wood(), undefined, 0x5a3a2a);
    b.add(new THREE.PlaneGeometry(0.22, 0.14), vmat('cloth', 0xffffff, { side: THREE.DoubleSide }), M([0.11, 1.72, 0]), 0xe03a3a);
  } },
  { name: 'timao', size: [176, 192], build: (b) => {
    const wood = MAT.wood(), mm = vmat('metal', 0xffffff);
    b.add(new THREE.TorusGeometry(0.9, 0.07, 10, 40), wood, M([0, 1.15, 0], [0, 0, 12]), 0x7a4a2a);
    b.add(new THREE.TorusGeometry(0.35, 0.05, 8, 24), wood, M([0, 1.15, 0.02], [0, 0, 12]), 0x6a4024);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + 0.2;
      b.add(latheGeo([[0.04, 0], [0.05, 0.6], [0.035, 0.9], [0.06, 1.05], [0.06, 1.15], [0.001, 1.2]], 8), wood, M([0, 1.15, 0], [0, 0, (a * 180) / Math.PI]), 0x8a5a34);
    }
    b.add(new THREE.CylinderGeometry(0.12, 0.12, 0.2, 12), mm, M([0, 1.15, 0.05], [90, 0, 0]), 0xb08a30);
    b.add(new THREE.BoxGeometry(0.2, 0.6, 0.2), wood, M([0, 0.3, -0.15]), 0x5a3a20);
    sandBase(b, 0.7, 0.08, 7);
    for (let i = 0; i < 3; i++) b.add(bladeGeo(0.4, 0.06, 0.3, 0.3, 4), MAT.leaf(), placeM([-0.5 + i * 0.4, 0.05, 0.2], [0, 1, 0], i * 70), 0x4a7a3a);
  } },
  { name: 'bau-velho', size: [176, 128], build: (b) => chest(b) },
];

export const RECIFE_DECOR_SCENES = decorScenes('recife', 'recife', RECIFE_DECOR, { hemi: { i: 0.75 }, key: { color: 0xfff0dc, i: 2.4 }, fres: { color: 0x80e0ff, strength: 0.8 } });
void branchCoral;
