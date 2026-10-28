<script setup>
// Campo de código: o professor toca na letra do tipo e digita só o número
// (substitui MP.entradaDeCodigo do app original). Emite 'add' com a carta achada.
import { ref } from 'vue'
import { DADOS } from '../data/dados.js'
import { normalizarCodigo } from '../lib/mp.js'
import { avisar } from '../composables/useToast.js'

const props = defineProps({
  prefixos: { type: Array, required: true },
  inicial: { type: String, default: null },
  rotuloBotao: { type: String, default: 'Adicionar' },
})
const emit = defineEmits(['add'])

const prefixo = ref(props.inicial || props.prefixos[0])
const numero = ref('')
const campo = ref(null)

function escolher(p) {
  prefixo.value = p
  campo.value?.focus()
}

function submeter(evento) {
  evento.preventDefault()
  const digitado = numero.value.trim()
  if (!digitado) return
  const codigo = /^\d+$/.test(digitado)
    ? normalizarCodigo(prefixo.value + digitado)
    : normalizarCodigo(digitado)
  const carta = DADOS.porCodigo[codigo]
  if (!carta) {
    avisar(`Não existe carta ${codigo || digitado}`)
    return
  }
  numero.value = ''
  emit('add', carta)
}
</script>

<template>
  <div>
    <div role="group" aria-label="Tipo da carta" class="mb-2 grid grid-cols-6 gap-1.5">
      <button
        v-for="p in prefixos"
        :key="p"
        type="button"
        class="chip justify-center px-0"
        :aria-pressed="String(p === prefixo)"
        @click="escolher(p)"
      >{{ p }}</button>
    </div>
    <form class="flex items-center gap-2" novalidate @submit="submeter">
      <input
        ref="campo"
        v-model="numero"
        class="campo flex-1 min-w-0"
        inputmode="numeric"
        pattern="[0-9]*"
        autocomplete="off"
        enterkeyhint="done"
        aria-label="Número da carta"
        placeholder="Número, ex.: 1"
      >
      <button class="botao" type="submit">{{ rotuloBotao }}</button>
    </form>
    <p class="mt-1.5 text-[13px] text-texto-2">
      Também pode digitar o código inteiro, como C01 ou DC3.
    </p>
  </div>
</template>
