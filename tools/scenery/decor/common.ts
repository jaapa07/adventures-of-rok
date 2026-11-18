/**
 * Decor: objetos soltos renderizados com fundo transparente. Escala 1 unidade = 64 px (um tile),
 * câmera ortográfica com leve inclinação/guinada (mesma leitura de volume dos sprites).
 * A origem (0,0,0) é a base do objeto; para itens pendurados (`hang`) é o ponto de fixação no teto.
 * Após o render a imagem é recortada ao conteúdo e a âncora é corrigida (tools/render-scenery.ts).
 */
import * as THREE from 'three';
import type { SceneDef } from '../types';
import type { PresetId } from '../../render/presets';
import { Batch, tuneLights, type LightTune } from '../lib/core';

export interface DecorDef {
  name: string;
  /** tamanho da tela de render em px (antes do recorte) */
  size: [number, number];
  hang?: boolean;
  build(b: Batch, root: THREE.Group): void;
}

const PITCH = -9, YAW = 10;
const MARGIN = 10;
const BASE_MARGIN = 44;

export function decorScenes(ts: string, preset: PresetId, defs: DecorDef[], light?: LightTune): SceneDef[] {
  return defs.map((d) => {
    // tela folgada (o recorte final remove o excesso); escala fixa de 64 px por unidade
    const w = Math.round(d.size[0] * 1.6 / 16) * 16, h = Math.round(d.size[1] * 1.4 / 16) * 16;
    const ax = w / 2, ay = d.hang ? MARGIN : h - BASE_MARGIN;
    return {
      id: `decor-${ts}-${d.name}`,
      out: `decor/${ts}/${d.name}.webp`,
      size: [w, h],
      preset,
      ss: 2,
      meta: { kind: 'decor', key: `${ts}/${d.name}`, anchor: [ax, ay], crop: true },
      build(scene) {
        if (light) tuneLights(scene, light);
        const root = new THREE.Group();
        const b = new Batch();
        d.build(b, root);
        root.add(b.build());
        const W = w / 64, H = h / 64;
        const p = (PITCH * Math.PI) / 180, y = (YAW * Math.PI) / 180;
        const cam = new THREE.OrthographicCamera(-W / 2, W / 2, H / 2, -H / 2, 0.1, 200);
        // posiciona o alvo para que a origem caia no pixel da âncora
        const dy = (ay - h / 2) / 64; // origem fica dy abaixo do centro da tela
        const target = new THREE.Vector3(0, dy / Math.cos(p), 0);
        const dist = 60;
        cam.position.set(target.x + Math.sin(y) * Math.cos(p) * dist, target.y - Math.sin(p) * dist, target.z + Math.cos(y) * Math.cos(p) * dist);
        cam.lookAt(target);
        cam.updateMatrixWorld();
        cam.updateProjectionMatrix();
        return { root, camera: cam };
      },
    };
  });
}

/** Textura desenhada em canvas (placas, painéis, emblemas). */
export function canvasTex(w: number, h: number, draw: (x: CanvasRenderingContext2D) => void) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d')!);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/** Emblema autoral do Barão Javardo: cabeça de javali de perfil com presas, num escudo dentado. */
export function drawBoarEmblem(x: CanvasRenderingContext2D, cx: number, cy: number, s: number, fg: string, bg: string) {
  x.save();
  x.translate(cx, cy);
  x.scale(s / 100, s / 100);
  // engrenagem de fundo
  x.fillStyle = bg;
  x.beginPath();
  for (let i = 0; i <= 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    const r = i % 2 ? 46 : 52;
    x.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  x.fill();
  x.fillStyle = fg;
  x.beginPath();
  // cabeça: testa, focinho achatado, mandíbula
  x.moveTo(-30, -18); x.quadraticCurveTo(-10, -34, 14, -22); x.lineTo(34, -6); x.quadraticCurveTo(40, 2, 36, 10);
  x.lineTo(14, 16); x.quadraticCurveTo(0, 30, -20, 24); x.quadraticCurveTo(-36, 10, -30, -18);
  x.fill();
  // orelha
  x.beginPath(); x.moveTo(-22, -20); x.lineTo(-30, -40); x.lineTo(-8, -26); x.fill();
  // presa
  x.fillStyle = bg;
  x.beginPath(); x.moveTo(18, 12); x.quadraticCurveTo(28, 8, 26, -6); x.quadraticCurveTo(22, 4, 14, 8); x.fill();
  // olho bravo
  x.beginPath(); x.moveTo(-2, -14); x.lineTo(10, -10); x.lineTo(-2, -8); x.fill();
  // narina
  x.beginPath(); x.arc(32, 2, 3, 0, Math.PI * 2); x.fill();
  x.restore();
}
