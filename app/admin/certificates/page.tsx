"use client"

import { useState, useEffect } from "react"
import { CheckCircle2, Lock, Download, Upload, Trash2 } from "lucide-react"
import { useAuth } from "@/lib/hooks/useAuth"
import { useToast } from "@/components/ui/toast"
import { getAllCertificates, uploadCertificateFile, deleteCertificate } from "@/lib/data"
import { logger } from "@/lib/logger"

export default function CertificatesPage() {
  const { user, loading: authLoading } = useAuth()
  const { showToast } = useToast()
  const [certificates, setCertificates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("all")
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<any>(null)

  useEffect(() => {
    async function loadCertificates() {
      if (!user?.id) return
      
      try {
        const certificatesData = await getAllCertificates()
        
        // Transform certificates to match expected structure
        const transformedCertificates = certificatesData.map((cert: any) => ({
          id: cert.id,
          student: cert.student?.full_name || 'Unknown Student',
          email: cert.student?.email || 'No email',
          track: cert.track?.name || 'Unknown Track',
          status: cert.is_approved ? "Approved" : (cert.tasks_completed >= cert.total_tasks ? "Ready for Upload" : "Pending"),
          tasksCompleted: cert.tasks_completed || 0,
          totalTasks: cert.total_tasks || 20,
          certificateFile: cert.certificate_file,
          completionDate: cert.completion_date,
          approvedAt: cert.approved_at
        }))
        
        setCertificates(transformedCertificates)
      } catch (error) {
        logger.error('Error loading certificates:', error)
        setCertificates([])
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading && user) {
      loadCertificates()
    }
  }, [user, authLoading])

  const filteredCerts = certificates.filter(
    (cert) => filter === "all" || cert.status.toLowerCase() === filter.toLowerCase(),
  )

  const handleUploadCertificate = (student: any) => {
    setSelectedStudent(student)
    setShowUploadModal(true)
  }

  const handleDeleteCertificate = async (certificateId: string) => {
    if (!confirm('Are you sure you want to delete this certificate? This action cannot be undone.')) {
      return
    }

    try {
      await deleteCertificate(certificateId)
      
      // Update local state
      setCertificates(prev => prev.filter(cert => cert.id !== certificateId))
      
      showToast({
        type: 'success',
        title: 'Certificate Deleted',
        message: 'The certificate has been successfully deleted.'
      })
    } catch (error: any) {
      logger.error('Error deleting certificate:', error)
      showToast({
        type: 'error',
        title: 'Delete Failed',
        message: error.message || 'Failed to delete certificate. Please try again.'
      })
    }
  }

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStudent) return
    
    const formData = new FormData(e.target as HTMLFormElement)
    const file = formData.get('certificate') as File
    
    if (!file) {
      alert('Please select a certificate file')
      return
    }
    
    try {
      await uploadCertificateFile(selectedStudent.id, file)
      
      // Update local state
      setCertificates(prev => prev.map(cert => 
        cert.id === selectedStudent.id 
          ? { ...cert, status: 'Approved', certificateFile: 'uploaded' }
          : cert
      ))
      
      setShowUploadModal(false)
      setSelectedStudent(null)
    } catch (error) {
      logger.error('Error uploading certificate:', error)
      alert('Failed to upload certificate')
    }
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
                  name="certificate"
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
