<template>
  <q-page class="exp-page">
    <!-- ============================================================ -->
    <!-- SKELETON                                                      -->
    <!-- ============================================================ -->
    <div v-if="!store.carregado" class="ina-skeleton">
      <div class="sk-head">
        <div class="sk-title" />
        <div class="sk-sub" />
      </div>
      <div class="sk-form" />
      <div class="sk-list">
        <div v-for="i in 3" :key="i" class="sk-row" />
      </div>
    </div>

    <!-- ============================================================ -->
    <!-- CONTEÚDO REAL                                                 -->
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

      <!-- CARD PRINCIPAL -->
      <section class="exp-form">
        <!-- Tipo de dados -->
        <div class="exp-form__group">
          <label class="exp-form__label">
            <q-icon name="category" size="18px" />
            O que exportar
          </label>
          <div class="exp-form__options">
            <button
              v-for="t in store.TIPOS"
              :key="t.key"
              class="exp-option"
              :class="{ 'exp-option--active': store.tipoSelecionado === t.key }"
              @click="store.tipoSelecionado = t.key"
            >
              <q-icon :name="t.icon" size="22px" />
              <span class="exp-option__label">{{ t.label }}</span>
              <span class="exp-option__desc">{{ t.descricao }}</span>
            </button>
          </div>
        </div>

        <!-- Período -->
        <div class="exp-form__group">
          <label class="exp-form__label">
            <q-icon name="event" size="18px" />
            Período
          </label>
          <div class="exp-form__row">
            <div class="exp-form__field">
              <span class="exp-form__sublabel">De</span>
              <input v-model="store.dataDe" type="date" class="exp-form__input" />
            </div>
            <div class="exp-form__field">
              <span class="exp-form__sublabel">Até</span>
              <input v-model="store.dataAte" type="date" class="exp-form__input" />
            </div>
          </div>

          <div class="exp-form__shortcuts">
            <button class="exp-shortcut" @click="store.definirPeriodo('7d')">Últimos 7 dias</button>
            <button class="exp-shortcut" @click="store.definirPeriodo('30d')">Últimos 30 dias</button>
            <button class="exp-shortcut" @click="store.definirPeriodo('mes')">Este mês</button>
            <button class="exp-shortcut" @click="store.definirPeriodo('ano')">Este ano</button>
            <button class="exp-shortcut exp-shortcut--clear" @click="store.limparPeriodo">Limpar</button>
          </div>
        </div>

        <!-- Formato -->
        <div class="exp-form__group">
          <label class="exp-form__label">
            <q-icon name="file_present" size="18px" />
            Formato
          </label>
          <div class="exp-form__row exp-form__row--formats">
            <button
              v-for="f in store.FORMATOS"
              :key="f.key"
              class="exp-format"
              :class="{ 'exp-format--active': store.formatoSelecionado === f.key }"
              @click="store.formatoSelecionado = f.key"
            >
              <q-icon :name="f.icon" size="28px" />
              <span class="exp-format__label">{{ f.label }}</span>
              <span class="exp-format__ext">.{{ f.extensao }}</span>
            </button>
          </div>
        </div>

        <!-- Opções -->
        <div class="exp-form__group">
          <label class="exp-form__label">
            <q-icon name="tune" size="18px" />
            Opções adicionais
          </label>
          <div class="exp-form__checkboxes">
            <label class="exp-checkbox">
              <input v-model="store.opcoes.incluirCabecalho" type="checkbox" />
              <span>Incluir cabeçalho e data de geração</span>
            </label>
            <label class="exp-checkbox">
              <input v-model="store.opcoes.incluirResumo" type="checkbox" />
              <span>Incluir resumo com totais no início</span>
            </label>
            <label class="exp-checkbox">
              <input v-model="store.opcoes.apenasAtivos" type="checkbox" />
              <span>Apenas registos activos (excluir cancelados)</span>
            </label>
          </div>
        </div>

        <!-- Footer -->
        <div class="exp-form__footer">
          <div class="exp-form__info">
            <q-icon name="info" size="16px" />
            A exportação respeita os filtros de período e opções seleccionadas
          </div>
          <button
            class="exp-btn exp-btn--primary"
            :disabled="store.aProcessar"
            @click="exportar"
          >
            <q-icon :name="store.aProcessar ? 'hourglass_top' : 'download'" size="20px" />
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

        <p v-if="!store.exportacoesRecentes.length" class="exp-empty">
          Ainda não foram feitas exportações.
        </p>

        <ul v-else class="exp-list">
          <li
            v-for="e in store.exportacoesRecentes"
            :key="e.id"
            class="exp-item"
          >
            <div class="exp-item__icon" :class="`exp-item__icon--${e.formato}`">
              <q-icon :name="store.iconeFormato(e.formato)" size="22px" />
            </div>

            <div class="exp-item__body">
              <b>{{ e.titulo }}</b>
              <span>{{ e.detalhe ?? '—' }}</span>
            </div>

            <div class="exp-item__meta">
              <span class="exp-item__date">{{ e.criadoEm }}</span>
              <span class="exp-item__size">{{ store.tamanhoLegivel(e.tamanho_bytes) }}</span>
            </div>

            <button
              class="exp-item__action exp-item__action--danger"
              title="Remover"
              @click="remover(e)"
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
import {
  useInatroExportacaoStore,
  type Exportacao,
} from '@/stores/inatro/inatro-ExportacaoStore'

const store = useInatroExportacaoStore()
const $q = useQuasar()

// ============================================================
// Ciclo de vida
// ============================================================
onMounted(() => {
  store.carregar()
})

// ============================================================
// Exportar
// ============================================================
async function exportar() {
  const r = await store.exportar()

  if (!r.ok) {
    $q.notify({
      type: 'negative',
      message: r.mensagem ?? store.erro ?? 'Erro ao exportar',
      position: 'top',
      timeout: 5000,
    })
    return
  }

  $q.notify({
    type: 'positive',
    message: `Exportação gerada: ${r.registos} registos (${r.formato.toUpperCase()})`,
    caption: `Ficheiro descarregado · ${store.tamanhoLegivel(r.tamanho)}`,
    position: 'top',
    timeout: 4000,
  })
}

// ============================================================
// Remover
// ============================================================
function remover(e: Exportacao) {
  $q.dialog({
    title: 'Remover exportação',
    message: `Remover ${e.codigo ?? e.id} do histórico?`,
    cancel: { label: 'Voltar', flat: true },
    ok: { label: 'Remover', color: 'negative' },
    persistent: true,
  }).onOk(async () => {
    const ok = await store.remover(e.id)
    if (ok) {
      $q.notify({
        type: 'positive',
        message: 'Exportação removida',
        position: 'top',
      })
    }
  })
}
</script>

<style scoped lang="scss">
.exp-page {
  padding: 24px 20px 48px;
  max-width: 1000px;
  margin: 0 auto;
}

/* ============================================================ */
/* SKELETON                                                     */
/* ============================================================ */
@keyframes sk-shimmer {
  0%   { background-position: -400px 0; }
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
  border-radius: 12px;
}

.ina-skeleton {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.sk-head {
  display: flex;
  flex-direction: column;
  gap: 8px;
  .sk-title { @extend %sk-block; height: 28px; width: 320px; max-width: 60%; }
  .sk-sub   { @extend %sk-block; height: 16px; width: 440px; max-width: 80%; }
}

.sk-form { @extend %sk-block; height: 420px; }

.sk-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.sk-row {
  height: 56px;
  border-radius: 8px;
  background: linear-gradient(
    90deg,
    rgba(0, 0, 0, 0.04) 0%,
    rgba(0, 0, 0, 0.07) 50%,
    rgba(0, 0, 0, 0.04) 100%
  );
  background-size: 800px 100%;
  animation: sk-shimmer 1.4s infinite linear;
}

/* ============================================================ */
/* Cabeçalho                                                    */
/* ============================================================ */
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
/* Formulário                                                   */
/* ============================================================ */
.exp-form {
  background: #fff;
  border-radius: 14px;
  padding: 24px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  margin-bottom: 20px;

  &__group {
    margin-bottom: 24px;
    &:last-of-type { margin-bottom: 0; }
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

    @media (max-width: 900px) { grid-template-columns: repeat(2, 1fr); }
    @media (max-width: 500px) { grid-template-columns: 1fr; }
  }

  &__row {
    display: flex;
    gap: 12px;

    @media (max-width: 600px) { flex-direction: column; }

    &--formats { gap: 14px; }
  }

  &__field { flex: 1; min-width: 0; }

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
  }
}

/* ------------------------------------------------------------ */
/* Tipo                                                         */
/* ------------------------------------------------------------ */
.exp-option {
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

  .q-icon { color: var(--sicam-muted); }

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

  &:hover { background: var(--sicam-surface-hover); }

  &--active {
    border-color: var(--sicam-primary-light);
    background: var(--sicam-primary-bg-alt);

    .q-icon { color: var(--sicam-primary); }
    .exp-option__label { color: var(--sicam-primary); }
  }
}

/* ------------------------------------------------------------ */
/* Shortcuts                                                    */
/* ------------------------------------------------------------ */
.exp-shortcut {
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
    border-color: var(--sicam-critical-bg);

    &:hover { background: var(--sicam-critical-bg); }
  }
}

/* ------------------------------------------------------------ */
/* Formato                                                      */
/* ------------------------------------------------------------ */
.exp-format {
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

  .q-icon { color: var(--sicam-muted); }

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

  &:hover { background: var(--sicam-surface-hover); }

  &--active {
    border-color: var(--sicam-primary-light);
    background: var(--sicam-primary-bg-alt);

    .q-icon { color: var(--sicam-primary); }
    .exp-format__label { color: var(--sicam-primary); }
  }
}

/* ------------------------------------------------------------ */
/* Checkbox                                                     */
/* ------------------------------------------------------------ */
.exp-checkbox {
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

/* ------------------------------------------------------------ */
/* Botão principal                                              */
/* ------------------------------------------------------------ */
.exp-btn {
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

    &:hover:not(:disabled) { background: var(--sicam-primary); }
    &:disabled { opacity: 0.6; cursor: wait; }
  }
}

/* ============================================================ */
/* Bloco                                                        */
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

.exp-empty {
  text-align: center;
  font-size: 13px;
  color: var(--sicam-muted);
  padding: 32px 20px;
  margin: 0;
}

/* ============================================================ */
/* Lista                                                        */
/* ============================================================ */
.exp-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.exp-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 20px;
  border-top: 1px solid var(--sicam-line-soft);
  transition: background 0.15s;

  &:first-child { border-top: 0; }
  &:hover { background: #fbfdfc; }

  &__icon {
    width: 42px;
    height: 42px;
    border-radius: 12px;
    display: grid;
    place-items: center;
    flex-shrink: 0;

    &--csv  { background: var(--sicam-success-bg);  color: var(--sicam-success-ink); }
    &--xlsx { background: var(--sicam-primary-bg);  color: var(--sicam-primary); }
    &--pdf  { background: var(--sicam-critical-bg); color: var(--sicam-critical-ink); }
    &--json { background: var(--sicam-warning-bg);  color: var(--sicam-warning-ink); }
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

    @media (max-width: 600px) { display: none; }
  }

  &__date { font-size: 12px; color: var(--sicam-muted); }
  &__size { font-size: 11px; color: var(--sicam-line-strong); }

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
      background: var(--sicam-primary-bg);
      color: var(--sicam-primary);
    }

    &--danger:hover {
      background: var(--sicam-critical-bg);
      color: var(--sicam-critical-ink);
    }
  }
}

/* ============================================================ */
/* Print                                                        */
/* ============================================================ */
@media print {
  .exp-form__footer,
  .exp-form__shortcuts,
  .exp-form__checkboxes,
  .exp-item__action,
  .ina-skeleton {
    display: none !important;
  }
}
</style>