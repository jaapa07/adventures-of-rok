/** Sala bônus 1 da 1-3 — "coletar tudo": as castanhas desenham uma serra circular gigante; as tábuas são os dentes. */
import type { LevelDef } from '../../game/types';
const nivel: LevelDef = {
  id: '1-3-b1', nome: 'Câmara de Cristal', mundo: 1, tipo: 'bonus', tileset: 'cristal', parallax: 'cristal', preset: 'bonus', music: 'bonus', ambience: 'amb-cristal',
  tilemap: [
    '########################',
    '#......................#',
    '#......................#',
    '#.........====.........#',
    '#......................#',
    '#....===........===....#',
    '#......................#',
    '#......................#',
    '#.........====.........#',
    '#......................#',
    '#......................#',
    '########################',
    '########################',
  ],
  start: [2.5, 11],
  bonus: { modo: 'coletar', tempo: 22, premio: 'vida:1', retorno: ['1-3', 88, 14] },
  entities: [
    { t: 'coletar-controle', x: 12, y: 1 },
    { t: 'bromelia', x: 12, y: 11 },
  ],
  coins: [
    { path: [[12, 2.4], [15.5, 3.4], [17.5, 6.4], [15.5, 9.4], [12, 10.4], [8.5, 9.4], [6.5, 6.4], [8.5, 3.4], [12, 2.4]], step: 1 },
    { path: [[10.5, 7.4], [13.5, 7.4]] },
    { path: [[2.5, 4.4], [2.5, 9.4]], step: 1 },
    { path: [[21.5, 4.4], [21.5, 9.4]], step: 1 },
  ],
  decor: [
    { d: 'cristal/cristal-g', x: 2, y: 11 }, { d: 'cristal/cristal-p', x: 7, y: 11 }, { d: 'cristal/cristal-g', x: 22, y: 11, flip: true },
    { d: 'cristal/cristal-flutuante', x: 12, y: 5.5 },
  ],
};
export default nivel;
