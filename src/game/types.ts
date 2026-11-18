/**
 * Tipos centrais de dados do jogo. Este arquivo é o CONTRATO entre motor, fases, entidades e UI.
 * Documentação completa do formato de fase: docs/LEVEL_FORMAT.md
 */

export const TILE = 64;

export type PresetId = 'selva' | 'caverna' | 'recife' | 'fabrica' | 'bonus' | 'neutro' | 'por-do-sol' | 'noite';
export type TilesetId = 'mata' | 'gruta' | 'recife' | 'fabrica' | 'cristal' | 'copa';
export type ParallaxId = 'mata' | 'mata-tarde' | 'serraria' | 'rio' | 'gruta' | 'mina' | 'praia' | 'recife' | 'naufragio' | 'fabrica' | 'cristal' | 'copa';
export type LevelKind = 'normal' | 'agua' | 'carrinho' | 'perseguicao' | 'chefe' | 'bonus' | 'vertical';
export type HeroId = 'tama' | 'lili';

/** Uma entidade posicionada à mão. x/y em TILES (podem ser fracionários); y = linha do chão onde ela pisa. */
export interface EntitySpawn {
  t: string; // tipo registrado (ex.: 'javalim', 'cabaca', 'arma:panela', 'totem-cipo')
  x: number;
  y: number;
  dir?: 1 | -1;
  /** parâmetros livres por tipo (rota de patrulha, alcance, sala bônus de destino etc.) */
  [k: string]: unknown;
}

export interface CoinTrail {
  /** polilinha em tiles; castanhas são colocadas ao longo dela a cada `step` tiles (padrão 0.75) */
  path: [number, number][];
  step?: number;
  /** 'cacho' coloca um cacho de 10 no último ponto */
  cacho?: boolean;
}

export interface CameraZone {
  x0: number; x1: number; // tiles
  zoom?: number; // 1 = normal
  tiltX?: number; tiltY?: number; // graus (CSS 3D sobre o palco)
  lockY?: number; // trava a câmera nessa linha (tiles)
  autoScroll?: number; // px/s (perseguições)
}

export interface Region {
  x0: number; x1: number; y0?: number; y1?: number; // tiles
  chuva?: boolean; // clima dinâmico roteirizado (piso escorregadio + poças)
  escuro?: boolean; // caverna escura: overlay com máscara de luz
  porDoSol?: boolean; // troca para o parallax/preset do fim de tarde
  noite?: boolean;
  correnteza?: number; // água: força horizontal px/s
}

export interface LevelDef {
  id: string; // '1-1', '2-3', 'chefe-1', '1-1-b1' (bônus), '5-1'
  nome: string;
  mundo: 1 | 2 | 3 | 4 | 5;
  tipo: LevelKind;
  tileset: TilesetId;
  parallax: ParallaxId;
  preset: PresetId;
  music: string; // id de faixa em src/data/music
  ambience?: string; // id de ambiente em src/data/sfx
  /** Grade de caracteres, uma string por linha, todas com a mesma largura. Legenda em docs/LEVEL_FORMAT.md */
  tilemap: string[];
  entities: EntitySpawn[];
  coins: CoinTrail[];
  start: [number, number];
  exit?: [number, number]; // Totem de Saída (fases normais)
  checkpoint?: [number, number]; // Totem de Cipó
  letras?: [number, number][]; // C, I, P, Ó nesta ordem
  moedaFolha?: [number, number];
  bonusRooms?: string[]; // ids das salas bônus ligadas a esta fase
  cameraZones?: CameraZone[];
  regions?: Region[];
  gags?: string[]; // ids gag_* presentes nesta fase
  decor?: DecorSpawn[];
  targetTime?: number; // segundos (medalha Relâmpago)
  totemPrizes?: string[]; // prêmios do Totem de Saída: 'castanhas:20', 'vida:1', 'parafusos:10', 'ficha'
  /** salas bônus: tempo limite (s), tipo e prêmio */
  bonus?: { modo: 'coletar' | 'achar' | 'catapultas' | 'chuva'; tempo: number; premio: string; retorno: [string, number, number] };
  /** chefe */
  boss?: string;
  /** fundo sólido atrás de todas as camadas (cor CSS) */
  sky?: string;
}

export interface DecorSpawn {
  d: string; // id do decor (catálogo em docs/LEVEL_FORMAT.md)
  x: number; y: number; // tiles; y = base (chão) do objeto
  front?: boolean; // desenhado na frente dos personagens
  flip?: boolean;
  s?: number; // escala
}

/* ------------------------------------------------------------------ */
/* Save / progressão (seção 19)                                        */
/* ------------------------------------------------------------------ */

export interface LevelProgress {
  done: boolean;
  letras: boolean;
  moeda: boolean;
  bonus: string[]; // salas bônus concluídas
  bestTime?: number;
  medals: { exploradora?: boolean; relampago?: boolean; intocavel?: boolean; brincalhona?: boolean };
  foto?: boolean;
}

export interface SaveSlot {
  version: 1;
  created: number;
  playTime: number; // segundos
  vidas: number;
  castanhas: number; // contador atual (100 = vida)
  banco: number; // castanhas guardadas no banco do Vô Bugio
  parafusos: number;
  levels: Record<string, LevelProgress>;
  unlocked: string[]; // fases liberadas no mapa
  mapPos: string; // nó atual do mapa
  upgrades: Record<string, number>; // id → nível (Oficina)
  album: { fotos: string[]; cartas: Record<string, string[]>; figurinos: string[] };
  figurino: { tama: string; lili: string };
  desafios: Record<string, number>; // progresso
  desafiosOk: string[];
  brindeDia?: string; // AAAA-MM-DD do último brinde do Bem-te-vi
  totals: Record<string, number>; // estatísticas (inimigos por arma etc.)
  lastCheckpoint?: { level: string; x: number; y: number };
  finalVisto?: boolean;
}

export interface Options {
  musica: number; sfx: number; ambiente: number; // 0..1
  qualidade: 'alta' | 'media';
  tremor: boolean;
  assistencia: boolean;
  teclas: Record<string, string[]>;
}
