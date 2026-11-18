/**
 * JAVALIM — soldado-operário do Barão Javardo. Baixinho (~1.3 u), barrigudo, capacete de lata
 * amassado, macacão cor de ferrugem cheio de remendos, presas curvas e fivela de javali.
 * É o inimigo mais comum: aparece nos quatro mundos e protagoniza várias gags.
 */
import { buildBoar } from './boar';
import { boarAnims, pick } from '../../anims/enemies/boar';
import type { ModelDef } from '../../render/types';

export const JAVALIM_COLORS = { cloth: 0xb4532a, clothDark: 0x8a3c1e, fur: 0x7e5a44, furDark: 0x553a2c };

export const javalim: ModelDef = {
  id: 'javalim',
  kind: 'enemy',
  build: () => buildBoar({ ...JAVALIM_COLORS, helmet: 'lata', outfit: 'uniforme', gagProps: true }),
  anims: pick(boarAnims(1), ['idle', 'andar', 'ataque', 'dano', 'morte', 'tonto', 'susto', 'selfie', 'cair', 'domino', 'dancar', 'correr-banheiro', 'ir-embora', 'pegar-arma', 'ataque-arma', 'remar', 'desarmado']),
  cell: [256, 224],
  pivot: [120, 200],
  height: 224 / 104,
  presets: ['selva', 'caverna', 'recife', 'fabrica', 'neutro'],
};
