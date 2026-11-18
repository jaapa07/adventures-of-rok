/** Registro dos módulos de weapons (cada arquivo chama register(...)/defineWeapon(...) ao ser importado). */
import './arsenal';
import './arma';
import './arremessado';
import './efeitos';
export { pickableWeaponNear, takeWeapon, spawnFlyingWeapon } from './util';
