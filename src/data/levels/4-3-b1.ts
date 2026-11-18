/** Sala bônus 1 da 4-3 — "coletar tudo": as castanhas desenham a LAGARTA (gomos, rodas e a pá) para a dupla treinar a corrida. */
import type { LevelDef } from '../../game/types';
const nivel: LevelDef = {
  id: '4-3-b1', nome: 'Câmara de Cristal', mundo: 4, tipo: 'bonus', tileset: 'cristal', parallax: 'cristal', preset: 'bonus', music: 'bonus', ambience: 'amb-cristal',
  tilemap: [
    '############################',
    '#..........................#',
    '#..........................#',
    '#..........................#',
    '#..........................#',
    '#.....=====.......=====....#',
    '#..........................#',
    '#..........................#',
    '#..........................#',
    '#...........====...........#',
    '#..........................#',
    '#..........................#',
    '############################',
    '############################',
  ],
  start: [2.5, 12],
  bonus: { modo: 'coletar', tempo: 20, premio: 'ficha', retorno: ['4-3', 16.5, 12] },
  entities: [
    { t: 'coletar-controle', x: 14, y: 2 },
    { t: 'bromelia', x: 22, y: 12 },
  ],
  coins: [
    // gomos da lagarta
    { path: [[4, 10.6], [24, 10.6]], step: 1.25 },
    { path: [[5, 3.8], [11, 3.8]], step: 0.75 },
    { path: [[18, 3.8], [24, 3.8]], step: 0.75 },
    { path: [[12.5, 7.8], [15.5, 7.8]], step: 0.75 },
    // a pá na frente
    { path: [[25.5, 9], [25.5, 6], [24, 5.6]], step: 0.8 },
  ],
  decor: [
    { d: 'cristal/cristal-g', x: 2, y: 12 }, { d: 'cristal/cristal-g', x: 26, y: 12, flip: true }, { d: 'cristal/cristal-flutuante', x: 14, y: 2.5 },
    { d: 'cristal/cristal-p', x: 9, y: 12 }, { d: 'fabrica/engrenagem', x: 18, y: 12, s: 0.5 },
  ],
};
export default nivel;
