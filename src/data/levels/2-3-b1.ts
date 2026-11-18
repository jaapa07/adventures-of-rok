/** Sala bônus 1 da 2-3 — "sequência de Flores-catapulta" em pé-direito alto: três flores sobem a câmara em zigue-zague até o prêmio. */
import type { LevelDef } from '../../game/types';
const nivel: LevelDef = {
  id: '2-3-b1', nome: 'Câmara de Cristal', mundo: 2, tipo: 'bonus', tileset: 'cristal', parallax: 'cristal', preset: 'bonus', music: 'bonus', ambience: 'amb-cristal',
  tilemap: [
    '######################',
    '#....................#',
    '#....................#',
    '#..............=====.#',
    '#....................#',
    '#....................#',
    '#.===................#',
    '#....................#',
    '#....................#',
    '#....................#',
    '#..........===.......#',
    '#....................#',
    '#....................#',
    '#....................#',
    '######################',
    '######################',
  ],
  start: [3, 14],
  bonus: { modo: 'catapultas', tempo: 25, premio: 'vida:1', retorno: ['2-3', 79.5, 14] },
  entities: [
    { t: 'flor-catapulta', x: 6, y: 14, ang: -55, forca: 1150 },
    { t: 'flor-catapulta', x: 12, y: 10, ang: -135, forca: 1150 },
    { t: 'flor-catapulta', x: 3, y: 6, ang: -35, forca: 1250, gira: true },
    { t: 'catapulta-premio', x: 18, y: 3 },
  ],
  coins: [
    { path: [[7, 12], [9.5, 10], [11.5, 10.2]], step: 0.8 },
    { path: [[11, 8.5], [8, 6.5], [4.5, 5.6]], step: 0.8 },
    { path: [[5, 4], [10, 2], [15, 2.4]], step: 0.9 },
  ],
  decor: [
    { d: 'cristal/cristal-g', x: 2, y: 14 }, { d: 'cristal/cristal-p', x: 16, y: 14 }, { d: 'cristal/cristal-g', x: 20, y: 14, flip: true },
    { d: 'cristal/cristal-flutuante', x: 15, y: 7 },
  ],
};
export default nivel;
