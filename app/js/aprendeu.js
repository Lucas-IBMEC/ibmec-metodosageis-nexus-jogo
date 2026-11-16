// Página Desafio: o desafio final, depois das rodadas.
// O professor dá um problema da escola. Sem cartas, cada lado escreve um prompt com as 3 partes das cartas:
// persona, contexto e formato. O professor digita o prompt de cada lado e o aplicativo dá a nota de 1 a 4,
// sem internet (js/avaliar.js), com o porquê de cada parte.
// Ganha o desafio quem tirar a maior nota. Com as 3 partes e nota 3 ou mais, o lado aprendeu.

const $ = (seletor) => document.querySelector(seletor);
const PROBLEMAS = AVALIAR.PROBLEMAS;

// Os exemplos usam outro problema, para ninguém copiar a resposta
const EXEMPLO = 'a fila da cantina demora muito no recreio';
const EXEMPLOS = [
  {
    parte: 'Persona', classe: 't-persona',
    bom: '“Você é diretor da escola.”', porqueBom: 'Conhece a cantina, os horários do recreio e os alunos.',
    ruim: '“Você é jogador de futebol.”', porqueRuim: 'Não entende de fila de cantina.',
  },
  {
    parte: 'Contexto', classe: 't-contexto',
    bom: '“Na nossa escola, a fila da cantina demora 15 minutos e muitos alunos ficam sem lanche.”',
    porqueBom: 'Diz onde é, qual é o problema e um detalhe.',
    ruim: '“Tem uma fila.”', porqueRuim: 'Não diz onde é, nem por que a fila é um problema.',
  },
  {
    parte: 'Formato', classe: 't-formato',
    bom: '“Responda em formato de lista com 3 passos.”', porqueBom: 'O diretor lê rápido e já sabe o que fazer.',
    ruim: '“Responda num texto bem longo.”', porqueRuim: 'Quem vai ler perde tempo procurando o que fazer.',
  },
];
const PARTES = [['persona', 'Persona', 't-persona'], ['contexto', 'Contexto', 't-contexto'], ['formato', 'Formato', 't-formato']];

const partida = MP.lerPartida();
// Com partida, um prompt por lado. Sem partida, um prompt de cada vez.
const lados = partida ? partida.lados.map((lado, i) => ({ i, nome: lado.nome })) : [{ i: 0, nome: 'O prompt' }];
const chave = partida ? String(partida.inicio) : 'sem-partida';

// Guardado no celular: o problema sorteado, o texto de cada lado e quem já teve a nota
const padrao = () => ({ chave, problema: Math.floor(Math.random() * PROBLEMAS.length), textos: {}, vistos: {}, atual: lados[0].i });
let estado = MP.ler('mp-aprendeu', null);
estado = estado && estado.chave === chave
  ? { ...padrao(), ...estado, textos: estado.textos || {}, vistos: estado.vistos || {} }
  : padrao();
if (!PROBLEMAS[estado.problema]) estado.problema = 0;
const salvar = () => MP.salvar('mp-aprendeu', estado);

const problema = () => PROBLEMAS[estado.problema];
const textoDe = (i) => estado.textos[i] || '';
const visto = (i) => Boolean(estado.vistos[i]) && textoDe(i).trim() !== '';
const resultadoDe = (i) => AVALIAR.avaliar(textoDe(i), problema());
const mesmaNota = (a, b) => Math.abs(a - b) < 1e-9;

function mostrarProblema() {
  $('#problema').textContent = `Problema: “${problema().texto}”`;
  $('#assuntos-problema').innerHTML = problema().assuntos
    .map((a) => `<span class="assunto-tag">${MP.esc(MP.comSimbolo(a))}</span>`).join('');
}

function montarExemplos() {
  $('#exemplos').innerHTML = `<p class="ex-rotulo">Exemplos com outro problema: ${EXEMPLO}.</p>
    ${EXEMPLOS.map((e) => `<div class="exemplo-parte ${e.classe}">
      <p class="exemplo-parte-t">${e.parte}</p>
      <p class="ex bom"><b>✓ Bom:</b> ${e.bom}<small>${e.porqueBom}</small></p>
      <p class="ex ruim"><b>✗ Ruim:</b> ${e.ruim}<small>${e.porqueRuim}</small></p>
    </div>`).join('')}`;
}

function htmlDoResultado(lado) {
  const r = resultadoDe(lado.i);
  const nome = lados.length > 1 ? MP.esc(lado.nome) : 'O prompt';
  const dicas = [];
  if (r.semPonto) dicas.push('Está tudo numa frase só. Separe as partes com ponto final: o aplicativo lê uma frase de cada vez.');
  if (!r.temTarefa) dicas.push('Diga também o que a IA deve fazer: “Crie…”, “Explique…”.');
  const veredito = r.aprendeu
    ? `<p class="veredito">🎉 ${lados.length > 1 ? `${nome} aprendeu!` : 'Aprendeu!'}</p><p>Tem as 3 partes e tirou ${NOTA.numero(r.media)}.</p>`
    : '<p class="veredito">Ainda não</p><p>Para aprender, o prompt precisa das 3 partes e de nota 3 ou mais. Arrumem o que falta e leiam de novo.</p>';
  return `<div class="prompt-res ${r.aprendeu ? 'ganhou' : ''}">
    <div class="pr-topo">
      <div class="pr-quem">
        <p class="pr-nome">${nome}</p>
        <span class="pr-nivel">${NOTA.nivel(r.media)}</span>
      </div>
      <p class="pr-nota">${NOTA.numero(r.media)}<small>de 4</small></p>
    </div>
    <ul class="pr-cartas">${PARTES.map(([chaveDaParte, titulo, classe]) => {
      const parte = r.notas[chaveDaParte];
      return `<li class="${classe}">
        <span class="pr-carta-texto"><b>${titulo}</b><small>${MP.esc(parte.porque)}</small></span>
        <span class="pr-carta-nota">${parte.nota}</span></li>`;
    }).join('')}</ul>
    ${dicas.length ? `<div class="pr-porque"><p class="pr-porque-t">Dica</p>${dicas.map((d) => `<p>${MP.esc(d)}</p>`).join('')}</div>` : ''}
  </div>
  <div class="veredito-aprendeu ${r.aprendeu ? 'ok' : 'falha'}">${veredito}</div>`;
}

// Quem tirou a maior nota ganha o desafio (empate: todos os empatados)
function htmlDoResumo() {
  const comNota = lados.filter((l) => visto(l.i)).map((l) => ({ ...l, r: resultadoDe(l.i) }))
    .sort((a, b) => b.r.media - a.r.media);
  const maior = comNota.length ? comNota[0].r.media : 0;
  const falta = lados.filter((l) => !visto(l.i));
  const ganhadores = comNota.filter((l) => mesmaNota(l.r.media, maior));
  const titulo = falta.length
    ? 'Notas do desafio'
    : `🏆 ${MP.esc(MP.juntar(ganhadores.map((l) => l.nome)))} ${ganhadores.length > 1 ? 'ganham' : 'ganha'} o desafio`;
  return `<h2>${titulo}</h2>
    <ol class="ranking-desafio">${comNota.map((l) => `<li class="${mesmaNota(l.r.media, maior) ? 'primeiro' : ''}">
      <span>${MP.esc(l.nome)}${l.r.aprendeu ? ' <small>✓ aprendeu</small>' : ''}</span><b>${NOTA.numero(l.r.media)}</b></li>`).join('')}</ol>
    ${falta.length ? `<p class="sub">Falta a nota de ${MP.esc(MP.juntar(falta.map((l) => l.nome)))}.</p>` : ''}
    <p class="nota">Quem tirar a maior nota ganha o desafio. O prêmio é o professor quem escolhe: um elogio no quadro, sair primeiro para o recreio, escolher a missão da próxima aula…</p>`;
}

function atualizarResumo() {
  $('#resumo').hidden = lados.length < 2 || !lados.some((l) => visto(l.i));
  $('#resumo').innerHTML = htmlDoResumo();
}

function atualizar() {
  const lado = lados.find((l) => l.i === estado.atual) || lados[0];
  const varios = lados.length > 1;
  $('#lados').hidden = !varios;
  $('#lados').innerHTML = lados.map((l) => `<button type="button" class="chip" data-lado="${l.i}"
    aria-pressed="${l.i === lado.i}">${visto(l.i) ? '✓ ' : ''}${MP.esc(l.nome)}</button>`).join('');
  $('#quem').textContent = varios ? `O prompt de ${lado.nome}` : 'O prompt';
  if ($('#texto-prompt').value !== textoDe(lado.i)) $('#texto-prompt').value = textoDe(lado.i);
  $('#avaliar').disabled = textoDe(lado.i).trim() === '';

  $('#resultado-desafio').innerHTML = visto(lado.i) ? htmlDoResultado(lado) : '';
  const posicao = lados.indexOf(lado);
  const seguinte = [...lados.slice(posicao + 1), ...lados.slice(0, posicao)].find((l) => !visto(l.i));
  const botao = $('#proximo');
  if (!varios) {
    botao.hidden = !visto(lado.i);
    botao.textContent = 'Dar nota a outro prompt';
  } else {
    botao.hidden = !(visto(lado.i) && seguinte);
    botao.textContent = seguinte ? `Próximo: ${seguinte.nome}` : '';
  }
  atualizarResumo();
}

$('#sortear').addEventListener('click', () => {
  let novo = estado.problema;
  while (novo === estado.problema) novo = Math.floor(Math.random() * PROBLEMAS.length);
  estado.problema = novo;
  salvar();
  mostrarProblema();
  atualizar();
});
$('#lados').addEventListener('click', (evento) => {
  const botao = evento.target.closest('[data-lado]');
  if (!botao) return;
  estado.atual = Number(botao.dataset.lado);
  salvar();
  atualizar();
});
// Mudou o texto: a nota antiga some até tocar em Ver a nota de novo
$('#texto-prompt').addEventListener('input', (evento) => {
  estado.textos[estado.atual] = evento.target.value;
  delete estado.vistos[estado.atual];
  salvar();
  $('#avaliar').disabled = evento.target.value.trim() === '';
  $('#resultado-desafio').innerHTML = '';
  $('#proximo').hidden = true;
  atualizarResumo();
});
$('#avaliar').addEventListener('click', () => {
  if (!textoDe(estado.atual).trim()) return;
  estado.vistos[estado.atual] = true;
  salvar();
  $('#texto-prompt').blur();
  atualizar();
  $('#resultado-desafio').scrollIntoView({ behavior: 'smooth', block: 'start' });
});
$('#proximo').addEventListener('click', () => {
  if (lados.length > 1) {
    const posicao = lados.findIndex((l) => l.i === estado.atual);
    const seguinte = [...lados.slice(posicao + 1), ...lados.slice(0, posicao)].find((l) => !visto(l.i));
    if (seguinte) estado.atual = seguinte.i;
  } else {
    estado.textos = {};
    estado.vistos = {};
  }
  salvar();
  atualizar();
  $('#texto-prompt').focus();
});

mostrarProblema();
montarExemplos();
atualizar();
