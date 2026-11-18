/** Decor da CÂMARA DE CRISTAL e da COPA DA SUMAÚMA. */
import * as THREE from 'three';
import { M, mix, hr, hash, vmat } from '../lib/core';
import { tubeGeo, leafGeo, latheGeo, crystalGeo, rockGeo, placeM, trunkGeo, bladeGeo } from '../lib/kit';
import { crown, bigLeaf, MAT } from '../lib/flora';
import { decorScenes, type DecorDef } from './common';
import { crystalMat, druse } from '../tiles/cristal';
import { glow } from '../parallax/common';

export const CRISTAL_DECOR: DecorDef[] = [
  { name: 'cristal-g', size: [224, 320], build: (b, root) => {
    druse({ b }, M(), 3.4, 2, [0xb050ff, 0x8a40f0, 0xe060d0, 0x6a70ff]);
    b.add(rockGeo([0.9, 0.25, 0.6], 5, 2, { flat: 0.2 }), vmat('rock', 0xffffff), M(), 0x3a2050);
    glow(root, [0, 1.6, 0.9], 2.0, 0xc070ff, 0.4);
  } },
  { name: 'cristal-p', size: [112, 128], build: (b, root) => {
    druse({ b }, M(), 1.3, 5, [0xe060d0, 0xb050ff, 0x6a70ff, 0x8a40f0]);
    b.add(rockGeo([0.45, 0.14, 0.3], 6, 2, { flat: 0.2 }), vmat('rock', 0xffffff), M(), 0x3a2050);
    glow(root, [0, 0.6, 0.6], 0.9, 0xe080ff, 0.4);
  } },
  { name: 'cristal-flutuante', size: [112, 160], build: (b, root) => {
    // cristal duplo (duas pontas) flutuando, com anel de fragmentos e brilho
    const m = crystalMat(0x9a50ff, 0.5);
    b.add(crystalGeo(0.28, 0.9), m, M([0, 1.2, 0], [0, 20, 0]), 0xc890ff);
    b.add(crystalGeo(0.28, 0.6), m, M([0, 1.22, 0], [180, 20, 0]), 0xa070ff);
    for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; b.add(crystalGeo(0.05, 0.16), crystalMat(0xe080ff, 0.8), M([Math.cos(a) * 0.55, 1.2 + 0.12 * Math.sin(a * 2), Math.sin(a) * 0.3], [i * 30, i * 50, i * 70]), 0xffd0ff); }
    glow(root, [0, 1.2, 0.6], 1.0, 0xb060ff, 0.65);
    // sombra suave no chão (âncora = base)
    const sh = new THREE.Mesh(new THREE.CircleGeometry(0.35, 20), new THREE.MeshBasicMaterial({ color: 0x1a0830, transparent: true, opacity: 0.35, depthWrite: false }));
    sh.rotation.x = -Math.PI / 2; sh.scale.set(1, 0.5, 1); root.add(sh);
  } },
];

const BARK = 0x9a8a72;
export const COPA_DECOR: DecorDef[] = [
  { name: 'galho-g', size: [600, 300], build: (b) => {
    // galho saindo da esquerda, com ramificações, musgo, epífitas e folhagem
    const pts: [number, number, number][] = [[-3.0, 0.2, 0], [-1.6, 0.5, 0.1], [0, 0.95, 0], [1.6, 1.55, -0.1], [2.8, 2.2, 0]];
    b.add(tubeGeo(pts, (t) => 0.36 * (1 - t * 0.7), 40, 14), MAT.bark(), undefined, BARK);
    b.add(tubeGeo([[0.2, 1.0, 0], [0.7, 1.6, 0.2], [1.0, 2.3, 0.1]], (t) => 0.12 * (1 - t * 0.7), 16, 8), MAT.bark(), undefined, BARK);
    for (let i = 0; i < 10; i++) {
      const t = 0.08 + i * 0.09;
      const x = -3 + 5.8 * t, y = 0.2 + 2.0 * t * t + 0.3 * t;
      b.add(rockGeo([0.22, 0.07, 0.2], i, 1, { flat: 0.2 }), MAT.soft(), M([x, y + 0.28 * (1 - t * 0.7), 0.05]), mix(0x4a8a2a, 0x7ab040, hash(i, 2)));
    }
    crown(b, M([2.6, 2.4, 0]), 0.9, [0x2a5a20, 0x4a8a30, 0x8ac050], 3);
    crown(b, M([1.0, 2.5, 0.1]), 0.6, [0x2a5a20, 0x4a8a30, 0x8ac050], 7);
    for (let i = 0; i < 4; i++) b.add(tubeGeo([[-1.5 + i * 0.8, 0.4 + i * 0.25, 0.1], [-1.48 + i * 0.8, 0.0 + i * 0.25, 0.12], [-1.45 + i * 0.8, -0.3 + i * 0.2, 0.15]], 0.02, 8, 4), MAT.leaf(), undefined, 0x6a8a3a);
  } },
  { name: 'folha-gigante', size: [288, 208], build: (b) => {
    bigLeaf(b, M([0, 0, 0], [-62, 0, 0]), 3.6, 1.9, 0x3a8a2a, 4, { droop: 0.9, stem: 0.6 });
    // gotas de orvalho
    for (let i = 0; i < 5; i++) b.add(new THREE.SphereGeometry(0.06, 10, 8), vmat('glass', 0xffffff, { opacity: 0.7 }), M([hr(-0.5, 0.5, i, 1), 0.7 + hr(0, 0.4, i, 2), 0.9 + i * 0.4]), 0xe0f8ff);
  } },
  { name: 'ninho-aves', size: [176, 128], build: (b) => {
    const m = MAT.bark();
    for (let i = 0; i < 40; i++) {
      const a = (i / 40) * Math.PI * 2 * 3;
      const r = 0.6 + 0.08 * Math.sin(i * 1.7);
      const y = 0.08 + 0.32 * (i / 40);
      b.add(tubeGeo([[Math.cos(a) * r, y, Math.sin(a) * r * 0.8], [Math.cos(a + 0.5) * r * 1.05, y + 0.06, Math.sin(a + 0.5) * r * 0.85], [Math.cos(a + 1.0) * r, y + 0.02, Math.sin(a + 1.0) * r * 0.8]], 0.025, 6, 4), m, undefined, mix(0x8a6a40, 0xc0a070, hash(i, 1)));
    }
    b.add(latheGeo([[0.001, 0.05], [0.5, 0.12], [0.55, 0.3], [0.45, 0.32]], 18), vmat('cloth', 0xffffff, { repeat: 6, side: THREE.DoubleSide }), M(), 0x6a5030);
    for (let i = 0; i < 3; i++) b.add(new THREE.SphereGeometry(0.16, 14, 10), vmat('shell', 0xffffff), M([-0.2 + i * 0.2, 0.3, 0.05 * i], [0, 0, 20 * (i - 1)], [1, 1.3, 1]), i === 1 ? 0xd8e8f0 : 0xb8d8e0);
    for (let i = 0; i < 4; i++) b.add(leafGeo(0.3, 0.12, { curl: 0.6, nu: 5, nv: 2 }), MAT.leaf(), placeM([-0.6 + i * 0.4, 0.15, 0.4], [hr(-1, 1, i, 3), 0.6, 0.6], 0), 0x4a8a2a);
  } },
  { name: 'flor-sumauma', size: [144, 128], build: (b) => {
    // flor da sumaúma: cálice, 5 pétalas recurvadas creme-rosadas e tufo de estames longos
    b.add(latheGeo([[0.001, 0], [0.12, 0.05], [0.16, 0.25], [0.1, 0.3]], 12), MAT.plastic(), M(), 0x5a7a3a);
    for (let i = 0; i < 5; i++) b.add(leafGeo(0.6, 0.26, { curl: -2.2, fold: 0.3, nu: 10, nv: 2 }), vmat('leaf', 0xffffff, { side: THREE.DoubleSide, rim: 0.6 }), placeM([0, 0.28, 0], new THREE.Vector3(Math.cos(i * 1.2566), 1.2, Math.sin(i * 1.2566)), 0), mix(0xf8e0e8, 0xe090b0, i / 5));
    for (let i = 0; i < 9; i++) {
      const a = i * 0.7;
      b.add(tubeGeo([[0, 0.3, 0], [Math.cos(a) * 0.1, 0.7, Math.sin(a) * 0.1], [Math.cos(a) * 0.25, 1.0, Math.sin(a) * 0.25]], 0.012, 10, 4), MAT.plastic(), undefined, 0xf8f0e0);
      b.add(new THREE.SphereGeometry(0.035, 8, 6), MAT.plastic(), M([Math.cos(a) * 0.25, 1.0, Math.sin(a) * 0.25]), 0xe0a030);
    }
  } },
  { name: 'semente-luz', size: [112, 128], build: (b, root) => {
    // semente de paina: núcleo dourado com plumas brilhantes
    b.add(new THREE.SphereGeometry(0.16, 16, 12), vmat('glow', 0xffffff, { emissive: 0xd89020, emissiveIntensity: 0.5 }), M([0, 0.9, 0], [0, 0, 0], [1, 1.3, 1]), 0xc89030);
    for (let i = 0; i < 26; i++) {
      const y = 1 - (i + 0.5) / 26 * 1.6, rr = Math.sqrt(Math.max(0, 1 - y * y)), a = i * 2.4;
      const d = new THREE.Vector3(Math.cos(a) * rr, Math.max(y, -0.3), Math.sin(a) * rr);
      b.add(bladeGeo(0.5, 0.02, 0.2, 0, 3), vmat('glow', 0xffffff, { emissive: 0xffe0a0, emissiveIntensity: 0.3, side: THREE.DoubleSide }), placeM([0, 0.9, 0], d, i * 40), 0xfff0d8);
    }
    glow(root, [0, 0.9, 0.5], 0.9, 0xffc040, 0.4);
    void trunkGeo;
  } },
];

export const CRISTAL_DECOR_SCENES = decorScenes('cristal', 'bonus', CRISTAL_DECOR);
export const COPA_DECOR_SCENES = decorScenes('copa', 'selva', COPA_DECOR);
