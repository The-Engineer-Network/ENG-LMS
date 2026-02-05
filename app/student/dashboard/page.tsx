"use client"

import { useMemo, useEffect, useState } from "react"
import Link from "next/link"
import { CheckCircle2, Clock, AlertCircle, TrendingUp, Lock, Trophy, Star, Target, Zap, Award, Calendar, BarChart3 } from "lucide-react"
import { useAuth } from "@/lib/hooks/useAuth"
import { getStudentDashboardData, getStudentAchievements } from "@/lib/data"

export default function StudentDashboard() {
  const { user, loading: authLoading } = useAuth()
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [achievements, setAchievements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'overview' | 'timeline'>('overview')

  useEffect(() => {
    let mounted = true
    let retryCount = 0
    const maxRetries = 2
    
    async function loadDashboardData() {
      if (!user?.id) return
      
      try {
        console.log('Loading dashboard data...')
        const startTime = Date.now()
        
        const [data, achievementsData] = await Promise.all([
          getStudentDashboardData(user.id),
          getStudentAchievements(user.id)
        ])
        
        const loadTime = Date.now() - startTime
        console.log(`Dashboard data loaded in ${loadTime}ms`)
        
        if (mounted) {
          setDashboardData(data)
          setAchievements(achievementsData || [])
          setLoading(false)
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error)
        
        // Retry logic for network errors
        if (retryCount < maxRetries && mounted) {
          retryCount++
          console.log(`Retrying... (${retryCount}/${maxRetries})`)
          setTimeout(() => loadDashboardData(), 1000 * retryCount)
        } else if (mounted) {
          setLoading(false)
        }
      }
    }

    if (!authLoading && user) {
      loadDashboardData()
    } else if (!authLoading && !user) {
      setLoading(false)
    }
    
    return () => {
      mounted = false
    }
  }, [user?.id, authLoading])

  const completionPercentage = useMemo(() => dashboardData?.student?.progress || 0, [dashboardData])

  // Helper functions (defined before use)
  const calculateStreak = (weeks: any[]) => {
    let streak = 0
    for (let i = weeks.length - 1; i >= 0; i--) {
      if (weeks[i].status === 'Approved') {
        streak++
      } else {
        break
      }
    }
    return streak
  }

  const calculateWeeklyProgress = (weeks: any[]) => {
    return weeks.map((week: any, index: number) => ({
      week: week.week,
      progress: week.status === 'Approved' ? 100 : week.status === 'Pending Review' ? 75 : week.submitted ? 50 : 0,
      date: new Date(Date.now() - (weeks.length - index) * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }))
  }

  // Calculate streak and performance metrics
  const performanceMetrics = useMemo(() => {
    if (!dashboardData) return null
    
    const { weeks } = dashboardData
    const approvedWeeks = weeks.filter((w: any) => w.status === 'Approved')
    const streak = calculateStreak(weeks)
    const weeklyProgress = calculateWeeklyProgress(weeks)
    
    return {
      streak,
      weeklyProgress,
      averageGrade: 85, // This would come from actual grades
      consistency: Math.round((approvedWeeks.length / weeks.length) * 100)
    }
  }, [dashboardData])

  if (authLoading || loading) {
    return (
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        {/* Header Skeleton */}
        <div className="mb-6 md:mb-8 animate-pulse">
          <div className="h-8 bg-muted rounded w-64 mb-2"></div>
          <div className="h-4 bg-muted rounded w-96 mb-4"></div>
        </div>
        
        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4 mb-6 md:mb-8">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-6 rounded-xl bg-card border border-border animate-pulse">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="h-3 bg-muted rounded w-20 mb-3"></div>
                  <div className="h-8 bg-muted rounded w-12 mb-2"></div>
                  <div className="h-2 bg-muted rounded w-16"></div>
                </div>
                <div className="w-12 h-12 bg-muted rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Progress Bar Skeleton */}
        <div className="mb-8 p-6 rounded-xl bg-card border border-border animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-6 bg-muted rounded w-40"></div>
            <div className="h-8 bg-muted rounded w-16"></div>
          </div>
          <div className="w-full h-4 bg-muted rounded-full mb-4"></div>
          <div className="h-3 bg-muted rounded w-64"></div>
        </div>
        
        {/* Weeks List Skeleton */}
        <div className="space-y-3">
          <div className="h-6 bg-muted rounded w-32 mb-4"></div>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-4 rounded-xl bg-card border border-border animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-5 h-5 bg-muted rounded-full"></div>
                <div className="flex-1">
                  <div className="h-5 bg-muted rounded w-48 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-32"></div>
                </div>
                <div className="h-6 bg-muted rounded-full w-24"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">No enrollment found</h2>
          <p className="text-foreground/60">Please contact your administrator to get enrolled in a track.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header with View Toggle */}
      <div className="mb-6 md:mb-8 animate-slideInUp">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2">
              Welcome back,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                {dashboardData.student.name}
              </span>
            </h1>
            <p className="text-foreground/60 text-sm md:text-base">
              Track: <span className="font-semibold text-primary">{dashboardData.student.track}</span> • Cohort:{" "}
              <span className="font-semibold text-secondary">{dashboardData.student.cohort}</span>
            </p>
          </div>
          
          <div className="flex gap-2 mt-4 md:mt-0">
            <button
              onClick={() => setViewMode('overview')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'overview' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-card border border-border hover:bg-muted'
              }`}
            >
              <BarChart3 className="w-4 h-4 inline mr-2" />
              Overview
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'timeline' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-card border border-border hover:bg-muted'
              }`}
            >
              <Calendar className="w-4 h-4 inline mr-2" />
              Timeline
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid - Enhanced */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4 mb-6 md:mb-8">
        {[
          {
            icon: TrendingUp,
            label: "Overall Progress",
            value: `${dashboardData.student.progress}%`,
            color: "from-primary to-accent",
          },
          {
            icon: CheckCircle2,
            label: "Weeks Completed",
            value: dashboardData.student.completedWeeks,
            subtitle: `of ${dashboardData.student.weekCount}`,
          },
          {
            icon: Clock,
            label: "Approved",
            value: dashboardData.student.submissions.approved,
            color: "from-secondary to-primary",
          },
          { 
            icon: AlertCircle, 
            label: "Needs Attention", 
            value: dashboardData.student.submissions.needsCorrection 
          },
          {
            icon: Zap,
            label: "Current Streak",
            value: performanceMetrics?.streak || 0,
            subtitle: "weeks",
            color: "from-accent to-primary"
          }
        ].map((stat, i) => (
          <div
            key={i}
            className="p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-300 transform hover:scale-105 animate-fadeInScale"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-foreground/60 mb-2">{stat.label}</p>
                <p
                  className={`text-3xl font-bold ${stat.color ? `bg-gradient-to-r ${stat.color} bg-clip-text text-transparent` : ""}`}
                >
                  {stat.value}
                </p>
                {stat.subtitle && <p className="text-xs text-foreground/40 mt-1">{stat.subtitle}</p>}
              </div>
              <div
                className={`p-3 rounded-lg ${stat.color ? `bg-gradient-to-br ${stat.color}` : "bg-primary"} bg-opacity-20`}
              >
                <stat.icon className="w-6 h-6 text-primary" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Achievement Badges */}
      {achievements.length > 0 && (
        <div className="mb-8 p-6 rounded-xl bg-card border border-border animate-slideInRight">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-accent" />
            Recent Achievements
          </h2>
          <div className="flex flex-wrap gap-3">
            {achievements.slice(0, 6).map((achievement: any, i: number) => (
              <div
                key={i}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-accent/20 to-primary/20 border border-accent/30"
              >
                <div className="text-lg">{achievement.icon}</div>
                <div>
                  <p className="text-sm font-medium">{achievement.title}</p>
                  <p className="text-xs text-foreground/60">{achievement.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Enhanced Progress Bar with Chart */}
      <div className="mb-8 p-6 rounded-xl bg-card border border-border animate-slideInLeft">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Program Progress</h2>
          <span className="text-2xl font-bold text-primary">{completionPercentage}%</span>
        </div>
        <div className="w-full h-4 bg-border rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-gradient-to-r from-primary via-secondary to-accent transition-all duration-500 relative"
            style={{ width: `${completionPercentage}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
          </div>
        </div>
        
        {/* Mini Progress Chart */}
        {performanceMetrics?.weeklyProgress && (
          <div className="mt-4">
            <p className="text-sm text-foreground/60 mb-2">Weekly Progress Trend</p>
            <div className="flex items-end gap-1 h-16">
              {performanceMetrics.weeklyProgress.slice(-8).map((week: any, i: number) => (
                <div
                  key={i}
                  className="flex-1 bg-gradient-to-t from-primary/30 to-primary rounded-t"
                  style={{ height: `${week.progress}%` }}
                  title={`Week ${week.week}: ${week.progress}%`}
                />
              ))}
            </div>
          </div>
        )}
        
        <p className="text-sm text-foreground/60 mt-3">Complete all {dashboardData.student.weekCount} weeks to earn your certificate!</p>
      </div>

      {/* Conditional Content Based on View Mode */}
      {viewMode === 'overview' ? (
        <div className="animate-slideInLeft">
          <h2 className="text-xl font-bold mb-4">Week Progression</h2>
          <div className="grid gap-3">
            {dashboardData.weeks.map((week: any, i: number) => (
              <Link
                key={week.week}
                href={week.locked ? "#" : `/student/weeks/${week.id || week.week}`}
                className={`p-4 rounded-xl border transition-all transform hover:scale-102 ${
                  week.locked
                    ? "bg-card/50 border-border/50 cursor-not-allowed opacity-60"
                    : "bg-card border-border hover:border-primary/50 cursor-pointer"
                } animate-fadeInScale`}
                style={{ animationDelay: `${(i + 4) * 80}ms` }}
                onClick={(e) => week.locked && e.preventDefault()}
              >
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    {week.locked ? (
                      <Lock className="w-5 h-5 text-foreground/40" />
                    ) : week.status === "Approved" ? (
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                    ) : (
                      <Clock className="w-5 h-5 text-yellow-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">
                      Week {week.week}: {week.title}
                    </h3>
                    <p className="text-sm text-foreground/60">Assignment status: {week.status}</p>
                  </div>
                  <span
                    className={`text-xs px-3 py-1 rounded-full ${
                      week.locked
                        ? "bg-border/50 text-foreground/50"
                        : week.status === "Approved"
                          ? "bg-primary/20 text-primary"
                          : week.status === "Pending Submission"
                            ? "bg-accent/20 text-accent"
                            : "bg-secondary/20 text-secondary"
                    }`}
                  >
                    {week.locked ? "Locked" : week.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        /* Timeline View */
        <div className="animate-slideInRight">
          <h2 className="text-xl font-bold mb-4">Learning Timeline</h2>
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-secondary to-accent"></div>
            
            <div className="space-y-6">
              {dashboardData.weeks.map((week: any, i: number) => (
                <div key={week.week} className="relative flex items-start gap-6">
                  {/* Timeline Node */}
                  <div className={`relative z-10 w-16 h-16 rounded-full border-4 flex items-center justify-center ${
                    week.status === 'Approved' 
                      ? 'bg-primary border-primary/30' 
                      : week.status === 'Pending Review'
                        ? 'bg-secondary border-secondary/30'
                        : week.locked
                          ? 'bg-muted border-muted-foreground/30'
                          : 'bg-accent border-accent/30'
                  }`}>
                    {week.locked ? (
                      <Lock className="w-6 h-6 text-muted-foreground" />
                    ) : week.status === "Approved" ? (
                      <CheckCircle2 className="w-6 h-6 text-white" />
                    ) : (
                      <span className="text-white font-bold">{week.week}</span>
                    )}
                  </div>
                  
                  {/* Timeline Content */}
                  <div className="flex-1 pb-6">
                    <Link
                      href={week.locked ? "#" : `/student/weeks/${week.id || week.week}`}
                      className={`block p-4 rounded-xl border transition-all ${
                        week.locked
                          ? "bg-card/50 border-border/50 cursor-not-allowed opacity-60"
                          : "bg-card border-border hover:border-primary/50 cursor-pointer hover:shadow-lg"
                      }`}
                      onClick={(e) => week.locked && e.preventDefault()}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-lg">Week {week.week}: {week.title}</h3>
                        <span className={`text-xs px-3 py-1 rounded-full ${
                          week.locked
                            ? "bg-border/50 text-foreground/50"
                            : week.status === "Approved"
                              ? "bg-primary/20 text-primary"
                              : week.status === "Pending Submission"
                                ? "bg-accent/20 text-accent"
                                : "bg-secondary/20 text-secondary"
                        }`}>
                          {week.locked ? "Locked" : week.status}
                        </span>
                      </div>
                      <p className="text-sm text-foreground/60">
                        {week.status === 'Approved' 
                          ? 'Completed successfully! Great work!' 
                          : week.status === 'Pending Review'
                            ? 'Submitted and waiting for review'
                            : week.locked
                              ? 'Complete previous weeks to unlock'
                              : 'Ready to start - click to view tasks'
                        }
                      </p>
                      {week.status === 'Approved' && (
                        <div className="mt-2 text-xs text-primary">
                          ✨ Earned achievement points
                        </div>
                      )}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
