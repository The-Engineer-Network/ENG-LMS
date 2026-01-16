"use client"

import { useMemo } from "react"
import Link from "next/link"
import { CheckCircle2, Clock, AlertCircle, TrendingUp, Lock } from "lucide-react"

const mockData = {
  student: {
    name: "Alex Johnson",
    track: "Frontend",
    cohort: "Cohort 1",
    progress: 65,
    weekCount: 6,
    completedWeeks: 4,
    submissions: {
      approved: 4,
      pending: 0,
      needsCorrection: 0,
    },
  },
  weeks: [
    { week: 1, title: "React Fundamentals", status: "Approved", submitted: true, locked: false },
    { week: 2, title: "Component Composition", status: "Approved", submitted: true, locked: false },
    { week: 3, title: "State Management", status: "Approved", submitted: true, locked: false },
    { week: 4, title: "API Integration", status: "Approved", submitted: true, locked: false },
    { week: 5, title: "Testing & Debugging", status: "Pending Submission", submitted: false, locked: false },
    { week: 6, title: "Performance & Deployment", status: "Locked", submitted: false, locked: true },
  ],
}

export default function StudentDashboard() {
  const completionPercentage = useMemo(() => mockData.student.progress, [])

  return (
    <div className="p-4 md:p-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8 animate-slideInUp">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          Welcome back,{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
            {mockData.student.name}
          </span>
        </h1>
        <p className="text-foreground/60">
          Track: <span className="font-semibold text-primary">{mockData.student.track}</span> • Cohort:{" "}
          <span className="font-semibold text-secondary">{mockData.student.cohort}</span>
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        {[
          {
            icon: TrendingUp,
            label: "Overall Progress",
            value: `${mockData.student.progress}%`,
            color: "from-primary to-accent",
          },
          {
            icon: CheckCircle2,
            label: "Weeks Completed",
            value: mockData.student.completedWeeks,
            subtitle: `of ${mockData.student.weekCount}`,
          },
          {
            icon: Clock,
            label: "Approved",
            value: mockData.student.submissions.approved,
            color: "from-secondary to-primary",
          },
          { icon: AlertCircle, label: "Needs Attention", value: mockData.student.submissions.needsCorrection },
        ].map((stat, i) => (
          <div
            key={i}
            className="p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-300 transform hover:scale-105 animate-fadeInScale"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-foreground/60 mb-2">{stat.label}</p>
                <p
                  className={`text-3xl font-bold ${stat.color ? `bg-gradient-to-r ${stat.color} bg-clip-text text-transparent` : ""}`}
                >
                  {stat.value}
                </p>
                {stat.subtitle && <p className="text-xs text-foreground/40 mt-1">{stat.subtitle}</p>}
              </div>
              <div
                className={`p-3 rounded-lg ${stat.color ? `bg-gradient-to-br ${stat.color}` : "bg-primary"} bg-opacity-20`}
              >
                <stat.icon className="w-6 h-6 text-primary" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="mb-8 p-6 rounded-xl bg-card border border-border animate-slideInLeft">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Program Progress</h2>
          <span className="text-2xl font-bold text-primary">{completionPercentage}%</span>
        </div>
        <div className="w-full h-3 bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
        <p className="text-sm text-foreground/60 mt-3">Complete all 6 weeks to earn your certificate!</p>
      </div>

      <div className="animate-slideInLeft">
        <h2 className="text-xl font-bold mb-4">Week Progression</h2>
        <div className="grid gap-3">
          {mockData.weeks.map((week, i) => (
            <Link
              key={week.week}
              href={week.locked ? "#" : `/student/weeks/${week.week}`}
              className={`p-4 rounded-xl border transition-all transform hover:scale-102 ${
                week.locked
                  ? "bg-card/50 border-border/50 cursor-not-allowed opacity-60"
                  : "bg-card border-border hover:border-primary/50 cursor-pointer"
              } animate-fadeInScale`}
              style={{ animationDelay: `${(i + 4) * 80}ms` }}
              onClick={(e) => week.locked && e.preventDefault()}
            >
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  {week.locked ? (
                    <Lock className="w-5 h-5 text-foreground/40" />
                  ) : week.status === "Approved" ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  ) : (
                    <Clock className="w-5 h-5 text-yellow-400" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">
                    Week {week.week}: {week.title}
                  </h3>
                  <p className="text-sm text-foreground/60">Assignment status: {week.status}</p>
                </div>
                <span
                  className={`text-xs px-3 py-1 rounded-full ${
                    week.locked
                      ? "bg-border/50 text-foreground/50"
                      : week.status === "Approved"
                        ? "bg-green-500/20 text-green-400"
                        : week.status === "Pending Submission"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-blue-500/20 text-blue-400"
                  }`}
                >
                  {week.locked ? "Locked" : week.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
