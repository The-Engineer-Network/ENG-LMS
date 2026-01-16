"use client"

import { useState } from "react"
import { CheckCircle2, Lock, Download } from "lucide-react"

const mockCertificates = [
  { id: 1, student: "Alex Johnson", track: "Frontend", status: "Approved", approvedDate: "2024-02-20" },
  { id: 2, student: "Sarah Chen", track: "Backend", status: "Pending", tasksLeft: 1 },
  { id: 3, student: "Mike Johnson", track: "DevOps", status: "Approved", approvedDate: "2024-02-18" },
  { id: 4, student: "Emily Davis", track: "Web3", status: "Pending", tasksLeft: 3 },
  { id: 5, student: "Jordan Smith", track: "Frontend", status: "Approved", approvedDate: "2024-02-15" },
]

export default function CertificatesPage() {
  const [filter, setFilter] = useState<string>("all")

  const filteredCerts = mockCertificates.filter(
    (cert) => filter === "all" || cert.status.toLowerCase() === filter.toLowerCase(),
  )

  return (
    <div className="p-4 md:p-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8 animate-slideInUp">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Certificate Management</h1>
        <p className="text-foreground/60">Approve and manage student certificates</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-8">
        {["all", "Approved", "Pending"].map((status) => (
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
                <div
                  className={`p-3 rounded-lg ${cert.status === "Approved" ? "bg-green-500/20" : "bg-yellow-500/20"}`}
                >
                  {cert.status === "Approved" ? (
                    <CheckCircle2 className="w-6 h-6 text-green-400" />
                  ) : (
                    <Lock className="w-6 h-6 text-yellow-400" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold">{cert.student}</h3>
                  <p className="text-sm text-foreground/60">{cert.track} Track</p>
                  {cert.status === "Pending" && "tasksLeft" in cert && (
                    <p className="text-xs text-foreground/40 mt-1">{cert.tasksLeft} tasks remaining</p>
                  )}
                  {cert.status === "Approved" && "approvedDate" in cert && (
                    <p className="text-xs text-green-400 mt-1">Approved on {cert.approvedDate}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    cert.status === "Approved" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"
                  }`}
                >
                  {cert.status}
                </span>
                {cert.status === "Pending" && (
                  <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm hover:opacity-90 transition-opacity">
                    Approve
                  </button>
                )}
                {cert.status === "Approved" && (
                  <button className="p-2 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors">
                    <Download className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
