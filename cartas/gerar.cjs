// Palavra Mágica · versão "Rodadas" com as cartas abertas (16/11/2026).
// 4 baralhos: missão, contexto, persona e formato. Cada rodada tem 1 missão com 3 assuntos, a mesma para todos os lados.
// Cada baralho de contexto, persona e formato tem 4 cartas abertas na mesa. Na sua vez, o lado pega 1 de cada baralho:
// uma das 4 abertas ou a de cima do monte, sem ver. Cada baralho tem 1 carta especial (Mágico, Espião e Ímã), que rouba
// a carta daquele baralho de qualquer adversário; quem foi roubado perde a rodada. No fim da rodada, o professor digita as cartas no aplicativo: ele dá a nota de
// cada prompt e diz por que perdeu pontos. O melhor prompt ganha 1 ponto. Depois de 5 rodadas, ganha quem tiver mais pontos.
// Uma lista de dados só: dela saem as cartas (frente e verso), a folha de regras, o gabarito do professor,
// o Manual do Professor e os dados do aplicativo do professor.
// Uso: node cartas/gerar.cjs
// Gera cartas/cartas.html (só as cartas, para imprimir), cartas/regras-e-gabarito.html, cartas/manual.html,
// app/js/dados.js e app/manifest.webmanifest.
// Para imprimir: abra o .html no Chrome, Ctrl+P, "Salvar como PDF", margens "Nenhuma".
// As cartas vêm em pares de folhas: a frente e, logo depois, o verso. Cole o verso atrás da frente antes de cortar
// (ou imprima dos dois lados do papel, virando na borda longa).
const fs = require('fs');
const path = require('path');

const APP = path.join(__dirname, '..', 'app');
// A conta da nota é a mesma do aplicativo (app/js/nota.js): o gabarito impresso nunca dá outra nota
const NOTA = require(path.join(APP, 'js', 'nota.js'));

// Nome do jogo: o professor pediu um nome em português (Revisão da Sprint 4, 04/11).
// Para trocar, mude só aqui e rode o gerador: as cartas, o manual e o aplicativo mudam juntos.
const NOME = 'Palavra Mágica';
const GRUPO = 'NEXUS';
const ENDERECO_DO_APP = 'lucas-ibmec.github.io/ibmec-metodosageis-nexus-jogo/app';

// ---------------------------------------------------------------- números da regra (de teste)

const RODADAS = 5;
const RODADAS_RAPIDA = 3; // a partida rápida, para o fim da aula
const ABERTAS = 4; // cartas abertas na mesa em cada baralho (contexto, persona e formato)
const VEZ_SEGUNDOS = 60;
const MAX_LADOS = 5;

// ---------------------------------------------------------------- dados

const ASSUNTO = {
  S: { nome: 'Saúde', ico: '✚', minusculo: 'saúde' },
  E: { nome: 'Esporte', ico: '⚽', minusculo: 'esporte' },
  T: { nome: 'Tecnologia', ico: '💻', minusculo: 'tecnologia' },
  A: { nome: 'Meio ambiente', ico: '🌳', minusculo: 'meio ambiente' },
};
const ORDEM = Object.keys(ASSUNTO); // S, E, T, A: a ordem dos números de cada carta
const MINUSCULOS = Object.fromEntries(ORDEM.map((a) => [a, ASSUNTO[a].minusculo]));

// [código, os 3 assuntos, pedido]. Cada missão junta 3 dos 4 assuntos; a carta mostra os 3, sem ordem.
// São 9 para caber numa folha só (a partida usa 5).
const missoes = [
  ['M01', 'SET', 'Crie um aviso no celular para o time de futsal beber água no treino.'],
  ['M02', 'SET', 'Ensine os avós a usar um aplicativo que conta os passos da caminhada.'],
  ['M03', 'SET', 'Explique como um relógio que mede o coração ajuda um atleta a treinar sem se machucar.'],
  ['M04', 'SEA', 'Planeje uma corrida no parque num dia de calor, sem ninguém passar mal e sem deixar lixo.'],
  ['M05', 'SEA', 'Monte o cardápio do time da escola sem desperdiçar comida.'],
  ['M06', 'STA', 'Crie uma mensagem de celular para as famílias tirarem a água parada e fugirem da dengue.'],
  ['M07', 'STA', 'Explique como o celular avisa as pessoas antes de uma enchente, para ninguém se ferir.'],
  ['M08', 'ETA', 'Mostre como um estádio pode usar a tecnologia para gastar menos água e energia.'],
  ['M09', 'ETA', 'Organize uma gincana de reciclagem com o placar num telão da escola.'],
];

// Quanto cada carta combina com cada assunto, de 1 (não combina) a 4 (combina muito),
// na ordem Saúde, Esporte, Tecnologia, Meio ambiente. Fica escondido: só o aplicativo e o gabarito mostram.
// O texto da carta dá as pistas: o aluno lê e pensa em quais assuntos ela ajuda.

// [código, nome, texto da carta, [S, E, T, A]] (sem dado pessoal nem preconceito)
const contextos = [
  ['C01', 'Relógio no campeonato', 'No campeonato de corrida da escola, cada aluno usa um relógio que mede os batimentos do coração.', [3, 4, 4, 1]],
  ['C02', 'Vôlei com dor nas costas', 'O time de vôlei da escola tem muitos jogadores com dor nas costas.', [4, 4, 1, 1]],
  ['C03', 'Campo perto do rio', 'O time do bairro treina num campo perto do rio, que vive cheio de lixo.', [2, 4, 1, 4]],
  ['C04', 'Feira de ciências', 'A escola vai fazer uma feira de ciências aberta para as famílias do bairro.', [3, 2, 3, 3]],
  ['C05', 'Dengue depois da chuva', 'Em Recife, choveu muito, e a prefeitura quer usar o celular para avisar sobre a dengue.', [4, 1, 4, 3]],
  ['C06', 'Gripe em Nova York', 'Num hospital de Nova York, muitas crianças chegam com gripe no inverno.', [4, 1, 1, 1]],
  ['C07', 'Gincana de reciclagem em Seul', 'Em Seul, as turmas competem para ver quem recicla mais, e o placar aparece num telão.', [1, 3, 3, 4]],
  ['C08', 'Celulares velhos na gaveta', 'Lá em casa há cinco celulares velhos numa gaveta, e ninguém sabe onde jogar.', [1, 1, 4, 4]],
  ['C09', 'Calor na corrida do Rio', 'No Rio de Janeiro, a corrida da escola vai ser no parque, num dia de calor forte.', [4, 4, 1, 3]],
  ['C10', 'Fumaça em Manaus', 'Em Manaus, a fumaça das queimadas está fazendo muitas crianças tossirem.', [4, 1, 1, 4]],
  ['C11', 'Avós que caminham em Tóquio', 'Em Tóquio, muitos avós usam um aplicativo que conta os passos para caminhar todo dia.', [4, 3, 3, 1]],
  ['C12', 'Sábado na escola', 'No sábado, a escola abre para as famílias, com jogos na quadra, horta e lanche.', [3, 3, 2, 3]],
  ['C13', 'Estádio verde em Copenhague', 'Em Copenhague, o estádio novo tem painéis solares e guarda a água da chuva para molhar o gramado.', [1, 4, 3, 4]],
  ['C14', 'Árbitro de vídeo', 'No campeonato da cidade, os jogos têm árbitro de vídeo e placar eletrônico.', [1, 4, 4, 1]],
  ['C15', 'Posto de saúde com sol', 'Em Fortaleza, o posto de saúde ganhou painéis solares no telhado.', [3, 1, 3, 4]],
  ['C16', 'Vale do Silício', 'No Vale do Silício, as empresas criam aplicativos usados no mundo todo.', [1, 1, 4, 1]],
];

// [código, nome, o que faz, [S, E, T, A], frase do prompt (quando não é só "Você é " + nome)]
const personas = [
  ['P01', 'Criadora de aplicativos de exercício', 'Cria aplicativos que contam os passos e montam treinos.', [3, 4, 4, 1]],
  ['P02', 'Fisioterapeuta de um time', 'Cuida do corpo dos jogadores e ajuda quem se machucou a voltar a jogar.', [4, 4, 1, 1]],
  ['P03', 'Professor de Educação Física', 'Dá aula no pátio e no parque, ensina a se aquecer e a se proteger do sol.', [3, 4, 1, 3]],
  ['P04', 'Jornalista de ciência', 'Escreve notícias sobre descobertas da ciência para todo mundo entender.', [3, 2, 3, 3]],
  ['P05', 'Cientista que mapeia a dengue', 'Usa computadores e imagens de satélite para descobrir onde a dengue vai aparecer.', [4, 1, 4, 3], 'Você é uma cientista que mapeia a dengue.'],
  ['P06', 'Médica do coração', 'Trabalha num grande hospital e opera o coração de quem está doente.', [4, 2, 1, 1]],
  ['P07', 'Organizador de campeonatos de surfe', 'Escolhe o dia do campeonato pela previsão das ondas e cuida para a praia ficar limpa.', [1, 4, 2, 4]],
  ['P08', 'Engenheira de energia solar', 'Instala painéis que transformam a luz do sol em energia para casas e escolas.', [1, 1, 4, 4]],
  ['P09', 'Guia de trilhas', 'Leva grupos para caminhar na mata, cuida de quem se cansa e ensina a proteger a natureza.', [3, 4, 1, 4]],
  ['P10', 'Enfermeiro na Amazônia', 'Cuida da saúde das famílias que vivem na floresta, longe da cidade.', [4, 1, 1, 4]],
  ['P11', 'Técnica de futebol', 'Analisa os jogos no computador para montar o treino do time.', [2, 4, 4, 1]],
  ['P12', 'Diretor da escola', 'Cuida da escola inteira: das aulas, da merenda, da quadra e do lixo.', [3, 3, 2, 3]],
  ['P13', 'Engenheiro de estádios', 'Projeta estádios com placar eletrônico, luzes que gastam pouca energia e reúso da água da chuva.', [1, 4, 4, 3]],
  ['P14', 'Narradora de jogos na internet', 'Narra os jogos ao vivo pela internet e mostra os números da partida na tela.', [1, 4, 4, 1]],
  ['P15', 'Agente comunitária de saúde', 'Visita as casas do bairro, procura água parada e manda avisos de saúde pelo celular.', [4, 1, 3, 3]],
  ['P16', 'Programador de banco', 'Escreve programas para os computadores de um banco.', [1, 1, 4, 1]],
];

// [código, nome, como fica, [S, E, T, A]]
const formatos = [
  ['F01', 'Tela de aplicativo', 'Como a tela de um aplicativo: a meta do dia, um botão e um aviso.', [3, 4, 4, 1]],
  ['F02', 'Ficha de treino', 'Os exercícios do dia, o tempo de cada um e a pausa para beber água.', [4, 4, 1, 1]],
  ['F03', 'Lista do que levar', 'Coisas para marcar antes de sair: água, protetor solar, boné e saco para o lixo.', [4, 3, 1, 3]],
  ['F04', 'Lista curta (3 itens)', '3 tópicos curtos, um em cada linha.', [3, 3, 3, 3]],
  ['F05', 'Alerta no celular', 'Uma mensagem curta e urgente que aparece na tela do celular.', [3, 1, 4, 4]],
  ['F06', 'Resumo em 2 frases', 'Só o mais importante, em 2 frases.', [2, 2, 2, 2]],
  ['F07', 'Gráfico de barras', 'Barras que comparam números: quem reciclou mais, quem correu mais.', [2, 3, 3, 4]],
  ['F08', 'Cardápio da semana', 'O que comer em cada dia, do café da manhã ao jantar.', [4, 3, 1, 2]],
  ['F09', 'Mapa do percurso', 'O caminho desenhado, com as paradas para água e sombra.', [3, 4, 1, 4]],
  ['F10', 'Pergunta e resposta', 'As dúvidas de quem lê, cada uma com a resposta.', [3, 2, 3, 3]],
  ['F11', 'Passo a passo com as telas', 'Etapas numeradas mostrando onde tocar em cada tela do celular.', [3, 3, 4, 1]],
  ['F12', 'Cartaz (título e 3 frases)', 'Um título que chama atenção e 3 frases curtas, para o mural.', [3, 3, 2, 3]],
  ['F13', 'Placar no telão', 'Números grandes que todos veem de longe, como no estádio ou na gincana.', [1, 4, 4, 3]],
  ['F14', 'História em quadrinhos', '3 quadrinhos com desenhos e falas curtas.', [3, 3, 2, 2]],
  ['F15', 'Folheto para as casas', 'Uma folha com desenhos e poucas palavras, para entregar de casa em casa.', [4, 1, 2, 4]],
  ['F16', 'Linha do tempo', 'Os fatos em ordem, do mais antigo ao mais novo.', [2, 3, 3, 3]],
];

// A imagem de cada carta (para o aluno do Fundamental 2 reconhecer de longe). Não usa os símbolos dos assuntos
// (✚ ⚽ 💻 🌳), para ninguém achar que a imagem diz o assunto da carta.
const IMAGEM = {
  C01: '⌚', C02: '🏐', C03: '🏞️', C04: '🔬', C05: '🦟', C06: '🤧', C07: '♻️', C08: '📱',
  C09: '🌡️', C10: '🔥', C11: '👵', C12: '🏫', C13: '🏟️', C14: '📹', C15: '🏥', C16: '🏢',
  P01: '👩‍💻', P02: '🦵', P03: '🤸', P04: '📰', P05: '👩‍🔬', P06: '🫀', P07: '🏄', P08: '👷‍♀️',
  P09: '🥾', P10: '👨‍⚕️', P11: '🥅', P12: '🧑‍💼', P13: '🏗️', P14: '🎙️', P15: '🏘️', P16: '🏦',
  F01: '📲', F02: '🏋️', F03: '🎒', F04: '📝', F05: '🚨', F06: '✂️', F07: '📊', F08: '🍽️',
  F09: '🗺️', F10: '❓', F11: '👣', F12: '🪧', F13: '🔢', F14: '💬', F15: '📬', F16: '⏳',
};

// A carta especial de cada baralho: o mesmo poder (roubar a carta daquele baralho de qualquer adversário),
// cada uma com a sua imagem. Não tem número nem código: não entra no prompt, então o professor nunca digita.
const ESPECIAIS = {
  Contexto: { nome: 'Mágico', ico: '🎩', frase: 'Num passe de mágica, o contexto de um adversário aparece no seu prompt.', o: 'o', carta: 'contexto' },
  Persona: { nome: 'Espião', ico: '🕵️', frase: 'O espião se infiltra e traz para você a persona de um adversário.', o: 'a', carta: 'persona' },
  Formato: { nome: 'Ímã', ico: '🧲', frase: 'O ímã puxa para você o formato de um adversário.', o: 'o', carta: 'formato' },
};
// O poder, igual nas 3: roubar a carta daquele baralho de qualquer adversário. Quem foi roubado perde a rodada.
const poderDa = (e) => `Roube ${e.o} ${e.carta} de qualquer adversário.`;
const REGRA_DO_ROUBO = 'Quem foi roubado perde a rodada: não ganha ponto.';

// ---------------------------------------------------------------- as cartas como objetos (para fazer as contas)

const minuscula = (t) => t.charAt(0).toLowerCase() + t.slice(1);
const semParenteses = (nome) => nome.replace(/ \(.*\)$/, '');
const combinaDe = (v) => Object.fromEntries(ORDEM.map((a, i) => [a, v[i]]));
const M = missoes.map(([codigo, letras, pedido]) => ({ codigo, tipo: 'Missão', nome: pedido, assuntos: [...letras] }));
const C = contextos.map(([codigo, nome, texto, v]) => ({ codigo, tipo: 'Contexto', nome, texto, ico: IMAGEM[codigo], combina: combinaDe(v) }));
const P = personas.map(([codigo, nome, texto, v, prompt]) => ({
  codigo, tipo: 'Persona', nome, texto, prompt: prompt || `Você é ${minuscula(nome)}.`, ico: IMAGEM[codigo], combina: combinaDe(v),
}));
const F = formatos.map(([codigo, nome, texto, v]) => ({ codigo, tipo: 'Formato', nome, texto, ico: IMAGEM[codigo], combina: combinaDe(v) }));
const BARALHOS = [['Contexto', C], ['Persona', P], ['Formato', F]];
const porCodigo = Object.fromEntries([...M, ...C, ...P, ...F].map((c) => [c.codigo, c]));
const doCodigo = (codigo) => {
  if (!porCodigo[codigo]) throw new Error(`carta ${codigo} não existe`);
  return porCodigo[codigo];
};

// ---------------------------------------------------------------- conferências (o gerador para se algo não bate)

for (const [tipo, baralho] of BARALHOS) {
  if (baralho.length !== 16) throw new Error(`${tipo}: são 16 cartas, não ${baralho.length}`);
  baralho.forEach((carta, i) => {
    const esperado = `${tipo[0]}${String(i + 1).padStart(2, '0')}`;
    if (carta.codigo !== esperado) throw new Error(`${carta.codigo} fora de ordem (esperava ${esperado})`);
    if (!ORDEM.every((a) => [1, 2, 3, 4].includes(carta.combina[a]))) throw new Error(`${carta.codigo}: os números vão de 1 a 4`);
  });
}
// Os grupos de 3 assuntos que as missões usam
const TRIOS = [...new Set(M.map((m) => m.assuntos.join('')))].map((t) => [...t]);
for (const m of M) {
  if (m.assuntos.length !== 3 || new Set(m.assuntos).size !== 3 || !m.assuntos.every((a) => ASSUNTO[a])) throw new Error(`${m.codigo}: 3 assuntos diferentes`);
}
for (const trio of TRIOS) {
  for (const [tipo, baralho] of BARALHOS) {
    const somas = baralho.map((c) => NOTA.somaDaCarta(c, trio)).sort((a, b) => b - a);
    // Nenhuma carta é perfeita (4 nos 3 assuntos) e todo baralho tem 2 cartas boas para cada missão
    if (somas[0] !== 11 || somas[1] !== 10) throw new Error(`${tipo} para ${trio.join('')}: as 2 melhores somam ${somas[0]} e ${somas[1]}`);
  }
}
// Toda carta tem a sua imagem, e nenhuma imagem se repete
for (const [, baralho] of BARALHOS) for (const c of baralho) if (!c.ico) throw new Error(`falta a imagem de ${c.codigo}`);
if (new Set(Object.values(IMAGEM)).size !== Object.keys(IMAGEM).length) throw new Error('duas cartas com a mesma imagem');
// Numa rodada, cada monte precisa repor as abertas para todos os lados, mais 1 carta para quem foi roubado
// (o monte tem 16 cartas + a especial; as abertas ficam fora dele)
if (16 + 1 - ABERTAS < MAX_LADOS + 1) throw new Error('cartas de menos para tantos lados');

// ---------------------------------------------------------------- desenho das cartas

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const icone = (a) => `<span class="a-${a}">${ASSUNTO[a].ico}</span>`;
const chipAssunto = (a) => `<span class="chip-assunto"><span class="ico a-${a}">${ASSUNTO[a].ico}</span>${ASSUNTO[a].nome}</span>`;

// Desenho pequeno de cada formato (mostra como a resposta fica)
const SVG = (miolo) => `<svg viewBox="0 0 100 36" aria-hidden="true">${miolo}</svg>`;
const L = (x1, y1, x2, y2, w = 2.4) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="currentColor" stroke-width="${w}" stroke-linecap="round"/>`;
const T = (x, y, t, s = 8, cor = 'currentColor') => `<text x="${x}" y="${y}" font-size="${s}" font-weight="800" fill="${cor}" font-family="Segoe UI, Arial">${t}</text>`;
const R = (x, y, w, h, r = 2, cheio = false) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" ${cheio ? 'fill="currentColor"' : 'fill="none" stroke="currentColor" stroke-width="2"'}/>`;
const celular = (x, y, w, h) => `${R(x, y, w, h, 3)}${L(x + w / 2 - 3, y + h - 2.6, x + w / 2 + 3, y + h - 2.6, 1.6)}`;
const desenho = {
  F01: SVG(`${celular(36, 1, 28, 34)}<circle cx="50" cy="13" r="6.5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-dasharray="30 11"/>${R(41, 23, 18, 5, 2.5, true)}`),
  F02: SVG(`${T(4, 10, '10x', 7)}${T(4, 21, '20s', 7)}${T(4, 32, 'água', 6.4)}${L(22, 8, 70, 8)}${L(22, 19, 62, 19)}${L(22, 30, 66, 30)}<g fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="84" cy="8" r="4"/><circle cx="84" cy="19" r="4"/></g>${L(84, 8, 84, 6, 1.6)}${L(84, 19, 86, 19, 1.6)}<path d="M84 25.5c2.4 3 3.6 4.6 3.6 6a3.6 3.6 0 0 1-7.2 0c0-1.4 1.2-3 3.6-6z" fill="currentColor"/>`),
  F03: SVG(`${R(8, 3, 7, 7, 1.4)}${R(8, 14.5, 7, 7, 1.4)}${R(8, 26, 7, 7, 1.4)}<path d="M9.4 6.6l2 2 3.4-4.2M9.4 18.1l2 2 3.4-4.2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>${L(22, 6.5, 80, 6.5)}${L(22, 18, 70, 18)}${L(22, 29.5, 76, 29.5)}`),
  F04: SVG(`<g fill="currentColor"><circle cx="10" cy="8" r="2.6"/><circle cx="10" cy="18" r="2.6"/><circle cx="10" cy="28" r="2.6"/></g>${L(18, 8, 84, 8)}${L(18, 18, 70, 18)}${L(18, 28, 78, 28)}`),
  F05: SVG(`${celular(34, 1, 32, 34)}${R(27, 6, 46, 11, 3, true)}${T(31.5, 14.6, '!', 9, '#fff')}<line x1="38" y1="11.5" x2="66" y2="11.5" stroke="#fff" stroke-width="2" stroke-linecap="round"/>${L(40, 24, 60, 24, 1.8)}${L(40, 28.5, 56, 28.5, 1.8)}`),
  F06: SVG(`${L(8, 10, 92, 10)}${L(8, 19, 52, 19)}<circle cx="58" cy="19" r="1.8" fill="currentColor"/>${L(8, 28, 80, 28)}<circle cx="86" cy="28" r="1.8" fill="currentColor"/>`),
  F07: SVG(`${L(10, 2, 10, 33, 2)}${L(10, 33, 92, 33, 2)}${R(18, 18, 12, 15, 1, true)}${R(36, 8, 12, 25, 1, true)}${R(54, 22, 12, 11, 1, true)}${R(72, 13, 12, 20, 1, true)}`),
  F08: SVG(`<circle cx="50" cy="18" r="14" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="50" cy="18" r="9" fill="none" stroke="currentColor" stroke-width="1.4"/>${L(26, 6, 26, 30)}${L(23, 6, 23, 13, 1.6)}${L(29, 6, 29, 13, 1.6)}<path d="M74 6c3 0 3 9 0 11v13" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>`),
  F09: SVG(`<path d="M8 29C24 29 26 8 44 13S70 31 88 9" fill="none" stroke="currentColor" stroke-width="2.4" stroke-dasharray="4 3.4" stroke-linecap="round"/><circle cx="8" cy="29" r="3.4" fill="currentColor"/>${L(88, 9, 88, 1.5, 1.8)}<path d="M88 1.5l8 3-8 3z" fill="currentColor"/><path d="M44 6.5c2 2.5 3 3.8 3 5a3 3 0 0 1-6 0c0-1.2 1-2.5 3-5z" fill="currentColor"/>`),
  F10: SVG(`${T(6, 13, 'P')}${L(18, 10, 76, 10)}${T(80, 13, '?')}${T(6, 29, 'R')}${L(18, 26, 88, 26)}`),
  F11: SVG(`${celular(4, 4, 20, 30)}${celular(40, 4, 20, 30)}${celular(76, 4, 20, 30)}${T(11.2, 22, '1', 10)}${T(47.2, 22, '2', 10)}${T(83.2, 22, '3', 10)}<path d="M28 19h8m-3-3 3 3-3 3M64 19h8m-3-3 3 3-3 3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`),
  F12: SVG(`<rect x="24" y="1" width="52" height="34" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><rect x="30" y="6" width="40" height="7" rx="1.5" fill="currentColor"/>${L(31, 19, 69, 19, 2)}${L(31, 25, 64, 25, 2)}${L(31, 31, 67, 31, 2)}`),
  F13: SVG(`${R(14, 1, 72, 25, 2.4)}${T(31, 20, '3 x 2', 15)}${L(30, 26, 26, 35, 2)}${L(70, 26, 74, 35, 2)}`),
  F14: SVG(`${R(4, 3, 28, 30, 1.6)}${R(36, 3, 28, 30, 1.6)}${R(68, 3, 28, 30, 1.6)}<path d="M8 8h18v7H14l-3 3v-3H8z" fill="currentColor"/><path d="M42 8h18v7H50l-3 3v-3h-5z" fill="currentColor"/><g fill="currentColor"><circle cx="18" cy="25" r="3.6"/><circle cx="50" cy="25" r="3.6"/><circle cx="82" cy="20" r="3.6"/></g>${L(73, 29, 91, 29, 1.8)}`),
  F15: SVG(`<path d="M28 1h36l8 8v26H28z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M64 1v8h8" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M34 15l7-6 7 6v8H34z" fill="currentColor"/>${L(52, 13, 66, 13, 2)}${L(52, 19, 63, 19, 2)}${L(34, 29, 66, 29, 2)}`),
  F16: SVG(`${L(6, 20, 94, 20, 2.4)}<g fill="currentColor"><circle cx="14" cy="20" r="4"/><circle cx="38" cy="20" r="4"/><circle cx="62" cy="20" r="4"/><circle cx="86" cy="20" r="4"/></g>${T(8, 34, '1890', 7)}${T(32, 34, '1950', 7)}${T(56, 34, '2000', 7)}${T(79, 34, 'hoje', 7)}`),
};
for (const f of F) if (!desenho[f.codigo]) throw new Error(`falta o desenho de ${f.codigo}`);

// Cada carta também vai para o manual, pelo código
const cartaPorCodigo = {};
const carta = (cls, codigo, tipo, miolo) => {
  const html = `<div class="card ${cls}"><div class="hd"><span>${tipo}</span><span class="code">${codigo}</span></div>${miolo}</div>`;
  cartaPorCodigo[codigo] = html;
  return html;
};

// O símbolo de cada baralho: aparece no verso (grande) e na frente das cartas de contexto e de persona (pequeno)
const EMBLEMA = {
  Missão: '<circle cx="12" cy="12" r="9.5"/><circle cx="12" cy="12" r="5.5"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/>',
  Contexto: '<path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="10" r="2.6"/>',
  Persona: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  Formato: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/>',
};
const emblema = (tipo, cls) => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${EMBLEMA[tipo]}</svg>`;
const imagem = (ico, extra = '') => `<div class="imagem ${extra}" aria-hidden="true">${ico}</div>`;

// A carta especial de cada baralho (fica no mesmo monte, com o mesmo verso)
const cartaEspecial = (tipo) => {
  const e = ESPECIAIS[tipo];
  const html = `<div class="card t-${tipo.toLowerCase()} especial"><div class="hd"><span>${tipo.toUpperCase()}</span><span class="code">★ ESPECIAL</span></div>
  <div class="body center">${imagem(e.ico, 'grande')}<p class="big">${e.nome}</p><p class="poder">${poderDa(e)}</p><p class="efeito">${e.frase} ${REGRA_DO_ROUBO}</p></div>
  <div class="ft">Não entra no prompt: depois de usar, vai para o fundo do monte. Ninguém tem ${e.carta} ainda? Ponha no fundo do monte e pegue outra.</div></div>`;
  cartaPorCodigo[`especial-${tipo}`] = html;
  return html;
};

// A frente das cartas, separada por baralho
const frentes = {
  Missão: M.map((m) => carta('t-missao', m.codigo, 'MISSÃO', `
  <div class="assuntos-missao">${m.assuntos.map(chipAssunto).join('')}</div>
  <div class="body"><p class="pedido">“${esc(m.nome)}”</p></div>
  <p class="pense">Pense: quem entende destes 3 assuntos? Que situação junta os 3? Que formato ajuda quem vai ler?</p>
  <div class="ft">Fica no meio da mesa durante a rodada. Vale para todos os lados.</div>`)),

  Contexto: [...C.map((c) => carta('t-contexto', c.codigo, 'CONTEXTO', `
  <div class="body center">${imagem(c.ico)}<p class="big">${esc(c.nome)}</p><p class="txt">“${esc(c.texto)}”</p></div>
  <div class="ft">A situação: onde é e o que está acontecendo.</div>`)), cartaEspecial('Contexto')],

  Persona: [...P.map((p) => carta('t-persona', p.codigo, 'PERSONA', `
  <div class="body center">${imagem(p.ico)}<p class="big">${esc(p.nome)}</p><p class="faz">${esc(p.texto)}</p><p class="efeito">No prompt:<br>“${esc(p.prompt)}”</p></div>
  <div class="ft">Quem a IA vai ser ao responder.</div>`)), cartaEspecial('Persona')],

  Formato: [...F.map((f) => carta('t-formato', f.codigo, 'FORMATO', `
  <div class="body center">${imagem(f.ico, 'pequena')}<p class="big">${esc(f.nome)}</p><div class="desenho">${desenho[f.codigo]}</div><p class="efeito">${esc(f.texto)}</p></div>
  <div class="ft">Como a resposta chega para quem vai ler.</div>`)), cartaEspecial('Formato')],
};
const cartas = Object.values(frentes).flat();

// O verso diz de que baralho é a carta: os 3 montes ficam virados para baixo e não se misturam
const VERSO = {
  Missão: ['t-missao', 'MISSÃO', 'o pedido da rodada'],
  Contexto: ['t-contexto', 'CONTEXTO', 'a situação'],
  Persona: ['t-persona', 'PERSONA', 'quem responde'],
  Formato: ['t-formato', 'FORMATO', 'como a resposta chega'],
};
const verso = (tipo) => {
  const [cls, nome, sub] = VERSO[tipo];
  return `<div class="card verso-carta ${cls}"><div class="verso-miolo">
    ${emblema(tipo, 'verso-ico')}
    <p class="verso-nome">${nome}</p><p class="verso-sub">${sub}</p><p class="verso-jogo">${NOME}</p>
  </div></div>`;
};
const versoPorTipo = Object.fromEntries(Object.keys(VERSO).map((tipo) => [tipo, verso(tipo)]));

// Cada folha tem cartas de um baralho só: todos os versos da folha são iguais,
// então colar a folha do verso um pouco torta (ou imprimir frente e verso) nunca troca o verso de uma carta.
const PLURAL = { Missão: 'missões', Contexto: 'contextos', Persona: 'personas', Formato: 'formatos' };
const folhas = [];
for (const [tipo, lista] of Object.entries(frentes)) {
  for (let i = 0; i < lista.length; i += 9) folhas.push({ tipo, cartas: lista.slice(i, i + 9) });
}
const VAGA = '<div class="vaga"></div>';
const paginasDeCartas = folhas.map((folha, n) => {
  const frente = Array.from({ length: 9 }, (_, i) => folha.cartas[i] || VAGA);
  // Atrás, as 9 posições recebem o verso, mesmo onde a frente está vazia. Como todos os versos da folha são iguais,
  // a folha do verso pode ser colada virada para qualquer lado que cada carta ganha o seu verso.
  const atras = Array.from({ length: 9 }, () => versoPorTipo[folha.tipo]);
  const qual = `Folha ${n + 1} de ${folhas.length} · ${PLURAL[folha.tipo]}`;
  return `<section class="page grid"><p class="rotulo-folha"><b>${qual} · frente</b> · corte nas linhas tracejadas</p>${frente.join('')}</section>
<section class="page grid"><p class="rotulo-folha"><b>${qual} · verso</b> · cole atrás da frente desta folha antes de cortar (ou imprima dos dois lados, virando na borda longa)</p>${atras.join('')}</section>`;
});

// ---------------------------------------------------------------- o exemplo (o mesmo na folha de regras e no manual)

// Missão M04: o Lado 1 pensa nos 3 assuntos; o Lado 2 esquece o meio ambiente.
// Se uma carta mudar, o gerador confere de novo se o exemplo ainda faz sentido.
const exemplo = {
  missao: doCodigo('M04'),
  // As 4 cartas abertas de cada baralho na vez do Lado 1 (a primeira de cada é a que ele pega).
  // O Lado 2 pega a segunda de cada, que continua aberta na vez dele.
  abertas: { Contexto: ['C09', 'C02', 'C14', 'C16'], Persona: ['P09', 'P02', 'P14', 'P16'], Formato: ['F03', 'F02', 'F01', 'F06'] },
  lado1: ['C09', 'P09', 'F03'].map(doCodigo),
  lado2: ['C02', 'P02', 'F02'].map(doCodigo),
};
{
  const { missao, abertas, lado1, lado2 } = exemplo;
  for (const [tipo, codigos] of Object.entries(abertas)) {
    if (codigos.length !== ABERTAS) throw new Error(`exemplo: são ${ABERTAS} cartas abertas de ${tipo}`);
    const somas = codigos.map((c) => NOTA.somaDaCarta(doCodigo(c), missao.assuntos));
    if (!somas.slice(1).every((s) => somas[0] > s)) throw new Error(`exemplo: a ${tipo} do Lado 1 não é a melhor das abertas`);
  }
  if (!lado1.every((c, i) => c.codigo === Object.values(abertas)[i][0])) throw new Error('exemplo: o Lado 1 pega a primeira aberta de cada baralho');
  if (!lado2.every((c, i) => c.codigo === Object.values(abertas)[i][1])) throw new Error('exemplo: o Lado 2 pega a segunda aberta de cada baralho');
  if (!(NOTA.somaDoPrompt(lado1, missao.assuntos) > NOTA.somaDoPrompt(lado2, missao.assuntos))) throw new Error('exemplo: o Lado 1 precisa ganhar');
  // O Lado 2 perde pontos só por causa do assunto que esqueceu
  const perdidos = NOTA.problemas(lado2, missao.assuntos);
  if (perdidos.length !== 3 || !perdidos.every((p) => p.assuntos.join('') === 'A' && p.valor === 1)) throw new Error('exemplo: o Lado 2 precisa errar só o meio ambiente');
  if (new Set([...lado1, ...lado2].map((c) => c.codigo)).size !== 6) throw new Error('exemplo: os dois lados não podem ter a mesma carta');
}
const notaDe = (cartasDoLado) => NOTA.numero(NOTA.mediaDoPrompt(cartasDoLado, exemplo.missao.assuntos));
const listaDoLado = (cartasDoLado) => cartasDoLado.map((c) => `<b>${c.codigo}</b> ${esc(semParenteses(c.nome))}`).join(' + ');
const iconesDaMissao = (m) => m.assuntos.map(icone).join(' ');

// ---------------------------------------------------------------- regras (2 páginas: frente e verso)

const nomesDasEspeciais = Object.values(ESPECIAIS).map((e) => `${e.ico} ${e.nome}`).join(' · ');
const regras = `<section class="page doc regras">
<h1>${NOME} · Como jogar <small>grupo ${GRUPO} · 2 a ${MAX_LADOS} lados · completa: ${RODADAS} rodadas (cerca de 25 min) · rápida: ${RODADAS_RAPIDA} rodadas (cerca de 15 min)</small></h1>
<p class="objetivo"><b>Objetivo:</b> em cada rodada, montar o prompt que mais combina com a missão, com 1 contexto, 1 persona e 1 formato. O melhor prompt da rodada ganha <b>1 ponto</b>. No fim da última rodada, ganha quem tiver mais pontos.</p>

<div class="cols">
<div>
<h2>No jogo</h2>
<p>${M.length} missões · ${C.length + 1} contextos · ${P.length + 1} personas · ${F.length + 1} formatos (cada um desses 3 baralhos tem 1 carta especial) · o celular do professor com o aplicativo.</p>

<h2>Preparação</h2>
<ol>
<li>Divida a turma em 2 a ${MAX_LADOS} lados: cada lado é 1 aluno, uma dupla ou um grupo (veja as versões no verso).</li>
<li>Embaralhe cada baralho separado (<b>contexto</b>, <b>persona</b> e <b>formato</b>) e ponha os 3 montes virados para baixo no meio da mesa.</li>
<li>Vire as <b>${ABERTAS} cartas de cima</b> de cada monte, lado a lado: são as <b>cartas abertas</b>. Saíram <b>2 ou 3 cartas especiais</b> entre as abertas? Recolha as abertas, embaralhe de novo e vire outras.</li>
<li>Embaralhe as <b>missões</b> e deixe o montinho ao lado.</li>
<li><b>Quem começa:</b> o professor cadastra os lados na página Partida do aplicativo e toca em <b>Sortear quem começa</b>. Sem celular: par ou ímpar.</li>
</ol>

<div class="mesa">
  <p class="mesa-t">A mesa</p>
  <div class="mesa-corpo">
  <span class="mini m">Missão<small>vale para todos</small></span>
  <div class="mesa-baralhos">${[['c', 'Contexto'], ['p', 'Persona'], ['f', 'Formato']].map(([cls, nome]) => `<div class="mesa-fila baralho"><span class="mini ${cls}">${nome}<small>monte</small></span><span class="abertas">${`<i class="aberta ${cls}"></i>`.repeat(ABERTAS)}<small>${ABERTAS} abertas</small></span></div>`).join('')}</div>
  </div>
  <p class="mesa-mao">Na frente de cada lado: as 3 cartas que pegou, viradas para baixo</p>
</div>
</div>

<div>
<h2>Uma rodada</h2>
<ol class="vez-passos">
<li><b>Vire 1 missão</b> no meio da mesa. Ela vale para <b>todos os lados</b>: leiam juntos o pedido e os <b>3 assuntos</b>.</li>
<li><b>Na vez do seu lado</b> (até 1 minuto): pegue <b>1 contexto, 1 persona e 1 formato</b>. De cada baralho, escolha <b>uma das ${ABERTAS} abertas</b> ou pegue a de cima do monte, sem ver.</li>
<li>Pegou uma aberta? <b>Vire a de cima do monte</b> no lugar dela: sempre ficam ${ABERTAS} abertas.</li>
<li>Deixe as 3 cartas <b>viradas para baixo</b> na sua frente. A vez passa para o <b>próximo lado</b>, em sentido horário.</li>
<li>Todos pegaram? <b>Virem as cartas.</b> O professor digita no aplicativo a missão e as cartas de cada lado.</li>
<li>Depois, as cartas dos lados voltam para os montes (embaralhe), as abertas ficam na mesa e a missão sai do jogo. Na rodada seguinte, <b>começa o próximo lado</b>.</li>
</ol>

<div class="especiais">
<p class="especiais-t">As cartas especiais <span>${nomesDasEspeciais}</span></p>
<p>Só 1 em cada baralho, de propósito: ninguém sabe quando vão aparecer. As 3 têm o mesmo poder: <b>roubar a carta daquele baralho de qualquer adversário</b>. <b>Quem foi roubado perde a rodada</b>: não ganha ponto. A especial não entra no prompt e vai para o fundo do monte (também se ninguém tem aquela carta ainda: pegue outra).</p>
</div>

<h2>A nota do prompt</h2>
<p>Cada carta combina mais ou menos com cada assunto, de <b>1</b> (não combina) a <b>4</b> (combina muito). Os números ficam escondidos no aplicativo: leia as cartas e pense. A nota do prompt vai de 1 a 4, e o aplicativo diz <b>por que cada prompt perdeu pontos</b>.</p>
<table class="nota-tab"><tr><td><b>Melhor prompt da rodada</b></td><td>1 ponto</td></tr><tr><td>Empate no melhor prompt</td><td>1 ponto para cada</td></tr><tr><td>Lado roubado</td><td>sem ponto</td></tr></table>
<p class="ganha"><b>Na última rodada, ganha quem tiver mais pontos.</b> Empate: ganha quem somou as maiores notas. O aplicativo avisa.</p>
</div>
</div>
<p class="vira">Quem começa, as versões do jogo, um exemplo e os casos especiais: no verso.</p>
</section>
<section class="page doc regras regras-verso">
<h1>${NOME} · Versões do jogo <small>e quem começa, um exemplo de rodada e os casos especiais</small></h1>

<h2>Quem começa</h2>
<div class="comeca">
  <div><span class="comeca-n">1</span><p><b>1ª rodada:</b> o aplicativo sorteia. Na página Partida, toque em <b>Sortear quem começa</b>. Sem celular, os lados tiram par ou ímpar.</p></div>
  <div><span class="comeca-n">2</span><p><b>Durante a rodada:</b> a vez segue a ordem dos lados, em sentido horário. O aplicativo mostra de quem é a vez.</p></div>
  <div><span class="comeca-n">3</span><p><b>Rodada seguinte:</b> começa o próximo lado. Assim, cada lado tem a chance de ver as abertas primeiro.</p></div>
</div>

<h2>Quanto tempo</h2>
<div class="versoes">
  <div class="versao"><p class="versao-t">Partida completa</p><p class="versao-n">${RODADAS} rodadas · cerca de 25 min</p><p>Para uma aula inteira. Depois, o desafio final.</p></div>
  <div class="versao"><p class="versao-t">Partida rápida</p><p class="versao-n">${RODADAS_RAPIDA} rodadas · cerca de 15 min</p><p>Mesmas regras, menos rodadas: para o fim da aula ou para a turma aprender o jogo. Na página Partida, escolha <b>Rápida</b>.</p></div>
</div>

<h2>Quem joga</h2>
<div class="versoes tres">
  <div class="versao"><p class="versao-t">Duelo</p><p class="versao-n">2 a 4 alunos · 2 lados</p><p>1 contra 1, ou dupla contra dupla.</p></div>
  <div class="versao"><p class="versao-t">Mesa</p><p class="versao-n">3 a 10 alunos · 3 a ${MAX_LADOS} lados</p><p>Cada lado é 1 aluno ou 1 dupla, cada um por si.</p></div>
  <div class="versao destaque"><p class="versao-t">Em grupos</p><p class="versao-n">até 40 alunos · 2 a ${MAX_LADOS} grupos</p><p>Cada grupo é um lado e decide junto. Um <b>porta-voz</b> pega as cartas e lê o prompt, e o porta-voz troca a cada rodada. No aplicativo, escolha <b>Grupos</b>.</p></div>
</div>

<div class="exemplo">
  <p class="exemplo-t">Exemplo de uma rodada</p>
  <p class="exemplo-missao">Missão <b>${exemplo.missao.codigo}</b> ${iconesDaMissao(exemplo.missao)}: “${esc(exemplo.missao.nome)}”</p>
  <p><b>Lado 1:</b> ${listaDoLado(exemplo.lado1)}. Nota <b>${notaDe(exemplo.lado1)}</b>.</p>
  <p><b>Lado 2:</b> ${listaDoLado(exemplo.lado2)}. Nota <b>${notaDe(exemplo.lado2)}</b>. O aplicativo explica: as 3 cartas não têm nada a ver com meio ambiente, e a missão pede meio ambiente (o lixo no parque).</p>
  <p>O Lado 1 ganha 1 ponto. Se o Lado 2 tivesse pegado o ${ESPECIAIS.Persona.ico} ${ESPECIAIS.Persona.nome}, roubaria a persona do Lado 1, e o Lado 1 perderia a rodada.</p>
</div>

<h2>Casos especiais</h2>
<ul>
<li><b>Saíram 2 ou 3 cartas especiais entre as abertas na preparação:</b> recolha as abertas, embaralhe de novo e vire outras.</li>
<li><b>Acabou o tempo da vez:</b> pegue agora as cartas que faltam, de cima do monte.</li>
<li><b>Mostrou as cartas antes da hora:</b> tudo bem, mas o melhor é guardar segredo até todos pegarem.</li>
<li><b>Sem celular:</b> o gabarito do professor tem os números e a conta.</li>
</ul>
<p class="aviso">Números de teste: ${RODADAS} rodadas (rápida: ${RODADAS_RAPIDA}), ${ABERTAS} cartas abertas em cada baralho e 1 minuto por vez. Anotem o que ficou fácil ou difícil demais para ajustar depois.</p>
</section>`;

// ---------------------------------------------------------------- gabarito do professor (2 páginas)

const tabelaDoBaralho = (tipo, baralho) => `<table class="gab num"><tr><th>${tipo}</th>${ORDEM.map((a) => `<th class="n" title="${ASSUNTO[a].nome}">${ASSUNTO[a].ico}</th>`).join('')}</tr>
${baralho.map((c) => `<tr><td><b>${c.codigo}</b> ${esc(semParenteses(c.nome))}</td>${ORDEM.map((a) => `<td class="n v${c.combina[a]}">${c.combina[a]}</td>`).join('')}</tr>`).join('')}
</table>`;

const melhoresDoTrio = (trio) => BARALHOS.map(([tipo, baralho]) => {
  const ordenadas = [...baralho].sort((a, b) => NOTA.somaDaCarta(b, trio) - NOTA.somaDaCarta(a, trio));
  const duas = ordenadas.slice(0, 2);
  return `<b>${tipo}:</b> ${duas.map((c) => `${c.codigo} (${NOTA.somaDaCarta(c, trio)})`).join(', ')}`;
}).join(' · ');

const conversao = [];
for (let s = 33; s >= 18; s--) conversao.push(`<span class="sem-quebra"><b>${s}</b> = ${NOTA.numero(s / 9)}</span>`);

const gabarito = `<section class="page doc gab-pag">
<h1>Gabarito do professor <small>use se o aplicativo não abrir · não misture com as cartas</small></h1>
<h2>Dar a nota sem o aplicativo</h2>
<ol>
<li>Veja os <b>3 assuntos da missão</b> (tabela abaixo).</li>
<li>Para cada carta do prompt, <b>some os números dos 3 assuntos da missão</b> (tabelas das cartas). Pule a coluna do assunto que a missão não tem.</li>
<li><b>Some as 3 cartas.</b> A maior soma ganha 1 ponto; empate: 1 ponto para cada. Anote a soma de cada lado: ela desempata no fim.</li>
<li>Para dizer <b>por que o prompt perdeu pontos</b>, procure os números 1 e 2 nos assuntos da missão: 1 = não combina, 2 = combina pouco.</li>
</ol>
<table class="gab"><tr><th>Missão</th><th>Assuntos</th></tr>
${M.map((m) => `<tr><td><b>${m.codigo}</b> ${esc(m.nome)}</td><td class="sem-quebra">${m.assuntos.map((a) => `${ASSUNTO[a].ico} ${ASSUNTO[a].nome}`).join(' · ')}</td></tr>`).join('')}
</table>
<p class="legenda">Colunas: ${ORDEM.map((a) => `${ASSUNTO[a].ico} ${ASSUNTO[a].nome}`).join(' · ')}. 4 = combina muito · 3 = combina bem · 2 = combina pouco · 1 = não combina. As cartas especiais (${Object.values(ESPECIAIS).map((e) => `${e.ico} ${e.nome}`).join(', ')}) não têm números: não entram no prompt.</p>
<div class="duas-tabelas">${tabelaDoBaralho('Contexto', C)}${tabelaDoBaralho('Persona', P)}</div>
</section>
<section class="page doc gab-pag">
<h1>Gabarito do professor <small>continuação</small></h1>
<div class="duas-tabelas">
  ${tabelaDoBaralho('Formato', F)}
  <div>
    <h2>Da soma para a nota (de 1 a 4)</h2>
    <p class="small2">A nota é a soma dos 9 números dividida por 9. A maior soma possível é 33 (nota 3,7): nenhuma carta é perfeita nos 3 assuntos.</p>
    <p class="conversao">${conversao.join(' ')}</p>
    <h2>As melhores cartas de cada missão</h2>
    <p class="small2">As 2 cartas de cada baralho que mais somam, com a soma entre parênteses.</p>
    ${TRIOS.map((trio) => `<p class="small2 trio-gab"><b>${M.filter((m) => m.assuntos.join('') === trio.join('')).map((m) => m.codigo).join(', ')}</b> (${trio.map((a) => ASSUNTO[a].ico).join(' ')})<br>${melhoresDoTrio(trio)}</p>`).join('')}
  </div>
</div>
<p class="small2"><b>Para imprimir as cartas:</b> o arquivo de cartas tem ${cartas.length} cartas (${M.length} missões, ${C.length + 1} contextos, ${P.length + 1} personas e ${F.length + 1} formatos, contando as 3 especiais) em ${folhas.length} folhas de frente, cada uma seguida da folha do verso. Cole o verso atrás da frente antes de cortar, ou imprima dos dois lados do papel, virando na borda longa. Papel mais grosso ou cartolina deixa as cartas melhores de embaralhar.</p>
</section>`;

// ---------------------------------------------------------------- estilo das folhas

const css = `
@page { size: A4 portrait; margin: 0; }
* { box-sizing: border-box; }
body { margin: 0; font-family: 'Segoe UI', Arial, sans-serif; color: #1b1f2a; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.page { width: 210mm; height: 297mm; page-break-after: always; break-after: page; overflow: hidden; background: #fff; position: relative; }
.grid { display: grid; grid-template-columns: repeat(3, 63mm); grid-template-rows: repeat(3, 88mm); justify-content: center; align-content: center; }

.t-missao { --c: #c98a00; --claro: #fff6dc; } .t-persona { --c: #6d3fc0; --claro: #f1ebfb; }
.t-contexto { --c: #1f5fd1; --claro: #e8f0fd; } .t-formato { --c: #e06c00; --claro: #fff0e2; }
.a-S { color: #c62828; }

.card { width: 63mm; height: 88mm; border: 0.3mm dashed #9aa3b5; padding: 3mm; display: flex; flex-direction: column; gap: 1.6mm; position: relative; }
.card::before { content: ''; position: absolute; inset: 1.6mm; border: 0.6mm solid var(--c); border-radius: 3mm; pointer-events: none; }
.hd { background: var(--c); color: #fff; border-radius: 2mm; padding: 1.2mm 2.4mm; display: flex; justify-content: space-between; font-weight: 800; font-size: 8.5pt; letter-spacing: .06em; position: relative; }
.code { font-weight: 700; background: rgba(255,255,255,.25); border-radius: 1mm; padding: 0 1.4mm; }
.assuntos-missao { display: flex; flex-wrap: wrap; gap: 1mm; margin: 0 1mm; }
.chip-assunto { display: inline-flex; align-items: center; gap: 1mm; padding: .5mm 1.8mm .5mm .5mm; background: var(--claro); border-radius: 5mm; font-size: 7.8pt; font-weight: 800; }
.chip-assunto .ico { width: 5.4mm; height: 5.4mm; border-radius: 50%; background: #fff; display: inline-flex; align-items: center; justify-content: center; font-size: 8.6pt; line-height: 1; }
.body { flex: 1; padding: 0 1.5mm; display: flex; flex-direction: column; justify-content: flex-start; gap: 1.4mm; }
.body.center { justify-content: center; text-align: center; }
.pedido { font-size: 12.4pt; font-weight: 800; line-height: 1.28; margin: .5mm 0 0; }
.pense { font-size: 7.4pt; color: #4a5368; font-style: italic; margin: 0 1.5mm; line-height: 1.3; }
.txt { font-size: 10.6pt; line-height: 1.32; margin: 0; }
.big { font-size: 12pt; font-weight: 800; margin: 0; line-height: 1.2; }
.emblema { width: 11mm; height: 11mm; padding: 2mm; margin: 0 auto 1mm; border-radius: 50%; background: var(--claro); color: var(--c); flex: none; }
/* A imagem de cada carta: um desenho colorido num círculo da cor do baralho */
.imagem { width: 17mm; height: 17mm; margin: 0 auto .6mm; border-radius: 50%; background: var(--claro); border: .5mm solid var(--c); flex: none;
  display: flex; align-items: center; justify-content: center; font-size: 27pt; line-height: 1; font-family: 'Segoe UI Emoji', 'Noto Color Emoji', 'Apple Color Emoji', sans-serif; }
.imagem.pequena { width: 12.5mm; height: 12.5mm; font-size: 19pt; margin-bottom: 0; }
.imagem.grande { width: 24mm; height: 24mm; font-size: 40pt; border-width: .8mm; }
.especial .body { background: radial-gradient(circle at 50% 30%, var(--claro) 0 38%, transparent 70%); border-radius: 2mm; }
.especial .hd { background: linear-gradient(90deg, var(--c), #c98a00); }
.poder { font-size: 11pt; font-weight: 800; color: var(--c); margin: 0; line-height: 1.25; }
.especial .efeito { font-size: 8pt; }
.faz { font-size: 9pt; line-height: 1.32; margin: 0; }
.efeito { font-size: 8.2pt; margin: 0; line-height: 1.35; color: #2b3245; }
.t-persona .efeito { background: var(--claro); border-radius: 2mm; padding: 1.2mm 1.6mm; }
.desenho { color: var(--c); margin: .6mm auto; width: 34mm; }
.desenho svg { width: 100%; height: auto; display: block; }
.ft { font-size: 6.3pt; line-height: 1.3; color: #4a5368; border-top: 0.3mm solid #d6dbe6; padding: 1mm 1.5mm 0; margin: 0 .5mm .5mm; }
.ft b { color: var(--c); }

/* Verso: o nome do baralho, com listras claras (gasta pouca tinta) */
.verso-carta::before { display: none; }
.verso-miolo { flex: 1; border: 1mm solid var(--c); border-radius: 3mm; color: var(--c); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1.6mm; text-align: center;
  background: repeating-linear-gradient(45deg, var(--claro) 0 2.6mm, #fff 2.6mm 5.2mm); }
.verso-ico { width: 20mm; height: 20mm; background: #fff; border-radius: 50%; padding: 3mm; border: .6mm solid var(--c); }
.verso-nome { margin: 1mm 0 0; font-size: 17pt; font-weight: 900; letter-spacing: .08em; background: #fff; padding: 0 2.4mm; border-radius: 1.4mm; }
.verso-sub { margin: 0; font-size: 9pt; font-weight: 700; background: #fff; padding: 0 2mm; border-radius: 1.4mm; color: #2b3245; }
.verso-jogo { margin: 3mm 0 0; font-size: 8pt; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; background: var(--c); color: #fff; padding: .6mm 2.4mm; border-radius: 1.4mm; }
.vaga { width: 63mm; height: 88mm; }
.rotulo-folha { position: absolute; top: 6mm; left: 0; right: 0; margin: 0; text-align: center; font-size: 8pt; color: #6b7489; }
.rotulo-folha b { color: #1b1f2a; }

/* Folhas de texto */
.doc { padding: 10mm 12mm; font-size: 9.2pt; line-height: 1.34; }
.regras { font-size: 10.3pt; line-height: 1.38; }
.doc h1 { font-size: 18pt; margin: 0 0 2.5mm; } .doc h1 small { display: block; font-size: 9pt; font-weight: 500; color: #4a5368; }
.doc h2 { font-size: 11.5pt; margin: 3.2mm 0 1.2mm; color: #1f5fd1; }
.doc p { margin: 0 0 1.4mm; }
.doc ul, .doc ol { margin: 0 0 1mm; padding-left: 5mm; } .doc li { margin-bottom: 1mm; }
.cols { display: grid; grid-template-columns: 1fr 1fr; gap: 7mm; align-items: start; }
.objetivo { background: #fff6dc; border: 0.4mm solid #e0b84a; border-radius: 2mm; padding: 2.4mm 3mm; font-size: 10.6pt; }
.vez-passos { font-size: 10.3pt; } .vez-passos li { margin-bottom: 1.3mm; }
.sem-quebra { white-space: nowrap; }
.exemplo { margin-top: 3mm; border-left: 1.2mm solid #c98a00; background: #fff6dc; border-radius: 0 2mm 2mm 0; padding: 2.2mm 3mm; font-size: 9.2pt; line-height: 1.35; }
.exemplo p { margin: 0 0 1.2mm; } .exemplo p:last-child { margin: 0; }
.exemplo-t { font-weight: 800; font-size: 9pt; letter-spacing: .06em; text-transform: uppercase; color: #8a5a00; }
.exemplo-missao { font-style: italic; }
.nota-tab { width: 100%; border-collapse: collapse; margin: 1mm 0 1.6mm; } .nota-tab td { border: 0.3mm solid #e0c27a; padding: 1.2mm 2mm; font-size: 9.6pt; } .nota-tab td:last-child { text-align: right; font-weight: 700; white-space: nowrap; }
.nota-tab b { color: #8a5a00; }
.ganha { background: #e3f4ea; border: 0.4mm solid #7cc49c; border-radius: 2mm; padding: 1.8mm 2.6mm; }
.pequeno { font-size: 9pt; }
.mesa { margin-top: 3mm; border: 0.4mm dashed #9aa3b5; border-radius: 3mm; padding: 2.4mm 3mm 2.6mm; background: #f6f8fc; text-align: center; }
.mesa-t { font-weight: 800; font-size: 9pt; margin: 0 0 1mm !important; color: #4a5368; letter-spacing: .06em; text-transform: uppercase; }
.mesa-fila { display: flex; justify-content: center; gap: 3mm; margin: 1.6mm 0; }
.mini { width: 19mm; height: 26mm; border-radius: 1.6mm; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: .6mm; font-size: 8pt; font-weight: 800; color: #fff; }
.mini small { font-size: 6pt; font-weight: 600; line-height: 1.2; padding: 0 1mm; }
.mini.m { background: #c98a00; } .mini.c { background: #1f5fd1; } .mini.p { background: #6d3fc0; } .mini.f { background: #e06c00; }
.mesa-mao { margin: 1.4mm 0 0 !important; font-size: 8.6pt; font-weight: 700; }
.mesa-fila.baralho { gap: 2mm; margin: 0; align-items: center; justify-content: flex-start; }
.mesa-corpo { display: flex; align-items: center; justify-content: center; gap: 3mm; }
.mesa-baralhos { display: flex; flex-direction: column; gap: 1.4mm; }
.mesa-fila.baralho .mini { width: 16mm; height: 11.5mm; font-size: 7.2pt; }
.abertas { display: flex; align-items: center; gap: 1mm; font-size: 6.6pt; font-weight: 700; color: #4a5368; }
.abertas small { width: 9mm; line-height: 1.1; text-align: left; }
.aberta { width: 7.4mm; height: 10.4mm; border-radius: 1mm; background: #fff; border: .5mm solid; }
.aberta.c { border-color: #1f5fd1; } .aberta.p { border-color: #6d3fc0; } .aberta.f { border-color: #e06c00; }
.especiais { margin-top: 1.6mm; border: 0.4mm solid #c98a00; background: #fffaf0; border-radius: 2mm; padding: 1.6mm 2.4mm; font-size: 9.4pt; line-height: 1.36; }
.especiais p { margin: 0 0 .8mm; } .especiais p:last-child { margin: 0; }
.especiais-t { font-weight: 800; color: #8a5a00; } .especiais-t span { font-weight: 700; color: #1b1f2a; margin-left: 1.4mm; }
.vira { margin: 3mm 0 0; text-align: right; font-size: 8.6pt; font-weight: 700; color: #4a5368; }
.regras-verso h2 { margin-top: 5mm; }
.comeca { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3mm; }
.comeca > div { display: flex; gap: 2mm; align-items: flex-start; background: #eef2f8; border-radius: 2mm; padding: 2.4mm 2.6mm; }
.comeca p { margin: 0; font-size: 9.6pt; }
.comeca-n { flex: none; width: 6mm; height: 6mm; border-radius: 50%; background: #1f5fd1; color: #fff; font-weight: 800; font-size: 9pt; display: flex; align-items: center; justify-content: center; }
.versoes { display: grid; grid-template-columns: 1fr 1fr; gap: 3mm; }
.versoes.tres { grid-template-columns: repeat(3, 1fr); }
.versao { border: 0.4mm solid #c9cfdb; border-radius: 2mm; padding: 2.4mm 2.8mm; }
.versao.destaque { border: 0.6mm solid #1f5fd1; background: #f2f6fd; }
.versao p { margin: 0 0 1mm; font-size: 9.6pt; } .versao p:last-child { margin: 0; }
.versao-t { font-weight: 800; font-size: 11pt !important; color: #1b1f2a; }
.versao-n { font-weight: 700; color: #1f5fd1; }
.regras-verso .exemplo { margin-top: 5mm; font-size: 9.8pt; }
.aviso { background: #eef2f8; border-radius: 2mm; padding: 2mm 3mm; font-size: 8.4pt; color: #4a5368; margin-top: 3mm; }
.gab-pag { font-size: 9pt; }
table.gab { width: 100%; border-collapse: collapse; margin-bottom: 1.6mm; } .gab th, .gab td { border: 0.3mm solid #c9cfdb; padding: 1mm 1.8mm; text-align: left; vertical-align: top; font-size: 8.4pt; } .gab th { background: #eef2f8; }
.gab.num td, .gab.num th { padding: .8mm 1.4mm; font-size: 8.2pt; vertical-align: middle; }
.gab .n { width: 7mm; text-align: center; font-variant-numeric: tabular-nums; }
.gab .v4 { font-weight: 800; background: #e3f4ea; } .gab .v1 { color: #b42318; background: #fde8e7; }
.duas-tabelas { display: grid; grid-template-columns: 1fr 1fr; gap: 5mm; align-items: start; }
.legenda { font-size: 8.4pt; color: #4a5368; }
.small2 { font-size: 8.6pt; line-height: 1.45; }
.conversao { font-size: 8.8pt; line-height: 1.7; display: flex; flex-wrap: wrap; gap: 0 3mm; }
.trio-gab { border-top: 0.3mm solid #d6dbe6; padding-top: 1.2mm; }
`;

// Só as cartas, para imprimir (frente e verso)
const pagina = (titulo, corpo) => `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>${titulo}</title><style>${css}</style></head><body>${corpo}</body></html>`;
fs.writeFileSync(path.join(__dirname, 'cartas.html'), pagina(`${NOME} · cartas (frente e verso)`, paginasDeCartas.join('\n')));
console.log(`cartas: ${cartas.length} em ${folhas.length} folhas de frente e ${folhas.length} de verso`);
// A folha de regras e o gabarito ficam à parte (não precisam ir para a impressão das cartas)
fs.writeFileSync(path.join(__dirname, 'regras-e-gabarito.html'), pagina(`${NOME} · regras e gabarito`, `${regras}${gabarito}`));
console.log(`regras e gabarito: ${(`${regras}${gabarito}`.match(/<section class="page/g) || []).length} páginas`);

// ---------------------------------------------------------------- Manual do Professor

const manual = require('./manual.cjs')({
  NOME, GRUPO, ENDERECO_DO_APP, RODADAS, RODADAS_RAPIDA, ABERTAS, MAX_LADOS, ESPECIAIS, poderDa, REGRA_DO_ROUBO,
  ASSUNTO, ORDEM, MINUSCULOS, M, C, P, F, cartas, folhas: folhas.length, cartaPorCodigo, versoPorTipo,
  exemplo, NOTA, esc, icone, semParenteses, minuscula, cssDasCartas: css,
});
fs.writeFileSync(path.join(__dirname, 'manual.html'), manual.html);
console.log(`manual: ${manual.paginas} páginas`);

// ---------------------------------------------------------------- tabuleiro e manual iconográfico

// O tabuleiro da mesa: o lugar dos montes, das abertas e da missão (2 folhas A4 que formam um A3)
const tabuleiro = require('./tabuleiro.cjs')({ NOME, GRUPO, ABERTAS, ESPECIAIS, emblema, cssDasCartas: css });
fs.writeFileSync(path.join(__dirname, 'tabuleiro.html'), tabuleiro.html);
console.log(`tabuleiro: ${tabuleiro.paginas} folhas`);

// O manual iconográfico: cores, símbolos, imagens das cartas e ícones do aplicativo
const iconografico = require('./iconografico.cjs')({
  NOME, GRUPO, ABERTAS, ASSUNTO, ORDEM, C, P, F, ESPECIAIS, poderDa, cartaPorCodigo, versoPorTipo,
  desenho, emblema, esc, semParenteses, cssDasCartas: css, tabuleiro,
});
fs.writeFileSync(path.join(__dirname, 'iconografico.html'), iconografico.html);
console.log(`manual iconográfico: ${iconografico.paginas} páginas`);

// ---------------------------------------------------------------- dados do aplicativo do professor

const linhas = [
  ...M.map((m) => ({ codigo: m.codigo, tipo: m.tipo, nome: m.nome, assuntos: m.assuntos })),
  ...C.map((c) => ({ codigo: c.codigo, tipo: c.tipo, nome: c.nome, texto: c.texto, ico: c.ico, combina: c.combina })),
  ...P.map((p) => ({ codigo: p.codigo, tipo: p.tipo, nome: p.nome, texto: p.texto, prompt: p.prompt, ico: p.ico, combina: p.combina })),
  ...F.map((f) => ({ codigo: f.codigo, tipo: f.tipo, nome: f.nome, texto: f.texto, ico: f.ico, combina: f.combina })),
];
const especiaisDoApp = Object.entries(ESPECIAIS).map(([tipo, e]) => ({ tipo, nome: e.nome, ico: e.ico, poder: poderDa(e) }));

const dadosJs = `// Dados das cartas do ${NOME}, versão "Rodadas" com as cartas abertas (16/11/2026): ${linhas.length} cartas com código.
// Gerado por cartas/gerar.cjs, a mesma lista das cartas impressas. Para mudar uma carta, edite lá e rode node cartas/gerar.cjs.
// Missão: "assuntos" são os 3 assuntos dela (S Saúde, E Esporte, T Tecnologia, A Meio ambiente).
// Contexto, persona e formato: "combina" diz quanto a carta combina com cada assunto, de 1 (nada) a 4 (muito).
// Esses números ficam escondidos dos alunos: a conta da nota está em js/nota.js. "ico" é a imagem da carta.
const DADOS = {
  nomeDoJogo: ${JSON.stringify(NOME)},
  cartas: [
${linhas.map((l) => `    ${JSON.stringify(l)},`).join('\n')}
  ],
  // A carta especial de cada baralho: sem número, não entra no prompt
  especiais: ${JSON.stringify(especiaisDoApp)},
  regraDoRoubo: ${JSON.stringify(REGRA_DO_ROUBO)}, // a mesma frase das cartas especiais
  // Nome, símbolo (igual ao das cartas) e nome no meio da frase de cada assunto
  assuntos: ${JSON.stringify(ASSUNTO)},
  // Números da regra (de teste)
  rodadas: ${RODADAS},
  rodadasRapida: ${RODADAS_RAPIDA}, // a partida rápida
  cartasAbertas: ${ABERTAS}, // em cada baralho, na mesa
  duracaoDaVez: ${VEZ_SEGUNDOS}, // segundos
  maximoDeLados: ${MAX_LADOS},
  totalDeMissoes: ${M.length},
};

// Índice para achar uma carta pelo código, por exemplo DADOS.porCodigo.C01
DADOS.porCodigo = Object.fromEntries(DADOS.cartas.map((c) => [c.codigo, c]));
DADOS.missoes = DADOS.cartas.filter((c) => c.tipo === 'Missão');
`;
fs.writeFileSync(path.join(APP, 'js', 'dados.js'), dadosJs.replace(/\r?\n/g, '\r\n'));
console.log(`dados.js: ${linhas.length} códigos`);

// O nome que aparece quando o professor instala o aplicativo no celular
const manifesto = {
  name: `${NOME} · aplicativo do professor`,
  short_name: NOME,
  description: `Placar das rodadas, nota dos prompts e desafio final do jogo ${NOME}. Funciona sem internet.`,
  lang: 'pt-BR',
  start_url: './index.html',
  scope: './',
  display: 'standalone',
  orientation: 'portrait',
  background_color: '#f3f5f9',
  theme_color: '#16274f',
  icons: [
    { src: 'icones/icone-192.png', sizes: '192x192', type: 'image/png' },
    { src: 'icones/icone-512.png', sizes: '512x512', type: 'image/png' },
    { src: 'icones/icone-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    { src: 'icones/icone.svg', sizes: 'any', type: 'image/svg+xml' },
  ],
};
fs.writeFileSync(path.join(APP, 'manifest.webmanifest'), `${JSON.stringify(manifesto, null, 2)}\n`.replace(/\r?\n/g, '\r\n'));
console.log('manifest: ok');
