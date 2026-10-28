<script setup>
// Página Cartas: consulta de qualquer carta pelo código ou pelo nome. História 2.3.1.
import { ref, computed } from 'vue'
import { DADOS } from '../data/dados.js'
import { normalizarCodigo } from '../lib/mp.js'
import AppHeader from '../components/AppHeader.vue'
import BottomMenu from '../components/BottomMenu.vue'
import Toast from '../components/Toast.vue'
import CodeBadge from '../components/CodeBadge.vue'

const FILTROS = [
  { nome: 'Todas', tipos: null },
  { nome: 'Contexto', tipos: ['Contexto'] },
  { nome: 'Precisão', tipos: ['Precisão'] },
  { nome: 'Missão', tipos: ['Missão'] },
  { nome: 'Dor, necessidade e conceito', tipos: ['Dor', 'Necessidade', 'Conceito'] },
  { nome: 'Formato', tipos: ['Formato'] },
  { nome: 'Documento', tipos: ['Documento'] },
  { nome: 'Ética', tipos: ['Ética'] },
  { nome: 'Persona', tipos: ['Persona'] },
  { nome: 'Nação', tipos: ['Nação'] },
]

const busca = ref('')
const filtro = ref(0)

// Busca sem ligar para acento nem maiúscula ("saude" acha "Saúde")
function simples(texto) {
  return String(texto ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

const achadas = computed(() => {
  const termo = simples(busca.value.trim())
  const codigo = normalizarCodigo(busca.value)
  const tipos = FILTROS[filtro.value].tipos
  const lista = DADOS.cartas.filter((c) => {
    if (tipos && !tipos.includes(c.tipo)) return false
    if (!termo) return true
    if (codigo && c.codigo === codigo) return true
    return simples(
      `${c.codigo} ${c.nome} ${c.texto || ''} ${c.assunto || ''} ${c.nacao || ''} ${c.estilo || ''}`,
    ).includes(termo)
  })
  // Código exato aparece primeiro
  lista.sort((a, b) => (b.codigo === codigo) - (a.codigo === codigo))
  return lista
})

function linhasDaCarta(c) {
  const linhas = []
  if (c.assunto) linhas.push(['Assunto', c.assunto])
  if (c.nacao) linhas.push(['Nação', c.nacao])
  if (c.numero !== undefined) linhas.push(['Número', `${c.numero} (a precisão precisa ficar entre ${c.numero - 2} e ${c.numero + 2})`])
  if (c.ataque !== undefined) linhas.push(['Ataque e defesa', `${c.ataque} e ${c.defesa}`])
  if (c.estilo) linhas.push(['Estilo', c.estilo])
  if (c.copias > 1) linhas.push(['Cópias no baralho', `${c.copias}, com o mesmo código`])
  if (c.efeito && c.tipo !== 'Contexto') linhas.push([c.tipo === 'Missão' ? 'O combo precisa ter' : 'Efeito', c.efeito.replace('Combo precisa ter: ', '')])
  if (c.texto && c.texto !== c.nome) linhas.push(['Texto da carta', `“${c.texto}”`])
  return linhas
}

function defeitoDe(c) {
  return DADOS.defeitos[c.codigo] || null
}
</script>

<template>
  <AppHeader title="Consultar carta" />

  <main
    class="mx-auto flex max-w-[640px] flex-col gap-3.5 px-4 pt-4 pb-[calc(var(--altura-menu)+env(safe-area-inset-bottom,0px)+24px)]"
  >
    <section class="rounded-raio border border-borda bg-superficie p-4 shadow-card">
      <label for="busca" class="mb-1.5 block text-[13px] font-bold text-texto-2">Código ou nome</label>
      <input
        id="busca"
        v-model="busca"
        type="search"
        class="campo"
        placeholder="Ex.: C01, dengue, Muralha"
        autocomplete="off"
        autocapitalize="none"
        autocorrect="off"
        spellcheck="false"
        enterkeyhint="search"
      >
      <div class="chips-rolagem mt-3" role="group" aria-label="Tipo de carta">
        <button
          v-for="(f, i) in FILTROS"
          :key="i"
          type="button"
          class="chip"
          :aria-pressed="String(i === filtro)"
          @click="filtro = i"
        >{{ f.nome }}</button>
      </div>
    </section>

    <p class="mx-1 text-[13px] text-texto-2" aria-live="polite">
      {{ achadas.length }} {{ achadas.length === 1 ? 'carta' : 'cartas' }}
    </p>

    <div class="flex flex-col gap-2">
      <details
        v-for="c in achadas"
        :key="c.codigo"
        class="detalle rounded-raio-p border border-borda bg-superficie"
      >
        <summary>
          <CodeBadge :codigo="c.codigo" :tipo="c.tipo" />
          <span>
            <span class="block font-semibold leading-tight">{{ c.nome }}</span>
            <span class="block text-xs font-semibold text-texto-2">{{ c.tipo }}</span>
          </span>
        </summary>
        <div class="px-3 pb-3 text-[15px]">
          <p v-for="(l, j) in linhasDaCarta(c)" :key="j" class="my-1.5">
            <b>{{ l[0] }}:</b> {{ l[1] }}
          </p>
          <details v-if="defeitoDe(c)" class="mt-2.5 rounded-raio-p border border-dashed border-erro p-2">
            <summary class="cursor-pointer font-bold text-erro">Gabarito do professor</summary>
            <p class="my-1"><b>{{ defeitoDe(c).problema }}:</b> {{ defeitoDe(c).oQueTem }}</p>
            <p class="my-1">{{ defeitoDe(c).porQue }}</p>
            <p class="my-1"><b>Conserta com:</b> {{ defeitoDe(c).consertaCom }}</p>
            <p class="my-1"><b>Consertada:</b> “{{ defeitoDe(c).versaoConsertada }}”</p>
          </details>
        </div>
      </details>
      <p v-if="!achadas.length" class="px-2 py-6 text-center text-texto-2">Nenhuma carta encontrada.</p>
    </div>
  </main>

  <BottomMenu atual="cartas" />
  <Toast />
</template>
