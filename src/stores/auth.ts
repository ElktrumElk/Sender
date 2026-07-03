import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
  const authenticated = ref(false)
  const username = ref('')
  const userEmail = ref('')
  const userId = ref('')

  function setAuthenticated(v: boolean) {
    authenticated.value = v
  }

  function setUsername(name: string) {
    username.value = name
  }

  function setEmail(email: string) {
    userEmail.value = email;
  }

  function setUserId(user_id: string) {
    userId.value = user_id
  }

  return { authenticated, username, setAuthenticated, setUsername, setEmail, userEmail, setUserId, userId }
})
