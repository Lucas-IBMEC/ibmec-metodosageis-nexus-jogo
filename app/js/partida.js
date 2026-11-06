// Página Partida: monta a partida, sorteia quem começa, mostra as estrelas de cada lado,
// marca o tempo de cada vez e mostra quem ganhou. Histórias: 2.5.1 (placar) e o cronômetro.
// As estrelas entram pela página Missão, quando o professor confere o prompt de quem bateu.

const DURACAO_DA_VEZ = DADOS.duracaoDaVez || 30; // segundos
const META = DADOS.metaDeEstrelas || 6;
const VOLTA_DO_RELOGIO = 2 * Math.PI * 28; // tamanho do círculo do cronômetro

const MODOS = {
  duelo: { min: 2, max: 2, padrao: 2, nome: 'Lado', texto: '1 contra 1, ou dupla contra dupla (cada dupla é um lado).' },
  mesa: { min: 3, max: 5, padrao: 3, nome: 'Lado', texto: 'Cada lado é 1 aluno ou 1 dupla. Todos contra todos.' },
  turma: { min: 2, max: 5, padrao: 4, nome: 'Grupo', texto: 'Cada grupo é um lado e decide junto. Quem segura as cartas troca a cada vez.' },
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
  partida = {
    versao: MP.VERSAO_DA_PARTIDA,
    inicio: Date.now(),
    modo: config.modo,
    lados: [...document.querySelectorAll('#config-lados input')].map((campo, i) => ({
      nome: campo.value.trim() || `${nome} ${i + 1}`,
      estrelas: 0,
      missoes: 0, // missões feitas
      perfeitas: 0, // missões com 3 estrelas (desempate)
    })),
    feitas: [], // códigos das missões que já saíram da mesa
    vez: null,
    turno: 0,
    fimMostrado: false,
    cronometro: { fim: null, restante: DURACAO_DA_VEZ, esgotou: false },
  };
  MP.salvarPartida(partida);
  mostrar();
}

// ---------- Tela 2: placar ----------

// Do mais perto da vitória para o mais longe (empate: mais missões com 3 estrelas)
function ranking() {
  return [...partida.lados].sort((a, b) => b.estrelas - a.estrelas || b.perfeitas - a.perfeitas);
}

// Quem chegou à meta (se mais de um, o que tem mais estrelas)
function vencedor() {
  const primeiro = ranking()[0];
  return primeiro && primeiro.estrelas >= META ? primeiro : null;
}

function filaDeEstrelas(n) {
  const cheias = Math.min(n, META);
  return `${'★'.repeat(cheias)}<span class="vazias">${'☆'.repeat(META - cheias)}</span>${n > META ? `<small>+${n - META}</small>` : ''}`;
}

function htmlDoLado(lado, i) {
  const daVez = i === partida.vez;
  const ganhou = lado.estrelas >= META;
  return `<article class="lado ${daVez ? 'da-vez' : ''} ${ganhou ? 'ganhou' : ''}" data-lado="${i}">
    <div class="lado-topo">
      <div>
        <p class="lado-nome">${ganhou ? '🏆 ' : ''}${MP.esc(lado.nome)}</p>
        <span class="lado-info">${MP.plural(lado.missoes, 'missão feita', 'missões feitas')}${lado.perfeitas ? ` · ${lado.perfeitas} com ★★★` : ''}</span>
      </div>
      ${daVez ? '<span class="cod selo-vez">VEZ</span>' : ''}
    </div>
    <div class="estrelas-lado">
      <p class="fila-estrelas" aria-hidden="true">${filaDeEstrelas(lado.estrelas)}</p>
      <div class="contador">
        <button type="button" class="mais-menos" data-delta="-1" aria-label="Tirar 1 estrela de ${MP.esc(lado.nome)}">−</button>
        <div class="valor"><b>${lado.estrelas}</b><span>de ${META} ★</span></div>
        <button type="button" class="mais-menos" data-delta="1" aria-label="Dar 1 estrela a ${MP.esc(lado.nome)}">+</button>
      </div>
    </div>
  </article>`;
}

function mostrarPlacar() {
  const escolhendo = partida.vez === null;
  $('#quem-comeca').hidden = !escolhendo;
  $('#vez').hidden = escolhendo;
  $('#barra-turno').hidden = escolhendo;
  document.body.classList.toggle('com-barra', !escolhendo);
  const campeao = vencedor();

  if (escolhendo) {
    $('#opcoes-comeca').innerHTML = partida.lados.map((lado, i) => (
      `<button type="button" class="chip" data-comeca="${i}">${MP.esc(lado.nome)}</button>`)).join('');
  } else {
    const lado = partida.lados[partida.vez];
    $('#vez').innerHTML = campeao
      ? `<div><small>Chegou a ${MP.plural(campeao.estrelas, 'estrela', 'estrelas')}</small><br><strong>🏆 ${MP.esc(campeao.nome)} ganhou!</strong></div>`
      : `<div><small>Vez de</small><br><strong>${MP.esc(lado.nome)}</strong></div>
        <small>${MP.plural(partida.feitas.length, 'missão feita', 'missões feitas')} de ${DADOS.totalDeMissoes}</small>`;
    const avisos = [];
    if (!campeao && partida.turno === 1) {
      avisos.push('Na vez: compre 1, bata se fechou um prompt e descarte 1. Alguém bateu? Confira na página Missão.');
    }
    if (!campeao && partida.feitas.length >= DADOS.totalDeMissoes) {
      avisos.push('As missões acabaram: toque em Encerrar partida. Ganha quem tiver mais estrelas.');
    }
    $('#aviso-turno').hidden = avisos.length === 0;
    $('#aviso-turno').textContent = avisos.join(' ');
  }
  $('#lados').innerHTML = partida.lados.map(htmlDoLado).join('');
  atualizarRelogio();

  // Alguém chegou à meta (na página Missão): mostra o resultado uma vez só.
  // Se a estrela for desfeita, a vitória some e pode aparecer de novo depois.
  if (!campeao && partida.fimMostrado) {
    partida.fimMostrado = false;
    MP.salvarPartida(partida);
  }
  if (campeao && !partida.fimMostrado && !escolhendo) {
    partida.fimMostrado = true;
    partida.cronometro = { fim: null, restante: restante(), esgotou: false };
    MP.salvarPartida(partida);
    encerrar();
  }
}

// O + e o − corrigem as estrelas à mão (a página Missão já soma sozinha)
function mudarEstrelas(i, delta) {
  const lado = partida.lados[i];
  lado.estrelas = Math.max(0, lado.estrelas + delta);
  MP.salvarPartida(partida);
  mostrarPlacar();
}

// ---------- Vez ----------

function escolherQuemComeca(i) {
  partida.vez = i;
  partida.turno = 1;
  partida.cronometro = { fim: null, restante: DURACAO_DA_VEZ, esgotou: false };
  MP.salvarPartida(partida);
  mostrarPlacar();
}

function sortearQuemComeca() {
  const i = Math.floor(Math.random() * partida.lados.length);
  escolherQuemComeca(i);
  MP.aviso(`Sorteado: ${partida.lados[i].nome} começa`);
}

function passarAVez() {
  partida.vez = (partida.vez + 1) % partida.lados.length;
  partida.turno += 1;
  iniciarCronometro();
  mostrarPlacar();
  // Com muitos grupos, leva a tela até o lado da vez
  document.querySelector('.lado.da-vez')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
  atualizarRelogio();
}

function atualizarRelogio() {
  if (!partida || partida.vez === null) return;
  const c = partida.cronometro;
  const r = restante();
  if (c.fim && r <= 0) {
    partida.cronometro = { fim: null, restante: 0, esgotou: true };
    MP.salvarPartida(partida);
    tocarAlarme();
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
  if (partida.cronometro.esgotou) {
    $('#aviso-turno').hidden = false;
    $('#aviso-turno').textContent = 'Tempo esgotado! O lado descarta 1 carta e passa a vez.';
  }
}

// Som e vibração quando o tempo acaba (o som só pode tocar depois de um toque na tela)
let audio;
function prepararSom() {
  if (!audio && window.AudioContext) audio = new AudioContext();
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

function encerrar() {
  const ordem = ranking();
  const primeiro = ordem[0];
  const empatados = ordem.filter((l) => l.estrelas === primeiro.estrelas && l.perfeitas === primeiro.perfeitas);
  $('#fim-titulo').textContent = empatados.length > 1 ? 'Empate!' : `🏆 ${primeiro.nome} ganhou!`;
  $('#ranking').innerHTML = ordem.map((lado) => `<li>
    <span>${empatados.includes(lado) ? '🏆 ' : ''}${MP.esc(lado.nome)}</span>
    <span>${MP.plural(lado.estrelas, 'estrela', 'estrelas')} · ${MP.plural(lado.missoes, 'missão', 'missões')}</span></li>`).join('');
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
  mudarEstrelas(Number(botao.closest('[data-lado]').dataset.lado), Number(botao.dataset.delta));
});
$('#cronometro').addEventListener('click', botaoDoCronometro);
$('#proximo').addEventListener('click', () => { prepararSom(); passarAVez(); });
$('#encerrar').addEventListener('click', encerrar);
$('#nova').addEventListener('click', pedirNovaPartida);
$('#nova-do-fim').addEventListener('click', pedirNovaPartida);
$('#confirmar-nova-botao').addEventListener('click', novaPartida);
$('#cancelar-nova').addEventListener('click', () => $('#confirmar-nova').close());
$('#voltar-jogo').addEventListener('click', () => $('#fim').close());

// A página Missão pode ter mudado o placar
window.addEventListener('pageshow', () => { partida = MP.lerPartida(); mostrar(); });
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && partida?.cronometro?.fim) manterTelaLigada();
});
setInterval(atualizarRelogio, 250);
mostrar();
