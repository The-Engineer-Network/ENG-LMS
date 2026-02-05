import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Singleton pattern to ensure only one client instance
class SupabaseClientManager {
  private static clientInstance: SupabaseClient | null = null
  private static serverInstance: SupabaseClient | null = null

  static getClient(): SupabaseClient {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !key) {
      throw new Error('Missing Supabase environment variables')
    }

    // Check if we're on the server or client
    const isServer = typeof window === 'undefined'

    if (isServer) {
      // Server-side instance
      if (!this.serverInstance) {
        this.serverInstance = createClient(url, key, {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
          },
          db: {
            schema: 'public',
          },
        })
      }
      return this.serverInstance
    } else {
      // Client-side instance
      if (!this.clientInstance) {
        this.clientInstance = createClient(url, key, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
            storage: window.localStorage,
          },
          global: {
            fetch: fetch.bind(globalThis),
          },
          db: {
            schema: 'public',
          },
        })
      }
      return this.clientInstance
    }
  }
}

export const supabase = SupabaseClientManager.getClient()
