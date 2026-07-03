<script setup lang="ts">
import { ref } from 'vue'
import InvoiceTable from '@/components/body/InvoiceTable.vue'
import ComposeEmail from '@/components/body/ComposeEmail.vue'

const showCompose = ref(false)

function openCompose() {
  showCompose.value = true
}

function closeCompose() {
  showCompose.value = false
}
</script>

<template>
  <div class="page-view">
    <InvoiceTable @compose="openCompose" />
    <ComposeEmail v-if="showCompose" @close="closeCompose" />
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
