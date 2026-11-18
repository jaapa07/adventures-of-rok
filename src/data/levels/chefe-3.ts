/**
 * CHEFE 3 — POLVO-DRAGA, no fosso de dragagem ao pé do recife.
 * Arena subaquática de 40 × 18: o fundo de areia foi raspado pela draga, sobrou uma pedra de coral
 * à esquerda (abrigo das varridas de tentáculo) e um arco de rocha no alto para fugir da sucção.
 * A CAIXA DO PIRARUCU fica logo na entrada: só a investida dele abre as válvulas que brilham no polvo
 * (se a dupla perder a montaria, outro Pirarucu sai da toca da esquerda).
 */
import type { LevelDef } from '../../game/types';

const nivel: LevelDef = {
  id: 'chefe-3',
  nome: 'Polvo-Draga',
  mundo: 3,
  tipo: 'chefe',
  tileset: 'recife',
  parallax: 'recife',
  preset: 'recife',
  music: 'chefe',
  ambience: 'amb-recife',
  boss: 'polvo-draga',
  tilemap: [
    '########################################',
    '###~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~###',
    '##~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~##',
    '##~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~##',
    '##~~~~~~~~~~~~~~~~######~~~~~~~~~~~~~~##',
    '##~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~##',
    '##~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~##',
    '##~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~##',
    '##~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~##',
    '##~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~##',
    '##~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~##',
    '##~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~##',
    '##~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~##',
    '##~~~~~~~~~~~##~~~~~~~~~~~~~~~~~~~~~~~##',
    '##~~~~~~~~~~####~~~~~~~~~~~~~~~~~~~~~~##',
    '########################################',
    '########################################',
    '########################################',
  ],
  start: [5, 15],
  entities: [
    { t: 'caixa-montaria', x: 8, y: 15, m: 'pirarucu' },
    { t: 'chefe', id: 'polvo-draga', x: 30, y: 15, dir: -1, arena: [3, 37] },
    { t: 'arma', id: 'peixe', x: 4, y: 15 },
  ],
  coins: [
    { path: [[17, 3.2], [24, 3.2]], step: 0.9 },
    { path: [[3, 12], [3, 8]], step: 1 },
  ],
  decor: [
    { d: 'recife/coral-leque', x: 13, y: 13, s: 0.9 },
    { d: 'recife/coral-cerebro', x: 36, y: 15 },
    { d: 'recife/alga-alta', x: 3, y: 15 },
    { d: 'recife/alga-alta', x: 37, y: 15, flip: true },
    { d: 'recife/ancora', x: 20, y: 15, s: 1.4 },
    { d: 'recife/barril-naufrago', x: 24, y: 15 },
    { d: 'recife/anemona', x: 10.5, y: 15 },
    { d: 'recife/concha', x: 27, y: 15, front: true },
    { d: 'recife/estrela-mar', x: 35, y: 15 },
    { d: 'recife/alga-alta', x: 16.5, y: 15, front: true, s: 0.8 },
    { d: 'recife/bau-velho', x: 6, y: 15, s: 0.7 },
  ],
  cameraZones: [{ x0: 0, x1: 40, zoom: 0.86, lockY: 8.6 }],
};
export default nivel;
