// Página Rodada: o professor digita a missão e as 3 cartas de cada lado (contexto, persona e formato).
// O aplicativo dá a nota de cada prompt (a média dos números escondidos nos 3 assuntos da missão),
// diz por que cada um perdeu pontos e dá 1 ponto para o melhor (empate: 1 ponto para cada).
// Lado roubado por uma carta especial perde a rodada: não precisa digitar as cartas e não ganha ponto.
// Histórias: 2.1.1, 2.1.2, 2.2.1 e 2.2.2.

const $ = (seletor) => document.querySelector(seletor);
const TIPOS = MP.TIPOS;
const MAX_PROMPTS = DADOS.maximoDeLados || 5;
// Quantas cartas tem cada baralho (para saber quando um número já está completo)
const TOTAL = Object.fromEntries(['Missão', ...TIPOS].map((tipo) => [tipo, DADOS.cartas.filter((c) => c.tipo === tipo).length]));

let partida = MP.lerPartida();
let estado;

// ---------- Estado da página ----------

// As cartas digitadas valem para uma rodada só: quando a rodada muda, a página começa limpa
function chaveAtual() {
  return partida ? `${partida.inicio}-${partida.rodada}` : 'sem-partida';
}

function estadoVazio() {
  return { chave: chaveAtual(), missao: '', prompts: {}, roubados: {}, quantos: 2, revelado: false };
}

function pontoDado() {
  return Boolean(partida && MP.pontoDaRodada(partida));
}

function lerEstado() {
  partida = MP.lerPartida();
  const guardado = MP.ler('mp-rodada', null);
  estado = guardado && guardado.chave === chaveAtual() ? { ...estadoVazio(), ...guardado } : estadoVazio();
  // Ponto já dado: a página mostra as cartas que valeram o ponto
  const ponto = partida && MP.pontoDaRodada(partida);
  if (ponto) {
    estado.missao = String(Number(ponto.missao.slice(1)));
    ponto.prompts.forEach((p) => {
      estado.prompts[p.lado] = Object.fromEntries(TIPOS.map((tipo, k) => [tipo, String(Number(p.cartas[k].slice(1)))]));
    });
    estado.roubados = Object.fromEntries((ponto.roubados || []).map((i) => [i, true]));
    estado.revelado = true;
  }
}

function salvarEstado() {
  MP.salvar('mp-rodada', estado);
}

// Um prompt por lado, na ordem da rodada. Sem partida: "Prompt 1", "Prompt 2"...
function quem() {
  if (partida) {
    const ordem = partida.primeiro === null ? partida.lados.map((_, i) => i) : MP.ordemDaRodada(partida);
    return ordem.map((i) => ({ i, nome: partida.lados[i].nome }));
  }
  return Array.from({ length: estado.quantos }, (_, i) => ({ i, nome: `Prompt ${i + 1}` }));
}

// "C" e "9" viram "C09"
function codigoDe(tipo, numero) {
  return `${MP.LETRA[tipo]}${String(Number(numero)).padStart(2, '0')}`;
}

function maiuscula(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

// A missão, as cartas de cada prompt e o que falta
function lerTudo() {
  const missao = MP.cartaPeloNumero('Missão', estado.missao);
  const todas = quem().map(({ i, nome }) => {
    const digitado = estado.prompts[i] || {};
    const cartas = TIPOS.map((tipo) => {
      const numero = String(digitado[tipo] || '');
      return { tipo, numero, carta: MP.cartaPeloNumero(tipo, numero) };
    });
    return { i, nome, cartas, completo: cartas.every((c) => c.carta) };
  });
  // Quem foi roubado fica de fora da conta
  const roubados = todas.filter((linha) => estado.roubados[linha.i]);
  const linhas = todas.filter((linha) => !estado.roubados[linha.i]);
  // Só existe uma carta de cada: a mesma carta em dois prompts quer dizer que alguém digitou errado
  const donos = {};
  linhas.forEach((linha) => linha.cartas.forEach((c) => {
    if (!c.carta) return;
    donos[c.carta.codigo] = donos[c.carta.codigo] || [];
    donos[c.carta.codigo].push(linha);
  }));
  const falta = [];
  if (!missao) falta.push('a missão');
  linhas.forEach((linha) => { if (!linha.completo) falta.push(`as cartas de ${linha.nome}`); });
  return { missao, linhas, roubados, donos, falta, completo: falta.length === 0 };
}

// ---------- Campos ----------

// Só vale o roubo de quem está na rodada, e sempre sobra pelo menos 1 lado que não foi roubado
function ajustarRoubados() {
  const naRodada = new Set(quem().map(({ i }) => String(i)));
  Object.keys(estado.roubados).forEach((i) => { if (!naRodada.has(i)) delete estado.roubados[i]; });
  if (Object.keys(estado.roubados).length >= naRodada.size) estado.roubados = {};
}

function montarCampos() {
  ajustarRoubados();
  const travado = pontoDado();
  $('#missao').value = estado.missao;
  $('#missao').disabled = travado;
  $('#quantos-prompts').hidden = Boolean(partida);
  $('#quantos').textContent = estado.quantos;
  $('#menos-prompts').disabled = estado.quantos <= 2;
  $('#mais-prompts').disabled = estado.quantos >= MAX_PROMPTS;
  const comOrdem = partida && partida.primeiro !== null;
  const todos = quem();
  const livres = todos.filter(({ i }) => !estado.roubados[i]).length;
  $('#prompts').innerHTML = todos.map(({ i, nome }, posicao) => {
    const roubado = Boolean(estado.roubados[i]);
    // Sempre sobra pelo menos 1 lado que não foi roubado
    const bloqueado = travado || (!roubado && livres <= 1);
    return `
    <div class="prompt-entrada ${roubado ? 'roubado' : ''}" data-prompt="${i}">
      <div class="prompt-linha">
        <p class="prompt-quem">${comOrdem ? `<span class="ordem-n">${posicao + 1}º</span>` : ''}${MP.esc(nome)}</p>
        <button type="button" class="chip roubo" data-roubado="${i}" aria-pressed="${roubado}" ${bloqueado ? 'disabled' : ''}>Foi roubado</button>
      </div>
      <p class="roubado-aviso" ${roubado ? '' : 'hidden'}>Perdeu a rodada: não ganha ponto e não precisa digitar as cartas.</p>
      <div class="trio-campos" ${roubado ? 'hidden' : ''}>
        ${TIPOS.map((tipo) => `<label class="campo-codigo ${MP.classeDoTipo(tipo)}">
          <span class="letra" aria-hidden="true">${MP.LETRA[tipo]}</span>
          <input class="campo" data-tipo="${tipo}" inputmode="numeric" pattern="[0-9]*" maxlength="2"
            autocomplete="off" enterkeyhint="next" placeholder="nº" aria-label="${tipo} de ${MP.esc(nome)}"
            value="${MP.esc((estado.prompts[i] || {})[tipo] || '')}" ${travado || roubado ? 'disabled' : ''}>
        </label>`).join('')}
      </div>
      <ul class="cartas-digitadas" aria-live="polite" ${roubado ? 'hidden' : ''}></ul>
    </div>`;
  }).join('');
}

// Embaixo de cada campo: o nome da carta digitada, ou o erro
function atualizarDigitadas(tudo) {
  const info = $('#missao-info');
  if (!estado.missao) {
    info.innerHTML = '';
  } else if (!tudo.missao) {
    info.innerHTML = `<p class="erro-campo">Não existe ${codigoDe('Missão', estado.missao)}. As missões vão de 1 a ${TOTAL['Missão']}.</p>`;
  } else {
    const saiu = partida && partida.historico.find((h) => h.missao === tudo.missao.codigo && h.rodada !== partida.rodada);
    info.innerHTML = `<div class="assuntos-missao">${tudo.missao.assuntos.map((a) => `<span class="assunto-tag">${MP.esc(MP.comSimbolo(a))}</span>`).join('')}</div>
      <p class="pedido-missao">“${MP.esc(tudo.missao.nome)}”</p>
      ${saiu ? `<p class="alerta-campo">A ${tudo.missao.codigo} já saiu na rodada ${saiu.rodada}.</p>` : ''}`;
  }

  tudo.linhas.forEach((linha) => {
    const lista = document.querySelector(`[data-prompt="${linha.i}"] .cartas-digitadas`);
    if (!lista) return;
    lista.innerHTML = linha.cartas.filter((c) => c.numero).map((c) => {
      if (!c.carta) return `<li class="erro-campo">Não existe ${codigoDe(c.tipo, c.numero)}. Os números vão de 1 a ${TOTAL[c.tipo]}.</li>`;
      const outros = tudo.donos[c.carta.codigo].filter((l) => l !== linha);
      return `<li class="${MP.classeDoTipo(c.tipo)}"><span class="cod">${c.carta.codigo}</span>
        <span>${MP.esc(c.carta.nome)}${outros.length ? `<small class="alerta-campo">Também está com ${MP.esc(MP.juntar(outros.map((o) => o.nome)))}: confira o número.</small>` : ''}</span></li>`;
    }).join('');
  });
}

// ---------- Resultado ----------

function calcular(tudo) {
  const assuntos = tudo.missao.assuntos;
  const resultados = tudo.linhas.map((linha) => {
    const cartas = linha.cartas.map((c) => c.carta);
    const soma = NOTA.somaDoPrompt(cartas, assuntos);
    return { i: linha.i, nome: linha.nome, cartas, soma, media: soma / 9 };
  });
  const maior = Math.max(...resultados.map((r) => r.soma));
  resultados.forEach((r) => { r.ganhou = r.soma === maior; });
  // Da maior nota para a menor (empate: na ordem da rodada)
  return resultados.sort((a, b) => b.soma - a.soma);
}

function htmlDoPrompt(missao, r, posicao, maxima) {
  const assuntos = missao.assuntos;
  const problemas = NOTA.problemas(r.cartas, assuntos);
  let porque;
  if (problemas.length) {
    porque = `<p class="pr-porque-t">Por que perdeu pontos</p>
      <ul>${problemas.map((p) => `<li>${MP.esc(maiuscula(NOTA.fraseDoProblema(p, MP.NOMES)))}.</li>`).join('')}</ul>`;
  } else if (r.soma === maxima) {
    porque = '<p class="pr-porque-t">Nota mais alta possível!</p><p>As 3 cartas combinam muito com os 3 assuntos.</p>';
  } else {
    porque = `<p class="pr-porque-t">Nenhuma carta fraca</p>
      <p>As 3 cartas combinam com os 3 assuntos. Para chegar a ${NOTA.numero(maxima / 9)}, alguma carta precisava combinar ainda mais.</p>`;
  }
  const [contexto, persona, formato] = r.cartas;
  return `<li class="prompt-res ${r.ganhou ? 'ganhou' : ''}">
    <div class="pr-topo">
      <span class="pr-pos">${posicao}º</span>
      <div class="pr-quem">
        <p class="pr-nome">${r.ganhou ? '🏆 ' : ''}${MP.esc(r.nome)}</p>
        <span class="pr-nivel">${NOTA.nivel(r.media)}${r.ganhou ? ' · melhor prompt' : ''}</span>
      </div>
      <p class="pr-nota">${NOTA.numero(r.media)}<small>de 4</small></p>
    </div>
    <ul class="pr-cartas">${r.cartas.map((c) => `<li class="${MP.classeDoTipo(c.tipo)}">
      <span class="cod">${c.codigo}</span>
      <span class="pr-carta-texto"><b>${MP.esc(c.nome)}</b><small>${MP.esc(NOTA.frase(c, assuntos, MP.NOMES))}</small></span>
      <span class="pr-carta-nota">${NOTA.numero(NOTA.mediaDaCarta(c, assuntos))}</span></li>`).join('')}
    </ul>
    <div class="pr-porque ${problemas.length ? '' : 'sem-problema'}">${porque}</div>
    <details class="pr-prompt">
      <summary>Ver o prompt</summary>
      <p class="texto-ia">${MP.esc(MP.textoDoPrompt(missao, contexto, persona, formato))}</p>
    </details>
  </li>`;
}

function htmlDoResultado(tudo, resultados) {
  const maxima = MP.somaMaxima(tudo.missao.assuntos);
  return `<h2>${partida ? `Resultado da rodada ${partida.rodada}` : 'Resultado'}</h2>
    <p class="sub">Leia em voz alta a nota e o porquê de cada prompt. Nesta missão, a nota mais alta possível é ${NOTA.numero(maxima / 9)}.</p>
    <ol class="lista-resultado">${resultados.map((r) => {
      const posicao = 1 + resultados.filter((outro) => outro.soma > r.soma).length;
      return htmlDoPrompt(tudo.missao, r, posicao, maxima);
    }).join('')}</ol>
    ${tudo.roubados.length ? `<p class="roubados-res">Roubado: ${MP.esc(MP.juntar(tudo.roubados.map((l) => l.nome)))} perdeu a rodada e não ganha ponto.</p>` : ''}`;
}

// ---------- Ponto ----------

function htmlDoPonto(tudo, resultados) {
  const nomes = MP.juntar(resultados.filter((r) => r.ganhou).map((r) => r.nome));
  if (!partida) {
    return `<h2>Melhor prompt: ${MP.esc(nomes)}</h2>
      <p class="sub">Para somar os pontos das rodadas, comece uma partida na página <a href="index.html">Partida</a>.</p>
      <button type="button" class="botao secundario largo" data-acao="limpar">Limpar para conferir outra rodada</button>`;
  }
  const ponto = MP.pontoDaRodada(partida);
  if (ponto) {
    const ultima = partida.rodada >= MP.rodadasDa(partida);
    const placar = MP.ranking(partida).map((l) => `${MP.esc(l.nome)} ${l.pontos}`).join(' · ');
    const proximo = partida.fase === 'fim'
      ? '<a class="botao" href="index.html">Ver o resultado final</a>'
      : `<button type="button" class="botao" data-acao="avancar">${ultima ? 'Ver o resultado final' : `Começar a rodada ${partida.rodada + 1}`}</button>`;
    return `<h2>✓ 1 ponto para ${MP.esc(MP.juntar(ponto.ganhadores.map((i) => partida.lados[i].nome)))}</h2>
      <p class="sub">Placar: ${placar}</p>
      <p class="sub">As cartas voltam para os seus montes (embaralhe) e a missão sai do jogo.</p>
      <div class="acoes">
        <button type="button" class="botao secundario" data-acao="desfazer">Desfazer</button>
        ${proximo}
      </div>`;
  }
  if (partida.primeiro === null) {
    return '<h2>Dar o ponto</h2><p class="sub">Antes, sorteie quem começa na página <a href="index.html">Partida</a>.</p>';
  }
  const repetida = Object.values(tudo.donos).some((lista) => lista.length > 1);
  return `<h2>Dar o ponto</h2>
    <p class="sub">O melhor prompt ganha 1 ponto. Empate: 1 ponto para cada.</p>
    ${repetida ? '<p class="alerta-campo">Tem carta repetida em dois prompts: confira os números antes de dar o ponto.</p>' : ''}
    <button type="button" class="botao largo" data-acao="dar">Dar o ponto para ${MP.esc(nomes)}</button>`;
}

function darPonto() {
  partida = MP.lerPartida();
  if (!partida || partida.primeiro === null || MP.pontoDaRodada(partida)) return;
  const tudo = lerTudo();
  if (!tudo.completo) return;
  const resultados = calcular(tudo);
  const ganhadores = resultados.filter((r) => r.ganhou).map((r) => r.i);
  ganhadores.forEach((i) => { partida.lados[i].pontos += 1; });
  resultados.forEach((r) => { partida.lados[r.i].soma += r.soma; });
  partida.historico.push({
    rodada: partida.rodada,
    missao: tudo.missao.codigo,
    prompts: resultados.map((r) => ({ lado: r.i, cartas: r.cartas.map((c) => c.codigo), soma: r.soma })),
    ganhadores,
    roubados: tudo.roubados.map((l) => l.i),
  });
  partida.fase = 'pontuada';
  partida.cronometro = { fim: null, restante: MP.DURACAO_DA_VEZ, esgotou: false };
  MP.salvarPartida(partida);
  MP.aviso(`+1 ponto para ${MP.juntar(ganhadores.map((i) => partida.lados[i].nome))}`);
  mostrarTudo();
}

// Errou? Tira o ponto e a soma das notas, e a rodada volta a ser conferida
function desfazer() {
  partida = MP.lerPartida();
  const ponto = partida && MP.pontoDaRodada(partida);
  if (!ponto) return;
  ponto.ganhadores.forEach((i) => { partida.lados[i].pontos = Math.max(0, partida.lados[i].pontos - 1); });
  ponto.prompts.forEach((p) => { partida.lados[p.lado].soma = Math.max(0, partida.lados[p.lado].soma - p.soma); });
  partida.historico = partida.historico.filter((h) => h.rodada !== partida.rodada);
  partida.fase = 'conferindo';
  partida.fimMostrado = false;
  MP.salvarPartida(partida);
  salvarEstado();
  MP.aviso('Ponto desfeito: pode mudar as cartas');
  mostrarTudo();
}

function avancar() {
  partida = MP.lerPartida();
  if (!partida || !MP.pontoDaRodada(partida)) return;
  MP.avancarRodada(partida);
  location.href = 'index.html';
}

function limpar() {
  estado = { ...estadoVazio(), quantos: estado.quantos };
  salvarEstado();
  mostrarTudo();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ---------- As melhores cartas da missão ----------

function htmlDasMelhores(missao) {
  const maxima = MP.somaMaxima(missao.assuntos);
  return `<p class="sub">Para mostrar depois do resultado: que cartas teriam ajudado?</p>
    ${TIPOS.map((tipo) => `<p class="melhores-tipo ${MP.classeDoTipo(tipo)}">${tipo}</p>
      <ul class="melhores-lista">${MP.melhoresCartas(tipo, missao.assuntos).map(({ carta, soma }) => `<li class="${MP.classeDoTipo(tipo)}">
        <span class="cod">${carta.codigo}</span><span>${MP.esc(carta.nome)}</span><b>${NOTA.numero(soma / 3)}</b></li>`).join('')}
      </ul>`).join('')}
    <p class="nota">Com a melhor carta de cada baralho, o prompt tira ${NOTA.numero(maxima / 9)}: a nota mais alta possível nesta missão.</p>`;
}

// ---------- Atualiza a tela ----------

function textoDoAviso() {
  if (!partida) {
    return 'Sem partida aberta: o aplicativo dá a nota, mas não guarda os pontos. Para o placar, comece uma partida na página <a href="index.html">Partida</a>.';
  }
  if (partida.primeiro === null) return 'Antes, sorteie quem começa na página <a href="index.html">Partida</a>.';
  if (pontoDado()) return 'O ponto desta rodada já foi dado. Para mudar uma carta, toque em Desfazer.';
  if (partida.fase === 'escolhendo') {
    const ordem = MP.ordemDaRodada(partida);
    return `Ainda é a vez de ${MP.esc(partida.lados[ordem[partida.vez]].nome)}. Pode digitar as cartas de quem já escolheu.`;
  }
  return '';
}

function atualizar() {
  const tudo = lerTudo();
  $('#titulo').textContent = partida ? `Rodada ${partida.rodada} de ${MP.rodadasDa(partida)}` : 'Conferir prompts';
  const aviso = textoDoAviso();
  $('#aviso-rodada').hidden = !aviso;
  $('#aviso-rodada').innerHTML = aviso;
  atualizarDigitadas(tudo);

  const mostra = estado.revelado && tudo.completo;
  $('#ver').hidden = mostra;
  $('#falta').hidden = !(estado.revelado && !tudo.completo);
  $('#falta').textContent = `Ainda falta digitar ${MP.juntar(tudo.falta)}.`;
  ['#resultado', '#ponto', '#melhores'].forEach((s) => { $(s).hidden = !mostra; });
  if (!mostra) return;
  const resultados = calcular(tudo);
  $('#resultado').innerHTML = htmlDoResultado(tudo, resultados);
  $('#ponto').innerHTML = htmlDoPonto(tudo, resultados);
  $('#melhores-corpo').innerHTML = htmlDasMelhores(tudo.missao);
}

function mostrarTudo() {
  lerEstado();
  montarCampos();
  atualizar();
}

// ---------- Digitação ----------

// Todos os campos, na ordem: missão, depois C, P e F de cada lado
function proximoCampo(campo) {
  const campos = [...document.querySelectorAll('#missao, #prompts input')].filter((c) => !c.disabled);
  const k = campos.indexOf(campo);
  if (k >= 0 && k < campos.length - 1) campos[k + 1].focus();
  else campo.blur();
}

// O número está completo com 2 algarismos, ou com 1 que não pode virar outro número
// (as missões vão até 9: "4" já é a M04; as cartas vão até 16: "1" pode virar 10 a 16, "3" não)
function numeroCompleto(campo) {
  const valor = campo.value;
  if (valor.length >= 2) return true;
  if (!valor || valor === '0') return false;
  const maximo = campo.id === 'missao' ? TOTAL['Missão'] : TOTAL[campo.dataset.tipo];
  return Number(valor) * 10 > maximo;
}

const principal = document.querySelector('main');
principal.addEventListener('input', (evento) => {
  const campo = evento.target;
  if (campo.tagName !== 'INPUT') return;
  const limpo = campo.value.replace(/\D/g, '').slice(0, 2);
  if (limpo !== campo.value) campo.value = limpo;
  if (campo.id === 'missao') {
    estado.missao = limpo;
  } else {
    const i = campo.closest('[data-prompt]').dataset.prompt;
    estado.prompts[i] = { ...(estado.prompts[i] || {}), [campo.dataset.tipo]: limpo };
  }
  salvarEstado();
  atualizar();
  if ((evento.inputType || '').startsWith('insert') && numeroCompleto(campo)) proximoCampo(campo);
});
// Tocar num campo já preenchido seleciona o número, para digitar o novo por cima
principal.addEventListener('focusin', (evento) => {
  if (evento.target.tagName === 'INPUT') setTimeout(() => evento.target.select(), 0);
});
principal.addEventListener('keydown', (evento) => {
  if (evento.key === 'Enter' && evento.target.tagName === 'INPUT') {
    evento.preventDefault();
    proximoCampo(evento.target);
  }
});

// Foi roubado: o lado perde a rodada, os campos dele somem e ele sai da conta
$('#prompts').addEventListener('click', (evento) => {
  const botao = evento.target.closest('[data-roubado]');
  if (!botao || botao.disabled) return;
  const i = botao.dataset.roubado;
  if (estado.roubados[i]) delete estado.roubados[i];
  else estado.roubados[i] = true;
  salvarEstado();
  montarCampos();
  atualizar();
});

$('#ver').addEventListener('click', () => {
  estado.revelado = true;
  salvarEstado();
  atualizar();
  if (!$('#resultado').hidden) $('#resultado').scrollIntoView({ behavior: 'smooth', block: 'start' });
});
$('#ponto').addEventListener('click', (evento) => {
  const botao = evento.target.closest('[data-acao]');
  if (!botao) return;
  ({ dar: darPonto, desfazer, avancar, limpar })[botao.dataset.acao]();
});
$('#menos-prompts').addEventListener('click', () => {
  estado.quantos = Math.max(2, estado.quantos - 1);
  salvarEstado();
  montarCampos();
  atualizar();
});
$('#mais-prompts').addEventListener('click', () => {
  estado.quantos = Math.min(MAX_PROMPTS, estado.quantos + 1);
  salvarEstado();
  montarCampos();
  atualizar();
});

// Ao voltar da Partida, a rodada pode ter mudado
window.addEventListener('pageshow', (evento) => { if (evento.persisted) mostrarTudo(); });
mostrarTudo();
