// Funções usadas por todas as páginas do companion app.
// Tudo fica no objeto MP para não misturar com o código de cada página.

const MP = (() => {
  // Ícones do menu (desenhados em SVG para funcionar sem internet)
  const ICONES = {
    partida: '<path d="M12 8v5l3 2"/><circle cx="12" cy="13" r="8"/><path d="M9 2h6"/>',
    missao: '<path d="M4 4h16v16H4z"/><path d="m8 12 3 3 5-6"/>',
    denuncia: '<path d="M5 21V4"/><path d="M5 4h11l-2 4 2 4H5"/>',
    cartas: '<rect x="3" y="5" width="12" height="16" rx="2"/><path d="M9 3h10a2 2 0 0 1 2 2v12"/>',
    regras: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M8 7h7M8 11h7"/>',
  };

  const PAGINAS = [
    { id: 'partida', arquivo: 'index.html', nome: 'Partida' },
    { id: 'missao', arquivo: 'missao.html', nome: 'Missão' },
    { id: 'denuncia', arquivo: 'denuncia.html', nome: 'Denúncia' },
    { id: 'cartas', arquivo: 'cartas.html', nome: 'Cartas' },
    { id: 'regras', arquivo: 'regras.html', nome: 'Regras' },
  ];

  // Classe de cor de cada tipo de carta (mesmas cores das cartas impressas)
  const CLASSE_DO_TIPO = {
    'Missão': 't-missao', Persona: 't-persona', Contexto: 't-contexto',
    Dor: 't-dnc', Necessidade: 't-dnc', Conceito: 't-dnc',
    'Precisão': 't-precisao', Formato: 't-formato', Documento: 't-documento',
    'Ética': 't-etica', 'Nação': 't-nacao',
  };

  function montarMenu() {
    const atual = document.body.dataset.pagina;
    const menu = document.getElementById('menu');
    menu.innerHTML = PAGINAS.map((p) => `
      <a href="${p.arquivo}" ${p.id === atual ? 'aria-current="page"' : ''}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONES[p.id]}</svg>
        ${p.nome}
      </a>`).join('');
  }

  // Evita que um texto vire HTML sem querer
  function esc(texto) {
    return String(texto ?? '').replace(/[&<>"']/g, (c) => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  // Aceita "c1", "C01", "dc 3", "p 12" e devolve o código certo ("C01", "DC3", "P12")
  function normalizarCodigo(texto) {
    const m = String(texto).toUpperCase().replace(/\s+/g, '').match(/^([A-Z]+)0*(\d+)$/);
    if (!m) return '';
    const [, letras, numero] = m;
    const comDoisDigitos = ['M', 'C', 'D', 'P', 'F', 'E'];
    return letras + (comDoisDigitos.includes(letras) ? numero.padStart(2, '0') : numero);
  }

  function buscarCarta(codigo) {
    return DADOS.porCodigo[normalizarCodigo(codigo)] || null;
  }

  function classeDoTipo(tipo) {
    return CLASSE_DO_TIPO[tipo] || '';
  }

  // Guarda dados no próprio celular (a partida continua mesmo trocando de página)
  function ler(chave, padrao) {
    try {
      const valor = localStorage.getItem(chave);
      return valor ? JSON.parse(valor) : padrao;
    } catch (erro) {
      return padrao;
    }
  }

  function salvar(chave, valor) {
    try {
      localStorage.setItem(chave, JSON.stringify(valor));
    } catch (erro) {
      // Sem espaço ou navegação privada: o app continua, só não guarda
    }
  }

  function apagar(chave) {
    try {
      localStorage.removeItem(chave);
    } catch (erro) {
      // Sem acesso ao armazenamento: nada a apagar
    }
  }

  // "1 ponto", "2 pontos"
  function plural(n, umNome, variosNomes) {
    return `${n} ${n === 1 ? umNome : variosNomes}`;
  }

  // Partidas salvas antes do pacote E contavam missões; agora o placar conta pontos
  function lerPartida() {
    const partida = ler('mp-partida', null);
    partida?.lados.forEach((lado) => {
      if (lado.pontos === undefined) lado.pontos = lado.missoes || 0;
      delete lado.missoes;
      lado.poderesNoTurno = lado.poderesNoTurno || {};
    });
    return partida;
  }

  function salvarPartida(partida) {
    salvar('mp-partida', partida);
  }

  let tempoDoAviso;
  function aviso(mensagem) {
    let toast = document.querySelector('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      toast.setAttribute('role', 'status');
      document.body.appendChild(toast);
    }
    toast.textContent = mensagem;
    toast.classList.add('visivel');
    clearTimeout(tempoDoAviso);
    tempoDoAviso = setTimeout(() => toast.classList.remove('visivel'), 2400);
  }

  // Campo de código: o professor toca na letra do tipo e digita só o número
  function entradaDeCodigo(container, { prefixos, inicial, aoAdicionar, rotuloBotao = 'Adicionar' }) {
    let prefixo = inicial || prefixos[0];
    container.innerHTML = `
      <div class="prefixos" role="group" aria-label="Tipo da carta">
        ${prefixos.map((p) => `<button type="button" class="chip" data-prefixo="${p}"
          aria-pressed="${p === prefixo}">${p}</button>`).join('')}
      </div>
      <form class="linha" novalidate>
        <input class="campo" name="numero" inputmode="numeric" pattern="[0-9]*"
          autocomplete="off" enterkeyhint="done" aria-label="Número da carta" placeholder="Número, ex.: 1">
        <button class="botao" type="submit">${rotuloBotao}</button>
      </form>
      <p class="dica">Também pode digitar o código inteiro, como C01 ou DC3.</p>`;

    const campo = container.querySelector('input');
    container.querySelectorAll('[data-prefixo]').forEach((botao) => {
      botao.addEventListener('click', () => {
        prefixo = botao.dataset.prefixo;
        container.querySelectorAll('[data-prefixo]').forEach((b) => {
          b.setAttribute('aria-pressed', String(b === botao));
        });
        campo.focus();
      });
    });

    container.querySelector('form').addEventListener('submit', (evento) => {
      evento.preventDefault();
      const digitado = campo.value.trim();
      if (!digitado) return;
      const codigo = /^\d+$/.test(digitado) ? normalizarCodigo(prefixo + digitado) : normalizarCodigo(digitado);
      const carta = DADOS.porCodigo[codigo];
      if (!carta) {
        aviso(`Não existe carta ${codigo || digitado}`);
        return;
      }
      campo.value = '';
      aoAdicionar(carta);
    });
  }

  function chipDeCarta(carta, { removivel } = {}) {
    return `<span class="chip carta ${classeDoTipo(carta.tipo)}">
      <span class="cod">${carta.codigo}</span>${esc(carta.nome)}
      ${removivel ? `<button type="button" class="x" data-remover="${carta.codigo}"
        aria-label="Tirar ${carta.codigo}">×</button>` : ''}
    </span>`;
  }

  // Funciona sem internet depois da primeira visita (só em http/https, não em file://)
  function registrarOffline() {
    try {
      if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
        navigator.serviceWorker.register('sw.js').catch(() => {});
      }
    } catch (erro) {
      // Alguns lugares (como uma página dentro de outra) não deixam: o app funciona igual, só precisa de internet
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    montarMenu();
    registrarOffline();
  });

  return {
    esc, normalizarCodigo, buscarCarta, classeDoTipo, ler, salvar, apagar, plural,
    lerPartida, salvarPartida, aviso, entradaDeCodigo, chipDeCarta,
  };
})();
