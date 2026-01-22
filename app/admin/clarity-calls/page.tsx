"use client"

import { useState, useEffect } from "react"
import { Calendar, Clock, MessageSquare, User, CheckCircle2, AlertCircle, ExternalLink, Filter } from "lucide-react"
import { useAuth } from "@/lib/hooks/useAuth"
import { getAllClarityRequests, updateClarityCallRequest } from "@/lib/data"

export default function AdminClarityCallsPage() {
  const { user, loading: authLoading } = useAuth()
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterTrack, setFilterTrack] = useState("all")
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [scheduleForm, setScheduleForm] = useState({
    date: "",
    time: "",
    meetingLink: "",
    mentorNotes: ""
  })

  useEffect(() => {
    async function loadRequests() {
      if (!user?.id) return
      
      try {
        const requestsData = await getAllClarityRequests()
        
        // Transform requests to match expected structure
        const transformedRequests = requestsData.map((request: any) => ({
          id: request.id,
          studentName: request.student?.full_name || 'Unknown Student',
          studentEmail: request.student?.email || 'No email',
          track: 'Unknown Track', // TODO: Get from student enrollment
          cohort: 'Unknown Cohort', // TODO: Get from student enrollment
          topic: request.topic,
          week: request.week?.week_number || 0,
          weekTitle: request.week?.title || 'Unknown Week',
          preferredDate: request.preferred_date?.split('T')[0] || '',
          preferredTime: request.preferred_time || '',
          status: request.status,
          scheduledDate: request.scheduled_date,
          meetingLink: request.meeting_link,
          notes: request.notes,
          createdAt: request.created_at,
          mentorNotes: request.mentor_notes,
          feedback: request.feedback
        }))
        
        setRequests(transformedRequests)
      } catch (error) {
        console.error('Error loading clarity requests:', error)
        setRequests([])
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading && user) {
      loadRequests()
    }
  }, [user, authLoading])

  const filteredRequests = requests.filter(request => {
    const matchesStatus = filterStatus === "all" || request.status === filterStatus
    const matchesTrack = filterTrack === "all" || request.track.toLowerCase() === filterTrack
    return matchesStatus && matchesTrack
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Calendar className="w-5 h-5 text-primary" />
      case "pending":
        return <Clock className="w-5 h-5 text-secondary" />
      case "completed":
        return <CheckCircle2 className="w-5 h-5 text-accent" />
      case "rejected":
        return <AlertCircle className="w-5 h-5 text-muted-foreground" />
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
      case "rejected":
        return "bg-muted/20 border-muted"
      default:
        return "bg-muted/20 border-muted"
    }
  }

  const handleSchedule = (request: any) => {
    setSelectedRequest(request)
    setScheduleForm({
      date: request.preferredDate,
      time: request.preferredTime,
      meetingLink: "",
      mentorNotes: ""
    })
    setShowScheduleModal(true)
  }

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRequest || !user?.id) return
    
    try {
      const scheduledDateTime = new Date(`${scheduleForm.date}T${scheduleForm.time}:00Z`).toISOString()
      
      await updateClarityCallRequest(selectedRequest.id, {
        status: 'scheduled',
        scheduled_date: scheduledDateTime,
        meeting_link: scheduleForm.meetingLink,
        mentor_notes: scheduleForm.mentorNotes
      })
      
      // Update local state
      setRequests(prev => prev.map(req => 
        req.id === selectedRequest.id 
          ? { 
              ...req, 
              status: 'scheduled',
              scheduledDate: scheduledDateTime,
              meetingLink: scheduleForm.meetingLink,
              mentorNotes: scheduleForm.mentorNotes
            }
          : req
      ))
      
      setShowScheduleModal(false)
      setSelectedRequest(null)
      setScheduleForm({ date: "", time: "", meetingLink: "", mentorNotes: "" })
    } catch (error) {
      console.error('Error scheduling clarity call:', error)
      alert('Failed to schedule clarity call')
    }
  }

  const handleReject = async (requestId: number) => {
    if (confirm("Are you sure you want to reject this clarity call request?")) {
      try {
        await updateClarityCallRequest(requestId.toString(), {
          status: 'rejected',
          mentor_notes: 'Request rejected by admin'
        })
        
        // Update local state
        setRequests(prev => prev.map(req => 
          req.id === requestId 
            ? { ...req, status: 'rejected' }
            : req
        ))
      } catch (error) {
        console.error('Error rejecting request:', error)
        alert('Failed to reject request')
      }
    }
  }

  const handleComplete = async (requestId: number) => {
    try {
      await updateClarityCallRequest(requestId.toString(), {
        status: 'completed'
      })
      
      // Update local state
      setRequests(prev => prev.map(req => 
        req.id === requestId 
          ? { ...req, status: 'completed' }
          : req
      ))
    } catch (error) {
      console.error('Error completing request:', error)
      alert('Failed to mark request as completed')
    }
  }

  const statusCounts = {
    all: requests.length,
    pending: requests.filter(r => r.status === "pending").length,
    scheduled: requests.filter(r => r.status === "scheduled").length,
    completed: requests.filter(r => r.status === "completed").length,
    rejected: requests.filter(r => r.status === "rejected").length
  }

  if (authLoading || loading) {
    return (
      <div className="p-4 md:p-8 max-w-7xl">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8 animate-slideInUp">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Clarity Call Requests</h1>
        <p className="text-foreground/60">Manage student requests for one-on-one mentoring sessions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {Object.entries(statusCounts).map(([status, count]) => (
          <div key={status} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-sm text-foreground/60 capitalize">{status}</p>
              </div>
              {getStatusIcon(status)}
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-foreground/60" />
          <span className="text-sm font-medium">Filters:</span>
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="scheduled">Scheduled</option>
          <option value="completed">Completed</option>
          <option value="rejected">Rejected</option>
        </select>
        <select
          value={filterTrack}
          onChange={(e) => setFilterTrack(e.target.value)}
          className="px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">All Tracks</option>
          <option value="frontend">Frontend</option>
          <option value="backend">Backend</option>
          <option value="devops">DevOps</option>
          <option value="data">Data/AI</option>
          <option value="web3">Web3</option>
        </select>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No requests found</h3>
            <p className="text-foreground/60">No clarity call requests match your current filters</p>
          </div>
        ) : (
          filteredRequests.map(request => (
            <div
              key={request.id}
              className={`p-6 rounded-lg border ${getStatusColor(request.status)}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  {getStatusIcon(request.status)}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{request.topic}</h3>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full capitalize ${
                        request.status === "scheduled" ? "bg-primary/10 text-primary" :
                        request.status === "pending" ? "bg-secondary/10 text-secondary" :
                        request.status === "completed" ? "bg-accent/10 text-accent" :
                        "bg-muted/20 text-muted-foreground"
                      }`}>
                        {request.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                      <div>
                        <span className="font-medium">Student:</span>
                        <p className="text-foreground/80">{request.studentName} ({request.studentEmail})</p>
                      </div>
                      <div>
                        <span className="font-medium">Track & Cohort:</span>
                        <p className="text-foreground/80">{request.track} - {request.cohort}</p>
                      </div>
                      <div>
                        <span className="font-medium">Related Week:</span>
                        <p className="text-foreground/80">Week {request.week}: {request.weekTitle}</p>
                      </div>
                      <div>
                        <span className="font-medium">Preferred Time:</span>
                        <p className="text-foreground/80">
                          {new Date(request.preferredDate).toLocaleDateString()} at {request.preferredTime}
                        </p>
                      </div>
                    </div>

                    {request.notes && (
                      <div className="mb-4">
                        <span className="font-medium text-sm">Student Notes:</span>
                        <p className="text-foreground/80 mt-1">{request.notes}</p>
                      </div>
                    )}

                    {request.mentorNotes && (
                      <div className="mb-4">
                        <span className="font-medium text-sm">Mentor Notes:</span>
                        <p className="text-foreground/80 mt-1">{request.mentorNotes}</p>
                      </div>
                    )}

                    {request.status === "scheduled" && request.scheduledDate && (
                      <div className="mb-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-medium text-sm">Scheduled:</span>
                            <p className="text-foreground/80">
                              {new Date(request.scheduledDate).toLocaleDateString()} at{" "}
                              {new Date(request.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          {request.meetingLink && (
                            <a
                              href={request.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-3 py-1 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm"
                            >
                              Join Meeting <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                    {request.status === "completed" && request.feedback && (
                      <div className="mb-4 p-3 bg-accent/5 border border-accent/20 rounded-lg">
                        <span className="font-medium text-sm">Student Feedback:</span>
                        <p className="text-foreground/80 mt-1">{request.feedback}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {request.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleSchedule(request)}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm"
                      >
                        Schedule
                      </button>
                      <button
                        onClick={() => handleReject(request.id)}
                        className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors text-sm"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {request.status === "scheduled" && (
                    <button
                      onClick={() => handleComplete(request.id)}
                      className="px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors text-sm"
                    >
                      Mark Complete
                    </button>
                  )}
                </div>
              </div>

              <div className="text-xs text-foreground/60 border-t border-border pt-3">
                Submitted: {new Date(request.createdAt).toLocaleDateString()} at{" "}
                {new Date(request.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Schedule Clarity Call</h2>
            <p className="text-sm text-foreground/60 mb-4">
              Scheduling call with {selectedRequest.studentName} about "{selectedRequest.topic}"
            </p>
            
            <form onSubmit={handleScheduleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium mb-2">Date *</label>
                  <input
                    type="date"
                    value={scheduleForm.date}
                    onChange={(e) => setScheduleForm(prev => ({ ...prev, date: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block font-medium mb-2">Time *</label>
                  <input
                    type="time"
                    value={scheduleForm.time}
                    onChange={(e) => setScheduleForm(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium mb-2">Meeting Link *</label>
                <input
                  type="url"
                  value={scheduleForm.meetingLink}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, meetingLink: e.target.value }))}
                  placeholder="https://meet.google.com/..."
                  className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block font-medium mb-2">Mentor Notes</label>
                <textarea
                  value={scheduleForm.mentorNotes}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, mentorNotes: e.target.value }))}
                  placeholder="Any notes about the scheduled session..."
                  className="w-full p-3 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowScheduleModal(false)
                    setSelectedRequest(null)
                  }}
                  className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Schedule Call
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}