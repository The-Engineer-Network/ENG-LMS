import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { logger } from "@/lib/logger"

export interface Notification {
  id: string
  type: 'submission_feedback' | 'partner_activity' | 'clarity_call' | 'achievement' | 'general'
  title: string
  message: string
  read: boolean
  created_at: string
  user_id: string
  data?: any
}

export function useNotifications(userId: string) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return

    // Load initial notifications
    loadNotifications()

    // Set up real-time subscription
    const subscription = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          const newNotification = payload.new as Notification
          setNotifications(prev => [newNotification, ...prev])
          setUnreadCount(prev => prev + 1)
          
          // Show browser notification if permission granted
          if (Notification.permission === 'granted') {
            new Notification(newNotification.title, {
              body: newNotification.message,
              icon: '/icon.svg'
            })
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [userId])

  const loadNotifications = async () => {
    if (!userId) {
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) {
        // If table doesn't exist or other database error, just log and continue
        logger.warn('Notifications table not available:', error.message)
        setNotifications([])
        setUnreadCount(0)
        return
      }

      setNotifications(data || [])
      setUnreadCount(data?.filter(n => !n.read).length || 0)
    } catch (error) {
      logger.warn('Error loading notifications:', error)
      // Set empty state instead of failing
      setNotifications([])
      setUnreadCount(0)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)

      if (error) {
        logger.warn('Error marking notification as read:', error.message)
        return
      }

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      logger.warn('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false)

      if (error) {
        logger.warn('Error marking all notifications as read:', error.message)
        return
      }

      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (error) {
      logger.warn('Error marking all notifications as read:', error)
    }
  }

  const requestPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission()
    }
  }

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    requestPermission,
    refresh: loadNotifications
  }
}

// Helper function to create notifications
export async function createNotification(
  userId: string,
  type: Notification['type'],
  title: string,
  message: string,
  data?: any
) {
  const { error } = await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      type,
      title,
      message,
      data,
      read: false,
      created_at: new Date().toISOString()
    })

  if (error) {
    logger.error('Error creating notification:', error)
    throw error
  }
}