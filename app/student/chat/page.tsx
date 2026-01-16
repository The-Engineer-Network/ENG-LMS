"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Paperclip, Image as ImageIcon, X, ArrowLeft } from "lucide-react"
import Image from "next/image"

// Mock data for accountability partner
const mockAccountabilityPartner = {
  id: 1,
  name: "Sarah Chen",
  email: "sarah@example.com",
  avatar: "/placeholder-user.jpg",
  track: "Frontend Development",
  cohort: "Cohort 1",
  online: true,
  lastSeen: "2024-02-20T15:30:00Z"
}

const mockMessages = [
  {
    id: 1,
    senderId: 1,
    senderName: "Sarah Chen",
    content: "Hey! How's your React component assignment going?",
    timestamp: "2024-02-20T14:30:00Z",
    type: "text"
  },
  {
    id: 2,
    senderId: "current-user",
    senderName: "You",
    content: "Going well! I'm working on the state management part. Having some trouble with useEffect though.",
    timestamp: "2024-02-20T14:32:00Z",
    type: "text"
  },
  {
    id: 3,
    senderId: 1,
    senderName: "Sarah Chen",
    content: "Oh I had the same issue! The dependency array is tricky. Want to hop on a quick call to go through it?",
    timestamp: "2024-02-20T14:35:00Z",
    type: "text"
  },
  {
    id: 4,
    senderId: "current-user",
    senderName: "You",
    content: "That would be amazing! I'm free now if you are.",
    timestamp: "2024-02-20T14:36:00Z",
    type: "text"
  },
  {
    id: 5,
    senderId: 1,
    senderName: "Sarah Chen",
    content: "Perfect! Let me set up a quick Zoom room. I'll send the link in a sec.",
    timestamp: "2024-02-20T14:37:00Z",
    type: "text"
  },
  {
    id: 6,
    senderId: "current-user",
    senderName: "You",
    content: "Here's my component code so far",
    timestamp: "2024-02-20T14:40:00Z",
    type: "file",
    fileName: "Counter.tsx",
    fileSize: "2.1 KB"
  },
  {
    id: 7,
    senderId: 1,
    senderName: "Sarah Chen",
    content: "Let me show you the error I was getting",
    timestamp: "2024-02-20T14:42:00Z",
    type: "image",
    fileName: "error-screenshot.png",
    imageUrl: "/placeholder.jpg"
  }
]

export default function ChatPage() {
  const [newMessage, setNewMessage] = useState("")
  const [showMobileChat, setShowMobileChat] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() && selectedFiles.length === 0) return

    console.log("Sending message:", {
      partnerId: mockAccountabilityPartner.id,
      content: newMessage,
      files: selectedFiles,
      type: selectedFiles.length > 0 ? "file" : "text"
    })

    setNewMessage("")
    setSelectedFiles([])
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
          {mockMessages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.senderId === "current-user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] rounded-lg px-4 py-2 ${
                  message.senderId === "current-user"
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
                      <p className="text-sm font-medium">{message.fileName}</p>
                      <p className="text-xs opacity-70">{message.fileSize}</p>
                    </div>
                  </div>
                )}
                
                {message.type === "image" && (
                  <div>
                    <Image
                      src={message.imageUrl || "/placeholder.jpg"}
                      alt={message.fileName || "Shared image"}
                      width={200}
                      height={150}
                      className="rounded-lg mb-2"
                    />
                    <p className="text-xs opacity-70">{message.fileName}</p>
                  </div>
                )}
                
                <p className={`text-xs mt-1 ${
                  message.senderId === "current-user" 
                    ? "text-primary-foreground/70" 
                    : "text-muted-foreground"
                }`}>
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          ))}
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
              disabled={!newMessage.trim() && selectedFiles.length === 0}
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