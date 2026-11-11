# Palavra Mágica · jogo de cartas e aplicativo do professor

**Palavra Mágica** é o jogo de cartas do grupo NEXUS (Métodos Ágeis, IBMEC) que ensina a escrever bons prompts, sem internet na sala de aula. Antes ele se chamava *Magic Prompt*; o professor pediu um nome em português na Revisão da Sprint 4 (04/11/2026).

Esta é a **versão "Rodadas" para a partida de teste de 11/11**. Em cada rodada, cada lado monta um prompt com 3 cartas para a mesma missão, e o melhor prompt ganha 1 ponto. No fim, um desafio sem cartas confere se a turma aprendeu.

Só o professor usa o celular em sala. O aplicativo do professor foi feito **primeiro para o celular**, funciona **sem internet** depois da primeira visita e pode ser **instalado na tela inicial**.

## O que tem aqui

| Arquivo | O que é |
| --- | --- |
| `cartas/cartas.html` | As 57 cartas, frente e verso (14 folhas A4: cada folha de frente vem seguida do seu verso), prontas para imprimir |
| `cartas/regras-e-gabarito.html` | Folha de regras e gabarito do professor (3 páginas) |
| `cartas/manual.html` | Manual do Professor (9 páginas, com imagens das cartas, da mesa e das telas do aplicativo) |
| `cartas/gerar.cjs` | Lugar único das cartas: gera os arquivos acima e os dados do aplicativo |
| `cartas/manual.cjs` | Texto e desenho do Manual do Professor |
| `cartas/imagens/` | Fotos das telas do aplicativo usadas no manual |
| `app/` | O aplicativo do professor |
| `app-vue/` | Versão antiga em Vue 3, ainda com as regras do pacote E |

## O jogo em 5 linhas

- Vire 1 missão. Ela tem 3 assuntos (✚ Saúde, ⚽ Esporte, 💻 Tecnologia, 🌳 Meio ambiente).
- Na sua vez (até 1 minuto): **compre 3 de cada baralho** (contexto, persona e formato), fique com 1 de cada e devolva as outras 6.
- Cada carta combina de 1 a 4 com cada assunto. Os números ficam escondidos: o aplicativo dá a nota de cada prompt (a média) e diz por que perdeu pontos.
- O melhor prompt da rodada ganha **1 ponto** (empate: 1 ponto para cada). Depois de **5 rodadas**, ganha quem tiver mais pontos.
- No fim, o **desafio final**: sem cartas, cada lado escreve um prompt com as 4 partes e o professor confere com 4 perguntas.

As regras completas estão na folha de regras, no Manual do Professor e na página Regras do aplicativo.

## Como abrir o aplicativo

- **No celular:** abra `https://lucas-ibmec.github.io/ibmec-metodosageis-nexus-jogo/app/` (publicado pelo GitHub Pages deste repositório).
- **Instalar:** no Chrome do Android, menu ⋮ → *Adicionar à tela inicial*. No iPhone, Safari → Compartilhar → *Adicionar à Tela de Início*.
- **No computador:** abra `app/index.html` no navegador. Tudo funciona, menos o modo sem internet, que só liga quando o aplicativo vem de um servidor (como o GitHub Pages).

| Arquivo | Página | O que faz | Histórias |
| --- | --- | --- | --- |
| `app/index.html` | Partida | Monta a partida (Duelo, Mesa ou Turma), sorteia quem começa, mostra a rodada, de quem é a vez, os pontos de cada lado, o cronômetro de 1 minuto por vez e quem ganhou | 2.5.1 |
| `app/rodada.html` | Rodada | O professor digita o número da missão e das 3 cartas de cada lado. O aplicativo dá a nota de cada prompt, diz por que perdeu pontos, mostra o prompt que as cartas formam e dá o ponto ao melhor | 2.1.1, 2.1.2, 2.2.1, 2.2.2 |
| `app/aprendeu.html` | Desafio | O desafio final: sorteia um problema da escola e confere, com 4 perguntas e exemplos, se cada lado escreveu um prompt com as 4 partes | 2.2.1 |
| `app/cartas.html` | Cartas | Consulta das cartas pelo código ou pelo nome, com o gabarito do professor (os números de cada carta) | 2.3.1 |
| `app/regras.html` | Regras | Resumo das regras | 2.3.2, 2.3.3 |

O placar fica guardado no próprio celular, então dá para trocar de página no meio da partida sem perder nada.

## Como mudar uma carta, um número ou o nome do jogo

Edite `cartas/gerar.cjs` (o nome do jogo fica na constante `NOME`, no começo do arquivo) e rode:

```
node cartas/gerar.cjs
```

Isso atualiza de uma vez as cartas para imprimir, o Manual do Professor e os dados do aplicativo (`app/js/dados.js` e `app/manifest.webmanifest`). Não edite esses arquivos à mão: o aplicativo e as cartas impressas ficariam diferentes. A conta da nota fica em `app/js/nota.js`, usado pelo aplicativo e pelo gerador do gabarito.

Para imprimir: abra `cartas/cartas.html`, `cartas/regras-e-gabarito.html` ou `cartas/manual.html` no Chrome, Ctrl+P, *Salvar como PDF*, margens *Nenhuma*.

Ao **criar um arquivo novo** no aplicativo, coloque o nome dele na lista `ARQUIVOS` de `app/sw.js` e aumente a `VERSAO`, para os celulares guardarem o arquivo novo.

## Palavras de outras línguas

Seguimos a regra do professor: se existe palavra em português que diz o mesmo, usamos a palavra em português. As que ficaram (como *prompt*, *persona*, *Sprint* e *Kanban*) estão explicadas e justificadas na seção 8 do Manual do Professor. Os nomes de arquivos e o código usam os nomes técnicos das linguagens de programação (HTML, CSS e JavaScript).

## Ainda falta

- Testar num celular de verdade: modo sem internet, som e vibração do cronômetro, tela que não apaga.
- Testar com alguém que não sabe escrever prompts (tarefa da história 2.2.1).
- Ajustar os números depois da partida de teste: 5 rodadas, 3 cartas de cada baralho e 1 minuto por vez.
- Atualizar o `app-vue` para esta versão.
