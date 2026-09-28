import { supabase } from '@/lib/supabase'

export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const isFormData = options.body instanceof FormData
  const { data } = await supabase.auth.getSession()
  const accessToken = data.session?.access_token
  const response = await fetch(path, {
    ...options,
    credentials: 'include',
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...options.headers,
    },
  })

  if (!response.ok) {
    let message = 'Request failed'
    try {
      const body = (await response.json()) as { error?: string }
      message = body.error || message
    } catch {
      // Keep the generic message when the API does not return JSON.
    }
    throw new Error(message)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

export async function download(path: string): Promise<void> {
  const { data } = await supabase.auth.getSession()
  const accessToken = data.session?.access_token
  if (!accessToken) throw new Error('Authentication required')

  const response = await fetch(path, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!response.ok) {
    let message = 'Download failed'
    try {
      const body = (await response.json()) as { error?: string }
      message = body.error || message
    } catch {
      // Keep the generic message when the API does not return JSON.
    }
    throw new Error(message)
  }

  const disposition = response.headers.get('Content-Disposition') || ''
  const filenameMatch = disposition.match(/filename="([^"]+)"/i)
  const filename = filenameMatch?.[1] || 'resume'
  const objectURL = URL.createObjectURL(await response.blob())
  const link = document.createElement('a')
  link.href = objectURL
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(objectURL)
}
