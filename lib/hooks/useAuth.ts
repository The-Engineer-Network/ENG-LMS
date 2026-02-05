'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../supabase-fixed'
import { getCurrentUser, type AuthUser } from '../auth'

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    // Get initial session
    getCurrentUser().then((user) => {
      if (mounted) {
        setUser(user)
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return
        
        if (session?.user) {
          const user = await getCurrentUser()
          if (mounted) setUser(user)
        } else {
          if (mounted) setUser(null)
        }
        if (mounted) setLoading(false)
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  return { user, loading }
}