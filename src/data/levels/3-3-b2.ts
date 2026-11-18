/** Sala bônus 2 da 3-3 — "sequência de flores-catapulta" com flores que giram: acertar o tempo de cada disparo. */
import type { LevelDef } from '../../game/types';
const nivel: LevelDef = {
  id: '3-3-b2', nome: 'Câmara de Cristal', mundo: 3, tipo: 'bonus', tileset: 'cristal', parallax: 'cristal', preset: 'bonus', music: 'bonus', ambience: 'amb-cristal',
  tilemap: [
    '################################',
    '#..............................#',
    '#..............................#',
    '#..........................===.#',
    '#..............................#',
    '#..............................#',
    '#.............===..............#',
    '#..............................#',
    '#.....................===......#',
    '#..............................#',
    '#........===...................#',
    '#..............................#',
    '#..............................#',
    '#.....^^^^^^^^^^^^^^^^^^^^^^^^^#',
    '################################',
  ],
  start: [2.5, 14],
  bonus: { modo: 'catapultas', tempo: 18, premio: 'vida:1', retorno: ['3-3', 168, 3] },
  entities: [
    { t: 'flor-catapulta', x: 4, y: 14, ang: -60, forca: 1300 },
    { t: 'flor-catapulta', x: 10, y: 10, ang: -45, forca: 1250, gira: true },
    { t: 'flor-catapulta', x: 15, y: 6, ang: -10, forca: 1200, gira: true },
    { t: 'flor-catapulta', x: 23, y: 8, ang: -65, forca: 1350 },
    { t: 'catapulta-premio', x: 28.5, y: 3, premio: 'vida:1' },
  ],
  coins: [
    { path: [[5, 12], [7.5, 10.5], [9.5, 9.6]], step: 0.8 },
    { path: [[11, 9], [13, 7], [14.5, 5.8]], step: 0.8 },
    { path: [[16.5, 5.5], [20, 6], [22.5, 7.5]], step: 0.8 },
    { path: [[24, 6.5], [26, 4], [28, 2.4]], step: 0.8 },
  ],
  decor: [
    { d: 'cristal/cristal-g', x: 2, y: 14 }, { d: 'cristal/cristal-flutuante', x: 7, y: 4 }, { d: 'cristal/cristal-flutuante', x: 20, y: 2.5, flip: true },
    { d: 'cristal/cristal-p', x: 30, y: 14, flip: true }, { d: 'recife/timao', x: 4, y: 14, s: 0.6 },
  ],
};
export default nivel;
