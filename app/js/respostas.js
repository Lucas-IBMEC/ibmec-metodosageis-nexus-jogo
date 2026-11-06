// Respostas simuladas da IA (história 2.2.2). O app não usa IA de verdade:
// são exemplos prontos para o professor mostrar à turma o efeito de cada prompt.

const RESPOSTAS = {
  // Resposta boa (★★★): uma para cada formato que serve em cada missão
  boas: {
    M01: {
      F01: '• A dengue é uma doença causada por um vírus.\n• O vírus passa pela picada do mosquito Aedes aegypti.\n• Para se proteger, não deixe água parada em vasos, pneus e garrafas.',
      F03: 'A dengue é uma doença que o mosquito Aedes aegypti passa quando pica. Para se proteger, não deixe água parada, porque é nela que o mosquito nasce.',
      F08: '— Mãe, o que é dengue?\n— É uma doença que o mosquito passa quando pica.\n— E como eu fujo dela?\n— Sem água parada em casa: é ali que o mosquito nasce.',
    },
    M02: {
      F05: 'Dia | Lanche\nSegunda | fruta e pão integral\nTerça | iogurte e banana\nQuarta | sanduíche de queijo e suco natural\nQuinta | milho cozido\nSexta | salada de frutas',
      F07: 'LANCHE QUE DÁ ENERGIA\nTodo dia tem fruta no lanche.\nTroque o refrigerante por suco natural ou água.\nPão integral e iogurte seguram a fome até o almoço.',
    },
    M03: {
      F07: 'BEBA ÁGUA!\nSeu corpo é quase todo água.\nLeve sua garrafinha para a aula.\nBeba um pouco em cada intervalo.',
      F01: '• Leve uma garrafinha de água para a aula.\n• Beba um pouco em cada intervalo.\n• Com calor ou depois da Educação Física, beba mais.',
    },
    M04: {
      F02: '1. Caminhe por 2 minutos.\n2. Gire os braços e os tornozelos devagar.\n3. Faça 10 polichinelos.\n4. Corra leve por 2 minutos.\nSentiu dor? Pare e avise o professor.',
      F01: '• Caminhe 2 minutos para esquentar o corpo.\n• Gire braços e tornozelos devagar.\n• Corra leve 2 minutos antes de começar o jogo.',
    },
    M05: {
      F09: '1891: James Naismith inventa o basquete nos EUA.\n1936: o basquete entra nas Olimpíadas.\n1959: o Brasil é campeão mundial pela primeira vez.\nHoje: é jogado em quase todos os países.',
      F03: 'O basquete foi inventado em 1891, nos EUA, para os alunos jogarem no inverno dentro do ginásio. Hoje é jogado no mundo todo, e o Brasil já foi campeão mundial.',
    },
    M06: {
      F02: '1. Pense numa frase fácil de lembrar, como "MeuGatoComePeixe".\n2. Junte um número e um símbolo: MeuGatoComePeixe#27.\n3. Use uma senha diferente em cada aplicativo.\n4. Nunca conte a senha para ninguém.',
      F08: '— Vó, sua senha é a data do seu aniversário?\n— É, assim eu não esqueço.\n— Mas fica fácil de adivinhar. Vamos juntar uma frase, um número e um símbolo: MeuGatoComePeixe#27.\n— E eu uso essa em tudo?\n— Não: uma senha diferente para cada aplicativo.',
    },
    M07: {
      F01: '• Desconfie de prêmio que chega do nada.\n• Nunca passe senha ou código por mensagem.\n• Antes de clicar num link estranho, pergunte a um adulto.',
      F04: 'Ganhei um prêmio por mensagem. É verdade?\nQuase sempre é golpe: ninguém dá prêmio do nada.\nPosso passar o código que chegou no meu celular?\nNunca. Com esse código, roubam a sua conta.',
    },
    M08: {
      F09: 'Anos 1990: internet discada, lenta e cara.\nAnos 2000: banda larga e os primeiros sites de vídeo.\nAnos 2010: internet no celular em quase todo lugar.\nHoje: aulas, compras e conversas pelo celular.',
      F05: 'Época | Como era a internet\nAnos 1990 | discada, lenta e só no computador\nAnos 2000 | banda larga e os primeiros sites de vídeo\nHoje | no celular, em quase todo lugar',
    },
    M09: {
      F02: '1. Coloque 3 lixeiras: papel, plástico e resto.\n2. Faça um cartaz com o que vai em cada uma.\n3. Cada turma cuida das lixeiras por uma semana.\n4. Leve o reciclável para a cooperativa do bairro.',
      F06: 'Separar o lixo na escola\n├ Papel: folhas e caixas → lixeira azul\n├ Plástico: garrafas e copos → lixeira vermelha\n├ Resto do lanche → lixeira comum\n└ Quem cuida: cada turma, uma semana',
    },
    M10: {
      F07: 'O PLANETA ESTÁ ESQUENTANDO\nA fumaça de carros e fábricas prende o calor no ar.\nIsso traz mais secas, enchentes e calor forte.\nAjude: ande a pé ou de bicicleta e economize energia.',
      F06: 'Aquecimento global\n├ Causa: a fumaça de carros e fábricas prende o calor\n├ Efeitos: secas, enchentes e calor forte\n└ Como ajudar: andar a pé ou de bicicleta e economizar energia',
      F04: 'O que é o aquecimento global?\nÉ o planeta ficando mais quente.\nPor que acontece?\nA fumaça de carros e fábricas prende o calor no ar.\nComo posso ajudar?\nAndando a pé ou de bicicleta e economizando energia.',
    },
  },

  // O que acontece com a resposta quando uma peça do prompt não combina com a missão
  falhas: {
    contexto: {
      titulo: 'Contexto de outro assunto',
      texto: 'A IA não entende a situação da missão e responde de um jeito genérico:\n"Existem muitos fatores envolvidos neste tema. É importante considerar diversos aspectos antes de tomar uma decisão."',
    },
    persona: {
      titulo: 'Persona de outro assunto',
      texto: 'Quem responde não é da área, então erra os detalhes e o jeito de falar:\n"Não sou especialista nisso, mas acho que talvez seja mais ou menos assim..."',
    },
    formato: {
      titulo: 'Formato que não ajuda quem vai ler',
      texto: 'A resposta chega num formato difícil para quem vai ler, e a pessoa desiste no meio.',
    },
    falta: {
      titulo: 'Faltou carta',
      texto: 'Sem essa peça, o prompt fica incompleto e a IA chuta o que falta:\n"Vou supor algumas informações que você não deu e responder do meu jeito..."',
    },
  },
};
