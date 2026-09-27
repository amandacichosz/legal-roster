import { request } from '@/api/client'

export type UserRole = 'platform_admin' | 'admin' | 'law_firm_user' | 'contractor' | 'reviewer'

export interface CurrentUser {
  id: number
  email: string
  name: string
  role: UserRole
  status: 'active' | 'disabled'
}

export interface LoginPayload {
  email: string
  password: string
}

export interface ActivatePayload {
  token: string
  password: string
}

export function getCurrentUser() {
  return request<CurrentUser>('/api/auth/me', { method: 'GET' })
}

export function login(payload: LoginPayload) {
  return request<CurrentUser>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function activate(payload: ActivatePayload) {
  return request<CurrentUser>('/api/auth/activate', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function logout() {
  return request<{ status: string }>('/api/auth/logout', { method: 'POST' })
}
