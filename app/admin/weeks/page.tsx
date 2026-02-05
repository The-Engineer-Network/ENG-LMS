"use client"

import { useState, useEffect } from "react"
import { Plus, Edit2, Trash2, Play, FileText, ChevronDown, ChevronRight, X, Upload } from "lucide-react"
import { useAuth } from "@/lib/hooks/useAuth"
import { getTracks, getAllWeeks, createWeek, updateWeek, deleteWeek, createLesson, updateLesson, deleteLesson, updateAssignment } from "@/lib/data"
import { useToast } from "@/components/ui/toast"
import { MultiVideoInput } from "@/components/MultiVideoInput"
import { MultiLinkInput } from "@/components/MultiLinkInput"

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
          <h2 className="text-2xl font-bold">{editingTask ? "Edit Assignment" : "Add New Assignment"}</h2>
          <button onClick={onClose} className="p-1 hover:bg-background rounded-lg transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6 space-y-6">
          {/* Task Title */}
          <div>
            <label className="block text-sm font-semibold mb-2">Assignment Title *</label>
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
            <label className="block text-sm font-semibold mb-2">Assignment Requirements *</label>
            <textarea
              placeholder="Describe what students need to learn and do for this assignment..."
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
            {editingTask ? "Update Assignment" : "Create Assignment"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function WeeksManagementPage() {
  const { user, loading: authLoading } = useAuth()
  const { showToast } = useToast()
  const [tracks, setTracks] = useState<any[]>([])
  const [weeks, setWeeks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTrack, setSelectedTrack] = useState("")
  const [expandedWeeks, setExpandedWeeks] = useState<string[]>([])
  const [showWeekForm, setShowWeekForm] = useState(false)
  const [showLessonForm, setShowLessonForm] = useState(false)
  const [showAssignmentModal, setShowAssignmentModal] = useState(false)
  const [editingWeek, setEditingWeek] = useState<any>(null)
  const [editingLesson, setEditingLesson] = useState<any>(null)
  const [editingAssignment, setEditingAssignment] = useState<any>(null)
  const [selectedWeekId, setSelectedWeekId] = useState<string | null>(null)
  const [savingLesson, setSavingLesson] = useState(false)

  const [weekForm, setWeekForm] = useState({
    title: "",
    description: "",
    order: 1
  })

  const [lessonForm, setLessonForm] = useState({
    title: "",
    type: "video",
    duration: "",
    content: "",
    videoUrl: "",
    videoUrls: [] as Array<{ url: string; title: string; duration?: string }>,
    resourceLinks: [] as Array<{ url: string; title: string; description?: string }>,
    order: 1
  })

  useEffect(() => {
    async function loadData() {
      if (!user?.id) return
      
      try {
        const [tracksData, weeksData] = await Promise.all([
          getTracks(),
          getAllWeeks()
        ])
        
        setTracks(tracksData)
        setWeeks(weeksData.map(week => ({
          ...week,
          lessons: week.lessons ? week.lessons.sort((a: any, b: any) => a.order_index - b.order_index) : []
        })))
        
        // Set first track as selected if none selected
        if (tracksData.length > 0 && !selectedTrack) {
          setSelectedTrack(tracksData[0].id)
        }
      } catch (error) {
        console.error('Error loading data:', error)
        setTracks([])
        setWeeks([])
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading && user) {
      loadData()
    }
  }, [user, authLoading, selectedTrack])

  const filteredWeeks = weeks.filter(week => week.track_id === selectedTrack)

  const toggleWeekExpansion = (weekId: string) => {
    setExpandedWeeks(prev => 
      prev.includes(weekId) 
        ? prev.filter(id => id !== weekId)
        : [...prev, weekId]
    )
  }

  const handleWeekSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTrack) return
    
    try {
      if (editingWeek) {
        await updateWeek(editingWeek.id, {
          title: weekForm.title,
          description: weekForm.description,
          order_index: weekForm.order
        })
      } else {
        await createWeek({
          title: weekForm.title,
          description: weekForm.description,
          track_id: selectedTrack,
          week_number: weekForm.order,
          order_index: weekForm.order
        })
      }
      
      // Refresh weeks data
      const weeksData = await getAllWeeks()
      setWeeks(weeksData.map(week => ({
        ...week,
        lessons: week.lessons ? week.lessons.sort((a: any, b: any) => a.order_index - b.order_index) : []
      })))
      
      setWeekForm({ title: "", description: "", order: 1 })
      setEditingWeek(null)
      setShowWeekForm(false)
    } catch (error) {
      console.error('Error saving week:', error)
      alert('Failed to save week')
    }
  }

  const handleLessonSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedWeekId) {
      console.error('No selectedWeekId for lesson creation')
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Please select a week first.'
      })
      return
    }
    
    setSavingLesson(true)
    
    try {
      console.log('=== LESSON SUBMISSION DEBUG ===')
      console.log('lessonForm.videoUrls:', JSON.stringify(lessonForm.videoUrls, null, 2))
      console.log('lessonForm.resourceLinks:', JSON.stringify(lessonForm.resourceLinks, null, 2))
      console.log('Full lessonForm:', lessonForm)
      
      if (editingLesson) {
        console.log('Updating existing lesson...')
        const updateData = {
          title: lessonForm.title,
          type: lessonForm.type as 'video' | 'text',
          content: lessonForm.content,
          video_url: lessonForm.videoUrl,
          video_urls: lessonForm.videoUrls,
          resource_links: lessonForm.resourceLinks,
          duration: lessonForm.duration,
          order_index: lessonForm.order
        }
        console.log('Update data being sent:', JSON.stringify(updateData, null, 2))
        
        const result = await updateLesson(editingLesson.id, updateData)
        console.log('Lesson update result:', result)
        
        showToast({
          type: 'success',
          title: 'Lesson Updated',
          message: `"${lessonForm.title}" has been successfully updated.`
        })
      } else {
        console.log('Creating new lesson...')
        const createData = {
          title: lessonForm.title,
          type: lessonForm.type as 'video' | 'text',
          content: lessonForm.content,
          video_url: lessonForm.videoUrl,
          video_urls: lessonForm.videoUrls,
          resource_links: lessonForm.resourceLinks,
          duration: lessonForm.duration,
          week_id: selectedWeekId,
          order_index: lessonForm.order
        }
        console.log('Create data being sent:', JSON.stringify(createData, null, 2))
        
        const result = await createLesson(createData)
        
        console.log('Lesson created successfully:', result)
        
        showToast({
          type: 'success',
          title: 'Lesson Created',
          message: `"${lessonForm.title}" has been successfully created.`
        })
      }
      
      // Refresh the page to show updated data
      console.log('Refreshing page...')
      window.location.reload()
    } catch (error: any) {
      console.error('Error saving lesson:', error)
      console.error('Error details:', {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint
      })
      showToast({
        type: 'error',
        title: 'Save Failed',
        message: `Failed to save lesson: ${error?.message || 'Unknown error'}`
      })
    } finally {
      setSavingLesson(false)
    }
  }

  const handleEditWeek = (week: any) => {
    setEditingWeek(week)
    setWeekForm({
      title: week.title,
      description: week.description,
      order: week.order_index
    })
    setShowWeekForm(true)
  }

  const handleAddLesson = (weekId: string) => {
    setSelectedWeekId(weekId)
    setShowLessonForm(true)
  }

  const handleEditLesson = (lesson: any, weekId: string) => {
    setEditingLesson(lesson)
    setSelectedWeekId(weekId)
    setLessonForm({
      title: lesson.title,
      type: lesson.type,
      duration: lesson.duration || "",
      content: lesson.content || "",
      videoUrl: lesson.video_url || "",
      videoUrls: lesson.video_urls || [],
      resourceLinks: lesson.resource_links || [],
      order: lesson.order_index
    })
    setShowLessonForm(true)
  }

  const handleEditAssignment = (assignment: any) => {
    console.log('Editing assignment from weeks page:', assignment)
    setEditingAssignment(assignment)
    setShowAssignmentModal(true)
  }

  const handleUpdateAssignment = async (assignmentData: any) => {
    if (!editingAssignment) return
    
    try {
      console.log('Updating assignment:', editingAssignment.id, assignmentData)
      
      await updateAssignment(editingAssignment.id, {
        title: assignmentData.title,
        requirements: assignmentData.requirements,
        submission_guidelines: assignmentData.guidelines,
        video_guide: assignmentData.videoGuide,
        learning_materials: assignmentData.learningMaterials
      })
      
      // Refresh weeks data
      const weeksData = await getAllWeeks()
      setWeeks(weeksData.map(week => ({
        ...week,
        lessons: week.lessons ? week.lessons.sort((a: any, b: any) => a.order_index - b.order_index) : []
      })))
      
      showToast({
        type: 'success',
        title: 'Assignment Updated',
        message: `"${assignmentData.title}" has been successfully updated.`
      })
    } catch (error) {
      console.error('Error updating assignment:', error)
      showToast({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update assignment. Please try again.'
      })
    }
  }

  const handleDeleteWeek = async (weekId: string, weekTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${weekTitle}"? This will also delete all lessons and assignments in this week.`)) {
      return
    }
    
    try {
      await deleteWeek(weekId)
      
      // Refresh weeks data
      const weeksData = await getAllWeeks()
      setWeeks(weeksData.map(week => ({
        ...week,
        lessons: week.lessons ? week.lessons.sort((a: any, b: any) => a.order_index - b.order_index) : []
      })))
      
      alert('Week deleted successfully!')
    } catch (error) {
      console.error('Error deleting week:', error)
      alert('Failed to delete week. Please try again.')
    }
  }

  const handleDeleteLesson = async (lessonId: string, lessonTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${lessonTitle}"?`)) {
      return
    }
    
    try {
      await deleteLesson(lessonId)
      
      // Refresh weeks data
      const weeksData = await getAllWeeks()
      setWeeks(weeksData.map(week => ({
        ...week,
        lessons: week.lessons ? week.lessons.sort((a: any, b: any) => a.order_index - b.order_index) : []
      })))
      
      alert('Lesson deleted successfully!')
    } catch (error) {
      console.error('Error deleting lesson:', error)
      alert('Failed to delete lesson. Please try again.')
    }
  }

  if (authLoading || loading) {
    return (
      <div className="p-4 md:p-8 max-w-7xl">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
          <div className="flex gap-2 mb-8">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 bg-muted rounded w-32"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
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
      <div className="mb-8 animate-slideInUp">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Week & Lesson Management</h1>
            <p className="text-foreground/60">Manage curriculum content for each track</p>
          </div>
          <button
            onClick={() => setShowWeekForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Week
          </button>
        </div>

        {/* Track Selector */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {tracks.map(track => (
            <button
              key={track.id}
              onClick={() => setSelectedTrack(track.id)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedTrack === track.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              }`}
            >
              {track.name}
            </button>
          ))}
        </div>
      </div>

      {/* Weeks List */}
      <div className="space-y-4">
        {filteredWeeks.map(week => (
          <div key={week.id} className="bg-card border border-border rounded-lg overflow-hidden">
            {/* Week Header */}
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => toggleWeekExpansion(week.id)}
                    className="p-1 hover:bg-muted rounded transition-colors"
                  >
                    {expandedWeeks.includes(week.id) ? (
                      <ChevronDown className="w-5 h-5" />
                    ) : (
                      <ChevronRight className="w-5 h-5" />
                    )}
                  </button>
                  <div>
                    <h3 className="text-xl font-semibold">Week {week.week_number}: {week.title}</h3>
                    <p className="text-foreground/60">{week.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-foreground/60">
                      <span>{week.lessons?.length || 0} lessons</span>
                      <span>{week.assignments?.length || 0} assignments</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditWeek(week)}
                    className="p-2 text-foreground/60 hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteWeek(week.id, week.title)}
                    className="p-2 text-accent hover:bg-accent/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Week Content */}
            {expandedWeeks.includes(week.id) && (
              <div className="p-6">
                {/* Lessons */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold">Lessons</h4>
                    <button
                      onClick={() => handleAddLesson(week.id)}
                      className="flex items-center gap-2 px-3 py-1 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      Add Lesson
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    {(week.lessons || []).map((lesson: any) => (
                      <div key={lesson.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-3">
                          {lesson.type === "video" ? (
                            <Play className="w-4 h-4 text-primary" />
                          ) : (
                            <FileText className="w-4 h-4 text-secondary" />
                          )}
                          <div>
                            <span className="font-medium">{lesson.title}</span>
                            {lesson.duration && (
                              <span className="text-sm text-foreground/60 ml-2">({lesson.duration})</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-foreground/60">Order: {lesson.order_index}</span>
                          <button
                            onClick={() => handleEditLesson(lesson, week.id)}
                            className="p-1 text-foreground/60 hover:text-foreground hover:bg-background rounded transition-colors"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteLesson(lesson.id, lesson.title)}
                            className="p-1 text-accent hover:bg-accent/10 rounded transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Assignments */}
                <div>
                  <h4 className="font-semibold mb-4">Assignments</h4>
                  <div className="space-y-2">
                    {(week.assignments || []).map((assignment: any) => (
                      <div key={assignment.id} className="p-4 bg-muted rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium mb-2">{assignment.title}</h5>
                            
                            {/* Requirements */}
                            {assignment.requirements && (
                              <div className="mb-2">
                                <p className="text-xs font-semibold text-foreground/80 mb-1">Requirements:</p>
                                <p className="text-sm text-foreground/70 line-clamp-2">{assignment.requirements}</p>
                              </div>
                            )}
                            
                            {/* Submission Guidelines */}
                            {assignment.submission_guidelines && (
                              <div className="mb-2">
                                <p className="text-xs font-semibold text-foreground/80 mb-1">Submission Guidelines:</p>
                                <p className="text-sm text-foreground/70 line-clamp-2">{assignment.submission_guidelines}</p>
                              </div>
                            )}
                            
                            {/* Video Guide */}
                            {assignment.video_guide && (
                              <div className="mb-2">
                                <p className="text-xs font-semibold text-foreground/80 mb-1">Video Guide:</p>
                                <a 
                                  href={assignment.video_guide} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-400 hover:text-blue-300 underline"
                                >
                                  Watch Video Guide
                                </a>
                              </div>
                            )}
                            
                            {/* Learning Materials */}
                            {assignment.learning_materials && assignment.learning_materials.length > 0 && (
                              <div className="mb-2">
                                <p className="text-xs font-semibold text-foreground/80 mb-1">Learning Materials:</p>
                                <div className="space-y-1">
                                  {assignment.learning_materials.map((material: any, idx: number) => (
                                    <div key={idx} className="flex items-center gap-2">
                                      <span className="text-xs px-2 py-1 rounded bg-primary/20 text-primary">
                                        {material.type.toUpperCase()}
                                      </span>
                                      <a 
                                        href={material.value} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-sm text-blue-400 hover:text-blue-300 underline truncate"
                                      >
                                        {material.type === 'link' ? 'Open Link' : 'View Image'}
                                      </a>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {/* Status indicators */}
                            <div className="flex gap-2 mt-2 flex-wrap">
                              {assignment.requirements && (
                                <span className="text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-400">
                                  Has Requirements
                                </span>
                              )}
                              {assignment.submission_guidelines && (
                                <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-400">
                                  Has Guidelines
                                </span>
                              )}
                              {assignment.video_guide && (
                                <span className="text-xs px-2 py-1 rounded bg-purple-500/20 text-purple-400">
                                  Has Video
                                </span>
                              )}
                              {assignment.learning_materials && assignment.learning_materials.length > 0 && (
                                <span className="text-xs px-2 py-1 rounded bg-yellow-500/20 text-yellow-400">
                                  {assignment.learning_materials.length} Materials
                                </span>
                              )}
                              {assignment.deadline && (
                                <span className="text-xs px-2 py-1 rounded bg-orange-500/20 text-orange-400">
                                  Has Deadline
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <button 
                            onClick={() => handleEditAssignment(assignment)}
                            className="p-2 text-foreground/60 hover:text-foreground hover:bg-background rounded-lg transition-colors flex-shrink-0"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {(!week.assignments || week.assignments.length === 0) && (
                      <div className="p-4 bg-muted rounded-lg text-center text-foreground/60">
                        No assignments yet. Create assignments from the Tracks page.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        
        {filteredWeeks.length === 0 && (
          <div className="text-center py-12 text-foreground/60">
            <p>No weeks found for the selected track.</p>
            <p className="text-sm mt-2">Add a new week to get started.</p>
          </div>
        )}
      </div>

      {/* Week Form Modal */}
      {showWeekForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingWeek ? "Edit Week" : "Add New Week"}
            </h2>
            
            <form onSubmit={handleWeekSubmit} className="space-y-4">
              <div>
                <label className="block font-medium mb-2">Title *</label>
                <input
                  type="text"
                  value={weekForm.title}
                  onChange={(e) => setWeekForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Week title"
                  className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block font-medium mb-2">Description *</label>
                <textarea
                  value={weekForm.description}
                  onChange={(e) => setWeekForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Week description"
                  className="w-full p-3 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block font-medium mb-2">Order *</label>
                <input
                  type="number"
                  value={weekForm.order || ''}
                  onChange={(e) => setWeekForm(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                  min="1"
                  className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowWeekForm(false)
                    setEditingWeek(null)
                    setWeekForm({ title: "", description: "", order: 1 })
                  }}
                  className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  {editingWeek ? "Update Week" : "Add Week"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lesson Form Modal */}
      {showLessonForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-card border border-border rounded-lg w-full max-w-2xl my-8 max-h-[90vh] flex flex-col">
            {/* Header - Fixed */}
            <div className="p-6 border-b border-border flex-shrink-0">
              <h2 className="text-xl font-bold">
                {editingLesson ? "Edit Lesson" : "Add New Lesson"}
              </h2>
            </div>
            
            {/* Form Content - Scrollable */}
            <form onSubmit={handleLessonSubmit} className="flex flex-col flex-1 min-h-0">
              <div className="p-6 space-y-4 overflow-y-auto flex-1">
                <div>
                  <label className="block font-medium mb-2">Title *</label>
                  <input
                    type="text"
                    value={lessonForm.title}
                    onChange={(e) => setLessonForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Lesson title"
                    className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium mb-2">Type *</label>
                    <select
                      value={lessonForm.type}
                      onChange={(e) => setLessonForm(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="video">Video Lesson</option>
                      <option value="text">Text Lesson</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium mb-2">Order *</label>
                    <input
                      type="number"
                      value={lessonForm.order}
                      onChange={(e) => setLessonForm(prev => ({ ...prev, order: parseInt(e.target.value) }))}
                      min="1"
                      className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                </div>

                {lessonForm.type === "video" && (
                  <>
                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                      <p className="text-sm font-semibold text-yellow-400 mb-2">⚠️ Video Configuration</p>
                      <div className="text-xs text-foreground/70 space-y-1">
                        <p>• <strong>Legacy Single Video:</strong> {lessonForm.videoUrl ? '✅ Set' : '❌ Empty'}</p>
                        <p>• <strong>Multiple Videos:</strong> {lessonForm.videoUrls.length} video(s) added</p>
                        <p className="mt-2 text-yellow-300">Students will see BOTH the legacy video AND all multiple videos combined.</p>
                      </div>
                    </div>

                    <div>
                      <label className="block font-medium mb-2">Single Video URL (Legacy)</label>
                      <input
                        type="url"
                        value={lessonForm.videoUrl}
                        onChange={(e) => setLessonForm(prev => ({ ...prev, videoUrl: e.target.value }))}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <p className="text-xs text-foreground/50 mt-1">Or use multiple videos below</p>
                    </div>

                    <div>
                      <label className="block font-medium mb-2">Duration</label>
                      <input
                        type="text"
                        value={lessonForm.duration}
                        onChange={(e) => setLessonForm(prev => ({ ...prev, duration: e.target.value }))}
                        placeholder="e.g., 15 min"
                        className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                  {/* Multiple Videos */}
                  <div>
                    <div className="mb-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                      <p className="text-sm font-semibold text-blue-400 mb-1">📹 Multiple Videos Section</p>
                      <p className="text-xs text-foreground/70">
                        Currently {lessonForm.videoUrls.length} video(s) added. Use the form below to add more videos.
                      </p>
                    </div>
                    <MultiVideoInput
                      videos={lessonForm.videoUrls}
                      onChange={(videos) => {
                        console.log('MultiVideoInput onChange called with:', videos)
                        setLessonForm(prev => ({ ...prev, videoUrls: videos }))
                      }}
                      maxVideos={5}
                      label="Multiple Videos"
                    />
                  </div>

                  {/* Resource Links */}
                  <MultiLinkInput
                    links={lessonForm.resourceLinks}
                    onChange={(links) => setLessonForm(prev => ({ ...prev, resourceLinks: links }))}
                    maxLinks={5}
                    label="Resource Links"
                  />
                </>
              )}

              {lessonForm.type === "text" && (
                <div>
                  <label className="block font-medium mb-2">Content</label>
                  <textarea
                    value={lessonForm.content}
                    onChange={(e) => setLessonForm(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Lesson content (Markdown supported)"
                    className="w-full p-3 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
                    rows={8}
                  />
                </div>
              )}
              </div>

              {/* Footer - Fixed at bottom */}
              <div className="p-6 border-t border-border flex gap-3 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setShowLessonForm(false)
                    setEditingLesson(null)
                    setSelectedWeekId(null)
                    setLessonForm({ title: "", type: "video", duration: "", content: "", videoUrl: "", videoUrls: [], resourceLinks: [], order: 1 })
                  }}
                  disabled={savingLesson}
                  className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors cursor-pointer font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingLesson}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {savingLesson ? (
                    <>
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    editingLesson ? "Update Lesson" : "Add Lesson"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assignment Edit Modal */}
      <AddTaskModal 
        isOpen={showAssignmentModal} 
        onClose={() => {
          setShowAssignmentModal(false)
          setEditingAssignment(null)
        }} 
        onAdd={handleUpdateAssignment}
        editingTask={editingAssignment}
      />
    </div>
  )
}