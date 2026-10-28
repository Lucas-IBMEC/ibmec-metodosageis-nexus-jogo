import { createRouter, createWebHistory } from 'vue-router'
import Partida from './pages/Partida.vue' // rota inicial: importa na hora, sem esperar chunk

// SPA de 5 rotas. HTML5 history (URLs limpas, ex.: /missao) com o base do
// Vite (import.meta.env.BASE_URL), combinando com o base './' da config.
// Só a Partida (rota inicial) é importada de forma síncrona; as demais
// carregam sob demanda → no dev a 1ª carga compila só o que a rota ativa
// precisa (cascata de requests bem menor, página abre na hora). No build,
// o inlineDynamicImports (vite.config.js) junta tudo de novo num único
// bundle, então o app inteiro fica no cache do service worker e continua
// 100% offline depois da 1ª visita.
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'partida', component: Partida },
    { path: '/missao', name: 'missao', component: () => import('./pages/Missao.vue') },
    { path: '/denuncia', name: 'denuncia', component: () => import('./pages/Denuncia.vue') },
    { path: '/cartas', name: 'cartas', component: () => import('./pages/Cartas.vue') },
    { path: '/regras', name: 'regras', component: () => import('./pages/Regras.vue') },
    // Rota desconhecida volta para a partida
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

export default router
