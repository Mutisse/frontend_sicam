<template>
  <div class="agente-autos">
    <!-- CABEÇALHO -->
    <header class="agente-autos__head">
      <button class="agente-autos__back" @click="voltar">
        <q-icon name="arrow_back" size="22px" />
      </button>
      <div>
        <h1 class="agente-h1">Auto de Notícia</h1>
        <p class="agente-sub">Preencha e o texto é gerado automaticamente.</p>
      </div>
    </header>

    <!-- SKELETON -->
    <template v-if="store.aCarregar && !store.infracoes.length">
      <div class="agente-card sk-card">
        <div class="sk-line sk-line--sm" />
        <div class="sk-line sk-line--lg" />
        <div class="sk-line sk-line--sm" />
        <div class="sk-line sk-line--lg" />
      </div>
    </template>

    <template v-else>
      <!-- ERRO -->
      <div v-if="store.erro" class="agente-erro">
        <q-icon name="error" size="18px" />
        {{ store.erro }}
      </div>

      <!-- FORMULÁRIO -->
      <div class="agente-card">
        <label class="agente-label">
          Matrícula <span class="agente-required">*</span>
          <input
            v-model="store.matricula"
            class="agente-input agente-input--placa"
            placeholder="AGL-482-MC"
            maxlength="12"
            @input="onMatriculaInput"
          />
        </label>

        <label class="agente-label">
          Infracção <span class="agente-required">*</span>
          <select v-model="store.infracaoCodigo" class="agente-input">
            <option
              v-for="i in store.infracoes"
              :key="i.codigo"
              :value="i.codigo"
            >
              {{ i.label }} — {{ store.formatarMT(i.valor) }}
            </option>
          </select>
        </label>

        <label class="agente-label">
          Local da ocorrência
          <input
            v-model.trim="store.local"
            class="agente-input"
            placeholder="Ex.: Av. 25 de Setembro, Maputo"
          />
        </label>

        <label class="agente-label">
          Observações <span class="agente-optional">(opcional)</span>
          <textarea
            v-model.trim="store.observacoes"
            rows="3"
            class="agente-input"
            placeholder="Detalhes adicionais sobre a ocorrência…"
          />
        </label>

        <button class="agente-btn" :disabled="!store.podeGerar" @click="gerar">
          <q-icon
            :name="store.aGerar ? 'hourglass_top' : 'description'"
            size="18px"
            class="q-mr-xs"
          />
          {{ store.aGerar ? "A gerar…" : "Gerar auto" }}
        </button>
      </div>

      <!-- PRÉ-VISUALIZAÇÃO -->
      <div v-if="store.preview" class="agente-card">
        <div class="agente-card__head">
          <h3>Pré-visualização</h3>
          <span class="agente-preview__codigo">{{ store.codigoPreview }}</span>
        </div>

        <p class="agente-preview">{{ store.textoPreview }}</p>

        <div class="agente-preview__actions">
          <button class="agente-btn agente-btn--outline" @click="copiar">
            <q-icon name="content_copy" size="18px" class="q-mr-xs" />
            Copiar
          </button>
          <button class="agente-btn" @click="imprimirUltimo">
            <q-icon name="print" size="18px" class="q-mr-xs" />
            Imprimir
          </button>
        </div>
      </div>

      <!-- AUTOS DE HOJE -->
      <div class="agente-card">
        <div class="agente-card__head">
          <h3>Autos de hoje</h3>
          <span class="agente-count">{{ store.autosHoje.length }}</span>
        </div>

        <p v-if="store.autosHoje.length === 0" class="agente-empty">
          Ainda não foram emitidos autos hoje.
        </p>

        <div v-for="auto in store.autosHoje" :key="auto.id" class="agente-row">
          <div>
            <b>{{ auto.codigo }}</b>
            <small>{{ auto.matricula }} · {{ auto.hora }}</small>
          </div>
          <AppBadge
            :variant="auto.estado === 'Emitido' ? 'atencao' : 'regular'"
            :label="auto.estado"
          />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";
import { useAuthStore } from "@/stores/auth";
import { useAgenteAutosStore } from "@/stores/agente/agente-autos.store";
import AppBadge from "@/modules/common/AppBadge.vue";

const router = useRouter();
const $q = useQuasar();
const auth = useAuthStore();
const store = useAgenteAutosStore();

// ------------------------------------------------------------
// Ciclo de vida
// ------------------------------------------------------------
onMounted(async () => {
  store.setAgente(auth.utilizador?.nome ?? "Agente");
  await store.carregar();
});

// ------------------------------------------------------------
// Matrícula
// ------------------------------------------------------------
function onMatriculaInput(e: Event) {
  const el = e.target as HTMLInputElement;
  const v = store.onMatriculaInput(el.value);
  store.matricula = v;
  el.value = v;
}

// ------------------------------------------------------------
// Acções
// ------------------------------------------------------------
async function gerar() {
  const res = await store.gerar();

  if (!res.ok) {
    $q.notify({
      type: "warning",
      message: store.erro ?? "Preencha a matrícula e a infracção.",
      position: "top",
    });
    return;
  }

  $q.notify({
    type: "positive",
    message: `Auto ${res.codigo} gerado`,
    position: "top",
  });
}

async function copiar() {
  try {
    await navigator.clipboard.writeText(store.gerarTextoParaCopiar());
    $q.notify({ type: "positive", message: "Texto copiado", position: "top" });
  } catch {
    $q.notify({
      type: "negative",
      message: "Não foi possível copiar",
      position: "top",
    });
  }
}

async function imprimirUltimo() {
  const ultimo = store.autosHoje[0];
  if (!ultimo) return;

  await store.imprimir(ultimo.id);

  $q.notify({
    type: "positive",
    message: "Auto marcado como impresso",
    position: "top",
  });
}

function voltar() {
  router.back();
}
</script>

<style scoped lang="scss">
.agente-autos {
  padding: 0 0 24px;
}

.agente-autos__head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}

.agente-autos__back {
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

.agente-h1 {
  font-size: 20px;
  font-weight: 700;
  color: var(--sicam-ink);
  margin: 0;
}

.agente-sub {
  color: var(--sicam-muted);
  font-size: 13px;
  margin: 2px 0 0;
}

.agente-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.05);
  padding: 14px;
  margin-bottom: 12px;

  h3 {
    font-size: 14px;
    font-weight: 600;
    color: var(--sicam-ink);
    margin: 0;
  }
}

.agente-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.agente-count {
  background: var(--sicam-primary-light);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  border-radius: 99px;
  min-width: 22px;
  height: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 8px;
}

.agente-label {
  display: block;
  font-size: 11px;
  color: var(--sicam-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 12px;
}

.agente-required {
  color: var(--sicam-critical);
}
.agente-optional {
  color: var(--sicam-muted);
  font-weight: 400;
  text-transform: none;
  letter-spacing: 0;
}

.agente-input {
  display: block;
  width: 100%;
  margin-top: 6px;
  padding: 11px 10px;
  border: 0;
  border-bottom: 1px solid var(--sicam-line-strong);
  background: var(--sicam-surface-alt);
  border-radius: 6px 6px 0 0;
  color: var(--sicam-ink);
  font-size: 15px;
  font-family: inherit;
  resize: vertical;

  &:focus {
    outline: 0;
    border-bottom-color: var(--sicam-primary-light);
  }

  &--placa {
    font-size: 20px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
}

.agente-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  background: var(--sicam-primary-light);
  color: #fff;
  border: 0;
  border-radius: 10px;
  padding: 13px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  margin-bottom: 10px;
  text-decoration: none;
  text-align: center;
  font-family: inherit;

  &:active:not(:disabled) {
    background: var(--sicam-primary);
  }
  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  &--outline {
    background: #fff;
    color: var(--sicam-ink);
    border: 1px solid var(--sicam-line);
  }
}

.agente-preview {
  font-size: 13px;
  line-height: 1.5;
  color: var(--sicam-ink);
  margin: 0 0 12px;
  white-space: pre-line;
}

.agente-preview__codigo {
  font-size: 11px;
  font-weight: 700;
  color: var(--sicam-primary);
  background: var(--sicam-primary-bg, #ecfdf5);
  padding: 3px 8px;
  border-radius: 99px;
  letter-spacing: 0.04em;
}

.agente-preview__actions {
  display: grid;
  grid-template-columns: 1fr 1.4fr;
  gap: 10px;
  .agente-btn {
    margin-bottom: 0;
  }
}

.agente-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 11px 0;
  border-bottom: 1px solid var(--sicam-line-soft);

  &:last-child {
    border-bottom: 0;
  }

  small {
    display: block;
    color: var(--sicam-muted);
    font-size: 12px;
    font-weight: 400;
  }

  b {
    color: var(--sicam-ink);
    font-size: 14px;
  }
}

.agente-empty {
  font-size: 13px;
  color: var(--sicam-muted);
  text-align: center;
  margin: 12px 0 4px;
}

.agente-erro {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  border-radius: 10px;
  background: var(--sicam-critical-bg, #fef2f2);
  color: var(--sicam-critical-ink, #991b1b);
  font-size: 13px;
  margin-bottom: 12px;
}

/* Skeleton */
@keyframes sk-shimmer {
  0% {
    background-position: -400px 0;
  }
  100% {
    background-position: 400px 0;
  }
}

.sk-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sk-line {
  height: 14px;
  border-radius: 6px;
  background: linear-gradient(
    90deg,
    rgba(0, 0, 0, 0.05) 0%,
    rgba(0, 0, 0, 0.08) 50%,
    rgba(0, 0, 0, 0.05) 100%
  );
  background-size: 800px 100%;
  animation: sk-shimmer 1.4s infinite linear;

  &--sm {
    width: 40%;
  }
  &--lg {
    width: 100%;
    height: 40px;
  }
}
</style>
