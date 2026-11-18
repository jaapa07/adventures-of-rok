/**
 * Ponte entre o barramento de eventos e o módulo de áudio (src/audio).
 * Também: libera o áudio no primeiro toque, volumes das opções, reverb por tileset,
 * filtro submerso (consulta o herói líder a cada quadro), ducking ao ganhar vida.
 */
import { audio, type PresetReverb } from '../audio/index';
import { bus } from '../core/events';
import { game } from '../core/save';
import { LEVELS } from '../data/levels/index';
import { screens } from './screens/manager';
import type { World } from '../game/world';

const REVERB: Record<string, PresetReverb> = { mata: 'mata', gruta: 'gruta', recife: 'recife', fabrica: 'fabrica', cristal: 'cristal', copa: 'copa' };

function topWorld(): World | null {
  for (let i = screens.stack.length - 1; i >= 0; i--) { const w = (screens.stack[i] as { world?: World | null }).world; if (w) return w; }
  return null;
}

export function applyVolumes() {
  const o = game.options;
  audio.setVolumes({ musica: o.musica, sfx: o.sfx, ambiente: o.ambiente });
}

let started = false;
export function startAudioBridge() {
  if (started) return;
  started = true;
  applyVolumes();
  const unlock = () => { audio.unlock(); applyVolumes(); };
  addEventListener('keydown', unlock);
  addEventListener('pointerdown', unlock);
  addEventListener('gamepadconnected', unlock);

  bus.on('sfx', (d) => { if (d?.id) audio.playSfx(d.id, { pan: d.pan ?? 0, vol: d.vol ?? 1, pitch: d.pitch }); });
  bus.on('music', (d) => {
    const id = typeof d === 'string' ? d : d?.id;
    if (id) audio.playMusic(id, typeof d === 'object' && d?.fade !== undefined ? { fade: d.fade } : undefined);
    else audio.stopMusic();
  });
  bus.on('music-stop', (d) => audio.stopMusic(d?.fade ?? 0.8));
  bus.on('music-tempo', (d) => audio.setMusicTempo(d?.mult ?? 1));
  bus.on('ambience', (d) => audio.playAmbience(typeof d === 'string' ? d : d?.id ?? null));
  bus.on('babble', (d) => { if (d?.text) audio.babble(d.voice ?? 'tucano', d.text); });
  bus.on('options-changed', applyVolumes);
  bus.on('vida', (d) => { if ((d?.ganho ?? 0) > 0) audio.duckMusic(1400); });
  bus.on('letras-completas', () => audio.duckMusic(1200));
  bus.on('combo', (d) => { if ((d?.n ?? 0) >= 2) audio.playSfx('inimigo-derrota', { pitch: Math.min(12, (d.n - 1) * 2), vol: 0.35 }); });
  bus.on('level-start', (d) => {
    const L = LEVELS[d?.id];
    audio.setReverb(L ? REVERB[L.tileset] ?? 'mata' : 'mata');
    audio.setMusicTempo(1);
  });
  // clímax: perto do Totem de Saída a música acelera um pouco
  let under = false, climax = false;
  const tick = () => {
    const w = topWorld();
    const sw = !!w && !!(w.duo?.leader as unknown as { swimming?: boolean })?.swimming;
    if (sw !== under) { under = sw; audio.setUnderwater(sw); }
    let c = false;
    if (w && w.level.exit && w.level.tipo !== 'bonus') c = !w.finished && Math.abs(w.duo.leader.x / 64 - w.level.exit[0]) < 22;
    if (c !== climax) { climax = c; audio.setMusicTempo(c ? 1.06 : 1); }
    if (!w && under) { under = false; audio.setUnderwater(false); }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
