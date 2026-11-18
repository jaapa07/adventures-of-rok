/**
 * CHEFE FINAL — BARÃO JAVARDO, no pátio de montagem no coração da Fábrica Javarda.
 * Arena de 42 × 14: piso de chapa, duas passarelas para fugir da pá e um par de esteiras paradas nas
 * bordas. No meio do pátio, uma "árvore" com bigode (gag_barao_disfarce): bater nela antes da revelação
 * rende a medalha secreta. A Chave Inglesa e a Panela ficam na entrada para quem quiser chegar armado.
 */
import type { LevelDef } from '../../game/types';

const nivel: LevelDef = {
  id: 'chefe-4',
  nome: 'Barão Javardo',
  mundo: 4,
  tipo: 'chefe',
  tileset: 'fabrica',
  parallax: 'fabrica',
  preset: 'fabrica',
  music: 'chefe-final',
  ambience: 'amb-fabrica',
  boss: 'barao-javardo',
  gags: ['gag_barao_disfarce', 'gag_morte_comica', 'gag_parceiro_preso'],
  tilemap: [
    '##########################################',
    '##......................................##',
    '##......................................##',
    '##......................................##',
    '##......................................##',
    '##......................................##',
    '##.....======..................======...##',
    '##......................................##',
    '##......................................##',
    '##..............========................##',
    '##......................................##',
    '##......................................##',
    '##########################################',
    '##########################################',
  ],
  start: [5, 12],
  entities: [
    { t: 'gag', id: 'gag_barao_disfarce', x: 27, y: 12 },
    { t: 'chefe', id: 'barao-javardo', x: 27, y: 12, dir: -1, arena: [3, 39] },
    { t: 'arma', id: 'chave', x: 7, y: 12 },
    { t: 'arma', id: 'panela', x: 9, y: 12 },
  ],
  coins: [
    { path: [[8, 5.3], [12, 5.3]] },
    { path: [[33, 5.3], [37, 5.3]] },
  ],
  decor: [
    { d: 'fabrica/chamine-p', x: 4, y: 12 },
    { d: 'fabrica/placa-javarda', x: 13, y: 12 },
    { d: 'fabrica/barril-oleo', x: 15.5, y: 12, front: true },
    { d: 'fabrica/engrenagem', x: 20, y: 12, s: 1.3 },
    { d: 'fabrica/toco-cortado', x: 24, y: 12 },
    { d: 'fabrica/caixa-metal', x: 33, y: 12 },
    { d: 'fabrica/tubo-vapor', x: 36, y: 12 },
    { d: 'fabrica/corrente', x: 10, y: 1 },
    { d: 'fabrica/corrente', x: 31, y: 1, flip: true },
    { d: 'fabrica/cano', x: 38.5, y: 12, flip: true },
    { d: 'fabrica/painel', x: 2.5, y: 12 },
    { d: 'fabrica/cerca-arame', x: 18, y: 12, front: true, s: 0.8 },
  ],
  cameraZones: [{ x0: 0, x1: 42, zoom: 0.9, lockY: 7.2 }],
};
export default nivel;
