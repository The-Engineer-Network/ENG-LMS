"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { CheckCircle2, Circle, Eye, Send, Clock, FileText } from "lucide-react"
import { useAuth } from "@/lib/hooks/useAuth"
import { getStudentAssignments } from "@/lib/data"
import { logger } from "@/lib/logger"

export default function TasksPage() {
  const { user, loading: authLoading } = useAuth()
  const [filter, setFilter] = useState<"all" | "completed" | "pending" | "review">("all")
  const [assignments, setAssignments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadAssignments() {
      if (!user?.id) return
      
      try {
        logger.log('Loading assignments for student:', user.id)
        const data = await getStudentAssignments(user.id)
        logger.log('Loaded assignments:', data)
        setAssignments(data)
      } catch (error) {
        logger.error('Error loading assignments:', error)
        setAssignments([])
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading && user) {
      loadAssignments()
    }
  }, [user, authLoading])

  const filteredAssignments = assignments.filter((assignment) => {
    if (filter === "completed") return assignment.submission_status === "approved"
    if (filter === "pending") return !assignment.has_submission
    if (filter === "review") return assignment.submission_status === "in_review"
    return true
  })

  const getStatusInfo = (assignment: any) => {
    if (assignment.submission_status === "approved") {
      return { label: "Approved", color: "bg-green-500/20 text-green-400 border-green-500/30" }
    }
    if (assignment.submission_status === "in_review") {
      return { label: "In Review", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" }
    }
    if (assignment.has_submission) {
      return { label: "Submitted", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" }
    }
    return { label: "Not Started", color: "bg-gray-500/20 text-gray-400 border-gray-500/30" }
  }

  if (authLoading || loading) {
    return (
      <div className="p-4 md:p-8 max-w-7xl">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
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

  return (
    <div className="p-4 md:p-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8 animate-slideInUp">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Assignments</h1>
        <p className="text-foreground/60">Complete assignments and track your progress</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {[
          { label: "All", value: "all" },
          { label: "Completed", value: "completed" },
          { label: "In Review", value: "review" },
          { label: "Pending", value: "pending" },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value as any)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
              filter === f.value
                ? "bg-primary text-primary-foreground"
                : "bg-card border border-border text-foreground/70 hover:border-primary/50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Assignments Grid */}
      {filteredAssignments.length === 0 ? (
        <div className="text-center py-12 bg-card border border-border rounded-xl">
          <FileText className="w-16 h-16 text-foreground/40 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No Assignments Found</h3>
          <p className="text-foreground/60">
            {filter === "all" 
              ? "No assignments have been created for your track yet."
              : `No ${filter} assignments found.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAssignments.map((assignment, i) => {
            const statusInfo = getStatusInfo(assignment)
            
            return (
              <div
                key={assignment.id}
                className="p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-300 group animate-fadeInScale"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="mt-1">
                    {assignment.submission_status === "approved" ? (
                      <CheckCircle2 className="w-6 h-6 text-green-400" />
                    ) : (
                      <Circle className="w-6 h-6 text-foreground/40" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                      {assignment.title}
                    </h3>
                    
                    {assignment.requirements && (
                      <p className="text-foreground/60 text-sm mb-3 line-clamp-2">
                        {assignment.requirements}
                      </p>
                    )}
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className={`text-xs px-3 py-1 rounded-full border ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                      
                      {assignment.week && (
                        <span className="text-xs px-3 py-1 rounded-full bg-border/50 text-foreground/60">
                          Week {assignment.week.week_number}
                        </span>
                      )}
                      
                      {assignment.week?.track && (
                        <span className="text-xs px-3 py-1 rounded-full bg-primary/20 text-primary">
                          {assignment.week.track.name}
                        </span>
                      )}
                      
                      {assignment.deadline && (
                        <span className="text-xs px-3 py-1 rounded-full bg-border/50 text-foreground/60 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Due: {new Date(assignment.deadline).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      href={`/student/tasks/${assignment.id}`}
                      className="p-2 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-5 h-5" />
                    </Link>
                    {!assignment.has_submission && (
                      <Link
                        href={`/student/tasks/${assignment.id}/submit`}
                        className="p-2 rounded-lg bg-secondary/20 text-secondary hover:bg-secondary/30 transition-colors"
                        title="Submit Assignment"
                      >
                        <Send className="w-5 h-5" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
