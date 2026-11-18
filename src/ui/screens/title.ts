/** Tela título (logo em camadas CSS 3D que inclinam com o mouse) e seleção de save. */
import { registerScreen } from './registry';
import { UiScreen, go } from './base';
import { screens } from './manager';
import { input } from '../../core/input';
import { bus } from '../../core/events';
import { game, loadSlot, writeSlot, newSlot, deleteSlot, completion } from '../../core/save';
import { sceneryMeta, anim } from '../../core/assets';
import { Sprite } from '../../render/sprite';
import { carved } from '../components/carved';
import { h, img, prompt, sfx, Menu, fmtTime } from '../components/ui';
import { LEVELS } from '../../data/levels/index';
import { NOME_JOGO } from '../../data/textos';
import { MAP, WORLD_NAMES } from '../../data/world';
import type { SaveSlot } from '../../game/types';

export function logoLayers(cls = 'logo3d') {
  const L = h('div', cls);
  const z = [-60, -20, 30, 70, 110];
  ['folhas', 'placa', 'texto', 'cipos', 'semente'].forEach((n, i) => {
    const im = img(`logo/${n}.svg`, 'logo-layer logo-' + n, i === 2 ? NOME_JOGO : '');
    im.style.transform = `translateZ(${z[i]}px)`;
    L.append(im);
  });
  return L;
}

/* ---------------- Título ---------------- */
class Title extends UiScreen {
  private logo = logoLayers();
  private stage3d = h('div', 'title-3d');
  private bgLayers: HTMLElement[] = [];
  private mx = 0; private my = 0; private tx = 0; private ty = 0;
  private started = false;
  private press = h('div', 'title-press');
  private onMove = (e: MouseEvent) => {
    const r = this.el.getBoundingClientRect();
    this.tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
    this.ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
  };
  constructor() {
    super('title');
    const bg = h('div', 'title-bg');
    bg.style.backgroundImage = 'url(assets/cine/titulo-fundo.webp)';
    this.bgLayers.push(bg);
    this.el.append(bg);
    // camadas de parallax da mata (pré-renderizadas pelo cenário), na frente do fundo
    const par = sceneryMeta().parallax?.['mata'] as { src: string; w: number; h: number }[] | undefined;
    if (par) for (const [k, i] of [[0.35, 3], [0.7, 4]] as [number, number][]) {
      const p = par[i]; if (!p) continue;
      const d = h('div', 'title-par');
      d.style.backgroundImage = `url(${p.src})`;
      d.style.backgroundSize = `auto ${Math.min(720, p.h * 0.75)}px`;
      d.dataset.k = String(k);
      this.bgLayers.push(d);
      this.el.append(d);
    }
    this.stage3d.append(this.logo);
    this.press.append(carved('Pressione', { tone: 'creme', size: 22 }), prompt('confirm'), carved('ou', { tone: 'creme', size: 16 }), h('span', 'pad-start-hint', img('prompts/pad-start.svg')));
    this.el.append(h('div', 'title-light'), this.stage3d, this.press, h('div', 'title-foot', h('span', '', 'Estúdio Sumaúma · Ilha Sumaúma')));
    this.el.addEventListener('mousemove', this.onMove);
    this.el.addEventListener('click', () => this.start());
  }
  enter() { bus.emit('music', 'titulo'); bus.emit('ambience', 'amb-mata'); }
  private start() {
    if (this.started || screens.busy || this.t < 0.5) return;
    this.started = true;
    sfx('ui-confirmar');
    this.press.classList.add('go');
    setTimeout(() => go('saves'), 250);
  }
  update(dt: number) {
    this.t += dt;
    if (input.pressed('confirm') || input.pressed('pause')) this.start();
    // sem mouse, o logo balança devagar sozinho
    const auto = Math.sin(this.t * 0.6) * 0.25;
    this.mx += (this.tx + auto - this.mx) * Math.min(1, dt * 4);
    this.my += (this.ty + Math.cos(this.t * 0.45) * 0.15 - this.my) * Math.min(1, dt * 4);
  }
  render() {
    this.logo.style.transform = `rotateY(${(this.mx * 14).toFixed(2)}deg) rotateX(${(-this.my * 10).toFixed(2)}deg)`;
    this.bgLayers.forEach((b, i) => {
      const k = i === 0 ? 0.15 : Number(b.dataset.k);
      b.style.transform = `translate3d(${(-this.mx * 30 * k).toFixed(1)}px, ${(-this.my * 14 * k).toFixed(1)}px, 0) scale(1.06)`;
    });
  }
  exit() { this.el.removeEventListener('mousemove', this.onMove); }
}
registerScreen('title', () => new Title());

/* ---------------- Seleção de save ---------------- */
const mainLevels = () => Object.values(LEVELS).filter((l) => l.tipo !== 'bonus');
class Saves extends UiScreen {
  private slots: (SaveSlot | null)[] = [];
  private cards: HTMLElement[] = [];
  private row = h('div', 'saves-row');
  private sel = 0;
  private mode: 'slots' | 'confirmDelete' = 'slots';
  private sprites: Sprite[] = [];
  private confirm = h('div', 'saves-confirm');
  constructor() {
    super('saves');
    const bg = h('div', 'title-bg dim'); bg.style.backgroundImage = 'url(assets/cine/titulo-fundo.webp)';
    this.el.append(bg, h('div', 'saves-head', carved('Escolha a trilha', { tone: 'ouro', size: 40 })), this.row, this.confirm,
      h('div', 'prompts-bar', prompt('left', 'Escolher'), prompt('confirm', 'Jogar'), prompt('drop', 'Apagar'), prompt('back', 'Voltar')));
    this.onBack = () => go('title');
    this.build();
  }
  private build() {
    this.sprites.forEach((s) => s.destroy()); this.sprites = [];
    this.row.replaceChildren(); this.cards = [];
    for (let i = 0; i < 3; i++) {
      const s = loadSlot(i);
      this.slots[i] = s;
      const c = h('div', 'save-card panel');
      c.append(h('div', 'save-num', carved(`Trilha ${i + 1}`, { tone: 'ouro', size: 24 })));
      const art = h('div', 'save-art');
      c.append(art);
      if (s) {
        for (const hero of ['tama', 'lili'] as const) {
          if (!anim(hero, 'idle', 'neutro')) continue;
          const sp = new Sprite(hero, 'neutro', s.figurino[hero], art);
          sp.play('idle'); sp.x = hero === 'tama' ? 90 : 170; sp.y = 168; sp.flip = hero === 'lili';
          sp.sx = sp.sy = 0.85;
          this.sprites.push(sp);
        }
        const pct = completion(s, mainLevels());
        c.append(
          h('div', 'save-pct', carved(`${pct}%`, { tone: 'ouro', size: 44 })),
          h('div', 'bar' + (pct >= 100 ? ' ok' : ''), (() => { const b = h('i'); b.style.transform = `scaleX(${pct / 100})`; return b; })()),
          h('div', 'save-stats',
            h('span', 'coin-line', img('hud/balao-tucano.svg'), `× ${s.vidas}`),
            h('span', 'coin-line', img('hud/castanha.svg'), `${s.castanhas + s.banco}`),
            h('span', 'coin-line', img('hud/relogio.svg'), fmtTime(s.playTime))),
          h('div', 'save-where', `${WORLD_NAMES[Math.max(1, ...s.unlocked.map((u) => Math.min(4, MAP.find((n) => n.id === u)?.mundo ?? 1)))]} · ${Object.values(s.levels).filter((l) => l.done).length} fases`),
        );
      } else {
        art.append(img('mapa/presente.svg', 'save-new-art'));
        c.append(h('div', 'save-empty', carved('Novo jogo', { tone: 'creme', size: 28 })), h('p', 'save-hint', 'Uma trilha nova pela Ilha Sumaúma'));
      }
      c.addEventListener('mouseenter', () => { if (this.mode === 'slots') this.focus(i); });
      c.addEventListener('click', () => { if (this.mode === 'slots') { this.focus(i); this.choose(); } });
      this.cards.push(c);
      this.row.append(c);
    }
    this.focus(this.sel, true);
  }
  private focus(i: number, quiet = false) {
    if (i !== this.sel && !quiet) sfx('ui-navegar');
    this.sel = i;
    this.cards.forEach((c, k) => c.classList.toggle('focus', k === i));
  }
  private choose() {
    const i = this.sel;
    sfx('ui-confirmar');
    game.slotIndex = i;
    const s = this.slots[i];
    if (s) { game.save = s; go('map'); }
    else { game.save = newSlot(); writeSlot(i, game.save); go('map'); }
  }
  private askDelete() {
    if (!this.slots[this.sel]) { sfx('ui-erro'); return; }
    this.mode = 'confirmDelete';
    this.confirm.replaceChildren();
    const p = h('div', 'panel claro saves-confirm-box', h('p', 'ui-text', `Apagar a Trilha ${this.sel + 1}? Todo o progresso dela some da ilha.`));
    this.menu = new Menu([
      { label: 'Manter', onSelect: () => this.closeConfirm() },
      { label: 'Apagar', tone: 'ferrugem', onSelect: () => { deleteSlot(this.sel); sfx('madeira-quebrar'); this.closeConfirm(); this.build(); } },
    ], { horizontal: true, size: 20 });
    p.append(this.menu.el);
    this.confirm.append(p);
    this.confirm.classList.add('on');
  }
  private closeConfirm() { this.mode = 'slots'; this.menu = null; this.confirm.classList.remove('on'); }
  update(dt: number) {
    this.t += dt;
    if (screens.busy) return;
    if (this.mode === 'confirmDelete') {
      if (this.menu?.update()) return;
      if (input.pressed('back')) this.closeConfirm();
      return;
    }
    if (input.pressed('left')) this.focus((this.sel + 2) % 3);
    else if (input.pressed('right')) this.focus((this.sel + 1) % 3);
    else if (input.pressed('confirm')) this.choose();
    else if (input.pressed('drop')) this.askDelete();
    else if (input.pressed('back')) { sfx('ui-voltar'); go('title'); }
  }
  render(_a: number, fd: number) { for (const s of this.sprites) { s.update(fd); s.render(); } }
  exit() { this.sprites.forEach((s) => s.destroy()); }
}
registerScreen('saves', () => new Saves());
