"use client"

import { useState } from "react"
import { Send, Paperclip } from "lucide-react"

const mockMessages = [
  {
    id: 1,
    sender: "partner",
    name: "Jordan Smith",
    text: "Hey! How are you doing with the React hooks task?",
    time: "10:30 AM",
  },
  {
    id: 2,
    sender: "user",
    text: "Pretty good! I was stuck on custom hooks at first, but figured it out",
    time: "10:32 AM",
  },
  {
    id: 3,
    sender: "partner",
    name: "Jordan Smith",
    text: "Nice! Did you use the context API for state management?",
    time: "10:35 AM",
  },
  { id: 4, sender: "user", text: "Yeah, combined with useReducer. Much cleaner now!", time: "10:37 AM" },
  {
    id: 5,
    sender: "partner",
    name: "Jordan Smith",
    text: "Awesome! Let me know if you need help with the next one 💪",
    time: "10:40 AM",
  },
]

export default function ChatPage() {
  const [messages, setMessages] = useState(mockMessages)
  const [input, setInput] = useState("")

  const handleSend = () => {
    if (input.trim()) {
      setMessages([
        ...messages,
        {
          id: messages.length + 1,
          sender: "user",
          text: input,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ])
      setInput("")
    }
  }

  return (
    <div className="p-4 md:p-8 max-w-3xl h-screen flex flex-col">
      {/* Header */}
      <div className="mb-6 pb-6 border-b border-border">
        <h1 className="text-3xl font-bold mb-1">Chat with Jordan Smith</h1>
        <p className="text-foreground/60">Your Accountability Partner</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-6">
        {messages.map((msg, i) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} animate-slideInUp`}
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-lg ${
                msg.sender === "user"
                  ? "bg-gradient-to-r from-primary to-accent text-primary-foreground"
                  : "bg-card border border-border"
              }`}
            >
              {msg.sender === "partner" && <p className="text-xs font-semibold mb-1 opacity-70">{msg.name}</p>}
              <p className="text-sm">{msg.text}</p>
              <p className="text-xs opacity-60 mt-1">{msg.time}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <button className="p-3 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors">
          <Paperclip className="w-5 h-5" />
        </button>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type a message..."
          className="flex-1 px-4 py-3 rounded-lg bg-card border border-border text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary transition-colors"
        />
        <button
          onClick={handleSend}
          className="p-3 rounded-lg bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:shadow-lg hover:shadow-primary/50 transition-all"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
