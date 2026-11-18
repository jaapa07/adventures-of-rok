/** Sobe a página de render (Three.js) no Chromium headless. Uso exclusivo do build. */
import { build } from 'esbuild';
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { launch } from './pw';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const CACHE = resolve(ROOT, 'tools/.cache');

export async function openRenderPage() {
  mkdirSync(CACHE, { recursive: true });
  await build({
    entryPoints: [resolve(ROOT, 'tools/render/client.ts')],
    bundle: true, format: 'iife', target: 'es2022', outfile: resolve(CACHE, 'render.js'), logLevel: 'error',
  });
  writeFileSync(resolve(CACHE, 'stage.html'), `<!doctype html><meta charset="utf-8"><body style="margin:0;background:transparent"><script src="render.js"></script>`);
  const browser = await launch();
  const page = await browser.newPage();
  page.on('pageerror', (e: Error) => console.error('[render page]', e.message));
  page.on('console', (m: { type(): string; text(): string }) => { if (m.type() === 'error') console.error('[render console]', m.text()); });
  await page.goto(pathToFileURL(resolve(CACHE, 'stage.html')).href);
  await page.waitForFunction(() => (window as any).ready === true, null, { timeout: 60000 });
  return { browser, page };
}

export function writeDataUrl(file: string, dataUrl: string) {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, Buffer.from(dataUrl.split(',')[1], 'base64'));
}

export function readJson<T>(file: string, fallback: T): T {
  return existsSync(file) ? (JSON.parse(readFileSync(file, 'utf8')) as T) : fallback;
}
