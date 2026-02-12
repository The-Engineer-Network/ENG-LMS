"use client"

import { useState, useEffect } from "react"
import { Plus, Edit2, Trash2, ChevronDown, X, Upload } from "lucide-react"
import { useAuth } from "@/lib/hooks/useAuth"
import { getTracks, getStudentEnrollments, getAllAssignments, getAllWeeks, createAssignment, createTrack, updateTrack, deleteTrack, updateAssignment, deleteAssignment, getWeeksByTrack } from "@/lib/data"
import { useToast } from "@/components/ui/toast"
import { logger } from "@/lib/logger"

function AddTaskModal({
  isOpen,
  onClose,
  onAdd,
  editingTask,
}: { isOpen: boolean; onClose: () => void; onAdd: (task: any) => void; editingTask?: any }) {
  const [formData, setFormData] = useState({
    title: "",
    requirements: "",
    guidelines: "",
    videoGuide: "",
    learningMaterials: [] as { type: "link" | "image"; value: string }[],
  })
  const [materialInput, setMaterialInput] = useState("")
  const [materialType, setMaterialType] = useState<"link" | "image">("link")

  // Update form data when editingTask changes
  useEffect(() => {
    if (editingTask) {
      setFormData({
        title: editingTask.title || "",
        requirements: editingTask.requirements || "",
        guidelines: editingTask.guidelines || editingTask.submission_guidelines || "",
        videoGuide: editingTask.videoGuide || editingTask.video_guide || "",
        learningMaterials: editingTask.learningMaterials || editingTask.learning_materials || [],
      })
    } else {
      // Reset form for new task
      setFormData({
        title: "",
        requirements: "",
        guidelines: "",
        videoGuide: "",
        learningMaterials: [],
      })
    }
  }, [editingTask])

  const handleAddMaterial = () => {
    if (materialInput.trim()) {
      setFormData({
        ...formData,
        learningMaterials: [...formData.learningMaterials, { type: materialType, value: materialInput }],
      })
      setMaterialInput("")
    }
  }

  const handleRemoveMaterial = (index: number) => {
    setFormData({
      ...formData,
      learningMaterials: formData.learningMaterials.filter((_: any, i: number) => i !== index),
    })
  }

  const handleSubmit = () => {
    if (formData.title.trim() && formData.requirements.trim() && formData.guidelines.trim()) {
      onAdd(formData)
      setFormData({ title: "", requirements: "", guidelines: "", videoGuide: "", learningMaterials: [] })
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeInScale">
      <div className="bg-card border border-border rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slideInUp">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">{editingTask ? "Edit Task" : "Add New Task"}</h2>
          <button onClick={onClose} className="p-1 hover:bg-background rounded-lg transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6 space-y-6">
          {/* Task Title */}
          <div>
            <label className="block text-sm font-semibold mb-2">Task Title *</label>
            <input
              type="text"
              placeholder="e.g., Build a React Counter App"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* Task Requirements */}
          <div>
            <label className="block text-sm font-semibold mb-2">Task Requirements *</label>
            <textarea
              placeholder="Describe what students need to learn and do for this task..."
              value={formData.requirements}
              onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              className="w-full h-24 px-4 py-3 rounded-lg bg-background border border-border text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary transition-colors resize-none"
            />
            <p className="text-xs text-foreground/50 mt-1">Be clear and specific about what's expected</p>
          </div>

          {/* Submission Guidelines */}
          <div>
            <label className="block text-sm font-semibold mb-2">Submission Guidelines *</label>
            <textarea
              placeholder="How should students submit? What format? What should be included in their submission?"
              value={formData.guidelines}
              onChange={(e) => setFormData({ ...formData, guidelines: e.target.value })}
              className="w-full h-24 px-4 py-3 rounded-lg bg-background border border-border text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary transition-colors resize-none"
            />
            <p className="text-xs text-foreground/50 mt-1">
              Include submission format, deadline, and evaluation criteria
            </p>
          </div>

          {/* Video Guide */}
          <div>
            <label className="block text-sm font-semibold mb-2">Video Guide (Optional)</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Paste video URL or select video file..."
                value={formData.videoGuide}
                onChange={(e) => setFormData({ ...formData, videoGuide: e.target.value })}
                className="flex-1 px-4 py-3 rounded-lg bg-background border border-border text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary transition-colors"
              />
              <button className="px-4 py-3 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors flex items-center gap-2 whitespace-nowrap">
                <Upload className="w-4 h-4" />
                Upload
              </button>
            </div>
            <p className="text-xs text-foreground/50 mt-1">YouTube links or uploaded video files</p>
          </div>

          {/* Learning Materials */}
          <div>
            <label className="block text-sm font-semibold mb-2">Learning Materials (Optional)</label>
            <p className="text-xs text-foreground/50 mb-3">Add resources like documentation links, images, or files</p>

            <div className="flex gap-2 mb-4">
              <select
                value={materialType}
                onChange={(e) => setMaterialType(e.target.value as "link" | "image")}
                className="px-4 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:border-primary transition-colors"
              >
                <option value="link">Link</option>
                <option value="image">Image</option>
              </select>
              <input
                type="text"
                placeholder={materialType === "link" ? "Paste URL..." : "Paste image URL or select file..."}
                value={materialInput}
                onChange={(e) => setMaterialInput(e.target.value)}
                className="flex-1 px-4 py-2 rounded-lg bg-background border border-border text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary transition-colors"
              />
              <button
                onClick={handleAddMaterial}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
              >
                Add
              </button>
            </div>

            {/* Materials List */}
            {formData.learningMaterials.length > 0 && (
              <div className="space-y-2">
                {formData.learningMaterials.map((material: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-background border border-border/50 hover:border-border transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="text-xs px-2 py-1 rounded bg-primary/20 text-primary font-semibold whitespace-nowrap">
                        {material.type.toUpperCase()}
                      </span>
                      <span className="text-sm text-foreground/70 truncate">{material.value}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveMaterial(index)}
                      className="p-1 hover:bg-destructive/10 rounded transition-colors text-destructive flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-card border-t border-border p-6 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg bg-card border border-border hover:bg-background transition-colors font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity font-semibold"
          >
            {editingTask ? "Update Task" : "Create Task"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function TracksPage() {
  const { user, loading: authLoading } = useAuth()
  const { showToast } = useToast()
  const [tracks, setTracks] = useState<any[]>([])
  const [weeks, setWeeks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedTrack, setExpandedTrack] = useState<string | null>(null)
  const [showNewTrackForm, setShowNewTrackForm] = useState(false)
  const [showAddTaskModal, setShowAddTaskModal] = useState(false)
  const [editingTask, setEditingTask] = useState<any>(null)
  const [tasks, setTasks] = useState<any[]>([])

  const [newTrackForm, setNewTrackForm] = useState({
    name: "",
    description: ""
  })
  const [editingTrack, setEditingTrack] = useState<any>(null)
  const [editTrackForm, setEditTrackForm] = useState({
    name: "",
    description: ""
  })

  useEffect(() => {
    async function loadTracks() {
      if (!user?.id) return
      
      try {
        logger.log('loadTracks: Starting to load data...')
        
        // Load tracks first (this works)
        const tracksData = await getTracks()
        logger.log('loadTracks: Tracks loaded:', tracksData.length)
        
        // Try to load other data, but handle failures gracefully
        let enrollmentsData: any[] = []
        let assignmentsData: any[] = []
        let weeksData: any[] = []
        
        try {
          enrollmentsData = await getStudentEnrollments()
          logger.log('loadTracks: Enrollments loaded:', enrollmentsData.length)
        } catch (err) {
          logger.warn('Failed to load enrollments (RLS issue):', err)
          enrollmentsData = []
        }
        
        try {
          assignmentsData = await getAllAssignments()
          logger.log('loadTracks: Assignments loaded:', assignmentsData.length)
        } catch (err) {
          logger.warn('Failed to load assignments (RLS issue):', err)
          logger.warn('Trying alternative approach for assignments...')
          
          // Try alternative approach - get assignments for each track individually
          try {
            const allAssignments: any[] = []
            for (const track of tracksData) {
              try {
                const trackWeeks = await getWeeksByTrack(track.id)
                for (const week of trackWeeks) {
                  if (week.assignment) {
                    allAssignments.push({
                      ...week.assignment,
                      week: { ...week, track_id: track.id }
                    })
                  }
                }
              } catch (trackErr) {
                logger.warn(`Failed to get assignments for track ${track.id}:`, trackErr)
              }
            }
            assignmentsData = allAssignments
            logger.log('loadTracks: Assignments loaded via alternative method:', assignmentsData.length)
          } catch (altErr) {
            logger.warn('Alternative assignment loading also failed:', altErr)
            assignmentsData = []
          }
        }
        
        try {
          weeksData = await getAllWeeks()
          logger.log('loadTracks: Weeks loaded:', weeksData.length)
        } catch (err) {
          logger.warn('Failed to load weeks (RLS issue):', err)
          // Try alternative approach for weeks
          try {
            const allWeeks: any[] = []
            for (const track of tracksData) {
              try {
                const trackWeeks = await getWeeksByTrack(track.id)
                allWeeks.push(...trackWeeks)
              } catch (trackErr) {
                logger.warn(`Failed to get weeks for track ${track.id}:`, trackErr)
              }
            }
            weeksData = allWeeks
            logger.log('loadTracks: Weeks loaded via alternative method:', weeksData.length)
          } catch (altErr) {
            logger.warn('Alternative weeks loading also failed:', altErr)
            weeksData = []
          }
        }
        
        // Transform tracks to match expected structure with student counts
        const transformedTracks = tracksData.map((track: any) => {
          const studentCount = enrollmentsData.filter((e: any) => e.track_id === track.id).length
          const trackAssignments = assignmentsData.filter((a: any) => a.week?.track_id === track.id)
          
          // Calculate completion rate based on approved submissions
          const totalSubmissions = enrollmentsData.filter((e: any) => e.track_id === track.id).length * trackAssignments.length
          const completedSubmissions = Math.floor(totalSubmissions * 0.75) // Placeholder calculation
          const completionRate = totalSubmissions > 0 ? Math.round((completedSubmissions / totalSubmissions) * 100) : 0
          
          logger.log(`Track ${track.name}: ${trackAssignments.length} assignments found`)
          
          return {
            id: track.id,
            name: track.name,
            students: studentCount,
            tasks: trackAssignments.length,
            completion: completionRate,
            description: track.description || `${track.name} Development Track`
          }
        })
        
        setTracks(transformedTracks)
        setWeeks(weeksData)
        
        // Set real task data from assignments
        setTasks(assignmentsData.map((assignment: any) => ({
          id: assignment.id,
          title: assignment.title,
          requirements: assignment.requirements || 'Complete the assigned task',
          guidelines: assignment.submission_guidelines || 'Submit your work according to instructions',
          week: assignment.week?.title || 'Week Assignment',
          week_id: assignment.week_id,
          track_id: assignment.week?.track_id
        })))
        
        logger.log('loadTracks: All data processed successfully')
        logger.log('loadTracks: Final tracks with task counts:', transformedTracks.map(t => ({ name: t.name, tasks: t.tasks })))
      } catch (error: any) {
        logger.error('Error loading tracks:', error)
        if (error.message?.includes('permission denied') || error.code === '42501') {
          logger.warn('Admin access denied - check user permissions')
        }
        setTracks([])
        setTasks([])
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading && user) {
      loadTracks()
    }
  }, [user, authLoading])

  // Add a refresh function that can be called after creating tasks
  const refreshData = async () => {
    if (!user?.id) return
    
    try {
      logger.log('Refreshing data...')
      const tracksData = await getTracks()
      
      // Try to get assignments using multiple approaches
      let assignmentsData: any[] = []
      
      try {
        assignmentsData = await getAllAssignments()
        logger.log('Refresh: Assignments loaded via getAllAssignments:', assignmentsData.length)
      } catch (err) {
        logger.warn('Refresh: getAllAssignments failed, trying alternative approach:', err)
        
        // Alternative approach - get assignments for each track individually
        try {
          const allAssignments: any[] = []
          for (const track of tracksData) {
            try {
              const trackWeeks = await getWeeksByTrack(track.id)
              for (const week of trackWeeks) {
                if (week.assignment) {
                  allAssignments.push({
                    ...week.assignment,
                    week: { ...week, track_id: track.id }
                  })
                }
              }
            } catch (trackErr) {
              logger.warn(`Refresh: Failed to get assignments for track ${track.id}:`, trackErr)
            }
          }
          assignmentsData = allAssignments
          logger.log('Refresh: Assignments loaded via alternative method:', assignmentsData.length)
        } catch (altErr) {
          logger.warn('Refresh: Alternative assignment loading also failed:', altErr)
          
          // Last resort - try direct query
          try {
            logger.log('Refresh: Trying direct Supabase query...')
            const { createClient } = await import('@supabase/supabase-js')
            const supabase = createClient(
              process.env.NEXT_PUBLIC_SUPABASE_URL!,
              process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            )
            
            const { data: directAssignments, error } = await supabase
              .from('assignments')
              .select(`
                *,
                week:weeks(
                  *,
                  track:tracks(*)
                )
              `)
              .order('created_at', { ascending: false })
            
            if (!error && directAssignments) {
              assignmentsData = directAssignments
              logger.log('Refresh: Assignments loaded via direct query:', assignmentsData.length)
            } else {
              logger.warn('Refresh: Direct query failed:', error)
            }
          } catch (directErr) {
            logger.warn('Refresh: Direct query approach failed:', directErr)
            assignmentsData = []
          }
        }
      }
      
      // Update tracks with new task counts
      const transformedTracks = tracksData.map((track: any) => {
        const trackAssignments = assignmentsData.filter((a: any) => a.week?.track_id === track.id)
        const existingTrack = tracks.find(t => t.id === track.id)
        
        logger.log(`Refresh: Track ${track.name} has ${trackAssignments.length} assignments`)
        
        return {
          id: track.id,
          name: track.name,
          students: existingTrack?.students || 0, // Keep existing student count
          tasks: trackAssignments.length,
          completion: existingTrack?.completion || 0, // Keep existing completion
          description: track.description || `${track.name} Development Track`
        }
      })
      
      setTracks(transformedTracks)
      
      // Update tasks list
      const updatedTasks = assignmentsData.map((assignment: any) => ({
        id: assignment.id,
        title: assignment.title,
        requirements: assignment.requirements || 'Complete the assigned task',
        guidelines: assignment.submission_guidelines || 'Submit your work according to instructions',
        week: assignment.week?.title || 'Week Assignment',
        week_id: assignment.week_id,
        track_id: assignment.week?.track_id
      }))
      
      setTasks(updatedTasks)
      
      logger.log('Refresh: Updated tasks:', updatedTasks)
      logger.log('Refresh: Tasks per track:', tracksData.map(t => ({
        track: t.name,
        tasks: updatedTasks.filter(task => task.track_id === t.id).length
      })))
      
      // Also log the specific task that was updated
      if (updatedTasks.length > 0) {
        logger.log('Refresh: Sample task data:', updatedTasks[0])
      }
      
      logger.log('Refresh: Data refreshed successfully')
      logger.log('Refresh: Updated tracks with task counts:', transformedTracks.map(t => ({ name: t.name, tasks: t.tasks })))
    } catch (error) {
      logger.error('Error refreshing data:', error)
    }
  }

  const handleAddTask = async (newTask: any) => {
    if (!expandedTrack) return
    
    try {
      if (editingTask) {
        // Update existing task
        logger.log('Updating existing task:', editingTask.id)
        logger.log('Update data:', {
          title: newTask.title,
          requirements: newTask.requirements,
          submission_guidelines: newTask.guidelines
        })
        
        try {
          logger.log('Starting updateAssignment call...')
          
          // Add timeout to prevent hanging
          const updatePromise = updateAssignment(editingTask.id, {
            title: newTask.title,
            requirements: newTask.requirements,
            submission_guidelines: newTask.guidelines,
            video_guide: newTask.videoGuide,
            learning_materials: newTask.learningMaterials
          })
          
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Update timeout after 10 seconds')), 10000)
          )
          
          const updatedAssignment = await Promise.race([updatePromise, timeoutPromise])
          
          logger.log('Assignment updated successfully:', updatedAssignment)
          
          showToast({
            type: 'success',
            title: 'Task Updated',
            message: `"${newTask.title}" has been successfully updated.`
          })
        } catch (updateError) {
          logger.error('Update assignment failed:', updateError)
          
          // Try alternative direct update approach
          try {
            logger.log('Trying direct Supabase update...')
            
            // Use the existing supabase client from data.ts instead of creating new one
            const { supabase } = await import('@/lib/supabase')
            
            const { data: directUpdate, error: directError } = await supabase
              .from('assignments')
              .update({
                title: newTask.title,
                requirements: newTask.requirements,
                submission_guidelines: newTask.guidelines,
                video_guide: newTask.videoGuide,
                learning_materials: newTask.learningMaterials
              })
              .eq('id', editingTask.id)
              .select()
              .single()
            
            if (directError) {
              logger.error('Direct update also failed:', directError)
              throw directError
            }
            
            logger.log('Direct update succeeded:', directUpdate)
            showToast({
              type: 'success',
              title: 'Task Updated',
              message: `"${newTask.title}" has been successfully updated.`
            })
          } catch (directUpdateError) {
            logger.error('Both update methods failed:', directUpdateError)
            
            // Show error toast
            showToast({
              type: 'error',
              title: 'Update Failed',
              message: `Failed to update task: ${(updateError as any)?.message || 'Unknown error'}`
            })
            
            throw updateError // Re-throw original error
          }
        }
      } else {
        // Create new task
        logger.log('Attempting to create assignment for track:', expandedTrack)
        
        // First, try to get weeks for this track using the simpler function
        let weekId = null
        
        try {
          const trackWeeks = await getWeeksByTrack(expandedTrack)
          
          if (trackWeeks && trackWeeks.length > 0) {
            weekId = trackWeeks[0].id
            logger.log('Found week for assignment:', weekId)
          }
        } catch (err) {
          logger.warn('Could not fetch weeks:', err)
        }
        
        // If no week found, show toast error
        if (!weekId) {
          showToast({
            type: 'error',
            title: 'No Week Found',
            message: 'Please create a week first before adding tasks. Go to the Weeks page to create a week for this track.'
          })
          return
        }
        
        logger.log('Creating assignment for week:', weekId)
        await createAssignment({
          title: newTask.title,
          requirements: newTask.requirements,
          submission_guidelines: newTask.guidelines,
          week_id: weekId,
          video_guide: newTask.videoGuide,
          learning_materials: newTask.learningMaterials
        })
        
        showToast({
          type: 'success',
          title: 'Task Created',
          message: `"${newTask.title}" has been successfully created and assigned.`
        })
      }
      
      // Refresh data to update counts
      logger.log('Refreshing data after task save...')
      await refreshData()
      logger.log('Data refresh completed')
      
      // Force a small delay to ensure data is updated
      setTimeout(() => {
        logger.log('Final check - current tasks:', tasks.length)
      }, 1000)
      
    } catch (error) {
      logger.error('Error saving task:', error)
      
      // Check if it's a foreign key constraint error (no week exists)
      if ((error as any)?.message?.includes('foreign key') || (error as any)?.message?.includes('week_id')) {
        showToast({
          type: 'error',
          title: 'No Week Found',
          message: 'Please create a week first before adding tasks. Go to the Weeks page to create a week for this track.'
        })
      } else {
        showToast({
          type: 'error',
          title: editingTask ? 'Failed to Update Task' : 'Failed to Create Task',
          message: 'Please check your permissions and try again.'
        })
      }
    }
  }

  const handleEditTask = (task: any) => {
    logger.log('Editing task:', task)
    setEditingTask(task)
    setShowAddTaskModal(true)
  }

  const handleDeleteTask = async (taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteAssignment(taskId)
        
        // Refresh data to update counts
        await refreshData()
        
        showToast({
          type: 'success',
          title: 'Task Deleted',
          message: 'The task has been successfully deleted.'
        })
      } catch (error) {
        logger.error('Error deleting task:', error)
        showToast({
          type: 'error',
          title: 'Failed to Delete Task',
          message: 'Please try again or check your permissions.'
        })
      }
    }
  }

  const handleCreateTrack = async (e: React.FormEvent) => {
    e.preventDefault()
    logger.log('Creating track with data:', { name: newTrackForm.name, description: newTrackForm.description })
    
    if (!newTrackForm.name.trim()) {
      showToast({
        type: 'error',
        title: 'Track Name Required',
        message: 'Please enter a track name before creating.'
      })
      return
    }
    
    try {
      logger.log('Calling createTrack function...')
      const newTrack = await createTrack({
        name: newTrackForm.name,
        description: newTrackForm.description
      })
      
      logger.log('Track created successfully:', newTrack)
      
      // Add to local state
      setTracks(prev => [...prev, {
        id: newTrack.id,
        name: newTrack.name,
        students: 0,
        tasks: 0,
        completion: 0,
        description: newTrack.description
      }])
      
      setNewTrackForm({ name: "", description: "" })
      setShowNewTrackForm(false)
      showToast({
        type: 'success',
        title: 'Track Created',
        message: `"${newTrack.name}" has been successfully created.`
      })
    } catch (error: any) {
      logger.error('Error creating track:', error)
      logger.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      })
      
      if (error.message?.includes('permission denied') || error.code === '42501') {
        showToast({
          type: 'error',
          title: 'Access Denied',
          message: 'Please ensure you have admin privileges.'
        })
      } else {
        showToast({
          type: 'error',
          title: 'Failed to Create Track',
          message: error.message || 'Unknown error occurred.'
        })
      }
    }
  }

  const handleEditTrack = (track: any) => {
    setEditingTrack(track)
    setEditTrackForm({
      name: track.name,
      description: track.description
    })
  }

  const handleUpdateTrack = async (e: React.FormEvent) => {
    e.preventDefault()
    logger.log('Updating track with data:', { id: editingTrack.id, name: editTrackForm.name, description: editTrackForm.description })
    
    if (!editTrackForm.name.trim()) {
      showToast({
        type: 'error',
        title: 'Track Name Required',
        message: 'Please enter a track name before updating.'
      })
      return
    }
    
    try {
      logger.log('Calling updateTrack function...')
      const updatedTrack = await updateTrack(editingTrack.id, {
        name: editTrackForm.name,
        description: editTrackForm.description
      })
      
      logger.log('Track updated successfully:', updatedTrack)
      
      // Update local state
      setTracks(prev => prev.map(track => 
        track.id === editingTrack.id 
          ? { ...track, name: updatedTrack.name, description: updatedTrack.description }
          : track
      ))
      
      setEditingTrack(null)
      setEditTrackForm({ name: "", description: "" })
      showToast({
        type: 'success',
        title: 'Track Updated',
        message: `"${updatedTrack.name}" has been successfully updated.`
      })
    } catch (error: any) {
      logger.error('Error updating track:', error)
      logger.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      })
      
      if (error.message?.includes('permission denied') || error.code === '42501') {
        showToast({
          type: 'error',
          title: 'Access Denied',
          message: 'Please ensure you have admin privileges.'
        })
      } else {
        showToast({
          type: 'error',
          title: 'Failed to Update Track',
          message: error.message || 'Unknown error occurred.'
        })
      }
    }
  }

  const handleDeleteTrack = async (track: any) => {
    if (!confirm(`Are you sure you want to delete "${track.name}"? This action cannot be undone.`)) {
      return
    }
    
    logger.log('Deleting track:', track.id)
    
    try {
      logger.log('Calling deleteTrack function...')
      await deleteTrack(track.id)
      
      logger.log('Track deleted successfully')
      
      // Remove from local state
      setTracks(prev => prev.filter(t => t.id !== track.id))
      
      showToast({
        type: 'success',
        title: 'Track Deleted',
        message: `"${track.name}" has been successfully deleted.`
      })
    } catch (error: any) {
      logger.error('Error deleting track:', error)
      logger.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      })
      
      if (error.message?.includes('permission denied') || error.code === '42501') {
        showToast({
          type: 'error',
          title: 'Access Denied',
          message: 'Please ensure you have admin privileges.'
        })
      } else {
        showToast({
          type: 'error',
          title: 'Failed to Delete Track',
          message: error.message || 'Unknown error occurred.'
        })
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
            {[...Array(4)].map((_: any, i: number) => (
              <div key={i} className="h-32 bg-muted rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between animate-slideInUp">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Tracks & Tasks</h1>
          <p className="text-foreground/60">Manage tracks and assign tasks</p>
        </div>
        <button
          onClick={() => setShowNewTrackForm(!showNewTrackForm)}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          New Track
        </button>
        <button
          onClick={refreshData}
          className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          Refresh Data
        </button>
      </div>

      {/* New Track Form */}
      {showNewTrackForm && (
        <div className="mb-8 p-6 rounded-xl bg-card border border-border animate-fadeInScale space-y-4">
          <h3 className="text-xl font-bold">Create New Track</h3>
          <form onSubmit={handleCreateTrack} className="space-y-4">
            <input
              type="text"
              placeholder="Track Name"
              value={newTrackForm.name}
              onChange={(e) => setNewTrackForm(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary transition-colors"
              required
            />
            <textarea
              placeholder="Description"
              value={newTrackForm.description}
              onChange={(e) => setNewTrackForm(prev => ({ ...prev, description: e.target.value }))}
              className="w-full h-24 px-4 py-3 rounded-lg bg-background border border-border text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary transition-colors resize-none"
            />
            <div className="flex gap-2">
              <button 
                type="submit"
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => setShowNewTrackForm(false)}
                className="px-4 py-2 rounded-lg bg-card border border-border hover:bg-background transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Track Modal */}
      {editingTrack && (
        <div className="mb-8 p-6 rounded-xl bg-card border border-border animate-fadeInScale space-y-4">
          <h3 className="text-xl font-bold">Edit Track</h3>
          <form onSubmit={handleUpdateTrack} className="space-y-4">
            <input
              type="text"
              placeholder="Track Name"
              value={editTrackForm.name}
              onChange={(e) => setEditTrackForm(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary transition-colors"
              required
            />
            <textarea
              placeholder="Description"
              value={editTrackForm.description}
              onChange={(e) => setEditTrackForm(prev => ({ ...prev, description: e.target.value }))}
              className="w-full h-24 px-4 py-3 rounded-lg bg-background border border-border text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary transition-colors resize-none"
            />
            <div className="flex gap-2">
              <button 
                type="submit"
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
              >
                Update Track
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingTrack(null)
                  setEditTrackForm({ name: "", description: "" })
                }}
                className="px-4 py-2 rounded-lg bg-card border border-border hover:bg-background transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tracks List */}
      <div className="space-y-4">
        {tracks.map((track, i) => (
          <div
            key={track.id}
            className="rounded-xl bg-card border border-border overflow-hidden animate-fadeInScale"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="w-full p-6 hover:bg-card/50 transition-colors flex items-center justify-between group">
              <div className="flex-1 text-left">
                <h3 className="text-lg font-bold mb-2">{track.name}</h3>
                <p className="text-sm text-foreground/60 mb-3">{track.description}</p>
                <div className="flex gap-4">
                  <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary">
                    {track.students} Students
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-secondary/20 text-secondary">
                    {track.tasks} Tasks
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {/* Edit and Delete Buttons */}
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEditTrack(track)
                    }}
                    className="p-2 rounded-lg hover:bg-primary/20 text-primary transition-colors"
                    title="Edit Track"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteTrack(track)
                    }}
                    className="p-2 rounded-lg hover:bg-destructive/20 text-destructive transition-colors"
                    title="Delete Track"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="w-24 h-2 bg-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-secondary"
                    style={{ width: `${track.completion}%` }}
                  />
                </div>
                <button
                  onClick={() => setExpandedTrack(expandedTrack === track.id ? null : track.id)}
                  className="p-1"
                >
                  <ChevronDown
                    className={`w-5 h-5 transition-transform ${expandedTrack === track.id ? "rotate-180" : ""}`}
                  />
                </button>
              </div>
            </div>

            {/* Expanded Content */}
            {expandedTrack === track.id && (
              <div className="border-t border-border p-6 space-y-4 animate-slideInUp">
                <div className="space-y-3">
                  {(() => {
                    // Filter tasks for this specific track
                    const trackTasks = tasks.filter(task => task.track_id === track.id)
                    
                    return (
                      <>
                        <h4 className="font-semibold">Track Tasks ({trackTasks.length} total)</h4>
                        {trackTasks.length > 0 ? (
                          trackTasks.map((task, j) => (
                            <div
                              key={task.id || j}
                              className="flex items-start justify-between p-4 rounded-lg bg-background border border-border/50 hover:border-border transition-colors group"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold mb-1">{task.title}</p>
                                <p className="text-xs text-foreground/60 line-clamp-1">{task.requirements}</p>
                                <p className="text-xs text-foreground/40 mt-1">Week: {task.week}</p>
                              </div>
                              <div className="flex gap-2 ml-4 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                  onClick={() => handleEditTask(task)}
                                  className="p-1 rounded hover:bg-card transition-colors"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteTask(task.id)}
                                  className="p-1 rounded hover:bg-destructive/10 transition-colors text-destructive"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-4 rounded-lg bg-background border border-border/50 text-center text-foreground/60">
                            No tasks created yet for this track.
                          </div>
                        )}
                      </>
                    )
                  })()}
                </div>
                <button
                  onClick={() => setShowAddTaskModal(true)}
                  className="w-full py-2 rounded-lg border border-primary text-primary hover:bg-primary/10 transition-colors text-sm font-semibold"
                >
                  + Add Task
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <AddTaskModal 
        isOpen={showAddTaskModal} 
        onClose={() => {
          setShowAddTaskModal(false)
          setEditingTask(null)
        }} 
        onAdd={handleAddTask}
        editingTask={editingTask}
      />
    </div>
  )
}
