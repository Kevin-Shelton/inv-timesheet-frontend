// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  console.error('Missing VITE_SUPABASE_URL environment variable')
  throw new Error('Missing Supabase URL')
}

if (!supabaseAnonKey) {
  console.error('Missing VITE_SUPABASE_ANON_KEY environment variable')
  throw new Error('Missing Supabase Anon Key')
}

console.log('Initializing Supabase client with URL:', supabaseUrl)

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Test connection
supabase.from('campaigns').select('count', { count: 'exact', head: true })
  .then(({ error, count }) => {
    if (error) {
      console.error('Supabase connection test failed:', error)
    } else {
      console.log('Supabase connected successfully. Campaigns table accessible.')
    }
  })
  .catch(err => {
    console.error('Supabase connection error:', err)
  })

