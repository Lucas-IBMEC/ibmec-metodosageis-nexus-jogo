<script setup>
// Chip de carta no combo (substitui MP.chipDeCarta). Mostra o badge de código
// com a cor do tipo, o nome e (se removível) um botão × para tirar do combo.
import CodeBadge from './CodeBadge.vue'

const props = defineProps({
  carta: { type: Object, required: true },
  removivel: { type: Boolean, default: false },
})
const emit = defineEmits(['remove'])
</script>

<template>
  <span class="inline-flex items-center gap-1.5 rounded-[12px] border border-borda bg-superficie py-1 pl-1 pr-1.5 text-sm">
    <CodeBadge :codigo="carta.codigo" :tipo="carta.tipo" />
    <span class="text-left">{{ carta.nome }}</span>
    <button
      v-if="removivel"
      type="button"
      class="ml-0.5 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-superficie-2 text-base text-texto-2"
      :aria-label="`Tirar ${carta.codigo}`"
      @click="emit('remove', carta)"
    >×</button>
  </span>
</template>
