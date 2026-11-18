/**
 * Dados puros do cenário (sem DOM): cores da água por tileset e gradientes de céu (CSS) por
 * conjunto de parallax. Lidos pelos temas (render) e pelo manifesto (Node).
 */
export const WATER_COLOR: Record<string, string> = {
  mata: 'rgba(52, 96, 74, 0.82)',
  gruta: 'rgba(40, 52, 48, 0.86)',
  recife: 'rgba(30, 110, 150, 0.78)',
  fabrica: 'rgba(70, 60, 40, 0.86)',
  cristal: 'rgba(90, 40, 140, 0.8)',
  copa: 'rgba(60, 120, 110, 0.8)',
};

export const SKY: Record<string, string> = {
  mata: 'linear-gradient(180deg, #6fb8e8 0%, #a6d8f0 45%, #d8f0e4 100%)',
  'mata-tarde': 'linear-gradient(180deg, #3a2a6a 0%, #c8507a 40%, #f89a5a 70%, #ffd890 100%)',
  serraria: 'linear-gradient(180deg, #8a9aa8 0%, #b8b8a8 50%, #d8c8a0 100%)',
  rio: 'linear-gradient(180deg, #5aa8e0 0%, #9ad0ec 50%, #e0f4f0 100%)',
  gruta: 'linear-gradient(180deg, #0a0604 0%, #1e140a 50%, #2e1e10 100%)',
  mina: 'linear-gradient(180deg, #0c0a08 0%, #1e1812 55%, #2a2014 100%)',
  praia: 'linear-gradient(180deg, #3a9ae8 0%, #7cc8f4 45%, #e4f6fa 100%)',
  recife: 'linear-gradient(180deg, #3ab0d8 0%, #1a6ea8 40%, #0a2e5a 100%)',
  naufragio: 'linear-gradient(180deg, #14506e 0%, #0a2a44 45%, #040e1c 100%)',
  fabrica: 'linear-gradient(180deg, #3a1a14 0%, #7a3a22 45%, #c86a34 100%)',
  cristal: 'linear-gradient(180deg, #1a0a34 0%, #4a1a7a 50%, #8a4ac8 100%)',
  copa: 'linear-gradient(180deg, #3a8ae0 0%, #8ac8f4 50%, #f4fbff 100%)',
};

export const PARALLAX_SETS = ['mata', 'mata-tarde', 'serraria', 'rio', 'gruta', 'mina', 'praia', 'recife', 'naufragio', 'fabrica', 'cristal', 'copa'];
export const TILESETS = ['mata', 'gruta', 'recife', 'fabrica', 'cristal', 'copa'];

/** Quadro da faixa de ondas (px): 4 quadros lado a lado; a linha d'água fica a 1/4 da altura. */
export const WATER_FRAME: [number, number] = [128, 48];
/** Tamanho das camadas de parallax (px). */
export const LAYER_SIZE: [number, number] = [2048, 1152];
