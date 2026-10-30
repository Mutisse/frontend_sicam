<template>
  <q-page class="ex-page">
    <!-- ============================================================ -->
    <!-- SKELETON                                                      -->
    <!-- ============================================================ -->
    <div v-if="!store.carregado" class="ex-skeleton">
      <div class="sk-head">
        <div class="sk-title" />
        <div class="sk-sub" />
      </div>

      <div class="sk-card">
        <div class="sk-label" />
        <div class="sk-options">
          <div v-for="i in 4" :key="`sk-opt-${i}`" class="sk-option" />
        </div>

        <div class="sk-label" />
        <div class="sk-row-2">
          <div class="sk-input" />
          <div class="sk-input" />
        </div>

        <div class="sk-label" />
        <div class="sk-input" />

        <div class="sk-label" />
        <div class="sk-options">
          <div v-for="i in 4" :key="`sk-fmt-${i}`" class="sk-format" />
        </div>

        <div class="sk-footer" />
      </div>

      <div class="sk-table">
        <div v-for="i in 3" :key="`sk-row-${i}`" class="sk-row" />
      </div>
    </div>

    <!-- ============================================================ -->
    <!-- CONTEÚDO                                                      -->
    <!-- ============================================================ -->
    <template v-else>
      <!-- CABEÇALHO -->
      <header class="page-head">
        <div>
          <h1 class="page-head__title">Exportação de Dados</h1>
          <p class="page-head__sub">
            Gere ficheiros para análise externa, arquivo ou envio a parceiros
          </p>
        </div>
      </header>

      <!-- ERRO -->
      <div v-if="store.erro" class="form-error">
        <q-icon name="error" size="18px" />
        {{ store.erro }}
      </div>

      <!-- CARD PRINCIPAL — Configuração -->
      <section class="ex-form">
        <!-- Tipo de dados -->
        <div class="ex-form__group">
          <label class="ex-form__label">
            <q-icon name="category" size="18px" />
            O que exportar
          </label>
          <div class="ex-form__options">
            <button
              v-for="t in store.TIPOS"
              :key="t.key"
              class="ex-option"
              :class="{ 'ex-option--active': store.tipoSelecionado === t.key }"
              @click="store.tipoSelecionado = t.key"
            >
              <q-icon :name="t.icon" size="22px" />
              <span class="ex-option__label">{{ t.label }}</span>
              <span class="ex-option__desc">{{ t.descricao }}</span>
            </button>
          </div>
        </div>

        <!-- Período -->
        <div class="ex-form__group">
          <label class="ex-form__label">
            <q-icon name="event" size="18px" />
            Período
          </label>

          <div class="ex-form__row">
            <div class="ex-form__field">
              <span class="ex-form__sublabel">De</span>
              <input v-model="store.dataDe" type="date" class="ex-form__input" />
            </div>
            <div class="ex-form__field">
              <span class="ex-form__sublabel">Até</span>
              <input v-model="store.dataAte" type="date" class="ex-form__input" />
            </div>
          </div>

          <div class="ex-form__shortcuts">
            <button class="ex-shortcut" @click="store.definirPeriodo('7d')">
              Últimos 7 dias
            </button>
            <button class="ex-shortcut" @click="store.definirPeriodo('30d')">
              Últimos 30 dias
            </button>
            <button class="ex-shortcut" @click="store.definirPeriodo('90d')">
              Últimos 90 dias
            </button>
            <button class="ex-shortcut" @click="store.definirPeriodo('ano')">
              Último ano
            </button>
            <button
              class="ex-shortcut ex-shortcut--clear"
              @click="store.limparPeriodo"
            >
              Limpar
            </button>
          </div>
        </div>

        <!-- Província -->
        <div class="ex-form__group">
          <label class="ex-form__label">
            <q-icon name="location_on" size="18px" />
            Província
          </label>
          <select v-model="store.filtroProvincia" class="ex-form__input">
            <option v-for="p in store.PROVINCIAS" :key="p" :value="p">
              {{ p }}
            </option>
          </select>
        </div>

        <!-- Formato -->
        <div class="ex-form__group">
          <label class="ex-form__label">
            <q-icon name="file_present" size="18px" />
            Formato
          </label>
          <div class="ex-form__row ex-form__row--formats">
            <button
              v-for="f in store.FORMATOS"
              :key="f.key"
              class="ex-format"
              :class="{ 'ex-format--active': store.formatoSelecionado === f.key }"
              @click="store.formatoSelecionado = f.key"
            >
              <q-icon :name="f.icon" size="28px" />
              <span class="ex-format__label">{{ f.label }}</span>
              <span class="ex-format__ext">.{{ f.extensao }}</span>
            </button>
          </div>
        </div>

        <!-- Opções adicionais -->
        <div class="ex-form__group">
          <label class="ex-form__label">
            <q-icon name="tune" size="18px" />
            Opções adicionais
          </label>
          <div class="ex-form__checkboxes">
            <label class="ex-checkbox">
              <input v-model="store.opcoes.incluirCabecalho" type="checkbox" />
              <span>Incluir cabeçalho e data de geração</span>
            </label>
            <label class="ex-checkbox">
              <input v-model="store.opcoes.incluirResumo" type="checkbox" />
              <span>Incluir resumo com totais no início</span>
            </label>
            <label class="ex-checkbox">
              <input v-model="store.opcoes.apenasActivos" type="checkbox" />
              <span>Apenas registos activos (excluir cancelados)</span>
            </label>
          </div>
        </div>

        <!-- Rodapé do card -->
        <div class="ex-form__footer">
          <div class="ex-form__info">
            <q-icon name="info" size="16px" />
            <span>
              Serão exportados <b>{{ store.totalRegistos }}</b> registos em
              formato <b>{{ store.formatoAtual.label }}</b>.
            </span>
          </div>
          <button
            class="ex-btn ex-btn--primary"
            :disabled="store.aProcessar"
            @click="exportar"
          >
            <q-icon
              :name="store.aProcessar ? 'hourglass_top' : 'download'"
              size="20px"
            />
            {{ store.aProcessar ? 'A gerar…' : 'Exportar agora' }}
          </button>
        </div>
      </section>

      <!-- EXPORTAÇÕES RECENTES -->
      <section class="block">
        <header class="block__head">
          <h2 class="block__title">Exportações recentes</h2>
          <span class="block__count">{{ store.exportacoesRecentes.length }}</span>
        </header>

        <p v-if="!store.exportacoesRecentes.length" class="ex-empty">
          Ainda não foram feitas exportações.
        </p>

        <ul v-else class="ex-list">
          <li
            v-for="e in store.exportacoesRecentes"
            :key="e.id"
            class="ex-item"
          >
            <div class="ex-item__icon" :class="`ex-item__icon--${e.formato}`">
              <q-icon :name="store.iconeFormato(e.formato)" size="22px" />
            </div>

            <div class="ex-item__body">
              <b>{{ e.titulo }}</b>
              <span>{{ e.detalhe }}</span>
            </div>

            <div class="ex-item__meta">
              <span class="ex-item__date">{{ e.data }}</span>
              <span class="ex-item__size">{{ e.tamanho }}</span>
            </div>

            <button
              class="ex-item__action"
              title="Remover do histórico"
              @click="pedirRemover(e.id)"
            >
              <q-icon name="delete" size="18px" />
            </button>
          </li>
        </ul>
      </section>
    </template>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useGestmulExportacaoStore } from '@/stores/gestmul/gestmul-ExportacaoStore'

const store = useGestmulExportacaoStore()
const $q = useQuasar()

// ============================================================
// Ciclo de vida
// ============================================================
onMounted(() => {
  store.carregarHistorico()
})

// ============================================================
// Exportar
// ============================================================
async function exportar() {
  const ok = await store.exportar()

  if (ok) {
    $q.notify({
      type: 'positive',
      message: `Ficheiro ${store.formatoAtual.label} exportado com sucesso.`,
      position: 'top',
    })
  } else if (store.erro) {
    $q.notify({
      type: 'negative',
      message: store.erro,
      position: 'top',
    })
  }
}

// ============================================================
// Remover do histórico
// ============================================================
function pedirRemover(id: string) {
  $q.dialog({
    title: 'Remover exportação',
    message: 'Remover esta entrada do histórico?',
    cancel: { label: 'Voltar', flat: true },
    ok: { label: 'Remover', color: 'negative' },
    persistent: true,
  }).onOk(async () => {
    const ok = await store.removerExportacao(id)
    if (ok) {
      $q.notify({
        type: 'positive',
        message: 'Removida do histórico.',
        position: 'top',
      })
    }
  })
}
</script>

<style scoped lang="scss">
/* ============================================================ */
/* SKELETON                                                     */
/* ============================================================ */
@keyframes sk-shimmer {
  0% {
    background-position: -400px 0;
  }
  100% {
    background-position: 400px 0;
  }
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
  border-radius: 12px;
}

.ex-skeleton {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 24px 0;
}

.sk-head {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 4px;

  .sk-title {
    @extend %sk-block;
    height: 28px;
    width: 320px;
    max-width: 60%;
  }
  .sk-sub {
    @extend %sk-block;
    height: 16px;
    width: 440px;
    max-width: 80%;
  }
}

.sk-card {
  display: flex;
  flex-direction: column;
  gap: 18px;
  background: #fff;
  border-radius: 14px;
  padding: 24px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.sk-label {
  @extend %sk-block;
  height: 14px;
  width: 140px;
}

.sk-options {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;

  @media (max-width: 800px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 500px) {
    grid-template-columns: 1fr;
  }
}

.sk-option {
  @extend %sk-block;
  height: 90px;
}

.sk-row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.sk-input {
  @extend %sk-block;
  height: 42px;
}

.sk-format {
  @extend %sk-block;
  height: 90px;
}

.sk-footer {
  @extend %sk-block;
  height: 60px;
  margin-top: 8px;
}

.sk-table {
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: #fff;
  border-radius: 14px;
  padding: 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.sk-row {
  @extend %sk-block;
  height: 50px;
  border-radius: 8px;
}

/* ============================================================ */
/* ERRO                                                         */
/* ============================================================ */
.form-error {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  border-radius: 10px;
  background: var(--sicam-critical-bg);
  color: var(--sicam-critical-ink);
  font-size: 13px;
  margin-bottom: 16px;
}

/* ============================================================ */
/* Página                                                       */
/* ============================================================ */
.ex-page {
  padding: 24px 20px 48px;
  max-width: 1000px;
  margin: 0 auto;
}

.page-head {
  margin-bottom: 24px;

  &__title {
    font-size: 24px;
    font-weight: 700;
    color: var(--sicam-ink);
    margin: 0 0 6px;
  }

  &__sub {
    font-size: 14px;
    color: var(--sicam-muted);
    margin: 0;
  }
}

/* ============================================================ */
/* Formulário principal                                         */
/* ============================================================ */
.ex-form {
  background: #fff;
  border-radius: 14px;
  padding: 24px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  margin-bottom: 20px;

  &__group {
    margin-bottom: 24px;
    &:last-of-type {
      margin-bottom: 0;
    }
  }

  &__label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 700;
    color: var(--sicam-ink);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    margin-bottom: 12px;
  }

  &__options {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;

    @media (max-width: 800px) {
      grid-template-columns: repeat(2, 1fr);
    }
    @media (max-width: 500px) {
      grid-template-columns: 1fr;
    }
  }

  &__row {
    display: flex;
    gap: 12px;

    @media (max-width: 600px) {
      flex-direction: column;
    }

    &--formats {
      gap: 14px;
    }
  }

  &__field {
    flex: 1;
    min-width: 0;
  }

  &__sublabel {
    display: block;
    font-size: 11px;
    color: var(--sicam-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 6px;
    font-weight: 600;
  }

  &__input {
    width: 100%;
    border: 1px solid var(--sicam-line);
    border-radius: 10px;
    padding: 11px 14px;
    font-size: 14px;
    font-family: inherit;
    color: var(--sicam-ink);
    background: var(--sicam-surface-alt);

    &:focus {
      outline: 0;
      border-color: var(--sicam-primary-light);
      background: #fff;
    }
  }

  &__shortcuts {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 12px;
  }

  &__checkboxes {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-top: 28px;
    padding-top: 20px;
    border-top: 1px solid var(--sicam-line-soft);
    flex-wrap: wrap;
  }

  &__info {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: var(--sicam-muted);

    b {
      color: var(--sicam-ink);
      font-weight: 700;
    }
  }
}

.ex-option {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  padding: 14px;
  background: var(--sicam-surface-alt);
  border: 2px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
  text-align: left;

  .q-icon {
    color: var(--sicam-muted);
  }

  &__label {
    font-size: 14px;
    font-weight: 700;
    color: var(--sicam-ink);
    margin-top: 4px;
  }

  &__desc {
    font-size: 11px;
    color: var(--sicam-muted);
  }

  &:hover {
    background: var(--sicam-surface-hover);
  }

  &--active {
    border-color: var(--sicam-primary-light);
    background: #ecfdf5;

    .q-icon {
      color: var(--sicam-primary);
    }
    .ex-option__label {
      color: var(--sicam-primary);
    }
  }
}

.ex-shortcut {
  background: #fff;
  border: 1px solid var(--sicam-line);
  border-radius: 99px;
  padding: 6px 14px;
  font-size: 12px;
  font-weight: 600;
  color: var(--sicam-ink);
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;

  &:hover {
    background: var(--sicam-surface-hover);
    border-color: var(--sicam-line-strong);
  }

  &--clear {
    color: var(--sicam-critical);
    border-color: rgba(239, 68, 68, 0.25);

    &:hover {
      background: var(--sicam-critical-bg);
    }
  }
}

.ex-format {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 16px 20px;
  background: var(--sicam-surface-alt);
  border: 2px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
  flex: 1;
  min-width: 100px;

  .q-icon {
    color: var(--sicam-muted);
  }

  &__label {
    font-size: 13px;
    font-weight: 700;
    color: var(--sicam-ink);
  }

  &__ext {
    font-size: 11px;
    color: var(--sicam-muted);
    text-transform: uppercase;
  }

  &:hover {
    background: var(--sicam-surface-hover);
  }

  &--active {
    border-color: var(--sicam-primary-light);
    background: #ecfdf5;

    .q-icon {
      color: var(--sicam-primary);
    }
    .ex-format__label {
      color: var(--sicam-primary);
    }
  }
}

.ex-checkbox {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-size: 14px;
  color: var(--sicam-ink);

  input[type='checkbox'] {
    width: 18px;
    height: 18px;
    accent-color: var(--sicam-primary);
    cursor: pointer;
  }
}

.ex-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 0;
  border-radius: 10px;
  padding: 12px 24px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;

  &--primary {
    background: var(--sicam-primary-light);
    color: #fff;

    &:hover:not(:disabled) {
      background: var(--sicam-primary);
    }
    &:disabled {
      opacity: 0.6;
      cursor: wait;
    }
  }
}

/* ============================================================ */
/* Bloco — Exportações recentes                                 */
/* ============================================================ */
.block {
  background: #fff;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);

  &__head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    padding: 18px 20px 14px;
    border-bottom: 1px solid var(--sicam-line-soft);
  }

  &__title {
    font-size: 15px;
    font-weight: 700;
    color: var(--sicam-ink);
    margin: 0;
  }

  &__count {
    font-size: 12px;
    color: var(--sicam-muted);
    background: var(--sicam-line-soft);
    padding: 2px 10px;
    border-radius: 99px;
    font-weight: 600;
  }
}

.ex-empty {
  text-align: center;
  font-size: 13px;
  color: var(--sicam-muted);
  padding: 32px 20px;
  margin: 0;
}

.ex-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.ex-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 20px;
  border-top: 1px solid var(--sicam-line-soft);
  transition: background 0.15s;

  &:first-child {
    border-top: 0;
  }
  &:hover {
    background: #fbfdfc;
  }

  &__icon {
    width: 42px;
    height: 42px;
    border-radius: 12px;
    display: grid;
    place-items: center;
    flex-shrink: 0;

    &--csv {
      background: var(--sicam-success-bg);
      color: var(--sicam-success-ink);
    }
    &--xlsx {
      background: var(--sicam-primary-bg);
      color: var(--sicam-primary);
    }
    &--pdf {
      background: var(--sicam-critical-bg);
      color: var(--sicam-critical-ink);
    }
    &--json {
      background: var(--sicam-warning-bg);
      color: var(--sicam-warning-ink);
    }
  }

  &__body {
    flex: 1;
    min-width: 0;

    b {
      display: block;
      font-size: 14px;
      color: var(--sicam-ink);
      margin-bottom: 2px;
    }

    span {
      display: block;
      font-size: 12px;
      color: var(--sicam-muted);
    }
  }

  &__meta {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 2px;
    flex-shrink: 0;
    margin-right: 8px;

    @media (max-width: 600px) {
      display: none;
    }
  }

  &__date {
    font-size: 12px;
    color: var(--sicam-muted);
  }
  &__size {
    font-size: 11px;
    color: var(--sicam-line-strong);
  }

  &__action {
    display: grid;
    place-items: center;
    width: 36px;
    height: 36px;
    border: 0;
    border-radius: 8px;
    background: transparent;
    color: var(--sicam-muted);
    cursor: pointer;
    transition: all 0.15s;
    flex-shrink: 0;

    &:hover {
      background: var(--sicam-critical-bg);
      color: var(--sicam-critical-ink);
    }
  }
}

/* ============================================================ */
/* Impressão                                                    */
/* ============================================================ */
@media print {
  .ex-form__footer,
  .ex-form__shortcuts,
  .ex-form__checkboxes,
  .ex-item__action {
    display: none !important;
  }
}
</style>