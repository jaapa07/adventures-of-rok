/** Abertura: 6 quadros (a sumaúma e a semente, a dupla dormindo, as máquinas chegando, o Barão, o roubo, a partida). */
import { THREE, Batch, M, cine, sky, floor, forest, undergrowth, pose, semente, glow, beams, smoke, cinecam, branch, lights, crown, kapok, tree, palm, hangingVine, mossRock, vmat, rain, type SceneDef } from '../kit';

const NOITE_SKY: [number, number][] = [[0, 0x0a1428], [0.25, 0x1a2a52], [0.6, 0x2a3a6a], [1, 0x0a1028]];
const ALVA_SKY: [number, number][] = [[0, 0x2a2a4a], [0.2, 0xd88a6a], [0.4, 0xf0b890], [0.7, 0x8ab0d8], [1, 0x4a6aa8]];

/** Copa de sumaúma vista de dentro: galho grosso, folhagem em volta e cipós. */
function copa(b: Batch, root: THREE.Object3D, leaf: [number, number, number], bark = 0xa89a80) {
  branch(b, [-14, 2.2, -1], [9, 3.1, -0.6], 0.95, 0.55, bark);
  branch(b, [-2, 2.6, -0.8], [-6, 8, -4], 0.5, 0.25, bark);
  branch(b, [3, 2.9, -0.7], [8, 7.5, -5], 0.45, 0.2, bark);
  for (let i = 0; i < 9; i++) crown(b, M([-12 + i * 3.2, 7.5 + (i % 3) * 1.2, -6 - (i % 2) * 3]), 3.2, leaf, i + 3);
  for (let i = 0; i < 5; i++) crown(b, M([-10 + i * 5, -2.5, -8]), 3.6, leaf, i + 30);
  for (let i = 0; i < 6; i++) hangingVine(b, M([-9 + i * 3.4, 9, -2.5 - (i % 3)]), 5 + (i % 3) * 1.5, 0x3a6a2a, 0x4a8a3a, i);
  void root;
}

export const ABERTURA: SceneDef[] = [
  // 1 — a sumaúma gigante ao luar com a Semente-Mãe brilhando no alto
  cine('abertura-1', 'noite', (scene) => {
    lights(scene, { key: { pos: [-20, 30, 24], color: 0xb8c8ff, i: 2.2, size: 40 }, hemi: { sky: 0x4a5a9a, ground: 0x10101e, i: 1.0 } });
    const root = new THREE.Group(), b = new Batch();
    const cam = cinecam([6, 9, 52], [0, 17, 0], 44);
    sky(root, NOITE_SKY);
    floor(root, 160, 0x1a2a1a);
    kapok(b, M([0, 0, 0]), 26, { bark: 0xb8a890, leaf: [0x1a3a2a, 0x2a5a3a, 0x4a7a5a] }, 5, { branches: 8, crown: true });
    forest(b, { n: 26, r0: 18, r1: 34, h: [9, 15], leaf: [0x10261a, 0x1a3a26, 0x2a5236], bark: 0x3a3030, seed: 2 });
    undergrowth(b, 0, 10, 12, 30, 4, 0x1e4a2a);
    root.add(b.build());
    semente(root, [0.4, 23.5, 3], 3, cam, 30);
    glow(root, [-26, 38, -120], 14, 0xe8f0ff, 0.9, cam); // lua
    for (let i = 0; i < 40; i++) glow(root, [-150 + (i * 37) % 300, 60 + (i * 53) % 90, -300], 0.8 + (i % 3) * 0.4, 0xffffff, 0.7, cam);
    return { root, camera: cam, fog: new THREE.Fog(0x14203a, 30, 110) };
  }),
  // 2 — Tamá e Lili dormindo no galho
  cine('abertura-2', 'noite', (scene) => {
    lights(scene, { key: { pos: [-6, 14, 10], color: 0xc8d4ff, i: 2.6, size: 12 }, fill: { color: 0x8a7aff, i: 0.9 }, hemi: { sky: 0x6a7ab8, ground: 0x2a2a3a, i: 1.2 } });
    const root = new THREE.Group(), b = new Batch();
    const cam = cinecam([0.2, 4.4, 4.4], [0, 3.7, 0], 36);
    sky(root, NOITE_SKY);
    copa(b, root, [0x14301e, 0x1e4a2a, 0x3a6a4a]);
    root.add(b.build());
    // Tamá dorme de barriga para cima ao longo do galho; Lili enrolada em cima da barriga dela
    root.add(pose('tama', { anim: 'agachar', t: 1, pos: [-0.45, 3.15, -0.35], rot: [0, -60, 0], tweak: { head: [0, 0, -30], neck: [0, 0, -20], tail1: [0, 30, 0] } }));
    root.add(pose('lili', { anim: 'agachar', t: 1, pos: [0.45, 3.15, -0.1], rot: [0, -125, 0], tweak: { head: [0, 0, -38], neck: [0, 0, -15], tail1: [0, 0, -30] } }));
    glow(root, [0, 8, -10], 6, 0x8ab0ff, 0.25, cam);
    for (let i = 0; i < 14; i++) glow(root, [-4 + (i * 1.7) % 8, 2.2 + (i * 0.73) % 3, -1 - (i % 4)], 0.08, 0xd8ff8a, 0.9, cam); // vaga-lumes
    return { root, camera: cam, fog: new THREE.Fog(0x14203a, 8, 40) };
  }),
  // 3 — as máquinas do Barão chegam pela praia de madrugada
  cine('abertura-3', 'fabrica', (scene) => {
    lights(scene, { key: { pos: [10, 12, 14], color: 0xffa070, i: 2.0, size: 20 }, hemi: { sky: 0x6a4a5a, ground: 0x1a0a08, i: 0.8 } });
    const root = new THREE.Group(), b = new Batch();
    const cam = cinecam([-2, 3.2, 13], [2, 2, 0], 44);
    sky(root, [[0, 0x2a1a2a], [0.2, 0x8a3a2a], [0.35, 0xd86a3a], [0.6, 0x4a2a4a], [1, 0x140e1a]]);
    floor(root, 200, 0xc8b088, 0, 'sand');
    const mar = new THREE.Mesh(new THREE.PlaneGeometry(400, 200), vmat('water', 0x2a3a5a, { opacity: 0.92 }));
    mar.rotation.x = -Math.PI / 2; mar.position.set(0, 0.05, -60); root.add(mar);
    for (let i = 0; i < 5; i++) palm(b, M([-12 + i * 1.6, 0, 2 - i * 1.4]), 4 + (i % 2), { trunk: 0x6a5040, leaf: 0x2a4a2a }, i, { lean: -0.2 + i * 0.08 });
    root.add(pose('major-motosserra', { anim: 'entrada', t: 0.85, pos: [3.6, 0, -2.5], rot: [0, -60, 0] }));
    for (let i = 0; i < 6; i++) root.add(pose('javalim', { anim: 'andar', t: (i * 0.17) % 1, pos: [-1 + i * 1.3, 0, 1.5 - i * 1.1], rot: [0, -25, 0] }));
    root.add(pose('lagarta-trator', { anim: 'idle', t: 0.3, pos: [9, 0, -7], rot: [0, -70, 0] }));
    smoke(b, [10, 3.5, -8], 14, 0.8, 0x2a2426, 3, 7);
    smoke(b, [-6, 0.5, -14], 8, 1.4, 0x4a3a3a, 7, 3);
    root.add(b.build());
    return { root, camera: cam, fog: new THREE.Fog(0x4a2a2a, 14, 80) };
  }),
  // 4 — o Barão Javardo olha a ilha do alto da escavadeira
  cine('abertura-4', 'fabrica', (scene) => {
    lights(scene, { key: { pos: [-8, 10, 12], color: 0xffb080, i: 2.4, size: 14 }, rim: { color: 0xff5a2a, i: 3 }, hemi: { sky: 0x8a5a4a, ground: 0x200a08, i: 0.7 } });
    const root = new THREE.Group(), b = new Batch();
    const cam = cinecam([-3.5, 2.2, 9], [0.5, 3, 0], 40);
    sky(root, [[0, 0x2a0e0e], [0.25, 0x8a2a1a], [0.45, 0xd8602a], [0.7, 0x5a1a2a], [1, 0x1a0a14]]);
    floor(root, 120, 0x3a2a22, 0, 'rock');
    root.add(pose('barao-javardo', { anim: 'idle', t: 0.4, pos: [0.8, 0, -1], rot: [0, -40, 0] }));
    for (let i = 0; i < 7; i++) stumps(b, -9 + i * 2.6, -4 - (i % 3) * 2, i);
    smoke(b, [-8, 4, -14], 16, 1.2, 0x2a2224, 5, 10);
    smoke(b, [7, 3, -16], 12, 1.0, 0x3a2a2a, 9, 8);
    root.add(b.build());
    glow(root, [4, 2, -40], 20, 0xff6a2a, 0.5, cam);
    return { root, camera: cam, fog: new THREE.Fog(0x3a1a14, 10, 70) };
  }),
  // 5 — a garra de lata arranca a Semente-Mãe
  cine('abertura-5', 'noite', (scene) => {
    lights(scene, { key: { pos: [8, 10, 10], color: 0xa8b8ff, i: 1.5, size: 10 }, hemi: { sky: 0x3a4a8a, ground: 0x0a0a18, i: 0.7 } });
    const root = new THREE.Group(), b = new Batch();
    const cam = cinecam([0.5, 1.2, 6.5], [0, 1.6, 0], 40);
    sky(root, NOITE_SKY);
    // ninho de galhos onde a semente dormia
    for (let i = 0; i < 14; i++) branch(b, [Math.cos(i) * 1.2, 0.2 + (i % 3) * 0.1, Math.sin(i) * 0.6 - 0.5], [Math.cos(i + 2) * 1.3, 0.35 + (i % 2) * 0.15, Math.sin(i + 2) * 0.6 - 0.5], 0.08, 0.05, 0x8a7a60);
    branch(b, [-8, -0.6, -1.5], [8, 0.2, -1], 0.8, 0.6, 0xa89a80);
    copa(b, root, [0x14301e, 0x1e4a2a, 0x3a6a4a]);
    garra(b, [0.1, 1.55, -0.4]);
    root.add(b.build());
    semente(root, [0.1, 1.45, -0.4], 1.1, cam, 12);
    root.add(pose('javalim', { anim: 'ataque', t: 0.5, pos: [-2.6, 0.2, -1.6], rot: [0, 20, 0] }));
    return { root, camera: cam, fog: new THREE.Fog(0x14203a, 6, 40) };
  }),
  // 6 — a dupla parte ao amanhecer
  cine('abertura-6', 'por-do-sol', (scene) => {
    lights(scene, { key: { pos: [10, 6, -6], color: 0xffb070, i: 2.6, size: 14 }, rim: { color: 0xffd090, i: 3.2 }, hemi: { sky: 0xffb07a, ground: 0x3a2a3a, i: 0.8 } });
    const root = new THREE.Group(), b = new Batch();
    const cam = cinecam([-1.8, 3.2, 6.4], [0.4, 3.9, 0], 40);
    sky(root, ALVA_SKY);
    copa(b, root, [0x1e3a22, 0x3a6a32, 0x8ab05a]);
    forest(b, { n: 30, r0: 40, r1: 70, h: [10, 16], leaf: [0x2a4a3a, 0x3a5a4a, 0x7a8a6a], seed: 9, under: false });
    root.add(b.build());
    root.add(pose('tama', { anim: 'vitoria', t: 0.55, pos: [-0.5, 3.15, -0.4], rot: [0, 25, 0] }));
    root.add(pose('lili', { anim: 'vitoria', t: 0.62, pos: [0.9, 3.15, -0.2], rot: [0, -10, 0] }));
    glow(root, [30, 8, -80], 22, 0xffc070, 0.8, cam);
    beams(root, [{ pos: [3, 7, -4], w: 3, h: 16, rot: 30, op: 0.25 }, { pos: [6, 7, -6], w: 2, h: 16, rot: 30, op: 0.2 }]);
    return { root, camera: cam, fog: new THREE.Fog(0xd8a080, 14, 90) };
  }),
];

function stumps(b: Batch, x: number, z: number, i: number) {
  b.add(new THREE.CylinderGeometry(0.32 + (i % 3) * 0.08, 0.42 + (i % 2) * 0.1, 0.5 + (i % 3) * 0.2, 14), vmat('bark', 0xffffff), M([x, 0.3, z]), 0x5a4030);
  b.add(new THREE.CylinderGeometry(0.3 + (i % 3) * 0.08, 0.3 + (i % 3) * 0.08, 0.02, 14), vmat('wood', 0xffffff), M([x, 0.56 + (i % 3) * 0.1, z]), 0xd0a46a);
  if (i % 2) mossRock(b, M([x + 0.8, 0, z + 0.4]), [0.3, 0.2, 0.3], 0x4a3a30, null, i);
}

/** Garra de lata do Barão (braço articulado com três dedos). */
function garra(b: Batch, at: [number, number, number]) {
  const metal = vmat('metal', 0xffffff), rust = vmat('rust', 0xffffff);
  const [x, y, z] = at;
  b.add(new THREE.CylinderGeometry(0.09, 0.11, 6, 12), rust, M([x + 1.6, y + 3.2, z], [0, 0, 30]), 0x8a4a2a);
  b.add(new THREE.SphereGeometry(0.22, 16, 12), metal, M([x + 0.15, y + 0.55, z]), 0x9aa0a8);
  for (let k = 0; k < 3; k++) {
    const a = (k / 3) * Math.PI * 2;
    b.add(new THREE.CylinderGeometry(0.035, 0.05, 0.55, 8), metal, M([x + Math.cos(a) * 0.2, y + 0.18, z + Math.sin(a) * 0.2], [Math.sin(a) * 30, 0, -Math.cos(a) * 30]), 0x7a828e);
  }
}
void tree; void rain;
