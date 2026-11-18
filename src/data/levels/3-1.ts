/**
 * 3-1 PRAIA DOS CARANGUEJOS — abertura do Mundo 3. Ideia própria: A MARÉ DA LAGOA.
 * A praia é cortada por lagoas de maré com correnteza que empurra para trás: nadando é lento,
 * mas com o REMO na mão a dupla SURFA a correnteza (17.3), e o PIRARUCU da caixa entalhada
 * atravessa tudo e arromba o coral rachado que esconde a Moeda-Folha.
 * Também: a fila de conga dos caranguejos (gag_caranguejo_baile), Peixe Seco + Piranha-Boia,
 * coqueiral da rota alta (Lili) e o píer quebrado sobre o mar aberto. Clímax: pilares de pedra
 * sobre o canal dos Baiacus-Bomba até a duna do Totem de Saída.
 * Segmentos (coluna inicial): A 0 · B 24 · C 50 · D 76 · E 104 · F 128 · G 156 · H 182 · I 210
 * Altura 20 linhas; chão da praia na linha 15.
 */
import type { LevelDef } from '../../game/types';
import { stitch, vazio, cheio } from './util';

const V = (w: number, n: number) => Array.from({ length: n }, () => vazio(w));
const C = (w: number, n: number) => Array.from({ length: n }, () => cheio(w));
const R = (row: string, n: number) => Array.from({ length: n }, () => row);

// A — areia da chegada; folhas do coqueiro (rota alta só para a Lili, 4 tiles acima)
const A = [...V(24, 11), '..............====......', ...V(24, 3), ...C(24, 5)];
// B — o salão de baile: areia lisa para a fila de conga; tábua alta com a letra C
const B = [...V(26, 11), '................======....', ...V(26, 3), ...C(26, 5)];
// C — primeira poça de maré (Piranha-Boia; o Peixe Seco a faz de aliada); tábuas por cima
const Cs = [...V(26, 11), '.....=====...=====....====', ...V(26, 3), ...R('####~~~~~~~~~~~~~~~~~~####', 2), ...C(26, 3)];
// D — a LAGOA DA MARÉ: 4 de fundo, correnteza contra; caixa do Pirarucu na margem esquerda
const D = [...V(28, 11), '...=====....====....=====...', ...V(28, 3), ...R('##~~~~~~~~~~~~~~~~~~~~~~~~##', 2), ...R('##~~~~~~~~~~~~~~~~~~~~~~~~~~', 2), cheio(28)];
// E — margem do Totem de Cipó; gruta submersa atrás do coral rachado (Moeda-Folha)
const E = [...V(24, 11), '=====...................', ...V(24, 3), ...C(24, 2), ...R('~~~~~###################', 2), cheio(24)];
// F — coqueiral: folhas em escada até a copa (letra I); embaixo, caranguejos e o escudeiro
const F = [...V(28, 5), '..............====..........', ...V(28, 2), '........====................', ...V(28, 2), '..====..............====....', ...V(28, 3), ...C(28, 5)];
// G — píer quebrado sobre o mar aberto; uma batida no chão no meio do píer revela a porta da sala bônus 2
const G = [...V(26, 10), '..........=====...........', ...V(26, 2), '========....======...=====', vazio(26), ...R('~~~~~~~~~~~~~~~~~~~~~~~~~~', 4), cheio(26)];
// H — clímax: pilares de pedra sobre o canal dos Baiacus-Bomba; tábua alta da letra Ó
const H = [...V(28, 10), '...................=====....', ...V(28, 2), ...R('...##....##....##....##..###', 2), ...R('~~~##~~~~##~~~~##~~~~##~~###', 4), cheio(28)];
// I — duna do Totem de Saída
const I = [...V(30, 13), ...C(30, 7)];

const nivel: LevelDef = {
  id: '3-1',
  nome: 'Praia dos Caranguejos',
  mundo: 3,
  tipo: 'normal',
  tileset: 'recife',
  parallax: 'praia',
  preset: 'recife',
  music: 'recife',
  ambience: 'amb-praia',
  tilemap: stitch(A, B, Cs, D, E, F, G, H, I),
  start: [3, 15],
  checkpoint: [116, 15],
  exit: [233, 13],
  letras: [[43, 10], [144, 4.2], [90, 18.4], [203, 9.2]],
  moedaFolha: [106.5, 18.6],
  bonusRooms: ['3-1-b1', '3-1-b2'],
  targetTime: 170,
  gags: ['gag_caranguejo_baile', 'gag_tedio', 'gag_parceiro_preso', 'gag_morte_comica'],
  totemPrizes: ['castanhas:15', 'parafusos:6', 'castanhas:25', 'vida:1', 'ficha'],
  regions: [
    { x0: 77, x1: 103, y0: 14, y1: 20, correnteza: -130 },
    { x0: 156, x1: 182, y0: 14, y1: 20, correnteza: 90 },
  ],
  entities: [
    { t: 'npc', id: 'quati', x: 6, y: 15, falas: ['Bem-vindos à praia! Protetor solar? Não? Nem eu, sou um quati.', 'Os caranguejos ensaiam conga o dia inteiro. Pise na fila TODA, sem encostar no chão!', 'A lagoa puxa pra trás. Com um remo na mão, a correnteza vira onda de surfe!'] },
    { t: 'arma', id: 'peixe', x: 10, y: 15 },
    { t: 'caranguejo', x: 16, y: 15 },
    { t: 'javalim', x: 21, y: 15, patrulha: [18, 23] },
    // a fila de conga: os 10 caranguejos são criados pela própria gag, dançando entre "de" e "ate"
    { t: 'gag', id: 'gag_caranguejo_baile', x: 30, y: 15, de: 27, ate: 46, n: 10, castanhas: 30 },
    { t: 'javalim-escudo', x: 48, y: 15, patrulha: [46, 51], dir: -1 },
    { t: 'piranha', x: 62, y: 16.6, rota: [[56, 16.5], [68, 16.5]] },
    { t: 'arma', id: 'remo', x: 74.5, y: 15 },
    { t: 'caixa-montaria', x: 77, y: 15, m: 'pirarucu' },
    { t: 'piranha', x: 86, y: 17.5, rota: [[83.5, 16], [88.5, 19], [88.5, 16], [83.5, 19]] },
    { t: 'baiacu', x: 93, y: 16.8 },
    { t: 'piranha', x: 99, y: 18.2, rota: [[96, 18], [102, 18]] },
    { t: 'parede-rachada', x: 103.5, y: 19, variante: 'coral', so: 'pirarucu' },
    { t: 'caranguejo', x: 112, y: 15 },
    { t: 'javalim', x: 123, y: 15, patrulha: [119, 127], arma: 'coco' },
    { t: 'arma', id: 'coco', x: 131, y: 15 },
    { t: 'caranguejo', x: 135, y: 15 },
    { t: 'javalim-escudo', x: 142, y: 15, patrulha: [137, 150] },
    { t: 'caranguejo', x: 152, y: 15, dir: -1 },
    { t: 'balao', x: 143, y: 2, n: 1 },
    { t: 'javalim', x: 160, y: 13, patrulha: [157, 163] },
    { t: 'caranguejo', x: 171, y: 13 },
    { t: 'javalim', x: 179, y: 13, patrulha: [177, 181], dir: -1 },
    { t: 'piranha', x: 166, y: 17.5, rota: [[163, 17.5], [166, 16], [169, 17.5], [166, 18.8]] },
    { t: 'porta-bonus', x: 170.5, y: 13, room: '3-1-b2', oculta: true },
    { t: 'baiacu', x: 189, y: 16 },
    { t: 'baiacu', x: 195, y: 15.4 },
    { t: 'piranha', x: 196, y: 17.4, rota: [[194, 17.5], [196, 16], [196, 18.6]] },
    { t: 'baiacu', x: 206, y: 16.2 },
    { t: 'porta-bonus', x: 106.5, y: 11, room: '3-1-b1' },
    { t: 'arma', id: 'panela', x: 212, y: 13 },
    { t: 'javalao', x: 221, y: 13, patrulha: [215, 227] },
    { t: 'caranguejo', x: 226, y: 13, dir: -1 },
    { t: 'npc', id: 'tucano', x: 236.5, y: 13, falas: ['Ufa, chegaram! Eu vim voando. Óbvio.', 'Lá embaixo é o Recife das Bromélias. Prendam a respiração... brincadeira, aqui todo mundo nada.'] },
  ],
  coins: [
    { path: [[4.5, 13.6], [8, 13.6]] },
    { path: [[14.5, 10.2], [17.5, 10.2]] },
    { path: [[24, 13.5], [27, 12]] },
    { path: [[40.5, 10.2], [45.5, 10.2]] },
    { path: [[55, 10.2], [59, 10.2]], step: 1 },
    { path: [[63, 10.2], [67, 10.2]], step: 1 },
    { path: [[56, 16.4], [71, 16.4]], step: 1.2 },
    { path: [[80, 10.2], [83, 10.2]] },
    { path: [[80, 16], [86, 17.6], [92, 18.3], [100, 17.6]], step: 1 },
    { path: [[96.5, 10.2], [100.5, 10.2]], cacho: true },
    { path: [[108, 13.6], [112, 12.4], [116, 13.6]] },
    { path: [[130, 10.2], [133, 10.2]] },
    { path: [[136.5, 7.2], [139, 7.2]] },
    { path: [[140, 5.6], [142, 4.4]] },
    { path: [[157, 12], [163, 12]] },
    { path: [[165, 11], [166.5, 10], [168, 11]] },
    { path: [[170, 12], [174, 12]] },
    { path: [[166.5, 9], [170.5, 9]] },
    { path: [[183, 11.5], [185.5, 11]] },
    { path: [[188, 11], [190.5, 10.5]] },
    { path: [[194, 11], [196.5, 10.5]] },
    { path: [[200, 11], [202.5, 10.5]] },
    { path: [[211, 11.6], [216, 11.6]] },
  ],
  cameraZones: [
    { x0: 26, x1: 48, zoom: 0.94 },
    { x0: 77, x1: 103, zoom: 0.9 },
    { x0: 183, x1: 209, zoom: 0.88, tiltY: -3 },
  ],
  decor: [
    { d: 'recife/coqueiro', x: 1.5, y: 15 },
    { d: 'recife/guarda-sol', x: 4, y: 15 },
    { d: 'recife/castelo-areia', x: 12.5, y: 15 },
    { d: 'recife/coqueiro', x: 16, y: 15, flip: true },
    { d: 'recife/concha', x: 20, y: 15, front: true },
    { d: 'recife/estrela-mar', x: 27, y: 15 },
    { d: 'recife/guarda-sol', x: 31, y: 15, flip: true },
    { d: 'recife/concha', x: 37, y: 15 },
    { d: 'recife/coqueiro', x: 42, y: 15 },
    { d: 'recife/castelo-areia', x: 49.5, y: 15, s: 0.8 },
    { d: 'recife/alga-alta', x: 56, y: 17 },
    { d: 'recife/anemona', x: 64, y: 17 },
    { d: 'recife/coral-cerebro', x: 69, y: 17 },
    { d: 'recife/estrela-mar', x: 75, y: 15, front: true },
    { d: 'recife/alga-alta', x: 80, y: 19 },
    { d: 'recife/coral-leque', x: 84, y: 19 },
    { d: 'recife/anemona', x: 89, y: 19 },
    { d: 'recife/coral-cerebro', x: 95, y: 19 },
    { d: 'recife/alga-alta', x: 101, y: 19, flip: true },
    { d: 'recife/coral-leque', x: 107.5, y: 19, s: 0.7 },
    { d: 'recife/barril-naufrago', x: 110, y: 15 },
    { d: 'recife/guarda-sol', x: 119, y: 15 },
    { d: 'recife/concha', x: 125, y: 15, front: true },
    { d: 'recife/coqueiro', x: 131, y: 15, s: 1.3 },
    { d: 'recife/coqueiro', x: 140, y: 15, s: 1.6, flip: true },
    { d: 'recife/coqueiro', x: 149.5, y: 15, s: 1.9 },
    { d: 'recife/estrela-mar', x: 145, y: 15, front: true },
    { d: 'recife/ancora', x: 159, y: 19 },
    { d: 'recife/barril-naufrago', x: 163, y: 13 },
    { d: 'recife/alga-alta', x: 165, y: 19 },
    { d: 'recife/bau-velho', x: 170.5, y: 19 },
    { d: 'recife/coral-leque', x: 175, y: 19 },
    { d: 'recife/timao', x: 180, y: 19, flip: true },
    { d: 'recife/coral-cerebro', x: 189, y: 19 },
    { d: 'recife/anemona', x: 196, y: 19 },
    { d: 'recife/alga-alta', x: 205, y: 19 },
    { d: 'recife/coqueiro', x: 213, y: 13 },
    { d: 'recife/castelo-areia', x: 224, y: 13 },
    { d: 'recife/guarda-sol', x: 230, y: 13 },
    { d: 'recife/coqueiro', x: 238, y: 13, flip: true, s: 1.2 },
  ],
};
export default nivel;
