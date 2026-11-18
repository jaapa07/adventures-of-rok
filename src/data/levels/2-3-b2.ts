/** Sala bônus 2 da 2-3 — "achar o objeto certo": cinco cabaças dançam no ritmo do DJ (é a festa vizinha) e embaralham. */
import type { LevelDef } from '../../game/types';
const nivel: LevelDef = {
  id: '2-3-b2', nome: 'Câmara de Cristal', mundo: 2, tipo: 'bonus', tileset: 'cristal', parallax: 'cristal', preset: 'bonus', music: 'bonus', ambience: 'amb-cristal',
  tilemap: [
    '##########################',
    '#........................#',
    '#........................#',
    '#........................#',
    '#........................#',
    '#........................#',
    '#........................#',
    '#.....======..======.....#',
    '#........................#',
    '#........................#',
    '##########################',
    '##########################',
  ],
  start: [2.5, 10],
  bonus: { modo: 'achar', tempo: 24, premio: 'vida:2', retorno: ['2-3', 131.5, 20] },
  entities: [
    { t: 'achar-controle', x: 13, y: 10, itens: ['vazio', 'vazio', 'vazio', 'premio', 'vazio'], trocas: [[3, 4], [0, 1], [2, 3], [1, 4], [0, 2], [3, 1], [4, 0], [2, 4], [1, 2], [0, 3], [3, 4]], vel: 0.34 },
  ],
  coins: [
    { path: [[6.5, 6.2], [10.5, 6.2]] },
    { path: [[14.5, 6.2], [18.5, 6.2]] },
  ],
  decor: [
    { d: 'cristal/cristal-g', x: 2, y: 10 }, { d: 'cristal/cristal-g', x: 24, y: 10, flip: true },
    { d: 'cristal/cristal-flutuante', x: 13, y: 3.5 }, { d: 'cristal/cristal-p', x: 13, y: 10 },
  ],
};
export default nivel;
