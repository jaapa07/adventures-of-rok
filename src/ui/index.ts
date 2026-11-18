/** Registro das telas da interface (cada módulo chama registerScreen ao ser importado). */
import '../styles/ui.css';
import '../styles/hud.css';
import '../styles/screens.css';
import { loadFont } from './components/carved';
import { startAudioBridge } from './audio-bridge';
import { startSystems } from './systems';
import './hud/hud';
import './screens/dialog';
import './screens/cinema';
import './screens/title';
import './screens/map';
import './screens/play-ui';
import './screens/options';
import './screens/incremental';

loadFont();
startAudioBridge();
startSystems();

// inspeção em testes automatizados (?debug): permite disparar eventos do HUD pelo console
import { bus } from '../core/events';
if (new URLSearchParams(location.search).has('debug')) (window as unknown as { __bus: typeof bus }).__bus = bus;
