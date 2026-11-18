/**
 * A dupla Tamá + Lili (seção 5.2): o parceiro segue o rastro do líder com 18 quadros de atraso,
 * troca instantânea com "toca aqui", perda do líder ao levar dano (foge para fora da tela),
 * reencontro no Ninho, arremesso do parceiro e tédios em conjunto (gag_tedio).
 */
import { Hero, type DeathKind } from './hero';
import type { HeroId } from './types';
import type { HitInfo } from './entity';
import type { World } from './world';
import { input } from '../core/input';
import { bus } from '../core/events';
import type { Light } from '../render/lighting';

const DELAY = 18;
interface Crumb { x: number; y: number; vx: number; vy: number; onGround: boolean; dir: 1 | -1; anim: string; swim: boolean; climb: boolean }

export class Duo {
  heroes: Record<HeroId, Hero>;
  leader: Hero;
  partner: Hero | null;
  private trail: Crumb[] = [];
  fleeing: Hero | null = null;
  fleeT = 0;
  resistUsed = 0;
  swapCooldown = 0;
  boredT = 0;
  private boredIdx = 0;
  private holdSwap = 0;
  private lifting = false;
  shoutMode = false; // gags podem forçar o grito do eco

  constructor(public world: World, x: number, y: number) {
    this.heroes = { tama: new Hero(world, 'tama', x, y), lili: new Hero(world, 'lili', x - 70, y) };
    this.leader = this.heroes.tama;
    this.partner = this.heroes.lili;
    this.partner.z = 36;
    for (let i = 0; i < DELAY + 2; i++) this.trail.push(this.crumb(this.leader));
    this.partner.x = x - 70;
  }

  private crumb(h: Hero): Crumb {
    return { x: h.x, y: h.y, vx: h.b.vx, vy: h.b.vy, onGround: h.b.onGround, dir: h.dir, anim: h.sprite!.animName, swim: h.state === 'swim', climb: h.state === 'climb' || h.state === 'hang' };
  }

  setPreset(p: string) { this.heroes.tama.setPreset(p); this.heroes.lili.setPreset(p); }

  update(dt: number) {
    const L = this.leader;
    if (this.swapCooldown > 0) this.swapCooldown -= dt;
    L.control(dt);
    L.tick(dt);

    // ---- troca / arremesso do parceiro / grito ----
    const canAct = L.state === 'normal' && L.b.onGround && !L.held;
    if (input.down('swap')) this.holdSwap += dt;
    if (input.released('swap')) {
      if (this.lifting) this.throwPartner();
      else if (this.holdSwap < 0.35) this.swap();
      this.holdSwap = 0;
    }
    if (this.holdSwap > 0.35 && !this.lifting && canAct) {
      if (this.partner && !this.shoutMode) this.liftPartner();
      else if (this.holdSwap < 0.35 + dt * 1.5) { bus.emit('hero-shout', { x: L.x, y: L.y }); this.world.sfx('grito-eco', L.x); }
    }

    // ---- parceiro segue o rastro ----
    this.trail.push(this.crumb(L));
    while (this.trail.length > DELAY + 1) this.trail.shift();
    const P = this.partner;
    if (P && !this.lifting) {
      const c = this.trail[0];
      const prevX = P.x;
      P.x += (c.x - P.x) * 0.5; P.y += (c.y - P.y) * 0.5;
      if (Math.abs(c.x - P.x) > 600 || Math.abs(c.y - P.y) > 500) { P.x = c.x; P.y = c.y; }
      P.b.x = P.x; P.b.y = P.y; P.b.vx = c.vx; P.b.vy = c.vy; P.b.onGround = c.onGround;
      P.dir = c.dir;
      // anima a partir do movimento real do rastro
      const sp = Math.abs(P.x - prevX) / dt;
      const s = P.sprite!;
      if (L.state === 'mounted') { s.play(sp > 20 ? 'correr' : 'idle'); }
      else if (c.swim) s.play('nadar');
      else if (c.climb) s.play(c.anim === 'escalar' ? 'escalar' : 'pendurar');
      else if (!c.onGround) s.play(c.vy < -250 ? 'pulo' : c.vy < 250 ? 'apice' : 'queda');
      else if (sp > 360) s.play('correr', { speed: sp / P.stats.run });
      else if (sp > 15) s.play('andar', { speed: Math.max(0.6, sp / P.stats.walk) });
      else if (!s.animName.startsWith('tedio') && s.animName !== 'troca' && s.animName !== 'vitoria') s.play('idle');
      P.tick(dt);
      P.dir = c.dir;
    }

    // ---- tédio em dupla (gag_tedio) ----
    const idle = L.state === 'normal' && L.b.onGround && Math.abs(L.b.vx) < 5 && input.axisX() === 0 && !input.down('action') && !input.down('jump');
    this.boredT = idle ? this.boredT + dt : 0;
    if (this.boredT > 15) { this.boredT = 0; this.playBored(); }

    // ---- fuga do líder perdido ----
    if (this.fleeing) {
      const f = this.fleeing;
      this.fleeT += dt;
      f.x += f.dir * 520 * dt;
      f.y += Math.sin(this.fleeT * 12) * 2 - (this.fleeT < 0.3 ? 300 * dt : 0);
      f.sprite!.play('correr', { speed: 1.4 });
      f.tick(dt);
      if (this.fleeT > 1.6) { f.sprite!.visible = false; if (f.sprite!.shadow) f.sprite!.shadow.style.display = 'none'; this.fleeing = null; }
    }
  }

  private playBored() {
    const kinds = this.partner ? ['tedio-jokenpo', 'tedio-folha', 'tedio-arroto'] : ['tedio'];
    const k = kinds[this.boredIdx++ % kinds.length];
    this.leader.sprite!.play(k, { restart: true });
    if (this.partner) {
      this.partner.dir = this.partner.x < this.leader.x ? 1 : -1;
      this.leader.dir = (this.partner.dir * -1) as 1 | -1;
      this.partner.sprite!.play(k, { restart: true });
      if (k === 'tedio-arroto') window.setTimeout(() => this.world.sfx('arroto', this.leader.x), 900);
      if (k === 'tedio-folha') window.setTimeout(() => this.world.sfx('espirro', this.heroes.tama.x), 650);
    } else this.world.sfx('bocejo', this.leader.x);
    bus.emit('gag', { id: 'gag_tedio' });
  }

  swap() {
    const P = this.partner, L = this.leader;
    if (!P || this.swapCooldown > 0 || L.state !== 'normal') return;
    this.swapCooldown = 0.35;
    const lx = L.x, ly = L.y;
    P.x = lx; P.y = ly; P.b.x = lx; P.b.y = ly; P.b.vx = L.b.vx; P.b.vy = L.b.vy; P.b.onGround = L.b.onGround;
    P.dir = L.dir;
    const c = this.trail[0];
    L.x = c?.x ?? lx - 60; L.y = c?.y ?? ly;
    P.state = 'normal';
    if (L.held) { const h = L.held; L.dropHeld(); P.equip(h); }
    this.leader = P; this.partner = L;
    P.z = 40; L.z = 36;
    P.sprite!.play('troca', { restart: true });
    L.sprite!.play('troca', { restart: true });
    for (let i = 0; i < this.trail.length; i++) this.trail[i] = { ...this.trail[i], x: L.x + ((P.x - L.x) * i) / this.trail.length, y: L.y };
    this.world.sfx('troca', P.x);
    this.world.spawnFx('fx-brilho', 'totem', (P.x + L.x) / 2, P.y - 110, { scale: 0.6 });
    bus.emit('hero-swap', { hero: P.hid });
  }

  private liftPartner() {
    const P = this.partner!;
    this.lifting = true;
    this.leader.setState('carryPartner');
    this.leader.sprite!.play('carregar-parado');
    P.sprite!.play('agachar');
  }
  private throwPartner() {
    const P = this.partner!, L = this.leader;
    this.lifting = false;
    L.setState('throw');
    L.sprite!.play('arremessar-cima', { restart: true });
    this.world.sfx('arremesso', L.x);
    // o parceiro vira líder, lançado para cima e para frente
    P.x = L.x; P.y = L.y - L.h * 0.9; P.b.x = P.x; P.b.y = P.y;
    P.b.vx = L.dir * 180; P.b.vy = -1250; P.b.onGround = false; P.dir = L.dir;
    P.setState('normal');
    this.leader = P; this.partner = L;
    P.z = 40; L.z = 36;
    P.sprite!.play('especial', { restart: true });
    bus.emit('hero-swap', { hero: P.hid, thrown: true });
  }

  /** O líder levou dano: foge (se houver parceiro) ou morre. */
  leaderHit(h: Hero, hit: HitInfo, kind: DeathKind) {
    if (h !== this.leader) return;
    if (this.partner) {
      const P = this.partner;
      this.fleeing = h; this.fleeT = 0;
      h.state = 'hurt';
      h.dir = (hit.dir < 0 ? -1 : 1) as 1 | -1;
      P.x = h.x; P.y = h.y; P.b.x = h.x; P.b.y = h.y; P.b.vx = 0; P.b.vy = -300; P.b.onGround = false;
      P.state = 'hurt'; P.stateT = 0;
      P.invuln = 1.6;
      P.sprite!.play('dano', { restart: true });
      this.leader = P; this.partner = null;
      P.z = 40;
      this.world.partnerLost = true;
      bus.emit('hero-lost', { hero: h.hid });
    } else {
      h.die(kind);
      h.onDeathDone = () => this.world.heroDied();
    }
  }

  /** Ninho do Reencontro */
  recoverPartner(x: number, y: number) {
    if (this.partner) return false;
    const id: HeroId = this.leader.hid === 'tama' ? 'lili' : 'tama';
    const P = this.heroes[id];
    P.x = x; P.y = y; P.b.x = x; P.b.y = y; P.b.vx = 0; P.b.vy = -500;
    P.state = 'normal'; P.sprite!.visible = true; P.sprite!.extraFilter = '';
    P.sprite!.play('troca', { restart: true });
    this.partner = P; P.z = 36;
    this.world.partnerLost = false;
    this.resistUsed = 0;
    this.trail = this.trail.map((c) => ({ ...c, x, y }));
    bus.emit('partner-back');
    return true;
  }

  celebrate() {
    for (const h of [this.leader, this.partner]) if (h) { h.setState('cutscene'); h.sprite!.play('vitoria', { restart: true }); }
    if (this.partner) this.partner.dir = this.partner.x < this.leader.x ? 1 : -1;
  }

  lights(): Light[] { return [this.leader.light(), ...(this.partner ? [{ ...this.partner.light(), r: 110 }] : [])]; }

  render(alpha: number) {
    this.partner?.render();
    if (this.fleeing) this.fleeing.render();
    this.leader.render();
    void alpha;
  }
  destroy() { this.heroes.tama.destroy(); this.heroes.lili.destroy(); }
}
