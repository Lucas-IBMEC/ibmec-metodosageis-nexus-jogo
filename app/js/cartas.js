// Página Cartas: consulta de qualquer carta pelo código ou pelo nome. História 2.3.1.
// Cada carta mostra o que está escrito nela e, fechado, o gabarito do professor: os números escondidos
// (de 1 a 4, quanto ela combina com cada assunto) e a nota que ela dá em cada tipo de missão.

const $ = (seletor) => document.querySelector(seletor);
const LETRAS = Object.keys(DADOS.assuntos); // S, E, T, A

const FILTROS = [
  { nome: 'Todas', tipos: null },
  { nome: 'Missão', tipos: ['Missão'] },
  { nome: 'Contexto', tipos: ['Contexto'] },
  { nome: 'Persona', tipos: ['Persona'] },
  { nome: 'Formato', tipos: ['Formato'] },
];

// Os tipos de missão que existem (cada um com 3 assuntos) e as missões de cada um
const TRIOS = [...new Set(DADOS.missoes.map((m) => m.assuntos.join('')))].map((chave) => ({
  assuntos: chave.split(''),
  missoes: DADOS.missoes.filter((m) => m.assuntos.join('') === chave).map((m) => m.codigo),
}));

let filtro = 0;

// Busca sem ligar para acento nem maiúscula ("saude" acha "Saúde")
function simples(texto) {
  return String(texto ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

const simbolos = (assuntos) => assuntos.map((a) => DADOS.assuntos[a].ico).join(' ');

function linhasDaCarta(c) {
  if (c.tipo === 'Missão') return [['Assuntos', c.assuntos.map(MP.comSimbolo).join(' · ')]];
  if (c.tipo === 'Contexto') return [['Texto da carta', `“${c.texto}”`]];
  if (c.tipo === 'Persona') return [['Na carta', c.texto], ['No prompt', `“${c.prompt}”`]];
  return [['Como fica', c.texto]];
}

// Missão: as melhores cartas de cada baralho e a nota mais alta possível
function gabaritoDaMissao(m) {
  const maxima = MP.somaMaxima(m.assuntos);
  return `${MP.TIPOS.map((tipo) => `<p class="melhores-tipo ${MP.classeDoTipo(tipo)}">${tipo}</p>
    <ul class="melhores-lista">${MP.melhoresCartas(tipo, m.assuntos).map(({ carta, soma }) => `<li class="${MP.classeDoTipo(tipo)}">
      <span class="cod">${carta.codigo}</span><span>${MP.esc(carta.nome)}</span><b>${NOTA.numero(soma / 3)}</b></li>`).join('')}
    </ul>`).join('')}
    <p class="nota">Com a melhor carta de cada baralho, o prompt tira ${NOTA.numero(maxima / 9)}: a nota mais alta possível nesta missão.</p>`;
}

// Contexto, persona e formato: o número de cada assunto e a nota da carta em cada tipo de missão
function gabaritoDaCarta(c) {
  return `<div class="numeros">${LETRAS.map((a) => `<div class="numero v${c.combina[a]}">
      <span>${MP.esc(MP.comSimbolo(a))}</span><b>${c.combina[a]}</b></div>`).join('')}</div>
    <p class="rotulo">Nota da carta em cada missão</p>
    <ul class="notas-trio">${TRIOS.map((t) => `<li>
      <span class="trio-ico" aria-label="${MP.esc(MP.juntar(t.assuntos.map((a) => MP.NOMES[a])))}">${simbolos(t.assuntos)}</span>
      <span class="trio-missoes">${t.missoes.join(', ')}</span>
      <b>${NOTA.numero(NOTA.mediaDaCarta(c, t.assuntos))}</b></li>`).join('')}</ul>
    <p class="nota">4 = combina muito com o assunto, 1 = não combina. A nota da carta é a média dos 3 assuntos da missão.</p>`;
}

function htmlDaCarta(c) {
  return `<details class="item ${MP.classeDoTipo(c.tipo)}">
    <summary>
      <span class="cod">${c.codigo}</span>
      <span><span class="nome-item">${MP.esc(c.nome)}</span><span class="tipo-item">${MP.esc(c.tipo)}</span></span>
    </summary>
    <div class="corpo">
      ${linhasDaCarta(c).map(([rotulo, valor]) => `<p><b>${rotulo}:</b> ${MP.esc(valor)}</p>`).join('')}
      <details class="gabarito">
        <summary>Gabarito do professor</summary>
        ${c.tipo === 'Missão' ? gabaritoDaMissao(c) : gabaritoDaCarta(c)}
      </details>
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
    return simples(`${c.codigo} ${c.nome} ${c.texto || ''} ${c.prompt || ''}`).includes(termo);
  });

  // Código exato aparece primeiro e já aberto
  achadas.sort((a, b) => (b.codigo === codigo) - (a.codigo === codigo));
  $('#contagem').textContent = MP.plural(achadas.length, 'carta', 'cartas');
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
