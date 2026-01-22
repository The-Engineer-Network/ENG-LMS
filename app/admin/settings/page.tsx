"use client"

import { useState, useEffect } from "react"
import { Save, Key, Users, Clock } from "lucide-react"
import { useAuth } from "@/lib/hooks/useAuth"
import { useToast } from "@/components/ui/toast"
import { getAdminSettings, updateAdminSettings, getCohorts } from "@/lib/data"

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth()
  const { showToast } = useToast()
  const [cohorts, setCohorts] = useState<any[]>([])
  const [settings, setSettings] = useState({
    cohortId: "",
    cohortName: "January 2024 Cohort",
    maxStudents: 50,
    tasksPerTrack: 20,
    submissionDeadlineDays: 7,
    certificateApprovalRequired: true,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function loadSettings() {
      if (!user?.id) return
      
      try {
        // Load cohorts first
        const cohortsData = await getCohorts()
        setCohorts(cohortsData)
        
        // Use the first active cohort as default, or first cohort if no active ones
        const defaultCohort = cohortsData.find(c => c.status === 'Active') || cohortsData[0]
        const defaultCohortId = defaultCohort?.id || ""
        
        // Load settings for the default cohort
        const settingsData = await getAdminSettings(defaultCohortId)
        
        setSettings({
          cohortId: defaultCohortId,
          cohortName: settingsData.cohort_name || defaultCohort?.name || "January 2024 Cohort",
          maxStudents: settingsData.max_students || 50,
          tasksPerTrack: settingsData.tasks_per_track || 20,
          submissionDeadlineDays: settingsData.submission_deadline_days || 7,
          certificateApprovalRequired: settingsData.certificate_approval_required ?? true,
        })
      } catch (error) {
        console.error('Error loading settings:', error)
        showToast({
          type: 'error',
          title: 'Loading Failed',
          message: 'Failed to load settings. Please refresh the page.'
        })
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading && user) {
      loadSettings()
    }
  }, [user, authLoading, showToast])

  const handleSave = async () => {
    if (!settings.cohortId) {
      showToast({
        type: 'warning',
        title: 'Cohort Required',
        message: 'Please select a cohort before saving settings.'
      })
      return
    }

    setSaving(true)
    try {
      await updateAdminSettings(settings.cohortId, {
        cohort_name: settings.cohortName,
        max_students: settings.maxStudents,
        tasks_per_track: settings.tasksPerTrack,
        submission_deadline_days: settings.submissionDeadlineDays,
        certificate_approval_required: settings.certificateApprovalRequired,
      })
      
      showToast({
        type: 'success',
        title: 'Settings Saved',
        message: 'Your admin settings have been successfully updated.'
      })
    } catch (error: any) {
      console.error('Error saving settings:', error)
      
      if (error.message?.includes('permission denied') || error.code === '42501') {
        showToast({
          type: 'error',
          title: 'Access Denied',
          message: 'You do not have permission to modify settings. Please ensure you have admin privileges.'
        })
      } else {
        showToast({
          type: 'error',
          title: 'Save Failed',
          message: error.message || 'Failed to save settings. Please try again.'
        })
      }
    } finally {
      setSaving(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="p-4 md:p-8 max-w-3xl">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 max-w-3xl">
      {/* Header */}
      <div className="mb-8 animate-slideInUp">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Settings</h1>
        <p className="text-foreground/60">Configure your ENG-Basecamp instance</p>
      </div>

      {/* Settings Form */}
      <div className="space-y-6">
        {/* Cohort Settings */}
        <div className="p-6 rounded-xl bg-card border border-border animate-fadeInScale space-y-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Users className="w-5 h-5" />
            Cohort Settings
          </h3>
          <div>
            <label className="block text-sm font-semibold text-foreground/60 mb-2">Select Cohort</label>
            <select
              value={settings.cohortId}
              onChange={(e) => {
                const selectedCohort = cohorts.find(c => c.id === e.target.value)
                setSettings({ 
                  ...settings, 
                  cohortId: e.target.value,
                  cohortName: selectedCohort?.name || settings.cohortName
                })
              }}
              className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:border-primary transition-colors"
            >
              <option value="">Select a cohort</option>
              {cohorts.map(cohort => (
                <option key={cohort.id} value={cohort.id}>
                  {cohort.name} ({cohort.status})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground/60 mb-2">Cohort Name</label>
            <input
              type="text"
              value={settings.cohortName}
              onChange={(e) => setSettings({ ...settings, cohortName: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground/60 mb-2">Max Students</label>
            <input
              type="number"
              value={settings.maxStudents}
              onChange={(e) => setSettings({ ...settings, maxStudents: Number.parseInt(e.target.value) })}
              className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        {/* Task Settings */}
        <div className="p-6 rounded-xl bg-card border border-border animate-fadeInScale space-y-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Key className="w-5 h-5" />
            Task Configuration
          </h3>
          <div>
            <label className="block text-sm font-semibold text-foreground/60 mb-2">Tasks Per Track</label>
            <input
              type="number"
              value={settings.tasksPerTrack}
              onChange={(e) => setSettings({ ...settings, tasksPerTrack: Number.parseInt(e.target.value) })}
              className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground/60 mb-2">Submission Deadline (Days)</label>
            <input
              type="number"
              value={settings.submissionDeadlineDays}
              onChange={(e) => setSettings({ ...settings, submissionDeadlineDays: Number.parseInt(e.target.value) })}
              className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        {/* Certificate Settings */}
        <div className="p-6 rounded-xl bg-card border border-border animate-fadeInScale space-y-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Certificate Settings
          </h3>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.certificateApprovalRequired}
              onChange={(e) => setSettings({ ...settings, certificateApprovalRequired: e.target.checked })}
              className="w-5 h-5 rounded"
            />
            <span className="text-sm">Require manual approval for certificates</span>
          </label>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 rounded-lg bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold hover:shadow-lg hover:shadow-primary/50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  )
}
