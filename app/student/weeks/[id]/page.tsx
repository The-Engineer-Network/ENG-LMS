"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, Play, FileText, Clock, CheckCircle2, Lock, Calendar, User } from "lucide-react"
import { useAuth } from "@/lib/hooks/useAuth"
import { getWeekById, getStudentWeekProgress } from "@/lib/data"

export default function WeekDetailPage() {
  const { user, loading: authLoading } = useAuth()
  const params = useParams()
  const weekId = params.id as string
  
  const [week, setWeek] = useState<any>(null)
  const [progress, setProgress] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadWeekDetail() {
      if (!user?.id || !weekId) return
      
      try {
        const [weekData, progressData] = await Promise.all([
          getWeekById(weekId),
          getStudentWeekProgress(user.id)
        ])
        
        setWeek(weekData)
        const weekProgress = progressData.find((p: any) => p.week_id === weekId)
        setProgress(weekProgress)
      } catch (error) {
        console.error('Error loading week detail:', error)
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading && user) {
      loadWeekDetail()
    }
  }, [user, authLoading, weekId])

  if (authLoading || loading) {
    return (
      <div className="p-4 md:p-8 max-w-6xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            <div className="h-32 bg-muted rounded-xl"></div>
            <div className="h-48 bg-muted rounded-xl"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!week) {
    return (
      <div className="p-4 md:p-8 max-w-6xl mx-auto">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Week Not Found</h2>
          <p className="text-foreground/60 mb-6">The week you're looking for doesn't exist or you don't have access to it.</p>
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

  const isCompleted = progress?.status === 'approved'
  const isInProgress = progress?.status === 'pending' || progress?.submitted_at

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
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
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Week {week.week_number}: {week.title}
            </h1>
            <p className="text-foreground/60 mb-4">{week.description}</p>
            <div className="flex items-center gap-4 text-sm text-foreground/60">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>{week.track?.name}</span>
              </div>
              <div className="flex items-center gap-1">
                <Play className="w-4 h-4" />
                <span>{week.lessons?.length || 0} lessons</span>
              </div>
              <div className="flex items-center gap-1">
                <FileText className="w-4 h-4" />
                <span>{week.assignments?.length || 0} assignments</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isCompleted ? (
              <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-800 border border-green-200 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                Completed
              </span>
            ) : isInProgress ? (
              <span className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
                <Clock className="w-4 h-4" />
                In Progress
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800 border border-gray-200 flex items-center gap-1">
                <Lock className="w-4 h-4" />
                Not Started
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Lessons Section */}
          {week.lessons && week.lessons.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Lessons</h2>
              <div className="space-y-4">
                {week.lessons.map((lesson: any, index: number) => (
                  <Link
                    key={lesson.id}
                    href={`/student/lessons/${lesson.id}`}
                    className="block p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-300 group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        {lesson.type === 'video' ? (
                          <Play className="w-6 h-6 text-primary" />
                        ) : (
                          <FileText className="w-6 h-6 text-primary" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-lg font-semibold mb-1 group-hover:text-primary transition-colors">
                              {lesson.title}
                            </h3>
                            <p className="text-foreground/60 text-sm mb-2">
                              Lesson {index + 1} • {lesson.type === 'video' ? 'Video' : 'Reading'}
                            </p>
                            {lesson.duration && (
                              <div className="flex items-center gap-1 text-sm text-foreground/60">
                                <Clock className="w-4 h-4" />
                                <span>{lesson.duration}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                            <ArrowLeft className="w-5 h-5 rotate-180" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Assignments Section */}
          {week.assignments && week.assignments.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Assignments</h2>
              <div className="space-y-4">
                {week.assignments.map((assignment: any, index: number) => (
                  <Link
                    key={assignment.id}
                    href={`/student/tasks/${assignment.id}`}
                    className="block p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-300 group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 p-3 rounded-lg bg-secondary/10 group-hover:bg-secondary/20 transition-colors">
                        <FileText className="w-6 h-6 text-secondary" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-lg font-semibold mb-1 group-hover:text-primary transition-colors">
                              {assignment.title}
                            </h3>
                            <p className="text-foreground/60 text-sm mb-2">
                              Assignment {index + 1}
                            </p>
                            {assignment.requirements && (
                              <p className="text-foreground/70 text-sm mb-2 line-clamp-2">
                                {assignment.requirements}
                              </p>
                            )}
                            {assignment.deadline && (
                              <div className="flex items-center gap-1 text-sm text-foreground/60">
                                <Calendar className="w-4 h-4" />
                                <span>Due: {new Date(assignment.deadline).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                            <ArrowLeft className="w-5 h-5 rotate-180" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* No Content Message */}
          {(!week.lessons || week.lessons.length === 0) && (!week.assignments || week.assignments.length === 0) && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-foreground/20 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Content Coming Soon</h3>
              <p className="text-foreground/60">
                The lessons and assignments for this week are being prepared and will be available soon.
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Week Progress */}
          <div className="p-6 rounded-xl bg-card border border-border">
            <h3 className="font-bold mb-4">Week Progress</h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Overall Progress</span>
                  <span className="text-sm text-foreground/60">
                    {isCompleted ? '100%' : isInProgress ? '50%' : '0%'}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-500"
                    style={{ width: isCompleted ? '100%' : isInProgress ? '50%' : '0%' }}
                  ></div>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>Lessons</span>
                  <span className="text-foreground/60">{week.lessons?.length || 0} available</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Assignments</span>
                  <span className="text-foreground/60">
                    {isCompleted ? 'Completed' : isInProgress ? 'In Progress' : 'Not Started'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="p-6 rounded-xl bg-card border border-border">
            <h3 className="font-bold mb-4">Quick Actions</h3>
            
            <div className="space-y-3">
              <Link
                href="/student/weeks"
                className="block w-full px-4 py-2 text-left text-sm bg-muted hover:bg-muted/80 rounded-lg transition-colors"
              >
                ← Back to All Weeks
              </Link>
              
              <Link
                href="/student/tasks"
                className="block w-full px-4 py-2 text-left text-sm bg-muted hover:bg-muted/80 rounded-lg transition-colors"
              >
                View All Tasks
              </Link>
              
              <Link
                href="/student/accountability"
                className="block w-full px-4 py-2 text-left text-sm bg-muted hover:bg-muted/80 rounded-lg transition-colors"
              >
                Chat with Partner
              </Link>
            </div>
          </div>

          {/* Study Tips */}
          <div className="p-6 rounded-xl bg-card border border-border">
            <h3 className="font-bold mb-4">Study Tips</h3>
            <ul className="text-sm text-foreground/80 space-y-2">
              <li>• Complete lessons before starting assignments</li>
              <li>• Take notes while learning</li>
              <li>• Practice concepts hands-on</li>
              <li>• Ask questions in chat with your partner</li>
              <li>• Submit assignments before the deadline</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}