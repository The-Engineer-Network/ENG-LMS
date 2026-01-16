"use client"

import { useState } from "react"
import Link from "next/link"
import { CheckCircle2, Lock, Clock, Play, FileText, MessageSquare } from "lucide-react"

const mockWeeks = [
  {
    id: 1,
    title: "React Fundamentals",
    description: "Learn core React concepts including components, JSX, and hooks",
    status: "completed",
    locked: false,
    lessons: 4,
    assignment: {
      submitted: true,
      approved: true,
      deadline: "2024-02-15"
    }
  },
  {
    id: 2,
    title: "State Management",
    description: "Master state management with Context API and custom hooks",
    status: "completed",
    locked: false,
    lessons: 5,
    assignment: {
      submitted: true,
      approved: true,
      deadline: "2024-02-22"
    }
  },
  {
    id: 3,
    title: "Component Composition",
    description: "Build reusable components and understand composition patterns",
    status: "current",
    locked: false,
    lessons: 6,
    assignment: {
      submitted: false,
      approved: false,
      deadline: "2024-03-01"
    }
  },
  {
    id: 4,
    title: "API Integration",
    description: "Connect to REST APIs and handle async operations",
    status: "locked",
    locked: true,
    lessons: 5,
    assignment: {
      submitted: false,
      approved: false,
      deadline: "2024-03-08"
    }
  },
  {
    id: 5,
    title: "Testing & Performance",
    description: "Write tests and optimize React applications",
    status: "locked",
    locked: true,
    lessons: 4,
    assignment: {
      submitted: false,
      approved: false,
      deadline: "2024-03-15"
    }
  },
  {
    id: 6,
    title: "Deployment & Production",
    description: "Deploy applications and production best practices",
    status: "locked",
    locked: true,
    lessons: 3,
    assignment: {
      submitted: false,
      approved: false,
      deadline: "2024-03-22"
    }
  }
]

export default function WeeksPage() {
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

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6 md:mb-8 animate-slideInUp">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2">Program Weeks</h1>
        <p className="text-foreground/60 text-sm md:text-base">Frontend Development Track - 6 Week Program</p>
      </div>

      {/* Progress Overview */}
      <div className="mb-6 md:mb-8 p-4 md:p-6 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg md:text-xl font-semibold">Overall Progress</h2>
          <span className="text-xl md:text-2xl font-bold text-primary">33%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2 md:h-3">
          <div className="bg-gradient-to-r from-primary to-secondary h-2 md:h-3 rounded-full transition-all duration-500" style={{ width: "33%" }}></div>
        </div>
        <p className="text-xs md:text-sm text-foreground/60 mt-2">2 of 6 weeks completed</p>
      </div>

      {/* Weeks Grid */}
      <div className="space-y-4">
        {mockWeeks.map((week) => (
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
                    <h3 className="text-lg md:text-xl font-semibold">Week {week.id}: {week.title}</h3>
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