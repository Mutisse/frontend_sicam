<template>
  <q-page class="ab-page">
    <!-- CABEÇALHO -->
    <header class="page-head">
      <div>
        <h1 class="page-head__title">Mapa de calor</h1>
        <p class="page-head__sub">
          Distribuição geográfica das abordagens policiais
        </p>
      </div>

      <div class="page-head__actions">
        <button class="page-btn page-btn--outline" @click="exportarCSV">
          <q-icon name="file_download" size="18px" />
          Excel
        </button>
      </div>
    </header>

    <!-- SKELETON -->
    <div v-if="!prmStore.carregado" class="map-skeleton">
      <AppFbLoader variant="block" height="480px" />
    </div>

    <!-- MAPA -->
    <template v-else>
      <section class="map-section">
        <header class="map-section__head">
          <div class="map-section__title-wrap">
            <q-icon name="local_fire_department" size="20px" />
            <h2 class="map-section__title">Mapa de calor de abordagens</h2>
            <span class="map-section__count">
              {{ mapaStore.pontosMapa.length }} pontos
            </span>
          </div>

          <div class="map-layers">
            <button
              v-for="c in mapaStore.camadas"
              :key="c.key"
              class="map-layers__btn"
              :class="{ 'is-active': mapaStore.camadaAtiva === c.key }"
              :style="{ '--camada-cor': c.cor }"
              @click="mapaStore.setCamada(c.key)"
            >
              <q-icon :name="c.icon" size="14px" />
              {{ c.label }}
            </button>
          </div>
        </header>

        <div class="map-wrap">
          <div ref="mapEl" class="map-canvas" />

          <div class="map-legend">
            <span class="map-legend__title">Densidade</span>
            <div class="map-legend__bar">
              <span class="map-legend__step map-legend__step--low" />
              <span class="map-legend__step map-legend__step--mid" />
              <span class="map-legend__step map-legend__step--high" />
            </div>
            <div class="map-legend__labels">
              <span>Baixa</span>
              <span>Média</span>
              <span>Alta</span>
            </div>
          </div>

          <div class="map-stats">
            <div class="map-stat">
              <small>Zona mais ativa</small>
              <b>{{ mapaStore.zonaMaisAtiva }}</b>
            </div>
            <div class="map-stat">
              <small>Hora de pico</small>
              <b>{{ mapaStore.horaPico }}</b>
            </div>
            <div class="map-stat">
              <small>Detenções</small>
              <b class="text-critical">{{ mapaStore.totalComDetencao }}</b>
            </div>
          </div>
        </div>
      </section>
    </template>

    <!-- MODAL — DETALHES -->
    <q-dialog v-model="modalDetalhes">
      <div v-if="abordagemDetalhe" class="modal modal--details">
        <header class="modal__head">
          <div class="detail-head">
            <div
              class="placa__icon"
              :class="`placa__icon--${abordagemDetalhe.emHotlist ? 'critico' : 'neutral'}`"
            >
              <q-icon name="directions_car" size="20px" />
            </div>
            <div>
              <h2 class="modal__title">{{ abordagemDetalhe.matricula }}</h2>
              <small class="modal__sub">{{ abordagemDetalhe.dataHora }}</small>
            </div>
          </div>
          <button class="modal__close" @click="modalDetalhes = false">
            <q-icon name="close" size="20px" />
          </button>
        </header>

        <div class="modal__body">
          <div class="detail-row">
            <span>Resultado</span>
            <span
              class="badge"
              :class="`badge--${resultadoClasse(abordagemDetalhe.resultado)}`"
            >
              {{ abordagemDetalhe.resultado }}
            </span>
          </div>
          <div class="detail-row">
            <span>Agente</span>
            <b>{{ abordagemDetalhe.agente }}</b>
          </div>
          <div class="detail-row">
            <span>Posto</span>
            <b>{{ abordagemDetalhe.posto }}</b>
          </div>
          <div class="detail-row">
            <span>Local</span>
            <b>{{ abordagemDetalhe.local }}</b>
          </div>
          <div class="detail-row">
            <span>Coordenadas</span>
            <b>{{ abordagemDetalhe.lat.toFixed(4) }}, {{ abordagemDetalhe.lng.toFixed(4) }}</b>
          </div>
          <div v-if="abordagemDetalhe.observacoes" class="detail-row detail-row--block">
            <span>Observações</span>
            <p>{{ abordagemDetalhe.observacoes }}</p>
          </div>
          <div class="detail-row">
            <span>Hotlist</span>
            <b>{{ abordagemDetalhe.emHotlist ? "Sim" : "Não" }}</b>
          </div>
        </div>

        <footer class="modal__foot">
          <button class="page-btn page-btn--outline" @click="modalDetalhes = false">
            Fechar
          </button>

          <div class="modal__foot-actions">
            <button class="page-btn page-btn--outline" @click="focarAbordagem(abordagemDetalhe!)">
              <q-icon name="my_location" size="16px" />
              Ver no mapa
            </button>
            <button class="page-btn page-btn--primary" @click="imprimir(abordagemDetalhe!)">
              <q-icon name="print" size="16px" />
              Imprimir
            </button>
          </div>
        </footer>
      </div>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick } from "vue";
import { useQuasar } from "quasar";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import {
  useMapaCalorStore,
  type Abordagem,
  type Resultado,
} from "@/stores/prm/prm-mapaCalor.store";
import { usePrmAbordagensStore } from "@/stores/prm/prm-AbordagensStore";
import AppFbLoader from "@/modules/common/AppFbLoader.vue";

const $q = useQuasar();
const mapaStore = useMapaCalorStore();
const prmStore = usePrmAbordagensStore();

// ============================================================
// Estado
// ============================================================
const modalDetalhes = ref(false);
const abordagemDetalhe = ref<Abordagem | null>(null);

// Mapa
const mapEl = ref<HTMLElement | null>(null);
let map: L.Map | null = null;
let heatLayer: any = null;
let markersLayer: L.LayerGroup | null = null;
let mapInitialized = false;

const markersPorId = new Map<string, L.CircleMarker>();

// ============================================================
// Helpers
// ============================================================
function resultadoClasse(r: string): "regular" | "critico" | "atencao" | "info" {
  if (r === "Sem incidentes") return "regular";
  if (r === "Com detenção") return "critico";
  if (r === "Em curso") return "atencao";
  return "info";
}

// ============================================================
// MAPA — inicialização
// ============================================================
function initMap() {
  if (!mapEl.value) return;
  if (mapInitialized && map) return;

  mapEl.value.style.height = "100%";
  mapEl.value.style.width = "100%";

  map = L.map(mapEl.value, {
    center: [-25.9653, 32.5892],
    zoom: 11,
    zoomControl: true,
    attributionControl: true,
  });

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
    subdomains: "abc",
    maxZoom: 19,
  }).addTo(map);

  markersLayer = L.layerGroup().addTo(map);

  heatLayer = (L as any)
    .heatLayer([], {
      radius: 35,
      blur: 25,
      maxZoom: 17,
      minOpacity: 0.35,
      gradient: {
        0.0: "#3b82f6",
        0.4: "#10b981",
        0.65: "#f59e0b",
        0.85: "#f97316",
        1.0: "#dc2626",
      },
    })
    .addTo(map);

  mapInitialized = true;
  atualizarMapa();

  setTimeout(() => map?.invalidateSize(), 150);
}

// ============================================================
// MAPA — atualização
// ============================================================
function atualizarMapa() {
  if (!map || !heatLayer || !markersLayer) return;

  const pontos = mapaStore.pontosMapa;
  heatLayer.setLatLngs(pontos.map((a) => [a.lat, a.lng, 1]));

  markersLayer.clearLayers();
  markersPorId.clear();

  const corPorResultado: Record<Resultado, string> = {
    "Sem incidentes": "#10b981",
    "Com detenção": "#dc2626",
    "Em curso": "#f59e0b",
  };

  for (const a of pontos) {
    const cor = corPorResultado[a.resultado] ?? "#3b82f6";
    const marker = L.circleMarker([a.lat, a.lng], {
      radius: 7,
      color: "#fff",
      weight: 2,
      fillColor: cor,
      fillOpacity: 0.9,
    });

    marker.bindPopup(`
      <div style="font-family: sans-serif; min-width: 180px;">
        <b style="font-size: 13px; display: block; margin-bottom: 4px;">${a.matricula}</b>
        <div style="font-size: 12px; color: #64748b;">${a.dataHora} · ${a.agente}</div>
        <div style="font-size: 12px; color: #64748b; margin-top: 4px;">${a.local}</div>
        <div style="margin-top: 6px; font-size: 11px; font-weight: 700; color: ${cor};">
          ${a.resultado}
        </div>
      </div>
    `);

    marker.on("click", () => abrirDetalhes(a));
    marker.addTo(markersLayer!);

    markersPorId.set(a.id, marker);
  }

  if (pontos.length > 0) {
    const bounds = L.latLngBounds(
      pontos.map((a) => [a.lat, a.lng] as [number, number]),
    );
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
  }
}

// ============================================================
// MAPA — focar numa abordagem específica
// ============================================================
function focarAbordagem(a: Abordagem) {
  if (!map) return;

  modalDetalhes.value = false;

  if (!mapaStore.pontosMapa.find((p) => p.id === a.id)) {
    mapaStore.setCamada("todas");
    nextTick(() => {
      atualizarMapa();
      focarAbordagem(a);
    });
    return;
  }

  map.flyTo([a.lat, a.lng], 16, { duration: 0.8 });

  const marker = markersPorId.get(a.id);
  if (marker) {
    setTimeout(() => marker.openPopup(), 850);
  }
}

(window as any).__prmFocarAbordagem = focarAbordagem;
(window as any).__prmFocarMapa = focarAbordagem;

// ============================================================
// MAPA — lifecycle
// ============================================================
onMounted(async () => {
  // Garante que as abordagens estão carregadas (na store correta)
  if (!prmStore.carregado) {
    await prmStore.carregar();
  }

  await nextTick();
  initMap();

  const id = mapaStore.consumirFoco();
  if (id) {
    const a = mapaStore.abordagens.find((x) => x.id === id);
    if (a) {
      setTimeout(() => focarAbordagem(a), 400);
    }
  }
});

onUnmounted(() => {
  if (map) {
    map.remove();
    map = null;
    mapInitialized = false;
    heatLayer = null;
    markersLayer = null;
  }
  (window as any).__prmFocarAbordagem = undefined;
  (window as any).__prmFocarMapa = undefined;
});

watch(
  () => mapaStore.camadaAtiva,
  () => atualizarMapa(),
);

watch(
  () => mapaStore.pontosMapa,
  () => atualizarMapa(),
  { deep: true },
);

watch(modalDetalhes, (aberto) => {
  if (!aberto && map) {
    map.closePopup();
  }
});

// ============================================================
// Ações
// ============================================================
function abrirDetalhes(a: Abordagem) {
  abordagemDetalhe.value = a;
  modalDetalhes.value = true;
}

function imprimir(a: Abordagem) {
  const texto = `
========================================
      SICAM — PRM
      REGISTO DE ABORDAGEM
========================================

Data/Hora:      ${a.dataHora}
Matrícula:      ${a.matricula}
Agente:         ${a.agente}
Posto:          ${a.posto}
Local:          ${a.local}
Coordenadas:    ${a.lat.toFixed(4)}, ${a.lng.toFixed(4)}
Resultado:      ${a.resultado}
Hotlist:        ${a.emHotlist ? "Sim" : "Não"}
${a.observacoes ? `Observações:    ${a.observacoes}` : ""}

========================================
Documento gerado automaticamente.
========================================
`.trim();

  const w = window.open("", "_blank", "width=600,height=700");
  if (!w) return;
  w.document.write(
    `<pre style="font-family: monospace; font-size: 13px; padding: 20px;">${texto}</pre>`,
  );
  w.document.close();
  w.print();
}

function exportarCSV() {
  exportarLista(mapaStore.pontosMapa);
}

function exportarLista(lista: Abordagem[]) {
  const linhas: string[][] = [
    ["SICAM — PRM — Abordagens"],
    [`Gerado em: ${new Date().toLocaleString("pt-PT")}`],
    [],
    [
      "Data e hora",
      "Matrícula",
      "Agente",
      "Posto",
      "Local",
      "Resultado",
      "Hotlist",
      "Latitude",
      "Longitude",
    ],
    ...lista.map((a) => [
      a.dataHora,
      a.matricula,
      a.agente,
      a.posto,
      a.local,
      a.resultado,
      a.emHotlist ? "Sim" : "Não",
      String(a.lat),
      String(a.lng),
    ]),
  ];

  const csv = linhas
    .map((l) => l.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";"))
    .join("\n");

  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `prm-abordagens-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);

  $q.notify({
    type: "positive",
    message: `${lista.length} registos exportados`,
    position: "top",
  });
}
</script>

<style scoped lang="scss">
.ab-page {
  padding: 24px 20px 48px;
  max-width: 1180px;
  margin: 0 auto;
}

.map-skeleton {
  background: #fff;
  border-radius: 14px;
  padding: 20px;
}

.page-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}
.page-head__title {
  font-size: 24px;
  font-weight: 700;
  color: var(--sicam-ink);
  margin: 0 0 6px;
}
.page-head__sub {
  font-size: 14px;
  color: var(--sicam-muted);
  margin: 0;
}
.page-head__actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.page-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 0;
  border-radius: 10px;
  padding: 10px 18px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
}
.page-btn--primary {
  background: var(--sicam-primary-light);
  color: #fff;
}
.page-btn--outline {
  background: #fff;
  color: var(--sicam-ink);
  border: 1px solid var(--sicam-line);
}

.map-section {
  background: #fff;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  margin-bottom: 20px;
  position: relative;
  z-index: 1;
}
.map-section__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 18px;
  border-bottom: 1px solid var(--sicam-line-soft);
  flex-wrap: wrap;
}
.map-section__head .q-icon {
  color: var(--sicam-critical);
}
.map-section__title-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}
.map-section__title {
  font-size: 15px;
  font-weight: 700;
  color: var(--sicam-ink);
  margin: 0;
}
.map-section__count {
  font-size: 12px;
  color: var(--sicam-muted);
  background: var(--sicam-surface-alt);
  padding: 3px 8px;
  border-radius: 99px;
}
.map-layers {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.map-layers__btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  border-radius: 99px;
  background: #fff;
  border: 1px solid var(--sicam-line);
  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
  color: var(--sicam-muted);
  cursor: pointer;
}
.map-layers__btn.is-active {
  background: var(--camada-cor, var(--sicam-primary));
  color: #fff;
  border-color: var(--camada-cor, var(--sicam-primary));
}
.map-layers__btn.is-active .q-icon {
  color: #fff;
}
.map-wrap {
  position: relative;
  height: 480px;
  width: 100%;
  background: #eef2f0;
  overflow: hidden;
}
.map-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}
.map-legend {
  position: absolute;
  bottom: 16px;
  left: 16px;
  z-index: 500;
  background: rgba(255, 255, 255, 0.96);
  border-radius: 10px;
  padding: 10px 12px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
}
.map-legend__title {
  display: block;
  font-size: 10px;
  font-weight: 700;
  color: var(--sicam-muted);
  text-transform: uppercase;
  margin-bottom: 6px;
}
.map-legend__bar {
  display: flex;
  height: 8px;
  border-radius: 99px;
  overflow: hidden;
  width: 140px;
}
.map-legend__step--low {
  background: #3b82f6;
  flex: 1;
}
.map-legend__step--mid {
  background: #f59e0b;
  flex: 1;
}
.map-legend__step--high {
  background: #dc2626;
  flex: 1;
}
.map-legend__labels {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: var(--sicam-muted);
  margin-top: 4px;
  width: 140px;
}
.map-stats {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 500;
  background: rgba(255, 255, 255, 0.96);
  border-radius: 10px;
  padding: 12px 14px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
  min-width: 180px;
}
.map-stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 6px 0;
}
.map-stat + .map-stat {
  border-top: 1px solid var(--sicam-line-soft);
}
.map-stat small {
  font-size: 10px;
  color: var(--sicam-muted);
  text-transform: uppercase;
}
.map-stat b {
  font-size: 13px;
  color: var(--sicam-ink);
}
.text-critical {
  color: var(--sicam-critical);
}
</style>

<style lang="scss">
.leaflet-pane,
.leaflet-top,
.leaflet-bottom {
  z-index: 1 !important;
}
.leaflet-control {
  z-index: 2 !important;
}
.leaflet-container {
  background: #eef2f0 !important;
  font-family: inherit;
}
.leaflet-popup-content-wrapper {
  border-radius: 10px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12);
}
.leaflet-popup-content {
  margin: 12px 14px;
}
</style>