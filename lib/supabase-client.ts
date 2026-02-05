'use client'

import { createClient } from '@supabase/supabase-js'

// This file ensures Supabase client is ONLY created on the client side
let supabaseInstance: ReturnType<typeof createClient> | null = null

function getSupabaseClient() {
  // Only create client in browser
  if (typeof window === 'undefined') {
    throw new Error('Supabase client can only be used in the browser')
  }

  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    console.log('🔧 Creating Supabase client (client-side only)')
    console.log('URL:', supabaseUrl)
    console.log('Key exists:', !!supabaseAnonKey)

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase credentials')
    }

    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })

    console.log('✅ Supabase client created successfully')
  }

  return supabaseInstance
}

// Export the client - it will be created on first use
export const supabase = getSupabaseClient()
