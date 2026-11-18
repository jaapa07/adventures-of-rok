/**
 * Página de render das cinemáticas e imagens de tela (Chromium headless do build, nunca no jogo).
 * Mesmo padrão de tools/render/client.ts, mas só com as cenas de tools/cine.
 */
import * as THREE from 'three';
import { loadTextures } from '../render/materials';
import { applyPreset } from '../render/presets';
import { CINE_SCENES } from './scenes/index';

declare global {
  interface Window { ready: boolean; listCine(): unknown[]; renderCine(id: string): Promise<unknown> }
}

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

window.listCine = () => CINE_SCENES.map((s) => ({ id: s.id, out: s.out }));
window.renderCine = async (id) => {
  const def = CINE_SCENES.find((s) => s.id === id);
  if (!def) throw new Error('cena inexistente ' + id);
  const ss = def.ss ?? 1.25;
  const [w, h] = def.size;
  renderer.setSize(Math.round(w * ss), Math.round(h * ss), false);
  const scene = new THREE.Scene();
  applyPreset(scene, renderer, def.preset);
  const { root, camera, background, fog } = def.build(scene);
  scene.add(root);
  if (fog) scene.fog = fog;
  renderer.setClearColor(background ?? 0x000000, 1);
  root.updateMatrixWorld(true);
  renderer.render(scene, camera);
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d')!;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(renderer.domElement, 0, 0, w, h);
  root.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh) m.geometry.dispose(); });
  return { id, dataUrl: c.toDataURL('image/webp', 0.88), out: def.out };
};

(async () => { await loadTextures(); window.ready = true; })();
