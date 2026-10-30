<template>
  <article class="acc" :class="{ 'acc--open': aberto }">
    <button class="acc__head" @click="aberto = !aberto">
      <q-icon name="receipt_long" size="18px" />
      <b>{{ store.titulo }}</b>
      <span class="acc__badge">{{ store.multas.length }}</span>
      <q-icon name="expand_more" size="20px" class="acc__chevron" />
    </button>

    <div v-show="aberto" class="acc__body acc__body--list">
      <ul class="itens">
        <li v-for="mu in store.multas" :key="mu.id" class="item">
          <div class="item__info">
            <b>{{ mu.id }} · {{ mu.infracao }}</b>
            <small>Viatura {{ mu.viatura }}</small>
          </div>
          <span
            class="item__estado"
            :class="`item__estado--${estadoClasse(mu.estado)}`"
          >
            {{ mu.estado }}
          </span>
          <span class="item__meta">{{ mu.valor }}</span>
        </li>
      </ul>
    </div>
  </article>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useGestmulSecaoStore } from "@/stores/perfil/secoes/secoes-gestmul.store";

const store = useGestmulSecaoStore();
const aberto = ref(false);

onMounted(() => store.carregar());

function estadoClasse(e: string): string {
  if (e === "Paga") return "ativo";
  if (e === "Contestada") return "expirado";
  return "pendente";
}
</script>

<style scoped lang="scss">
.acc {
  background: #fff;
  border: 1px solid #e5ebe8;
  border-radius: 14px;
  overflow: hidden;
  transition:
    border-color 0.15s,
    box-shadow 0.15s;
  &:hover {
    border-color: #a7e3c8;
  }
  &--open {
    border-color: #10b981;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.12);
  }
  &__head {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 16px 20px;
    background: transparent;
    border: 0;
    cursor: pointer;
    font-family: inherit;
    font-size: 14px;
    font-weight: 700;
    color: #0f172a;
    text-align: left;
    &:hover {
      background: #f6f9f8;
    }
    .q-icon:first-child {
      color: #065f46;
    }
    b {
      flex: 1;
    }
  }
  &__chevron {
    color: #64748b;
    transition: transform 0.2s;
  }
  &--open &__chevron {
    transform: rotate(180deg);
  }
  &__badge {
    min-width: 22px;
    height: 22px;
    padding: 0 8px;
    display: inline-grid;
    place-items: center;
    border-radius: 99px;
    background: #ecfdf5;
    color: #065f46;
    font-size: 11px;
    font-weight: 700;
  }
  &__body {
    padding: 0;
    border-top: 1px solid #eef2f0;
  }
}
.itens {
  list-style: none;
  padding: 0;
  margin: 0;
}
.item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  border-bottom: 1px solid #eef2f0;
  &:last-child {
    border-bottom: 0;
  }
  &__info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    b {
      font-size: 13px;
      font-weight: 700;
      color: #0f172a;
    }
    small {
      font-size: 12px;
      color: #64748b;
    }
  }
  &__estado {
    display: inline-block;
    padding: 3px 10px;
    border-radius: 99px;
    font-size: 11px;
    font-weight: 700;
    white-space: nowrap;
    &--ativo {
      background: #ecfdf5;
      color: #065f46;
    }
    &--expirado {
      background: #fef2f2;
      color: #991b1b;
    }
    &--pendente {
      background: #fffbeb;
      color: #92400e;
    }
  }
  &__meta {
    font-size: 12px;
    color: #64748b;
    white-space: nowrap;
  }
}
</style>
