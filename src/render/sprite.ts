/**
 * Sprite pré-renderizado: div com background do spritesheet, quadro via background-position.
 * Posição (x,y) = pivot (pés) em px de mundo. Squash/stretch, flip, flash e sombra de contato.
 */
import { anim, shadowOf, type AtlasEntry } from '../core/assets';

export interface PlayOpts { restart?: boolean; speed?: number; onEnd?: () => void; from?: number }

export class Sprite {
  el = document.createElement('div');
  shadow?: HTMLDivElement;
  entry?: AtlasEntry;
  animName = '';
  frame = 0;
  private t = 0;
  speed = 1;
  private onEnd?: () => void;
  ended = false;
  x = 0; y = 0;
  flip = false;
  sx = 1; sy = 1; rot = 0;
  alpha = 1;
  z = 10;
  groundY: number | null = null; // y do chão para a sombra (null = sem sombra)
  flashT = 0;
  extraFilter = '';
  visible = true;
  private lastKey = '';

  constructor(public model: string, public preset = 'selva', public variant = 'base', parent?: HTMLElement, opts: { shadow?: boolean; cls?: string } = {}) {
    this.el.className = 'sprite' + (opts.cls ? ' ' + opts.cls : '');
    if (opts.shadow) {
      const src = shadowOf(model);
      if (src) {
        this.shadow = document.createElement('div');
        this.shadow.className = 'sprite-shadow';
        this.shadow.style.backgroundImage = `url(${src})`;
        parent?.append(this.shadow);
      }
    }
    parent?.append(this.el);
  }

  setPreset(preset: string, variant = this.variant) {
    if (preset === this.preset && variant === this.variant) return;
    this.preset = preset; this.variant = variant;
    const n = this.animName; this.animName = '';
    if (n) this.play(n, { from: this.frame });
  }

  has(name: string) { return !!anim(this.model, name, this.preset, this.variant); }

  play(name: string, o: PlayOpts = {}): this {
    if (name === this.animName && !o.restart) { if (o.speed !== undefined) this.speed = o.speed; if (o.onEnd) this.onEnd = o.onEnd; return this; }
    const e = anim(this.model, name, this.preset, this.variant);
    if (!e) {
      if (name !== 'idle' && this.has('idle')) return this.play('idle', o);
      return this;
    }
    this.entry = e;
    this.animName = name;
    this.frame = Math.min(o.from ?? 0, e.n - 1);
    this.t = 0;
    this.speed = o.speed ?? 1;
    this.onEnd = o.onEnd;
    this.ended = false;
    const rows = Math.ceil(e.n / e.cols);
    this.el.style.width = e.cw + 'px';
    this.el.style.height = e.ch + 'px';
    this.el.style.backgroundImage = `url(${e.src})`;
    this.el.style.backgroundSize = `${e.cols * e.cw}px ${rows * e.ch}px`;
    this.el.style.transformOrigin = `${e.px}px ${e.py}px`;
    if (this.shadow) { this.shadow.style.width = e.cw + 'px'; this.shadow.style.height = e.ch + 'px'; this.shadow.style.transformOrigin = `${e.px}px ${e.py}px`; }
    this.lastKey = '';
    return this;
  }

  update(dt: number) {
    const e = this.entry;
    if (!e || this.ended) return;
    this.t += dt * this.speed * e.fps;
    while (this.t >= 1) {
      this.t -= 1;
      this.frame++;
      if (this.frame >= e.n) {
        if (e.loop) this.frame = 0;
        else { this.frame = e.n - 1; this.ended = true; const cb = this.onEnd; this.onEnd = undefined; cb?.(); break; }
      }
    }
    if (this.flashT > 0) this.flashT -= dt;
  }

  /** Caixa do quadro atual em px de mundo: [x, y, w, h]. */
  box(): [number, number, number, number] {
    const e = this.entry;
    if (!e) return [this.x, this.y, 0, 0];
    const b = e.boxes[this.frame] ?? [0, 0, 0, 0];
    const w = b[2] * Math.abs(this.sx), h = b[3] * this.sy;
    const bx = this.flip ? -(b[0] + b[2]) : b[0];
    return [this.x + bx * Math.abs(this.sx), this.y + b[1] * this.sy, w, h];
  }

  /**
   * Âncora (ex.: 'hand') do quadro atual em px de mundo + ângulo em graus (espaço de tela, horário,
   * do sprite NÃO espelhado). Para desenhar um objeto preso à âncora use rot = ângulo e flip = this.flip.
   */
  anchor(name = 'hand'): [number, number, number] | null {
    const h = this.entry?.hands?.[name]?.[this.frame];
    if (!h) return null;
    const ax = this.flip ? -h[0] : h[0];
    return [this.x + ax * this.sx, this.y + h[1] * this.sy, h[2]];
  }

  render() {
    const e = this.entry;
    if (!e) return;
    if (!this.visible) { this.el.style.display = 'none'; if (this.shadow) this.shadow.style.display = 'none'; return; }
    const col = this.frame % e.cols, row = Math.floor(this.frame / e.cols);
    const fx = this.flip ? -1 : 1;
    const key = `${col},${row}`;
    if (key !== this.lastKey) { this.el.style.backgroundPosition = `${-col * e.cw}px ${-row * e.ch}px`; this.lastKey = key; }
    this.el.style.display = '';
    this.el.style.transform = `translate3d(${(this.x - e.px).toFixed(1)}px, ${(this.y - e.py).toFixed(1)}px, 0) scale(${(this.sx * fx).toFixed(3)}, ${this.sy.toFixed(3)}) rotate(${this.rot.toFixed(1)}deg)`;
    this.el.style.zIndex = String(Math.round(this.z));
    this.el.style.opacity = this.alpha.toFixed(2);
    const fl = this.flashT > 0 ? 'brightness(3) saturate(0.3)' : '';
    const filt = (fl + ' ' + this.extraFilter).trim();
    if (this.el.style.filter !== filt) this.el.style.filter = filt;
    if (this.shadow) {
      if (this.groundY === null) this.shadow.style.display = 'none';
      else {
        const lift = Math.max(0, this.groundY - this.y);
        const k = Math.max(0.35, 1 - lift / 400);
        this.shadow.style.display = '';
        this.shadow.style.opacity = (k * this.alpha).toFixed(2);
        this.shadow.style.transform = `translate3d(${(this.x - e.px).toFixed(1)}px, ${(this.groundY - e.py).toFixed(1)}px, 0) scale(${(k * fx).toFixed(3)}, ${k.toFixed(3)})`;
        this.shadow.style.zIndex = String(Math.round(this.z) - 1);
      }
    }
  }

  flash(sec = 2 / 60) { this.flashT = sec; }

  destroy() { this.el.remove(); this.shadow?.remove(); }
}
