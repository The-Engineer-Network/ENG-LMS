import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { getChatMessages, sendChatMessage } from '../data'

export interface ChatMessage {
  id: string
  sender_id: string
  recipient_id: string
  content: string
  type: 'text' | 'file' | 'image'
  file_name?: string
  file_url?: string
  file_size?: number
  timestamp: string
  sender?: {
    id: string
    full_name: string
    profile_picture_url?: string
  }
}

export function useChat(userId: string, partnerId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId || !partnerId) return

    // Load initial messages
    loadMessages()

    // Set up real-time subscription
    const subscription = supabase
      .channel('chat_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `or(and(sender_id.eq.${userId},recipient_id.eq.${partnerId}),and(sender_id.eq.${partnerId},recipient_id.eq.${userId}))`
        },
        (payload) => {
          const newMessage = payload.new as ChatMessage
          setMessages(prev => [...prev, newMessage])
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [userId, partnerId])

  const loadMessages = async () => {
    if (!userId || !partnerId) return

    try {
      const data = await getChatMessages(userId, partnerId)
      setMessages(data || [])
    } catch (error) {
      console.error('Error loading messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async (content: string, type: 'text' | 'file' | 'image' = 'text', fileData?: any) => {
    if (!userId || !partnerId || (!content.trim() && type === 'text')) return

    try {
      const messageData = await sendChatMessage(userId, partnerId, content, type)
      
      // If it's a file, you might want to handle file upload here
      if (type !== 'text' && fileData) {
        // Handle file upload logic
      }

      return messageData
    } catch (error) {
      console.error('Error sending message:', error)
      throw error
    }
  }

  return {
    messages,
    loading,
    sendMessage,
    refresh: loadMessages
  }
}