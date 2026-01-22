"use client"

import { useState } from "react"
import { Plus, Edit2, Trash2, ChevronDown, X, Upload } from "lucide-react"

const mockTasks = [
  {
    id: 1,
    title: "Task 1: Fundamentals",
    requirements: "Learn the basics",
    guidelines: "Submit a working project",
  },
  {
    id: 2,
    title: "Task 2: Advanced",
    requirements: "Advanced concepts",
    guidelines: "Include documentation",
  },
  {
    id: 3,
    title: "Task 3: Project",
    requirements: "Build a project",
    guidelines: "Deploy to production",
  },
  {
    id: 4,
    title: "Task 4: Optimization",
    requirements: "Optimize for performance",
    guidelines: "Add performance metrics",
  },
  {
    id: 5,
    title: "Task 5: Review",
    requirements: "Code review practice",
    guidelines: "Provide detailed feedback",
  },
]

const mockTracks = [
  {
    id: 1,
    name: "Frontend",
    students: 15,
    tasks: 20,
    completion: 75,
    description: "React, TypeScript, Tailwind CSS",
  },
  {
    id: 2,
    name: "Backend",
    students: 12,
    tasks: 20,
    completion: 70,
    description: "Node.js, Express, PostgreSQL",
  },
  {
    id: 3,
    name: "DevOps",
    students: 10,
    tasks: 20,
    completion: 68,
    description: "Docker, Kubernetes, CI/CD",
  },
  {
    id: 4,
    name: "Web3",
    students: 8,
    tasks: 20,
    completion: 65,
    description: "Blockchain, Smart Contracts, Web3.js",
  },
]

function AddTaskModal({
  isOpen,
  onClose,
  onAdd,
}: { isOpen: boolean; onClose: () => void; onAdd: (task: any) => void }) {
  const [formData, setFormData] = useState({
    title: "",
    requirements: "",
    guidelines: "",
    videoGuide: "",
    learningMaterials: [] as { type: "link" | "image"; value: string }[],
  })
  const [materialInput, setMaterialInput] = useState("")
  const [materialType, setMaterialType] = useState<"link" | "image">("link")

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
      learningMaterials: formData.learningMaterials.filter((_, i) => i !== index),
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
          <h2 className="text-2xl font-bold">Add New Task</h2>
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
                {formData.learningMaterials.map((material, index) => (
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
            Create Task
          </button>
        </div>
      </div>
    </div>
  )
}

export default function TracksPage() {
  const [expandedTrack, setExpandedTrack] = useState<number | null>(null)
  const [showNewTrackForm, setShowNewTrackForm] = useState(false)
  const [showAddTaskModal, setShowAddTaskModal] = useState(false)
  const [tasks, setTasks] = useState(mockTasks)

  const handleAddTask = (newTask: any) => {
    setTasks([
      ...tasks,
      {
        id: tasks.length + 1,
        title: newTask.title,
        requirements: newTask.requirements,
        guidelines: newTask.guidelines,
      },
    ])
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
      </div>

      {/* New Track Form */}
      {showNewTrackForm && (
        <div className="mb-8 p-6 rounded-xl bg-card border border-border animate-fadeInScale space-y-4">
          <h3 className="text-xl font-bold">Create New Track</h3>
          <input
            type="text"
            placeholder="Track Name"
            className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary transition-colors"
          />
          <textarea
            placeholder="Description"
            className="w-full h-24 px-4 py-3 rounded-lg bg-background border border-border text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary transition-colors resize-none"
          />
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
              Create
            </button>
            <button
              onClick={() => setShowNewTrackForm(false)}
              className="px-4 py-2 rounded-lg bg-card border border-border hover:bg-background transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Tracks List */}
      <div className="space-y-4">
        {mockTracks.map((track, i) => (
          <div
            key={track.id}
            className="rounded-xl bg-card border border-border overflow-hidden animate-fadeInScale"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <button
              onClick={() => setExpandedTrack(expandedTrack === track.id ? null : track.id)}
              className="w-full p-6 hover:bg-card/50 transition-colors flex items-center justify-between group"
            >
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
                <div className="w-24 h-2 bg-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-secondary"
                    style={{ width: `${track.completion}%` }}
                  />
                </div>
                <ChevronDown
                  className={`w-5 h-5 transition-transform ${expandedTrack === track.id ? "rotate-180" : ""}`}
                />
              </div>
            </button>

            {/* Expanded Content */}
            {expandedTrack === track.id && (
              <div className="border-t border-border p-6 space-y-4 animate-slideInUp">
                <div className="space-y-3">
                  <h4 className="font-semibold">Track Tasks ({tasks.length} total)</h4>
                  {tasks.map((task, j) => (
                    <div
                      key={j}
                      className="flex items-start justify-between p-4 rounded-lg bg-background border border-border/50 hover:border-border transition-colors group"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold mb-1">{task.title}</p>
                        <p className="text-xs text-foreground/60 line-clamp-1">{task.requirements}</p>
                      </div>
                      <div className="flex gap-2 ml-4 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1 rounded hover:bg-card transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button className="p-1 rounded hover:bg-destructive/10 transition-colors text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
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

      <AddTaskModal isOpen={showAddTaskModal} onClose={() => setShowAddTaskModal(false)} onAdd={handleAddTask} />
    </div>
  )
}
