/**
 * RAINHA MORCEGA-LÂMPADA (Mundo 2): apaga a arena — só se vê pelas luzes dela (lâmpadas na coroa,
 * nas asas e nas bombas-lâmpada). Derrota com cabaças acesas no fogo: o herói encosta a cabaça na
 * fogueira/braseiro e arremessa nela. Fase 1: rasantes. Fase 2: + bombas-lâmpada. Fase 3: + enxame.
 */
import { Entity, type HitInfo } from '../entity';
import type { EntitySpawn } from '../types';
import { TILE } from '../types';
import type { Light } from '../../render/lighting';
import { factoryFor } from '../entity';
import type { World } from '../world';
import { Boss, Projectile, Braseiro } from './base';

const PATTERNS: string[][] = [
  ['rasante'],
  ['rasante', 'lampadas'],
  ['lampadas', 'rasante', 'enxame'],
];

const isGourdId = (id: unknown) => typeof id === 'string' && id.startsWith('cabaca');

export class RainhaMorcega extends Boss {
  dark = 0;
  t = 0;
  fires: Entity[] = [];
  gourdLit = false;
  gourdMark = 0;
  gourd: Entity | null = null;
  gourdLostT = 0;
  gourdLight: Light = { x: 0, y: 0, r: 0, flicker: 0.2 };
  sparkT = 0;
  supplyT = 1.5;
  supplyI = 0;
  hinted = false;
  fromX = 0; fromY = 0; toX = 0; toY = 0;
  fired = 0;
  constructor(w: World, s: EntitySpawn) { super(w, s, 3); this.camYOff = -230; }
  get hoverY() { return this.floorY - 4 * TILE; }
  init() {
    this.makeSprite('rainha-morcega', 'idle');
    this.makeBody(150, 130);
    this.y = this.hoverY; this.body!.y = this.y;
    this.fires = this.world.entities.filter((e) => !e.dead && (e.spawn.t === 'fogueira' || e.tag === 'fogueira') && e.x > this.arena[0] && e.x < this.arena[1]);
    if (!this.fires.length) {
      const b = new Braseiro(this.world, { t: 'braseiro-chefe', x: this.cxArena / TILE, y: this.floorY / TILE });
      this.world.add(b); this.fires.push(b);
    }
  }
  waiting(dt: number) { this.t += dt; this.hover(dt, 0.4); this.play('idle'); }

  /* ---------------- movimento ---------------- */
  hover(dt: number, k = 1) {
    const half = (this.arena[1] - this.arena[0]) / 2 - 2 * TILE;
    const tx = this.cxArena + Math.sin(this.t * 0.7) * half * 0.7 * k;
    const ty = this.hoverY + Math.sin(this.t * 1.4) * 0.6 * TILE;
    this.x += (tx - this.x) * Math.min(1, dt * 2.5);
    this.y += (ty - this.y) * Math.min(1, dt * 2.5);
    this.body!.x = this.x; this.body!.y = this.y;
  }
  lerpTo(dt: number, tx: number, ty: number, k: number) {
    this.x += (tx - this.x) * Math.min(1, dt * k); this.y += (ty - this.y) * Math.min(1, dt * k);
    this.body!.x = this.x; this.body!.y = this.y;
  }

  think(dt: number) {
    this.t += dt;
    this.updateGourd(dt);
    switch (this.state) {
      case 'entrada':
        this.hover(dt, 0.2);
        if (this.st > 1.8) this.setState('voar');
        return;
      case 'furia':
        this.hover(dt, 0.3);
        if (this.st > 1.2) this.setState('voar');
        return;
      case 'voar': {
        this.hover(dt);
        this.faceHero();
        this.play('idle');
        if (this.st > [2.6, 2.1, 1.7][this.phase - 1]) {
          const p = PATTERNS[this.phase - 1];
          const n = p[this.seq++ % p.length];
          this.fired = 0;
          this.setState(n);
          if (n === 'rasante') {
            this.fromX = this.x; this.fromY = this.y;
            this.toX = this.hero.x; this.toY = this.hero.y - 30;
            this.play('ataque1', { restart: true });
            this.sfx('morcego-guincho');
          } else this.play(n === 'lampadas' ? 'ataque2' : 'ataque3', { restart: true });
        }
        return;
      }
      case 'rasante': {
        // mergulho até onde o herói estava, depois sobe pelo outro lado
        const T = 0.75;
        const k = Math.min(1, this.st / T);
        const mx = this.toX + (this.toX - this.fromX) * 0.5;
        const x = k < 1 ? this.fromX + (this.toX - this.fromX) * k : this.toX + (mx - this.toX) * Math.min(1, (this.st - T) / 0.6);
        const y = k < 1 ? this.fromY + (this.toY - this.fromY) * Math.sin(k * Math.PI / 2) : this.toY;
        this.x = Math.max(this.arena[0] + 80, Math.min(this.arena[1] - 80, x)); this.y = y;
        this.body!.x = this.x; this.body!.y = this.y;
        if (Math.abs(this.toX - this.fromX) > 4) this.dir = this.toX < this.fromX ? -1 : 1;
        if (this.st > T + 0.6) { this.setState('baixa'); this.play('vulneravel', { restart: true }); }
        return;
      }
      case 'baixa':
        // pairando baixo, cansada: hora de arremessar a cabaça acesa
        this.lerpTo(dt, this.x, this.floorY - 2.2 * TILE, 3);
        this.play('vulneravel');
        if (this.st > 1.5) this.setState('voar');
        return;
      case 'lampadas': {
        this.hover(dt, 0.5);
        const n = this.phase >= 3 ? 4 : 3;
        while (this.fired < n && this.st > 0.4 + this.fired * 0.28) {
          const off = [-160, 0, 160, 320][this.fired] * (this.fired % 2 ? -1 : 1);
          this.world.add(new Projectile(this.world, {
            model: 'arma-lamparina', anim: 'voando', scale: 1,
            x: this.x, y: this.y - 20, vx: (this.hero.x + off - this.x) / 0.9, vy: -320, g: 1500,
            w: 40, h: 40, life: 3, ground: 'explode', explodeR: 80, light: 120,
          }));
          this.sfx('arremesso', 0.7);
          this.fired++;
        }
        if (this.st > 1.8) this.setState('voar');
        return;
      }
      case 'enxame': {
        this.hover(dt, 0.4);
        if (this.fired === 0 && this.st > 0.5) {
          this.fired = 1;
          this.sfx('morcego-guincho');
          if (factoryFor('morcego')) for (const d of [-1, 1]) this.world.spawn({ t: 'morcego', x: (this.x + d * 120) / TILE, y: (this.y - 20) / TILE, voando: true });
        }
        if (this.st > 1.6) this.setState('voar');
        return;
      }
    }
  }

  /* ---------------- cabaça acesa ---------------- */
  updateGourd(dt: number) {
    const L = this.hero;
    const holding = isGourdId(L.held?.def.id);
    // acende ao encostar no fogo
    if (holding && !this.gourdLit) {
      for (const f of this.fires) if (!f.dead && Math.abs(f.x - L.x) < 110 && Math.abs(f.y - L.y) < 120) {
        this.gourdLit = true; this.gourd = null;
        this.sfx('lamparina-acender');
        this.world.text('FOGO!', L.x, L.y - L.h - 30, 'small');
        this.world.lights.push(this.gourdLight);
        break;
      }
    }
    if (!this.gourdLit) {
      this.supply(dt, holding);
      return;
    }
    let gx: number, gy: number;
    if (holding) {
      this.gourdMark = Entity.nextId; this.gourdLostT = 0;
      const a = L.sprite?.anchor('head');
      gx = a?.[0] ?? L.x; gy = (a?.[1] ?? L.y - L.h) - 30;
    } else {
      if (!this.gourd || this.gourd.dead) {
        this.gourd = this.world.entities.find((e) => !e.dead && e.id >= this.gourdMark && (isGourdId(e.spawn.id) || isGourdId(e.spawn.t))) ?? null;
      }
      if (this.gourd && !this.gourd.dead) {
        gx = this.gourd.x; gy = this.gourd.y - this.gourd.h / 2;
        // a cabaça acesa encostou nela
        if (Math.abs(gx - this.x) < this.w / 2 + 20 && gy > this.y - this.h - 20 && gy < this.y + 20) {
          // gourdHit() apaga a cabaça (unlight zera this.gourd): guarda a referência antes
          const acesa = this.gourd;
          this.gourdHit({ kind: 'arremesso', dmg: 1, dir: Math.sign(this.x - gx) || 1, x: gx, y: gy, weapon: 'cabaca', source: acesa });
          this.world.spawnFx('fx-lascas', 'cabaca', gx, gy);
          this.sfx('cabaca-quebrar');
          acesa.kill();
          return;
        }
      } else {
        this.gourdLostT += dt;
        if (this.gourdLostT > 0.4) { this.unlight(); return; }
        gx = L.x; gy = L.y - L.h;
      }
    }
    this.gourdLight.x = gx; this.gourdLight.y = gy; this.gourdLight.r = 150;
    this.sparkT -= dt;
    if (this.sparkT <= 0) { this.sparkT = 0.08; this.world.spawnFx('fx-faisca', 'impacto', gx, gy - 10, { scale: 0.5, vy: -80, life: 0.35, fade: 0.2 }); }
  }
  unlight() {
    this.gourdLit = false; this.gourd = null;
    const i = this.world.lights.indexOf(this.gourdLight);
    if (i >= 0) this.world.lights.splice(i, 1);
  }
  /** garante uma cabaça na arena (caem do teto, alternando os lados) */
  supply(dt: number, holding: boolean) {
    if (holding || !factoryFor('cabaca')) return;
    const any = this.world.entities.some((e) => !e.dead && (isGourdId(e.spawn.t) || isGourdId(e.spawn.id) || isGourdId(e.grabbable)) && e.x > this.arena[0] && e.x < this.arena[1]);
    if (any) { this.supplyT = 1.2; return; }
    this.supplyT -= dt;
    if (this.supplyT > 0) return;
    this.supplyT = 1.2;
    const xs = [this.arena[0] + 3 * TILE, this.arena[1] - 3 * TILE];
    const x = xs[this.supplyI++ % 2];
    this.world.spawn({ t: 'cabaca', x: x / TILE, y: (this.floorY - 5 * TILE) / TILE });
    this.world.spawnFx('fx-poeira', 'pulo', x, this.floorY - 5 * TILE);
    if (!this.hinted) { this.hinted = true; this.world.toast('Acenda a cabaça no fogo e arremesse na Rainha!', 'cabaca'); }
  }
  gourdHit(h: HitInfo) {
    this.unlight();
    if (this.hurtBoss(1, h)) { this.world.text('FUUUSH!', this.x, this.y - this.h); if (!this.defeated && this.state !== 'furia') this.setState('voar'); }
  }

  /* ---------------- dano ---------------- */
  onHit(h: HitInfo): boolean {
    if (this.defeated || !this.active) return false;
    if (isGourdId(h.weapon) && this.gourdLit) { this.gourdHit(h); return true; }
    if (isGourdId(h.weapon)) { this.world.text('HÁ-HÁ!', this.x, this.y - this.h, 'small'); this.sfx('morcego-guincho', 0.6); return true; }
    this.sprite?.flash(0.05);
    return true;
  }
  onStomp(): 'kill' | 'bounce' | 'hurt' { return 'bounce'; }

  /* ---------------- luz e escuridão ---------------- */
  light(): Light | null {
    if (this.defeated && this.defeatT > 2.2) return null;
    const r = this.phase >= 3 ? 150 + Math.sin(this.t * 5) * 30 : 210;
    return { x: this.x, y: this.y - this.h * 0.6, r, flicker: 0.08 };
  }
  render(a: number) {
    const want = this.active && !(this.defeated && this.defeatT > 2.2) ? 1 : 0;
    this.dark += (want - this.dark) * Math.min(1, (1 / 60) * 2);
    // a escuridão da arena é dela (independe das regiões da fase)
    if (this.dark > 0.01 || want) this.world.darkness.level = Math.max(this.world.darkness.level, this.dark);
    super.render(a);
  }
  defeatMotion(dt: number) {
    this.vy = Math.min(this.vy + 900 * dt, 400);
    this.y = Math.min(this.floorY, this.y + this.vy * dt);
    if (this.body) this.body.y = this.y;
  }
  onDefeat() { this.unlight(); }
  destroy() { this.unlight(); super.destroy(); }
}
