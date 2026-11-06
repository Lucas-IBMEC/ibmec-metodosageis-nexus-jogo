// Manual do Professor (história 1.1.4): regras, o que cada carta ensina, como usar o aplicativo
// e as palavras de outras línguas. Montado pelo gerar.cjs com as mesmas cartas que vão para a impressão,
// então as imagens das cartas e o exemplo mudam sozinhos quando uma carta muda.
// As fotos das telas do aplicativo ficam em cartas/imagens (tiradas com o Chrome, sem internet).

module.exports = function montarManual(d) {
  const {
    NOME, GRUPO, ENDERECO_DO_APP, CARTAS_NA_MAO, MISSOES_NA_MESA, META, VEZ_SEGUNDOS, AJUDAS, COPIAS_FORMATO,
    ASSUNTO, formatos, missoes, contextos, personas, cartas, folhas, cartaPorCodigo, exemplo, RESPOSTAS,
    esc, curto, icone, cssDasCartas,
  } = d;

  const achar = (lista, codigo) => lista.find((x) => x[0] === codigo);
  const minuscula = (t) => t.charAt(0).toLowerCase() + t.slice(1);
  const totalFormatos = formatos.length * COPIAS_FORMATO;

  // Uma carta de verdade, em tamanho menor (zoom 0.4 = 40% do tamanho impresso)
  const mini = (codigo, zoom, extra = '') => `<div class="mini-carta ${extra}" style="zoom:${zoom}">${cartaPorCodigo[codigo]}</div>`;
  const verso = (zoom, extra = '') => `<div class="mini-carta ${extra}" style="zoom:${zoom}"><div class="verso"></div></div>`;
  const leque = (zoom) => `<div class="leque" style="zoom:${zoom}">${'<div class="verso"></div>'.repeat(CARTAS_NA_MAO)}</div>`;
  const pilha = (zoom) => `<div class="pilha" style="zoom:${zoom}"><div class="verso"></div><div class="verso"></div><div class="verso"></div></div>`;

  // ------------------------------------------------------------ o exemplo (o mesmo da folha de regras)
  const [missao, contexto, persona, formato] = [exemplo.missao, exemplo.contexto, exemplo.persona, exemplo.formato];
  const respostaBoa = RESPOSTAS.boas[missao[0]][formato[0]];
  const maoDoExemplo = [contexto[0], formato[0], 'C13', 'P07', exemplo.errado];
  const mesaDoExemplo = [missao[0], 'M02', 'M07'];
  // O exemplo só vale se a mão não fechava nenhuma outra missão antes da compra
  if (maoDoExemplo.includes(persona[0])) throw new Error('a persona do exemplo já está na mão');

  let pagina = 0;
  const rodape = () => `<footer class="rodape"><span>${NOME} · Manual do Professor</span><span>grupo ${GRUPO} · página ${++pagina}</span></footer>`;

  // ------------------------------------------------------------ 1. capa
  const capa = `<section class="page man capa">
  <div class="capa-topo">
    <p class="capa-rotulo">Manual do Professor</p>
    <h1>${NOME}</h1>
    <p class="capa-sub">Um jogo de cartas para aprender a escrever bons prompts, sem internet na sala de aula.</p>
  </div>
  <div class="capa-cartas">
    ${mini(missao[0], 0.68, 'gira-1')}${mini(contexto[0], 0.68, 'gira-2')}${mini(persona[0], 0.68, 'gira-3')}${mini(formato[0], 0.68, 'gira-4')}
  </div>
  <div class="numeros">
    <div><b>2 a 5</b><span>lados na mesa; até 40 alunos no modo Turma</span></div>
    <div><b>6 a 12 min</b><span>por partida (estimativa; vamos medir no teste)</span></div>
    <div><b>2 min</b><span>para explicar as regras</span></div>
    <div><b>${cartas.length}</b><span>cartas em ${folhas} folhas A4</span></div>
  </div>
  <div class="caixa para-quem">
    <p><b>Para quem é:</b> alunos do 6º ano do Ensino Fundamental até o Ensino Médio. Foi pensado para escolas sem internet ou com internet ruim: na mesa, os alunos só usam cartas de papel, e o aplicativo do professor funciona sem internet.</p>
  </div>
  <div class="capa-cols">
    <div>
      <h2>O que você precisa</h2>
      <ul>
        <li>As cartas impressas, a folha de regras e o gabarito (arquivo de cartas, ${folhas + 2} folhas).</li>
        <li>O seu celular com o aplicativo do professor. <b>Os alunos não usam celular.</b></li>
        <li>Sem celular? O gabarito impresso faz o mesmo papel.</li>
        <li>Não precisa saber nada de inteligência artificial: este manual explica tudo.</li>
      </ul>
    </div>
    <div>
      <h2>Neste manual</h2>
      <ol class="sumario">
        <li>O que o jogo ensina</li>
        <li>As cartas</li>
        <li>Preparação e modos de jogo</li>
        <li>A vez de cada lado, com exemplo</li>
        <li>Conferir no aplicativo</li>
        <li>Fim e casos especiais</li>
        <li>Como conduzir a aula</li>
        <li>Palavras de outras línguas</li>
      </ol>
    </div>
  </div>
  ${rodape()}
</section>`;

  // ------------------------------------------------------------ 2. o que o jogo ensina
  const partesDoPrompt = [
    ['t-persona', 'Persona', persona[3]],
    ['t-contexto', 'Contexto', contexto[3]],
    ['t-missao', 'Missão', `Tarefa: ${minuscula(missao[2])}`],
    ['t-formato', 'Formato', `Responda em formato de ${minuscula(curto(formato[0]))}.`],
  ];
  const ensina = `<section class="page man">
  <h2 class="secao"><span>1</span>O que o jogo ensina</h2>
  <p class="abre">Um <b>prompt</b> é o pedido que a gente escreve para uma inteligência artificial (IA) responder. Quanto mais claro o pedido, melhor a resposta. No jogo, um prompt tem <b>4 partes</b>, e cada parte é uma carta. Quando um lado junta as 4, o prompt fica pronto:</p>

  <div class="montagem">
    <div class="montagem-cartas">${mini(persona[0], 0.46)}${mini(contexto[0], 0.46)}${mini(missao[0], 0.46)}${mini(formato[0], 0.46)}</div>
    <div class="prompt-pronto">
      ${partesDoPrompt.map(([cls, tipo, texto]) => `<p class="${cls}"><span class="etq">${tipo}</span>${esc(texto)}</p>`).join('')}
    </div>
    <div class="resposta-ia">
      <p class="resposta-t">O aplicativo mostra uma resposta de exemplo da IA:</p>
      <p class="resposta-txt">${esc(respostaBoa).replace(/\n/g, '<br>')}</p>
    </div>
  </div>

  <h3>O que cada carta ensina</h3>
  <table class="tabela ensina">
    <tr><th>Carta</th><th>A pergunta que o aluno aprende a fazer</th><th>Por que a resposta melhora</th></tr>
    <tr class="t-missao"><td><b>Missão</b></td><td>O que eu quero?</td><td>Um pedido claro diz para a IA o que fazer. As missões são tarefas de escola, como explicar a dengue para uma criança.</td></tr>
    <tr class="t-contexto"><td><b>Contexto</b></td><td>Onde estou e o que está acontecendo?</td><td>A IA não sabe onde você mora nem o que está acontecendo. Contar a situação deixa a resposta certa para aquele lugar.</td></tr>
    <tr class="t-persona"><td><b>Persona</b></td><td>Quem a IA vai ser?</td><td>Pedir que a IA responda como alguém da área (uma médica, um técnico de futebol) muda as palavras e o cuidado da resposta.</td></tr>
    <tr class="t-formato"><td><b>Formato</b></td><td>Como a resposta deve chegar para quem vai ler?</td><td>O mesmo conteúdo ajuda mais ou menos conforme a forma: passo a passo para quem vai fazer, cartaz para quem passa no corredor.</td></tr>
  </table>

  <div class="caixa estrelas-caixa">
    <p><b>Por que as estrelas.</b> O contexto e a persona precisam ter o ícone do assunto da missão: as partes do prompt precisam combinar. O formato é a escolha que mais faz pensar: vale <b>★★★</b> quando ajuda quem vai ler e <b>★★</b> quando não ajuda tanto. Assim, a cada jogada o aluno pergunta: <i>quem vai ler essa resposta?</i></p>
  </div>
  ${rodape()}
</section>`;

  // ------------------------------------------------------------ 3. as cartas
  const qtd = (tipo) => ({ missao: missoes.length, contexto: contextos.length, persona: personas.length, formato: totalFormatos }[tipo]);
  const explicaCarta = [
    [missao[0], 'Missão', `${qtd('missao')} cartas`, 'O pedido, com o ícone do assunto. Fica aberta no meio da mesa: qualquer lado pode fazer.', 'Dá as estrelas para quem bater nela.'],
    [contexto[0], 'Contexto', `${qtd('contexto')} cartas`, 'A situação, contada por quem pede: de onde fala e o que está acontecendo.', 'Precisa ter o mesmo ícone da missão.'],
    [persona[0], 'Persona', `${qtd('persona')} cartas`, 'Quem a IA vai ser ao responder. A frase de baixo é como ela entra no prompt.', 'Precisa ter o mesmo ícone da missão.'],
    [formato[0], 'Formato', `${totalFormatos} cartas (${formatos.length} tipos, ${COPIAS_FORMATO} de cada)`, 'Como a resposta chega para quem vai ler. O desenho mostra a forma.', 'Serve em qualquer missão: ★★★ ou ★★.'],
    ['RESUMO', 'Resumo da vez', `${AJUDAS} cartas, 1 por lado`, 'Os 3 passos da vez e as estrelas. Não entra no monte.', 'Fica na frente de cada lado, para consultar.'],
  ];
  const asCartas = `<section class="page man">
  <h2 class="secao"><span>2</span>As cartas</h2>
  <p class="abre">São ${cartas.length} cartas, impressas só de um lado. O <b>código</b> no canto de cima (como ${missao[0]} ou ${contexto[0]}) é o que você digita no aplicativo. O <b>ícone</b> mostra o assunto: ${Object.keys(ASSUNTO).map((a) => `<span class="sem-quebra">${icone(a)} ${ASSUNTO[a].nome}</span>`).join(' · ')}.</p>
  <div class="cartas-explicadas">
    ${explicaCarta.map(([codigo, nome, quantas, oQue, regra]) => `<div class="carta-explicada">
      ${mini(codigo, 0.6)}
      <div><p class="ce-nome">${nome}</p><p class="ce-qtd">${quantas}</p><p>${oQue}</p><p class="ce-regra">${regra}</p></div>
    </div>`).join('')}
    <div class="carta-explicada contas">
      <div>
        <p class="ce-nome">Quantas de cada assunto</p>
        <table class="tabela mini-tab">
          <tr><th></th><th>Missões</th><th>Contextos</th><th>Personas</th></tr>
          ${Object.keys(ASSUNTO).map((a) => `<tr><td class="sem-quebra">${icone(a)} ${ASSUNTO[a].nome}</td><td>${missoes.filter((m) => m[1] === a).length}</td><td>${contextos.filter((c) => c[1] === a).length}</td><td>${personas.filter((p) => p[1] === a).length}</td></tr>`).join('')}
        </table>
        <p class="ce-regra">Os formatos não têm assunto. A lista de todas as cartas está no gabarito.</p>
      </div>
    </div>
  </div>
  <div class="caixa imprimir">
    <p><b>Como imprimir:</b> imprima as ${folhas} folhas de cartas em A4, coloridas, de preferência em papel mais grosso (cartolina ou papel de 180 g). Corte nas linhas tracejadas: cada folha tem 9 cartas do tamanho de uma carta de baralho. A folha de regras e o gabarito podem ser em papel comum. Guarde cada jogo num envelope.</p>
  </div>
  ${rodape()}
</section>`;

  // ------------------------------------------------------------ 4. preparação
  const preparacao = `<section class="page man">
  <h2 class="secao"><span>3</span>Preparação e modos de jogo</h2>
  <div class="prep">
    <div>
      <ol class="passos-grandes">
        <li><b>Divida a turma em lados.</b> Cada lado é 1 aluno, uma dupla ou um grupo (veja os modos abaixo).</li>
        <li><b>Missões:</b> embaralhe e vire ${MISSOES_NA_MESA} para cima no meio da mesa. As outras ficam num montinho ao lado, viradas para baixo.</li>
        <li><b>Monte:</b> embaralhe juntos os contextos, as personas e os formatos.</li>
        <li><b>Mão:</b> dê ${CARTAS_NA_MAO} cartas do monte e 1 resumo da vez para cada lado. Cada lado esconde as suas cartas.</li>
        <li><b>Lixo:</b> vire 1 carta do monte para cima, ao lado dele.</li>
        <li><b>Aplicativo:</b> na página Partida, escolha o modo, cadastre os lados e toque em <b>Sortear quem começa</b>. Depois, a vez segue no sentido horário.</li>
      </ol>
    </div>
    <figure class="mesa-figura">
      <div class="feltro">
        <div class="lugar"><span class="rot">Lado 2</span>${leque(0.3)}</div>
        <div class="lugar"><span class="rot">${MISSOES_NA_MESA} missões abertas</span><div class="junto">${mesaDoExemplo.map((c) => mini(c, 0.32)).join('')}</div></div>
        <div class="fila">
          <div class="lugar"><span class="rot">outras missões</span>${pilha(0.3)}</div>
          <div class="lugar"><span class="rot">monte</span>${pilha(0.3)}</div>
          <div class="lugar"><span class="rot">lixo</span>${mini(exemplo.errado, 0.3)}</div>
        </div>
        <div class="lugar"><span class="rot">Lado 1</span>${leque(0.3)}</div>
      </div>
      <figcaption>A mesa no começo de um duelo. Com mais lados, cada um senta em volta, com as suas ${CARTAS_NA_MAO} cartas.</figcaption>
    </figure>
  </div>

  <h3>Modos de jogo</h3>
  <table class="tabela">
    <tr><th>Modo</th><th>Quantos alunos</th><th>Como fica</th></tr>
    <tr><td><b>Duelo</b></td><td>2 a 4</td><td>1 contra 1, ou dupla contra dupla (cada dupla é um lado).</td></tr>
    <tr><td><b>Mesa</b></td><td>3 a 10</td><td>3 a 5 lados, todos contra todos. Cada lado é 1 aluno ou 1 dupla.</td></tr>
    <tr><td><b>Turma</b></td><td>até 40</td><td>Até 5 grupos, numa mesa grande ou no chão. Cada grupo decide junto, e quem segura as cartas troca a cada vez. Com uma turma grande, imprima mais de um jogo e faça várias mesas.</td></tr>
  </table>
  <p class="nota-pe">Dica: no modo Turma, escreva no quadro a ordem dos grupos. Os grupos que esperam a vez podem ir pensando em qual formato ajuda cada missão da mesa.</p>
  ${rodape()}
</section>`;

  // ------------------------------------------------------------ 5. a vez, com exemplo
  const vez = `<section class="page man">
  <h2 class="secao"><span>4</span>A vez de cada lado <small>até ${VEZ_SEGUNDOS} segundos</small></h2>
  <div class="tres-passos">
    <div><span class="n">1</span><b>Compre 1</b>a de cima do monte ou a de cima do lixo.</div>
    <div><span class="n">2</span><b>Fechou um prompt? Bata!</b>Contexto e persona com o ícone de uma missão da mesa + 1 formato.</div>
    <div><span class="n">3</span><b>Descarte 1</b>no lixo. Cada lado termina a vez sempre com ${CARTAS_NA_MAO} cartas.</div>
  </div>

  <h3>Exemplo de uma vez</h3>
  <div class="quadro-ex">
    <p class="ex-t"><span class="n">a</span><span>Na mesa estão estas ${MISSOES_NA_MESA} missões.</span></p>
    <div class="junto">${mesaDoExemplo.map((c) => mini(c, 0.4)).join('')}</div>
  </div>
  <div class="quadro-ex">
    <p class="ex-t"><span class="n">b</span><span>O Lado 1 tem estas ${CARTAS_NA_MAO} cartas e compra <b>${persona[0]} ${esc(persona[2])}</b> do monte.</span></p>
    <div class="junto">${maoDoExemplo.map((c) => mini(c, 0.4)).join('')}<span class="mais">+</span>${mini(persona[0], 0.4, 'destaque')}</div>
  </div>
  <div class="quadro-ex">
    <p class="ex-t"><span class="n">c</span><span>Fechou a ${missao[0]} ${icone(missao[1])}: contexto ${icone(contexto[1])} + persona ${icone(persona[1])} + formato. O Lado 1 bate e mostra as 4 cartas.</span></p>
    <div class="junto">${mini(missao[0], 0.4)}<span class="mais">=</span>${mini(contexto[0], 0.4)}${mini(persona[0], 0.4)}${mini(formato[0], 0.4)}</div>
  </div>
  <div class="ex-fim">
    <p><span class="n">d</span><span>O professor digita ${missao[0]}, ${contexto[0]}, ${persona[0]} e ${formato[0]} no aplicativo: <b>★★★</b>, porque um passo a passo ajuda quem vai fazer o aquecimento. Com ${exemplo.errado} ${esc(curto(exemplo.errado))}, seriam <b>★★</b>.</span></p>
    <p><span class="n">e</span><span>O Lado 1 fica com a ${missao[0]}, põe as 3 cartas embaixo do monte, compra 3, vira uma missão nova no lugar e descarta 1. Agora é a vez do próximo lado.</span></p>
  </div>
  ${rodape()}
</section>`;

  // ------------------------------------------------------------ 6. aplicativo
  const tela = (arquivo, legenda) => `<figure class="tela"><div class="celular"><img src="imagens/${arquivo}" alt=""></div><figcaption>${legenda}</figcaption></figure>`;
  const aplicativo = `<section class="page man">
  <h2 class="secao"><span>5</span>Conferir no aplicativo</h2>
  <p class="abre">O aplicativo do professor marca as estrelas, o tempo da vez e confere cada prompt. Ele abre no navegador do celular, neste endereço:</p>
  <p class="endereco">${ENDERECO_DO_APP}</p>
  <div class="telas">
    ${tela('app-partida.png', '<b>Partida:</b> as estrelas de cada lado, de quem é a vez e o cronômetro.')}
    ${tela('app-missao.png', '<b>Missão:</b> escolha a missão e digite as 3 cartas de quem bateu.')}
    ${tela('app-resultado.png', '<b>Resultado:</b> as estrelas, o prompt que as cartas formam e uma resposta de exemplo.')}
  </div>
  <div class="app-cols">
    <ol class="passos-grandes">
      <li><b>Antes da aula, com internet:</b> abra o endereço no celular. Depois da primeira vez, ele funciona sem internet. No menu do navegador, toque em <i>Adicionar à tela inicial</i> para abrir como um aplicativo.</li>
      <li><b>Partida:</b> escolha o modo, quantos lados e os nomes. Toque em <b>Começar partida</b> e em <b>Sortear quem começa</b>.</li>
      <li><b>Cronômetro:</b> toque em <b>Iniciar</b> no começo de cada vez. Quando a vez acabar, toque em <b>Passar a vez</b>.</li>
    </ol>
    <ol class="passos-grandes" start="4">
      <li><b>Alguém bateu?</b> Abra a página <b>Missão</b>, escolha a missão e digite os códigos das 3 cartas (toque na letra e digite o número).</li>
      <li><b>Confira o resultado</b> e toque no nome do lado para dar as estrelas. Errou? Toque em <b>Desfazer</b>.</li>
      <li><b>Quando alguém chegar a ${META} estrelas,</b> o aplicativo avisa e mostra o placar final.</li>
    </ol>
  </div>
  <p class="nota-pe">As páginas <b>Cartas</b> (procurar uma carta pelo código ou pelo nome) e <b>Regras</b> (o resumo das regras) também funcionam sem internet. Sem celular, use o gabarito impresso: ele tem as mesmas respostas.</p>
  ${rodape()}
</section>`;

  // ------------------------------------------------------------ 7. fim, casos especiais e a aula
  const aula = `<section class="page man">
  <h2 class="secao"><span>6</span>Fim e casos especiais</h2>
  <div class="caixa ganha-caixa"><p><b>Ganha quem chegar a ${META} estrelas primeiro</b> (2 ou 3 missões). O aplicativo avisa.</p></div>
  <table class="tabela casos">
    <tr><th>Se acontecer</th><th>Faça assim</th></tr>
    <tr><td>Bateu sem o ícone certo</td><td>Não vale. As cartas voltam para a mão, o lado descarta 1 e passa a vez. Não diga se o formato servia: a missão continua na mesa.</td></tr>
    <tr><td>Duas missões com o mesmo ícone</td><td>O lado escolhe para qual vai bater.</td></tr>
    <tr><td>Acabou o tempo da vez</td><td>O lado descarta 1 carta e passa a vez.</td></tr>
    <tr><td>O monte acabou</td><td>Embaralhe o lixo, menos a carta de cima, e faça um monte novo.</td></tr>
    <tr><td>As missões acabaram (só com 5 lados)</td><td>Ganha quem tiver mais estrelas. Empate: quem fez mais missões com ★★★.</td></tr>
  </table>

  <h2 class="secao"><span>7</span>Como conduzir a aula</h2>
  <div class="aula-cols">
    <div class="momento"><p class="mom-t">Antes · 2 minutos</p><p>Mostre o resumo da vez e leia os 3 passos. Depois, faça uma vez de exemplo em voz alta, com as cartas na mão.</p></div>
    <div class="momento"><p class="mom-t">Durante</p><p>Quando alguém bater, leia em voz alta o prompt que o aplicativo monta e pergunte: <i>para quem é essa resposta? Esse formato ajuda essa pessoa?</i></p><p><b>A palavra final é sua.</b> Se um lado defender bem outro formato, você pode mudar as estrelas com os botões + e − do placar.</p></div>
    <div class="momento"><p class="mom-t">Depois · 5 minutos</p><p>Cada lado mostra uma missão que fez e diz por que escolheu aquele formato. Para fechar, cada aluno escreve no caderno um prompt com as 4 partes para um problema da escola.</p></div>
  </div>
  <div class="caixa etica">
    <p class="mom-t">Para conversar com a turma: usar a IA com cuidado</p>
    <ul>
      <li><b>Dados pessoais:</b> não coloque no prompt nome completo, endereço, telefone ou foto de ninguém. As cartas de contexto do jogo não têm dados pessoais por isso.</li>
      <li><b>A IA erra:</b> ela pode inventar coisas com muita certeza. Confira a resposta num livro ou numa página de confiança na internet, como as do governo.</li>
      <li><b>Preconceito:</b> a resposta pode repetir ideias injustas sobre pessoas e lugares. Se acontecer, mude o prompt e converse sobre isso.</li>
    </ul>
  </div>
  ${rodape()}
</section>`;

  // ------------------------------------------------------------ 8. palavras de outras línguas
  const linha = (palavra, lingua, quer, porque) => `<tr><td><b>${palavra}</b></td><td>${lingua}</td><td>${quer}</td><td>${porque}</td></tr>`;
  const trocas = [
    ['Magic Prompt', NOME, 'nome do jogo, nas cartas, no manual e no aplicativo'],
    ['app, companion app', 'aplicativo, aplicativo do professor', 'regras, gabarito, manual e telas do aplicativo'],
    ['playtest', 'partida de teste', 'folha de regras e aplicativo'],
    ['fast-food', 'hambúrguer e batata frita', `carta C03 ${esc(achar(contextos, 'C03')[2])}`],
    ['tai chi', 'ginástica', `carta C08 ${esc(achar(contextos, 'C08')[2])}`],
    ['engenheiro de software', 'engenheiro de computação', 'carta P05'],
    ['Aedes aegypti, site, link', 'mosquito da dengue, página, endereço', 'respostas de exemplo do aplicativo'],
  ];
  const glossario = `<section class="page man">
  <h2 class="secao"><span>8</span>Palavras de outras línguas</h2>
  <p class="abre">O professor pediu que o jogo e a documentação fossem em português (Revisão da Sprint 4, em 04/11/2026). A regra que seguimos: <b>se existe palavra em português que diz o mesmo, usamos a palavra em português.</b> Por isso, o material diz <i>aplicativo</i> e não <i>app</i>, <i>partida de teste</i> e não <i>playtest</i>, e o nome do jogo é <i>${NOME}</i>. Ficam em outra língua só os nomes próprios e as palavras que os alunos e o professor vão encontrar com esse nome fora da sala.</p>

  <h3>No jogo e neste manual</h3>
  <table class="tabela glossario">
    <tr><th>Palavra</th><th>Língua</th><th>O que quer dizer</th><th>Por que fica assim</th></tr>
    ${linha('prompt', 'inglês', 'O pedido (o texto) que a gente escreve para uma IA responder.', 'É o nome usado nos aplicativos de IA, nas notícias e no trabalho. Aprender o nome certo faz parte do que o jogo ensina. Em português, seria “comando” ou “pedido”.')}
    ${linha('persona', 'latim', 'O papel que alguém assume. No jogo, quem a IA vai ser ao responder.', 'É o nome usado nos guias de como escrever prompts. A palavra vem da máscara que os atores usavam no teatro romano.')}
    ${linha('internet', 'inglês', 'A rede que liga computadores e celulares do mundo todo.', 'Todo mundo no Brasil usa essa palavra, e não há outra em português de uso comum.')}
    ${linha('nomes de lugares', 'várias', 'As cidades dos contextos, como Boston, Chicago, Miami, Bangalore e Hangzhou.', 'São nomes próprios. Usamos a forma em português quando ela existe (Nova York, Xangai, Cantão, Copenhague, Vale do Silício).')}
    ${linha('nomes de pessoas', 'inglês', 'James Naismith, que inventou o basquete, numa das respostas de exemplo.', 'É nome próprio, não se traduz.')}
  </table>

  <h3>O que trocamos por português</h3>
  <table class="tabela trocas">
    <tr><th>Antes</th><th>Agora</th><th>Onde</th></tr>
    ${trocas.map(([antes, agora, onde]) => `<tr><td>${antes}</td><td><b>${agora}</b></td><td>${onde}</td></tr>`).join('')}
  </table>
  ${rodape()}
</section>
<section class="page man">
  <h2 class="secao"><span>8</span>Palavras de outras línguas <small>continuação</small></h2>
  <h3>Na documentação do projeto (quadro de tarefas e repositório)</h3>
  <table class="tabela glossario">
    <tr><th>Palavra</th><th>Língua</th><th>O que quer dizer</th><th>Por que fica assim</th></tr>
    ${linha('Scrum, Kanban e ScrumBan', 'inglês e japonês', 'Nomes de métodos ágeis. Kanban quer dizer “placa” ou “cartão de sinalização” em japonês; ScrumBan junta os dois.', 'São nomes próprios dos métodos estudados na disciplina.')}
    ${linha('Sprint', 'inglês', 'Corrida curta: cada ciclo de trabalho de 1 ou 2 semanas.', 'O Guia do Scrum em português mantém o nome em inglês.')}
    ${linha('Backlog', 'inglês', 'A lista de tudo o que falta fazer no produto (ou na sprint).', 'Idem: nome do Guia do Scrum.')}
    ${linha('Product Owner (PO), Scrum Master (SM) e Devs', 'inglês', 'Os papéis do time: quem decide o produto, quem cuida do método e quem desenvolve.', 'Idem: nomes dos papéis no Guia do Scrum.')}
    ${linha('To do, Doing, Sprint Done, Feedback, Postponed/Fixed e Due Date', 'inglês', 'A fazer, fazendo, pronto na sprint, esperando opinião, adiado ou fixo, e prazo.', 'São as colunas e os campos do quadro modelo que o professor da disciplina deu. Mantivemos para ele reconhecer o quadro.')}
    ${linha('WIP', 'inglês', '“Trabalho em andamento”: o limite de tarefas na coluna Fazendo.', 'Termo do Kanban, usado com esse nome na aula.')}
    ${linha('Weekly, Keep / Stop / Start e Planning Poker', 'inglês', 'Reunião semanal; o que manter, parar e começar (na retrospectiva); estimar o tamanho das tarefas com cartas.', 'Nomes usados nas aulas da disciplina.')}
    ${linha('companion app', 'inglês', 'O aplicativo do professor que acompanha o jogo.', 'Foi o nome usado pelo cliente na Revisão da Sprint 1 e ficou no tema 2 do quadro. No material do jogo, dizemos “aplicativo do professor”.')}
    ${linha('playtest', 'inglês', 'Partida de teste do jogo com jogadores de verdade.', 'Aparece no nome de algumas tarefas do quadro. No material do jogo, dizemos “partida de teste”.')}
    ${linha('MVP', 'inglês', 'Produto mínimo viável: a menor versão do produto que já dá para testar.', 'Aparece no nome de uma tarefa do quadro; é a sigla usada em projetos ágeis.')}
    ${linha('Roadmap e pitch', 'inglês', 'O mapa das entregas ao longo das sprints; a apresentação curta do produto.', 'O roadmap é um cartão do quadro; pitch é como a disciplina chama a apresentação final (18/11).')}
    ${linha('NEXUS', 'latim', 'Ligação, conexão (em português, “nexo”).', 'É o nome do nosso grupo.')}
    ${linha('Notion, Miro, Figma, GitHub, HTML, CSS e JavaScript', 'inglês', 'Os programas e as linguagens que usamos para organizar e fazer o projeto.', 'São nomes próprios, sem tradução.')}
  </table>
  ${rodape()}
</section>`;

  const paginas = [capa, ensina, asCartas, preparacao, vez, aplicativo, aula, glossario];
  const totalDePaginas = (paginas.join('').match(/<section class="page/g) || []).length;

  // ------------------------------------------------------------ estilo do manual
  const css = `${cssDasCartas}
.man { padding: 13mm 14mm 16mm; font-size: 10.2pt; line-height: 1.4; display: flex; flex-direction: column; gap: 2.6mm; }
.man p { margin: 0; }
.man ul, .man ol { margin: 0; padding-left: 5mm; } .man li { margin-bottom: 1.2mm; }
.man h2 { font-size: 13pt; margin: 1mm 0 0; color: #16274f; }
.man h3 { font-size: 11pt; margin: 2mm 0 0; color: #16274f; }
.man b { font-weight: 700; }
.secao { display: flex; align-items: center; gap: 3mm; font-size: 17pt !important; margin: 0 0 1mm !important; }
.secao > span { width: 9mm; height: 9mm; border-radius: 50%; background: #16274f; color: #fff; display: inline-flex; align-items: center; justify-content: center; font-size: 13pt; flex: none; }
.secao small { font-size: 10pt; font-weight: 600; color: #4a5368; margin-left: 1mm; }
.abre { font-size: 10.6pt; }
.rodape { position: absolute; left: 14mm; right: 14mm; bottom: 7mm; display: flex; justify-content: space-between; font-size: 8pt; color: #6b7489; border-top: 0.3mm solid #d6dbe6; padding-top: 1.6mm; }
.sem-quebra { white-space: nowrap; }
.nota-pe { font-size: 9pt; color: #4a5368; }

/* cartas de verdade, menores */
.mini-carta { display: inline-block; flex: none; }
.mini-carta .card { border-color: transparent; background: #fff; border-radius: 3.6mm; box-shadow: 0 .5mm 2mm rgba(22, 39, 79, .22); }
.mini-carta.destaque .card { box-shadow: 0 0 0 1.6mm #198754, 0 .5mm 2mm rgba(22, 39, 79, .22); }
.verso { width: 63mm; height: 88mm; border-radius: 3.6mm; background: #eef1f6; border: .8mm solid #c3cad8; box-shadow: 0 .5mm 2mm rgba(22, 39, 79, .22); }
.leque { display: flex; padding: 4mm 6mm 0; }
.leque .verso { flex: none; transform-origin: 50% 120%; }
.leque .verso + .verso { margin-left: -46mm; }
.leque .verso:nth-child(1) { transform: rotate(-14deg); } .leque .verso:nth-child(2) { transform: rotate(-7deg); }
.leque .verso:nth-child(4) { transform: rotate(7deg); } .leque .verso:nth-child(5) { transform: rotate(14deg); }
.pilha { position: relative; width: 67mm; height: 92mm; }
.pilha .verso { position: absolute; }
.pilha .verso:nth-child(1) { left: 4mm; top: 4mm; } .pilha .verso:nth-child(2) { left: 2mm; top: 2mm; } .pilha .verso:nth-child(3) { left: 0; top: 0; }
.junto { display: flex; align-items: center; gap: 2.4mm; flex-wrap: wrap; }
.mais { font-size: 16pt; font-weight: 800; color: #4a5368; padding: 0 1mm; }

/* capa */
.capa { gap: 4mm; }
.capa-topo { background: #16274f; color: #fff; margin: -13mm -14mm 0; padding: 16mm 14mm 10mm; }
.capa-rotulo { font-size: 10pt; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: #f2c14e; }
.capa h1 { font-size: 40pt; line-height: 1.05; margin: 2mm 0 3mm; letter-spacing: -.01em; }
.capa-sub { font-size: 13pt; max-width: 150mm; color: #dfe5f3; }
.capa-cartas { display: flex; justify-content: center; align-items: center; gap: 2.6mm; padding: 5mm 0 3mm; }
.gira-1 { transform: rotate(-6deg) translateY(3mm); } .gira-2 { transform: rotate(-2deg); }
.gira-3 { transform: rotate(2deg); } .gira-4 { transform: rotate(6deg) translateY(3mm); }
.para-quem { background: #e9edf6; font-size: 10.4pt; }
.imprimir { background: #f3f5f9; border: .4mm dashed #9aa3b5; font-size: 9.6pt; margin-top: 2mm; }
.numeros { display: grid; grid-template-columns: repeat(4, 1fr); gap: 3mm; }
.numeros div { background: #f3f5f9; border-radius: 2.4mm; padding: 2.6mm 3mm; display: flex; flex-direction: column; gap: .6mm; }
.numeros b { font-size: 15pt; color: #16274f; line-height: 1.1; }
.numeros span { font-size: 8.6pt; line-height: 1.3; color: #4a5368; }
.capa-cols { display: grid; grid-template-columns: 1.25fr 1fr; gap: 8mm; }
.sumario li { margin-bottom: .6mm; }

/* o que o jogo ensina */
.montagem { display: grid; grid-template-columns: auto 1fr; gap: 2.4mm 5mm; align-items: center; background: #f6f8fc; border-radius: 3mm; padding: 4mm; }
.montagem-cartas { display: grid; grid-template-columns: repeat(2, auto); gap: 2.4mm; grid-row: span 2; }
.prompt-pronto { background: #fff; border-radius: 2.4mm; border: .4mm solid #d6dbe6; padding: 3mm 3.4mm; display: flex; flex-direction: column; gap: 1.6mm; font-size: 10.4pt; font-family: Consolas, 'Courier New', monospace; }
.prompt-pronto p { border-left: 1.2mm solid var(--c); padding-left: 2.4mm; }
.etq { display: block; font-family: 'Segoe UI', Arial, sans-serif; font-size: 7.4pt; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; color: var(--c); }
.resposta-ia { font-size: 9.4pt; }
.resposta-t { font-weight: 700; color: #4a5368; margin-bottom: 1mm !important; }
.resposta-txt { background: #e9f6ef; border-radius: 2.4mm; padding: 2.4mm 3mm; line-height: 1.45; }
.tabela { width: 100%; border-collapse: collapse; font-size: 9.6pt; }
.tabela th, .tabela td { border: .3mm solid #d6dbe6; padding: 1.8mm 2.4mm; text-align: left; vertical-align: top; }
.tabela th { background: #eef2f8; font-size: 9pt; }
.ensina td:first-child { border-left: 1.6mm solid var(--c); white-space: nowrap; }
.ensina td:first-child b { color: var(--c); }
.caixa { border-radius: 2.6mm; padding: 3mm 3.6mm; }
.estrelas-caixa { background: #fff6dc; border: .4mm solid #e0b84a; }
.estrelas-caixa b { color: #8a5a00; }

/* as cartas */
.cartas-explicadas { display: grid; grid-template-columns: 1fr 1fr; gap: 4mm 6mm; margin-top: 1mm; }
.carta-explicada { display: flex; gap: 3.4mm; align-items: center; font-size: 9.4pt; line-height: 1.36; }
.carta-explicada p { margin-bottom: 1mm; }
.ce-nome { font-size: 12pt; font-weight: 800; color: #16274f; margin: 0 !important; }
.ce-qtd { font-size: 8.6pt; color: #4a5368; font-weight: 600; }
.ce-regra { font-weight: 700; color: #16274f; }
.contas { align-items: center; }
.mini-tab { font-size: 8.8pt; margin: 1.6mm 0 2mm; } .mini-tab td, .mini-tab th { padding: 1mm 1.8mm; text-align: center; } .mini-tab td:first-child { text-align: left; }

/* preparação */
.prep { display: grid; grid-template-columns: 1fr 98mm; gap: 6mm; align-items: start; }
.passos-grandes { padding-left: 6mm !important; }
.passos-grandes li { margin-bottom: 2.2mm; }
.mesa-figura { margin: 0; }
.feltro { background: #e3f1e8; border: .6mm solid #a9d3b8; border-radius: 6mm; padding: 3mm 3mm 4mm; display: flex; flex-direction: column; align-items: center; gap: 3mm; }
.fila { display: flex; gap: 5mm; justify-content: center; align-items: flex-end; }
.lugar { display: flex; flex-direction: column; align-items: center; gap: 1.2mm; }
.rot { font-size: 8pt; font-weight: 800; color: #2c5e3f; text-transform: uppercase; letter-spacing: .05em; }
.mesa-figura figcaption { font-size: 8.6pt; color: #4a5368; margin-top: 1.6mm; text-align: center; }

/* a vez */
.tres-passos { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3mm; }
.tres-passos div { background: #e9edf6; border-radius: 2.6mm; padding: 3mm; font-size: 9.6pt; line-height: 1.35; display: flex; flex-direction: column; gap: .8mm; }
.tres-passos b { font-size: 11pt; color: #16274f; }
.n { width: 6.4mm; height: 6.4mm; border-radius: 50%; background: #16274f; color: #fff; font-weight: 800; font-size: 9.6pt; display: inline-flex; align-items: center; justify-content: center; flex: none; }
.tres-passos .n { margin-bottom: .6mm; }
.quadro-ex { display: flex; flex-direction: column; gap: 2mm; border-top: .3mm solid #d6dbe6; padding-top: 2.4mm; }
.ex-t { display: flex; gap: 2.4mm; align-items: center; font-size: 10pt; }
.ex-t .n, .ex-fim .n { background: #c98a00; }
.ex-fim { display: flex; flex-direction: column; gap: 2mm; border-top: .3mm solid #d6dbe6; padding-top: 2.4mm; font-size: 10pt; }
.ex-fim p { display: flex; gap: 2.4mm; align-items: flex-start; }

/* aplicativo */
.endereco { font-family: Consolas, 'Courier New', monospace; font-size: 11pt; font-weight: 700; background: #eef2f8; border-radius: 1.6mm; padding: 1.6mm 3mm; align-self: flex-start; white-space: nowrap; }
.telas { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4mm; margin: 1mm 0; }
.tela { margin: 0; display: flex; flex-direction: column; gap: 2mm; align-items: center; }
.celular { width: 56mm; height: 115mm; overflow: hidden; border: 1.4mm solid #1b1f2a; border-radius: 6mm; background: #f3f5f9; }
/* a foto tem 600 px de largura e o aplicativo ocupa os 375 px da esquerda: o resto fica escondido */
.celular img { width: calc((56mm - 2.8mm) * 600 / 375); display: block; }
.tela figcaption { font-size: 8.8pt; line-height: 1.32; text-align: center; color: #2b3245; }
.app-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 6mm; font-size: 9.8pt; }

/* fim e aula */
.ganha-caixa { background: #e3f4ea; border: .4mm solid #7cc49c; font-size: 11pt; }
.casos td:first-child { font-weight: 700; width: 52mm; }
.aula-cols { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3mm; }
.momento { background: #f3f5f9; border-radius: 2.6mm; padding: 3mm; font-size: 9.6pt; display: flex; flex-direction: column; gap: 1.6mm; }
.mom-t { font-weight: 800; font-size: 9pt; letter-spacing: .05em; text-transform: uppercase; color: #16274f; }
.etica { background: #fff0e2; border: .4mm solid #f0b27a; font-size: 9.6pt; display: flex; flex-direction: column; gap: 1.6mm; }

/* glossário */
.glossario { font-size: 9.2pt; line-height: 1.34; }
.glossario th, .glossario td { padding: 1.6mm 2.2mm; }
.glossario td:first-child { width: 38mm; } .glossario td:nth-child(2) { width: 19mm; }
.trocas { font-size: 9.2pt; } .trocas td { padding: 1.4mm 2.2mm; } .trocas td:first-child { text-decoration: line-through; color: #6b7489; width: 44mm; }
`;

  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>${NOME} · Manual do Professor</title><style>${css}</style></head><body>${paginas.join('')}</body></html>`;
  return { html, paginas: totalDePaginas };
};
