// Página Rodada, um passo por vez: o professor digita o número da missão e toca em OK. Depois aparece
// o 1º lado da rodada: ele digita as 3 cartas desse lado (contexto, persona e formato), toca em OK
// e aparece o próximo lado, na ordem da rodada. Lado roubado por uma carta especial: toque em Foi roubado.
// Ele perde a rodada (não ganha ponto) e não precisa digitar as cartas.
// Depois do último lado, o aplicativo dá a nota de cada prompt (a média dos números escondidos nos 3 assuntos
// da missão), diz por que cada um perdeu pontos e dá 1 ponto para o melhor (empate: 1 ponto para cada).
// Histórias: 2.1.1, 2.1.2, 2.2.1 e 2.2.2.

const $ = (seletor) => document.querySelector(seletor);
const TIPOS = MP.TIPOS;
const MAX_PROMPTS = DADOS.maximoDeLados || 5;
// Quantas cartas tem cada baralho (para saber quando um número já está completo)
const TOTAL = Object.fromEntries(['Missão', ...TIPOS].map((tipo) => [tipo, DADOS.cartas.filter((c) => c.tipo === tipo).length]));

let partida = MP.lerPartida();
let estado;

// O passo guardado pode ser 'missao', 'resultado' ou o número de um lado (que volta do armazenamento como número)
const mesmo = (a, b) => String(a) === String(b);

// ---------- Estado da página ----------

// As cartas digitadas valem para uma rodada só: quando a rodada muda, a página começa limpa
function chaveAtual() {
  return partida ? `${partida.inicio}-${partida.rodada}` : 'sem-partida';
}

// etapa: o passo de agora ('missao', o número do lado em partida.lados ou 'resultado')
// feitos: os lados em que o professor já tocou em OK
function estadoVazio() {
  return { chave: chaveAtual(), missao: '', prompts: {}, roubados: {}, feitos: {}, quantos: 2, etapa: 'missao' };
}

function pontoDado() {
  return Boolean(partida && MP.pontoDaRodada(partida));
}

function lerEstado() {
  partida = MP.lerPartida();
  const guardado = MP.ler('mp-rodada', null);
  estado = guardado && guardado.chave === chaveAtual() ? { ...estadoVazio(), ...guardado } : estadoVazio();
  // Ponto já dado: a página mostra as cartas que valeram o ponto e o resultado
  const ponto = partida && MP.pontoDaRodada(partida);
  if (ponto) {
    estado.missao = String(Number(ponto.missao.slice(1)));
    estado.prompts = {};
    ponto.prompts.forEach((p) => {
      estado.prompts[p.lado] = Object.fromEntries(TIPOS.map((tipo, k) => [tipo, String(Number(p.cartas[k].slice(1)))]));
    });
    estado.roubados = Object.fromEntries((ponto.roubados || []).map((i) => [i, true]));
    estado.feitos = Object.fromEntries(quem().map(({ i }) => [i, true]));
    estado.etapa = 'resultado';
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

// A missão, as cartas de cada lado e o que falta
function lerTudo() {
  const missao = MP.cartaPeloNumero('Missão', estado.missao);
  const todas = quem().map(({ i, nome }, posicao) => {
    const digitado = estado.prompts[i] || {};
    const cartas = TIPOS.map((tipo) => {
      const numero = String(digitado[tipo] || '');
      return { tipo, numero, carta: MP.cartaPeloNumero(tipo, numero) };
    });
    const completo = cartas.every((c) => c.carta);
    const roubado = Boolean(estado.roubados[i]);
    // Pronto: o professor tocou em OK com as 3 cartas certas, ou o lado foi roubado
    const pronto = roubado || (Boolean(estado.feitos[i]) && completo);
    return { i, nome, posicao, cartas, completo, roubado, pronto };
  });
  // Quem foi roubado fica de fora da conta
  const roubados = todas.filter((linha) => linha.roubado);
  const linhas = todas.filter((linha) => !linha.roubado);
  // Só existe uma carta de cada: a mesma carta em dois prompts quer dizer que alguém digitou errado
  const donos = {};
  linhas.forEach((linha) => linha.cartas.forEach((c) => {
    if (!c.carta) return;
    donos[c.carta.codigo] = donos[c.carta.codigo] || [];
    donos[c.carta.codigo].push(linha);
  }));
  const completo = Boolean(missao) && todas.every((linha) => linha.pronto);
  return { missao, todas, linhas, roubados, donos, completo };
}

// ---------- Passos ----------

// O primeiro passo que ainda falta (a missão ou um lado). Nada falta: o resultado
function proximaEtapa(tudo) {
  if (!tudo.missao) return 'missao';
  const falta = tudo.todas.find((linha) => !linha.pronto);
  return falta ? falta.i : 'resultado';
}

// Só vale o roubo de quem está na rodada, e sempre sobra pelo menos 1 lado que não foi roubado
function ajustarRoubados() {
  const naRodada = new Set(quem().map(({ i }) => String(i)));
  [estado.roubados, estado.feitos].forEach((lista) => {
    Object.keys(lista).forEach((i) => { if (!naRodada.has(i)) delete lista[i]; });
  });
  if (Object.keys(estado.roubados).length >= naRodada.size) estado.roubados = {};
}

// O passo guardado ainda existe? (sem partida, o número de prompts pode mudar)
function ajustarEtapa(tudo) {
  if (estado.etapa === 'missao') return;
  if (estado.etapa === 'resultado') {
    if (!tudo.completo) estado.etapa = proximaEtapa(tudo);
    return;
  }
  if (!tudo.todas.some((linha) => mesmo(linha.i, estado.etapa))) estado.etapa = proximaEtapa(tudo);
}

function linhaDaEtapa(tudo) {
  return tudo.todas.find((linha) => mesmo(linha.i, estado.etapa)) || null;
}

// A faixa de cima: Missão → Lucas → Bernardo → Igor → Resultado. Toque num passo feito para corrigir.
function htmlDasEtapas(tudo) {
  const travado = pontoDado();
  const proxima = proximaEtapa(tudo);
  const passos = [
    { etapa: 'missao', nome: tudo.missao ? tudo.missao.codigo : 'Missão', feito: Boolean(tudo.missao) },
    ...tudo.todas.map((linha) => ({ etapa: linha.i, nome: linha.nome, feito: linha.pronto, roubado: linha.roubado })),
    { etapa: 'resultado', nome: 'Resultado', feito: false },
  ];
  return passos.map((p) => {
    const agora = mesmo(p.etapa, estado.etapa);
    const pode = !travado && (p.feito || p.etapa === 'missao' || mesmo(p.etapa, proxima));
    const classe = p.roubado ? 'roubado' : (p.feito ? 'feito' : '');
    const marca = p.roubado ? '✕ ' : (p.feito ? '✓ ' : '');
    return `<li><button type="button" class="etapa-chip ${classe}" data-etapa="${p.etapa}"
      ${agora ? 'aria-current="step"' : ''} ${agora || pode ? '' : 'disabled'}>${marca}${MP.esc(p.nome)}</button></li>`;
  }).join('');
}

// Passo 1: a missão (sem partida, também quantos prompts)
function htmlDaMissao() {
  return `<div class="etapa-topo"><h2><span class="passo">1</span>A missão da rodada</h2></div>
    <p class="sub">Digite o número da carta de missão e toque em OK.</p>
    <label class="campo-codigo t-missao missao-campo">
      <span class="letra" aria-hidden="true">M</span>
      <input class="campo" id="missao" inputmode="numeric" pattern="[0-9]*" maxlength="2" autocomplete="off"
        enterkeyhint="done" aria-label="Número da missão" placeholder="Número, ex.: 4" value="${MP.esc(estado.missao)}">
    </label>
    <div id="missao-info" aria-live="polite"></div>
    ${partida ? '' : `<div class="quantos-prompts">
      <span class="rotulo" style="margin: 0">Quantos prompts</span>
      <div class="contador">
        <button type="button" class="mais-menos" data-acao="menos" aria-label="Menos prompts" ${estado.quantos <= 2 ? 'disabled' : ''}>−</button>
        <div class="valor"><b>${estado.quantos}</b><span>prompts</span></div>
        <button type="button" class="mais-menos" data-acao="mais" aria-label="Mais prompts" ${estado.quantos >= MAX_PROMPTS ? 'disabled' : ''}>+</button>
      </div>
    </div>`}
    <button type="button" class="botao largo" id="ok" data-acao="ok">OK</button>`;
}

// Os outros passos: as 3 cartas de um lado
function htmlDoLado(tudo, linha) {
  const nome = MP.esc(linha.nome);
  const livres = tudo.todas.filter((l) => !l.roubado).length;
  // Sempre sobra pelo menos 1 lado que não foi roubado
  const podeRoubar = linha.roubado || livres > 1;
  const comOrdem = partida && partida.primeiro !== null;
  const ordem = comOrdem ? `${linha.posicao + 1}º lado de ${tudo.todas.length}. ` : '';
  const miolo = linha.roubado
    ? `<p class="roubado-aviso">Roubo: ${nome} perdeu a rodada e não ganha ponto. Não precisa digitar as cartas. Foi engano? Toque de novo em Foi roubado.</p>`
    : `<div class="cartas-lado">${TIPOS.map((tipo) => `
      <div class="carta-linha ${MP.classeDoTipo(tipo)}">
        <label class="campo-codigo">
          <span class="letra" aria-hidden="true">${MP.LETRA[tipo]}</span>
          <input class="campo" data-tipo="${tipo}" inputmode="numeric" pattern="[0-9]*" maxlength="2" autocomplete="off"
            enterkeyhint="${tipo === 'Formato' ? 'done' : 'next'}" placeholder="nº" aria-label="${tipo} de ${nome}"
            value="${MP.esc((estado.prompts[linha.i] || {})[tipo] || '')}">
        </label>
        <div class="carta-nome" data-nome="${tipo}" aria-live="polite"></div>
      </div>`).join('')}</div>`;
  return `<div class="etapa-topo">
      <h2><span class="passo">${linha.posicao + 2}</span><span class="etapa-nome">${nome}</span></h2>
      <button type="button" class="chip roubo" data-acao="roubo" aria-pressed="${linha.roubado}" ${podeRoubar ? '' : 'disabled'}>Foi roubado</button>
    </div>
    <p class="sub">${ordem}${linha.roubado ? '' : `Digite o número das 3 cartas de ${nome} e toque em OK.`}</p>
    ${miolo}
    <div class="acoes">
      <button type="button" class="botao secundario" data-acao="voltar">Voltar</button>
      <button type="button" class="botao" id="ok" data-acao="ok">OK</button>
    </div>`;
}

// Embaixo do campo da missão: os assuntos e o pedido, ou o erro
function htmlDaMissaoInfo(tudo) {
  if (!estado.missao) return '';
  if (!tudo.missao) {
    return `<p class="erro-campo">Não existe ${codigoDe('Missão', estado.missao)}. As missões vão de 1 a ${TOTAL['Missão']}.</p>`;
  }
  const saiu = partida && partida.historico.find((h) => h.missao === tudo.missao.codigo && h.rodada !== partida.rodada);
  return `<div class="assuntos-missao">${tudo.missao.assuntos.map((a) => `<span class="assunto-tag">${MP.esc(MP.comSimbolo(a))}</span>`).join('')}</div>
    <p class="pedido-missao">“${MP.esc(tudo.missao.nome)}”</p>
    ${saiu ? `<p class="alerta-campo">A ${tudo.missao.codigo} já saiu na rodada ${saiu.rodada}.</p>` : ''}`;
}

// Ao lado de cada campo: o nome da carta digitada, ou o erro
function htmlDoNome(tudo, linha, c) {
  if (!c.numero) return `<small>${c.tipo}</small>`;
  if (!c.carta) {
    return `<small>${c.tipo}</small><span class="erro-campo">Não existe ${codigoDe(c.tipo, c.numero)}. Vai de 1 a ${TOTAL[c.tipo]}.</span>`;
  }
  const outros = (tudo.donos[c.carta.codigo] || []).filter((l) => l !== linha);
  return `<small>${c.tipo} · ${c.carta.codigo}</small><b>${MP.esc(c.carta.nome)}</b>
    ${outros.length ? `<span class="alerta-campo">Também está com ${MP.esc(MP.juntar(outros.map((o) => o.nome)))}: confira o número.</span>` : ''}`;
}

// Atualiza o que muda enquanto o professor digita, sem refazer os campos (o teclado continua aberto)
function atualizarEtapa(tudo = lerTudo()) {
  $('#etapas').innerHTML = htmlDasEtapas(tudo);
  const ok = $('#ok');
  if (estado.etapa === 'missao') {
    $('#missao-info').innerHTML = htmlDaMissaoInfo(tudo);
    if (ok) ok.disabled = !tudo.missao;
    return;
  }
  const linha = linhaDaEtapa(tudo);
  if (!linha) return;
  if (ok) ok.disabled = !(linha.completo || linha.roubado);
  if (linha.roubado) return;
  linha.cartas.forEach((c) => {
    const alvo = document.querySelector(`[data-nome="${c.tipo}"]`);
    if (alvo) alvo.innerHTML = htmlDoNome(tudo, linha, c);
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
    ${tudo.roubados.length ? `<p class="roubados-res">Roubo: ${MP.esc(MP.juntar(tudo.roubados.map((l) => l.nome)))} perdeu a rodada e não ganha ponto.</p>` : ''}`;
}

// ---------- Ponto ----------

function htmlDoPonto(tudo, resultados) {
  const nomes = MP.juntar(resultados.filter((r) => r.ganhou).map((r) => r.nome));
  const corrigir = '<p class="sub">Digitou um número errado? Toque no nome do lado, lá em cima, para corrigir.</p>';
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
    ${corrigir}
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
  MP.aviso('Ponto desfeito: toque num lado para mudar as cartas');
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
  mostrarEtapa(true);
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

// Monta o passo de agora. focar: leva o cursor para o primeiro campo vazio (depois de um toque do professor)
function mostrarEtapa(focar) {
  ajustarRoubados();
  const tudo = lerTudo();
  ajustarEtapa(tudo);
  $('#titulo').textContent = partida ? `Rodada ${partida.rodada} de ${MP.rodadasDa(partida)}` : 'Conferir prompts';
  const aviso = textoDoAviso();
  $('#aviso-rodada').hidden = !aviso;
  $('#aviso-rodada').innerHTML = aviso;

  const noResultado = estado.etapa === 'resultado';
  $('#etapa').hidden = noResultado;
  ['#resultado', '#ponto', '#melhores'].forEach((s) => { $(s).hidden = !noResultado; });
  if (noResultado) {
    $('#etapas').innerHTML = htmlDasEtapas(tudo);
    const resultados = calcular(tudo);
    $('#resultado').innerHTML = htmlDoResultado(tudo, resultados);
    $('#ponto').innerHTML = htmlDoPonto(tudo, resultados);
    $('#melhores-corpo').innerHTML = htmlDasMelhores(tudo.missao);
    if (focar) $('#resultado').scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }
  $('#etapa').innerHTML = estado.etapa === 'missao' ? htmlDaMissao() : htmlDoLado(tudo, linhaDaEtapa(tudo));
  atualizarEtapa(tudo);
  if (focar) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const vazio = [...$('#etapa').querySelectorAll('input.campo')].find((campo) => !campo.value);
    if (vazio) vazio.focus({ preventScroll: true });
  }
}

function mostrarTudo() {
  lerEstado();
  mostrarEtapa(false);
}

// ---------- Botões ----------

function irPara(etapa) {
  if (pontoDado()) return;
  estado.etapa = etapa === 'missao' || etapa === 'resultado' ? etapa : Number(etapa);
  salvarEstado();
  mostrarEtapa(true);
}

// OK: guarda o passo e mostra o próximo que falta (depois do último lado, o resultado)
function confirmar() {
  const tudo = lerTudo();
  if (estado.etapa === 'missao') {
    if (!tudo.missao) return;
  } else {
    const linha = linhaDaEtapa(tudo);
    if (!linha || !(linha.completo || linha.roubado)) return;
    estado.feitos[linha.i] = true;
    if (!linha.roubado) MP.aviso(`Cartas de ${linha.nome} salvas`);
  }
  estado.etapa = proximaEtapa(lerTudo());
  salvarEstado();
  mostrarEtapa(true);
}

// Foi roubado: o lado perde a rodada e o aplicativo já passa para o próximo. Tocar de novo desfaz.
function alternarRoubo() {
  const tudo = lerTudo();
  const linha = linhaDaEtapa(tudo);
  if (!linha) return;
  if (linha.roubado) {
    delete estado.roubados[linha.i];
    salvarEstado();
    mostrarEtapa(true);
    return;
  }
  if (tudo.todas.filter((l) => !l.roubado).length <= 1) return;
  estado.roubados[linha.i] = true;
  estado.feitos[linha.i] = true;
  MP.aviso(`Roubo: ${linha.nome} perdeu a rodada`);
  estado.etapa = proximaEtapa(lerTudo());
  salvarEstado();
  mostrarEtapa(true);
}

// Volta para o passo anterior (a missão ou o lado de antes)
function voltar() {
  const passos = ['missao', ...quem().map(({ i }) => i)];
  const k = passos.findIndex((p) => mesmo(p, estado.etapa));
  if (k > 0) irPara(passos[k - 1]);
}

function mudarQuantos(delta) {
  estado.quantos = Math.min(MAX_PROMPTS, Math.max(2, estado.quantos + delta));
  salvarEstado();
  mostrarEtapa(false);
}

// ---------- Digitação ----------

// Os campos do passo, na ordem: C, P e F. Depois do último, o cursor vai para o OK
function proximoCampo(campo) {
  const campos = [...$('#etapa').querySelectorAll('input.campo')];
  const k = campos.indexOf(campo);
  if (k >= 0 && k < campos.length - 1) {
    campos[k + 1].focus();
    return;
  }
  const ok = $('#ok');
  if (ok && !ok.disabled) {
    ok.focus();
    return;
  }
  // Ainda falta um campo antes: volta para ele
  const vazio = campos.find((c) => !c.value);
  if (vazio) vazio.focus();
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
    const i = estado.etapa;
    estado.prompts[i] = { ...(estado.prompts[i] || {}), [campo.dataset.tipo]: limpo };
  }
  salvarEstado();
  atualizarEtapa();
  if ((evento.inputType || '').startsWith('insert') && numeroCompleto(campo)) proximoCampo(campo);
});
// Tocar num campo já preenchido seleciona o número, para digitar o novo por cima
// (só se o campo ainda estiver com o cursor: o select() puxaria o cursor de volta depois de ele ir para o OK)
principal.addEventListener('focusin', (evento) => {
  const campo = evento.target;
  if (campo.tagName === 'INPUT') setTimeout(() => { if (document.activeElement === campo) campo.select(); }, 0);
});
// Enter: vai para o próximo campo; no último, é o mesmo que tocar em OK
principal.addEventListener('keydown', (evento) => {
  if (evento.key !== 'Enter' || evento.target.tagName !== 'INPUT') return;
  evento.preventDefault();
  const campos = [...$('#etapa').querySelectorAll('input.campo')];
  const ok = $('#ok');
  if (campos.indexOf(evento.target) === campos.length - 1 && ok && !ok.disabled) confirmar();
  else proximoCampo(evento.target);
});

$('#etapa').addEventListener('click', (evento) => {
  const botao = evento.target.closest('[data-acao]');
  if (!botao || botao.disabled) return;
  ({
    ok: confirmar,
    voltar,
    roubo: alternarRoubo,
    menos: () => mudarQuantos(-1),
    mais: () => mudarQuantos(1),
  })[botao.dataset.acao]();
});
$('#etapas').addEventListener('click', (evento) => {
  const botao = evento.target.closest('[data-etapa]');
  if (!botao || botao.disabled || botao.getAttribute('aria-current') === 'step') return;
  irPara(botao.dataset.etapa);
});
$('#ponto').addEventListener('click', (evento) => {
  const botao = evento.target.closest('[data-acao]');
  if (!botao) return;
  ({ dar: darPonto, desfazer, avancar, limpar })[botao.dataset.acao]();
});

// Ao voltar da Partida, a rodada pode ter mudado
window.addEventListener('pageshow', (evento) => { if (evento.persisted) mostrarTudo(); });
mostrarTudo();
