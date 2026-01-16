"use client"

import { useState } from "react"
import { ChevronLeft, CheckCircle2, AlertCircle, Send } from "lucide-react"
import Link from "next/link"

export default function SubmissionReviewPage({ params }: { params: { id: string } }) {
  const [feedback, setFeedback] = useState("")
  const [action, setAction] = useState<"approve" | "needs-changes" | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const mockSubmission = {
    id: params.id,
    student: "Alex Johnson",
    task: "Week 2: Component Composition",
    submittedDate: "2024-02-20",
    githubLink: "https://github.com/alexjohnson/component-app",
    liveLink: "https://component-app.vercel.app",
    approach:
      "I built a component library with reusable UI elements. Used composition patterns to ensure flexibility and reusability.",
    challenges:
      "Initially had issues with prop drilling, but resolved it by implementing a context layer for shared state.",
    status: "Pending Review",
  }

  const handleSubmitReview = () => {
    if (!action || !feedback.trim()) {
      alert("Please select an action and provide feedback")
      return
    }
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="p-4 md:p-8 max-w-4xl">
        <div className="p-8 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 text-center animate-slideInUp">
          <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-green-400 mb-2">Review Submitted!</h2>
          <p className="text-foreground/70 mb-6">The student will be notified of your feedback.</p>
          <Link
            href="/admin/submissions"
            className="inline-block px-6 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Back to Submissions
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl">
      {/* Back Button */}
      <Link
        href="/admin/submissions"
        className="flex items-center gap-2 text-primary hover:underline mb-6 animate-slideInUp"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Submissions
      </Link>

      {/* Header */}
      <div className="mb-8 animate-slideInUp">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Review Submission</h1>
        <p className="text-foreground/60">{mockSubmission.task}</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Main Review Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Student Info */}
          <div className="p-6 rounded-xl bg-card border border-border animate-fadeInScale">
            <h2 className="text-xl font-bold mb-4">Student Information</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-foreground/60">Student</p>
                <p className="font-semibold">{mockSubmission.student}</p>
              </div>
              <div>
                <p className="text-sm text-foreground/60">Submitted</p>
                <p className="font-semibold">{mockSubmission.submittedDate}</p>
              </div>
            </div>
          </div>

          {/* Submission Links */}
          <div className="p-6 rounded-xl bg-card border border-border animate-fadeInScale">
            <h2 className="text-xl font-bold mb-4">Submission Links</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-foreground/60 mb-1">GitHub Repository</p>
                <a
                  href={mockSubmission.githubLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline break-all"
                >
                  {mockSubmission.githubLink}
                </a>
              </div>
              {mockSubmission.liveLink && (
                <div>
                  <p className="text-sm text-foreground/60 mb-1">Live Demo</p>
                  <a
                    href={mockSubmission.liveLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline break-all"
                  >
                    {mockSubmission.liveLink}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Submission Content */}
          <div className="p-6 rounded-xl bg-card border border-border animate-fadeInScale">
            <h2 className="text-xl font-bold mb-4">Approach</h2>
            <p className="text-foreground/80 leading-relaxed">{mockSubmission.approach}</p>
          </div>

          <div className="p-6 rounded-xl bg-card border border-border animate-fadeInScale">
            <h2 className="text-xl font-bold mb-4">Challenges Faced</h2>
            <p className="text-foreground/80 leading-relaxed">{mockSubmission.challenges}</p>
          </div>
        </div>

        {/* Review Actions */}
        <div className="space-y-4">
          {/* Feedback Card */}
          <div className="p-6 rounded-xl bg-card border border-border animate-slideInRight">
            <h3 className="font-bold mb-4">Provide Feedback</h3>

            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Detailed feedback for the student..."
              className="w-full h-32 px-4 py-3 rounded-lg bg-background border border-border text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary transition-colors resize-none mb-4"
            />

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={() => setAction("approve")}
                className={`w-full px-4 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                  action === "approve"
                    ? "bg-green-500/20 text-green-400 border border-green-500/50"
                    : "bg-background border border-border hover:border-green-500/50 text-foreground"
                }`}
              >
                <CheckCircle2 className="w-5 h-5" />
                Approve
              </button>

              <button
                onClick={() => setAction("needs-changes")}
                className={`w-full px-4 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                  action === "needs-changes"
                    ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/50"
                    : "bg-background border border-border hover:border-yellow-500/50 text-foreground"
                }`}
              >
                <AlertCircle className="w-5 h-5" />
                Needs Changes
              </button>
            </div>

            {action && (
              <button
                onClick={handleSubmitReview}
                className="w-full mt-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Submit Review
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
