/** Sala bônus secreta da 5-1 — "chuva de castanhas" em forma de folhas caindo da sumaúma: ondas que descem em leque. */
import type { LevelDef } from '../../game/types';
const nivel: LevelDef = {
  id: '5-1-b1', nome: 'Câmara de Cristal', mundo: 5, tipo: 'bonus', tileset: 'cristal', parallax: 'cristal', preset: 'bonus', music: 'bonus', ambience: 'amb-cristal',
  tilemap: [
    '##########################',
    '#........................#',
    '#........................#',
    '#........................#',
    '#........................#',
    '#........................#',
    '#....=====......=====....#',
    '#........................#',
    '#..........====..........#',
    '#........................#',
    '#........................#',
    '##########################',
    '##########################',
  ],
  start: [13, 11],
  bonus: { modo: 'chuva', tempo: 18, premio: 'vida:1', retorno: ['5-1', 52.5, 174] },
  entities: [
    { t: 'chuva-controle', x: 13, y: 2, premio: 'vida:1', ondas: [[13], [11, 15], [9, 13, 17], [7, 11, 15, 19], [5, 9, 13, 17, 21], [3, 7, 11, 15, 19, 23], [2, 23], [4, 22], [6, 20], [8, 18], [10, 16], [12, 13, 14]] },
  ],
  coins: [],
  decor: [
    { d: 'cristal/cristal-g', x: 2, y: 11 }, { d: 'cristal/cristal-g', x: 24, y: 11, flip: true }, { d: 'cristal/cristal-flutuante', x: 13, y: 3 },
    { d: 'copa/folha-gigante', x: 6, y: 11, s: 0.6 }, { d: 'copa/flor-sumauma', x: 20, y: 11, s: 0.6 },
  ],
};
export default nivel;
