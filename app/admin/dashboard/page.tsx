"use client"

import { Users, CheckSquare, Award, TrendingUp } from "lucide-react"

const mockData = {
  totalStudents: 45,
  studentsByTrack: [
    { track: "Frontend", count: 15 },
    { track: "Backend", count: 12 },
    { track: "DevOps", count: 10 },
    { track: "Web3", count: 8 },
  ],
  pendingSubmissions: 23,
  approvedCertificates: 8,
  completionRate: 72,
  trackMetrics: [
    { track: "Frontend", completion: 75, tasks: "15/20" },
    { track: "Backend", completion: 70, tasks: "14/20" },
    { track: "DevOps", completion: 68, tasks: "13/20" },
    { track: "Web3", completion: 65, tasks: "13/20" },
  ],
}

export default function AdminDashboard() {
  return (
    <div className="p-4 md:p-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8 animate-slideInUp">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-foreground/60">Cohort Overview & Management</p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Users, label: "Total Students", value: mockData.totalStudents, color: "from-primary to-accent" },
          {
            icon: CheckSquare,
            label: "Pending Reviews",
            value: mockData.pendingSubmissions,
            color: "from-secondary to-primary",
          },
          { icon: Award, label: "Certificates Approved", value: mockData.approvedCertificates },
          {
            icon: TrendingUp,
            label: "Avg. Completion",
            value: `${mockData.completionRate}%`,
            color: "from-primary to-secondary",
          },
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

      {/* Track Metrics */}
      <div className="mb-8 p-6 rounded-xl bg-card border border-border animate-slideInLeft">
        <h2 className="text-xl font-bold mb-4">Track Completion Metrics</h2>
        <div className="space-y-4">
          {mockData.trackMetrics.map((track, i) => (
            <div key={i} className="p-4 rounded-lg bg-background border border-border/50">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">{track.track} Track</span>
                <span className="text-sm text-foreground/60">{track.tasks}</span>
              </div>
              <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-secondary"
                  style={{ width: `${track.completion}%` }}
                />
              </div>
              <p className="text-xs text-foreground/50 mt-1">{track.completion}% Complete</p>
            </div>
          ))}
        </div>
      </div>

      {/* Students by Track */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="p-6 rounded-xl bg-card border border-border animate-slideInLeft">
          <h2 className="text-xl font-bold mb-4">Students by Track</h2>
          <div className="space-y-3">
            {mockData.studentsByTrack.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-lg bg-background border border-border/50"
              >
                <span className="font-medium">{item.track}</span>
                <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-semibold">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Actions */}
        <div
          className="p-6 rounded-xl bg-card border border-border animate-slideInLeft"
          style={{ animationDelay: "100ms" }}
        >
          <h2 className="text-xl font-bold mb-4">Recent Actions</h2>
          <div className="space-y-3">
            {[
              { action: "Approved Certificate", student: "Sarah Chen", time: "1 hour ago" },
              { action: "Reviewed Submission", student: "Mike Johnson", time: "2 hours ago" },
              { action: "Assigned Partner", student: "Emily Davis", time: "3 hours ago" },
            ].map((log, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-background border border-border/50">
                <div className="w-2 h-2 rounded-full bg-secondary" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{log.action}</p>
                  <p className="text-xs text-foreground/60">
                    {log.student} • {log.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
