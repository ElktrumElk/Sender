<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'
import MenuPanel from './MenuPanel.vue'

const auth = useAuthStore()
const app = useAppStore()

const showSettings = ref(false)

function toggleSettings() {
  showSettings.value = !showSettings.value
}
</script>

<template>
  <header class="header" v-if="auth.authenticated">
    <input
      v-model="app.searchQuery"
      type="search"
      class="search-input"
      placeholder="Search by name, email, or message..."
    />

    <div v-if="auth.authenticated" class="profile-div">
      <div class="settings-wrapper">
        <button class="settings-btn" title="Settings" @click="toggleSettings">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="3" />
            <path
              d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
            />
          </svg>
        </button>

        <MenuPanel v-if="showSettings" />
      </div>
      <img
        class="bell"
        src="https://img.icons8.com/?size=100&id=11642&format=png&color=36454f"
        width="20"
        height="20"
      />

      <img
        src="https://avatars.githubusercontent.com/u/131537619?v=4"
        width="30"
        height="30"
        class="profile-img"
      />

      <div class="inner">
        <strong>{{ auth.username }}</strong>
        <span>{{ auth.userEmail }}</span>
      </div>
    </div>
  </header>
</template>

<style lang="css" scoped>
.header {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
  height: fit-content;
  margin-top: 10px;
  padding: 0.5rem;
  justify-content: space-between;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--header-border);
}
.search-input {
  display: flex;
  height: 40px;
  width: 40%;
  padding: 1rem;
  border-radius: 1rem;
  border: 1px solid var(--input-border);
  background: var(--input-bg);
  color: var(--text-primary);
  outline: none;
  transition: border-color 0.15s ease;
}
.search-input::placeholder {
  color: var(--text-light);
}
.search-input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}
.profile-img {
  border-radius: 4rem;
}
.profile-div {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}
.profile-div .inner {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  color: var(--text-primary);
}
.bell {
  margin-inline-end: 1rem;
}
.inner strong {
  color: var(--text-primary);
}
.inner span {
  color: var(--text-muted);
}

.settings-wrapper {
  position: relative;
  margin-inline-end: 0.5rem;
}

.settings-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  background: var(--bg-primary);
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.15s ease;
}

.settings-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

@media (max-width: 800px) {
  .header {
    flex-wrap: wrap;
    gap: 0.5rem;
    padding-bottom: 0.75rem;
    display: none;
  }
  .search-input {
    width: 100%;
    order: 1;
  }
  .profile-div .inner {
    display: none;
  }
  .bell {
    display: none;
  }
}

@media (max-width: 480px) {
  .search-input {
    font-size: 0.85rem;
    padding: 0.75rem;
  }
}

.settings-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.settings-label {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
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
</style>
