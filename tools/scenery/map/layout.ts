/**
 * Geografia autoral da Ilha Sumaúma (dados puros + matemática; sem DOM). Usado pela cena do mapa
 * (render) e pelo manifesto (projeção dos nós em px da imagem 2560×1440).
 *
 * Mundos no sentido horário a partir da frente-esquerda:
 *  1 Mata Alta (frente-esquerda) · 2 Grutas Âmbar (fundo-esquerda, serras) ·
 *  3 Recife Bromélia (fundo-direita, enseada e naufrágio) · 4 Fábrica Javarda (frente-direita).
 *  A sumaúma gigante fica no centro.
 */
import * as THREE from 'three';

export const MAP_SIZE: [number, number] = [2560, 1440];
export const TREE_POS: [number, number] = [0, -0.3];
export const TREE_H = 4.2;

/** Ruído suave determinístico (somas de senos). */
function sn(x: number, z: number, s: number) {
  return 0.5 * Math.sin(x * 0.9 + s + Math.sin(z * 0.7 + s)) + 0.3 * Math.sin(z * 1.3 - x * 0.5 + s * 2) + 0.2 * Math.sin(x * 2.3 + z * 1.9 + s * 0.4);
}

/** Distância normalizada ao litoral (1 = no centro, 0 = na costa, <0 = mar). */
export function shore(x: number, z: number) {
  const a = Math.atan2(z, x);
  const rx = 10.2 * (1 + 0.06 * Math.sin(a * 3 + 0.5) + 0.04 * Math.sin(a * 7 + 1.3));
  const rz = 6.4 * (1 + 0.07 * Math.sin(a * 4 + 2.1) + 0.03 * Math.sin(a * 9));
  // enseada do recife (fundo-direita)
  const bay = 0.18 * Math.exp(-(((x - 5.2) / 1.8) ** 2 + ((z + 4.8) / 1.2) ** 2));
  return 1 - Math.hypot(x / rx, z / rz) - bay;
}

/** Peso de cada região (0..1, suave) — 1..4 = mundos. */
export function regionWeight(r: 1 | 2 | 3 | 4, x: number, z: number) {
  const cx = [0, -5.6, -3.6, 4.4, 5.0][r], cz = [0, 2.2, -3.2, -3.4, 2.2][r];
  const d = Math.hypot((x - cx) / 4.6, (z - cz) / 3.4) + 0.08 * sn(x * 1.7, z * 1.7, r);
  const w = 1 - THREE.MathUtils.smoothstep(d, 0.75, 1.05);
  // não invade o pé da árvore central
  const dt = Math.hypot(x - TREE_POS[0], z - TREE_POS[1]);
  return w * THREE.MathUtils.smoothstep(dt, 1.2, 1.9);
}

/** Altura do terreno. */
export function height(x: number, z: number) {
  const s = shore(x, z);
  if (s < 0) return Math.max(-0.6, s * 3);
  const base = 0.35 * Math.min(1, s * 4) + 0.25 * s;
  // serras das grutas (fundo-esquerda)
  const mnt = 2.6 * Math.max(0, 1 - Math.hypot((x + 3.8) / 3.6, (z + 3.9) / 1.9)) ** 1.3 * (0.8 + 0.25 * sn(x * 2.2, z * 2.2, 5));
  // colinas da mata
  const hills = 0.35 * Math.max(0, sn(x * 0.9, z * 1.1, 2)) * regionWeight(1, x, z);
  // platô da fábrica (terraplanado)
  const plat = 0.25 * regionWeight(4, x, z);
  // praia baixa no recife
  const beach = -0.15 * regionWeight(3, x, z);
  // monte da árvore
  const mound = 0.5 * Math.max(0, 1 - Math.hypot(x - TREE_POS[0], z - TREE_POS[1]) / 2.2);
  return base + mnt + hills + plat + beach + mound + 0.06 * sn(x * 3, z * 3, 9);
}

/** Posições (x, z) no mundo de cada nó do mapa. */
export const NODES: Record<string, [number, number] | [number, number, number]> = {
  '1-1': [-7.6, 3.5], '1-2': [-6.2, 2.5], '1-3': [-7.7, 1.2], '1-4': [-5.6, 0.5], 'chefe-1': [-3.7, 1.3],
  '2-1': [-6.4, -1.4], '2-2': [-4.8, -2.4], '2-3': [-2.8, -3.4], 'chefe-2': [-1.0, -4.3],
  '3-1': [1.4, -4.6], '3-2': [3.3, -4.9], '3-3': [5.4, -4.3], '3-4': [7.2, -2.6], 'chefe-3': [5.6, -1.4],
  '4-1': [7.4, 0.7], '4-2': [6.2, 2.4], '4-3': [4.3, 3.5], 'chefe-4': [2.2, 2.7],
  '5-1': [TREE_POS[0], TREE_POS[1], TREE_H * 1.02],
  oficina: [-3.9, 3.7], 'bem-te-vi': [-1.8, 4.0], viveiro: [1.2, 0.8],
  'tucano-1': [-8.8, 2.4], 'tucano-2': [-7.2, -2.8], 'tucano-3': [2.6, -3.4], 'tucano-4': [8.3, 2.0],
};

/** Ponto 3D de um nó (no chão, ou na altura dada). */
export function nodePoint(id: string) {
  const n = NODES[id];
  const y = n.length === 3 ? n[2] : Math.max(0.05, height(n[0], n[1])) + 0.04;
  return new THREE.Vector3(n[0], y, n[1]);
}

export function mapCamera() {
  const [w, h] = MAP_SIZE;
  const cam = new THREE.PerspectiveCamera(33, w / h, 0.5, 200);
  cam.position.set(0, 16.5, 16.5);
  cam.lookAt(0, 0.9, -0.6);
  cam.updateMatrixWorld();
  cam.updateProjectionMatrix();
  return cam;
}

/** Nós projetados em px da imagem. */
export function mapNodesPx() {
  const cam = mapCamera();
  const [w, h] = MAP_SIZE;
  const out: Record<string, [number, number]> = {};
  for (const id of Object.keys(NODES)) {
    const p = nodePoint(id).project(cam);
    out[id] = [Math.round(((p.x + 1) / 2) * w), Math.round(((1 - p.y) / 2) * h)];
  }
  return out;
}
