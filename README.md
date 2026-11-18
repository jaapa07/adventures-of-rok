# Adventures of ROK

Jogo de plataforma 2.5D com visual pré-renderizado em 3D, feito 100% em DOM + CSS 3D (sem `<canvas>` no jogo).
A dupla **Tamá** (tamanduá-bandeira, forte) e **Lili** (mico-leão-dourado, ágil) atravessa a Ilha Sumaúma para recuperar a Semente-Mãe roubada pelo **Barão Javardo**.

## Rodar

```bash
npm install
```

```bash
npm run dev
```

Abra o endereço que o Vite mostrar (padrão `http://localhost:5173`). Os assets já estão gerados em `public/assets/`.

Atalhos de desenvolvimento: `?fase=1-1` vai direto para uma fase, `&debug` desenha a colisão, `?tela=map` abre uma tela pelo id.

## Regenerar a arte (opcional, demorado)

Toda a arte é gerada a partir de modelos 3D escritos em código (`tools/models`, `tools/scenery`, `tools/cine`) e renderizada offline num Chromium headless com Three.js — o jogo em si nunca usa WebGL.

```bash
npm run assets
```

```bash
npm run bake
```

`assets` renderiza sprites, cenários, UI e cinemáticas; `bake` compõe os pedaços de terreno de cada fase a partir dos tilemaps.

## Verificar

```bash
npm run check
```

Confere os critérios da seção 15.2 da especificação: sem canvas/WebGL no runtime, sem pendências no código, manifesto de assets, animações dos heróis, regras de cada fase (incluindo uma simulação de alcance de pulo até a saída), armas, gags, telas e sistemas incrementais, áudio, `tsc`, `vite build`, capturas de tela em `verify-shots/` e FPS.

## Controles

| Ação | Teclado | Gamepad |
|---|---|---|
| Mover | ← → / A D | Direcional |
| Pular (segure para planar com a Lili) | Espaço / K | A |
| Correr / especial / pegar / golpear | Shift / J | X |
| Arremessar arma | ↑ + J, → + J, ↓ + J | direção + X |
| Trocar parceiro (segure para arremessá-lo) | E / L | Y |
| Largar arma | C | B |
| Bolso Fundo | Q | LB |
| Pausa | Esc / P | Start |

## Estrutura

- `src/core` — loop de 60 Hz, entrada, save, assets, eventos
- `src/render` — palco CSS 3D, sprites, chunks, efeitos, escuridão
- `src/game` — física, heróis, entidades (inimigos, objetos, armas, montarias, chefes, gags), progressão
- `src/data` — fases, músicas, efeitos sonoros, desafios, álbum, brinde
- `src/ui` — HUD e telas
- `src/audio` — sintetizadores, sequenciador e mixer (Web Audio)
- `tools` — pipeline de pré-renderização, bake e verificação
- `docs` — contratos de modelos, fases, motor e gags
