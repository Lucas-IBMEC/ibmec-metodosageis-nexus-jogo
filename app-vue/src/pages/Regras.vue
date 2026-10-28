<script setup>
// Página Regras: o passo a passo do jogo + a tabela de buffs/debuffs das nações.
// A tabela vem das cartas de nação (história 2.3.2).
import { computed } from 'vue'
import { DADOS } from '../data/dados.js'
import AppHeader from '../components/AppHeader.vue'
import BottomMenu from '../components/BottomMenu.vue'

const nacoes = computed(() =>
  DADOS.cartas
    .filter((c) => c.tipo === 'Nação')
    .map((n) => {
      const [buff, debuff] = n.efeito.replace('Buff: ', '').split(' · Debuff: ')
      return { codigo: n.codigo, nome: n.nome, buff, debuff }
    }),
)

const clsLista = 'my-1.5 space-y-1 pl-[22px]'
const clsTh = 'border-b border-borda px-2 py-2 text-left align-top text-[12px] uppercase tracking-[0.05em] text-texto-2'
const clsTd = 'border-b border-borda px-2 py-2 text-left align-top'
</script>

<template>
  <AppHeader title="Regras" />

  <main class="mx-auto flex max-w-[640px] flex-col gap-2 px-4 pt-4 pb-[calc(var(--altura-menu)+env(safe-area-inset-bottom,0px)+24px)]">
    <details class="detalle rounded-raio-p border border-borda bg-superficie" open>
      <summary><span class="font-semibold leading-tight">Passo a passo para começar</span></summary>
      <div class="px-3 pb-3 text-[15px] select-text">
        <ol :class="clsLista + ' list-decimal'">
          <li>Escolha o modo de jogo (Duelo, Mesa ou Turma) e divida os lados.</li>
          <li>Cada lado pega 1 carta de nação e marca a vida inicial (15; a China começa com 13) com uma moeda ou um clipe.</li>
          <li>Separe 4 montes embaralhados: Missões, Contextos, Precisões e Geral (dor, necessidade, conceito, formato, documento, ética e persona).</li>
          <li>Vire 3 missões para cima. Ao lado do Geral, vire 4 cartas do Geral para cima: é o mercado.</li>
          <li>Cada lado compra 6 cartas sorteadas: 2 contextos, 2 precisões e 2 do Geral.</li>
          <li>Limite da mão: 7 cartas. Se a mão não formar nenhum combo, troque a mão inteira 1 vez.</li>
          <li>Veja quem começa (abaixo) e abra a página Partida.</li>
        </ol>
      </div>
    </details>

    <details class="detalle rounded-raio-p border border-borda bg-superficie">
      <summary><span class="font-semibold leading-tight">Modos de jogo</span></summary>
      <div class="px-3 pb-3 text-[15px] select-text">
        <p class="my-1.5"><b>Duelo</b> (2 a 4 alunos): 1 contra 1, ou dupla contra dupla.</p>
        <p class="my-1.5"><b>Mesa</b> (3 a 10 alunos): 3 a 5 lados, todos contra todos. No ataque, o lado escolhe quem atacar.</p>
        <p class="my-1.5"><b>Turma</b> (até 40 alunos): 5 grupos de até 8, um por nação. As precisões vão em dobro (imprima o arquivo das precisões extras). Os papéis trocam a cada turno:</p>
        <ul :class="clsLista + ' list-disc'">
          <li><b>Capitão:</b> decide a jogada e fala com o professor.</li>
          <li><b>Montador:</b> monta o combo na mesa.</li>
          <li><b>Fiscal:</b> procura dado pessoal e viés nas cartas dos outros grupos e denuncia.</li>
          <li><b>Placar:</b> anota a vida e as missões do grupo.</li>
        </ul>
      </div>
    </details>

    <details class="detalle rounded-raio-p border border-borda bg-superficie">
      <summary><span class="font-semibold leading-tight">Quem começa</span></summary>
      <div class="px-3 pb-3 text-[15px] select-text">
        <ol :class="clsLista + ' list-decimal'">
          <li>Cada lado compra 1 carta do monte de Contextos.</li>
          <li>Quem tirar o maior número começa. Empate: só os empatados compram de novo.</li>
          <li>As cartas voltam para o monte, que é embaralhado.</li>
          <li>Depois, a vez segue no sentido horário. No modo Turma, na ordem que o professor escrever no quadro.</li>
        </ol>
        <p class="my-1.5 rounded-raio-p bg-aviso-fundo px-3 py-2.5 text-sm font-semibold text-aviso">Quem começa não compra cartas no primeiro turno.</p>
      </div>
    </details>

    <details class="detalle rounded-raio-p border border-borda bg-superficie">
      <summary><span class="font-semibold leading-tight">O turno (até 40 segundos)</span></summary>
      <div class="px-3 pb-3 text-[15px] select-text">
        <ol :class="clsLista + ' list-decimal'">
          <li><b>Compra:</b> pegue 3 cartas, uma de cada vez. Para cada uma, escolha: uma carta do mercado (reponha na hora com a de cima do Geral) ou uma às cegas do topo de qualquer monte.</li>
          <li><b>Ativação:</b> monte combos e ponha persona e equipamentos na mesa.</li>
          <li><b>Ataque:</b> vai tentar uma missão? Avise antes qual. Escolha um combo seu e um lado para atacar.</li>
          <li><b>Denúncia:</b> alguém viu dado pessoal ou viés? Denuncie agora.</li>
          <li><b>Missão:</b> o professor confere na página Missão. Cumpriu? Pegue a carta.</li>
          <li><b>Fim:</b> descarte até ficar com 7 cartas.</li>
        </ol>
        <p class="my-1.5 rounded-raio-p bg-aviso-fundo px-3 py-2.5 text-sm font-semibold text-aviso">Acabou o tempo antes do ataque? O turno passa sem ataque, e os combos montados ficam na mesa.</p>
      </div>
    </details>

    <details class="detalle rounded-raio-p border border-borda bg-superficie">
      <summary><span class="font-semibold leading-tight">O combo (é o prompt)</span></summary>
      <div class="px-3 pb-3 text-[15px] select-text">
        <ul :class="clsLista + ' list-disc'">
          <li>Mínimo: 1 contexto e 1 precisão. Máximo: 5 cartas (mais dor, necessidade ou conceito, ética e documento).</li>
          <li>O número do contexto limita a precisão: ataque e defesa ficam até 2 acima ou 2 abaixo dele.</li>
          <li>A precisão recebe 1 formato (estilo de ataque). O combo recebe 1 documento (estilo de defesa).</li>
          <li>Contextos de nações diferentes no mesmo combo: -1 de ataque.</li>
          <li>Persona na mesa: a precisão do mesmo assunto ganha +1 de ataque.</li>
          <li>No máximo 3 combos na mesa por lado. Para baixar o 4º, descarte um dos seus antes.</li>
        </ul>
      </div>
    </details>

    <details class="detalle rounded-raio-p border border-borda bg-superficie">
      <summary><span class="font-semibold leading-tight">Ataque e defesa</span></summary>
      <div class="px-3 pb-3 text-[15px] select-text">
        <p class="my-1.5 rounded-raio-p bg-aviso-fundo px-3 py-2.5 text-sm font-semibold text-aviso">A defesa protege a vida da nação. Enquanto um lado tiver combo na mesa, ninguém ataca a vida dele: primeiro é preciso derrubar o combo ou usar Perfurar.</p>
        <ul :class="clsLista + ' list-disc'">
          <li>Quem é atacado escolhe qual combo seu bloqueia.</li>
          <li>Ataque maior que a defesa: o combo de defesa vai para o descarte. A sobra se perde, a não ser com Perfurar.</li>
          <li>Ataque igual ou menor: nada acontece.</li>
          <li>Sem combo na mesa: o ataque vai direto na vida.</li>
          <li>Dano na vida da nação: quem atacou rouba 1 carta de missão.</li>
          <li>Vida zerada: as missões voltam para o fundo do monte e a vida volta para a inicial (15; a China, 13).</li>
        </ul>
      </div>
    </details>

    <details class="detalle rounded-raio-p border border-borda bg-superficie">
      <summary><span class="font-semibold leading-tight">Missões</span></summary>
      <div class="px-3 pb-3 text-[15px] select-text">
        <ul :class="clsLista + ' list-disc'">
          <li>Sempre há 3 missões abertas na mesa. O lado escolhe qual tentar.</li>
          <li>Para tentar, o lado avisa qual antes de atacar.</li>
          <li>O professor confere a lista na página Missão. Cumpriu? O lado pega a carta e uma nova missão é virada.</li>
          <li>Só o primeiro que cumprir ganha. Errou? O ataque vale, mas o lado não pega a carta.</li>
          <li>O combo que cumpriu a missão vai para o descarte: o prompt foi entregue.</li>
        </ul>
      </div>
    </details>

    <details class="detalle rounded-raio-p border border-borda bg-superficie">
      <summary><span class="font-semibold leading-tight">Ética e denúncia</span></summary>
      <div class="px-3 pb-3 text-[15px] select-text">
        <p class="my-1.5">Algumas cartas de contexto escondem um dado pessoal (nome, CPF, endereço, telefone, senha) ou um viés (generalizar um grupo de pessoas).</p>
        <ul :class="clsLista + ' list-disc'">
          <li><b>Denúncia certa:</b> quem denunciou ganha 2 de vida e o denunciado fica sem atacar no próximo turno.</li>
          <li>Com a ética que conserta, quem denunciou pode anular o combo no lugar de ganhar vida.</li>
          <li><b>Denúncia errada:</b> quem denunciou perde 2 de vida e o denunciado ganha 2.</li>
        </ul>
        <p class="my-1.5">O gabarito está na página <router-link to="/denuncia" class="text-destaque underline">Denúncia</router-link>.</p>
      </div>
    </details>

    <details class="detalle rounded-raio-p border border-borda bg-superficie">
      <summary><span class="font-semibold leading-tight">Nações: buff e debuff</span></summary>
      <div class="px-3 pb-3 text-[15px] select-text">
        <table class="my-1.5 w-full border-collapse text-sm">
          <thead>
            <tr><th :class="clsTh">Nação</th><th :class="clsTh">Buff</th><th :class="clsTh">Debuff</th></tr>
          </thead>
          <tbody>
            <tr v-for="n in nacoes" :key="n.codigo">
              <td :class="clsTd"><b>{{ n.nome }}</b></td>
              <td :class="clsTd">{{ n.buff }}</td>
              <td :class="clsTd">{{ n.debuff }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </details>

    <details class="detalle rounded-raio-p border border-borda bg-superficie">
      <summary><span class="font-semibold leading-tight">Fim da partida</span></summary>
      <div class="px-3 pb-3 text-[15px] select-text">
        <p class="my-1.5">A partida acaba quando termina o tempo (até 2 tempos de aula) ou quando acabam as missões.</p>
        <p class="my-1.5"><b>Vence quem tiver mais cartas de missão.</b> Empate: ganha quem tiver mais vida.</p>
        <p class="my-1.5">Para fechar a aula, cada lado lê em voz alta o combo da última missão que cumpriu, como se fosse o prompt que montou.</p>
      </div>
    </details>

    <p class="mx-1 mt-1 text-[13px] text-texto-2">Números de teste: vida 15, mão 6, limite 7, compra 3 e denúncia de 2. Podem mudar depois do playtest.</p>
  </main>

  <BottomMenu atual="regras" />
</template>
