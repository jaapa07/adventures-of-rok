/**
 * O mundo de uma fase: grade, entidades, dupla de heróis, câmera, efeitos, regiões e fluxo.
 */
import { TILE, type LevelDef, type Region, type CameraZone, type EntitySpawn } from './types';
import { Grid, T, isSolid as isSolidTile, type Solid } from './physics';
import { Entity, factoryFor, type HitInfo } from './entity';
import { Stage, VIEW_W, VIEW_H } from '../render/stage';
import { ChunkLayer } from '../render/chunks';
import { FxManager, type FxOpts } from '../render/fx';
import { Darkness, type Light } from '../render/lighting';
import { sceneryMeta, preload } from '../core/assets';
import { bus } from '../core/events';
import { hitStop } from '../core/loop';
import { game } from '../core/save';
import { Duo } from './duo';
import { current } from './session';

/** tipos que, uma vez coletados, não reaparecem na mesma tentativa de fase */
const ONCE = new Set(['castanha', 'cacho', 'letra', 'moeda-folha', 'ficha', 'parafuso', 'balao', 'ninho', 'caixa-montaria', 'parede-rachada', 'terra-mole', 'bloco-madeira']);

export interface WorldHooks {
  onComplete(time: number): void;
  onDeath(): void; // sem vidas → game over decide quem chamou
  onExitBonus?(ok: boolean): void;
  onEnterBonus?(room: string, from: [number, number]): void;
}

export class World {
  grid: Grid;
  entities: Entity[] = [];
  solids: Solid[] = [];
  duo!: Duo;
  fx: FxManager;
  darkness: Darkness;
  chunksBack?: ChunkLayer;
  chunksFront?: ChunkLayer;
  preset: string;
  time = 0;
  paused = false;
  finished = false;
  camX = 0; camY = 0;
  private camTargetZoom = 1; private camTilt: [number, number] = [0, 0];
  private shakeAmp = 0; private shakeT = 0; private shakeDur = 0;
  lights: Light[] = [];
  regionFlags: Region = { x0: 0, x1: 0 };
  /** entidades (ex.: Rainha Morcega) podem forçar a escuridão independente das regiões */
  forceDark = false;
  scriptCam: { x: number; y: number; zoom?: number; tilt?: [number, number] } | null = null;
  autoScrollX: number | null = null;
  checkpoint: [number, number];
  letras = [false, false, false, false];
  coinsTaken = 0;
  partnerLost = false;
  gagsDone = new Set<string>();
  combo = 0;
  waterEls: HTMLElement[] = [];
  rainEl?: HTMLElement;
  sunsetEl?: HTMLElement;
  private toAdd: Entity[] = [];

  constructor(public stage: Stage, public level: LevelDef, public hooks: WorldHooks, startOverride?: [number, number]) {
    this.grid = new Grid(level.tilemap);
    this.preset = level.preset;
    this.fx = new FxManager(stage);
    this.fx.preset = level.preset === 'caverna' || level.preset === 'recife' ? level.preset : 'neutro';
    this.checkpoint = startOverride ?? level.start;
    stage.clearWorld();
    stage.levelH = this.grid.pxH;
    this.darkness = new Darkness(stage.overlay);
    this.setupLayers();
    this.setupWater();
    this.spawnAll();
    if (new URLSearchParams(location.search).has('debug')) this.debugGrid();
    const cp = game.save.lastCheckpoint;
    const start: [number, number] = startOverride ?? (cp && cp.level === level.id ? [cp.x, cp.y] : level.start);
    this.duo = new Duo(this, start[0] * TILE, start[1] * TILE);
    this.snapCamera();
  }

  /* ------------------------------------------------------------------ */
  private setupLayers() {
    const sc = sceneryMeta();
    const par = sc.parallax?.[this.level.parallax] ?? [];
    this.stage.setParallax(par, this.level.sky ?? sc.sky?.[this.level.parallax] ?? '#123');
    this.stage.setQuality(game.options.qualidade);
    const base = `assets/levels/${this.level.id}`;
    const man = (sc.levels ?? {})[this.level.id] as { back: string[]; front: string[] } | undefined;
    fetch(`${base}/chunks.json`).then((r) => r.json()).then((m: { back: string[]; front: string[] }) => {
      this.chunksBack = new ChunkLayer(this.stage.chunksBack, base, m.back, 'b_');
      this.chunksFront = new ChunkLayer(this.stage.chunksFront, base, m.front, 'f_');
    }).catch(() => { void man; });
  }

  private setupWater() {
    const sc = sceneryMeta();
    const water = sc.water?.[this.level.tileset];
    const g = this.grid;
    const isW = (x: number, y: number) => { const t = g.at(x, y); return t === T.WATER || t === T.WATER_VINE; };
    const mk = (cls: string, x: number, y: number, w: number, h: number) => {
      const el = document.createElement('div');
      el.className = cls;
      el.style.transform = `translate3d(${x * TILE}px, ${y * TILE}px, 0)`;
      el.style.width = w * TILE + 'px';
      el.style.height = h * TILE + 'px';
      if (water) {
        el.style.setProperty('--water', water.color);
        if (water.surface) el.style.setProperty('--surface', `url(assets/${water.surface})`);
      }
      this.stage.chunksFront.append(el);
      this.waterEls.push(el);
    };
    // corpo: retângulos máximos por colunas contíguas (corridas horizontais estendidas para baixo)
    const used = new Uint8Array(g.w * g.h);
    for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) {
      if (used[y * g.w + x] || !isW(x, y)) continue;
      let x1 = x; while (x1 < g.w && isW(x1, y) && !used[y * g.w + x1]) x1++;
      let y1 = y + 1;
      outer: while (y1 < g.h) { for (let xx = x; xx < x1; xx++) if (!isW(xx, y1) || used[y1 * g.w + xx]) break outer; y1++; }
      for (let yy = y; yy < y1; yy++) for (let xx = x; xx < x1; xx++) used[yy * g.w + xx] = 1;
      mk('water', x, y, x1 - x, y1 - y);
    }
    // superfície: só nas células cuja de cima não é água
    for (let y = 0; y < g.h; y++) {
      let x = 0;
      while (x < g.w) {
        if (isW(x, y) && !isW(x, y - 1) && !isSolidTile(g.at(x, y - 1))) {
          let x1 = x; while (x1 < g.w && isW(x1, y) && !isW(x1, y - 1) && !isSolidTile(g.at(x1, y - 1))) x1++;
          mk('water-surface', x, y, x1 - x, 0);
          x = x1;
        } else x++;
      }
    }
  }

  private spawnAll() {
    const L = this.level;
    for (const s of L.entities) this.spawn(s);
    for (const trail of L.coins) {
      const step = trail.step ?? 0.75;
      for (let i = 0; i < trail.path.length - 1; i++) {
        const [ax, ay] = trail.path[i], [bx, by] = trail.path[i + 1];
        const len = Math.hypot(bx - ax, by - ay);
        const n = Math.max(1, Math.round(len / step));
        for (let k = 0; k < n; k++) this.spawn({ t: 'castanha', x: ax + ((bx - ax) * k) / n, y: ay + ((by - ay) * k) / n });
      }
      const last = trail.path[trail.path.length - 1];
      this.spawn({ t: trail.cacho ? 'cacho' : 'castanha', x: last[0], y: last[1] });
    }
    L.letras?.forEach(([x, y], i) => { if (!(game.save.levels[L.id]?.letras)) this.spawn({ t: 'letra', x, y, i }); });
    if (L.moedaFolha && !game.save.levels[L.id]?.moeda) this.spawn({ t: 'moeda-folha', x: L.moedaFolha[0], y: L.moedaFolha[1] });
    if (L.exit) this.spawn({ t: 'totem-saida', x: L.exit[0], y: L.exit[1] });
    if (L.checkpoint) this.spawn({ t: 'totem-cipo', x: L.checkpoint[0], y: L.checkpoint[1] });
    this.flushAdds();
  }

  /** ?debug: desenha a colisão do tilemap (ajuda a desenhar fases) */
  private debugGrid() {
    const g = this.grid;
    for (let y = 0; y < g.h; y++) {
      let x = 0;
      while (x < g.w) {
        const t = g.at(x, y);
        if (t === T.EMPTY) { x++; continue; }
        let x1 = x; while (x1 < g.w && g.at(x1, y) === t) x1++;
        const el = document.createElement('div');
        el.className = t === T.WATER ? 'debug-water' : 'debug-solid';
        el.style.left = x * TILE + 'px'; el.style.top = y * TILE + (t === T.ONEWAY ? 0 : 0) + 'px';
        el.style.width = (x1 - x) * TILE + 'px'; el.style.height = (t === T.ONEWAY || t === T.ROPE ? 10 : TILE) + 'px';
        if (t === T.SLOPE_R || t === T.SLOPE_L) el.style.clipPath = t === T.SLOPE_R ? 'polygon(100% 0, 100% 100%, 0 100%)' : 'polygon(0 0, 100% 100%, 0 100%)';
        if (t === T.VINE) { el.style.width = '10px'; el.style.left = x * TILE + 27 + 'px'; }
        this.stage.chunksBack.append(el);
        x = x1;
      }
    }
  }

  spawn(s: EntitySpawn): Entity | null {
    const ses = current.session;
    if (ses && ONCE.has(s.t) && ses.collected.has(ses.key(s.t, s.x * TILE, s.y * TILE))) return null;
    const f = factoryFor(s.t);
    if (!f) { console.warn('[fase] tipo de entidade não registrado:', s.t); return null; }
    const e = f(this, s);
    this.add(e);
    return e;
  }
  add<E extends Entity>(e: E): E { this.toAdd.push(e); return e; }
  private flushAdds() { while (this.toAdd.length) { const e = this.toAdd.shift()!; this.entities.push(e); e.init(); } }

  /** marca a entidade como coletada/destruída nesta tentativa (não reaparece após bônus/respawn) */
  collect(e: Entity) { const ses = current.session; if (ses) ses.collected.add(ses.key(e.spawn.t, e.spawn.x * TILE, e.spawn.y * TILE)); }

  addSolid(s: Solid) { this.solids.push(s); return s; }
  removeSolid(s: Solid) { const i = this.solids.indexOf(s); if (i >= 0) this.solids.splice(i, 1); }
  solidsFor(e: Entity) { return e.solid ? this.solids.filter((s) => s !== e.solid) : this.solids; }

  /* ------------------------------------------------------------------ */
  update(dt: number) {
    if (this.paused) return;
    this.time += dt;
    this.flushAdds();
    this.duo.update(dt);
    const cx = this.camX + VIEW_W / 2, cy = this.camY + VIEW_H / 2;
    for (const e of this.entities) {
      if (e.dead) continue;
      if (!e.persistent && (Math.abs(e.x - cx) > VIEW_W / 2 + e.activeMargin || Math.abs(e.y - cy) > VIEW_H / 2 + e.activeMargin)) continue;
      e.update(dt);
    }
    for (let i = this.entities.length - 1; i >= 0; i--) if (this.entities[i].dead) { this.entities[i].destroy(); this.entities.splice(i, 1); }
    this.updateRegions(dt);
    this.updateCamera(dt);
    this.fx.update(dt);
    this.darkness.update(dt);
  }

  private updateRegions(_dt: number) {
    const hx = this.duo.leader.x / TILE, hy = this.duo.leader.y / TILE;
    const flags: Region = { x0: 0, x1: 0 };
    for (const r of this.level.regions ?? []) {
      if (hx >= r.x0 && hx <= r.x1 && (r.y0 === undefined || hy >= r.y0) && (r.y1 === undefined || hy <= r.y1)) Object.assign(flags, r);
    }
    if (!!flags.chuva !== !!this.regionFlags.chuva) this.setRain(!!flags.chuva);
    if (!!flags.porDoSol !== !!this.regionFlags.porDoSol) this.setSunset(!!flags.porDoSol);
    this.darkness.set(!!flags.escuro || this.forceDark);
    this.regionFlags = flags;
  }

  setRain(on: boolean) {
    if (on && !this.rainEl) {
      this.rainEl = document.createElement('div');
      this.rainEl.className = 'rain';
      this.stage.overlay.append(this.rainEl);
      bus.emit('ambience', 'amb-chuva');
    }
    this.rainEl?.classList.toggle('on', on);
    if (!on) bus.emit('ambience', null);
  }
  setSunset(on: boolean) {
    if (!this.sunsetEl) {
      this.sunsetEl = document.createElement('div');
      this.sunsetEl.className = 'sunset-tint';
      this.stage.overlay.prepend(this.sunsetEl);
      const sc = sceneryMeta();
      const par = sc.parallax?.['mata-tarde'];
      if (par) par.forEach((p: { src: string }) => preload(p.src));
    }
    this.sunsetEl.classList.toggle('on', on);
    const sc = sceneryMeta();
    const set = on ? 'mata-tarde' : this.level.parallax;
    const par = sc.parallax?.[set];
    if (par) this.stage.setParallax(par, sc.sky?.[set] ?? '#000');
    this.preset = on ? 'por-do-sol' : this.level.preset;
    this.duo.setPreset(this.preset);
  }

  /* ---------------- câmera ---------------- */
  private zoneAt(): CameraZone | null {
    const hx = this.duo.leader.x / TILE;
    for (const z of this.level.cameraZones ?? []) if (hx >= z.x0 && hx <= z.x1) return z;
    return null;
  }
  snapCamera() {
    const l = this.duo.leader;
    this.camX = this.clampX(l.x - VIEW_W / 2);
    this.camY = this.clampY(l.y - VIEW_H * 0.62);
  }
  /** com zoom < 1 a tela mostra mais mundo: a margem extra mantém a vista dentro da fase (sem faixa vazia nas bordas) */
  private zoomMargin(view: number) { const z = Math.min(1, this.stage.zoom || 1); return (view * (1 / z - 1)) / 2; }
  private clampX(x: number) { const m = this.zoomMargin(VIEW_W); const max = this.grid.pxW - VIEW_W - m; return max < m ? (this.grid.pxW - VIEW_W) / 2 : Math.max(m, Math.min(x, max)); }
  private clampY(y: number) { const m = this.zoomMargin(VIEW_H); const max = this.grid.pxH - VIEW_H - m; return max < m ? (this.grid.pxH - VIEW_H) / 2 : Math.max(m, Math.min(y, max)); }
  private updateCamera(dt: number) {
    const l = this.duo.leader;
    const z = this.zoneAt();
    let tx: number, ty: number;
    if (this.scriptCam) { tx = this.scriptCam.x - VIEW_W / 2; ty = this.scriptCam.y - VIEW_H / 2; }
    else {
      const look = Math.max(-120, Math.min(120, l.vx * 0.35));
      const fx = l.x + look;
      const sx = this.camX + VIEW_W / 2;
      tx = this.camX;
      if (fx > sx + 80) tx = fx - 80 - VIEW_W / 2;
      else if (fx < sx - 80) tx = fx + 80 - VIEW_W / 2;
      const footY = l.y - VIEW_H * 0.62;
      ty = this.camY;
      if (l.body?.onGround || l.climbing || l.swimming || footY > this.camY + 45 || footY < this.camY - 160) ty = footY;
      if (z?.lockY !== undefined) ty = z.lockY * TILE - VIEW_H / 2;
    }
    if (z?.autoScroll) { this.autoScrollX = (this.autoScrollX ?? this.camX) + z.autoScroll * dt; tx = Math.max(tx, this.autoScrollX); }
    const k = 1 - Math.pow(0.0001, dt); // suavização ~0.1 por quadro a 60 Hz
    this.camX += (this.clampX(tx) - this.camX) * Math.min(1, k * 1.6);
    this.camY += (this.clampY(ty) - this.camY) * Math.min(1, k * 1.2);
    if (this.autoScrollX !== null) this.camX = Math.max(this.camX, Math.min(this.autoScrollX, this.grid.pxW - VIEW_W));
    this.camTargetZoom = this.scriptCam?.zoom ?? z?.zoom ?? 1;
    const tilt = this.scriptCam?.tilt ?? [z?.tiltX ?? 0, z?.tiltY ?? 0];
    this.stage.zoom += (this.camTargetZoom - this.stage.zoom) * Math.min(1, dt * 2.5);
    this.camTilt[0] += (tilt[0] - this.camTilt[0]) * Math.min(1, dt * 2.5);
    this.camTilt[1] += (tilt[1] - this.camTilt[1]) * Math.min(1, dt * 2.5);
    // tremor
    if (this.shakeT > 0 && game.options.tremor) {
      this.shakeT -= dt;
      const a = this.shakeAmp * Math.max(0, this.shakeT / this.shakeDur);
      this.stage.shakeX = Math.sin(this.time * 91) * a;
      this.stage.shakeY = Math.cos(this.time * 77) * a * 0.8;
    } else { this.stage.shakeX = 0; this.stage.shakeY = 0; }
  }

  render(alpha: number) {
    this.stage.camX = this.camX; this.stage.camY = this.camY;
    this.stage.tiltX = this.camTilt[0]; this.stage.tiltY = this.camTilt[1];
    this.stage.render();
    this.chunksBack?.update(this.camX, this.camY, this.stage.zoom);
    this.chunksFront?.update(this.camX, this.camY, this.stage.zoom);
    for (const e of this.entities) e.render(alpha);
    this.duo.render(alpha);
    this.fx.render();
    // luzes (espaço de tela)
    const L: Light[] = this.duo.lights().concat(this.lights);
    for (const e of this.entities) { const le = (e as unknown as { light?: () => Light | null }).light?.(); if (le) L.push(le); }
    this.darkness.render(L.map((l) => ({ ...l, x: (l.x - this.camX) * this.stage.zoom + (VIEW_W * (1 - this.stage.zoom)) / 2, y: (l.y - this.camY) * this.stage.zoom + (VIEW_H * (1 - this.stage.zoom)) / 2 })));
  }

  /* ---------------- serviços ---------------- */
  sfx(id: string, x?: number, vol = 1) {
    const pan = x === undefined ? 0 : Math.max(-1, Math.min(1, (x - this.camX - VIEW_W / 2) / (VIEW_W / 2)));
    bus.emit('sfx', { id, pan, vol });
  }
  shake(amp: number, ms: number) { this.shakeAmp = Math.max(this.shakeAmp * (this.shakeT > 0 ? 1 : 0), amp); this.shakeT = this.shakeDur = ms / 1000; }
  hitstop(ms: number) { hitStop(ms); }
  spawnFx(model: string, anim: string, x: number, y: number, o?: FxOpts) { return this.fx.spawn(model, anim, x, y, o); }
  text(s: string, x: number, y: number, cls?: string) { this.fx.text(s, x, y, cls); }
  toast(text: string, icon?: string) { bus.emit('toast', { text, icon }); }

  /** Aplica um golpe numa área (retângulo com x,y = pés/centro-base). Retorna entidades atingidas. */
  hitArea(area: { x: number; y: number; w: number; h: number }, hit: HitInfo, filter: (e: Entity) => boolean = (e) => e.team === 'enemy' || e.team === 'neutral'): Entity[] {
    const out: Entity[] = [];
    for (const e of this.entities) {
      if (e.dead || !filter(e) || e === hit.source) continue;
      if (Math.abs(e.x - area.x) < (e.w + area.w) / 2 && e.y - e.h < area.y && e.y > area.y - area.h) {
        if (e.onHit(hit)) out.push(e);
      }
    }
    return out;
  }
  enemiesNear(x: number, y: number, r: number) { return this.entities.filter((e) => !e.dead && e.team === 'enemy' && Math.hypot(e.x - x, e.y - y) < r); }
  find<E extends Entity>(pred: (e: Entity) => boolean): E | undefined { return this.entities.find(pred) as E | undefined; }
  byTag(tag: string) { return this.entities.filter((e) => e.tag === tag); }
  /** inimigo derrotado: combo, fx, eventos */
  enemyKilled(e: Entity, how: HitInfo['kind'], weapon?: string) {
    if (!this.duo.leader.body?.onGround) this.combo++; else this.combo = 1;
    bus.emit('enemy-kill', { type: e.spawn.t, how, weapon });
    bus.emit('combo', { n: this.combo });
  }

  setCheckpoint(x: number, y: number) {
    this.checkpoint = [x / TILE, y / TILE];
    game.save.lastCheckpoint = { level: this.level.id, x: x / TILE, y: y / TILE };
    bus.emit('checkpoint');
  }

  complete() {
    if (this.finished) return;
    this.finished = true;
    // concluir uma sala bônus não apaga o Totem de Cipó da fase principal
    if (this.level.tipo !== 'bonus') game.save.lastCheckpoint = undefined;
    bus.emit('level-end', { id: this.level.id, time: this.time });
    this.hooks.onComplete(this.time);
  }

  /** herói morreu: perde vida e recomeça no checkpoint (ou game over). */
  heroDied() {
    game.save.vidas--;
    bus.emit('vida', { n: game.save.vidas });
    this.hooks.onDeath();
  }

  destroy() {
    for (const e of this.entities) e.destroy();
    this.entities = [];
    this.duo.destroy();
    this.fx.clear();
    this.chunksBack?.clear(); this.chunksFront?.clear();
    this.darkness.el.remove();
    this.waterEls.forEach((w) => w.remove());
    this.rainEl?.remove(); this.sunsetEl?.remove();
    this.stage.zoom = 1; this.stage.tiltX = this.stage.tiltY = 0;
  }
}
