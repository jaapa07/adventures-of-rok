/** Entrada unificada: teclado (remapeável) + Gamepad API. */
export type Action = 'left' | 'right' | 'up' | 'down' | 'jump' | 'action' | 'swap' | 'drop' | 'pocket' | 'pause' | 'confirm' | 'back';

export const DEFAULT_KEYS: Record<Action, string[]> = {
  left: ['ArrowLeft', 'KeyA'], right: ['ArrowRight', 'KeyD'], up: ['ArrowUp', 'KeyW'], down: ['ArrowDown', 'KeyS'],
  jump: ['Space', 'KeyK'], action: ['ShiftLeft', 'ShiftRight', 'KeyJ'], swap: ['KeyE', 'KeyL'], drop: ['KeyC'], pocket: ['KeyQ'],
  pause: ['Escape', 'KeyP'], confirm: ['Enter', 'Space', 'KeyK'], back: ['Escape', 'Backspace'],
};
const PAD: Record<Action, number[]> = {
  left: [14], right: [15], up: [12], down: [13], jump: [0], action: [2], swap: [3], drop: [1], pocket: [4],
  pause: [9], confirm: [0, 9], back: [1],
};

let keymap: Record<string, string[]> = { ...DEFAULT_KEYS };
const keys = new Set<string>();
/** teclas apertadas desde o último passo (garante que toques rápidos não se percam com quadros lentos) */
const tapped = new Set<string>();
const state = new Map<Action, { down: boolean; pressed: boolean; released: boolean; held: number }>();
export let lastDevice: 'kb' | 'pad' = 'kb';
let listeners: ((d: 'kb' | 'pad') => void)[] = [];
export function onDeviceChange(f: (d: 'kb' | 'pad') => void) { listeners.push(f); }
function setDevice(d: 'kb' | 'pad') { if (d !== lastDevice) { lastDevice = d; listeners.forEach((f) => f(d)); } }

export function setKeymap(m: Record<string, string[]>) { keymap = { ...DEFAULT_KEYS, ...m }; }
export function getKeymap() { return keymap; }
let capture: ((code: string) => void) | null = null;
/** Captura a próxima tecla (tela de remapeamento). */
export function captureNextKey(cb: (code: string) => void) { capture = cb; }

addEventListener('keydown', (e) => {
  if (capture) { const c = capture; capture = null; c(e.code); e.preventDefault(); return; }
  keys.add(e.code); tapped.add(e.code); setDevice('kb');
  if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
});
addEventListener('keyup', (e) => keys.delete(e.code));
addEventListener('blur', () => keys.clear());

const ALL: Action[] = Object.keys(DEFAULT_KEYS) as Action[];
for (const a of ALL) state.set(a, { down: false, pressed: false, released: false, held: 0 });

/** Chamar uma vez por passo de simulação. */
export function pollInput(dt: number) {
  const pads = navigator.getGamepads ? navigator.getGamepads() : [];
  const pad = [...pads].find((p) => p && p.connected) ?? null;
  for (const a of ALL) {
    let d = (keymap[a] ?? []).some((k) => keys.has(k) || tapped.has(k));
    if (pad) {
      let pd = PAD[a].some((b) => pad.buttons[b]?.pressed);
      const ax = pad.axes[0] ?? 0, ay = pad.axes[1] ?? 0;
      if (a === 'left' && ax < -0.4) pd = true;
      if (a === 'right' && ax > 0.4) pd = true;
      if (a === 'up' && ay < -0.5) pd = true;
      if (a === 'down' && ay > 0.5) pd = true;
      if (pd) setDevice('pad');
      d = d || pd;
    }
    const s = state.get(a)!;
    s.pressed = d && !s.down;
    s.released = !d && s.down;
    s.held = d ? s.held + dt : 0;
    s.down = d;
  }
  tapped.clear();
}
export const input = {
  down: (a: Action) => state.get(a)!.down,
  pressed: (a: Action) => state.get(a)!.pressed,
  released: (a: Action) => state.get(a)!.released,
  held: (a: Action) => state.get(a)!.held,
  axisX: () => (state.get('right')!.down ? 1 : 0) - (state.get('left')!.down ? 1 : 0),
  /** consome um "pressed" (evita que duas telas reajam ao mesmo toque) */
  consume: (a: Action) => { const s = state.get(a)!; const p = s.pressed; s.pressed = false; return p; },
};
/** Nome amigável da tecla/botão para prompts na UI. */
export function promptFor(a: Action): string {
  if (lastDevice === 'pad') return ({ jump: 'A', action: 'X', swap: 'Y', drop: 'B', pocket: 'LB', pause: 'START', confirm: 'A', back: 'B' } as Record<string, string>)[a] ?? a;
  const k = keymap[a]?.[0] ?? '';
  return k.replace('Key', '').replace('Arrow', '').replace('Space', 'ESPAÇO').replace('ShiftLeft', 'SHIFT').replace('Escape', 'ESC').replace('Enter', 'ENTER');
}
