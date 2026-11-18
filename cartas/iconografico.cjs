// Manual iconográfico: o que quer dizer cada cor, cada símbolo e cada imagem do jogo e do aplicativo.
// Montado pelo gerar.cjs com as mesmas cartas, imagens e desenhos que vão para a impressão,
// então o manual muda sozinho quando uma carta muda. Os ícones do aplicativo vêm de app/js/comum.js.
const fs = require('fs');
const path = require('path');

module.exports = function montarIconografico(d) {
  const {
    NOME, GRUPO, ABERTAS, ASSUNTO, ORDEM, C, P, F, ESPECIAIS, poderDa, cartaPorCodigo, versoPorTipo,
    desenho, emblema, esc, semParenteses, cssDasCartas, tabuleiro,
  } = d;

  // Os ícones do menu do aplicativo, lidos do próprio aplicativo (assim o manual mostra sempre os mesmos)
  const comum = fs.readFileSync(path.join(__dirname, '..', 'app', 'js', 'comum.js'), 'utf8');
  const bloco = (comum.match(/const ICONES = \{([\s\S]*?)\};/) || [])[1];
  if (!bloco) throw new Error('iconográfico: não achei os ícones do aplicativo em app/js/comum.js');
  const ICONES = Object.fromEntries([...bloco.matchAll(/(\w+): '([^']*)'/g)].map((m) => [m[1], m[2]]));
  const MENU = [
    ['partida', 'Partida', 'Monta a partida (completa ou rápida), sorteia quem começa, mostra de quem é a vez, o placar e o cronômetro de 1 minuto.'],
    ['rodada', 'Rodada', 'O professor digita a missão e depois as 3 cartas de cada lado, um lado por vez. O aplicativo dá a nota de cada prompt e o ponto ao melhor.'],
    ['desafio', 'Desafio', 'O desafio final: cada lado escreve um prompt sem cartas, e o aplicativo dá a nota de 1 a 4, sem internet.'],
    ['regras', 'Regras', 'O resumo das regras, para tirar dúvidas durante a partida.'],
  ];
  for (const [id] of MENU) if (!ICONES[id]) throw new Error(`iconográfico: falta o ícone ${id} do aplicativo`);
  const iconeDoApp = (id) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONES[id]}</svg>`;

  let pagina = 0;
  const TOTAL = 4;
  const rodape = () => `<footer class="ico-rodape"><span>${NOME} · Manual iconográfico</span><span>grupo ${GRUPO} · página ${++pagina} de ${TOTAL}</span></footer>`;
  const mini = (html, zoom, extra = '') => `<div class="mini-carta ${extra}" style="zoom:${zoom}">${html}</div>`;

  // ------------------------------------------------------------ 1. cores, partes da carta e assuntos
  const CORES = [
    ['Missão', 't-missao', 'Amarelo · alvo', 'O pedido da rodada. Fica no meio da mesa e vale para todos os lados.'],
    ['Contexto', 't-contexto', 'Azul · alfinete de mapa', 'A situação: onde é e o que está acontecendo.'],
    ['Persona', 't-persona', 'Roxo · pessoa', 'Quem a IA vai ser ao responder.'],
    ['Formato', 't-formato', 'Laranja · folha', 'Como a resposta chega para quem vai ler.'],
  ];
  const exemploDeCarta = C.find((c) => c.codigo === 'C09') || C[0];
  const PARTES = [
    ['Faixa de cima', 'o nome do baralho e o <b>código</b> da carta. O professor digita só o número do código no aplicativo.'],
    ['Imagem', 'ajuda a reconhecer a carta de longe. Ela <b>não diz o assunto</b>: para saber se a carta combina com a missão, leia o texto.'],
    ['Nome', 'o jeito curto de chamar a carta na mesa.'],
    ['Texto', 'é o que vai para o prompt. Cada palavra é uma pista de quais assuntos a carta ajuda.'],
    ['Rodapé', 'lembra o que esse baralho faz no prompt.'],
  ];
  const pagina1 = `<section class="page ico-pag">
  <header class="ico-topo">
    <p class="ico-rotulo">Manual iconográfico</p>
    <h1>${NOME}</h1>
    <p class="ico-sub">O que quer dizer cada cor, cada símbolo e cada imagem das cartas, do tabuleiro e do aplicativo do professor.</p>
  </header>

  <h2><span>1</span>As 4 cores: uma para cada baralho</h2>
  <p>O verso diz de que baralho é a carta, com a cor e o símbolo. A mesma cor aparece na frente da carta, no tabuleiro e no aplicativo.</p>
  <div class="cores">${CORES.map(([tipo, cls, cor, oQue]) => `<div class="cor ${cls}">
    ${mini(versoPorTipo[tipo], 0.34)}
    <div><p class="cor-nome">${tipo}</p><p class="cor-qual">${cor}</p><p>${oQue}</p></div>
  </div>`).join('')}</div>

  <h2><span>2</span>As partes de uma carta</h2>
  <div class="partes">
    <div class="partes-carta">${mini(cartaPorCodigo[exemploDeCarta.codigo], 0.8)}
      ${PARTES.map((_, i) => `<span class="marca m${i + 1}">${i + 1}</span>`).join('')}
    </div>
    <ol class="partes-lista">${PARTES.map(([nome, texto]) => `<li><b>${nome}:</b> ${texto}</li>`).join('')}</ol>
  </div>

  <h2><span>3</span>Os 4 assuntos</h2>
  <p>Cada missão tem 3 dos 4 assuntos. Eles aparecem só nas missões, no gabarito e no aplicativo. Nenhuma imagem de carta usa estes 4 símbolos, para ninguém achar que a imagem diz o assunto.</p>
  <div class="assuntos-ico">${ORDEM.map((a) => `<div><span class="assunto-bola a-${a}">${ASSUNTO[a].ico}</span><b>${ASSUNTO[a].nome}</b></div>`).join('')}</div>
  ${rodape()}
</section>`;

  // ------------------------------------------------------------ 2. especiais, tabuleiro e aplicativo
  const ZOOM_TAB = 0.36;
  const pagina2 = `<section class="page ico-pag">
  <h2><span>4</span>As cartas especiais</h2>
  <p>Há só 1 em cada baralho, com uma estrela ★ no lugar do código. As 3 têm o mesmo poder, cada uma com a sua imagem. Não entram no prompt, então o professor nunca digita.</p>
  <div class="especiais-ico">${Object.entries(ESPECIAIS).map(([tipo, e]) => `<div class="especial-ico">
    ${mini(cartaPorCodigo[`especial-${tipo}`], 0.44)}
    <p><b>${e.ico} ${e.nome}</b> · baralho de ${tipo.toLowerCase()}</p><p>${poderDa(e)}</p>
  </div>`).join('')}</div>

  <h2><span>5</span>O tabuleiro</h2>
  <p>As cartas vão nos espaços da mesma cor. <b>Listrado</b> = monte, virado para baixo. <b>Número de 1 a ${ABERTAS}</b> = carta aberta, virada para cima. O espaço amarelo de fundo cheio, na coluna da esquerda, é a missão da rodada.</p>
  <div class="tab-mini" style="width:${tabuleiro.largura * ZOOM_TAB}mm;height:${tabuleiro.altura * ZOOM_TAB}mm"><div style="zoom:${ZOOM_TAB}">${tabuleiro.tabuleiro}</div></div>

  <h2><span>6</span>Os ícones do aplicativo</h2>
  <p>O menu fica embaixo da tela do celular. Cada ícone abre uma página.</p>
  <div class="menu-ico">${MENU.map(([id, nome, texto]) => `<div><span class="menu-bola">${iconeDoApp(id)}</span><p class="menu-nome">${nome}</p><p>${texto}</p></div>`).join('')}</div>
  ${rodape()}
</section>`;

  // ------------------------------------------------------------ 3. as imagens das cartas
  const coluna = (tipo, cls, baralho) => `<div class="col-imagens ${cls}"><p class="col-t">${tipo}</p>
    ${baralho.map((c) => `<div class="linha-imagem"><span class="bola-imagem">${c.ico}</span><span class="cod">${c.codigo}</span><span class="nome-imagem">${esc(semParenteses(c.nome))}</span></div>`).join('')}
  </div>`;
  const pagina3 = `<section class="page ico-pag">
  <h2><span>7</span>As imagens das cartas</h2>
  <p>Cada carta de contexto, persona e formato tem uma imagem só dela (nenhuma se repete), pensada para o aluno do 6º ano achar a carta rápido na mesa e na hora de dizer o código ao professor.</p>
  <div class="tres-colunas">${coluna('Contexto', 't-contexto', C)}${coluna('Persona', 't-persona', P)}${coluna('Formato', 't-formato', F)}</div>
  ${rodape()}
</section>`;

  // ------------------------------------------------------------ 4. os desenhos dos formatos
  const pagina4 = `<section class="page ico-pag">
  <h2><span>8</span>Os desenhos dos formatos</h2>
  <p>Além da imagem, cada carta de formato tem um desenho de como a resposta fica. Assim o aluno vê a forma da resposta antes de ler.</p>
  <div class="grade-formatos t-formato">${F.map((f) => `<div class="formato-ico">
    <div class="formato-desenho">${desenho[f.codigo]}</div>
    <p class="formato-nome"><span class="cod">${f.codigo}</span> ${f.ico} ${esc(semParenteses(f.nome))}</p>
    <p>${esc(f.texto)}</p>
  </div>`).join('')}</div>
  <div class="dicas">
    <p class="dicas-t">Como usar este manual</p>
    <ul>
      <li><b>Antes da 1ª partida:</b> mostre à turma as páginas 1 e 2. Assim, todos ficam sabendo de que baralho é cada carta e onde ela fica no tabuleiro.</li>
      <li><b>Durante a partida:</b> a página 3 ajuda o aluno a achar a carta pela imagem e dizer o código ao professor.</li>
      <li><b>Para imprimir:</b> abra o arquivo no Chrome, Ctrl+P, Salvar como PDF, margens Nenhuma. O tabuleiro tem o arquivo dele, em 2 folhas A4.</li>
    </ul>
  </div>
  ${rodape()}
</section>`;

  const paginas = [pagina1, pagina2, pagina3, pagina4];
  if (pagina !== TOTAL) throw new Error(`iconográfico: são ${pagina} páginas, não ${TOTAL}`);

  const css = `${cssDasCartas}
${tabuleiro.css}
.ico-pag { padding: 13mm 14mm 16mm; font-size: 10pt; line-height: 1.4; display: flex; flex-direction: column; gap: 2.4mm; }
.ico-pag p { margin: 0; }
.ico-pag h2 { display: flex; align-items: center; gap: 2.6mm; font-size: 14pt; margin: 2mm 0 0; color: #16274f; }
.ico-pag h2 > span { width: 8mm; height: 8mm; border-radius: 50%; background: #16274f; color: #fff; display: inline-flex; align-items: center; justify-content: center; font-size: 11pt; flex: none; }
.ico-rodape { position: absolute; left: 14mm; right: 14mm; bottom: 7mm; display: flex; justify-content: space-between; font-size: 8pt; color: #6b7489; border-top: .3mm solid #d6dbe6; padding-top: 1.6mm; }
.ico-topo { background: #16274f; color: #fff; margin: -13mm -14mm 1mm; padding: 13mm 14mm 7mm; }
.ico-rotulo { font-size: 10pt; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: #f2c14e; }
.ico-topo h1 { font-size: 32pt; line-height: 1.05; margin: 1.6mm 0 2mm; }
.ico-sub { font-size: 11.5pt; color: #dfe5f3; max-width: 160mm; }
.mini-carta { display: inline-block; flex: none; }
.mini-carta .card { border-color: transparent; background: #fff; border-radius: 3.6mm; box-shadow: 0 .5mm 2mm rgba(22, 39, 79, .22); }

.cores { display: grid; grid-template-columns: 1fr 1fr; gap: 3mm 5mm; }
.cor { display: flex; gap: 3mm; align-items: center; border-left: 1.4mm solid var(--c); background: var(--claro); border-radius: 0 2.4mm 2.4mm 0; padding: 2mm 3mm; font-size: 9.2pt; line-height: 1.35; }
.cor-nome { font-weight: 900; font-size: 11.5pt; color: var(--c); }
.cor-qual { font-weight: 700; font-size: 8.4pt; color: #4a5368; margin-bottom: .6mm !important; }

.partes { display: grid; grid-template-columns: auto 1fr; gap: 6mm; align-items: center; background: #f6f8fc; border-radius: 3mm; padding: 4mm 5mm; }
.partes-carta { position: relative; margin-left: 4mm; }
.marca { position: absolute; left: -5.4mm; width: 6.4mm; height: 6.4mm; border-radius: 50%; background: #16274f; color: #fff; font-size: 9pt; font-weight: 800; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 0 .6mm #fff; }
.marca.m1 { top: 3mm; } .marca.m2 { top: 23.5mm; } .marca.m3 { top: 34mm; } .marca.m4 { top: 43mm; } .marca.m5 { top: 63mm; }
.partes-lista { margin: 0; padding-left: 5mm; font-size: 9.8pt; } .partes-lista li { margin-bottom: 1.8mm; }

.assuntos-ico { display: grid; grid-template-columns: repeat(4, 1fr); gap: 3mm; }
.assuntos-ico div { display: flex; align-items: center; gap: 2.4mm; background: #f3f5f9; border-radius: 6mm; padding: 1.6mm 3mm 1.6mm 1.6mm; font-size: 10.4pt; }
.assunto-bola { width: 10mm; height: 10mm; border-radius: 50%; background: #fff; display: inline-flex; align-items: center; justify-content: center; font-size: 15pt; line-height: 1; border: .4mm solid #d6dbe6; font-family: 'Segoe UI Emoji', 'Noto Color Emoji', sans-serif; }
.assunto-bola.a-S { font-family: 'Segoe UI', Arial, sans-serif; font-weight: 900; }

.especiais-ico { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4mm; }
.especial-ico { display: flex; flex-direction: column; align-items: center; gap: 1.2mm; text-align: center; font-size: 9pt; line-height: 1.3; }
.especial-ico .mini-carta { margin-bottom: 1mm; }
.tab-mini { border-radius: 2mm; align-self: center; margin: 1mm 0; }
.menu-ico { display: grid; grid-template-columns: repeat(${MENU.length}, 1fr); gap: 3mm; }
.menu-ico div { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 1mm; font-size: 8.4pt; line-height: 1.32; }
.menu-bola { width: 13mm; height: 13mm; border-radius: 50%; background: #16274f; color: #fff; display: inline-flex; align-items: center; justify-content: center; }
.menu-bola svg { width: 7mm; height: 7mm; }
.menu-nome { font-weight: 800; font-size: 10pt; color: #16274f; }

.tres-colunas { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4mm; }
.col-imagens { display: flex; flex-direction: column; gap: 1.2mm; }
.col-t { font-weight: 900; font-size: 11pt; color: #fff; background: var(--c); border-radius: 1.6mm; padding: 1mm 2.4mm; letter-spacing: .06em; text-transform: uppercase; margin-bottom: .6mm !important; }
.linha-imagem { display: flex; align-items: center; gap: 2mm; font-size: 8.8pt; line-height: 1.2; min-height: 12.2mm; border-bottom: .3mm solid #e6e9f0; }
.bola-imagem { width: 10.5mm; height: 10.5mm; flex: none; border-radius: 50%; background: var(--claro); border: .45mm solid var(--c); display: inline-flex; align-items: center; justify-content: center; font-size: 16pt; line-height: 1; font-family: 'Segoe UI Emoji', 'Noto Color Emoji', 'Apple Color Emoji', sans-serif; }
.cod { font-weight: 800; color: var(--c); font-size: 8.4pt; flex: none; }
.nome-imagem { font-weight: 600; }

.grade-formatos { display: grid; grid-template-columns: repeat(4, 1fr); gap: 3mm; }
.formato-ico { border: .4mm solid #f0d2b4; border-radius: 2.4mm; padding: 2.4mm; display: flex; flex-direction: column; gap: 1.2mm; font-size: 8pt; line-height: 1.3; background: #fffaf5; }
.formato-desenho { color: var(--c); background: #fff; border-radius: 1.6mm; padding: 2mm; }
.formato-desenho svg { width: 100%; height: auto; display: block; }
.formato-nome { font-weight: 800; font-size: 8.8pt; color: #1b1f2a; }
.dicas { margin-top: 4mm; background: #e9edf6; border-radius: 3mm; padding: 3.4mm 4.4mm; font-size: 9.8pt; }
.dicas-t { font-weight: 800; color: #16274f; font-size: 11pt; margin-bottom: 1.4mm !important; }
.dicas ul { margin: 0; padding-left: 5mm; } .dicas li { margin-bottom: 1.4mm; }
`;

  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>${NOME} · manual iconográfico</title><style>${css}</style></head><body>${paginas.join('\n')}</body></html>`;
  return { html, paginas: paginas.length };
};
