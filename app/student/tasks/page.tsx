"use client"

import { useState } from "react"
import Link from "next/link"
import { CheckCircle2, Circle, Eye, Send } from "lucide-react"

const mockTasks = [
  {
    id: 1,
    title: "React Fundamentals",
    description: "Learn core React concepts including components, JSX, and hooks",
    deadline: "2024-02-15",
    status: "Approved",
    requirements: "3 requirements",
    submission: true,
  },
  {
    id: 2,
    title: "State Management",
    description: "Master state management with Context API and custom hooks",
    deadline: "2024-02-22",
    status: "In Review",
    requirements: "4 requirements",
    submission: true,
  },
  {
    id: 3,
    title: "Component Composition",
    description: "Build reusable components and understand composition patterns",
    deadline: "2024-03-01",
    status: "Pending",
    requirements: "5 requirements",
    submission: false,
  },
  {
    id: 4,
    title: "API Integration",
    description: "Connect to REST APIs and handle async operations",
    deadline: "2024-03-10",
    status: "Pending",
    requirements: "4 requirements",
    submission: false,
  },
  {
    id: 5,
    title: "Testing & QA",
    description: "Write unit tests and perform quality assurance",
    deadline: "2024-03-20",
    status: "Pending",
    requirements: "3 requirements",
    submission: false,
  },
]

export default function TasksPage() {
  const [filter, setFilter] = useState<"all" | "approved" | "pending" | "review">("all")

  const filteredTasks = mockTasks.filter((task) => {
    if (filter === "approved") return task.status === "Approved"
    if (filter === "pending") return task.status === "Pending"
    if (filter === "review") return task.status === "In Review"
    return true
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-primary/20 text-primary border-primary/30"
      case "In Review":
        return "bg-secondary/20 text-secondary border-secondary/30"
      case "Pending":
        return "bg-accent/20 text-accent border-accent/30"
      default:
        return ""
    }
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8 animate-slideInUp">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Tasks</h1>
        <p className="text-foreground/60">Complete tasks and track your progress</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {[
          { label: "All", value: "all" },
          { label: "Approved", value: "approved" },
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

      {/* Tasks Grid */}
      <div className="space-y-4">
        {filteredTasks.map((task, i) => (
          <div
            key={task.id}
            className="p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-300 group animate-fadeInScale"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className="mt-1">
                {task.status === "Approved" ? (
                  <CheckCircle2 className="w-6 h-6 text-green-400" />
                ) : (
                  <Circle className="w-6 h-6 text-foreground/40" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1">
                <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">{task.title}</h3>
                <p className="text-foreground/60 text-sm mb-3">{task.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`text-xs px-3 py-1 rounded-full border ${getStatusColor(task.status)}`}>
                    {task.status}
                  </span>
                  <span className="text-xs px-3 py-1 rounded-full bg-border/50 text-foreground/60">
                    {task.requirements}
                  </span>
                  <span className="text-xs px-3 py-1 rounded-full bg-border/50 text-foreground/60">
                    Due: {new Date(task.deadline).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Link
                  href={`/student/tasks/${task.id}`}
                  className="p-2 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
                >
                  <Eye className="w-5 h-5" />
                </Link>
                {!task.submission && (
                  <Link
                    href={`/student/tasks/${task.id}/submit`}
                    className="p-2 rounded-lg bg-secondary/20 text-secondary hover:bg-secondary/30 transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
