"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Github, LinkIcon, Send, ChevronLeft } from "lucide-react"

export default function WeekSubmitPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    githubLink: "",
    liveLink: "",
    approach: "",
    challenges: "",
  })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.githubLink.trim() || !formData.approach.trim() || !formData.challenges.trim()) {
      alert("Please fill in all required fields")
      return
    }
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1000))
    setSubmitted(true)
    setLoading(false)
  }

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
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Submit Week {params.id} Assignment</h1>
        <p className="text-foreground/60">All fields marked with * are required</p>
      </div>

      {submitted ? (
        <div className="p-8 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 text-center animate-slideInUp">
          <h2 className="text-2xl font-bold text-green-400 mb-2">Submission Received!</h2>
          <p className="text-foreground/70 mb-6">
            Your assignment has been submitted successfully. Instructors will review and provide feedback soon.
          </p>
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
            disabled={loading}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold hover:shadow-lg hover:shadow-primary/50 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Send className="w-5 h-5" />
            {loading ? "Submitting..." : "Submit Assignment"}
          </button>
        </form>
      )}
    </div>
  )
}
