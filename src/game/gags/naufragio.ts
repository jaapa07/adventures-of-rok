/**
 * gag_naufragio (3-3) — O BAÚ-BOCA DO NAVIO.
 * Um baú do navio afundado é na verdade uma boca: quando o líder entra na sala, ele acorda e persegue
 * ("perseguir", "morder" de perto; encostar machuca). Golpes e pisões só o deixam tonto. Jogar o
 * PEIXE SECO o distrai: ele vai atrás do peixe (arremessado, largado no chão da sala, ou o tapa
 * molhado 'weapon-hit' de peixe, que ele arranca da mão) e fica 5 s comendo ("comer-peixe"),
 * inofensivo, abrindo a passagem. Também aceita bus 'peixe-isca' {x, y} (isca colocada por script).
 *
 * Spawn (tiles):
 *   { t: 'gag', id: 'gag_naufragio', x, y, x0, x1, y0?, y1? }
 *   - x, y: pés do baú; x0..x1 (y0..y1): limites da sala (ele não sai dela)
 */
import { Entity } from '../entity';
import type { EntitySpawn } from '../types';
import type { World } from '../world';
import { bus } from '../../core/events';
import { defineGag, gagDone, say, Ator, num, px, fx } from './common';

type Estado = 'quieto' | 'persegue' | 'tonto' | 'isca' | 'come';

class Naufragio extends Entity {
  bau!: Ator;
  estado: Estado = 'quieto';
  t = 0; mordeT = 0;
  x0: number; x1: number; y0: number; y1: number;
  isca: { x: number; y: number; e?: Entity } | null = null;
  private offs: (() => void)[] = [];
  constructor(w: World, s: EntitySpawn) {
    super(w, s);
    this.x0 = px(num(s.x0, s.x - 8)); this.x1 = px(num(s.x1, s.x + 8));
    this.y0 = px(num(s.y0, s.y - 8)); this.y1 = px(num(s.y1, s.y));
    this.persistent = true;
  }
  init() {
    const w = this.world;
    this.bau = w.add(new Ator(w, 'bau-boca', this.x, this.y, { anim: 'idle', t: 'bau-boca', team: 'enemy', w: 96, h: 80, z: 24, shadow: true }));
    this.bau.persistent = true;
    this.bau.stompable = true;
    this.bau.stompFn = () => { this.atordoar(); return 'bounce'; };
    this.bau.hitFn = (h) => {
      if (h.weapon === 'peixe') { this.arrancarPeixe(); return true; }
      if (h.dmg > 0 || h.heavy) { this.atordoar(); this.bau.x += h.dir * 50; return true; }
      return false;
    };
    this.offs.push(bus.on('peixe-isca', (d) => { if (d && this.naSala(d.x, d.y)) this.irIsca(d.x, d.y); }));
    this.offs.push(bus.on('weapon-hit', (d) => { if (d?.id === 'peixe' && d.target === 'bau-boca' && this.estado !== 'come') this.arrancarPeixe(); }));
  }
  naSala(x: number, y: number) { return x >= this.x0 && x <= this.x1 && y >= this.y0 - 64 && y <= this.y1 + 64; }
  private atordoar() {
    if (this.estado === 'come') return;
    this.estado = 'tonto'; this.t = 0;
    this.bau.play('tonto', { restart: true });
    this.bau.sfx('pooin', 0.6);
  }
  private arrancarPeixe() {
    const L = this.world.duo.leader;
    if (L.held?.def.id === 'peixe') L.dropHeld(false);
    this.comer();
  }
  private irIsca(x: number, y: number, e?: Entity) {
    if (this.estado === 'come') return;
    this.isca = { x, y, e };
    this.estado = 'isca'; this.t = 0;
    say(this.world, this.bau, 'javalim', 'Peixinho?!', 110);
  }
  private comer() {
    const w = this.world;
    this.estado = 'come'; this.t = 0;
    if (this.isca?.e && !this.isca.e.dead) this.isca.e.kill();
    this.isca = null;
    this.bau.touchHurts = false;
    this.bau.play('comer-peixe', { restart: true });
    w.text('NHAC! NHAC!', this.bau.x, this.bau.y - 120);
    w.sfx('bau-mordida', this.bau.x);
    if (gagDone(w, 'gag_naufragio')) w.toast('O Baú-Boca caiu na isca!', 'peixe');
  }
  update(dt: number) {
    this.t += dt;
    const w = this.world, L = w.duo.leader, B = this.bau;
    // peixe solto ou arremessado na sala vira isca
    if (this.estado !== 'come' && this.estado !== 'isca') {
      for (const e of w.entities) {
        if (e.dead || e.spawn.id !== 'peixe' || (e.spawn.t !== 'arremessado' && e.spawn.t !== 'arma')) continue;
        if (this.naSala(e.x, e.y)) { this.irIsca(e.x, e.y, e); break; }
      }
    }
    const lideraNaSala = this.naSala(L.x, L.y);
    let tx = B.x, ty = B.y, vel = 0;
    switch (this.estado) {
      case 'quieto':
        B.play('idle'); B.touchHurts = false;
        if (lideraNaSala) { this.estado = 'persegue'; this.t = 0; B.sfx('bau-mordida'); w.text('NHÉC!', B.x, B.y - 110); say(w, B, 'javalim', 'Visita! Hora do lanche!', 110); }
        break;
      case 'persegue':
        B.touchHurts = true;
        tx = L.x; ty = L.y; vel = 125;
        if (Math.hypot(L.x - B.x, L.y - B.y) < 120) {
          B.play('morder');
          this.mordeT -= dt;
          if (this.mordeT <= 0) { this.mordeT = 0.55; B.sfx('bau-mordida', 0.7); }
        } else B.play('perseguir');
        if (!lideraNaSala && this.t > 1) { this.estado = 'quieto'; }
        break;
      case 'tonto':
        B.touchHurts = false;
        if (this.t > 1.3) { this.estado = 'persegue'; this.t = 0; }
        break;
      case 'isca': {
        B.touchHurts = true;
        const i = this.isca!;
        if (i.e && !i.e.dead) { i.x = i.e.x; i.y = i.e.y; }
        tx = i.x; ty = i.y; vel = 230;
        B.play('perseguir', { speed: 1.6 });
        if (Math.hypot(i.x - B.x, i.y - B.y) < 70 || this.t > 4) this.comer();
        break;
      }
      case 'come':
        B.touchHurts = false;
        if (Math.floor(this.t * 2) !== Math.floor((this.t - dt) * 2)) { B.sfx('bau-mordida', 0.4); fx(w, 'fx-agua', ['bolha-p'], B.x + B.dir * 30, B.y - 70); }
        if (this.t > 5) { this.estado = lideraNaSala ? 'persegue' : 'quieto'; this.t = 0; say(w, B, 'javalim', 'Burp! Tem mais?', 110); }
        break;
    }
    if (vel > 0) {
      const dx = tx - B.x, dy = ty - B.y, d = Math.hypot(dx, dy) || 1;
      B.x += (dx / d) * vel * dt;
      B.y += (dy / d) * vel * 0.6 * dt;
      if (Math.abs(dx) > 8) B.dir = dx > 0 ? 1 : -1;
    }
    B.x = Math.max(this.x0 + 40, Math.min(this.x1 - 40, B.x));
    B.y = Math.max(this.y0 + 40, Math.min(this.y1, B.y));
  }
  destroy() { this.offs.forEach((f) => f()); }
}

defineGag('gag_naufragio', (w, s) => new Naufragio(w, s));
