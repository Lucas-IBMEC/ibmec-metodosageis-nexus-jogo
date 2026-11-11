// Página Partida: monta a partida, sorteia quem começa, mostra a rodada, de quem é a vez e os pontos de cada lado,
// marca o tempo de cada vez e mostra quem ganhou. Histórias: 2.5.1 (placar) e o cronômetro.
// O ponto de cada rodada entra pela página Rodada, quando o professor confere os prompts.
// Fases de cada rodada: escolhendo (cada lado na sua vez) → conferindo → pontuada → próxima rodada. Depois da última: fim.

const DURACAO_DA_VEZ = MP.DURACAO_DA_VEZ;
const RODADAS = MP.RODADAS;
const MAX_LADOS = DADOS.maximoDeLados || 5;
const VOLTA_DO_RELOGIO = 2 * Math.PI * 28; // tamanho do círculo do cronômetro

const MODOS = {
  duelo: { min: 2, max: 2, padrao: 2, nome: 'Lado', texto: '1 contra 1, ou dupla contra dupla (cada dupla é um lado).' },
  mesa: { min: 3, max: MAX_LADOS, padrao: 3, nome: 'Lado', texto: 'Cada lado é 1 aluno ou 1 dupla. Cada um por si.' },
  turma: { min: 2, max: MAX_LADOS, padrao: 4, nome: 'Grupo', texto: 'Cada grupo é um lado e decide junto. Quem compra as cartas troca a cada rodada.' },
};

const $ = (seletor) => document.querySelector(seletor);
let partida = MP.lerPartida();
let config = { modo: 'duelo', quantos: 2 };

// ---------- Tela 1: montar a partida ----------

function mostrarConfiguracao() {
  const modo = MODOS[config.modo];
  document.querySelectorAll('[data-modo]').forEach((botao) => {
    botao.setAttribute('aria-pressed', String(botao.dataset.modo === config.modo));
  });
  $('#explica-modo').textContent = modo.texto;
  $('#quantos').textContent = config.quantos;
  $('#nome-quantos').textContent = config.modo === 'turma' ? 'grupos' : 'lados';
  $('#rotulo-quantos').textContent = config.modo === 'turma' ? 'Quantos grupos' : 'Quantos lados';
  $('#menos-lados').disabled = config.quantos <= modo.min;
  $('#mais-lados').disabled = config.quantos >= modo.max;

  // Um campo de nome por lado (guarda o que já foi digitado)
  const anteriores = [...document.querySelectorAll('#config-lados input')].map((campo) => campo.value);
  $('#config-lados').innerHTML = Array.from({ length: config.quantos }, (_, i) => (
    `<input class="campo" value="${MP.esc(anteriores[i] || '')}" placeholder="${modo.nome} ${i + 1}"
      aria-label="Nome do ${modo.nome.toLowerCase()} ${i + 1}" autocomplete="off" enterkeyhint="next">`)).join('');
}

function comecarPartida() {
  const nome = MODOS[config.modo].nome;
  const usados = new Set();
  const nomes = [...document.querySelectorAll('#config-lados input')].map((campo, i) => {
    // Dois lados com o mesmo nome confundiriam a hora de dar o ponto
    let escolhido = campo.value.trim() || `${nome} ${i + 1}`;
    if (usados.has(escolhido.toLowerCase())) escolhido = `${escolhido} (${i + 1})`;
    usados.add(escolhido.toLowerCase());
    return escolhido;
  });
  partida = {
    versao: MP.VERSAO_DA_PARTIDA,
    inicio: Date.now(),
    modo: config.modo,
    lados: nomes.map((n) => ({
      nome: n,
      pontos: 0,
      soma: 0, // soma dos números das cartas nas rodadas (desempate)
    })),
    primeiro: null, // quem começa a 1ª rodada
    rodada: 1,
    fase: 'escolhendo',
    vez: 0, // posição na ordem da rodada: 0 é quem começa
    historico: [], // o ponto de cada rodada: { rodada, missao, prompts, ganhadores }
    fimMostrado: false,
    cronometro: { fim: null, restante: DURACAO_DA_VEZ, esgotou: false },
  };
  MP.salvarPartida(partida);
  mostrar();
}

// ---------- Tela 2: placar ----------

const nomeDo = (i) => partida.lados[i].nome;

function htmlDaVez() {
  const ordem = MP.ordemDaRodada(partida);
  if (partida.fase === 'fim') {
    const frente = MP.naFrente(partida);
    return `<div class="vez-topo"><small>Fim da partida · ${RODADAS} rodadas</small>
      <strong>${frente.length > 1 ? `Empate: ${MP.esc(MP.juntar(frente.map((l) => l.nome)))}` : `🏆 ${MP.esc(frente[0].nome)} ganhou!`}</strong></div>`;
  }
  const ponto = MP.pontoDaRodada(partida);
  const titulo = {
    escolhendo: `Vez de ${MP.esc(nomeDo(ordem[partida.vez]))}`,
    conferindo: 'Todos escolheram',
    pontuada: ponto ? `Ponto para ${MP.esc(MP.juntar(ponto.ganhadores.map(nomeDo)))}` : 'Ponto dado',
  }[partida.fase];
  const fila = ordem.map((i, posicao) => {
    let estado = '';
    if (partida.fase !== 'escolhendo' || posicao < partida.vez) estado = 'feito';
    else if (posicao === partida.vez) estado = 'agora';
    return `<span class="na-fila ${estado}">${estado === 'feito' ? '✓ ' : ''}${MP.esc(nomeDo(i))}</span>`;
  }).join('<span class="seta" aria-hidden="true">→</span>');
  return `<div class="vez-topo"><small>Rodada ${partida.rodada} de ${RODADAS}</small><strong>${titulo}</strong></div>
    <div class="fila-da-vez" aria-label="Ordem da rodada">${fila}</div>`;
}

// O que fazer agora, com o botão do próximo passo
function htmlDaFase() {
  if (partida.fase === 'conferindo') {
    return `<p>Virem as cartas. Digite a missão e as 3 cartas de cada lado para ver a nota de cada prompt.</p>
      <a class="botao largo" href="rodada.html">Conferir a rodada</a>`;
  }
  if (partida.fase === 'pontuada') {
    const ultima = partida.rodada >= RODADAS;
    return `<p>As cartas voltam para os seus montes (embaralhe) e a missão sai do jogo.${ultima ? '' : ` Na rodada ${partida.rodada + 1}, começa ${MP.esc(nomeDo(MP.quemComeca(partida, partida.rodada + 1)))}.`}</p>
      <button type="button" class="botao largo" data-acao="avancar">${ultima ? 'Ver o resultado final' : `Começar a rodada ${partida.rodada + 1}`}</button>
      <a class="botao secundario largo" href="rodada.html">Ver o resultado da rodada</a>`;
  }
  if (partida.fase === 'fim') {
    return `<p>Agora o desafio final, sem cartas: cada lado escreve um prompt com as 4 partes e você confere se aprenderam.</p>
      <a class="botao largo" href="aprendeu.html">Conferir se aprendeu</a>
      <button type="button" class="botao secundario largo" data-acao="resultado">Ver o resultado</button>`;
  }
  return '';
}

function htmlDoLado(lado, i) {
  const ordem = MP.ordemDaRodada(partida);
  const posicao = ordem.indexOf(i);
  const escolhendo = partida.fase === 'escolhendo' && partida.primeiro !== null;
  const daVez = escolhendo && posicao === partida.vez;
  const escolheu = escolhendo && posicao < partida.vez;
  const campeao = partida.fase === 'fim' && MP.naFrente(partida).includes(lado);
  return `<article class="lado ${daVez ? 'da-vez' : ''} ${campeao ? 'ganhou' : ''}" data-lado="${i}">
    <div class="lado-texto">
      <p class="lado-nome">${campeao ? '🏆 ' : ''}${MP.esc(lado.nome)}${daVez ? ' <span class="cod selo-vez">VEZ</span>' : ''}</p>
      <span class="lado-info">Soma das notas: ${MP.somaDasNotas(lado)}${escolheu ? ' · <span class="escolheu">✓ escolheu</span>' : ''}</span>
    </div>
    <div class="contador">
      <button type="button" class="mais-menos" data-delta="-1" aria-label="Tirar 1 ponto de ${MP.esc(lado.nome)}">−</button>
      <div class="valor"><b>${lado.pontos}</b><span>${lado.pontos === 1 ? 'ponto' : 'pontos'}</span></div>
      <button type="button" class="mais-menos" data-delta="1" aria-label="Dar 1 ponto a ${MP.esc(lado.nome)}">+</button>
    </div>
  </article>`;
}

function mostrarPlacar() {
  const semComeco = partida.primeiro === null;
  const escolhendo = !semComeco && partida.fase === 'escolhendo';
  $('#quem-comeca').hidden = !semComeco;
  $('#vez').hidden = semComeco;
  $('#barra-turno').hidden = !escolhendo;
  document.body.classList.toggle('com-barra', escolhendo);

  if (semComeco) {
    $('#opcoes-comeca').innerHTML = partida.lados.map((lado, i) => (
      `<button type="button" class="chip" data-comeca="${i}">${MP.esc(lado.nome)}</button>`)).join('');
  } else {
    $('#vez').innerHTML = htmlDaVez();
  }

  const fase = semComeco ? '' : htmlDaFase();
  $('#fase').hidden = !fase;
  $('#fase').innerHTML = fase;
  $('#lados').innerHTML = partida.lados.map(htmlDoLado).join('');
  atualizarAviso();
  atualizarRelogio();

  // A última rodada terminou: mostra o resultado uma vez só
  if (partida.fase === 'fim' && !partida.fimMostrado) {
    partida.fimMostrado = true;
    MP.salvarPartida(partida);
    mostrarFim();
  }
}

function atualizarAviso() {
  const avisos = [];
  if (partida.primeiro !== null && partida.fase === 'escolhendo') {
    if (partida.cronometro.esgotou) {
      avisos.push('Tempo esgotado! O lado escolhe agora as 3 cartas e devolve as outras 6.');
    } else if (partida.vez === 0) {
      avisos.push('Vire 1 missão e leiam juntos o pedido e os 3 assuntos. Depois, toque em Iniciar.');
    } else {
      avisos.push(`Na vez: compre ${DADOS.cartasCompradas || 3} de cada baralho, escolha 1 de cada e devolva as outras 6.`);
    }
  }
  $('#aviso-turno').hidden = avisos.length === 0;
  $('#aviso-turno').textContent = avisos.join(' ');
}

// O + e o − corrigem os pontos à mão (a página Rodada já dá o ponto sozinha)
function mudarPontos(i, delta) {
  const lado = partida.lados[i];
  lado.pontos = Math.max(0, lado.pontos + delta);
  MP.salvarPartida(partida);
  mostrarPlacar();
}

// ---------- Vez ----------

function escolherQuemComeca(i) {
  partida.primeiro = i;
  partida.rodada = 1;
  partida.fase = 'escolhendo';
  partida.vez = 0;
  partida.cronometro = { fim: null, restante: DURACAO_DA_VEZ, esgotou: false };
  MP.salvarPartida(partida);
  mostrarPlacar();
}

function sortearQuemComeca() {
  const i = Math.floor(Math.random() * partida.lados.length);
  escolherQuemComeca(i);
  MP.aviso(`Sorteado: ${partida.lados[i].nome} começa`);
}

// O último lado terminou: hora de conferir os prompts na página Rodada
function proximoLado() {
  if (partida.vez < partida.lados.length - 1) {
    partida.vez += 1;
    iniciarCronometro();
    mostrarPlacar();
    // Com muitos lados, leva a tela até o lado da vez
    document.querySelector('.lado.da-vez')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }
  partida.fase = 'conferindo';
  partida.cronometro = { fim: null, restante: DURACAO_DA_VEZ, esgotou: false };
  MP.salvarPartida(partida);
  location.href = 'rodada.html';
}

// ---------- Cronômetro ----------

function restante() {
  const c = partida.cronometro;
  return c.fim ? Math.max(0, (c.fim - Date.now()) / 1000) : c.restante;
}

function iniciarCronometro() {
  partida.cronometro = { fim: Date.now() + DURACAO_DA_VEZ * 1000, restante: DURACAO_DA_VEZ, esgotou: false };
  MP.salvarPartida(partida);
  manterTelaLigada();
}

function botaoDoCronometro() {
  const c = partida.cronometro;
  if (c.fim) {
    partida.cronometro = { fim: null, restante: restante(), esgotou: false };
    MP.salvarPartida(partida);
  } else if (c.esgotou || c.restante >= DURACAO_DA_VEZ) {
    iniciarCronometro();
  } else {
    partida.cronometro.fim = Date.now() + c.restante * 1000;
    MP.salvarPartida(partida);
    manterTelaLigada();
  }
  prepararSom();
  atualizarAviso();
  atualizarRelogio();
}

function atualizarRelogio() {
  if (!partida || partida.primeiro === null || partida.fase !== 'escolhendo') return;
  const c = partida.cronometro;
  if (c.fim && restante() <= 0) {
    partida.cronometro = { fim: null, restante: 0, esgotou: true };
    MP.salvarPartida(partida);
    tocarAlarme();
    atualizarAviso();
  }
  const segundos = Math.ceil(restante());
  $('#segundos').textContent = segundos;
  $('#arco').style.strokeDasharray = VOLTA_DO_RELOGIO;
  // Tempo esgotado: o círculo fica inteiro e vermelho
  const fracao = partida.cronometro.esgotou ? 1 : restante() / DURACAO_DA_VEZ;
  $('#arco').style.strokeDashoffset = VOLTA_DO_RELOGIO * (1 - fracao);
  const relogio = $('#relogio');
  relogio.classList.toggle('pouco', segundos <= 10 && segundos > 0);
  relogio.classList.toggle('fim', partida.cronometro.esgotou);
  const botao = $('#cronometro');
  if (partida.cronometro.fim) botao.textContent = 'Pausar';
  else if (partida.cronometro.esgotou) botao.textContent = 'Reiniciar';
  else botao.textContent = segundos >= DURACAO_DA_VEZ ? 'Iniciar' : 'Continuar';
  $('#proximo').textContent = partida.vez >= partida.lados.length - 1 ? 'Conferir a rodada' : 'Próximo lado';
}

// Som e vibração quando o tempo acaba (o som só pode tocar depois de um toque na tela)
let audio;
function prepararSom() {
  try {
    if (!audio && window.AudioContext) audio = new AudioContext();
  } catch (erro) {
    // Sem som: o círculo vermelho e o aviso continuam
  }
}
function tocarAlarme() {
  if (navigator.vibrate) navigator.vibrate([250, 120, 250]);
  if (!audio) return;
  [0, 0.3].forEach((atraso) => {
    const osc = audio.createOscillator();
    const volume = audio.createGain();
    osc.frequency.value = 880;
    volume.gain.setValueAtTime(0.25, audio.currentTime + atraso);
    volume.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + atraso + 0.22);
    osc.connect(volume).connect(audio.destination);
    osc.start(audio.currentTime + atraso);
    osc.stop(audio.currentTime + atraso + 0.25);
  });
}

// Não deixa a tela do celular apagar durante a partida
let travaDaTela;
async function manterTelaLigada() {
  try {
    if ('wakeLock' in navigator && !travaDaTela) {
      travaDaTela = await navigator.wakeLock.request('screen');
      travaDaTela.addEventListener('release', () => { travaDaTela = null; });
    }
  } catch (erro) {
    // Alguns navegadores não deixam: a partida funciona igual
  }
}

// ---------- Fim da partida ----------

function mostrarFim() {
  const ordem = MP.ranking(partida);
  const frente = MP.naFrente(partida);
  const acabou = partida.fase === 'fim';
  $('#fim-titulo').textContent = frente.length > 1 ? 'Empate!' : `🏆 ${frente[0].nome} ganhou!`;
  $('#fim-sub').textContent = `${acabou ? `Depois de ${RODADAS} rodadas.` : `Partida encerrada na rodada ${partida.rodada} de ${RODADAS}.`} Ganha quem tem mais pontos. Empate nos pontos: ganha quem somou as maiores notas.`;
  $('#ranking').innerHTML = ordem.map((lado) => `<li class="${frente.includes(lado) ? 'primeiro' : ''}">
    <span>${frente.includes(lado) ? '🏆 ' : ''}${MP.esc(lado.nome)}</span>
    <span>${MP.plural(lado.pontos, 'ponto', 'pontos')} · notas ${MP.somaDasNotas(lado)}</span></li>`).join('');
  $('#voltar-jogo').textContent = acabou ? 'Fechar' : 'Voltar ao jogo';
  if (!$('#fim').open) $('#fim').showModal();
}

// Pede confirmação numa janela do próprio aplicativo (o confirm() do navegador some em alguns celulares)
function pedirNovaPartida() {
  if ($('#fim').open) $('#fim').close();
  $('#confirmar-nova').showModal();
}

function novaPartida() {
  partida = null;
  MP.apagar('mp-partida');
  MP.apagar('mp-rodada');
  $('#confirmar-nova').close();
  mostrar();
  window.scrollTo({ top: 0 });
}

// ---------- Ligações ----------

function mostrar() {
  $('#tela-nova').hidden = Boolean(partida);
  $('#tela-placar').hidden = !partida;
  if (!partida) {
    $('#barra-turno').hidden = true;
    document.body.classList.remove('com-barra');
    mostrarConfiguracao();
  } else {
    mostrarPlacar();
  }
}

$('#modos').addEventListener('click', (evento) => {
  const botao = evento.target.closest('[data-modo]');
  if (!botao) return;
  config.modo = botao.dataset.modo;
  config.quantos = MODOS[config.modo].padrao;
  mostrarConfiguracao();
});
$('#menos-lados').addEventListener('click', () => { config.quantos -= 1; mostrarConfiguracao(); });
$('#mais-lados').addEventListener('click', () => { config.quantos += 1; mostrarConfiguracao(); });
$('#comecar').addEventListener('click', comecarPartida);

$('#sortear').addEventListener('click', sortearQuemComeca);
$('#opcoes-comeca').addEventListener('click', (evento) => {
  const botao = evento.target.closest('[data-comeca]');
  if (botao) escolherQuemComeca(Number(botao.dataset.comeca));
});
$('#lados').addEventListener('click', (evento) => {
  const botao = evento.target.closest('[data-delta]');
  if (!botao) return;
  mudarPontos(Number(botao.closest('[data-lado]').dataset.lado), Number(botao.dataset.delta));
});
$('#fase').addEventListener('click', (evento) => {
  const botao = evento.target.closest('[data-acao]');
  if (!botao) return;
  if (botao.dataset.acao === 'avancar') {
    MP.avancarRodada(partida);
    mostrarPlacar();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else if (botao.dataset.acao === 'resultado') {
    mostrarFim();
  }
});
$('#cronometro').addEventListener('click', botaoDoCronometro);
$('#proximo').addEventListener('click', () => { prepararSom(); proximoLado(); });
$('#encerrar').addEventListener('click', mostrarFim);
$('#nova').addEventListener('click', pedirNovaPartida);
$('#nova-do-fim').addEventListener('click', pedirNovaPartida);
$('#confirmar-nova-botao').addEventListener('click', novaPartida);
$('#cancelar-nova').addEventListener('click', () => $('#confirmar-nova').close());
$('#voltar-jogo').addEventListener('click', () => $('#fim').close());

// A página Rodada pode ter mudado o placar
window.addEventListener('pageshow', () => { partida = MP.lerPartida(); mostrar(); });
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && partida?.cronometro?.fim) manterTelaLigada();
});
setInterval(atualizarRelogio, 250);
mostrar();
