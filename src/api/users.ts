import { request } from '@/api/client'
import type { CurrentUser, UserRole } from '@/api/auth'

export interface InviteUserPayload {
  email: string
  name: string
  role: UserRole
}

export interface InvitationResponse {
  id: number
  email: string
  name: string
  role: UserRole
  expires_at: string
  activation_url: string
}

export function listUsers() {
  return request<CurrentUser[]>('/api/admin/users', { method: 'GET' })
}

export function inviteUser(payload: InviteUserPayload) {
  return request<InvitationResponse>('/api/admin/users/invitations', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateUserRole(id: number, role: UserRole) {
  return request<CurrentUser>(`/api/admin/users/${id}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  })
}

export function disableUser(id: number) {
  return request<CurrentUser>(`/api/admin/users/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'disabled' }),
  })
}
