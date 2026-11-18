/**
 * Aquáticos e do naufrágio: Piranha-Boia (padrão autoral + perseguição; vira aliada 5 s com a isca
 * de peixe), Água-Viva-Néon (vertical; intocável sem montaria), Baiacu-Bomba (infla em ciclo; só
 * pisável desinflado) e Baú-Boca (persegue na sala do naufrágio; se distrai com o Peixe Seco).
 */
import { register, type Entity, type HitInfo } from '../entity';
import type { EntitySpawn } from '../types';
import { TILE } from '../types';
import { bus } from '../../core/events';
import type { World } from '../world';
import { Enemy } from './base';

/** um peixe (arma solta ou arremessada) por perto */
function fishNear(w: World, x: number, y: number, r: number): Entity | null {
  let best: Entity | null = null, bd = r;
  for (const e of w.entities) {
    if (e.dead) continue;
    const isFish = e.grabbable === 'peixe' || ((e.spawn.t === 'arma' || e.spawn.t === 'arremessado') && e.spawn.id === 'peixe');
    if (!isFish) continue;
    const d = Math.hypot(e.x - x, e.y - y);
    if (d < bd) { bd = d; best = e; }
  }
  return best;
}

class Piranha extends Enemy {
  route: [number, number][];
  seg = 0;
  allyT = 0;
  baitCd = 0;
  private off: () => void;
  constructor(w: World, s: EntitySpawn) {
    super(w, s);
    this.tin = false;
    const r = s.rota as [number, number][] | undefined;
    this.route = r && r.length >= 2 ? r.map(([x, y]) => [x * TILE, y * TILE] as [number, number]) : [[this.x - 3 * TILE, this.y], [this.x + 3 * TILE, this.y]];
    this.off = bus.on('peixe-isca', (d?: { x?: number; y?: number }) => {
      if (this.dead) return;
      if (!d || d.x === undefined || Math.hypot(d.x - this.x, (d.y ?? this.y) - this.y) < 10 * TILE) this.befriend();
    });
  }
  init() { this.makeSprite(this.model, 'idle'); this.makeBody(60, 44); }
  befriend() {
    this.allyT = 5; this.baitCd = 8;
    this.touchHurts = false; this.stompable = false;
    this.world.spawnFx('fx-coracao', 'abraco', this.x, this.y - this.h, { scale: 0.6 });
    this.sfx('bolhas', 0.7);
  }
  think(dt: number) {
    const inWater = this.isWater(this.x, this.y - this.h / 2);
    this.flying = inWater;
    if (!inWater) { // fora d'água: debate-se e cai
      this.vx *= 0.98; this.move(dt); this.play('dano');
      if (this.onGround && this.st > 0.3) { this.vy = -380; this.vx = -this.dir * 60; this.st = 0; }
      return;
    }
    this.baitCd -= dt;
    if (this.allyT > 0) { this.allyThink(dt); return; }
    if (this.baitCd <= 0 && this.hero.held?.def.id === 'peixe' && this.heroNear(5 * TILE)) this.befriend();
    const L = this.hero;
    let tx: number, ty: number, sp: number;
    if (!this.heroHidden && (L.swimming || L.state === 'swim' || L.state === 'mounted') && this.heroNear(4 * TILE)) {
      tx = L.x; ty = L.y - L.h * 0.3; sp = 230;
    } else {
      const [px, py] = this.route[this.seg];
      tx = px; ty = py; sp = 130;
      if (Math.hypot(px - this.x, py - this.y) < 16) this.seg = (this.seg + 1) % this.route.length;
    }
    this.swimTo(tx, ty, sp, dt);
    this.play('idle', { speed: sp > 150 ? 1.6 : 1 });
  }
  swimTo(tx: number, ty: number, sp: number, dt: number) {
    const dx = tx - this.x, dy = ty - this.y, d = Math.hypot(dx, dy) || 1;
    const k = Math.min(1, dt * 4);
    this.vx += ((dx / d) * sp - this.vx) * k; this.vy += ((dy / d) * sp - this.vy) * k;
    if (Math.abs(dx) > 6) this.dir = dx < 0 ? -1 : 1;
    // não sai da água
    const nx = this.x + this.vx * dt, ny = this.y + this.vy * dt;
    if (!this.isWater(nx, ny - this.h)) this.vy = Math.max(0, this.vy);
    if (!this.isWater(nx + this.dir * this.w / 2, ny - this.h / 2)) this.vx = 0;
    this.move(dt);
  }
  allyThink(dt: number) {
    this.allyT -= dt;
    if (this.sprite) this.sprite.extraFilter = 'hue-rotate(110deg) saturate(1.5)';
    let target: Entity | null = null, bd = 6 * TILE;
    for (const e of this.world.enemiesNear(this.x, this.y, 6 * TILE)) {
      if (e === this || (e instanceof Piranha && e.allyT > 0)) continue;
      const d = Math.hypot(e.x - this.x, e.y - this.y);
      if (d < bd) { bd = d; target = e; }
    }
    if (target) {
      this.swimTo(target.x, target.y - target.h / 2, 300, dt);
      if (bd < (target.w + this.w) / 2 + 6) {
        target.onHit({ kind: 'outro', dmg: 1, dir: this.dir, x: this.x, y: this.y, source: this });
        this.sfx('bau-mordida', 0.6);
        if (target.dead) this.world.enemyKilled(target, 'outro');
      }
    } else this.swimTo(this.hero.x - this.hero.dir * 60, this.hero.y - this.hero.h * 0.6, 260, dt);
    this.play('idle', { speed: 1.5 });
    if (this.allyT <= 0) { this.touchHurts = true; this.stompable = true; if (this.sprite) this.sprite.extraFilter = ''; }
  }
  onHit(h: HitInfo) { if (this.allyT > 0) return false; return super.onHit(h); }
  destroy() { super.destroy(); this.off(); }
}

class AguaViva extends Enemy {
  y0: number; amp: number; t: number;
  constructor(w: World, s: EntitySpawn) {
    super(w, s);
    this.flying = true; this.tin = false; this.canStun = false;
    this.y0 = this.y; this.amp = ((s.amp as number) ?? 1.5) * TILE;
    this.t = (s.fase as number) ?? 0;
  }
  init() { this.makeSprite(this.model, 'idle'); this.makeBody(56, 70); }
  think(dt: number) {
    this.t += dt;
    const ty = this.y0 + Math.sin(this.t * (Math.PI * 2) / 3) * this.amp;
    this.vx = 0; this.vy = (ty - this.y) / Math.max(dt, 1e-3);
    this.move(dt);
    this.play('idle');
  }
  // intocável sem montaria
  onStomp(hero: Entity): 'kill' | 'bounce' | 'hurt' {
    if ((hero as unknown as { state?: string }).state === 'mounted') { this.die({ kind: 'montaria', dmg: 1, dir: 0, x: this.x, y: this.y }, true); return 'kill'; }
    return 'hurt';
  }
  onHit(h: HitInfo) {
    if (this.dead) return false;
    if (h.kind === 'montaria' || h.kind === 'explosao') return this.damage(h);
    return false;
  }
  light() { return { x: this.x, y: this.y - this.h * 0.5, r: 90, flicker: 0.12 }; }
}

class Baiacu extends Enemy {
  cycle = 0; x0: number;
  constructor(w: World, s: EntitySpawn) { super(w, s); this.tin = false; this.flying = true; this.x0 = this.x; this.cycle = (s.fase as number) ?? 0; }
  init() { this.makeSprite(this.model, 'idle'); this.makeBody(60, 52); }
  get puffed() { return this.state === 'inflado' || this.state === 'inflar'; }
  think(dt: number) {
    const inWater = this.isWater(this.x, this.y - this.h / 2);
    this.flying = inWater;
    this.cycle += dt;
    switch (this.state) {
      case 'inflar':
        this.play('inflar'); this.vx = 0; this.vy = 0;
        if (this.st > 0.4) this.setState('inflado');
        break;
      case 'inflado':
        this.play('inflado'); this.vx = 0; this.vy = Math.sin(this.st * 3) * 20;
        if (this.st > 1.8) { this.setState('desinflar'); this.setSize(false); }
        break;
      case 'desinflar':
        this.play('desinflar'); this.vx = 0; this.vy = 0;
        if (this.st > 0.4) this.setState('idle');
        break;
      default:
        this.play('idle');
        if ((this.x > this.x0 + 2 * TILE && this.dir > 0) || (this.x < this.x0 - 2 * TILE && this.dir < 0)) this.dir = (this.dir * -1) as 1 | -1;
        this.vx = this.dir * 60; this.vy = Math.sin(this.cycle * 2) * 16;
        if (this.st > 2.2) { this.setState('inflar'); this.setSize(true); this.sfx('baiacu-inflar'); }
    }
    this.move(dt);
  }
  setSize(big: boolean) {
    const cy = this.y - this.h / 2;
    this.w = big ? 104 : 60; this.h = big ? 100 : 52;
    this.y = cy + this.h / 2;
    if (this.body) { this.body.w = this.w; this.body.h = this.h; this.body.y = this.y; }
  }
  onStomp(): 'kill' | 'bounce' | 'hurt' {
    if (this.puffed) return 'hurt';
    this.die({ kind: 'pisao', dmg: 1, dir: 0, x: this.x, y: this.y }, true);
    return 'kill';
  }
  onHit(h: HitInfo) {
    if (this.dead) return false;
    if (this.puffed && h.kind !== 'montaria' && h.kind !== 'explosao') {
      this.sfx('clank', 0.5);
      this.world.spawnFx('fx-faisca', 'impacto', h.x + (this.x - h.x) * 0.5, this.y - this.h / 2);
      return true;
    }
    return super.onHit(h);
  }
}

class BauBoca extends Enemy {
  bait: Entity | null = null;
  baitX: number | null = null;
  hopT = 0; biteCd = 0;
  private off: () => void;
  constructor(w: World, s: EntitySpawn) {
    super(w, s);
    this.hp = 2; this.activeMargin = 600; this.tin = false;
    this.off = bus.on('peixe-isca', (d?: { x?: number; y?: number }) => {
      if (this.dead || !d || d.x === undefined) return;
      if (Math.abs(d.x - this.x) < 12 * TILE) { this.baitX = d.x; this.setState('isca'); }
    });
  }
  init() { this.makeSprite(this.model, 'idle', { shadow: true }); this.makeBody(96, 84); }
  think(dt: number) {
    this.biteCd -= dt;
    // peixe por perto distrai
    if (this.state !== 'comer') {
      const f = fishNear(this.world, this.x, this.y, 9 * TILE);
      if (f) { this.bait = f; if (this.state !== 'isca') this.setState('isca'); }
    }
    switch (this.state) {
      case 'idle':
        this.vx = 0; this.move(dt); this.play('idle');
        if (this.heroNear(7 * TILE)) { this.setState('perseguir'); this.sfx('bau-mordida', 0.7); }
        return;
      case 'isca': {
        const tx = this.bait && !this.bait.dead ? this.bait.x : this.baitX;
        if (tx === null) { this.setState('idle'); return; }
        const dx = tx - this.x;
        this.dir = dx < 0 ? -1 : 1;
        if (Math.abs(dx) < 40) {
          if (this.bait && !this.bait.dead) this.bait.kill();
          this.bait = null; this.baitX = null;
          this.setState('comer'); this.vx = 0;
          this.touchHurts = false;
          this.play('comer-peixe', { restart: true });
          this.sfx('bau-mordida');
          return;
        }
        this.hop(dt, 300);
        this.play('perseguir', { speed: 1.2 });
        return;
      }
      case 'comer':
        this.vx = 0; this.move(dt); this.play('comer-peixe');
        if (this.st > 4) { this.touchHurts = true; this.setState('perseguir'); }
        return;
      case 'morder':
        this.vx *= Math.pow(0.05, dt); this.move(dt); this.play('morder');
        if (this.st > 0.18 && this.st - dt <= 0.18) { this.sfx('bau-mordida'); this.hitHero({ x: this.x + this.dir * 60, y: this.y, w: 90, h: 90 }); }
        if (this.st > 0.5) { this.biteCd = 0.9; this.setState('perseguir'); }
        return;
      default: { // perseguir
        if (this.heroHidden) { this.setState('idle'); return; }
        const dx = this.heroDx();
        this.dir = dx < 0 ? -1 : 1;
        if (Math.abs(dx) < 110 && Math.abs(this.heroDy()) < 100 && this.biteCd <= 0) { this.setState('morder'); this.play('morder', { restart: true }); this.vx = this.dir * 260; return; }
        this.hop(dt, 240);
        this.play('perseguir');
        if (Math.abs(dx) > 14 * TILE) this.setState('idle');
      }
    }
  }
  hop(dt: number, sp: number) {
    this.vx = this.dir * sp;
    this.hopT -= dt;
    if (this.onGround && this.hopT <= 0) { this.vy = -360; this.hopT = 0.45; this.sfx('passo-madeira', 0.5); }
    this.move(dt);
  }
  onStomp(): 'kill' | 'bounce' | 'hurt' {
    if (this.state === 'comer' || this.stunT > 0) { this.die({ kind: 'pisao', dmg: 2, dir: 0, x: this.x, y: this.y }, true); return 'kill'; }
    this.stun(1.5);
    this.sfx('madeira-quebrar', 0.6);
    return 'bounce';
  }
  onHit(h: HitInfo) {
    if (this.dead) return false;
    if (h.kind === 'explosao' || h.kind === 'montaria' || this.state === 'comer' || this.stunT > 0) return super.onHit(h);
    // tampa fechada: o golpe só empurra
    this.vx = h.dir * 200; this.sprite?.flash(0.06); this.sfx('madeira-quebrar', 0.5);
    return true;
  }
  onDeath() { this.world.spawnFx('fx-lascas', 'madeira', this.x, this.y - this.h / 2, { scale: 1.4 }); this.sfx('madeira-quebrar'); }
  destroy() { super.destroy(); this.off(); }
}

register('piranha', (w, s) => new Piranha(w, s));
register('agua-viva', (w, s) => new AguaViva(w, s));
register('baiacu', (w, s) => new Baiacu(w, s));
register('bau-boca', (w, s) => new BauBoca(w, s));
