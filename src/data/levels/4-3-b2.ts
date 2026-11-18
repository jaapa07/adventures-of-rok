/** Sala bônus 2 da 4-3 — "sequência de flores-catapulta" de mão dupla: vai pela direita, volta pela esquerda até o prêmio no meio. */
import type { LevelDef } from '../../game/types';
const nivel: LevelDef = {
  id: '4-3-b2', nome: 'Câmara de Cristal', mundo: 4, tipo: 'bonus', tileset: 'cristal', parallax: 'cristal', preset: 'bonus', music: 'bonus', ambience: 'amb-cristal',
  tilemap: [
    '############################',
    '#..........................#',
    '#..........................#',
    '#...........====...........#',
    '#..........................#',
    '#..........................#',
    '#..===.................===.#',
    '#..........................#',
    '#..........................#',
    '#..........................#',
    '#.....................===..#',
    '#..........................#',
    '#..........................#',
    '#.....^^^^^^^^^^^^^^^^.....#',
    '############################',
  ],
  start: [2.5, 14],
  bonus: { modo: 'catapultas', tempo: 15, premio: 'vida:1', retorno: ['4-3', 257, 12] },
  entities: [
    { t: 'flor-catapulta', x: 4, y: 14, ang: -47, forca: 1300 },
    { t: 'flor-catapulta', x: 23, y: 10, ang: -80, forca: 1250 },
    { t: 'flor-catapulta', x: 24.5, y: 6, ang: -160, forca: 1350, gira: true },
    { t: 'flor-catapulta', x: 3.5, y: 6, ang: -30, forca: 1150 },
    { t: 'catapulta-premio', x: 13.5, y: 3, premio: 'vida:1' },
  ],
  coins: [
    { path: [[6, 12.5], [14, 11], [21, 10.5]], step: 1 },
    { path: [[23, 8.5], [23.5, 6.8]], step: 0.8 },
    { path: [[21, 5], [12, 4.5], [5.5, 5]], step: 1 },
    { path: [[6, 4.4], [10, 2.6], [12, 2.6]], step: 0.8 },
  ],
  decor: [
    { d: 'cristal/cristal-g', x: 2, y: 14 }, { d: 'cristal/cristal-g', x: 26, y: 14, flip: true }, { d: 'cristal/cristal-flutuante', x: 8, y: 2.5 },
    { d: 'cristal/cristal-flutuante', x: 20, y: 2.5, flip: true },
  ],
};
export default nivel;
