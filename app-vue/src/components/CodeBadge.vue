<script setup>
import { corDoTipo } from '../lib/mp.js'

const props = defineProps({
  codigo: { type: String, required: true },
  tipo: { type: String, default: null },
})
</script>

<template>
  <span
    class="inline-flex min-w-[44px] items-center justify-center rounded-lg px-2 py-0.5 text-[13px] font-extrabold tabular-nums text-white"
    :class="tipo ? corDoTipo(tipo) : 'bg-topo'"
  >{{ codigo }}</span>
</template>
