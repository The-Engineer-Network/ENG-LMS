"use client"

import React, { useState, useEffect } from 'react'
import { CheckCircle, Clock, AlertCircle, BookOpen, Users, Calendar, Trophy } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface EnrollmentData {
  id: string
  track_name: string
  cohort_name: string
  status: string
  progress_percentage: number
  tasks_completed: number
  total_tasks: number
  enrolled_at: string
  week_progress: {
    week_number: number
    week_title: string
    status: string
    completed_at?: string
  }[]
}

interface EnrollmentStatusProps {
  userId: string
}

export default function EnrollmentStatus({ userId }: EnrollmentStatusProps) {
  const [enrollment, setEnrollment] = useState<EnrollmentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchEnrollmentData()
  }, [userId])

  const fetchEnrollmentData = async () => {
    try {
      setLoading(true)
      
      // Fetch enrollment data
      const { data: enrollmentData, error: enrollmentError } = await supabase
        .from('student_enrollments')
        .select(`
          id,
          status,
          progress_percentage,
          tasks_completed,
          total_tasks,
          enrolled_at,
          track:tracks(name),
          cohort:cohorts(name)
        `)
        .eq('user_id', userId)
        .single()

      if (enrollmentError) {
        if (enrollmentError.code === 'PGRST116') {
          setError('No enrollment found. Please contact support.')
        } else {
          throw enrollmentError
        }
        return
      }

      // Fetch week progress
      const { data: progressData, error: progressError } = await supabase
        .from('week_progress')
        .select(`
          week:weeks(week_number, title),
          status,
          completed_at
        `)
        .eq('student_id', userId)
        .order('week(week_number)')

      if (progressError) {
        console.warn('Could not fetch week progress:', progressError)
      }

      // Combine data
      const combinedData: EnrollmentData = {
        id: enrollmentData.id,
        track_name: enrollmentData.track?.name || 'Unknown Track',
        cohort_name: enrollmentData.cohort?.name || 'Unknown Cohort',
        status: enrollmentData.status,
        progress_percentage: enrollmentData.progress_percentage || 0,
        tasks_completed: enrollmentData.tasks_completed || 0,
        total_tasks: enrollmentData.total_tasks || 0,
        enrolled_at: enrollmentData.enrolled_at,
        week_progress: progressData?.map(p => ({
          week_number: p.week?.week_number || 0,
          week_title: p.week?.title || 'Unknown Week',
          status: p.status,
          completed_at: p.completed_at
        })) || []
      }

      setEnrollment(combinedData)
    } catch (err: any) {
      console.error('Error fetching enrollment data:', err)
      setError(err.message || 'Failed to load enrollment data')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'in_progress':
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />
      case 'locked':
        return <AlertCircle className="w-5 h-5 text-gray-400" />
      default:
        return <Clock className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'in_progress':
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'locked':
        return 'text-gray-600 bg-gray-50 border-gray-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
        <div className="flex items-center gap-3 text-red-600">
          <AlertCircle className="w-5 h-5" />
          <div>
            <h3 className="font-semibold">Enrollment Error</h3>
            <p className="text-sm text-red-500">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!enrollment) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center text-gray-500">
          <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <h3 className="font-semibold mb-1">No Enrollment Found</h3>
          <p className="text-sm">You are not currently enrolled in any track.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Enrollment Overview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Your Enrollment</h2>
            <p className="text-gray-600">Track your learning progress</p>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(enrollment.status)}`}>
            {enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1)}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm text-blue-600 font-medium">Track</p>
              <p className="font-semibold text-blue-900">{enrollment.track_name}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <Users className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-sm text-purple-600 font-medium">Cohort</p>
              <p className="font-semibold text-purple-900">{enrollment.cohort_name}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
            <Trophy className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm text-green-600 font-medium">Progress</p>
              <p className="font-semibold text-green-900">{enrollment.progress_percentage}%</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>Enrolled: {new Date(enrollment.enrolled_at).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>Tasks: {enrollment.tasks_completed}/{enrollment.total_tasks}</span>
          </div>
        </div>
      </div>

      {/* Week Progress */}
      {enrollment.week_progress.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Week Progress</h3>
          <div className="space-y-3">
            {enrollment.week_progress.map((week) => (
              <div
                key={week.week_number}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(week.status)}
                  <div>
                    <p className="font-medium text-gray-900">
                      Week {week.week_number}: {week.week_title}
                    </p>
                    {week.completed_at && (
                      <p className="text-sm text-gray-500">
                        Completed: {new Date(week.completed_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(week.status)}`}>
                  {week.status.charAt(0).toUpperCase() + week.status.slice(1)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Debug Information (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Debug Information</h4>
          <pre className="text-xs text-gray-600 overflow-auto">
            {JSON.stringify(enrollment, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}