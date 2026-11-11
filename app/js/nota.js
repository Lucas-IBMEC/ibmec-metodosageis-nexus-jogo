// A nota do prompt (histórias 2.1.1 e 2.1.2).
// Cada carta combina de 1 a 4 com cada assunto (4 = combina muito, 1 = não combina). Os números ficam escondidos:
// só o aplicativo e o gabarito do professor mostram.
// Nota da carta: a média dos 3 assuntos da missão. Nota do prompt: a média das 3 cartas, de 1 a 4.
// Para comparar os prompts (e achar empates), usa a soma dos 9 números, que é sempre um número inteiro.
// O mesmo arquivo serve ao gerador das cartas (node), para o gabarito impresso dar a mesma nota que o aplicativo.

const NOTA = (() => {
  // Como cada tipo de carta "fala" de um assunto, do 4 ao 1
  const PALAVRAS = {
    Contexto: { 4: 'tem tudo a ver com', 3: 'tem muito a ver com', 2: 'tem pouco a ver com', 1: 'não tem nada a ver com' },
    Persona: { 4: 'entende muito de', 3: 'entende bem de', 2: 'entende pouco de', 1: 'não entende de' },
    Formato: { 4: 'é ótimo para falar de', 3: 'funciona bem para falar de', 2: 'ajuda pouco a falar de', 1: 'não ajuda a falar de' },
  };
  const ARTIGO = { Contexto: 'o contexto', Persona: 'a persona', Formato: 'o formato' };
  const NIVEIS = [[3.5, 'Ótimo'], [3, 'Bom'], [2.5, 'Médio'], [0, 'Fraco']];

  function somaDaCarta(carta, assuntos) {
    return assuntos.reduce((total, a) => total + carta.combina[a], 0);
  }

  function somaDoPrompt(cartas, assuntos) {
    return cartas.reduce((total, carta) => total + somaDaCarta(carta, assuntos), 0);
  }

  function mediaDaCarta(carta, assuntos) {
    return somaDaCarta(carta, assuntos) / assuntos.length;
  }

  function mediaDoPrompt(cartas, assuntos) {
    return somaDoPrompt(cartas, assuntos) / (cartas.length * assuntos.length);
  }

  // 3.666 vira "3,7"
  function numero(valor) {
    return valor.toFixed(1).replace('.', ',');
  }

  function nivel(media) {
    return NIVEIS.find(([minimo]) => media >= minimo)[1];
  }

  // ['saúde', 'esporte', 'tecnologia'] vira "saúde, esporte e tecnologia"
  function juntar(lista, ultimo = ' e ') {
    if (lista.length < 2) return lista[0] || '';
    return `${lista.slice(0, -1).join(', ')}${ultimo}${lista[lista.length - 1]}`;
  }

  // Os assuntos da missão agrupados pelo número da carta, do 4 ao 1: [{ valor: 4, assuntos: ['S', 'E'] }, ...]
  function grupos(carta, assuntos) {
    return [4, 3, 2, 1]
      .map((valor) => ({ valor, assuntos: assuntos.filter((a) => carta.combina[a] === valor) }))
      .filter((grupo) => grupo.assuntos.length);
  }

  // "Entende muito de saúde e esporte, mas não entende de tecnologia."
  function frase(carta, assuntos, nomes) {
    const parte = (grupo) => `${PALAVRAS[carta.tipo][grupo.valor]} ${juntar(grupo.assuntos.map((a) => nomes[a]))}`;
    const lista = grupos(carta, assuntos);
    const bons = lista.filter((g) => g.valor >= 3).map(parte);
    const ruins = lista.filter((g) => g.valor <= 2).map(parte);
    let texto = bons.join(', ');
    if (ruins.length) texto = bons.length ? `${texto}, mas ${ruins.join(' e ')}` : ruins.join(' e ');
    return `${texto.charAt(0).toUpperCase()}${texto.slice(1)}.`;
  }

  // O que fez o prompt perder pontos: as cartas com 1 ou 2 num assunto da missão, do pior para o menos ruim
  function problemas(cartas, assuntos) {
    const lista = [];
    cartas.forEach((carta) => {
      grupos(carta, assuntos).filter((g) => g.valor <= 2).forEach((g) => {
        lista.push({ carta, valor: g.valor, assuntos: g.assuntos });
      });
    });
    return lista.sort((a, b) => a.valor - b.valor);
  }

  // "a persona P02 não entende de tecnologia"
  function fraseDoProblema(problema, nomes) {
    const { carta, valor, assuntos } = problema;
    return `${ARTIGO[carta.tipo]} ${carta.codigo} ${PALAVRAS[carta.tipo][valor]} ${juntar(assuntos.map((a) => nomes[a]))}`;
  }

  // As cartas de um baralho que mais combinam com os assuntos de uma missão (mais de uma, se empatar)
  function melhores(cartas, assuntos) {
    const maior = Math.max(...cartas.map((c) => somaDaCarta(c, assuntos)));
    return cartas.filter((c) => somaDaCarta(c, assuntos) === maior);
  }

  return {
    PALAVRAS, somaDaCarta, somaDoPrompt, mediaDaCarta, mediaDoPrompt, numero, nivel, juntar, frase,
    problemas, fraseDoProblema, melhores,
  };
})();

// No gerador das cartas (node), o mesmo arquivo vira um módulo
if (typeof module !== 'undefined') module.exports = NOTA;
