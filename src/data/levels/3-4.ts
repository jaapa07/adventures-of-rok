/**
 * 3-4 CORRENTE DAS ÁGUAS-VIVAS. Ideia própria: CORREDORES DE CORRENTEZA E REMANSOS.
 * O fundo do mar aqui é uma rede de corredores, cada um com uma correnteza de sentido diferente.
 * Nos corredores A FAVOR a dupla dispara como numa esteira; nos CONTRÁRIOS é preciso pular de
 * REMANSO em REMANSO (nichos no teto ou no piso onde a água fica parada) para recuperar o fôlego.
 * Na pista da superfície o Remo vira prancha e a correnteza vira onda (17.3). No grande salão, a
 * PISTA DE DANÇA das Águas-Vivas-Néon (gag_agua_viva_disco) pisca no compasso da música.
 * Rota alta: por cima das pedras, fora d'água (caranguejos e ouriços). Rota baixa: os corredores.
 * Clímax: o TUBO SINUOSO, correnteza fortíssima descendo em zigue-zague entre águas-vivas.
 * Segmentos (coluna inicial): K1 0 · K2 22 · K3 50 · K4 76 · K5 102 · K6 132 · K7 158 · K8 186 · K9 216
 * Altura 22: linhas 0–2 ar, superfície do mar na linha 3, fundo nas linhas 14–21 (rocha).
 */
import type { LevelDef } from '../../game/types';
import { stitch, vazio, cheio } from './util';

const V = (w: number, n: number) => Array.from({ length: n }, () => vazio(w));
const C = (w: number, n: number) => Array.from({ length: n }, () => cheio(w));
const R = (row: string, n: number) => Array.from({ length: n }, () => row);

// K1 — pedra da largada e o funil que desce para o primeiro corredor
const K1 = [
  ...V(22, 3),
  '#####~~~~~~~~~~~~~~~~~',
  '#####~~~~~~~~~~~~~~~~~',
  ...R('####~~~~~~~~~~~~~~~~~~', 2),
  '###~~~~~~~~~~~~~~~~###',
  ...R('###~~~~~~~~~~~~~~~~~~~', 6),
  '###~~~~~~~~~~~~~~~~###',
  '####~~~~~~~~~~~~~~####',
  '#####~~~~~~~~~~~######',
  '#######~~~~~~~########',
  ...C(22, 4),
];
// K2 — corredor 1, correnteza A FAVOR (esteira d'água); por cima, a rota alta pelas pedras
const K2 = [
  ...V(28, 3),
  ...C(28, 5),
  '~~~~~~~~##~~~~~~~~~~~##~~~~~',
  ...R('~~~~~~~~~~~~~~~~~~~~~~~~~~~~', 4),
  '~~~~~~~~~~~~~##~~~~~~~~~~~~~',
  ...C(28, 8),
];
// K3 — corredor 2, correnteza CONTRA; remansos no teto (nichos sem correnteza) para descansar
const K3 = [
  ...V(26, 3),
  ...C(26, 3),
  ...R('####~~~~#######~~~~#######', 2),
  ...R('~~~~~~~~~~~~~~~~~~~~~~~~~~', 6),
  ...C(26, 8),
];
// K4 — a gruta de ar do Totem de Cipó (o Remo está na laje); o poço da rota alta cai aqui dentro
const K4 = [
  ...V(26, 3),
  ...R('##....####################', 2),
  ...R('##....................####', 3),
  '##~~~~~~~~~~~~#######~~~~~',
  ...R('~~~~~~~~~~~~~~#######~~~~~', 2),
  ...R('~~~~~~~~~~~~~~~~~~~~~~~~~~', 3),
  ...C(26, 8),
];
// K5 — a PISTA DE DANÇA (gag_agua_viva_disco): corredor de 6 linhas onde três faixas de águas-vivas
// cobrem toda a altura; só a faixa que apaga no compasso deixa passar. Por cima, pedra com ouriços.
const K5 = [
  ...V(30, 2),
  '^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^',
  ...C(30, 5),
  ...R('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~', 6),
  ...C(30, 8),
];
// K6 — o poço que desce para o corredor 3, correnteza CONTRA; remansos no piso
const K6 = [
  ...V(26, 3),
  ...C(26, 5),
  ...R('~~~~~~################~~~~', 6),
  ...R('~~~~~~~~~~~~~~~~~~~~~~~~~~', 4),
  ...R('######~~~###~~~~######~~##', 2),
  ...C(26, 2),
];
// K7 — duas pistas: a da SUPERFÍCIE (correnteza para surfar com o Remo; letra Ó) e a de baixo (baiacus)
const K7 = [
  ...V(28, 3),
  ...R('##~~~~~~~~~~~~~~~~~~~~~~~~~~', 4),
  '#####~~~##############~~~~##',
  ...R('~~~~~~~~~~~~~~~~~~~~~~~~~~~~', 6),
  ...C(28, 8),
];
// K8 — clímax: o TUBO SINUOSO (correnteza fortíssima); ouriços em cima impedem o atalho por terra
const K8 = [
  ...V(30, 2),
  '..........^^^^^^^^^^^^^^^^^^^^',
  ...R('~~~~~~~~~~####################', 3),
  ...R('~~~~~~~~~~~~~~~~##############', 2),
  '~~~~#######~~~~~~~~~##########',
  '~~~~#########~~~~~~~##########',
  '~~~~##########~~~~~~~~~~######',
  ...R('~~~~###############~~~~~~~~~~~', 2),
  '~~~~#####################~~~~~',
  ...C(30, 8),
];
// K9 — a subida até a praia do Totem de Saída; atrás do coral da frente, o nicho da Moeda-Folha
const K9 = [
  ...V(22, 3),
  ...R('~~~~~~~~~~############', 5),
  ...R('~~~~~~~~~~~~~~~~~~~###', 2),
  ...R('~~~~~~~~~~############', 4),
  ...C(22, 8),
];

const nivel: LevelDef = {
  id: '3-4',
  nome: 'Corrente das Águas-Vivas',
  mundo: 3,
  tipo: 'agua',
  tileset: 'recife',
  parallax: 'recife',
  preset: 'recife',
  music: 'recife',
  ambience: 'amb-recife',
  tilemap: stitch(K1, K2, K3, K4, K5, K6, K7, K8, K9),
  start: [2.5, 3],
  checkpoint: [94, 8],
  exit: [232, 3],
  letras: [[48, 2], [56, 7.6], [145, 19.6], [172, 4.6]],
  moedaFolha: [232.5, 9.6],
  bonusRooms: ['3-4-b1', '3-4-b2'],
  targetTime: 190,
  gags: ['gag_agua_viva_disco', 'gag_tedio', 'gag_parceiro_preso', 'gag_morte_comica'],
  totemPrizes: ['castanhas:20', 'parafusos:10', 'ficha', 'castanhas:30', 'vida:1'],
  regions: [
    { x0: 22, x1: 50, y0: 9, y1: 14, correnteza: 210 },
    { x0: 50, x1: 76, y0: 9, y1: 14, correnteza: -230 },
    { x0: 138, x1: 156, y0: 15, y1: 18, correnteza: -220 },
    { x0: 160, x1: 186, y0: 3, y1: 7, correnteza: 180 },
    { x0: 186, x1: 216, y0: 3, y1: 14, correnteza: 260 },
  ],
  entities: [
    { t: 'npc', id: 'tucano', x: 1.5, y: 3, falas: ['Aqui a água tem mão única. Às vezes contramão.', 'Nos corredores contra a corrente, descanse nos buracos do teto: lá a água fica parada.', 'Viu uma pista de dança de águas-vivas? Dance no compasso ou leve um choque!'] },
    { t: 'arma', id: 'peixe', x: 3.5, y: 3 },
    { t: 'piranha', x: 12, y: 10, rota: [[8, 10], [16, 10]] },
    { t: 'agua-viva', x: 30, y: 11, amp: 2 },
    { t: 'agua-viva', x: 40, y: 10, amp: 2 },
    { t: 'caranguejo', x: 28, y: 3 },
    { t: 'javalim', x: 38, y: 3, patrulha: [33, 44] },
    { t: 'arma', id: 'guarda-chuva', x: 24, y: 3 },
    { t: 'caranguejo', x: 54, y: 3, dir: -1 },
    { t: 'javalim-escudo', x: 64, y: 3, patrulha: [58, 72] },
    { t: 'piranha', x: 62, y: 11, rota: [[57, 11], [67, 11]] },
    { t: 'agua-viva', x: 70, y: 11.5, amp: 1.5 },
    { t: 'arma', id: 'remo', x: 91, y: 8 },
    { t: 'npc', id: 'quati', x: 96, y: 8, falas: ['Remo novinho, só três donos anteriores. Pode levar, é cortesia da casa.', 'Na pista de cima tem correnteza de surfe. Segure o remo e deixe a onda trabalhar!'] },
    // a pista de dança: a gag cria a grade de águas-vivas e o compasso do caminho seguro
    { t: 'gag', id: 'gag_agua_viva_disco', x: 117, y: 11.5, x0: 104, x1: 130, linhas: [9.5, 11.5, 13.5], passo: 2, faixas: [1, 0, 1, 2, 1, 0, 1, 2] },
    { t: 'piranha', x: 136, y: 12, rota: [[134.5, 12], [136, 10.5], [137.5, 12], [136, 13.5]] },
    { t: 'piranha', x: 150, y: 16, rota: [[146, 16], [154, 16]] },
    { t: 'baiacu', x: 155, y: 11 },
    { t: 'porta-bonus', x: 74, y: 3, room: '3-4-b1', oculta: true },
    { t: 'baiacu', x: 166, y: 11 },
    { t: 'baiacu', x: 176, y: 10 },
    { t: 'piranha', x: 181, y: 12, rota: [[179, 11], [183, 13], [183, 11], [179, 13]] },
    { t: 'agua-viva', x: 178, y: 5, amp: 1 },
    { t: 'agua-viva', x: 194, y: 6.5, amp: 0.8 },
    { t: 'agua-viva', x: 203, y: 9.5, amp: 0.6 },
    { t: 'agua-viva', x: 210, y: 12, amp: 0.6 },
    { t: 'piranha', x: 222, y: 10, rota: [[219, 10], [225, 10]] },
    { t: 'porta-bonus', x: 227.5, y: 3, room: '3-4-b2', oculta: true },
    { t: 'arma', id: 'capacete', x: 218, y: 14 },
    { t: 'npc', id: 'bem-te-vi', x: 236, y: 3, falas: ['Bem-te-vi dançando! Mentira, bem-te-vi tremendo.', 'O Polvo-Draga mora logo ali. Ele suga tudo... até a coragem.'] },
  ],
  coins: [
    { path: [[6, 5], [10, 8], [16, 10], [21, 11]], step: 1 },
    { path: [[24, 11], [48, 11]], step: 1.5 },
    { path: [[26, 1.8], [34, 1.8]], step: 1 },
    { path: [[44, 1.8], [52, 1.8]], step: 1 },
    { path: [[55, 7.4], [57, 7.4]] },
    { path: [[66, 7.4], [68, 7.4]] },
    { path: [[60, 1.8], [72, 1.8]], step: 1.2 },
    { path: [[78.5, 2], [78.5, 6]], step: 0.9 },
    { path: [[84, 6.4], [89, 6.4]] },
    { path: [[103, 9.5], [103, 13]], step: 1 },
    { path: [[107, 10.6], [129, 10.6]], step: 2 },
    { path: [[107, 12.6], [129, 12.6]], step: 2 },
    { path: [[133, 10], [135, 15], [140, 16]], step: 1 },
    { path: [[144, 19.5], [146, 19.5]] },
    { path: [[152.5, 15.5], [155, 12], [158, 10]], step: 1 },
    { path: [[161, 9], [164, 5]], step: 1 },
    { path: [[166, 4.6], [184, 4.6]], step: 1.5 },
    { path: [[168, 11], [182, 11]], step: 1.4 },
    { path: [[188, 7], [198, 7.4], [205, 11], [212, 12.6]], step: 1.1 },
    { path: [[218, 12], [222, 6], [226, 2]], step: 1, cacho: true },
    { path: [[227, 9.6], [231, 9.6]] },
  ],
  cameraZones: [
    { x0: 22, x1: 76, zoom: 0.95 },
    { x0: 102, x1: 132, zoom: 0.84, tiltX: -2 },
    { x0: 186, x1: 216, zoom: 0.9, tiltY: 4 },
  ],
  decor: [
    { d: 'recife/coqueiro', x: 0.8, y: 3, s: 0.8 },
    { d: 'recife/alga-alta', x: 8, y: 17 },
    { d: 'recife/coral-leque', x: 12, y: 17 },
    { d: 'recife/anemona', x: 16, y: 16 },
    { d: 'recife/concha', x: 26, y: 3 },
    { d: 'recife/estrela-mar', x: 31, y: 3 },
    { d: 'recife/coral-cerebro', x: 35.5, y: 13 },
    { d: 'recife/castelo-areia', x: 46, y: 3, s: 0.8 },
    { d: 'recife/anemona', x: 44, y: 14 },
    { d: 'recife/guarda-sol', x: 58, y: 3 },
    { d: 'recife/alga-alta', x: 61, y: 14 },
    { d: 'recife/coral-leque', x: 73, y: 14 },
    { d: 'recife/coqueiro', x: 70, y: 3, flip: true },
    { d: 'recife/barril-naufrago', x: 92.5, y: 8 },
    { d: 'recife/bau-velho', x: 89.5, y: 8, s: 0.8 },
    { d: 'recife/coral-cerebro', x: 82, y: 14 },
    { d: 'recife/coral-leque', x: 104, y: 14 },
    { d: 'recife/anemona', x: 110, y: 14 },
    { d: 'recife/coral-cerebro', x: 117, y: 14 },
    { d: 'recife/anemona', x: 123, y: 14, flip: true },
    { d: 'recife/coral-leque', x: 129, y: 14, flip: true },
    { d: 'recife/castelo-areia', x: 72, y: 3, s: 0.7 },
    { d: 'recife/estrela-mar', x: 226, y: 3 },
    { d: 'recife/alga-alta', x: 139.5, y: 20 },
    { d: 'recife/concha', x: 146, y: 20 },
    { d: 'recife/anemona', x: 155, y: 20 },
    { d: 'recife/coral-leque', x: 170, y: 14 },
    { d: 'recife/alga-alta', x: 179, y: 14 },
    { d: 'recife/coral-cerebro', x: 190, y: 14 },
    { d: 'recife/ancora', x: 220, y: 14 },
    { d: 'recife/coral-leque', x: 227.5, y: 10, front: true, s: 1.3 },
    { d: 'recife/alga-alta', x: 230, y: 10, front: true },
    { d: 'recife/coqueiro', x: 229, y: 3 },
    { d: 'recife/guarda-sol', x: 233.5, y: 3, flip: true },
  ],
};
export default nivel;
