/** Sala bônus 2 da 1-1 — "chuva de castanhas": elas caem em ondas desenhadas à mão (padrão no objeto chuva-controle). */
import type { LevelDef } from '../../game/types';
const nivel: LevelDef = {
  id: '1-1-b2', nome: 'Câmara de Cristal', mundo: 1, tipo: 'bonus', tileset: 'cristal', parallax: 'cristal', preset: 'bonus', music: 'bonus', ambience: 'amb-cristal',
  tilemap: [
    '####################',
    '#..................#',
    '#..................#',
    '#..................#',
    '#..................#',
    '#..................#',
    '#....====..====....#',
    '#..................#',
    '#..................#',
    '#..................#',
    '####################',
    '####################',
  ],
  start: [10, 10],
  bonus: { modo: 'chuva', tempo: 15, premio: 'castanhas:0', retorno: ['1-1', 225, 10] },
  entities: [
    { t: 'chuva-controle', x: 10, y: 1, ondas: [[3, 6, 9, 12, 15], [2, 4.5, 7, 9.5, 12, 14.5, 17], [5, 10, 15], [3, 5, 7, 13, 15, 17], [9, 10, 11], [2, 6, 10, 14, 18]] },
  ],
  coins: [],
  decor: [{ d: 'cristal/cristal-g', x: 2, y: 10 }, { d: 'cristal/cristal-g', x: 18, y: 10, flip: true }, { d: 'cristal/cristal-flutuante', x: 10, y: 2.5 }],
};
export default nivel;
