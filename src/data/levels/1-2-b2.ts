/** Sala bônus 2 da 1-2 — "sequência de Flores-catapulta": quatro flores em escada levam ao prêmio no alto. */
import type { LevelDef } from '../../game/types';
const nivel: LevelDef = {
  id: '1-2-b2', nome: 'Câmara de Cristal', mundo: 1, tipo: 'bonus', tileset: 'cristal', parallax: 'cristal', preset: 'bonus', music: 'bonus', ambience: 'amb-cristal',
  tilemap: [
    '##########################',
    '#........................#',
    '#........................#',
    '#........................#',
    '#..................=====.#',
    '#........................#',
    '#........................#',
    '#.........===............#',
    '#........................#',
    '#........................#',
    '#........................#',
    '#........................#',
    '##########################',
    '##########################',
  ],
  start: [2.5, 12],
  bonus: { modo: 'catapultas', tempo: 25, premio: 'vida:1', retorno: ['1-2', 205.5, 16] },
  entities: [
    { t: 'flor-catapulta', x: 5, y: 12, ang: -52, forca: 1250 },
    { t: 'flor-catapulta', x: 11, y: 7, ang: -40, forca: 1150, gira: true },
    { t: 'flor-catapulta', x: 16, y: 12, ang: -75, forca: 1300 },
    { t: 'catapulta-premio', x: 21.5, y: 4 },
  ],
  coins: [
    { path: [[6, 10], [8.5, 7.5], [10.5, 6.6]], step: 0.8 },
    { path: [[12.5, 5.5], [15.5, 4.5], [18.5, 3.5]], step: 0.8 },
    { path: [[16, 10], [16, 5]], step: 0.9 },
  ],
  decor: [
    { d: 'cristal/cristal-g', x: 2, y: 12 }, { d: 'cristal/cristal-g', x: 24, y: 12, flip: true },
    { d: 'cristal/cristal-flutuante', x: 8, y: 3 }, { d: 'cristal/cristal-p', x: 13, y: 12 },
  ],
};
export default nivel;
