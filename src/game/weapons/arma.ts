/**
 * Arma solta no chão (`arma` {id}). O herói pega com J (grabbable); os inimigos podem pegar
 * via `pickableWeaponNear`/`takeWeapon` (util.ts). Também nasce voando quando um inimigo é desarmado.
 */
import { Entity, register } from '../entity';
import type { World } from '../world';
import type { EntitySpawn } from '../types';
import { WEAPONS } from './types';
import { upgradeLevel } from '../progress';

export class WeaponGround extends Entity {
  wid: string;
  usos?: number;
  private flying = false;
  private landT = 0;
  constructor(w: World, s: EntitySpawn) {
    super(w, s);
    this.wid = String(s.id ?? 'galho');
    this.grabbable = this.wid;
    this.team = 'pickup';
    const def = WEAPONS[this.wid];
    this.heavy = def?.peso === 'pesado';
    if (typeof s.usos === 'number') this.usos = s.usos;
    if (typeof s.vx === 'number' || typeof s.vy === 'number') { this.flying = true; this.vx = (s.vx as number) ?? 0; this.vy = (s.vy as number) ?? -500; }
  }
  init() {
    const def = WEAPONS[this.wid];
    this.makeSprite(def?.model ?? `arma-${this.wid}`, 'mundo', { shadow: true });
    if (this.flying) this.sprite!.play('voando');
    this.makeBody(56, 30);
  }
  /** usos restantes para quem pegar */
  usosRestantes() {
    const def = WEAPONS[this.wid];
    if (!def) return 1;
    return this.usos ?? def.usos + (def.usos !== Infinity ? upgradeLevel('maos') : 0);
  }
  update(dt: number) {
    const wasGround = this.body!.onGround;
    this.physics(dt, 2000, 900);
    if (this.body!.onGround) {
      this.vx *= 0.7;
      if (!wasGround) {
        if (this.flying) { this.flying = false; this.sprite!.play('mundo'); this.sfx('golpe-leve', 0.5); this.world.spawnFx('fx-poeira', 'aterrissar', this.x, this.y, { scale: 0.5 }); }
        this.landT = 0.15;
      }
    }
    if (this.body!.inWater && !this.flying) { this.vy = Math.min(this.vy, 60); }
    if (this.y > this.world.grid.pxH + 200) this.kill();
    if (this.landT > 0) this.landT -= dt;
    this.sprite!.update(dt);
  }
  render(a: number) {
    if (this.sprite) {
      this.sprite.groundY = this.y;
      const s = this.landT > 0 ? 1 + this.landT : 1;
      this.sprite.sx = s; this.sprite.sy = 2 - s;
    }
    super.render(a);
  }
}

register('arma', (w, s) => new WeaponGround(w, s));
