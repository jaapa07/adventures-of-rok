/** Sala bônus 1 da 2-1 — "achar o objeto certo": quatro cabaças acesas embaralham no escuro; a do prêmio brilha antes de apagar. */
import type { LevelDef } from '../../game/types';
const nivel: LevelDef = {
  id: '2-1-b1', nome: 'Câmara de Cristal', mundo: 2, tipo: 'bonus', tileset: 'cristal', parallax: 'cristal', preset: 'bonus', music: 'bonus', ambience: 'amb-cristal',
  tilemap: [
    '########################',
    '#......................#',
    '#......................#',
    '#......................#',
    '#......................#',
    '#......................#',
    '#......................#',
    '#..====..........====..#',
    '#......................#',
    '#......................#',
    '########################',
    '########################',
  ],
  start: [2.5, 10],
  bonus: { modo: 'achar', tempo: 22, premio: 'vida:1', retorno: ['2-1', 138, 17] },
  entities: [
    { t: 'achar-controle', x: 12, y: 10, itens: ['vazio', 'vazio', 'premio', 'vazio'], trocas: [[2, 3], [0, 1], [1, 2], [3, 0], [2, 0], [1, 3], [0, 1], [2, 3], [1, 2]], vel: 0.38 },
  ],
  coins: [
    { path: [[3.5, 6.2], [6.5, 6.2]] },
    { path: [[17.5, 6.2], [20.5, 6.2]] },
  ],
  decor: [
    { d: 'cristal/cristal-g', x: 2, y: 10 }, { d: 'cristal/cristal-g', x: 22, y: 10, flip: true },
    { d: 'cristal/cristal-flutuante', x: 12, y: 2.5 }, { d: 'cristal/cristal-p', x: 12, y: 10 },
  ],
};
export default nivel;
