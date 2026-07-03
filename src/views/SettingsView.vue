<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'
import { clearToken } from '@/services/api'
import { wsDisconnect } from '@/services/chat-store'

const auth = useAuthStore()
const app = useAppStore()

function lock(): void {
  clearToken()
  wsDisconnect()
  auth.setAuthenticated(false)
  auth.setUsername('')
  auth.setEmail('')
}
</script>

<template>
  <div class="page-view">
    <section class="settings-section">
      <div class="section-header">
        <strong class="page_name">Settings</strong>
      </div>

      <div class="settings-content">
        <div class="settings-card">
          <div class="settings-card-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            <span>Preferences</span>
          </div>
          <div class="settings-row">
            <span class="settings-label">Dark Mode</span>
            <label class="toggle">
              <input type="checkbox" :checked="app.darkMode" @change="app.toggleDarkMode()" />
              <span class="slider" />
            </label>
          </div>
        </div>

        <div class="settings-card">
          <div class="settings-card-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span>Account</span>
          </div>
          <div class="settings-row">
            <span class="settings-label">Username</span>
            <span class="settings-value">{{ auth.username }}</span>
          </div>
          <div class="settings-row">
            <span class="settings-label">Email</span>
            <span class="settings-value">{{ auth.userEmail }}</span>
          </div>
        </div>

        <div class="settings-card danger-card">
          <div class="settings-card-header danger">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span>Session</span>
          </div>
          <button class="lock-account-btn" @click="lock">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Lock Account
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<style lang="css" scoped>
.page-view {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.settings-section {
  background: var(--bg-secondary);
  border-radius: 1rem;
  margin: 1rem;
  box-shadow: var(--card-shadow);
  width: 100%;
  display: flex;
  flex-direction: column;
}
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 0 0.5rem;
}
.page_name {
  display: none;
}
.settings-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 0.5rem;
}
.settings-card {
  background: var(--bg-primary);
  border-radius: 0.75rem;
  border: 1px solid var(--table-border);
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.settings-card-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-light);
}
.settings-card-header.danger {
  color: var(--danger);
}
.settings-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.25rem 0;
}
.settings-label {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-secondary);
}
.settings-value {
  font-size: 0.85rem;
  color: var(--text-muted);
  font-family: 'SF Mono', 'Fira Code', monospace;
}
.toggle {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 22px;
  flex-shrink: 0;
}
.toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}
.slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background: var(--border);
  border-radius: 22px;
  transition: 0.2s;
}
.slider::before {
  content: '';
  position: absolute;
  height: 16px;
  width: 16px;
  left: 3px;
  bottom: 3px;
  background: white;
  border-radius: 50%;
  transition: 0.2s;
}
.toggle input:checked + .slider {
  background: var(--accent);
}
.toggle input:checked + .slider::before {
  transform: translateX(18px);
}
.lock-account-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1.25rem;
  border: 1px solid var(--danger);
  border-radius: 0.5rem;
  background: transparent;
  color: var(--danger);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  align-self: flex-start;
}
.lock-account-btn:hover {
  background: var(--danger-bg);
}

@media (max-width: 800px) {
  .settings-section {
    margin: 0.5rem;
    border-radius: 0.75rem;
  }
  .page_name {
    display: flex;
    color: var(--text-primary);
    font-size: 1.2rem;
  }
  .settings-content {
    padding: 0.25rem;
  }
  .settings-card {
    padding: 1rem;
  }
}
@media (max-width: 480px) {
  .settings-section {
    margin: 0.25rem;
    border-radius: 0.5rem;
  }
  .settings-card {
    padding: 0.85rem;
  }
}
</style>
