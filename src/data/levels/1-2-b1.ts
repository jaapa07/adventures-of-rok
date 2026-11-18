/** Sala bônus 1 da 1-2 — "achar o objeto certo": três cabaças embaralham sobre os galhos de cristal; uma guarda o prêmio. */
import type { LevelDef } from '../../game/types';
const nivel: LevelDef = {
  id: '1-2-b1', nome: 'Câmara de Cristal', mundo: 1, tipo: 'bonus', tileset: 'cristal', parallax: 'cristal', preset: 'bonus', music: 'bonus', ambience: 'amb-cristal',
  tilemap: [
    '######################',
    '#....................#',
    '#....................#',
    '#....................#',
    '#....................#',
    '#....................#',
    '#....................#',
    '#...====......====...#',
    '#....................#',
    '#....................#',
    '######################',
    '######################',
  ],
  start: [2.5, 10],
  bonus: { modo: 'achar', tempo: 20, premio: 'vida:1', retorno: ['1-2', 118.5, 16] },
  entities: [
    { t: 'achar-controle', x: 11, y: 10, itens: ['vazio', 'premio', 'vazio'], trocas: [[0, 1], [1, 2], [0, 2], [2, 1], [0, 1], [1, 2], [0, 2]] },
  ],
  coins: [
    { path: [[4.5, 6.2], [7.5, 6.2]] },
    { path: [[14.5, 6.2], [17.5, 6.2]] },
  ],
  decor: [
    { d: 'cristal/cristal-g', x: 2, y: 10 }, { d: 'cristal/cristal-p', x: 19, y: 10, flip: true },
    { d: 'cristal/cristal-flutuante', x: 11, y: 2.5 },
  ],
};
export default nivel;
