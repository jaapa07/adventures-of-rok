/** Pequenos componentes DOM da interface: elementos, ícones de comando, menus navegáveis. */
import { input, promptFor, lastDevice, onDeviceChange, type Action } from '../../core/input';
import { bus } from '../../core/events';
import { carved, type CarvedOpts } from './carved';

export const UI = 'assets/ui/';

export function h<K extends keyof HTMLElementTagNameMap>(tag: K, cls = '', ...kids: (Node | string | null | undefined | false)[]): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  for (const k of kids) if (k !== null && k !== undefined && k !== false) e.append(k);
  return e;
}
export function img(src: string, cls = '', alt = ''): HTMLImageElement {
  const i = document.createElement('img');
  i.src = src.startsWith('assets/') ? src : UI + src;
  i.className = cls;
  i.alt = alt;
  i.draggable = false;
  return i;
}
export const sfx = (id: string, vol = 1) => bus.emit('sfx', { id, pan: 0, vol });

/* ---------------- ícones de comando (teclado / gamepad) ---------------- */
const PAD_ICON: Partial<Record<Action, string>> = { jump: 'a', confirm: 'a', action: 'x', swap: 'y', drop: 'b', back: 'b', pause: 'start', pocket: 'lb', left: 'dpad', right: 'dpad', up: 'dpad', down: 'dpad' };
const live = new Set<{ el: HTMLElement; a: Action }>();
function fillPrompt(el: HTMLElement, a: Action) {
  el.replaceChildren();
  if (lastDevice === 'pad') {
    const icon = PAD_ICON[a] ?? 'a';
    el.className = 'prompt pad ' + icon;
    el.append(img(`prompts/pad-${icon}.svg`));
  } else {
    const label = promptFor(a);
    el.className = 'prompt key' + (label.length > 2 ? ' wide' : '');
    const arrows: Record<string, string> = { Left: '←', Right: '→', Up: '↑', Down: '↓' };
    el.append(h('b', '', arrows[label] ?? label.replace('Digit', '').replace('Backspace', '⌫')));
  }
}
onDeviceChange(() => { for (const p of [...live]) { if (!p.el.isConnected) { live.delete(p); continue; } fillPrompt(p.el, p.a); } });
/** Ícone do comando (troca sozinho entre teclado e gamepad conforme o último dispositivo usado). */
export function prompt(a: Action, text?: string): HTMLElement {
  const wrap = h('span', 'prompt-line');
  const el = h('span', 'prompt');
  fillPrompt(el, a);
  live.add({ el, a });
  wrap.append(el);
  if (text) wrap.append(h('span', 'prompt-text', text));
  return wrap;
}
export function refreshPrompts() { for (const p of [...live]) if (p.el.isConnected) fillPrompt(p.el, p.a); else live.delete(p); }

/* ---------------- botões e menus ---------------- */
export interface MenuItem {
  label: string;
  onSelect?: () => void;
  disabled?: boolean | (() => boolean);
  /** valor ajustável com ←/→ (opções) */
  onAdjust?: (dir: -1 | 1) => void;
  value?: () => string;
  small?: boolean;
  tone?: CarvedOpts['tone'];
}
export class Menu {
  el: HTMLElement;
  items: { def: MenuItem; el: HTMLElement; val?: HTMLElement }[] = [];
  index = 0;
  enabled = true;
  constructor(defs: MenuItem[], public o: { horizontal?: boolean; cls?: string; size?: number } = {}) {
    this.el = h('div', 'menu' + (o.horizontal ? ' horizontal' : '') + (o.cls ? ' ' + o.cls : ''));
    defs.forEach((d) => this.add(d));
    this.focus(this.firstEnabled(0, 1));
  }
  add(d: MenuItem) {
    const b = h('div', 'btn' + (d.small ? ' small' : ''));
    b.append(img('painel/folha-foco.svg', 'btn-leaf'));
    b.append(carved(d.label, { tone: d.tone ?? 'creme', size: this.o.size ?? (d.small ? 17 : 22) }));
    let val: HTMLElement | undefined;
    if (d.value) { val = h('span', 'btn-value'); b.append(val); }
    const i = this.items.length;
    b.addEventListener('mouseenter', () => { if (!this.isDisabled(i) && this.enabled) this.focus(i, true); });
    b.addEventListener('mousedown', () => { if (!this.isDisabled(i)) b.classList.add('pressed'); });
    b.addEventListener('mouseup', () => b.classList.remove('pressed'));
    b.addEventListener('mouseleave', () => b.classList.remove('pressed'));
    b.addEventListener('click', (e) => {
      if (!this.enabled || this.isDisabled(i)) return;
      if (d.onAdjust && !d.onSelect) { d.onAdjust(e.offsetX > b.clientWidth / 2 ? 1 : -1); this.refresh(); sfx('ui-navegar'); return; }
      this.focus(i); this.activate();
    });
    this.items.push({ def: d, el: b, val });
    this.el.append(b);
    this.refresh();
    return b;
  }
  isDisabled(i: number) { const d = this.items[i]?.def.disabled; return typeof d === 'function' ? d() : !!d; }
  firstEnabled(from: number, dir: 1 | -1) {
    const n = this.items.length;
    for (let k = 0; k < n; k++) { const i = (from + dir * k + n * 4) % n; if (!this.isDisabled(i)) return i; }
    return from;
  }
  focus(i: number, quiet = false) {
    if (i !== this.index && !quiet) sfx('ui-navegar', 0.7);
    this.index = i;
    this.items.forEach((it, k) => it.el.classList.toggle('focus', k === i));
    this.items[i]?.el.scrollIntoView?.({ block: 'nearest' });
  }
  refresh() {
    this.items.forEach((it, k) => {
      it.el.classList.toggle('disabled', this.isDisabled(k));
      if (it.val && it.def.value) it.val.textContent = it.def.value();
    });
  }
  activate() {
    const it = this.items[this.index];
    if (!it || this.isDisabled(this.index)) { sfx('ui-erro'); return; }
    it.el.classList.add('pressed');
    setTimeout(() => it.el.classList.remove('pressed'), 140);
    sfx('ui-confirmar');
    it.def.onSelect?.();
    this.refresh();
  }
  /** Lê a entrada; retorna true se consumiu algo. */
  update(): boolean {
    if (!this.enabled || !this.items.length) return false;
    const prev = this.o.horizontal ? 'left' : 'up', next = this.o.horizontal ? 'right' : 'down';
    if (input.pressed(prev)) { this.focus(this.firstEnabled(this.index - 1, -1)); return true; }
    if (input.pressed(next)) { this.focus(this.firstEnabled(this.index + 1, 1)); return true; }
    const it = this.items[this.index];
    if (!this.o.horizontal && it?.def.onAdjust) {
      if (input.pressed('left')) { it.def.onAdjust(-1); sfx('ui-navegar'); this.refresh(); return true; }
      if (input.pressed('right')) { it.def.onAdjust(1); sfx('ui-navegar'); this.refresh(); return true; }
    }
    if (input.pressed('confirm')) { this.activate(); return true; }
    return false;
  }
}

/** Painel de madeira com título entalhado. */
export function panel(cls = '', title?: string, tone: CarvedOpts['tone'] = 'ouro'): HTMLElement {
  const p = h('div', 'panel ' + cls);
  if (title) p.append(h('div', 'panel-title', carved(title, { tone, size: 30 })));
  return p;
}

export function fmtTime(sec: number) {
  const s = Math.floor(sec);
  const hh = Math.floor(s / 3600), mm = Math.floor((s % 3600) / 60), ss = s % 60;
  return hh > 0 ? `${hh}h${String(mm).padStart(2, '0')}` : `${mm}:${String(ss).padStart(2, '0')}`;
}

/** Espera n segundos (para sequências de animação em telas). */
export const wait = (s: number) => new Promise<void>((r) => setTimeout(r, s * 1000));

/** Enquadra um sprite pelo contorno real do quadro: centro-x em cx, base em baseY, cabendo em w×h (escala máx. kMax). */
export function fitSprite(sp: { entry?: { boxes: number[][] }; frame: number; x: number; y: number; sx: number; sy: number; flip: boolean }, cx: number, baseY: number, w: number, hgt: number, kMax = 1) {
  const b = sp.entry?.boxes[sp.frame] ?? sp.entry?.boxes[0];
  if (!b || !b[2] || !b[3]) { sp.x = cx; sp.y = baseY; return; }
  const k = Math.min(kMax, w / b[2], hgt / b[3]);
  sp.sx = sp.sy = k;
  const mid = (b[0] + b[2] / 2) * k;
  sp.x = cx - (sp.flip ? -mid : mid);
  sp.y = baseY - (b[1] + b[3]) * k;
}
