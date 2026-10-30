<template>
  <article class="acc" :class="{ 'acc--open': aberto }">
    <button class="acc__head" @click="aberto = !aberto">
      <q-icon name="directions_car" size="18px" />
      <b>{{ store.titulo }}</b>
      <span class="acc__badge">{{ store.patrulhas.length }}</span>
      <q-icon name="expand_more" size="20px" class="acc__chevron" />
    </button>

    <div v-show="aberto" class="acc__body acc__body--list">
      <ul class="itens">
        <li v-for="pt in store.patrulhas" :key="pt.id" class="item">
          <div class="item__info">
            <b>{{ pt.id }} · {{ pt.turno }}</b>
            <small>{{ pt.posto }}</small>
          </div>
          <span class="item__estado" :class="`item__estado--${estadoClasse(pt.estado)}`">
            {{ pt.estado }}
          </span>
          <span class="item__meta">{{ pt.hora }}</span>
        </li>
      </ul>
    </div>
  </article>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useChefeSecaoStore } from '@/stores/perfil/secoes/secoes-chefe.store'

const store = useChefeSecaoStore()
const aberto = ref(false)

onMounted(() => store.carregar())

function estadoClasse(e: string): string {
  if (e === 'Em curso') return 'ativo'
  if (e === 'Concluída') return 'expirado'
  return 'pendente'
}
</script>