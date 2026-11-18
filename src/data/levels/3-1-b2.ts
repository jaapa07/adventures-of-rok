/** Sala bônus 2 da 3-1 — "sequência de flores-catapulta": quatro flores atiram a dupla de uma para outra até o prêmio no teto. */
import type { LevelDef } from '../../game/types';
const nivel: LevelDef = {
  id: '3-1-b2', nome: 'Câmara de Cristal', mundo: 3, tipo: 'bonus', tileset: 'cristal', parallax: 'cristal', preset: 'bonus', music: 'bonus', ambience: 'amb-cristal',
  tilemap: [
    '##############################',
    '#............................#',
    '#............................#',
    '#.......................====.#',
    '#............................#',
    '#....................===.....#',
    '#............................#',
    '#.........===................#',
    '#............................#',
    '#................===.........#',
    '#............................#',
    '#............................#',
    '#.......^^^^^^^^^^^^^^^^^^^^^#',
    '##############################',
  ],
  start: [2.5, 13],
  bonus: { modo: 'catapultas', tempo: 16, premio: 'ficha', retorno: ['3-1', 172.5, 13] },
  entities: [
    { t: 'flor-catapulta', x: 5, y: 13, ang: -55, forca: 1350 },
    { t: 'flor-catapulta', x: 11, y: 7, ang: -20, forca: 1200, gira: true },
    { t: 'flor-catapulta', x: 18, y: 9, ang: -70, forca: 1400 },
    { t: 'flor-catapulta', x: 22, y: 5, ang: -35, forca: 1100, gira: true },
    { t: 'catapulta-premio', x: 26, y: 3, premio: 'ficha' },
  ],
  coins: [
    { path: [[6, 9], [8.5, 7.5], [10.5, 7]], step: 0.8 },
    { path: [[12, 6], [15, 6.8], [17.5, 8.5]], step: 0.8 },
    { path: [[18.5, 7.5], [20.5, 5.5], [21.8, 4.8]], step: 0.8 },
    { path: [[23, 4], [25.5, 2.4]], step: 0.8 },
  ],
  decor: [
    { d: 'cristal/cristal-g', x: 2, y: 13 }, { d: 'cristal/cristal-g', x: 28, y: 13, flip: true }, { d: 'cristal/cristal-flutuante', x: 14, y: 2.5 },
    { d: 'cristal/cristal-flutuante', x: 8, y: 3, flip: true }, { d: 'recife/estrela-mar', x: 3, y: 13 },
  ],
};
export default nivel;
