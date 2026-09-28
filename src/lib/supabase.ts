import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export function requireSupabaseConfig() {
  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error('VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY must be configured')
  }
}

export const supabase = createClient(
  supabaseUrl || 'http://localhost',
  supabasePublishableKey || 'missing-supabase-publishable-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  },
)
