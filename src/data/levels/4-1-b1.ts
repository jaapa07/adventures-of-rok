/** Sala bônus 1 da 4-1 — "sequência de flores-catapulta": as flores formam uma escada em ziguezague até a engrenagem-prêmio. */
import type { LevelDef } from '../../game/types';
const nivel: LevelDef = {
  id: '4-1-b1', nome: 'Câmara de Cristal', mundo: 4, tipo: 'bonus', tileset: 'cristal', parallax: 'cristal', preset: 'bonus', music: 'bonus', ambience: 'amb-cristal',
  tilemap: [
    '##########################',
    '#........................#',
    '#........................#',
    '#........................#',
    '#........................#',
    '#.===....................#',
    '#........................#',
    '#........................#',
    '#..................===...#',
    '#........................#',
    '#........................#',
    '#.......===..............#',
    '#........................#',
    '#........................#',
    '#..................===...#',
    '#........................#',
    '#........................#',
    '#....^^^^^^^^^^^^^^^^^^^^#',
    '##########################',
  ],
  start: [2.5, 18],
  bonus: { modo: 'catapultas', tempo: 16, premio: 'parafusos:20', retorno: ['4-1', 146.5, 6] },
  entities: [
    { t: 'flor-catapulta', x: 3.5, y: 18, ang: -50, forca: 1400 },
    { t: 'flor-catapulta', x: 20, y: 14, ang: -115, forca: 1300 },
    { t: 'flor-catapulta', x: 9, y: 11, ang: -60, forca: 1350, gira: true },
    { t: 'flor-catapulta', x: 20, y: 8, ang: -150, forca: 1350 },
    { t: 'catapulta-premio', x: 3, y: 5, premio: 'parafusos:20' },
  ],
  coins: [
    { path: [[6, 16], [12, 14.5], [18, 13.5]], step: 0.9 },
    { path: [[18.5, 12.5], [14, 11], [10.5, 10.5]], step: 0.9 },
    { path: [[10.5, 9.5], [15, 7.6], [18.5, 7.4]], step: 0.9 },
    { path: [[17.5, 6.5], [10, 5], [5, 4.6]], step: 0.9 },
  ],
  decor: [
    { d: 'cristal/cristal-g', x: 2, y: 18 }, { d: 'cristal/cristal-flutuante', x: 13, y: 6 }, { d: 'cristal/cristal-flutuante', x: 23, y: 11, flip: true },
    { d: 'cristal/cristal-p', x: 24.5, y: 18, flip: true }, { d: 'fabrica/engrenagem', x: 3, y: 5, s: 0.5 },
  ],
};
export default nivel;
