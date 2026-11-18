/** Decor da FÁBRICA JAVARDA. */
import * as THREE from 'three';
import { M, mix, hr, hash, vmat, type Batch } from '../lib/core';
import { tubeGeo, latheGeo, bladeGeo, placeM, rockGeo } from '../lib/kit';
import { stump, MAT } from '../lib/flora';
import { decorScenes, canvasTex, drawBoarEmblem, type DecorDef } from './common';
import { glow } from '../parallax/common';
import { signPost } from './mata';

const RUST = 0x7a4228, STEEL = 0x5a6068, RED = 0x9a2a1e, YEL = 0xe0a820;
const rust = () => vmat('rust', 0xffffff, { metal: 0.4 });
const metal = () => vmat('metal', 0xffffff, { rough: 0.4, metal: 0.75 });

function flange(b: Batch, T: THREE.Matrix4, r: number) {
  b.add(new THREE.CylinderGeometry(r * 1.35, r * 1.35, r * 0.35, 20), metal(), T, 0x6a6a6a);
  for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; b.add(new THREE.CylinderGeometry(r * 0.1, r * 0.1, r * 0.45, 6), metal(), T.clone().multiply(M([Math.cos(a) * r * 1.15, 0, Math.sin(a) * r * 1.15])), 0x9a9a9a); }
}

export function gear(b: Batch, T: THREE.Matrix4, r: number, teeth: number, col: number, th = 0.2) {
  const s = new THREE.Shape();
  const n = teeth * 4;
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2;
    const k = i % 4;
    const rr = k === 1 || k === 2 ? r : r * 0.84;
    if (i === 0) s.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); else s.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  for (let i = 0; i < 5; i++) { const h = new THREE.Path(); const a = (i / 5) * Math.PI * 2; h.absarc(Math.cos(a) * r * 0.5, Math.sin(a) * r * 0.5, r * 0.16, 0, Math.PI * 2, true); s.holes.push(h); }
  const hub = new THREE.Path(); hub.absarc(0, 0, r * 0.12, 0, Math.PI * 2, true); s.holes.push(hub);
  const g = new THREE.ExtrudeGeometry(s, { depth: th, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02, bevelSegments: 1, curveSegments: 8 });
  g.translate(0, 0, -th / 2);
  b.add(g, rust(), T, col);
}

function panel(b: Batch, root: THREE.Group) {
  b.add(new THREE.BoxGeometry(1.8, 2.3, 0.6), rust(), M([0, 1.15, 0]), STEEL);
  b.add(new THREE.BoxGeometry(1.9, 0.12, 0.7), metal(), M([0, 2.36, 0]), 0x4a4a50);
  const t = canvasTex(256, 320, (x) => {
    x.fillStyle = '#3a3a40'; x.fillRect(0, 0, 256, 320);
    // mostrador
    x.fillStyle = '#f0e8d0'; x.beginPath(); x.arc(70, 70, 46, 0, Math.PI * 2); x.fill();
    x.strokeStyle = '#1a1a1a'; x.lineWidth = 3; for (let i = 0; i <= 8; i++) { const a = Math.PI * (0.8 + 1.4 * (i / 8)); x.beginPath(); x.moveTo(70 + Math.cos(a) * 34, 70 + Math.sin(a) * 34); x.lineTo(70 + Math.cos(a) * 42, 70 + Math.sin(a) * 42); x.stroke(); }
    x.fillStyle = '#c0281e'; x.beginPath(); x.moveTo(70, 70); x.lineTo(70 + Math.cos(-0.3) * 38, 70 + Math.sin(-0.3) * 38); x.lineTo(74, 74); x.fill();
    // telinha verde com gráfico
    x.fillStyle = '#0a2a14'; x.fillRect(132, 28, 104, 84);
    x.strokeStyle = '#40ff80'; x.lineWidth = 3; x.beginPath(); for (let i = 0; i < 10; i++) x.lineTo(138 + i * 10, 90 - 40 * Math.abs(Math.sin(i * 0.9))); x.stroke();
    // botões
    const cols = ['#e83a2a', '#f0c030', '#40c060', '#3a8ae0'];
    for (let r = 0; r < 2; r++) for (let c2 = 0; c2 < 4; c2++) { x.fillStyle = cols[(r + c2) % 4]; x.beginPath(); x.arc(40 + c2 * 58, 160 + r * 50, 16, 0, Math.PI * 2); x.fill(); }
    drawBoarEmblem(x, 128, 272, 70, '#e0a820', '#2a2a2a');
  });
  const face = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 2.0), new THREE.MeshStandardMaterial({ map: t, roughness: 0.5 }));
  face.position.set(0, 1.15, 0.305);
  root.add(face);
  // alavanca
  b.add(tubeGeo([[0.95, 1.2, 0.1], [1.15, 1.5, 0.15], [1.2, 1.75, 0.15]], 0.04, 10, 6), metal(), undefined, 0x8a8a8a);
  b.add(new THREE.SphereGeometry(0.09, 10, 8), MAT.plastic(), M([1.2, 1.78, 0.15]), 0xd02a1a);
  glow(root, [-0.25, 1.85, 0.5], 0.3, 0x40ff80, 0.4);
}

export const FABRICA_DECOR: DecorDef[] = [
  { name: 'cano', size: [288, 192], build: (b) => {
    const r = 0.28;
    b.add(tubeGeo([[-2, 0.4, 0], [-0.6, 0.4, 0], [0.2, 0.55, 0], [0.5, 1.2, 0], [0.5, 2.3, 0]], r, 40, 18), rust(), undefined, RUST);
    flange(b, M([-1.2, 0.4, 0], [0, 0, 90]), r);
    flange(b, M([0.5, 1.8, 0]), r);
    for (const x of [-1.7, -0.3]) b.add(new THREE.BoxGeometry(0.12, 0.45, 0.5), metal(), M([x, 0.1, 0]), 0x3a3a40);
    // vazamento de óleo
    b.add(new THREE.CircleGeometry(0.5, 20), vmat('glass', 0xffffff, { opacity: 0.85 }), M([-0.2, 0.01, 0.3], [-90, 0, 0], [1.4, 0.7, 1]), 0x1a1410);
  } },
  { name: 'chamine-p', size: [192, 416], build: (b, root) => {
    b.add(latheGeo([[0.55, 0], [0.5, 0.3], [0.45, 4.6], [0.55, 4.7], [0.55, 5.0], [0.4, 5.0]], 18), vmat('stone', 0xffffff, { repeat: 3 }), M(), 0x8a4a3a);
    for (const y of [1.2, 2.6, 4.0]) b.add(new THREE.TorusGeometry(0.5, 0.04, 6, 24), metal(), M([0, y, 0], [90, 0, 0]), 0x3a3a3a);
    for (let i = 0; i < 6; i++) b.add(new THREE.BoxGeometry(0.5 - i * 0.02, 0.08, 0.08), vmat('paint', 0xffffff), M([0, 4.5 - i * 0.14, 0.48], [0, 0, 0]), i % 2 ? 0x1a1a1a : 0xe0e0e0);
    b.add(rockGeo([0.4, 0.25, 0.4], 3, 2), vmat('rubber', 0xffffff, { rough: 1, rim: 0 }), M([0.1, 5.25, 0]), 0x3a3434);
    b.add(rockGeo([0.55, 0.35, 0.5], 4, 2), vmat('rubber', 0xffffff, { rough: 1, rim: 0 }), M([0.4, 5.75, 0]), 0x5a5050);
    glow(root, [0, 5.0, 0.3], 0.5, 0xff6a20, 0.4);
  } },
  { name: 'engrenagem', size: [208, 208], build: (b) => { gear(b, M([0, 1.45, 0], [0, 15, 8]), 1.4, 14, 0x8a5a3a); gear(b, M([1.0, 0.55, -0.3], [0, 15, 0]), 0.55, 9, RUST, 0.15); b.add(new THREE.CylinderGeometry(0.16, 0.16, 0.5, 12), metal(), M([0, 1.45, 0], [90, 15, 0]), 0x5a5a5a); } },
  { name: 'barril-oleo', size: [112, 144], build: (b, root) => {
    b.add(latheGeo([[0.5, 0], [0.5, 1.6], [0.47, 1.62], [0.001, 1.62]], 22), rust(), M(), 0x2a4a7a);
    for (const y of [0.4, 0.8, 1.2]) b.add(new THREE.TorusGeometry(0.505, 0.025, 6, 32), metal(), M([0, y, 0], [90, 0, 0]), 0x3a4a6a);
    const t = canvasTex(128, 128, (x) => { x.fillStyle = '#e0a820'; x.fillRect(0, 0, 128, 128); drawBoarEmblem(x, 64, 64, 100, '#1a1a1a', '#e0a820'); });
    const lab = new THREE.Mesh(new THREE.CylinderGeometry(0.51, 0.51, 0.55, 22, 1, true, -0.6, 1.2), new THREE.MeshStandardMaterial({ map: t, roughness: 0.6 }));
    lab.position.y = 0.95; root.add(lab);
    b.add(new THREE.CircleGeometry(0.45, 20), vmat('glass', 0xffffff), M([0.5, 0.005, 0.4], [-90, 0, 0], [1.5, 0.8, 1]), 0x14100c);
  } },
  { name: 'placa-javarda', size: [224, 192], build: (b, root) => {
    const t = canvasTex(256, 192, (x) => {
      x.fillStyle = '#1e1e22'; x.fillRect(0, 0, 256, 192);
      x.fillStyle = '#e0a820'; for (let i = 0; i < 10; i++) { x.beginPath(); x.moveTo(i * 30 - 10, 0); x.lineTo(i * 30 + 5, 0); x.lineTo(i * 30 - 25, 22); x.lineTo(i * 30 - 40, 22); x.fill(); }
      drawBoarEmblem(x, 62, 108, 90, '#e0a820', '#3a3a40');
      x.fillStyle = '#f0f0f0'; x.font = 'bold 26px sans-serif'; x.fillText('JAVARDA', 116, 98); x.font = 'bold 18px sans-serif'; x.fillText('INDÚSTRIAS', 118, 124);
      x.fillStyle = '#c0281e'; x.font = 'bold 15px sans-serif'; x.fillText('PRODUZIR, DERRUBAR, LUCRAR', 18, 176);
    });
    signPost(b, root, 2.6, 1.9, 0.6, t, 0x4a4a50, true);
  } },
  { name: 'painel', size: [192, 208], build: (b, root) => panel(b, root) },
  { name: 'corrente', size: [96, 352], hang: true, build: (b) => {
    for (let k = 0; k < 18; k++) { const g = new THREE.TorusGeometry(0.1, 0.03, 8, 16); g.scale(1, 1.5, 1); b.add(g, metal(), M([0, -0.12 - k * 0.27, 0], [0, k % 2 ? 90 : 0, 0]), mix(0x8a8a8a, RUST, hash(k, 3) * 0.6)); }
    b.add(tubeGeo([[0, -4.9, 0], [0, -5.15, 0], [0.18, -5.3, 0], [0.26, -5.1, 0]], 0.05, 16, 8), metal(), undefined, 0x9a9a9a);
    b.add(new THREE.BoxGeometry(0.5, 0.12, 0.3), metal(), M([0, -0.02, 0]), 0x4a4a4a);
  } },
  { name: 'caixa-metal', size: [144, 128], build: (b) => {
    b.add(new THREE.BoxGeometry(1.5, 1.1, 1.0), rust(), M([0, 0.55, 0], [0, 8, 0]), STEEL);
    for (const x of [-0.6, 0.6]) b.add(new THREE.BoxGeometry(0.08, 1.12, 1.02), metal(), M([x, 0.55, 0], [0, 8, 0]), 0x3a3a40);
    for (let i = 0; i < 4; i++) b.add(new THREE.BoxGeometry(0.2, 0.06, 0.01), vmat('paint', 0xffffff), M([-0.3 + i * 0.2, 0.85, 0.51], [0, 8, 30]), i % 2 ? 0x1a1a1a : YEL);
    b.add(new THREE.BoxGeometry(0.5, 0.3, 0.01), vmat('paint', 0xffffff), M([0.0, 0.45, 0.51], [0, 8, 0]), 0xe8e0d0);
    for (let i = 0; i < 3; i++) b.add(new THREE.BoxGeometry(0.36, 0.03, 0.012), vmat('paint', 0xffffff), M([0.0, 0.52 - i * 0.07, 0.512], [0, 8, 0]), 0x2a2a2a);
    for (let i = 0; i < 8; i++) b.add(new THREE.SphereGeometry(0.03, 6, 4), metal(), M([-0.7 + (i % 4) * 0.46, i < 4 ? 1.05 : 0.08, 0.5], [0, 8, 0]), 0x9a9a9a);
    for (let i = 0; i < 4; i++) b.add(new THREE.CircleGeometry(hr(0.06, 0.12, i, 3), 10), rust(), M([-0.5 + i * 0.35, 0.2 + 0.2 * hash(i, 4), 0.507], [0, 8, 0]), 0xa05a28);
    b.add(new THREE.BoxGeometry(1.2, 0.8, 0.8), rust(), M([0.3, 1.5, -0.1], [0, -12, 0]), 0x6a5048);
  } },
  { name: 'tubo-vapor', size: [144, 288], build: (b, root) => {
    b.add(new THREE.CylinderGeometry(0.22, 0.22, 3.6, 18), rust(), M([0, 1.8, 0]), 0x6a6a72);
    for (const y of [0.4, 1.6, 2.9]) flange(b, M([0, y, 0]), 0.22);
    b.add(new THREE.TorusGeometry(0.28, 0.04, 8, 20), MAT.plastic(), M([0.38, 2.2, 0], [0, 90, 0]), RED);
    b.add(new THREE.CylinderGeometry(0.08, 0.08, 0.3, 10), metal(), M([0.25, 2.2, 0], [0, 0, 90]), 0x7a7a7a);
    // manômetro
    b.add(new THREE.CylinderGeometry(0.15, 0.15, 0.06, 18), metal(), M([0, 1.1, 0.26], [90, 0, 0]), 0xd8d0b0);
    // vapor saindo
    const sm = vmat('rubber', 0xffffff, { rough: 1, rim: 0.4, opacity: 0.75 });
    for (let i = 0; i < 4; i++) b.add(rockGeo([0.2 + i * 0.08, 0.16 + i * 0.06, 0.2], i + 1, 2), sm, M([0.5 + i * 0.22, 2.3 + i * 0.22, 0.1]), 0xe8e4e0);
  } },
  { name: 'toco-cortado', size: [144, 112], build: (b) => {
    stump(b, M(), 0.45, 0.48, 0x4a3a2a, 7, 0xd8b078);
    for (let i = 0; i < 6; i++) b.add(rockGeo([0.1, 0.03, 0.08], i, 1, { flat: 0.2 }), MAT.soft(), M([hr(-0.8, 0.8, i, 2), 0.01, hr(-0.2, 0.5, i, 3)]), 0xd8b880);
    b.add(bladeGeo(0.25, 0.05, 0.4, 0.3, 4), MAT.leaf(), placeM([0.3, 0.45, 0.2], [0.2, 1, 0], 30), 0x6a9a3a);
    b.add(bladeGeo(0.2, 0.05, 0.4, 0.3, 4), MAT.leaf(), placeM([0.36, 0.45, 0.18], [-0.2, 1, 0], 100), 0x5a8a2a);
  } },
  { name: 'cerca-arame', size: [288, 192], build: (b) => {
    const mm = metal();
    for (const x of [-2, 0, 2]) b.add(new THREE.CylinderGeometry(0.06, 0.07, 2.4, 10), mm, M([x, 1.2, 0], [0, 0, x * 1.2]), 0x6a6a70);
    // tela de losangos
    for (let i = 0; i < 18; i++) for (const s of [-1, 1]) {
      const x0 = -2 + i * 0.25;
      const x1 = Math.min(2, Math.max(-2, x0 + s * 1.8));
      const y1 = 0.1 + 1.8 * Math.abs(x1 - x0) / 1.8;
      b.add(tubeGeo([[x0, 0.1, 0], [(x0 + x1) / 2, (0.1 + y1) / 2, 0.01], [x1, y1, 0]], 0.012, 4, 4), mm, undefined, 0x8a8a90);
    }
    // arame farpado no topo
    for (let k = 0; k < 2; k++) {
      const pts: [number, number, number][] = [];
      for (let i = 0; i <= 40; i++) { const x = -2 + i * 0.1; pts.push([x, 2.1 + k * 0.2 + 0.04 * Math.sin(i * 2), 0.04 * Math.cos(i * 2)]); }
      b.add(tubeGeo(pts, 0.012, 80, 4), mm, undefined, 0x5a5a5a);
      for (let i = 0; i < 12; i++) b.add(latheGeo([[0.02, 0], [0.001, 0.08]], 4), mm, M([-1.9 + i * 0.33, 2.1 + k * 0.2, 0], [0, 0, i * 60]), 0x6a6a6a);
    }
    b.add(new THREE.BoxGeometry(0.7, 0.45, 0.02), vmat('paint', 0xffffff), M([0.9, 1.3, 0.05]), YEL);
  } },
];

export const FABRICA_DECOR_SCENES = decorScenes('fabrica', 'fabrica', FABRICA_DECOR, { hemi: { i: 0.85, sky: 0x9a8a80 }, key: { color: 0xffd8c0, i: 2.3 }, fres: { color: 0xffa080, strength: 0.6 } });
