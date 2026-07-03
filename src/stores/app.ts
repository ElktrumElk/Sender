import { ref, watch } from 'vue'
import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', () => {
  const searchQuery = ref('')
  const darkMode = ref(localStorage.getItem('darkMode') === 'true')

  watch(darkMode, (val) => {
    localStorage.setItem('darkMode', String(val))
    document.documentElement.setAttribute('data-theme', val ? 'dark' : 'light')
  }, { immediate: true })

  function toggleDarkMode() {
    darkMode.value = !darkMode.value
  }

  return { searchQuery, darkMode, toggleDarkMode }
})
