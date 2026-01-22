"use client"

import { useState } from "react"
import { User, Mail, MapPin, Github, Linkedin, Save } from "lucide-react"

const mockProfile = {
  name: "Alex Johnson",
  email: "alex.johnson@example.com",
  state: "California",
  track: "Frontend",
  github: "https://github.com/alexjohnson",
  linkedin: "https://linkedin.com/in/alexjohnson",
}

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState(mockProfile)

  const handleSave = async () => {
    // Mock save
    await new Promise((r) => setTimeout(r, 500))
    setIsEditing(false)
  }

  return (
    <div className="p-4 md:p-8 max-w-2xl">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between animate-slideInUp">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Profile</h1>
          <p className="text-foreground/60">Manage your account information</p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            isEditing ? "bg-secondary text-secondary-foreground" : "bg-primary text-primary-foreground"
          }`}
        >
          {isEditing ? "Cancel" : "Edit"}
        </button>
      </div>

      {/* Profile Card */}
      <div className="p-8 rounded-xl bg-card border border-border animate-fadeInScale space-y-6">
        {/* Name */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-foreground/60 mb-2">
            <User className="w-4 h-4" />
            Full Name
          </label>
          <input
            type="text"
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            disabled={!isEditing}
            className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground disabled:opacity-50 focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Email */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-foreground/60 mb-2">
            <Mail className="w-4 h-4" />
            Email (Cannot be changed)
          </label>
          <input
            type="email"
            value={profile.email}
            disabled
            className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground/50 disabled:opacity-50 focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* State */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-foreground/60 mb-2">
            <MapPin className="w-4 h-4" />
            State / Location
          </label>
          <input
            type="text"
            value={profile.state}
            onChange={(e) => setProfile({ ...profile, state: e.target.value })}
            disabled={!isEditing}
            className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground disabled:opacity-50 focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Track */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-foreground/60 mb-2">
            <span>📚</span>
            Track (Cannot be changed)
          </label>
          <input
            type="text"
            value={profile.track}
            disabled
            className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground/50 disabled:opacity-50 focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* GitHub */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-foreground/60 mb-2">
            <Github className="w-4 h-4" />
            GitHub Profile
          </label>
          <input
            type="url"
            value={profile.github}
            onChange={(e) => setProfile({ ...profile, github: e.target.value })}
            disabled={!isEditing}
            className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground disabled:opacity-50 focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* LinkedIn */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-foreground/60 mb-2">
            <Linkedin className="w-4 h-4" />
            LinkedIn Profile
          </label>
          <input
            type="url"
            value={profile.linkedin}
            onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })}
            disabled={!isEditing}
            className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground disabled:opacity-50 focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Save Button */}
        {isEditing && (
          <button
            onClick={handleSave}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold hover:shadow-lg hover:shadow-primary/50 transition-all flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            Save Changes
          </button>
        )}
      </div>
    </div>
  )
}
