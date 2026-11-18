/**
 * JAVALÃO — o brutamontes da tropa (~2.1 u): braços grossos, colete de couro rebitado sobre
 * camiseta listrada e capacete de ferro com um chifre curvo. Só a Tamá o derruba pulando.
 */
import { buildBoar } from './boar';
import { boarAnims, pick } from '../../anims/enemies/boar';
import type { ModelDef } from '../../render/types';

function build() {
  const r = buildBoar({ cloth: 0x7a4a26, clothDark: 0x55321a, fur: 0x5a4636, furDark: 0x3a2a20, helmet: 'chifre', outfit: 'colete', arms: 1.55, belly: 1.12 });
  r.root.scale.setScalar(1.55);
  return r;
}

export const javalao: ModelDef = {
  id: 'javalao',
  kind: 'enemy',
  build,
  anims: pick(boarAnims(1.5), ['idle', 'andar', 'ataque', 'dano', 'morte', 'tonto', 'pisao']),
  cell: [352, 300],
  pivot: [168, 270],
  height: 300 / 104,
  presets: ['caverna', 'recife', 'neutro'],
};
