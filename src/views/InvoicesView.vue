<script setup lang="ts">
import { ref } from 'vue'
import InvoiceTable from '@/components/body/InvoiceTable.vue'
import ComposeEmail from '@/components/body/ComposeEmail.vue'

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
</script>

<template>
  <div class="page-view">
    <InvoiceTable @compose="openCompose" />
    <ComposeEmail v-if="showCompose" :recipientEmail="composeRecipient" @close="closeCompose" />
  </div>
</template>

<style lang="css" scoped>
.page-view {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>
