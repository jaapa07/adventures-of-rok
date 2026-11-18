/**
 * Arsenal (seção 17.2): as 14 armas de mão + os carregáveis (cabaça, cabaça de pedra, bromélia),
 * com golpes, efeitos especiais, arremessos próprios e piadas. Interações 17.3 ficam nos `especial`
 * e no `arremessado`.
 */
import { defineWeapon, WEAPONS, type WeaponDef } from './types';
import type { World } from '../world';
import type { Hero, Held } from '../hero';
import type { Entity } from '../entity';
import { TILE } from '../types';
import { game } from '../../core/save';
import { bus } from '../../core/events';
import { knock, stun, rebater } from './efeitos';
import { isMecanico } from './util';
import { burst } from '../pickups/coletaveis';
import { jitter } from '../pickups/common';

/** área à frente do herói (mesma convenção do golpe do herói) */
function frente(hero: Hero, alcance: number, altura: number) {
  return { x: hero.x + hero.dir * (alcance / 2 + hero.w * 0.3), y: hero.y + 4, w: alcance, h: altura };
}
function noArea(e: Entity, a: { x: number; y: number; w: number; h: number }) {
  return Math.abs(e.x - a.x) < (e.w + a.w) / 2 && e.y - e.h < a.y && e.y > a.y - a.h;
}
const pequeno = (e: Entity) => !e.armored && e.w < 96 && e.h < 130;

/* ------------------------------------------------------------------ */
defineWeapon({
  id: 'galho', nome: 'Galho Torto', peso: 'leve', usos: 6, model: 'arma-galho', pega: 'mao',
  golpe: { alcance: 96, altura: 110, dmg: 1, som: 'golpe-leve', acerto: 'golpe-acerto', empurra: 220 },
  piada: 'Arremessado, gira como bumerangue torto e volta. Às vezes fica preso numa árvore…',
});

defineWeapon({
  id: 'coco', nome: 'Coco Verde', peso: 'leve', usos: 1, model: 'arma-coco', pega: 'mao',
  golpe: null,
  piada: 'Quica 3 vezes atordoando; ao quebrar, a água molha e faz escorregar.',
});

defineWeapon({
  id: 'jaca', nome: 'Jaca Madura', peso: 'pesado', usos: 2, model: 'arma-jaca', pega: 'mao', soTama: true,
  golpe: {
    alcance: 84, altura: 130, dmg: 2, som: 'golpe-pesado', acerto: 'jaca-splat', onomato: 'SPLOFT!', empurra: 120,
    especial: (w, hero, alvo) => { if (alvo) { w.shake(4, 140); w.spawnFx('fx-lascas', 'cabaca', alvo.x, alvo.y - alvo.h * 0.7, { scale: 0.8 }); } void hero; },
  },
  aoQuebrar: (w, hero) => { w.spawn({ t: 'poca', x: (hero.x + hero.dir * 70) / TILE, y: hero.y / TILE }); w.sfx('jaca-splat', hero.x); },
  piada: 'Esmaga e deixa uma poça grudenta: quem pisa fica preso 2 s.',
});

defineWeapon({
  id: 'remo', nome: 'Remo de Canoa', peso: 'medio', usos: 8, model: 'arma-remo', pega: 'mao',
  golpe: {
    alcance: 116, altura: 130, dmg: 1, som: 'golpe-leve', acerto: 'golpe-acerto', empurra: 260,
    especial: (w, hero) => { rebater(w, hero, frente(hero, 150, 170)); },
  },
  piada: 'Rebate projéteis; jogado na água vira prancha de surfe.',
});

defineWeapon({
  id: 'vassoura', nome: 'Vassoura de Piaçava', peso: 'medio', usos: 10, model: 'arma-vassoura', pega: 'mao',
  golpe: {
    alcance: 124, altura: 80, dmg: 1, som: 'vassoura-varrer', acerto: 'golpe-acerto',
    especial: (w, hero, _alvo, combo) => {
      const a = frente(hero, 140, 90);
      for (const e of w.entities) {
        if (e.dead || e.team !== 'enemy' || !pequeno(e) || !noArea(e, a)) continue;
        knock(w, e, hero.dir * (combo === 3 ? 900 : 650), 0.45, 'vassoura');
      }
      // a poeira esconde o herói por 1 s
      hero.disguiseT = Math.max(hero.disguiseT, 1);
      for (let k = 0; k < 3; k++) w.spawnFx('fx-poeira', 'corrida', hero.x + hero.dir * (30 + k * 30), hero.y, { flip: hero.dir < 0, scale: jitter(1 + k * 0.2), alpha: 0.9 });
    },
  },
  piada: 'Varre inimigos pequenos para fora da plataforma; a poeira esconde a dupla.',
});

defineWeapon({
  id: 'panela', nome: 'Panela de Barro', peso: 'medio', usos: 4, model: 'arma-panela', pega: 'mao',
  golpe: {
    alcance: 90, altura: 110, dmg: 1, som: 'golpe-pesado', acerto: 'pooin', onomato: 'PÓÓIN!',
    especial: (w, _hero, alvo) => { if (alvo && !alvo.dead && alvo.team === 'enemy') stun(w, alvo, 2); },
  },
  piada: 'Jogada para cima e caindo na cabeça, vira capacete (aguenta 1 golpe a mais).',
});

/* Lamparina: ilumina 20 s no escuro; apaga e reacende em fogueiras */
const fuel = new WeakMap<Held, number>();
const LAMP_FUEL = 20;
function queimarPerto(w: World, x: number, y: number, r: number) {
  let n = 0;
  for (const e of w.entities) {
    if (e.dead || Math.hypot(e.x - x, e.y - y) > r) continue;
    if (e.spawn.t === 'teia') { (e as unknown as { queimar?: () => void }).queimar?.(); n++; }
    if (e.spawn.t === 'fogueira') (e as unknown as { acender?: () => void }).acender?.();
  }
  return n;
}
defineWeapon({
  id: 'lamparina', nome: 'Lamparina Acesa', peso: 'leve', usos: 5, model: 'arma-lamparina', pega: 'mao',
  golpe: {
    alcance: 86, altura: 110, dmg: 1, som: 'golpe-leve', acerto: 'fogo', empurra: 160,
    especial: (w, hero) => {
      queimarPerto(w, hero.x + hero.dir * 70, hero.y - 40, 130);
      for (const e of w.enemiesNear(hero.x, hero.y - 80, 300)) {
        if (e.spawn.t !== 'morcego') continue;
        e.onHit({ kind: 'outro', dmg: 0, dir: e.x > hero.x ? 1 : -1, x: hero.x, y: hero.y, weapon: 'lamparina', source: hero });
        knock(w, e, (e.x > hero.x ? 1 : -1) * 500, 0.3, 'lamparina');
        bus.emit('lamparina-susto', { type: e.spawn.t });
      }
    },
  },
  segurando: (w, hero, dt) => {
    const h = hero.held!;
    // encostar numa teia com a lamparina queima a teia
    if (Math.floor(w.time * 4) !== Math.floor((w.time - dt) * 4)) queimarPerto(w, hero.x + hero.dir * 40, hero.y - 50, 90);
    if (!w.regionFlags.escuro) return;
    const f = (fuel.get(h) ?? LAMP_FUEL) - dt;
    fuel.set(h, f);
    if (f <= 0) {
      hero.equip({ def: WEAPONS['lamparina-apagada'], usos: h.usos });
      w.sfx('fogo', hero.x, 0.4);
      w.text('APAGOU…', hero.x, hero.y - hero.h - 10, 'small');
      bus.emit('lamparina-apagou');
    }
  },
  piada: 'Queima teias, assusta morcegos e acende fogueiras à distância.',
});
defineWeapon({
  id: 'lamparina-apagada', nome: 'Lamparina Apagada', peso: 'leve', usos: 5, model: 'arma-lamparina', pega: 'mao',
  golpe: { alcance: 80, altura: 100, dmg: 1, som: 'golpe-leve', acerto: 'golpe-acerto' },
  segurando: (w, hero) => {
    const f = w.find((e) => e.spawn.t === 'fogueira' && !e.dead && (e as unknown as { acesa: boolean }).acesa && Math.abs(e.x - hero.x) < 110 && Math.abs(e.y - hero.y) < 90);
    if (f) relightLamp(w, hero);
  },
  piada: 'Reacenda numa fogueira.',
});
/** reacende a lamparina do herói (fogueira acesa por perto) */
export function relightLamp(w: World, hero: Hero) {
  if (hero.held?.def.id !== 'lamparina-apagada') return;
  hero.equip({ def: WEAPONS.lamparina, usos: hero.held.usos });
  w.sfx('lamparina-acender', hero.x);
  w.spawnFx('fx-brilho', 'totem', hero.x + hero.dir * 30, hero.y - hero.h * 0.6, { scale: 0.6 });
  bus.emit('lamparina-acesa');
}

defineWeapon({
  id: 'chave', nome: 'Chave Inglesa Gigante', peso: 'pesado', usos: 6, model: 'arma-chave', pega: 'mao', soTama: true,
  golpe: {
    alcance: 100, altura: 120, dmg: 2, som: 'golpe-pesado', acerto: 'golpe-acerto', onomato: 'KLANG!', empurra: 200,
    especial: (w, hero) => {
      const a = frente(hero, 100, 120);
      for (const e of w.entities) {
        if (e.dead || !noArea(e, a)) continue;
        if (e.team === 'enemy' && isMecanico(e)) {
          // desmonta em 1 golpe: peças viram parafusos
          e.onHit({ kind: 'arma', dmg: 99, dir: hero.dir, x: hero.x, y: hero.y, weapon: 'chave', source: hero, heavy: true });
          if (!e.dead) e.dead = true;
          w.enemyKilled(e, 'arma', 'chave');
          w.spawnFx('fx-fumaca', 'derrota', e.x, e.y - e.h / 2);
          burst(w, 'parafuso', e.x, e.y - e.h * 0.5, 3);
          w.text('DESMONTOU!', e.x, e.y - e.h);
          bus.emit('desmontado', { type: e.spawn.t });
        }
      }
    },
  },
  piada: 'Desmonta robôs em 1 golpe; arremessada, gira e corta cordas.',
});

defineWeapon({
  id: 'peixe', nome: 'Peixe Seco', peso: 'leve', usos: 3, model: 'arma-peixe', pega: 'mao',
  golpe: {
    alcance: 84, altura: 100, dmg: 1, som: 'golpe-leve', acerto: 'plaft', onomato: 'PLAFT',
    especial: (w, hero) => bus.emit('peixe-isca', { x: hero.x + hero.dir * 60, y: hero.y, hero: hero.hid }),
  },
  segurando: (w, hero, dt) => {
    if (Math.floor(w.time) !== Math.floor(w.time - dt)) bus.emit('peixe-isca', { x: hero.x, y: hero.y, hero: hero.hid, segurando: true });
  },
  piada: 'Atrai a Piranha-Boia, que vira aliada por 5 s.',
});

defineWeapon({
  id: 'estilingue', nome: 'Estilingue de Forquilha', peso: 'leve', usos: 12, model: 'arma-estilingue', pega: 'mao',
  golpe: null,
  arremessar: (w, hero, modo) => {
    const tem = game.save.castanhas > 0;
    const y = (hero.y - hero.h * 0.6) / TILE;
    if (tem) {
      game.save.castanhas--;
      bus.emit('coin', { n: game.save.castanhas, gasto: true });
      w.sfx('estilingue', hero.x);
    } else {
      w.sfx('ui-erro', hero.x);
      w.text('SEM CASTANHA!', hero.x, hero.y - hero.h - 10, 'small');
    }
    return w.spawn({ t: 'tiro-estilingue', x: (hero.x + hero.dir * 40) / TILE, y, dir: hero.dir, modo, seco: !tem }) ?? undefined;
  },
  piada: 'Cada tiro gasta 1 castanha. Acerta letras distantes e interruptores.',
});

defineWeapon({
  id: 'cupinzeiro', nome: 'Pedaço de Cupinzeiro', peso: 'pesado', usos: 1, model: 'arma-cupinzeiro', pega: 'mao', soTama: true,
  golpe: null,
  piada: 'Explode numa nuvem de cupins que persegue inimigos e come madeira.',
});

/* Guarda-chuva: planar (o herói já plana com ele) e bloquear projéteis que caem de cima; quebra com 3 bloqueios */
const bloqueios = new WeakMap<Held, number>();
defineWeapon({
  id: 'guarda-chuva', nome: 'Guarda-chuva de Folha', peso: 'leve', usos: Infinity, model: 'arma-guarda-chuva', pega: 'mao',
  golpe: { alcance: 76, altura: 80, dmg: 1, som: 'golpe-leve', acerto: 'golpe-acerto', empurra: 140 },
  segurando: (w, hero) => {
    const h = hero.held!;
    const hs = hero.heldSprite;
    const aberto = !hero.b.onGround && hero.b.vy > 0;
    if (hs) {
      const want = aberto ? 'aberto' : 'mao';
      if (hs.animName !== want && hs.has(want)) { hs.play(want); if (aberto) w.sfx('guarda-chuva-abrir', hero.x, 0.5); }
    }
    const top = hero.y - hero.h;
    for (const p of w.entities) {
      if (p.dead || p.team !== 'projectile' || p.vy <= 0) continue;
      if (Math.abs(p.x - hero.x) < 70 && p.y > top - 90 && p.y < top + 30) {
        p.kill();
        w.spawnFx('fx-faisca', 'impacto', p.x, p.y, { scale: 0.7 });
        w.sfx('golpe-acerto', p.x, 0.6);
        const n = (bloqueios.get(h) ?? 0) + 1;
        bloqueios.set(h, n);
        bus.emit('guarda-chuva-bloqueio', { n });
        if (n >= 3) { hero.breakHeld(); return; }
      }
    }
  },
  piada: 'Plana devagar e bloqueia o que cai de cima.',
});

defineWeapon({
  id: 'buzina', nome: 'Buzina de Caminhão', peso: 'medio', usos: 4, model: 'arma-buzina', pega: 'mao',
  golpe: {
    alcance: 60, altura: 100, dmg: 0, som: 'foom',
    especial: (w, hero) => {
      w.text('FOOM!', hero.x + hero.dir * 80, hero.y - hero.h);
      w.spawnFx('fx-ondas-som', 'buzina', hero.x + hero.dir * 70, hero.y - hero.h * 0.55, { flip: hero.dir < 0, scale: 1.2, z: 65 });
      w.shake(3, 150);
      bus.emit('buzina', { x: hero.x, y: hero.y });
      bus.emit('barulho', { x: hero.x, y: hero.y, kind: 'buzina' });
      for (const e of w.entities) {
        if (e.dead || e.team !== 'enemy') continue;
        const dx = (e.x - hero.x) * hero.dir;
        const dy = Math.abs((e.y - e.h / 2) - (hero.y - hero.h / 2));
        if (dx < 0 || dx > 440 || dy > 70 + dx * 0.45) continue;
        const ok = e.onHit({ kind: 'outro', dmg: 0, dir: hero.dir, x: hero.x, y: hero.y, weapon: 'buzina', source: hero });
        knock(w, e, hero.dir * (520 - dx * 0.6), 0.35, 'buzina');
        if (ok && e.dead) w.enemyKilled(e, 'outro', 'buzina');
      }
    },
  },
  piada: 'FOOM! Javalins pulam de susto e caem sentados.',
});

const disfarceDado = new WeakSet<Held>();
defineWeapon({
  id: 'capacete', nome: 'Capacete de Javalim', peso: 'leve', usos: 2, model: 'arma-capacete', pega: 'mao',
  golpe: {
    alcance: 90, altura: 100, dmg: 1, som: 'golpe-leve', acerto: 'golpe-acerto', empurra: 300,
    especial: (_w, hero) => { hero.b.vx = hero.dir * 620; hero.disguiseT = 0; },
  },
  segurando: (w, hero) => {
    const h = hero.held!;
    if (disfarceDado.has(h)) return;
    disfarceDado.add(h);
    hero.disguiseT = 4;
    w.text('DISFARCE!', hero.x, hero.y - hero.h - 10, 'small');
    bus.emit('disfarce', { hero: hero.hid });
  },
  piada: 'Disfarce: os inimigos ignoram a dupla por 4 s (até ela atacar).',
});

/* Carregáveis (acima da cabeça) */
defineWeapon({ id: 'cabaca', nome: 'Cabaça Rolante', peso: 'medio', usos: 1, model: 'cabaca', pega: 'cabeca', golpe: null, piada: 'Rola pelo chão derrubando inimigos.' });
defineWeapon({ id: 'cabaca-pedra', nome: 'Cabaça de Pedra', peso: 'pesado', usos: 1, model: 'cabaca-pedra', pega: 'cabeca', golpe: null, soTama: true, piada: 'Quebra paredes rachadas e afunda na água.' });
defineWeapon({ id: 'bromelia', nome: 'Bromélia-mola', peso: 'leve', usos: 1, model: 'bromelia', pega: 'cabeca', golpe: null, piada: 'Plante em outro lugar e pule.' });

export const ARSENAL_IDS = ['galho', 'coco', 'jaca', 'remo', 'vassoura', 'panela', 'lamparina', 'chave', 'peixe', 'estilingue', 'cupinzeiro', 'guarda-chuva', 'buzina', 'capacete'];
export function weaponDef(id: string): WeaponDef | undefined { return WEAPONS[id]; }
