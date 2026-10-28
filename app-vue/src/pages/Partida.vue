<script setup>
// Página Partida: monta a partida, mostra o placar e marca o tempo de cada turno.
// Histórias: 2.5.1 (vida e efeitos de cada lado) e o cronômetro de 40 segundos.
import { ref, reactive, computed, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { DADOS } from '../data/dados.js'
import { vidaInicial, lerPartida, salvarPartida, apagar, plural } from '../lib/mp.js'
import { avisar } from '../composables/useToast.js'
import AppHeader from '../components/AppHeader.vue'
import BottomMenu from '../components/BottomMenu.vue'
import Toast from '../components/Toast.vue'
import Card from '../components/Card.vue'
import CodeBadge from '../components/CodeBadge.vue'

const DURACAO_DO_TURNO = 40
const VOLTA_DO_RELOGIO = 2 * Math.PI * 28 // tamanho do círculo do cronômetro

const NACOES = DADOS.cartas.filter((c) => c.tipo === 'Nação')
const PERSONAS = DADOS.cartas.filter((c) => c.tipo === 'Persona')

const MODOS = {
  duelo: { min: 2, max: 2, padrao: 2, nome: 'Lado', texto: '1 contra 1, ou dupla contra dupla (cada dupla é um lado).' },
  mesa: { min: 3, max: 5, padrao: 3, nome: 'Lado', texto: 'Cada lado é 1 aluno ou 1 dupla. Todos contra todos: no ataque, o lado escolhe quem atacar.' },
  turma: { min: 2, max: 5, padrao: 5, nome: 'Grupo', texto: 'Cada grupo é uma nação. Os papéis (Capitão, Montador, Fiscal e Placar) trocam a cada turno.' },
}
// Rótulos que aparecem nos botões de modo (o nome do modo + faixa de alunos)
const ROTULOS_MODOS = {
  duelo: { titulo: 'Duelo', sub: '2 a 4 alunos' },
  mesa: { titulo: 'Mesa', sub: '3 a 10 alunos' },
  turma: { titulo: 'Turma', sub: 'até 40 alunos' },
}

const partida = ref(lerPartida())

// ---------- Tela 1: montar a partida ----------

const config = reactive({
  modo: 'duelo',
  quantos: MODOS.duelo.padrao,
  lados: Array.from({ length: MODOS.duelo.padrao }, (_, i) => ({ nome: '', nacao: NACOES[i].codigo })),
})

function sincronizarLados() {
  while (config.lados.length < config.quantos) config.lados.push({ nome: '', nacao: NACOES[config.lados.length].codigo })
  while (config.lados.length > config.quantos) config.lados.pop()
}

function escolherModo(modo) {
  config.modo = modo
  config.quantos = MODOS[modo].padrao
  sincronizarLados()
}

function mudarQuantos(delta) {
  const modo = MODOS[config.modo]
  config.quantos = Math.min(modo.max, Math.max(modo.min, config.quantos + delta))
  sincronizarLados()
}

function nomeDoLado(i) {
  return `${MODOS[config.modo].nome} ${i + 1}`
}

function comecarPartida() {
  const nacoes = config.lados.map((l) => l.nacao)
  if (new Set(nacoes).size !== nacoes.length) {
    avisar('Cada lado precisa de uma nação diferente')
    return
  }
  const nome = MODOS[config.modo].nome
  partida.value = {
    modo: config.modo,
    lados: config.lados.map((l, i) => ({
      nome: l.nome.trim() || `${nome} ${i + 1}`,
      nacao: l.nacao,
      vida: vidaInicial(l.nacao),
      missoes: 0,
      semAtacar: false,
      semAtacarNoTurno: 0,
    })),
    vez: null,
    turno: 0,
    persona: '', // só uma persona fica na mesa e vale para todos os lados
    cronometro: { fim: null, restante: DURACAO_DO_TURNO, esgotou: false },
  }
  salvarPartida(partida.value)
}

// ---------- Tela 2: placar ----------

const escolhendo = computed(() => partida.value?.vez === null)
const comBarra = computed(() => Boolean(partida.value) && !escolhendo.value)

function infoNacao(codigo) {
  const n = DADOS.porCodigo[codigo]
  const [buff, debuff] = n.efeito.replace('Buff: ', '').split(' · Debuff: ')
  return { nome: n.nome, buff, debuff }
}

function mudarLado(i, acao, delta = 0) {
  const lado = partida.value.lados[i]
  if (acao === 'vida') lado.vida = Math.max(0, lado.vida + delta)
  else if (acao === 'missoes') lado.missoes = Math.max(0, lado.missoes + delta)
  else if (acao === 'sem-atacar') {
    lado.semAtacar = !lado.semAtacar
    lado.semAtacarNoTurno = partida.value.turno
  } else if (acao === 'zerou') {
    // Regra: vida zerada devolve as missões para o fundo do monte e volta com a vida cheia
    lado.missoes = 0
    lado.vida = vidaInicial(lado.nacao)
    avisar(`${lado.nome}: missões devolvidas ao monte, vida ${lado.vida}`)
  }
  salvarPartida(partida.value)
}

function escolherQuemComeca(i) {
  partida.value.vez = i
  partida.value.turno = 1
  partida.value.cronometro = { fim: null, restante: DURACAO_DO_TURNO, esgotou: false }
  salvarPartida(partida.value)
}

function proximoTurno() {
  prepararSom()
  const saindo = partida.value.lados[partida.value.vez]
  // O "sem atacar" vale por um turno inteiro daquele lado
  if (saindo.semAtacar && saindo.semAtacarNoTurno < partida.value.turno) saindo.semAtacar = false
  partida.value.vez = (partida.value.vez + 1) % partida.value.lados.length
  partida.value.turno += 1
  iniciarCronometro()
  // Com muitos grupos, leva a tela até o lado da vez
  nextTick(() => {
    document.querySelector('.lado.da-vez')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  })
}

// Persona na mesa: a precisão do mesmo assunto ganha +1 de ataque, em qualquer combo
const personaAtual = computed(() => partida.value?.persona || '')
const personaCarta = computed(() => DADOS.porCodigo[personaAtual.value] || null)
const efeitoPersona = computed(() =>
  personaCarta.value
    ? `${personaCarta.value.nome}: toda precisão de ${personaCarta.value.assunto} ganha +1 de ataque, em qualquer combo.`
    : 'Nenhuma persona na mesa. Quando alguém jogar uma, toque nela aqui.',
)
const opcoesPersona = computed(() => [{ codigo: '', nome: 'Nenhuma' }, ...PERSONAS])

function trocarPersona(codigo) {
  partida.value.persona = codigo
  salvarPartida(partida.value)
  avisar(codigo ? `${DADOS.porCodigo[codigo].nome} na mesa` : 'Persona tirada da mesa')
}

const avisoTurno = computed(() => {
  if (!partida.value || escolhendo.value) return ''
  if (partida.value.cronometro.esgotou) {
    return 'Tempo esgotado! O turno passa sem ataque. Os combos montados ficam na mesa.'
  }
  const lado = partida.value.lados[partida.value.vez]
  const avisos = []
  if (partida.value.turno === 1) avisos.push('1º turno: quem começa não compra cartas.')
  if (lado.semAtacar && lado.semAtacarNoTurno < partida.value.turno) avisos.push(`${lado.nome} não pode atacar neste turno (denúncia).`)
  return avisos.join(' ')
})

// ---------- Cronômetro ----------

const tick = ref(0)
let intervalo = null

function ativarIntervalo() {
  if (intervalo) return
  intervalo = setInterval(() => {
    tick.value++
    atualizarRelogio()
  }, 250)
}
function pararIntervalo() {
  if (intervalo) {
    clearInterval(intervalo)
    intervalo = null
  }
}

function restanteDe(c) {
  if (!c) return DURACAO_DO_TURNO
  return c.fim ? Math.max(0, (c.fim - Date.now()) / 1000) : c.restante
}

function iniciarCronometro() {
  partida.value.cronometro = { fim: Date.now() + DURACAO_DO_TURNO * 1000, restante: DURACAO_DO_TURNO, esgotou: false }
  salvarPartida(partida.value)
  manterTelaLigada()
}

function botaoDoCronometro() {
  const c = partida.value.cronometro
  if (c.fim) {
    partida.value.cronometro = { fim: null, restante: restanteDe(c), esgotou: false }
    salvarPartida(partida.value)
  } else if (c.esgotou || c.restante >= DURACAO_DO_TURNO) {
    iniciarCronometro()
  } else {
    partida.value.cronometro.fim = Date.now() + c.restante * 1000
    salvarPartida(partida.value)
    manterTelaLigada()
  }
  prepararSom()
  atualizarRelogio()
}

// Quando o tempo chega a zero: marca como esgotado e toca o alarme
function atualizarRelogio() {
  if (!partida.value || partida.value.vez === null) return
  const c = partida.value.cronometro
  if (c.fim && restanteDe(c) <= 0) {
    partida.value.cronometro = { fim: null, restante: 0, esgotou: true }
    salvarPartida(partida.value)
    tocarAlarme()
  }
}

const segundos = computed(() => {
  void tick.value
  if (!partida.value || partida.value.vez === null) return DURACAO_DO_TURNO
  return Math.ceil(restanteDe(partida.value.cronometro))
})
const arcoOffset = computed(() => {
  void tick.value
  if (!partida.value || partida.value.vez === null) return 0
  const c = partida.value.cronometro
  const fracao = c.esgotou ? 1 : restanteDe(c) / DURACAO_DO_TURNO
  return VOLTA_DO_RELOGIO * (1 - fracao)
})
const relogioPouco = computed(() => {
  void tick.value
  if (!partida.value || partida.value.vez === null) return false
  const s = Math.ceil(restanteDe(partida.value.cronometro))
  return s <= 10 && s > 0
})
const relogioFim = computed(() => partida.value?.cronometro?.esgotou === true)
const textoBotaoCronometro = computed(() => {
  void tick.value
  const c = partida.value?.cronometro
  if (!c) return 'Iniciar'
  if (c.fim) return 'Pausar'
  if (c.esgotou) return 'Reiniciar'
  return Math.ceil(restanteDe(c)) >= DURACAO_DO_TURNO ? 'Iniciar' : 'Continuar'
})

// Som e vibração quando o tempo acaba (o som só pode tocar depois de um toque na tela)
let audio = null
function prepararSom() {
  if (!audio && window.AudioContext) audio = new AudioContext()
}
function tocarAlarme() {
  if (navigator.vibrate) navigator.vibrate([250, 120, 250])
  if (!audio) return
  ;[0, 0.3].forEach((atraso) => {
    const osc = audio.createOscillator()
    const volume = audio.createGain()
    osc.frequency.value = 880
    volume.gain.setValueAtTime(0.25, audio.currentTime + atraso)
    volume.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + atraso + 0.22)
    osc.connect(volume).connect(audio.destination)
    osc.start(audio.currentTime + atraso)
    osc.stop(audio.currentTime + atraso + 0.25)
  })
}

// Não deixa a tela do celular apagar durante a partida
let travaDaTela = null
async function manterTelaLigada() {
  try {
    if ('wakeLock' in navigator && !travaDaTela) {
      travaDaTela = await navigator.wakeLock.request('screen')
      travaDaTela.addEventListener('release', () => { travaDaTela = null })
    }
  } catch {
    // Alguns navegadores não deixam: a partida funciona igual
  }
}

// ---------- Fim da partida ----------

const fimDialog = ref(null)
const confirmarDialog = ref(null)

const ranking = computed(() =>
  partida.value ? [...partida.value.lados].sort((a, b) => b.missoes - a.missoes || b.vida - a.vida) : [],
)

function encerrar() {
  fimDialog.value.showModal()
}
function pedirNovaPartida() {
  if (fimDialog.value?.open) fimDialog.value.close()
  confirmarDialog.value.showModal()
}
function novaPartida() {
  partida.value = null
  apagar('mp-partida')
  confirmarDialog.value.close()
  window.scrollTo({ top: 0 })
}
function voltarJogo() {
  fimDialog.value.close()
}
function cancelarNova() {
  confirmarDialog.value.close()
}

// ---------- Ligações / ciclo de vida ----------

function onVisibilidade() {
  if (document.visibilityState === 'visible' && partida.value?.cronometro?.fim) manterTelaLigada()
}
function onPageshow() {
  // Outra página (Missão ou Denúncia) pode ter mudado o placar
  partida.value = lerPartida()
}

onMounted(() => {
  ativarIntervalo()
  document.addEventListener('visibilitychange', onVisibilidade)
  window.addEventListener('pageshow', onPageshow)
})
onBeforeUnmount(() => {
  pararIntervalo()
  document.removeEventListener('visibilitychange', onVisibilidade)
  window.removeEventListener('pageshow', onPageshow)
})
</script>

<template>
  <AppHeader title="Partida" />

  <main
    class="mx-auto flex max-w-[640px] flex-col gap-3.5 px-4 pt-4"
    :class="comBarra
      ? 'pb-[calc(var(--altura-menu)+env(safe-area-inset-bottom,0px)+112px)]'
      : 'pb-[calc(var(--altura-menu)+env(safe-area-inset-bottom,0px)+24px)]'"
  >
    <!-- Tela 1: montar a partida -->
    <template v-if="!partida">
      <Card title="Nova partida" sub="Escolha o modo e a nação de cada lado. Só você usa o celular.">
        <span class="mb-1.5 mt-2.5 block text-[13px] font-bold text-texto-2">Modo de jogo</span>
        <div class="grid grid-cols-3 gap-2">
          <button
            v-for="(rotulo, key) in ROTULOS_MODOS"
            :key="key"
            type="button"
            class="modo"
            :aria-pressed="String(config.modo === key)"
            @click="escolherModo(key)"
          >
            <b class="block text-base">{{ rotulo.titulo }}</b>
            <span class="text-xs text-texto-2">{{ rotulo.sub }}</span>
          </button>
        </div>
        <p class="mt-2 text-[13px] text-texto-2">{{ MODOS[config.modo].texto }}</p>

        <span class="mb-1.5 mt-2.5 block text-[13px] font-bold text-texto-2">
          {{ config.modo === 'turma' ? 'Quantos grupos' : 'Quantos lados' }}
        </span>
        <div class="flex max-w-[220px] items-center justify-between rounded-raio-p bg-superficie-2 p-1.5">
          <button type="button" class="mais-menos" :disabled="config.quantos <= MODOS[config.modo].min" aria-label="Menos" @click="mudarQuantos(-1)">−</button>
          <div class="text-center leading-none tabular-nums">
            <b class="block text-3xl font-extrabold">{{ config.quantos }}</b>
            <span class="text-[11px] font-bold uppercase tracking-[0.06em] text-texto-2">{{ config.modo === 'turma' ? 'grupos' : 'lados' }}</span>
          </div>
          <button type="button" class="mais-menos" :disabled="config.quantos >= MODOS[config.modo].max" aria-label="Mais" @click="mudarQuantos(1)">+</button>
        </div>

        <div v-for="(l, i) in config.lados" :key="i" class="mt-2 grid grid-cols-2 gap-2">
          <input class="campo" v-model="l.nome" :placeholder="nomeDoLado(i)" :aria-label="`Nome do ${MODOS[config.modo].nome.toLowerCase()} ${i + 1}`" autocomplete="off">
          <select class="campo" v-model="l.nacao" :aria-label="`Nação do ${MODOS[config.modo].nome.toLowerCase()} ${i + 1}`">
            <option v-for="n in NACOES" :key="n.codigo" :value="n.codigo">{{ n.nome }}</option>
          </select>
        </div>

        <button type="button" class="botao largo mt-4" @click="comecarPartida">Começar partida</button>
      </Card>

      <Card title="Antes de começar">
        <ol class="m-0 list-decimal space-y-1 pl-5">
          <li>Separe 4 montes embaralhados: Missões, Contextos, Precisões e Geral.</li>
          <li>Vire 3 missões para cima e 4 cartas do Geral ao lado dele (o mercado).</li>
          <li>Cada lado compra 6 cartas: 2 contextos, 2 precisões e 2 do Geral.</li>
          <li>Marque a vida inicial na carta da nação (15; a China começa com 13).</li>
        </ol>
        <p class="mt-2 text-[13px] text-texto-2">
          O passo a passo completo está em <router-link to="/regras" class="text-destaque underline">Regras</router-link>.
        </p>
      </Card>
    </template>

    <!-- Tela 2: placar da partida -->
    <template v-else>
      <Card
        v-if="escolhendo"
        title="Quem começa?"
        sub="Cada lado compra 1 carta de contexto. Quem tirar o maior número começa. Empate: só os empatados compram de novo. Depois, as cartas voltam para o monte."
      >
        <div class="flex flex-wrap gap-2">
          <button v-for="(lado, i) in partida.lados" :key="i" type="button" class="chip" @click="escolherQuemComeca(i)">{{ lado.nome }}</button>
        </div>
      </Card>

      <div v-if="!escolhendo" class="flex items-center justify-between gap-2.5 rounded-raio bg-vez px-4 py-3 text-white">
        <div>
          <small class="opacity-80">Vez de</small><br>
          <strong class="text-xl">{{ partida.lados[partida.vez].nome }}</strong>
        </div>
        <small class="opacity-80">Turno {{ partida.turno }}</small>
      </div>

      <p v-if="avisoTurno" class="rounded-raio-p bg-aviso-fundo px-3 py-2.5 text-sm font-semibold text-aviso">{{ avisoTurno }}</p>

      <Card v-if="!escolhendo" title="Persona na mesa" :sub="efeitoPersona">
        <div class="chips-rolagem" role="group" aria-label="Persona na mesa">
          <button
            v-for="p in opcoesPersona"
            :key="p.codigo"
            type="button"
            class="chip"
            :aria-pressed="String(p.codigo === personaAtual)"
            @click="trocarPersona(p.codigo)"
          >
            <CodeBadge v-if="p.codigo" :codigo="p.codigo" tipo="Persona" />
            {{ p.nome }}<template v-if="p.assunto"> · {{ p.assunto }}</template>
          </button>
        </div>
      </Card>

      <div class="flex flex-col gap-3">
        <article
          v-for="(lado, i) in partida.lados"
          :key="i"
          class="lado rounded-raio bg-superficie p-3.5 shadow-card transition-[border-color,box-shadow] duration-150"
          :class="i === partida.vez ? 'da-vez border-2 border-destaque ring-4 ring-destaque/15' : 'border border-borda'"
        >
          <div class="flex items-center justify-between gap-2">
            <div>
              <p class="text-lg font-extrabold">{{ lado.nome }}</p>
              <span class="text-[13px] font-bold text-c-nacao">{{ infoNacao(lado.nacao).nome }}</span>
            </div>
            <span v-if="i === partida.vez" class="inline-flex min-w-[44px] items-center justify-center rounded-lg bg-destaque px-2 py-0.5 text-[13px] font-extrabold tabular-nums text-destaque-texto">VEZ</span>
          </div>
          <p class="mt-0.5 text-[12.5px] text-texto-2">▲ {{ infoNacao(lado.nacao).buff }} · ▼ {{ infoNacao(lado.nacao).debuff }}</p>

          <div class="mt-3 grid grid-cols-[1.4fr_1fr] gap-2.5">
            <div class="flex items-center justify-between rounded-raio-p bg-superficie-2 p-1.5">
              <button type="button" class="mais-menos" :aria-label="`Tirar 1 de vida de ${lado.nome}`" @click="mudarLado(i, 'vida', -1)">−</button>
              <div class="text-center leading-none tabular-nums">
                <b class="block text-[38px] font-extrabold">{{ lado.vida }}</b>
                <span class="text-[11px] font-bold uppercase tracking-[0.06em] text-texto-2">Vida</span>
              </div>
              <button type="button" class="mais-menos" :aria-label="`Dar 1 de vida a ${lado.nome}`" @click="mudarLado(i, 'vida', 1)">+</button>
            </div>
            <div class="flex items-center justify-between rounded-raio-p bg-superficie-2 p-1.5">
              <button type="button" class="mais-menos" :aria-label="`Tirar 1 missão de ${lado.nome}`" @click="mudarLado(i, 'missoes', -1)">−</button>
              <div class="text-center leading-none tabular-nums">
                <b class="block text-3xl font-extrabold">{{ lado.missoes }}</b>
                <span class="text-[11px] font-bold uppercase tracking-[0.06em] text-texto-2">Missões</span>
              </div>
              <button type="button" class="mais-menos" :aria-label="`Dar 1 missão a ${lado.nome}`" @click="mudarLado(i, 'missoes', 1)">+</button>
            </div>
          </div>

          <div class="mt-2.5">
            <button type="button" class="chip" :aria-pressed="String(lado.semAtacar)" @click="mudarLado(i, 'sem-atacar')">
              {{ lado.semAtacar ? '⛔ Sem atacar no próximo turno' : 'Marcar: sem atacar no próximo turno' }}
            </button>
          </div>

          <div v-if="lado.vida <= 0" class="mt-2.5 flex items-center justify-between gap-2 rounded-raio-p bg-erro-fundo px-3 py-2.5 font-semibold text-erro">
            Vida zerada
            <button type="button" class="botao secundario" @click="mudarLado(i, 'zerou')">Devolver missões e voltar com {{ vidaInicial(lado.nacao) }}</button>
          </div>
        </article>
      </div>

      <div class="acoes">
        <button type="button" class="botao secundario" @click="encerrar">Encerrar partida</button>
        <button type="button" class="botao perigo" @click="pedirNovaPartida">Nova partida</button>
      </div>
    </template>
  </main>

  <!-- Cronômetro do turno, preso em cima do menu -->
  <div
    v-if="comBarra"
    class="fixed inset-x-0 z-[15] border-t border-borda bg-superficie px-4 py-2.5"
    :style="{ bottom: 'calc(var(--altura-menu) + env(safe-area-inset-bottom, 0px))' }"
  >
    <div class="mx-auto flex max-w-[640px] items-center gap-3">
      <div class="relogio" :class="{ pouco: relogioPouco, fim: relogioFim }" role="timer" aria-label="Tempo do turno">
        <svg viewBox="0 0 64 64" aria-hidden="true">
          <circle class="trilho" cx="32" cy="32" r="28"></circle>
          <circle class="arco" cx="32" cy="32" r="28" :stroke-dasharray="VOLTA_DO_RELOGIO" :stroke-dashoffset="arcoOffset"></circle>
        </svg>
        <span class="seg">{{ segundos }}</span>
      </div>
      <button type="button" class="botao secundario flex-1" @click="botaoDoCronometro">{{ textoBotaoCronometro }}</button>
      <button type="button" class="botao flex-1" @click="proximoTurno">Próximo turno</button>
    </div>
  </div>

  <dialog ref="fimDialog">
    <h2 class="m-0 mb-2 text-[17px] font-bold">Fim da partida</h2>
    <p class="mt-2 text-[13px] text-texto-2">Vence quem tiver mais cartas de missão. Empate: ganha quem tiver mais vida.</p>
    <ol class="m-3 flex list-none flex-col gap-1.5 p-0">
      <li v-for="(lado, i) in ranking" :key="i" class="flex justify-between rounded-raio-p bg-superficie-2 px-3 py-2.5" :class="i === 0 ? 'bg-ok-fundo font-extrabold' : ''">
        <span>{{ i === 0 ? '🏆 ' : '' }}{{ lado.nome }}</span>
        <span>{{ plural(lado.missoes, 'missão', 'missões') }} · {{ lado.vida }} de vida</span>
      </li>
    </ol>
    <p class="mt-2 text-[13px] text-texto-2">Para fechar a aula: cada lado lê em voz alta o combo da última missão, como se fosse o prompt que montou.</p>
    <div class="acoes mt-3">
      <button type="button" class="botao secundario" @click="voltarJogo">Voltar ao jogo</button>
      <button type="button" class="botao" @click="pedirNovaPartida">Nova partida</button>
    </div>
  </dialog>

  <dialog ref="confirmarDialog">
    <h2 class="m-0 mb-2 text-[17px] font-bold">Começar outra partida?</h2>
    <p class="mt-2 text-[13px] text-texto-2">O placar atual será apagado.</p>
    <div class="acoes mt-3">
      <button type="button" class="botao secundario" @click="cancelarNova">Cancelar</button>
      <button type="button" class="botao perigo" @click="novaPartida">Apagar e começar</button>
    </div>
  </dialog>

  <BottomMenu atual="partida" />
  <Toast />
</template>
