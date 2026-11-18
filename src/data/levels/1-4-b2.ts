/** Sala bônus 2 da 1-4 — "coletar tudo": castanhas formam um peixe-boi nadando; a bromélia leva até o olho dele (cacho). */
import type { LevelDef } from '../../game/types';
const nivel: LevelDef = {
  id: '1-4-b2', nome: 'Câmara de Cristal', mundo: 1, tipo: 'bonus', tileset: 'cristal', parallax: 'cristal', preset: 'bonus', music: 'bonus', ambience: 'amb-cristal',
  tilemap: [
    '##########################',
    '#........................#',
    '#........................#',
    '#........................#',
    '#........................#',
    '#........................#',
    '#........................#',
    '#....=====......=====....#',
    '#........................#',
    '#........................#',
    '#........................#',
    '##########################',
    '##########################',
  ],
  start: [2.5, 11],
  bonus: { modo: 'coletar', tempo: 20, premio: 'vida:1', retorno: ['1-4', 55.5, 3] },
  entities: [
    { t: 'coletar-controle', x: 13, y: 1 },
    { t: 'bromelia', x: 13, y: 11 },
  ],
  coins: [
    { path: [[4, 4.5], [7, 3], [12, 2.5], [17, 3], [20, 4.5], [17, 5.6], [12, 6], [7, 5.6], [4, 4.5]], step: 1 },
    { path: [[20, 4.5], [22.5, 3], [22.5, 6]], step: 0.8 },
    { path: [[6, 10.2], [10, 10.2]] },
    { path: [[16, 10.2], [20, 10.2]] },
    { path: [[13, 9], [13, 7]], step: 1 },
    { path: [[6.5, 4.3], [6.5, 4.3]], cacho: true },
  ],
  decor: [
    { d: 'cristal/cristal-g', x: 2, y: 11 }, { d: 'cristal/cristal-p', x: 9, y: 11 }, { d: 'cristal/cristal-p', x: 18, y: 11, flip: true },
    { d: 'cristal/cristal-g', x: 24, y: 11, flip: true }, { d: 'cristal/cristal-flutuante', x: 13, y: 4.5 },
  ],
};
export default nivel;
