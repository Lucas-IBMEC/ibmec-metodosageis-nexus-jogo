<script setup>
// Página Missão: o professor escolhe a missão, digita as cartas do combo
// e o app mostra o que falta. Histórias: 2.1.1, 2.1.2, 2.2.1, 2.2.2 e 2.2.3.
import { ref, watch, computed, onMounted, onBeforeUnmount } from 'vue'
import { DADOS } from '../data/dados.js'
import { RESPOSTAS } from '../data/respostas.js'
import { ler, salvar, lerPartida, salvarPartida, plural } from '../lib/mp.js'
import { avisar } from '../composables/useToast.js'
import AppHeader from '../components/AppHeader.vue'
import BottomMenu from '../components/BottomMenu.vue'
import Toast from '../components/Toast.vue'
import Card from '../components/Card.vue'
import CodeEntry from '../components/CodeEntry.vue'
import CardChip from '../components/CardChip.vue'

const PERSONAS = DADOS.cartas.filter((c) => c.tipo === 'Persona')
const NACOES = DADOS.cartas.filter((c) => c.tipo === 'Nação')
const DNC = ['Dor', 'Necessidade', 'Conceito']
const TEXTO_DNC = { DOR: 'Uma DOR', NECESSIDADE: 'Uma NECESSIDADE', CONCEITO: 'Um CONCEITO' }
const MARGEM_DA_NACAO = { N3: 3 } // EUA tem margem 3, as outras nações 2
const PREFIXOS = ['C', 'P', 'D', 'F', 'DC', 'E']

// ---------- Estado ----------

// Ignora códigos guardados que não existem mais (se uma carta mudar em dados.js)
const combo = ref(ler('mp-combo', []).filter((codigo) => DADOS.porCodigo[codigo]))
const missaoSel = ref(ler('mp-missao', 'M01'))
if (!DADOS.missoes.some((m) => m.codigo === missaoSel.value)) missaoSel.value = 'M01'

const personaSel = ref('')
const nacaoSel = ref('')
const dicaPartida = ref(false)
const partidaAqui = ref(null)

// ---------- Funções puras ----------

function nomeDoFormato(codigo) {
  return DADOS.porCodigo[codigo].nome.replace(/ \(.*\)$/, '')
}

function tipoDoDefeito(defeito) {
  return defeito.problema.startsWith('Viés') ? 'Viés' : 'Dado pessoal'
}

function minuscula(texto) {
  return texto.charAt(0).toLowerCase() + texto.slice(1)
}

// Valida o combo contra as regras do jogo e o que a missão pede.
// Devolve { itens, falhas, cumpriu, valido }.
function conferir(missao, cartas, nacaoCodigo) {
  const doTipo = (...tipos) => cartas.filter((c) => tipos.includes(c.tipo))
  const contextos = doTipo('Contexto')
  const precisoes = doTipo('Precisão')
  const dncs = doTipo(...DNC)
  const formatos = doTipo('Formato')
  const documentos = doTipo('Documento')
  const eticas = doTipo('Ética')
  const margem = MARGEM_DA_NACAO[nacaoCodigo] || 2
  const itens = []
  const falhas = []

  // Regras do combo (vale para qualquer missão)
  const problemasDoCombo = []
  if (!contextos.length) problemasDoCombo.push('falta 1 contexto')
  if (!precisoes.length) problemasDoCombo.push('falta 1 precisão')
  if (precisoes.length > 1) problemasDoCombo.push('só cabe 1 precisão')
  if (dncs.length > 1) problemasDoCombo.push('só cabe 1 dor, necessidade ou conceito')
  if (formatos.length > 1) problemasDoCombo.push('a precisão só recebe 1 formato')
  if (documentos.length > 1) problemasDoCombo.push('só cabe 1 documento')
  if (cartas.length - formatos.length > 5) problemasDoCombo.push('no máximo 5 cartas (o formato não conta)')
  itens.push({
    ok: problemasDoCombo.length === 0,
    titulo: 'Combo válido',
    detalhe: problemasDoCombo.length ? problemasDoCombo.join(' · ') : 'Contexto e precisão, sem cartas sobrando.',
  })
  if (!contextos.length || !precisoes.length) falhas.push('combo')
  else if (problemasDoCombo.length) falhas.push('regras')

  let foraDaMargem = []
  if (contextos.length && precisoes.length) {
    const n = contextos[0].numero
    const fora = precisoes.filter((p) => Math.abs(p.ataque - n) > margem || Math.abs(p.defesa - n) > margem)
    foraDaMargem = fora
    if (fora.length) falhas.push('margem')
    itens.push({
      ok: fora.length === 0,
      titulo: `A precisão combina com o contexto (entre ${n - margem} e ${n + margem})`,
      detalhe: fora.length
        ? `${fora.map((p) => `${p.codigo} tem ataque ${p.ataque} e defesa ${p.defesa}`).join(' · ')}. Esse combo não pode ser baixado.`
        : `${contextos[0].codigo} tem número ${n}.`,
    })
    const nacoes = new Set(contextos.map((c) => c.nacao))
    if (nacoes.size > 1) {
      itens.push({ ok: true, titulo: 'Nações misturadas', detalhe: 'Vale, mas esse ataque leva -1.' })
    }
  }

  // O que a missão pede
  const okContexto = contextos.some((c) => c.assunto === missao.assunto)
  itens.push({
    ok: okContexto,
    titulo: `Contexto de ${missao.assunto}`,
    detalhe: okContexto ? '' : contextos.length
      ? `O contexto é de ${contextos.map((c) => c.assunto).join(' e ')}.`
      : 'Nenhum contexto no combo.',
  })
  if (!okContexto && contextos.length) falhas.push('contexto')

  // A dor, a necessidade ou o conceito precisa ser do mesmo assunto da missão
  if (missao.precisa.dnc) {
    const pedido = missao.precisa.dnc
    const okDnc = dncs.some((c) => c.tipo.toUpperCase() === pedido && c.assunto === missao.assunto)
    const doTipoCerto = dncs.find((c) => c.tipo.toUpperCase() === pedido)
    let detalhe = ''
    if (!okDnc && doTipoCerto) detalhe = `${doTipoCerto.codigo} é de ${doTipoCerto.assunto}, mas a missão é de ${missao.assunto}.`
    else if (!okDnc && dncs.length) detalhe = `O combo tem ${dncs[0].tipo.toLowerCase()}, mas a missão pede ${pedido.toLowerCase()}.`
    itens.push({
      ok: okDnc,
      titulo: `${TEXTO_DNC[pedido]} de ${missao.assunto}${pedido === 'CONCEITO' ? '' : ' (de quem vai ler)'}`,
      detalhe,
    })
    if (!okDnc) falhas.push('dnc')
  }

  const okFormato = formatos.some((f) => missao.precisa.formatos.includes(f.codigo))
  itens.push({
    ok: okFormato,
    titulo: `Formato: ${missao.precisa.formatos.map(nomeDoFormato).join(' ou ')}`,
    detalhe: okFormato ? '' : formatos.length ? `O combo tem ${nomeDoFormato(formatos[0].codigo)}.` : 'Nenhum formato na precisão.',
  })
  if (!okFormato) falhas.push('formato')

  // Ética: carta com problema só vale se o combo tiver a ética que conserta
  const semConserto = contextos
    .filter((c) => DADOS.defeitos[c.codigo])
    .filter((c) => !eticas.some((e) => e.efeito === `Conserta: ${tipoDoDefeito(DADOS.defeitos[c.codigo])}`))
  itens.push({
    ok: semConserto.length === 0,
    titulo: 'Nenhuma carta com problema de ética sem conserto',
    detalhe: semConserto.map((c) => {
      const d = DADOS.defeitos[c.codigo]
      return `${c.codigo} tem ${d.problema.toLowerCase()}. Conserta com ${d.consertaCom}.`
    }).join(' '),
  })
  semConserto.forEach((c) => falhas.push(c))

  const cumpriu = itens.every((i) => i.ok)
  const valido = problemasDoCombo.length === 0 && foraDaMargem.length === 0
  return { itens, falhas, cumpriu, valido }
}

// Ataque e defesa da precisão com os bônus da mesa. Devolve null se não há precisão.
function calcularForca(cartas, personaCodigo, nacaoCodigo) {
  const precisao = cartas.find((c) => c.tipo === 'Precisão')
  if (!precisao) return null
  let ataque = precisao.ataque
  let defesa = precisao.defesa
  const contas = [{ texto: `${precisao.codigo} (${precisao.assunto}): ataque ${ataque} e defesa ${defesa}` }]

  const persona = DADOS.porCodigo[personaCodigo]
  if (persona && persona.assunto === precisao.assunto) {
    ataque += 1
    contas.push({ tipo: 'mais', texto: `+1 de ataque: ${persona.nome} na mesa (${persona.assunto})` })
  } else if (persona) {
    contas.push({ texto: `${persona.nome} é de ${persona.assunto}: não ajuda uma precisão de ${precisao.assunto}` })
  }

  if (nacaoCodigo === 'N1') {
    ataque += 1
    defesa -= 1
    contas.push({ tipo: 'mais', texto: '+1 de ataque e -1 de defesa: Brasil' })
  }
  if (nacaoCodigo === 'N2') {
    ataque -= 1
    contas.push({ tipo: 'menos', texto: '-1 de ataque: Índia (mas quem atacar a Índia leva 2 de dano)' })
  }

  const nacoes = new Set(cartas.filter((c) => c.tipo === 'Contexto').map((c) => c.nacao))
  if (nacoes.size > 1) {
    ataque -= 1
    contas.push({ tipo: 'menos', texto: '-1 de ataque: contextos de nações diferentes' })
  }

  // Estilos dos equipamentos: mudam como o ataque acerta ou como o combo se defende
  let naoAtaca = false
  cartas.filter((c) => c.tipo === 'Formato' || c.tipo === 'Documento').forEach((c) => {
    contas.push({ texto: `${c.estilo} (${c.codigo}): ${c.efeito}` })
    if (c.estilo === 'Virar defesa') {
      naoAtaca = true
      defesa += 3
    }
  })

  return { ataque: naoAtaca ? 0 : Math.max(0, ataque), defesa: Math.max(0, defesa), contas, naoAtaca }
}

function montarPrompt(missao, cartas, personaCodigo) {
  const partes = [`Tarefa: ${missao.pedido}`]
  const persona = DADOS.porCodigo[personaCodigo]
  if (persona) partes.push(`Você é ${minuscula(persona.nome)}.`)
  const eticas = cartas.filter((c) => c.tipo === 'Ética')
  cartas.filter((c) => c.tipo === 'Contexto').forEach((c) => {
    const defeito = DADOS.defeitos[c.codigo]
    const consertado = defeito && eticas.some((e) => e.efeito === `Conserta: ${tipoDoDefeito(defeito)}`)
    partes.push(consertado ? `${defeito.versaoConsertada} (revisado com ética)` : c.texto)
  })
  cartas.filter((c) => DNC.includes(c.tipo)).forEach((c) => {
    if (c.tipo === 'Dor') partes.push(`O problema é: ${minuscula(c.texto)}`)
    else if (c.tipo === 'Conceito') partes.push(`Quero entender: ${minuscula(c.texto)}`)
    else partes.push(c.texto)
  })
  cartas.filter((c) => c.tipo === 'Documento').forEach((c) => partes.push(`Use como fonte: ${minuscula(c.nome)}.`))
  cartas.filter((c) => c.tipo === 'Precisão').forEach((c) => partes.push(c.nome))
  cartas.filter((c) => c.tipo === 'Formato').forEach((c) => partes.push(`Responda em formato de ${minuscula(nomeDoFormato(c.codigo))}.`))
  return partes.join('\n')
}

// O que aparece na "resposta da IA": o texto bom, ou cada falha explicada.
function itensDaResposta(missao, resultado, cartas) {
  if (resultado.cumpriu) {
    return [{ etiqueta: 'Resposta boa ✓', texto: RESPOSTAS.boas[missao.codigo] }]
  }
  return resultado.falhas.map((falha) => {
    if (falha === 'formato') {
      const usado = cartas.find((c) => c.tipo === 'Formato')
      const pedidos = missao.precisa.formatos.map(nomeDoFormato).join(' ou ')
      const texto = usado
        ? `A missão pede ${minuscula(pedidos)}, mas a resposta veio em ${minuscula(nomeDoFormato(usado.codigo))}. Para quem vai ler, isso atrapalha.`
        : RESPOSTAS.falhas.formato.texto
      return { etiqueta: RESPOSTAS.falhas.formato.titulo, texto }
    }
    if (typeof falha === 'string') {
      const f = RESPOSTAS.falhas[falha]
      return { etiqueta: f.titulo, texto: f.texto }
    }
    // Carta com dado pessoal ou viés: a IA repete o problema da carta
    const f = RESPOSTAS.falhas[tipoDoDefeito(DADOS.defeitos[falha.codigo])]
    return { etiqueta: `${f.titulo} (${falha.codigo})`, texto: `${f.texto}"Certo! ${falha.texto} Vou responder pensando nisso..."` }
  })
}

// ---------- Computados ----------

const missaoObj = computed(() => DADOS.missoes.find((m) => m.codigo === missaoSel.value))
const listaMissao = computed(() =>
  DADOS.porCodigo[missaoSel.value].efeito.replace('Combo precisa ter: ', '').split(' · '),
)
const cartas = computed(() => combo.value.map((codigo) => DADOS.porCodigo[codigo]))
const temCombo = computed(() => cartas.value.length > 0)
const resultado = computed(() => (temCombo.value ? conferir(missaoObj.value, cartas.value, nacaoSel.value) : null))
const forca = computed(() => (temCombo.value ? calcularForca(cartas.value, personaSel.value, nacaoSel.value) : null))
const textoPrompt = computed(() => (temCombo.value ? montarPrompt(missaoObj.value, cartas.value, personaSel.value) : ''))
const itensResposta = computed(() => (temCombo.value ? itensDaResposta(missaoObj.value, resultado.value, cartas.value) : []))
const mostrarDarMissao = computed(() => resultado.value?.cumpriu === true && Boolean(partidaAqui.value))

const textoVeredito = computed(() => {
  if (!resultado.value) return ''
  const r = resultado.value
  if (r.cumpriu) {
    return 'O lado que avisou antes de atacar pega a carta de missão. Depois do ataque, este combo vai para o descarte: o prompt foi entregue.'
  }
  const faltam = r.itens.filter((i) => !i.ok).length
  return r.valido
    ? `Falta${faltam > 1 ? 'm' : ''} ${faltam} ${faltam > 1 ? 'itens' : 'item'}. O ataque vale, mas o lado não pega a missão.`
    : 'Esse combo não pode ser baixado na mesa. Confira as regras do combo.'
})

// ---------- Ligações ----------

function aoAdicionar(carta) {
  const permitidos = ['Contexto', 'Precisão', 'Formato', 'Documento', 'Ética', ...DNC]
  if (!permitidos.includes(carta.tipo)) {
    avisar(`${carta.codigo} é ${carta.tipo.toLowerCase()}: não entra no combo`)
    return
  }
  if (combo.value.includes(carta.codigo)) {
    avisar(`${carta.codigo} já está no combo`)
    return
  }
  combo.value.push(carta.codigo)
}

function remover(carta) {
  combo.value = combo.value.filter((codigo) => codigo !== carta.codigo)
}

function limpar() {
  combo.value = []
}

// Com uma partida aberta, a persona é a da mesa e a nação é a do lado da vez
function carregarDaPartida() {
  const partida = lerPartida()
  const emJogo = Boolean(partida && partida.vez !== null)
  personaSel.value = (partida ? partida.persona : ler('mp-persona', '')) || ''
  nacaoSel.value = emJogo ? partida.lados[partida.vez].nacao : ler('mp-nacao', '')
  dicaPartida.value = emJogo
  partidaAqui.value = emJogo ? partida : null
}

function darMissaoPara(i) {
  if (!partidaAqui.value) return
  const lado = partidaAqui.value.lados[i]
  lado.missoes += 1
  salvarPartida(partidaAqui.value)
  avisar(`+1 missão para ${lado.nome}. Combo para o descarte e vire uma missão nova.`)
  combo.value = []
}

carregarDaPartida()

// Persistência (a mesma do app original): combo, missão, e — só sem partida — persona e nação
watch([combo, missaoSel], () => {
  salvar('mp-combo', combo.value)
  salvar('mp-missao', missaoSel.value)
})
watch(nacaoSel, (codigo) => {
  if (!lerPartida()) salvar('mp-nacao', codigo)
})
// Trocar a persona aqui também troca a persona da mesa na Partida
watch(personaSel, (codigo) => {
  const partida = lerPartida()
  if (partida) {
    partida.persona = codigo
    salvarPartida(partida)
  } else {
    salvar('mp-persona', codigo)
  }
})

// Ao voltar de outra página, pega a persona e o lado da vez atualizados
function onPageshow(evento) {
  if (evento.persisted) carregarDaPartida()
}
onMounted(() => window.addEventListener('pageshow', onPageshow))
onBeforeUnmount(() => window.removeEventListener('pageshow', onPageshow))
</script>

<template>
  <AppHeader title="Conferir missão" />

  <main class="mx-auto flex max-w-[640px] flex-col gap-3.5 px-4 pt-4 pb-[calc(var(--altura-menu)+env(safe-area-inset-bottom,0px)+24px)]">
    <Card sub="Das 3 abertas na mesa, a que o lado avisou que vai tentar.">
      <template #title>
        <span class="mr-1.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-vez text-[13px] font-extrabold text-white">1</span>Qual missão?
      </template>
      <select class="campo" v-model="missaoSel" aria-label="Missão">
        <option v-for="m in DADOS.missoes" :key="m.codigo" :value="m.codigo">{{ m.codigo }} · {{ m.pedido }}</option>
      </select>
      <ul class="m-0 mt-3 flex list-none flex-col gap-2 p-0">
        <li v-for="(t, i) in listaMissao" :key="i" class="flex items-center gap-2.5 rounded-raio-p border border-borda bg-superficie p-2.5 px-3">
          <span class="flex h-[26px] w-[26px] flex-none items-center justify-center rounded-full bg-c-missao font-extrabold text-white">☐</span>
          <span>{{ t }}</span>
        </li>
      </ul>
    </Card>

    <Card sub="Toque na letra do tipo e digite o número de cada carta.">
      <template #title>
        <span class="mr-1.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-vez text-[13px] font-extrabold text-white">2</span>Cartas do combo
      </template>
      <CodeEntry :prefixos="PREFIXOS" @add="aoAdicionar" />
      <div class="mt-3 flex flex-wrap gap-2">
        <template v-if="temCombo">
          <CardChip v-for="c in cartas" :key="c.codigo" :carta="c" removivel @remove="remover" />
        </template>
        <p v-else class="text-[13px] text-texto-2">Nenhuma carta ainda. Ex.: toque em C e digite 1 para o C01.</p>
      </div>

      <label class="mb-1.5 mt-2.5 block text-[13px] font-bold text-texto-2" for="persona">Persona na mesa</label>
      <select id="persona" class="campo" v-model="personaSel">
        <option value="">Nenhuma</option>
        <option v-for="p in PERSONAS" :key="p.codigo" :value="p.codigo">{{ p.nome }} ({{ p.assunto }})</option>
      </select>

      <label class="mb-1.5 mt-2.5 block text-[13px] font-bold text-texto-2" for="nacao">Nação de quem jogou</label>
      <select id="nacao" class="campo" v-model="nacaoSel">
        <option value="">Não sei (sem bônus, margem 2)</option>
        <option v-for="n in NACOES" :key="n.codigo" :value="n.codigo">{{ n.nome }}{{ MARGEM_DA_NACAO[n.codigo] ? ` (margem ${MARGEM_DA_NACAO[n.codigo]})` : '' }}</option>
      </select>
      <p v-if="dicaPartida" class="mt-1.5 text-[13px] text-texto-2">Com uma partida aberta, a persona e a nação do lado da vez vêm da página Partida.</p>

      <button type="button" class="botao secundario largo mt-3" @click="limpar">Limpar combo</button>
    </Card>

    <section v-if="temCombo" class="rounded-raio border-2 p-4 shadow-card" :class="resultado.cumpriu ? 'border-ok bg-ok-fundo' : 'border-erro bg-erro-fundo'" aria-live="polite">
      <p class="m-0 mb-1 text-[22px] font-extrabold" :class="resultado.cumpriu ? 'text-ok' : 'text-erro'">
        {{ resultado.cumpriu ? '✓ Missão cumprida' : '✗ Ainda não cumpriu' }}
      </p>
      <p class="m-0 text-sm text-texto-2">{{ textoVeredito }}</p>
      <ul class="m-0 mt-2.5 flex list-none flex-col gap-2 p-0">
        <li v-for="(item, i) in resultado.itens" :key="i" class="flex items-start gap-2.5 rounded-raio-p border border-borda bg-superficie p-2.5 px-3">
          <span class="flex h-[26px] w-[26px] flex-none items-center justify-center rounded-full font-extrabold text-white" :class="item.ok ? 'bg-ok' : 'bg-erro'">
            {{ item.ok ? '✓' : '✗' }}
          </span>
          <span>{{ item.titulo }}<small v-if="item.detalhe" class="block text-texto-2">{{ item.detalhe }}</small></span>
        </li>
      </ul>
    </section>

    <Card v-if="forca" title="Força do combo" sub="Já com a persona, a nação e o -1 de misturar nações.">
      <div class="grid grid-cols-2 gap-2.5">
        <div class="rounded-raio-p bg-superficie-2 p-2.5 text-center">
          <span class="block text-[12px] font-bold uppercase tracking-[0.06em] text-texto-2">Ataque</span>
          <b class="text-4xl font-extrabold tabular-nums">{{ forca.naoAtaca ? '—' : forca.ataque }}</b>
        </div>
        <div class="rounded-raio-p bg-superficie-2 p-2.5 text-center">
          <span class="block text-[12px] font-bold uppercase tracking-[0.06em] text-texto-2">Defesa</span>
          <b class="text-4xl font-extrabold tabular-nums">{{ forca.defesa }}</b>
        </div>
      </div>
      <ul class="m-0 mt-3 list-disc space-y-1.5 pl-5 text-sm">
        <li v-for="(c, i) in forca.contas" :key="i" :class="c.tipo === 'mais' ? 'font-semibold text-ok' : c.tipo === 'menos' ? 'font-semibold text-erro' : ''">{{ c.texto }}</li>
      </ul>
    </Card>

    <Card v-if="temCombo" title="O prompt que o combo forma" sub="Leia para a turma: cada carta é um pedaço do prompt.">
      <p class="mt-2 whitespace-pre-wrap rounded-raio-p bg-superficie-2 p-3 text-[15px] select-text">{{ textoPrompt }}</p>
    </Card>

    <Card v-if="temCombo" title="Resposta simulada da IA" sub="Exemplo para mostrar à turma o efeito do combo. Não usa internet.">
      <div class="mt-2 flex flex-col gap-2.5">
        <div v-for="(r, i) in itensResposta" :key="i">
          <span class="inline-block text-[12px] font-bold uppercase tracking-[0.04em] text-texto-2">{{ r.etiqueta }}</span>
          <p class="mt-2 whitespace-pre-wrap rounded-raio-p bg-superficie-2 p-3 text-[15px] select-text">{{ r.texto }}</p>
        </div>
      </div>
    </Card>

    <Card v-if="mostrarDarMissao" title="Dar a carta de missão para" sub="Soma 1 missão no placar da Partida.">
      <div class="flex flex-wrap gap-2">
        <button v-for="(lado, i) in partidaAqui.lados" :key="i" type="button" class="chip" @click="darMissaoPara(i)">
          {{ lado.nome }} · {{ plural(lado.missoes, 'missão', 'missões') }}
        </button>
      </div>
    </Card>
  </main>

  <BottomMenu atual="missao" />
  <Toast />
</template>
