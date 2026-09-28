import { request } from '@/api/client'
import { requireSupabaseConfig, supabase } from '@/lib/supabase'

export type UserRole = 'platform_admin' | 'admin' | 'user'

export interface CurrentUser {
  id: string
  email: string
  name: string
  role: UserRole
  status: 'active' | 'disabled'
}

export interface LoginPayload {
  email: string
  password: string
}

export function getCurrentUser() {
  return request<CurrentUser>('/api/auth/me', { method: 'GET' })
}

export async function login(payload: LoginPayload) {
  requireSupabaseConfig()
  const { error } = await supabase.auth.signInWithPassword(payload)
  if (error) throw error
  return getCurrentUser()
}

export async function logout() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}
