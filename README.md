# Magic Prompt · Companion app do professor

Protótipo do companion app do **Magic Prompt**, o jogo de cartas do grupo NEXUS (Métodos Ágeis, IBMEC) que ensina engenharia de prompt.

Esta é a **versão simplificada para o playtest de 11/11**: um tabuleiro com 4 baralhos (Missões, Contexto, Persona e Formato), nota de 1 a 3 estrelas e poderes das nações pagos com pontos.

Só o professor usa o celular em sala. O app foi feito **primeiro para o celular**, funciona **sem internet** depois da primeira visita e pode ser **instalado na tela inicial** como um aplicativo.

## Como abrir

- **No celular (recomendado):** abra `https://lucas-ibmec.github.io/ibmec-metodosageis-nexus-jogo/app/`. É o GitHub Pages do repositório `Lucas-IBMEC/ibmec-metodosageis-nexus-jogo`, que agora é o repositório principal do projeto.
- **Instalar:** no Chrome do Android, menu ⋮ → *Adicionar à tela inicial*. No iPhone, Safari → Compartilhar → *Adicionar à Tela de Início*.
- **No computador:** abra `app/index.html` no navegador. Tudo funciona, menos o modo sem internet, que só liga quando o app vem de um servidor (GitHub Pages ou a extensão Live Server do VS Code).

## O jogo em 5 linhas

- No seu turno, o lado tira 1 missão e escolhe 1 contexto, 1 persona e 1 formato: uma das 3 cartas abertas de cada baralho ou a de cima do baralho.
- Cada carta certa vale 1 estrela: contexto e persona do mesmo assunto da missão (✚ Saúde, ⚽ Esporte, 💻 Tecnologia, 🌳 Meio ambiente) e um formato que ajude quem vai ler. 3 certas = ★★★, 2 = ★★, 0 ou 1 = ★.
- Cada estrela vale 1 ponto. Os pontos pagam os poderes da nação: ① Cura, ② Ataque e o ③ de cada nação.
- Todos começam com 10 de vida. Vida 0: o lado perde todos os pontos e volta com 10.
- Todos jogam o mesmo número de turnos (as 10 missões divididas entre os lados). Vence quem tiver mais pontos; no empate, quem tiver mais vida.

As regras completas estão na página Regras do app e na primeira folha do arquivo de impressão.

## Páginas

| Arquivo | Página | O que faz | Histórias |
| --- | --- | --- | --- |
| `app/index.html` | Partida | Monta a partida (Duelo, Mesa ou Turma), sorteia quem começa, placar de vida e pontos, poderes das nações, cronômetro de 60 segundos por turno e fim da partida | 2.5.1 |
| `app/missao.html` | Missão | O professor escolhe a missão e digita os códigos das 3 cartas. O app dá de 1 a 3 estrelas, explica cada acerto e erro, mostra o prompt que as cartas formam e uma resposta simulada, e passa os pontos para o lado | 2.1.1, 2.1.2, 2.2.1, 2.2.2 |
| `app/cartas.html` | Cartas | Consulta das 52 cartas pelo código ou pelo nome (inclusive os poderes), com o gabarito do professor | 2.3.1 |
| `app/regras.html` | Regras | Passo a passo para começar, turno, estrelas, poderes, vida, fim e modos de jogo | 2.3.2, 2.3.3 |

Todas as páginas guardam o placar no próprio celular (`localStorage`), então dá para trocar de página no meio da partida sem perder nada.

## Pastas

```
app/
├── index.html, missao.html, cartas.html, regras.html
├── css/app.css          estilo (cores iguais às cartas impressas, modo claro e escuro)
├── js/dados.js          as cartas, o gabarito das missões e os poderes (gerado por cartas/gerar.cjs)
├── js/respostas.js      respostas simuladas para cada missão e formato
├── js/comum.js          menu, busca de carta pelo código, avisos e funções usadas por todas as páginas
├── js/partida.js        placar, poderes e cronômetro
├── js/missao.js         nota da missão em estrelas
├── js/cartas.js         consulta das cartas
├── manifest.webmanifest nome, cores e ícones para instalar no celular
├── sw.js                guarda os arquivos para funcionar sem internet
└── icones/              ícone do app
cartas/
├── gerar.cjs            lugar único das cartas: gera o arquivo de impressão e o app/js/dados.js
└── playtest.html        regras, tabuleiro (2 folhas), 61 cartas e gabarito, pronto para imprimir
app-vue/                 versão em Vue 3 (ainda segue o pacote E)
```

## Como mudar uma carta

Edite a carta em `cartas/gerar.cjs` (missões, contextos, personas, formatos ou nações) e rode:

```
node cartas/gerar.cjs
```

Isso atualiza de uma vez as cartas para imprimir (`cartas/playtest.html`) e o app (`app/js/dados.js`). Não edite o `dados.js` à mão: o app e as cartas impressas ficariam diferentes. As respostas simuladas ficam em `app/js/respostas.js`.

Para imprimir: abra `cartas/playtest.html` no Chrome, Ctrl+P, *Salvar como PDF*, margens *Nenhuma*.

Ao **criar um arquivo novo** no app, coloque o nome dele na lista `ARQUIVOS` de `app/sw.js` e aumente a `VERSAO`, para os celulares guardarem o arquivo novo.

## Ainda falta

- Testar num celular de verdade: modo sem internet, som e vibração do cronômetro, tela que não apaga.
- Testar com alguém que não sabe engenharia de prompt (tarefa da história 2.2.1).
- Ajustar os números depois do playtest: vida 10, Cura 3, Ataque 4, Golaço 8, Compra no mercado 3 e turno de 60 segundos.
- Atualizar o `app-vue` para esta versão.
