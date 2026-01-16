"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Github, LinkIcon, Send } from "lucide-react"

export default function TaskSubmitPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    githubLink: "",
    liveLink: "",
    approach: "",
    challenges: "",
    lessonsLearned: "",
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1000))
    router.push("/student/dashboard")
  }

  return (
    <div className="p-4 md:p-8 max-w-3xl">
      {/* Header */}
      <div className="mb-8 animate-slideInUp">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Submit Task</h1>
        <p className="text-foreground/60">Share your work and get feedback from instructors</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* GitHub Link */}
        <div className="p-6 rounded-xl bg-card border border-border animate-fadeInScale">
          <label className="flex items-center gap-2 text-lg font-semibold mb-3">
            <Github className="w-5 h-5 text-primary" />
            GitHub Repository Link
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
            Deployed/Live Link (Optional)
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
          <label className="block text-lg font-semibold mb-3">Your Approach</label>
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
          <label className="block text-lg font-semibold mb-3">Challenges Faced</label>
          <textarea
            placeholder="What challenges did you face and how did you overcome them..."
            value={formData.challenges}
            onChange={(e) => setFormData({ ...formData, challenges: e.target.value })}
            className="w-full h-24 px-4 py-3 rounded-lg bg-background border border-border text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary transition-colors resize-none"
            required
          />
        </div>

        {/* Lessons Learned */}
        <div className="p-6 rounded-xl bg-card border border-border animate-fadeInScale">
          <label className="block text-lg font-semibold mb-3">Lessons Learned</label>
          <textarea
            placeholder="What did you learn from this task..."
            value={formData.lessonsLearned}
            onChange={(e) => setFormData({ ...formData, lessonsLearned: e.target.value })}
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
          {loading ? "Submitting..." : "Submit Task"}
        </button>
      </form>
    </div>
  )
}
