/**
 * 3-2 RECIFE DAS BROMÉLIAS — fase SUBAQUÁTICA. Ideia própria: A RODOVIA DA CORRENTEZA.
 * O recife tem duas pistas separadas por uma laje de pedra: a PISTA DE CIMA, logo abaixo da superfície,
 * é uma correnteza rápida a favor cheia de Águas-Vivas-Néon (rota alta, veloz e arriscada); a PISTA DE BAIXO
 * é o jardim de corais, lenta e cheia de segredos (rota baixa). O PIRARUCU da caixa entalhada arromba a
 * muralha de coral rachado; o Peixe Seco faz da Piranha-Boia uma aliada; no túnel da correnteza CONTRÁRIA
 * o Remo vira prancha (17.3). Clímax: o canal do Redemoinho, uma correnteza fortíssima a favor onde
 * é preciso desviar de piranhas e águas-vivas subindo e descendo, até emergir na ilha do Totem de Saída.
 * Segmentos (coluna inicial): S1 0 · S2 24 · S3 48 · S4 72 · S5 96 · S6 120 · S7 144 · S8 168 · S9 192 · S10 216
 * Altura 26: linhas 0–3 ar, superfície na linha 4, fundo de areia nas linhas 24–25.
 */
import type { LevelDef } from '../../game/types';
import { stitch, vazio, cheio } from './util';

const V = (w: number, n: number) => Array.from({ length: n }, () => vazio(w));
const C = (w: number, n: number) => Array.from({ length: n }, () => cheio(w));
const R = (row: string, n: number) => Array.from({ length: n }, () => row);
const AGUA = '~~~~~~~~~~~~~~~~~~~~~~~~';

// S1 — o mergulho: rocha da largada (Vô Bugio), caixa do Pirarucu no fundo, Peixe Seco na pedra da direita
const S1 = [
  ...V(24, 4),
  '#####~~~~~~~~~~~~~~~~~~~',
  '#####~~~~~~~~~~~~~~~~~~~',
  '####~~~~~~~~~~~~~~~~~~~~',
  '####~~~~~~~~~~~~~~~~~~~~',
  '###~~~~~~~~~~~~~~~~~~~~~',
  '###~~~~~~~~~~~~~~~~~~~~~',
  ...R('##~~~~~~~~~~~~~~~~~~~~~~', 9),
  '###~~~~~~~~~~~~~~~~~~##~',
  '###~~~~~~~~~~~~~~~~~~##~',
  '####~~~~~~~~~~~~~~~~###~',
  '#####~~~~~~~~~~~~~~####~',
  '#######~~~~~~~~~~~#####~',
  ...C(24, 2),
];
// S2 — a bifurcação: a laje divide o recife em pista de cima (correnteza) e pista de baixo (corais)
const S2 = [
  ...V(24, 4),
  ...R(AGUA, 7),
  ...R('~~~~~~##################', 2),
  ...R(AGUA, 8),
  '~~~~~~~~~~~~~~~~~~~~##~~',
  '~~~~~~~~~#~~~~~~~~~####~',
  '~~~~~~~~###~~~~~~~######',
  ...C(24, 2),
];
// S3 — bromélias gigantes de coral com algas escaláveis (letra C embaixo; águas-vivas em cima)
const S3 = [
  ...V(24, 4),
  ...R(AGUA, 7),
  ...C(24, 2),
  ...R(AGUA, 3),
  ...R('~~~~~!~~~~~~~~~~~!~~~~~~', 2),
  '~~~~##~~~~~~~~~~##~~~~~~',
  '~~~~##~~~~~#~~~~##~~~~~~',
  '~~~~##~~~~###~~~##~~~~~~',
  '~~~###~~~~###~~###~~~~~~',
  '~~####~~~#####~###~~~~#~',
  '~#####~~######~####~~###',
  ...C(24, 2),
];
// S4 — a muralha de coral: o túnel de baixo é fechado por coral rachado (só o Pirarucu arromba);
// quem nada sem montaria sobe pelo poço da esquerda para a pista de cima (letra I entre águas-vivas)
const S4 = [
  ...V(24, 4),
  ...R(AGUA, 7),
  ...R('~~~~####################', 2),
  ...R('~~~~~~##############~~~~', 6),
  ...R(AGUA, 3),
  ...R('~~~~~~##############~~~~', 2),
  ...C(24, 2),
];
// S5 — a ilha do Totem de Cipó (acima da superfície); uma batida no chão da ilha revela a porta da sala bônus 1
const S5 = [
  ...V(24, 3),
  '........########........',
  ...R('~~~~~~~~########~~~~~~~~', 7),
  ...R('####################~~~~', 2),
  ...R(AGUA, 9),
  '~~~#~~~~~~~~~~~~~~~#~~~~',
  '~~###~~~~~~~~~~~~~###~~~',
  ...C(24, 2),
];
// S6 — floresta de algas; no teto, a câmara secreta da Moeda-Folha (entrada por baixo, entre as pedras)
const S6 = [
  ...V(24, 4),
  '~~~~~~~~~~~~~~########~~',
  ...R('~~~~~~~~~~~~~~##~~~~##~~', 3),
  ...R('~~~~~~~~~~~~~~###~~###~~', 2),
  ...R(AGUA, 6),
  ...R('~~!~~~~!~~~~!~~~~~~~!~~~', 7),
  '~~#~~~~#~~~~#~~~~~~~#~~~',
  ...C(24, 2),
];
// S7 — o túnel da correnteza CONTRÁRIA (Remo = surfe); por cima, a superfície dos Baiacus-Bomba
const S7 = [
  ...V(24, 4),
  ...R(AGUA, 3),
  ...C(24, 6),
  '~~~~~##~~~~~~~##~~~~~~~~',
  ...R(AGUA, 5),
  '~~~~~~~~~~##~~~~~~~~~##~',
  ...C(24, 6),
];
// S8 — jardim de ouriços: zigue-zague entre pedras cobertas de espinhos (letra Ó); o rochedo que fura a
// superfície guarda a porta da sala bônus 2
const S8 = [
  ...V(24, 3),
  '..................####..',
  ...R('~~~~~~~~~~~~~~~~~~####~~', 3),
  ...R('~~~~~#########~~~~~~~~~~', 2),
  '~~~~~^^^^^^^^^~~~~~~~~~~',
  ...R(AGUA, 5),
  '~~~~~~~~~~~~~^^^^^^^^~~~',
  ...R('~~~~~~~~~~~~~########~~~', 2),
  ...R(AGUA, 3),
  '~~~^^^^~~~~~~~~~~~~~~~~~',
  '~~~####~~~~~~~~^^^^~~~~~',
  '~~~####~~~~~~~~####~~~~~',
  ...C(24, 2),
];
// S9 — clímax: o canal do Redemoinho (correnteza fortíssima a favor, piranhas e águas-vivas no caminho)
const S9 = [
  ...V(24, 4),
  ...R('~~~~####################', 8),
  ...R(AGUA, 10),
  ...R('~~~~####################', 2),
  ...C(24, 2),
];
// S10 — subida para a ilha do Totem de Saída
const S10 = [
  ...V(24, 3),
  '............############',
  ...R('~~~~~~~~~~~~############', 18),
  ...C(24, 4),
];

const nivel: LevelDef = {
  id: '3-2',
  nome: 'Recife das Bromélias',
  mundo: 3,
  tipo: 'agua',
  tileset: 'recife',
  parallax: 'recife',
  preset: 'recife',
  music: 'recife',
  ambience: 'amb-recife',
  tilemap: stitch(S1, S2, S3, S4, S5, S6, S7, S8, S9, S10),
  start: [3.5, 4],
  checkpoint: [107.5, 3],
  exit: [232, 3],
  letras: [[60.5, 17], [86, 6.5], [122.5, 13.5], [175.5, 12.5]],
  moedaFolha: [137.5, 7],
  bonusRooms: ['3-2-b1', '3-2-b2'],
  targetTime: 200,
  gags: ['gag_tedio', 'gag_parceiro_preso', 'gag_morte_comica'],
  totemPrizes: ['castanhas:20', 'parafusos:8', 'ficha', 'castanhas:30', 'vida:1'],
  regions: [
    { x0: 30, x1: 103, y0: 4, y1: 11, correnteza: 160 },
    { x0: 144, x1: 168, y0: 13, y1: 20, correnteza: -210 },
    { x0: 192, x1: 217, y0: 12, y1: 22, correnteza: 250 },
  ],
  entities: [
    { t: 'npc', id: 'vo-bugio', x: 1.5, y: 4, falas: ['Nessa idade eu mergulhava sem pé de pato. Nem pato.', 'Lá embaixo tem uma caixa com cara de peixe. Quebre! O Pirarucu não morde... muito.', 'Pista de cima: correnteza a favor e águas-vivas. Pista de baixo: corais e segredos. Escolham!'] },
    { t: 'caixa-montaria', x: 12, y: 24, m: 'pirarucu' },
    { t: 'arma', id: 'peixe', x: 21.5, y: 19 },
    { t: 'piranha', x: 15, y: 14, rota: [[11, 14], [19, 14]] },
    { t: 'piranha', x: 20, y: 9, rota: [[18, 9], [20, 7], [22, 9], [20, 11]] },
    { t: 'agua-viva', x: 36, y: 8, amp: 2 },
    { t: 'piranha', x: 38, y: 18, rota: [[35, 16.5], [41, 19.5], [41, 16.5], [35, 19.5]] },
    { t: 'agua-viva', x: 50, y: 7, amp: 2.5 },
    { t: 'agua-viva', x: 58, y: 9, amp: 1.5 },
    { t: 'baiacu', x: 55, y: 15 },
    { t: 'baiacu', x: 67, y: 18 },
    { t: 'piranha', x: 62, y: 20, rota: [[60.5, 18.5], [63.5, 18.5], [62, 21.5]] },
    { t: 'agua-viva', x: 80, y: 6, amp: 2 },
    { t: 'agua-viva', x: 91, y: 8, amp: 2 },
    { t: 'parede-rachada', x: 82.5, y: 22, variante: 'coral', so: 'pirarucu' },
    { t: 'cacho', x: 88, y: 21 },
    { t: 'arma', id: 'panela', x: 110, y: 3 },
    { t: 'porta-bonus', x: 105, y: 3, room: '3-2-b1', oculta: true },
    { t: 'piranha', x: 101, y: 16, rota: [[98.5, 15], [103.5, 17], [103.5, 15], [98.5, 17]] },
    { t: 'piranha', x: 126, y: 15, rota: [[121, 15], [131, 15]] },
    { t: 'piranha', x: 133, y: 20, rota: [[131, 20], [133, 18], [135, 20], [133, 22]] },
    { t: 'arma', id: 'remo', x: 142.5, y: 24 },
    { t: 'baiacu', x: 150, y: 5.5 },
    { t: 'baiacu', x: 160, y: 5.5 },
    { t: 'piranha', x: 156, y: 16, rota: [[153, 16], [159, 16]] },
    { t: 'baiacu', x: 181, y: 12 },
    { t: 'piranha', x: 185, y: 19, rota: [[182, 19], [188, 19]] },
    { t: 'arma', id: 'capacete', x: 171, y: 4.5 },
    { t: 'porta-bonus', x: 187.5, y: 3, room: '3-2-b2' },
    { t: 'agua-viva', x: 199, y: 15, amp: 3 },
    { t: 'piranha', x: 204, y: 19, rota: [[202, 19], [206, 19]] },
    { t: 'agua-viva', x: 208, y: 17, amp: 3 },
    { t: 'piranha', x: 212, y: 14, rota: [[210.5, 14], [212, 12.5], [213.5, 14], [212, 15.5]] },
    { t: 'baiacu', x: 222, y: 12 },
    { t: 'npc', id: 'tucano', x: 236.5, y: 3, falas: ['Vocês estão pingando no meu totem.', 'Próxima parada: um navio afundado. Escuro, molhado e com um baú mal-humorado.'] },
  ],
  coins: [
    { path: [[6, 5.5], [9, 8], [12, 12], [12, 20]], step: 1 },
    { path: [[14, 22], [18, 22]] },
    { path: [[27, 7.5], [33, 7.5]], step: 1 },
    { path: [[40, 6], [46, 6]], step: 1 },
    { path: [[28, 16], [34, 18], [42, 18]], step: 1 },
    { path: [[50, 14], [56, 14]], step: 1 },
    { path: [[58, 18], [60.5, 15.6], [63, 18]] },
    { path: [[66, 6], [70, 8], [74, 6]], step: 1 },
    { path: [[73, 14], [73, 20], [76, 21]], step: 1 },
    { path: [[78, 21], [86, 21]], step: 1 },
    { path: [[92, 6], [100, 6]], step: 1 },
    { path: [[104, 2.2], [111, 2.2]] },
    { path: [[97, 15], [110, 15]], step: 1.2 },
    { path: [[116, 8], [116, 13]], step: 1 },
    { path: [[121, 18], [121, 14]], step: 1 },
    { path: [[137.5, 12], [137.5, 9]], cacho: true },
    { path: [[146, 5.5], [166, 5.5]], step: 1.4 },
    { path: [[146, 16], [166, 16]], step: 1.2 },
    { path: [[170, 11], [174, 13], [182, 13], [187, 14]], step: 1 },
    { path: [[176, 20], [182, 20]] },
    { path: [[194, 8], [194, 13], [197, 15]], step: 1 },
    { path: [[200, 13], [204, 13], [208, 20], [214, 20]], step: 1.1 },
    { path: [[218, 15], [222, 9], [226, 5]], step: 1, cacho: true },
  ],
  cameraZones: [
    { x0: 0, x1: 22, zoom: 0.94 },
    { x0: 104, x1: 112, zoom: 0.92 },
    { x0: 192, x1: 220, zoom: 0.86, tiltY: 3 },
  ],
  decor: [
    { d: 'recife/coqueiro', x: 2.5, y: 4, s: 0.8 },
    { d: 'recife/alga-alta', x: 8, y: 24 },
    { d: 'recife/coral-leque', x: 15, y: 24 },
    { d: 'recife/anemona', x: 18, y: 24 },
    { d: 'recife/estrela-mar', x: 22, y: 19 },
    { d: 'recife/coral-cerebro', x: 28, y: 24 },
    { d: 'recife/alga-alta', x: 33.5, y: 24, front: true },
    { d: 'recife/coral-leque', x: 40, y: 24 },
    { d: 'recife/concha', x: 45, y: 24 },
    { d: 'recife/coral-leque', x: 53, y: 18, s: 1.2 },
    { d: 'recife/anemona', x: 60.5, y: 19 },
    { d: 'recife/coral-cerebro', x: 65, y: 18 },
    { d: 'recife/alga-alta', x: 69, y: 24 },
    { d: 'recife/coral-leque', x: 74, y: 24, s: 1.3 },
    { d: 'recife/coral-cerebro', x: 82, y: 13, s: 0.9 },
    { d: 'recife/anemona', x: 94, y: 24 },
    { d: 'recife/coqueiro', x: 105, y: 3, s: 0.9 },
    { d: 'recife/guarda-sol', x: 109, y: 3 },
    { d: 'recife/alga-alta', x: 102.5, y: 24, s: 1.2 },
    { d: 'recife/coral-leque', x: 113, y: 23 },
    { d: 'recife/alga-alta', x: 124, y: 24 },
    { d: 'recife/alga-alta', x: 130, y: 24, flip: true },
    { d: 'recife/alga-alta', x: 137.5, y: 10, front: true, s: 1.1 },
    { d: 'recife/estrela-mar', x: 137.5, y: 8 },
    { d: 'recife/coral-cerebro', x: 142, y: 24 },
    { d: 'recife/concha', x: 150, y: 20 },
    { d: 'recife/anemona', x: 158, y: 20 },
    { d: 'recife/coral-leque', x: 165, y: 20 },
    { d: 'recife/anemona', x: 172, y: 24 },
    { d: 'recife/bau-velho', x: 178.5, y: 24, s: 0.8 },
    { d: 'recife/coqueiro', x: 189.5, y: 3, s: 0.7 },
    { d: 'recife/coral-leque', x: 188, y: 24 },
    { d: 'recife/ancora', x: 194, y: 24 },
    { d: 'recife/coral-cerebro', x: 202, y: 22 },
    { d: 'recife/alga-alta', x: 210, y: 22 },
    { d: 'recife/coral-leque', x: 219, y: 24 },
    { d: 'recife/coqueiro', x: 230, y: 3 },
    { d: 'recife/castelo-areia', x: 234, y: 3 },
    { d: 'recife/coqueiro', x: 238.5, y: 3, flip: true, s: 1.1 },
  ],
};
export default nivel;
