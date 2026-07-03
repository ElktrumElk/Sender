<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'
import { login, signup } from '@/services/auth-service'
import { clearToken, api } from '@/services/api'
import {
  getUsers,
  removeUser,
  fetchMessages,
  sendAdminMessage,
  searchUser,
} from '@/services/messages-store'
import {
  chatStore,
  wsConnectWithToken,
  wsDisconnect,
  wsSendMessage,
  loadConversations,
  loadConversationHistory,
} from '@/services/chat-store'

const auth = useAuthStore()
const app = useAppStore()

const expandedEmail = ref<string | null>(null)
const loading = ref(false)
const noUserMessage = reactive({ message: 'No user is found' })

const passwordInput = ref('')
const emailInput = ref('')
const authError = ref('')
const isSignup = ref(false)
const usernameInput = ref('')

const showCompose = ref(false)
const composeEmail = ref('')
const composeSubject = ref('')
const composeContent = ref('')
const sending = ref(false)
const composeError = ref('')
const composeSuccess = ref('')

const activeTab = ref<'invoices' | 'conversations'>('invoices')

const chatInput = ref('')
const showNewChat = ref(false)
const newChatPeer = ref('')

const users = computed(() => getUsers())

const filteredUsers = computed(() => {
  const q = app.searchQuery.toLowerCase().trim()
  if (!q) return users.value
  return users.value.filter(
    (u) =>
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.messages.some((m) => m.content.toLowerCase().includes(q)),
  )
})

function halfContent(content: string): string {
  return content.slice(0, Math.ceil(content.length / 2))
}

function formatTime(date: Date): string {
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatChatTime(date: Date): string {
  return date.toLocaleString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function shortId(id: string): string {
  return id.slice(0, 8) + '...'
}

function lastMessagePreview(user: { messages: { content: string }[] }): string {
  const msg = user.messages[user.messages.length - 1]
  if (!msg) return '-'
  return halfContent(msg.content) + '...'
}

function lastMessageTime(user: { messages: { sentAt: Date }[] }): string {
  const msg = user.messages[user.messages.length - 1]
  if (!msg) return '-'
  return formatTime(msg.sentAt)
}

function toggleExpand(email: string): void {
  expandedEmail.value = expandedEmail.value === email ? null : email
}

function deleteUser(email: string): void {
  removeUser(email)
}

async function submitAuth(): Promise<void> {
  authError.value = ''
  loading.value = true
  try {
    if (isSignup.value) {
      await signup(usernameInput.value, passwordInput.value, emailInput.value)
      usernameInput.value = ''
      passwordInput.value = ''
      emailInput.value = ''
      isSignup.value = false
      authError.value = 'Account created! Sign in with your credentials.'
      return
    }
    const result = await login(usernameInput.value, passwordInput.value)
    auth.setAuthenticated(true)
    auth.setUsername(result.user.username)
    auth.setEmail(result.user.email)
    auth.setUserId(result.user.user_id)
    usernameInput.value = ''
    passwordInput.value = ''
    await loadData()
  } catch {
    authError.value = isSignup.value ? 'Signup failed' : 'Invalid credentials'
  }
  loading.value = false
}

function toggleMode(): void {
  isSignup.value = !isSignup.value
  authError.value = ''
}

function lock(): void {
  clearToken()
  wsDisconnect()
  auth.setAuthenticated(false)
  auth.setUsername('')
  auth.setEmail('')
}

async function loadData(): Promise<void> {
  loading.value = true
  try {
    await fetchMessages()
    noUserMessage.message = 'No user is found'
  } catch (e) {
    const err = e as Error
    if (err.message === 'Unauthorized') {
      lock()
      authError.value = 'Session expired. Login again.'
    } else {
      noUserMessage.message = 'Cannot fetch lists'
    }
  }
  loading.value = false
}

async function refresh(): Promise<void> {
  await loadData()
}

function openCompose(): void {
  composeEmail.value = ''
  composeSubject.value = ''
  composeContent.value = ''
  composeError.value = ''
  composeSuccess.value = ''
  showCompose.value = true
}

function wrapSelection(before: string, after: string): void {
  const textarea = document.querySelector('.compose-textarea') as HTMLTextAreaElement | null
  if (!textarea) return
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const text = composeContent.value
  composeContent.value =
    text.slice(0, start) + before + text.slice(start, end) + after + text.slice(end)
  requestAnimationFrame(() => {
    textarea.focus()
    textarea.setSelectionRange(start + before.length, end + before.length)
  })
}

function insertList(prefix: string): void {
  const textarea = document.querySelector('.compose-textarea') as HTMLTextAreaElement | null
  const text = composeContent.value
  const lines = text
    .split('\n')
    .map((l) => (l.trim() ? `${prefix} ${l}` : l))
    .join('\n')
  composeContent.value = lines || `${prefix} `
  requestAnimationFrame(() => textarea?.focus())
}

async function sendEmail(): Promise<void> {
  composeError.value = ''
  composeSuccess.value = ''
  if (!composeEmail.value.trim()) {
    composeError.value = 'Recipient email is required'
    return
  }
  if (!composeContent.value.trim()) {
    composeError.value = 'Message content is required'
    return
  }
  sending.value = true
  try {
    await sendAdminMessage(
      composeEmail.value.trim(),
      composeContent.value,
      composeSubject.value.trim() || undefined,
    )
    composeSuccess.value = 'Message sent successfully'
    composeEmail.value = ''
    composeSubject.value = ''
    composeContent.value = ''
    loadData()
  } catch (e) {
    const err = e as Error
    if (err.message === 'Unauthorized') {
      lock()
      authError.value = 'Session expired. Login again.'
    } else {
      composeError.value = err.message || 'Failed to send message'
    }
  }
  sending.value = false
}

function connectChat(): void {
  if (api.token) {
    wsConnectWithToken(api.token)
  }
}

function doDisconnectChat(): void {
  wsDisconnect()
}

function selectPeer(peer: string): void {
  chatStore.activePeer = peer
  chatStore.messages = []
  loadConversationHistory(chatStore.username, peer).catch(() => {})
}

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

async function startNewConversation() {
  const data = await searchUser(newChatPeer.value)
  if (data) {
    const peer = newChatPeer.value.trim()
    if (!peer) return
    chatStore.activePeer = peer
    chatStore.messages = []
    newChatPeer.value = ''
    showNewChat.value = false
    if (!chatStore.peers.includes(peer)) {
      chatStore.peers.unshift(peer)
    }
  }
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
  <main>
    <div v-if="!auth.authenticated" class="auth-overlay">
      <div class="auth-card">
        <div class="auth-icon">
          <svg
            width="40"
            height="40"
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
        </div>
        <h2 class="auth-title">{{ isSignup ? 'Create Account' : 'Sign In' }}</h2>
        <p class="auth-subtitle">
          {{ isSignup ? 'Register a new account' : 'Enter your credentials' }}
        </p>
        <form class="auth-form" @submit.prevent="submitAuth">
          <input
            v-model="usernameInput"
            type="text"
            class="auth-input"
            placeholder="Username"
            autofocus
          />
          <input
            v-if="isSignup"
            v-model="emailInput"
            type="email"
            class="auth-input"
            placeholder="Email"
          />
          <input
            v-model="passwordInput"
            type="password"
            class="auth-input"
            placeholder="Password"
          />
          <p v-if="authError" class="auth-error">{{ authError }}</p>
          <button type="submit" class="auth-submit" :disabled="loading">
            {{ loading ? 'Please wait...' : isSignup ? 'Sign Up' : 'Sign In' }}
          </button>
        </form>
        <p class="auth-toggle">
          {{ isSignup ? 'Already have an account?' : "Don't have an account?" }}
          <button class="link-btn" @click="toggleMode">
            {{ isSignup ? 'Sign In' : 'Sign Up' }}
          </button>
        </p>
      </div>
    </div>

    <section v-else class="invoices-section">
      <div class="section-header">
        <div class="tab-bar">
          <button
            class="tab"
            :class="{ active: activeTab === 'invoices' }"
            @click="activeTab = 'invoices'"
          >
            Invoices
          </button>
          <button
            class="tab"
            :class="{ active: activeTab === 'conversations' }"
            @click="activeTab = 'conversations'"
          >
            Chat
            <span v-if="chatStore.connected" class="ws-dot" />
          </button>
        </div>
        <div class="header-actions">
          <button
            v-if="activeTab === 'invoices'"
            class="compose-btn"
            title="Send email"
            @click="openCompose"
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
              <path d="M22 2L11 13" />
              <path d="M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
            Send
          </button>
          <button
            v-else
            class="compose-btn"
            title="Connect chat"
            @click="connectChat"
            :disabled="chatStore.connected"
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
            {{ chatStore.connected ? 'Connected' : 'Connect' }}
          </button>
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
          <button
            class="refresh-btn"
            :disabled="loading"
            @click="activeTab === 'invoices' ? refresh() : undefined"
          >
            {{ loading ? 'Loading...' : 'Refresh' }}
          </button>
        </div>
      </div>

      <div v-if="activeTab === 'invoices'" class="table-wrapper">
        <table class="user-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>ID</th>
              <th>Message Preview</th>
              <th>Sent At</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <template v-for="user in filteredUsers" :key="user.email">
              <tr
                class="user-row"
                :class="{ expanded: expandedEmail === user.email }"
                @click="toggleExpand(user.email)"
              >
                <td class="name-cell">
                  <span class="avatar">{{ user.name.charAt(0) }}</span>
                  {{ user.name }}
                </td>
                <td class="email-cell">{{ user.email }}</td>
                <td class="id-cell">{{ shortId(user.id) }}</td>
                <td class="message-cell">{{ lastMessagePreview(user) }}</td>
                <td class="time-cell">{{ lastMessageTime(user) }}</td>
                <td class="action-cell" @click.stop>
                  <button class="delete-btn" title="Delete user" @click="deleteUser(user.email)">
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
                      <polyline points="3 6 5 6 21 6" />
                      <path
                        d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                      />
                      <line x1="10" y1="11" x2="10" y2="17" />
                      <line x1="14" y1="11" x2="14" y2="17" />
                    </svg>
                  </button>
                </td>
              </tr>
              <tr v-if="expandedEmail === user.email" class="expand-row">
                <td colspan="6">
                  <div class="messages-container">
                    <div v-for="msg in user.messages" :key="msg.id" class="message-item">
                      <div class="msg-content">{{ msg.content }}</div>
                      <div class="msg-time">{{ formatTime(msg.sentAt) }}</div>
                    </div>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
        <div v-if="filteredUsers.length === 0 && !loading" class="empty-state">
          {{ noUserMessage.message }}
        </div>
      </div>

      <div v-if="activeTab === 'conversations'" class="chat-layout">
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

        <template v-else>
          <div class="chat-sidebar">
            <div class="sidebar-head">
              <strong>{{ chatStore.username }}</strong>
              <span class="status-badge connected">Connected</span>
              <button
                class="new-chat-btn"
                title="New conversation"
                @click="showNewChat = !showNewChat"
              >
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
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
              <button class="disconnect-btn" title="Disconnect" @click="doDisconnectChat">
                <svg
                  width="16"
                  height="16"
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
            <div class="peer-list">
              <div
                v-for="peer in chatStore.peers"
                :key="peer"
                class="peer-item"
                :class="{ active: chatStore.activePeer === peer }"
                @click="selectPeer(peer)"
              >
                <span class="peer-avatar">{{ peer.charAt(0).toUpperCase() }}</span>
                <span class="peer-name">{{ peer }}</span>
              </div>
              <div v-if="chatStore.peers.length === 0" class="empty-peers">
                No conversations yet
              </div>
            </div>
          </div>

          <div class="chat-main">
            <template v-if="chatStore.activePeer">
              <div class="chat-head">
                <span class="peer-avatar sm">{{
                  chatStore.activePeer.charAt(0).toUpperCase()
                }}</span>
                <strong>{{ chatStore.activePeer }}</strong>
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
                <input
                  v-model="chatInput"
                  type="text"
                  class="chat-field"
                  placeholder="Type a message..."
                />
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
            </template>
            <div v-else class="chat-pick">
              <div class="pick-icon">
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <p>Select a conversation or click <strong>+</strong> to start a new one</p>
            </div>
          </div>
        </template>
      </div>
    </section>

    <div v-if="showCompose" class="modal-overlay" @click.self="showCompose = false">
      <div class="modal-card">
        <div class="modal-header">
          <h2>Send Email</h2>
          <button class="modal-close" @click="showCompose = false">
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
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <form class="compose-form" @submit.prevent="sendEmail">
          <div class="form-group">
            <label>To</label>
            <input
              v-model="composeEmail"
              type="email"
              class="form-input"
              placeholder="recipient@example.com"
            />
          </div>
          <div class="form-group">
            <label>Subject <span class="optional">(optional)</span></label>
            <input
              v-model="composeSubject"
              type="text"
              class="form-input"
              placeholder="Message subject"
            />
          </div>
          <div class="form-group">
            <label>Message</label>
            <div class="toolbar">
              <button
                type="button"
                class="toolbar-btn"
                title="Bold"
                @click="wrapSelection('**', '**')"
              >
                <strong>B</strong>
              </button>
              <button
                type="button"
                class="toolbar-btn"
                title="Italic"
                @click="wrapSelection('*', '*')"
              >
                <em>I</em>
              </button>
              <button
                type="button"
                class="toolbar-btn"
                title="Bullet list"
                @click="insertList('-')"
              >
                • list
              </button>
              <button
                type="button"
                class="toolbar-btn"
                title="Numbered list"
                @click="insertList('1.')"
              >
                1. list
              </button>
              <span class="toolbar-hint">Markdown supported</span>
            </div>
            <textarea
              v-model="composeContent"
              class="form-textarea compose-textarea"
              rows="8"
              placeholder="Type your message here..."
            />
          </div>
          <p v-if="composeError" class="form-error">{{ composeError }}</p>
          <p v-if="composeSuccess" class="form-success">{{ composeSuccess }}</p>
          <div class="form-actions">
            <button type="button" class="cancel-btn" @click="showCompose = false">Cancel</button>
            <button type="submit" class="send-btn" :disabled="sending">
              {{ sending ? 'Sending...' : 'Send' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </main>
</template>

<style lang="css" scoped>
.invoices-section {
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

.tab-bar {
  display: flex;
  gap: 0.25rem;
  background: var(--bg-tertiary);
  border-radius: 0.5rem;
  padding: 0.2rem;
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

.ws-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #10b981;
  display: inline-block;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.refresh-btn {
  padding: 0.5rem 1.25rem;
  border: 1px solid var(--input-border);
  border-radius: 0.5rem;
  background: var(--bg-primary);
  color: var(--text-secondary);
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.refresh-btn:hover:not(:disabled) {
  background: var(--bg-tertiary);
  border-color: var(--text-light);
}

.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.table-wrapper {
  overflow-x: auto;
  border-radius: 0.75rem;
  border: 1px solid var(--table-border);
  background: var(--bg-primary);
  width: 100%;
}

.user-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

thead {
  background: var(--table-header-bg);
}

th {
  text-align: left;
  padding: 0.85rem 1rem;
  font-weight: 600;
  color: var(--text-secondary);
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 2px solid var(--table-border);
}

td {
  padding: 0.85rem 1rem;
  border-bottom: 1px solid var(--border-light);
  color: var(--text-secondary);
}

.user-row {
  cursor: pointer;
  transition: background 0.15s ease;
}

.user-row:hover {
  background: var(--hover);
}

.user-row.expanded {
  background: var(--hover-expanded);
  border-bottom: none;
}

.user-row.expanded td {
  border-bottom: none;
}

.expand-row td {
  padding: 0;
  border-bottom: 1px solid var(--table-border);
  background: var(--expand-bg);
}

.messages-container {
  display: flex;
  flex-direction: column;
  padding: 1rem 1rem 1rem 3.5rem;
  gap: 0.6rem;
}

.message-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.6rem 0.85rem;
  background: var(--msg-bg);
  border-radius: 0.5rem;
  border: 1px solid var(--msg-border);
  transition: border-color 0.15s ease;
}

.message-item:hover {
  border-color: var(--msg-hover-border);
}

.msg-content {
  flex: 1;
  font-size: 0.85rem;
  color: var(--text-primary);
  line-height: 1.4;
}

.msg-time {
  white-space: nowrap;
  font-size: 0.75rem;
  color: var(--text-light);
  flex-shrink: 0;
  padding-top: 0.1rem;
}

.name-cell {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  font-weight: 500;
  color: var(--text-primary);
}

.avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  color: white;
  font-weight: 600;
  font-size: 0.85rem;
  flex-shrink: 0;
}

.email-cell {
  color: var(--text-muted);
}

.id-cell {
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 0.8rem;
  color: var(--text-light);
}

.message-cell {
  max-width: 260px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--text-muted);
  font-style: italic;
}

.time-cell {
  white-space: nowrap;
  font-size: 0.8rem;
  color: var(--text-muted);
}

.action-cell {
  width: 48px;
  text-align: center;
}

.delete-btn {
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

.delete-btn:hover {
  background: var(--danger-bg);
  color: var(--danger);
}

.empty-state {
  padding: 2rem;
  text-align: center;
  color: var(--text-light);
  font-size: 0.9rem;
}

.auth-overlay {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  height: 100dvh;
  width: 100%;
  margin-block-start: auto;
  margin-block-end: auto;
}

.auth-card {
  background: var(--bg-primary);
  border-radius: 1rem;
  padding: 2.5rem 2rem;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--border);
  text-align: center;
  max-width: 360px;
  width: 100%;
}

.auth-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--accent-soft);
  color: var(--accent);
  margin-bottom: 1rem;
}

.auth-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.35rem;
}

.auth-subtitle {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin-bottom: 1.5rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.auth-input {
  padding: 0.7rem 1rem;
  border: 1px solid var(--input-border);
  border-radius: 0.5rem;
  font-size: 0.9rem;
  outline: none;
  background: var(--input-bg);
  color: var(--text-primary);
  transition: border-color 0.15s ease;
  text-align: center;
}

.auth-input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
}

.auth-error {
  color: var(--danger);
  font-size: 0.8rem;
  margin: 0;
}

.auth-submit {
  padding: 0.7rem;
  border: none;
  border-radius: 0.5rem;
  background: var(--accent);
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.15s ease;
}

.auth-submit:hover {
  background: var(--accent-hover);
}

.auth-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.auth-toggle {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-top: 0.75rem;
}

.link-btn {
  background: none;
  border: none;
  color: var(--accent);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
}

.compose-btn {
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

.compose-btn:hover:not(:disabled) {
  background: var(--accent-hover);
  border-color: var(--accent-hover);
}

.compose-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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

.modal-overlay {
  position: fixed;
  inset: 0;
  background: var(--modal-overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-card {
  background: var(--bg-primary);
  border-radius: 1rem;
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem 0;
}

.modal-header h2 {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.modal-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 0.5rem;
  background: transparent;
  color: var(--text-light);
  cursor: pointer;
  transition: all 0.15s ease;
}

.modal-close:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.compose-form {
  padding: 1.25rem 1.5rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.form-group label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.optional {
  font-weight: 400;
  color: var(--text-light);
}

.form-input {
  padding: 0.65rem 0.85rem;
  border: 1px solid var(--input-border);
  border-radius: 0.5rem;
  font-size: 0.875rem;
  outline: none;
  background: var(--input-bg);
  color: var(--text-primary);
  transition: border-color 0.15s ease;
}

.form-input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.4rem 0.5rem;
  background: var(--toolbar-bg);
  border: 1px solid var(--input-border);
  border-bottom: none;
  border-radius: 0.5rem 0.5rem 0 0;
  flex-wrap: wrap;
}

.toolbar-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem 0.55rem;
  border: 1px solid transparent;
  border-radius: 0.35rem;
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.15s ease;
  gap: 0.2rem;
}

.toolbar-btn:hover {
  background: var(--bg-tertiary);
  border-color: var(--input-border);
}

.toolbar-hint {
  margin-left: auto;
  font-size: 0.7rem;
  color: var(--text-light);
}

.form-textarea {
  padding: 0.65rem 0.85rem;
  border: 1px solid var(--input-border);
  border-top: none;
  border-radius: 0 0 0.5rem 0.5rem;
  font-size: 0.875rem;
  background: var(--input-bg);
  color: var(--text-primary);
  font-family: inherit;
  outline: none;
  resize: vertical;
  line-height: 1.5;
  transition: border-color 0.15s ease;
}

.form-textarea:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.form-error {
  color: var(--danger);
  font-size: 0.8rem;
  margin: 0;
}

.form-success {
  color: var(--success);
  font-size: 0.8rem;
  margin: 0;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
  padding-top: 0.5rem;
}

.cancel-btn {
  padding: 0.55rem 1.1rem;
  border: 1px solid var(--input-border);
  border-radius: 0.5rem;
  background: var(--bg-primary);
  color: var(--text-secondary);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.cancel-btn:hover {
  background: var(--bg-tertiary);
}

.send-btn {
  padding: 0.55rem 1.3rem;
  border: none;
  border-radius: 0.5rem;
  background: var(--accent);
  color: white;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.send-btn:hover:not(:disabled) {
  background: var(--accent-hover);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.chat-layout {
  display: flex;
  gap: 0;
  border-radius: 0.75rem;
  border: 1px solid var(--table-border);
  background: var(--bg-primary);
  min-height: 420px;
  overflow: hidden;
}

.chat-join {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
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

.chat-sidebar {
  width: 210px;
  flex-shrink: 0;
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
}

.sidebar-head {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.75rem;
  font-size: 0.85rem;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border);
  flex-wrap: wrap;
}

.status-badge {
  font-size: 0.6rem;
  padding: 0.15rem 0.4rem;
  border-radius: 0.3rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.connected {
  background: #d1fae5;
  color: #065f46;
}

.new-chat-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border: none;
  border-radius: 0.35rem;
  background: transparent;
  color: var(--text-light);
  cursor: pointer;
}

.new-chat-btn:hover {
  background: var(--accent-soft);
  color: var(--accent);
}

.new-chat-box {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.4rem 0.75rem;
  border-bottom: 1px solid var(--border);
}

.new-chat-input {
  flex: 1;
  padding: 0.35rem 0.5rem;
  border: 1px solid var(--border);
  border-radius: 0.35rem;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.8rem;
  outline: none;
}

.new-chat-input:focus {
  border-color: var(--accent);
}

.new-chat-go {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border: none;
  border-radius: 0.35rem;
  background: var(--accent);
  color: white;
  cursor: pointer;
}

.new-chat-go:hover {
  background: var(--accent-hover);
}

.disconnect-btn {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border: none;
  border-radius: 0.35rem;
  background: transparent;
  color: var(--text-light);
  cursor: pointer;
}

.disconnect-btn:hover {
  background: var(--danger-bg);
  color: var(--danger);
}

.peer-list {
  flex: 1;
  overflow-y: auto;
  padding: 0.4rem;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.peer-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.6rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background 0.1s ease;
}

.peer-item:hover {
  background: var(--hover);
}

.peer-item.active {
  background: var(--accent-soft);
}

.peer-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #a855f7);
  color: white;
  font-weight: 600;
  font-size: 0.75rem;
  flex-shrink: 0;
}

.peer-avatar.sm {
  width: 28px;
  height: 28px;
  font-size: 0.7rem;
}

.peer-name {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--text-primary);
}

.empty-peers {
  padding: 1rem;
  text-align: center;
  color: var(--text-light);
  font-size: 0.8rem;
}

.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.chat-head {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border-bottom: 1px solid var(--border);
  font-size: 0.85rem;
  color: var(--text-primary);
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
  max-width: 75%;
  padding: 0.5rem 0.75rem;
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

.chat-pick {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: var(--text-muted);
  font-size: 0.9rem;
}

.pick-icon {
  color: var(--text-light);
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
  padding: 0.55rem 0.75rem;
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
  width: 36px;
  height: 36px;
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
</style>
