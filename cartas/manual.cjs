// Manual do Professor (história 1.1.4): regras, o que cada carta ensina, como usar o aplicativo
// e as palavras de outras línguas. Montado pelo gerar.cjs com as mesmas cartas que vão para a impressão,
// então as imagens das cartas, as notas e o exemplo mudam sozinhos quando uma carta muda.
// As fotos das telas do aplicativo ficam em cartas/imagens (tiradas com o Chrome, sem internet).

module.exports = function montarManual(d) {
  const {
    NOME, GRUPO, ENDERECO_DO_APP, RODADAS, COMPRA, MAX_LADOS,
    ASSUNTO, ORDEM, MINUSCULOS, M, C, P, F, cartas, folhas, cartaPorCodigo, versoPorTipo,
    exemplo, NOTA, esc, icone, semParenteses, minuscula, cssDasCartas,
  } = d;

  // Uma carta de verdade, em tamanho menor (zoom 0.4 = 40% do tamanho impresso)
  const mini = (codigo, zoom, extra = '') => `<div class="mini-carta ${extra}" style="zoom:${zoom}">${cartaPorCodigo[codigo]}</div>`;
  const miniVerso = (tipo, zoom) => `<div class="mini-carta" style="zoom:${zoom}">${versoPorTipo[tipo]}</div>`;
  const versos = (quantos, zoom, cor = '') => `<div class="junto versos" style="zoom:${zoom}">${`<div class="verso ${cor}"></div>`.repeat(quantos)}</div>`;
  const monte = (zoom, cor, rotulo) => `<div class="lugar"><span class="rot">${rotulo}</span><div class="pilha" style="zoom:${zoom}"><div class="verso ${cor}"></div><div class="verso ${cor}"></div><div class="verso ${cor}"></div></div></div>`;
  const icones = (m) => m.assuntos.map(icone).join(' ');
  const nomesDosAssuntos = (m) => NOTA.juntar(m.assuntos.map((a) => ASSUNTO[a].minusculo));

  // ------------------------------------------------------------ o exemplo (o mesmo da folha de regras)
  const { missao, compra, lado1, lado2 } = exemplo;
  const [contexto, persona, formato] = lado1;
  const notaDe = (cartasDoLado) => NOTA.numero(NOTA.mediaDoPrompt(cartasDoLado, missao.assuntos));
  const notaDaCarta = (c, m = missao) => NOTA.numero(NOTA.mediaDaCarta(c, m.assuntos));
  const problemasDoLado2 = NOTA.problemas(lado2, missao.assuntos).map((p) => NOTA.fraseDoProblema(p, MINUSCULOS));
  // Uma missão com tecnologia, em que a persona do exemplo vai mal (a nota depende da missão)
  const outraMissao = M.find((m) => m.assuntos.includes('T') && NOTA.somaDaCarta(persona, m.assuntos) < NOTA.somaDaCarta(persona, missao.assuntos));
  if (!outraMissao || persona.combina.T > 2) throw new Error('manual: o exemplo dos números escondidos precisa de uma persona fraca em tecnologia');

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
    ${mini(missao.codigo, 0.68, 'gira-1')}${mini(contexto.codigo, 0.68, 'gira-2')}${mini(persona.codigo, 0.68, 'gira-3')}${mini(formato.codigo, 0.68, 'gira-4')}
  </div>
  <div class="numeros">
    <div><b>2 a ${MAX_LADOS}</b><span>lados na mesa; até 40 alunos no modo Turma</span></div>
    <div><b>20 a 30 min</b><span>por partida de ${RODADAS} rodadas (estimativa; vamos medir no teste)</span></div>
    <div><b>2 min</b><span>para explicar as regras</span></div>
    <div><b>${cartas.length}</b><span>cartas em ${folhas} folhas A4, com verso</span></div>
  </div>
  <div class="caixa para-quem">
    <p><b>Para quem é:</b> alunos do 6º ano do Ensino Fundamental até o Ensino Médio. Foi pensado para escolas sem internet ou com internet ruim: na mesa, os alunos só usam cartas de papel, e o aplicativo do professor funciona sem internet.</p>
  </div>
  <div class="capa-cols">
    <div>
      <h2>O que você precisa</h2>
      <ul>
        <li>As cartas impressas: ${folhas} folhas de frente e ${folhas} de verso (arquivo de cartas).</li>
        <li>Se quiser, a folha de regras e o gabarito (outro arquivo, 3 folhas).</li>
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
        <li>Uma rodada, com exemplo</li>
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
    ['t-persona', 'Persona', persona.prompt],
    ['t-contexto', 'Contexto', contexto.texto],
    ['t-missao', 'Missão', `Tarefa: ${minuscula(missao.nome)}`],
    ['t-formato', 'Formato', `Responda em formato de ${minuscula(semParenteses(formato.nome))}.`],
  ];
  const ensina = `<section class="page man">
  <h2 class="secao"><span>1</span>O que o jogo ensina</h2>
  <p class="abre">Um <b>prompt</b> é o pedido que a gente escreve para uma inteligência artificial (IA) responder. Quanto mais claro o pedido, melhor a resposta. No jogo, um prompt tem <b>4 partes</b>, e cada parte é uma carta: a missão diz o que fazer, e cada lado escolhe as outras 3.</p>

  <div class="montagem">
    <div class="montagem-cartas">${mini(persona.codigo, 0.46)}${mini(contexto.codigo, 0.46)}${mini(missao.codigo, 0.46)}${mini(formato.codigo, 0.46)}</div>
    <div class="prompt-pronto">
      ${partesDoPrompt.map(([cls, tipo, texto]) => `<p class="${cls}"><span class="etq">${tipo}</span>${esc(texto)}</p>`).join('')}
    </div>
    <div class="nota-app">
      <p class="resposta-t">O aplicativo dá a nota: ${notaDe(lado1)} de 4</p>
      ${lado1.map((c) => `<p><b>${c.codigo} · ${notaDaCarta(c)}</b> ${esc(NOTA.frase(c, missao.assuntos, MINUSCULOS))}</p>`).join('')}
    </div>
  </div>

  <h3>O que cada carta ensina</h3>
  <table class="tabela ensina">
    <tr><th>Carta</th><th>A pergunta que o aluno aprende a fazer</th><th>Por que a resposta melhora</th></tr>
    <tr class="t-missao"><td><b>Missão</b></td><td>O que eu quero?</td><td>Um pedido claro diz para a IA o que fazer. Cada missão junta 3 assuntos, como ${nomesDosAssuntos(missao)}.</td></tr>
    <tr class="t-contexto"><td><b>Contexto</b></td><td>Onde estou e o que está acontecendo?</td><td>A IA não sabe onde você mora nem o que está acontecendo. Contar a situação deixa a resposta certa para aquele lugar.</td></tr>
    <tr class="t-persona"><td><b>Persona</b></td><td>Quem a IA vai ser?</td><td>Pedir que a IA responda como alguém que entende do assunto (um guia de trilhas, uma fisioterapeuta) muda as palavras e o cuidado da resposta.</td></tr>
    <tr class="t-formato"><td><b>Formato</b></td><td>Como a resposta deve chegar para quem vai ler?</td><td>O mesmo conteúdo ajuda mais ou menos conforme a forma: lista para quem vai sair de casa, alerta no celular para quem precisa saber na hora.</td></tr>
  </table>

  <div class="caixa estrelas-caixa">
    <p><b>Por que a nota.</b> Cada carta combina mais ou menos com cada assunto, de 1 a 4. Um bom prompt combina com <b>os 3 assuntos da missão</b>: não adianta a persona entender muito de um assunto só. Os números ficam escondidos no aplicativo, então a cada rodada o aluno lê as cartas e pergunta: <i>esta carta ajuda nos 3 assuntos?</i> Depois, o aplicativo diz por que cada prompt perdeu pontos.</p>
  </div>
  ${rodape()}
</section>`;

  // ------------------------------------------------------------ 3. as cartas
  const explicaCarta = [
    [missao.codigo, 'Missão', `${M.length} cartas`, 'O pedido e os 3 assuntos. Fica aberta no meio da mesa durante a rodada.', 'Uma por rodada. Depois, sai do jogo.'],
    [contexto.codigo, 'Contexto', `${C.length} cartas`, 'A situação: onde é e o que está acontecendo.', 'Cada lado escolhe 1 por rodada.'],
    [persona.codigo, 'Persona', `${P.length} cartas`, 'Quem a IA vai ser ao responder, o que essa pessoa faz e como ela entra no prompt.', 'Cada lado escolhe 1 por rodada.'],
    [formato.codigo, 'Formato', `${F.length} cartas`, 'Como a resposta chega para quem vai ler. O desenho mostra a forma.', 'Cada lado escolhe 1 por rodada.'],
  ];
  const numerosDaPersona = ORDEM.map((a) => `<td class="v${persona.combina[a]}">${persona.combina[a]}</td>`).join('');
  const conta = (m) => `(${m.assuntos.map((a) => persona.combina[a]).join(' + ')}) ÷ 3 = <b>${notaDaCarta(persona, m)}</b>`;
  const asCartas = `<section class="page man">
  <h2 class="secao"><span>2</span>As cartas</h2>
  <p class="abre">São ${cartas.length} cartas, com frente e verso. O <b>código</b> no canto de cima (como ${missao.codigo} ou ${contexto.codigo}) é o que você digita no aplicativo. As missões mostram os 3 assuntos da rodada: ${ORDEM.map((a) => `<span class="sem-quebra">${icone(a)} ${ASSUNTO[a].nome}</span>`).join(' · ')}.</p>
  <div class="cartas-explicadas">
    ${explicaCarta.map(([codigo, nome, quantas, oQue, regra]) => `<div class="carta-explicada">
      ${mini(codigo, 0.6)}
      <div><p class="ce-nome">${nome}</p><p class="ce-qtd">${quantas}</p><p>${oQue}</p><p class="ce-regra">${regra}</p></div>
    </div>`).join('')}
    <div class="carta-explicada versos-explicados">
      <div class="junto">${Object.keys(versoPorTipo).map((tipo) => miniVerso(tipo, 0.27)).join('')}</div>
      <div><p class="ce-nome">O verso</p><p>Mostra de que baralho é a carta. Assim os montes ficam virados para baixo sem se misturar.</p></div>
    </div>
    <div class="carta-explicada contas">
      <div>
        <p class="ce-nome">Os números escondidos</p>
        <p>Cada contexto, persona e formato tem um número de 1 a 4 para cada assunto. A carta não mostra: só o aplicativo e o gabarito.</p>
        <table class="tabela mini-tab">
          <tr><th>${persona.codigo}</th>${ORDEM.map((a) => `<th>${ASSUNTO[a].ico}</th>`).join('')}</tr>
          <tr><td>${esc(persona.nome)}</td>${numerosDaPersona}</tr>
        </table>
        <p>Na ${missao.codigo} (${icones(missao)}): ${conta(missao)}.<br>Na ${outraMissao.codigo} (${icones(outraMissao)}): ${conta(outraMissao)}, porque essa persona ${NOTA.PALAVRAS.Persona[persona.combina.T]} tecnologia.</p>
      </div>
    </div>
  </div>
  <div class="caixa imprimir">
    <p><b>Como imprimir:</b> o arquivo de cartas tem ${folhas} folhas A4 de frente, cada uma seguida da folha do verso. Imprima colorido, de preferência em papel mais grosso (cartolina ou papel de 180 g). Cole cada verso atrás da sua frente antes de cortar, ou imprima dos dois lados do papel, virando na borda longa. Corte nas linhas tracejadas: cada folha tem até 9 cartas do tamanho de uma carta de baralho, todas do mesmo baralho. Guarde cada jogo num envelope.</p>
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
        <li><b>Os 3 baralhos:</b> embaralhe cada um separado (contexto, persona e formato) e ponha os 3 montes virados para baixo no meio da mesa. O verso mostra qual é qual.</li>
        <li><b>Missões:</b> embaralhe e deixe o montinho ao lado, virado para baixo.</li>
        <li><b>Aplicativo:</b> na página Partida, escolha o modo, cadastre os lados e toque em <b>Sortear quem começa</b>. Em cada rodada, quem começa é o próximo lado.</li>
      </ol>
    </div>
    <figure class="mesa-figura">
      <div class="feltro">
        <div class="lugar"><span class="rot">Lado 2</span>${versos(3, 0.24)}</div>
        <div class="fila">
          ${monte(0.26, 'c', 'contexto')}${monte(0.26, 'p', 'persona')}${monte(0.26, 'f', 'formato')}
        </div>
        <div class="fila">
          <div class="lugar"><span class="rot">missão da rodada</span>${mini(missao.codigo, 0.3)}</div>
          ${monte(0.26, 'm', 'outras missões')}
        </div>
        <div class="lugar"><span class="rot">Lado 1</span>${versos(3, 0.24)}</div>
      </div>
      <figcaption>A mesa depois que os dois lados escolheram: as 3 cartas de cada um ficam viradas para baixo na frente dele.</figcaption>
    </figure>
  </div>

  <h3>Modos de jogo</h3>
  <table class="tabela">
    <tr><th>Modo</th><th>Quantos alunos</th><th>Como fica</th></tr>
    <tr><td><b>Duelo</b></td><td>2 a 4</td><td>1 contra 1, ou dupla contra dupla (cada dupla é um lado).</td></tr>
    <tr><td><b>Mesa</b></td><td>3 a 10</td><td>3 a ${MAX_LADOS} lados, cada um por si. Cada lado é 1 aluno ou 1 dupla.</td></tr>
    <tr><td><b>Turma</b></td><td>até 40</td><td>Até ${MAX_LADOS} grupos, numa mesa grande ou no chão. Cada grupo decide junto, e quem compra as cartas troca a cada rodada. Com uma turma grande, imprima mais de um jogo e faça várias mesas.</td></tr>
  </table>
  <p class="nota-pe">Dica: no modo Turma, escreva no quadro a ordem dos grupos. Enquanto um grupo escolhe, os outros podem ir pensando em quem entende dos 3 assuntos da missão.</p>
  ${rodape()}
</section>`;

  // ------------------------------------------------------------ 5. uma rodada, com exemplo
  const filaDaCompra = (tipo) => `<div class="compra">
    <span class="compra-t">${tipo}</span>
    <div class="junto">${compra[tipo].map((codigo, i) => mini(codigo, 0.3, i === 0 ? 'destaque' : 'apagada')).join('')}</div>
  </div>`;
  const rodada = `<section class="page man">
  <h2 class="secao"><span>4</span>Uma rodada <small>cada lado tem até 1 minuto na sua vez</small></h2>
  <div class="quatro-passos">
    <div><span class="n">1</span><b>Vire 1 missão</b>Leiam juntos o pedido e os 3 assuntos.</div>
    <div><span class="n">2</span><b>Compre ${COMPRA} de cada</b>${COMPRA} contextos, ${COMPRA} personas e ${COMPRA} formatos.</div>
    <div><span class="n">3</span><b>Escolha 1 de cada</b>As que mais combinam com os 3 assuntos, viradas para baixo.</div>
    <div><span class="n">4</span><b>Devolva as outras 6</b>Cada uma no seu monte. Embaralhe e passe a vez.</div>
  </div>
  <p class="depois-dos-passos">Todos escolheram? Todos viram as cartas, e o professor confere no aplicativo. O melhor prompt ganha 1 ponto. As cartas voltam para os montes e a missão sai do jogo.</p>

  <h3>Exemplo de uma rodada</h3>
  <div class="ex-cols">
    <div class="quadro-ex">
      <p class="ex-t"><span class="n">a</span><span>A missão é a <b>${missao.codigo}</b>.</span></p>
      ${mini(missao.codigo, 0.42)}
    </div>
    <div class="quadro-ex">
      <p class="ex-t"><span class="n">b</span><span>Na sua vez, o Lado 1 compra ${COMPRA} cartas de cada baralho e fica com as que juntam ${nomesDosAssuntos(missao)} (em verde). As outras 6 voltam para os montes.</span></p>
      ${filaDaCompra('Contexto')}${filaDaCompra('Persona')}${filaDaCompra('Formato')}
    </div>
  </div>
  <div class="quadro-ex">
    <p class="ex-t"><span class="n">c</span><span>O Lado 2 escolhe 3 cartas de saúde e esporte e esquece o meio ambiente:</span></p>
    <div class="junto">${lado2.map((c) => mini(c.codigo, 0.3)).join('')}</div>
  </div>
  <div class="ex-fim">
    <p><span class="n">d</span><span>O professor digita a missão e as cartas de cada lado. O aplicativo dá <b>${notaDe(lado1)}</b> para o Lado 1 e <b>${notaDe(lado2)}</b> para o Lado 2 e explica por que o Lado 2 perdeu pontos: ${problemasDoLado2.join('; ')}. A missão pede meio ambiente (o lixo no parque).</span></p>
    <p><span class="n">e</span><span>O Lado 1 ganha 1 ponto. As cartas voltam para os montes, embaralhadas, e a ${missao.codigo} sai do jogo. Na próxima rodada, o Lado 2 começa.</span></p>
  </div>
  ${rodape()}
</section>`;

  // ------------------------------------------------------------ 6. aplicativo
  const tela = (arquivo, legenda) => `<figure class="tela"><div class="celular"><img src="imagens/${arquivo}" alt=""></div><figcaption>${legenda}</figcaption></figure>`;
  const aplicativo = `<section class="page man">
  <h2 class="secao"><span>5</span>Conferir no aplicativo</h2>
  <p class="abre">O aplicativo do professor guarda os pontos, marca o tempo de cada lado e dá a nota de cada prompt. Ele abre no navegador do celular, neste endereço:</p>
  <p class="endereco">${ENDERECO_DO_APP}</p>
  <div class="telas">
    ${tela('app-partida.png', '<b>Partida:</b> a rodada, os pontos de cada lado, de quem é a vez e o cronômetro.')}
    ${tela('app-rodada.png', '<b>Rodada:</b> o número da missão e as 3 cartas de cada lado.')}
    ${tela('app-resultado.png', '<b>Resultado:</b> a nota de cada prompt, por que perdeu pontos e quem ganha o ponto.')}
  </div>
  <div class="app-cols">
    <ol class="passos-grandes">
      <li><b>Antes da aula, com internet:</b> abra o endereço no celular. Depois da primeira vez, ele funciona sem internet. No menu do navegador, toque em <i>Adicionar à tela inicial</i> para abrir como um aplicativo.</li>
      <li><b>Partida:</b> escolha o modo, quantos lados e os nomes. Toque em <b>Começar partida</b> e em <b>Sortear quem começa</b>.</li>
      <li><b>Cronômetro:</b> toque em <b>Iniciar</b> na vez do primeiro lado e em <b>Próximo lado</b> quando ele terminar.</li>
    </ol>
    <ol class="passos-grandes" start="4">
      <li><b>Todos escolheram?</b> Toque em <b>Conferir a rodada</b>. Digite o número da missão e o número das 3 cartas de cada lado.</li>
      <li><b>Ver o resultado:</b> leia em voz alta a nota e o porquê de cada prompt. Toque em <b>Dar o ponto</b>. Errou? Toque em <b>Desfazer</b>.</li>
      <li><b>Depois de ${RODADAS} rodadas,</b> o aplicativo mostra o placar final. Toque em <b>Conferir se aprendeu</b> para o desafio final.</li>
    </ol>
  </div>
  <p class="nota-pe">As páginas <b>Desafio</b> (o desafio final), <b>Cartas</b> (procurar uma carta pelo código ou pelo nome, com os números dela) e <b>Regras</b> (o resumo das regras) também funcionam sem internet. Sem celular, use o gabarito impresso: ele tem os mesmos números e a mesma conta.</p>
  ${rodape()}
</section>`;

  // ------------------------------------------------------------ 7. fim, casos especiais e a aula
  const aula = `<section class="page man">
  <h2 class="secao"><span>6</span>Fim e casos especiais</h2>
  <div class="caixa ganha-caixa"><p><b>Depois de ${RODADAS} rodadas, ganha quem tiver mais pontos.</b> Empate: ganha quem somou as maiores notas nas ${RODADAS} rodadas. O aplicativo faz a conta e avisa.</p></div>
  <table class="tabela casos">
    <tr><th>Se acontecer</th><th>Faça assim</th></tr>
    <tr><td>Dois prompts empatam como o melhor</td><td>Os dois ganham 1 ponto. O aplicativo já dá o ponto para todos os empatados.</td></tr>
    <tr><td>Acabou o tempo da vez</td><td>O lado escolhe agora as 3 cartas e devolve as outras 6.</td></tr>
    <tr><td>A turma não concorda com uma nota</td><td>Peça para o lado explicar a escolha. <b>A palavra final é sua:</b> você pode mudar os pontos com os botões + e − do placar.</td></tr>
    <tr><td>A aula está acabando</td><td>Toque em <b>Encerrar partida</b>: o aplicativo mostra quem está na frente.</td></tr>
    <tr><td>Sem celular ou sem bateria</td><td>Use o gabarito: some os números das cartas nos 3 assuntos da missão. A maior soma ganha o ponto.</td></tr>
  </table>

  <h2 class="secao"><span>7</span>Como conduzir a aula</h2>
  <div class="aula-cols">
    <div class="momento"><p class="mom-t">Antes · 2 minutos</p><p>Leia os 4 passos da rodada (estão na página Regras do aplicativo). Depois, faça uma vez de exemplo em voz alta: compre 3 de cada e diga por que escolheu cada carta.</p></div>
    <div class="momento"><p class="mom-t">Durante</p><p>Na hora de conferir, leia em voz alta a nota e o porquê de cada prompt. Pergunte: <i>qual assunto ficou de fora? Que carta teria ajudado?</i></p><p>No fim do resultado, o aplicativo mostra as melhores cartas do jogo para aquela missão.</p></div>
    <div class="momento"><p class="mom-t">Depois · 5 minutos</p><p>O desafio final, sem cartas: na página <b>Desafio</b>, sorteie um problema da escola. Cada lado escreve um prompt com as 4 partes (persona, contexto, tarefa e formato) e lê em voz alta. Toque em Sim ou Não nas 4 perguntas; quem acerta as 4 aprendeu e ganha um prêmio escolhido por você.</p></div>
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
  const cartaComNome = (codigo) => `carta ${codigo} ${esc(semParenteses([...C, ...P, ...F, ...M].find((c) => c.codigo === codigo).nome))}`;
  const trocas = [
    ['Magic Prompt', NOME, 'nome do jogo, nas cartas, no manual e no aplicativo'],
    ['app, companion app', 'aplicativo, aplicativo do professor', 'cartas, regras, gabarito, manual e telas do aplicativo'],
    ['playtest', 'partida de teste', 'folha de regras e aplicativo'],
    ['smartwatch', 'relógio que mede o coração', `${cartaComNome('C01')} e missão M03`],
    ['VAR', 'árbitro de vídeo', cartaComNome('C14')],
    ['checklist', 'lista para marcar', cartaComNome('F03')],
    ['print, tutorial', 'tela, passo a passo', cartaComNome('F11')],
    ['streamer', 'quem narra os jogos ao vivo pela internet', cartaComNome('P14')],
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
    ${linha('nomes de lugares', 'várias', 'As cidades dos contextos, como Seul, Tóquio, Recife e Manaus.', 'São nomes próprios. Usamos a forma em português quando ela existe (Nova York, Copenhague, Vale do Silício).')}
  </table>

  <h3>O que trocamos por português</h3>
  <table class="tabela trocas">
    <tr><th>Antes</th><th>Agora</th><th>Onde</th></tr>
    ${trocas.map(([antes, agora, onde]) => `<tr><td>${antes}</td><td><b>${agora}</b></td><td>${onde}</td></tr>`).join('')}
  </table>
  <p class="nota-pe">Também são palavras do português, já com a nossa grafia: futsal, vôlei, surfe e gincana.</p>
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

  const paginas = [capa, ensina, asCartas, preparacao, rodada, aplicativo, aula, glossario];
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
.mini-carta.destaque .card { box-shadow: 0 0 0 2.4mm #198754, 0 .5mm 2mm rgba(22, 39, 79, .22); }
.mini-carta.apagada { opacity: .45; }
.verso { width: 63mm; height: 88mm; border-radius: 3.6mm; background: #eef1f6; border: .8mm solid #c3cad8; box-shadow: 0 .5mm 2mm rgba(22, 39, 79, .22); flex: none; }
.verso.c { background: #1f5fd1; border-color: #174aa3; } .verso.p { background: #6d3fc0; border-color: #552f97; }
.verso.f { background: #e06c00; border-color: #b15500; } .verso.m { background: #c98a00; border-color: #9c6b00; }
.versos { gap: 6mm; }
.pilha { position: relative; width: 67mm; height: 92mm; }
.pilha .verso { position: absolute; }
.pilha .verso:nth-child(1) { left: 4mm; top: 4mm; } .pilha .verso:nth-child(2) { left: 2mm; top: 2mm; } .pilha .verso:nth-child(3) { left: 0; top: 0; }
.junto { display: flex; align-items: center; gap: 2.4mm; flex-wrap: wrap; }

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
.prompt-pronto { background: #fff; border-radius: 2.4mm; border: .4mm solid #d6dbe6; padding: 3mm 3.4mm; display: flex; flex-direction: column; gap: 1.6mm; font-size: 10pt; font-family: Consolas, 'Courier New', monospace; }
.prompt-pronto p { border-left: 1.2mm solid var(--c); padding-left: 2.4mm; }
.etq { display: block; font-family: 'Segoe UI', Arial, sans-serif; font-size: 7.4pt; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; color: var(--c); }
.nota-app { background: #e9f6ef; border-radius: 2.4mm; padding: 2.4mm 3mm; font-size: 9pt; line-height: 1.4; display: flex; flex-direction: column; gap: 1mm; }
.resposta-t { font-weight: 800; color: #0d5c33; font-size: 10.4pt; }
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
.contas { align-items: center; background: #f6f8fc; border-radius: 2.6mm; padding: 3mm; }
.versos-explicados .junto { display: grid; grid-template-columns: repeat(2, auto); gap: 1.4mm; flex: none; }
.mini-tab { font-size: 8.8pt; margin: 1.6mm 0 2mm; } .mini-tab td, .mini-tab th { padding: 1mm 1.8mm; text-align: center; } .mini-tab td:first-child, .mini-tab th:first-child { text-align: left; }
.mini-tab .v4 { font-weight: 800; background: #e3f4ea; } .mini-tab .v1 { color: #b42318; background: #fde8e7; }

/* preparação */
.prep { display: grid; grid-template-columns: 1fr 92mm; gap: 6mm; align-items: start; }
.passos-grandes { padding-left: 6mm !important; }
.passos-grandes li { margin-bottom: 2.2mm; }
.mesa-figura { margin: 0; }
.feltro { background: #e3f1e8; border: .6mm solid #a9d3b8; border-radius: 6mm; padding: 3mm 3mm 4mm; display: flex; flex-direction: column; align-items: center; gap: 2.6mm; }
.fila { display: flex; gap: 5mm; justify-content: center; align-items: flex-end; }
.lugar { display: flex; flex-direction: column; align-items: center; gap: 1.2mm; }
.rot { font-size: 8pt; font-weight: 800; color: #2c5e3f; text-transform: uppercase; letter-spacing: .05em; }
.mesa-figura figcaption { font-size: 8.6pt; color: #4a5368; margin-top: 1.6mm; text-align: center; }

/* a rodada */
.quatro-passos { display: grid; grid-template-columns: repeat(4, 1fr); gap: 3mm; }
.quatro-passos div { background: #e9edf6; border-radius: 2.6mm; padding: 3mm; font-size: 9.4pt; line-height: 1.35; display: flex; flex-direction: column; gap: .8mm; }
.quatro-passos b { font-size: 10.6pt; color: #16274f; }
.n { width: 6.4mm; height: 6.4mm; border-radius: 50%; background: #16274f; color: #fff; font-weight: 800; font-size: 9.6pt; display: inline-flex; align-items: center; justify-content: center; flex: none; }
.quatro-passos .n { margin-bottom: .6mm; }
.depois-dos-passos { font-size: 9.8pt; background: #e3f4ea; border-radius: 2.4mm; padding: 2mm 3mm; }
.ex-cols { display: grid; grid-template-columns: auto 1fr; gap: 5mm; }
.quadro-ex { display: flex; flex-direction: column; gap: 2mm; border-top: .3mm solid #d6dbe6; padding-top: 2.4mm; }
.ex-t { display: flex; gap: 2.4mm; align-items: center; font-size: 10pt; }
.ex-t .n, .ex-fim .n { background: #c98a00; }
.compra { display: flex; align-items: center; gap: 3mm; }
.compra-t { width: 18mm; font-size: 8.4pt; font-weight: 800; color: #4a5368; text-transform: uppercase; letter-spacing: .04em; }
.ex-fim { display: flex; flex-direction: column; gap: 2mm; border-top: .3mm solid #d6dbe6; padding-top: 2.4mm; font-size: 10pt; }
.ex-fim p { display: flex; gap: 2.4mm; align-items: flex-start; }

/* aplicativo */
.endereco { font-family: Consolas, 'Courier New', monospace; font-size: 11pt; font-weight: 700; background: #eef2f8; border-radius: 1.6mm; padding: 1.6mm 3mm; align-self: flex-start; white-space: nowrap; }
.telas { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4mm; margin: 1mm 0; }
.tela { margin: 0; display: flex; flex-direction: column; gap: 2mm; align-items: center; }
.celular { width: 56mm; height: 115mm; overflow: hidden; border: 1.4mm solid #1b1f2a; border-radius: 6mm; background: #f3f5f9; }
/* a foto tem 600 px de largura e o aplicativo ocupa os 375 px da esquerda: o resto fica escondido */
.celular img { width: 100%; display: block; }
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
