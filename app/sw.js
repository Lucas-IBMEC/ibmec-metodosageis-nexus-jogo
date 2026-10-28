// Service worker: guarda o app no celular para funcionar sem internet (história 2.4.1).
// Ao mudar qualquer arquivo, aumente a VERSAO para os celulares baixarem de novo.

const VERSAO = 'magic-prompt-v2';
const ARQUIVOS = [
  './',
  './index.html',
  './missao.html',
  './denuncia.html',
  './cartas.html',
  './regras.html',
  './css/app.css',
  './js/dados.js',
  './js/respostas.js',
  './js/comum.js',
  './js/partida.js',
  './js/missao.js',
  './js/denuncia.js',
  './js/cartas.js',
  './manifest.webmanifest',
  './icones/icone.svg',
  './icones/icone-192.png',
  './icones/icone-512.png',
];

self.addEventListener('install', (evento) => {
  evento.waitUntil(caches.open(VERSAO).then((cache) => cache.addAll(ARQUIVOS)));
  self.skipWaiting();
});

self.addEventListener('activate', (evento) => {
  // Apaga as versões antigas
  evento.waitUntil(caches.keys().then((nomes) => Promise.all(
    nomes.filter((nome) => nome !== VERSAO).map((nome) => caches.delete(nome)),
  )));
  self.clients.claim();
});

// Com internet, busca a versão nova (e guarda uma cópia). Sem internet, usa a cópia guardada.
self.addEventListener('fetch', (evento) => {
  if (evento.request.method !== 'GET') return;
  evento.respondWith(
    fetch(evento.request)
      .then((resposta) => {
        // Só guarda o que veio certo (não guarda página de erro)
        if (resposta.ok) {
          const copia = resposta.clone();
          caches.open(VERSAO).then((cache) => cache.put(evento.request, copia));
        }
        return resposta;
      })
      .catch(() => caches.match(evento.request, { ignoreSearch: true })),
  );
});
