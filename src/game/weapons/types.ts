/**
 * Contrato das armas de mão (seção 17). Todo objeto que o herói pega é uma WeaponDef:
 * as 14 armas e também os carregáveis (cabaça, cabaça de pedra, bromélia).
 */
import type { World } from '../world';
import type { Entity } from '../entity';
import type { Hero } from '../hero';

export type Peso = 'leve' | 'medio' | 'pesado';
export type ThrowMode = 'frente' | 'cima' | 'baixo';

export interface Golpe {
  alcance: number; // px à frente do herói
  altura: number; // px de altura da área
  dmg: number;
  som: string; // sfx do movimento
  acerto?: string; // sfx ao acertar
  onomato?: string; // texto que salta no acerto ("PÓÓIN!")
  empurra?: number; // impulso horizontal aplicado ao alvo
  /** efeito extra por acerto (atordoar, molhar, desmontar robô em 1 golpe…) */
  especial?: (w: World, hero: Hero, alvo: Entity | null, combo: number) => void;
}

export interface WeaponDef {
  id: string;
  nome: string;
  peso: Peso;
  usos: number; // Infinity = não gasta por golpe
  model: string; // modelo 3D pré-renderizado
  /** 'mao' = desenhada na âncora da mão; 'cabeca' = acima da cabeça com as duas mãos */
  pega: 'mao' | 'cabeca';
  golpe: Golpe | null;
  arremessar?: (w: World, hero: Hero, modo: ThrowMode) => Entity | undefined;
  /** efeito contínuo enquanto segurada */
  segurando?: (w: World, hero: Hero, dt: number) => void;
  /** chamado quando a arma quebra (sem usos) */
  aoQuebrar?: (w: World, hero: Hero) => void;
  /** só a Tamá pega sozinha */
  soTama?: boolean;
  piada?: string;
}

export const WEAPONS: Record<string, WeaponDef> = {};
export function defineWeapon(d: WeaponDef) { WEAPONS[d.id] = d; return d; }
