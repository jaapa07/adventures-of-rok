/** Base das telas de interface (DOM puro). */
import type { Screen } from './manager';
import { screens } from './manager';
import { makeScreen } from './registry';
import { input } from '../../core/input';
import { h, Menu, sfx } from '../components/ui';

export abstract class UiScreen implements Screen {
  el: HTMLElement;
  overlay = false;
  menu: Menu | null = null;
  /** ação de voltar (Esc/B); null = sem voltar */
  onBack: (() => void) | null = null;
  protected t = 0;
  constructor(cls: string) { this.el = h('div', 'ui-screen ' + cls); }
  enter?(): void;
  exit?(): void;
  resume?(): void;
  update(dt: number) {
    this.t += dt;
    if (screens.busy) return;
    if (this.menu?.update()) return;
    if (this.onBack && input.pressed('back')) { sfx('ui-voltar'); this.onBack(); }
  }
  render?(alpha: number, frameDt: number): void;
}

/** Abre uma tela registrada por id (replace com cortina por padrão; push para sobreposições). */
export function go(id: string, args: unknown = {}, mode: 'replace' | 'push' = 'replace') {
  const s = makeScreen(id, args);
  if (!s) return null;
  if (mode === 'push') screens.push(s); else screens.replace(s);
  return s;
}
