/** Textos autorais da interface: cinemáticas, créditos, dicas do Vô Bugio, efeitos da Oficina. */

export const NOME_JOGO = 'Adventures of ROK';

export interface CenaCine { img: string; legenda: string; dur: number; pan?: [number, number, number, number] }

/** Abertura: 6 cenas pré-renderizadas (public/assets/cine/abertura-N.webp). pan = [x0%, y0%, x1%, y1%] do movimento de câmera. */
export const ABERTURA: CenaCine[] = [
  { img: 'cine/abertura-1.webp', dur: 6, pan: [0, 0, -3, -2], legenda: 'No coração da Ilha Sumaúma, a árvore mais velha da mata guarda a Semente-Mãe — o brilho que faz a selva crescer.' },
  { img: 'cine/abertura-2.webp', dur: 6, pan: [-2, 0, 2, -1], legenda: 'Ali dormem Tamá, a tamanduá-bandeira mais forte da ilha, e Lili, a mico-leão-dourado mais rápida. Ronco de um, cauda balançando da outra.' },
  { img: 'cine/abertura-3.webp', dur: 6, pan: [2, -2, -2, 0], legenda: 'Até que, numa madrugada, o chão tremeu. Fumaça, serras e motores: as máquinas do Barão Javardo chegaram pelo mar.' },
  { img: 'cine/abertura-4.webp', dur: 6, pan: [0, 0, 0, -4], legenda: 'O Barão quer a ilha inteira virando tábua. E para isso ele precisa apagar o coração da floresta.' },
  { img: 'cine/abertura-5.webp', dur: 6, pan: [-3, -1, 1, 0], legenda: 'Com uma garra de lata, ele arrancou a Semente-Mãe da sumaúma e sumiu na direção da Fábrica Javarda.' },
  { img: 'cine/abertura-6.webp', dur: 7, pan: [0, -2, -3, 0], legenda: 'Tamá estalou os dedos. Lili apertou a pochete. A dupla desceu da árvore: a semente vai voltar para casa.' },
];

/** Final: 8 cenas + cena extra para quem tem 100%. */
export const FINAL: CenaCine[] = [
  { img: 'cine/final-1.webp', dur: 6, pan: [0, 0, -2, -2], legenda: 'O Barão Javardo caiu junto com a última chaminé. A Semente-Mãe rolou, ainda brilhando, para as mãos da Lili.' },
  { img: 'cine/final-2.webp', dur: 6, pan: [-2, 0, 2, -2], legenda: 'Os Javalins tiraram o capacete, olharam a fábrica parada… e perguntaram se podiam ajudar a plantar.' },
  { img: 'cine/final-3.webp', dur: 6, pan: [0, -2, 0, 1], legenda: 'A dupla subiu o tronco da sumaúma, galho por galho, até o ninho de onde a semente tinha sido roubada.' },
  { img: 'cine/final-4.webp', dur: 6, pan: [2, 0, -2, -1], legenda: 'Tamá cavou. Lili colocou a semente na terra. E as duas esperaram, de mãos dadas.' },
  { img: 'cine/final-5.webp', dur: 6, pan: [0, 0, 0, -3], legenda: 'Primeiro veio um brilho. Depois um broto. Depois a ilha inteira respirou fundo.' },
  { img: 'cine/final-6.webp', dur: 6, pan: [-3, 0, 1, -1], legenda: 'Onde havia toco, nasceu folha. Onde havia fumaça, voltou o canto dos pássaros.' },
  { img: 'cine/final-7.webp', dur: 6, pan: [1, -1, -2, 0], legenda: 'O Vô Bugio trocou o martelo por um regador. O Tucano contou a história para todo mundo — três vezes.' },
  { img: 'cine/final-8.webp', dur: 7, pan: [0, -2, -2, 0], legenda: 'E a dupla? Dormiu de novo na sumaúma. Ronco de um, cauda balançando da outra. Até a próxima aventura.' },
];
export const FINAL_EXTRA: CenaCine = { img: 'cine/final-extra.webp', dur: 8, pan: [0, 0, -3, -3], legenda: 'Cem por cento da ilha renascida! Lá no alto da Copa da Sumaúma, uma segunda semente começou a brilhar… mas essa é outra história.' };

export interface Credito { papel: string; nome: string; retrato?: { m: string; a: string; v?: string } }
export const CREDITOS: { titulo: string; itens: Credito[] }[] = [
  { titulo: 'Estrelando', itens: [
    { papel: 'Força bruta e abraços', nome: 'Tamá', retrato: { m: 'tama', a: 'vitoria' } },
    { papel: 'Saltos, cambalhotas e pressa', nome: 'Lili', retrato: { m: 'lili', a: 'vitoria' } },
    { papel: 'Dicas e marteladas', nome: 'Vô Bugio', retrato: { m: 'vo-bugio', a: 'martelar' } },
    { papel: 'Fofoca aérea', nome: 'Tucano', retrato: { m: 'tucano', a: 'comentar' } },
    { papel: 'Correio e brindes', nome: 'Bem-te-vi', retrato: { m: 'bem-te-vi', a: 'entregar' } },
  ] },
  { titulo: 'Os vilões (que agora plantam árvores)', itens: [
    { papel: 'Chefe final e bigode', nome: 'Barão Javardo', retrato: { m: 'barao-javardo', a: 'idle' } },
    { papel: 'Serra e mau humor', nome: 'Major Motosserra', retrato: { m: 'major-motosserra', a: 'idle' } },
    { papel: 'Lâmpadas e drama', nome: 'Rainha Morcega-Lâmpada', retrato: { m: 'rainha-morcega', a: 'idle' } },
    { papel: 'Válvulas e tentáculos', nome: 'Polvo-Draga', retrato: { m: 'polvo-draga', a: 'idle' } },
    { papel: 'Bater ponto', nome: 'Os Javalins', retrato: { m: 'javalim', a: 'dancar' } },
  ] },
  { titulo: 'Estúdio Sumaúma', itens: [
    { papel: 'Direção de selva', nome: 'Equipe Sumaúma' },
    { papel: 'Modelos 3D esculpidos em código', nome: 'Oficina de Modelagem' },
    { papel: 'Fases desenhadas à mão', nome: 'Ateliê de Trilhas' },
    { papel: 'Música nota por nota', nome: 'Orquestra da Mata' },
    { papel: 'Letras entalhadas a formão', nome: 'Marcenaria Tipográfica' },
    { papel: 'Teste de tombos', nome: 'Os Javalins (de novo)' },
  ] },
  { titulo: 'Agradecimento especial', itens: [
    { papel: 'Por existir e dar sombra', nome: 'Todas as sumaúmas de verdade' },
    { papel: 'Por jogar até aqui', nome: 'Você' },
  ] },
];

/** Dicas do Vô Bugio sobre segredos, uma por fase (mostradas para a próxima fase com segredos faltando). */
export const DICAS_BUGIO: Record<string, string> = {
  '1-1': 'Na Trilha da Sumaúma, nem todo chão é chão. Bate forte onde a grama tá mais clarinha, Tamá!',
  '1-2': 'Lá nas Copas, quando começar a chover, olha pra cima: a Lili alcança galho que a Tamá nem sonha.',
  '1-3': 'Na Serraria, as toras sabem o caminho. Sobe numa e confia… mas pula antes da serra!',
  '1-4': 'Rio das Toras: tora que afunda leva a gente pra baixo. E lá embaixo tem coisa brilhando, hehe.',
  'chefe-1': 'O Major é bravo mas é burro. Faz ele cravar a serra na árvore e aí… PÓÓIN nele!',
  '2-1': 'Na Gruta das Lamparinas, grita no salão escuro. A caverna responde e mostra os buracos dela.',
  '2-2': 'Nos trilhos, aquela placa torta não é enfeite. Muda o trilho e vê aonde vai dar.',
  '2-3': 'O Ninho dos Morcegos tem DJ. Bate no ritmo, que Javalim dançando não presta atenção.',
  'chefe-2': 'A Rainha só brilha quando ataca. Joga cabaça acesa na luz dela!',
  '3-1': 'Caranguejo em fila é convite. Pula em todos, um atrás do outro, sem tocar na areia.',
  '3-2': 'No Recife, o Pirarucu abre coral rachado com a cabeça. Procura a caixa dele com cara entalhada.',
  '3-3': 'No Naufrágio, baú que respira não é baú. Joga um peixe seco que ele esquece de você.',
  '3-4': 'Água-viva pisca no compasso. Conta junto: um, dois, três… agora!',
  'chefe-3': 'O Polvo-Draga tem válvulas nas costas. Montado no Pirarucu cê abre elas rapidinho.',
  '4-1': 'Na Fábrica tem sala de café. E eu tenho uma ideia malvada com suco de jaca…',
  '4-2': 'Relógio de ponto da fábrica toca às cinco. Se adiantar ele, os Javalins largam tudo e vão embora!',
  '4-3': 'Na perseguição da Lagarta, não olha pra trás. Três cabaças param a bicha, se der tempo.',
  'chefe-4': 'Árvore de bigode não existe. Bate antes que ele perceba que você percebeu.',
  '5-1': 'A Copa da Sumaúma é lá no alto. Só as catorze Moedas-Folha abrem o caminho.',
};
export const BUGIO_SAUDACAO = [
  'Ô de casa! Chega mais, que a oficina tá quentinha.',
  'Trouxeram parafuso? Vô Bugio transforma lata de Javalim em coisa útil!',
  'Martelo bom é martelo que não para. Diz aí, o que vai ser hoje?',
];

/** Antes/depois de cada melhoria da Oficina, por nível (0 = sem a melhoria). */
export function efeitoUpgrade(id: string, lv: number): string {
  switch (id) {
    case 'maos': return lv ? `+${lv} uso${lv > 1 ? 's' : ''} em cada arma` : 'Armas com usos normais';
    case 'braco': return lv ? `Arremesso +${lv * 15}% de alcance` : 'Arremesso normal';
    case 'bolso': return lv === 0 ? 'Sem mochila' : lv === 1 ? 'Mochila guarda 1 arma' : 'Mochila guarda 1 arma e mantém os usos';
    case 'coracao': return lv ? `Líder aguenta ${lv + 1} golpes antes de fugir` : 'Líder foge no 1º golpe';
    case 'faro': return lv ? 'Segredos próximos brilham' : 'Segredos escondidos';
    case 'cauda': return lv ? `Planada da Lili +${lv * 40}%` : 'Planada normal';
    case 'ima': return lv ? `Ímã puxa castanhas a ${lv === 1 ? '2' : '4'} tiles` : 'Sem ímã';
    default: return '';
  }
}

export const NOMES_CHEFES: Record<string, string> = {
  'major-motosserra': 'Major Motosserra', 'rainha-morcega': 'Rainha Morcega-Lâmpada', 'polvo-draga': 'Polvo-Draga', 'barao-javardo': 'Barão Javardo',
};
export const NOMES_ARMAS: Record<string, string> = {
  galho: 'Galho Torto', coco: 'Coco Verde', jaca: 'Jaca Madura', remo: 'Remo de Canoa', vassoura: 'Vassoura de Piaçava', panela: 'Panela de Barro',
  lamparina: 'Lamparina Acesa', chave: 'Chave Inglesa Gigante', peixe: 'Peixe Seco', estilingue: 'Estilingue de Forquilha', cupinzeiro: 'Pedaço de Cupinzeiro',
  'guarda-chuva': 'Guarda-chuva de Folha', buzina: 'Buzina de Caminhão', capacete: 'Capacete de Javalim', cabaca: 'Cabaça Rolante', 'cabaca-pedra': 'Cabaça de Pedra', bromelia: 'Bromélia-mola',
};
export const NOMES_ACOES: Record<string, string> = {
  left: 'Esquerda', right: 'Direita', up: 'Olhar / Subir', down: 'Abaixar', jump: 'Pular', action: 'Correr / Pegar / Golpe',
  swap: 'Trocar parceiro', drop: 'Largar arma', pocket: 'Mochila', pause: 'Pausa',
};
export const MEDALHAS = [
  { id: 'exploradora', nome: 'Exploradora', desc: 'Todas as letras, a Moeda-Folha e as salas bônus' },
  { id: 'relampago', nome: 'Relâmpago', desc: 'Terminar abaixo do tempo-alvo' },
  { id: 'intocavel', nome: 'Intocável', desc: 'Terminar sem perder o parceiro' },
  { id: 'brincalhona', nome: 'Brincalhona', desc: 'Ativar a situação engraçada da fase' },
] as const;

export const VIVEIRO_MARCOS = [
  { n: 3, titulo: 'Trilha secreta', desc: 'Um caminho de castanhas aparece no mapa, perto da sumaúma.' },
  { n: 7, titulo: 'Câmara Especial', desc: 'Uma Câmara de Cristal especial se abre no Viveiro.' },
  { n: 14, titulo: 'Copa da Sumaúma', desc: 'A fase extra 5-1 no alto da árvore gigante.' },
];
