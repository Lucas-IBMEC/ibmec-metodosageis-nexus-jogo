// Service worker: guarda o app no celular para funcionar sem internet (história 2.4.1).
// Ao mudar qualquer arquivo, aumente a VERSAO para os celulares baixarem de novo.

const VERSAO = 'magic-prompt-vue-3';
// SPA: agora só existe index.html (as páginas são rotas #/... no mesmo arquivo).
// Manifest, ícones e index são guardados na instalação; o JS/CSS com hash do
// build Vite são guardados pelo handler de fetch abaixo (primeiro a rede, depois
// o cache), então o app fica 100% offline depois da 1ª visita.
const ARQUIVOS = [
  './',
  './index.html',
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

// Só intercepta requests do próprio app (nunca de outro domínio).
self.addEventListener('fetch', (evento) => {
  if (evento.request.method !== 'GET') return;
  if (!evento.request.url.startsWith(self.location.origin)) return;

  // JS/CSS do build têm hash no nome (assets/index-abc123.js): quando o
  // arquivo muda, o nome muda junto, então uma cópia no cache é sempre a
  // certa → primeiro o cache (abre na hora, online ou offline), rede só na 1ª vez.
  if (evento.request.url.includes('/assets/')) {
    evento.respondWith(
      caches.match(evento.request).then((guardado) =>
        guardado ||
        fetch(evento.request).then((resposta) => {
          if (resposta.ok) {
            const copia = resposta.clone();
            caches.open(VERSAO).then((cache) => cache.put(evento.request, copia));
          }
          return resposta;
        }),
      ),
    );
    return;
  }

  // HTML e o resto: primeiro a rede (para pegar mudanças novas),
  // cache de reserva quando não há internet.
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
