// Dados das cartas do Palavra Mágica, versão "Rodadas" com as cartas abertas (16/11/2026): 57 cartas com código.
// Gerado por cartas/gerar.cjs, a mesma lista das cartas impressas. Para mudar uma carta, edite lá e rode node cartas/gerar.cjs.
// Missão: "assuntos" são os 3 assuntos dela (S Saúde, E Esporte, T Tecnologia, A Meio ambiente).
// Contexto, persona e formato: "combina" diz quanto a carta combina com cada assunto, de 1 (nada) a 4 (muito).
// Esses números ficam escondidos dos alunos: a conta da nota está em js/nota.js. "ico" é a imagem da carta.
const DADOS = {
  nomeDoJogo: "Palavra Mágica",
  cartas: [
    {"codigo":"M01","tipo":"Missão","nome":"Crie um aviso no celular para o time de futsal beber água no treino.","assuntos":["S","E","T"]},
    {"codigo":"M02","tipo":"Missão","nome":"Ensine os avós a usar um aplicativo que conta os passos da caminhada.","assuntos":["S","E","T"]},
    {"codigo":"M03","tipo":"Missão","nome":"Explique como um relógio que mede o coração ajuda um atleta a treinar sem se machucar.","assuntos":["S","E","T"]},
    {"codigo":"M04","tipo":"Missão","nome":"Planeje uma corrida no parque num dia de calor, sem ninguém passar mal e sem deixar lixo.","assuntos":["S","E","A"]},
    {"codigo":"M05","tipo":"Missão","nome":"Monte o cardápio do time da escola sem desperdiçar comida.","assuntos":["S","E","A"]},
    {"codigo":"M06","tipo":"Missão","nome":"Crie uma mensagem de celular para as famílias tirarem a água parada e fugirem da dengue.","assuntos":["S","T","A"]},
    {"codigo":"M07","tipo":"Missão","nome":"Explique como o celular avisa as pessoas antes de uma enchente, para ninguém se ferir.","assuntos":["S","T","A"]},
    {"codigo":"M08","tipo":"Missão","nome":"Mostre como um estádio pode usar a tecnologia para gastar menos água e energia.","assuntos":["E","T","A"]},
    {"codigo":"M09","tipo":"Missão","nome":"Organize uma gincana de reciclagem com o placar num telão da escola.","assuntos":["E","T","A"]},
    {"codigo":"C01","tipo":"Contexto","nome":"Relógio no campeonato","texto":"No campeonato de corrida da escola, cada aluno usa um relógio que mede os batimentos do coração.","ico":"⌚","combina":{"S":3,"E":4,"T":4,"A":1}},
    {"codigo":"C02","tipo":"Contexto","nome":"Vôlei com dor nas costas","texto":"O time de vôlei da escola tem muitos jogadores com dor nas costas.","ico":"🏐","combina":{"S":4,"E":4,"T":1,"A":1}},
    {"codigo":"C03","tipo":"Contexto","nome":"Campo perto do rio","texto":"O time do bairro treina num campo perto do rio, que vive cheio de lixo.","ico":"🏞️","combina":{"S":2,"E":4,"T":1,"A":4}},
    {"codigo":"C04","tipo":"Contexto","nome":"Feira de ciências","texto":"A escola vai fazer uma feira de ciências aberta para as famílias do bairro.","ico":"🔬","combina":{"S":3,"E":2,"T":3,"A":3}},
    {"codigo":"C05","tipo":"Contexto","nome":"Dengue depois da chuva","texto":"Em Recife, choveu muito, e a prefeitura quer usar o celular para avisar sobre a dengue.","ico":"🦟","combina":{"S":4,"E":1,"T":4,"A":3}},
    {"codigo":"C06","tipo":"Contexto","nome":"Gripe em Nova York","texto":"Num hospital de Nova York, muitas crianças chegam com gripe no inverno.","ico":"🤧","combina":{"S":4,"E":1,"T":1,"A":1}},
    {"codigo":"C07","tipo":"Contexto","nome":"Gincana de reciclagem em Seul","texto":"Em Seul, as turmas competem para ver quem recicla mais, e o placar aparece num telão.","ico":"♻️","combina":{"S":1,"E":3,"T":3,"A":4}},
    {"codigo":"C08","tipo":"Contexto","nome":"Celulares velhos na gaveta","texto":"Lá em casa há cinco celulares velhos numa gaveta, e ninguém sabe onde jogar.","ico":"📱","combina":{"S":1,"E":1,"T":4,"A":4}},
    {"codigo":"C09","tipo":"Contexto","nome":"Calor na corrida do Rio","texto":"No Rio de Janeiro, a corrida da escola vai ser no parque, num dia de calor forte.","ico":"🌡️","combina":{"S":4,"E":4,"T":1,"A":3}},
    {"codigo":"C10","tipo":"Contexto","nome":"Fumaça em Manaus","texto":"Em Manaus, a fumaça das queimadas está fazendo muitas crianças tossirem.","ico":"🔥","combina":{"S":4,"E":1,"T":1,"A":4}},
    {"codigo":"C11","tipo":"Contexto","nome":"Avós que caminham em Tóquio","texto":"Em Tóquio, muitos avós usam um aplicativo que conta os passos para caminhar todo dia.","ico":"👵","combina":{"S":4,"E":3,"T":3,"A":1}},
    {"codigo":"C12","tipo":"Contexto","nome":"Sábado na escola","texto":"No sábado, a escola abre para as famílias, com jogos na quadra, horta e lanche.","ico":"🏫","combina":{"S":3,"E":3,"T":2,"A":3}},
    {"codigo":"C13","tipo":"Contexto","nome":"Estádio verde em Copenhague","texto":"Em Copenhague, o estádio novo tem painéis solares e guarda a água da chuva para molhar o gramado.","ico":"🏟️","combina":{"S":1,"E":4,"T":3,"A":4}},
    {"codigo":"C14","tipo":"Contexto","nome":"Árbitro de vídeo","texto":"No campeonato da cidade, os jogos têm árbitro de vídeo e placar eletrônico.","ico":"📹","combina":{"S":1,"E":4,"T":4,"A":1}},
    {"codigo":"C15","tipo":"Contexto","nome":"Posto de saúde com sol","texto":"Em Fortaleza, o posto de saúde ganhou painéis solares no telhado.","ico":"🏥","combina":{"S":3,"E":1,"T":3,"A":4}},
    {"codigo":"C16","tipo":"Contexto","nome":"Vale do Silício","texto":"No Vale do Silício, as empresas criam aplicativos usados no mundo todo.","ico":"🏢","combina":{"S":1,"E":1,"T":4,"A":1}},
    {"codigo":"P01","tipo":"Persona","nome":"Criadora de aplicativos de exercício","texto":"Cria aplicativos que contam os passos e montam treinos.","prompt":"Você é criadora de aplicativos de exercício.","ico":"👩‍💻","combina":{"S":3,"E":4,"T":4,"A":1}},
    {"codigo":"P02","tipo":"Persona","nome":"Fisioterapeuta de um time","texto":"Cuida do corpo dos jogadores e ajuda quem se machucou a voltar a jogar.","prompt":"Você é fisioterapeuta de um time.","ico":"🦵","combina":{"S":4,"E":4,"T":1,"A":1}},
    {"codigo":"P03","tipo":"Persona","nome":"Professor de Educação Física","texto":"Dá aula no pátio e no parque, ensina a se aquecer e a se proteger do sol.","prompt":"Você é professor de Educação Física.","ico":"🤸","combina":{"S":3,"E":4,"T":1,"A":3}},
    {"codigo":"P04","tipo":"Persona","nome":"Jornalista de ciência","texto":"Escreve notícias sobre descobertas da ciência para todo mundo entender.","prompt":"Você é jornalista de ciência.","ico":"📰","combina":{"S":3,"E":2,"T":3,"A":3}},
    {"codigo":"P05","tipo":"Persona","nome":"Cientista que mapeia a dengue","texto":"Usa computadores e imagens de satélite para descobrir onde a dengue vai aparecer.","prompt":"Você é uma cientista que mapeia a dengue.","ico":"👩‍🔬","combina":{"S":4,"E":1,"T":4,"A":3}},
    {"codigo":"P06","tipo":"Persona","nome":"Médica do coração","texto":"Trabalha num grande hospital e opera o coração de quem está doente.","prompt":"Você é médica do coração.","ico":"🫀","combina":{"S":4,"E":2,"T":1,"A":1}},
    {"codigo":"P07","tipo":"Persona","nome":"Organizador de campeonatos de surfe","texto":"Escolhe o dia do campeonato pela previsão das ondas e cuida para a praia ficar limpa.","prompt":"Você é organizador de campeonatos de surfe.","ico":"🏄","combina":{"S":1,"E":4,"T":2,"A":4}},
    {"codigo":"P08","tipo":"Persona","nome":"Engenheira de energia solar","texto":"Instala painéis que transformam a luz do sol em energia para casas e escolas.","prompt":"Você é engenheira de energia solar.","ico":"👷‍♀️","combina":{"S":1,"E":1,"T":4,"A":4}},
    {"codigo":"P09","tipo":"Persona","nome":"Guia de trilhas","texto":"Leva grupos para caminhar na mata, cuida de quem se cansa e ensina a proteger a natureza.","prompt":"Você é guia de trilhas.","ico":"🥾","combina":{"S":3,"E":4,"T":1,"A":4}},
    {"codigo":"P10","tipo":"Persona","nome":"Enfermeiro na Amazônia","texto":"Cuida da saúde das famílias que vivem na floresta, longe da cidade.","prompt":"Você é enfermeiro na Amazônia.","ico":"👨‍⚕️","combina":{"S":4,"E":1,"T":1,"A":4}},
    {"codigo":"P11","tipo":"Persona","nome":"Técnica de futebol","texto":"Analisa os jogos no computador para montar o treino do time.","prompt":"Você é técnica de futebol.","ico":"🥅","combina":{"S":2,"E":4,"T":4,"A":1}},
    {"codigo":"P12","tipo":"Persona","nome":"Diretor da escola","texto":"Cuida da escola inteira: das aulas, da merenda, da quadra e do lixo.","prompt":"Você é diretor da escola.","ico":"🧑‍💼","combina":{"S":3,"E":3,"T":2,"A":3}},
    {"codigo":"P13","tipo":"Persona","nome":"Engenheiro de estádios","texto":"Projeta estádios com placar eletrônico, luzes que gastam pouca energia e reúso da água da chuva.","prompt":"Você é engenheiro de estádios.","ico":"🏗️","combina":{"S":1,"E":4,"T":4,"A":3}},
    {"codigo":"P14","tipo":"Persona","nome":"Narradora de jogos na internet","texto":"Narra os jogos ao vivo pela internet e mostra os números da partida na tela.","prompt":"Você é narradora de jogos na internet.","ico":"🎙️","combina":{"S":1,"E":4,"T":4,"A":1}},
    {"codigo":"P15","tipo":"Persona","nome":"Agente comunitária de saúde","texto":"Visita as casas do bairro, procura água parada e manda avisos de saúde pelo celular.","prompt":"Você é agente comunitária de saúde.","ico":"🏘️","combina":{"S":4,"E":1,"T":3,"A":3}},
    {"codigo":"P16","tipo":"Persona","nome":"Programador de banco","texto":"Escreve programas para os computadores de um banco.","prompt":"Você é programador de banco.","ico":"🏦","combina":{"S":1,"E":1,"T":4,"A":1}},
    {"codigo":"F01","tipo":"Formato","nome":"Tela de aplicativo","texto":"Como a tela de um aplicativo: a meta do dia, um botão e um aviso.","ico":"📲","combina":{"S":3,"E":4,"T":4,"A":1}},
    {"codigo":"F02","tipo":"Formato","nome":"Ficha de treino","texto":"Os exercícios do dia, o tempo de cada um e a pausa para beber água.","ico":"🏋️","combina":{"S":4,"E":4,"T":1,"A":1}},
    {"codigo":"F03","tipo":"Formato","nome":"Lista do que levar","texto":"Coisas para marcar antes de sair: água, protetor solar, boné e saco para o lixo.","ico":"🎒","combina":{"S":4,"E":3,"T":1,"A":3}},
    {"codigo":"F04","tipo":"Formato","nome":"Lista curta (3 itens)","texto":"3 tópicos curtos, um em cada linha.","ico":"📝","combina":{"S":3,"E":3,"T":3,"A":3}},
    {"codigo":"F05","tipo":"Formato","nome":"Alerta no celular","texto":"Uma mensagem curta e urgente que aparece na tela do celular.","ico":"🚨","combina":{"S":3,"E":1,"T":4,"A":4}},
    {"codigo":"F06","tipo":"Formato","nome":"Resumo em 2 frases","texto":"Só o mais importante, em 2 frases.","ico":"✂️","combina":{"S":2,"E":2,"T":2,"A":2}},
    {"codigo":"F07","tipo":"Formato","nome":"Gráfico de barras","texto":"Barras que comparam números: quem reciclou mais, quem correu mais.","ico":"📊","combina":{"S":2,"E":3,"T":3,"A":4}},
    {"codigo":"F08","tipo":"Formato","nome":"Cardápio da semana","texto":"O que comer em cada dia, do café da manhã ao jantar.","ico":"🍽️","combina":{"S":4,"E":3,"T":1,"A":2}},
    {"codigo":"F09","tipo":"Formato","nome":"Mapa do percurso","texto":"O caminho desenhado, com as paradas para água e sombra.","ico":"🗺️","combina":{"S":3,"E":4,"T":1,"A":4}},
    {"codigo":"F10","tipo":"Formato","nome":"Pergunta e resposta","texto":"As dúvidas de quem lê, cada uma com a resposta.","ico":"❓","combina":{"S":3,"E":2,"T":3,"A":3}},
    {"codigo":"F11","tipo":"Formato","nome":"Passo a passo com as telas","texto":"Etapas numeradas mostrando onde tocar em cada tela do celular.","ico":"👣","combina":{"S":3,"E":3,"T":4,"A":1}},
    {"codigo":"F12","tipo":"Formato","nome":"Cartaz (título e 3 frases)","texto":"Um título que chama atenção e 3 frases curtas, para o mural.","ico":"🪧","combina":{"S":3,"E":3,"T":2,"A":3}},
    {"codigo":"F13","tipo":"Formato","nome":"Placar no telão","texto":"Números grandes que todos veem de longe, como no estádio ou na gincana.","ico":"🔢","combina":{"S":1,"E":4,"T":4,"A":3}},
    {"codigo":"F14","tipo":"Formato","nome":"História em quadrinhos","texto":"3 quadrinhos com desenhos e falas curtas.","ico":"💬","combina":{"S":3,"E":3,"T":2,"A":2}},
    {"codigo":"F15","tipo":"Formato","nome":"Folheto para as casas","texto":"Uma folha com desenhos e poucas palavras, para entregar de casa em casa.","ico":"📬","combina":{"S":4,"E":1,"T":2,"A":4}},
    {"codigo":"F16","tipo":"Formato","nome":"Linha do tempo","texto":"Os fatos em ordem, do mais antigo ao mais novo.","ico":"⏳","combina":{"S":2,"E":3,"T":3,"A":3}},
  ],
  // A carta especial de cada baralho: sem número, não entra no prompt
  especiais: [{"tipo":"Contexto","nome":"Mágico","ico":"🎩","poder":"Roube o contexto de qualquer adversário."},{"tipo":"Persona","nome":"Espião","ico":"🕵️","poder":"Roube a persona de qualquer adversário."},{"tipo":"Formato","nome":"Ímã","ico":"🧲","poder":"Roube o formato de qualquer adversário."}],
  regraDoRoubo: "Quem foi roubado perde a rodada: não ganha ponto.", // a mesma frase das cartas especiais
  // Nome, símbolo (igual ao das cartas) e nome no meio da frase de cada assunto
  assuntos: {"S":{"nome":"Saúde","ico":"✚","minusculo":"saúde"},"E":{"nome":"Esporte","ico":"⚽","minusculo":"esporte"},"T":{"nome":"Tecnologia","ico":"💻","minusculo":"tecnologia"},"A":{"nome":"Meio ambiente","ico":"🌳","minusculo":"meio ambiente"}},
  // Números da regra (de teste)
  rodadas: 5,
  rodadasRapida: 3, // a partida rápida
  cartasAbertas: 4, // em cada baralho, na mesa
  duracaoDaVez: 60, // segundos
  maximoDeLados: 5,
  totalDeMissoes: 9,
};

// Índice para achar uma carta pelo código, por exemplo DADOS.porCodigo.C01
DADOS.porCodigo = Object.fromEntries(DADOS.cartas.map((c) => [c.codigo, c]));
DADOS.missoes = DADOS.cartas.filter((c) => c.tipo === 'Missão');
