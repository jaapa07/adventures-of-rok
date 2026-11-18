/** Splash do estúdio, cinemáticas (abertura e final) e créditos. */
import { registerScreen } from './registry';
import { UiScreen, go } from './base';
import { screens } from './manager';
import { input } from '../../core/input';
import { bus } from '../../core/events';
import { game, completion } from '../../core/save';
import { anim, preload } from '../../core/assets';
import { Sprite } from '../../render/sprite';
import { carved } from '../components/carved';
import { h, img, prompt, sfx, UI, fitSprite } from '../components/ui';
import { ABERTURA, FINAL, FINAL_EXTRA, CREDITOS, NOME_JOGO, type CenaCine } from '../../data/textos';
import { LEVELS } from '../../data/levels/index';

/* ---------------- Splash: Estúdio Sumaúma com a folha brotando ---------------- */
let aberturaVista = false;
class Splash extends UiScreen {
  private done = false;
  constructor() {
    super('splash');
    const logo = h('div', 'splash-logo');
    fetch(UI + 'estudio.svg').then((r) => r.text()).then((t) => { logo.innerHTML = t; logo.classList.add('play'); });
    this.el.append(h('div', 'splash-center', logo, h('div', 'splash-name', carved('Estúdio Sumaúma', { tone: 'creme', size: 34 })), h('p', 'splash-sub', 'apresenta')));
  }
  update(dt: number) {
    this.t += dt;
    if (this.done) return;
    if (this.t > 2.6 || (this.t > 0.4 && (input.pressed('confirm') || input.pressed('back') || input.pressed('pause')))) {
      this.done = true;
      go(aberturaVista ? 'title' : 'intro');
    }
  }
}
registerScreen('splash', () => new Splash());

/* ---------------- Cinemática: quadros pré-renderizados com legenda ---------------- */
class Cinema extends UiScreen {
  private i = -1;
  private sceneT = 0;
  private frames: HTMLElement[] = [];
  private legend = h('div', 'cine-legend');
  private done = false;
  private skipHold = 0;
  private skipBar = h('i');
  constructor(private cenas: CenaCine[], private next: () => void, private music: string) {
    super('cinema');
    for (const c of cenas) {
      const f = h('div', 'cine-frame');
      f.style.backgroundImage = `url(assets/${c.img})`;
      const p = c.pan ?? [0, 0, 0, 0];
      f.style.setProperty('--x0', p[0] + '%'); f.style.setProperty('--y0', p[1] + '%');
      f.style.setProperty('--x1', p[2] + '%'); f.style.setProperty('--y1', p[3] + '%');
      f.style.setProperty('--dur', c.dur + 1 + 's');
      this.frames.push(f);
      this.el.append(f);
      preload(`assets/${c.img}`);
    }
    this.el.append(h('div', 'cine-bars'), this.legend,
      h('div', 'cine-skip', prompt('confirm', 'Avançar'), h('span', 'cine-skip-hold', prompt('back', 'Pular (segure)'), h('span', 'bar cine-skip-bar', this.skipBar))));
  }
  enter() { bus.emit('music', this.music); this.show(0); }
  private show(i: number) {
    if (i >= this.cenas.length) { this.finish(); return; }
    this.frames[this.i]?.classList.remove('on');
    this.frames[this.i]?.classList.add('off');
    this.i = i; this.sceneT = 0;
    const f = this.frames[i];
    f.classList.remove('off'); void f.offsetWidth; f.classList.add('on');
    this.legend.classList.remove('on'); void this.legend.offsetWidth;
    this.legend.replaceChildren(h('p', '', this.cenas[i].legenda));
    this.legend.classList.add('on');
  }
  private finish() { if (this.done) return; this.done = true; this.next(); }
  update(dt: number) {
    if (this.done || screens.busy) return;
    this.sceneT += dt;
    if (this.sceneT > this.cenas[this.i].dur || input.pressed('confirm')) { if (this.sceneT > 0.3) this.show(this.i + 1); }
    if (input.down('back') || input.down('pause')) this.skipHold += dt; else this.skipHold = Math.max(0, this.skipHold - dt * 2);
    this.skipBar.style.transform = `scaleX(${Math.min(1, this.skipHold / 0.8)})`;
    if (this.skipHold > 0.8) { sfx('ui-voltar'); this.finish(); }
  }
}
registerScreen('intro', () => new Cinema(ABERTURA, () => { aberturaVista = true; go('title'); }, 'titulo'));
registerScreen('ending', () => {
  const all = Object.values(LEVELS).filter((l) => l.tipo !== 'bonus');
  const cem = completion(game.save, all) >= 100;
  game.save.finalVisto = true;
  game.persist();
  return new Cinema(cem ? [...FINAL, FINAL_EXTRA] : FINAL, () => go('credits'), 'final');
});

/* ---------------- Créditos com ilustrações dos personagens ---------------- */
class Credits extends UiScreen {
  private roll = h('div', 'credits-roll');
  private y = 760;
  private sprites: Sprite[] = [];
  private speed = 52;
  private done = false;
  constructor() {
    super('credits');
    this.el.append(h('div', 'credits-bg'), this.roll, h('div', 'credits-vignette'), h('div', 'prompts-bar', prompt('confirm', 'Acelerar'), prompt('back', 'Sair')));
    this.roll.append(h('div', 'credits-logo', img('logo/folhas.svg'), img('logo/placa.svg'), img('logo/texto.svg'), img('logo/cipos.svg'), img('logo/semente.svg')));
    let side = 0;
    for (const sec of CREDITOS) {
      this.roll.append(h('div', 'credits-sec', carved(sec.titulo, { tone: 'ouro', size: 30 })));
      for (const it of sec.itens) {
        const row = h('div', 'credits-row' + (side++ % 2 ? ' flip' : ''));
        const txt = h('div', 'credits-txt', h('p', 'credits-papel', it.papel), carved(it.nome, { tone: 'creme', size: 26 }));
        row.append(txt);
        if (it.retrato && anim(it.retrato.m, it.retrato.a, 'neutro')) {
          const box = h('div', 'credits-art');
          const sp = new Sprite(it.retrato.m, 'neutro', it.retrato.v ?? 'base', box);
          sp.play(it.retrato.a);
          sp.flip = side % 2 === 0;
          fitSprite(sp, 130, 228, 240, 210, 1.6);
          this.sprites.push(sp);
          row.append(box);
        }
        this.roll.append(row);
      }
    }
    this.roll.append(h('div', 'credits-end', carved('Obrigado por jogar', { tone: 'ouro', size: 40 }), h('p', '', NOME_JOGO + ' — Ilha Sumaúma')));
  }
  enter() { bus.emit('music', 'creditos'); }
  update(dt: number) {
    if (this.done || screens.busy) return;
    this.y -= dt * this.speed * (input.down('confirm') ? 5 : 1);
    this.roll.style.transform = `translate3d(0, ${this.y.toFixed(1)}px, 0)`;
    const end = -this.roll.offsetHeight + 300;
    if (this.y < end || input.pressed('back')) { this.done = true; go('map'); }
  }
  render(_a: number, fd: number) { for (const s of this.sprites) { s.update(fd); s.render(); } }
}
registerScreen('credits', () => new Credits());
