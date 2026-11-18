/**
 * POLVO-DRAGA (Mundo 3): draga mecânica subaquática. Só o Pirarucu abre as válvulas (investida):
 * a cada fase uma válvula fica exposta e brilhando. Fase 1: varrida de tentáculo. Fase 2: + sucção.
 * Fase 3: + minas-baiacu teleguiadas (a investida as destrói).
 */
import { Entity, register, factoryFor, type HitInfo } from '../entity';
import type { EntitySpawn } from '../types';
import { TILE } from '../types';
import type { World } from '../world';
import { Boss, Projectile } from './base';

const PATTERNS: string[][] = [
  ['tentaculo'],
  ['tentaculo', 'succao'],
  ['minas', 'succao', 'tentaculo'],
];
/** posição das válvulas em tiles relativa aos pés do polvo (x espelhado pela direção) */
const VALVES: [number, number][] = [[-2.2, -0.7], [-2.4, -3.4], [-0.4, -4.9]];

export class Valvula extends Entity {
  el = document.createElement('div');
  owner: PolvoDraga | null = null;
  exposed = false;
  open = false;
  steamT = 0;
  constructor(w: World, s: EntitySpawn) { super(w, s); this.team = 'neutral'; this.w = 72; this.h = 72; this.persistent = true; this.z = 34; this.y += 36; }
  init() {
    this.el.style.cssText = 'position:absolute;left:0;top:0;width:72px;height:72px;border-radius:50%;pointer-events:none;' +
      'background:radial-gradient(circle, #d8c27a 0 14%, #6b5a2c 15% 19%, transparent 20%),' +
      'conic-gradient(from 0deg, #8a6a3a 0 8%, transparent 8% 25%, #8a6a3a 25% 33%, transparent 33% 50%, #8a6a3a 50% 58%, transparent 58% 75%, #8a6a3a 75% 83%, transparent 83%),' +
      'radial-gradient(circle, transparent 0 52%, #b0472a 53% 66%, #5b2414 67% 72%, transparent 73%);';
    this.world.stage.entities.append(this.el);
  }
  update(dt: number) {
    if (this.open) {
      this.steamT -= dt;
      if (this.steamT <= 0) { this.steamT = 0.3; this.world.spawnFx('fx-agua', 'bolha-m', this.x, this.y - this.h / 2, { vy: -120, life: 1.4, fade: 0.5, loop: true }); }
    }
  }
  onHit(h: HitInfo) {
    if (this.dead || !this.owner) return false;
    if (h.kind === 'montaria' && this.exposed && !this.open) { this.owner.valveOpened(this, h); return true; }
    this.sfx('clank', 0.5);
    this.world.spawnFx('fx-faisca', 'impacto', this.x, this.y - this.h / 2, { scale: 0.7 });
    return true;
  }
  render() {
    const glow = this.exposed && !this.open;
    const k = glow ? 1 + Math.sin(this.world.time * 8) * 0.08 : 1;
    const rot = this.open ? 160 : glow ? Math.sin(this.world.time * 3) * 8 : 0;
    this.el.style.transform = `translate3d(${(this.x - 36).toFixed(1)}px, ${(this.y - 72).toFixed(1)}px, 0) scale(${k.toFixed(3)}) rotate(${rot.toFixed(0)}deg)`;
    this.el.style.filter = glow ? 'drop-shadow(0 0 14px #ffe36b) brightness(1.25)' : this.open ? 'grayscale(0.4) brightness(0.8)' : '';
    this.el.style.zIndex = String(this.z);
  }
  light() { return this.exposed && !this.open ? { x: this.x, y: this.y - 36, r: 120, flicker: 0.1 } : null; }
  destroy() { super.destroy(); this.el.remove(); }
}

export class PolvoDraga extends Boss {
  valves: Valvula[] = [];
  homeY: number;
  fired = 0;
  mountT = 2;
  hinted = false;
  t = 0;
  constructor(w: World, s: EntitySpawn) { super(w, s, 3); this.homeY = this.y; this.camYOff = -220; }
  init() {
    this.makeSprite('polvo-draga', 'idle');
    this.makeBody(240, 250);
    VALVES.forEach(([ox, oy], i) => {
      const v = new Valvula(this.world, { t: 'valvula-draga', x: (this.x + ox * TILE * -this.dir) / TILE, y: (this.floorY + oy * TILE) / TILE });
      v.owner = this; v.exposed = i === 0;
      this.world.add(v); this.valves.push(v);
    });
  }
  waiting(dt: number) { this.t += dt; this.bob(); this.play('idle'); }
  bob() { this.y = this.homeY + Math.sin(this.t * 1.3) * 10; if (this.body) this.body.y = this.y; }

  think(dt: number) {
    this.t += dt;
    this.bob();
    this.ensureMount(dt);
    switch (this.state) {
      case 'entrada': if (this.st > 1.8) this.setState('idle'); return;
      case 'furia': if (this.st > 1.3) this.setState('idle'); return;
      case 'idle': {
        this.play('idle');
        if (this.st > [2.2, 1.8, 1.4][this.phase - 1]) {
          const p = PATTERNS[this.phase - 1];
          const n = p[this.seq++ % p.length];
          this.fired = 0;
          this.setState(n);
          this.play(n === 'tentaculo' ? 'ataque1' : n === 'succao' ? 'ataque2' : 'ataque3', { restart: true });
        }
        return;
      }
      case 'tentaculo': {
        // aviso com bolhas no chão, depois a varrida
        if (this.st < 0.7 && Math.floor(this.st * 10) !== Math.floor((this.st - dt) * 10)) {
          const k = (this.st / 0.7);
          this.world.spawnFx('fx-agua', 'bolha-m', this.x + this.dir * (160 + k * 500), this.floorY - 20, { vy: -90, life: 1, fade: 0.4, loop: true });
        }
        if (this.fired === 0 && this.st >= 0.7) {
          this.fired = 1;
          this.sfx('onda');
          this.world.add(new Projectile(this.world, { x: this.x + this.dir * 150, y: this.floorY, vx: this.dir * 620, vy: 0, w: 130, h: 120, life: 2.2, trail: ['fx-agua', 'bolha-g'] }));
        }
        if (this.st > 1.8) this.setState('idle');
        return;
      }
      case 'succao': {
        this.play('ataque2');
        if (this.st > 0.4 && this.st < 2.6) {
          const L = this.hero;
          const target: Entity = L.state === 'mounted' && L.mount ? L.mount : L;
          const dx = this.x + this.dir * 120 - target.x;
          const pull = Math.sign(dx) * 150 * dt;
          target.x += pull; if (target.body) target.body.x = target.x;
          if (Math.floor(this.st * 8) !== Math.floor((this.st - dt) * 8)) this.world.spawnFx('fx-agua', 'bolha-p', target.x - Math.sign(dx) * 80, target.y - 60, { vx: Math.sign(dx) * 260, life: 0.8, fade: 0.3, loop: true });
          if (Math.floor(this.st * 2) !== Math.floor((this.st - dt) * 2)) this.sfx('bolhas', 0.7);
        }
        if (this.st > 3) this.setState('idle');
        return;
      }
      case 'minas': {
        while (this.fired < 3 && this.st > 0.4 + this.fired * 0.35) {
          this.world.add(new Projectile(this.world, {
            model: 'baiacu', anim: 'inflado', scale: 0.7,
            x: this.x + this.dir * 110, y: this.y - 160 + this.fired * 50, vx: this.dir * 160, vy: -60 + this.fired * 60,
            w: 56, h: 56, life: 5, homing: 220, explodeR: 80, breakable: true,
          }));
          this.sfx('baiacu-inflar', 0.7);
          this.fired++;
        }
        if (this.st > 2) this.setState('idle');
        return;
      }
    }
  }

  /** o Pirarucu volta (sai de uma toca) se o herói estiver sem montaria */
  ensureMount(dt: number) {
    const L = this.hero;
    if (L.state === 'mounted' || !factoryFor('pirarucu')) return;
    if (this.world.entities.some((e) => !e.dead && e.spawn.t === 'pirarucu')) { this.mountT = 2.5; return; }
    this.mountT -= dt;
    if (this.mountT > 0) return;
    this.mountT = 2.5;
    const x = this.arena[0] + 3 * TILE, y = this.floorY - 2 * TILE;
    this.world.spawn({ t: 'pirarucu', x: x / TILE, y: y / TILE, dir: 1 });
    this.world.spawnFx('fx-agua', 'bolha-g', x, y - 40, { vy: -80, life: 1.2, fade: 0.5, loop: true });
    if (!this.hinted) { this.hinted = true; this.world.toast('Monte no Pirarucu e dê a investida na válvula que brilha!', 'pirarucu'); }
  }

  valveOpened(v: Valvula, h: HitInfo) {
    if (!this.active || this.defeated) return;
    v.open = true; v.exposed = false;
    this.sfx('vapor'); this.sfx('clank');
    this.world.shake(10, 400);
    this.world.text('CLONC!', v.x, v.y - v.h);
    if (this.hurtBoss(1, h)) {
      const next = this.valves.find((x) => !x.open);
      if (next && !this.defeated) next.exposed = true;
    }
  }

  onStomp(): 'kill' | 'bounce' | 'hurt' { return this.defeated ? 'bounce' : 'hurt'; }
  onHit(h: HitInfo): boolean {
    if (this.defeated || !this.active) return false;
    this.sfx('clank', 0.6);
    this.world.spawnFx('fx-faisca', 'impacto', h.x + (this.x - h.x) * 0.5, this.y - this.h * 0.5);
    return true;
  }
  defeatMotion(dt: number) { this.homeY += 60 * dt; this.t += dt; this.bob(); }
  onDefeat() { for (const v of this.valves) { v.exposed = false; v.open = true; } }
}

register('valvula-draga', (w, s) => new Valvula(w, s));
