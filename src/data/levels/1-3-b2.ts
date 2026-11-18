/** Sala bônus 2 da 1-3 — "chuva de castanhas" no telhado: ondas desenhadas à mão caem em leque. */
import type { LevelDef } from '../../game/types';
const nivel: LevelDef = {
  id: '1-3-b2', nome: 'Câmara de Cristal', mundo: 1, tipo: 'bonus', tileset: 'cristal', parallax: 'cristal', preset: 'bonus', music: 'bonus', ambience: 'amb-cristal',
  tilemap: [
    '######################',
    '#....................#',
    '#....................#',
    '#....................#',
    '#....................#',
    '#....................#',
    '#........====........#',
    '#....................#',
    '#..===..........===..#',
    '#....................#',
    '#....................#',
    '######################',
    '######################',
  ],
  start: [11, 11],
  bonus: { modo: 'chuva', tempo: 16, premio: 'castanhas:0', retorno: ['1-3', 172.5, 7] },
  entities: [
    { t: 'chuva-controle', x: 11, y: 1, ondas: [[11], [9, 13], [7, 11, 15], [5, 9, 13, 17], [3, 7, 11, 15, 19], [4, 18], [6, 16], [8, 14], [10, 12], [2, 6, 10, 14, 18, 20]] },
  ],
  coins: [],
  decor: [
    { d: 'cristal/cristal-g', x: 2, y: 11 }, { d: 'cristal/cristal-g', x: 20, y: 11, flip: true },
    { d: 'cristal/cristal-flutuante', x: 5, y: 3 }, { d: 'cristal/cristal-flutuante', x: 17, y: 3, flip: true },
  ],
};
export default nivel;
