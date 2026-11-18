/**
 * Brinde do Bem-te-vi (seção 19.6): tabela autoral sorteada uma vez por dia (data local).
 * `peso` é a chance relativa de cada linha. Esta é a única roleta do jogo.
 */
export interface BrindeDef { id: string; peso: number; tipo: 'castanhas' | 'parafusos' | 'arma' | 'figurino'; valor: string | number; fala: string }

export const BRINDES: BrindeDef[] = [
  { id: 'castanhas-15', peso: 18, tipo: 'castanhas', valor: 15, fala: 'Achei um punhado de castanhas no caminho. Pra vocês!' },
  { id: 'castanhas-30', peso: 12, tipo: 'castanhas', valor: 30, fala: 'Bem-te-vi! Bem-te-vi trazendo castanha pra dupla!' },
  { id: 'castanhas-60', peso: 4, tipo: 'castanhas', valor: 60, fala: 'Um cacho inteiro! Caiu da sumaúma direto no meu bico.' },
  { id: 'parafusos-8', peso: 16, tipo: 'parafusos', valor: 8, fala: 'Uns parafusos que os Javalins perderam. O Vô Bugio vai gostar.' },
  { id: 'parafusos-20', peso: 8, tipo: 'parafusos', valor: 20, fala: 'Desmontei uma serra enferrujada enquanto vocês dormiam.' },
  { id: 'arma-galho', peso: 9, tipo: 'arma', valor: 'galho', fala: 'Um Galho Torto de estimação. Entra na próxima fase já na mão!' },
  { id: 'arma-panela', peso: 7, tipo: 'arma', valor: 'panela', fala: 'A panela de barro da minha avó. Faz PÓÓIN direitinho.' },
  { id: 'arma-coco', peso: 7, tipo: 'arma', valor: 'coco', fala: 'Coco verde, geladinho. Quica três vezes, garanto!' },
  { id: 'arma-vassoura', peso: 6, tipo: 'arma', valor: 'vassoura', fala: 'Vassoura de piaçava novinha. Varre Javalim que é uma beleza.' },
  { id: 'arma-buzina', peso: 4, tipo: 'arma', valor: 'buzina', fala: 'Achei isso num caminhão da fábrica. FOOOM!' },
  { id: 'figurino-pescador', peso: 2, tipo: 'figurino', valor: 'tama:pescador', fala: 'Um chapéu de pescador que voou da canoa. Serve na Tamá!' },
  { id: 'figurino-exploradora', peso: 2, tipo: 'figurino', valor: 'lili:exploradora', fala: 'Um chapéu de exploradora! A Lili vai ficar uma graça.' },
  { id: 'figurino-junina', peso: 1, tipo: 'figurino', valor: 'lili:festa-junina', fala: 'Sobrou do arraiá da ilha. Vestido de chita pra Lili!' },
];

/** Data local AAAA-MM-DD. */
export function hoje(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Roleta autoral ponderada. Figurinos já ganhos saem da roleta. */
export function sortearBrinde(jaTem: (fig: string) => boolean): BrindeDef {
  const ok = BRINDES.filter((b) => b.tipo !== 'figurino' || !jaTem(String(b.valor)));
  const total = ok.reduce((s, b) => s + b.peso, 0);
  let r = Math.random() * total;
  for (const b of ok) { r -= b.peso; if (r <= 0) return b; }
  return ok[0];
}
