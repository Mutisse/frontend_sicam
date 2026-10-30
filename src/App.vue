<template>
  <router-view />

  <!-- Banner principal -->
  <transition name="pwa-slide">
    <div v-if="showInstallBanner" class="pwa-install-banner">
      <div class="pwa-install-banner__content">
        <q-icon name="install_desktop" size="40px" class="pwa-install-banner__icon" />
        <div class="pwa-install-banner__text">
          <div class="pwa-install-banner__title">Instale o SICAM no seu dispositivo</div>
          <div class="pwa-install-banner__subtitle">Acesso rápido, sem precisar do navegador</div>
        </div>
        <div class="pwa-install-banner__actions">
          <q-btn flat dense no-caps label="Agora não" class="pwa-install-banner__btn-cancel" @click="fecharBanner" />
          <q-btn unelevated no-caps label="Instalar" class="pwa-install-banner__btn-install" @click="instalarApp" />
        </div>
      </div>
    </div>
  </transition>

  <!-- Fallback manual (só aparece se o evento nativo não disparar) -->
  <transition name="pwa-slide">
    <div v-if="showManualInstructions" class="pwa-manual-banner">
      <div class="pwa-manual-banner__content">
        <q-icon name="info" size="32px" class="pwa-manual-banner__icon" />
        <div class="pwa-manual-banner__text">
          <div class="pwa-manual-banner__title">Instale o SICAM manualmente</div>
          <div class="pwa-manual-banner__subtitle">
            <template v-if="isIOS">
              Toque em <b>Compartilhar</b> e depois em <b>Adicionar à Tela de Início</b>.
            </template>
            <template v-else>
              Abra o menu do navegador (<b>⋮</b>) e toque em <b>Instalar aplicativo</b>.
            </template>
          </div>
        </div>
        <div class="pwa-manual-banner__actions">
          <q-btn unelevated no-caps label="Entendi" class="pwa-manual-banner__btn-ok" @click="fecharBanner" />
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

const showInstallBanner = ref(false)
const showManualInstructions = ref(false)
let deferredPrompt: any = null
let fallbackTimer: any = null

const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream

function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  )
}

function handleBeforeInstallPrompt(e: Event) {
  e.preventDefault()
  deferredPrompt = e
  if (fallbackTimer) {
    clearTimeout(fallbackTimer)
    fallbackTimer = null
  }
  showManualInstructions.value = false
  showInstallBanner.value = true
  console.log('✅ beforeinstallprompt disparou — banner real disponível')
}

function handleAppInstalled() {
  showInstallBanner.value = false
  showManualInstructions.value = false
  deferredPrompt = null
  if (fallbackTimer) clearTimeout(fallbackTimer)
  console.log('✅ SICAM instalado')
}

onMounted(() => {
  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  window.addEventListener('appinstalled', handleAppInstalled)

  if (isStandalone()) return

  if (isIOS) {
    fallbackTimer = setTimeout(() => {
      if (!deferredPrompt && !isStandalone()) {
        showManualInstructions.value = true
      }
    }, 3000)
    return
  }

  fallbackTimer = setTimeout(() => {
    if (!deferredPrompt && !isStandalone()) {
      showManualInstructions.value = true
      console.log('⚠️ beforeinstallprompt NÃO disparou após 10s — mostrando fallback')
    }
  }, 10000)
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  window.removeEventListener('appinstalled', handleAppInstalled)
  if (fallbackTimer) clearTimeout(fallbackTimer)
})

async function instalarApp() {
  if (!deferredPrompt) {
    showInstallBanner.value = false
    showManualInstructions.value = true
    return
  }
  deferredPrompt.prompt()
  const { outcome } = await deferredPrompt.userChoice
  if (outcome === 'accepted') console.log('✅ Utilizador aceitou')
  else console.log('❌ Utilizador recusou')
  deferredPrompt = null
  showInstallBanner.value = false
}

function fecharBanner() {
  showInstallBanner.value = false
  showManualInstructions.value = false
}
</script>

<style scoped>
/* ═══════════════════════════════════════════════════════════════
   BANNER PRINCIPAL (verde, com botões Instalar / Agora não)
   ═══════════════════════════════════════════════════════════════ */
.pwa-install-banner {
  position: fixed;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 32px);
  max-width: 640px;
  z-index: 9999;
  background: linear-gradient(135deg, #10b981 0%, #065f46 100%);
  color: #ffffff;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(16, 185, 129, 0.35),
              0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 16px 20px;
}

.pwa-install-banner__content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.pwa-install-banner__icon {
  flex-shrink: 0;
  opacity: 0.95;
}

.pwa-install-banner__text {
  flex: 1;
  min-width: 0;
}

.pwa-install-banner__title {
  font-size: 15px;
  font-weight: 700;
  line-height: 1.3;
  margin-bottom: 2px;
}

.pwa-install-banner__subtitle {
  font-size: 12px;
  opacity: 0.9;
  line-height: 1.3;
}

.pwa-install-banner__actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.pwa-install-banner__btn-cancel {
  color: #ffffff !important;
  opacity: 0.85;
  font-size: 13px;
  font-weight: 500;
}

.pwa-install-banner__btn-cancel:hover {
  opacity: 1;
}

.pwa-install-banner__btn-install {
  background: #ffffff !important;
  color: #065f46 !important;
  font-size: 13px;
  font-weight: 700;
  border-radius: 8px;
  padding: 6px 16px;
}

.pwa-install-banner__btn-install:hover {
  background: #ecfdf5 !important;
}

/* ═══════════════════════════════════════════════════════════════
   BANNER MANUAL (cinza, com instruções)
   ═══════════════════════════════════════════════════════════════ */
.pwa-manual-banner {
  position: fixed;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 32px);
  max-width: 640px;
  z-index: 9998;
  background: #1f2937;
  color: #ffffff;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
  padding: 16px 20px;
}

.pwa-manual-banner__content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.pwa-manual-banner__icon {
  flex-shrink: 0;
  color: #10b981;
}

.pwa-manual-banner__text {
  flex: 1;
  min-width: 0;
}

.pwa-manual-banner__title {
  font-size: 15px;
  font-weight: 700;
  line-height: 1.3;
  margin-bottom: 4px;
}

.pwa-manual-banner__subtitle {
  font-size: 12px;
  opacity: 0.85;
  line-height: 1.4;
}

.pwa-manual-banner__subtitle b {
  color: #10b981;
}

.pwa-manual-banner__actions {
  flex-shrink: 0;
}

.pwa-manual-banner__btn-ok {
  background: #10b981 !important;
  color: #ffffff !important;
  font-size: 13px;
  font-weight: 700;
  border-radius: 8px;
  padding: 6px 16px;
}

.pwa-manual-banner__btn-ok:hover {
  background: #059669 !important;
}

/* ═══════════════════════════════════════════════════════════════
   Animações
   ═══════════════════════════════════════════════════════════════ */
.pwa-slide-enter-active,
.pwa-slide-leave-active {
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.pwa-slide-enter-from {
  opacity: 0;
  transform: translate(-50%, 100px);
}

.pwa-slide-leave-to {
  opacity: 0;
  transform: translate(-50%, 100px);
}

/* ═══════════════════════════════════════════════════════════════
   Responsivo: mobile
   ═══════════════════════════════════════════════════════════════ */
@media (max-width: 600px) {
  .pwa-install-banner,
  .pwa-manual-banner {
    bottom: 12px;
    width: calc(100% - 24px);
    padding: 14px 16px;
  }

  .pwa-install-banner__content,
  .pwa-manual-banner__content {
    flex-wrap: wrap;
    gap: 12px;
  }

  .pwa-install-banner__text,
  .pwa-manual-banner__text {
    flex: 1 1 calc(100% - 56px);
  }

  .pwa-install-banner__actions,
  .pwa-manual-banner__actions {
    flex: 1 1 100%;
    justify-content: flex-end;
  }

  .pwa-install-banner__title,
  .pwa-manual-banner__title {
    font-size: 14px;
  }

  .pwa-install-banner__subtitle,
  .pwa-manual-banner__subtitle {
    font-size: 11px;
  }
}

/* ═══════════════════════════════════════════════════════════════
   Acessibilidade: respeita preferência de menos movimento
   ═══════════════════════════════════════════════════════════════ */
@media (prefers-reduced-motion: reduce) {
  .pwa-slide-enter-active,
  .pwa-slide-leave-active {
    transition: opacity 0.2s ease;
  }

  .pwa-slide-enter-from,
  .pwa-slide-leave-to {
    transform: translate(-50%, 0);
  }
}
</style>