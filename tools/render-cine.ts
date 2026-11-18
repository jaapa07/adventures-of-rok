/**
 * Renderiza as cinemáticas (abertura, final, game over, fundo do título) em public/assets/cine/*.webp (1280×720).
 * Uso: tsx tools/render-cine.ts [prefixo-id ...]
 */
import { build } from 'esbuild';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { ROOT, writeDataUrl } from './lib/renderhost';
import { launch } from './lib/pw';

const CACHE = resolve(ROOT, 'tools/.cache');
mkdirSync(CACHE, { recursive: true });
await build({ entryPoints: [resolve(ROOT, 'tools/cine/client.ts')], bundle: true, format: 'iife', target: 'es2022', outfile: resolve(CACHE, 'cine.js'), logLevel: 'error' });
writeFileSync(resolve(CACHE, 'cine.html'), `<!doctype html><meta charset="utf-8"><body style="margin:0;background:#000"><script src="cine.js"></script>`);
const browser = await launch();
const page = await browser.newPage();
page.on('pageerror', (e: Error) => console.error('[cine]', e.message));
page.on('console', (m: { type(): string; text(): string }) => { if (m.type() === 'error') console.error('[cine console]', m.text()); });
await page.goto(pathToFileURL(resolve(CACHE, 'cine.html')).href);
await page.waitForFunction(() => (window as any).ready === true, null, { timeout: 120000 });
const ids = process.argv.slice(2);
const all = (await page.evaluate(() => window.listCine())) as { id: string }[];
const todo = all.filter((s) => !ids.length || ids.some((p) => s.id.startsWith(p)));
const t0 = Date.now();
for (const s of todo) {
  const r = (await page.evaluate((id: string) => window.renderCine(id), s.id)) as { out: string; dataUrl: string };
  writeDataUrl(resolve(ROOT, 'public/assets', r.out), r.dataUrl);
  console.log('  ' + r.out);
}
await browser.close();
console.log(`${todo.length} quadros de cinemática em ${((Date.now() - t0) / 1000).toFixed(1)}s`);
