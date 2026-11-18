/** Final: 8 quadros + cena extra (100%), game over, fundo do título. */
import { THREE, Batch, M, cine, sky, floor, forest, undergrowth, pose, semente, glow, beams, smoke, cinecam, branch, lights, crown, kapok, log, mossRock, rain, vmat, hangingVine, type SceneDef } from '../kit';
import { MAP_SCENES } from '../../scenery/map/ilha';

const DIA: [number, number][] = [[0, 0x8ab8d8], [0.25, 0xbfe0f0], [0.55, 0x6ab0e8], [1, 0x2a6ac0]];
const TARDE: [number, number][] = [[0, 0x4a2a4a], [0.2, 0xe08a5a], [0.4, 0xf8c080], [0.65, 0x9a8ac0], [1, 0x3a3a7a]];
const LEAF: [number, number, number] = [0x1e4a22, 0x3a8a32, 0x8ac04a];

/** Clareira da mata: chão, mata ao fundo e vegetação baixa. */
function clareira(b: Batch, root: THREE.Object3D, o: { seed?: number; leaf?: [number, number, number]; chao?: number } = {}) {
  floor(root, 200, o.chao ?? 0x2e5a1e, 0, 'earth');
  forest(b, { n: 28, r0: 16, r1: 30, h: [8, 13], leaf: o.leaf ?? LEAF, seed: o.seed ?? 3 });
  undergrowth(b, 0, -6, 9, 26, (o.seed ?? 3) + 4, 0x3a8a3a);
}

/** Toma emprestada a ilha do mapa (renascida ou devastada) para planos abertos. */
function ilha(scene: THREE.Scene, id: 'map-ilha-renascida' | 'map-ilha-devastada') {
  const def = MAP_SCENES.find((s) => s.id === id)!;
  return def.build(scene).root;
}

export const FINAL: SceneDef[] = [
  // 1 — o Barão derrotado; Lili segura a Semente-Mãe
  cine('final-1', 'fabrica', (scene) => {
    lights(scene, { key: { pos: [-6, 10, 10], color: 0xffc0a0, i: 2.4, size: 12 }, hemi: { sky: 0x8a6a5a, ground: 0x2a1410, i: 0.9 } });
    const root = new THREE.Group(), b = new Batch();
    const cam = cinecam([1, 2.2, 8.5], [0.2, 1.6, 0], 40);
    sky(root, [[0, 0x2a1a1a], [0.3, 0x8a4a3a], [0.6, 0xc8906a], [1, 0x4a3a5a]]);
    floor(root, 120, 0x4a3a2e, 0, 'rock');
    root.add(pose('barao-javardo', { anim: 'derrota', t: 1, pos: [3.4, 0, -3.2], rot: [0, -50, 0] }));
    root.add(pose('lili', { anim: 'vitoria', t: 0.42, pos: [-0.6, 0, 0.6], rot: [0, 30, 0] }));
    root.add(pose('tama', { anim: 'idle', t: 0.2, pos: [-1.9, 0, -0.2], rot: [0, 40, 0] }));
    smoke(b, [3.6, 0.6, -3.6], 16, 0.9, 0x3a3436, 4, 5);
    for (let i = 0; i < 9; i++) b.add(new THREE.BoxGeometry(0.3 + (i % 3) * 0.2, 0.08, 0.25), vmat('rust', 0xffffff), M([1.6 + (i * 0.71) % 3, 0.04, -1 + (i * 0.53) % 2], [0, i * 40, i % 2 ? 10 : 0]), 0x8a4a2a);
    root.add(b.build());
    semente(root, [-0.45, 1.75, 0.75], 0.9, cam, 8);
    return { root, camera: cam, fog: new THREE.Fog(0x6a4a3a, 10, 60) };
  }),
  // 2 — os Javalins tiram o capacete e plantam mudas
  cine('final-2', 'selva', (scene) => {
    lights(scene, { key: { pos: [-8, 12, 10], i: 2.6, size: 14 } });
    const root = new THREE.Group(), b = new Batch();
    const cam = cinecam([0, 1.9, 6.4], [0, 0.9, 0], 42);
    sky(root, DIA);
    clareira(b, root, { seed: 5, chao: 0x4a3a1e });
    for (let i = 0; i < 4; i++) {
      root.add(pose('javalim', { anim: i % 2 ? 'idle' : 'pegar-arma', t: 0.5, pos: [-3 + i * 2, 0, -0.5 - (i % 2)], rot: [0, -20 + i * 15, 0] }));
      crown(b, M([-2.2 + i * 2, 0.35, 0.4 - (i % 2)]), 0.3, LEAF, i + 40);
      b.add(new THREE.CylinderGeometry(0.03, 0.04, 0.4, 6), vmat('bark', 0xffffff), M([-2.2 + i * 2, 0.2, 0.4 - (i % 2)]), 0x6a4a2a);
    }
    root.add(b.build());
    return { root, camera: cam, fog: new THREE.Fog(0xa8d0e0, 18, 70) };
  }),
  // 3 — a dupla sobe a sumaúma
  cine('final-3', 'selva', (scene) => {
    lights(scene, { key: { pos: [-10, 14, 12], i: 2.6, size: 18 } });
    const root = new THREE.Group(), b = new Batch();
    const cam = cinecam([3, 4, 9], [0, 6.5, 0], 46);
    sky(root, DIA);
    floor(root, 200, 0x2e5a1e, 0, 'earth');
    kapok(b, M([0, 0, -1.8]), 34, { bark: 0xc8b8a0, leaf: LEAF }, 2, { branches: 6, crown: true });
    for (let i = 0; i < 4; i++) hangingVine(b, M([-1.2 + i * 0.9, 14, -0.6]), 12, 0x4a7a2a, 0x5a9a3a, i);
    forest(b, { n: 20, r0: 20, r1: 34, h: [9, 14], leaf: LEAF, seed: 8 });
    root.add(b.build());
    root.add(pose('tama', { anim: 'escalar', t: 0.3, pos: [-0.2, 4.2, -0.05], rot: [0, -90, 0] }));
    root.add(pose('lili', { anim: 'escalar', t: 0.75, pos: [0.7, 6.4, -0.05], rot: [0, -90, 0] }));
    beams(root, [{ pos: [-4, 9, -6], w: 3, h: 22, rot: -20, op: 0.22 }, { pos: [4, 10, -7], w: 2, h: 22, rot: -20, op: 0.18 }]);
    return { root, camera: cam, fog: new THREE.Fog(0xb8e0f0, 20, 90) };
  }),
  // 4 — Tamá cava e Lili coloca a semente na terra
  cine('final-4', 'selva', (scene) => {
    lights(scene, { key: { pos: [-6, 10, 10], i: 2.6, size: 10 }, rim: { i: 3 } });
    const root = new THREE.Group(), b = new Batch();
    const cam = cinecam([0.4, 1.7, 5.6], [0, 0.8, 0], 40);
    sky(root, DIA);
    clareira(b, root, { seed: 11, chao: 0x4a3a1e });
    b.add(new THREE.SphereGeometry(0.6, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), vmat('earth', 0xffffff), M([0, -0.32, 0.4], [0, 0, 0], [1, 0.6, 1]), 0x6a4a2a);
    root.add(b.build());
    root.add(pose('tama', { anim: 'batida', t: 0.45, pos: [-1.2, 0, 0.2], rot: [0, 20, 0] }));
    root.add(pose('lili', { anim: 'pegar', t: 0.6, pos: [0.85, 0, 0.6], rot: [0, -160, 0] }));
    semente(root, [0.2, 0.42, 0.55], 0.6, cam, 4);
    return { root, camera: cam, fog: new THREE.Fog(0xb8e0f0, 14, 60) };
  }),
  // 5 — o broto brilha e a luz se espalha
  cine('final-5', 'selva', (scene) => {
    lights(scene, { key: { pos: [-6, 10, 10], i: 1.8, size: 10 }, hemi: { i: 0.7 } });
    const root = new THREE.Group(), b = new Batch();
    const cam = cinecam([0, 1.3, 5], [0, 1.1, 0], 42);
    sky(root, [[0, 0x2a4a3a], [0.3, 0x6a9a6a], [0.6, 0xf0e0a0], [1, 0x8ab0d8]]);
    clareira(b, root, { seed: 13 });
    b.add(new THREE.CylinderGeometry(0.03, 0.05, 0.8, 8), vmat('leaf', 0xffffff), M([0, 0.4, 0]), 0x4a9a3a);
    for (const [a, z] of [[40, 0.1], [-40, -0.1]] as const) crown(b, M([Math.sign(a) * 0.18, 0.82, z], [0, 0, a], [1, 0.4, 0.6]), 0.18, LEAF, a > 0 ? 7 : 8);
    root.add(b.build());
    root.add(pose('tama', { anim: 'olhar-cima', t: 0.5, pos: [-1.6, 0, -0.4], rot: [0, 40, 0] }));
    root.add(pose('lili', { anim: 'olhar-cima', t: 0.5, pos: [1.5, 0, -0.3], rot: [0, -130, 0] }));
    glow(root, [0, 1.0, 0.1], 1.2, 0xfff0a0, 1, cam);
    glow(root, [0, 1.2, 0], 4, 0xffd060, 0.5, cam);
    beams(root, [{ pos: [0, 4, -0.5], w: 1.4, h: 9, rot: 0, op: 0.45, color: 0xfff0b0 }, { pos: [0.5, 4, -0.6], w: 0.8, h: 9, rot: 8, op: 0.3 }, { pos: [-0.5, 4, -0.6], w: 0.8, h: 9, rot: -8, op: 0.3 }]);
    const l = new THREE.PointLight(0xffe08a, 14, 8, 1.4); l.position.set(0, 1.2, 0.6); root.add(l);
    return { root, camera: cam, fog: new THREE.Fog(0xd8e0b0, 10, 50) };
  }),
  // 6 — a ilha inteira renasce (vista aérea)
  cine('final-6', 'neutro', (scene) => {
    lights(scene, { key: { pos: [-30, 45, 25], size: 16, shadow: 4096, radius: 2 }, hemi: { i: 1.0 } });
    const root = new THREE.Group();
    root.add(ilha(scene, 'map-ilha-renascida'));
    const cam = cinecam([4, 7, 15], [0, 1.6, -1], 46);
    sky(root, DIA, 200);
    return { root, camera: cam, background: 0x2a6ac0, fog: new THREE.Fog(0xa8d0f0, 18, 60) };
  }),
  // 7 — Vô Bugio rega a muda e o Tucano conta a história
  cine('final-7', 'selva', (scene) => {
    lights(scene, { key: { pos: [-8, 12, 10], i: 2.6, size: 12 } });
    const root = new THREE.Group(), b = new Batch();
    const cam = cinecam([0.4, 1.9, 6.6], [0.2, 1.1, 0], 40);
    sky(root, DIA);
    clareira(b, root, { seed: 17 });
    crown(b, M([0.4, 0.5, 0.2]), 0.42, LEAF, 77);
    b.add(new THREE.CylinderGeometry(0.04, 0.06, 0.5, 8), vmat('bark', 0xffffff), M([0.4, 0.25, 0.2]), 0x6a4a2a);
    log(b, M([-2.6, 0.25, -0.6], [0, 20, 0]), 2.2, 0.28, 0x6a5040, 0x4a8a3a, 3);
    root.add(b.build());
    root.add(pose('vo-bugio', { anim: 'apontar', t: 0.5, pos: [-0.9, 0, 0.1], rot: [0, 30, 0] }));
    root.add(pose('tucano', { anim: 'comentar', t: 0.4, pos: [-2.5, 0.5, -0.6], rot: [0, 40, 0] }));
    root.add(pose('preguica', { anim: 'idle', t: 0.3, pos: [2.2, 0, -1.4], rot: [0, -40, 0] }));
    root.add(pose('quati', { anim: 'idle', t: 0.2, pos: [1.6, 0, 0.6], rot: [0, -60, 0] }));
    return { root, camera: cam, fog: new THREE.Fog(0xb8e0f0, 14, 60) };
  }),
  // 8 — a dupla dorme de novo na sumaúma ao pôr do sol
  cine('final-8', 'por-do-sol', (scene) => {
    lights(scene, { key: { pos: [12, 5, -4], color: 0xffa060, i: 2.8, size: 14 }, rim: { color: 0xffc070, i: 3.4 }, hemi: { sky: 0xffb07a, ground: 0x3a2a3a, i: 0.9 } });
    const root = new THREE.Group(), b = new Batch();
    const cam = cinecam([0.2, 4.4, 4.4], [0, 3.7, 0], 36);
    sky(root, TARDE);
    branch(b, [-14, 2.2, -1], [9, 3.1, -0.6], 0.95, 0.55, 0xb8a080);
    for (let i = 0; i < 8; i++) crown(b, M([-12 + i * 3.4, 7.8 + (i % 3), -6 - (i % 2) * 3]), 3, [0x2a4a22, 0x4a7a32, 0xc8b060], i + 3);
    for (let i = 0; i < 5; i++) hangingVine(b, M([-8 + i * 3.6, 9, -2.5 - (i % 3)]), 5 + (i % 3), 0x4a5a2a, 0x6a8a3a, i);
    root.add(b.build());
    root.add(pose('tama', { anim: 'agachar', t: 1, pos: [-0.45, 3.15, -0.35], rot: [0, -60, 0], tweak: { head: [0, 0, -30], neck: [0, 0, -20], tail1: [0, 30, 0] } }));
    root.add(pose('lili', { anim: 'agachar', t: 1, pos: [0.45, 3.15, -0.1], rot: [0, -125, 0], tweak: { head: [0, 0, -38], neck: [0, 0, -15], tail1: [0, 0, -30] } }));
    semente(root, [-3.5, 5.2, -2.5], 0.7, cam, 4);
    glow(root, [20, 5, -60], 16, 0xffb050, 0.85, cam);
    return { root, camera: cam, fog: new THREE.Fog(0xe0a080, 10, 50) };
  }),
  // extra — 100%: uma segunda semente brilha no alto da Copa
  cine('final-extra', 'noite', (scene) => {
    lights(scene, { key: { pos: [-10, 20, 14], color: 0xb8c8ff, i: 2.0, size: 20 }, hemi: { sky: 0x4a5a9a, ground: 0x10101e, i: 1.0 } });
    const root = new THREE.Group(), b = new Batch();
    const cam = cinecam([0, 3.2, 9], [0, 5, 0], 44);
    sky(root, [[0, 0x0a1428], [0.3, 0x1a2a5a], [0.6, 0x3a2a6a], [1, 0x0a0a20]]);
    for (let i = 0; i < 12; i++) crown(b, M([-12 + i * 2.2, 1 + (i % 3) * 0.8, -4 - (i % 4) * 2]), 2.6, [0x14301e, 0x1e4a2a, 0x3a6a4a], i + 50);
    branch(b, [-6, 3.5, -1], [6, 3.9, -1.2], 0.5, 0.35, 0x9a8a70);
    root.add(b.build());
    semente(root, [1.2, 4.6, -1.0], 1.2, cam, 16);
    root.add(pose('tama', { anim: 'olhar-cima', t: 0.5, pos: [-1.6, 3.85, -0.9], rot: [0, 20, 0] }));
    root.add(pose('lili', { anim: 'olhar-cima', t: 0.5, pos: [-0.4, 3.9, -0.9], rot: [0, 10, 0] }));
    for (let i = 0; i < 60; i++) glow(root, [-80 + (i * 37) % 160, 15 + (i * 53) % 50, -120], 0.5 + (i % 3) * 0.3, 0xffffff, 0.8, cam);
    return { root, camera: cam, fog: new THREE.Fog(0x14203a, 12, 60) };
  }),
];

export const TELAS: SceneDef[] = [
  // Game over: a dupla sentada triste num tronco, debaixo de chuva
  cine('gameover', 'noite', (scene) => {
    lights(scene, { key: { pos: [-4, 12, 8], color: 0x9ab0e0, i: 2.0, size: 10 }, hemi: { sky: 0x4a5a8a, ground: 0x10141e, i: 1.0 } });
    const root = new THREE.Group(), b = new Batch();
    const cam = cinecam([0, 1.5, 5.6], [0, 0.95, 0], 40);
    sky(root, [[0, 0x1a2230], [0.4, 0x2a3448], [1, 0x10141e]]);
    clareira(b, root, { seed: 21, leaf: [0x14261e, 0x1e3a2a, 0x2e5a3a], chao: 0x2a3424 });
    log(b, M([0, 0, 0]), 3.4, 0.34, 0x5a4a3a, 0x3a6a2a, 9);
    mossRock(b, M([-2.2, 0, 0.8]), [0.4, 0.3, 0.4], 0x4a4a48, 0x3a6a2a, 3);
    for (let i = 0; i < 3; i++) b.add(new THREE.CircleGeometry(0.5 + i * 0.2, 24), vmat('water', 0xffffff, { opacity: 0.7 }), M([-1.5 + i * 1.6, 0.012, 1 - i * 0.3], [-90, 0, 0]), 0x6a7a9a);
    root.add(b.build());
    root.add(pose('tama', { anim: 'agachar', t: 1, pos: [-0.55, 0.6, 0.1], rot: [0, -70, 0], tweak: { head: [0, 0, -28], neck: [0, 0, -18] } }));
    root.add(pose('lili', { anim: 'agachar', t: 1, pos: [0.6, 0.62, 0.1], rot: [0, -110, 0], tweak: { head: [0, 0, -32], tail1: [0, 0, -50] } }));
    rain(root, 1600, { x: [-6, 6], y: [-0.5, 6], z: [-4, 3] });
    return { root, camera: cam, fog: new THREE.Fog(0x2a3448, 6, 30) };
  }),
  // Fundo da tela título: a mata e a sumaúma ao amanhecer, espaço livre no centro para a logo
  cine('titulo-fundo', 'selva', (scene) => {
    lights(scene, { key: { pos: [-14, 20, 10], color: 0xfff0d0, i: 2.4, size: 30 }, rim: { i: 3 } });
    const root = new THREE.Group(), b = new Batch();
    const cam = cinecam([0, 3, 26], [0, 8, 0], 46);
    sky(root, [[0, 0x6aa0c0], [0.3, 0xc8e0e8], [0.55, 0x7ab8e0], [1, 0x2a5aa8]]);
    floor(root, 240, 0x2e5a1e, 0, 'earth');
    kapok(b, M([0, 0, -18]), 40, { bark: 0xc8b8a0, leaf: LEAF }, 4, { branches: 8, crown: true });
    forest(b, { n: 40, r0: 14, r1: 40, h: [10, 17], leaf: LEAF, seed: 31 });
    undergrowth(b, 0, 8, 12, 40, 33, 0x3a8a3a);
    for (let i = 0; i < 6; i++) hangingVine(b, M([-13 + i * 5.2, 20, 4 - (i % 2) * 3]), 10 + (i % 3) * 3, 0x3a6a2a, 0x4a8a3a, i);
    root.add(b.build());
    beams(root, [{ pos: [-8, 14, -6], w: 4, h: 34, rot: -22, op: 0.22 }, { pos: [6, 14, -8], w: 3, h: 34, rot: -22, op: 0.2 }, { pos: [14, 14, -10], w: 5, h: 34, rot: -22, op: 0.15 }]);
    return { root, camera: cam, fog: new THREE.Fog(0xb8d8e8, 24, 110) };
  }),
];
