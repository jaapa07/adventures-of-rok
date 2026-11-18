/** Sala bônus 1 da 2-2 — "coletar tudo": as castanhas desenham um trilho de montanha-russa em looping pela câmara. */
import type { LevelDef } from '../../game/types';
const nivel: LevelDef = {
  id: '2-2-b1', nome: 'Câmara de Cristal', mundo: 2, tipo: 'bonus', tileset: 'cristal', parallax: 'cristal', preset: 'bonus', music: 'bonus', ambience: 'amb-cristal',
  tilemap: [
    '##########################',
    '#........................#',
    '#........................#',
    '#........................#',
    '#........................#',
    '#.......====.............#',
    '#........................#',
    '#...............====.....#',
    '#........................#',
    '#...====.................#',
    '#........................#',
    '##########################',
    '##########################',
  ],
  start: [2.5, 11],
  bonus: { modo: 'coletar', tempo: 22, premio: 'vida:1', retorno: ['2-2', 159.5, 10] },
  entities: [
    { t: 'coletar-controle', x: 13, y: 1 },
  ],
  coins: [
    { path: [[2.5, 10.2], [6, 10.2], [9, 9.5], [12, 8], [13.5, 6], [12.5, 3.5], [10, 2.5], [8, 3.5], [8.5, 4.4]], step: 1 },
    { path: [[14, 9.4], [17, 7], [20, 6.4], [22.5, 8], [23, 10.4]], step: 1 },
    { path: [[17, 3], [21, 3]], cacho: true },
  ],
  decor: [
    { d: 'cristal/cristal-g', x: 2, y: 11 }, { d: 'cristal/cristal-p', x: 15, y: 11 }, { d: 'cristal/cristal-g', x: 24, y: 11, flip: true },
    { d: 'cristal/cristal-flutuante', x: 19, y: 4 },
  ],
};
export default nivel;
