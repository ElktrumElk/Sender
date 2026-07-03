<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()

function isActive(path: string): boolean {
  return route.path === path
}
</script>

<template>
  <footer>
    <nav>
      <RouterLink to="/invoice" class="nav-item" :class="{ active: isActive('/invoice') }">
        <svg class="nav-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
        <span class="nav-label">Invoice</span>
      </RouterLink>
      <RouterLink to="/chats" class="nav-item" :class="{ active: isActive('/chats') }">
        <svg class="nav-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <span class="nav-label">Chats</span>
      </RouterLink>
      <RouterLink to="/settings" class="nav-item" :class="{ active: isActive('/settings') }">
        <svg class="nav-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
        <span class="nav-label">Settings</span>
      </RouterLink>
    </nav>
  </footer>
</template>

<style lang="css" scoped>
footer {
  width: 100%;
  padding: 0.35rem 0.5rem;
  display: flex;
  align-items: center;
  position: fixed;
  bottom: 0;
  background: var(--bg-primary);
  border-top: 1px solid var(--border);
  z-index: 100;
  backdrop-filter: blur(12px);
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.04);
}

nav {
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  width: 100%;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  text-decoration: none;
  color: var(--text-light);
  padding: 0.35rem 0.75rem;
  border-radius: 0.75rem;
  transition: all 0.15s ease;
  position: relative;
}

.nav-item:hover {
  color: var(--text-secondary);
  background: var(--bg-tertiary);
}

.nav-item.active {
  color: var(--accent);
}

.nav-item.active .nav-icon {
  stroke: var(--accent);
  filter: drop-shadow(0 0 4px rgba(99, 102, 241, 0.3));
}

.nav-item.active::after {
  content: '';
  position: absolute;
  top: -0.35rem;
  width: 20px;
  height: 3px;
  border-radius: 3px;
  background: var(--accent);
}

.nav-label {
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.nav-icon {
  display: block;
}

@media (min-width: 800px) {
  footer {
    display: none;
  }
}
</style>
