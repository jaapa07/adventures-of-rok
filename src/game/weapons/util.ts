/**
 * Utilidades de armas para outros módulos (inimigos que pegam armas do chão, desarmes, eventos).
 */
import type { World } from '../world';
import type { Entity } from '../entity';
import { TILE } from '../types';
import { WeaponGround } from './arma';
import { WEAPONS } from './types';

/** Arma solta (entidade `arma`) mais próxima de (x, y) dentro do raio r (px), ou null. */
export function pickableWeaponNear(world: World, x: number, y: number, r: number): WeaponGround | null {
  let best: WeaponGround | null = null, bd = r;
  for (const e of world.entities) {
    if (e.dead || !(e instanceof WeaponGround)) continue;
    const d = Math.hypot(e.x - x, e.y - y);
    if (d <= bd) { bd = d; best = e; }
  }
  return best;
}

/** Retira a arma do chão (para um inimigo empunhar). Retorna id e usos, ou null se já sumiu. */
export function takeWeapon(e: WeaponGround): { id: string; usos: number } | null {
  if (e.dead) return null;
  e.kill();
  e.world.sfx('arma-pegar', e.x, 0.6);
  return { id: e.wid, usos: e.usosRestantes() };
}

/** Faz uma arma voar e cair no chão (desarme de Javalim: a arma cai para o jogador). */
export function spawnFlyingWeapon(world: World, id: string, x: number, y: number, vx: number, vy: number, usos?: number): Entity | null {
  const e = world.spawn({ t: 'arma', id, x: x / TILE, y: y / TILE, vx, vy, ...(usos !== undefined ? { usos } : {}) });
  return e;
}

/** A arma existe no arsenal? */
export const isWeapon = (id: string) => !!WEAPONS[id];

/** Inimigos considerados mecânicos (a Chave Inglesa desmonta em 1 golpe e solta parafusos). */
export const MECANICOS = new Set(['serrote', 'lagarta-trator', 'serra-gigante']);
export function isMecanico(e: Entity) { return MECANICOS.has(e.spawn.t) || !!(e as unknown as { mecanico?: boolean }).mecanico; }
