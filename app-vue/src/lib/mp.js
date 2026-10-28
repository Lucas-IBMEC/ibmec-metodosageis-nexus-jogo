// Funções puras usadas por todas as páginas (o equivalente ao objeto MP
// do app original). Não mexe em DOM aqui — o Vue cuida da renderização.
import { DADOS } from '../data/dados.js'

// Escapa HTML (o Vue já escapa strings no template, mas alguns casos pedem —
// ex.: aria-label, ou quando vamos injetar com v-html).
export function esc(texto) {
  return String(texto ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ))
}

// Aceita "c1", "C01", "dc 3", "p 12" e devolve o código certo ("C01", "DC3", "P12")
export function normalizarCodigo(texto) {
  const m = String(texto).toUpperCase().replace(/\s+/g, '').match(/^([A-Z]+)0*(\d+)$/)
  if (!m) return ''
  const [, letras, numero] = m
  const comDoisDigitos = ['M', 'C', 'D', 'P', 'F', 'E']
  return letras + (comDoisDigitos.includes(letras) ? numero.padStart(2, '0') : numero)
}

export function buscarCarta(codigo) {
  return DADOS.porCodigo[normalizarCodigo(codigo)] || null
}

// Cor de fundo do badge de código, por tipo de carta (mesma cor da carta impressa)
export const COR_TIPO = {
  'Missão': 'bg-c-missao',
  'Persona': 'bg-c-persona',
  'Contexto': 'bg-c-contexto',
  'Dor': 'bg-c-dnc',
  'Necessidade': 'bg-c-dnc',
  'Conceito': 'bg-c-dnc',
  'Precisão': 'bg-c-precisao',
  'Formato': 'bg-c-formato',
  'Documento': 'bg-c-documento',
  'Ética': 'bg-c-etica',
  'Nação': 'bg-c-nacao',
}

export function corDoTipo(tipo) {
  return COR_TIPO[tipo] || ''
}

// ---------- Persistência no celular (a partida continua mesmo trocando de página) ----------

export function ler(chave, padrao) {
  try {
    const valor = localStorage.getItem(chave)
    return valor ? JSON.parse(valor) : padrao
  } catch {
    return padrao
  }
}

export function salvar(chave, valor) {
  try {
    localStorage.setItem(chave, JSON.stringify(valor))
  } catch {
    // Sem espaço ou navegação privada: o app continua, só não guarda
  }
}

export function apagar(chave) {
  try {
    localStorage.removeItem(chave)
  } catch {
    // Sem acesso: nada a apagar
  }
}

export function plural(n, umNome, variosNomes) {
  return `${n} ${n === 1 ? umNome : variosNomes}`
}

export function lerPartida() {
  return ler('mp-partida', null)
}

export function salvarPartida(partida) {
  salvar('mp-partida', partida)
}

// Vida inicial de cada nação (15; a China começa com 13)
export function vidaInicial(codigoDaNacao) {
  return DADOS.porCodigo[codigoDaNacao]?.vida || 15
}
