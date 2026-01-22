"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Github, LinkIcon, Send, ChevronLeft } from "lucide-react"
import { useAuth } from "@/lib/hooks/useAuth"
import { getWeeksByTrack, getStudentEnrollment, getStudentSubmissionForAssignment, createTaskSubmission, updateTaskSubmission } from "@/lib/data"

export default function WeekSubmitPage({ params }: { params: { id: string } }) {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const weekId = params.id
  const [week, setWeek] = useState<any>(null)
  const [assignment, setAssignment] = useState<any>(null)
  const [submission, setSubmission] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    githubLink: "",
    liveLink: "",
    approach: "",
    challenges: "",
  })

  useEffect(() => {
    async function loadWeekData() {
      if (!user?.id || !weekId) return
      
      try {
        const enrollment = await getStudentEnrollment(user.id)
        if (!enrollment) return
        
        const weeks = await getWeeksByTrack(enrollment.track_id)
        const currentWeek = weeks.find(w => w.id === weekId)
        
        if (currentWeek && currentWeek.assignments?.[0]) {
          setWeek(currentWeek)
          setAssignment(currentWeek.assignments[0])
          
          // Check for existing submission
          const existingSubmission = await getStudentSubmissionForAssignment(user.id, currentWeek.assignments[0].id)
          if (existingSubmission) {
            setSubmission(existingSubmission)
            setFormData({
              githubLink: existingSubmission.github_url || '',
              liveLink: existingSubmission.demo_url || '',
              approach: existingSubmission.notes?.split('\n\nChallenges:')?.[0] || '',
              challenges: existingSubmission.notes?.split('\n\nChallenges:')?.[1] || ''
            })
          }
        }
      } catch (error) {
        console.error('Error loading week data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading && user) {
      loadWeekData()
    }
  }, [user, authLoading, weekId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.githubLink.trim() || !formData.approach.trim() || !formData.challenges.trim()) {
      alert("Please fill in all required fields")
      return
    }
    
    if (!user?.id || !assignment) return

    setSubmitting(true)
    
    try {
      const notes = `${formData.approach}\n\nChallenges:\n${formData.challenges}`
      
      const submissionData = {
        student_id: user.id,
        assignment_id: assignment.id,
        github_url: formData.githubLink,
        demo_url: formData.liveLink || null,
        notes
      }

      if (submission) {
        await updateTaskSubmission(submission.id, {
          github_url: formData.githubLink,
          demo_url: formData.liveLink || null,
          notes
        })
      } else {
        await createTaskSubmission(submissionData)
      }
      
      router.push('/student/dashboard')
    } catch (error) {
      console.error('Error submitting assignment:', error)
      alert('Failed to submit assignment. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="p-4 md:p-8 max-w-3xl">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!week || !assignment) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Week Not Found</h1>
        <Link href="/student/dashboard" className="text-primary hover:underline">
          ← Back to Dashboard
        </Link>
      </div>
    )
  }

  const isSubmitted = submission && (submission.status === 'pending' || submission.status === 'in_review' || submission.status === 'approved')

  return (
    <div className="p-4 md:p-8 max-w-3xl">
      {/* Header */}
      <Link
        href={`/student/weeks/${params.id}`}
        className="flex items-center gap-2 text-primary hover:underline mb-6 animate-slideInUp"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Lesson
      </Link>

      <div className="mb-8 animate-slideInUp">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Submit Week {week.week_number} Assignment</h1>
        <p className="text-foreground/60">All fields marked with * are required</p>
      </div>

      {isSubmitted ? (
        <div className="p-8 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 text-center animate-slideInUp">
          <h2 className="text-2xl font-bold text-green-400 mb-2">
            {submission.status === 'approved' ? 'Assignment Approved!' : 'Submission Received!'}
          </h2>
          <p className="text-foreground/70 mb-6">
            {submission.status === 'approved' 
              ? 'Your assignment has been approved. Great work!'
              : 'Your assignment has been submitted successfully. Instructors will review and provide feedback soon.'
            }
          </p>
          {submission.feedback && (
            <div className="mb-6 p-4 bg-background/50 rounded-lg">
              <h3 className="font-semibold mb-2">Feedback:</h3>
              <p className="text-foreground/80">{submission.feedback}</p>
            </div>
          )}
          <Link
            href="/student/dashboard"
            className="inline-block px-6 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Back to Dashboard
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* GitHub Link */}
          <div className="p-6 rounded-xl bg-card border border-border animate-fadeInScale">
            <label className="flex items-center gap-2 text-lg font-semibold mb-3">
              <Github className="w-5 h-5 text-primary" />
              GitHub Repository Link <span className="text-accent">*</span>
            </label>
            <input
              type="url"
              placeholder="https://github.com/username/repo"
              value={formData.githubLink}
              onChange={(e) => setFormData({ ...formData, githubLink: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary transition-colors"
              required
            />
          </div>

          {/* Live Link */}
          <div className="p-6 rounded-xl bg-card border border-border animate-fadeInScale">
            <label className="flex items-center gap-2 text-lg font-semibold mb-3">
              <LinkIcon className="w-5 h-5 text-secondary" />
              Deployed/Live Link <span className="text-accent">(Optional)</span>
            </label>
            <input
              type="url"
              placeholder="https://example.vercel.app"
              value={formData.liveLink}
              onChange={(e) => setFormData({ ...formData, liveLink: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* Approach */}
          <div className="p-6 rounded-xl bg-card border border-border animate-fadeInScale">
            <label className="block text-lg font-semibold mb-3">
              Your Approach <span className="text-accent">*</span>
            </label>
            <textarea
              placeholder="Describe your approach and the solution you implemented..."
              value={formData.approach}
              onChange={(e) => setFormData({ ...formData, approach: e.target.value })}
              className="w-full h-24 px-4 py-3 rounded-lg bg-background border border-border text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary transition-colors resize-none"
              required
            />
          </div>

          {/* Challenges */}
          <div className="p-6 rounded-xl bg-card border border-border animate-fadeInScale">
            <label className="block text-lg font-semibold mb-3">
              Challenges Faced <span className="text-accent">*</span>
            </label>
            <textarea
              placeholder="What challenges did you face and how did you overcome them..."
              value={formData.challenges}
              onChange={(e) => setFormData({ ...formData, challenges: e.target.value })}
              className="w-full h-24 px-4 py-3 rounded-lg bg-background border border-border text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary transition-colors resize-none"
              required
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold hover:shadow-lg hover:shadow-primary/50 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Send className="w-5 h-5" />
            {submitting ? "Submitting..." : "Submit Assignment"}
          </button>
        </form>
      )}
    </div>
  )
}
