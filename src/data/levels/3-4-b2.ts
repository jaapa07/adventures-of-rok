/** Sala bônus 2 da 3-4 — "achar o objeto certo": seis cabaças dançam em pares; uma esconde a Ficha de Montaria
 * (duas têm um consolo de 5 castanhas). */
import type { LevelDef } from '../../game/types';
const nivel: LevelDef = {
  id: '3-4-b2', nome: 'Câmara de Cristal', mundo: 3, tipo: 'bonus', tileset: 'cristal', parallax: 'cristal', preset: 'bonus', music: 'bonus', ambience: 'amb-cristal',
  tilemap: [
    '##########################',
    '#........................#',
    '#........................#',
    '#........................#',
    '#........................#',
    '#........................#',
    '#.........======.........#',
    '#........................#',
    '#........................#',
    '#........................#',
    '#........................#',
    '##########################',
    '##########################',
  ],
  start: [2.5, 11],
  bonus: { modo: 'achar', tempo: 12, premio: 'ficha', retorno: ['3-4', 229, 3] },
  entities: [
    { t: 'achar-controle', x: 13, y: 11, itens: ['vazio', 'castanhas:5', 'vazio', 'premio', 'vazio', 'castanhas:5'], trocas: [[0, 5], [1, 4], [2, 3], [3, 5], [0, 2], [1, 3], [4, 5], [0, 1], [2, 4]], vel: 0.36 },
  ],
  coins: [
    { path: [[11, 5.2], [15, 5.2]], step: 0.8 },
  ],
  decor: [
    { d: 'cristal/cristal-g', x: 2, y: 11 }, { d: 'cristal/cristal-p', x: 24, y: 11, flip: true }, { d: 'cristal/cristal-flutuante', x: 6, y: 3 },
    { d: 'cristal/cristal-flutuante', x: 20, y: 3.5, flip: true }, { d: 'recife/concha', x: 13, y: 6 },
  ],
};
export default nivel;
