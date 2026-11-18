/**
 * Bake das fases: compõe chunks 512×512 (terreno + decor de fundo, e decor de frente) a partir dos
 * tiles pré-renderizados e do tilemap escrito à mão. Autotile determinístico por vizinhança.
 * Uso: tsx tools/bake-levels.ts [id ...]
 */
import { resolve } from 'node:path';
import { existsSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { launch } from './lib/pw';
import { ROOT, writeDataUrl } from './lib/renderhost';
import { loadLevels } from './lib/levels';
import type { LevelDef } from '../src/game/types';

const TILE = 64, CHUNK = 512, M = 16; // margem dos tiles 96×96
const ids = process.argv.slice(2);
const LEVELS = await loadLevels();
const scenery = JSON.parse(readFileSync(resolve(ROOT, 'public/assets/scenery.json'), 'utf8'));

const SOLIDISH = new Set(['#', '/', '\\', '>', '<']);
function tileName(rows: string[], x: number, y: number): string | null {
  const c = rows[y]?.[x] ?? '.';
  const at = (xx: number, yy: number) => (xx < 0 || xx >= rows[0].length ? '#' : rows[yy]?.[xx] ?? (yy >= rows.length ? '#' : '.'));
  switch (c) {
    case '#': {
      const m = (SOLIDISH.has(at(x, y - 1)) || y === 0 ? 1 : 0) | (SOLIDISH.has(at(x + 1, y)) ? 2 : 0) | (SOLIDISH.has(at(x, y + 1)) || y === rows.length - 1 ? 4 : 0) | (SOLIDISH.has(at(x - 1, y)) ? 8 : 0);
      if (m === 15) { const v = (x * 7 + y * 13) % 3; return v === 0 ? 'solid-15' : v === 1 ? 'solid-15-b' : 'solid-15-c'; }
      return `solid-${m}`;
    }
    case '/': return 'slope-r';
    case '\\': return 'slope-l';
    case '=': case 'T': {
      const base = c === 'T' ? 'rail' : 'plat';
      if (c === 'T') return 'rail';
      const l = at(x - 1, y) === c, r = at(x + 1, y) === c;
      return `${base}-${l && r ? 'm' : l ? 'r' : r ? 'l' : 's'}`;
    }
    case '^': return 'spike';
    case '|': case '!': {
      const up = at(x, y - 1), dn = at(x, y + 1);
      const isV = (ch: string) => ch === '|' || ch === '!';
      return !isV(up) ? 'vine-top' : !isV(dn) ? 'vine-bottom' : 'vine';
    }
    case '_': return 'rope';
    case '>': case '<': return 'belt';
    default: return null;
  }
}

const browser = await launch();
const page = await browser.newPage();
await page.setContent('<!doctype html><body></body>');
// o tsx injeta __name nas funções serializadas para o navegador
await page.evaluate('window.__name = (f) => f');
const todo = Object.values(LEVELS).filter((l) => !ids.length || ids.includes(l.id));
let missing = new Set<string>();
for (const L of todo as LevelDef[]) {
  const rows = L.tilemap;
  const W = rows[0].length * TILE, H = rows.length * TILE;
  const tiles: { n: string; x: number; y: number }[] = [];
  for (let y = 0; y < rows.length; y++) for (let x = 0; x < rows[0].length; x++) {
    const n = tileName(rows, x, y);
    if (n) tiles.push({ n, x, y });
  }
  const names = [...new Set(tiles.map((t) => t.n))];
  const tileUrls: Record<string, string> = {};
  for (const n of names) {
    const f = resolve(ROOT, `public/assets/tiles/${L.tileset}/${n}.webp`);
    if (existsSync(f)) tileUrls[n] = 'data:image/webp;base64,' + readFileSync(f).toString('base64');
    else missing.add(`${L.tileset}/${n}`);
  }
  const decorUrls: Record<string, { url: string; w: number; h: number; ax: number; ay: number }> = {};
  for (const d of L.decor ?? []) {
    const meta = scenery.decor?.[d.d];
    if (!meta) { missing.add('decor ' + d.d); continue; }
    if (!decorUrls[d.d]) decorUrls[d.d] = { url: 'data:image/webp;base64,' + readFileSync(resolve(ROOT, 'public/assets', meta.src.replace(/^assets\//, ''))).toString('base64'), w: meta.w, h: meta.h, ax: meta.ax, ay: meta.ay };
  }
  const out = (await page.evaluate(async ({ tiles, tileUrls, decorUrls, decor, W, H, TILE, CHUNK, M }: any) => {
    const imgs: Record<string, HTMLImageElement> = {};
    const load = (k: string, u: string) => new Promise<void>((res) => { const i = new Image(); i.onload = () => { imgs[k] = i; res(); }; i.onerror = () => res(); i.src = u; });
    await Promise.all([...Object.entries(tileUrls as Record<string, string>).map(([k, u]) => load('t:' + k, u)), ...Object.entries(decorUrls as Record<string, { url: string }>).map(([k, d]) => load('d:' + k, d.url))]);
    const res: { back: Record<string, string>; front: Record<string, string> } = { back: {}, front: {} };
    const cw = Math.ceil(W / CHUNK), ch = Math.ceil(H / CHUNK);
    for (let cy = 0; cy < ch; cy++) for (let cx = 0; cx < cw; cx++) {
      for (const layer of ['back', 'front'] as const) {
        const c = document.createElement('canvas');
        c.width = CHUNK; c.height = CHUNK;
        const g = c.getContext('2d')!;
        g.translate(-cx * CHUNK, -cy * CHUNK);
        let drew = false;
        if (layer === 'back') {
          for (const t of tiles) {
            const px = t.x * TILE, py = t.y * TILE;
            if (px + TILE + M < cx * CHUNK || px - M > (cx + 1) * CHUNK || py + TILE + M < cy * CHUNK || py - M > (cy + 1) * CHUNK) continue;
            const im = imgs['t:' + t.n];
            if (im) { g.drawImage(im, px - M, py - M, TILE + 2 * M, TILE + 2 * M); drew = true; }
          }
        }
        for (const d of decor) {
          if (!!d.front !== (layer === 'front')) continue;
          const meta = decorUrls[d.d]; const im = imgs['d:' + d.d];
          if (!meta || !im) continue;
          const s = d.s ?? 1;
          const w = meta.w * s, h = meta.h * s;
          const x = d.x * TILE - meta.ax * s, y = d.y * TILE - meta.ay * s;
          if (x + w < cx * CHUNK || x > (cx + 1) * CHUNK || y + h < cy * CHUNK || y > (cy + 1) * CHUNK) continue;
          g.save();
          if (d.flip) { g.translate(d.x * TILE, 0); g.scale(-1, 1); g.translate(-d.x * TILE, 0); }
          g.drawImage(im, x, y, w, h);
          g.restore();
          drew = true;
        }
        if (drew) res[layer][`${cx}_${cy}`] = c.toDataURL('image/webp', 0.88);
      }
    }
    return res;
  }, { tiles, tileUrls, decorUrls, decor: L.decor ?? [], W, H, TILE, CHUNK, M })) as { back: Record<string, string>; front: Record<string, string> };
  const dir = resolve(ROOT, 'public/assets/levels', L.id);
  if (existsSync(dir)) rmSync(dir, { recursive: true });
  mkdirSync(dir, { recursive: true });
  for (const [k, v] of Object.entries(out.back)) writeDataUrl(resolve(dir, `b_${k}.webp`), v);
  for (const [k, v] of Object.entries(out.front)) writeDataUrl(resolve(dir, `f_${k}.webp`), v);
  writeFileSync(resolve(dir, 'chunks.json'), JSON.stringify({ w: W, h: H, back: Object.keys(out.back), front: Object.keys(out.front) }));
  console.log(`✔ ${L.id} ${Object.keys(out.back).length}+${Object.keys(out.front).length} chunks`);
}
await browser.close();
if (missing.size) { console.error('AVISO: assets ausentes no bake:\n  ' + [...missing].join('\n  ')); process.exitCode = 1; }
void pathToFileURL;
