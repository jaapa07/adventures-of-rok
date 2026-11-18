/** Sala bônus 1 da 1-4 — "chuva de castanhas" em degraus: as ondas caem alternando os dois lados da escadinha. */
import type { LevelDef } from '../../game/types';
const nivel: LevelDef = {
  id: '1-4-b1', nome: 'Câmara de Cristal', mundo: 1, tipo: 'bonus', tileset: 'cristal', parallax: 'cristal', preset: 'bonus', music: 'bonus', ambience: 'amb-cristal',
  tilemap: [
    '########################',
    '#......................#',
    '#......................#',
    '#......................#',
    '#......................#',
    '#......................#',
    '#.........====.........#',
    '#......................#',
    '#.....===......===.....#',
    '#......................#',
    '#..===............===..#',
    '#......................#',
    '########################',
    '########################',
  ],
  start: [12, 12],
  bonus: { modo: 'chuva', tempo: 16, premio: 'castanhas:0', retorno: ['1-4', 3, 12] },
  entities: [
    { t: 'chuva-controle', x: 12, y: 1, ondas: [[3, 4, 5], [19, 20, 21], [7, 8, 9], [15, 16, 17], [11, 12, 13], [2, 22], [4, 20], [6, 18], [8, 16], [10, 14], [12], [3, 7, 11, 13, 17, 21]] },
  ],
  coins: [],
  decor: [
    { d: 'cristal/cristal-g', x: 2, y: 12 }, { d: 'cristal/cristal-g', x: 22, y: 12, flip: true },
    { d: 'cristal/cristal-p', x: 12, y: 12 }, { d: 'cristal/cristal-flutuante', x: 6, y: 3 }, { d: 'cristal/cristal-flutuante', x: 18, y: 3, flip: true },
  ],
};
export default nivel;
