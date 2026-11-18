/**
 * 2-3 NINHO DOS MORCEGOS — fase horizontal com muita verticalidade (34 linhas de altura).
 * Ideia própria: OS POÇOS DO NINHO. A dupla sobe um poço de tábuas (A2), atravessa a galeria do teto onde os
 * morcegos dormem (B), despenca pelo Poço Grande (C) desviando dos mergulhos, cruza o salão da festa (D) e
 * sobe o último poço em dois elevadores de caçamba (E, clímax) com morcegos mergulhando sobre os elevadores.
 * Gag: gag_morcego_dj — no Salão da Festa um morcego DJ toca e os Javalins dançam; atacar NO COMPASSO derruba
 * cada dançarino, fora do ritmo todos acordam bravos.
 * Interação 17.3: Lamparina + teia (a teia que tampa o alçapão da galeria esconde a sala bônus 1).
 * Montaria: Tatu (caixa no fundo do Poço Grande) cava a terra mole do fundo do último poço (Moeda-Folha).
 * Rotas: alta (Lili: saliências do teto da galeria com a letra C; sacadas do salão com a letra P e a sala bônus 2)
 * e baixa (Tamá: chão da galeria, palco do DJ) que se reencontram no último poço.
 * Segmentos (coluna inicial): A1 0 · A2 20 · B1 40 · B2 70 · C 90 · D 126 · E 170
 */
import type { LevelDef } from '../../game/types';
import { stitch, vazio, cheio } from './util';

const V = (w: number, n: number) => Array.from({ length: n }, () => vazio(w));
const C = (w: number, n: number) => Array.from({ length: n }, () => cheio(w));
const R = (n: number, linha: string) => Array.from({ length: n }, () => linha);

// A1 — a entrada lá embaixo (linha 30), sob a montanha de rocha
const A1 = [...C(20, 22), ...R(8, '#...................'), ...C(20, 4)];
// A2 — o primeiro poço: tábuas em zigue-zague até a galeria do alto (linha 8)
const A2 = [
  ...C(20, 4),
  ...R(4, '##..................'),
  '##..........########',
  '##......====....####',
  ...R(2, '##..............####'),
  '##..====........####',
  ...R(2, '##..............####'),
  '##........====..####',
  ...R(2, '##..............####'),
  '##.....====.....####',
  ...R(2, '##..............####'),
  '##..........====####',
  ...R(2, '................####'),
  '........====....####',
  ...R(2, '................####'),
  '....====........####',
  ...R(2, '................####'),
  ...C(20, 4),
];
// B1 — a galeria do teto: chão com dois poços sem fundo; saliências altas da Lili (letra C)
const B1 = [
  ...C(30, 2),
  ...V(30, 2),
  '......====..........====......',
  ...V(30, 3),
  ...R(26, '########.....######....#######'),
];
// B2 — fim da galeria: a teia tampa o alçapão que leva à câmara da sala bônus 1
const B2 = [
  ...C(20, 2),
  ...V(20, 6),
  '##############..####',
  ...R(2, '##########......####'),
  '##########....==####',
  ...R(2, '##########......####'),
  ...C(20, 20),
];
// C — o Poço Grande: tábuas atravessáveis até o fundo (Totem de Cipó, caixa do Tatu); sai pela direita embaixo
const Cp = [
  ...C(36, 2),
  ...R(6, '...................................#'),
  '######........................######',
  ...R(2, '######........................######'),
  '######..======..........======######',
  ...R(2, '######........................######'),
  '######.........======.........######',
  ...R(2, '######........................######'),
  '######====.............====...######',
  ...R(2, '######........................######'),
  '######.....======.......=====.######',
  ...R(2, '######........................######'),
  '######.................======.######',
  ...R(2, '######........................######'),
  '######..======..........=====.######',
  ...R(3, '######..............................'),
  ...C(36, 4),
];
// D — o Salão da Festa (gag_morcego_dj): pista de dança, palco do DJ à direita e sacadas da Lili (letra P, sala bônus 2)
const D = [
  ...C(44, 16),
  ...V(44, 4),
  '..====..................................====',
  ...V(44, 3),
  '.......====..........................====...',
  ...V(44, 2),
  '..====............................######....',
  ...R(2, '..................................######....'),
  ...C(44, 4),
];
// E — clímax: o último poço com dois elevadores de caçamba; a galeria de saída lá em cima (Totem de Saída)
const E = [
  ...C(54, 2),
  ...R(6, '####..................................................'),
  ...R(8, '####.......................###########################'),
  ...R(3, '...........................###########################'),
  '...........##########......###########################',
  ...R(10, '...........................###########################'),
  '##############..######################################',
  '##############..######################################',
  ...C(54, 2),
];

const nivel: LevelDef = {
  id: '2-3',
  nome: 'Ninho dos Morcegos',
  mundo: 2,
  tipo: 'normal',
  tileset: 'gruta',
  parallax: 'gruta',
  preset: 'caverna',
  music: 'gruta',
  ambience: 'amb-gruta',
  tilemap: stitch(A1, A2, B1, B2, Cp, D, E),
  start: [4, 30],
  checkpoint: [102, 30],
  exit: [218, 8],
  letras: [[47.5, 4], [107.5, 16], [167.5, 20], [186, 16.5]],
  moedaFolha: [184.5, 32],
  bonusRooms: ['2-3-b1', '2-3-b2'],
  targetTime: 200,
  gags: ['gag_morcego_dj', 'gag_tedio', 'gag_parceiro_preso', 'gag_morte_comica'],
  totemPrizes: ['castanhas:10', 'parafusos:10', 'castanhas:20', 'vida:1', 'ficha'],
  entities: [
    // A1/A2: entrada e primeiro poço
    { t: 'npc', id: 'tucano', x: 7, y: 30, falas: ['Shhh... é o Ninho dos Morcegos. Eles dormem de dia. E de noite. E na hora da festa, não.', 'Ouviu o tum-tum-tum? Tem festa lá no fundo. Ataque no compasso!', 'Morcego mergulha em quem passa por baixo. Passe rápido.'] },
    { t: 'arma', id: 'lamparina', x: 10, y: 30 },
    { t: 'javalim', x: 15, y: 30, patrulha: [11, 19] },
    { t: 'morcego', x: 29, y: 9 },
    { t: 'marimbondo', x: 27, y: 17, rota: 'vaivem', raio: 3 },
    // B1: galeria do teto
    { t: 'javalim', x: 44, y: 8, patrulha: [41, 47] },
    { t: 'morcego', x: 50.5, y: 5 },
    { t: 'morcego', x: 61, y: 5 },
    { t: 'lagarto', x: 66, y: 8, patrulha: [63.5, 69] },
    // B2: alçapão da teia
    { t: 'javalao', x: 76, y: 8, patrulha: [72, 82] },
    { t: 'teia', x: 85, y: 10, w: 2, h: 2 },
    { t: 'porta-bonus', x: 81, y: 14, room: '2-3-b1' },
    // C: Poço Grande
    { t: 'morcego', x: 100, y: 6 },
    { t: 'morcego', x: 114, y: 6 },
    { t: 'marimbondo', x: 108, y: 22, rota: 'oito', raio: 2 },
    { t: 'caixa-montaria', x: 97.5, y: 30, m: 'tatu' },
    { t: 'npc', id: 'quati', x: 106, y: 30, falas: ['Ingresso pra festa? Não vendo. Mas vendo protetor de ouvido.', 'O DJ é exigente: errou o passo, a pista inteira fica brava.', 'Lá no último poço tem um chão de terra mole. Tatu cava; eu só olho.'] },
    { t: 'arma', id: 'capacete', x: 111, y: 30 },
    { t: 'cascavel', x: 118, y: 30 },
    { t: 'ninho', x: 122, y: 30 },
    // D: Salão da Festa
    { t: 'gag', id: 'gag_morcego_dj', x: 162.5, y: 27, x0: 138, x1: 158, javalins: [[140, 30], [144, 30], [148, 30], [152, 30], [156, 30]] },
    { t: 'arma', id: 'buzina', x: 132, y: 30 },
    { t: 'morcego', x: 134, y: 18 },
    { t: 'morcego', x: 150, y: 18 },
    { t: 'porta-bonus', x: 130, y: 20, room: '2-3-b2' },
    // E: clímax — elevadores
    { t: 'arma', id: 'panela', x: 174, y: 30 },
    { t: 'plataforma', x: 178, y: 30, path: [[178, 30], [178, 19]], vel: 110, w: 3 },
    { t: 'plataforma', x: 192, y: 19, path: [[192, 19], [192, 8]], vel: 110, w: 3 },
    { t: 'terra-mole', x: 185, y: 31, w: 2 },
    { t: 'lagarto', x: 188, y: 30, patrulha: [180, 196] },
    { t: 'morcego', x: 180, y: 4 },
    { t: 'morcego', x: 188, y: 4 },
    { t: 'morcego', x: 194, y: 4 },
    { t: 'marimbondo', x: 186, y: 12, rota: 'oito', raio: 2 },
    { t: 'javalim-escudo', x: 205, y: 8, patrulha: [200, 210] },
    { t: 'javalim', x: 213, y: 8, patrulha: [210, 216], dir: -1 },
    { t: 'balao', x: 128, y: 17, n: 2 },
  ],
  coins: [
    { path: [[8, 28.5], [12, 28.5]] },
    { path: [[17, 29], [21, 28.5], [25.5, 26.4]] },
    { path: [[29, 23.4], [32, 23.4]] },
    { path: [[33, 20.4], [35, 20.4]] },
    { path: [[28, 17.4], [30, 17.4]] },
    { path: [[31, 14.4], [33, 14.4]] },
    { path: [[24.5, 11.4], [26.5, 11.4]] },
    { path: [[28.5, 8.4], [30.5, 8.4]] },
    { path: [[33, 7], [38, 7]] },
    { path: [[47, 6.5], [50, 4.5], [53, 6.5]], step: 0.9 },
    { path: [[46.5, 3.4], [49, 3.4]] },
    { path: [[60, 3.4], [63, 3.4]], cacho: true },
    { path: [[57, 6.5], [59.5, 4.8], [62.5, 6.5]], step: 0.9 },
    { path: [[78, 7], [83, 7]] },
    { path: [[84.5, 11], [84.5, 13]] },
    { path: [[96, 10], [100, 14], [104, 17], [108, 19], [112, 22], [116, 25], [118, 28]], step: 1.2 },
    { path: [[106.5, 14], [109, 14]] },
    { path: [[127, 28], [131, 28]] },
    { path: [[128, 23], [130, 23]] },
    { path: [[133.5, 22.5], [136, 22.5]] },
    { path: [[139, 28.5], [157, 28.5]], step: 1.5 },
    { path: [[161, 25.5], [165, 25.5]] },
    { path: [[164.5, 22.5], [166.5, 22.5]] },
    { path: [[166.5, 18.5], [169, 18.5]], cacho: true },
    { path: [[176.5, 28], [176.5, 21]], step: 1 },
    { path: [[183, 18], [189, 18]] },
    { path: [[192, 17], [192, 10]], step: 1 },
    { path: [[198, 7], [204, 7]] },
    { path: [[183.5, 31.2], [185.5, 31.2]] },
  ],
  cameraZones: [
    { x0: 20, x1: 39, zoom: 0.84 },
    { x0: 90, x1: 125, zoom: 0.84 },
    { x0: 127, x1: 169, zoom: 0.8, tiltY: -2 },
    { x0: 172, x1: 198, zoom: 0.8 },
  ],
  decor: [
    { d: 'gruta/estalagmite-g', x: 2, y: 30 },
    { d: 'gruta/cogumelo-brilho', x: 6, y: 30, front: true },
    { d: 'gruta/estalactite', x: 9, y: 22 },
    { d: 'gruta/cristal-ambar', x: 18, y: 30 },
    { d: 'gruta/estalactite', x: 26, y: 4 },
    { d: 'gruta/viga-mina', x: 32, y: 21 },
    { d: 'gruta/cogumelo-brilho', x: 26, y: 24 },
    { d: 'gruta/lamparina-parede', x: 23, y: 14 },
    { d: 'gruta/estalagmite-p', x: 42, y: 8 },
    { d: 'gruta/estalactite', x: 51, y: 2 },
    { d: 'gruta/estalactite', x: 61.5, y: 2, flip: true },
    { d: 'gruta/cristal-ambar', x: 55.5, y: 8 },
    { d: 'gruta/estalagmite-g', x: 67.5, y: 8, front: true },
    { d: 'gruta/cogumelo-brilho', x: 74, y: 8 },
    { d: 'gruta/coluna', x: 80, y: 8 },
    { d: 'gruta/cristal-ambar', x: 82, y: 14 },
    { d: 'gruta/estalactite', x: 93, y: 2 },
    { d: 'gruta/estalactite', x: 104, y: 2, flip: true },
    { d: 'gruta/estalactite', x: 117, y: 2 },
    { d: 'gruta/cogumelo-brilho', x: 99, y: 30, front: true },
    { d: 'gruta/estalagmite-p', x: 115, y: 30 },
    { d: 'gruta/cristal-ambar', x: 124, y: 30 },
    { d: 'gruta/estalactite', x: 131, y: 16 },
    { d: 'gruta/estalactite', x: 146, y: 16, flip: true },
    { d: 'gruta/estalactite', x: 158, y: 16 },
    { d: 'gruta/lamparina-parede', x: 140, y: 22 },
    { d: 'gruta/lamparina-parede', x: 156, y: 22 },
    { d: 'gruta/cristal-ambar', x: 161, y: 27 },
    { d: 'gruta/cogumelo-brilho', x: 137, y: 30, front: true },
    { d: 'gruta/coluna', x: 168.5, y: 30 },
    { d: 'gruta/viga-mina', x: 176, y: 30 },
    { d: 'gruta/viga-mina', x: 190, y: 19 },
    { d: 'gruta/estalactite', x: 183, y: 2 },
    { d: 'gruta/estalagmite-p', x: 196, y: 30 },
    { d: 'gruta/cristal-ambar', x: 184.5, y: 32, front: true },
    { d: 'gruta/estalagmite-g', x: 208, y: 8, front: true },
    { d: 'gruta/lamparina-parede', x: 215, y: 4 },
    { d: 'mata/samambaia', x: 221, y: 8 },
  ],
};
export default nivel;
