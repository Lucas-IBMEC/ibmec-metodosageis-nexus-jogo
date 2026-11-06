// Palavra Mágica · versão "Pife" para a partida de teste (11/11/2026).
// Joga como o Pife: compra uma, descarta uma e bate quando fecha o jogo. Aqui, o jogo é um prompt.
// Uma lista de dados só: dela saem as cartas, a folha de regras, o gabarito do professor,
// o Manual do Professor e os dados do aplicativo do professor.
// Uso: node cartas/gerar.cjs   (gera cartas/cartas.html, cartas/manual.html, app/js/dados.js e app/manifest.webmanifest)
// Para imprimir: abra o .html no Chrome, Ctrl+P, "Salvar como PDF", margens "Nenhuma".
const fs = require('fs');
const path = require('path');

const APP = path.join(__dirname, '..', 'app');

// Nome do jogo: o professor pediu um nome em português (Revisão da Sprint 4, 04/11).
// Para trocar, mude só aqui e rode o gerador: as cartas, o manual e o aplicativo mudam juntos.
const NOME = 'Palavra Mágica';
const GRUPO = 'NEXUS';
const ENDERECO_DO_APP = 'lucas-ibmec.github.io/ibmec-metodosageis-nexus-jogo/app';

// ---------------------------------------------------------------- números da regra (de teste)

const CARTAS_NA_MAO = 5;
const MISSOES_NA_MESA = 3;
const META = 6; // estrelas para ganhar
const VEZ_SEGUNDOS = 30;
const AJUDAS = 8; // cartas de resumo da vez (1 por lado; completam a última folha)

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

// [código, assunto, pedido, formatos que dão 3 estrelas]
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
  ['C03', 'S', 'Lanche em Miami', 'Na minha escola em Miami, muitos alunos comem hambúrguer e batata frita todo dia.'],
  ['C04', 'S', 'Mãos limpas em Cantão', 'Em Cantão, a escola ensina os alunos a lavar as mãos do jeito certo.'],
  ['C05', 'S', 'Merenda em Roma', 'Sou nutricionista em Roma e monto o cardápio da merenda.'],
  ['C06', 'E', 'Basquete em Chicago', 'Sou técnico de basquete numa escola de Chicago e os alunos se cansam rápido.'],
  ['C07', 'E', 'Futsal da escola', 'Treino o time de futsal da escola, com meninos e meninas.'],
  ['C08', 'E', 'Ginástica em Xangai', 'Em Xangai, muitos alunos fazem ginástica no parque antes da aula.'],
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

// [código, assunto, nome, como entra no prompt] (4 por assunto: com 2, a partida demorava o dobro)
const personas = [
  ['P01', 'S', 'Médica de posto de saúde', 'Você é médica de posto de saúde.'],
  ['P02', 'S', 'Nutricionista', 'Você é nutricionista.'],
  ['P03', 'E', 'Técnica de futebol', 'Você é técnica de futebol.'],
  ['P04', 'E', 'Professor de Educação Física', 'Você é professor de Educação Física.'],
  ['P05', 'T', 'Engenheiro de computação', 'Você é engenheiro de computação.'],
  ['P06', 'T', 'Especialista em segurança na internet', 'Você é especialista em segurança na internet.'],
  ['P07', 'A', 'Bióloga', 'Você é bióloga.'],
  ['P08', 'A', 'Engenheira ambiental', 'Você é engenheira ambiental.'],
  ['P09', 'S', 'Enfermeiro', 'Você é enfermeiro.'],
  ['P10', 'S', 'Agente comunitária de saúde', 'Você é agente comunitária de saúde.'],
  ['P11', 'E', 'Atleta olímpica', 'Você é atleta olímpica.'],
  ['P12', 'E', 'Jornalista esportivo', 'Você é jornalista esportivo.'],
  ['P13', 'T', 'Professora de informática', 'Você é professora de informática.'],
  ['P14', 'T', 'Desenvolvedor de aplicativos', 'Você é desenvolvedor de aplicativos.'],
  ['P15', 'A', 'Guarda-parque', 'Você é guarda-parque.'],
  ['P16', 'A', 'Meteorologista', 'Você é meteorologista.'],
];

const nomeFormato = Object.fromEntries(formatos.map(([c, n]) => [c, n]));
const curto = (codigo) => nomeFormato[codigo].replace(/ \(.*\)$/, '');
const totalFormatos = formatos.length * COPIAS_FORMATO;

// conferências simples: cada assunto tem 5 contextos e 4 personas; cada formato dá 3 estrelas em alguma missão
for (const a of Object.keys(ASSUNTO)) {
  if (contextos.filter((c) => c[1] === a).length !== 5) throw new Error(`contextos de ${a}`);
  if (personas.filter((p) => p[1] === a).length !== 4) throw new Error(`personas de ${a}`);
}
for (const [c] of formatos) if (!missoes.some((m) => m[3].includes(c))) throw new Error(`formato sem missão: ${c}`);

// ---------------------------------------------------------------- cartas

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const icone = (a) => `<span class="a-${a}">${ASSUNTO[a].ico}</span>`;
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
// A primeira carta de cada código também vai para o manual (o resumo da vez fica em "RESUMO")
const cartaPorCodigo = {};
const carta = (cls, codigo, tipo, miolo) => {
  const html = `<div class="card ${cls}"><div class="hd"><span>${tipo}</span>${codigo ? `<span class="code">${codigo}</span>` : ''}</div>${miolo}</div>`;
  cartas.push(html);
  cartaPorCodigo[codigo || 'RESUMO'] = cartaPorCodigo[codigo || 'RESUMO'] || html;
};

missoes.forEach(([c, a, pedido]) => carta('t-missao', c, 'MISSÃO', `
  ${selo(a)}
  <div class="body"><p class="pedido">“${esc(pedido)}”</p>
  <p class="pense">Pense: quem vai ler? Que formato ajuda essa pessoa?</p></div>
  <div class="monte">Para bater: <b>contexto e persona com ${icone(a)} + 1 formato</b></div>
  <div class="estrelas"><span><b>★★★</b> formato que ajuda</span><span><b>★★</b> outro formato</span></div>
  <div class="ft">Fica aberta no meio da mesa. Qualquer lado pode fazer.</div>`));

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

for (let i = 0; i < AJUDAS; i++) carta('t-ajuda', '', 'RESUMO DA VEZ', `
  <div class="body passos">
    <p><span class="n">1</span><span><b>Compre 1</b>do monte ou a de cima do lixo.</span></p>
    <p><span class="n">2</span><span><b>Fechou um prompt? Bata!</b>Contexto e persona com o ícone de uma missão da mesa + 1 formato.</span></p>
    <p><span class="n">3</span><span><b>Descarte 1</b>Fique sempre com ${CARTAS_NA_MAO} cartas.</span></p>
    <p class="vale"><b>★★★</b> formato que ajuda quem vai ler<br><b>★★</b> outro formato</p>
    <p class="depois">Bateu? Fique com a missão, ponha as 3 cartas embaixo do monte, compre 3 e vire outra missão.</p>
  </div>
  <div class="ft">Ganha quem chegar a <b>${META} estrelas</b> primeiro.</div>`);

const folhasDeCartas = [];
for (let i = 0; i < cartas.length; i += 9) folhasDeCartas.push(`<section class="page grid">${cartas.slice(i, i + 9).join('')}</section>`);

// ---------------------------------------------------------------- regras (1 página)

// Exemplo da folha de regras, montado com cartas de verdade (se uma carta mudar, o exemplo muda junto)
const achar = (lista, codigo) => lista.find((x) => x[0] === codigo);
const exemplo = {
  missao: achar(missoes, 'M04'), contexto: achar(contextos, 'C07'), persona: achar(personas, 'P04'),
  formato: achar(formatos, 'F02'), errado: 'F05',
};
if (exemplo.contexto[1] !== exemplo.missao[1] || exemplo.persona[1] !== exemplo.missao[1]
  || !exemplo.missao[3].includes(exemplo.formato[0]) || exemplo.missao[3].includes(exemplo.errado)) {
  throw new Error('o exemplo da folha de regras não bate com as cartas');
}

const passosDaVez = `
  <li><b>Compre 1</b> carta: a de cima do monte ou a de cima do lixo.</li>
  <li><b>Fechou um prompt? Bata!</b></li>
  <li><b>Descarte 1</b> carta no lixo. Você sempre termina a vez com ${CARTAS_NA_MAO} cartas.</li>`;

const regras = `<section class="page doc regras">
<h1>${NOME} · Como jogar <small>versão de teste · grupo ${GRUPO} · 2 a 5 lados · cerca de 10 minutos</small></h1>
<p class="objetivo"><b>Objetivo:</b> montar prompts para as missões da mesa e chegar a <b>${META} estrelas</b> primeiro. Joga como o <b>Pife</b>: compra uma, descarta uma e bate quando fecha o jogo. Aqui, o jogo é um prompt.</p>

<div class="cols">
<div>
<h2>No jogo</h2>
<p>${missoes.length} missões · ${contextos.length} contextos · ${personas.length} personas · ${totalFormatos} formatos (${formatos.length} tipos, ${COPIAS_FORMATO} de cada) · ${AJUDAS} cartas de resumo da vez · o celular do professor com o aplicativo.</p>

<h2>Preparação</h2>
<ol>
<li>Embaralhe as <b>missões</b> e vire <b>${MISSOES_NA_MESA}</b> para cima no meio da mesa. As outras ficam num montinho ao lado.</li>
<li>Embaralhe <b>juntos</b> os contextos, as personas e os formatos: esse é o <b>monte</b>.</li>
<li>Dê <b>${CARTAS_NA_MAO} cartas</b> e 1 resumo da vez para cada lado (1 aluno, uma dupla ou um grupo).</li>
<li>Vire 1 carta do monte ao lado dele: é o <b>lixo</b>.</li>
<li>O professor abre a página Partida no aplicativo, cadastra os lados e toca em <b>Sortear</b>. Depois, a vez segue no sentido horário.</li>
</ol>

<div class="mesa">
  <p class="mesa-t">A mesa</p>
  <div class="mesa-fila">${'<span class="mini m">Missão<small>aberta</small></span>'.repeat(MISSOES_NA_MESA)}</div>
  <div class="mesa-fila"><span class="mini monte">Monte<small>virado para baixo</small></span><span class="mini lixo">Lixo<small>virado para cima</small></span></div>
  <p class="mesa-mao">Na mão de cada lado: ${CARTAS_NA_MAO} cartas</p>
</div>

<div class="exemplo">
  <p class="exemplo-t">Exemplo de uma vez</p>
  <p class="exemplo-missao">Na mesa está a missão <b>${exemplo.missao[0]}</b> ${icone(exemplo.missao[1])}: “${esc(exemplo.missao[2])}”</p>
  <p>Você compra <b>${exemplo.persona[0]} ${esc(exemplo.persona[2])}</b> ${icone(exemplo.persona[1])}. Agora tem também <b>${exemplo.contexto[0]} ${esc(exemplo.contexto[2])}</b> ${icone(exemplo.contexto[1])} e <b>${exemplo.formato[0]} ${esc(curto(exemplo.formato[0]))}</b>: fechou, bata!</p>
  <p>O professor digita ${exemplo.missao[0]}, ${exemplo.contexto[0]}, ${exemplo.persona[0]} e ${exemplo.formato[0]}, e o aplicativo dá <b>★★★</b>, porque um passo a passo ajuda quem vai fazer o aquecimento. Com ${exemplo.errado} ${esc(curto(exemplo.errado))}, seriam <b>★★</b>.</p>
</div>
</div>

<div>
<h2>A sua vez · até ${VEZ_SEGUNDOS} segundos</h2>
<ol class="vez-passos">${passosDaVez}</ol>

<h2>Fechar um prompt</h2>
<div class="formula">
  <span class="peca t-contexto"><b>Contexto</b>com o ícone de uma missão da mesa</span><i>+</i>
  <span class="peca t-persona"><b>Persona</b>com o mesmo ícone</span><i>+</i>
  <span class="peca t-formato"><b>Formato</b>qualquer um</span>
</div>
<p class="assuntos">Ícones: ${Object.keys(ASSUNTO).map((a) => `<span class="sem-quebra">${icone(a)} ${ASSUNTO[a].nome}</span>`).join(' · ')}</p>

<h2>Bater</h2>
<p>Mostre a missão e as 3 cartas. O professor digita os 4 códigos no aplicativo:</p>
<table class="nota-tab"><tr><td><b>★★★</b> formato que ajuda quem vai ler</td><td>3 estrelas</td></tr><tr><td><b>★★</b> formato que não ajuda tanto</td><td>2 estrelas</td></tr></table>
<p>Fique com a missão, ponha as 3 cartas embaixo do monte, compre 3 e vire uma missão nova no lugar. Depois, descarte 1, como sempre.</p>
<p class="ganha"><b>Ganha quem chegar a ${META} estrelas primeiro.</b> O aplicativo avisa.</p>

<h2>Casos especiais</h2>
<ul class="pequeno">
<li>Bateu sem o ícone certo: não vale. As cartas voltam para a mão; descarte 1 e passe a vez.</li>
<li>Acabou o tempo: descarte 1 e passe a vez.</li>
<li>O monte acabou: embaralhe o lixo, menos a carta de cima, e faça um monte novo.</li>
<li>As missões acabaram: ganha quem tiver mais estrelas. Empate: quem fez mais missões com ★★★.</li>
</ul>
</div>
</div>
<p class="aviso">Números de teste: ${CARTAS_NA_MAO} cartas na mão, ${MISSOES_NA_MESA} missões na mesa, ${META} estrelas para ganhar e ${VEZ_SEGUNDOS} segundos por vez. Anotem o que ficou fácil ou difícil demais para ajustar depois da partida de teste.</p>
</section>`;

// ---------------------------------------------------------------- gabarito do professor

const porAssunto = (lista) => Object.keys(ASSUNTO).map((a) => {
  const doAssunto = lista.filter((x) => x[1] === a);
  return `<b>${ASSUNTO[a].ico} ${ASSUNTO[a].nome}:</b> ${doAssunto.map((x) => `${x[0]} ${esc(x[2])}`).join(' · ')}`;
}).join('<br>');
const gabarito = `<section class="page doc gab-pag">
<h1>Gabarito do professor <small>use se o aplicativo não abrir · não misture com as cartas</small></h1>
<h2>Quando alguém bate</h2>
<ol>
<li>O contexto e a persona têm o ícone da missão? Se um deles não tiver, <b>não vale</b>: as cartas voltam para a mão, o lado descarta 1 e passa a vez. Não diga se o formato servia, porque a missão continua na mesa.</li>
<li>O formato está na lista da missão? <b>Sim: ★★★ (3 estrelas). Não: ★★ (2 estrelas).</b> Leia em voz alta quais formatos serviam.</li>
<li>Ganha quem chegar a ${META} estrelas primeiro.</li>
</ol>
<h2>Missões e formatos que dão ★★★</h2>
<table class="gab"><tr><th>Missão</th><th>Ícone</th><th>Formatos que dão ★★★</th></tr>
${missoes.map(([c, a, pedido, fs]) => `<tr><td><b>${c}</b> ${esc(pedido)}</td><td>${ASSUNTO[a].ico} ${ASSUNTO[a].nome}</td><td>${fs.map((f) => `${f} ${esc(curto(f))}`).join(' · ')}</td></tr>`).join('')}
</table>
<h2>Contextos por assunto</h2>
<p class="small2">${porAssunto(contextos)}</p>
<h2>Personas por assunto</h2>
<p class="small2">${porAssunto(personas)}</p>
<h2>Formatos</h2>
<p class="small2">${formatos.map(([c, n]) => `${c} ${esc(n)}`).join(' · ')} <i>(${COPIAS_FORMATO} cópias de cada, com o mesmo código)</i></p>
<p class="small2"><b>Para imprimir:</b> ${cartas.length} cartas (${missoes.length} missões, ${contextos.length} contextos, ${personas.length} personas, ${totalFormatos} formatos e ${AJUDAS} resumos da vez) e a folha de regras. Papel mais grosso ou cartolina deixa as cartas melhores de embaralhar. Os resumos da vez não entram no monte.</p>
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
.t-ajuda { --c: #16274f; --claro: #e9edf6; }
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
.estrelas { display: flex; justify-content: space-between; margin: 0 1.5mm; font-size: 7pt; }
.estrelas b { color: var(--c); font-size: 8.4pt; }
.txt { font-size: 11pt; line-height: 1.32; margin: 0; }
.nome { font-size: 12pt; font-weight: 800; margin: 1mm 0 0; line-height: 1.2; }
.big { font-size: 12pt; font-weight: 800; margin: 0; line-height: 1.2; }
.efeito { font-size: 8.2pt; margin: 0; line-height: 1.35; color: #2b3245; }
.desenho { color: var(--c); margin: 1mm auto; width: 40mm; }
.desenho svg { width: 100%; height: auto; display: block; }
.ft { font-size: 6.3pt; line-height: 1.3; color: #4a5368; border-top: 0.3mm solid #d6dbe6; padding: 1mm 1.5mm 0; margin: 0 .5mm .5mm; }
.ft b { color: var(--c); }

/* Resumo da vez */
.passos { justify-content: center; gap: 2.4mm; }
.passos p { margin: 0; display: flex; gap: 2mm; align-items: flex-start; font-size: 8.4pt; line-height: 1.3; }
.passos p b { display: block; font-size: 10.6pt; color: var(--c); }
.passos .n { flex: none; width: 6mm; height: 6mm; border-radius: 50%; background: var(--c); color: #fff; font-weight: 800; font-size: 9.6pt; display: inline-flex; align-items: center; justify-content: center; }
.passos .vale { display: block; background: var(--claro); border-radius: 2mm; padding: 1.4mm 2mm; font-size: 8pt; }
.passos .vale b { display: inline; color: #c98a00; font-size: 9.2pt; }
.passos .depois { display: block; font-size: 7.2pt; color: #4a5368; }

/* Folhas de texto */
.doc { padding: 10mm 12mm; font-size: 9.2pt; line-height: 1.34; }
.regras { font-size: 10.4pt; line-height: 1.38; }
.doc h1 { font-size: 18pt; margin: 0 0 2.5mm; } .doc h1 small { display: block; font-size: 9pt; font-weight: 500; color: #4a5368; }
.doc h2 { font-size: 11.5pt; margin: 3.4mm 0 1.2mm; color: #1f5fd1; }
.doc p { margin: 0 0 1.4mm; }
.doc ul, .doc ol { margin: 0 0 1mm; padding-left: 5mm; } .doc li { margin-bottom: 1mm; }
.cols { display: grid; grid-template-columns: 1fr 1fr; gap: 7mm; }
.objetivo { background: #fff6dc; border: 0.4mm solid #e0b84a; border-radius: 2mm; padding: 2.4mm 3mm; font-size: 10.6pt; }
.vez-passos { font-size: 11pt; } .vez-passos li { margin-bottom: 1.4mm; }
.formula { display: flex; align-items: stretch; gap: 1.4mm; margin: 1mm 0 1.4mm; }
.formula i { font-style: normal; font-weight: 800; font-size: 13pt; align-self: center; }
.peca { flex: 1; border: 0.5mm solid var(--c); background: var(--claro); border-radius: 2mm; padding: 1.4mm 1.6mm; font-size: 7.6pt; line-height: 1.25; text-align: center; }
.peca b { display: block; color: var(--c); font-size: 9.4pt; }
.assuntos { font-weight: 700; font-size: 9pt; }
.sem-quebra { white-space: nowrap; }
.exemplo { margin-top: 3mm; border-left: 1.2mm solid #c98a00; background: #fff6dc; border-radius: 0 2mm 2mm 0; padding: 2.2mm 3mm; font-size: 9.2pt; line-height: 1.35; }
.exemplo p { margin: 0 0 1.2mm; } .exemplo p:last-child { margin: 0; }
.exemplo-t { font-weight: 800; font-size: 9pt; letter-spacing: .06em; text-transform: uppercase; color: #8a5a00; }
.exemplo-missao { font-style: italic; }
.nota-tab { width: 100%; border-collapse: collapse; margin: 1mm 0 1.6mm; } .nota-tab td { border: 0.3mm solid #e0c27a; padding: 1.2mm 2mm; font-size: 9.6pt; } .nota-tab td:last-child { text-align: right; font-weight: 700; white-space: nowrap; }
.nota-tab b { color: #c98a00; }
.ganha { background: #e3f4ea; border: 0.4mm solid #7cc49c; border-radius: 2mm; padding: 1.8mm 2.6mm; }
.pequeno { font-size: 9pt; }
.mesa { margin-top: 3mm; border: 0.4mm dashed #9aa3b5; border-radius: 3mm; padding: 2.4mm 3mm 2.6mm; background: #f6f8fc; text-align: center; }
.mesa-t { font-weight: 800; font-size: 9pt; margin: 0 0 1mm !important; color: #4a5368; letter-spacing: .06em; text-transform: uppercase; }
.mesa-fila { display: flex; justify-content: center; gap: 3mm; margin: 1.6mm 0; }
.mini { width: 19mm; height: 26mm; border-radius: 1.6mm; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: .6mm; font-size: 8pt; font-weight: 800; color: #fff; }
.mini small { font-size: 6pt; font-weight: 600; line-height: 1.2; padding: 0 1mm; }
.mini.m { background: #c98a00; }
.mini.monte { background: #16274f; }
.mini.lixo { background: #fff; color: #1b1f2a; border: 0.5mm solid #9aa3b5; }
.mesa-mao { margin: 1.4mm 0 0 !important; font-size: 8.6pt; font-weight: 700; }
.aviso { background: #eef2f8; border-radius: 2mm; padding: 2mm 3mm; font-size: 8.4pt; color: #4a5368; margin-top: 3mm; }
.gab-pag { font-size: 9pt; }
table.gab { width: 100%; border-collapse: collapse; } .gab th, .gab td { border: 0.3mm solid #c9cfdb; padding: 1.3mm 2mm; text-align: left; vertical-align: top; font-size: 8.6pt; } .gab th { background: #eef2f8; }
.small2 { font-size: 8.6pt; line-height: 1.45; }
`;

const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>${NOME} · cartas, regras e gabarito</title><style>${css}</style></head><body>${regras}${folhasDeCartas.join('')}${gabarito}</body></html>`;
fs.writeFileSync(path.join(__dirname, 'cartas.html'), html);
console.log(`cartas: ${cartas.length} em ${folhasDeCartas.length} folhas`);

// ---------------------------------------------------------------- Manual do Professor

// As respostas de exemplo do aplicativo (o manual mostra a mesma resposta que o professor vê no celular)
const RESPOSTAS = new Function(`${fs.readFileSync(path.join(APP, 'js', 'respostas.js'), 'utf8')}; return RESPOSTAS;`)();
const manual = require('./manual.cjs')({
  NOME, GRUPO, ENDERECO_DO_APP, CARTAS_NA_MAO, MISSOES_NA_MESA, META, VEZ_SEGUNDOS, AJUDAS, COPIAS_FORMATO,
  ASSUNTO, formatos, missoes, contextos, personas, cartas, folhas: folhasDeCartas.length, cartaPorCodigo,
  exemplo, RESPOSTAS, esc, curto, icone, cssDasCartas: css,
});
fs.writeFileSync(path.join(__dirname, 'manual.html'), manual.html);
console.log(`manual: ${manual.paginas} páginas`);

// ---------------------------------------------------------------- dados do aplicativo do professor

const linhas = [];
missoes.forEach(([c, a, pedido, fs]) => linhas.push({ codigo: c, tipo: 'Missão', nome: pedido, assunto: ASSUNTO[a].nome, formatos: fs }));
contextos.forEach(([c, a, nome, texto]) => linhas.push({ codigo: c, tipo: 'Contexto', nome, assunto: ASSUNTO[a].nome, texto }));
personas.forEach(([c, a, nome, frase]) => linhas.push({ codigo: c, tipo: 'Persona', nome, assunto: ASSUNTO[a].nome, texto: frase }));
formatos.forEach(([c, nome, como]) => linhas.push({ codigo: c, tipo: 'Formato', nome, texto: como, copias: COPIAS_FORMATO }));

const icones = Object.fromEntries(Object.values(ASSUNTO).map((a) => [a.nome, a.ico]));
const dadosJs = `// Dados das cartas do ${NOME}, versão "Pife" da partida de teste (11/11/2026): ${linhas.length} códigos e ${cartas.length} cartas impressas.
// Gerado por cartas/gerar.cjs, a mesma lista das cartas impressas. Para mudar uma carta, edite lá e rode node cartas/gerar.cjs.
// Missão: "formatos" são os formatos que dão 3 estrelas nela (outro formato dá 2).
// Contexto e persona: só fecham o prompt quando são do mesmo assunto da missão. Formato: "copias" é quantas cartas iguais existem.
const DADOS = {
  nomeDoJogo: ${JSON.stringify(NOME)},
  cartas: [
${linhas.map((l) => `    ${JSON.stringify(l)},`).join('\n')}
  ],
  // Símbolo de cada assunto, igual ao das cartas
  assuntos: ${JSON.stringify(icones)},
  // Números da regra (de teste)
  cartasNaMao: ${CARTAS_NA_MAO},
  missoesNaMesa: ${MISSOES_NA_MESA},
  metaDeEstrelas: ${META},
  duracaoDaVez: ${VEZ_SEGUNDOS}, // segundos
  totalDeMissoes: ${missoes.length},
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
  description: `Placar, nota das missões em estrelas e consulta das cartas do jogo ${NOME}. Funciona sem internet.`,
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
