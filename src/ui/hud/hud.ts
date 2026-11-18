/**
 * HUD (seção 9): tudo aparece só quando acontece algo e some sozinho. Nenhuma barra fixa.
 * Castanhas (ícone 3D girando + contador), letras C-I-P-Ó, vidas (balão-tucano), retrato na troca,
 * cronômetro de sala bônus, arma segurada com marquinhas de usos, toasts, desafio concluído,
 * vida do chefe, aviso de parceiro perdido e combo.
 */
import type { Screen } from '../screens/manager';
import type { PlayScreen } from '../screens/play';
import { registerScreen } from '../screens/registry';
import { bus } from '../../core/events';
import { game } from '../../core/save';
import { anim } from '../../core/assets';
import { Sprite } from '../../render/sprite';
import { CarvedText, carved } from '../components/carved';
import { h, img, fitSprite } from '../components/ui';
import { NOMES_ARMAS, NOMES_CHEFES } from '../../data/textos';

const ARMAS_COM_ICONE = new Set(['galho', 'coco', 'jaca', 'remo', 'vassoura', 'panela', 'lamparina', 'chave', 'peixe', 'estilingue', 'cupinzeiro', 'guarda-chuva', 'buzina', 'capacete']);
const ICONES_TOAST: Record<string, string> = { ficha: 'hud/moeda-folha.svg', presente: 'mapa/presente.svg', 'moeda-folha': 'hud/moeda-folha.svg', parafuso: 'hud/parafuso.svg', castanha: 'hud/castanha.svg', tucano: 'hud/tucano.svg', vida: 'hud/balao-tucano.svg' };

/** Bloco que entra deslizando e some depois de `hold` segundos sem novidade. */
class Pop {
  t = 0;
  constructor(public el: HTMLElement, public hold: number) {}
  show(hold = this.hold) { this.t = hold; this.el.classList.add('on'); }
  hide() { this.t = 0; this.el.classList.remove('on'); }
  update(dt: number) { if (this.t > 0) { this.t -= dt; if (this.t <= 0) this.el.classList.remove('on'); } }
  get visible() { return this.t > 0; }
}

class Hud implements Screen {
  el = h('div', 'hud-root');
  private offs: (() => void)[] = [];
  private pops: Pop[] = [];
  // castanhas
  private coinBox = h('div', 'hud-coins');
  private coinPop = this.pop(this.coinBox, 2);
  private coinSprite: Sprite | null = null;
  private coinText = new CarvedText('0', { tone: 'ouro', size: 34 });
  private boltBox = h('div', 'hud-bolts');
  private boltPop = this.pop(this.boltBox, 2);
  private boltText = new CarvedText('0', { tone: 'creme', size: 24 });
  // letras
  private letrasBox = h('div', 'hud-letras');
  private letrasPop = this.pop(this.letrasBox, 2.6);
  private letraEls: HTMLElement[] = [];
  private vidaExtra = h('div', 'hud-vida-extra', carved('+1 vida', { tone: 'verde', size: 30 }));
  // vidas
  private livesBox = h('div', 'hud-lives');
  private livesPop = this.pop(this.livesBox, 2.6);
  private livesText = new CarvedText('5', { tone: 'creme', size: 30 });
  // retrato
  private portrait = h('div', 'hud-portrait');
  private portraitPop = this.pop(this.portrait, 1.5);
  private portraitSprite: Sprite | null = null;
  private portraitName = h('div', 'hud-portrait-name');
  // cronômetro
  private timerBox = h('div', 'hud-timer');
  private timerPop = this.pop(this.timerBox, 0.4);
  private timerText = new CarvedText('20', { tone: 'cristal', size: 36 });
  // arma
  private heldBox = h('div', 'hud-held');
  private heldIcon = h('div', 'hud-held-icon');
  private heldMarks = h('div', 'hud-held-marks');
  private heldName = h('div', 'hud-held-name');
  private pocketBox = h('div', 'hud-pocket');
  private heldMax = 1;
  // toasts e avisos
  private toastBox = h('div', 'hud-toasts');
  private tucanoBox = h('div', 'hud-tucano');
  private tucanoPop = this.pop(this.tucanoBox, 3.4);
  private tucanoQueue: { titulo: string; sub: string }[] = [];
  private lostBox = h('div', 'hud-lost');
  private lostPop = this.pop(this.lostBox, 3.2);
  private comboBox = h('div', 'hud-combo');
  private comboPop = this.pop(this.comboBox, 1.1);
  // chefe
  private bossBox = h('div', 'hud-boss');
  private bossFill = h('div', 'hud-boss-fill');
  private bossName = h('div', 'hud-boss-name');
  private bossHide = 0;

  constructor(public play: PlayScreen) {
    this.el.append(this.coinBox, this.boltBox, this.letrasBox, this.livesBox, this.portrait, this.timerBox, this.heldBox, this.toastBox, this.tucanoBox, this.lostBox, this.comboBox, this.bossBox);
    // castanha: sprite 3D girando (8 quadros) se existir; senão o ícone SVG gira em CSS
    const coinIcon = h('div', 'hud-coin-icon');
    if (anim('castanha', 'girar', 'neutro')) {
      this.coinSprite = new Sprite('castanha', 'neutro', 'base', coinIcon);
      this.coinSprite.play('girar');
      fitSprite(this.coinSprite, 34, 64, 60, 60, 1.4);
    } else coinIcon.append(img('hud/castanha.svg', 'spin'));
    this.coinBox.append(coinIcon, h('span', 'hud-x', '×'), this.coinText.el);
    this.boltBox.append(img('hud/parafuso.svg', 'hud-bolt-icon'), h('span', 'hud-x', '+'), this.boltText.el);
    const LET = ['C', 'I', 'P', 'Ó'];
    for (const l of LET) { const e = h('div', 'hud-letra', carved(l, { tone: 'ouro', size: 40 })); this.letraEls.push(e); this.letrasBox.append(e); }
    this.letrasBox.append(this.vidaExtra);
    this.livesBox.append(img('hud/balao-tucano.svg', 'hud-balloon'), h('div', 'hud-lives-n', this.livesText.el));
    this.portrait.append(h('div', 'hud-portrait-frame'), this.portraitName);
    this.timerBox.append(img('hud/relogio.svg', 'hud-timer-icon'), this.timerText.el);
    this.heldBox.append(this.heldIcon, h('div', 'hud-held-info', this.heldName, this.heldMarks), this.pocketBox);
    this.tucanoBox.append(img('hud/tucano.svg', 'hud-tucano-img'), h('div', 'hud-tucano-msg'));
    this.bossBox.append(this.bossName, h('div', 'hud-boss-bar', this.bossFill));
  }
  private pop(el: HTMLElement, hold: number) { const p = new Pop(el, hold); this.pops.push(p); return p; }

  enter() {
    const on = (ev: string, f: (d: any) => void) => this.offs.push(bus.on(ev, f));
    on('coin', () => { this.coinText.set(game.save.castanhas); this.coinPop.show(); this.coinBox.classList.remove('bump'); void this.coinBox.offsetWidth; this.coinBox.classList.add('bump'); });
    on('parafuso', () => { this.boltText.set(this.play.session.parafusos); this.boltPop.show(); this.coinText.set(game.save.castanhas); this.coinPop.show(); });
    on('letra', (d) => this.showLetras(d?.i));
    on('letras-completas', () => this.letrasCompletas());
    on('vida', (d) => this.showLives(d?.ganho ?? 0));
    on('hero-swap', (d) => this.showPortrait(d?.hero));
    on('bonus-timer', (d) => { this.timerText.set(Math.ceil(d?.t ?? 0)); this.timerBox.classList.toggle('urgente', (d?.t ?? 0) <= 5); this.timerPop.show(0.4); });
    on('held', (d) => this.setHeld(d));
    on('pocket', (d) => this.setPocket(d?.id ?? null));
    on('toast', (d) => this.toast(d?.text ?? '', d?.icon));
    on('desafio-ok', (d) => this.tucano('Desafio concluído!', d?.titulo ?? ''));
    on('carta-ok', (d) => this.tucano('Carta nova no Álbum!', d?.nome ?? ''));
    on('moeda-folha', () => this.toast('Moeda-Folha! Ela vai brotar no Viveiro.', 'moeda-folha'));
    on('hero-lost', (d) => this.partnerLost(d?.hero));
    on('partner-back', () => { this.lostPop.hide(); this.toast('A dupla está junta de novo!', 'vida'); });
    on('combo', (d) => this.combo(d?.n ?? 0));
    on('boss-hit', (d) => this.bossHit(d));
    on('boss-defeat', () => { this.bossFill.style.transform = 'scaleX(0)'; this.bossHide = 1.6; });
    on('level-start', (d) => { if (!d?.bonus) this.timerPop.hide(); this.bossBox.classList.remove('on'); });
    this.coinText.set(game.save.castanhas);
  }

  private showLetras(i?: number) {
    const got = this.play.world?.letras ?? this.play.session.letras;
    this.letraEls.forEach((e, k) => { e.classList.toggle('got', !!got[k] || k === i); e.classList.toggle('nova', k === i); });
    this.vidaExtra.classList.remove('on');
    this.letrasPop.show();
  }
  private letrasCompletas() {
    this.letraEls.forEach((e) => { e.classList.add('got'); e.classList.remove('nova'); });
    this.letrasBox.classList.remove('boom'); void this.letrasBox.offsetWidth; this.letrasBox.classList.add('boom');
    this.vidaExtra.classList.add('on');
    this.letrasPop.show(3.2);
  }
  private showLives(ganho: number) {
    this.livesText.set(game.save.vidas);
    this.livesBox.classList.toggle('ganhou', ganho > 0);
    this.livesBox.classList.toggle('perdeu', ganho <= 0);
    this.livesPop.show();
  }
  private showPortrait(hero?: string) {
    if (!hero) return;
    this.portraitSprite?.destroy();
    const frame = this.portrait.querySelector('.hud-portrait-frame') as HTMLElement;
    const sp = new Sprite(hero, 'neutro', game.save.figurino[hero as 'tama' | 'lili'] ?? 'base', frame);
    sp.play(sp.has('troca') ? 'troca' : 'idle');
    sp.x = 66; sp.y = hero === 'tama' ? 196 : 176;
    this.portraitSprite = sp;
    this.portraitName.replaceChildren(carved(hero === 'tama' ? 'Tamá' : 'Lili', { tone: hero === 'tama' ? 'ouro' : 'creme', size: 20 }));
    this.portrait.classList.toggle('lili', hero === 'lili');
    this.portraitPop.show();
  }
  private setHeld(d: { id: string; usos: number } | null) {
    if (!d) { this.heldBox.classList.remove('on'); return; }
    const novo = this.heldBox.dataset.id !== d.id || !this.heldBox.classList.contains('on');
    if (novo) {
      this.heldBox.dataset.id = d.id;
      this.heldMax = Math.max(1, d.usos);
      this.heldIcon.replaceChildren(ARMAS_COM_ICONE.has(d.id) ? img(`armas/${d.id}.svg`) : this.carriedIcon(d.id));
      this.heldName.textContent = NOMES_ARMAS[d.id] ?? '';
    }
    this.heldMax = Math.max(this.heldMax, d.usos);
    this.heldMarks.replaceChildren();
    if (!Number.isFinite(d.usos)) this.heldMarks.append(h('span', 'hud-infinito', '∞'));
    else for (let i = 0; i < this.heldMax; i++) this.heldMarks.append(h('i', i < d.usos ? 'on' : ''));
    this.heldBox.classList.add('on');
    this.heldBox.classList.remove('hit'); void this.heldBox.offsetWidth; this.heldBox.classList.add('hit');
  }
  /** Carregáveis (cabaça, bromélia) usam o próprio sprite 3D como ícone. */
  private carriedIcon(id: string) {
    const box = h('div', 'hud-held-sprite');
    const sp = new Sprite(id, 'neutro', 'base', box);
    sp.play('idle');
    sp.x = 40; sp.y = 62;
    const s = 64 / Math.max(64, sp.entry?.ch ?? 64);
    sp.sx = sp.sy = s * 1.4;
    sp.render();
    return box;
  }
  private setPocket(id: string | null) {
    this.pocketBox.replaceChildren();
    if (!id) { this.pocketBox.classList.remove('on'); return; }
    this.pocketBox.append(img('hud/mochila.svg', 'hud-pocket-bag'));
    if (ARMAS_COM_ICONE.has(id)) this.pocketBox.append(img(`armas/${id}.svg`, 'hud-pocket-arma'));
    this.pocketBox.classList.add('on');
  }
  private toast(text: string, icon?: string) {
    if (!text) return;
    const t = h('div', 'hud-toast');
    const src = icon ? (ICONES_TOAST[icon] ?? (ARMAS_COM_ICONE.has(icon) ? `armas/${icon}.svg` : null)) : null;
    if (src) t.append(img(src, 'hud-toast-icon'));
    t.append(h('span', '', text));
    this.toastBox.append(t);
    while (this.toastBox.children.length > 3) this.toastBox.firstElementChild?.remove();
    setTimeout(() => t.classList.add('out'), 2600);
    setTimeout(() => t.remove(), 3100);
  }
  private tucano(titulo: string, sub: string) {
    if (this.tucanoPop.visible) { this.tucanoQueue.push({ titulo, sub }); return; }
    const msg = this.tucanoBox.querySelector('.hud-tucano-msg') as HTMLElement;
    msg.replaceChildren(carved(titulo, { tone: 'ouro', size: 18 }), h('p', '', sub));
    this.tucanoPop.show();
    bus.emit('babble', { voice: 'tucano', text: titulo });
  }
  private partnerLost(hero?: string) {
    const nome = hero === 'tama' ? 'A Tamá' : 'A Lili';
    this.lostBox.replaceChildren(h('div', 'hud-lost-cage'), h('div', 'hud-lost-txt', carved('Parceiro perdido!', { tone: 'ferrugem', size: 20 }), h('p', '', `${nome} foi levada numa gaiola. Quebre um Ninho do Reencontro!`)));
    const sp = new Sprite(hero ?? 'lili', 'neutro', game.save.figurino[(hero ?? 'lili') as 'tama' | 'lili'] ?? 'base', this.lostBox.firstElementChild as HTMLElement);
    sp.play(sp.has('preso') ? 'preso' : 'dano');
    fitSprite(sp, 46, 96, 84, 84, 1);
    sp.render();
    this.lostPop.show();
  }
  private combo(n: number) {
    if (n < 3) return;
    this.comboBox.replaceChildren(carved(`Combo ×${n}`, { tone: n >= 8 ? 'cristal' : 'ouro', size: 26 + Math.min(n, 10) * 1.5 }));
    this.comboBox.classList.remove('bump'); void this.comboBox.offsetWidth; this.comboBox.classList.add('bump');
    this.comboPop.show();
  }
  private bossHit(d: { id: string; hp: number; max?: number }) {
    if (!d) return;
    const max = d.max ?? Math.max(d.hp + 1, Number(this.bossBox.dataset.max ?? 0));
    this.bossBox.dataset.max = String(max);
    if (this.bossBox.dataset.id !== d.id) {
      this.bossBox.dataset.id = d.id;
      this.bossName.replaceChildren(carved(NOMES_CHEFES[d.id] ?? d.id, { tone: 'ferrugem', size: 20 }));
    }
    this.bossFill.style.transform = `scaleX(${Math.max(0, d.hp / max).toFixed(3)})`;
    this.bossBox.classList.add('on');
    this.bossBox.classList.remove('hit'); void this.bossBox.offsetWidth; this.bossBox.classList.add('hit');
  }

  update(dt: number) {
    for (const p of this.pops) p.update(dt);
    if (!this.tucanoPop.visible && this.tucanoQueue.length) { const q = this.tucanoQueue.shift()!; this.tucano(q.titulo, q.sub); }
    if (this.bossHide > 0) { this.bossHide -= dt; if (this.bossHide <= 0) this.bossBox.classList.remove('on'); }
  }
  render(_a: number, frameDt: number) {
    if (this.coinPop.visible && this.coinSprite) { this.coinSprite.update(frameDt); this.coinSprite.render(); }
    if (this.portraitPop.visible && this.portraitSprite) { this.portraitSprite.update(frameDt); this.portraitSprite.render(); }
  }
  exit() { this.offs.forEach((f) => f()); this.offs = []; this.portraitSprite?.destroy(); this.coinSprite?.destroy(); }
}

registerScreen('hud', ({ play }: { play: PlayScreen }) => new Hud(play));
