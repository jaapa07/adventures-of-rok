/** Pilha de telas. Cada tela é dona de um elemento dentro de .screens (ou do palco, no caso do jogo). */
import type { Stage } from '../../render/stage';

export interface Screen {
  el: HTMLElement;
  /** telas "overlay" (pausa, diálogo) não escondem a de baixo nem a pausam no render */
  overlay?: boolean;
  enter?(): void;
  exit?(): void;
  /** volta a ficar no topo depois de um pop */
  resume?(): void;
  update?(dt: number): void;
  render?(alpha: number, frameDt: number): void;
}

class Manager {
  stack: Screen[] = [];
  stage!: Stage;
  private fadeEl!: HTMLElement;
  busy = false;
  init(stage: Stage) {
    this.stage = stage;
    this.fadeEl = document.createElement('div');
    this.fadeEl.className = 'curtain';
    stage.viewport.append(this.fadeEl);
  }
  get top() { return this.stack[this.stack.length - 1]; }
  push(s: Screen) {
    if (!s.el.parentElement) this.stage.screens.append(s.el);
    this.stack.push(s);
    s.enter?.();
  }
  pop() {
    const s = this.stack.pop();
    if (s) { s.exit?.(); s.el.remove(); }
    this.top?.resume?.();
  }
  /** substitui a tela do topo com a transição de cortina de listras diagonais */
  async replace(s: Screen, opts: { curtain?: boolean } = {}) {
    if (opts.curtain !== false) await this.curtain(true);
    while (this.stack.length) { const o = this.stack.pop()!; o.exit?.(); o.el.remove(); }
    this.push(s);
    if (opts.curtain !== false) await this.curtain(false);
  }
  curtain(close: boolean): Promise<void> {
    this.busy = close;
    this.fadeEl.classList.toggle('closed', close);
    return new Promise((r) => setTimeout(() => { this.busy = false; r(); }, 420));
  }
  update(dt: number) {
    const t = this.top;
    t?.update?.(dt);
  }
  render(alpha: number, frameDt: number) {
    for (let i = 0; i < this.stack.length; i++) {
      const s = this.stack[i];
      const visible = i === this.stack.length - 1 || this.stack.slice(i + 1).every((x) => x.overlay);
      if (visible) s.render?.(alpha, frameDt);
    }
  }
}
export const screens = new Manager();
