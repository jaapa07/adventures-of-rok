/**
 * Página de render (roda no Chromium headless do build). Constrói cada modelo autoral,
 * aplica preset de luz, anima quadro a quadro e devolve spritesheets em WebP + metadados.
 * NADA daqui é carregado pelo jogo.
 */
import * as THREE from 'three';
import { loadTextures } from './materials';
import { applyPreset, type PresetId } from './presets';
import { storeRest, applyAnim, frameT, resetPose } from './anim';
import { MODELS } from '../models/index';
import type { ModelDef } from './types';
import { SCENES, type SceneDef } from '../scenery/index';

declare global {
  interface Window {
    ready: boolean;
    listModels(): unknown[];
    renderModel(id: string, variant: string, onlyPresets?: string[], onlyAnims?: string[]): Promise<unknown>;
    listScenes(): unknown[];
    renderScene(id: string): Promise<unknown>;
  }
}

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setClearColor(0x000000, 0);
document.body.appendChild(renderer.domElement);

function makeCamera(def: ModelDef) {
  const [cw, ch] = def.cell;
  const [px, py] = def.pivot;
  const u = def.height / ch;
  const cam = new THREE.OrthographicCamera(-px * u, (cw - px) * u, py * u, -(ch - py) * u, 0.1, 100);
  const yaw = (def.camera?.yaw ?? 12) * (Math.PI / 180);
  const pitch = (def.camera?.pitch ?? -8) * (Math.PI / 180);
  const dist = 30;
  cam.position.set(Math.sin(yaw) * Math.cos(pitch) * dist, -Math.sin(pitch) * dist, Math.cos(yaw) * Math.cos(pitch) * dist);
  cam.lookAt(0, 0, 0);
  cam.updateMatrixWorld();
  return cam;
}

function bbox(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const d = ctx.getImageData(0, 0, w, h).data;
  let x0 = w, y0 = h, x1 = -1, y1 = -1;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (d[(y * w + x) * 4 + 3] > 60) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  }
  if (x1 < 0) return [0, 0, 0, 0];
  return [x0, y0, x1 - x0 + 1, y1 - y0 + 1];
}

function disposeTree(o: THREE.Object3D) {
  o.traverse((c) => { const m = c as THREE.Mesh; if (m.isMesh) m.geometry.dispose(); });
}

window.listModels = () => MODELS.map((m) => ({ id: m.id, kind: m.kind, presets: m.presets, variants: m.variants ?? ['base'], anims: Object.keys(m.anims) }));

window.renderModel = async (id, variant, onlyPresets, onlyAnims) => {
  const def = MODELS.find((m) => m.id === id);
  if (!def) throw new Error('modelo inexistente ' + id);
  const ss = def.ss ?? 2;
  const [cw, ch] = def.cell;
  renderer.setSize(cw * ss, ch * ss, false);
  const scene = new THREE.Scene();
  const rig = def.build(variant);
  scene.add(rig.root);
  storeRest(rig.bones);
  const cam = makeCamera(def);
  const meshCount = rig.meshCount();
  const frameCanvas = document.createElement('canvas');
  frameCanvas.width = cw; frameCanvas.height = ch;
  const fctx = frameCanvas.getContext('2d', { willReadFrequently: true })!;
  fctx.imageSmoothingEnabled = true; fctx.imageSmoothingQuality = 'high';
  const out: unknown[] = [];
  const presets = def.presets.filter((p) => !onlyPresets?.length || onlyPresets.includes(p));
  const anims = Object.entries(def.anims).filter(([n]) => !onlyAnims?.length || onlyAnims.includes(n));
  for (const preset of presets) {
    applyPreset(scene, renderer, preset as PresetId);
    for (const [name, anim] of anims) {
      const n = anim.frames;
      const cols = Math.min(n, 8);
      const rows = Math.ceil(n / cols);
      const sheet = document.createElement('canvas');
      sheet.width = cw * cols; sheet.height = ch * rows;
      const sctx = sheet.getContext('2d')!;
      const boxes: number[][] = [];
      const hands: Record<string, number[][]> = {};
      for (let i = 0; i < n; i++) {
        applyAnim(rig.bones, anim, frameT(anim, i));
        rig.root.updateMatrixWorld(true);
        renderer.render(scene, cam);
        fctx.clearRect(0, 0, cw, ch);
        fctx.drawImage(renderer.domElement, 0, 0, cw, ch);
        const [bx, by, bw, bh] = bbox(fctx, cw, ch);
        boxes.push([bx - def.pivot[0], by - def.pivot[1], bw, bh]);
        sctx.drawImage(frameCanvas, (i % cols) * cw, Math.floor(i / cols) * ch);
        for (const [an, obj] of Object.entries(rig.anchors)) {
          const p = new THREE.Vector3().setFromMatrixPosition(obj.matrixWorld);
          const q = new THREE.Vector3(0.2, 0, 0).applyMatrix4(obj.matrixWorld);
          const a = p.clone().project(cam), b = q.clone().project(cam);
          const sx = ((a.x + 1) / 2) * cw - def.pivot[0], sy = ((1 - a.y) / 2) * ch - def.pivot[1];
          const ang = Math.atan2(-(b.y - a.y) * ch, (b.x - a.x) * cw) * (180 / Math.PI);
          (hands[an] ??= []).push([Math.round(sx * 10) / 10, Math.round(sy * 10) / 10, Math.round(ang)]);
        }
      }
      out.push({ preset, anim: name, dataUrl: sheet.toDataURL('image/webp', 0.9), cw, ch, cols, n, fps: anim.fps ?? 24, loop: anim.loop ?? true, px: def.pivot[0], py: def.pivot[1], boxes, hands });
    }
  }
  // sombra de contato: passe separado, luz vertical, só o chão é visto pela câmera
  let shadow: string | null = null;
  if ((def.shadow ?? ['hero', 'mount', 'enemy', 'boss', 'npc'].includes(def.kind)) && presets.length) {
    resetPose(rig.bones);
    rig.root.updateMatrixWorld(true);
    for (const o of [...scene.children]) if ((o as THREE.Light).isLight) scene.remove(o);
    const top = new THREE.DirectionalLight(0xffffff, 1);
    top.position.set(0, 12, 0.6);
    top.castShadow = true;
    top.shadow.mapSize.set(1024, 1024);
    top.shadow.radius = 8;
    const sc = top.shadow.camera as THREE.OrthographicCamera;
    sc.left = -6; sc.right = 6; sc.top = 6; sc.bottom = -6;
    scene.add(top);
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.ShadowMaterial({ opacity: 0.55 }));
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    ground.layers.set(1);
    scene.add(ground);
    cam.layers.set(1);
    renderer.render(scene, cam);
    fctx.clearRect(0, 0, cw, ch);
    fctx.drawImage(renderer.domElement, 0, 0, cw, ch);
    shadow = frameCanvas.toDataURL('image/webp', 0.9);
    cam.layers.set(0);
    scene.remove(ground, top);
  }
  disposeTree(rig.root);
  return { id, variant, meshCount, sheets: out, shadow };
};

/* --------- Cenas (tiles, parallax, mapa, cinemáticas) --------- */
window.listScenes = () => SCENES.map((s) => ({ id: s.id, w: s.size[0], h: s.size[1], out: s.out }));
window.renderScene = async (id) => {
  const def = SCENES.find((s) => s.id === id) as SceneDef;
  if (!def) throw new Error('cena inexistente ' + id);
  const ss = def.ss ?? 1.5;
  const [w, h] = def.size;
  renderer.setSize(Math.round(w * ss), Math.round(h * ss), false);
  const scene = new THREE.Scene();
  applyPreset(scene, renderer, def.preset);
  const { root, camera, background, fog } = def.build(scene);
  scene.add(root);
  if (fog) scene.fog = fog;
  renderer.setClearColor(background ?? 0x000000, background === undefined ? 0 : 1);
  root.updateMatrixWorld(true);
  renderer.render(scene, camera);
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d')!;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(renderer.domElement, 0, 0, w, h);
  disposeTree(root);
  renderer.setClearColor(0x000000, 0);
  scene.fog = null;
  return { id, dataUrl: c.toDataURL(def.format === 'png' ? 'image/png' : 'image/webp', 0.9), out: def.out };
};

(async () => {
  await loadTextures();
  window.ready = true;
})();
