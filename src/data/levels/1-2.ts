/**
 * 1-2 COPAS E CIPÓS — travessia pelas copas, sem chão: só galhos, cipós e cordas sobre o abismo verde.
 * Ideia própria: a CHUVA ROTEIRIZADA. Na metade da fase o céu fecha (região chuva): os galhos ficam
 * escorregadios, a dupla desliza nas pontas e precisa frear cedo; o Guarda-chuva de Folha aparece logo
 * antes para planar. Gag: gag_selfie (Javalim fazendo selfie na beira do penhasco, de costas).
 * Interações 17.3: Jaca + Bromélia-mola (S7) e Coco + Flor-catapulta (S9).
 * Rotas: alta (Lili, galhos da copa com a letra I) e baixa (Tamá, oco do tronco com a sala bônus 1) se
 * reencontram no topo da Sumaúma Velha (Totem de Cipó).
 * Segmentos (coluna inicial): S1 0 · S2 22 · S3 46 · S4 72 · S5 96 · S6 122 · S7 146 · S8 170 · S9 192 · S10 220
 */
import type { LevelDef } from '../../game/types';
import { stitch, vazio } from './util';

const V = (w: number, n: number) => Array.from({ length: n }, () => vazio(w));
const R = (n: number, linha: string) => Array.from({ length: n }, () => linha);

// S1 — galho de partida; galho alto (só a Lili alcança) com castanhas
const S1 = [
  ...V(22, 9),
  '.....====.............',
  ...V(22, 3),
  '##########....======..',
  ...R(6, '##########............'),
];
// S2 — os primeiros cipós sobre o abismo, até o nó do tronco onde patrulha um Javalim; galho alto da Lili
const S2 = [
  ...V(24, 3),
  ...R(5, '..|....|................'),
  '..|....|..........====..',
  ...R(3, '..|....|................'),
  '..|....|....########....',
  '............########....',
  ...V(24, 6),
];
// S3 — corda longa com marimbondos; no alto, galhinhos da Lili (letra C); embaixo, galho escondido (Moeda-Folha)
const S3 = [
  ...V(26, 4),
  '..====.....====...====....',
  ...V(26, 4),
  '____________________......',
  ...V(26, 2),
  '.....................#####',
  ...R(2, '.....................#####'),
  '.........===.........#####',
  ...R(4, '.....................#####'),
];
// S4 — o penhasco da selfie (borda em 84); embaixo, a rota baixa da Tamá; no alto, os galhos da Lili (letra I)
const S4 = [
  ...V(24, 4),
  '..............=====.....',
  ...V(24, 3),
  '.......=====............',
  ...V(24, 3),
  ...R(4, '#############...........'),
  ...R(4, '#############..#########'),
];
// S5 — a Sumaúma Velha: tronco oco. Baixo: atravessa o oco (parede rachada → sala bônus 1) e sobe o cipó. Alto: corre pelo topo
const S5 = [
  ...V(26, 7),
  '===.....................|.',
  '........................|.',
  ...R(2, '..##################....|.'),
  ...R(2, '..##..............##....|.'),
  ...R(3, '........................|.'),
  ...R(4, '##########################'),
];
// S6 — começa a CHUVA (Totem de Cipó no topo): rampa escorregadia, galho comprido e um galhinho curto para frear
const S6 = [
  ...V(24, 9),
  '######\\.................',
  '#######\\................',
  '########\\...............',
  '#########\\..............',
  '################........',
  '##########.........====.',
  '#########...............',
  '########................',
  ...V(24, 3),
];
// S7 — debaixo do aguaceiro: bromélia-mola + jaca contra os marimbondos; galho altíssimo com a letra P
const S7 = [
  ...V(24, 4),
  '.........======.........',
  ...V(24, 5),
  '...........#####........',
  '...........#####....====',
  '........==.#####........',
  '...........#####........',
  ...R(2, '########...#####........'),
  '...........#####........',
  ...V(24, 3),
];
// S8 — a ponte do tronco caído (a chuva passa): caixa da Ema, Ninho do Reencontro, cipó das castanhas
const S8 = [
  ...V(22, 6),
  ...R(6, '..............|.......'),
  ...R(2, '########...#######....'),
  ...V(22, 6),
];
// S9 — clímax: duas Flores-catapulta encadeadas sobre o maior vão; lá embaixo, a saliência secreta (letra Ó + sala bônus 2)
const S9 = [
  ...V(28, 8),
  ...R(2, '.............####...........'),
  ...R(2, '########.....####...........'),
  '.............####...........',
  ...V(28, 3),
  ...R(3, '..........############......'),
  ...V(28, 1),
];
// S10 — plataforma do Totem de Saída
const S10 = [
  ...V(16, 10),
  ...R(10, '################'),
];

const nivel: LevelDef = {
  id: '1-2',
  nome: 'Copas e Cipós',
  mundo: 1,
  tipo: 'normal',
  tileset: 'copa',
  parallax: 'copa',
  preset: 'selva',
  music: 'mata',
  ambience: 'amb-copa',
  tilemap: stitch(S1, S2, S3, S4, S5, S6, S7, S8, S9, S10),
  start: [3, 13],
  checkpoint: [124, 9],
  exit: [231, 10],
  letras: [[58.5, 4], [88, 4], [157.5, 4], [209, 16]],
  moedaFolha: [56, 15],
  bonusRooms: ['1-2-b1', '1-2-b2'],
  targetTime: 170,
  gags: ['gag_selfie', 'gag_tedio', 'gag_parceiro_preso', 'gag_morte_comica'],
  totemPrizes: ['castanhas:10', 'parafusos:5', 'castanhas:20', 'vida:1', 'ficha'],
  regions: [
    { x0: 122, x1: 178, chuva: true },
  ],
  entities: [
    { t: 'npc', id: 'tucano', x: 7, y: 13, falas: ['Bem-vindos às copas! Aqui o chão é lá embaixo... BEM lá embaixo.', 'Encoste num cipó no ar para se agarrar. Pule de um para o outro!', 'Ouvi trovão. Se chover, galho molhado vira sabão. Freie cedo!'] },
    { t: 'arma', id: 'coco', x: 9.5, y: 13 },
    // S2/S3: cipós, nó do tronco e a corda
    { t: 'javalim', x: 38, y: 12, patrulha: [34.5, 41.5] },
    { t: 'marimbondo', x: 53, y: 13.5, rota: 'vaivem', raio: 2 },
    { t: 'marimbondo', x: 61, y: 6.5, rota: 'circulo', raio: 1.5 },
    { t: 'javalim', x: 70, y: 12, patrulha: [67.5, 74] },
    // S4: gag_selfie — o Javalim posa na beira, de costas para quem chega; um empurrão e lá vai ele
    { t: 'gag', id: 'gag_selfie', x: 84.2, y: 12, dir: 1 },
    { t: 'javalim-escudo', x: 78, y: 12, patrulha: [75, 81], dir: -1 },
    { t: 'marimbondo', x: 84, y: 6, rota: 'oito', raio: 2 },
    { t: 'cascavel', x: 93, y: 16 },
    // S5: oco da Sumaúma Velha (rota baixa)
    { t: 'javalim', x: 107, y: 16, patrulha: [103, 112] },
    { t: 'npc', id: 'quati', x: 117, y: 16, falas: ['Psiu! Quer comprar um guarda-chuva? Não? Vai precisar...', 'Na chuva, galho fica liso. Eu escorreguei três vezes e só caí duas.', 'Uma batidinha no chão revela segredo. Aquela parede ali no fundo, do lado do cipó, tá rachada, ó.'] },
    { t: 'javalim', x: 110, y: 9, patrulha: [104, 114] },
    // fundo sem saída ao lado do cipó: parede rachada → sala bônus 1
    { t: 'parede-rachada', x: 121.5, y: 16, variante: 'mata' },
    { t: 'porta-bonus', x: 121.5, y: 16, room: '1-2-b1', oculta: true },
    // S6: chuva — Guarda-chuva de Folha para planar
    { t: 'arma', id: 'guarda-chuva', x: 126, y: 9 },
    { t: 'javalim', x: 133, y: 13, patrulha: [131, 137] },
    { t: 'marimbondo', x: 139, y: 9.5, rota: 'vaivem', raio: 1.5 },
    // S7: bromélia + jaca contra os marimbondos
    { t: 'bromelia', x: 149.5, y: 14 },
    { t: 'arma', id: 'jaca', x: 152.5, y: 14 },
    { t: 'marimbondo', x: 150, y: 9, rota: 'vaivem', raio: 2 },
    { t: 'marimbondo', x: 159, y: 7.5, rota: 'circulo', raio: 1.4 },
    { t: 'javalim', x: 159.5, y: 10, patrulha: [157.5, 161.5] },
    // S8: a ponte do tronco caído
    { t: 'caixa-montaria', x: 172.5, y: 12, m: 'ema' },
    { t: 'javalim-escudo', x: 176, y: 12, patrulha: [173.5, 177.5] },
    { t: 'ninho', x: 183.5, y: 12 },
    { t: 'marimbondo', x: 179.5, y: 9, rota: 'vaivem', raio: 1.5 },
    { t: 'cascavel', x: 186.5, y: 12 },
    // S9: clímax — flores-catapulta encadeadas
    { t: 'arma', id: 'coco', x: 195, y: 10 },
    { t: 'flor-catapulta', x: 198.5, y: 10, ang: -66, forca: 980 },
    { t: 'flor-catapulta', x: 207.5, y: 8, ang: -30, forca: 950 },
    { t: 'marimbondo', x: 212, y: 5.5, rota: 'oito', raio: 1.6 },
    { t: 'serrote', x: 216, y: 8, amp: 1.2, freq: 0.8 },
    { t: 'porta-bonus', x: 204.5, y: 16, room: '1-2-b2' },
    { t: 'bromelia', x: 212, y: 16, forca: 1750 },
    // S10: chegada
    { t: 'javalim', x: 226, y: 10, patrulha: [222, 229] },
    { t: 'balao', x: 101, y: 3, n: 1 },
  ],
  coins: [
    { path: [[5.5, 8.5], [8.5, 8.5]] },
    { path: [[12, 12.2], [14.5, 11.6], [17, 12.2]] },
    { path: [[24.5, 10], [24.5, 6]] },
    { path: [[29.5, 10], [29.5, 6]] },
    { path: [[40.5, 7.5], [43.5, 7.5]] },
    { path: [[35, 11], [40, 11]] },
    { path: [[47, 13], [55, 13], [64, 13]], step: 1 },
    { path: [[48.5, 3.4], [51.5, 3.4]] },
    { path: [[64.5, 3.4], [67.5, 3.4]], cacho: true },
    { path: [[54.5, 14.5], [57.5, 14.5]] },
    { path: [[85.5, 13], [86.5, 15.5]] },
    { path: [[88.5, 15], [94.5, 15]] },
    { path: [[79.5, 7.4], [82.5, 7.4]] },
    { path: [[96.5, 6.4], [98.5, 6.4]] },
    { path: [[101.5, 15], [101.5, 13]] },
    { path: [[104, 15], [112, 15]], step: 1 },
    { path: [[120.5, 15], [120.5, 8]] },
    { path: [[116.5, 7.5], [119, 7.5]] },
    { path: [[129, 10.4], [131.5, 12.4]] },
    { path: [[141.5, 13.5], [143.5, 13.5]] },
    { path: [[147, 13], [150.5, 12], [154.5, 11]] },
    { path: [[149.5, 11], [149.5, 5]], step: 1 },
    { path: [[155.5, 3.4], [160, 3.4]], cacho: true },
    { path: [[166.5, 10.4], [169.5, 10.4]] },
    { path: [[178.5, 11.2], [180, 10.4]] },
    { path: [[184.5, 10.5], [184.5, 7]] },
    { path: [[188.5, 11.2], [191, 9.5]] },
    { path: [[200, 6.5], [203, 4.5], [206, 5]], step: 0.9 },
    { path: [[209, 6], [213, 4.5], [217, 5], [220, 8]], step: 0.9 },
    { path: [[203, 15.3], [206, 15.3]] },
  ],
  cameraZones: [
    { x0: 80, x1: 88, zoom: 1.08 },
    { x0: 96, x1: 121, zoom: 0.9 },
    { x0: 194, x1: 222, zoom: 0.84, tiltY: -3 },
  ],
  decor: [
    { d: 'copa/galho-g', x: 2, y: 13 },
    { d: 'copa/folha-gigante', x: 6, y: 13, front: true },
    { d: 'copa/flor-sumauma', x: 11.5, y: 13 },
    { d: 'mata/cipo-pendente', x: 13, y: 0 },
    { d: 'copa/ninho-aves', x: 6.5, y: 9 },
    { d: 'mata/cipo-pendente', x: 32, y: 0, flip: true },
    { d: 'copa/folha-gigante', x: 36, y: 12 },
    { d: 'copa/semente-luz', x: 44, y: 6 },
    { d: 'copa/ninho-aves', x: 52, y: 5 },
    { d: 'copa/galho-g', x: 69, y: 12, flip: true },
    { d: 'copa/flor-sumauma', x: 75, y: 12 },
    { d: 'mata/bromelia-deco', x: 81, y: 12 },
    { d: 'copa/folha-gigante', x: 89, y: 8, front: true },
    { d: 'copa/semente-luz', x: 92, y: 3 },
    { d: 'mata/cogumelos', x: 103, y: 16 },
    { d: 'mata/raiz', x: 111, y: 16 },
    { d: 'copa/ninho-aves', x: 104, y: 9 },
    { d: 'copa/flor-sumauma', x: 113.5, y: 9 },
    { d: 'mata/cipo-pendente', x: 125, y: 0 },
    { d: 'copa/folha-gigante', x: 133, y: 13, front: true },
    { d: 'copa/galho-g', x: 141, y: 13, flip: true },
    { d: 'mata/bromelia-deco', x: 147, y: 14 },
    { d: 'copa/folha-gigante', x: 163.5, y: 12 },
    { d: 'mata/cipo-pendente', x: 155, y: 0, flip: true },
    { d: 'copa/flor-sumauma', x: 171, y: 15 },
    { d: 'mata/tronco-caido', x: 175, y: 15, s: 0.8 },
    { d: 'copa/semente-luz', x: 187, y: 9 },
    { d: 'copa/folha-gigante', x: 195, y: 11, front: true },
    { d: 'copa/ninho-aves', x: 208, y: 8 },
    { d: 'mata/cipo-pendente', x: 214, y: 0 },
    { d: 'copa/flor-sumauma', x: 205, y: 15 },
    { d: 'copa/galho-g', x: 223, y: 10 },
    { d: 'copa/folha-gigante', x: 228, y: 10, front: true },
    { d: 'copa/semente-luz', x: 233, y: 6 },
  ],
};
export default nivel;
