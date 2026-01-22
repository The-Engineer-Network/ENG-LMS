import { useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export function useRealTimeUpdates(
  table: string,
  onUpdate: () => void,
  dependencies: any[] = []
) {
  const handleUpdate = useCallback(() => {
    onUpdate()
  }, [onUpdate])

  useEffect(() => {
    // Set up real-time subscription
    const subscription = supabase
      .channel(`${table}_changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table
        },
        handleUpdate
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [table, handleUpdate, ...dependencies])
}

// Hook for periodic refresh as fallback
export function usePeriodicRefresh(
  refreshFunction: () => void,
  intervalMs: number = 30000, // 30 seconds default
  enabled: boolean = true
) {
  useEffect(() => {
    if (!enabled) return

    const interval = setInterval(() => {
      refreshFunction()
    }, intervalMs)

    return () => clearInterval(interval)
  }, [refreshFunction, intervalMs, enabled])
}