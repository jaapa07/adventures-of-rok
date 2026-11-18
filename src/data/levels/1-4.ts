/**
 * 1-4 RIO DAS TORAS — o rio por onde o Barão escoa a madeira roubada; a tarde cai durante a fase.
 * Ideia própria: TORAS QUE AFUNDAM. Os troncos boiando aguentam a dupla só um instante (afunda: true) e o rio
 * tem correnteza (a favor em S2/S6, contra em S4): parar em cima de um tronco é afundar junto. Nadar é
 * possível, mas lento — o caminho rápido é saltar de tronco em tronco sem frear.
 * Gag: gag_canoa — corrida de canoa contra dois Javalins remando; um golpe rouba o remo deles.
 * Interação 17.3: Remo + correnteza = surfe (o Remo está na margem antes do primeiro trecho de correnteza).
 * Rotas: alta (Lili, copa da ilha: letra C e sala bônus 2) e baixa (Tamá, troncos e a lagoa com a Moeda-Folha
 * escondida numa toca submersa).
 * Fim de tarde: região porDoSol a partir da coluna 158 (último terço).
 * Segmentos (coluna inicial): S1 0 · S2 22 · S3 48 · S4 72 · S5 98 · S6 120 · S7 164 · S8 188 · S9 214
 */
import type { LevelDef } from '../../game/types';
import { stitch, vazio, cheio } from './util';

const V = (w: number, n: number) => Array.from({ length: n }, () => vazio(w));
const C = (w: number, n: number) => Array.from({ length: n }, () => cheio(w));
const R = (n: number, linha: string) => Array.from({ length: n }, () => linha);

// S1 — a margem: trapiche de tábuas, Remo e a caixa da Ema
const S1 = [...V(22, 9), '..............=====...', ...V(22, 2), ...C(22, 6)];
// S2 — o primeiro trecho: troncos que boiam (não afundam), correnteza a favor
const S2 = [
  ...V(26, 12),
  '####......................',
  ...R(4, '####~~~~~~~~~~~~~~~~~~~~~~'),
  cheio(26),
];
// S3 — a ilha da castanheira: Javalins na ilha; nos galhos, a rota alta da Lili (letra C, sala bônus 2)
const S3 = [
  ...V(24, 3),
  '.....=====..............',
  ...V(24, 3),
  '.........======.........',
  ...V(24, 3),
  ...R(2, '..############..........'),
  ...R(4, '~~############~~~~~~~~~~'),
  cheio(24),
];
// S4 — troncos que AFUNDAM com correnteza contra; a pedra do meio é o único descanso (letra I no alto)
const S4 = [
  ...V(26, 10),
  ...R(3, '............##............'),
  ...R(4, '~~~~~~~~~~~~##~~~~~~~~~~~~'),
  cheio(26),
];
// S5 — a margem do Totem de Cipó (o barranco rachado da sala bônus 1 fica atrás do ponto de partida, em S1)
const S5 = [...V(22, 12), ...C(22, 6)];
// S6 — gag_canoa: a reta da corrida de canoa; galhos baixos sobre o rio (castanhas e letra P)
const S6 = [
  ...V(44, 9),
  '..............................====..........',
  '..............=====.........................',
  ...V(44, 1),
  '##........................................##',
  ...R(4, '##~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~##'),
  cheio(44),
];
// S7 — a lagoa do pôr do sol: troncos que afundam; a toca submersa na margem direita guarda a Moeda-Folha
const S7 = [
  ...V(24, 11),
  '..................######',
  ...R(3, '####~~~~~~~~~~~~~~######'),
  ...R(2, '####~~~~~~~~~~~~~~~~~###'),
  cheio(24),
];
// S8 — clímax: a balsa de toras atravessa o rio sob ataque dos Serrotes; depois, sprint nos troncos que afundam
const S8 = [
  ...V(26, 11),
  '####......................',
  '####......................',
  ...R(4, '####~~~~~~~~~~~~~~~~~~~~~~'),
  cheio(26),
];
// S9 — a margem final, ao pôr do sol, com o Totem de Saída
const S9 = [...V(24, 12), ...C(24, 6)];

const nivel: LevelDef = {
  id: '1-4',
  nome: 'Rio das Toras',
  mundo: 1,
  tipo: 'normal',
  tileset: 'mata',
  parallax: 'rio',
  preset: 'selva',
  music: 'mata',
  ambience: 'amb-mata',
  tilemap: stitch(S1, S2, S3, S4, S5, S6, S7, S8, S9),
  start: [3, 12],
  checkpoint: [104, 12],
  exit: [232, 12],
  letras: [[55, 3], [84.5, 7], [151.5, 9], [199, 9.5]],
  moedaFolha: [183.5, 17],
  bonusRooms: ['1-4-b1', '1-4-b2'],
  targetTime: 175,
  gags: ['gag_canoa', 'gag_tedio', 'gag_parceiro_preso', 'gag_morte_comica'],
  totemPrizes: ['castanhas:10', 'castanhas:20', 'parafusos:10', 'vida:1', 'ficha'],
  regions: [
    { x0: 26, x1: 48, y0: 12.5, correnteza: 80 },
    { x0: 62, x1: 98, y0: 12.5, correnteza: -100 },
    { x0: 122, x1: 162, y0: 12.5, correnteza: 140 },
    { x0: 158, x1: 238, porDoSol: true },
  ],
  entities: [
    { t: 'npc', id: 'tucano', x: 6, y: 12, falas: ['O Rio das Toras! O Barão manda a madeira roubada rio abaixo.', 'Tronco que afunda não espera ninguém. Pulou, pulou de novo!', 'Com o Remo na mão dá até pra surfar na correnteza. Eu já tentei. Molhei o bico.'] },
    // atrás do ponto de partida: barranco rachado (Batida no chão) → sala bônus 1
    { t: 'parede-rachada', x: 0.5, y: 12, variante: 'mata' },
    { t: 'porta-bonus', x: 0.5, y: 12, room: '1-4-b1', oculta: true },
    { t: 'arma', id: 'remo', x: 10, y: 12 },
    { t: 'caixa-montaria', x: 15, y: 12, m: 'ema' },
    { t: 'javalim', x: 19, y: 12, patrulha: [12, 21] },
    // S2: troncos que boiam
    { t: 'tronco', x: 28.5, y: 13 },
    { t: 'tronco', x: 33, y: 13 },
    { t: 'tronco', x: 37.5, y: 13 },
    { t: 'tronco', x: 42, y: 13 },
    { t: 'tronco', x: 46.5, y: 13 },
    { t: 'marimbondo', x: 37.5, y: 9.5, rota: 'vaivem', raio: 3 },
    // S3: a ilha
    { t: 'javalim', x: 53, y: 11, patrulha: [51, 56] },
    { t: 'javalim-escudo', x: 59, y: 11, patrulha: [56.5, 61], dir: -1 },
    { t: 'arma', id: 'coco', x: 51, y: 11 },
    { t: 'porta-bonus', x: 53.5, y: 3, room: '1-4-b2' },
    { t: 'cascavel', x: 60.5, y: 7 },
    // S4: troncos que afundam e a pedra do meio
    { t: 'tronco', x: 64.5, y: 13, afunda: true },
    { t: 'tronco', x: 69, y: 13, afunda: true },
    { t: 'tronco', x: 73.5, y: 13, afunda: true },
    { t: 'tronco', x: 78, y: 13, afunda: true },
    { t: 'tronco', x: 82, y: 13, afunda: true },
    { t: 'tronco', x: 88, y: 13, afunda: true },
    { t: 'tronco', x: 92.5, y: 13, afunda: true },
    { t: 'tronco', x: 96.5, y: 13, afunda: true },
    { t: 'marimbondo', x: 71, y: 9, rota: 'circulo', raio: 1.6 },
    { t: 'serrote', x: 80, y: 8.5, amp: 1.4, freq: 0.7 },
    { t: 'marimbondo', x: 91, y: 9, rota: 'oito', raio: 1.6 },
    // S5: margem do Totem
    { t: 'npc', id: 'quati', x: 101, y: 12, falas: ['Vendo boia de cabaça! Só uma castanha! ...Tá furada, mas é bonita.', 'Ouvi dizer que tem um tesouro numa toca debaixo d\'água, lá na lagoa. E que atrás do começo do rio tem um barranco oco.', 'Os Javalins apostam corrida de canoa toda tarde. Eles roubam. No remo.'] },
    { t: 'arma', id: 'panela', x: 107, y: 12 },
    { t: 'javalim', x: 110, y: 12, patrulha: [106, 112] },
    { t: 'javalim-escudo', x: 118, y: 12, patrulha: [116, 121], dir: -1 },
    // S6: gag_canoa — a corrida
    { t: 'canoa', x: 123.5, y: 13 },
    { t: 'gag', id: 'gag_canoa', x: 128, y: 13, ate: 160, vel: 210, largada: 5 },
    { t: 'marimbondo', x: 136, y: 7.5, rota: 'vaivem', raio: 2.5 },
    { t: 'serrote', x: 146, y: 10, amp: 1.2, freq: 0.8 },
    { t: 'marimbondo', x: 156, y: 9, rota: 'circulo', raio: 1.5 },
    // S7: a lagoa
    { t: 'tronco', x: 169.5, y: 12, afunda: true },
    { t: 'tronco', x: 174, y: 12, afunda: true },
    { t: 'tronco', x: 178.5, y: 12, afunda: true },
    { t: 'ninho', x: 185.5, y: 11 },
    { t: 'cascavel', x: 187, y: 11 },
    // S8: clímax — a balsa
    { t: 'arma', id: 'estilingue', x: 189.5, y: 11 },
    { t: 'plataforma', x: 193, y: 13, path: [[193, 13], [205, 13]], vel: 130 },
    { t: 'serrote', x: 197, y: 8.5, amp: 1.5, freq: 0.9 },
    { t: 'serrote', x: 203, y: 9.5, amp: 1.2, freq: 1.1 },
    { t: 'tronco', x: 208, y: 13, afunda: true },
    { t: 'tronco', x: 212, y: 13, afunda: true },
    // S9: chegada
    { t: 'javalim', x: 221, y: 12, patrulha: [216, 225] },
    { t: 'javalim', x: 228, y: 12, patrulha: [225, 230], dir: -1 },
    { t: 'balao', x: 57, y: 1.5, n: 1 },
  ],
  coins: [
    { path: [[14.5, 8.4], [18.5, 8.4]] },
    { path: [[24, 11], [26.5, 10.5], [28.5, 12.2]] },
    { path: [[30.5, 11], [33, 12.2], [35, 11], [37.5, 12.2], [40, 11], [42, 12.2], [44.5, 11], [46.5, 12.2]], step: 0.85 },
    { path: [[58, 6.4], [61, 6.4]] },
    { path: [[53.5, 2.4], [57, 2.4]], cacho: true },
    { path: [[66.5, 11], [69, 12.2], [71, 11], [73.5, 12.2], [76, 11], [78, 12.2]], step: 0.85 },
    { path: [[84.5, 9.4], [84.5, 8]] },
    { path: [[86, 11], [88, 12.2], [90, 11], [92.5, 12.2], [94.5, 11], [96.5, 12.2]], step: 0.85 },
    { path: [[99, 11], [102, 11]] },
    { path: [[127, 12], [133, 12], [140, 12]], step: 1 },
    { path: [[134, 9.4], [138, 9.4]] },
    { path: [[149.5, 8.4], [153.5, 8.4]] },
    { path: [[143, 12], [160, 12]], step: 1.2 },
    { path: [[166, 11], [169.5, 11.2], [172, 10.5], [174, 11.2], [176.5, 10.5], [178.5, 11.2]], step: 0.85 },
    { path: [[176, 15], [181, 16.5]], step: 1 },
    { path: [[191, 10], [194, 11.6]] },
    { path: [[196, 11.5], [204, 11.5]], step: 1 },
    { path: [[208, 12.2], [210, 11], [212, 12.2], [214.5, 11]], step: 0.85 },
    { path: [[223, 11], [227, 11]] },
  ],
  cameraZones: [
    { x0: 122, x1: 162, zoom: 0.86, lockY: 12 },
    { x0: 190, x1: 214, zoom: 0.9, tiltY: -2 },
  ],
  decor: [
    { d: 'mata/palmeira-jovem', x: 1.5, y: 12 },
    { d: 'mata/samambaia', x: 4, y: 12, front: true },
    { d: 'mata/pilha-toras', x: 12.5, y: 12 },
    { d: 'mata/heliconia', x: 21, y: 12 },
    { d: 'mata/raiz', x: 24.5, y: 12 },
    { d: 'mata/cipo-pendente', x: 35, y: 0 },
    { d: 'mata/arbusto', x: 50.5, y: 11, front: true },
    { d: 'mata/bromelia-deco', x: 57, y: 11 },
    { d: 'mata/cipo-pendente', x: 62, y: 0, flip: true },
    { d: 'mata/pedra-musgo', x: 84.5, y: 10 },
    { d: 'mata/tronco-caido', x: 75, y: 13, s: 0.7 },
    { d: 'mata/toco', x: 99.5, y: 12 },
    { d: 'mata/pilha-toras', x: 108.5, y: 12, flip: true },
    { d: 'mata/pedra-musgo', x: 115.5, y: 12, s: 1.3 },
    { d: 'mata/placa-javali', x: 121, y: 12 },
    { d: 'mata/cipo-pendente', x: 131, y: 0 },
    { d: 'mata/tronco-caido', x: 141, y: 13, s: 0.8, flip: true },
    { d: 'mata/cipo-pendente', x: 152, y: 0, flip: true },
    { d: 'mata/palmeira-jovem', x: 163, y: 12 },
    { d: 'mata/pedra-musgo', x: 183, y: 17, front: true, s: 1.2 },
    { d: 'mata/samambaia', x: 184, y: 11, front: true },
    { d: 'mata/heliconia', x: 186.5, y: 11 },
    { d: 'mata/raiz', x: 190, y: 11 },
    { d: 'mata/pilha-toras', x: 216, y: 12 },
    { d: 'mata/arbusto', x: 225, y: 12, front: true },
    { d: 'mata/palmeira-jovem', x: 235, y: 12 },
    { d: 'mata/heliconia', x: 230, y: 12 },
    { d: 'mata/samambaia', x: 237, y: 12, front: true },
  ],
};
export default nivel;
