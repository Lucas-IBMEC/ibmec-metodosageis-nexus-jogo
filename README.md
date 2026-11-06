# Palavra Mágica · jogo de cartas e aplicativo do professor

**Palavra Mágica** é o jogo de cartas do grupo NEXUS (Métodos Ágeis, IBMEC) que ensina a escrever bons prompts, sem internet na sala de aula. Antes ele se chamava *Magic Prompt*; o professor pediu um nome em português na Revisão da Sprint 4 (04/11/2026).

Esta é a **versão "Pife" para a partida de teste de 11/11**. Ela joga como o Pife: compra uma, descarta uma e bate quando fecha o jogo. Aqui, o jogo é um prompt.

Só o professor usa o celular em sala. O aplicativo do professor foi feito **primeiro para o celular**, funciona **sem internet** depois da primeira visita e pode ser **instalado na tela inicial**.

## O que tem aqui

| Arquivo | O que é |
| --- | --- |
| `cartas/cartas.html` | Folha de regras, as 72 cartas (8 folhas A4) e o gabarito do professor, prontos para imprimir |
| `cartas/manual.html` | Manual do Professor (9 páginas, com imagens das cartas, da mesa e das telas do aplicativo) |
| `cartas/gerar.cjs` | Lugar único das cartas: gera os dois arquivos acima e os dados do aplicativo |
| `cartas/manual.cjs` | Texto e desenho do Manual do Professor |
| `cartas/imagens/` | Fotos das telas do aplicativo usadas no manual |
| `app/` | O aplicativo do professor |
| `app-vue/` | Versão antiga em Vue 3, ainda com as regras do pacote E |

## O jogo em 5 linhas

- No meio da mesa ficam 3 missões abertas. Cada lado tem 5 cartas na mão.
- Na sua vez (até 30 segundos): **compre 1** (do monte ou a de cima do lixo), **bata** se fechou um prompt e **descarte 1**.
- Fecha um prompt quem tem um **contexto** e uma **persona** com o ícone de uma missão da mesa (✚ Saúde, ⚽ Esporte, 💻 Tecnologia, 🌳 Meio ambiente), mais **1 formato**.
- O professor confere no aplicativo: formato que ajuda quem vai ler vale ★★★; outro formato, ★★.
- Ganha quem chegar a **6 estrelas** primeiro.

As regras completas estão na folha de regras, no Manual do Professor e na página Regras do aplicativo.

## Como abrir o aplicativo

- **No celular:** abra `https://lucas-ibmec.github.io/ibmec-metodosageis-nexus-jogo/app/` (publicado pelo GitHub Pages deste repositório).
- **Instalar:** no Chrome do Android, menu ⋮ → *Adicionar à tela inicial*. No iPhone, Safari → Compartilhar → *Adicionar à Tela de Início*.
- **No computador:** abra `app/index.html` no navegador. Tudo funciona, menos o modo sem internet, que só liga quando o aplicativo vem de um servidor (como o GitHub Pages).

| Arquivo | Página | O que faz | Histórias |
| --- | --- | --- | --- |
| `app/index.html` | Partida | Monta a partida (Duelo, Mesa ou Turma), sorteia quem começa, mostra as estrelas de cada lado, cronômetro de 30 segundos por vez e quem ganhou | 2.5.1 |
| `app/missao.html` | Missão | O professor escolhe a missão e digita os códigos das 3 cartas. O aplicativo diz se o prompt fecha, dá ★★★ ou ★★, mostra o prompt que as cartas formam e uma resposta de exemplo | 2.1.1, 2.1.2, 2.2.1, 2.2.2 |
| `app/cartas.html` | Cartas | Consulta das cartas pelo código ou pelo nome, com o gabarito do professor | 2.3.1 |
| `app/regras.html` | Regras | Resumo das regras | 2.3.2, 2.3.3 |

O placar fica guardado no próprio celular, então dá para trocar de página no meio da partida sem perder nada.

## Como mudar uma carta, um número ou o nome do jogo

Edite `cartas/gerar.cjs` (o nome do jogo fica na constante `NOME`, no começo do arquivo) e rode:

```
node cartas/gerar.cjs
```

Isso atualiza de uma vez as cartas para imprimir, o Manual do Professor e os dados do aplicativo (`app/js/dados.js` e `app/manifest.webmanifest`). Não edite esses arquivos à mão: o aplicativo e as cartas impressas ficariam diferentes. As respostas de exemplo ficam em `app/js/respostas.js`.

Para imprimir: abra `cartas/cartas.html` ou `cartas/manual.html` no Chrome, Ctrl+P, *Salvar como PDF*, margens *Nenhuma*.

Ao **criar um arquivo novo** no aplicativo, coloque o nome dele na lista `ARQUIVOS` de `app/sw.js` e aumente a `VERSAO`, para os celulares guardarem o arquivo novo.

## Palavras de outras línguas

Seguimos a regra do professor: se existe palavra em português que diz o mesmo, usamos a palavra em português. As que ficaram (como *prompt*, *persona*, *Sprint* e *Kanban*) estão explicadas e justificadas na seção 8 do Manual do Professor. Os nomes de arquivos e o código usam os nomes técnicos das linguagens de programação (HTML, CSS e JavaScript).

## Ainda falta

- Testar num celular de verdade: modo sem internet, som e vibração do cronômetro, tela que não apaga.
- Testar com alguém que não sabe escrever prompts (tarefa da história 2.2.1).
- Ajustar os números depois da partida de teste: 5 cartas na mão, 3 missões na mesa, 6 estrelas e 30 segundos por vez.
- Atualizar o `app-vue` para esta versão.
