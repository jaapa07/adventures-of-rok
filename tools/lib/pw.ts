import { createRequire } from 'node:module';
const req = createRequire(import.meta.url);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pw: any;
try { pw = req('playwright'); } catch { pw = req('/opt/node-tools/node_modules/playwright'); }
export const chromium: any = pw.chromium;
export async function launch(): Promise<any> {
  return chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
}
