<template>
  <div class="portal-carta">
    <!-- SKELETON -->
    <div v-if="!store.carregado" class="carta-skeleton">
      <div class="sk-topo" />
      <div class="sk-condutor" />
      <div class="sk-validade" />
      <div class="sk-dados" />
    </div>

    <template v-else>
      <!-- Topo — botões -->
      <div class="portal-carta__topo">
        <button type="button" class="portal-back" @click="voltar">
          <q-icon name="arrow_back" size="18px" />
          Nova consulta
        </button>

        <router-link
          to="/cidadao/multas"
          class="portal-back portal-back--primary"
        >
          <q-icon name="receipt_long" size="18px" />
          Ver as minhas multas
          <span v-if="qtdMultas" class="portal-back__badge">
            {{ qtdMultas }}
          </span>
        </router-link>
      </div>

      <!-- ESTADO VAZIO -->
      <div v-if="!store.temCarta" class="portal-carta__vazio">
        <div class="portal-carta__vazio-icon">
          <q-icon name="badge" size="32px" />
        </div>
        <b>Sem consulta activa</b>
        <p>Faça uma pesquisa no portal para consultar a sua carta.</p>
        <router-link to="/cidadao/portal" class="portal-carta__vazio-btn">
          Ir para o portal
        </router-link>
      </div>

      <!-- DADOS -->
      <template v-else>
        <!-- LAYOUT 2 COLUNAS: carta | info -->
        <div class="portal-carta__layout">
          <!-- COLUNA ESQUERDA: carta 3D -->
          <div class="portal-carta__cartao">
            <CartaCondutor
              :condutor="store.condutor"
              :iniciais="store.iniciais"
            />
          </div>

          <!-- COLUNA DIREITA: validade + dados -->
          <div class="portal-carta__info">
            <!-- VALIDADE -->
            <section
              class="portal-validade"
              :class="`portal-validade--${store.validadeClass}`"
            >
              <div class="portal-validade__icon">
                <q-icon :name="iconeValidade" size="20px" />
              </div>
              <div class="portal-validade__body">
                <div class="portal-validade__label">Validade</div>
                <div class="portal-validade__value">
                  {{ store.condutor?.dataValidade ?? '—' }}
                </div>
                <div class="portal-validade__hint">
                  {{ store.validadeTexto }}
                </div>
              </div>
            </section>

            <!-- DADOS -->
            <section class="portal-dados">
              <header class="portal-dados__head">
                <h2 class="portal-dados__title">Dados da carta</h2>
              </header>

              <div class="portal-dados__grid">
                <div class="portal-dados__field">
                  <span class="portal-dados__label">Nº da carta</span>
                  <b>{{ store.condutor?.numero }}</b>
                </div>

                <div class="portal-dados__field">
                  <span class="portal-dados__label">NIF</span>
                  <b>{{ store.condutor?.nif ?? '—' }}</b>
                </div>

                <div class="portal-dados__field">
                  <span class="portal-dados__label">Nascimento</span>
                  <b>{{ store.condutor?.dataNascimento ?? '—' }}</b>
                </div>

                <div class="portal-dados__field">
                  <span class="portal-dados__label">Sexo</span>
                  <b>{{ sexoTexto }}</b>
                </div>

                <div class="portal-dados__field">
                  <span class="portal-dados__label">Nacionalidade</span>
                  <b>{{ store.condutor?.nacionalidade ?? '—' }}</b>
                </div>

                <div class="portal-dados__field">
                  <span class="portal-dados__label">Código</span>
                  <b>{{ store.condutor?.codigoCarta ?? '—' }}</b>
                </div>

                <div class="portal-dados__field">
                  <span class="portal-dados__label">Emissão</span>
                  <b>{{ store.condutor?.dataEmissao ?? '—' }}</b>
                </div>

                <div class="portal-dados__field">
                  <span class="portal-dados__label">Categorias</span>
                  <b>{{ store.condutor?.categoria || '—' }}</b>
                </div>
              </div>
            </section>
          </div>
        </div>

        <p class="portal-nota">
          <q-icon name="lock" size="14px" />
          Consulta registada para auditoria. Dados visíveis apenas a
          entidades autorizadas.
        </p>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { usePortalCartaStore } from '@/stores/portal/carta.store'
import CartaCondutor from '@/modules/portal/components/CartaCondutor.vue'

const router = useRouter()
const store = usePortalCartaStore()

// ============================================================
// Quantidade de multas (lida diretamente do sessionStorage)
// ============================================================
const qtdMultas = ref(0)

function carregarQtdMultas() {
  try {
    const raw = sessionStorage.getItem('sicam.cidadao')
    if (!raw) {
      qtdMultas.value = 0
      return
    }
    const dados = JSON.parse(raw)
    qtdMultas.value = dados.multas?.length ?? 0
  } catch {
    qtdMultas.value = 0
  }
}

// ============================================================
// Ciclo de vida
// ============================================================
onMounted(() => {
  if (!store.carregado) {
    const ok = store.carregarDaSessao()
    if (!ok) {
      router.replace('/cidadao/portal')
      return
    }
  }
  carregarQtdMultas()
})

// ============================================================
// Getters
// ============================================================
const sexoTexto = computed(() => {
  const s = store.condutor?.sexo
  if (s === 'M') return 'Masculino'
  if (s === 'F') return 'Feminino'
  return '—'
})

const iconeValidade = computed(() => {
  if (store.validadeClass === 'regular') return 'check_circle'
  if (store.validadeClass === 'atencao') return 'hourglass_top'
  if (store.validadeClass === 'critico') return 'error'
  return 'info'
})

// ============================================================
// Acções
// ============================================================
function voltar() {
  router.push('/cidadao/portal')
}
</script>

<style scoped lang="scss">
.portal-carta {
  --k-ink: #0f172a;
  --k-muted: #64748b;
  --k-line: #e5ebe8;

  --k-crit: #dc2626;
  --k-crit-bg: #fef2f2;
  --k-crit-ink: #991b1b;
  --k-warn: #f59e0b;
  --k-warn-bg: #fffbeb;
  --k-warn-ink: #92400e;
  --k-ok: #059669;
  --k-ok-bg: #ecfdf5;
  --k-ok-ink: #065f46;

  max-width: 1080px;
  margin: 0 auto;
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
  border-radius: 12px;
}

.carta-skeleton {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 24px 0;
}

.sk-topo {
  @extend %sk-block;
  height: 40px;
  width: 280px;
  border-radius: 99px;
}
.sk-condutor {
  @extend %sk-block;
  height: 340px;
  border-radius: 20px;
}
.sk-validade {
  @extend %sk-block;
  height: 90px;
  border-radius: 16px;
}
.sk-dados {
  @extend %sk-block;
  height: 320px;
  border-radius: 20px;
}

/* ============================================================ */
/* TOPO                                                         */
/* ============================================================ */
.portal-carta__topo {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 18px;
  flex-wrap: wrap;
}

.portal-back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #fff;
  border: 1px solid var(--k-line);
  border-radius: 99px;
  color: #334155;
  font-size: 13px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  padding: 8px 14px 8px 10px;
  text-decoration: none;
  transition: background 0.15s, border-color 0.15s;
  position: relative;

  &:hover {
    background: #ecfdf5;
    border-color: #a7e3c8;
    color: #065f46;
  }

  &--primary {
    background: #065f46;
    color: #fff;
    border-color: #065f46;

    &:hover {
      background: #047857;
      border-color: #047857;
      color: #fff;
    }

    .portal-back__badge {
      background: #facc15;
      color: #3b2f00;
    }
  }

  &__badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 20px;
    height: 20px;
    padding: 0 6px;
    border-radius: 99px;
    font-size: 11px;
    font-weight: 800;
    margin-left: 2px;
  }
}

/* ============================================================ */
/* VAZIO                                                        */
/* ============================================================ */
.portal-carta__vazio {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 60px 20px;
  background: #fff;
  border: 1px dashed #cfdad5;
  border-radius: 16px;

  &-icon {
    width: 64px;
    height: 64px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    background: #ecfdf5;
    color: #065f46;
    margin-bottom: 14px;
  }

  b {
    font-size: 16px;
    color: var(--k-ink);
    margin-bottom: 4px;
  }
  p {
    margin: 0 0 18px;
    font-size: 14px;
    color: var(--k-muted);
  }

  &-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: #065f46;
    color: #fff;
    border: 0;
    border-radius: 10px;
    padding: 10px 18px;
    font-size: 14px;
    font-weight: 600;
    text-decoration: none;

    &:hover {
      background: #047857;
    }
  }
}

/* ============================================================ */
/* LAYOUT 2 COLUNAS: carta | info                               */
/* ============================================================ */
.portal-carta__layout {
  display: grid;
  grid-template-columns: 540px 1fr;
  gap: 24px;
  align-items: start;
  margin-bottom: 20px;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}

.portal-carta__cartao {
  display: flex;
  justify-content: flex-start;
  padding: 0;
  min-width: 0;
}

.portal-carta__info {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
}

/* ============================================================ */
/* VALIDADE                                                     */
/* ============================================================ */
.portal-validade {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 14px;
  border: 1px solid var(--k-line);
  background: #fff;

  &__icon {
    width: 40px;
    height: 40px;
    border-radius: 11px;
    display: grid;
    place-items: center;
    flex-shrink: 0;
    background: var(--k-ok-bg);
    color: var(--k-ok-ink);
  }

  &__body {
    flex: 1;
    min-width: 0;
  }

  &__label {
    font-size: 11px;
    color: var(--k-muted);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  &__value {
    font-size: 17px;
    font-weight: 800;
    color: var(--k-ink);
    line-height: 1.15;
    font-variant-numeric: tabular-nums;
    margin-top: 2px;
  }

  &__hint {
    font-size: 12px;
    color: var(--k-muted);
    margin-top: 1px;
  }

  &--regular {
    border-color: rgba(5, 150, 105, 0.2);

    .portal-validade__icon {
      background: var(--k-ok-bg);
      color: var(--k-ok-ink);
    }
    .portal-validade__hint {
      color: var(--k-ok-ink);
      font-weight: 600;
    }
  }

  &--atencao {
    border-color: rgba(245, 158, 11, 0.3);
    background: #fffdf6;

    .portal-validade__icon {
      background: var(--k-warn-bg);
      color: var(--k-warn-ink);
    }
    .portal-validade__hint {
      color: var(--k-warn-ink);
      font-weight: 600;
    }
  }

  &--critico {
    border-color: rgba(220, 38, 38, 0.3);
    background: #fff8f8;

    .portal-validade__icon {
      background: var(--k-crit-bg);
      color: var(--k-crit-ink);
    }
    .portal-validade__hint {
      color: var(--k-crit-ink);
      font-weight: 700;
    }
  }
}

/* ============================================================ */
/* DADOS                                                        */
/* ============================================================ */
.portal-dados {
  background: #fff;
  border: 1px solid var(--k-line);
  border-radius: 14px;
  padding: 16px;
  margin-bottom: 0;

  &__head {
    margin-bottom: 12px;
  }

  &__title {
    font-size: 14px;
    font-weight: 700;
    color: var(--k-ink);
    margin: 0;
  }

  &__grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px 18px;

    @media (max-width: 560px) {
      grid-template-columns: 1fr;
    }
  }

  &__field {
    display: flex;
    flex-direction: column;
    padding-bottom: 6px;
    border-bottom: 1px solid #f1f5f3;

    b {
      font-size: 13px;
      font-weight: 700;
      color: var(--k-ink);
      margin-top: 1px;
      letter-spacing: 0.02em;
    }
  }

  &__label {
    font-size: 10.5px;
    color: var(--k-muted);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
}

/* ============================================================ */
/* NOTA                                                         */
/* ============================================================ */
.portal-nota {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 12px;
  color: var(--k-muted);
  margin: 0;
  padding: 12px 14px;
  line-height: 1.5;
  background: #f6f9f8;
  border-radius: 12px;

  .q-icon {
    margin-top: 2px;
    color: #065f46;
    flex-shrink: 0;
  }
}
</style>