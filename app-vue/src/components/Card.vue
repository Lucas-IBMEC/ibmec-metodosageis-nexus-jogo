<script setup>
import { useSlots } from 'vue'
// Equivale ao .bloco do app original. Aceita um título e/ou subtítulo opcionais;
// o resto vai no slot padrão. O título pode ser customizado via slot #title
// (ex.: com o número do passo, como nas páginas Missão).
const slots = useSlots()
const props = defineProps({
  title: { type: String, default: null },
  sub: { type: String, default: null },
})
</script>

<template>
  <section class="rounded-raio border border-borda bg-superficie p-4 shadow-card">
    <h2 v-if="props.title || slots.title" class="mb-1 text-[17px] font-bold">
      <slot name="title">{{ props.title }}</slot>
    </h2>
    <p v-if="props.sub" class="mb-3 text-sm text-texto-2">{{ props.sub }}</p>
    <slot />
  </section>
</template>
