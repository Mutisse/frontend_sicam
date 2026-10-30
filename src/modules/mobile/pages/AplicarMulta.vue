<template>
  <div class="agente-multa">
    <!-- CABEÇALHO -->
    <header class="agente-multa__head">
      <button class="agente-multa__back" @click="voltar">
        <q-icon name="arrow_back" size="22px" />
      </button>
      <div>
        <h1 class="agente-multa__title">Aplicar multa</h1>
        <p class="agente-multa__sub">{{ store.matricula }}</p>
      </div>
    </header>

    <!-- RESUMO DO VEÍCULO -->
    <section class="agente-multa__veiculo">
      <div class="agente-multa__veiculo-row">
        <span class="agente-multa__label">Matrícula</span>
        <b>{{ store.matricula }}</b>
      </div>
      <div class="agente-multa__veiculo-row">
        <span class="agente-multa__label">Proprietário</span>
        <b>{{ store.proprietario }}</b>
      </div>
      <div class="agente-multa__veiculo-row">
        <span class="agente-multa__label">Posto</span>
        <b>{{ store.postoActual }}</b>
      </div>
    </section>

    <!-- FORMULÁRIO -->
    <form class="agente-multa__form" @submit.prevent="aplicar">
      <!-- Tipo de infracção -->
      <div class="agente-multa__field">
        <label class="agente-multa__field-label" for="infracao">
          Tipo de infracção <span class="agente-multa__required">*</span>
        </label>
        <select
          id="infracao"
          v-model="store.infracaoSelecionada"
          class="agente-multa__select"
          required
        >
          <option value="" disabled>Selecione a infracção…</option>
          <option
            v-for="i in store.INFRACOES"
            :key="i.codigo"
            :value="i.codigo"
          >
            {{ i.label }} — {{ store.formatarMT(i.valor) }}
          </option>
        </select>
      </div>

      <!-- Valor (auto) -->
      <div class="agente-multa__field">
        <label class="agente-multa__field-label">Valor da multa</label>
        <div class="agente-multa__valor">{{ store.valorFormatado }}</div>
      </div>

      <!-- Nº de chapa / carapa -->
      <div class="agente-multa__field">
        <label class="agente-multa__field-label" for="chapa">
          Nº de chapa / carapa <span class="agente-multa__required">*</span>
        </label>
        <input
          id="chapa"
          v-model.trim="store.chapa"
          type="text"
          inputmode="numeric"
          placeholder="Ex.: 000123"
          maxlength="12"
          class="agente-multa__input"
          required
        />
        <small class="agente-multa__hint">
          Número visível na chapa/carapa do veículo
        </small>
      </div>

      <!-- Observações -->
      <div class="agente-multa__field">
        <label class="agente-multa__field-label" for="obs">
          Observações <span class="agente-multa__optional">(opcional)</span>
        </label>
        <textarea
          id="obs"
          v-model.trim="store.observacoes"
          rows="3"
          placeholder="Detalhes adicionais sobre a ocorrência…"
          class="agente-multa__textarea"
        />
      </div>

      <!-- Info do agente -->
      <div class="agente-multa__agente">
        <q-icon name="badge" size="18px" />
        <span>
          Agente <b>{{ agenteNome }}</b> · {{ dataHoraActual }}
        </span>
      </div>

      <!-- Ações -->
      <div class="agente-multa__actions">
        <button
          type="button"
          class="agente-multa__btn agente-multa__btn--ghost"
          @click="voltar"
        >
          Cancelar
        </button>
        <button
          type="submit"
          class="agente-multa__btn agente-multa__btn--primary"
          :disabled="!store.podeAplicar || store.aAplicar"
        >
          <q-spinner v-if="store.aAplicar" size="16px" />
          {{ store.aAplicar ? "A aplicar…" : "Aplicar multa" }}
        </button>
      </div>
    </form>

    <!-- MODAL DE SUCESSO -->
    <q-dialog v-model="store.mostrarSucesso" persistent>
      <div class="agente-multa__sucesso">
        <div class="agente-multa__sucesso-icon">
          <q-icon name="check_circle" size="56px" color="positive" />
        </div>
        <h2 class="agente-multa__sucesso-title">Multa aplicada</h2>
        <p class="agente-multa__sucesso-sub">
          O auto foi registado com sucesso no sistema.
        </p>

        <div class="agente-multa__sucesso-info">
          <div>
            <span>Código</span>
            <b>{{ store.autoAplicado?.codigo }}</b>
          </div>
          <div>
            <span>Matrícula</span>
            <b>{{ store.autoAplicado?.matricula }}</b>
          </div>
          <div>
            <span>Infração</span>
            <b>{{ store.autoAplicado?.infracao }}</b>
          </div>
          <div>
            <span>Valor</span>
            <b>{{ store.autoAplicado?.valor }}</b>
          </div>
          <div>
            <span>Nº chapa</span>
            <b>{{ store.autoAplicado?.chapa }}</b>
          </div>
          <div>
            <span>Data</span>
            <b>{{ store.autoAplicado?.data }}</b>
          </div>
        </div>

        <div class="agente-multa__sucesso-actions">
          <button
            class="agente-multa__btn agente-multa__btn--ghost"
            @click="fecharSucesso"
          >
            Fechar
          </button>
          <button
            class="agente-multa__btn agente-multa__btn--primary"
            @click="baixarAuto"
          >
            <q-icon name="download" size="18px" />
            Baixar auto
          </button>
        </div>
      </div>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from '@/stores/auth'
import { useAgenteMultaStore } from '@/stores/agente/agente-multa.store'

const router = useRouter()
const route = useRoute()
const $q = useQuasar()
const auth = useAuthStore()
const store = useAgenteMultaStore()

// ------------------------------------------------------------
// Agente + hora
// ------------------------------------------------------------
const agenteNome = computed(() => auth.utilizador?.nome ?? 'Agente')

const dataHoraActual = computed(() => {
  const d = new Date()
  const dia = String(d.getDate()).padStart(2, '0')
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  return `${dia}/${mes} ${h}:${m}`
})

// ------------------------------------------------------------
// Ciclo de vida
// ------------------------------------------------------------
onMounted(() => {
  store.carregarDadosVeiculo({
    matricula: route.query.matricula as string | undefined,
    proprietario: route.query.proprietario as string | undefined,
    posto: route.query.posto as string | undefined,
  })
})

// ------------------------------------------------------------
// Aplicar multa
// ------------------------------------------------------------
async function aplicar() {
  if (!store.podeAplicar || store.aAplicar) return

  try {
    const auto = await store.aplicarMulta(agenteNome.value)
    if (!auto) return

    $q.notify({
      type: 'positive',
      message: `Multa ${auto.codigo} aplicada com sucesso`,
      position: 'top',
    })
  } catch {
    $q.notify({
      type: 'negative',
      message: 'Não foi possível aplicar a multa. Tente novamente.',
      position: 'top',
    })
  }
}

// ------------------------------------------------------------
// Baixar auto (comprovativo .txt)
// ------------------------------------------------------------
function baixarAuto() {
  const conteudo = store.gerarConteudoAuto(agenteNome.value)
  if (!conteudo || !store.autoAplicado) return

  const blob = new Blob([conteudo], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${store.autoAplicado.codigo}.txt`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  $q.notify({
    type: 'positive',
    message: 'Auto descarregado',
    position: 'top',
  })
}

function fecharSucesso() {
  store.fecharSucesso()
  router.push('/agente')
}

function voltar() {
  router.back()
}
</script>

<style scoped lang="scss">
.agente-multa {
  padding: 0 0 24px;
  background: var(--sicam-bg, #f4f8f6);
  min-height: 100dvh;
}

// ============================================================
// CABEÇALHO
// ============================================================
.agente-multa__head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 16px 12px;
  background: #fff;
  border-bottom: 1px solid var(--sicam-line-soft);
  position: sticky;
  top: 0;
  z-index: 10;
}

.agente-multa__back {
  background: none;
  border: 0;
  color: var(--sicam-ink);
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  border-radius: 8px;

  &:active {
    background: var(--sicam-surface-hover);
  }
}

.agente-multa__title {
  font-size: 17px;
  font-weight: 700;
  color: var(--sicam-ink);
  margin: 0;
  line-height: 1.2;
}

.agente-multa__sub {
  font-size: 12px;
  color: var(--sicam-muted);
  margin: 1px 0 0;
  letter-spacing: 0.02em;
}

// ============================================================
// RESUMO DO VEÍCULO
// ============================================================
.agente-multa__veiculo {
  background: #fff;
  margin: 12px 16px;
  border-radius: 14px;
  padding: 14px 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.agente-multa__veiculo-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;

  & + & {
    border-top: 1px solid var(--sicam-line-soft);
  }

  b {
    font-size: 14px;
    color: var(--sicam-ink);
    font-weight: 700;
  }
}

.agente-multa__label {
  font-size: 12px;
  color: var(--sicam-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

// ============================================================
// FORMULÁRIO
// ============================================================
.agente-multa__form {
  background: #fff;
  margin: 12px 16px;
  border-radius: 14px;
  padding: 18px 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.agente-multa__field {
  margin-bottom: 18px;
}

.agente-multa__field-label {
  display: block;
  font-size: 12px;
  font-weight: 700;
  color: var(--sicam-ink);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 8px;
}

.agente-multa__required {
  color: var(--sicam-critical);
}

.agente-multa__optional {
  color: var(--sicam-muted);
  font-weight: 400;
  text-transform: none;
  letter-spacing: 0;
}

.agente-multa__select,
.agente-multa__input,
.agente-multa__textarea {
  width: 100%;
  background: var(--sicam-bg, #f4f8f6);
  border: 1px solid var(--sicam-line-soft);
  border-radius: 10px;
  padding: 12px 14px;
  font-family: inherit;
  font-size: 15px;
  color: var(--sicam-ink);
  transition:
    border-color 0.15s,
    box-shadow 0.15s;

  &:focus {
    outline: 0;
    border-color: var(--sicam-primary-light);
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
  }
}

.agente-multa__select {
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
  padding-right: 40px;
}

.agente-multa__textarea {
  resize: vertical;
  min-height: 80px;
}

.agente-multa__valor {
  background: var(--sicam-primary-bg, #ecfdf5);
  border: 1px solid var(--sicam-primary-light);
  border-radius: 10px;
  padding: 14px;
  font-size: 20px;
  font-weight: 800;
  color: var(--sicam-primary);
  text-align: center;
  letter-spacing: 0.02em;
}

.agente-multa__hint {
  display: block;
  font-size: 11px;
  color: var(--sicam-muted);
  margin-top: 6px;
}

.agente-multa__agente {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--sicam-muted);
  background: var(--sicam-bg, #f4f8f6);
  border-radius: 10px;
  padding: 10px 12px;
  margin-bottom: 18px;

  .q-icon {
    color: var(--sicam-primary-light);
  }
  b {
    color: var(--sicam-ink);
  }
}

// ============================================================
// BOTÕES
// ============================================================
.agente-multa__actions {
  display: grid;
  grid-template-columns: 1fr 1.4fr;
  gap: 10px;
}

.agente-multa__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 0;
  border-radius: 12px;
  padding: 14px;
  font-family: inherit;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition:
    background 0.15s,
    transform 0.1s;

  &:active:not(:disabled) {
    transform: scale(0.98);
  }
  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  &--primary {
    background: var(--sicam-primary-light);
    color: #fff;

    &:active:not(:disabled) {
      background: var(--sicam-primary);
    }
  }

  &--ghost {
    background: var(--sicam-bg, #f4f8f6);
    color: var(--sicam-ink);
    border: 1px solid var(--sicam-line-soft);
  }
}

// ============================================================
// MODAL DE SUCESSO
// ============================================================
.agente-multa__sucesso {
  background: #fff;
  border-radius: 20px;
  padding: 28px 24px 22px;
  width: 90vw;
  max-width: 380px;
  text-align: center;
}

.agente-multa__sucesso-icon {
  margin-bottom: 8px;
}

.agente-multa__sucesso-title {
  font-size: 20px;
  font-weight: 800;
  color: var(--sicam-ink);
  margin: 0 0 6px;
}

.agente-multa__sucesso-sub {
  font-size: 13px;
  color: var(--sicam-muted);
  margin: 0 0 18px;
}

.agente-multa__sucesso-info {
  background: var(--sicam-bg, #f4f8f6);
  border-radius: 12px;
  padding: 14px;
  text-align: left;
  margin-bottom: 18px;

  > div {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 0;

    & + div {
      border-top: 1px solid var(--sicam-line-soft);
    }

    span {
      font-size: 12px;
      color: var(--sicam-muted);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    b {
      font-size: 13px;
      color: var(--sicam-ink);
      font-weight: 700;
    }
  }
}

.agente-multa__sucesso-actions {
  display: grid;
  grid-template-columns: 1fr 1.4fr;
  gap: 10px;
}
</style>