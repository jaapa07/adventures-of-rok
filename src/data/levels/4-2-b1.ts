/** Sala bônus 1 da 4-2 — "chuva de castanhas" que cai como fuligem das chaminés: ondas em escadinha. */
import type { LevelDef } from '../../game/types';
const nivel: LevelDef = {
  id: '4-2-b1', nome: 'Câmara de Cristal', mundo: 4, tipo: 'bonus', tileset: 'cristal', parallax: 'cristal', preset: 'bonus', music: 'bonus', ambience: 'amb-cristal',
  tilemap: [
    '######################',
    '#....................#',
    '#....................#',
    '#....................#',
    '#....................#',
    '#....................#',
    '#........====........#',
    '#....................#',
    '#..====........====..#',
    '#....................#',
    '#....................#',
    '######################',
    '######################',
  ],
  start: [11, 11],
  bonus: { modo: 'chuva', tempo: 16, premio: 'castanhas:0', retorno: ['4-2', 7, 123] },
  entities: [
    { t: 'chuva-controle', x: 11, y: 2, ondas: [[2, 3], [4, 5], [6, 7], [8, 9], [10, 11], [12, 13], [14, 15], [16, 17], [18, 19], [19, 15, 11, 7, 3], [5, 9, 13, 17], [10, 11, 12]] },
  ],
  coins: [],
  decor: [
    { d: 'cristal/cristal-g', x: 2, y: 11 }, { d: 'cristal/cristal-g', x: 20, y: 11, flip: true }, { d: 'cristal/cristal-flutuante', x: 11, y: 3 },
    { d: 'fabrica/engrenagem', x: 5, y: 11, s: 0.5 }, { d: 'fabrica/engrenagem', x: 17, y: 11, s: 0.5, flip: true },
  ],
};
export default nivel;
