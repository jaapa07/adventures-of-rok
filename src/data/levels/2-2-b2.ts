/** Sala bônus 2 da 2-2 — "chuva de castanhas" em zigue-zague: cada onda cai de um lado e puxa a dupla para o outro. */
import type { LevelDef } from '../../game/types';
const nivel: LevelDef = {
  id: '2-2-b2', nome: 'Câmara de Cristal', mundo: 2, tipo: 'bonus', tileset: 'cristal', parallax: 'cristal', preset: 'bonus', music: 'bonus', ambience: 'amb-cristal',
  tilemap: [
    '######################',
    '#....................#',
    '#....................#',
    '#....................#',
    '#....................#',
    '#....................#',
    '#....................#',
    '#.....==========.....#',
    '#....................#',
    '#....................#',
    '######################',
    '######################',
  ],
  start: [11, 10],
  bonus: { modo: 'chuva', tempo: 15, premio: 'castanhas:0', retorno: ['2-2', 258, 10] },
  entities: [
    { t: 'chuva-controle', x: 11, y: 1, ondas: [[2, 3, 4], [18, 19, 20], [5, 6, 7], [15, 16, 17], [8, 9], [13, 14], [10, 11, 12], [2, 20], [6, 11, 16], [3, 8, 14, 19]] },
  ],
  coins: [],
  decor: [
    { d: 'cristal/cristal-g', x: 2, y: 10 }, { d: 'cristal/cristal-g', x: 20, y: 10, flip: true }, { d: 'cristal/cristal-flutuante', x: 11, y: 3 },
  ],
};
export default nivel;
