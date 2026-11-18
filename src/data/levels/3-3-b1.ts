/** Sala bônus 1 da 3-3 — "coletar tudo": as castanhas desenham uma ÂNCORA; bromélias levam ao cepo do alto. */
import type { LevelDef } from '../../game/types';
const nivel: LevelDef = {
  id: '3-3-b1', nome: 'Câmara de Cristal', mundo: 3, tipo: 'bonus', tileset: 'cristal', parallax: 'cristal', preset: 'bonus', music: 'bonus', ambience: 'amb-cristal',
  tilemap: [
    '##########################',
    '#........................#',
    '#........................#',
    '#........................#',
    '#..........====..........#',
    '#........................#',
    '#........................#',
    '#..====............====..#',
    '#........................#',
    '#........................#',
    '#........................#',
    '#........................#',
    '##########################',
    '##########################',
  ],
  start: [2.5, 12],
  bonus: { modo: 'coletar', tempo: 20, premio: 'castanhas:40', retorno: ['3-3', 66, 15] },
  entities: [
    { t: 'coletar-controle', x: 13, y: 3 },
    { t: 'bromelia', x: 9, y: 12 },
    { t: 'bromelia', x: 17, y: 12 },
  ],
  coins: [
    // a âncora: haste, cepo e os dois braços curvos
    { path: [[13, 3.2], [13, 10.2]], step: 0.8 },
    { path: [[11, 5.6], [15, 5.6]], step: 0.8 },
    { path: [[8.5, 8.4], [10, 10.6], [13, 11.2], [16, 10.6], [17.5, 8.4]], step: 0.8 },
    { path: [[3.5, 6.2], [5.5, 6.2]], step: 0.9 },
    { path: [[20.5, 6.2], [22.5, 6.2]], step: 0.9 },
  ],
  decor: [
    { d: 'cristal/cristal-g', x: 2, y: 12 }, { d: 'cristal/cristal-g', x: 24, y: 12, flip: true }, { d: 'cristal/cristal-p', x: 6, y: 12 },
    { d: 'cristal/cristal-flutuante', x: 5, y: 3 }, { d: 'cristal/cristal-flutuante', x: 21, y: 3.5, flip: true }, { d: 'recife/ancora', x: 21, y: 12, s: 0.7 },
  ],
};
export default nivel;
