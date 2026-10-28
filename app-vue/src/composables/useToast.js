import { ref } from 'vue'

// Aviso rápido no rodapé (equivale ao MP.aviso do app original).
// Um store global do módulo: qualquer parte da página pode avisar, e o
// <Toast /> lê a mesma ref.
const mensagem = ref('')
const visivel = ref(false)
let timer

export function avisar(texto) {
  mensagem.value = texto
  visivel.value = true
  clearTimeout(timer)
  timer = setTimeout(() => {
    visivel.value = false
  }, 2400)
}

export function useToast() {
  return { mensagem, visivel, avisar }
}
