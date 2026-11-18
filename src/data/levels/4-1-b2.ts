/** Sala bônus 2 da 4-1 — "coletar tudo": as castanhas desenham uma ENGRENAGEM; as do miolo só com a bromélia. */
import type { LevelDef } from '../../game/types';
const nivel: LevelDef = {
  id: '4-1-b2', nome: 'Câmara de Cristal', mundo: 4, tipo: 'bonus', tileset: 'cristal', parallax: 'cristal', preset: 'bonus', music: 'bonus', ambience: 'amb-cristal',
  tilemap: [
    '########################',
    '#......................#',
    '#......................#',
    '#......................#',
    '#......................#',
    '#..====..........====..#',
    '#......................#',
    '#......................#',
    '#.........====.........#',
    '#......................#',
    '#......................#',
    '########################',
    '########################',
  ],
  start: [2.5, 11],
  bonus: { modo: 'coletar', tempo: 22, premio: 'parafusos:30', retorno: ['4-1', 228.5, 15] },
  entities: [
    { t: 'coletar-controle', x: 12, y: 2 },
    { t: 'bromelia', x: 12, y: 11 },
    { t: 'balao', x: 12, y: 2.4, n: 1, premio: true },
  ],
  coins: [
    // engrenagem: aro com oito dentes
    { path: [[12, 3.6], [14.6, 4.6], [15.6, 7], [14.6, 9.4], [12, 10.2], [9.4, 9.4], [8.4, 7], [9.4, 4.6], [12, 3.6]], step: 0.85 },
    { path: [[12, 2.6], [12, 2.6]] },
    { path: [[16.8, 7], [16.8, 7]] },
    { path: [[7.2, 7], [7.2, 7]] },
    { path: [[3, 4.2], [6, 4.2]], step: 0.9 },
    { path: [[18, 4.2], [21, 4.2]], step: 0.9 },
  ],
  decor: [
    { d: 'cristal/cristal-g', x: 2, y: 11 }, { d: 'cristal/cristal-g', x: 22, y: 11, flip: true }, { d: 'cristal/cristal-flutuante', x: 4, y: 2 },
    { d: 'cristal/cristal-flutuante', x: 20, y: 2.5, flip: true }, { d: 'fabrica/engrenagem', x: 12, y: 11, s: 0.6 },
  ],
};
export default nivel;
