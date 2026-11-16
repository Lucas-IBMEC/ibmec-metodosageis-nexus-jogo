// Funções usadas por todas as páginas do aplicativo do professor.
// Tudo fica no objeto MP para não misturar com o código de cada página.

const MP = (() => {
  // Ícones do menu (desenhados em SVG para funcionar sem internet)
  const ICONES = {
    partida: '<path d="M12 8v5l3 2"/><circle cx="12" cy="13" r="8"/><path d="M9 2h6"/>',
    rodada: '<path d="M4 4h16v16H4z"/><path d="m8 12 3 3 5-6"/>',
    desafio: '<path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/>',
    cartas: '<rect x="3" y="5" width="12" height="16" rx="2"/><path d="M9 3h10a2 2 0 0 1 2 2v12"/>',
    regras: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M8 7h7M8 11h7"/>',
  };

  const PAGINAS = [
    { id: 'partida', arquivo: 'index.html', nome: 'Partida' },
    { id: 'rodada', arquivo: 'rodada.html', nome: 'Rodada' },
    { id: 'aprendeu', arquivo: 'aprendeu.html', nome: 'Desafio', icone: 'desafio' },
    { id: 'cartas', arquivo: 'cartas.html', nome: 'Cartas' },
    { id: 'regras', arquivo: 'regras.html', nome: 'Regras' },
  ];

  // Classe de cor de cada tipo de carta (mesmas cores das cartas impressas)
  const CLASSE_DO_TIPO = {
    'Missão': 't-missao', Contexto: 't-contexto', Persona: 't-persona', Formato: 't-formato',
  };

  // As 3 cartas do prompt, na ordem em que o professor digita
  const TIPOS = ['Contexto', 'Persona', 'Formato'];
  const LETRA = { 'Missão': 'M', Contexto: 'C', Persona: 'P', Formato: 'F' };

  const RODADAS = DADOS.rodadas || 5;
  const DURACAO_DA_VEZ = DADOS.duracaoDaVez || 60; // segundos

  // Partidas salvas com outro formato (como as da versão com estrelas) não são abertas
  const VERSAO_DA_PARTIDA = 3;

  // O nome de cada assunto no meio da frase ({ S: 'saúde', ... }), para as frases da nota
  const NOMES = Object.fromEntries(Object.entries(DADOS.assuntos).map(([letra, a]) => [letra, a.minusculo]));

  function montarMenu() {
    const atual = document.body.dataset.pagina;
    const menu = document.getElementById('menu');
    menu.innerHTML = PAGINAS.map((p) => `
      <a href="${p.arquivo}" ${p.id === atual ? 'aria-current="page"' : ''}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONES[p.icone || p.id]}</svg>
        ${p.nome}
      </a>`).join('');
  }

  // Evita que um texto vire HTML sem querer
  function esc(texto) {
    return String(texto ?? '').replace(/[&<>"']/g, (c) => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  // Aceita "c1", "C01", "p 2", "m4" e devolve o código certo ("C01", "P02", "M04")
  function normalizarCodigo(texto) {
    const m = String(texto).toUpperCase().replace(/\s+/g, '').match(/^([A-Z]+)0*(\d+)$/);
    if (!m) return '';
    const [, letras, numero] = m;
    return letras + numero.padStart(2, '0');
  }

  // A carta do tipo pedido com aquele número ("C" e "9" viram a carta C09), ou null
  function cartaPeloNumero(tipo, numero) {
    const digitos = String(numero ?? '').replace(/\D/g, '');
    if (!digitos) return null;
    const carta = DADOS.porCodigo[normalizarCodigo(LETRA[tipo] + digitos)];
    return carta && carta.tipo === tipo ? carta : null;
  }

  // Nome do assunto com o símbolo das cartas ("✚ Saúde")
  function comSimbolo(letra) {
    const assunto = DADOS.assuntos[letra];
    return assunto ? `${assunto.ico} ${assunto.nome}` : letra;
  }

  // "Lista curta (3 itens)" vira "Lista curta"
  function semParenteses(texto) {
    return String(texto).replace(/ \(.*\)$/, '');
  }

  function minuscula(texto) {
    return texto.charAt(0).toLowerCase() + texto.slice(1);
  }

  // O prompt que as cartas formam: persona, contexto, a tarefa da missão e o formato
  function textoDoPrompt(missao, contexto, persona, formato) {
    return [
      persona.prompt,
      contexto.texto,
      `Tarefa: ${minuscula(missao.nome)}`,
      `Responda em formato de ${minuscula(semParenteses(formato.nome))}.`,
    ].join('\n');
  }

  function classeDoTipo(tipo) {
    return CLASSE_DO_TIPO[tipo] || '';
  }

  // As cartas de um baralho que mais combinam com os assuntos de uma missão:
  // as de maior soma e as da segunda maior (até 3 cartas), com a soma de cada uma
  function melhoresCartas(tipo, assuntos) {
    const baralho = DADOS.cartas.filter((c) => c.tipo === tipo)
      .map((carta) => ({ carta, soma: NOTA.somaDaCarta(carta, assuntos) }))
      .sort((a, b) => b.soma - a.soma);
    const duasMaiores = [...new Set(baralho.map((b) => b.soma))].slice(0, 2);
    return baralho.filter((b) => duasMaiores.includes(b.soma)).slice(0, 3);
  }

  // A maior soma possível numa missão: a melhor carta de cada baralho (a nota mais alta é essa soma dividida por 9)
  function somaMaxima(assuntos) {
    return TIPOS.reduce((total, tipo) => total + melhoresCartas(tipo, assuntos)[0].soma, 0);
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
      // Sem espaço ou navegação privada: o aplicativo continua, só não guarda
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

  // "Ana", "Ana e Bia", "Ana, Bia e Caio"
  function juntar(nomes) {
    return NOTA.juntar(nomes);
  }

  // ---------- Partida ----------

  // A partida aberta no celular, ou null se não houver (ou se for de uma versão antiga do aplicativo)
  function lerPartida() {
    const partida = ler('mp-partida', null);
    if (!partida || partida.versao !== VERSAO_DA_PARTIDA || !Array.isArray(partida.lados)) return null;
    partida.historico = partida.historico || [];
    return partida;
  }

  function salvarPartida(partida) {
    salvar('mp-partida', partida);
  }

  // Na 1ª rodada começa o lado sorteado; em cada rodada seguinte, começa o próximo lado
  function quemComeca(partida, rodada = partida.rodada) {
    return (partida.primeiro + rodada - 1) % partida.lados.length;
  }

  // A ordem dos lados na rodada (posições em partida.lados)
  function ordemDaRodada(partida, rodada = partida.rodada) {
    const total = partida.lados.length;
    const comeca = quemComeca(partida, rodada);
    return Array.from({ length: total }, (_, i) => (comeca + i) % total);
  }

  // O ponto da rodada atual, se já foi dado
  function pontoDaRodada(partida) {
    return partida.historico.find((h) => h.rodada === partida.rodada) || null;
  }

  // A soma das notas de um lado, para mostrar ("6,9"): a soma guarda os números das cartas (9 a 36 por rodada)
  function somaDasNotas(lado) {
    return NOTA.numero(lado.soma / 9);
  }

  // Do mais pontos para o menos; empate nos pontos: quem somou as maiores notas
  function ranking(partida) {
    return [...partida.lados].sort((a, b) => b.pontos - a.pontos || b.soma - a.soma);
  }

  // Quem está na frente (mais de um, se empatar nos pontos e na soma)
  function naFrente(partida) {
    const [primeiro] = ranking(partida);
    return partida.lados.filter((l) => l.pontos === primeiro.pontos && l.soma === primeiro.soma);
  }

  // Quantas rodadas tem a partida: completa (5) ou rápida (3)
  function rodadasDa(partida) {
    return (partida && partida.rodadas) || RODADAS;
  }

  // Depois do ponto: começa a próxima rodada, ou a partida acaba depois da última
  function avancarRodada(partida) {
    if (partida.rodada >= rodadasDa(partida)) {
      partida.fase = 'fim';
    } else {
      partida.rodada += 1;
      partida.fase = 'escolhendo';
      partida.vez = 0;
    }
    partida.cronometro = { fim: null, restante: DURACAO_DA_VEZ, esgotou: false };
    salvarPartida(partida);
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

  // Funciona sem internet depois da primeira visita (só em http/https, não em file://)
  function registrarOffline() {
    try {
      if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
        navigator.serviceWorker.register('sw.js').catch(() => {});
      }
    } catch (erro) {
      // Alguns lugares (como uma página dentro de outra) não deixam: o aplicativo funciona igual, só precisa de internet
    }
  }

  // Os números da regra e o nome do jogo vêm de DADOS (<span data-dado="rodadas">),
  // assim o aplicativo e as cartas impressas sempre falam o mesmo número e o mesmo nome
  function preencherNumeros() {
    document.querySelectorAll('[data-dado]').forEach((el) => {
      if (DADOS[el.dataset.dado] !== undefined) el.textContent = DADOS[el.dataset.dado];
    });
    if (DADOS.nomeDoJogo) document.title = `${document.title} · ${DADOS.nomeDoJogo}`;
    // As cartas especiais também vêm de DADOS, com o mesmo nome e o mesmo poder das impressas
    const lista = document.getElementById('lista-especiais');
    if (lista && DADOS.especiais) {
      lista.innerHTML = DADOS.especiais.map((e) =>
        `<li><b>${e.ico} ${e.nome}</b> (${e.tipo.toLowerCase()}): ${e.poder.charAt(0).toLowerCase()}${e.poder.slice(1)}</li>`).join('');
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    montarMenu();
    preencherNumeros();
    registrarOffline();
  });

  return {
    TIPOS, LETRA, RODADAS, rodadasDa, DURACAO_DA_VEZ, VERSAO_DA_PARTIDA, NOMES,
    esc, normalizarCodigo, cartaPeloNumero, comSimbolo, semParenteses, minuscula, textoDoPrompt, classeDoTipo,
    melhoresCartas, somaMaxima, ler, salvar, apagar, plural, juntar, aviso,
    lerPartida, salvarPartida, quemComeca, ordemDaRodada, pontoDaRodada, somaDasNotas, ranking, naFrente, avancarRodada,
  };
})();
