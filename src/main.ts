/** Inicialização de Adventures of ROK. */
import './styles/tokens.css';
import './styles/base.css';
import { Stage } from './render/stage';
import { screens } from './ui/screens/manager';
import { makeScreen } from './ui/screens/registry';
import { PlayScreen } from './ui/screens/play';
import { loadManifests } from './core/assets';
import { setLoopTarget, startLoop } from './core/loop';
import { pollInput } from './core/input';
import './game/register';
import './ui/index';

async function boot() {
  const stage = new Stage(document.getElementById('viewport')!);
  screens.init(stage);
  await loadManifests();
  setLoopTarget({
    update(dt) { pollInput(dt); screens.update(dt); },
    render(a, fd) { screens.render(a, fd); },
  });
  startLoop();
  const q = new URLSearchParams(location.search);
  const fase = q.get('fase');
  const tela = q.get('tela');
  if (fase) screens.push(new PlayScreen({ level: fase }));
  else if (tela) { const s = makeScreen(tela, {}); if (s) screens.push(s); }
  else { const s = makeScreen('splash'); if (s) screens.push(s); }
  (window as unknown as { __sumauma: unknown }).__sumauma = { screens, stage };
}
boot();
