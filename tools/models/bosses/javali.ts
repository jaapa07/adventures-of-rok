/**
 * Cabeça de javali esculpida, compartilhada pelos chefes (Major, piloto da Draga, Barão).
 * Construída em escala unitária (crânio ≈ 0.6 de comprimento) dentro de um osso escalável.
 * Cria os ossos: <p>head (escala), <p>jaw, <p>earL/R, <p>lidL/R, <p>mustL/R.
 */
import { Rig, blob, slab, lathe, spike, tube, eye, mat, pull, bulge, wobble, taper, type V3 } from '../../render/sculpt';

export interface BoarHeadOpts {
  prefix?: string;
  scale: number;
  pos: V3;
  rot?: V3;
  fur: number;
  furDark: number;
  snout: number;
  iris?: number;
  angry?: number; // inclinação das sobrancelhas (raiva > 0, aflito < 0)
  lid?: number;
  mustache?: 'militar' | 'barao' | 'piloto' | null;
  mustacheColor?: number;
  tusks?: number; // tamanho das presas
  look?: [number, number];
}

export function boarHead(r: Rig, parent: string, o: BoarHeadOpts) {
  const P = o.prefix ?? '';
  const hb = r.bone(`${P}head`, parent, o.pos, o.rot ?? [0, 0, 0]);
  hb.scale.setScalar(o.scale);
  r.bone(`${P}jaw`, `${P}head`, [0.2, -0.12, 0], [0, 0, 0]);
  r.bone(`${P}earL`, `${P}head`, [-0.1, 0.2, -0.17], [0, 0, 0]);
  r.bone(`${P}earR`, `${P}head`, [-0.1, 0.2, 0.17], [0, 0, 0]);
  const fur = mat('fur', o.fur, { repeat: 2 });
  const furDark = mat('fur', o.furDark, { repeat: 2 });
  const snoutM = mat('skin', o.snout, { rough: 0.5 });
  const nostril = mat('skin', 0x1a1010, { rough: 0.3 });
  const tuskM = mat('shell', 0xf2e6c8, { rough: 0.35, repeat: 3 });
  const browM = mat('shortFur', 0x1e1612);

  r.add(`${P}head`,
    // crânio com testa larga e ponte do focinho puxada para frente
    blob([0.3, 0.27, 0.26], fur, {
      pos: [0, 0.02, 0],
      deform: [pull([0.25, -0.06, 0], 0.26, [0.14, -0.05, 0]), pull([-0.2, 0.15, 0], 0.18, [-0.03, 0.04, 0]), bulge([0.05, -0.15, 0.2], 0.15, 0.03), bulge([0.05, -0.15, -0.2], 0.15, 0.03), wobble(0.006)],
    }),
    // bochechas gordas
    blob([0.16, 0.13, 0.12], fur, { pos: [0.08, -0.1, 0.16] }),
    blob([0.16, 0.13, 0.12], fur, { pos: [0.08, -0.1, -0.16] }),
    // focinho (disco de javali)
    lathe([[0.12, -0.02], [0.135, 0.04], [0.14, 0.1], [0.135, 0.15], [0.11, 0.17], [0.001, 0.175]], snoutM, { pos: [0.33, -0.08, 0], rot: [0, 0, -90], deform: [taper('y', -0.02, 0.18, 1.1, 1)] }),
    blob([0.022, 0.034, 0.02], nostril, { pos: [0.505, -0.07, 0.05] }),
    blob([0.022, 0.034, 0.02], nostril, { pos: [0.505, -0.07, -0.05] }),
    // rugas do focinho
    tube([[0.3, 0.02, 0.12], [0.34, 0.06, 0.0], [0.3, 0.02, -0.12]], 0.012, mat('skin', 0x2a2018)),
    // crina de cerdas no alto da cabeça
    ...[0, 1, 2, 3, 4].map((i) => spike(0.16 - i * 0.012, 0.045, furDark, { pos: [-0.02 - i * 0.07, 0.25 - i * 0.02, (i % 2 ? 0.02 : -0.02)], rot: [0, 0, 30 + i * 12], curve: -0.4 })),
    // sobrancelhas grossas
    slab([[-0.08, 0], [0.08, 0.0], [0.09, 0.035], [-0.07, 0.045]], 0.035, browM, { pos: [0.21, 0.15, 0.14], rot: [8, 22, -(o.angry ?? 15)] }),
    slab([[-0.08, 0], [0.08, 0.0], [0.09, 0.035], [-0.07, 0.045]], 0.035, browM, { pos: [0.21, 0.15, -0.14], rot: [-8, -22, -(o.angry ?? 15)] }),
  );
  // mandíbula com lábio e presas
  const tusk = o.tusks ?? 1;
  r.add(`${P}jaw`,
    blob([0.17, 0.08, 0.15], fur, { pos: [0.04, -0.04, 0], deform: [pull([0.15, 0, 0], 0.12, [0.03, 0.01, 0])] }),
    blob([0.12, 0.035, 0.11], mat('skin', 0x7a2a2a, { rough: 0.4 }), { pos: [0.08, 0.0, 0] }),
    spike(0.17 * tusk, 0.03 * tusk, tuskM, { pos: [0.16, -0.01, 0.11], rot: [-12, 0, 8], curve: -0.55 }),
    spike(0.17 * tusk, 0.03 * tusk, tuskM, { pos: [0.16, -0.01, -0.11], rot: [12, 0, 8], curve: -0.55 }),
  );
  for (const s of ['L', 'R'] as const) {
    const zs = s === 'R' ? 1 : -1;
    r.add(`${P}ear${s}`,
      slab([[0, 0], [0.09, 0.03], [0.05, 0.2], [-0.04, 0.1]], 0.04, fur, { rot: [zs * 28, 0, 20] }),
      slab([[0.01, 0.02], [0.065, 0.04], [0.04, 0.15], [-0.015, 0.09]], 0.012, mat('skin', 0xa86a62), { pos: [0, 0, zs * 0.02], rot: [zs * 28, 0, 20] }),
    );
  }
  const lidCol = o.furDark;
  const look = o.look ?? [0.6, 0];
  const eR = eye({ r: 0.088, iris: o.iris ?? 0x8a2a14, look, lid: o.lid ?? 0.3, lidColor: lidCol, angry: o.angry ?? 15, irisScale: 0.55 });
  eR.position.set(0.21, 0.07, 0.15); eR.rotation.y = 0.55;
  const eL = eye({ r: 0.082, iris: o.iris ?? 0x8a2a14, look, lid: o.lid ?? 0.3, lidColor: lidCol, angry: -(o.angry ?? 15), irisScale: 0.55 });
  eL.position.set(0.21, 0.07, -0.15); eL.rotation.y = -0.2;
  r.add(`${P}head`, eR, eL);
  r.bones[`${P}lidR`] = eR.getObjectByName('lid')!;
  r.bones[`${P}lidL`] = eL.getObjectByName('lid')!;

  if (o.mustache) {
    const mc = mat('fur', o.mustacheColor ?? 0x2a1e18, { repeat: 1.5 });
    r.bone(`${P}mustR`, `${P}head`, [0.42, -0.14, 0.06]);
    r.bone(`${P}mustL`, `${P}head`, [0.42, -0.14, -0.06]);
    for (const s of ['L', 'R'] as const) {
      const z = s === 'R' ? 1 : -1;
      let pts: V3[];
      let rad: (t: number) => number;
      if (o.mustache === 'barao') {
        // bigode enorme em guidão, pontas enroladas
        pts = [[0, 0, 0], [0.04, -0.04, 0.12 * z], [0.0, -0.02, 0.3 * z], [-0.06, 0.08, 0.42 * z], [-0.02, 0.18, 0.46 * z], [0.05, 0.16, 0.42 * z], [0.04, 0.1, 0.4 * z]];
        rad = (t) => 0.05 * Math.sin(Math.min(t * 1.3 + 0.25, 1) * Math.PI * 0.95) + 0.008;
      } else if (o.mustache === 'militar') {
        // escovão militar caindo dos lados
        pts = [[0, 0, 0], [0.03, -0.04, 0.1 * z], [0.0, -0.12, 0.2 * z], [-0.03, -0.22, 0.24 * z]];
        rad = (t) => 0.055 * (1 - t * 0.7) + 0.01;
      } else {
        pts = [[0, 0, 0], [0.02, -0.03, 0.08 * z], [-0.02, -0.04, 0.16 * z]];
        rad = (t) => 0.03 * (1 - t * 0.6) + 0.006;
      }
      r.add(`${P}must${s}`, tube(pts, rad, mc, { seg: 32, radial: 10 }));
    }
  }
  return { fur, furDark };
}
