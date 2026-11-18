/**
 * Infra das camadas de parallax: cena ortográfica levemente inclinada, repetível na horizontal
 * (objetos perto das bordas são duplicados em x ± largura), névoa por profundidade e luz ajustada.
 */
import * as THREE from 'three';
import type { SceneDef } from '../types';
import type { PresetId } from '../../render/presets';
import { Batch, orthoCamera, tuneLights, basic, beamTex, radialTex, TAU, type LightTune, type V3 } from '../lib/core';

export const PX_PER_UNIT = 64;
import { LAYER_SIZE } from '../data';
export { LAYER_SIZE };

export interface LayerCtx {
  b: Batch;
  /** lote sem sombra (folhagem distante, céu) */
  nb: Batch;
  root: THREE.Group;
  W: number;
  H: number;
  scene: THREE.Scene;
  /** Executa fn(x) para x e para as cópias necessárias em x±W (emenda sem costura). */
  wrap(x: number, r: number, fn: (x: number) => void): void;
}

export interface LayerOpts {
  preset: PresetId;
  size?: [number, number];
  light?: LightTune;
  fog?: { color: number; near: number; far: number };
  pitch?: number;
  /** altura (unidades) do plano y=0 acima da base da imagem */
  base?: number;
  background?: number;
  build(c: LayerCtx): void;
}

export function layerScene(set: string, n: number, o: LayerOpts): SceneDef {
  const size = o.size ?? LAYER_SIZE;
  return {
    id: `parallax-${set}-${n}`,
    out: `parallax/${set}/${n}.webp`,
    size,
    preset: o.preset,
    ss: 1.5,
    meta: { kind: 'parallax', key: set },
    build(scene) {
      const W = size[0] / PX_PER_UNIT, H = size[1] / PX_PER_UNIT;
      tuneLights(scene, {
        ...o.light,
        key: { pos: [-28, 50, 40], size: W * 0.75, shadow: 4096, radius: 3, ...(o.light?.key ?? {}) },
      });
      const root = new THREE.Group();
      const c: LayerCtx = {
        b: new Batch(), nb: new Batch(), root, W, H, scene,
        wrap(x, r, fn) {
          fn(x);
          if (x - r < -W / 2) fn(x + W);
          if (x + r > W / 2) fn(x - W);
        },
      };
      o.build(c);
      root.add(c.b.build());
      root.add(c.nb.build({ cast: false, receive: true }));
      const base = o.base ?? 0.6;
      const cam = orthoCamera(W, H, [0, H / 2 - base, 0], o.pitch ?? -5, 0, 60);
      const fog = o.fog ? new THREE.Fog(o.fog.color, o.fog.near, o.fog.far) : undefined;
      return { root, camera: cam, fog, background: o.background };
    },
  };
}

/** Faixa de chão periódica (período W) entre z0 (fundo) e z1 (frente). */
export function groundStrip(c: LayerCtx, z0: number, z1: number, height: (x: number, z: number) => number, color: (x: number, z: number, y: number) => THREE.Color, mat: THREE.Material, nx = 160, nz = 24) {
  const W = c.W;
  const pos: number[] = [], col: number[] = [], idx: number[] = [];
  for (let j = 0; j <= nz; j++) for (let i = 0; i <= nx; i++) {
    const x = -W / 2 - 1 + (W + 2) * (i / nx);
    const z = z0 + (z1 - z0) * (j / nz);
    const y = height(x, z);
    pos.push(x, y, z);
    const cc = color(x, z, y);
    col.push(cc.r, cc.g, cc.b);
  }
  const R = nx + 1;
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
    const a = j * R + i, b = a + 1, cc = a + R, d = cc + 1;
    idx.push(a, cc, d, a, d, b);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  const m = new THREE.Mesh(g, mat);
  m.receiveShadow = true;
  c.root.add(m);
  return m;
}

/** Seno periódico na largura da camada (k inteiro). */
export function per(x: number, W: number, k: number, ph = 0) {
  return Math.sin((x / W) * TAU * k + ph);
}

/** Feixes de luz (aditivos) inclinados. */
export function beams(c: LayerCtx, list: { x: number; y: number; z: number; w: number; h: number; ang: number; op: number }[], color = 0xfff2c0) {
  const t = beamTex();
  for (const L of list) {
    c.wrap(L.x, L.w + L.h * 0.5, (x) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(L.w, L.h), basic(color, { additive: true, map: t, opacity: L.op, fog: false }));
      m.position.set(x, L.y, L.z);
      m.rotation.z = (L.ang * Math.PI) / 180;
      c.root.add(m);
    });
  }
}

/** Halo/brilho aditivo (sol, lamparinas, cristais). */
export function glow(c: LayerCtx | THREE.Object3D, pos: V3, r: number, color: number, op = 0.8) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(r * 2, r * 2), basic(color, { additive: true, map: radialTex(), opacity: op, fog: false }));
  m.position.set(...pos);
  if ((c as LayerCtx).root) (c as LayerCtx).root.add(m); else (c as THREE.Object3D).add(m);
  return m;
}

/** Partículas (poeira/esporos/bolhas) como pequenos discos brilhantes. */
export function motes(c: LayerCtx, n: number, area: { y0: number; y1: number; z0: number; z1: number }, color: number, r: number, seed = 0, op = 0.6) {
  const tex = radialTex();
  for (let i = 0; i < n; i++) {
    const s = Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453;
    const h1 = s - Math.floor(s);
    const s2 = Math.sin(i * 39.3468 + seed * 11.135) * 24634.6345;
    const h2 = s2 - Math.floor(s2);
    const s3 = Math.sin(i * 73.156 + seed * 3.7) * 12345.678;
    const h3 = s3 - Math.floor(s3);
    const x = -c.W / 2 + h1 * c.W;
    const y = area.y0 + (area.y1 - area.y0) * h2;
    const z = area.z0 + (area.z1 - area.z0) * h3;
    const rr = r * (0.5 + h3);
    c.wrap(x, rr, (xx) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(rr * 2, rr * 2), basic(color, { additive: true, map: tex, opacity: op, fog: false }));
      m.position.set(xx, y, z);
      c.root.add(m);
    });
  }
}
