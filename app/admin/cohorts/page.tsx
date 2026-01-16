"use client"

import type React from "react"

import { useState } from "react"
import { Plus, Trash2, Edit2 } from "lucide-react"

const mockCohorts = [
  { id: 1, name: "Cohort 1", startDate: "2024-01-15", endDate: "2024-02-26", students: 45, status: "Active" },
  { id: 2, name: "Cohort 2", startDate: "2024-02-01", endDate: "2024-03-13", students: 38, status: "Active" },
  { id: 3, name: "Cohort 3", startDate: "2024-03-01", endDate: "2024-04-12", students: 0, status: "Upcoming" },
]

export default function CohortsPage() {
  const [cohorts, setCohorts] = useState(mockCohorts)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    startDate: "",
    endDate: "",
  })

  const handleAddCohort = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.name.trim() && formData.startDate && formData.endDate) {
      setCohorts([
        ...cohorts,
        {
          id: cohorts.length + 1,
          name: formData.name,
          startDate: formData.startDate,
          endDate: formData.endDate,
          students: 0,
          status: "Upcoming",
        },
      ])
      setFormData({ name: "", startDate: "", endDate: "" })
      setShowForm(false)
    }
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8 animate-slideInUp">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Cohort Management</h1>
        <p className="text-foreground/60">Create and manage learning cohorts</p>
      </div>

      {/* Add Cohort Button */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="mb-8 px-6 py-3 rounded-lg bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold hover:shadow-lg hover:shadow-primary/50 transition-all flex items-center gap-2 animate-slideInUp"
      >
        <Plus className="w-5 h-5" />
        Create New Cohort
      </button>

      {/* Add Cohort Form */}
      {showForm && (
        <form
          onSubmit={handleAddCohort}
          className="mb-8 p-6 rounded-xl bg-card border border-border animate-slideInUp space-y-4"
        >
          <div>
            <label className="block text-sm font-semibold mb-2">
              Cohort Name <span className="text-accent">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Cohort 4"
              className="w-full px-4 py-2 rounded-lg bg-background border border-border text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary transition-colors"
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Start Date <span className="text-accent">*</span>
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:border-primary transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">
                End Date <span className="text-accent">*</span>
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:border-primary transition-colors"
                required
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
            >
              Create Cohort
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 px-4 py-2 rounded-lg bg-background border border-border text-foreground font-semibold hover:bg-card transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Cohorts List */}
      <div className="space-y-4">
        {cohorts.map((cohort, i) => (
          <div
            key={cohort.id}
            className="p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all animate-fadeInScale"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold mb-2">{cohort.name}</h3>
                <div className="flex gap-4 text-sm text-foreground/60 mb-3">
                  <span>Start: {cohort.startDate}</span>
                  <span>End: {cohort.endDate}</span>
                  <span>{cohort.students} students enrolled</span>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    cohort.status === "Active" ? "bg-primary/20 text-primary" : "bg-secondary/20 text-secondary"
                  }`}
                >
                  {cohort.status}
                </span>
              </div>

              <div className="flex gap-2">
                <button className="p-2 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors">
                  <Edit2 className="w-5 h-5" />
                </button>
                <button className="p-2 rounded-lg bg-accent/20 text-accent hover:bg-accent/30 transition-colors">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
