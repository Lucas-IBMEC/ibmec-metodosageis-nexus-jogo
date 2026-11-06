// Página Partida: monta a partida, sorteia quem começa, mostra o placar, aplica os poderes
// e marca o tempo de cada turno. Histórias: 2.5.1 (vida, pontos e poderes de cada lado) e o cronômetro.

const DURACAO_DO_TURNO = DADOS.duracaoDoTurno || 60; // segundos
const VOLTA_DO_RELOGIO = 2 * Math.PI * 28; // tamanho do círculo do cronômetro

// Vida inicial de cada nação (a carta da nação diz quanto)
function vidaInicial(codigoDaNacao) {
  return DADOS.porCodigo[codigoDaNacao]?.vida || 10;
}

const NACOES = DADOS.cartas.filter((c) => c.tipo === 'Nação');
// Poderes que pedem para escolher um lado
const COM_ALVO = ['dano', 'roubo', 'bloqueio'];

const MODOS = {
  duelo: { min: 2, max: 2, padrao: 2, nome: 'Lado', texto: '1 contra 1, ou dupla contra dupla (cada dupla é um lado).' },
  mesa: { min: 3, max: 5, padrao: 3, nome: 'Lado', texto: 'Cada lado é 1 aluno ou 1 dupla. Todos contra todos: quem usa um poder escolhe o lado.' },
  turma: { min: 2, max: 5, padrao: 5, nome: 'Grupo', texto: 'Cada grupo é uma nação. Os papéis (Capitão, Montador e Placar) trocam a cada turno.' },
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
  const porLado = MP.turnosDaPartida(config.quantos) / config.quantos;
  $('#explica-turnos').textContent = `Cada ${modo.nome.toLowerCase()} joga ${MP.plural(porLado, 'turno', 'turnos')} (${MP.plural(porLado * config.quantos, 'missão', 'missões')} no total).`;

  // Uma linha por lado: nome e nação (cada nação só pode ser usada uma vez)
  const anteriores = [...document.querySelectorAll('.lado-config')].map((linha) => ({
    nome: linha.querySelector('input').value,
    nacao: linha.querySelector('select').value,
  }));
  $('#config-lados').innerHTML = Array.from({ length: config.quantos }, (_, i) => {
    const nacaoEscolhida = anteriores[i]?.nacao || NACOES[i].codigo;
    return `<div class="lado-config">
      <input class="campo" value="${MP.esc(anteriores[i]?.nome || '')}" placeholder="${modo.nome} ${i + 1}"
        aria-label="Nome do ${modo.nome.toLowerCase()} ${i + 1}" autocomplete="off">
      <select class="campo" aria-label="Nação do ${modo.nome.toLowerCase()} ${i + 1}">
        ${NACOES.map((n) => `<option value="${n.codigo}" ${n.codigo === nacaoEscolhida ? 'selected' : ''}>${n.nome}</option>`).join('')}
      </select>
    </div>`;
  }).join('');
}

function comecarPartida() {
  const linhas = [...document.querySelectorAll('.lado-config')];
  const nacoes = linhas.map((linha) => linha.querySelector('select').value);
  if (new Set(nacoes).size !== nacoes.length) {
    MP.aviso('Cada lado precisa de uma nação diferente');
    return;
  }
  const nome = MODOS[config.modo].nome;
  partida = {
    inicio: Date.now(),
    modo: config.modo,
    lados: linhas.map((linha, i) => ({
      nome: linha.querySelector('input').value.trim() || `${nome} ${i + 1}`,
      nacao: nacoes[i],
      vida: vidaInicial(nacoes[i]),
      pontos: 0,
      poderesNoTurno: {}, // poder → turno em que foi usado (cada poder 1 vez por turno)
      semPoderesAte: 0, // Fiscalização: sem poderes enquanto o turno for menor que este
    })),
    vez: null,
    turno: 0,
    totalDeTurnos: MP.turnosDaPartida(linhas.length),
    ultimoPoder: null, // o último poder usado contra alguém (para o Espelho da Índia)
    cronometro: { fim: null, restante: DURACAO_DO_TURNO, esgotou: false },
  };
  MP.salvarPartida(partida);
  mostrar();
}

// ---------- Tela 2: placar ----------

// Número do próximo turno em que o lado "i" joga
function proximoTurnoDe(i) {
  const n = partida.lados.length;
  const distancia = (i - partida.vez + n) % n;
  return partida.turno + (distancia === 0 ? n : distancia);
}

function semPoderes(lado) {
  return partida.turno < (lado.semPoderesAte || 0);
}

// O Espelho só vale logo depois de um poder usado contra a Índia, no mesmo turno
function espelhavel(i) {
  const u = partida.ultimoPoder;
  return u && u.alvo === i && u.turno === partida.turno && !u.espelhado ? u : null;
}

function estadoDoPoder(lado, i, poder) {
  if (lado.poderesNoTurno[poder.n] === partida.turno) return { pode: false, texto: 'Já usado neste turno' };
  if (poder.efeito === 'espelho') {
    const u = espelhavel(i);
    if (!u) return { pode: false, texto: 'Use logo depois que alguém usar um poder contra você.' };
    // Pode devolver até a Fiscalização que acabou de travar os poderes
    const travado = semPoderes(lado) && u.efeito !== 'bloqueio';
    return { pode: !travado && lado.pontos >= poder.custo, texto: `Devolver ${u.nome} para ${partida.lados[u.de].nome}` };
  }
  if (i !== partida.vez) return { pode: false, texto: poder.texto };
  if (semPoderes(lado)) return { pode: false, texto: 'Sem poderes neste turno (Fiscalização)' };
  return { pode: lado.pontos >= poder.custo, texto: poder.texto };
}

function htmlDoLado(lado, i) {
  const nacao = DADOS.porCodigo[lado.nacao];
  const daVez = i === partida.vez;
  return `<article class="lado ${daVez ? 'da-vez' : ''}" data-lado="${i}">
    <div class="lado-topo">
      <div>
        <p class="lado-nome">${MP.esc(lado.nome)}</p>
        <span class="nacao-tag">${MP.esc(nacao.nome)}${nacao.lema ? ` · ${MP.esc(nacao.lema)}` : ''}</span>
      </div>
      ${daVez ? '<span class="cod selo-vez">VEZ</span>' : ''}
    </div>
    <div class="contadores">
      <div class="contador vida">
        <button type="button" class="mais-menos" data-acao="vida" data-delta="-1" aria-label="Tirar 1 de vida de ${MP.esc(lado.nome)}">−</button>
        <div class="valor"><b>${lado.vida}</b><span>Vida</span></div>
        <button type="button" class="mais-menos" data-acao="vida" data-delta="1" aria-label="Dar 1 de vida a ${MP.esc(lado.nome)}">+</button>
      </div>
      <div class="contador">
        <button type="button" class="mais-menos" data-acao="pontos" data-delta="-1" aria-label="Tirar 1 ponto de ${MP.esc(lado.nome)}">−</button>
        <div class="valor"><b>${lado.pontos}</b><span>Pontos</span></div>
        <button type="button" class="mais-menos" data-acao="pontos" data-delta="1" aria-label="Dar 1 ponto a ${MP.esc(lado.nome)}">+</button>
      </div>
    </div>
    ${semPoderes(lado) ? `<p class="bloqueio">⛔ Fiscalizado: sem poderes até o fim do turno ${lado.semPoderesAte - 1}</p>` : ''}
    <div class="poderes">
      ${nacao.poderes.map((p) => {
        const estado = estadoDoPoder(lado, i, p);
        return `<button type="button" class="poder ${p.n === '③' ? 'especial' : ''}" data-acao="poder" data-poder="${p.n}" ${estado.pode ? '' : 'disabled'}>
          <span class="poder-nome">${p.n} ${MP.esc(p.nome)} <small>${MP.plural(p.custo, 'ponto', 'pontos')}</small></span>
          <span class="poder-texto">${MP.esc(estado.texto)}</span>
        </button>`;
      }).join('')}
    </div>
    ${lado.vida <= 0 ? `<div class="alerta-lado">Vida zerada
      <button type="button" class="botao secundario" data-acao="zerou">Perder os pontos e voltar com ${vidaInicial(lado.nacao)}</button>
    </div>` : ''}
  </article>`;
}

function mostrarPlacar() {
  const escolhendo = partida.vez === null;
  $('#quem-comeca').hidden = !escolhendo;
  $('#vez').hidden = escolhendo;
  $('#barra-turno').hidden = escolhendo;
  document.body.classList.toggle('com-barra', !escolhendo);

  if (escolhendo) {
    $('#opcoes-comeca').innerHTML = partida.lados.map((lado, i) => (
      `<button type="button" class="chip" data-comeca="${i}">${MP.esc(lado.nome)}</button>`)).join('');
  } else {
    const lado = partida.lados[partida.vez];
    $('#vez').innerHTML = `<div><small>Vez de</small><br><strong>${MP.esc(lado.nome)}</strong></div>
      <small>Turno ${partida.turno} de ${partida.totalDeTurnos}</small>`;
    const avisos = [];
    if (partida.turno === 1) avisos.push('Tire 1 missão, escolha 1 contexto, 1 persona e 1 formato e dê a nota na página Missão.');
    if (semPoderes(lado)) avisos.push(`${lado.nome} está sem poderes neste turno (Fiscalização).`);
    if (partida.turno === partida.totalDeTurnos) avisos.push('Último turno da partida.');
    $('#aviso-turno').hidden = avisos.length === 0;
    $('#aviso-turno').textContent = avisos.join(' ');
    $('#proximo').textContent = partida.turno >= partida.totalDeTurnos ? 'Ver resultado' : 'Próximo turno';
  }
  $('#lados').innerHTML = partida.lados.map(htmlDoLado).join('');
  atualizarRelogio();
}

// ---------- Poderes ----------

function pagar(lado, poder) {
  lado.pontos -= poder.custo;
  lado.poderesNoTurno[poder.n] = partida.turno;
}

function usarPoder(i, codigoDoPoder) {
  const lado = partida.lados[i];
  const poder = DADOS.porCodigo[lado.nacao].poderes.find((p) => p.n === codigoDoPoder);
  if (!estadoDoPoder(lado, i, poder).pode) return;
  if (COM_ALVO.includes(poder.efeito)) {
    escolherAlvo(i, poder);
    return;
  }
  pagar(lado, poder);
  if (poder.efeito === 'cura') {
    lado.vida += poder.valor;
    MP.aviso(`${lado.nome}: ${poder.nome}, +${poder.valor} de vida`);
  }
  if (poder.efeito === 'espelho') espelhar(i);
  if (poder.efeito === 'manual') MP.aviso(`${lado.nome}: ${poder.nome}. Monte outro prompt e dê a nota na página Missão.`);
}

// Janela para escolher em qual lado o poder vai
let pedidoDeAlvo = null;
function escolherAlvo(i, poder) {
  pedidoDeAlvo = { de: i, poder };
  $('#alvo-titulo').textContent = `${poder.n} ${poder.nome}: em quem?`;
  $('#alvo-texto').textContent = `${partida.lados[i].nome} vai pagar ${MP.plural(poder.custo, 'ponto', 'pontos')}. Efeito: ${poder.texto}.`;
  $('#alvo-lados').innerHTML = partida.lados.map((lado, j) => (j === i ? '' : `<button type="button" class="chip" data-alvo="${j}">
    ${MP.esc(lado.nome)} · ${lado.vida} de vida · ${MP.plural(lado.pontos, 'ponto', 'pontos')}</button>`)).join('');
  $('#alvo').showModal();
}

function aplicarNoAlvo(alvo) {
  const { de, poder } = pedidoDeAlvo;
  pedidoDeAlvo = null;
  $('#alvo').close();
  const quem = partida.lados[de];
  const outro = partida.lados[alvo];
  pagar(quem, poder);
  const registro = { de, alvo, nome: poder.nome, efeito: poder.efeito, valor: poder.valor, turno: partida.turno, espelhado: false };
  if (poder.efeito === 'dano') {
    registro.tirou = Math.min(outro.vida, poder.valor);
    outro.vida -= registro.tirou;
    MP.aviso(`${quem.nome}: ${poder.nome}! ${outro.nome} perde ${poder.valor} de vida`);
  }
  if (poder.efeito === 'roubo') {
    registro.tirou = Math.min(outro.pontos, poder.valor);
    outro.pontos -= registro.tirou;
    quem.pontos += registro.tirou;
    MP.aviso(`${quem.nome}: ${poder.nome}! Pegou ${MP.plural(registro.tirou, 'ponto', 'pontos')} de ${outro.nome}`);
  }
  if (poder.efeito === 'bloqueio') {
    // Sem poderes desde agora até o fim do próximo turno do alvo
    registro.antes = outro.semPoderesAte || 0;
    outro.semPoderesAte = proximoTurnoDe(alvo) + 1;
    MP.aviso(`${quem.nome}: ${poder.nome}! ${outro.nome} fica sem poderes até o fim do turno ${outro.semPoderesAte - 1}`);
  }
  partida.ultimoPoder = registro;
  MP.salvarPartida(partida);
  mostrarPlacar();
}

// Espelho da Índia: desfaz o último poder usado contra ela e aplica o mesmo efeito em quem usou
function espelhar(i) {
  const u = espelhavel(i);
  if (!u) return;
  const india = partida.lados[i];
  const quem = partida.lados[u.de];
  if (u.efeito === 'dano') {
    india.vida += u.tirou;
    quem.vida -= Math.min(quem.vida, u.valor);
  }
  if (u.efeito === 'roubo') {
    // Devolve só o que quem usou ainda tem (pode ter gastado antes do Espelho)
    const devolve = Math.min(quem.pontos, u.tirou);
    india.pontos += devolve;
    quem.pontos -= devolve;
    const pega = Math.min(quem.pontos, u.valor);
    quem.pontos -= pega;
    india.pontos += pega;
  }
  if (u.efeito === 'bloqueio') {
    // Quem fiscalizou fica sem poderes até o fim do próximo turno dele
    india.semPoderesAte = u.antes;
    quem.semPoderesAte = proximoTurnoDe(u.de) + 1;
  }
  u.espelhado = true;
  MP.aviso(`${india.nome}: Espelho! ${u.nome} voltou para ${quem.nome}`);
}

function mudarLado(i, acao, delta, codigoDoPoder) {
  const lado = partida.lados[i];
  if (acao === 'vida') lado.vida = Math.max(0, lado.vida + delta);
  if (acao === 'pontos') lado.pontos = Math.max(0, lado.pontos + delta);
  if (acao === 'poder') usarPoder(i, codigoDoPoder);
  if (acao === 'zerou') {
    // Regra: vida zerada perde todos os pontos e volta com a vida inicial
    lado.pontos = 0;
    lado.vida = vidaInicial(lado.nacao);
    MP.aviso(`${lado.nome}: perdeu os pontos e voltou com ${lado.vida} de vida`);
  }
  MP.salvarPartida(partida);
  mostrarPlacar();
}

// ---------- Turnos ----------

function escolherQuemComeca(i) {
  partida.vez = i;
  partida.turno = 1;
  partida.cronometro = { fim: null, restante: DURACAO_DO_TURNO, esgotou: false };
  MP.salvarPartida(partida);
  mostrarPlacar();
}

function sortearQuemComeca() {
  const i = Math.floor(Math.random() * partida.lados.length);
  escolherQuemComeca(i);
  MP.aviso(`Sorteado: ${partida.lados[i].nome} começa`);
}

function proximoTurno() {
  if (partida.turno >= partida.totalDeTurnos) {
    encerrar();
    return;
  }
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
  partida.cronometro = { fim: Date.now() + DURACAO_DO_TURNO * 1000, restante: DURACAO_DO_TURNO, esgotou: false };
  MP.salvarPartida(partida);
  manterTelaLigada();
}

function botaoDoCronometro() {
  const c = partida.cronometro;
  if (c.fim) {
    partida.cronometro = { fim: null, restante: restante(), esgotou: false };
    MP.salvarPartida(partida);
  } else if (c.esgotou || c.restante >= DURACAO_DO_TURNO) {
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
  const fracao = partida.cronometro.esgotou ? 1 : restante() / DURACAO_DO_TURNO;
  $('#arco').style.strokeDashoffset = VOLTA_DO_RELOGIO * (1 - fracao);
  const relogio = $('#relogio');
  relogio.classList.toggle('pouco', segundos <= 10 && segundos > 0);
  relogio.classList.toggle('fim', partida.cronometro.esgotou);
  const botao = $('#cronometro');
  if (partida.cronometro.fim) botao.textContent = 'Pausar';
  else if (partida.cronometro.esgotou) botao.textContent = 'Reiniciar';
  else botao.textContent = segundos >= DURACAO_DO_TURNO ? 'Iniciar' : 'Continuar';
  if (partida.cronometro.esgotou) {
    $('#aviso-turno').hidden = false;
    $('#aviso-turno').textContent = 'Tempo esgotado! Dê a nota com as cartas que o lado já escolheu: a que faltar não ganha estrela.';
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
  const ordem = [...partida.lados].sort((a, b) => b.pontos - a.pontos || b.vida - a.vida);
  $('#ranking').innerHTML = ordem.map((lado, i) => `<li>
    <span>${i === 0 ? '🏆 ' : ''}${MP.esc(lado.nome)}</span>
    <span>${MP.plural(lado.pontos, 'ponto', 'pontos')} · ${lado.vida} de vida</span></li>`).join('');
  const acabou = partida.turno >= partida.totalDeTurnos;
  $('#fim-titulo').textContent = acabou ? 'Fim da partida' : 'Placar até agora';
  // No meio da partida, "Voltar ao jogo" já continua; mais uma rodada só no fim
  $('#mais-rodada').hidden = !acabou;
  $('#fim').showModal();
}

// Mais uma volta: cada lado joga mais 1 turno (as missões feitas voltam embaralhadas para o monte)
function maisUmaRodada() {
  partida.totalDeTurnos += partida.lados.length;
  $('#fim').close();
  proximoTurno();
  MP.aviso('Mais uma rodada: embaralhem as missões feitas de volta no monte');
}

// Pede confirmação numa janela do próprio app (o confirm() do navegador some em alguns celulares)
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
  const botao = evento.target.closest('[data-acao]');
  if (!botao) return;
  const i = Number(botao.closest('[data-lado]').dataset.lado);
  mudarLado(i, botao.dataset.acao, Number(botao.dataset.delta || 0), botao.dataset.poder);
});
$('#alvo-lados').addEventListener('click', (evento) => {
  const botao = evento.target.closest('[data-alvo]');
  if (botao && pedidoDeAlvo) aplicarNoAlvo(Number(botao.dataset.alvo));
});
$('#alvo-cancelar').addEventListener('click', () => { pedidoDeAlvo = null; $('#alvo').close(); });
$('#cronometro').addEventListener('click', botaoDoCronometro);
$('#proximo').addEventListener('click', () => { prepararSom(); proximoTurno(); });
$('#encerrar').addEventListener('click', encerrar);
$('#nova').addEventListener('click', pedirNovaPartida);
$('#nova-do-fim').addEventListener('click', pedirNovaPartida);
$('#mais-rodada').addEventListener('click', maisUmaRodada);
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
