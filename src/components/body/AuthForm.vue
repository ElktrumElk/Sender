<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { login, signup } from '@/services/auth-service'
import { fetchMessages } from '@/services/messages-store'

const auth = useAuthStore()

const passwordInput = ref('')
const emailInput = ref('')
const authError = ref('')
const isSignup = ref(false)
const usernameInput = ref('')
const loading = ref(false)

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
    await fetchMessages()
  } catch {
    authError.value = isSignup.value ? 'Signup failed' : 'Invalid credentials'
  }
  loading.value = false
}

function toggleMode(): void {
  isSignup.value = !isSignup.value
  authError.value = ''
}
</script>

<template>
  <div class="auth-overlay">
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
        <input v-model="passwordInput" type="password" class="auth-input" placeholder="Password" />
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
</template>

<style lang="css" scoped>
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
  max-width: 400px;
  width: 90%;
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
@media (max-width: 800px) {
  .auth-card {
    padding: 1.5rem 1rem;
    max-width: 400px;
  }
}
@media (max-width: 480px) {
  .auth-card {
    padding: 1.25rem 0.85rem;
  }
}
</style>
