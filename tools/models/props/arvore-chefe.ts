/**
 * Árvore da arena do Major Motosserra: tronco de ipê com casca profunda, raízes tabulares,
 * marcas de serra antigas e copa densa com cachos de folhas. A serra do chefe prende nela.
 */
import { Rig, blob, lathe, tube, slab, mat, wobble, taper, pull, type V3 } from '../../render/sculpt';
import type { ModelDef } from '../../render/types';
import type { AnimSet, Key } from '../../render/anim';

function build() {
  const r = new Rig('root');
  const bark = mat('bark', 0x6b4a30, { repeat: 2 });
  const barkDark = mat('bark', 0x4a3220, { repeat: 2 });
  const wood = mat('wood', 0xd8b080);
  const moss = mat('grass', 0x4f7a2e, { repeat: 3 });
  r.bone('trunk', 'root', [0, 0, 0]);
  r.bone('crown', 'trunk', [0, 3.5, 0]);
  // tronco (perfil irregular) com leve curva
  r.add('trunk', lathe([[0.62, 0], [0.5, 0.25], [0.42, 0.7], [0.4, 1.4], [0.38, 2.2], [0.34, 3.0], [0.3, 3.6], [0.22, 3.9], [0.001, 3.95]], bark, { seg: 28, deform: [wobble(0.02, 5), pull([0, 2.6, 0], 1.2, [0.06, 0, 0])] }));
  // raízes tabulares
  const roots: [number, number][] = [[0, 1], [70, 0.8], [150, 0.9], [215, 0.7], [290, 1]];
  for (const [ang, s] of roots) {
    const a = (ang * Math.PI) / 180;
    r.add('trunk', slab([[0, 0], [0.75 * s, 0], [0.2, 0.6 * s], [0, 0.9 * s]], 0.12, barkDark, { pos: [Math.cos(a) * 0.3, 0, Math.sin(a) * 0.3], rot: [0, -ang, 0] }));
  }
  // cortes antigos de serra (madeira clara aparecendo) e musgo
  r.add('trunk',
    slab([[-0.18, -0.02], [0.18, -0.02], [0.18, 0.03], [-0.18, 0.03]], 0.04, wood, { pos: [0.05, 1.45, 0.38], rot: [0, 10, -6], smooth: false }),
    slab([[-0.14, -0.02], [0.14, -0.02], [0.14, 0.025], [-0.14, 0.025]], 0.04, wood, { pos: [-0.04, 1.9, 0.36], rot: [0, -8, 8], smooth: false }),
    blob([0.32, 0.12, 0.2], moss, { pos: [-0.25, 0.35, 0.3] }),
    blob([0.22, 0.1, 0.16], moss, { pos: [0.3, 2.4, 0.22] }),
  );
  // galhos principais
  const branches: [V3[], number][] = [
    [[[0, 3.0, 0], [0.7, 3.5, 0.1], [1.3, 3.75, 0.05]], 0.12],
    [[[0, 3.2, 0], [-0.6, 3.7, -0.05], [-1.2, 3.9, 0.1]], 0.11],
    [[[0, 3.5, 0], [0.25, 4.1, 0.2], [0.4, 4.5, 0.1]], 0.09],
  ];
  for (const [pts, rad] of branches) r.add('trunk', tube(pts, (t) => rad * (1 - t * 0.6), bark));
  // copa: cachos densos de folhas em camadas (cada cacho = volume + folhas recortadas)
  const leafDark = mat('leaf', 0x2f6a24), leaf = mat('leaf', 0x4a8a30), leafLight = mat('leaf', 0x6aa83a);
  const clusters: [V3, number, number][] = [
    [[0, 0.5, 0], 1.05, 0], [[-1.1, 0.35, 0.05], 0.8, 1], [[1.15, 0.3, 0], 0.85, 2], [[-0.5, 1.05, 0.1], 0.75, 1], [[0.6, 1.0, -0.05], 0.8, 2],
    [[0.05, 1.45, 0], 0.65, 0], [[-1.5, -0.1, 0.1], 0.55, 2], [[1.6, -0.05, 0.05], 0.55, 1], [[0.2, 0.05, 0.6], 0.6, 2], [[-0.6, 0.0, 0.55], 0.55, 0],
  ];
  const mats = [leafDark, leaf, leafLight];
  clusters.forEach(([p, s, m], i) => {
    r.add('crown', blob([s, s * 0.78, s * 0.8], mats[m], { pos: p, deform: [wobble(0.06, 4 + (i % 3)), taper('y', -s, s, 1.05, 0.85)] }));
    for (let j = 0; j < 6; j++) {
      const a = (j / 6) * Math.PI * 2 + i;
      const lp: V3 = [p[0] + Math.cos(a) * s * 0.85, p[1] + Math.sin(a) * s * 0.55, p[2] + 0.35 * s];
      r.add('crown', slab([[0, 0], [0.16, 0.05], [0.26, 0.0], [0.16, -0.06]], 0.015, mats[(m + j) % 3], { pos: lp, rot: [0, 0, (a * 180) / Math.PI] }));
    }
  });
  return r;
}

const k = (t: number, z: number): Key => ({ t, r: [0, 0, z] });
const anims: AnimSet = {
  idle: { frames: 24, loop: true, keys: { trunk: [k(0, 0), k(0.5, 0.6), k(1, 0)], crown: [k(0, 0), k(0.5, 1.5), k(1, 0)] } },
  tremer: { frames: 10, loop: false, keys: { trunk: [k(0, 0), k(0.1, 2.2), k(0.25, -1.8), k(0.4, 1.4), k(0.6, -0.8), k(1, 0)], crown: [k(0, 0), k(0.15, 4), k(0.35, -3.5), k(0.55, 2.5), k(1, 0)] } },
};

export const arvoreChefe: ModelDef = {
  id: 'arvore-chefe', kind: 'prop', build: () => build(), anims,
  cell: [480, 600], pivot: [240, 580], height: 600 / 104,
  presets: ['selva', 'por-do-sol', 'neutro'],
};
