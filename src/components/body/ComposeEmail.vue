<script setup lang="ts">
import { ref } from 'vue'
import { sendAdminMessage, fetchMessages } from '@/services/messages-store'
import { clearToken } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import { wsDisconnect } from '@/services/chat-store'

const auth = useAuthStore()

const composeEmail = ref('')
const composeSubject = ref('')
const composeContent = ref('')
const sending = ref(false)
const composeError = ref('')
const composeSuccess = ref('')

const emit = defineEmits<{
  (e: 'close'): void
}>()

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

function lock(): void {
  clearToken()
  wsDisconnect()
  auth.setAuthenticated(false)
  auth.setUsername('')
  auth.setEmail('')
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
    fetchMessages()
  } catch (e) {
    const err = e as Error
    if (err.message === 'Unauthorized') {
      lock()
      composeError.value = 'Session expired. Login again.'
    } else {
      composeError.value = err.message || 'Failed to send message'
    }
  }
  sending.value = false
}
</script>

<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal-card">
      <div class="modal-header">
        <h2>Send Email</h2>
        <button class="modal-close" @click="emit('close')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
      <form class="compose-form" @submit.prevent="sendEmail">
        <div class="form-group">
          <label>To</label>
          <input v-model="composeEmail" type="email" class="form-input" placeholder="recipient@example.com" />
        </div>
        <div class="form-group">
          <label>Subject <span class="optional">(optional)</span></label>
          <input v-model="composeSubject" type="text" class="form-input" placeholder="Message subject" />
        </div>
        <div class="form-group">
          <label>Message</label>
          <div class="toolbar">
            <button type="button" class="toolbar-btn" title="Bold" @click="wrapSelection('**', '**')"><strong>B</strong></button>
            <button type="button" class="toolbar-btn" title="Italic" @click="wrapSelection('*', '*')"><em>I</em></button>
            <button type="button" class="toolbar-btn" title="Bullet list" @click="insertList('-')">• list</button>
            <button type="button" class="toolbar-btn" title="Numbered list" @click="insertList('1.')">1. list</button>
            <span class="toolbar-hint">Markdown supported</span>
          </div>
          <textarea v-model="composeContent" class="form-textarea compose-textarea" rows="8" placeholder="Type your message here..." />
        </div>
        <p v-if="composeError" class="form-error">{{ composeError }}</p>
        <p v-if="composeSuccess" class="form-success">{{ composeSuccess }}</p>
        <div class="form-actions">
          <button type="button" class="cancel-btn" @click="emit('close')">Cancel</button>
          <button type="submit" class="send-btn" :disabled="sending">
            {{ sending ? 'Sending...' : 'Send' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style lang="css" scoped>
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
@media (max-width: 800px) {
  .modal-card {
    max-width: 100%;
    max-height: 100vh;
    border-radius: 0;
    min-height: 100dvh;
  }
  .modal-overlay {
    padding: 0;
  }
  .toolbar-hint {
    display: none;
  }
}
@media (max-width: 480px) {
  .compose-form {
    padding: 1rem;
  }
}
</style>
