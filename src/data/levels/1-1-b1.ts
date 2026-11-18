/** Sala bônus 1 da 1-1 — "coletar tudo": castanhas desenham uma folha de sumaúma no ar. */
import type { LevelDef } from '../../game/types';
const nivel: LevelDef = {
  id: '1-1-b1', nome: 'Câmara de Cristal', mundo: 1, tipo: 'bonus', tileset: 'cristal', parallax: 'cristal', preset: 'bonus', music: 'bonus', ambience: 'amb-cristal',
  tilemap: [
    '######################',
    '#....................#',
    '#....................#',
    '#....................#',
    '#....................#',
    '#.......======.......#',
    '#....................#',
    '#..====........====..#',
    '#....................#',
    '#....................#',
    '######################',
    '######################',
  ],
  start: [2.5, 10],
  bonus: { modo: 'coletar', tempo: 18, premio: 'vida:1', retorno: ['1-1', 160.5, 11] },
  entities: [
    { t: 'coletar-controle', x: 11, y: 10 },
    { t: 'bromelia', x: 10.5, y: 10 },
    { t: 'balao', x: 11, y: 2.5, n: 1, premio: true },
  ],
  coins: [
    { path: [[11, 9.2], [11, 5.6]], step: 0.9 },
    { path: [[8.5, 4.2], [11, 2.8], [13.5, 4.2]], step: 0.8 },
    { path: [[3.5, 6.4], [6.2, 6.4]], step: 0.9 },
    { path: [[15.8, 6.4], [18.5, 6.4]], step: 0.9 },
    { path: [[6.5, 9.2], [8.5, 8.2]] },
    { path: [[13.5, 8.2], [15.5, 9.2]] },
  ],
  decor: [
    { d: 'cristal/cristal-g', x: 2, y: 10 }, { d: 'cristal/cristal-p', x: 6, y: 10 }, { d: 'cristal/cristal-g', x: 20, y: 10, flip: true },
    { d: 'cristal/cristal-flutuante', x: 4, y: 3 }, { d: 'cristal/cristal-flutuante', x: 18, y: 3.5, flip: true },
  ],
};
export default nivel;
