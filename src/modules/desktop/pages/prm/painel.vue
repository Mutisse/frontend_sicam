<template>
  <DashboardComum />
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
const DashboardComum = defineAsyncComponent(
  () => import('@/modules/desktop/pages/dashboard/dashboard.vue'),
)
</script>