/**
 * Desafios do Tucano (seção 19.5): 30 missões escritas à mão.
 * Cada desafio escuta eventos do barramento e diz quanto avança (0 = nada).
 * `run` guarda o estado da tentativa de fase atual (zerado em 'level-start' de fase principal).
 */
export interface Premio { castanhas?: number; parafusos?: number; vidas?: number; figurino?: string }

export interface RunState {
  level: string;
  cocoHits: number;
  lamparina: boolean;
  bonus: boolean;
  [k: string]: unknown;
}
export interface Ctx { run: RunState }

export interface DesafioDef {
  id: string;
  titulo: string;
  meta: number;
  premio: Premio;
  /** eventos que o desafio escuta */
  ev: string[];
  conta(ev: string, d: any, c: Ctx): number;
}

const isJavalim = (t?: string) => !!t && t.startsWith('javal');
const kill = (f: (d: any) => boolean) => (_e: string, d: any) => (f(d) ? 1 : 0);
const gag = (id: string) => (_e: string, d: any) => (d?.id === id ? 1 : 0);

export const DESAFIOS: DesafioDef[] = [
  { id: 'panela-50', titulo: 'Derrube 50 Javalins com a Panela de Barro', meta: 50, premio: { parafusos: 40 }, ev: ['enemy-kill'],
    conta: kill((d) => isJavalim(d?.type) && d?.weapon === 'panela') },
  { id: 'coco-triplo', titulo: 'Acerte 3 inimigos com um único Coco Verde', meta: 1, premio: { castanhas: 60 }, ev: ['weapon-pick', 'weapon-hit', 'enemy-kill'],
    conta: (e, d, c) => {
      if (e === 'weapon-pick') { c.run.cocoHits = 0; return 0; }
      const coco = (e === 'weapon-hit' && d?.id === 'coco') || (e === 'enemy-kill' && d?.weapon === 'coco' && d?.how === 'arremesso');
      if (!coco) return 0;
      c.run.cocoHits++;
      return c.run.cocoHits === 3 ? 1 : 0;
    } },
  { id: 'vassoura-20', titulo: 'Varra 20 inimigos para fora da plataforma com a Vassoura', meta: 20, premio: { parafusos: 30 }, ev: ['enemy-kill'],
    conta: kill((d) => d?.weapon === 'vassoura') },
  { id: 'escuro-2-1', titulo: 'Termine a 2-1 sem acender nenhuma lamparina', meta: 1, premio: { figurino: 'tama:bombeira' }, ev: ['weapon-pick', 'sfx', 'level-end'],
    conta: (e, d, c) => {
      if (e === 'weapon-pick' && d?.id === 'lamparina') c.run.lamparina = true;
      if (e === 'sfx' && d?.id === 'lamparina-acender') c.run.lamparina = true;
      return e === 'level-end' && d?.id === '2-1' && !c.run.lamparina ? 1 : 0;
    } },
  { id: 'conga', titulo: 'Complete o combo de conga dos caranguejos', meta: 1, premio: { castanhas: 80 }, ev: ['gag'], conta: gag('gag_caranguejo_baile') },
  { id: 'pisao-100', titulo: 'Derrote 100 inimigos pulando na cabeça deles', meta: 100, premio: { parafusos: 50 }, ev: ['enemy-kill'], conta: kill((d) => d?.how === 'pisao') },
  { id: 'tromba-30', titulo: 'Derrube 30 inimigos com a Tromba-giro da Tamá', meta: 30, premio: { castanhas: 70 }, ev: ['enemy-kill'], conta: kill((d) => d?.how === 'rolar') },
  { id: 'combo-5', titulo: 'Emende um combo de 5 inimigos sem tocar o chão', meta: 1, premio: { vidas: 2 }, ev: ['combo'], conta: (_e, d) => (d?.n === 5 ? 1 : 0) },
  { id: 'castanhas-1000', titulo: 'Junte 1000 Castanhas-douradas', meta: 1000, premio: { figurino: 'lili:exploradora' }, ev: ['coin'], conta: (_e, d) => (d?.gasto ? 0 : 1) },
  { id: 'cipo-10', titulo: 'Complete C-I-P-Ó em 10 fases diferentes', meta: 10, premio: { vidas: 3 }, ev: ['letras-completas'], conta: () => 1 },
  { id: 'moedas-7', titulo: 'Encontre 7 Moedas-Folha', meta: 7, premio: { parafusos: 60 }, ev: ['moeda-folha'], conta: () => 1 },
  { id: 'bonus-10', titulo: 'Vença 10 Câmaras de Cristal', meta: 10, premio: { castanhas: 100 }, ev: ['bonus-end'], conta: (_e, d) => (d?.ok ? 1 : 0) },
  { id: 'chave-25', titulo: 'Desmonte 25 máquinas com a Chave Inglesa Gigante', meta: 25, premio: { parafusos: 80 }, ev: ['enemy-kill'],
    conta: kill((d) => d?.weapon === 'chave' && ['serrote', 'marimbondo', 'lagarta-trator', 'serra-gigante'].includes(d?.type)) },
  { id: 'buzina-15', titulo: 'Faça 15 Javalins pularem de susto com a Buzina', meta: 15, premio: { castanhas: 50 }, ev: ['weapon-hit'],
    conta: (_e, d) => (d?.id === 'buzina' && isJavalim(d?.target) ? 1 : 0) },
  { id: 'jaca-10', titulo: 'Esmague 10 inimigos com a Jaca Madura', meta: 10, premio: { parafusos: 25 }, ev: ['enemy-kill'], conta: kill((d) => d?.weapon === 'jaca') },
  { id: 'galho-20', titulo: 'Acerte 20 inimigos com o Galho Torto arremessado', meta: 20, premio: { castanhas: 40 }, ev: ['enemy-kill'],
    conta: kill((d) => d?.weapon === 'galho' && d?.how === 'arremesso') },
  { id: 'peixe-10', titulo: 'Dê 10 tapas molhados de Peixe Seco', meta: 10, premio: { figurino: 'tama:pescador' }, ev: ['weapon-hit'], conta: (_e, d) => (d?.id === 'peixe' ? 1 : 0) },
  { id: 'estilingue-30', titulo: 'Acerte 30 tiros de Estilingue', meta: 30, premio: { parafusos: 35 }, ev: ['weapon-hit', 'enemy-kill'],
    conta: (e, d) => (e === 'weapon-hit' ? (d?.id === 'estilingue' ? 1 : 0) : 0) },
  { id: 'cupins-15', titulo: 'Deixe a nuvem de cupins derrotar 15 inimigos', meta: 15, premio: { castanhas: 60 }, ev: ['enemy-kill'], conta: kill((d) => d?.weapon === 'cupinzeiro') },
  { id: 'capacete-5', titulo: 'Disfarce-se 5 vezes com o Capacete de Javalim', meta: 5, premio: { parafusos: 20 }, ev: ['weapon-pick'], conta: (_e, d) => (d?.id === 'capacete' ? 1 : 0) },
  { id: 'selfie', titulo: 'Atrapalhe a selfie do Javalim na beira do penhasco', meta: 1, premio: { castanhas: 30 }, ev: ['gag'], conta: gag('gag_selfie') },
  { id: 'preguica', titulo: 'Acorde a preguiça gigante (e aguente o abraço)', meta: 1, premio: { castanhas: 30 }, ev: ['gag'], conta: gag('gag_preguica') },
  { id: 'eco', titulo: 'Grite no salão escuro e revele a caverna pelo eco', meta: 1, premio: { castanhas: 30 }, ev: ['gag'], conta: gag('gag_eco') },
  { id: 'cafe', titulo: 'Troque o café dos Javalins por suco de jaca', meta: 1, premio: { figurino: 'lili:festa-junina' }, ev: ['gag'], conta: gag('gag_cafe') },
  { id: 'expediente', titulo: 'Faça soar a sirene de fim de expediente', meta: 1, premio: { parafusos: 30 }, ev: ['gag'], conta: gag('gag_relogio_ponto') },
  { id: 'barao-arvore', titulo: 'Bata no Barão enquanto ele ainda finge ser árvore', meta: 1, premio: { figurino: 'tama:capoeira' }, ev: ['gag'], conta: gag('gag_barao_disfarce') },
  { id: 'montaria-20', titulo: 'Monte nos amigos da selva 20 vezes', meta: 20, premio: { figurino: 'lili:surfista' }, ev: ['mount'], conta: () => 1 },
  { id: 'intocavel-5', titulo: 'Termine 5 fases sem perder o parceiro', meta: 5, premio: { vidas: 2 }, ev: ['hero-lost', 'level-end', 'level-start'],
    conta: (e, _d, c) => {
      if (e === 'hero-lost') c.run.perdeu = true;
      return e === 'level-end' && !c.run.bonus && !c.run.perdeu ? 1 : 0;
    } },
  { id: 'relampago-5', titulo: 'Ganhe 5 medalhas Relâmpago', meta: 5, premio: { parafusos: 70 }, ev: ['medalha'], conta: (_e, d) => (d?.id === 'relampago' ? 1 : 0) },
  { id: 'chefes-4', titulo: 'Derrote os 4 chefes da Ilha Sumaúma', meta: 4, premio: { castanhas: 200 }, ev: ['boss-defeat'], conta: () => 1 },
];

export function premioTexto(p: Premio): string {
  const out: string[] = [];
  if (p.castanhas) out.push(`${p.castanhas} castanhas no banco`);
  if (p.parafusos) out.push(`${p.parafusos} parafusos`);
  if (p.vidas) out.push(p.vidas > 1 ? `${p.vidas} vidas` : '1 vida');
  if (p.figurino) out.push('figurino raro');
  return out.join(' + ');
}
