/**
 * Pré-renderiza todos os modelos 3D autorais em spritesheets WebP + atlas JSON.
 * Uso: tsx tools/render-sprites.ts [id ...] [--preset=selva] [--anim=idle] [--variant=base]
 */
import { resolve } from 'node:path';
import { writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs';
import { openRenderPage, writeDataUrl, readJson, ROOT } from './lib/renderhost';

const args = process.argv.slice(2);
const ids = args.filter((a) => !a.startsWith('--'));
const opt = (k: string) => args.find((a) => a.startsWith(`--${k}=`))?.split('=')[1]?.split(',');
const onlyPresets = opt('preset');
const onlyAnims = opt('anim');
const onlyVariants = opt('variant');

const ATLAS = resolve(ROOT, 'public/assets/atlas.json');
const SPR = resolve(ROOT, 'public/assets/sprites');
type Atlas = Record<string, any> & { '@models': Record<string, any> };

const { browser, page } = await openRenderPage();
const models = (await page.evaluate(() => window.listModels())) as { id: string; kind: string; presets: string[]; variants: string[]; anims: string[] }[];
const todo = models.filter((m) => !ids.length || ids.includes(m.id));
if (ids.length && !todo.length) { console.error('nenhum modelo encontrado para', ids.join(', ')); process.exit(1); }
const t0 = Date.now();
let nSheets = 0;
for (const m of todo) {
  // um arquivo de metadados por variante: renders paralelos do mesmo modelo não se sobrescrevem
  const metaFile = resolve(SPR, m.id, onlyVariants?.length === 1 ? `meta-${onlyVariants[0]}.json` : 'meta.json');
  const atlas = readJson<Atlas>(metaFile, { '@models': {} });
  atlas['@models'] ??= {};
  const variants = m.variants.filter((v) => !onlyVariants || onlyVariants.includes(v));
  let meshCount = 0;
  for (const variant of variants) {
    const r = (await page.evaluate(([id, v, p, a]: unknown[]) => window.renderModel(id as string, v as string, p as string[], a as string[]), [m.id, variant, onlyPresets ?? [], onlyAnims ?? []])) as any;
    meshCount = Math.max(meshCount, r.meshCount);
    for (const s of r.sheets) {
      const rel = `assets/sprites/${m.id}/${variant}-${s.preset}-${s.anim}.webp`;
      writeDataUrl(resolve(ROOT, 'public', rel), s.dataUrl);
      atlas[`${m.id}|${variant}|${s.preset}|${s.anim}`] = { src: rel, cw: s.cw, ch: s.ch, cols: s.cols, n: s.n, fps: s.fps, loop: s.loop, px: s.px, py: s.py, boxes: s.boxes, hands: Object.keys(s.hands).length ? s.hands : undefined };
      nSheets++;
    }
    if (r.shadow) {
      const rel = `assets/sprites/${m.id}/shadow.webp`;
      writeDataUrl(resolve(ROOT, 'public', rel), r.shadow);
      atlas[`${m.id}|shadow`] = { src: rel };
    }
  }
  atlas['@models'][m.id] = { kind: m.kind, meshCount, anims: m.anims, presets: m.presets, variants: m.variants };
  mkdirSync(resolve(SPR, m.id), { recursive: true });
  writeFileSync(metaFile, JSON.stringify(atlas));
  console.log(`✔ ${m.id} (${m.kind}) ${variants.length} variante(s), ${meshCount} malhas`);
}
mergeAtlas();
await browser.close();
console.log(`${nSheets} spritesheets em ${((Date.now() - t0) / 1000).toFixed(1)}s`);

/** Junta os meta.json de todos os modelos em public/assets/atlas.json (idempotente; seguro com execuções paralelas). */
export function mergeAtlas() {
  const all: Atlas = { '@models': {} };
  if (existsSync(SPR)) for (const id of readdirSync(SPR)) {
    const dir = resolve(SPR, id);
    const files = readdirSync(dir).filter((f) => f === 'meta.json' || /^meta-.+\.json$/.test(f)).sort((a, b) => (a === 'meta.json' ? -1 : b === 'meta.json' ? 1 : a.localeCompare(b)));
    for (const f of files) {
      const m = readJson<Atlas>(resolve(dir, f), { '@models': {} });
      for (const [k, v] of Object.entries(m)) {
        if (k !== '@models') { all[k] = v; continue; }
        for (const [mid, meta] of Object.entries(v as Record<string, any>)) {
          const prev = all['@models'][mid];
          all['@models'][mid] = prev ? { ...meta, meshCount: Math.max(prev.meshCount, meta.meshCount) } : meta;
        }
      }
    }
  }
  mkdirSync(resolve(ROOT, 'public/assets'), { recursive: true });
  writeFileSync(ATLAS, JSON.stringify(all));
}
