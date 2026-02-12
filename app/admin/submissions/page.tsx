"use client"

import { useState, useEffect } from "react"
import { CheckCircle2, Clock, AlertCircle, MessageSquare, ExternalLink, Eye, ThumbsUp, ThumbsDown, Filter, Download, Square, CheckSquare } from "lucide-react"
import { useAuth } from "@/lib/hooks/useAuth"
import { useToast } from "@/components/ui/toast"
import { getTaskSubmissions, updateSubmissionReview, bulkUpdateSubmissions } from "@/lib/data"
import { logger } from "@/lib/logger"

export default function SubmissionsPage() {
  const { user, loading: authLoading } = useAuth()
  const { showToast } = useToast()
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterTrack, setFilterTrack] = useState("all")
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [selectedSubmissions, setSelectedSubmissions] = useState<string[]>([])
  const [bulkAction, setBulkAction] = useState("")
  const [bulkLoading, setBulkLoading] = useState(false)
  const [reviewForm, setReviewForm] = useState({
    status: "",
    feedback: "",
    grade: ""
  })

  useEffect(() => {
    async function loadSubmissions() {
      if (!user?.id) return
      
      try {
        const submissionsData = await getTaskSubmissions()
        logger.log('Raw submissions data:', submissionsData)
        
        // Use the data directly - it's already enriched
        setSubmissions(submissionsData)
      } catch (error) {
        logger.error('Error loading submissions:', error)
        setSubmissions([])
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading && user) {
      loadSubmissions()
    }
  }, [user, authLoading])

  const filteredSubmissions = submissions.filter(sub => {
    const matchesStatus = filterStatus === "all" || sub.status === filterStatus
    const trackName = sub.assignment?.week?.track?.name?.toLowerCase() || ''
    const matchesTrack = filterTrack === "all" || trackName.includes(filterTrack.toLowerCase())
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
    if (!selectedSubmission || !user?.id) return
    
    try {
      await updateSubmissionReview(selectedSubmission.id, {
        status: reviewForm.status as 'approved' | 'needs_changes' | 'in_review',
        feedback: reviewForm.feedback,
        grade: reviewForm.grade,
        reviewed_by: user.id
      })
      
      // Update local state
      setSubmissions(prev => prev.map(sub => 
        sub.id === selectedSubmission.id 
          ? { ...sub, status: reviewForm.status, feedback: reviewForm.feedback, grade: reviewForm.grade }
          : sub
      ))
      
      setShowReviewModal(false)
      setSelectedSubmission(null)
      setReviewForm({ status: "", feedback: "", grade: "" })
    } catch (error) {
      logger.error('Error submitting review:', error)
      alert('Failed to submit review')
    }
  }

  const handleQuickAction = async (submissionId: string, action: "approve" | "reject") => {
    if (!user?.id) return
    
    try {
      await updateSubmissionReview(submissionId, {
        status: action === "approve" ? "approved" : "needs_changes",
        feedback: action === "approve" ? "Approved" : "Needs changes",
        reviewed_by: user.id
      })
      
      // Update local state
      setSubmissions(prev => prev.map(sub => 
        sub.id === submissionId 
          ? { ...sub, status: action === "approve" ? "approved" : "needs_changes" }
          : sub
      ))
    } catch (error) {
      logger.error('Error with quick action:', error)
      alert('Failed to update submission')
    }
  }

  // Bulk Operations
  const handleSelectSubmission = (submissionId: string) => {
    setSelectedSubmissions(prev => 
      prev.includes(submissionId) 
        ? prev.filter(id => id !== submissionId)
        : [...prev, submissionId]
    )
  }

  const handleSelectAll = () => {
    if (selectedSubmissions.length === filteredSubmissions.length) {
      setSelectedSubmissions([])
    } else {
      setSelectedSubmissions(filteredSubmissions.map(sub => sub.id))
    }
  }

  const handleBulkAction = async () => {
    if (!bulkAction || selectedSubmissions.length === 0 || !user?.id) return
    
    setBulkLoading(true)
    try {
      const updates: any = {
        reviewed_by: user.id
      }
      
      if (bulkAction === 'approve') {
        updates.status = 'approved'
        updates.feedback = 'Bulk approved'
      } else if (bulkAction === 'reject') {
        updates.status = 'needs_changes'
        updates.feedback = 'Needs changes - bulk action'
      } else if (bulkAction === 'review') {
        updates.status = 'in_review'
        updates.feedback = 'Under review - bulk action'
      }
      
      // Call the bulk update function with correct parameters
      await bulkUpdateSubmissions(selectedSubmissions, bulkAction, user.id)
      
      // Update local state
      setSubmissions(prev => prev.map(sub => 
        selectedSubmissions.includes(sub.id) 
          ? { 
              ...sub, 
              status: updates.status,
              feedback: updates.feedback,
              reviewedBy: user.full_name || user.email,
              reviewedDate: new Date().toISOString().split('T')[0]
            }
          : sub
      ))
      
      setSelectedSubmissions([])
      setBulkAction("")
      
      showToast({
        type: 'success',
        title: 'Bulk Action Complete',
        message: `Successfully ${bulkAction}ed ${selectedSubmissions.length} submissions`
      })
    } catch (error) {
      logger.error('Bulk action failed:', error)
      showToast({
        type: 'error',
        title: 'Bulk Action Failed',
        message: 'Failed to update submissions. Please try again.'
      })
    } finally {
      setBulkLoading(false)
    }
  }

  const exportSubmissions = () => {
    const csvData = [
      ['Student', 'Email', 'Track', 'Assignment', 'Status', 'Submitted Date', 'GitHub', 'Demo'],
      ...filteredSubmissions.map(sub => [
        sub.student?.full_name || sub.student?.email || 'Unknown',
        sub.student?.email || '',
        sub.assignment?.week?.track?.name || 'Unknown',
        sub.assignment?.title || '',
        sub.status,
        new Date(sub.submitted_at).toLocaleDateString(),
        sub.github_url || '',
        sub.demo_url || ''
      ])
    ]
    
    const csvContent = csvData.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `submissions-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const statusCounts = {
    all: submissions.length,
    pending: submissions.filter(s => s.status === "pending").length,
    in_review: submissions.filter(s => s.status === "in_review").length,
    needs_changes: submissions.filter(s => s.status === "needs_changes").length,
    approved: submissions.filter(s => s.status === "approved").length
  }

  if (authLoading || loading) {
    return (
      <div className="p-4 md:p-8 max-w-7xl">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl">
      {/* Header with Bulk Operations */}
      <div className="mb-8 animate-slideInUp">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Submissions Review</h1>
            <p className="text-foreground/60">Review and manage student task submissions</p>
          </div>
          
          <div className="flex gap-2 mt-4 md:mt-0">
            <button
              onClick={exportSubmissions}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Bulk Operations Bar */}
        {selectedSubmissions.length > 0 && (
          <div className="mb-4 p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="font-medium">
                  {selectedSubmissions.length} submission{selectedSubmissions.length !== 1 ? 's' : ''} selected
                </span>
                
                <select
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value)}
                  className="px-3 py-1 border border-border rounded"
                >
                  <option value="">Choose action...</option>
                  <option value="approve">Approve All</option>
                  <option value="reject">Request Changes</option>
                  <option value="review">Mark as In Review</option>
                </select>
                
                <button
                  onClick={handleBulkAction}
                  disabled={!bulkAction || bulkLoading}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"
                >
                  {bulkLoading ? 'Processing...' : 'Apply'}
                </button>
              </div>
              
              <button
                onClick={() => setSelectedSubmissions([])}
                className="text-foreground/60 hover:text-foreground"
              >
                Clear Selection
              </button>
            </div>
          </div>
        )}
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

      {/* Filters with Select All */}
      <div className="mb-6 flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-foreground/60" />
            <span className="text-sm font-medium">Filters:</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleSelectAll}
              className="flex items-center gap-2 px-3 py-1 border border-border rounded hover:bg-muted transition-colors"
            >
              {selectedSubmissions.length === filteredSubmissions.length && filteredSubmissions.length > 0 ? (
                <CheckSquare className="w-4 h-4" />
              ) : (
                <Square className="w-4 h-4" />
              )}
              <span className="text-sm">Select All</span>
            </button>
          </div>
        </div>
        
        <div className="flex gap-4">
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
          filteredSubmissions.map((sub, i) => (
            <div
              key={sub.id}
              className={`p-6 rounded-lg border ${getStatusColor(sub.status)} animate-fadeInScale`}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4 flex-1">
                  {/* Selection Checkbox */}
                  <button
                    onClick={() => handleSelectSubmission(sub.id)}
                    className="mt-1 p-1 hover:bg-muted rounded transition-colors"
                  >
                    {selectedSubmissions.includes(sub.id) ? (
                      <CheckSquare className="w-5 h-5 text-primary" />
                    ) : (
                      <Square className="w-5 h-5 text-muted-foreground" />
                    )}
                  </button>
                  
                  {getStatusIcon(sub.status)}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{sub.assignment?.title || 'Assignment'}</h3>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(sub.status)}`}>
                        {formatStatus(sub.status)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                      <div>
                        <span className="font-medium">Student:</span>
                        <p className="text-foreground/80">{sub.student?.full_name || sub.student?.email || 'Unknown'} ({sub.student?.email || 'N/A'})</p>
                      </div>
                      <div>
                        <span className="font-medium">Track & Week:</span>
                        <p className="text-foreground/80">
                          {sub.assignment?.week?.track?.name || 'Unknown Track'} - Week {sub.assignment?.week?.week_number || 'N/A'}: {sub.assignment?.week?.title || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium">Submitted:</span>
                        <p className="text-foreground/80">{new Date(sub.submitted_at).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <span className="font-medium">Status:</span>
                        <p className="text-foreground/80">{formatStatus(sub.status)}</p>
                      </div>
                    </div>

                    {/* Submission Links */}
                    <div className="mb-4">
                      <span className="font-medium text-sm">Submission:</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {sub.github_url && (
                          <a
                            href={sub.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors text-sm"
                          >
                            GitHub <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        {sub.demo_url && (
                          <a
                            href={sub.demo_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm"
                          >
                            Live Demo <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      {sub.notes && (
                        <div className="mt-2">
                          <span className="font-medium text-sm">Notes:</span>
                          <p className="text-foreground/80 text-sm mt-1">{sub.notes}</p>
                        </div>
                      )}
                    </div>

                    {/* Review Info */}
                    {sub.reviewed_by && (
                      <div className="mb-4 p-3 bg-muted rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">Reviewed by Admin</span>
                          {sub.reviewed_at && (
                            <span className="text-xs text-foreground/60">
                              {new Date(sub.reviewed_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        {sub.feedback && (
                          <p className="text-foreground/80 text-sm">{sub.feedback}</p>
                        )}
                        {sub.grade && (
                          <div className="mt-2">
                            <span className="font-medium text-sm">Grade: </span>
                            <span className="px-2 py-1 bg-primary text-primary-foreground rounded text-sm">
                              {sub.grade}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <button
                    onClick={() => handleReview(sub)}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm"
                  >
                    Review
                  </button>
                  {sub.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleQuickAction(sub.id, "approve")}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center justify-center"
                      >
                        <ThumbsUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleQuickAction(sub.id, "reject")}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center justify-center"
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
