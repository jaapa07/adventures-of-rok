/** Loop com timestep fixo de 60 Hz e interpolação de renderização. */
export const STEP = 1 / 60;
export interface Loopable { update(dt: number): void; render(alpha: number, frameDt: number): void }

let acc = 0, last = 0, running = false, hitstop = 0;
let target: Loopable | null = null;
export const timing = { frame: 0, time: 0, fps: 60, fpsSamples: [] as number[] };

export function setLoopTarget(t: Loopable) { target = t; }
/** Congela a simulação por `ms` (hit-stop). A renderização continua. */
export function hitStop(ms: number) { hitstop = Math.max(hitstop, ms / 1000); }

function tick(now: number) {
  if (!running) return;
  const dt = Math.min((now - last) / 1000, 0.1);
  last = now;
  timing.fpsSamples.push(dt);
  if (timing.fpsSamples.length > 120) timing.fpsSamples.shift();
  timing.fps = timing.fpsSamples.length / timing.fpsSamples.reduce((a, b) => a + b, 0);
  // o próximo quadro é agendado mesmo se um passo lançar erro: uma exceção isolada não congela o jogo
  try {
    if (hitstop > 0) { hitstop -= dt; }
    else {
      acc += dt;
      let n = 0;
      while (acc >= STEP && n < 5) { acc -= STEP; timing.frame++; timing.time += STEP; n++; target?.update(STEP); }
      if (n === 5) acc = 0;
    }
    target?.render(acc / STEP, dt);
  } finally {
    requestAnimationFrame(tick);
  }
}
export function startLoop() { if (running) return; running = true; last = performance.now(); requestAnimationFrame(tick); }
