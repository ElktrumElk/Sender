<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()
function goTo(path: string) {
  router.push(path)
}
</script>

<template>
  <div class="side_gutter">
    <div class="logo-wrapper">
      <img
        src="https://avatars.githubusercontent.com/u/131537619?v=4"
        width="50"
        height="50"
        class="profile-img"
      />
    </div>
    <menu class="list-container">
      <li class="list active">
        <button class="btn" :class="{ active: route.path === '/' }" @click="() => goTo('/')">
          <img
            class="home_ic"
            src="https://img.icons8.com/?size=100&id=73&format=png&color=7a7a7a"
            width="22"
            height="22"
          />
          <span>Invoice</span>
        </button>
      </li>

      <li class="list">
        <button
          class="btn"
          :class="{ active: route.path === '/chats' }"
          @click="() => goTo('/chats')"
        >
          <img
            class="home_ic"
            src="https://img.icons8.com/?size=100&id=3726&format=png&color=FFFFFF"
            width="22"
            height="22"
          />
          <span>Chat</span>
        </button>
      </li>
    </menu>
  </div>
</template>

<style lang="css" scoped>
.side_gutter {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
  padding: 1.25rem 0.75rem;
  gap: 2.5rem;
  background: var(--color-heading);
  position: relative;
  border-right: 0.5px solid rgba(128, 128, 128, 0.428);
}

@media (max-width: 800px) {
  .side_gutter {
    display: none;
  }
}
.logo-wrapper {
  position: relative;
}

.logo-wrapper::after {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #a855f7);
  opacity: 0.2;
  z-index: -1;
}

.profile-img {
  border-radius: 4rem;
  display: block;
  position: relative;
  z-index: 1;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.2);
}

.list-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 0;
  width: 100%;
}

.list {
  list-style: none;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.15s ease;
}

.btn {
  background: none;
  border: none;
  color: var(--color-text);
}
.list:hover {
  transform: scale(1.05);
}

.list:hover .tooltip {
  opacity: 1;
  visibility: visible;
}

.tooltip {
  position: absolute;
  left: calc(100% + 10px);
  top: 50%;
  transform: translateY(-50%);
  background: #3668af;

  font-size: 0.7rem;
  padding: 0.3rem 0.6rem;
  border-radius: 0.35rem;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: all 0.15s ease;
  pointer-events: none;
  font-weight: 500;
  letter-spacing: 0.02em;
}

.tooltip::before {
  content: '';
  position: absolute;
  right: 100%;
  top: 50%;
  transform: translateY(-50%);
  border: 5px solid transparent;
  border-right-color: #1f2937;
}

.home_ic {
  width: 15px;
  height: 15px;
  padding: 10px;
  box-sizing: content-box;
  border-radius: 0.85rem;
  transition: all 0.2s ease;
}

.list.active .home_ic {
  box-shadow:
    0 2px 6px rgba(99, 102, 241, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(99, 102, 241, 0.3);
}

.nav-icon {
  width: 42px;
  height: 42px;
  padding: 10px;
  border-radius: 0.85rem;
  background: var(--bg-tertiary, #f9fafb);
  border: 1px solid var(--border, #e5e7eb);
  transition: all 0.2s ease;
  opacity: 0.5;
}

.nav-icon:hover {
  opacity: 0.8;
  background: var(--bg-tertiary, #f3f4f6);
  border-color: var(--input-border, #d1d5db);
}
</style>
