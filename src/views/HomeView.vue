<script setup lang="ts">
import BodyComponent from '@/components/body/BodyComponent.vue'
</script>

<template>
  <BodyComponent />
</template>

<style lang="css" scoped>
.home-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 0.5rem;
}

@media (max-width: 800px) {
  .app {
    display: flex;
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .home-wrapper {
    padding: 0.25rem;
  }
}
</style>
