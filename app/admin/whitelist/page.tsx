"use client"

import { useState, useEffect } from "react"
import { Upload, Download, Plus, Trash2, Search, FileText, Users, AlertCircle } from "lucide-react"
import { useAuth } from "@/lib/hooks/useAuth"
import { getPaidLearnerWhitelist, getTracks, getCohorts, addWhitelistEntry, bulkAddWhitelistEntries, removeWhitelistEntry } from "@/lib/data"
import { useToast } from "@/components/ui/toast"

export default function WhitelistPage() {
  const { user, loading: authLoading } = useAuth()
  const { showToast } = useToast()
  const [whitelist, setWhitelist] = useState<any[]>([])
  const [tracks, setTracks] = useState<any[]>([])
  const [cohorts, setCohorts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterTrack, setFilterTrack] = useState("all")
  const [filterCohort, setFilterCohort] = useState("all")
  const [showAddForm, setShowAddForm] = useState(false)
  const [showBulkUpload, setShowBulkUpload] = useState(false)
  const [newEntry, setNewEntry] = useState({ email: "", track: "", cohort: "" })
  const [bulkData, setBulkData] = useState("")
  const [formLoading, setFormLoading] = useState(false)

  useEffect(() => {
    async function loadData() {
      if (!user?.id) return
      
      try {
        const [whitelistData, tracksData, cohortsData] = await Promise.all([
          getPaidLearnerWhitelist(),
          getTracks(),
          getCohorts()
        ])
        
        // Transform whitelist to match expected structure
        const transformedWhitelist = whitelistData.map((entry: any) => ({
          id: entry.id,
          email: entry.email,
          track: entry.track?.id || 'unknown',
          cohort: entry.cohort?.id || 'unknown',
          addedDate: entry.added_date,
          status: entry.status
        }))
        
        setWhitelist(transformedWhitelist)
        setTracks(tracksData)
        setCohorts(cohortsData)
      } catch (error) {
        console.error('Error loading whitelist data:', error)
        setWhitelist([])
        setTracks([])
        setCohorts([])
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading && user) {
      loadData()
    }
  }, [user, authLoading])

  const filteredWhitelist = whitelist.filter(entry => {
    const matchesSearch = entry.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTrack = filterTrack === "all" || entry.track === filterTrack
    const matchesCohort = filterCohort === "all" || entry.cohort === filterCohort
    return matchesSearch && matchesTrack && matchesCohort
  })

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEntry.email || !newEntry.track || !newEntry.cohort) return
    
    setFormLoading(true)
    try {
      console.log('Form data:', newEntry)
      console.log('Available tracks:', tracks)
      console.log('Available cohorts:', cohorts)
      
      // Fix: Use the selected IDs directly instead of searching by name
      const trackId = newEntry.track
      const cohortId = newEntry.cohort
      
      console.log('Selected trackId:', trackId, 'cohortId:', cohortId)
      
      if (!trackId || !cohortId) {
        showToast({
          type: 'error',
          title: 'Selection Required',
          message: 'Please select both a track and cohort.'
        })
        return
      }
      
      await addWhitelistEntry({
        email: newEntry.email,
        track_id: trackId,
        cohort_id: cohortId
      })
      
      showToast({
        type: 'success',
        title: 'Entry Added',
        message: `${newEntry.email} has been added to the whitelist.`
      })
      
      // Refresh whitelist
      const updatedWhitelist = await getPaidLearnerWhitelist()
      const transformedWhitelist = updatedWhitelist.map((entry: any) => ({
        id: entry.id,
        email: entry.email,
        track: entry.track?.id || 'Unknown Track',
        cohort: entry.cohort?.id || 'Unknown Cohort',
        status: entry.status,
        addedDate: entry.added_date
      }))
      setWhitelist(transformedWhitelist)
      
      setNewEntry({ email: "", track: "", cohort: "" })
      setShowAddForm(false)
    } catch (error) {
      console.error('Error adding whitelist entry:', error)
      showToast({
        type: 'error',
        title: 'Add Failed',
        message: 'Failed to add whitelist entry. Please try again.'
      })
    } finally {
      setFormLoading(false)
    }
  }

  const handleBulkUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!bulkData.trim()) return
    
    setFormLoading(true)
    try {
      // Parse CSV data
      const lines = bulkData.trim().split('\n')
      const entries = lines.slice(1).map(line => {
        const [email, trackName, cohortName] = line.split(',').map(s => s.trim())
        const trackId = tracks.find(t => t.name === trackName)?.id
        const cohortId = cohorts.find(c => c.name === cohortName)?.id
        return { email, track_id: trackId, cohort_id: cohortId }
      }).filter(entry => entry.track_id && entry.cohort_id)

      await bulkAddWhitelistEntries(entries)
      
      showToast({
        type: 'success',
        title: 'Bulk Upload Complete',
        message: `${entries.length} entries have been added to the whitelist.`
      })
      
      // Refresh whitelist
      const updatedWhitelist = await getPaidLearnerWhitelist()
      const transformedWhitelist = updatedWhitelist.map((entry: any) => ({
        id: entry.id,
        email: entry.email,
        track: entry.track?.name || 'Unknown Track',
        cohort: entry.cohort?.name || 'Unknown Cohort',
        status: entry.status,
        addedDate: entry.added_date
      }))
      setWhitelist(transformedWhitelist)
      
      setBulkData("")
      setShowBulkUpload(false)
    } catch (error) {
      console.error('Error bulk uploading entries:', error)
      showToast({
        type: 'error',
        title: 'Bulk Upload Failed',
        message: 'Failed to bulk upload entries. Please try again.'
      })
    } finally {
      setFormLoading(false)
    }
  }

  const handleRemoveEntry = async (id: string) => {
    if (!confirm("Are you sure you want to remove this entry from the whitelist?")) {
      return
    }

    try {
      await removeWhitelistEntry(id)
      
      // Update local state
      setWhitelist(prev => prev.filter(entry => entry.id !== id))
      
      showToast({
        type: 'success',
        title: 'Entry Removed',
        message: 'Whitelist entry has been removed successfully.'
      })
    } catch (error: any) {
      console.error('Error removing entry:', error)
      showToast({
        type: 'error',
        title: 'Remove Failed',
        message: error.message || 'Failed to remove whitelist entry. Please try again.'
      })
    }
  }

  const exportWhitelist = () => {
    const csvContent = [
      "Email,Track,Cohort,Added Date,Status",
      ...whitelist.map(entry => 
        `${entry.email},${entry.track},${entry.cohort},${entry.addedDate},${entry.status}`
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'paid-learners-whitelist.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (authLoading || loading) {
    return (
      <div className="p-4 md:p-8 max-w-7xl">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded-xl"></div>
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
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Paid Learner Whitelist</h1>
            <p className="text-foreground/60">Manage authorized learners for each track and cohort</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={exportWhitelist}
              className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={() => setShowBulkUpload(true)}
              className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
            >
              <Upload className="w-4 h-4" />
              Bulk Upload
            </button>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Entry
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-card border border-border rounded-lg">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{whitelist.length}</p>
                <p className="text-sm text-foreground/60">Total Entries</p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-card border border-border rounded-lg">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{whitelist.filter(e => e.status === "active").length}</p>
                <p className="text-sm text-foreground/60">Active</p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-card border border-border rounded-lg">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{whitelist.filter(e => e.status === "pending").length}</p>
                <p className="text-sm text-foreground/60">Pending</p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-card border border-border rounded-lg">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-secondary" />
              <div>
                <p className="text-2xl font-bold">{new Set(whitelist.map(e => e.track)).size}</p>
                <p className="text-sm text-foreground/60">Tracks</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Search by email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <select
            value={filterTrack}
            onChange={(e) => setFilterTrack(e.target.value)}
            className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Tracks</option>
            {tracks.map(track => (
              <option key={track.id} value={track.id}>{track.name}</option>
            ))}
          </select>
          <select
            value={filterCohort}
            onChange={(e) => setFilterCohort(e.target.value)}
            className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Cohorts</option>
            {cohorts.map(cohort => (
              <option key={cohort.id} value={cohort.id}>{cohort.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Whitelist Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-4 font-medium">Email</th>
                <th className="text-left p-4 font-medium">Track</th>
                <th className="text-left p-4 font-medium">Cohort</th>
                <th className="text-left p-4 font-medium">Added Date</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-left p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredWhitelist.map(entry => (
                <tr key={entry.id} className="border-t border-border hover:bg-muted/50">
                  <td className="p-4 font-medium">{entry.email}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-sm">
                      {tracks.find(t => t.id === entry.track)?.name || entry.track}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-secondary/10 text-secondary rounded-full text-sm">
                      {cohorts.find(c => c.id === entry.cohort)?.name || entry.cohort}
                    </span>
                  </td>
                  <td className="p-4 text-foreground/70">
                    {new Date(entry.addedDate).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      entry.status === "active" 
                        ? "bg-primary/10 text-primary"
                        : "bg-accent/10 text-accent"
                    }`}>
                      {entry.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleRemoveEntry(entry.id)}
                      className="p-2 text-accent hover:bg-accent/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Entry Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add Whitelist Entry</h2>
            
            <form onSubmit={handleAddEntry} className="space-y-4">
              <div>
                <label className="block font-medium mb-2">Email *</label>
                <input
                  type="email"
                  value={newEntry.email}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="learner@example.com"
                  className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block font-medium mb-2">Track *</label>
                <select
                  value={newEntry.track}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, track: e.target.value }))}
                  className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="">Select a track</option>
                  {tracks.map(track => (
                    <option key={track.id} value={track.id}>{track.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium mb-2">Cohort *</label>
                <select
                  value={newEntry.cohort}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, cohort: e.target.value }))}
                  className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="">Select a cohort</option>
                  {cohorts.map(cohort => (
                    <option key={cohort.id} value={cohort.id}>{cohort.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  {formLoading ? "Adding..." : "Add Entry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {showBulkUpload && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4">Bulk Upload Whitelist</h2>
            
            <div className="mb-4 p-4 bg-secondary/10 border border-secondary/20 rounded-lg">
              <h3 className="font-medium mb-2">CSV Format:</h3>
              <code className="text-sm">Email,Track,Cohort</code>
              <p className="text-sm text-foreground/70 mt-2">
                Example: john@example.com,frontend,cohort-1
              </p>
            </div>
            
            <form onSubmit={handleBulkUpload} className="space-y-4">
              <div>
                <label className="block font-medium mb-2">CSV Data *</label>
                <textarea
                  value={bulkData}
                  onChange={(e) => setBulkData(e.target.value)}
                  placeholder="Email,Track,Cohort&#10;john@example.com,frontend,cohort-1&#10;jane@example.com,backend,cohort-2"
                  className="w-full p-3 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
                  rows={8}
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowBulkUpload(false)}
                  className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  {formLoading ? "Uploading..." : "Upload Entries"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}