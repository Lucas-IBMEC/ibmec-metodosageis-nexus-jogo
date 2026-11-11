// Página Conferir se aprendeu: o desafio final, depois das rodadas.
// Cada lado escreve, sem cartas, um prompt com as 4 partes (persona, contexto, tarefa e formato) para um problema da escola.
// O professor confere com 4 perguntas. Cada pergunta tem um exemplo bom e um ruim.
// Quem acerta as 4 aprendeu e ganha o prêmio que o professor escolher.

const $ = (seletor) => document.querySelector(seletor);

// O exemplo usa outro problema, para ninguém copiar a resposta
const EXEMPLO = 'a fila da cantina demora muito no recreio';

const PERGUNTAS = [
  {
    texto: 'Tem as 4 partes?',
    detalhe: 'Persona, contexto, tarefa e formato.',
    bom: '“Você é diretor da escola. Na nossa escola, a fila da cantina demora 15 minutos e muitos alunos ficam sem lanche. Tarefa: crie um plano para a fila andar mais rápido. Responda em formato de lista com 3 passos.”',
    porqueBom: 'Tem quem responde, a situação, o pedido e o jeito de responder.',
    ruim: '“Me ajuda com a fila da cantina.”',
    porqueRuim: 'Só tem a tarefa. A IA não sabe quem deve ser, onde é, nem como responder.',
    falta: 'faltou uma das 4 partes',
  },
  {
    texto: 'A persona entende do assunto?',
    detalhe: 'Quem a IA vai ser conhece o problema?',
    bom: '“Você é diretor da escola.”',
    porqueBom: 'Conhece a cantina, os horários do recreio e os alunos.',
    ruim: '“Você é jogador de futebol.”',
    porqueRuim: 'Não entende de fila de cantina.',
    falta: 'a persona não entende do assunto',
  },
  {
    texto: 'O contexto diz onde é e o que está acontecendo?',
    detalhe: '',
    bom: '“Na nossa escola, a fila da cantina demora 15 minutos e muitos alunos ficam sem lanche.”',
    porqueBom: 'Diz onde é, qual é o problema e o que ele causa.',
    ruim: '“Tem uma fila.”',
    porqueRuim: 'Não diz onde é, nem por que a fila é um problema.',
    falta: 'o contexto não conta a situação',
  },
  {
    texto: 'O formato ajuda quem vai ler?',
    detalhe: 'Pense em quem vai receber a resposta.',
    bom: '“Responda em formato de lista com 3 passos.”',
    porqueBom: 'O diretor lê rápido e já sabe o que fazer.',
    ruim: '“Responda num texto bem longo.”',
    porqueRuim: 'Quem vai ler perde tempo procurando o que fazer.',
    falta: 'o formato não ajuda quem vai ler',
  },
];

const PROBLEMAS = [
  'Muitos alunos esquecem de beber água na aula de Educação Física.',
  'A quadra fica cheia de lixo depois do recreio.',
  'Os alunos não sabem usar os computadores da sala de informática.',
  'A turma quer fazer um campeonato no recreio sem ninguém se machucar.',
  'A horta da escola está secando porque ninguém lembra de regar.',
];

const partida = MP.lerPartida();
// Com partida, confere cada lado. Sem partida, confere um prompt de cada vez.
const lados = partida ? partida.lados.map((lado, i) => ({ i, nome: lado.nome })) : [{ i: 0, nome: 'O prompt' }];
const chave = partida ? String(partida.inicio) : 'sem-partida';

// Estado guardado no celular: o problema sorteado e as marcas (Sim = true, Não = false) de cada lado
let estado = MP.ler('mp-aprendeu', null);
if (!estado || estado.chave !== chave) {
  estado = { chave, problema: Math.floor(Math.random() * PROBLEMAS.length), marcas: {}, atual: lados[0].i };
}
const salvar = () => MP.salvar('mp-aprendeu', estado);
const marcasDe = (i) => estado.marcas[i] || [null, null, null, null];
const acertos = (i) => marcasDe(i).filter((m) => m === true).length;
const completo = (i) => marcasDe(i).every((m) => m !== null);
const aprendeu = (i) => completo(i) && acertos(i) === PERGUNTAS.length;

function mostrarProblema() {
  $('#problema').textContent = `Problema: “${PROBLEMAS[estado.problema]}”`;
}

// As perguntas são montadas uma vez só: assim um exemplo aberto continua aberto ao marcar Sim ou Não
function montarPerguntas() {
  $('#perguntas').innerHTML = PERGUNTAS.map((p, q) => `<li class="pergunta">
    <div class="pergunta-topo">
      <span class="passo">${q + 1}</span>
      <p>${p.texto}${p.detalhe ? `<small>${p.detalhe}</small>` : ''}</p>
    </div>
    <div class="sim-nao" role="group" aria-label="${p.texto}">
      <button type="button" class="chip sim" data-q="${q}" data-v="sim">Sim</button>
      <button type="button" class="chip nao" data-q="${q}" data-v="nao">Não</button>
    </div>
    <details class="exemplo-pergunta">
      <summary>Ver exemplo</summary>
      <p class="ex-rotulo">Exemplo com outro problema: ${EXEMPLO}.</p>
      <p class="ex bom"><b>✓ Bom:</b> ${p.bom}<small>${p.porqueBom}</small></p>
      <p class="ex ruim"><b>✗ Ruim:</b> ${p.ruim}<small>${p.porqueRuim}</small></p>
    </details>
  </li>`).join('');
}

function htmlDoVeredito(lado) {
  if (!completo(lado.i)) return '<p class="sub" style="margin: 0">Marque as 4 perguntas para ver o resultado.</p>';
  const n = acertos(lado.i);
  const faltou = PERGUNTAS.filter((_, q) => marcasDe(lado.i)[q] === false).map((p) => p.falta).join('; ');
  const nome = lados.length > 1 ? `${MP.esc(lado.nome)} aprendeu!` : 'Aprendeu!';
  if (n === PERGUNTAS.length) {
    return `<p class="veredito">🎉 ${nome}</p><p>Acertou as 4 perguntas: ganha o prêmio do professor.</p>`;
  }
  if (n === PERGUNTAS.length - 1) {
    return `<p class="veredito">Quase lá: ${n} de 4</p><p>O que arrumar: ${faltou}. Arrumem essa parte e leiam de novo.</p>`;
  }
  return `<p class="veredito">Ainda não: ${n} de 4</p><p>O que arrumar: ${faltou}. Vejam os exemplos e tentem de novo.</p>`;
}

function htmlDoResumo() {
  const grupos = [
    ['Aprenderam', lados.filter((l) => aprendeu(l.i))],
    ['Ainda não', lados.filter((l) => completo(l.i) && !aprendeu(l.i))],
    ['Falta conferir', lados.filter((l) => !completo(l.i))],
  ].filter(([, lista]) => lista.length);
  return `<h2>Resumo da turma</h2>
    ${grupos.map(([rotulo, lista]) => `<p><b>${rotulo}:</b> ${MP.esc(MP.juntar(lista.map((l) => l.nome)))}</p>`).join('')}
    <p class="nota">O prêmio é o professor quem escolhe: um elogio no quadro, sair primeiro para o recreio, escolher a missão da próxima aula…</p>`;
}

function atualizar() {
  const lado = lados.find((l) => l.i === estado.atual) || lados[0];
  const varios = lados.length > 1;
  $('#lados').hidden = !varios;
  $('#lados').innerHTML = lados.map((l) => `<button type="button" class="chip" data-lado="${l.i}"
    aria-pressed="${l.i === lado.i}">${aprendeu(l.i) ? '✓ ' : ''}${MP.esc(l.nome)}</button>`).join('');
  $('#quem').hidden = !varios;
  $('#quem').textContent = `Conferindo: ${lado.nome}`;

  const marcas = marcasDe(lado.i);
  document.querySelectorAll('[data-q]').forEach((botao) => {
    const marca = marcas[Number(botao.dataset.q)];
    const ligado = (botao.dataset.v === 'sim' && marca === true) || (botao.dataset.v === 'nao' && marca === false);
    botao.setAttribute('aria-pressed', String(ligado));
  });

  const veredito = $('#veredito');
  const n = acertos(lado.i);
  let classe = '';
  if (completo(lado.i)) classe = n === PERGUNTAS.length ? 'ok' : (n === PERGUNTAS.length - 1 ? 'meio' : 'falha');
  veredito.className = `veredito-aprendeu ${classe}`;
  veredito.innerHTML = htmlDoVeredito(lado);

  // Depois de conferir um lado, o botão leva para o próximo que falta
  const posicao = lados.indexOf(lado);
  const seguinte = [...lados.slice(posicao + 1), ...lados.slice(0, posicao)].find((l) => !completo(l.i));
  const botao = $('#proximo');
  if (!varios) {
    botao.hidden = !completo(lado.i);
    botao.textContent = 'Conferir outro prompt';
  } else {
    botao.hidden = !(completo(lado.i) && seguinte);
    botao.textContent = seguinte ? `Conferir ${seguinte.nome}` : '';
  }

  $('#resumo').hidden = !varios || !lados.some((l) => completo(l.i));
  $('#resumo').innerHTML = htmlDoResumo();
}

$('#sortear').addEventListener('click', () => {
  let novo = estado.problema;
  while (novo === estado.problema) novo = Math.floor(Math.random() * PROBLEMAS.length);
  estado.problema = novo;
  salvar();
  mostrarProblema();
});
$('#lados').addEventListener('click', (evento) => {
  const botao = evento.target.closest('[data-lado]');
  if (!botao) return;
  estado.atual = Number(botao.dataset.lado);
  salvar();
  atualizar();
});
$('#perguntas').addEventListener('click', (evento) => {
  const botao = evento.target.closest('[data-q]');
  if (!botao) return;
  const marcas = [...marcasDe(estado.atual)];
  marcas[Number(botao.dataset.q)] = botao.dataset.v === 'sim';
  estado.marcas[estado.atual] = marcas;
  salvar();
  atualizar();
});
$('#proximo').addEventListener('click', () => {
  if (lados.length > 1) {
    const posicao = lados.findIndex((l) => l.i === estado.atual);
    const seguinte = [...lados.slice(posicao + 1), ...lados.slice(0, posicao)].find((l) => !completo(l.i));
    if (seguinte) estado.atual = seguinte.i;
  } else {
    estado.marcas = {};
  }
  document.querySelectorAll('.exemplo-pergunta[open]').forEach((d) => { d.open = false; });
  salvar();
  atualizar();
  $('#perguntas').scrollIntoView({ behavior: 'smooth', block: 'start' });
});

mostrarProblema();
montarPerguntas();
atualizar();
