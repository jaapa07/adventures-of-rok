/**
 * Efeitos de mundo das armas de mão: empurrão (vassoura/buzina), atordoar (panela), poça grudenta (jaca),
 * nuvem de cupins (cupinzeiro), prancha de surfe (remo na água), capacete de panela e projéteis rebatidos (remo).
 */
import { Entity, register, type HitInfo } from '../entity';
import type { World } from '../world';
import type { Hero } from '../hero';
import type { EntitySpawn } from '../types';
import { TILE } from '../types';
import { moveBody, T } from '../physics';
import { Sprite } from '../../render/sprite';
import { bus } from '../../core/events';
import { jitter } from '../pickups/common';

/* ------------------------------------------------------------------ */
/* Empurrão: desloca o corpo do alvo por alguns décimos de segundo     */
/* ------------------------------------------------------------------ */
export class Knock extends Entity {
  private t = 0;
  constructor(w: World, public target: Entity, public kvx: number, public dur: number, public weapon?: string) {
    super(w, { t: 'empurrao', x: target.x / TILE, y: target.y / TILE });
    this.persistent = true;
  }
  update(dt: number) {
    const e = this.target;
    this.t += dt;
    if (e.dead || this.t > this.dur + 3) { this.kill(); return; }
    if (this.t < this.dur && e.body) {
      const b = e.body;
      const ovy = b.vy;
      b.vx = this.kvx * (1 - this.t / this.dur); b.vy = 0;
      moveBody(b, this.world.grid, this.world.solidsFor(e), dt);
      b.vy = ovy;
      e.x = b.x; e.y = b.y;
    }
    if (e.y > this.world.grid.pxH + 64 && !e.dead) {
      e.dead = true;
      this.world.enemyKilled(e, 'outro', this.weapon);
      bus.emit('caiu-plataforma', { type: e.spawn.t, weapon: this.weapon });
      this.kill();
    }
  }
}
export function knock(w: World, e: Entity, vx: number, dur = 0.35, weapon?: string) {
  if (!e.body) { e.vx = vx; return; }
  w.add(new Knock(w, e, vx, dur, weapon));
}

/** Atordoa: marca o alvo (`tontoT`, lido pelos inimigos) e gira estrelas sobre a cabeça. */
export function stun(w: World, e: Entity, sec: number) {
  (e as unknown as { tontoT: number }).tontoT = sec;
  w.spawnFx('fx-estrelas', 'tonto', e.x, e.y - e.h - 6, { follow: e, life: sec, loop: true, z: 70 });
}

/* ------------------------------------------------------------------ */
/* Poça grudenta da jaca                                                */
/* ------------------------------------------------------------------ */
export class Poca extends Entity {
  private life = 14;
  private stuck = new Map<number, { t: number; x: number }>();
  private immune = new Map<number, number>();
  constructor(w: World, s: EntitySpawn) { super(w, s); this.w = 130; this.h = 24; this.z = 12; }
  init() { this.makeSprite('fx-poca', 'jaca'); }
  update(dt: number) {
    this.sprite?.update(dt);
    const chuva = !!this.world.regionFlags.chuva;
    this.life -= dt * (chuva ? 4 : 1);
    if (this.life <= 0) { this.kill(); return; }
    for (const e of this.world.entities) {
      if (e.dead || e.team !== 'enemy') continue;
      const s = this.stuck.get(e.id);
      if (s) {
        s.t -= dt;
        if (e.body) { e.body.x = s.x; e.body.vx = 0; }
        e.x = s.x; e.vx = 0;
        (e as unknown as { grudadoT: number }).grudadoT = Math.max(0, s.t);
        if (s.t <= 0) { this.stuck.delete(e.id); this.immune.set(e.id, this.world.time + 1.5); }
        continue;
      }
      if ((this.immune.get(e.id) ?? 0) > this.world.time) continue;
      if (Math.abs(e.x - this.x) < this.w / 2 && Math.abs(e.y - this.y) < 20) {
        this.stuck.set(e.id, { t: 2, x: e.x });
        (e as unknown as { grudadoT: number }).grudadoT = 2;
        this.world.sfx('jaca-splat', e.x, 0.6);
        this.world.text('GRUDOU!', e.x, e.y - e.h, 'small');
        bus.emit('grudado', { type: e.spawn.t });
      }
    }
  }
  render(a: number) {
    if (this.sprite) {
      const k = Math.min(1, this.life / 3);
      this.sprite.sy = k; this.sprite.alpha = Math.min(1, this.life);
    }
    super.render(a);
  }
}

/* ------------------------------------------------------------------ */
/* Nuvem de cupins: persegue inimigos e come blocos de madeira          */
/* ------------------------------------------------------------------ */
export class NuvemCupins extends Entity {
  private life = 9;
  private hitCd = new Map<number, number>();
  private buzz = 0;
  constructor(w: World, s: EntitySpawn) { super(w, s); this.w = 110; this.h = 90; this.persistent = true; this.team = 'hero'; this.z = 64; }
  init() { this.makeSprite('fx-cupins', 'nuvem'); this.sfx('cupins'); }
  private target(): Entity | null {
    let best: Entity | null = null, bd = 760;
    for (const e of this.world.entities) {
      if (e.dead) continue;
      const isBloco = e.spawn.t === 'bloco-madeira';
      if (e.team !== 'enemy' && !isBloco) continue;
      const d = Math.hypot(e.x - this.x, e.y - this.y) + (isBloco ? 200 : 0);
      if (d < bd) { bd = d; best = e; }
    }
    return best;
  }
  update(dt: number) {
    this.life -= dt;
    this.sprite?.update(dt);
    if (this.life <= 0) { this.kill(); return; }
    this.buzz -= dt;
    if (this.buzz <= 0) { this.buzz = 1.3; this.sfx('cupins', 0.5); }
    const t = this.target();
    const tx = t ? t.x : this.x + Math.sin(this.world.time) * 40, ty = t ? t.y - t.h * 0.3 : this.y;
    const d = Math.hypot(tx - this.x, ty - this.y) || 1;
    const sp = 190;
    this.x += ((tx - this.x) / d) * Math.min(sp * dt, d) + Math.sin(this.world.time * 7) * 0.8;
    this.y += ((ty - this.y) / d) * Math.min(sp * dt, d);
    for (const e of this.world.entities) {
      if (e.dead || e === this) continue;
      if (Math.abs(e.x - this.x) > (e.w + this.w) / 2 || Math.abs((e.y - e.h / 2) - (this.y - this.h / 2)) > (e.h + this.h) / 2) continue;
      if (e.spawn.t === 'bloco-madeira') { (e as unknown as { comer?: () => void }).comer?.(); continue; }
      if (e.team !== 'enemy') continue;
      if ((this.hitCd.get(e.id) ?? 0) > this.world.time) continue;
      this.hitCd.set(e.id, this.world.time + 0.6);
      const ok = e.onHit({ kind: 'arremesso', dmg: 1, dir: e.x > this.x ? 1 : -1, x: this.x, y: this.y, weapon: 'cupinzeiro', source: this });
      if (ok && e.dead) this.world.enemyKilled(e, 'arremesso', 'cupinzeiro');
    }
  }
  render(a: number) { if (this.sprite) this.sprite.alpha = Math.min(1, this.life); super.render(a); }
}

/* ------------------------------------------------------------------ */
/* Prancha: o remo flutua na água e vira prancha de surfe               */
/* ------------------------------------------------------------------ */
export class Prancha extends Entity {
  surfing = false;
  usos = 1;
  private idleT = 0;
  constructor(w: World, s: EntitySpawn) {
    super(w, s);
    this.w = 140; this.h = 20; this.z = 38;
    this.solid = w.addSolid({ x: this.x - this.w / 2, y: this.y - 8, w: this.w, h: 16, oneway: true, owner: this });
  }
  init() { this.makeSprite('arma-remo', 'mundo'); }
  private waterUnder(x: number) { const t = this.world.grid.atPx(x, this.y + 20); return t === T.WATER || t === T.WATER_VINE; }
  update(dt: number) {
    const d = this.world.duo;
    const rider = [d.leader, d.partner].find((h) => h && h.b.groundSolid === this.solid) as Hero | undefined;
    const corr = this.world.regionFlags.correnteza ?? Number(this.spawn.corr ?? 0);
    let vx = corr;
    if (rider) {
      if (!this.surfing) { this.surfing = true; this.sfx('remo-surf'); bus.emit('surf', { hero: rider.hid }); }
      // a prancha acompanha os pés do surfista enquanto houver água embaixo
      if (this.waterUnder(rider.x)) this.x = rider.x;
      const rs = rider.sprite!;
      rs.play('surfar');
      if (rs.animName === 'surfar' && rs.entry) rs.frame = Math.floor(this.world.time * 12) % rs.entry.n;
      if (Math.floor(this.world.time * 6) !== Math.floor((this.world.time - dt) * 6)) this.world.spawnFx('fx-agua', 'respingo', this.x - rider.dir * 60, this.y, { scale: jitter(0.5), z: 37 });
      this.idleT = 0;
    } else {
      this.surfing = false;
      this.idleT += dt;
      if (this.idleT > 25) { this.kill(); return; }
    }
    if (this.waterUnder(this.x + vx * dt + Math.sign(vx) * this.w / 2)) this.x += vx * dt; else vx = 0;
    this.y = this.spawn.y * TILE + Math.sin(this.world.time * 2.4) * 3;
    const s = this.solid!;
    s.x = this.x - this.w / 2; s.y = this.y - 8; s.vx = vx; s.vy = 0;
    this.sprite?.update(dt);
  }
}

/* ------------------------------------------------------------------ */
/* Capacete de panela desenhado sobre a cabeça enquanto hero.helmet > 0 */
/* ------------------------------------------------------------------ */
export class HelmetView extends Entity {
  private sprites = new Map<string, Sprite>();
  constructor(w: World) { super(w, { t: 'capacete-view', x: 0, y: 0 }); this.persistent = true; }
  update(dt: number) { for (const s of this.sprites.values()) s.update(dt); }
  render() {
    for (const h of Object.values(this.world.duo.heroes)) {
      let s = this.sprites.get(h.hid);
      const show = h.helmet > 0 && h.sprite?.visible !== false && h.state !== 'dead';
      if (!show) { if (s) { s.destroy(); this.sprites.delete(h.hid); } continue; }
      if (!s) { s = new Sprite('arma-panela', this.world.preset, 'base', this.world.stage.entities); s.play('capacete'); this.sprites.set(h.hid, s); }
      const a = h.sprite!.anchor('head');
      s.x = a?.[0] ?? h.x; s.y = (a?.[1] ?? h.y - h.h) + 10; s.flip = h.dir < 0; s.z = h.z + 3; s.alpha = h.sprite!.alpha;
      s.render();
    }
  }
  destroy() { for (const s of this.sprites.values()) s.destroy(); this.sprites.clear(); }
}
export function giveHelmet(w: World, h: Hero) {
  h.helmet = Math.min(2, h.helmet + 1);
  w.text('PÓÓIN!', h.x, h.y - h.h - 20);
  w.sfx('pooin', h.x);
  w.toast('Panela na cabeça: aguenta 1 golpe a mais!', 'panela');
  if (!w.entities.some((e) => e instanceof HelmetView)) w.add(new HelmetView(w));
  bus.emit('capacete-panela', { hero: h.hid });
}

/* ------------------------------------------------------------------ */
/* Projétil rebatido pelo remo: passa a ferir inimigos                  */
/* ------------------------------------------------------------------ */
class Rebatido extends Entity {
  private t = 0;
  constructor(w: World, public p: Entity) { super(w, { t: 'rebatido', x: p.x / TILE, y: p.y / TILE }); this.persistent = true; }
  update(dt: number) {
    this.t += dt;
    const p = this.p;
    if (p.dead || this.t > 3) { this.kill(); return; }
    const hits = this.world.hitArea({ x: p.x, y: p.y, w: p.w + 10, h: p.h + 10 }, { kind: 'arremesso', dmg: 1, dir: Math.sign(p.vx) || 1, x: p.x, y: p.y, weapon: 'remo', source: p }, (e) => e.team === 'enemy' && e !== p);
    if (hits.length) {
      for (const e of hits) if (e.dead) this.world.enemyKilled(e, 'arremesso', 'remo');
      this.world.spawnFx('fx-faisca', 'impacto', p.x, p.y - p.h / 2);
      p.kill(); this.kill();
    }
  }
}
/** Rebate projéteis inimigos dentro da área (golpe do remo). Retorna quantos. */
export function rebater(w: World, hero: Hero, area: { x: number; y: number; w: number; h: number }): number {
  let n = 0;
  for (const p of w.entities) {
    if (p.dead || p.team !== 'projectile') continue;
    if (Math.abs(p.x - area.x) > (p.w + area.w) / 2 || p.y - p.h > area.y || p.y < area.y - area.h) continue;
    const sp = Math.max(520, Math.hypot(p.vx, p.vy)) * 1.25;
    p.vx = hero.dir * sp; p.vy = -Math.min(200, Math.abs(p.vy) * 0.3);
    if (p.body) { p.body.vx = p.vx; p.body.vy = p.vy; }
    p.dir = hero.dir;
    p.team = 'hero'; p.touchHurts = false;
    (p as unknown as { refletido: boolean }).refletido = true;
    w.add(new Rebatido(w, p));
    w.text('TÓIM!', p.x, p.y - p.h, 'small');
    bus.emit('projetil-rebatido', { type: p.spawn.t });
    n++;
  }
  if (n) { w.sfx('golpe-acerto', area.x); w.hitstop(50); }
  return n;
}

register('poca', (w, s) => new Poca(w, s));
register('nuvem-cupins', (w, s) => new NuvemCupins(w, s));
register('prancha', (w, s) => new Prancha(w, s));

export type { HitInfo };
