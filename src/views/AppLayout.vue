<script setup lang="ts">
import { useRoute } from 'vue-router'
import HeaderComponent from '@/components/header/HeaderComponent.vue'
import LargeScreenSideBar from '@/components/largeScreenSidebar/LargeScreenSideBar.vue'
import MobileFooter from '@/components/mobileFooter/MobileFooter.vue'
import { chatStore } from '@/services/chat-store'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const route = useRoute()

function showFooter(): boolean {
  if (!auth.authenticated) return false
  if (route.path.startsWith('/chat') && chatStore.connected) return false
  if (route.path === '/chats' && chatStore.connected) return false
  return true
}
</script>

<template>
  <div class="app">
    <LargeScreenSideBar v-if="auth.authenticated" />
    <div class="home-wrapper" :style="{ gridColumn: auth.authenticated ? 'span 1' : 'span 2' }">
      <HeaderComponent />
      <RouterView />

      <MobileFooter v-if="showFooter()" />
    </div>
  </div>
</template>

<style lang="css" scoped>
.app {
  display: grid;
  grid-template-columns: 80px 2fr;
  grid-auto-rows: 1fr;
  height: 100%;
  width: 100%;
  flex: 0 2 auto;
}

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
