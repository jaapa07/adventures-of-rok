/**
 * MAJOR MOTOSSERRA (Mundo 1): javali com armadura de serra. Investidas e serras arremessadas;
 * fica vulnerável quando a serra prende numa árvore da arena (entidades com tag 'arvore').
 * Fase 1: investidas. Fase 2: investida + serras rolando. Fase 3: serras, investida e salto com onda.
 */
import type { Entity, HitInfo } from '../entity';
import type { EntitySpawn } from '../types';
import { TILE } from '../types';
import type { World } from '../world';
import { Boss, Projectile, ArvoreChefe } from './base';

const PATTERNS: string[][] = [
  ['investida'],
  ['investida', 'serras'],
  ['serras', 'investida', 'salto'],
];

export class MajorMotosserra extends Boss {
  trees: Entity[] = [];
  stuckTree: Entity | null = null;
  next = 'investida';
  fired = 0;
  landed = false;
  constructor(w: World, s: EntitySpawn) { super(w, s, 6); }
  init() {
    this.makeSprite('major-motosserra', 'idle', { shadow: true });
    this.makeBody(150, 160);
    this.trees = this.world.byTag('arvore');
    if (!this.trees.length) {
      // arena autoral: duas árvores, uma perto de cada parede
      for (const tx of [this.arena[0] + 2.5 * TILE, this.arena[1] - 2.5 * TILE]) {
        const t = new ArvoreChefe(this.world, { t: 'arvore-chefe', x: tx / TILE, y: this.floorY / TILE });
        this.world.add(t); this.trees.push(t);
      }
    }
  }
  render(a: number) { if (this.sprite) this.sprite.groundY = this.y; super.render(a); }

  think(dt: number) {
    switch (this.state) {
      case 'entrada':
        this.ground(dt, 0);
        if (this.st > 1.6) this.setState('idle');
        return;
      case 'furia':
        this.ground(dt, 0);
        if (this.st > 1.1) this.setState('idle');
        return;
      case 'idle': {
        this.faceHero();
        this.ground(dt, 0);
        this.play('idle');
        const wait = [1.3, 1.0, 0.7][this.phase - 1];
        if (this.st > wait) {
          const p = PATTERNS[this.phase - 1];
          this.next = p[this.seq++ % p.length];
          this.setState(this.next === 'investida' ? 'preparar' : this.next);
          this.fired = 0; this.landed = false;
          this.play(this.next === 'serras' ? 'ataque2' : this.next === 'salto' ? 'ataque3' : 'ataque1', { restart: true });
          if (this.next === 'investida') this.sfx('serra-gigante', 0.8);
        }
        return;
      }
      case 'preparar':
        this.faceHero();
        this.ground(dt, 0);
        if (Math.floor(this.st * 10) !== Math.floor((this.st - dt) * 10)) this.world.spawnFx('fx-poeira', 'corrida', this.x - this.dir * 60, this.y, { flip: this.dir < 0 });
        if (this.st > 0.55) { this.setState('investida'); this.sfx('chefe-rugido', 0.6); }
        return;
      case 'investida': return this.charge(dt);
      case 'preso':
        this.ground(dt, 0);
        this.play('vulneravel');
        if (this.st > [3.0, 2.6, 2.2][this.phase - 1]) this.free();
        return;
      case 'livrar':
        this.ground(dt, -this.dir * 120 * Math.max(0, 1 - this.st * 2));
        if (this.st > 0.6) { this.touchHurts = true; this.setState('idle'); }
        return;
      case 'tonto':
        this.ground(dt, 0);
        this.play('dano');
        if (this.st > 0.8) { this.dir = (this.dir * -1) as 1 | -1; this.setState('idle'); }
        return;
      case 'serras': return this.throwSaws(dt);
      case 'salto': return this.leap(dt);
    }
  }

  ground(dt: number, vx: number) { this.vx = vx; this.physics(dt); }

  charge(dt: number) {
    const sp = [640, 760, 880][this.phase - 1];
    const px = this.x;
    this.ground(dt, this.dir * sp);
    this.play('ataque1');
    if (Math.floor(this.st * 12) !== Math.floor((this.st - dt) * 12)) this.world.spawnFx('fx-poeira', 'corrida', this.x - this.dir * 70, this.y, { flip: this.dir < 0, scale: 1.2 });
    // a serra prende na árvore
    const front = this.x + this.dir * (this.w / 2);
    const pfront = px + this.dir * (this.w / 2);
    for (const t of this.trees) {
      if (t.dead) continue;
      const tEdge = t.x - this.dir * (t.w / 2);
      if ((pfront - tEdge) * (front - tEdge) <= 0 || Math.abs(front - tEdge) < 6) {
        this.x = tEdge - this.dir * (this.w / 2 - 18); this.body!.x = this.x;
        this.stuck(t);
        return;
      }
    }
    const edge = this.clampArena(this.w / 2 + 4);
    if (edge !== 0 || this.body!.hitWall || this.st > 3) {
      this.world.shake(8, 260); this.sfx('clank');
      this.setState('tonto');
    }
  }
  stuck(t: Entity) {
    this.stuckTree = t;
    this.setState('preso');
    this.touchHurts = false;
    this.play('vulneravel', { restart: true });
    this.world.shake(12, 420);
    this.sfx('serra-gigante'); this.sfx('madeira-quebrar');
    this.world.text('PRESO!', this.x, this.y - this.h - 20);
    if (t instanceof ArvoreChefe) t.hit();
    else this.world.spawnFx('fx-lascas', 'madeira', t.x, this.y - this.h * 0.6, { scale: 1.3 });
  }
  free() {
    this.stuckTree = null;
    this.setState('livrar');
    this.play('furia', { restart: true });
    this.sfx('serra-gigante');
  }

  throwSaws(dt: number) {
    this.faceHero();
    this.ground(dt, 0);
    const n = this.phase >= 3 ? 2 : 1;
    const at = [0.45, 0.85];
    while (this.fired < n && this.st >= at[this.fired]) {
      const high = this.fired === 1;
      const p = new Projectile(this.world, {
        model: 'serra-gigante', anim: 'girar', scale: 0.42, spin: 720,
        x: this.x + this.dir * 90, y: this.y - (high ? 150 : 40),
        vx: this.dir * (high ? 360 : 430), vy: high ? -760 : 0, g: 2200,
        w: 64, h: 64, life: 4.5, ground: 'roll', walls: 1,
        stickTo: (pr) => this.sawHitsTree(pr),
      });
      this.world.add(p);
      this.sfx('serra-gigante', 0.8);
      this.fired++;
    }
    if (this.st > 1.3) this.setState('idle');
  }
  /** a serra arremessada crava na árvore e para */
  sawHitsTree(p: Projectile) {
    for (const t of this.trees) if (!t.dead && Math.abs(p.x - t.x) < t.w / 2 + 20 && p.y > t.y - t.h) {
      this.world.spawnFx('fx-lascas', 'madeira', p.x, p.y - 30);
      this.sfx('madeira-quebrar', 0.7);
      p.life = 1.2;
      return true;
    }
    return false;
  }

  leap(dt: number) {
    if (this.st < 0.35) { this.faceHero(); this.ground(dt, 0); return; }
    if (!this.landed && this.fired === 0) {
      this.fired = 1;
      const dx = Math.max(-520, Math.min(520, this.heroDx()));
      this.vx = dx / 0.9; this.vy = -1080; this.body!.onGround = false;
      this.sfx('chefe-rugido', 0.7);
    }
    const vx = this.vx;
    this.physics(dt);
    this.vx = vx;
    this.clampArena(this.w / 2 + 4);
    if (!this.landed && this.body!.onGround && this.st > 0.5) {
      this.landed = true; this.vx = 0;
      this.world.shake(14, 420);
      this.sfx('pisao-forte');
      this.world.spawnFx('fx-poeira', 'aterrissar', this.x - 80, this.y, { flip: true, scale: 1.6 });
      this.world.spawnFx('fx-poeira', 'aterrissar', this.x + 80, this.y, { scale: 1.6 });
      for (const d of [-1, 1]) this.world.add(new Projectile(this.world, { x: this.x + d * 90, y: this.y, vx: d * 520, vy: 0, g: 2400, w: 50, h: 34, life: 1.4, ground: 'roll', trail: ['fx-poeira', 'corrida'] }));
    }
    if (this.landed) { this.vx = 0; if (this.st > 1.6) this.setState('idle'); }
  }

  /* ---------------- dano ---------------- */
  onStomp(): 'kill' | 'bounce' | 'hurt' {
    if (this.state === 'preso') { this.hurtBoss(1); this.free(); return 'bounce'; }
    if (this.defeated || this.state === 'livrar') return 'bounce';
    return 'hurt'; // armadura de serra
  }
  onHit(h: HitInfo): boolean {
    if (this.defeated || !this.active) return false;
    if (this.state === 'preso' && h.kind !== 'outro') { this.hurtBoss(1, h); this.free(); return true; }
    this.sfx('clank', 0.7);
    this.world.spawnFx('fx-faisca', 'impacto', h.x + (this.x - h.x) * 0.6, this.y - this.h * 0.6);
    return true;
  }
  defeatMotion(dt: number) { this.vx = 0; this.physics(dt); }
}
