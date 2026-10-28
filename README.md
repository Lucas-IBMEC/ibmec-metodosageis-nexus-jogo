# Magic Prompt · Companion app do professor

Protótipo do companion app do **Magic Prompt**, o jogo de cartas do grupo NEXUS (Métodos Ágeis, IBMEC) que ensina engenharia de prompt com ética.

Só o professor usa o celular em sala. O app foi feito **primeiro para o celular**, funciona **sem internet** depois da primeira visita e pode ser **instalado na tela inicial** como um aplicativo.

## Como abrir

- **No celular (recomendado):** publique o repositório no GitHub Pages (Settings → Pages → Branch `main`, pasta `/root`) e abra `https://fredericodeveloper.github.io/ibmec-metodosageis-nexus-jogo/app/`.
- **Instalar:** no Chrome do Android, menu ⋮ → *Adicionar à tela inicial*. No iPhone, Safari → Compartilhar → *Adicionar à Tela de Início*.
- **No computador:** abra `app/index.html` no navegador. Tudo funciona, menos o modo sem internet, que só liga quando o app vem de um servidor (GitHub Pages ou a extensão Live Server do VS Code).

## Páginas

| Arquivo | Página | O que faz | Histórias |
| --- | --- | --- | --- |
| `app/index.html` | Partida | Monta a partida (Duelo, Mesa ou Turma), escolhe quem começa, placar de vida e missões, "sem atacar" depois da denúncia, cronômetro de 40 segundos por turno e fim da partida | 2.5.1 |
| `app/missao.html` | Missão | O professor escolhe a missão e digita os códigos do combo. O app confere cada item, mostra o prompt que o combo forma e uma resposta simulada da IA | 2.1.1, 2.1.2, 2.2.1, 2.2.2 |
| `app/denuncia.html` | Denúncia | Diz se a carta denunciada tem dado pessoal ou viés, como consertar e aplica o resultado no placar | 2.2.3 |
| `app/cartas.html` | Cartas | Consulta das 141 cartas pelo código ou pelo nome, com o gabarito do professor | 2.3.1 |
| `app/regras.html` | Regras | Passo a passo para começar, modos, turno, combo, ataque e defesa, missões, denúncia, nações e fim | 2.3.2, 2.3.3 |

Todas as páginas guardam o placar no próprio celular (`localStorage`), então dá para trocar de página no meio da partida sem perder nada.

## Pastas

```
app/
├── index.html, missao.html, denuncia.html, cartas.html, regras.html
├── css/app.css          estilo (cores iguais às cartas impressas, modo claro e escuro)
├── js/dados.js          as 141 cartas, o gabarito das missões e os defeitos de ética
├── js/respostas.js      respostas simuladas da IA para cada missão
├── js/comum.js          menu, busca de carta pelo código, avisos e funções usadas por todas as páginas
├── js/partida.js        placar e cronômetro
├── js/missao.js         conferência da missão
├── js/denuncia.js       julgamento da denúncia
├── js/cartas.js         consulta das cartas
├── manifest.webmanifest nome, cores e ícones para instalar no celular
├── sw.js                guarda os arquivos para funcionar sem internet
└── icones/              ícone do app
```

## Como mudar uma carta

Edite a linha da carta em `app/js/dados.js`. O gabarito das missões fica na parte `missoes` e o das denúncias na parte `defeitos`. As respostas simuladas da IA ficam em `app/js/respostas.js`.

Ao **criar um arquivo novo**, coloque o nome dele na lista `ARQUIVOS` de `app/sw.js` e aumente a `VERSAO`, para os celulares guardarem o arquivo novo.

## Ainda falta

- Testar num celular de verdade: modo sem internet, som e vibração do cronômetro, tela que não apaga.
- Testar com alguém que não sabe engenharia de prompt (tarefa da história 2.2.1).
- Decidir o limite da mão e a condição de vitória (hoje: limite de 7 cartas e vence quem tiver mais missões no fim).
- Ajustar os números (vida 15, mão 6, limite 7, compra 3, denúncia 2, turno de 40 segundos) depois do playtest.
