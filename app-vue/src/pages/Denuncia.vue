<script setup>
// Página Denúncia: o app aponta se a carta tem dado pessoal ou viés
// e aplica o resultado no placar. História 2.2.3.
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { DADOS } from '../data/dados.js'
import { lerPartida, salvarPartida } from '../lib/mp.js'
import { avisar } from '../composables/useToast.js'
import AppHeader from '../components/AppHeader.vue'
import BottomMenu from '../components/BottomMenu.vue'
import Toast from '../components/Toast.vue'
import Card from '../components/Card.vue'
import CodeEntry from '../components/CodeEntry.vue'
import CardChip from '../components/CardChip.vue'

const VIDA_DA_DENUNCIA = 2
const PREFIXOS = ['C', 'P', 'D', 'F', 'DC', 'E']

const cartaDenunciada = ref(null)
const defeito = computed(() => (cartaDenunciada.value ? DADOS.defeitos[cartaDenunciada.value.codigo] || null : null))
const certa = computed(() => Boolean(defeito.value))

const partidaAqui = ref(null)
const aplicarVisivel = ref(false)
const aplicarSub = ref('')
const quemDenunciou = ref('0')
const denunciado = ref('0')
const comEtica = ref(false)

function opcoesLados() {
  return partidaAqui.value ? partidaAqui.value.lados.map((lado, i) => ({ i, nome: lado.nome })) : []
}

function prepararPlacar() {
  const p = lerPartida()
  partidaAqui.value = p && p.vez !== null ? p : null
  if (!partidaAqui.value) {
    aplicarVisivel.value = false
    return
  }
  aplicarVisivel.value = true
  // Quem ataca é o lado da vez, então ele costuma ser o denunciado
  denunciado.value = String(partidaAqui.value.vez)
  quemDenunciou.value = String((partidaAqui.value.vez + 1) % partidaAqui.value.lados.length)
  comEtica.value = false
  aplicarSub.value = certa.value
    ? `Quem denunciou ganha ${VIDA_DA_DENUNCIA} de vida e o denunciado fica sem atacar no próximo turno.`
    : `Quem denunciou perde ${VIDA_DA_DENUNCIA} de vida e o denunciado ganha ${VIDA_DA_DENUNCIA}.`
}

function aoAdicionar(carta) {
  cartaDenunciada.value = carta
  prepararPlacar()
}

function aplicarNoPlacar() {
  const p = lerPartida()
  if (!p || p.vez === null) return
  const quem = p.lados[Number(quemDenunciou.value)]
  const alvo = p.lados[Number(denunciado.value)]
  if (quem === alvo) {
    avisar('Escolha lados diferentes')
    return
  }
  const c = Boolean(DADOS.defeitos[cartaDenunciada.value.codigo])
  if (c) {
    alvo.semAtacar = true
    alvo.semAtacarNoTurno = p.turno
    if (comEtica.value) {
      avisar(`Combo de ${alvo.nome} anulado: vai para o descarte`)
    } else {
      // Bônus de nação: quem denuncia os EUA (N3) com razão ganha +1 de vida extra
      const extra = alvo.nacao === 'N3' ? 1 : 0
      quem.vida += VIDA_DA_DENUNCIA + extra
      avisar(`${quem.nome} ganhou ${VIDA_DA_DENUNCIA + extra} de vida`)
    }
  } else {
    quem.vida = Math.max(0, quem.vida - VIDA_DA_DENUNCIA)
    alvo.vida += VIDA_DA_DENUNCIA
    avisar(`${quem.nome} perdeu ${VIDA_DA_DENUNCIA} e ${alvo.nome} ganhou ${VIDA_DA_DENUNCIA}`)
  }
  salvarPartida(p)
  aplicarVisivel.value = false
}

function onPageshow(evento) {
  if (evento.persisted) prepararPlacar()
}
onMounted(() => {
  prepararPlacar()
  window.addEventListener('pageshow', onPageshow)
})
onBeforeUnmount(() => window.removeEventListener('pageshow', onPageshow))
</script>

<template>
  <AppHeader title="Julgar denúncia" />

  <main class="mx-auto flex max-w-[640px] flex-col gap-3.5 px-4 pt-4 pb-[calc(var(--altura-menu)+env(safe-area-inset-bottom,0px)+24px)]">
    <Card title="Qual carta foi denunciada?" sub="O aluno aponta a carta e diz o problema: dado pessoal ou viés.">
      <CodeEntry :prefixos="PREFIXOS" rotulo-botao="Julgar" @add="aoAdicionar" />
    </Card>

    <section v-if="cartaDenunciada" class="rounded-raio border-2 p-4 shadow-card" :class="certa ? 'border-ok bg-ok-fundo' : 'border-erro bg-erro-fundo'" aria-live="polite">
      <p class="m-0 mb-2 text-[22px] font-extrabold" :class="certa ? 'text-ok' : 'text-erro'">
        {{ certa ? '✓ Denúncia certa' : '✗ Denúncia errada' }}
      </p>
      <p class="m-0 mb-2">
        <CardChip :carta="cartaDenunciada" />
      </p>

      <template v-if="certa">
        <ul class="m-0 flex list-none flex-col gap-2 p-0">
          <li class="flex items-start gap-2.5 rounded-raio-p border border-borda bg-superficie p-2.5 px-3">
            <span class="flex h-[26px] w-[26px] flex-none items-center justify-center rounded-full bg-erro font-extrabold text-white">!</span>
            <span><b>{{ defeito.problema }}</b><small class="block text-texto-2">{{ defeito.oQueTem }}</small></span>
          </li>
          <li class="flex items-start gap-2.5 rounded-raio-p border border-borda bg-superficie p-2.5 px-3">
            <span class="flex h-[26px] w-[26px] flex-none items-center justify-center rounded-full bg-destaque font-extrabold text-white">?</span>
            <span><b>Por que é um problema</b><small class="block text-texto-2">{{ defeito.porQue }}</small></span>
          </li>
          <li class="flex items-start gap-2.5 rounded-raio-p border border-borda bg-superficie p-2.5 px-3">
            <span class="flex h-[26px] w-[26px] flex-none items-center justify-center rounded-full bg-ok font-extrabold text-white">✓</span>
            <span><b>Conserta com</b><small class="block text-texto-2">{{ defeito.consertaCom }}</small></span>
          </li>
        </ul>
        <span class="mt-3 inline-block text-[12px] font-bold uppercase tracking-[0.04em] text-texto-2">Como fica consertada</span>
        <p class="mt-2 whitespace-pre-wrap rounded-raio-p bg-superficie-2 p-3 text-[15px] select-text">"{{ defeito.versaoConsertada }}"</p>
      </template>

      <p v-else class="m-0 text-sm text-texto-2">
        Esta carta não tem dado pessoal nem viés. Quem denunciou perde {{ VIDA_DA_DENUNCIA }} de vida e o denunciado ganha {{ VIDA_DA_DENUNCIA }}.
      </p>
    </section>

    <Card v-if="aplicarVisivel" title="Aplicar no placar" :sub="aplicarSub">
      <label class="mb-1.5 block text-[13px] font-bold text-texto-2" for="quem-denunciou">Quem denunciou</label>
      <select id="quem-denunciou" class="campo" v-model="quemDenunciou">
        <option v-for="o in opcoesLados" :key="o.i" :value="o.i">{{ o.nome }}</option>
      </select>
      <label class="mb-1.5 mt-2.5 block text-[13px] font-bold text-texto-2" for="denunciado">Quem foi denunciado</label>
      <select id="denunciado" class="campo" v-model="denunciado">
        <option v-for="o in opcoesLados" :key="o.i" :value="o.i">{{ o.nome }}</option>
      </select>
      <label v-if="certa" class="mt-3 flex items-center gap-2.5">
        <input type="checkbox" class="h-6 w-6" v-model="comEtica">
        <span>Quem denunciou tem a ética certa e quer anular o combo (não ganha vida)</span>
      </label>
      <button type="button" class="botao largo mt-3.5" @click="aplicarNoPlacar">Aplicar no placar</button>
    </Card>

    <Card title="Como julgar">
      <ol class="m-0 list-decimal space-y-1 pl-5">
        <li>A denúncia só pode ser feita logo depois do ataque.</li>
        <li><b>Certa:</b> quem denunciou ganha 2 de vida. O denunciado fica sem atacar no próximo turno.</li>
        <li><b>Certa, com a ética que conserta:</b> quem denunciou pode anular o combo (vai para o descarte) no lugar de ganhar vida.</li>
        <li><b>Errada:</b> quem denunciou perde 2 de vida e o denunciado ganha 2.</li>
        <li>EUA: quem denuncia os EUA com razão ganha +1 de vida extra.</li>
      </ol>
    </Card>
  </main>

  <BottomMenu atual="denuncia" />
  <Toast />
</template>
