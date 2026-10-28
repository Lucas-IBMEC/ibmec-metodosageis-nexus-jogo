// As 5 páginas do app (mesma ordem do menu de baixo) e seus ícones em SVG.
// Ícones desenhados em SVG para funcionarem sem internet.
// `caminho` é a rota do vue-router (o app é um SPA com hash: #/missao, etc.).

export const PAGINAS = [
  { id: 'partida', caminho: '/', nome: 'Partida' },
  { id: 'missao', caminho: '/missao', nome: 'Missão' },
  { id: 'denuncia', caminho: '/denuncia', nome: 'Denúncia' },
  { id: 'cartas', caminho: '/cartas', nome: 'Cartas' },
  { id: 'regras', caminho: '/regras', nome: 'Regras' },
]

export const ICONES = {
  partida: '<path d="M12 8v5l3 2"/><circle cx="12" cy="13" r="8"/><path d="M9 2h6"/>',
  missao: '<path d="M4 4h16v16H4z"/><path d="m8 12 3 3 5-6"/>',
  denuncia: '<path d="M5 21V4"/><path d="M5 4h11l-2 4 2 4H5"/>',
  cartas: '<rect x="3" y="5" width="12" height="16" rx="2"/><path d="M9 3h10a2 2 0 0 1 2 2v12"/>',
  regras: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M8 7h7M8 11h7"/>',
}
