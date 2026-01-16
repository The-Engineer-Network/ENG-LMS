"use client"

import type React from "react"

import { useState } from "react"
import { Phone, Calendar, Send } from "lucide-react"

const mockClarityCalls = [
  {
    id: 1,
    week: 2,
    topic: "Understanding useContext vs Redux",
    status: "Scheduled",
    preferredTime: "Wed, 7 PM",
    createdDate: "2024-02-15",
  },
  {
    id: 2,
    week: 3,
    topic: "API integration best practices",
    status: "Pending",
    preferredTime: "Sat, 3 PM",
    createdDate: "2024-02-18",
  },
]

export default function ClarityCallsPage() {
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    week: "1",
    topic: "",
    preferredTime: "",
  })
  const [calls, setCalls] = useState(mockClarityCalls)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.topic.trim() && formData.preferredTime.trim()) {
      setCalls([
        ...calls,
        {
          id: calls.length + 1,
          week: Number.parseInt(formData.week),
          topic: formData.topic,
          status: "Pending",
          preferredTime: formData.preferredTime,
          createdDate: new Date().toLocaleDateString(),
        },
      ])
      setFormData({ week: "1", topic: "", preferredTime: "" })
      setShowForm(false)
    }
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8 animate-slideInUp">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Clarity Calls</h1>
        <p className="text-foreground/60">Request one-on-one clarity calls when you need help</p>
      </div>

      {/* Request Call Button */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="mb-8 px-6 py-3 rounded-lg bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold hover:shadow-lg hover:shadow-primary/50 transition-all animate-slideInUp"
      >
        <Phone className="inline w-5 h-5 mr-2" />
        Request Clarity Call
      </button>

      {/* Request Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-8 p-6 rounded-xl bg-card border border-border animate-slideInUp space-y-4"
        >
          {/* Week Select */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Week <span className="text-accent">*</span>
            </label>
            <select
              value={formData.week}
              onChange={(e) => setFormData({ ...formData, week: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:border-primary transition-colors"
            >
              {[1, 2, 3, 4, 5, 6].map((w) => (
                <option key={w} value={w}>
                  Week {w}
                </option>
              ))}
            </select>
          </div>

          {/* Topic */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Topic <span className="text-accent">*</span>
            </label>
            <textarea
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              placeholder="What topic or area are you struggling with?"
              className="w-full h-20 px-4 py-2 rounded-lg bg-background border border-border text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary transition-colors resize-none"
              required
            />
          </div>

          {/* Preferred Time */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Preferred Time <span className="text-accent">*</span>
            </label>
            <input
              type="text"
              value={formData.preferredTime}
              onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
              placeholder="e.g., Mon 6 PM, Sat 3 PM"
              className="w-full px-4 py-2 rounded-lg bg-background border border-border text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary transition-colors"
              required
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              Request Call
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 px-4 py-2 rounded-lg bg-background border border-border text-foreground font-semibold hover:bg-card transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Clarity Calls List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold mb-4">Your Requests</h2>
        {calls.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-card border border-border/50">
            <p className="text-foreground/60">No clarity calls requested yet</p>
          </div>
        ) : (
          calls.map((call, i) => (
            <div
              key={call.id}
              className="p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all animate-fadeInScale"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-lg mb-1">
                    Week {call.week}: {call.topic}
                  </h3>
                  <div className="flex gap-2 items-center text-sm text-foreground/60">
                    <Calendar className="w-4 h-4" />
                    <span>{call.preferredTime}</span>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    call.status === "Scheduled" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"
                  }`}
                >
                  {call.status}
                </span>
              </div>
              <p className="text-xs text-foreground/40">Requested: {call.createdDate}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
