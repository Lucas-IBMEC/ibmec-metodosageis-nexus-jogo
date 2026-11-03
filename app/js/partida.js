// Página Partida: monta a partida, mostra o placar e marca o tempo de cada turno.
// Histórias: 2.5.1 (vida e efeitos de cada lado) e o cronômetro de 40 segundos.

const DURACAO_DO_TURNO = 40; // segundos

// Vida inicial de cada nação (15; a China começa com 14)
function vidaInicial(codigoDaNacao) {
  return DADOS.porCodigo[codigoDaNacao]?.vida || 15;
}
const VIDA_DA_CURA = 4; // poder ① de todas as nações
const VOLTA_DO_RELOGIO = 2 * Math.PI * 28; // tamanho do círculo do cronômetro

const NACOES = DADOS.cartas.filter((c) => c.tipo === 'Nação');
const PERSONAS = DADOS.cartas.filter((c) => c.tipo === 'Persona');

const MODOS = {
  duelo: { min: 2, max: 2, padrao: 2, nome: 'Lado', texto: '1 contra 1, ou dupla contra dupla (cada dupla é um lado).' },
  mesa: { min: 3, max: 5, padrao: 3, nome: 'Lado', texto: 'Cada lado é 1 aluno ou 1 dupla. Todos contra todos: no ataque, o lado escolhe quem atacar.' },
  turma: { min: 2, max: 5, padrao: 5, nome: 'Grupo', texto: 'Cada grupo é uma nação. Os papéis (Capitão, Montador, Fiscal e Placar) trocam a cada turno.' },
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
    modo: config.modo,
    lados: linhas.map((linha, i) => ({
      nome: linha.querySelector('input').value.trim() || `${nome} ${i + 1}`,
      nacao: nacoes[i],
      vida: vidaInicial(nacoes[i]),
      pontos: 0,
      poderesNoTurno: {}, // poder → turno em que foi usado (cada poder 1 vez por turno)
      semAtacar: false,
      semAtacarNoTurno: 0,
    })),
    vez: null,
    turno: 0,
    persona: '', // só uma persona fica na mesa e vale para todos os lados
    cronometro: { fim: null, restante: DURACAO_DO_TURNO, esgotou: false },
  };
  MP.salvarPartida(partida);
  mostrar();
}

// ---------- Tela 2: placar ----------

function htmlDoLado(lado, i) {
  const nacao = DADOS.porCodigo[lado.nacao];
  const [buff, debuff] = nacao.efeito.replace('Buff: ', '').split(' · Debuff: ');
  const daVez = i === partida.vez;
  return `<article class="lado ${daVez ? 'da-vez' : ''}" data-lado="${i}">
    <div class="lado-topo">
      <div>
        <p class="lado-nome">${MP.esc(lado.nome)}</p>
        <span class="nacao-tag">${MP.esc(nacao.nome)}</span>
      </div>
      ${daVez ? '<span class="cod selo-vez">VEZ</span>' : ''}
    </div>
    <p class="buffs">▲ ${MP.esc(buff)} · ▼ ${MP.esc(debuff)}</p>
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
    <div class="poderes">
      ${nacao.poderes.map((p) => {
        const usado = lado.poderesNoTurno[p.n] === partida.turno;
        const semPontos = lado.pontos < p.custo;
        return `<button type="button" class="poder" data-acao="poder" data-poder="${p.n}" ${usado || semPontos ? 'disabled' : ''}>
          <span class="poder-nome">${p.n} ${MP.esc(p.nome)} <small>${MP.plural(p.custo, 'ponto', 'pontos')}</small></span>
          <span class="poder-texto">${usado ? 'Já usado neste turno' : MP.esc(p.texto)}</span>
        </button>`;
      }).join('')}
    </div>
    <div class="efeitos">
      <button type="button" class="chip" data-acao="sem-atacar" aria-pressed="${lado.semAtacar}">
        ${lado.semAtacar ? '⛔ Sem atacar no próximo turno' : 'Marcar: sem atacar no próximo turno'}
      </button>
    </div>
    ${lado.vida <= 0 ? `<div class="alerta-lado">Vida zerada
      <button type="button" class="botao secundario" data-acao="zerou">Devolver missões e voltar com ${vidaInicial(lado.nacao)}</button>
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
      <small>Turno ${partida.turno}</small>`;
    const avisos = [];
    if (partida.turno === 1) avisos.push('1º turno: quem começa não compra cartas.');
    if (lado.semAtacar && lado.semAtacarNoTurno < partida.turno) avisos.push(`${lado.nome} não pode atacar neste turno (denúncia).`);
    $('#aviso-turno').hidden = avisos.length === 0;
    $('#aviso-turno').textContent = avisos.join(' ');
  }
  $('#bloco-persona').hidden = escolhendo;
  if (!escolhendo) mostrarPersona();
  $('#lados').innerHTML = partida.lados.map(htmlDoLado).join('');
  atualizarRelogio();
}

// Persona na mesa: a precisão do mesmo assunto ganha +1 de ataque, em qualquer combo
function mostrarPersona() {
  const atual = partida.persona || '';
  const persona = DADOS.porCodigo[atual];
  $('#efeito-persona').textContent = persona
    ? `${persona.nome}: toda precisão de ${persona.assunto} ganha +1 de ataque, em qualquer combo.`
    : 'Nenhuma persona na mesa. Quando alguém jogar uma, toque nela aqui.';
  $('#personas').innerHTML = [{ codigo: '', nome: 'Nenhuma' }, ...PERSONAS].map((p) => (
    `<button type="button" class="chip" data-persona="${p.codigo}" aria-pressed="${p.codigo === atual}">
      ${p.codigo ? `<span class="cod t-persona">${p.codigo}</span>` : ''}${MP.esc(p.nome)}${p.assunto ? ` · ${p.assunto}` : ''}
    </button>`)).join('');
}

function trocarPersona(codigo) {
  partida.persona = codigo;
  MP.salvarPartida(partida);
  mostrarPersona();
  MP.aviso(codigo ? `${DADOS.porCodigo[codigo].nome} na mesa` : 'Persona tirada da mesa');
}

// Usar um poder: o lado entrega cartas de missão que somam o custo (sem troco)
function usarPoder(lado, codigoDoPoder) {
  const poder = DADOS.porCodigo[lado.nacao].poderes.find((p) => p.n === codigoDoPoder);
  if (lado.pontos < poder.custo || lado.poderesNoTurno[poder.n] === partida.turno) return;
  lado.pontos -= poder.custo;
  lado.poderesNoTurno[poder.n] = partida.turno;
  if (poder.nome === 'Cura') lado.vida += VIDA_DA_CURA;
  MP.aviso(`${lado.nome}: ${poder.nome}. As missões gastas voltam para o fundo do monte.`);
}

function mudarLado(i, acao, delta, codigoDoPoder) {
  const lado = partida.lados[i];
  if (acao === 'vida') lado.vida = Math.max(0, lado.vida + delta);
  if (acao === 'pontos') lado.pontos = Math.max(0, lado.pontos + delta);
  if (acao === 'poder') usarPoder(lado, codigoDoPoder);
  if (acao === 'sem-atacar') {
    lado.semAtacar = !lado.semAtacar;
    lado.semAtacarNoTurno = partida.turno;
  }
  if (acao === 'zerou') {
    // Regra: vida zerada devolve as missões para o fundo do monte e volta com a vida cheia
    lado.pontos = 0;
    lado.vida = vidaInicial(lado.nacao);
    MP.aviso(`${lado.nome}: missões devolvidas ao monte, vida ${lado.vida}`);
  }
  MP.salvarPartida(partida);
  mostrarPlacar();
}

function escolherQuemComeca(i) {
  partida.vez = i;
  partida.turno = 1;
  partida.cronometro = { fim: null, restante: DURACAO_DO_TURNO, esgotou: false };
  MP.salvarPartida(partida);
  mostrarPlacar();
}

function proximoTurno() {
  const saindo = partida.lados[partida.vez];
  // O "sem atacar" vale por um turno inteiro daquele lado
  if (saindo.semAtacar && saindo.semAtacarNoTurno < partida.turno) saindo.semAtacar = false;
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
    $('#aviso-turno').textContent = 'Tempo esgotado! O turno passa sem ataque. Os combos montados ficam na mesa.';
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
  $('#fim').showModal();
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
$('#personas').addEventListener('click', (evento) => {
  const botao = evento.target.closest('[data-persona]');
  if (botao) trocarPersona(botao.dataset.persona);
});
$('#cronometro').addEventListener('click', botaoDoCronometro);
$('#proximo').addEventListener('click', () => { prepararSom(); proximoTurno(); });
$('#encerrar').addEventListener('click', encerrar);
$('#nova').addEventListener('click', pedirNovaPartida);
$('#nova-do-fim').addEventListener('click', pedirNovaPartida);
$('#confirmar-nova-botao').addEventListener('click', novaPartida);
$('#cancelar-nova').addEventListener('click', () => $('#confirmar-nova').close());
$('#voltar-jogo').addEventListener('click', () => $('#fim').close());

// Outra página (Missão ou Denúncia) pode ter mudado o placar
window.addEventListener('pageshow', () => { partida = MP.lerPartida(); mostrar(); });
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && partida?.cronometro?.fim) manterTelaLigada();
});
setInterval(atualizarRelogio, 250);
mostrar();
