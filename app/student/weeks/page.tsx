"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { CheckCircle2, Lock, Clock, Play, FileText } from "lucide-react"
import { useAuth } from "@/lib/hooks/useAuth"
import { getStudentEnrollment, getWeeksByTrack, getStudentWeekProgress } from "@/lib/data"
import { logger } from "@/lib/logger"

export default function WeeksPage() {
  const { user, loading: authLoading } = useAuth()
  const [weeks, setWeeks] = useState<any[]>([])
  const [enrollment, setEnrollment] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadWeeksData() {
      if (!user?.id) return
      
      try {
        logger.log('Loading weeks data for student:', user.id)
        const enrollmentData = await getStudentEnrollment(user.id)
        if (!enrollmentData) {
          logger.log('No enrollment found for student')
          return
        }
        
        logger.log('Enrollment data:', enrollmentData)
        setEnrollment(enrollmentData)
        
        logger.log('Fetching weeks for track:', enrollmentData.track_id)
        const weeksData = await getWeeksByTrack(enrollmentData.track_id)
        logger.log('Weeks data received:', weeksData)
        logger.log('Lessons in weeks:', weeksData.map(w => ({ week: w.title, lessons: w.lessons?.length || 0 })))
        
        const progressData = await getStudentWeekProgress(user.id)
        
        // Transform weeks to match the expected structure
        const mockWeeks = weeksData.map((week: any, index: number) => {
          const progress = progressData.find((p: any) => p.week_id === week.id)
          const isLocked = index > 0 && !progressData.find((p: any) => 
            p.week_id === weeksData[index - 1].id && p.status === 'approved'
          )
          
          let status = 'locked'
          if (!isLocked) {
            if (progress?.status === 'approved') {
              status = 'completed'
            } else if (progress?.status === 'pending') {
              status = 'current'
            } else {
              status = 'current'
            }
          }
          
          return {
            id: week.id,
            week_number: week.week_number,
            title: week.title,
            description: week.description,
            status,
            locked: isLocked,
            lessons: week.lessons?.length || 0,
            assignment: {
              submitted: !!progress?.submitted_at,
              approved: progress?.status === 'approved',
              deadline: week.assignments?.[0]?.deadline || new Date().toISOString().split('T')[0]
            }
          }
        })
        
        setWeeks(mockWeeks)
      } catch (error) {
        logger.error('Error loading weeks data:', error)
        setWeeks([])
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading && user) {
      loadWeeksData()
    }
  }, [user, authLoading])

  const getStatusIcon = (status: string, locked: boolean) => {
    if (locked) return <Lock className="w-5 h-5 text-muted-foreground" />
    if (status === "completed") return <CheckCircle2 className="w-5 h-5 text-primary" />
    if (status === "current") return <Clock className="w-5 h-5 text-secondary" />
    return <Lock className="w-5 h-5 text-muted-foreground" />
  }

  const getStatusColor = (status: string, locked: boolean) => {
    if (locked) return "border-muted bg-muted/20"
    if (status === "completed") return "border-primary/20 bg-primary/5"
    if (status === "current") return "border-secondary/20 bg-secondary/5"
    return "border-muted bg-muted/20"
  }

  const completedWeeks = weeks.filter(w => w.status === 'completed').length
  const progressPercentage = weeks.length > 0 ? Math.round((completedWeeks / weeks.length) * 100) : 0

  if (authLoading || loading) {
    return (
      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!enrollment) {
    return (
      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">No Enrollment Found</h2>
          <p className="text-foreground/60 mb-6">
            You are not enrolled in any track yet. Please contact your administrator.
          </p>
        </div>
      </div>
    )
  }

  if (weeks.length === 0 && !loading) {
    return (
      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2">Program Weeks</h1>
          <p className="text-foreground/60 text-sm md:text-base">
            {enrollment?.track?.name || 'Development'} Track
          </p>
        </div>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">No Weeks Available Yet</h2>
          <p className="text-foreground/60 mb-6">
            Your instructor hasn't added any weeks to this track yet. Check back soon!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6 md:mb-8 animate-slideInUp">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2">Program Weeks</h1>
        <p className="text-foreground/60 text-sm md:text-base">
          {enrollment?.track?.name || 'Development'} Track - {weeks.length} Week Program
        </p>
      </div>

      {/* Progress Overview */}
      <div className="mb-6 md:mb-8 p-4 md:p-6 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg md:text-xl font-semibold">Overall Progress</h2>
          <span className="text-xl md:text-2xl font-bold text-primary">{progressPercentage}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2 md:h-3">
          <div className="bg-gradient-to-r from-primary to-secondary h-2 md:h-3 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
        </div>
        <p className="text-xs md:text-sm text-foreground/60 mt-2">{completedWeeks} of {weeks.length} weeks completed</p>
      </div>

      {/* Weeks Grid */}
      <div className="space-y-4">
        {weeks.map((week) => (
          <div
            key={week.id}
            className={`p-4 md:p-6 rounded-xl border transition-all duration-200 ${getStatusColor(week.status, week.locked)} ${
              !week.locked ? "hover:shadow-md cursor-pointer" : "cursor-not-allowed"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 md:gap-4 flex-1">
                <div className="flex-shrink-0 mt-1">
                  {getStatusIcon(week.status, week.locked)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                    <h3 className="text-lg md:text-xl font-semibold">Week {week.week_number}: {week.title}</h3>
                    {week.status === "current" && (
                      <span className="px-2 py-1 text-xs font-medium bg-primary text-primary-foreground rounded-full w-fit">
                        Current
                      </span>
                    )}
                  </div>
                  
                  <p className="text-foreground/70 mb-3 md:mb-4 text-sm md:text-base">{week.description}</p>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-xs md:text-sm text-foreground/60">
                    <div className="flex items-center gap-1">
                      <Play className="w-3 h-3 md:w-4 md:h-4" />
                      <span>{week.lessons} lessons</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="w-3 h-3 md:w-4 md:h-4" />
                      <span>1 assignment</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 md:w-4 md:h-4" />
                      <span>Due: {new Date(week.assignment.deadline).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2 ml-2">
                {week.assignment.submitted && week.assignment.approved && (
                  <span className="px-2 md:px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
                    Assignment Approved
                  </span>
                )}
                {week.assignment.submitted && !week.assignment.approved && (
                  <span className="px-2 md:px-3 py-1 text-xs font-medium bg-secondary/10 text-secondary rounded-full">
                    Under Review
                  </span>
                )}
                {!week.assignment.submitted && !week.locked && (
                  <span className="px-2 md:px-3 py-1 text-xs font-medium bg-accent/10 text-accent rounded-full">
                    Assignment Pending
                  </span>
                )}
                
                {!week.locked ? (
                  <Link
                    href={`/student/weeks/${week.id}`}
                    className="px-3 md:px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-xs md:text-sm font-medium"
                  >
                    {week.status === "current" ? "Continue" : "View Week"}
                  </Link>
                ) : (
                  <button
                    disabled
                    className="px-3 md:px-4 py-2 bg-muted text-muted-foreground rounded-lg cursor-not-allowed text-xs md:text-sm font-medium"
                  >
                    Locked
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}