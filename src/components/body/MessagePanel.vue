<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { chatStore, wsSendMessage, loadConversationHistory } from '@/services/chat-store'

const route = useRoute()
const router = useRouter()
const peerName = route.params.peerName as string
const chatInput = ref('')

chatStore.activePeer = peerName
chatStore.messages = []
loadConversationHistory(chatStore.username, peerName).catch(() => {})

function sendChatMessage(): void {
  const text = chatInput.value.trim()
  if (!text || !chatStore.activePeer) return
  wsSendMessage(chatStore.activePeer, text)
  chatStore.messages.push({
    id: crypto.randomUUID(),
    from: chatStore.username,
    content: text,
    createdAt: new Date(),
    isMine: true,
  })
  chatInput.value = ''
}

function goBack(): void {
  router.push('/chats')
}

function formatChatTime(date: Date): string {
  return date.toLocaleString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<template>
  <div class="chat-main">
    <div class="chat-head">
      <button class="back-btn" title="Back" @click="goBack">
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
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <span class="peer-avatar sm">{{ peerName.charAt(0).toUpperCase() }}</span>
      <strong>{{ peerName }}</strong>
    </div>
    <div class="chat-messages">
      <div
        v-for="msg in chatStore.messages"
        :key="msg.id"
        class="chat-bubble"
        :class="{ mine: msg.isMine }"
      >
        <div class="bubble-text">{{ msg.content }}</div>
        <div class="bubble-time">{{ formatChatTime(msg.createdAt) }}</div>
      </div>
      <div v-if="chatStore.messages.length === 0" class="empty-chat">
        No messages yet. Start a conversation!
      </div>
    </div>
    <form class="chat-input-bar" @submit.prevent="sendChatMessage">
      <input v-model="chatInput" type="text" class="chat-field" placeholder="Type a message..." />
      <button
        type="submit"
        class="chat-send-btn"
        :disabled="!chatInput.trim() || !chatStore.activePeer"
      >
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
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
      </button>
    </form>
  </div>
</template>

<style lang="css" scoped>
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 400px;
  border-radius: 0.75rem;
  border: 1px solid var(--table-border);
  background: var(--bg-primary);
  overflow: hidden;
  margin: 1rem;
}
.chat-head {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border-bottom: 1px solid var(--border);
  font-size: 0.9rem;
  color: var(--text-primary);
}
.back-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 0.5rem;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s ease;
}
.back-btn:hover {
  background: var(--hover);
}
.peer-avatar.sm {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #a855f7);
  color: white;
  font-weight: 600;
  font-size: 0.8rem;
  flex-shrink: 0;
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
  color: black;
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
  .chat-main {
    min-height: 300px;
    border-radius: 0.75rem;
    margin: 0.5rem;
  }
  .chat-bubble {
    max-width: 85%;
  }
}
@media (max-width: 480px) {
  .chat-messages {
    padding: 0.5rem;
  }
}
</style>
