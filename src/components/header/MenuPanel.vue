<script setup lang="ts">
import { useAuthStore } from '@/stores/auth.ts'
import ListTile from '../tile/ListTile.vue'

const user_id = useAuthStore()
</script>

<template>
  <menu class="menu">
    <ListTile
      :style="{ background: 'aliceblue' }"
      title="ID"
      :value="user_id.userId?.toString()"
      sub-title="Connect your id to your external message app"
    />
  </menu>
</template>

<style lang="css" scoped>
.menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: var(--color-background);

  border: 1px solid var(--border);
  border-radius: 0.75rem;
  box-shadow: var(--card-shadow);
  padding: 0.6rem 0.8rem;
  min-width: 170px;
  z-index: 100;
  
}
</style>
