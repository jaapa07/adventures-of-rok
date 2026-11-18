/** Escuridão de caverna em CSS: overlay com máscaras radiais nas fontes de luz (espaço de tela). */
import { VIEW_W, VIEW_H } from './stage';

export interface Light { x: number; y: number; r: number; flicker?: number }

export class Darkness {
  el = document.createElement('div');
  level = 0; // 0 = sem escuridão, 1 = total
  private target = 0;
  private t = 0;
  constructor(parent: HTMLElement, color = 'rgba(6,4,12,0.94)') {
    this.el.className = 'darkness';
    this.el.style.background = color;
    parent.append(this.el);
  }
  set(on: boolean) { this.target = on ? 1 : 0; }
  update(dt: number) { this.t += dt; this.level += (this.target - this.level) * Math.min(1, dt * 3); }
  /** lights em coordenadas de TELA */
  render(lights: Light[]) {
    if (this.level < 0.02) { this.el.style.display = 'none'; return; }
    this.el.style.display = '';
    this.el.style.opacity = this.level.toFixed(3);
    const masks = lights.slice(0, 12).map((l) => {
      const r = l.r * (1 + Math.sin(this.t * 9 + l.x * 0.01) * (l.flicker ?? 0.03));
      return `radial-gradient(circle at ${l.x.toFixed(0)}px ${l.y.toFixed(0)}px, transparent ${(r * 0.45).toFixed(0)}px, rgba(0,0,0,0.55) ${(r * 0.8).toFixed(0)}px, black ${r.toFixed(0)}px)`;
    });
    const m = masks.length ? masks.join(', ') : 'linear-gradient(black, black)';
    this.el.style.maskImage = m;
    (this.el.style as any).webkitMaskImage = m;
    (this.el.style as any).maskComposite = 'intersect';
    (this.el.style as any).webkitMaskComposite = 'source-in';
    this.el.style.width = VIEW_W + 'px';
    this.el.style.height = VIEW_H + 'px';
  }
}
