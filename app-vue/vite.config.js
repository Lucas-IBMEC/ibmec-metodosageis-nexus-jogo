import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// App de página única (SPA): as 5 "páginas" do app original viraram rotas
// (#/partida, #/missao, #/denuncia, #/cartas, #/regras) via vue-router.
// base: './' para poder morar em qualquer subpasta (ex.: GitHub Pages).
export default defineConfig({
  base: './',
  plugins: [vue(), tailwindcss()],
  server: {
    // Assim que o server sobe, compila em segundo fundo todo o grafo de
    // imports do index.html — a 1ª carga no navegador não paga a compilação.
    warmup: { clientFiles: ['index.html'] },
  },
  build: {
    // No dev as rotas são lazy (1ª carga compila só a rota ativa, mais rápido).
    // No build, codeSplitting: false junta tudo num único bundle — assim o
    // service worker guarda um arquivo só e o app segue 100% offline (2.4.1).
    rollupOptions: {
      output: {
        codeSplitting: false,
      },
    },
  },
})
