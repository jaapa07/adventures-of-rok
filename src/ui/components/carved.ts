/**
 * Texto na fonte autoral "Sumaúma Entalhada": cada letra é um <use> do sprite de glifos
 * (public/assets/ui/fonte.svg, injetado uma vez no documento) pintado em camadas de entalhe.
 */
import { carvedLayers, GLYPH_PAD, SPACE_W, type CarvedTone } from './carved-style';

const NS = 'http://www.w3.org/2000/svg';
const widths = new Map<string, number>();
let ready = false;
let loading: Promise<void> | null = null;
const pending = new Set<CarvedText>();
let uid = 0;

export function loadFont(): Promise<void> {
  if (!loading) {
    loading = fetch('assets/ui/fonte.svg').then((r) => r.text()).then((txt) => {
      const doc = new DOMParser().parseFromString(txt, 'image/svg+xml');
      const host = document.createElementNS(NS, 'svg');
      host.setAttribute('aria-hidden', 'true');
      host.setAttribute('width', '0');
      host.setAttribute('height', '0');
      host.style.position = 'absolute';
      const defs = doc.querySelector('defs');
      if (defs) host.append(document.importNode(defs, true));
      document.body.append(host);
      host.querySelectorAll('path[id^="g-"]').forEach((p) => {
        const ch = String.fromCodePoint(parseInt(p.id.slice(2), 16));
        widths.set(ch, Number(p.getAttribute('data-w')));
      });
      ready = true;
      for (const t of pending) t.draw();
      pending.clear();
    }).catch((e) => { console.error('[ui] fonte entalhada', e); });
  }
  return loading;
}

export interface CarvedOpts { tone?: CarvedTone; size?: number; cls?: string }

/** Texto entalhado. `size` = altura das maiúsculas em px. */
export class CarvedText {
  el = document.createElement('span');
  private text = '';
  constructor(text: string, public o: CarvedOpts = {}) {
    this.el.className = 'carved' + (o.cls ? ' ' + o.cls : '');
    this.set(text);
  }
  set(text: string | number) {
    const t = String(text).toLocaleUpperCase('pt-BR');
    if (t === this.text && this.el.firstChild) return this;
    this.text = t;
    this.el.setAttribute('aria-label', t);
    if (ready) this.draw(); else { pending.add(this); this.el.style.minHeight = `${(this.o.size ?? 32) * 1.6}px`; }
    return this;
  }
  get value() { return this.text; }
  draw() {
    const size = this.o.size ?? 32;
    const k = size / 90;
    const id = `ct${++uid}`;
    let x = 0;
    let uses = '';
    for (const ch of this.text) {
      const w = widths.get(ch);
      if (w === undefined) { x += SPACE_W; continue; }
      uses += `<use href="#g-${ch.codePointAt(0)!.toString(16)}" x="${x + GLYPH_PAD}"/>`;
      x += w + GLYPH_PAD * 2;
    }
    const W = Math.max(x, 1);
    const layers = carvedLayers(this.o.tone ?? 'ouro')
      .map((L) => `<use href="#${id}" transform="translate(${L.dx} ${L.dy})" stroke="${L.stroke}" stroke-width="${L.w}" opacity="${L.op}"/>`).join('');
    const vbY = -26, vbH = 172;
    this.el.style.minHeight = '';
    this.el.innerHTML = `<svg xmlns="${NS}" viewBox="-8 ${vbY} ${W + 16} ${vbH}" width="${((W + 16) * k).toFixed(1)}" height="${(vbH * k).toFixed(1)}" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><defs><g id="${id}">${uses}</g></defs>${layers}</svg>`;
  }
}

export function carved(text: string | number, o: CarvedOpts = {}): HTMLElement {
  return new CarvedText(String(text), o).el;
}
