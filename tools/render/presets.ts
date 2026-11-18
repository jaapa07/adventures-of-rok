/** Presets de iluminação por mundo (3 pontos + rim forte). */
import * as THREE from 'three';
import { setRim } from './materials';

export type PresetId = 'selva' | 'caverna' | 'recife' | 'fabrica' | 'bonus' | 'neutro' | 'por-do-sol' | 'noite';

interface Preset { hemiSky: number; hemiGround: number; hemi: number; key: number; keyI: number; fill: number; fillI: number; rim: number; rimI: number; fres: number; fresI: number; exposure: number }

export const PRESETS: Record<PresetId, Preset> = {
  selva:       { hemiSky: 0xcfe8ff, hemiGround: 0x3d5a2a, hemi: 0.9, key: 0xfff0d0, keyI: 2.6, fill: 0x8fb8ff, fillI: 0.6, rim: 0xfff6c8, rimI: 2.2, fres: 0xfff2c4, fresI: 0.55, exposure: 1.0 },
  caverna:     { hemiSky: 0x7a5a3a, hemiGround: 0x1a1008, hemi: 0.55, key: 0xffb860, keyI: 2.4, fill: 0x5a6cff, fillI: 0.35, rim: 0xffc070, rimI: 2.6, fres: 0xffa850, fresI: 0.65, exposure: 0.95 },
  recife:      { hemiSky: 0x6ad0ff, hemiGround: 0x0a2a4a, hemi: 0.8, key: 0xc8f0ff, keyI: 2.0, fill: 0x2a6aff, fillI: 0.7, rim: 0x9ff6ff, rimI: 2.4, fres: 0x80e8ff, fresI: 0.7, exposure: 1.0 },
  fabrica:     { hemiSky: 0x8a5a4a, hemiGround: 0x200a08, hemi: 0.6, key: 0xffa070, keyI: 2.4, fill: 0x6a7aa0, fillI: 0.45, rim: 0xff6a3a, rimI: 2.8, fres: 0xff7a40, fresI: 0.65, exposure: 1.0 },
  bonus:       { hemiSky: 0xd8b0ff, hemiGround: 0x2a0a4a, hemi: 0.8, key: 0xfff0ff, keyI: 2.2, fill: 0x9a6aff, fillI: 0.7, rim: 0xe0a0ff, rimI: 2.6, fres: 0xd890ff, fresI: 0.7, exposure: 1.0 },
  neutro:      { hemiSky: 0xffffff, hemiGround: 0x6a5a4a, hemi: 1.0, key: 0xfff4e4, keyI: 2.4, fill: 0xa8c4ff, fillI: 0.6, rim: 0xffffff, rimI: 2.0, fres: 0xffffff, fresI: 0.45, exposure: 1.0 },
  'por-do-sol':{ hemiSky: 0xffb07a, hemiGround: 0x3a2a3a, hemi: 0.75, key: 0xff9a50, keyI: 2.6, fill: 0x7a6aff, fillI: 0.55, rim: 0xffc070, rimI: 2.8, fres: 0xff9050, fresI: 0.7, exposure: 1.0 },
  noite:       { hemiSky: 0x3a4a8a, hemiGround: 0x0a0a18, hemi: 0.6, key: 0xa8c0ff, keyI: 1.6, fill: 0x4a3a8a, fillI: 0.5, rim: 0xc0d8ff, rimI: 2.2, fres: 0x9ab8ff, fresI: 0.6, exposure: 0.9 },
};

export function applyPreset(scene: THREE.Scene, renderer: THREE.WebGLRenderer, id: PresetId) {
  const p = PRESETS[id];
  for (const o of [...scene.children]) if ((o as THREE.Light).isLight || o.userData.lightRig) scene.remove(o);
  const hemi = new THREE.HemisphereLight(p.hemiSky, p.hemiGround, p.hemi);
  const key = new THREE.DirectionalLight(p.key, p.keyI);
  key.position.set(-4, 7, 6);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.bias = -0.0008;
  key.shadow.normalBias = 0.02;
  const sc = key.shadow.camera as THREE.OrthographicCamera;
  sc.left = -8; sc.right = 8; sc.top = 8; sc.bottom = -8; sc.near = 0.1; sc.far = 40;
  const fill = new THREE.DirectionalLight(p.fill, p.fillI);
  fill.position.set(6, 2, 5);
  const rim = new THREE.DirectionalLight(p.rim, p.rimI);
  rim.position.set(3, 4, -7);
  for (const l of [hemi, key, fill, rim]) { l.userData.lightRig = true; scene.add(l); }
  setRim(p.fres, p.fresI / 0.55);
  renderer.toneMappingExposure = p.exposure;
}
