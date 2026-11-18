/**
 * 1-3 SERRARIA CLANDESTINA — a mata devastada vira linha de produção do Barão.
 * Ideia própria: ESTEIRAS. Esteiras '>' e '<' empurram a dupla (e as toras) para as serras; dá para usar a
 * esteira a favor (corrida turbinada) ou lutar contra ela. A Chave Inglesa desliga as serras no painel da
 * máquina (interação 17.3) e o Pedaço de Cupinzeiro rói os blocos de madeira que escondem a sala bônus 1.
 * Gag: gag_serraria — subir numa tora da esteira que vai para a serra e pular no último segundo; a serra
 * transforma a tora numa escultura da Tamá.
 * Rotas: alta (Lili: esteira das toras → telhado do galpão, letras I e P, sala bônus 2) e baixa (Tamá: porão
 * sob a esteira, blocos de madeira, corredor das serras) que se reencontram no depósito (S8).
 * Segmentos (coluna inicial): S1 0 · S2 22 · S3 46 · S4 72 · S5 98 · S6 120 · S7 146 · S8 172 · S9 196 · S10 224
 */
import type { LevelDef } from '../../game/types';
import { stitch, vazio, cheio } from './util';

const V = (w: number, n: number) => Array.from({ length: n }, () => vazio(w));
const C = (w: number, n: number) => Array.from({ length: n }, () => cheio(w));
const R = (n: number, linha: string) => Array.from({ length: n }, () => linha);

// S1 — clareira devastada: tocos, placa da serraria e o Tucano indignado
const S1 = [...V(22, 11), '..............====....', ...V(22, 2), ...C(22, 4)];
// S2 — pátio das toras: pirâmide de toras empilhadas (letra C no topo) e a caixa da Ema
const S2 = [
  ...V(24, 9),
  ...R(2, '...............###......'),
  ...R(2, '..........########......'),
  '.....#############......',
  ...C(24, 4),
];
// S3 — a primeira esteira: empurra para a serra que sobe e desce; painel da máquina e a Chave Inglesa
const S3 = [
  ...V(26, 13),
  '......................####',
  '##>>>>>>>>>>>>>>>>>>>>####',
  ...C(26, 3),
];
// S4 — gag_serraria: a esteira das toras corre lá no alto até a serra; embaixo, o porão com blocos de madeira
const S4 = [
  ...V(26, 3),
  '...................====...',
  ...V(26, 3),
  ...R(2, '....................######'),
  vazio(26),
  '.>>>>>>>>>>>>>>>>>........',
  ...V(26, 3),
  ...R(2, '############..############'),
  ...C(26, 2),
];
// S5 — pátio do Totem de Cipó; a rota alta desce do telhado
const S5 = [...V(22, 7), ...R(2, '####..................'), ...V(22, 5), ...C(22, 4)];
// S6 — escada de esteiras contrárias sobre o vão; esteira alta (letra P, só a Lili) e, lá embaixo, a saliência secreta (Moeda-Folha + bromélia de volta)
const S6 = [
  ...V(26, 6),
  '.........<<<<<<...........',
  ...V(26, 3),
  '..........>>>>>>..........',
  '.....................#####',
  '...<<<<<<............#####',
  '.....................#####',
  '##...................#####',
  '##...................#####',
  '##..............===..#####',
  '##...................#####',
];
// S7 — o corredor das serras (dentro do galpão); por cima, o telhado da rota alta
const S7 = [
  ...V(26, 7),
  ...R(2, '....######################'),
  ...V(26, 2),
  ...R(3, '####......................'),
  ...C(26, 4),
];
// S8 — o depósito: tábuas sobre o fosso de pregos; Ninho do Reencontro na tábua do meio
const S8 = [
  ...V(24, 7),
  ...R(2, '###.....................'),
  ...V(24, 2),
  '...........====.........',
  '.....====........====...',
  vazio(24),
  ...R(2, '###..................###'),
  '###^^^^^^^^^^^^^^^^^^###',
  cheio(24),
];
// S9 — clímax: a esteira final, com a serra-gigante correndo atrás da dupla; vãos sem fundo
const S9 = [
  ...V(28, 10),
  '............======..........',
  ...V(28, 3),
  '>>>>>>>>>..>>>>>>>>...>>>>>>',
  ...R(3, '#########..########...######'),
];
// S10 — fora da serraria: o último pedaço de mata em pé e o Totem de Saída
const S10 = [...V(16, 14), ...C(16, 4)];

const nivel: LevelDef = {
  id: '1-3',
  nome: 'Serraria Clandestina',
  mundo: 1,
  tipo: 'normal',
  tileset: 'mata',
  parallax: 'serraria',
  preset: 'selva',
  music: 'mata',
  ambience: 'amb-mata',
  tilemap: stitch(S1, S2, S3, S4, S5, S6, S7, S8, S9, S10),
  start: [3, 14],
  checkpoint: [109, 14],
  exit: [234, 14],
  letras: [[38.5, 9], [92.5, 3], [131.5, 6], [205.5, 12]],
  moedaFolha: [137, 16],
  bonusRooms: ['1-3-b1', '1-3-b2'],
  targetTime: 165,
  gags: ['gag_serraria', 'gag_tedio', 'gag_parceiro_preso', 'gag_morte_comica'],
  totemPrizes: ['castanhas:10', 'parafusos:10', 'castanhas:20', 'vida:1', 'ficha'],
  entities: [
    { t: 'npc', id: 'tucano', x: 7, y: 14, falas: ['Aqui era a mata mais bonita da ilha... agora é tábua e barulho.', 'As esteiras empurram! Corra a favor e voe; contra, vai suar.', 'Viu um painel de máquina? Uma chave inglesa resolve qualquer conversa.'] },
    { t: 'arma', id: 'vassoura', x: 11, y: 14 },
    { t: 'javalim', x: 18, y: 14, patrulha: [13, 21] },
    // S2: pátio das toras
    { t: 'caixa-montaria', x: 25, y: 14, m: 'ema' },
    { t: 'javalim', x: 31, y: 13, patrulha: [28, 34] },
    { t: 'javalim-escudo', x: 36, y: 11, patrulha: [33, 39], dir: -1 },
    { t: 'cascavel', x: 43, y: 14 },
    // S3: primeira esteira, serra e painel
    { t: 'arma', id: 'chave', x: 47, y: 14 },
    { t: 'painel-maquina', x: 50, y: 14, alvo: 'serra-a' },
    { t: 'serra-gigante', tag: 'serra-a', x: 63, y: 14, path: [[63, 10], [63, 14.2]], vel: 180 },
    { t: 'javalim', x: 57, y: 14, patrulha: [53, 61] },
    { t: 'serrote', x: 66, y: 9, amp: 1.5, freq: 0.6 },
    // S4: gag_serraria (esteira das toras no alto) e o porão
    { t: 'gag', id: 'gag_serraria', x: 90, y: 10, de: 73, intervalo: 3.5, vel: 120 },
    { t: 'arma', id: 'cupinzeiro', x: 76, y: 14 },
    // alçapão de madeira no chão do porão: os cupins comem a tampa e revelam a porta da sala bônus 1
    { t: 'bloco-madeira', x: 84.5, y: 15 },
    { t: 'bloco-madeira', x: 85.5, y: 15 },
    { t: 'porta-bonus', x: 85, y: 16, room: '1-3-b1' },
    { t: 'javalim', x: 80, y: 14, patrulha: [77, 84] },
    { t: 'marimbondo', x: 94, y: 5, rota: 'circulo', raio: 1.5 },
    // S5: Totem de Cipó
    { t: 'npc', id: 'quati', x: 104, y: 14, falas: ['Tora fresquinha! Quer? Não? Melhor, que eu roubei.', 'A Tamá que vira escultura... digo, a tora! A tora vira escultura da Tamá.', 'Se a esteira puxar pra trás, corra mais. Simples. Eu nunca corro.'] },
    { t: 'javalim', x: 115, y: 14, patrulha: [111, 119] },
    // S6: escada de esteiras
    { t: 'serrote', x: 129, y: 9, amp: 1.2, freq: 0.7 },
    { t: 'serrote', x: 138, y: 4.5, amp: 1, freq: 0.9 },
    { t: 'javalim', x: 143.5, y: 11, patrulha: [141.5, 145.5] },
    { t: 'bromelia', x: 138.2, y: 16, forca: 1500 },
    // S7: corredor das serras (a Chave desliga pelo painel)
    { t: 'painel-maquina', x: 151, y: 14, alvo: 'serras-corredor' },
    { t: 'serra-gigante', tag: 'serras-corredor', x: 156, y: 9.5, path: [[156, 9.5], [156, 14.2]], vel: 220 },
    { t: 'serra-gigante', tag: 'serras-corredor', x: 161, y: 14.2, path: [[161, 14.2], [161, 9.5]], vel: 220 },
    { t: 'serra-gigante', tag: 'serras-corredor', x: 166, y: 9.5, path: [[166, 9.5], [166, 14.2]], vel: 260 },
    { t: 'arma', id: 'buzina', x: 147.5, y: 11 },
    { t: 'javalim', x: 169, y: 14, patrulha: [167, 171], dir: -1 },
    { t: 'marimbondo', x: 160, y: 5, rota: 'vaivem', raio: 3 },
    { t: 'porta-bonus', x: 170.5, y: 7, room: '1-3-b2' },
    // S8: depósito
    { t: 'ninho', x: 184.5, y: 11 },
    { t: 'marimbondo', x: 180, y: 9, rota: 'oito', raio: 1.5 },
    { t: 'marimbondo', x: 190, y: 9.5, rota: 'vaivem', raio: 1.5 },
    // S9: clímax — a serra-gigante persegue pela esteira
    { t: 'serra-gigante', tag: 'serra-final', x: 194, y: 14, path: [[194, 14], [221, 14]], vel: 300 },
    { t: 'arma', id: 'capacete', x: 199, y: 14 },
    { t: 'javalim', x: 212, y: 14, patrulha: [209, 214] },
    { t: 'javalim-escudo', x: 220, y: 14, patrulha: [218, 223], dir: -1 },
    { t: 'cascavel', x: 227, y: 14 },
    { t: 'balao', x: 175, y: 4, n: 1 },
  ],
  coins: [
    { path: [[14, 10.4], [17.5, 10.4]] },
    { path: [[22, 13], [26, 12], [28.5, 12.4]] },
    { path: [[29, 12.4], [32, 12.4]] },
    { path: [[34, 10.4], [37, 8.4], [39.5, 8.4]], cacho: true },
    { path: [[41, 10], [44, 13]] },
    { path: [[52, 13], [60, 13]], step: 1 },
    { path: [[64, 9], [66, 11.5]] },
    { path: [[74, 9.3], [86, 9.3]], step: 1 },
    { path: [[91, 2.4], [94, 2.4]] },
    { path: [[93, 6.4], [97, 6.4]] },
    { path: [[77, 13.3], [83, 13.3]] },
    { path: [[100, 13], [103, 13]] },
    { path: [[121, 13], [123, 11.4], [125, 11.4]] },
    { path: [[127, 10], [129, 9.4], [131, 9.4]] },
    { path: [[136, 15.4], [137.5, 15.4]] },
    { path: [[136.5, 9], [140, 10.4]] },
    { path: [[129.5, 5.4], [133.5, 5.4]] },
    { path: [[152, 6.4], [170, 6.4]], step: 1.5 },
    { path: [[154, 13], [168, 13]], step: 1 },
    { path: [[177, 11.4], [180, 11.4]] },
    { path: [[183, 10.4], [186, 10.4]] },
    { path: [[189, 11.4], [192, 11.4]] },
    { path: [[208, 10.4], [213, 10.4]], cacho: true },
    { path: [[198, 13], [204, 13], [205.5, 12], [207, 13]] },
    { path: [[215, 12], [216.5, 12.5], [218, 13]] },
    { path: [[226, 13], [230, 13]] },
  ],
  cameraZones: [
    { x0: 72, x1: 97, zoom: 0.9 },
    { x0: 150, x1: 171, zoom: 1.06 },
    { x0: 196, x1: 224, zoom: 0.92, tiltY: -2 },
  ],
  decor: [
    { d: 'mata/toco', x: 2, y: 14 },
    { d: 'mata/placa-serraria', x: 10, y: 14 },
    { d: 'mata/toco', x: 13.5, y: 14, flip: true },
    { d: 'fabrica/toco-cortado', x: 16, y: 14 },
    { d: 'mata/samambaia', x: 5, y: 14, front: true },
    { d: 'mata/pilha-toras', x: 24, y: 14, s: 1.1 },
    { d: 'mata/tronco-caido', x: 30, y: 13, s: 0.8 },
    { d: 'mata/pilha-toras', x: 44.5, y: 14, flip: true },
    { d: 'fabrica/cerca-arame', x: 46, y: 14 },
    { d: 'mata/maquina-serraria', x: 69.5, y: 13 },
    { d: 'fabrica/engrenagem', x: 58, y: 10 },
    { d: 'mata/maquina-serraria', x: 92, y: 14, s: 1.2 },
    { d: 'fabrica/corrente', x: 80, y: 0 },
    { d: 'fabrica/barril-oleo', x: 95, y: 14 },
    { d: 'mata/toco', x: 101, y: 14 },
    { d: 'mata/placa-serraria', x: 112, y: 14, flip: true },
    { d: 'fabrica/caixa-metal', x: 118, y: 14 },
    { d: 'fabrica/engrenagem', x: 133, y: 3 },
    { d: 'fabrica/painel', x: 152.5, y: 14 },
    { d: 'fabrica/cano', x: 158.5, y: 9 },
    { d: 'fabrica/corrente', x: 163.5, y: 9 },
    { d: 'fabrica/chamine-p', x: 165, y: 7 },
    { d: 'fabrica/barril-oleo', x: 173, y: 14, flip: true },
    { d: 'mata/pilha-toras', x: 194, y: 14 },
    { d: 'fabrica/tubo-vapor', x: 200, y: 10 },
    { d: 'mata/maquina-serraria', x: 217, y: 10, s: 1.3, flip: true },
    { d: 'fabrica/cerca-arame', x: 224, y: 14 },
    { d: 'mata/palmeira-jovem', x: 231, y: 14 },
    { d: 'mata/heliconia', x: 237, y: 14, front: true },
    { d: 'mata/samambaia', x: 228.5, y: 14, front: true },
    { d: 'mata/arbusto', x: 238.5, y: 14 },
  ],
};
export default nivel;
