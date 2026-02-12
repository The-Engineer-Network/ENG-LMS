"use client"

import { useState, useEffect } from "react"
import { Search, Plus, Edit2, Trash2 } from "lucide-react"
import { useAuth } from "@/lib/hooks/useAuth"
import { useToast } from "@/components/ui/toast"
import { getStudentEnrollments, getTracks, getCohorts, createStudentEnrollment, updateStudentEnrollment, deleteStudentEnrollment } from "@/lib/data"
import { logger } from "@/lib/logger"

export default function StudentsPage() {
  const { user, loading: authLoading } = useAuth()
  const { showToast } = useToast()
  const [students, setStudents] = useState<any[]>([])
  const [tracks, setTracks] = useState<any[]>([])
  const [cohorts, setCohorts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterTrack, setFilterTrack] = useState<string>("all")
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<any>(null)

  useEffect(() => {
    async function loadData() {
      if (!user?.id) return
      
      try {
        // Load tracks and cohorts separately to avoid failure cascade
        const [tracksData, cohortsData] = await Promise.all([
          getTracks(),
          getCohorts()
        ])
        
        setTracks(tracksData)
        setCohorts(cohortsData)
        
        // Try to load students separately - if it fails, we still have tracks/cohorts
        try {
          const studentsData = await getStudentEnrollments()
          
          // Transform students to match expected structure
          const transformedStudents = studentsData.map((enrollment: any) => ({
            id: enrollment.user?.id || enrollment.user_id,
            name: enrollment.user?.full_name || 'Unknown Student',
            track: enrollment.track?.name || 'Unknown Track',
            progress: enrollment.progress_percentage || 0,
            tasksCompleted: enrollment.tasks_completed || 0,
            email: enrollment.user?.email || 'No email',
            cohort: enrollment.cohort?.name || 'Unknown Cohort',
            enrollmentId: enrollment.id
          }))
          
          setStudents(transformedStudents)
        } catch (studentsError) {
          setStudents([]) // Empty students list, but tracks/cohorts still work
        }
      } catch (error: any) {
        setStudents([])
        setTracks([])
        setCohorts([])
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading && user) {
      loadData()
    }
  }, [user, authLoading])

  const handleEditStudent = (studentId: string) => {
    const student = students.find(s => s.id === studentId)
    setSelectedStudent(student)
    setShowEditModal(true)
  }

  const handleDeleteStudent = async (studentId: string) => {
    try {
      const student = students.find(s => s.id === studentId)
      if (student?.enrollmentId) {
        await deleteStudentEnrollment(student.enrollmentId)
        // Refresh the students list
        const updatedStudents = students.filter(s => s.id !== studentId)
        setStudents(updatedStudents)
        
        showToast({
          type: 'success',
          title: 'Student Removed',
          message: `${student.name} has been successfully removed from the enrollment.`
        })
      }
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Deletion Failed',
        message: error.message || 'Failed to delete student enrollment. Please try again.'
      })
    }
  }

  const handleAddStudent = () => {
    setShowAddModal(true)
  }



  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStudent) return
    
    try {
      await updateStudentEnrollment(selectedStudent.enrollmentId, {
        track_id: selectedStudent.track,
        cohort_id: selectedStudent.cohort
      })
      
      // Update local state
      setStudents(prev => prev.map(s => 
        s.id === selectedStudent.id ? selectedStudent : s
      ))
      
      showToast({
        type: 'success',
        title: 'Student Updated',
        message: `${selectedStudent.name}'s enrollment has been successfully updated.`
      })
      
      setShowEditModal(false)
      setSelectedStudent(null)
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Update Failed',
        message: error.message || 'Failed to update student enrollment. Please try again.'
      })
    }
  }

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    
    try {
      const newEnrollment = await createStudentEnrollment({
        email: formData.get('email') as string,
        full_name: formData.get('name') as string,
        track_id: formData.get('track') as string,
        cohort_id: formData.get('cohort') as string
      })
      
      // Add to local state
      const newStudent = {
        id: newEnrollment.user?.id || newEnrollment.user_id,
        name: newEnrollment.user?.full_name || 'Unknown Student',
        track: newEnrollment.track?.name || 'Unknown Track',
        progress: 0,
        tasksCompleted: 0,
        email: newEnrollment.user?.email || 'No email',
        cohort: newEnrollment.cohort?.name || 'Unknown Cohort',
        enrollmentId: newEnrollment.id
      }
      
      setStudents(prev => [...prev, newStudent])
      
      showToast({
        type: 'success',
        title: 'Student Added',
        message: `${newStudent.name} has been successfully enrolled in the program.`
      })
      
      setShowAddModal(false)
    } catch (error: any) {
      logger.error('Error creating student:', error)
      showToast({
        type: 'error',
        title: 'Enrollment Failed',
        message: error.message || 'Failed to create student enrollment. Please try again.'
      })
    }
  }

  const filteredStudents = students.filter(
    (student) =>
      (filterTrack === "all" || student.track === filterTrack) &&
      student.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const trackOptions = ["all", ...tracks.map((t) => t.name)]

  if (authLoading || loading) {
    return (
      <div className="p-4 md:p-8 max-w-7xl">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded-xl"></div>
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
          {trackOptions.map((track) => (
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
                      onClick={() => {
                        if (confirm(`Are you sure you want to remove ${student.name} from the enrollment? This action cannot be undone.`)) {
                          handleDeleteStudent(student.id)
                        }
                      }}
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
            <form onSubmit={handleCreateStudent} className="space-y-4">
              <div>
                <label className="block font-medium mb-2">Full Name *</label>
                <input
                  name="name"
                  type="text"
                  placeholder="Enter student name"
                  className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              
              <div>
                <label className="block font-medium mb-2">Email *</label>
                <input
                  name="email"
                  type="email"
                  placeholder="Enter email address"
                  className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              
              <div>
                <label className="block font-medium mb-2">Track *</label>
                <select
                  name="track"
                  className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="">Select track</option>
                  {tracks.map(track => (
                    <option key={track.id} value={track.id}>{track.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block font-medium mb-2">Cohort *</label>
                <select
                  name="cohort"
                  className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="">Select cohort</option>
                  {cohorts.map(cohort => (
                    <option key={cohort.id} value={cohort.id}>{cohort.name}</option>
                  ))}
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
                  {tracks.map(track => (
                    <option key={track.id} value={track.name}>{track.name}</option>
                  ))}
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
