// Página Missão: o professor escolhe a missão que o lado tirou, digita as 3 cartas do prompt
// (contexto, persona e formato) e o app dá de 1 a 3 estrelas. Cada estrela vale 1 ponto.
// Histórias: 2.1.1, 2.1.2, 2.2.1 e 2.2.2.

const $ = (seletor) => document.querySelector(seletor);

const TIPOS = ['Contexto', 'Persona', 'Formato'];
const LETRA = { Contexto: 'C', Persona: 'P', Formato: 'F' };

// O turno da partida aberta: quando ele muda, a página começa limpa para a próxima missão
function turnoAtual() {
  const partida = MP.lerPartida();
  return partida && partida.vez !== null ? `${partida.inicio || ''}-${partida.turno}` : 'sem-partida';
}

// Estado guardado no celular: { turno, missao, cartas: { Contexto: 'C01', Persona: 'P02', Formato: 'F03' } }
function lerEstado() {
  const guardado = MP.ler('mp-nota', null);
  if (!guardado || guardado.turno !== turnoAtual()) return { missao: '', cartas: {} };
  const cartas = {};
  TIPOS.forEach((tipo) => {
    const carta = DADOS.porCodigo[guardado.cartas?.[tipo]];
    if (carta && carta.tipo === tipo) cartas[tipo] = carta.codigo;
  });
  const missao = DADOS.porCodigo[guardado.missao]?.tipo === 'Missão' ? guardado.missao : '';
  return { missao, cartas };
}

let { missao: missaoGuardada, cartas } = lerEstado();

function salvarEstado() {
  MP.salvar('mp-nota', { turno: turnoAtual(), missao: $('#missao').value, cartas });
}

// ---------- Montagem da tela ----------

$('#missao').innerHTML = '<option value="">Escolha a missão que o lado tirou</option>'
  + DADOS.missoes.map((m) => `<option value="${m.codigo}">${m.codigo} · ${MP.esc(m.nome)}</option>`).join('');
$('#missao').value = missaoGuardada;

const entrada = MP.entradaDeCodigo($('#entrada'), {
  prefixos: ['C', 'P', 'F'],
  rotulos: { C: 'Contexto', P: 'Persona', F: 'Formato' },
  inicial: LETRA[TIPOS.find((tipo) => !cartas[tipo]) || 'Contexto'],
  aoAdicionar(carta) {
    if (carta.tipo === 'Missão') {
      $('#missao').value = carta.codigo;
      atualizar();
      MP.aviso(`Missão ${carta.codigo}`);
      return;
    }
    if (!TIPOS.includes(carta.tipo)) {
      MP.aviso(`${carta.codigo} é ${carta.tipo.toLowerCase()}: não entra no prompt`);
      return;
    }
    const antes = cartas[carta.tipo];
    cartas[carta.tipo] = carta.codigo;
    if (antes && antes !== carta.codigo) MP.aviso(`${carta.codigo} entrou no lugar de ${antes}`);
    // Passa para a próxima letra que ainda falta
    const falta = TIPOS.find((tipo) => !cartas[tipo]);
    if (falta) entrada.escolherPrefixo(LETRA[falta]);
    atualizar();
  },
});

// ---------- Nota ----------

function minuscula(texto) {
  return texto.charAt(0).toLowerCase() + texto.slice(1);
}

function nomeCurto(codigo) {
  return DADOS.porCodigo[codigo].nome.replace(/ \(.*\)$/, '');
}

function ouLista(itens) {
  return itens.length > 1 ? `${itens.slice(0, -1).join(', ')} ou ${itens[itens.length - 1]}` : itens[0];
}

// Cada carta certa vale 1 estrela: contexto e persona do assunto da missão, formato da lista da missão.
// 3 certas = 3 estrelas, 2 certas = 2, 0 ou 1 certa = 1.
function conferir(missao) {
  const doAssunto = (tipo) => {
    const carta = DADOS.porCodigo[cartas[tipo]];
    const ok = Boolean(carta && carta.assunto === missao.assunto);
    let detalhe = `Faltou ${tipo === 'Persona' ? 'a persona' : 'o contexto'}.`;
    if (carta) detalhe = ok ? `${carta.codigo} ${carta.nome}` : `${carta.codigo} ${carta.nome} é de ${carta.assunto}.`;
    return { tipo, ok, titulo: `${tipo} de ${missao.assunto}`, detalhe };
  };

  const formato = DADOS.porCodigo[cartas.Formato];
  const okFormato = Boolean(formato && missao.formatos.includes(formato.codigo));
  const servem = ouLista(missao.formatos.map(nomeCurto));
  const outros = missao.formatos.filter((c) => c !== formato?.codigo).map(nomeCurto);
  let detalheFormato = `Faltou o formato. Serviam: ${servem}.`;
  if (formato && okFormato) detalheFormato = `${nomeCurto(formato.codigo)} serve.${outros.length ? ` Também serviam: ${ouLista(outros)}.` : ''}`;
  if (formato && !okFormato) detalheFormato = `${nomeCurto(formato.codigo)} não ajuda tanto aqui. Serviam: ${servem}.`;

  const itens = [
    doAssunto('Contexto'),
    doAssunto('Persona'),
    { tipo: 'Formato', ok: okFormato, titulo: 'Formato que ajuda quem vai ler', detalhe: detalheFormato },
  ];
  const certas = itens.filter((i) => i.ok).length;
  return { itens, certas, nota: Math.max(1, certas), faltam: TIPOS.filter((tipo) => !cartas[tipo]) };
}

// ---------- O prompt e a resposta simulada ----------

function montarPrompt(missao) {
  const partes = [];
  const persona = DADOS.porCodigo[cartas.Persona];
  const contexto = DADOS.porCodigo[cartas.Contexto];
  const formato = DADOS.porCodigo[cartas.Formato];
  if (persona) partes.push(persona.texto);
  if (contexto) partes.push(contexto.texto);
  partes.push(`Tarefa: ${minuscula(missao.nome)}`);
  if (formato) partes.push(`Responda em formato de ${minuscula(formato.nome)}.`);
  return partes.join('\n');
}

function htmlDaResposta(missao, resultado) {
  if (resultado.nota === 3) {
    const boas = RESPOSTAS.boas[missao.codigo] || {};
    const texto = boas[cartas.Formato] || Object.values(boas)[0] || '';
    return `<span class="etiqueta">Resposta boa ✓</span><p class="texto-ia">${MP.esc(texto)}</p>`;
  }
  return resultado.itens.filter((i) => !i.ok).map((i) => {
    const codigo = cartas[i.tipo];
    const falha = RESPOSTAS.falhas[codigo ? i.tipo.toLowerCase() : 'falta'];
    let texto = falha.texto;
    if (i.tipo === 'Formato' && codigo) {
      const pedidos = ouLista(missao.formatos.map((c) => minuscula(nomeCurto(c))));
      texto = `A missão pedia ${pedidos}, mas a resposta veio em ${minuscula(nomeCurto(codigo))}. ${falha.texto}`;
    }
    return `<span class="etiqueta">${falha.titulo} (${codigo || i.tipo.toLowerCase()})</span>
      <p class="texto-ia">${MP.esc(texto)}</p>`;
  }).join('<div style="height: 10px"></div>');
}

// ---------- Dar os pontos ----------

// A mesma nota não pode ser dada duas vezes. Muda a missão, uma carta ou o turno? Pode dar de novo
// (a Linha de produção da China monta outro prompt no mesmo turno).
function chaveDaNota(partida) {
  return [partida.inicio || '', partida.turno, $('#missao').value, ...TIPOS.map((tipo) => cartas[tipo] || '-')].join('|');
}

function mostrarDar(resultado) {
  const partida = MP.lerPartida();
  const pontos = MP.plural(resultado.nota, 'ponto', 'pontos');
  $('#ir-partida').hidden = true;
  if (!partida || partida.vez === null) {
    $('#titulo-dar').textContent = `${MP.estrelas(resultado.nota)} vale ${pontos}`;
    $('#sub-dar').innerHTML = 'Para somar no placar, comece uma partida na página <a href="index.html">Partida</a>.';
    $('#lados-dar').innerHTML = '';
    return;
  }
  const dada = MP.ler('mp-nota-dada', null);
  if (dada && dada.chave === chaveDaNota(partida)) {
    $('#titulo-dar').textContent = `✓ ${MP.plural(dada.pontos, 'ponto', 'pontos')} para ${dada.nome}`;
    $('#sub-dar').textContent = 'Agora o lado pode usar os poderes na Partida. Errou o lado? Desfaça e dê de novo.';
    $('#lados-dar').innerHTML = '<button type="button" class="chip" data-desfazer>Desfazer</button>';
    $('#ir-partida').hidden = false;
    return;
  }
  $('#titulo-dar').textContent = `Dar ${pontos} para`;
  $('#sub-dar').textContent = resultado.faltam.length
    ? 'Se o tempo acabou, a carta que falta não ganha estrela.'
    : 'O lado da vez aparece primeiro.';
  const ordem = partida.lados.map((lado, i) => i).sort((a, b) => (b === partida.vez) - (a === partida.vez));
  $('#lados-dar').innerHTML = ordem.map((i) => {
    const lado = partida.lados[i];
    return `<button type="button" class="chip" data-lado="${i}" ${i === partida.vez ? 'aria-pressed="true"' : ''}>
      ${MP.esc(lado.nome)}${i === partida.vez ? ' (vez)' : ''} · ${MP.plural(lado.pontos, 'ponto', 'pontos')}</button>`;
  }).join('');
}

function darPontos(i) {
  const partida = MP.lerPartida();
  const missao = DADOS.porCodigo[$('#missao').value];
  if (!partida || !missao) return;
  const { nota } = conferir(missao);
  const lado = partida.lados[i];
  lado.pontos += nota;
  MP.salvarPartida(partida);
  MP.salvar('mp-nota-dada', { chave: chaveDaNota(partida), lado: i, nome: lado.nome, pontos: nota });
  MP.aviso(`+${MP.plural(nota, 'ponto', 'pontos')} para ${lado.nome}`);
  atualizar();
}

function desfazer() {
  const partida = MP.lerPartida();
  const dada = MP.ler('mp-nota-dada', null);
  if (!partida || !dada || dada.chave !== chaveDaNota(partida)) return;
  const lado = partida.lados[dada.lado];
  lado.pontos = Math.max(0, lado.pontos - dada.pontos);
  MP.salvarPartida(partida);
  MP.apagar('mp-nota-dada');
  MP.aviso(`Desfeito: ${lado.nome} voltou para ${MP.plural(lado.pontos, 'ponto', 'pontos')}`);
  atualizar();
}

// ---------- Atualiza a tela ----------

function atualizar() {
  salvarEstado();
  const missao = DADOS.porCodigo[$('#missao').value];
  $('#pedido').hidden = !missao;
  if (missao) {
    $('#pedido').innerHTML = `<span class="assunto-tag">${MP.esc(MP.comSimbolo(missao.assunto))}</span>“${MP.esc(missao.nome)}”`;
  }

  $('#trio').innerHTML = TIPOS.map((tipo) => {
    const carta = DADOS.porCodigo[cartas[tipo]];
    return `<li class="${MP.classeDoTipo(tipo)}"><span class="tipo-vaga">${tipo}</span>${carta
      ? MP.chipDeCarta(carta, { removivel: true })
      : `<span class="falta-vaga">Falta · toque em ${LETRA[tipo]}</span>`}</li>`;
  }).join('');

  const temCarta = TIPOS.some((tipo) => cartas[tipo]);
  ['#resultado', '#dar', '#prompt', '#resposta'].forEach((s) => { $(s).hidden = !temCarta || !missao; });
  if (temCarta && !missao) {
    $('#resultado').hidden = false;
    $('#resultado').className = 'bloco resultado';
    $('#resultado').innerHTML = '<p class="veredito">Escolha a missão</p><p class="sub" style="margin: 0">A nota depende da missão que o lado tirou (passo 1).</p>';
  }
  if (!temCarta || !missao) return;

  const resultado = conferir(missao);
  const classe = { 3: 'ok', 2: 'meio', 1: 'falha' }[resultado.nota];
  $('#resultado').className = `bloco resultado ${classe}`;
  $('#resultado').innerHTML = `
    <p class="nota-estrelas" aria-label="${resultado.nota} de 3 estrelas">${MP.estrelas(resultado.nota)}</p>
    <p class="veredito">${MP.plural(resultado.nota, 'estrela', 'estrelas')} = ${MP.plural(resultado.nota, 'ponto', 'pontos')}</p>
    <p class="sub" style="margin: 0">${resultado.faltam.length
      ? `Falta${resultado.faltam.length > 1 ? 'm' : ''}: ${resultado.faltam.map((t) => t.toLowerCase()).join(', ')}.`
      : `${resultado.certas} de 3 cartas certas.`}</p>
    <ul class="checklist">${resultado.itens.map((i) => `
      <li class="${i.ok ? 'sim' : 'nao'}"><span class="ic">${i.ok ? '✓' : '✗'}</span>
        <span>${MP.esc(i.titulo)}<small>${MP.esc(i.detalhe)}</small></span></li>`).join('')}
    </ul>`;

  mostrarDar(resultado);
  $('#texto-prompt').textContent = montarPrompt(missao);
  $('#texto-resposta').innerHTML = htmlDaResposta(missao, resultado);
}

// ---------- Ligações ----------

$('#missao').addEventListener('change', atualizar);
$('#trio').addEventListener('click', (evento) => {
  const botao = evento.target.closest('[data-remover]');
  if (!botao) return;
  const tipo = DADOS.porCodigo[botao.dataset.remover].tipo;
  delete cartas[tipo];
  entrada.escolherPrefixo(LETRA[tipo]);
  atualizar();
});
$('#limpar').addEventListener('click', () => {
  cartas = {};
  entrada.escolherPrefixo('C');
  atualizar();
});
$('#lados-dar').addEventListener('click', (evento) => {
  if (evento.target.closest('[data-desfazer]')) {
    desfazer();
    return;
  }
  const botao = evento.target.closest('[data-lado]');
  if (botao) darPontos(Number(botao.dataset.lado));
});
// Ao voltar da Partida, o turno pode ter mudado: começa limpo para a próxima missão
window.addEventListener('pageshow', (evento) => {
  if (!evento.persisted) return;
  ({ missao: missaoGuardada, cartas } = lerEstado());
  $('#missao').value = missaoGuardada;
  entrada.escolherPrefixo(LETRA[TIPOS.find((tipo) => !cartas[tipo]) || 'Contexto']);
  atualizar();
});

atualizar();
