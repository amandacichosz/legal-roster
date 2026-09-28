import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import * as authApi from '@/api/auth'
import type { CurrentUser, LoginPayload } from '@/api/auth'
import { supabase } from '@/lib/supabase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<CurrentUser | null>(null)
  const loading = ref(false)
  const initialized = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => user.value !== null)
  const isAdmin = computed(() => user.value?.role === 'platform_admin' || user.value?.role === 'admin')

  async function initialize() {
    if (initialized.value) return

    loading.value = true
    error.value = null
    try {
      const { data } = await supabase.auth.getSession()
      user.value = data.session ? await authApi.getCurrentUser() : null
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
    isAdmin,
    initialize,
    login,
    logout,
  }
})
