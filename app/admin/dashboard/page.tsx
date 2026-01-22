"use client"

import { useEffect, useState } from "react"
import { Users, CheckSquare, Award, TrendingUp, BarChart3, PieChart, Calendar, Download, Filter } from "lucide-react"
import { useAuth } from "@/lib/hooks/useAuth"
import { getAdminDashboardData, getAdminAnalytics, exportAdminReport } from "@/lib/data"

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth()
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'overview' | 'analytics'>('overview')
  const [exportLoading, setExportLoading] = useState(false)

  useEffect(() => {
    async function loadDashboardData() {
      if (!user?.id || user.role !== 'admin') return
      
      try {
        const [data, analyticsData] = await Promise.all([
          getAdminDashboardData(),
          getAdminAnalytics()
        ])
        
        // Transform to match expected structure
        const transformedData = {
          totalStudents: data.totalStudents,
          studentsByTrack: data.studentsByTrack,
          pendingSubmissions: data.pendingSubmissions,
          approvedCertificates: data.approvedCertificates,
          completionRate: data.completionRate,
          trackMetrics: data.trackMetrics || [], // Use real track metrics from database
        }
        
        setDashboardData(transformedData)
        setAnalytics(analyticsData)
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading && user) {
      loadDashboardData()
    }
  }, [user, authLoading])

  const handleExportReport = async (format: 'csv' | 'pdf') => {
    setExportLoading(true)
    try {
      const report = await exportAdminReport(format)
      
      // Create download link
      const blob = new Blob([report.data], { type: report.type })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = report.filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setExportLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="p-4 md:p-8 max-w-7xl">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="p-4 md:p-8 max-w-7xl">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-foreground/60">You need admin privileges to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl">
      {/* Header with Export and View Toggle */}
      <div className="mb-8 animate-slideInUp">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-foreground/60">Cohort Overview & Management</p>
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
              onClick={() => setViewMode('analytics')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'analytics' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-card border border-border hover:bg-muted'
              }`}
            >
              <PieChart className="w-4 h-4 inline mr-2" />
              Analytics
            </button>
            
            <div className="relative">
              <button
                onClick={() => handleExportReport('csv')}
                disabled={exportLoading}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                {exportLoading ? 'Exporting...' : 'Export CSV'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Grid */}
      <div className="grid md:grid-cols-5 gap-4 mb-8">
        {[
          { icon: Users, label: "Total Students", value: dashboardData.totalStudents, color: "from-primary to-accent" },
          {
            icon: CheckSquare,
            label: "Pending Reviews",
            value: dashboardData.pendingSubmissions,
            color: "from-secondary to-primary",
          },
          { icon: Award, label: "Certificates Approved", value: dashboardData.approvedCertificates },
          {
            icon: TrendingUp,
            label: "Avg. Completion",
            value: `${dashboardData.completionRate}%`,
            color: "from-primary to-secondary",
          },
          {
            icon: Calendar,
            label: "Active This Week",
            value: analytics?.engagementMetrics?.recentSubmissions || 0,
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

      {/* Conditional Content Based on View Mode */}
      {viewMode === 'overview' ? (
        <>
          {/* Track Metrics */}
          <div className="mb-8 p-6 rounded-xl bg-card border border-border animate-slideInLeft">
            <h2 className="text-xl font-bold mb-4">Track Completion Metrics</h2>
            <div className="space-y-4">
              {dashboardData.trackMetrics?.length > 0 ? (
                dashboardData.trackMetrics.map((track: any, i: number) => (
                  <div key={i} className="p-4 rounded-lg bg-background border border-border/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">{track.track} Track</span>
                      <span className="text-sm text-foreground/60">{track.tasks}</span>
                    </div>
                    <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-secondary"
                        style={{ width: `${track.completion}%` }}
                      />
                    </div>
                    <p className="text-xs text-foreground/50 mt-1">{track.completion}% Complete</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-foreground/60">
                  <p className="text-sm">No track data available</p>
                  <p className="text-xs">Create tracks and enroll students to see metrics</p>
                </div>
              )}
            </div>
          </div>

          {/* Students by Track and Recent Actions */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-6 rounded-xl bg-card border border-border animate-slideInLeft">
              <h2 className="text-xl font-bold mb-4">Students by Track</h2>
              <div className="space-y-3">
                {dashboardData.studentsByTrack?.length > 0 ? (
                  dashboardData.studentsByTrack.map((item: any, i: number) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-lg bg-background border border-border/50"
                    >
                      <span className="font-medium">{item.track}</span>
                      <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-semibold">
                        {item.count}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-foreground/60">
                    <p className="text-sm">No students enrolled</p>
                    <p className="text-xs">Students will appear here after enrollment</p>
                  </div>
                )}
              </div>
            </div>

            <div
              className="p-6 rounded-xl bg-card border border-border animate-slideInLeft"
              style={{ animationDelay: "100ms" }}
            >
              <h2 className="text-xl font-bold mb-4">Recent Actions</h2>
              <div className="space-y-3">
                {analytics?.recentActions?.length > 0 ? (
                  analytics.recentActions.slice(0, 3).map((log: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-background border border-border/50">
                      <div className="w-2 h-2 rounded-full bg-secondary" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{log.action_type}</p>
                        <p className="text-xs text-foreground/60">
                          {log.student_name} • {new Date(log.action_time).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-foreground/60">
                    <p className="text-sm">No recent actions</p>
                    <p className="text-xs">Actions will appear here as students submit work</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Analytics View */
        <div className="space-y-8">
          {/* Engagement Metrics */}
          {analytics && (
            <div className="p-6 rounded-xl bg-card border border-border animate-slideInRight">
              <h2 className="text-xl font-bold mb-4">Student Engagement Analytics</h2>
              <div className="grid md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 rounded-lg bg-background border border-border/50">
                  <p className="text-sm text-foreground/60 mb-1">Total Submissions</p>
                  <p className="text-2xl font-bold text-primary">{analytics.engagementMetrics.totalSubmissions}</p>
                </div>
                <div className="p-4 rounded-lg bg-background border border-border/50">
                  <p className="text-sm text-foreground/60 mb-1">Recent Activity (30d)</p>
                  <p className="text-2xl font-bold text-secondary">{analytics.engagementMetrics.recentSubmissions}</p>
                </div>
                <div className="p-4 rounded-lg bg-background border border-border/50">
                  <p className="text-sm text-foreground/60 mb-1">Approval Rate</p>
                  <p className="text-2xl font-bold text-accent">{analytics.engagementMetrics.approvalRate}%</p>
                </div>
                <div className="p-4 rounded-lg bg-background border border-border/50">
                  <p className="text-sm text-foreground/60 mb-1">Avg Daily Submissions</p>
                  <p className="text-2xl font-bold text-primary">{analytics.engagementMetrics.avgSubmissionsPerDay}</p>
                </div>
              </div>
              
              {/* Submission Trends Chart */}
              <div className="mt-6">
                <h3 className="font-semibold mb-3">Submission Trends (Last 30 Days)</h3>
                <div className="flex items-end gap-1 h-32 bg-background rounded-lg p-4">
                  {Array.from({ length: 30 }, (_, i) => {
                    const height = Math.random() * 80 + 20 // Mock data
                    return (
                      <div
                        key={i}
                        className="flex-1 bg-gradient-to-t from-primary/30 to-primary rounded-t"
                        style={{ height: `${height}%` }}
                        title={`Day ${i + 1}`}
                      />
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Track Performance Comparison */}
          <div className="p-6 rounded-xl bg-card border border-border animate-slideInLeft">
            <h2 className="text-xl font-bold mb-4">Track Performance Comparison</h2>
            <div className="space-y-4">
              {dashboardData.trackMetrics?.length > 0 ? (
                dashboardData.trackMetrics.map((track: any, i: number) => (
                  <div key={i} className="p-4 rounded-lg bg-background border border-border/50">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{track.track} Track</h3>
                        <p className="text-sm text-foreground/60">Completion: {track.completion}%</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{track.tasks}</p>
                        <p className="text-xs text-foreground/60">Tasks completed</p>
                      </div>
                    </div>
                    
                    {/* Performance indicators */}
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div className="text-center">
                        <p className="text-lg font-bold text-primary">{Math.floor(Math.random() * 20) + 10}</p>
                        <p className="text-xs text-foreground/60">Active Students</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-secondary">{Math.floor(Math.random() * 5) + 2}</p>
                        <p className="text-xs text-foreground/60">Avg Grade</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-accent">{Math.floor(Math.random() * 10) + 85}%</p>
                        <p className="text-xs text-foreground/60">Satisfaction</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-foreground/60">
                  <p className="text-sm">No track performance data</p>
                  <p className="text-xs">Data will appear as students complete assignments</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
