/** Sala bônus 1 da 3-1 — "coletar tudo": as castanhas desenham uma CONCHA espiral em volta das bromélias. */
import type { LevelDef } from '../../game/types';
const nivel: LevelDef = {
  id: '3-1-b1', nome: 'Câmara de Cristal', mundo: 3, tipo: 'bonus', tileset: 'cristal', parallax: 'cristal', preset: 'bonus', music: 'bonus', ambience: 'amb-cristal',
  tilemap: [
    '########################',
    '#......................#',
    '#......................#',
    '#......................#',
    '#.........====.........#',
    '#......................#',
    '#......................#',
    '#...====........====...#',
    '#......................#',
    '#......................#',
    '#......................#',
    '########################',
    '########################',
  ],
  start: [2.5, 11],
  bonus: { modo: 'coletar', tempo: 20, premio: 'vida:1', retorno: ['3-1', 107.5, 11] },
  entities: [
    { t: 'coletar-controle', x: 12, y: 2 },
    { t: 'bromelia', x: 7, y: 11 },
    { t: 'bromelia', x: 17, y: 11 },
    { t: 'balao', x: 12, y: 2.6, n: 1, premio: true },
  ],
  coins: [
    // espiral da concha: do miolo para fora
    { path: [[12, 6.2], [13.4, 6.8], [13.2, 8.4], [11.6, 9], [10, 8], [10.2, 6], [12, 5.2], [14.6, 5.8], [15.4, 8.4], [14, 10.2]], step: 0.8 },
    { path: [[4.5, 6.2], [7.5, 6.2]], step: 0.9 },
    { path: [[16.5, 6.2], [19.5, 6.2]], step: 0.9 },
    { path: [[3, 10.2], [3, 8.4]], step: 0.9 },
    { path: [[21, 10.2], [21, 8.4]], step: 0.9 },
    { path: [[10.5, 3.2], [13.5, 3.2]], step: 0.75 },
  ],
  decor: [
    { d: 'cristal/cristal-g', x: 2, y: 11 }, { d: 'cristal/cristal-p', x: 5, y: 11 }, { d: 'cristal/cristal-p', x: 19, y: 11, flip: true },
    { d: 'cristal/cristal-g', x: 22, y: 11, flip: true }, { d: 'cristal/cristal-flutuante', x: 5, y: 3 }, { d: 'cristal/cristal-flutuante', x: 19, y: 3, flip: true },
    { d: 'recife/concha', x: 12, y: 11 },
  ],
};
export default nivel;
