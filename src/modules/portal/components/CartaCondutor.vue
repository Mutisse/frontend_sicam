<template>
  <div class="cf">
    <button
      type="button"
      class="cf__scene"
      :aria-pressed="virada"
      :aria-label="virada ? 'Mostrar frente da carta' : 'Mostrar verso da carta'"
      @click="virada = !virada"
    >
      <div class="cf__card" :class="{ 'is-flipped': virada }">
        <!-- ================= FRENTE ================= -->
        <div class="cf__face cf__front">
          <div class="cf__guilloche" aria-hidden="true" />

          <header class="cf__head">
            <div class="cf__titles">
              <b>Carta de Condução</b>
              <span>Driving Licence</span>
            </div>
            <div class="cf__country">
              <span class="cf__sadc">SADC<br />MOC</span>
              <span class="cf__flag" aria-hidden="true">
                <i class="g" /><i class="w" /><i class="k" /><i class="w" /><i class="y" />
                <i class="r" />
              </span>
              <span class="cf__rep">República de<br />Moçambique</span>
            </div>
          </header>

          <div class="cf__body">
            <!-- ============ FOTO DE PERFIL ============ -->
            <div class="cf__photo">
              <!-- Se houver foto real do backend, mostra -->
              <img
                v-if="condutor?.fotoUrl"
                :src="condutor.fotoUrl"
                :alt="`Fotografia de ${condutor?.nome ?? 'titular'}`"
                loading="lazy"
              />

              <!-- Senão, silhueta limpa (estilo documento oficial) -->
              <svg
                v-else
                viewBox="0 0 200 240"
                preserveAspectRatio="xMidYMid slice"
                role="img"
                :aria-label="`Silhueta de ${condutor?.nome ?? 'titular'}`"
              >
                <defs>
                  <linearGradient id="photoBg2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stop-color="#e4efe8" />
                    <stop offset="1" stop-color="#b9d5c6" />
                  </linearGradient>
                  <linearGradient id="silhouette" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stop-color="#5f8a76" />
                    <stop offset="1" stop-color="#2f5c47" />
                  </linearGradient>
                </defs>

                <rect width="200" height="240" fill="url(#photoBg2)" />

                <!-- Silhueta cabeça + ombros -->
                <path
                  d="M40 240
                     C 40 190, 60 165, 80 158
                     C 70 148, 65 130, 65 112
                     C 65 80, 82 58, 100 58
                     C 118 58, 135 80, 135 112
                     C 135 130, 130 148, 120 158
                     C 140 165, 160 190, 160 240 Z"
                  fill="url(#silhouette)"
                />

                <!-- Iniciais em marca de água discreta -->
                <text
                  x="100"
                  y="128"
                  text-anchor="middle"
                  dominant-baseline="middle"
                  font-family="'Inter', system-ui, sans-serif"
                  font-size="44"
                  font-weight="700"
                  fill="rgba(255,255,255,0.35)"
                  letter-spacing="2"
                >
                  {{ iniciais || '—' }}
                </text>
              </svg>
            </div>

            <dl class="cf__fields">
              <div class="cf__f cf__f--wide">
                <dt>1. Nome / Name</dt>
                <dd class="cf__nome">{{ condutor?.nome ?? '—' }}</dd>
              </div>
              <div class="cf__f">
                <dt>3. Nascimento</dt>
                <dd>{{ condutor?.dataNascimento ?? '—' }}</dd>
              </div>
              <div class="cf__f">
                <dt>Sexo</dt>
                <dd>{{ sexoTexto }}</dd>
              </div>
              <div class="cf__f">
                <dt>4a. Emissão</dt>
                <dd>{{ condutor?.dataEmissao ?? '—' }}</dd>
              </div>
              <div class="cf__f">
                <dt>4b. Validade</dt>
                <dd>{{ condutor?.dataValidade ?? '—' }}</dd>
              </div>
              <div class="cf__f">
                <dt>5. Carta n.º</dt>
                <dd>{{ condutor?.numero ?? '—' }}</dd>
              </div>
              <div class="cf__f">
                <dt>NIF</dt>
                <dd>{{ condutor?.nif ?? '—' }}</dd>
              </div>
            </dl>
          </div>

          <footer class="cf__foot">
            <span>Cat. {{ condutor?.categoria || '—' }}</span>
            <span>{{ condutor?.nacionalidade ?? '' }}</span>
          </footer>
        </div>

        <!-- ================= VERSO ================= -->
        <div class="cf__face cf__back">
          <div class="cf__strip" aria-hidden="true" />

          <div class="cf__back-body">
            <div class="cf__back-title">
              <b>Categorias / Categories</b>
              <span>Código da carta: {{ condutor?.codigoCarta ?? '—' }}</span>
            </div>

            <ul class="cf__cats">
              <li
                v-for="c in TODAS"
                :key="c.cod"
                :class="{ 'is-on': ativas.includes(c.cod) }"
              >
                <b>{{ c.cod }}</b>
                <span>{{ c.txt }}</span>
              </li>
            </ul>

            <div class="cf__barcode" aria-hidden="true" />
          </div>
        </div>
      </div>
    </button>

    <p class="cf__dica">
      <q-icon name="flip" size="14px" />
      {{ virada ? 'Toque para ver a frente' : 'Toque para ver o verso' }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Condutor {
  nome?: string
  numero?: string
  categoria?: string
  dataValidade?: string | null
  nif?: string | null
  dataNascimento?: string | null
  sexo?: string | null
  nacionalidade?: string | null
  codigoCarta?: string | null
  dataEmissao?: string | null
  fotoUrl?: string | null   /* ← NOVO: opcional, vem do backend */
}

const props = defineProps<{
  condutor?: Condutor | null
  iniciais?: string
}>()

const virada = ref(false)

const TODAS = [
  { cod: 'A1', txt: 'Ciclomotores' },
  { cod: 'A', txt: 'Motociclos' },
  { cod: 'B', txt: 'Ligeiros' },
  { cod: 'BE', txt: 'Ligeiros + reboque' },
  { cod: 'C1', txt: 'Pesados até 7,5 t' },
  { cod: 'C', txt: 'Pesados de mercadorias' },
  { cod: 'CE', txt: 'Pesados + reboque' },
  { cod: 'D', txt: 'Passageiros' },
]

const ativas = computed(() =>
  (props.condutor?.categoria ?? '')
    .toUpperCase()
    .split(/[\s,;/+]+/)
    .filter(Boolean),
)

const sexoTexto = computed(() => {
  const s = props.condutor?.sexo
  if (s === 'M') return 'Masculino'
  if (s === 'F') return 'Feminino'
  return '—'
})
</script>

<style scoped lang="scss">
.cf {
  --cf-green: #065f46;
  --cf-ink: #0f172a;
  --cf-muted: #52615b;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  width: 100%;
}

/* botão que contém a cena 3D */
.cf__scene {
  all: unset;
  box-sizing: border-box;
  display: block;
  width: 100%;
  max-width: 520px;
  cursor: pointer;
  perspective: 1500px;
  container-type: inline-size;
  border-radius: 18px;

  &:focus-visible {
    outline: 3px solid #34d399;
    outline-offset: 4px;
  }
}

.cf__card {
  position: relative;
  width: 100%;
  aspect-ratio: 1.586;
  transform-style: preserve-3d;
  transition: transform 0.7s cubic-bezier(0.4, 0.1, 0.2, 1);

  &.is-flipped {
    transform: rotateY(180deg);
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
}

.cf__face {
  position: absolute;
  inset: 0;
  overflow: hidden;
  border-radius: 18px;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  box-shadow: 0 16px 40px rgba(6, 78, 59, 0.24), 0 0 0 1px rgba(6, 78, 59, 0.12);
  background: linear-gradient(135deg, #e9f4ee 0%, #d4e9de 55%, #e6efe0 100%);
  color: var(--cf-ink);
  padding: 4cqw 4.4cqw;
  display: flex;
  flex-direction: column;
  text-align: left;
  font-size: 2.35cqw;
}

.cf__back {
  transform: rotateY(180deg);
  padding: 0;
}

/* textura de segurança */
.cf__guilloche {
  position: absolute;
  inset: 0;
  opacity: 0.55;
  pointer-events: none;
  background:
    repeating-radial-gradient(circle at 78% 38%, transparent 0 7px, rgba(6, 95, 70, 0.07) 7px 8px),
    repeating-linear-gradient(115deg, transparent 0 9px, rgba(6, 95, 70, 0.05) 9px 10px);
}

/* ---------- cabeçalho ---------- */
.cf__head {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2cqw;
  margin-bottom: 2.2cqw;
}

.cf__titles {
  display: flex;
  flex-direction: column;
  line-height: 1.15;

  b {
    font-size: 1.55em;
    font-weight: 800;
    letter-spacing: 0.01em;
    color: var(--cf-green);
  }
  span {
    font-size: 1.15em;
    font-weight: 600;
    color: var(--cf-muted);
  }
}

.cf__country {
  display: flex;
  align-items: center;
  gap: 1.4cqw;
  text-align: right;
  line-height: 1.1;
  font-size: 0.85em;
  font-weight: 700;
  color: var(--cf-muted);
}

.cf__sadc {
  border: 1.5px solid var(--cf-green);
  color: var(--cf-green);
  border-radius: 6px;
  padding: 0.25em 0.5em;
  text-align: center;
  font-weight: 800;
}

.cf__flag {
  position: relative;
  width: 5.2cqw;
  height: 3.6cqw;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 2px;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.15);

  i {
    display: block;
    flex: 1;
  }
  .g { background: #007a3d; flex: 3; }
  .k { background: #111; flex: 3; }
  .y { background: #fcd116; flex: 3; }
  .w { background: #fff; flex: 0.6; }
  .r {
    position: absolute;
    inset: 0 auto 0 0;
    width: 55%;
    flex: none;
    background: #ce1126;
    clip-path: polygon(0 0, 100% 50%, 0 100%);
  }
}

/* ---------- corpo ---------- */
.cf__body {
  position: relative;
  display: flex;
  gap: 2.8cqw;
  flex: 1;
  min-height: 0;
}

/* ---------- FOTO DE PERFIL ---------- */
.cf__photo {
  flex: 0 0 26%;
  align-self: stretch;
  max-height: 28cqw;
  border-radius: 8px;
  overflow: hidden;
  background: #cfe3d8;
  border: 1px solid rgba(6, 95, 70, 0.25);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.4);

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center top;
    filter: saturate(1.05) contrast(1.02);
  }

  svg {
    display: block;
    width: 100%;
    height: 100%;
  }
}

.cf__fields {
  flex: 1;
  min-width: 0;
  margin: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.3cqw 2.8cqw;
  align-content: start;
}

.cf__f {
  min-width: 0;

  &--wide {
    grid-column: 1 / -1;
  }

  dt {
    font-size: 0.78em;
    font-weight: 600;
    color: var(--cf-muted);
    line-height: 1.2;
  }
  dd {
    margin: 0;
    font-size: 1.1em;
    font-weight: 700;
    line-height: 1.25;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-variant-numeric: tabular-nums;
  }
}

.cf__nome {
  font-size: 1.5em !important;
  font-weight: 800 !important;
}

.cf__foot {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.4cqw;
  font-size: 1em;
  font-weight: 700;
  color: var(--cf-green);
}

/* ---------- verso ---------- */
.cf__strip {
  height: 9cqw;
  background:
    repeating-linear-gradient(90deg, #111 0 2px, #fff 2px 3px, #111 3px 4px, #fff 4px 7px, #111 7px 8px, #fff 8px 9px);
  opacity: 0.88;
}

.cf__back-body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 2cqw;
  padding: 2.6cqw 4.4cqw 3.4cqw;
}

.cf__back-title {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 2cqw;

  b {
    font-size: 1.3em;
    color: var(--cf-green);
  }
  span {
    font-size: 0.95em;
    font-weight: 600;
    color: var(--cf-muted);
  }
}

.cf__cats {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.1cqw 3cqw;

  li {
    display: flex;
    align-items: center;
    gap: 1.6cqw;
    padding: 0.5em 0.7em;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.45);
    color: #7a8a83;
    font-size: 0.95em;
    line-height: 1.1;

    b {
      min-width: 2.2em;
      font-size: 1.15em;
      font-weight: 800;
    }

    &.is-on {
      background: var(--cf-green);
      color: #fff;
    }
  }
}

.cf__barcode {
  margin-top: auto;
  height: 7cqw;
  border-radius: 4px;
  background:
    repeating-linear-gradient(90deg, #111 0 1px, transparent 1px 3px, #111 3px 5px, transparent 5px 6px, #111 6px 9px, transparent 9px 10px);
  opacity: 0.8;
}

.cf__dica {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  font-size: 12px;
  color: #64748b;
}
</style>