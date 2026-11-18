import type { Rig } from './sculpt';
import type { AnimSet } from './anim';
import type { PresetId } from './presets';

export type ModelKind = 'hero' | 'mount' | 'enemy' | 'boss' | 'npc' | 'prop' | 'weapon' | 'pickup' | 'fx' | 'portrait';

export interface ModelDef {
  id: string;
  kind: ModelKind;
  /** Constrói o modelo. `variant` = figurino (heróis) ou variação ('base' padrão). */
  build(variant: string): Rig;
  anims: AnimSet;
  /** Tamanho da célula do sprite em px de TELA (1x). */
  cell: [number, number];
  /** Pivot (pés / ponto de apoio) dentro da célula, em px de tela. */
  pivot: [number, number];
  /** Quantas unidades de mundo cabem na altura da célula (define a escala ortográfica). */
  height: number;
  presets: PresetId[];
  variants?: string[];
  /** Ajuste da câmera: guinada e inclinação em graus (padrão 12 e -8). */
  camera?: { yaw?: number; pitch?: number };
  /** Renderiza também o sprite de sombra de contato (passe separado). Padrão: true para personagens. */
  shadow?: boolean;
  /** Fator de supersampling (padrão 2). */
  ss?: number;
}
