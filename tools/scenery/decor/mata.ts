/** Decor da MATA (inclui serraria clandestina do Barão). */
import * as THREE from 'three';
import { M, mix, hr, hash, vmat, type V3 } from '../lib/core';
import { tubeGeo, leafGeo, latheGeo, rockGeo, placeM } from '../lib/kit';
import { fern, bromeliad, log, rootArch, mossRock, mushrooms, bush, heliconia, stump, hangingVine, palm, MAT } from '../lib/flora';
import { decorScenes, canvasTex, drawBoarEmblem, type DecorDef } from './common';

const LEAF: [number, number, number] = [0x2a5a24, 0x4a8a30, 0x86c04a];

/** Placa de madeira em poste com textura pintada. */
export function signPost(b: import('../lib/core').Batch, root: THREE.Group, w: number, h: number, postH: number, tex: THREE.Texture, wood = 0x8a6440, two = false) {
  const wm = MAT.wood();
  const posts = two ? [-w * 0.38, w * 0.38] : [0];
  for (const x of posts) b.add(new THREE.BoxGeometry(0.09, postH + h * 0.5, 0.09), wm, M([x, (postH + h * 0.5) / 2, -0.06], [0, 0, hr(-2, 2, x * 10)]), mix(wood, 0x000000, 0.25));
  b.add(new THREE.BoxGeometry(w, h, 0.06, 4, 4, 1), wm, M([0, postH + h / 2, 0], [0, 0, -2]), wood);
  const face = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.94, h * 0.9), new THREE.MeshStandardMaterial({ map: tex, transparent: true, roughness: 0.8 }));
  face.position.set(0, postH + h / 2, 0.032);
  face.rotation.z = (-2 * Math.PI) / 180;
  root.add(face);
  // pregos
  const mm = vmat('metal', 0xffffff);
  for (const [px, py] of [[-w * 0.44, h * 0.38], [w * 0.44, h * 0.38], [-w * 0.44, -h * 0.38], [w * 0.44, -h * 0.38]]) b.add(new THREE.SphereGeometry(0.018, 6, 4), mm, M([px, postH + h / 2 + py, 0.035]), 0x6a6a6a);
}

/** Máquina da serraria: mesa de ferro, serra circular com dentes, motor com escapamento e emblema. */
function sawmill(b: import('../lib/core').Batch, root: THREE.Group) {
  const metal = vmat('metal', 0xffffff, { rough: 0.4 });
  const rust = vmat('rust', 0xffffff);
  const paint = vmat('paint', 0xffffff);
  // pés e mesa
  for (const x of [-1.9, 1.9]) for (const z of [-0.5, 0.5]) b.add(new THREE.BoxGeometry(0.16, 1.2, 0.16), rust, M([x, 0.6, z]), 0x4a3a34);
  b.add(new THREE.BoxGeometry(4.3, 0.18, 1.4), paint, M([0, 1.25, 0]), 0x8a2a1e);
  b.add(new THREE.BoxGeometry(4.3, 0.06, 1.42), metal, M([0, 1.36, 0]), 0x9a9a9a);
  // serra circular
  const s = new THREE.Shape();
  for (let i = 0; i <= 48; i++) { const a = (i / 48) * Math.PI * 2; const r = i % 2 ? 0.88 : 1.0; s.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
  const saw = new THREE.ExtrudeGeometry(s, { depth: 0.03, bevelEnabled: false });
  b.add(saw, vmat('metal', 0xffffff, { rough: 0.35, metal: 0.55 }), M([0.4, 1.6, -0.02]), 0xe0e4e8);
  b.add(new THREE.CylinderGeometry(0.16, 0.16, 0.16, 16), metal, M([0.4, 1.6, 0], [90, 0, 0]), 0x3a3a3a);
  // proteção da serra
  b.add(tubeGeo([[-0.7, 1.7, 0.12], [-0.4, 2.55, 0.12], [0.4, 2.8, 0.12], [1.2, 2.55, 0.12], [1.5, 1.7, 0.12]], 0.07, 24, 8), paint, undefined, 0xe0a820);
  // motor
  b.add(new THREE.BoxGeometry(1.1, 0.8, 0.9), rust, M([-1.4, 1.8, 0]), 0x5a4a44);
  for (let i = 0; i < 6; i++) b.add(new THREE.BoxGeometry(0.04, 0.6, 0.95), metal, M([-1.85 + i * 0.12, 1.85, 0]), 0x2a2a2a);
  b.add(latheGeo([[0.08, 0], [0.08, 0.7], [0.12, 0.75], [0.12, 0.85]], 10), rust, M([-1.7, 2.2, -0.2]), 0x3a3030);
  // tora sendo serrada
  log(b, M([1.2, 1.36, 0], [0, 6, 0]), 3.2, 0.32, 0x6a4a30, 0x5a6a2a, 7);
  // serragem
  for (let i = 0; i < 9; i++) b.add(rockGeo([0.14, 0.05, 0.12], i, 1, { flat: 0.2 }), MAT.soft(), M([hr(-1.6, 1.6, i, 3), 0.02, hr(-0.4, 0.6, i, 4)]), 0xd8b880);
  // emblema
  const t = canvasTex(128, 128, (x) => drawBoarEmblem(x, 64, 64, 110, '#1a1a1a', '#e0b030'));
  const em = new THREE.Mesh(new THREE.CircleGeometry(0.3, 24), new THREE.MeshStandardMaterial({ map: t, roughness: 0.6 }));
  em.position.set(-1.4, 1.85, 0.46);
  root.add(em);
}

export const MATA_DECOR: DecorDef[] = [
  { name: 'samambaia', size: [176, 144], build: (b) => fern(b, M(), 1.2, LEAF[1], 3, 11) },
  { name: 'bromelia-deco', size: [144, 128], build: (b) => { bromeliad(b, M(), 0.85, 0x4a8a3a, 0xe03a5a, 2); bromeliad(b, M([0.5, 0, 0.2]), 0.45, 0x6a9a3a, 0xf0a020, 5); mossRock(b, M([0, -0.05, -0.1]), [0.45, 0.15, 0.35], 0x6a5a48, 0x4a7a2a, 2); } },
  { name: 'tronco-caido', size: [352, 144], build: (b) => {
    log(b, M([0, 0, 0], [0, -8, 0]), 4.6, 0.5, 0x5a4030, 0x5a8a2a, 3);
    mushrooms(b, M([0.8, 0.85, 0.2]), 0.25, 0xd85a2a, 0xf0e0c0, 2, 3);
    fern(b, M([2.1, 0, 0.3]), 0.7, LEAF[1], 4, 7);
    for (let i = 0; i < 3; i++) b.add(rockGeo([0.18, 0.08, 0.16], i, 1, { flat: 0.3 }), MAT.leaf(), M([-1.2 + i * 0.9, 0.97, 0.05]), 0x4a7a2a);
  } },
  { name: 'raiz', size: [288, 128], build: (b) => { rootArch(b, M(), 3.6, 0.55, 0.17, 0x5a3e28, 4); mossRock(b, M([1.2, 0, 0.2]), [0.3, 0.2, 0.25], 0x7a7060, 0x4a7a2a, 9); } },
  { name: 'pedra-musgo', size: [176, 128], build: (b) => { mossRock(b, M(), [1.1, 0.75, 0.8], 0x8a8478, 0x4a8a2a, 5, 3); mossRock(b, M([0.8, 0, 0.4]), [0.4, 0.3, 0.35], 0x7a7466, 0x5a8a2a, 6); } },
  { name: 'cogumelos', size: [112, 96], build: (b) => { mushrooms(b, M(), 0.55, 0xd8402a, 0xf2e6cc, 7, 4); mossRock(b, M([0, -0.05, -0.2]), [0.45, 0.1, 0.25], 0x5a4a30, 0x3a6a2a, 7); } },
  { name: 'arbusto', size: [240, 176], build: (b) => bush(b, M(), 1.15, [0x1e4a1a, 0x3a7a28, 0x6aa83a], 4) },
  { name: 'heliconia', size: [144, 208], build: (b) => heliconia(b, M(), 2.6, LEAF[1], 5) },
  { name: 'placa-javali', size: [144, 176], build: (b, root) => {
    const t = canvasTex(256, 192, (x) => {
      x.fillStyle = '#e8c040'; x.fillRect(0, 0, 256, 192);
      x.strokeStyle = '#1a1a1a'; x.lineWidth = 12; x.strokeRect(8, 8, 240, 176);
      drawBoarEmblem(x, 128, 86, 120, '#1a1a1a', '#e8c040');
      x.strokeStyle = '#c0281e'; x.lineWidth = 14; x.beginPath(); x.arc(128, 86, 66, 0, Math.PI * 2); x.moveTo(82, 40); x.lineTo(174, 132); x.stroke();
      x.fillStyle = '#1a1a1a'; x.font = 'bold 26px sans-serif'; x.textAlign = 'center'; x.fillText('FORA, JAVARDO!', 128, 180);
    });
    signPost(b, root, 1.3, 0.98, 1.2, t, 0x7a5a3a);
  } },
  { name: 'toco', size: [144, 128], build: (b) => { stump(b, M(), 0.75, 0.42, 0x5a4434, 3); mushrooms(b, M([0.35, 0.3, 0.3]), 0.2, 0xe8d0a0, 0xf0e8d0, 4, 2); } },
  { name: 'cipo-pendente', size: [128, 352], hang: true, build: (b) => {
    hangingVine(b, M(), 4.8, 0x4a5a24, 0x4a9a2e, 2, 0.06);
    hangingVine(b, M([0.2, 0, -0.1]), 3.6, 0x5a6a2a, 0x5aa83a, 5, 0.045);
    for (let i = 0; i < 6; i++) b.add(leafGeo(0.4, 0.22, { curl: 0.9, fold: 0.3, nu: 6, nv: 2 }), MAT.leaf(), placeM([0, 0, 0], new THREE.Vector3(Math.cos(i), -0.6, Math.sin(i)), 0), LEAF[i % 3]);
  } },
  { name: 'palmeira-jovem', size: [320, 352], build: (b) => palm(b, M(), 4.4, { trunk: 0x8a7a5a, leaf: 0x4a8a2a }, 6, { lean: 0.12, fronds: 8 }) },
  { name: 'pilha-toras', size: [352, 256], build: (b) => {
    const rows: [number, number][] = [[-1.0, 0], [0, 0], [1.0, 0], [-0.5, 1], [0.5, 1], [0, 2]];
    rows.forEach(([x, r], i) => log(b, M([x, r * 0.84, 0], [0, 90 + hr(-4, 4, i, 3), 0]), 2.3, 0.48, mix(0x5a4030, 0x7a5a40, hash(i, 2)).getHex(), 0x5a4a30, i + 2));
    // corrente de aço e etiqueta do Barão
    b.add(new THREE.BoxGeometry(0.42, 0.3, 0.02), vmat('paint', 0xffffff), M([0.5, 1.15, 1.2], [0, 0, 6]), 0xe0b030);
  } },
  { name: 'maquina-serraria', size: [544, 352], build: (b, root) => sawmill(b, root) },
  { name: 'placa-serraria', size: [240, 224], build: (b, root) => {
    const t = canvasTex(256, 160, (x) => {
      x.fillStyle = '#2a2420'; x.fillRect(0, 0, 256, 160);
      for (let i = 0; i < 9; i++) { x.fillStyle = i % 2 ? '#e0b020' : '#1a1a1a'; x.beginPath(); x.moveTo(i * 32, 140); x.lineTo(i * 32 + 16, 140); x.lineTo(i * 32 + 32, 160); x.lineTo(i * 32 + 16, 160); x.fill(); }
      drawBoarEmblem(x, 52, 66, 80, '#e0b020', '#3a302a');
      x.fillStyle = '#f0e0c0'; x.font = 'bold 30px sans-serif'; x.fillText('SERRARIA', 98, 58); x.font = 'bold 22px sans-serif'; x.fillStyle = '#e0b020'; x.fillText('JAVARDA S.A.', 100, 92);
      x.fillStyle = '#c03020'; x.font = 'bold 16px sans-serif'; x.fillText('PROIBIDO BICHOS', 100, 122);
    });
    signPost(b, root, 2.6, 1.6, 1.2, t, 0x6a4a34, true);
  } },
];

export const MATA_DECOR_SCENES = decorScenes('mata', 'selva', MATA_DECOR);
export type { V3 };
