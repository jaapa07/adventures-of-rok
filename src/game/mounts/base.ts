/**
 * Base das montarias (seção 7.2). Implementa Rideable (hero.ts): o herói monta ao encostar ou
 * pular em cima, a montaria assume o controle (controlUpdate), levar dano desmonta e a montaria
 * foge; desmontar voluntário com o botão de troca. O herói é desenhado na âncora `sela`.
 */
import { Entity, type HitInfo } from '../entity';
import type { EntitySpawn } from '../types';
import { T } from '../physics';
import { input } from '../../core/input';
import type { Hero, Rideable } from '../hero';
import type { World } from '../world';

export abstract class Mount extends Entity implements Rideable {
  rider: Hero | null = null;
  mstate: 'livre' | 'montada' | 'fugindo' = 'livre';
  remountCd = 0.4;
  fleeT = 0;
  st = 0;
  /** atacando (investida, rolamento): não leva dano de contato */
  attacking = false;
  saddleFallback = 0.75;
  riderSink = 14;

  constructor(w: World, s: EntitySpawn) {
    super(w, s);
    this.team = 'neutral';
    this.z = 38;
    this.activeMargin = 500;
  }

  get anim() { return this.sprite?.animName ?? ''; }
  play(a: string, o: { restart?: boolean; speed?: number } = {}) { this.sprite?.play(a, o); }
  isWater(x: number, y: number) { const t = this.world.grid.atPx(x, y); return t === T.WATER || t === T.WATER_VINE; }
  get inWater() { return this.isWater(this.x, this.y - this.h * 0.5); }

  update(dt: number) {
    this.st += dt;
    if (this.remountCd > 0) this.remountCd -= dt;
    if (this.sprite) {
      this.sprite.sx += (1 - this.sprite.sx) * Math.min(1, dt * 10);
      this.sprite.sy += (1 - this.sprite.sy) * Math.min(1, dt * 10);
      this.sprite.update(dt);
    }
    if (this.mstate === 'montada') {
      // o controle acontece em controlUpdate (chamado pelo herói); aqui só garante o vínculo
      if (!this.rider || this.rider.mount !== this || this.rider.state !== 'mounted') { this.rider = null; this.mstate = 'livre'; this.persistent = false; }
      return;
    }
    if (this.mstate === 'fugindo') { this.updateFlee(dt); return; }
    this.idle(dt);
    // monta ao encostar ou cair em cima
    const L = this.world.duo.leader;
    if (this.remountCd <= 0 && L.state !== 'dead' && L.state !== 'hurt' && L.state !== 'mounted' && L.state !== 'cutscene' && L.state !== 'pinned') {
      const over = Math.abs(L.x - this.x) < (L.w + this.w) / 2 && L.y > this.y - this.h - 12 && L.y - L.h < this.y;
      if (over && (L.b.vy >= 0 || L.state === 'swim')) L.rideOn(this);
    }
    if (this.y > this.world.grid.pxH + 200) this.dead = true;
  }

  /** comportamento solto (esperando o herói) */
  abstract idle(dt: number): void;
  /** controle com o herói montado */
  abstract drive(dt: number, hero: Hero): void;

  updateFlee(dt: number) {
    this.fleeT += dt;
    this.vx = this.dir * 520;
    this.play(this.fleeT < 0.3 ? 'dano' : this.inWater ? 'nadar' : this.sprite?.has('correr') ? 'correr' : 'andar', { speed: 1.4 });
    this.physics(dt, this.inWater ? 0 : 2400);
    if (this.body?.hitWall) this.dir = (this.dir * -1) as 1 | -1;
    if (this.sprite) this.sprite.alpha = Math.max(0, 1 - Math.max(0, this.fleeT - 1) / 0.8);
    if (this.fleeT > 1.8) this.dead = true;
  }

  /* ---------------- Rideable ---------------- */
  ride(hero: Hero) {
    this.rider = hero;
    this.mstate = 'montada';
    this.persistent = true;
    this.dir = hero.dir;
    this.vx = 0;
    this.play('idle');
    if (this.sprite) { this.sprite.sy = 0.85; this.sprite.sx = 1.12; }
  }
  controlUpdate(dt: number, hero: Hero) {
    if (input.released('swap') || input.pressed('drop')) { this.dismount(hero, false); return; }
    this.drive(dt, hero);
    if (this.mstate !== 'montada') return;
    this.contact(hero);
    if (this.y > this.world.grid.pxH + 120) { this.dismount(hero, false); this.dead = true; }
  }
  dismount(hero: Hero, hurt: boolean) {
    if (this.rider !== hero) return;
    this.rider = null;
    this.attacking = false;
    hero.leaveMount();
    this.world.duo.swapCooldown = 0.6; // soltar o botão de troca não troca a dupla
    if (hurt) {
      this.mstate = 'fugindo'; this.fleeT = 0;
      this.dir = (this.dir * -1) as 1 | -1;
      this.vy = -420;
      this.sprite?.flash(0.1);
      this.play('dano', { restart: true });
      this.sfx('desmontar');
    } else {
      this.mstate = 'livre'; this.remountCd = 0.8; this.persistent = false;
      this.play('desmontar', { restart: true });
    }
  }
  saddle(): [number, number] {
    const s = this.sprite;
    if (s) { s.x = this.x; s.y = this.y; s.flip = this.dir < 0; }
    const a = s?.anchor('sela');
    // o herói afunda um pouco na sela (pernas dos lados do corpo da montaria)
    return a ? [a[0], a[1] + this.riderSink] : [this.x, this.y - this.h * this.saddleFallback + this.riderSink];
  }
  riderZ() { return this.z + 2; }

  /* ---------------- contato com inimigos e perigos ---------------- */
  contact(hero: Hero) {
    const b = this.body!;
    const g = this.world.grid;
    if (hero.invuln <= 0) {
      const t1 = g.atPx(this.x - this.w / 3, this.y - 4), t2 = g.atPx(this.x + this.w / 3, this.y - 4), t3 = g.atPx(this.x, this.y + 2);
      if (t1 === T.SPIKE || t2 === T.SPIKE || (t3 === T.SPIKE && b.vy >= 0)) { hero.hurt({ kind: 'outro', dmg: 1, dir: -this.dir, x: this.x, y: this.y }); return; }
    }
    for (const e of this.world.entities) {
      if (e.dead || e.team !== 'enemy') continue;
      const top = e.y - e.h;
      const overlapX = Math.abs(e.x - this.x) < (e.w + this.w) / 2 - 6;
      if (!overlapX || this.y - this.h > e.y || this.y < top - 4) continue;
      // pisão da montaria
      if (b.vy > 60 && e.stompable && this.y <= top + Math.max(26, b.vy * 0.04)) {
        const r = e.onStomp(hero, true);
        if (r === 'hurt') { hero.hurt({ kind: 'outro', dmg: 1, dir: Math.sign(this.x - e.x) || 1, x: e.x, y: e.y, source: e }); return; }
        this.sfx(r === 'kill' ? 'pisao-forte' : 'pisao');
        this.world.spawnFx('fx-faisca', 'impacto', e.x, top);
        if (r === 'kill') { this.world.hitstop(60); if (e.dead) this.world.enemyKilled(e, 'montaria', this.spawn.t); }
        this.y = top; b.y = top; this.vy = -680; b.vy = -680; b.onGround = false;
        return;
      }
      if (e.spawn.t === 'agua-viva') { // intocável sem montaria: a montaria a desfaz
        if (e.onHit(this.hitInfo(1, Math.sign(e.x - this.x) || this.dir)) && e.dead) this.world.enemyKilled(e, 'montaria', this.spawn.t);
        continue;
      }
      if (this.attacking) continue;
      if (e.touchHurts && hero.disguiseT <= 0 && hero.invuln <= 0) { hero.hurt({ kind: 'outro', dmg: 1, dir: Math.sign(this.x - e.x) || 1, x: e.x, y: e.y, source: e }); return; }
    }
  }
  hitInfo(dmg: number, dir: number): HitInfo {
    return { kind: 'montaria', dmg, dir, x: this.x, y: this.y, heavy: true, weapon: this.spawn.t, source: this };
  }
  /** golpe da montaria numa área (inimigos e objetos quebráveis) */
  strike(area: { x: number; y: number; w: number; h: number }, dmg: number, dir: number) {
    const hits = this.world.hitArea(area, this.hitInfo(dmg, dir), (e) => (e.team === 'enemy' || e.team === 'neutral') && e !== this && e !== this.rider);
    for (const e of hits) if (e.dead && e.team === 'enemy') this.world.enemyKilled(e, 'montaria', this.spawn.t);
    if (hits.length) { this.world.spawnFx('fx-faisca', 'impacto', area.x, area.y - area.h / 2); this.world.hitstop(50); }
    return hits;
  }

  render(a: number) {
    if (this.sprite) this.sprite.groundY = this.mstate === 'fugindo' || this.inWater ? null : this.y;
    super.render(a);
  }
}

/** peixe solto/arremessado por perto (Peixe Seco + Pirarucu) */
export function fishEntityNear(w: World, x: number, y: number, r: number): Entity | null {
  for (const e of w.entities) {
    if (e.dead) continue;
    const isFish = e.grabbable === 'peixe' || ((e.spawn.t === 'arma' || e.spawn.t === 'arremessado') && e.spawn.id === 'peixe');
    if (isFish && Math.hypot(e.x - x, e.y - y) < r) return e;
  }
  return null;
}
