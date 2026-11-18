/**
 * Estilo de entalhe da fonte "Sumaúma Entalhada" (compartilhado entre o jogo e o tools/build-ui.ts).
 * Cada glifo é uma linha central; o volume vem de camadas de traço sobrepostas:
 * sombra projetada → contorno escuro → lateral (profundidade da madeira) → face com degradê →
 * veio da madeira → sulco do formão → fio de luz.
 */
export type CarvedTone = 'ouro' | 'madeira' | 'creme' | 'verde' | 'ferrugem' | 'cristal';

export interface Layer { stroke: string; w: number; dx: number; dy: number; op: number }

const SIDE: Record<CarvedTone, string> = {
  ouro: '#7a4410', madeira: '#2e1a0c', creme: '#8a6a40', verde: '#0e2e16', ferrugem: '#4a120c', cristal: '#2e0e52',
};
const HI: Record<CarvedTone, string> = {
  ouro: '#fff6c8', madeira: '#e8bc84', creme: '#ffffff', verde: '#d8ffb0', ferrugem: '#ffb8a0', cristal: '#f4e0ff',
};
const GROOVE: Record<CarvedTone, string> = {
  ouro: '#9a5a12', madeira: '#2a1608', creme: '#b8945a', verde: '#14401e', ferrugem: '#5a160e', cristal: '#4a1a7a',
};

export const CARVED_GRADIENTS: Record<CarvedTone, [number, string][]> = {
  ouro: [[0, '#ffe68a'], [0.45, '#f2b530'], [1, '#c26c16']],
  madeira: [[0, '#c48a52'], [0.5, '#8a5a32'], [1, '#5a3a22']],
  creme: [[0, '#fffbf0'], [0.55, '#fff0d0'], [1, '#d9b98a']],
  verde: [[0, '#a8ec82'], [0.5, '#3e9e48'], [1, '#1e5a2a']],
  ferrugem: [[0, '#f08a6a'], [0.5, '#c4483a'], [1, '#7a2018']],
  cristal: [[0, '#f0d8ff'], [0.5, '#b070f0'], [1, '#6a2aa8']],
};

/** Camadas em ordem de pintura. `face` e `veio` usam url(#ce-<tom>) e url(#ce-veio). */
export function carvedLayers(tone: CarvedTone, prefix = 'ce'): Layer[] {
  return [
    { stroke: '#120e18', w: 27, dx: 3, dy: 8, op: 0.55 },
    { stroke: '#120e18', w: 27, dx: 0, dy: 0, op: 1 },
    { stroke: SIDE[tone], w: 18, dx: 0, dy: 5, op: 1 },
    { stroke: `url(#${prefix}-${tone})`, w: 17, dx: 0, dy: 0, op: 1 },
    { stroke: `url(#${prefix}-veio)`, w: 15, dx: 0, dy: 0, op: 0.35 },
    { stroke: GROOVE[tone], w: 3, dx: 1.2, dy: 2, op: 0.55 },
    { stroke: HI[tone], w: 4, dx: -2.4, dy: -3.4, op: 0.75 },
  ];
}

/** <defs> com os degradês e o padrão de veio, em coordenadas do glifo (topo 30, base 120). */
export function carvedDefs(prefix = 'ce'): string {
  let s = '';
  for (const [k, stops] of Object.entries(CARVED_GRADIENTS)) {
    s += `<linearGradient id="${prefix}-${k}" gradientUnits="userSpaceOnUse" x1="0" y1="24" x2="0" y2="126">${stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join('')}</linearGradient>`;
  }
  s += `<pattern id="${prefix}-veio" patternUnits="userSpaceOnUse" width="46" height="13"><path d="M0 4 Q11 1 23 4 T46 4 M0 10 Q12 13 23 10 T46 10" fill="none" stroke="#3e2512" stroke-width="1.6"/></pattern>`;
  return s;
}

export const GLYPH_PAD = 15; // espaço em cada lado do desenho do glifo
export const SPACE_W = 30;
