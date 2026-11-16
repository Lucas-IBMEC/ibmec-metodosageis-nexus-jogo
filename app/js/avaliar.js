// Nota do prompt escrito no desafio final, sem internet.
// O professor digita o prompt de cada lado. O aplicativo procura as 3 partes do modelo das cartas
// (persona, contexto e formato) e dá a cada uma uma nota de 1 a 4, olhando os mesmos 4 assuntos das cartas
// (saúde, esporte, tecnologia e meio ambiente). A nota do prompt é a média das 3, como nas rodadas.
// Não usa internet nem IA: procura palavras. Por isso o porquê de cada nota aparece na tela,
// e a palavra final é sempre do professor.
// Funciona no navegador (AVALIAR) e no Node (para o teste automático).

const AVALIAR = (() => {
  // Sem acento e em minúsculas: "Saúde" vira "saude"
  const limpar = (texto) => String(texto || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

  // Acha o começo de palavra: "recicl" acha "reciclar" e "reciclagem", mas "rua" não acha "crua"
  const acha = (texto, raizes) => raizes.filter((raiz) => new RegExp(`(^|[^a-z0-9])${raiz}`).test(texto));

  const NOMES = { S: 'saúde', E: 'esporte', T: 'tecnologia', A: 'meio ambiente' };
  const ORDEM = ['S', 'E', 'T', 'A'];

  // Palavras de cada assunto: profissões e coisas do assunto
  const DO_ASSUNTO = {
    S: ['saude', 'medic', 'enfermeir', 'nutricion', 'dentista', 'fisioterap', 'psicolog', 'pediatr', 'cardiolog',
      'farmac', 'socorr', 'bombeir', 'doenc', 'doent', 'hidrat', 'agua', 'beber', 'bebe', 'sede', 'corpo', 'coracao',
      'aliment', 'lanche', 'comida', 'machuc', 'lesao', 'lesoes', 'ferid', 'vacina', 'dengue', 'gripe', 'passar mal', 'passam mal'],
    E: ['esport', 'educacao fisica', 'treinador', 'atleta', 'jogador', 'personal', 'juiz', 'juiza', 'arbitr',
      'campeonato', 'torneio', 'corrid', 'futebol', 'futsal', 'volei', 'basquete', 'handebol', 'natac', 'quadra',
      'treino', 'exercicio', 'aquec', 'time', 'partida', 'olimpi', 'competic'],
    T: ['tecnolog', 'program', 'informatica', 'computador', 'aplicativo', 'celular', 'internet', 'site',
      'desenvolvedor', 'engenheiro de software', 'engenheira de software', 'robo', 'digital', 'tela', 'mouse',
      'teclado', 'software', 'tablet', 'youtuber', 'notebook', 'senha', 'lembrete', 'alarme'],
    A: ['ambient', 'biolog', 'ecolog', 'jardin', 'agronom', 'agricult', 'recicl', 'natureza', 'florest', 'botanic',
      'lixo', 'lixeira', 'limpeza', 'gari', 'catador', 'horta', 'planta', 'rega', 'arvore', 'sustent', 'poluic',
      'compost', 'sujeir', 'sujo', 'suja'],
  };

  // Quem trabalha na escola conhece o problema, mesmo sem ser especialista no assunto
  const DA_ESCOLA = ['diretor', 'coordenador', 'professor', 'inspetor', 'merendeir', 'cantineir', 'zelador',
    'secretari', 'monitor', 'bibliotecari', 'pedagog', 'orientador'];

  // Os problemas da escola: cada um tem os assuntos que pede, como as missões, e as palavras do problema
  const PROBLEMAS = [
    { texto: 'Muitos alunos esquecem de beber água na aula de Educação Física.', assuntos: ['S', 'E'],
      palavras: ['agua', 'beber', 'bebe', 'sede', 'hidrat', 'garrafa', 'esquec', 'calor', 'educacao fisica'] },
    { texto: 'A quadra fica cheia de lixo depois do recreio.', assuntos: ['A', 'E'],
      palavras: ['lixo', 'lixeira', 'quadra', 'recreio', 'sujeir', 'sujo', 'suja', 'limp', 'recicl', 'embalag'] },
    { texto: 'Os alunos não sabem usar os computadores da sala de informática.', assuntos: ['T'],
      palavras: ['computador', 'informatica', 'usar', 'aprend', 'mouse', 'teclado', 'internet', 'programa', 'ligar', 'senha'] },
    { texto: 'A turma quer fazer um campeonato no recreio sem ninguém se machucar.', assuntos: ['E', 'S'],
      palavras: ['campeonato', 'torneio', 'jogo', 'partida', 'time', 'recreio', 'machuc', 'lesao', 'seguranc', 'cuidado'] },
    { texto: 'A horta da escola está secando porque ninguém lembra de regar.', assuntos: ['A'],
      palavras: ['horta', 'rega', 'planta', 'secando', 'seca', 'agua', 'lembr', 'verdura', 'muda'] },
  ];

  // ---------- As partes do prompt ----------

  // "Você é professora de Educação Física" -> persona "professora de educacao fisica"
  const PERSONA = /^(?:persona\s*:\s*)?(?:voce (?:e|sera|vai ser|agora e)|aja como|atue como|seja|finja (?:que (?:voce )?e|ser)|imagine que voce e|faca de conta que voce e|eu quero que voce seja|quero que voce seja)\s+(.+)$/;
  const ROTULO = /^(persona|contexto|tarefa|formato)\s*:\s*(.*)$/;
  const PEDIDO_DE_FORMATO = /(^|[^a-z])(responda|responde|resposta|formato|em forma de|organize em|apresente em|mostre em|entregue em)([^a-z]|$)/;
  const TAREFA = /^(?:por favor,?\s+)?(?:me\s+)?(crie|cria|faca|faz|escreva|escreve|monte|monta|explique|explica|sugira|planeje|ajude|ajuda|liste|organize|invente|mostre|ensine|diga|prepare|elabore|proponha|descreva|conte|resuma|desenhe|de ideias|de dicas|quero que|preciso que|gostaria que|pense)\b/;

  // Formas claras de resposta (como nas cartas de formato)
  const FORMAS = ['lista', 'topico', 'passo a passo', 'passos', 'etapas', 'tabela', 'cartaz', 'mural', 'quadrinho', 'tirinha',
    'resumo', 'mensagem', 'aviso', 'alerta', 'grafico', 'mapa', 'cardapio', 'folheto', 'panfleto', 'linha do tempo',
    'pergunta e resposta', 'perguntas e respostas', 'ficha', 'roteiro', 'poema', 'musica', 'video', 'apresentacao',
    'slide', 'desenho', 'calendario', 'cronograma', 'checklist', 'bilhete', 'e-mail', 'email', 'placar', 'quiz',
    'jogo de perguntas', 'infografico', 'podcast', 'tutorial', 'manual', 'regras', 'dicas', 'itens', 'frases curtas'];
  const VAGO = ['texto', 'qualquer', 'do jeito que quiser', 'como quiser'];
  const LONGO = ['longo', 'longa', 'grande', 'redacao', 'muitas paginas', 'bastante texto'];
  const NUMERO = '(?:\\d+|dois|duas|tres|quatro|cinco|seis|sete|oito|nove|dez)';
  const DETALHE_DO_FORMATO = [
    new RegExp(`${NUMERO}\\s+(?:passos|itens|topicos|frases|linhas|dicas|etapas|regras|perguntas|quadrinhos|partes|palavras|minutos|colunas)`),
    /(^|[^a-z])(curt|simples|pequen|facil de|letra grande|com desenho|com imagens|com emoji|para (?:os|as|o|a) (?:alunos|alunas|criancas|turma|turmas|professor|professora|diretor|diretora|pais|familias|colegas|jogadores)|para cada|por dia|por semana)/,
  ];

  // Contexto: onde é, o que está acontecendo e um detalhe
  const LUGARES = ['escola', 'colegio', 'sala', 'aula', 'turma', 'recreio', 'intervalo', 'quadra', 'patio', 'cantina',
    'refeitorio', 'biblioteca', 'laboratorio', 'horta', 'jardim', 'banheiro', 'corredor', 'bairro', 'cidade', 'parque',
    'rua', 'casa', 'ginasio', 'informatica', 'nossa', 'nosso', 'aqui'];
  const DETALHE_DO_CONTEXTO = [
    /\d/,
    /(^|[^a-z])(dois|duas|tres|quatro|cinco|dez|vinte|metade|muitos|muitas|varios|varias|todos|todas|todo dia|toda semana|sempre|nunca|ninguem|maioria|porque|por isso|entao|fica|ficam|acaba|acabam|sem |passam mal|causa|depois|quase)/,
  ];

  // Divide o prompt em frases e diz de que parte é cada uma
  function partesDoPrompt(prompt) {
    const frases = limpar(prompt).split(/[.!?;\n]+/).map((f) => f.replace(/^[^a-z0-9]+/, '').trim()).filter(Boolean);
    const partes = { persona: [], contexto: [], tarefa: [], formato: [] };
    frases.forEach((frase) => {
      const rotulo = frase.match(ROTULO);
      if (rotulo) {
        if (rotulo[2]) partes[rotulo[1]].push(rotulo[1] === 'persona' ? rotulo[2].replace(PERSONA, '$1') : rotulo[2]);
        return;
      }
      const persona = frase.match(PERSONA);
      if (persona) { partes.persona.push(persona[1]); return; }
      const formaNaFrase = acha(frase, FORMAS).length > 0;
      if (TAREFA.test(frase)) {
        partes.tarefa.push(frase);
        if (formaNaFrase || PEDIDO_DE_FORMATO.test(frase)) partes.formato.push(frase);
        return;
      }
      if (PEDIDO_DE_FORMATO.test(frase)) { partes.formato.push(frase); return; }
      partes.contexto.push(frase);
    });
    return partes;
  }

  // ["a", "b", "c"] vira "a, b e c"
  const juntar = (itens) => (itens.length <= 1 ? itens.join('') : `${itens.slice(0, -1).join(', ')} e ${itens[itens.length - 1]}`);
  const lista = (codigos) => juntar(codigos.map((a) => NOMES[a]));

  // ---------- A nota de cada parte ----------

  function notaDaPersona(trechos, problema) {
    if (!trechos.length) return { nota: 1, porque: 'Faltou a persona: comece com “Você é…”.' };
    const texto = trechos.join(' ');
    const entende = problema.assuntos.filter((a) => acha(texto, DO_ASSUNTO[a]).length);
    const daEscola = acha(texto, DA_ESCOLA).length > 0;
    const falta = problema.assuntos.filter((a) => !entende.includes(a));
    const precisa = Math.min(2, problema.assuntos.length);
    if (entende.length >= precisa || (entende.length && daEscola)) {
      return { nota: 4, porque: `${daEscola ? 'Conhece a escola e entende' : 'Entende'} de ${lista(entende)}.` };
    }
    if (entende.length) return { nota: 3, porque: `Entende de ${lista(entende)}, mas o problema também fala de ${lista(falta)}.` };
    const nemEm = problema.assuntos.map((a) => NOMES[a]).join(' nem em ');
    if (daEscola) return { nota: 3, porque: `Conhece a escola, mas não é especialista em ${nemEm}.` };
    return { nota: 2, porque: `Não é especialista em ${nemEm}.` };
  }

  function notaDoContexto(trechos, problema) {
    if (!trechos.length) return { nota: 1, porque: 'Faltou o contexto: diga onde é e o que está acontecendo.' };
    const texto = trechos.join(' ');
    const onde = acha(texto, LUGARES).length > 0;
    const oQue = acha(texto, problema.palavras).length > 0
      || problema.assuntos.some((a) => acha(texto, DO_ASSUNTO[a]).length);
    const detalhe = DETALHE_DO_CONTEXTO.some((r) => r.test(texto));
    const tem = [onde, oQue, detalhe].filter(Boolean).length;
    if (tem === 3) return { nota: 4, porque: 'Diz onde é, qual é o problema e um detalhe.' };
    const falta = [];
    if (!onde) falta.push('onde é');
    if (!oQue) falta.push('qual é o problema');
    if (!detalhe) falta.push('um detalhe (quantos? o que acontece por causa disso?)');
    return { nota: tem === 2 ? 3 : 2, porque: `Falta dizer ${juntar(falta)}.` };
  }

  function notaDoFormato(trechos) {
    if (!trechos.length) return { nota: 1, porque: 'Faltou o formato: diga como a resposta deve chegar (“Responda em formato de lista…”).' };
    const texto = trechos.join(' ');
    const formas = acha(texto, FORMAS);
    if (acha(texto, LONGO).length) return { nota: 2, porque: 'Texto longo cansa quem vai ler: peça uma forma curta e clara.' };
    if (!formas.length) {
      return { nota: 2, porque: acha(texto, VAGO).length
        ? 'Só “texto” não diz a forma: peça uma lista, um cartaz, um passo a passo…'
        : 'Não diz uma forma clara: lista, cartaz, passo a passo, tabela…' };
    }
    const forma = formas[0].replace('topico', 'tópicos');
    if (DETALHE_DO_FORMATO.some((r) => r.test(texto))) return { nota: 4, porque: `Forma clara (${forma}) e com detalhe: quantos itens ou para quem.` };
    return { nota: 3, porque: `Forma clara (${forma}). Falta um detalhe: quantos itens? para quem?` };
  }

  // ---------- A nota do prompt ----------

  function avaliar(prompt, problema) {
    const partes = partesDoPrompt(prompt);
    const notas = {
      persona: notaDaPersona(partes.persona, problema),
      contexto: notaDoContexto(partes.contexto, problema),
      formato: notaDoFormato(partes.formato),
    };
    const media = (notas.persona.nota + notas.contexto.nota + notas.formato.nota) / 3;
    const todas = Object.values(notas).every((p) => p.nota > 1);
    const frases = limpar(prompt).split(/[.!?;\n]+/).filter((f) => f.trim()).length;
    const palavras = limpar(prompt).split(/\s+/).filter(Boolean).length;
    return {
      notas,
      media,
      temTarefa: partes.tarefa.length > 0,
      // Tudo numa frase só: o aplicativo lê uma frase de cada vez, então pode não achar as partes
      semPonto: frases === 1 && palavras > 10,
      // Aprendeu: tem as 3 partes e a nota é Bom ou Ótimo (3 ou mais), como nas rodadas
      aprendeu: todas && media >= 3,
    };
  }

  return { PROBLEMAS, NOMES, ORDEM, avaliar, partesDoPrompt, limpar };
})();

if (typeof module !== 'undefined') module.exports = AVALIAR;
