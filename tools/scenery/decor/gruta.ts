/** Decor das GRUTAS ÂMBAR e da mina. */
import * as THREE from 'three';
import { M, mix, hr, vmat, Batch } from '../lib/core';
import { tubeGeo, rockGeo, coneGeo, latheGeo, crystalGeo } from '../lib/kit';
import { mushrooms, MAT } from '../lib/flora';
import { decorScenes, type DecorDef } from './common';
import { glow } from '../parallax/common';

const STONE = 0x9a7a4a, GOLD = 0xd8a040;

export function stalagmite(b: Batch, T: THREE.Matrix4, h: number, r: number, seed: number, cols: [number, number] = [0x6a5038, GOLD]) {
  const m = vmat('rock', 0xffffff, { rough: 0.55 });
  const g = latheGeo([[r, 0], [r * 0.78, h * 0.18], [r * 0.55, h * 0.45], [r * 0.32, h * 0.7], [r * 0.12, h * 0.92], [0.001, h]], 14, (p) => {
    const t = p.y / h, a = Math.atan2(p.z, p.x);
    // anéis de gotejamento e sulcos verticais
    const k = 1 + 0.06 * Math.sin(p.y / h * 40 + seed) + 0.08 * Math.sin(a * 5 + seed + t * 2);
    p.x *= k; p.z *= k;
    p.x += 0.05 * h * t * t * Math.sin(seed);
  });
  const pos = g.getAttribute('position') as THREE.BufferAttribute;
  const c = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) { const cc = mix(cols[0], cols[1], (pos.getY(i) / h) ** 0.8); c.set([cc.r, cc.g, cc.b], i * 3); }
  g.setAttribute('color', new THREE.BufferAttribute(c, 3));
  b.add(g, m, T);
}

function lamp(b: Batch, root: THREE.Group) {
  const mm = vmat('metal', 0xffffff, { rough: 0.45 });
  const rust = vmat('rust', 0xffffff);
  b.add(new THREE.BoxGeometry(0.22, 0.3, 0.05), rust, M([0, 0.15, -0.12]), 0x4a3a2a);
  b.add(tubeGeo([[0, 0.25, -0.1], [0, 0.32, 0.05], [0, 0.3, 0.2]], 0.02, 10, 6), mm, undefined, 0x3a3a3a);
  b.add(latheGeo([[0.001, 0.62], [0.09, 0.6], [0.11, 0.55]], 12), mm, M([0, 0, 0.2]), 0x2a2a2a);
  b.add(latheGeo([[0.08, 0.2], [0.1, 0.3], [0.1, 0.48], [0.08, 0.55]], 12), vmat('glass', 0xffffff, { emissive: 0xffb040, emissiveIntensity: 1.2, opacity: 0.75 }), M([0, 0, 0.2]), 0xffd080);
  b.add(latheGeo([[0.1, 0.12], [0.11, 0.2], [0.001, 0.2]], 12), mm, M([0, 0, 0.2]), 0x3a3a3a);
  for (let i = 0; i < 4; i++) { const a = (i / 4) * Math.PI * 2; b.add(new THREE.CylinderGeometry(0.008, 0.008, 0.4, 4), mm, M([Math.cos(a) * 0.1, 0.38, 0.2 + Math.sin(a) * 0.1]), 0x2a2a2a); }
  b.add(new THREE.SphereGeometry(0.035, 10, 8), vmat('glow', 0xffffff, { emissive: 0xffe0a0, emissiveIntensity: 2 }), M([0, 0.38, 0.2]), 0xffffff);
  glow(root, [0, 0.38, 0.4], 0.45, 0xffb050, 0.55);
}

function cart(b: Batch) {
  const rust = vmat('rust', 0xffffff), mm = vmat('metal', 0xffffff, { rough: 0.4 }), wood = MAT.wood();
  // caçamba trapezoidal
  const s = new THREE.Shape();
  s.moveTo(-0.85, 0); s.lineTo(0.85, 0); s.lineTo(1.05, 0.8); s.lineTo(-1.05, 0.8); s.lineTo(-0.85, 0);
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.9, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 2 });
  g.translate(0, 0, -0.45);
  b.add(g, rust, M([0, 0.32, 0], [0, 0, 4]), 0x7a4a2a);
  for (const x of [-0.6, 0, 0.6]) b.add(new THREE.BoxGeometry(0.06, 0.82, 0.04), mm, M([x, 0.72, 0.48], [0, 0, 4]), 0x3a3a3a);
  b.add(new THREE.BoxGeometry(2.2, 0.08, 1.0), mm, M([0.05, 1.16, 0], [0, 0, 4]), 0x4a4a4a);
  // carga de pedras âmbar
  for (let i = 0; i < 7; i++) b.add(rockGeo([0.22, 0.16, 0.2], i, 1, { facet: true }), vmat('rock', 0xffffff), M([-0.7 + i * 0.23, 1.2 + 0.06 * (i % 2), hr(-0.2, 0.2, i, 2)]), i % 3 ? STONE : GOLD);
  // rodas (uma tombada para indicar abandono)
  for (const [x, tilt] of [[-0.55, 0], [0.6, 12]] as [number, number][]) {
    b.add(new THREE.CylinderGeometry(0.28, 0.28, 0.08, 18), mm, M([x, 0.28, 0.5], [90, 0, tilt]), 0x2a2a2a);
    b.add(new THREE.CylinderGeometry(0.1, 0.1, 0.1, 10), mm, M([x, 0.28, 0.54], [90, 0, 0]), 0x6a6a6a);
  }
  b.add(new THREE.BoxGeometry(0.2, 0.06, 1.2), wood, M([1.4, 0.03, 0.1], [0, 30, 0]), 0x5a4028);
}

export const GRUTA_DECOR: DecorDef[] = [
  { name: 'estalagmite-p', size: [128, 160], build: (b) => { stalagmite(b, M(), 1.6, 0.36, 1); stalagmite(b, M([0.38, 0, 0.1]), 0.8, 0.2, 4); stalagmite(b, M([-0.3, 0, 0.15]), 0.5, 0.14, 6); for (let i = 0; i < 5; i++) b.add(rockGeo([0.08, 0.05, 0.07], i, 1), vmat('rock', 0xffffff), M([-0.5 + i * 0.25, 0.02, 0.3]), i % 2 ? STONE : GOLD); } },
  { name: 'estalagmite-g', size: [176, 288], build: (b) => { stalagmite(b, M(), 3.6, 0.7, 2); stalagmite(b, M([-0.6, 0, 0.3]), 1.4, 0.3, 5); stalagmite(b, M([0.65, 0, 0.2]), 0.9, 0.22, 7); } },
  { name: 'cristal-ambar', size: [144, 144], build: (b, root) => {
    const cm = vmat('crystal', 0xffffff, { emissive: 0xff9a20, emissiveIntensity: 0.55, opacity: 0.9, flat: true });
    [[0, 0, 1.3, 0.2], [-0.3, 25, 0.8, 0.14], [0.32, -30, 0.9, 0.15], [0.12, -60, 0.55, 0.1], [-0.18, 55, 0.5, 0.09]].forEach(([x, rz, h, r], i) => b.add(crystalGeo(r, h), cm, M([x, 0, 0], [0, i * 40, rz]), mix(0xffc050, 0xffe090, i / 5)));
    b.add(rockGeo([0.5, 0.15, 0.35], 4, 2, { flat: 0.2 }), vmat('rock', 0xffffff), M([0, 0, 0]), 0x5a4030);
    glow(root, [0, 0.6, 0.6], 1.0, 0xffa030, 0.45);
  } },
  { name: 'coluna', size: [192, 512], build: (b) => {
    // coluna completa: estalagmite e estalactite fundidas, com cinturas de gotejamento
    const m = vmat('rock', 0xffffff, { rough: 0.55 });
    const H = 7.2;
    const g = latheGeo(Array.from({ length: 25 }, (_, i) => { const t = i / 24; const r = 0.45 + 0.55 * (Math.abs(t - 0.5) * 2) ** 1.6 + 0.06 * Math.sin(t * 38); return [r, t * H] as [number, number]; }), 18, (p) => { const a = Math.atan2(p.z, p.x); const k = 1 + 0.09 * Math.sin(a * 6 + p.y * 1.3); p.x *= k; p.z *= k; });
    const pos = g.getAttribute('position') as THREE.BufferAttribute;
    const c = new Float32Array(pos.count * 3);
    for (let i = 0; i < pos.count; i++) { const t = pos.getY(i) / H; const cc = mix(0x5a4430, GOLD, 0.35 + 0.5 * Math.sin(t * Math.PI) ** 2 + 0.1 * Math.sin(t * 40)); c.set([cc.r, cc.g, cc.b], i * 3); }
    g.setAttribute('color', new THREE.BufferAttribute(c, 3));
    b.add(g, m);
  } },
  { name: 'lamparina-parede', size: [144, 176], build: (b, root) => { const g = new THREE.Group(); const bb = new Batch(); lamp(bb, g); g.add(bb.build()); g.scale.setScalar(1.6); root.add(g); } },
  { name: 'trilho-quebrado', size: [320, 128], build: (b) => {
    const wood = MAT.wood(), mm = vmat('metal', 0xffffff, { rough: 0.35, metal: 0.8 });
    for (let i = 0; i < 5; i++) b.add(new THREE.BoxGeometry(0.24, 0.1, 1.0), wood, M([-1.8 + i * 0.85, 0.05, 0], [0, hr(-8, 8, i, 1), i === 3 ? 14 : 0]), mix(0x4a3420, 0x6a4a2a, i / 5));
    for (const z of [0.3, -0.3]) {
      b.add(new THREE.BoxGeometry(2.4, 0.08, 0.07), mm, M([-1.0, 0.14, z]), 0x7a7a80);
      b.add(new THREE.BoxGeometry(1.3, 0.08, 0.07), mm, M([1.5, 0.35, z], [0, z * 20, 22]), 0x6a6a70);
    }
    for (let i = 0; i < 6; i++) b.add(rockGeo([0.12, 0.08, 0.1], i, 1), vmat('rock', 0xffffff), M([hr(-2, 2, i, 3), 0.04, hr(-0.4, 0.5, i, 4)]), STONE);
  } },
  { name: 'carrinho-velho', size: [224, 176], build: (b) => cart(b) },
  { name: 'cogumelo-brilho', size: [112, 112], build: (b, root) => { mushrooms(b, M(), 0.6, 0x50d0ff, 0xe0f0e0, 3, 4, 0x30b8ff); glow(root, [0, 0.45, 0.5], 0.8, 0x40c0ff, 0.5); } },
  { name: 'viga-mina', size: [320, 384], build: (b) => {
    const wood = MAT.wood(), mm = vmat('metal', 0xffffff);
    for (const x of [-1.8, 1.8]) b.add(new THREE.BoxGeometry(0.3, 4.6, 0.3, 1, 6, 1), wood, M([x, 2.3, 0], [0, 0, x > 0 ? -2 : 3]), 0x6a4a2c);
    b.add(new THREE.BoxGeometry(4.3, 0.34, 0.36), wood, M([0, 4.65, 0]), 0x5a3e24);
    for (const s of [-1, 1]) b.add(new THREE.BoxGeometry(0.16, 1.1, 0.18), wood, M([s * 1.42, 4.1, 0.05], [0, 0, s * 45]), 0x7a5634);
    for (const x of [-1.8, 1.8]) for (const y of [4.4, 4.9]) b.add(new THREE.SphereGeometry(0.04, 6, 4), mm, M([x, y, 0.19]), 0x3a3a3a);
    // corda pendurada com lamparina apagada
    b.add(tubeGeo([[0.6, 4.48, 0.1], [0.62, 3.9, 0.12], [0.6, 3.5, 0.12]], 0.02, 8, 5), vmat('cloth', 0xffffff), undefined, 0xb08a5a);
    b.add(latheGeo([[0.001, 3.5], [0.1, 3.42], [0.1, 3.2], [0.001, 3.12]], 10), vmat('glass', 0xffffff, { opacity: 0.6 }), M(), 0x6a5a4a);
  } },
  { name: 'estalactite', size: [112, 256], hang: true, build: (b) => {
    const m = vmat('rock', 0xffffff, { rough: 0.5 });
    b.add(coneGeo(0.42, 3.4, 3), m, M([0, 0, 0], [180, 0, 0]), mix(0x6a5038, GOLD, 0.5));
    b.add(coneGeo(0.2, 1.4, 6), m, M([0.36, 0, 0.1], [180, 0, 0]), GOLD);
    b.add(new THREE.SphereGeometry(0.05, 8, 6), vmat('glass', 0xffffff, { emissive: 0xffd080, emissiveIntensity: 0.6 }), M([0, -3.45, 0]), 0xfff0c0);
  } },
];

export const GRUTA_DECOR_SCENES = decorScenes('gruta', 'caverna', GRUTA_DECOR);
