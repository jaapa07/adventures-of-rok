/**
 * Formato das faixas (compostas nota por nota).
 *
 * Grade: cada passo é uma semicolcheia. Um compasso 4/4 tem 16 passos (3/4 = 12, 6/8 = 12).
 *
 * Partes melódicas (melodia, contra, baixo): compassos separados por `|`.
 *   Ficha: `<nota>[:dur][!|?]`  ex.: `e5:4`  `f#4:2!`  `bb3`  — dur em passos; se omitida, repete a anterior.
 *   `r:dur` = pausa · `_:dur` = liga (prolonga a nota anterior, inclusive através da barra) · `-` sozinho = compasso em silêncio.
 *   `!` acento, `?` nota fraca.
 * Acordes: um ou mais símbolos por compasso (divididos igualmente), ex.: `Am7 | F G | C/E`.
 *   Qualidades: (maior) m 7 m7 maj7 sus2 sus4 dim aug 6 m6 add9 9 m9 5. `%` repete o anterior, `-` sem acorde.
 * Bateria: padrões em grade (um caractere por passo): `X` forte, `x` normal, `o` fraco, `.` nada.
 *   A seção lista um padrão por compasso (`A A A B`); a lista é repetida se for mais curta; `-` = sem bateria.
 */
export type InstId =
  | 'marimba' | 'berimbau' | 'cordas' | 'flauta' | 'pad' | 'padBrilho' | 'baixo' | 'baixoSub' | 'baixoDist'
  | 'guitarra' | 'violao' | 'metais' | 'sino' | 'pizz' | 'lead' | 'kalimba';

export type PecaId =
  | 'bumbo' | 'caixa' | 'aro' | 'chimbal' | 'aberto' | 'prato' | 'surdo' | 'tom' | 'agogoA' | 'agogoB' | 'pandeiro'
  | 'ganza' | 'caxixi' | 'palmas' | 'metal' | 'bigorna' | 'vapor' | 'gota' | 'tamborim' | 'scratch' | 'bumboDj';

export type Parte = 'melodia' | 'contra' | 'baixo' | 'harmonia' | 'bateria';

export type PadraoBateria = Partial<Record<PecaId, string>>;

export interface EstiloHarmonia {
  /** pad = acorde sustentado; arpejo = notas do acorde em sequência; batida = acorde dedilhado na grade; stab = acorde curto na grade */
  tipo: 'pad' | 'arpejo' | 'batida' | 'stab';
  /** arpejo: índices das notas do acorde (0 = grave), um por passo-de-arpejo */
  padrao?: number[];
  /** arpejo: passos entre notas */
  passo?: number;
  /** batida/stab: grade com `x` onde o acorde soa */
  grade?: string;
  /** oitava da fundamental do voicing (padrão 4) */
  oitava?: number;
}

export interface Secao {
  bateria: string;
  acordes: string;
  baixo: string;
  melodia: string;
  contra: string;
  /** troca de instrumentos só nesta seção */
  inst?: Partial<Record<'melodia' | 'contra' | 'baixo' | 'harmonia', InstId>>;
  estilo?: EstiloHarmonia;
}

export interface Faixa {
  id: string;
  nome: string;
  bpm: number;
  tom: string;
  passos?: number;
  swing?: number;
  loop: boolean;
  /** reverb sugerido e nível de envio (0..1) */
  reverb?: 'mata' | 'gruta' | 'recife' | 'fabrica' | 'cristal' | 'copa' | 'seco';
  envio?: number;
  /** eco (delay) em passos aplicado a melodia e harmonia */
  eco?: { passos: number; fb: number; mix: number };
  inst: Record<'melodia' | 'contra' | 'baixo' | 'harmonia', InstId>;
  estilo: EstiloHarmonia;
  vol?: Partial<Record<Parte, number>>;
  bateria: Record<string, PadraoBateria>;
  secoes: Record<string, Secao>;
  ordem: string[];
}

const NOMES: Record<string, number> = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };

/** Transpõe todas as notas de um trecho escrito (usado em variações de tema, como no chefe final). */
export function transpor(texto: string, semitons: number): string {
  const nomes = ['c', 'c#', 'd', 'eb', 'e', 'f', 'f#', 'g', 'ab', 'a', 'bb', 'b'];
  return texto.replace(/\b([a-g])(#|b(?=\d))?(\d)/g, (_m, l: string, ac: string | undefined, o: string) => {
    let midi = NOMES[l] + (ac === '#' ? 1 : ac === 'b' ? -1 : 0) + (Number(o) + 1) * 12 + semitons;
    const oct = Math.floor(midi / 12) - 1;
    midi = ((midi % 12) + 12) % 12;
    return nomes[midi] + oct;
  });
}
