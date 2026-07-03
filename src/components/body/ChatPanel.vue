<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { clearToken } from '@/services/api'
import { wsDisconnect } from '@/services/chat-store'
import {
  chatStore,
  wsConnectWithToken,
  loadConversations,
} from '@/services/chat-store'
import { api } from '@/services/api'
import { searchUser } from '@/services/messages-store'

const router = useRouter()
const auth = useAuthStore()

const showNewChat = ref(false)
const newChatPeer = ref('')

function connectChat(): void {
  if (api.token) {
    wsConnectWithToken(api.token)
  }
}

function doDisconnectChat(): void {
  wsDisconnect()
}

function openChat(peer: string): void {
  router.push(`/chat/${encodeURIComponent(peer)}`)
}

async function startNewConversation() {
  const data = await searchUser(newChatPeer.value)
  if (data) {
    const peer = newChatPeer.value.trim()
    if (!peer) return
    newChatPeer.value = ''
    showNewChat.value = false
    if (!chatStore.peers.includes(peer)) {
      chatStore.peers.unshift(peer)
    }
    router.push(`/chat/${encodeURIComponent(peer)}`)
  }
}

function lock(): void {
  clearToken()
  wsDisconnect()
  auth.setAuthenticated(false)
  auth.setUsername('')
  auth.setEmail('')
}

watch(
  () => chatStore.connected,
  (connected) => {
    if (connected && chatStore.username) {
      loadConversations().catch(() => {})
    }
  },
)
</script>

<template>
  <section class="chat-section">

    <div class="section-header">
      <strong class="page_name">Chats</strong>
      <div class="header-actions">
        <button
          v-if="!chatStore.connected"
          class="connect-btn"
          title="Connect chat"
          @click="connectChat"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          Connect
        </button>

        <span v-else class="connected-badge">Connected</span>

        <button class="lock-btn" title="Lock" @click="lock">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </button>
      </div>
    </div>

    <div v-if="!chatStore.connected" class="chat-join">
      <div class="join-card">
        <div class="join-icon">
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <h3>Live Chat</h3>
        <p v-if="chatStore.wsError" class="ws-error">{{ chatStore.wsError }}</p>
        <p v-else class="join-sub">Click Connect to join the chat</p>
        <button class="join-btn" @click="connectChat">Connect</button>
      </div>
    </div>

    <!-- Mobile: peer list view -->
    <div v-else class="mobile-peer-list">
      <div class="peer-list-header">
        <div class="peer-list-user">
          <span class="peer-avatar">{{ chatStore.username.charAt(0).toUpperCase() }}</span>
          <strong>{{ chatStore.username }}</strong>
          <span class="status-dot" />
        </div>
        <div class="peer-list-actions">
          <button class="icon-btn" title="New conversation" @click="showNewChat = !showNewChat">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
          <button class="icon-btn danger" title="Disconnect" @click="doDisconnectChat">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      <div v-if="showNewChat" class="new-chat-box">
        <input
          v-model="newChatPeer"
          type="text"
          class="new-chat-input"
          placeholder="Enter username..."
          @keyup.enter="startNewConversation"
          autofocus
        />
        <button class="new-chat-go" @click="startNewConversation">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </button>
      </div>

      <div class="peer-list-scroll">
        <div
          v-for="peer in chatStore.peers"
          :key="peer"
          class="peer-card"
          @click="openChat(peer)"
        >
          <span class="peer-avatar">{{ peer.charAt(0).toUpperCase() }}</span>
          <div class="peer-info">
            <strong class="peer-name">{{ peer }}</strong>
            <span class="peer-status">Online</span>
          </div>
          <svg
            class="peer-chevron"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>
        <div v-if="chatStore.peers.length === 0" class="empty-peers">
          <div class="empty-icon">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <p>No conversations yet</p>
          <p class="empty-hint">Tap <strong>+</strong> to start a new one</p>
        </div>
      </div>
    </div>

    <!-- Mobile: chat messages view -->

  </section>
</template>

<style lang="css" scoped>
.chat-section {
  background: var(--bg-secondary);
  border-radius: 1rem;
  margin: 1rem;
  box-shadow: var(--card-shadow);
  width: 100%;
  display: flex;
  flex-direction: column;
  height: 100%;
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
.header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.connect-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem;
  border: 1px solid var(--accent);
  border-radius: 0.5rem;
  background: var(--accent);
  color: white;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}
.connect-btn:hover {
  background: var(--accent-hover);
  border-color: var(--accent-hover);
}
.connected-badge {
  font-size: 0.75rem;
  font-weight: 600;
  color: #065f46;
  background: #d1fae5;
  padding: 0.3rem 0.7rem;
  border-radius: 0.5rem;
}
.lock-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid var(--input-border);
  border-radius: 0.5rem;
  background: var(--bg-primary);
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.15s ease;
}
.lock-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}
.chat-join {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  border-radius: 0.75rem;
}
.join-card {
  text-align: center;
  max-width: 320px;
}
.join-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: var(--accent-soft);
  color: var(--accent);
  margin-bottom: 0.75rem;
}
.join-card h3 {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.3rem;
}
.join-sub {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-bottom: 1.25rem;
}
.ws-error {
  font-size: 0.85rem;
  color: #ef4444;
  margin-bottom: 1.25rem;
}
.join-btn {
  padding: 0.6rem 1.6rem;
  border: none;
  border-radius: 0.5rem;
  background: var(--accent);
  color: white;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
}
.join-btn:hover {
  background: var(--accent-hover);
}

/* Mobile peer list */
.mobile-peer-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  border-radius: 0.75rem;

  overflow: hidden;
}
.peer-list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border);
}
.peer-list-user {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.9rem;
  color: var(--text-primary);
}
.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
  display: inline-block;
}
.peer-list-actions {
  display: flex;
  gap: 0.3rem;
}
.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: none;
  border-radius: 0.5rem;
  background: transparent;
  color: var(--text-light);
  cursor: pointer;
  transition: all 0.15s ease;
}
.icon-btn:hover {
  background: var(--accent-soft);
  color: var(--accent);
}
.icon-btn.danger:hover {
  background: var(--danger-bg);
  color: var(--danger);
}
.new-chat-box {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.5rem 1rem;
  border-bottom: 1px solid var(--border);
}
.new-chat-input {
  flex: 1;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--input-border);
  border-radius: 0.5rem;
  background: var(--input-bg);
  color: var(--text-primary);
  font-size: 0.85rem;
  outline: none;
}
.new-chat-input:focus {
  border-color: var(--accent);
}
.new-chat-go {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: none;
  border-radius: 0.5rem;
  background: var(--accent);
  color: white;
  cursor: pointer;
}
.new-chat-go:hover {
  background: var(--accent-hover);
}
.peer-list-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}
.peer-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: background 0.1s ease;
  border: 1px solid var(--border-light);
}
.peer-card:hover {
  background: var(--hover);
}
.peer-card:active {
  background: var(--hover-expanded);
}
.peer-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #a855f7);
  color: white;
  font-weight: 600;
  font-size: 1rem;
  flex-shrink: 0;
}
.peer-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}
.peer-name {
  font-size: 0.9rem;
  color: var(--text-primary);
}
.peer-status {
  font-size: 0.75rem;
  color: #10b981;
}
.peer-chevron {
  color: var(--text-light);
  flex-shrink: 0;
}
.empty-peers {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: var(--text-muted);
  font-size: 0.9rem;
  padding: 2rem;
}
.empty-icon {
  color: var(--text-light);
  margin-bottom: 0.5rem;
}
.empty-hint {
  font-size: 0.8rem;
  color: var(--text-light);
}


.peer-avatar.sm {
  width: 32px;
  height: 32px;
  font-size: 0.8rem;
}
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.chat-bubble {
  max-width: 80%;
  padding: 0.6rem 0.85rem;
  border-radius: 0.85rem;
  background: var(--bg-tertiary);
  align-self: flex-start;
}
.chat-bubble.mine {
  background: var(--accent);
  color: white;
  align-self: flex-end;
}
.bubble-text {
  font-size: 0.85rem;
  line-height: 1.4;
  word-wrap: break-word;
}
.bubble-time {
  font-size: 0.65rem;
  margin-top: 0.2rem;
  opacity: 0.7;
}
.chat-bubble.mine .bubble-time {
  text-align: right;
}
.empty-chat {
  text-align: center;
  color: var(--text-light);
  font-size: 0.85rem;
  padding: 2rem;
}
.chat-input-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 0.75rem;
  border-top: 1px solid var(--border);
}
.chat-field {
  flex: 1;
  padding: 0.6rem 0.85rem;
  border: 1px solid var(--input-border);
  border-radius: 1.5rem;
  font-size: 0.85rem;
  outline: none;
  background: var(--input-bg);
  color: var(--text-primary);
}
.chat-field:focus {
  border-color: var(--accent);
}
.chat-send-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border: none;
  border-radius: 50%;
  background: var(--accent);
  color: white;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.15s ease;
}
.chat-send-btn:hover:not(:disabled) {
  background: var(--accent-hover);
}
.chat-send-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

@media (max-width: 800px) {
  .chat-section {
    margin: 0.5rem;
    border-radius: 0.75rem;
  }
  .section-header {
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  .header-actions {
    margin-left: auto;
  }
  .page_name {
    display: flex;
    color: var(--text-primary);
    font-size: 1.2rem;
  }
  .connect-btn,
  .connected-badge {
    font-size: 0.75rem;
    padding: 0.35rem 0.65rem;
  }
  .lock-btn {
    width: 32px;
    height: 32px;
  }
  .chat-main {
    min-height: 300px;
    border-radius: 0.75rem;
  }
  .chat-bubble {
    max-width: 85%;
  }
  .peer-card {
    padding: 0.65rem;
  }
}
@media (max-width: 480px) {
  .chat-section {
    margin: 0.25rem;
    border-radius: 0.5rem;
  }
  .chat-messages {
    padding: 0.5rem;
  }
  .peer-card {
    padding: 0.55rem;
  }
  .peer-avatar {
    width: 36px;
    height: 36px;
    font-size: 0.85rem;
  }
}
</style>
