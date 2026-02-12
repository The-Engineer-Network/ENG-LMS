"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Github, Linkedin, MessageCircle } from "lucide-react"
import { useAuth } from "@/lib/hooks/useAuth"
import { getAccountabilityPartner } from "@/lib/data"
import { logger } from "@/lib/logger"

export default function AccountabilityPage() {
  const { user, loading: authLoading } = useAuth()
  const [partner, setPartner] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadPartner() {
      if (!user?.id) return
      
      try {
        const partnerData = await getAccountabilityPartner(user.id)
        if (partnerData) {
          // Determine which student is the partner (not the current user)
          const isStudent1 = partnerData.student1_id === user.id
          const partnerProfile = isStudent1 ? partnerData.student2 : partnerData.student1
          
          // Transform to match expected structure
          const mockPartner = {
            id: partnerProfile?.id || 1,
            name: partnerProfile?.full_name || 'No Partner Assigned',
            track: partnerData.track?.name || 'Unknown',
            profilePic: partnerProfile?.profile_picture_url || "/abstract-profile.png",
            github: partnerProfile?.github_url || '',
            linkedin: partnerProfile?.linkedin_url || '',
            bio: partnerProfile?.bio || "No bio available",
            progress: 72, // This would need to be calculated from their actual progress
            tasksCompleted: 14, // This would need to be calculated from their submissions
            joinedDate: partnerData.created_at?.split('T')[0] || "2024-01-15",
          }
          setPartner(mockPartner)
        }
      } catch (error) {
        logger.error('Error loading accountability partner:', error)
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading && user) {
      loadPartner()
    }
  }, [user, authLoading])

  if (authLoading || loading) {
    return (
      <div className="p-4 md:p-8 max-w-3xl">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
          <div className="h-96 bg-muted rounded-xl"></div>
        </div>
      </div>
    )
  }

  if (!partner || partner.name === 'No Partner Assigned') {
    return (
      <div className="p-4 md:p-8 max-w-3xl">
        {/* Header */}
        <div className="mb-8 animate-slideInUp">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Accountability Partner</h1>
          <p className="text-foreground/60">Stay motivated with your learning partner</p>
        </div>

        <div className="p-8 rounded-xl bg-card border border-border text-center">
          <div className="space-y-4">
            <div className="p-4 rounded-full bg-muted w-20 h-20 flex items-center justify-center mx-auto">
              <MessageCircle className="w-10 h-10 text-muted-foreground" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">No Partner Assigned</h2>
              <p className="text-foreground/70 mb-4">
                You haven't been paired with an accountability partner yet. Your admin will assign you a partner soon.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 max-w-3xl">
      {/* Header */}
      <div className="mb-8 animate-slideInUp">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Accountability Partner</h1>
        <p className="text-foreground/60">Stay motivated with your learning partner</p>
      </div>

      {/* Partner Card */}
      <div className="p-8 rounded-xl bg-card border border-border animate-fadeInScale space-y-6">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 pb-6 border-b border-border">
          <img
            src={partner.profilePic || "/placeholder.svg"}
            alt={partner.name}
            className="w-24 h-24 rounded-xl object-cover"
          />
          <div className="flex-1">
            <h2 className="text-3xl font-bold mb-1">{partner.name}</h2>
            <p className="text-secondary font-semibold mb-2">{partner.track} Track</p>
            <p className="text-foreground/60">{partner.bio}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { label: "Progress", value: `${partner.progress}%` },
            { label: "Tasks Completed", value: partner.tasksCompleted },
            { label: "Member Since", value: new Date(partner.joinedDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) },
          ].map((stat, i) => (
            <div key={i} className="p-4 rounded-lg bg-background border border-border/50">
              <p className="text-sm text-foreground/60 mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-primary">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Social Links */}
        <div className="space-y-3 pt-4">
          <p className="text-sm font-semibold text-foreground/60">Connect</p>
          <div className="flex gap-3">
            {partner.github && (
              <a
                href={partner.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-background hover:bg-card transition-colors"
              >
                <Github className="w-5 h-5" />
                <span>GitHub</span>
              </a>
            )}
            {partner.linkedin && (
              <a
                href={partner.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-background hover:bg-card transition-colors"
              >
                <Linkedin className="w-5 h-5" />
                <span>LinkedIn</span>
              </a>
            )}
          </div>
        </div>

        {/* Message Button */}
        <Link
          href="/student/chat"
          className="w-full py-3 rounded-lg bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold hover:shadow-lg hover:shadow-primary/50 transition-all flex items-center justify-center gap-2"
        >
          <MessageCircle className="w-5 h-5" />
          Start Chat
        </Link>
      </div>

      {/* Partner Activity */}
      <div className="mt-8 p-6 rounded-xl bg-card border border-border animate-slideInLeft">
        <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {[
            { action: 'Completed "State Management" task', time: "2 hours ago" },
            { action: 'Submitted "Component Composition"', time: "1 day ago" },
            { action: "Achieved 70% progress", time: "3 days ago" },
          ].map((activity, i) => (
            <div key={i} className="flex items-center gap-3 pb-3 border-b border-border last:border-b-0">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <div>
                <p className="text-sm">{activity.action}</p>
                <p className="text-xs text-foreground/40">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
