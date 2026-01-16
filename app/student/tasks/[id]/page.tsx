"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Plus, Trash2, ExternalLink, Clock, AlertCircle } from "lucide-react"

const mockAssignments = {
  1: {
    id: 1,
    title: "Build a Counter Component",
    description: "Create a React component that implements a counter with increment, decrement, and reset functionality. The component should demonstrate proper state management and event handling.",
    weekId: 1,
    weekTitle: "React Fundamentals",
    deadline: "2024-02-15T23:59:00Z",
    requirements: [
      { field: "github", label: "GitHub Repository", required: true, type: "url", placeholder: "https://github.com/username/project" },
      { field: "demo", label: "Live Demo URL", required: true, type: "url", placeholder: "https://your-demo.vercel.app" },
      { field: "notes", label: "Additional Notes", required: false, type: "textarea", placeholder: "Any additional comments about your implementation..." }
    ],
    guidelines: [
      "Use functional components with hooks",
      "Implement increment, decrement, and reset functionality",
      "Add proper styling with CSS or Tailwind",
      "Include a README with setup instructions",
      "Deploy to Vercel, Netlify, or similar platform"
    ],
    submitted: true,
    submission: {
      github: "https://github.com/student/react-counter",
      demo: "https://react-counter-demo.vercel.app",
      notes: "Implemented with TypeScript and added bonus features like step increment"
    }
  },
  2: {
    id: 2,
    title: "Theme Context Provider",
    description: "Build a theme context provider that manages light/dark mode across the application. Implement theme switching with proper state persistence.",
    weekId: 2,
    weekTitle: "State Management",
    deadline: "2024-02-22T23:59:00Z",
    requirements: [
      { field: "github", label: "GitHub Repository", required: true, type: "url", placeholder: "https://github.com/username/theme-provider" },
      { field: "demo", label: "Live Demo URL", required: true, type: "url", placeholder: "https://your-theme-demo.vercel.app" }
    ],
    guidelines: [
      "Create a ThemeContext using React Context API",
      "Implement theme persistence with localStorage",
      "Create a custom useTheme hook",
      "Style both light and dark themes",
      "Add smooth transitions between themes"
    ],
    submitted: true,
    submission: {
      github: "https://github.com/student/theme-provider",
      demo: "https://theme-provider-demo.vercel.app"
    }
  },
  3: {
    id: 3,
    title: "Reusable Modal Component",
    description: "Create a flexible modal component using composition patterns. The modal should be reusable and support different content types.",
    weekId: 3,
    weekTitle: "Component Composition",
    deadline: "2024-03-01T23:59:00Z",
    requirements: [
      { field: "github", label: "GitHub Repository", required: true, type: "url", placeholder: "https://github.com/username/modal-component" },
      { field: "demo", label: "Live Demo URL", required: true, type: "url", placeholder: "https://your-modal-demo.vercel.app" },
      { field: "notes", label: "Implementation Notes", required: false, type: "textarea", placeholder: "Explain your design decisions and any challenges faced..." }
    ],
    guidelines: [
      "Use compound component pattern",
      "Implement proper focus management",
      "Add keyboard navigation (ESC to close)",
      "Support different modal sizes",
      "Include backdrop click to close"
    ],
    submitted: false,
    submission: null
  }
}

export default function TaskSubmissionPage() {
  const params = useParams()
  const router = useRouter()
  const taskId = parseInt(params.id as string)
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const assignment = mockAssignments[taskId as keyof typeof mockAssignments]

  if (!assignment) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Assignment Not Found</h1>
        <button onClick={() => router.back()} className="text-primary hover:underline">
          ← Go Back
        </button>
      </div>
    )
  }

  const isOverdue = new Date() > new Date(assignment.deadline)
  const timeUntilDeadline = new Date(assignment.deadline).getTime() - new Date().getTime()
  const daysUntilDeadline = Math.ceil(timeUntilDeadline / (1000 * 60 * 60 * 24))

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    assignment.requirements.forEach(req => {
      if (req.required && !formData[req.field]?.trim()) {
        newErrors[req.field] = `${req.label} is required`
      } else if (formData[req.field] && req.type === "url") {
        try {
          new URL(formData[req.field])
        } catch {
          newErrors[req.field] = "Please enter a valid URL"
        }
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    console.log("Submitting assignment:", { assignmentId: taskId, submission: formData })
    
    setLoading(false)
    router.push(`/student/weeks/${assignment.weekId}`)
  }

  // Initialize form data with existing submission if available
  useState(() => {
    if (assignment.submission) {
      setFormData(assignment.submission)
    }
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="p-4 md:p-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold">{assignment.title}</h1>
              <p className="text-foreground/60">Week {assignment.weekId}: {assignment.weekTitle}</p>
            </div>
          </div>

          {/* Deadline Warning */}
          <div className={`p-4 rounded-lg border ${
            isOverdue 
              ? "bg-accent/10 border-accent/20"
              : daysUntilDeadline <= 2
              ? "bg-secondary/10 border-secondary/20"
              : "bg-primary/10 border-primary/20"
          }`}>
            <div className="flex items-center gap-2">
              {isOverdue ? (
                <AlertCircle className="w-5 h-5 text-accent" />
              ) : (
                <Clock className="w-5 h-5 text-primary" />
              )}
              <span className={`font-medium ${
                isOverdue ? "text-accent" : "text-foreground"
              }`}>
                {isOverdue 
                  ? "This assignment is overdue"
                  : `Due: ${new Date(assignment.deadline).toLocaleDateString()} at 11:59 PM`
                }
              </span>
              {!isOverdue && daysUntilDeadline <= 2 && (
                <span className="text-yellow-700 dark:text-yellow-300">
                  ({daysUntilDeadline} day{daysUntilDeadline !== 1 ? 's' : ''} remaining)
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6 max-w-4xl mx-auto">
        {/* Assignment Description */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Assignment Description</h2>
          <p className="text-foreground/70 mb-6">{assignment.description}</p>

          {/* Guidelines */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-semibold mb-4">Guidelines</h3>
            <ul className="space-y-2">
              {assignment.guidelines.map((guideline, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <span className="text-foreground/80">{guideline}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Submission Form */}
        {assignment.submitted ? (
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-6">
            <h3 className="font-semibold text-primary mb-4">
              Assignment Submitted ✓
            </h3>
            <div className="space-y-4">
              {assignment.requirements.map((req) => {
                const value = assignment.submission?.[req.field as keyof typeof assignment.submission]
                if (!value) return null

                return (
                  <div key={req.field}>
                    <label className="font-medium text-green-800 dark:text-green-200">
                      {req.label}:
                    </label>
                    {req.type === "url" ? (
                      <a
                        href={value}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-primary hover:underline inline-flex items-center gap-1"
                      >
                        {value} <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <p className="mt-1 text-green-700 dark:text-green-300">{value}</p>
                    )}
                  </div>
                )
              })}
            </div>
            <div className="mt-6 pt-4 border-t border-green-200 dark:border-green-800">
              <p className="text-sm text-green-700 dark:text-green-300">
                Your submission is under review. You'll be notified once it's been graded.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-xl font-semibold">Submit Your Assignment</h2>

            {assignment.requirements.map((req) => (
              <div key={req.field}>
                <label className="block font-medium mb-2">
                  {req.label}
                  {req.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                
                {req.type === "textarea" ? (
                  <textarea
                    value={formData[req.field] || ""}
                    onChange={(e) => handleInputChange(req.field, e.target.value)}
                    placeholder={req.placeholder}
                    className={`w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary ${
                      errors[req.field] ? "border-red-500" : "border-border"
                    }`}
                    rows={4}
                  />
                ) : (
                  <input
                    type={req.type === "url" ? "url" : "text"}
                    value={formData[req.field] || ""}
                    onChange={(e) => handleInputChange(req.field, e.target.value)}
                    placeholder={req.placeholder}
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                      errors[req.field] ? "border-red-500" : "border-border"
                    }`}
                  />
                )}
                
                {errors[req.field] && (
                  <p className="text-red-500 text-sm mt-1">{errors[req.field]}</p>
                )}
              </div>
            ))}

            {/* Submit Button */}
            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 border border-border rounded-lg hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || isOverdue}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Submitting..." : "Submit Assignment"}
              </button>
            </div>

            {isOverdue && (
              <p className="text-red-500 text-sm">
                This assignment is overdue. Please contact your mentor for late submission approval.
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  )
}