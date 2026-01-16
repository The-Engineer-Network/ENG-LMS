"use client"

import { useState } from "react"
import { Search, Plus, Edit2, Trash2 } from "lucide-react"

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
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<any>(null)

  const handleEditStudent = (studentId: number) => {
    const student = mockStudents.find(s => s.id === studentId)
    setSelectedStudent(student)
    setShowEditModal(true)
    console.log("Edit student:", studentId)
  }

  const handleDeleteStudent = (studentId: number) => {
    console.log("Delete student:", studentId)
    // TODO: Implement delete functionality
  }

  const handleAddStudent = () => {
    setShowAddModal(true)
    console.log("Add new student")
    // TODO: Implement add student functionality
  }

  const handleUpdateStudent = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Update student:", selectedStudent)
    setShowEditModal(false)
    setSelectedStudent(null)
    // TODO: Implement update functionality
  }

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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Students Management</h1>
            <p className="text-foreground/60">View and manage all students in your cohort</p>
          </div>
          <button
            onClick={handleAddStudent}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Student
          </button>
        </div>
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
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleEditStudent(student.id)}
                      className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                      title="Edit Student"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteStudent(student.id)}
                      className="p-2 text-accent hover:bg-accent/10 rounded-lg transition-colors"
                      title="Delete Student"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Student</h2>
            <form className="space-y-4">
              <div>
                <label className="block font-medium mb-2">Full Name *</label>
                <input
                  type="text"
                  placeholder="Enter student name"
                  className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              
              <div>
                <label className="block font-medium mb-2">Email *</label>
                <input
                  type="email"
                  placeholder="Enter email address"
                  className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              
              <div>
                <label className="block font-medium mb-2">Track *</label>
                <select
                  className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="">Select track</option>
                  <option value="Frontend">Frontend Development</option>
                  <option value="Backend">Backend Development</option>
                  <option value="DevOps">DevOps / Cloud</option>
                  <option value="Data">Data / AI / ML</option>
                  <option value="Web3">Web3 / Blockchain</option>
                </select>
              </div>
              
              <div>
                <label className="block font-medium mb-2">Cohort *</label>
                <select
                  className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="">Select cohort</option>
                  <option value="Cohort 1">Cohort 1</option>
                  <option value="Cohort 2">Cohort 2</option>
                  <option value="Cohort 3">Cohort 3</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Add Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {showEditModal && selectedStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit Student</h2>
            <form onSubmit={handleUpdateStudent} className="space-y-4">
              <div>
                <label className="block font-medium mb-2">Full Name *</label>
                <input
                  type="text"
                  defaultValue={selectedStudent.name}
                  placeholder="Enter student name"
                  className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              
              <div>
                <label className="block font-medium mb-2">Email *</label>
                <input
                  type="email"
                  defaultValue={selectedStudent.email}
                  placeholder="Enter email address"
                  className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              
              <div>
                <label className="block font-medium mb-2">Track *</label>
                <select
                  defaultValue={selectedStudent.track}
                  className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="">Select track</option>
                  <option value="Frontend">Frontend Development</option>
                  <option value="Backend">Backend Development</option>
                  <option value="DevOps">DevOps / Cloud</option>
                  <option value="Data">Data / AI / ML</option>
                  <option value="Web3">Web3 / Blockchain</option>
                </select>
              </div>
              
              <div>
                <label className="block font-medium mb-2">Progress</label>
                <input
                  type="number"
                  defaultValue={selectedStudent.progress}
                  min="0"
                  max="100"
                  placeholder="Progress percentage"
                  className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block font-medium mb-2">Tasks Completed</label>
                <input
                  type="number"
                  defaultValue={selectedStudent.tasksCompleted}
                  min="0"
                  max="20"
                  placeholder="Tasks completed"
                  className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false)
                    setSelectedStudent(null)
                  }}
                  className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Update Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
