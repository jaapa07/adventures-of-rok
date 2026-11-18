/** Sala bônus 1 da 3-4 — "chuva de castanhas" no ritmo da pista de dança: ondas alternadas esquerda/direita. */
import type { LevelDef } from '../../game/types';
const nivel: LevelDef = {
  id: '3-4-b1', nome: 'Câmara de Cristal', mundo: 3, tipo: 'bonus', tileset: 'cristal', parallax: 'cristal', preset: 'bonus', music: 'bonus', ambience: 'amb-cristal',
  tilemap: [
    '########################',
    '#......................#',
    '#......................#',
    '#......................#',
    '#......................#',
    '#......................#',
    '#.....====....====.....#',
    '#......................#',
    '#..====..........====..#',
    '#......................#',
    '#......................#',
    '########################',
    '########################',
  ],
  start: [12, 11],
  bonus: { modo: 'chuva', tempo: 18, premio: 'castanhas:0', retorno: ['3-4', 75.5, 3] },
  entities: [
    { t: 'chuva-controle', x: 12, y: 2, ondas: [[3, 5, 7], [17, 19, 21], [4, 6, 8, 10], [14, 16, 18, 20], [11, 12, 13], [3, 21], [7, 9.5, 12, 14.5, 17], [2.5, 5, 19, 21.5], [6, 12, 18], [3, 6, 9, 12, 15, 18, 21]] },
  ],
  coins: [],
  decor: [
    { d: 'cristal/cristal-g', x: 2, y: 11 }, { d: 'cristal/cristal-g', x: 22, y: 11, flip: true }, { d: 'cristal/cristal-flutuante', x: 7, y: 3 },
    { d: 'cristal/cristal-flutuante', x: 17, y: 3, flip: true }, { d: 'recife/anemona', x: 12, y: 11 },
  ],
};
export default nivel;
