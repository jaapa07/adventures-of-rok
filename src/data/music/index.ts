/** Registro de todas as faixas do jogo (ids usados por `audio.playMusic`). */
import type { Faixa } from './types';
import { titulo } from './titulo';
import { mapa } from './mapa';
import { mata } from './mata';
import { gruta } from './gruta';
import { recife } from './recife';
import { praia } from './praia';
import { fabrica } from './fabrica';
import { copa } from './copa';
import { chefe } from './chefe';
import { chefeFinal } from './chefe-final';
import { bonus } from './bonus';
import { dj } from './dj';
import { vitoria } from './vitoria';
import { gameover } from './gameover';
import { final } from './final';
import { creditos } from './creditos';

export const FAIXAS: Record<string, Faixa> = {
  titulo, mapa, mata, gruta, recife, praia, fabrica, copa, chefe, 'chefe-final': chefeFinal,
  bonus, dj, vitoria, gameover, final, creditos,
};
