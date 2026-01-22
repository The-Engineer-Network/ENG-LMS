"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, Play, FileText, Clock, BookOpen } from "lucide-react"
import { useAuth } from "@/lib/hooks/useAuth"

// We'll need to create this function in lib/data.ts
async function getLessonById(lessonId: string) {
  // This is a placeholder - we'll need to implement this in lib/data.ts
  return null
}

export default function LessonDetailPage() {
  const { user, loading: authLoading } = useAuth()
  const params = useParams()
  const lessonId = params.id as string
  
  const [lesson, setLesson] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadLesson() {
      if (!user?.id || !lessonId) return
      
      try {
        const lessonData = await getLessonById(lessonId)
        setLesson(lessonData)
      } catch (error) {
        console.error('Error loading lesson:', error)
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading && user) {
      loadLesson()
    }
  }, [user, authLoading, lessonId])

  if (authLoading || loading) {
    return (
      <div className="p-4 md:p-8 max-w-4xl">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            <div className="h-64 bg-muted rounded-xl"></div>
            <div className="h-48 bg-muted rounded-xl"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className="p-4 md:p-8 max-w-4xl">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Lesson Not Found</h2>
          <p className="text-foreground/60 mb-6">The lesson you're looking for doesn't exist or you don't have access to it.</p>
          <Link
            href="/student/weeks"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Weeks
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/student/weeks"
          className="inline-flex items-center gap-2 text-foreground/60 hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Weeks
        </Link>
        
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{lesson.title}</h1>
            <p className="text-foreground/60">
              Week {lesson.week?.week_number} • {lesson.week?.track?.name}
            </p>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-foreground/60">
            {lesson.type === 'video' ? (
              <Play className="w-4 h-4" />
            ) : (
              <FileText className="w-4 h-4" />
            )}
            <span className="capitalize">{lesson.type}</span>
            {lesson.duration && (
              <>
                <Clock className="w-4 h-4 ml-2" />
                <span>{lesson.duration}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-4">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Video Content */}
          {lesson.type === 'video' && lesson.video_url && (
            <div className="rounded-xl overflow-hidden bg-card border border-border">
              <div className="aspect-video bg-black">
                {lesson.video_url.includes('youtube.com') || lesson.video_url.includes('youtu.be') ? (
                  <iframe
                    src={lesson.video_url.replace('watch?v=', 'embed/')}
                    className="w-full h-full"
                    allowFullScreen
                    title={lesson.title}
                  />
                ) : lesson.video_url.includes('vimeo.com') ? (
                  <iframe
                    src={lesson.video_url.replace('vimeo.com/', 'player.vimeo.com/video/')}
                    className="w-full h-full"
                    allowFullScreen
                    title={lesson.title}
                  />
                ) : (
                  <video
                    src={lesson.video_url}
                    controls
                    className="w-full h-full"
                    title={lesson.title}
                  />
                )}
              </div>
            </div>
          )}

          {/* Text Content */}
          {lesson.content && (
            <div className="p-6 rounded-xl bg-card border border-border">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Lesson Content
              </h2>
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-foreground/80">
                  {lesson.content}
                </div>
              </div>
            </div>
          )}

          {/* No Content Message */}
          {!lesson.content && (!lesson.video_url || lesson.type !== 'video') && (
            <div className="p-6 rounded-xl bg-card border border-border text-center">
              <FileText className="w-12 h-12 text-foreground/40 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Content Coming Soon</h3>
              <p className="text-foreground/60">
                The content for this lesson is being prepared and will be available soon.
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Lesson Info */}
          <div className="p-6 rounded-xl bg-card border border-border">
            <h3 className="font-bold mb-4">Lesson Info</h3>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium">Type</p>
                <p className="text-sm text-foreground/60 capitalize">{lesson.type}</p>
              </div>
              
              {lesson.duration && (
                <div>
                  <p className="text-sm font-medium">Duration</p>
                  <p className="text-sm text-foreground/60">{lesson.duration}</p>
                </div>
              )}
              
              <div>
                <p className="text-sm font-medium">Week</p>
                <p className="text-sm text-foreground/60">Week {lesson.week?.week_number}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium">Track</p>
                <p className="text-sm text-foreground/60">{lesson.week?.track?.name}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="p-6 rounded-xl bg-card border border-border">
            <h3 className="font-bold mb-4">Navigation</h3>
            
            <div className="space-y-2">
              <Link
                href="/student/weeks"
                className="block w-full px-4 py-2 text-left text-sm bg-muted hover:bg-muted/80 rounded-lg transition-colors"
              >
                ← Back to Weeks
              </Link>
              
              <Link
                href="/student/tasks"
                className="block w-full px-4 py-2 text-left text-sm bg-muted hover:bg-muted/80 rounded-lg transition-colors"
              >
                View Tasks
              </Link>
            </div>
          </div>

          {/* Study Tips */}
          <div className="p-6 rounded-xl bg-card border border-border">
            <h3 className="font-bold mb-4">Study Tips</h3>
            <ul className="text-sm text-foreground/80 space-y-2">
              <li>• Take notes while watching/reading</li>
              <li>• Pause and practice concepts</li>
              <li>• Review multiple times if needed</li>
              <li>• Ask questions in chat with your partner</li>
              <li>• Apply what you learn in assignments</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}