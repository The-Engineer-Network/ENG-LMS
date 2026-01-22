"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Paperclip, Image as ImageIcon, X, ArrowLeft } from "lucide-react"
import Image from "next/image"
import { useAuth } from "@/lib/hooks/useAuth"
import { useChat } from "@/lib/hooks/useChat"
import { getAccountabilityPartner } from "@/lib/data"

export default function ChatPage() {
  const { user, loading: authLoading } = useAuth()
  const [newMessage, setNewMessage] = useState("")
  const [showMobileChat, setShowMobileChat] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [partner, setPartner] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Get partner ID for chat
  const partnerId = partner ? (partner.student1_id === user?.id ? partner.student2_id : partner.student1_id) : null
  
  // Use real-time chat hook
  const { messages, loading: chatLoading, sendMessage } = useChat(user?.id || '', partnerId || '')

  useEffect(() => {
    async function loadPartner() {
      if (!user?.id) return
      
      try {
        const partnerData = await getAccountabilityPartner(user.id)
        if (partnerData) {
          // Determine which student is the partner (not the current user)
          const isStudent1 = partnerData.student1_id === user.id
          const partnerProfile = isStudent1 ? partnerData.student2 : partnerData.student1
          
          // Transform to match expected structure
          const mockAccountabilityPartner = {
            id: partnerProfile?.id || 1,
            name: partnerProfile?.full_name || 'Partner',
            email: partnerProfile?.email || 'partner@example.com',
            avatar: partnerProfile?.profile_picture_url || "/placeholder-user.jpg",
            track: partnerData.track?.name || 'Development',
            cohort: (partnerData as any).cohort?.name || 'Cohort 1',
            online: true, // This would need real presence detection
            lastSeen: new Date().toISOString()
          }
          setPartner({ ...partnerData, ...mockAccountabilityPartner })
        }
      } catch (error) {
        console.error('Error loading partner:', error)
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading && user) {
      loadPartner()
    }
  }, [user, authLoading])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() && selectedFiles.length === 0) return
    if (!partnerId) return

    try {
      await sendMessage(newMessage, selectedFiles.length > 0 ? "file" : "text")
      setNewMessage("")
      setSelectedFiles([])
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setSelectedFiles(prev => [...prev, ...files])
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  if (authLoading || loading) {
    return (
      <div className="h-[calc(100vh-4rem)] md:h-screen flex bg-background">
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-center">
            <div className="h-8 bg-muted rounded w-48 mb-4 mx-auto"></div>
            <div className="h-4 bg-muted rounded w-32 mx-auto"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!partner) {
    return (
      <div className="h-[calc(100vh-4rem)] md:h-screen flex bg-background">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">No Partner Assigned</h2>
            <p className="text-foreground/60">You need to be paired with an accountability partner to use chat.</p>
          </div>
        </div>
      </div>
    )
  }

  const mockAccountabilityPartner = partner

  return (
    <div className="h-[calc(100vh-4rem)] md:h-screen flex bg-background">
      {/* Partner Info Sidebar */}
      <div className={`w-full md:w-80 border-r border-border flex flex-col bg-card ${
        showMobileChat ? "hidden md:flex" : "flex"
      }`}>
        {/* Header */}
        <div className="p-4 border-b border-border">
          <h1 className="text-xl font-bold mb-4">Accountability Partner</h1>
        </div>

        {/* Partner Profile */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative">
              <Image
                src={mockAccountabilityPartner.avatar}
                alt={mockAccountabilityPartner.name}
                width={64}
                height={64}
                className="rounded-full border-2 border-border"
              />
              {mockAccountabilityPartner.online && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary border-2 border-background rounded-full" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-lg">{mockAccountabilityPartner.name}</h3>
              <p className="text-sm text-muted-foreground">{mockAccountabilityPartner.email}</p>
              <p className="text-sm text-muted-foreground">
                {mockAccountabilityPartner.online ? "Online" : "Offline"}
              </p>
            </div>
          </div>
          
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">Track:</span>
              <p className="text-muted-foreground">{mockAccountabilityPartner.track}</p>
            </div>
            <div>
              <span className="font-medium">Cohort:</span>
              <p className="text-muted-foreground">{mockAccountabilityPartner.cohort}</p>
            </div>
          </div>

          <button
            onClick={() => setShowMobileChat(true)}
            className="w-full mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors md:hidden"
          >
            Start Chat
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col ${
        showMobileChat ? "flex" : "hidden md:flex"
      }`}>
        {/* Chat Header */}
        <div className="p-4 border-b border-border bg-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowMobileChat(false)}
                className="md:hidden p-2 hover:bg-muted rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              
              <div className="relative">
                <Image
                  src={mockAccountabilityPartner.avatar}
                  alt={mockAccountabilityPartner.name}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                {mockAccountabilityPartner.online && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-primary border-2 border-background rounded-full" />
                )}
              </div>
              
              <div>
                <h2 className="font-semibold">{mockAccountabilityPartner.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {mockAccountabilityPartner.online ? "Online" : "Offline"}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-muted rounded-lg">
                <Paperclip className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chatLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-pulse text-foreground/60">Loading messages...</div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <p className="text-foreground/60 mb-2">No messages yet</p>
                <p className="text-sm text-foreground/40">Start a conversation with your accountability partner!</p>
              </div>
            </div>
          ) : (
            messages.map((message: any) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender_id === user?.id ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2 ${
                    message.sender_id === user?.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {message.type === "text" && (
                    <p className="text-sm">{message.content}</p>
                  )}
                  
                  {message.type === "file" && (
                    <div className="flex items-center gap-3 p-2 bg-background/10 rounded-lg">
                      <Paperclip className="w-4 h-4" />
                      <div>
                        <p className="text-sm font-medium">{message.file_name}</p>
                        <p className="text-xs opacity-70">{message.file_size ? formatFileSize(message.file_size) : 'File'}</p>
                      </div>
                    </div>
                  )}
                  
                  {message.type === "image" && (
                    <div>
                      <Image
                        src={message.image_url || "/placeholder.jpg"}
                        alt={message.file_name || "Shared image"}
                        width={200}
                        height={150}
                        className="rounded-lg mb-2"
                      />
                      <p className="text-xs opacity-70">{message.file_name}</p>
                    </div>
                  )}
                  
                  <p className={`text-xs mt-1 ${
                    message.sender_id === user?.id 
                      ? "text-primary-foreground/70" 
                      : "text-muted-foreground"
                  }`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-border bg-card">
          {/* Selected Files Preview */}
          {selectedFiles.length > 0 && (
            <div className="mb-3 space-y-2">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center gap-3 p-2 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 flex-1">
                    {file.type.startsWith('image/') ? (
                      <ImageIcon className="w-4 h-4 text-primary" />
                    ) : (
                      <Paperclip className="w-4 h-4 text-primary" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="p-1 hover:bg-background rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              multiple
              accept="image/*,.pdf,.doc,.docx,.txt,.js,.jsx,.ts,.tsx,.py,.java,.cpp,.c,.html,.css,.json,.xml"
              className="hidden"
            />
            
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <Paperclip className="w-5 h-5 text-muted-foreground" />
            </button>
            
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={`Message ${mockAccountabilityPartner.name}...`}
              className="flex-1 px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="submit"
              disabled={(!newMessage.trim() && selectedFiles.length === 0) || !partnerId}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}