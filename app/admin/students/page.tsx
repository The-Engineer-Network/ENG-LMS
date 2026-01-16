"use client"

import { useState } from "react"
import { Search, MoreVertical } from "lucide-react"

const mockStudents = [
  { id: 1, name: "Alex Johnson", track: "Frontend", progress: 65, tasksCompleted: 13, email: "alex@example.com" },
  { id: 2, name: "Sarah Chen", track: "Backend", progress: 72, tasksCompleted: 14, email: "sarah@example.com" },
  { id: 3, name: "Mike Johnson", track: "DevOps", progress: 58, tasksCompleted: 11, email: "mike@example.com" },
  { id: 4, name: "Emily Davis", track: "Web3", progress: 45, tasksCompleted: 9, email: "emily@example.com" },
  { id: 5, name: "Jordan Smith", track: "Frontend", progress: 72, tasksCompleted: 14, email: "jordan@example.com" },
]

export default function StudentsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterTrack, setFilterTrack] = useState<string>("all")

  const filteredStudents = mockStudents.filter(
    (student) =>
      (filterTrack === "all" || student.track === filterTrack) &&
      student.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const tracks = ["all", ...new Set(mockStudents.map((s) => s.track))]

  return (
    <div className="p-4 md:p-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8 animate-slideInUp">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Students Management</h1>
        <p className="text-foreground/60">View and manage all students in your cohort</p>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {tracks.map((track) => (
            <button
              key={track}
              onClick={() => setFilterTrack(track)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all capitalize ${
                filterTrack === track
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border text-foreground/70 hover:border-primary/50"
              }`}
            >
              {track}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-3.5 w-5 h-5 text-foreground/40" />
          <input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg bg-card border border-border text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      {/* Students Table */}
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-card/50">
              <th className="px-6 py-4 text-left text-sm font-semibold">Name</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Email</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Track</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Tasks Completed</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Progress</th>
              <th className="px-6 py-4 text-right text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student, i) => (
              <tr
                key={student.id}
                className="border-b border-border/50 hover:bg-card/50 transition-colors animate-fadeInScale"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <td className="px-6 py-4 font-medium">{student.name}</td>
                <td className="px-6 py-4 text-foreground/60 text-sm">{student.email}</td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-semibold">
                    {student.track}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">{student.tasksCompleted}/20</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-border rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-secondary"
                        style={{ width: `${student.progress}%` }}
                      />
                    </div>
                    <span className="text-sm text-foreground/60">{student.progress}%</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 hover:bg-card rounded-lg transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
