/**
 * Materiais autorais do pipeline de pré-renderização.
 * Texturas são padrões SVG escritos à mão, rasterizados em CanvasTexture (somente em tools/).
 * Todos os materiais recebem um termo de "rim light" fresnel para o visual pré-renderizado clássico.
 */
import * as THREE from 'three';

export type MatKind =
  | 'fur' | 'shortFur' | 'skin' | 'eyeWhite' | 'iris' | 'pupil' | 'glint'
  | 'wood' | 'bark' | 'stone' | 'rock' | 'leaf' | 'grass' | 'metal' | 'rust'
  | 'cloth' | 'leather' | 'shell' | 'scale' | 'water' | 'crystal' | 'gourd'
  | 'plastic' | 'glow' | 'rubber' | 'earth' | 'sand' | 'coral' | 'paint' | 'glass';

export interface MatOpts {
  rough?: number;
  metal?: number;
  emissive?: number;
  emissiveIntensity?: number;
  opacity?: number;
  rim?: number; // força do rim (padrão por tipo)
  repeat?: number; // repetição da textura
  flat?: boolean;
}

/* ---------------- Padrões SVG autorais (tiles 128×128, sem aleatoriedade) ---------------- */

const SVG: Record<string, string> = {
  // mechas de pelo: traços curvos em fileiras desencontradas
  fur: `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128"><rect width="128" height="128" fill="#bbb"/>
    <g stroke-linecap="round" fill="none">
    ${[0, 1, 2, 3, 4, 5, 6, 7].map((row) => [0, 1, 2, 3, 4, 5, 6, 7].map((col) => {
      const x = col * 16 + (row % 2) * 8, y = row * 16;
      return `<path d="M${x} ${y + 2} q 3 7 1 14" stroke="#fff" stroke-width="2.4" opacity=".55"/><path d="M${x + 5} ${y + 4} q 3 6 0 12" stroke="#777" stroke-width="2" opacity=".6"/><path d="M${x + 10} ${y} q 2 8 -1 15" stroke="#999" stroke-width="1.6" opacity=".5"/>`;
    }).join('')).join('')}
    </g></svg>`,
  shortFur: `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128"><rect width="128" height="128" fill="#c4c4c4"/>
    <g stroke-linecap="round" fill="none">
    ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((row) => [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((col) => {
      const x = col * 8 + (row % 2) * 4, y = row * 8;
      return `<path d="M${x} ${y} l 1 6" stroke="${(row + col) % 3 === 0 ? '#fff' : '#8a8a8a'}" stroke-width="1.6" opacity=".55"/>`;
    }).join('')).join('')}
    </g></svg>`,
  wood: `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128"><rect width="128" height="128" fill="#b5b5b5"/>
    <g fill="none" stroke="#7d7d7d" stroke-width="2">
      <path d="M0 10 C 30 14, 60 6, 128 12"/><path d="M0 28 C 40 24, 80 34, 128 27"/><path d="M0 47 C 20 50, 50 40, 128 49"/>
      <path d="M0 66 C 35 70, 90 60, 128 67"/><path d="M0 86 C 25 82, 70 92, 128 85"/><path d="M0 104 C 45 108, 85 98, 128 105"/>
      <path d="M0 121 C 30 118, 70 126, 128 120"/>
      <ellipse cx="72" cy="57" rx="9" ry="4" stroke="#666"/><ellipse cx="72" cy="57" rx="4" ry="1.6" stroke="#666"/>
    </g><g fill="none" stroke="#e2e2e2" stroke-width="1.2" opacity=".7">
      <path d="M0 18 C 40 21, 80 14, 128 19"/><path d="M0 77 C 40 80, 80 73, 128 78"/></g></svg>`,
  bark: `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128"><rect width="128" height="128" fill="#a8a8a8"/>
    <g fill="none" stroke="#5c5c5c" stroke-width="5" stroke-linecap="round">
      <path d="M10 0 C 14 30, 6 60, 12 128"/><path d="M38 0 C 32 40, 42 70, 36 128"/><path d="M66 0 C 72 35, 62 80, 70 128"/>
      <path d="M96 0 C 90 30, 100 90, 94 128"/><path d="M120 0 C 124 50, 116 90, 122 128"/>
      <path d="M12 44 L 36 52"/><path d="M70 30 L 94 22"/><path d="M38 96 L 66 104"/><path d="M96 70 L 120 76"/>
    </g><g fill="none" stroke="#dedede" stroke-width="2" opacity=".6">
      <path d="M22 0 C 25 40, 20 80, 24 128"/><path d="M82 0 C 79 40, 85 80, 81 128"/></g></svg>`,
  stone: `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128"><rect width="128" height="128" fill="#b0b0b0"/>
    <g stroke="#6e6e6e" stroke-width="3" fill="#bdbdbd">
      <path d="M2 2 L 46 4 L 52 36 L 30 50 L 4 42 Z"/><path d="M54 2 L 124 6 L 120 40 L 60 38 Z"/>
      <path d="M4 48 L 32 54 L 40 92 L 6 96 Z"/><path d="M38 52 L 84 44 L 96 82 L 46 92 Z"/>
      <path d="M90 42 L 124 46 L 126 96 L 100 86 Z"/><path d="M4 100 L 46 96 L 52 126 L 2 126 Z"/>
      <path d="M52 96 L 98 88 L 124 100 L 120 126 L 58 126 Z"/></g>
    <g fill="#e6e6e6" opacity=".55"><circle cx="20" cy="18" r="3"/><circle cx="90" cy="18" r="2.5"/><circle cx="66" cy="66" r="3"/><circle cx="20" cy="70" r="2"/><circle cx="84" cy="110" r="3"/></g></svg>`,
  rock: `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128"><rect width="128" height="128" fill="#aaa"/>
    <g fill="none" stroke="#666" stroke-width="2.5" stroke-linecap="round">
      <path d="M8 20 l 18 6 l 10 -8"/><path d="M60 12 l 14 14 l 22 -4"/><path d="M14 64 l 20 -6 l 12 12"/><path d="M70 60 l 18 10 l 24 -6"/>
      <path d="M20 104 l 14 8 l 18 -6"/><path d="M78 100 l 12 14 l 26 -2"/><path d="M104 36 l 10 18"/><path d="M44 36 l -6 16"/></g>
    <g fill="#d8d8d8" opacity=".6"><circle cx="34" cy="40" r="2"/><circle cx="96" cy="80" r="2.4"/><circle cx="50" cy="90" r="1.8"/><circle cx="110" cy="10" r="2"/></g>
    <g fill="#7a7a7a" opacity=".5"><circle cx="16" cy="84" r="2.5"/><circle cx="64" cy="34" r="2"/><circle cx="104" cy="118" r="2.2"/></g></svg>`,
  leaf: `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128"><rect width="128" height="128" fill="#c8c8c8"/>
    <g fill="none" stroke="#f2f2f2" stroke-width="3"><path d="M0 64 L 128 64"/></g>
    <g fill="none" stroke="#e4e4e4" stroke-width="1.6">
      ${[8, 24, 40, 56, 72, 88, 104, 120].map((x) => `<path d="M${x} 64 Q ${x + 10} 40 ${x + 18} 8"/><path d="M${x} 64 Q ${x + 10} 88 ${x + 18} 120"/>`).join('')}
    </g></svg>`,
  grass: `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128"><rect width="128" height="128" fill="#b8b8b8"/>
    <g stroke-linecap="round" fill="none" stroke-width="2.2">
    ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => `<path d="M${i * 11} 128 q 4 -16 ${(i % 3) * 3 - 2} -34" stroke="#ececec" opacity=".6"/><path d="M${i * 11 + 5} 128 q -3 -14 2 -24" stroke="#7b7b7b" opacity=".6"/>`).join('')}
    </g></svg>`,
  metal: `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128"><rect width="128" height="128" fill="#c4c4c4"/>
    <g stroke="#9a9a9a" stroke-width="1">${[4, 12, 20, 28, 36, 44, 52, 60, 68, 76, 84, 92, 100, 108, 116, 124].map((y) => `<path d="M0 ${y} H 128" opacity=".35"/>`).join('')}</g>
    <g fill="#7e7e7e"><circle cx="10" cy="10" r="4"/><circle cx="118" cy="10" r="4"/><circle cx="10" cy="118" r="4"/><circle cx="118" cy="118" r="4"/></g>
    <g fill="#eeeeee"><circle cx="9" cy="9" r="1.5"/><circle cx="117" cy="9" r="1.5"/><circle cx="9" cy="117" r="1.5"/><circle cx="117" cy="117" r="1.5"/></g></svg>`,
  rust: `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128"><rect width="128" height="128" fill="#bdbdbd"/>
    <g fill="#7a7a7a" opacity=".75"><path d="M10 14 C 30 6, 44 22, 34 34 C 22 46, 6 32, 10 14 Z"/><path d="M80 20 C 104 14, 120 34, 104 46 C 90 56, 70 38, 80 20 Z"/>
    <path d="M40 70 C 64 60, 84 80, 66 94 C 50 104, 30 88, 40 70 Z"/><path d="M96 90 C 112 86, 124 104, 112 114 C 100 122, 88 104, 96 90 Z"/><path d="M6 100 C 18 96, 26 110, 16 118 C 8 122, 0 110, 6 100 Z"/></g>
    <g stroke="#8c8c8c" stroke-width="1.4" opacity=".6">${[0, 16, 32, 48, 64, 80, 96, 112].map((y) => `<path d="M0 ${y + 6} H 128"/>`).join('')}</g></svg>`,
  cloth: `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128"><rect width="128" height="128" fill="#c2c2c2"/>
    <g stroke="#a0a0a0" stroke-width="2">${Array.from({ length: 16 }, (_, i) => `<path d="M${i * 8} 0 V 128"/><path d="M0 ${i * 8 + 4} H 128" opacity=".6"/>`).join('')}</g></svg>`,
  leather: `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128"><rect width="128" height="128" fill="#b4b4b4"/>
    <g fill="none" stroke="#8d8d8d" stroke-width="1.5"><path d="M0 30 C 30 20, 50 44, 80 30 S 120 24, 128 36"/><path d="M0 80 C 24 90, 60 70, 90 84 S 120 92, 128 82"/><path d="M20 0 C 26 30, 14 60, 22 128"/><path d="M96 0 C 90 40, 104 70, 98 128"/></g>
    <g stroke="#dcdcdc" stroke-width="2" stroke-dasharray="5 5"><path d="M4 120 H 124"/></g></svg>`,
  shell: `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128"><rect width="128" height="128" fill="#b9b9b9"/>
    <g fill="#d4d4d4" stroke="#6f6f6f" stroke-width="3">
    ${[0, 1, 2, 3].map((r) => [0, 1, 2, 3].map((c) => { const x = c * 32 + (r % 2) * 16, y = r * 32; return `<path d="M${x + 16} ${y + 2} L ${x + 30} ${y + 10} L ${x + 30} ${y + 24} L ${x + 16} ${y + 31} L ${x + 2} ${y + 24} L ${x + 2} ${y + 10} Z"/>`; }).join('')).join('')}
    </g></svg>`,
  scale: `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128"><rect width="128" height="128" fill="#bcbcbc"/>
    <g fill="#d0d0d0" stroke="#808080" stroke-width="1.6">
    ${[0, 1, 2, 3, 4, 5, 6, 7, 8].map((r) => [0, 1, 2, 3, 4, 5, 6, 7, 8].map((c) => { const x = c * 16 + (r % 2) * 8 - 8, y = r * 14 - 6; return `<path d="M${x} ${y} a 8 8 0 0 0 16 0" />`; }).join('')).join('')}
    </g></svg>`,
  gourd: `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128"><rect width="128" height="128" fill="#c6c6c6"/>
    <g fill="none" stroke="#9c9c9c" stroke-width="3">${[8, 30, 52, 74, 96, 118].map((x) => `<path d="M${x} 0 C ${x + 5} 40, ${x - 5} 88, ${x} 128"/>`).join('')}</g>
    <g fill="#e6e6e6" opacity=".6"><ellipse cx="40" cy="30" rx="6" ry="3"/><ellipse cx="90" cy="84" rx="5" ry="2.5"/><ellipse cx="20" cy="100" rx="4" ry="2"/></g></svg>`,
  earth: `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128"><rect width="128" height="128" fill="#adadad"/>
    <g fill="#8a8a8a">${[[12, 14, 5], [40, 30, 4], [86, 12, 6], [110, 44, 4], [24, 64, 6], [64, 56, 3], [96, 78, 5], [16, 104, 4], [56, 100, 6], [104, 116, 3], [76, 34, 2], [36, 84, 2]].map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.7}"/>`).join('')}</g>
    <g fill="#d2d2d2">${[[20, 40, 2], [70, 90, 2.5], [100, 20, 2], [50, 14, 1.5], [116, 96, 2], [30, 120, 1.6]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join('')}</g></svg>`,
  sand: `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128"><rect width="128" height="128" fill="#c0c0c0"/>
    <g fill="none" stroke="#a2a2a2" stroke-width="2"><path d="M0 20 Q 32 12 64 20 T 128 20"/><path d="M0 52 Q 32 44 64 52 T 128 52"/><path d="M0 84 Q 32 76 64 84 T 128 84"/><path d="M0 116 Q 32 108 64 116 T 128 116"/></g>
    <g fill="#dcdcdc">${[[10, 34], [44, 66], [90, 40], [120, 100], [70, 110], [24, 92], [100, 8]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.5"/>`).join('')}</g></svg>`,
  coral: `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128"><rect width="128" height="128" fill="#bdbdbd"/>
    <g fill="#8f8f8f">${[[16, 16], [48, 16], [80, 16], [112, 16], [32, 44], [64, 44], [96, 44], [16, 72], [48, 72], [80, 72], [112, 72], [32, 100], [64, 100], [96, 100]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7"/><circle cx="${x}" cy="${y}" r="3" fill="#e0e0e0"/>`).join('')}</g></svg>`,
};

const texCache = new Map<string, THREE.Texture>();

/** Precarrega todas as texturas SVG. Deve ser aguardado antes de construir modelos. */
export async function loadTextures() {
  await Promise.all(
    Object.entries(SVG).map(
      ([k, svg]) =>
        new Promise<void>((res, rej) => {
          const img = new Image();
          img.onload = () => {
            const c = document.createElement('canvas');
            c.width = c.height = 128;
            const cx = c.getContext('2d')!;
            cx.drawImage(img, 0, 0);
            // suaviza o contraste do padrão (o detalhe vem do relevo, não de manchas)
            cx.globalAlpha = 0.55;
            cx.fillStyle = '#e4e4e4';
            cx.fillRect(0, 0, 128, 128);
            const t = new THREE.CanvasTexture(c);
            t.wrapS = t.wrapT = THREE.RepeatWrapping;
            t.colorSpace = THREE.SRGBColorSpace;
            t.anisotropy = 4;
            texCache.set(k, t);
            res();
          };
          img.onerror = () => rej(new Error('textura ' + k));
          img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
        }),
    ),
  );
}

function tex(k: string, repeat: number) {
  const base = texCache.get(k);
  if (!base) return null;
  const t = base.clone();
  t.needsUpdate = true;
  t.repeat.set(repeat, repeat);
  return t;
}

const DEFAULTS: Record<MatKind, { rough: number; metal: number; tex?: string; rim: number; repeat: number; bump?: number }> = {
  fur: { rough: 0.85, metal: 0, tex: 'fur', rim: 0.75, repeat: 3, bump: 0.03 },
  shortFur: { rough: 0.8, metal: 0, tex: 'shortFur', rim: 0.6, repeat: 3, bump: 0.015 },
  skin: { rough: 0.6, metal: 0, rim: 0.45, repeat: 1 },
  eyeWhite: { rough: 0.15, metal: 0, rim: 0.1, repeat: 1 },
  iris: { rough: 0.2, metal: 0, rim: 0, repeat: 1 },
  pupil: { rough: 0.1, metal: 0, rim: 0, repeat: 1 },
  glint: { rough: 0.1, metal: 0, rim: 0, repeat: 1 },
  wood: { rough: 0.75, metal: 0, tex: 'wood', rim: 0.35, repeat: 1, bump: 0.02 },
  bark: { rough: 0.9, metal: 0, tex: 'bark', rim: 0.35, repeat: 1.5, bump: 0.05 },
  stone: { rough: 0.9, metal: 0, tex: 'stone', rim: 0.3, repeat: 1, bump: 0.05 },
  rock: { rough: 0.95, metal: 0, tex: 'rock', rim: 0.3, repeat: 1.5, bump: 0.04 },
  leaf: { rough: 0.55, metal: 0, tex: 'leaf', rim: 0.5, repeat: 1, bump: 0.01 },
  grass: { rough: 0.8, metal: 0, tex: 'grass', rim: 0.4, repeat: 2, bump: 0.02 },
  metal: { rough: 0.35, metal: 0.85, tex: 'metal', rim: 0.6, repeat: 1, bump: 0.01 },
  rust: { rough: 0.8, metal: 0.4, tex: 'rust', rim: 0.4, repeat: 1, bump: 0.03 },
  cloth: { rough: 0.9, metal: 0, tex: 'cloth', rim: 0.45, repeat: 3, bump: 0.01 },
  leather: { rough: 0.6, metal: 0, tex: 'leather', rim: 0.45, repeat: 1, bump: 0.015 },
  shell: { rough: 0.55, metal: 0, tex: 'shell', rim: 0.5, repeat: 1.5, bump: 0.04 },
  scale: { rough: 0.45, metal: 0.1, tex: 'scale', rim: 0.55, repeat: 2.5, bump: 0.02 },
  water: { rough: 0.05, metal: 0.1, rim: 0.8, repeat: 1 },
  crystal: { rough: 0.1, metal: 0.2, rim: 0.9, repeat: 1 },
  gourd: { rough: 0.45, metal: 0, tex: 'gourd', rim: 0.5, repeat: 1, bump: 0.015 },
  plastic: { rough: 0.35, metal: 0, rim: 0.4, repeat: 1 },
  glow: { rough: 0.5, metal: 0, rim: 0, repeat: 1 },
  rubber: { rough: 0.9, metal: 0, rim: 0.3, repeat: 1 },
  earth: { rough: 1, metal: 0, tex: 'earth', rim: 0.25, repeat: 1.5, bump: 0.04 },
  sand: { rough: 1, metal: 0, tex: 'sand', rim: 0.25, repeat: 1.5, bump: 0.02 },
  coral: { rough: 0.7, metal: 0, tex: 'coral', rim: 0.5, repeat: 1.5, bump: 0.03 },
  paint: { rough: 0.5, metal: 0, rim: 0.35, repeat: 1 },
  glass: { rough: 0.05, metal: 0, rim: 0.9, repeat: 1 },
};

/** Intensidade/cor global do rim, ajustada pelo preset de luz ativo. */
export const rimState = { color: new THREE.Color(0xfff2d6), strength: 1 };
const rimUniforms = { rimColor: { value: rimState.color }, rimStrength: { value: 1 } };
export function setRim(color: number, strength: number) {
  rimState.color.set(color);
  rimUniforms.rimStrength.value = strength;
}

const cache = new Map<string, THREE.Material>();

/** Fábrica de materiais. Mesmo (tipo, cor, opts) → mesma instância. */
export function mat(kind: MatKind, color: number, o: MatOpts = {}): THREE.MeshStandardMaterial {
  const key = kind + ':' + color.toString(16) + ':' + JSON.stringify(o);
  const hit = cache.get(key);
  if (hit) return hit as THREE.MeshStandardMaterial;
  const d = DEFAULTS[kind];
  const t = d.tex ? tex(d.tex, o.repeat ?? d.repeat) : null;
  const m = new THREE.MeshStandardMaterial({
    color,
    roughness: o.rough ?? d.rough,
    metalness: o.metal ?? d.metal,
    map: t,
    bumpMap: t,
    bumpScale: d.bump ?? 0,
    transparent: o.opacity !== undefined && o.opacity < 1,
    opacity: o.opacity ?? 1,
    flatShading: !!o.flat,
  });
  if (kind === 'glow' || o.emissive !== undefined) {
    m.emissive = new THREE.Color(o.emissive ?? color);
    m.emissiveIntensity = o.emissiveIntensity ?? (kind === 'glow' ? 1.2 : 0.6);
  }
  if (kind === 'crystal' || kind === 'glass' || kind === 'water') {
    m.transparent = true;
    m.opacity = o.opacity ?? (kind === 'water' ? 0.65 : 0.82);
  }
  const rim = o.rim ?? d.rim;
  if (rim > 0) {
    m.onBeforeCompile = (sh) => {
      sh.uniforms.rimColor = rimUniforms.rimColor;
      sh.uniforms.rimStrength = rimUniforms.rimStrength;
      sh.fragmentShader = sh.fragmentShader
        .replace('#include <common>', '#include <common>\nuniform vec3 rimColor;\nuniform float rimStrength;')
        .replace(
          '#include <dithering_fragment>',
          `#include <dithering_fragment>
           float rimF = pow(1.0 - clamp(dot(normalize(normal), geometryViewDir), 0.0, 1.0), 2.6);
           gl_FragColor.rgb += rimColor * rimF * ${rim.toFixed(3)} * rimStrength;`,
        );
    };
    m.customProgramCacheKey = () => 'rim' + rim.toFixed(3);
  }
  cache.set(key, m);
  return m;
}
