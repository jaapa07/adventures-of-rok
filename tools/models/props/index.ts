import type { ModelDef } from '../../render/types';
import { cabaca, cabacaPedra } from './cabaca';
import { bromelia } from './bromelia';
import { florCatapulta } from './flor-catapulta';
import { ninho } from './ninho';
import { totemCipo, totemSaida } from './totem';
import { caixaMontaria } from './caixa';
import { tronco, carrinho, paredeRachada, terraMole, blocoMadeira } from './cenario';
import { fogueira, teia, painelMaquina, garrafaCafe, celular, canoa, gaiola, sementeMae, placaTrilho, serraGigante } from './diversos';
import { arvoreChefe } from './arvore-chefe';
export const models: ModelDef[] = [
  arvoreChefe,
  cabaca, cabacaPedra, bromelia, florCatapulta, ninho, totemCipo, totemSaida, caixaMontaria,
  tronco, carrinho, paredeRachada, terraMole, blocoMadeira,
  fogueira, teia, painelMaquina, garrafaCafe, celular, canoa, gaiola, sementeMae, placaTrilho, serraGigante,
];
