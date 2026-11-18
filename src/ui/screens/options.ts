/** Opções: volumes, qualidade, remapeamento de teclado, tremor e assistência. */
import { registerScreen } from './registry';
import { UiScreen } from './base';
import { screens } from './manager';
import { input, captureNextKey, DEFAULT_KEYS, type Action } from '../../core/input';
import { bus } from '../../core/events';
import { game, saveOptions } from '../../core/save';
import { carved } from '../components/carved';
import { h, prompt, sfx, Menu, refreshPrompts, type MenuItem } from '../components/ui';
import { NOMES_ACOES } from '../../data/textos';

const REMAP: Action[] = ['left', 'right', 'up', 'down', 'jump', 'action', 'swap', 'drop', 'pocket', 'pause'];
const ARROW: Record<string, string> = { ArrowLeft: '←', ArrowRight: '→', ArrowUp: '↑', ArrowDown: '↓' };
const keyName = (c?: string) => (c && ARROW[c]) || (c ?? '—').replace('Key', '').replace('Arrow', '').replace('Digit', '').replace('Space', 'Espaço').replace('ShiftLeft', 'Shift').replace('ShiftRight', 'Shift dir.').replace('Escape', 'Esc');

class Options extends UiScreen {
  overlay = true;
  private capturing: Action | null = null;
  private waitBox = h('div', 'opt-wait');
  constructor() {
    super('options');
    const o = game.options;
    const pct = (v: number) => `${Math.round(v * 100)}%`;
    const vol = (k: 'musica' | 'sfx' | 'ambiente', label: string): MenuItem => ({
      label, small: true, value: () => pct(o[k]),
      onAdjust: (d) => { o[k] = Math.max(0, Math.min(1, Math.round((o[k] + d * 0.1) * 10) / 10)); this.apply(); if (k === 'sfx') sfx('castanha'); },
    });
    const items: MenuItem[] = [
      vol('musica', 'Música'), vol('sfx', 'Efeitos'), vol('ambiente', 'Ambiente'),
      { label: 'Qualidade', small: true, value: () => (o.qualidade === 'alta' ? 'Alta' : 'Média'), onAdjust: () => { o.qualidade = o.qualidade === 'alta' ? 'media' : 'alta'; this.apply(); } },
      { label: 'Tremor de tela', small: true, value: () => (o.tremor ? 'Ligado' : 'Desligado'), onAdjust: () => { o.tremor = !o.tremor; this.apply(); } },
      { label: 'Assistência', small: true, value: () => (o.assistencia ? '+2 vidas' : 'Desligada'), onAdjust: () => { o.assistencia = !o.assistencia; this.apply(); } },
      ...REMAP.map((a): MenuItem => ({ label: NOMES_ACOES[a], small: true, value: () => keyName(o.teclas[a]?.[0] ?? DEFAULT_KEYS[a][0]), onSelect: () => this.capture(a) })),
      { label: 'Teclas padrão', small: true, onSelect: () => { o.teclas = { ...DEFAULT_KEYS }; this.apply(); } },
      { label: 'Voltar', onSelect: () => this.close() },
    ];
    for (const it of items) if (it.onAdjust && !it.onSelect) it.onSelect = () => it.onAdjust!(1);
    this.menu = new Menu(items, { cls: 'opt-menu' });
    this.el.append(h('div', 'pause-blur'), h('div', 'opt-head', carved('Opções', { tone: 'ouro', size: 52 })),
      h('div', 'panel opt-panel', this.menu.el), this.waitBox,
      h('div', 'prompts-bar', prompt('up', 'Escolher'), prompt('right', 'Ajustar'), prompt('confirm', 'Remapear'), prompt('back', 'Voltar')));
    this.onBack = () => this.close();
  }
  private apply() {
    saveOptions(game.options);
    screens.stage.setQuality(game.options.qualidade);
    bus.emit('options-changed', game.options);
    refreshPrompts();
    this.menu?.refresh();
  }
  private capture(a: Action) {
    this.capturing = a;
    this.waitBox.replaceChildren(h('div', 'panel claro', carved(`${NOMES_ACOES[a]}`, { tone: 'madeira', size: 24 }), h('p', 'ui-text', 'Aperte a nova tecla…')));
    this.waitBox.classList.add('on');
    captureNextKey((code) => {
      const o = game.options;
      if (code !== 'Escape' || a === 'pause') {
        // a tecla escolhida sai de outra ação de jogo para não haver conflito
        for (const k of REMAP) if (k !== a) o.teclas[k] = (o.teclas[k] ?? DEFAULT_KEYS[k]).filter((c) => c !== code);
        const rest = (o.teclas[a] ?? DEFAULT_KEYS[a]).filter((c) => c !== code).slice(0, 1);
        o.teclas[a] = [code, ...rest];
        sfx('ui-confirmar');
        this.apply();
      }
      this.waitBox.classList.remove('on');
      setTimeout(() => { this.capturing = null; }, 120);
    });
  }
  private close() { if (screens.top === this) screens.pop(); }
  update(dt: number) {
    if (this.capturing) return;
    super.update(dt);
    void input;
  }
}
registerScreen('options', () => new Options());
