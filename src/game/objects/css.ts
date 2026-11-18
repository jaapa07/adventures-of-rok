/** Estilos dos elementos DOM dos objetos (balão de fala, portas de cristal, plataformas móveis, mira da flor). */
const CSS = `
.npc-fala { position: absolute; left: 0; top: 0; width: max-content; max-width: 320px; padding: 10px 14px 12px; border-radius: 18px;
  background: var(--creme); color: var(--casca); font-family: var(--fonte-ui); font-weight: 800; font-size: 19px; line-height: 1.2;
  box-shadow: 0 4px 0 rgba(90,58,34,0.45), 0 0 0 3px var(--casca); pointer-events: none; transform-origin: 50% 100%;
  opacity: 0; transition: opacity 0.18s; white-space: normal; text-align: center; }
.npc-fala.on { opacity: 1; animation: npcPop 0.28s cubic-bezier(.3,1.6,.5,1); }
.npc-fala::after { content: ''; position: absolute; left: 50%; bottom: -13px; margin-left: -9px; border: 9px solid transparent;
  border-top: 12px solid var(--creme); border-bottom: 0; filter: drop-shadow(0 3px 0 var(--casca)); }
.npc-fala .quem { display: block; font-family: var(--fonte-titulo); font-size: 14px; color: var(--ambar); letter-spacing: 1px; margin-bottom: 2px; }
@keyframes npcPop { from { transform: var(--pos) scale(0.4); } to { transform: var(--pos) scale(1); } }
.porta-bonus { position: absolute; left: 0; top: 0; width: 100px; height: 158px; border-radius: 50px 50px 6px 6px; pointer-events: none;
  background: radial-gradient(ellipse at 50% 35%, #f3dcff 0%, #b67cf0 22%, #6a2bb8 55%, #2a0f4d 100%);
  box-shadow: 0 0 0 6px #4b2a12, 0 0 0 10px #8a5a2a, 0 0 34px 8px rgba(190,120,255,0.65), inset 0 0 26px rgba(255,255,255,0.45);
  animation: portaPulso 1.6s ease-in-out infinite; }
.porta-bonus::before { content: ''; position: absolute; inset: 14px 22px 0; border-radius: 40px 40px 0 0;
  background: repeating-linear-gradient(115deg, rgba(255,255,255,0.0) 0 14px, rgba(255,255,255,0.22) 14px 18px); animation: portaBrilho 2.4s linear infinite; }
.porta-bonus.saida { background: radial-gradient(ellipse at 50% 35%, #fff6d0 0%, #f2b530 30%, #b0681c 70%, #3a2008 100%);
  box-shadow: 0 0 0 6px #4b2a12, 0 0 0 10px #8a5a2a, 0 0 34px 8px rgba(255,200,90,0.6), inset 0 0 26px rgba(255,255,255,0.45); }
.porta-bonus.fechada { filter: grayscale(0.8) brightness(0.6); animation: none; }
.porta-bonus .dica { position: absolute; left: 50%; top: -38px; transform: translateX(-50%); padding: 3px 10px; border-radius: 10px;
  background: rgba(18,14,24,0.8); color: var(--creme); font-family: var(--fonte-ui); font-weight: 800; font-size: 16px; white-space: nowrap; opacity: 0; transition: opacity 0.2s; }
.porta-bonus.perto .dica { opacity: 1; }
@keyframes portaPulso { 0%,100% { filter: brightness(1); } 50% { filter: brightness(1.25); } }
@keyframes portaBrilho { from { background-position: 0 0; } to { background-position: 80px 0; } }
.plataforma-movel { position: absolute; left: 0; top: 0; height: 64px; pointer-events: none; }
.plataforma-movel > div { position: absolute; top: -16px; width: 96px; height: 96px; background-size: 100% 100%; }
.flor-mira { position: absolute; left: 0; top: 0; width: 150px; height: 14px; transform-origin: 0 50%; pointer-events: none;
  background: repeating-linear-gradient(90deg, rgba(255,244,220,0.95) 0 14px, transparent 14px 26px); border-radius: 7px;
  filter: drop-shadow(0 0 6px rgba(242,181,48,0.9)); }
.flor-mira::after { content: ''; position: absolute; right: -14px; top: -9px; border: 16px solid transparent; border-left: 20px solid rgba(255,244,220,0.95); border-right: 0; }
.achar-premio { position: absolute; left: 0; top: 0; padding: 4px 12px; border-radius: 12px; background: rgba(18,14,24,0.78); color: var(--ouro);
  font-family: var(--fonte-titulo); font-size: 22px; pointer-events: none; white-space: nowrap; }
`;
let done = false;
export function ensureObjectCss() {
  if (done || typeof document === 'undefined') return;
  done = true;
  const st = document.createElement('style');
  st.dataset.from = 'objects';
  st.textContent = CSS;
  document.head.append(st);
}
