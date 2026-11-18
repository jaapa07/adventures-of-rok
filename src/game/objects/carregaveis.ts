/**
 * Carregáveis no chão: Cabaça Rolante, Cabaça de Pedra e Bromélia-mola (também WeaponDefs, pega 'cabeca').
 * A bromélia é uma mola: pulo alto, altíssimo se o jogador segurar pulo no impacto.
 */
import { Entity, register, type HitInfo } from '../entity';
import type { World } from '../world';
import type { EntitySpawn } from '../types';
import { TILE } from '../types';
import type { Hero } from '../hero';
import { bus } from '../../core/events';

export class Carregavel extends Entity {
  usos?: number;
  constructor(w: World, s: EntitySpawn, public model: string) {
    super(w, s);
    this.grabbable = s.t;
    this.heavy = s.t === 'cabaca-pedra';
    this.team = 'neutral';
    this.z = 28;
  }
  init() { this.makeSprite(this.model, 'idle', { shadow: true }); this.makeBody(56, 60); }
  update(dt: number) {
    this.physics(dt);
    if (this.y > this.world.grid.pxH + 200) this.kill();
    this.sprite?.update(dt);
  }
  render(a: number) { if (this.sprite) this.sprite.groundY = this.y; super.render(a); }
  /** um golpe de arma chuta a cabaça, que sai rolando */
  onHit(h: HitInfo): boolean {
    if (h.kind !== 'arma' || this.dead) return false;
    this.kill();
    this.world.spawn({ t: 'arremessado', id: this.spawn.t, x: this.x / TILE, y: (this.y - 4) / TILE, dir: h.dir < 0 ? -1 : 1, modo: 'frente', vx: (h.dir < 0 ? -1 : 1) * 470, vy: -220 });
    this.sfx('cabaca-rolar');
    return true;
  }
}

export class Bromelia extends Carregavel {
  forca: number;
  private cd = 0;
  constructor(w: World, s: EntitySpawn) { super(w, s, 'bromelia'); this.forca = Number(s.forca ?? 1350); }
  init() { this.makeSprite('bromelia', 'idle', { shadow: true }); this.makeBody(80, 44); }
  onHit() { return false; }
  /** dispara a animação de mola (também usada pela jaca lançada) */
  mola() {
    this.sprite?.play('mola', { restart: true, onEnd: () => this.sprite?.play('idle') });
    this.sfx('bromelia-mola');
    this.world.spawnFx('fx-folhas', 'folha2', this.x, this.y - 30, { vx: -60, vy: -200, gravity: 300, life: 0.9, fade: 0.4, loop: true });
  }
  update(dt: number) {
    super.update(dt);
    if (this.cd > 0) { this.cd -= dt; return; }
    const top = this.y - 34;
    for (const h of [this.world.duo.leader, this.world.duo.partner] as (Hero | null)[]) {
      if (!h || h.state === 'dead' || h.state === 'mounted' || h.state === 'cutscene') continue;
      if (h !== this.world.duo.leader) continue;
      if (h.b.vy > 40 && Math.abs(h.x - this.x) < 52 && h.y >= top - 14 && h.y <= this.y + 6) {
        h.y = top; h.b.y = top;
        h.bounce(this.forca);
        this.mola();
        this.cd = 0.2;
        bus.emit('bromelia', { x: this.x, forte: h.b.vy < -this.forca * 1.1 });
      }
    }
  }
}

register('cabaca', (w, s) => new Carregavel(w, s, 'cabaca'));
register('cabaca-pedra', (w, s) => new Carregavel(w, s, 'cabaca-pedra'));
register('bromelia', (w, s) => new Bromelia(w, s));
