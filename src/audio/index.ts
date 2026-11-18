/** API pública de áudio da Selva Sumaúma (Web Audio, tudo sintetizado). */
import { ativo, getCtx } from './core';
import { abaixaMusica, mixer, submerso, trocaReverb, volumes } from './mixer';
import { compilar, type Compilada } from './notation';
import { Tocador, type OuvinteBatida } from './sequencer';
import { tocaPreset } from './sfxEngine';
import { tocaAmbiente } from './ambience';
import { balbuciar } from './babble';
import { variar } from './rng';
import type { PresetReverb } from './reverb';
import { FAIXAS } from '../data/music';
import { SFX, SONS_AMB } from '../data/sfx';

export type { PresetReverb } from './reverb';

const compiladas = new Map<string, Compilada>();
const ouvintes = new Set<OuvinteBatida>();
let tocador: Tocador | null = null;
let musicaAtual: string | null = null;
let tempoMult = 1;
let bomba: ReturnType<typeof setInterval> | null = null;
let ambDesejado: string | null = null;
let musicaPendente: { id: string; fade: number } | null = null;
let vols = { musica: 0.8, sfx: 0.9, ambiente: 0.7 };
let debaixoDagua = false;
let reverbAtual: PresetReverb = 'mata';

function faixa(id: string): Compilada | null {
  const pronta = compiladas.get(id);
  if (pronta) return pronta;
  const f = FAIXAS[id];
  if (!f) { console.warn('[audio] música desconhecida:', id); return null; }
  const comp = compilar(f);
  compiladas.set(id, comp);
  return comp;
}

function ligaBomba(): void {
  if (bomba) return;
  bomba = setInterval(() => { tocador?.bombear(); }, 25);
}

function avisaBatida(b: number): void {
  for (const cb of ouvintes) { try { cb(b); } catch (e) { console.error(e); } }
}

function iniciaMusica(c: AudioContext, id: string, fade: number): void {
  const comp = faixa(id);
  if (!comp) return;
  const m = mixer(c);
  if (tocador) tocador.parar(Math.max(0.05, fade));
  const f = comp.faixa;
  m.envioMusica.gain.setTargetAtTime(f.envio ?? 0.3, c.currentTime, 0.2);
  tocador = new Tocador(c, comp, m.musica, c.currentTime + 0.06, () => tempoMult, avisaBatida);
  tocador.fadeIn(fade);
  musicaAtual = id;
  tocador.bombear();
  ligaBomba();
}

/** Assina a batida (semínima) da música atual. beat % 4 === 0 é o tempo forte do compasso 4/4. Retorna função para cancelar. */
export function onBeat(cb: (beat: number) => void): () => void {
  ouvintes.add(cb);
  return () => { ouvintes.delete(cb); };
}

export const audio = {
  unlock(): void {
    const c = getCtx();
    if (!c) return;
    const m = mixer(c);
    volumes(m, vols);
    const seguir = () => {
      if (musicaPendente) { const p = musicaPendente; musicaPendente = null; iniciaMusica(c, p.id, p.fade); }
      if (ambDesejado) tocaAmbiente(c, m.amb, m.ambRev, ambDesejado);
      if (debaixoDagua) submerso(m, true);
      trocaReverb(m, reverbAtual);
    };
    if (c.state === 'running') seguir();
    else c.resume().then(seguir, (e) => console.warn('[audio] não foi possível liberar o áudio', e));
  },

  setVolumes(v: { musica: number; sfx: number; ambiente: number }): void {
    vols = { ...v };
    const c = getCtx();
    if (c) volumes(mixer(c), vols);
  },

  playMusic(id: string, o?: { fade?: number }): void {
    const fade = o?.fade ?? 0.6;
    if (musicaAtual === id && tocador && !tocador.parado && !tocador.terminou) return;
    const c = ativo();
    if (!c) { musicaPendente = { id, fade }; return; }
    iniciaMusica(c, id, fade);
  },

  stopMusic(fade = 0.8): void {
    musicaPendente = null;
    if (tocador) tocador.parar(fade);
    tocador = null;
    musicaAtual = null;
  },

  setMusicTempo(mult: number): void {
    tempoMult = Math.max(0.25, Math.min(4, Number.isFinite(mult) ? mult : 1));
    tocador?.atualizaTempo();
  },

  duckMusic(ms: number): void {
    const c = ativo();
    if (c) abaixaMusica(mixer(c), ms);
  },

  playSfx(id: string, o?: { vol?: number; pitch?: number; pan?: number }): void {
    const c = ativo();
    if (!c) return;
    // sons de ambiente (clank, vapor, trovão…) também podem ser disparados como efeito pontual
    const def = SFX[id] ?? SONS_AMB[id];
    if (!def) { console.warn('[audio] sfx desconhecido:', id); return; }
    const m = mixer(c);
    tocaPreset(c, def, m.sfx, m.sfxRev, o ?? {}, def.var ? variar(def.var) : 0);
  },

  playAmbience(id: string | null): void {
    ambDesejado = id;
    const c = ativo();
    if (!c) return;
    const m = mixer(c);
    tocaAmbiente(c, m.amb, m.ambRev, id);
  },

  setUnderwater(on: boolean): void {
    debaixoDagua = on;
    const c = ativo();
    if (c) submerso(mixer(c), on);
  },

  setReverb(preset: PresetReverb): void {
    reverbAtual = preset;
    const c = ativo();
    if (c) trocaReverb(mixer(c), preset);
  },

  babble(voice: string, text: string): void {
    const c = ativo();
    if (!c) return;
    balbuciar(c, mixer(c).sfx, voice, text);
  },

  listMusic(): string[] { return Object.keys(FAIXAS); },
  listSfx(): string[] { return Object.keys(SFX); },
};

export default audio;
