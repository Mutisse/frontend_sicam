<template>
  <div class="vd-page">
    <!-- ============================================================ -->
    <!-- BARRA DE PROGRESSO (topo, fixa)                              -->
    <!-- ============================================================ -->
    <div v-if="store.detalhe" class="vd-progress" aria-hidden="true">
      <div
        class="vd-progress__bar"
        :style="{ width: `${((passoAtual + 1) / passos.length) * 100}%` }"
      />
    </div>

    <!-- ============================================================ -->
    <!-- SKELETON                                                      -->
    <!-- ============================================================ -->
    <div
      v-if="store.aCarregarDetalhe"
      class="vd-skeleton"
      aria-busy="true"
      aria-label="A carregar"
    >
      <div class="sk-head" />
      <div class="sk-banner" />
      <div class="sk-steps" />
      <div class="sk-panel" />
    </div>

    <!-- ============================================================ -->
    <!-- ERRO                                                          -->
    <!-- ============================================================ -->
    <div v-else-if="store.erroDetalhe" class="vd-erro">
      <div class="vd-erro__icon vd-erro__icon--bad">
        <q-icon name="error" size="36px" />
      </div>
      <h2>Erro ao carregar</h2>
      <p>{{ store.erroDetalhe }}</p>
      <button type="button" class="vd-btn vd-btn--primary" @click="voltar">
        Voltar à consulta
      </button>
    </div>

    <!-- ============================================================ -->
    <!-- SEM DADOS                                                     -->
    <!-- ============================================================ -->
    <div v-else-if="!store.detalhe" class="vd-erro">
      <div class="vd-erro__icon">
        <q-icon name="search_off" size="36px" />
      </div>
      <h2>Veículo não encontrado</h2>
      <p>Não existe nenhum registo para {{ matriculaAtual }}.</p>
      <button type="button" class="vd-btn vd-btn--primary" @click="voltar">
        Voltar à consulta
      </button>
    </div>

    <!-- ============================================================ -->
    <!-- CONTEÚDO                                                      -->
    <!-- ============================================================ -->
    <template v-else>
      <!-- Cabeçalho -->
      <header class="vd-head">
        <svg class="vd-head__deco" viewBox="0 0 300 300" aria-hidden="true">
          <circle cx="230" cy="150" r="50" />
          <circle cx="230" cy="150" r="95" />
          <circle cx="230" cy="150" r="140" />
        </svg>

        <button
          type="button"
          class="vd-head__back"
          aria-label="Voltar à consulta"
          @click="voltar"
        >
          <q-icon name="arrow_back" size="22px" />
        </button>

        <div class="vd-head__body">
          <div
            class="plate"
            :aria-label="`Matrícula ${store.detalhe.veiculo.matricula}`"
          >
            <span class="plate__faixa">MZ</span>
            <b class="plate__num">{{ store.detalhe.veiculo.matricula }}</b>
          </div>
          <p class="vd-head__meta">
            {{ store.detalhe.veiculo.marca }}
            {{ store.detalhe.veiculo.modelo }},
            {{ store.detalhe.veiculo.tipo }}
          </p>
        </div>

        <!-- Anel do score -->
        <div
          class="ring"
          :class="`ring--${estadoScore}`"
          role="img"
          :aria-label="`Score ${store.detalhe.resumo.score} em 100`"
        >
          <svg viewBox="0 0 64 64" class="ring__svg">
            <circle cx="32" cy="32" r="27" class="ring__track" />
            <circle
              cx="32"
              cy="32"
              r="27"
              class="ring__value"
              :stroke-dasharray="`${(scoreLimitado / 100) * CIRCUNFERENCIA} ${CIRCUNFERENCIA}`"
              transform="rotate(-90 32 32)"
            />
          </svg>
          <span class="ring__num">{{ store.detalhe.resumo.score }}</span>
        </div>
      </header>

      <!-- Banner de estado -->
      <div class="vd-banner" :class="`vd-banner--${estadoScore}`" role="status">
        <span class="vd-banner__icon">
          <q-icon :name="iconeScore" size="26px" />
        </span>
        <div>
          <b>{{ tituloScore }}</b>
          <small>{{ subtituloScore }}</small>
        </div>
      </div>

      <!-- Passos (scroll horizontal com snap) -->
      <nav
        ref="stepsEl"
        class="vd-steps"
        aria-label="Secções da consulta"
      >
        <button
          v-for="(s, i) in passos"
          :key="s.key"
          type="button"
          class="vd-step"
          :class="{
            'vd-step--active': passoAtual === i,
            'vd-step--feito': i < passoAtual,
          }"
          :aria-current="passoAtual === i ? 'step' : undefined"
          @click="passoAtual = i"
        >
          <span class="vd-step__num">
            <q-icon :name="s.icon" size="18px" />
            <i
              v-if="estadoPasso(s.key) !== 'neutro'"
              class="vd-step__dot"
              :class="`vd-step__dot--${estadoPasso(s.key)}`"
            />
          </span>
          <span class="vd-step__label">{{ s.label }}</span>
        </button>
      </nav>

      <!-- Painel com swipe -->
      <section
        class="vd-panel"
        @touchstart.passive="aoTocar"
        @touchend.passive="aoSoltar"
      >
        <!-- PASSO 1: VEÍCULO -->
        <div v-if="passoAtual === 0" class="vd-block">
          <h2 class="vd-block__title">
            <span class="vd-block__icon">
              <q-icon name="directions_car" size="20px" />
            </span>
            Dados do veículo
          </h2>

          <div class="vd-grid">
            <div class="vd-field">
              <span class="vd-field__label">Matrícula</span>
              <b class="vd-field__value vd-field__value--placa">
                {{ store.detalhe.veiculo.matricula }}
              </b>
            </div>
            <div class="vd-field">
              <span class="vd-field__label">Marca</span>
              <b class="vd-field__value">{{ store.detalhe.veiculo.marca }}</b>
            </div>
            <div class="vd-field">
              <span class="vd-field__label">Modelo</span>
              <b class="vd-field__value">{{ store.detalhe.veiculo.modelo }}</b>
            </div>
            <div class="vd-field">
              <span class="vd-field__label">Tipo</span>
              <b class="vd-field__value">{{ store.detalhe.veiculo.tipo }}</b>
            </div>
            <div class="vd-field">
              <span class="vd-field__label">Ano</span>
              <b class="vd-field__value">
                {{ store.detalhe.veiculo.ano ?? '—' }}
              </b>
            </div>
            <div class="vd-field">
              <span class="vd-field__label">Cor</span>
              <b class="vd-field__value">{{ store.detalhe.veiculo.cor }}</b>
            </div>
            <div class="vd-field">
              <span class="vd-field__label">Combustível</span>
              <b class="vd-field__value">
                {{ store.detalhe.veiculo.combustivel }}
              </b>
            </div>
            <div class="vd-field">
              <span class="vd-field__label">Chassis</span>
              <span class="vd-field__linha">
                <b class="vd-field__value vd-field__value--mono">
                  {{ store.detalhe.veiculo.chassis }}
                </b>
                <button
                  type="button"
                  class="vd-copy"
                  aria-label="Copiar chassis"
                  @click="copiar(store.detalhe.veiculo.chassis, 'Chassis')"
                >
                  <q-icon name="content_copy" size="16px" />
                </button>
              </span>
            </div>
            <div class="vd-field vd-field--full">
              <span class="vd-field__label">Província</span>
              <b class="vd-field__value">
                {{ store.detalhe.veiculo.provincia }}
              </b>
            </div>
          </div>
        </div>

        <!-- PASSO 2: PROPRIETÁRIO -->
        <div v-else-if="passoAtual === 1" class="vd-block">
          <h2 class="vd-block__title">
            <span class="vd-block__icon">
              <q-icon name="person" size="20px" />
            </span>
            Proprietário
          </h2>

          <div class="vd-grid">
            <div class="vd-field vd-field--full">
              <span class="vd-field__label">Nome</span>
              <b class="vd-field__value vd-field__value--grande">
                {{ store.detalhe.proprietario.nome }}
              </b>
            </div>
            <div class="vd-field">
              <span class="vd-field__label">Nº de identificação</span>
              <span class="vd-field__linha">
                <b class="vd-field__value vd-field__value--mono">
                  {{ store.detalhe.proprietario.numeroId }}
                </b>
                <button
                  type="button"
                  class="vd-copy"
                  aria-label="Copiar número de identificação"
                  @click="
                    copiar(
                      store.detalhe.proprietario.numeroId,
                      'Número de identificação',
                    )
                  "
                >
                  <q-icon name="content_copy" size="16px" />
                </button>
              </span>
            </div>
            <div class="vd-field">
              <span class="vd-field__label">Contacto</span>
              <a class="vd-field__link" :href="`tel:${telefoneLimpo}`">
                <q-icon name="call" size="16px" />
                {{ store.detalhe.proprietario.contacto }}
              </a>
            </div>
            <div class="vd-field vd-field--full">
              <span class="vd-field__label">Email</span>
              <a
                class="vd-field__link"
                :href="`mailto:${store.detalhe.proprietario.email}`"
              >
                <q-icon name="mail" size="16px" />
                {{ store.detalhe.proprietario.email }}
              </a>
            </div>
          </div>
        </div>

        <!-- PASSO 3: INATRO -->
        <div v-else-if="passoAtual === 2" class="vd-block">
          <h2 class="vd-block__title">
            <span class="vd-block__icon">
              <q-icon name="fact_check" size="20px" />
            </span>
            Inspecções (INATRO)
          </h2>

          <div v-if="!store.detalhe.inspecoes.length" class="vd-vazio">
            <q-icon name="fact_check" size="32px" />
            <b>Sem inspecções registadas</b>
          </div>

          <ul v-else class="vd-list">
            <li
              v-for="ins in store.detalhe.inspecoes"
              :key="ins.codigo"
              class="vd-item"
              :class="`vd-item--${ins.valida ? 'ok' : 'bad'}`"
            >
              <div class="vd-item__head">
                <b>{{ ins.codigo }}</b>
                <span
                  class="vd-badge"
                  :class="`vd-badge--${ins.valida ? 'ok' : 'bad'}`"
                >
                  {{ ins.valida ? 'Válida' : 'Expirada' }}
                </span>
              </div>
              <div class="vd-item__grid">
                <div><span>Data</span><b>{{ ins.data }}</b></div>
                <div><span>Validade</span><b>{{ ins.validade }}</b></div>
                <div><span>Resultado</span><b>{{ ins.resultado }}</b></div>
                <div><span>Inspector</span><b>{{ ins.inspetor }}</b></div>
              </div>
            </li>
          </ul>
        </div>

        <!-- PASSO 4: ISSM -->
        <div v-else-if="passoAtual === 3" class="vd-block">
          <h2 class="vd-block__title">
            <span class="vd-block__icon">
              <q-icon name="verified_user" size="20px" />
            </span>
            Seguro (ISSM)
          </h2>

          <div v-if="!store.detalhe.apolices.length" class="vd-vazio">
            <q-icon name="verified_user" size="32px" />
            <b>Sem apólices registadas</b>
          </div>

          <ul v-else class="vd-list">
            <li
              v-for="ap in store.detalhe.apolices"
              :key="ap.numero"
              class="vd-item"
              :class="`vd-item--${ap.valida ? 'ok' : 'bad'}`"
            >
              <div class="vd-item__head">
                <b>{{ ap.numero }}</b>
                <span
                  class="vd-badge"
                  :class="`vd-badge--${ap.valida ? 'ok' : 'bad'}`"
                >
                  {{ ap.valida ? 'Válida' : 'Expirada' }}
                </span>
              </div>
              <div class="vd-item__grid">
                <div><span>Seguradora</span><b>{{ ap.seguradora }}</b></div>
                <div><span>Tipo</span><b>{{ ap.tipo }}</b></div>
                <div><span>Início</span><b>{{ ap.inicio }}</b></div>
                <div><span>Validade</span><b>{{ ap.validade }}</b></div>
                <div><span>Prémio</span><b>{{ formatarMT(ap.premio) }}</b></div>
              </div>
            </li>
          </ul>
        </div>

        <!-- PASSO 5: MULTAS -->
        <div v-else-if="passoAtual === 4" class="vd-block">
          <h2 class="vd-block__title">
            <span class="vd-block__icon">
              <q-icon name="receipt_long" size="20px" />
            </span>
            Multas (GESTMUL)
          </h2>

          <div class="vd-kpis">
            <div class="vd-kpi">
              <span>Total</span>
              <b>{{ store.detalhe.multas.total }}</b>
            </div>
            <div class="vd-kpi vd-kpi--warning">
              <span>Pendentes</span>
              <b>{{ store.detalhe.multas.pendentes }}</b>
            </div>
            <div class="vd-kpi vd-kpi--ok">
              <span>Pagas</span>
              <b>{{ store.detalhe.multas.pagas }}</b>
            </div>
            <div class="vd-kpi vd-kpi--critical">
              <span>Em dívida</span>
              <b>{{ formatarMT(store.detalhe.multas.valorPendente) }}</b>
            </div>
          </div>

          <div v-if="!store.detalhe.multas.lista.length" class="vd-vazio">
            <q-icon name="receipt_long" size="32px" />
            <b>Sem multas registadas</b>
          </div>

          <ul v-else class="vd-list">
            <li
              v-for="m in store.detalhe.multas.lista"
              :key="m.numero"
              class="vd-item"
              :class="`vd-item--${m.estado === 'Paga' ? 'ok' : 'bad'}`"
            >
              <div class="vd-item__head">
                <b>{{ m.numero }}</b>
                <span
                  class="vd-badge"
                  :class="`vd-badge--${m.estado === 'Paga' ? 'ok' : 'bad'}`"
                >
                  {{ m.estado }}
                </span>
              </div>
              <div class="vd-item__grid">
                <div><span>Infração</span><b>{{ m.infracao }}</b></div>
                <div><span>Valor</span><b>{{ formatarMT(m.valor) }}</b></div>
                <div><span>Data</span><b>{{ m.data }}</b></div>
                <div v-if="m.dataPagamento">
                  <span>Pago em</span><b>{{ m.dataPagamento }}</b>
                </div>
              </div>
            </li>
          </ul>
        </div>

        <!-- PASSO 6: PRM -->
        <div v-else-if="passoAtual === 5" class="vd-block">
          <h2 class="vd-block__title">
            <span class="vd-block__icon">
              <q-icon name="local_police" size="20px" />
            </span>
            Hotlist (PRM)
          </h2>

          <div v-if="!store.detalhe.hotlist" class="vd-ok-state">
            <span class="vd-ok-state__icon">
              <q-icon name="check_circle" size="36px" />
            </span>
            <b>Não consta na hotlist</b>
            <p>Nenhum alerta associado a este veículo.</p>
          </div>

          <div v-else>
            <div
              v-if="store.detalhe.hotlist.activo"
              class="vd-alerta"
              role="alert"
            >
              <q-icon name="notification_important" size="22px" />
              <span>
                Alerta activo: proceda com cautela e siga o protocolo.
              </span>
            </div>

            <div
              class="vd-item"
              :class="`vd-item--${store.detalhe.hotlist.activo ? 'bad' : 'ok'}`"
            >
              <div class="vd-item__head">
                <b>{{ store.detalhe.hotlist.motivo }}</b>
                <span
                  class="vd-badge"
                  :class="`vd-badge--${store.detalhe.hotlist.activo ? 'bad' : 'ok'}`"
                >
                  {{ store.detalhe.hotlist.activo ? 'Activo' : 'Resolvido' }}
                </span>
              </div>
              <div class="vd-item__grid">
                <div><span>Perigo</span><b>{{ store.detalhe.hotlist.perigo }}</b></div>
                <div>
                  <span>Prioridade</span>
                  <b>{{ store.detalhe.hotlist.prioridade }}</b>
                </div>
                <div><span>Posto</span><b>{{ store.detalhe.hotlist.posto }}</b></div>
                <div><span>Zona</span><b>{{ store.detalhe.hotlist.zona }}</b></div>
                <div>
                  <span>Detectado em</span>
                  <b>{{ store.detalhe.hotlist.detectadoEm }}</b>
                </div>
              </div>
              <p v-if="store.detalhe.hotlist.descricao" class="vd-note">
                {{ store.detalhe.hotlist.descricao }}
              </p>
            </div>
          </div>
        </div>

        <!-- PASSO 7: RESUMO -->
        <div v-else class="vd-block">
          <h2 class="vd-block__title">
            <span class="vd-block__icon">
              <q-icon name="analytics" size="20px" />
            </span>
            Resumo geral
          </h2>

          <ul class="vd-resumo">
            <li
              v-for="ent in store.detalhe.resumo.entidades"
              :key="ent.nome"
              class="vd-resumo__item"
              :class="`vd-resumo__item--${ent.ok ? 'ok' : 'bad'}`"
            >
              <span class="vd-resumo__icon">
                <q-icon
                  :name="ent.ok ? 'check_circle' : 'cancel'"
                  size="24px"
                />
              </span>
              <div class="vd-resumo__txt">
                <div class="vd-resumo__top">
                  <b>{{ ent.nome }}</b>
                  <span
                    class="vd-badge"
                    :class="`vd-badge--${ent.ok ? 'ok' : 'bad'}`"
                  >
                    {{ ent.texto }}
                  </span>
                </div>
                <p>{{ ent.detalhe }}</p>
              </div>
            </li>
          </ul>
        </div>
      </section>

      <!-- ============================================================ -->
      <!-- NAVEGAÇÃO FIXA (bottom sheet mobile)                          -->
      <!-- ============================================================ -->
      <div class="vd-dock">
        <button
          type="button"
          class="vd-dock__btn vd-dock__btn--ghost"
          :disabled="passoAtual === 0"
          aria-label="Passo anterior"
          @click="passoAtual--"
        >
          <q-icon name="chevron_left" size="22px" />
        </button>

        <div class="vd-dock__center">
          <span class="vd-dock__count">
            {{ passoAtual + 1 }} / {{ passos.length }}
          </span>
          <span class="vd-dock__label">{{ passos[passoAtual]?.label }}</span>
        </div>

        <button
          v-if="passoAtual < passos.length - 1"
          type="button"
          class="vd-dock__btn vd-dock__btn--primary"
          aria-label="Passo seguinte"
          @click="passoAtual++"
        >
          <q-icon name="chevron_right" size="22px" />
        </button>
        <button
          v-else
          type="button"
          class="vd-dock__btn vd-dock__btn--gold"
          aria-label="Aplicar multa"
          @click="aplicarMulta"
        >
          <q-icon name="gavel" size="20px" />
        </button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAgenteFluxoStore } from '@/stores/agente/agente-fluxo.store'

const router = useRouter()
const route = useRoute()
const $q = useQuasar()
const store = useAgenteFluxoStore()

// ============================================================
// Estado
// ============================================================
const passoAtual = ref(0)
const stepsEl = ref<HTMLElement | null>(null)

const passos = [
  { key: 'veiculo', label: 'Veículo', icon: 'directions_car' },
  { key: 'proprietario', label: 'Proprietário', icon: 'person' },
  { key: 'inatros', label: 'INATRO', icon: 'fact_check' },
  { key: 'issm', label: 'ISSM', icon: 'verified_user' },
  { key: 'gestmul', label: 'GESTMUL', icon: 'receipt_long' },
  { key: 'prm', label: 'PRM', icon: 'local_police' },
  { key: 'resumo', label: 'Resumo', icon: 'analytics' },
]

const matriculaAtual = computed(() => (route.params.matricula as string) ?? '—')

// ============================================================
// Score
// ============================================================
const CIRCUNFERENCIA = 2 * Math.PI * 27

const scoreLimitado = computed(() =>
  Math.min(100, Math.max(0, store.detalhe?.resumo.score ?? 0)),
)

const estadoScore = computed(() => {
  const s = store.detalhe?.resumo.score ?? 0
  if (s < 30) return 'critico'
  if (s < 60) return 'atencao'
  return 'regular'
})

const iconeScore = computed(() => {
  if (estadoScore.value === 'critico') return 'error'
  if (estadoScore.value === 'atencao') return 'warning'
  return 'check_circle'
})

const tituloScore = computed(() => {
  if (estadoScore.value === 'critico') return 'Abordagem obrigatória'
  if (estadoScore.value === 'atencao') return 'Verificar documentação'
  return 'Sem intervenção necessária'
})

const subtituloScore = computed(() => {
  const v = store.detalhe?.veiculo
  return v ? `${v.marca} ${v.modelo}, ${v.tipo}` : ''
})

// ============================================================
// Estado de cada passo
// ============================================================
function estadoPasso(key: string): 'ok' | 'bad' | 'warn' | 'neutro' {
  const d = store.detalhe
  if (!d) return 'neutro'

  switch (key) {
    case 'inatros':
      return d.inspecoes.some((i) => i.valida) ? 'ok' : 'bad'
    case 'issm':
      return d.apolices.some((a) => a.valida) ? 'ok' : 'bad'
    case 'gestmul':
      return d.multas.pendentes > 0 ? 'bad' : 'ok'
    case 'prm':
      return d.hotlist?.activo ? 'bad' : 'ok'
    case 'resumo':
      return estadoScore.value === 'critico'
        ? 'bad'
        : estadoScore.value === 'atencao'
          ? 'warn'
          : 'ok'
    default:
      return 'neutro'
  }
}

// ============================================================
// Contacto
// ============================================================
const telefoneLimpo = computed(() =>
  (store.detalhe?.proprietario.contacto ?? '').replace(/[^\d+]/g, ''),
)

async function copiar(texto: string, rotulo: string) {
  try {
    await navigator.clipboard.writeText(texto)
    $q.notify({
      type: 'positive',
      message: `${rotulo} copiado.`,
      position: 'top',
      timeout: 1200,
    })
  } catch {
    $q.notify({
      type: 'warning',
      message: 'Não foi possível copiar.',
      position: 'top',
      timeout: 1500,
    })
  }
}

// ============================================================
// Swipe
// ============================================================
let toqueX = 0
let toqueY = 0

function aoTocar(e: TouchEvent) {
  const t = e.changedTouches[0]
  if (!t) return
  toqueX = t.clientX
  toqueY = t.clientY
}

function aoSoltar(e: TouchEvent) {
  const t = e.changedTouches[0]
  if (!t) return

  const dx = t.clientX - toqueX
  const dy = t.clientY - toqueY

  if (Math.abs(dx) < 70 || Math.abs(dy) > 45) return

  if (dx < 0 && passoAtual.value < passos.length - 1) passoAtual.value++
  if (dx > 0 && passoAtual.value > 0) passoAtual.value--
}

// Mantém o passo activo visível no menu
watch(passoAtual, () => {
  nextTick(() => {
    stepsEl.value
      ?.querySelector('.vd-step--active')
      ?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' })
  })
})

// ============================================================
// Ciclo de vida
// ============================================================
onMounted(() => {
  carregarDetalhe()
})

async function carregarDetalhe() {
  const m = matriculaAtual.value
  if (!m || m === '—') {
    $q.notify({
      type: 'negative',
      message: 'Matrícula inválida.',
      position: 'top',
    })
    voltar()
    return
  }

  await store.carregarDetalhe(m)
}

// ============================================================
// Helpers
// ============================================================
function formatarMT(valor: number): string {
  return valor.toLocaleString('pt-MZ', { maximumFractionDigits: 0 }) + ' MT'
}

// ============================================================
// Acções
// ============================================================
function voltar() {
  router.push('/agente/consulta')
}

function aplicarMulta() {
  const mat = matriculaAtual.value
  router.push({ path: '/agente/multa/nova', query: { matricula: mat } })
}
</script>

<style scoped lang="scss">
/* ============================================================ */
/* VARIÁVEIS LOCAIS                                             */
/* ============================================================ */
.vd-page {
  --v-ink: var(--sicam-ink, #0f172a);
  --v-muted: var(--sicam-muted, #64748b);
  --v-line: var(--sicam-line, #e5ebe8);

  --v-ok: #059669;
  --v-ok-bg: var(--sicam-success-bg, #ecfdf5);
  --v-ok-ink: var(--sicam-success-ink, #065f46);
  --v-warn: #f59e0b;
  --v-warn-bg: var(--sicam-warning-bg, #fffbeb);
  --v-warn-ink: var(--sicam-warning-ink, #92400e);
  --v-bad: #dc2626;
  --v-bad-bg: var(--sicam-critical-bg, #fef2f2);
  --v-bad-ink: var(--sicam-critical-ink, #991b1b);

  /* espaço reservado para a dock fixa + safe area */
  --v-dock-h: 76px;

  width: 100%;
  min-height: 100%;
  padding: 12px 12px calc(var(--v-dock-h) + 24px + env(safe-area-inset-bottom, 0px));
  background: var(--sicam-bg, #f4f8f6);
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

/* ============================================================ */
/* BARRA DE PROGRESSO                                           */
/* ============================================================ */
.vd-progress {
  position: sticky;
  top: 0;
  z-index: 5;
  height: 3px;
  margin: -12px -12px 8px;
  background: rgba(6, 78, 59, 0.08);
  border-radius: 0 0 3px 3px;
  overflow: hidden;
}

.vd-progress__bar {
  height: 100%;
  background: linear-gradient(90deg, #059669, #10b981);
  border-radius: inherit;
  transition: width 0.25s ease;
}

/* ============================================================ */
/* SKELETON                                                     */
/* ============================================================ */
@keyframes sk-shimmer {
  0% { background-position: -400px 0; }
  100% { background-position: 400px 0; }
}

%sk-block {
  background: linear-gradient(
    90deg,
    rgba(0, 0, 0, 0.05) 0%,
    rgba(0, 0, 0, 0.08) 50%,
    rgba(0, 0, 0, 0.05) 100%
  );
  background-size: 800px 100%;
  animation: sk-shimmer 1.4s infinite linear;
  border-radius: 16px;
}

.vd-skeleton { display: flex; flex-direction: column; gap: 12px; }
.sk-head { @extend %sk-block; height: 104px; border-radius: 20px; }
.sk-banner { @extend %sk-block; height: 64px; }
.sk-steps { @extend %sk-block; height: 76px; }
.sk-panel { @extend %sk-block; height: 380px; border-radius: 20px; }

/* ============================================================ */
/* ERRO / SEM DADOS                                             */
/* ============================================================ */
.vd-erro {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 56px 20px;
  gap: 10px;
  color: var(--v-muted);

  &__icon {
    width: 76px;
    height: 76px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    background: #ecfdf5;
    color: #065f46;
    margin-bottom: 6px;

    &--bad {
      background: var(--v-bad-bg);
      color: var(--v-bad);
    }
  }

  h2 {
    font-size: 20px;
    font-weight: 800;
    color: var(--v-ink);
    margin: 0;
  }
  p {
    margin: 0;
    font-size: 14px;
    max-width: 36ch;
  }
  .vd-btn {
    margin-top: 12px;
  }
}

/* ============================================================ */
/* CABEÇALHO                                                    */
/* ============================================================ */
.vd-head {
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: linear-gradient(150deg, #065f46 0%, #064e3b 55%, #04261d 100%);
  border-radius: 22px;
  color: #fff;
  margin-bottom: 12px;
  box-shadow: 0 12px 30px rgba(6, 78, 59, 0.22);

  &__deco {
    position: absolute;
    right: -50px;
    top: 50%;
    width: 300px;
    height: 300px;
    transform: translateY(-50%);
    pointer-events: none;

    circle {
      fill: none;
      stroke: rgba(255, 255, 255, 0.06);
      stroke-width: 1.5;
    }
  }

  &__back {
    position: relative;
    background: rgba(255, 255, 255, 0.14);
    border: 0;
    color: #fff;
    width: 44px;
    height: 44px;
    border-radius: 13px;
    display: grid;
    place-items: center;
    cursor: pointer;
    flex-shrink: 0;
    transition: background 0.15s;

    &:active {
      background: rgba(255, 255, 255, 0.24);
    }
    &:focus-visible {
      outline: 3px solid #fff;
      outline-offset: 2px;
    }
  }

  &__body {
    position: relative;
    flex: 1;
    min-width: 0;
  }

  &__meta {
    font-size: 13px;
    color: #bfe6d6;
    margin: 8px 0 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

/* Chapa de matrícula */
.plate {
  display: inline-flex;
  align-items: stretch;
  background: #fff;
  border: 2px solid #0f172a;
  border-radius: 8px;
  overflow: hidden;
  max-width: 100%;

  &__faixa {
    display: grid;
    place-items: center;
    padding: 0 7px;
    background: #064e3b;
    color: #facc15;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.05em;
  }

  &__num {
    padding: 5px 12px;
    font-size: 20px;
    font-weight: 800;
    letter-spacing: 0.1em;
    color: #0f172a;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

/* Anel do score */
.ring {
  position: relative;
  width: 68px;
  height: 68px;
  flex-shrink: 0;

  &__svg { width: 100%; height: 100%; }
  &__track { fill: none; stroke: rgba(255, 255, 255, 0.14); stroke-width: 6; }

  &__value {
    fill: none;
    stroke-width: 6;
    stroke-linecap: round;
    transition: stroke-dasharray 0.6s ease;
  }

  &__num {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    font-size: 22px;
    font-weight: 800;
    font-variant-numeric: tabular-nums;
  }

  &--regular { .ring__value { stroke: #34d399; } .ring__num { color: #6ee7b7; } }
  &--atencao { .ring__value { stroke: #fbbf24; } .ring__num { color: #fcd34d; } }
  &--critico { .ring__value { stroke: #f87171; } .ring__num { color: #fca5a5; } }
}

/* ============================================================ */
/* BANNER                                                       */
/* ============================================================ */
.vd-banner {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border-radius: 18px;
  margin-bottom: 12px;
  border: 1px solid transparent;

  &__icon {
    width: 46px;
    height: 46px;
    flex-shrink: 0;
    display: grid;
    place-items: center;
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.7);
  }

  b {
    display: block;
    font-size: 16px;
    font-weight: 800;
  }
  small {
    display: block;
    font-size: 13px;
    margin-top: 2px;
    opacity: 0.85;
  }

  &--regular { background: var(--v-ok-bg); color: var(--v-ok-ink); border-color: #a7f3d0; }
  &--atencao { background: var(--v-warn-bg); color: var(--v-warn-ink); border-color: #fde68a; }
  &--critico { background: var(--v-bad-bg); color: var(--v-bad-ink); border-color: #fecaca; }
}

/* ============================================================ */
/* PASSOS                                                       */
/* ============================================================ */
.vd-steps {
  display: flex;
  gap: 6px;
  padding: 8px;
  background: #fff;
  border: 1px solid var(--v-line);
  border-radius: 18px;
  margin-bottom: 12px;
  overflow-x: auto;
  scrollbar-width: none;
  scroll-snap-type: x proximity;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    display: none;
  }
}

.vd-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  min-width: 78px;
  padding: 10px 8px 8px;
  border: 0;
  border-radius: 14px;
  background: transparent;
  color: var(--v-muted);
  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  flex-shrink: 0;
  scroll-snap-align: center;
  transition: background 0.15s, color 0.15s;

  &__num {
    position: relative;
    width: 44px;
    height: 44px;
    display: grid;
    place-items: center;
    border-radius: 13px;
    background: #f1f5f4;
    color: #475569;
    transition: background 0.15s, color 0.15s;
  }

  &__dot {
    position: absolute;
    top: -3px;
    right: -3px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 2px solid #fff;
    background: #94a3b8;

    &--ok { background: var(--v-ok); }
    &--bad { background: var(--v-bad); }
    &--warn { background: var(--v-warn); }
  }

  &:active { background: #f6f9f8; }
  &:focus-visible { outline: 3px solid #10b981; outline-offset: 1px; }

  &--feito .vd-step__num { background: #d1fae5; color: #065f46; }

  &--active {
    background: #ecfdf5;
    color: #064e3b;

    .vd-step__num { background: #064e3b; color: #fff; }
    .vd-step__dot { border-color: #ecfdf5; }
  }
}

/* ============================================================ */
/* PAINEL                                                       */
/* ============================================================ */
.vd-panel {
  background: #fff;
  border: 1px solid var(--v-line);
  border-radius: 22px;
  padding: 18px;
  margin-bottom: 12px;
  overflow: hidden;
  touch-action: pan-y;
}

.vd-block__title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 17px;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: var(--v-ink);
  margin: 0 0 16px;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--sicam-line-soft, #eef2f0);
}

.vd-block__icon {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  background: #ecfdf5;
  color: #065f46;
  flex-shrink: 0;
}

/* ============================================================ */
/* CAMPOS                                                       */
/* ============================================================ */
.vd-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
}

.vd-field {
  padding: 12px 14px;
  background: #f6f9f8;
  border-radius: 14px;
  min-width: 0;

  &--full { grid-column: 1 / -1; }

  &__label {
    display: block;
    font-size: 12px;
    font-weight: 600;
    color: var(--v-muted);
    margin-bottom: 4px;
  }

  &__value {
    display: block;
    font-size: 15px;
    font-weight: 700;
    color: var(--v-ink);
    word-break: break-word;

    &--grande { font-size: 18px; }
    &--placa { letter-spacing: 0.08em; }
    &--mono {
      font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
      font-size: 14px;
      letter-spacing: 0.02em;
    }
  }

  &__linha {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  &__link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 15px;
    font-weight: 700;
    color: #065f46;
    text-decoration: none;
    word-break: break-all;

    &:active { opacity: 0.7; }
    &:focus-visible {
      outline: 3px solid #10b981;
      outline-offset: 2px;
      border-radius: 4px;
    }
  }
}

.vd-copy {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 10px;
  background: #fff;
  color: #065f46;
  cursor: pointer;

  &:active { background: #d1fae5; }
  &:focus-visible { outline: 3px solid #10b981; outline-offset: 1px; }
}

/* ============================================================ */
/* LISTAS / ITENS                                               */
/* ============================================================ */
.vd-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.vd-item {
  border: 1px solid var(--v-line);
  border-left: 4px solid var(--v-line);
  border-radius: 16px;
  padding: 14px 16px;
  background: #fff;

  &--ok { border-left-color: var(--v-ok); }
  &--bad { border-left-color: var(--v-bad); }

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 12px;

    b {
      font-size: 15px;
      font-weight: 800;
      color: var(--v-ink);
      letter-spacing: 0.02em;
    }
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 12px;

    > div {
      span {
        display: block;
        font-size: 12px;
        color: var(--v-muted);
        margin-bottom: 2px;
      }
      b {
        font-size: 14px;
        font-weight: 700;
        color: var(--v-ink);
      }
    }
  }
}

.vd-note {
  margin: 12px 0 0;
  font-size: 13px;
  color: #475569;
  line-height: 1.6;
}

.vd-vazio {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 28px 0;
  color: var(--v-muted);

  .q-icon { color: #a7e3c8; }
  b { font-size: 15px; color: #334155; }
}

.vd-ok-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 24px 12px;
  gap: 6px;

  &__icon {
    width: 72px;
    height: 72px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    background: var(--v-ok-bg);
    color: var(--v-ok);
    margin-bottom: 6px;
  }

  b { font-size: 17px; font-weight: 800; color: var(--v-ok-ink); }
  p { margin: 0; font-size: 14px; color: var(--v-muted); }
}

.vd-alerta {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  margin-bottom: 12px;
  background: var(--v-bad-bg);
  border: 1px solid #fecaca;
  border-radius: 14px;
  color: var(--v-bad-ink);
  font-size: 14px;
  font-weight: 700;

  .q-icon { color: var(--v-bad); flex-shrink: 0; }
}

/* ============================================================ */
/* BADGES                                                       */
/* ============================================================ */
.vd-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  border-radius: 99px;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;

  &::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
  }

  &--ok { background: var(--v-ok-bg); color: var(--v-ok-ink); }
  &--bad { background: var(--v-bad-bg); color: var(--v-bad-ink); }
}

/* ============================================================ */
/* KPIs                                                         */
/* ============================================================ */
.vd-kpis {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
  gap: 10px;
  margin-bottom: 16px;
}

.vd-kpi {
  background: #f6f9f8;
  border-radius: 14px;
  padding: 12px 14px;

  span {
    display: block;
    font-size: 12px;
    font-weight: 600;
    color: var(--v-muted);
    margin-bottom: 4px;
  }

  b {
    font-size: 20px;
    font-weight: 800;
    color: var(--v-ink);
    font-variant-numeric: tabular-nums;
  }

  &--warning { background: var(--v-warn-bg); b { color: var(--v-warn-ink); } }
  &--ok { background: var(--v-ok-bg); b { color: var(--v-ok-ink); } }
  &--critical { background: var(--v-bad-bg); b { color: var(--v-bad-ink); } }
}

/* ============================================================ */
/* RESUMO                                                       */
/* ============================================================ */
.vd-resumo {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;

  &__item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 14px;
    border-radius: 16px;
    background: #f6f9f8;

    &--ok .vd-resumo__icon { color: var(--v-ok); }
    &--bad {
      background: var(--v-bad-bg);
      .vd-resumo__icon { color: var(--v-bad); }
    }
  }

  &__icon { flex-shrink: 0; margin-top: 1px; }
  &__txt { flex: 1; min-width: 0; }

  &__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 4px;

    b { font-size: 15px; font-weight: 800; color: var(--v-ink); }
  }

  p { margin: 0; font-size: 13px; color: #475569; line-height: 1.5; }
}

/* ============================================================ */
/* BOTÕES                                                       */
/* ============================================================ */
.vd-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 0;
  border-radius: 14px;
  padding: 14px 20px;
  min-height: 48px;
  font-size: 15px;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.15s, transform 0.1s;

  &:active:not(:disabled) { transform: scale(0.98); }
  &:disabled { opacity: 0.45; cursor: not-allowed; }
  &:focus-visible { outline: 3px solid #10b981; outline-offset: 2px; }

  &--primary {
    background: #064e3b;
    color: #fff;
    &:active:not(:disabled) { background: #047857; }
  }

  &--outline {
    background: #fff;
    color: var(--v-ink);
    border: 1px solid var(--v-line);

    &:active:not(:disabled) { background: #ecfdf5; border-color: #a7e3c8; }
  }

  &--gold {
    background: #facc15;
    color: #3b2f00;
    &:active:not(:disabled) { background: #fde047; }
  }
}

/* ============================================================ */
/* DOCK (navegação fixa no fundo)                               */
/* ============================================================ */
.vd-dock {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 12px 14px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom, 0px));
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: saturate(180%) blur(14px);
  -webkit-backdrop-filter: saturate(180%) blur(14px);
  border-top: 1px solid var(--v-line);
  box-shadow: 0 -6px 20px rgba(6, 78, 59, 0.06);
  box-sizing: border-box;
  max-width: 900px;
  margin: 0 auto;

  /* em desktop fica "colado" ao centro */
  @media (min-width: 900px) {
    left: 50%;
    transform: translateX(-50%);
    right: auto;
    width: 900px;
    border-radius: 20px 20px 0 0;
    border-left: 1px solid var(--v-line);
    border-right: 1px solid var(--v-line);
  }

  &__btn {
    width: 48px;
    height: 48px;
    display: grid;
    place-items: center;
    border: 0;
    border-radius: 14px;
    cursor: pointer;
    transition: background 0.15s, transform 0.1s, opacity 0.15s;
    flex-shrink: 0;

    &:active:not(:disabled) { transform: scale(0.94); }
    &:disabled { opacity: 0.35; cursor: not-allowed; }
    &:focus-visible { outline: 3px solid #10b981; outline-offset: 2px; }

    &--ghost {
      background: #ecfdf5;
      color: #064e3b;
      &:active:not(:disabled) { background: #d1fae5; }
    }

    &--primary {
      background: #064e3b;
      color: #fff;
      &:active:not(:disabled) { background: #047857; }
    }

    &--gold {
      background: #facc15;
      color: #3b2f00;
      &:active:not(:disabled) { background: #fde047; }
    }
  }

  &__center {
    flex: 1;
    text-align: center;
    min-width: 0;
    line-height: 1.15;
  }

  &__count {
    display: block;
    font-size: 12px;
    font-weight: 700;
    color: var(--v-muted);
    font-variant-numeric: tabular-nums;
  }

  &__label {
    display: block;
    font-size: 14px;
    font-weight: 800;
    color: var(--v-ink);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

/* ============================================================ */
/* ACESSIBILIDADE — reduzir movimento                           */
/* ============================================================ */
@media (prefers-reduced-motion: reduce) {
  .ring__value { transition: none; }
  .sk-head, .sk-banner, .sk-steps, .sk-panel { animation: none; }
  .vd-progress__bar { transition: none; }
}
</style>