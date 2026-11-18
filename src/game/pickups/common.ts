/**
 * Utilidades compartilhadas por coletáveis, objetos e salas bônus:
 * contato com a dupla, contadores (castanhas → vidas), prêmios autorais e o brilho do Faro de Tamanduá.
 */
import type { Entity } from '../entity';
import type { World } from '../world';
import type { Hero } from '../hero';
import { TILE } from '../types';
import { game } from '../../core/save';
import { bus } from '../../core/events';
import { upgradeLevel } from '../progress';

/** Herói (líder ou parceiro) cuja caixa toca a caixa da entidade (com folga `pad`). */
export function heroTouching(e: Entity, pad = 0, leaderOnly = false): Hero | null {
  const d = e.world.duo;
  const list = leaderOnly ? [d.leader] : [d.leader, d.partner];
  for (const h of list) {
    if (!h || h.state === 'dead') continue;
    if (Math.abs(h.x - e.x) < (h.w + e.w) / 2 + pad && h.y - h.h < e.y + pad && h.y > e.y - e.h - pad) return h;
  }
  return null;
}

/** Soma castanhas no save; a cada 100, +1 vida. Emite 'coin' por castanha. */
export function addCastanhas(w: World, n: number) {
  const s = game.save;
  for (let i = 0; i < n; i++) {
    s.castanhas++;
    bus.emit('coin', { n: s.castanhas });
    if (s.castanhas >= 100) { s.castanhas -= 100; addVidas(w, 1, 'castanhas'); }
  }
}

export function addVidas(w: World, n: number, motivo = 'premio') {
  game.save.vidas += n;
  bus.emit('vida', { n: game.save.vidas, ganho: n, motivo });
  w.sfx('vida');
  const l = w.duo.leader;
  w.text(n > 1 ? `+${n} VIDAS!` : '+1 VIDA!', l.x, l.y - l.h - 30);
}

export function addParafusos(w: World, n: number) {
  game.save.parafusos += n;
  bus.emit('parafuso', { n });
}

/** Fichas de montaria guardadas no save (totais `ficha-<m>`). */
export function addFicha(w: World, m: string) {
  const k = `ficha-${m}`;
  game.save.totals[k] = (game.save.totals[k] ?? 0) + 1;
  bus.emit('ficha', { m, n: game.save.totals[k] });
  if (game.save.totals[k] % 3 === 0) w.toast(`3 fichas: sala bônus da montaria liberada!`, 'ficha');
}

const FICHA_MUNDO: Record<number, string> = { 1: 'ema', 2: 'tatu', 3: 'pirarucu', 4: 'ema', 5: 'ema' };

/** Modelo/animação que representa um prêmio ('castanhas:20', 'vida:1', 'parafusos:5', 'ficha'). */
export function prizeVisual(p: string): { model: string; anim: string; variant?: string; label: string } {
  const [k, v] = p.split(':');
  const n = Number(v ?? 1);
  switch (k) {
    case 'castanhas': return { model: n >= 10 ? 'cacho' : 'castanha', anim: 'girar', label: n > 0 ? `+${n} castanhas` : 'castanhas!' };
    case 'vida': return { model: 'pena', anim: 'idle', label: n > 1 ? `+${n} vidas` : '+1 vida' };
    case 'parafusos': return { model: 'parafuso', anim: 'girar', label: `+${n} parafusos` };
    case 'ficha': return { model: 'ficha', anim: 'girar', variant: v, label: 'Ficha de Montaria' };
    default: return { model: 'castanha', anim: 'girar', label: p };
  }
}

/** Entrega um prêmio da tabela autoral. */
export function grantPrize(w: World, p: string) {
  const [k, v] = p.split(':');
  const n = Number(v ?? 1);
  switch (k) {
    case 'castanhas': if (n > 0) { addCastanhas(w, n); w.sfx('cacho'); } break;
    case 'vida': addVidas(w, n); break;
    case 'parafusos': addParafusos(w, n); w.sfx('parafuso'); break;
    case 'ficha': addFicha(w, v ?? FICHA_MUNDO[w.level.mundo] ?? 'ema'); w.sfx('ficha'); break;
  }
  bus.emit('premio', { premio: p });
}

/** Brilho leve pulsante dos segredos próximos (melhoria Faro de Tamanduá). Retorna o filtro CSS. */
export function faroFilter(e: Entity, raio = 9 * TILE): string {
  if (upgradeLevel('faro') <= 0) return '';
  const l = e.world.duo.leader;
  const d = Math.hypot(l.x - e.x, l.y - e.y);
  if (d > raio) return '';
  const k = (1 - d / raio) * (0.55 + 0.45 * Math.sin(e.world.time * 4 + e.x * 0.01));
  return `drop-shadow(0 0 ${(6 + 10 * k).toFixed(1)}px rgba(255,236,150,${(0.35 + 0.55 * k).toFixed(2)}))`;
}
/** true se o Faro deve emitir uma fagulha de dica neste quadro (segredos sem sprite). */
export function faroSpark(e: Entity, dt: number, raio = 9 * TILE): boolean {
  if (upgradeLevel('faro') <= 0) return false;
  const l = e.world.duo.leader;
  if (Math.hypot(l.x - e.x, l.y - e.y) > raio) return false;
  return Math.floor(e.world.time * 1.5) !== Math.floor((e.world.time - dt) * 1.5);
}

/** Variação de partícula (±10%) — único uso permitido de aleatoriedade. */
export const jitter = (v: number) => v * (0.9 + Math.random() * 0.2);
