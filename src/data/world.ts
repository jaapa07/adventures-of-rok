/** Grafo do mapa da Ilha Sumaúma: ordem das fases e o que cada uma libera. */
export interface MapNode { id: string; mundo: number; nome: string; next: string[]; tipo: 'fase' | 'chefe' | 'especial'; }
export const MAP: MapNode[] = [
  { id: '1-1', mundo: 1, nome: 'Trilha da Sumaúma', next: ['1-2'], tipo: 'fase' },
  { id: '1-2', mundo: 1, nome: 'Copas e Cipós', next: ['1-3'], tipo: 'fase' },
  { id: '1-3', mundo: 1, nome: 'Serraria Clandestina', next: ['1-4'], tipo: 'fase' },
  { id: '1-4', mundo: 1, nome: 'Rio das Toras', next: ['chefe-1'], tipo: 'fase' },
  { id: 'chefe-1', mundo: 1, nome: 'Major Motosserra', next: ['2-1'], tipo: 'chefe' },
  { id: '2-1', mundo: 2, nome: 'Gruta das Lamparinas', next: ['2-2'], tipo: 'fase' },
  { id: '2-2', mundo: 2, nome: 'Trilhos da Mina', next: ['2-3'], tipo: 'fase' },
  { id: '2-3', mundo: 2, nome: 'Ninho dos Morcegos', next: ['chefe-2'], tipo: 'fase' },
  { id: 'chefe-2', mundo: 2, nome: 'Rainha Morcega-Lâmpada', next: ['3-1'], tipo: 'chefe' },
  { id: '3-1', mundo: 3, nome: 'Praia dos Caranguejos', next: ['3-2'], tipo: 'fase' },
  { id: '3-2', mundo: 3, nome: 'Recife das Bromélias', next: ['3-3'], tipo: 'fase' },
  { id: '3-3', mundo: 3, nome: 'Naufrágio Escuro', next: ['3-4'], tipo: 'fase' },
  { id: '3-4', mundo: 3, nome: 'Corrente das Águas-Vivas', next: ['chefe-3'], tipo: 'fase' },
  { id: 'chefe-3', mundo: 3, nome: 'Polvo-Draga', next: ['4-1'], tipo: 'chefe' },
  { id: '4-1', mundo: 4, nome: 'Esteiras', next: ['4-2'], tipo: 'fase' },
  { id: '4-2', mundo: 4, nome: 'Chaminés', next: ['4-3'], tipo: 'fase' },
  { id: '4-3', mundo: 4, nome: 'Lagarta-Trator', next: ['chefe-4'], tipo: 'fase' },
  { id: 'chefe-4', mundo: 4, nome: 'Barão Javardo', next: [], tipo: 'chefe' },
  { id: '5-1', mundo: 5, nome: 'Copa da Sumaúma', next: [], tipo: 'especial' },
];
export const MAIN_LEVELS = MAP.filter((n) => n.tipo === 'fase').map((n) => n.id);
export const WORLD_NAMES = ['', 'Mata Alta', 'Grutas Âmbar', 'Recife Bromélia', 'Fábrica Javarda', 'Copa da Sumaúma'];
