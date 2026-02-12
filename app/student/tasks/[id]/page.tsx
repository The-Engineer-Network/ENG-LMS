"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, Calendar, Clock, FileText, Send, CheckCircle2 } from "lucide-react"
import { useAuth } from "@/lib/hooks/useAuth"
import { getAssignmentById, getStudentSubmissionForAssignment } from "@/lib/data"
import { logger } from "@/lib/logger"

export default function TaskDetailPage() {
  const { user, loading: authLoading } = useAuth()
  const params = useParams()
  const taskId = params.id as string
  
  const [assignment, setAssignment] = useState<any>(null)
  const [submission, setSubmission] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadTaskDetail() {
      if (!user?.id || !taskId) return
      
      try {
        const [assignmentData, submissionData] = await Promise.all([
          getAssignmentById(taskId),
          getStudentSubmissionForAssignment(user.id, taskId)
        ])
        
        setAssignment(assignmentData)
        setSubmission(submissionData)
      } catch (error) {
        logger.error('Error loading task detail:', error)
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading && user) {
      loadTaskDetail()
    }
  }, [user, authLoading, taskId])

  if (authLoading || loading) {
    return (
      <div className="p-4 md:p-8 max-w-4xl">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            <div className="h-32 bg-muted rounded-xl"></div>
            <div className="h-48 bg-muted rounded-xl"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!assignment) {
    return (
      <div className="p-4 md:p-8 max-w-4xl">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Task Not Found</h2>
          <p className="text-foreground/60 mb-6">The task you're looking for doesn't exist or you don't have access to it.</p>
          <Link
            href="/student/tasks"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Tasks
          </Link>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200"
      case "in_review":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "needs_changes":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/student/tasks"
          className="inline-flex items-center gap-2 text-foreground/60 hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Tasks
        </Link>
        
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{assignment.title}</h1>
            <p className="text-foreground/60">
              Week {assignment.week?.week_number} • {assignment.week?.track?.name}
            </p>
          </div>
          
          {submission && (
            <span className={`px-3 py-1 rounded-full text-sm border ${getStatusColor(submission.status)}`}>
              {submission.status === 'approved' ? 'Approved' :
               submission.status === 'in_review' ? 'In Review' :
               submission.status === 'needs_changes' ? 'Needs Changes' : 'Pending'}
            </span>
          )}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Assignment Details */}
          <div className="p-6 rounded-xl bg-card border border-border">
            <h2 className="text-xl font-bold mb-4">Assignment Details</h2>
            
            {assignment.requirements && (
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Requirements</h3>
                <div className="prose prose-sm max-w-none">
                  <p className="text-foreground/80">{assignment.requirements}</p>
                </div>
              </div>
            )}
            
            {assignment.submission_guidelines && (
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Submission Guidelines</h3>
                <div className="prose prose-sm max-w-none">
                  <p className="text-foreground/80">{assignment.submission_guidelines}</p>
                </div>
              </div>
            )}

            {assignment.video_guide && (
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Video Guide</h3>
                <a
                  href={assignment.video_guide}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  Watch Video Guide
                </a>
              </div>
            )}

            {assignment.learning_materials && assignment.learning_materials.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Learning Materials</h3>
                <div className="space-y-2">
                  {assignment.learning_materials.map((material: any, index: number) => (
                    <a
                      key={index}
                      href={material.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                    >
                      <FileText className="w-4 h-4" />
                      {material.title || `Material ${index + 1}`}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Submission Status */}
          {submission && (
            <div className="p-6 rounded-xl bg-card border border-border">
              <h2 className="text-xl font-bold mb-4">Your Submission</h2>
              
              <div className="space-y-4">
                {submission.github_url && (
                  <div>
                    <label className="block font-medium mb-1">GitHub Repository</label>
                    <a
                      href={submission.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80 transition-colors"
                    >
                      {submission.github_url}
                    </a>
                  </div>
                )}
                
                {submission.demo_url && (
                  <div>
                    <label className="block font-medium mb-1">Demo URL</label>
                    <a
                      href={submission.demo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80 transition-colors"
                    >
                      {submission.demo_url}
                    </a>
                  </div>
                )}
                
                {submission.notes && (
                  <div>
                    <label className="block font-medium mb-1">Notes</label>
                    <p className="text-foreground/80">{submission.notes}</p>
                  </div>
                )}
                
                {submission.feedback && (
                  <div>
                    <label className="block font-medium mb-1">Feedback</label>
                    <div className="p-3 rounded-lg bg-muted">
                      <p className="text-foreground/80">{submission.feedback}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Assignment Info */}
          <div className="p-6 rounded-xl bg-card border border-border">
            <h3 className="font-bold mb-4">Assignment Info</h3>
            
            <div className="space-y-3">
              {assignment.deadline && (
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-foreground/60" />
                  <div>
                    <p className="text-sm font-medium">Due Date</p>
                    <p className="text-sm text-foreground/60">
                      {new Date(assignment.deadline).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-foreground/60" />
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <p className="text-sm text-foreground/60">
                    {submission ? 
                      (submission.status === 'approved' ? 'Completed' : 'Submitted') : 
                      'Not Submitted'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="p-6 rounded-xl bg-card border border-border">
            {!submission ? (
              <Link
                href={`/student/tasks/${taskId}/submit`}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Send className="w-4 h-4" />
                Submit Assignment
              </Link>
            ) : submission.status === 'needs_changes' ? (
              <Link
                href={`/student/tasks/${taskId}/submit`}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors"
              >
                <Send className="w-4 h-4" />
                Resubmit Assignment
              </Link>
            ) : (
              <div className="text-center">
                <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm text-foreground/60">
                  {submission.status === 'approved' ? 'Assignment Approved' : 'Submission Under Review'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}