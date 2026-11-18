/**
 * Terrestres: Cascavel Mola (enrola e salta em arco), Teiú Atropelador (corre e acelera),
 * Caranguejo-Alicate (anda de lado e prende o herói) e Lagarta-Trator (avança derrubando o cenário;
 * só para com 3 cabaças).
 */
import { register, type HitInfo } from '../entity';
import type { EntitySpawn } from '../types';
import { TILE } from '../types';
import type { World } from '../world';
import { Enemy } from './base';

class Cascavel extends Enemy {
  cd = 0.6;
  constructor(w: World, s: EntitySpawn) { super(w, s); this.tin = false; }
  init() { this.makeSprite(this.model, 'idle', { shadow: true }); this.makeBody(70, 44); this.setState('idle'); }
  think(dt: number) {
    this.cd -= dt;
    if (this.state === 'enrolar') {
      this.vx = 0; this.move(dt); this.play('enrolar');
      if (this.st > 0.7) {
        const dx = this.hero.x - this.x;
        const T = 0.75;
        this.vx = Math.max(-520, Math.min(520, dx / T));
        this.vy = -900;
        this.dir = dx < 0 ? -1 : 1;
        this.setState('saltar');
        this.play('saltar', { restart: true });
        if (this.body) this.body.onGround = false;
      }
      return;
    }
    if (this.state === 'saltar') {
      const vx = this.vx;
      this.move(dt);
      if (this.body?.hitWall) this.vx = -vx * 0.4; else this.vx = vx;
      if (this.onGround && this.st > 0.1) { this.vx = 0; this.setState('idle'); this.cd = 1.3; this.world.spawnFx('fx-poeira', 'aterrissar', this.x, this.y, { scale: 0.7 }); }
      return;
    }
    this.vx = 0; this.move(dt);
    this.play('idle');
    if (!this.heroHidden) this.dir = this.heroDx() < 0 ? -1 : 1;
    if (this.cd <= 0 && this.onGround && this.heroNear(7 * TILE) && Math.abs(this.heroDy()) < 3 * TILE) {
      this.setState('enrolar');
      this.play('enrolar', { restart: true });
      this.sfx('cascavel-chocalho');
    }
  }
}

class Lagarto extends Enemy {
  maxV: number;
  constructor(w: World, s: EntitySpawn) { super(w, s); this.tin = false; this.maxV = (s.vel as number) ?? 680; }
  init() { this.makeSprite(this.model, 'idle', { shadow: true }); this.makeBody(96, 48); }
  think(dt: number) {
    const dx = this.heroDx(), dy = this.heroDy();
    if (this.state === 'idle') {
      this.vx *= Math.pow(0.01, dt); this.move(dt); this.play('idle');
      if (!this.heroHidden && Math.abs(dx) < 9 * TILE && Math.abs(dy) < 2 * TILE) { this.dir = dx < 0 ? -1 : 1; this.setState('correr'); this.sfx('passo-terra'); }
      return;
    }
    // correr: acelera na direção do herói; passou dele, freia e volta
    const want = this.heroHidden ? this.dir : dx < -150 ? -1 : dx > 150 ? 1 : this.dir;
    if (want !== Math.sign(this.vx) && Math.abs(this.vx) > 40) this.vx -= Math.sign(this.vx) * 1500 * dt;
    else { this.vx += want * 950 * dt; this.dir = want as 1 | -1; }
    this.vx = Math.max(-this.maxV, Math.min(this.maxV, this.vx));
    if (this.onGround && (!this.floorAhead(Math.sign(this.vx) || this.dir, 10) || this.wallAhead(Math.sign(this.vx) || this.dir))) {
      this.vx = 0; this.dir = (this.dir * -1) as 1 | -1;
      if (this.wallAhead(-this.dir)) { this.stun(0.8); this.world.shake(2, 120); this.sfx('pisao', 0.6); }
    }
    this.move(dt);
    const sp = Math.abs(this.vx);
    this.play(sp > 260 ? 'correr' : 'andar', { speed: Math.max(0.7, sp / 400) });
    if (Math.abs(dx) > 16 * TILE) this.setState('idle');
  }
}

class Caranguejo extends Enemy {
  side = 1; cd = 0; clackT = 1.5;
  constructor(w: World, s: EntitySpawn) { super(w, s); this.touchHurts = false; this.tin = false; this.side = s.dir === 1 ? 1 : -1; }
  init() { this.makeSprite(this.model, 'andar', { shadow: true }); this.makeBody(70, 46); }
  think(dt: number) {
    this.cd -= dt; this.clackT -= dt;
    if (this.state === 'prender') {
      this.vx = 0; this.move(dt); this.play('prender');
      if (this.st > 0.8) { this.setState('idle'); this.cd = 1.8; }
      return;
    }
    if (this.onGround && (this.wallAhead(this.side) || !this.floorAhead(this.side))) this.side = -this.side;
    this.vx = this.side * 80;
    this.move(dt);
    if (this.body?.hitWall) this.side = -this.side;
    if (!this.heroHidden) this.dir = this.heroDx() < 0 ? -1 : 1;
    this.play('andar');
    if (this.clackT <= 0) { this.clackT = 2.2; this.sfxEvery('caranguejo-clique', 0.1, 0.5); }
    const L = this.hero;
    if (this.cd <= 0 && !this.heroHidden && this.touchingHero(-6) && (L.state === 'normal' || L.state === 'attack' || L.state === 'swim')) {
      this.setState('prender');
      this.play('prender', { restart: true });
      this.sfx('caranguejo-clique');
      L.pin(0.8, 'preso');
      this.world.text('NHAC!', L.x, L.y - L.h, 'small');
    }
  }
}

/** objetos de cenário que a lagarta derruba */
const SMASH = new Set(['bloco-madeira', 'parede-rachada', 'tronco', 'terra-mole', 'cabaca-pedra', 'plataforma', 'fogueira', 'arvore-chefe']);

class LagartaTrator extends Enemy {
  vel: number; hits = 0; active = false; counted = new WeakSet<object>(); stopped = false; motorT = 0; rumbleT = 0;
  constructor(w: World, s: EntitySpawn) {
    super(w, s);
    this.vel = (s.vel as number) ?? 85;
    this.canStun = false; this.activeMargin = 900;
    this.dir = s.dir === -1 ? -1 : 1;
    this.active = !!s.ativa;
  }
  init() { this.makeSprite(this.model, 'idle', { shadow: true }); this.makeBody(360, 220); this.z = 30; }
  think(dt: number) {
    if (this.stopped) { this.vx = 0; this.move(dt); this.play('parar'); this.syncSolid(); return; }
    if (!this.active) {
      this.vx = 0; this.move(dt); this.play('parar');
      if (Math.abs(this.heroDx()) < 12 * TILE) { this.active = true; this.persistent = true; this.sfx('trator-motor'); }
      return;
    }
    this.vx = this.dir * this.vel * (1 + this.hits * 0.12);
    this.move(dt);
    this.play('idle');
    this.motorT -= dt; this.rumbleT -= dt;
    if (this.motorT <= 0) { this.motorT = 1.1; this.sfx('trator-motor', 0.8); }
    if (this.rumbleT <= 0) { this.rumbleT = 0.5; if (this.onScreen(200)) this.world.shake(2, 220); }
    // derruba o cenário à frente
    const fx = this.x + this.dir * (this.w / 2 + 20);
    for (const e of this.world.entities) {
      if (e === this || e.dead || !SMASH.has(e.spawn.t)) continue;
      if (Math.abs(e.x - fx) < 50 + e.w / 2 && e.y > this.y - this.h && e.y - e.h < this.y) {
        e.onHit({ kind: 'explosao', dmg: 9, dir: this.dir, x: this.x, y: this.y, heavy: true, source: this });
        if (!e.dead) { this.world.collect(e); e.kill(); }
        this.world.spawnFx('fx-lascas', 'madeira', e.x, e.y - e.h / 2, { scale: 1.3 });
        this.world.shake(5, 260);
        this.sfx('madeira-quebrar');
      }
    }
    // atropela inimigos menores no caminho
    for (const e of this.world.enemiesNear(fx, this.y, 120)) if (e !== this && e instanceof Enemy && e.h < this.h) { e.die({ kind: 'explosao', dmg: 9, dir: this.dir, x: this.x, y: this.y, source: this }); this.world.enemyKilled(e, 'explosao'); }
  }
  onStomp(): 'kill' | 'bounce' | 'hurt' { this.sfx('clank', 0.8); return 'bounce'; }
  onHit(h: HitInfo): boolean {
    if (this.dead || this.stopped) return false;
    const cabaca = (h.weapon ?? '').startsWith('cabaca');
    if (!cabaca) { this.sfx('clank', 0.6); this.world.spawnFx('fx-faisca', 'impacto', h.x, this.y - this.h * 0.6); return true; }
    // cada cabaça conta uma vez só (a cabaça rolante pode encostar de novo)
    if (h.source) { if (this.counted.has(h.source)) return true; this.counted.add(h.source); }
    this.hits++;
    this.sprite?.flash(0.12);
    this.play('dano', { restart: true });
    this.sfx('chefe-dano', 0.8);
    this.world.shake(6, 300);
    this.world.text(`${this.hits}/3`, this.x, this.y - this.h - 20);
    if (this.hits >= 3) this.stop(h);
    return true;
  }
  stop(h: HitInfo) {
    this.stopped = true;
    this.touchHurts = false; this.stompable = false; this.team = 'neutral';
    this.persistent = false;
    this.play('parar', { restart: true });
    this.sfx('chefe-explosao', 0.7);
    this.world.spawnFx('fx-explosao', 'pequena', this.x, this.y - this.h * 0.7, { scale: 1.6 });
    this.world.spawnFx('fx-fumaca', 'derrota', this.x - 60, this.y - this.h * 0.5, { scale: 1.8 });
    this.world.enemyKilled(this, h.kind, h.weapon);
    this.solid = this.world.addSolid({ x: this.x - this.w / 2 + 20, y: this.y - this.h + 30, w: this.w - 40, h: 24, oneway: true, owner: this });
  }
  syncSolid() { if (this.solid) { this.solid.x = this.x - this.w / 2 + 20; this.solid.y = this.y - this.h + 30; } }
}

register('cascavel', (w, s) => new Cascavel(w, s));
register('lagarto', (w, s) => new Lagarto(w, s));
register('caranguejo', (w, s) => new Caranguejo(w, s));
register('lagarta-trator', (w, s) => new LagartaTrator(w, s));
