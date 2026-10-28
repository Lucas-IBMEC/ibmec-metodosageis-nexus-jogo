// Respostas simuladas da IA (história 2.2.2). O app não usa IA de verdade:
// são exemplos prontos para o professor mostrar à turma o efeito de cada combo.

const RESPOSTAS = {
  // Resposta boa: o combo cumpriu a missão, no formato que ela pede
  boas: {
    M01: '• A dengue é uma doença causada por um vírus.\n• O vírus passa pela picada do mosquito Aedes aegypti.\n• Para se proteger, não deixe água parada em vasos, pneus e garrafas.',
    M02: '1. Uma vez por semana, olhe o quintal e a casa.\n2. Vire garrafas e baldes de boca para baixo.\n3. Coloque areia nos pratinhos dos vasos.\n4. Deixe a caixa-d\'água sempre tampada.',
    M03: 'A gripe é causada por um vírus. Quando a pessoa doente tosse ou espirra, gotinhas com o vírus vão para o ar e para as mãos, e quem está perto pode pegar.',
    M04: '1. Caminhe por 2 minutos.\n2. Gire os braços e os tornozelos devagar.\n3. Faça 10 polichinelos.\n4. Corra leve por 2 minutos.\nSentiu dor? Pare e avise o professor.',
    M05: 'O que é impedimento no futebol?\nÉ quando o atacante está mais perto do gol do que o último defensor na hora do passe. Aí o juiz para o lance.',
    M06: 'Esporte | Jogadores | Precisa de\nFutebol | 11 por time | bola e campo\nVôlei | 6 por time | bola e rede\nBasquete | 5 por time | bola e cesta',
    M07: '1. Pense numa frase fácil de lembrar, como "MeuGatoComePeixe".\n2. Junte um número e um símbolo: MeuGatoComePeixe#27.\n3. Use uma senha diferente em cada aplicativo.\n4. Nunca conte a senha para ninguém.',
    M08: '• Desconfie de prêmio que chega do nada.\n• Nunca passe senha ou código por mensagem.\n• Antes de clicar num link estranho, pergunte a um adulto.',
    M09: 'Aparelho | Bom para | Cuidado\nCelular | pesquisar rápido | a tela pequena distrai\nComputador | escrever trabalhos | precisa de mesa e tomada',
    M10: '1. Coloque 3 lixeiras: papel, plástico e resto.\n2. Faça um cartaz com o que vai em cada uma.\n3. Cada turma cuida das lixeiras por uma semana.\n4. Leve o reciclável para a cooperativa do bairro.',
    M11: 'Queimada é quando o fogo destrói uma floresta ou um campo. A fumaça faz mal para a saúde, e o fogo mata plantas e animais.',
    M12: 'Poluição do rio\n├ Lixo jogado na rua\n├ Esgoto sem tratamento\n└ Fábricas que soltam resíduos',
    M13: 'Dia | Lanche\nSegunda | fruta e pão integral\nTerça | iogurte e banana\nQuarta | sanduíche de queijo e suco natural\nQuinta | milho cozido\nSexta | salada de frutas',
    M14: 'BEBA ÁGUA!\nSeu corpo é quase todo água.\nLeve sua garrafinha para a aula.\nBeba um pouco em cada intervalo.',
    M15: '1. Forme times misturados, sorteando os nomes.\n2. Todo mundo toca na bola antes de o ponto valer.\n3. Quem erra continua jogando: ninguém fica de fora.\n4. No fim, cada time diz uma coisa boa do outro.',
    M16: '1891: James Naismith inventa o basquete nos EUA.\n1936: o basquete entra nas Olimpíadas.\n1959: o Brasil é campeão mundial pela primeira vez.\nHoje: é jogado em quase todos os países.',
    M17: '• Veja quem publicou a notícia.\n• Procure a mesma notícia num site confiável.\n• Desconfie de título que dá muito medo ou raiva.\n• Olhe a data: pode ser notícia velha.',
    M18: 'Anos 1990: internet discada, lenta e cara.\nAnos 2000: banda larga e os primeiros sites de vídeo.\nAnos 2010: internet no celular em quase todo lugar.\nHoje: aulas, compras e conversas pelo celular.',
    M19: 'O PLANETA ESTÁ ESQUENTANDO\nA fumaça de carros e fábricas prende o calor no ar.\nIsso traz mais secas, enchentes e calor forte.\nAjude: ande a pé ou de bicicleta e economize energia.',
    M20: '1. Apague a luz ao sair da sala.\n2. Feche bem as torneiras e avise se alguma pingar.\n3. Desligue o ventilador e o computador no fim da aula.\n4. Abra as cortinas e use a luz do dia.',
  },

  // O que acontece com a resposta quando falta uma peça do prompt
  falhas: {
    combo: {
      titulo: 'Combo incompleto',
      texto: 'Sem contexto e instrução, a IA não sabe o que fazer:\n"Desculpe, não entendi o que você precisa. Pode explicar melhor?"',
    },
    contexto: {
      titulo: 'Sem o contexto certo',
      texto: 'A IA não sabe de onde você fala nem qual é a situação. A resposta fica genérica:\n"Existem muitos fatores envolvidos neste tema. É importante considerar diversos aspectos antes de tomar uma decisão."',
    },
    dnc: {
      titulo: 'Sem dizer o que a pessoa precisa',
      texto: 'Sem a dor, a necessidade ou o conceito, a IA responde como uma enciclopédia e não foca no que interessa a quem vai ler:\n"Este é um tema amplo, estudado há muitos anos, com várias definições e classificações..."',
    },
    formato: {
      titulo: 'Formato errado',
      texto: 'Sem dizer o formato, a resposta veio num textão corrido, difícil para quem vai ler:\n"Para tratar deste assunto é preciso considerar que existem diversos pontos importantes que devem ser observados com atenção em diferentes situações do dia a dia, levando em conta..."',
    },
    'Dado pessoal': {
      titulo: 'Dado pessoal no prompt',
      texto: 'A IA repetiu o dado pessoal na resposta. Agora ele aparece no texto e pode vazar:\n',
    },
    'Viés': {
      titulo: 'Preconceito no prompt',
      texto: 'A IA repetiu o preconceito da carta e deixou pessoas de fora:\n',
    },
  },
};
