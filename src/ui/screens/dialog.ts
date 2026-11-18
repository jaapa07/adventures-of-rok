/** Diálogo genérico: balão de pergaminho com quem fala (NPC 3D ou ilustração), texto digitado e escolhas. */
import { registerScreen } from './registry';
import { UiScreen } from './base';
import { screens } from './manager';
import { input } from '../../core/input';
import { bus } from '../../core/events';
import { anim } from '../../core/assets';
import { Sprite } from '../../render/sprite';
import { carved } from '../components/carved';
import { h, img, prompt, Menu, sfx, fitSprite, type MenuItem } from '../components/ui';

export interface DialogArgs {
  speaker?: 'tucano' | 'bem-te-vi' | 'bugio' | 'tama' | 'lili';
  titulo?: string;
  text: string;
  items?: MenuItem[];
  /** permite fechar com Voltar quando há escolhas */
  cancel?: boolean;
  icone?: string;
  onClose?: () => void;
}
const NPC: Record<string, { m: string; a: string; svg: string; voz: string }> = {
  tucano: { m: 'tucano', a: 'comentar', svg: 'hud/tucano.svg', voz: 'tucano' },
  'bem-te-vi': { m: 'bem-te-vi', a: 'entregar', svg: 'mapa/bem-te-vi.svg', voz: 'bem-te-vi' },
  bugio: { m: 'vo-bugio', a: 'falar', svg: 'mapa/barraca-bugio.svg', voz: 'vo-bugio' },
  tama: { m: 'tama', a: 'idle', svg: 'icone.svg', voz: 'tama' },
  lili: { m: 'lili', a: 'idle', svg: 'icone.svg', voz: 'lili' },
};

class Dialog extends UiScreen {
  overlay = true;
  private txt = h('p', 'dlg-text');
  private shown = 0;
  private full: string;
  private sp: Sprite | null = null;
  private closed = false;
  constructor(private a: DialogArgs) {
    super('dialog');
    this.full = a.text;
    const who = NPC[a.speaker ?? 'tucano'];
    const face = h('div', 'dlg-face');
    if (who && anim(who.m, who.a, 'neutro')) {
      this.sp = new Sprite(who.m, 'neutro', 'base', face);
      this.sp.play(who.a);
      fitSprite(this.sp, 110, 212, 200, 190, 1.8);
    } else if (who) face.append(img(who.svg, 'dlg-face-svg'));
    const box = h('div', 'panel claro dlg-box');
    if (a.titulo) box.append(h('div', 'dlg-title', carved(a.titulo, { tone: 'madeira', size: 22 })));
    if (a.icone) box.append(img(a.icone, 'dlg-icon'));
    box.append(this.txt);
    if (a.items?.length) {
      this.menu = new Menu(a.items.map((it) => ({ ...it, onSelect: () => { this.close(); it.onSelect?.(); } })), { size: 18 });
      this.menu.enabled = false;
      box.append(this.menu.el);
    } else box.append(h('div', 'dlg-next', prompt('confirm', 'Ok')));
    this.el.append(h('div', 'dlg-shade'), h('div', 'dlg-wrap', face, box));
    this.el.addEventListener('click', (e) => { if (!a.items?.length || !(e.target as HTMLElement).closest('.btn')) this.advance(); });
    if (who) bus.emit('babble', { voice: who.voz, text: a.text.slice(0, 40) });
  }
  private advance() {
    if (this.closed) return;
    if (this.shown < this.full.length) { this.shown = this.full.length; this.txt.textContent = this.full; if (this.menu) this.menu.enabled = true; return; }
    if (!this.a.items?.length) { sfx('ui-confirmar'); this.close(); }
  }
  close() {
    if (this.closed) return;
    this.closed = true;
    if (screens.top === this) screens.pop();
    this.a.onClose?.();
  }
  update(dt: number) {
    this.t += dt;
    if (this.shown < this.full.length) {
      this.shown = Math.min(this.full.length, this.shown + dt * 55);
      this.txt.textContent = this.full.slice(0, Math.floor(this.shown));
      if (this.shown >= this.full.length && this.menu) this.menu.enabled = true;
    }
    if (this.t < 0.15) return;
    if (this.menu && this.menu.enabled) {
      if (this.menu.update()) return;
      if (this.a.cancel && input.pressed('back')) { sfx('ui-voltar'); this.close(); }
      return;
    }
    if (input.pressed('confirm')) this.advance();
    else if (input.pressed('back') && (this.a.cancel || !this.a.items?.length)) { if (this.shown < this.full.length) this.advance(); else this.close(); }
  }
  render(_a: number, fd: number) { if (this.sp) { this.sp.update(fd); this.sp.render(); } }
  exit() { this.sp?.destroy(); }
}
registerScreen('dialog', (a: DialogArgs) => new Dialog(a));

/** Abre um diálogo por cima da tela atual e resolve quando ele fecha. */
export function dialog(a: DialogArgs): Promise<void> {
  return new Promise((res) => {
    const d = new Dialog({ ...a, onClose: () => { a.onClose?.(); res(); } });
    screens.push(d);
  });
}
