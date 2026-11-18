/** Sala bônus 2 da 3-2 — "chuva de castanhas": ondas que caem como cardumes, da esquerda para a direita e de volta. */
import type { LevelDef } from '../../game/types';
const nivel: LevelDef = {
  id: '3-2-b2', nome: 'Câmara de Cristal', mundo: 3, tipo: 'bonus', tileset: 'cristal', parallax: 'cristal', preset: 'bonus', music: 'bonus', ambience: 'amb-cristal',
  tilemap: [
    '######################',
    '#....................#',
    '#....................#',
    '#....................#',
    '#....................#',
    '#....................#',
    '#...====......====...#',
    '#....................#',
    '#.........==.........#',
    '#....................#',
    '#....................#',
    '######################',
    '######################',
  ],
  start: [11, 11],
  bonus: { modo: 'chuva', tempo: 16, premio: 'castanhas:0', retorno: ['3-2', 188.5, 3] },
  entities: [
    { t: 'chuva-controle', x: 11, y: 2, ondas: [[2, 3, 4, 5, 6], [6, 7, 8, 9, 10], [10, 11, 12, 13, 14], [14, 15, 16, 17, 18, 19], [19, 17, 15, 13, 11, 9], [7, 5, 3], [4.5, 11, 17.5], [2, 6, 10.5, 15, 19.5]] },
  ],
  coins: [],
  decor: [
    { d: 'cristal/cristal-g', x: 2, y: 11 }, { d: 'cristal/cristal-g', x: 20, y: 11, flip: true }, { d: 'cristal/cristal-flutuante', x: 11, y: 3 },
    { d: 'recife/estrela-mar', x: 6, y: 11 }, { d: 'recife/concha', x: 16, y: 11 },
  ],
};
export default nivel;
