// Página Missão: o professor escolhe a missão, digita as cartas do combo
// e o app mostra o que falta. Histórias: 2.1.1, 2.1.2, 2.2.1, 2.2.2 e 2.2.3.

const $ = (seletor) => document.querySelector(seletor);

const PERSONAS = DADOS.cartas.filter((c) => c.tipo === 'Persona');
const NACOES = DADOS.cartas.filter((c) => c.tipo === 'Nação');
const DNC = ['Dor', 'Necessidade', 'Conceito'];
const TEXTO_DNC = { DOR: 'Uma DOR', NECESSIDADE: 'Uma NECESSIDADE', CONCEITO: 'Um CONCEITO' };
const MARGEM_DA_NACAO = { N3: 3, N4: 1 }; // EUA tem margem 3, China tem margem 1, o resto 2

// Ignora códigos guardados que não existem mais (se uma carta mudar em dados.js)
let combo = MP.ler('mp-combo', []).filter((codigo) => DADOS.porCodigo[codigo]);

// ---------- Montagem da tela ----------

$('#missao').innerHTML = DADOS.missoes.map((m) => (
  `<option value="${m.codigo}">${m.codigo} · ${MP.esc(m.pedido)}</option>`)).join('');
const missaoGuardada = MP.ler('mp-missao', 'M01');
$('#missao').value = DADOS.missoes.some((m) => m.codigo === missaoGuardada) ? missaoGuardada : 'M01';

$('#persona').innerHTML = '<option value="">Nenhuma</option>' + PERSONAS.map((p) => (
  `<option value="${p.codigo}">${MP.esc(p.nome)} (${p.assunto})</option>`)).join('');
$('#nacao').innerHTML = '<option value="">Não sei (sem bônus, margem 2)</option>' + NACOES.map((n) => (
  `<option value="${n.codigo}">${MP.esc(n.nome)}${MARGEM_DA_NACAO[n.codigo] ? ` (margem ${MARGEM_DA_NACAO[n.codigo]})` : ''}</option>`)).join('');

// Com uma partida aberta, a persona é a da mesa e a nação é a do lado da vez
function carregarDaPartida() {
  const partida = MP.lerPartida();
  const emJogo = Boolean(partida && partida.vez !== null);
  $('#persona').value = (partida ? partida.persona : MP.ler('mp-persona', '')) || '';
  $('#nacao').value = emJogo ? partida.lados[partida.vez].nacao : MP.ler('mp-nacao', '');
  $('#dica-partida').hidden = !emJogo;
}
carregarDaPartida();

MP.entradaDeCodigo($('#entrada'), {
  prefixos: ['C', 'P', 'D', 'F', 'DC', 'E'],
  aoAdicionar(carta) {
    const permitidos = ['Contexto', 'Precisão', 'Formato', 'Documento', 'Ética', ...DNC];
    if (!permitidos.includes(carta.tipo)) {
      MP.aviso(`${carta.codigo} é ${carta.tipo.toLowerCase()}: não entra no combo`);
      return;
    }
    if (combo.includes(carta.codigo)) {
      MP.aviso(`${carta.codigo} já está no combo`);
      return;
    }
    combo.push(carta.codigo);
    atualizar();
  },
});

// ---------- Conferência ----------

function nomeDoFormato(codigo) {
  return DADOS.porCodigo[codigo].nome.replace(/ \(.*\)$/, '');
}

function tipoDoDefeito(defeito) {
  return defeito.problema.startsWith('Viés') ? 'Viés' : 'Dado pessoal';
}

function conferir(missao, cartas) {
  const doTipo = (...tipos) => cartas.filter((c) => tipos.includes(c.tipo));
  const contextos = doTipo('Contexto');
  const precisoes = doTipo('Precisão');
  const dncs = doTipo(...DNC);
  const formatos = doTipo('Formato');
  const documentos = doTipo('Documento');
  const eticas = doTipo('Ética');
  const margem = MARGEM_DA_NACAO[$('#nacao').value] || 2;
  const itens = [];
  const falhas = [];

  // Regras do combo (vale para qualquer missão)
  const problemasDoCombo = [];
  if (!contextos.length) problemasDoCombo.push('falta 1 contexto');
  if (!precisoes.length) problemasDoCombo.push('falta 1 precisão');
  if (precisoes.length > 1) problemasDoCombo.push('só cabe 1 precisão');
  if (dncs.length > 1) problemasDoCombo.push('só cabe 1 dor, necessidade ou conceito');
  if (formatos.length > 1) problemasDoCombo.push('a precisão só recebe 1 formato');
  if (documentos.length > 1) problemasDoCombo.push('só cabe 1 documento');
  if (cartas.length - formatos.length > 5) problemasDoCombo.push('no máximo 5 cartas (o formato não conta)');
  itens.push({
    ok: problemasDoCombo.length === 0,
    titulo: 'Combo válido',
    detalhe: problemasDoCombo.length ? problemasDoCombo.join(' · ') : 'Contexto e precisão, sem cartas sobrando.',
  });
  if (!contextos.length || !precisoes.length) falhas.push('combo');
  else if (problemasDoCombo.length) falhas.push('regras');

  let foraDaMargem = [];
  if (contextos.length && precisoes.length) {
    const n = contextos[0].numero;
    const fora = precisoes.filter((p) => Math.abs(p.ataque - n) > margem || Math.abs(p.defesa - n) > margem);
    foraDaMargem = fora;
    if (fora.length) falhas.push('margem');
    itens.push({
      ok: fora.length === 0,
      titulo: `A precisão combina com o contexto (entre ${n - margem} e ${n + margem})`,
      detalhe: fora.length
        ? `${fora.map((p) => `${p.codigo} tem ataque ${p.ataque} e defesa ${p.defesa}`).join(' · ')}. Esse combo não pode ser baixado.`
        : `${contextos[0].codigo} tem número ${n}.`,
    });
    const nacoes = new Set(contextos.map((c) => c.nacao));
    if (nacoes.size > 1) {
      itens.push({ ok: true, titulo: 'Nações misturadas', detalhe: 'Vale, mas esse ataque leva -1.' });
    }
  }

  // O que a missão pede
  const okContexto = contextos.some((c) => c.assunto === missao.assunto);
  itens.push({
    ok: okContexto,
    titulo: `Contexto de ${missao.assunto}`,
    detalhe: okContexto ? '' : contextos.length
      ? `O contexto é de ${contextos.map((c) => c.assunto).join(' e ')}.`
      : 'Nenhum contexto no combo.',
  });
  if (!okContexto && contextos.length) falhas.push('contexto');

  // A dor, a necessidade ou o conceito precisa ser do mesmo assunto da missão
  if (missao.precisa.dnc) {
    const pedido = missao.precisa.dnc;
    const okDnc = dncs.some((c) => c.tipo.toUpperCase() === pedido && c.assunto === missao.assunto);
    const doTipoCerto = dncs.find((c) => c.tipo.toUpperCase() === pedido);
    let detalhe = '';
    if (!okDnc && doTipoCerto) detalhe = `${doTipoCerto.codigo} é de ${doTipoCerto.assunto}, mas a missão é de ${missao.assunto}.`;
    else if (!okDnc && dncs.length) detalhe = `O combo tem ${dncs[0].tipo.toLowerCase()}, mas a missão pede ${pedido.toLowerCase()}.`;
    itens.push({
      ok: okDnc,
      titulo: `${TEXTO_DNC[pedido]} de ${missao.assunto}${pedido === 'CONCEITO' ? '' : ' (de quem vai ler)'}`,
      detalhe,
    });
    if (!okDnc) falhas.push('dnc');
  }

  const okFormato = formatos.some((f) => missao.precisa.formatos.includes(f.codigo));
  itens.push({
    ok: okFormato,
    titulo: `Formato: ${missao.precisa.formatos.map(nomeDoFormato).join(' ou ')}`,
    detalhe: okFormato ? '' : formatos.length ? `O combo tem ${nomeDoFormato(formatos[0].codigo)}.` : 'Nenhum formato na precisão.',
  });
  if (!okFormato) falhas.push('formato');

  // Ética: carta com problema só vale se o combo tiver a ética que conserta
  const semConserto = contextos
    .filter((c) => DADOS.defeitos[c.codigo])
    .filter((c) => !eticas.some((e) => e.efeito === `Conserta: ${tipoDoDefeito(DADOS.defeitos[c.codigo])}`));
  itens.push({
    ok: semConserto.length === 0,
    titulo: 'Nenhuma carta com problema de ética sem conserto',
    detalhe: semConserto.map((c) => {
      const d = DADOS.defeitos[c.codigo];
      return `${c.codigo} tem ${d.problema.toLowerCase()}. Conserta com ${d.consertaCom}.`;
    }).join(' '),
  });
  semConserto.forEach((c) => falhas.push(c));

  const cumpriu = itens.every((i) => i.ok);
  const valido = problemasDoCombo.length === 0 && foraDaMargem.length === 0;
  return { itens, falhas, cumpriu, valido };
}

// ---------- Força do combo ----------

// Ataque e defesa da precisão com os bônus da mesa. Devolve null se não há precisão.
function calcularForca(cartas) {
  const precisao = cartas.find((c) => c.tipo === 'Precisão');
  if (!precisao) return null;
  let ataque = precisao.ataque;
  let defesa = precisao.defesa;
  const contas = [{ texto: `${precisao.codigo} (${precisao.assunto}): ataque ${ataque} e defesa ${defesa}` }];

  const persona = DADOS.porCodigo[$('#persona').value];
  if (persona && persona.assunto === precisao.assunto) {
    ataque += 1;
    contas.push({ tipo: 'mais', texto: `+1 de ataque: ${persona.nome} na mesa (${persona.assunto})` });
  } else if (persona) {
    contas.push({ texto: `${persona.nome} é de ${persona.assunto}: não ajuda uma precisão de ${precisao.assunto}` });
  }

  const nacao = $('#nacao').value;
  if (nacao === 'N1') {
    ataque += 1;
    defesa -= 1;
    contas.push({ tipo: 'mais', texto: '+1 de ataque e -1 de defesa: Brasil' });
  }
  if (nacao === 'N2') {
    ataque -= 1;
    defesa += 1;
    contas.push({ tipo: 'menos', texto: '-1 de ataque e +1 de defesa: Índia' });
  }

  const nacoes = new Set(cartas.filter((c) => c.tipo === 'Contexto').map((c) => c.nacao));
  if (nacoes.size > 1) {
    ataque -= 1;
    contas.push({ tipo: 'menos', texto: '-1 de ataque: contextos de nações diferentes' });
  }

  // Estilos dos equipamentos: mudam como o ataque acerta ou como o combo se defende
  let naoAtaca = false;
  cartas.filter((c) => c.tipo === 'Formato' || c.tipo === 'Documento').forEach((c) => {
    contas.push({ texto: `${c.estilo} (${c.codigo}): ${c.efeito}` });
    if (c.estilo === 'Virar defesa') {
      naoAtaca = true;
      defesa += 3;
    }
  });

  return { ataque: naoAtaca ? 0 : Math.max(0, ataque), defesa: Math.max(0, defesa), contas, naoAtaca };
}

function mostrarForca(cartas) {
  const forca = calcularForca(cartas);
  $('#forca').hidden = !forca;
  if (!forca) return;
  $('#forca-ataque').textContent = forca.naoAtaca ? '—' : forca.ataque;
  $('#forca-defesa').textContent = forca.defesa;
  $('#forca-contas').innerHTML = forca.contas.map((c) => (
    `<li class="${c.tipo || ''}">${MP.esc(c.texto)}</li>`)).join('');
}

// ---------- O prompt e a resposta simulada ----------

function minuscula(texto) {
  return texto.charAt(0).toLowerCase() + texto.slice(1);
}

function montarPrompt(missao, cartas) {
  const partes = [`Tarefa: ${missao.pedido}`];
  const persona = DADOS.porCodigo[$('#persona').value];
  if (persona) partes.push(`Você é ${minuscula(persona.nome)}.`);
  const eticas = cartas.filter((c) => c.tipo === 'Ética');
  cartas.filter((c) => c.tipo === 'Contexto').forEach((c) => {
    const defeito = DADOS.defeitos[c.codigo];
    const consertado = defeito && eticas.some((e) => e.efeito === `Conserta: ${tipoDoDefeito(defeito)}`);
    partes.push(consertado ? `${defeito.versaoConsertada} (revisado com ética)` : c.texto);
  });
  cartas.filter((c) => DNC.includes(c.tipo)).forEach((c) => {
    if (c.tipo === 'Dor') partes.push(`O problema é: ${minuscula(c.texto)}`);
    else if (c.tipo === 'Conceito') partes.push(`Quero entender: ${minuscula(c.texto)}`);
    else partes.push(c.texto);
  });
  cartas.filter((c) => c.tipo === 'Documento').forEach((c) => partes.push(`Use como fonte: ${minuscula(c.nome)}.`));
  cartas.filter((c) => c.tipo === 'Precisão').forEach((c) => partes.push(c.nome));
  cartas.filter((c) => c.tipo === 'Formato').forEach((c) => partes.push(`Responda em formato de ${minuscula(nomeDoFormato(c.codigo))}.`));
  return partes.join('\n');
}

function htmlDaResposta(missao, resultado) {
  if (resultado.cumpriu) {
    return `<span class="etiqueta">Resposta boa ✓</span>
      <p class="texto-ia">${MP.esc(RESPOSTAS.boas[missao.codigo])}</p>`;
  }
  return resultado.falhas.map((falha) => {
    if (falha === 'formato') {
      const usado = combo.map((c) => DADOS.porCodigo[c]).find((c) => c.tipo === 'Formato');
      const pedidos = missao.precisa.formatos.map(nomeDoFormato).join(' ou ');
      const texto = usado
        ? `A missão pede ${minuscula(pedidos)}, mas a resposta veio em ${minuscula(nomeDoFormato(usado.codigo))}. Para quem vai ler, isso atrapalha.`
        : RESPOSTAS.falhas.formato.texto;
      return `<span class="etiqueta">${RESPOSTAS.falhas.formato.titulo}</span><p class="texto-ia">${MP.esc(texto)}</p>`;
    }
    if (typeof falha === 'string') {
      const f = RESPOSTAS.falhas[falha];
      return `<span class="etiqueta">${f.titulo}</span><p class="texto-ia">${MP.esc(f.texto)}</p>`;
    }
    // Carta com dado pessoal ou viés: a IA repete o problema da carta
    const f = RESPOSTAS.falhas[tipoDoDefeito(DADOS.defeitos[falha.codigo])];
    return `<span class="etiqueta">${f.titulo} (${falha.codigo})</span>
      <p class="texto-ia">${MP.esc(`${f.texto}"Certo! ${falha.texto} Vou responder pensando nisso..."`)}</p>`;
  }).join('<div style="height: 10px"></div>');
}

// ---------- Atualiza a tela ----------

function atualizar() {
  MP.salvar('mp-combo', combo);
  MP.salvar('mp-missao', $('#missao').value);
  if (!MP.lerPartida()) MP.salvar('mp-nacao', $('#nacao').value);

  const missao = DADOS.missoes.find((m) => m.codigo === $('#missao').value);
  const textoDaCarta = DADOS.porCodigo[missao.codigo].efeito.replace('Combo precisa ter: ', '').split(' · ');
  $('#lista-missao').innerHTML = textoDaCarta.map((t) => (
    `<li><span class="ic" style="background: var(--c-missao)">☐</span><span>${MP.esc(t)}</span></li>`)).join('');

  const cartas = combo.map((codigo) => DADOS.porCodigo[codigo]);
  $('#combo').innerHTML = cartas.length
    ? cartas.map((c) => MP.chipDeCarta(c, { removivel: true })).join('')
    : '<p class="nota">Nenhuma carta ainda. Ex.: toque em C e digite 1 para o C01.</p>';

  const temCombo = cartas.length > 0;
  ['#resultado', '#prompt', '#resposta'].forEach((s) => { $(s).hidden = !temCombo; });
  $('#dar-missao').hidden = true;
  mostrarForca(cartas);
  if (!temCombo) return;

  const resultado = conferir(missao, cartas);
  const resultadoEl = $('#resultado');
  resultadoEl.className = `bloco resultado ${resultado.cumpriu ? 'ok' : 'falha'}`;
  const faltam = resultado.itens.filter((i) => !i.ok).length;
  resultadoEl.innerHTML = `
    <p class="veredito">${resultado.cumpriu ? '✓ Missão cumprida' : '✗ Ainda não cumpriu'}</p>
    <p class="sub" style="margin: 0">${resultado.cumpriu
      ? 'O lado que avisou antes de atacar pega a carta de missão.'
      : resultado.valido
        ? `Falta${faltam > 1 ? 'm' : ''} ${faltam} ${faltam > 1 ? 'itens' : 'item'}. O ataque vale, mas o lado não pega a missão.`
        : 'Esse combo não pode ser baixado na mesa. Confira as regras do combo.'}</p>
    <ul class="checklist">${resultado.itens.map((i) => `
      <li class="${i.ok ? 'sim' : 'nao'}"><span class="ic">${i.ok ? '✓' : '✗'}</span>
        <span>${MP.esc(i.titulo)}${i.detalhe ? `<small>${MP.esc(i.detalhe)}</small>` : ''}</span></li>`).join('')}
    </ul>`;

  $('#texto-prompt').textContent = montarPrompt(missao, cartas);
  $('#texto-resposta').innerHTML = htmlDaResposta(missao, resultado);

  const partida = MP.lerPartida();
  if (resultado.cumpriu && partida && partida.vez !== null) {
    $('#dar-missao').hidden = false;
    $('#lados-missao').innerHTML = partida.lados.map((lado, i) => (
      `<button type="button" class="chip" data-lado="${i}">${MP.esc(lado.nome)} · ${MP.plural(lado.missoes, 'missão', 'missões')}</button>`)).join('');
  }
}

// ---------- Ligações ----------

$('#combo').addEventListener('click', (evento) => {
  const botao = evento.target.closest('[data-remover]');
  if (!botao) return;
  combo = combo.filter((codigo) => codigo !== botao.dataset.remover);
  atualizar();
});
['#missao', '#nacao'].forEach((s) => $(s).addEventListener('change', atualizar));
// Trocar a persona aqui também troca a persona da mesa na Partida
$('#persona').addEventListener('change', () => {
  const partida = MP.lerPartida();
  if (partida) {
    partida.persona = $('#persona').value;
    MP.salvarPartida(partida);
  } else {
    MP.salvar('mp-persona', $('#persona').value);
  }
  atualizar();
});
// Ao voltar de outra página, pega a persona e o lado da vez atualizados
window.addEventListener('pageshow', (evento) => {
  if (evento.persisted) {
    carregarDaPartida();
    atualizar();
  }
});
$('#limpar').addEventListener('click', () => { combo = []; atualizar(); });
$('#lados-missao').addEventListener('click', (evento) => {
  const botao = evento.target.closest('[data-lado]');
  if (!botao) return;
  const partida = MP.lerPartida();
  const lado = partida.lados[Number(botao.dataset.lado)];
  lado.missoes += 1;
  MP.salvarPartida(partida);
  MP.aviso(`+1 missão para ${lado.nome}. Vire uma missão nova.`);
  combo = [];
  atualizar();
});

atualizar();
