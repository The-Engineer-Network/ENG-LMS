"use client"

import { Download, Lock, Award, CheckCircle2 } from "lucide-react"

export default function CertificatePage() {
  // Mock data - in real app, this would come from API
  const certificateData = {
    isApproved: false, // Change to true to test approved state
    studentName: "Shalom Alalade",
    track: "Frontend Development",
    cohort: "Cohort 1",
    completionDate: "February 28, 2024",
    certificateFile: "shalom-alalade-certificate.pdf",
    tasksCompleted: 17,
    totalTasks: 20
  }

  const handleDownload = () => {
    console.log("Downloading certificate:", certificateData.certificateFile)
    // TODO: Implement actual file download
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8 animate-slideInUp">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Certificate</h1>
        <p className="text-foreground/60">Your program completion certificate</p>
      </div>

      {certificateData.isApproved ? (
        <div className="animate-fadeInScale space-y-6">
          {/* Certificate Status */}
          <div className="p-6 rounded-xl bg-primary/10 border border-primary/20">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/20">
                <CheckCircle2 className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-primary">Certificate Ready!</h2>
                <p className="text-foreground/70">
                  Congratulations! Your {certificateData.track} certificate has been approved and is ready for download.
                </p>
              </div>
            </div>
          </div>

          {/* Certificate Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl bg-card border border-border">
              <h3 className="font-semibold mb-4">Certificate Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-foreground/60">Student:</span>
                  <span className="font-medium">{certificateData.studentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/60">Program:</span>
                  <span className="font-medium">{certificateData.track}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/60">Cohort:</span>
                  <span className="font-medium">{certificateData.cohort}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/60">Completion Date:</span>
                  <span className="font-medium">{certificateData.completionDate}</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-xl bg-card border border-border">
              <h3 className="font-semibold mb-4">Program Statistics</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-foreground/60">Tasks Completed:</span>
                  <span className="font-medium">{certificateData.tasksCompleted}/{certificateData.totalTasks}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/60">Completion Rate:</span>
                  <span className="font-medium">100%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/60">Status:</span>
                  <span className="font-medium text-primary">Graduated</span>
                </div>
              </div>
            </div>
          </div>

          {/* Download Section */}
          <div className="p-8 rounded-xl bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 border border-primary/20 text-center">
            <Award className="w-16 h-16 text-primary mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Download Your Certificate</h3>
            <p className="text-foreground/70 mb-6">
              Your official completion certificate is ready. You can download it and share it on LinkedIn, your portfolio, or with potential employers.
            </p>
            
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:shadow-lg hover:shadow-primary/30 transition-all transform hover:scale-105 font-semibold text-lg"
            >
              <Download className="w-6 h-6" />
              Download Certificate
            </button>
            
            <p className="text-xs text-foreground/50 mt-4">
              File: {certificateData.certificateFile} • PDF Format
            </p>
          </div>

          {/* Sharing Tips */}
          <div className="p-6 rounded-xl bg-secondary/10 border border-secondary/20">
            <h3 className="font-semibold mb-3 text-secondary">💡 Sharing Tips</h3>
            <ul className="text-sm text-foreground/70 space-y-2">
              <li>• Add this certificate to your LinkedIn profile under "Licenses & Certifications"</li>
              <li>• Include it in your portfolio to showcase your technical skills</li>
              <li>• Mention your completion in job applications and interviews</li>
              <li>• Share your achievement on social media to inspire others</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="animate-fadeInScale">
          {/* Locked State */}
          <div className="p-8 rounded-xl border-2 border-accent/20 bg-accent/5 text-center">
            <div className="space-y-6">
              <div className="p-4 rounded-full bg-accent/20 w-20 h-20 flex items-center justify-center mx-auto">
                <Lock className="w-10 h-10 text-accent" />
              </div>
              
              <div>
                <h2 className="text-2xl font-bold mb-2">Certificate Not Available</h2>
                <p className="text-foreground/70 mb-4">
                  Your certificate will be available once you complete all program requirements and it's approved by the admin.
                </p>
              </div>

              {/* Progress Info */}
              <div className="p-6 rounded-lg bg-card border border-border max-w-md mx-auto">
                <h3 className="font-semibold mb-4">Current Progress</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Tasks Completed:</span>
                    <span className="font-medium">{certificateData.tasksCompleted}/{certificateData.totalTasks}</span>
                  </div>
                  <div className="w-full bg-border rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all"
                      style={{ width: `${(certificateData.tasksCompleted / certificateData.totalTasks) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-foreground/60 text-center">
                    {certificateData.totalTasks - certificateData.tasksCompleted} tasks remaining
                  </p>
                </div>
              </div>

              <p className="text-sm text-foreground/60">
                Complete all tasks and wait for admin approval to unlock your certificate.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
