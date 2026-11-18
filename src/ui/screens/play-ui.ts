/** Telas ligadas à fase: cartão de entrada, pausa, resultados e Game Over. */
import { registerScreen } from './registry';
import { UiScreen, go } from './base';
import { screens } from './manager';
import { PlayScreen } from './play';
import { input } from '../../core/input';
import { bus } from '../../core/events';
import { game } from '../../core/save';
import { carved, CarvedText } from '../components/carved';
import { h, img, prompt, sfx, Menu, fmtTime, wait, fitSprite } from '../components/ui';
import { Sprite } from '../../render/sprite';
import { WORLD_NAMES } from '../../data/world';
import { LEVELS } from '../../data/levels/index';
import { DESAFIOS } from '../../data/desafios';
import { MEDALHAS } from '../../data/textos';
import { avancoNaFase } from '../systems';
import type { LevelDef } from '../../game/types';
import type { LevelResult } from '../../game/progress';
import type { Session } from '../../game/session';

/* ---------------- Cartão de entrada ---------------- */
class LevelCard extends UiScreen {
  overlay = true;
  private closing = false;
  constructor(private L: LevelDef) {
    super('levelcard');
    const tone = L.mundo === 2 ? 'ouro' : L.mundo === 3 ? 'creme' : L.mundo === 4 ? 'ferrugem' : 'verde';
    this.el.append(h('div', 'lc-shade'), h('div', 'lc-plank', h('div', 'lc-world', carved(L.tipo === 'chefe' ? 'Chefe' : `${WORLD_NAMES[L.mundo] ?? ''} · ${L.id}`, { tone, size: 20 })),
      carved(L.nome, { tone: 'ouro', size: 52 })));
    this.el.classList.add('mundo-' + L.mundo);
  }
  enter() { sfx('totem-girar', 0.6); }
  update(dt: number) {
    this.t += dt;
    if (!this.closing && (this.t > 2.3 || (this.t > 0.5 && (input.pressed('confirm') || input.pressed('jump'))))) {
      this.closing = true;
      this.el.classList.add('out');
      setTimeout(() => { if (screens.top === this) screens.pop(); }, 420);
    }
  }
}
registerScreen('levelcard', ({ level }: { level: LevelDef }) => new LevelCard(level));

/* ---------------- Pausa ---------------- */
function desafiosAtivos(n = 4) {
  const s = game.save;
  return DESAFIOS.filter((d) => !s.desafiosOk.includes(d.id))
    .map((d) => ({ d, p: (s.desafios[d.id] ?? 0) / d.meta, fase: avancoNaFase.has(d.id) }))
    .sort((a, b) => Number(b.fase) - Number(a.fase) || b.p - a.p)
    .slice(0, n);
}
export function desafioRow(titulo: string, cur: number, meta: number, ok = false, antes?: number) {
  const bar = h('div', 'bar' + (ok ? ' ok' : ''));
  const fill = h('i'); fill.style.transform = `scaleX(${Math.min(1, cur / meta)})`;
  bar.append(fill);
  if (antes !== undefined && antes < cur) { const g = h('b', 'bar-ganho'); g.style.left = `${(antes / meta) * 100}%`; g.style.width = `${((cur - antes) / meta) * 100}%`; bar.append(g); }
  return h('div', 'desafio-row' + (ok ? ' ok' : ''), h('div', 'desafio-top', h('span', 'desafio-tit', titulo), h('span', 'desafio-num', ok ? 'Concluído!' : `${cur}/${meta}`)), bar);
}

class Pause extends UiScreen {
  overlay = true;
  constructor(private play: PlayScreen) {
    super('pause');
    bus.emit('sfx', { id: 'ui-pausa' });
    const L = play.main;
    this.menu = new Menu([
      { label: 'Continuar', onSelect: () => this.resumeGame() },
      { label: 'Opções', onSelect: () => go('options', {}, 'push') },
      { label: 'Sair para o mapa', onSelect: () => { game.persist(); go('map'); } },
    ]);
    const side = h('div', 'panel claro pause-side', h('div', 'pause-side-title', carved('Desafios ativos', { tone: 'madeira', size: 20 })));
    for (const { d } of desafiosAtivos()) side.append(desafioRow(d.titulo, game.save.desafios[d.id] ?? 0, d.meta));
    const ses = play.session;
    const letras = h('div', 'pause-cipo');
    ['C', 'I', 'P', 'Ó'].forEach((c, i) => letras.append(carved(c, { tone: ses.letras[i] ? 'ouro' : 'madeira', size: 24 })));
    this.el.append(h('div', 'pause-blur'),
      h('div', 'pause-head', carved('Pausa', { tone: 'ouro', size: 60 }), h('div', 'pause-level', carved(`${L.id} · ${L.nome}`, { tone: 'creme', size: 20 }))),
      h('div', 'pause-body', h('div', 'panel pause-menu', this.menu.el), h('div', 'pause-right', side,
        h('div', 'panel pause-stats', letras, h('span', 'coin-line', img('hud/castanha.svg'), `${game.save.castanhas}`), h('span', 'coin-line', img('hud/balao-tucano.svg'), `× ${game.save.vidas}`),
          h('span', 'coin-line', img('hud/relogio.svg'), fmtTime(ses.time)), h('span', 'coin-line' + (ses.moeda ? '' : ' apagado'), img('hud/moeda-folha.svg'), ses.moeda ? '1/1' : '0/1')))),
      h('div', 'prompts-bar', prompt('confirm', 'Escolher'), prompt('pause', 'Continuar')));
  }
  private resumeGame() { if (screens.top === this) screens.pop(); }
  update(dt: number) {
    this.t += dt;
    if (screens.busy) return;
    if (this.t > 0.1 && (input.pressed('pause') || input.pressed('back'))) { sfx('ui-voltar'); this.resumeGame(); return; }
    this.menu?.update();
  }
}
registerScreen('pause', ({ play }: { play: PlayScreen }) => new Pause(play));

/* ---------------- Resultados ---------------- */
class Results extends UiScreen {
  private medalEls: HTMLElement[] = [];
  private cast = new CarvedText('0', { tone: 'ouro', size: 40 });
  private paraf = new CarvedText('0', { tone: 'creme', size: 40 });
  private canLeave = false;
  private desafiosBox = h('div', 'res-desafios');
  private skip = false;
  constructor(private L: LevelDef, private r: LevelResult, private ses: Session) {
    super('results');
    const medals = h('div', 'res-medals');
    for (const m of MEDALHAS) {
      const ok = r.medals[m.id];
      const e = h('div', 'res-medal' + (ok ? ' ok' : '') + (r.novas.includes(m.id) ? ' nova' : ''), h('div', 'res-medal-img', img('medalhas/vazia.svg', 'vazia'), img(`medalhas/${m.id}.svg`, 'cheia')), carved(m.nome, { tone: ok ? 'ouro' : 'madeira', size: 15 }), h('p', '', m.desc));
      this.medalEls.push(e);
      medals.append(e);
    }
    const counters = h('div', 'res-counters',
      h('div', 'res-counter', img('hud/castanha.svg'), this.cast.el),
      h('div', 'res-counter', img('hud/parafuso.svg'), this.paraf.el),
      h('div', 'res-counter small', img('hud/relogio.svg'), carved(fmtTime(r.time), { tone: r.medals.relampago ? 'ouro' : 'creme', size: 26 })));
    const bg = h('div', 'res-bg');
    this.el.append(bg,
      h('div', 'res-head', carved('Fase concluída!', { tone: 'ouro', size: 52 }), h('div', 'res-level', carved(`${L.id} · ${L.nome}`, { tone: 'creme', size: 22 }))),
      h('div', 'panel res-panel', medals, counters, this.desafiosBox),
      h('div', 'prompts-bar res-prompts', prompt('confirm', 'Voltar ao mapa')));
    // a dupla dança a vitória ao lado do painel
    const stage = h('div', 'res-duo');
    this.el.append(stage);
    for (const [hero, x] of [['tama', 170], ['lili', 1110]] as const) {
      const sp = new Sprite(hero, 'neutro', game.save.figurino[hero], stage);
      sp.play(sp.has('vitoria') ? 'vitoria' : 'idle');
      sp.flip = hero === 'lili';
      fitSprite(sp, x, 690, 260, 250, 1.1);
      this.sprites.push(sp);
    }
  }
  private sprites: Sprite[] = [];
  render(_a: number, fd: number) { for (const sp of this.sprites) { sp.update(fd); sp.render(); } }
  exit() { this.sprites.forEach((sp) => sp.destroy()); }
  enter() { bus.emit('music', 'vitoria'); void this.sequence(); }
  private async sequence() {
    await wait(0.6);
    for (const [i, m] of MEDALHAS.entries()) {
      if (this.skip) break;
      this.medalEls[i].classList.add('show');
      if (this.r.medals[m.id]) { sfx(this.r.novas.includes(m.id) ? 'medalha' : 'totem-acender', 0.8); if (this.r.novas.includes(m.id)) bus.emit('medalha', { id: m.id, level: this.L.id }); }
      await wait(0.45);
    }
    this.medalEls.forEach((e) => e.classList.add('show'));
    // contagem tick-tick-tick
    await this.count(this.cast, this.ses.castanhas);
    await this.count(this.paraf, this.ses.parafusos);
    // desafios que avançaram nesta fase
    const list = DESAFIOS.filter((d) => avancoNaFase.has(d.id));
    if (list.length) {
      this.desafiosBox.append(h('div', 'res-des-title', carved('Desafios do Tucano', { tone: 'ouro', size: 20 })));
      for (const d of list.slice(0, 4)) {
        const cur = game.save.desafios[d.id] ?? 0;
        this.desafiosBox.append(desafioRow(d.titulo, cur, d.meta, game.save.desafiosOk.includes(d.id), avancoNaFase.get(d.id)));
      }
      this.desafiosBox.classList.add('show');
    } else {
      this.desafiosBox.append(h('p', 'res-none', 'Nenhum desafio avançou desta vez. O Tucano está de olho!'));
      this.desafiosBox.classList.add('show');
    }
    if (this.r.desbloqueou.length) {
      const nx = this.r.desbloqueou.map((id) => LEVELS[id]?.nome ?? id).join(', ');
      this.desafiosBox.append(h('p', 'res-unlock', `Nova trilha no mapa: ${nx}`));
    }
    this.canLeave = true;
    this.el.classList.add('done');
  }
  private async count(t: CarvedText, n: number) {
    const steps = Math.min(n, 40);
    for (let i = 1; i <= steps; i++) {
      if (this.skip) break;
      t.set(Math.round((n * i) / steps));
      sfx('tick-contagem', 0.7);
      await wait(n > 40 ? 0.04 : 0.07);
    }
    t.set(n);
  }
  update(dt: number) {
    this.t += dt;
    if (screens.busy) return;
    if (input.pressed('confirm')) {
      if (!this.canLeave) { this.skip = true; return; }
      sfx('ui-confirmar');
      if (this.L.id === 'chefe-4' && !game.save.finalVisto) go('ending');
      else go('map');
    }
  }
}
registerScreen('results', ({ level, result, session }: { level: LevelDef; result: LevelResult; session: Session }) => new Results(level, result, session));

/* ---------------- Game Over ---------------- */
class GameOver extends UiScreen {
  constructor(private level: string) {
    super('gameover');
    const bg = h('div', 'go-bg'); bg.style.backgroundImage = 'url(assets/cine/gameover.webp)';
    this.menu = new Menu([
      { label: 'Tentar de novo', onSelect: () => screens.replace(new PlayScreen({ level: this.level })) },
      { label: 'Mapa', onSelect: () => go('map') },
    ], { horizontal: true });
    this.el.append(bg, h('div', 'rain-css'), h('div', 'go-vignette'),
      h('div', 'go-title', carved('Fim de jogo', { tone: 'creme', size: 64 })),
      h('p', 'go-sub', game.options.assistencia ? 'A dupla descansa um pouco. Com a assistência ligada, vocês voltam com 7 vidas.' : 'A dupla descansa um pouco no tronco. A chuva passa — e eles voltam com 5 vidas.'),
      h('div', 'go-menu', this.menu.el));
  }
  enter() { bus.emit('music', 'gameover'); bus.emit('ambience', 'amb-chuva'); game.persist(); }
}
registerScreen('gameover', ({ level }: { level: string }) => new GameOver(level));
