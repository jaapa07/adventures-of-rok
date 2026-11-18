/**
 * 2-2 TRILHOS DA MINA — fase de carrinho de mina.
 * Ideia própria: O CARRINHO. Embarca-se na Estação A (S1); o carrinho anda sozinho para a direita
 * (→ acelera, ← freia) e pula entre trilhos suspensos sobre o abismo. Atropela Javalins e Teiús nos trilhos;
 * os Morcegos mergulham do teto. Há trilhos altos (rota alta: letras C e P) e baixos que se reencontram.
 * Três estações a pé: A (largada), B (Totem de Cipó, caixa do Tatu, carrinho reserva) e C (Totem de Saída,
 * com 25 colunas de trilho depois do totem para o carrinho parar sem bater).
 * Gag: gag_trilho_errado — em S4 a placa vira sozinha e abre o trilho de cima; o carrinho cai na sala dos
 * Javalins jogando dominó, que viram a mesa e perseguem o carrinho. Quem pular no tempo certo escapa.
 * Segmentos (coluna inicial): S1 0 · S2 28 · S3 60 · S4 96 · S5 136 · S6 164 · S7 208 · S8 252
 */
import type { LevelDef } from '../../game/types';
import { stitch, vazio, cheio } from './util';

const V = (w: number, n: number) => Array.from({ length: n }, () => vazio(w));
const C = (w: number, n: number) => Array.from({ length: n }, () => cheio(w));
const R = (n: number, linha: string) => Array.from({ length: n }, () => linha);

// S1 — Estação A: plataforma de embarque e o carrinho parado nos trilhos
const S1 = [
  ...C(28, 3),
  '######....######....########',
  ...V(28, 8),
  '##############TTTTTTTTTTTTTT',
  ...C(28, 5),
];
// S2 — o primeiro cavalete: dois vãos sobre o abismo (4 e 5 colunas)
const S2 = [
  ...C(32, 3),
  '######....######....############',
  ...V(32, 8),
  'TTTTTTTTTTTT....TTTTTTTTTT.....T',
  ...V(32, 5),
];
// S3 — sobe e desce (teto alto, sem estalactites, para os pulos do trilho de cima): trilho do meio e o trilho alto (rota alta, letra C)
const S3 = [
  ...C(36, 3),
  vazio(36),
  ...V(36, 4),
  '............TTTTTTTTTTTTTTTT........',
  vazio(36),
  '.......TTTTTTTTTTTTTT...............',
  vazio(36),
  'TTTT.....................TTTTTTTTTTT',
  ...V(36, 5),
];
// S4 — gag_trilho_errado: a placa abre o trilho de cima (colunas 109–112) e o carrinho cai na sala do dominó
const S4 = [
  ...C(40, 3),
  '...............#########......##########',
  ...V(40, 6),
  '........TTTTTTTTTTTTTTTTTTTTTTTTTTTT....',
  vazio(40),
  'TTTTTT..................................',
  vazio(40),
  '......TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
  ...R(3, '......##################################'),
];
// S5 — Estação B: Totem de Cipó, caixa do Tatu, terra mole (Moeda-Folha), carrinho reserva e a sala bônus 1 no alto
const S5 = [
  ...C(28, 3),
  '######....######....########',
  ...V(28, 6),
  '....................======..',
  ...V(28, 3),
  '########..##########TTTTTTTT',
  ...R(2, '########..##################'),
  cheio(28),
];
// S6 — os saltos grandes: trilho do meio e o trilho alto (letra P); a letra I flutua sobre o primeiro vão
const S6 = [
  ...C(44, 3),
  '########......########......########......##',
  ...V(44, 5),
  '.............................TTTTTTTTTTT....',
  ...V(44, 2),
  '.............TTTTTTTT.....TTTTTT............',
  vazio(44),
  'TTTTTTTT............................TTTTTTTT',
  ...V(44, 3),
];
// S7 — clímax: o desfiladeiro, vãos cada vez maiores, trilhos em alturas diferentes, Javalão na ponte
const S7 = [
  ...C(44, 3),
  '##########......##########......##########..',
  ...V(44, 8),
  '............................TTTTTTT.........',
  '..........TTTTT.............................',
  'TTTTTT..............TTTT...............TTTTT',
  ...V(44, 3),
];
// S8 — Estação C: Totem de Saída e 25 colunas de trilho para frear; saliência alta com a sala bônus 2
const S8 = [
  ...C(40, 3),
  '######....######....######....##########',
  ...V(40, 6),
  '....=====...............................',
  ...V(40, 3),
  'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
  ...C(40, 3),
];

const nivel: LevelDef = {
  id: '2-2',
  nome: 'Trilhos da Mina',
  mundo: 2,
  tipo: 'carrinho',
  tileset: 'gruta',
  parallax: 'mina',
  preset: 'caverna',
  music: 'gruta',
  ambience: 'amb-gruta',
  tilemap: stitch(S1, S2, S3, S4, S5, S6, S7, S8),
  start: [5, 12],
  checkpoint: [149, 14],
  exit: [266, 14],
  letras: [[80, 8], [174.5, 10.5], [198, 9], [234, 10.5]],
  moedaFolha: [144.5, 17],
  bonusRooms: ['2-2-b1', '2-2-b2'],
  targetTime: 110,
  gags: ['gag_trilho_errado', 'gag_tedio', 'gag_parceiro_preso', 'gag_morte_comica'],
  totemPrizes: ['castanhas:20', 'parafusos:10', 'castanhas:10', 'vida:1', 'ficha'],
  entities: [
    // S1: Estação A
    { t: 'npc', id: 'tucano', x: 8, y: 12, falas: ['Todos a bordo! Encoste no carrinho e aperte ação.', 'Pulo pula o carrinho inteiro. Para a direita acelera, para a esquerda freia.', 'Se uma placa mudar o trilho sozinha... não fui eu.'] },
    { t: 'arma', id: 'capacete', x: 11, y: 12 },
    { t: 'arma', id: 'panela', x: 2.5, y: 12 },
    { t: 'carrinho', x: 17, y: 12, dir: 1 },
    // S2
    { t: 'morcego', x: 36, y: 6 },
    { t: 'javalim', x: 48, y: 12, patrulha: [45, 53] },
    { t: 'morcego', x: 56, y: 6 },
    // S3
    { t: 'lagarto', x: 72, y: 10, patrulha: [68, 79] },
    { t: 'morcego', x: 77, y: 6 },
    { t: 'marimbondo', x: 84, y: 5.5, rota: 'vaivem', raio: 2.5 },
    { t: 'javalim-escudo', x: 91, y: 12, patrulha: [87, 95] },
    // S4: gag_trilho_errado
    { t: 'javalim', x: 99, y: 12, patrulha: [96.5, 101] },
    { t: 'gag', id: 'gag_trilho_errado', x: 107, y: 10, sala: [106, 131], mesa: [118, 14], javalins: [[115, 14], [117, 14], [119.5, 14], [121.5, 14]], abre: [[109, 10], [110, 10], [111, 10], [112, 10]], aviso: 5, perseguir: 30 },
    { t: 'morcego', x: 125, y: 6 },
    // S5: Estação B
    { t: 'caixa-montaria', x: 139, y: 14, m: 'tatu' },
    { t: 'terra-mole', x: 145, y: 15, w: 2 },
    { t: 'npc', id: 'quati', x: 152, y: 14, falas: ['Carrinho reserva! Seminovo! Só bateu três vezes. Hoje.', 'Os Javalins jogam dominó no túnel de baixo. Roubam no jogo, sempre.', 'Tem um buraco tampado de terra mole aqui atrás. Tatu resolve.'] },
    { t: 'arma', id: 'buzina', x: 147, y: 14 },
    { t: 'carrinho', x: 156, y: 14, dir: 1 },
    { t: 'porta-bonus', x: 158.5, y: 10, room: '2-2-b1' },
    // S6
    { t: 'marimbondo', x: 170, y: 9, rota: 'circulo', raio: 1.5 },
    { t: 'javalim', x: 181, y: 12, patrulha: [178, 184] },
    { t: 'morcego', x: 187.5, y: 6 },
    { t: 'morcego', x: 197, y: 6 },
    { t: 'lagarto', x: 203, y: 14, patrulha: [200, 207] },
    // S7: clímax
    { t: 'javalao', x: 221, y: 13, patrulha: [218.5, 222] },
    { t: 'javalim', x: 230, y: 14, patrulha: [228.5, 231] },
    { t: 'morcego', x: 234.5, y: 6 },
    { t: 'lagarto', x: 241, y: 12, patrulha: [238.5, 242] },
    { t: 'morcego', x: 245, y: 6 },
    // S8: Estação C
    { t: 'arma', id: 'estilingue', x: 254, y: 14 },
    { t: 'porta-bonus', x: 257, y: 10, room: '2-2-b2' },
    { t: 'javalim', x: 274, y: 14, patrulha: [270, 280] },
    { t: 'balao', x: 199, y: 6, n: 1 },
  ],
  coins: [
    { path: [[3, 11], [6, 11]] },
    { path: [[20, 11.2], [27, 11.2]], step: 1 },
    { path: [[38, 11.2], [40, 9.5], [42, 9], [44, 9.5], [45.5, 11.2]], step: 0.9 },
    { path: [[52, 11.2], [54, 9.5], [56, 9], [58, 9.5], [59.5, 11.2]], step: 0.9 },
    { path: [[63.5, 11], [65.5, 8.8], [67.5, 9.2]] },
    { path: [[73, 7.2], [86, 7.2]], step: 1 },
    { path: [[81.5, 9.5], [84, 10.5], [86, 11.2]] },
    { path: [[101.5, 11], [103, 8.8], [104.5, 9.2]] },
    { path: [[108.5, 8.5], [111, 8], [113.5, 8.5]], cacho: true },
    { path: [[114, 13.2], [130, 13.2]], step: 1.2 },
    { path: [[137, 13], [143, 13]] },
    { path: [[156.5, 9.2], [160.5, 9.2]] },
    { path: [[172, 13], [174.5, 10.5], [177, 11.2]] },
    { path: [[185, 11.2], [187.5, 9.5], [190, 11.2]] },
    { path: [[194, 8.2], [203, 8.2]], step: 1 },
    { path: [[214, 13], [216, 11], [218, 12.2]] },
    { path: [[223.5, 12.2], [226, 11], [228, 13.2]] },
    { path: [[232, 13], [234, 10.5], [236.5, 11], [238.5, 11.2]], step: 0.9 },
    { path: [[243.5, 11.2], [245.5, 11], [247, 13.2]] },
    { path: [[268, 13], [278, 13]], step: 1.25 },
  ],
  cameraZones: [
    { x0: 104, x1: 132, zoom: 0.9 },
    { x0: 209, x1: 251, zoom: 0.86, tiltY: -3 },
  ],
  decor: [
    { d: 'gruta/lamparina-parede', x: 4, y: 7 },
    { d: 'gruta/carrinho-velho', x: 9.5, y: 12 },
    { d: 'gruta/viga-mina', x: 13, y: 12 },
    { d: 'gruta/viga-mina', x: 26, y: 12 },
    { d: 'gruta/estalagmite-p', x: 1.5, y: 12, front: true },
    { d: 'gruta/viga-mina', x: 32, y: 17 },
    { d: 'gruta/viga-mina', x: 48, y: 17 },
    { d: 'gruta/estalactite', x: 40, y: 3 },
    { d: 'gruta/lamparina-parede', x: 46, y: 6 },
    { d: 'gruta/viga-mina', x: 61, y: 17 },
    { d: 'gruta/viga-mina', x: 74, y: 15 },
    { d: 'gruta/estalactite', x: 68, y: 4 },
    { d: 'gruta/cristal-ambar', x: 79, y: 8 },
    { d: 'gruta/viga-mina', x: 92, y: 17 },
    { d: 'gruta/trilho-quebrado', x: 102.5, y: 12 },
    { d: 'gruta/lamparina-parede', x: 113, y: 12.5 },
    { d: 'gruta/lamparina-parede', x: 125, y: 12.5 },
    { d: 'gruta/carrinho-velho', x: 128, y: 14, flip: true },
    { d: 'gruta/coluna', x: 134, y: 14 },
    { d: 'gruta/lamparina-parede', x: 141, y: 8 },
    { d: 'gruta/cogumelo-brilho', x: 143, y: 14, front: true },
    { d: 'gruta/viga-mina', x: 150.5, y: 14 },
    { d: 'gruta/cristal-ambar', x: 160, y: 10 },
    { d: 'gruta/viga-mina', x: 168, y: 17 },
    { d: 'gruta/viga-mina', x: 181, y: 17 },
    { d: 'gruta/estalactite', x: 176, y: 4 },
    { d: 'gruta/viga-mina', x: 195, y: 17 },
    { d: 'gruta/viga-mina', x: 203, y: 17 },
    { d: 'gruta/estalactite', x: 214, y: 4, flip: true },
    { d: 'gruta/viga-mina', x: 211, y: 17 },
    { d: 'gruta/viga-mina', x: 221, y: 17 },
    { d: 'gruta/trilho-quebrado', x: 226, y: 17 },
    { d: 'gruta/viga-mina', x: 240, y: 17 },
    { d: 'gruta/estalactite', x: 236, y: 4 },
    { d: 'gruta/lamparina-parede', x: 255, y: 7 },
    { d: 'gruta/carrinho-velho', x: 262, y: 14 },
    { d: 'gruta/coluna', x: 284, y: 14 },
    { d: 'gruta/cogumelo-brilho', x: 288, y: 14, front: true },
    { d: 'gruta/viga-mina', x: 279, y: 14 },
  ],
};
export default nivel;
