// Página Cartas: consulta de qualquer carta pelo código ou pelo nome. História 2.3.1.

const $ = (seletor) => document.querySelector(seletor);

const FILTROS = [
  { nome: 'Todas', tipos: null },
  { nome: 'Missão', tipos: ['Missão'] },
  { nome: 'Contexto', tipos: ['Contexto'] },
  { nome: 'Persona', tipos: ['Persona'] },
  { nome: 'Formato', tipos: ['Formato'] },
  { nome: 'Nação', tipos: ['Nação'] },
];

let filtro = 0;

// Busca sem ligar para acento nem maiúscula ("saude" acha "Saúde")
function simples(texto) {
  return String(texto ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

function nomeDoFormato(codigo) {
  return DADOS.porCodigo[codigo].nome.replace(/ \(.*\)$/, '');
}

function linhasDaCarta(c) {
  const linhas = [];
  if (c.assunto) linhas.push(['Assunto', MP.comSimbolo(c.assunto)]);
  if (c.tipo === 'Contexto') linhas.push(['Texto da carta', `“${c.texto}”`]);
  if (c.tipo === 'Persona') linhas.push(['No prompt', `“${c.texto}”`]);
  if (c.tipo === 'Formato') linhas.push(['Como fica', c.texto]);
  if (c.copias > 1) linhas.push(['Cópias no baralho', `${c.copias}, com o mesmo código`]);
  if (c.tipo === 'Contexto' || c.tipo === 'Persona') linhas.push(['Ganha estrela', `em missão de ${c.assunto}`]);
  if (c.tipo === 'Formato') {
    const missoes = DADOS.missoes.filter((m) => m.formatos.includes(c.codigo)).map((m) => m.codigo);
    linhas.push(['Ganha estrela', `nas missões ${missoes.join(', ')}`]);
  }
  if (c.vida) linhas.push(['Vida inicial', String(c.vida)]);
  if (c.poderes) c.poderes.forEach((p) => linhas.push([`${p.n} ${p.nome} (${MP.plural(p.custo, 'ponto', 'pontos')})`, p.texto]));
  return linhas;
}

function htmlDaCarta(c) {
  return `<details class="item ${MP.classeDoTipo(c.tipo)}">
    <summary>
      <span class="cod">${c.codigo}</span>
      <span><span class="nome-item">${MP.esc(c.nome)}</span><span class="tipo-item">${MP.esc(c.tipo)}</span></span>
    </summary>
    <div class="corpo">
      ${linhasDaCarta(c).map(([rotulo, valor]) => `<p><b>${rotulo}:</b> ${MP.esc(valor)}</p>`).join('')}
      ${c.tipo === 'Missão' ? `<details class="gabarito">
        <summary>Gabarito do professor</summary>
        <p><b>Contexto e persona:</b> de ${MP.esc(c.assunto)}.</p>
        <p><b>Formatos que servem:</b> ${MP.esc(c.formatos.map((f) => `${f} ${nomeDoFormato(f)}`).join(' · '))}</p>
      </details>` : ''}
    </div>
  </details>`;
}

function atualizar() {
  const termo = simples($('#busca').value.trim());
  const codigo = MP.normalizarCodigo($('#busca').value);
  const tipos = FILTROS[filtro].tipos;
  const achadas = DADOS.cartas.filter((c) => {
    if (tipos && !tipos.includes(c.tipo)) return false;
    if (!termo) return true;
    if (codigo && c.codigo === codigo) return true;
    // Nas nações, procura também nos poderes ("golaço" acha o Brasil)
    const poderes = (c.poderes || []).map((p) => `${p.nome} ${p.texto}`).join(' ');
    return simples(`${c.codigo} ${c.nome} ${c.texto || ''} ${c.assunto || ''} ${c.lema || ''} ${poderes}`).includes(termo);
  });

  // Código exato aparece primeiro e já aberto
  achadas.sort((a, b) => (b.codigo === codigo) - (a.codigo === codigo));
  $('#contagem').textContent = `${achadas.length} ${achadas.length === 1 ? 'carta' : 'cartas'}`;
  $('#lista').innerHTML = achadas.length
    ? achadas.map(htmlDaCarta).join('')
    : '<p class="vazio">Nenhuma carta encontrada.</p>';
  const exata = $('#lista details');
  if (exata && codigo && achadas[0]?.codigo === codigo) exata.open = true;
}

$('#filtros').innerHTML = FILTROS.map((f, i) => (
  `<button type="button" class="chip" data-filtro="${i}" aria-pressed="${i === filtro}">${f.nome}</button>`)).join('');
$('#filtros').addEventListener('click', (evento) => {
  const botao = evento.target.closest('[data-filtro]');
  if (!botao) return;
  filtro = Number(botao.dataset.filtro);
  document.querySelectorAll('[data-filtro]').forEach((b) => b.setAttribute('aria-pressed', String(b === botao)));
  atualizar();
});
$('#busca').addEventListener('input', atualizar);

atualizar();
