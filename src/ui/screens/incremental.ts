/** Sistemas incrementais (seção 19): Oficina do Vô Bugio, Álbum da Selva, Desafios do Tucano e Viveiro. */
import { registerScreen } from './registry';
import { UiScreen, go } from './base';
import { screens } from './manager';
import { input } from '../../core/input';
import { bus } from '../../core/events';
import { game } from '../../core/save';
import { anim, sceneryMeta } from '../../core/assets';
import { Sprite } from '../../render/sprite';
import { carved } from '../components/carved';
import { h, img, prompt, sfx, Menu, fitSprite, type MenuItem } from '../components/ui';
import { UPGRADES, upgradeLevel, buyUpgrade, depositarCastanhas, comprarFigurino, vestirFigurino, cartaLiberada, moedasPlantadas, extra } from '../../game/progress';
import { efeitoUpgrade, DICAS_BUGIO, BUGIO_SAUDACAO, VIVEIRO_MARCOS } from '../../data/textos';
import { DESAFIOS, premioTexto } from '../../data/desafios';
import { FOTOS, CARTAS, FIGURINOS, FORMA_NOME, type Pose } from '../../data/album';
import { MAP } from '../../data/world';
import { LEVELS } from '../../data/levels/index';
import { PlayScreen } from './play';
import { desafioRow } from './play-ui';

abstract class SubScreen extends UiScreen {
  protected sprites: Sprite[] = [];
  constructor(cls: string) { super('sub ' + cls); this.onBack = () => this.close(); }
  close() { if (screens.top === this) screens.pop(); }
  protected sprite(m: string, a: string, parent: HTMLElement, x: number, y: number, s = 1, v = 'base', flip = false) {
    if (!anim(m, a, 'neutro', v)) return null;
    const sp = new Sprite(m, 'neutro', v, parent);
    sp.play(a); sp.x = x; sp.y = y; sp.sx = sp.sy = s; sp.flip = flip;
    this.sprites.push(sp);
    return sp;
  }
  render(_a: number, fd: number) { for (const s of this.sprites) { s.update(fd); s.render(); } }
  exit() { this.sprites.forEach((s) => s.destroy()); }
  protected wallet() {
    const s = game.save;
    return h('div', 'wallet', h('span', 'coin-line', img('hud/parafuso.svg'), String(s.parafusos)), h('span', 'coin-line', img('hud/castanha.svg'), `${s.castanhas} + ${s.banco} no banco`));
  }
}

/* ---------------- Oficina do Vô Bugio ---------------- */
class Oficina extends SubScreen {
  private detail = h('div', 'panel claro of-detail');
  private walletBox = h('div', 'of-wallet');
  private visits = 0;
  constructor() {
    super('oficina');
    const art = h('div', 'of-art');
    const sp = this.sprite('vo-bugio', 'martelar', art, 170, 330, 1);
    if (sp) fitSprite(sp, 175, 390, 250, 330, 2.4);
    if (!sp) art.append(img('mapa/barraca-bugio.svg', 'of-barraca'));
    this.visits = (game.save.totals['visitas-oficina'] = (game.save.totals['visitas-oficina'] ?? 0) + 1);
    const items: MenuItem[] = UPGRADES.map((u) => ({
      label: u.nome, small: true,
      value: () => `${'●'.repeat(upgradeLevel(u.id))}${'○'.repeat(u.niveis - upgradeLevel(u.id))}`,
      onSelect: () => this.buy(u.id),
    }));
    items.push({ label: 'Guardar castanhas', small: true, value: () => String(game.save.castanhas), onSelect: () => { const n = depositarCastanhas(); sfx(n ? 'castanha' : 'ui-erro'); this.refresh(); } });
    items.push({ label: 'Dica do Vô', small: true, onSelect: () => this.dica() });
    items.push({ label: 'Sair da barraca', small: true, onSelect: () => this.close() });
    this.menu = new Menu(items, { cls: 'of-menu' });
    this.el.append(h('div', 'sub-bg oficina-bg'), art, h('div', 'sub-head', carved('Oficina do Vô Bugio', { tone: 'ouro', size: 42 })),
      h('div', 'of-cols', h('div', 'panel of-list', this.menu.el), h('div', 'of-right', this.detail, this.walletBox)),
      h('div', 'prompts-bar', prompt('up', 'Escolher'), prompt('confirm', 'Comprar'), prompt('back', 'Sair')));
    this.refresh();
    bus.emit('babble', { voice: 'vo-bugio', text: BUGIO_SAUDACAO[this.visits % BUGIO_SAUDACAO.length] });
  }
  private refresh() {
    this.menu?.refresh();
    this.walletBox.replaceChildren(this.wallet());
    const i = this.menu?.index ?? 0;
    const u = UPGRADES[i];
    this.detail.replaceChildren();
    if (!u) {
      if (i === UPGRADES.length) this.detail.append(carved('Banco de castanhas', { tone: 'madeira', size: 22 }), h('p', 'ui-text', 'Castanhas guardadas no banco não viram vida, mas compram figurinos no Álbum. Os prêmios do Tucano e do Bem-te-vi caem direto aqui.'));
      else this.detail.append(carved('Vô Bugio', { tone: 'madeira', size: 22 }), h('p', 'ui-text', BUGIO_SAUDACAO[this.visits % BUGIO_SAUDACAO.length]));
      return;
    }
    const lv = upgradeLevel(u.id);
    const max = lv >= u.niveis;
    this.detail.append(carved(u.nome, { tone: 'madeira', size: 24 }), h('p', 'ui-text', u.desc),
      h('div', 'of-ba', h('div', 'of-before', h('b', '', 'Antes'), h('span', '', efeitoUpgrade(u.id, lv))), h('div', 'of-arrow', '➜'),
        h('div', 'of-after', h('b', '', max ? 'No máximo' : 'Depois'), h('span', '', max ? efeitoUpgrade(u.id, lv) : efeitoUpgrade(u.id, lv + 1)))),
      max ? h('p', 'of-cost max', 'Melhoria completa!') : h('p', 'of-cost' + (game.save[u.moeda] >= u.custos[lv] ? '' : ' falta'), img(u.moeda === 'parafusos' ? 'hud/parafuso.svg' : 'hud/castanha.svg'), `${u.custos[lv]} ${u.moeda}`));
  }
  private buy(id: string) {
    if (buyUpgrade(id)) { sfx('golpe-pesado'); this.el.classList.remove('bang'); void this.el.offsetWidth; this.el.classList.add('bang'); }
    else sfx('ui-erro');
    this.refresh();
  }
  private dica() {
    const s = game.save;
    const alvo = MAP.find((n) => s.unlocked.includes(n.id) && (!s.levels[n.id]?.moeda || !s.levels[n.id]?.letras)) ?? MAP.find((n) => s.unlocked.includes(n.id));
    const txt = DICAS_BUGIO[alvo?.id ?? '1-1'];
    this.detail.replaceChildren(carved(`Dica · ${alvo?.nome ?? ''}`, { tone: 'madeira', size: 20 }), h('p', 'ui-text', txt));
    bus.emit('babble', { voice: 'vo-bugio', text: txt.slice(0, 40) });
  }
  update(dt: number) {
    const before = this.menu?.index;
    super.update(dt);
    if (this.menu && before !== this.menu.index) this.refresh();
  }
}
registerScreen('oficina', () => new Oficina());

/* ---------------- Álbum da Selva ---------------- */
type Aba = 'fotos' | 'cartas' | 'figurinos';
class Album extends SubScreen {
  private aba: Aba = 'fotos';
  private tabs = h('div', 'album-tabs');
  private page = h('div', 'album-page');
  private sel = 0;
  private cells: HTMLElement[] = [];
  private detail = h('div', 'panel claro album-detail');
  private cols = 5;
  constructor() {
    super('album');
    this.el.append(h('div', 'sub-bg album-bg'), h('div', 'sub-head', carved('Álbum da Selva', { tone: 'ouro', size: 42 })), this.tabs,
      h('div', 'album-body', this.page, this.detail),
      h('div', 'prompts-bar', prompt('swap', 'Trocar aba'), prompt('left', 'Escolher'), prompt('confirm', 'Usar / Comprar'), prompt('back', 'Fechar')));
    this.build();
  }
  private build() {
    this.sprites.forEach((s) => s.destroy()); this.sprites = [];
    this.tabs.replaceChildren();
    const nomes: [Aba, string][] = [['fotos', 'Fotos'], ['cartas', 'Bestiário'], ['figurinos', 'Figurinos']];
    for (const [id, n] of nomes) {
      const t = h('div', 'album-tab' + (id === this.aba ? ' on' : ''), carved(n, { tone: id === this.aba ? 'ouro' : 'creme', size: 20 }));
      t.addEventListener('click', () => { this.aba = id; this.sel = 0; this.build(); });
      this.tabs.append(t);
    }
    this.page.replaceChildren(); this.cells = [];
    this.page.className = 'album-page ' + this.aba;
    const s = game.save;
    if (this.aba === 'fotos') {
      this.cols = 4;
      for (const f of FOTOS) {
        const got = !!s.levels[f.level]?.foto;
        const c = h('div', 'foto' + (got ? '' : ' vazia'));
        const pic = h('div', 'foto-pic');
        if (got) this.foto(pic, f.fundo, f.poses); else pic.append(carved('?', { tone: 'madeira', size: 40 }));
        c.append(pic, h('div', 'foto-cap', f.level));
        this.cells.push(c);
      }
    } else if (this.aba === 'cartas') {
      this.cols = 5;
      for (const c of CARTAS) {
        const ok = cartaLiberada(c.id);
        const e = h('div', 'carta' + (ok ? '' : ' vazia'));
        const art = h('div', 'carta-art');
        const sp = this.sprite(c.id, 'idle', art, 64, 120, 1, 'base', true);
        if (sp) fitSprite(sp, 64, 114, 116, 104, 1.2);
        if (!ok) art.classList.add('silhueta');
        e.append(art, h('div', 'carta-nome', ok ? c.nome : '???'));
        this.cells.push(e);
      }
    } else {
      this.cols = 4;
      for (const f of FIGURINOS) {
        const tem = s.album.figurinos.includes(f.id);
        const vest = s.figurino[f.heroi] === f.variante;
        const e = h('div', 'figurino' + (tem ? '' : ' bloqueado') + (vest ? ' vestido' : ''));
        const art = h('div', 'fig-art');
        { const fs = this.sprite(f.heroi, 'idle', art, 80, 176, 0.9, f.variante); if (fs) fitSprite(fs, 80, 184, 150, 176, 1.1); }
        e.append(art, h('div', 'fig-nome', f.nome), h('div', 'fig-tag', vest ? 'Vestindo' : tem ? 'No baú' : `${f.preco} castanhas`));
        this.cells.push(e);
      }
    }
    this.cells.forEach((c, i) => { c.addEventListener('mouseenter', () => this.focus(i)); c.addEventListener('click', () => { this.focus(i); this.use(); }); this.page.append(c); });
    this.focus(Math.min(this.sel, this.cells.length - 1), true);
  }
  /** Foto montada com o fundo da fase e os sprites 3D posados. */
  private foto(pic: HTMLElement, fundo: string, poses: Pose[]) {
    const sc = sceneryMeta();
    const par = sc.parallax?.[fundo] as { src: string }[] | undefined;
    pic.style.background = sc.sky?.[fundo] ?? 'linear-gradient(#7ec8e8, #2e8b3e)';
    if (par) for (const i of [0, 2]) if (par[i]) { const l = h('div', 'foto-layer'); l.style.backgroundImage = `url(${par[i].src})`; pic.append(l); }
    const stage = h('div', 'foto-stage');
    pic.append(stage);
    for (const p of poses) {
      const sp = this.sprite(p.m, p.a, stage, p.x, p.y, (p.s ?? 1) * 0.62, p.v ?? (p.m === 'tama' || p.m === 'lili' ? game.save.figurino[p.m] : 'base'), p.flip);
      if (sp) { sp.frame = p.f ?? 0; sp.speed = 0; }
    }
  }
  private focus(i: number, quiet = false) {
    if (i < 0) return;
    if (i !== this.sel && !quiet) sfx('ui-navegar', 0.7);
    this.sel = i;
    this.cells.forEach((c, k) => c.classList.toggle('focus', k === i));
    this.cells[i]?.scrollIntoView({ block: 'nearest' });
    this.showDetail();
  }
  private showDetail() {
    const s = game.save;
    this.detail.replaceChildren();
    if (this.aba === 'fotos') {
      const f = FOTOS[this.sel]; if (!f) return;
      const got = !!s.levels[f.level]?.foto;
      this.detail.append(carved(got ? f.titulo : 'Foto escondida', { tone: 'madeira', size: 17 }), h('p', 'ui-text', got ? f.legenda : `Fase ${f.level}. Dica: ${f.dica}`));
    } else if (this.aba === 'cartas') {
      const c = CARTAS[this.sel]; if (!c) return;
      const ok = cartaLiberada(c.id);
      const feitas = s.album.cartas[c.id] ?? [];
      const formas = h('div', 'carta-formas');
      for (const f of c.formas) formas.append(h('span', feitas.includes(f) ? 'ok' : '', FORMA_NOME[f] ?? f));
      this.detail.append(carved(ok ? c.nome : 'Carta bloqueada', { tone: 'madeira', size: 17 }), h('p', 'ui-text', ok ? `${c.piada}` : 'Derrote este inimigo das três formas abaixo para liberar a carta.'), h('p', 'ui-text carta-mundo', `Onde vive: ${c.mundo}`), formas);
    } else {
      const f = FIGURINOS[this.sel]; if (!f) return;
      const tem = s.album.figurinos.includes(f.id);
      this.detail.append(carved(f.nome, { tone: 'madeira', size: 17 }), h('p', 'ui-text', f.desc),
        h('p', 'ui-text', tem ? (s.figurino[f.heroi] === f.variante ? 'Vestindo agora.' : 'Aperte confirmar para vestir.') : `Custa ${f.preco} castanhas do banco (você tem ${s.banco}). Alguns também saem nos Desafios e no Brinde do Bem-te-vi.`));
    }
  }
  private use() {
    if (this.aba !== 'figurinos') return;
    const f = FIGURINOS[this.sel];
    if (!f) return;
    if (!game.save.album.figurinos.includes(f.id)) { if (comprarFigurino(f.id)) sfx('letras-completas'); else { sfx('ui-erro'); return; } }
    vestirFigurino(f.id);
    sfx('ui-confirmar');
    this.build();
  }
  update(dt: number) {
    this.t += dt;
    if (screens.busy) return;
    const n = this.cells.length;
    if (input.pressed('swap') || input.pressed('pocket')) { const order: Aba[] = ['fotos', 'cartas', 'figurinos']; this.aba = order[(order.indexOf(this.aba) + 1) % 3]; this.sel = 0; sfx('ui-navegar'); this.build(); return; }
    if (input.pressed('left')) this.focus(Math.max(0, this.sel - 1));
    else if (input.pressed('right')) this.focus(Math.min(n - 1, this.sel + 1));
    else if (input.pressed('up')) this.focus(Math.max(0, this.sel - this.cols));
    else if (input.pressed('down')) this.focus(Math.min(n - 1, this.sel + this.cols));
    else if (input.pressed('confirm')) this.use();
    else if (input.pressed('back')) { sfx('ui-voltar'); this.close(); }
  }
}
registerScreen('album', () => new Album());

/* ---------------- Desafios do Tucano ---------------- */
class Desafios extends SubScreen {
  private list = h('div', 'des-list');
  private sel = 0;
  private rows: HTMLElement[] = [];
  constructor() {
    super('desafios');
    const s = game.save;
    const feitos = s.desafiosOk.length;
    const art = h('div', 'des-art', img('hud/tucano.svg'));
    for (const d of DESAFIOS) {
      const ok = s.desafiosOk.includes(d.id);
      const r = desafioRow(d.titulo, s.desafios[d.id] ?? (ok ? d.meta : 0), d.meta, ok);
      r.append(h('div', 'des-premio', img(d.premio.figurino ? 'mapa/presente.svg' : d.premio.parafusos ? 'hud/parafuso.svg' : d.premio.vidas ? 'hud/balao-tucano.svg' : 'hud/castanha.svg'), premioTexto(d.premio)));
      this.rows.push(r);
      this.list.append(r);
    }
    this.el.append(h('div', 'sub-bg desafios-bg'), art, h('div', 'sub-head', carved('Desafios do Tucano', { tone: 'ouro', size: 42 }), h('div', 'des-count', carved(`${feitos}/${DESAFIOS.length}`, { tone: 'creme', size: 24 }))),
      h('div', 'panel des-panel', this.list), h('div', 'prompts-bar', prompt('up', 'Rolar'), prompt('back', 'Fechar')));
    this.focus(0);
  }
  private focus(i: number) {
    this.sel = Math.max(0, Math.min(this.rows.length - 1, i));
    this.rows.forEach((r, k) => r.classList.toggle('focus', k === this.sel));
    this.rows[this.sel]?.scrollIntoView({ block: 'nearest' });
  }
  update(dt: number) {
    this.t += dt;
    if (input.pressed('up')) { this.focus(this.sel - 1); sfx('ui-navegar', 0.6); }
    else if (input.pressed('down')) { this.focus(this.sel + 1); sfx('ui-navegar', 0.6); }
    else if (input.pressed('back') || input.pressed('confirm')) { sfx('ui-voltar'); this.close(); }
  }
}
registerScreen('desafios', () => new Desafios());

/* ---------------- Viveiro da Semente-Mãe ---------------- */
class Viveiro extends SubScreen {
  constructor() {
    super('viveiro');
    const s = game.save;
    const n = moedasPlantadas();
    const fases = MAP.filter((m) => m.tipo === 'fase').map((m) => m.id);
    const canteiro = h('div', 'viv-canteiro');
    fases.forEach((id, i) => {
      const ok = !!s.levels[id]?.moeda;
      const vaso = h('div', 'viv-vaso' + (ok ? ' ok' : ''), h('div', 'viv-broto'), h('span', 'viv-id', id));
      vaso.style.animationDelay = `${i * 0.08}s`;
      canteiro.append(vaso);
    });
    const marcos = h('div', 'viv-marcos');
    for (const m of VIVEIRO_MARCOS) {
      const ok = n >= m.n;
      marcos.append(h('div', 'viv-marco' + (ok ? ' ok' : ''), h('div', 'viv-marco-n', carved(String(m.n), { tone: ok ? 'ouro' : 'madeira', size: 26 })), h('div', '', carved(m.titulo, { tone: ok ? 'verde' : 'madeira', size: 17 }), h('p', 'ui-text', m.desc))));
    }
    const regioes = h('div', 'viv-regioes');
    for (let r = 1; r <= 4; r++) regioes.append(h('span', 'viv-reg' + (n >= r * 3 ? ' ok' : ''), `Região ${r}: ${n >= r * 3 ? 'renascida' : `${r * 3} folhas`}`));
    const items: MenuItem[] = [];
    if ((extra().marcosVistos ?? []).includes(7) || n >= 7) {
      const especial = Object.values(LEVELS).find((l) => l.tipo === 'bonus' && /especial/.test(l.id));
      if (especial) items.push({ label: 'Câmara Especial', onSelect: () => { game.persist(); screens.replace(new PlayScreen({ level: especial.id })); } });
    }
    items.push({ label: 'Voltar ao mapa', onSelect: () => this.close() });
    this.menu = new Menu(items, { horizontal: true, size: 18 });
    this.el.append(h('div', 'sub-bg viveiro-bg'), h('div', 'sub-head', carved('Viveiro da Semente-Mãe', { tone: 'ouro', size: 40 }), h('div', 'des-count', carved(`${n}/14`, { tone: 'verde', size: 26 }))),
      h('div', 'viv-body', h('div', 'panel viv-panel', canteiro, regioes), h('div', 'panel claro viv-side', carved('Marcos', { tone: 'madeira', size: 22 }), marcos)),
      h('div', 'viv-menu', this.menu.el));
    const sem = h('div', 'viv-semente', img('mapa/viveiro.svg'));
    this.el.append(sem);
  }
}
registerScreen('viveiro', () => new Viveiro());

