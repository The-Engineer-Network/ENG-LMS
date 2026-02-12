"use client"

import { useState, useEffect } from "react"
import { Users, RotateCw } from "lucide-react"
import { useAuth } from "@/lib/hooks/useAuth"
import { useToast } from "@/components/ui/toast"
import { getAllAccountabilityPartners, autoAssignAccountabilityPartners, getTracks, getCohorts, reassignAccountabilityPartner, getStudentEnrollments } from "@/lib/data"
import { logger } from "@/lib/logger"

export default function PartnersPage() {
  const { user, loading: authLoading } = useAuth()
  const { showToast } = useToast()
  const [partners, setPartners] = useState<any[]>([])
  const [tracks, setTracks] = useState<any[]>([])
  const [cohorts, setCohorts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [autopairing, setAutopairing] = useState(false)
  const [showAutoPairModal, setShowAutoPairModal] = useState(false)
  const [showReassignModal, setShowReassignModal] = useState(false)
  const [selectedPartnership, setSelectedPartnership] = useState<any>(null)
  const [availableStudents, setAvailableStudents] = useState<any[]>([])
  const [selectedTrack, setSelectedTrack] = useState("")
  const [selectedCohort, setSelectedCohort] = useState("")

  useEffect(() => {
    async function loadPartners() {
      logger.log('Partners useEffect triggered, user:', user?.id, 'authLoading:', authLoading)
      if (!user?.id) return
      
      try {
        logger.log('Loading partners page data...')
        
        // Load each data source separately to avoid cascade failures
        let partnersData: any[] = []
        let tracksData: any[] = []
        let cohortsData: any[] = []
        
        try {
          partnersData = await getAllAccountabilityPartners()
          logger.log('Partners loaded:', partnersData?.length || 0)
        } catch (partnersError) {
          logger.error('Error loading partners:', partnersError)
          partnersData = []
        }
        
        try {
          tracksData = await getTracks()
          logger.log('Tracks loaded:', tracksData?.length || 0, tracksData)
        } catch (tracksError) {
          logger.error('Error loading tracks:', tracksError)
          tracksData = []
        }
        
        try {
          cohortsData = await getCohorts()
          logger.log('Cohorts loaded:', cohortsData?.length || 0, cohortsData)
        } catch (cohortsError) {
          logger.error('Error loading cohorts:', cohortsError)
          cohortsData = []
        }
        
        logger.log('Partners page loaded data:', {
          partners: partnersData?.length || 0,
          tracks: tracksData?.length || 0,
          cohorts: cohortsData?.length || 0
        })
        
        // Transform partners to match expected structure
        const transformedPartners = partnersData.map((pair: any) => ({
          id: pair.id,
          student1: pair.student1?.full_name || 'Unknown Student',
          student2: pair.student2?.full_name || 'Unknown Student',
          track: pair.track?.name || 'Unknown Track',
          cohort: pair.cohort?.name || 'Unknown Cohort',
          createdDate: new Date(pair.created_at).toISOString().split('T')[0]
        }))
        
        setPartners(transformedPartners)
        setTracks(tracksData || [])
        setCohorts(cohortsData || [])
        
        logger.log('Partners page final state set:', {
          partnersCount: transformedPartners.length,
          tracksCount: (tracksData || []).length,
          cohortsCount: (cohortsData || []).length
        })
      } catch (error) {
        logger.error('Error in loadPartners function:', error)
        setPartners([])
        setTracks([])
        setCohorts([])
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading && user) {
      loadPartners()
    }
  }, [user, authLoading])

  const handleReassignPartner = async (partnership: any) => {
    try {
      // Load available students for reassignment
      const studentsData = await getStudentEnrollments()
      const filteredStudents = studentsData.filter(student => 
        student.track_id === partnership.track_id &&
        student.cohort_id === partnership.cohort_id &&
        student.user_id !== partnership.student1_id &&
        student.user_id !== partnership.student2_id
      )
      
      setAvailableStudents(filteredStudents)
      setSelectedPartnership(partnership)
      setShowReassignModal(true)
    } catch (error: any) {
      logger.error('Error loading students for reassignment:', error)
      showToast({
        type: 'error',
        title: 'Loading Failed',
        message: 'Failed to load available students for reassignment.'
      })
    }
  }

  const handleConfirmReassignment = async (newStudent1Id?: string, newStudent2Id?: string) => {
    if (!selectedPartnership || (!newStudent1Id && !newStudent2Id)) return

    try {
      await reassignAccountabilityPartner(selectedPartnership.id, newStudent1Id, newStudent2Id)
      
      // Refresh the partners list
      const partnersData: any[] = await getAllAccountabilityPartners()
      const transformedPartners = partnersData.map((pair: any) => ({
        id: pair.id,
        student1: pair.student1?.full_name || 'Unknown Student',
        student2: pair.student2?.full_name || 'Unknown Student',
        track: pair.track?.name || 'Unknown Track',
        cohort: pair.cohort?.name || 'Unknown Cohort',
        createdDate: new Date(pair.created_at).toISOString().split('T')[0]
      }))
      setPartners(transformedPartners)
      
      setShowReassignModal(false)
      setSelectedPartnership(null)
      
      showToast({
        type: 'success',
        title: 'Partnership Updated',
        message: 'The accountability partnership has been successfully reassigned.'
      })
    } catch (error: any) {
      logger.error('Error reassigning partner:', error)
      showToast({
        type: 'error',
        title: 'Reassignment Failed',
        message: error.message || 'Failed to reassign partner. Please try again.'
      })
    }
  }

  const handleAutopairing = async () => {
    if (!selectedTrack || !selectedCohort) {
      showToast({
        type: 'warning',
        title: 'Selection Required',
        message: 'Please select both a track and cohort for auto-pairing.'
      })
      return
    }

    setAutopairing(true)
    try {
      logger.log('Starting auto-pairing for:', { selectedTrack, selectedCohort })
      
      // Add a timeout to prevent hanging
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Auto-pairing request timed out after 30 seconds')), 30000)
      )
      
      const pairingPromise = autoAssignAccountabilityPartners(selectedTrack, selectedCohort)
      
      const newPairs = await Promise.race([pairingPromise, timeoutPromise]) as any[]
      
      if (newPairs && Array.isArray(newPairs) && newPairs.length > 0) {
        // Refresh the partners list
        const partnersData: any[] = await getAllAccountabilityPartners()
        const transformedPartners = partnersData.map((pair: any) => ({
          id: pair.id,
          student1: pair.student1?.full_name || 'Unknown Student',
          student2: pair.student2?.full_name || 'Unknown Student',
          track: pair.track?.name || 'Unknown Track',
          cohort: pair.cohort?.name || 'Unknown Cohort',
          createdDate: new Date(pair.created_at).toISOString().split('T')[0]
        }))
        setPartners(transformedPartners)
        
        showToast({
          type: 'success',
          title: 'Auto-Pairing Successful',
          message: `Successfully created ${newPairs.length} new accountability partnerships!`
        })
      } else {
        showToast({
          type: 'info',
          title: 'No New Pairs Created',
          message: 'All eligible students may already be paired, or there are insufficient unpaired students.'
        })
      }
      
      setShowAutoPairModal(false)
      setSelectedTrack("")
      setSelectedCohort("")
    } catch (error: any) {
      logger.error('Error with auto-pairing:', error)
      showToast({
        type: 'error',
        title: 'Auto-Pairing Failed',
        message: error.message || 'Failed to auto-pair students. Please try again.'
      })
    } finally {
      setAutopairing(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="p-4 md:p-8 max-w-7xl">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded-xl"></div>
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
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Accountability Partners</h1>
        <p className="text-foreground/60">Manage student pairings and partnerships</p>
      </div>

      {/* Partners Grid */}
      <div className="space-y-4">
        {partners.map((pair, i) => (
          <div
            key={pair.id}
            className="p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-300 animate-fadeInScale"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/20">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">
                    {pair.student1} & {pair.student2}
                  </h3>
                  <div className="flex gap-3">
                    <span className="text-xs px-2 py-1 rounded-full bg-secondary/20 text-secondary">{pair.track}</span>
                    <span className="text-xs text-foreground/60">Paired on {pair.createdDate}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => handleReassignPartner(pair)}
                  className="px-4 py-2 rounded-lg bg-background hover:bg-card transition-colors flex items-center gap-2 text-sm"
                >
                  <RotateCw className="w-4 h-4" />
                  Reassign
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Auto-Pair Section */}
      <div className="mt-8 p-6 rounded-xl bg-card border border-border animate-slideInLeft">
        <h3 className="text-xl font-bold mb-4">Auto-Pair Students</h3>
        <p className="text-foreground/60 text-sm mb-4">
          Automatically assign accountability partners based on track and progress
        </p>
        <button 
          onClick={() => {
            if (tracks.length === 0 || cohorts.length === 0) {
              showToast({
                type: 'warning',
                title: 'Data Loading',
                message: 'Please wait for tracks and cohorts to load before opening auto-pairing.'
              })
              return
            }
            
            setShowAutoPairModal(true)
          }}
          disabled={autopairing || loading || tracks.length === 0 || cohorts.length === 0}
          className="px-6 py-3 rounded-lg bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold hover:shadow-lg hover:shadow-primary/50 transition-all disabled:opacity-50"
        >
          {autopairing ? "Processing..." : loading ? "Loading..." : "Run Auto-Pairing"}
        </button>
      </div>

      {/* Auto-Pair Modal */}
      {showAutoPairModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Auto-Pair Students</h2>
            <p className="text-foreground/60 text-sm mb-4">
              Select a track and cohort to automatically pair unpaired students.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block font-medium mb-2">Track *</label>
                <select
                  value={selectedTrack}
                  onChange={(e) => setSelectedTrack(e.target.value)}
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
                  value={selectedCohort}
                  onChange={(e) => setSelectedCohort(e.target.value)}
                  className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="">Select a cohort</option>
                  {cohorts.map(cohort => (
                    <option key={cohort.id} value={cohort.id}>{cohort.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-6">
              <button
                type="button"
                onClick={() => {
                  setShowAutoPairModal(false)
                  setSelectedTrack("")
                  setSelectedCohort("")
                }}
                className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAutopairing}
                disabled={autopairing || !selectedTrack || !selectedCohort}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {autopairing ? "Pairing..." : "Start Pairing"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Reassign Partner Modal */}
      {showReassignModal && selectedPartnership && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Reassign Partnership</h2>
            <p className="text-foreground/60 text-sm mb-4">
              Current partnership: {selectedPartnership.student1} & {selectedPartnership.student2}
            </p>
            
            <ReassignmentForm
              availableStudents={availableStudents}
              currentPartnership={selectedPartnership}
              onConfirm={handleConfirmReassignment}
              onCancel={() => {
                setShowReassignModal(false)
                setSelectedPartnership(null)
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

// Reassignment Form Component
function ReassignmentForm({ 
  availableStudents, 
  currentPartnership, 
  onConfirm, 
  onCancel 
}: {
  availableStudents: any[]
  currentPartnership: any
  onConfirm: (newStudent1Id?: string, newStudent2Id?: string) => void
  onCancel: () => void
}) {
  const [newStudent1, setNewStudent1] = useState("")
  const [newStudent2, setNewStudent2] = useState("")
  const [reassignmentType, setReassignmentType] = useState<'replace_one' | 'replace_both'>('replace_one')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (reassignmentType === 'replace_one') {
      if (!newStudent1 && !newStudent2) {
        alert('Please select a student to replace one of the current partners.')
        return
      }
      onConfirm(newStudent1 || undefined, newStudent2 || undefined)
    } else {
      if (!newStudent1 || !newStudent2) {
        alert('Please select both students for the new partnership.')
        return
      }
      onConfirm(newStudent1, newStudent2)
    }
  }

  if (availableStudents.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-foreground/60 mb-4">No available students found in this track and cohort for reassignment.</p>
        <button
          onClick={onCancel}
          className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
        >
          Close
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block font-medium mb-2">Reassignment Type</label>
        <select
          value={reassignmentType}
          onChange={(e) => setReassignmentType(e.target.value as 'replace_one' | 'replace_both')}
          className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="replace_one">Replace one partner</option>
          <option value="replace_both">Replace both partners</option>
        </select>
      </div>

      {reassignmentType === 'replace_one' ? (
        <div>
          <label className="block font-medium mb-2">Select replacement student</label>
          <select
            value={newStudent1}
            onChange={(e) => {
              setNewStudent1(e.target.value)
              setNewStudent2("") // Clear the other selection
            }}
            className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Choose a student...</option>
            {availableStudents.map(student => (
              <option key={student.user_id} value={student.user_id}>
                {student.profile?.full_name || student.profile?.email || 'Unknown Student'}
              </option>
            ))}
          </select>
          <p className="text-sm text-foreground/60 mt-1">
            This student will replace one of the current partners
          </p>
        </div>
      ) : (
        <>
          <div>
            <label className="block font-medium mb-2">First Student</label>
            <select
              value={newStudent1}
              onChange={(e) => setNewStudent1(e.target.value)}
              className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
            >
              <option value="">Choose first student...</option>
              {availableStudents.map(student => (
                <option key={student.user_id} value={student.user_id}>
                  {student.profile?.full_name || student.profile?.email || 'Unknown Student'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium mb-2">Second Student</label>
            <select
              value={newStudent2}
              onChange={(e) => setNewStudent2(e.target.value)}
              className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
            >
              <option value="">Choose second student...</option>
              {availableStudents.filter(s => s.user_id !== newStudent1).map(student => (
                <option key={student.user_id} value={student.user_id}>
                  {student.profile?.full_name || student.profile?.email || 'Unknown Student'}
                </option>
              ))}
            </select>
          </div>
        </>
      )}

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Reassign Partnership
        </button>
      </div>
    </form>
  )
}
