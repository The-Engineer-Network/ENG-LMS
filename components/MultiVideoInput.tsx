"use client"

import { useState } from "react"
import { Plus, X, Play } from "lucide-react"

interface Video {
  url: string
  title: string
  duration?: string
  thumbnail?: string
}

interface MultiVideoInputProps {
  videos: Video[]
  onChange: (videos: Video[]) => void
  maxVideos?: number
  label?: string
}

export function MultiVideoInput({ videos, onChange, maxVideos = 5, label = "Videos" }: MultiVideoInputProps) {
  const [newVideo, setNewVideo] = useState({ url: "", title: "", duration: "" })

  const handleAddVideo = () => {
    if (newVideo.url.trim() && newVideo.title.trim() && videos.length < maxVideos) {
      const updatedVideos = [...videos, { ...newVideo, url: newVideo.url.trim(), title: newVideo.title.trim() }]
      console.log('=== MultiVideoInput: Adding video ===')
      console.log('Current videos:', videos)
      console.log('New video:', newVideo)
      console.log('Updated videos array:', updatedVideos)
      onChange(updatedVideos)
      setNewVideo({ url: "", title: "", duration: "" })
    } else {
      console.log('=== MultiVideoInput: Cannot add video ===')
      console.log('Reason:', {
        hasUrl: !!newVideo.url.trim(),
        hasTitle: !!newVideo.title.trim(),
        underLimit: videos.length < maxVideos,
        currentCount: videos.length,
        maxVideos
      })
    }
  }

  const handleRemoveVideo = (index: number) => {
    const updatedVideos = videos.filter((_, i) => i !== index)
    console.log('=== MultiVideoInput: Removing video ===')
    console.log('Removing index:', index)
    console.log('Current videos:', videos)
    console.log('Updated videos array:', updatedVideos)
    onChange(updatedVideos)
  }

  return (
    <div>
      <label className="block text-sm font-semibold mb-2">
        {label} (Optional) - Max {maxVideos}
      </label>
      <p className="text-xs text-foreground/50 mb-3">
        Add YouTube, Vimeo, or direct video links. Students will see thumbnails and can play videos embedded.
      </p>

      {/* Add New Video Form */}
      {videos.length < maxVideos && (
        <div className="space-y-3 mb-4 p-4 rounded-lg bg-muted/50 border border-border">
          <input
            type="text"
            placeholder="Video URL (YouTube, Vimeo, etc.)"
            value={newVideo.url}
            onChange={(e) => setNewVideo({ ...newVideo, url: e.target.value })}
            className="w-full px-4 py-2 rounded-lg bg-background border border-border text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary transition-colors"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Video Title"
              value={newVideo.title}
              onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
              className="px-4 py-2 rounded-lg bg-background border border-border text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary transition-colors"
            />
            <input
              type="text"
              placeholder="Duration (e.g., 15:30)"
              value={newVideo.duration}
              onChange={(e) => setNewVideo({ ...newVideo, duration: e.target.value })}
              className="px-4 py-2 rounded-lg bg-background border border-border text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <button
            type="button"
            onClick={handleAddVideo}
            disabled={!newVideo.url.trim() || !newVideo.title.trim()}
            className="w-full px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Video {videos.length > 0 && `(${videos.length}/${maxVideos})`}
          </button>
        </div>
      )}

      {/* Videos List */}
      {videos.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground/70">Added Videos ({videos.length}/{maxVideos})</p>
          {videos.map((video, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 rounded-lg bg-background border border-border hover:border-primary/50 transition-colors"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Play className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{video.title}</p>
                <p className="text-xs text-foreground/60 truncate">{video.url}</p>
                {video.duration && (
                  <p className="text-xs text-foreground/50 mt-1">Duration: {video.duration}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleRemoveVideo(index)}
                className="flex-shrink-0 p-1.5 hover:bg-destructive/10 rounded-lg transition-colors text-destructive cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {videos.length === 0 && (
        <p className="text-sm text-foreground/50 text-center py-4 border border-dashed border-border rounded-lg">
          No videos added yet. Add up to {maxVideos} videos.
        </p>
      )}
    </div>
  )
}
