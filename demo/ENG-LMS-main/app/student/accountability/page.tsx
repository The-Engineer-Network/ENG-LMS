"use client"

import Link from "next/link"
import { Github, Linkedin, MessageCircle } from "lucide-react"

const mockPartner = {
  id: 1,
  name: "Jordan Smith",
  track: "Frontend",
  profilePic: "/abstract-profile.png",
  github: "https://github.com/jordansmith",
  linkedin: "https://linkedin.com/in/jordansmith",
  bio: "Passionate about React and modern web development",
  progress: 72,
  tasksCompleted: 14,
  joinedDate: "2024-01-15",
}

export default function AccountabilityPage() {
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
            src={mockPartner.profilePic || "/placeholder.svg"}
            alt={mockPartner.name}
            className="w-24 h-24 rounded-xl object-cover"
          />
          <div className="flex-1">
            <h2 className="text-3xl font-bold mb-1">{mockPartner.name}</h2>
            <p className="text-secondary font-semibold mb-2">{mockPartner.track} Track</p>
            <p className="text-foreground/60">{mockPartner.bio}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { label: "Progress", value: `${mockPartner.progress}%` },
            { label: "Tasks Completed", value: mockPartner.tasksCompleted },
            { label: "Member Since", value: "Jan 2024" },
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
            <a
              href={mockPartner.github}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-background hover:bg-card transition-colors"
            >
              <Github className="w-5 h-5" />
              <span>GitHub</span>
            </a>
            <a
              href={mockPartner.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-background hover:bg-card transition-colors"
            >
              <Linkedin className="w-5 h-5" />
              <span>LinkedIn</span>
            </a>
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
