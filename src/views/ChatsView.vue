<script setup lang="ts">
import ChatPanel from '@/components/body/ChatPanel.vue'
</script>

<template>
  <div class="page-view">
    <ChatPanel />
  </div>
</template>

<style lang="css" scoped>
.page-view {
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
}
</style>
