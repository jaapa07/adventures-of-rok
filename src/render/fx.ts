/** Efeitos visuais: sprites de FX pré-renderizados com física simples e pool; textos de onomatopeia. */
import { Sprite } from './sprite';
import type { Stage } from './stage';

export interface FxOpts { flip?: boolean; scale?: number; vx?: number; vy?: number; gravity?: number; life?: number; z?: number; front?: boolean; rot?: number; spin?: number; alpha?: number; fade?: number; loop?: boolean; follow?: { x: number; y: number } }

interface Live { s: Sprite; vx: number; vy: number; g: number; life: number; fade: number; spin: number; loop: boolean; follow?: { x: number; y: number }; ox: number; oy: number; cleanup?: () => void }

export class FxManager {
  private live: Live[] = [];
  private texts: { el: HTMLElement; t: number; life: number; x: number; y: number; vy: number }[] = [];
  static MAX = 160;
  preset = 'neutro';
  constructor(private stage: Stage) {}

  spawn(model: string, anim: string, x: number, y: number, o: FxOpts = {}) {
    if (this.live.length >= FxManager.MAX) { const old = this.live.shift(); old?.s.destroy(); }
    const parent = o.front ? this.stage.chunksFront : this.stage.entities;
    const s = new Sprite(model, this.preset, 'base', parent, { cls: 'fx' });
    s.play(anim, { restart: true });
    if (!s.entry) { s.destroy(); return null; }
    s.x = x; s.y = y; s.flip = !!o.flip; s.sx = s.sy = o.scale ?? 1; s.z = o.z ?? 60; s.rot = o.rot ?? 0; s.alpha = o.alpha ?? 1;
    const l: Live = { s, vx: o.vx ?? 0, vy: o.vy ?? 0, g: o.gravity ?? 0, life: o.life ?? (s.entry.loop ? 1.5 : Infinity), fade: o.fade ?? 0, spin: o.spin ?? 0, loop: o.loop ?? false, follow: o.follow, ox: o.follow ? x - o.follow.x : 0, oy: o.follow ? y - o.follow.y : 0 };
    this.live.push(l);
    return l;
  }

  /** Onomatopeia em fonte autoral (PÓÓIN!, PLAFT, FOOM!, PÁ!). */
  text(str: string, x: number, y: number, cls = '') {
    const el = document.createElement('div');
    el.className = 'onomato ' + cls;
    el.textContent = str;
    this.stage.chunksFront.append(el);
    this.texts.push({ el, t: 0, life: 0.8, x, y, vy: -90 });
  }

  update(dt: number) {
    for (let i = this.live.length - 1; i >= 0; i--) {
      const l = this.live[i];
      l.s.update(dt);
      l.vy += l.g * dt;
      if (l.follow) { l.s.x = l.follow.x + l.ox; l.s.y = l.follow.y + l.oy; }
      else { l.s.x += l.vx * dt; l.s.y += l.vy * dt; }
      l.s.rot += l.spin * dt;
      l.life -= dt;
      if (l.fade > 0 && l.life < l.fade) l.s.alpha = Math.max(0, l.life / l.fade);
      if ((l.s.ended && !l.loop) || l.life <= 0) { l.s.destroy(); l.cleanup?.(); this.live.splice(i, 1); }
    }
    for (let i = this.texts.length - 1; i >= 0; i--) {
      const t = this.texts[i];
      t.t += dt; t.y += t.vy * dt; t.vy *= 0.92;
      if (t.t >= t.life) { t.el.remove(); this.texts.splice(i, 1); }
    }
  }
  render() {
    for (const l of this.live) l.s.render();
    for (const t of this.texts) {
      const k = t.t < 0.12 ? 0.4 + (t.t / 0.12) * 0.8 : 1.2 - Math.min(0.2, (t.t - 0.12) * 0.6);
      t.el.style.transform = `translate3d(${t.x}px, ${t.y}px, 0) translate(-50%, -100%) scale(${k.toFixed(3)}) rotate(-6deg)`;
      t.el.style.opacity = String(t.t > t.life - 0.2 ? (t.life - t.t) / 0.2 : 1);
    }
  }
  clear() { for (const l of this.live) l.s.destroy(); this.live = []; for (const t of this.texts) t.el.remove(); this.texts = []; }
}
