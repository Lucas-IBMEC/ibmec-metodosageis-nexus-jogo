// Página Denúncia: o app aponta se a carta tem dado pessoal ou viés
// e aplica o resultado no placar. História 2.2.3.

const $ = (seletor) => document.querySelector(seletor);
const VIDA_DA_DENUNCIA = 2;

let cartaDenunciada = null;

MP.entradaDeCodigo($('#entrada'), {
  prefixos: ['C', 'P', 'D', 'F', 'DC', 'E'],
  rotuloBotao: 'Julgar',
  aoAdicionar(carta) {
    cartaDenunciada = carta;
    mostrarResultado();
  },
});

function mostrarResultado() {
  const carta = cartaDenunciada;
  const defeito = DADOS.defeitos[carta.codigo];
  const resultado = $('#resultado');
  resultado.hidden = false;
  resultado.className = `bloco resultado ${defeito ? 'ok' : 'falha'}`;

  if (defeito) {
    resultado.innerHTML = `
      <p class="veredito">✓ Denúncia certa</p>
      <p style="margin: 0 0 8px">${MP.chipDeCarta(carta)}</p>
      <ul class="checklist">
        <li class="nao"><span class="ic">!</span><span><b>${MP.esc(defeito.problema)}</b>
          <small>${MP.esc(defeito.oQueTem)}</small></span></li>
        <li class="info"><span class="ic">?</span><span><b>Por que é um problema</b>
          <small>${MP.esc(defeito.porQue)}</small></span></li>
        <li class="sim"><span class="ic">✓</span><span><b>Conserta com</b>
          <small>${MP.esc(defeito.consertaCom)}</small></span></li>
      </ul>
      <span class="etiqueta" style="margin-top: 12px">Como fica consertada</span>
      <p class="texto-ia">“${MP.esc(defeito.versaoConsertada)}”</p>`;
  } else {
    resultado.innerHTML = `
      <p class="veredito">✗ Denúncia errada</p>
      <p style="margin: 0 0 8px">${MP.chipDeCarta(carta)}</p>
      <p class="sub" style="margin: 0">Esta carta não tem dado pessoal nem viés.
        Quem denunciou perde ${VIDA_DA_DENUNCIA} de vida e o denunciado ganha ${VIDA_DA_DENUNCIA}.</p>`;
  }
  prepararPlacar(Boolean(defeito));
}

function prepararPlacar(certa) {
  const partida = MP.lerPartida();
  const aplicar = $('#aplicar');
  if (!partida || partida.vez === null) {
    aplicar.hidden = true;
    return;
  }
  aplicar.hidden = false;
  const opcoes = partida.lados.map((lado, i) => `<option value="${i}">${MP.esc(lado.nome)}</option>`).join('');
  $('#quem-denunciou').innerHTML = opcoes;
  $('#denunciado').innerHTML = opcoes;
  // Quem ataca é o lado da vez, então ele costuma ser o denunciado
  $('#denunciado').value = String(partida.vez);
  $('#quem-denunciou').value = String((partida.vez + 1) % partida.lados.length);
  $('#linha-etica').hidden = !certa;
  $('#com-etica').checked = false;
  $('#aplicar-sub').textContent = certa
    ? `Quem denunciou ganha ${VIDA_DA_DENUNCIA} de vida e o denunciado fica sem atacar no próximo turno.`
    : `Quem denunciou perde ${VIDA_DA_DENUNCIA} de vida e o denunciado ganha ${VIDA_DA_DENUNCIA}.`;
}

function aplicarNoPlacar() {
  const partida = MP.lerPartida();
  const quem = partida.lados[Number($('#quem-denunciou').value)];
  const alvo = partida.lados[Number($('#denunciado').value)];
  if (quem === alvo) {
    MP.aviso('Escolha lados diferentes');
    return;
  }
  const certa = Boolean(DADOS.defeitos[cartaDenunciada.codigo]);
  if (certa) {
    alvo.semAtacar = true;
    alvo.semAtacarNoTurno = partida.turno;
    if ($('#com-etica').checked) {
      MP.aviso(`Combo de ${alvo.nome} anulado: vai para o descarte`);
    } else {
      // Bônus das nações: UE (N5) ganha +1 na própria denúncia certa; quem denuncia os EUA (N3) ganha +1
      const extra = (quem.nacao === 'N5' ? 1 : 0) + (alvo.nacao === 'N3' ? 1 : 0);
      quem.vida += VIDA_DA_DENUNCIA + extra;
      MP.aviso(`${quem.nome} ganhou ${VIDA_DA_DENUNCIA + extra} de vida`);
    }
  } else {
    quem.vida = Math.max(0, quem.vida - VIDA_DA_DENUNCIA);
    alvo.vida += VIDA_DA_DENUNCIA;
    MP.aviso(`${quem.nome} perdeu ${VIDA_DA_DENUNCIA} e ${alvo.nome} ganhou ${VIDA_DA_DENUNCIA}`);
  }
  MP.salvarPartida(partida);
  $('#aplicar').hidden = true;
}

$('#aplicar-botao').addEventListener('click', aplicarNoPlacar);
