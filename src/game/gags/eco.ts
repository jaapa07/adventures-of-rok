/**
 * gag_eco (2-1) — O SALÃO DO ECO.
 * Dentro da área, segurar a TROCA faz o líder gritar (o diretor liga world.duo.shoutMode enquanto ele
 * está na área, então o grito sai mesmo com o parceiro junto). O grito ('hero-shout') solta uma onda
 * de luz que revela a caverna escura por 2 s: uma luz grande que cresce a partir do herói e ecos de
 * luz que "batem" em pontos do salão em sequência (fx-eco), com gotas ecoando.
 *
 * Spawn (tiles):
 *   { t: 'gag', id: 'gag_eco', x, y, x0, x1, y0?, y1?, pontos? }
 *   - x, y: um ponto qualquer do salão (usado só como referência)
 *   - x0..x1 (e y0..y1, opcionais): área do salão onde o grito funciona
 *   - pontos: [[x,y],…] em tiles onde o eco bate (padrão: a cada 5 colunas na altura do herói)
 *   A região escura vem de LevelDef.regions ({ escuro: true }).
 */
import { Entity } from '../entity';
import type { EntitySpawn } from '../types';
import type { World } from '../world';
import type { Light } from '../../render/lighting';
import { bus } from '../../core/events';
import { defineGag, gagDone, num, px, pares, fx } from './common';

const DUR = 2.0;

class Eco extends Entity {
  x0: number; x1: number; y0: number; y1: number;
  pontos: [number, number][];
  onda: { x: number; y: number; t: number; ecos: { x: number; y: number; d: number; ok: boolean }[] } | null = null;
  luzes: Light[] = [];
  ligouGrito = false;
  private off?: () => void;
  constructor(w: World, s: EntitySpawn) {
    super(w, s);
    this.x0 = px(num(s.x0, s.x - 10)); this.x1 = px(num(s.x1, s.x + 10));
    this.y0 = px(num(s.y0, -1000)); this.y1 = px(num(s.y1, 10000));
    this.pontos = pares(s.pontos).map(([a, b]) => [px(a), px(b)]);
    this.persistent = true;
  }
  dentro(x: number, y: number) { return x >= this.x0 && x <= this.x1 && y >= this.y0 && y <= this.y1; }
  init() {
    this.off = bus.on('hero-shout', (d) => { if (d && this.dentro(d.x, d.y)) this.gritar(d.x, d.y); });
  }
  private gritar(x: number, y: number) {
    const w = this.world;
    const pts = this.pontos.length ? this.pontos : (() => {
      const out: [number, number][] = [];
      for (let k = this.x0 + 2 * 64; k <= this.x1 - 2 * 64; k += 5 * 64) out.push([k, y - 140]);
      return out;
    })();
    const ecos = pts.map(([px0, py0]) => ({ x: px0, y: py0, d: Math.hypot(px0 - x, py0 - y), ok: false })).sort((a, b) => a.d - b.d).slice(0, 7);
    this.onda = { x, y: y - 80, t: 0, ecos };
    fx(w, 'fx-eco', ['onda', 'eco', 'idle'], x, y - 60, { scale: 2.2 });
    w.text('ÔÔÔÔÔ!', x, y - 190);
    if (gagDone(w, 'gag_eco')) w.toast('O eco revela a caverna!', 'eco');
  }
  update(dt: number) {
    const w = this.world, L = w.duo.leader;
    const dentro = this.dentro(L.x, L.y);
    if (dentro && !w.duo.shoutMode) { w.duo.shoutMode = true; this.ligouGrito = true; }
    else if (!dentro && this.ligouGrito) { w.duo.shoutMode = false; this.ligouGrito = false; }
    // remove as luzes do quadro anterior
    for (const l of this.luzes) { const i = w.lights.indexOf(l); if (i >= 0) w.lights.splice(i, 1); }
    this.luzes = [];
    const o = this.onda;
    if (!o) return;
    o.t += dt;
    const fade = o.t > DUR ? Math.max(0, 1 - (o.t - DUR) / 0.5) : 1;
    if (fade <= 0) { this.onda = null; return; }
    const cresce = 1 - Math.pow(1 - Math.min(1, o.t / 0.55), 3);
    this.luzes.push({ x: o.x, y: o.y, r: 1150 * cresce * fade, flicker: 0.02 });
    let sons = 0;
    for (const e of o.ecos) {
      const t0 = e.d / 1300;
      if (o.t < t0) continue;
      if (!e.ok) {
        e.ok = true;
        fx(w, 'fx-eco', ['onda', 'eco', 'idle'], e.x, e.y, { scale: 1.4 });
        if (sons++ < 1) w.sfx('gota-eco', e.x, 0.6);
        w.text('eco…', e.x, e.y - 40, 'small');
      }
      const k = Math.min(1, (o.t - t0) / 0.3);
      this.luzes.push({ x: e.x, y: e.y, r: 420 * k * fade, flicker: 0.05 });
    }
    w.lights.push(...this.luzes);
  }
  destroy() {
    this.off?.();
    for (const l of this.luzes) { const i = this.world.lights.indexOf(l); if (i >= 0) this.world.lights.splice(i, 1); }
    if (this.ligouGrito) this.world.duo.shoutMode = false;
  }
}

defineGag('gag_eco', (w, s) => new Eco(w, s));
