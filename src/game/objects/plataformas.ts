/**
 * Plataformas e veículos: Tronco flutuante (afunda com peso, pode seguir trilho), Plataforma móvel {path, vel},
 * Canoa (o herói embarca e rema), Carrinho de Mina (corrida sobre trilhos com pulo) e Serra Gigante {path}.
 */
import { Entity, register, type HitInfo } from '../entity';
import type { World } from '../world';
import type { EntitySpawn } from '../types';
import { TILE } from '../types';
import type { Hero, Rideable } from '../hero';
import { T, type Solid } from '../physics';
import { input } from '../../core/input';
import { bus } from '../../core/events';
import { jitter } from '../pickups/common';
import { ensureObjectCss } from './css';

/** Percurso ida-e-volta por uma polilinha (em px). */
class Percurso {
  pts: [number, number][];
  seg = 0; t = 0; fwd = true;
  constructor(path: unknown, x: number, y: number) {
    const p = Array.isArray(path) ? (path as [number, number][]).map(([a, b]) => [a * TILE, b * TILE] as [number, number]) : [];
    this.pts = p.length >= 2 ? p : [[x, y]];
  }
  get moving() { return this.pts.length >= 2; }
  /** avança `d` px e retorna a nova posição */
  step(d: number): [number, number] {
    if (!this.moving) return this.pts[0];
    while (d > 0) {
      const a = this.pts[this.seg], b = this.pts[this.seg + 1];
      const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
      const pos = this.t * len;
      const rest = this.fwd ? len - pos : pos;
      if (d < rest) { this.t += (this.fwd ? d : -d) / len; d = 0; }
      else {
        d -= rest;
        if (this.fwd) { if (this.seg < this.pts.length - 2) { this.seg++; this.t = 0; } else { this.fwd = false; this.t = 1; } }
        else { if (this.seg > 0) { this.seg--; this.t = 1; } else { this.fwd = true; this.t = 0; } }
      }
    }
    const a = this.pts[this.seg], b = this.pts[this.seg + 1];
    return [a[0] + (b[0] - a[0]) * this.t, a[1] + (b[1] - a[1]) * this.t];
  }
}

const isWater = (t: T) => t === T.WATER || t === T.WATER_VINE;
function riders(w: World, s: Solid): Hero[] {
  const out: Hero[] = [];
  for (const h of [w.duo.leader, w.duo.partner]) if (h && h.b.groundSolid === s) out.push(h);
  return out;
}

/* ------------------------------------------------------------------ */
/* Tronco flutuante                                                     */
/* ------------------------------------------------------------------ */
export class Tronco extends Entity {
  afunda: boolean;
  depth = 0;
  private baseY: number;
  private rota: Percurso;
  private vel: number;
  private wasLoaded = false;
  constructor(w: World, s: EntitySpawn) {
    super(w, s);
    this.afunda = !!s.afunda;
    this.w = 200; this.h = 40; this.z = 24;
    this.baseY = this.y;
    this.rota = new Percurso(s.path, this.x, this.y);
    this.vel = Number(s.vel ?? 70);
    this.solid = w.addSolid({ x: this.x - this.w / 2, y: this.y - 22, w: this.w, h: 22, oneway: true, owner: this });
    this.tag = s.tag as string | undefined;
  }
  init() { this.makeSprite('tronco', 'idle', {}); }
  update(dt: number) {
    const s = this.solid!;
    const load = riders(this.world, s).length;
    const ox = this.x, oy = this.y;
    let target = 0;
    if (load) target = this.afunda ? 110 : 8 * load;
    const sink = this.afunda ? 55 : 120;
    this.depth += Math.max(-sink * 2 * dt, Math.min(sink * dt, target - this.depth));
    if (load && !this.wasLoaded) { this.sfx('passo-madeira', 0.6); this.world.spawnFx('fx-agua', 'respingo', this.x, this.baseY, { scale: 0.7 }); }
    this.wasLoaded = load > 0;
    if (this.rota.moving && !(this as unknown as { desligado?: boolean }).desligado) {
      const [nx, ny] = this.rota.step(this.vel * dt);
      this.x = nx; this.baseY = ny;
    }
    this.y = this.baseY + this.depth + Math.sin(this.world.time * 2 + this.spawn.x) * 3;
    s.x = this.x - this.w / 2; s.y = this.y - 22;
    s.vx = (this.x - ox) / dt; s.vy = (this.y - oy) / dt;
    if (this.sprite) {
      const want = this.afunda && load ? 'afundar' : 'idle';
      if (this.sprite.animName !== want) this.sprite.play(want);
      this.sprite.update(dt);
    }
  }
}

/* ------------------------------------------------------------------ */
/* Plataforma móvel (desenhada com os tiles de plataforma do tileset)   */
/* ------------------------------------------------------------------ */
export class Plataforma extends Entity {
  private rota: Percurso;
  private vel: number;
  private el: HTMLDivElement;
  desligado = false;
  constructor(w: World, s: EntitySpawn) {
    super(w, s);
    ensureObjectCss();
    const n = Math.max(1, Math.round(Number(s.w ?? 3)));
    this.w = n * TILE; this.h = 24; this.z = 22;
    this.rota = new Percurso(s.path, this.x, this.y);
    const p0 = this.rota.pts[0];
    if (this.rota.moving) { this.x = p0[0]; this.y = p0[1]; }
    this.vel = Number(s.vel ?? 120);
    this.persistent = true;
    this.tag = s.tag as string | undefined;
    this.solid = w.addSolid({ x: this.x - this.w / 2, y: this.y, w: this.w, h: 24, oneway: s.solido ? false : true, owner: this });
    this.el = document.createElement('div');
    this.el.className = 'plataforma-movel';
    this.el.style.width = this.w + 'px';
    const ts = w.level.tileset;
    for (let i = 0; i < n; i++) {
      const d = document.createElement('div');
      const nome = n === 1 ? 'plat-s' : i === 0 ? 'plat-l' : i === n - 1 ? 'plat-r' : 'plat-m';
      d.style.left = i * TILE - 16 + 'px';
      d.style.backgroundImage = `url(assets/tiles/${ts}/${nome}.webp)`;
      this.el.append(d);
    }
    w.stage.entities.append(this.el);
  }
  desligar() { this.desligado = true; }
  update(dt: number) {
    const ox = this.x, oy = this.y;
    if (!this.desligado) { const [nx, ny] = this.rota.step(this.vel * dt); this.x = nx; this.y = ny; }
    const s = this.solid!;
    s.x = this.x - this.w / 2; s.y = this.y;
    s.vx = (this.x - ox) / dt; s.vy = (this.y - oy) / dt;
  }
  render() {
    this.el.style.transform = `translate3d(${(this.x - this.w / 2).toFixed(1)}px, ${this.y.toFixed(1)}px, 0)`;
    this.el.style.zIndex = String(this.z);
  }
  destroy() { super.destroy(); this.el.remove(); }
}

/* ------------------------------------------------------------------ */
/* Canoa: o herói embarca (ação ou caindo dentro) e rema com ← →        */
/* ------------------------------------------------------------------ */
export class Canoa extends Entity implements Rideable {
  rider: Hero | null = null;
  private surfaceY: number;
  private splashT = 0;
  private cd = 0;
  constructor(w: World, s: EntitySpawn) {
    super(w, s);
    this.w = 230; this.h = 50; this.z = 42;
    this.surfaceY = this.y;
    this.persistent = true;
    this.tag = s.tag as string | undefined;
  }
  init() { this.makeSprite('canoa', 'idle', {}); }
  private waterAt(x: number) { return isWater(this.world.grid.atPx(x, this.surfaceY + 12)); }
  onInteract(h: Entity) {
    const hero = h as Hero;
    if (this.rider || this.cd > 0 || hero.state !== 'normal') return false;
    hero.rideOn(this);
    return true;
  }
  ride(hero: Hero) { this.rider = hero; this.sprite?.play('remar'); bus.emit('canoa', { hero: hero.hid }); }
  controlUpdate(dt: number, hero: Hero) {
    const ax = input.axisX();
    const corr = this.world.regionFlags.correnteza ?? 0;
    this.vx += (ax * 320 + corr - this.vx) * Math.min(1, dt * 2.2);
    if (ax) this.dir = ax as 1 | -1;
    const nx = this.x + this.vx * dt;
    if (this.waterAt(nx + Math.sign(this.vx) * this.w * 0.45)) this.x = nx; else this.vx = 0;
    if (Math.abs(this.vx) > 40) {
      this.splashT -= dt;
      if (this.splashT <= 0) { this.splashT = 0.45; this.sfx('remo-surf', 0.4); this.world.spawnFx('fx-agua', 'respingo', this.x - this.dir * 70, this.surfaceY, { scale: jitter(0.5) }); }
    }
    if (input.pressed('jump') || input.pressed('drop')) this.dismount(hero, false);
  }
  dismount(hero: Hero, hurt: boolean) {
    if (!this.rider) return;
    this.rider = null; this.cd = 0.6;
    hero.leaveMount();
    if (hurt) hero.b.vx = -this.dir * 200;
    this.sprite?.play('idle');
  }
  saddle(): [number, number] {
    const a = this.sprite?.anchor('sela');
    return a ? [a[0], a[1]] : [this.x, this.y - 14];
  }
  riderZ() { return this.z - 2; }
  update(dt: number) {
    if (this.cd > 0) this.cd -= dt;
    if (!this.rider) {
      this.vx *= Math.pow(0.3, dt);
      const corr = this.world.regionFlags.correnteza ?? 0;
      const nx = this.x + (this.vx + corr * 0.5) * dt;
      if (this.waterAt(nx + Math.sign(this.vx || corr) * this.w * 0.45)) this.x = nx;
      // cair dentro da canoa também embarca
      const L = this.world.duo.leader;
      if (this.cd <= 0 && L.state === 'normal' && L.b.vy > 100 && Math.abs(L.x - this.x) < this.w * 0.35 && Math.abs(L.y - this.y) < 30) L.rideOn(this);
    }
    this.y = this.surfaceY + Math.sin(this.world.time * 2.1) * 3;
    this.sprite?.update(dt);
  }
}

/* ------------------------------------------------------------------ */
/* Carrinho de mina                                                     */
/* ------------------------------------------------------------------ */
export class Carrinho extends Entity implements Rideable {
  rider: Hero | null = null;
  private trilhoT = 0;
  private cd = 0;
  private airT = 0;
  constructor(w: World, s: EntitySpawn) {
    super(w, s);
    this.persistent = true; this.z = 42; this.team = 'neutral';
    this.tag = s.tag as string | undefined;
  }
  init() { this.makeSprite('carrinho', 'idle', { shadow: true }); this.makeBody(140, 90); this.body!.stepH = 20; }
  onInteract(h: Entity) {
    const hero = h as Hero;
    if (this.rider || this.cd > 0 || hero.state !== 'normal') return false;
    hero.rideOn(this);
    return true;
  }
  ride(hero: Hero) { this.rider = hero; this.sprite?.play('andar'); this.sfx('carrinho-trilho'); bus.emit('carrinho', { hero: hero.hid }); }
  controlUpdate(dt: number, hero: Hero) {
    const b = this.body!;
    const ax = input.axisX() * this.dir;
    const target = ax > 0 ? 720 : ax < 0 ? 300 : 520;
    this.vx += (this.dir * target - this.vx) * Math.min(1, dt * 1.6);
    if (input.pressed('jump') && b.onGround) { this.vy = -980; b.onGround = false; this.sfx('pulo-tama', 0.6); this.world.spawnFx('fx-faisca', 'impacto', this.x, this.y, { scale: 0.7 }); }
    const wasGround = b.onGround;
    const speed = Math.abs(this.vx);
    this.physics(dt, 2300, 1000);
    if (!wasGround && b.onGround) { this.world.spawnFx('fx-faisca', 'impacto', this.x - 40, this.y, { scale: 0.8 }); this.world.spawnFx('fx-faisca', 'impacto', this.x + 40, this.y, { scale: 0.8 }); this.world.shake(3, 100); this.sfx('aterrissar-tama', 0.6); }
    this.airT = b.onGround ? 0 : this.airT + dt;
    if (b.onGround && speed > 60) {
      this.trilhoT -= dt;
      if (this.trilhoT <= 0) { this.trilhoT = 0.32; this.sfx('carrinho-trilho', 0.5); }
    }
    // atropela inimigos no caminho
    const hits = this.world.hitArea({ x: this.x + this.dir * 50, y: this.y, w: 80, h: 80 }, { kind: 'montaria', dmg: 2, dir: this.dir, x: this.x, y: this.y, weapon: 'carrinho', source: this, heavy: true }, (e) => e.team === 'enemy');
    for (const e of hits) if (e.dead) this.world.enemyKilled(e, 'montaria', 'carrinho');
    if (b.hitWall && speed > 260) {
      this.sfx('caixa-quebrar'); this.world.shake(8, 240);
      this.world.spawnFx('fx-lascas', 'madeira', this.x + this.dir * 60, this.y - 50);
      hero.hurt({ kind: 'outro', dmg: 1, dir: -this.dir, x: this.x, y: this.y, source: this });
      this.vx = -this.dir * 120;
      return;
    }
    if (this.y > this.world.grid.pxH + 80) {
      this.rider = null;
      hero.leaveMount();
      hero.die('queda');
      return;
    }
    if (input.pressed('drop') && b.onGround) this.dismount(hero, false);
    if (this.sprite) this.sprite.speed = Math.max(0.3, speed / 520);
  }
  dismount(hero: Hero, hurt: boolean) {
    if (!this.rider) return;
    this.rider = null; this.cd = 0.8;
    hero.leaveMount();
    if (hurt) hero.b.vx = -this.dir * 260;
    this.sprite?.play('idle');
  }
  saddle(): [number, number] {
    const a = this.sprite?.anchor('sela');
    return a ? [a[0], a[1]] : [this.x, this.y - 40];
  }
  riderZ() { return this.z - 2; }
  update(dt: number) {
    if (this.cd > 0) this.cd -= dt;
    if (this.rider) { this.sprite?.update(dt); return; }
    this.vx *= Math.pow(0.15, dt);
    this.physics(dt);
    this.sprite?.update(dt);
    const L = this.world.duo.leader;
    if (this.cd <= 0 && L.state === 'normal' && L.b.vy > 100 && Math.abs(L.x - this.x) < 50 && Math.abs(L.y - (this.y - 50)) < 40) L.rideOn(this);
  }
  render(a: number) { if (this.sprite) this.sprite.groundY = this.body?.onGround ? this.y : null; super.render(a); }
}

/* ------------------------------------------------------------------ */
/* Serra gigante (fábrica): percorre um trilho; desliga pelo painel     */
/* ------------------------------------------------------------------ */
export class SerraGigante extends Entity {
  private rota: Percurso;
  private vel: number;
  desligado = false;
  private zumbido = 0;
  constructor(w: World, s: EntitySpawn) {
    super(w, s);
    this.w = 140; this.h = 140; this.z = 30;
    this.team = 'neutral'; this.touchHurts = true;
    this.rota = new Percurso(s.path, this.x, this.y);
    if (this.rota.moving) { this.x = this.rota.pts[0][0]; this.y = this.rota.pts[0][1]; }
    this.vel = Number(s.vel ?? 160);
    this.tag = s.tag as string | undefined;
    this.activeMargin = 600;
  }
  init() { this.makeSprite('serra-gigante', 'girar', { shadow: false }); }
  desligar() {
    if (this.desligado) return;
    this.desligado = true; this.touchHurts = false;
    if (this.sprite) this.sprite.speed = 0;
    this.sfx('painel-desligar');
    this.world.spawnFx('fx-fumaca', 'derrota', this.x, this.y - this.h / 2);
    bus.emit('serra-desligada', { tag: this.tag });
  }
  onHit(h: HitInfo) {
    if (h.weapon === 'chave' && !this.desligado) { this.desligar(); return true; }
    if (h.kind === 'arma' || h.kind === 'arremesso') { this.world.spawnFx('fx-faisca', 'impacto', h.x, this.y - this.h / 2); this.sfx('golpe-acerto', 0.6); return true; }
    return false;
  }
  update(dt: number) {
    this.sprite?.update(dt);
    if (this.desligado) return;
    const [nx, ny] = this.rota.step(this.vel * dt);
    this.x = nx; this.y = ny;
    this.zumbido -= dt;
    if (this.zumbido <= 0) { this.zumbido = 0.6; this.sfx('golpe-pesado', 0.25); }
  }
}

register('tronco', (w, s) => new Tronco(w, s));
register('plataforma', (w, s) => new Plataforma(w, s));
register('canoa', (w, s) => new Canoa(w, s));
register('carrinho', (w, s) => new Carrinho(w, s));
register('serra-gigante', (w, s) => new SerraGigante(w, s));
