"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, Play, FileText, Clock, BookOpen, ExternalLink } from "lucide-react"
import { useAuth } from "@/lib/hooks/useAuth"
import { getLessonById } from "@/lib/data"

// Helper function to extract YouTube video ID
function getYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
  ]
  
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

// Helper function to get YouTube thumbnail
function getYouTubeThumbnail(url: string): string {
  const videoId = getYouTubeVideoId(url)
  return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : ''
}

// Helper function to get embed URL
function getEmbedUrl(url: string): string {
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    const videoId = getYouTubeVideoId(url)
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url
  } else if (url.includes('vimeo.com')) {
    return url.replace('vimeo.com/', 'player.vimeo.com/video/')
  }
  return url
}

export default function LessonDetailPage() {
  const { user, loading: authLoading } = useAuth()
  const params = useParams()
  const lessonId = params.id as string
  
  const [lesson, setLesson] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeVideoIndex, setActiveVideoIndex] = useState(0)
  const [showVideo, setShowVideo] = useState<number | null>(null)

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

  // Get videos array - combine both legacy video_url and new video_urls array
  const legacyVideo = lesson?.video_url 
    ? [{ url: lesson.video_url, title: 'Main Video', duration: lesson.duration || '' }]
    : []
  
  const newVideos = lesson?.video_urls && Array.isArray(lesson.video_urls) 
    ? lesson.video_urls 
    : []
  
  // Combine both sources, removing duplicates by URL
  const allVideos = [...legacyVideo, ...newVideos]
  const uniqueVideos = allVideos.filter((video, index, self) => 
    index === self.findIndex((v) => v.url === video.url)
  )
  
  const videos = uniqueVideos

  console.log('=== VIDEO DISPLAY DEBUG ===')
  console.log('Lesson data:', lesson)
  console.log('video_url (legacy):', lesson?.video_url)
  console.log('video_urls (new):', lesson?.video_urls)
  console.log('Legacy videos:', legacyVideo)
  console.log('New videos:', newVideos)
  console.log('Combined unique videos:', videos)
  console.log('Videos count:', videos.length)

  const resourceLinks = lesson?.resource_links || []

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
          {/* Video Content with Thumbnails */}
          {lesson.type === 'video' && videos.length > 0 && (
            <div className="space-y-4">
              {/* Main Video Player */}
              <div className="rounded-xl overflow-hidden bg-card border border-border">
                <div className="aspect-video bg-black">
                  {showVideo !== null ? (
                    <iframe
                      src={getEmbedUrl(videos[showVideo].url)}
                      className="w-full h-full"
                      allowFullScreen
                      title={videos[showVideo].title || lesson.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <button
                        onClick={() => setShowVideo(0)}
                        className="flex flex-col items-center gap-4 text-white hover:text-primary transition-colors"
                      >
                        <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
                          <Play className="w-10 h-10" />
                        </div>
                        <span className="text-lg font-medium">Click to play video</span>
                      </button>
                    </div>
                  )}
                </div>
                {showVideo !== null && (
                  <div className="p-4 bg-card">
                    <h3 className="font-semibold">{videos[showVideo].title || `Video ${showVideo + 1}`}</h3>
                    {videos[showVideo].duration && (
                      <p className="text-sm text-foreground/60 flex items-center gap-1 mt-1">
                        <Clock className="w-4 h-4" />
                        {videos[showVideo].duration}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Video Thumbnails Grid (if multiple videos) */}
              {videos.length > 1 && (
                <div>
                  <h3 className="text-lg font-bold mb-3">All Videos ({videos.length})</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {videos.map((video: any, index: number) => {
                      const thumbnail = video.thumbnail || getYouTubeThumbnail(video.url)
                      return (
                        <button
                          key={index}
                          onClick={() => setShowVideo(index)}
                          className={`group relative rounded-lg overflow-hidden border-2 transition-all ${
                            showVideo === index 
                              ? 'border-primary shadow-lg' 
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="aspect-video bg-muted relative">
                            {thumbnail ? (
                              <img 
                                src={thumbnail} 
                                alt={video.title || `Video ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                                <Play className="w-12 h-12 text-primary/60" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                              <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                                <Play className="w-6 h-6 text-primary ml-1" />
                              </div>
                            </div>
                          </div>
                          <div className="p-3 bg-card">
                            <p className="text-sm font-medium line-clamp-2">
                              {video.title || `Video ${index + 1}`}
                            </p>
                            {video.duration && (
                              <p className="text-xs text-foreground/60 mt-1 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {video.duration}
                              </p>
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
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

          {/* Resource Links */}
          {resourceLinks.length > 0 && (
            <div className="p-6 rounded-xl bg-card border border-border">
              <h2 className="text-xl font-bold mb-4">Additional Resources</h2>
              <div className="space-y-3">
                {resourceLinks.map((link: any, index: number) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 p-4 rounded-lg bg-muted hover:bg-muted/80 transition-colors group"
                  >
                    <ExternalLink className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium group-hover:text-primary transition-colors">
                        {link.title || `Resource ${index + 1}`}
                      </h4>
                      {link.description && (
                        <p className="text-sm text-foreground/60 mt-1">{link.description}</p>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* No Content Message */}
          {!lesson.content && videos.length === 0 && resourceLinks.length === 0 && (
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