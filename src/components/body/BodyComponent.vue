<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AuthForm from './AuthForm.vue'
import InvoiceTable from './InvoiceTable.vue'
import ComposeEmail from './ComposeEmail.vue'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const showCompose = ref(false)
const composeRecipient = ref('')

function openCompose(email?: string) {
  composeRecipient.value = email || ''
  showCompose.value = true
}

function closeCompose() {
  showCompose.value = false
  composeRecipient.value = ''
}

function goTo(path: string) {
  router.push(path)
}
</script>

<template>
  <main>
    <AuthForm v-if="!auth.authenticated" />
    <template v-else>
      <div class="tab-bar">
        <button class="tab" :class="{ active: route.path === '/' }" @click="goTo('/')">
          Invoices
        </button>
        <button class="tab" :class="{ active: route.path === '/chats' }" @click="goTo('/chats')">
          Chat
        </button>
      </div>
      <InvoiceTable v-if="route.path === '/'" @compose="openCompose" />
      <ComposeEmail v-if="showCompose" :recipientEmail="composeRecipient" @close="closeCompose" />
    </template>
  </main>
</template>

<style lang="css" scoped>
main {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.tab-bar {
  display: flex;
  gap: 0.25rem;
  background: var(--bg-tertiary);
  border-radius: 0.5rem;
  padding: 0.2rem;
  margin: 0 1rem 0.5rem;
  width: fit-content;
}
.tab {
  padding: 0.4rem 0.9rem;
  border: none;
  border-radius: 0.35rem;
  background: transparent;
  color: var(--text-muted);
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}
.tab.active {
  background: var(--bg-primary);
  color: var(--text-primary);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}
@media (max-width: 800px) {
  .tab-bar {
    display: none;
  }

  main {
    padding-block: 1rem;
  }
}
</style>
