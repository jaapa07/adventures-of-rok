/** Sala bônus 2 da 4-2 — "achar o objeto certo": quatro cabaças, trocas rápidas e uma vida extra escondida. */
import type { LevelDef } from '../../game/types';
const nivel: LevelDef = {
  id: '4-2-b2', nome: 'Câmara de Cristal', mundo: 4, tipo: 'bonus', tileset: 'cristal', parallax: 'cristal', preset: 'bonus', music: 'bonus', ambience: 'amb-cristal',
  tilemap: [
    '######################',
    '#....................#',
    '#....................#',
    '#....................#',
    '#....................#',
    '#....................#',
    '#.......======.......#',
    '#....................#',
    '#....................#',
    '#....................#',
    '#....................#',
    '######################',
    '######################',
  ],
  start: [2.5, 11],
  bonus: { modo: 'achar', tempo: 12, premio: 'vida:1', retorno: ['4-2', 10, 60] },
  entities: [
    { t: 'achar-controle', x: 11.5, y: 11, itens: ['vazio', 'premio', 'vazio', 'parafusos:5'], trocas: [[1, 2], [0, 3], [2, 3], [0, 1], [1, 3], [0, 2], [2, 1], [3, 0]], vel: 0.32 },
  ],
  coins: [
    { path: [[9, 5.2], [14, 5.2]], step: 0.8 },
  ],
  decor: [
    { d: 'cristal/cristal-g', x: 2, y: 11 }, { d: 'cristal/cristal-p', x: 20.5, y: 11, flip: true }, { d: 'cristal/cristal-flutuante', x: 5, y: 3 },
    { d: 'cristal/cristal-flutuante', x: 18, y: 3.5, flip: true },
  ],
};
export default nivel;
