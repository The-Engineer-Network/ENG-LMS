"use client"

import { useState, useEffect } from "react"
import { User, Mail, MapPin, Github, Linkedin, Save, Upload } from "lucide-react"
import { useAuth } from "@/lib/hooks/useAuth"
import { getUserProfile, updateUserProfile, getStudentEnrollment } from "@/lib/data"
import { uploadProfilePicture } from "@/lib/storage"
import { logger } from "@/lib/logger"

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [enrollment, setEnrollment] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    async function loadProfile() {
      if (!user?.id) return
      
      try {
        const [profileData, enrollmentData] = await Promise.all([
          getUserProfile(user.id),
          getStudentEnrollment(user.id)
        ])
        
        if (profileData) {
          // Transform to match expected structure
          const mockProfile = {
            name: profileData.full_name,
            email: user.email,
            state: profileData.bio || '',
            track: enrollmentData?.track?.name || '',
            github: profileData.github_url || '',
            linkedin: profileData.linkedin_url || '',
            profile_picture_url: profileData.profile_picture_url
          }
          setProfile(mockProfile)
          setEnrollment(enrollmentData)
        }
      } catch (error) {
        logger.error('Error loading profile:', error)
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading && user) {
      loadProfile()
    }
  }, [user, authLoading])

  const handleSave = async () => {
    if (!user?.id || !profile) return
    
    setSaving(true)
    try {
      await updateUserProfile(user.id, {
        full_name: profile.name,
        bio: profile.state,
        github_url: profile.github,
        linkedin_url: profile.linkedin
      })
      setIsEditing(false)
    } catch (error) {
      logger.error('Error saving profile:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user?.id) return

    setUploading(true)
    try {
      const result = await uploadProfilePicture(user.id, file)
      if (result.url) {
        setProfile((prev: any) => ({ ...prev, profile_picture_url: result.url }))
      }
    } catch (error) {
      logger.error('Error uploading profile picture:', error)
    } finally {
      setUploading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="p-4 md:p-8 max-w-2xl">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
          <div className="h-96 bg-muted rounded-xl"></div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="p-4 md:p-8 max-w-2xl">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">Profile not found</h2>
          <p className="text-foreground/60">Unable to load your profile information.</p>
        </div>
      </div>
    )
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
        {/* Profile Picture */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={profile.profile_picture_url || "/placeholder-user.jpg"}
              alt="Profile"
              className="w-20 h-20 rounded-full object-cover border-2 border-border"
            />
            {isEditing && (
              <label className="absolute -bottom-2 -right-2 p-2 bg-primary text-primary-foreground rounded-full cursor-pointer hover:bg-primary/90 transition-colors">
                <Upload className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            )}
          </div>
          {uploading && (
            <div className="text-sm text-foreground/60">Uploading...</div>
          )}
        </div>

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
            disabled={saving}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold hover:shadow-lg hover:shadow-primary/50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        )}
      </div>
    </div>
  )
}
