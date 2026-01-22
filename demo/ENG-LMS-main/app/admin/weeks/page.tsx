"use client"

import { useState } from "react"
import { Plus, Edit2, Trash2, Play, FileText, Calendar, ChevronDown, ChevronRight } from "lucide-react"

const mockWeeks = [
  {
    id: 1,
    title: "React Fundamentals",
    description: "Learn core React concepts including components, JSX, and hooks",
    order: 1,
    lessons: [
      { id: 1, title: "Introduction to React", type: "video", duration: "15 min", order: 1 },
      { id: 2, title: "JSX and Components", type: "video", duration: "20 min", order: 2 },
      { id: 3, title: "Props and State", type: "text", order: 3 },
      { id: 4, title: "React Hooks Basics", type: "video", duration: "25 min", order: 4 }
    ],
    assignment: {
      id: 1,
      title: "Build a Counter Component",
      requirements: ["GitHub Repository", "Live Demo URL", "Additional Notes (optional)"]
    }
  },
  {
    id: 2,
    title: "State Management",
    description: "Master state management with Context API and custom hooks",
    order: 2,
    lessons: [
      { id: 5, title: "Context API Deep Dive", type: "video", duration: "30 min", order: 1 },
      { id: 6, title: "Custom Hooks", type: "video", duration: "25 min", order: 2 },
      { id: 7, title: "State Management Patterns", type: "text", order: 3 }
    ],
    assignment: {
      id: 2,
      title: "Theme Context Provider",
      requirements: ["GitHub Repository", "Live Demo URL"]
    }
  },
  {
    id: 3,
    title: "Component Composition",
    description: "Build reusable components and understand composition patterns",
    order: 3,
    lessons: [
      { id: 8, title: "Component Patterns", type: "video", duration: "35 min", order: 1 },
      { id: 9, title: "Render Props Pattern", type: "text", order: 2 },
      { id: 10, title: "Compound Components", type: "video", duration: "28 min", order: 3 }
    ],
    assignment: {
      id: 3,
      title: "Reusable Modal Component",
      requirements: ["GitHub Repository", "Live Demo URL", "Implementation Notes (optional)"]
    }
  }
]

const TRACKS = [
  { id: "frontend", name: "Frontend Development" },
  { id: "backend", name: "Backend Development" },
  { id: "devops", name: "DevOps / Cloud" },
  { id: "data", name: "Data / AI / ML" },
  { id: "web3", name: "Web3" }
]

export default function WeeksManagementPage() {
  const [selectedTrack, setSelectedTrack] = useState("frontend")
  const [expandedWeeks, setExpandedWeeks] = useState<number[]>([1])
  const [showWeekForm, setShowWeekForm] = useState(false)
  const [showLessonForm, setShowLessonForm] = useState(false)
  const [editingWeek, setEditingWeek] = useState<any>(null)
  const [editingLesson, setEditingLesson] = useState<any>(null)
  const [selectedWeekId, setSelectedWeekId] = useState<number | null>(null)

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
    order: 1
  })

  const toggleWeekExpansion = (weekId: number) => {
    setExpandedWeeks(prev => 
      prev.includes(weekId) 
        ? prev.filter(id => id !== weekId)
        : [...prev, weekId]
    )
  }

  const handleWeekSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Saving week:", weekForm)
    
    setWeekForm({ title: "", description: "", order: 1 })
    setEditingWeek(null)
    setShowWeekForm(false)
  }

  const handleLessonSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Saving lesson:", lessonForm, "for week:", selectedWeekId)
    
    setLessonForm({ title: "", type: "video", duration: "", content: "", videoUrl: "", order: 1 })
    setEditingLesson(null)
    setShowLessonForm(false)
    setSelectedWeekId(null)
  }

  const handleEditWeek = (week: any) => {
    setEditingWeek(week)
    setWeekForm({
      title: week.title,
      description: week.description,
      order: week.order
    })
    setShowWeekForm(true)
  }

  const handleAddLesson = (weekId: number) => {
    setSelectedWeekId(weekId)
    setShowLessonForm(true)
  }

  const handleEditLesson = (lesson: any, weekId: number) => {
    setEditingLesson(lesson)
    setSelectedWeekId(weekId)
    setLessonForm({
      title: lesson.title,
      type: lesson.type,
      duration: lesson.duration || "",
      content: lesson.content || "",
      videoUrl: lesson.videoUrl || "",
      order: lesson.order
    })
    setShowLessonForm(true)
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
          {TRACKS.map(track => (
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
        {mockWeeks.map(week => (
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
                    <h3 className="text-xl font-semibold">Week {week.order}: {week.title}</h3>
                    <p className="text-foreground/60">{week.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-foreground/60">
                      <span>{week.lessons.length} lessons</span>
                      <span>1 assignment</span>
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
                  <button className="p-2 text-accent hover:bg-accent/10 rounded-lg transition-colors">
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
                    {week.lessons.map(lesson => (
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
                          <span className="text-xs text-foreground/60">Order: {lesson.order}</span>
                          <button
                            onClick={() => handleEditLesson(lesson, week.id)}
                            className="p-1 text-foreground/60 hover:text-foreground hover:bg-background rounded transition-colors"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button className="p-1 text-accent hover:bg-accent/10 rounded transition-colors">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Assignment */}
                <div>
                  <h4 className="font-semibold mb-4">Assignment</h4>
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-medium">{week.assignment.title}</h5>
                        <p className="text-sm text-foreground/60">
                          {week.assignment.requirements.length} requirements
                        </p>
                      </div>
                      <button className="p-2 text-foreground/60 hover:text-foreground hover:bg-background rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
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
                  value={weekForm.order}
                  onChange={(e) => setWeekForm(prev => ({ ...prev, order: parseInt(e.target.value) }))}
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4">
              {editingLesson ? "Edit Lesson" : "Add New Lesson"}
            </h2>
            
            <form onSubmit={handleLessonSubmit} className="space-y-4">
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
                  <div>
                    <label className="block font-medium mb-2">Video URL</label>
                    <input
                      type="url"
                      value={lessonForm.videoUrl}
                      onChange={(e) => setLessonForm(prev => ({ ...prev, videoUrl: e.target.value }))}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
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

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowLessonForm(false)
                    setEditingLesson(null)
                    setSelectedWeekId(null)
                    setLessonForm({ title: "", type: "video", duration: "", content: "", videoUrl: "", order: 1 })
                  }}
                  className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  {editingLesson ? "Update Lesson" : "Add Lesson"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}