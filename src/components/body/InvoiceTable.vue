<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'
import { clearToken } from '@/services/api'
import { getUsers, removeUser, fetchMessages } from '@/services/messages-store'
import { wsDisconnect } from '@/services/chat-store'

const auth = useAuthStore()
const app = useAppStore()

const expandedEmail = ref<string | null>(null)
const loading = ref(false)
const noUserMessage = reactive({ message: 'No user is found' })

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

function lock(): void {
  clearToken()
  wsDisconnect()
  auth.setAuthenticated(false)
  auth.setUsername('')
  auth.setEmail('')
}

async function refresh(): Promise<void> {
  loading.value = true
  try {
    await fetchMessages()
    noUserMessage.message = 'No user is found'
  } catch (e) {
    const err = e as Error
    if (err.message === 'Unauthorized') {
      lock()
    } else {
      noUserMessage.message = 'Cannot fetch lists'
    }
  }
  loading.value = false
}

const emit = defineEmits<{
  (e: 'compose'): void
}>()
</script>

<template>
  <section class="invoices-section">
    <div class="section-header">
      <strong class="page_name">Invoice</strong>
      <div class="header-actions">
        <button class="compose-btn" title="Send email" @click="emit('compose')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 2L11 13" />
            <path d="M22 2l-7 20-4-9-9-4 20-7z" />
          </svg>
          Send
        </button>
        <button class="lock-btn" title="Lock" @click="lock">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </button>
        <button class="refresh-btn" :disabled="loading" @click="refresh">
          {{ loading ? 'Loading...' : 'Refresh' }}
        </button>
      </div>
    </div>

    <div class="table-wrapper">
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
            <tr class="user-row" :class="{ expanded: expandedEmail === user.email }" @click="toggleExpand(user.email)">
              <td class="name-cell" data-label="Name">
                <span class="avatar">{{ user.name.charAt(0) }}</span>
                {{ user.name }}
              </td>
              <td class="email-cell" data-label="Email">{{ user.email }}</td>
              <td class="id-cell" data-label="ID">{{ shortId(user.id) }}</td>
              <td class="message-cell" data-label="Message">{{ lastMessagePreview(user) }}</td>
              <td class="time-cell" data-label="Sent">{{ lastMessageTime(user) }}</td>
              <td class="action-cell" @click.stop>
                <button class="delete-btn" title="Delete user" @click="deleteUser(user.email)">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
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
  </section>
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
.compose-btn:hover {
  background: var(--accent-hover);
  border-color: var(--accent-hover);
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
@media (max-width: 800px) {
  .invoices-section {
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
  .refresh-btn {
    padding: 0.4rem 0.8rem;
    font-size: 0.75rem;
  }
  .compose-btn {
    padding: 0.4rem 0.7rem;
    font-size: 0.75rem;
  }
  .lock-btn {
    width: 32px;
    height: 32px;
  }
  .page_name {
    display: flex;
    color: var(--text-primary);
    font-size: 1.2rem;
  }
  .user-table, .user-table thead, .user-table tbody, .user-table tr, .user-table th, .user-table td {
    display: block;
  }
  .user-table thead {
    display: none;
  }
  .user-table .user-row {
    margin-bottom: 0.75rem;
    border: 1px solid var(--border);
    border-radius: 0.75rem;
    padding: 0.75rem;
    background: var(--bg-primary);
  }
  .user-table .user-row.expanded {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    margin-bottom: 0;
  }
  .user-table .user-row td {
    padding: 0.35rem 0;
    border: none;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .user-table .user-row td::before {
    content: attr(data-label);
    font-weight: 600;
    font-size: 0.75rem;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    min-width: 70px;
    flex-shrink: 0;
  }
  .user-table .user-row .name-cell::before {
    content: '';
    display: none;
  }
  .user-table .user-row .action-cell {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    padding: 0;
  }
  .user-table .user-row {
    position: relative;
  }
  .user-table .user-row .message-cell {
    font-style: normal;
    max-width: none;
  }
  .user-table .expand-row td {
    padding: 0;
  }
  .messages-container {
    padding: 0.75rem;
    gap: 0.5rem;
  }
}
@media (max-width: 480px) {
  .invoices-section {
    margin: 0.25rem;
    border-radius: 0.5rem;
  }
  .section-header {
    padding: 0.4rem;
  }
  .user-table .user-row {
    padding: 0.6rem;
    margin-bottom: 0.5rem;
  }
  .user-table .user-row td {
    font-size: 0.8rem;
    padding: 0.25rem 0;
  }
  .messages-container {
    padding: 0.5rem;
  }
  .message-item {
    flex-direction: column;
    gap: 0.3rem;
  }
}
</style>
