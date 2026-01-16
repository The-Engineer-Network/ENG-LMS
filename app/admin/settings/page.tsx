"use client"

import { useState } from "react"
import { Save, Key, Users, Clock } from "lucide-react"

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    cohortName: "January 2024 Cohort",
    maxStudents: 50,
    tasksPerTrack: 20,
    submissionDeadlineDays: 7,
    certificateApprovalRequired: true,
  })

  const handleSave = async () => {
    await new Promise((r) => setTimeout(r, 500))
    alert("Settings saved!")
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
          className="w-full py-3 rounded-lg bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold hover:shadow-lg hover:shadow-primary/50 transition-all flex items-center justify-center gap-2"
        >
          <Save className="w-5 h-5" />
          Save Settings
        </button>
      </div>
    </div>
  )
}
