# GAME_SPEC_PLATAFORMA.md: SELVA SUMAÚMA (Plataforma 2.5D com visual pré-renderizado)

> **Para a IA que vai ler este arquivo:** este documento é a especificação **completa e obrigatória** de um jogo.
> Construa o projeto **inteiro, do zero, em uma única execução**, seguindo cada seção na ordem da seção 15.
> Nada aqui é sugestão. Tudo o que está listado deve existir no projeto final, funcionando e com arte final.
> Leia o arquivo inteiro antes de escrever a primeira linha de código.

---

## 0. Origem e limites de propriedade intelectual

Este jogo foi especificado a partir da **análise de um vídeo de gameplay de um plataforma 2D clássico de 16 bits, com sprites pré-renderizados em 3D**. Do vídeo foram extraídos **apenas padrões de gênero e de técnica visual**.

**Regras absolutas de originalidade:**

- É **proibido** usar qualquer nome, personagem, inimigo, item, fase, logo, música, som ou visual de jogos existentes. Isso inclui gorilas de gravata, macacos de boné vermelho, barris com letras, crocodilos-soldados, bananas como coletável principal, letras K-O-N-G, pneus-mola e peixe-espada montável.
- Todos os personagens, inimigos, objetos, fases, marcas e áudio são **autorais e definidos neste documento**.
- Na dúvida entre "parecido com o jogo X" e "original", escolha sempre o original.

### O que foi observado no vídeo (referência de gênero, não de conteúdo)

| Observado no vídeo | Como entra no SELVA SUMAÚMA |
|---|---|
| Sprites com aparência de modelos 3D renderizados (volume, luz, sombra própria) | **Pipeline de pré-renderização 3D** que gera spritesheets (seção 3) |
| Dupla de heróis: um pesado e um ágil, alternáveis, e o parceiro segue atrás | Dupla Tamá e Lili com troca em tempo real (seção 5.2) |
| Caverna escura com estalactites e colunas âmbar em várias camadas de profundidade | Fase "Gruta das Lamparinas" com 5 camadas de parallax |
| Sala bônus roxa, com coletáveis em padrões desenhados e cronômetro | Salas bônus "Câmara de Cristal" (seção 8.4) |
| Objetos arremessáveis que rolam pelo chão e destroem inimigos | Cabaças roláveis (seção 6) |
| Objetos-mola no chão para pular mais alto | Bromélias-mola |
| Recipiente que liberta o parceiro perdido | Ninho do Reencontro |
| Letras espalhadas pela fase (vida extra ao completar) | Letras **C-I-P-Ó** |
| Inimigos voadores com padrão de patrulha; cobras e lagartos no chão | Bestiário autoral (seção 7) |
| Mapa-múndi pré-renderizado com o nome da fase surgindo no topo | Mapa da Ilha Sumaúma (seção 10) |
| Fase subaquática com corais em camadas, raios de luz, bolhas e montaria aquática | Fase "Recife das Bromélias" + montaria Pirarucu |
| Contador de coletáveis no canto superior, que só aparece ao coletar | HUD que surge e some sozinho (seção 9) |
| Placa de saída no fim da fase e dança de vitória | Totem de Saída + animação de vitória |

---

## 1. Visão do jogo

**SELVA SUMAÚMA** é um jogo de plataforma de ação com rolagem lateral, visual **"praticamente 3D"**: personagens, inimigos e cenários são **modelos 3D autorais renderizados offline** em spritesheets, como nos clássicos pré-renderizados. Em tempo de execução, o jogo usa **profundidade real com CSS 3D** (camadas de parallax em `translateZ`, câmera com leve inclinação e zoom).

- **História:** o **Barão Javardo**, um javali industrial, invade a Ilha Sumaúma com suas máquinas de desmatar e rouba a **Semente-Mãe** da árvore gigante. A dupla **Tamá** (tamanduá-bandeira, forte) e **Lili** (mico-leão-dourado, ágil) atravessa a ilha para recuperá-la.
- **Tom:** aventura tropical, com atmosfera densa e momentos sombrios (cavernas, fábrica), humor físico nas animações.
- **Sessão:** cada fase dura de 3 a 6 minutos. O jogo completo leva de 1,5 a 2 horas.
- **Plataforma:** navegador desktop (teclado e gamepad).
- **Resolução lógica:** 1280×720, escalada para preencher a tela em 16:9, com letterbox decorado.

---

## 2. Stack e regras técnicas (obrigatórias)

### 2.1 Proibido no jogo (runtime)

- ❌ `<canvas>` em **qualquer** forma (2D, WebGL, OffscreenCanvas), inclusive para leitura de pixels ou colisão.
- ❌ Three.js, Babylon, PixiJS, Phaser ou qualquer engine dentro de `src/`.
- ❌ Formas simples como sprite provisório (retângulos, círculos lisos, emojis, texto no lugar de arte).
- ❌ Placeholders, `TODO`, `FIXME`, `lorem ipsum`, funções vazias, telas "em construção".
- ❌ Geração procedural de **conteúdo**: fases, inimigos, posição de coletáveis, segredos e layout são **dados escritos à mão**.
- ❌ Assets baixados da internet ou de bancos de imagem.

### 2.2 Permitido / obrigatório

- ✅ **Vite + TypeScript (strict)**, DOM puro com pequenos componentes próprios.
- ✅ Renderização **100% DOM**: `div`, `img`, `svg` inline, **CSS 3D transforms** (`perspective`, `preserve-3d`, `translateZ`), CSS animations, Web Animations API, `mask-image` e filtros CSS/SVG.
- ✅ **Ferramenta de build offline** (`tools/`, fora de `src/`): **pode** usar Three.js dentro do Chromium headless do Playwright (já instalado: `require('playwright')`, `chromium.launch()`) **somente para pré-renderizar** os modelos 3D autorais em PNG/WebP. O navegador do jogador **nunca** executa WebGL nem canvas. É exatamente a técnica dos clássicos pré-renderizados.
- ✅ Áudio via **Web Audio API**: músicas **compostas nota por nota** em arquivos de dados e SFX como **presets autorais** (envelopes, osciladores, filtros e ruído com parâmetros escritos à mão).
- ✅ `Math.random` só é permitido em pequenas variações de partículas (±10%) e na escolha de falas/grunhidos. **Nunca** para gerar fase, layout ou arte.
- ✅ Loop de jogo com **timestep fixo de 60 Hz** e interpolação na renderização.

### 2.3 Estrutura de pastas obrigatória

```
selva-sumauma/
├─ index.html
├─ package.json             # scripts: dev, build, assets, bake, preview, check
├─ tsconfig.json
├─ vite.config.ts
├─ tools/                   # PIPELINE OFFLINE (roda no build, nunca no jogo)
│  ├─ render/
│  │  ├─ stage.html         # cena Three.js de render (luz, câmera, material)
│  │  ├─ materials.ts       # materiais autorais (pelo, pedra, folha, metal, água)
│  │  └─ rig.ts             # esqueleto e interpolação de keyframes
│  ├─ models/               # MODELOS 3D AUTORAIS EM CÓDIGO (um arquivo por modelo)
│  │  ├─ heroes/ tama.ts, lili.ts
│  │  ├─ mounts/ pirarucu.ts, ema.ts, tatu.ts
│  │  ├─ enemies/ *.ts
│  │  ├─ props/ *.ts
│  │  └─ scenery/<mundo>/*.ts   # peças de cenário e terreno
│  ├─ anims/                # KEYFRAMES AUTORAIS por personagem e ação
│  ├─ render-sprites.ts     # gera spritesheets de cada modelo × animação
│  ├─ render-scenery.ts     # gera tiles de terreno e camadas de parallax
│  ├─ bake-levels.ts        # compõe chunks de fase (512×512) a partir dos tiles
│  └─ verify.ts             # checagem final (seção 15.2)
├─ assets-src/ui/           # UI, HUD, fonte e logo em SVG autoral
├─ public/assets/           # SAÍDA gerada (não editar à mão)
└─ src/
   ├─ main.ts
   ├─ core/      (loop, input, timing, save, events, assetLoader)
   ├─ render/   (stage3d, camera, layers, spritePlayer, chunks, fxPool, lighting, shake)
   ├─ game/      (player, duo, physics, collision, enemies/*, objects/*, mounts/*, bosses/*)
   ├─ data/      (levels/*.ts, world.ts, enemies.ts, spriteAtlas.json, music/*.ts, sfx.ts)
   ├─ audio/     (mixer, synth, sequencer, instruments, reverb)
   ├─ ui/        (screens/*, hud/*, components/*)
   └─ styles/    (tokens.css, hud.css, screens.css, fx.css)
```

---

## 3. Pipeline "praticamente 3D" (o coração visual)

### 3.1 Modelagem autoral em código

Cada modelo em `tools/models/` é **construído à mão** com geometria do Three.js. Não vale caixa ou esfera crua como resultado final:

- **Formas orgânicas** com `LatheGeometry` (troncos, focinhos, cabaças), `ExtrudeGeometry` com curvas bezier (orelhas, folhas, nadadeiras) e `TubeGeometry` (caudas, cipós, rabos). Esferas e cápsulas são **deformadas vértice a vértice** com funções de escultura autorais (`bulge`, `pinch`, `taper`).
- **Detalhe mínimo por herói:** ≥ 30 peças hierárquicas (cabeça, focinho, olhos com íris e brilho, sobrancelhas, orelhas, tronco, braços e antebraços, mãos com dedos, pernas, pés, cauda segmentada, acessórios).
- **Materiais autorais** (`materials.ts`): pelo com textura de mechas desenhada em SVG e aplicada como mapa, pedra com mapa de rugosidade desenhado, folhas com translucidez, metal enferrujado e olhos com reflexo especular.
- **Esqueleto simples** (`rig.ts`): ossos com rotações por keyframe e easing; a malha segue os ossos por hierarquia de grupos.

### 3.2 Animações (keyframes escritos à mão em `tools/anims/`)

Renderizadas a **24 fps**, reproduzidas no jogo a 24 fps com timing independente do loop.

| Personagem | Animações obrigatórias (frames) |
|---|---|
| Tamá e Lili | parado (24, com respiração), tédio (36), andar (16), correr (12), pular subida (6), ápice (4), queda (6), aterrissar (5), rolar/girar (12), ataque especial (16), pegar objeto (6), carregar e andar (16), arremessar (8), escalar cipó (12), pendurar parado (12), nadar (16), dano (10), morte (24), vitória (36), troca de parceiro (12), seguir parceiro (usa andar e correr), montar (8) |
| Cada montaria | parado, andar/nadar, ataque, pulo, dano, desmontar |
| Cada inimigo | parado/patrulha, ataque, dano, morte (no mínimo 4 animações) |
| Cada chefe | entrada, 3 ataques, vulnerável, dano, fúria, derrota |

### 3.3 Configuração de render (`stage.html`)

- Câmera **ortográfica lateral** com inclinação de 8° para baixo e 12° de guinada, para mostrar volume (nunca chapada de perfil).
- Iluminação de 3 pontos: luz principal quente vinda de cima e da esquerda, preenchimento frio e **luz de contorno (rim light)** forte, que é o segredo do visual pré-renderizado.
- Sombreamento suave, oclusão ambiente simulada por gradiente nos materiais e **sombra de contato** renderizada num passe separado (PNG à parte, colocado no chão em tempo de execução).
- **Variação de iluminação por mundo:** cada mundo tem um preset de luz (selva ensolarada, caverna âmbar, recife azul, fábrica vermelha). Os sprites dos heróis são renderizados **uma vez por preset**, para combinar com o ambiente.
- Saída em PNG com alfa, pós-processada para WebP. Personagens a 2× (heróis com ~192 px de altura renderizados a 384 px), exibidos a 1×.
- `render-sprites.ts` gera **spritesheets + atlas JSON** (`frame`, `pivot`, `hitbox` e `hurtbox` por frame).

### 3.4 Cenário

- **Terreno:** peças modulares 3D autorais por mundo (chão plano, borda esquerda/direita, rampas de 30° e 45°, plataforma suspensa, parede, teto, coluna) renderizadas em tiles de 64×64 px com sobreposição decorativa.
- **Parallax:** cada fase tem **5 camadas** renderizadas como cenas 3D autorais completas (céu/fundo, distante, médio, perto, primeiro plano escuro na frente do jogador).
- `bake-levels.ts` lê os tilemaps das fases e **compõe chunks de 512×512** (um screenshot do Playwright por chunk em página HTML), evitando milhares de nós DOM.

---

## 4. Renderização no jogo (DOM + CSS 3D)

- `#stage` (1280×720, `perspective: 1200px`) contém as camadas com `transform-style: preserve-3d`, posicionadas em profundidades reais:
  - camada 1 `translateZ(-2400px)`, camada 2 `-1400px`, camada 3 `-600px`, **camada de jogo `0`**, primeiro plano `+300px`.
  - A escala compensatória de cada camada (`scale(1 + -z/perspective)`) é calculada uma vez. **O parallax surge da própria perspectiva**, não de multiplicadores falsos.
- **Câmera:** segue o herói com zona morta (160×90 px), antecipação na direção do movimento (até 120 px) e suavização de 0,1. Em momentos especiais (chefes, carrinho de mina, lançamento de flor-catapulta) faz **zoom e inclinação** de ±4° em `rotateY`/`rotateX` sobre o palco, revelando a profundidade das camadas.
- **Sprites:** `div` com `background-image` do spritesheet e `background-position` por frame, virados com `scaleX(-1)`. Squash e stretch são aplicados por cima via `transform` em pulos e aterrissagens.
- **Chunks:** só os chunks visíveis + 1 de margem ficam no DOM (pool reutilizável).
- **Iluminação dinâmica em CSS:**
  - Cavernas escuras: overlay escuro com `mask-image: radial-gradient(...)` centrado nas fontes de luz (herói carregando lamparina, vaga-lumes, cristais), com pulsação suave.
  - Raios de luz subaquáticos e de mata: sprites autorais com `mix-blend-mode: screen` animados.
  - Água: superfície com frames autorais de ondas + `filter: url(#ripple)` (SVG `feDisplacementMap`) aplicado só à camada de reflexo.
- **Orçamento:** ≤ 700 nós DOM ativos, 60 fps estáveis, animando apenas `transform`, `opacity` e `background-position`.
- **Qualidade (opções):** Alta/Média. A Média remove a camada 2 de parallax, reduz as partículas pela metade e desliga o displacement da água.

---

## 5. Gameplay

### 5.1 Física (sensação firme e pesada, típica do gênero)

- Gravidade de 2.400 px/s², velocidade de queda máxima de 900 px/s.
- **Pulo variável:** soltar o botão corta a subida (multiplica a velocidade vertical por 0,45).
- **Coyote time** de 6 frames, **buffer de pulo** de 6 frames.
- Correr segurando o botão de ação: aceleração de 0 a 100% em 0,35 s.
- Colisão por **tilemap autoral** (sólido, plataforma atravessável por baixo, rampa 30°/45°, espinhos, água, cipó, vazio) + caixas por frame do atlas.

### 5.2 A dupla (mecânica central)

| | **Tamá** (tamanduá-bandeira) | **Lili** (mico-leão-dourado) |
|---|---|---|
| Estilo | Forte, pesado | Rápida, alto pulo |
| Velocidade | 100% | 115% |
| Pulo | 100% | 120% |
| Especial | **Tromba-giro**: rolamento que derruba inimigos em sequência | **Cambalhota**: giro aéreo com mais alcance e planada curta com a cauda |
| Exclusivo | Derrota inimigos pesados pulando em cima; **Batida no chão** (parado + baixo) revela segredos | Carrega objetos acima da cabeça e arremessa mais longe; passa por frestas baixas |

- O parceiro **segue o líder** replicando o rastro do líder com 18 frames de atraso, por uma fila de posições.
- **Troca instantânea** (botão de troca): os dois trocam de lugar com uma animação de "toca aqui".
- **Dano:** o líder atingido **foge para fora da tela** e o outro assume. Com um herói só, levar dano = perder vida.
- **Ninho do Reencontro:** quebrá-lo devolve o parceiro perdido.
- **Arremesso de parceiro:** segurando o botão de arremesso, o líder lança o parceiro para cima, para alcançar plataformas e coletáveis altos.

### 5.3 Vidas e checkpoints

- Vidas iniciais: 5. **100 Castanhas-douradas = 1 vida.** Completar as letras **C-I-P-Ó** = 1 vida. Balões-tucano raros = 1, 2 ou 3 vidas.
- **Totem de Cipó** no meio de cada fase: ao ser tocado, acende com fagulhas e passa a ser o ponto de retorno.
- **Game Over:** volta ao mapa com o save do último totem do mundo.

---

## 6. Objetos interativos (autorais)

| Objeto | Comportamento |
|---|---|
| **Cabaça Rolante** | Pegar, carregar e arremessar. Rola pelo chão destruindo inimigos e quebra em muros, às vezes revelando segredos |
| **Cabaça de Pedra** | Mais pesada, quebra paredes rachadas e afunda na água |
| **Bromélia-mola** | Mola de chão. Pulo alto, ou altíssimo se pressionar pulo no impacto. Pode ser carregada |
| **Flor-catapulta** | Planta carnívora gigante que engole o herói e o dispara numa direção fixa ou rotativa (sequências aéreas encadeadas) |
| **Cipó** | Pendurar, subir/descer e balançar com impulso |
| **Ninho do Reencontro** | Liberta o parceiro perdido |
| **Totem de Cipó** | Checkpoint |
| **Totem de Saída** | Fim da fase: girar o totem mostra um prêmio sorteado da **tabela autoral** da fase |
| **Caixa da Montaria** | Caixote de madeira com o rosto da montaria entalhado. Quebrar libera a montaria |
| **Plataforma de Tronco** | Flutua no rio e afunda com peso; algumas seguem trilhos |
| **Carrinho de Mina** | Mundo 2: corrida sobre trilhos com saltos (fase própria) |
| **Lamparina** | Mundo 2: ilumina a caverna escura por 20 s; reacendível em fogueiras |
| **Parede Rachada** | Esconde salas bônus (Batida no chão ou Cabaça de Pedra) |

**Coletáveis:** Castanhas-douradas (em **trilhas desenhadas à mão** que guiam o caminho e sugerem segredos), cachos de 10, letras C-I-P-Ó, **Moeda-Folha** (uma por fase, bem escondida, para contar 100%) e **Fichas de Montaria** (3 = sala bônus da montaria).

---

## 7. Bestiário (todo autoral)

### 7.1 Inimigos comuns (mínimo 12)

| ID | Nome | Mundo | Comportamento |
|---|---|---|---|
| `javalin` | **Javalim** | Todos | Soldado javali que patrulha e dá meia-volta nas bordas |
| `javalin-escudo` | **Javalim Escudeiro** | 1, 3 | Escudo de lata na frente: só cai com pulo em cima ou arremesso por trás |
| `javalao` | **Javalão** | 2, 3 | Grande; só a Tamá derruba pulando, a Lili quica |
| `serrote` | **Serrote** | 1 | Drone-motosserra que voa em senoide; não pode ser pisado |
| `marimbondo` | **Marimbondo-de-Lata** | 1, 2 | Voador mecânico com rota autoral (círculo, vaivém ou 8) |
| `cascavel` | **Cascavel Mola** | 1, 2 | Cobra que se enrola e pula em arco |
| `lagarto` | **Teiú Atropelador** | 2 | Corre e acelera na direção do herói |
| `morcego` | **Morcego-Lanterna** | 2 | Mergulha quando o herói passa embaixo; apaga luzes |
| `piranha` | **Piranha-Boia** | 3 | Nada em padrão autoral e persegue de perto |
| `caranguejo` | **Caranguejo-Alicate** | 3 | Anda de lado e prende por um instante |
| `agua-viva` | **Água-Viva-Néon** | 3 | Flutua em linha vertical; intocável sem montaria |
| `baiacu` | **Baiacu-Bomba** | 3 | Infla, vira espinhos e desinfla em ciclo |
| `lagarta-trator` | **Lagarta-Trator** | 4 | Máquina que avança derrubando árvores e só para com 3 cabaças |

### 7.2 Montarias (autorais)

| Montaria | Onde | Habilidade |
|---|---|---|
| **Pirarucu** | Água | Investida (dash) que derrota quase qualquer inimigo aquático e abre paredes de coral rachado |
| **Ema** | Terra | Corrida rápida, pulo duplo e chute para trás |
| **Tatu-Canastra** | Cavernas | Rola como bola e cava em terra mole |

### 7.3 Chefes (um por mundo, cada um com arena autoral e 3 fases de padrão)

1. **Major Motosserra** (javali com armadura de serra), Mundo 1: investidas e serras arremessadas; fica vulnerável ao prender a serra na árvore.
2. **Rainha Morcega-Lâmpada**, Mundo 2: apaga a arena e só se vê pelas luzes dela; derrota com cabaças acesas.
3. **Polvo-Draga**, Mundo 3: draga mecânica subaquática; o Pirarucu abre as válvulas.
4. **Barão Javardo** (chefe final), Mundo 4: robô-escavadeira gigante em 3 estágios. A câmera inclina em CSS 3D e a fábrica desmonta ao fundo.

---

## 8. Mundos e fases (todas desenhadas à mão)

### 8.1 Formato de cada fase (`src/data/levels/<id>.ts`, escrito à mão)

- `tilemap`: grade de caracteres (uma string por linha), legível e editável, com legenda de tiles por mundo. **Largura mínima de 220 colunas** (fases verticais: 60×180).
- `entities`: lista com tipo, posição, direção e parâmetros (rota de patrulha, frequência etc.) de **cada** inimigo, objeto e coletável.
- `coins`: trilhas de castanhas como polilinhas autorais.
- `secrets`: salas bônus (entrada, tipo, prêmio), Moeda-Folha e letras C-I-P-Ó (sempre as 4).
- `parallax`: IDs das 5 camadas, `lighting` (preset), `music`, `ambience`, `cameraZones` (zoom/inclinação por região).

### 8.2 Ilha Sumaúma: 4 mundos, 14 fases + 4 chefes

| Mundo | Tema | Fases |
|---|---|---|
| **1. Mata Alta** | Selva ensolarada e copas de árvores | 1-1 Trilha da Sumaúma · 1-2 Copas e Cipós · 1-3 Serraria Clandestina · 1-4 Rio das Toras · **Chefe: Major Motosserra** |
| **2. Grutas Âmbar** | Cavernas com estalactites douradas e colunas | 2-1 Gruta das Lamparinas (escura) · 2-2 Trilhos da Mina (carrinho) · 2-3 Ninho dos Morcegos · **Chefe: Rainha Morcega-Lâmpada** |
| **3. Recife Bromélia** | Mar, corais, naufrágio | 3-1 Praia dos Caranguejos · 3-2 Recife das Bromélias (subaquática) · 3-3 Naufrágio Escuro · 3-4 Corrente das Águas-Vivas · **Chefe: Polvo-Draga** |
| **4. Fábrica Javarda** | Indústria que devora a selva, vermelho e ferrugem | 4-1 Esteiras · 4-2 Chaminés · 4-3 Lagarta-Trator (fase de perseguição) · **Chefe final: Barão Javardo** |

Cada fase precisa ter: **uma ideia de mecânica própria** (ex.: 1-4 com toras que afundam; 2-1 com a escuridão), **≥ 2 salas bônus**, as **4 letras C-I-P-Ó**, **1 Moeda-Folha**, **1 Totem de Cipó** e uma sequência final de clímax antes do Totem de Saída.

### 8.3 Fases subaquáticas

Física própria: pulo vira braçada, há empuxo e deriva lenta, bolhas saem do focinho e das braçadas, raios de luz e partículas em suspensão. A música fica mais etérea e com filtro passa-baixa.

### 8.4 Salas bônus "Câmara de Cristal"

Fundo roxo de cristal pré-renderizado e 4 tipos: **coletar tudo** antes do cronômetro, **achar o objeto certo** entre cabaças embaralhadas, **sequência de Flores-catapulta** e **chuva de castanhas**. Prêmios definidos à mão por sala.

---

## 9. HUD (aparece e some, minimalista)

- **Castanhas:** ícone 3D girando (8 frames) + contador com a fonte autoral, no canto superior esquerdo. Entra deslizando ao coletar e some após 2 s parado.
- **Letras C-I-P-Ó:** surgem no topo centro ao coletar uma, com a letra brilhando; ao completar, explodem em fagulhas e mostram "+1 VIDA".
- **Vidas:** canto superior direito, só ao ganhar ou perder uma (balão-tucano com o número).
- **Retrato do herói ativo:** aparece por 1,5 s na troca de parceiro.
- **Cronômetro** só nas salas bônus.
- Nenhuma barra fixa na tela durante a exploração: a tela fica livre para a arte.

---

## 10. Telas e fluxo (todas completas, com arte e animação)

1. **Splash:** "Estúdio Sumaúma" (fictício) com a logo de folha brotando, 2 s.
2. **Abertura (cinemática):** 6 cenas pré-renderizadas com legenda. Os heróis dormem na árvore, as máquinas chegam, a Semente-Mãe é roubada e os heróis partem. Pode ser pulada.
3. **Tela título:** logo SELVA SUMAÚMA em camadas 3D (CSS `translateZ`) que se inclinam com o mouse, selva em parallax ao fundo e "Pressione ENTER/START".
4. **Seleção de save:** 3 slots com % de conclusão, vidas e tempo.
5. **Mapa da Ilha:** pré-renderizado e em perspectiva (CSS 3D com leve rotação), com caminhos que se desenham ao liberar fases, os heróis andando pelo mapa e o nome da fase surgindo no topo. Ícones de fase mostram a Moeda-Folha conquistada e as letras completas. Inclui pontos especiais:
   - **Barraca do Vô Bugio** (dicas autorais sobre segredos);
   - **Voo do Tucano** (viagem rápida entre mundos liberados);
   - **Save do Bem-te-vi** (salvar o jogo).
6. **Fase:** cartão de entrada com o nome → jogo → Totem de Saída → **dança de vitória** da dupla.
7. **Pausa:** desfoque da cena (`backdrop-filter`) e as opções Continuar, Opções, Sair para o mapa.
8. **Opções:** volume de música/SFX/ambiente, qualidade, remapeamento de teclado, tremor de tela on/off e "assistência" (mais 2 vidas por Game Over).
9. **Game Over:** a dupla sentada, triste, num tronco, com chuva caindo; "Tentar de novo / Mapa".
10. **Final:** cinemática de 8 cenas (a Semente-Mãe replantada, a selva renascendo), créditos com ilustrações e uma cena extra se o jogador tiver 100%.

**Save** em `localStorage` (try/catch, com fallback em memória): fases concluídas, segredos, vidas, castanhas, opções e tempo de jogo.

---

## 11. Efeitos visuais (todos com frames pré-renderizados ou SVG autoral)

| Efeito | Frames |
|---|---|
| Poeira de corrida, pulo e aterrissagem | 6 cada |
| Faíscas de impacto (pisão no inimigo) | 6 |
| "Estrelas" de nocaute girando | 8 (loop) |
| Fumaça de inimigo derrotado + pedaços de lata voando | 10 |
| Lascas de cabaça quebrando | 8 |
| Respingo de água (entrar e sair) | 8 |
| Bolhas (pequena, média, grande) | 4 cada |
| Brilho de coleta de castanha | 6 |
| Explosão de letra C-I-P-Ó | 10 |
| Folhas caindo (camada de ambiente) | 6 tipos × 8 frames |
| Vaga-lumes | 4 (loop) |
| Gotas de caverna | 5 |
| Raios de luz (mata e mar) | 3 variações animadas |
| Fagulhas do Totem de Cipó | 8 |
| Rastro de velocidade da Ema e do Pirarucu | 6 |
| Explosão do chefe | 16 + flash de tela |

**Sensação de impacto:**
- **Hit-stop** de 60 ms ao derrotar um inimigo e de 120 ms ao levar dano.
- **Screen shake** com amplitude e decaimento por evento: pisão do Javalão 4 px, Batida no chão 8 px, ataque de chefe 14 px.
- **Flash branco** no sprite atingido (via `filter: brightness(3)` por 2 frames).
- **Combo:** cada inimigo derrotado em sequência sem tocar o chão sobe o tom do SFX.

---

## 12. Áudio

### 12.1 Música (composta em dados, `src/data/music/*.ts`)

Cada faixa traz andamento, tonalidade, seções e as partes **escritas nota por nota**: bateria, baixo, harmonia, melodia e contracanto. Inclui loop sem emenda, **mínimo de 48 compassos únicos** por faixa de fase e **reverb por convolução** com preset por mundo.

| Faixa | Clima |
|---|---|
| Título | Tema heroico com berimbau e cordas sintetizadas |
| Mapa | Tema calmo, flauta de bambu sintetizada |
| Mata Alta | Groove de percussão tribal com marimba |
| Grutas Âmbar | **Ambiente atmosférico**: pads longos, gotejar rítmico, baixo profundo |
| Recife Bromélia | **Ambiente aquático etéreo**: arpejos lentos com eco e pads brilhantes |
| Fábrica Javarda | Industrial: percussão metálica, baixo distorcido |
| Chefe | Tensão com ostinato rápido |
| Chefe final | Versão épica do tema título |
| Sala bônus | Jingle rápido e brincalhão |
| Vitória (fim de fase), Game Over, Final e Créditos | Jingles e faixa longa |

### 12.2 SFX (presets autorais em `src/data/sfx.ts`; mínimo 50)

Passos por superfície (terra, pedra, madeira, metal), pulo e aterrissagem de cada herói, rolamento, cambalhota, troca de parceiro, grunhidos e vozes dos heróis (balbucios sintetizados), pisão, derrota de cada inimigo, cabaça (pegar, arremessar, rolar, quebrar), bromélia-mola, flor-catapulta (sugar e disparar), castanha, cacho, letras, vida extra, totem, ninho, montar/desmontar, cada montaria, água (entrar, sair, braçada, bolha), ambiente de cada mundo, cada chefe e UI (navegar, confirmar, voltar, pausa).

**Mixer:** canais de música, SFX e ambiente, compressor master, ducking da música ao ganhar vida, filtro passa-baixa automático quando submerso.

---

## 13. Controles

| Ação | Teclado | Gamepad |
|---|---|---|
| Mover | `←` `→` / `A` `D` | Direcional / analógico |
| Olhar e abaixar | `↑` `↓` / `W` `S` | Direcional / analógico |
| Pular | `Espaço` / `K` | A |
| Correr / Especial / Pegar | `Shift` / `J` | X |
| Usar arma de mão (golpe) | `J` com arma na mão | X com arma na mão |
| Arremessar arma de mão | `↑` + `J` (para cima) · `→` + `J` (para frente) · `↓` + `J` (soltar no chão) | direção + X |
| Largar arma | `C` | B |
| Trocar parceiro | `E` / `L` | Y |
| Arremessar parceiro | segurar `E` | segurar Y |
| Pausa | `Esc` / `P` | Start |

Gamepad via Gamepad API, com prompts na UI trocando para o último dispositivo usado.

---

## 14. Identidade visual da UI

- **Paleta (tokens em `src/styles/tokens.css`):**

| Token | Hex | Uso |
|---|---|---|
| `--ouro` | `#F2B530` | Coletáveis, destaques |
| `--folha` | `#2E8B3E` | Selva, confirmação |
| `--musgo` | `#1E4D2B` | Fundos de painel |
| `--ambar` | `#D9822B` | Cavernas, botões |
| `--recife` | `#1E5BA8` | Água |
| `--cristal` | `#9B4DDB` | Salas bônus |
| `--ferrugem` | `#A8382B` | Inimigos, perigo, Mundo 4 |
| `--casca` | `#5A3A22` | Molduras de madeira |
| `--noite` | `#120E18` | Contornos e sombras |
| `--creme` | `#FFF4DC` | Textos |

- **Fonte autoral** "Sumaúma Entalhada", desenhada em SVG (A–Z, 0–9, pontuação), imitando letras entalhadas em madeira com volume, usada em títulos, contadores e nomes de fase.
- Painéis com moldura de madeira e cipós desenhada em SVG autoral (9-slice via `border-image`).
- Botões com estados normal, foco, pressionado e desabilitado, com animação de folha balançando no foco.

---

## 15. Ordem de execução e critérios de aceite

### 15.1 Ordem obrigatória de construção

1. Estrutura do projeto, tokens CSS e loop.
2. Pipeline de render (`tools/render`), mais a validação com 1 modelo de teste **que depois vira o modelo final da Tamá** (nunca deixar o modelo de teste no jogo).
3. **Todos os modelos e animações** (heróis, montarias, inimigos, chefes, objetos, cenário dos 4 mundos) + `npm run assets` gerando spritesheets e atlas.
4. Renderizador DOM/CSS 3D (palco, camadas, câmera, chunks, sprites).
5. Física, dupla, colisão por tilemap.
6. Objetos, **armas de mão (seção 17)**, inimigos, montarias, chefes.
7. **As 14 fases + 4 arenas de chefe** escritas à mão, com **todas as situações da seção 18** posicionadas, + `npm run bake` gerando os chunks.
8. HUD, mapa da ilha, **sistemas incrementais (seção 19)**, telas, cinemáticas, save e opções.
9. Áudio completo.
10. Polimento: efeitos, hit-stop, shake, transições e balanceamento de dificuldade.
11. Verificação (15.2) e correção de tudo que falhar.

### 15.2 `npm run check` (`tools/verify.ts`) deve passar com zero erros

- [ ] Nenhuma ocorrência de `<canvas`, `getContext`, `WebGL`, `three`, `pixi`, `phaser` em `src/` e `index.html` (Three.js só em `tools/`).
- [ ] Nenhuma ocorrência de `TODO`, `FIXME`, `placeholder`, `lorem` no projeto.
- [ ] Cada entrada de `src/data/assetManifest.ts` existe em `public/assets` com tamanho > 2 KB.
- [ ] Cada herói tem todas as animações da tabela 3.2; cada modelo de herói tem ≥ 30 peças.
- [ ] As 14 fases têm ≥ 220 colunas (ou 180 linhas nas verticais), as 4 letras C-I-P-Ó, 1 Moeda-Folha, ≥ 2 salas bônus, 1 Totem de Cipó e ≥ 15 inimigos posicionados à mão.
- [ ] Todas as fases são completáveis: um **teste automatizado de alcançabilidade** simula o alcance de pulo da Lili sobre o tilemap e confirma que existe caminho do início ao Totem de Saída.
- [ ] As 14 armas de mão da seção 17 existem com sprites em mundo, sprites "na mão" de cada herói, ícone de HUD e SFX próprios; cada fase posiciona ≥ 3 armas de mão.
- [ ] Todas as situações da seção 18 estão implementadas e posicionadas nas fases indicadas (o verify confere os IDs `gag_*` nos dados das fases).
- [ ] Os sistemas incrementais da seção 19 funcionam e persistem no save: Oficina, Viveiro, Álbum, Medalhas, Desafios e Brinde do Bem-te-vi.
- [ ] ≥ 12 faixas de música e ≥ 50 SFX definidos e referenciados.
- [ ] `tsc --noEmit` sem erros; `vite build` sem warnings.
- [ ] **Teste visual com Playwright:** abrir o jogo e tirar screenshots de título, mapa, uma fase de cada mundo, fase subaquática, caverna escura com luz, sala bônus, troca de parceiro, montaria, cada chefe, Game Over e final. **Analise cada screenshot:** se algo estiver quebrado, invisível, desalinhado, chapado ou parecer provisório, corrija e repita.
- [ ] Média de ≥ 55 fps medida por 10 s numa fase com parallax completo.

### 15.3 Definição de "pronto"

Um jogador consegue: abrir → ver a abertura → escolher um save → andar pelo mapa → jogar as 14 fases e vencer os 4 chefes com a dupla, as montarias, as salas bônus e os segredos → ver o final e os créditos → e o progresso fica salvo. Tudo isso com visual **pré-renderizado com volume e luz**, profundidade real em camadas, música, efeitos sonoros e **nenhum asset genérico, forma provisória ou tela vazia**.

---

## 16. Instruções finais para a IA

1. **Não pergunte, não resuma, não pare no meio.** Execute a seção 15.1 até o fim, **incluindo as seções 17, 18 e 19**, que fazem parte do escopo obrigatório.
2. Se um modelo é complexo, divida-o em arquivos de partes (cabeça, tronco, membros, acessórios), mas **modele todas**.
3. Antes de renderizar todas as animações, **renderize 1 frame de cada modelo e olhe a imagem**: o volume, a silhueta e a luz precisam estar convincentes. Se parecer bloco de primitivas, refine a escultura.
4. Prefira **profundidade a atalho**: uma fase bem desenhada vale mais que três fases vazias.
5. Ao final, entregue o comando para rodar (`npm install && npm run assets && npm run bake && npm run dev`), a lista de arquivos criados e as screenshots do teste visual.

---

## 17. Armas de mão: pegar coisas para derrubar adversários

> **Diferencial central em relação ao jogo do vídeo:** lá só se carrega um tipo de barril. Aqui o cenário é um **arsenal improvisado**. Cada objeto tem peso, golpe, arremesso e uma piada visual própria.

### 17.1 Regras gerais

- **Pegar:** encostar no objeto e apertar Pegar (`J`/X). Animação de 6 frames, diferente para objeto **leve** (uma mão) e **pesado** (duas mãos, acima da cabeça).
- **Golpe corpo a corpo** (`J` com a arma): 3 golpes em sequência (combo de 3 hits com timing de 18 frames); o 3º golpe empurra mais e dá hit-stop maior.
- **Arremesso direcional:** para frente (reto), para cima (arco) e para baixo (soltar ou fincar no chão).
- **Durabilidade em golpes** (número de usos) até a arma quebrar, com animação de quebra e lascas.
- **Peso afeta o herói:** com arma pesada, a velocidade cai 20% e o pulo 15%, e a Lili não consegue pegar armas pesadas sozinha.
- **Combo da dupla:** o parceiro que segue atrás **copia o golpe** 18 frames depois se estiver segurando outra arma, gerando "ecos" de ataque.
- **Inimigos também pegam armas:** os Javalins pegam armas soltas no chão e as usam contra o jogador. Desarmá-los (golpe nas costas) faz a arma voar e cair para o jogador.
- Cada arma tem: **sprite no mundo**, **sprite na mão de cada herói** (renderizado junto das animações de andar, pular e golpear, em camadas), **ícone de HUD** (aparece no canto inferior esquerdo enquanto a arma é segurada, com os usos restantes como pequenas marcas) e **SFX próprios** (pegar, golpe, acerto, arremesso, quebra).

### 17.2 Arsenal (14 armas, todas autorais)

| ID | Arma | Peso | Usos | Golpe | Arremesso | Piada / detalhe |
|---|---|---|---|---|---|---|
| `galho` | **Galho Torto** | Leve | 6 | Varrida em arco | Gira como bumerangue torto e volta | Às vezes fica preso numa árvore e cai um ninho de vespas |
| `coco` | **Coco Verde** | Leve | 1 | — | Quica 3 vezes, atordoa | Ao quebrar, sai água que molha o inimigo, que escorrega |
| `jaca` | **Jaca Madura** | Pesado | 2 | Pancada vertical | Esmaga e deixa uma poça grudenta no chão | Inimigos que pisam na poça ficam presos 2 s |
| `remo` | **Remo de Canoa** | Médio | 8 | Rebate projéteis de volta | Plana na água como prancha | Mundo 3: dá para surfar nele numa onda |
| `vassoura` | **Vassoura de Piaçava** | Médio | 10 | Varre inimigos pequenos para fora da plataforma | — | Levanta poeira que esconde o herói por 1 s |
| `panela` | **Panela de Barro** | Médio | 4 | "PÓÓIN!" que atordoa | Vira capacete se arremessada para cima e cair no herói | Com a panela na cabeça, o herói aguenta 1 golpe a mais |
| `lamparina` | **Lamparina Acesa** | Leve | 5 | Queima teias e assusta morcegos | Acende fogueiras à distância | Ilumina a caverna escura enquanto está na mão |
| `chave` | **Chave Inglesa Gigante** | Pesado | 6 | Desmonta inimigos mecânicos em 1 golpe | Gira e corta cordas | Peças dos robôs desmontados viram parafusos coletáveis (seção 19) |
| `peixe` | **Peixe Seco** | Leve | 3 | Tapa molhado "PLAFT" | — | Atrai a Piranha-Boia, que vira aliada por 5 s |
| `estilingue` | **Estilingue de Forquilha** | Leve | 12 tiros | — | Atira castanhas (gasta 1 castanha por tiro) | Acerta letras C-I-P-Ó distantes e interruptores |
| `cupinzeiro` | **Pedaço de Cupinzeiro** | Pesado | 1 | — | Explode em nuvem de cupins que persegue inimigos | Os cupins comem plataformas de madeira (abre atalhos) |
| `guarda-chuva` | **Guarda-chuva de Folha** | Leve | ∞ (quebra com 3 golpes recebidos) | Cutucada | — | Planar lentamente e bloquear projéteis de cima |
| `buzina` | **Buzina de Caminhão** | Médio | 4 | "FOOM!": onda de som em cone que empurra inimigos | — | Faz os Javalins pularem de susto e caírem de bunda |
| `capacete` | **Capacete de Javalim** | Leve | 2 | Cabeçada com corrida | — | Disfarce: inimigos ignoram o herói por 4 s (até ele atacar) |

### 17.3 Interações entre armas e cenário (escritas à mão, não sistêmicas aleatórias)

- Lamparina + teia = teia queima e revela passagem.
- Remo + correnteza = surfe.
- Jaca + Bromélia-mola = a jaca é lançada para cima e esmaga inimigos voadores.
- Coco + Flor-catapulta = a flor cospe o coco como canhão.
- Chave Inglesa + painel de máquina = desliga esteiras e serras na Fábrica.
- Peixe Seco + Pirarucu = o Pirarucu ganha 10 s de investida infinita.

---

## 18. Situações divertidas e momentos únicos

> Cada situação tem um ID `gag_*` registrado nos dados das fases. Nenhuma é aleatória: são **cenas roteirizadas à mão**, com animações e falas próprias. É isso que dá personalidade ao jogo e o diferencia do vídeo.

| ID | Fase | Situação |
|---|---|---|
| `gag_preguica` | 1-1 | Uma **preguiça gigante** dorme pendurada no caminho e serve de ponte. Se o herói fizer barulho (Buzina, Batida no chão), ela acorda e boceja. Na volta, segura o herói por 3 s num "abraço" antes de soltar (com castanhas caindo dos bolsos dela) |
| `gag_selfie` | 1-2 | Um Javalim tira selfie na beira do penhasco de costas para o herói. Um empurrão faz ele cair gritando, e o celular dele fica no chão com uma "foto" engraçada da dupla, que vai para o Álbum (seção 19) |
| `gag_serraria` | 1-3 | Esteira de toras: o herói pode **subir numa tora** que vai para a serra e pular no último segundo. A serra corta a tora em forma de escultura da Tamá |
| `gag_canoa` | 1-4 | Corrida de canoa contra 2 Javalins remando; dá para roubar o remo deles com um golpe |
| `gag_eco` | 2-1 | Num salão escuro, o herói grita (botão de troca segurado) e o **eco revela** a forma da caverna por 2 s com ondas de luz |
| `gag_morcego_dj` | 2-3 | Um morcego DJ com fones de ouvido toca na caverna. Os inimigos ficam dançando no ritmo da música e é preciso atacar no compasso. Atacar fora do ritmo os acorda |
| `gag_trilho_errado` | 2-2 | No carrinho de mina, uma placa troca o trilho errado. O carrinho vai para uma **sala de Javalins jogando dominó**, que viram a mesa e começam a perseguir o carrinho |
| `gag_caranguejo_baile` | 3-1 | Caranguejos fazem uma "fila de conga" na praia. Pular na fila inteira em sequência gera um combo de 10 e chove castanha |
| `gag_naufragio` | 3-3 | No navio afundado há um **baú que é um inimigo** (Baú-Boca) que persegue o herói pela sala. Dá para enganá-lo jogando o Peixe Seco |
| `gag_agua_viva_disco` | 3-4 | Corredor de Águas-Vivas-Néon piscando em ritmo, como pista de dança; o caminho seguro só aparece no compasso da música |
| `gag_cafe` | 4-1 | Uma sala de descanso dos Javalins: dá para **trocar o café da garrafa térmica por suco de jaca**, e eles saem correndo para o banheiro, abrindo o caminho |
| `gag_relogio_ponto` | 4-2 | Um relógio de ponto toca a sirene de "fim de expediente": os Javalins largam as armas e vão embora por 10 s, e o herói pode recolher o arsenal |
| `gag_lagarta` | 4-3 | Perseguição: a Lagarta-Trator persegue a dupla e destrói o cenário atrás dela. A câmera inclina em CSS 3D mostrando a máquina gigante na camada de trás chegando perto |
| `gag_barao_disfarce` | Chefe final | No início da luta final, o Barão aparece disfarçado de árvore (muito mal disfarçado: bigode aparecendo). Se o jogador o atacar antes de ele se revelar, ganha uma medalha secreta |
| `gag_parceiro_preso` | várias | Quando o parceiro é perdido, ele aparece **em segundo plano** (camada de parallax próxima) sendo levado por Javalins numa gaiola. Ele acena e faz caretas até o jogador quebrar o Ninho do Reencontro |
| `gag_tedio` | todas | Se o jogador ficar 15 s parado, a dupla faz animações de tédio **em conjunto**: jogam pedra-papel-tesoura, a Lili coloca uma folha no focinho da Tamá, ou a Tamá come formigas do chão e arrota |
| `gag_morte_comica` | todas | Cada tipo de morte tem uma animação própria: queimado (fica preto com olhos piscando), esmagado (vira "panqueca" e desdobra), afogado (bolhas saem formando um "S.O.S.") |

### 18.1 Outros diferenciais em relação ao vídeo

- **Clima dinâmico roteirizado:** em 1-2 começa a chover no meio da fase (definido à mão no tilemap por região). A chuva deixa plataformas escorregadias e faz poças onde a Jaca afunda.
- **Ciclo dia/noite por fase:** o Mundo 1 termina ao pôr do sol. As camadas de parallax trocam por versões renderizadas com outro preset de luz, com transição em CSS (cross-fade por região).
- **Rotas alternativas:** cada fase tem uma **rota alta** (Lili) e uma **rota baixa** (Tamá), com segredos diferentes, que se reencontram adiante.
- **NPCs da selva** que reagem à dupla: tucanos que comentam, quatis comerciantes e o Vô Bugio dando dicas engraçadas.

---

## 19. Sistemas incrementais (progressão que faz voltar às fases)

> O jogo do vídeo só soma vidas. Aqui, tudo o que o jogador coleta **alimenta sistemas de progressão** visíveis no mapa da ilha.

### 19.1 Oficina do Vô Bugio (melhorias permanentes)

Moedas: **Parafusos** (de robôs desmontados) e **Castanhas** (vidas extras continuam valendo a cada 100, mas há um banco opcional).

| Melhoria | Níveis | Efeito por nível | Custo |
|---|---|---|---|
| Mãos Firmes | 3 | +1 uso em todas as armas de mão | 20 / 45 / 90 parafusos |
| Braço Forte | 3 | Arremessos +15% de alcance | 15 / 35 / 70 |
| Bolso Fundo | 2 | Guardar 1 arma na mochila e trocar com `Q`/LB | 60 / 120 |
| Coração de Sumaúma | 3 | +1 ponto de resistência (o líder aguenta 1 golpe a mais antes de fugir) | 50 / 100 / 200 |
| Faro de Tamanduá | 1 | Segredos próximos brilham levemente | 80 |
| Cauda Planadora | 2 | Planada da Lili +40% de duração | 40 / 90 |
| Ímã de Castanha | 2 | Castanhas próximas são atraídas | 30 / 70 |

A Oficina é uma tela própria, com o Vô Bugio martelando (animação em loop) e cada melhoria mostrando antes/depois.

### 19.2 Viveiro da Semente-Mãe (a ilha cresce)

- Cada **Moeda-Folha** encontrada é plantada no viveiro.
- **Visual incremental no mapa da ilha:** a cada 3 Moedas-Folha, uma área devastada do mapa **volta a ficar verde** (camadas pré-renderizadas "devastada" e "renascida" com transição animada). Animais aparecem no mapa.
- Recompensas por marcos: 3 folhas = trilha secreta no mapa; 7 = nova sala bônus especial; 14 = a fase extra **"Copa da Sumaúma"** (fase 5-1, desafio final de plataforma sobre a árvore gigante).

### 19.3 Álbum da Selva (colecionáveis de diversão)

- **Fotos engraçadas** (como a da `gag_selfie`): 1 por fase, conseguidas com uma ação específica e escondida.
- **Cartas do bestiário:** derrotar cada tipo de inimigo de 3 formas diferentes (pisão, arma, arremesso) desbloqueia a carta com ilustração, nome e uma piada.
- **Figurinos da dupla:** 6 roupas (exemplos: Tamá de pescador, Lili de exploradora), compradas com castanhas ou ganhas em desafios. Renderizadas como variações de material e acessório no pipeline 3D, usáveis no jogo.

### 19.4 Medalhas por fase

Cada fase mostra 4 medalhas no mapa:
- 🥇 **Exploradora**: todas as letras, Moeda-Folha e salas bônus.
- ⏱ **Relâmpago**: terminar abaixo do tempo-alvo (definido à mão por fase).
- 🛡 **Intocável**: terminar sem perder o parceiro.
- 🎭 **Brincalhona**: ativar a situação engraçada (`gag_*`) da fase.

### 19.5 Desafios do Tucano (missões incrementais)

Lista de 30 missões escritas à mão, com recompensa e barra de progresso. Exemplos:
- "Derrube 50 Javalins com a Panela de Barro".
- "Acerte 3 inimigos com um único Coco Verde".
- "Faça um inimigo cair da plataforma com a Vassoura 20 vezes".
- "Termine a 2-1 sem acender nenhuma lamparina".
- "Complete o combo de conga dos caranguejos".

### 19.6 Brinde do Bem-te-vi

Ao entrar no mapa a cada nova sessão (até 1 vez por dia, usando a data local), o Bem-te-vi traz um pequeno presente sorteado de uma **tabela autoral**: castanhas, parafusos, uma arma inicial para a próxima fase ou uma peça de figurino rara.

### 19.7 Integração com o HUD e as telas

- Ao terminar a fase, a **tela de resultados** mostra as medalhas conquistadas, os parafusos e as castanhas contando ("tick-tick-tick" sonoro) e o avanço dos desafios.
- Uma notificação animada (balão do Tucano) aparece no canto quando um desafio é concluído durante a fase.
- O menu de pausa mostra os desafios ativos da fase atual.
