/**
 * 4-2 CHAMINÉS — fase VERTICAL (64 × 184): da caldeira no porão até o telhado da Fábrica Javarda.
 * Ideia própria: SUBIR PELAS CHAMINÉS, alternando salões largos e poços estreitos.
 *  - Caldeira (fundo): o RELÓGIO DE PONTO (gag_relogio_ponto) — bater o ponto toca a sirene de fim de
 *    expediente, os Javalins largam as ferramentas no chão e a dupla recolhe o arsenal.
 *  - Chaminé 1: degraus em ziguezague; atrás do coral... da parede rachada, a sala da Moeda-Folha.
 *  - Salão das esteiras: as plataformas são esteiras que empurram para os lados; corda até a letra I.
 *  - Salão do Totem de Cipó, com a corrente (cipó) da rota alta da esquerda.
 *  - Chaminé 2: degraus apertados entre serrotes.
 *  - Andaime: tábuas em escada até a corrente que entra na chaminé 3; o PAINEL DE MÁQUINA do andaime,
 *    com a Chave Inglesa, para as serras do clímax (17.3).
 *  - Clímax — Chaminé 3: serras gigantes varrem o poço de um lado para o outro enquanto a dupla sobe.
 *  - Telhado: Totem de Saída entre as chaminés, com a cidade-fábrica lá embaixo.
 * Linhas (de cima para baixo): Telhado 0–14 · Chaminé 3 15–44 · Andaime 45–72 · Chaminé 2 73–100 ·
 * Salão do Totem 101–123 · Salão das esteiras 124–140 · Chaminé 1 141–160 · Caldeira 161–183.
 */
import type { LevelDef } from '../../game/types';
import { vazio, cheio } from './util';

const R = (row: string, n: number) => Array.from({ length: n }, () => row);
/** linha com as paredes da fábrica nas bordas e os trechos [coluna, texto] desenhados à mão */
function L(...trechos: [number, string][]): string {
  const r = ('##' + vazio(60) + '##').split('');
  for (const [c, s] of trechos) for (let i = 0; i < s.length; i++) r[c + i] = s[i];
  return r.join('');
}
/** trecho de parede sólida da coluna a até a coluna b */
const S = (a: number, b: number): [number, string] => [a, cheio(b - a + 1)];
const O = L();
const TABUA = '======';

// TELHADO (0–14): o céu fumacento, a tábua da letra Ó e a laje com a boca da chaminé 3 (colunas 28–33)
const TELHADO = [...R(O, 10), L([44, '=====']), ...R(O, 2), ...R(L(S(2, 27), S(34, 61)), 2)];

// CHAMINÉ 3 (15–44): poço das colunas 24–37; degraus alternados e a corrente que vem do andaime
const P3 = L(S(2, 23), S(38, 61));
const D3 = (c: number) => L(S(2, 23), [c, TABUA], S(38, 61));
const CORRENTE3 = L(S(2, 23), [30, '|'], S(38, 61));
const CHAMINE3 = [
  P3, D3(31), ...R(P3, 2), D3(24), ...R(P3, 2), D3(31), ...R(P3, 2), D3(24), ...R(P3, 2), D3(31), ...R(P3, 2),
  D3(24), ...R(P3, 2), D3(31), ...R(P3, 2), D3(24),
  CORRENTE3, CORRENTE3, L(S(2, 23), [30, '|'], [32, '====='], S(38, 61)), ...R(CORRENTE3, 4),
];

// ANDAIME (45–72): a corrente sobe pela boca da chaminé 3; tábuas em ziguezague; piso com a boca da chaminé 2
const AND = (c: number) => L([c, TABUA]);
const ANDAIME = [
  ...R(L([30, '|']), 9), L([22, TABUA], [30, '|']), ...R(L([30, '|']), 2),
  AND(14), ...R(O, 2), AND(6), ...R(O, 2), AND(14), ...R(O, 2), AND(22), ...R(O, 2), AND(30), ...R(O, 2),
  L(S(2, 39), S(54, 61)),
];

// CHAMINÉ 2 (73–100): poço das colunas 40–53, degraus curtos dos dois lados
const P2 = L(S(2, 39), S(54, 61));
const D2 = (c: number) => L(S(2, 39), [c, TABUA], S(54, 61));
const CHAMINE2 = [
  P2, P2, D2(42), ...R(P2, 2), D2(48), ...R(P2, 2), D2(40), ...R(P2, 2), D2(48), ...R(P2, 2), D2(40), ...R(P2, 2),
  D2(48), ...R(P2, 2), D2(40), ...R(P2, 2), D2(48), ...R(P2, 2), D2(42), P2,
];

// SALÃO DO TOTEM (101–123): degraus pelo meio, corrente (cipó) da rota alta à esquerda até a letra P
const CR = (...t: [number, string][]) => L([12, '|'], ...t);
const SALAO_TOTEM = [
  O, L([40, TABUA]), L([4, '========'], [12, '|']), CR(), CR([44, TABUA]), CR(), CR(), CR([52, TABUA]), CR(), CR(),
  CR([44, TABUA]), CR(), CR(), CR([36, TABUA]), CR(), CR(), CR([28, TABUA]), CR(), CR(), CR([36, TABUA]), CR(), O,
  L(S(2, 41), S(50, 61)),
];

// SALÃO DAS ESTEIRAS (124–140): esteiras curtas como degraus; corda para a saliência da letra I
const SALAO_ESTEIRAS = [
  O, O, L([42, '<<<<<<<<']), O, O, L([50, '>>>>>>>>']), O, L([12, '__________________']), L([40, '<<<<<<<<']), O,
  L([4, '========']), L([30, '>>>>>>>>']), O, O, L([40, '<<<<<<<<']), O,
  L(S(2, 33), S(48, 61)),
];

// CHAMINÉ 1 (141–160): poço das colunas 34–47; a sala secreta (22–33, linhas 150–152) atrás da parede rachada
const P1 = L(S(2, 33), S(48, 61));
const D1 = (c: number) => L(S(2, 33), [c, TABUA], S(48, 61));
const CHAMINE1 = [
  D1(34), P1, P1, D1(42), P1, P1, D1(34), P1, P1,
  L(S(2, 21), [42, TABUA], S(48, 61)), L(S(2, 21), S(48, 61)), L(S(2, 21), S(48, 61)),
  D1(34), P1, P1, D1(42), P1, P1, D1(34), P1,
];

// CALDEIRA (161–183): o relógio de ponto e os Javalins no turno; corrente da esquerda até a letra C
const CC = (...t: [number, string][]) => L([4, '|'], ...t);
const CALDEIRA = [
  O, L([40, TABUA]), O, L([2, TABUA]), CC([47, TABUA]), CC(), CC(), CC([54, TABUA]), CC(), CC(), CC([47, TABUA]),
  CC(), CC(), CC([40, TABUA]), CC(), CC(), CC([33, TABUA]), CC(), CC(),
  ...R(cheio(64), 4),
];

const nivel: LevelDef = {
  id: '4-2',
  nome: 'Chaminés',
  mundo: 4,
  tipo: 'vertical',
  tileset: 'fabrica',
  parallax: 'fabrica',
  preset: 'fabrica',
  music: 'fabrica',
  ambience: 'amb-fabrica',
  tilemap: [...TELHADO, ...CHAMINE3, ...ANDAIME, ...CHAMINE2, ...SALAO_TOTEM, ...SALAO_ESTEIRAS, ...CHAMINE1, ...CALDEIRA],
  start: [8, 180],
  checkpoint: [57, 123],
  exit: [53, 13],
  letras: [[4.5, 163.4], [7.5, 133.4], [6.5, 102.4], [46, 9.4]],
  moedaFolha: [25, 152.6],
  bonusRooms: ['4-2-b1', '4-2-b2'],
  targetTime: 210,
  gags: ['gag_relogio_ponto', 'gag_tedio', 'gag_parceiro_preso', 'gag_morte_comica'],
  totemPrizes: ['parafusos:20', 'castanhas:25', 'parafusos:30', 'ficha', 'vida:1'],
  entities: [
    { t: 'npc', id: 'tucano', x: 5.5, y: 180, falas: ['Saída? Lá no telhado. Elevador? Quebrado. Escada? Também.', 'Esses Javalins só param de trabalhar quando toca a sirene. Alguém bate o ponto por eles?', 'Lá em cima as serras varrem a chaminé. Um painel no andaime desliga tudo — leve a chave!'] },
    // turno da caldeira: três Javalins armados perto do relógio; a sirene manda todos para a porta da direita
    { t: 'gag', id: 'gag_relogio_ponto', x: 11, y: 180, javalins: [[17, 180, 'chave'], [22, 180, 'buzina'], [27, 180, 'capacete']], saida: [60, 180], duracao: 10 },
    { t: 'arma', id: 'panela', x: 31, y: 180 },
    { t: 'javalim', x: 40, y: 180, patrulha: [35, 48] },
    { t: 'javalim', x: 53, y: 180, patrulha: [49, 60], dir: -1 },
    { t: 'marimbondo', x: 20, y: 171, rota: 'vaivem', raio: 4 },
    { t: 'marimbondo', x: 41, y: 148, rota: 'vaivem', raio: 3, vel: 1.2 },
    { t: 'parede-rachada', x: 33.5, y: 153 },
    { t: 'marimbondo', x: 20, y: 128.5, rota: 'circulo', raio: 2 },
    { t: 'marimbondo', x: 46, y: 135.5, rota: 'oito', raio: 2.2 },
    { t: 'serrote', x: 54, y: 133, amp: 1, freq: 0.6, alcance: 3 },
    { t: 'porta-bonus', x: 5.5, y: 123, room: '4-2-b1' },
    { t: 'javalim', x: 22, y: 123, patrulha: [15, 30] },
    { t: 'javalao', x: 33, y: 123, patrulha: [26, 40], dir: -1 },
    { t: 'arma', id: 'chave', x: 53.5, y: 123 },
    { t: 'npc', id: 'vo-bugio', x: 60.5, y: 123, falas: ['Na minha época as chaminés eram mais altas. E eu subia de chinelo.', 'Aquela parede rachada da chaminé de baixo soa oca. Uma batida no chão resolve.'] },
    { t: 'serrote', x: 47, y: 86, amp: 1, freq: 0.6, alcance: 4 },
    { t: 'serrote', x: 46, y: 94.5, amp: 0.8, freq: 0.8, alcance: 4 },
    { t: 'marimbondo', x: 47, y: 77.5, rota: 'circulo', raio: 1.5 },
    { t: 'javalim', x: 12, y: 72, patrulha: [3, 22] },
    { t: 'javalim', x: 33, y: 69, patrulha: [30.5, 35.5] },
    { t: 'arma', id: 'jaca', x: 25, y: 66 },
    { t: 'marimbondo', x: 18, y: 58.5, rota: 'vaivem', raio: 4 },
    { t: 'marimbondo', x: 40, y: 52, rota: 'circulo', raio: 2 },
    { t: 'plataforma', x: 46, y: 70, w: 3, path: [[46, 70], [46, 50]], vel: 80 },
    { t: 'painel-maquina', x: 24.5, y: 54, alvo: 'serras-chamine3' },
    { t: 'porta-bonus', x: 8.5, y: 60, room: '4-2-b2', oculta: true },
    { t: 'serra-gigante', x: 25, y: 33, path: [[25, 33], [36, 33]], vel: 130, tag: 'serras-chamine3' },
    { t: 'serra-gigante', x: 36, y: 27, path: [[36, 27], [25, 27]], vel: 150, tag: 'serras-chamine3' },
    { t: 'serra-gigante', x: 25, y: 21, path: [[25, 21], [36, 21]], vel: 175, tag: 'serras-chamine3' },
    { t: 'javalim', x: 18, y: 13, patrulha: [8, 26] },
    { t: 'javalao', x: 42, y: 13, patrulha: [36, 49] },
    { t: 'npc', id: 'tucano', x: 58.5, y: 13, falas: ['Que vista! Dá pra ver a fábrica inteira... e a Lagarta-Trator acordando. Corram!'] },
  ],
  coins: [
    { path: [[10, 178.5], [14, 178.5]] },
    { path: [[33.5, 175.6], [38, 175.6]] },
    { path: [[40.5, 172.6], [45, 172.6]] },
    { path: [[47.5, 169.6], [52, 169.6]] },
    { path: [[54.5, 166.6], [59, 166.6]] },
    { path: [[4.5, 177], [4.5, 166]], step: 1.2 },
    { path: [[35, 157.6], [38.5, 157.6]] },
    { path: [[42.5, 154.6], [46.5, 154.6]] },
    { path: [[22.5, 152.4], [24, 152.4]] },
    { path: [[35, 145.6], [38.5, 145.6]] },
    { path: [[42.5, 142.6], [46.5, 142.6]] },
    { path: [[30.5, 133.4], [36.5, 133.4]] },
    { path: [[13, 132.6], [28, 132.6]], step: 1.2 },
    { path: [[50.5, 127.4], [56.5, 127.4]] },
    { path: [[29, 115.6], [33, 115.6]] },
    { path: [[44.5, 109.6], [48.5, 109.6]] },
    { path: [[52.5, 106.6], [56.5, 106.6]] },
    { path: [[12.5, 120], [12.5, 105]], step: 1.3, cacho: true },
    { path: [[42.5, 97.6], [46.5, 97.6]] },
    { path: [[48.5, 88.6], [52.5, 88.6]] },
    { path: [[40.5, 79.6], [44.5, 79.6]] },
    { path: [[30.5, 67.6], [35, 67.6]] },
    { path: [[14.5, 61.6], [19, 61.6]] },
    { path: [[46, 47], [46, 47]], cacho: true },
    { path: [[30.5, 55], [30.5, 46]], step: 1.1 },
    { path: [[24.5, 35.6], [28.5, 35.6]] },
    { path: [[31.5, 26.6], [35.5, 26.6]] },
    { path: [[24.5, 17.6], [28.5, 17.6]] },
    { path: [[36, 11.6], [42, 11.6]] },
  ],
  cameraZones: [
    { x0: 0, x1: 64, zoom: 0.9 },
  ],
  decor: [
    { d: 'fabrica/placa-javarda', x: 3, y: 180 },
    { d: 'fabrica/barril-oleo', x: 14, y: 180, front: true },
    { d: 'fabrica/tubo-vapor', x: 30, y: 180 },
    { d: 'fabrica/engrenagem', x: 44, y: 180, s: 1.4 },
    { d: 'fabrica/caixa-metal', x: 57, y: 180 },
    { d: 'fabrica/cano', x: 61, y: 180, flip: true },
    { d: 'fabrica/painel', x: 36, y: 177 },
    { d: 'fabrica/corrente', x: 25, y: 161 },
    { d: 'fabrica/corrente', x: 44, y: 141, flip: true },
    { d: 'fabrica/caixa-metal', x: 27, y: 153, s: 0.7 },
    { d: 'fabrica/engrenagem', x: 30, y: 153, s: 0.6 },
    { d: 'fabrica/cano', x: 8, y: 140 },
    { d: 'fabrica/chamine-p', x: 22, y: 140 },
    { d: 'fabrica/tubo-vapor', x: 58, y: 140 },
    { d: 'fabrica/corrente', x: 60, y: 124 },
    { d: 'fabrica/caixa-metal', x: 9, y: 123 },
    { d: 'fabrica/barril-oleo', x: 17, y: 123 },
    { d: 'fabrica/placa-javarda', x: 47, y: 123 },
    { d: 'fabrica/painel', x: 52, y: 123, s: 0.8 },
    { d: 'fabrica/engrenagem', x: 60, y: 123, front: true, s: 0.8 },
    { d: 'fabrica/corrente', x: 46, y: 101 },
    { d: 'fabrica/tubo-vapor', x: 4, y: 72 },
    { d: 'fabrica/caixa-metal', x: 18, y: 72 },
    { d: 'fabrica/barril-oleo', x: 36, y: 72, front: true },
    { d: 'fabrica/cano', x: 57, y: 72 },
    { d: 'fabrica/corrente', x: 52, y: 45 },
    { d: 'fabrica/cerca-arame', x: 8.5, y: 60, front: true, s: 0.8 },
    { d: 'fabrica/chamine-p', x: 6, y: 13, s: 1.6 },
    { d: 'fabrica/chamine-p', x: 24, y: 13, s: 1.3, flip: true },
    { d: 'fabrica/tubo-vapor', x: 38, y: 13 },
    { d: 'fabrica/placa-javarda', x: 50, y: 13 },
    { d: 'fabrica/chamine-p', x: 61, y: 13, s: 1.8 },
  ],
};
export default nivel;
