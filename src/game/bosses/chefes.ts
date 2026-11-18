/** Entidade `chefe` {id}: escolhe o chefe pelo id. */
import { register } from '../entity';
import { MajorMotosserra } from './major-motosserra';
import { RainhaMorcega } from './rainha-morcega';
import { PolvoDraga } from './polvo-draga';
import { BaraoJavardo } from './barao-javardo';

register('chefe', (w, s) => {
  switch (s.id) {
    case 'rainha-morcega': return new RainhaMorcega(w, s);
    case 'polvo-draga': return new PolvoDraga(w, s);
    case 'barao-javardo': return new BaraoJavardo(w, s);
    default: return new MajorMotosserra(w, s);
  }
});
