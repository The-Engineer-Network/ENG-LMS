"use client"

import { useState } from "react"
import { CheckCircle2, Clock, AlertCircle, MessageSquare, ExternalLink, Eye, ThumbsUp, ThumbsDown, Filter } from "lucide-react"
import Link from "next/link"

const mockSubmissions = [
  {
    id: 1,
    student: { name: "Alex Johnson", email: "alex@example.com", track: "Frontend", cohort: "Cohort 1" },
    assignment: {
      id: 1,
      title: "Build a Counter Component",
      week: 1,
      weekTitle: "React Fundamentals"
    },
    submission: {
      github: "https://github.com/alex/react-counter",
      demo: "https://react-counter-demo.vercel.app",
      notes: "Implemented with TypeScript and added bonus features like step increment"
    },
    status: "pending",
    submittedDate: "2024-02-20T14:30:00Z",
    reviewedBy: null,
    reviewedDate: null,
    feedback: null,
    grade: null
  },
  {
    id: 2,
    student: { name: "Sarah Chen", email: "sarah@example.com", track: "Frontend", cohort: "Cohort 1" },
    assignment: {
      id: 2,
      title: "Theme Context Provider",
      week: 2,
      weekTitle: "State Management"
    },
    submission: {
      github: "https://github.com/sarah/theme-provider",
      demo: "https://theme-provider-demo.vercel.app",
      notes: "Added smooth transitions and localStorage persistence"
    },
    status: "in_review",
    submittedDate: "2024-02-19T16:45:00Z",
    reviewedBy: "John Doe",
    reviewedDate: null,
    feedback: null,
    grade: null
  },
  {
    id: 3,
    student: { name: "Mike Johnson", email: "mike@example.com", track: "Backend", cohort: "Cohort 2" },
    assignment: {
      id: 3,
      title: "REST API with Authentication",
      week: 3,
      weekTitle: "API Development"
    },
    submission: {
      github: "https://github.com/mike/auth-api",
      demo: "https://auth-api-demo.herokuapp.com",
      notes: "Implemented JWT authentication with refresh tokens"
    },
    status: "needs_changes",
    submittedDate: "2024-02-18T10:20:00Z",
    reviewedBy: "Jane Smith",
    reviewedDate: "2024-02-19T09:30:00Z",
    feedback: "Good implementation overall, but please add input validation for the registration endpoint and improve error handling.",
    grade: null
  },
  {
    id: 4,
    student: { name: "Emily Davis", email: "emily@example.com", track: "DevOps", cohort: "Cohort 1" },
    assignment: {
      id: 4,
      title: "CI/CD Pipeline Setup",
      week: 4,
      weekTitle: "Deployment Automation"
    },
    submission: {
      github: "https://github.com/emily/cicd-pipeline",
      demo: "https://cicd-demo.netlify.app",
      notes: "Set up GitHub Actions with automated testing and deployment"
    },
    status: "approved",
    submittedDate: "2024-02-17T13:15:00Z",
    reviewedBy: "John Doe",
    reviewedDate: "2024-02-18T11:00:00Z",
    feedback: "Excellent work! The pipeline is well-structured and includes proper testing stages. Great documentation too.",
    grade: "A"
  },
  {
    id: 5,
    student: { name: "Jordan Smith", email: "jordan@example.com", track: "Frontend", cohort: "Cohort 1" },
    assignment: {
      id: 5,
      title: "Reusable Modal Component",
      week: 3,
      weekTitle: "Component Composition"
    },
    submission: {
      github: "https://github.com/jordan/modal-component",
      demo: "https://modal-demo.vercel.app",
      notes: "Used compound component pattern with proper accessibility features"
    },
    status: "in_review",
    submittedDate: "2024-02-16T09:30:00Z",
    reviewedBy: "Jane Smith",
    reviewedDate: null,
    feedback: null,
    grade: null
  }
]

export default function SubmissionsPage() {
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterTrack, setFilterTrack] = useState("all")
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewForm, setReviewForm] = useState({
    status: "",
    feedback: "",
    grade: ""
  })

  const filteredSubmissions = mockSubmissions.filter(sub => {
    const matchesStatus = filterStatus === "all" || sub.status === filterStatus
    const matchesTrack = filterTrack === "all" || sub.student.track.toLowerCase() === filterTrack
    return matchesStatus && matchesTrack
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-5 h-5 text-secondary" />
      case "in_review":
        return <Eye className="w-5 h-5 text-primary" />
      case "needs_changes":
        return <AlertCircle className="w-5 h-5 text-accent" />
      case "approved":
        return <CheckCircle2 className="w-5 h-5 text-primary" />
      default:
        return <Clock className="w-5 h-5 text-muted-foreground" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-secondary/5 border-secondary/20"
      case "in_review":
        return "bg-primary/5 border-primary/20"
      case "needs_changes":
        return "bg-accent/5 border-accent/20"
      case "approved":
        return "bg-primary/5 border-primary/20"
      default:
        return "bg-muted/20 border-muted"
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-secondary/10 text-secondary"
      case "in_review":
        return "bg-primary/10 text-primary"
      case "needs_changes":
        return "bg-accent/10 text-accent"
      case "approved":
        return "bg-primary/10 text-primary"
      default:
        return "bg-muted/20 text-muted-foreground"
    }
  }

  const formatStatus = (status: string) => {
    return status.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())
  }

  const handleReview = (submission: any) => {
    setSelectedSubmission(submission)
    setReviewForm({
      status: submission.status === "pending" ? "in_review" : submission.status,
      feedback: submission.feedback || "",
      grade: submission.grade || ""
    })
    setShowReviewModal(true)
  }

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Submitting review:", {
      submissionId: selectedSubmission.id,
      ...reviewForm
    })
    
    setShowReviewModal(false)
    setSelectedSubmission(null)
    setReviewForm({ status: "", feedback: "", grade: "" })
  }

  const handleQuickAction = async (submissionId: number, action: "approve" | "reject") => {
    console.log(`Quick ${action} for submission:`, submissionId)
  }

  const statusCounts = {
    all: mockSubmissions.length,
    pending: mockSubmissions.filter(s => s.status === "pending").length,
    in_review: mockSubmissions.filter(s => s.status === "in_review").length,
    needs_changes: mockSubmissions.filter(s => s.status === "needs_changes").length,
    approved: mockSubmissions.filter(s => s.status === "approved").length
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8 animate-slideInUp">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Submissions Review</h1>
        <p className="text-foreground/60">Review and approve student assignment submissions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {Object.entries(statusCounts).map(([status, count]) => (
          <div key={status} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-sm text-foreground/60">{formatStatus(status)}</p>
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
          <option value="in_review">In Review</option>
          <option value="needs_changes">Needs Changes</option>
          <option value="approved">Approved</option>
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

      {/* Submissions List */}
      <div className="space-y-4">
        {filteredSubmissions.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No submissions found</h3>
            <p className="text-foreground/60">No submissions match your current filters</p>
          </div>
        ) : (
          filteredSubmissions.map((submission, i) => (
            <div
              key={submission.id}
              className={`p-6 rounded-lg border ${getStatusColor(submission.status)} animate-fadeInScale`}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4 flex-1">
                  {getStatusIcon(submission.status)}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{submission.assignment.title}</h3>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(submission.status)}`}>
                        {formatStatus(submission.status)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                      <div>
                        <span className="font-medium">Student:</span>
                        <p className="text-foreground/80">{submission.student.name} ({submission.student.email})</p>
                      </div>
                      <div>
                        <span className="font-medium">Track & Cohort:</span>
                        <p className="text-foreground/80">{submission.student.track} - {submission.student.cohort}</p>
                      </div>
                      <div>
                        <span className="font-medium">Assignment:</span>
                        <p className="text-foreground/80">Week {submission.assignment.week}: {submission.assignment.weekTitle}</p>
                      </div>
                      <div>
                        <span className="font-medium">Submitted:</span>
                        <p className="text-foreground/80">{new Date(submission.submittedDate).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {/* Submission Links */}
                    <div className="mb-4">
                      <span className="font-medium text-sm">Submission:</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {submission.submission.github && (
                          <a
                            href={submission.submission.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors text-sm"
                          >
                            GitHub <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        {submission.submission.demo && (
                          <a
                            href={submission.submission.demo}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm"
                          >
                            Live Demo <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      {submission.submission.notes && (
                        <div className="mt-2">
                          <span className="font-medium text-sm">Notes:</span>
                          <p className="text-foreground/80 text-sm mt-1">{submission.submission.notes}</p>
                        </div>
                      )}
                    </div>

                    {/* Review Info */}
                    {submission.reviewedBy && (
                      <div className="mb-4 p-3 bg-muted rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">Reviewed by: {submission.reviewedBy}</span>
                          {submission.reviewedDate && (
                            <span className="text-xs text-foreground/60">
                              {new Date(submission.reviewedDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        {submission.feedback && (
                          <p className="text-foreground/80 text-sm">{submission.feedback}</p>
                        )}
                        {submission.grade && (
                          <div className="mt-2">
                            <span className="font-medium text-sm">Grade: </span>
                            <span className="px-2 py-1 bg-primary text-primary-foreground rounded text-sm">
                              {submission.grade}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <button
                    onClick={() => handleReview(submission)}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm"
                  >
                    Review
                  </button>
                  {submission.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleQuickAction(submission.id, "approve")}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm"
                      >
                        <ThumbsUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleQuickAction(submission.id, "reject")}
                        className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors text-sm"
                      >
                        <ThumbsDown className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Review Submission</h2>
            <div className="mb-4 p-4 bg-muted rounded-lg">
              <h3 className="font-medium">{selectedSubmission.assignment.title}</h3>
              <p className="text-sm text-foreground/60">by {selectedSubmission.student.name}</p>
            </div>
            
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block font-medium mb-2">Status *</label>
                <select
                  value={reviewForm.status}
                  onChange={(e) => setReviewForm(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="">Select status</option>
                  <option value="in_review">In Review</option>
                  <option value="approved">Approved</option>
                  <option value="needs_changes">Needs Changes</option>
                </select>
              </div>

              <div>
                <label className="block font-medium mb-2">Feedback</label>
                <textarea
                  value={reviewForm.feedback}
                  onChange={(e) => setReviewForm(prev => ({ ...prev, feedback: e.target.value }))}
                  placeholder="Provide feedback to the student..."
                  className="w-full p-3 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={4}
                />
              </div>

              <div>
                <label className="block font-medium mb-2">Grade (Optional)</label>
                <select
                  value={reviewForm.grade}
                  onChange={(e) => setReviewForm(prev => ({ ...prev, grade: e.target.value }))}
                  className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">No grade</option>
                  <option value="A">A - Excellent</option>
                  <option value="B">B - Good</option>
                  <option value="C">C - Satisfactory</option>
                  <option value="D">D - Needs Improvement</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowReviewModal(false)
                    setSelectedSubmission(null)
                  }}
                  className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
