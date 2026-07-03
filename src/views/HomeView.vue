<script setup lang="ts">
import HeaderComponent from '@/components/header/HeaderComponent.vue'
import LargeScreenSideBar from '@/components/largeScreenSidebar/LargeScreenSideBar.vue'
import BodyComponent from '@/components/body/BodyComponent.vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
</script>

<template>
  <div class="app">
    <LargeScreenSideBar v-if="auth.authenticated" />
    <div class="home-wrapper" :style="{ gridColumn: auth.authenticated ? 'span 1' : 'span 2' }">
      <HeaderComponent />
      <BodyComponent />
    </div>
  </div>
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
