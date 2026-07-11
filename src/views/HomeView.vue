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
}
@media (max-width: 800px) {
  .app {
    display: flex;
    flex-direction: column;
  }
}
</style>
