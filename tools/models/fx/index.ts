import type { ModelDef } from '../../render/types';
import { fxPoeira, fxFaisca, fxEstrelas, fxFumaca, fxLascas, fxAgua } from './impacto';
import { fxBrilho, fxFolhas, fxVagalume, fxGota, fxRaioLuz, fxRastro, fxExplosao, fxCupins, fxOndasSom, fxPoca, fxChuva, fxEco, fxNotas, fxBolhasSos, fxCoracao } from './ambiente';
export const models: ModelDef[] = [
  fxPoeira, fxFaisca, fxEstrelas, fxFumaca, fxLascas, fxAgua,
  fxBrilho, fxFolhas, fxVagalume, fxGota, fxRaioLuz, fxRastro, fxExplosao, fxCupins, fxOndasSom, fxPoca, fxChuva, fxEco, fxNotas, fxBolhasSos, fxCoracao,
];
