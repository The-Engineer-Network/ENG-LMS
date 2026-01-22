"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Plus, Trash2, Edit2 } from "lucide-react"
import { useAuth } from "@/lib/hooks/useAuth"
import { getCohorts, createCohort, updateCohort, deleteCohort } from "@/lib/data"

export default function CohortsPage() {
  const { user, loading: authLoading } = useAuth()
  const [cohorts, setCohorts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    startDate: "",
    endDate: "",
  })

  const [editingCohort, setEditingCohort] = useState<any>(null)

  useEffect(() => {
    async function loadCohorts() {
      if (!user?.id) return
      
      try {
        const cohortsData = await getCohorts()
        
        // Transform cohorts to match expected structure
        const transformedCohorts = cohortsData.map((cohort: any) => ({
          id: cohort.id,
          name: cohort.name,
          startDate: cohort.start_date,
          endDate: cohort.end_date,
          students: 0, // TODO: Get actual student count from enrollments
          status: cohort.status || (new Date(cohort.start_date) > new Date() ? "Upcoming" : "Active")
        }))
        
        setCohorts(transformedCohorts)
      } catch (error) {
        console.error('Error loading cohorts:', error)
        setCohorts([])
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading && user) {
      loadCohorts()
    }
  }, [user, authLoading])

  const handleAddCohort = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.name.trim() && formData.startDate && formData.endDate) {
      try {
        if (editingCohort) {
          const updatedCohort = await updateCohort(editingCohort.id, {
            name: formData.name,
            start_date: formData.startDate,
            end_date: formData.endDate,
            status: new Date(formData.startDate) > new Date() ? "Upcoming" : "Active"
          })
          
          // Update local state
          setCohorts(prev => prev.map(c => 
            c.id === editingCohort.id ? {
              id: updatedCohort.id,
              name: updatedCohort.name,
              startDate: updatedCohort.start_date,
              endDate: updatedCohort.end_date,
              students: 0,
              status: updatedCohort.status
            } : c
          ))
        } else {
          const newCohort = await createCohort({
            name: formData.name,
            start_date: formData.startDate,
            end_date: formData.endDate,
            status: new Date(formData.startDate) > new Date() ? "Upcoming" : "Active"
          })
          
          // Add to local state
          setCohorts(prev => [...prev, {
            id: newCohort.id,
            name: newCohort.name,
            startDate: newCohort.start_date,
            endDate: newCohort.end_date,
            students: 0,
            status: newCohort.status
          }])
        }
        
        setFormData({ name: "", startDate: "", endDate: "" })
        setEditingCohort(null)
        setShowForm(false)
      } catch (error) {
        console.error('Error saving cohort:', error)
        alert('Failed to save cohort')
      }
    }
  }

  const handleEditCohort = (cohort: any) => {
    setEditingCohort(cohort)
    setFormData({
      name: cohort.name,
      startDate: cohort.startDate,
      endDate: cohort.endDate
    })
    setShowForm(true)
  }

  const handleDeleteCohort = async (cohortId: string) => {
    if (confirm('Are you sure you want to delete this cohort? This action cannot be undone.')) {
      try {
        await deleteCohort(cohortId)
        setCohorts(prev => prev.filter(c => c.id !== cohortId))
      } catch (error) {
        console.error('Error deleting cohort:', error)
        alert('Failed to delete cohort')
      }
    }
  }

  if (authLoading || loading) {
    return (
      <div className="p-4 md:p-8 max-w-7xl">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded-xl"></div>
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
              {editingCohort ? "Update Cohort" : "Create Cohort"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false)
                setEditingCohort(null)
                setFormData({ name: "", startDate: "", endDate: "" })
              }}
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
                <button 
                  onClick={() => handleEditCohort(cohort)}
                  className="p-2 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => handleDeleteCohort(cohort.id)}
                  className="p-2 rounded-lg bg-accent/20 text-accent hover:bg-accent/30 transition-colors"
                >
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
