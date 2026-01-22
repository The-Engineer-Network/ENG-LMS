"use client"

import { useState } from "react"
import { Calendar, Clock, MessageSquare, Plus, CheckCircle2, AlertCircle } from "lucide-react"

const mockClarityRequests = [
  {
    id: 1,
    topic: "Understanding React Hooks",
    week: 1,
    weekTitle: "React Fundamentals",
    preferredDate: "2024-02-20",
    preferredTime: "14:00",
    status: "scheduled",
    scheduledDate: "2024-02-20T14:00:00Z",
    meetingLink: "https://meet.google.com/abc-defg-hij",
    notes: "I'm having trouble understanding useEffect dependencies and when to use cleanup functions.",
    createdAt: "2024-02-15T10:30:00Z"
  },
  {
    id: 2,
    topic: "State Management Best Practices",
    week: 2,
    weekTitle: "State Management",
    preferredDate: "2024-02-25",
    preferredTime: "15:30",
    status: "pending",
    notes: "Need clarification on when to use Context vs local state vs external state management.",
    createdAt: "2024-02-22T09:15:00Z"
  },
  {
    id: 3,
    topic: "Component Composition Patterns",
    week: 3,
    weekTitle: "Component Composition",
    preferredDate: "2024-03-05",
    preferredTime: "16:00",
    status: "completed",
    scheduledDate: "2024-03-01T16:00:00Z",
    notes: "Questions about render props vs compound components and when to use each pattern.",
    createdAt: "2024-02-28T11:45:00Z",
    feedback: "Great session! The examples really helped clarify the differences between patterns."
  }
]

const mockWeeks = [
  { id: 1, title: "React Fundamentals" },
  { id: 2, title: "State Management" },
  { id: 3, title: "Component Composition" },
  { id: 4, title: "API Integration" },
  { id: 5, title: "Testing & Performance" },
  { id: 6, title: "Deployment & Production" }
]

export default function ClarityCallsPage() {
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [formData, setFormData] = useState({
    topic: "",
    week: "",
    preferredDate: "",
    preferredTime: "",
    notes: ""
  })
  const [loading, setLoading] = useState(false)

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    console.log("Submitting clarity call request:", formData)
    
    // Reset form
    setFormData({
      topic: "",
      week: "",
      preferredDate: "",
      preferredTime: "",
      notes: ""
    })
    setShowRequestForm(false)
    setLoading(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Calendar className="w-5 h-5 text-primary" />
      case "pending":
        return <Clock className="w-5 h-5 text-secondary" />
      case "completed":
        return <CheckCircle2 className="w-5 h-5 text-accent" />
      default:
        return <AlertCircle className="w-5 h-5 text-muted-foreground" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-primary/5 border-primary/20"
      case "pending":
        return "bg-secondary/5 border-secondary/20"
      case "completed":
        return "bg-accent/5 border-accent/20"
      default:
        return "bg-muted/20 border-muted"
    }
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8 animate-slideInUp">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Clarity Calls</h1>
            <p className="text-foreground/60">Request one-on-one sessions with your mentor</p>
          </div>
          <button
            onClick={() => setShowRequestForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Request Call
          </button>
        </div>
      </div>

      {/* Request Form Modal */}
      {showRequestForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Request Clarity Call</h2>
            
            <form onSubmit={handleSubmitRequest} className="space-y-4">
              <div>
                <label className="block font-medium mb-2">Topic *</label>
                <input
                  type="text"
                  value={formData.topic}
                  onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
                  placeholder="What would you like to discuss?"
                  className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block font-medium mb-2">Related Week *</label>
                <select
                  value={formData.week}
                  onChange={(e) => setFormData(prev => ({ ...prev, week: e.target.value }))}
                  className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="">Select a week</option>
                  {mockWeeks.map(week => (
                    <option key={week.id} value={week.id}>
                      Week {week.id}: {week.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium mb-2">Preferred Date *</label>
                  <input
                    type="date"
                    value={formData.preferredDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, preferredDate: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block font-medium mb-2">Preferred Time *</label>
                  <input
                    type="time"
                    value={formData.preferredTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, preferredTime: e.target.value }))}
                    className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium mb-2">Additional Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Provide more context about what you'd like to discuss..."
                  className="w-full p-3 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowRequestForm(false)}
                  className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  {loading ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Requests List */}
      <div className="space-y-4">
        {mockClarityRequests.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No clarity calls yet</h3>
            <p className="text-foreground/60 mb-4">Request a one-on-one session with your mentor when you need help</p>
            <button
              onClick={() => setShowRequestForm(true)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Request Your First Call
            </button>
          </div>
        ) : (
          mockClarityRequests.map(request => (
            <div
              key={request.id}
              className={`p-6 rounded-lg border ${getStatusColor(request.status)}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  {getStatusIcon(request.status)}
                  <div>
                    <h3 className="font-semibold text-lg">{request.topic}</h3>
                    <p className="text-sm text-foreground/60">
                      Week {request.week}: {request.weekTitle}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 text-xs font-medium rounded-full capitalize ${
                  request.status === "scheduled" ? "bg-primary/10 text-primary" :
                  request.status === "pending" ? "bg-secondary/10 text-secondary" :
                  "bg-accent/10 text-accent"
                }`}>
                  {request.status}
                </span>
              </div>

              {request.notes && (
                <div className="mb-4">
                  <p className="text-foreground/80">{request.notes}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Requested:</span>
                  <p className="text-foreground/70">
                    {new Date(request.preferredDate).toLocaleDateString()} at {request.preferredTime}
                  </p>
                </div>

                {request.status === "scheduled" && request.scheduledDate && (
                  <div>
                    <span className="font-medium">Scheduled:</span>
                    <p className="text-foreground/70">
                      {new Date(request.scheduledDate).toLocaleDateString()} at{" "}
                      {new Date(request.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                )}

                <div>
                  <span className="font-medium">Submitted:</span>
                  <p className="text-foreground/70">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {request.status === "scheduled" && request.meetingLink && (
                <div className="mt-4 pt-4 border-t border-border">
                  <a
                    href={request.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <Calendar className="w-4 h-4" />
                    Join Meeting
                  </a>
                </div>
              )}

              {request.status === "completed" && request.feedback && (
                <div className="mt-4 pt-4 border-t border-border">
                  <span className="font-medium text-sm">Your Feedback:</span>
                  <p className="text-foreground/80 mt-1">{request.feedback}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}