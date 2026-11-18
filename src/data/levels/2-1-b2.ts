/** Sala bônus 2 da 2-1 — "sequência de Flores-catapulta": uma flor giratória no meio exige pontaria; quem cair volta pelo degrau da esquerda. */
import type { LevelDef } from '../../game/types';
const nivel: LevelDef = {
  id: '2-1-b2', nome: 'Câmara de Cristal', mundo: 2, tipo: 'bonus', tileset: 'cristal', parallax: 'cristal', preset: 'bonus', music: 'bonus', ambience: 'amb-cristal',
  tilemap: [
    '############################',
    '#..........................#',
    '#..........................#',
    '#..====....................#',
    '#..........................#',
    '#..........................#',
    '#..........................#',
    '#.............===..........#',
    '#..........................#',
    '#......................===.#',
    '#####......................#',
    '#####......................#',
    '############################',
    '############################',
  ],
  start: [2.5, 10],
  bonus: { modo: 'catapultas', tempo: 25, premio: 'vida:1', retorno: ['2-1', 157.5, 14] },
  entities: [
    { t: 'flor-catapulta', x: 4, y: 10, ang: -35, forca: 1100 },
    { t: 'flor-catapulta', x: 15, y: 7, ang: -90, forca: 1000, gira: true },
    { t: 'flor-catapulta', x: 24, y: 9, ang: -150, forca: 1200 },
    { t: 'catapulta-premio', x: 4.5, y: 3 },
  ],
  coins: [
    { path: [[6, 8.5], [10, 7.5], [14, 7.5]], step: 0.8 },
    { path: [[16, 5], [20, 4], [23, 6]], step: 0.8 },
    { path: [[21, 4], [15, 2.5], [8, 2.5]], step: 0.9 },
  ],
  decor: [
    { d: 'cristal/cristal-g', x: 2.5, y: 10 }, { d: 'cristal/cristal-flutuante', x: 12, y: 4 }, { d: 'cristal/cristal-flutuante', x: 20, y: 9, flip: true },
  ],
};
export default nivel;
