import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import * as authApi from '@/api/auth'
import type { ActivatePayload, CurrentUser, LoginPayload } from '@/api/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<CurrentUser | null>(null)
  const loading = ref(false)
  const initialized = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => user.value !== null)
  const isPlatformAdmin = computed(() => user.value?.role === 'platform_admin')

  async function initialize() {
    if (initialized.value) return

    loading.value = true
    error.value = null
    try {
      user.value = await authApi.getCurrentUser()
    } catch {
      user.value = null
    } finally {
      initialized.value = true
      loading.value = false
    }
  }

  async function login(payload: LoginPayload) {
    loading.value = true
    error.value = null
    try {
      user.value = await authApi.login(payload)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unable to sign in'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function activate(payload: ActivatePayload) {
    loading.value = true
    error.value = null
    try {
      user.value = await authApi.activate(payload)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unable to activate account'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    loading.value = true
    error.value = null
    try {
      await authApi.logout()
    } finally {
      user.value = null
      loading.value = false
    }
  }

  return {
    user,
    loading,
    initialized,
    error,
    isAuthenticated,
    isPlatformAdmin,
    initialize,
    login,
    activate,
    logout,
  }
})
