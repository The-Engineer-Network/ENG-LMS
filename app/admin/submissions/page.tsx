"use client"

import { useState } from "react"
import { CheckCircle2, Clock, AlertCircle, MessageSquare } from "lucide-react"
import Link from "next/link"

const mockSubmissions = [
  {
    id: 1,
    student: "Alex Johnson",
    task: "Week 2: Component Composition",
    status: "Pending",
    submittedDate: "2024-02-20",
  },
  { id: 2, student: "Sarah Chen", task: "Week 3: State Management", status: "In Review", submittedDate: "2024-02-19" },
  {
    id: 3,
    student: "Mike Johnson",
    task: "Week 1: React Fundamentals",
    status: "Needs Correction",
    submittedDate: "2024-02-18",
  },
  { id: 4, student: "Emily Davis", task: "Week 4: API Integration", status: "Pending", submittedDate: "2024-02-17" },
  {
    id: 5,
    student: "Jordan Smith",
    task: "Week 2: Component Composition",
    status: "In Review",
    submittedDate: "2024-02-16",
  },
]

export default function SubmissionsPage() {
  const [filter, setFilter] = useState<string>("all")

  const filteredSubmissions = mockSubmissions.filter(
    (sub) => filter === "all" || sub.status.toLowerCase().replace(" ", "") === filter.toLowerCase().replace(" ", ""),
  )

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Pending":
        return <Clock className="w-5 h-5 text-yellow-400" />
      case "In Review":
        return <AlertCircle className="w-5 h-5 text-blue-400" />
      case "Needs Correction":
        return <AlertCircle className="w-5 h-5 text-accent" />
      default:
        return <CheckCircle2 className="w-5 h-5 text-green-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "In Review":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "Needs Correction":
        return "bg-accent/20 text-accent border-accent/30"
      default:
        return "bg-green-500/20 text-green-400 border-green-500/30"
    }
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8 animate-slideInUp">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Submissions Review</h1>
        <p className="text-foreground/60">Review and approve student submissions</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {["all", "Pending", "In Review", "Needs Correction"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status.toLowerCase().replace(" ", ""))}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all capitalize ${
              filter === status.toLowerCase().replace(" ", "")
                ? "bg-primary text-primary-foreground"
                : "bg-card border border-border text-foreground/70 hover:border-primary/50"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Submissions List */}
      <div className="space-y-4">
        {filteredSubmissions.map((sub, i) => (
          <div
            key={sub.id}
            className="p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-300 group animate-fadeInScale"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="flex items-start gap-4">
              <div className="mt-1">{getStatusIcon(sub.status)}</div>

              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-bold mb-1">{sub.task}</h3>
                    <p className="text-foreground/60 text-sm">by {sub.student}</p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full border ${getStatusColor(sub.status)}`}>
                    {sub.status}
                  </span>
                </div>
                <p className="text-xs text-foreground/40 mb-4">Submitted: {sub.submittedDate}</p>

                <div className="flex gap-2">
                  <Link
                    href={`/admin/submissions/${sub.id}`}
                    className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm hover:opacity-90 transition-opacity"
                  >
                    Review
                  </Link>
                  <button className="p-2 rounded-lg bg-background hover:bg-card transition-colors">
                    <MessageSquare className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
