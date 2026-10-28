<script setup>
import { PAGINAS, ICONES } from '../lib/paginas.js'

defineProps({ atual: { type: String, required: true } })

function iconeSvg(id) {
  return `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONES[id]}</svg>`
}
</script>

<template>
  <nav
    class="fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t border-borda bg-superficie pb-[env(safe-area-inset-bottom,0px)] min-[720px]:left-1/2 min-[720px]:right-auto min-[720px]:w-[640px] min-[720px]:-translate-x-1/2 min-[720px]:rounded-t-raio min-[720px]:border min-[720px]:border-b-0"
    aria-label="Páginas"
  >
    <!-- Ativa: só muda a cor do ícone e do texto (azul de destaque). Sem fundo.
         Atenção: a cor base (text-texto-2) fica no :class, nunca na class estática —
         se ficar nas duas, o Tailwind emite .text-texto-2 depois de .text-destaque
         no CSS e o cinza ganha sempre (o azul ativo não aparece). -->
    <router-link
      v-for="p in PAGINAS"
      :key="p.id"
      :to="p.caminho"
      :aria-current="p.id === atual ? 'page' : undefined"
      class="flex min-h-[var(--altura-menu)] flex-col items-center justify-center gap-[3px] text-xs font-semibold no-underline transition-colors duration-150 min-[720px]:min-h-[64px]"
      :class="p.id === atual ? 'text-destaque' : 'text-texto-2 hover:text-destaque'"
    >
      <span v-html="iconeSvg(p.id)"></span>
      {{ p.nome }}
    </router-link>
  </nav>
</template>
