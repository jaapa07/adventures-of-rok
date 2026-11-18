/**
 * Montagem genérica de um tileset: corpo esculpido por máscara de vizinhos, rampas, plataformas,
 * espinhos, cipós, corda, peças especiais e a faixa de ondas da água (4 quadros).
 * Cada tema (mata, gruta…) fornece estilo do corpo e os enfeites.
 */
import * as THREE from 'three';
import type { SceneDef } from '../types';
import type { PresetId } from '../../render/presets';
import { Batch, obliqueCamera, tuneLights, type LightTune } from '../lib/core';
import { bodyGeometry, type BodyStyle, type Shape, type Expose } from '../lib/terrain';

/** Inclinação oblíqua dos tiles: quanto o fundo (z negativo) sobe na tela por unidade. */
export const TILE_K = 0.55;

export interface TileCtx {
  sh: Shape;
  st: BodyStyle;
  /** lote para enfeites (já mesclados no final) */
  b: Batch;
  root: THREE.Group;
  mask: number;
  variant: 'a' | 'b' | 'c';
  name: string;
}

export interface TileTheme {
  id: string;
  preset: PresetId;
  light?: LightTune;
  body: BodyStyle;
  bodyMat: () => THREE.Material;
  /** enfeites do topo exposto (grama, musgo, coral…) */
  top?(c: TileCtx): void;
  /** enfeites do teto exposto (raízes, estalactites…) */
  bottom?(c: TileCtx): void;
  /** enfeites das laterais expostas */
  side?(c: TileCtx, side: 1 | -1): void;
  /** detalhes no interior (pedras, raízes) por variação */
  interior?(c: TileCtx): void;
  platform(c: TileCtx, part: 's' | 'l' | 'm' | 'r'): void;
  spike(c: TileCtx): void;
  vine(c: TileCtx, part: 'top' | 'mid' | 'bottom'): void;
  rope(c: TileCtx): void;
  extra?: Record<string, (c: TileCtx) => void>;
  water: { color: string; build(root: THREE.Group, t: number, w: number): void };
}

export { WATER_FRAME } from '../data';
import { WATER_FRAME } from '../data';

function exposeOf(mask: number): Expose {
  return { u: !(mask & 1), r: !(mask & 2), d: !(mask & 4), l: !(mask & 8) };
}

function tileScene(theme: TileTheme, name: string, make: (c: TileCtx) => void): SceneDef {
  return {
    id: `tile-${theme.id}-${name}`,
    out: `tiles/${theme.id}/${name}.webp`,
    size: [96, 96],
    preset: theme.preset,
    ss: 4,
    build(scene) {
      if (theme.light) tuneLights(scene, theme.light);
      const root = new THREE.Group();
      const c: TileCtx = { sh: { kind: 'box', e: exposeOf(15) }, st: theme.body, b: new Batch(), root, mask: 15, variant: 'a', name };
      make(c);
      root.add(c.b.build());
      return { root, camera: obliqueCamera(0.75, 0.75, TILE_K) };
    },
  };
}

function solid(c: TileCtx, theme: TileTheme) {
  const g = bodyGeometry(c.sh, c.st);
  const m = new THREE.Mesh(g, theme.bodyMat());
  m.castShadow = true; m.receiveShadow = true;
  c.root.add(m);
  theme.interior?.(c);
  if (c.sh.kind !== 'box' || c.sh.e.u) theme.top?.(c);
  if (c.sh.kind === 'box') {
    if (c.sh.e.d) theme.bottom?.(c);
    if (c.sh.e.r) theme.side?.(c, 1);
    if (c.sh.e.l) theme.side?.(c, -1);
  }
}

export function tilesetScenes(theme: TileTheme): SceneDef[] {
  const out: SceneDef[] = [];
  for (let m = 0; m < 16; m++) {
    out.push(tileScene(theme, `solid-${m}`, (c) => { c.mask = m; c.sh = { kind: 'box', e: exposeOf(m) }; solid(c, theme); }));
  }
  for (const v of ['b', 'c'] as const) {
    out.push(tileScene(theme, `solid-15-${v}`, (c) => { c.mask = 15; c.variant = v; c.sh = { kind: 'box', e: exposeOf(15) }; solid(c, theme); }));
  }
  out.push(tileScene(theme, 'slope-r', (c) => { c.mask = 4; c.sh = { kind: 'slope-r', e: exposeOf(15) }; solid(c, theme); }));
  out.push(tileScene(theme, 'slope-l', (c) => { c.mask = 4; c.sh = { kind: 'slope-l', e: exposeOf(15) }; solid(c, theme); }));
  for (const p of ['s', 'l', 'm', 'r'] as const) out.push(tileScene(theme, `plat-${p}`, (c) => theme.platform(c, p)));
  out.push(tileScene(theme, 'spike', (c) => theme.spike(c)));
  out.push(tileScene(theme, 'vine-top', (c) => theme.vine(c, 'top')));
  out.push(tileScene(theme, 'vine', (c) => theme.vine(c, 'mid')));
  out.push(tileScene(theme, 'vine-bottom', (c) => theme.vine(c, 'bottom')));
  out.push(tileScene(theme, 'rope', (c) => theme.rope(c)));
  for (const [k, f] of Object.entries(theme.extra ?? {})) out.push(tileScene(theme, k, f));
  // faixa de água: 4 quadros lado a lado (cada um repetível na horizontal)
  const [fw, fh] = WATER_FRAME;
  out.push({
    id: `tile-${theme.id}-water-surface`,
    out: `tiles/${theme.id}/water-surface.webp`,
    size: [fw * 4, fh],
    preset: theme.preset,
    ss: 3,
    build(scene) {
      if (theme.light) tuneLights(scene, theme.light);
      const root = new THREE.Group();
      const W = fw / 64;
      for (let i = 0; i < 4; i++) {
        const g = new THREE.Group();
        theme.water.build(g, i / 4, W);
        g.position.x = i * W;
        root.add(g);
      }
      const hw = (fw * 4) / 128, hh = fh / 128;
      // topo da imagem = topo da célula de água (a linha d'água fica a 1/4 da altura)
      return { root, camera: obliqueCamera(hw, hh, TILE_K, hw, (fh / 64) * 0.25 - hh) };
    },
  });
  return out;
}
