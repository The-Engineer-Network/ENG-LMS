"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Send, Save, Github, Globe, FileText } from "lucide-react"
import { useAuth } from "@/lib/hooks/useAuth"
import { useToast } from "@/components/ui/toast"
import { getAssignmentById, getStudentSubmissionForAssignment, createTaskSubmission, updateTaskSubmission } from "@/lib/data"

export default function SubmitTaskPage() {
  const { user, loading: authLoading } = useAuth()
  const { showToast } = useToast()
  const params = useParams()
  const router = useRouter()
  const taskId = params.id as string
  
  const [assignment, setAssignment] = useState<any>(null)
  const [existingSubmission, setExistingSubmission] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSaving] = useState(false)
  
  const [formData, setFormData] = useState({
    github_url: '',
    demo_url: '',
    notes: ''
  })

  useEffect(() => {
    async function loadData() {
      if (!user?.id || !taskId) return
      
      try {
        const [assignmentData, submissionData] = await Promise.all([
          getAssignmentById(taskId),
          getStudentSubmissionForAssignment(user.id, taskId)
        ])
        
        setAssignment(assignmentData)
        setExistingSubmission(submissionData)
        
        // Pre-fill form if editing existing submission
        if (submissionData) {
          setFormData({
            github_url: submissionData.github_url || '',
            demo_url: submissionData.demo_url || '',
            notes: submissionData.notes || ''
          })
        }
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading && user) {
      loadData()
    }
  }, [user, authLoading, taskId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user?.id || !assignment) return
    
    // Validation
    if (!formData.github_url.trim()) {
      showToast({
        type: 'warning',
        title: 'GitHub URL Required',
        message: 'Please provide your GitHub repository URL.'
      })
      return
    }

    setSaving(true)
    
    try {
      if (existingSubmission) {
        // Update existing submission
        await updateTaskSubmission(existingSubmission.id, {
          github_url: formData.github_url.trim(),
          demo_url: formData.demo_url.trim() || undefined,
          notes: formData.notes.trim() || undefined
        })
        
        showToast({
          type: 'success',
          title: 'Submission Updated',
          message: 'Your assignment has been successfully resubmitted for review.'
        })
      } else {
        // Create new submission
        await createTaskSubmission({
          student_id: user.id,
          assignment_id: taskId,
          github_url: formData.github_url.trim(),
          demo_url: formData.demo_url.trim() || undefined,
          notes: formData.notes.trim() || undefined
        })
        
        showToast({
          type: 'success',
          title: 'Submission Successful',
          message: 'Your assignment has been submitted successfully and is now under review.'
        })
      }
      
      // Redirect back to task detail
      router.push(`/student/tasks/${taskId}`)
      
    } catch (error: any) {
      console.error('Error submitting:', error)
      showToast({
        type: 'error',
        title: 'Submission Failed',
        message: error.message || 'Failed to submit assignment. Please try again.'
      })
    } finally {
      setSaving(false)
    }
  }

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
          <h2 className="text-2xl font-bold mb-4">Assignment Not Found</h2>
          <p className="text-foreground/60 mb-6">The assignment you're trying to submit doesn't exist.</p>
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

  return (
    <div className="p-4 md:p-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/student/tasks/${taskId}`}
          className="inline-flex items-center gap-2 text-foreground/60 hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Assignment
        </Link>
        
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          {existingSubmission ? 'Update Submission' : 'Submit Assignment'}
        </h1>
        <p className="text-foreground/60">
          {assignment.title} • Week {assignment.week?.week_number}
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Submission Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="p-6 rounded-xl bg-card border border-border">
              <h2 className="text-xl font-bold mb-6">Submission Details</h2>
              
              {/* GitHub URL */}
              <div className="mb-6">
                <label className="block font-medium mb-2">
                  <Github className="w-4 h-4 inline mr-2" />
                  GitHub Repository URL *
                </label>
                <input
                  type="url"
                  value={formData.github_url}
                  onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                  placeholder="https://github.com/username/repository"
                  className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
                <p className="text-sm text-foreground/60 mt-1">
                  Link to your GitHub repository containing the completed assignment
                </p>
              </div>

              {/* Demo URL */}
              <div className="mb-6">
                <label className="block font-medium mb-2">
                  <Globe className="w-4 h-4 inline mr-2" />
                  Demo URL (Optional)
                </label>
                <input
                  type="url"
                  value={formData.demo_url}
                  onChange={(e) => setFormData({ ...formData, demo_url: e.target.value })}
                  placeholder="https://your-demo.netlify.app"
                  className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-sm text-foreground/60 mt-1">
                  Link to live demo or deployed version (if applicable)
                </p>
              </div>

              {/* Notes */}
              <div className="mb-6">
                <label className="block font-medium mb-2">
                  <FileText className="w-4 h-4 inline mr-2" />
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any additional information, challenges faced, or notes about your implementation..."
                  rows={4}
                  className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-vertical"
                />
                <p className="text-sm text-foreground/60 mt-1">
                  Share any challenges, learnings, or additional context about your submission
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  <Send className="w-4 h-4" />
                  {submitting ? 'Submitting...' : existingSubmission ? 'Update Submission' : 'Submit Assignment'}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Assignment Info */}
          <div className="p-6 rounded-xl bg-card border border-border">
            <h3 className="font-bold mb-4">Assignment Requirements</h3>
            
            {assignment.requirements && (
              <div className="mb-4">
                <p className="text-sm text-foreground/80">{assignment.requirements}</p>
              </div>
            )}
            
            {assignment.submission_guidelines && (
              <div className="mb-4">
                <h4 className="font-medium mb-2">Submission Guidelines</h4>
                <p className="text-sm text-foreground/80">{assignment.submission_guidelines}</p>
              </div>
            )}
            
            {assignment.deadline && (
              <div className="pt-4 border-t border-border">
                <p className="text-sm font-medium">Due Date</p>
                <p className="text-sm text-foreground/60">
                  {new Date(assignment.deadline).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>

          {/* Helpful Resources */}
          <div className="p-6 rounded-xl bg-card border border-border">
            <h3 className="font-bold mb-4">Helpful Resources</h3>
            
            {assignment.video_guide && (
              <div className="mb-3">
                <a
                  href={assignment.video_guide}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors text-sm"
                >
                  <FileText className="w-4 h-4" />
                  Video Guide
                </a>
              </div>
            )}
            
            {assignment.learning_materials && assignment.learning_materials.length > 0 && (
              <div className="space-y-2">
                {assignment.learning_materials.map((material: any, index: number) => (
                  <a
                    key={index}
                    href={material.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-primary hover:text-primary/80 transition-colors text-sm"
                  >
                    <FileText className="w-4 h-4 inline mr-2" />
                    {material.title || `Material ${index + 1}`}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Submission Tips */}
          <div className="p-6 rounded-xl bg-card border border-border">
            <h3 className="font-bold mb-4">Submission Tips</h3>
            <ul className="text-sm text-foreground/80 space-y-2">
              <li>• Ensure your GitHub repository is public</li>
              <li>• Include a clear README.md file</li>
              <li>• Test your demo URL before submitting</li>
              <li>• Double-check all requirements are met</li>
              <li>• You can update your submission until it's approved</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}