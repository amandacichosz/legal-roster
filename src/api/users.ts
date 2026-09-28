import { request } from '@/api/client'
import type { CurrentUser, UserRole } from '@/api/auth'

export function listUsers() {
  return request<CurrentUser[]>('/api/admin/users', { method: 'GET' })
}

export function updateUserRole(id: string, role: UserRole) {
  return request<CurrentUser>(`/api/admin/users/${id}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  })
}

export function updateUserStatus(id: string, status: 'active' | 'disabled') {
  return request<CurrentUser>(`/api/admin/users/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}
