/**
 * 3-3 NAUFRÁGIO ESCURO. Ideia própria: AR E ÁGUA DENTRO DO CASCO.
 * O navio afundado guarda BOLSÕES DE AR: os conveses de cima estão secos (e ESCUROS), os porões estão
 * alagados. A dupla alterna entre andar no escuro com a LAMPARINA (que se perde ao mergulhar!) e nadar
 * nos porões iluminados só pelas Águas-Vivas-Néon. Na cabine do capitão mora o BAÚ-BOCA (gag_naufragio):
 * ele persegue a dupla pela sala, e o Peixe Seco da cozinha o distrai. Clímax: subir pela escotilha e
 * pelo mastro, correr pela PROA INCLINADA que sai da água (escudeiros e o Javalão descendo a rampa)
 * e atravessar a corda até a ilha do Totem de Saída.
 * Segmentos (coluna inicial): W1 0 · W2 22 · W3 46 · W4 72 · W5 98 · W6 124 · W7 150 · W8 176 · W9 202
 * Altura 24: linhas 0–5 ar, superfície do mar na 6, convés de cima do navio na 9, conveses secos 10–14,
 * piso na 15, porão alagado 16–20, quilha 21, fundo 22–23.
 */
import type { LevelDef } from '../../game/types';
import { stitch, vazio, cheio } from './util';

const V = (w: number, n: number) => Array.from({ length: n }, () => vazio(w));
const C = (w: number, n: number) => Array.from({ length: n }, () => cheio(w));
const R = (row: string, n: number) => Array.from({ length: n }, () => row);

// W1 — a pedra da largada e o mergulho até o casco; Peixe Seco na pedra do fundo
const W1 = [
  ...V(22, 6),
  '#####~~~~~~~~~~~~~~~~~',
  '#####~~~~~~~~~~~~~~~~~',
  '####~~~~~~~~~~~~~~~~~~',
  ...R('###~~~~~~~~~~~~~~~~~~~', 4),
  ...R('##~~~~~~~~~~~~~~~~~~~~', 7),
  '##~~~~~~~~~~~~~~~##~~~',
  '###~~~~~~~~~~~~~####~~',
  ...C(22, 2),
];
// W2 — a popa: castelo de popa maciço (com a câmara secreta da Moeda-Folha, entrada pelo teto)
// e o rombo no casco por onde se entra no porão
const W2 = [
  ...V(24, 6),
  ...R('~~~~~~~~~~~~~~~~~~~~~~~~', 3),
  '~~~~~~~~######~~########',
  ...R('~~~~~~~~####~~~~########', 4),
  '~~~~~~~~################',
  '~~~~~~~~################',
  '~~~~~~~~#~~~~~~~~~~~~~~~',
  ...R('~~~~~~~~~~~~~~~~~~~~~~~~', 3),
  '~~~~~~~~#~~~~~~~~~~~~~~~',
  '~~~~~~~~################',
  ...C(24, 2),
];
// W3 — o primeiro convés seco (escuro): escotilha vinda do porão, prateleira da letra C, Lamparina
const W3 = [
  ...V(26, 6),
  ...R('~~~~~~~~~~~~~~~~~~~~~~~~~~', 3),
  cheio(26),
  ...R('#.........................', 2),
  '#...........=====.........',
  ...R('#.........................', 2),
  '####~~####################',
  ...R('~~~~~~~~~~~~~~~~~~~~~~~~~~', 5),
  ...C(26, 3),
];
// W4 — a cozinha: mesa com o Peixe Seco, assoalho podre que cai no porão, Totem de Cipó no fim
const W4 = [
  ...V(26, 6),
  ...R('~~~~~~~~~~~~~~~~~~~~~~~~~~', 3),
  cheio(26),
  ...V(26, 2),
  '...====...................',
  ...V(26, 2),
  '##########~~~~######~~####',
  ...R('~~~~~~~~~~~~~~~~~~~~~~~~~~', 5),
  ...C(26, 3),
];
// W5 — a cabine do capitão: território do Baú-Boca (gag_naufragio); estantes para fugir dele
const W5 = [
  ...V(26, 6),
  ...R('~~~~~~~~~~~~~~~~~~~~~~~~~~', 3),
  cheio(26),
  ...R('.........................#', 2),
  '...====...........====...#',
  ...R('.........................#', 2),
  '######################~~~#',
  ...R('~~~~~~~~~~~~~~~~~~~~~~~~~~', 5),
  ...C(26, 3),
];
// W6 — o porão de carga alagado: caixotes empilhados, Águas-Vivas-Néon como únicas luzes
const W6 = [
  ...V(26, 6),
  ...R('~~~~~~~~~~~~~~~~~~~~~~~~~~', 3),
  cheio(26),
  ...R('~~~~~~~~~~~~~~~~~~~~~~~~~~', 4),
  ...R('~~~~~~~~~~~~~~###~~~~~~~~~', 2),
  '~~~~~###~~~~~~###~~~~~~~~~',
  ...R('~~~~~###~~~~~~###~~~~###~~', 4),
  ...C(26, 3),
];
// W7 — a escotilha para fora e o primeiro mastro (cipó/algas) com a verga: porta da sala bônus 2
const W7 = [
  ...V(26, 3),
  '...............=======....',
  ...R('..................|.......', 2),
  ...R('~~~~~~~~~~~~~~~~~~!~~~~~~~', 3),
  '########~~~~##############',
  ...R('~~~~~~~~~~~~~~~~~~~~~~~~~~', 11),
  ...C(26, 3),
];
// W8 — clímax: a PROA INCLINADA sai da água (degraus do casco submersos, rampa fora d'água); corda da ponta da proa até a ilha
const W8 = [
  vazio(26),
  '......................____',
  ...V(26, 2),
  '........../###########....',
  '........./############....',
  '~~~~~~~~##############~~~~',
  '~~~~~~~###############~~~~',
  '~~~~~~################~~~~',
  ...R('######################~~~~', 13),
  ...C(26, 2),
];
// W9 — a corda termina sobre a ilha do Totem de Saída (quem cai, nada até a margem)
const W9 = [
  vazio(26),
  '__________................',
  ...V(26, 3),
  '..........################',
  ...R('~~~~~~~~~~################', 16),
  ...C(26, 2),
];

const nivel: LevelDef = {
  id: '3-3',
  nome: 'Naufrágio Escuro',
  mundo: 3,
  tipo: 'normal',
  tileset: 'recife',
  parallax: 'naufragio',
  preset: 'recife',
  music: 'recife',
  ambience: 'amb-recife',
  tilemap: stitch(W1, W2, W3, W4, W5, W6, W7, W8, W9),
  start: [2.5, 6],
  checkpoint: [95.5, 15],
  exit: [220, 5],
  letras: [[60, 11.4], [136.5, 11.5], [199.5, 20], [192, 3.4]],
  moedaFolha: [36.5, 13],
  bonusRooms: ['3-3-b1', '3-3-b2'],
  targetTime: 220,
  gags: ['gag_naufragio', 'gag_tedio', 'gag_parceiro_preso', 'gag_morte_comica'],
  totemPrizes: ['castanhas:20', 'parafusos:10', 'castanhas:30', 'ficha', 'vida:1'],
  regions: [
    { x0: 30, x1: 176, y0: 10, y1: 24, escuro: true },
  ],
  entities: [
    { t: 'npc', id: 'bem-te-vi', x: 1.5, y: 6, falas: ['Bem-te-vi! Bem-te-vi entrar aí no escuro... e não quero ir junto.', 'Lá dentro tem ar preso nos conveses. E um baú com dente. Baú NÃO deveria ter dente.', 'Lamparina não gosta de mergulho: se cair na água, apaga e fica pra trás!'] },
    { t: 'arma', id: 'remo', x: 9.5, y: 22 },
    { t: 'caranguejo', x: 12, y: 22 },
    { t: 'piranha', x: 14, y: 14, rota: [[10, 14], [18, 14]] },
    { t: 'arma', id: 'peixe', x: 17.5, y: 20 },
    { t: 'caranguejo', x: 26, y: 22, dir: -1 },
    { t: 'piranha', x: 38, y: 18.5, rota: [[34, 18.5], [42, 18.5]] },
    { t: 'agua-viva', x: 44, y: 18.5, amp: 1.5 },
    { t: 'arma', id: 'lamparina', x: 53, y: 15 },
    { t: 'javalim', x: 58, y: 15, patrulha: [55, 70], arma: 'lamparina' },
    { t: 'javalim', x: 67, y: 15, patrulha: [62, 71], dir: -1 },
    { t: 'piranha', x: 60, y: 18.5, rota: [[57.5, 17], [62.5, 20], [62.5, 17], [57.5, 20]] },
    { t: 'javalim-escudo', x: 78, y: 15, patrulha: [73, 81] },
    { t: 'javalim', x: 89, y: 15, patrulha: [86, 91], arma: 'lamparina' },
    { t: 'piranha', x: 84, y: 19, rota: [[81, 19], [87, 19]] },
    // a cabine: o Baú-Boca dorme encostado na parede; o peixe jogado longe faz ele correr atrás
    { t: 'gag', id: 'gag_naufragio', x: 116, y: 15, x0: 98, x1: 122, y0: 9, y1: 15 },
    { t: 'javalim', x: 104, y: 15, patrulha: [100, 108] },
    { t: 'agua-viva', x: 128, y: 13, amp: 2.5 },
    { t: 'agua-viva', x: 141, y: 12, amp: 3 },
    { t: 'baiacu', x: 134, y: 18 },
    { t: 'piranha', x: 145, y: 15, rota: [[143, 15], [145, 13], [147, 15], [145, 17]] },
    { t: 'porta-bonus', x: 64.5, y: 15, room: '3-3-b1', oculta: true },
    { t: 'agua-viva', x: 156, y: 15, amp: 3 },
    { t: 'baiacu', x: 165, y: 17 },
    { t: 'porta-bonus', x: 166.5, y: 3, room: '3-3-b2' },
    { t: 'javalim-escudo', x: 190, y: 4, patrulha: [187, 196], dir: -1 },
    { t: 'javalao', x: 194, y: 4, patrulha: [190, 197], dir: -1 },
    { t: 'arma', id: 'coco', x: 178, y: 9 },
    { t: 'piranha', x: 207, y: 10, rota: [[203, 10], [211, 10]] },
    { t: 'piranha', x: 201, y: 16, rota: [[199, 16], [201, 14], [203, 16], [201, 18]] },
    { t: 'npc', id: 'tucano', x: 224.5, y: 5, falas: ['Vocês estão cheirando a peixe seco. Não é crítica, é constatação.', 'A Corrente das Águas-Vivas é logo ali. Tragam sapatos de dança.'] },
  ],
  coins: [
    { path: [[6, 6], [10, 10], [12, 16]], step: 1 },
    { path: [[14, 21], [18, 18.5]] },
    { path: [[24, 17], [30, 18.5], [36, 18.5]], step: 1 },
    { path: [[36.5, 7], [36.5, 11]], step: 0.9 },
    { path: [[40, 18.5], [49, 18.5]], step: 1 },
    { path: [[50.5, 17.5], [50.5, 14]], step: 0.9 },
    { path: [[58, 11], [62, 11]] },
    { path: [[64, 13.5], [70, 13.5]] },
    { path: [[73, 11.5], [77, 11.5]] },
    { path: [[82, 13.5], [85, 13.5]] },
    { path: [[82, 17], [86, 17], [92, 17.5]], step: 1 },
    { path: [[101, 11.5], [104, 11.5]] },
    { path: [[115, 11.5], [118, 11.5]] },
    { path: [[121, 16.5], [128, 16.5]], step: 1 },
    { path: [[130, 13], [137, 13], [141, 14.5], [147, 14.5]], step: 1 },
    { path: [[154, 11], [159, 9], [161, 7]], step: 1 },
    { path: [[165, 2.4], [171, 2.4]] },
    { path: [[181.5, 6.5], [184, 5.2], [186, 3.6]] },
    { path: [[188, 2.8], [196, 2.8]], step: 1 },
    { path: [[198.5, 2.6], [210, 2.6]], step: 1 },
    { path: [[198.5, 9], [199.5, 17]], step: 1 },
    { path: [[214, 4], [218, 4]], cacho: true },
  ],
  cameraZones: [
    { x0: 46, x1: 98, zoom: 1.06 },
    { x0: 98, x1: 123, zoom: 0.96, tiltX: 2 },
    { x0: 176, x1: 212, zoom: 0.88, tiltY: -3 },
  ],
  decor: [
    { d: 'recife/alga-alta', x: 7, y: 22 },
    { d: 'recife/coral-leque', x: 13, y: 22 },
    { d: 'recife/ancora', x: 20.5, y: 22 },
    { d: 'recife/estrela-mar', x: 18, y: 20 },
    { d: 'recife/timao', x: 27, y: 9, s: 1.1 },
    { d: 'recife/barril-naufrago', x: 36.5, y: 9, front: true, s: 1.2 },
    { d: 'recife/coral-cerebro', x: 32, y: 9 },
    { d: 'recife/alga-alta', x: 29.5, y: 22, front: true },
    { d: 'recife/barril-naufrago', x: 48, y: 15 },
    { d: 'recife/bau-velho', x: 64, y: 15 },
    { d: 'recife/barril-naufrago', x: 69.5, y: 15, flip: true },
    { d: 'recife/concha', x: 75, y: 12 },
    { d: 'recife/barril-naufrago', x: 80, y: 15 },
    { d: 'recife/ancora', x: 88, y: 21 },
    { d: 'recife/timao', x: 112, y: 15 },
    { d: 'recife/bau-velho', x: 100.5, y: 12 },
    { d: 'recife/barril-naufrago', x: 120, y: 12, s: 0.8 },
    { d: 'recife/alga-alta', x: 127, y: 21 },
    { d: 'recife/barril-naufrago', x: 140, y: 21 },
    { d: 'recife/coral-leque', x: 146, y: 21 },
    { d: 'recife/anemona', x: 152, y: 21 },
    { d: 'recife/alga-alta', x: 160, y: 21, flip: true },
    { d: 'recife/coral-cerebro', x: 155, y: 9 },
    { d: 'recife/timao', x: 196, y: 4, s: 0.9 },
    { d: 'recife/ancora', x: 199, y: 22, s: 1.3 },
    { d: 'recife/alga-alta', x: 205, y: 22 },
    { d: 'recife/coqueiro', x: 214, y: 5 },
    { d: 'recife/guarda-sol', x: 222, y: 5 },
    { d: 'recife/coqueiro', x: 227, y: 5, flip: true },
  ],
};
export default nivel;
