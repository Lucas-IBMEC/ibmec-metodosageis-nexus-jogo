import { createApp } from 'vue'
import App from './App.vue'
import router from './router.js'
import './styles/app.css'

const app = createApp(App)
app.use(router)
app.mount('#app')

// Service worker: guarda o app para funcionar sem internet (história 2.4.1).
// Registrado uma vez, na raiz do app, independente de qual rota é aberta.
// SÓ em produção: no dev, um SW intercepta cada módulo que o Vite serve (sem
// hash no nome), atrasa a carga, pode servir código antigo e quebra o reload.
// No dev, desregistra também qualquer SW zumbi que uma versão anterior do
// app tenha deixado no navegador (ele continuaria interceptando os requests).
function registrarOffline() {
  try {
    if (!('serviceWorker' in navigator)) return
    if (import.meta.env.PROD && location.protocol.startsWith('http')) {
      navigator.serviceWorker.register('sw.js').catch(() => {})
    } else {
      navigator.serviceWorker
        .getRegistrations()
        .then((regs) => regs.forEach((r) => r.unregister()))
    }
  } catch {
    // O app funciona igual, só precisa de internet
  }
}
registrarOffline()
