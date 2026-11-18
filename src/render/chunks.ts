/** Chunks de fase pré-compostos no bake (512×512). Só os visíveis + 1 de margem ficam no DOM. */
import { VIEW_W, VIEW_H } from './stage';

export const CHUNK = 512;
export interface ChunkManifest { w: number; h: number; back: string[]; front: string[] }

export class ChunkLayer {
  private live = new Map<string, HTMLImageElement>();
  private pool: HTMLImageElement[] = [];
  private set: Set<string>;
  constructor(private parent: HTMLElement, private base: string, keys: string[], private prefix: string) {
    this.set = new Set(keys);
  }
  update(camX: number, camY: number, zoom = 1) {
    const m = CHUNK;
    const padX = (VIEW_W / zoom - VIEW_W) / 2 + m, padY = (VIEW_H / zoom - VIEW_H) / 2 + m;
    const x0 = Math.floor((camX - padX) / CHUNK), x1 = Math.floor((camX + VIEW_W + padX) / CHUNK);
    const y0 = Math.floor((camY - padY) / CHUNK), y1 = Math.floor((camY + VIEW_H + padY) / CHUNK);
    const want = new Set<string>();
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { const k = `${x}_${y}`; if (this.set.has(k)) want.add(k); }
    for (const [k, img] of this.live) if (!want.has(k)) { img.remove(); this.pool.push(img); this.live.delete(k); }
    for (const k of want) {
      if (this.live.has(k)) continue;
      const img = this.pool.pop() ?? document.createElement('img');
      img.className = 'chunk';
      img.decoding = 'async';
      img.draggable = false;
      const [x, y] = k.split('_').map(Number);
      img.src = `${this.base}/${this.prefix}${k}.webp`;
      img.style.transform = `translate3d(${x * CHUNK}px, ${y * CHUNK}px, 0)`;
      this.parent.append(img);
      this.live.set(k, img);
    }
  }
  clear() { for (const img of this.live.values()) img.remove(); this.live.clear(); }
}
