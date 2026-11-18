/**
 * As três montarias: Pirarucu (nada rápido; investida que derrota quase tudo e abre coral rachado;
 * Peixe Seco dá 10 s de investida infinita), Ema (corrida rápida, pulo duplo, chute para trás) e
 * Tatu-Canastra (rola como bola e cava terra mole).
 */
import { register, type Entity } from '../entity';
import type { EntitySpawn } from '../types';
import { TILE } from '../types';
import { input } from '../../core/input';
import { bus } from '../../core/events';
import type { Hero } from '../hero';
import type { World } from '../world';
import { Mount, fishEntityNear } from './base';

class Pirarucu extends Mount {
  dashT = 0; dashCd = 0; frenzyT = 0; trailT = 0; bubbleT = 0;
  private off: () => void;
  constructor(w: World, s: EntitySpawn) {
    super(w, s);
    this.saddleFallback = 0.9;
    this.off = bus.on('peixe-isca', (d?: { x?: number; y?: number }) => {
      if (!this.dead && d && d.x !== undefined && Math.hypot(d.x - this.x, (d.y ?? this.y) - this.y) < 6 * TILE) this.frenzy();
    });
  }
  init() { this.makeSprite('pirarucu', 'idle', { shadow: true }); this.makeBody(150, 62); this.vy = -300; }
  frenzy() {
    if (this.frenzyT <= 0) { this.world.text('FÚRIA!', this.x, this.y - this.h - 30); this.sfx('pirarucu-investida'); }
    this.frenzyT = 10;
  }
  eatFish() {
    const f = fishEntityNear(this.world, this.x + this.dir * 60, this.y - this.h / 2, 90);
    if (f) { f.kill(); this.frenzy(); this.sfx('bau-mordida', 0.6); }
  }
  idle(dt: number) {
    this.eatFish();
    if (this.inWater) {
      this.vx *= Math.pow(0.1, dt);
      this.vy = Math.sin(this.st * 2) * 18;
      this.physics(dt, 0);
      this.play('idle');
    } else {
      // fora d'água: debate-se no chão
      this.vx *= Math.pow(0.2, dt);
      this.physics(dt);
      if (this.body!.onGround && this.st % 1.2 < dt) { this.vy = -380; this.vx = this.dir * 80; this.dir = (this.dir * -1) as 1 | -1; }
      this.play(this.body!.onGround ? 'idle' : 'pulo');
    }
  }
  drive(dt: number, _hero: Hero) {
    const b = this.body!;
    const ax = input.axisX();
    const ay = (input.down('down') ? 1 : 0) - (input.down('up') ? 1 : 0);
    if (this.dashCd > 0) this.dashCd -= dt;
    if (this.frenzyT > 0) { this.frenzyT -= dt; if (this.sprite) this.sprite.extraFilter = Math.floor(this.frenzyT * 8) % 2 ? 'brightness(1.35) saturate(1.4)' : ''; }
    else if (this.sprite) this.sprite.extraFilter = '';
    this.eatFish();
    const water = this.inWater;
    // investida (ação)
    if (input.pressed('action') && (this.dashCd <= 0 || this.frenzyT > 0) && this.dashT <= 0) {
      this.dashT = 0.45; this.attacking = true;
      if (ax) this.dir = ax as 1 | -1;
      this.vx = this.dir * 980; this.vy = water ? ay * 260 : this.vy;
      this.play('investida', { restart: true });
      this.sfx('pirarucu-investida');
    }
    if (this.frenzyT > 0 && input.down('action') && this.dashT <= 0.05) { this.dashT = 0.25; this.attacking = true; this.vx = this.dir * 980; }
    if (this.dashT > 0) {
      this.dashT -= dt;
      this.strike({ x: this.x + this.dir * (this.w / 2), y: this.y + 8, w: this.w * 0.7 + 50, h: this.h + 30 }, 3, this.dir);
      this.trailT -= dt;
      if (this.trailT <= 0) { this.trailT = 0.06; this.world.spawnFx('fx-rastro', 'idle', this.x - this.dir * 70, this.y - this.h / 2, { flip: this.dir < 0, alpha: 0.8 }); }
      this.physics(dt, water ? 0 : 1200);
      if (b.hitWall) { this.dashT = 0; this.world.shake(4, 160); this.sfx('pisao', 0.7); }
      if (this.dashT <= 0) { this.attacking = false; this.dashCd = 0.55; }
      return;
    }
    if (water) {
      const k = Math.min(1, dt * 4);
      this.vx += (ax * 440 - this.vx) * k;
      this.vy += (ay * 360 - this.vy) * k;
      if (ax) this.dir = ax as 1 | -1;
      // salto para fora d'água na superfície
      const surface = !this.isWater(this.x, this.y - this.h - 14);
      if (surface && input.pressed('jump')) { this.vy = -980; this.sfx('agua-sair'); this.world.spawnFx('fx-agua', 'respingo', this.x, this.y - this.h); }
      this.physics(dt, 0);
      this.play(Math.abs(this.vx) + Math.abs(this.vy) > 60 ? 'nadar' : 'idle', { speed: 0.8 + Math.abs(this.vx) / 440 });
      this.bubbleT -= dt;
      if (this.bubbleT <= 0) { this.bubbleT = 0.8; this.world.spawnFx('fx-agua', 'bolha-p', this.x + this.dir * 70, this.y - this.h, { vy: -70, life: 1.2, fade: 0.4, loop: true }); }
    } else {
      // no ar ou no chão: pouco controle, pulinhos de peixe
      this.vx += (ax * 220 - this.vx) * Math.min(1, dt * 2);
      if (ax) this.dir = ax as 1 | -1;
      if (b.onGround && input.pressed('jump')) this.vy = -560;
      const wasAir = !b.onGround;
      this.physics(dt);
      if (wasAir && this.inWater) { this.sfx('agua-entrar'); this.world.spawnFx('fx-agua', 'respingo', this.x, this.y - this.h * 0.4); this.vy *= 0.35; }
      this.play('pulo');
    }
  }
  destroy() { super.destroy(); this.off(); }
}

class Ema extends Mount {
  doubleUsed = false; coyote = 0; kickT = 0; kickDone = false; stepT = 0; trailT = 0; jumpHeld = false;
  constructor(w: World, s: EntitySpawn) { super(w, s); this.saddleFallback = 0.72; }
  init() { this.makeSprite('ema', 'idle', { shadow: true }); this.makeBody(70, 150); this.vy = -500; }
  idle(dt: number) {
    this.vx *= Math.pow(0.05, dt);
    this.physics(dt);
    this.play('idle');
    const L = this.world.duo.leader;
    if (Math.abs(L.x - this.x) > 20) this.dir = L.x < this.x ? -1 : 1;
  }
  drive(dt: number, _hero: Hero) {
    const b = this.body!;
    const ax = input.axisX();
    const maxV = 600;
    if (this.kickT > 0) this.kickT -= dt;
    if (ax) { this.vx += ax * 2600 * dt; this.dir = ax as 1 | -1; }
    else { const d = 2600 * dt; this.vx = Math.abs(this.vx) <= d ? 0 : this.vx - Math.sign(this.vx) * d; }
    this.vx = Math.max(-maxV, Math.min(maxV, this.vx));
    if (b.onGround) { this.coyote = 0.1; this.doubleUsed = false; } else this.coyote -= dt;
    if (input.pressed('jump')) {
      if (this.coyote > 0) { this.vy = -1180; this.coyote = 0; this.jumpHeld = true; this.play('pulo', { restart: true }); this.world.spawnFx('fx-poeira', 'pulo', this.x, this.y); this.sfx('pulo-lili'); }
      else if (!this.doubleUsed) { this.doubleUsed = true; this.vy = -980; this.jumpHeld = true; this.play('pulo', { restart: true }); this.world.spawnFx('fx-poeira', 'pulo', this.x, this.y, { scale: 0.7 }); this.sfx('pulo-lili', 0.8); }
    }
    if (!input.down('jump') && this.vy < 0 && this.jumpHeld) { this.vy *= 0.45; this.jumpHeld = false; }
    // chute para trás (ação)
    if (input.pressed('action') && this.kickT <= 0) { this.kickT = 0.4; this.kickDone = false; this.play('chute', { restart: true }); this.sfx('ema-chute'); }
    if (this.kickT > 0 && !this.kickDone && this.kickT < 0.3) {
      this.kickDone = true;
      this.strike({ x: this.x - this.dir * 80, y: this.y - 10, w: 120, h: 110 }, 2, -this.dir);
    }
    const water = b.inWater;
    this.physics(dt, water ? 700 : 2400, water ? 140 : 900);
    const sp = Math.abs(this.vx);
    if (this.kickT > 0) { /* animação de chute */ }
    else if (!b.onGround) this.play('pulo');
    else if (sp > 420) this.play('correr', { speed: sp / maxV });
    else if (sp > 20) this.play('andar', { speed: Math.max(0.7, sp / 300) });
    else this.play('idle');
    if (b.onGround && sp > 300) {
      this.stepT -= dt;
      if (this.stepT <= 0) { this.stepT = 0.22; this.sfx('ema-corrida', 0.5); }
      this.trailT -= dt;
      if (sp > 520 && this.trailT <= 0) { this.trailT = 0.1; this.world.spawnFx('fx-rastro', 'idle', this.x - this.dir * 50, this.y - this.h * 0.5, { flip: this.dir < 0, alpha: 0.6 }); }
    }
  }
}

class Tatu extends Mount {
  rollT = 0; digT = 0; digTarget: Entity | null = null; coyote = 0;
  constructor(w: World, s: EntitySpawn) { super(w, s); this.saddleFallback = 0.8; }
  init() { this.makeSprite('tatu', 'idle', { shadow: true }); this.makeBody(96, 70); this.vy = -400; }
  idle(dt: number) { this.vx *= Math.pow(0.05, dt); this.physics(dt); this.play('idle'); }
  softDirtNear(): Entity | null {
    for (const e of this.world.entities) {
      if (e.dead || e.spawn.t !== 'terra-mole') continue;
      const dx = e.x - this.x;
      const below = Math.abs(dx) < 60 + e.w / 2 && e.y - e.h >= this.y - 10 && e.y - e.h < this.y + 30;
      const front = Math.sign(dx) === this.dir && Math.abs(dx) < this.w / 2 + e.w / 2 + 30 && Math.abs(e.y - this.y) < 80;
      if (below || front) return e;
    }
    return null;
  }
  drive(dt: number, _hero: Hero) {
    const b = this.body!;
    const ax = input.axisX();
    if (b.onGround) this.coyote = 0.1; else this.coyote -= dt;
    // cavar
    if (this.digT > 0) {
      this.digT -= dt;
      this.vx = 0; this.physics(dt); this.play('cavar');
      if (this.digT <= 0.15 && this.digTarget) {
        const e = this.digTarget; this.digTarget = null;
        e.onHit(this.hitInfo(3, this.dir));
        this.world.spawnFx('fx-lascas', 'pedra', e.x, e.y - e.h / 2);
        this.world.shake(3, 140);
      }
      return;
    }
    if (input.pressed('action') && this.rollT <= 0) {
      const dirt = this.softDirtNear();
      if (dirt && (input.down('down') || Math.abs(dirt.x - this.x) > 20)) { this.digT = 0.6; this.digTarget = dirt; this.play('cavar', { restart: true }); this.sfx('tatu-cavar'); return; }
      this.rollT = 1.0; this.attacking = true;
      if (ax) this.dir = ax as 1 | -1;
      this.play('rolar', { restart: true });
      this.sfx('tatu-rolar');
    }
    if (input.pressed('jump') && this.coyote > 0) { this.vy = this.rollT > 0 ? -960 : -900; this.coyote = 0; this.world.spawnFx('fx-poeira', 'pulo', this.x, this.y); this.sfx('pulo-tama', 0.8); }
    if (this.rollT > 0) {
      this.rollT -= dt;
      this.vx = this.dir * 720 + ax * 60;
      this.strike({ x: this.x + this.dir * 20, y: this.y, w: this.w + 30, h: this.h + 10 }, 2, this.dir);
      this.physics(dt);
      this.play('rolar');
      if (b.hitWall) { this.rollT = 0; this.world.shake(3, 120); this.sfx('pisao', 0.6); this.vx = -this.dir * 200; }
      if (this.rollT <= 0) this.attacking = false;
      return;
    }
    if (ax) { this.vx += ax * 2200 * dt; this.dir = ax as 1 | -1; }
    else { const d = 2400 * dt; this.vx = Math.abs(this.vx) <= d ? 0 : this.vx - Math.sign(this.vx) * d; }
    this.vx = Math.max(-320, Math.min(320, this.vx));
    this.physics(dt);
    this.play(!b.onGround ? 'pulo' : Math.abs(this.vx) > 20 ? 'andar' : 'idle');
  }
}

register('pirarucu', (w, s) => new Pirarucu(w, s));
register('ema', (w, s) => new Ema(w, s));
register('tatu', (w, s) => new Tatu(w, s));
