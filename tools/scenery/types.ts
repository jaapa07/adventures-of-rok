import type * as THREE from 'three';
import type { PresetId } from '../render/presets';

/**
 * Uma cena renderizada para um único arquivo de imagem: tile de terreno, camada de parallax,
 * mapa da ilha, quadro de cinemática, fundo de tela, miniatura de fase etc.
 */
export interface SceneDef {
  id: string;
  /** Caminho de saída relativo a public/assets (ex.: 'scenery/selva/parallax-1.webp'). */
  out: string;
  /** Tamanho final em px de tela. */
  size: [number, number];
  preset: PresetId;
  ss?: number;
  format?: 'webp' | 'png';
  build(scene: THREE.Scene): { root: THREE.Object3D; camera: THREE.Camera; background?: number; fog?: THREE.Fog | THREE.FogExp2 };
  /**
   * Metadados para o manifesto (scenery.json). `crop`: recorta a imagem ao conteúdo (alfa) após o
   * render; `anchor`: ponto de apoio em px da imagem inteira (antes do recorte); `key`: chave no manifesto.
   */
  meta?: { kind: 'tile' | 'decor' | 'parallax' | 'map' | 'other'; key?: string; anchor?: [number, number]; crop?: boolean };
}
