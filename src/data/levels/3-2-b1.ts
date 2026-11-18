/** Sala bônus 1 da 3-2 — "achar o objeto certo": cinco cabaças embaralham; só uma guarda a pérola-prêmio. */
import type { LevelDef } from '../../game/types';
const nivel: LevelDef = {
  id: '3-2-b1', nome: 'Câmara de Cristal', mundo: 3, tipo: 'bonus', tileset: 'cristal', parallax: 'cristal', preset: 'bonus', music: 'bonus', ambience: 'amb-cristal',
  tilemap: [
    '########################',
    '#......................#',
    '#......................#',
    '#......................#',
    '#......................#',
    '#......................#',
    '#........======........#',
    '#......................#',
    '#......................#',
    '#......................#',
    '#......................#',
    '########################',
    '########################',
  ],
  start: [2.5, 11],
  bonus: { modo: 'achar', tempo: 12, premio: 'castanhas:30', retorno: ['3-2', 106.5, 3] },
  entities: [
    // a pérola começa na cabaça do meio; sete trocas escritas à mão, uma de cada vez
    { t: 'achar-controle', x: 12, y: 11, itens: ['vazio', 'vazio', 'premio', 'vazio', 'vazio'], trocas: [[2, 0], [1, 3], [0, 4], [2, 3], [1, 4], [0, 2], [3, 4]] },
    { t: 'npc', id: 'tucano', x: 21.5, y: 11, falas: ['Siga a cabaça da pérola com os olhos. Eu já me perdi na terceira troca.'] },
  ],
  coins: [
    { path: [[10, 5.2], [14, 5.2]], step: 0.8 },
  ],
  decor: [
    { d: 'cristal/cristal-g', x: 2, y: 11 }, { d: 'cristal/cristal-p', x: 22.5, y: 11 }, { d: 'cristal/cristal-flutuante', x: 6, y: 3.5 },
    { d: 'cristal/cristal-flutuante', x: 18, y: 3, flip: true }, { d: 'recife/concha', x: 12, y: 6 },
  ],
};
export default nivel;
