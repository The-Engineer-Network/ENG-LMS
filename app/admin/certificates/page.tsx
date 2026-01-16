"use client"

import { useState } from "react"
import { CheckCircle2, Lock, Download, Upload, Trash2 } from "lucide-react"

const mockCertificates = [
  { 
    id: 1, 
    student: "Alex Johnson", 
    email: "alex@example.com",
    track: "Frontend", 
    status: "Ready for Upload", 
    tasksCompleted: 20,
    totalTasks: 20
  },
  { 
    id: 2, 
    student: "Sarah Chen", 
    email: "sarah@example.com",
    track: "Backend", 
    status: "Pending", 
    tasksCompleted: 19,
    totalTasks: 20
  },
  { 
    id: 3, 
    student: "Mike Johnson", 
    email: "mike@example.com",
    track: "DevOps", 
    status: "Ready for Upload", 
    tasksCompleted: 20,
    totalTasks: 20
  },
  { 
    id: 4, 
    student: "Emily Davis", 
    email: "emily@example.com",
    track: "Web3", 
    status: "Ready for Upload", 
    tasksCompleted: 20,
    totalTasks: 20
  },
  { 
    id: 5, 
    student: "Jordan Smith", 
    email: "jordan@example.com",
    track: "Frontend", 
    status: "Pending", 
    tasksCompleted: 17,
    totalTasks: 20
  },
]

export default function CertificatesPage() {
  const [filter, setFilter] = useState<string>("all")
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<any>(null)

  const filteredCerts = mockCertificates.filter(
    (cert) => filter === "all" || cert.status.toLowerCase() === filter.toLowerCase(),
  )

  const handleUploadCertificate = (student: any) => {
    setSelectedStudent(student)
    setShowUploadModal(true)
  }

  const handleDeleteCertificate = (studentId: number) => {
    console.log("Delete certificate for student:", studentId)
    // TODO: Implement delete functionality
  }

  const handleFileUpload = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Upload certificate for:", selectedStudent)
    setShowUploadModal(false)
    setSelectedStudent(null)
    // TODO: Implement file upload functionality
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-accent/20 text-accent"
      case "Ready for Upload":
        return "bg-secondary/20 text-secondary"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Ready for Upload":
        return <Upload className="w-6 h-6 text-secondary" />
      default:
        return <Lock className="w-6 h-6 text-accent" />
    }
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8 animate-slideInUp">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Certificate Management</h1>
        <p className="text-foreground/60">Approve and manage student certificates</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-8">
        {["all", "Pending", "Ready for Upload"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg transition-all ${
              filter === status
                ? "bg-primary text-primary-foreground"
                : "bg-card border border-border text-foreground/70 hover:border-primary/50"
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Certificates List */}
      <div className="space-y-4">
        {filteredCerts.map((cert, i) => (
          <div
            key={cert.id}
            className="p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-300 animate-fadeInScale"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${cert.status === "Ready for Upload" ? "bg-secondary/20" : "bg-accent/20"}`}>
                  {getStatusIcon(cert.status)}
                </div>
                <div>
                  <h3 className="text-lg font-bold">{cert.student}</h3>
                  <p className="text-sm text-foreground/60">{cert.email}</p>
                  <p className="text-sm text-foreground/60">{cert.track} Track</p>
                  
                  {cert.status === "Pending" && "tasksCompleted" in cert && (
                    <p className="text-xs text-foreground/40 mt-1">
                      {cert.tasksCompleted}/{cert.totalTasks} tasks completed
                    </p>
                  )}
                  
                  {cert.status === "Ready for Upload" && "tasksCompleted" in cert && (
                    <p className="text-xs text-secondary mt-1">
                      All tasks completed - Ready for certificate upload
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(cert.status)}`}>
                  {cert.status}
                </span>
                
                {cert.status === "Ready for Upload" && (
                  <button 
                    onClick={() => handleUploadCertificate(cert)}
                    className="px-4 py-2 rounded-lg bg-secondary text-white text-sm hover:bg-secondary/90 transition-colors flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Certificate
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Certificate Modal */}
      {showUploadModal && selectedStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Upload Certificate</h2>
            <div className="mb-4 p-4 bg-muted rounded-lg">
              <h3 className="font-medium">{selectedStudent.student}</h3>
              <p className="text-sm text-foreground/60">{selectedStudent.email}</p>
              <p className="text-sm text-foreground/60">{selectedStudent.track} Track</p>
            </div>
            
            <form onSubmit={handleFileUpload} className="space-y-4">
              <div>
                <label className="block font-medium mb-2">Certificate File *</label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
                <p className="text-xs text-foreground/60 mt-1">
                  Accepted formats: PDF, JPG, PNG (Max 5MB)
                </p>
              </div>
              
              <div>
                <label className="block font-medium mb-2">Notes (Optional)</label>
                <textarea
                  placeholder="Add any notes about this certificate..."
                  className="w-full p-3 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadModal(false)
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
                  Upload Certificate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
