<script setup>
import { computed } from 'vue'
import { useToast } from '../composables/useToast.js'

const { mensagem, visivel } = useToast()
const props = defineProps({ extra: { type: Number, default: 16 } })

const bottom = computed(
  () => `calc(var(--altura-menu) + env(safe-area-inset-bottom, 0px) + ${props.extra}px)`,
)
</script>

<template>
  <div
    role="status"
    class="pointer-events-none fixed left-1/2 z-30 -translate-x-1/2 rounded-full bg-texto px-4 py-2.5 text-sm font-semibold text-fundo"
    :class="visivel ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'"
    :style="{
      bottom,
      maxWidth: 'calc(100% - 32px)',
      textAlign: 'center',
      transition: 'opacity 200ms var(--suave), transform 200ms var(--suave)',
    }"
  >
    {{ mensagem }}
  </div>
</template>
