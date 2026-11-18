/** Atlas de sprites pré-renderizados + pré-carregamento de imagens. */
export interface AtlasEntry {
  src: string; cw: number; ch: number; cols: number; n: number; fps: number; loop: boolean;
  px: number; py: number; boxes: number[][]; hands?: Record<string, number[][]>;
}
export interface ModelMeta { kind: string; meshCount: number; anims: string[]; presets: string[]; variants: string[] }
export interface DecorMeta { src: string; w: number; h: number; ax: number; ay: number }

let atlas: Record<string, any> = {};
let scenery: { decor: Record<string, DecorMeta>; [k: string]: any } = { decor: {} };
const PRESET_FALLBACK = ['selva', 'neutro', 'caverna', 'recife', 'fabrica', 'bonus', 'por-do-sol', 'noite'];

export async function loadManifests() {
  const [a, s] = await Promise.all([
    fetch('assets/atlas.json').then((r) => r.json()).catch(() => ({ '@models': {} })),
    fetch('assets/scenery.json').then((r) => r.json()).catch(() => ({ decor: {} })),
  ]);
  atlas = a; scenery = s;
}
export function modelMeta(id: string): ModelMeta | undefined { return atlas['@models']?.[id]; }
export function sceneryMeta() { return scenery; }

/** Resolve uma animação com fallback de preset e variante. */
export function anim(model: string, name: string, preset = 'selva', variant = 'base'): AtlasEntry | undefined {
  const meta = modelMeta(model);
  const presets = [preset, ...PRESET_FALLBACK, ...(meta?.presets ?? [])];
  for (const v of [variant, 'base']) for (const p of presets) {
    const e = atlas[`${model}|${v}|${p}|${name}`];
    if (e) return e;
  }
  return undefined;
}
export function hasAnim(model: string, name: string) { return !!anim(model, name); }
export function shadowOf(model: string): string | undefined { return atlas[`${model}|shadow`]?.src; }

const loaded = new Map<string, Promise<void>>();
export function preload(src: string): Promise<void> {
  let p = loaded.get(src);
  if (!p) {
    p = new Promise<void>((res) => { const i = new Image(); i.onload = () => { i.decode?.().then(() => res(), () => res()); }; i.onerror = () => res(); i.src = src; });
    loaded.set(src, p);
  }
  return p;
}
/** Pré-carrega todas as animações de um modelo para um preset. */
export function preloadModel(model: string, preset: string, variant = 'base', only?: string[]) {
  const meta = modelMeta(model);
  if (!meta) return Promise.resolve();
  return Promise.all(meta.anims.filter((a) => !only || only.includes(a)).map((a) => { const e = anim(model, a, preset, variant); return e ? preload(e.src) : Promise.resolve(); })).then(() => undefined);
}
