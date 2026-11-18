/**
 * Progressão incremental (seção 19): Oficina, Viveiro, Álbum, Medalhas, Desafios, Brinde.
 * Dados das melhorias e consultas rápidas usadas pelo gameplay.
 */
import { game } from '../core/save';

export interface UpgradeDef { id: string; nome: string; desc: string; niveis: number; custos: number[]; moeda: 'parafusos' | 'castanhas' }
export const UPGRADES: UpgradeDef[] = [
  { id: 'maos', nome: 'Mãos Firmes', desc: '+1 uso em todas as armas de mão', niveis: 3, custos: [20, 45, 90], moeda: 'parafusos' },
  { id: 'braco', nome: 'Braço Forte', desc: 'Arremessos +15% de alcance', niveis: 3, custos: [15, 35, 70], moeda: 'parafusos' },
  { id: 'bolso', nome: 'Bolso Fundo', desc: 'Guarda 1 arma na mochila (troca com Q/LB)', niveis: 2, custos: [60, 120], moeda: 'parafusos' },
  { id: 'coracao', nome: 'Coração de Sumaúma', desc: 'O líder aguenta 1 golpe a mais antes de fugir', niveis: 3, custos: [50, 100, 200], moeda: 'parafusos' },
  { id: 'faro', nome: 'Faro de Tamanduá', desc: 'Segredos próximos brilham levemente', niveis: 1, custos: [80], moeda: 'parafusos' },
  { id: 'cauda', nome: 'Cauda Planadora', desc: 'Planada da Lili +40% de duração', niveis: 2, custos: [40, 90], moeda: 'parafusos' },
  { id: 'ima', nome: 'Ímã de Castanha', desc: 'Castanhas próximas são atraídas', niveis: 2, custos: [30, 70], moeda: 'parafusos' },
];
export function upgradeLevel(id: string): number { return game.save.upgrades[id] ?? 0; }
export function buyUpgrade(id: string): boolean {
  const u = UPGRADES.find((x) => x.id === id);
  if (!u) return false;
  const lv = upgradeLevel(id);
  if (lv >= u.niveis) return false;
  const cost = u.custos[lv];
  if (game.save[u.moeda] < cost) return false;
  game.save[u.moeda] -= cost;
  game.save.upgrades[id] = lv + 1;
  game.persist();
  return true;
}

/* ------------------------------------------------------------------ */
/* Fim de fase: grava progresso, medalhas e libera as próximas fases    */
/* ------------------------------------------------------------------ */
import { levelProgress } from '../core/save';
import { MAP } from '../data/world';
import type { Session } from './session';
import type { LevelDef } from './types';

export interface LevelResult { medals: { exploradora: boolean; relampago: boolean; intocavel: boolean; brincalhona: boolean }; novas: string[]; time: number; castanhas: number; parafusos: number; desbloqueou: string[] }

export function finishLevel(L: LevelDef, ses: Session): LevelResult {
  const s = game.save;
  const p = levelProgress(s, L.id);
  const before = { ...p.medals };
  p.done = true;
  if (ses.letras.every(Boolean)) p.letras = true;
  if (ses.moeda) p.moeda = true;
  for (const b of ses.bonusDone) if (!p.bonus.includes(b)) p.bonus.push(b);
  if (ses.foto) p.foto = true;
  p.bestTime = p.bestTime === undefined ? ses.time : Math.min(p.bestTime, ses.time);
  const allBonus = (L.bonusRooms ?? []).every((b) => p.bonus.includes(b));
  const medals = {
    exploradora: !!(p.letras && p.moeda && allBonus),
    relampago: L.targetTime !== undefined && ses.time <= L.targetTime,
    intocavel: !ses.partnerLostEver,
    brincalhona: (L.gags ?? []).filter((g) => g !== 'gag_tedio' && g !== 'gag_morte_comica' && g !== 'gag_parceiro_preso').some((g) => ses.gags.has(g)) || (L.gags ?? []).length === 0,
  };
  const novas: string[] = [];
  for (const k of Object.keys(medals) as (keyof typeof medals)[]) if (medals[k] && !before[k]) { p.medals[k] = true; novas.push(k); }
  const node = MAP.find((n) => n.id === L.id);
  const desbloqueou: string[] = [];
  for (const n of node?.next ?? []) if (!s.unlocked.includes(n)) { s.unlocked.push(n); desbloqueou.push(n); }
  game.persist();
  return { medals, novas, time: ses.time, castanhas: ses.castanhas, parafusos: ses.parafusos, desbloqueou };
}

/* ------------------------------------------------------------------ */
/* Desafios, Viveiro, Álbum, Brinde, Banco (seções 19.2–19.6)          */
/* ------------------------------------------------------------------ */
import { DESAFIOS, type Premio } from '../data/desafios';
import { CARTAS, FIGURINOS } from '../data/album';
import { BRINDES, hoje, sortearBrinde, type BrindeDef } from '../data/brinde';
import type { SaveSlot } from './types';

/** Campos extras do save usados pela interface (persistem no mesmo JSON do slot). */
export interface SaveExtra { brindeArma?: string; mapaVisto?: string[]; verdeVisto?: number; marcosVistos?: number[] }
export function extra(s: SaveSlot = game.save): SaveSlot & SaveExtra { return s as SaveSlot & SaveExtra; }

export function aplicarPremio(p: Premio) {
  const s = game.save;
  if (p.castanhas) s.banco += p.castanhas;
  if (p.parafusos) s.parafusos += p.parafusos;
  if (p.vidas) s.vidas += p.vidas;
  if (p.figurino && !s.album.figurinos.includes(p.figurino)) s.album.figurinos.push(p.figurino);
}

/** Avança um desafio; devolve true se ele acabou de ser concluído (o prêmio já foi entregue). */
export function avancarDesafio(id: string, n = 1): boolean {
  const s = game.save;
  const d = DESAFIOS.find((x) => x.id === id);
  if (!d || s.desafiosOk.includes(id) || n <= 0) return false;
  s.desafios[id] = Math.min(d.meta, (s.desafios[id] ?? 0) + n);
  if (s.desafios[id] >= d.meta) { s.desafiosOk.push(id); aplicarPremio(d.premio); return true; }
  return false;
}

/** Bestiário: registra a forma com que um inimigo foi derrotado. Devolve true se a carta acabou de ser liberada. */
export function registrarDerrota(tipo: string, how: string): boolean {
  const c = CARTAS.find((x) => x.id === tipo);
  if (!c) return false;
  const s = game.save;
  const list = (s.album.cartas[tipo] ??= []);
  const antes = cartaLiberada(tipo);
  if (!list.includes(how)) list.push(how);
  return !antes && cartaLiberada(tipo);
}
export function cartaLiberada(tipo: string): boolean {
  const c = CARTAS.find((x) => x.id === tipo);
  const list = game.save.album.cartas[tipo] ?? [];
  return !!c && c.formas.every((f) => list.includes(f));
}

/* ---- Viveiro ---- */
export function moedasPlantadas(s: SaveSlot = game.save): number {
  return Object.values(s.levels).filter((p) => p.moeda).length;
}
/** Regiões do mapa que já voltaram a ficar verdes (uma a cada 3 Moedas-Folha, até 4). */
export function regioesVerdes(s: SaveSlot = game.save): number { return Math.min(4, Math.floor(moedasPlantadas(s) / 3)); }
/** Aplica os marcos do Viveiro (trilha secreta, câmara especial, fase 5-1). Retorna os marcos recém-atingidos. */
export function aplicarMarcosViveiro(): number[] {
  const s = game.save, x = extra(s);
  const n = moedasPlantadas(s);
  const novos: number[] = [];
  for (const m of [3, 7, 14]) {
    if (n >= m && !(x.marcosVistos ?? []).includes(m)) {
      (x.marcosVistos ??= []).push(m);
      novos.push(m);
      if (m === 3) s.banco += 50;
      if (m === 14 && !s.unlocked.includes('5-1')) s.unlocked.push('5-1');
    }
  }
  if (novos.length) game.persist();
  return novos;
}

/* ---- Brinde do Bem-te-vi ---- */
export function brindeDisponivel(): boolean { return game.save.brindeDia !== hoje(); }
export function receberBrinde(): BrindeDef | null {
  if (!brindeDisponivel()) return null;
  const s = game.save;
  const b = sortearBrinde((f) => s.album.figurinos.includes(f));
  s.brindeDia = hoje();
  switch (b.tipo) {
    case 'castanhas': s.banco += Number(b.valor); break;
    case 'parafusos': s.parafusos += Number(b.valor); break;
    case 'arma': extra(s).brindeArma = String(b.valor); break;
    case 'figurino': if (!s.album.figurinos.includes(String(b.valor))) s.album.figurinos.push(String(b.valor)); break;
  }
  game.persist();
  return b;
}
export { BRINDES };

/* ---- Figurinos e banco ---- */
export function comprarFigurino(id: string): boolean {
  const f = FIGURINOS.find((x) => x.id === id);
  const s = game.save;
  if (!f || s.album.figurinos.includes(id) || s.banco < f.preco) return false;
  s.banco -= f.preco;
  s.album.figurinos.push(id);
  game.persist();
  return true;
}
export function vestirFigurino(id: string): boolean {
  const f = FIGURINOS.find((x) => x.id === id);
  const s = game.save;
  if (!f || !s.album.figurinos.includes(id)) return false;
  s.figurino[f.heroi] = f.variante;
  game.persist();
  return true;
}
/** Guarda as castanhas soltas no banco do Vô Bugio (moeda dos figurinos). */
export function depositarCastanhas(): number {
  const s = game.save;
  const n = s.castanhas;
  s.banco += n;
  s.castanhas = 0;
  game.persist();
  return n;
}
