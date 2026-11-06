// Página Missão: um lado bateu. O professor escolhe a missão, digita as 3 cartas do prompt
// (contexto, persona e formato) e o aplicativo confere. O prompt só fecha quando o contexto e a persona
// são do assunto da missão; aí o formato que ajuda quem vai ler dá 3 estrelas, e outro formato dá 2.
// Histórias: 2.1.1, 2.1.2, 2.2.1 e 2.2.2.

const $ = (seletor) => document.querySelector(seletor);

const TIPOS = ['Contexto', 'Persona', 'Formato'];
const LETRA = { Contexto: 'C', Persona: 'P', Formato: 'F' };
const META = DADOS.metaDeEstrelas || 6;

// A vez da partida aberta: quando ela muda, a página começa limpa para o próximo prompt
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

// ---------- Missões da mesa ----------

function missaoFeita(codigo) {
  const partida = MP.lerPartida();
  return Boolean(partida && partida.feitas.includes(codigo));
}

// Só aparecem as missões que ainda estão na mesa (e a que já está escolhida)
function montarMissoes(escolhida) {
  const lista = DADOS.missoes.filter((m) => !missaoFeita(m.codigo) || m.codigo === escolhida);
  $('#missao').innerHTML = '<option value="">Escolha a missão</option>'
    + lista.map((m) => `<option value="${m.codigo}">${m.codigo} · ${MP.esc(m.nome)}</option>`).join('');
  $('#missao').value = lista.some((m) => m.codigo === escolhida) ? escolhida : '';
}
montarMissoes(missaoGuardada);

const entrada = MP.entradaDeCodigo($('#entrada'), {
  prefixos: ['C', 'P', 'F'],
  rotulos: { C: 'Contexto', P: 'Persona', F: 'Formato' },
  inicial: LETRA[TIPOS.find((tipo) => !cartas[tipo]) || 'Contexto'],
  aoAdicionar(carta) {
    if (carta.tipo === 'Missão') {
      if (missaoFeita(carta.codigo) && carta.codigo !== $('#missao').value) {
        MP.aviso(`${carta.codigo} já foi feita nesta partida`);
        return;
      }
      $('#missao').value = carta.codigo;
      atualizar();
      MP.aviso(`Missão ${carta.codigo}`);
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

// ---------- Conferir ----------

function minuscula(texto) {
  return texto.charAt(0).toLowerCase() + texto.slice(1);
}

function nomeCurto(codigo) {
  return DADOS.porCodigo[codigo].nome.replace(/ \(.*\)$/, '');
}

function ouLista(itens) {
  return itens.length > 1 ? `${itens.slice(0, -1).join(', ')} ou ${itens[itens.length - 1]}` : itens[0];
}

function eLista(itens) {
  return itens.length > 1 ? `${itens.slice(0, -1).join(', ')} e ${itens[itens.length - 1]}` : itens[0];
}

// O prompt fecha com contexto e persona do assunto da missão (e um formato qualquer).
// Fechou: formato da lista da missão = 3 estrelas, outro formato = 2.
// Não fechou: não vale, e o aplicativo não conta se o formato servia, porque a missão continua na mesa.
function conferir(missao) {
  const doAssunto = (tipo) => {
    const carta = DADOS.porCodigo[cartas[tipo]];
    const ok = Boolean(carta && carta.assunto === missao.assunto);
    const detalhe = ok ? `${carta.codigo} ${carta.nome}` : `${carta.codigo} ${carta.nome} é de ${MP.comSimbolo(carta.assunto)}.`;
    return { tipo, ok, titulo: `${tipo} de ${MP.comSimbolo(missao.assunto)}`, detalhe };
  };
  const itens = [doAssunto('Contexto'), doAssunto('Persona')];
  const fecha = itens.every((i) => i.ok);

  const formato = DADOS.porCodigo[cartas.Formato];
  const okFormato = missao.formatos.includes(formato.codigo);
  if (!fecha) {
    itens.push({ tipo: 'Formato', ok: null, titulo: `Formato: ${nomeCurto(formato.codigo)}`, detalhe: 'Só é conferido quando o prompt fecha.' });
  } else {
    const servem = ouLista(missao.formatos.map(nomeCurto));
    const outros = missao.formatos.filter((c) => c !== formato.codigo).map(nomeCurto);
    const detalhe = okFormato
      ? `${nomeCurto(formato.codigo)} serve.${outros.length ? ` Também serviam: ${ouLista(outros)}.` : ''}`
      : `${nomeCurto(formato.codigo)} não ajuda tanto aqui. Serviam: ${servem}.`;
    itens.push({ tipo: 'Formato', ok: okFormato, titulo: 'Formato que ajuda quem vai ler', detalhe });
  }
  return { itens, fecha, nota: fecha ? (okFormato ? 3 : 2) : 0 };
}

// ---------- O prompt e a resposta simulada ----------

function montarPrompt(missao) {
  const persona = DADOS.porCodigo[cartas.Persona];
  const contexto = DADOS.porCodigo[cartas.Contexto];
  const formato = DADOS.porCodigo[cartas.Formato];
  return [
    persona.texto,
    contexto.texto,
    `Tarefa: ${minuscula(missao.nome)}`,
    `Responda em formato de ${minuscula(formato.nome)}.`,
  ].join('\n');
}

function htmlDaResposta(missao, resultado) {
  if (resultado.nota === 3) {
    const boas = RESPOSTAS.boas[missao.codigo] || {};
    const texto = boas[cartas.Formato] || Object.values(boas)[0] || '';
    return `<span class="etiqueta">Resposta boa ✓</span><p class="texto-ia">${MP.esc(texto)}</p>`;
  }
  return resultado.itens.filter((i) => i.ok === false).map((i) => {
    const codigo = cartas[i.tipo];
    const falha = RESPOSTAS.falhas[i.tipo.toLowerCase()];
    let texto = falha.texto;
    if (i.tipo === 'Formato') {
      const pedidos = ouLista(missao.formatos.map((c) => minuscula(nomeCurto(c))));
      texto = `A missão pedia ${pedidos}, mas a resposta veio em ${minuscula(nomeCurto(codigo))}. ${falha.texto}`;
    }
    return `<span class="etiqueta">${falha.titulo} (${codigo})</span>
      <p class="texto-ia">${MP.esc(texto)}</p>`;
  }).join('<div style="height: 10px"></div>');
}

// ---------- Dar as estrelas ----------

// As mesmas estrelas não podem ser dadas duas vezes. Muda a missão, uma carta ou a vez? Pode dar de novo.
function chaveDaNota(partida) {
  return [partida.inicio || '', partida.turno, $('#missao').value, ...TIPOS.map((tipo) => cartas[tipo] || '-')].join('|');
}

function mostrarDar(resultado) {
  const partida = MP.lerPartida();
  const estrelas = MP.plural(resultado.nota, 'estrela', 'estrelas');
  $('#ir-partida').hidden = true;
  if (!partida || partida.vez === null) {
    $('#titulo-dar').textContent = `${MP.estrelas(resultado.nota)} vale ${estrelas}`;
    $('#sub-dar').innerHTML = 'Para somar no placar, comece uma partida na página <a href="index.html">Partida</a>.';
    $('#lados-dar').innerHTML = '';
    return;
  }
  const dada = MP.ler('mp-nota-dada', null);
  if (dada && dada.chave === chaveDaNota(partida)) {
    const lado = partida.lados[dada.lado];
    const ganhou = Boolean(lado && lado.estrelas >= META);
    $('#titulo-dar').textContent = ganhou
      ? `🏆 ${dada.nome} chegou a ${MP.plural(lado.estrelas, 'estrela', 'estrelas')} e ganhou!`
      : `✓ ${MP.plural(dada.estrelas, 'estrela', 'estrelas')} para ${dada.nome}`;
    $('#sub-dar').textContent = ganhou
      ? 'Toque abaixo para ver o placar final. Errou o lado? Desfaça e dê de novo.'
      : `${dada.nome} fica com a missão ${dada.missao}, põe as 3 cartas embaixo do monte, compra 3 e vira uma missão nova no lugar. Errou o lado? Desfaça e dê de novo.`;
    $('#lados-dar').innerHTML = '<button type="button" class="chip" data-desfazer>Desfazer</button>';
    $('#ir-partida').textContent = ganhou ? 'Ver o placar final' : 'Voltar para a Partida';
    $('#ir-partida').hidden = false;
    return;
  }
  $('#titulo-dar').textContent = `Dar ${estrelas} para`;
  $('#sub-dar').textContent = 'Quem bateu? O lado da vez aparece primeiro.';
  const ordem = partida.lados.map((lado, i) => i).sort((a, b) => (b === partida.vez) - (a === partida.vez));
  $('#lados-dar').innerHTML = ordem.map((i) => {
    const lado = partida.lados[i];
    return `<button type="button" class="chip" data-lado="${i}" ${i === partida.vez ? 'aria-pressed="true"' : ''}>
      ${MP.esc(lado.nome)}${i === partida.vez ? ' (vez)' : ''} · ${lado.estrelas} ★</button>`;
  }).join('');
}

function darEstrelas(i) {
  const partida = MP.lerPartida();
  const missao = DADOS.porCodigo[$('#missao').value];
  if (!partida || !missao || !TIPOS.every((tipo) => cartas[tipo])) return;
  const { fecha, nota } = conferir(missao);
  if (!fecha) return;
  const lado = partida.lados[i];
  lado.estrelas += nota;
  lado.missoes += 1;
  if (nota === 3) lado.perfeitas += 1;
  if (!partida.feitas.includes(missao.codigo)) partida.feitas.push(missao.codigo);
  MP.salvarPartida(partida);
  MP.salvar('mp-nota-dada', { chave: chaveDaNota(partida), lado: i, nome: lado.nome, estrelas: nota, missao: missao.codigo });
  MP.aviso(`+${MP.plural(nota, 'estrela', 'estrelas')} para ${lado.nome}`);
  atualizar();
}

function desfazer() {
  const partida = MP.lerPartida();
  const dada = MP.ler('mp-nota-dada', null);
  if (!partida || !dada || dada.chave !== chaveDaNota(partida)) return;
  const lado = partida.lados[dada.lado];
  lado.estrelas = Math.max(0, lado.estrelas - dada.estrelas);
  lado.missoes = Math.max(0, lado.missoes - 1);
  if (dada.estrelas === 3) lado.perfeitas = Math.max(0, lado.perfeitas - 1);
  partida.feitas = partida.feitas.filter((codigo) => codigo !== dada.missao);
  MP.salvarPartida(partida);
  MP.apagar('mp-nota-dada');
  MP.aviso(`Desfeito: ${lado.nome} voltou para ${MP.plural(lado.estrelas, 'estrela', 'estrelas')}`);
  atualizar();
}

// ---------- Atualiza a tela ----------

function atualizar() {
  montarMissoes($('#missao').value);
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

  ['#resultado', '#dar', '#prompt', '#resposta'].forEach((s) => { $(s).hidden = true; });
  const faltam = TIPOS.filter((tipo) => !cartas[tipo]);
  if (faltam.length === TIPOS.length) return;

  // Só confere com tudo na mão: assim o aplicativo não conta nada antes da hora
  $('#resultado').hidden = false;
  if (!missao || faltam.length) {
    const nomes = [...(missao ? [] : ['a missão']), ...faltam.map((tipo) => (tipo === 'Persona' ? 'a persona' : `o ${tipo.toLowerCase()}`))];
    $('#resultado').className = 'bloco resultado';
    $('#resultado').innerHTML = `<p class="veredito">Falta${nomes.length > 1 ? 'm' : ''} ${eLista(nomes)}</p>
      <p class="sub" style="margin: 0">O aplicativo confere quando tiver a missão e as 3 cartas de quem bateu.</p>`;
    return;
  }

  const resultado = conferir(missao);
  const classe = resultado.fecha ? { 3: 'ok', 2: 'meio' }[resultado.nota] : 'falha';
  const explica = resultado.fecha
    ? (resultado.nota === 3 ? 'O formato ajuda quem vai ler.' : 'O prompt fecha, mas o formato não ajuda tanto quem vai ler.')
    : `Para bater, o contexto e a persona precisam ser de ${MP.comSimbolo(missao.assunto)}. As cartas voltam para a mão, o lado descarta 1 e passa a vez.`;
  $('#resultado').className = `bloco resultado ${classe}`;
  $('#resultado').innerHTML = `
    ${resultado.fecha ? `<p class="nota-estrelas" aria-label="${resultado.nota} de 3 estrelas">${MP.estrelas(resultado.nota)}</p>` : ''}
    <p class="veredito">${resultado.fecha ? MP.plural(resultado.nota, 'estrela', 'estrelas') : 'Não fecha: não vale'}</p>
    <p class="sub" style="margin: 0">${explica}</p>
    <ul class="checklist">${resultado.itens.map((i) => {
      const estado = i.ok === null ? 'info' : (i.ok ? 'sim' : 'nao');
      return `
      <li class="${estado}"><span class="ic">${{ info: '?', sim: '✓', nao: '✗' }[estado]}</span>
        <span>${MP.esc(i.titulo)}<small>${MP.esc(i.detalhe)}</small></span></li>`;
    }).join('')}
    </ul>`;

  $('#dar').hidden = !resultado.fecha;
  if (resultado.fecha) mostrarDar(resultado);
  $('#prompt').hidden = false;
  $('#resposta').hidden = false;
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
  if (botao) darEstrelas(Number(botao.dataset.lado));
});
// Ao voltar da Partida, a vez pode ter mudado: começa limpo para o próximo prompt
window.addEventListener('pageshow', (evento) => {
  if (!evento.persisted) return;
  ({ missao: missaoGuardada, cartas } = lerEstado());
  montarMissoes(missaoGuardada);
  entrada.escolherPrefixo(LETRA[TIPOS.find((tipo) => !cartas[tipo]) || 'Contexto']);
  atualizar();
});

atualizar();
