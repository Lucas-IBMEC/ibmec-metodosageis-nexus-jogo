# Palavra Mágica · jogo de cartas e aplicativo do professor

**Palavra Mágica** é o jogo de cartas do grupo NEXUS (Métodos Ágeis, IBMEC) que ensina a escrever bons prompts, sem internet na sala de aula. Antes ele se chamava *Magic Prompt*; o professor pediu um nome em português na Revisão da Sprint 4 (04/11/2026).

Esta é a **versão "Rodadas"**, com as mudanças pedidas pelo cliente depois da partida de teste de 11/11 (regras de 16/11). Em cada rodada, cada lado monta um prompt com 3 cartas para a mesma missão, e o melhor prompt ganha 1 ponto. No fim, um desafio sem cartas confere se a turma aprendeu.

Só o professor usa o celular em sala. O aplicativo do professor foi feito **primeiro para o celular**, funciona **sem internet** depois da primeira visita e pode ser **instalado na tela inicial**.

## O que tem aqui

| Arquivo | O que é |
| --- | --- |
| `cartas/cartas.html` | As 60 cartas (16 missões, 3 baralhos de 16 e 1 carta especial em cada baralho), frente e verso, com uma imagem em cada carta (14 folhas A4: cada folha de frente vem seguida do seu verso), prontas para imprimir |
| `cartas/regras-e-gabarito.html` | Folha de regras (frente e verso: como jogar, quem começa e as versões do jogo) e gabarito do professor (4 páginas) |
| `cartas/manual.html` | Manual do Professor (9 páginas, com imagens das cartas, da mesa e das telas do aplicativo) |
| `cartas/tabuleiro.html` | Tabuleiro da mesa: o lugar da missão, dos 3 montes e das 4 cartas abertas de cada baralho. São 2 folhas A4 que, coladas, têm o tamanho de uma folha A3 |
| `cartas/iconografico.html` | Manual iconográfico (4 páginas): as cores dos baralhos, as partes de uma carta, os assuntos, as cartas especiais, o tabuleiro, os ícones do aplicativo, a imagem de cada carta e os desenhos dos formatos |
| `cartas/gerar.cjs` | Lugar único das cartas: gera os arquivos acima e os dados do aplicativo |
| `cartas/manual.cjs` | Texto e desenho do Manual do Professor |
| `cartas/tabuleiro.cjs` e `cartas/iconografico.cjs` | Desenho do tabuleiro e do manual iconográfico (usam as mesmas cartas, cores e ícones) |
| `cartas/imagens/` | Fotos das telas do aplicativo usadas no manual |
| `app/` | O aplicativo do professor |
| `app-vue/` | Versão antiga em Vue 3, feita pelo Frederico Queiroz em 28/10 (Sprint 3). Fica só como histórico: o aplicativo que vale é o da pasta `app/` |

## O jogo em 6 linhas

- Vire 1 missão. Ela vale para todos os lados e tem 3 assuntos (✚ Saúde, ⚽ Esporte, 💻 Tecnologia, 🌳 Meio ambiente).
- Cada baralho (contexto, persona e formato) tem **4 cartas abertas** na mesa (saíram 2 ou 3 especiais entre elas na preparação? embaralhe de novo). O aplicativo sorteia quem começa; a vez segue em sentido horário e, na rodada seguinte, começa o próximo lado. Na sua vez (até 1 minuto), **pegue 1 de cada baralho**: uma aberta ou a de cima do monte, sem ver.
- Cartas especiais (🎩 Mágico, 🕵️ Espião e 🧲 Ímã, uma em cada baralho): roube a carta daquele baralho de qualquer adversário. Quem foi roubado perde a rodada (não ganha ponto).
- Cada carta combina de 1 a 4 com cada assunto. Os números ficam escondidos: o aplicativo dá a nota de cada prompt (a média) e diz por que perdeu pontos.
- O melhor prompt da rodada ganha **1 ponto** (empate: 1 ponto para cada). Depois de **5 rodadas** (ou 3, na partida rápida), ganha quem tiver mais pontos. Com a turma toda, jogue **em grupos** (até 5 grupos, cada um com um porta-voz).
- No fim, o **desafio final**: sem cartas, cada lado escreve um prompt com persona, contexto e formato para um problema da escola. O professor digita e o aplicativo dá a nota de 1 a 4, sem internet. Ganha quem tirar a maior nota.

As regras completas estão na folha de regras, no Manual do Professor e na página Regras do aplicativo.

## Como abrir o aplicativo

- **No celular:** abra `https://lucas-ibmec.github.io/ibmec-metodosageis-nexus-jogo/app/` (publicado pelo GitHub Pages deste repositório).
- **Instalar:** no Chrome do Android, menu ⋮ → *Adicionar à tela inicial*. No iPhone, Safari → Compartilhar → *Adicionar à Tela de Início*.
- **No computador:** abra `app/index.html` no navegador. Tudo funciona, menos o modo sem internet, que só liga quando o aplicativo vem de um servidor (como o GitHub Pages).

| Arquivo | Página | O que faz | Histórias |
| --- | --- | --- | --- |
| `app/index.html` | Partida | Monta a partida (completa com 5 rodadas ou rápida com 3; Duelo, Mesa ou Grupos), sorteia quem começa, mostra a rodada, de quem é a vez, os pontos de cada lado, o cronômetro de 1 minuto por vez e quem ganhou | 2.5.1 |
| `app/rodada.html` | Rodada | O professor digita o número da missão e das 3 cartas de cada lado. O aplicativo dá a nota de cada prompt, diz por que perdeu pontos, mostra o prompt que as cartas formam e dá o ponto ao melhor. O botão Foi roubado tira da rodada o lado roubado por uma carta especial | 2.1.1, 2.1.2, 2.2.1, 2.2.2 |
| `app/aprendeu.html` | Desafio | O desafio final: sorteia um problema da escola, o professor digita o prompt de cada lado e o aplicativo dá a nota de 1 a 4 (persona, contexto e formato), sem internet, com o porquê e quem ganhou | 2.2.1 |
| `app/cartas.html` | Cartas | Consulta das cartas pelo código ou pelo nome, com o gabarito do professor (os números de cada carta) | 2.3.1 |
| `app/regras.html` | Regras | Resumo das regras | 2.3.2, 2.3.3 |

O placar fica guardado no próprio celular, então dá para trocar de página no meio da partida sem perder nada.

## Como mudar uma carta, um número ou o nome do jogo

Edite `cartas/gerar.cjs` (o nome do jogo fica na constante `NOME`, no começo do arquivo) e rode:

```
node cartas/gerar.cjs
```

Isso atualiza de uma vez as cartas para imprimir, o Manual do Professor e os dados do aplicativo (`app/js/dados.js` e `app/manifest.webmanifest`). Não edite esses arquivos à mão: o aplicativo e as cartas impressas ficariam diferentes. A conta da nota fica em `app/js/nota.js`, usado pelo aplicativo e pelo gerador do gabarito. A nota do prompt escrito no desafio final fica em `app/js/avaliar.js` (procura as palavras de cada assunto, sem internet).

Para imprimir: abra `cartas/cartas.html`, `cartas/regras-e-gabarito.html`, `cartas/manual.html`, `cartas/tabuleiro.html` ou `cartas/iconografico.html` no Chrome, Ctrl+P, *Salvar como PDF*, margens *Nenhuma*.

Ao **criar um arquivo novo** no aplicativo, coloque o nome dele na lista `ARQUIVOS` de `app/sw.js` e aumente a `VERSAO`, para os celulares guardarem o arquivo novo.

## Palavras de outras línguas

Seguimos a regra do professor: se existe palavra em português que diz o mesmo, usamos a palavra em português. As que ficaram (como *prompt*, *persona*, *Sprint* e *Kanban*) estão explicadas e justificadas na seção 8 do Manual do Professor. Os nomes de arquivos e o código usam os nomes técnicos das linguagens de programação (HTML, CSS e JavaScript).

## O que já foi testado

- Teste com alguém que não sabe escrever prompts (Sprint 4, história 2.2.1).
- Partida de teste com o professor em 11/11: passou de 25 minutos, por isso agora existe a partida rápida (3 rodadas).
- Números ajustados depois da partida de teste: 5 rodadas (ou 3 na rápida), 4 cartas abertas em cada baralho e 1 minuto por vez.
- Aplicativo no celular em modo avião (16/11): funcionou sem internet.

Ainda não testado no celular: o som e a vibração do cronômetro e a tela que não apaga.
