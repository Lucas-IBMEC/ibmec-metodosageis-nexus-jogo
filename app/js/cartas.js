// Página Cartas: consulta de qualquer carta pelo código ou pelo nome. História 2.3.1.

const $ = (seletor) => document.querySelector(seletor);

const FILTROS = [
  { nome: 'Todas', tipos: null },
  { nome: 'Contexto', tipos: ['Contexto'] },
  { nome: 'Precisão', tipos: ['Precisão'] },
  { nome: 'Missão', tipos: ['Missão'] },
  { nome: 'Dor, necessidade e conceito', tipos: ['Dor', 'Necessidade', 'Conceito'] },
  { nome: 'Formato', tipos: ['Formato'] },
  { nome: 'Documento', tipos: ['Documento'] },
  { nome: 'Ética', tipos: ['Ética'] },
  { nome: 'Persona', tipos: ['Persona'] },
  { nome: 'Nação', tipos: ['Nação'] },
];

let filtro = 0;

// Busca sem ligar para acento nem maiúscula ("saude" acha "Saúde")
function simples(texto) {
  return String(texto ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

function linhasDaCarta(c) {
  const linhas = [];
  if (c.assunto) linhas.push(['Assunto', c.assunto]);
  if (c.nacao) linhas.push(['Nação', c.nacao]);
  if (c.numero !== undefined) linhas.push(['Número', `${c.numero} (a precisão precisa ficar entre ${c.numero - 2} e ${c.numero + 2}; nos EUA, entre ${c.numero - 3} e ${c.numero + 3})`]);
  if (c.pontos) linhas.push(['Vale', MP.plural(c.pontos, 'ponto', 'pontos')]);
  if (c.ataque !== undefined) linhas.push(['Ataque e defesa', `${c.ataque} e ${c.defesa}`]);
  if (c.estilo) linhas.push(['Estilo', c.estilo]);
  if (c.copias > 1) linhas.push(['Cópias no baralho', `${c.copias}, com o mesmo código`]);
  if (c.efeito && c.tipo !== 'Contexto') linhas.push([c.tipo === 'Missão' ? 'O combo precisa ter' : 'Efeito', c.efeito.replace('Combo precisa ter: ', '')]);
  if (c.texto && c.texto !== c.nome) linhas.push(['Texto da carta', `“${c.texto}”`]);
  if (c.poderes) c.poderes.forEach((p) => linhas.push([`${p.n} ${p.nome} (${MP.plural(p.custo, 'ponto', 'pontos')})`, p.texto]));
  return linhas;
}

function htmlDaCarta(c) {
  const defeito = DADOS.defeitos[c.codigo];
  return `<details class="item ${MP.classeDoTipo(c.tipo)}">
    <summary>
      <span class="cod">${c.codigo}</span>
      <span><span class="nome-item">${MP.esc(c.nome)}</span><span class="tipo-item">${MP.esc(c.tipo)}</span></span>
    </summary>
    <div class="corpo">
      ${linhasDaCarta(c).map(([rotulo, valor]) => `<p><b>${rotulo}:</b> ${MP.esc(valor)}</p>`).join('')}
      ${defeito ? `<details class="gabarito">
        <summary>Gabarito do professor</summary>
        <p><b>${MP.esc(defeito.problema)}:</b> ${MP.esc(defeito.oQueTem)}</p>
        <p>${MP.esc(defeito.porQue)}</p>
        <p><b>Conserta com:</b> ${MP.esc(defeito.consertaCom)}</p>
        <p><b>Consertada:</b> “${MP.esc(defeito.versaoConsertada)}”</p>
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
    return simples(`${c.codigo} ${c.nome} ${c.texto || ''} ${c.assunto || ''} ${c.nacao || ''} ${c.estilo || ''}`).includes(termo);
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
