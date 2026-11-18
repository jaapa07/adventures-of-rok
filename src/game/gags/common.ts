/**
 * Peças compartilhadas pelas gags (seção 18): atores de cena, balões de fala, relógio de batida,
 * chuva de castanhas, Javalim de cena (que pode virar hostil) e o registro `gag` por id.
 * Nada aqui depende das classes de inimigos/objetos de outros módulos: os atores usam apenas os
 * sprites dos modelos (docs/MODELS.md).
 */
import { Entity, type HitInfo } from '../entity';
import type { EntitySpawn } from '../types';
import { TILE } from '../types';
import type { World } from '../world';
import type { Hero } from '../hero';
import { bus } from '../../core/events';
import { modelMeta } from '../../core/assets';
import { onBeat } from '../../audio/index';

/* ------------------------------------------------------------------ */
/* Registro por id                                                     */
/* ------------------------------------------------------------------ */
export type GagFactory = (w: World, s: EntitySpawn) => Entity;
export const GAGS: Record<string, GagFactory> = {};
export function defineGag(id: string, f: GagFactory) { GAGS[id] = f; }

/** Marca a gag como ativada pelo jogador (medalha Brincalhona) — uma vez por tentativa. */
export function gagDone(w: World, id: string) {
  if (w.gagsDone.has(id)) return false;
  w.gagsDone.add(id);
  bus.emit('gag', { id });
  return true;
}

/* ------------------------------------------------------------------ */
/* Utilidades                                                          */
/* ------------------------------------------------------------------ */
export const px = (tiles: number) => tiles * TILE;
export const num = (v: unknown, d: number) => (typeof v === 'number' && Number.isFinite(v) ? v : d);
export const pares = (v: unknown): [number, number][] => (Array.isArray(v) ? (v.filter((p) => Array.isArray(p) && p.length >= 2) as [number, number][]) : []);
export const leader = (w: World): Hero => w.duo.leader;

/** Escolhe a primeira animação existente do modelo (os efeitos podem nomear quadros de jeitos diferentes). */
export function animOf(model: string, candidates: string[]): string {
  const meta = modelMeta(model);
  if (!meta) return candidates[0];
  for (const c of candidates) if (meta.anims.includes(c)) return c;
  return meta.anims[0] ?? candidates[0];
}
export function fx(w: World, model: string, candidates: string[], x: number, y: number, o: Parameters<World['spawnFx']>[4] = {}) {
  return w.spawnFx(model, animOf(model, candidates), x, y, o);
}

/** O herói está em cima deste sólido? */
export function onSolid(h: Hero, s: { owner?: unknown } | undefined | null) {
  return !!s && h.b.onGround && h.b.groundSolid === s;
}

/* ------------------------------------------------------------------ */
/* CSS das gags (injetado uma vez)                                     */
/* ------------------------------------------------------------------ */
let cssDone = false;
export function gagCss() {
  if (cssDone || typeof document === 'undefined') return;
  cssDone = true;
  const st = document.createElement('style');
  st.id = 'gags-css';
  st.textContent = CSS;
  document.head.append(st);
}
const CSS = `
.gag-fala { position: absolute; left: 0; top: 0; z-index: 400; pointer-events: none; max-width: 300px; padding: 8px 14px 10px;
  background: #fff8e6; color: #2a1d12; border: 3px solid #2a1d12; border-radius: 18px; font: 700 19px/1.15 var(--fonte-ui, sans-serif);
  box-shadow: 0 5px 0 rgba(42,29,18,.35); white-space: normal; text-align: center; transform-origin: 50% 100%; }
.gag-fala::after { content: ''; position: absolute; left: 50%; bottom: -14px; margin-left: -9px; border: 9px solid transparent; border-top: 12px solid #2a1d12; border-bottom: 0; }
.gag-fala::before { content: ''; position: absolute; left: 50%; bottom: -9px; margin-left: -6px; border: 6px solid transparent; border-top: 9px solid #fff8e6; border-bottom: 0; z-index: 1; }
.gag-fala.grito { background: #ffe25a; font-size: 24px; letter-spacing: 1px; }
.gag-fala.sono { background: #e4ecff; font-style: italic; color: #34405e; border-color: #34405e; }
.gag-zzz { position: absolute; left: 0; top: 0; z-index: 390; font: 900 30px/1 var(--fonte-titulo, serif); color: #e8f0ff; -webkit-text-stroke: 2px #2c3150; paint-order: stroke fill; pointer-events: none; }
.gag-galho { position: absolute; left: 0; top: 0; height: 30px; border-radius: 15px; transform-origin: 0 50%; pointer-events: none;
  background:
    repeating-linear-gradient(92deg, rgba(40,24,12,0) 0 18px, rgba(40,24,12,.5) 18px 20px, rgba(255,220,170,.10) 20px 26px, rgba(40,24,12,0) 26px 41px),
    radial-gradient(ellipse 14px 7px at 30% 45%, rgba(30,18,8,.55) 0 60%, transparent 70%),
    linear-gradient(180deg, #8a6440 0%, #6a4a2e 40%, #4e3420 80%, #33210f 100%);
  box-shadow: inset 0 4px 4px rgba(255,226,180,.22), inset 0 -6px 8px rgba(20,10,4,.5), 0 8px 10px rgba(0,0,0,.25); }
.gag-galho:nth-child(3n)::after { content: ''; position: absolute; left: 40%; top: -10px; width: 26px; height: 14px; border-radius: 0 100% 0 100%;
  background: linear-gradient(135deg, #5aa043, #2f6a2a); transform: rotate(-20deg); }
.gag-cara { position: absolute; left: 0; top: 0; width: 132px; height: 92px; border-radius: 50% 50% 46% 46%; pointer-events: none;
  background: radial-gradient(ellipse 34% 30% at 50% 62%, #f0dcb8 0 90%, transparent 100%),
    radial-gradient(ellipse 20% 16% at 30% 46%, #3a2616 0 80%, transparent 100%),
    radial-gradient(ellipse 20% 16% at 70% 46%, #3a2616 0 80%, transparent 100%),
    radial-gradient(ellipse 52% 50% at 50% 50%, #c9a57c 0 85%, #8a6a48 100%);
  box-shadow: inset 0 -10px 14px rgba(40,24,10,.45), 0 6px 10px rgba(0,0,0,.25); }
.gag-cara::before, .gag-cara::after { content: ''; position: absolute; top: 40px; width: 18px; height: 5px; border-radius: 3px; background: #1d120a; }
.gag-cara::before { left: 32px; } .gag-cara::after { right: 32px; }
.gag-cara.acordada::before, .gag-cara.acordada::after { height: 13px; top: 36px; border-radius: 50%; box-shadow: inset 3px -3px 0 #fff; }
.gag-cara b { position: absolute; left: 56px; top: 60px; width: 20px; height: 8px; border-radius: 0 0 10px 10px; background: #4a1f14; transition: height .4s, top .4s; }
.gag-cara.boceja b { height: 26px; top: 56px; border-radius: 50%; }
.gag-mesa { position: absolute; left: 0; top: 0; width: 170px; height: 64px; pointer-events: none; transform-origin: 50% 100%; }
.gag-mesa::before { content: ''; position: absolute; left: 0; right: 0; top: 0; height: 16px; border-radius: 5px; background: linear-gradient(#a8743e, #7a4f26); border: 3px solid #3b2410; }
.gag-mesa::after { content: ''; position: absolute; left: 20px; right: 20px; top: 16px; height: 48px;
  background: linear-gradient(90deg, #5b3a1b 0 14px, transparent 14px calc(100% - 14px), #5b3a1b calc(100% - 14px)); }
.gag-peca { position: absolute; left: 0; top: 0; width: 14px; height: 26px; border-radius: 3px; background: #fbf7ee; border: 2px solid #1c1c1c; pointer-events: none;
  background-image: radial-gradient(circle at 50% 25%, #111 0 2.5px, transparent 3px), radial-gradient(circle at 50% 75%, #111 0 2.5px, transparent 3px), linear-gradient(transparent 46%, #111 46% 54%, transparent 54%); }
.gag-porta { position: absolute; left: 0; top: 0; width: 92px; height: 160px; pointer-events: none; border-radius: 6px 6px 0 0;
  background: repeating-linear-gradient(90deg, #6d4524 0 22px, #5d3a1d 22px 23px), #6d4524; border: 4px solid #2f1c0c; box-shadow: inset 0 0 0 6px rgba(0,0,0,.15); }
.gag-porta::before { content: 'WC'; position: absolute; left: 22px; top: 22px; width: 40px; padding: 2px 0; text-align: center; font: 900 16px/1 var(--fonte-ui, sans-serif); color: #2a1d12; background: #f3e4b6; border: 2px solid #2a1d12; border-radius: 4px; }
.gag-porta::after { content: ''; position: absolute; right: 12px; top: 84px; width: 10px; height: 10px; border-radius: 50%; background: #e8c24a; border: 2px solid #3a2a0a; }
.gag-porta.aberta { background: #120b06; }
.gag-pista { position: absolute; left: 0; top: 0; pointer-events: none; display: grid; grid-auto-flow: column; gap: 3px; z-index: 5; }
.gag-pista i { display: block; width: 61px; height: 16px; border-radius: 3px; background: #2b1a3a; box-shadow: inset 0 0 0 2px rgba(255,255,255,.08); transition: background .08s, box-shadow .08s; }
.gag-pista i.on { box-shadow: 0 0 22px 6px currentColor, inset 0 0 0 2px rgba(255,255,255,.6); background: currentColor; }
.gag-disco { position: absolute; left: 0; top: 0; pointer-events: none; mix-blend-mode: screen; z-index: 6; border-radius: 30px; }
.gag-fundo { position: absolute; left: 0; top: 0; width: 1280px; height: 720px; pointer-events: none; transform-style: preserve-3d; }
.gag-cortejo { position: absolute; left: 0; top: 0; width: 1px; height: 1px; filter: saturate(.7) brightness(.78) contrast(.9); }
.gag-vara { position: absolute; left: 0; top: 0; height: 9px; border-radius: 5px; background: linear-gradient(#a57a46, #6b4a26); border: 2px solid #3a2410; }
.gag-foto { position: absolute; right: 60px; top: 120px; width: 300px; height: 340px; padding: 14px 14px 56px; background: #fdfaf2; border-radius: 4px; z-index: 30;
  box-shadow: 0 20px 40px rgba(0,0,0,.45); transform: rotate(-5deg) scale(.2); opacity: 0; transition: transform .45s cubic-bezier(.2,1.6,.4,1), opacity .3s; pointer-events: none; }
.gag-foto.on { transform: rotate(-5deg) scale(1); opacity: 1; }
.gag-foto .tela { position: relative; width: 100%; height: 100%; overflow: hidden; border-radius: 2px;
  background: linear-gradient(180deg, #9fd4ff 0%, #d7f0c0 62%, #6aa04a 63%, #3e7a35 100%); }
.gag-foto .legenda { position: absolute; left: 0; right: 0; bottom: 14px; text-align: center; font: 700 20px/1 var(--fonte-ui, sans-serif); color: #3b2a1c; }
.gag-flash { position: absolute; inset: 0; background: #fff; opacity: 0; pointer-events: none; z-index: 29; transition: opacity .35s; }
.rain .gag-gotas { position: absolute; inset: -40px 0 0 0; pointer-events: none; background-repeat: repeat; }
.rain .gag-gotas.css1 { background-image: repeating-linear-gradient(104deg, transparent 0 46px, rgba(205,225,255,.38) 46px 48px, transparent 48px 97px);
  background-size: 97px 180px; animation: gag-chuva 0.45s linear infinite; }
.rain .gag-gotas.css2 { background-image: repeating-linear-gradient(104deg, transparent 0 71px, rgba(225,238,255,.26) 71px 72px, transparent 72px 139px);
  background-size: 139px 120px; animation: gag-chuva2 0.7s linear infinite; }
.rain .gag-gotas.sprite { animation: gag-chuva 0.55s linear infinite; opacity: .75; }
.rain .gag-nevoa { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(60,80,110,.28), rgba(40,60,80,.12) 60%, rgba(30,45,60,.22)); }
.rain .gag-relampago { position: absolute; inset: 0; background: #eef4ff; opacity: 0; mix-blend-mode: screen; }
@keyframes gag-chuva { from { background-position: 0 0; } to { background-position: -40px 180px; } }
@keyframes gag-chuva2 { from { background-position: 0 0; } to { background-position: -28px 120px; } }
.gag-poca { position: absolute; left: 0; top: 0; height: 16px; border-radius: 50%; pointer-events: none; z-index: 15;
  background: radial-gradient(ellipse at 50% 45%, rgba(190,220,255,.55), rgba(80,110,150,.55) 60%, rgba(40,55,80,.0) 72%); transition: opacity 2s; }
.gag-poca::after { content: ''; position: absolute; left: 30%; top: 3px; width: 40%; height: 8px; border-radius: 50%; border: 2px solid rgba(235,245,255,.7); animation: gag-anel 0.9s ease-out infinite; }
.gag-poca.seca::after { animation: none; opacity: 0; }
@keyframes gag-anel { from { transform: scale(.2); opacity: 1; } to { transform: scale(1.4); opacity: 0; } }
.gag-alerta { position: absolute; left: 0; top: 0; z-index: 420; font: 900 46px/1 var(--fonte-titulo, serif); color: #ff4d2e; -webkit-text-stroke: 3px #1d0f08; paint-order: stroke fill; pointer-events: none; }
`;

/* ------------------------------------------------------------------ */
/* Balão de fala (DOM no espaço do mundo) + voz balbuciada            */
/* ------------------------------------------------------------------ */
export class Fala extends Entity {
  el = document.createElement('div');
  t = 0;
  constructor(w: World, public alvo: { x: number; y: number; dead?: boolean }, public texto: string, public alt: number, public dur: number, cls = '') {
    super(w, { t: 'gag-fala', x: alvo.x / TILE, y: alvo.y / TILE });
    gagCss();
    this.persistent = true;
    this.el.className = 'gag-fala' + (cls ? ' ' + cls : '');
    this.el.textContent = texto;
    w.stage.chunksFront.append(this.el);
  }
  update(dt: number) {
    this.t += dt;
    if (this.t > this.dur || this.alvo.dead) this.kill();
  }
  render() {
    const k = this.t < 0.14 ? 0.5 + (this.t / 0.14) * 0.5 : 1;
    const a = this.t > this.dur - 0.25 ? Math.max(0, (this.dur - this.t) / 0.25) : 1;
    this.el.style.transform = `translate3d(${this.alvo.x.toFixed(0)}px, ${(this.alvo.y - this.alt).toFixed(0)}px, 0) translate(-50%, -100%) scale(${k.toFixed(2)})`;
    this.el.style.opacity = a.toFixed(2);
  }
  destroy() { this.el.remove(); }
}

/** Fala com balão e voz (bus 'babble'). `alt` = altura acima dos pés do alvo. */
export function say(w: World, alvo: { x: number; y: number; dead?: boolean }, voice: string, text: string, alt = 150, cls = '') {
  const dur = Math.max(1.6, Math.min(4.2, 0.9 + text.length * 0.06));
  for (const e of w.entities) if (e instanceof Fala && (e.alvo === alvo || (Math.abs(e.alvo.x - alvo.x) < 260 && Math.abs(e.alvo.y - alvo.y) < 200))) e.kill();
  w.add(new Fala(w, alvo, text, alt, dur, cls));
  bus.emit('babble', { voice, text });
}

/* ------------------------------------------------------------------ */
/* Ator de cena                                                        */
/* ------------------------------------------------------------------ */
export interface AtorOpts { anim?: string; t?: string; team?: Entity['team']; shadow?: boolean; w?: number; h?: number; z?: number; variant?: string; front?: boolean; scale?: number }

/** Entidade roteirizável: sprite de um modelo, posição em px, comportamento injetado pela gag. */
export class Ator extends Entity {
  scale = 1;
  ox = 0; oy = 0; rot = 0;
  alpha = 1;
  filter = '';
  squash = 0;
  visible = true;
  tick?: (dt: number) => void;
  hitFn?: (h: HitInfo) => boolean;
  stompFn?: (hero: Hero, heavy: boolean) => 'kill' | 'bounce' | 'hurt';
  luz?: () => { x: number; y: number; r: number } | null;

  constructor(w: World, public model: string, x: number, y: number, public o: AtorOpts = {}) {
    super(w, { t: o.t ?? model, x: x / TILE, y: y / TILE });
    this.x = x; this.y = y;
    this.team = o.team ?? 'neutral';
    this.w = o.w ?? 60; this.h = o.h ?? 100;
    this.z = o.z ?? 22;
    this.scale = o.scale ?? 1;
    this.activeMargin = 900;
  }
  init() {
    this.makeSprite(this.model, this.o.anim ?? 'idle', { shadow: this.o.shadow, variant: this.o.variant, front: this.o.front });
  }
  play(anim: string, o?: Parameters<NonNullable<Entity['sprite']>['play']>[1]) { this.sprite?.play(anim, o); }
  get anim() { return this.sprite?.animName ?? ''; }
  update(dt: number) {
    this.tick?.(dt);
    this.sprite?.update(dt);
    if (this.squash > 0) this.squash = Math.max(0, this.squash - dt * 4);
  }
  /** pulso de squash (ex.: batida da música) */
  pulse(k = 1) { this.squash = 0.25 * k; }
  render() {
    const s = this.sprite;
    if (!s) return;
    s.visible = this.visible;
    s.x = this.x + this.ox; s.y = this.y + this.oy; s.flip = this.dir < 0; s.z = this.z;
    const q = this.squash;
    s.sx = this.scale * (1 + q * 0.6); s.sy = this.scale * (1 - q * 0.5);
    s.rot = this.rot; s.alpha = this.alpha;
    if (s.extraFilter !== this.filter) s.extraFilter = this.filter;
    s.render();
  }
  onHit(h: HitInfo) { return this.hitFn ? this.hitFn(h) : false; }
  onStomp(hero: Entity, heavy: boolean) { return this.stompFn ? this.stompFn(hero as Hero, heavy) : 'bounce'; }
  light() { return this.luz?.() ?? null; }
}

/** Elemento DOM preso ao mundo (camada das entidades), destruído com a gag. */
export function domEl(w: World, cls: string, front = false) {
  gagCss();
  const el = document.createElement('div');
  el.className = cls;
  (front ? w.stage.chunksFront : w.stage.entities).append(el);
  return el;
}
export function place(el: HTMLElement, x: number, y: number, extra = '') {
  el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)${extra ? ' ' + extra : ''}`;
}

/* ------------------------------------------------------------------ */
/* Relógio de batida (sincroniza com a música; 120 BPM sem áudio)      */
/* ------------------------------------------------------------------ */
export class Batida {
  private lastT = -1;
  private per = 0.5;
  private n = 0;
  private off: () => void;
  private prev = -1;
  constructor(private w: World, private bpm = 120) {
    this.per = 60 / bpm;
    this.off = onBeat((b) => {
      const t = this.w.time;
      if (this.lastT >= 0) { const d = t - this.lastT; if (d > 0.2 && d < 1.5) this.per += (d - this.per) * 0.35; }
      this.lastT = t; this.n = b;
    });
  }
  /** a música está mandando batidas agora? */
  get viva() { return this.lastT >= 0 && this.w.time - this.lastT < this.per * 2.5; }
  get periodo() { return this.viva ? this.per : 60 / this.bpm; }
  /** batida contínua (inteiro + fração) */
  get pos() {
    if (this.viva) return this.n + (this.w.time - this.lastT) / this.per;
    return this.w.time / (60 / this.bpm);
  }
  get fase() { const p = this.pos; return p - Math.floor(p); }
  get num() { return Math.floor(this.pos); }
  /** dentro da janela do compasso (logo depois da batida, com tolerância antes) */
  noTempo(depois = 0.24, antes = 0.12) { const f = this.fase; return f < depois || f > 1 - antes; }
  /** true uma vez a cada nova batida */
  bateu() { const n = this.num; if (n !== this.prev) { const first = this.prev < 0; this.prev = n; return !first; } return false; }
  destroy() { this.off(); }
}

/* ------------------------------------------------------------------ */
/* Castanhas que caem e viram coletáveis ao tocar o chão               */
/* ------------------------------------------------------------------ */
export class CastanhaCaindo extends Entity {
  t = 0;
  constructor(w: World, x: number, y: number, vx: number, vy: number) {
    super(w, { t: 'gag-castanha', x: x / TILE, y: y / TILE });
    this.x = x; this.y = y; this.vx = vx; this.vy = vy;
    this.persistent = true;
  }
  init() { this.makeSprite('castanha', 'girar'); this.makeBody(20, 24); this.body!.x = this.x; this.body!.y = this.y; }
  update(dt: number) {
    this.t += dt;
    this.physics(dt, 1900, 760);
    this.vx *= this.body!.onGround ? 0 : 0.995;
    this.sprite!.update(dt);
    if ((this.body!.onGround && this.t > 0.15) || this.t > 4) {
      this.world.spawn({ t: 'castanha', x: this.x / TILE, y: (this.y - 26) / TILE });
      this.kill();
    }
  }
}
/** Solta `n` castanhas num leque determinístico a partir de (x,y). */
export function chuvaCastanhas(w: World, x: number, y: number, n: number, abertura = 260, subida = 620) {
  for (let i = 0; i < n; i++) {
    const k = n === 1 ? 0 : (i / (n - 1)) * 2 - 1;
    const alt = (i % 3) * 70;
    w.add(new CastanhaCaindo(w, x + k * 20, y, k * abertura, -subida - alt));
  }
  w.sfx('pedrinhas', x);
}

/* ------------------------------------------------------------------ */
/* Javalim de cena: dança, joga dominó, vai embora… e vira hostil      */
/* ------------------------------------------------------------------ */
export class JavaliCena extends Ator {
  hostil = false;
  vel = 150;
  alcance = 900;
  limites: [number, number] | null = null;
  morto = false;
  /** chamado quando é derrotado */
  aoDerrotar?: (how: HitInfo['kind']) => void;
  /** chamado ao levar golpe antes de virar hostil (retorne true para consumir) */
  aoGolpeCena?: (h: HitInfo) => boolean;
  stun = 0;
  constructor(w: World, x: number, y: number, anim = 'idle', o: AtorOpts = {}) {
    super(w, 'javalim', x, y, { anim, t: 'javalim', team: 'enemy', w: 56, h: 100, shadow: true, z: 24, ...o });
  }
  init() {
    super.init();
    this.makeBody(56, 100);
    this.body!.x = this.x; this.body!.y = this.y;
    this.hitFn = (h) => this.levaGolpe(h);
    this.stompFn = () => { if (!this.hostil && this.aoGolpeCena?.({ kind: 'pisao', dmg: 1, dir: 1, x: this.x, y: this.y })) return 'bounce'; this.derrota('pisao', 1, false); return 'kill'; };
  }
  /** Vira inimigo comum: persegue o líder, machuca ao encostar. */
  enfurecer(susto = true) {
    if (this.hostil || this.morto) return;
    this.hostil = true;
    this.touchHurts = false;
    if (this.body) { this.body.x = this.x; this.body.y = this.y; this.body.vx = 0; this.body.vy = 0; }
    this.stompable = true;
    this.stun = susto ? 0.7 : 0;
    if (susto) { this.play('susto', { restart: true }); this.sfx('javali-susto'); }
  }
  levaGolpe(h: HitInfo) {
    if (this.morto) return false;
    if (!this.hostil && this.aoGolpeCena?.(h)) return true;
    if (h.dmg <= 0) {
      // batida no chão / susto: fica tonto e acorda bravo
      this.enfurecer(false);
      this.stun = 1.4; this.play('tonto', { restart: true });
      return true;
    }
    this.derrota(h.kind, h.dir, h.kind !== 'arma' && h.kind !== 'pisao' && h.kind !== 'rolar');
    return true;
  }
  derrota(how: HitInfo['kind'], dir: number, contar: boolean) {
    if (this.morto) return;
    this.morto = true;
    this.world.spawnFx('javalim', 'morte', this.x, this.y, { flip: this.dir < 0, vx: dir * 160, vy: -380, gravity: 1900, life: 1.3, fade: 0.4 });
    this.world.spawnFx('fx-fumaca', 'derrota', this.x, this.y - 40);
    this.sfx('inimigo-derrota');
    if (contar) this.world.enemyKilled(this, how === 'pisao' ? 'pisao' : how);
    this.aoDerrotar?.(how);
    this.kill();
  }
  update(dt: number) {
    if (this.hostil && !this.morto) {
      const L = this.world.duo.leader;
      if (this.stun > 0) { this.stun -= dt; this.vx = 0; }
      else {
        this.touchHurts = true;
        const dx = L.x - this.x;
        const perto = Math.abs(dx) < this.alcance && Math.abs(L.y - this.y) < 400;
        this.vx = perto && Math.abs(dx) > 20 ? Math.sign(dx) * this.vel : 0;
        if (this.limites) { if (this.x < this.limites[0] && this.vx < 0) this.vx = 0; if (this.x > this.limites[1] && this.vx > 0) this.vx = 0; }
        if (this.vx) this.dir = this.vx > 0 ? 1 : -1;
        this.play(this.vx ? 'andar' : 'idle', { speed: this.vel / 110 });
      }
      this.physics(dt);
      if (this.y > this.world.grid.pxH + 200) this.kill();
    }
    super.update(dt);
  }
}

/** Gag sem implementação conhecida: entidade inerte (avisa no console para o autor da fase). */
export class GagInerte extends Entity {
  constructor(w: World, s: EntitySpawn) { super(w, s); console.warn('[gag] id desconhecido:', s.id); this.kill(); }
}
