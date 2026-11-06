// Magic Prompt · versão simplificada para o playtest (11/11/2026).
// Uma lista de dados só: dela saem as cartas, o tabuleiro, as regras de 1 página,
// o gabarito do professor e o js/dados.js do companion app.
// Uso: node cartas/gerar.cjs   (gera cartas/playtest.html e app/js/dados.js)
// Para imprimir: abra cartas/playtest.html no Chrome, Ctrl+P, "Salvar como PDF", margens "Nenhuma".
const fs = require('fs');
const path = require('path');

const APP = path.join(__dirname, '..', 'app');

// ---------------------------------------------------------------- dados

const ASSUNTO = {
  S: { nome: 'Saúde', ico: '✚' },
  E: { nome: 'Esporte', ico: '⚽' },
  T: { nome: 'Tecnologia', ico: '💻' },
  A: { nome: 'Meio ambiente', ico: '🌳' },
};

// [código, nome, como fica]
const formatos = [
  ['F01', 'Lista curta (3 itens)', '3 tópicos curtos, um em cada linha.'],
  ['F02', 'Passo a passo', 'Etapas numeradas, na ordem de fazer.'],
  ['F03', 'Resumo em 2 frases', 'Só o mais importante, em 2 frases.'],
  ['F04', 'Pergunta e resposta', 'As dúvidas de quem lê, cada uma com a resposta.'],
  ['F05', 'Tabela', 'Linhas e colunas para comparar ou organizar.'],
  ['F06', 'Mapa mental', 'Um tema no meio e as ideias ligadas a ele.'],
  ['F07', 'Cartaz (título e 3 frases)', 'Um título que chama atenção e 3 frases curtas.'],
  ['F08', 'Diálogo curto', 'Uma conversa curta entre duas pessoas.'],
  ['F09', 'Linha do tempo', 'Os fatos em ordem, do mais antigo ao mais novo.'],
];
const COPIAS_FORMATO = 2;

// [código, assunto, pedido, formatos que servem]
const missoes = [
  ['M01', 'S', 'Explique a dengue para uma criança de 10 anos.', ['F01', 'F03', 'F08']],
  ['M02', 'S', 'Crie um cardápio de lanche saudável para a semana.', ['F05', 'F07']],
  ['M03', 'S', 'Faça um aviso para os alunos beberem mais água.', ['F07', 'F01']],
  ['M04', 'E', 'Monte um aquecimento seguro para a aula de Educação Física.', ['F02', 'F01']],
  ['M05', 'E', 'Conte a história de um esporte, do começo até hoje.', ['F09', 'F03']],
  ['M06', 'T', 'Ensine os avós a criar uma senha forte.', ['F02', 'F08']],
  ['M07', 'T', 'Explique para a turma como evitar golpes na internet.', ['F01', 'F04']],
  ['M08', 'T', 'Mostre como a internet mudou desde que seus pais eram crianças.', ['F09', 'F05']],
  ['M09', 'A', 'Crie um plano para a escola separar o lixo.', ['F02', 'F06']],
  ['M10', 'A', 'Explique o aquecimento global para os alunos da escola.', ['F07', 'F06', 'F04']],
];

// [código, assunto, nome, texto] (5 por assunto, sem dado pessoal nem viés)
const contextos = [
  ['C01', 'S', 'Dengue em Recife', 'Moro em Recife. No verão, a cidade tem muitos casos de dengue.'],
  ['C02', 'S', 'Gripe em Nova York', 'Sou enfermeira em Nova York e atendo muitas crianças com gripe no inverno.'],
  ['C03', 'S', 'Lanche em Miami', 'Na minha escola em Miami, muitos alunos comem fast-food todo dia.'],
  ['C04', 'S', 'Mãos limpas em Cantão', 'Em Cantão, a escola ensina os alunos a lavar as mãos do jeito certo.'],
  ['C05', 'S', 'Merenda em Roma', 'Sou nutricionista em Roma e monto o cardápio da merenda.'],
  ['C06', 'E', 'Basquete em Chicago', 'Sou técnico de basquete numa escola de Chicago e os alunos se cansam rápido.'],
  ['C07', 'E', 'Futsal da escola', 'Treino o time de futsal da escola, com meninos e meninas.'],
  ['C08', 'E', 'Tai chi em Xangai', 'Em Xangai, muitos alunos fazem tai chi no parque antes da aula.'],
  ['C09', 'E', 'Críquete na Índia', 'Na minha cidade, na Índia, o críquete é o esporte mais jogado pelas crianças.'],
  ['C10', 'E', 'Corrida em Boston', 'Em Boston, a corrida da escola é no inverno, com muito frio.'],
  ['C11', 'T', 'Informática em Manaus', 'Dou aula de informática numa escola de Manaus com poucos computadores.'],
  ['C12', 'T', 'Tecnologia em Bangalore', 'Em Bangalore, muitas pessoas mais velhas estão aprendendo a usar tecnologia.'],
  ['C13', 'T', 'Pagamento em Hangzhou', 'Em Hangzhou, quase todo mundo paga as compras com o celular.'],
  ['C14', 'T', 'Escola digital na Estônia', 'Na Estônia, as escolas usam o computador em quase todas as aulas.'],
  ['C15', 'T', 'Vale do Silício', 'No Vale do Silício, as empresas criam aplicativos usados no mundo todo.'],
  ['C16', 'A', 'Queimadas na Amazônia', 'Moro perto da Amazônia e vejo a fumaça das queimadas.'],
  ['C17', 'A', 'Incêndios na Califórnia', 'Na Califórnia, os verões estão mais secos e há incêndios nas florestas.'],
  ['C18', 'A', 'Troca verde em Curitiba', 'Em Curitiba, a prefeitura troca lixo reciclável por comida.'],
  ['C19', 'A', 'Energia solar em Copenhague', 'Em Copenhague, a escola tem painéis solares no telhado.'],
  ['C20', 'A', 'Lixo na calçada', 'Um morador do bairro reclama do lixo na calçada.'],
];

// [código, assunto, nome, como entra no prompt]
const personas = [
  ['P01', 'S', 'Médica de posto de saúde', 'Você é médica de posto de saúde.'],
  ['P02', 'S', 'Nutricionista', 'Você é nutricionista.'],
  ['P03', 'E', 'Técnica de futebol', 'Você é técnica de futebol.'],
  ['P04', 'E', 'Professor de Educação Física', 'Você é professor de Educação Física.'],
  ['P05', 'T', 'Engenheiro de software', 'Você é engenheiro de software.'],
  ['P06', 'T', 'Especialista em segurança na internet', 'Você é especialista em segurança na internet.'],
  ['P07', 'A', 'Bióloga', 'Você é bióloga.'],
  ['P08', 'A', 'Engenheira ambiental', 'Você é engenheira ambiental.'],
];

// Poderes: o número é o custo em pontos. ① e ② são iguais para todas as nações.
// efeito: cura (ganha vida), dano (tira vida de um lado), roubo (pega pontos de um lado),
// bloqueio (um lado sem poderes), espelho (devolve o poder) e manual (o professor aplica).
const VIDA = 10;
const CURA = { n: '①', nome: 'Cura', custo: 1, texto: 'ganhe 3 de vida', efeito: 'cura', valor: 3 };
const ATAQUE = { n: '②', nome: 'Ataque', custo: 2, texto: 'tire 4 de vida de um lado', efeito: 'dano', valor: 4 };
const nacoes = [
  ['N1', 'Brasil', 'Ataca forte', { n: '③', nome: 'Golaço', custo: 3, texto: 'tire 8 de vida de um lado', efeito: 'dano', valor: 8 }],
  ['N2', 'Índia', 'Devolve o golpe', { n: '③', nome: 'Espelho', custo: 3, texto: 'quando alguém usar um poder contra você, cancele e devolva o efeito para quem usou', efeito: 'espelho', valor: 0 }],
  ['N3', 'EUA', 'Compra pontos', { n: '③', nome: 'Compra no mercado', custo: 3, texto: 'pegue 3 pontos de um lado', efeito: 'roubo', valor: 3 }],
  ['N4', 'China', 'Produz mais', { n: '③', nome: 'Linha de produção', custo: 3, texto: 'monte outro prompt para a mesma missão e ganhe as estrelas de novo', efeito: 'manual', valor: 0 }],
  ['N5', 'União Europeia', 'Fiscaliza', { n: '③', nome: 'Fiscalização', custo: 3, texto: 'deixe um lado sem poderes até o fim do próximo turno dele', efeito: 'bloqueio', valor: 0 }],
];
const poderesDe = (especial) => [CURA, ATAQUE, especial];

const TURNO_SEGUNDOS = 60;
const nomeFormato = Object.fromEntries(formatos.map(([c, n]) => [c, n]));
const curto = (codigo) => nomeFormato[codigo].replace(/ \(.*\)$/, '');
const ouLista = (itens) => (itens.length > 1 ? `${itens.slice(0, -1).join(', ')} ou ${itens[itens.length - 1]}` : itens[0]);

// conferências simples: cada assunto tem 5 contextos e 2 personas; cada formato é aceito por alguma missão
for (const a of Object.keys(ASSUNTO)) {
  if (contextos.filter((c) => c[1] === a).length !== 5) throw new Error(`contextos de ${a}`);
  if (personas.filter((p) => p[1] === a).length !== 2) throw new Error(`personas de ${a}`);
}
for (const [c] of formatos) if (!missoes.some((m) => m[3].includes(c))) throw new Error(`formato sem missão: ${c}`);

// ---------------------------------------------------------------- cartas

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const selo = (a) => `<div class="assunto"><span class="ico a-${a}">${ASSUNTO[a].ico}</span>${ASSUNTO[a].nome}</div>`;

// Desenho pequeno de cada formato (mostra como a resposta fica)
const SVG = (miolo) => `<svg viewBox="0 0 100 36" aria-hidden="true">${miolo}</svg>`;
const L = (x1, y1, x2, y2, w = 2.4) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="currentColor" stroke-width="${w}" stroke-linecap="round"/>`;
const T = (x, y, t, s = 8) => `<text x="${x}" y="${y}" font-size="${s}" font-weight="800" fill="currentColor" font-family="Segoe UI, Arial">${t}</text>`;
const desenho = {
  F01: SVG(`<g fill="currentColor"><circle cx="10" cy="8" r="2.6"/><circle cx="10" cy="18" r="2.6"/><circle cx="10" cy="28" r="2.6"/></g>${L(18, 8, 84, 8)}${L(18, 18, 70, 18)}${L(18, 28, 78, 28)}`),
  F02: SVG(`${T(6, 11, '1')}${T(6, 21, '2')}${T(6, 31, '3')}${L(18, 8, 84, 8)}${L(18, 18, 72, 18)}${L(18, 28, 80, 28)}`),
  F03: SVG(`${L(8, 10, 92, 10)}${L(8, 19, 52, 19)}<circle cx="58" cy="19" r="1.8" fill="currentColor"/>${L(8, 28, 80, 28)}<circle cx="86" cy="28" r="1.8" fill="currentColor"/>`),
  F04: SVG(`${T(6, 13, 'P')}${L(18, 10, 76, 10)}${T(80, 13, '?')}${T(6, 29, 'R')}${L(18, 26, 88, 26)}`),
  F05: SVG(`<rect x="8" y="3" width="84" height="30" rx="2" fill="none" stroke="currentColor" stroke-width="2"/>${L(36, 3, 36, 33, 2)}${L(64, 3, 64, 33, 2)}${L(8, 13, 92, 13, 2)}${L(8, 23, 92, 23, 2)}`),
  F06: SVG(`<rect x="38" y="12" width="24" height="12" rx="4" fill="currentColor"/>${L(38, 18, 16, 8, 2)}${L(38, 18, 16, 28, 2)}${L(62, 18, 84, 8, 2)}${L(62, 18, 84, 28, 2)}<g fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="7" r="4"/><circle cx="12" cy="29" r="4"/><circle cx="88" cy="7" r="4"/><circle cx="88" cy="29" r="4"/></g>`),
  F07: SVG(`<rect x="24" y="1" width="52" height="34" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><rect x="30" y="6" width="40" height="7" rx="1.5" fill="currentColor"/>${L(31, 19, 69, 19, 2)}${L(31, 25, 64, 25, 2)}${L(31, 31, 67, 31, 2)}`),
  F08: SVG(`<rect x="6" y="3" width="50" height="13" rx="6" fill="none" stroke="currentColor" stroke-width="2"/><rect x="44" y="20" width="50" height="13" rx="6" fill="currentColor"/>${L(14, 9.5, 46, 9.5, 2)}`),
  F09: SVG(`${L(6, 20, 94, 20, 2.4)}<g fill="currentColor"><circle cx="14" cy="20" r="4"/><circle cx="38" cy="20" r="4"/><circle cx="62" cy="20" r="4"/><circle cx="86" cy="20" r="4"/></g>${T(8, 34, '1890', 7)}${T(32, 34, '1950', 7)}${T(56, 34, '2000', 7)}${T(79, 34, 'hoje', 7)}`),
};

const cartas = [];
const carta = (cls, codigo, tipo, miolo) => cartas.push(
  `<div class="card ${cls}"><div class="hd"><span>${tipo}</span><span class="code">${codigo}</span></div>${miolo}</div>`);

missoes.forEach(([c, a, pedido]) => carta('t-missao', c, 'MISSÃO', `
  ${selo(a)}
  <div class="body"><p class="pedido">“${esc(pedido)}”</p>
  <p class="pense">Pense: quem vai ler? Que formato ajuda essa pessoa?</p></div>
  <div class="monte">Monte o prompt com<br><b>1 contexto + 1 persona + 1 formato</b></div>
  <div class="estrelas"><span><b>★★★</b> 3 certas</span><span><b>★★</b> 2</span><span><b>★</b> 0 ou 1</span></div>
  <div class="ft">Leia em voz alta. Depois, ela vai para “missões feitas”.</div>`));

contextos.forEach(([c, a, nome, texto]) => carta('t-contexto', c, 'CONTEXTO', `
  ${selo(a)}
  <div class="body"><p class="nome">${esc(nome)}</p><p class="txt">“${esc(texto)}”</p></div>
  <div class="ft">A situação: de onde você fala e o que está acontecendo.</div>`));

personas.forEach(([c, a, nome, frase]) => carta('t-persona', c, 'PERSONA', `
  ${selo(a)}
  <div class="body center"><p class="big">${esc(nome)}</p><p class="efeito">No prompt:<br>“${esc(frase)}”</p></div>
  <div class="ft">Quem a IA vai ser ao responder.</div>`));

formatos.forEach(([c, nome, como]) => {
  for (let i = 0; i < COPIAS_FORMATO; i++) carta('t-formato', c, 'FORMATO', `
  <div class="body center"><p class="big">${esc(nome)}</p><div class="desenho">${desenho[c]}</div><p class="efeito">${esc(como)}</p></div>
  <div class="ft">Como a resposta chega para quem vai ler.</div>`);
});

nacoes.forEach(([c, nome, lema, especial]) => carta('t-nacao', c, 'NAÇÃO', `
  <div class="body center tight"><p class="big">${esc(nome)}</p><p class="lema">${esc(lema)}</p>
  <div class="poderes"><p class="pt">PODERES · o número é o custo em pontos</p>${poderesDe(especial).map((p) => (
    `<p class="pd${p === especial ? ' especial' : ''}"><b>${p.n} ${esc(p.nome)}</b> ${esc(p.texto)}</p>`)).join('')}</div>
  <p class="vida">VIDA INICIAL <b>${VIDA}</b></p>
  <div class="track">${Array.from({ length: 21 }, (_, i) => `<span>${20 - i}</span>`).join('')}</div></div>
  <div class="ft">Cada poder 1 vez por turno. Vida 0: perde todos os pontos e volta com ${VIDA}.</div>`));

const folhasDeCartas = [];
for (let i = 0; i < cartas.length; i += 9) folhasDeCartas.push(`<section class="page grid">${cartas.slice(i, i + 9).join('')}</section>`);

// ---------------------------------------------------------------- tabuleiro

const vaga = (titulo, linha, nota = '') => `<div class="slot"><b>${titulo}</b><span>${linha}</span>${nota ? `<small>${nota}</small>` : ''}</div>`;
const bandeja = (cls, nome, simbolo) => `<div class="tray ${cls}">
  <div class="band"><span>${nome}</span></div>
  ${vaga(`${simbolo} Baralho`, 'virado para baixo', 'Nenhuma aberta serve? Pegue a de cima, sem olhar antes.')}
  ${vaga('Aberta', 'virada para cima')}${vaga('Aberta', 'virada para cima')}${vaga('Aberta', 'virada para cima')}
</div>`;

const passosDoTurno = `
  <li>Tire 1 missão do monte e leia em voz alta.</li>
  <li>Pegue <b>1 contexto, 1 persona e 1 formato</b>: de cada baralho, uma das 3 abertas ou a de cima do baralho.</li>
  <li>O professor digita os 4 códigos no app e dá a nota: <b>★ a ★★★</b>. Cada estrela vale 1 ponto.</li>
  <li>Se quiser, gaste pontos nos poderes da sua nação.</li>
  <li>A missão vai para “feitas”. As outras 3 cartas vão para baixo do baralho delas. Complete as abertas.</li>`;

const tabuleiro = `
<section class="page land tab">
  <div class="tray t-missao">
    <div class="band"><span>MISSÕES</span></div>
    ${vaga('Monte de missões', 'virado para baixo', 'Tire 1 no começo do seu turno.')}
    ${vaga('Missões feitas', 'viradas para cima')}
    <div class="turno">
      <p class="tt">Seu turno · até ${TURNO_SEGUNDOS} segundos</p>
      <ol>${passosDoTurno}</ol>
      <p class="est">Cada carta certa = 1 ★: <b>contexto</b> e <b>persona</b> do mesmo assunto da missão e <b>formato</b> que ajuda quem vai ler.<br><b>★★★</b> 3 certas · <b>★★</b> 2 certas · <b>★</b> 0 ou 1</p>
    </div>
  </div>
  ${bandeja('t-contexto', 'CONTEXTO', '')}
  <p class="folha">Tabuleiro · folha 1 de 2 · a folha 2 (persona e formato) fica logo abaixo desta</p>
</section>
<section class="page land tab">
  ${bandeja('t-persona', 'PERSONA', '')}
  ${bandeja('t-formato', 'FORMATO', '')}
  <p class="folha">Tabuleiro · folha 2 de 2 · cole embaixo da folha 1, ou ponha as duas lado a lado na mesa</p>
</section>`;

// ---------------------------------------------------------------- regras (1 página)

const especiais = nacoes.map(([, nome, , p]) => `<li><b>${esc(nome)} · ${p.n} ${esc(p.nome)}:</b> ${esc(p.texto)}.</li>`).join('');
const regras = `<section class="page doc regras">
<h1>Magic Prompt · Regras do playtest <small>versão simplificada · grupo NEXUS · 2 a 5 lados · cerca de 20 minutos</small></h1>
<p class="objetivo"><b>Objetivo:</b> montar o melhor prompt para cada missão. O professor confere no companion app, que dá de 1 a 3 estrelas. <b>Cada estrela é 1 ponto, e vence quem tiver mais pontos no fim.</b></p>

<div class="cols">
<div>
<h2>No jogo</h2>
<p>${missoes.length} missões · ${contextos.length} contextos · ${personas.length} personas · ${formatos.length * COPIAS_FORMATO} formatos (${formatos.length} tipos, ${COPIAS_FORMATO} de cada) · ${nacoes.length} nações · 1 tabuleiro de 2 folhas · o celular do professor com o app.</p>

<h2>Preparação</h2>
<ol>
<li>Monte o tabuleiro. Embaralhe cada baralho e ponha no lugar dele, virado para baixo: <b>Missões, Contexto, Persona e Formato</b>.</li>
<li>Vire <b>3 contextos, 3 personas e 3 formatos</b> para cima, nos espaços “aberta”.</li>
<li>Cada lado (1 aluno, uma dupla ou um grupo) escolhe 1 nação e põe a carta na sua frente. Todos começam com <b>${VIDA} de vida e 0 ponto</b>.</li>
<li>O professor abre a página Partida no app, cadastra os lados e toca em <b>Sortear</b> para ver quem começa. Depois, a vez segue no sentido horário.</li>
</ol>

<h2>O turno · até ${TURNO_SEGUNDOS} segundos</h2>
<ol>${passosDoTurno}</ol>
<p class="nota">Acabou o tempo? Vale o que já estiver na mesa: a carta que faltar não ganha estrela.</p>
</div>

<div>
<h2>Como ganhar estrelas</h2>
<p>Cada carta certa vale 1 estrela:</p>
<ul>
<li><b>Contexto</b> do mesmo assunto da missão.</li>
<li><b>Persona</b> do mesmo assunto da missão.</li>
<li><b>Formato</b> que ajuda quem vai ler. A missão não diz qual: leia o pedido e pense. Se errar, o app mostra quais serviam.</li>
</ul>
<p class="assuntos">Assuntos: ✚ Saúde · ⚽ Esporte · 💻 Tecnologia · 🌳 Meio ambiente</p>
<table class="nota-tab"><tr><td><b>★★★</b> 3 cartas certas</td><td>3 pontos</td></tr><tr><td><b>★★</b> 2 cartas certas</td><td>2 pontos</td></tr><tr><td><b>★</b> 0 ou 1 carta certa</td><td>1 ponto</td></tr></table>

<h2>Poderes · na carta da nação</h2>
<p>O número do poder é o custo em pontos. Cada poder pode ser usado 1 vez por turno, a qualquer momento da sua vez. O professor toca no poder no app, que desconta os pontos.</p>
<ul>
<li><b>① Cura</b> (todas): ganhe 3 de vida.</li>
<li><b>② Ataque</b> (todas): tire 4 de vida de um lado.</li>
${especiais}
</ul>
<p class="regra"><b>Vida chegou a 0:</b> o lado perde todos os pontos e volta com ${VIDA} de vida.</p>

<h2>Fim</h2>
<p>Todos jogam o mesmo número de turnos: <b>com 2 lados, 5 turnos cada; com 3, 3 turnos; com 4 ou 5, 2 turnos</b>. O app avisa quando acaba. Vence quem tiver mais pontos. Empate: ganha quem tiver mais vida. Querem mais? Embaralhem as missões feitas e joguem mais uma rodada.</p>
</div>
</div>
<p class="aviso">Números de teste: vida ${VIDA}, Cura 3, Ataque 4, Golaço 8, Compra no mercado 3 e turno de ${TURNO_SEGUNDOS} segundos. Anotem o que ficou fácil ou difícil demais para ajustar depois do playtest.</p>
</section>`;

// ---------------------------------------------------------------- gabarito do professor

const porAssunto = (lista) => Object.keys(ASSUNTO).map((a) => {
  const doAssunto = lista.filter((x) => x[1] === a);
  return `<b>${ASSUNTO[a].ico} ${ASSUNTO[a].nome}:</b> ${doAssunto.map((x) => `${x[0]} ${esc(x[2])}`).join(' · ')}`;
}).join('<br>');
const gabarito = `<section class="page doc gab-pag">
<h1>Gabarito do professor <small>use se o app não abrir · não misture com as cartas</small></h1>
<h2>Como dar a nota</h2>
<p>Conte as cartas certas do prompt: contexto do mesmo assunto da missão, persona do mesmo assunto e formato da lista abaixo. <b>3 certas = ★★★ (3 pontos) · 2 certas = ★★ (2) · 0 ou 1 = ★ (1).</b></p>
<h2>Missões e formatos que servem</h2>
<table class="gab"><tr><th>Missão</th><th>Assunto</th><th>Formatos que servem</th></tr>
${missoes.map(([c, a, pedido, fs]) => `<tr><td><b>${c}</b> ${esc(pedido)}</td><td>${ASSUNTO[a].ico} ${ASSUNTO[a].nome}</td><td>${fs.map((f) => `${f} ${esc(curto(f))}`).join(' · ')}</td></tr>`).join('')}
</table>
<h2>Contextos por assunto</h2>
<p class="small2">${porAssunto(contextos)}</p>
<h2>Personas por assunto</h2>
<p class="small2">${porAssunto(personas)}</p>
<h2>Formatos</h2>
<p class="small2">${formatos.map(([c, n]) => `${c} ${esc(n)}`).join(' · ')} <i>(${COPIAS_FORMATO} cópias de cada, com o mesmo código)</i></p>
<h2>Nações</h2>
<p class="small2">Todas começam com ${VIDA} de vida e têm ① Cura (1 ponto: ganhe 3 de vida) e ② Ataque (2 pontos: tire 4 de vida de um lado). O ③ muda:</p>
<p class="small2">${nacoes.map(([c, nome, , p]) => `<b>${c} ${esc(nome)}</b> · ${p.n} ${esc(p.nome)}: ${esc(p.texto)}`).join('<br>')}</p>
<p class="small2"><b>Para imprimir:</b> ${cartas.length} cartas (${missoes.length} missões, ${contextos.length} contextos, ${personas.length} personas, ${formatos.length * COPIAS_FORMATO} formatos e ${nacoes.length} nações), as 2 folhas do tabuleiro e a folha de regras. Papel mais grosso ou cartolina deixa as cartas melhores de embaralhar.</p>
</section>`;

// ---------------------------------------------------------------- estilo das folhas

const css = `
@page { size: A4 portrait; margin: 0; }
@page paisagem { size: A4 landscape; margin: 0; }
* { box-sizing: border-box; }
body { margin: 0; font-family: 'Segoe UI', Arial, sans-serif; color: #1b1f2a; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.page { width: 210mm; height: 297mm; page-break-after: always; break-after: page; overflow: hidden; background: #fff; position: relative; }
.page.land { page: paisagem; width: 297mm; height: 210mm; }
.grid { display: grid; grid-template-columns: repeat(3, 63mm); grid-template-rows: repeat(3, 88mm); justify-content: center; align-content: center; }

.t-missao { --c: #c98a00; --claro: #fff6dc; } .t-persona { --c: #6d3fc0; --claro: #f1ebfb; }
.t-contexto { --c: #1f5fd1; --claro: #e8f0fd; } .t-formato { --c: #e06c00; --claro: #fff0e2; }
.t-nacao { --c: #16274f; --claro: #e9edf6; }
.a-S { color: #c62828; }

.card { width: 63mm; height: 88mm; border: 0.3mm dashed #9aa3b5; padding: 3mm; display: flex; flex-direction: column; gap: 1.6mm; position: relative; }
.card::before { content: ''; position: absolute; inset: 1.6mm; border: 0.6mm solid var(--c); border-radius: 3mm; pointer-events: none; }
.hd { background: var(--c); color: #fff; border-radius: 2mm; padding: 1.2mm 2.4mm; display: flex; justify-content: space-between; font-weight: 800; font-size: 8.5pt; letter-spacing: .06em; position: relative; }
.code { font-weight: 700; background: rgba(255,255,255,.25); border-radius: 1mm; padding: 0 1.4mm; }
.assunto { display: flex; align-items: center; gap: 1.6mm; margin: 0 1mm; padding: .8mm 2mm .8mm .8mm; background: var(--claro); border-radius: 5mm; font-size: 9pt; font-weight: 800; align-self: flex-start; }
.assunto .ico { width: 6.4mm; height: 6.4mm; border-radius: 50%; background: #fff; display: inline-flex; align-items: center; justify-content: center; font-size: 10pt; line-height: 1; }
.body { flex: 1; padding: 0 1.5mm; display: flex; flex-direction: column; justify-content: flex-start; gap: 1.4mm; }
.body.center { justify-content: center; text-align: center; }
.pedido { font-size: 13pt; font-weight: 800; line-height: 1.28; margin: .5mm 0 0; }
.pense { font-size: 7.6pt; color: #4a5368; font-style: italic; margin: 0; }
.monte { margin: 0 1.5mm; background: var(--claro); border-radius: 2mm; padding: 1.2mm 2mm; font-size: 7.4pt; line-height: 1.3; text-align: center; }
.monte b { font-size: 8.2pt; }
.estrelas { display: flex; justify-content: space-between; margin: 0 1.5mm; font-size: 6.8pt; }
.estrelas b { color: var(--c); font-size: 8pt; }
.txt { font-size: 11pt; line-height: 1.32; margin: 0; }
.nome { font-size: 12pt; font-weight: 800; margin: 1mm 0 0; line-height: 1.2; }
.big { font-size: 12pt; font-weight: 800; margin: 0; line-height: 1.2; }
.efeito { font-size: 8.2pt; margin: 0; line-height: 1.35; color: #2b3245; }
.desenho { color: var(--c); margin: 1mm auto; width: 40mm; }
.desenho svg { width: 100%; height: auto; display: block; }
.lema { font-size: 8pt; font-weight: 700; color: var(--c); margin: 0; letter-spacing: .04em; text-transform: uppercase; }
.tight { gap: 1mm !important; }
.poderes { text-align: left; border-top: 0.3mm solid #d6dbe6; margin-top: .8mm; padding-top: .8mm; }
.pt { font-size: 6pt; font-weight: 800; letter-spacing: .05em; margin: 0 0 .6mm; color: var(--c); }
.pd { font-size: 7pt; margin: 0 0 .5mm; line-height: 1.25; }
.pd.especial { background: var(--claro); border-radius: 1.2mm; padding: .5mm 1mm; }
.vida { font-size: 8pt; font-weight: 700; margin: 1mm 0 0; letter-spacing: .05em; }
.vida b { font-size: 12pt; }
.track { display: grid; grid-template-columns: repeat(7, 1fr); gap: .8mm; margin: .5mm 1mm 0; }
.track span { border: 0.3mm solid var(--c); border-radius: 1mm; font-size: 7.5pt; font-weight: 700; padding: .6mm 0; }
.ft { font-size: 6.3pt; line-height: 1.3; color: #4a5368; border-top: 0.3mm solid #d6dbe6; padding: 1mm 1.5mm 0; margin: 0 .5mm .5mm; }

/* Tabuleiro: 2 folhas A4 deitadas, cada vaga do tamanho de uma carta */
.tab { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 5mm; }
.tray { display: grid; grid-template-columns: 9mm repeat(4, 63mm); gap: 3mm; padding: 3mm; border-radius: 4mm; background: var(--claro); border: 0.5mm solid var(--c); }
.band { background: var(--c); border-radius: 2.5mm; display: flex; align-items: center; justify-content: center; }
.band span { writing-mode: vertical-rl; transform: rotate(180deg); color: #fff; font-weight: 800; font-size: 13pt; letter-spacing: .18em; }
.slot { height: 88mm; border: 0.6mm dashed var(--c); border-radius: 3mm; background: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1.5mm; text-align: center; padding: 4mm; }
.slot b { font-size: 12pt; color: var(--c); }
.slot span { font-size: 8.5pt; color: #4a5368; }
.slot small { font-size: 7.5pt; color: #4a5368; line-height: 1.3; }
.turno { grid-column: span 2; background: #fff; border-radius: 3mm; padding: 4mm 5mm; font-size: 10pt; line-height: 1.32; }
.turno .tt { margin: 0 0 1.5mm; font-weight: 800; font-size: 11pt; color: var(--c); }
.turno ol { margin: 0; padding-left: 5mm; } .turno li { margin-bottom: 1.1mm; }
.turno .est { margin: 2.5mm 0 0; font-size: 9pt; background: var(--claro); border-radius: 2mm; padding: 1.5mm 2mm; }
.folha { margin: 0; font-size: 7.5pt; color: #6b7387; }

/* Folhas de texto */
.doc { padding: 10mm 12mm; font-size: 9.2pt; line-height: 1.34; }
.regras { font-size: 10pt; line-height: 1.36; }
.doc h1 { font-size: 17pt; margin: 0 0 2.5mm; } .doc h1 small { display: block; font-size: 9pt; font-weight: 500; color: #4a5368; }
.doc h2 { font-size: 11pt; margin: 3.2mm 0 1mm; color: #1f5fd1; }
.doc p { margin: 0 0 1.2mm; }
.doc ul, .doc ol { margin: 0 0 1mm; padding-left: 5mm; } .doc li { margin-bottom: .9mm; }
.cols { display: grid; grid-template-columns: 1fr 1fr; gap: 7mm; }
.objetivo { background: #fff6dc; border: 0.4mm solid #e0b84a; border-radius: 2mm; padding: 2.2mm 3mm; font-size: 10pt; }
.regra { background: #fde8e7; border: 0.4mm solid #e2a19b; border-radius: 2mm; padding: 1.6mm 2.4mm; }
.nota { color: #4a5368; font-size: 8.4pt; }
.assuntos { font-weight: 700; font-size: 8.8pt; }
.nota-tab { width: 100%; border-collapse: collapse; margin: 1mm 0 1.5mm; } .nota-tab td { border: 0.3mm solid #e0c27a; padding: 1mm 2mm; font-size: 9pt; } .nota-tab td:last-child { text-align: right; font-weight: 700; }
.aviso { background: #eef2f8; border-radius: 2mm; padding: 2mm 3mm; font-size: 8.4pt; color: #4a5368; margin-top: 3mm; }
.gab-pag { font-size: 9pt; }
table.gab { width: 100%; border-collapse: collapse; } .gab th, .gab td { border: 0.3mm solid #c9cfdb; padding: 1.3mm 2mm; text-align: left; vertical-align: top; font-size: 8.6pt; } .gab th { background: #eef2f8; }
.small2 { font-size: 8.6pt; line-height: 1.45; }
`;

const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Magic Prompt - playtest</title><style>${css}</style></head><body>${regras}${tabuleiro}${folhasDeCartas.join('')}${gabarito}</body></html>`;
fs.writeFileSync(path.join(__dirname, 'playtest.html'), html);
console.log(`cartas: ${cartas.length} em ${folhasDeCartas.length} folhas`);

// ---------------------------------------------------------------- dados do companion app

const linhas = [];
missoes.forEach(([c, a, pedido, fs]) => linhas.push({ codigo: c, tipo: 'Missão', nome: pedido, assunto: ASSUNTO[a].nome, formatos: fs }));
contextos.forEach(([c, a, nome, texto]) => linhas.push({ codigo: c, tipo: 'Contexto', nome, assunto: ASSUNTO[a].nome, texto }));
personas.forEach(([c, a, nome, frase]) => linhas.push({ codigo: c, tipo: 'Persona', nome, assunto: ASSUNTO[a].nome, texto: frase }));
formatos.forEach(([c, nome, como]) => linhas.push({ codigo: c, tipo: 'Formato', nome, texto: como, copias: COPIAS_FORMATO }));
nacoes.forEach(([c, nome, lema, especial]) => linhas.push({ codigo: c, tipo: 'Nação', nome, lema, vida: VIDA, poderes: poderesDe(especial) }));

const icones = Object.fromEntries(Object.values(ASSUNTO).map((a) => [a.nome, a.ico]));
const dadosJs = `// Dados das cartas do Magic Prompt, versão simplificada do playtest (11/11/2026): ${linhas.length} códigos e ${cartas.length} cartas impressas.
// Gerado pela mesma lista das cartas impressas. Para mudar uma carta, edite a linha dela aqui.
// Missão: "formatos" são os formatos que ganham estrela nela. Contexto e persona ganham estrela quando são do mesmo assunto da missão.
// Formato: "copias" é quantas cartas iguais existem. Nação: "vida" é a vida inicial e "poderes" custam pontos (o número é o custo).
const DADOS = {
  cartas: [
${linhas.map((l) => `    ${JSON.stringify(l)},`).join('\n')}
  ],
  // Símbolo de cada assunto, igual ao das cartas
  assuntos: ${JSON.stringify(icones)},
  duracaoDoTurno: ${TURNO_SEGUNDOS}, // segundos
  totalDeMissoes: ${missoes.length},
};

// Índice para achar uma carta pelo código, por exemplo DADOS.porCodigo.C01
DADOS.porCodigo = Object.fromEntries(DADOS.cartas.map((c) => [c.codigo, c]));
DADOS.missoes = DADOS.cartas.filter((c) => c.tipo === 'Missão');
`;
fs.writeFileSync(path.join(APP, 'js', 'dados.js'), dadosJs.replace(/\r?\n/g, '\r\n'));
console.log(`dados.js: ${linhas.length} códigos`);
